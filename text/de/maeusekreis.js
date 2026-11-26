// text/de/maeusekreis.js
// Rules and history texts of maeusekreis (de). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    maeusekreis_rules_title: "Regeln von Mäusekreis",
    maeusekreis_rules_intro: "Eine Katze und eine Maus auf einem Kreis aus Punkten. Die Maus läuft nur am Kreis entlang, die Katze darf auch die geraden Linien quer hindurch nehmen. Fängt die Katze die Maus, bevor ihre Schritte aufgebraucht sind?",
    maeusekreis_rules_basics_title: "Die Regeln",
    maeusekreis_term_board: "Das Brett",
    maeusekreis_rules_board: "Die Punkte liegen auf einem Kreis; jeder Punkt ist mit seinen zwei Nachbarn verbunden. Einige gestrichelte Linien gehen quer über den Kreis. Leicht hat 8 Punkte, Mittel 10 und Schwer 12. Katze und Maus beginnen auf zufälligen Punkten, mindestens drei Punkte voneinander entfernt.",
    maeusekreis_term_moves: "Ziehen",
    maeusekreis_rules_moves: "Die Maus zieht zuerst, dann die Katze, immer abwechselnd. In jedem Zug geht die Figur einen Schritt zu einem Nachbarpunkt; stehen bleiben gilt nicht. Die Maus nimmt nur den Kreis, die Katze den Kreis und die gestrichelten Linien. Die Maus darf nicht auf die Katze ziehen. Tippe einen markierten Punkt an, um dorthin zu ziehen.",
    maeusekreis_term_end: "Gefangen oder entkommen",
    maeusekreis_rules_end: "Tritt die Katze auf den Punkt der Maus, ist die Maus gefangen und die Katze gewinnt. Niemandem passiert etwas: das Spiel ist einfach zu Ende. Die Katze hat eine feste Zahl Schritte, sie steht über dem Brett. Hat sie alle gemacht und die Maus ist noch frei, ist die Maus entkommen und gewinnt.",
    maeusekreis_term_steps: "Wie viele Schritte",
    maeusekreis_rules_steps: "Die Zahl der Schritte wird für jeden Start ausgerechnet. Zu zweit und wenn du die Katze spielst, hat die Katze genau so viele Schritte, wie sie zum Fangen braucht – aber nur, wenn sie keinen verschenkt. Spielst du gegen den Computer die Maus, hat die Katze einen Schritt weniger; eine vorsichtige Maus kann also entkommen.",
    maeusekreis_term_computer: "Der Computer",
    maeusekreis_rules_computer: "Gegen den Computer wählst du Katze oder Maus. Leicht macht viele Fehler, Mittel wenige, Schwer keine. Der Tipp-Knopf zeigt den besten Schritt, und „Rückgängig“ nimmt deinen letzten Zug zurück.",
    maeusekreis_history_title: "Die Geschichte von Mäusekreis",
    maeusekreis_history_origins_title: "Alte Jagdspiele",
    maeusekreis_history_origins_p1: "Spiele, in denen eine Seite jagt und die andere entkommen will, kennt man aus vielen Ländern. In Europa wird „Fuchs und Gänse“ seit vielen Jahrhunderten auf einem Brett aus Linien und Punkten gespielt, und ähnliche Jagdspiele stammen aus Asien. Eine Seite ist stark, die andere hat die Zahl oder den Platz auf ihrer Seite.",
    maeusekreis_history_maths_title: "Eine Jagd auf Punkten und Linien",
    maeusekreis_history_maths_p1: "Seit dem Ende der 1970er Jahre untersuchen Mathematiker solche Jagden auf Netzen aus Punkten und Linien ganz allgemein: Auf welchen Netzen kann ein Jäger den Flüchtenden immer fangen? Das Spiel heißt dort oft „Räuber und Gendarm“. Auf einem bloßen Kreis entkommt der Flüchtende immer; Abkürzungen quer über den Kreis ändern das.",
    maeusekreis_history_here_title: "Mäusekreis hier",
    maeusekreis_history_here_p1: "Die Idee mit Katze und Maus auf einem Kreis kam von einer Spielerin. Die Regeln in PaperGames sind eigene: Die Maus bleibt am Kreis, die Katze darf abkürzen, und eine Suche durch alle Stellungen legt fest, wie viele Schritte die Katze hat."
});
I18n.markTextLoaded("de");
