// text/en/nim.js
// Rules and history texts of nim (en). Loaded by nim-rules.html and nim-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    nim_rules_title: "Nim Rules",
    nim_rules_intro: "Two players take stones from several heaps in turn. With the normal rule, whoever takes the last stone wins.",
    nim_rules_basics_title: "The rules",
    nim_term_move: "A move",
    nim_rules_move: "Choose one row and take as many stones from it as you like, at least one. Tap the stone up to which you want to take: it and every stone to its right get a cross. Then tap \"Take stones\".",
    nim_term_end: "The end",
    nim_rules_end: "Normal: whoever takes the last stone wins. Misère: whoever takes the last stone loses.",
    nim_term_heaps: "Heaps",
    nim_rules_heaps: "3, 4 and 5 stones (the default), the classic 1, 3, 5 and 7, or random heaps (3 or 4 heaps of 1 to 7 stones).",
    nim_term_secret: "The winning rule",
    nim_rules_secret: "Write every heap size in binary and add the columns without carrying (xor): the result is the nim sum. If it is 0, the player to move loses against perfect play; otherwise there is always a move that makes it 0. In misère, play the same way until only heaps of one stone would be left - then leave an odd number of them.",
    nim_term_computer: "The computer",
    nim_rules_computer: "Easy plays any move, Medium the best move half of the time, Hard always the best move. From a winning position Hard cannot be beaten, so the line under the heaps says whether the start is won or lost for whoever begins - choose who starts with that in mind.",
    nim_history_title: "The History of Nim",
    nim_history_origins_title: "Taking stones",
    nim_history_origins_p1: "Games in which players take objects from heaps have been played since ancient times; where Nim comes from is uncertain. It is often linked to the Chinese game jiǎn shízǐ (\"picking stones\"), and the earliest European references date from the beginning of the 16th century.",
    nim_history_bouton_title: "Bouton, 1901",
    nim_history_bouton_p1: "In 1901 Charles L. Bouton of Harvard University published the complete theory of the game and gave it the name Nim. He never explained the name; it is often traced to the German word \"nimm\" (\"take!\").",
    nim_history_machines_title: "Nim machines",
    nim_history_machines_p1: "Nim was one of the first games played by machines: the Nimatron at the New York World's Fair in 1940, and a computer by Ferranti shown at the Festival of Britain in 1951."
});
I18n.markTextLoaded("en");
