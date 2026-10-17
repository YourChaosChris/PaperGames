// text/en/cardduel.js
// Rules and history texts of cardduel (en). Loaded by cardduel-rules.html and cardduel-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    cd_rules_title: "Card Duel Rules",
    cd_rules_intro: "Two mages duel with creatures and spells. Whoever brings the other mage from 20 life down to 0 wins.",
    cd_rules_basics_title: "The rules",
    cd_term_decks: "Decks",
    cd_rules_decks: "Each player plays one of four ready-made decks of 30 cards (ten different cards, three of each): Forest has many small creatures that grow back, Fire deals damage directly, Water draws cards and sends creatures back, Stone has few but strong defenders. Both players may choose the same deck.",
    cd_term_power: "Power",
    cd_rules_power: "In your first turn you have 1 power, then 1 more each turn, at most 10. Every card costs power (the number in the circle); power you don't use is lost at the end of the turn.",
    cd_term_turn: "A turn",
    cd_rules_turn: "Draw a card, play cards, attack with your creatures, then End turn. At most 6 creatures per side and 10 cards in hand; a card drawn into a full hand is lost. With an empty deck, drawing costs your mage 2 life instead.",
    cd_term_cards: "Creatures and spells",
    cd_rules_cards: "A creature stays on the table with attack and life (3 / 5 means attack 3, life 5). A spell works once and is then gone. Damage on a creature stays until it is defeated at 0 life.",
    cd_term_attack: "Attacking",
    cd_rules_attack: "A creature attacks from the turn after it was played, once per turn. You choose the target: the other mage or one of their creatures. Two creatures hit each other at the same time with their attack.",
    cd_term_start: "Who starts",
    cd_rules_start: "Chosen at random. To even it out, the other player starts with 4 cards instead of 3 and has 1 power more in their first turn, and the very first turn of the game draws no card.",
    cd_term_abilities: "Abilities",
    cd_rules_abilities: "Some cards have one of six abilities; tapping a card or creature during the game explains them:",
    cd_term_playing: "Playing",
    cd_rules_playing: "Tap a card in your hand, then Play; a spell that needs a target asks for one. To attack, tap one of your ready creatures (thick frame), then a target with a dashed frame. The list below shows the last moves, including the computer's. Against the computer: Easy often plays at random, Medium takes the move that looks best right now, Hard also weighs the other side's answer. On one device the hand is covered between turns.",
    cd_rules_example_title: "Example",
    cd_rules_example: "Your Ash Wolf (3 / 3) attacks the Mist Otter (2 / 4, Bulwark). The otter takes 3 damage and keeps 1 life, the wolf takes 2 and keeps 1. As long as the otter stands, the other mage cannot be attacked.",
    cd_history_title: "History of Card Duel",
    cd_history_origin_title: "Cards with their own rules",
    cd_history_origin_p1: "Playing cards have existed for centuries, but cards that each carry their own rules text are much younger. In 1993 a card game appeared in the United States that is usually regarded as the first collectible card game: each player put together a deck from cards bought in packs, and many cards changed the rules a little. In the years that followed, many games of this kind appeared.",
    cd_history_today_title: "Ready-made decks and screens",
    cd_history_today_p1: "Ready-made starter decks, which can be played straight away without collecting, existed early on. Since the 2010s, games of this kind are often played on screens, where the computer keeps track of power, life and damage.",
    cd_history_here_title: "Card Duel in PaperGames",
    cd_history_here_p1: "Card Duel keeps the basic idea – two mages, creatures and spells, a little more power every turn – but has four fixed decks with its own figures, names and terms. Nothing has to be bought or collected. The decks were balanced in thousands of computer games so that each wins about half of its games against every other deck."
});
I18n.markTextLoaded("en");
