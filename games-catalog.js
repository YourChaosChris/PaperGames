// games-catalog.js
// Single source of truth for every game's card data (name/description i18n
// keys plus their English fallback text, category, icon markup, and whether
// it's in the home page's curated "Popular Games" set) - shared by
// index.html's home-app.js (the Favorites section) and games.html's
// games-app.js (the full searchable/sortable list), so a new game only
// needs adding here once instead of duplicated across pages.

const GAMES_CATALOG = [
  {
    slug: "chess",
    category: "strategy",
    nameKey: "game_chess",
    nameText: "Chess",
    descKey: "home_chess_desc",
    descText: "The classic game. Local 2-player, vs. the built-in engine, or online via Lichess.",
    popular: true,
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
    icon: "<span class=\"checkers-icon-disc checkers-icon-disc-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "xiangqi",
    category: "strategy",
    nameKey: "game_xiangqi_short",
    nameText: "Xiangqi",
    descKey: "home_xiangqi_desc",
    descText: "Chinese chess: generals, elephants, cannons and more on a 9x10 grid. Local 2-player or vs. the built-in engine, with a toggle between classic characters and Western-style symbols.",
    popular: false,
    icon: "<span class=\"xq-icon-disc xq-icon-disc-red\" aria-hidden=\"true\">\u5e25</span>"
  },
  {
    slug: "shogi",
    category: "strategy",
    nameKey: "game_shogi",
    nameText: "Shogi",
    descKey: "home_shogi_desc",
    descText: "Japanese chess, where captured pieces switch sides and rejoin the battle. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"shogi-icon-piece\" aria-hidden=\"true\">\u738b</span>"
  },
  {
    slug: "cardtactics",
    category: "strategy",
    nameKey: "game_card_tactics",
    nameText: "Card Tactics",
    descKey: "home_card_tactics_desc",
    descText: "A fast, elegant duel decided by five shifting move cards.",
    popular: false,
    icon: "<span class=\"onitama-icon-piece onitama-icon-piece-blue\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "hnefatafl",
    category: "strategy",
    nameKey: "game_hnefatafl",
    nameText: "Hnefatafl (Viking Chess)",
    descKey: "home_hnefatafl_desc",
    descText: "An asymmetric Norse game: the king must escape, the attackers must trap him.",
    popular: false,
    icon: "<span class=\"hnefatafl-icon-piece hnefatafl-icon-piece-defender\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "go",
    category: "strategy",
    nameKey: "game_go",
    nameText: "Go",
    descKey: "home_go_desc",
    descText: "The ancient territory game. Local 2-player or vs. the built-in engine, three board sizes, three difficulty levels.",
    popular: false,
    icon: "<span class=\"go-stone-icon go-stone-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "reversi",
    category: "strategy",
    nameKey: "game_reversi",
    nameText: "Reversi",
    descKey: "home_reversi_desc",
    descText: "Flip the board's colour by flanking your opponent's discs. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"othello-icon-disc othello-icon-disc-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "fourinarow",
    category: "strategy",
    nameKey: "game_four_in_a_row",
    nameText: "Four in a Row",
    descKey: "home_four_in_a_row_desc",
    descText: "Drop discs to connect four in a row before your opponent does. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"c4-icon-disc c4-icon-disc-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "gomoku",
    category: "strategy",
    nameKey: "game_gomoku",
    nameText: "Gomoku",
    descKey: "home_gomoku_desc",
    descText: "Get five stones in a row first, on a Go-sized board. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"go-stone-icon go-stone-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "hex",
    category: "strategy",
    nameKey: "game_hex",
    nameText: "Hex",
    descKey: "home_hex_desc",
    descText: "Connect your two sides of a hexagonal board before your opponent connects theirs.",
    popular: false,
    icon: "<span class=\"hex-icon-piece hex-icon-piece-r\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "morris",
    category: "strategy",
    nameKey: "game_morris",
    nameText: "Morris",
    descKey: "home_morris_desc",
    descText: "A centuries-old strategy game of placing and sliding pieces to form mills. Local 2-player or vs. the built-in engine, with the classic flying endgame rule.",
    popular: false,
    icon: "<span class=\"morris-icon-disc morris-icon-disc-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "wallmaze",
    category: "strategy",
    nameKey: "game_wall_maze",
    nameText: "Wall Maze",
    descKey: "home_wall_maze_desc",
    descText: "Race to the far side of the board while building walls to block your opponent.",
    popular: false,
    icon: "<span class=\"quoridor-icon-piece quoridor-icon-piece-p1\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "halma",
    category: "strategy",
    nameKey: "game_halma",
    nameText: "Halma",
    descKey: "home_halma_desc",
    descText: "Race all your pieces across the board into your opponent's starting camp.",
    popular: false,
    icon: "<span class=\"halma-icon-piece halma-icon-piece-p1\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "sternhalma",
    category: "strategy",
    nameKey: "game_sternhalma",
    nameText: "Chinese Checkers",
    descKey: "home_sternhalma_desc",
    descText: "Race all ten of your marbles across the star-shaped board into the point opposite yours.",
    popular: false,
    icon: "<span class=\"sternhalma-icon-piece sternhalma-icon-piece-p1\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "dotsandboxes",
    category: "strategy",
    nameKey: "game_dotsandboxes",
    nameText: "Dots and Boxes",
    descKey: "home_dotsandboxes_desc",
    descText: "Draw lines between dots to complete boxes and claim them - whoever completes a box goes again. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect x=\"14\" y=\"14\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"43\" y=\"14\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"72\" y=\"14\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"14\" y=\"43\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"43\" y=\"43\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"72\" y=\"43\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"14\" y=\"72\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"43\" y=\"72\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"72\" y=\"72\" width=\"14\" height=\"14\" fill=\"#000\"/><rect x=\"28\" y=\"17\" width=\"15\" height=\"8\" fill=\"#000\"/></svg></span>"
  },
  {
    slug: "amazons",
    category: "strategy",
    nameKey: "game_amazons",
    nameText: "Amazons",
    descKey: "home_amazons_desc",
    descText: "Move a queen-like amazon, then shoot a permanent arrow from its new square to slowly wall off the board.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><circle cx=\"30\" cy=\"70\" r=\"10\" fill=\"#000\"/><line x1=\"38\" y1=\"62\" x2=\"78\" y2=\"22\" stroke=\"#000\" stroke-width=\"4\"/><polygon points=\"78,22 62,26 74,34\" fill=\"#000\"/><rect x=\"14\" y=\"80\" width=\"16\" height=\"16\" fill=\"#000\" opacity=\"0.35\"/><rect x=\"70\" y=\"14\" width=\"16\" height=\"16\" fill=\"#000\" opacity=\"0.35\"/></svg></span>"
  },
  {
    slug: "backgammon",
    category: "race",
    nameKey: "game_backgammon",
    nameText: "Backgammon",
    descKey: "home_backgammon_desc",
    descText: "The classic dice race game. Local 2-player or vs. the built-in engine, with the bar, bearing off, and blot-hitting.",
    popular: true,
    icon: "<span class=\"bg-icon-checker bg-icon-checker-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "ur",
    category: "race",
    nameKey: "game_ur",
    nameText: "Ur",
    descKey: "home_ur_desc",
    descText: "A 4,600-year-old race game rediscovered from ancient Mesopotamia. Local 2-player or vs. the built-in engine, with rosette squares and capture-by-landing.",
    popular: false,
    icon: "<span class=\"ur-piece-icon ur-piece-icon-black\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "senet",
    category: "race",
    nameKey: "game_senet",
    nameText: "Senet",
    descKey: "home_senet_desc",
    descText: "One of the oldest known board games, from ancient Egypt. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"senet-icon-disc senet-icon-disc-a\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "mancala",
    category: "race",
    nameKey: "game_mancala",
    nameText: "Mancala",
    descKey: "home_mancala_desc",
    descText: "One of the world's oldest game families: sow seeds around the board to fill your own store. Local 2-player or vs. the built-in engine, with captures and extra turns.",
    popular: false,
    icon: "<span class=\"mancala-seed-icon\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "yatzy",
    category: "race",
    nameKey: "game_yatzy",
    nameText: "Yatzy",
    descKey: "home_yatzy_desc",
    descText: "The classic 5-dice scoring game. Roll up to three times a turn, hold the dice you want to keep, and fill in all 15 categories on the scoresheet for the highest total.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><rect x=\"6\" y=\"6\" width=\"88\" height=\"88\" rx=\"16\" fill=\"#ffffff\" stroke=\"#000\" stroke-width=\"6\"/><circle cx=\"27\" cy=\"27\" r=\"9\" fill=\"#000\"/><circle cx=\"50\" cy=\"50\" r=\"9\" fill=\"#000\"/><circle cx=\"73\" cy=\"27\" r=\"9\" fill=\"#000\"/><circle cx=\"27\" cy=\"73\" r=\"9\" fill=\"#000\"/><circle cx=\"73\" cy=\"73\" r=\"9\" fill=\"#000\"/></svg></span>"
  },
  {
    slug: "sudoku",
    category: "puzzles",
    nameKey: "game_sudoku",
    nameText: "Sudoku",
    descKey: "home_sudoku_desc",
    descText: "Fill a 9x9 grid with digits so every row, column and 3x3 box contains 1-9 exactly once. Freshly generated with a unique solution, in three difficulty levels.",
    popular: true,
    icon: "<span class=\"sudoku-icon\" aria-hidden=\"true\">9</span>"
  },
  {
    slug: "minesweeper",
    category: "puzzles",
    nameKey: "game_minesweeper",
    nameText: "Minesweeper",
    descKey: "home_minesweeper_desc",
    descText: "Uncover every safe square using the number clues, without triggering a hidden mine.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 512 512\"><path fill=\"#000\" d=\"M179.323 82.448c-5.76 2.304-11.519 4.965-18.43 7.856V34.068c0-5.092 4.607-9.216 9.699-9.216h156.325a9.135 9.135 0 0 1 9.066 9.216v49.854a143.988 143.988 0 0 0-18.43-6.335V43.283h-138.23zm105.17 192.91c-2.431-5.852-.346-12.314 1.497-18.005l.092-.276-.276.092c-5.702 1.843-12.153 3.928-18.005 1.498-5.851-2.43-8.593-8.064-11.38-13.535l-.415-.807-.415.807c-2.788 5.483-5.667 11.162-11.38 13.535-5.714 2.373-12.303.345-18.005-1.498l-.277-.092.093.276c1.843 5.702 3.916 12.165 1.497 18.005-2.419 5.84-8.063 8.593-13.535 11.38l-.806.415.806.415c5.495 2.788 11.162 5.667 13.535 11.38 2.373 5.714.346 12.315-1.497 18.005l-.093.277.277-.093c3.847-1.244 8.063-2.591 12.164-2.591a15.078 15.078 0 0 1 5.84 1.152c5.76 2.373 8.593 8.063 11.381 13.534l.415.807.414-.807c2.788-5.483 5.668-11.162 11.381-13.534 5.714-2.373 12.303-.346 18.005 1.497l.276.092-.092-.276c-1.843-5.702-3.917-12.164-1.498-18.005 2.42-5.84 8.064-8.593 13.535-11.38l.807-.415-.807-.415c-5.494-2.88-11.173-5.76-13.535-11.473zm59.277 11.795a87.764 87.764 0 1 1-87.764-87.764 87.868 87.868 0 0 1 87.752 87.73zm-22.382 0c0-9.215-8.674-13.627-14.975-16.84-1.313-.669-3.087-1.567-4.32-2.304.346-1.498 1.026-3.583 1.475-4.988 2.143-6.635 5.068-15.724-1.29-22.082-6.359-6.359-15.447-3.456-22.082-1.29-1.406.449-3.456 1.152-4.988 1.474-.749-1.232-1.647-3.006-2.304-4.32-3.214-6.335-7.625-14.974-16.84-14.974-9.216 0-13.628 8.674-16.842 14.974-.668 1.314-1.566 3.088-2.303 4.32-1.498-.345-3.583-1.025-4.988-1.474-6.635-2.143-15.724-5.069-22.082 1.301-6.359 6.37-3.456 15.447-1.302 22.082.45 1.406 1.152 3.456 1.475 4.988-1.233.749-3.007 1.647-4.32 2.304-6.336 3.214-14.975 7.626-14.975 16.84 0 9.216 8.674 13.628 14.975 16.842 1.313.668 3.087 1.566 4.32 2.304-.346 1.497-1.026 3.582-1.475 4.987-2.142 6.635-5.068 15.724 1.302 22.082 6.37 6.359 15.447 3.456 22.082 1.302 1.405-.46 3.456-1.152 4.988-1.474.748 1.232 1.647 3.006 2.303 4.32 3.214 6.335 7.626 14.974 16.841 14.974 9.216 0 13.627-8.674 16.841-14.975.668-1.313 1.567-3.087 2.304-4.32 1.498.358 3.582 1.026 4.988 1.475 6.635 2.143 15.723 5.068 22.082-1.29 6.358-6.359 3.456-15.447 1.302-22.082-.45-1.405-1.152-3.456-1.475-4.988 1.233-.737 3.007-1.647 4.32-2.304 6.278-3.271 14.952-7.683 14.952-16.898zm134.612 0c0 110.272-89.71 199.995-199.994 199.995S56 397.39 56 287.118c0-110.271 89.722-199.993 199.994-199.993s199.994 89.71 199.994 199.994zm-93.788 0a106.194 106.194 0 1 0-106.195 106.195 106.321 106.321 0 0 0 106.172-106.23z\"/></svg></span>"
  },
  {
    slug: "twenty48",
    category: "puzzles",
    nameKey: "game_2048",
    nameText: "2048",
    descKey: "home_2048_desc",
    descText: "Slide and merge numbered tiles to reach 2048 before the board fills up. Keep playing afterward to push your best score even higher.",
    popular: false,
    icon: "<span class=\"twenty48-icon\" aria-hidden=\"true\">2048</span>"
  },
  {
    slug: "freecell",
    category: "puzzles",
    nameKey: "game_freecell",
    nameText: "FreeCell",
    descKey: "home_freecell_desc",
    descText: "The classic card solitaire where nearly every deal can be won with the right moves. Full supermoves and a one-click collect to the foundations.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 512 512\"><path fill=\"#000\" d=\"M119.436 36c-16.126 0-29.2 17.237-29.2 38.5v363c0 21.263 13.074 38.5 29.2 38.5h275.298c16.126 0 29.198-17.237 29.198-38.5v-363c0-21.263-13.072-38.5-29.198-38.5H119.436zm26.654 8.047s46.338 33.838 47.271 63.068c.776 24.287-25.024 32.122-40.775 18.586l13.633 32.653h-40.117l13.613-32.635c-15.535 13.88-40.006 5.349-40.758-18.604-.88-28.01 47.133-63.068 47.133-63.068zm95.646 120.957h7.963l63.121 160.834c2.536 6.498 7.727 9.748 15.573 9.748h5.468v8.916h-70.134v-8.916h5.587c7.291 0 12.442-.792 15.454-2.377 2.06-1.11 3.09-2.813 3.09-5.111 0-1.347-.278-2.774-.833-4.28l-14.62-37.326h-69.423l-8.2 21.397c-2.14 5.706-3.21 10.222-3.21 13.55 0 3.884 1.782 7.213 5.348 9.987 3.645 2.774 8.916 4.16 15.81 4.16h5.944v8.916h-63.715v-8.916c6.815 0 12.204-1.466 16.166-4.399 3.962-3.011 7.61-8.676 10.938-16.998l59.673-149.185zm-3.447 33.879l-31.502 78.338h62.17l-30.668-78.338zm107.49 154.765h40.116l-13.633 32.653c15.75-13.536 41.551-5.701 40.775 18.586-.933 29.23-47.27 63.068-47.27 63.068s-48.011-35.058-47.132-63.068c.751-23.953 25.222-32.485 40.758-18.604l-13.614-32.635z\"/></svg></span>"
  },
  {
    slug: "mahjong",
    category: "puzzles",
    nameKey: "game_mahjong_solitaire",
    nameText: "Mahjong Solitaire",
    descKey: "home_mahjong_solitaire_desc",
    descText: "Clear the layered tile layout by matching identical pairs. Every deal is generated to always have a solution.",
    popular: false,
    icon: "<span class=\"mahjong-icon\" aria-hidden=\"true\">\u9ebb</span>"
  },
  {
    slug: "nonogram",
    category: "puzzles",
    nameKey: "game_nonograms",
    nameText: "Nonograms (Picross)",
    descKey: "home_nonograms_desc",
    descText: "Use row and column number clues to reveal a hidden picture, one cell at a time. A fresh, uniquely-solvable puzzle in three sizes.",
    popular: false,
    icon: "<span class=\"nonogram-icon\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "pegsolitaire",
    category: "puzzles",
    nameKey: "game_peg_solitaire",
    nameText: "Peg Solitaire",
    descKey: "home_peg_solitaire_desc",
    descText: "Jump pegs over each other on a cross-shaped board until only one remains.",
    popular: false,
    icon: "<span class=\"peg-icon\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "lightsout",
    category: "puzzles",
    nameKey: "game_lightsout",
    nameText: "Lights Out",
    descKey: "home_lightsout_desc",
    descText: "Press a cell to toggle it and its neighbors on and off. Turn off every light to win - every puzzle is generated to always have a solution.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><rect x=\"20\" y=\"20\" width=\"20\" height=\"20\" fill=\"#fff\"/><rect x=\"40\" y=\"20\" width=\"20\" height=\"20\" fill=\"#141413\"/><rect x=\"60\" y=\"20\" width=\"20\" height=\"20\" fill=\"#fff\"/><rect x=\"20\" y=\"40\" width=\"20\" height=\"20\" fill=\"#141413\"/><rect x=\"40\" y=\"40\" width=\"20\" height=\"20\" fill=\"#141413\"/><rect x=\"60\" y=\"40\" width=\"20\" height=\"20\" fill=\"#141413\"/><rect x=\"20\" y=\"60\" width=\"20\" height=\"20\" fill=\"#fff\"/><rect x=\"40\" y=\"60\" width=\"20\" height=\"20\" fill=\"#141413\"/><rect x=\"60\" y=\"60\" width=\"20\" height=\"20\" fill=\"#fff\"/><rect x=\"20\" y=\"20\" width=\"60\" height=\"60\" fill=\"none\" stroke=\"#141413\" stroke-width=\"4\"/><path d=\"M40 20V80M60 20V80M20 40H80M20 60H80\" stroke=\"#141413\" stroke-width=\"1.5\"/></svg></span>"
  },
  {
    slug: "mastermind",
    category: "puzzles",
    nameKey: "game_mastermind",
    nameText: "Mastermind",
    descKey: "home_mastermind_desc",
    descText: "Crack a hidden 4-shape code within a limited number of guesses, using black and white peg feedback. Repeats may be allowed, depending on the difficulty.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><rect x=\"4\" y=\"4\" width=\"92\" height=\"92\" rx=\"12\" fill=\"#ffffff\" stroke=\"#000\" stroke-width=\"6\"/><circle cx=\"20\" cy=\"50\" r=\"10\" fill=\"#000\"/><rect x=\"31\" y=\"41\" width=\"18\" height=\"18\" fill=\"#000\"/><polygon points=\"60,38 70,60 50,60\" fill=\"#000\"/><polygon points=\"80,38 92,50 80,62 68,50\" fill=\"#000\"/></svg></span>"
  },
  {
    slug: "klondike",
    category: "puzzles",
    nameKey: "game_klondike",
    nameText: "Klondike",
    descKey: "home_klondike_desc",
    descText: "The original patience game solitaire is named after - seven cascading tableau columns, four foundations, and a draw pile to work through. The game Windows made famous.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><g><rect x=\"16\" y=\"24\" width=\"34\" height=\"48\" rx=\"4\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"3.5\" transform=\"rotate(-14 50 60)\"/><g clip-path=\"url(#klondike-back-clip)\" transform=\"rotate(-14 50 60)\"><line x1=\"10\" y1=\"30\" x2=\"56\" y2=\"76\" stroke=\"#000\" stroke-width=\"3\"/><line x1=\"10\" y1=\"42\" x2=\"44\" y2=\"76\" stroke=\"#000\" stroke-width=\"3\"/><line x1=\"10\" y1=\"54\" x2=\"32\" y2=\"76\" stroke=\"#000\" stroke-width=\"3\"/><line x1=\"22\" y1=\"24\" x2=\"56\" y2=\"58\" stroke=\"#000\" stroke-width=\"3\"/><line x1=\"34\" y1=\"24\" x2=\"56\" y2=\"46\" stroke=\"#000\" stroke-width=\"3\"/></g></g><defs><clipPath id=\"klondike-back-clip\"><rect x=\"16\" y=\"24\" width=\"34\" height=\"48\" rx=\"4\"/></clipPath></defs><g transform=\"rotate(14 50 60)\"><rect x=\"50\" y=\"24\" width=\"34\" height=\"48\" rx=\"4\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"3.5\"/><path d=\"M67 34c-5 5-9 9-9 14a9 9 0 0 0 18 0c0-5-4-9-9-14z\" fill=\"#000\"/></g><rect x=\"33\" y=\"20\" width=\"34\" height=\"48\" rx=\"4\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"3.5\"/><path d=\"M50 30c-6 6-11 11-11 17a11 11 0 0 0 22 0c0-6-5-11-11-17z\" fill=\"none\" stroke=\"#000\" stroke-width=\"3\"/><rect x=\"47\" y=\"44\" width=\"6\" height=\"10\" fill=\"#000\"/></svg></span>"
  },
  {
    slug: "spidersolitaire",
    category: "puzzles",
    nameKey: "game_spidersolitaire",
    nameText: "Spider Solitaire",
    descKey: "home_spidersolitaire_desc",
    descText: "Two decks, ten tableau columns, no foundations - build same-suit King-to-Ace runs to clear them. Choose 1, 2, or 4 suits for an easier or harder deal.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg viewBox=\"0 0 100 100\"><ellipse cx=\"50\" cy=\"58\" rx=\"18\" ry=\"14\" fill=\"#000\"/><circle cx=\"50\" cy=\"36\" r=\"10\" fill=\"#000\"/><g stroke=\"#000\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"><path d=\"M35 46 L10 30\"/><path d=\"M33 56 L6 52\"/><path d=\"M35 66 L10 80\"/><path d=\"M40 74 L25 94\"/><path d=\"M65 46 L90 30\"/><path d=\"M67 56 L94 52\"/><path d=\"M65 66 L90 80\"/><path d=\"M60 74 L75 94\"/></g></svg></span>"
  },
  {
    slug: "kakuro",
    category: "puzzles",
    nameKey: "game_kakuro",
    nameText: "Kakuro",
    descKey: "home_kakuro_desc",
    descText: "Fill white cells with digits 1-9 so every run sums to its clue, with no digit repeated within a run. Freshly generated, in three difficulty levels.",
    popular: false,
    icon: "<span class=\"kakuro-icon\" aria-hidden=\"true\"></span>"
  },
  {
    slug: "fanorona",
    category: "strategy",
    nameKey: "game_fanorona",
    nameText: "Fanorona",
    descKey: "home_fanorona_desc",
    descText: "Madagascar's national board game: slide pieces along a 5x9 grid of lines to capture by approach or withdrawal. Local 2-player or vs. the built-in engine.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#000\" stroke-width=\"2.5\" fill=\"none\"><line x1=\"12\" y1=\"20\" x2=\"88\" y2=\"20\"/><line x1=\"12\" y1=\"50\" x2=\"88\" y2=\"50\"/><line x1=\"12\" y1=\"80\" x2=\"88\" y2=\"80\"/><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"80\"/><line x1=\"31\" y1=\"20\" x2=\"31\" y2=\"80\"/><line x1=\"50\" y1=\"20\" x2=\"50\" y2=\"80\"/><line x1=\"69\" y1=\"20\" x2=\"69\" y2=\"80\"/><line x1=\"88\" y1=\"20\" x2=\"88\" y2=\"80\"/><line x1=\"12\" y1=\"20\" x2=\"31\" y2=\"50\"/><line x1=\"50\" y1=\"20\" x2=\"69\" y2=\"50\"/><line x1=\"50\" y1=\"20\" x2=\"31\" y2=\"50\"/><line x1=\"88\" y1=\"20\" x2=\"69\" y2=\"50\"/><line x1=\"31\" y1=\"50\" x2=\"50\" y2=\"80\"/><line x1=\"31\" y1=\"50\" x2=\"12\" y2=\"80\"/><line x1=\"69\" y1=\"50\" x2=\"88\" y2=\"80\"/><line x1=\"69\" y1=\"50\" x2=\"50\" y2=\"80\"/></g><g fill=\"#000\"><circle cx=\"12\" cy=\"20\" r=\"5\"/><circle cx=\"31\" cy=\"20\" r=\"5\"/><circle cx=\"50\" cy=\"20\" r=\"5\"/><circle cx=\"69\" cy=\"20\" r=\"5\"/><circle cx=\"88\" cy=\"20\" r=\"5\"/><circle cx=\"12\" cy=\"50\" r=\"5\"/><circle cx=\"31\" cy=\"50\" r=\"5\"/><circle cx=\"50\" cy=\"50\" r=\"5\"/><circle cx=\"69\" cy=\"50\" r=\"5\"/><circle cx=\"88\" cy=\"50\" r=\"5\"/><circle cx=\"12\" cy=\"80\" r=\"5\"/><circle cx=\"31\" cy=\"80\" r=\"5\"/><circle cx=\"50\" cy=\"80\" r=\"5\"/><circle cx=\"69\" cy=\"80\" r=\"5\"/><circle cx=\"88\" cy=\"80\" r=\"5\"/></g></svg></span>"
  },
  {
    slug: "baghchal",
    category: "strategy",
    nameKey: "game_baghchal",
    nameText: "Bagh-Chal",
    descKey: "home_baghchal_desc",
    descText: "Nepal's traditional hunt game: 4 tigers vs. 20 goats on an alquerque-style 5x5 board of lines. Local 2-player or vs. the built-in engine, playing either side.",
    popular: false,
    icon: "<span class=\"game-select-icon-svg\" aria-hidden=\"true\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><g stroke=\"#000\" stroke-width=\"2.5\" fill=\"none\"><line x1=\"10\" y1=\"10\" x2=\"90\" y2=\"10\"/><line x1=\"10\" y1=\"50\" x2=\"90\" y2=\"50\"/><line x1=\"10\" y1=\"90\" x2=\"90\" y2=\"90\"/><line x1=\"10\" y1=\"10\" x2=\"10\" y2=\"90\"/><line x1=\"50\" y1=\"10\" x2=\"50\" y2=\"90\"/><line x1=\"90\" y1=\"10\" x2=\"90\" y2=\"90\"/><line x1=\"10\" y1=\"10\" x2=\"90\" y2=\"90\"/><line x1=\"90\" y1=\"10\" x2=\"10\" y2=\"90\"/></g><polygon points=\"10,17 3,3 17,3\" fill=\"#b5651d\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"90,17 83,3 97,3\" fill=\"#b5651d\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"10,97 3,83 17,83\" fill=\"#b5651d\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"90,97 83,83 97,83\" fill=\"#b5651d\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"50\" cy=\"50\" r=\"7\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"2.5\"/><circle cx=\"30\" cy=\"30\" r=\"6\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"70\" cy=\"70\" r=\"6\" fill=\"#fff\" stroke=\"#000\" stroke-width=\"2\"/></svg></span>"
  },
];
