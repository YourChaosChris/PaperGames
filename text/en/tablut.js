// text/en/tablut.js
// Rules and history texts of tablut (en). Loaded by tablut-rules.html and tablut-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    tablut_rules_title: "Tablut Rules",
    tablut_rules_intro: "A quick reference for how PaperGames plays Tablut, the 9x9 member of the Tafl family - useful if you're rusty, or learning.",
    tablut_rules_basics_title: "The basic idea",
    tablut_term_setup: "The setup",
    tablut_rules_setup: "The king starts on the central throne in a cross of eight defenders, besieged by eight attackers stationed two per edge. Attackers move first, and the two sides chase very different goals: the king's side wants him to reach a corner, the attackers want to trap him first.",
    tablut_term_moving: "Moving",
    tablut_rules_moving: "Every piece - attacker, defender, or the king - moves like a rook: any distance in a straight line, but never through or onto another piece.",
    tablut_term_special: "The throne and corners",
    tablut_rules_special: "The center throne and the four corner squares are off-limits to everyone but the king: attackers and defenders can neither land on them nor pass through them, though the king may freely re-enter the empty throne. The corners are the king's only escape squares.",
    tablut_term_capture: "Capturing",
    tablut_rules_capture: "A regular piece (attacker or defender) is captured by custodian capture: trap it between two enemy pieces, or one enemy piece and a hostile special square (the empty throne, or a corner), on opposite sides of a straight line. Only the piece that just moved can trigger a capture, so moving a piece between two enemies yourself is always safe.",
    tablut_rules_example_title: "Worked example",
    tablut_rules_example_intro: "Two short examples of how the sandwich works in practice (using the classic a-i / 1-9 board coordinates, column then row):",
    tablut_term_example_ordinary: "An ordinary sandwich",
    tablut_rules_example_ordinary: "A Swedish defender at d6 has a Muscovite attacker sitting at c6, immediately to its west. When a second attacker slides into e6, the defender is now trapped between two attackers in a straight line - and is captured.",
    tablut_term_example_throne: "A throne-assisted sandwich",
    tablut_rules_example_throne: "A defender at e6 sits just south of the empty throne (e5). A single attacker sliding into e7, immediately south of the defender, is enough to capture it: the empty throne counts as hostile on the opposite side, so no second attacker piece is needed.",
    tablut_rules_end_title: "Winning the game",
    tablut_term_kingcapture: "Capturing the king",
    tablut_rules_kingcapture: "The king is captured only when all four squares orthogonally adjacent to him are hostile: occupied by attackers, or - for a side facing the throne - the empty throne itself, which counts as an attacker-equivalent hostile square. Unlike a regular piece, the board edge never counts as hostile to the king in this ruleset: a king pushed to the rim of the board still needs a real attacker on every open side.",
    tablut_term_win: "How the game ends",
    tablut_rules_win: "The king's side wins the instant he reaches any of the four corners. The attackers win by capturing the king as described above. A side with no legal move at all on its turn loses.",
    tablut_history_title: "The History of Tablut",
    tablut_history_linnaeus_title: "Linnaeus in Lapland",
    tablut_history_linnaeus_p1: "In 1732, the Swedish naturalist Carl Linnaeus - decades before he revolutionized biology with his system for naming species - travelled through Lapland cataloguing plants, animals, and the customs of the Sami people he met along the way. Among his notes, he recorded a board game the Sami called Tablut: its 9x9 board, its pieces, and the rules by which they played.",
    tablut_history_linnaeus_p2: "That description turned out to be enormously important. Almost no complete rulebook for any Tafl game survived from the Viking Age itself - the game had simply fallen out of use across most of Europe by the time anyone thought to write its rules down. Linnaeus's notes on Tablut, though recorded centuries after Tafl's Viking-Age heyday and imperfect in places (his manuscript is ambiguous about a couple of edge cases, which is exactly why different reconstructions and modern rule sets still disagree on some details today), remain the single most important primary source scholars have used ever since to reconstruct how the whole Tafl family was likely played.",
    tablut_history_family_title: "The Best-Known Tafl Variant",
    tablut_history_family_p1: "Partly because of that documentation, Tablut is the best-known and most historically significant member of the Tafl family - the one most often used as the baseline when reconstructing the rules for its many relatives, from the small 7x7 Brandub up to the enormous 19x19 Alea Evangelii.",
    tablut_history_brandub_link: "PaperGames also has the smaller 7x7 Brandub variant, if you'd like to compare the two board sizes.",
    tablut_history_version_title: "This Version",
    tablut_history_version_p1: "PaperGames plays Tablut on the standard 9x9 board with 8 attackers, 8 defenders and a king, using a clearly-defined modern king-capture rule (see the rules page) - since, as Linnaeus's own notes illustrate, even the best-documented Tafl source leaves some details open to interpretation."
});
I18n.markTextLoaded("en");
