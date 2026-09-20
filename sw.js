// sw.js
// Caches the app shell so eInkChess keeps working with no internet connection
// after it has been opened once. Only same-origin requests are handled –
// Lichess API calls (online mode) always go straight to the network.

const CACHE_NAME = "einkchess-cache-v3";

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

  // Stale-while-revalidate: answer immediately from cache when we have it
  // (fast, works offline), but always also fetch from the network in the
  // background and refresh the cache for next time. Plain cache-first would
  // otherwise serve the exact same files forever after every future deploy,
  // until the CACHE_NAME below happens to get bumped by hand.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const networkUpdate = fetch(req)
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
