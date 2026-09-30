// offline-status.js
// Asks the service worker whether PaperGames is stored on this device.
// Shared by the version line in the Settings dialog (settings-menu.js) and
// the offline status line on the home page (home-app.js), so both read
// the same answer the same way.
//
// sw.js answers postMessage("papergames-version") with its CACHE_NAME. A
// worker only becomes active once its install step has stored the whole
// app shell (cache.addAll in sw.js), so any answer means: stored, works
// offline. Until then the page is loading it.
//
// OfflineStatus.watch(onState, options) calls onState(state, detail):
//   "loading"     - no answer yet. detail.controlled is true when a worker
//                   already controls the page and has just been asked (the
//                   answer normally follows within milliseconds), false on
//                   a first visit while the worker is still installing.
//   "ready"       - the worker answered; detail.version is its CACHE_NAME.
//   "unavailable" - no service worker support, a file:// copy (where
//                   sw-register.js never registers one), a registration
//                   the browser refused (sw-register.js flags it), a worker
//                   that doesn't answer a query within two seconds, or no
//                   answer at all within options.limit (default 30
//                   seconds; this also covers an install that failed).
// It returns stop(), which drops the timers and listeners; "ready" and
// "unavailable" stop on their own.

const OfflineStatus = (function () {
  function watch(onState, options) {
    const limit = (options && options.limit) || 30000;
    const sw = typeof navigator !== "undefined" && navigator.serviceWorker;
    const httpPage = typeof location !== "undefined" && (location.protocol === "http:" || location.protocol === "https:");
    let finished = false;
    let pending = false;
    let queryTimer = null;
    let totalTimer = null;

    function report(state, detail) {
      try {
        onState(state, detail || {});
      } catch (e) { /* a broken caller must not break the check */ }
    }
    function stop() {
      finished = true;
      clearTimeout(queryTimer);
      clearTimeout(totalTimer);
      if (sw) {
        sw.removeEventListener("message", onMessage);
        sw.removeEventListener("controllerchange", onControllerChange);
      }
      if (typeof document !== "undefined") document.removeEventListener("papergames-sw-failed", unavailable);
    }
    function unavailable() {
      if (finished) return;
      stop();
      report("unavailable");
    }
    function onMessage(event) {
      const data = event.data;
      if (finished || !data || !data.papergamesVersion) return;
      stop();
      report("ready", { version: String(data.papergamesVersion) });
    }
    // Sends one query to the given worker (the controller, or the
    // registration's active worker once it is ready). The reply goes to
    // this page either way, since sw.js answers event.source.
    function ask(worker) {
      if (finished || pending || !worker) return;
      pending = true;
      try {
        worker.postMessage("papergames-version");
      } catch (e) {
        unavailable();
        return;
      }
      queryTimer = setTimeout(unavailable, 2000);
    }
    function onControllerChange() {
      sw.removeEventListener("controllerchange", onControllerChange);
      ask(sw.controller);
    }

    if (!sw || !httpPage) {
      // Reported asynchronously like every other state, so callers can
      // keep the returned stop() before the first call arrives.
      setTimeout(unavailable, 0);
      return stop;
    }
    sw.addEventListener("message", onMessage);
    if (sw.controller) {
      report("loading", { controlled: true });
      ask(sw.controller);
      return stop;
    }
    report("loading", { controlled: false });
    if (window.__pgSwRegisterFailed) {
      setTimeout(unavailable, 0);
      return stop;
    }
    document.addEventListener("papergames-sw-failed", unavailable);
    sw.addEventListener("controllerchange", onControllerChange);
    totalTimer = setTimeout(unavailable, limit);
    sw.ready.then((registration) => {
      if (!finished) ask(sw.controller || registration.active);
    }).catch(() => { /* the time limit covers this */ });
    return stop;
  }

  return { watch };
})();

if (typeof window !== "undefined") window.OfflineStatus = OfflineStatus;
