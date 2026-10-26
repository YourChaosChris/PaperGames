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
PORT=8010 bash tests/run-all.sh > log 2>&1
```

The checks are listed in `tests/test-list.txt` (weight, file, arguments;
a new check must be added there). `run-all.sh` spreads them over several
parts that run in parallel, each with its own port (`PORT`, `PORT + 1`, ...)
and its own throwaway `python3 -m http.server`, then merges the output of
all parts back into one log in list order. The last line is exactly
`ALL CHECKS PASS` only if every part passed; otherwise the exit code is 1.

- Number of parts: `SHARDS` if set; otherwise cores / 2 (`nproc` or
  `sysctl -n hw.ncpu`), at least 1, at most 6, and at most one part per 2 GB
  of free memory (`/proc/meminfo` on Linux, `vm_stat` on macOS). `SHARDS=1`
  runs everything one after another.
- `bash tests/run-all.sh --plan` prints the split without running anything.
- The three checks that start their own server use `PORT + 21` (offline-install),
  `PORT + 22` (offline-update) and `PORT + 23` (update-banner); override with
  `OFFLINE_TEST_PORT`, `OFFLINE_UPDATE_PORT`, `BANNER_TEST_PORT`.
- The parts use `tests/serve.py` instead of `python3 -m http.server`: HTTP/1.1 keep-alive and a
  longer listen queue. With one connection per file the Mac ran out of ports in a serial run
  (`ERR_CONNECTION_TIMED_OUT`, `page.goto` timeouts in the sweeps). Measured on the Mac
  (99y, `interaction-sweep.js` alone): `http.server` leaves 16948 sockets in TIME_WAIT (the
  port range holds 16384) and 2 games time out; `serve.py` leaves 408 and 0 games fail.
  Run the sweeps by hand against `python3 tests/serve.py PORT`, not `http.server`.
- Tests that list caches (`caches.keys()`) must not call `caches.open(name)` on a name that
  the new worker may delete at that moment: `open` creates an empty cache again and it stays
  (this was the `"papergames-cache-v256":0` failure of `offline-install.js`, 99y). Open only
  the cache of the current version.
- Before the start every port is checked with `curl`; a busy port aborts the run.
- The weights in `test-list.txt` are rough seconds. Every section of the merged
  log ends with its real duration (`(Dauer: N s)`); adjust the weights from there.
- Retry (Christopher, 19.10.2026): a check that fails is run exactly once more, never the
  whole series (`RETRY=0` turns it off). The log keeps the first output, then the line
  `WIEDERHOLT: <test> ...` and the second output; before the last line stands
  `N Test(s) wiederholt: <names>`. If the second try fails too, the series stays red. The last
  line is exactly `ALL CHECKS PASS` on success. Reason: on the Mac, browser checks sometimes
  fail under load (connection timeouts). `run-all-shards.js` tests this logic with a fake list
  (`TEST_LIST`, `TESTS_DIR`).
- Works with bash 3.2 (macOS) and Linux. `KEEP_WORK=1` keeps the part logs.
- `node tests/run-all-shards.js` checks the split (every check in exactly one
  part for 1 to 6 parts, none missing).

## Running a single check

- `node tests/run-all-shards.js` - no server or browser needed. See above.
- `node tests/split-check.js` - no server or browser needed. The page
  split has no build step, so this guards it: every page links
  `base.css` plus its own `css/<game>.css`, no rule in a game sheet could
  be needed by another game's page, and `sw.js` knows every `css/` and
  `text/` file. Rules and history texts live in `text/<lang>/<slug>.js`
  (one file per game and language, named in `<html data-i18n-text>`).
- `node tests/split-pages.js` - needs a browser and a running server
  (`BASE_URL`). Opens every game page and its rules and history page in
  several languages (`SPLIT_LANGS`, default en,de,ar; `run-all.sh` uses
  de,ar) and fails on script errors, failed requests (a missing
  `css/` or `text/` file), a raw i18n key anywhere on the page, or a
  language that is not fully loaded.
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
- `node tests/ui-names.js` - no server or browser needed. Checks that
  game controls use the shared mode and start names in all 12 languages,
  two-player mode is not duplicated in level lists, and legacy mode keys
  retain the same translated wording.
- `node tests/ui-status.js` - no server or browser needed. Checks that all
  computer-opponent games use the shared four localized turn and winner
  status keys (now in the shared `ui-status.js`); documents the
  simultaneous-round exception in War.
- `node tests/howto.js` - no server or browser needed. Checks that the eight
  games with the shared picture explanation (`howto.js`) load it before
  their app, call `Howto.init` with four steps, and have all step
  sentences in 12 languages; for Link Pairs, Old Maid and Snakes and
  Ladders each sentence has at most 8 words (24 characters in Japanese and
  Chinese).
- `node tests/howto-ui.js` - needs the server and Playwright. Link Pairs,
  Old Maid and Snakes and Ladders, German page at 360 px: the explanation
  is open on the first visit with four picture steps, fits on one screen,
  hides after the first game action, the button opens it again, and it
  stays closed after a reload.
- `node tests/undo.js` - no server or browser needed. Checks Undo coverage for
  every computer-opponent game, verifies the shared localized button and
  enabled/disabled source behavior, exercises one-ply hotseat and paired
  computer-turn history restoration, checks saved history compatibility
  (last 50 snapshots; older saves load without history), and lists
  rule-based exceptions.
- `node tests/game-frame.js` - no server or browser needed. Checks that
  every real game page from `game-switcher.js` loads the shared frame,
  which adds a visible, localized Home link before the game controls and
  marks the existing title, mode, start, status and result elements
  without replacing their IDs. Also checks its 44 px black-and-white
  styling, RTL spacing, and service-worker shell entry. No exceptions.
- `node tests/seo-index-texts.js` - no server or browser needed. Home page
  title and description exist in all 12 languages, name Kindle, Kobo,
  Tolino and Boox, and the static English copies in `index.html` (title,
  description, og:, twitter:, JSON-LD) match.
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
- `node tests/bingo-core.js` - no server or browser needed. 1,000 decks (3 x 3 / 5 x 5, numbers / pictures), every item called exactly once, all win patterns against a brute-force check, wrong marks, 1,000 games against computer cards.
- `node tests/sudoku-seeds.js` - no server or browser needed. 20 Sudoku
  and 20 Killer Sudoku puzzles per level from fixed seeds; each must have
  exactly one solution, and a fingerprint of all of them must equal the
  one from before the faster solvers (Aufgabe 104): same seed, same puzzle.
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
  500 "Blocked Path" games each for 2, 3 and 4 players with mixed
  computer levels and fails unless every move uses the full roll, steps
  only between joined fields, never visits a field twice or passes a
  stone, and every game ends with 6 stones and 5 tokens per player.
- `node tests/blockers-quick.js` - no server or browser needed. The quick
  board of Blocked Path (task 110): connected, every house 9 steps from the
  goal, 6 blocks and 4 tokens per player at the start, four rest fields
  (no sending back, one token only, no block there), no safe half;
  computer games (`GAMES`, default 200) with 2, 3 and 4 players with all
  rules checked and the game length against the normal board (must be
  clearly shorter); "all" on the quick board.
- `node tests/blockers-quick-ui.js` - needs the server and Playwright.
  German page: "Brett: Schnell" starts the quick board (four houses, 4
  tokens, rest fields labelled and drawn), a move, saved with board
  "quick" and back after a reload, the block prompt names the rest
  fields, "Normal" starts the normal board again.
- `node tests/blockers-six.js` - no server or browser needed. Blocked Path
  with 5 and 6 players (task 111): houses and shapes all different (ring
  and cross added), turn order, sending back, a block taken and put back,
  the ranking with 6 places, save and load; computer games (`GAMES`,
  default 200) with 5 and 6 players for "one" and "all"; fairness over
  `FAIR` (default 600) games with 6 Medium computers - every house within
  5 percentage points of 1/6; game lengths printed.
- `node tests/blockers-six-ui.js` - needs the server and Playwright. 5 and
  6 players only on the normal board, 6 shapes only for 5-6 players, six
  player rows readable and at least 28 px high at 360 and 600 px, the game
  back after a reload, "all" with 6 players uses 3 tokens.
- `node tests/blockers-blocks.js` - no server or browser needed. Number of
  blocks (task 123): "normal" unchanged (6, also without the option),
  "few" 4, "many" 11 (normal board, 2 to 4 players only), none near the
  goal with "all"; from every house the fewest blocks on a way to the goal
  are equal and at most 3; save and load; computer games (`GAMES`,
  default 200) per choice and number of players without a hang, game
  lengths printed.
- `node tests/blockers-blocks-ui.js` - needs the server and Playwright.
  German page at 360 x 640: the choice "Sperrklötze" (Wenige/Normal/Viele),
  "Viele" starts 11 blocks and is back after a reload, hidden on the quick
  board, not available with 5 players, an old save loads with "Normal".
- `node tests/blockers-ui.js` - needs a local server (default port 8000)
  and Playwright. Task 113: German and English page at 360 x 640 name
  the game "Wegesperre" / "Blocked Path" and show no old name; a new
  game starts, rolls and moves and is saved under
  `einkchess_save_blockers`; a save in the old format loads again, its
  "put the block" phase asks with the new word, and the block goes back
  on the board. No page error, no sideways scroll.
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
- `node tests/romme-core.js [GAMES]` - no server or browser needed (a few
  seconds). Checks the joker at the chosen end of a run (task 106: low end,
  then the next card; high end; Ace on top only low; sets unchanged; house
  rule "add the swapped joker"; the computer picks the end a hand card can
  follow), Hand-Rommé (task 107: everything at once plus one discard,
  refused otherwise, no minimum, joker in a meld, penalties doubled, the
  computer goes out that way) and knocking (task 108: who may knock, keep
  or give, the knocker only discards, the players in between miss their
  turn, no knocking with 2 players or the discard variant, together with
  "take cards from melds"), then plays GAMES (default 200) computer rounds
  with every option and fails unless each ends and all 110 cards stay in
  play.
- `node tests/romme-ui.js` - needs the server and Playwright. On the German
  page at 600 and 360 px: the two "Unten/Oben anlegen (als …)" buttons for a
  joker, the "Klopfen auf …" button only when allowed and the turn order
  after a knock, "Alle Karten auslegen" with "x2 Hand-Rommé" in the round
  list; the knocking option is off on one device and with one computer.
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
  Checks that games-kids.html shows all games marked `kids: true` at once
  with one-tap links, and that games.html's "Children's Games" filter
  shows the same set,
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
  number for all tiles meeting there and every legal move has exactly one
  laying (the game turns the tile, task 119).
- `node tests/domino-ui.js` - needs the server and Playwright. German page
  at 360 x 640 and 412 x 915 with touch, classic and triangles: the stock
  button is shown on every human turn, at least 44 px high, labelled
  "Vorrat (N Steine)"; with a fitting tile a tap draws nothing and says so
  below the button, without one it draws; every offered triangle place
  gives a valid move.
- `node tests/hex-core.js` - no server or browser needed. The swap rule
  (task 115): only right after Red's first stone, once, board and win
  condition unchanged, off in old saves; the computer's fixed swap rule;
  100 computer games without and 100 with the swap rule, each with one
  correct winner, and the share won by the first mover.
- `node tests/ludo-core.js` - no server or browser needed. Ludo rules on the
  classic board (numbers unchanged, no `board` field in a classic state)
  and on the six-arm board (78 squares, starts 0/13/26/39/52/65, finish
  82): capture across the seam 77 -> 0, blocks, the own home column, exact
  finish, a win; save and load through JSON; computer against computer
  (`GAMES`, default 200) with 6 and with 4 colors, every move legal, no
  hang, never two colors on one unsafe square.
- `node tests/ludo-ui.js` - needs the server and Playwright. German page at
  360 px: classic board still the default; "6 Spieler" builds 78 track
  cells, 30 home-column cells and six bases, offers 5-6 players and purple
  and orange only there; a six-player hotseat game moves a token; the game
  is back after a reload; large view cells at least 28 px.
- `node tests/hex-ui.js` - needs the server and Playwright. German page at
  360 px: the "Tauschen" button with two players and its texts, the
  computer swapping a central first stone, Undo over a swap, no button
  without the rule.
- `node tests/minesweeper-ui.js` - needs the server and Playwright. German
  page at 360 px: no once-a-second interval and no clock by default, the
  result still names the seconds; "Zeit anzeigen" shows the clock and is
  remembered; more flags than mines gives "Flaggen: 2 mehr als Minen.".
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
- `node tests/catplaces-start.js` - no server or browser needed. 750 random
  "Cat Places" board states (all levels, with and without wrong cats): the
  "Where to start?" cell is always a cell of the solution, and the named
  reason (row, column, room) is true. A few seconds.
- `node tests/loosen-core.js` - no server or browser needed. 500 "Loosen
  the Rings" puzzles per level (3 / 4-5 / 6-7 rings): one group without
  closed loops, nothing free at the start, the solver clears each in
  exactly the stored fewest moves (confirmed by a second search for the
  first 40 per level); a random player fails (not clear after twice the
  fewest moves) in most tries on Hard (share printed). About 40 seconds.
- `node tests/klappenkasten-core.js` - no server or browser needed. Rules of
  Klappenkasten (shut the box): legal and refused closings, the one-die rule
  (flap 7 and above closed), points, rounds, draw, box shut as an instant
  win, the computer's choices (high flaps first) and 1000 computer games
  (2-4 players, 9 or 12 flaps, 1/3/5 rounds) that all end without an
  error. A few seconds.
- `node tests/steckwuerfeln-core.js` - no server or browser needed. Rules of
  Steckwuerfeln (pegs and two dice): the total or the two single dice,
  refused pegs, the double-six joker (roll again / turn ends / hole 12),
  points and rounds, all eleven holes pegged as an instant win, the shared
  board (who cannot peg is out), the computer's choice and 1000 computer
  games in both ways to play that all end without an error. A few seconds.
- `node tests/sternjagd-core.js` - no server or browser needed. The board of
  Sternjagd (twelve fields, two arrows from each, the same from every
  corner), the exact steps of the die, catching only where a move ends,
  stars and the return to a free corner, the last player left wins, the
  draw after 600 moves, the computer's capture and 1000 computer games
  (2-4 players) that all end without an error. A few seconds.
- `node tests/sternjagd-start.js` - no server or browser needed. Who starts
  (task 128): `GAMES` (default 1000) computer games each with 2, 3 and 4
  players, seat 1 always starting and a random starter; with the random
  starter every seat within 5 percentage points of the mean (3 players sit
  against the arrows, corners 1, 0, 2). Win rates printed.
- `node tests/sternjagd-balance.js` - no server or browser needed. Balance
  for the second player (task 130): with 2 players the one who does not
  start has two turns in a row the first time. `GAMES` (default 1000)
  computer games with 2 players, the starter changing seats, without and
  with the balance; with it the starter must win 45-55 % (both rates
  printed). Also the turn order, 3 and 4 players without the balance, and
  an old state without `balance`/`bonus`. A few seconds.
- `node tests/sternjagd-ui.js` - needs the server and Playwright. German
  page at 360 x 640: "Du beginnst." / "Computer beginnt.", both happen, the
  line goes after the first roll, save and load, an old 3-player save
  without `homes` keeps its corners. Task 130: the choice "Ausgleich für den
  Zweiten" (2 players only, on by default), the starter line names the
  double turn, your second move after the computer started, off and 3
  players without it, `balance`/`bonus` saved and loaded, an old 2-player
  save without them, remembered settings (quick-rules.js).
- `node tests/trix-ai-games.js` - no server or browser needed. 60 Trix games
  computer against computer (all three levels and mixed seats, fixed seeds)
  that must reach the end of the fourth kingdom without a refused move:
  twenty deals, five contracts and one owner per kingdom, every kingdom
  adding up to zero. A few seconds.
- `node tests/kleeberg-core.js` - no server or browser needed. The pyramid of
  Kleeberg (15 fields, 18 lines of three), fields open only above two filled
  fields, three in a line along the row and both slopes, the draw on a full
  board, refused moves, the computer's choices (complete a line, stop the
  opponent's line, do not open a winning field) and 1000 computer games that
  all end without an error. A few seconds.
- `node tests/patternrow-core.js` - no server or browser needed. 200 games
  of "Continue the Pattern" per level (6 rows each): every row has exactly
  one symbol that continues it (no repeating part of at most half the row
  gives another), the unit is shown at least twice, the answer sits among
  distinct options and at every position, rows fit in 10 cells. Under a
  second.
- `node tests/shadowmatch-core.js` - no server or browser needed. The 20
  drawings of kidspics.js (4 groups of 5, picture and shadow differ, every
  shadow in every turn different from all others), then 200 games of "Whose
  Shadow Is It?" per level (6 pictures each, all different): exactly one
  unturned shadow of the picture among distinct options; easy takes shadows
  from other groups, medium from the same group, hard two turned shadows of
  the same drawing plus one from the group. Under a second.
- `node tests/oddone-core.js` - no server or browser needed. 200 games of
  "Which One Is Different?" per level (6 rounds each): in every round exactly
  one card is the odd one (checked by brute force over all rules); easy has
  group rounds with 4 drawings, medium and hard mix group rounds with
  attribute rounds (shape, filling, number) with 5 and 6 cards. Under a
  second.
- `node tests/weidefreunde-core.js` - no server or browser needed. "Pasture
  Friends": every rule with fixed rolls (take, farmer, send back, refused
  moves), then 1000 games computer against computer for each of 2, 3 and 4
  players: one full pasture ends the game, the 35 cards are always all there,
  the yard keeps 5 cards, the pile never runs out, every computer step is
  legal; the strategy beats random choices in 2000 games. A few seconds.
- `node tests/tieryatzy-core.js` - no server or browser needed. Animal Yatzy
  (task 112): the points of every field with the paw as a joker, rolling
  and keeping dice, at most three rolls, striking a field with 0, the end
  after every field, a tie, 1 to 4 players; computer games (`GAMES`,
  default 200) with save and load in the middle.
- `node tests/tieryatzy-ui.js` - needs the server and Playwright. German
  page at 360 px: a game against the computer, roll, keep a die, the
  possible points on the sheet, a field written, the computer's panel and
  "Weiter", the game back after a reload, a whole game to the result; rows
  at least 44 px, no sideways scroll, no key names in the page.
- `node tests/slidepuzzle-core.js`, `node tests/hanoi-core.js`,
  `node tests/nim-core.js` - no server or browser needed (task 118).
  Sliding puzzle: 1000 mixed 3 x 3 and 4 x 4 puzzles (100 of 5 x 5) all
  solvable by parity and never solved, 4 x 4 mixed with at least 80
  moves, single and multi-tile slides, the exact 3 x 3 solution in taps,
  hints. Tower of Hanoi: 2^n - 1 moves from the start for n = 3..8, refused
  moves with their reason, undo, shortest ways from 300 random positions.
  Nim: the xor rule (and misère) against a full search for all positions
  up to 3 heaps of 6, Hard wins 100 games each from winning positions.
- `node tests/teufelsieben-core.js` - no server or browser needed. Lucky
  Chain (rules 2): the 60-card deck, number mix, bust and Courage, Strike,
  Pass, Bridge, Collector and Peek, run and round scoring, targets, ties and
  seat rotation; `GAMES` computer games with 2 to 6 players, card conservation,
  AI levels, open-card odds and save validation.
- `node tests/teufelsieben-ui.js` - needs the server and Playwright. German
  page at 360 x 640: two people and one computer, stop disabled before the
  first card, paced computer turns, round end and next round, deterministic
  bust, game result, save/load, legacy-save rejection, 44 px buttons and no
  sideways scroll.
- `node tests/advent-core.js` - no server or browser needed. Puzzle Advent
  calendar (task 122): each of the 24 puzzles has exactly one solution,
  counted again with the games' own solvers (Light Switch 3 x 3: one set of
  presses); fixed seeds (a fresh copy of the modules gives the same
  puzzles); the kinds take turns, small in the first week, bigger in the
  last; unlocking on 30 November, 1, 5 (with and without door 4 solved), 10
  and 25 December and with "open all doors"; broken and old saves.
- `node tests/advent-ui.js` - needs the server and Playwright. German page
  at 360 x 640: 24 doors (at least 44 px, closed ones dashed and striped),
  the line before 1 December, door 1 open and door 2 waiting on 5 December,
  door 1 solved by tapping with its text, door 2 opening after it, a digit
  kept over a reload, "Open all doors" from the menu, cells of the biggest
  puzzles at least 40 px, every door open after 24 December, broken and old
  saves, no sideways scroll.
- `node tests/small-games-ui.js` - needs the server and Playwright. The
  three games of task 118 at 360 px in German: sliding puzzle (taps, the
  note outside row and column, hint, solved with the fewest moves, 5 x 5,
  save and load), Tower of Hanoi (refused move, undo, solved with the
  hints in 15 moves), Nim (start line, a move, the computer's answer,
  undo, misère to the end).
- `node tests/zoowurf-ui.js` - needs the server and Playwright. "Zoo Toss" at
  600 and 360 px: a full game against the computer; the paw is put on the
  card by tapping a free place (at least 48 px, no sideways scroll), the
  panel with the computer's turn and its "Next" button, an older saved game
  without the pick rule. About 20 seconds.
- `node tests/zoowurf-core.js` - no server or browser needed. "Zoo Toss":
  every rule with fixed rolls (dice that fit go onto the card, the paw, three
  rolls make a turn, the rest of the card goes on to the next player, four
  cards win, refused moves), the 30 different cards, the exact chance of
  filling a card first against a simulation of 10000 rounds, then 1000
  games computer against computer for each of 2, 3 and 4 players (one winner
  with 4 cards, no card lost, every step legal), and the card choice against
  a player who always takes the worst open card (3000 games). A few seconds.
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
  "Fairy-Tale Villains" (rules version 2): six villains with three places
  each (one per sign) and plans of three or four steps, 36 spell cards,
  all names in 12 languages; 3000 computer games (level 3) for each
  number of players (2, 3, 4) with random villains - every game ends,
  every move is legal, no card lost or doubled, each villain wins within
  +/- 8 points of its fair share and each seat within +/- 5 -; 3000 games
  per number of players with one player of level 3 against level 2 and
  one of level 2 against level 1 (the higher level wins at least 5
  points over its fair share); single rules (paying, heroes, final step,
  scheme, dropping cards, the King's Son, end of the round and shared
  wins, old states). About 45 seconds.
- `node tests/villains-ui.js` - needs the local server (BASE_URL) and
  Playwright. "Fairy-Tale Villains" at 360 x 640 in German: start against
  the computer (level 3), collect from the market, a step, sending a hero
  (once per turn), the computer's turn, dropping cards over 6, finishing
  the plan (the round is played to its end, result, save cleared), save
  and resume, an old save dropped without an error, the rules page;
  buttons at least 44 px, no sideways scrolling, no console errors.
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
  that downloads only the changed file, every game page loading
  with the server off, and the rules texts: the install stores English,
  the language in use (German here) follows in the background, a new
  version carries it over, and offline the rules are there in German and
  English while Arabic shows the English rules with a note. `THROTTLE=1` runs a first visit over a slow line
  (500 kbit/s, 300 ms per request) instead; that takes several minutes.
- `node tests/offline-update.js` - needs a browser; starts its own server
  (port 8032, `OFFLINE_UPDATE_PORT`) on a copy of the site that can drop
  every request from one moment on. A: a stored version, a new one starts
  to load and the network drops; offline the home page still opens from the
  old, complete version (also after a patchy connection where only the home
  page got through: never new HTML over old scripts), says "Offline bereit.
  Die neue Version wird geladen, sobald wieder Internet da ist.", has no
  disabled buttons, a game opens; when the network is back the update is
  stored completely. B: first install broken off; offline the home page
  says "Noch nicht vollständig … Schalte das Internet ein", no disabled
  buttons; with the network back the install ends with "Offline bereit".
- `node tests/update-banner.js` - needs a browser; starts its own server
  on a copy of the site and makes updates by raising `CACHE_NAME` in the
  copy's `sw.js`. Checks the "what's new" lines of the update banner: a
  device that last saw v222 with 80 games is shown exactly the games
  added since then and the sentences of `release-notes.js` since v222
  (German and English), a
  second update without anything new shows the main line alone, and no
  sideways scrolling at 360 and 600 px. `SHOT=<file.png>` saves a
  screenshot at 360 px.
- `node tests/old-browser.js` - needs a running server (`BASE_URL`), a
  browser and `acorn` (test helper only, from `NODE_PATH`). The
  old-browser check `tools/old-browser.js` is ES5 (acorn, `ecmaVersion: 5`),
  under 1 KB, and the first script in the `<head>` of every real page.
  In Chromium the home page, Sudoku and Chess start as before without the
  note; with `Promise` and `fetch` removed by an init script the note
  (English and German) shows on the home page, Sudoku and the devices
  page, no other script element exists, no page or console error, no
  sideways scrolling at 360 px.
- `node tests/i18n-runtime-sweep.js` - needs a running server
  (`BASE_URL` env var, default `http://localhost:8000/`) and a browser.
  Plays every game in Russian, 2-player and vs-computer, with random
  clicks (`CLICKS`, default 60), then fails on any status line, result
  popup, info line, screen-reader label or other visible text still
  containing an English word. Takes a few minutes. `SWEEP_LANG=ar` runs
  it in another non-Latin language (Arabic, Ukrainian, Japanese ...).
- `node tests/css-check.js` - needs a browser only (no server): loads
  `base.css` and every `css/<game>.css` in a real page and confirms each
  parses cleanly.
- `node tests/rtl-spacing.js` - needs a running server (`BASE_URL`) and a
  browser. Opens Mau Mau, Chess and the games list in Arabic at 360 px
  and fails if two buttons or links in the same row touch (gap under 1 px).
- `node tests/direct-start.js` - same prerequisites. Opens every game page
  on a first visit at 360 px and checks that the board is visible without
  a further tap (no placeholder, no rules box) and that a "New game"
  control stands next to it.
- `node tests/board-fit.js [--table] [--min N]` - same prerequisites. Opens
  every game after the start at 600x800 and 360x740 and counts how many
  boards end inside the first screen; `--table` lists the bottom edge of
  each, `--min 80` fails when fewer than 80 fit at 600x800.
- `node tests/tap-targets.js` - same prerequisites. On every category page
  (games*.html) at 360 px, links and buttons must be at least 44 px high
  (links in running text excepted) and the page must not scroll sideways.
- `node tests/cell-size.js` - same prerequisites. Starts Marble Push, Hashi,
  Gomoku, Chinese Checkers and Ludo at 360 px with "Large board" on and
  requires every cell to be at least 28 px, a visible switch next to "New
  game", and no sideways scrolling of the page.
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
  limits the run; `TAPS=0` measures only the start (no game, no
  screenshot).
- `node tests/startup-limits.js` - same prerequisites, part of
  `run-all.sh` (about 40 s; it runs alone after the parallel parts,
  `ALONE_TESTS` in `run-all.sh`, because their load makes the times
  swing by a factor of up to 3). Loads the five heaviest game pages from
  `tests/startup-limits.json` once each with `eink-sim.js` at CPU 10 and
  fails when the start script time is more than 50 % above the value
  measured on the Mac mini (date per page in the file). A page over the
  limit is loaded two more times and the median of three decides. Off
  macOS it is skipped (`STARTUP_LIMITS=1` forces it), because the values
  only fit the Mac mini. New values only on purpose, with a new
  measurement.

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

- `node tests/search-keywords.js` - pure Node check of catalogue keyword search,
  multilingual query terms and accent/umlaut normalization; prints German and
  English hits for every checked query.
