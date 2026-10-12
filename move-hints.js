// move-hints.js
// Shared setting "Show move suggestions": whether games mark on their own
// which cards, tiles or pieces can be played now (playable cards raised,
// unplayable ones dashed, the places a tile fits, the pieces that can
// move). Off means nothing is marked in advance; a move that is not
// allowed is still refused with a short line, and a Hint button, where a
// game has one, still shows a move on request.
//
// Default: off, except in children's versions (the game says so with
// setPageDefault(true), e.g. Mau Mau with the animal cards). The choice in
// the Settings menu is stored in localStorage and counts for every game.
// Games re-draw through onChange() when it is switched.

const MoveHints = (function () {
  const KEY = "papergames_move_hints";
  let pageDefault = false;
  let chosen = null;   // the choice made on this page, if storage fails
  const listeners = [];

  function stored() {
    try {
      const v = window.localStorage ? window.localStorage.getItem(KEY) : null;
      if (v === "on" || v === "off") return v === "on";
    } catch (e) { /* storage not available */ }
    return chosen;
  }

  function enabled() {
    const v = stored();
    return v === null ? pageDefault : v;
  }

  function setEnabled(flag) {
    chosen = !!flag;
    try {
      if (window.localStorage) window.localStorage.setItem(KEY, flag ? "on" : "off");
    } catch (e) { /* storage not available - the choice lasts for this page only */ }
    listeners.forEach((fn) => { try { fn(enabled()); } catch (e) { /* a game's redraw failed */ } });
  }

  // A children's version shows suggestions unless the player chose
  // otherwise.
  function setPageDefault(flag) {
    pageDefault = !!flag;
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  return { enabled: enabled, setEnabled: setEnabled, setPageDefault: setPageDefault, onChange: onChange, KEY: KEY };
})();

if (typeof window !== "undefined") window.MoveHints = MoveHints;
