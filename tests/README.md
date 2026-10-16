# Tests

A small, dependency-light regression suite covering the checks that were
otherwise being re-run by hand from a scratch script before every change
to this project. There's no build step and no test framework - just
plain Node scripts, matching the rest of the codebase.

## Prerequisites

- Node.js.
- [Playwright](https://playwright.dev/) with a Chromium browser, for
  `css-check.js`, `board-sweep.js`, `interaction-sweep.js` and
  `i18n-runtime-sweep.js` (not needed for `static-checks.js` or
  `i18n-messages.js`). If it isn't already installed:

  ```
  npm install -g playwright
  npx playwright install chromium
  ```
- `python3`, for the throwaway web server that `run-all.sh`
  starts. Not needed when running a single check by hand.

## Running everything

```
bash tests/run-all.sh
```

This starts a throwaway `python3 -m http.server` for the repo root,
runs every check below against it, and shuts the server down again.
Set `PORT` to use a port other than 8000 if that one's busy.

## Running a single check

- `node tests/static-checks.js` - no server or browser needed. JS
  syntax on every file, HTML well-formedness on every real page, i18n
  key parity across all 12 languages (`i18n.js` for English,
  `lang/*.js` for the rest), and no
  `data-i18n`/`data-i18n-attr` reference anywhere (static markup or
  markup a script builds at runtime) pointing at a key that doesn't
  exist. Also that every `APP_SHELL` entry in `sw.js` appears once, its
  file exists, and its checksum in `FILE_HASHES` matches the file (after
  changing any file, run `node tools/sw-hashes.js`). And that the
  version in `CACHE_NAME` has its entry in `release-notes.js`, every
  entry with its sentence in all 12 languages.
- `node tests/i18n-messages.js` - no server or browser needed. Runs a
  sample of every runtime status/result message shape through
  `I18n.msg()` in all 10 non-English languages and fails on anything
  left untranslated, unfilled placeholders, or (for uk/ru/ja/zh)
  leftover English words; also checks `msg_t_*` template placeholders
  match across languages.
- `node tests/cake-core.js` - no server or browser needed. Generates
  500 "Who Took the Cake?" puzzles per level from fixed seeds and fails
  unless each has exactly one solution, is solvable by deduction alone
  at its level, has the needed clues plus 2 (easy) / 1 (medium) extra
  ones, and can be played to the end with the hint button (mistakes
  first, animals in the order of reasoning, the cake left to the
  player). For the first 200 per level every hint's reason is checked
  against the board and its sentence in all 12 languages. The themes
  (cats, bears, dogs, magpies, family, children and treasure) each have
  their drawings and all their texts in 12 languages; 500 cases per
  level and theme stay solvable with exactly one solution, every one of
  the 12 rooms and 12 pieces of furniture turns up in each level's 500,
  every piece stands in a room it belongs to and is named by some clue.
- `node tests/animalsudoku-core.js` - no server or browser needed.
  Generates 60 "Animal Sudoku" puzzles per size and level from fixed
  seeds and fails unless each has exactly one solution, can be solved
  with the two simple steps alone, and can be played to the end with
  the hint only.
- `node tests/shapesort-core.js` - no server or browser needed. Deals
  40 "Shape Sort" puzzles per level from fixed seeds and fails unless
  each starts with two empty tubes and no finished one, is solved by its
  own solution, and can be played to the end with the hint only - also
  after a few random moves (unless the solver finds no way out).
- `node tests/linkpairs-core.js` - no server or browser needed. Checks
  all stored "Link the Pairs" puzzles (`linkpairs-puzzles.js`): lines
  through every cell, exactly one solution, and the first 100 per level
  solvable with the hint alone, also after some wrong lines.
- `node tests/oldmaid-core.js` - no server or browser needed. Plays 500
  "Old Maid" games each with 2, 3 and 4 players (random draws) and fails
  unless every game ends with exactly one player holding only the Black
  Peter and the card count stays the pack size.
- `node tests/war-core.js` - no server or browser needed. Plays 1000
  "War" games to the end and 1000 short ones and fails unless each ends
  (short: within 30 rounds; full: within 2000, else a draw) and all 32
  cards stay in play after every round.
- `node tests/snakesladders-core.js` - no server or browser needed.
  Checks both "Snakes and Ladders" boards and plays 1000 computer games
  per board and finishing rule; every game must end with no token
  outside the board.
- `node tests/blockers-core.js` - no server or browser needed. Plays
  500 "Path Blockers" games each for 2, 3 and 4 players with mixed
  computer levels and fails unless every move uses the full roll, steps
  only between joined fields, never visits a field twice or passes a
  stone, and every game ends with 6 stones and 5 tokens per player.
- `node tests/blackjack-core.js` - no server or browser needed. Checks 20
  fixed "17 and 4" / "Blackjack" hands, then plays 10000 rounds per
  variant with a random player and fails unless the points are counted
  right (Ace 1 or 11), the bank draws below 17 and stands from 17, no
  card is dealt twice, the chips change by the bet as the result says
  and never go below 0.
- `node tests/poker-core.js` - no server or browser needed (about 40
  seconds). Checks 200 fixed Texas Hold'em hands (20 per hand category)
  and 30 fixed pairs of hands, compares 3000 random hands with a separate
  reference, then plays 2000 games between computers (2 to 4 players,
  levels mixed) and fails unless every action is legal, the chips always
  add up to the same total, no stack goes below 0 and every pot is shared
  out in full.
- `node tests/skat-core.js` - no server or browser needed (about 50
  seconds). Checks 33 fixed Skat game values and results (matadors,
  Hand, Schneider, Schwarz, announcements, Ouvert, Null, lost and overbid
  games), then plays 1000 games between computers and fails unless every
  bid is a game value and rising, every card follows suit when it can,
  the 32 cards and 120 points are all there and the game value and
  result match a separate calculation.
- `node tests/schafkopf-core.js` - no server or browser needed (about
  40 seconds). Checks 19 fixed Schafkopf scores (tariff with Schneider,
  Schwarz and Laufende) and 8 examples of counting the Laufende, then
  plays 1000 games between computers and fails unless every trick goes to
  the right card (checked separately), every card follows suit when it
  can, the called Sow is played when its suit is led and not thrown away
  before, the 120 points are all counted and the score matches a separate
  calculation and adds up to 0.
- `node tests/canasta-core.js` - no server or browser needed (about 70
  seconds). Checks fixed Canasta examples (card values, minimum for the
  first meld, valid melds, taking the pile frozen and not frozen, black
  Threes, going out only with two canastas, scores of a hand), then plays
  500 games between computers (every fifth the short game to 2000) and
  fails unless every game ends, all 108 cards stay in play after every
  move, every meld is valid and the score of every hand matches a
  separate calculation.
- `node tests/bridge-core.js` - no server or browser needed (about 70
  seconds). Checks 60 fixed bridge examples (contract points, overtricks,
  doubled and redoubled contracts, slams, undertricks, honours, Chicago
  vulnerability and bonuses, part-scores adding up to a game, passed-out
  deals, rubber bonuses, auction rules), then plays 500 deals between
  computers (Chicago and rubber) and fails unless every call is allowed,
  the declarer is right, every card follows suit when it can, 13 tricks
  are played with each card once, the trick goes to the right card and
  the score matches a separate calculation.
- `node tests/tenpairs-core.js` - no server or browser needed (a few
  seconds). Checks 45 fixed Pairs to Ten examples (seeing each other
  across, down, diagonally, over crossed-out cells and over the end of a
  row; equal or 10; vanishing rows; Add; win and loss), then plays 1000
  games only with Hint and Add and fails unless every crossed-out pair is
  valid (checked separately) and every game ends.
- `node tests/new-games-order.js` - no server or browser needed. Checks
  that the home page's "New Games" (8 games) and games.html's "Newest
  first" put the newest game first, also among games of the same day
  (`added` carries the time of the commit that brought the game).
- `node tests/kids-games.js` - needs a running server and a browser.
  Checks that games-kids.html (over all its pages) and games.html's
  "Children's Games" filter show exactly the games marked `kids: true`,
  the home page's tile and the old addresses leading there, that all
  their links answer, that Mau Mau opens with the animal cards from
  there, the link on calm.html, and no sideways scrolling.
- `node tests/move-hints.js` - needs a running server and a browser.
  Setting "Show move suggestions": off by default, so Domino (Triangles),
  Mau Mau and Card duel mark nothing and refuse a wrong move with a line;
  switched on in the Settings menu they mark again; on by default for
  Mau Mau with the animal cards; the checkbox only on games that mark
  moves; no sideways scrolling at 600 and 360 px.
- `node tests/domino-core.js` - no server or browser needed. 500
  computer games per number of players (2-4) for classic Domino and for
  the triangles variant: every game ends, every move is legal, no tile is
  lost or doubled, and on the triangle board every corner keeps one
  number for all tiles meeting there.
- `node tests/mathcross-core.js` - no server or browser needed. 500
  "Math Cross" puzzles per level: worked from left to right with whole
  numbers above 0, only the level's operators, exactly one solution,
  solvable by deduction alone, and playable to the end with the hint.
- `node tests/differences-core.js` - no server or browser needed. 500
  "Spot the Difference" picture pairs per level: 3 / 5 / 7 differences,
  each in an area of its own, every difference changes the drawing and
  nothing else differs; and 200 search pictures per room (12 rooms) and
  level: 5 / 7 / 10 things to find, all things of the room, each in the
  picture exactly once (no other drawing has its type, pattern and
  direction), the room's background drawn; names of all drawings and
  rooms in 12 languages.
- `node tests/pentomino-core.js` - no server or browser needed. 500
  "Pentomino Puzzle" puzzles per mode and level: every stored solution
  fills the board legally, the free fields have the right sizes, the
  start-pieces puzzles have exactly one solution, and the first 50 of
  each can be finished with the hint alone. About 45 seconds.
- `node tests/arrows-core.js` - no server or browser needed. 500
  "Arrows" puzzles per level: every arrow a line of neighbouring cells
  with its head pointing the way of its last step, no overlaps, the
  level's field and arrow lengths, nesting of at least 3 / 5 / 7 rounds;
  played with the hint alone each field is cleared in exactly the fewest
  moves (one per arrow). Hard and Master (11 x 11, gliding arrows with at
  most two corners): the solver finds a way out and replaying it clears
  the field, so does the gliding hint alone; a random player gets stuck
  in at least 60 % of all tries (share printed). Easy and Medium make the
  same puzzles as before (fingerprint). About 3 minutes.
- `node tests/rings-core.js` - no server or browser needed. 500 "Turn the
  Rings" puzzles per level: 3 / 4 / 5 rings with 4 / 6 / 8 shapes,
  coupling only on Hard, the fewest moves in the level's range and
  confirmed by an independent search, the hint solves each in exactly
  that many moves. About 30 seconds.
- `node tests/tangram-core.js` - no server or browser needed. "Tangram":
  the seven pieces and all 90 outlines (29 of them "Outline only": drawn
  as one line along the edge, nothing inside, pieces may be laid
  sticking out) - each one connected area of 8,
  solvable (the found solution is checked on its own), filled with the
  hint alone even after a wrongly laid piece. Under a second.
- `node tests/catplaces-core.js` - no server or browser needed. 500
  "Cat Places" fields per level (5 x 5, 7 x 7, 8 x 8): n connected rooms,
  exactly one solution (counted by a search of its own), solved by
  deduction alone with the level's rules, finished with the hint alone
  after a wrongly placed cat. About two minutes.
- `node tests/loosen-core.js` - no server or browser needed. 500 "Loosen
  the Rings" puzzles per level (3 / 4-5 / 6-7 rings): one group without
  closed loops, nothing free at the start, the solver clears each in
  exactly the stored fewest moves (confirmed by a second search for the
  first 40 per level); a random player fails (not clear after twice the
  fewest moves) in most tries on Hard (share printed). About 40 seconds.
- `node tests/matches-core.js` - no server or browser needed. All 90
  "Matchstick Puzzles": the start is wrong (sums) or lacks the asked
  number of squares, a full search finds a solution with exactly 1 or 2
  moved matches and none with fewer, sums have exactly one solution, the
  hint solves each in the stated number of moves. About 3 seconds.
- `node tests/cardduel-core.js` - no server or browser needed. "Card
  Duel": 4 decks of 30 cards, at most 6 abilities, every card and ability
  named in 12 languages; 500 computer games (medium against medium) for
  each of the 16 deck pairings - every game ends, every move is legal,
  each deck wins 40-60 % in every pairing, the starter at most 55 % -,
  hard beats easy in at least 70 % of 200 games, and single rules
  (Bulwark, Nimble, Thick Skin, empty deck, 6 creatures, the evening out
  of the start); every card has its own picture in cardduel-art.js (none
  missing, none shared by two cards, a portrait per mage, the file under
  300 KB; the size is printed). About 90 seconds.
- `node tests/villains-core.js` - no server or browser needed.
  "Fairy-Tale Villains": six villains with four places each, all names
  in 12 languages; 500 computer games for each number of players (2, 3,
  4) with random villains - every game ends, every move is legal, gold
  never negative, each villain wins within +/- 8 points of its fair
  share -, and single rules (a hero blocks his place, helpers lower the
  price, the Messenger, the thorn hedge, the wolf in the forest, a
  twist). About two minutes.
- `node tests/forestvillage-core.js` - no server or browser needed.
  "Forest Village": 50 different cards (25 buildings, 25 animals, every
  animal with its building), all names in 12 languages; 500 computer
  games for each number of players (1 to 4) - every game ends, every move
  is legal, resources never below 0, at most 15 cards per village and 8
  in hand, the first player wins within +/- 8 points of the fair share -,
  Hard beats Easy in at least 70 % of 400 games, and single rules (free
  animal next to its building, taken and shared fields, spring, full
  village). About a minute.
- `node tests/adventurebook-core.js` - no server or browser needed.
  "Adventure Book": at least 60 room texts, 20 enemies and 30 items, all
  in 12 languages; creating a hero (6 points, at most 4 each); 1000
  generated places per difficulty (12-20 rooms, every room and the goal
  reachable, every way both directions, at most 3 choices per room);
  1000 runs with random choices for every class and difficulty - every
  run ends without an illegal step, Easy above 75 % -, and single rules
  (checks, backpack, levels, flight, bringing the treasure back). About
  half a minute.
- `node tests/game-families.js` - needs a running server and a browser.
  Checks the game families (`family` in games-catalog.js): each has at
  least two games, no game is in the catalog twice, game-switcher.js
  agrees, all names exist in 12 languages, games.html's family filter
  shows exactly the family, and each game page lists its relatives
  under "Related games".
- `node tests/home-categories.js` - needs a running server and a
  browser. The short home page (height at 600 x 800 at most one screen
  without data and two with 3 started games and 6 favorites; heights at
  360 x 640 printed; compact entries; the category tiles with their
  counts), every category page (12 games per page, each game of the
  category exactly once over all pages, page number kept in the address,
  back link on top), games.html's paging with search and filters, the
  old addresses (index.html#section-popular and the others,
  games.html?category=...) and no sideways scrolling.
- `node tests/offline-install.js` - needs a browser; starts its own
  server on a copy of the site. Checks the offline install of `sw.js`
  and the home page's status line: progress "X of Y files", a broken
  download retried and an interrupted install carried on, an update
  that downloads only the changed file, and every game page loading
  with the server off. `THROTTLE=1` runs a first visit over a slow line
  (500 kbit/s, 300 ms per request) instead; that takes several minutes.
- `node tests/update-banner.js` - needs a browser; starts its own server
  on a copy of the site and makes updates by raising `CACHE_NAME` in the
  copy's `sw.js`. Checks the "what's new" lines of the update banner: a
  device that last saw v222 with 80 games is shown exactly the games
  added since then and the sentences of `release-notes.js` since v222
  (German and English), a
  second update without anything new shows the main line alone, and no
  sideways scrolling at 360 and 600 px. `SHOT=<file.png>` saves a
  screenshot at 360 px.
- `node tests/i18n-runtime-sweep.js` - needs a running server
  (`BASE_URL` env var, default `http://localhost:8000/`) and a browser.
  Plays every game in Russian, 2-player and vs-computer, with random
  clicks (`CLICKS`, default 60), then fails on any status line, result
  popup, info line, screen-reader label or other visible text still
  containing an English word. Takes a few minutes. `SWEEP_LANG=ar` runs
  it in another non-Latin language (Arabic, Ukrainian, Japanese ...).
- `node tests/css-check.js` - needs a browser only (no server): loads
  `style.css` in a real page and confirms it parses cleanly.
- `node tests/rtl-spacing.js` - needs a running server (`BASE_URL`) and a
  browser. Opens Mau Mau, Chess and the games list in Arabic at 360 px
  and fails if two buttons or links in the same row touch (gap under 1 px).
- `node tests/direct-start.js` - same prerequisites. Opens every game page
  on a first visit at 360 px and checks that the board is visible without
  a further tap (no placeholder, no rules box) and that a "New game"
  control stands next to it.
- `node tests/board-sweep.js` - needs a running server (`BASE_URL` env
  var, default `http://localhost:8000/`) and a browser. Loads every
  game, starts it, and checks for JS errors, a rendered board, no
  horizontal overflow, and no illegibly small text - all at the Tolino
  Vision 6's viewport (632x840 CSS px), the smallest real device this
  app targets.
- `node tests/interaction-sweep.js` - same prerequisites as
  `board-sweep.js`. Loads every game, starts it, and clicks a couple of
  plausible interactive targets to simulate "make one move", checking
  only that nothing throws.

- `node tests/eink-sim.js [outDir]` - same prerequisites. Not part of
  `run-all.sh` (about 15 minutes). Plays every game on a simulated weak
  e-reader: CPU throttled 10x (`CPU=`), a slow Wi-Fi link for the cold
  first load with no cache or service worker, a 758x1024 touch viewport,
  reduced motion and greyscale rendering, with the page in German
  (`LANG_CODE=`). Per page it reports load time, main-thread work,
  longest task, bytes downloaded, the time from a tap on the board to
  the next frame, and whether English text was painted before the
  page's language arrived. Screenshots and `results.json` go to
  `outDir` (default `eink-sim-out/`, ignored by git). `PAGES=chess,go`
  limits the run.

The game list for the sweeps comes from `games-catalog.js` (this
project's own single source of truth for which games exist), not a
hardcoded list here - a new game needs nothing added to this directory
to be covered.

## What this doesn't catch

These are layout/wiring/crash checks, not gameplay correctness checks -
they don't play a full game to a win/loss, don't verify move legality,
and don't test on real E-Ink hardware. Passing here is a strong signal
nothing is obviously broken, not a replacement for actually trying a
change on a real device before shipping it.
