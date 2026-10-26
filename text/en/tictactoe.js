// text/en/tictactoe.js
// Rules and history texts of tictactoe (en). Loaded by tictactoe-rules.html and tictactoe-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    tictactoe_rules_title: "Tic-Tac-Toe Rules",
    tictactoe_rules_intro: "A quick reference for how PaperGames plays Tic-Tac-Toe, also known as Noughts and Crosses.",
    tictactoe_rules_basics_title: "The basic idea",
    tictactoe_term_board: "The board and marks",
    tictactoe_rules_board: "The board is a 3x3 grid of nine cells. Players take turns putting their mark in an empty cell: a cross for Player 1, a circle for Player 2. Player 1 always moves first. A mark stays where it is for the rest of the game.",
    tictactoe_rules_end_title: "How a game ends",
    tictactoe_term_win: "Winning",
    tictactoe_rules_win: "The first player to get three of their own marks in a row - across, down or diagonally - wins at once. The winning line is shown in solid black.",
    tictactoe_term_draw: "Draw",
    tictactoe_rules_draw: "If all nine cells are filled and nobody has three in a row, the game is a draw. Two players who make no mistakes always draw - so on the Hard level the computer never loses, and the best you can get against it is a draw.",
    tictactoe_term_resignation: "Resignation",
    tictactoe_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    tictactoe_rules_hard_title: "The Hard level",
    tictactoe_rules_hard: "On Hard the computer works through every possible continuation and never makes a mistake. For the 3x3 board it has been proven by checking every possible game that two flawless players always draw, so a draw is the best you can get against it - one mistake and you lose.",
    tictactoe_history_title: "The History of Tic-Tac-Toe",
    tictactoe_history_origins_title: "Three Pebbles in Rome",
    tictactoe_history_origins_p1: "An early relative was played in the Roman Empire around the first century BC, probably under the name terni lapilli, \"three pebbles at a time\". Each player had only three pieces, so once they were all on the board, they were moved to empty points to keep the game going.",
    tictactoe_history_origins_p2: "Grid markings for the game have been found in many places around Rome.",
    tictactoe_history_spread_title: "Noughts and Crosses, Tic-Tac-Toe",
    tictactoe_history_spread_p1: "The game has gone by many names. The British name \"noughts and crosses\" was already in print by the middle of the 19th century, for example in the journal Notes and Queries in 1858.",
    tictactoe_history_spread_p2: "In the United States it came to be called tic-tac-toe during the 20th century. The name may go back to \"tick-tack\", an old form of backgammon known in England since the 16th century.",
    tictactoe_history_modern_title: "One of the First Computer Games",
    tictactoe_history_modern_p1: "In 1952 A. S. (Sandy) Douglas wrote OXO for the EDSAC computer at the University of Cambridge, as part of his doctoral thesis on how people and computers interact. Players picked their square with a rotary telephone dial, and the computer played a perfect game. OXO counts among the first known video games.",
    tictactoe_history_modern_p2: "The game is small enough to be worked out completely: up to rotations and reflections there are 26,830 possible games, and with perfect play every game ends in a draw. The Hard level here does exactly that - before each move it looks at every possible way the game can go on."
});
I18n.markTextLoaded("en");
