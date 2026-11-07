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

// App mode and colour theme (task 186). The iOS app wrapper sets
// window.PAPERGAMES_APP = "ios" before the page loads; "?app=ios" does the
// same for tests (remembered for the browser tab only). In app mode the
// donation link is hidden (class app-ios, see base.css .web-only) and the
// cream theme is the default. On the website white stays the default.
const Theme = (function () {
  const KEY = "papergames_theme";
  const APP_KEY = "papergames_app_mode";

  function isApp() {
    try {
      if (window.PAPERGAMES_APP === "ios") return true;
      if (/[?&]app=ios(?:&|$)/.test(window.location.search)) {
        try { window.sessionStorage.setItem(APP_KEY, "ios"); } catch (e) { /* ignore */ }
        return true;
      }
      return window.sessionStorage.getItem(APP_KEY) === "ios";
    } catch (e) {
      return false;
    }
  }

  function get() {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "cream" || v === "white") return v;
    } catch (e) { /* ignore */ }
    return isApp() ? "cream" : "white";
  }

  function apply() {
    const root = document.documentElement;
    if (!root) return;
    root.classList.toggle("app-ios", isApp());
    root.classList.toggle("theme-cream", get() === "cream");
  }

  function set(v) {
    if (v !== "cream" && v !== "white") return;
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* not remembered */ }
    apply();
  }

  apply();
  return { isApp: isApp, get: get, set: set };
})();

if (typeof window !== "undefined") window.Theme = Theme;
