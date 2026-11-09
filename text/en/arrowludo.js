// text/en/arrowludo.js
// Rules and history texts of arrowludo (en). Loaded by arrowludo-rules.html and arrowludo-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    arrowludo_rules_title: "Arrow Ludo Rules",
    arrowludo_rules_intro: "Ludo with a shortcut: the board has arrows across the middle. Bring all four of your tokens around the track and into the finish before the others.",
    arrowludo_rules_basics_title: "The rules",
    arrowludo_term_ludo: "Like Ludo",
    arrowludo_rules_ludo: "Each player has 4 tokens. Roll the die and move one token by the number rolled. A token comes into play only on a 6, and a 6 gives another roll (three 6s in a row forfeit the turn). Landing on an opponent's token sends it back to its home base, except on the marked safe squares. Two tokens of one color on a square form a block that opponents can neither land on nor pass. A token needs an exact roll to reach the finish.",
    arrowludo_term_arrow: "The arrow squares",
    arrowludo_rules_arrow: "Each color has one arrow square: the 4th square after its start, at the inner end of its arm right beside the middle. The four arrow squares are marked with an arrow pointing at the middle, and two lines with arrowheads across the board join opposite pairs.",
    arrowludo_term_flight: "The flight",
    arrowludo_rules_flight: "Whenever a token ends its move on an arrow square - its own or another color's, in its first lap or later - it flies diagonally across the middle at once to the arrow square opposite, 26 squares away. On the first half of its way (its own arrow square and the next one) that takes it 26 squares ahead; on the second half the square opposite lies behind it, so it flies back and has to walk that part again. The flight ends on that square and does not start a second one. An opponent's token on the arrow square or on the landing square is sent home; if two opponent tokens block the landing square, you cannot make that move. A flight never leaves the shared track, so no token can skip its path into the finish. Passing an arrow square without stopping on it does nothing. After a flight, the arrow square it started from, the square it landed on and the line between them stay marked until the next move.",
    arrowludo_term_players: "Players",
    arrowludo_rules_players: "2 to 4 players on the classic board. You play one color, the others are computer opponents (Easy, Medium or Hard), or everyone plays on one device. The Hint button shows a good move for your roll. Each color has its own shape, so the game can be played without colors: red circle, green open circle, yellow triangle, blue open square.",
    arrowludo_history_title: "The History of Arrow Ludo",
    arrowludo_history_origins_title: "From Pachisi to Ludo",
    arrowludo_history_origins_p1: "Ludo is the simple modern form of Pachisi, a race game from India that has been played for many centuries. Players move tokens around a cross-shaped board, send each other's tokens home and race for the centre. Over time, families and players everywhere have made up house rules, including shortcuts across the middle.",
    arrowludo_history_modern_title: "Arrow Ludo at PaperGames",
    arrowludo_history_modern_p1: "Arrow Ludo is PaperGames' own version of an old family rule: arrow squares beside the middle send a token across the board, sometimes ahead and sometimes back. The board drawing and the texts are our own. The ordinary Ludo stays as a separate game."
});
I18n.markTextLoaded("en");
