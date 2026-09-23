// confirm-actions.js
// Shared, zero-per-game-wiring confirmation guard for the two actions
// that can silently throw away a game in progress: resigning, and
// starting a new game over one that's still running. This works from a
// single document-level, capture-phase click listener instead of
// touching every game's own click handler, so a 47th game needs no
// changes here - just the same <script> include every other game
// already has.
//
// "Is a game currently in progress" is read off #resign-button's own
// visibility: every two-player/vs-AI game already shows that button
// only while a game is live and hides it once it's over (see e.g.
// abalone-app.js's `resignBtn.classList.toggle("hidden", ...gameOver)`),
// so it's already exactly the signal this needs - no new per-game state
// to track. Games without a #resign-button (the solitaire/puzzle games)
// are unaffected: isGameInProgress() then always reads false, so their
// "New game" button behaves exactly as before.
//
// A capture-phase listener on `document` always runs before any
// listener bound directly to the button (registration order only
// decides ordering among listeners on the very same element - it does
// not let a bubble-phase target listener run before a capturing
// ancestor listener), so calling stopPropagation() here reliably stops
// the game's own click handler from running at all when the player
// cancels.
(function () {
  function isGameInProgress() {
    const btn = document.getElementById("resign-button");
    if (!btn) return false;
    return !btn.classList.contains("hidden") && btn.offsetParent !== null;
  }

  document.addEventListener("click", function (e) {
    const target = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!target || !target.id) return;

    if (target.id === "resign-button") {
      if (!window.confirm("Resign this game?")) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    // Two ways a click can silently start a fresh game over a running one:
    // the configured vs-AI/vs-human "New game" buttons (id^="start-"), and
    // "Offline" mode's button, which - unlike "Offline (vs Computer)" -
    // starts a 2-player game immediately on click rather than revealing a
    // setup form first (see e.g. abalone-app.js's modeOffline handler).
    const startsGameNow = (target.id.indexOf("start-") === 0 && target.id !== "start-seek-button") || target.id === "mode-offline";
    if (startsGameNow && isGameInProgress()) {
      if (!window.confirm("Start a new game? Your current game will be lost.")) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, true);
})();
