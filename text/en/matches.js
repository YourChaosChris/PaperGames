// text/en/matches.js
// Rules and history texts of matches (en). Loaded by matches-rules.html and matches-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    mt_rules_title: "Matchstick Puzzles Rules",
    mt_rules_intro: "Move one or two matches to make a sum right or to make squares.",
    mt_rules_basics_title: "The rules",
    mt_term_move: "Moving",
    mt_rules_move: "Tap a match: you pick it up, and a dashed frame shows where it lay. Then tap a free place (a dotted line) to lay it there; tapping its old place puts it back. Above the matches you see how many lie away from their start place.",
    mt_term_sums: "Sums",
    mt_rules_sums: "The digits are made of matches as on a digital clock. The sign has two places: with both matches it is a plus, with only the lying one a minus. At the end every digit and sign must have a valid shape and the sum must be right. Numbers of two or more digits do not start with 0.",
    mt_term_squares: "Squares",
    mt_rules_squares: "The figure is made of small squares. Make exactly as many small squares as the task asks; every match must be part of at least one of them - no match may lie loose.",
    mt_term_levels: "Levels",
    mt_rules_levels: "Easy: sums of single digits with 1 match; squares with 1 or 2 matches. Medium: sums with two-digit numbers, 1 match; squares with 2 matches. Hard: sums with 2 matches; squares with 2 matches and at most two solutions. 30 puzzles per level; the computer has checked that each can be solved with exactly that number of matches and not with fewer. Solved puzzles get a tick in the list.",
    mt_term_help: "Hint",
    mt_rules_help: "Hint marks a match and the place where it should go. Undo takes back the last step; Start over lays all matches back.",
    mt_rules_example_title: "Example",
    mt_rules_example: "Move 1 match: 9 + 3 = 6 is wrong. Take the top right match of the 9 - it becomes a 5 - and lay it on the 6, which becomes an 8: 5 + 3 = 8.",
    mt_history_title: "History of Matchstick Puzzles",
    mt_history_matches_title: "From the friction match to the safety match",
    mt_history_matches_p1: "The first friction matches were made by the English chemist John Walker in 1826; he never patented them. Early friction matches were still dangerous to use. The safety match, which lights only on the striking surface of its box, came from Sweden: Gustaf Pasch suggested a separate striking surface in 1844, and Johan Edvard Lundström patented the safety match in 1855 and made it in large numbers in Jönköping.",
    mt_history_puzzles_title: "Matches as a puzzle",
    mt_history_puzzles_p1: "Cheap and found in every household, matches soon became puzzle material. Professor Hoffmann - the pen name of Angelo John Lewis - gave them a whole chapter, \"Puzzles with Lucifer Matches\", in his book Puzzles Old and New, published in London in 1893. Sums in the style of a digital clock are a younger form, from the time when such displays became common. The 90 puzzles here were found by computer for PaperGames."
});
I18n.markTextLoaded("en");
