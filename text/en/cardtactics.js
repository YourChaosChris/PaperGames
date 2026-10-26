// text/en/cardtactics.js
// Rules and history texts of cardtactics (en). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    cardtactics_rules_title: "Card Tactics Rules",
    cardtactics_rules_intro: "A quick reference for how PaperGames plays this card-driven race across the board.",
    cardtactics_rules_basics_title: "The basic idea",
    cardtactics_term_setup: "The setup",
    cardtactics_rules_setup: "The board has 7 rows and 6 columns. Black's six stones fill the bottom row, White's six stones the top row. Black starts.",
    cardtactics_term_cards: "Move cards",
    cardtactics_rules_cards: "There are twelve move cards, all in play. Three lie open below the board and belong to both players; the other nine wait in a queue, and the next two are shown. A card's diagram shows where a stone may go from the striped middle square. Each player uses a card in their own direction, so the page always draws the open cards for the side to move.",
    cardtactics_term_moving: "Making a move",
    cardtactics_rules_moving: "Pick one of the three open cards, then one of your stones, then a square the card allows. You may move onto an empty square or onto an enemy stone, which is captured. Your own stones block.",
    cardtactics_term_cycle: "The card queue",
    cardtactics_rules_cycle: "The card you used goes to the end of the queue, and the first card of the queue takes its place among the open cards. So you always know which card comes next.",
    cardtactics_term_opening: "Opening move",
    cardtactics_rules_opening: "The very first move of the game goes one row at most. This evens out the advantage of starting.",
    cardtactics_term_pass: "No move possible",
    cardtactics_rules_pass: "If you cannot move, you pass, and the first open card goes to the end of the queue.",
    cardtactics_rules_end_title: "Winning the game",
    cardtactics_term_win: "Two stones home",
    cardtactics_rules_win: "A stone that reaches the opponent's back row (the goal row) has crossed: it leaves the board and counts as home; an enemy stone standing there is captured. Whoever brings two stones home first wins. You also win if the other side no longer has two stones on the board and at home together.",
    cardtactics_term_limit: "Move limit",
    cardtactics_rules_limit: "After 120 moves the game ends: more stones home wins, then more stones on the board; otherwise it is a draw.",
    cardtactics_history_title: "The History of Card Tactics",
    cardtactics_history_origins_title: "Races to the other side",
    cardtactics_history_origins_p1: "Bringing your own pieces across the board to the other side is an old goal in board games. Halma, invented in 1883 or 1884 by the American surgeon George Howard Monks, is won by the first player to move all their pieces into the camp in the opposite corner.",
    cardtactics_history_origins_p2: "In Halma and in chess, every piece always moves the same way. In Card Tactics, a stone has no movement of its own: open cards decide which steps are possible, and both players choose from the same cards.",
    cardtactics_history_version_title: "This Version",
    cardtactics_history_version_p1: "PaperGames rewrote the rules in October 2026: a board of 7 rows by 6 columns, six identical stones per side, a shared row of three open cards with a queue behind it, and the goal of bringing two stones home. The twelve cards and their names are PaperGames' own."
});
I18n.markTextLoaded("en");
