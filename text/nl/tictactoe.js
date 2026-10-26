// text/nl/tictactoe.js
// Rules and history texts of tictactoe (nl). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.nl, {
    tictactoe_rules_title: "Regels van boter-kaas-en-eieren",
    tictactoe_rules_intro: "Een kort overzicht van hoe PaperGames boter-kaas-en-eieren speelt, ook bekend als tic-tac-toe.",
    tictactoe_rules_basics_title: "Het idee",
    tictactoe_term_board: "Het bord en de tekens",
    tictactoe_rules_board: "Het bord is een raster van 3x3 vakjes. Om de beurt zet je je teken in een leeg vakje: een kruis voor speler 1, een rondje voor speler 2. Speler 1 begint altijd. Een teken blijft tot het einde van de partij staan.",
    tictactoe_rules_end_title: "Hoe een partij eindigt",
    tictactoe_term_win: "Winnen",
    tictactoe_rules_win: "Wie als eerste drie eigen tekens op een rij heeft – horizontaal, verticaal of diagonaal – wint meteen. De winnende rij wordt zwart gevuld getoond.",
    tictactoe_term_draw: "Gelijkspel",
    tictactoe_rules_draw: "Zijn alle negen vakjes gevuld en heeft niemand drie op een rij, dan is het gelijkspel. Twee spelers die geen fouten maken spelen altijd gelijk – op het niveau Moeilijk verliest de computer daarom nooit, en meer dan gelijkspel zit er tegen hem niet in.",
    tictactoe_term_resignation: "Opgeven",
    tictactoe_rules_resignation: "Een speler kan op elk moment opgeven; de partij eindigt dan meteen in het voordeel van de tegenstander.",
    tictactoe_rules_hard_title: "Het niveau Moeilijk",
    tictactoe_rules_hard: "Op Moeilijk rekent de computer elke mogelijke voortzetting door en maakt nooit een fout. Voor het 3x3-bord is bewezen – door alle mogelijke partijen na te lopen – dat twee foutloze spelers altijd gelijkspelen. Tegen dit niveau zit er dus niet meer in dan gelijkspel; één fout en je verliest.",
    tictactoe_history_title: "De geschiedenis van boter-kaas-en-eieren",
    tictactoe_history_origins_title: "Drie steentjes in Rome",
    tictactoe_history_origins_p1: "Een vroege verwant werd in het Romeinse Rijk rond de eerste eeuw voor Christus gespeeld, waarschijnlijk onder de naam terni lapilli, 'telkens drie steentjes'. Elke speler had maar drie stukken; stonden ze allemaal op het bord, dan werden ze naar lege punten verschoven om verder te spelen.",
    tictactoe_history_origins_p2: "Op veel plekken in Rome zijn speelrasters van dit spel gevonden.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "Het spel heeft veel namen gehad. De Britse naam 'noughts and crosses' (nullen en kruisjes) stond rond het midden van de 19e eeuw al in druk, bijvoorbeeld in 1858 in het tijdschrift Notes and Queries.",
    tictactoe_history_spread_p2: "In de Verenigde Staten raakte in de 20e eeuw de naam tic-tac-toe ingeburgerd. Die gaat mogelijk terug op 'tick-tack', een oude vorm van backgammon die in Engeland al in de 16e eeuw bekend was.",
    tictactoe_history_modern_title: "Een van de eerste computerspellen",
    tictactoe_history_modern_p1: "In 1952 schreef A. S. (Sandy) Douglas aan de universiteit van Cambridge OXO voor de computer EDSAC, als onderdeel van zijn proefschrift over de wisselwerking tussen mens en computer. Je koos je vakje met een telefoonkiesschijf en de computer speelde foutloos. OXO geldt als een van de eerste bekende videospellen.",
    tictactoe_history_modern_p2: "Het spel is klein genoeg om volledig door te rekenen: op draaiingen en spiegelingen na zijn er 26.830 mogelijke partijen, en bij foutloos spel eindigt elke partij in gelijkspel. Precies dat doet het niveau Moeilijk hier: voor elke zet bekijkt het elk mogelijk vervolg."
});
I18n.markTextLoaded("nl");
