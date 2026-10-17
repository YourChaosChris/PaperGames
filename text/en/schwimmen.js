// text/en/schwimmen.js
// Rules and history texts of schwimmen (en). Loaded by schwimmen-rules.html and schwimmen-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    sudoku_rules_basics_title: "The basic idea",
    schwimmen_rules_title: "Thirty-One Rules",
    schwimmen_rules_intro: "How PaperGames plays Thirty-One, known in German-speaking countries as Schwimmen or Schnauz.",
    schwimmen_term_setup: "Cards and players",
    schwimmen_rules_setup: "A pack of 32 cards (Seven to Ace in four suits), 2 to 6 players. Everyone gets three cards, and three more are laid face up in the middle.",
    schwimmen_term_values: "Counting a hand",
    schwimmen_rules_values: "Sevens to Tens count their pips, Jack, Queen and King 10 each, the Ace 11. A hand counts only the cards of ONE suit - the best suit you hold. The most you can have is 31: an Ace and two ten-point cards of the same suit. Three cards of the same rank, such as three Kings, count 30.5; three Aces count 31. Your own score is always shown under your cards.",
    schwimmen_term_turn: "Your turn",
    schwimmen_rules_turn: "Do exactly one thing: swap one of your cards with a middle card, swap all three of your cards with the middle, pass, or knock. If every player passes in a row, the middle cards are put aside and replaced by three new ones from the stock.",
    schwimmen_term_knock: "Knocking",
    schwimmen_rules_knock: "Knock when you think your hand is good enough. Every other player then gets exactly one more turn, and all hands are shown. Only one player can knock per round.",
    schwimmen_term_31: "Thirty-one",
    schwimmen_rules_31: "Whoever reaches exactly 31 - also with the cards dealt - shows at once, and every other player loses a life.",
    schwimmen_term_lives: "Lives and swimming",
    schwimmen_rules_lives: "Everyone starts with three lives, shown as filled circles. After the cards are shown, the lowest score loses a life; on a tie for lowest, all of them lose one. A player without lives is 'swimming' and still plays; losing once more means out. The last player left wins. If the last players go out together, the game is a draw.",
    schwimmen_term_variant: "The version played here",
    schwimmen_rules_variant: "Thirty-One is played with many house rules. Here knocking is allowed from the very first turn, and if the middle has to be replaced but fewer than three cards are left in the stock, the round ends with a showdown straight away.",
    schwimmen_history_title: "The History of Thirty-One",
    schwimmen_history_origins_title: "An Old Target Number",
    schwimmen_history_origins_p1: "Card games in which players aim for a total of 31 have been known in Europe for centuries, and the number turns up in several unrelated games. The three-card game played here belongs to the group of so-called commerce games, where players improve their hands by exchanging cards with a shared pool in the middle.",
    schwimmen_history_origins_p2: "Nobody knows who first played it in its present form. Like most folk card games it spread by being played, not by being written down, and its rules were passed on from table to table with small local differences.",
    schwimmen_history_names_title: "Swimming, Knocking, Scat",
    schwimmen_history_names_p1: "In German-speaking countries the game is known as Schwimmen, Schnauz, Knack or simply 31; in English-speaking countries as Thirty-One or Scat. The German name comes from the player who has lost all lives and is 'swimming' through a last round.",
    schwimmen_history_names_p2: "Lives were traditionally counted with coins or matches in front of each player. PaperGames shows them as filled and empty circles, so the state of the game stays clear on a black-and-white screen."
});
I18n.markTextLoaded("en");
