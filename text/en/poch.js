// text/en/poch.js
// Rules and history texts of poch (en). Loaded by poch-rules.html and poch-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    poch_rules_title: "Poch Rules",
    poch_rules_intro: "Poch is an old card game played with 32 cards and chips. Every hand has three stages: pools are paid out for certain cards, players bet on their best set of equal cards, and finally everyone plays their cards out in runs. After six hands the most chips win.",
    poch_rules_basics_title: "The rules",
    poch_term_pools: "The pools",
    poch_rules_pools: "The board has nine pools: Ace, King, Queen, Jack, Ten, Marriage (King and Queen), Sequence (7, 8 and 9), Poch and the centre pot. Before every hand each player puts one chip into every pool, which is 9 chips. All cards are dealt except one, which lies face up: its suit is the pay suit.",
    poch_term_first: "Stage 1: paying out",
    poch_rules_first: "Whoever holds the Ace, King, Queen, Jack or Ten of the pay suit takes the chips from that pool. King and Queen of the pay suit together also take the Marriage pool, and 7, 8 and 9 of the pay suit together take the Sequence pool. A pool that nobody wins, because nobody holds the card or because it is the face-up card, stays for the next hand and grows.",
    poch_term_pochen: "Stage 2: Pochen",
    poch_rules_pochen: "Only players with two, three or four cards of the same rank take part, with their best set. The first player left of the dealer checks or bets 1; after that you call, raise by 1 (up to 4 in all) or fold. A player who cannot pay a call can only fold. Four of a kind beats three, and three beat a pair; a higher rank beats a lower one; the same pair with a card of the pay suit beats one without. The best set takes the Poch pool and all bets. If everyone checks, the Poch pool stays; a single player with a set takes it at once.",
    poch_term_play: "Stage 3: playing out",
    poch_rules_play: "The winner of the Poch (or the player left of the dealer) leads any card. The next higher card of the same suit must be played by whoever holds it, then the next, up to the Ace. When the next card is missing - already played, or the face-up card - the player who played last leads again. Whoever first plays the last card takes the centre pot and one chip from each other player for every card they still hold.",
    poch_term_end: "The end of the game",
    poch_rules_end: "A game has six hands; it ends earlier if someone cannot pay the 9 chips to start a hand. The most chips win. Chips are only points in the game; no money is involved.",
    poch_term_computer: "The computer",
    poch_rules_computer: "Easy mostly checks and plays any card. Medium raises with three or four of a kind or a high pair and leads a card that nobody can follow. Hard also counts the players still in the bet and plans the runs of its own cards. The Hint button suggests what Hard would do.",
    poch_history_title: "The History of Poch",
    poch_history_origins_title: "A very old game",
    poch_history_origins_p1: "Poch is at least five hundred years old and is first recorded in the 15th century. It was played in Germany as Pochen or Pochspiel and in France as La Poque, with a special board that holds the chips. Poch is counted among the forerunners of Poker, and similar chip-board games are still played in many countries.",
    poch_history_here_title: "Poch here",
    poch_history_here_p1: "PaperGames turns Poch into a game for one person against one to three computers. It has its own board of nine pools and its own wording, plays six hands and needs no money, and the computers wait between their moves."
});
I18n.markTextLoaded("en");
