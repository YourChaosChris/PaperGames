// text/en/twenty48.js
// Rules and history texts of twenty48 (en). Loaded by twenty48-rules.html and twenty48-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    twenty48_rules_title: "2048 Rules",
    twenty48_rules_intro: "A quick reference for how PaperGames plays 2048 - useful if you're rusty, or learning.",
    twenty48_rules_basics_title: "The basic idea",
    twenty48_term_board: "The board and sliding",
    twenty48_rules_board: "Every move slides all the tiles on the 4x4 board as far as they'll go in one direction - up, down, left or right. After every move that actually shifts something, a new tile (usually a 2, occasionally a 4) appears in a random empty cell.",
    twenty48_term_merging: "Merging",
    twenty48_rules_merging: "When two tiles of the same value collide while sliding, they merge into one tile worth their sum, adding that new value to your score. Each tile can only merge once per move, so three equal tiles sliding together merge the leading pair and leave the third tile alone rather than cascading.",
    twenty48_rules_end_title: "How a game ends",
    twenty48_term_win: "Reaching 2048",
    twenty48_rules_win: "Merge your way up to a 2048 tile and you've won - but the game doesn't stop there. Keep playing afterward to push your score (and the board) even further.",
    twenty48_term_loss: "Running out of moves",
    twenty48_rules_loss: "The game ends the moment the board is completely full and no two adjacent tiles share a value, so no move - in any direction - could change anything.",
    twenty48_history_title: "The History of 2048",
    twenty48_history_origins_title: "Built On Threes",
    twenty48_history_origins_p1: "2048 was created in March 2014 by 19-year-old Italian developer Gabriele Cirulli over a single weekend, as a personal exercise in learning to build a complete game quickly. He didn't invent the core mechanic from scratch: 2048 is an explicit clone of a game called 1024 (by Veewo Studio), which itself was inspired by an earlier game called Threes! (by Asher Vollmer, Greg Wohlwend and Jimmy Hinson) that had been in careful development for over a year.",
    twenty48_history_origins_p2: "Cirulli released 2048's source code for free under an open license from day one, which turned out to matter enormously: rather than shutting down clones, it invited them, and the game spread by being endlessly and legally reimplemented rather than merely played.",
    twenty48_history_spread_title: "A Viral, Cloned Sensation",
    twenty48_history_spread_p1: "The game went viral within days of release, reportedly drawing millions of players within its first two weeks, and prompted an enormous wave of clones, ports, and variants - reskinned versions swapping in everything from emoji to pop-culture characters, plus size variants, colored-tile variants, and three-dimensional versions.",
    twenty48_history_spread_p2: "This PaperGames version deliberately keeps the original's 4x4 board and 90%/10% two-or-four spawn rate rather than picking one of those variants - the same choice this collection makes everywhere else, favoring the standard, well-understood ruleset over a novel spin on it.",
    twenty48_history_modern_title: "A Small Board, Seriously Studied",
    twenty48_history_modern_p1: "Despite its simple rules, optimal 2048 play turns out to be a genuinely hard search problem because of the randomness in tile spawning: strong computer players use expectimax search (weighing moves against the probability of each possible next tile) rather than the plain minimax search a deterministic game like chess allows.",
    twenty48_history_modern_p2: "The very best documented computer players can reach the 32768 tile with high probability and have occasionally reached 65536 - two doublings beyond the tile most human players are thrilled to ever see once."
});
I18n.markTextLoaded("en");
