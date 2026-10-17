// text/en/war.js
// Rules and history texts of war (en). Loaded by war-rules.html and war-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    war_rules_title: "War Rules",
    war_rules_intro: "A card game of pure luck for two: the higher card wins, and a tie means war.",
    war_rules_basics_title: "The rules",
    war_term_cards: "The cards",
    war_rules_cards: "32 cards: 7, 8, 9, 10, Jack, Queen, King and Ace in four suits. The Ace is highest; the suit does not matter. Each player gets 16 cards as a face-down pile.",
    war_term_round: "A round",
    war_rules_round: "Both players turn up the top card of their pile. The higher card wins both cards, and they go under the winner's pile.",
    war_term_war: "War",
    war_rules_war: "If both cards are equal, it's war: each player puts one card face down and one face up. The higher face-up card takes all the cards on the table. If they are equal again, the war goes on.",
    war_term_empty: "Running out",
    war_rules_empty: "A player with only one card left in a war turns it up without a face-down card. A player with no card left to turn up loses the game.",
    war_term_modes: "Short or to the end",
    war_rules_modes: "Short (the default): after 30 rounds the player with more cards wins; with the same number it's a draw. To the end: play until one player has all 32 cards. So that a long game cannot go round in circles, won cards go under the pile in random order, and after 2000 rounds the game ends in a draw.",
    war_term_play: "Playing here",
    war_rules_play: "You play against the computer. There are no decisions: tap your pile, and both cards are turned up. The table shows the round, with face-down war cards as striped backs, and both piles show how many cards they have.",
    war_rules_example_title: "A war",
    war_rules_example: "The picture shows a war: both players turned up a 9; after one face-down card each, the King beats the 8.",
    war_history_title: "The History of War",
    war_history_origins_title: "An Old Children's Game",
    war_history_origins_p1: "War is one of the simplest card games and is often the first one children learn. In Britain it is also called Battle. German variants of the game are mentioned as early as 1833, in C. F. Schenkel's encyclopaedia. A related game is Beggar-my-neighbour.",
    war_history_end_title: "Does It Always End?",
    war_history_end_p1: "A game of War can take very long, and in theory it might never end. Most descriptions are also unclear about what happens when a player runs out of cards during a war. Mathematicians have studied whether the game must end; the order in which won cards go back under the pile can change the outcome.",
    war_history_modern_title: "War at PaperGames",
    war_history_modern_p1: "Because War can last a long time, PaperGames offers a short game of 30 rounds as the default. Won cards go under the pile in random order, and a player with only one card left in a war turns it up - one of the common ways of settling that question."
});
I18n.markTextLoaded("en");
