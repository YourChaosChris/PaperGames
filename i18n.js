// i18n.js
// Minimal, dependency-free i18n. Adding a language later means adding one
// object to STRINGS below - no other code needs to change. Missing keys in
// a non-English language fall back to English rather than showing nothing.

const STRINGS = {
  en: {
    nav_home: "Home",
    nav_play: "Play",
    nav_rules: "Rules",
    nav_guide: "Guide",
    nav_about: "About",

    home_tagline: "Chess, built for e-readers.",
    home_intro: "A small, dependency-free chess app made for E-Ink displays like Tolino, Kobo and Kindle: high contrast, no animations, and it keeps working with no internet connection once you've opened it.",
    home_play_button: "▶ Choose a game",
    home_play_desc: "Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_rules_desc: "How the pieces move, check, castling, and the draw rules.",
    home_guide_desc: "Get it onto your e-reader and keep it working offline.",
    home_about_desc: "Why this exists, and how to say thanks.",
    home_games_title: "Choose a game",
    home_chess_desc: "The classic game. Local 2-player, vs. the built-in engine, or online via Lichess.",
    home_go_desc: "The ancient territory game. Local 2-player or vs. the built-in engine, three board sizes, three difficulty levels.",
    home_checkers_desc: "The classic jump-and-capture game. Local 2-player or vs. the built-in engine, three difficulty levels.",
    home_ur_desc: "A 4,600-year-old race game rediscovered from ancient Mesopotamia. Local 2-player or vs. the built-in engine, with rosette squares and capture-by-landing.",
    home_morris_desc: "A centuries-old strategy game of placing and sliding pieces to form mills. Local 2-player or vs. the built-in engine, with the classic flying endgame rule.",
    home_backgammon_desc: "The classic dice race game. Local 2-player or vs. the built-in engine, with the bar, bearing off, and blot-hitting.",
    home_xiangqi_desc: "Chinese chess: generals, elephants, cannons and more on a 9x10 grid. Local 2-player or vs. the built-in engine, with a toggle between classic characters and Western-style symbols.",
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

    xiangqi_style_show_symbols: "Switch to symbols",
    xiangqi_style_show_classic: "Switch to characters",

    chess_piece_pawn: "Pawn",
    chess_piece_knight: "Knight",
    chess_piece_bishop: "Bishop",
    chess_piece_rook: "Rook",
    chess_piece_queen: "Queen",
    chess_piece_king: "King",
    chess_term_castling: "Castling",
    chess_term_en_passant: "En passant",
    chess_term_promotion: "Promotion",
    chess_term_checkmate: "Checkmate",
    chess_term_stalemate: "Stalemate",
    chess_term_threefold: "Threefold repetition",
    chess_term_fifty_move: "Fifty-move rule",
    chess_term_insufficient: "Insufficient material",

    chess_rules_title: "Chess Rules",
    chess_rules_intro: "A quick reference for how eInkChess plays the game - useful if you're rusty, or learning.",
    chess_rules_movement_title: "How the pieces move",
    chess_rules_pawn: "One square forward (two from its starting square), captures one square diagonally forward. Reaching the far side promotes it to any other piece (eInkChess always promotes to a queen).",
    chess_rules_knight: "Moves in an L-shape (two squares one way, one square perpendicular) and is the only piece that can jump over others.",
    chess_rules_bishop: "Any number of squares diagonally. Stays on one square color for the whole game.",
    chess_rules_rook: "Any number of squares horizontally or vertically.",
    chess_rules_queen: "Any number of squares in any direction - combines the rook and bishop.",
    chess_rules_king: "One square in any direction. Can never move into check.",
    chess_rules_special_title: "Special moves",
    chess_rules_castling: "The king moves two squares toward a rook, and that rook jumps to the square beside the king. Only if neither piece has moved yet, the squares between them are empty, and the king isn't in, through, or ending in check.",
    chess_rules_en_passant: "If an enemy pawn advances two squares and lands beside yours, your pawn may capture it as if it had only moved one square - but only immediately on the next move.",
    chess_rules_promotion: "A pawn reaching the last rank becomes another piece, almost always a queen.",
    chess_rules_end_title: "How a game ends",
    chess_rules_checkmate: "The king is in check with no legal move to escape it. That side loses.",
    chess_rules_stalemate: "The side to move has no legal move and isn't in check. The game is a draw.",
    chess_rules_draws_title: "Draws by rule",
    chess_rules_threefold: "The exact same position occurs three times.",
    chess_rules_fifty_move: "Fifty moves pass (by both sides) with no pawn move and no capture.",
    chess_rules_insufficient: "Neither side has enough pieces left to possibly checkmate (e.g. king vs. king, or king and bishop vs. king).",

    go_rules_title: "Go Rules",
    go_rules_intro: "A quick reference for how eInkChess plays Go - useful if you're rusty, or learning.",
    go_rules_basics_title: "The basic idea",
    go_term_stones: "Stones",
    go_rules_stones: "Black and White place stones on empty intersections in turn, starting with Black. Stones never move once placed - the board fills up rather than pieces sliding around.",
    go_term_liberties: "Liberties",
    go_rules_liberties: "A stone's liberties are the empty points directly next to it (up/down/left/right, not diagonally). Connected stones of the same color share their liberties as one group.",
    go_term_capture: "Capture",
    go_rules_capture: "A group with no liberties left is captured and removed from the board immediately after the opponent's move.",
    go_rules_illegal_title: "Illegal moves",
    go_term_suicide: "Suicide",
    go_rules_suicide: "You may not play a stone that would leave your own group with zero liberties, unless doing so captures enough enemy stones to free it first.",
    go_term_ko: "Ko",
    go_rules_ko: "You may not immediately recapture a single stone in a way that would recreate the position from just before your opponent's last move - you must play elsewhere first.",
    go_rules_end_title: "How a game ends",
    go_term_passing: "Passing",
    go_rules_passing: "Either player may pass instead of placing a stone. When both players pass one after another, the game ends and is scored.",
    go_term_scoring: "Scoring",
    go_rules_scoring: "eInkChess uses area scoring: your score is your own stones on the board plus empty points surrounded only by your stones. Points bordering both colors count for neither side.",
    go_term_komi: "Komi",
    go_rules_komi: "White moves second, so White gets a fixed bonus (komi, 7.5 points in eInkChess) to balance that disadvantage. Ties are therefore impossible.",
    go_term_resignation: "Resignation",
    go_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    checkers_rules_title: "Checkers Rules",
    checkers_rules_intro: "A quick reference for how eInkChess plays checkers (English draughts) - useful if you're rusty, or learning.",
    checkers_rules_basics_title: "The basic idea",
    checkers_term_men: "Men",
    checkers_rules_men: "Black and White each start with 12 men on the dark squares of their own three back rows, and move diagonally forward one square at a time, alternating turns, Black first.",
    checkers_term_kings: "Kings",
    checkers_rules_kings: "A man reaching the far back row becomes a king. Kings move diagonally in any direction, still one square at a time.",
    checkers_rules_capture_title: "Capturing",
    checkers_term_capture: "Capturing",
    checkers_rules_capture: "Capture by jumping diagonally over an adjacent enemy piece into the empty square immediately beyond it, removing the jumped piece.",
    checkers_term_mandatory: "Mandatory capture",
    checkers_rules_mandatory: "If any capture is available, you must take one - a quiet move is illegal while a capture exists. You may choose which piece captures if more than one can.",
    checkers_term_multijump: "Multi-jump chains",
    checkers_rules_multijump: "If capturing lands you where another capture is immediately available with the same piece, you must continue jumping with it until no further capture is possible. Landing on the back row promotes the piece and ends its turn immediately, even mid-chain.",
    checkers_rules_end_title: "How a game ends",
    checkers_term_win: "Winning",
    checkers_rules_win: "You win when your opponent has no pieces left, or no legal move available on their turn.",
    checkers_term_resignation: "Resignation",
    checkers_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",
    checkers_term_draw: "Draw",
    checkers_rules_draw: "If 40 moves pass in a row with no capture by either side, the game is a draw.",

    ur_tray_start: "Start",
    ur_tray_home: "Home",
    ur_roll_dice: "Roll dice",

    ur_rules_title: "Royal Game of Ur Rules",
    ur_rules_intro: "A quick reference for eInkChess's version of the 4,600-year-old Mesopotamian race game, using the modern reconstructed ruleset (based on Irving Finkel's work with the British Museum's original board).",
    ur_rules_basics_title: "The basic idea",
    ur_term_pieces: "Pieces and the path",
    ur_rules_pieces: "Each player has 7 pieces and races them along their own 14-square path: 4 private squares, then 8 shared squares in the middle that both players cross, then 2 more private squares before bearing off. A piece must leave the board with an exact roll - overshooting is not allowed.",
    ur_term_dice: "Dice",
    ur_rules_dice: "Four two-sided (binary) dice are rolled together each turn, giving a total of 0 to 4. A roll of 0 means no piece can move and the turn passes. If a legal move exists, you must make one.",
    ur_term_rosette: "Rosettes",
    ur_rules_rosette: "Three of your fourteen squares - the 4th, the middle (8th) shared square, and the 14th - are rosettes. Landing on one is always safe from capture and grants an extra roll immediately.",
    ur_rules_capture_title: "Capturing",
    ur_term_capture: "Capturing",
    ur_rules_capture: "On the shared middle lane, landing exactly on a square occupied by an opponent's piece sends it back to their start, unless that square is the middle rosette (always safe). Pieces on private squares can never be captured.",
    ur_rules_end_title: "How a game ends",
    ur_term_win: "Winning",
    ur_rules_win: "The first player to bring all 7 of their pieces all the way home wins.",
    ur_term_resignation: "Resignation",
    ur_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    morris_rules_title: "Nine Men's Morris Rules",
    morris_rules_intro: "A quick reference for how eInkChess plays Nine Men's Morris (Mühle) - useful if you're rusty, or learning.",
    morris_rules_basics_title: "The basic idea",
    morris_term_board: "The board",
    morris_rules_board: "24 points arranged as three nested squares connected by lines at their midpoints. Each player has 9 pieces. The game has two phases: first placing all your pieces one at a time, then sliding a piece to an adjacent empty point each turn.",
    morris_term_mill: "Mills",
    morris_rules_mill: "A mill is three of your pieces in a row along a drawn line. Completing one - while placing or later while moving - lets you immediately remove one opposing piece from the board.",
    morris_term_protected: "Protected pieces",
    morris_rules_protected: "You may not remove a piece that's part of an opponent's own mill, unless every one of their pieces is currently in a mill.",
    morris_rules_flying_title: "The flying rule",
    morris_term_flying: "Flying",
    morris_rules_flying: "Once a player is reduced to exactly 3 pieces on the board, those pieces may move to any empty point instead of only an adjacent one.",
    morris_rules_end_title: "How a game ends",
    morris_term_win: "Winning",
    morris_rules_win: "You win when your opponent is reduced to two pieces, or has no legal move on their turn.",
    morris_term_resignation: "Resignation",
    morris_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    backgammon_tray_bar: "Bar",
    backgammon_tray_off: "Off",

    backgammon_rules_title: "Backgammon Rules",
    backgammon_rules_intro: "A quick reference for how eInkChess plays backgammon - useful if you're rusty, or learning. This app doesn't use a doubling cube; every game is played for a single point.",
    backgammon_rules_basics_title: "The basic idea",
    backgammon_term_pieces: "Checkers and the board",
    backgammon_rules_pieces: "Each player has 15 checkers on a 24-point board. Black moves from point 1 toward point 24, White from point 24 toward point 1 - each racing all their checkers into their own home board and then off it.",
    backgammon_term_dice: "Dice",
    backgammon_rules_dice: "Two dice are rolled each turn, giving two moves of those numbers; rolling doubles gives four moves of that number instead. Every die that can legally be played must be played.",
    backgammon_term_blocking: "Blocking and hitting",
    backgammon_rules_blocking: "A point held by two or more of an opponent's checkers is blocked. A point held by exactly one (a \"blot\") can be landed on, sending it to the bar - it must re-enter through the opponent's home board before that player can make any other move.",
    backgammon_rules_end_title: "Bearing off and winning",
    backgammon_term_bearoff: "Bearing off",
    backgammon_rules_bearoff: "Once all 15 of your checkers are in your home board, you may start bearing them off: a roll matching a checker's point removes it, and a roll higher than any occupied point may remove the furthest checker instead.",
    backgammon_term_win: "Winning",
    backgammon_rules_win: "The first player to bear off all 15 checkers wins.",
    backgammon_term_resignation: "Resignation",
    backgammon_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    xiangqi_rules_title: "Xiangqi Rules",
    xiangqi_rules_intro: "A quick reference for how eInkChess plays Xiangqi (Chinese Chess) - useful if you're rusty, or learning. Red moves first, unlike the other games here.",
    xiangqi_rules_basics_title: "The board",
    xiangqi_term_board: "Points, the river and the palace",
    xiangqi_rules_board: "Pieces sit on the 90 intersections of a 9x10 grid, not in squares. A river runs between the two halves, and each side has a 3x3 palace where its General and Advisors must stay.",
    xiangqi_term_style: "Piece style",
    xiangqi_rules_style: "Use the button above the board to switch between each piece's traditional Chinese character and a Western chess-style symbol - handy if your device can't display the Chinese characters clearly.",
    xiangqi_rules_pieces_title: "How the pieces move",
    xiangqi_term_general: "General",
    xiangqi_rules_general: "Moves one point orthogonally, and must never leave the palace. Two Generals may never face each other on a fully open file.",
    xiangqi_term_advisor: "Advisor",
    xiangqi_rules_advisor: "Moves one point diagonally, and must stay inside the palace.",
    xiangqi_term_elephant: "Elephant",
    xiangqi_rules_elephant: "Moves exactly two points diagonally, can never cross the river, and is blocked if the point directly between is occupied.",
    xiangqi_term_horse: "Horse",
    xiangqi_rules_horse: "Moves one point orthogonally then one point diagonally outward (like a knight), but is blocked if the first, orthogonal point is occupied.",
    xiangqi_term_chariot: "Chariot",
    xiangqi_rules_chariot: "Moves any distance orthogonally, like a rook, and cannot jump over other pieces.",
    xiangqi_term_cannon: "Cannon",
    xiangqi_rules_cannon: "Moves like a chariot when not capturing. To capture, it must jump over exactly one piece (of either side) and land on an enemy piece just beyond it.",
    xiangqi_term_soldier: "Soldier",
    xiangqi_rules_soldier: "Moves one point forward only until it crosses the river; afterwards it may also move one point sideways, but never backward.",
    xiangqi_rules_end_title: "How a game ends",
    xiangqi_term_win: "Winning",
    xiangqi_rules_win: "You win by checkmating the opponent's General, or if the opponent has no legal move on their turn at all - unlike international chess, that also counts as a loss, not a draw.",
    xiangqi_term_resignation: "Resignation",
    xiangqi_rules_resignation: "A player can resign at any time, ending the game immediately in the opponent's favor.",

    back_home: "← Back to home",

    guide_title: "Guide: eInkChess on your device",
    guide_intro: "Three ways to get eInkChess onto an e-reader, roughly from easiest to most manual.",
    guide_web_title: "1. Just open it in the browser",
    guide_web_body: "Open this same web address in your e-reader's browser and bookmark it. After the first visit, eInkChess caches itself for offline use automatically - close the WiFi and it keeps working. The only exception is Chess's online Lichess mode, which needs an actual connection; every other game here is offline-only and unaffected.",
    guide_pwa_title: "2. Add it to the home screen",
    guide_pwa_body: "If your e-reader's browser offers “Add to Home Screen” or “Install app”, use it. eInkChess then opens like a regular app, full-screen, without browser chrome around it.",
    guide_sideload_title: "3. Sideload via USB",
    guide_sideload_body: "Copy all the app's files onto the device over USB and open index.html directly from local storage (a file:// address). Offline play works exactly the same way. The one thing that doesn't work over file:// is Lichess login (OAuth requires a real http/https address) - local 2-player and vs-computer modes are unaffected in every game here.",
    guide_offline_title: "What works offline",
    guide_offline_body: "Everything except Chess's online Lichess games: local 2-player and the built-in computer opponent at every level, in every game here, run entirely on the device with no server involved.",

    about_intro: "I searched for a simple chess game for my eReader — but all I found were people searching, not playing. So I built my own. That’s how eInkChess was born, and I’m happy to share it with everyone. It has since grown into a small collection of E-Ink-friendly board games, with more planned.",
    about_donate_intro: "If you enjoy eInkChess or have ideas for improvements, you can send feedback and support the project here:",
    about_donate_button: "Buy me a coffee ☕",
    about_qr_text: "Or scan this QR code to open the donation page on your phone:",
    about_credits: "Chess piece set (“cburnett”) by Colin M.L. Burnett, used under the BSD license.",
    about_back: "← Back to the board"
  },
  de: {
    nav_home: "Start",
    nav_play: "Spielen",
    nav_rules: "Regeln",
    nav_guide: "Anleitung",
    nav_about: "Über",

    home_tagline: "Schach, gemacht für E-Reader.",
    home_intro: "Eine kleine Schach-App ohne Abhängigkeiten, gebaut für E-Ink-Displays wie Tolino, Kobo und Kindle: hoher Kontrast, keine Animationen, und funktioniert nach dem ersten Öffnen auch ohne Internetverbindung weiter.",
    home_play_button: "▶ Spiel wählen",
    home_play_desc: "Lokal zu zweit, gegen die eingebaute KI, oder online via Lichess.",
    home_rules_desc: "Wie die Figuren ziehen, Schach, Rochade und die Remis-Regeln.",
    home_guide_desc: "So kommt es auf deinen E-Reader und bleibt offline nutzbar.",
    home_about_desc: "Warum es das gibt, und wie man Danke sagen kann.",
    home_games_title: "Spiel wählen",
    home_chess_desc: "Der Klassiker. Lokal zu zweit, gegen die eingebaute KI, oder online via Lichess.",
    home_go_desc: "Das uralte Gebietsspiel. Lokal zu zweit oder gegen die eingebaute KI, drei Brettgrößen, drei Schwierigkeitsstufen.",
    home_checkers_desc: "Der Klassiker aus Springen und Schlagen. Lokal zu zweit oder gegen die eingebaute KI, drei Schwierigkeitsstufen.",
    home_ur_desc: "Ein 4600 Jahre altes Wettlaufspiel aus dem alten Mesopotamien. Lokal zu zweit oder gegen die eingebaute KI, mit Rosetten-Feldern und Schlagen durch Landen.",
    home_morris_desc: "Ein jahrhundertealtes Strategiespiel: Steine setzen und schieben, um Mühlen zu bilden. Lokal zu zweit oder gegen die eingebaute KI, mit der klassischen Spring-Regel im Endspiel.",
    home_backgammon_desc: "Der Klassiker unter den Würfelspielen. Lokal zu zweit oder gegen die eingebaute KI, mit Bar, Auswürfeln und Schlagen einzelner Steine.",
    home_xiangqi_desc: "Chinesisches Schach: General, Elefant, Kanone und mehr auf einem 9x10-Gitter. Lokal zu zweit oder gegen die eingebaute KI, mit Umschalter zwischen klassischen Zeichen und westlichen Symbolen.",
    game_chess: "Schach",
    game_go: "Go",
    game_checkers: "Dame",
    game_ur: "Ur",
    game_ur_full: "Königliches Spiel von Ur",
    game_morris: "Mühle",
    game_morris_full: "Mühle (Nine Men's Morris)",
    game_backgammon: "Backgammon",
    game_xiangqi: "Xiangqi (Chinesisches Schach)",
    game_xiangqi_short: "Xiangqi",

    xiangqi_style_show_symbols: "Symbole anzeigen",
    xiangqi_style_show_classic: "Zeichen anzeigen",

    chess_piece_pawn: "Bauer",
    chess_piece_knight: "Springer",
    chess_piece_bishop: "Läufer",
    chess_piece_rook: "Turm",
    chess_piece_queen: "Dame",
    chess_piece_king: "König",
    chess_term_castling: "Rochade",
    chess_term_en_passant: "En passant",
    chess_term_promotion: "Bauernumwandlung",
    chess_term_checkmate: "Schachmatt",
    chess_term_stalemate: "Patt",
    chess_term_threefold: "Dreifache Stellungswiederholung",
    chess_term_fifty_move: "50-Züge-Regel",
    chess_term_insufficient: "Unzureichendes Material",

    chess_rules_title: "Schachregeln",
    chess_rules_intro: "Eine kurze Übersicht, wie eInkChess Schach spielt – nützlich zum Auffrischen oder Lernen.",
    chess_rules_movement_title: "Wie die Figuren ziehen",
    chess_rules_pawn: "Ein Feld vorwärts (vom Startfeld aus zwei), schlägt ein Feld diagonal vorwärts. Erreicht er die gegnüberliegende Grundreihe, wird er umgewandelt (eInkChess wandelt immer in eine Dame um).",
    chess_rules_knight: "Zieht im L-Muster (zwei Felder in eine Richtung, ein Feld quer dazu) und ist die einzige Figur, die andere überspringen kann.",
    chess_rules_bishop: "Beliebig viele Felder diagonal. Bleibt das ganze Spiel über auf einer Feldfarbe.",
    chess_rules_rook: "Beliebig viele Felder waagerecht oder senkrecht.",
    chess_rules_queen: "Beliebig viele Felder in jede Richtung – vereint Turm und Läufer.",
    chess_rules_king: "Ein Feld in jede Richtung. Darf sich nie ins Schach ziehen.",
    chess_rules_special_title: "Sonderzüge",
    chess_rules_castling: "Der König zieht zwei Felder auf einen Turm zu, dieser Turm springt auf das Feld daneben. Nur möglich, wenn beide Figuren noch nicht gezogen haben, die Felder dazwischen frei sind und der König weder im Schach steht noch durch ein bedrohtes Feld zieht oder im Schach landet.",
    chess_rules_en_passant: "Zieht ein gegnerischer Bauer zwei Felder vor und landet neben deinem, darfst du ihn so schlagen, als wäre er nur ein Feld gezogen – aber nur direkt im nächsten Zug.",
    chess_rules_promotion: "Ein Bauer, der die letzte Reihe erreicht, wird zu einer anderen Figur, fast immer einer Dame.",
    chess_rules_end_title: "Wie eine Partie endet",
    chess_rules_checkmate: "Der König steht im Schach und es gibt keinen legalen Zug, das zu ändern. Diese Seite verliert.",
    chess_rules_stalemate: "Die Seite am Zug hat keinen legalen Zug und steht nicht im Schach. Die Partie ist remis.",
    chess_rules_draws_title: "Remis nach Regel",
    chess_rules_threefold: "Die exakt gleiche Stellung tritt dreimal auf.",
    chess_rules_fifty_move: "50 Züge (beider Seiten) vergehen ohne Bauernzug und ohne Schlagen.",
    chess_rules_insufficient: "Keine Seite hat noch genug Material, um überhaupt matt setzen zu können (z. B. König gegen König, oder König und Läufer gegen König).",

    go_rules_title: "Go-Regeln",
    go_rules_intro: "Eine kurze Übersicht, wie eInkChess Go spielt – nützlich zum Auffrischen oder Lernen.",
    go_rules_basics_title: "Die Grundidee",
    go_term_stones: "Steine",
    go_rules_stones: "Schwarz und Weiß setzen abwechselnd Steine auf freie Schnittpunkte, Schwarz beginnt. Steine bewegen sich nie – das Brett füllt sich, statt dass Figuren verschoben werden.",
    go_term_liberties: "Freiheiten",
    go_rules_liberties: "Die Freiheiten eines Steins sind die direkt angrenzenden freien Punkte (oben/unten/links/rechts, nicht diagonal). Verbundene Steine derselben Farbe teilen sich ihre Freiheiten als eine Gruppe.",
    go_term_capture: "Schlagen",
    go_rules_capture: "Eine Gruppe ohne verbleibende Freiheiten wird sofort nach dem gegnerischen Zug geschlagen und vom Brett entfernt.",
    go_rules_illegal_title: "Verbotene Züge",
    go_term_suicide: "Selbstmordzug",
    go_rules_suicide: "Du darfst keinen Stein setzen, der die eigene Gruppe ohne Freiheiten zurücklässt – außer der Zug schlägt zuerst genug gegnerische Steine, um sie zu befreien.",
    go_term_ko: "Ko",
    go_rules_ko: "Du darfst einen einzelnen Stein nicht sofort so zurückschlagen, dass die Stellung von vor dem letzten gegnerischen Zug wiederhergestellt würde – du musst zuerst woanders ziehen.",
    go_rules_end_title: "Wie eine Partie endet",
    go_term_passing: "Passen",
    go_rules_passing: "Jeder Spieler kann passen, statt einen Stein zu setzen. Passen beide Spieler nacheinander, endet die Partie und wird gewertet.",
    go_term_scoring: "Wertung",
    go_rules_scoring: "eInkChess nutzt die Gebietszählung (chinesische Zählweise): Der Punktestand ist die Anzahl eigener Steine auf dem Brett plus freie Punkte, die nur von eigenen Steinen umgeben sind. Punkte, die an beide Farben grenzen, zählen für keine Seite.",
    go_term_komi: "Komi",
    go_rules_komi: "Weiß zieht als Zweiter, deshalb bekommt Weiß einen festen Ausgleichsbonus (Komi, in eInkChess 7,5 Punkte). Unentschieden sind dadurch unmöglich.",
    go_term_resignation: "Aufgabe",
    go_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    checkers_rules_title: "Dame-Regeln",
    checkers_rules_intro: "Eine kurze Übersicht, wie eInkChess Dame (nach englischen/amerikanischen Regeln) spielt – nützlich zum Auffrischen oder Lernen.",
    checkers_rules_basics_title: "Die Grundidee",
    checkers_term_men: "Steine",
    checkers_rules_men: "Schwarz und Weiß starten mit je 12 Steinen auf den dunklen Feldern ihrer eigenen drei hinteren Reihen und ziehen abwechselnd ein Feld diagonal vorwärts, Schwarz beginnt.",
    checkers_term_kings: "Damen",
    checkers_rules_kings: "Ein Stein, der die gegnerische Grundreihe erreicht, wird zur Dame. Damen ziehen diagonal in jede Richtung, weiterhin ein Feld pro Zug.",
    checkers_rules_capture_title: "Schlagen",
    checkers_term_capture: "Schlagen",
    checkers_rules_capture: "Geschlagen wird, indem man diagonal über einen angrenzenden gegnerischen Stein auf das direkt dahinterliegende freie Feld springt; der übersprungene Stein wird entfernt.",
    checkers_term_mandatory: "Schlagzwang",
    checkers_rules_mandatory: "Ist ein Schlagzug möglich, muss geschlagen werden – ein normaler Zug ist dann nicht erlaubt. Sind mehrere Schlagzüge möglich, darf frei gewählt werden, welcher Stein schlägt.",
    checkers_term_multijump: "Mehrfachschlagen",
    checkers_rules_multijump: "Landet ein Stein nach dem Schlagen auf einem Feld, von dem aus sofort ein weiterer Schlag mit demselben Stein möglich ist, muss weitergeschlagen werden, bis kein Schlag mehr möglich ist. Erreicht der Stein dabei die gegnerische Grundreihe, wird er sofort zur Dame befördert und der Zug endet – auch mitten in einer Schlagserie.",
    checkers_rules_end_title: "Wie eine Partie endet",
    checkers_term_win: "Gewinnen",
    checkers_rules_win: "Du gewinnst, wenn der Gegner keine Steine mehr hat oder am Zug keinen legalen Zug mehr machen kann.",
    checkers_term_resignation: "Aufgabe",
    checkers_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",
    checkers_term_draw: "Remis",
    checkers_rules_draw: "Vergehen 40 Züge in Folge ohne Schlagen einer Seite, endet die Partie remis.",

    ur_tray_start: "Start",
    ur_tray_home: "Ziel",
    ur_roll_dice: "Würfeln",

    ur_rules_title: "Regeln: Königliches Spiel von Ur",
    ur_rules_intro: "Eine kurze Übersicht über eInkChess' Version des 4600 Jahre alten mesopotamischen Wettlaufspiels, nach dem modernen, rekonstruierten Regelwerk (basierend auf Irving Finkels Arbeit mit dem originalen Brett des British Museum).",
    ur_rules_basics_title: "Die Grundidee",
    ur_term_pieces: "Steine und der Weg",
    ur_rules_pieces: "Jeder Spieler hat 7 Steine und lässt sie über einen eigenen 14-Felder-Weg laufen: 4 private Felder, dann 8 gemeinsame Felder in der Mitte, die beide Spieler durchqueren, dann noch 2 private Felder, bevor der Stein das Brett verlässt. Ein Stein muss das Brett mit einer exakten Augenzahl verlassen – zu viele Augen sind nicht erlaubt.",
    ur_term_dice: "Würfel",
    ur_rules_dice: "Jeden Zug werden vier zweiseitige (binäre) Würfel zusammen geworfen, macht insgesamt 0 bis 4. Bei einer 0 kann kein Stein ziehen und der Zug geht an den Gegner. Gibt es einen legalen Zug, muss gezogen werden.",
    ur_term_rosette: "Rosetten",
    ur_rules_rosette: "Drei deiner vierzehn Felder – das 4., das mittlere (8.) gemeinsame Feld und das 14. – sind Rosetten. Wer dort landet, ist immer sicher vor dem Schlagen und würfelt sofort noch einmal.",
    ur_rules_capture_title: "Schlagen",
    ur_term_capture: "Schlagen",
    ur_rules_capture: "Auf der gemeinsamen mittleren Bahn wird ein gegnerischer Stein zurück an dessen Start geschickt, wenn man genau auf sein Feld zieht – außer auf der mittleren Rosette, die immer sicher ist. Steine auf privaten Feldern können nie geschlagen werden.",
    ur_rules_end_title: "Wie eine Partie endet",
    ur_term_win: "Gewinnen",
    ur_rules_win: "Wer als Erster alle 7 Steine vollständig ins Ziel bringt, gewinnt.",
    ur_term_resignation: "Aufgabe",
    ur_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    morris_rules_title: "Mühle-Regeln",
    morris_rules_intro: "Eine kurze Übersicht, wie eInkChess Mühle spielt – nützlich zum Auffrischen oder Lernen.",
    morris_rules_basics_title: "Die Grundidee",
    morris_term_board: "Das Brett",
    morris_rules_board: "24 Punkte, angeordnet als drei ineinander liegende Quadrate, verbunden durch Linien an ihren Mittelpunkten. Jeder Spieler hat 9 Steine. Das Spiel hat zwei Phasen: erst werden alle Steine nacheinander gesetzt, danach zieht man pro Zug einen Stein auf einen benachbarten freien Punkt.",
    morris_term_mill: "Mühlen",
    morris_rules_mill: "Eine Mühle sind drei eigene Steine in einer Reihe entlang einer eingezeichneten Linie. Wer eine Mühle schließt – beim Setzen oder später beim Ziehen – darf sofort einen gegnerischen Stein vom Brett nehmen.",
    morris_term_protected: "Geschützte Steine",
    morris_rules_protected: "Ein Stein, der Teil einer gegnerischen Mühle ist, darf nicht entfernt werden – außer alle gegnerischen Steine stehen gerade in Mühlen.",
    morris_rules_flying_title: "Die Sprung-Regel",
    morris_term_flying: "Springen",
    morris_rules_flying: "Ist ein Spieler auf genau 3 Steine reduziert, dürfen diese Steine auf jeden freien Punkt springen, nicht nur auf einen benachbarten.",
    morris_rules_end_title: "Wie eine Partie endet",
    morris_term_win: "Gewinnen",
    morris_rules_win: "Du gewinnst, wenn der Gegner auf zwei Steine reduziert ist oder am Zug keinen legalen Zug mehr machen kann.",
    morris_term_resignation: "Aufgabe",
    morris_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    backgammon_tray_bar: "Bar",
    backgammon_tray_off: "Raus",

    backgammon_rules_title: "Backgammon-Regeln",
    backgammon_rules_intro: "Eine kurze Übersicht, wie eInkChess Backgammon spielt – nützlich zum Auffrischen oder Lernen. Diese App verwendet keinen Verdopplungswürfel; jede Partie zählt einen Punkt.",
    backgammon_rules_basics_title: "Die Grundidee",
    backgammon_term_pieces: "Steine und das Brett",
    backgammon_rules_pieces: "Jeder Spieler hat 15 Steine auf einem Brett mit 24 Punkten. Schwarz zieht von Punkt 1 Richtung Punkt 24, Weiß von Punkt 24 Richtung Punkt 1 – jeder bringt seine Steine ins eigene Zielfeld (Home) und dann hinaus.",
    backgammon_term_dice: "Würfel",
    backgammon_rules_dice: "Jeden Zug werden zwei Würfel geworfen, das ergibt zwei Teilzüge mit diesen Augenzahlen; bei einem Pasch (gleiche Zahl) gibt es stattdessen vier Teilzüge mit dieser Zahl. Jeder Würfel, der legal gespielt werden kann, muss gespielt werden.",
    backgammon_term_blocking: "Blockieren und Schlagen",
    backgammon_rules_blocking: "Ein Punkt mit zwei oder mehr gegnerischen Steinen ist blockiert. Ein Punkt mit genau einem Stein (ein „Blot“) darf betreten werden, wodurch dieser auf die Bar geschickt wird – er muss durch das gegnerische Zielfeld wieder ins Spiel kommen, bevor dieser Spieler einen anderen Zug machen darf.",
    backgammon_rules_end_title: "Auswürfeln und Gewinnen",
    backgammon_term_bearoff: "Auswürfeln",
    backgammon_rules_bearoff: "Sobald alle 15 eigenen Steine im Zielfeld sind, darf man sie auswürfeln: Eine Augenzahl, die genau zum Punkt eines Steins passt, entfernt ihn; eine höhere Augenzahl als jeder besetzte Punkt darf stattdessen den am weitesten entfernten Stein entfernen.",
    backgammon_term_win: "Gewinnen",
    backgammon_rules_win: "Wer als Erster alle 15 Steine ausgewürfelt hat, gewinnt.",
    backgammon_term_resignation: "Aufgabe",
    backgammon_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    xiangqi_rules_title: "Xiangqi-Regeln",
    xiangqi_rules_intro: "Eine kurze Übersicht, wie eInkChess Xiangqi (Chinesisches Schach) spielt – nützlich zum Auffrischen oder Lernen. Anders als bei den anderen Spielen hier zieht Rot zuerst.",
    xiangqi_rules_basics_title: "Das Brett",
    xiangqi_term_board: "Punkte, der Fluss und der Palast",
    xiangqi_rules_board: "Die Steine stehen auf den 90 Schnittpunkten eines 9x10-Gitters, nicht auf Feldern. Ein Fluss trennt die beiden Hälften, und jede Seite hat einen 3x3-Palast, in dem General und Berater bleiben müssen.",
    xiangqi_term_style: "Figurenstil",
    xiangqi_rules_style: "Mit dem Button über dem Brett kannst du zwischen dem traditionellen chinesischen Schriftzeichen jeder Figur und einem westlichen Schach-Symbol wechseln – praktisch, falls dein Gerät die chinesischen Zeichen nicht sauber darstellen kann.",
    xiangqi_rules_pieces_title: "Wie die Figuren ziehen",
    xiangqi_term_general: "General",
    xiangqi_rules_general: "Zieht ein Feld orthogonal und darf den Palast nie verlassen. Zwei Generäle dürfen sich nie auf einer komplett freien Linie gegenüberstehen.",
    xiangqi_term_advisor: "Berater",
    xiangqi_rules_advisor: "Zieht ein Feld diagonal und muss im Palast bleiben.",
    xiangqi_term_elephant: "Elefant",
    xiangqi_rules_elephant: "Zieht genau zwei Felder diagonal, darf den Fluss nie überqueren und ist blockiert, wenn das Feld genau dazwischen besetzt ist.",
    xiangqi_term_horse: "Pferd",
    xiangqi_rules_horse: "Zieht ein Feld orthogonal und dann ein Feld diagonal nach außen (wie ein Springer), ist aber blockiert, wenn das erste, orthogonale Feld besetzt ist.",
    xiangqi_term_chariot: "Wagen",
    xiangqi_rules_chariot: "Zieht beliebig weit orthogonal, wie ein Turm, und kann nicht über andere Figuren springen.",
    xiangqi_term_cannon: "Kanone",
    xiangqi_rules_cannon: "Zieht wie ein Wagen, solange nicht geschlagen wird. Zum Schlagen muss sie genau eine Figur (egal welcher Farbe) überspringen und direkt dahinter auf eine gegnerische Figur landen.",
    xiangqi_term_soldier: "Soldat",
    xiangqi_rules_soldier: "Zieht nur ein Feld vorwärts, bis er den Fluss überquert hat; danach darf er auch ein Feld seitwärts ziehen, aber nie rückwärts.",
    xiangqi_rules_end_title: "Wie eine Partie endet",
    xiangqi_term_win: "Gewinnen",
    xiangqi_rules_win: "Du gewinnst durch Matt des gegnerischen Generals oder wenn der Gegner am Zug überhaupt keinen legalen Zug hat – anders als im internationalen Schach zählt das hier ebenfalls als Verlust, nicht als Remis.",
    xiangqi_term_resignation: "Aufgabe",
    xiangqi_rules_resignation: "Ein Spieler kann jederzeit aufgeben, wodurch die Partie sofort zugunsten des Gegners endet.",

    back_home: "← Zurück zur Startseite",

    guide_title: "Anleitung: eInkChess auf deinem Gerät",
    guide_intro: "Drei Wege, eInkChess auf einen E-Reader zu bekommen – ungefähr vom einfachsten zum manuellsten sortiert.",
    guide_web_title: "1. Einfach im Browser öffnen",
    guide_web_body: "Öffne genau diese Adresse im Browser deines E-Readers und setze ein Lesezeichen. Nach dem ersten Besuch cached sich eInkChess automatisch für die Offline-Nutzung – WLAN aus, und es funktioniert weiter. Die einzige Ausnahme ist der Online-Modus mit Lichess bei Schach, der eine echte Verbindung braucht; jedes andere Spiel hier ist reines Offline-Spiel und davon nicht betroffen.",
    guide_pwa_title: "2. Zum Homescreen hinzufügen",
    guide_pwa_body: "Bietet der Browser deines E-Readers “Zum Startbildschirm hinzufügen” oder “App installieren” an, nutze das. eInkChess öffnet sich dann wie eine normale App, im Vollbild, ohne Browser-Leiste drumherum.",
    guide_sideload_title: "3. Per USB seitladen",
    guide_sideload_body: "Kopiere alle Dateien der App per USB auf das Gerät und öffne index.html direkt aus dem lokalen Speicher (eine file://-Adresse). Offline-Spielen funktioniert genauso. Das Einzige, was über file:// nicht geht, ist der Lichess-Login (OAuth braucht eine echte http/https-Adresse) – der lokale 2-Spieler- und der Computer-Modus sind bei jedem Spiel hier davon nicht betroffen.",
    guide_offline_title: "Was offline funktioniert",
    guide_offline_body: "Alles außer Online-Partien über Lichess bei Schach: lokal zu zweit und der eingebaute Computergegner auf jeder Stufe laufen bei jedem Spiel hier komplett auf dem Gerät, ganz ohne Server.",

    about_intro: "Ich habe nach einem einfachen Schachspiel für meinen eReader gesucht — gefunden habe ich nur andere, die auch suchten, statt zu spielen. Also habe ich mein eigenes gebaut. So ist eInkChess entstanden, und ich freue mich, es mit allen zu teilen. Mittlerweile ist daraus eine kleine Sammlung E-Ink-freundlicher Brettspiele geworden, weitere sind geplant.",
    about_donate_intro: "Wenn dir eInkChess gefällt oder du Ideen für Verbesserungen hast, kannst du hier Feedback schicken und das Projekt unterstützen:",
    about_donate_button: "Spendier mir einen Kaffee ☕",
    about_qr_text: "Oder scanne diesen QR-Code, um die Spendenseite auf dem Handy zu öffnen:",
    about_credits: "Figurensatz („cburnett“) von Colin M.L. Burnett, verwendet unter der BSD-Lizenz.",
    about_back: "← Zurück zum Brett"
  }
};

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
      return STRINGS[lang] ? lang : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function getLang() {
    const saved = safeGet(STORAGE_KEY);
    if (saved && STRINGS[saved]) return saved;
    return detectBrowserLang();
  }

  function t(key, lang) {
    const l = lang || getLang();
    const table = STRINGS[l] || STRINGS[DEFAULT_LANG];
    return (table && table[key]) || (STRINGS[DEFAULT_LANG] && STRINGS[DEFAULT_LANG][key]) || key;
  }

  function apply(lang) {
    const l = lang || getLang();
    if (document.documentElement) document.documentElement.lang = l;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"), l);
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

    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.classList.toggle("active-mode", btn.getAttribute("data-lang") === l);
    });
  }

  function setLang(lang) {
    if (!STRINGS[lang]) return;
    safeSet(STORAGE_KEY, lang);
    apply(lang);
  }

  function init() {
    apply(getLang());
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
    });
  }

  return {
    t: t,
    getLang: getLang,
    setLang: setLang,
    apply: apply,
    init: init,
    languages: Object.keys(STRINGS)
  };
})();

if (typeof window !== "undefined") {
  window.I18n = I18n;
  document.addEventListener("DOMContentLoaded", I18n.init);
}
