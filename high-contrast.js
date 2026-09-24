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

  function apply(enabled) {
    document.documentElement.classList.toggle("high-contrast", enabled);
    const btn = document.getElementById("high-contrast-toggle-button");
    if (btn) {
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.classList.toggle("active", enabled);
    }
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

  function injectButton() {
    const panel = document.querySelector(".user-panel");
    if (!panel || document.getElementById("high-contrast-toggle-button")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "high-contrast-toggle-button";
    btn.className = "secondary";
    btn.textContent = "◑"; // circle half black - a plain, language-independent contrast glyph

    function setLabel() {
      const title = (window.I18n && typeof I18n.t === "function") ? I18n.t("high_contrast_toggle") : "High contrast";
      btn.title = title;
      btn.setAttribute("aria-label", title);
    }
    setLabel();
    btn.setAttribute("aria-pressed", isEnabled() ? "true" : "false");
    btn.classList.toggle("active", isEnabled());
    btn.addEventListener("click", toggle);
    panel.insertBefore(btn, panel.firstChild);

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabel);
    }
  }

  function init() {
    apply(isEnabled());
    injectButton();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { isEnabled, setEnabled };
})();

if (typeof window !== "undefined") {
  window.HighContrast = HighContrast;
}
