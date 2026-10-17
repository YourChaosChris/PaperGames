// text/en/pentomino.js
// Rules and history texts of pentomino (en). Loaded by pentomino-rules.html and pentomino-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    pt_rules_title: "Pentomino Puzzle Rules",
    pt_rules_intro: "Fill a rectangle with pieces of five squares.",
    pt_rules_basics_title: "The rules",
    pt_term_pieces: "The pieces",
    pt_rules_pieces: "There are exactly twelve ways to join five squares edge to edge, if turned and flipped shapes count as the same. Each piece carries its usual letter - F, I, L, N, P, T, U, V, W, X, Y, Z - and its own black-and-white pattern.",
    pt_term_lay: "Laying",
    pt_rules_lay: "Choose a piece below the board. Turn ↻ and Flip ⇋ change how it lies; its dot marks one square. Tap the square where the dot should go: the piece is laid if it fits. Tap a laid piece to pick it up again. No dragging is needed.",
    pt_term_free: "Free laying",
    pt_rules_free: "Lay the pieces until the rectangle is full - any filling counts. Easy: 5 pieces in 5 × 5. Medium: 8 pieces in 5 × 8. Hard: all 12 in 6 × 10, 5 × 12, 4 × 15 or 3 × 20.",
    pt_term_fixed: "Start pieces given",
    pt_rules_fixed: "On 6 × 10 some pieces lie fixed (dashed inner frames); the others fit around them in exactly one way. Easy: 3 pieces to lay, Medium: 5, Hard: 7.",
    pt_term_help: "Hint",
    pt_rules_help: "The hint marks where the next piece can go. If a laid piece blocks every way to finish, it names that piece.",
    pt_rules_example_title: "Example",
    pt_rules_example: "A solved Easy board: five pieces fill the 5 × 5 square.",
    pt_history_title: "History of the Pentomino Puzzle",
    pt_history_early_title: "Dudeney and Golomb",
    pt_history_early_p1: "The earliest known puzzle with a complete set of the twelve pieces is in Henry Dudeney's book The Canterbury Puzzles from 1907. The name \"pentomino\" comes from the mathematician Solomon Golomb, who began to describe these shapes in 1953; the puzzle column of Martin Gardner in Scientific American made them widely known.",
    pt_history_count_title: "Counting the solutions",
    pt_history_count_p1: "How many ways are there to fill 6 × 10? C. B. and Jenifer Haselgrove worked it out by computer in 1960: 2339, not counting turned or flipped copies of a whole solution. For 5 × 12 there are 1010, for 4 × 15 there are 368, and for 3 × 20 only 2."
});
I18n.markTextLoaded("en");
