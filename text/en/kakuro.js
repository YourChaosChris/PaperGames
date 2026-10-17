// text/en/kakuro.js
// Rules and history texts of kakuro (en). Loaded by kakuro-rules.html and kakuro-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    kakuro_rules_title: "Kakuro Rules",
    kakuro_rules_intro: "A quick reference for how PaperGames plays Kakuro - useful if you're rusty, or learning. Kakuro is sometimes described as \"crossword sudoku\": instead of letters, every white square holds a digit, and instead of words, the clues are sums.",
    kakuro_rules_basics_title: "The basic idea",
    kakuro_term_board: "The grid",
    kakuro_rules_board: "The grid is a mix of black clue cells and white fillable cells. Every maximal unbroken line of white cells, reading left-to-right or top-to-bottom, is called a \"run\". Each run has exactly one clue: the total its digits must add up to.",
    kakuro_term_clues: "Reading the clue cells",
    kakuro_rules_clues: "A black cell shows its sum (or sums) in white digits, split diagonally when it carries two: the number in the upper-right corner is the target for the run of white cells starting immediately to its right (an \"across\" clue), and the number in the lower-left corner is the target for the run of white cells starting immediately below it (a \"down\" clue). A black cell with only one clue shows only that number.",
    kakuro_term_goal: "The goal",
    kakuro_rules_goal: "Fill every white cell with a digit from 1 to 9 so that each run's digits add up to exactly its clue - and, just as important, no digit repeats within the same run (a digit can reappear in a run crossing it, just never twice in the same run).",
    kakuro_term_input: "Entering numbers",
    kakuro_rules_input: "Select a white cell, then pick a digit from the pad below the board (or type a digit on a keyboard). A cell showing a dashed outline currently repeats a digit already used elsewhere in one of its runs, or belongs to a fully-filled run whose total doesn't match its clue yet - use that as a hint that something needs to change.",
    kakuro_term_difficulty: "Difficulty",
    kakuro_rules_difficulty: "Easy, Medium and Hard puzzles use progressively larger grids (7x7, 9x9 and 11x11), which means longer runs and more of them crossing each other - more digits to juggle at once, but the same two rules throughout.",
    kakuro_rules_example_title: "A worked example",
    kakuro_term_example: "Two crossing runs",
    kakuro_rules_example_p1: "Say a 2-cell across run is clued 4, and its first cell is also the top of a 2-cell down run clued 3. The across run's two digits must add up to 4 without repeating - only 1+3 or 3+1 can do that (2+2 repeats the 2, so it's not allowed). The down run's two digits must add up to 3 without repeating, which only 1+2 or 2+1 can do.",
    kakuro_rules_example_p2: "The shared cell has to be a digit both runs can use. The across run offers {1, 3} for that cell and the down run offers {1, 2} - the only digit in both sets is 1. So the shared cell must be 1, which pins the across run's other cell to 3 and the down run's other cell to 2. That's the whole puzzle solved by elimination alone, with no guessing needed - the same kind of deduction, just repeated many more times over, that solves every larger Kakuro grid.",
    kakuro_rules_end_title: "Finishing a puzzle",
    kakuro_term_win: "Solved",
    kakuro_rules_win: "The puzzle is solved the moment every white cell is filled in with every run summing to its clue and no run repeating a digit.",
    kakuro_history_title: "The History of Kakuro",
    kakuro_history_origins_title: "Cross Sums, Invented in America",
    kakuro_history_origins_p1: "The number-crossword puzzle now known as Kakuro was invented in 1966 by Jacques Cousin, a Canadian working for the puzzle publisher Dell Magazines, who introduced it in the United States under the name \"Cross Sums\" (also written \"Cross Sum\"). It quickly became a regular feature in Dell's puzzle magazines alongside Dell's other number and logic puzzles.",
    kakuro_history_origins_p2: "The idea combined the look of a crossword grid with arithmetic instead of vocabulary: black cells carrying clue numbers in place of crossword definitions, and white cells to fill in with digits whose sums had to match those clues.",
    kakuro_history_spread_title: "A Japanese Name for a Second Life",
    kakuro_history_spread_p1: "Cross Sums crossed over to Japan, where the puzzle publisher Nikoli - the same company that would later popularize and name Sudoku - picked it up and gave it the name \"Kakuro\", a contraction of \"kasan kurosu\" (加算クロス), Japanese for \"addition cross\".",
    kakuro_history_spread_p2: "Through the 1980s, Kakuro grew into one of Nikoli's most popular puzzles in Japan, developing a following there well before the Sudoku boom that would later carry Nikoli's name to the rest of the world.",
    kakuro_history_modern_title: "A Puzzle Rediscovered",
    kakuro_history_modern_p1: "Kakuro's international profile rose again in the mid-2000s in the wake of Sudoku's worldwide newspaper boom, as puzzle editors looking for a follow-up act turned to Nikoli's other number puzzles - introducing Kakuro to many Western solvers for the first time under its Japanese name, even though the puzzle itself had been invented decades earlier in North America.",
    kakuro_history_modern_p2: "That two-stage history is reflected in how the puzzle is still solved today: a Kakuro grid never needs guesswork, only the same run-by-run elimination Dell's original Cross Sums solvers used - simply expressed digit by digit, one clue at a time, the same principle this collection's generator uses in reverse to build a fresh puzzle out of a randomly filled grid."
});
I18n.markTextLoaded("en");
