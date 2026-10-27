#!/usr/bin/env bash
# merge-check.sh BASE [HEAD]  (Aufgabe 156)
# Findet Funktionen/Variablen, die zwischen BASE und HEAD aus einer JS-Datei verschwunden sind,
# aber an anderer Stelle noch benutzt und nirgends mehr definiert werden (Lehre aus Aufgabe 145:
# zw_cpu_roll und zw_rolls_aria wurden entfernt, Tier-Yatzy brauchte sie weiter).
# Ausgabe: je Fund eine Zeile "FEHLT: name (benutzt in datei:zeile)"; Ende "MERGE-CHECK OK"
# oder Exit-Code 1. Dauer wenige Sekunden. Nach jeder Zusammenfuehrung vor tools/preflight.sh starten.
set -u
BASE="${1:?Aufruf: tools/merge-check.sh BASE [HEAD]}"; TIP="${2:-HEAD}"
cd "$(git rev-parse --show-toplevel)"
bad=0
# 1. Funktionen und Variablen
names=$(git diff -U0 "$BASE" "$TIP" -- '*.js' ':!lang' | grep -E '^-' | grep -vE '^---' |
  sed -nE 's/^-[[:space:]]*(async[[:space:]]+)?function[[:space:]]+([A-Za-z_$][A-Za-z0-9_$]*)[[:space:]]*\(.*/\2/p;
           s/^-[[:space:]]*(const|let|var)[[:space:]]+([A-Za-z_$][A-Za-z0-9_$]*)[[:space:]]*=.*/\2/p' | sort -u)
for n in $names; do
  [ ${#n} -lt 4 ] && continue
  git grep -qE "(function[[:space:]]+$n[[:space:]]*\(|(const|let|var)[[:space:]]+$n[[:space:]]*=|\\b$n[[:space:]]*[:=][[:space:]]*(async[[:space:]]*)?(function|\())" "$TIP" -- '*.js' '*.html' 2>/dev/null && continue
  use=$(git grep -nwE "$n[[:space:]]*\(" "$TIP" -- '*.js' '*.html' ':!lang' 2>/dev/null | head -1)
  [ -n "$use" ] && { echo "FEHLT Funktion: $n (benutzt in ${use#*:})"; bad=1; }
done
# 2. Uebersetzungsschluessel (lang/*.js): entfernt, in i18n.js/lang/en.js nicht mehr da, aber noch benutzt
keys=$(git diff -U0 "$BASE" "$TIP" -- 'lang/*.js' | grep -E '^-' | grep -vE '^---' |
  sed -nE 's/^-[[:space:]]*"?([A-Za-z0-9_]+)"?[[:space:]]*:[[:space:]]*["`'"'"'].*/\1/p' | sort -u)
for k in $keys; do
  [ ${#k} -lt 4 ] && continue
  git grep -qE "^[[:space:]]*\"?$k\"?[[:space:]]*:" "$TIP" -- i18n.js lang/en.js 2>/dev/null && continue
  use=$(git grep -nw "$k" "$TIP" -- '*.js' '*.html' ':!lang' ':!i18n.js' 2>/dev/null | head -1)
  [ -n "$use" ] && { echo "FEHLT Schluessel: $k (benutzt in ${use#*:})"; bad=1; }
done
[ $bad = 0 ] && echo "MERGE-CHECK OK" || { echo "MERGE-CHECK GESCHEITERT"; exit 1; }
