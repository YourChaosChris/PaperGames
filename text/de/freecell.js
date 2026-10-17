// text/de/freecell.js
// Rules and history texts of freecell (de). Loaded by freecell-rules.html and freecell-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    freecell_rules_title: "FreeCell-Regeln",
    freecell_rules_intro: "Eine kurze Übersicht darüber, wie PaperGames FreeCell spielt – nützlich, wenn man aus der Übung ist oder es gerade lernt.",
    freecell_rules_basics_title: "Die Grundidee",
    freecell_term_layout: "Das Layout",
    freecell_rules_layout: "Alle 52 Karten werden von Anfang an offen auf 8 Tableau-Spalten verteilt – vier Karten weniger als eine volle 7er-Reihe in den letzten vier Spalten. Vier Freizellen über den Spalten können jeweils genau eine Karte aufnehmen, und vier Basen (eine pro Farbe) werden vom Ass bis zum König aufgebaut.",
    freecell_term_tableau: "Karten bewegen",
    freecell_rules_tableau: "Eine Karte kann in einer Tableau-Spalte nur auf eine Karte gelegt werden, die genau einen Rang höher und von der anderen Farbe ist, oder auf eine leere Spalte. Eine bereits so absteigend und abwechselnd gestapelte Kartenfolge kann als ein \"Mehrfachzug\" gemeinsam bewegt werden, begrenzt durch die Anzahl verfügbarer Freizellen und leerer Spalten, über die sie weitergereicht werden könnten.",
    freecell_term_foundation: "Basen",
    freecell_rules_foundation: "Eine Basis nimmt nur ihre eigene Farbe an, beginnend beim Ass und aufsteigend um jeweils einen Rang. Einmal auf einer Basis, bleibt eine Karte dort – Basen nehmen nur Karten auf, sie geben sie nie zurück ins Tableau.",
    freecell_rules_end_title: "Eine Partie abschließen",
    freecell_term_win: "Gewinnen",
    freecell_rules_win: "Das Spiel ist gewonnen, sobald alle vier Basen vollständig sind, vom Ass bis zum König. Anders als beim Mahjong-Solitär-Blatt hier ist ein FreeCell-Blatt einfach nur gemischt – die überwältigende Mehrheit ist lösbar, genau wie im echten Spiel, aber PaperGames gibt für keine einzelne Runde eine besondere Garantie.",
    freecell_history_title: "Die Geschichte von FreeCell",
    freecell_history_origins_title: "Ein Kartenspiel mit offenen Informationen",
    freecell_history_origins_p1: "FreeCell stammt aus einer Familie \"offener\" Patience-Spiele im Stil von \"Baker's Game\", die mindestens bis ins frühe 20. Jahrhundert zurückreichen und bei denen von Anfang an jede Karte offen liegt – anders als bei den meisten Solitär-Spielen ist nie etwas verdeckt, sodass ein hinreichend geschickter Spieler (oder Computer) im Prinzip schon vor dem ersten Zug herausfinden kann, ob eine gegebene Runde gewinnbar ist.",
    freecell_history_origins_p2: "Die Einführung der Freizellen – kleiner Ablageflächen zum vorübergehenden Parken einzelner Karten – wird meist Paul Alfille zugeschrieben, der 1978 eine frühe digitale Version namens FreeCell für das PLATO-Computersystem schuf und damit das ältere offene Tableau-Format zum heute gespielten konkreten Regelwerk verfeinerte.",
    freecell_history_spread_title: "Mit Windows ausgeliefert",
    freecell_history_spread_p1: "FreeCell wurde zum Haushaltsnamen, nachdem Microsoft es ab 1995 zusammen mit Solitaire und Minesweeper in Windows integrierte und damit Hunderten Millionen PC-Nutzern zugänglich machte, die es zuvor nie gesehen hatten – ganz ähnlich wie Minesweepers eigener Weg zum Ruhm.",
    freecell_history_spread_p2: "Microsofts Version wurde mit einem festen Satz von 32.000 nummerierten Runden ausgeliefert statt jedes Mal frisch zufällig zu mischen, sodass Spieler sich austauschen und eine bestimmte Runde erneut spielen konnten – eine Konvention, der diese PaperGames-Version nicht folgt, sondern stattdessen jedes Mal eine wirklich frische Mischung erzeugt.",
    freecell_history_modern_title: "Die Runde, die (fast) immer gewinnt",
    freecell_history_modern_p1: "Weil von Anfang an jede Karte sichtbar ist, eignet sich FreeCell ungewöhnlich gut für Computeranalysen: Von Microsofts ursprünglichen 32.000 nummerierten Runden fanden erschöpfende Löser-Suchen, dass alle bis auf eine einzige – Runde Nummer 11.982 – lösbar sind, eine Trivia-Tatsache, die FreeCell-Fans Jahrzehnte später noch zitieren.",
    freecell_history_modern_p2: "Spätere Forschung trieb die Analyse weiter voran und bestätigte, dass unter der ersten Million nummerierter Runden nur eine Handvoll unlösbar ist – weshalb eine einfache Zufallsmischung, wie sie diese Version verwendet, ein so sicherer Griff ist: Die Chance, eine dieser seltenen Ausnahmen zu erwischen, ist verschwindend gering."
});
I18n.markTextLoaded("de");
