// text/en/amazons.js
// Rules and history texts of amazons (en). Loaded by amazons-rules.html and amazons-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    amazons_rules_title: "Amazons Rules",
    amazons_rules_intro: "A quick reference for how PaperGames plays The Game of the Amazons - useful if you're rusty, or learning.",
    amazons_rules_basics_title: "The basic idea",
    amazons_term_setup: "The setup",
    amazons_rules_setup: "Each player has four amazons on a 10x10 board, placed in the standard symmetric starting position. There is no capturing anywhere in this game - it is won purely by movement and territory.",
    amazons_term_moving: "Moving an amazon",
    amazons_rules_moving: "On your turn, move one of your own amazons any number of empty squares in a straight line - horizontally, vertically, or diagonally - exactly like a chess queen. It can never jump over another amazon or a burned square.",
    amazons_term_shooting: "Shooting an arrow",
    amazons_rules_shooting: "Immediately after moving, that same amazon must shoot an arrow from its new square: another queen-style slide, in any of the 8 directions, through empty squares only, landing on an empty square.",
    amazons_term_burned: "Burned squares",
    amazons_rules_burned: "Wherever an arrow lands, that square is burned for the rest of the game - permanently impassable terrain that no amazon and no future arrow can ever cross or land on again.",
    amazons_rules_end_title: "Winning the game",
    amazons_term_win: "How the game ends",
    amazons_rules_win: "If it's your turn and none of your amazons has a single legal move left - blocked in every direction by other amazons, burned squares, or the edge of the board - you lose. The last player still able to move wins.",
    amazons_history_title: "The History of the Game of the Amazons",
    amazons_history_origins_title: "Invented in 1988",
    amazons_history_origins_p1: "The Game of the Amazons was invented in 1988 by Walter Zamkauskas, an Argentine game designer, and first published in the Argentine puzzle magazine El Acertijo (published in Spanish).",
    amazons_history_origins_p2: "Its queen-like moving pieces echo chess, but the arrow-shooting half of every turn - permanently burning a square after each move - is entirely its own idea, turning the game from a race into a slow strangulation of the opponent's available space.",
    amazons_history_design_title: "A Favorite of Combinatorial Game Theory",
    amazons_history_design_p1: "Amazons has no draws, no captures, and an enormous number of possible moves per turn - at the start of a game even more than in Go - which made it a natural subject for combinatorial game theory researchers, and a regular event at computer-game competitions and olympiads since the late 1990s.",
    amazons_history_design_p2: "Strong computer play turned out to be a serious challenge of its own: with dozens of legal piece-moves and, for each, dozens of legal arrow-shots, a single turn can have well over a thousand legal moves - far more than chess - which pushed Amazons-playing programs toward heavy move-ordering and endgame territory analysis rather than brute-force search alone.",
    amazons_history_version_title: "This Version",
    amazons_history_version_p1: "PaperGames plays the standard rules on the standard 10x10 board with four amazons per side. Each turn is a simple three-tap sequence: tap an amazon, tap where it moves to, then tap where it shoots its arrow from there."
});
I18n.markTextLoaded("en");
