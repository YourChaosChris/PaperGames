// text/en/fanorona.js
// Rules and history texts of fanorona (en). Loaded by fanorona-rules.html and fanorona-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    fanorona_rules_title: "Fanorona Rules",
    fanorona_rules_intro: "A quick reference for how PaperGames plays Fanorona - useful if you're rusty, or learning.",
    fanorona_rules_basics_title: "The basic idea",
    fanorona_term_board: "The board",
    fanorona_rules_board: "45 points in a 5x9 grid, connected by horizontal, vertical, and some diagonal lines - the diagonals alternate direction from cell to cell, so about half the points ('strong' points) connect to all 8 neighbors while the rest ('weak' points) connect only orthogonally. Each player starts with 22 pieces filling their two nearest rows plus half of the middle row, alternating colors, with the very center point left empty. White moves first.",
    fanorona_term_capture: "Capturing",
    fanorona_rules_capture: "Slide a piece along a line to an adjacent empty point. Depending on the direction you moved, this can capture a straight line of enemy pieces by approach, by withdrawal, or (if both are possible) your choice of either - see the examples below. Capturing is mandatory: if any capturing move is available anywhere on the board, you must play one instead of a quiet (paika) move.",
    fanorona_term_approach: "Capture by approach",
    fanorona_rules_approach: "Move a piece so that the point immediately beyond your new position, in the same direction you just moved, holds an enemy piece. That piece, and every enemy piece directly behind it in an unbroken line, is captured.",
    fanorona_term_withdrawal: "Capture by withdrawal",
    fanorona_rules_withdrawal: "Move a piece away from an enemy piece that was sitting right behind its old position, in the exact opposite direction of your move. That piece, and every enemy piece directly behind it in an unbroken line, is captured.",
    fanorona_rules_example_title: "Worked example",
    fanorona_rules_example_intro: "In the mini-diagrams below, ● is White, ○ is Black, and the dashed circle is the point White is about to move to.",
    fanorona_rules_example_approach_caption: "Approach: White slides A→B. Since Black pieces sit on the continuation of that same line just beyond B, they're captured.",
    fanorona_rules_example_withdrawal_caption: "Withdrawal: White slides A→B, moving directly away from Black pieces that were sitting behind A. Because White is now moving away from them along that same line, they're captured too.",
    fanorona_term_chain: "Continuing a capture",
    fanorona_rules_chain: "After capturing, the same piece may keep capturing again from its new position - but unlike checkers, you're never forced to: you can stop after any capture. Two extra rules apply while chaining: the piece can't slide in the exact same direction twice in a row, and it can never land on a point it has already visited earlier in the same turn.",
    fanorona_rules_end_title: "How a game ends",
    fanorona_term_win: "Winning",
    fanorona_rules_win: "You win by capturing every one of your opponent's pieces, or if your opponent has no legal move at all on their turn.",
    fanorona_term_resignation: "Resignation",
    fanorona_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    fanorona_history_title: "The History of Fanorona",
    fanorona_history_origins_title: "From Alquerque to the Highlands of Madagascar",
    fanorona_history_origins_p1: "Fanorona is believed to have descended from Alquerque, an ancient capture-and-jump game that most likely reached Madagascar with Arab or Southeast Asian traders. Alquerque is also the shared ancestor of checkers/draughts, which makes Fanorona and checkers distant cousins: both kept the basic idea of jumping to capture, while independently building very different rules around it.",
    fanorona_history_origins_p2: "Malagasy players reshaped the imported game into something distinctly their own: a larger 5x9 board with a mix of orthogonal and diagonal lines, and the approach/withdrawal capture system that has no equivalent in Alquerque or checkers. Some of the oldest surviving Fanorona boards, carved in stone near Antananarivo, are estimated to date from the 16th or 17th century.",
    fanorona_history_legend_title: "A Game That (Allegedly) Decided a Throne",
    fanorona_history_legend_p1: "According to a well-known Malagasy legend, King Ralambo once tested his two sons to see who was more fit to succeed him: he pretended to be gravely ill and had them summoned, to see which would arrive first. The elder son, absorbed in a difficult Fanorona position, is said to have stayed to finish the game - so his younger brother arrived first and, by the story's telling, went on to inherit the throne. As with most oral histories passed down over centuries, the details vary between retellings and the episode can't be verified as historical fact, but it's still cited today as evidence of just how seriously Fanorona has long been taken in Madagascar.",
    fanorona_history_modern_title: "Still Madagascar's Game",
    fanorona_history_modern_p1: "Fanorona remains widely played across Madagascar today and is often described as the country's national board game, played casually in villages and towns and also studied competitively. Smaller variants exist too - a 3x3 version (Fanoron-Telo, roughly as deep as tic-tac-toe) and a 5x5 version (Fanoron-Dimy) - but the 5x9 board described on this page (Fanoron-Tsivy) is the standard, best-known form.",
    fanorona_history_modern_p2: "The game has also drawn real academic interest: computer analysis published in 2008 weakly solved Fanorona, establishing that a perfectly-played game ends in a draw - putting it in the same rare company as checkers, another ancient game precisely solved by modern computers."
});
I18n.markTextLoaded("en");
