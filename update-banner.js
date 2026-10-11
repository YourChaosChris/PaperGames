// update-banner.js
// Tells the player when a new version of the app has just taken over in
// the background, since the page they're currently looking at is still
// running the previous version's HTML/CSS/JS in memory even though new
// network requests are now served by the new one - reloading brings it
// back in sync. sw.js calls self.skipWaiting() + clients.claim(), so an
// update activates immediately rather than waiting for every open tab
// to close first; the standard "controllerchange" event fires exactly
// when that happens, the usual signal PWAs use for this.
//
// The very first visit also fires one controllerchange - the freshly
// registered worker taking control of a page that had no controller
// yet, not a real update - so that first change is swallowed before any
// later one is treated as an actual update.
//
// What's new since this device's last visit, under the main message:
//   - the new games: games-catalog.js now, minus the game slugs stored
//     with the version this device saw last (localStorage SEEN_KEY);
//   - the sentences of release-notes.js between that version and the new
//     one (at most 3, then "And more improvements.").
// No stored version (first update since this code came): the games added
// in the last 14 days and the newest sentence. Nothing new: the main
// message alone, never an old text. As this page still runs the old
// version, the new release-notes.js, games-catalog.js and the active
// language file are read straight from the new worker's cache (no network
// request); the new worker itself says which version, so which cache, it
// is. A new CACHE_NAME without its entry in
// release-notes.js fails tests/static-checks.js.

(function () {
  const SEEN_KEY = "papergames_update_seen";
  const RECENT_DAYS = 14;
  const MAX_NOTES = 3;
  const MAX_GAMES = 6;
  const DAY = 24 * 3600 * 1000;

  function vnum(v) {
    const m = /v(\d+)/.exec(v || "");
    return m ? parseInt(m[1], 10) : NaN;
  }

  // What to show: { games: [catalog entries, newest first], notes:
  // [release-notes entries, newest first], more: true when there were more
  // notes than shown }. `seen` is the stored { version, games } or null,
  // `version` the new version ("v224" or a CACHE_NAME), `now` a time in ms.
  function whatsNew(seen, version, notes, catalog, now) {
    let newN = vnum(version);
    if (isNaN(newN)) newN = Infinity;
    const known = notes.filter((e) => vnum(e.version) <= newN).sort((a, b) => vnum(b.version) - vnum(a.version));
    const oldN = seen ? vnum(seen.version) : NaN;
    let games, list;
    if (!isNaN(oldN) && Array.isArray(seen.games)) {
      games = catalog.filter((g) => seen.games.indexOf(g.slug) === -1);
      list = known.filter((e) => vnum(e.version) > oldN);
    } else {
      games = catalog.filter((g) => {
        const t = Date.parse(g.added);
        return !isNaN(t) && t >= now - RECENT_DAYS * DAY && t <= now + DAY;
      });
      list = known.slice(0, 1);
    }
    games = games.slice().sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0));
    return { games, notes: list.slice(0, MAX_NOTES), more: list.length > MAX_NOTES };
  }

  const api = { whatsNew, vnum, SEEN_KEY };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window === "undefined") return;
  window.UpdateBanner = api;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const script = document.currentScript;
  const base = script && script.src ? script.src.replace(/[^/]*$/, "") : "";
  let hadController = !!navigator.serviceWorker.controller;
  let ignoredFirstChange = false;

  function label(key, fallback) {
    if (!window.I18n || typeof I18n.t !== "function") return fallback;
    const s = I18n.t(key);
    return s && s !== key ? s : fallback;
  }

  function readSeen() {
    try {
      const s = JSON.parse(localStorage.getItem(SEEN_KEY) || "null");
      return s && typeof s === "object" ? s : null;
    } catch (e) {
      return null;
    }
  }

  function writeSeen(s) {
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch (e) { /* no storage: every update counts as the first */ }
  }

  // A file of the version in `cacheName`, straight from that cache (no
  // network request, works offline); from the network only when the cache
  // doesn't have it.
  function fileText(url, cacheName) {
    const net = () => fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(url))));
    if (!cacheName || typeof caches === "undefined") return net();
    return caches.open(cacheName)
      .then((c) => c.match(url))
      .then((r) => (r ? r.text() : net()), net);
  }

  // A constant declared by one of the app's plain script files.
  function constOf(src, name) {
    return new Function(src + "\n;return typeof " + name + " !== \"undefined\" ? " + name + " : null;")();
  }

  function catalogOf(cacheName) {
    return fileText(base + "games-catalog.js", cacheName).then((s) => constOf(s, "GAMES_CATALOG"));
  }

  // The version of the worker now in control ("papergames-cache-v224"),
  // or null when it doesn't answer in time.
  function workerVersion(ms) {
    return new Promise((resolve) => {
      const ctrl = navigator.serviceWorker.controller;
      if (!ctrl) { resolve(null); return; }
      let done = false;
      function finish(v) {
        if (done) return;
        done = true;
        navigator.serviceWorker.removeEventListener("message", onMsg);
        resolve(v);
      }
      function onMsg(e) {
        if (e.data && e.data.papergamesVersion) finish(e.data.papergamesVersion);
      }
      navigator.serviceWorker.addEventListener("message", onMsg);
      ctrl.postMessage("papergames-version");
      setTimeout(() => finish(null), ms);
    });
  }

  function lang() {
    return window.I18n && typeof I18n.getLang === "function" ? I18n.getLang() : "en";
  }

  // The texts of `keys` in language `l`, read out of the new version's
  // lang/<l>.js: its game names and sentences may be newer than the ones
  // this page has loaded. English comes from the entries themselves.
  const langFiles = {};
  function langStrings(l, keys, cacheName) {
    if (!l || l === "en" || !window.I18n || typeof I18n.languageFileUrl !== "function") return Promise.resolve({});
    const file = langFiles[l] || (langFiles[l] = fileText(new URL(I18n.languageFileUrl(l), location.href).href, cacheName).catch(() => ""));
    return file.then((src) => {
      const out = {};
      keys.forEach((k) => {
        const m = new RegExp("\\n\\s*" + k + ": (\"(?:[^\"\\\\]|\\\\.)*\")").exec(src);
        if (m) {
          try { out[k] = JSON.parse(m[1]); } catch (e) { /* falls back to English */ }
        }
      });
      return out;
    });
  }

  // The new version's data, then what's new against the stored visit.
  // The new visit is stored at once, together with what was shown, so
  // every other open tab shows the same.
  function collect() {
    return workerVersion(3000).then((cacheName) => Promise.all([
      cacheName,
      fileText(base + "release-notes.js", cacheName).then((s) => constOf(s, "RELEASE_NOTES")),
      catalogOf(cacheName)
    ])).then((r) => {
      const notes = Array.isArray(r[1]) ? r[1] : [];
      const catalog = Array.isArray(r[2]) ? r[2] : [];
      const version = r[0] ? "v" + vnum(r[0]) : (notes[0] ? notes[0].version : "");
      const seen = readSeen();
      let news;
      if (seen && seen.version === version && seen.shown && seen.shown.version === version) {
        news = {
          games: catalog.filter((g) => seen.shown.games.indexOf(g.slug) !== -1),
          notes: notes.filter((e) => seen.shown.notes.indexOf(e.key) !== -1),
          more: !!seen.shown.more
        };
      } else {
        news = whatsNew(seen, version, notes, catalog, Date.now());
      }
      if (version && catalog.length) {
        writeSeen({
          version,
          games: catalog.map((g) => g.slug),
          shown: { version, games: news.games.map((g) => g.slug), notes: news.notes.map((e) => e.key), more: news.more }
        });
      }
      news.cacheName = r[0];
      return news;
    });
  }

  function within(p, ms) {
    return Promise.race([p.catch(() => null), new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
  }

  function showBanner(news) {
    if (document.getElementById("update-banner")) return;
    news = news || { games: [], notes: [], more: false };

    const bar = document.createElement("div");
    bar.id = "update-banner";
    bar.className = "update-banner";
    bar.setAttribute("role", "status");

    const lines = document.createElement("div");
    lines.className = "update-banner-lines";

    const text = document.createElement("span");
    text.className = "update-banner-text";
    lines.appendChild(text);

    function addLine() {
      const el = document.createElement("span");
      el.className = "update-banner-whats-new";
      lines.appendChild(el);
      return el;
    }
    const gamesLine = news.games.length ? addLine() : null;
    const noteLines = news.notes.map(() => addLine());
    const moreLine = news.more ? addLine() : null;

    const reloadBtn = document.createElement("button");
    reloadBtn.type = "button";
    reloadBtn.className = "primary small";
    reloadBtn.addEventListener("click", () => window.location.reload());

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "secondary small update-banner-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => bar.remove());

    function setLabels(strings) {
      const s = strings || {};
      const pick = (key, fallback) => s[key] || (lang() === "en" ? fallback : label(key, fallback));
      text.textContent = label("update_banner_text", "A new version of PaperGames is available.");
      if (gamesLine) {
        const names = news.games.slice(0, MAX_GAMES).map((g) => pick(g.nameKey, g.nameText));
        if (news.games.length > MAX_GAMES) {
          names.push(label("update_banner_more_games", "{n} more").split("{n}").join(String(news.games.length - MAX_GAMES)));
        }
        gamesLine.textContent = label("update_banner_new_games", "New since your last visit: {s}.")
          .split("{s}").join(names.join(label("update_banner_list_sep", ", ")));
      }
      noteLines.forEach((el, i) => { el.textContent = pick(news.notes[i].key, news.notes[i].text); });
      if (moreLine) moreLine.textContent = label("update_banner_more_notes", "And more improvements.");
      reloadBtn.textContent = label("update_banner_reload", "Reload now");
      closeBtn.setAttribute("aria-label", label("update_banner_dismiss", "Dismiss"));
    }
    const keys = news.games.map((g) => g.nameKey).concat(news.notes.map((e) => e.key));
    const strings = () => (keys.length ? within(langStrings(lang(), keys, news.cacheName), 3000) : Promise.resolve({}));
    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(() => { setLabels(); strings().then(setLabels); });
    }

    bar.appendChild(lines);
    bar.appendChild(reloadBtn);
    bar.appendChild(closeBtn);
    // Every text first, so the banner appears once, complete.
    strings().then((s) => {
      setLabels(s);
      if (!document.getElementById("update-banner")) document.body.insertBefore(bar, document.body.firstChild);
    });
  }

  // Without a stored visit, remember this one (version and games), so the
  // first update after it can tell what's new.
  function remember() {
    if (readSeen()) return;
    workerVersion(3000).then((cacheName) => Promise.all([
      cacheName,
      typeof GAMES_CATALOG !== "undefined" ? GAMES_CATALOG : (cacheName ? catalogOf(cacheName) : null)
    ])).then((r) => {
      if (!r[0] || !Array.isArray(r[1]) || readSeen()) return;
      writeSeen({ version: "v" + vnum(r[0]), games: r[1].map((g) => g.slug) });
    }).catch(() => { /* next visit */ });
  }

  if (hadController) window.addEventListener("load", () => setTimeout(remember, 2000));

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController && !ignoredFirstChange) {
      ignoredFirstChange = true;
      hadController = true;
      setTimeout(remember, 2000);
      return;
    }
    within(collect(), 5000).then(showBanner);
  });
})();
