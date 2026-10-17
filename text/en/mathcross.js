// text/en/mathcross.js
// Rules and history texts of mathcross (en). Loaded by mathcross-rules.html and mathcross-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    mc_rules_title: "Calculation Grid Rules",
    mc_rules_intro: "Place the numbers 1 to 9 so that every calculation works out.",
    mc_rules_basics_title: "The rules",
    mc_term_grid: "The grid",
    mc_rules_grid: "Nine squares in three rows and three columns, with an operator between neighbouring squares (+, −, ×, ÷) and the result at the end of every row and below every column. Every number from 1 to 9 goes into exactly one square. Some numbers are given.",
    mc_term_order: "Left to right",
    mc_rules_order: "A row is worked out from left to right, a column from top to bottom - one step after the other, without \"multiplication before addition\": 3 + 4 × 2 gives 7 × 2 = 14, not 11. Some school versions of this puzzle use the usual order of operations; here it is always left to right.",
    mc_term_whole: "Whole numbers",
    mc_rules_whole: "Every intermediate result and every result is a whole number greater than 0, so a division always comes out even.",
    mc_term_levels: "Levels",
    mc_rules_levels: "Easy: only + and −, 4 numbers given. Medium: also ×, 3 given. Hard: all four operators with at least one ÷, 2 given. Every puzzle has exactly one solution and can be solved without guessing.",
    mc_term_help: "Playing",
    mc_rules_help: "Tap an empty square, then a number below the board; tap the number again or Clear to empty the square. A number already used in another square moves here. Once a row or column is full, a tick or a cross shows whether it works out. The Hint button marks a wrong number first, otherwise it fills in a square that can be worked out now.",
    mc_rules_example_title: "Example",
    mc_rules_example: "A solved Calculation Grid. Middle row: 9 − 1 = 8, then 8 × 3 = 24 - worked from left to right, not 9 − 3 = 6.",
    mc_history_title: "History of Calculation Grid",
    mc_history_magic_title: "The magic square",
    mc_history_magic_p1: "The best-known number puzzle with the numbers 1 to 9 in a 3 × 3 grid is the magic square, in which every row, column and diagonal adds up to 15. In China it is known as the Lo Shu (Luoshu) and is tied to a legend about a turtle. How old it really is remains unclear: the dates given in the sources lie far apart.",
    mc_history_today_title: "Calculations in rows and columns",
    mc_history_today_p1: "Calculation Grid keeps the 3 × 3 grid with the numbers 1 to 9, but asks for a different calculation in every row and column. Puzzles of this kind appear in school workbooks and puzzle collections, partly with the usual order of operations. Where this form first appeared, PaperGames could not find out; the name Calculation Grid is a plain description."
});
I18n.markTextLoaded("en");
