// text/en/alquerque.js
// Rules and history texts of alquerque (en). Loaded by alquerque-rules.html and alquerque-history.html only (see i18n.js, data-i18n-text).

Object.assign(STRINGS.en, {
    alquerque_rules_title: "Alquerque Rules",
    alquerque_rules_intro: "A quick reference for how PaperGames plays Alquerque, the jumping game described in the Book of Games of Alfonso X of Castile.",
    alquerque_rules_basics_title: "The basic idea",
    alquerque_term_board: "The board",
    alquerque_rules_board: "The board has 25 points in a 5x5 grid. Neighbouring points are joined across and down, and some of them also diagonally: diagonal lines run only through every other point, so that the four corners and the centre are joined in all eight directions. Pieces may only move along the lines that are drawn.",
    alquerque_term_setup: "Setting up",
    alquerque_rules_setup: "Each side has 12 pieces: White (rings) at the bottom, Black (filled discs) at the top. Each side fills the two rows nearest to it and the two points of the middle row on its own right-hand side. The centre point stays empty. White moves first.",
    alquerque_term_move: "Moving",
    alquerque_rules_move: "On your turn, move one of your pieces along a line to a neighbouring empty point: forward, sideways or diagonally forward. Pieces never move backwards, not even diagonally. Forward means towards your opponent's side of the board.",
    alquerque_term_capture: "Capturing",
    alquerque_rules_capture: "A piece captures by jumping along a line over a neighbouring enemy piece to the empty point directly behind it. The jumped piece is removed. If the same piece can then jump again, it keeps going in the same turn, even changing direction. Jumps may go in every direction, backwards too - a PaperGames rule, since the source only forbids moving backwards.",
    alquerque_term_forced: "Capturing is compulsory",
    alquerque_rules_forced: "If you can capture, you must: while a capture is available, PaperGames only lets you make capturing moves, and a piece that can keep jumping has to go on until it can't. When several captures are possible, you may choose any of them, not only the longest.",
    alquerque_rules_end_title: "How a game ends",
    alquerque_term_win: "Winning",
    alquerque_rules_win: "You win when your opponent has no pieces left, or has pieces but no legal move on their turn.",
    alquerque_term_resignation: "Resignation",
    alquerque_term_dead: "Sides that can no longer meet",
    alquerque_rules_dead: "PaperGames rule: when every White piece stands at least two rows further up the board than every Black piece, the sides can never meet again - White only moves up or sideways, Black only down or sideways. Nobody could ever capture again and the game would never end, so it ends at once: the side with more pieces wins, equal numbers are a draw.",
    alquerque_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favour.",
    alquerque_rules_versions_title: "Which version is played here",
    alquerque_rules_versions: "Old descriptions of Alquerque leave some details open. In the source below capturing is not compulsory: a piece that could have captured but didn't is removed instead (\"huffing\"). PaperGames keeps compulsory capturing, because the app only offers legal moves anyway. Pieces never move backwards, but they may jump in every direction (PaperGames rule). White moves first.",
    alquerque_rules_sources_title: "Sources",
    alquerque_rules_sources: "No backward moves and the end of the game follow: Wikipedia, „Alquerque“, section Rules: https://en.wikipedia.org/wiki/Alquerque (retrieved 6 October 2026).",
    alquerque_history_title: "The History of Alquerque",
    alquerque_history_origins_title: "A Name from Arabic",
    alquerque_history_origins_p1: "The name comes from the Arabic al-qirkat, the name of a board game known in the Arab world. It reached Spain under Moorish rule and lived on there as alquerque.",
    alquerque_history_book_title: "The Book of Games",
    alquerque_history_book_p1: "In 1283 King Alfonso X of Castile had the Libro de los juegos, the Book of Games, completed. Besides chess, dice and tables games it describes alquerque with its rules and illustrations, which makes it one of the earliest written sources for the game.",
    alquerque_history_checkers_title: "From Alquerque to Checkers",
    alquerque_history_checkers_p1: "Checkers is generally seen as a descendant of alquerque: its jumping capture and the rule that a capture must be taken were carried over to the squares of the chessboard. Alquerque itself kept being played, and similar games are known from many regions.",
    alquerque_history_modern_title: "On PaperGames",
    alquerque_history_modern_p1: "PaperGames plays the 12-against-12 game on the 5x5 board with compulsory capture. The board's lines are drawn in full, because only they show which diagonal moves exist."
});
I18n.markTextLoaded("en");
