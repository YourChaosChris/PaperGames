#!/usr/bin/env bash
# run-all.sh
# Runs every check listed in tests/test-list.txt. The checks are spread over
# SHARDS parallel parts; each part has its own port (PORT + i) and its own
# throwaway `python3 -m http.server`. The output of all parts is merged back
# into one log in the order of the list. See tests/README.md.
#
#   PORT=8010 bash tests/run-all.sh          # SHARDS chosen automatically
#   SHARDS=1 PORT=8010 bash tests/run-all.sh # everything one after another
#   bash tests/run-all.sh --plan             # print the split, run nothing
#
# Works with bash 3.2 (macOS) and Linux: no wait -n, no mapfile, no
# associative arrays, no setsid, no ss, no GNU-only options.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8000}"
LIST="$ROOT/tests/test-list.txt"
cd "$ROOT"

# ---- number of parts -------------------------------------------------------
cores() {
  local n
  # The test service on the Mac has no /usr/sbin in PATH, so sysctl is tried
  # by absolute path too; getconf (in /usr/bin) works on both systems.
  n="$(nproc 2>/dev/null || getconf _NPROCESSORS_ONLN 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || /usr/sbin/sysctl -n hw.ncpu 2>/dev/null || echo 1)"
  case "$n" in ''|*[!0-9]*) n=1 ;; esac
  echo "$n"
}
# Free memory in MB, empty when it cannot be found out.
free_mb() {
  if [ -r /proc/meminfo ]; then
    awk '/^MemAvailable:/ { print int($2 / 1024) }' /proc/meminfo
  elif command -v vm_stat >/dev/null 2>&1; then
    vm_stat 2>/dev/null | awk '
      /page size of/ { for (i = 1; i <= NF; i++) if ($i ~ /^[0-9]+$/) ps = $i }
      /^Pages free:/ { f += $3 }
      /^Pages inactive:/ { f += $3 }
      /^Pages speculative:/ { f += $3 }
      END { if (ps > 0) print int(f * ps / 1048576) }'
  fi
}
choose_shards() {
  local n c m
  if [ -n "${SHARDS:-}" ]; then
    n="$SHARDS"
  else
    c="$(cores)"
    n=$((c / 2))
    [ "$n" -gt 6 ] && n=6
    m="$(free_mb)"
    case "$m" in ''|*[!0-9]*) ;; *) [ $((m / 2048)) -lt "$n" ] && n=$((m / 2048)) ;; esac
  fi
  case "$n" in ''|*[!0-9]*) n=1 ;; esac
  [ "$n" -lt 1 ] && n=1
  echo "$n"
}

# ---- list and split --------------------------------------------------------
# Lines: "idx weight file args..." (comments and empty lines dropped).
numbered_list() {
  grep -v '^[[:space:]]*#' "$LIST" | grep -v '^[[:space:]]*$' | awk '{ print NR, $0 }'
}
# "idx shard" per test; greedy: heaviest first onto the emptiest part, so
# heavy tests land in different parts.
plan() {
  numbered_list | awk -v n="$1" '
    { idx[NR] = $1; w[NR] = $2 + 0; total = NR }
    END {
      for (i = 1; i <= total; i++) used[i] = 0
      for (s = 1; s <= n; s++) load[s] = 0
      for (i = 1; i <= total; i++) order[i] = i
      for (i = 2; i <= total; i++) {          # sort by weight, descending
        v = order[i]; j = i - 1
        while (j >= 1 && w[order[j]] < w[v]) { order[j + 1] = order[j]; j-- }
        order[j + 1] = v
      }
      for (k = 1; k <= total; k++) {
        t = order[k]; best = 1
        for (s = 2; s <= n; s++) if (load[s] < load[best]) best = s
        load[best] += w[t]; print idx[t], best
      }
    }' | sort -n
}

SHARDS="$(choose_shards)"
TOTAL="$(numbered_list | wc -l | tr -d ' ')"

if [ "${1:-}" = "--plan" ]; then
  echo "SHARDS $SHARDS"
  plan "$SHARDS" | awk '{ print "TEST " $1 " " $2 }'
  exit 0
fi

# ---- helpers ---------------------------------------------------------------
WORK="$(mktemp -d "${TMPDIR:-/tmp}/papergames-tests.XXXXXX")"
SERVER_PIDS=""
cleanup() {
  local p
  for p in $SERVER_PIDS; do kill "$p" 2>/dev/null; done
  [ -n "${KEEP_WORK:-}" ] || rm -rf "$WORK"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

port_busy() { curl -s -o /dev/null --max-time 2 "http://localhost:$1/"; }

# Fixed ports of the tests that start their own server: one per test and part.
export OFFLINE_TEST_PORT="${OFFLINE_TEST_PORT:-$((PORT + 21))}"
export OFFLINE_UPDATE_PORT="${OFFLINE_UPDATE_PORT:-$((PORT + 22))}"
export BANNER_TEST_PORT="${BANNER_TEST_PORT:-$((PORT + 23))}"

# Does one part: its own server, then its tests in list order.
run_shard() {
  local s="$1" port=$((PORT + $1 - 1)) srv i line name args t0 rc
  python3 -m http.server "$port" > "$WORK/server-$s.log" 2>&1 &
  srv=$!
  for i in $(seq 1 40); do
    curl -sf -o /dev/null "http://localhost:${port}/index.html" && break
    sleep 0.5
  done
  export BASE_URL="http://localhost:${port}/"
  while read -r i; do
    line="$(numbered_list | awk -v n="$i" '$1 == n')"
    name="$(echo "$line" | awk '{ print $3 }')"
    args="$(echo "$line" | awk '{ $1 = ""; $2 = ""; $3 = ""; sub(/^ +/, ""); print }')"
    t0="$(date +%s)"
    {
      echo "=== $name ==="
      # shellcheck disable=SC2086
      node "$ROOT/tests/$name" $args
    } > "$WORK/out-$i" 2>&1
    rc=$?
    echo "$rc" > "$WORK/rc-$i"
    echo "$(( $(date +%s) - t0 ))" > "$WORK/sec-$i"
  done < "$WORK/shard-$s"
  kill "$srv" 2>/dev/null
}

# ---- start -----------------------------------------------------------------
s=1
while [ "$s" -le "$SHARDS" ]; do
  if port_busy $((PORT + s - 1)); then
    echo "PORT $((PORT + s - 1)) ist belegt - Abbruch." >&2
    echo "SOME CHECKS FAILED - see above"
    exit 1
  fi
  s=$((s + 1))
done
plan "$SHARDS" | while read -r i s; do echo "$i" >> "$WORK/shard-$s"; done
s=1
while [ "$s" -le "$SHARDS" ]; do touch "$WORK/shard-$s"; s=$((s + 1)); done

echo "Testreihe: $TOTAL Tests in $SHARDS Teil(en), Ports $PORT bis $((PORT + SHARDS - 1))"
START="$(date +%s)"
PIDS=""
s=1
while [ "$s" -le "$SHARDS" ]; do
  run_shard "$s" &
  PIDS="$PIDS $!"
  s=$((s + 1))
done
for p in $PIDS; do wait "$p"; done

# ---- merge -----------------------------------------------------------------
status=0
i=1
while [ "$i" -le "$TOTAL" ]; do
  if [ -f "$WORK/out-$i" ]; then
    cat "$WORK/out-$i"
    rc="$(cat "$WORK/rc-$i" 2>/dev/null || echo 1)"
    [ "$rc" = "0" ] || { status=1; echo "FEHLER: Test endete mit Code $rc"; }
    echo "(Dauer: $(cat "$WORK/sec-$i" 2>/dev/null || echo ?) s)"
  else
    status=1
    echo "=== Test $i ==="
    echo "FEHLER: Test wurde nicht ausgefuehrt"
  fi
  echo ""
  i=$((i + 1))
done
echo "Gesamtdauer: $(( $(date +%s) - START )) s in $SHARDS Teil(en)"

if [ "$status" -eq 0 ]; then
  echo "ALL CHECKS PASS"
else
  echo "SOME CHECKS FAILED - see above"
fi
exit "$status"
