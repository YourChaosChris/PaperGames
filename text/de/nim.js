// text/de/nim.js
// Rules and history texts of nim (de). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    nim_rules_title: "Nim – Regeln",
    nim_rules_intro: "Zwei Spieler nehmen abwechselnd Steine von mehreren Haufen. Mit der normalen Regel gewinnt, wer den letzten Stein nimmt.",
    nim_rules_basics_title: "Die Regeln",
    nim_term_move: "Ein Zug",
    nim_rules_move: "Wähle eine Reihe und nimm so viele Steine daraus, wie du willst, mindestens einen. Tippe den Stein an, bis zu dem du nehmen willst: Er und alle Steine rechts davon bekommen ein Kreuz. Dann tippe auf „Steine nehmen“.",
    nim_term_end: "Das Ende",
    nim_rules_end: "Normal: Wer den letzten Stein nimmt, gewinnt. Misère: Wer den letzten Stein nimmt, verliert.",
    nim_term_heaps: "Haufen",
    nim_rules_heaps: "3, 4 und 5 Steine (Standard), die klassischen 1, 3, 5 und 7 oder zufällige Haufen (3 oder 4 Haufen mit 1 bis 7 Steinen).",
    nim_term_secret: "Die Gewinnregel",
    nim_rules_secret: "Schreibe jede Haufengröße als Binärzahl und addiere die Spalten ohne Übertrag (xor): Das Ergebnis ist die Nim-Summe. Ist sie 0, verliert der Spieler am Zug bei bestem Gegenspiel; sonst gibt es immer einen Zug, der sie zu 0 macht. Bei Misère spielt man genauso, bis nur noch Haufen mit einem Stein übrig blieben – dann lässt man eine ungerade Zahl davon übrig.",
    nim_term_computer: "Der Computer",
    nim_rules_computer: "Leicht spielt irgendeinen Zug, Mittel in der Hälfte der Fälle den besten Zug, Schwer immer den besten Zug. Aus einer Gewinnstellung ist Schwer nicht zu schlagen; deshalb sagt die Zeile unter den Haufen, ob der Start für den Beginnenden gewonnen oder verloren ist – wähle danach, wer beginnt.",
    nim_history_title: "Die Geschichte von Nim",
    nim_history_origins_title: "Steine wegnehmen",
    nim_history_origins_p1: "Spiele, bei denen man Gegenstände von Haufen wegnimmt, werden seit alter Zeit gespielt; woher Nim stammt, ist ungewiss. Oft wird es mit dem chinesischen Spiel jiǎn shízǐ („Steine aufheben“) in Verbindung gebracht, und die frühesten europäischen Erwähnungen stammen vom Anfang des 16. Jahrhunderts.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "1901 veröffentlichte Charles L. Bouton von der Harvard-Universität die vollständige Theorie des Spiels und gab ihm den Namen Nim. Den Namen erklärte er nie; oft wird er auf das deutsche Wort „nimm“ zurückgeführt.",
    nim_history_machines_title: "Nim-Maschinen",
    nim_history_machines_p1: "Nim war eines der ersten Spiele, die Maschinen spielten: das Nimatron auf der Weltausstellung in New York 1940 und ein Rechner von Ferranti, gezeigt auf dem Festival of Britain 1951."
});
I18n.markTextLoaded("de");
