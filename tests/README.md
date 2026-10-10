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
  exist.
- `node tests/i18n-messages.js` - no server or browser needed. Runs a
  sample of every runtime status/result message shape through
  `I18n.msg()` in all 10 non-English languages and fails on anything
  left untranslated, unfilled placeholders, or (for uk/ru/ja/zh)
  leftover English words; also checks `msg_t_*` template placeholders
  match across languages.
- `node tests/cake-core.js` - no server or browser needed. Generates
  150 "Who Took the Cake?" puzzles per level from fixed seeds and fails
  unless each has exactly one solution, is solvable by deduction alone
  at its level, and can be played to the end with the hint button
  (mistakes first, animals in the order of reasoning, the cake left to
  the player).
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
- `node tests/i18n-runtime-sweep.js` - needs a running server
  (`BASE_URL` env var, default `http://localhost:8000/`) and a browser.
  Plays every game in Russian, 2-player and vs-computer, with random
  clicks (`CLICKS`, default 60), then fails on any status line, result
  popup, info line, screen-reader label or other visible text still
  containing an English word. Takes a few minutes. `SWEEP_LANG=ar` runs
  it in another non-Latin language (Arabic, Ukrainian, Japanese ...).
- `node tests/css-check.js` - needs a browser only (no server): loads
  `style.css` in a real page and confirms it parses cleanly.
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
