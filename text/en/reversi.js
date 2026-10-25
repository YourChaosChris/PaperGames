// text/en/reversi.js
// Rules and history texts of reversi (en). Loaded by reversi-rules.html and reversi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    reversi_rules_title: "Reversi Rules",
    reversi_rules_intro: "A quick reference for how PaperGames plays Reversi - useful if you're rusty, or learning.",
    reversi_rules_basics_title: "The basic idea",
    reversi_term_discs: "Discs and the start",
    reversi_rules_discs: "Reversi is played on an 8x8 board. The game starts with two discs of each color placed diagonally in the four center squares. Black always moves first.",
    reversi_term_flanking: "Flanking",
    reversi_rules_flanking: "A move places a disc on an empty square so that it flanks - traps between your new disc and another disc of yours - one or more opponent discs in a straight line (horizontally, vertically, or diagonally). Every flanked disc flips to your color immediately.",
    reversi_rules_pass_title: "When you can't move",
    reversi_term_pass: "No legal move",
    reversi_rules_pass: "If you have no legal move, your turn is skipped automatically and play passes back to your opponent - there's no way to voluntarily pass while a legal move exists. If neither player has a legal move, the game ends immediately.",
    reversi_rules_end_title: "How a game ends",
    reversi_term_win: "Winning",
    reversi_rules_win: "The game ends the moment neither player has a legal move (usually because the board is full). Whoever has more discs on the board wins; an equal split is a draw.",
    reversi_term_resignation: "Resignation",
    reversi_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    reversi_history_title: "The History of Reversi",
    reversi_history_origins_title: "A Victorian Original",
    reversi_history_origins_p1: "Reversi first appeared in England in the early 1880s, amid a peculiarly Victorian dispute: two Englishmen, Lewis Waterman and John W. Mollett, each claimed to have invented the game, and each denounced the other as a fraud. Who actually deserves the credit has never been settled.",
    reversi_history_origins_p2: "Early Reversi began on an empty board: the players placed the first four discs themselves, one at a time, on the four center squares - a freedom that Othello later replaced with a fixed starting position.",
    reversi_history_spread_title: "Reinvented in Japan",
    reversi_history_spread_p1: "In Japan the game took on a new life in the early 1970s through Goro Hasegawa, who presented it as his own invention, with the four starting discs fixed in their familiar diagonal pattern. Tsukuda Original released it in 1973 under a new name: Othello, a nod to Shakespeare's play and its black-versus-white central conflict.",
    reversi_history_spread_p2: "Othello became hugely popular in Japan and then worldwide, spawning a World Othello Championship held annually since 1977 and cementing the standardized ruleset - the one used in this app - as the version played competitively today.",
    reversi_history_modern_title: "A Battleground for Computers",
    reversi_history_modern_p1: "Othello turned out to be an unusually good subject for computer game-playing research: its rules are simple, but the sheer number of reachable positions long kept naive strategies from working well.",
    reversi_history_modern_p2: "In August 1997, Michael Buro's program Logistello defeated reigning human world champion Takeshi Murakami 6 games to 0 - a landmark result that arrived the same year as chess's Deep Blue victory. Othello engines have only grown stronger since, and the game is now considered solved, or very nearly so, from a wide range of positions.",
    reversi_history_names_title: "Why Reversi",
    reversi_history_names_p1: "Reversi itself dates from the 19th century and is in the public domain. Othello is a registered trademark. PaperGames is not affiliated with the owners of this trademark and therefore uses the older name, Reversi."
});
I18n.markTextLoaded("en");
