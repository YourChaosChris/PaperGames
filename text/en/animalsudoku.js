// text/en/animalsudoku.js
// Rules and history texts of animalsudoku (en). Loaded by animalsudoku-rules.html and animalsudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    animalsudoku_rules_title: "Animal Sudoku Rules",
    animalsudoku_rules_intro: "A small Sudoku for children: animals instead of numbers, and only 4 x 4 or 6 x 6 cells.",
    animalsudoku_rules_basics_title: "The rules",
    animalsudoku_term_board: "The board",
    animalsudoku_rules_board: "The board has 4 x 4 cells in four boxes of 2 x 2, or 6 x 6 cells in six boxes of 2 rows and 3 columns. Thick lines show the boxes.",
    animalsudoku_term_animals: "The animals",
    animalsudoku_rules_animals: "On 4 x 4 there are four animals: dog, cat, rabbit and mouse. On 6 x 6 the owl and the fish join them. Every animal appears exactly once in each row, each column and each box.",
    animalsudoku_term_given: "Given animals",
    animalsudoku_rules_given: "Some animals are already on the board. They have a heavy frame and cannot be changed.",
    animalsudoku_term_input: "Playing",
    animalsudoku_rules_input: "Choose an animal in the row of buttons under the board, then tap an empty cell. Tap it again with the same animal to take it off, or use the eraser. If an animal appears twice in a row, column or box, both get a dashed frame.",
    animalsudoku_term_hint: "Hint",
    animalsudoku_rules_hint: "The Hint button works like Sudoku's: first it shows a mistake if there is one; otherwise it marks the next cell, then explains why, and on the third press puts the animal in.",
    animalsudoku_term_levels: "Levels",
    animalsudoku_rules_levels: "Easy, Medium and Hard differ in how many animals are given at the start. Every puzzle has exactly one solution and can be solved without guessing.",
    animalsudoku_rules_example_title: "A solved example",
    animalsudoku_rules_example: "The picture shows a solved 4 x 4 board: in every row, every column and every 2 x 2 box, each of the four animals appears once.",
    animalsudoku_rules_end_title: "Finishing a puzzle",
    animalsudoku_term_win: "Solved",
    animalsudoku_rules_win: "The puzzle is solved when every cell holds the right animal.",
    animalsudoku_history_title: "The History of Picture Sudoku",
    animalsudoku_history_origins_title: "From Latin Squares to Sudoku",
    animalsudoku_history_origins_p1: "A grid in which every symbol appears once in each row and each column is called a Latin square. The Swiss mathematician Leonhard Euler wrote about such squares in the 18th century.",
    animalsudoku_history_origins_p2: "The puzzle with boxes as well appeared in 1979 in an American puzzle magazine under the name Number Place; it was designed by Howard Garns. The Japanese publisher Nikoli took it up in 1984 and gave it the name Sudoku.",
    animalsudoku_history_small_title: "Small Grids and Pictures",
    animalsudoku_history_small_p1: "After Sudoku became popular around the world in the mid-2000s, smaller versions with 4 x 4 and 6 x 6 cells and versions with pictures instead of digits appeared, especially for children: the rule is the same, but there is less to keep in mind at once.",
    animalsudoku_history_modern_title: "How PaperGames Makes Each Puzzle",
    animalsudoku_history_modern_p1: "Every puzzle here comes from PaperGames's own generator. It fills a complete board at random, then takes animals away one by one - but only while the puzzle keeps exactly one solution and can still be solved with the two simplest steps: only one animal fits a cell, or an animal has only one cell left in a row, column or box."
});
I18n.markTextLoaded("en");
