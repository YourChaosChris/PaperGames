// game-storage.js
// Tiny shared localStorage wrapper used by every <game>-app.js to persist
// the in-progress local game, so it survives a page reload or an e-reader
// standby/wake cycle instead of resetting to the placeholder screen.
// Wrapped in try/catch throughout: some browsers throw on localStorage
// access entirely (private mode, storage disabled) - falling back to
// "nothing persists" is fine, a hard error is not.

const GameStorage = (function () {
  function save(key, data) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(data));
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

  return { save, load, clear };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GameStorage;
}
