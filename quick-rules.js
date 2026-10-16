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
// history pages. The sentences are i18n keys quickrules_<slug>_1..4 in
// i18n.js / lang/*.js (most games have three); a game without keys gets
// neither box nor button.
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

  // Pages renamed after their texts were written keep the old key prefix.
  const KEY_PREFIX = { noneighbors: "numberblocks" };

  function sentenceKeys(slug) {
    const keys = [];
    for (let i = 1; i <= 4; i++) {
      const key = "quickrules_" + (KEY_PREFIX[slug] || slug) + "_" + i;
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

  function updateSentences(slug, keys) {
    const box = document.getElementById("quick-rules");
    if (!box || !keys || !keys.length) return;
    const actions = box.querySelector(".quick-rules-actions");
    box.querySelectorAll(".quick-rules-sentence").forEach((p) => p.remove());
    keys.forEach((key) => {
      const p = document.createElement("p");
      p.className = "quick-rules-sentence";
      setText(p, key, "");
      box.insertBefore(p, actions);
    });
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

    // Rules remain available from their button, while the first screen is
    // reserved for the playable board and its controls.
    box.classList.add("hidden");
    if (!wasSeen(slug)) markSeen(slug);

    // Game apps attach their start handlers in their own DOMContentLoaded
    // listeners, registered after this shared rules module.
    window.setTimeout(() => prepareDirectPlay(slug), 0);
  }

  function prepareDirectPlay(slug) {
    const boardSection = document.getElementById("board-section");
    const board = document.getElementById("board-container");
    const placeholder = document.getElementById("board-placeholder");
    const start = findStartButton();
    if (!boardSection || !placeholder) return;

    const settingsKey = "papergames_last_settings_" + slug;
    const hasActiveBoard = !!(board && !board.classList.contains("hidden"));
    let remembered = null;
    try { remembered = JSON.parse(localStorage.getItem(settingsKey) || "null"); } catch (e) {}

    if (!hasActiveBoard && remembered) {
      if (remembered.modeId) {
        const mode = document.getElementById(remembered.modeId);
        if (mode) mode.click();
      }
      (remembered.fields || []).forEach((entry) => {
        const el = entry.id ? document.getElementById(entry.id) : document.querySelector(entry.selector);
        if (el && (el.tagName === "SELECT" || el.type === "checkbox" || el.type === "radio")) {
          if (el.type === "checkbox" || el.type === "radio") el.checked = !!entry.checked;
          else el.value = entry.value;
        }
      });
    } else if (!hasActiveBoard) {
      const aiMode = document.getElementById("mode-offline-ai") || document.getElementById("mode-ai");
      if (aiMode) aiMode.click();
      // A first visit starts at the lowest offered computer level.
      document.querySelectorAll("select").forEach((select) => {
        const selectName = (select.id || "") + " " + (select.name || "");
        if (/opponent/i.test(selectName)) {
          const easyOpponent = Array.from(select.options).find((option) => /easy|easiest|beginner/i.test(option.value + " " + option.textContent));
          if (easyOpponent) { select.value = easyOpponent.value; return; }
        }
        if (!/level|difficulty/i.test(selectName)) return;
        const numeric = Array.from(select.options).filter((option) => /^\d+$/.test(option.value) && Number(option.value) > 0);
        if (numeric.length) select.value = numeric.sort((a, b) => Number(a.value) - Number(b.value))[0].value;
        else {
          const easy = Array.from(select.options).find((option) => /easy|easiest|beginner/i.test(option.value + " " + option.textContent));
          if (easy) select.value = easy.value;
        }
      });
    }

    function rememberSettings(modeButton) {
      const fields = Array.from(document.querySelectorAll("#settings-panel select, #settings-panel input[type=checkbox], #settings-panel input[type=radio]"))
        .filter((el) => el.id || el.name)
        .map((el) => ({ id: el.id || "", selector: el.id ? "" : 'input[name="' + el.name.replace(/"/g, '\\"') + '"][value="' + el.value.replace(/"/g, '\\"') + '"]', value: el.value, checked: el.checked }));
      const activeMode = document.querySelector("#settings-panel .mode-btn.active-mode, #settings-panel .mode-btn.active");
      try { localStorage.setItem(settingsKey, JSON.stringify({ fields, modeId: modeButton ? modeButton.id : (activeMode ? activeMode.id : "") })); } catch (e) {}
    }
    document.addEventListener("click", (event) => {
      if (event.target.closest) {
        const button = event.target.closest('button[id^="start-"], button.mode-btn');
        if (button) rememberSettings(button.matches(".mode-btn") ? button : null);
      }
    }, true);

    if (start) {
      const actions = document.getElementById("board-actions") || document.createElement("div");
      if (!actions.id) { actions.id = "board-actions"; actions.className = "board-actions"; boardSection.appendChild(actions); }
      if (!document.getElementById("direct-new-game-button")) {
        const again = document.createElement("button");
        again.type = "button";
        again.id = "direct-new-game-button";
        again.className = "secondary small direct-new-game-button";
        again.setAttribute("data-i18n", "new_game");
        again.textContent = window.I18n ? I18n.t("new_game") : "New game";
        again.addEventListener("click", () => start.click());
        actions.insertBefore(again, actions.firstChild);
      }
      if (board && board.classList.contains("hidden")) {
        // App scripts restore saved games before DOMContentLoaded. A visible
        // board therefore means the saved state won and must be preserved.
        start.click();
      }
      return;
    }

    // Keep a clear, large entry point in the middle of any game-specific
    // placeholder whose app has no discoverable start control.
    if (!placeholder.querySelector(".placeholder-play-button")) {
      placeholder.classList.add("has-play-button");
      const play = document.createElement("button");
      play.type = "button";
      play.className = "primary placeholder-play-button";
      play.setAttribute("data-i18n", "play_button");
      play.textContent = window.I18n ? I18n.t("play_button") : "Play";
      placeholder.appendChild(play);
    }
  }

  function findStartButton() {
    return document.querySelector('button[id^="start-"][id$="-game"], button[id^="start-"][id$="-puzzle"], button[id^="start-"][id$="-level"], #start-ai-game');
  }

  window.PaperGamesQuickRules = {
    setSentences: updateSentences
  };

  document.addEventListener("DOMContentLoaded", init);
})();
