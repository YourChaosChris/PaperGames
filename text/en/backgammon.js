// text/en/backgammon.js
// Rules and history texts of backgammon (en). Loaded by backgammon-rules.html and backgammon-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    backgammon_rules_title: "Backgammon Rules",
    backgammon_rules_intro: "A quick reference for how PaperGames plays backgammon - useful if you're rusty, or learning.",
    backgammon_rules_basics_title: "The basic idea",
    backgammon_term_pieces: "Checkers and the board",
    backgammon_rules_pieces: "Each player has 15 checkers on a 24-point board. Black moves from point 1 toward point 24, White from point 24 toward point 1 - each racing all their checkers into their own home board and then off it.",
    backgammon_term_dice: "Dice",
    backgammon_rules_dice: "Two dice are rolled each turn, giving two moves of those numbers; rolling doubles gives four moves of that number instead. Every die that can legally be played must be played.",
    backgammon_term_blocking: "Blocking and hitting",
    backgammon_rules_blocking: "A point held by two or more of an opponent's checkers is blocked. A point held by exactly one (a \"blot\") can be landed on, sending it to the bar - it must re-enter through the opponent's home board before that player can make any other move.",
    backgammon_rules_end_title: "Bearing off and winning",
    backgammon_term_bearoff: "Bearing off",
    backgammon_rules_bearoff: "Once all 15 of your checkers are in your home board, you may start bearing them off: a roll matching a checker's point removes it, and a roll higher than any occupied point may remove the furthest checker instead.",
    backgammon_term_win: "Winning",
    backgammon_rules_win: "The first player to bear off all 15 checkers wins.",
    backgammon_term_resignation: "Resignation",
    backgammon_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    backgammon_term_doubling: "The doubling cube",
    backgammon_rules_doubling: "Before rolling, a player who holds (or shares) the cube may offer to double the stakes. The opponent must accept, taking control of the cube and doubling how much the game is worth, or decline and immediately lose the game at its current value. A gammon (opponent bears off nothing) counts double, and a backgammon (opponent still has a checker in the winner's home board or on the bar) counts triple - both multiplied by the cube on top.",
    backgammon_history_title: "The History of Backgammon",
    backgammon_history_origins_title: "Dice Games Older Than Writing",
    backgammon_history_origins_p1: "Backgammon's lineage runs back through the Royal Game of Ur and the Roman game Ludus Duodecim Scriptorum (\"Game of Twelve Lines\"), later simplified into Tabula - a race game for two dice and 15 pieces per side, already recognizably close to backgammon by late antiquity.",
    backgammon_history_origins_p2: "Emperor Claudius reportedly loved Tabula so much that he wrote a (now lost) book of strategy for it, and had a board built into his carriage so he could play while travelling.",
    backgammon_history_spread_title: "Tables, Trictrac, and the English Name",
    backgammon_history_spread_p1: "Throughout medieval Europe, backgammon-like race games were known collectively as \"Tables,\" with regional variants like French trictrac adding their own scoring quirks. The English name \"backgammon\" is first recorded in the 17th century, likely from \"back\" and an old word for \"game\" - a nod to pieces sometimes having to re-enter and cross the board again.",
    backgammon_history_spread_p2: "The doubling cube, which lets either player raise the stakes mid-game, was introduced in New York in the 1920s and transformed backgammon from a pure race into the sharp risk-management game tournament players know today (PaperGames includes it too - see the rules page).",
    backgammon_history_modern_title: "An Early Win for Artificial Intelligence",
    backgammon_history_modern_p1: "Backgammon holds a special place in AI history: in 1992, a program called TD-Gammon, built by IBM researcher Gerald Tesauro, used a neural network that learned by playing itself millions of times - one of the earliest successes of what's now called reinforcement learning.",
    backgammon_history_modern_p2: "TD-Gammon played at a level competitive with the world's best humans years before similar techniques conquered chess or Go, and its unconventional strategic ideas ended up changing how top human players approached the game."
});
I18n.markTextLoaded("en");
