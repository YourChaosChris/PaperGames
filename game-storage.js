// game-storage.js
// Tiny shared localStorage wrapper used by every <game>-app.js to persist
// the in-progress local game, so it survives a page reload or an e-reader
// standby/wake cycle instead of resetting to the placeholder screen.
// Wrapped in try/catch throughout: some browsers throw on localStorage
// access entirely (private mode, storage disabled) - falling back to
// "nothing persists" is fine, a hard error is not.
//
// Also maintains a small "which games were touched when" index
// (einkchess_recent_games), purely to order the home page's "Continue
// playing" section - every game already calls save()/clear() exactly
// when a game becomes/stops being in-progress, so this piggybacks on
// that instead of needing any of the 46 individual games to report
// anything extra.

const GameStorage = (function () {
  const RECENT_KEY = "einkchess_recent_games";
  const SAVE_PREFIX = "einkchess_save_";

  function slugFromKey(key) {
    return key && key.indexOf(SAVE_PREFIX) === 0 ? key.slice(SAVE_PREFIX.length) : null;
  }

  function touchRecent(slug) {
    if (!slug || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const recent = raw ? JSON.parse(raw) : {};
      recent[slug] = Date.now();
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch (e) { /* ignore */ }
  }

  function save(key, data) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(data));
      touchRecent(slugFromKey(key));
    } catch (e) { /* storage unavailable or full - just don't persist */ }
  }

  function load(key) {
    try {
      if (!window.localStorage) return null;
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clear(key) {
    try {
      if (window.localStorage) window.localStorage.removeItem(key);
    } catch (e) { /* ignore */ }
  }

  // Save-key slugs with a currently in-progress save, most recently
  // touched first. Scans localStorage directly rather than trusting the
  // recency index alone, so it's always accurate even for saves made
  // before this index existed (those just sort after any known-recent
  // ones instead of being missing). This is the save key's own slug,
  // which for a handful of trademark-safe renames differs from the
  // game's current URL slug - callers map that themselves.
  function getRecentSlugs() {
    try {
      if (!window.localStorage) return [];
      const raw = window.localStorage.getItem(RECENT_KEY);
      const recent = raw ? JSON.parse(raw) : {};
      const slugs = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const slug = slugFromKey(window.localStorage.key(i));
        if (slug) slugs.push(slug);
      }
      return slugs.sort((a, b) => (recent[b] || 0) - (recent[a] || 0));
    } catch (e) {
      return [];
    }
  }

  return { save, load, clear, getRecentSlugs };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GameStorage;
}
