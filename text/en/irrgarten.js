// text/en/irrgarten.js
// Rules and history texts of irrgarten (en). Loaded by irrgarten-rules.html and irrgarten-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    ig_rules_title: "Maze Rules",
    ig_rules_intro: "A square maze of cells and walls. Find the way from the start to the goal.",
    ig_rules_basics_title: "The rules",
    ig_term_move: "Walking",
    ig_rules_move: "You start in the cell with the circle at the top left; the goal is the flag at the bottom right. Tap a cell next to you to step into it, or a cell further along a straight, open passage to walk there at once. Your way is drawn as a thick line.",
    ig_term_draw: "Drawing with a finger",
    ig_rules_draw: "In the settings you can choose \"Drawing with a finger\": move your finger through the passages and the circle follows from cell to cell. Taps work as well.",
    ig_term_walls: "Walls and going back",
    ig_rules_walls: "Walls cannot be crossed; a short note says so. Stepping back into the cell you came from takes it off your way, and a tap on any cell of your way goes back to it.",
    ig_term_goal: "The goal",
    ig_rules_goal: "When you reach the flag the maze is solved. Every maze has exactly one way from the start to the goal.",
    ig_term_levels: "Levels",
    ig_rules_levels: "Easy (for children): 6 x 6 cells with wide passages. Medium: 10 x 10. Hard: 15 x 15. Very hard: 20 x 20. Each level has five mazes, one after the other; each is made by the program from a fixed number, so it is the same every time.",
    ig_term_help: "Back and hint",
    ig_rules_help: "\"Back\" takes one cell back. \"Hint\" marks the next three cells of the right way with dashed rings, also out of a dead end.",
    ig_history_title: "The History of Mazes",
    ig_history_old_title: "Very old patterns",
    ig_history_old_p1: "Winding patterns that lead to a centre are found on stones, coins and floors from many old cultures. Many of them have only one path with no choices; the idea of a puzzle with dead ends came later.",
    ig_history_puzzle_title: "Hedges and puzzle books",
    ig_history_puzzle_p1: "From the 16th century on, gardens were planted with hedge mazes in which visitors could get lost. In the 19th and 20th centuries mazes on paper became a fixed part of children's magazines and puzzle books. Mathematicians describe them as graphs, and computer programs can make new ones without end.",
    ig_history_here_title: "This version",
    ig_history_here_p1: "Every maze here is made by the program itself: a walk through the grid that knocks down walls until every cell can be reached. No maze is copied from a book."
});
I18n.markTextLoaded("en");
