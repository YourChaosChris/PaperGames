// Optional enlarged board view for games whose smallest cells need more room.
(function () {
  "use strict";

  const button = document.querySelector("[data-big-board]");
  if (!button) return;
  const slug = button.getAttribute("data-big-board");
  const storageKey = "papergames_big_board_" + slug;
  const container = document.getElementById("board-container");
  if (!container) return;

  // The switch sits next to "New game" below the board; the settings panel
  // it is written into closes after the game has started.
  const actions = document.getElementById("board-actions");
  if (actions) actions.appendChild(button);

  let enabled = false;
  try { enabled = localStorage.getItem(storageKey) === "1"; } catch (_) {}

  function updateButton() {
    if (typeof I18n !== "undefined" && I18n.setKey) {
      I18n.setKey(button, enabled ? "big_board_off" : "big_board_on");
    }
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  function setEnabled(value) {
    enabled = !!value;
    container.classList.toggle("big-board-enabled", enabled);
    try { localStorage.setItem(storageKey, enabled ? "1" : "0"); } catch (_) {}
    updateButton();
    if (typeof window !== "undefined" && window.dispatchEvent) {
      let resizeEvent;
      if (typeof Event === "function") resizeEvent = new Event("resize");
      else if (document.createEvent) {
        resizeEvent = document.createEvent("Event");
        resizeEvent.initEvent("resize", true, true);
      }
      if (resizeEvent) window.dispatchEvent(resizeEvent);
    }
  }

  button.addEventListener("click", function () { setEnabled(!enabled); });
  setEnabled(enabled);
  if (typeof I18n !== "undefined" && I18n.onChange) I18n.onChange(updateButton);
})();
