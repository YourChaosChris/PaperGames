// text/en/shapesort.js
// Rules and history texts of shapesort (en). Loaded by shapesort-rules.html and shapesort-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    shapesort_rules_title: "Shape Sort Rules",
    shapesort_rules_intro: "A sorting puzzle with shapes instead of colours: move the stones until every tube holds just one shape.",
    shapesort_rules_basics_title: "The rules",
    shapesort_term_tubes: "Tubes",
    shapesort_rules_tubes: "Each tube holds as many stones as chosen under Stones per tube: 4, 6, 8 or 10. At the start the stones are mixed up and two tubes are empty.",
    shapesort_term_move: "A move",
    shapesort_rules_move: "Tap a tube: its top stone is marked, together with any stones of the same shape right below it. Then tap another tube. The stones go there if that tube is empty or has the same shape on top - as many as fit. Tap the marked tube again to put the stones back down.",
    shapesort_term_goal: "The goal",
    shapesort_rules_goal: "The puzzle is solved when every tube is either empty or full of stones of the same shape.",
    shapesort_term_shapes: "The shapes",
    shapesort_rules_shapes: "Circle, square, triangle, star, heart, cross, diamond and moon. They differ in their outline; some are filled and some are drawn as an outline, but that is only an extra help.",
    shapesort_term_levels: "Levels",
    shapesort_rules_levels: "Easy: 4 shapes in 6 tubes. Medium: 6 shapes in 8 tubes. Hard: 8 shapes in 10 tubes. The number of stones per tube is chosen separately; with more stones the shapes are smaller and the tubes taller. On narrow screens the tubes are shown in several rows.",
    shapesort_term_tools: "Undo, Shuffle, Hint",
    shapesort_rules_tools: "Undo takes back as many moves as you like. Shuffle deals a new puzzle. Hint marks two tubes: move the top stones from the first to the second. Every puzzle has been checked to be solvable; if you get stuck, the hint says so and you can undo a few moves.",
    shapesort_rules_example_title: "Example",
    shapesort_rules_example: "The picture shows tubes during a game. The marked stones on top of the first tube may go onto the tube that has the same shape on top, or into the empty tube.",
    shapesort_history_title: "The History of Sorting Puzzles",
    shapesort_history_origins_title: "Pieces, Pegs and Rules",
    shapesort_history_origins_p1: "Puzzles in which pieces are moved between holders by fixed rules are old. The Tower of Hanoi, published by the French mathematician Édouard Lucas in 1883, has discs moved one at a time between three pegs, never a larger disc on a smaller one.",
    shapesort_history_sort_title: "Sorting by Kind",
    shapesort_history_sort_p1: "In recent years many puzzles have appeared in which mixed pieces are moved between containers until each holds only one kind - mostly as games for phones and almost always with colours. On a black-and-white e-ink screen colours do not work, so PaperGames sorts shapes instead.",
    shapesort_history_modern_title: "How PaperGames Makes Each Puzzle",
    shapesort_history_modern_p1: "Every puzzle here is dealt at random. A solver then searches for a way to sort it completely; only a deal for which it finds one is used, and no tube starts out already finished. The same solver gives the hints."
});
I18n.markTextLoaded("en");
