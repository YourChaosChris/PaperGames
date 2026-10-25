// text/en/sudoku.js
// Rules and history texts of sudoku (en). Loaded by sudoku-rules.html and sudoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_title: "Sudoku Rules",
    sudoku_rules_intro: "A quick reference for how PaperGames plays Sudoku - useful if you're rusty, or learning.",
    sudoku_rules_basics_title: "The basic idea",
    sudoku_term_board: "The grid",
    sudoku_rules_board: "The 9x9 grid is divided into nine 3x3 boxes. Some cells start filled in ('givens') and can't be changed; the rest start empty for you to fill in.",
    sudoku_term_goal: "The goal",
    sudoku_rules_goal: "Fill every empty cell with a digit from 1 to 9 so that each row, each column, and each of the nine 3x3 boxes contains every digit exactly once. Every puzzle PaperGames generates has exactly one solution.",
    sudoku_term_input: "Entering numbers",
    sudoku_rules_input: "Select a cell, then pick a number from the pad below the board (or type a digit on a keyboard). A cell showing a dashed outline currently conflicts with another cell in its row, column, or box - use that as a hint that something needs to change.",
    sudoku_rules_end_title: "Finishing a puzzle",
    sudoku_term_win: "Solved",
    sudoku_rules_win: "The puzzle is solved the moment the grid is completely filled in with no conflicts remaining.",
    sudoku_term_difficulty: "Difficulty",
    sudoku_rules_difficulty: "Easy, Medium and Hard puzzles differ only in how many of the 81 cells start out filled in - fewer givens means more deduction is needed to make progress.",
    sudoku_history_title: "The History of Sudoku",
    sudoku_history_origins_title: "An American Puzzle, First",
    sudoku_history_origins_p1: "The number-placement puzzle we now call Sudoku first appeared in 1979 in an American puzzle magazine, published by Dell Magazines under the title 'Number Place'. Its inventor is usually credited as Howard Garns, a retired architect and freelance puzzle constructor, though the magazine never printed bylines at the time, so the attribution rests on circumstantial evidence rather than a signed claim.",
    sudoku_history_origins_p2: "The puzzle drew on a much older mathematical idea, the Latin square - a grid where each symbol appears exactly once per row and column - studied by Leonhard Euler in the 18th century, with the added 3x3 box constraint layered on top to make a unique solution reachable by logic alone, without guessing.",
    sudoku_history_spread_title: "A Japanese Name for a Global Craze",
    sudoku_history_spread_p1: "The puzzle reached Japan in 1984 through the puzzle company Nikoli, which renamed it 'Suuji wa dokushin ni kagiru' ('the digits must remain single'), soon shortened to Sudoku ('single number'). In 1986 Nikoli added two rules that are still common today: an upper limit on the number of givens, and a symmetric pattern for placing them.",
    sudoku_history_spread_p2: "Sudoku stayed a modest Japanese pastime for two decades until retired judge Wayne Gould, having encountered it on a trip to Tokyo, wrote a computer program to generate puzzles quickly and persuaded The Times of London to start running them in 2004 - triggering a worldwide newspaper puzzle craze within about a year.",
    sudoku_history_modern_title: "From Newspaper Column to Computer Science",
    sudoku_history_modern_p1: "Sudoku's sudden popularity attracted mathematicians and computer scientists as much as casual solvers: in 2005, the total number of distinct completed 9x9 grids was computed exactly (a little over 6.6 sextillion), and in 2012 an exhaustive computer search established that no valid 9x9 puzzle needs fewer than 17 givens to have a unique solution.",
    sudoku_history_modern_p2: "That second result is exactly the kind of fact PaperGames's generator relies on in reverse: because uniqueness gets harder to preserve as givens are removed, every puzzle here is produced by starting from a full solved grid and removing cells one at a time for as long as a unique solution survives.",
    puzzle_rules_hint: "The \"Hint\" button helps in three stages. The first press marks where the next step is. The second press gives the reason, that is, the rule that applies there. The third press carries out the step (enters the number or builds the bridge). The hint works on your current position: if a number or bridge is wrong somewhere, it tells you that first. It never guesses - if the only way on is trying things out, it says so honestly. Hints are unlimited. A puzzle solved with hints still counts as a win; the statistics also show how many wins were with hints."
});
I18n.markTextLoaded("en");
