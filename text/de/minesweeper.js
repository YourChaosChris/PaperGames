// text/de/minesweeper.js
// Rules and history texts of minesweeper (de). Loaded by minesweeper-rules.html and minesweeper-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    minesweeper_rules_title: "Minesweeper-Regeln",
    minesweeper_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Minesweeper spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    minesweeper_rules_basics_title: "Die Grundidee",
    minesweeper_term_board: "Das Gitter und der erste Klick",
    minesweeper_rules_board: "Versteckte Minen sind über das Gitter verteilt. Das erste aufgedeckte Feld ist immer garantiert sicher – die Minen werden erst danach platziert, unter Vermeidung dieses Feldes und all seiner Nachbarn –, sodass die Partie nie enden kann, bevor sie richtig begonnen hat.",
    minesweeper_term_numbers: "Die Zahlen lesen",
    minesweeper_rules_numbers: "Ein aufgedecktes sicheres Feld zeigt eine Zahl: wie viele Minen sich in seinen acht Nachbarfeldern verstecken. Ein leeres Feld bedeutet null, und beim Aufdecken öffnet sich automatisch der gesamte zusammenhängende leere Bereich.",
    minesweeper_term_flags: "Flaggen setzen",
    minesweeper_rules_flags: "Ein Feld, das vermutlich eine Mine versteckt, mit einer Flagge markieren – über den Flaggen-Modus (für Touchscreens) oder einen Rechtsklick (im Desktop-Browser). Geflaggte Felder können nicht versehentlich aufgedeckt werden. Ein Klick auf eine bereits aufgedeckte Zahl, deren geflaggte Nachbarn mit ihrer Zahl übereinstimmen, deckt alle übrigen Nachbarn auf einmal auf – genau wie ein Mittelklick im klassischen Desktop-Spiel –, aber eine falsch gesetzte Flagge kann dabei trotzdem die Partie kosten.",
    minesweeper_rules_end_title: "Wie eine Partie endet",
    minesweeper_term_win: "Gewinnen",
    minesweeper_rules_win: "Alle Felder aufdecken, die keine Mine sind – dann ist das Feld geräumt.",
    minesweeper_term_loss: "Verlieren",
    minesweeper_rules_loss: "Eine Mine aufdecken beendet die Partie sofort – alle Minen auf dem Brett werden angezeigt, wobei die, die einen erwischt hat, von den übrigen unterschieden wird.",
    minesweeper_history_title: "Die Geschichte von Minesweeper",
    minesweeper_history_origins_title: "Vom Großrechner auf den Schreibtisch",
    minesweeper_history_origins_p1: "Aufdeck-und-Schlussfolgerungs-Spiele im Stil von Minesweeper reichen bis in die frühen 1960er-Jahre zurück und erschienen unter verschiedenen Namen auf Großrechnern und frühen Personal Computern der 1980er-Jahre, darunter eine 1989er Windows/OS2-Version namens \"Mined-Out\" sowie mehrere Freeware-Klone mit Namen wie \"RLogic\" und \"Cube\".",
    minesweeper_history_origins_p2: "Die Version, die das Spiel weltberühmt machte, schrieben Microsofts Robert Donner und Curt Johnson 1992 für Windows 3.1 – sie ersetzte das frühere Windows-Spiel Reversi als mitgeliefertes Übungsspiel, das neuen Nutzern die Maus beibringen sollte: Links- und Rechtsklick mussten damals beide noch wirklich geübt werden.",
    minesweeper_history_spread_title: "Auf jedem Schreibtisch installiert",
    minesweeper_history_spread_p1: "Weil Windows in den 1990er- und 2000er-Jahren auf einem derart überwältigenden Anteil aller PCs weltweit lief, wurde Minesweeper fast automatisch eines der meistgespielten Computerspiele der Geschichte – überall installiert, ohne Anleitung spielbar und ideal für die Leerlaufminuten zwischen echter Arbeit.",
    minesweeper_history_spread_p2: "Der garantiert sichere erste Klick, heute als fester Bestandteil der Regeln angesehen, war selbst eine spätere Verfeinerung: Die ursprüngliche Version von 1992 konnte einen gelegentlich schon beim allerersten Klick sterben lassen – ein Ärgernis, das spätere Versionen beseitigten, indem sie die Minenplatzierung erst nach diesem ersten Aufdecken vornahmen, genau wie hier.",
    minesweeper_history_modern_title: "Ein wirklich schwieriges Rätsel",
    minesweeper_history_modern_p1: "Jenseits der Nostalgie erweist sich Minesweeper als mathematisch ernst zu nehmen: 2000 bewies Richard Kaye, dass die Frage, ob ein gegebenes, teilweise aufgedecktes Minesweeper-Brett eine mit seinen Hinweisen konsistente Lösung besitzt, NP-vollständig ist – womit es in dieselbe Komplexitätsklasse fällt wie notorisch schwierige Probleme wie das Problem des Handlungsreisenden.",
    minesweeper_history_modern_p2: "Dieses Ergebnis bedeutet, dass es keinen bekannten Abkürzungs-Algorithmus gibt, der jede beliebige Minesweeper-Stellung stets schnell löst – in den schwierigsten Fällen bleibt einem Spieler (oder einem Computer) nur ein echtes 50:50-Raten, ohne das sichere Feld allein durch Logik ableiten zu können – genau der Moment, den jeder erfahrene Spieler zu fürchten gelernt hat."
});
I18n.markTextLoaded("de");
