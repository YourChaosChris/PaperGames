// text/en/gipfelwurf.js
// Rules and history texts of gipfelwurf (en). Loaded by gipfelwurf-rules.html and gipfelwurf-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    gw_rules_title: "Ridge Roll Rules",
    gw_rules_intro: "Roll three dice and climb one of seven ridges per turn. Roll on as long as you dare - if a roll does not fit your ridge, the climbing of the turn is lost. Camps and summits bring points.",
    gw_rules_basics_title: "The rules",
    gw_term_board: "The board",
    gw_rules_board: "Seven ridges for the sum of two dice: 2 to 4 (15 steps), 5 (8), 6 (9), 7 (10), 8 (7), 9 (6) and 10 to 12 (6). The low ridges are longer because there the third die is usually big. Every ridge has a hut and a crevasse.",
    gw_term_turn: "Your turn",
    gw_rules_turn: "Tap \"Roll the dice\": three dice are rolled. Each die can be the step die - 1 or 2: one step, 3 or 4: two, 5 or 6: three - while the other two give the ridge by their sum. The buttons show these ways; choose one.",
    gw_term_climbers: "One ridge per turn",
    gw_rules_climbers: "With the first roll of a turn you choose the ridge (not one whose top you have already reached). From then on every roll must fit this ridge again.",
    gw_term_lost: "Turn lost",
    gw_rules_lost: "If a roll has no way up your ridge, the turn is lost: the climbing of this turn is gone, your camps stay.",
    gw_term_special: "Hut and crevasse",
    gw_rules_special: "If your climber reached the hut in this turn, a lost turn still leaves you a camp at the hut. Landing exactly on the crevasse sends the climber two steps back (never below your camp); jumping over it does nothing.",
    gw_term_camp: "Making camp",
    gw_rules_camp: "After every good roll you may stop: your climber becomes your camp, and next time you start from there. A camp is your own black marker (circle, square, triangle or star); the climber of this turn is a white ring with a thick black edge.",
    gw_term_top: "The top",
    gw_rules_top: "Whoever makes camp at a top first gets 6 extra points, everybody later 3. The ridge stays open for the others.",
    gw_term_end: "Winning",
    gw_rules_end: "Every step of your camps is a point, plus the summit points. When somebody reaches the target (30 or 45, chosen before the game), the round is played to the end so that everyone had the same number of turns. Then the most points win; players level on points win together.",
    gw_term_start: "Who starts",
    gw_rules_start: "Who starts is drawn by lot.",
    gw_term_computer: "The computer",
    gw_rules_computer: "Easy takes the way with the most steps and stops after two good rolls. Medium and Hard reckon whether one more roll is worth the risk; Hard also aims for the summit points.",
    gw_rules_example_title: "Example",
    gw_rules_example: "You roll 5, 2 and 4. The ways: 2 + 4 = 6 with the 5 as step die (ridge 6, three up), 5 + 4 = 9 with the 2 (ridge 9, one up), 5 + 2 = 7 with the 4 (ridge 7, two up). You take ridge 6, three up. Next roll 1, 3, 3: 3 + 3 = 6 with the 1 fits - one more step. Then you stop: your camp is on step 4 of ridge 6.",
    gw_history_title: "About Ridge Roll",
    gw_history_family_title: "Dice games with a risk",
    gw_history_family_p1: "In many dice games you decide again and again whether to roll once more for a bigger gain or to keep what you have. The game designer Reiner Knizia calls them \"jeopardy dice games\" in his book Dice Games Properly Explained (1999).",
    gw_history_pig_title: "Pig",
    gw_history_pig_p1: "A well-known example is Pig, first described in print by the American magician John Scarne in 1945. You roll one die as often as you like and add up the numbers; a 1 ends the turn and the points of the turn are lost. Whoever stops keeps the sum. The game is probably older than its first description.",
    gw_history_modern_title: "This Version",
    gw_history_modern_p1: "Ridge Roll was made for PaperGames, with its own board, rules and texts: seven ridges for the sums of two dice with their own lengths, three dice of which one gives the steps, one ridge per turn, huts and crevasses, and points for camps and summits."
});
I18n.markTextLoaded("en");
