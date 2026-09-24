// adaptive-difficulty.js
// Opt-in suggestion for the AI difficulty dropdown on every "vs computer"
// game: after a 3-game win streak, nudge the selection one level up;
// after 3 losses in a row, one level down - reusing the streak
// game-stats.js already tracks, nothing new to compute. Off by default,
// one shared setting for the whole app (like font-size-toggle.js), and
// applied only as a visible change to the dropdown's own selected value
// (plus a small note explaining why) - never a silent adjustment behind
// the scenes, and never overriding a level the player only just now
// picked themselves, since it's applied once at load/toggle-on rather
// than on every interaction.
//
// Found generically via #offline-ai-controls (present on every game with
// a built-in AI opponent, and only those - the puzzle games' own
// difficulty pickers, which govern generation rather than an opponent's
// strength, live in a differently-named container) and the level
// select's id, which always ends in "-level-inline" and - stripped of
// that suffix - matches the game's own slug in game-stats.js (chess is
// the one legacy exception, "ai-level-inline").

const AdaptiveDifficulty = (function () {
  const KEY = "einkchess_adaptive_difficulty";
  const STREAK_THRESHOLD = 3;

  function isEnabled() {
    try {
      return !!(window.localStorage && window.localStorage.getItem(KEY) === "1");
    } catch (e) {
      return false;
    }
  }

  function setEnabled(enabled) {
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, enabled ? "1" : "0");
    } catch (e) { /* storage unavailable - just don't persist */ }
  }

  function slugForSelect(select) {
    if (select.id === "ai-level-inline") return "chess";
    return select.id.replace(/-level-inline$/, "");
  }

  function removeNote() {
    const note = document.getElementById("adaptive-difficulty-note");
    if (note) note.remove();
  }

  function applySuggestion(select) {
    if (typeof GameStats === "undefined") return;
    const slug = slugForSelect(select);
    if (GameStats.GAMES.indexOf(slug) === -1) return;

    const levels = Array.prototype.map
      .call(select.options, (o) => parseInt(o.value, 10))
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    if (levels.length < 2) return;

    const current = parseInt(select.value, 10);
    if (!current || current <= 0) return; // 2-player local mode - no AI level to adjust

    const rec = GameStats.getAll()[slug];
    const streak = rec ? rec.streak : 0;
    const at = levels.indexOf(current);
    let suggested = current;
    if (streak >= STREAK_THRESHOLD && at < levels.length - 1) {
      suggested = levels[at + 1];
    } else if (streak <= -STREAK_THRESHOLD && at > 0) {
      suggested = levels[at - 1];
    }

    if (suggested === current) {
      removeNote();
      return;
    }

    select.value = String(suggested);
    let note = document.getElementById("adaptive-difficulty-note");
    if (!note) {
      note = document.createElement("span");
      note.id = "adaptive-difficulty-note";
      note.className = "adaptive-difficulty-note";
      const row = document.getElementById("adaptive-difficulty-toggle");
      if (row) row.appendChild(note);
    }
    note.textContent = (window.I18n && typeof I18n.t === "function")
      ? I18n.t("adaptive_difficulty_note")
      : "\u{1F3AF} Difficulty adjusted based on your recent results.";
  }

  // Its own row below the select's own field-row rather than squeezed
  // in next to it - that row (New game button, color choice, the level
  // select's often-long option text) is already tight on a narrow
  // e-reader screen, and .field-row doesn't wrap.
  function injectToggle(select) {
    if (document.getElementById("adaptive-difficulty-toggle")) return;

    const existingRow = select.closest(".field-row");
    const insertAfter = existingRow || select;

    const row = document.createElement("div");
    row.id = "adaptive-difficulty-toggle";
    row.className = "field-row adaptive-difficulty-row";

    const label = document.createElement("label");
    label.className = "adaptive-difficulty-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isEnabled();

    const text = document.createElement("span");
    function setLabelText() {
      text.textContent = (window.I18n && typeof I18n.t === "function")
        ? I18n.t("adaptive_difficulty_toggle")
        : "\u{1F3AF} Suggest difficulty";
    }
    setLabelText();

    checkbox.addEventListener("change", () => {
      setEnabled(checkbox.checked);
      if (checkbox.checked) applySuggestion(select);
      else removeNote();
    });

    label.appendChild(checkbox);
    label.appendChild(text);
    row.appendChild(label);
    insertAfter.insertAdjacentElement("afterend", row);

    if (window.I18n && typeof I18n.onChange === "function") {
      I18n.onChange(setLabelText);
    }
  }

  // Every game's own "vs Computer" button resets this select back to its
  // own remembered AI level the moment its (initially hidden) panel is
  // revealed, which would otherwise immediately overwrite anything
  // applied here at page load. Reacting to that reveal - rather than to
  // the reset itself - re-applies the suggestion right after, regardless
  // of which button or code path did the revealing.
  function watchForReveal(container, select) {
    const observer = new MutationObserver(() => {
      if (isEnabled() && !container.classList.contains("hidden")) {
        applySuggestion(select);
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ["class"] });
  }

  function init() {
    const container = document.getElementById("offline-ai-controls");
    if (!container) return;
    const select = container.querySelector('select[id$="-level-inline"]');
    if (!select) return;
    injectToggle(select);
    if (isEnabled()) applySuggestion(select);
    watchForReveal(container, select);
  }

  document.addEventListener("DOMContentLoaded", init);

  return { isEnabled, setEnabled };
})();

if (typeof window !== "undefined") {
  window.AdaptiveDifficulty = AdaptiveDifficulty;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AdaptiveDifficulty;
}
