// high-contrast.js
// Self-injecting high-contrast toggle for low-light e-ink reading
// conditions - same technique as font-size-toggle.js's control (an
// independent, on-device setting, injected at runtime rather than
// hand-written into every page). Bumps a handful of the page's own CSS
// custom properties (background, muted-text color, border thickness,
// board square shades) rather than touching any per-game or
// per-component CSS, since virtually every card, button and board grid
// line in this app already draws from those same shared tokens.

const HighContrast = (function () {
  const KEY = "einkchess_high_contrast";

  function isEnabled() {
    try {
      return !!(window.localStorage && window.localStorage.getItem(KEY) === "1");
    } catch (e) {
      return false;
    }
  }

  // The button that used to live here now lives in the unified Settings
  // menu (settings-menu.js), which calls setEnabled() directly - this
  // module keeps only the state and the class application, since that
  // still has to run unconditionally on every page load regardless of
  // whether the user ever opens Settings.
  function apply(enabled) {
    document.documentElement.classList.toggle("high-contrast", enabled);
  }

  function setEnabled(enabled) {
    apply(enabled);
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, enabled ? "1" : "0");
    } catch (e) { /* storage unavailable - just don't persist */ }
  }

  function toggle() {
    setEnabled(!isEnabled());
  }

  function init() {
    apply(isEnabled());
  }

  document.addEventListener("DOMContentLoaded", init);

  return { isEnabled, setEnabled, toggle };
})();

if (typeof window !== "undefined") {
  window.HighContrast = HighContrast;
}
