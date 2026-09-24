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
    if (!document.getElementById("board-section")) return;
    const panel = document.querySelector(".user-panel");
    if (!panel || document.getElementById("rules-link-button")) return;

    const slug = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "");
    if (!slug) return;

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
