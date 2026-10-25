// text/en/slidepuzzle.js
// Rules and history texts of slidepuzzle (en). Loaded by slidepuzzle-rules.html and slidepuzzle-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    slidepuzzle_rules_title: "Sliding Puzzle Rules",
    slidepuzzle_rules_intro: "Numbered tiles lie in a square box with one empty place. Slide them until the numbers are in order.",
    slidepuzzle_rules_basics_title: "The rules",
    slidepuzzle_term_board: "The board",
    slidepuzzle_rules_board: "3 × 3 places (tiles 1 to 8), 4 × 4 (1 to 15) or 5 × 5 (1 to 24); one place is empty - the gap.",
    slidepuzzle_term_move: "A move",
    slidepuzzle_rules_move: "Tap a tile next to the gap, and it slides into the gap. You can also tap a tile further along the same row or column: then every tile between it and the gap slides one place too. Each tap counts as one move.",
    slidepuzzle_term_goal: "The goal",
    slidepuzzle_rules_goal: "The numbers in order, row by row from the top left, with the gap at the bottom right.",
    slidepuzzle_term_mix: "Mixing",
    slidepuzzle_rules_mix: "A new puzzle is mixed only with real moves from the solved board, so every puzzle can be solved. (Half of all ways to put the tiles into the box by hand cannot be solved.)",
    slidepuzzle_term_hint: "Hint",
    slidepuzzle_rules_hint: "The Hint button marks a tile with a double frame. On 3 × 3 it is the first move of a shortest solution, and the result names the fewest moves possible from the start; on the bigger boards the hinted move brings a tile closer to its place.",
    slidepuzzle_history_title: "The History of the Sliding Puzzle",
    slidepuzzle_history_origins_title: "Canastota, New York",
    slidepuzzle_history_origins_p1: "The sliding puzzle is generally credited to Noyes Palmer Chapman, a postmaster in Canastota, New York, who is said to have shown friends a forerunner as early as 1874. In 1880 the puzzle with fifteen tiles became a craze in the United States; Chapman applied for a patent that February, and it was refused.",
    slidepuzzle_history_loyd_title: "A claim without proof",
    slidepuzzle_history_loyd_p1: "The puzzle writer Sam Loyd claimed from 1891 until his death in 1911 that he had invented it. There is no evidence for this: he had nothing to do with its invention or its first popularity.",
    slidepuzzle_history_math_title: "Half cannot be solved",
    slidepuzzle_history_math_p1: "As early as 1879 the mathematicians W. W. Johnson and W. E. Story showed that only half of all ways to put the tiles into the box can be solved - the rest can never be put in order. That is why PaperGames mixes every puzzle with real moves."
});
I18n.markTextLoaded("en");
