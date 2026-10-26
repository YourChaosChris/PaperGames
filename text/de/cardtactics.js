// text/de/cardtactics.js
// Rules and history texts of cardtactics (de). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    cardtactics_rules_title: "Kartentaktik-Regeln",
    cardtactics_rules_intro: "Eine kurze Übersicht, wie PaperGames diesen kartengesteuerten Wettlauf über das Brett spielt.",
    cardtactics_rules_basics_title: "Die Grundidee",
    cardtactics_term_setup: "Der Aufbau",
    cardtactics_rules_setup: "Das Brett hat 7 Reihen und 6 Spalten. Die sechs schwarzen Steine füllen die untere Reihe, die sechs weißen Steine die obere. Schwarz beginnt.",
    cardtactics_term_cards: "Zugkarten",
    cardtactics_rules_cards: "Es gibt zwölf Zugkarten, alle sind im Spiel. Drei liegen offen unter dem Brett und gehören beiden Spielern; die anderen neun warten in einer Warteschlange, die nächsten zwei werden angezeigt. Das Bild einer Karte zeigt, wohin ein Stein vom gestreiften Mittelfeld aus ziehen darf. Jeder Spieler benutzt eine Karte in seine eigene Richtung, deshalb zeigt die Seite die offenen Karten immer aus Sicht der Seite am Zug.",
    cardtactics_term_moving: "Einen Zug ausführen",
    cardtactics_rules_moving: "Wähle eine der drei offenen Karten, dann einen deiner Steine, dann ein Feld, das die Karte erlaubt. Du darfst auf ein leeres Feld ziehen oder auf einen gegnerischen Stein, der dann geschlagen ist. Eigene Steine versperren den Weg.",
    cardtactics_term_cycle: "Die Warteschlange",
    cardtactics_rules_cycle: "Die benutzte Karte kommt ans Ende der Warteschlange, und die erste Karte der Warteschlange nimmt ihren Platz bei den offenen Karten ein. So weißt du immer, welche Karte als Nächstes kommt.",
    cardtactics_term_opening: "Der erste Zug",
    cardtactics_rules_opening: "Der allererste Zug der Partie geht höchstens eine Reihe weit. Das gleicht den Vorteil des Beginnens aus.",
    cardtactics_term_pass: "Kein Zug möglich",
    cardtactics_rules_pass: "Kannst du nicht ziehen, setzt du aus, und die erste offene Karte kommt ans Ende der Warteschlange.",
    cardtactics_rules_end_title: "Das Spiel gewinnen",
    cardtactics_term_win: "Zwei Steine im Ziel",
    cardtactics_rules_win: "Ein Stein, der die hintere Reihe des Gegners (die Zielreihe) erreicht, ist durch: Er verlässt das Brett und ist im Ziel; ein gegnerischer Stein, der dort steht, ist geschlagen. Wer zuerst zwei Steine ins Ziel bringt, gewinnt. Du gewinnst auch, wenn die andere Seite auf dem Brett und im Ziel zusammen keine zwei Steine mehr hat.",
    cardtactics_term_limit: "Zuggrenze",
    cardtactics_rules_limit: "Nach 120 Zügen endet die Partie: Es gewinnt, wer mehr Steine im Ziel hat, dann, wer mehr Steine auf dem Brett hat; sonst ist es unentschieden.",
    cardtactics_history_title: "Die Geschichte von Kartentaktik",
    cardtactics_history_origins_title: "Wettläufe auf die andere Seite",
    cardtactics_history_origins_p1: "Die eigenen Figuren über das Brett auf die andere Seite zu bringen, ist ein altes Ziel von Brettspielen. Halma, 1883 oder 1884 von dem amerikanischen Chirurgen George Howard Monks erfunden, gewinnt, wer als Erster alle seine Figuren in das Lager in der gegenüberliegenden Ecke gebracht hat.",
    cardtactics_history_origins_p2: "In Halma und im Schach zieht jede Figur immer auf dieselbe Weise. In Kartentaktik hat ein Stein keine eigene Zugweise: Offene Karten bestimmen, welche Schritte möglich sind, und beide Spieler wählen aus denselben Karten.",
    cardtactics_history_version_title: "Diese Version",
    cardtactics_history_version_p1: "PaperGames hat die Regeln im Oktober 2026 neu geschrieben: ein Brett mit 7 Reihen und 6 Spalten, sechs gleiche Steine je Seite, eine gemeinsame Reihe aus drei offenen Karten mit einer Warteschlange dahinter und das Ziel, zwei Steine ins Ziel zu bringen. Die zwölf Karten und ihre Namen sind eigene Karten von PaperGames."
});
I18n.markTextLoaded("de");
