// settings-menu.js
// Self-injecting Settings menu: one "Settings" button in every page's
// header (same technique as rules-link.js/game-switcher.js - injected
// at runtime rather than hand-written into ~150 static pages) opening a
// single modal that gathers every on-device setting this app has -
// language, text size, high contrast and (on pages with a computer
// opponent) the computer's move speed - instead of each living as
// its own separate icon button in the header. This also gives the 46
// game pages a language switcher for the first time: the old static
// ".lang-switch" markup only ever existed on the ~100 hub pages (home,
// guide, about, stats, rules/history pages), never on the pages people
// actually spend most of their time on.
//
// This module owns none of the underlying settings themselves - it's
// purely the shared UI shell around FontSizeToggle, HighContrast,
// AiPacing and I18n, each of which stays fully usable on its own (e.g. still
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

  function wireAiPacing(overlay) {
    if (typeof AiPacing === "undefined") return;
    const group = overlay.querySelector("#settings-ai-pacing-group");
    if (!group) return;
    const buttons = Array.prototype.slice.call(group.querySelectorAll("button[data-mode]"));

    function refresh() {
      const current = AiPacing.getMode();
      buttons.forEach((btn) => {
        const active = btn.getAttribute("data-mode") === current;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        AiPacing.setMode(btn.getAttribute("data-mode"));
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

  function wireUpdate(overlay) {
    const btn = overlay.querySelector("#settings-force-update");
    if (!btn) return;
    if (typeof ForceUpdate === "undefined") {
      btn.classList.add("hidden");
      return;
    }
    btn.addEventListener("click", () => ForceUpdate.run(overlay.querySelector("#settings-force-update-status"), btn));
  }

  // Asks the service worker for its CACHE_NAME. On a first visit the worker
  // is still installing and doesn't control the page yet, so this shows
  // "Checking…" and asks again once it is ready or takes over. "Version
  // unknown" appears only without service worker support, when a worker
  // doesn't answer a single query within two seconds, or when nothing has
  // happened after 30 seconds in total.
  let stopVersionCheck = null;

  function showVersion() {
    const el = document.getElementById("settings-version-value");
    if (!el) return;
    // Reopening the dialog starts over; drop the previous run's timers and
    // listeners so they can't run twice.
    if (stopVersionCheck) stopVersionCheck();

    const sw = typeof navigator !== "undefined" && navigator.serviceWorker;
    let finished = false;
    let pending = false;
    let queryTimer = null;
    let totalTimer = null;

    function setKey(key, fallback) {
      el.setAttribute("data-i18n", key);
      el.textContent = t(key, fallback);
    }
    function stop() {
      finished = true;
      clearTimeout(queryTimer);
      clearTimeout(totalTimer);
      if (sw) {
        sw.removeEventListener("message", onMessage);
        sw.removeEventListener("controllerchange", onControllerChange);
      }
      if (stopVersionCheck === stop) stopVersionCheck = null;
    }
    function unknown() {
      if (finished) return;
      stop();
      setKey("settings_version_unknown", "Version unknown");
    }
    function onMessage(event) {
      const data = event.data;
      if (finished || !data || !data.papergamesVersion) return;
      stop();
      el.removeAttribute("data-i18n");
      el.textContent = String(data.papergamesVersion);
    }
    // Sends one query to the given worker (the controller, or the
    // registration's active worker once it is ready). The reply goes to
    // this page either way, since sw.js answers event.source.
    function ask(worker) {
      if (finished || pending || !worker) return;
      pending = true;
      try {
        worker.postMessage("papergames-version");
      } catch (e) {
        unknown();
        return;
      }
      queryTimer = setTimeout(unknown, 2000);
    }
    function onControllerChange() {
      sw.removeEventListener("controllerchange", onControllerChange);
      ask(sw.controller);
    }

    if (!sw) {
      unknown();
      return;
    }
    stopVersionCheck = stop;
    sw.addEventListener("message", onMessage);
    if (sw.controller) {
      el.removeAttribute("data-i18n");
      el.textContent = "…";
      ask(sw.controller);
      return;
    }
    setKey("settings_version_checking", "Checking…");
    sw.addEventListener("controllerchange", onControllerChange);
    totalTimer = setTimeout(unknown, 30000);
    sw.ready.then((registration) => {
      if (!finished) ask(sw.controller || registration.active);
    }).catch(() => { /* the 30-second limit covers this */ });
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
          // Every page loads ai-pacing.js; the check only guards against a
          // page that doesn't.
          (typeof AiPacing !== "undefined"
            ? '<h3 class="settings-subheading" data-i18n="settings_section_ai_pacing">Computer speed</h3>' +
              '<div class="settings-segmented" id="settings-ai-pacing-group" role="group">' +
                '<button type="button" class="secondary" data-mode="fast" data-i18n="settings_ai_pacing_fast">Fast</button>' +
                '<button type="button" class="secondary" data-mode="normal" data-i18n="settings_ai_pacing_normal">Normal</button>' +
                '<button type="button" class="secondary" data-mode="slow" data-i18n="settings_ai_pacing_slow">Slow</button>' +
              '</div>'
            : '') +
        '</section>' +
        // Which version is running (answered by sw.js, the single place it
        // is kept) and a way to fetch the latest one from any page.
        '<section class="settings-section settings-version-section">' +
          '<p class="settings-version-line"><span data-i18n="settings_version_label">Version:</span> ' +
            '<span id="settings-version-value"></span></p>' +
          '<button type="button" class="secondary small" id="settings-force-update" data-i18n="guide_update_button">Force update now</button>' +
          '<p class="settings-version-hint" data-i18n="settings_update_hint">This needs an internet connection.</p>' +
          '<p id="settings-force-update-status" class="status-text" aria-live="polite"></p>' +
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
    wireAiPacing(overlay);
    wireUpdate(overlay);

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
    showVersion();
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
