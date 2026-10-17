// text/en/slitherlink.js
// Rules and history texts of slitherlink (en). Loaded by slitherlink-rules.html and slitherlink-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    slitherlink_rules_title: "Slitherlink Rules",
    slitherlink_rules_intro: "A quick reference for how PaperGames plays Slitherlink (also known as \"Fences\" or \"Loop the Loop\") - useful if you're rusty, or learning. Unlike most puzzles in this collection, nothing here is filled in with numbers or letters: the whole puzzle is drawn with lines.",
    slitherlink_rules_basics_title: "The basic idea",
    slitherlink_term_board: "The grid",
    slitherlink_rules_board: "The board is a grid of dots. Between every two dots that are next to each other, horizontally or vertically, there's a potential edge that can be drawn in or left blank. Some of the squares formed by four dots contain a small number; squares with no number place no restriction at all.",
    slitherlink_term_clue: "Reading a clue",
    slitherlink_rules_clue: "A number inside a square (0, 1, 2 or 3) says exactly how many of that square's four surrounding edges must be drawn in the finished puzzle - no more, no less. A 0 means none of its four edges are ever drawn; a 3 means exactly three of the four are.",
    slitherlink_term_goal: "The goal",
    slitherlink_rules_goal: "Draw edges so that they form exactly one continuous closed loop that never branches and never crosses itself, while satisfying every numbered square's count at the same time. The loop can pass through as much or as little of the grid as it needs to, and doesn't have to enclose any particular shape - it's the numbers, not a target picture, that pin down where it has to run.",
    slitherlink_term_input: "Drawing edges",
    slitherlink_rules_input: "Tap an edge to draw it in; tap again to mark it with a dashed cross, a purely optional note-to-self meaning \"definitely not part of the loop\" (handy for edges you've ruled out but don't want to forget); tap a third time to clear it back to blank. A square whose count is already broken - too many edges drawn around it, or too few blank ones left to ever reach its number - gets a dashed ring around it as a hint that something nearby needs to change, and a dot with three or more lines already meeting at it (never allowed in a single loop) is shown hollow.",
    slitherlink_term_difficulty: "Difficulty",
    slitherlink_rules_difficulty: "Easy, Medium and Hard puzzles use progressively larger grids (5x5, 7x7 and 10x10 squares), which means a longer loop with more numbers to juggle in view at once - but the same rules throughout, and every puzzle this collection generates is checked ahead of time to have exactly one valid loop, so there's always a way to reach the solution through pure deduction, with no guessing required.",
    slitherlink_rules_example_title: "A worked example",
    slitherlink_term_example1: "A 0 next to anything",
    slitherlink_rules_example_p1: "A square clued 0 immediately draws four blank edges around itself - none of its sides can ever be part of the loop. That alone can ripple outward: if a neighboring square is clued 3, and it shares an edge with that 0-square, the shared edge is already known to be blank (since it belongs to the 0), which means all three of the 3-square's other edges must be drawn instead, since blank plus 3 drawn is the only way left to reach exactly three.",
    slitherlink_term_example2: "Following a corner",
    slitherlink_rules_example_p2: "A dot where exactly two drawn edges already meet can take no more - every other potential edge touching that same dot must be blank, since a valid loop never branches (three or more lines meeting at one dot) and never dead-ends (exactly one line meeting at a dot, with nowhere for the loop to continue). Chaining that single rule, dot by dot, corner by corner, around the forced edges a handful of clued squares create is often enough to pin down a whole region of the board before a single guess is ever needed - and, further out, once every clue is satisfied and the drawn edges already form one closed shape, every other edge on the board is forced blank as well, since a second loop is never allowed.",
    slitherlink_rules_end_title: "Finishing a puzzle",
    slitherlink_term_win: "Solved",
    slitherlink_rules_win: "The puzzle is solved the moment the drawn edges form exactly one closed loop - no loose ends, no branches, no second separate loop anywhere on the board - and every numbered square's count matches exactly. The game recognizes this the instant it happens, with no separate \"check\" step needed.",
    slitherlink_history_title: "The History of Slitherlink",
    slitherlink_history_origins_title: "A Nikoli Original",
    slitherlink_history_origins_p1: "Slitherlink was first published in 1989 by Nikoli, the Japanese puzzle company already responsible for popularizing (and naming) Sudoku and Kakuro internationally, in one of its own puzzle magazines. Unlike those two, Slitherlink wasn't an import Nikoli picked up and refined - it's one of the company's own original inventions, credited to its regular contributors the way Nikoli credits many of its puzzle types.",
    slitherlink_history_origins_p2: "Its Japanese name is often rendered in English simply as \"Loop the Loop,\" a fair description of the goal: every clue in the grid exists only to pin down the path of one single, unbroken, non-crossing loop.",
    slitherlink_history_design_title: "A Different Kind of Grid Puzzle",
    slitherlink_history_design_p1: "Where Sudoku and Kakuro ask a solver to fill cells with digits, Slitherlink asks something structurally different: draw lines between fixed points until they form one closed shape. That makes it a closer cousin to Nonogram's picture-logic and Kakuro's run deduction in spirit - reason from the clues alone, never guess - while looking nothing like either of them on the page. Solving one never requires arithmetic or language of any kind, only the same handful of local deductions (a 0 forces its edges blank, a corner with two lines already drawn forces every other line at that dot blank, and so on) applied over and over until the loop closes.",
    slitherlink_history_design_p2: "That language-independence is exactly what let it, like Nikoli's other logic puzzles, travel well: a Slitherlink grid published in a Japanese magazine needs no translation to be solved anywhere else in the world.",
    slitherlink_history_modern_title: "Joining the Wider Puzzle Family",
    slitherlink_history_modern_p1: "Slitherlink spread internationally through the same wave of interest in Nikoli's catalog that carried Sudoku to newspapers worldwide in the mid-2000s, appearing under various names - Fences and Loop the Loop both stuck in English - in puzzle books, magazines, and eventually mobile apps and websites everywhere.",
    slitherlink_history_modern_p2: "It's now a well-established member of the same family this collection already includes several of: pure-deduction logic puzzles that need no shared language or arithmetic to enjoy, generated fresh here with a computer-verified guarantee that every board has exactly one valid solution, the same way this collection's Sudoku, Kakuro, and Nonogram puzzles are."
});
I18n.markTextLoaded("en");
