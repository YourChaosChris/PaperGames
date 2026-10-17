// text/de/calcudoku.js
// Rules and history texts of calcudoku (de). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    sudoku_rules_basics_title: "Die Grundidee",
    sudoku_term_goal: "Das Ziel",
    sudoku_term_input: "Zahlen eingeben",
    sudoku_rules_end_title: "Ein Rätsel abschließen",
    sudoku_term_win: "Gelöst",
    sudoku_term_difficulty: "Schwierigkeitsgrad",
    puzzle_rules_hint: "Der Knopf „Tipp“ hilft in drei Stufen. Der erste Druck markiert, wo der nächste Schritt liegt. Der zweite nennt den Grund, also die Regel, die dort greift. Der dritte führt den Schritt aus (trägt die Zahl ein oder baut die Brücke). Der Tipp arbeitet mit deinem aktuellen Stand: Steht irgendwo eine falsche Zahl oder Brücke, sagt er dir das zuerst. Er rät nie – geht es nur mit Ausprobieren weiter, sagt er das ehrlich. Tipps sind unbegrenzt. Ein Rätsel, das du mit Tipps löst, zählt ganz normal als Sieg; die Statistik zeigt zusätzlich, wie viele Siege mit Tipps waren.",
    calcudoku_rules_title: "Calcudoku-Regeln",
    calcudoku_rules_intro: "Eine kurze Übersicht, wie PaperGames Calcudoku spielt – praktisch zum Auffrischen oder Lernen.",
    calcudoku_term_board: "Das Gitter",
    calcudoku_rules_board: "Das Gitter ist quadratisch, von 4x4 bis 7x7. Anders als beim Sudoku gibt es keine Blöcke; stattdessen teilen dicke Linien es in Käfige – Gruppen aus einem bis vier zusammenhängenden Feldern.",
    calcudoku_rules_goal: "Trage in jedes Feld eine Ziffer von 1 bis zur Gittergröße ein (1 bis 5 bei 5x5), sodass jede Zeile und jede Spalte jede Ziffer genau einmal enthält. Jedes Rätsel, das PaperGames erzeugt, hat genau eine Lösung.",
    calcudoku_term_regions: "Käfige und Rechenzeichen",
    calcudoku_rules_regions: "Die kleine Angabe im Feld oben links eines Käfigs zeigt eine Zielzahl und ein Rechenzeichen. Bei + oder × müssen die Ziffern des Käfigs zusammengezählt oder malgenommen die Zielzahl ergeben, in beliebiger Reihenfolge. Ein Käfig mit – oder ÷ hat immer zwei Felder: die größere Ziffer minus oder geteilt durch die kleinere ergibt die Zielzahl. Ein Käfig mit nur einem Feld zeigt einfach seine Ziffer. Eine Ziffer darf in einem Käfig zweimal vorkommen, solange Zeile und Spalte es erlauben.",
    calcudoku_rules_input: "Wähle ein Feld und dann eine Zahl aus der Leiste unter dem Spielfeld (oder tippe eine Ziffer auf der Tastatur). Eine weiß auf schwarz gezeigte Ziffer kollidiert mit einer anderen in ihrer Zeile oder Spalte oder vervollständigt einen Käfig, der seine Zielzahl nicht erreicht.",
    calcudoku_rules_difficulty: "Wähle vor dem Start die Gittergröße und eine Schwierigkeitsstufe. Größere Gitter und höhere Stufen bedeuten größere Käfige und weniger Einzelfelder, die weniger verraten.",
    calcudoku_rules_win: "Das Rätsel ist gelöst, sobald jedes Feld ausgefüllt ist und keine Zeile, Spalte und kein Käfig gegen eine Regel verstößt.",
    calcudoku_history_title: "Die Geschichte von Calcudoku",
    calcudoku_history_origins_title: "Aus einem Klassenzimmer in Japan",
    calcudoku_history_origins_p1: "Diese Rätselart wird meist Tetsuya Miyamoto zugeschrieben, einem japanischen Mathematiklehrer, der sie um 2004 entwickelte, um seine Schüler im Rechnen und logischen Denken zu üben, ohne ihnen den Lösungsweg vorzugeben. Die Idee verbreitete sich bald über sein Klassenzimmer hinaus in Rätselheften und Zeitungen.",
    calcudoku_history_origins_p2: "Unter der Rechnerei liegt das lateinische Quadrat – ein Gitter, in dem jedes Zeichen in jeder Zeile und Spalte genau einmal vorkommt. Mathematiker wie Leonhard Euler untersuchten es im 18. Jahrhundert, und es steckt auch im Kern des Sudoku.",
    calcudoku_history_names_title: "Viele Namen, ein Rätsel",
    calcudoku_history_names_p1: "Dieselbe Rätselart erscheint kommerziell auch unter dem Namen KenKen. KenKen ist eine eingetragene Marke der Nextoy LLC. PaperGames steht in keiner Verbindung zur Nextoy LLC und verwendet stattdessen den allgemeinen Namen Calcudoku.",
    calcudoku_history_names_p2: "Jedes Calcudoku hier entsteht frisch auf deinem Gerät: Ein zufälliges lateinisches Quadrat wird in Käfige zerlegt, jeder Käfig bekommt ein Rechenzeichen mit ganzzahligem Ergebnis, und ein eingebauter Löser behält nur Zerlegungen mit genau einer Lösung."
});
I18n.markTextLoaded("de");
