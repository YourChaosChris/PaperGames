// text/en/cardduel.js
// Rules and history texts of cardduel (en). Loaded by cardduel-rules.html and cardduel-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    cd_rules_title: "Card Duel Rules",
    cd_rules_intro: "Two mages duel with creatures and spells. Whoever brings the other mage's life down to 0 wins.",
    cd_rules_basics_title: "The rules",
    cd_term_decks: "Decks",
    cd_rules_decks: "Each player plays one of four ready-made decks of 20 cards (ten different cards, two of each): Forest has many small creatures that grow back, Fire deals damage directly, Water draws cards and sends creatures back, Stone has strong defenders. Both players may choose the same deck.",
    cd_term_power: "Power",
    cd_rules_power: "Power is a store: at the start of each of your turns, 3 power is added. Every card costs power (the number in the circle). Power you don't use stays for later turns, but you can store at most 9.",
    cd_term_turn: "A turn",
    cd_rules_turn: "Draw a card, play cards, attack with your creatures, then End turn. At most 6 creatures per side. You hold at most 7 cards: with a full hand you draw nothing, and the card stays on your deck. Spells you have played and your defeated creatures go to your discard pile; when your deck is empty, the discard pile is shuffled and becomes your new deck.",
    cd_term_cards: "Creatures and spells",
    cd_rules_cards: "A creature stays on the table with attack and life (3 / 5 means attack 3, life 5). A spell works once and is then gone. Damage on a creature stays until it is defeated at 0 life.",
    cd_term_attack: "Attacking",
    cd_rules_attack: "Every creature attacks once per turn, already in the turn it is played. You choose the target: the other mage or one of their creatures. Two creatures hit each other at the same time with their attack.",
    cd_term_start: "Who starts",
    cd_rules_start: "Chosen at random. Both players start with 4 cards. To even it out, the starter's mage begins with 17 life instead of 20, and the starter's very first turn brings only 2 power.",
    cd_term_abilities: "Abilities",
    cd_rules_abilities: "Some cards have one of six abilities; tapping a card or creature during the game explains them:",
    cd_term_playing: "Playing",
    cd_rules_playing: "Tap a card in your hand, then Play; a spell that needs a target asks for one. To attack, tap one of your ready creatures (thick frame), then a target with a dashed frame. The list below shows the last moves, including the computer's. Against the computer: Easy often plays at random, Medium takes the move that looks best right now, Hard also weighs the other side's answer. On one device the hand is covered between turns.",
    cd_rules_example_title: "Example",
    cd_rules_example: "Your Ash Wolf (3 / 3, Ranged) attacks the Mist Otter (2 / 5, Warden). The otter takes 3 damage and keeps 2 life; being Ranged, the wolf takes no damage back. Had the wolf attacked the other mage instead, the otter would have struck first: 2 damage to the wolf, which keeps 1 life and then hits the mage for 3.",
    cd_history_title: "History of Card Duel",
    cd_history_origin_title: "Cards with their own rules",
    cd_history_origin_p1: "Playing cards have existed for centuries, but cards that each carry their own rules text are much younger. In 1993 a card game appeared in the United States that is usually regarded as the first collectible card game: each player put together a deck from cards bought in packs, and many cards changed the rules a little. In the years that followed, many games of this kind appeared.",
    cd_history_today_title: "Ready-made decks and screens",
    cd_history_today_p1: "Ready-made starter decks, which can be played straight away without collecting, existed early on. Since the 2010s, games of this kind are often played on screens, where the computer keeps track of power, life and damage.",
    cd_history_here_title: "Card Duel in PaperGames",
    cd_history_here_p1: "Card Duel keeps the basic idea – two mages, creatures and spells that cost power – but has its own rules for power, the hand and the deck, and four fixed decks with its own figures, names and terms. Nothing has to be bought or collected. The decks were balanced in thousands of computer games so that each wins about half of its games against every other deck."
});
I18n.markTextLoaded("en");
