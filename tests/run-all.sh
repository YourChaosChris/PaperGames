#!/usr/bin/env bash
# run-all.sh
# Starts a throwaway local server for the repo, runs every check in
# tests/, and tears the server down again - the same sequence that's
# been run by hand from a scratch script before every PR in this
# project's history. See tests/README.md for prerequisites.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8000}"
export BASE_URL="http://localhost:${PORT}/"

cd "$ROOT"
python3 -m http.server "$PORT" > /tmp/papergames-test-server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT

# Give the server a moment to bind before hitting it.
for i in $(seq 1 20); do
  curl -sf -o /dev/null "http://localhost:${PORT}/index.html" && break
  sleep 0.5
done

status=0

echo "=== static-checks.js ==="
node "$ROOT/tests/static-checks.js" || status=1
echo ""

echo "=== i18n-messages.js ==="
node "$ROOT/tests/i18n-messages.js" || status=1
echo ""

echo "=== css-check.js ==="
node "$ROOT/tests/css-check.js" || status=1
echo ""

echo "=== board-sweep.js ==="
node "$ROOT/tests/board-sweep.js" || status=1
echo ""

echo "=== interaction-sweep.js ==="
node "$ROOT/tests/interaction-sweep.js" || status=1
echo ""

if [ "$status" -eq 0 ]; then
  echo "ALL CHECKS PASS"
else
  echo "SOME CHECKS FAILED - see above"
fi
exit "$status"
