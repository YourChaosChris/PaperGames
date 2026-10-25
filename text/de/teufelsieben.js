// text/de/teufelsieben.js
// Rules and history texts of teufelsieben (de). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    ts_rules_title: "Regeln von Teuflische Sieben",
    ts_rules_intro: "Decke Karte um Karte auf und hör rechtzeitig auf: Eine Zahl, die du schon hast, lässt dich platzen. Erreicht jemand das Ziel, gewinnen die meisten Punkte.",
    ts_rules_basics_title: "Die Regeln",
    ts_term_cards: "Die Karten",
    ts_rules_cards: "90 Karten. Zahlenkarten 0 bis 12, jede Zahl so oft wie ihr Wert (zwölfmal die 12, einmal die 1 und einmal die 0): 79 Karten. Sonderkarten: Pause (2), Nachschlag (2), Rettungskarte (2), +3 (2), +5 (2) und Doppelt (1).",
    ts_term_turn: "Dein Zug",
    ts_rules_turn: "Zu Beginn einer Runde bekommt jeder eine Karte. Danach tippt reihum jeder, der noch in der Runde ist, auf „Karte aufdecken“ oder „Aufhören“. Wer aufhört, behält die Punkte der Runde.",
    ts_term_bust: "Platzen",
    ts_rules_bust: "Deckst du eine Zahl auf, die schon vor dir liegt, platzt du: keine Punkte in dieser Runde. Eine Rettungskarte schützt dich einmal: Die zweite Zahl wird weggelegt und die Rettungskarte ist verbraucht.",
    ts_term_seven: "Sieben Zahlen",
    ts_rules_seven: "Wer sieben verschiedene Zahlen vor sich liegen hat, beendet die Runde sofort und bekommt 20 Extrapunkte.",
    ts_term_special: "Sonderkarten",
    ts_rules_special: "Pause: Du wählst einen Spieler, der noch in der Runde ist (auch dich selbst); er muss jetzt aufhören und behält seine Punkte. Nachschlag: Du wählst einen Spieler, der noch in der Runde ist; er muss drei Karten nacheinander aufdecken. Eine Pause oder ein Nachschlag, die während eines Nachschlags kommen, haben keine Wirkung. +3 und +5 bringen Punkte dazu, Doppelt verdoppelt die Summe deiner Zahlen.",
    ts_term_points: "Punkte und Spielende",
    ts_rules_points: "Rundenpunkte: die Summe deiner Zahlen (mit Doppelt verdoppelt), dazu +3 und +5, dazu 20 für sieben Zahlen. Die Runde endet, wenn niemand mehr in ihr ist. Nach der Runde, in der jemand das Ziel erreicht (100, 150 oder 200 Punkte, vor dem Spiel gewählt), endet das Spiel: Die meisten Punkte gewinnen, bei Gleichstand gewinnen alle mit den meisten Punkten gemeinsam.",
    ts_term_computer: "Der Computer",
    ts_rules_computer: "Der Computer hört auf, wenn die Gefahr zu platzen mit der nächsten Karte für seine Stufe zu groß ist. Er zählt nur die offen liegenden Karten und schaut nie auf verdeckte Karten. Leicht hört früh auf, Schwer wagt mehr.",
    ts_rules_example_title: "Beispiel",
    ts_rules_example: "Du hast 5, 9 und 2: 16 Punkte. Unter den noch nicht gesehenen Karten sind vier 5en, acht 9en und eine 2, mit denen du platzen würdest. Hörst du auf, behältst du 16 Punkte; deckst du eine 9 auf, bekommst du in dieser Runde nichts.",
    ts_history_title: "Über Teuflische Sieben",
    ts_history_family_title: "Weitermachen oder aufhören",
    ts_history_family_p1: "Spiele, in denen man immer wieder entscheidet, ob man noch etwas wagt oder behält, was man hat, nennt man im Englischen „push your luck“. Viele Würfel- und Kartenspiele funktionieren so.",
    ts_history_modern_title: "Diese Fassung",
    ts_history_modern_p1: "Teuflische Sieben wurde für PaperGames gemacht, mit eigenen Karten, Namen und Texten: den Sonderkarten Pause, Nachschlag, Rettungskarte, +3, +5 und Doppelt und 20 Extrapunkten für sieben verschiedene Zahlen."
});
I18n.markTextLoaded("de");
