// text/en/cardtactics.js
// Rules and history texts of cardtactics (en). Loaded by cardtactics-rules.html and cardtactics-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    cardtactics_rules_title: "Card Tactics Rules",
    cardtactics_rules_intro: "A quick reference for how PaperGames plays this card-driven duel - useful if you're rusty, or learning.",
    cardtactics_rules_basics_title: "The basic idea",
    cardtactics_term_setup: "The setup",
    cardtactics_rules_setup: "Each side starts with four pawns and one master lined up on their home row, the master in the center square. Five move cards are dealt at random from a shared deck: two go to each player, and one sits face-up in the middle as the spare.",
    cardtactics_term_cards: "Move cards",
    cardtactics_rules_cards: "Every card shows a small set of relative moves any of your own pieces may make from wherever it stands - the same card works for a pawn or the master. There's no piece that ignores the cards: what a card allows is the only way to move that turn.",
    cardtactics_term_moving: "Making a move",
    cardtactics_rules_moving: "On your turn, pick one of your two cards, then one of your own pieces, then a square that card allows for it - capturing any enemy piece standing there. The card you used then goes to the middle, and the card that was waiting there joins your hand in its place, so the set of five cards keeps rotating between both players all game.",
    cardtactics_rules_end_title: "Winning the game",
    cardtactics_term_win: "Two ways to win",
    cardtactics_rules_win: "Capture the opponent's master, or march your own master onto their home shrine - the center square of their back row. Either one ends the game immediately.",
    cardtactics_history_title: "The History of Card-Driven Duels",
    cardtactics_history_origins_title: "A Card-Driven Chess Variant",
    cardtactics_history_origins_p1: "Chess variants that swap out fixed piece movement for some other mechanism go back a long way, but games built specifically around a small hand of interchangeable \"move cards\" are a more recent invention, emerging from the wave of design-forward tabletop abstract games published in the 2010s.",
    cardtactics_history_origins_p2: "The core idea is simple to state but produces surprisingly deep play: because the two players' hands overlap with the shared middle card, every move you make also hands your opponent new options next turn - reading a few moves ahead means tracking not just the pieces but which cards will cycle where.",
    cardtactics_history_design_title: "A Small Board, A Deep Game",
    cardtactics_history_design_p1: "Played on a compact 5x5 board with just five pieces per side, a game like this is usually over in a few minutes, which made it a popular pick for two-player game nights and travel sets - a small footprint hiding a genuinely calculating contest.",
    cardtactics_history_design_p2: "The two win conditions - capturing the opposing master or marching your own master onto the opponent's home shrine - keep both attack and a purely positional \"race\" plan alive at once, so a player far behind on pieces can still suddenly win by breaking through to the shrine.",
    cardtactics_history_version_title: "This Version",
    cardtactics_history_version_p1: "PaperGames implements the card-driven movement mechanic with its own original set of sixteen move cards and elemental names, rather than reproducing any specific publisher's card set - the underlying rules of dealing, cycling, and winning are the same, but the exact cards you'll see here are unique to this app."
});
I18n.markTextLoaded("en");
