// offline-status.js
// Tells whether PaperGames is stored on this device for offline use.
// Shared by the version line in the Settings dialog (settings-menu.js) and
// the offline status line on the home page (home-app.js), so both read
// the same answer the same way.
//
// sw.js answers postMessage("papergames-version") with its CACHE_NAME and,
// while it installs, sends { papergamesInstall: { done, total, error } } to
// every open page (and answers "papergames-progress" with the same). A
// worker only becomes active once every file is stored, so an active
// worker means: stored, works offline.
//
// There is no time limit: storing 500-odd files on a slow e-reader can
// take minutes, and an early "can't store" would be wrong. The state is
// read again every TICK_MS while something is still going on.
//
// OfflineStatus.watch(onState) calls onState(state, detail) whenever the
// state or its numbers change:
//   "loading"     - not stored yet. detail.controlled is true when a worker
//                   already controls the page and has just been asked for
//                   its version (the answer normally follows within
//                   milliseconds), false on a first visit while the worker
//                   installs; then detail.done / detail.total count the
//                   stored files once the worker has reported them.
//   "ready"       - stored; detail.version is the CACHE_NAME. While a newer
//                   version is being stored, detail.updating is true (and
//                   done / total count its files).
//   "paused"      - the first install stopped before every file was stored
//                   (connection lost, browser ended it). The files stored
//                   so far are kept; the next try carries on from there.
//                   This page tries again every RETRY_MS while it is open.
//   "unavailable" - final: no service worker support, a file:// copy
//                   (where sw-register.js never registers one), a
//                   registration the browser refused (sw-register.js flags
//                   it), or the device refused to store the files.
// It returns stop(), which drops the timers and listeners; "unavailable"
// stops on its own.

const OfflineStatus = (function () {
  const TICK_MS = 3000;
  const RETRY_MS = 60000;

  function watch(onState) {
    const sw = typeof navigator !== "undefined" && navigator.serviceWorker;
    const httpPage = typeof location !== "undefined" && (location.protocol === "http:" || location.protocol === "https:");
    let finished = false;
    let timer = null;
    let retryTimer = null;
    let reg = null;
    let version = null;
    let versionFrom = null;
    let progress = null;
    let sawInstall = false;
    let lastSent = "";

    function report(state, detail) {
      const d = detail || {};
      const sig = state + "|" + JSON.stringify(d);
      if (sig === lastSent) return;
      lastSent = sig;
      try {
        onState(state, d);
      } catch (e) { /* a broken caller must not break the check */ }
    }
    function stop() {
      finished = true;
      clearTimeout(timer);
      clearTimeout(retryTimer);
      timer = retryTimer = null;
      if (sw) {
        sw.removeEventListener("message", onMessage);
        sw.removeEventListener("controllerchange", evaluate);
      }
      if (reg) reg.removeEventListener("updatefound", onUpdateFound);
      if (typeof document !== "undefined") document.removeEventListener("papergames-sw-failed", unavailable);
    }
    function unavailable() {
      if (finished) return;
      stop();
      report("unavailable");
    }
    function ask(worker, what) {
      try {
        worker.postMessage(what);
      } catch (e) { /* asked again on the next tick */ }
    }
    function onMessage(event) {
      const data = event.data;
      if (finished || !data) return;
      if (data.papergamesVersion) {
        version = String(data.papergamesVersion);
        evaluate();
      } else if (data.papergamesInstall) {
        // Counts are shown on the next tick, so the line changes calmly
        // (every TICK_MS at most); the first count and an error at once.
        const first = !progress;
        progress = data.papergamesInstall;
        sawInstall = true;
        if (first || progress.error) evaluate();
      }
    }
    function onUpdateFound() {
      sawInstall = true;
      tick();
    }
    function getRegistration() {
      if (typeof sw.getRegistration === "function") return sw.getRegistration();
      return Promise.resolve(reg);
    }
    function tick() {
      if (finished) return;
      clearTimeout(timer);
      timer = null;
      getRegistration().then((r) => {
        if (finished) return;
        if (r && r !== reg) {
          if (reg) reg.removeEventListener("updatefound", onUpdateFound);
          reg = r;
          reg.addEventListener("updatefound", onUpdateFound);
        }
        const installing = reg && (reg.installing || reg.waiting);
        if (installing) ask(installing, "papergames-progress");
        evaluate();
      }).catch(() => evaluate());
    }
    function schedule() {
      if (!finished && !timer) timer = setTimeout(tick, TICK_MS);
    }
    function scheduleRetry() {
      if (finished || retryTimer) return;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (finished) return;
        sw.register("sw.js", { updateViaCache: "none" }).then(tick).catch(() => { /* tried again later */ });
      }, RETRY_MS);
    }
    function counts() {
      return progress && typeof progress.total === "number" ? { done: progress.done, total: progress.total } : {};
    }
    function evaluate() {
      if (finished) return;
      const installing = reg && (reg.installing || reg.waiting);
      const active = sw.controller || (reg && reg.active);
      if (installing) sawInstall = true;
      if (active && active !== versionFrom) {
        versionFrom = active;
        version = null;
      }
      if (active && !version) ask(active, "papergames-version");

      if (active && version) {
        if (installing) {
          report("ready", Object.assign({ version: version, updating: true }, counts()));
          schedule();
        } else {
          // Stored and nothing new on the way: no more ticks until the
          // browser finds an update ("updatefound") or a new worker takes
          // over ("controllerchange").
          report("ready", { version: version, updating: false });
        }
        return;
      }
      if (active) {
        report("loading", { controlled: true });
      } else if (installing) {
        report("loading", Object.assign({ controlled: false }, counts()));
      } else if (progress && progress.error === "storage") {
        unavailable();
        return;
      } else if (reg && sawInstall) {
        report("paused", counts());
        scheduleRetry();
      } else {
        report("loading", { controlled: false });
      }
      schedule();
    }

    if (!sw || !httpPage) {
      // Reported asynchronously like every other state, so callers can
      // keep the returned stop() before the first call arrives.
      setTimeout(unavailable, 0);
      return stop;
    }
    if (window.__pgSwRegisterFailed) {
      setTimeout(unavailable, 0);
      return stop;
    }
    document.addEventListener("papergames-sw-failed", unavailable);
    sw.addEventListener("message", onMessage);
    sw.addEventListener("controllerchange", evaluate);
    evaluate();
    tick();
    return stop;
  }

  return { watch };
})();

if (typeof window !== "undefined") window.OfflineStatus = OfflineStatus;
