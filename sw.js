// sw.js
// Caches the app shell so eInkChess keeps working with no internet connection
// after it has been opened once. Only same-origin requests are handled –
// Lichess API calls (online mode) always go straight to the network.

const CACHE_NAME = "einkchess-cache-v26";

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
  "othello.html",
  "othello-rules.html",
  "othello-history.html",
  "connectfour.html",
  "connectfour-rules.html",
  "connectfour-history.html",
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
  "guide.html",
  "about.html",
  "stats.html",
  "style.css",
  "i18n.js",
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
  "othello-core.js",
  "othello-ai.js",
  "othello-app.js",
  "connectfour-core.js",
  "connectfour-ai.js",
  "connectfour-app.js",
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
  "sw-register.js",
  "game-storage.js",
  "game-stats.js",
  "stats-app.js",
  "board-a11y.js",
  "force-update.js",
  "manifest.json",
  "favicon.png",
  "icon-192.png"
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
