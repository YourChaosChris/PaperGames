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
  key parity across all 11 languages (`i18n.js` for English,
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
- `node tests/i18n-runtime-sweep.js` - needs a running server
  (`BASE_URL` env var, default `http://localhost:8000/`) and a browser.
  Plays every game in Russian, 2-player and vs-computer, with random
  clicks (`CLICKS`, default 60), then fails on any status line, result
  popup, info line or screen-reader label still containing an English
  word. Takes a few minutes.
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

The game list for the two sweeps comes from `games-catalog.js` (this
project's own single source of truth for which games exist), not a
hardcoded list here - a new game needs nothing added to this directory
to be covered.

## What this doesn't catch

These are layout/wiring/crash checks, not gameplay correctness checks -
they don't play a full game to a win/loss, don't verify move legality,
and don't test on real E-Ink hardware. Passing here is a strong signal
nothing is obviously broken, not a replacement for actually trying a
change on a real device before shipping it.
