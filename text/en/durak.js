// text/en/durak.js
// Rules and history texts of durak (en). Loaded by durak-rules.html and durak-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    durak_rules_title: "Durak Rules",
    durak_rules_intro: "How PaperGames plays Durak, in the common form in which players may throw in extra cards.",
    durak_term_setup: "Cards and trump",
    durak_rules_setup: "A pack of 36 cards (Six to Ace in four suits), 2 to 4 players, six cards each. The next card is laid face up under the stock: its suit is trump for the whole game, and it is the last card to be drawn. The trump suit is always shown at the top of the board.",
    durak_term_attack: "Attack and defence",
    durak_rules_attack: "The player with the lowest trump attacks first. The attacker lays a card face up; the next player defends and must beat it with a higher card of the same suit, or with any trump if the attack card isn't a trump. A trump can only be beaten by a higher trump.",
    durak_term_throw: "Throwing in",
    durak_rules_throw: "Once the first card is down, the attacker and then the other players may add more cards - but only ranks that are already on the table, as attack or beating cards. The defender must beat each of them. There are never more than six attack cards in a round, and never more than the defender held when the round began.",
    durak_term_take: "Taking the cards",
    durak_rules_take: "If the defender can't or doesn't want to beat a card, they take every card on the table into their hand; the others may still throw in matching cards first. Then the player after the defender attacks - the defender is skipped. If the defender beats everything, the cards leave the game and the defender attacks next.",
    durak_term_draw: "Drawing up",
    durak_rules_draw: "After each round everybody fills their hand back up to six cards from the stock: the attacker first, then round the table, the defender last.",
    durak_term_end: "The end",
    durak_rules_end: "Once the stock is empty, nobody draws any more, and a player without cards is out. The last player still holding cards is the durak - the fool - and loses. If the last players run out together, the game is a draw.",
    durak_term_transfer: "Optional: passing the attack on",
    durak_rules_transfer: "This rule is off unless you turn it on before the game. Before beating anything, the defender may lay a card of the same rank as the attack cards and so pass the whole attack on to the next player, who then has to defend against all of them. The next player must hold enough cards for that.",
    durak_history_title: "The History of Durak",
    durak_history_origins_title: "A Russian Folk Game",
    durak_history_origins_p1: "Durak is thought to have spread among ordinary people in Russia in the 19th century, played with the 36-card pack common there. In the 20th century it became one of the most widely played card games across the Soviet Union and the countries around it, taught at home, on trains and in the army.",
    durak_history_origins_p2: "Unlike most card games it has no winner, only a loser: 'durak' means 'fool', and the last player holding cards is called that until the next game begins.",
    durak_history_names_title: "Many Ways to Play",
    durak_history_names_p1: "The form played here, in which extra cards may be thrown in, is known as podkidnoy durak. In another popular form, perevodnoy durak, the defender may pass the attack on with a card of the same rank - PaperGames offers that as an option.",
    durak_history_names_p2: "Countless house rules exist on top of these, for example about how many cards may be thrown in during the first round. Families often argue about them, which is part of the game's charm."
});
I18n.markTextLoaded("en");
