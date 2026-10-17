// text/en/senet.js
// Rules and history texts of senet (en). Loaded by senet-rules.html and senet-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    senet_rules_title: "Senet Rules",
    senet_rules_intro: "A quick reference for how PaperGames plays Senet - a modern reconstruction of a game whose original rules were lost, so consider this one interpretation rather than the definitive one.",
    senet_rules_basics_title: "The basic idea",
    senet_term_pieces: "Pieces and the path",
    senet_rules_pieces: "Each player has 5 pieces on a track of 30 squares, numbered in a boustrophedon path: left to right along the top row, right to left along the middle row, and left to right again along the bottom row. On your turn, throw the sticks and move one of your pieces forward by that many squares.",
    senet_term_sticks: "Throwing the sticks",
    senet_rules_sticks: "Four two-sided throwing sticks stand in for dice: the throw is the number of sticks landing marked-side up, except throwing none of them up counts as the best result, 6, rather than 0. Throwing a 1, 4 or 6 grants another turn.",
    senet_term_stacking: "Stacking and captures",
    senet_rules_stacking: "Two or more of your own pieces may share a square, which protects them - the opponent can't land there. A single piece standing alone can be captured: an opposing piece landing on it simply swaps places with it.",
    senet_term_houses: "The three named houses",
    senet_rules_houses: "Square 15, the House of Rebirth, is always safe for whoever holds it. Square 26, the House of Beauty, can't be jumped over - a piece must land on it exactly before moving further. Square 27, the House of Water, is dangerous: a piece landing there is immediately washed back to the House of Rebirth (or square 1, if that's occupied).",
    senet_rules_end_title: "How a game ends",
    senet_term_win: "Winning",
    senet_rules_win: "A piece needs an exact throw to move off the end of the track. The first player to bear off all five of their pieces wins.",
    senet_term_resignation: "Resignation",
    senet_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    senet_history_title: "The History of Senet",
    senet_history_origins_title: "Predynastic Origins",
    senet_history_origins_p1: "Senet boards and pieces have been found in Egyptian graves dating back to around 3100 BCE, making it one of the oldest known board games in the world - predating even the Royal Game of Ur by several centuries. The name means roughly \"the game of passing\" in ancient Egyptian.",
    senet_history_origins_p2: "Early boards were etched into stone or scratched onto furniture; later, elaborately carved and inlaid Senet sets became treasured possessions of Egyptian nobility, buried alongside their owners for the afterlife.",
    senet_history_spread_title: "From Pastime to the Afterlife",
    senet_history_spread_p1: "By the New Kingdom (around 1550-1070 BCE), Senet had taken on deep religious significance: it was reinterpreted as a symbolic journey of the soul through the underworld toward rebirth, and its squares were given names - the House of Rebirth, the House of Beauty, the House of Water - referencing hazards and blessings on that journey.",
    senet_history_spread_p2: "The most famous depiction is a wall painting from the tomb of Queen Nefertari (13th century BCE), showing her playing Senet alone - a scene understood as ensuring safe passage through the afterlife rather than simple leisure.",
    senet_history_modern_title: "A Board Without a Rulebook",
    senet_history_modern_p1: "No ancient text describing Senet's exact rules has ever been found. Everything played today, including PaperGames's version, is a modern reconstruction pieced together from board layouts, the number of pieces found in burials, and later Greco-Roman boards that show related games with recorded rules.",
    senet_history_modern_p2: "Egyptologist Timothy Kendall's 1978 reconstruction is one of the most widely used starting points for these modern rule sets, though - unlike a solved game such as Connect Four - there's no way to know how closely any of them match how Senet was actually played three thousand years ago."
});
I18n.markTextLoaded("en");
