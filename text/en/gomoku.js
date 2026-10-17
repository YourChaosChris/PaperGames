// text/en/gomoku.js
// Rules and history texts of gomoku (en). Loaded by gomoku-rules.html and gomoku-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    gomoku_rules_title: "Gomoku Rules",
    gomoku_rules_intro: "A quick reference for how PaperGames plays Gomoku (Five in a Row) - useful if you're rusty, or learning.",
    gomoku_rules_basics_title: "The basic idea",
    gomoku_term_board: "The board and placing stones",
    gomoku_rules_board: "Stones are placed on the intersections of a 15x15 grid, exactly like Go - never moved once placed, and never captured. Black always moves first.",
    gomoku_rules_end_title: "How a game ends",
    gomoku_term_win: "Winning",
    gomoku_rules_win: "The first player to get five or more of their own stones in an unbroken line - horizontally, vertically, or diagonally - wins immediately.",
    gomoku_term_draw: "Draw",
    gomoku_rules_draw: "If the board fills completely with no five-in-a-row for either side, the game is a draw.",
    gomoku_term_resignation: "Resignation",
    gomoku_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    gomoku_history_title: "The History of Gomoku",
    gomoku_history_origins_title: "Ancient Roots, Modern Name",
    gomoku_history_origins_p1: "Games built around lining up stones on a grid go back centuries across East Asia; the specific rules now known as Gomoku took shape in Japan, where its name (五目並べ, gomokunarabe) simply means \"five points in a row.\"",
    gomoku_history_origins_p2: "It's traditionally played with the same black-and-white stones and grid-crossing board as Go, making it an easy, low-equipment variant that generations of Go players picked up as a quick side game.",
    gomoku_history_spread_title: "From Casual Pastime to Renju",
    gomoku_history_spread_p1: "Because Gomoku's plain rules give the first player (traditionally Black) a significant built-in advantage, a stricter competitive variant called Renju emerged in Japan in the early 20th century, adding extra restrictions - forbidding Black from certain double-three or double-four setups - to level the playing field.",
    gomoku_history_spread_p2: "Renju became the standard for serious tournament play, while the simpler, unrestricted ruleset played here (often called \"freestyle\" Gomoku) remained the more common casual version worldwide.",
    gomoku_history_modern_title: "A Solved First-Player Win",
    gomoku_history_modern_p1: "In 1994, researcher L. Victor Allis proved through exhaustive computer analysis (a technique called proof-number search) that freestyle Gomoku on a standard board is a forced win for the first player with perfect play.",
    gomoku_history_modern_p2: "That result is exactly why competitive Renju exists: without its extra restrictions on Black, tournament Gomoku would be a solved formality rather than a real contest - a rare case where a solved game directly reshaped how it's played competitively, rather than just being an interesting footnote."
});
I18n.markTextLoaded("en");
