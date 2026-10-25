// text/en/teufelsieben.js
// Rules and history texts of teufelsieben (en). Loaded by teufelsieben-rules.html and teufelsieben-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    ts_rules_title: "Devilish Seven Rules",
    ts_rules_intro: "Turn up cards one by one and stop in time: a number you already have makes you go bust. When somebody reaches the target, the most points win.",
    ts_rules_basics_title: "The rules",
    ts_term_cards: "The cards",
    ts_rules_cards: "90 cards. Number cards 0 to 12, each number as often as its value (twelve 12s, one 1, and one 0): 79 cards. Special cards: Pause (2), Second helping (2), Rescue (2), +3 (2), +5 (2) and Double (1).",
    ts_term_turn: "Your turn",
    ts_rules_turn: "At the start of a round everyone gets one card. Then, in turn, everyone still in the round taps \"Turn up a card\" or \"Stop\". Whoever stops keeps the points of the round.",
    ts_term_bust: "Going bust",
    ts_rules_bust: "If you turn up a number that is already in front of you, you go bust: no points this round. A Rescue card protects you once: the second number is put away and the Rescue card is used up.",
    ts_term_seven: "Seven numbers",
    ts_rules_seven: "Whoever has seven different numbers in front of them ends the round at once and gets 20 extra points.",
    ts_term_special: "Special cards",
    ts_rules_special: "Pause: you choose a player still in the round (you too), who must stop now and keeps their points. Second helping: you choose a player still in the round, who must turn up three cards one after another. A Pause or Second helping turned up during a Second helping has no effect. +3 and +5 add points, Double doubles the sum of your numbers.",
    ts_term_points: "Points and the end",
    ts_rules_points: "Round points: the sum of your numbers (doubled with Double), plus +3 and +5, plus 20 for seven numbers. The round ends when nobody is in it any more. After the round in which somebody reaches the target (100, 150 or 200 points, chosen before the game), the game ends: the most points win, players level on the most points win together.",
    ts_term_computer: "The computer",
    ts_rules_computer: "The computer stops when the chance to go bust with the next card is too high for its level. It counts only the cards lying open and never looks at hidden cards. Easy stops early, Hard takes more risk.",
    ts_rules_example_title: "Example",
    ts_rules_example: "You have 5, 9 and 2: 16 points. Among the cards not seen yet are four 5s, eight 9s and one 2 that would make you go bust. If you stop, you keep 16 points; if you turn up a 9, you get nothing this round.",
    ts_history_title: "About Devilish Seven",
    ts_history_family_title: "Push your luck",
    ts_history_family_p1: "Games in which you decide again and again whether to take one more risk or to keep what you have are called push-your-luck games. Many dice and card games work this way.",
    ts_history_modern_title: "This Version",
    ts_history_modern_p1: "Devilish Seven was made for PaperGames, with its own cards, names and texts: the special cards Pause, Second helping, Rescue, +3, +5 and Double, and 20 extra points for seven different numbers."
});
I18n.markTextLoaded("en");
