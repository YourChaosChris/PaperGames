// text/en/mahjong.js
// Rules and history texts of mahjong (en). Loaded by mahjong-rules.html and mahjong-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    mahjong_rules_title: "Mahjong Solitaire Rules",
    mahjong_rules_intro: "A quick reference for how PaperGames plays Mahjong Solitaire - useful if you're rusty, or learning.",
    mahjong_rules_basics_title: "The basic idea",
    mahjong_term_layout: "The layout",
    mahjong_rules_layout: "80 tiles are stacked three layers deep in a pyramid-like shape. A tile is free to pick up only when nothing sits on top of it and at least one of its immediate left or right neighbors, on its own layer, is missing or already cleared.",
    mahjong_term_matching: "Matching",
    mahjong_rules_matching: "Click a free tile, then click another free tile showing the same symbol to clear both from the board. Every deal is generated so that a full clear is always possible from the starting position, though a careless order of matches can still leave you stuck partway through.",
    mahjong_term_shuffle: "Getting stuck",
    mahjong_rules_shuffle: "If no legal match remains anywhere on the board, use Shuffle remaining tiles to redeal fresh symbols onto whatever's left - a new solution is guaranteed from that point onward, so a single stuck position never has to mean starting completely over.",
    mahjong_rules_end_title: "Finishing a game",
    mahjong_term_win: "Cleared",
    mahjong_rules_win: "The board is cleared the moment every tile has been matched away.",
    mahjong_history_title: "The History of Mahjong Solitaire",
    mahjong_history_origins_title: "Borrowed Tiles, New Game",
    mahjong_history_origins_p1: "Mahjong Solitaire (also called Shanghai) is not a traditional Chinese game - it's a Western invention from the early-to-mid 20th century that repurposes the beautifully illustrated tile set from the four-player game Mahjong (itself a 19th-century Chinese creation) for an entirely different, single-player matching puzzle with none of the original game's melds, discards, or scoring hands.",
    mahjong_history_origins_p2: "Exactly who first combined a pair-matching solitaire format with Mahjong tiles is genuinely unclear, with competing claims stretching back decades before the computer era - what's certain is that the pairing didn't become a global phenomenon until it made the jump to personal computers.",
    mahjong_history_spread_title: "A 1980s Computer Screen Staple",
    mahjong_history_spread_p1: "The game reached a mass audience through early computer versions in the 1980s, most notably Activision's 1986 'Shanghai' for the Macintosh - popular enough that 'Shanghai' became, and in many places remains, an alternate name for the whole genre of solitaire tile-matching games built around the classic layered layout.",
    mahjong_history_spread_p2: "The layout that gives the game its name - a stepped, pyramid-like mound nicknamed 'the Turtle' - became so strongly associated with the genre that most implementations, including this one, default to some variation of it rather than inventing a new shape.",
    mahjong_history_modern_title: "A Solvable-By-Construction Puzzle",
    mahjong_history_modern_p1: "Unlike a game such as Sudoku or a Nonogram, where a puzzle's solution is checked for uniqueness after being designed, a Mahjong Solitaire deal is normally guaranteed playable a different way: many implementations, including PaperGames's, build the deal by working backward from an empty board, replaying a legal removal sequence in reverse to decide which symbols go where.",
    mahjong_history_modern_p2: "That guarantees at least one winning path exists from the very first tile placed, but - exactly as with a real deck of Klondike solitaire cards - it says nothing about whether any particular sequence of matches a player actually makes will reach it, which is why getting stuck partway through a perfectly solvable deal is a normal, expected part of the game rather than a sign anything went wrong."
});
I18n.markTextLoaded("en");
