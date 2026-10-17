// text/de/sudoku.js
// Rules and history texts of sudoku (de). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    sudoku_rules_title: "Sudoku-Regeln",
    sudoku_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames Sudoku spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    sudoku_rules_basics_title: "Die Grundidee",
    sudoku_term_board: "Das Gitter",
    sudoku_rules_board: "Das 9x9-Gitter ist in neun 3x3-Blöcke unterteilt. Manche Felder sind zu Beginn bereits ausgefüllt (\"Vorgaben\") und können nicht geändert werden; die übrigen sind leer und warten darauf, ausgefüllt zu werden.",
    sudoku_term_goal: "Das Ziel",
    sudoku_rules_goal: "Fülle jedes leere Feld mit einer Ziffer von 1 bis 9, sodass jede Zeile, jede Spalte und jeder der neun 3x3-Blöcke jede Ziffer genau einmal enthält. Jedes von PaperGames erzeugte Rätsel hat genau eine Lösung.",
    sudoku_term_input: "Zahlen eingeben",
    sudoku_rules_input: "Ein Feld auswählen und dann eine Zahl aus dem Feld unter dem Brett wählen (oder eine Ziffer auf der Tastatur eintippen). Ein Feld mit gestrichelter Umrandung steht gerade im Konflikt mit einem anderen Feld in seiner Zeile, Spalte oder ihrem Block – ein Hinweis darauf, dass sich dort etwas ändern muss.",
    sudoku_rules_end_title: "Ein Rätsel abschließen",
    sudoku_term_win: "Gelöst",
    sudoku_rules_win: "Das Rätsel ist gelöst, sobald das Gitter vollständig ausgefüllt ist und keine Konflikte mehr bestehen.",
    sudoku_term_difficulty: "Schwierigkeitsgrad",
    sudoku_rules_difficulty: "Leichte, mittlere und schwere Rätsel unterscheiden sich nur darin, wie viele der 81 Felder zu Beginn schon ausgefüllt sind – weniger Vorgaben bedeuten, dass mehr logisches Schließen nötig ist, um voranzukommen.",
    sudoku_history_title: "Die Geschichte von Sudoku",
    sudoku_history_origins_title: "Zuerst ein amerikanisches Rätsel",
    sudoku_history_origins_p1: "Das Zahlen-Platzierungsrätsel, das wir heute Sudoku nennen, erschien erstmals 1979 in einer amerikanischen Rätselzeitschrift, veröffentlicht von Dell Magazines unter dem Titel \"Number Place\". Als Erfinder gilt meist Howard Garns, ein pensionierter Architekt und freiberuflicher Rätselkonstrukteur – allerdings druckte die Zeitschrift damals keine Autorennamen ab, sodass die Zuschreibung auf Indizien statt auf einer eindeutigen Angabe beruht.",
    sudoku_history_origins_p2: "Das Rätsel griff eine viel ältere mathematische Idee auf, das lateinische Quadrat – ein Gitter, in dem jedes Symbol genau einmal pro Zeile und Spalte vorkommt –, das Leonhard Euler im 18. Jahrhundert untersucht hatte, ergänzt um die 3x3-Block-Bedingung, damit eine eindeutige Lösung allein durch logisches Schließen erreichbar wird, ganz ohne Raten.",
    sudoku_history_spread_title: "Ein japanischer Name für eine weltweite Welle",
    sudoku_history_spread_p1: "Das Rätsel erreichte Japan 1984 durch den Rätselverlag Nikoli, der es in \"Suuji wa dokushin ni kagiru\" (\"die Ziffern müssen einzeln bleiben\") umbenannte, bald verkürzt zu Sudoku (\"einzelne Zahl\"). Nikolis Redakteure führten auch die heute übliche Konvention symmetrisch angeordneter Vorgaben und stets eindeutig lösbarer Rätsel ein.",
    sudoku_history_spread_p2: "Sudoku blieb zwei Jahrzehnte lang ein bescheidener japanischer Zeitvertreib, bis der pensionierte Richter Wayne Gould, der es auf einer Reise nach Tokio kennengelernt hatte, ein Computerprogramm zur schnellen Rätselerzeugung schrieb und die Londoner Times überzeugte, ab 2004 solche Rätsel abzudrucken – was innerhalb etwa eines Jahres eine weltweite Zeitungsrätsel-Welle auslöste.",
    sudoku_history_modern_title: "Von der Zeitungsspalte zur Informatik",
    sudoku_history_modern_p1: "Sudokus plötzliche Beliebtheit zog ebenso Mathematiker und Informatiker an wie Gelegenheitslöser: 2005 wurde die Gesamtzahl unterschiedlicher vollständiger 9x9-Gitter exakt berechnet (etwas mehr als 6,6 Trilliarden), und 2012 zeigte eine erschöpfende Computersuche, dass kein gültiges 9x9-Rätsel mit weniger als 17 Vorgaben eine eindeutige Lösung haben kann.",
    sudoku_history_modern_p2: "Dieses zweite Ergebnis ist genau die Tatsache, auf die sich PaperGames' Generator umgekehrt verlässt: Weil die Eindeutigkeit mit jeder entfernten Vorgabe schwerer zu bewahren ist, entsteht jedes Rätsel hier, indem von einem vollständig gelösten Gitter ausgehend Felder einzeln entfernt werden, solange eine eindeutige Lösung erhalten bleibt – dieselbe Logik, nur rückwärts angewandt, die Rätselkonstrukteure schon seit Nikolis frühesten Ausgaben nutzen.",
    puzzle_rules_hint: "Der Knopf „Tipp“ hilft in drei Stufen. Der erste Druck markiert, wo der nächste Schritt liegt. Der zweite nennt den Grund, also die Regel, die dort greift. Der dritte führt den Schritt aus (trägt die Zahl ein oder baut die Brücke). Der Tipp arbeitet mit deinem aktuellen Stand: Steht irgendwo eine falsche Zahl oder Brücke, sagt er dir das zuerst. Er rät nie – geht es nur mit Ausprobieren weiter, sagt er das ehrlich. Tipps sind unbegrenzt. Ein Rätsel, das du mit Tipps löst, zählt ganz normal als Sieg; die Statistik zeigt zusätzlich, wie viele Siege mit Tipps waren."
});
I18n.markTextLoaded("de");
