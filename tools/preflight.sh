#!/usr/bin/env bash
# tools/preflight.sh - schneller Vorab-Check (ca. 1 Minute) VOR der langen Testreihe.
# Faengt Zusammenfuehrungsfehler ab: Syntaxfehler, doppelte Listen, Seitenfehler,
# veraltete Hashes. Bricht beim ersten Fehler ab. Aufruf: bash tools/preflight.sh
set -e
cd "$(dirname "$0")/.."
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
PORT="${PREFLIGHT_PORT:-8049}"
echo "1/6 Syntax aller JS-Dateien"
for f in *.js lang/*.js tools/*.js tests/*.js; do node --check "$f" >/dev/null || { echo "SYNTAXFEHLER: $f"; exit 1; }; done
echo "2/6 Merge-Reste (Konfliktmarken, doppelte Listen)"
if grep -lE '^(<<<<<<<|>>>>>>>) ' *.js *.html lang/*.js 2>/dev/null; then echo "KONFLIKTMARKEN"; exit 1; fi
for pat in "const GAMES = \[" "const GAME_FAMILIES" "GAME_COUNT ="; do
  n=$(grep -c "$pat" game-stats.js games-catalog.js i18n.js 2>/dev/null | awk -F: '{s+=$2} END{print s}')
  [ "$n" -le 1 ] || { echo "DOPPELT: $pat ($n mal)"; exit 1; }
done
echo "3/6 Seiten, sw-Hashes, statische Pruefungen"
node tools/seo.js >/dev/null; node tools/sw-hashes.js >/dev/null
node tests/static-checks.js | tail -1
echo "4/6 Uebersetzungen"
node tests/i18n-messages.js | tail -1
echo "5/6 Seitenfehler auf 12 Stichproben-Seiten"
for q in $(ps aux | grep "[h]ttp.server $PORT" | awk '{print $2}'); do kill "$q" 2>/dev/null || true; done
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!; trap 'kill $SRV 2>/dev/null' EXIT; sleep 1
PORT=$PORT node -e '
const {chromium}=require("playwright");
(async()=>{const b=await chromium.launch({executablePath:require("fs").existsSync("/opt/pw-browsers/chromium")?"/opt/pw-browsers/chromium":undefined});const p=await b.newPage();let bad=0;
p.on("pageerror",e=>{bad++;console.log("SEITENFEHLER",p.url(),e.message)});
for(const u of ["index","games","chess","domino","bingo","klappenkasten","sternjagd","patternrow","shadowmatch","oddone","arrows","catplaces"]){await p.goto("http://localhost:"+process.env.PORT+"/"+u+".html",{waitUntil:"networkidle"});await p.waitForTimeout(300);}
await b.close();process.exit(bad?1:0)})()'
echo "6/6 Ports fuer die Testreihe frei? (8010 bis 8015)"
for p in 8010 8011 8012 8013 8014 8015; do curl -sf -o /dev/null "http://localhost:$p/" && { echo "PORT $p belegt"; exit 1; } || true; done
echo "PREFLIGHT OK"
