// text/en/calcudoku.js
// Rules and history texts of calcudoku (en). Loaded by calcudoku-rules.html and calcudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    sudoku_term_goal: "The goal",
    sudoku_term_input: "Entering numbers",
    sudoku_rules_end_title: "Finishing a puzzle",
    sudoku_term_win: "Solved",
    sudoku_term_difficulty: "Difficulty",
    puzzle_rules_hint: "The \"Hint\" button helps in three stages. The first press marks where the next step is. The second press gives the reason, that is, the rule that applies there. The third press carries out the step (enters the number or builds the bridge). The hint works on your current position: if a number or bridge is wrong somewhere, it tells you that first. It never guesses - if the only way on is trying things out, it says so honestly. Hints are unlimited. A puzzle solved with hints still counts as a win; the statistics also show how many wins were with hints.",
    calcudoku_rules_title: "Calcudoku Rules",
    calcudoku_rules_intro: "A quick reference for how PaperGames plays Calcudoku - useful if you're rusty, or learning.",
    calcudoku_term_board: "The grid",
    calcudoku_rules_board: "The grid is square, from 4x4 up to 7x7. Unlike Sudoku it has no boxes; instead, thick lines divide it into cages - groups of one to four connected cells.",
    calcudoku_rules_goal: "Fill every cell with a digit from 1 up to the grid size (1 to 5 on a 5x5 grid) so that each row and each column contains every digit exactly once. Every puzzle PaperGames generates has exactly one solution.",
    calcudoku_term_regions: "Cages and operations",
    calcudoku_rules_regions: "The small label in a cage's top-left cell shows a target and an operation. With + or × the cage's digits must add up to, or multiply to, the target, in any order. A cage with – or ÷ always has two cells: the larger digit minus, or divided by, the smaller one gives the target. A one-cell cage simply shows its digit. A digit may appear twice in one cage, as long as its row and column allow it.",
    calcudoku_rules_input: "Select a cell, then pick a number from the pad below the board (or type a digit on a keyboard). A digit shown white on black clashes with another one in its row or column, or completes a cage that doesn't reach its target.",
    calcudoku_rules_difficulty: "Choose the grid size and a difficulty level before starting. Larger grids and higher levels mean bigger cages and fewer one-cell cages, which give less away.",
    calcudoku_rules_win: "The puzzle is solved the moment every cell is filled and no row, column or cage breaks a rule.",
    calcudoku_history_title: "The History of Calcudoku",
    calcudoku_history_origins_title: "From a Classroom in Japan",
    calcudoku_history_origins_p1: "This kind of puzzle is usually credited to Tetsuya Miyamoto, a Japanese mathematics teacher, who devised it around 2004 to train his pupils in calculation and logical thinking without telling them how to solve it. The idea soon spread beyond his classroom through puzzle books and newspapers.",
    calcudoku_history_origins_p2: "Underneath the arithmetic lies the Latin square - a grid in which every symbol appears exactly once in each row and column - which mathematicians such as Leonhard Euler studied in the 18th century and which also sits at the heart of Sudoku.",
    calcudoku_history_names_title: "Many Names, One Puzzle",
    calcudoku_history_names_p1: "The same kind of puzzle is also published commercially under the name KenKen. KenKen is a registered trademark of Nextoy LLC. PaperGames is not affiliated with Nextoy LLC and uses the generic name Calcudoku instead.",
    calcudoku_history_names_p2: "Every Calcudoku here is created fresh on your device: a random Latin square is cut into cages, each cage gets an operation that yields a whole number, and a built-in solver keeps only cuts that leave exactly one solution."
});
I18n.markTextLoaded("en");
