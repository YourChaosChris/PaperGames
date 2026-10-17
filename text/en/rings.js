// text/en/rings.js
// Rules and history texts of rings (en). Loaded by rings-rules.html and rings-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    rg_rules_title: "Turn the Rings Rules",
    rg_rules_intro: "Turn the rings until every ray shows one shape.",
    rg_rules_basics_title: "The rules",
    rg_term_rings: "The rings",
    rg_rules_rings: "Three to five rings lie one inside the other, numbered from the inside out. Each ring has 8 fields, each with a shape: circle, ring, triangle, square, star, diamond, cross or crescent moon. Filled and open shapes can be told apart without colour.",
    rg_term_turn: "Turning",
    rg_rules_turn: "Under the picture every ring has two buttons: ↺ turns it one field to the left (anticlockwise), ↻ one field to the right (clockwise). The ring jumps to its new place at once.",
    rg_term_goal: "Goal",
    rg_rules_goal: "Dashed lines divide the picture into 8 rays from the middle outwards. The puzzle is solved when each ray shows the same shape on every ring. Different rays may show different shapes.",
    rg_term_coupled: "Coupled rings",
    rg_rules_coupled: "On Hard the rings are coupled: turning a ring also turns the next ring outwards by one field in the same direction. The outermost ring turns alone.",
    rg_term_levels: "Levels",
    rg_rules_levels: "Easy: 3 rings with 4 kinds of shape, 3 to 5 moves. Medium: 4 rings with 6 kinds, 5 to 8 moves. Hard: 5 coupled rings with 8 kinds, 7 to 11 moves. The computer works out the fewest moves for every puzzle; they are shown from the start.",
    rg_term_help: "Hint",
    rg_rules_help: "Hint frames the button of a turn that brings you one step nearer to the solution. Undo takes back the last turn; it counts as a move.",
    rg_rules_example_title: "Example",
    rg_rules_example: "Ring 2 is one field ahead of ring 1. One turn of ring 2 to the left puts the same shape on every ray.",
    rg_history_title: "History of Turn the Rings",
    rg_history_disk_title: "Alberti's cipher disk",
    rg_history_disk_p1: "In 1467 the Italian scholar Leon Battista Alberti described, in his treatise on ciphers, a disk of two rings joined by a pin: a fixed outer ring with letters and a turning inner ring with other signs. Turning the inner ring paired each letter with a different sign. It is counted as the first example of a cipher with several alphabets.",
    rg_history_game_title: "Rings as a puzzle",
    rg_history_game_p1: "Puzzles in which rings or disks with pictures are turned until everything lines up are found today in many forms, as toys and in puzzle books. The version here - with up to five rings and, on Hard, rings that turn their neighbour along - is made for PaperGames. The computer checks every puzzle and counts its fewest moves."
});
I18n.markTextLoaded("en");
