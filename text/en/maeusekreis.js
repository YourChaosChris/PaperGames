// text/en/maeusekreis.js
// Rules and history texts of maeusekreis (en). Loaded by maeusekreis-rules.html and maeusekreis-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    maeusekreis_rules_title: "Mouse Ring Rules",
    maeusekreis_rules_intro: "A cat and a mouse on a circle of points. The mouse runs only along the circle, the cat may also take the straight lines across. Can the cat catch the mouse before its steps run out?",
    maeusekreis_rules_basics_title: "The rules",
    maeusekreis_term_board: "The board",
    maeusekreis_rules_board: "The points lie on a circle; each point is joined to its two neighbours. A few dashed lines cross the circle. Easy has 8 points, Medium 10 and Hard 12. Cat and mouse start at random points, at least three points apart.",
    maeusekreis_term_moves: "Moving",
    maeusekreis_rules_moves: "The mouse moves first, then the cat, and so on. On each turn the piece goes one step to a neighbouring point; staying put is not allowed. The mouse uses only the circle. The cat uses the circle and the dashed lines. The mouse may not step onto the cat. Tap a marked point to move there.",
    maeusekreis_term_end: "Caught or away",
    maeusekreis_rules_end: "When the cat steps onto the mouse's point, the mouse is caught and the cat wins. Nobody gets hurt: the game simply ends. The cat has a fixed number of steps, shown above the board. If it has made them all and the mouse is still free, the mouse gets away and wins.",
    maeusekreis_term_steps: "How many steps",
    maeusekreis_rules_steps: "The number of steps is worked out for every start. For two players and when you play the cat, the cat has exactly enough steps to catch the mouse – but only if it never wastes one. When you play the mouse against the computer, the cat has one step less, so a careful mouse can get away.",
    maeusekreis_term_computer: "The computer",
    maeusekreis_rules_computer: "Against the computer you choose cat or mouse. Easy makes many mistakes, Medium a few, Hard none. The Hint button shows the best step, and Undo takes your last move back.",
    maeusekreis_history_title: "The History of Mouse Ring",
    maeusekreis_history_origins_title: "Old chasing games",
    maeusekreis_history_origins_p1: "Games in which one side hunts and the other tries to escape are known from many countries. In Europe, fox and geese has been played on a board of lines and points for many centuries, and similar hunt games come from Asia. One side is strong, the other has numbers or room on its side.",
    maeusekreis_history_maths_title: "A chase on points and lines",
    maeusekreis_history_maths_p1: "From the late 1970s, mathematicians began to study chases on networks of points and lines in general: on which networks can a hunter always catch the one who runs? The game is often called cops and robbers. On a plain circle the runner always escapes; shortcuts across the circle change that.",
    maeusekreis_history_here_title: "Mouse Ring here",
    maeusekreis_history_here_p1: "The idea of a cat and a mouse on a circle came from a player. The PaperGames rules are their own: the mouse keeps to the circle, the cat may cut across, and a search through every position sets how many steps the cat has."
});
I18n.markTextLoaded("en");
