// text/en/gipfelwurf.js
// Rules and history texts of gipfelwurf (en). Loaded by gipfelwurf-rules.html and gipfelwurf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    gw_rules_title: "Ridge Roll Rules",
    gw_rules_intro: "Roll four dice, pair them up and climb seven ridges. Roll on as long as you dare - if no pair fits, the climbing of the turn is lost. Whoever reaches the top of three ridges first wins.",
    gw_rules_basics_title: "The rules",
    gw_term_board: "The board",
    gw_rules_board: "Seven ridges, each for the sums of two dice: 2 to 4 (11 steps), 5 (8 steps), 6 (10 steps), 7 (11 steps), 8 (10 steps), 9 (8 steps) and 10 to 12 (11 steps). Every ridge starts at the foot and ends at the top.",
    gw_term_turn: "Your turn",
    gw_rules_turn: "Tap \"Roll the dice\": four dice are rolled. The buttons show the ways to make two pairs, with the two sums. Choose one: each sum moves your climber one step up its ridge. Then roll on, or stop and make camp.",
    gw_term_climbers: "Three climbers",
    gw_rules_climbers: "In one turn you have at most three climbers. A ridge that already has a climber of this turn uses it again. If both sums of a pair fit, both are used; if only one fits, only that one; if each would fit but not both, you choose one of them.",
    gw_term_lost: "Turn lost",
    gw_rules_lost: "If no sum of the roll fits - the ridges are full of climbers, closed or climbed to the top - the turn is lost: the climbing of this turn is gone. Your camps stay.",
    gw_term_camp: "Making camp",
    gw_rules_camp: "If you stop, your climbers become camps: next time you start from there. A camp is your own black marker (circle, square, triangle or star); a climber of this turn is a white ring with a thick black edge.",
    gw_term_top: "The top",
    gw_rules_top: "If you make camp at the top of a ridge, the ridge is yours: it is hatched and closed for everyone, and the other players' camps on it are removed.",
    gw_term_end: "Winning",
    gw_rules_end: "Whoever claims three ridges first wins at once (before the game you can choose two). If every ridge is claimed and nobody has enough, the most ridges win; players level on that win together.",
    gw_term_start: "Who starts",
    gw_rules_start: "Who starts is drawn by lot. In test games with computers the first player won clearly more often, so the lot keeps it fair.",
    gw_term_computer: "The computer",
    gw_rules_computer: "Easy takes the pair with the most steps and stops after three good rolls. Medium and Hard prefer ridges they already climb and short ways to the top; Hard reckons the chance of losing the turn with the next roll.",
    gw_rules_example_title: "Example",
    gw_rules_example: "You roll 3, 4, 1 and 5. The pairs: 3 + 4 = 7 and 1 + 5 = 6, or 3 + 1 = 4 and 4 + 5 = 9, or 3 + 5 = 8 and 4 + 1 = 5. You choose 7 and 6: one step up the ridge of 7 and one up the ridge of 6. Now you have two climbers and may roll on.",
    gw_history_title: "About Ridge Roll",
    gw_history_family_title: "Dice games with a risk",
    gw_history_family_p1: "In many dice games you decide again and again whether to roll once more for a bigger gain or to keep what you have. The game designer Reiner Knizia calls them \"jeopardy dice games\" in his book Dice Games Properly Explained (1999).",
    gw_history_pig_title: "Pig",
    gw_history_pig_p1: "A well-known example is Pig, first described in print by the American magician John Scarne in 1945. You roll one die as often as you like and add up the numbers; a 1 ends the turn and the points of the turn are lost. Whoever stops keeps the sum. The game is probably older than its first description.",
    gw_history_modern_title: "This Version",
    gw_history_modern_p1: "Ridge Roll was made for PaperGames, with its own board and texts: seven ridges for the sums of two dice, the outer ones for three sums each, their own lengths set by measurement in computer games, camps and climbers, and a first player drawn by lot."
});
I18n.markTextLoaded("en");
