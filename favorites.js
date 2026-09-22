// favorites.js
// Tiny shared localStorage-backed list of the player's own starred games,
// used by index.html (to show a "My Favorites" section) and games.html
// (to let the player toggle any game's star). Wrapped in try/catch like
// game-storage.js: some browsers throw on localStorage access entirely
// (private mode, storage disabled) - falling back to "no favorites
// persist" is fine, a hard error is not.

const Favorites = (function () {
  const KEY = "einkchess_favorites";
  const listeners = [];

  function getAll() {
    try {
      if (!window.localStorage) return [];
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function isFavorite(slug) {
    return getAll().indexOf(slug) !== -1;
  }

  function setAll(list) {
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) { /* storage unavailable or full - just don't persist */ }
    listeners.forEach((fn) => fn(list));
  }

  function add(slug) {
    const list = getAll();
    if (list.indexOf(slug) === -1) {
      list.push(slug);
      setAll(list);
    }
  }

  function remove(slug) {
    const list = getAll().filter((s) => s !== slug);
    setAll(list);
  }

  function toggle(slug) {
    if (isFavorite(slug)) remove(slug);
    else add(slug);
    return isFavorite(slug);
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return { getAll, isFavorite, add, remove, toggle, onChange };
})();

// A top-level `const` doesn't become a `window` property on its own (unlike
// `var`) - export it explicitly, the same way i18n.js exposes `window.I18n`,
// so other scripts can defensively check `window.Favorites` before using it.
window.Favorites = Favorites;

if (typeof module !== "undefined" && module.exports) {
  module.exports = Favorites;
}
