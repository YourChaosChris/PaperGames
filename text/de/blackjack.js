// text/de/blackjack.js
// Rules and history texts of blackjack (de). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    bj_rules_title: "Regeln: 17 und 4",
    bj_rules_intro: "Komm näher an 21 als die Bank, aber nicht darüber. Zwei Varianten, ein Spiel – gespielt mit Chips, die nur Punkte sind.",
    bj_rules_basics_title: "Die Regeln",
    bj_term_variants: "Zwei Varianten",
    bj_rules_variants: "17 und 4 wird mit 32 Karten (7 bis Ass) gespielt, Blackjack mit 52 Karten (2 bis Ass). Die Variante wählst du bei Neues Spiel.",
    bj_term_values17: "Kartenwerte bei 17 und 4",
    bj_rules_values17: "Ass (A) 11, König (K) 4, Dame (Q) 3, Bube (J) 2, die Zahlenkarten 7 bis 10 nach ihrem Wert. Zwei Asse als erste zwei Karten heißen „Feuer“ und sind die beste Hand.",
    bj_term_valuesbj: "Kartenwerte bei Blackjack",
    bj_rules_valuesbj: "Ass (A) 1 oder 11 (was für dich besser ist), König (K), Dame (Q) und Bube (J) 10, die Zahlenkarten nach ihrem Wert. Ass und eine Zehnerkarte als erste zwei Karten sind ein Blackjack.",
    bj_term_round: "Eine Runde",
    bj_rules_round: "Wähle deinen Einsatz: 5, 10 oder 20 Chips. Du bekommst zwei Karten, die Bank eine offene und eine verdeckte. Mit „Karte“ nimmst du weitere Karten, mit „Stehen“ hörst du auf. Kommst du über 21, hast du sofort verloren.",
    bj_term_bank: "Die Bank",
    bj_rules_bank: "Bleibst du stehen, deckt die Bank ihre Karte auf. Sie hält sich immer an dieselbe Regel: Sie zieht, solange sie 16 oder weniger hat, und bleibt ab 17 stehen. Kommt sie über 21, gewinnst du.",
    bj_term_result: "Wer gewinnt",
    bj_rules_result: "Wer näher an 21 ist, gewinnt. Du gewinnst so viele Chips, wie du gesetzt hast; ein Blackjack gewinnt das Anderthalbfache (abgerundet). Gleich viele Punkte: Bei 17 und 4 gewinnt die Bank, bei Blackjack behältst du deine Chips. Eine 21 mit zwei Karten (Blackjack) oder Feuer beendet die Runde sofort.",
    bj_term_double: "Verdoppeln (nur Blackjack)",
    bj_rules_double: "Mit deinen ersten zwei Karten darfst du verdoppeln: Dein Einsatz verdoppelt sich, du bekommst genau eine weitere Karte, und dann spielt die Bank. Dafür brauchst du genug Chips. Teilen und Versicherung gibt es nicht.",
    bj_term_chips: "Chips",
    bj_rules_chips: "Du beginnst mit 100 Chips. Sie sind nur Punkte im Spiel und lassen sich gegen nichts eintauschen. Hast du keine mehr, fängst du mit 100 neu an.",
    bj_rules_example_title: "Gleiche Karten, andere Punkte",
    bj_rules_example: "Ass und König: Bei Blackjack ergeben sie 21 – ein Blackjack. Bei 17 und 4 ergeben sie nur 15 (Ass 11, König 4).",
    bj_history_title: "Die Geschichte von 17 und 4",
    bj_history_origins_title: "Einundzwanzig",
    bj_history_origins_p1: "Kartenspiele, bei denen man 21 erreichen will, ohne darüber zu kommen, sind alt: Die erste schriftliche Erwähnung steht in einem Buch des spanischen Schriftstellers Miguel de Cervantes. 17 und 4 stammt aus dem 18. Jahrhundert und war in Frankreich am Hof von Ludwig XV. sehr beliebt. Das französische Vingt-et-un (21) stammt vom älteren Trente-et-un ab, bei dem 31 das Ziel war. Früher hieß das Spiel auf Deutsch auch Hopsen. Mit den Werten des 32er-Blatts ergeben 17 und ein König (4) genau 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "In den USA entwickelte sich eine amerikanische Form zu einem eigenen Spiel und bekam um 1899 den Namen Blackjack. Die oft erzählte Geschichte von einer Prämie für ein Ass mit einem schwarzen Buben ist nach dem Historiker Thierry Depaulis eine Legende. Ein Blackjack wird traditionell 3 zu 2 ausgezahlt, und bei gleich vielen Punkten bekommt man den Einsatz zurück.",
    bj_history_modern_title: "17 und 4 bei PaperGames",
    bj_history_modern_p1: "PaperGames spielt nur mit Chips: Sie sind einfach Punkte im Spiel und lassen sich gegen nichts eintauschen. Die Bank hält sich immer an dieselbe feste Regel, die Karten werden für jede Runde neu gemischt, und deine Punkte stehen immer da – die Karten unterscheiden sich durch gefüllte und hohle Farbzeichen, damit das Spiel auf Schwarz-Weiß-E-Ink funktioniert."
});
I18n.markTextLoaded("de");
