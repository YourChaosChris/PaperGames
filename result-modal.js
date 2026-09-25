// result-modal.js
// Shared end-of-game popup for every game: a centered, dismissible
// overlay announcing the result, built once and reused so no game needs
// its own copy of this markup/CSS.

const ResultModal = (function () {
  // Every game's own result title (see e.g. abalone-app.js's
  // resultTitleAbalone, or the various fixed puzzle-win/-lose titles in
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
        '<button type="button" class="primary result-modal-close">OK</button>' +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".result-modal-close").addEventListener("click", hide);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hide();
    });

    return overlay;
  }

  function show(title, message) {
    const overlay = ensureModal();
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
