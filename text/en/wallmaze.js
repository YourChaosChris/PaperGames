// text/en/wallmaze.js
// Rules and history texts of wallmaze (en). Loaded by wallmaze-rules.html and wallmaze-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    wallmaze_rules_title: "Wall Maze Rules",
    wallmaze_rules_intro: "A quick reference for how PaperGames plays Wall Maze - useful if you're rusty, or learning.",
    wallmaze_rules_basics_title: "The basic idea",
    wallmaze_term_setup: "The setup",
    wallmaze_rules_setup: "Each player has one pawn, starting in the middle of their own edge of a 9x9 board, and ten walls in reserve. Player 1 aims for the far row at the bottom, Player 2 for the far row at the top - whoever gets their pawn there first wins.",
    wallmaze_term_moving: "Moving your pawn",
    wallmaze_rules_moving: "On your turn, either move your pawn one square up, down, left, or right, or place a wall. If the two pawns are adjacent, you may jump straight over the other pawn; if a wall or the edge of the board blocks that jump, you may instead step diagonally around it.",
    wallmaze_term_walls: "Placing walls",
    wallmaze_rules_walls: "A wall is two squares long and blocks movement straight across it, for both players. Walls may never overlap or cross another wall, and a wall can never be placed if it would seal off either player's last remaining path to their goal row - there's always at least one way through.",
    wallmaze_rules_end_title: "Winning the game",
    wallmaze_term_win: "How the game ends",
    wallmaze_rules_win: "The moment a player's pawn reaches any square on their goal row, they win - it doesn't matter which column.",
    wallmaze_history_title: "The History of Wall Maze",
    wallmaze_history_origins_title: "A 1990s Design",
    wallmaze_history_origins_p1: "Quoridor was designed by Mirko Marchesi and first published in 1997 by the French game company Gigamic, quickly becoming one of the company's best-known titles alongside other compact two-player abstract games.",
    wallmaze_history_origins_p2: "It belongs to a broader family of \"blocking maze\" games, where the board itself changes shape over the course of play rather than staying fixed the way a chessboard does - each wall a player places permanently reshapes the paths both pawns can take for the rest of the game.",
    wallmaze_history_design_title: "Simple Rules, Real Depth",
    wallmaze_history_design_p1: "The entire rule set fits on a single card - move your pawn or place a wall, reach the far side to win - yet the tension between racing ahead and spending a turn to block your opponent instead gives it real strategic depth, and it's frequently cited in game-design writing as an example of elegant minimalism.",
    wallmaze_history_design_p2: "Quoridor has also been studied as a computer science problem: because the state space is large but well-structured (pawn positions plus wall placements, with a path-connectivity rule to enforce), it's a popular target for both traditional search-based AI and, more recently, reinforcement-learning agents.",
    wallmaze_history_names_title: "Why a Different Name",
    wallmaze_history_names_p1: "The same game principle appears commercially under the name Quoridor, designed in 1997 by Mirko Marchesi and published by Gigamic. Quoridor is a registered trademark. PaperGames is not affiliated with Gigamic or that game and therefore uses its own name, Wall Maze.",
    wallmaze_history_version_title: "This Version",
    wallmaze_history_version_p1: "PaperGames plays the standard rules on the standard 9x9 board with ten walls per player. Placing a wall is a small mode of its own: tap \"Place a wall\", tap anywhere on the board to preview the nearest legal wall there, and confirm - a deliberately forgiving target on a touchscreen, rather than needing to hit a precise spot."
});
I18n.markTextLoaded("en");
