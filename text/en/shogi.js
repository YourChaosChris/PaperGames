// text/en/shogi.js
// Rules and history texts of shogi (en). Loaded by shogi-rules.html and shogi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    shogi_rules_title: "Shogi Rules",
    shogi_rules_intro: "A quick reference for how PaperGames plays Shogi (Japanese Chess) - useful if you're coming from international chess, since several ideas here work differently.",
    shogi_rules_basics_title: "The basic idea",
    shogi_term_board: "The board and pieces",
    shogi_rules_board: "Each side has 20 pieces on a 9x9 board: a King, a Rook, a Bishop, two Golds, two Silvers, two Knights, two Lances and nine Pawns. Pieces are plain pentagons pointing toward the opponent - which side a piece belongs to is which way it's facing, not its color. Black always moves first.",
    shogi_term_promotion: "Promotion",
    shogi_rules_promotion: "Every piece except the King and Gold can promote to a stronger form when it moves into, out of, or within the farthest three rows of the board. Promotion is optional, except when a Pawn or Lance reaches the very last row, or a Knight reaches either of the last two rows - there it's forced, since the piece would otherwise never have another legal move.",
    shogi_term_drops: "Captures and drops",
    shogi_rules_drops: "Capturing a piece doesn't remove it from the game: it switches sides, demotes back to its unpromoted form, and joins the capturing player's hand. On a later turn, instead of moving a piece already on the board, that player may drop a piece from their hand onto any empty square - one of Shogi's signature ideas, and the reason games rarely run out of material.",
    shogi_term_drop_limits: "Drop restrictions",
    shogi_rules_drop_limits: "A Pawn or Lance can't be dropped onto the last row, and a Knight can't be dropped onto either of the last two rows, since they'd have no legal move there. A Pawn can't be dropped onto a file that already has one of your own unpromoted Pawns, and a Pawn drop may never deliver checkmate outright (it may still deliver check, just not a mate).",
    shogi_rules_end_title: "How a game ends",
    shogi_term_win: "Winning",
    shogi_rules_win: "A King in check that has no way to escape, block, or capture the checking piece is checkmated - the game ends immediately.",
    shogi_term_resignation: "Resignation",
    shogi_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    shogi_term_sennichite: "Repetition (sennichite)",
    shogi_rules_sennichite: "If the same position - the same pieces on the same squares, the same pieces in both hands, and the same player to move - occurs four times, the game is a draw. Exception: if one player gave check with every one of their moves throughout the repetition, that player loses instead. PaperGames applies this rule automatically.",
    shogi_history_title: "The History of Shogi",
    shogi_history_origins_title: "From India, by way of Southeast Asia",
    shogi_history_origins_p1: "Like international chess and Xiangqi, Shogi ultimately descends from chaturanga, the ancient Indian war game that spread across Asia along trade routes starting around the 6th century CE. It reached Japan sometime before the 10th century, most likely by way of Southeast Asia and China, and was adapted over the following centuries into distinctly Japanese forms.",
    shogi_history_origins_p2: "Early Japanese chess variants were considerably larger than the modern game - some historical forms, such as Dai Shogi and the enormous Tai Shogi, used boards of 15x15 squares or more with well over a hundred pieces per side. The 9x9, 20-piece version played today emerged as the standard by around the 16th century.",
    shogi_history_spread_title: "The Drop Rule's Origins",
    shogi_history_spread_p1: "Shogi's defining feature - that a captured piece switches sides and can be dropped back onto the board - has no equivalent in chess or Xiangqi and sets it apart from every other game in this collection. Historians generally connect its emergence to the practice, common among Japan's warring samurai clans, of absorbing captured soldiers directly into the capturing army rather than treating them purely as casualties.",
    shogi_history_spread_p2: "Whatever its exact origin, the drop rule transforms the game's character: material is almost never permanently removed, games rarely stall through simple material exchange, and an aggressive attack can be fed indefinitely by whatever the attacker has already captured.",
    shogi_history_modern_title: "A Living Professional Tradition",
    shogi_history_modern_p1: "Shogi has supported a continuous professional tournament tradition in Japan since the Edo period (17th-19th centuries), when the Tokugawa shogunate funded a hereditary house system of professional players - a lineage that evolved into the modern Japan Shogi Association, founded in 1924.",
    shogi_history_modern_p2: "Computer Shogi long lagged behind computer chess because of the drop rule's huge branching factor, but by the mid-2010s programs such as Ponanza had decisively defeated top professional players, prompting the same debates about human-computer play that chess had gone through a decade or two earlier."
});
I18n.markTextLoaded("en");
