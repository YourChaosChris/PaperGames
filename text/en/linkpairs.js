// text/en/linkpairs.js
// Rules and history texts of linkpairs (en). Loaded by linkpairs-rules.html and linkpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    linkpairs_rules_title: "Link the Pairs Rules",
    linkpairs_rules_intro: "Join every pair of equal symbols with a line. The lines may not cross, and together they fill the whole board.",
    linkpairs_rules_basics_title: "The rules",
    linkpairs_term_board: "The board",
    linkpairs_rules_board: "A square board of cells. Some cells hold a symbol - a number or an animal - and every symbol appears exactly twice.",
    linkpairs_term_lines: "Lines",
    linkpairs_rules_lines: "Join each pair with a line. A line runs from cell to cell, horizontally and vertically, never diagonally. Lines may not cross, may not share a cell and may not run through another symbol.",
    linkpairs_term_goal: "The goal",
    linkpairs_rules_goal: "The puzzle is solved when every pair is joined and every cell is used by a line. Every puzzle has exactly one solution.",
    linkpairs_term_draw: "Drawing",
    linkpairs_rules_draw: "Drag your finger from a symbol, or tap the symbol and then tap the cells one after another. Running into another line cuts that line back. Tap a cell of a line to shorten the line so that it ends there; you can go on drawing from that cell. Tapping a symbol starts its line afresh - tap the symbol where a line begins to clear it.",
    linkpairs_term_symbols: "Numbers or animals",
    linkpairs_rules_symbols: "In the menu you choose numbers or animals. Every cell of a line carries a small copy of its symbol, so you can see without colour which line belongs to which pair.",
    linkpairs_term_tools: "Undo and Hint",
    linkpairs_rules_tools: "Undo takes back as many steps as you like. Hint draws one correct line in full; lines in its way are cut back.",
    linkpairs_term_levels: "Levels",
    linkpairs_rules_levels: "Easy: 5 x 5. Medium: 7 x 7. Hard: 9 x 9.",
    linkpairs_rules_example_title: "A solved example",
    linkpairs_rules_example: "The picture shows a solved 5 x 5 puzzle: every pair is joined, no lines cross, and every cell is used.",
    linkpairs_history_title: "The History of Link Puzzles",
    linkpairs_history_origins_title: "Early Versions",
    linkpairs_history_origins_p1: "In 1897 a slightly different form of this puzzle appeared in a newspaper column by Sam Loyd in the Brooklyn Daily Eagle. In 1917 Henry Ernest Dudeney included a version with pairs of letters in his book Amusements in Mathematics, as a puzzle for motorists.",
    linkpairs_history_japan_title: "Numbers and Letters",
    linkpairs_history_japan_p1: "In Japan the puzzle publisher Nikoli made the puzzle popular in two forms: with pairs of letters and with pairs of numbers. The general name of the puzzle is Numberlink. A puzzle counts as well made when it has exactly one solution and the lines fill every cell.",
    linkpairs_history_modern_title: "How PaperGames Makes Each Puzzle",
    linkpairs_history_modern_p1: "The puzzles here were made in advance by PaperGames's own generator: it lays random lines that together run through every cell, then a solver checks that there is exactly one way to join the pairs. Where it finds a second way, a line is split into two pairs; lines whose ends touch are joined again as long as the solution stays the only one."
});
I18n.markTextLoaded("en");
