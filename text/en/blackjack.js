// text/en/blackjack.js
// Rules and history texts of blackjack (en). Loaded by blackjack-rules.html and blackjack-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    bj_rules_title: "Blackjack Rules",
    bj_rules_intro: "Get closer to 21 than the bank, but not over 21. Two variants, one game - played with chips, which are only points.",
    bj_rules_basics_title: "The rules",
    bj_term_variants: "Two variants",
    bj_rules_variants: "17 and 4 is played with 32 cards (7 to Ace), Blackjack with 52 cards (2 to Ace). Choose the variant under New game.",
    bj_term_values17: "Card values in 17 and 4",
    bj_rules_values17: "Ace 11, King 4, Queen 3, Jack 2, the number cards 7 to 10 their value. Two aces as your first two cards are called \"fire\" and are the best hand.",
    bj_term_valuesbj: "Card values in Blackjack",
    bj_rules_valuesbj: "Ace 1 or 11 (whichever is better for you), King, Queen and Jack 10, the number cards their value. Ace and a 10-card as your first two cards are a blackjack.",
    bj_term_round: "A round",
    bj_rules_round: "Choose your bet: 5, 10 or 20 chips. You get two cards, the bank one card face up and one face down. Take more cards with \"Card\", or stop with \"Stand\". If you go over 21, you have lost at once.",
    bj_term_bank: "The bank",
    bj_rules_bank: "When you stand, the bank turns over its card. It always follows the same rule: it draws while it has 16 or less and stands from 17. If it goes over 21, you win.",
    bj_term_result: "Who wins",
    bj_rules_result: "Whoever is closer to 21 wins. You win as many chips as you bet; a blackjack wins one and a half times the bet (rounded down). Equal points: in 17 and 4 the bank wins, in Blackjack you keep your chips. A 21 with two cards (blackjack) or fire ends the round at once.",
    bj_term_double: "Doubling (Blackjack only)",
    bj_rules_double: "With your first two cards you may double: your bet doubles, you get exactly one more card, and then the bank plays. You need enough chips for it. There is no splitting and no insurance.",
    bj_term_chips: "Chips",
    bj_rules_chips: "You start with 100 chips. They are only points in the game and cannot be exchanged for anything. If you have none left, start again with 100.",
    bj_rules_example_title: "Same cards, different points",
    bj_rules_example: "Ace and King: in Blackjack they make 21 - a blackjack. In 17 and 4 they make only 15 (Ace 11, King 4).",
    bj_history_title: "The History of Blackjack",
    bj_history_origins_title: "Twenty-one",
    bj_history_origins_p1: "Card games in which you try to reach 21 without going over are old: the first written mention is in a book by the Spanish author Miguel de Cervantes. The German 17 and 4 comes from the 18th century and was very popular in France at the court of Louis XV. The French vingt-et-un (21) comes from the older trente-et-un, where 31 was the target. In German it was once also called Hopsen. With the 32-card values, 17 and a King (4) make exactly 21.",
    bj_history_us_title: "Blackjack",
    bj_history_us_p1: "In the United States an American form of twenty-one developed into a game of its own and was named blackjack around 1899. The often-told story of a bonus for an Ace with a black Jack is a myth according to the historian Thierry Depaulis. Traditionally, a blackjack pays 3 to 2, and if the points are equal the bet is returned.",
    bj_history_modern_title: "Blackjack at PaperGames",
    bj_history_modern_p1: "PaperGames plays with chips only: they are simply points in the game and cannot be exchanged for anything. The bank always follows the same fixed rule, the cards are shuffled anew for every round, and your points are always shown - the cards are told apart by filled and hollow suit symbols, so the game works on black-and-white e-ink."
});
I18n.markTextLoaded("en");
