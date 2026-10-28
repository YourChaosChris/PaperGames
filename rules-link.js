// rules-link.js
// Self-injecting "Rules" link for game pages, added to the header next
// to the language picker / font-size toggle / game switcher - same
// technique as those (injected at runtime rather than hand-written into
// ~150 static pages), so a player who forgets how a game works can look
// it up without leaving the game to go back through index.html's game
// list, which is the only place a Rules link existed before.
//
// Detected by the presence of #board-section rather than a hardcoded
// list of game slugs: every actual game's play page has one and no
// other page (home, guide, rules, history, stats, legal pages) does, so
// a game added later needs no changes here, and the link correctly
// stays off the rules page itself.

(function () {
  function injectRulesLink() {
    const panel = document.querySelector(".user-panel");
    const slug = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "");
    if (!slug) return;

    // Rules and history pages already have the localized return link at
    // the bottom. Repeat that same link before the first section heading
    // so it is available without scrolling through the whole page.
    if (/-rules$|-history$/.test(slug)) {
      const content = document.querySelector(".content-page");
      const bottom = content && content.querySelector(".about-back a[data-i18n='about_back']");
      if (!content || !bottom || content.querySelector(".about-back-top")) return;
      const top = bottom.parentElement.cloneNode(true);
      top.classList.add("about-back-top");
      const link = top.querySelector("a");
      function setBackLabel() {
        if (window.I18n && typeof I18n.t === "function") link.textContent = I18n.t("about_back");
      }
      setBackLabel();
      const firstHeading = content.querySelector("h2");
      if (firstHeading) content.insertBefore(top, firstHeading);
      else content.insertBefore(top, bottom.parentElement);
      if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(setBackLabel);
      return;
    }

    if (!document.getElementById("board-section")) return;
    document.body.classList.add("game-page");
    const siteNav = document.querySelector(".site-nav");
    if (siteNav) siteNav.remove();
    injectReportLink(slug);
    if (!panel || document.getElementById("rules-link-button")) return;

    const link = document.createElement("a");
    link.id = "rules-link-button";
    link.className = "secondary";
    link.href = slug + "-rules.html";
    function setLabel() {
      link.textContent = (window.I18n && typeof I18n.t === "function") ? I18n.t("nav_rules") : "Rules";
    }
    setLabel();
    panel.insertBefore(link, panel.firstChild);

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabel);
    }
  }

  // "Report an idea or bug": a plain mailto: link first in the footer of
  // every game page (below the game, so the board never moves). It only
  // opens the player's own email program with game, version, language,
  // browser and window size filled in (the device matters most for e-reader
  // bugs) - nothing is sent from here, no server, no tracking. The version
  // is the running CACHE_NAME, asked from the service worker (sw.js answers
  // "papergames-version"), or read from sw.js; else it says "unknown".
  const REPORT_ADDRESS = "yourchaos@googlemail.com";

  function injectReportLink(slug) {
    const footer = document.querySelector(".site-footer");
    if (!footer || document.getElementById("report-link")) return;
    let version = "unknown";
    const link = document.createElement("a");
    link.id = "report-link";
    link.className = "report-link";
    function t(key, fallback) {
      const s = (window.I18n && typeof I18n.t === "function") ? I18n.t(key) : "";
      return s && s !== key ? s : fallback;
    }
    function update() {
      const lang = (window.I18n && typeof I18n.getLang === "function") ? I18n.getLang() : (document.documentElement.lang || "en");
      const label = t("report_link", "Report an idea or bug");
      const game = t("game_" + slug, slug);
      link.textContent = label;
      const subject = "PaperGames: " + label + " (" + slug + ", " + version + ")";
      const body = t("report_mail_prompt", "What happened? Please describe briefly what you did and what you saw:") +
        "\n\n\n\n---\nGame: " + game + " (" + slug + ")\nVersion: " + version + "\nLanguage: " + lang +
        "\nBrowser: " + (navigator.userAgent || "unknown") + "\nScreen: " + window.innerWidth + " x " + window.innerHeight + "\n";
      link.href = "mailto:" + REPORT_ADDRESS + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
    update();
    footer.insertBefore(link, footer.firstChild);
    if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(update);

    // No service worker controls the page (first visit while the app shell
    // is still being stored, or a browser without service workers): the
    // version is read once from sw.js on this same site instead.
    function versionFromFile() {
      if (version !== "unknown" || typeof fetch !== "function") return;
      fetch("sw.js", { cache: "no-store" }).then((r) => (r.ok ? r.text() : "")).then((src) => {
        const m = /const CACHE_NAME = "([^"]+)"/.exec(src || "");
        if (m && version === "unknown") { version = m[1]; update(); }
      }).catch(() => { /* stays "unknown" */ });
    }
    window.addEventListener("resize", update);
    const sw = navigator.serviceWorker;
    if (!sw || !sw.controller) versionFromFile();
    if (!sw) return;
    sw.addEventListener("message", (event) => {
      const data = event.data;
      if (data && data.papergamesVersion) {
        version = String(data.papergamesVersion);
        update();
      }
    });
    function ask() {
      try { if (sw.controller) sw.controller.postMessage("papergames-version"); } catch (e) { /* stays "unknown" */ }
    }
    ask();
    sw.addEventListener("controllerchange", ask);
  }

  document.addEventListener("DOMContentLoaded", injectRulesLink);
})();
