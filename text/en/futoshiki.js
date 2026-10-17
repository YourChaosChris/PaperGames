// text/en/futoshiki.js
// Rules and history texts of futoshiki (en). Loaded by futoshiki-rules.html and futoshiki-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    futoshiki_rules_title: "Futoshiki Rules",
    futoshiki_rules_intro: "A quick reference for how PaperGames plays Futoshiki, the Japanese inequality puzzle.",
    futoshiki_rules_basics_title: "The basic idea",
    futoshiki_term_grid: "The grid",
    futoshiki_rules_grid: "The grid has 4 x 4, 5 x 5 or 6 x 6 cells. Fill it with the numbers 1 up to the grid size, so that each of them appears exactly once in every row and exactly once in every column.",
    futoshiki_term_signs: "The signs",
    futoshiki_rules_signs: "Between some neighbouring cells there is a small triangle. It works like a less-than sign: its narrow tip points to the cell with the smaller number, its wide end to the cell with the larger one. Every sign must hold in the finished grid.",
    futoshiki_term_givens: "Given numbers",
    futoshiki_rules_givens: "Some puzzles start with a few numbers already filled in, shown in bold; many have none at all. Given numbers can't be changed.",
    futoshiki_term_unique: "One solution",
    futoshiki_rules_unique: "Every puzzle is freshly generated and checked to have exactly one solution, which can be found step by step without guessing.",
    futoshiki_rules_play_title: "Playing",
    futoshiki_term_entering: "Entering numbers",
    futoshiki_rules_entering: "Select a cell, then pick a number below the grid. Erase clears the selected cell, Undo takes back your last entry. A number that repeats in its row or column, or two numbers that break a sign, are shown inverted.",
    futoshiki_term_hint: "Hint",
    futoshiki_rules_hint: "Hint shows the next step in three presses: the first marks a cell, the second gives the reason, the third enters the number. It never guesses. A win with a hint counts separately in the statistics.",
    futoshiki_term_daily: "Daily Challenge and printing",
    futoshiki_rules_daily: "The Daily Challenge is a 5 x 5 puzzle that is the same for everyone on the same day. Print puts the empty puzzle on one A4 page, to solve on paper.",
    futoshiki_rules_end_title: "Finishing a puzzle",
    futoshiki_term_win: "Solved",
    futoshiki_rules_win: "The puzzle is solved as soon as every cell is filled, no number repeats in a row or column, and every sign holds.",
    futoshiki_history_title: "The History of Futoshiki",
    futoshiki_history_name_title: "A Name That Says It All",
    futoshiki_history_name_p1: "Futoshiki is the Japanese word for an inequality. The puzzle is played on a Latin square - the same grid as Sudoku without the boxes, or Calcudoku without the cages - and the only extra clues are the signs between the cells.",
    futoshiki_history_spread_title: "From Japan to the Newspapers",
    futoshiki_history_spread_p1: "Like many number puzzles of its kind, it became known in Japan first. In the wake of the Sudoku boom of the mid-2000s, newspapers and puzzle magazines elsewhere began to print it as well.",
    futoshiki_history_modern_title: "On PaperGames",
    futoshiki_history_modern_p1: "Every puzzle here is generated on your device and checked to have exactly one solution that can be reached without guessing. The signs are drawn as small triangles rather than typed characters, so they stay large and clear on an e-ink screen."
});
I18n.markTextLoaded("en");
