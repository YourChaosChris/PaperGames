// text/en/villains.js
// Rules and history texts of villains (en). Loaded by villains-rules.html and villains-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    vl_rules_title: "Fairy-Tale Villains Rules",
    vl_rules_intro: "Every player is a villain with a plan of their own. Spell cards pay for the steps of the plan – while heroes turn up from the deck and get in the way.",
    vl_rules_basics_title: "The rules",
    vl_term_domain: "Domain and plan",
    vl_rules_domain: "Each villain has a domain of three places. Every place has a sign: moon, star or herb. The plan lists the steps (three or four); each step belongs to a place and has a price. The steps can be done in any order; a step marked \"last\" only when all the others are done.",
    vl_term_cards: "Spell cards",
    vl_rules_cards: "All players draw from one deck: for each sign four spell cards of value 1, four of value 2 and three of value 3, plus three Fairy Dust (value 2, any sign) – 36 spell cards. Three cards lie open as the market. Everyone starts with 3 cards; the last two players in turn order (never the first) also get a card of value 1. You may keep at most 6. After dealing, 8 heroes are shuffled into the deck.",
    vl_term_turn: "A turn",
    vl_rules_turn: "A turn has two actions, in any order; the same action twice is allowed. Collect: take two cards, each one from the market or from the top of the deck. Step: pay the price of one open step with cards from your hand. You may also end your turn early.",
    vl_term_pay: "Paying",
    vl_rules_pay: "A card of the place's sign counts its value, Fairy Dust counts 2, every other card counts 1. The game picks the cards that spend the least. Paid cards go to the discard pile; when the deck is used up it is shuffled from there.",
    vl_term_heroes: "Heroes",
    vl_rules_heroes: "Heroes are hidden in the deck; nobody places them. When a hero comes up – when you draw from the deck or when the market is filled up – it appears at once in the domain of the player whose turn it is, at the place of its sign, and the draw goes on to the next spell card. If a hero already stands there, the new one moves on. A hero makes the steps at his place dearer by his strength (1 to 3). When the villain does a step there, the hero is outwitted and leaves; later he is shuffled back into the deck with the discard pile. The line “Heroes in the deck” shows how many are still hidden.",
    vl_term_end: "End of the game",
    vl_rules_end: "Whoever finishes the plan ends the turn at once. The round is then played to its end, so that everyone has had the same number of turns. Of all who finished, the one with the most value left in the hand wins (then the most cards). If that is still equal, they share the win.",
    vl_term_playing: "Playing",
    vl_rules_playing: "The buttons below the market show the actions; a step button shows the price as it is now. When you collect, the cards to choose from appear as buttons in a box. With more than 6 cards, tap a card in your hand to put it away. Tap another villain's line to see their plan and domain. The computer has three levels.",
    vl_rules_goals_title: "The six villains",
    vl_rules_goal_witch: "Knead the dough in the Bakehouse (star, 5), the gingerbread roof and the sugar windows at the Gingerbread House (moon, 5 each), last heat the Oven (herb, 6).",
    vl_rules_goal_wolf: "Eat chalk at the General Store (herb, 5), dough and flour on the paw at the Mill (star, 5 each), last knock at the Goats' House (moon, 6).",
    vl_rules_goal_rumpel: "Spin straw into gold twice in the Spinning Room (moon, 5 each), bring gold to the Royal Court (herb, 5), last dance round the Campfire (star, 6).",
    vl_rules_goal_stepmother: "Bring the laces and the comb to the Dwarfs' Cottage (herb, 5 each), prepare the apple in the Castle Kitchen (star, 5), last ask the mirror in the Hall of Mirrors (moon, 6).",
    vl_rules_goal_sorcerer: "Catch two birds on the Bird Meadow (star, 5 each), draw magic water at the Magic Well (moon, 5), last hang up the cages in the Tower Room (herb, 6).",
    vl_rules_goal_thornfairy: "Speak the curse in the Banquet Hall (moon, 6), set out the flax in the Castle Yard (herb, 5) and the spindle in the Spindle Tower (star, 5), last put the castle to sleep in the Banquet Hall (moon, 6).",
    vl_rules_example_title: "Example",
    vl_rules_example: "The witch wants to knead the dough in the Bakehouse (star, price 5). The Queen (strength 3) stands there, so it costs 8. She pays with Star 3, Star 2, Fairy Dust 2 and a Moon 1 (counts 1). The Queen is outwitted and leaves.",
    vl_history_title: "History of Fairy-Tale Villains",
    vl_history_grimm_title: "The Grimms' fairy tales",
    vl_history_grimm_p1: "Jacob and Wilhelm Grimm published the first volume of their Children's and Household Tales in 1812 and the second in 1815, and kept revising the collection for decades. All the villains in this game come from it: the witch from Hansel and Gretel, the wolf from The Wolf and the Seven Young Kids and Little Red Cap, Rumpelstiltskin, the stepmother from Snow White, the sorcerer in the tower after the old sorceress in Jorinde and Joringel, and the thirteenth wise woman from Little Briar Rose.",
    vl_history_here_title: "Fairy-Tale Villains in PaperGames",
    vl_history_here_p1: "The tales are in the public domain. The game takes only the figures and a few details from them – the chalk and the flour of the wolf, the gifts of the stepmother, the spinning of straw into gold, the curse and the spindle of the thirteenth wise woman – and gives every villain a plan, places and cards of its own. Names, pictures and rules of the game are PaperGames' own, not taken from films or other games."
});
I18n.markTextLoaded("en");
