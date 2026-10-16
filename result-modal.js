// result-modal.js
// Shared end-of-game popup for every game: a centered, dismissible
// overlay announcing the result, built once and reused so no game needs
// its own copy of this markup/CSS.

const ResultModal = (function () {
  // Every game's own result title (see e.g. marblepush-app.js's
  // resultTitleMarblePush, or the various fixed puzzle-win/-lose titles in
  // i18n.js) is one of a small, consistent set of English phrasings -
  // this reads that title text to decide whether a small celebratory
  // mark belongs on the popup, rather than adding an outcome parameter
  // every one of those call sites (46 games' worth) would need to pass.
  function classifyOutcome(title) {
    const t = (title || "").toLowerCase();
    if (t.indexOf("you lose") !== -1 || t.indexOf("the computer wins") !== -1 ||
        t.indexOf("boom") !== -1 || t.indexOf("defeat") !== -1 || t.indexOf("no moves left") !== -1) {
      return "loss";
    }
    if (t.indexOf("draw") !== -1) return "draw";
    if (t.indexOf("win") !== -1 || t.indexOf("solved") !== -1 || t.indexOf("cleared") !== -1 ||
        t.indexOf("victory") !== -1 || t.indexOf("well done") !== -1 || t.indexOf("2048") !== -1) {
      return "win";
    }
    return "neutral";
  }

  function ensureModal() {
    let overlay = document.getElementById("result-modal-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "result-modal-overlay";
    overlay.className = "result-modal-overlay hidden";
    overlay.innerHTML =
      '<div class="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">' +
        '<div class="result-modal-ornament" aria-hidden="true">&#9733;</div>' +
        '<div id="result-modal-title" class="result-modal-title"></div>' +
        '<div id="result-modal-message" class="result-modal-message"></div>' +
        '<div class="result-modal-actions">' +
          '<button type="button" class="primary result-modal-replay" data-i18n="result_modal_replay">Play again</button>' +
          '<button type="button" class="secondary result-modal-close" data-i18n="result_modal_close">Close</button>' +
        '</div>' +
      "</div>";
    document.body.appendChild(overlay);
    const okBtn = overlay.querySelector(".result-modal-close");
    const replayBtn = overlay.querySelector(".result-modal-replay");
    if (window.I18n) {
      okBtn.textContent = I18n.t("result_modal_close");
      replayBtn.textContent = I18n.t("result_modal_replay");
    }

    overlay.querySelector(".result-modal-close").addEventListener("click", hide);
    replayBtn.addEventListener("click", () => {
      const callback = overlay.__replayCallback || findNewGameAction();
      hide();
      if (typeof callback === "function") callback();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hide();
    });

    return overlay;
  }

  function findNewGameAction() {
    // Adventure Book keeps the completed hero so a replay can begin again
    // with the same character and difficulty in one tap.
    const sameHero = document.getElementById("ab-same");
    if (sameHero) return () => sameHero.click();
    const start = document.querySelector('button[id^="start-"][id$="-game"], button[id^="start-"][id$="-puzzle"], button[id^="start-"][id$="-level"]');
    if (start) return () => start.click();
    const appStart = document.getElementById("start-ai-game") || document.getElementById("new-game-button");
    if (appStart) return () => appStart.click();
    return null;
  }

  function show(title, message, onReplay) {
    const overlay = ensureModal();
    overlay.__replayCallback = typeof onReplay === "function" ? onReplay : findNewGameAction();
    const replay = overlay.querySelector(".result-modal-replay");
    replay.disabled = !overlay.__replayCallback;
    replay.classList.toggle("hidden", !overlay.__replayCallback);
    const titleEl = overlay.querySelector("#result-modal-title");
    const messageEl = overlay.querySelector("#result-modal-message");
    // classifyOutcome reads the English wording, so the outcome is decided
    // before I18n.msg translates the texts for display.
    if (window.I18n && I18n.setMsg) {
      I18n.setMsg(titleEl, title || "");
      I18n.setMsg(messageEl, message || "");
    } else {
      titleEl.textContent = title || "";
      messageEl.textContent = message || "";
    }
    const result = document.getElementById("game-result");
    const status = document.getElementById("board-info");
    if (result && status && result.textContent && result.textContent === status.textContent) {
      if (window.I18n && I18n.setMsg) I18n.setMsg(status, "");
      else status.textContent = "";
    }
    const modal = overlay.querySelector(".result-modal");
    const englishTitle = window.I18n && I18n.sourceText ? I18n.sourceText(title || "") : title;
    modal.className = "result-modal result-modal-" + classifyOutcome(englishTitle);
    overlay.classList.remove("hidden");
  }

  function hide() {
    const overlay = document.getElementById("result-modal-overlay");
    if (overlay) overlay.classList.add("hidden");
  }

  return { show, hide };
})();

if (typeof window !== "undefined") {
  window.ResultModal = ResultModal;
}
