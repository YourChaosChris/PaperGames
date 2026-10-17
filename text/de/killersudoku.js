// text/de/killersudoku.js
// Rules and history texts of killersudoku (de). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    sudoku_rules_basics_title: "Die Grundidee",
    sudoku_term_goal: "Das Ziel",
    sudoku_term_input: "Zahlen eingeben",
    sudoku_rules_end_title: "Ein Rätsel abschließen",
    sudoku_term_win: "Gelöst",
    sudoku_term_difficulty: "Schwierigkeitsgrad",
    puzzle_rules_hint: "Der Knopf „Tipp“ hilft in drei Stufen. Der erste Druck markiert, wo der nächste Schritt liegt. Der zweite nennt den Grund, also die Regel, die dort greift. Der dritte führt den Schritt aus (trägt die Zahl ein oder baut die Brücke). Der Tipp arbeitet mit deinem aktuellen Stand: Steht irgendwo eine falsche Zahl oder Brücke, sagt er dir das zuerst. Er rät nie – geht es nur mit Ausprobieren weiter, sagt er das ehrlich. Tipps sind unbegrenzt. Ein Rätsel, das du mit Tipps löst, zählt ganz normal als Sieg; die Statistik zeigt zusätzlich, wie viele Siege mit Tipps waren.",
    killersudoku_rules_title: "Killer-Sudoku-Regeln",
    killersudoku_rules_intro: "Eine kurze Übersicht, wie PaperGames Killer-Sudoku spielt – praktisch zum Auffrischen oder Lernen.",
    killersudoku_term_board: "Das Gitter",
    killersudoku_rules_board: "Wie beim Sudoku teilen dicke Linien das 9x9-Gitter in neun 3x3-Blöcke. Gestrichelte Linien teilen es zusätzlich in Käfige aus einem bis fünf Feldern. Nur wenige oder gar keine Felder sind vorgegeben.",
    killersudoku_rules_goal: "Trage in jedes Feld eine Ziffer von 1 bis 9 ein, sodass jede Zeile, jede Spalte und jeder 3x3-Block jede Ziffer genau einmal enthält. Jedes Rätsel, das PaperGames erzeugt, hat genau eine Lösung.",
    killersudoku_term_regions: "Käfige",
    killersudoku_rules_regions: "Die kleine Zahl im Feld oben links eines Käfigs ist seine Summe: Die Ziffern im Käfig müssen zusammen diese Summe ergeben. Anders als beim Calcudoku darf sich innerhalb eines Käfigs keine Ziffer wiederholen.",
    killersudoku_rules_input: "Wähle ein Feld und dann eine Zahl aus der Leiste unter dem Spielfeld (oder tippe eine Ziffer auf der Tastatur). Eine weiß auf schwarz gezeigte Ziffer wiederholt sich in ihrer Zeile, Spalte, ihrem Block oder Käfig oder vervollständigt einen Käfig mit falscher Summe.",
    killersudoku_rules_difficulty: "Leichte Rätsel haben meist kleine Käfige und ein paar mehr Vorgaben; schwere Rätsel haben größere Käfige und nur die Vorgaben, die für eine eindeutige Lösung nötig sind, oft fast keine.",
    killersudoku_rules_win: "Das Rätsel ist gelöst, sobald jedes Feld ausgefüllt ist und keine Zeile, Spalte, kein Block und kein Käfig gegen eine Regel verstößt.",
    killersudoku_history_title: "Die Geschichte des Killer-Sudoku",
    killersudoku_history_origins_title: "Summen auf einem Sudoku-Gitter",
    killersudoku_history_origins_p1: "Rätsel, die die Sudoku-Regeln mit Käfigsummen verbinden, erschienen schon in den 1990er-Jahren in Japan, wo Summenrätsel wie Kakuro beliebt waren. Weit verbreitet wurde die Idee 2005, als britische Zeitungen solche Rätsel während des weltweiten Sudoku-Booms unter dem Namen Killer Sudoku druckten.",
    killersudoku_history_origins_p2: "Der Name ist beschreibend, keine Marke: „Killer“ versprach einfach eine schwerere Aufgabe als ein gewöhnliches Sudoku, weil es kaum oder gar keine Ziffern zum Anfangen gibt.",
    killersudoku_history_names_title: "Wie die Rätsel hier entstehen",
    killersudoku_history_names_p1: "Jedes Killer-Sudoku hier beginnt als frisch erzeugtes, vollständig gelöstes Sudoku-Gitter, das dann in zusammenhängende Käfige zerlegt wird, in denen sich keine Ziffer wiederholt.",
    killersudoku_history_names_p2: "Ein eingebauter Löser prüft dann, ob die Käfigsummen nur eine einzige Lösung zulassen. Wenn nicht, wird eine Ziffer, in der sich zwei mögliche Lösungen unterscheiden, als Vorgabe aufgedeckt, und die Prüfung wiederholt sich, bis genau eine Lösung übrig bleibt."
});
I18n.markTextLoaded("de");
