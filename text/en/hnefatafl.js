// text/en/hnefatafl.js
// Rules and history texts of hnefatafl (en). Loaded by hnefatafl-rules.html and hnefatafl-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    hnefatafl_rules_title: "Hnefatafl Rules",
    hnefatafl_rules_intro: "A quick reference for how PaperGames plays this ancient Norse siege game (the Brandub variant, on a 7x7 board) - useful if you're rusty, or learning.",
    hnefatafl_rules_basics_title: "The basic idea",
    hnefatafl_term_setup: "The setup",
    hnefatafl_rules_setup: "The king starts on the center throne, guarded by four defenders, besieged by eight attackers coming from the middle of each edge. Attackers move first, and the two sides have very different goals: the king's side wants him to escape, the attackers want to trap him.",
    hnefatafl_term_moving: "Moving",
    hnefatafl_rules_moving: "Every piece - attacker, defender, or the king - moves like a rook: any distance in a straight line, but never through or onto another piece. The throne and the four corners are off-limits to everyone but the king, who may freely enter and leave them.",
    hnefatafl_term_capture: "Capturing",
    hnefatafl_rules_capture: "A regular piece is captured by custodian capture: trap it between two enemy pieces (or one enemy piece and the throne or a corner) on opposite sides, and it's removed. Only the piece that just moved can trigger a capture, so moving a piece between two enemies yourself is always safe.",
    hnefatafl_rules_end_title: "Winning the game",
    hnefatafl_term_win: "How the game ends",
    hnefatafl_rules_win: "The king's side wins the moment he reaches any of the four corners. The attackers win by surrounding the king on all four sides with attackers (the edge of the board counts as one of those sides, so a king pinned against the edge can be trapped with only three).",
    hnefatafl_history_title: "The History of Hnefatafl",
    hnefatafl_history_origins_title: "A Viking-Age Board Game",
    hnefatafl_history_origins_p1: "Hnefatafl (\"king's table\") belongs to the wider Tafl family of board games, played across Scandinavia, the British Isles, and Northern Europe from at least the Iron Age through the early medieval period - long before chess reached the region from the south.",
    hnefatafl_history_origins_p2: "Archaeological finds of boards and pieces turn up from Ireland to Ukraine, and the game is mentioned in several Old Norse sagas, including one where a game of tafl is played as Norway's king lies dying - a sign of how thoroughly it was woven into everyday life.",
    hnefatafl_history_design_title: "An Asymmetric Siege",
    hnefatafl_history_design_p1: "Unlike chess, the two sides in Tafl don't mirror each other at all: a small defending force protects a king in the center, badly outnumbered by a larger surrounding army - and each side is chasing a completely different goal, escape versus capture, rather than the shared goal of \"eliminate the enemy king\".",
    hnefatafl_history_design_p2: "That asymmetry is also why so many variants exist: board sizes from 7x7 up to 19x19 and differing capture rules for the king are attested across different regions and centuries, since - unlike chess - no single rulebook survived to standardize it before the game fell out of common use after chess spread throughout Europe.",
    hnefatafl_history_version_title: "This Version",
    hnefatafl_history_version_p1: "PaperGames plays the smaller Brandub variant (7x7, historically associated with Ireland) with a clearly-defined, self-consistent ruleset for movement and capture - since surviving historical sources genuinely disagree on some of the finer edge cases, rather than picking one specific medieval reconstruction to follow to the letter."
});
I18n.markTextLoaded("en");
