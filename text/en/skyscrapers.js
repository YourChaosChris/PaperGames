// text/en/skyscrapers.js
// Rules and history texts of skyscrapers (en). Loaded by skyscrapers-rules.html and skyscrapers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    skyscrapers_rules_title: "Skyscrapers Rules",
    skyscrapers_rules_intro: "A quick reference for how PaperGames plays Skyscrapers - useful if you're rusty, or learning.",
    skyscrapers_rules_basics_title: "The basic idea",
    skyscrapers_term_board: "The grid",
    skyscrapers_rules_board: "Each cell holds a building's height, from 1 (shortest) up to N (tallest, N being the size of the grid). Around the outside of the grid, some rows and columns carry a clue number just past that edge - not necessarily every row or column, and not necessarily on every side.",
    skyscrapers_term_clues: "Reading the edge clues",
    skyscrapers_rules_clues: "A clue gives the number of buildings you'd see looking into its row or column from that side, if a taller building anywhere in front of a shorter one hides it completely from that viewpoint. Top clues look down their column, bottom clues look up it, left clues look right along their row, and right clues look left along it.",
    skyscrapers_term_goal: "The goal",
    skyscrapers_rules_goal: "Fill every cell with a height from 1 to N so that each row and each column contains every height exactly once (the same rule as Sudoku's rows and columns, just with no sub-box rule), and every clue shown around the grid matches the number of buildings actually visible from that side.",
    skyscrapers_term_input: "Entering heights",
    skyscrapers_rules_input: "Select a cell, then pick a height from the pad below the board (or type a digit on a keyboard). A cell showing a dashed outline currently repeats a height already used elsewhere in its row or column - use that as a hint that something needs to change.",
    skyscrapers_term_difficulty: "Difficulty",
    skyscrapers_rules_difficulty: "Easy, Medium and Hard puzzles use progressively larger grids (4x4, 5x5 and 6x6) with progressively fewer of the edge clues revealed - more heights to juggle at once, but the same two rules throughout.",
    skyscrapers_rules_example_title: "A worked example",
    skyscrapers_term_example: "Counting visible buildings",
    skyscrapers_rules_example_p1: "Take a row of four buildings, heights 3, 1, 4, 2, read left to right. Looking in from the left: the 3 is visible first, since nothing taller has come before it. The 1 is shorter than the 3 already seen, so it's hidden behind it. The 4 is taller than everything before it, so it's visible too. The 2 is shorter than the 4, so it stays hidden.",
    skyscrapers_rules_example_p2: "That's 2 buildings visible from the left - the 3 and the 4 - so a left-side clue of 2 fits this row. Looking at the very same row from the right instead (reading 2, 4, 1, 3 in viewing order): the 2 is visible first, the 4 is taller so it's visible too, and both the 1 and the 3 after it are shorter than the 4 already seen, so neither is visible - a right-side clue of 2 as well, here purely by coincidence of this particular row.",
    skyscrapers_rules_end_title: "Finishing a puzzle",
    skyscrapers_term_win: "Solved",
    skyscrapers_rules_win: "The puzzle is solved the moment the grid is completely filled in, every row and column has each height exactly once, and every clue around the edge matches its row's or column's actual visible count.",
    skyscrapers_history_title: "The History of Skyscrapers",
    skyscrapers_history_origins_title: "Puzzle-Magazine Roots",
    skyscrapers_history_origins_p1: "Unlike Sudoku, Skyscrapers has no single, well-documented inventor or first publication date that historians agree on. Like many logic-puzzle genres, it seems to have emerged and spread gradually through puzzle-magazine culture rather than being credited to one named creator at one particular moment - the visibility-clue idea is simple enough that more than one puzzle constructor plausibly arrived at it independently.",
    skyscrapers_history_origins_p2: "What is certain is the mathematics underneath it: like Sudoku, a solved Skyscrapers grid is a Latin square - a grid where each symbol, here a building height, appears exactly once per row and column - an object studied by Leonhard Euler in the 18th century, long before either puzzle existed.",
    skyscrapers_history_spread_title: "A Competition Puzzle",
    skyscrapers_history_spread_p1: "Skyscrapers found its widest international audience through competitive puzzling, especially the World Puzzle Championship, an annual international puzzle competition first held in 1992, where it is one of many recurring standard genres alongside the Sudoku family and other Latin-square-based puzzles.",
    skyscrapers_history_spread_p2: "That competition setting helped settle the puzzle's rules and presentation into the standard form played today, even without a single credited inventor - much the way several recurring puzzle genres owe their final shape less to one creator than to repeated use in puzzle magazines and championship puzzle sets.",
    skyscrapers_history_modern_title: "Latin Squares, Viewed From Outside",
    skyscrapers_history_modern_p1: "What makes Skyscrapers conceptually distinctive is how it layers a spatial, visual idea - looking along a line of buildings and counting how many are tall enough to be seen - on top of logic already familiar from Sudoku's rows and columns. That combination is also exactly what gives the puzzle its name and its thematic presentation, unlike the plain grid of digits a Sudoku or a bare Latin square puzzle presents.",
    skyscrapers_history_modern_p2: "It's also exactly the property PaperGames's generator relies on in reverse: since an edge clue is really just a fact computed from a finished grid, every puzzle here is produced by building a full valid grid first, computing every possible clue from it, and then keeping only as many of those clues as still pin the grid down to a single unique solution - the same generate-then-reduce approach this collection's Sudoku and Kakuro generators use, adapted to a different constraint."
});
I18n.markTextLoaded("en");
