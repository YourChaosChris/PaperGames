// move-hint.js - Hint button for the strategy games against the computer
// (task 197). A game gives the module its state object, the board element
// and two small functions: move() asks the computer player (level 3) for
// the move it would make for the side to move, marks(move) turns that move
// into CSS selectors inside the board. The marked cells stay marked until
// the position changes (a move was made or undone), also when the game
// builds the board elements again. Nothing is marked before the button is
// pressed, so the player can think first.
const MoveHint = (function () {
  "use strict";
  // The move behind the latest marks, for tests (tests/move-hint-legal.js).
  let lastMove = null;

  function init(cfg) {
    const btn = document.getElementById(cfg.button);
    const board = document.getElementById(cfg.board);
    if (!btn || !board) return;
    const app = cfg.app;
    let shown = null; // { key, selectors }

    const positionKey = () => {
      try { return JSON.stringify([app.state || app.board || null, app.turn]); } catch (e) { return String(Math.random()); }
    };
    const clear = () => board.querySelectorAll(".mh-mark").forEach((el) => el.classList.remove("mh-mark"));
    const apply = () => {
      if (!shown) return;
      shown.selectors.forEach((s) => { const el = board.querySelector(s); if (el && !el.classList.contains("mh-mark")) el.classList.add("mh-mark"); });
    };
    const canHint = () => board.children.length > 0 && board.offsetParent !== null && !app.gameOver &&
      !(typeof UiStatus !== "undefined" && UiStatus.computerToMove(app)) && (cfg.canHint ? cfg.canHint() : true);

    function refresh() {
      if (shown && shown.key !== positionKey()) { clear(); shown = null; }
      apply();
      btn.disabled = !canHint();
    }

    btn.addEventListener("click", () => {
      if (!canHint()) return;
      clear();
      let m = null;
      try { m = cfg.move(); } catch (e) { m = null; }
      lastMove = { button: cfg.button, move: m === undefined ? null : m, key: positionKey(), n: lastMove ? lastMove.n + 1 : 1 };
      if (m === null || m === undefined) { shown = null; return; }
      shown = { key: positionKey(), selectors: cfg.marks(m) };
      lastMove.board = cfg.board;
      lastMove.selectors = shown.selectors;
      apply();
    });
    board.addEventListener("click", () => window.setTimeout(refresh, 0));
    window.setInterval(refresh, 300);
    refresh();
  }

  return { init: init, last: () => lastMove };
})();

if (typeof window !== "undefined") window.MoveHint = MoveHint;
