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

  function apply(level) {
    LEVELS.forEach((l) => document.documentElement.classList.remove("text-size-" + l));
    if (level !== "normal") document.documentElement.classList.add("text-size-" + level);
    const btn = document.getElementById("font-size-toggle-button");
    if (btn) btn.textContent = LABELS[level];
  }

  function setLevel(level) {
    if (LEVELS.indexOf(level) === -1) return;
    apply(level);
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, level);
    } catch (e) { /* storage unavailable - just don't persist */ }
  }

  function cycle() {
    const current = getLevel();
    setLevel(LEVELS[(LEVELS.indexOf(current) + 1) % LEVELS.length]);
  }

  function injectButton() {
    const panel = document.querySelector(".user-panel");
    if (!panel || document.getElementById("font-size-toggle-button")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "font-size-toggle-button";
    btn.className = "secondary small";
    btn.title = "Text size";
    btn.setAttribute("aria-label", "Text size");
    btn.textContent = LABELS[getLevel()];
    btn.addEventListener("click", cycle);
    panel.insertBefore(btn, panel.firstChild);
  }

  function init() {
    apply(getLevel());
    injectButton();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { getLevel, setLevel };
})();

if (typeof window !== "undefined") {
  window.FontSizeToggle = FontSizeToggle;
}
