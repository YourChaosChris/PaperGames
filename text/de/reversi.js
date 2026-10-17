// text/de/reversi.js
// Rules and history texts of reversi (de). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.de, {
    reversi_rules_title: "Reversi-Regeln",
    reversi_rules_intro: "Eine kurze Übersicht, wie PaperGames Reversi spielt – nützlich zum Auffrischen oder Lernen.",
    reversi_rules_basics_title: "Die Grundidee",
    reversi_term_discs: "Steine und der Start",
    reversi_rules_discs: "Reversi wird auf einem 8x8-Brett gespielt. Zu Beginn stehen je zwei Steine jeder Farbe diagonal in den vier mittleren Feldern. Schwarz beginnt immer.",
    reversi_term_flanking: "Einschließen",
    reversi_rules_flanking: "Ein Zug setzt einen Stein auf ein freies Feld, sodass er – zusammen mit einem anderen eigenen Stein – eine oder mehrere gegnerische Steine in gerader Linie (waagerecht, senkrecht oder diagonal) einschließt. Jeder eingeschlossene Stein wird sofort auf die eigene Farbe gedreht.",
    reversi_rules_pass_title: "Wenn du nicht ziehen kannst",
    reversi_term_pass: "Kein legaler Zug",
    reversi_rules_pass: "Hast du keinen legalen Zug, wird dein Zug automatisch übersprungen und der Gegner ist wieder am Zug – freiwillig passen, obwohl ein legaler Zug möglich wäre, geht nicht. Hat keiner der beiden Spieler einen legalen Zug, endet die Partie sofort.",
    reversi_rules_end_title: "Wie eine Partie endet",
    reversi_term_win: "Gewinnen",
    reversi_rules_win: "Die Partie endet, sobald keiner der Spieler einen legalen Zug hat (meist weil das Brett voll ist). Wer mehr Steine auf dem Brett hat, gewinnt; bei Gleichstand ist es remis.",
    reversi_term_resignation: "Aufgabe",
    reversi_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",
    reversi_history_title: "Die Geschichte von Reversi",
    reversi_history_origins_title: "Ein viktorianisches Original",
    reversi_history_origins_p1: "Reversi tauchte erstmals Anfang der 1880er Jahre in England auf, im Zuge eines eigentümlich viktorianischen Streits: Zwei Spieler, Lewis Waterman und John W. Mollett, beanspruchten beide für sich, das Spiel erfunden zu haben, und veröffentlichten 1888 jeweils eigene Streitschriften, in denen sie dem anderen vorwarfen, die Idee gestohlen zu haben. Wer tatsächlich die Ehre verdient, ist unter Historikern bis heute umstritten.",
    reversi_history_origins_p2: "Beim frühen Reversi durften die ersten Steine noch frei irgendwo auf dem Brett platziert werden, und manche viktorianischen Regelwerke ließen eine vollständig eingeschlossene Seite mit einem einzigen Zug die Kontrolle über das ganze Brett verlieren – Eigenheiten, die mit der Zeit aus den standardisierten Regeln verschwanden.",
    reversi_history_spread_title: "Neu erfunden in Japan",
    reversi_history_spread_p1: "Das Spiel tauchte 1973 in Japan wieder auf, als Goro Hasegawa die Regeln von Reversi verfeinerte – er legte die vier Startsteine auf das bekannte diagonale Muster fest und strich die älteren Variantenregeln – und es über Tsukuda Original unter einem neuen Namen veröffentlichte: Othello, eine Anspielung auf Shakespeares gleichnamiges Drama und dessen zentralen Schwarz-gegen-Weiß-Konflikt.",
    reversi_history_spread_p2: "Othello wurde in Japan und bald weltweit enorm populär, brachte eine seit 1977 jährlich ausgetragene Othello-Weltmeisterschaft hervor und etablierte das standardisierte Regelwerk – dasselbe, das auch diese App verwendet – als die heute im Wettkampf gespielte Version.",
    reversi_history_modern_title: "Ein Schlachtfeld für Computer",
    reversi_history_modern_p1: "Othello erwies sich als ungewöhnlich ergiebiges Feld für die Computerspiel-Forschung: Die Regeln sind einfach, doch die schiere Zahl erreichbarer Stellungen ließ naive Strategien lange scheitern.",
    reversi_history_modern_p2: "Im August 1997 besiegte Michael Buros Programm Logistello den amtierenden menschlichen Weltmeister Takeshi Murakami mit 6:0 – ein historisches Ergebnis, das im selben Jahr wie Deep Blues Sieg im Schach fiel. Othello-Engines sind seitdem nur noch stärker geworden, und das Spiel gilt für einen weiten Bereich von Stellungen inzwischen als gelöst oder nahezu gelöst.",
    reversi_history_names_title: "Warum Reversi",
    reversi_history_names_p1: "Reversi selbst stammt aus dem 19. Jahrhundert und ist gemeinfrei. Othello ist eine eingetragene Marke. PaperGames steht in keiner Verbindung zu den Inhabern dieser Marke und verwendet deshalb den älteren Namen Reversi."
});
I18n.markTextLoaded("de");
