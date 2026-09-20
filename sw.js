// sw.js
// Caches the app shell so eInkChess keeps working with no internet connection
// after it has been opened once. Only same-origin requests are handled –
// Lichess API calls (online mode) always go straight to the network.

const CACHE_NAME = "einkchess-cache-v2";

const APP_SHELL = [
  "./",
  "index.html",
  "about.html",
  "style.css",
  "chess-core.js",
  "pieces.js",
  "ai-engine.js",
  "lichess-auth.js",
  "lichess-api.js",
  "app.js",
  "sw-register.js",
  "manifest.json",
  "favicon.png",
  "icon-192.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
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

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() => (req.mode === "navigate" ? caches.match("index.html") : undefined));
    })
  );
});
