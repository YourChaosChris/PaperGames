// games-catalog.js
// Single source of truth for every game's card data (name/description i18n
// keys plus their English fallback text, category, icon markup, and whether
// it's in the home page's curated "Popular Games" set) - shared by
// index.html's home-app.js (the Favorites section) and games.html's
// games-app.js (the full searchable/sortable list), so a new game only
// needs adding here once instead of duplicated across pages.
//
// `added` is the date a game was published ("YYYY-MM-DD"). The home page's
// "New Games" section (home-app.js) shows the newest games from the last
// 60 days, and games.html can sort by it - so a new game MUST get its
// `added` date here too, or it never shows up as new. The original
// collection shares one placeholder date well outside that window.

const GAMES_CATALOG = [
  {
    slug: "chess",
    category: "strategy",
    nameKey: "game_chess",
    nameText: "Chess",
    descKey: "home_chess_desc",
    descText: "The classic game. Local 2-player, vs. the built-in engine, or online via Lichess.",
    popular: true,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 45 45\"><g fill=\"none\" fill-rule=\"evenodd\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path fill=\"#000\" d=\"M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21\"/><path fill=\"#000\" d=\"M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3\"/><path fill=\"#ececec\" stroke=\"#ececec\" d=\"M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5\"/><path fill=\"#ececec\" stroke=\"none\" d=\"m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z\"/></g></svg></span>"
  },
  {
    slug: "checkers",
    category: "strategy",
    nameKey: "game_checkers",
    nameText: "Checkers",
    descKey: "home_checkers_desc",
    descText: "The classic jump-and-capture game. Local 2-player or vs. the built-in engine, three difficulty levels.",
    popular: true,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9.5\"/><circle cx=\"12\" cy=\"12\" r=\"5.5\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "xiangqi",
    category: "strategy",
    nameKey: "game_xiangqi_short",
    nameText: "Xiangqi",
    descKey: "home_xiangqi_desc",
    descText: "Chinese chess: generals, elephants, cannons and more on a 9x10 grid. Local 2-player or vs. the built-in engine, with a toggle between classic characters and Western-style symbols.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9.5\"/><circle cx=\"12\" cy=\"12\" r=\"5.5\"/><path d=\"M12 8.5V15.5M9 12H15\"/></svg></span>"
  },
  {
    slug: "shogi",
    category: "strategy",
    nameKey: "game_shogi",
    nameText: "Shogi",
    descKey: "home_shogi_desc",
    descText: "Japanese chess, where captured pieces switch sides and rejoin the battle. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2.5L18 5.5L20.5 21.5H3.5L6 5.5Z\"/><path d=\"M9 11H15M9 15.5H15\"/></svg></span>"
  },
  {
    slug: "cardtactics",
    category: "strategy",
    nameKey: "game_card_tactics",
    nameText: "Card Tactics",
    descKey: "home_card_tactics_desc",
    descText: "A fast, elegant duel decided by five shifting move cards.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"2.5\" width=\"14\" height=\"19\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"8.5\" cy=\"8\" r=\"1.5\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"15.5\" cy=\"8\" r=\"1.5\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"17\" r=\"1.5\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "hnefatafl",
    category: "strategy",
    nameKey: "game_hnefatafl",
    nameText: "Hnefatafl (Viking Chess)",
    descKey: "home_hnefatafl_desc",
    descText: "An asymmetric Norse game: the king must escape, the attackers must trap him.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M7 16.5V9L9.5 11.5L12 7.5L14.5 11.5L17 9V16.5Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "go",
    category: "strategy",
    nameKey: "game_go",
    nameText: "Go",
    descKey: "home_go_desc",
    descText: "The ancient territory game. Local 2-player or vs. the built-in engine, three board sizes, three difficulty levels.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 8H21.5M2.5 16H21.5M8 2.5V21.5M16 2.5V21.5\"/><circle cx=\"8\" cy=\"8\" r=\"4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16\" cy=\"16\" r=\"4\" fill=\"#fff\"/></svg></span>"
  },
  {
    slug: "reversi",
    category: "strategy",
    nameKey: "game_reversi",
    nameText: "Reversi",
    descKey: "home_reversi_desc",
    descText: "Flip the board's colour by flanking your opponent's discs. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9.5\"/><path d=\"M12 2.5A9.5 9.5 0 0 1 12 21.5Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "fourinarow",
    category: "strategy",
    nameKey: "game_four_in_a_row",
    nameText: "Four in a Row",
    descKey: "home_four_in_a_row_desc",
    descText: "Drop discs to connect four in a row before your opponent does. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\" rx=\"2\"/><circle cx=\"7\" cy=\"17\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"10.3\" cy=\"13.7\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"13.7\" cy=\"10.3\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"17\" cy=\"7\" r=\"2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "gomoku",
    category: "strategy",
    nameKey: "game_gomoku",
    nameText: "Gomoku",
    descKey: "home_gomoku_desc",
    descText: "Get five stones in a row first, on a Go-sized board. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 12H21.5M7 2.5V21.5M17 2.5V21.5\"/><circle cx=\"4\" cy=\"20\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"8\" cy=\"16\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16\" cy=\"8\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"4\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "hex",
    category: "strategy",
    nameKey: "game_hex",
    nameText: "Hex",
    descKey: "home_hex_desc",
    descText: "Connect your two sides of a hexagonal board before your opponent connects theirs.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2.5L20.5 7.25V16.75L12 21.5L3.5 16.75V7.25Z\"/><path d=\"M12 8L15.5 10V14L12 16L8.5 14V10Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "morris",
    category: "strategy",
    nameKey: "game_morris",
    nameText: "Morris",
    descKey: "home_morris_desc",
    descText: "A centuries-old strategy game of placing and sliding pieces to form mills. Local 2-player or vs. the built-in engine, with the classic flying endgame rule.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><rect x=\"7.5\" y=\"7.5\" width=\"9\" height=\"9\"/><path d=\"M12 2.5V7.5M12 16.5V21.5M2.5 12H7.5M16.5 12H21.5\"/><circle cx=\"12\" cy=\"2.5\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"21.5\" cy=\"12\" r=\"2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "wallmaze",
    category: "strategy",
    nameKey: "game_wall_maze",
    nameText: "Wall Maze",
    descKey: "home_wall_maze_desc",
    descText: "Race to the far side of the board while building walls to block your opponent.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><rect x=\"8\" y=\"10.25\" width=\"13.5\" height=\"3.5\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"17\" r=\"2.5\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "halma",
    category: "strategy",
    nameKey: "game_halma",
    nameText: "Halma",
    descKey: "home_halma_desc",
    descText: "Race all your pieces across the board into your opponent's starting camp.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><circle cx=\"7\" cy=\"7\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"7\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"7\" cy=\"12\" r=\"2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/></svg></span>"
  },
  {
    slug: "sternhalma",
    category: "strategy",
    nameKey: "game_sternhalma",
    nameText: "Chinese Checkers",
    descKey: "home_sternhalma_desc",
    descText: "Race all ten of your marbles across the star-shaped board into the point opposite yours.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2.5L14.75 7.25H20.25L17.5 12L20.25 16.75H14.75L12 21.5L9.25 16.75H3.75L6.5 12L3.75 7.25H9.25Z\"/><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "dotsandboxes",
    category: "strategy",
    nameKey: "game_dotsandboxes",
    nameText: "Dots and Boxes",
    descKey: "home_dotsandboxes_desc",
    descText: "Draw lines between dots to complete boxes and claim them - whoever completes a box goes again. Play on 4 × 4, 5 × 5, 6 × 6 or 8 × 8 boxes, local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4H12V12H4Z\" fill=\"#141413\"/><path d=\"M12 4H20M12 12H20M4 12V20\"/><circle cx=\"4\" cy=\"4\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"4\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"4\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"4\" cy=\"12\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"12\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"4\" cy=\"20\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"20\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"20\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "amazons",
    category: "strategy",
    nameKey: "game_amazons",
    nameText: "Amazons",
    descKey: "home_amazons_desc",
    descText: "Move a queen-like amazon, then shoot a permanent arrow from its new square to slowly wall off the board.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3.5 20.5L15 9M15 9H10M15 9V14\"/><rect x=\"15\" y=\"15\" width=\"6\" height=\"6\" fill=\"#141413\" stroke=\"none\"/><path d=\"M13 3.5L15 6.5L17 4L19 6.5L21 3.5V8H13Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "backgammon",
    category: "race",
    nameKey: "game_backgammon",
    nameText: "Backgammon",
    descKey: "home_backgammon_desc",
    descText: "The classic dice race game. Local 2-player or vs. the built-in engine, with the bar, bearing off, and blot-hitting.",
    popular: true,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 2.5L7 12L11 2.5M13 21.5L17 12L21 21.5\"/><circle cx=\"7\" cy=\"18\" r=\"3\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"17\" cy=\"6\" r=\"3\"/></svg></span>"
  },
  {
    slug: "ur",
    category: "race",
    nameKey: "game_ur",
    nameText: "Ur",
    descKey: "home_ur_desc",
    descText: "A 4,600-year-old race game rediscovered from ancient Mesopotamia. Local 2-player or vs. the built-in engine, with rosette squares and capture-by-landing.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12 5V19M5 12H19\" stroke-width=\"2\"/><path d=\"M12 9.5L14.5 12L12 14.5L9.5 12Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "senet",
    category: "race",
    nameKey: "game_senet",
    nameText: "Senet",
    descKey: "home_senet_desc",
    descText: "One of the oldest known board games, from ancient Egypt. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"5.5\" width=\"19\" height=\"13\"/><path d=\"M2.5 12H21.5M8.83 5.5V18.5M15.17 5.5V18.5\"/><path d=\"M5.6 7.2L7.2 10.3H4Z\" fill=\"#141413\"/><circle cx=\"18.3\" cy=\"15.2\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "mancala",
    category: "race",
    nameKey: "game_mancala",
    nameText: "Mancala",
    descKey: "home_mancala_desc",
    descText: "One of the world's oldest game families: sow seeds around the board to fill your own store. Local 2-player or vs. the built-in engine, with captures and extra turns.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"6\"/><circle cx=\"8\" cy=\"10\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"10\" r=\"1.6\"/><circle cx=\"16\" cy=\"10\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"8\" cy=\"14\" r=\"1.6\"/><circle cx=\"12\" cy=\"14\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16\" cy=\"14\" r=\"1.6\"/></svg></span>"
  },
  {
    slug: "yatzy",
    category: "race",
    nameKey: "game_yatzy",
    nameText: "Yatzy",
    descKey: "home_yatzy_desc",
    descText: "The classic 5-dice scoring game. Roll up to three times a turn, hold the dice you want to keep, and fill in all 15 categories on the scoresheet for the highest total.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8\" cy=\"8\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16\" cy=\"8\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"8\" cy=\"16\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16\" cy=\"16\" r=\"1.7\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "sudoku",
    category: "puzzles",
    nameKey: "game_sudoku",
    nameText: "Sudoku",
    descKey: "home_sudoku_desc",
    descText: "Fill a 9x9 grid with digits so every row, column and 3x3 box contains 1-9 exactly once. Freshly generated with a unique solution, in three difficulty levels.",
    popular: true,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M8.83 2.5V21.5M15.17 2.5V21.5M2.5 8.83H21.5M2.5 15.17H21.5\" stroke-width=\"2\"/></svg></span>"
  },
  {
    slug: "minesweeper",
    category: "puzzles",
    nameKey: "game_minesweeper",
    nameText: "Minesweeper",
    descKey: "home_minesweeper_desc",
    descText: "Uncover every safe square using the number clues, without triggering a hidden mine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"5.5\" fill=\"#141413\" stroke=\"none\"/><path d=\"M12 2.5V6.5M12 17.5V21.5M2.5 12H6.5M17.5 12H21.5M5.3 5.3L8.1 8.1M15.9 15.9L18.7 18.7M18.7 5.3L15.9 8.1M8.1 15.9L5.3 18.7\"/></svg></span>"
  },
  {
    slug: "twenty48",
    category: "puzzles",
    nameKey: "game_2048",
    nameText: "2048",
    descKey: "home_2048_desc",
    descText: "Slide and merge numbered tiles to reach 2048 before the board fills up. Keep playing afterward to push your best score even higher.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"8.5\" height=\"8.5\" rx=\"1.5\"/><rect x=\"13\" y=\"2.5\" width=\"8.5\" height=\"8.5\" rx=\"1.5\"/><rect x=\"2.5\" y=\"13\" width=\"8.5\" height=\"8.5\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"8.5\" height=\"8.5\" rx=\"1.5\"/><rect x=\"15.5\" y=\"15.5\" width=\"3.5\" height=\"3.5\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "freecell",
    category: "puzzles",
    nameKey: "game_freecell",
    nameText: "FreeCell",
    descKey: "home_freecell_desc",
    descText: "The classic card solitaire where nearly every deal can be won with the right moves. Full supermoves and a one-click collect to the foundations.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"4\" width=\"11\" height=\"16\" rx=\"1.5\"/><rect x=\"10.5\" y=\"6\" width=\"11\" height=\"16\" rx=\"1.5\" fill=\"#fff\"/><path d=\"M16 9.5C14 12 12.5 13 12.5 14.6C12.5 16 14.5 16.6 16 15.2C17.5 16.6 19.5 16 19.5 14.6C19.5 13 18 12 16 9.5Z\" fill=\"#141413\" stroke=\"none\"/><path d=\"M16 15V18.5\"/></svg></span>"
  },
  {
    slug: "mahjong",
    category: "puzzles",
    nameKey: "game_mahjong_solitaire",
    nameText: "Mahjong Solitaire",
    descKey: "home_mahjong_solitaire_desc",
    descText: "Clear the layered tile layout by matching identical pairs. Every deal is generated to always have a solution.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"5.5\" width=\"12\" height=\"16\" rx=\"2\"/><rect x=\"8.5\" y=\"2.5\" width=\"13\" height=\"16\" rx=\"2\" fill=\"#fff\"/><circle cx=\"15\" cy=\"10.5\" r=\"3.5\"/><circle cx=\"15\" cy=\"10.5\" r=\"1.2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "nonogram",
    category: "puzzles",
    nameKey: "game_nonograms",
    nameText: "Nonograms",
    descKey: "home_nonograms_desc",
    descText: "Use row and column number clues to reveal a hidden picture, one cell at a time. A fresh, uniquely-solvable puzzle in three sizes.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"8.5\" y=\"8.5\" width=\"13\" height=\"13\"/><path d=\"M15 8.5V21.5M8.5 15H21.5\" stroke-width=\"2\"/><rect x=\"8.5\" y=\"8.5\" width=\"6.5\" height=\"6.5\" fill=\"#141413\" stroke=\"none\"/><rect x=\"15\" y=\"15\" width=\"6.5\" height=\"6.5\" fill=\"#141413\" stroke=\"none\"/><path d=\"M3 11.75H5.5M3 18.25H5.5M11.75 3V5.5M18.25 3V5.5\"/></svg></span>"
  },
  {
    slug: "pegsolitaire",
    category: "puzzles",
    nameKey: "game_peg_solitaire",
    nameText: "Peg Solitaire",
    descKey: "home_peg_solitaire_desc",
    descText: "Jump pegs over each other until only one remains - on the English cross or one of several other boards, from a 6x6 square to Wiegleb's 45-hole cross.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 2.5H15.5V8.5H21.5V15.5H15.5V21.5H8.5V15.5H2.5V8.5H8.5Z\"/><circle cx=\"12\" cy=\"6\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"6\" cy=\"12\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"18\" cy=\"12\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"18\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.4\"/></svg></span>"
  },
  {
    slug: "lightswitch",
    category: "puzzles",
    nameKey: "game_lightswitch",
    nameText: "Light Switch",
    descKey: "home_lightswitch_desc",
    descText: "Press a cell to toggle it and its neighbors on and off. Turn off every light to win - every puzzle is generated to always have a solution.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 15.5C6.5 14 5.5 12 5.5 10A6.5 6.5 0 0 1 18.5 10C18.5 12 17.5 14 15.5 15.5V17.5H8.5Z\"/><path d=\"M9.5 20.5H14.5\"/><path d=\"M10.5 12L12 9.5L13.5 12\" stroke-width=\"2\"/></svg></span>"
  },
  {
    slug: "bullsandcows",
    category: "puzzles",
    nameKey: "game_bullsandcows",
    nameText: "Bulls and Cows",
    descKey: "home_bullsandcows_desc",
    descText: "Crack a hidden 4-shape code within a limited number of guesses, using black and white peg feedback. Repeats may be allowed, depending on the difficulty.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"7\" width=\"19\" height=\"10\" rx=\"2\"/><circle cx=\"6.5\" cy=\"12\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"10.2\" cy=\"12\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"13.8\" cy=\"12\" r=\"1.8\"/><circle cx=\"17.5\" cy=\"12\" r=\"1.8\"/></svg></span>"
  },
  {
    slug: "klondike",
    category: "puzzles",
    nameKey: "game_klondike",
    nameText: "Klondike",
    descKey: "home_klondike_desc",
    descText: "The original patience game solitaire is named after - seven cascading tableau columns, four foundations, and a draw pile to work through. The game Windows made famous.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"11\" height=\"15\" rx=\"1.5\"/><rect x=\"6.5\" y=\"5\" width=\"11\" height=\"15\" rx=\"1.5\" fill=\"#fff\"/><rect x=\"10.5\" y=\"7.5\" width=\"11\" height=\"14\" rx=\"1.5\" fill=\"#fff\"/><path d=\"M16 11L18.5 14.5L16 18L13.5 14.5Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "spidersolitaire",
    category: "puzzles",
    nameKey: "game_spidersolitaire",
    nameText: "Spider Solitaire",
    descKey: "home_spidersolitaire_desc",
    descText: "Two decks, ten tableau columns, no foundations - build same-suit King-to-Ace runs to clear them. Choose 1, 2, or 4 suits for an easier or harder deal.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"12\" cy=\"13\" rx=\"3.5\" ry=\"4.5\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"7\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/><path d=\"M8.5 11L3 7.5M8.5 13L2.5 13M8.5 15L3.5 19M15.5 11L21 7.5M15.5 13L21.5 13M15.5 15L20.5 19\"/></svg></span>"
  },
  {
    slug: "kakuro",
    category: "puzzles",
    nameKey: "game_kakuro",
    nameText: "Kakuro",
    descKey: "home_kakuro_desc",
    descText: "Fill white cells with digits 1-9 so every run sums to its clue, with no digit repeated within a run. Freshly generated, in three difficulty levels.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M12 2.5V21.5M2.5 12H21.5\"/><path d=\"M2.5 2.5H12V12H2.5Z\" fill=\"#141413\"/><path d=\"M3.5 3.5L11 11\" stroke=\"#fff\" stroke-width=\"2\"/></svg></span>"
  },
  {
    slug: "fanorona",
    category: "strategy",
    nameKey: "game_fanorona",
    nameText: "Fanorona",
    descKey: "home_fanorona_desc",
    descText: "Madagascar's national board game: slide pieces along a 5x9 grid of lines to capture by approach or withdrawal. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"6\" width=\"19\" height=\"12\"/><path d=\"M2.5 12H21.5M8.83 6V18M15.17 6V18M2.5 6L8.83 12L2.5 18M8.83 12L15.17 6M8.83 12L15.17 18M15.17 6L21.5 12L15.17 18\"/></svg></span>"
  },
  {
    slug: "baghchal",
    category: "strategy",
    nameKey: "game_baghchal",
    nameText: "Bagh-Chal",
    descKey: "home_baghchal_desc",
    descText: "Nepal's traditional hunt game: 4 tigers vs. 20 goats on an alquerque-style 5x5 board of lines. Local 2-player or vs. the built-in engine, playing either side.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\"/><path d=\"M4 4L20 20M20 4L4 20M12 4V20M4 12H20\"/><path d=\"M4 8L1 2H7Z\" fill=\"#141413\"/><path d=\"M20 22L17 16H23Z\" fill=\"#141413\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\" fill=\"#fff\"/></svg></span>"
  },
  {
    slug: "tablut",
    category: "strategy",
    nameKey: "game_tablut",
    nameText: "Tablut",
    descKey: "home_tablut_desc",
    descText: "The largest and best-documented Tafl game: a 9x9 board where the king must reach a corner and the attackers must trap him first.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><rect x=\"8.5\" y=\"8.5\" width=\"7\" height=\"7\" fill=\"#141413\"/><path d=\"M2.5 6.5H6.5V2.5M21.5 17.5H17.5V21.5\"/></svg></span>"
  },
  {
    slug: "marblepush",
    category: "strategy",
    nameKey: "game_marblepush",
    nameText: "Marble Push",
    descKey: "home_marblepush_desc",
    descText: "Push 6 of your opponent's marbles off the hexagonal board to win. Local 2-player or vs. the built-in engine, with full rules for pushing and for sideways line moves.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 3H17L22 12L17 21H7L2 12Z\"/><circle cx=\"9\" cy=\"12\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"15\" cy=\"12\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"7.5\" r=\"2.2\"/><circle cx=\"12\" cy=\"16.5\" r=\"2.2\"/></svg></span>"
  },
  {
    slug: "pyramidsolitaire",
    category: "puzzles",
    nameKey: "game_pyramidsolitaire",
    nameText: "Pyramid Solitaire",
    descKey: "home_pyramidsolitaire_desc",
    descText: "Clear the 28-card pyramid by removing exposed pairs that add up to 13, or a lone King. A stock/waste pile with two redeals to work through.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"9\" y=\"2.5\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"5.5\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"12.5\" y=\"9\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"2\" y=\"15.5\" width=\"6\" height=\"6\" rx=\"1\" fill=\"#141413\"/><rect x=\"9\" y=\"15.5\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"16\" y=\"15.5\" width=\"6\" height=\"6\" rx=\"1\"/></svg></span>"
  },
  {
    slug: "surakarta",
    category: "strategy",
    nameKey: "game_surakarta",
    nameText: "Surakarta",
    descKey: "home_surakarta_desc",
    descText: "The Indonesian looping-track capture game: quiet steps never capture, only a slide that rides one of the board's 4 corner loop tracks does. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"7\" y=\"7\" width=\"10\" height=\"10\"/><path d=\"M12 7V17M7 12H17\"/><path d=\"M12 7A5 5 0 1 0 7 12M12 17A5 5 0 1 0 17 12\"/><circle cx=\"12\" cy=\"12\" r=\"2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "hashi",
    category: "puzzles",
    nameKey: "game_hashi",
    nameText: "Hashiwokakero",
    descKey: "home_hashi_desc",
    descText: "Connect every numbered island with straight single or double bridges so the whole network joins together and every island's count matches its number. Freshly generated, in three difficulty levels.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"6\" cy=\"6\" r=\"3.5\"/><circle cx=\"18\" cy=\"6\" r=\"3.5\"/><circle cx=\"6\" cy=\"18\" r=\"3.5\" fill=\"#141413\"/><path d=\"M9.5 4.8H14.5M9.5 7.2H14.5M6 9.5V14.5\"/></svg></span>"
  },
  {
    slug: "fleetbattle",
    category: "strategy",
    nameKey: "game_fleetbattle",
    nameText: "Fleet Battle",
    descKey: "home_fleetbattle_desc",
    descText: "Sink the computer's hidden fleet before it sinks yours - classic grid-guessing naval combat, one shot per turn.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 14H21.5L18.5 20H5.5Z\" fill=\"#141413\"/><path d=\"M8 14V9H14V14M11 9V3.5M11 3.5L16 6.5L11 6.5\"/></svg></span>"
  },
  {
    slug: "skyscrapers",
    category: "puzzles",
    nameKey: "game_skyscrapers",
    nameText: "Skyscrapers",
    descKey: "home_skyscrapers_desc",
    descText: "Fill an NxN grid with building heights 1-N so every row and column has each height once, matching how many are visible from the numbered clues around the edge. Freshly generated, in three difficulty levels.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 21.5H21.5\"/><rect x=\"3.5\" y=\"13\" width=\"4.5\" height=\"8.5\"/><rect x=\"9.75\" y=\"4\" width=\"4.5\" height=\"17.5\" fill=\"#141413\"/><rect x=\"16\" y=\"9\" width=\"4.5\" height=\"12.5\"/></svg></span>"
  },
  {
    slug: "konane",
    category: "strategy",
    nameKey: "game_konane",
    nameText: "Konane",
    descKey: "home_konane_desc",
    descText: "Hawaiian checkers: a full board of alternating stones and orthogonal jump chains, opening with a unique two-stone removal ritual. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"5.5\" cy=\"5.5\" r=\"3\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"5.5\" r=\"2.6\"/><circle cx=\"18.5\" cy=\"5.5\" r=\"3\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"5.5\" cy=\"12\" r=\"2.6\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"18.5\" cy=\"12\" r=\"2.6\"/><circle cx=\"5.5\" cy=\"18.5\" r=\"3\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"18.5\" r=\"2.6\"/><circle cx=\"18.5\" cy=\"18.5\" r=\"3\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "slitherlink",
    category: "puzzles",
    nameKey: "game_slitherlink",
    nameText: "Slitherlink",
    descKey: "home_slitherlink_desc",
    descText: "Draw a single loop between the dots so every numbered cell has exactly that many edges on its sides. Freshly generated, in three difficulty levels.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4H12V12H20V20H4Z\"/><circle cx=\"20\" cy=\"4\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"20\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"12\" cy=\"4\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"4\" cy=\"12\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"12\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "ludo",
    category: "race",
    nameKey: "game_ludo",
    nameText: "Ludo",
    descKey: "home_ludo_desc",
    descText: "The classic cross-shaped race game descended from ancient Pachisi. Play one color yourself against up to three built-in computer opponents (2-4 players total), or pass the device around in local hotseat.",
    popular: false,
    added: "2026-07-01",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><circle cx=\"7.25\" cy=\"7.25\" r=\"2.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"16.75\" cy=\"7.25\" r=\"2.2\"/><path d=\"M7.25 14.5L9.8 19.2H4.7Z\" fill=\"#141413\" stroke=\"none\"/><rect x=\"14.6\" y=\"14.6\" width=\"4.3\" height=\"4.3\"/></svg></span>"
  },
  {
    slug: "categories",
    category: "party",
    nameKey: "game_categories",
    nameText: "Categories",
    descKey: "home_categories_desc",
    descText: "The classic pen-and-paper word game, with this device as the game master: it draws the letter, keeps time and adds up the points. For 1-8 players, each with paper and a pen.",
    popular: false,
    added: "2026-09-26",
    // A letter game needs an alphabet; Chinese has none, so the game is
    // left out of the lists there (its page still works, with pinyin
    // initials).
    hideInLangs: ["zh"],
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"2.5\" width=\"14\" height=\"19\" rx=\"1.5\"/><path d=\"M6.5 7.5H13.5M6.5 11.5H13.5M6.5 15.5H10.5\"/><path d=\"M20.5 9L14 19.5L13 22L15.5 20.5L22 10Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "domino",
    category: "strategy",
    nameKey: "game_domino",
    nameText: "Domino",
    descKey: "home_domino_desc",
    descText: "The classic draw game with a double-six set: match the pips on either open end, draw when you're stuck, and be the first to play your last tile. Against the computer or with 2-4 players on one device.",
    popular: false,
    added: "2026-09-26",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"6.5\" y=\"2.5\" width=\"11\" height=\"19\" rx=\"2\"/><path d=\"M6.5 12H17.5\"/><circle cx=\"12\" cy=\"7.25\" r=\"1.6\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"9.5\" cy=\"15\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"18.5\" r=\"1.4\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "maumau",
    category: "party",
    nameKey: "game_maumau",
    nameText: "Mau Mau",
    descKey: "home_maumau_desc",
    descText: "The traditional card game with a 32-card pack: follow suit or rank, use Sevens, Eights, Jacks and Aces to your advantage, and be the first to get rid of your cards. Against the computer or with 2-4 players on one device.",
    popular: false,
    added: "2026-09-26",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"4.5\" width=\"11\" height=\"15\" rx=\"1.5\" transform=\"rotate(-10 8 12)\"/><rect x=\"10\" y=\"3.5\" width=\"11\" height=\"16\" rx=\"1.5\" fill=\"#fff\"/><path d=\"M15.5 7.5L18.5 11.5L15.5 15.5L12.5 11.5Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "calcudoku",
    category: "puzzles",
    nameKey: "game_calcudoku",
    nameText: "Calcudoku",
    descKey: "home_calcudoku_desc",
    descText: "Fill the grid so every row and column holds each digit once and every cage hits its target with its operation. Sizes 4x4 to 7x7, three difficulty levels.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M10.25 2.5H13.75V13.75H2.5V10.25H10.25Z\" fill=\"#141413\" stroke=\"none\"/><path d=\"M15.5 6.5H19.5M17.5 4.5V8.5M15.5 17.5H19.5\"/></svg></span>"
  },
  {
    slug: "numberblocks",
    category: "puzzles",
    nameKey: "game_numberblocks",
    nameText: "Number Blocks",
    descKey: "home_numberblocks_desc",
    descText: "Fill every block of n cells with the digits 1 to n - but equal digits may never touch, not even diagonally. Three difficulty levels, unique solution.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M7.08 2.5H10.58V13.42H21.5V16.92H2.5V13.42H7.08Z\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "killersudoku",
    category: "puzzles",
    nameKey: "game_killersudoku",
    nameText: "Killer Sudoku",
    descKey: "home_killersudoku_desc",
    descText: "Sudoku with almost no givens: dashed cages show sums, and no digit repeats inside a cage. Three difficulty levels, unique solution.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"19\" height=\"19\"/><path d=\"M12 2.5V21.5M2.5 12H21.5\" stroke-width=\"2\"/><rect x=\"5\" y=\"5\" width=\"14\" height=\"4.5\" stroke-dasharray=\"2 1.6\" stroke-width=\"2\"/></svg></span>"
  },
  {
    slug: "schwimmen",
    category: "party",
    nameKey: "game_schwimmen",
    nameText: "Thirty-One",
    descKey: "home_schwimmen_desc",
    descText: "The card game also called Schwimmen or Schnauz: collect 31 in one suit with three cards, swap with the middle and knock at the right moment. 2-6 players or vs. the computer.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"2.5\" width=\"9\" height=\"13\" rx=\"1.5\"/><rect x=\"12\" y=\"2.5\" width=\"9\" height=\"13\" rx=\"1.5\"/><path d=\"M2.5 19C5 17 7 21 9.5 19S14 21 16.5 19S19.5 17.5 21.5 19\"/></svg></span>"
  },
  {
    slug: "durak",
    category: "strategy",
    nameKey: "game_durak",
    nameText: "Durak",
    descKey: "home_durak_desc",
    descText: "The Russian card game with 36 cards: attack, beat with higher cards or trumps, throw in more of the same ranks - and don't be the last one holding cards. 2-4 players or vs. the computer.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3.5\" width=\"10\" height=\"14\" rx=\"1.5\"/><rect x=\"11\" y=\"6.5\" width=\"10\" height=\"14\" rx=\"1.5\" transform=\"rotate(20 16 13.5)\" fill=\"#fff\"/><path d=\"M16.3 10L18.6 13.5L16.3 17L14 13.5Z\" fill=\"#141413\" transform=\"rotate(20 16 13.5)\"/></svg></span>"
  },
  {
    slug: "concan",
    category: "strategy",
    nameKey: "game_concan",
    nameText: "Concan",
    descKey: "home_concan_desc",
    descText: "The old Mexican card game at the root of the rummy family: 40 cards, sets and runs, and a discard you must take if you can use it. First to lay out eleven cards wins. 2 players or vs. the computer.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"6\" width=\"6.5\" height=\"10\" rx=\"1\"/><rect x=\"8.75\" y=\"6\" width=\"6.5\" height=\"10\" rx=\"1\"/><rect x=\"15.5\" y=\"6\" width=\"6.5\" height=\"10\" rx=\"1\" fill=\"#141413\"/><path d=\"M2 20H22\"/></svg></span>"
  },
  {
    slug: "doppelkopf",
    category: "strategy",
    nameKey: "game_doppelkopf",
    nameText: "Doppelkopf",
    descKey: "home_doppelkopf_desc",
    descText: "The German trick-taking game for four with 48 cards: the two Queens of Clubs play together, and nobody knows who they are. Normal game with marriage, you vs. three computer players or together on one device.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"12\" height=\"16\" rx=\"1.5\"/><rect x=\"9.5\" y=\"5.5\" width=\"12\" height=\"16\" rx=\"1.5\" fill=\"#fff\"/><circle cx=\"15.5\" cy=\"10.5\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"13.6\" cy=\"13.5\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"17.4\" cy=\"13.5\" r=\"1.8\" fill=\"#141413\" stroke=\"none\"/><path d=\"M15.5 13V17.5\"/></svg></span>"
  },
  {
    slug: "trix",
    category: "strategy",
    nameKey: "game_trix",
    nameText: "Trix",
    descKey: "home_trix_desc",
    descText: "The card game of the Levant for four: four kingdoms of five contracts - avoid the King of Hearts, the Queens, the Diamonds and tricks, then race to empty your hand in Trix. You vs. three computer players or together on one device.",
    popular: false,
    added: "2026-09-27",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"2.5\" width=\"12\" height=\"16\" rx=\"1.5\"/><rect x=\"9.5\" y=\"5.5\" width=\"12\" height=\"16\" rx=\"1.5\" fill=\"#fff\"/><path d=\"M15.5 17C15.5 17 12.5 14.5 12.5 12.6C12.5 11.4 13.4 10.6 14.3 10.6C14.9 10.6 15.3 10.9 15.5 11.4C15.7 10.9 16.1 10.6 16.7 10.6C17.6 10.6 18.5 11.4 18.5 12.6C18.5 14.5 15.5 17 15.5 17Z\" fill=\"#141413\"/></svg></span>"
  },
  {
    slug: "cratepusher",
    category: "puzzles",
    nameKey: "game_cratepusher",
    nameText: "Crate Pusher",
    descKey: "home_cratepusher_desc",
    descText: "Push every crate onto a target - but crates can only be pushed, never pulled. Freshly generated levels, each one checked to be solvable, in three difficulty levels.",
    popular: false,
    added: "2026-09-28",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"8.5\" width=\"11\" height=\"11\"/><path d=\"M2.5 8.5L13.5 19.5M13.5 8.5L2.5 19.5\"/><circle cx=\"18.5\" cy=\"14\" r=\"3\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "tictactoe",
    category: "strategy",
    nameKey: "game_tictactoe",
    nameText: "Tic-Tac-Toe",
    descKey: "home_tictactoe_desc",
    descText: "Three in a row on a 3x3 grid - the classic pencil-and-paper game. Local 2-player or vs. the built-in engine, which never loses on Hard.",
    popular: false,
    added: "2026-10-03",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 2.5V21.5M15 2.5V21.5M2.5 9H21.5M2.5 15H21.5\"/><path d=\"M3.8 3.8L7.7 7.7M7.7 3.8L3.8 7.7\"/><circle cx=\"12\" cy=\"12\" r=\"1.9\"/></svg></span>"
  },
  {
    slug: "alquerque",
    category: "strategy",
    nameKey: "game_alquerque",
    nameText: "Alquerque",
    descKey: "home_alquerque_desc",
    descText: "The medieval ancestor of checkers: 12 pieces each on a 5x5 board of lines, jump to capture, and capturing is compulsory. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\"/><path d=\"M4 4L20 20M20 4L4 20M12 4V20M4 12H20\"/><circle cx=\"4\" cy=\"4\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"20\" cy=\"20\" r=\"2.2\" fill=\"#fff\"/></svg></span>"
  },
  {
    slug: "pairs",
    category: "party",
    nameKey: "game_pairs",
    nameText: "Pairs",
    descKey: "home_pairs_desc",
    descText: "Turn over two cards and find the pairs: the classic card-matching game with simple black-and-white shapes. Solo against the move count, two players on one device, or vs. the built-in engine.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"4\" width=\"8.5\" height=\"12\" rx=\"1.5\"/><rect x=\"13\" y=\"8\" width=\"8.5\" height=\"12\" rx=\"1.5\"/><circle cx=\"6.75\" cy=\"10\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/><circle cx=\"17.25\" cy=\"14\" r=\"2.2\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "futoshiki",
    category: "puzzles",
    nameKey: "game_futoshiki",
    nameText: "Futoshiki",
    descKey: "home_futoshiki_desc",
    descText: "Fill the grid so every row and column holds each number once - and every sign between two cells points to the smaller number. 4x4 to 6x6, freshly generated with a unique solution.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.25\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"7\" width=\"8\" height=\"8\"/><rect x=\"13.5\" y=\"7\" width=\"8\" height=\"8\"/><path d=\"M10.8 11L13.2 9V13Z\" fill=\"#141413\" stroke=\"none\"/></svg></span>"
  },
  {
    slug: "foxandgeese",
    category: "strategy",
    nameKey: "game_foxandgeese",
    nameText: "Fox and Geese",
    descKey: "home_foxandgeese_desc",
    descText: "The medieval hunt game on the 33-point cross: one fox against 13 geese. Play either side, local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M37 8 H63 V37 H92 V63 H63 V92 H37 V63 H8 V37 H37 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"3\"/><path d=\"M50 28 L66 56 L34 56 Z\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"5\" stroke-linejoin=\"round\"/><circle cx=\"38\" cy=\"78\" r=\"7\" fill=\"#111\"/><circle cx=\"62\" cy=\"78\" r=\"7\" fill=\"#111\"/><circle cx=\"20\" cy=\"70\" r=\"6\" fill=\"#111\"/><circle cx=\"80\" cy=\"70\" r=\"6\" fill=\"#111\"/></svg></span>"
  },
  {
    slug: "seega",
    category: "strategy",
    nameKey: "game_seega",
    nameText: "Seega",
    descKey: "home_seega_desc",
    descText: "An Egyptian game of placing and trapping on a 5x5 board: first both sides place their 12 stones, then capture by enclosing. Local 2-player or vs. the built-in engine.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#000\" stroke-width=\"2.5\" fill=\"none\"><rect x=\"10\" y=\"10\" width=\"80\" height=\"80\"/><path d=\"M26 10V90M42 10V90M58 10V90M74 10V90M10 26H90M10 42H90M10 58H90M10 74H90\"/></g><circle cx=\"34\" cy=\"50\" r=\"6\" fill=\"#111\"/><circle cx=\"66\" cy=\"50\" r=\"6\" fill=\"#111\"/><circle cx=\"50\" cy=\"50\" r=\"5.5\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"3\"/><circle cx=\"18\" cy=\"18\" r=\"5.5\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"3\"/><circle cx=\"82\" cy=\"82\" r=\"6\" fill=\"#111\"/></svg></span>"
  },
  {
    slug: "romme",
    category: "strategy",
    nameKey: "game_romme",
    nameText: "Rummy (Rommé)",
    descKey: "home_romme_desc",
    descText: "The German rummy with two packs and six jokers: lay out sets and runs, add to any meld on the table, and get rid of all your cards. 2 to 4 players, vs. the computer or on one device.",
    popular: false,
    added: "2026-10-06",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect x=\"8\" y=\"14\" width=\"40\" height=\"58\" rx=\"5\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"3\"/><rect x=\"30\" y=\"20\" width=\"40\" height=\"58\" rx=\"5\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"3\"/><rect x=\"52\" y=\"26\" width=\"40\" height=\"58\" rx=\"5\" fill=\"#fff\" stroke=\"#111\" stroke-width=\"3\"/><text x=\"72\" y=\"62\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"700\" font-family=\"sans-serif\" fill=\"#111\">7</text></svg></span>"
  },
  {
    slug: "cake",
    category: "puzzles",
    nameKey: "game_cake",
    nameText: "Who Took the Cake?",
    descKey: "home_cake_desc",
    descText: "A detective logic puzzle: place the animals and the cake on the floor plan by the clues - one per row and column - and find out who took the cake.",
    popular: false,
    added: "2026-10-09",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\"><path d=\"M20 4C22 7 22 8.5 20 9.5C18 8.5 18 7 20 4Z\" fill=\"#141413\"/><path d=\"M20 10V15\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"11\" y=\"15\" width=\"18\" height=\"8\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"7\" y=\"23\" width=\"26\" height=\"11\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M7 27C10 30 12 25 15 28C18 31 20 25 23 28C26 31 28 25 33 28\" fill=\"none\" stroke=\"#141413\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.8\"/></svg></span>"
  },
  {
    slug: "animalsudoku",
    category: "puzzles",
    nameKey: "game_animalsudoku",
    nameText: "Animal Sudoku",
    descKey: "home_animalsudoku_desc",
    descText: "Sudoku for children with animals instead of numbers: 4 x 4 or 6 x 6, every animal once in each row, column and box. Pick an animal, tap a cell - no reading needed.",
    popular: false,
    added: "2026-10-10",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\"><rect x=\"3\" y=\"3\" width=\"34\" height=\"34\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/><path d=\"M11.5 3V37M28.5 3V37M3 11.5H37M3 28.5H37\" stroke=\"#141413\" stroke-width=\"1\"/><path d=\"M20 3V37M3 20H37\" stroke=\"#141413\" stroke-width=\"2.4\"/><circle cx=\"8.5\" cy=\"9\" r=\"2.4\" fill=\"#141413\"/><circle cx=\"14.5\" cy=\"9\" r=\"2.4\" fill=\"#141413\"/><circle cx=\"11.5\" cy=\"13\" r=\"3\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"1.6\"/><path d=\"M24.5 28L25 23L27.5 25.5M32.5 28L32 23L29.5 25.5\" fill=\"none\" stroke=\"#141413\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><circle cx=\"28.5\" cy=\"30\" r=\"3.4\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"1.6\"/></svg></span>"
  },
  {
    slug: "shapesort",
    category: "puzzles",
    nameKey: "game_shapesort",
    nameText: "Shape Sort",
    descKey: "home_shapesort_desc",
    descText: "A calm sorting puzzle: move the stones between tubes until every tube holds four of one shape. Shapes instead of colours, so it reads on black-and-white e-ink; undo as often as you like.",
    popular: false,
    added: "2026-10-10",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\"><rect x=\"5\" y=\"4\" width=\"13\" height=\"32\" rx=\"3\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/><rect x=\"22\" y=\"4\" width=\"13\" height=\"32\" rx=\"3\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/><circle cx=\"11.5\" cy=\"30\" r=\"3.6\" fill=\"#141413\"/><polygon points=\"11.5,17.5 15.5,24.5 7.5,24.5\" fill=\"#141413\"/><circle cx=\"11.5\" cy=\"12\" r=\"3.6\" fill=\"#141413\"/><rect x=\"25.5\" y=\"26.5\" width=\"6\" height=\"6\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2\"/><rect x=\"25.5\" y=\"18\" width=\"6\" height=\"6\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2\"/></svg></span>"
  },
  {
    slug: "linkpairs",
    category: "puzzles",
    nameKey: "game_linkpairs",
    nameText: "Link the Pairs",
    descKey: "home_linkpairs_desc",
    descText: "Join each pair of equal symbols with a line - lines never cross, and every cell is used. Numbers or animals, 5 x 5 to 9 x 9, made for e-ink; draw by dragging or by tapping.",
    popular: false,
    added: "2026-10-10",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\"><path d=\"M9 9H20V20H31V31\" fill=\"none\" stroke=\"#141413\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 31H15\" fill=\"none\" stroke=\"#141413\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"9\" cy=\"9\" r=\"5.5\" fill=\"#141413\"/><circle cx=\"31\" cy=\"31\" r=\"5.5\" fill=\"#141413\"/><circle cx=\"9\" cy=\"31\" r=\"5\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/><circle cx=\"20\" cy=\"31\" r=\"5\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/></svg></span>"
  },
  {
    slug: "oldmaid",
    category: "party",
    nameKey: "game_oldmaid",
    nameText: "Old Maid",
    descKey: "home_oldmaid_desc",
    descText: "The classic children's card game with animal pictures: lay down pairs, draw a hidden card from your neighbour in turn - and don't be the one left with the Black Peter. No reading needed; against 1 to 3 computers.",
    popular: false,
    added: "2026-10-10",
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 40 40\"><rect x=\"3\" y=\"7\" width=\"20\" height=\"28\" rx=\"3\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\" transform=\"rotate(-12 13 21)\"/><rect x=\"15\" y=\"4\" width=\"21\" height=\"30\" rx=\"3\" fill=\"#fff\" stroke=\"#141413\" stroke-width=\"2.4\"/><g transform=\"translate(16.5 7) scale(0.45)\"><path d=\"M9 31L10 18L17 22ZM31 31L30 18L23 22Z\" fill=\"#141413\"/><circle cx=\"20\" cy=\"28\" r=\"10.5\" fill=\"#141413\"/><ellipse cx=\"16\" cy=\"27\" rx=\"2.6\" ry=\"2.2\" fill=\"#fff\"/><ellipse cx=\"24\" cy=\"27\" rx=\"2.6\" ry=\"2.2\" fill=\"#fff\"/><path d=\"M16 25.4V28.6M24 25.4V28.6\" stroke=\"#141413\" stroke-width=\"1.3\"/><path d=\"M18.6 31.5H21.4L20 33Z\" fill=\"#fff\"/><path d=\"M3 30H13M3 34L13 32.5M37 30H27M37 34L27 32.5\" stroke=\"#141413\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><rect x=\"11\" y=\"15\" width=\"18\" height=\"3\" rx=\"1\" fill=\"#141413\"/><rect x=\"14.5\" y=\"2\" width=\"11\" height=\"14\" fill=\"#141413\"/><rect x=\"14.5\" y=\"11.5\" width=\"11\" height=\"2.3\" fill=\"#fff\"/></g></svg></span>"
  },
];
