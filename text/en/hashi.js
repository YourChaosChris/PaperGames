// text/en/hashi.js
// Rules and history texts of hashi (en). Loaded by hashi-rules.html and hashi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    puzzle_rules_hint: "The \"Hint\" button helps in three stages. The first press marks where the next step is. The second press gives the reason, that is, the rule that applies there. The third press carries out the step (enters the number or builds the bridge). The hint works on your current position: if a number or bridge is wrong somewhere, it tells you that first. It never guesses - if the only way on is trying things out, it says so honestly. Hints are unlimited. A puzzle solved with hints still counts as a win; the statistics also show how many wins were with hints.",
    hashi_rules_title: "Hashiwokakero Rules",
    hashi_rules_intro: "A quick reference for how PaperGames plays Hashiwokakero (literally \"build the bridge!\", usually just called \"Hashi\" or \"Bridges\" in English) - useful if you're rusty, or learning. Instead of filling in digits, you draw bridges between numbered islands until the whole map is one connected network.",
    hashi_rules_basics_title: "The basic idea",
    hashi_term_board: "The islands",
    hashi_rules_board: "The board is a grid where some cells hold a numbered circle - an \"island\" - and the rest are empty sea. Every island's number says exactly how many bridge-endpoints must end up touching it, no more and no less.",
    hashi_term_bridges: "Drawing bridges",
    hashi_rules_bridges: "A bridge always runs perfectly straight, horizontally or vertically, directly between two islands with a completely clear line between them - no other island, and no other bridge crossing at a right angle, may sit in the way. Two islands may be joined by up to two parallel bridges (a \"double bridge\") counting twice toward both islands' numbers, but never by three or more, and a bridge can never run diagonally.",
    hashi_term_crossing: "No crossings",
    hashi_rules_crossing: "Bridges may never cross each other. If a horizontal and a vertical bridge would have to cross to both exist, only one of the two connections can be built - the other island pair simply cannot be bridged directly as long as the crossing one stands.",
    hashi_term_goal: "The goal",
    hashi_rules_goal: "Connect every island into a single network - it must be possible to travel from any island to any other one over the bridges - while making every island's bridge count match its number exactly. Matching every number without full connectivity, or connecting everything without matching every number, are both incomplete.",
    hashi_term_input: "Placing and removing bridges",
    hashi_rules_input: "Tap the line between two islands (or tap one island, then the other) to add a bridge: the first tap draws a single bridge, a second tap upgrades it to a double bridge, and a third tap removes it again. An island already showing its exact required count is highlighted; one with too many bridges is flagged the same way an over-full Kakuro run is - a sign to undo, not a dead end.",
    hashi_term_difficulty: "Difficulty",
    hashi_rules_difficulty: "Easy, Medium and Hard puzzles use progressively larger grids with more islands (roughly 11, 20 and 30 of them), which means more overlapping numbers to juggle at once, but the same rules throughout.",
    hashi_rules_example_title: "A worked example",
    hashi_term_example: "Three islands in an L",
    hashi_rules_example_p1: "Say island A (top-left) is numbered 2, island B sits directly to A's right and is numbered 1, and island C sits directly below A and is numbered 3, with nothing else nearby. A's only two possible connections are to B (right) and to C (down) - so if A needs 2 bridge-endpoints from only two available directions, both connections must exist, meaning at least a single bridge to B and a single bridge to C.",
    hashi_rules_example_p2: "B only needs 1, and it's already got its one bridge from A, so B is done - no second bridge to B is allowed, since that would give it 2. C needs 3, but has only received 1 so far from A; since A-C is C's only possible connection (assuming no other island lines up with C), that single connection must become a double bridge to give C its remaining 2 - two parallel bridges running between A and C. The puzzle is solved by that same kind of \"only one arrangement fits the numbers\" deduction on every larger board.",
    hashi_rules_end_title: "Finishing a puzzle",
    hashi_term_win: "Solved",
    hashi_rules_win: "The puzzle is solved the moment every island's bridge count matches its number exactly AND every island can be reached from every other island over the bridges drawn - both conditions at once, not just one of them.",
    hashi_history_title: "The History of Hashiwokakero",
    hashi_history_origins_title: "A Nikoli Original",
    hashi_history_origins_p1: "Hashiwokakero was invented by Nikoli, the Japanese puzzle publisher already credited elsewhere in this collection with popularizing and naming Sudoku, and with originating Kakuro and Slitherlink. It first appeared in one of Nikoli's puzzle magazines, joining that same stable of logic puzzles built from simple rules that combine into surprisingly deep chains of deduction.",
    hashi_history_origins_p2: "Its full Japanese name, Hashiwokakero, translates roughly as \"build the bridge!\" - a direct instruction rather than just a description, matching the puzzle's central action. English-language solvers most often shorten it to \"Hashi\", or simply call it \"Bridges\".",
    hashi_history_theory_title: "A Puzzle With a Graph-Theory Flavor",
    hashi_history_theory_p1: "Hashi's islands-and-connections structure inevitably brings to mind the Seven Bridges of Königsberg, the 18th-century problem Leonhard Euler used to help found graph theory - a city with islands linked by bridges, and a question about whether every bridge could be crossed exactly once in a single walk. Euler proved it impossible for Königsberg's particular layout, a landmark negative result about the bridges as they existed.",
    hashi_history_theory_p2: "Hashi borrows the same underlying picture - islands, and bridges connecting them - but turns it into a constructive puzzle rather than a proof about a fixed layout: instead of asking whether a given network can be walked in one pass, it asks the solver to build a network from scratch that satisfies every island's numbered requirement while joining the whole map together. The kinship is conceptual and visual, not a shared mathematical problem, but it's very much in the same graph-theory family.",
    hashi_history_spread_title: "A Nikoli Export Alongside Sudoku and Kakuro",
    hashi_history_spread_p1: "Like Kakuro before it, Hashiwokakero found an international audience in the years after Sudoku's worldwide newspaper boom, as puzzle editors and solvers went looking for more of what had made Nikoli's other exports so compelling - simple rules, no arithmetic or vocabulary required, and answers reached by pure deduction rather than guesswork.",
    hashi_history_spread_p2: "It's since settled in as one of Nikoli's steadier international favorites alongside Sudoku, Kakuro and Slitherlink, particularly popular with solvers who enjoy counting-and-connectivity logic - the same generate-and-verify discipline this collection's generator applies to guarantee every freshly built Hashi puzzle has one, and only one, valid solution before it's ever handed to a player."
});
I18n.markTextLoaded("en");
