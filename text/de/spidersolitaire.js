// text/de/spidersolitaire.js
// Rules and history texts of spidersolitaire (de). Loaded by spidersolitaire-rules.html and spidersolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    spidersolitaire_rules_title: "Spider-Solitaire-Regeln",
    spidersolitaire_rules_intro: "Eine kurze Übersicht, wie PaperGames Spider Solitaire spielt - nützlich, wenn du aus der Übung bist oder es gerade lernst.",
    spidersolitaire_rules_basics_title: "Die Grundidee",
    spidersolitaire_term_layout: "Das Layout",
    spidersolitaire_rules_layout: "Zwei komplette Kartenspiele (104 Karten) werden auf 10 Tableau-Spalten verteilt - die ersten 4 Spalten bekommen je 6 Karten, die restlichen 6 je 5 Karten -, wobei nur die oberste Karte jeder Spalte offen liegt. Es gibt keine Ablagestapel. Die restlichen 50 Karten bilden den Talon, der später in Zehnerpaketen ausgeteilt wird.",
    spidersolitaire_term_difficulty: "Schwierigkeitsgrad wählen",
    spidersolitaire_rules_difficulty: "Wähle vor dem Start, wie viele Farben im Spiel sind: 1 Farbe ist am leichtesten (jede Karte des passenden Rangs kann jede Folge verlängern), 2 Farben sind mittel, und 4 Farben sind die traditionelle, schwerste Variante - genau wie zwei echte Kartenspiele zusammengemischt.",
    spidersolitaire_term_tableau: "Eine einzelne Karte bewegen",
    spidersolitaire_rules_tableau: "Eine Karte kann in einer Tableau-Spalte nur auf eine Karte gelegt werden, die genau einen Rang höher ist - die Farbe spielt dabei keine Rolle. Eine leere Spalte nimmt jede Karte oder jede gültige Folge an, ganz ohne Rangbeschränkung.",
    spidersolitaire_term_group: "Eine Kartengruppe bewegen",
    spidersolitaire_rules_group: "Mehrere bereits gestapelte Karten können nur als Einheit bewegt werden, wenn sie bereits in einer korrekt absteigenden Folge DERSELBEN Farbe liegen (zum Beispiel eine 5-4-3 in Herz, genau in dieser Reihenfolge) - eine Folge mit gemischten Farben ist nicht erlaubt, selbst wenn die Ränge korrekt absteigen. Beim Bewegen einer Gruppe gilt weiterhin die obige Regel „ein Rang höher“. Sobald Karten wegbewegt werden, wird die neu freigelegte oberste Karte ihrer Spalte automatisch aufgedeckt.",
    spidersolitaire_term_stock: "Der Talon",
    spidersolitaire_rules_stock: "Tippe auf den Talon, um das nächste Zehnerpaket auszuteilen - je eine offene Karte auf jede der 10 Spalten. Austeilen ist blockiert, solange eine Spalte leer ist - räume sie zuerst (indem du ihre Karten verschiebst oder eine Folge durch sie hindurch abschließt), bevor du wieder austeilen kannst.",
    spidersolitaire_term_sequences: "Eine Folge abschließen",
    spidersolitaire_rules_sequences: "Sobald eine vollständige Folge von König bis Ass, alle derselben Farbe und in Reihenfolge, zusammenhängend in einer Spalte liegt, wird sie automatisch erkannt und entfernt - sie muss dabei nicht die einzigen Karten in dieser Spalte sein, sie müssen nur genau an der Stelle richtig gestapelt sein, an der sie sich natürlich abheben ließen. Jede abgeschlossene Folge erhöht den Zähler über dem Spielfeld um eins.",
    spidersolitaire_rules_end_title: "Ein Spiel beenden",
    spidersolitaire_term_win: "Gewinnen",
    spidersolitaire_rules_win: "Das Spiel ist gewonnen, sobald alle 8 König-bis-Ass-Folgen zusammengesetzt und entfernt wurden - das sind 104 Karten / 13, unabhängig davon, welchen Farben-Schwierigkeitsgrad du gewählt hast.",
    spidersolitaire_history_title: "Die Geschichte von Spider Solitaire",
    spidersolitaire_history_origins_title: "Ein undokumentierter Favorit",
    spidersolitaire_history_origins_p1: "Anders als manche Kartenspiele mit einem nachweisbaren Erfinder ist der genaue Ursprung von Spider Solitaire nicht genau dokumentiert - wie viele Patience-Spiele entwickelte es sich durch verbreitetes Spielen, statt einer einzelnen Person oder einer einzigen Erstveröffentlichung zugeschrieben zu werden. Klar ist, dass es bis Anfang bis Mitte des 20. Jahrhunderts bereits ein etablierter Favorit unter den Zweispiel-Patience-Spielen war, lange bevor es Computer gab.",
    spidersolitaire_history_origins_p2: "Sein Name spielt fast sicher auf seinen eigenen Schwierigkeitsgrad und seine Struktur an, nicht auf irgendeine Spinnen-Bildsprache auf den Karten: acht ablagestapel-ähnliche Folgen, die aus zehn weitläufigen Tableau-Spalten zusammengewoben werden müssen (eine Anspielung auf die acht Beine einer Spinne), ganz ohne Farb- oder Ablagestapel-Hilfe, sobald vier Farben im Spiel sind.",
    spidersolitaire_history_spread_title: "Mit Windows verbreitet",
    spidersolitaire_history_spread_p1: "Der berühmteste Moment der Massenverbreitung von Spider Solitaire kam 1998, als Microsoft es als eingebautes Spiel in Windows bündelte - zuerst im Windows-98-Plus!-Paket und in der Windows-Me-Ära, dann ab Windows XP als Standardbestandteil.",
    spidersolitaire_history_spread_p2: "Diese eine Entscheidung brachte Spider einem riesigen, weltweiten Publikum nahe, genau wie Windows es zuvor mit Klondike (schlicht „Solitaire“ genannt) und später mit FreeCell getan hatte - und machte aus einem Kartenspiel, das jahrzehntelang still auf echten Kartentischen gelebt hatte, eine der meistgespielten Software der Welt, ganz ohne dass seine Spieler jemals ein echtes Kartenspiel besitzen mussten.",
    spidersolitaire_history_modern_title: "Diese Version",
    spidersolitaire_history_modern_p1: "PaperGames spielt die Standardregeln mit allen drei traditionellen Farben-Schwierigkeitsgraden von Anfang an wählbar - 1 Farbe, 2 Farben oder das volle 4-Farben-Spiel - im selben reibungsärmeren Ansatz mit einer wirklich neuen Mischung bei jeder Partie, den Klondike und FreeCell dieser Sammlung bereits verwenden, angepasst an Spiders eigenes Zehn-Spalten-Layout ohne Ablagestapel."
});
I18n.markTextLoaded("de");
