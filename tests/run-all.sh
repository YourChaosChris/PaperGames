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
echo "=== ui-names.js ==="
node "$ROOT/tests/ui-names.js" || status=1
echo ""
echo "=== ui-status.js ==="
node "$ROOT/tests/ui-status.js" || status=1
echo ""
echo "=== undo.js ==="
node "$ROOT/tests/undo.js" || status=1
echo ""
echo "=== game-frame.js ==="
node "$ROOT/tests/game-frame.js" || status=1
echo ""
echo "=== search-keywords.js ==="
node "$ROOT/tests/search-keywords.js" || status=1
echo ""

echo "=== cake-core.js ==="
node "$ROOT/tests/cake-core.js" || status=1
echo ""

echo "=== animalsudoku-core.js ==="
node "$ROOT/tests/animalsudoku-core.js" || status=1
echo ""

echo "=== shapesort-core.js ==="
node "$ROOT/tests/shapesort-core.js" || status=1
echo ""

echo "=== linkpairs-core.js ==="
node "$ROOT/tests/linkpairs-core.js" || status=1
echo ""

echo "=== oldmaid-core.js ==="
node "$ROOT/tests/oldmaid-core.js" || status=1
echo ""

echo "=== war-core.js ==="
node "$ROOT/tests/war-core.js" || status=1
echo ""

echo "=== snakesladders-core.js ==="
node "$ROOT/tests/snakesladders-core.js" || status=1
echo ""

echo "=== blockers-core.js ==="
node "$ROOT/tests/blockers-core.js" || status=1
echo ""

echo "=== blackjack-core.js ==="
node "$ROOT/tests/blackjack-core.js" || status=1
echo ""

echo "=== poker-core.js ==="
node "$ROOT/tests/poker-core.js" || status=1
echo ""

echo "=== skat-core.js ==="
node "$ROOT/tests/skat-core.js" || status=1
echo ""

echo "=== schafkopf-core.js ==="
node "$ROOT/tests/schafkopf-core.js" || status=1
echo "=== canasta-core.js ==="
node "$ROOT/tests/canasta-core.js" || status=1
echo "=== bridge-core.js ==="
node "$ROOT/tests/bridge-core.js" || status=1
echo "=== tenpairs-core.js ==="
node "$ROOT/tests/tenpairs-core.js" || status=1
echo "=== domino-core.js ==="
node "$ROOT/tests/domino-core.js" || status=1
echo "=== mathcross-core.js ==="
node "$ROOT/tests/mathcross-core.js" || status=1
echo "=== differences-core.js ==="
node "$ROOT/tests/differences-core.js" || status=1
echo "=== pentomino-core.js ==="
node "$ROOT/tests/pentomino-core.js" || status=1
echo "=== arrows-core.js ==="
node "$ROOT/tests/arrows-core.js" || status=1
echo "=== rings-core.js ==="
node "$ROOT/tests/rings-core.js" || status=1
echo "=== tangram-core.js ==="
node "$ROOT/tests/tangram-core.js" || status=1
echo "=== catplaces-core.js ==="
node "$ROOT/tests/catplaces-core.js" || status=1
echo "=== loosen-core.js ==="
node "$ROOT/tests/loosen-core.js" || status=1
echo "=== matches-core.js ==="
node "$ROOT/tests/matches-core.js" || status=1
echo "=== cardduel-core.js ==="
node "$ROOT/tests/cardduel-core.js" || status=1
echo "=== villains-core.js ==="
node "$ROOT/tests/villains-core.js" || status=1
echo "=== forestvillage-core.js ==="
node "$ROOT/tests/forestvillage-core.js" || status=1
echo "=== adventurebook-core.js ==="
node "$ROOT/tests/adventurebook-core.js" || status=1
echo "=== new-games-order.js ==="
node "$ROOT/tests/new-games-order.js" || status=1
echo "=== kids-games.js ==="
node "$ROOT/tests/kids-games.js" || status=1
echo "=== move-hints.js ==="
node "$ROOT/tests/move-hints.js" || status=1
echo "=== game-families.js ==="
node "$ROOT/tests/game-families.js" || status=1
echo "=== home-categories.js ==="
node "$ROOT/tests/home-categories.js" || status=1
echo ""

echo "=== offline-install.js ==="
node "$ROOT/tests/offline-install.js" || status=1
echo ""

echo "=== update-banner.js ==="
node "$ROOT/tests/update-banner.js" || status=1
echo ""

echo "=== css-check.js ==="
node "$ROOT/tests/css-check.js" || status=1
echo ""

echo "=== rtl-spacing.js ==="
node "$ROOT/tests/rtl-spacing.js" || status=1
echo ""

echo "=== direct-start.js ==="
node "$ROOT/tests/direct-start.js" || status=1
echo ""

echo "=== board-fit.js ==="
node "$ROOT/tests/board-fit.js" --min 80 || status=1
echo ""

echo "=== tap-targets.js ==="
node "$ROOT/tests/tap-targets.js" || status=1
echo ""

echo "=== cell-size.js ==="
node "$ROOT/tests/cell-size.js" || status=1
echo ""

echo "=== board-sweep.js ==="
node "$ROOT/tests/board-sweep.js" || status=1
echo ""

echo "=== interaction-sweep.js ==="
node "$ROOT/tests/interaction-sweep.js" || status=1
echo ""

echo "=== i18n-runtime-sweep.js ==="
node "$ROOT/tests/i18n-runtime-sweep.js" || status=1
echo ""

if [ "$status" -eq 0 ]; then
  echo "ALL CHECKS PASS"
else
  echo "SOME CHECKS FAILED - see above"
fi
exit "$status"
