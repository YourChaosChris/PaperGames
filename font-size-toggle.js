// font-size-toggle.js
// Self-injecting text-size control, added next to the language picker in
// every page's header - same technique as i18n.js's lang-select and
// game-switcher.js's game picker (injected at runtime rather than
// hand-written into ~150 static pages, so a page added later needs no
// changes here). Tolino's own system-wide font size setting only
// affects its e-book reader, not this app's own web pages, so this is
// this app's own, independent control, remembered per device.

const FontSizeToggle = (function () {
  const KEY = "einkchess_text_size";
  const LEVELS = ["normal", "large", "xlarge"];
  const LABELS = { normal: "A", large: "A+", xlarge: "A++" };

  function getLevel() {
    try {
      const saved = window.localStorage ? window.localStorage.getItem(KEY) : null;
      return LEVELS.indexOf(saved) !== -1 ? saved : "normal";
    } catch (e) {
      return "normal";
    }
  }

  // The button that used to live here now lives in the unified Settings
  // menu (settings-menu.js), which calls setLevel() directly - this
  // module keeps only the state and the class application, since that
  // still has to run unconditionally on every page load regardless of
  // whether the user ever opens Settings.
  function apply(level) {
    LEVELS.forEach((l) => document.documentElement.classList.remove("text-size-" + l));
    if (level !== "normal") document.documentElement.classList.add("text-size-" + level);
  }

  function setLevel(level) {
    if (LEVELS.indexOf(level) === -1) return;
    apply(level);
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, level);
    } catch (e) { /* storage unavailable - just don't persist */ }
  }

  function init() {
    apply(getLevel());
  }

  document.addEventListener("DOMContentLoaded", init);

  return { getLevel, setLevel, LEVELS, LABELS };
})();

if (typeof window !== "undefined") {
  window.FontSizeToggle = FontSizeToggle;
}
