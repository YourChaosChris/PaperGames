// text/en/hanoi.js
// Rules and history texts of hanoi (en). Loaded by hanoi-rules.html and hanoi-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    hanoi_rules_title: "Tower of Hanoi Rules",
    hanoi_rules_intro: "A tower of discs, the smallest on top, stands on the left rod. Move it to the right rod.",
    hanoi_rules_basics_title: "The rules",
    hanoi_term_move: "A move",
    hanoi_rules_move: "Tap a rod: you pick up its top disc (the rod gets a thick frame). Tap a rod to put the disc on. Tap the same rod again to put it back.",
    hanoi_term_rule: "The rule",
    hanoi_rules_rule: "Only the top disc of a rod can move, and it may never lie on a smaller disc. Such a move is refused and nothing moves.",
    hanoi_term_goal: "The goal",
    hanoi_rules_goal: "The whole tower on the right rod (marked with a star). The fewest moves are 2 to the power of the number of discs, minus 1: 7 with 3 discs, 15 with 4, 255 with 8.",
    hanoi_term_help: "Undo and hint",
    hanoi_rules_help: "Undo takes back moves. The hint gives two rods a double frame: move the top disc from the first to the second - it is the next move of a shortest way from the position you are in.",
    hanoi_history_title: "The History of the Tower of Hanoi",
    hanoi_history_lucas_title: "Édouard Lucas, 1883",
    hanoi_history_lucas_p1: "The French mathematician Édouard Lucas presented the puzzle in 1883 as a game supposedly found by a \"N. Claus (de Siam)\" - the letters of \"Lucas d'Amiens\" rearranged. In 1889 he published it as a booklet.",
    hanoi_history_legend_title: "An invented legend",
    hanoi_history_legend_p1: "The legend that came with the puzzle told of priests in a temple in Benares who move a tower of 64 golden discs; when they finish, the world will end. The legend belonged to the game's story, not to real history.",
    hanoi_history_math_title: "The fewest moves",
    hanoi_history_math_p1: "Moving n discs takes at least 2^n − 1 moves: first the n − 1 smaller discs to the middle rod, then the biggest to the goal, then the smaller ones on top of it. With 64 discs and one move per second, that would take far longer than the age of the universe."
});
I18n.markTextLoaded("en");
