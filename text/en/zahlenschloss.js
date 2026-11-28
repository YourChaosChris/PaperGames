// text/en/zahlenschloss.js
// Rules and history texts of zahlenschloss (en). Loaded by zahlenschloss-rules.html and zahlenschloss-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    zahlenschloss_rules_title: "Lock Logic Rules",
    zahlenschloss_rules_intro: "A lock opens with a secret code. A few numbers tell you how close they are to it. You do not guess: everything you need follows from the clues.",
    zahlenschloss_rules_basics_title: "The rules",
    zahlenschloss_term_code: "The code",
    zahlenschloss_rules_code: "The code has three digits (Easy and Medium) or four digits (Hard). No digit appears twice, and the code may start with 0.",
    zahlenschloss_term_clues: "The clues",
    zahlenschloss_rules_clues: "Each clue is a number with as many digits as the code, and a sentence: how many of its digits are in the code at the right place, and how many are in the code but at another place. \"No digit is right\" means none of its digits is in the code. Every puzzle has exactly one solution, and you need every clue for it.",
    zahlenschloss_term_notes: "Notes",
    zahlenschloss_rules_notes: "Tap a digit in a clue to strike it out, for example when you know it is not in the code; tap again to bring it back. Undo takes back your last note. Notes are only for you and never count.",
    zahlenschloss_term_enter: "Opening the lock",
    zahlenschloss_rules_enter: "Type the code with the digit keys into the empty fields and tap Unlock. A wrong code counts as a mistake, but you can try again at once. The Hint button names one conclusion from one or two clues. Show solution puts the code into the fields after a question; the puzzle then counts as given up.",
    zahlenschloss_term_levels: "Levels",
    zahlenschloss_rules_levels: "Easy has three digits and always a clue with no right digit. Medium has three digits and every clue has at least one right digit. Hard has four digits. Every puzzle has a number; the same number is always the same puzzle.",
    zahlenschloss_history_title: "The History of Lock Logic",
    zahlenschloss_history_origins_title: "Right place, wrong place",
    zahlenschloss_history_origins_p1: "The idea of telling right digits at the right place from right digits at the wrong place comes from an old pencil-and-paper game, often called bulls and cows. One player thinks of a number with different digits, the other guesses and gets this answer after every try. The game may be a century old; around 1970 it became one of the first games on university computers.",
    zahlenschloss_history_puzzle_title: "A puzzle with fixed clues",
    zahlenschloss_history_puzzle_p1: "Later the guessing game turned into a puzzle: all answers are given at once, and the code has to be worked out from them. Such lock puzzles with five clues spread widely on the internet in the 2010s and are now found in puzzle books and classrooms. Nobody owns the idea.",
    zahlenschloss_history_here_title: "Lock Logic here",
    zahlenschloss_history_here_p1: "A player sent in the idea. PaperGames makes its own puzzles: a computer tries every possible code, keeps only puzzles with exactly one solution and drops every clue that is not needed."
});
I18n.markTextLoaded("en");
