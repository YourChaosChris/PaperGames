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

  document.addEventListener("DOMContentLoaded", injectRulesLink);
})();
