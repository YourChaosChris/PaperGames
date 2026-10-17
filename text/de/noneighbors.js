// text/de/noneighbors.js
// Rules and history texts of noneighbors (de). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    sudoku_rules_basics_title: "Die Grundidee",
    sudoku_term_goal: "Das Ziel",
    sudoku_term_input: "Zahlen eingeben",
    sudoku_rules_end_title: "Ein Rätsel abschließen",
    sudoku_term_win: "Gelöst",
    sudoku_term_difficulty: "Schwierigkeitsgrad",
    puzzle_rules_hint: "Der Knopf „Tipp“ hilft in drei Stufen. Der erste Druck markiert, wo der nächste Schritt liegt. Der zweite nennt den Grund, also die Regel, die dort greift. Der dritte führt den Schritt aus (trägt die Zahl ein oder baut die Brücke). Der Tipp arbeitet mit deinem aktuellen Stand: Steht irgendwo eine falsche Zahl oder Brücke, sagt er dir das zuerst. Er rät nie – geht es nur mit Ausprobieren weiter, sagt er das ehrlich. Tipps sind unbegrenzt. Ein Rätsel, das du mit Tipps löst, zählt ganz normal als Sieg; die Statistik zeigt zusätzlich, wie viele Siege mit Tipps waren.",
    numberblocks_rules_title: "Keine Nachbarn-Regeln",
    numberblocks_rules_intro: "Eine kurze Übersicht, wie PaperGames Keine Nachbarn spielt – praktisch zum Auffrischen oder Lernen.",
    numberblocks_term_board: "Das Gitter",
    numberblocks_rules_board: "Dicke Linien teilen das Gitter in Blöcke aus einem bis fünf Feldern. Einige Felder sind von Anfang an ausgefüllt (fett) und lassen sich nicht ändern.",
    numberblocks_rules_goal: "Fülle jedes leere Feld so aus, dass ein Block aus n Feldern die Ziffern 1 bis n genau einmal enthält – ein Block aus drei Feldern enthält 1, 2 und 3. Jedes Rätsel, das PaperGames erzeugt, hat genau eine Lösung.",
    numberblocks_term_regions: "Die Berührungsregel",
    numberblocks_rules_regions: "Zwei gleiche Ziffern dürfen sich nie berühren – nicht nebeneinander, nicht übereinander und nicht über Eck. Keines der bis zu acht Felder rund um eine Ziffer darf dieselbe Ziffer enthalten, auch wenn es zu einem anderen Block gehört.",
    numberblocks_rules_input: "Wähle ein Feld und dann eine Zahl aus der Leiste unter dem Spielfeld (oder tippe eine Ziffer auf der Tastatur). Wiederholt sich eine Ziffer in ihrem Block, ist sie zu groß für ihren Block oder berührt sie dieselbe Ziffer, zeigen alle beteiligten Felder ihre Ziffer weiß auf schwarz.",
    numberblocks_rules_difficulty: "Leichte Rätsel haben ein 6x6-Gitter, mittlere 7x7 und schwere 8x8, mit jeder Stufe weniger vorgegebenen Ziffern.",
    numberblocks_rules_win: "Das Rätsel ist gelöst, sobald jedes Feld ausgefüllt ist und weder die Blockregel noch die Berührungsregel verletzt wird.",
    numberblocks_history_title: "Die Geschichte der Keine Nachbarn",
    numberblocks_history_origins_title: "Das Rätsel eines Erfinders",
    numberblocks_history_origins_p1: "Die Keine Nachbarn hat der japanische Rätselautor Naoki Inaba erfunden und 2001 veröffentlicht. Inaba hat sehr viele Logikrätsel geschaffen, oft auf einer einzigen klaren Regel aufgebaut, die zu überraschend tiefem Nachdenken führt.",
    numberblocks_history_origins_p2: "Das Rätsel verbindet zwei bekannte Ideen: Bereiche, die jeweils eine feste Menge von Ziffern enthalten müssen, wie die Blöcke beim Sudoku, und eine Nachbarschaftsregel nach dem Vorbild des Königs im Schach – eine Ziffer darf sich nirgends wiederholen, wohin ein König ziehen könnte.",
    numberblocks_history_names_title: "Unter anderen Namen",
    numberblocks_history_names_p1: "International ist das Rätsel auch als Suguru oder Tectonic bekannt; diese Namen bezeichnen dieselben Bereichs- und Nachbarschaftsregeln.",
    numberblocks_history_names_p2: "Jedes Rätsel hier entsteht frisch auf deinem Gerät: Blöcke und eine gültige Lösung werden Feld für Feld gemeinsam aufgebaut, dann werden Ziffern eine nach der anderen entfernt, solange ein eingebauter Löser noch genau eine Lösung findet."
});
I18n.markTextLoaded("de");
