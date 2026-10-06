// quick-rules.js
// The short rules box above the board: at most three sentences - the
// goal, how a move works, and (where the rules page has one) the single
// rule people trip over in this particular game - with "Let's go" to
// close it and "All rules" for the full rules page.
//
// It opens by itself the first time a game is opened on this device,
// and afterwards only through the "Quick rules" button next to the
// header's Rules link (rules-link.js). Like rules-link.js it detects a
// game page by #board-section, so it never shows on the home, rules or
// history pages. The sentences are i18n keys quickrules_<slug>_1..3 in
// i18n.js / lang/*.js; a game without keys gets neither box nor button.
//
// The "seen" mark is one localStorage entry per game, guarded like
// favorites.js: without storage the box simply shows again next time.

(function () {
  const SEEN_PREFIX = "papergames_quickrules_seen_";

  function tr(key, fallback) {
    if (!window.I18n || typeof I18n.t !== "function") return fallback;
    const text = I18n.t(key);
    return text && text !== key ? text : fallback;
  }

  function sentenceKeys(slug) {
    const keys = [];
    for (let i = 1; i <= 3; i++) {
      const key = "quickrules_" + slug + "_" + i;
      if (tr(key, null)) keys.push(key);
    }
    return keys;
  }

  function wasSeen(slug) {
    try {
      return !!(window.localStorage && window.localStorage.getItem(SEEN_PREFIX + slug));
    } catch (e) {
      return false;
    }
  }

  function markSeen(slug) {
    try {
      if (window.localStorage) window.localStorage.setItem(SEEN_PREFIX + slug, "1");
    } catch (e) { /* storage unavailable - the box just shows again */ }
  }

  function setText(el, key, fallback) {
    if (window.I18n && typeof I18n.setKey === "function") I18n.setKey(el, key);
    else el.textContent = fallback;
  }

  function buildBox(slug, keys) {
    const box = document.createElement("section");
    box.id = "quick-rules";
    box.className = "card quick-rules hidden";
    box.setAttribute("role", "note");

    keys.forEach((key) => {
      const p = document.createElement("p");
      p.className = "quick-rules-sentence";
      setText(p, key, "");
      box.appendChild(p);
    });

    const actions = document.createElement("div");
    actions.className = "quick-rules-actions";

    const go = document.createElement("button");
    go.type = "button";
    go.id = "quick-rules-go";
    go.className = "primary small";
    setText(go, "quickrules_go", "Let's go");
    go.addEventListener("click", () => box.classList.add("hidden"));
    actions.appendChild(go);

    const all = document.createElement("a");
    all.id = "quick-rules-all";
    all.className = "secondary small";
    all.href = slug + "-rules.html";
    setText(all, "quickrules_all", "All rules");
    actions.appendChild(all);

    box.appendChild(actions);
    return box;
  }

  function init() {
    const boardSection = document.getElementById("board-section");
    if (!boardSection || document.getElementById("quick-rules")) return;
    const slug = (location.pathname.split("/").pop() || "").replace(/\.html?$/i, "");
    if (!slug) return;
    const keys = sentenceKeys(slug);
    if (!keys.length) return;

    const box = buildBox(slug, keys);
    boardSection.parentNode.insertBefore(box, boardSection);

    const panel = document.querySelector(".user-panel");
    if (panel) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "quick-rules-button";
      btn.className = "secondary";
      setText(btn, "quickrules_button", "Quick rules");
      btn.addEventListener("click", () => {
        box.classList.remove("hidden");
        box.scrollIntoView();
      });
      const rulesLink = document.getElementById("rules-link-button");
      panel.insertBefore(btn, rulesLink ? rulesLink.nextSibling : panel.firstChild);
    }

    if (!wasSeen(slug)) {
      box.classList.remove("hidden");
      markSeen(slug);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
