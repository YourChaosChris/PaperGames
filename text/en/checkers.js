// text/en/checkers.js
// Rules and history texts of checkers (en). Loaded by checkers-rules.html and checkers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    checkers_rules_title: "Checkers Rules",
    checkers_rules_intro: "A quick reference for how PaperGames plays checkers (English draughts) - useful if you're rusty, or learning.",
    checkers_rules_basics_title: "The basic idea",
    checkers_term_men: "Men",
    checkers_rules_men: "Black and White each start with 12 men on the dark squares of their own three back rows, and move diagonally forward one square at a time, alternating turns, Black first.",
    checkers_term_kings: "Kings",
    checkers_rules_kings: "A man reaching the far back row becomes a king. Kings move diagonally in any direction, still one square at a time.",
    checkers_rules_capture_title: "Capturing",
    checkers_term_capture: "Capturing",
    checkers_rules_capture: "Capture by jumping diagonally over an adjacent enemy piece into the empty square immediately beyond it, removing the jumped piece.",
    checkers_term_mandatory: "Mandatory capture",
    checkers_rules_mandatory: "If any capture is available, you must take one - a quiet move is illegal while a capture exists. You may choose which piece captures if more than one can.",
    checkers_term_multijump: "Multi-jump chains",
    checkers_rules_multijump: "If capturing lands you where another capture is immediately available with the same piece, you must continue jumping with it until no further capture is possible. Landing on the back row promotes the piece and ends its turn immediately, even mid-chain.",
    checkers_rules_end_title: "How a game ends",
    checkers_term_win: "Winning",
    checkers_rules_win: "You win when your opponent has no pieces left, or no legal move available on their turn.",
    checkers_term_resignation: "Resignation",
    checkers_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    checkers_term_draw: "Draw",
    checkers_rules_draw: "If 40 moves pass in a row with no capture by either side, the game is a draw.",
    checkers_history_title: "The History of Checkers",
    checkers_history_origins_title: "An Ancient Board, a Medieval Game",
    checkers_history_origins_p1: "Checkers' board and starting layout trace back to Alquerque, a capturing game played on a 5x5 lined board known in Egypt and the Middle East for over 3,000 years, and later popular in Moorish Spain.",
    checkers_history_origins_p2: "Around the 12th century in southern France, someone combined Alquerque's diagonal captures with a chessboard, creating \"Fierges\" or \"Jeu de Dames\" - the direct ancestor of the game played today.",
    checkers_history_spread_title: "From France to the World",
    checkers_history_spread_p1: "The game spread through Europe under many names - draughts in England, dama in Spain, dame in Germany - and crossed the Atlantic with colonists, becoming especially popular in the United States, where the 8x8 board and mandatory-capture rules used in this app (American checkers) took hold.",
    checkers_history_spread_p2: "National and world championships have been held since the 19th century, with organized competitive play in Britain, the US and beyond producing generations of celebrated players and deeply studied openings.",
    checkers_history_modern_title: "A Game Solved",
    checkers_history_modern_p1: "Checkers holds a unique place in game theory: in 2007, after nearly two decades of computation, Jonathan Schaeffer's program Chinook proved that checkers is a draw with perfect play by both sides - the most complex game solved this thoroughly at the time.",
    checkers_history_modern_p2: "That doesn't make checkers any less fun to play - like a solved endgame in chess, knowing the theoretical result changes nothing about the skill needed to navigate a real game over the board."
});
I18n.markTextLoaded("en");
