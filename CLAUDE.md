# CLAUDE.md - PaperGames

Notizen für Claude Code. Dauerhafte Regeln von Christopher und der Stand
der Arbeit. Der Ablauf der Aufgaben steht ausführlich in der README des
Aufgaben-Repositorys; hier nur, was dort fehlt.

## Repositorys

- Code: `YourChaosChris/PaperGames`, lokal z. B. `/home/user/papergames`.
  Lokal auf einem eigenen Zweig arbeiten, hochladen mit
  `git push origin HEAD:main`.
- Aufgaben: `YourChaosChris/PaperGames-Aufgaben`, lokal z. B.
  `/home/user/papergames-aufgaben`. Ordner `offen/`, `erledigt/`.
  **Die README dort zuerst ganz lesen**: Ablauf beim Wort „Aufgaben“,
  Berichtsvorgabe, Tempo-Regel, Regeln für Claude Code, `RECHTSCHECK.md`.

## Das Wort „Aufgaben“

1. `git pull` im Aufgaben-Repository und `git pull origin main` im
   Code-Repository.
2. Alles in `offen/` nach Dateinamen abarbeiten, jede Datei ganz lesen.
3. Ist `offen/` leer: noch einmal pullen und mit neuen Aufgaben
   weitermachen. Erst dann aufhören.
4. Am Ende eine kurze Liste: erledigte Aufgaben mit Commit.

## Dauerhafte Regeln (Christopher)

- „Prüfen, bevor es hochgeladen wird.“ Und: „Wenn dir Fehler auffallen,
  dann behebe sie.“ Gefundene Fehler kommen in den Bericht.
- Hochladen nur, wenn die ganze Testreihe durchläuft:
  `PORT=8010 NODE_PATH=/opt/node22/lib/node_modules bash tests/run-all.sh > log 2>&1`
  und dann `tail -n 1 log | grep -qx "ALL CHECKS PASS"`. Sie dauert
  etwa 25 Minuten und läuft genau einmal am Ende, als Hintergrundbefehl.
  Vorher einen eigenen Server auf demselben Port beenden, denn
  `run-all.sh` startet seinen eigenen.
- Während der Arbeit nur die betroffenen Tests laufen lassen, zum
  Beispiel `node tests/<spiel>-core.js`. Simulationen höchstens 100
  Durchläufe; die verlangte volle Zahl einmal am Ende (Tempo-Regel).
- Git:
  - `git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit ...`;
  - am Ende der Commit-Nachricht die Attributionszeilen aus dem
    System-Hinweis der Sitzung;
  - nie eine Modell-ID in Commits, Code oder Berichten.
- Inhalte:
  - keine Marken und nichts von der Liste in `RECHTSCHECK.md` (zum
    Beispiel Cluedo, Murdoku, Meowdoku);
  - kein Mord, keine Entführung, keine Gewalt;
  - Namen und Fakten mit WebSearch prüfen, eigene Namen gegen
    Spiele mit gleichem Namen.
- Technik:
  - keine Animationen, keine Töne, kein Zeitdruck (E-Ink);
  - schwarz-weiß, keine Grauflächen;
  - kein waagerechtes Scrollen bei 600 px und 360 px;
  - gespeicherte Spielstände bleiben gültig.
- Bildschirmfotos nur ansehen, nie einchecken. Im Bericht in zwei bis
  drei Sätzen beschreiben.

## Aufgabe erledigt melden

1. Oben in der Aufgabendatei zwei Zeilen:
   `Status: erledigt` und `Erledigt am: JJJJ-MM-TT, Commit: <kurzer Hash>`.
2. Unten den Bericht anhängen.
3. `git mv offen/<Datei> erledigt/<Datei>`.
4. Commit `Aufgabe erledigt: <Datei>`, Push nach `main`.

Vorgaben für den Bericht:

- Deutsch, den Leser mit „du“ ansprechen.
- Überschrift `## Bericht`, darunter `Beginn: … Uhr · Ende: … Uhr`
  (deutsche Zeit, `TZ=Europe/Berlin date +%H:%M`).
- Abschnitte `### 1. Pruefwerte`, `### 2. Geaenderte Dateien`,
  `### 3. CACHE_NAME`, `### 4. Eigene Entscheidungen`,
  `### 5. Widersprueche`, `### 6. Sonstiges`.
- In 1. steht `(N Testabschnitte, keine Fehler)`, N aus
  `grep -c "^=== " log`. Dazu die Ausgabezeilen der Tests mit den
  verlangten Zahlen.

## Arbeitsweise im Code

- Texte in 12 Sprachen (en de fr es it nl pl uk ru ja zh ar):
  - Oberfläche: `i18n.js` und die elf `lang/xx.js`;
  - Regeln und Geschichte: je Spiel und Sprache eine Datei
    `text/<lang>/<slug>.js` (Schlüssel, die nur `<slug>-rules.html` und
    `<slug>-history.html` benutzen; die Seiten tragen
    `<html data-i18n-text="<slug>">`);
  - Styles: `base.css` (gemeinsam) und `css/<slug>.css` (nur Regeln dieses
    Spiels, nach `base.css` geladen); `node tests/split-check.js` prüft die
    Aufteilung;
  - Offline: `APP_SHELL` in `sw.js` hat die englischen Regeltexte
    (`text/en/*`); die Regeltexte der anderen Sprachen holt der Service
    Worker nur für die benutzte Sprache nach (`TEXT_LAZY`, Prüfsummen in
    `FILE_HASHES`, `tools/sw-hashes.js` schreibt sie). Ohne Netz zeigt die
    Seite die englischen Regeln mit Hinweis (`text_fallback_note`);
  - neue Schlüssel jeweils hinter einem vorhandenen Nachbarschlüssel
    einfügen.
  - `msg_*`-Schlüssel übersetzen englische Laufzeitsätze. Wer den
    englischen Satz ändert, ändert auch den Wert in `i18n.js` und die
    Probe in `tests/i18n-messages.js`.
  - `msg_t_*` sind Vorlagen: `{n}`, `{m}`, `{k}` stehen für Ziffern,
    `{s}`, `{r}` für beliebigen Text.
- Reihenfolge vor dem Push:
  1. `node tools/seo.js`;
  2. `CACHE_NAME` in `sw.js` hochzählen und `node tools/sw-hashes.js`;
  3. neuer Eintrag oben in `release-notes.js` mit Schlüssel
     `release_vNNN` in 12 Sprachen;
  4. `node tests/static-checks.js` und `node tests/i18n-messages.js`;
  5. die ganze Testreihe.
- Neues Spiel einbinden:
  - Katalog: `games-catalog.js` (`added: "JJJJ-MM-TTTHH:MM"`,
    gegebenenfalls `family`); eine neue Familie gehört in
    `GAME_FAMILIES` mit `family_<id>` in 12 Sprachen;
  - Anbindung: `game-switcher.js`, `game-stats.js`, `stats-app.js`,
    `history.html` (Zeitleiste), `APP_SHELL` in `sw.js`;
  - Tests: `tests/run-all.sh`, `tests/README.md`,
    `tests/new-games-order.js` (fest erwartete neueste Spiele
    anpassen), Proben in `tests/i18n-messages.js`;
  - `README.md`: Spielezahl.
- Playwright: Chromium unter `/opt/pw-browsers`, Module über
  `NODE_PATH=/opt/node22/lib/node_modules`. Nie `playwright install`.
- Fallen:
  - `pgrep -f` findet sich selbst, Warteschleifen damit enden nie;
  - Prozesse über `ps aux | grep … | awk '{print $2}' | xargs kill`
    beenden;
  - `ss` gibt es nicht, den Server mit `curl` prüfen;
  - Hilfsskripte im Scratchpad gehen mit der Sitzung verloren.

## Stand (17.10.2026)

- `CACHE_NAME` `papergames-cache-v252`, 103 Spiele.
- Aufgaben bis 99s erledigt, `offen/` leer.
- Zuletzt gebaut:
  - 99s: gemeinsames „Wie geht das?“ (`howto.js`, 5 Spiele), gemeinsamer Statustext (`ui-status.js` statt 45 Kopien), Kuchenbrett mit Raumzahlen und Legende, Zoowurf-Stufe Anfänger;
  - 99p: Vorschaubild ohne Spielezahl (`og-image.png?v=251`);
  - 99q: Zoowurf (Kinder-Würfelspiel, `zoowurf-core.js`);
  - 99r: Spielprüfung aller Spiele; Weidefreunde mit Bilderklärung,
    Zielzeilen, Kleeberg-Brett, Schwimmen-Status; keins entfernt.
- Offen bemerkt, nicht beauftragt:
  - eine „neu“-Markierung auf Spielkarten gibt es nicht
    (`msg_aria_card_new` ist ungenutzt);
  - Vorschläge siehe `vorschlaege/2026-10-17.md` und
    `vorschlaege/2026-10-17_99r_Spielqualitaet.md` im Aufgaben-Repository.

## Sicherungen (Prozess, damit Christopher nicht nachfragen muss)

Gilt für jede Sitzung, auch für die geplanten Läufe. Ziel: Fehler früh finden, nicht erst nach der langen Testreihe. (Von Christopher am 17.10.2026 freigegeben.)

1. Nach jeder Zusammenführung mehrerer Zweige zuerst `bash tools/preflight.sh` (etwa 1 Minute: Syntax aller JS-Dateien, Konfliktmarken, doppelte Listen, Seitenfehler auf 12 Seiten, Hashes, statische Prüfungen, Übersetzungen). Erst bei „PREFLIGHT OK“ die Testreihe starten.
2. Nach JEDER Änderung an einer Datei, die in `sw.js` gelistet ist, `node tools/sw-hashes.js` erneut ausführen, auch bei einer Ein-Zeichen-Korrektur.
3. Geteilte Testreihe auf einem Rechner: jede Hälfte mit eigenem `PORT` starten (zum Beispiel 8010 und 8011), nie beide mit dem Standardwert. Mit `setsid nohup` starten. Vor dem Warten prüfen, ob die Prozesse leben (`ps aux | grep "[_]shard"`). Ein stehendes Log ohne Prozess bedeutet: Neustart der Umgebung, Lauf neu starten.
4. Erfolg nur melden, wenn die letzte Zeile jedes Logs `ALL CHECKS PASS` lautet. Eine Hälfte allein genügt nicht.
5. Zusammenführen ohne `merge=union` in `.git/info/attributes`. Konflikte einzeln lösen. Union-Merge hat doppelte Listen, fehlende Kommas und unvollständige CSS-Blöcke erzeugt.
6. Unsichere Entscheidungen nicht blockieren lassen: die vorsichtigere Lesart wählen, im Bericht unter „Eigene Entscheidungen“ nennen. Nur nachfragen bei Unumkehrbarem (Namen/Marken veröffentlichen, Mails, Löschen).
7. Zweige früh sichern: `git push -u origin <Zweig>` (nicht `main`), danach `git fetch origin +refs/heads/<Zweig>:refs/remotes/origin/<Zweig>`.
8. Ist eine Aufgabe fertig: sofort nach `erledigt/` verschieben und pushen, damit der nächste geplante Lauf sie nicht doppelt macht.
9. Zwischen-Branches (`wip/…`, `int/…`) werden gelöscht, sobald sie in `main` zusammengeführt sind (lokal und auf dem Remote), außer ein Lauf arbeitet noch darauf.
