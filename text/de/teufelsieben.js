// text/de/teufelsieben.js
// Rules and history texts of teufelsieben (de). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    ts_rules_title: "Regeln von Teuflische Sieben",
    ts_rules_intro: "Decke Karte um Karte auf und hör rechtzeitig auf: Eine Zahl, die du schon hast, lässt dich platzen. Erreicht jemand das Ziel, gewinnen die meisten Punkte.",
    ts_rules_basics_title: "Die Regeln",
    ts_term_cards: "Die Karten",
    ts_rules_cards: "60 Karten. Zahlen von 1 bis 10: drei 1er, vier 2er, fünf 3er, je sechs 4er, 5er, 6er und 7er, fünf 8er, vier 9er und drei 10er. Je zwei Mut, Streichen, Weitergabe, Brücke, Sammler und Blick.",
    ts_term_turn: "Dein Zug",
    ts_rules_turn: "Jeder hat pro Runde genau einen ganzen Zug. Decke Karte um Karte auf; nach der ersten Karte darfst du jederzeit aufhören. Wenn alle dran waren, endet die Runde. Der Startspieler rückt jede Runde einen Platz weiter.",
    ts_term_bust: "Platzen",
    ts_rules_bust: "Eine Zahl, die du schon hast, lässt dich platzen: null Punkte in dieser Runde. Mut rettet dich einmal; die doppelte Zahl und Mut werden abgelegt. Jeder benutzte Mut kostet am Rundenende 5 Punkte.",
    ts_term_run: "Reihen",
    ts_rules_run: "Die längste Reihe aufeinanderfolgender Zahlen ab Länge 4 gibt 5 × (Länge − 2): vier in Folge geben 10, fünf geben 15. Jede Brücke füllt eine fehlende Zahl.",
    ts_term_extreme: "Wilde Kette",
    ts_rules_extreme: "Vor dem Spiel kannst du die Karten „Wilde Kette“ wählen: Dann kommen 12 Karten dazu, 72 insgesamt – die Zahlen 11, 12, 13 und 14 (je 2 Karten), Kettenglied (2 Karten, +2 Punkte für jede Zahl deiner längsten Reihe ab 2 Zahlen, mit zwei Kettengliedern +4) und Spiegel (2 Karten: aus deiner letzten Zahl n wird 15 − n, es tauschen also 1 und 14, 2 und 13 … 7 und 8; hast du diese Zahl schon oder noch keine Zahl, passiert nichts). Reihen gehen dann bis 14. Gespielt wird bis 250 oder 500 Punkte.",
    ts_term_special: "Sonderkarten",
    ts_rules_special: "Mut rettet einmal vor dem Platzen und kostet bei Benutzung 5 Punkte. Streichen entfernt deine zuletzt aufgedeckte Zahl. Weitergabe lässt den nächsten Spieler seinen Zug mit einer aufgedeckten Karte beginnen. Brücke füllt eine Lücke. Sammler gibt 1 Punkt je Zahlenkarte. Blick zeigt die nächste Karte des Stapels.",
    ts_term_points: "Punkte und Spielende",
    ts_rules_points: "Rundenpunkte sind die Summe deiner Zahlen plus Reihenbonus plus 1 je Zahlenkarte pro Sammler minus 5 je benutztem Mut (nie unter null). Das Ziel sind 60, 90 oder 120 Punkte; Standard sind 90. Nach der Runde, in der jemand das Ziel erreicht, gewinnen die meisten Punkte; bei Gleichstand gewinnen alle Besten.",
    ts_term_computer: "Der Computer",
    ts_rules_computer: "Der Computer zählt nur offene Karten oder eine mit Blick gezeigte Karte. Leicht hört früh auf; Schwer wägt Gewinn gegen Risiko ab.",
    ts_rules_example_title: "Beispiel",
    ts_rules_example: "Du hast 3, 4, 5, 6 und 9: 27 Punkte aus Zahlen. Die Reihe aus vier Zahlen gibt 10 dazu, also 37 Punkte vor Effekten der Sonderkarten.",
    ts_history_title: "Über Teuflische Sieben",
    ts_history_family_title: "Weitermachen oder aufhören",
    ts_history_family_p1: "Spiele, bei denen man immer wieder entscheidet, ob man noch etwas wagt oder behält, was man hat, gehören zur Familie der Risiko-Spiele. Viele Würfel- und Kartenspiele funktionieren so.",
    ts_history_modern_title: "Diese Fassung",
    ts_history_modern_p1: "Teuflische Sieben wurde für PaperGames gemacht, mit eigenen Karten, Regeln und Texten: Zahlen von 1 bis 10 in eigener Mischung, ein Bonus für Zahlen in einer Reihe und die Sonderkarten Mut, Streichen, Weitergabe, Brücke, Sammler und Blick.",
});
I18n.markTextLoaded("de");
