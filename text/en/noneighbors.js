// text/en/noneighbors.js
// Rules and history texts of noneighbors (en). Loaded by noneighbors-rules.html and noneighbors-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    sudoku_term_goal: "The goal",
    sudoku_term_input: "Entering numbers",
    sudoku_rules_end_title: "Finishing a puzzle",
    sudoku_term_win: "Solved",
    sudoku_term_difficulty: "Difficulty",
    puzzle_rules_hint: "The \"Hint\" button helps in three stages. The first press marks where the next step is. The second press gives the reason, that is, the rule that applies there. The third press carries out the step (enters the number or builds the bridge). The hint works on your current position: if a number or bridge is wrong somewhere, it tells you that first. It never guesses - if the only way on is trying things out, it says so honestly. Hints are unlimited. A puzzle solved with hints still counts as a win; the statistics also show how many wins were with hints.",
    numberblocks_rules_title: "No Neighbors Rules",
    numberblocks_rules_intro: "A quick reference for how PaperGames plays No Neighbors - useful if you're rusty, or learning.",
    numberblocks_term_board: "The grid",
    numberblocks_rules_board: "Thick lines divide the grid into blocks of one to five cells. Some cells start filled in (in bold) and can't be changed.",
    numberblocks_rules_goal: "Fill every empty cell so that a block of n cells contains the digits 1 to n, each exactly once - a block of three cells holds 1, 2 and 3. Every puzzle PaperGames generates has exactly one solution.",
    numberblocks_term_regions: "The touching rule",
    numberblocks_rules_regions: "Two equal digits must never touch - not side by side, not above each other and not diagonally. None of the up to eight cells around a digit may hold the same digit, even if they belong to another block.",
    numberblocks_rules_input: "Select a cell, then pick a number from the pad below the board (or type a digit on a keyboard). When a digit repeats in its block, is too large for its block, or touches the same digit, every cell involved shows its digit white on black.",
    numberblocks_rules_difficulty: "Easy puzzles use a 6x6 grid, Medium 7x7 and Hard 8x8, with fewer digits given at each step up.",
    numberblocks_rules_win: "The puzzle is solved the moment every cell is filled and no block or touching rule is broken.",
    numberblocks_history_title: "The History of No Neighbors",
    numberblocks_history_origins_title: "An Inventor's Puzzle",
    numberblocks_history_origins_p1: "No Neighbors was invented by the Japanese puzzle designer Naoki Inaba, who published it in 2001. Inaba has created a great many logic puzzles, often built on a single clear rule that leads to surprisingly deep reasoning.",
    numberblocks_history_origins_p2: "The puzzle combines two familiar ideas: regions that must each hold a fixed set of digits, as in Sudoku's boxes, and a neighbourhood rule borrowed from the king in chess - a digit may not repeat anywhere a king could step to.",
    numberblocks_history_names_title: "Under Other Names",
    numberblocks_history_names_p1: "The puzzle is also known internationally as Suguru or Tectonic; these names refer to the same region-and-neighbour rule set.",
    numberblocks_history_names_p2: "Every puzzle here is created fresh on your device: blocks and a valid solution are built together cell by cell, then digits are removed one at a time for as long as a built-in solver still finds exactly one solution."
});
I18n.markTextLoaded("en");
