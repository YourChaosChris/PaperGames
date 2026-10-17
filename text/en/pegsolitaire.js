// text/en/pegsolitaire.js
// Rules and history texts of pegsolitaire (en). Loaded by pegsolitaire-rules.html and pegsolitaire-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    pegsolitaire_rules_title: "Peg Solitaire Rules",
    pegsolitaire_rules_intro: "A quick reference for how PaperGames plays Peg Solitaire - useful if you're rusty, or learning.",
    pegsolitaire_rules_basics_title: "The basic idea",
    pegsolitaire_term_board: "The board and starting position",
    pegsolitaire_rules_board: "Before a game you choose the board; the English board (33 holes) is preset. Every hole starts filled with a peg except one - which one is listed for each board under \"The boards\".",
    pegsolitaire_term_jump: "Jumping",
    pegsolitaire_rules_jump: "Select a peg, then choose an empty hole two spaces away in a straight line (up, down, left or right - never diagonally) with another peg sitting directly between them. The peg jumps into the empty hole, and the peg it jumped over is removed from the board. Exception: on the triangle board pegs may also jump diagonally, along its slanted lines.",
    pegsolitaire_rules_end_title: "Finishing a game",
    pegsolitaire_term_win: "Solved",
    pegsolitaire_rules_win: "The classic goal is to jump your way down to a single peg. The game also ends, unsolved, the moment no legal jump remains, however many pegs are still on the board.",
    pegsolitaire_rules_boards_title: "The boards",
    pegsolitaire_rules_boards: "English: a 7x7 grid without the four 2x2 corners, 33 holes; the centre is empty. European: a 7x7 grid with only three holes cut off at each corner, 37 holes; the hole directly above the centre is empty, because the centre itself can't be solved. German (J. C. Wiegleb, 1779): a 9x9 grid without the four 3x3 corners, 45 holes; the centre is empty. Square: the full 6x6 grid, 36 holes; the upper left of the four middle holes is empty. Large diamond: a diamond of 41 holes on a 9x9 grid; the hole two rows above the centre is empty - on this board only very few starting holes can be solved at all. Triangle: five rows of 1 to 5 holes, each row shifted by half a hole, 15 holes; the upper left of the three holes nearest the middle is empty. On all square-grid boards pegs jump only horizontally or vertically, never diagonally. Only on the triangle may pegs also jump diagonally, along its slanted lines - six directions in all.",
    pegsolitaire_history_title: "The History of Peg Solitaire",
    pegsolitaire_history_origins_title: "A French Court Game",
    pegsolitaire_history_origins_p1: "The earliest confirmed evidence of peg solitaire comes from late-17th-century France, where the game appears in a 1697 engraving and was fashionable enough at the court of Louis XIV to be mentioned in contemporary writing. A popular legend credits its invention to a nobleman confined alone on an island - a charming story with no supporting evidence, and almost certainly invented well after the fact to give the game a more romantic origin.",
    pegsolitaire_history_origins_p2: "The board that became standard in France has 37 holes (adding four more corners to the plain cross), while the version that spread to England - the 33-hole cross used here - became the more common English-language standard, popularized in Britain during the 19th century.",
    pegsolitaire_history_spread_title: "One Board, Many Shapes",
    pegsolitaire_history_spread_p1: "Beyond the classic cross, solitaire boards have been built in triangular form (with its own 15-peg version, a fixture of American restaurant tables for decades), diamond shapes, and other arrangements - the jumping rule stays identical no matter what shape the holes are arranged into.",
    pegsolitaire_history_wiegleb: "A larger cross with 45 holes on a 9x9 grid was described by J. C. Wiegleb in 1779 in his book \"Unterricht in der natürlichen Magie\" (Lessons in natural magic).",
    pegsolitaire_history_spread_p2: "Because every move removes exactly one peg, a full game from n pegs to 1 always takes exactly n-1 jumps - one of the few board games where the move count of a won game is fixed in advance, regardless of which particular sequence of jumps gets there.",
    pegsolitaire_history_modern_title: "A Solved Puzzle, With a Twist",
    pegsolitaire_history_modern_p1: "Peg solitaire attracted serious mathematical attention starting in the 1960s and 70s, when researchers including John Conway analyzed it using tools like resistor-network and group-theoretic arguments to work out exactly which final single-peg positions are reachable from the standard starting position - the center is one of them, though far from the only one.",
    pegsolitaire_history_modern_p2: "Later computer search settled the question completely for the 33-hole board: a game starting with the center empty can always be finished down to one peg, and the number of essentially different winning games has been computed exactly - a rare case of a physical puzzle turning into a fully solved combinatorial problem."
});
I18n.markTextLoaded("en");
