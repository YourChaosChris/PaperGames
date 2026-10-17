// sw-register.js
// Registers the offline service worker. Skipped entirely on file:// (sideloaded
// copies) and on browsers without Service Worker support – the app itself
// doesn't need either to run.
(function () {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") return;

  // The offline storage keeps the rules and history texts of English and of
  // the language in use only (see sw.js, TEXT_LAZY). This tells the worker
  // which language that is, now and whenever the language is changed, so it
  // stores that language's texts in the background when there is a network.
  var told = "";
  function storeTextLanguage() {
    try {
      var lang = window.I18n && window.I18n.getLang && window.I18n.getLang();
      if (!lang || lang === "en" || lang === told) return;
      navigator.serviceWorker.ready.then(function (registration) {
        if (!registration.active) return;
        told = lang;
        registration.active.postMessage({ papergamesTextLang: lang });
      }).catch(function () { /* best effort */ });
    } catch (e) { /* best effort */ }
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (window.I18n && window.I18n.onChange) window.I18n.onChange(function () { storeTextLanguage(); });
  });

  window.addEventListener("load", function () {
    // updateViaCache: "none" - GitHub Pages serves everything with
    // Cache-Control: max-age=600, and unlike this app's own fetch handler
    // (which already forces { cache: "reload" } for every precached file -
    // see sw.js), the browser's own "is sw.js different?" check on each
    // register() call is NOT covered by that and can otherwise be quietly
    // answered from the browser's HTTP cache for up to 10 minutes, making
    // a genuinely new deploy take several reloads to actually reach a
    // returning visitor. This option removes that hidden middle-man.
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (registration) {
      // Also proactively ask right away, rather than only relying on the
      // browser's own internal schedule for re-checking an already
      // registered worker (which can otherwise wait quite a while).
      registration.update().catch(function () { /* best effort */ });
      storeTextLanguage();
    }).catch(function () {
      // Offline caching just won't be available on this device/browser; the
      // app still works. offline-status.js shows this on the home page.
      window.__pgSwRegisterFailed = true;
      try { document.dispatchEvent(new Event("papergames-sw-failed")); } catch (e) { /* old browser */ }
    });
  });
})();
