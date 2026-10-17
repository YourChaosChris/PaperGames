// text/en/fleetbattle.js
// Rules and history texts of fleetbattle (en). Loaded by fleetbattle-rules.html and fleetbattle-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    fleetbattle_rules_title: "Fleet Battle Rules",
    fleetbattle_rules_intro: "A quick reference for how PaperGames plays Fleet Battle - useful if you're rusty, or learning.",
    fleetbattle_rules_basics_title: "The basic idea",
    fleetbattle_term_fleet: "The fleet",
    fleetbattle_rules_fleet: "Each side has five ships: a Carrier (5 cells), a Battleship (4 cells), a Cruiser (3 cells), a Submarine (3 cells), and a Destroyer (2 cells). Every ship occupies a straight horizontal or vertical run of consecutive cells on a 10x10 grid.",
    fleetbattle_term_placement: "Placement",
    fleetbattle_rules_placement: "Before battle begins, you place your five ships on your own grid; the computer places its fleet automatically and keeps it hidden. This app uses the strict standard rule that ships may not touch each other, not even diagonally - some casual variants allow touching, but that variant is not offered here.",
    fleetbattle_rules_play_title: "Taking your turn",
    fleetbattle_term_shots: "Firing",
    fleetbattle_rules_shots: "Players alternate turns, one shot per turn regardless of whether it hits or misses (no bonus shot for a hit). Click a cell on the enemy grid to fire; the result - hit or miss - is revealed immediately.",
    fleetbattle_term_sinking: "Sinking a ship",
    fleetbattle_rules_sinking: "When every cell of a ship has been hit, it is sunk, and its full outline is revealed on the board.",
    fleetbattle_rules_end_title: "How a game ends",
    fleetbattle_term_win: "Winning",
    fleetbattle_rules_win: "The first side to sink all five of the opponent's ships wins.",
    fleetbattle_term_resignation: "Resignation",
    fleetbattle_rules_resignation: "You can resign at any time during battle, ending the game immediately in the computer's favor.",
    fleetbattle_history_title: "The History of Fleet Battle",
    fleetbattle_history_origins_title: "A World War I-Era Paper Game",
    fleetbattle_history_origins_p1: "Long before any company sold it in a box, soldiers and schoolchildren were already playing a paper-and-pencil guessing game with roots going back to around the First World War: each player secretly marks ship shapes on a grid of their own, then the two take turns calling out grid coordinates, marking hits and misses on a second grid to track the enemy's fleet.",
    fleetbattle_history_origins_p2: "Games of this family were sometimes called \"Salvo\", and countless variations on the grid size, fleet composition and calling-out procedure circulated informally for decades before anyone standardized or sold them commercially.",
    fleetbattle_history_pad_title: "A Commercial Pad-and-Pencil Game",
    fleetbattle_history_pad_p1: "Starting in the 1930s, several publishers began selling the paper version as a printed pad-and-pencil game under various names, formalizing the fleet sizes and the grid-and-coordinates format that still defines the game today, well before any pegboard or plastic ship ever existed.",
    fleetbattle_history_milton_title: "The Pegboard Edition",
    fleetbattle_history_milton_p1: "The version most people recognize today, sold under the trademarked name \"Battleship\", was published by the Milton Bradley Company starting in 1967, turning the pencil-and-paper original into a plastic two-board game with pegs to mark hits and misses.",
    fleetbattle_history_milton_p2: "Later editions added molded plastic ships to sit on the pegboard grids, movie and video game adaptations, and electronic talking versions - but the underlying mechanic never changed: guess hidden grid positions through a sequence of shots, reported back as hits or misses.",
    fleetbattle_history_version_title: "This Version",
    fleetbattle_history_version_p1: "PaperGames implements the classic grid-guessing naval combat mechanic under the generic name \"Fleet Battle\" rather than the trademarked name \"Battleship\", in the same way this collection uses its own descriptive names for a few other games whose best-known names are trademarks, such as Four in a Row, Wall Maze and Card Tactics."
});
I18n.markTextLoaded("en");
