// text/de/tictactoe.js
// Rules and history texts of tictactoe (de). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    tictactoe_rules_title: "Tic-Tac-Toe – Regeln",
    tictactoe_rules_intro: "Eine kurze Übersicht, wie PaperGames Tic-Tac-Toe spielt.",
    tictactoe_rules_basics_title: "Die Grundidee",
    tictactoe_term_board: "Spielfeld und Zeichen",
    tictactoe_rules_board: "Das Spielfeld ist ein 3x3-Raster aus neun Feldern. Abwechselnd setzt jeder sein Zeichen in ein freies Feld: ein Kreuz für Spieler 1, ein Kreis für Spieler 2. Spieler 1 beginnt immer. Ein Zeichen bleibt bis zum Ende der Partie stehen.",
    tictactoe_rules_end_title: "Wie eine Partie endet",
    tictactoe_term_win: "Gewinnen",
    tictactoe_rules_win: "Wer zuerst drei eigene Zeichen in einer Reihe hat – waagerecht, senkrecht oder diagonal –, gewinnt sofort. Die Gewinnreihe wird schwarz gefüllt angezeigt.",
    tictactoe_term_draw: "Unentschieden",
    tictactoe_rules_draw: "Sind alle neun Felder belegt und hat niemand drei in einer Reihe, endet die Partie unentschieden. Zwei Spieler ohne Fehler spielen immer unentschieden – auf der Stufe „Schwer“ verliert der Computer deshalb nie, mehr als ein Unentschieden ist gegen ihn nicht drin.",
    tictactoe_term_resignation: "Aufgeben",
    tictactoe_rules_resignation: "Jeder kann jederzeit aufgeben; die Partie endet dann sofort zugunsten des Gegners.",
    tictactoe_rules_hard_title: "Die Stufe Schwer",
    tictactoe_rules_hard: "Auf Schwer rechnet der Computer jede mögliche Fortsetzung durch und macht nie einen Fehler. Für das 3x3-Feld ist bewiesen – durch Durchrechnen aller möglichen Partien –, dass zwei fehlerfreie Spieler immer unentschieden spielen. Mehr als ein Unentschieden ist gegen diese Stufe also nicht zu holen; ein Fehler, und du verlierst.",
    tictactoe_history_title: "Die Geschichte von Tic-Tac-Toe",
    tictactoe_history_origins_title: "Drei Steinchen in Rom",
    tictactoe_history_origins_p1: "Ein früher Verwandter wurde im Römischen Reich um das erste Jahrhundert vor Christus gespielt, unter dem Namen terni lapilli, „je drei Steinchen“. Jeder hatte nur drei Steine; lagen alle auf dem Brett, wurden sie auf freie Punkte gezogen, damit das Spiel weiterging.",
    tictactoe_history_origins_p2: "Spielfelder dafür hat man an vielen Stellen in Rom gefunden.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "Das Spiel hat viele Namen. Der britische Name „noughts and crosses“ (Nullen und Kreuze) taucht 1858 zum ersten Mal gedruckt auf, in der Zeitschrift Notes and Queries.",
    tictactoe_history_spread_p2: "In den USA setzte sich im 20. Jahrhundert der Name tic-tac-toe durch. Er geht vielleicht auf „tick-tack“ zurück, eine alte Form des Backgammon, die schon 1558 beschrieben wurde.",
    tictactoe_history_modern_title: "Eines der ersten Computerspiele",
    tictactoe_history_modern_p1: "1952 schrieb A. S. (Sandy) Douglas an der Universität Cambridge das Programm OXO für den Rechner EDSAC, als Teil seiner Doktorarbeit darüber, wie Mensch und Computer miteinander umgehen. Man wählte sein Feld mit einer Telefon-Wählscheibe, und der Computer spielte fehlerfrei. OXO gilt als eines der ersten bekannten Videospiele.",
    tictactoe_history_modern_p2: "Das Spiel ist klein genug, um es vollständig durchzurechnen: Bis auf Drehungen und Spiegelungen gibt es 26.830 mögliche Partien, und bei fehlerfreiem Spiel endet jede unentschieden. Genau das macht die Stufe „Schwer“ hier – vor jedem Zug schaut sie sich jeden möglichen weiteren Verlauf an."
});
I18n.markTextLoaded("de");
