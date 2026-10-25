// hanoi-app.js
// Wires HanoiCore (Tower of Hanoi) to hanoi.html.
//
// Three rods side by side, each a tall button; the discs are black bars of
// different widths with their number. Tap a rod to pick up its top disc
// (the rod gets a thick frame), then tap the rod to put it on. A move that
// would put a bigger disc on a smaller one is refused with a short note and
// nothing moves. Move counter and the fewest moves (2^n - 1); "Undo" takes
// moves back; the hint marks the next move of a shortest way from the
// current position (from rod and to rod). No timer, nothing animated.

const HANOI_SAVE_KEY = "einkchess_save_hanoi";

const AppStateHanoi = {
  state: null,
  from: -1,          // the rod picked up (-1: none)
  hint: null,        // [from, to] marked by the hint
  hints: 0,
  undoStack: []      // states before each move (the core's own history is kept as well)
};

function tHanoi(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function rodNameHanoi(i) {
  return tHanoi("hanoi_rod_label", { n: i + 1 });
}

function saveHanoi() {
  if (typeof GameStorage === "undefined" || !AppStateHanoi.state) return;
  if (AppStateHanoi.state.solved) { GameStorage.clear(HANOI_SAVE_KEY); return; }
  GameStorage.save(HANOI_SAVE_KEY, { state: AppStateHanoi.state, hints: AppStateHanoi.hints, undoStack: AppStateHanoi.undoStack.slice(-50) });
}

function validStateHanoi(s) {
  if (!s || !(s.n >= 3 && s.n <= 8) || !Array.isArray(s.pegs) || s.pegs.length !== 3 || s.solved) return false;
  const all = [].concat(s.pegs[0], s.pegs[1], s.pegs[2]).sort((a, b) => a - b);
  return all.length === s.n && all.every((d, i) => d === i + 1) && s.pegs.every((p) => p.every((d, i) => i === 0 || p[i - 1] > d));
}

function startHanoi() {
  const n = parseInt(document.getElementById("hanoi-discs").value, 10) || 4;
  AppStateHanoi.state = HanoiCore.newGame(n);
  AppStateHanoi.from = -1;
  AppStateHanoi.hint = null;
  AppStateHanoi.hints = 0;
  AppStateHanoi.undoStack = [];
  setResultHanoi("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardHanoi();
  renderHanoi();
  saveHanoi();
}

function showBoardHanoi() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
}

function setStatusHanoi(text) {
  const el = document.getElementById("board-info");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function setResultHanoi(text) {
  const el = document.getElementById("game-result");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function tapRodHanoi(i) {
  const s = AppStateHanoi.state;
  if (!s || s.solved) return;
  if (AppStateHanoi.from < 0) {
    if (!s.pegs[i].length) { setStatusHanoi(tHanoi("hanoi_empty_rod")); return; }
    AppStateHanoi.from = i;
    renderHanoi();
    setStatusHanoi(tHanoi("hanoi_pick_target", { n: s.pegs[i][s.pegs[i].length - 1] }));
    return;
  }
  const from = AppStateHanoi.from;
  AppStateHanoi.from = -1;
  if (from === i) { renderHanoi(); return; }
  const check = HanoiCore.canMove(s, from, i);
  if (!check.ok) {
    renderHanoi();
    setStatusHanoi(tHanoi(check.reason === "bigger" ? "hanoi_bigger" : "hanoi_empty_rod"));
    return;
  }
  AppStateHanoi.undoStack.push(JSON.parse(JSON.stringify(s)));
  AppStateHanoi.state = HanoiCore.move(s, from, i);
  AppStateHanoi.hint = null;
  if (AppStateHanoi.state.solved) finishHanoi();
  renderHanoi();
  saveHanoi();
}

// Takes back the last move. There is no computer here, so one step is one
// move; the loop only skips snapshots that equal the current position.
function undoHanoi() {
  if (!AppStateHanoi.undoStack.length) return;
  let prev = AppStateHanoi.undoStack.pop();
  while (AppStateHanoi.undoStack.length && JSON.stringify(prev.pegs) === JSON.stringify(AppStateHanoi.state.pegs)) prev = AppStateHanoi.undoStack.pop();
  AppStateHanoi.state = prev;
  AppStateHanoi.from = -1;
  AppStateHanoi.hint = null;
  setResultHanoi("");
  if (window.ResultModal) window.ResultModal.hide();
  renderHanoi();
  saveHanoi();
}

function hintHanoi() {
  const s = AppStateHanoi.state;
  if (!s || s.solved) return;
  AppStateHanoi.hint = HanoiCore.nextMove(s);
  AppStateHanoi.from = -1;
  AppStateHanoi.hints++;
  renderHanoi();
  if (AppStateHanoi.hint) setStatusHanoi(tHanoi("hanoi_hint_text", { a: AppStateHanoi.hint[0] + 1, b: AppStateHanoi.hint[1] + 1 }));
  saveHanoi();
}

function finishHanoi() {
  const s = AppStateHanoi.state;
  const min = HanoiCore.minMoves(s.n);
  const text = tHanoi("hanoi_solved", { n: s.moves }) + " " + (s.moves === min ? tHanoi("hanoi_solved_best", { m: min }) : tHanoi("hanoi_solved_more", { m: min }));
  setResultHanoi(text);
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("hanoi", "win", { hinted: AppStateHanoi.hints > 0 });
}

function renderHanoi() {
  const s = AppStateHanoi.state;
  if (!s) return;
  const wrap = document.getElementById("hanoi-rods");
  wrap.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const b = document.createElement("button");
    b.type = "button";
    const hinted = AppStateHanoi.hint && (AppStateHanoi.hint[0] === i || AppStateHanoi.hint[1] === i);
    b.className = "hanoi-rod" + (AppStateHanoi.from === i ? " hanoi-rod-picked" : "") + (hinted ? " hanoi-rod-hint" : "") + (i === 2 ? " hanoi-rod-goal" : "");
    let html = '<span class="hanoi-pole" aria-hidden="true"></span><span class="hanoi-stack">';
    // top disc first in the markup; the stack is drawn from the bottom up
    for (let k = s.pegs[i].length - 1; k >= 0; k--) {
      const d = s.pegs[i][k];
      const lifted = AppStateHanoi.from === i && k === s.pegs[i].length - 1;
      html += '<span class="hanoi-disc' + (lifted ? " hanoi-disc-lifted" : "") + '" style="width:' + (28 + 72 * d / s.n).toFixed(1) + '%">' + d + "</span>";
    }
    html += '</span><span class="hanoi-rod-name">' + rodNameHanoi(i) + (i === 2 ? " ★" : "") + "</span>";
    b.innerHTML = html;
    const discs = s.pegs[i].length ? s.pegs[i].slice().reverse().join(", ") : tHanoi("hanoi_rod_empty_aria");
    b.setAttribute("aria-label", rodNameHanoi(i) + ": " + discs + (AppStateHanoi.from === i ? ", " + tHanoi("hanoi_picked_aria") : ""));
    b.addEventListener("click", () => tapRodHanoi(i));
    wrap.appendChild(b);
  }
  document.getElementById("game-meta").textContent = tHanoi("hanoi_moves", { n: s.moves, m: HanoiCore.minMoves(s.n) });
  const undo = document.getElementById("undo-btn");
  if (undo) undo.disabled = !AppStateHanoi.undoStack.length;
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.disabled = s.solved;
  if (!s.solved && AppStateHanoi.from < 0 && !AppStateHanoi.hint) setStatusHanoi(tHanoi("hanoi_goal_status"));
}

function initHanoiApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-hanoi-game").addEventListener("click", startHanoi);
  document.getElementById("undo-btn").addEventListener("click", undoHanoi);
  document.getElementById("hint-btn").addEventListener("click", hintHanoi);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateHanoi.state) renderHanoi(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(HANOI_SAVE_KEY) : null;
  if (saved && validStateHanoi(saved.state)) {
    AppStateHanoi.state = saved.state;
    AppStateHanoi.hints = saved.hints || 0;
    AppStateHanoi.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    document.getElementById("hanoi-discs").value = String(saved.state.n);
    showBoardHanoi();
    renderHanoi();
  }
}

document.addEventListener("DOMContentLoaded", initHanoiApp);
