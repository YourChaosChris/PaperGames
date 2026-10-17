// text/en/marblepush.js
// Rules and history texts of marblepush (en). Loaded by marblepush-rules.html and marblepush-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    marblepush_rules_title: "Marble Push Rules",
    marblepush_rules_intro: "A quick reference for how PaperGames plays Marble Push - useful if you're rusty, or learning.",
    marblepush_rules_basics_title: "The basic idea",
    marblepush_term_board: "The board",
    marblepush_rules_board: "A hexagon of 61 cells, arranged in rows of 5, 6, 7, 8, 9, 8, 7, 6, 5. Each player starts with 14 marbles: their two nearest rows fully filled, plus the middle 3 cells of the next row. Black moves first.",
    marblepush_term_move: "Moving a single marble",
    marblepush_rules_single: "Select one marble and slide it into any adjacent empty cell.",
    marblepush_term_line: "Moving a line",
    marblepush_rules_line: "Select 2 or 3 of your own marbles that sit in a straight, unbroken line, then move the whole line one step in any of the board's 6 directions. There are two kinds of line move, described below.",
    marblepush_term_broadside: "Broadside move",
    marblepush_rules_broadside: "The line steps sideways, off its own axis. Every cell the line moves into must be empty - a broadside move can never push anything.",
    marblepush_term_inline: "Inline move",
    marblepush_rules_inline: "The line moves along its own axis, in the direction either of its two ends is facing. If the cell straight ahead is empty, the whole line simply slides forward.",
    marblepush_term_sumito: "The push",
    marblepush_rules_sumito: "If the cell straight ahead of an inline move holds enemy marbles, you may push them - but only if your line is strictly longer than the contiguous enemy line blocking it (3 marbles can push 1 or 2, 2 marbles can push 1; 1 marble can never push). There must also be room to push into: either an empty cell just past the enemy line, or the edge of the board. If the enemy line runs off the edge of the board, its last marble is eliminated - the way a player scores.",
    marblepush_rules_example_title: "Worked example: 3 marbles push 1",
    marblepush_rules_example_intro: "In the mini-diagram below, ● is Black and ○ is White. Black has 3 marbles in a row (A, B, C) facing a single White marble (D), with an empty cell (E) - or the board's edge - just beyond it.",
    marblepush_rules_example_caption: "Black's 3-line (A, B, C) outnumbers White's single marble (D), and cell E is empty - so Black may push: the whole line slides forward one step, D is shoved into E, and Black's line ends up occupying B, C and D's old cell. If E were instead the edge of the board, D would be eliminated entirely.",
    marblepush_rules_end_title: "How a game ends",
    marblepush_term_win: "Winning",
    marblepush_rules_win: "The first player to push 6 of the opponent's marbles off the board wins.",
    marblepush_term_resignation: "Resignation",
    marblepush_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    marblepush_history_title: "The History of Marble Push",
    marblepush_history_origins_title: "Pushing Games on Hexagonal Boards",
    marblepush_history_origins_p1: "Games in which pieces are pushed rather than jumped over or captured in place have a long tradition, and so do hexagonal boards: every cell has six neighbours instead of four, which gives each piece more directions to move in and avoids the awkward diagonals of a square grid.",
    marblepush_history_origins_p2: "Marble Push belongs to that family. The marbles are plain and all equal, and the whole game rests on a single idea: a longer line of marbles can push a shorter one.",
    marblepush_history_award_title: "One Rule, Much Depth",
    marblepush_history_award_p1: "Because a marble can only be lost by being pushed off the board by a strictly longer line, keeping marbles together in solid groups matters more than anything else. A lone marble can never push, and a group near the edge is always in danger.",
    marblepush_history_award_p2: "That turns every game into a slow struggle for the middle of the board: the side that holds the centre can push outward in every direction, while the other side is pressed towards the edge.",
    marblepush_history_legacy_title: "A Game Without Luck",
    marblepush_history_legacy_p1: "There are no dice, no hidden information and no special pieces - just two sets of identical marbles and a few simple rules about which lines may push which. That makes it a pure test of planning, in the same spirit as older abstract classics like Go and checkers."
});
I18n.markTextLoaded("en");
