// text/en/tenpairs.js
// Rules and history texts of tenpairs (en). Loaded by tenpairs-rules.html and tenpairs-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    tp_rules_title: "Pairs to Ten Rules",
    tp_rules_intro: "Cross out pairs of digits until none is left.",
    tp_rules_basics_title: "The rules",
    tp_term_field: "The field",
    tp_rules_field: "Digits 1 to 9 in nine columns, read row by row like a text.",
    tp_term_pairs: "Pairs",
    tp_rules_pairs: "Two digits are crossed out together when they are equal (3 and 3) or add up to 10 (1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5).",
    tp_term_see: "Seeing each other",
    tp_rules_see: "The two must see each other: next to each other across, down or diagonally, or with only crossed-out cells between them on that line. Across also runs over the end of a row: the last digit of a row sees the first of the next one, and so on in reading order.",
    tp_term_add: "Add",
    tp_rules_add: "When you are stuck, tap Add: all digits not yet crossed out are written again, in the same order, at the end of the field. At most 5 times per game.",
    tp_term_rows: "Empty rows",
    tp_rules_rows: "A row whose nine cells are all crossed out vanishes.",
    tp_term_end: "Winning and losing",
    tp_rules_end: "You win when every digit is crossed out. You lose when no pair is left and no Add either, or when the field grows to more than 40 rows.",
    tp_term_start: "Start",
    tp_rules_start: "Classic: 1 2 3 4 5 6 7 8 9, then 1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 (the numbers 1 to 19 without 10). Random: three, four or five rows; the easier the level, the more pairs stand right next to each other.",
    tp_term_help: "Help",
    tp_rules_help: "Undo goes back any number of steps. Hint marks a pair that can be crossed out, or says that only Add is left.",
    tp_rules_example_title: "Example",
    tp_rules_example: "The classic start. The 1 at the top left and the 1 below it see each other (down) and are equal. The 9 at the end of the first row and the 1 at the start of the second see each other over the end of the row and add up to 10.",
    tp_history_title: "History of Pairs to Ten",
    tp_history_origins_title: "From exercise books",
    tp_history_origins_p1: "Where the puzzle comes from is not documented in the sources PaperGames could check. A 2011 article on the Russian website Habr remembers it from school and university: it was played in squared exercise books, under names such as \"numbers\", \"digits\", \"seeds\" or \"19\" - there was no official name. There the game begins with the numbers 1 to 19 (without 10) written in a row, the same digits as the classic start here, and when no pair is left the remaining digits are copied at the end.",
    tp_history_name_title: "The name",
    tp_history_name_p1: "\"Pairs to Ten\" simply says what the puzzle is about. Several apps play the same idea under names of their own; PaperGames does not use them. The diagonal pairs, the limit of 5 Adds and of 40 rows are PaperGames rules."
});
I18n.markTextLoaded("en");
