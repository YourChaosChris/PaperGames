// text/en/blockers.js
// Rules and history texts of blockers (en). Loaded by blockers-rules.html and blockers-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    bl_rules_title: "Path Blockers Rules",
    bl_rules_intro: "A dice race to the top of the board - but stones block the way, and you can move them in front of the others.",
    bl_rules_basics_title: "The rules",
    bl_term_board: "The board",
    bl_rules_board: "Paths join the fields; the goal is at the top. Each player has a house with 5 tokens below the board and comes onto the board at their own field in the bottom row, marked by a thick ring. At the start, 6 stones stand on the paths.",
    bl_term_move: "A turn",
    bl_rules_move: "Roll the die and move one of your tokens exactly that many fields. From the house, the first step goes onto your entry field. You may turn at any junction, but a move may not step on the same field twice. If no token can use the roll, the turn passes.",
    bl_term_stones: "Stones",
    bl_rules_stones: "No token may pass over a stone. A token that lands exactly on a stone takes it and puts it on any free field - not in the bottom row and not on the goal. The goal cannot be passed either: it must be reached with the exact number.",
    bl_term_hit: "Sending back",
    bl_rules_hit: "A token that lands exactly on another player's token sends it back to its house - but only in the upper half of the board, where the fields are round. In the lower half the fields are square: tokens are safe there, and no move may end on another player's token. Two of your own tokens may not stand on the same field.",
    bl_term_win: "The winner",
    bl_rules_win: "How the game ends is chosen before the game. \"One token in the goal\" (the default): the first player to bring one token into the goal wins; everyone has 5 tokens. \"All tokens in the goal\": everyone has 3 or 5 tokens, as chosen; a token that reaches the goal leaves the board, and the goal is free again; no stone stands on the last three fields before the goal. The first player with all tokens in the goal wins, and the others are ranked by their tokens in the goal.",
    bl_term_players: "Players",
    bl_rules_players: "2 to 4 players on one device; any of them can be played by the computer (Easy, Medium or Hard). Tokens are told apart by their shape: circle, triangle, diamond and star.",
    bl_rules_example_title: "A stone in the way",
    bl_rules_example: "The picture shows a token (circle) in front of a stone (black square). With a 2 it lands on the stone, takes it and puts it on another free field. With a 3 it cannot go straight on, because it would have to pass over the stone.",
    bl_history_title: "The History of Path Blockers",
    bl_history_origins_title: "Old race games",
    bl_history_origins_p1: "Race games, in which pieces move by dice along a track towards a goal, are among the oldest board games; the Royal Game of Ur is the oldest game whose rules have been handed down. Sending home and blocking are old ideas too: in Pachisi a piece that lands on an opponent's piece sends it back to the start, and in Backgammon a wall of pieces on consecutive points, called a prime, keeps the opponent's pieces behind it.",
    bl_history_modern_title: "Path Blockers at PaperGames",
    bl_history_modern_p1: "Path Blockers is PaperGames' own game: a network of paths with 49 fields and the goal at the top, six stones and up to four players. A stone that is hit is not removed but placed again, so the way to the goal keeps changing. The houses come onto the board at fields that are equally far from the goal, and the tokens differ by shape rather than colour, so the game works on black-and-white e-ink."
});
I18n.markTextLoaded("en");
