// settings-menu.js
// Self-injecting Settings menu: one "Settings" button in every page's
// header (same technique as rules-link.js/game-switcher.js - injected
// at runtime rather than hand-written into ~150 static pages) opening a
// single modal that gathers every on-device setting this app has -
// language, text size and high contrast - instead of each living as
// its own separate icon button in the header. This also gives the 46
// game pages a language switcher for the first time: the old static
// ".lang-switch" markup only ever existed on the ~100 hub pages (home,
// guide, about, stats, rules/history pages), never on the pages people
// actually spend most of their time on.
//
// This module owns none of the underlying settings themselves - it's
// purely the shared UI shell around FontSizeToggle, HighContrast and
// I18n, each of which stays fully usable on its own (e.g. still
// applies its persisted state on every page load) even if this script
// somehow failed to load.
//
// Backup/restore used to live here too, but Tolino's own browser
// refuses the file download outright ("Dateiformat wird nicht
// unterstützt") - confirmed on real hardware - and has no real way to
// receive an imported file either, so the feature was removed rather
// than kept as something that only worked on other devices.

const SettingsMenu = (function () {
  function t(key, fallback) {
    return (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : fallback;
  }

  function wireTextSize(overlay) {
    if (typeof FontSizeToggle === "undefined") return;
    const group = overlay.querySelector("#settings-textsize-group");
    if (!group) return;
    const buttons = Array.prototype.slice.call(group.querySelectorAll("button[data-level]"));

    function refresh() {
      const current = FontSizeToggle.getLevel();
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-level") === current;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        FontSizeToggle.setLevel(btn.getAttribute("data-level"));
        refresh();
      });
    });
    refresh();
  }

  function wireHighContrast(overlay) {
    if (typeof HighContrast === "undefined") return;
    const checkbox = overlay.querySelector("#settings-high-contrast-checkbox");
    if (!checkbox) return;
    checkbox.checked = HighContrast.isEnabled();
    checkbox.addEventListener("change", () => {
      HighContrast.setEnabled(checkbox.checked);
    });
  }

  function buildModal() {
    if (document.getElementById("settings-modal-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "settings-modal-overlay";
    overlay.className = "settings-modal-overlay hidden";
    overlay.innerHTML =
      '<div class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">' +
        '<div class="settings-modal-header">' +
          '<h2 id="settings-modal-title" data-i18n="settings_modal_title">Settings</h2>' +
          '<button type="button" class="secondary small settings-modal-close" data-i18n-attr="aria-label:settings_close">✕</button>' +
        '</div>' +
        '<section class="settings-section">' +
          '<h3 data-i18n="settings_section_language">Language</h3>' +
          '<div class="lang-switch"></div>' +
        '</section>' +
        '<section class="settings-section">' +
          '<h3 data-i18n="settings_section_textsize">Text size</h3>' +
          '<div class="settings-segmented" id="settings-textsize-group" role="group">' +
            '<button type="button" class="secondary" data-level="normal" data-i18n-attr="aria-label:settings_textsize_normal">A</button>' +
            '<button type="button" class="secondary" data-level="large" data-i18n-attr="aria-label:settings_textsize_large">A+</button>' +
            '<button type="button" class="secondary" data-level="xlarge" data-i18n-attr="aria-label:settings_textsize_xlarge">A++</button>' +
          '</div>' +
        '</section>' +
        '<section class="settings-section">' +
          '<h3 data-i18n="settings_section_display">Display</h3>' +
          '<label class="settings-checkbox-row">' +
            '<input type="checkbox" id="settings-high-contrast-checkbox">' +
            '<span data-i18n="high_contrast_toggle">High contrast</span>' +
          '</label>' +
        '</section>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hide();
    });
    overlay.querySelector(".settings-modal-close").addEventListener("click", hide);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.classList.contains("hidden")) hide();
    });

    wireTextSize(overlay);
    wireHighContrast(overlay);

    // Populates the freshly-inserted .lang-switch <select> and translates
    // every data-i18n/data-i18n-attr element just added above - both are
    // exactly what I18n.init() already does for a page's static markup at
    // load time, just re-run now that this markup exists.
    if (window.I18n && typeof I18n.init === "function") I18n.init();
  }

  function show() {
    buildModal();
    const overlay = document.getElementById("settings-modal-overlay");
    if (overlay) overlay.classList.remove("hidden");
  }

  function hide() {
    const overlay = document.getElementById("settings-modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  function injectTrigger() {
    const panel = document.querySelector(".user-panel");
    if (!panel || document.getElementById("settings-menu-button")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "settings-menu-button";
    btn.className = "secondary";

    function setLabel() {
      btn.textContent = t("settings_menu_button", "⚙ Settings");
    }
    setLabel();
    btn.addEventListener("click", show);
    panel.insertBefore(btn, panel.firstChild);

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabel);
    }
  }

  function init() {
    injectTrigger();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { show, hide };
})();

if (typeof window !== "undefined") {
  window.SettingsMenu = SettingsMenu;
}
