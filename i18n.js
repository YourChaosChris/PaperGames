// i18n.js
// Minimal, dependency-free i18n. English lives here; every other language
// is its own file in lang/ (lang/de.js etc.) that adds itself to STRINGS,
// and only the active one is downloaded (see loadLanguage below). English
// always stays loaded: it is the fallback for missing keys and the source
// msg() translates runtime texts from. Adding a language means one new
// lang/xx.js plus its entry in LANGUAGE_NAMES/LANGUAGE_ORDER.
//
// The long rules and history texts (keys with _rules, _term_ or
// _history) live in separate files - i18n-text.js for English and
// lang/xx-text.js - because only the <game>-rules.html and
// <game>-history.html pages show them. Those pages carry
// <html data-i18n-text="1">, and only there are the text files loaded,
// the same way as the language file (see the end of this file).

const STRINGS = {
  en: {
    nav_home: "Home",
    nav_play: "Play",
    nav_rules: "Rules",
    nav_guide: "Guide",
    nav_about: "About",
    nav_history: "History",
    nav_stats: "Stats",
    footer_support: "Support",
    nav_impressum: "Legal Notice",
    nav_privacy: "Privacy Policy",
    toggle_moves_button: "Moves",

    home_tagline: "65 classic games, built for e-readers.",
    home_intro: "A small, dependency-free collection of classic board, strategy, and puzzle games made for E-Ink displays like Tolino, Kobo and Kindle: high contrast, no animations, and it keeps working with no internet connection once you've opened it.",
    home_pitch: "No ads, no account, and nothing about you is recorded. Once it has loaded, everything keeps working without internet. The computer never plays on by itself: stop whenever you like and carry on hours later, exactly where you left off. The source code is open.",
    home_pitch_link: "What makes this different",
    quickrules_button: "Quick rules",
    quickrules_go: "Let's go",
    quickrules_all: "All rules",
    quickrules_chess_1: "Checkmate the opponent's king: put it in check so that it has no legal move to escape.",
    quickrules_chess_2: "On your turn you move one of your pieces; each kind of piece moves in its own way.",
    quickrules_chess_3: "If the side to move has no legal move but isn't in check, that is stalemate and the game is a draw.",
    quickrules_checkers_1: "Win by capturing all of your opponent's pieces, or by leaving them with no legal move on their turn.",
    quickrules_checkers_2: "Men move one square diagonally forward; you capture by jumping over an adjacent enemy piece into the empty square right behind it.",
    quickrules_checkers_3: "If any capture is available, you must take one - a quiet move is illegal while a capture exists.",
    quickrules_xiangqi_1: "Checkmate the opponent's General, or leave them with no legal move on their turn - here that also counts as a win.",
    quickrules_xiangqi_2: "Pieces stand on the intersections, not in squares, and on your turn you move one of them according to its own rule.",
    quickrules_xiangqi_3: "The two Generals may never face each other on a fully open file.",
    quickrules_shogi_1: "Checkmate the opponent's King: leave it in check with no way to escape, block, or capture the checking piece.",
    quickrules_shogi_2: "On your turn, either move one of your pieces on the board or drop a captured piece from your hand onto any empty square.",
    quickrules_shogi_3: "You can't drop a Pawn onto a file that already has one of your own unpromoted Pawns, and a Pawn drop may never deliver checkmate.",
    quickrules_cardtactics_1: "Capture the opponent's master, or move your own master onto their home shrine, the center square of their back row.",
    quickrules_cardtactics_2: "On your turn, pick one of your two cards, then one of your pieces, then a square that card allows for it.",
    quickrules_cardtactics_3: "The card you used then goes to the middle and the waiting card there joins your hand, so the cards keep rotating between both players.",
    quickrules_hnefatafl_1: "The king's side wins when the king reaches a corner; the attackers win by surrounding him on all four sides.",
    quickrules_hnefatafl_2: "Every piece, including the king, moves like a rook: any distance in a straight line, but never through or onto another piece.",
    quickrules_hnefatafl_3: "Only the piece that just moved can capture, so moving your own piece between two enemies is always safe.",
    quickrules_go_1: "Score more than your opponent: your stones on the board plus the empty points surrounded only by your stones.",
    quickrules_go_2: "Take turns placing a stone on an empty intersection; stones never move, and a group with no liberties left is captured.",
    quickrules_go_3: "Dead stones are not removed at the end: every stone still on the board when both players pass counts, so capture dead stones before passing.",
    quickrules_reversi_1: "Have more discs of your color on the board than your opponent when neither player can move.",
    quickrules_reversi_2: "Place a disc so that it traps one or more opponent discs in a straight line between it and another of your discs; those discs flip to your color.",
    quickrules_reversi_3: "If you have no legal move, your turn is skipped automatically, and you can't pass voluntarily while a legal move exists.",
    quickrules_fourinarow_1: "Be the first to line up four of your own discs in a row, horizontally, vertically or diagonally.",
    quickrules_fourinarow_2: "Choose one of the seven columns; your disc always falls to the lowest empty slot in that column.",
    quickrules_gomoku_1: "Be the first to get five or more of your own stones in an unbroken line, horizontally, vertically or diagonally.",
    quickrules_gomoku_2: "Take turns placing a stone on an intersection of the 15x15 grid; stones are never moved or captured.",
    quickrules_hex_1: "Connect your two edges with an unbroken chain of your own stones – Red owns the top and bottom edges, Blue the left and right.",
    quickrules_hex_2: "On your turn, place one stone of your color on any empty cell; there is no capturing, and stones never move once placed.",
    quickrules_morris_1: "You win by reducing your opponent to two pieces or leaving them with no legal move on their turn.",
    quickrules_morris_2: "First place your 9 pieces one at a time, then slide a piece to an adjacent empty point; completing a mill lets you remove an opposing piece.",
    quickrules_morris_3: "You may not remove a piece that is part of an opponent's mill, unless every one of their pieces is in a mill.",
    quickrules_wallmaze_1: "Be the first to bring your pawn to any square of the far row.",
    quickrules_wallmaze_2: "On your turn, either move your pawn one square up, down, left or right, or place one of your ten walls.",
    quickrules_wallmaze_3: "Walls may never overlap or cross, and a wall can never be placed if it would seal off either player's last path to their goal row.",
    quickrules_halma_1: "Be the first to move all ten of your pieces into the camp in the diagonally opposite corner.",
    quickrules_halma_2: "Move one piece a single square in any of the 8 directions, or jump over an adjacent piece onto the empty square beyond – nothing is captured – and keep jumping if you like.",
    quickrules_halma_3: "A turn is either exactly one step or a sequence of jumps – you cannot combine the two.",
    quickrules_sternhalma_1: "Be the first to move all ten of your marbles into the point of the star directly opposite.",
    quickrules_sternhalma_2: "Move one marble a single step to one of the 6 adjacent holes, or hop over an adjacent marble into the empty hole beyond – nothing is captured – and keep hopping if you like.",
    quickrules_sternhalma_3: "A turn is either exactly one step or a sequence of hops – you cannot combine the two.",
    quickrules_dotsandboxes_1: "Own more boxes than your opponent once every line on the board has been drawn.",
    quickrules_dotsandboxes_2: "On your turn, draw one horizontal or vertical line between two neighboring dots; drawing the fourth side of a box makes it yours.",
    quickrules_dotsandboxes_3: "Completing a box gives you another turn right away, so the turn only passes once you draw a line that completes nothing.",
    quickrules_amazons_1: "Be the last player able to move: if none of your amazons has a legal move on your turn, you lose.",
    quickrules_amazons_2: "Move one amazon like a chess queen through empty squares, then that same amazon must shoot an arrow, burning the square where it lands.",
    quickrules_amazons_3: "A burned square stays impassable for the rest of the game: no amazon and no arrow may ever cross it or land on it.",
    quickrules_backgammon_1: "Be the first to bring all 15 of your checkers into your home board and bear them off.",
    quickrules_backgammon_2: "Roll two dice and move your checkers by those numbers, with doubles giving four moves; a point held by two or more opposing checkers is blocked.",
    quickrules_backgammon_3: "A checker sent to the bar must re-enter through the opponent's home board before that player can make any other move.",
    quickrules_ur_1: "Be the first to bring all 7 of your pieces along your 14-square path and off the board.",
    quickrules_ur_2: "Roll the four binary dice for a total of 0 to 4 and move one piece forward that many squares; a 0 passes your turn.",
    quickrules_ur_3: "A piece can only leave the board with an exact roll – overshooting is not allowed.",
    quickrules_senet_1: "Be the first to bear off all five of your pieces from the end of the 30-square track.",
    quickrules_senet_2: "Throw the four sticks and move one of your pieces forward that many squares; no sticks landing marked side up counts as 6.",
    quickrules_senet_3: "Square 26, the House of Beauty, can't be jumped over: a piece must land on it exactly before moving further.",
    quickrules_mancala_1: "At the end, whoever has the most seeds in their own store wins.",
    quickrules_mancala_2: "Pick one of your own non-empty pits; its seeds are sown one at a time into the following pits, counter-clockwise around the board.",
    quickrules_mancala_3: "Sowing always skips your opponent's store: it never receives a seed from your move.",
    quickrules_yatzy_1: "Score as many points as you can by filling in all 15 categories on the scoresheet.",
    quickrules_yatzy_2: "Each turn, roll five dice up to three times, tapping dice to hold them, then tap a category to score your dice there.",
    quickrules_yatzy_3: "Small Straight counts only 1-2-3-4-5 and Large Straight only 2-3-4-5-6, not any four or five dice in a row as in Yahtzee.",
    quickrules_sudoku_1: "Fill every empty cell with a digit from 1 to 9 so that each row, each column and each 3x3 box contains every digit exactly once.",
    quickrules_sudoku_2: "Select a cell, then pick a number from the pad below the board or type a digit on a keyboard.",
    quickrules_minesweeper_1: "Reveal every cell that isn't a mine; each number shows how many mines hide in the eight neighboring cells.",
    quickrules_minesweeper_2: "Reveal cells one at a time, and mark a cell you believe hides a mine with a flag using Flag mode or a right-click.",
    quickrules_minesweeper_3: "Clicking a revealed number whose flagged neighbors match its count opens all its other neighbors at once, so a wrong flag can still cost you the game.",
    quickrules_twenty48_1: "Merge tiles of the same value until you reach a 2048 tile.",
    quickrules_twenty48_2: "Each move slides every tile as far as it will go up, down, left or right, and two equal tiles that collide merge into their sum.",
    quickrules_twenty48_3: "Each tile can merge only once per move, so three equal tiles merge just the leading pair and leave the third alone.",
    quickrules_freecell_1: "Build all four foundations by suit, from Ace up to King.",
    quickrules_freecell_2: "Move a card onto a tableau card exactly one rank higher and of the opposite color, onto an empty column, or into a free cell.",
    quickrules_freecell_3: "Several cards can be moved together only up to a limit set by how many free cells and empty columns are available.",
    quickrules_mahjong_1: "Clear every tile from the board by matching them in pairs.",
    quickrules_mahjong_2: "Click a free tile, then another free tile showing the same symbol, to remove both.",
    quickrules_mahjong_3: "A tile is free only when nothing sits on top of it and its left or right neighbor on the same layer is missing or already cleared.",
    quickrules_nonogram_1: "Fill in cells to uncover the hidden picture, using the number clue of each row and column.",
    quickrules_nonogram_2: "Use Fill mode to shade a cell and Mark X mode to cross out a cell you're sure is empty.",
    quickrules_nonogram_3: "Each clue number is one block of consecutive filled cells, in the given order, with at least one empty cell between blocks.",
    quickrules_pegsolitaire_1: "Jump pegs until only a single peg is left on the board.",
    quickrules_pegsolitaire_2: "Select a peg, then an empty hole two spaces away in a straight line with another peg directly between them; the jumped peg is removed.",
    quickrules_pegsolitaire_3: "Jumps go only up, down, left or right, never diagonally, except on the triangle board.",
    quickrules_lightswitch_1: "Turn off every light on the board.",
    quickrules_lightswitch_2: "Pressing a cell toggles it and its neighbors above, below, left and right; diagonal neighbors are never affected.",
    quickrules_lightswitch_3: "At the edge of the board a press never wraps around to the opposite side, so edge and corner cells have fewer neighbors.",
    quickrules_bullsandcows_1: "Crack the secret code of four shapes before you run out of guesses.",
    quickrules_bullsandcows_2: "Tap a slot to cycle it through the six shapes, then tap Submit guess once all four slots are set.",
    quickrules_bullsandcows_3: "A black peg means right shape in the right position, a white peg right shape in the wrong position, but the pegs never say which slots they refer to.",
    quickrules_klondike_1: "Build all four foundations up by suit, from Ace to King.",
    quickrules_klondike_2: "Move a card onto a tableau card exactly one rank higher and of the opposite color; a face-up run in that order can move as one unit.",
    quickrules_klondike_3: "An empty column accepts a King only.",
    quickrules_spidersolitaire_1: "Assemble all 8 runs from King down to Ace in a single suit; each complete run is removed automatically.",
    quickrules_spidersolitaire_2: "Move a card onto a card exactly one rank higher, whatever its suit; an empty column accepts any card.",
    quickrules_spidersolitaire_3: "Several cards can only move together if they already form a descending run of the same suit.",
    quickrules_kakuro_1: "Fill every white cell with a digit from 1 to 9 so that each run adds up exactly to its clue.",
    quickrules_kakuro_2: "Select a white cell, then pick a digit from the pad below the board.",
    quickrules_kakuro_3: "No digit may repeat within the same run, though it can reappear in a run crossing it.",
    quickrules_fanorona_1: "Capture all of your opponent's pieces, or leave them with no legal move.",
    quickrules_fanorona_2: "Slide a piece along a line to an adjacent empty point; moving toward or away from an enemy line captures it by approach or withdrawal.",
    quickrules_fanorona_3: "Capturing is mandatory: if any capture is available anywhere on the board, you must play one instead of a quiet (paika) move.",
    quickrules_baghchal_1: "The tigers try to capture goats; the goats try to trap all four tigers so they have no legal move.",
    quickrules_baghchal_2: "Goats are placed one per turn until all 20 are on the board, then pieces slide one step along a line; a tiger captures by jumping over an adjacent goat.",
    quickrules_baghchal_3: "The tigers win as soon as they have captured 5 goats in total.",
    quickrules_tablut_1: "The king's side wins if he reaches a corner; the attackers win by capturing him first.",
    quickrules_tablut_2: "Every piece, the king included, moves like a rook: any distance in a straight line, never through or onto another piece.",
    quickrules_tablut_3: "The throne and the four corners are off-limits to everyone but the king: attackers and defenders can neither land on them nor pass through them.",
    quickrules_marblepush_1: "Be the first to push 6 of your opponent's marbles off the board.",
    quickrules_marblepush_2: "Move one marble, or a straight line of 2 or 3 of your own marbles, one step in any of the 6 directions.",
    quickrules_marblepush_3: "You can only push enemy marbles with a strictly longer line: 3 can push 1 or 2, 2 can push 1, and a single marble can never push.",
    quickrules_pyramidsolitaire_1: "Clear all 28 pyramid cards; the stock and waste piles don't need to be emptied.",
    quickrules_pyramidsolitaire_2: "Remove two available cards whose values add up to exactly 13; a King is worth 13 on its own and is removed alone.",
    quickrules_pyramidsolitaire_3: "A pyramid card can only be picked once both cards resting on it in the row below are gone; covered cards are shown dimmed.",
    quickrules_surakarta_1: "Capture all of your opponent's stones, or leave them with no legal move.",
    quickrules_surakarta_2: "Each turn, either step one stone to an adjacent empty point in any of the 8 directions, or make a capturing slide along the loop tracks.",
    quickrules_surakarta_3: "A capture only works with a slide that has gone around at least one loop; a plain step never captures, even right next to an enemy stone.",
    quickrules_hashi_1: "Connect all islands into one network so that every island has exactly as many bridges as its number shows.",
    quickrules_hashi_2: "Tap the line between two islands to build a bridge: the first tap draws a single bridge, the second a double, the third removes it.",
    quickrules_hashi_3: "Bridges may never cross each other, so a standing bridge blocks any connection that would have to cross it.",
    quickrules_fleetbattle_1: "Be the first to sink all five of the opponent's ships.",
    quickrules_fleetbattle_2: "Click a cell on the enemy grid to fire; you get one shot per turn, even after a hit.",
    quickrules_fleetbattle_3: "When placing your fleet, ships may not touch each other, not even diagonally.",
    quickrules_skyscrapers_1: "Fill the grid with heights from 1 to N so each row and column has every height once and every edge clue matches.",
    quickrules_skyscrapers_2: "Select a cell, then pick a height from the pad below the board.",
    quickrules_skyscrapers_3: "A clue counts the buildings visible from that side, and a taller building hides every shorter one behind it.",
    quickrules_konane_1: "Leave your opponent without a move: whoever has no legal jump on their turn loses immediately.",
    quickrules_konane_2: "Every move is a jump: hop a stone over an adjacent enemy stone, never diagonally, into the empty square beyond, removing the jumped stone.",
    quickrules_konane_3: "Before the first jump, Black removes one of its stones from a corner or the center, then White removes one directly beside that gap.",
    quickrules_slitherlink_1: "Draw one closed loop so that each number shows exactly how many of its square's four edges are drawn.",
    quickrules_slitherlink_2: "Tap an edge to draw it, tap again to mark it with a cross, and a third time to clear it.",
    quickrules_slitherlink_3: "There must be exactly one loop: no loose ends, no branches and no second separate loop.",
    quickrules_ludo_1: "Be the first to bring all 4 of your tokens around the track into the center finish.",
    quickrules_ludo_2: "Roll the die and move one token by the number rolled; a token leaves its home base only on a 6.",
    quickrules_ludo_3: "Two of your tokens on one square form a block that opponents can neither land on nor pass, and a token must land exactly on the finish.",
    quickrules_categories_1: "Score the most points by writing one word per category that starts with the drawn letter.",
    quickrules_categories_2: "Tap “Draw a letter”, everyone writes on paper, and the round ends when time runs out or someone calls “Stop!”.",
    quickrules_categories_3: "A unique answer scores 10, an answer someone else also wrote scores 5, and the only answer found in a category scores 20.",
    quickrules_domino_1: "Be the first to play your last tile.",
    quickrules_domino_2: "Tap a tile in your hand, then the open end it should go on; the touching halves must show the same number.",
    quickrules_domino_3: "If none of your tiles fits, you must draw from the stock until one does, and you only pass once the stock is empty.",
    quickrules_maumau_1: "Be the first to play your last card.",
    quickrules_maumau_2: "Tap a card that matches the top card of the discard pile in suit or rank, or tap the stock to draw.",
    quickrules_maumau_3: "A Seven makes the next player draw two cards, unless they play a Seven too, which passes the penalty on and adds two more.",
    quickrules_calcudoku_1: "Fill the grid so every row and column holds each digit once and every cage reaches its target with its operation.",
    quickrules_calcudoku_2: "Select a cell, then pick a number from the pad below the board.",
    quickrules_calcudoku_3: "A digit may appear twice in one cage, as long as its row and column allow it.",
    quickrules_numberblocks_1: "Fill every empty cell so that a block of n cells holds the digits 1 to n, each exactly once.",
    quickrules_numberblocks_2: "Select a cell, then pick a number from the pad below the board.",
    quickrules_numberblocks_3: "Two equal digits must never touch – not even diagonally, and not even when they belong to different blocks.",
    quickrules_killersudoku_1: "Fill every cell with a digit from 1 to 9 so that each row, each column and each 3x3 box contains every digit exactly once.",
    quickrules_killersudoku_2: "Select a cell, then pick a number from the pad below the board.",
    quickrules_killersudoku_3: "The digits in a cage must add up to the small number in its top-left cell, and no digit may repeat inside a cage.",
    quickrules_schwimmen_1: "Avoid the lowest score when the cards are shown, because it costs a life; the last player left in the game wins.",
    quickrules_schwimmen_2: "On your turn do exactly one thing: swap one card or all three with the middle, pass, or knock.",
    quickrules_schwimmen_3: "A hand counts only the cards of one suit; the only exception is three cards of the same rank, which count 30.5, and three Aces 31.",
    quickrules_durak_1: "Get rid of your cards: once the stock is empty, the last player still holding cards is the durak and loses.",
    quickrules_durak_2: "The attacker lays a card; the defender must beat it with a higher card of the same suit, or with a trump if it is not a trump.",
    quickrules_durak_3: "Cards may only be thrown in if their rank is already on the table – never more than six attack cards, nor more than the defender held when the round began.",
    quickrules_concan_1: "Be the first to lay out eleven cards in melds: sets of three or four cards of the same rank, or runs of three or more cards of one suit.",
    quickrules_concan_2: "Draw from the stock, or take the top discard only if you lay it out at once; every turn ends with a discard.",
    quickrules_concan_3: "You may only add cards to your own melds, never to your opponent's.",
    quickrules_doppelkopf_1: "The two players holding a Queen of Clubs play as Re against Kontra; Re needs at least 121 of the 240 card points to win.",
    quickrules_doppelkopf_2: "Everyone plays one card to each trick; you must follow the suit that was led, and trump counts as one suit of its own.",
    quickrules_doppelkopf_3: "If Hearts are led, a Heart Ten does not count as Hearts, because it is a trump – and neither do Queens or Jacks.",
    quickrules_trix_1: "After four kingdoms of five contracts each, the player with the most points wins; four contracts cost points, and Trix hands them out.",
    quickrules_trix_2: "In the trick-taking contracts you must follow suit if you can; in Trix you lay one fitting card on the rows started by the Jacks.",
    quickrules_trix_3: "In the King of Hearts contract, if you cannot follow suit and hold the King of Hearts, you must play it.",
    quickrules_cratepusher_1: "Push every crate onto a target; it doesn't matter which crate goes on which target.",
    quickrules_cratepusher_2: "Tap a cell next to you to step there; walking into a crate pushes it one cell further if the cell behind it is free.",
    quickrules_cratepusher_3: "Crates can never be pulled, so a crate pushed into a corner that is not a target can make the level unsolvable.",
    quickrules_tictactoe_1: "Be the first to get three of your own marks in a row – across, down or diagonally.",
    quickrules_tictactoe_2: "Take turns putting your mark in an empty cell: a cross for Player 1, who always moves first, and a circle for Player 2.",
    quickrules_alquerque_1: "Capture all of your opponent's pieces, or leave them with no legal move. If the sides can no longer meet, the one with more pieces wins.",
    quickrules_alquerque_2: "Move a piece along a line to the next empty point - forward, sideways or diagonally forward, never backwards. Capture by jumping over an enemy piece to the empty point right behind it, in any direction.",
    quickrules_alquerque_3: "Capturing is compulsory: if you can capture, you must, and a piece that can keep jumping must go on jumping.",
    quickrules_pairs_1: "Find more pairs than your opponent - or, playing solo, all pairs in as few moves as you can.",
    quickrules_pairs_2: "Turn over two cards one after the other; a matching pair is yours and you go again, otherwise your next tap turns both back.",
    quickrules_pairs_3: "Nothing turns back by itself, so take your time - and on Hard the computer never forgets a card it has seen.",
    quickrules_futoshiki_1: "Fill the grid so that every row and every column contains each number exactly once.",
    quickrules_futoshiki_2: "Select a cell, then pick a number; a few numbers may already be given.",
    quickrules_futoshiki_3: "Every sign between two cells must hold: its narrow tip points to the smaller number.",
    quickrules_foxandgeese_1: "The geese win by shutting the fox in so that it cannot move; the fox wins once only 2 geese are left.",
    quickrules_foxandgeese_2: "Move one step along a line. The fox captures by jumping over a goose to the empty point behind it, and may jump again.",
    quickrules_foxandgeese_3: "Geese move forward or sideways, never back, and they cannot capture.",
    quickrules_seega_1: "Capture all of your opponent's stones.",
    quickrules_seega_2: "First both sides place their stones, two per turn, leaving the centre free; then move one square across or down and capture by trapping an enemy stone between two of your own.",
    quickrules_seega_3: "After a capture the same stone may move again if that move captures too. A stone that moves between two enemy stones itself is safe.",
    quickrules_romme_1: "Get rid of all your cards by laying out sets and runs.",
    quickrules_romme_2: "Each turn: draw a card, lay out or add to melds, then discard one. Your first meld must be worth at least 40 points (adjustable).",
    quickrules_romme_3: "After your first meld you may add cards to any meld on the table - also your opponents' (unlike Concan).",
    offline_ready: "Ready offline. You can switch off the WiFi and the games keep running.",
    offline_loading: "Being stored on your device right now. Keep this page open for a moment.",
    offline_unavailable: "Your browser can't store this site. It only runs with an internet connection.",
    home_play_button: "▶ Choose a game",
    home_surprise_button: "Surprise me",
    home_languages: "Available in 12 languages",
    home_play_desc: "Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_guide_desc: "Get it onto your e-reader and keep it working offline.",
    home_about_desc: "Why this exists, and how to say thanks.",
    home_stats_desc: "See your win/loss record against the computer, for every game.",
    home_games_title: "Choose a game",
    home_section_strategy: "Strategy Games",
    home_section_race: "Dice & Race Games",
    home_section_puzzles: "Solo Puzzles",
    home_section_continue: "Continue Playing",
    high_contrast_toggle: "High contrast",
    settings_section_density: "Spacing",
    settings_density_compact: "Compact",
    settings_density_normal: "Normal",
    settings_density_spacious: "Spacious",
    nav_devices: "Tested devices",
    about_devices_link: "Which e-readers PaperGames has been tested on - and how you can check yours",
    devices_intro: "PaperGames runs in the web browser of an e-reader. Which readers it really works on is only known where someone has tried it and reported back. This page lists those devices, and it says just as clearly what has not been tested.",
    devices_list_title: "Devices with a report",
    devices_col_device: "Device",
    devices_col_screen: "Screen",
    devices_col_checked: "What was checked",
    devices_col_date: "Date",
    devices_checked_user_report: "Played in the device's own browser; the problems found were reported",
    devices_checked_dev_device: "Development device: every change is checked on it",
    devices_screen_unknown: "model not reported",
    devices_untested: "Every other device is untested. PaperGames may well work on it, but nobody has reported back yet.",
    devices_check_title: "Check it on your own device",
    devices_step1_title: "1. Open the page",
    devices_step1_text: "Open PaperGames in your reader's own browser. Look out for: the page loads, the text is sharp and nothing is cut off at the side.",
    devices_step2_title: "2. Start a game",
    devices_step2_text: "Start a game, for example Sudoku or Chess, and make a few moves. Look out for: every tap lands on the square you meant, and the board fits on the screen without scrolling sideways.",
    devices_step3_title: "3. Open the settings",
    devices_step3_text: "Open Settings and switch the text size and high contrast. Look out for: the page changes at once and everything stays readable.",
    devices_step4_title: "4. Go offline",
    devices_step4_text: "Wait until the home page says that PaperGames is ready offline, then switch off Wi-Fi and reload the page. Look out for: the page and a game still open.",
    devices_step5_title: "5. Come back later",
    devices_step5_text: "Leave a game in the middle, close the browser and open it again later. Look out for: the game is exactly where you left it.",
    devices_report_title: "Report back",
    devices_report_text: "Send the name of your device and, if you can, a screenshot of what you saw to this address:",
    devices_report_note: "There is no form and no account, and nothing is recorded - it is just an e-mail.",
    settings_menu_button: "Settings",
    settings_modal_title: "Settings",
    settings_close: "Close",
    settings_section_language: "Language",
    settings_section_textsize: "Text size",
    settings_textsize_normal: "Normal text size",
    settings_textsize_large: "Large text size",
    settings_textsize_xlarge: "Extra large text size",
    settings_section_display: "Display",
    home_section_favorites: "My Favorites",
    home_favorites_empty: "Tap the star on any game to add it here.",
    home_section_popular: "Popular Games",
    home_section_new: "New Games",
    home_all_games_title: "Looking for something else?",
    home_all_games_desc: "Browse and search all 65 games, sortable alphabetically or by type.",
    nav_all_games: "All Games",
    all_games_intro: "Every game in PaperGames, in one place. Search by name, sort alphabetically or by type, and tap the star to add a game to your Favorites on the home page.",
    all_games_search_placeholder: "Search games…",
    all_games_category_all: "All",
    all_games_sort_label: "Sort by:",
    all_games_sort_alpha: "Alphabetical",
    all_games_sort_type: "Type",
    games_sort_newest: "Newest first",
    all_games_no_results: "No games match your search.",
    favorite_add: "Add to Favorites",
    favorite_remove: "Remove from Favorites",
    history_title: "Game History Library",
    history_intro: "Every game in this collection has its own story - some over five thousand years old, some barely a decade. Read through them here, in roughly the order each game first appeared, or jump straight to any one's full history page.",
    history_dates_note: "Dates for the oldest games are approximate - their exact origins are often lost to history or debated by historians.",
    history_read_more: "Full history →",
    home_history_title: "Curious where these games come from?",
    home_history_desc: "Read every game's origin story, from ancient Egypt to last decade - no browsing, just history.",
    home_chess_desc: "The classic game. Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_go_desc: "The ancient territory game. Local 2-player or vs. the built-in engine, three board sizes, three difficulty levels.",
    home_checkers_desc: "The classic jump-and-capture game. Local 2-player or vs. the built-in engine, three difficulty levels.",
    home_ur_desc: "A 4,600-year-old race game rediscovered from ancient Mesopotamia. Local 2-player or vs. the built-in engine, with rosette squares and capture-by-landing.",
    home_morris_desc: "A centuries-old strategy game of placing and sliding pieces to form mills. Local 2-player or vs. the built-in engine, with the classic flying endgame rule.",
    home_backgammon_desc: "The classic dice race game. Local 2-player or vs. the built-in engine, with the bar, bearing off, and blot-hitting.",
    home_xiangqi_desc: "Chinese chess: generals, elephants, cannons and more on a 9x10 grid. Local 2-player or vs. the built-in engine, with a toggle between classic characters and Western-style symbols.",
    home_mancala_desc: "One of the world's oldest game families: sow seeds around the board to fill your own store. Local 2-player or vs. the built-in engine, with captures and extra turns.",
    home_reversi_desc: "Flip the board's colour by flanking your opponent's discs. Local 2-player or vs. the built-in engine.",
    game_chess: "Chess",
    game_go: "Go",
    game_checkers: "Checkers",
    game_ur: "Ur",
    game_ur_full: "Royal Game of Ur",
    game_morris: "Morris",
    game_morris_full: "Nine Men's Morris",
    game_backgammon: "Backgammon",
    game_xiangqi: "Xiangqi (Chinese Chess)",
    game_xiangqi_short: "Xiangqi",
    game_mancala: "Mancala",
    game_mancala_full: "Mancala (Kalaha)",
    game_reversi: "Reversi",

    xiangqi_style_show_symbols: "Switch to symbols",
    xiangqi_style_show_classic: "Switch to characters",
    mancala_store: "Store",

    chess_piece_pawn: "Pawn",
    chess_piece_knight: "Knight",
    chess_piece_bishop: "Bishop",
    chess_piece_rook: "Rook",
    chess_piece_queen: "Queen",
    chess_piece_king: "King",




    ur_tray_start: "Start",
    ur_tray_home: "Home",
    ur_roll_dice: "Roll dice",



    backgammon_tray_bar: "Bar",
    backgammon_tray_off: "Off",
    backgammon_double_button: "Double",







    senet_throw_sticks: "Throw sticks",

    shogi_promote_question: "Promote this piece?",
    shogi_promote_yes: "Promote",
    shogi_promote_no: "Don't promote",

    sudoku_new_game: "New puzzle",
    sudoku_erase: "Erase",
    level_easy: "Easy",
    level_medium: "Medium",
    level_hard: "Hard",

    pegsolitaire_new_game: "New game",

    pegsolitaire_board_label: "Board",

    pegsolitaire_board_english: "English (33 holes)",

    pegsolitaire_board_european: "European (37 holes)",

    pegsolitaire_board_wiegleb: "German, Wiegleb 1779 (45 holes)",

    pegsolitaire_board_square36: "Square (36 holes)",

    pegsolitaire_board_diamond41: "Large diamond (41 holes)",

    pegsolitaire_board_triangle15: "Triangle (15 holes)",

    minesweeper_new_game: "New game",
    minesweeper_level_easy: "Easy (9x9, 10 mines)",
    minesweeper_level_medium: "Medium (16x16, 40 mines)",
    minesweeper_level_hard: "Hard (30x16, 99 mines)",
    minesweeper_flag_mode: "Flag mode",

    nonogram_new_game: "New puzzle",
    nonogram_level_easy: "Easy (5x5)",
    nonogram_level_medium: "Medium (10x10)",
    nonogram_level_hard: "Hard (15x15)",
    nonogram_mode_fill: "Fill",
    nonogram_mode_mark: "Mark X",

    twenty48_new_game: "New game",
    twenty48_up: "Up",
    twenty48_down: "Down",
    twenty48_left: "Left",
    twenty48_right: "Right",

    mahjong_new_game: "New game",
    mahjong_shuffle: "Shuffle remaining tiles",


    chess_history_intro: "From an ancient Indian war game to the world's most studied board game - chess has crossed continents and centuries to become what it is today.",

    go_history_intro: "Go is one of the oldest board games still played in its original form - a game of territory and stones with roots that likely reach back over 2,500 years in China.",

    checkers_history_intro: "Checkers (draughts) is a game of simple rules and deep strategy, born from combining an ancient board with a newer way of capturing.",

    ur_history_intro: "At roughly 4,600 years old, the Royal Game of Ur is one of the oldest board games ever discovered - and, thanks to a piece of detective work spanning two millennia, one of the few ancient games we can still play by its original rules.",

    morris_history_intro: "Few games have been carved into as many different surfaces across as many centuries as Nine Men's Morris - from Egyptian temple roofs to English cathedral cloisters.",

    backgammon_history_intro: "Backgammon's family tree runs through nearly every civilization that has rolled dice - from ancient Mesopotamia and Rome to the coffee houses of the modern Middle East.",

    xiangqi_history_intro: "Chinese chess shares deep roots with international chess, yet took its own distinct path over more than a thousand years to become the game played by hundreds of millions today.",

    mancala_history_intro: "Mancala isn't one game but an entire family of them - among the oldest game families on Earth, built around the simple, universal act of moving seeds or stones between pits.",

    reversi_history_intro: "A Victorian parlor game, reinvented twice over a century apart.",

    fourinarow_history_intro: "A simple gravity-powered idea that turned into one of the best-selling games of the 20th century.",

    gomoku_history_intro: "A simple line-them-up game whose very simplicity forced competitive players to change its rules.",
    tictactoe_history_intro: "Probably the best-known pencil-and-paper game of all - with roots in ancient Rome and a place in the history of computers.",

    senet_history_intro: "One of the oldest board games ever found - and one whose exact rules have been lost for thousands of years.",

    shogi_history_intro: "Japan's take on the chess family, and the only major variant where a captured piece doesn't leave the game - it joins the side that captured it.",

    sudoku_history_intro: "Unlike every other game in this collection, Sudoku has no ancient pedigree at all - it's barely older than the personal computer.",

    pegsolitaire_history_intro: "A single-player puzzle old enough to have its own court legend, and the subject of one of the more surprising results in recreational mathematics.",

    minesweeper_history_intro: "A puzzle whose defining rule - a completely safe first move - only became standard once computers, rather than a printed page, could generate a fresh board on demand.",

    nonogram_history_intro: "A logic puzzle invented independently, on opposite sides of the world, within a few years of each other - and named after one of its two inventors.",

    twenty48_history_intro: "A game built almost entirely out of other games' ideas, made in a weekend, and cloned by more people than perhaps any browser game before it.",

    mahjong_history_intro: "A single-player tile-matching game named after, and visually borrowing from, a completely different four-player game it has almost nothing else in common with.",

    back_home: "← Back to home",
    menu_toggle: "☰ Menu",
    mode_two_player: "2 Player (local)",
    vs_computer: "vs Computer",
    new_game: "New game",
    vs_human: "vs Human",
    not_connected: "Not connected",
    loading_profile: "Online account connected, loading profile…",
    signed_in_as: "Signed in as",
    connect_lichess: "Connect (Lichess)",
    logout: "Logout",
    find_game: "Find game",
    load_game: "Load game",

    guide_title: "Guide: PaperGames on your device",
    guide_intro: "Three ways to get PaperGames onto an e-reader, roughly from easiest to most manual.",
    guide_web_title: "1. Just open it in the browser",
    guide_web_body: "There's nothing to download and nothing to install. Open this same web address in your e-reader's browser and bookmark it. After the first visit, PaperGames caches itself for offline use automatically - close the WiFi and it keeps working. Storing it can take a minute or two; keep the page open until then. The home page shows when it's done (\"Ready offline\"). The only exception is Chess's online Lichess mode, which needs an actual connection; every other game here is offline-only and unaffected.",
    guide_pwa_title: "2. Add it to the home screen",
    guide_pwa_body: "If your e-reader's browser offers “Add to Home Screen” or “Install app”, use it. PaperGames then opens like a regular app, full-screen, without browser chrome around it.",
    guide_sideload_title: "3. Sideload via USB",
    guide_sideload_body: "Copy all the app's files onto the device over USB and open index.html directly from local storage (a file:// address). Offline play works exactly the same way. The one thing that doesn't work over file:// is Lichess login (OAuth requires a real http/https address) - local 2-player and vs-computer modes are unaffected in every game here.",
    guide_offline_title: "What works offline",
    guide_offline_body: "Everything except Chess's online Lichess games: local 2-player and the built-in computer opponent at every level, in every game here, run entirely on the device with no server involved.",

    guide_update_title: "Not seeing the latest version?",
    guide_update_body: "PaperGames caches itself so it keeps working offline, which on some e-reader browsers can mean an update takes a while to show up even after a reload. This button clears that cache and forces a fresh copy of every file - you'll need to be online for it to work.",
    guide_update_button: "Force update now",
    guide_update_done: "Cache cleared. Reloading…",

    about_intro: "I searched for a simple chess game for my eReader — but all I found were people searching, not playing. So I built my own. That’s how PaperGames was born, and I’m happy to share it with everyone. It has since grown into a small collection of E-Ink-friendly board games, with more planned.",
    about_donate_intro: "If you enjoy PaperGames or have ideas for improvements, you can send feedback and support the project here:",
    about_donate_button: "Buy me a coffee",
    about_qr_text: "Or scan this QR code to open the donation page on your phone:",
    about_credits: "Chess piece set (“cburnett”) by Colin M.L. Burnett, used under the BSD license. Xiangqi's symbol-style pieces are adapted from piece drawings originally by Inductiveload (Wikimedia Commons, CC BY-SA), as resplit per piece by Kadagaden (github.com/Kadagaden/chess-pieces, “xiangqi_wikipedia_intl_modded”, CC BY 4.0). Shogi's piece kanji are adapted from the “kanji_light” piece set by Kadagaden (github.com/Kadagaden/shogi-pieces, CC BY 4.0). The Minesweeper and FreeCell home-page icons are made by Skoll and Aussiesim respectively, available on game-icons.net (CC BY 3.0).",
    impressum_info_heading: "Information pursuant to Section 5 DDG (German Digital Services Act)",
    impressum_country: "Germany",
    impressum_phone_label: "Phone:",
    impressum_email_label: "Email:",
    impressum_responsible_heading: "Responsible for content pursuant to Section 18(2) MStV (German Interstate Media Treaty)",
    impressum_responsible_body: "Christopher Müller, address as above",
    impressum_vat_notice: "No VAT is shown on this site pursuant to Section 19 UStG (German small business regulation).",
    impressum_disclaimer_heading: "Disclaimer",
    impressum_liability_links_heading: "Liability for links",
    impressum_liability_links_body: "This website contains links to external third-party websites, in particular lichess.org and paypal.com, over whose content we have no influence. We therefore cannot accept any liability for this external content. The respective provider or operator of a linked page is always responsible for its content. The linked pages were checked for possible legal violations at the time of linking. No unlawful content was identifiable at that time. However, permanent monitoring of the content of linked pages is not reasonable without concrete evidence of a legal violation. If we become aware of any legal violations, we will remove such links immediately.",
    impressum_trademarks_heading: "Trademarks",
    impressum_trademarks_body: "The history pages mention names of commercial games to place the origin of a game principle in context. Some of these names are registered trademarks of their respective owners. PaperGames is not affiliated with these owners and is not endorsed, sponsored or reviewed by them. All games here are independent implementations; no material from commercial editions is used.",
    privacy_title: "Privacy Policy",
    privacy_controller_heading: "1. Controller",
    privacy_controller_body: "The controller responsible for data processing on this website within the meaning of the GDPR is:",
    privacy_hosting_heading: "2. Hosting",
    privacy_hosting_body: "This website is hosted via GitHub Pages, a service provided by GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA (a subsidiary of Microsoft Corporation). When you access this website, GitHub automatically collects so-called server log files transmitted by your browser. These typically include: IP address, date and time of the request, the file requested, the amount of data transferred, the status of the request, browser type and version, operating system, and the referring page (referrer URL). This data is processed by GitHub and is not made available to us in personally identifiable form. The legal basis is Art. 6(1)(f) GDPR (legitimate interest in the technically error-free and secure provision of this website). Further information on GitHub's processing is available in GitHub's Privacy Statement: https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement.",
    privacy_storage_heading: "3. Local storage (no cookies)",
    privacy_storage_body: "PaperGames does not use cookies. To function, the site relies solely on the browser's built-in localStorage and sessionStorage. These are used to store, locally on your device: in-progress games, personal settings (e.g. language, board style), your best scores, and — if you sign in for the online chess feature — your Lichess access token. This data never leaves your device and is never transmitted to us or to any third party; it exists solely to provide the functionality you explicitly requested (resuming a game, keeping your settings, staying signed in). This storage is therefore strictly necessary, pursuant to Section 25(2) No. 2 TDDDG (Germany's Telecommunications-Digital-Services-Data-Protection Act), to provide a telemedia service you have explicitly requested. Consent is therefore not required, which is why this site does not show a cookie consent banner. You can delete this data at any time via your browser's settings.",
    privacy_lichess_heading: "4. Lichess (optional)",
    privacy_lichess_body: "The online chess feature is optional and only activates if you explicitly choose to sign in via “Sign in with Lichess”. Doing so opens an OAuth2 connection from your browser to lichess.org; you sign in directly with Lichess, and PaperGames never receives or stores your password. The access token issued by Lichess is stored only locally in your browser (localStorage) and is used solely to exchange moves and games with Lichess's servers on your behalf. Lichess's own privacy policy exclusively governs its processing of your data: https://lichess.org/privacy. PaperGames is an independent project and is neither affiliated with, nor endorsed or authorized by, Lichess.",
    privacy_paypal_heading: "5. PayPal donation link",
    privacy_paypal_body: "The About page offers an optional donation link to PayPal. Simply visiting that page does not transmit any data to PayPal. Only if you actively click the link or QR code and open paypal.com does PayPal (PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg) process your data under its own responsibility and in accordance with PayPal's privacy policy: https://www.paypal.com/webapps/mpp/ua/privacy-full. The QR code itself is generated locally by this website and does not load any content from a third-party server.",
    privacy_no_tracking_heading: "6. No analytics, no advertising, no data sharing",
    privacy_no_tracking_body: "This website uses no analytics or tracking tools, no advertising network, and no web fonts or other third-party embeds that would trigger data transfers to third parties — aside from the technically necessary GitHub Pages hosting and the connections to Lichess or PayPal described above, each of which you explicitly trigger yourself. Your data is not shared with third parties for advertising or analytics purposes.",
    privacy_rights_heading: "7. Your rights",
    privacy_rights_body: "To the extent personal data is processed, you have the following rights under applicable law: access (Art. 15 GDPR), rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR), and objection to processing (Art. 21 GDPR). Please contact us at the email address above to exercise these rights.",
    privacy_complaint_heading: "8. Right to lodge a complaint",
    privacy_complaint_body: "You have the right to lodge a complaint with a data protection supervisory authority regarding our processing of your personal data. The competent authority is: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf, Germany, poststelle@ldi.nrw.de, https://www.ldi.nrw.de.",
    about_lichess_disclaimer: "PaperGames's online chess feature runs on lichess.org's public API. PaperGames is an independent project and is not affiliated with, endorsed by, or reviewed by Lichess.",
    about_trademarks: "The history pages mention names of commercial games to place the origin of a game principle in context. Some of these names are registered trademarks of their respective owners. PaperGames is not affiliated with these owners and is not endorsed, sponsored or reviewed by them. All games here are independent implementations; no material from commercial editions is used.",
    nikoli_trademark_heading: "A Note on the Names",
    nikoli_trademark_notice: "The names 数独 (Sudoku), カックロ (Kakuro) and スリザーリンク (Slitherlink) are registered trademarks of the publisher Nikoli in Japan, and 橋をかけろ (Hashiwokakero) is the name under which Nikoli publishes that puzzle. PaperGames is not affiliated with Nikoli, is not endorsed or reviewed by Nikoli, and therefore uses other names in its Japanese version. The puzzle types themselves are free; every puzzle here is generated fresh on the device.",
    about_back: "← Back to the board",

    stats_title: "Your Stats",
    stats_intro: "Results against the built-in computer, kept on this device only.",
    stats_col_game: "Game",
    stats_col_wins: "Wins",
    stats_col_losses: "Losses",
    stats_col_draws: "Draws",
    stats_col_streak: "Best streak",
    achv_section_title: "Achievements",
    achv_intro: "Badges you've unlocked from your own local stats, above.",
    achv_first_win_name: "First Win",
    achv_first_win_desc: "Win a game against the computer.",
    achv_ten_wins_name: "Ten Wins",
    achv_ten_wins_desc: "Win 10 games in total.",
    achv_fifty_wins_name: "Fifty Wins",
    achv_fifty_wins_desc: "Win 50 games in total.",
    achv_hundred_wins_name: "Hundred Wins",
    achv_hundred_wins_desc: "Win 100 games in total.",
    achv_streak_3_name: "3-Win Streak",
    achv_streak_3_desc: "Win streak of 3 in one game.",
    achv_streak_5_name: "5-Win Streak",
    achv_streak_5_desc: "Win streak of 5 in one game.",
    achv_streak_10_name: "10-Win Streak",
    achv_streak_10_desc: "Win streak of 10 in one game.",
    achv_five_games_name: "Five Games Won",
    achv_five_games_desc: "Win at least once in 5 different games.",
    achv_fifteen_games_name: "Fifteen Games Won",
    achv_fifteen_games_desc: "Win at least once in 15 different games.",
    achv_all_games_name: "Every Game Won",
    achv_all_games_desc: "Win at least once in every tracked game.",
    daily_challenge_button: "Daily Challenge",
    print_puzzle_button: "Print",
    adaptive_difficulty_toggle: "Suggest difficulty",
    adaptive_difficulty_note: "Difficulty adjusted based on your recent results.",
    update_banner_text: "A new version of PaperGames is available.",
    update_banner_whats_new: "New: PaperGames is now available in Arabic, the new game Categories acts as your game master for the pen-and-paper word game, and Xiangqi now enforces the perpetual check and chase rules.",
    update_banner_reload: "Reload now",
    update_banner_dismiss: "Dismiss",
    error_banner_text: "Something went wrong. Reloading may fix it.",
    storage_warning_text: "Your progress could not be saved. Storage may be full or unavailable (e.g. private browsing).",
    resign_confirm_dialog: "Resign this game?",
    new_game_confirm_dialog: "Start a new game? Your current game will be lost, but it won't count as a loss in your stats.",
    stats_empty: "No games played against the computer yet.",
    stats_reset_button: "Reset stats",
    stats_reset_confirm: "Reset all stats? This cannot be undone.",

    home_coming_soon_title: "Coming soon",
    home_coming_soon_intro: "More games under consideration for a future update:",
    home_coming_soon_multiplayer_title: "Two-player strategy games",
    home_coming_soon_solo_title: "Single-player puzzles",
    game_four_in_a_row: "Four in a Row",
    home_four_in_a_row_desc: "Drop discs to connect four in a row before your opponent does. Local 2-player or vs. the built-in engine.",
    game_gomoku: "Gomoku (Five in a Row)",
    home_gomoku_desc: "Get five stones in a row first, on a Go-sized board. Local 2-player or vs. the built-in engine.",
    game_tictactoe: "Tic-Tac-Toe",
    home_tictactoe_desc: "Three in a row on a 3x3 grid - the classic pencil-and-paper game. Local 2-player or vs. the built-in engine, which never loses on Hard.",
    tictactoe_board_label: "Tic-Tac-Toe board",
    game_alquerque: "Alquerque",
    home_alquerque_desc: "The medieval ancestor of checkers: 12 pieces each on a 5x5 board of lines, jump to capture, and capturing is compulsory. Local 2-player or vs. the built-in engine.",
    alquerque_board_label: "Alquerque board",
    msg_keep_jumping: "Keep jumping with this piece.",
    alquerque_history_intro: "A small jumping game on a board of lines, written down in 13th-century Spain - and the ancestor of checkers.",
    game_pairs: "Pairs",
    home_pairs_desc: "Turn over two cards and find the pairs: the classic card-matching game with simple black-and-white shapes. Solo against the move count, two players on one device, or vs. the built-in engine.",
    game_futoshiki: "Futoshiki",
    home_futoshiki_desc: "Fill the grid so every row and column holds each number once - and every sign between two cells points to the smaller number. 4x4 to 6x6, freshly generated with a unique solution.",
    futoshiki_board_label: "Futoshiki board",
    futoshiki_size_label: "Grid size",
    futoshiki_history_intro: "A Japanese number puzzle whose name simply means inequality: a Latin square with small signs between the cells.",
    game_foxandgeese: "Fox and Geese",
    home_foxandgeese_desc: "The medieval hunt game on the 33-point cross: one fox against 13 geese. Play either side, local 2-player or vs. the built-in engine.",
    foxandgeese_board_label: "Fox and Geese board",
    foxandgeese_history_intro: "A hunt game from medieval Europe: one fox, a flock of geese and a cross-shaped board.",
    game_seega: "Seega",
    home_seega_desc: "An Egyptian game of placing and trapping on a 5x5 board: first both sides place their 12 stones, then capture by enclosing. Local 2-player or vs. the built-in engine.",
    seega_board_label: "Seega board",
    seega_history_intro: "A game from Egypt, described in 1836: place your stones two at a time, then trap the enemy between two of your own.",
    game_romme: "Rummy (Rommé)",
    home_romme_desc: "The German rummy with two packs and six jokers: lay out sets and runs, add to any meld on the table, and get rid of all your cards. 2 to 4 players, vs. the computer or on one device.",
    romme_history_intro: "The rummy that Germany plays with two packs and jokers - one of the many games in which players collect sets and runs.",
    romme_meld_button: "Lay out",
    romme_confirm_button: "Lay out first meld",
    romme_cancel_button: "Take back",
    romme_discard_button: "Discard",
    romme_next_round: "Next round",
    romme_label_table: "Table",
    romme_round_end_title: "End of the round",
    romme_opponents_label: "Computer opponents:",
    romme_seats_label: "Players:",
    romme_threshold_label: "First meld at least:",
    romme_points_30: "30 points",
    romme_points_40: "40 points",
    romme_points_51: "51 points",
    msg_t_rm_draw: "{p}: draw a card from the stock or take the top discard.",
    msg_rm_joker_first: "Lay out the joker you took back in a new meld first.",
    msg_t_rm_staged: "Staged for the first meld: {n} of {m} points.",
    msg_t_rm_dealer: "{p}: start the round by discarding a card (you may lay out melds first).",
    msg_t_rm_first: "{p}: your first meld needs at least {n} points - lay out melds or discard a card.",
    msg_t_rm_play: "{p}: lay out melds or add to melds, then discard a card.",
    msg_rm_reshuffle: "The discard pile is shuffled into a new stock.",
    msg_t_rm_lays: "{p} lays out a meld.",
    msg_t_rm_opens: "{p} makes the first meld with {n} points.",
    msg_t_rm_swaps: "{p} swaps the {s} for a joker.",
    msg_rm_no_winner: "Nothing is left to draw - the round ends without a winner.",
    msg_t_rm_out: "{p} has no cards left and wins the round.",
    msg_rm_err_meld: "These cards don't form a set (one rank, different suits) or a run (one suit in order).",
    msg_rm_err_open: "You may add to melds only after your first meld.",
    msg_rm_err_joker_unusable: "You can only swap that joker if you can lay it out again in a new meld right away.",
    msg_rm_err_staged: "Lay out the staged melds or take them back before discarding.",
    msg_rm_err_draw_first: "Draw a card first.",
    msg_rm_err_drawn: "You have already drawn a card this turn.",
    msg_rm_err_no_discard: "The discard pile is empty.",
    msg_t_rm_err_threshold: "Not enough yet: the first meld needs at least {n} points.",
    msg_rm_sel_meld: "Select three or more cards for a meld.",
    msg_rm_sel_one: "Select exactly one card.",
    msg_t_rm_status_open: "First meld made · Penalty points: {n}",
    msg_t_rm_status_closed: "No first meld yet · Penalty points: {n}",
    msg_t_rm_round: "Round {n} · first meld: at least {m} points",
    msg_rm_table_empty: "No melds on the table yet.",
    msg_t_rm_your_cards: "{p}: your cards",
    msg_t_rm_round_score: "{p}: {n} penalty points this round, {m} in total",
    msg_rm_joker: "Joker",
    msg_t_rm_hotseat: "Game on one device for {n} players (no computer).",
    msg_t_rm_joker_as: "joker as {s}",
    romme_rounds_label: "Rounds:",
    romme_take_rule_label: "House rule: take cards from melds",
    msg_rm_taken_first: "Lay out the card you took in a new meld first, or take it back.",
    msg_t_rm_takes: "{p} takes the {s} from a meld.",
    msg_rm_err_take_breaks: "At least three cards must stay in the meld - from a run only the first or the last card.",
    msg_rm_err_take_joker: "Jokers can't be taken - swap them instead.",
    romme_split_rule_label: "House rule: split runs",
    romme_choice_extend: "Add to the meld",
    romme_choice_split: "Split the run",
    msg_t_rm_splits: "{p} splits a run with the {s}.",
    msg_t_rm_you_split: "You split a run with the {s}.",
    msg_rm_split_set: "Sets can't be split.",
    msg_rm_split_short: "Both runs must have at least three cards after the split.",
    msg_rm_split_joker: "A joker stands for that card - the run can't be split there.",
    msg_rm_split_choice: "This card fits both ways: add it to the meld or split the run?",
    msg_rm_err_taken_new: "A card taken from the table must go into a new meld.",
    msg_t_rm_round_of: "Round {n} of {m} · first meld: at least {k} points",
    msg_t_rm_game_win: "Game over after {n} rounds: {p} wins with {m} penalty points.",
    msg_t_rm_game_draw: "Game over after {n} rounds: a draw at {m} penalty points.",
    msg_t_rm_round_title: "Round {n} of {m}",
    msg_rm_no_melds_yet: "No melds yet.",
    msg_t_rm_take_aria: "Take {s}",
    romme_discard_rule_label: "Variant: take the discard only to lay it out",
    romme_return_button: "Put back and draw from the stock",
    romme_sort_by_rank: "Sort by rank",
    romme_sort_by_suit: "Sort by suit",
    msg_rm_discard_card_first: "Lay out the card from the discard pile in a meld first - or put it back and draw from the stock.",
    msg_t_rm_returns: "{p} puts the {s} back and draws from the stock.",
    msg_rm_you_draws: "You draw a card.",
    msg_t_rm_you_take_discard: "You take the {s}.",
    msg_rm_you_lay: "You lay out a meld.",
    msg_t_rm_you_open: "You make the first meld with {n} points.",
    msg_t_rm_you_extend: "You add the {s} to a meld.",
    msg_t_rm_you_swap: "You swap the {s} for a joker.",
    msg_t_rm_you_take: "You take the {s} from a meld.",
    msg_t_rm_you_return: "You put the {s} back and draw from the stock.",
    msg_t_rm_you_discard: "You discard the {s}.",
    msg_rm_you_out: "You have no cards left and win the round.",
    msg_t_rm_you_game_win: "Game over after {n} rounds: you win with {m} penalty points.",
    msg_t_rm_vs_status: "Computer opponents: {n} · computer level: {p}",
    msg_you_turn: "Your turn.",
    msg_you_passed: "You passed.",
    msg_you_win_dot: "You win.",
    msg_t_sw_you_swapped: "You swapped {s} for {r}.",
    msg_sw_you_swapped_all: "You swapped all three cards.",
    msg_sw_you_knocked: "You knocked.",
    msg_sw_you_31: "You have 31!",
    msg_sw_you_life: "You lose a life.",
    msg_sw_you_swims: "You are swimming.",
    msg_sw_you_out: "You are out.",
    msg_du_you_lowest_trump: "You have the lowest trump and attack first.",
    msg_du_you_no_trump: "Nobody has a trump - you attack first.",
    msg_t_du_you_attacks: "You attack with {s}.",
    msg_t_du_you_beats: "You beat {s} with {r}.",
    msg_t_du_you_throws: "You throw in {s}.",
    msg_du_you_takes: "You take the cards.",
    msg_t_du_you_transfers: "You pass the attack on with {s}.",
    msg_du_you_picks_up_one: "You pick up 1 card.",
    msg_t_du_you_picks_up: "You pick up {n} cards.",
    msg_du_you_no_cards: "You have no cards left.",
    msg_du_you_durak: "You are left holding cards and are the durak.",
    msg_du_you_resigned: "You resigned and are the durak.",
    msg_t_cc_you_lays_out: "You lay out {s}.",
    msg_cc_you_wins: "You have eleven cards laid out and win.",
    msg_dok_you_marriage: "You have both Queens of Clubs: marriage.",
    msg_t_dok_you_plays: "You play {s}.",
    msg_dok_you_re: "You play Re.",
    msg_t_dok_you_wins_trick: "You win the trick with {n} points.",
    msg_dok_you_partner: "You become the partner of the marriage.",
    msg_dok_you_alone: "No partner within three tricks: you play alone against the other three.",
    msg_dok_you_marriage_open: "Marriage: you are looking for a partner",
    msg_dok_you_marriage_alone: "Marriage: you play alone",
    msg_tx_you_first_owner: "You hold the Seven of Hearts and own the first kingdom.",
    msg_t_tx_you_chooses: "You choose {s}.",
    msg_t_tx_you_finished: "You have no cards left and get {n} points.",
    msg_t_tx_you_takes_penalty: "You take the trick with {n} penalty points.",
    msg_tx_you_takes: "You take the trick.",
    msg_tx_you_wins_game: "You win the game.",
    msg_t_tx_you_draw: "Draw: you share first place with {p}.",
    msg_t_mm_you_played: "You played {s}.",
    msg_t_mm_you_must_draw: "You must draw {n} cards or play a Seven.",
    msg_mm_you_misses: "You miss a turn.",
    msg_t_mm_you_asks: "You ask for {r}.",
    msg_mm_you_again: "You play again.",
    msg_t_mm_you_drew: "You drew {n} cards.",
    msg_mm_you_pass: "You pass.",
    msg_mm_you_drew_one: "You drew a card.",
    msg_mm_you_keeps: "You keep the card.",
    msg_t_do_you_opens: "You open with {n}.",
    msg_do_you_drew_one: "You drew 1 tile.",
    msg_t_do_you_drew: "You drew {n} tiles.",
    msg_do_you_wins_lowest: "You win with the lowest pip total.",
    msg_do_you_last_tile: "You played your last tile.",
    msg_name_computer1: "Computer 1",
    msg_name_computer2: "Computer 2",
    msg_name_computer3: "Computer 3",
    msg_rm_you_turn_draw: "Your turn: draw a card from the stock or take the top discard.",
    msg_rm_you_turn_start: "Your turn: start the round by discarding a card (you may lay out melds first).",
    msg_t_rm_you_turn_first: "Your turn: your first meld needs at least {n} points - lay out melds or discard a card.",
    msg_rm_you_turn_play: "Your turn: lay out melds or add to melds, then discard a card.",
    msg_t_aq_dead_win: "The sides can no longer meet - {p} wins with {n} to {m} pieces.",
    msg_t_aq_dead_draw: "The sides can no longer meet - a draw with {n} pieces each.",
    msg_t_sg_place: "{p}: place a stone ({n} of {m}).",
    msg_t_sg_chain: "{p} can capture again with the same stone. Tap it to end the turn.",
    msg_t_sg_center: "{p}: move a stone onto the centre.",
    msg_t_sg_move: "{p}: move a stone.",
    msg_t_sg_pass: "{p} cannot move and passes.",
    msg_t_sg_captured: "{p} captured {n}.",
    msg_t_sg_phase_place: "Placing phase · stones to place – Black: {n} · White: {m}",
    msg_t_sg_phase_move: "Moving phase · stones – Black: {n} · White: {m} · turns without capture: {k} of 40",
    msg_t_sg_win_all: "{p} wins: every stone of the other side is captured.",
    msg_t_sg_win_quiet: "{p} wins on stones ({n} to {m}) after 40 turns without a capture.",
    msg_t_sg_win_blocked: "{p} wins on stones ({n} to {m}): neither side can move.",
    msg_t_sg_draw_quiet: "Draw: {n} stones each after 40 turns without a capture.",
    msg_t_sg_draw_blocked: "Draw: {n} stones each, neither side can move.",
    msg_sg_aria_black: "Black stone",
    msg_sg_aria_white: "White stone",
    msg_sg_aria_centre: "centre",
    msg_name_fox: "Fox",
    msg_name_geese: "Geese",
    msg_fg_jump_on: "Jump on, or tap the fox to stop here.",
    msg_fg_end_trapped: "The geese win: the fox cannot move.",
    msg_fg_end_stuck: "The fox wins: the geese cannot move.",
    msg_fg_end_few: "The fox wins: too few geese are left to trap it.",
    msg_fg_resign_fox: "The fox wins by resignation.",
    msg_fg_resign_geese: "The geese win by resignation.",
    msg_fg_title_fox: "The fox wins",
    msg_fg_title_geese: "The geese win",
    msg_t_fg_score: "Geese left: {n} of {m} · the fox wins at {k}.",
    msg_fg_aria_fox: "fox",
    msg_fg_aria_goose: "goose",
    msg_t_fs_hint_sign1: "A sign next to the marked cell (row {n}, column {m}) leaves only one number for it.",
    msg_t_fs_hint_sign2: "The sign between this cell and its neighbour, together with the numbers still possible there, allows only the {n} here.",
    pairs_board_label: "Pairs board",
    pairs_size_label: "Board size",
    pairs_size_4x3: "4 x 3 – 6 pairs",
    pairs_size_4x4: "4 x 4 – 8 pairs",
    pairs_size_6x4: "6 x 4 – 12 pairs",
    pairs_size_6x6: "6 x 6 – 18 pairs",
    pairs_opponent_label: "Opponent",
    pairs_opponent_solo: "Solo (count your moves)",
    pairs_history_intro: "A game that needs no rule book at all: turn over two cards and remember where everything was.",
    msg_pairs_no_pair: "No pair. Tap anywhere to turn both cards back.",
    msg_pairs_turn_card: "Turn over a card.",
    msg_pairs_turn_second: "Turn over a second card.",
    msg_t_pairs_turn_card: "{p}: turn over a card.",
    msg_t_pairs_turn_second: "{p}: turn over a second card.",
    msg_t_pairs_found: "{p} found a pair and goes again.",
    msg_pairs_solo_found: "Pair found! Turn over a card.",
    msg_pairs_hard_hint: "On Hard the computer remembers every card it has seen.",
    msg_t_pairs_solo_done: "All pairs found in {n} moves.",
    msg_t_pairs_draw: "Draw - {n} pairs each.",
    msg_t_pairs_win: "{p} wins with {n} pairs to {m}.",
    msg_t_pairs_score_solo: "Pairs found: {n}",
    msg_t_pairs_score: "Pairs – Player 1: {n} · Player 2: {m}",
    msg_pairs_face_down: "face down",
    msg_pairs_pair_found: "pair found",
    msg_t_pairs_symbol: "symbol {n}",
    game_senet: "Senet",
    home_senet_desc: "One of the oldest known board games, from ancient Egypt. Local 2-player or vs. the built-in engine.",
    game_shogi: "Shogi",
    home_shogi_desc: "Japanese chess, where captured pieces switch sides and rejoin the battle. Local 2-player or vs. the built-in engine.",
    game_card_tactics: "Card Tactics",
    home_card_tactics_desc: "A fast, elegant duel decided by five shifting move cards. Local 2-player or vs. the built-in engine.",
    cardtactics_neutral_card: "Next card:",


    cardtactics_history_intro: "A modern addition to the family of abstract strategy games, built around a small twist on chess-like movement: instead of every piece having a fixed way of moving, a shared deck of cards decides what's possible from turn to turn.",

    game_hnefatafl: "Hnefatafl (Viking Chess)",
    home_hnefatafl_desc: "An asymmetric Norse game: the king must escape, the attackers must trap him. Local 2-player or vs. the built-in engine.",

    hnefatafl_history_intro: "One of the oldest board game families in Northern Europe, played across the Viking world for centuries before chess ever arrived there.",
    game_tablut: "Tablut",
    home_tablut_desc: "The largest and best-documented Tafl game: a 9x9 board where the king must reach a corner and the attackers must trap him first.",
    tablut_history_intro: "The best-documented member of the entire Tafl family, thanks to one 18th-century naturalist's notebook.",


    game_wall_maze: "Wall Maze",
    home_wall_maze_desc: "Race to the far side of the board while building walls to block your opponent. Local 2-player or vs. the built-in engine.",

    wallmaze_history_intro: "Wall Maze is a modern abstract strategy game that turns a simple race across a grid into a genuine battle of tactics, just by adding a handful of walls.",
    wallmaze_wall_mode_start: "Place a wall",
    wallmaze_wall_mode_cancel: "✕ Cancel",
    wallmaze_wall_orientation_h: "Horizontal",
    wallmaze_wall_orientation_v: "Vertical",
    wallmaze_wall_confirm: "✓ Place",

    game_hex: "Hex",
    home_hex_desc: "Connect your two sides of a hexagonal board before your opponent connects theirs. Local 2-player or vs. the built-in engine.",
    hex_legend_r: "Red: top bottom",
    hex_legend_b: "Blue: left right",


    hex_history_intro: "A rare case of the same simple, elegant game being invented twice, independently, by two people who'd go on to become well known for entirely different reasons.",

    game_halma: "Halma",
    home_halma_desc: "Race all your pieces across the board into your opponent's starting camp. Local 2-player or vs. the built-in engine.",

    halma_history_intro: "An American reworking of an older German game, popular for well over a century as a simple race that's easy to learn but still rewards careful planning.",
    game_sternhalma: "Chinese Checkers",
    home_sternhalma_desc: "Race all ten of your marbles across the star-shaped board into the point opposite yours. Local 2-player or vs. the built-in engine.",
    sternhalma_history_intro: "A star-board descendant of the older game Halma, marketed under an exotic name that has nothing to do with where it was actually invented.",

    game_dotsandboxes: "Dots and Boxes",
    home_dotsandboxes_desc: "Draw lines between dots to complete boxes and claim them - whoever completes a box goes again. Play on 4 × 4, 5 × 5, 6 × 6 or 8 × 8 boxes, local 2-player or vs. the built-in engine.",
    dotsandboxes_new_game: "New game",
    dotsandboxes_board_size_label: "Board size",
    dotsandboxes_board_size_4: "4 × 4 boxes (short game)",
    dotsandboxes_board_size_5: "5 × 5 boxes",
    dotsandboxes_board_size_6: "6 × 6 boxes (long game)",
    dotsandboxes_board_size_8: "8 × 8 boxes (very long game)",
    dotsandboxes_legend_p1: "Player 1: solid lines, boxes marked with a cross",
    dotsandboxes_legend_p2: "Player 2: dotted lines, boxes marked with a circle",

    dotsandboxes_history_intro: "A pencil-and-paper game more than a century old, and a genuine subject of serious mathematical study.",
    game_fanorona: "Fanorona",
    home_fanorona_desc: "Madagascar's national board game: slide pieces along a 5x9 grid of lines to capture by approach or withdrawal. Local 2-player or vs. the built-in engine.",
    game_konane: "Konane",
    home_konane_desc: "Hawaiian checkers: a full board of alternating stones and orthogonal jump chains, opening with a unique two-stone removal ritual. Local 2-player or vs. the built-in engine.",

    fanorona_history_intro: "The national board game of Madagascar, and a source of real cultural pride and legend.",

    fanorona_choose_capture_type: "Both a forward and a backward capture are available - choose one:",
    fanorona_capture_approach_btn: "Capture forward (approach)",
    fanorona_capture_withdrawal_btn: "Capture backward (withdrawal)",
    fanorona_continue_capturing: "You can continue capturing with this piece, or stop here.",
    fanorona_done_capturing_btn: "Done capturing",
    game_ludo: "Ludo",
    home_ludo_desc: "The classic cross-shaped race game descended from ancient Pachisi. Play one color yourself against up to three built-in computer opponents (2-4 players total), or pass the device around in local hotseat.",
    ludo_mode_hotseat: "Local hotseat",
    ludo_num_players: "Players:",
    ludo_roll_die: "Roll",
    ludo_history_intro: "A modern, mass-produced descendant of one of India's oldest board games.",

    konane_history_intro: "A traditional Native Hawaiian game of stones and strategy, carved directly into the land it was played on.",
    konane_continue_jumping: "You can continue jumping with this stone, or stop here.",
    konane_done_jumping_btn: "Done jumping",
    game_surakarta: "Surakarta",
    home_surakarta_desc: "The Indonesian looping-track capture game: quiet steps never capture, only a slide that rides one of the board's 4 corner loop tracks does. Local 2-player or vs. the built-in engine.",
    surakarta_history_intro: "A traditional Indonesian board game named after the very city on Java where it is believed to have originated.",

    game_marblepush: "Marble Push",
    home_marblepush_desc: "Push 6 of your opponent's marbles off the hexagonal board to win. Local 2-player or vs. the built-in engine, with full rules for pushing and for sideways line moves.",
    marblepush_history_intro: "A pushing game for two on a hexagonal board, in which the only way to capture is to shove the opponent's marbles over the edge.",
    marblepush_selection_hint: "Tap a highlighted cell to move this selection, or clear it below.",
    marblepush_clear_selection_btn: "Clear selection",

    game_baghchal: "Bagh-Chal",
    home_baghchal_desc: "Nepal's traditional hunt game: 4 tigers vs. 20 goats on an alquerque-style 5x5 board of lines. Local 2-player or vs. the built-in engine, playing either side.",

    baghchal_history_intro: "Nepal's most iconic traditional board game: tigers hunting goats across a lattice of lines, with roots far older than any written record of the rules.",


    game_amazons: "Amazons",
    home_amazons_desc: "Move a queen-like amazon, then shoot a permanent arrow from its new square to slowly wall off the board. Local 2-player or vs. the built-in engine.",
    amazons_history_intro: "The Game of the Amazons is a modern abstract strategy game about carving up territory by permanently blocking off the board, one square at a time.",

    game_sudoku: "Sudoku",
    home_sudoku_desc: "Fill a 9x9 grid with digits so every row, column and 3x3 box contains 1-9 exactly once. Freshly generated with a unique solution, in three difficulty levels.",
    game_peg_solitaire: "Peg Solitaire",
    home_peg_solitaire_desc: "Jump pegs over each other until only one remains - on the English cross or one of several other boards, from a 6x6 square to Wiegleb's 45-hole cross.",
    game_minesweeper: "Minesweeper",
    home_minesweeper_desc: "Uncover every safe square using the number clues, without triggering a hidden mine.",
    game_nonograms: "Nonograms",
    home_nonograms_desc: "Use row and column number clues to reveal a hidden picture, one cell at a time. A fresh, uniquely-solvable puzzle in three sizes.",
    game_2048: "2048",
    home_2048_desc: "Slide and merge numbered tiles to reach 2048 before the board fills up. Keep playing afterward to push your best score even higher.",
    game_mahjong_solitaire: "Mahjong Solitaire",
    home_mahjong_solitaire_desc: "Clear the layered tile layout by matching identical pairs. Every deal is generated to always have a solution.",
    game_freecell: "FreeCell",
    home_freecell_desc: "The classic card solitaire where nearly every deal can be won with the right moves. Full supermoves and a one-click collect to the foundations.",

    freecell_new_game: "New game",
    freecell_collect: "Collect to foundations",


    freecell_history_intro: "A century-old card game family whose most famous variant, unusually, is famous largely because of a very specific piece of 1990s software.",

    game_yatzy: "Yatzy",
    home_yatzy_desc: "The classic 5-dice scoring game. Roll up to three times a turn, hold the dice you want to keep, and fill in all 15 categories on the scoresheet for the highest total.",

    yatzy_new_game: "New game",
    yatzy_roll: "Roll",
    yatzy_rolls_left: "Rolls left",
    yatzy_round_label: "Round",
    yatzy_total_label: "Total",
    yatzy_col_category: "Category",
    yatzy_col_score: "Score",
    yatzy_upper_sum: "Sum",
    yatzy_upper_bonus: "Bonus (63+)",
    yatzy_grand_total: "Total",
    yatzy_final_score: "Final score",
    yatzy_game_over_title: "Game over",
    yatzy_die_label: "Die",
    yatzy_held: "held",
    yatzy_not_rolled: "not rolled yet",
    yatzy_hold_hint: "Tap a die to hold it before rolling again.",
    yatzy_roll_hint: "Roll the dice to begin your turn.",
    yatzy_pick_hint: "Tap a score in the table to lock it in.",

    yatzy_cat_ones: "Ones",
    yatzy_cat_twos: "Twos",
    yatzy_cat_threes: "Threes",
    yatzy_cat_fours: "Fours",
    yatzy_cat_fives: "Fives",
    yatzy_cat_sixes: "Sixes",
    yatzy_cat_one_pair: "One Pair",
    yatzy_cat_two_pairs: "Two Pairs",
    yatzy_cat_three_of_kind: "Three of a Kind",
    yatzy_cat_four_of_kind: "Four of a Kind",
    yatzy_cat_small_straight: "Small Straight (1-2-3-4-5)",
    yatzy_cat_large_straight: "Large Straight (2-3-4-5-6)",
    yatzy_straight_note: "In Yatzy the Small Straight is exactly 1-2-3-4-5 and the Large Straight exactly 2-3-4-5-6. No other runs count.",
    yatzy_cat_full_house: "Full House",
    yatzy_cat_chance: "Chance",
    yatzy_cat_yatzy: "Yatzy",


    yatzy_history_intro: "A dice game whose scoring categories - pairs, three and four of a kind, a full house, a straight - read like a hand of poker, because that's exactly where they came from.",

    game_lightswitch: "Light Switch",
    home_lightswitch_desc: "Press a cell to toggle it and its neighbors on and off. Turn off every light to win - every puzzle is generated to always have a solution.",
    lightswitch_new_game: "New game",
    lightswitch_level_easy: "Easy (5 presses)",
    lightswitch_level_medium: "Medium (10 presses)",
    lightswitch_level_hard: "Hard (20 presses)",
    lightswitch_history_intro: "A 1990s handheld electronic puzzle that turned out to hide a genuinely elegant piece of mathematics underneath its simple button grid.",

    game_bullsandcows: "Bulls and Cows",
    home_bullsandcows_desc: "Crack a hidden 4-shape code within a limited number of guesses, using black and white peg feedback. Repeats may be allowed, depending on the difficulty.",

    bullsandcows_new_game: "New game",
    bullsandcows_submit_guess: "Submit guess",
    bullsandcows_legend_black: "Right shape, right position",
    bullsandcows_legend_white: "Right shape, wrong position",
    bullsandcows_slot_aria: "Slot",
    bullsandcows_slot_hint: "Tap to cycle through the shapes.",
    bullsandcows_hint_start: "Set the four shapes above, then submit your guess.",
    bullsandcows_hint_continue: "Adjust the shapes and submit your next guess.",
    bullsandcows_guess_number_label: "Guess",
    bullsandcows_black_pegs_label: "Black",
    bullsandcows_white_pegs_label: "White",
    bullsandcows_guesses_used_label: "Guesses used",
    bullsandcows_guesses_left_label: "Left",

    bullsandcows_win_title: "You win!",
    bullsandcows_lose_title: "You lose",
    bullsandcows_win_message: "Guesses used",
    bullsandcows_lose_message: "The secret code was",

    bullsandcows_symbol_circle: "Circle",
    bullsandcows_symbol_square: "Square",
    bullsandcows_symbol_triangle: "Triangle",
    bullsandcows_symbol_diamond: "Diamond",
    bullsandcows_symbol_star: "Star",
    bullsandcows_symbol_cross: "Cross",


    bullsandcows_history_intro: "A code-breaking game of pure logic, with no rival player to outwit, that began as a pencil-and-paper guessing game and went on to become a favorite subject for computer scientists studying how to search for a hidden answer efficiently.",
    game_kakuro: "Kakuro",
    home_kakuro_desc: "Fill white cells with digits 1-9 so every run sums to its clue, with no digit repeated within a run. Freshly generated, in three difficulty levels.",

    kakuro_new_game: "New puzzle",
    kakuro_erase: "Erase",
    kakuro_level_easy: "Easy (7x7)",
    kakuro_level_medium: "Medium (9x9)",
    kakuro_level_hard: "Hard (11x11)",
    kakuro_generating: "Generating puzzle…",
    kakuro_hint: "Select a cell, then pick a number.",
    kakuro_undone: "Move undone.",
    kakuro_win_title: "Solved!",
    kakuro_win_message: "Puzzle solved! Well done.",
    game_schwimmen: "Thirty-One",
    home_schwimmen_desc: "The card game also called Schwimmen or Schnauz: collect 31 in one suit with three cards, swap with the middle and knock at the right moment. 2-6 players or vs. the computer.",
    schwimmen_middle_label: "Middle",
    schwimmen_hand_label: "Your cards",
    schwimmen_swap_all: "Swap all",
    schwimmen_pass: "Pass",
    schwimmen_knock: "Knock",
    schwimmen_next_round: "Next round",
    game_durak: "Durak",
    home_durak_desc: "The Russian card game with 36 cards: attack, beat with higher cards or trumps, throw in more of the same ranks - and don't be the last one holding cards. 2-4 players or vs. the computer.",
    durak_transfer_option: "Allow passing the attack on",
    durak_take: "Take the cards",
    durak_pass: "Pass",
    durak_transfer: "Pass the attack on",
    game_concan: "Concan",
    home_concan_desc: "The old Mexican card game at the root of the rummy family: 40 cards, sets and runs, and a discard you must take if you can use it. First to lay out eleven cards wins. 2 players or vs. the computer.",
    concan_meld_button: "Lay out",
    concan_discard_button: "Discard",
    msg_name_player5: "Player 5",
    msg_name_player6: "Player 6",
    msg_t_sw_swapped: "{p} swapped {s} for {r}.",
    msg_t_sw_swapped_all: "{p} swapped all three cards.",
    msg_t_sw_knocked: "{p} knocked.",
    msg_sw_refreshed: "Everyone passed: three new cards in the middle.",
    msg_t_sw_has_31: "{p} has 31!",
    msg_sw_showdown: "Showdown.",
    msg_sw_stock_out: "The stock is used up - showdown.",
    msg_t_sw_loses_life: "{p} loses a life.",
    msg_t_sw_swims: "{p} is swimming.",
    msg_t_sw_out: "{p} is out.",
    msg_sw_nobody_left: "Nobody is left - the game is a draw.",
    msg_sw_new_round: "New round.",
    msg_sw_prompt: "Tap one of your cards and a middle card to swap them - or swap all, pass or knock.",
    msg_t_sw_last_turn: "{p} knocked - this is your last turn.",
    msg_sw_pick_middle: "Now tap the middle card you want instead.",
    msg_sw_pick_own: "Now tap the card of yours to give away for it.",
    msg_sw_already_knocked: "Someone has already knocked - you can't knock again.",
    msg_sw_out_label: "out",
    msg_sw_swimming_label: "swimming",
    msg_sw_knocked_label: "knocked",
    msg_sw_one_life: "1 life",
    msg_t_sw_lives: "{n} lives",
    msg_t_sw_points: "{n} points",
    msg_t_sw_player_points: "{p}: {n} points",
    msg_t_sw_your_points: "Your points: {n}",
    msg_t_sw_middle_card: "Middle card {s}",
    msg_t_sw_your_card: "Your card {s}",
    msg_t_dk_trump_is: "Trump is {r}.",
    msg_t_dk_lowest_trump: "{p} has the lowest trump and attacks first.",
    msg_dk_no_trump: "Nobody has a trump - Player 1 attacks first.",
    msg_dk_choose_attack: "Choose a card to attack with.",
    msg_t_dk_beat_or_take: "Beat the {s} or take the cards.",
    msg_t_dk_taking_throw: "{p} is taking the cards: throw in more of the same ranks, or pass.",
    msg_dk_throw_or_pass: "Throw in a card of a rank on the table, or pass.",
    msg_t_dk_attacks: "{p} attacks with {s}.",
    msg_t_dk_beats: "{p} beats {s} with {r}.",
    msg_t_dk_throws: "{p} throws in {s}.",
    msg_t_dk_takes: "{p} takes the cards.",
    msg_t_dk_transfers: "{p} passes the attack on with {s}.",
    msg_dk_all_beaten: "Everything is beaten - the cards leave the game.",
    msg_t_dk_picks_up: "{p} picks up {n} cards.",
    msg_t_dk_picks_up_one: "{p} picks up 1 card.",
    msg_t_dk_no_cards: "{p} has no cards left.",
    msg_dk_draw: "Everybody ran out of cards together - the game is a draw.",
    msg_t_dk_durak: "{p} is left holding cards and is the durak.",
    msg_t_dk_durak_title: "{p} is the durak",
    msg_t_dk_resigned: "{p} resigned and is the durak.",
    msg_dk_tap_transfer: "Tap a card of the same rank to pass the attack on.",
    msg_dk_only_defender: "Only the defender can take the cards.",
    msg_dk_must_attack: "You have to attack with a card.",
    msg_dk_beat_or_take_short: "Beat the card or take the cards.",
    msg_dk_transfer_needs: "To pass the attack on you need a card of the same rank, and the next player needs enough cards.",
    msg_t_dk_cant_beat: "The {s} can't beat the {r}: use a higher card of the same suit or a trump.",
    msg_dk_rank_only: "Only ranks that are already on the table can be thrown in.",
    msg_dk_limit: "No more cards can be thrown in this round.",
    msg_t_dk_trump_label: "Trump: {r}",
    msg_t_dk_trump_card: "Trump card {s}",
    msg_t_dk_attack_count: "Attack cards: {n} / {m}",
    msg_dk_defends: "defends",
    msg_dk_attacks: "attacks",
    msg_t_dk_attack_aria: "Attack {s}",
    msg_t_dk_beaten_by: "beaten by {s}",
    msg_t_cc_must_take: "The {s} on the discard pile fits your cards - you must take it.",
    msg_cc_draw: "Draw a card from the stock.",
    msg_t_cc_lay_out_taken: "Lay out the {s} you took: select cards to meld with it, or tap one of your melds.",
    msg_cc_meld_then_discard: "Lay out melds or add to yours, then select a card and discard it.",
    msg_t_cc_takes: "{p} takes the {s}.",
    msg_t_cc_draws: "{p} draws a card.",
    msg_t_cc_lays_out: "{p} lays out {s}.",
    msg_t_cc_adds: "{p} adds the {s} to a meld.",
    msg_t_cc_discards: "{p} discards the {s}.",
    msg_cc_draw_game: "The stock is empty and nobody has eleven cards laid out - the game is a draw.",
    msg_t_cc_wins: "{p} has eleven cards laid out and wins.",
    msg_cc_reason_must_take: "The card on the discard pile fits your cards - you must take it and lay it out.",
    msg_cc_reason_cant_use: "That card doesn't fit any of your cards or melds - draw from the stock instead.",
    msg_cc_reason_not_now: "Draw or take a card first.",
    msg_cc_reason_not_meld: "These cards don't form a set (same rank) or a run (same suit in order).",
    msg_cc_reason_doesnt_fit: "That card doesn't fit this meld.",
    msg_cc_reason_keep_one: "Keep one card to discard - you can only lay out your last card when it makes eleven.",
    msg_cc_reason_taken_first: "Lay out the card you took first.",
    msg_cc_not_possible: "That isn't possible right now.",
    msg_cc_already_drew: "You have already drawn or taken a card this turn.",
    msg_cc_select_two: "Select at least two of your cards to lay out with the card you took.",
    msg_cc_select_three: "Select at least three cards for a meld.",
    msg_cc_select_one_add: "Select exactly one card to add to a meld.",
    msg_cc_select_one_discard: "Select exactly one card to discard.",
    msg_t_cc_laid_out: "Laid out: {n} / {m}",
    msg_t_cc_player_melds: "{p}: laid out",
    msg_cc_card_to_lay_out: "Card to lay out:",
    msg_t_cc_meld_aria: "Meld {s}",
    msg_cc_discard_empty: "Discard pile empty",
    schwimmen_history_intro: "A quick pub and family game with many names, in which three cards and one suit decide everything.",
    durak_history_intro: "The best-known card game of Russia, where losing gives you a nickname until the next game.",
    concan_history_intro: "An old Mexican game often named as the forerunner of rummy and gin rummy.",
    game_doppelkopf: "Doppelkopf",
    home_doppelkopf_desc: "The German trick-taking game for four with 48 cards: the two Queens of Clubs play together, and nobody knows who they are. Normal game with marriage, you vs. three computer players or together on one device.",
    dk_humans_label: "People on this device:",
    dk_trump_order_button: "Trump order",
    dk_trump_order_note: "Highest first. Of two equal cards the one played first wins - except the Heart Ten: the second one beats the first.",
    dk_trick_label: "Trick",
    dk_trumps_label: "Trumps",
    dk_plain_label: "Plain suits",
    dk_next_deal: "Next deal",
    dk_col_player: "Player",
    dk_col_deal: "This deal",
    dk_col_total: "Total",
    msg_dk_four_players: "Four players on this device.",
    msg_t_dk_humans: "{n} players on this device, the computer plays the other seats.",
    msg_t_dk_deal: "Deal {n}.",
    msg_t_dk_marriage: "{p} has both Queens of Clubs: marriage.",
    msg_dk_lead: "Lead a card.",
    msg_dk_play: "Play a card.",
    msg_t_dk_plays: "{p} plays {s}.",
    msg_t_dk_plays_re: "{p} plays Re.",
    msg_t_dk_wins_trick: "{p} wins the trick with {n} points.",
    msg_t_dk_partner: "{p} becomes the partner of the marriage.",
    msg_t_dk_alone: "No partner within three tricks: {p} plays alone against the other three.",
    msg_t_dk_re_wins: "Re wins with {n} points.",
    msg_t_dk_kontra_wins: "Kontra wins with {n} points.",
    msg_dk_follow_trump: "Trump was led: you have to play a trump.",
    msg_dk_trumps_are: "The Queens, Jacks, Diamonds and Heart Tens are trumps.",
    msg_dk_follow_clubs: "Clubs were led: you have to play Clubs (not a Queen or Jack - those are trumps).",
    msg_dk_follow_spades: "Spades were led: you have to play Spades (not a Queen or Jack - those are trumps).",
    msg_dk_follow_hearts: "Hearts were led: you have to play Hearts (not a Queen or Jack - those are trumps).",
    msg_dk_normal_game: "Normal game",
    msg_t_dk_marriage_open: "Marriage: {p} is looking for a partner",
    msg_t_dk_marriage_alone: "Marriage: {p} plays alone",
    msg_t_dk_marriage_pair: "Marriage: {p} and {q}",
    msg_t_dk_trick_no: "Trick {n} / {m}",
    msg_dk_re: "Re",
    msg_dk_kontra: "Kontra",
    msg_dk_one_trick: "1 trick",
    msg_t_dk_tricks: "{n} tricks",
    msg_dk_wins: "wins",
    msg_t_dk_trumps_count: "Trumps: {n}",
    msg_t_dk_plain_count: "Plain suits: {n}",
    msg_t_dk_re_points: "Re: {n} points",
    msg_t_dk_kontra_points: "Kontra: {n} points",
    msg_dk_item_won: "Won",
    msg_dk_item_against: "Against the Queens of Clubs",
    msg_dk_item_no90: "Losers under 90",
    msg_dk_item_no60: "Losers under 60",
    msg_dk_item_no30: "Losers under 30",
    msg_dk_item_black: "Losers without a trick",
    msg_dk_item_doppelkopf: "Doppelkopf (trick of 40 or more)",
    msg_dk_item_fox: "Fox caught (Diamond Ace)",
    msg_dk_item_charlie: "Charlie (last trick with the Jack of Clubs)",
    msg_dk_alone_note: "Alone against three: the single player scores three times.",
    doppelkopf_history_intro: "A game played with a doubled pack, in which you often have to find out during play who your partner is.",
    game_trix: "Trix",
    home_trix_desc: "The card game of the Levant for four: four kingdoms of five contracts - avoid the King of Hearts, the Queens, the Diamonds and tricks, then race to empty your hand in Trix. You vs. three computer players or together on one device.",
    tx_contract_king: "King of Hearts",
    tx_contract_queens: "Queens",
    tx_contract_diamonds: "Diamonds",
    tx_contract_tricks: "Tricks",
    tx_contract_trix: "Trix",
    tx_rows_label: "Trix rows",
    tx_pass: "Pass",
    tx_continue: "Continue",
    tx_next_kingdom: "Next kingdom",
    tx_end_game: "End game",
    msg_tx_king: "King of Hearts",
    msg_tx_queens: "Queens",
    msg_tx_tricks: "Tricks",
    msg_tx_trix: "Trix",
    msg_t_tx_kingdom_intro: "Kingdom {n} / {m}.",
    msg_t_tx_kingdom_of: "Kingdom {n} / {m}: {p}",
    msg_t_tx_first_owner: "{p} holds the Seven of Hearts and owns the first kingdom.",
    msg_tx_choose: "Choose a contract.",
    msg_tx_lay: "Lay a card on a row.",
    msg_tx_no_fit: "No card fits: pass.",
    msg_t_tx_chooses: "{p} chooses {s}.",
    msg_t_tx_finished: "{p} has no cards left and gets {n} points.",
    msg_t_tx_takes_penalty: "{p} takes the trick with {n} penalty points.",
    msg_t_tx_takes: "{p} takes the trick.",
    msg_t_tx_contract_over: "The contract {s} is over.",
    msg_t_tx_kingdom_over: "Kingdom {n} is over.",
    msg_t_tx_wins_game: "{p} wins the game.",
    msg_t_tx_draw: "Draw: {p} share first place.",
    msg_tx_cant_pass: "A card of yours fits a row, so you can't pass.",
    msg_tx_follow_clubs: "Clubs were led: you have to follow with Clubs.",
    msg_tx_follow_spades: "Spades were led: you have to follow with Spades.",
    msg_tx_follow_hearts: "Hearts were led: you have to follow with Hearts.",
    msg_tx_follow_diamonds: "Diamonds were led: you have to follow with Diamonds.",
    msg_tx_king_must: "You can't follow suit and hold the King of Hearts: you have to play it.",
    msg_tx_jack_first: "A row starts with its Jack.",
    msg_tx_row_fit: "That card doesn't fit: a row grows one card at a time, up from the Jack to the Ace and down to the Two.",
    msg_tx_waiting_jack: "Waiting for the Jack",
    msg_t_tx_place: "Place {n}",
    msg_tx_takes: "takes",
    trix_history_intro: "A modern classic of the coffee houses and family evenings of the Middle East, in which every player gets to rule a kingdom.",
    game_cratepusher: "Crate Pusher",
    home_cratepusher_desc: "Push every crate onto a target - but crates can only be pushed, never pulled. Freshly generated levels, each one checked to be solvable, in three difficulty levels.",
    cp_new_level: "New level",
    cp_level_easy: "Easy (7x7, 3 crates)",
    cp_level_medium: "Medium (9x9, 4 crates)",
    cp_level_hard: "Hard (10x10, 5 crates)",
    cp_board_label: "Crate Pusher board",
    cp_undo: "Undo move",
    cp_restart: "Restart level",
    cp_hint: "Hint",
    cp_hint_thinking: "Thinking…",
    cp_hint_move: "Push the crate in row {row}, column {col} {dir}.",
    cp_dir_up: "up",
    cp_dir_down: "down",
    cp_dir_left: "to the left",
    cp_dir_right: "to the right",
    cp_hint_stuck: "From here the level can no longer be solved. Undo a move or restart the level.",
    cp_hint_unknown: "I couldn't work out a hint.",
    hint_button: "Hint",
    stats_with_hints: "{n} with hints",
    msg_t_hint_hidden_row: "In row {n}, one number has only one cell left. The cell is marked.",
    msg_t_hint_hidden_column: "In column {n}, one number has only one cell left. The cell is marked.",
    msg_hint_hidden_box: "In this box, one number has only one cell left. The cell is marked.",
    msg_hint_hidden_block: "In this block, one number has only one cell left. The cell is marked.",
    msg_t_hint_hidden_reason: "The {n} is still missing there, and every other free cell is ruled out for it. So the {n} goes in the marked cell.",
    msg_t_hint_naked: "Only one number fits the marked cell (row {n}, column {m}).",
    msg_t_hint_naked_sudoku: "Its row, column and box already contain every other number. Only the {n} is left.",
    msg_t_hint_naked_killer: "Its row, column, box and cage already contain every other number. Only the {n} is left.",
    msg_t_hint_naked_calcudoku: "Its row and column already contain every other number. Only the {n} is left.",
    msg_t_hint_naked_blocks: "Its block and the cells touching it already contain every other number. Only the {n} is left.",
    msg_t_hint_cage: "The cage of the marked cell (row {n}, column {m}) leaves only one number for it.",
    msg_t_hint_cage_reason: "Every way to fill the cage {s} that obeys the rules puts the {n} here.",
    msg_t_hint_deep: "The marked cell (row {n}, column {m}) can be worked out without trying anything.",
    msg_t_hint_deep_reason: "Ruling out numbers step by step, through pairs of cells and either-or chains, leaves only the {n} here. No guessing is needed.",
    msg_t_hint_entered: "Entered {n} in row {m}, column {k}.",
    msg_hint_conflict: "Some entries break a rule. The cells involved are marked.",
    msg_t_hint_wrong: "The number in row {n}, column {m} does not belong there. Remove it, then ask for a hint again.",
    msg_hint_stuck: "From here, no step follows without trying things out. The hint does not guess.",
    msg_hint_hashi_place: "The two marked islands need another bridge between them.",
    msg_t_hint_hashi_island: "The island in row {n}, column {m} needs {k} bridges. Its other connections cannot hold enough, so this one needs another bridge.",
    msg_hint_hashi_connect: "Without a bridge here, the islands could no longer all be connected.",
    msg_hint_hashi_deep: "Ruling out bridges step by step, from the numbers, the crossings and the rule that all islands connect, forces another bridge here. No guessing is needed.",
    msg_hint_hashi_entered: "Bridge added.",
    msg_hint_hashi_wrong: "The bridge between the two marked islands is not part of the solution. Remove it, then ask for a hint again.",
    cp_restart_confirm: "Restart this level from the beginning? Your moves so far will be lost.",
    cp_new_level_confirm: "Start a new level? The level you are playing will be lost.",
    msg_cp_building: "Building a level…",
    msg_cp_start: "Push every crate onto a target.",
    msg_cp_restarted: "The level starts again.",
    msg_cp_wall_behind: "That crate can't move: there is a wall behind it.",
    msg_cp_crate_behind: "That crate can't move: there is another crate behind it.",
    msg_cp_wall: "There is a wall in the way.",
    msg_cp_push_hint: "To push a crate, stand right next to it and tap it.",
    msg_cp_no_path: "There is no way there without pushing a crate.",
    msg_cp_nothing_undo: "Nothing to undo.",
    msg_t_cp_steps: "Steps: {n}",
    msg_t_cp_pushes: "Pushes: {n}",
    msg_t_cp_on_target: "On target: {n} of {m}",
    msg_t_cp_best: "Shortest solution: {n} pushes",
    msg_t_cp_solved: "Solved in {n} steps and {m} pushes.",
    msg_cp_optimal: "That is the fewest pushes possible.",
    msg_cp_stuck: "A crate is stuck in a corner that is not a target, so this level can no longer be solved.",
    msg_cp_stuck_undo: "Use \"Undo move\" to go back.",
    msg_cp_cell_wall: "Wall",
    msg_cp_cell_floor: "Floor",
    msg_cp_cell_target: "Target",
    msg_cp_cell_crate: "Crate",
    msg_cp_cell_crate_target: "Crate on target",
    msg_cp_cell_you: "You",
    msg_cp_cell_you_target: "You on a target",
    cratepusher_history_intro: "A puzzle about pushing crates in a storeroom, and why it has a different name here.",
    calcudoku_generating: "Generating puzzle…",
    calcudoku_hint: "Select a cell, then pick a number.",
    calcudoku_undone: "Move undone.",
    calcudoku_win_title: "Solved!",
    calcudoku_win_message: "Puzzle solved! Well done.",
    numberblocks_generating: "Generating puzzle…",
    numberblocks_hint: "Select a cell, then pick a number.",
    numberblocks_undone: "Move undone.",
    numberblocks_win_title: "Solved!",
    numberblocks_win_message: "Puzzle solved! Well done.",
    killersudoku_generating: "Generating puzzle…",
    killersudoku_hint: "Select a cell, then pick a number.",
    killersudoku_undone: "Move undone.",
    killersudoku_win_title: "Solved!",
    killersudoku_win_message: "Puzzle solved! Well done.",
    game_calcudoku: "Calcudoku",
    home_calcudoku_desc: "Fill the grid so every row and column holds each digit once and every cage hits its target with its operation. Sizes 4x4 to 7x7, three difficulty levels.",
    calcudoku_board_label: "Calcudoku board",
    calcudoku_size_label: "Grid size",
    calcudoku_history_intro: "A young puzzle with old roots: arithmetic cages laid over a Latin square, first devised as a classroom exercise.",
    game_numberblocks: "Number Blocks",
    home_numberblocks_desc: "Fill every block of n cells with the digits 1 to n - but equal digits may never touch, not even diagonally. Three difficulty levels, unique solution.",
    numberblocks_board_label: "Number Blocks board",
    numberblocks_history_intro: "A modern logic puzzle from Japan with one simple twist: equal digits keep their distance.",
    game_killersudoku: "Killer Sudoku",
    home_killersudoku_desc: "Sudoku with almost no givens: dashed cages show sums, and no digit repeats inside a cage. Three difficulty levels, unique solution.",
    killersudoku_board_label: "Killer Sudoku board",
    killersudoku_history_intro: "Sudoku meets the sums of Kakuro: a variant that trades given digits for arithmetic.",
    msg_t_cage: "cage {s}",
    msg_t_block_cells: "block of {n} cells",
    game_slitherlink: "Slitherlink",
    home_slitherlink_desc: "Draw a single loop between the dots so every numbered cell has exactly that many edges on its sides. Freshly generated, in three difficulty levels.",
    slitherlink_new_game: "New puzzle",
    slitherlink_clear: "Clear",
    slitherlink_level_easy: "Easy (5x5)",
    slitherlink_level_medium: "Medium (7x7)",
    slitherlink_level_hard: "Hard (10x10)",
    slitherlink_generating: "Generating puzzle…",
    slitherlink_hint: "Tap an edge to draw the loop.",
    slitherlink_undone: "Move undone.",
    slitherlink_win_title: "Solved!",
    slitherlink_win_message: "Loop complete! Well done.",
    slitherlink_edges_drawn: " edges drawn",
    slitherlink_history_intro: "Unlike Kakuro or Sudoku - both puzzles that started life elsewhere and only later passed through Japan - Slitherlink is a home-grown Nikoli invention from the start, with no earlier Western original to trace back to.",



    kakuro_history_intro: "Like Sudoku, Kakuro started life in an American puzzle magazine under a different name, and only became a household word decades later on the other side of the Pacific.",
    game_skyscrapers: "Skyscrapers",
    home_skyscrapers_desc: "Fill an NxN grid with building heights 1-N so every row and column has each height once, matching how many are visible from the numbered clues around the edge. Freshly generated, in three difficulty levels.",

    skyscrapers_new_game: "New puzzle",
    skyscrapers_erase: "Erase",
    skyscrapers_level_easy: "Easy (4x4)",
    skyscrapers_level_medium: "Medium (5x5)",
    skyscrapers_level_hard: "Hard (6x6)",
    skyscrapers_generating: "Generating puzzle…",
    skyscrapers_hint: "Select a cell, then pick a height.",
    skyscrapers_undone: "Move undone.",
    skyscrapers_win_title: "Solved!",
    skyscrapers_win_message: "Puzzle solved! Well done.",


    skyscrapers_history_intro: "Skyscrapers belongs to the same family of Latin-square puzzles Sudoku comes from, but adds a distinctive twist that gives it its name: a line-of-sight rule read in from just outside the grid.",

    game_hashi: "Hashiwokakero",
    home_hashi_desc: "Connect every numbered island with straight single or double bridges so the whole network joins together and every island's count matches its number. Freshly generated, in three difficulty levels.",

    hashi_new_game: "New puzzle",
    hashi_level_easy: "Easy (7x7)",
    hashi_level_medium: "Medium (11x11)",
    hashi_level_hard: "Hard (15x15)",
    hashi_generating: "Generating puzzle…",
    hashi_hint: "Tap a line (or two islands) to add a bridge.",
    hashi_msg_no_line: "No clear line between those islands.",
    hashi_msg_blocked: "That would cross another bridge.",
    hashi_undone: "Move undone.",
    hashi_win_title: "Solved!",
    hashi_win_message: "All islands connected! Well done.",


    hashi_history_intro: "A pure counting-and-connectivity puzzle from the same Japanese publisher that turned Sudoku into a global phenomenon, with a name and a flavor that both trace back to the idea of connecting things with bridges.",


    game_klondike: "Klondike",
    home_klondike_desc: "The original patience game solitaire is named after - seven cascading tableau columns, four foundations, and a draw pile to work through. The game Windows made famous.",
    klondike_new_game: "New game",
    klondike_move_label: "Move",
    klondike_hint_default: "Click a card, then click where to move it.",
    klondike_hint_selected: "Now click where to move it.",
    klondike_msg_cant_pick: "That card can't be picked up right now.",
    klondike_msg_cant_place: "That card can't go there.",
    klondike_msg_cant_place_yet: "That card can't go there yet.",
    klondike_msg_nothing_waste: "Nothing to move there yet.",
    klondike_msg_stock_empty: "Nothing left to draw.",
    klondike_msg_recycled: "Stock reshuffled from the waste pile.",
    klondike_msg_undone: "Move undone.",
    klondike_win_title: "You win!",
    klondike_win_message: "All four foundations complete - well done!",
    klondike_aria_stock: "Stock",
    klondike_aria_waste: "Waste",
    klondike_aria_foundation: "Foundation",
    klondike_aria_empty: "empty",
    klondike_aria_face_down: "Face-down card",
    klondike_aria_tap_recycle: "tap to reshuffle the waste pile",
    klondike_aria_up_to: "up to",
    klondike_history_intro: "The single most iconically named, most widely played patience game there is - so ubiquitous that for a couple of generations of computer users, \"Solitaire\" meant this one specific game.",

    // Fleet Battle
    game_fleetbattle: "Fleet Battle",
    home_fleetbattle_desc: "Sink the computer's hidden fleet before it sinks yours - classic grid-guessing naval combat, one shot per turn.",
    fleetbattle_rotate_button: "Rotate",
    fleetbattle_random_button: "Random placement",
    fleetbattle_reset_button: "Reset placement",
    fleetbattle_start_battle_button: "Start battle",
    fleetbattle_resign_button: "Resign",
    fleetbattle_your_fleet: "Your Fleet",
    fleetbattle_enemy_waters: "Enemy Waters",
    fleetbattle_orientation_horizontal: "Horizontal",
    fleetbattle_orientation_vertical: "Vertical",
    fleetbattle_place_prompt: "Place your",
    fleetbattle_cells_suffix: "cells",
    fleetbattle_placement_ready: "Fleet ready - press Start battle.",
    fleetbattle_reason_bounds: "That ship would go off the board.",
    fleetbattle_reason_overlap: "Ships can't overlap.",
    fleetbattle_reason_adjacent: "Ships can't touch, not even diagonally.",
    fleetbattle_your_turn: "Your turn - fire at the enemy waters.",
    fleetbattle_computer_thinking: "Computer thinking…",
    fleetbattle_hit: "Hit!",
    fleetbattle_miss: "Miss.",
    fleetbattle_win_title: "Victory!",
    fleetbattle_win_message: "You sank the entire enemy fleet!",
    fleetbattle_lose_title: "Defeat",
    fleetbattle_lose_message: "The computer sank your entire fleet.",
    fleetbattle_resigned_message: "You resigned. The computer wins.",
    fleetbattle_ships_afloat_label: "Ships afloat",
    fleetbattle_legend_ship: "Your ship",
    fleetbattle_legend_hit: "Hit",
    fleetbattle_legend_miss: "Miss",
    fleetbattle_legend_sunk: "Sunk ship",
    fleetbattle_ship_carrier: "Carrier",
    fleetbattle_ship_battleship: "Battleship",
    fleetbattle_ship_cruiser: "Cruiser",
    fleetbattle_ship_submarine: "Submarine",
    fleetbattle_ship_destroyer: "Destroyer",
    fleetbattle_cell_ship: "your ship",
    fleetbattle_cell_hit: "hit",
    fleetbattle_cell_miss: "miss",
    fleetbattle_cell_sunk: "sunk",
    fleetbattle_history_intro: "A pencil-and-paper guessing game turned world-famous plastic-and-pegs classic - and, here, a generic version of it under a different name.",
    game_pyramidsolitaire: "Pyramid Solitaire",
    home_pyramidsolitaire_desc: "Clear the 28-card pyramid by removing exposed pairs that add up to 13, or a lone King. A stock/waste pile with two redeals to work through.",
    pyramidsolitaire_new_game: "New game",
    pyramidsolitaire_remaining_label: "Cards left",
    pyramidsolitaire_redeals_label: "Redeals left",
    pyramidsolitaire_hint_default: "Click an exposed card, then click a second one to pair them to 13 - or click a King alone to remove it.",
    pyramidsolitaire_hint_selected: "Now click a second exposed card to pair with it.",
    pyramidsolitaire_msg_covered: "That card is still covered - it can't be picked up yet.",
    pyramidsolitaire_msg_king_removed: "King removed.",
    pyramidsolitaire_msg_pair_removed: "Pair removed.",
    pyramidsolitaire_msg_stock_empty: "Nothing left to draw.",
    pyramidsolitaire_msg_recycled: "Waste redealt back into the stock.",
    pyramidsolitaire_msg_undone: "Move undone.",
    pyramidsolitaire_win_title: "You win!",
    pyramidsolitaire_win_message: "The pyramid is clear - well done!",
    pyramidsolitaire_lose_title: "No moves left",
    pyramidsolitaire_lose_message: "The stock is empty, no redeals remain, and no pair or King is available - this game is over.",
    pyramidsolitaire_aria_stock: "Stock",
    pyramidsolitaire_aria_waste: "Waste",
    pyramidsolitaire_aria_empty: "empty",
    pyramidsolitaire_aria_covered: "covered",
    pyramidsolitaire_aria_tap_redeal: "tap to redeal the waste pile",
    pyramidsolitaire_history_intro: "A patience game built around a completely different mechanic from Klondike, FreeCell, or Spider: instead of building sequences, you clear the board by pairing cards that add up to 13.",
    game_spidersolitaire: "Spider Solitaire",
    home_spidersolitaire_desc: "Two decks, ten tableau columns, no foundations - build same-suit King-to-Ace runs to clear them. Choose 1, 2, or 4 suits for an easier or harder deal.",
    spidersolitaire_new_game: "New game",
    spidersolitaire_level_1suit: "1 suit (easiest)",
    spidersolitaire_level_2suit: "2 suits (medium)",
    spidersolitaire_level_4suit: "4 suits (hardest)",
    spidersolitaire_move_label: "Move",
    spidersolitaire_hint_default: "Click a card, then click where to move it.",
    spidersolitaire_hint_selected: "Now click where to move it.",
    spidersolitaire_msg_cant_pick: "That card can't be picked up right now.",
    spidersolitaire_msg_cant_place: "That card can't go there.",
    spidersolitaire_msg_stock_empty: "Nothing left to deal.",
    spidersolitaire_msg_needs_full_columns: "Every column needs at least one card before you can deal.",
    spidersolitaire_msg_sequence_completed: "Sequence complete - removed!",
    spidersolitaire_msg_undone: "Move undone.",
    spidersolitaire_win_title: "You win!",
    spidersolitaire_win_message: "All 8 sequences complete - well done!",
    spidersolitaire_aria_stock: "Stock",
    spidersolitaire_aria_deals_left: "deals left",
    spidersolitaire_aria_empty: "empty",
    spidersolitaire_aria_face_down: "Face-down card",
    spidersolitaire_aria_sequences: "Completed sequences",
    spidersolitaire_history_intro: "A two-deck patience game with no exact birth certificate, like most of the family it belongs to - but one whose modern fame traces back to the very same company that made Klondike a household name.",
    undo_button: "Undo",
    resign_button: "Resign",
    offer_draw_button: "Offer draw",
    chess_mode_offline: "Offline",
    chess_mode_online: "Online",
    chess_rated_checkbox: "Rated",
    chess_time_10_0: "10 + 0 (Rapid)",
    chess_time_15_10: "15 + 10 (Rapid)",
    chess_time_25_10: "25 + 10 (Rapid)",
    chess_time_30_20: "30 + 20 (Classic)",
    chess_play_lichess_ai: "Play Lichess AI",
    chess_color_random: "Random",
    go_pass_button: "Pass",
    go_board_size_9: "9 × 9 (fast)",
    go_board_size_19: "19 × 19 (full size)",
    go_color_black: "Black",
    go_color_white: "White",
    chess_online_level_1: "Level 1 – ~800 Elo",
    chess_online_level_2: "Level 2 – ~1100 Elo",
    chess_online_level_3: "Level 3 – ~1400 Elo",
    chess_online_level_4: "Level 4 – ~1700 Elo",
    chess_online_level_5: "Level 5 – ~2000 Elo",
    chess_online_level_6: "Level 6 – ~2300 Elo",
    chess_online_level_7: "Level 7 – ~2700 Elo",
    chess_online_level_8: "Level 8 – ~3200 Elo",
    chess_level_inline_1: "Level 1 – ~800 Elo (instant)",
    chess_level_inline_2: "Level 2 – ~1100 Elo (~1s/move)",
    chess_level_inline_3: "Level 3 – ~1400 Elo (~2–4s/move)",
    chess_level_inline_4: "Level 4 – ~1700 Elo (~5–10s/move)",
    chess_level_inline_5: "Level 5 – ~2000 Elo (~10–20s/move)",

    // Dynamic status/result messages translated by I18n.msg()
    menu_close: "✕ Close",
    msg_name_black: "Black",
    msg_name_white: "White",
    msg_name_red: "Red",
    msg_name_blue: "Blue",
    msg_name_green: "Green",
    msg_name_yellow: "Yellow",
    msg_name_player1: "Player 1",
    msg_name_player2: "Player 2",
    msg_name_attackers: "Attackers",
    msg_name_defenders: "Defenders",
    msg_name_goats: "Goats",
    msg_name_tigers: "Tigers",
    msg_name_easy: "Easy",
    msg_name_medium: "Medium",
    msg_name_hard: "Hard",
    msg_you_win: "You win!",
    msg_you_lose: "You lose",
    msg_computer_wins: "The computer wins",
    msg_draw: "Draw",
    msg_solved: "Solved!",
    msg_cleared: "Cleared!",
    msg_boom: "Boom!",
    msg_no_moves_left: "No moves left",
    msg_game_over: "Game over",
    msg_computer_thinking: "Computer thinking…",
    msg_computer_is_thinking: "Computer is thinking…",
    msg_computer_to_move: "Computer to move.",
    msg_local_2p: "Local 2-player game (no computer).",
    msg_game_is_over: "Game is over. Start a new game to play again.",
    msg_move_undone: "Move undone.",
    msg_choose_where: "Choose where to move it.",
    msg_now_click_where: "Now click where to move it.",
    msg_invalid_move: "Invalid move.",
    msg_invalid_capture_forced: "Invalid move: a capture is available and must be taken.",
    msg_checkers_choose_path: "Several capture paths lead there. Tap a piece you want to jump over.",
    msg_roll_dice: "Roll the dice.",
    msg_roll_dice_first: "Roll the dice first.",
    msg_roll_die: "Roll the die.",
    msg_roll_die_first: "Roll the die first.",
    msg_ludo_needs_six: "That token needs a 6 to come into play.",
    msg_ludo_overshoot: "That token needs an exact roll to reach the finish.",
    msg_ludo_blocked: "Two opposing tokens block that move.",
    msg_ludo_finished: "That token is already home.",
    msg_name_red_shape: "Red ●",
    msg_name_green_shape: "Green ○",
    msg_name_yellow_shape: "Yellow ▲",
    msg_name_blue_shape: "Blue □",
    msg_ludo_finish_label: "In the finish:",
    msg_t_ludo_in_finish: "{n} in the finish",
    msg_throw_sticks: "Throw the sticks.",
    msg_throw_sticks_first: "Throw the sticks first.",
    msg_choose_card: "Choose a card.",
    msg_choose_card_first: "Choose a card first.",
    msg_choose_piece: "Choose a piece to move.",
    msg_choose_token: "Choose a token to move.",
    msg_no_legal_move_passes: "No legal move - turn passes.",
    msg_no_legal_move: "No legal move.",
    msg_computer_played: "Computer played. Your move.",
    msg_computer_passes: "Computer passes. Your move.",
    msg_your_move: "Your move.",
    msg_not_your_turn: "It's not your turn.",
    msg_check: "Check!",
    msg_point_occupied: "That point is occupied.",
    msg_promote_piece: "Promote this piece?",
    msg_generating_puzzle: "Generating puzzle…",
    msg_select_cell_number: "Select a cell, then pick a number.",
    msg_fill_clues: "Fill in the cells the clues describe.",
    msg_select_peg: "Select a peg, then choose a hole to jump into.",
    msg_reveal_begin: "Reveal a cell to begin.",
    msg_reveal_continue: "Reveal a cell to continue.",
    msg_swipe_hint: "Swipe, use the arrow keys, or tap a direction button.",
    msg_puzzle_solved_well_done: "Puzzle solved! Well done.",
    msg_lights_goal: "Turn off every light to win.",
    msg_hit_mine: "You hit a mine. Try again!",
    msg_last_peg: "Down to the last peg - solved!",
    msg_foundations_done: "All four foundations complete - well done!",
    msg_tiles_matched: "All tiles matched - well done!",
    msg_board_full_draw: "It's a draw - the board is full!",
    msg_draw_stalemate: "Draw (stalemate).",
    msg_draw_repetition: "Draw by repetition.",
    msg_draw_50: "Draw (50-move rule).",
    msg_draw_material: "Draw (insufficient material).",
    msg_draw_agreement: "Game drawn by agreement.",
    msg_draw_no_capture_40: "Draw (no capture in the last 40 moves).",
    msg_draw_sennichite: "Draw by repetition (sennichite): the same position occurred four times.",
    msg_you_resigned: "You resigned.",
    msg_resigned: "Resigned.",
    msg_checkmate_you_win: "Checkmate! You win.",
    msg_checkmate_computer_wins: "Checkmate! The computer wins.",
    msg_checkmate_computer_mated: "Checkmate! The computer is mated.",
    msg_mill_removed: "Mill! A piece was removed.",
    msg_marble_off: "Marble pushed off!",
    msg_t_marble_off_count: "Marble pushed off – {p}: {n} of 6 lost.",
    msg_ttt_hard_hint: "On Hard the computer solves the game completely – a draw is the best you can get.",
    msg_t_random_you_play: "Chance decided: you play {p}, computer level: {l}.",
    msg_t_random_you_play_plain: "Chance decided: you play {p}.",
    msg_t_random_chess_you_play_level: "Chance decided: you play {p}, computer level {n} ({r}).",
    msg_t_random_chess_you_play_level_plain: "Chance decided: you play {p}, computer level {n}.",
    msg_t_random_ludo_you_play: "Chance decided: you play {p} against {n} computer player(s), level: {l}.",
    msg_goat_captured: "A goat was captured!",
    msg_choose_opponent_remove: "Choose a highlighted opponent piece to remove.",
    msg_reason_no_legal_moves: "no legal moves",
    msg_reason_no_legal_moves_left: "no legal moves left",
    msg_reason_no_pieces: "no pieces left",
    msg_reason_checkmate: "checkmate",
    msg_reason_marbles: "6 marbles pushed off the board",
    msg_reason_reduced: "reduced to two pieces",
    msg_t_to_move: "{p} to move.",
    msg_t_to_move_again: "{p} to move again.",
    msg_t_to_move_place: "{p} to move: place a piece.",
    msg_t_played: "{p} played.",
    msg_t_passed: "{p} passed.",
    msg_t_turn: "{p}'s turn.",
    msg_t_wins: "{p} wins",
    msg_t_wins_dot: "{p} wins.",
    msg_t_wins_resign: "{p} wins by resignation.",
    msg_t_win_resign: "{p} win by resignation.",
    msg_t_wins_reason: "{p} wins ({r}).",
    msg_t_wins_checkmate: "{p} wins by checkmate!",
    msg_t_checkmate_wins: "Checkmate! {p} wins.",
    msg_t_wins_four: "{p} wins - four in a row!",
    msg_t_wins_three: "{p} wins - three in a row!",
    msg_t_wins_five: "{p} wins - five in a row!",
    msg_t_wins_home: "{p} wins - all pieces home!",
    msg_t_wins_borne_off: "{p} wins - all pieces borne off!",
    msg_t_wins_connect: "{p} wins by connecting both sides!",
    msg_t_wins_camp: "{p} wins by filling the opposite camp!",
    msg_t_wins_point: "{p} wins by filling the opposite point!",
    msg_t_wins_far_side: "{p} wins by reaching the far side!",
    msg_t_wins_no_move: "{p} wins - the other player has no legal move left!",
    msg_t_you_play: "You play {p}, computer level: {l}.",
    msg_t_rolled: "{p} rolled {n}.",
    msg_t_threw: "{p} threw {n}.",
    msg_t_computer_rolled: "Computer rolled {n}.",
    msg_t_computer_threw: "Computer threw {n}.",
    msg_t_computer_rolled_thinking: "Computer rolled {n}, thinking…",
    msg_t_computer_threw_thinking: "Computer threw {n}, thinking…",
    msg_t_rolled_six: "{p} rolled a 6 - roll again!",
    msg_t_rosette: "{p} landed on a rosette - roll again!",
    msg_t_mill: "{p} formed a mill - choose an opponent piece to remove.",
    msg_t_box: "{p} completed a box and goes again.",
    msg_t_store: "{p} landed in their store - go again!",
    msg_t_no_move_passes: "{p} has no legal move and passes.",
    msg_t_mines_left: "{n} mines left.",
    msg_t_pegs_left: "{n} pegs left.",
    msg_t_daily: "Daily Challenge ({n}).",
    msg_t_error: "Error: {r}",

    // Game-specific status/result messages and info lines (I18n.msg)
    msg_no_further_move: "No further legal move this turn.",
    msg_both_passed: "Both passed.",
    msg_board_ready: "Board ready.",
    msg_konane_black_remove: "Black: remove one of the highlighted stones to begin.",
    msg_konane_white_remove: "White: remove one of the highlighted stones next to the empty square.",
    msg_konane_choose_white: "Choose one of White's highlighted stones next to the empty square.",
    msg_konane_choose_corner: "Choose one of the highlighted corner or center stones to remove.",
    msg_invalid_jump_mandatory: "Invalid move: a jump is mandatory - choose one of the highlighted stones.",
    msg_invalid_continue_jumping: "Invalid move: continue jumping with the highlighted piece, or press Done.",
    msg_invalid_continue_capturing: "Invalid move: continue capturing with the highlighted piece, or press Done.",
    msg_fanorona_both_available: "Both an approach and a withdrawal capture are available - choose one above.",
    msg_fanorona_choose_first: "Choose approach or withdrawal above first.",
    msg_go_occupied: "Invalid move: that point is already occupied.",
    msg_go_suicide: "Invalid move: that would leave your stones with no liberties.",
    msg_go_ko: "Invalid move: forbidden by the ko rule (recaptures immediately).",
    msg_go_superko: "Invalid move: it would repeat an earlier board position (superko rule).",
    msg_computer_no_moves: "Computer has no moves.",
    msg_computer_cannot_find: "Computer cannot find a move.",
    msg_chess_coords: "Invalid move: coordinates not understood.",
    msg_chess_no_dest: "Invalid move: this piece currently has no legal destination squares.",
    msg_chess_castle_rights: "Invalid move: castling is no longer allowed, because the king or that rook has already moved.",
    msg_chess_castle_check: "Invalid move: you cannot castle while your king is in check.",
    msg_chess_castle_through: "Invalid move: when castling, the king may not pass over a square that is under attack.",
    msg_draw_offer_sent: "Draw offer sent.",
    msg_active_game_loaded: "Active game loaded.",
    msg_no_active_game: "No active game found.",
    msg_no_online_game: "No online game active.",
    msg_game_finished_none: "Game finished or no active game.",
    msg_move_sent: "Move sent. Waiting for confirmation…",
    msg_online_login: "Online mode: log in and start a game.",
    msg_searching_opponent: "Searching for opponent…",
    msg_opponent_to_move: "Opponent to move.",
    msg_unknown_error: "Unknown error.",
    msg_no_game_active: "No game active",
    msg_elo_1: "~800 Elo (instant)",
    msg_elo_2: "~1100 Elo (~1s/move)",
    msg_elo_3: "~1400 Elo (~2–4s/move)",
    msg_elo_4: "~1700 Elo (~5–10s/move)",
    msg_elo_5: "~2000 Elo (~10–20s/move)",
    msg_freecell_hint: "Click a card, then click where to move it.",
    msg_freecell_no_foundation: "No cards can go to a foundation right now.",
    msg_freecell_cant_pick: "That card can't be picked up right now.",
    msg_freecell_nothing: "Nothing to move there yet.",
    msg_freecell_cant_go: "That card can't go there.",
    msg_freecell_cant_go_yet: "That card can't go there yet.",
    msg_mahjong_hint: "Click a free tile, then click its matching pair.",
    msg_mahjong_reshuffled: "Tiles reshuffled - a solution is still guaranteed from here.",
    msg_mahjong_blocked: "That tile is blocked - it can't be picked up yet.",
    msg_mahjong_now_match: "Now click a matching free tile.",
    msg_mahjong_no_matches: "No matches left - try Shuffle remaining tiles to keep going.",
    msg_mahjong_not_match: "Not a match.",
    msg_cardtactics_choose_piece: "Choose one of your pieces to move with this card.",
    msg_cardtactics_no_move: "That piece has no legal move with this card.",
    msg_amazons_shoot: "Now choose where to shoot the arrow from there.",
    msg_wallmaze_no_h: "No horizontal wall can be placed right now.",
    msg_wallmaze_no_v: "No vertical wall can be placed right now.",
    msg_wallmaze_confirm: "Tap ✓ Place to confirm, or tap elsewhere to move it.",
    msg_wallmaze_preview: "Tap anywhere on the board to preview a wall there.",
    msg_2048_reached: "You reached 2048!",
    msg_2048_keep_going: "Keep going for a higher score, or start a new game.",
    msg_no_more_moves_left: "No more moves left.",
    msg_try_again: "Try again!",
    msg_its_a_draw: "It's a draw!",
    msg_bg_single: "single game",
    msg_bg_gammon: "gammon",
    msg_bg_backgammon: "backgammon",
    msg_reason_no_jump: "no legal jump available",
    msg_name_computer: "Computer",
    msg_t_accepts: "{p} accepts.",
    msg_t_cube_now: "Cube is now {n}.",
    msg_t_to_roll: "{p} to roll.",
    msg_t_doubles: "{p} doubles to {n}.",
    msg_t_declines: "{p} declines the double.",
    msg_t_wins_points: "{p} wins {n} points.",
    msg_t_wins_one_point: "{p} wins {n} point.",
    msg_t_wins_resign_points: "{p} wins by resignation - {n} points.",
    msg_t_wins_resign_point: "{p} wins by resignation - {n} point.",
    msg_t_bg_win_points: "{p} wins ({r}) - {n} points!",
    msg_t_bg_win_point: "{p} wins ({r}) - {n} point!",
    msg_t_bg_win_cube: "{p} wins ({r}, cube x{m}) - {n} points!",
    msg_t_dice_left: "{n} dice left to play.",
    msg_t_die_left: "{n} die left to play.",
    msg_t_can_continue_capturing: "{p} can continue capturing, or press Done.",
    msg_t_can_continue_jumping: "{p} can continue jumping, or press Done.",
    msg_t_captured_continue: "{p} captured - continue with this piece, or press Done.",
    msg_t_jumped_continue: "{p} jumped - continue with this stone, or press Done.",
    msg_t_must_choose_capture: "{p} must choose approach or withdrawal above.",
    msg_t_captured: "{p} captured.",
    msg_t_shogi_sennichite_win: "{p} wins: {q} repeated the position four times by perpetual check (sennichite).",
    msg_t_go_score: "{p} wins by {n} (Black {m} – White {k}).",
    msg_t_computer_color_rolled_thinking: "Computer ({p}) rolled {n}, thinking…",
    msg_t_chess_level: "Computer level {n} ({r}).",
    msg_t_chess_level_active: "Computer level {n} active.",
    msg_t_chess_you_play_level: "You play {p}, computer level {n} ({r}).",
    msg_t_chess_you_play_level_plain: "You play {p}, computer level {n}.",
    msg_t_computer_plays: "Computer plays {c}–{d}.",
    msg_t_chess_move: "Move: {c}–{d}.",
    msg_t_chess_moving_from: "Moving from {c} …",
    msg_t_chess_no_piece: "Invalid move: no piece on {c}.",
    msg_t_chess_not_yours: "Invalid move: the piece on {c} is not yours.",
    msg_t_chess_own_piece: "Invalid move: you cannot capture your own piece on {c}.",
    msg_t_chess_cannot_move: "Invalid move: {c} cannot move to {d} by normal chess movement.",
    msg_t_chess_king_check: "Invalid move: your king would be in check after {c}–{d}.",
    msg_t_draw_offer_failed: "Draw offer failed: {r}",
    msg_t_resign_failed: "Resign failed: {r}",
    msg_t_move_rejected: "Move was rejected by server: {r}",
    msg_t_polling_error: "Polling error: {r}",
    msg_t_searching_rated: "Searching ({r}, rated) …",
    msg_t_searching_casual: "Searching ({r}, casual) …",
    msg_t_sending_move: "Sending move {r} …",
    msg_t_starting_lichess_ai: "Starting game vs Lichess AI (level {n}) …",
    msg_t_online_active: "Online game active. You play {p}.",
    msg_t_online_label: "Online: {p} vs {r}",
    msg_t_computer_level_label: "Computer (level {n})",
    msg_t_time_control: "Time control: {r}",
    msg_t_your_time: "Your time: {r}",
    msg_t_local_n_player: "Local {n}-player hotseat game (no computer).",
    msg_t_ludo_you_play: "You play {p} against {n} computer player(s), level: {l}.",
    msg_t_ludo_third_six: "{p} rolled a third 6 in a row - turn forfeited!",
    msg_t_ludo_wins_home: "{p} wins - all 4 tokens home!",
    msg_t_ludo_sent_home: "{p} sent home.",
    msg_t_ludo_captured: "{p} captured {q}!",
    msg_t_ludo_token_home: "{p} got a token home!",
    msg_t_resigned_p: "{p} resigned.",
    msg_t_senet_throw_again: "{p} threw a {n} - throw again!",
    msg_t_senet_captured_again: "{p} captured a piece and throws again!",
    msg_t_mancala_captured: "{p} played, captured {n}!",
    msg_t_wins_excl: "{p} wins!",
    msg_t_wins_score: "{p} wins {n}!",
    msg_t_draw_score: "It's a draw, {n}!",
    msg_t_dab_score: "Player 1: {n} · Player 2: {m}.",
    msg_t_dab_draw: "It's a draw - Player 1: {n} · Player 2: {m}.",
    msg_t_win_goats: "{p} win by capturing 5 goats!",
    msg_t_win_trapped: "{p} win by trapping every tiger!",
    msg_t_win_no_moves: "{p} win - the other side has no legal move!",
    msg_t_win_king_captured: "{p} win by capturing the king!",
    msg_t_win_king_escape: "{p} win as the king reaches a corner!",
    msg_t_win_plain: "{p} win.",
    msg_t_wins_shrine: "{p} wins by reaching the shrine!",
    msg_t_wins_master: "{p} wins by capturing the master!",
    msg_t_all_clear_seconds: "All clear in {n} seconds - well done!",
    msg_t_lights_off_moves: "All lights off in {n} moves - well done!",
    msg_t_lights_off_move: "All lights off in {n} move - well done!",
    msg_t_no_more_jumps: "No more jumps available, with {n} pegs left.",
    msg_t_final_score: "Final score: {n}",
    msg_t_nonogram_solved: "Solved “{r}” - well done!",
    msg_t_move_count: "Move {n}",
    msg_t_captured_bw: "Captured – Black: {n} · White: {m}",
    msg_t_pushed_off_bw: "Pushed off (of 6 to lose) – Black: {n} · White: {m}",
    msg_t_reachable: "Reachable squares – Player 1: {n} · Player 2: {m}",
    msg_t_cube_display: "Cube: {n}",
    msg_t_cube_display_owner: "Cube: {n} ({p})",
    msg_t_pips: "Pips - Black: {n} · White: {m}",
    msg_t_goats_placed: "Goats placed: {n} · Captured: {m}",
    msg_t_movement_phase: "Movement phase · Captured: {n}",
    msg_t_boxes: "Boxes – Player 1: {n} · Player 2: {m}",
    msg_t_satisfied: "{n} / {m} satisfied",
    msg_t_filled: "{n} / {m} filled",
    msg_t_moves_label: "Moves: {n}",
    msg_t_tiles_left: "{n} tiles left",
    msg_t_cells_revealed: "{n} cells revealed",
    msg_t_pegs: "{n} pegs",
    msg_t_discs: "Discs – Black: {n} · White: {m}",
    msg_t_borne_off: "Black borne off: {n} / 5     White borne off: {m} / 5",
    msg_t_score_best: "Score: {n}   Best: {m}",
    msg_t_walls_left: "Walls left – Player 1: {n} · Player 2: {m}",
    msg_t_ludo_chip_computer: "{p} (computer)",
    msg_t_ludo_chip_you: "{p} (you)",

    // More status phrases and Nonogram puzzle names (I18n.msg)
    msg_mill: "Mill!",
    msg_piece_removed: "A piece was removed.",
    msg_online_game_active: "Online game active.",
    msg_t_you_play_plain: "You play {p}.",
    msg_nono_plus: "Plus",
    msg_nono_diamond: "Diamond",
    msg_nono_ring: "Ring",
    msg_nono_hourglass: "Hourglass",
    msg_nono_double_frame: "Double Frame",

    // Plural-side variants (Goats, Tigers, Attackers, Defenders)
    msg_t_to_move_pl: "{p} to move.",
    msg_t_played_pl: "{p} played.",

    // Plural-side result title
    msg_t_win_title: "{p} win",

    // Screen-reader labels (I18n.setAria) and result popup button
    result_modal_ok: "OK",
    msg_noun_pawn: "pawn",
    msg_noun_knight: "knight",
    msg_noun_bishop: "bishop",
    msg_noun_rook: "rook",
    msg_noun_queen: "queen",
    msg_noun_king: "king",
    msg_noun_piece: "piece",
    msg_noun_stone: "stone",
    msg_noun_marble: "marble",
    msg_noun_disc: "disc",
    msg_noun_checker: "checker",
    msg_noun_general: "General",
    msg_noun_advisor: "Advisor",
    msg_noun_elephant: "Elephant",
    msg_noun_horse: "Horse",
    msg_noun_chariot: "Chariot",
    msg_noun_cannon: "Cannon",
    msg_noun_soldier: "Soldier",
    msg_noun_master: "master",
    msg_noun_home_token: "home token",
    msg_word_king_cap: "King",
    msg_word_tiger: "Tiger",
    msg_word_goat: "Goat",
    msg_word_attacker: "Attacker",
    msg_word_defender: "Defender",
    msg_aria_empty: "empty",
    msg_aria_blocked: "blocked",
    msg_aria_free: "free",
    msg_aria_covered: "covered",
    msg_aria_movable: "movable",
    msg_aria_selected: "selected",
    msg_aria_waiting: "waiting",
    msg_aria_satisfied: "satisfied",
    msg_aria_not_satisfied: "not satisfied",
    msg_aria_conflict: "conflict",
    msg_aria_removable: "removable",
    msg_aria_marked_off: "marked off",
    msg_aria_line: "line",
    msg_aria_capture_available: "capture available",
    msg_aria_capture_here: "capture here",
    msg_aria_burned: "burned",
    msg_aria_in_play: "in play",
    msg_aria_flagged: "flagged",
    msg_aria_violated: "violated",
    msg_aria_safe_square: "safe square",
    msg_aria_rosette: "rosette",
    msg_aria_peg: "peg",
    msg_aria_on: "on",
    msg_aria_off: "off",
    msg_aria_mine: "mine",
    msg_aria_hidden: "hidden",
    msg_aria_held: "held",
    msg_aria_filled: "filled",
    msg_aria_empty_hole: "empty hole",
    msg_aria_drop_here: "drop here",
    msg_aria_top_clue: "top clue",
    msg_aria_bottom_clue: "bottom clue",
    msg_aria_left_clue: "left clue",
    msg_aria_right_clue: "right clue",
    msg_aria_vertical_line: "Vertical line",
    msg_aria_horizontal_line: "Horizontal line",
    msg_aria_borne_off: "Borne off",
    msg_aria_bar: "Bar",
    msg_aria_house_water: "House of Water",
    msg_aria_house_rebirth: "House of Rebirth",
    msg_aria_house_beauty: "House of Beauty",
    msg_aria_dice: "Dice",
    msg_aria_current_guess: "Current guess",
    msg_aria_guess_history: "Guess history",
    msg_aria_pyramid: "Pyramid",
    msg_aria_switch_game: "Switch game",
    msg_aria_sort_games: "Sort games",
    msg_aria_search_games: "Search games",
    msg_aria_filter_category: "Filter by category",
    msg_aria_jump_category: "Jump to game category",
    msg_aria_withdrawal_example: "Withdrawal capture example",
    msg_aria_approach_example: "Approach capture example",
    msg_aria_tiger_example: "Tiger capture example",
    msg_aria_sumito_example: "Example of a push",
    msg_aria_loop_example: "Loop capture example",
    msg_aria_tap_cycle: "Tap to cycle through the shapes.",
    msg_shape_triangle: "Triangle",
    msg_shape_star: "Star",
    msg_shape_square: "Square",
    msg_shape_circle: "Circle",
    msg_shape_cross: "Cross",
    msg_t_aria_row: "Row {n}",
    msg_t_aria_row_lc: "row {n}",
    msg_t_aria_column: "column {n}",
    msg_t_aria_columns: "column {n} and column {m}",
    msg_t_aria_position: "position {n}",
    msg_t_aria_square: "Square {n}",
    msg_t_aria_point: "Point {n}",
    msg_t_aria_track: "Track square {n}",
    msg_t_aria_path: "Path square {n}",
    msg_t_aria_free_cell: "Free cell {n}",
    msg_t_aria_foundation: "Foundation {r}",
    msg_t_aria_up_to: "up to {r}",
    msg_t_aria_tile: "Tile {r}",
    msg_t_aria_hole: "Hole {r}",
    msg_t_aria_island: "Island {n}: needs {m}",
    msg_t_aria_height: "height {n}",
    msg_t_aria_currently: "currently {n}",
    msg_t_aria_available: "{n} available",
    msg_t_aria_seeds: "{n} seeds",
    msg_t_aria_seed: "{n} seed",
    msg_t_aria_pieces_waiting: "{n} pieces waiting",
    msg_t_aria_piece_waiting: "{n} piece waiting",
    msg_t_aria_given: "{n} (given)",
    msg_t_aria_adjacent_mines: "{n} adjacent mines",
    msg_t_aria_adjacent_mine: "{n} adjacent mine",
    msg_t_aria_die: "Die {n}: {m}",
    msg_t_aria_die_not_rolled: "Die {n}: not rolled yet",
    msg_t_aria_stock: "Stock: {n}",
    msg_t_aria_stock_deals: "Stock: {n} deals left",
    msg_t_aria_completed_sequences: "Completed sequences: {n}",
    msg_t_aria_pit: "{p} pit",
    msg_t_aria_drawn_by: "drawn by {p}",
    msg_t_aria_edge_rows: "Edge between dot row {n} and row {m}",
    msg_t_aria_edge_row: "Edge between dot row {n}",
    msg_t_aria_name_count: "{p}: {n}",
    msg_t_aria_slot: "Slot {n}: {r}.",
    msg_t_aria_board: "{r} board",
    msg_t_aria_name_noun: "{p} {q}",
    msg_t_aria_name_noun_count: "{p} {q} ({n})",
    msg_t_aria_name_glyph: "{p} {g}",
    msg_t_aria_hand: "{p} hand",
    msg_t_aria_hand_poss: "{p}'s hand",
    msg_t_aria_start: "{p} start",
    msg_t_aria_checkers: "{n} {p} checkers",
    msg_t_aria_checker: "{n} {p} checker",

    // Fleet Battle sink message and Mancala label
    fleetbattle_you_sank_ship: "You sank their {ship}!",
    msg_aria_your_move: "your move",

    // Nonogram label
    msg_aria_marked: "marked",

    // Computer speed setting and Ludo move messages
    settings_section_ai_pacing: "Computer speed",
    settings_ai_pacing_fast: "Fast",
    settings_ai_pacing_normal: "Normal",
    settings_ai_pacing_slow: "Slow",
    settings_section_random_start: "Who moves first",
    settings_random_start_chosen: "As chosen",
    settings_random_start_random: "Random",
    settings_version_label: "Version:",
    settings_version_unknown: "Version unknown",
    settings_version_checking: "Checking…",
    settings_update_hint: "This needs an internet connection.",
    msg_t_ludo_moved: "{p} moved token {n} forward {m}.",
    msg_t_ludo_brought: "{p} brought token {n} into play.",
    msg_t_ludo_moved_captured: "{p} moved token {n} forward {m} and captured {q}!",
    msg_t_ludo_brought_captured: "{p} brought token {n} into play and captured {q}!",
    msg_t_ludo_moved_home: "{p} moved token {n} forward {m} and got it home!",

    // Morris placing phase and Ludo token counts (screen reader)
    msg_t_morris_placing: "Placing - {n} pieces left to place",
    msg_t_morris_placing_one: "Placing - {n} piece left to place",
    msg_t_aria_tokens: "{n} tokens",
    msg_t_aria_token: "{n} token",

    // Card Tactics card names
    cardtactics_card_wind: "Wind",
    cardtactics_card_wave: "Wave",
    cardtactics_card_stone: "Stone",
    cardtactics_card_flame: "Flame",
    cardtactics_card_thunder: "Thunder",
    cardtactics_card_frost: "Frost",
    cardtactics_card_mist: "Mist",
    cardtactics_card_shadow: "Shadow",
    cardtactics_card_ember: "Ember",
    cardtactics_card_gale: "Gale",
    cardtactics_card_tide: "Tide",
    cardtactics_card_quake: "Quake",
    cardtactics_card_spark: "Spark",
    cardtactics_card_gust: "Gust",
    cardtactics_card_drift: "Drift",
    cardtactics_card_blaze: "Blaze",

    // Xiangqi perpetual check/chase rule
    msg_xq_perpetual_check_refused: "Perpetual check is not allowed - this move would repeat the position a third time. Choose another move.",
    msg_xq_perpetual_chase_refused: "Perpetual chase is not allowed - this move would repeat the position a third time. Choose another move.",
    msg_xq_draw_repetition: "Draw by repetition: the same position occurred three times.",
    msg_t_xq_no_escape: "{p} wins: {q} has no move left that avoids perpetual check or chase.",

    // Categories (Stadt, Land, Fluss): game page
    game_categories: "Categories",
    home_categories_desc: "The classic pen-and-paper word game, with this device as the game master: it draws the letter, keeps time and adds up the points. For 1-8 players, each with paper and a pen.",
    home_section_party: "Party & Word Games",
    categories_players_label: "Players",
    categories_player_name: "Player {n}",
    categories_categories_label: "Categories",
    categories_custom_label: "Own categories (comma-separated)",
    categories_timer_label: "Time limit",
    categories_timer_off: "No time limit",
    categories_timer_seconds: "{n} seconds",
    categories_new_game: "New game",
    categories_draw: "Draw a letter",
    categories_stop: "Stop!",
    categories_round: "Round {n}",
    categories_ready: "Draw a letter to start the round.",
    categories_letter_hint: "Everyone now writes one word per category starting with this letter.",
    categories_time_left: "{n} s left",
    categories_time_up: "Time's up! Pens down.",
    categories_stopped: "Stop! Pens down.",
    categories_used_letters: "Letters so far: {s}",
    categories_letters_reset: "All letters have been drawn - starting over with the full alphabet.",
    categories_score_hint: "Tap a cell to give points: 0, 5 (same answer as someone else), 10 (unique answer), 20 (only answer in this category).",
    categories_col_category: "Category",
    categories_row_round: "This round",
    categories_row_total: "Total",
    categories_score_round: "Add up round",
    categories_round_added: "Round {n} added up. Draw the next letter when everyone's ready.",
    categories_finish: "End game",
    categories_result_title: "Final score",
    categories_result_winner: "{p} wins with {n} points!",
    categories_result_tie: "Tie for first place with {n} points: {s}.",
    categories_need_category: "Choose at least one category.",
    categories_draw_first: "Draw a letter first.",
    categories_cell_aria: "{p}, {s}: {n} points",
    categories_cat_city: "City",
    categories_cat_country: "Country",
    categories_cat_river: "River",
    categories_cat_name: "First name",
    categories_cat_animal: "Animal",
    categories_cat_job: "Job",
    categories_cat_plant: "Plant",
    categories_cat_food: "Food or drink",
    categories_cat_thing: "Object",
    categories_cat_sport: "Sport",
    categories_cat_music: "Singer or band",
    categories_cat_title: "Film or book",

    // Categories (Stadt, Land, Fluss): rules and history
    categories_history_intro: "A word game played with nothing but paper and pens, known under a different name in almost every country - and with an origin nobody wrote down.",

    // Domino and Mau Mau
    game_domino: "Domino",
    game_maumau: "Mau Mau",
    home_domino_desc: "The classic draw game with a double-six set: match the pips on either open end, draw when you're stuck, and be the first to play your last tile. Against the computer or with 2-4 players on one device.",
    home_maumau_desc: "The traditional card game with a 32-card pack: follow suit or rank, use Sevens, Eights, Jacks and Aces to your advantage, and be the first to get rid of your cards. Against the computer or with 2-4 players on one device.",
    domino_mode_hotseat: "Same device",
    domino_num_players: "Players:",
    domino_open_ends: "Open ends",
    domino_show_hand: "Show my tiles",
    domino_draw_button: "Draw from stock",
    domino_pass_button: "Pass",
    maumau_mode_hotseat: "Same device",
    maumau_num_players: "Players:",
    maumau_choose_suit: "Choose a suit:",
    maumau_show_hand: "Show my cards",
    maumau_keep_button: "Keep the card",
    msg_name_player3: "Player 3",
    msg_name_player4: "Player 4",
    msg_suit_spades: "Spades",
    msg_suit_hearts: "Hearts",
    msg_suit_diamonds: "Diamonds",
    msg_suit_clubs: "Clubs",
    msg_t_pass_device: "Pass the device to {p}.",
    msg_aria_line_of_tiles: "Line of tiles",
    msg_aria_your_tiles: "Your tiles",
    msg_aria_your_cards: "Your cards",
    msg_aria_fits: "fits",
    msg_t_domino_opens: "{p} opens with {n}.",
    msg_domino_choose: "Choose a tile, then an open end.",
    msg_domino_must_draw: "No tile fits - draw from the stock.",
    msg_domino_must_pass: "No tile fits and the stock is empty - pass.",
    msg_t_domino_drew_one: "{p} drew 1 tile.",
    msg_t_domino_drew: "{p} drew {n} tiles.",
    msg_t_domino_played: "{p} played {n}.",
    msg_domino_blocked: "The line is blocked.",
    msg_domino_blocked_draw: "The lowest pip total is shared - it's a draw.",
    msg_t_domino_wins_lowest: "{p} wins with the lowest pip total.",
    msg_t_domino_last_tile: "{p} played their last tile.",
    msg_domino_no_fit: "That tile doesn't fit on either end.",
    msg_t_domino_fits_both: "Tile {n} fits on both ends - tap one.",
    msg_t_domino_tap_end: "Tap the highlighted end to place tile {n}.",
    msg_domino_choose_first: "Choose a tile from your hand first.",
    msg_domino_wrong_end: "That tile doesn't fit on this end.",
    msg_domino_no_need_draw: "You have a tile that fits - no need to draw.",
    msg_domino_stock_empty: "The stock is empty.",
    msg_domino_no_need_pass: "You have a tile that fits - no need to pass.",
    msg_domino_draw_first: "Draw from the stock first.",
    msg_domino_one_tile: "1 tile",
    msg_t_domino_tiles: "{n} tiles",
    msg_t_domino_tiles_pips: "{n} tiles, {m} pips",
    msg_domino_left_end: "Left end",
    msg_domino_right_end: "Right end",
    msg_t_domino_left_end: "Left end {n}",
    msg_t_domino_right_end: "Right end {n}",
    msg_t_domino_tile: "Tile {n}",
    msg_t_domino_stock: "Stock: {n} tiles",
    msg_t_maumau_first_card: "The first card is {s}.",
    msg_t_maumau_seven_or_draw: "Play a Seven or draw {n} cards from the stock.",
    msg_t_maumau_no_seven: "No Seven to play - draw {n} cards from the stock.",
    msg_maumau_drawn_fits: "The drawn card fits: play it or keep it.",
    msg_maumau_must_draw: "No card fits - draw a card from the stock.",
    msg_maumau_choose: "Choose a card to play.",
    msg_t_maumau_drew_one: "{p} drew a card.",
    msg_t_maumau_drew: "{p} drew {n} cards.",
    msg_t_maumau_played: "{p} played {s}.",
    msg_maumau_mau_mau: "Mau Mau!",
    msg_t_maumau_mau: "{p}: Mau!",
    msg_t_maumau_must_draw: "{p} must draw {n} cards or play a Seven.",
    msg_t_maumau_misses: "{p} misses a turn.",
    msg_t_maumau_asks: "{p} asks for {r}.",
    msg_t_maumau_again: "{p} plays again.",
    msg_maumau_reshuffled: "The discard pile was shuffled into a new stock.",
    msg_maumau_nothing_left: "There is no card left to draw.",
    msg_t_maumau_passes: "{p} passes.",
    msg_t_maumau_keeps: "{p} keeps the card.",
    msg_maumau_play_or_keep: "Play the card you just drew, or keep it.",
    msg_maumau_no_fit: "That card doesn't fit.",
    msg_maumau_choose_suit: "Choose the suit the next card must follow.",
    msg_maumau_no_need_draw: "You have a card that fits - no need to draw.",
    msg_maumau_one_card: "1 card",
    msg_t_maumau_cards: "{n} cards",
    msg_t_maumau_discard: "Discard pile {s}",
    msg_maumau_asked_for: "Asked for:",
    msg_t_maumau_asked_for: "Asked for: {r}",
    msg_t_maumau_draw_n: "Draw {n} cards",
    msg_t_maumau_card: "Card {s}",
    domino_history_intro: "Small tiles with pips, known in China for many centuries and in Europe since the 18th century - though how the two traditions are connected is still an open question.",
    maumau_history_intro: "A card game for the whole family, played in countless house-rule versions - and like many folk games, nobody knows who invented it.",
  }
};

// Native names, so each language reads correctly to its own speakers
// regardless of which language the UI happens to be in right now -
// the classic approach for a language picker (nobody wants to hunt
// for their language spelled in a language they don't read). Order
// here is also the order options appear in the picker.
const LANGUAGE_NAMES = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  uk: "Українська",
  ru: "Русский",
  ja: "日本語",
  zh: "中文",
  ar: "العربية"
};
const LANGUAGE_ORDER = ["en", "de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"];
// Written right to left; every other language is left to right.
const RTL_LANGUAGES = ["ar"];

const I18n = (function () {
  const STORAGE_KEY = "einkchess_lang";
  const DEFAULT_LANG = "en";

  function safeGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (e) {
      // egal - Sprache faellt dann beim naechsten Laden auf den Default zurueck
    }
  }

  function detectBrowserLang() {
    try {
      const lang = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
      return LANGUAGE_NAMES[lang] ? lang : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function getLang() {
    const saved = safeGet(STORAGE_KEY);
    if (saved && LANGUAGE_NAMES[saved]) return saved;
    return detectBrowserLang();
  }

  function t(key, lang) {
    const l = lang || getLang();
    const table = STRINGS[l] || STRINGS[DEFAULT_LANG];
    return (table && table[key]) || (STRINGS[DEFAULT_LANG] && STRINGS[DEFAULT_LANG][key]) || key;
  }

  // Game status lines and result popups are built at runtime from
  // English sentences ("Black to move.", "You play White, computer
  // level: Easy.") in 46 separate *-app.js files. Rather than threading
  // a key through every one of those call sites, msg() translates the
  // finished English text: an exact sentence lookup first, then the
  // msg_t_* templates, whose placeholders are filled from the matched
  // text. Longer texts are split into sentences and translated piece by
  // piece. Anything unknown is left in English rather than guessed at.
  //
  // A placeholder's first letter decides what it may match:
  //   {p} {q}      a known name ("Black", "Player 1", "Red, Blue"), translated
  //   {l}          a known level name ("Easy") or a plain number
  //   {n} {m} {k}  a number, score, fraction or dice roll ("3", "7.5", "3-5", "12/20")
  //   {c} {d}      a board coordinate ("e2")
  //   {r} {s}      free text, translated when it is a known phrase
  //   {g}          a non-Latin glyph such as a Shogi piece ("銀")
  const MSG_PLACEHOLDER = {
    p: "([^.!?]+?)",
    q: "([^.!?]+?)",
    l: "([^.!?]+?)",
    n: "([0-9][0-9.,/\\-\u2013]*)",
    m: "([0-9][0-9.,/\\-\u2013]*)",
    k: "([0-9][0-9.,/\\-\u2013]*)",
    c: "([a-z][0-9]{1,2})",
    d: "([a-z][0-9]{1,2})",
    r: "(.+?)",
    s: "(.+?)",
    g: "([^\\x00-\\x7F]+)"
  };
  // Languages that write decimals with a comma ("7,5").
  const MSG_DECIMAL_COMMA = ["de", "fr", "es", "it", "nl", "pl", "uk", "ru"];
  // Sides named in the plural need a plural verb in some languages
  // ("Die Ziegen sind am Zug"); a template may provide a <key>_pl variant.
  const MSG_PLURAL_NAMES = ["Attackers", "Defenders", "Goats", "Tigers", "Geese"];
  let msgIndex = null;
  const msgCache = new Map();
  const MSG_CACHE_LIMIT = 5000;
  let staticAriaCaptured = false;
  let msgSegmentMode = false;

  function buildMsgIndex() {
    const en = STRINGS[DEFAULT_LANG];
    const exact = {};
    const templates = [];
    const keys = Object.keys(en);
    // msg_* keys win over ordinary UI keys that happen to share a text.
    keys.forEach((key) => {
      const v = en[key];
      if (key.indexOf("msg_") !== 0 || typeof v !== "string") return;
      if (/_pl$/.test(key)) return;
      if (key.indexOf("msg_t_") === 0) {
        const names = [];
        const pattern = v.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (m, n) => {
          names.push(n);
          return MSG_PLACEHOLDER[n.charAt(0)] || "(.+?)";
        });
        templates.push({
          key: key,
          re: new RegExp("^" + pattern + "$"),
          names: names,
          weight: v.replace(/\{\w+\}/g, "").length
        });
      } else if (!exact[v]) {
        exact[v] = key;
      }
    });
    keys.forEach((key) => {
      const v = en[key];
      if (key.indexOf("msg_") !== 0 && typeof v === "string" && v && !exact[v]) exact[v] = key;
    });
    // Most specific template first, so "Computer rolled {n}." is tried
    // before the more general "{p} rolled {n}.".
    templates.sort((a, b) => b.weight - a.weight);
    return { exact: exact, templates: templates };
  }

  function msgExact(s, l) {
    const key = msgIndex.exact[s];
    // A language that doesn't have this text yet (Arabic leaves out the
    // rules pages) must not answer with the English fallback here, or it
    // would shadow a template that does fit ("Goats win" is also a rules
    // page term).
    if (!key || !STRINGS[l] || STRINGS[l][key] === undefined) return null;
    return t(key, l);
  }

  // A name slot may also hold a list ("Red, Blue"), each part a known name.
  function msgName(raw, l) {
    const single = msgExact(raw, l);
    if (single !== null) return single;
    const parts = raw.split(", ");
    if (parts.length < 2) return null;
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      // Only real player/side names form lists, not label parts like
      // "waiting" in "Red home token, waiting".
      const key = msgIndex.exact[parts[i]];
      if (!key || key.indexOf("msg_name_") !== 0) return null;
      out.push(t(key, l));
    }
    return out.join(l === "ja" || l === "zh" ? "\u3001" : ", ");
  }

  function msgSentence(s, l) {
    const direct = msgExact(s, l);
    if (direct !== null) return direct;
    for (let i = 0; i < msgIndex.templates.length; i++) {
      const tpl = msgIndex.templates[i];
      const m = tpl.re.exec(s);
      if (!m) continue;
      const values = {};
      let ok = true;
      let plural = false;
      tpl.names.forEach((n, idx) => {
        const raw = m[idx + 1];
        const kind = n.charAt(0);
        let translated;
        if (kind === "p" || kind === "q") {
          // A name slot must hold a name we know, otherwise this template
          // doesn't really fit (e.g. "Move undone. White" is no name).
          translated = msgName(raw, l);
          if (translated === null) ok = false;
          if (MSG_PLURAL_NAMES.indexOf(raw) !== -1) plural = true;
        } else if (kind === "l") {
          translated = msgExact(raw, l);
          if (translated === null && !/^[0-9]+$/.test(raw)) ok = false;
        } else if (kind === "r" || kind === "s") {
          // Free text may itself be a known sentence or template
          // ("Computer (level 3)"); it is always shorter than s. It must
          // not swallow a following sentence, nor (in a comma-separated
          // screen-reader label) the following parts.
          if (/[.!?\u2026]\s/.test(raw)) ok = false;
          translated = raw.length < s.length ? msgSentence(raw, l) : null;
          if (translated === null && msgSegmentMode && raw.indexOf(", ") !== -1) ok = false;
        } else if ((kind === "n" || kind === "m" || kind === "k") && MSG_DECIMAL_COMMA.indexOf(l) !== -1) {
          translated = raw.replace(/(\d)\.(\d)/g, "$1,$2");
        } else {
          translated = null;
        }
        values[n] = translated !== null ? translated : raw;
      });
      if (!ok) continue;
      const key = plural && STRINGS[DEFAULT_LANG][tpl.key + "_pl"] ? tpl.key + "_pl" : tpl.key;
      const filled = t(key, l).replace(/\{(\w+)\}/g, (m0, n) => {
        if (!(n in values)) return m0;
        // French elides before a name that starts with a vowel; mark
        // where a name goes in so only those spots are touched.
        return (l === "fr" && (n.charAt(0) === "p" || n.charAt(0) === "q") ? "\u0002" : "") + values[n];
      });
      return l === "fr" ? msgElideFr(filled) : filled;
    }
    return null;
  }

  // "Au tour de Ordinateur 1" -> "Au tour d'Ordinateur 1", "que Ordinateur"
  // -> "qu'Ordinateur". Only right before an inserted name (marked with
  // \u0002 by msgSentence); a leading h is left alone, it may be aspirated.
  function msgElideFr(s) {
    return s.replace(/(^|[^A-Za-z\u00C0-\u00FF])(de|que|le|la|jusque|lorsque|puisque) \u0002(?=[AEIOUYaeiouy\u00C0-\u00C6\u00C8-\u00CF\u00D2-\u00D6\u00D9-\u00DC\u00E0-\u00E6\u00E8-\u00EF\u00F2-\u00F6\u00F9-\u00FC\u0152\u0153])/gi,
      (m, pre, word) => pre + word.slice(0, -1) + "'").replace(/\u0002/g, "");
  }

  // Screen-reader labels are comma-separated parts ("Row 3, column 4,
  // White stone, movable"); with opts.segments each part is translated
  // on its own when the whole label isn't known.
  function msgSegments(part, l) {
    const pieces = part.split(", ");
    if (pieces.length < 2) return null;
    let changed = false;
    const out = pieces.map((p) => {
      const tr = msgSentence(p, l);
      if (tr === null) return p;
      changed = true;
      return tr;
    });
    return changed ? out.join(l === "ja" || l === "zh" ? "\u3001" : ", ") : null;
  }

  function msg(text, lang, opts) {
    if (text === null || text === undefined) return "";
    const str = String(text);
    const l = lang || getLang();
    if (!str || l === DEFAULT_LANG || !STRINGS[l]) return str;
    if (!msgIndex) msgIndex = buildMsgIndex();
    const segments = !!(opts && opts.segments);
    // Board games relabel every cell for screen readers after each move
    // (225 on a Gomoku board), mostly with the same few texts. Matching
    // each one against every template again took up to half a second
    // per tap on a slow e-reader, so finished translations are kept.
    const cacheKey = l + (segments ? "|s|" : "|m|") + str;
    const cached = msgCache.get(cacheKey);
    if (cached !== undefined) return cached;
    const s = str.replace(/\u2011/g, "-").trim();
    msgSegmentMode = segments;
    let result;
    try {
      result = msgTranslate(str, s, l, segments);
    } finally {
      msgSegmentMode = false;
    }
    if (msgCache.size >= MSG_CACHE_LIMIT) msgCache.clear();
    msgCache.set(cacheKey, result);
    return result;
  }

  function msgTranslate(str, s, l, segments) {
    const whole = msgSentence(s, l);
    if (whole !== null) return whole;
    const parts = s.replace(/([.!?\u2026])\s+/g, "$1\u0000").split("\u0000");
    if (parts.length < 2 && !segments) return str;
    let changed = false;
    const out = parts.map((part) => {
      let translated = msgSentence(part, l);
      if (translated === null && segments) translated = msgSegments(part, l);
      if (translated === null) return part;
      changed = true;
      return translated;
    });
    if (!changed) return str;
    // Japanese/Chinese sentences end in full-width punctuation and are
    // written without spaces between them.
    const cjk = l === "ja" || l === "zh";
    return out.reduce((acc, part) => {
      if (!acc) return part;
      return acc + (cjk && /[\u3002\uff01\uff1f!?\u2026]$/.test(acc) ? "" : " ") + part;
    }, "");
  }

  // The English original of a text that is already translated into the
  // current language (e.g. a result title a game got from I18n.t()), so
  // English-keyed logic like ResultModal's outcome check still works.
  function sourceText(text, lang) {
    const l = lang || getLang();
    const table = STRINGS[l];
    if (!text || l === DEFAULT_LANG || !table) return text;
    const keys = Object.keys(table);
    for (let i = 0; i < keys.length; i++) {
      if (table[keys[i]] === text && STRINGS[DEFAULT_LANG][keys[i]]) return STRINGS[DEFAULT_LANG][keys[i]];
    }
    return text;
  }

  // Sets a runtime message on an element and remembers the English source,
  // so apply() can re-translate it when the language changes. Any static
  // data-i18n placeholder key is dropped, since it no longer describes
  // what the element shows.
  function setMsg(el, text) {
    if (!el) return;
    const src = text === null || text === undefined ? "" : String(text);
    el.removeAttribute("data-i18n");
    if (src) el.setAttribute("data-i18n-msg", src);
    else el.removeAttribute("data-i18n-msg");
    el.textContent = msg(src);
  }

  // Sets an element's screen-reader label from English text, remembering
  // the source so apply() can re-translate it on a language change.
  function setAria(el, text) {
    if (!el) return;
    const src = text === null || text === undefined ? "" : String(text);
    el.setAttribute("data-i18n-aria", src);
    el.setAttribute("aria-label", msg(src, null, { segments: true }));
  }

  // Switches an element to a different static key (e.g. the menu button's
  // "Menu" / "Close" label) so language changes keep the right text.
  function setKey(el, key) {
    if (!el) return;
    el.removeAttribute("data-i18n-msg");
    el.setAttribute("data-i18n", key);
    el.textContent = t(key);
  }

  // Other scripts (e.g. game-switcher.js) that build their own UI text
  // from translated strings can't rely on data-i18n, since their labels
  // aren't static text nodes. They register here to be told whenever the
  // active language changes, so they can relabel themselves.
  const changeListeners = [];

  function onChange(fn) {
    if (typeof fn === "function") changeListeners.push(fn);
  }

  function apply(lang) {
    const l = lang || getLang();
    if (document.documentElement) {
      document.documentElement.lang = l;
      // Right-to-left languages mirror the page layout; the game boards
      // themselves stay left to right (see style.css, [dir="rtl"]).
      document.documentElement.dir = RTL_LANGUAGES.indexOf(l) !== -1 ? "rtl" : "ltr";
    }

    const rtl = RTL_LANGUAGES.indexOf(l) !== -1;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      // A key unknown even in English (e.g. a rules text whose file could
      // not be loaded) keeps the English text in the markup instead of
      // showing the bare key.
      if (!(STRINGS[DEFAULT_LANG] && STRINGS[DEFAULT_LANG][key] !== undefined) &&
          !(STRINGS[l] && STRINGS[l][key] !== undefined)) return;
      el.textContent = t(key, l);
      // English fallback text inside a right-to-left page (Arabic has no
      // rules pages yet) is marked as such, so it keeps its own direction
      // and punctuation instead of being laid out right to left.
      const fallback = rtl && STRINGS[l] && STRINGS[l][key] === undefined;
      if (fallback) {
        el.setAttribute("dir", "ltr");
        el.setAttribute("lang", DEFAULT_LANG);
        el.setAttribute("data-i18n-fallback", "");
      } else if (el.hasAttribute("data-i18n-fallback")) {
        el.removeAttribute("dir");
        el.removeAttribute("lang");
        el.removeAttribute("data-i18n-fallback");
      }
    });
    // A whole rules/history page in the fallback language reads left to
    // right as one block (its term lists mix symbols and text).
    document.querySelectorAll(".content-page").forEach((page) => {
      const title = page.querySelector("h1[data-i18n]");
      const fallbackPage = !!title && title.hasAttribute("data-i18n-fallback");
      if (fallbackPage) page.setAttribute("dir", "ltr");
      else if (page.getAttribute("dir") === "ltr") page.removeAttribute("dir");
    });

    document.querySelectorAll("[data-i18n-msg]").forEach((el) => {
      el.textContent = msg(el.getAttribute("data-i18n-msg"), l);
    });

    // Static English aria-labels in the page markup (e.g. "Go board") are
    // picked up once, on the first apply, before any script has touched
    // them; labels set later by scripts go through setAria() instead.
    if (!staticAriaCaptured) {
      staticAriaCaptured = true;
      document.querySelectorAll("[aria-label]:not([data-i18n-attr]):not([data-i18n-aria])").forEach((el) => {
        el.setAttribute("data-i18n-aria", el.getAttribute("aria-label"));
      });
    }
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", msg(el.getAttribute("data-i18n-aria"), l, { segments: true }));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      // Format: data-i18n-attr="title:some_key,placeholder:other_key"
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const parts = pair.split(":");
        const attr = parts[0] && parts[0].trim();
        const key = parts[1] && parts[1].trim();
        if (attr && key) el.setAttribute(attr, t(key, l));
      });
    });

    document.querySelectorAll(".lang-switch select.lang-select").forEach((sel) => {
      if (sel.value !== l) sel.value = l;
    });

    changeListeners.forEach((fn) => {
      try {
        fn(l);
      } catch (e) {
        // A listener misbehaving shouldn't break the rest of i18n.
      }
    });

    // A small inline script in each page's <head> hides the page while
    // its static English markup waits for another language (see
    // style.css, .i18n-pending), so an e-ink screen draws it only once.
    if (document.documentElement) document.documentElement.classList.remove("i18n-pending");
  }

  // Directory i18n.js was loaded from, so lang/ resolves the same way
  // from every page.
  const scriptBase = (function () {
    try {
      const src = document.currentScript && document.currentScript.src;
      return src ? src.replace(/[^\/]*$/, "") : "";
    } catch (e) {
      return "";
    }
  })();

  function languageFileUrl(lang) {
    return scriptBase + "lang/" + lang + ".js";
  }

  // Rules/history texts: i18n-text.js for English, lang/<lang>-text.js
  // for the others. Each file calls markTextLoaded() when it has run.
  const textLoaded = {};
  function markTextLoaded(lang) {
    textLoaded[lang] = true;
  }
  function pageNeedsText() {
    return !!(document.documentElement && document.documentElement.hasAttribute("data-i18n-text"));
  }
  function textFileUrl(lang) {
    return lang === DEFAULT_LANG ? scriptBase + "i18n-text.js" : scriptBase + "lang/" + lang + "-text.js";
  }
  function loadScript(src, done) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => done(true);
    script.onerror = () => done(false);
    document.head.appendChild(script);
  }
  // On a page that shows rules/history texts, makes sure they are there
  // for `lang` (and for English, the fallback), then calls done().
  function ensureText(lang, done) {
    if (!pageNeedsText()) { done(); return; }
    const need = [DEFAULT_LANG];
    if (lang !== DEFAULT_LANG) need.push(lang);
    const missing = need.filter((l) => !textLoaded[l] && STRINGS[l]);
    if (!missing.length) { done(); return; }
    let left = missing.length;
    missing.forEach((l) => loadScript(textFileUrl(l), () => { if (--left === 0) done(); }));
  }

  // True once everything this page shows in `lang` is loaded.
  function isReady(lang) {
    if (!STRINGS[lang]) return false;
    if (!pageNeedsText()) return true;
    return !!textLoaded[DEFAULT_LANG] && (lang === DEFAULT_LANG || !!textLoaded[lang]);
  }

  // Loads lang/<lang>.js unless it is already there (plus its rules and
  // history texts on pages that show them), then calls done(ok).
  function loadLanguage(lang, done) {
    if (STRINGS[lang]) { ensureText(lang, () => done(true)); return; }
    loadScript(languageFileUrl(lang), () => {
      if (!STRINGS[lang]) { done(false); return; }
      ensureText(lang, () => done(true));
    });
  }

  function setLang(lang) {
    if (!LANGUAGE_NAMES[lang]) return;
    loadLanguage(lang, (ok) => {
      if (!ok) return; // file unavailable (offline, not cached yet): keep the current language
      safeSet(STORAGE_KEY, lang);
      apply(lang);
    });
  }

  // Builds a single <select> per .lang-switch container, listing every
  // language STRINGS actually has (in LANGUAGE_ORDER, falling back to
  // whatever else might exist) by its own native name. This lives here
  // rather than as static markup in every page so that adding a
  // language is a one-line change to LANGUAGE_NAMES/LANGUAGE_ORDER plus
  // its STRINGS entry - no HTML file needs to change, however many
  // pages there are.
  function buildLangSwitchUI(container, currentLang) {
    container.innerHTML = "";
    const select = document.createElement("select");
    select.className = "lang-select";
    select.setAttribute("aria-label", "Language / Sprache");
    const codes = LANGUAGE_ORDER.slice();
    codes.forEach((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = LANGUAGE_NAMES[code] || code.toUpperCase();
      if (code === currentLang) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => setLang(select.value));
    container.appendChild(select);
  }

  function init() {
    const lang = getLang();
    document.querySelectorAll(".lang-switch").forEach((container) => {
      buildLangSwitchUI(container, lang);
    });
    apply(lang);
  }

  return {
    t: t,
    msg: msg,
    setAria: setAria,
    sourceText: sourceText,
    setMsg: setMsg,
    setKey: setKey,
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    init: init,
    onChange: onChange,
    languages: LANGUAGE_ORDER.slice(),
    languageFileUrl: languageFileUrl,
    textFileUrl: textFileUrl,
    markTextLoaded: markTextLoaded,
    pageNeedsText: pageNeedsText,
    isReady: isReady,
    languageName: (code) => LANGUAGE_NAMES[code] || code.toUpperCase()
  };
})();

if (typeof window !== "undefined") {
  window.I18n = I18n;
  // The active language has to be there before the scripts after this one
  // run and before the first paint, or an e-ink screen would draw the page
  // in English and then redraw it. A parser-inserted script is the only
  // way to load it synchronously without a build step, so it is written
  // into the document right here and runs directly after i18n.js.
  // Rules and history pages (<html data-i18n-text>) get their text files
  // the same way, right after the language file.
  (function () {
    const lang = I18n.getLang();
    if (document.readyState !== "loading") return;
    const text = I18n.pageNeedsText();
    if (text) document.write('<script src="' + I18n.textFileUrl("en") + '"><\/script>');
    if (lang !== "en" && !STRINGS[lang]) {
      document.write('<script src="' + I18n.languageFileUrl(lang) + '"><\/script>');
    }
    if (text && lang !== "en") {
      document.write('<script src="' + I18n.textFileUrl(lang) + '"><\/script>');
    }
  })();
  document.addEventListener("DOMContentLoaded", () => {
    I18n.init();
    // Fallback in case the synchronous load above could not run: load the
    // missing files now and switch over once they are there.
    const lang = I18n.getLang();
    if (!I18n.isReady(lang)) I18n.setLang(lang);
  });
}
