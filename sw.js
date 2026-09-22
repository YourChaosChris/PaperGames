// sw.js
// Caches the app shell so PaperGames keeps working with no internet connection
// after it has been opened once. Only same-origin requests are handled –
// Lichess API calls (online mode) always go straight to the network.

const CACHE_NAME = "papergames-cache-v55";

const APP_SHELL = [
  "./",
  "index.html",
  "chess.html",
  "chess-rules.html",
  "chess-history.html",
  "go.html",
  "go-rules.html",
  "go-history.html",
  "checkers.html",
  "checkers-rules.html",
  "checkers-history.html",
  "ur.html",
  "ur-rules.html",
  "ur-history.html",
  "morris.html",
  "morris-rules.html",
  "morris-history.html",
  "backgammon.html",
  "backgammon-rules.html",
  "backgammon-history.html",
  "xiangqi.html",
  "xiangqi-rules.html",
  "xiangqi-history.html",
  "mancala.html",
  "mancala-rules.html",
  "mancala-history.html",
  "reversi.html",
  "reversi-rules.html",
  "reversi-history.html",
  "fourinarow.html",
  "fourinarow-rules.html",
  "fourinarow-history.html",
  "gomoku.html",
  "gomoku-rules.html",
  "gomoku-history.html",
  "senet.html",
  "senet-rules.html",
  "senet-history.html",
  "shogi.html",
  "shogi-rules.html",
  "shogi-history.html",
  "sudoku.html",
  "sudoku-rules.html",
  "sudoku-history.html",
  "pegsolitaire.html",
  "pegsolitaire-rules.html",
  "pegsolitaire-history.html",
  "minesweeper.html",
  "minesweeper-rules.html",
  "minesweeper-history.html",
  "nonogram.html",
  "nonogram-rules.html",
  "nonogram-history.html",
  "twenty48.html",
  "twenty48-rules.html",
  "twenty48-history.html",
  "mahjong.html",
  "mahjong-rules.html",
  "mahjong-history.html",
  "freecell.html",
  "freecell-rules.html",
  "freecell-history.html",
  "klondike.html",
  "klondike-rules.html",
  "klondike-history.html",
  "cardtactics.html",
  "cardtactics-rules.html",
  "cardtactics-history.html",
  "hnefatafl.html",
  "hnefatafl-rules.html",
  "hnefatafl-history.html",
  "wallmaze.html",
  "wallmaze-rules.html",
  "wallmaze-history.html",
  "hex.html",
  "hex-rules.html",
  "hex-history.html",
  "halma.html",
  "halma-rules.html",
  "halma-history.html",
  "yatzy.html",
  "yatzy-rules.html",
  "yatzy-history.html",
  "lightsout.html",
  "lightsout-rules.html",
  "lightsout-history.html",
  "mastermind.html",
  "mastermind-rules.html",
  "mastermind-history.html",
  "dotsandboxes.html",
  "dotsandboxes-rules.html",
  "dotsandboxes-history.html",
  "amazons.html",
  "amazons-rules.html",
  "amazons-history.html",
  "kakuro.html",
  "kakuro-rules.html",
  "kakuro-history.html",
  "games.html",
  "history.html",
  "guide.html",
  "about.html",
  "stats.html",
  "impressum.html",
  "datenschutz.html",
  "donate-qr.png",
  "style.css",
  "i18n.js",
  "game-switcher.js",
  "chess-core.js",
  "pieces.js",
  "ai-engine.js",
  "lichess-auth.js",
  "lichess-api.js",
  "result-modal.js",
  "app.js",
  "go-core.js",
  "go-ai.js",
  "go-app.js",
  "checkers-core.js",
  "checkers-ai.js",
  "checkers-app.js",
  "ur-core.js",
  "ur-ai.js",
  "ur-app.js",
  "morris-core.js",
  "morris-ai.js",
  "morris-app.js",
  "backgammon-core.js",
  "backgammon-ai.js",
  "backgammon-app.js",
  "xiangqi-core.js",
  "xiangqi-ai.js",
  "xiangqi-app.js",
  "mancala-core.js",
  "mancala-ai.js",
  "mancala-app.js",
  "reversi-core.js",
  "reversi-ai.js",
  "reversi-app.js",
  "fourinarow-core.js",
  "fourinarow-ai.js",
  "fourinarow-app.js",
  "gomoku-core.js",
  "gomoku-ai.js",
  "gomoku-app.js",
  "senet-core.js",
  "senet-ai.js",
  "senet-app.js",
  "shogi-core.js",
  "shogi-ai.js",
  "shogi-app.js",
  "sudoku-core.js",
  "sudoku-app.js",
  "pegsolitaire-core.js",
  "pegsolitaire-app.js",
  "minesweeper-core.js",
  "minesweeper-app.js",
  "nonogram-core.js",
  "nonogram-puzzles.js",
  "nonogram-app.js",
  "twenty48-core.js",
  "twenty48-app.js",
  "mahjong-core.js",
  "mahjong-app.js",
  "freecell-core.js",
  "freecell-app.js",
  "klondike-core.js",
  "klondike-app.js",
  "cardtactics-core.js",
  "cardtactics-ai.js",
  "cardtactics-app.js",
  "hnefatafl-core.js",
  "hnefatafl-ai.js",
  "hnefatafl-app.js",
  "wallmaze-core.js",
  "wallmaze-ai.js",
  "wallmaze-app.js",
  "hex-core.js",
  "hex-ai.js",
  "hex-app.js",
  "halma-core.js",
  "halma-ai.js",
  "halma-app.js",
  "yatzy-core.js",
  "yatzy-app.js",
  "lightsout-core.js",
  "lightsout-app.js",
  "mastermind-core.js",
  "mastermind-app.js",
  "dotsandboxes-core.js",
  "dotsandboxes-ai.js",
  "dotsandboxes-app.js",
  "amazons-core.js",
  "amazons-ai.js",
  "amazons-app.js",
  "kakuro-core.js",
  "kakuro-puzzles.js",
  "kakuro-app.js",
  "sw-register.js",
  "game-storage.js",
  "game-stats.js",
  "stats-app.js",
  "board-a11y.js",
  "force-update.js",
  "games-catalog.js",
  "favorites.js",
  "games-render.js",
  "home-app.js",
  "games-app.js",
  "manifest.json",
  "favicon.png",
  "icon-192.png",

  // Redirect stubs at old, pre-rename URLs (kept so previously shared
  // links still resolve - see the trademark-safe rename in git history).
  "othello.html",
  "othello-rules.html",
  "othello-history.html",
  "connectfour.html",
  "connectfour-rules.html",
  "connectfour-history.html",
  "quoridor.html",
  "quoridor-rules.html",
  "quoridor-history.html",
  "onitama.html",
  "onitama-rules.html",
  "onitama-history.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return; // let Lichess calls pass through untouched

  // Stale-while-revalidate: answer immediately from cache when we have it
  // (fast, works offline), but always also fetch from the network in the
  // background and refresh the cache for next time. Plain cache-first would
  // otherwise serve the exact same files forever after every future deploy,
  // until the CACHE_NAME below happens to get bumped by hand.
  //
  // { cache: "reload" } is required here: GitHub Pages sends
  // Cache-Control: max-age=600, so a plain fetch(req) can be silently
  // answered by the browser's own HTTP cache for up to 10 minutes,
  // never reaching the network at all - the background "revalidation"
  // would then just re-store the same stale response, and updates would
  // only ever appear once that HTTP cache entry happens to expire.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const networkUpdate = fetch(req, { cache: "reload" })
          .then((resp) => {
            if (resp && resp.ok) {
              cache.put(req, resp.clone());
            }
            return resp;
          })
          .catch(() => cached || (req.mode === "navigate" ? cache.match("index.html") : undefined));

        return cached || networkUpdate;
      })
    )
  );
});
