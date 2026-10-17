// text/en/mancala.js
// Rules and history texts of mancala (en). Loaded by mancala-rules.html and mancala-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    mancala_rules_title: "Mancala Rules",
    mancala_rules_intro: "A quick reference for PaperGames's version of Mancala - specifically Kalaha, the standardized ruleset most digital mancala games use - useful if you're rusty, or learning.",
    mancala_rules_basics_title: "The basic idea",
    mancala_term_board: "Pits and stores",
    mancala_rules_board: "Each player has six pits in a row, starting with 4 seeds each, plus a store at the right-hand end of their own row. On your turn, pick one of your own non-empty pits and sow its seeds one at a time into each following pit, moving counter-clockwise around the whole board.",
    mancala_term_sowing: "Sowing",
    mancala_rules_sowing: "Sowing drops one seed into every pit you pass, including your own store, but always skips over your opponent's store entirely - it never receives a seed from your move.",
    mancala_term_extra: "Extra turns",
    mancala_rules_extra: "If your very last seed lands in your own store, you immediately move again.",
    mancala_rules_capture_title: "Capturing",
    mancala_term_capture: "Capturing",
    mancala_rules_capture: "If your very last seed lands in one of your own pits that was empty before that seed, you capture it along with every seed in the pit directly opposite - all of it goes straight into your store. If that opposite pit is empty, nothing is captured.",
    mancala_rules_end_title: "How a game ends",
    mancala_term_win: "Winning",
    mancala_rules_win: "The game ends the moment either player's six pits are all empty on their turn. Every seed remaining on the other side is swept into that player's own store, and whoever has the most seeds in their store wins (an equal split is a draw).",
    mancala_term_resignation: "Resignation",
    mancala_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    mancala_history_title: "The History of Mancala",
    mancala_history_origins_title: "Pits Carved in Stone",
    mancala_history_origins_p1: "Boards for mancala-family games have been found carved directly into stone across Africa and the Middle East, some estimated at well over a thousand years old, though - as with many ancient games - exact dating and origin are debated among historians.",
    mancala_history_origins_p2: "What's clear is that pit-and-seed games spread and diversified enormously over the centuries, producing hundreds of regional variants across Africa, the Middle East and Asia, from Oware and Bao to Congkak - each with its own board size, seed count, and capture rules, all sharing the same core idea of sowing.",
    mancala_history_spread_title: "One Family, Countless Variants",
    mancala_history_spread_p1: "Unlike chess or Go, which each settled into one dominant global ruleset, mancala games never fully converged: the family is defined more by its shared mechanic - sowing seeds one by one around a board of pits - than by any single fixed set of rules.",
    mancala_history_spread_p2: "That variety is part of why mancala games remain deeply embedded in everyday culture across much of Africa and Asia, often played casually in markets and courtyards with nothing more than a board scratched into the ground and a handful of seeds or pebbles.",
    mancala_history_modern_title: "Kalaha: A Standardized Ruleset",
    mancala_history_modern_p1: "The specific ruleset PaperGames uses - two rows of six pits, a store at each end, capture into an empty pit, and an extra turn for landing in your own store - is Kalaha, a mancala variant that was trademarked and popularized as a mass-produced board game in the mid-20th century United States.",
    mancala_history_modern_p2: "Kalaha's clean, precisely defined rules made it a natural fit for computers early on, and it's now one of the most common mancala rulesets found in digital games and apps worldwide, including this one."
});
I18n.markTextLoaded("en");
