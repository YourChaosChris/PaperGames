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
  und dann `tail -n 1 log | grep -qx "ALL CHECKS PASS"`. `run-all.sh`
  teilt sich selbst in parallele Teile (siehe „Sicherungen“ 3) und läuft
  genau einmal am Ende, als Hintergrundbefehl. Dauer: etwa 45 Minuten in
  der Cloud (2 Kerne, 1 Teil), etwa 13 Minuten auf dem Mac mini (12 Kerne,
  6 Teile; mit `SHARDS=1` dort etwa 46 Minuten). Vorher einen eigenen Server auf denselben Ports (PORT bis
  PORT + 5) beenden, denn `run-all.sh` startet je Teil einen eigenen.
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
  - Spielablauf: `RECHTSCHECK.md` Punkt 11 (Abstand zu Handelsspielen,
    Tabelle Vorbild/gleich/eigen, `ok`/`knapp`/`zu nah`) und das „Tor vor
    Bau und Veröffentlichung“ dort gelten für jedes neue oder stark
    geänderte Spiel; bei `zu nah` oder `unklar` kein Release, sondern eine
    Frage an Christopher.
- Lizenz ist PolyForm Noncommercial 1.0.0; fremde Dateien nur mit kompatibler Lizenz (keine GPL, keine Copyleft-Pflicht, die die Nicht-Kommerziell-Regel aushebelt).
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
- Alte Browser (Aufgabe 103): `tools/old-browser.js` steht als erstes
  Skript im `<head>` jeder Seite (eingefügt von `tools/seo.js`, nach
  einer Änderung `node tools/seo.js`). Es bleibt streng ES5 (nur `var`,
  `function`, keine Pfeile, keine Template-Strings), nie Moderneres
  einbauen; unter etwa 1 KB. Ohne ES2015/Promise/fetch/Symbol schreibt es
  eine Meldung (en, de) und öffnet ein verstecktes `<plaintext>`, damit
  kein weiteres Skript läuft. Test: `tests/old-browser.js` (braucht
  `acorn`).
- Playwright: Chromium unter `/opt/pw-browsers`, Module über
  `NODE_PATH=/opt/node22/lib/node_modules`. Nie `playwright install`.
- Fallen:
  - `pgrep -f` findet sich selbst, Warteschleifen damit enden nie;
  - Prozesse über `ps aux | grep … | awk '{print $2}' | xargs kill`
    beenden;
  - `ss` gibt es nicht, den Server mit `curl` prüfen;
  - Hilfsskripte im Scratchpad gehen mit der Sitzung verloren.

## Sparsam arbeiten (Christopher, 19.10.2026)

Gilt für jede Sitzung und jeden geplanten Lauf. Alles sauber und
ordentlich, aber mit so wenig Claude-Credits wie möglich.

1. Lange Läufe (volle Testreihe, Simulationen, Vorabprüfung, Bildschirmfotos)
   laufen auf dem Mac mini (12 Kerne, 32 GB), nicht in der Cloud (2 Kerne),
   wenn er erreichbar ist. Testdienst: Zweigname in die Datei
   `~/codex-work/pg-jobs/start-tests` schreiben; der Dienst lädt den Zweig
   von GitHub und führt `tests/run-all.sh` mit `PORT=8010` aus. Den Zweig
   vorher mit `git push -u origin <Zweig>` sichern. Ergebnis:
   `~/codex-work/pg-jobs/status.txt` und `~/codex-work/pg-test/mac/log-1.txt`.
   Der Dienst hat nur einen kleinen PATH (ohne `/usr/sbin`).
2. Nur das Ergebnis lesen (`tail -n 1`, `grep -c "^=== "`, Fehlerzeilen),
   nie ganze Logs in den Chat holen.
3. Einfache Massenarbeit (Kommentare, Umbenennen, Texte formatieren, kleine
   Dateien) und klar umrissene Programmieraufgaben an Ollama bzw. Codex
   geben, wenn erreichbar (Skill `arbeitsteilung-codex-ollama`). Claude plant,
   prüft den Diff und entscheidet. Keine Zugangsdaten und keine Mailadressen
   an Codex.
4. Ist der Mac nicht erreichbar, in der Cloud arbeiten und das im Bericht
   unter „Sonstiges“ nennen.
5. Fehlt ein Werkzeug (Paket, Browser, Modell), selbst beschaffen und
   installieren. Nur wenn es wirklich nicht geht, Christopher fragen.
6. Im Bericht unter „Eigene Entscheidungen“ nennen, was auf dem Mac, bei
   Ollama/Codex und in der Cloud lief.

## Stand (26.10.2026, Release v268 vorbereitet für 27.10.)

- `CACHE_NAME` `papergames-cache-v268` (Zweig `wip/136`, auf `main` noch v267), 110 Spiele.
- 136, Pflege 132 (v268): Aufgabe 133 (Modus „Wilde Kette“) ist zurückgestellt, bis Christopher entscheidet; sie liegt nur auf dem Zweig `wip/133` und wurde aus `wip/136` wieder herausgenommen (Spielsymbol wie v267). Gipfelwurf mit eigenen Regeln (`rules: 2`): drei Würfel, Schrittwürfel (1–2/3–4/5–6 → 1/2/3), ein Grat pro Zug, Hütte (`HUTS`) und Gletscherspalte (`CREVASSES`), Punkte = Lagerhöhen + Gipfelboni 6/3, Ziele 30/45, Spielende nach voller Runde; Computer mit Tabelle `STEPS`. Ergebnisfenster-Knöpfe 44 px (base.css). 137: Tier-Yatzy heißt „Pfotenwurf“ (en „Critter Roll“), Kürzel und Schlüssel `pfotenwurf` (Spielstand und Statistik ziehen über `RENAMED_SLUGS`/`RENAMED` von `tieryatzy` um), `tieryatzy*.html` leiten bis 31.12.2026 weiter (noindex, nicht in der Sitemap). Aufgaben 145–153 (Abstand zu Handelsspielen, aus 135) warten auf Christophers Richtung.
- 134 (v267, eigenes Release am 26.10. als Ausnahme „rechtliche Gründe“): `teufelsieben` heißt sichtbar „Glückskette“ (en „Lucky Chain“) und hat eigene Regeln (Kern neu, `rules: 2`; Zahlen 1–10 nach `COUNTS`, 60 Karten, Sonderkarten courage/strike/pass/bridge/collector/peek, Reihenbonus `5 × (L − 2)` ab 4, Ziele 60/90/120, jeder Spieler ein ganzer Zug pro Runde). Alte Spielstände ohne `rules: 2` werden verworfen (`isCurrentState`), die Seite startet dann direkt eine neue Partie. Dateinamen, `ts_`-Schlüssel und Speicherplatz bleiben. Kein „flip“, kein alter Name in Spiel, Regeln, Tests.
- 122, 129, 130 (v266): Rätsel-Adventskalender (`advent`, Familie latin, sechs Rätselarten mit festem Startwert `papergames-advent:<n>`), 15 weitere Geschichtsseiten berichtigt, Sternjagd-Ausgleich bei 2 Spielern (`balance`/`bonus`, der Zweite zieht beim ersten Mal doppelt). Gipfelwurf (131) ist gebaut (Commit 2d7128b), aber nach dem Rechts-Tor (RECHTSCHECK Punkt 11, `zu nah`) auf `main` wieder entfernt (32b3b54); i18n-Schlüssel `gw_*`/`game_gipfelwurf` sind noch da. Wiederherstellen erst nach Christophers Entscheidung.
- 123–128 und 121 (v265, ein Release am 25.10. nach Ausnahme von Christopher): Wegesperre `s.blocks` ("few" 4 / fehlt = normal 6 / "many" 11, „viele“ nur normales Brett mit 2–4 Spielern, `BlockersCore.MANY_MAX_PLAYERS`, Auswahl `#bl-blocks`; mit 5–6 Spielern lief das Brett mit 11 Klötzen voll). Ludo-Texte nennen 2–4 und bis 6 Spieler. `button.small` zentral `min-height: 44px` (base.css); „Großes Spielfeld“ (`big-board.js`) auch für Fanorona, Hex, Streichhölzer (`matches.html` hat dafür ein festes `#board-actions`). Bildanleitung für war und pairs. Sternjagd: Beginner zufällig und angezeigt (`#sj-starter`, `sj_starts`/`sj_starts_you`), 3 Spieler auf den Ecken 1, 0, 2 (gegen die Pfeile), Spielstand-Feld `homes`, alte Stände ohne `homes` behalten 0, 1, 2 (`homesOf`). 15 Geschichtsseiten geprüft (126). Neues Spiel Teuflische Sieben (`teufelsieben`, Präfix `ts_`, en „Devilish Seven“, Kategorie party, ohne Familie); der Name des Handelsvorbilds darf nirgends stehen.
- 114, 116, 109–112, 118, 120 (v264, ein Release am 25.10. nach Ausnahme von Christopher): Startseiten-Titel ohne Kindle/Kobo (`tests/seo-index-texts.js` prüft das, Titel ≤ 60 Zeichen); BSD-Volltext in `NOTICE`; Xiangqi-Figuren in eigener Datei `xiangqi-pieces.js` (CC BY-SA 4.0); Lizenzabsatz `about_license`; Datenschutz mit Service Worker (`privacy_offline_body`), Lichess-Satz, USA-Übermittlung, `privacy_as_of` (ar bleibt Englisch). Bildanleitung (`howto.js`, neue Bausteine `ladder`, `snake`, `grid`) für linkpairs, oldmaid, snakesladders (`tests/howto-ui.js`). Ludo `state.board === 6` (sechs Arme, 78 Felder, Farben purple ◆/orange ★, `LudoCore.geometry()`, Zeichnung `buildLudoBoard6DOM`, `tests/ludo-core.js`, `tests/ludo-ui.js`). Wegesperre: `state.board === "quick"` (9 x 7, Ruhefelder „R“, 4 Figuren, `BlockersCore.boardOf()`, Auswahl `#bl-board-size` – nicht `#bl-board`, das ist das Brett) und 2–6 Spieler (Formen ring/cross, „Alle“ mit 5–6 Spielern immer 3 Figuren; `tests/blockers-quick*.js`, `tests/blockers-six*.js`). Neue Spiele Tier-Yatzy (`tieryatzy`, Kategorie race/Familie dicegames, kids), Schiebepuzzle (`slidepuzzle`), Türme von Hanoi (`hanoi`), Nim (`nim`, mit Undo); Kerne der letzten drei von Codex vorgeschrieben und überarbeitet. Hex heißt Schwarz/Weiß (intern weiter "r"/"b"), Zeile `#hex-side-line`, beschriftete Farbwahl.
- 113 (v263, eigenes Release am 25.10. als Ausnahme „rechtliche Gründe“): Sperrsteine heißt sichtbar „Wegesperre“ mit „Sperrklötzen“ (en „Blocked Path“/„blocks“, fr „Chemin barré“, es „Camino cortado“, it „Strada sbarrata“, nl „Wegversperring“, pl „Zablokowana droga“, uk „Перекритий шлях“, ru „Перекрытый путь“, ja „道ふさぎ“, zh „封路棋“, ar „سد الطريق“). Dateinamen, Schlüssel (`bl_*`, `msg_bl_stone_*`), Code-Bezeichner (`stones`, Phase `stone`) und Spielstand `einkchess_save_blockers` bleiben. Neuer Schlüssel `msg_bl_block` (Wort im Feld-Label). Neuer Test `tests/blockers-ui.js`. Nicht verwenden: „Barricade“/„Barrikade“, „Barricata“, „Blokada“, „Roadblock“, „PathBlock“ (Handelsnamen).
- 115 und 119 (v262, ein Release): Minesweeper-Uhr nur mit Kästchen „Zeit anzeigen“ in der Werkzeugleiste (`papergames_minesweeper_show_time`; Zeit über `runStart`/`elapsedSeconds` gezählt, Intervall nur bei sichtbarer Uhr), mehr Flaggen als Minen: `msg_t_mines_too_many`. Hex-Tauschregel (`state.swapRule`/`swapped`, `HexCore.canSwap`/`applySwap`/`firstStoneCentral`; Tausch = Seitentausch, Brett bleibt, `humanColor` wechselt; Kästchen `#hex-swap-rule` merkt sich `quick-rules.js` wie alle Felder in `#settings-panel`). Schach: Kopfkommentar `chess-core.js` berichtigt, Lichess-Hinweis `chess_lichess_note`, Regelabschnitt „Online spielen“. Domino: Vorrat-Knopf auf jedem eigenen Zug sichtbar, 44 px, „Vorrat (N Steine)“, Antwort unter dem Knopf (`#domino-stock-note`); Dreiecke haben je Platz genau eine Lage (Test in `tests/domino-core.js`), Satz „dreht sich von selbst“. Neue Tests `hex-core.js`, `hex-ui.js`, `minesweeper-ui.js`, `domino-ui.js`. Falle: `quick-rules.js` stellt beim Laden alle Felder in `#settings-panel` aus `papergames_last_settings_<slug>` wieder her (nach dem DOMContentLoaded der App) – ein eigenes gemerktes Kästchen dort wird überschrieben.
- Aufgaben bis 108 erledigt. 106 bis 108 (Rommé, v261): `extendMeld(meld, card, end)` und `jokerEnds(meld)` – ein Joker an einer Folge mit Platz an beiden Enden fragt „Unten/Oben anlegen (als …)“ (`AppStateRomme.choice.ends`), die KI wählt das Ende, an das danach eine Handkarte passt; `handRule` (Hand-Rommé: nur über die Bereitlege-Mechanik der Erstauslage, `confirmOpen` bei höchstens einer Karte auf der Hand, letzte Karte geht auf den Ablagestapel, `endRound` verdoppelt und setzt `doubled`); `knockRule` (nur gegen 2–3 Computer, Phasen `knocked` und `knockDiscard`, Züge `knock`/`knockGive`, `canKnock`; mit der Variante `discardRule` kein Klopfen; der Computer wartet bei offenem Klopfen `AiPacing.delay(2400)`). Meldungen nach dem Klopfen enthalten „must“/„not“, damit `UiStatus.rewrite` sie stehen lässt. Tests `tests/romme-core.js` (vorher gab es keinen Rommé-Kerntest) und `tests/romme-ui.js`. `run-all.sh` überspringt belegte feste Ports (curl-Code ≠ 7 gilt als belegt, Schritt +10); damit läuft `bash tests/run-all.sh` auf dem Mac auch ohne `PORT` (8021 → 8031). Bekannt, nicht behoben: Minesweeper zeigt bei mehr Flaggen als Minen „-6 mines left.“ unübersetzt (`i18n-runtime-sweep.js` scheitert dann zufällig einmal).
- 105: Romme-Meldung `joker-unusable` nennt die Hausregel (mit Hausregel eigener Satz `msg_rm_err_joker_unusable_layoff`); Melde-Link „Idee oder Fehler melden“ (`mailto:`, Spiel, CACHE_NAME vom Service Worker, Sprache) setzt `rules-link.js` als erstes Element in die Fußzeile jeder Spielseite, Satz dazu in `privacy_no_tracking_body`; `tests/startup-limits.js` mit Werten in `tests/startup-limits.json` (Skriptzeit bei CPU 10, Grenze +50 %), läuft als „Teil 0“ allein nach den parallelen Teilen (`ALONE_TESTS` in `run-all.sh`), weil die Last der anderen Teile die Zeiten bis zum Dreifachen schwanken lässt; `eink-sim.js` exportiert `runPage()`, `TAPS=0` misst nur den Start; v260. 104: `msg()` mit Vorfilter je Vorlage und Zwischenspeicher für Teilsätze, schnellere Sudoku-/Killer-Löser (gleiche Seeds, gleiche Rätsel: `tests/sudoku-seeds.js`), `i18n-pending` endet bei `load` oder nach 15 s statt nach 4 s (englischer Aufblitzer auf langsamen Geräten), v259. Auf dem Mac ist Port 8021 von einem fremden Prozess belegt: `run-all.sh` ohne `PORT` scheitert dort an `offline-install.js`; mit `PORT=8010` bzw. über den Testdienst grün. Messskripte (eink-sim mit anderen Einstellungen, CPU-Profil, Spur) waren nur im Scratchpad. 100: Titel der Startseite mit Gerätenamen (v257); 101: Sitemap schlank (328 URLs); 102: Repo aufgeräumt, kein Release. 99y: Offline-Install-Test stabil (`tests/serve.py`), 99z: Regel Releases bündeln. Nach Pushes auf `main` oder `wip/*` startet `de.papergames.auto` (prüft alle 5 Minuten) die Tests auf dem Mac mini selbst; `de.papergames.runner` führt sie aus; Logdateien werden dort ab 500 KB gekürzt. Nicht in der Testliste: `tests/quick-rules-motifs.js`, `tests/eink-sim.js`, `tests/lib.js`, `tests/load-i18n.js` (Hilfsdateien bzw. Einzelprüfungen von Hand).
- Testreihe: 78 Tests in `tests/test-list.txt`, 136 Abschnitte im Log
  (`grep -c "^=== "`), automatisch in bis zu 6 parallele Teile geteilt,
  dazu Teil 0 (`ALONE_TESTS`) allein am Ende.
- Zuletzt gebaut:
  - 99x: `run-all.sh` teilt die Testreihe selbst in parallele Teile (`SHARDS`, Liste in `tests/test-list.txt`, `tests/run-all-shards.js`), `arrows-core.js --levels`, `tools/preflight.sh` ohne festen Browser-Pfad; kein Release (nur Testwerkzeug);
  - 99w: Service Worker schreibt aktualisierte Seiten nicht mehr in den Cache der laufenden Version, klarer Offline-Satz (`offline_waiting`, `offline_ready_update_waiting`), `tests/offline-update.js`, v256;
  - 99v: Waldsiedlung ohne Everdell-Reste (Katalogtext, Senke/Clearing in den Regeln, 12 Sprachen), v255;
  - 99u: Lizenz PolyForm Noncommercial 1.0.0 (`LICENSE`), alter MIT-Text in `LICENSE-MIT-bis-v253.txt`, README und NOTICE angepasst, v254 ohne volle Testreihe (Anweisung Christopher);
  - 99t: Zoowurf, Pfote selbst auf ein leeres Tier legen (`pick`, Phase `paw`, `placePaw`), Zug des Computers als Tafel mit „Weiter“ (`tests/zoowurf-ui.js`);
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

## Releases bündeln (Christopher, 19.10.2026)

Ziel: weniger Releases, weniger volle Testreihen, weniger Credits.

1. Pro Kalendertag höchstens ein Release (`CACHE_NAME`, `release_vNNN`, volle Testreihe). Mehrere Aufgaben desselben Tages werden in ein Release gebündelt: erst alle Aufgaben bauen und einzeln prüfen, dann einmal Release und volle Testreihe.
2. Ausnahmen, die sofort ein eigenes Release rechtfertigen:
   - ein Fehler, der gespeicherte Spielstände zerstört oder das Spiel unbenutzbar macht;
   - ein Fehler im Service Worker, der die Offline-Nutzung bricht;
   - rechtliche Gründe (Lizenz, Marken, Namen).
   Die Ausnahme steht im Bericht unter „Eigene Entscheidungen“.
3. Reine Testwerkzeug- und Doku-Änderungen (`tests/`, `tools/`, `CLAUDE.md`, `README.md`) bekommen kein Release. Sie laufen mit dem nächsten ohnehin anstehenden Release mit oder werden einzeln gepusht, wenn die volle Testreihe durchläuft (wie bei 99x).
4. Hat ein geplanter Lauf mehrere Aufgaben in `offen/`, arbeitet er sie ab und macht ein Release am Ende, nicht eines je Aufgabe. Jede Aufgabe bekommt trotzdem ihren eigenen Commit und Bericht; im Bericht steht dasselbe Release.

## Sicherungen (Prozess, damit Christopher nicht nachfragen muss)

Gilt für jede Sitzung, auch für die geplanten Läufe. Ziel: Fehler früh finden, nicht erst nach der langen Testreihe. (Von Christopher am 17.10.2026 freigegeben.)

1. Nach jeder Zusammenführung mehrerer Zweige zuerst `bash tools/preflight.sh` (etwa 1 Minute: Syntax aller JS-Dateien, Konfliktmarken, doppelte Listen, Seitenfehler auf 12 Seiten, Hashes, statische Prüfungen, Übersetzungen). Erst bei „PREFLIGHT OK“ die Testreihe starten.
2. Nach JEDER Änderung an einer Datei, die in `sw.js` gelistet ist, `node tools/sw-hashes.js` erneut ausführen, auch bei einer Ein-Zeichen-Korrektur.
3. Die Testreihe teilt sich selbst: `PORT=8010 NODE_PATH=... bash tests/run-all.sh > log 2>&1` startet `SHARDS` Teile (ohne Angabe Kerne / 2, höchstens 6, höchstens 1 Teil je 2 GB freiem Speicher; `SHARDS=1` = alles nacheinander), jeder Teil mit eigenem Port (`PORT` bis `PORT + SHARDS - 1`) und eigenem Server (`tests/serve.py`: HTTP/1.1 mit Keep-Alive; mit `python3 -m http.server` gingen auf dem Mac in langen Läufen die Ports aus), und fügt die Ausgabe zu einem Log zusammen. Keine Hilfsdateien `_shard1.sh`/`_shard2.sh` mehr und kein Start „in zwei Hälften“. Mit `setsid nohup` (nur Linux) oder als Hintergrundbefehl starten. Vor dem Warten prüfen, ob `run-all.sh` lebt (`ps aux | grep "[r]un-all"`). Ein stehendes Log ohne Prozess bedeutet: Neustart der Umgebung, Lauf neu starten. Ein gescheiterter Test wird genau einmal wiederholt (nie die ganze Reihe; Log: `WIEDERHOLT: <test>`, vor der letzten Zeile `N Test(s) wiederholt: ...`; scheitert er erneut, bleibt die Reihe rot; im Bericht die Wiederholer nennen, `RETRY=0` schaltet es ab). Neuer Test: in `tests/test-list.txt` eintragen (Gewicht = Sekunden), sonst läuft er nicht; `node tests/run-all-shards.js` prüft die Aufteilung. `tools/preflight.sh` prüft die Ports 8010 bis 8015.
4. Erfolg nur melden, wenn die letzte Zeile des Logs `ALL CHECKS PASS` lautet (das Skript gibt sie nur aus, wenn jeder Teil durchlief).
5. Zusammenführen ohne `merge=union` in `.git/info/attributes`. Konflikte einzeln lösen. Union-Merge hat doppelte Listen, fehlende Kommas und unvollständige CSS-Blöcke erzeugt.
6. Unsichere Entscheidungen nicht blockieren lassen: die vorsichtigere Lesart wählen, im Bericht unter „Eigene Entscheidungen“ nennen. Nur nachfragen bei Unumkehrbarem (Namen/Marken veröffentlichen, Mails, Löschen).
7. Zweige früh sichern: `git push -u origin <Zweig>` (nicht `main`), danach `git fetch origin +refs/heads/<Zweig>:refs/remotes/origin/<Zweig>`.
8. Ist eine Aufgabe fertig: sofort nach `erledigt/` verschieben und pushen, damit der nächste geplante Lauf sie nicht doppelt macht.
9. Zwischen-Branches (`wip/…`, `int/…`) werden gelöscht, sobald sie in `main` zusammengeführt sind (lokal und auf dem Remote), außer ein Lauf arbeitet noch darauf.
