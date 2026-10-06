// density.js
// Display density: compact, normal (default) or spacious - one on-device
// setting for every page, stored like ai-pacing.js. It only marks the
// root element (data-density="compact" | "spacious"; nothing for normal);
// style.css then scales the spacing scale --space-1 .. --space-5 by 0.75
// or 1.5. No single rule changes, and the boards don't use the scale, so
// fields, pieces and tap targets stay the same size in every density.
// The mark is set as soon as this script runs, before the page is drawn.

const Density = (function () {
  const KEY = "papergames_density";
  const LEVELS = ["compact", "normal", "spacious"];
  const DEFAULT_LEVEL = "normal";

  function getLevel() {
    try {
      const stored = window.localStorage && window.localStorage.getItem(KEY);
      return LEVELS.indexOf(stored) !== -1 ? stored : DEFAULT_LEVEL;
    } catch (e) {
      return DEFAULT_LEVEL;
    }
  }

  function apply(level) {
    const root = document.documentElement;
    if (!root) return;
    if (level === DEFAULT_LEVEL) root.removeAttribute("data-density");
    else root.setAttribute("data-density", level);
  }

  function setLevel(level) {
    if (LEVELS.indexOf(level) === -1) return;
    apply(level);
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, level);
    } catch (e) { /* storage unavailable - just don't remember it */ }
  }

  apply(getLevel());

  return { LEVELS: LEVELS, getLevel: getLevel, setLevel: setLevel };
})();

if (typeof window !== "undefined") window.Density = Density;
