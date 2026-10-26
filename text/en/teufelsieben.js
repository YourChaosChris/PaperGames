// text/en/teufelsieben.js
// Rules and history texts of teufelsieben (en). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    ts_rules_title: "Rules of Lucky Chain",
    ts_rules_intro: "Turn up card after card and stop in time: a number you already have makes you go bust. When someone reaches the target, the most points win.",
    ts_rules_basics_title: "The rules",
    ts_term_cards: "The cards",
    ts_rules_cards: "60 cards. Numbers 1 to 10: three 1s, four 2s, five 3s, six each of 4, 5, 6 and 7, five 8s, four 9s and three 10s. Two each of Courage, Strike, Pass, Bridge, Collector and Peek.",
    ts_term_turn: "Your turn",
    ts_rules_turn: "Each player takes one whole turn per round. Reveal cards one by one; after the first card you may stop at any time. When everyone has taken a turn, the round ends. The first player moves one seat each round.",
    ts_term_bust: "Going bust",
    ts_rules_bust: "A number you already have makes you bust: you score zero this round. Courage saves you once; discard the repeated number and Courage. Each used Courage costs 5 points at round end.",
    ts_term_run: "Runs",
    ts_rules_run: "The longest run of consecutive numbers of length 4 or more scores 5 × (length − 2): four in a row score 10, five score 15. Each Bridge fills one missing number.",
    ts_term_special: "Special cards",
    ts_rules_special: "Courage saves you once from busting and costs 5 points when used. Strike removes your last number. Pass makes the next player start their turn with one card revealed. Bridge fills one gap in a run. Collector scores 1 point per number card. Peek shows the next card in the deck.",
    ts_term_points: "Points and the end",
    ts_rules_points: "Round points are the sum of your numbers, plus the run bonus, plus 1 per number for each Collector, minus 5 per used Courage (never below zero). The target is 60, 90 or 120 points; the default is 90. After the round in which a player reaches the target, most points win; ties share the win.",
    ts_term_computer: "The computer",
    ts_rules_computer: "The computer counts only open cards and a card shown by Peek. Easy stops early; Hard weighs the possible gain against the risk.",
    ts_rules_example_title: "Example",
    ts_rules_example: "You have 3, 4, 5, 6 and 9: 27 points in numbers. The run of four adds 10, for 37 points before special-card effects.",
    ts_history_title: "About Lucky Chain",
    ts_history_family_title: "Go on or stop",
    ts_history_family_p1: "Games where you repeatedly choose whether to take another risk or keep what you have belong to the push-your-luck family. Many dice and card games work this way.",
    ts_history_modern_title: "This version",
    ts_history_modern_p1: "Lucky Chain was made for PaperGames, with its own cards, rules and texts: a custom mix of numbers from 1 to 10, a bonus for runs of numbers, and the special cards Courage, Strike, Pass, Bridge, Collector and Peek.",
});
I18n.markTextLoaded("en");
