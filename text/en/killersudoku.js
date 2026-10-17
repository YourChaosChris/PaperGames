// text/en/killersudoku.js
// Rules and history texts of killersudoku (en). Loaded by killersudoku-rules.html and killersudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    sudoku_term_goal: "The goal",
    sudoku_term_input: "Entering numbers",
    sudoku_rules_end_title: "Finishing a puzzle",
    sudoku_term_win: "Solved",
    sudoku_term_difficulty: "Difficulty",
    puzzle_rules_hint: "The \"Hint\" button helps in three stages. The first press marks where the next step is. The second press gives the reason, that is, the rule that applies there. The third press carries out the step (enters the number or builds the bridge). The hint works on your current position: if a number or bridge is wrong somewhere, it tells you that first. It never guesses - if the only way on is trying things out, it says so honestly. Hints are unlimited. A puzzle solved with hints still counts as a win; the statistics also show how many wins were with hints.",
    killersudoku_rules_title: "Killer Sudoku Rules",
    killersudoku_rules_intro: "A quick reference for how PaperGames plays Killer Sudoku - useful if you're rusty, or learning.",
    killersudoku_term_board: "The grid",
    killersudoku_rules_board: "As in Sudoku, thick lines divide the 9x9 grid into nine 3x3 boxes. Dashed lines also divide it into cages of one to five cells. Few or no cells start filled in.",
    killersudoku_rules_goal: "Fill every cell with a digit from 1 to 9 so that each row, each column and each 3x3 box contains every digit exactly once. Every puzzle PaperGames generates has exactly one solution.",
    killersudoku_term_regions: "Cages",
    killersudoku_rules_regions: "The small number in a cage's top-left cell is its sum: the digits in the cage must add up to it. Unlike in Calcudoku, no digit may repeat inside a cage.",
    killersudoku_rules_input: "Select a cell, then pick a number from the pad below the board (or type a digit on a keyboard). A digit shown white on black repeats in its row, column, box or cage, or completes a cage with the wrong sum.",
    killersudoku_rules_difficulty: "Easy puzzles have mostly small cages and a few more given digits; Hard puzzles have larger cages and only the givens needed for a unique solution, often almost none.",
    killersudoku_rules_win: "The puzzle is solved the moment every cell is filled and no row, column, box or cage breaks a rule.",
    killersudoku_history_title: "The History of Killer Sudoku",
    killersudoku_history_origins_title: "Sums on a Sudoku Grid",
    killersudoku_history_origins_p1: "Puzzles that combine Sudoku's rules with cage sums were already printed in Japan in the 1990s, where sum puzzles such as Kakuro were popular. The idea spread widely in 2005, when British newspapers began running such puzzles under the name Killer Sudoku during the worldwide Sudoku boom.",
    killersudoku_history_origins_p2: "The name is descriptive, not a brand: 'killer' simply promised a harder challenge than an ordinary Sudoku, since there are few or no digits to start from.",
    killersudoku_history_names_title: "How the Puzzles Here Are Made",
    killersudoku_history_names_p1: "Every Killer Sudoku here starts as a freshly generated, completely solved Sudoku grid, which is then cut into connected cages without a repeated digit in any cage.",
    killersudoku_history_names_p2: "A built-in solver then checks whether the cage sums allow only one solution. If not, a digit where two possible solutions differ is revealed as a given, and the check repeats until exactly one solution remains."
});
I18n.markTextLoaded("en");
