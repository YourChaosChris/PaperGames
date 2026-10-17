// text/de/skyscrapers.js
// Rules and history texts of skyscrapers (de). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    skyscrapers_rules_title: "Skyscrapers-Regeln",
    skyscrapers_rules_intro: "Eine kurze Übersicht, wie PaperGames Skyscrapers spielt - nützlich, wenn du aus der Übung bist oder es gerade lernst.",
    skyscrapers_rules_basics_title: "Die Grundidee",
    skyscrapers_term_board: "Das Gitter",
    skyscrapers_rules_board: "Jedes Feld trägt die Höhe eines Gebäudes, von 1 (am niedrigsten) bis N (am höchsten, wobei N die Gittergröße ist). Am Rand des Gitters tragen manche Zeilen und Spalten eine Hinweiszahl direkt außerhalb dieser Kante - nicht zwingend jede Zeile oder Spalte, und nicht zwingend auf jeder Seite.",
    skyscrapers_term_clues: "Die Randhinweise lesen",
    skyscrapers_rules_clues: "Ein Hinweis gibt an, wie viele Gebäude man in dieser Zeile oder Spalte von dieser Seite aus sehen würde, wenn ein höheres Gebäude jedes niedrigere davor vollständig verdeckt. Hinweise oben schauen die Spalte hinunter, Hinweise unten schauen sie hinauf, Hinweise links schauen die Zeile entlang nach rechts, und Hinweise rechts schauen sie entlang nach links.",
    skyscrapers_term_goal: "Das Ziel",
    skyscrapers_rules_goal: "Fülle jedes Feld mit einer Höhe von 1 bis N, sodass jede Zeile und jede Spalte jede Höhe genau einmal enthält (dieselbe Regel wie bei Sudokus Zeilen und Spalten, nur ohne die Box-Regel), und jeder am Gitter gezeigte Hinweis zur tatsächlichen Anzahl sichtbarer Gebäude von dieser Seite passt.",
    skyscrapers_term_input: "Höhen eingeben",
    skyscrapers_rules_input: "Wähle ein Feld und dann eine Höhe aus dem Ziffernblock unter dem Spielfeld (oder tippe eine Ziffer auf der Tastatur). Ein Feld mit gestricheltem Rand wiederholt gerade eine Höhe, die in seiner Zeile oder Spalte schon vorkommt - das ist der Hinweis, dass etwas geändert werden muss.",
    skyscrapers_term_difficulty: "Schwierigkeit",
    skyscrapers_rules_difficulty: "Leicht-, Mittel- und Schwer-Rätsel nutzen zunehmend größere Gitter (4x4, 5x5 und 6x6) mit zunehmend weniger aufgedeckten Randhinweisen - mehr Höhen, die gleichzeitig im Kopf jongliert werden müssen, aber durchgehend dieselben zwei Regeln.",
    skyscrapers_rules_example_title: "Ein durchgerechnetes Beispiel",
    skyscrapers_term_example: "Sichtbare Gebäude zählen",
    skyscrapers_rules_example_p1: "Nimm eine Zeile mit vier Gebäuden, Höhen 3, 1, 4, 2, von links nach rechts gelesen. Von links betrachtet: Die 3 ist zuerst sichtbar, da noch nichts Höheres davor kam. Die 1 ist niedriger als die bereits gesehene 3 und bleibt dahinter verborgen. Die 4 ist höher als alles davor und ist ebenfalls sichtbar. Die 2 ist niedriger als die 4 und bleibt verborgen.",
    skyscrapers_rules_example_p2: "Das sind 2 von links sichtbare Gebäude - die 3 und die 4 -, also passt ein linker Hinweis von 2 zu dieser Zeile. Betrachtet man dieselbe Zeile stattdessen von rechts (in Blickrichtung gelesen 2, 4, 1, 3): Die 2 ist zuerst sichtbar, die 4 ist höher und daher ebenfalls sichtbar, und sowohl die 1 als auch die 3 danach sind niedriger als die bereits gesehene 4 und daher nicht sichtbar - hier rein zufällig ebenfalls ein rechter Hinweis von 2, für diese bestimmte Zeile.",
    skyscrapers_rules_end_title: "Ein Rätsel abschließen",
    skyscrapers_term_win: "Gelöst",
    skyscrapers_rules_win: "Das Rätsel ist gelöst, sobald das Gitter vollständig ausgefüllt ist, jede Zeile und Spalte jede Höhe genau einmal enthält und jeder Hinweis am Rand zur tatsächlichen sichtbaren Anzahl seiner Zeile oder Spalte passt.",
    skyscrapers_history_title: "Die Geschichte von Skyscrapers",
    skyscrapers_history_origins_title: "Wurzeln in der Rätselzeitschriften-Kultur",
    skyscrapers_history_origins_p1: "Anders als Sudoku hat Skyscrapers keinen einzelnen, gut dokumentierten Erfinder oder ein Erstveröffentlichungsdatum, auf das sich Historiker einigen. Wie viele Logikrätsel-Gattungen scheint es sich allmählich durch die Rätselzeitschriften-Kultur verbreitet zu haben, statt einem einzelnen namentlich genannten Schöpfer zu einem bestimmten Zeitpunkt zugeschrieben zu werden - die Sichtbarkeits-Hinweis-Idee ist einfach genug, dass durchaus mehr als ein Rätselkonstrukteur unabhängig voneinander darauf gekommen sein könnte.",
    skyscrapers_history_origins_p2: "Sicher ist dagegen die Mathematik dahinter: Wie bei Sudoku ist ein gelöstes Skyscrapers-Gitter ein lateinisches Quadrat - ein Gitter, in dem jedes Symbol, hier eine Gebäudehöhe, genau einmal pro Zeile und Spalte vorkommt -, ein Objekt, das Leonhard Euler im 18. Jahrhundert untersuchte, lange bevor eines der beiden Rätsel existierte.",
    skyscrapers_history_spread_title: "Ein Wettbewerbsrätsel",
    skyscrapers_history_spread_p1: "Seine größte internationale Bekanntheit erlangte Skyscrapers durch das Wettkampf-Rätsellösen, insbesondere die World Puzzle Championship, einen jährlichen internationalen Rätselwettbewerb, der erstmals 1992 stattfand und bei dem es neben der Sudoku-Familie und anderen auf lateinischen Quadraten basierenden Rätseltypen zu den wiederkehrenden Standardgattungen zählt.",
    skyscrapers_history_spread_p2: "Dieser Wettbewerbsrahmen half dabei, Regeln und Darstellung des Rätsels in die heute gespielte Standardform zu bringen, auch ohne einen einzelnen namentlich genannten Erfinder - ganz so, wie mehrere wiederkehrende Rätselgattungen ihre endgültige Form weniger einem einzelnen Schöpfer verdanken als der wiederholten Verwendung in Rätselzeitschriften und Wettbewerbs-Rätselsätzen.",
    skyscrapers_history_modern_title: "Lateinische Quadrate, von außen betrachtet",
    skyscrapers_history_modern_p1: "Was Skyscrapers konzeptionell besonders macht, ist, wie es eine räumliche, visuelle Idee - entlang einer Reihe von Gebäuden zu blicken und zu zählen, wie viele hoch genug sind, um gesehen zu werden - über eine bereits aus Sudokus Zeilen und Spalten bekannte Logik legt. Genau diese Kombination gibt dem Rätsel auch seinen Namen und seine thematische Darstellung, anders als das schlichte Ziffern-Gitter, das ein Sudoku oder ein reines lateinisches-Quadrat-Rätsel bietet.",
    skyscrapers_history_modern_p2: "Es ist auch genau die Eigenschaft, auf die sich der Generator von PaperGames umgekehrt verlässt: Da ein Randhinweis eigentlich nur eine aus einem fertigen Gitter berechnete Tatsache ist, entsteht jedes Rätsel hier, indem zunächst ein vollständig gültiges Gitter aufgebaut, daraus jeder mögliche Hinweis berechnet und anschließend nur so viele dieser Hinweise behalten werden, wie das Gitter noch auf eine einzige eindeutige Lösung festlegen - derselbe Erzeugen-und-Reduzieren-Ansatz, den die Sudoku- und Kakuro-Generatoren dieser Sammlung nutzen, angepasst an eine andere Bedingung."
});
I18n.markTextLoaded("de");
