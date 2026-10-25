// text/en/hex.js
// Rules and history texts of hex (en). Loaded by hex-rules.html and hex-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    hex_rules_title: "Hex Rules",
    hex_rules_intro: "A quick reference for how PaperGames plays Hex - useful if you're rusty, or learning.",
    hex_rules_basics_title: "The basic idea",
    hex_term_setup: "The setup",
    hex_rules_setup: "The board is a rhombus of hexagonal cells. Black (filled stones) owns the top and bottom edges, White (outlined stones) owns the left and right edges. Black moves first. Printed Hex boards often use red and blue; PaperGames plays with black and white, because an e-ink screen shows no colours.",
    hex_term_moving: "Taking a turn",
    hex_rules_moving: "On your turn, place one stone of your own color on any empty cell - there's no capturing and stones never move once placed.",
    hex_term_swap: "The swap rule",
    hex_rules_swap: "Moving first is an advantage, so the swap rule is on unless you turn it off before the game. After Black's first stone, White may tap Swap instead of placing a stone: the players change colors, the first stone now belongs to the player who was White, and the other player goes on as White. Black still connects top and bottom, White left and right. The computer swaps when the first stone lies in the middle of the board.",
    hex_term_win: "Winning",
    hex_rules_win: "Build an unbroken chain of your own stones connecting your two edges. Hex can never end in a draw: once the board is full, one player's chain is always guaranteed to exist, whether or not either side was trying to block the other.",
    hex_rules_end_title: "A note on strategy",
    hex_term_blocking: "Attack and defense are the same move",
    hex_rules_blocking: "Because a draw is impossible, blocking your opponent's connection and building your own are really the same task looked at from two sides - a cell that helps your chain very often also breaks theirs.",
    hex_history_title: "The History of Hex",
    hex_history_origins_title: "Invented Twice",
    hex_history_origins_p1: "Hex was first invented in 1942 by Danish mathematician, poet, and designer Piet Hein, who introduced it in Denmark under the name \"Polygon\" after puzzling over whether a four-color-map-style game could ever end in a draw.",
    hex_history_origins_p2: "It was independently reinvented in 1948 by the mathematician John Nash - later a Nobel laureate in economics and the subject of the film A Beautiful Mind - while he was a graduate student at Princeton, where students played it on hexagonal bathroom floor tiles and called it \"Nash\".",
    hex_history_origins_p3: "The game reached a wider audience in 1957 when Martin Gardner wrote about it in his \"Mathematical Games\" column in Scientific American, giving it the name \"Hex\" that stuck ever since.",
    hex_history_math_title: "A Favorite of Mathematicians",
    hex_history_math_p1: "Hex is a favorite subject in game theory and topology because of a clean, provable fact: the game can never end in a draw - a consequence of the same mathematics behind the Brouwer fixed-point theorem - which also means a strategy-stealing argument proves the first player must have a winning strategy, even though nobody knows what that strategy actually is for larger boards.",
    hex_history_math_p2: "Solving Hex completely gets dramatically harder as the board grows: small boards (up to about 10x10) have been fully solved by computer search, but the standard 11x11 tournament size and larger remain unsolved, making Hex a continuing target for both game-AI research and combinatorial game theory.",
    hex_history_version_title: "This Version",
    hex_history_version_p1: "PaperGames plays on a 9x9 board, a size that keeps games comfortably shorter while still giving both the connecting and the blocking strategies real room to matter."
});
I18n.markTextLoaded("en");
