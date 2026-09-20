// sw-register.js
// Registers the offline service worker. Skipped entirely on file:// (sideloaded
// copies) and on browsers without Service Worker support – the app itself
// doesn't need either to run.
(function () {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {
      // Offline caching just won't be available on this device/browser; the app still works.
    });
  });
})();
