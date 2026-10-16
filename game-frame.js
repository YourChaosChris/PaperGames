// Adds the shared, always-visible home control to each game's existing
// header, and marks the controls already supplied by that game's markup.
// The frame deliberately keeps their IDs, order, listeners and game logic.
(function () {
  "use strict";

  function init() {
    var header = document.querySelector(".app-header");
    if (!header) return;

    var panel = header.querySelector(".user-panel");
    if (!panel) return;

    header.setAttribute("data-game-frame", "true");
    var home = panel.querySelector(".game-home-link");
    if (!home) {
      home = document.createElement("a");
      home.href = "index.html";
      home.className = "site-nav-link game-home-link";
      home.setAttribute("data-i18n", "nav_home");
      home.setAttribute("data-game-frame-part", "home");
      home.textContent = window.I18n && typeof I18n.t === "function" ? I18n.t("nav_home") : "Home";
    }
    if (home.parentNode !== panel || panel.firstElementChild !== home) {
      panel.insertBefore(home, panel.firstElementChild);
    }

    function mark(root, selector, part) {
      root.querySelectorAll(selector).forEach(function (element) {
        if (!element.hasAttribute("data-game-frame-part")) {
          element.setAttribute("data-game-frame-part", part);
        }
      });
    }

    mark(header, ".game-select, .game-switch", "title");
    mark(document, "#mode-offline, #mode-offline-ai, #mode-ai", "mode");
    mark(document, "#new-game-btn, [id^='start-'][id$='-game']", "start");
    mark(document, "#status, #board-info, [id$='-status']", "status");
    mark(document, "#result, #game-result, [id$='-result']", "result");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
