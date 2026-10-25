// text/en/nonogram.js
// Rules and history texts of nonogram (en). Loaded by nonogram-rules.html and nonogram-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    nonogram_rules_title: "Nonogram Rules",
    nonogram_rules_intro: "A quick reference for how PaperGames plays Nonograms (also called Griddlers) - useful if you're rusty, or learning.",
    nonogram_rules_basics_title: "The basic idea",
    nonogram_term_clues: "Reading the clues",
    nonogram_rules_clues: "Each row and column has a clue: a sequence of numbers giving the length of every consecutive block of filled cells in that line, in order, separated by at least one empty cell. A clue of \"3 1\" means a run of three filled cells, then a gap, then one more filled cell, somewhere in that line.",
    nonogram_term_filling: "Filling and marking",
    nonogram_rules_filling: "Use Fill mode to shade in a cell you're sure is part of the picture, and Mark X mode to cross out a cell you're sure is empty - marking is purely a memory aid and has no effect on winning, but it helps rule out possibilities as you work through the clues.",
    nonogram_rules_end_title: "Finishing a puzzle",
    nonogram_term_win: "Solved",
    nonogram_rules_win: "The puzzle is solved the instant your filled cells exactly match the hidden picture - marked cells don't need to be correct, only the filled ones matter.",
    nonogram_history_title: "The History of Nonograms",
    nonogram_history_origins_title: "Two Inventors, Two Continents",
    nonogram_history_origins_p1: "The puzzle goes back to Japan in the late 1980s. In 1987 the Japanese graphics editor Non Ishida won a design competition in Tokyo with grid pictures made of skyscraper windows whose lights were switched on or off; this gave her the idea for the puzzle, and in 1988 she published three such picture puzzles as \"Window Art Puzzles\". The Japanese puzzle author Tetsuya Nishio invented the same kind of puzzle independently and published it in another magazine.",
    nonogram_history_origins_p2: "The British puzzle collector James Dalgety saw Ishida's puzzles and helped to publish them outside Japan. He coined the name \"Nonogram\", from \"Non\" (Ishida's first name) and \"-gram\" (from \"diagram\"). From 1990 the British newspaper The Sunday Telegraph printed the puzzles every week; in 1998 its readers chose the new name \"Griddlers\" in a competition. Today the puzzle is known under several names, including Picross and Hanjie.",
    nonogram_history_spread_title: "From Magazines to Game Boy",
    nonogram_history_spread_p1: "Nintendo popularized the puzzle worldwide under the name 'Picross' (a portmanteau of 'picture' and 'crossword'), releasing Picross games for the Game Boy and Super Famicom starting in 1995 - for many players outside Japan, that handheld series was their first encounter with the format.",
    nonogram_history_spread_p2: "The puzzle's appeal turned out to travel well beyond dedicated video games: newspaper puzzle pages picked it up alongside Sudoku during the 2000s puzzle boom, usually under the name Griddlers or Hanjie, and it remains a staple of puzzle books and apps today.",
    nonogram_history_modern_title: "A Puzzle That Needs No Guessing (Usually)",
    nonogram_history_modern_p1: "A well-constructed Nonogram is designed to be solvable through pure logical deduction alone, line by line, without ever needing to guess - which is exactly the property PaperGames's own puzzles are checked for before being included, using a constraint-propagation solver that confirms each picture's clues admit one and only one valid grid.",
    nonogram_history_modern_p2: "That's not true of every possible clue set, though: like Minesweeper, general Nonogram solving has been proven NP-complete, meaning a large enough or deliberately adversarial puzzle can require genuine backtracking-style guesswork to crack - well-designed puzzles for human solvers are specifically built to avoid that, which is itself a small art form."
});
I18n.markTextLoaded("en");
