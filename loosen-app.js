// loosen-app.js
// Wires LoosenCore ("Loosen the Rings", Ringe lösen) to loosen.html.
//
// The rings are drawn flat from above, black on white: each one a thick
// circle with a gap and its number in the middle; where two rings cross,
// the ring on top is drawn over a white edge, so the weave shows which one
// lies on top.
// Tap a ring: a free ring comes out, any other turns a quarter clockwise
// (its hooked rings turn the other way) and stays chosen; the two turn
// buttons turn the chosen ring either way. One new drawing per move, no
// movement in between. Undo, Hint (the first move of a shortest way) and
// the fewest moves shown. No time limit.

const LR_SAVE_KEY = "einkchess_save_loosen";
const LR_R = 40;                      // ring radius in drawing units
const LR_S = LR_R * Math.SQRT2;       // distance between hooked rings
const LR_GAP = 28;                    // half the gap, in degrees
const LR_UNDER = 13;                  // half the piece drawn again on top at a crossing
// Gap positions as angles on screen (degrees, clockwise from the right).
const LR_ANGLE = [-45, 45, 135, 225];

const AppStateLr = {
  puzzle: null,
  state: null,     // { present, gaps }
  history: [],     // earlier states
  moves: 0,
  sel: -1,
  hint: null,
  hinted: false,
  gameOver: false
};

function tLr(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusLr(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveLrGame() {
  if (typeof GameStorage === "undefined" || !AppStateLr.puzzle) return;
  GameStorage.save(LR_SAVE_KEY, { puzzle: AppStateLr.puzzle, state: AppStateLr.state, history: AppStateLr.history, moves: AppStateLr.moves, hinted: AppStateLr.hinted });
}

function clearSavedLrGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(LR_SAVE_KEY);
}

function initLrApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("lr-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-lr-game").addEventListener("click", () => startNewLrGame(levelSel.value));
  document.getElementById("lr-left").addEventListener("click", () => turnLr(-1));
  document.getElementById("lr-right").addEventListener("click", () => turnLr(1));
  document.getElementById("lr-undo").addEventListener("click", undoLr);
  document.getElementById("lr-hint").addEventListener("click", hintLr);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateLr.puzzle) renderLr(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(LR_SAVE_KEY) : null;
  if (saved && saved.puzzle && Array.isArray(saved.puzzle.cells) && saved.state && Array.isArray(saved.state.gaps) && saved.state.gaps.length === saved.puzzle.cells.length) {
    AppStateLr.puzzle = saved.puzzle;
    AppStateLr.state = saved.state;
    AppStateLr.history = saved.history || [];
    AppStateLr.moves = saved.moves || 0;
    AppStateLr.hinted = !!saved.hinted;
    AppStateLr.gameOver = false;
    levelSel.value = saved.puzzle.level;
    showBoardLr();
    setStatusLr("Tap a ring to turn it a quarter clockwise; a free ring comes out.");
  }
}

function showBoardLr() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderLr();
}

function startNewLrGame(level) {
  const p = LoosenCore.generatePuzzle(level);
  AppStateLr.puzzle = p;
  AppStateLr.state = LoosenCore.startState(p);
  AppStateLr.history = [];
  AppStateLr.moves = 0;
  AppStateLr.sel = -1;
  AppStateLr.hint = null;
  AppStateLr.hinted = false;
  AppStateLr.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardLr();
  setStatusLr("Tap a ring to turn it a quarter clockwise; a free ring comes out.");
  saveLrGame();
}

function onRingLr(i) {
  const p = AppStateLr.puzzle, s = AppStateLr.state;
  if (!p || AppStateLr.gameOver || !s.present[i]) return;
  AppStateLr.hint = null;
  if (LoosenCore.isFree(p, s, i)) {
    doMoveLr(LoosenCore.remove(s, i));
    AppStateLr.sel = -1;
    if (LoosenCore.solved(AppStateLr.state)) { winLr(); return; }
    setStatusLr("Ring " + (i + 1) + " is free and comes out.");
  } else {
    AppStateLr.sel = i;
    doMoveLr(LoosenCore.turn(p, s, i, 1));
    setStatusLr("Ring " + (i + 1) + " turned; the rings hooked into it turned the other way.");
  }
  renderLr();
  saveLrGame();
}

function turnLr(dir) {
  const p = AppStateLr.puzzle, s = AppStateLr.state;
  if (!p || AppStateLr.gameOver) return;
  const i = AppStateLr.sel;
  if (i < 0 || !s.present[i]) {
    setStatusLr("Tap a ring first.");
    return;
  }
  AppStateLr.hint = null;
  doMoveLr(LoosenCore.turn(p, s, i, dir));
  setStatusLr("Ring " + (i + 1) + " turned; the rings hooked into it turned the other way.");
  renderLr();
  saveLrGame();
}

function doMoveLr(next) {
  AppStateLr.history.push(AppStateLr.state);
  AppStateLr.state = next;
  AppStateLr.moves++;
}

function undoLr() {
  if (!AppStateLr.puzzle || AppStateLr.gameOver) return;
  if (!AppStateLr.history.length) {
    setStatusLr("Nothing to undo.");
    return;
  }
  AppStateLr.state = AppStateLr.history.pop();
  AppStateLr.moves++;
  AppStateLr.hint = null;
  if (AppStateLr.sel >= 0 && !AppStateLr.state.present[AppStateLr.sel]) AppStateLr.sel = -1;
  setStatusLr("Undone.");
  renderLr();
  saveLrGame();
}

function hintLr() {
  const p = AppStateLr.puzzle;
  if (!p || AppStateLr.gameOver) return;
  const r = LoosenCore.solve(p, AppStateLr.state);
  if (!r || !r.move) return;
  AppStateLr.hinted = true;
  AppStateLr.hint = r.move;
  AppStateLr.sel = r.move.ring;
  if (r.move.type === "out") setStatusLr("Hint: the marked ring is free - tap it.");
  else if (r.move.dir === 1) setStatusLr("Hint: turn the marked ring clockwise.");
  else setStatusLr("Hint: turn the marked ring anticlockwise.");
  renderLr();
  saveLrGame();
}

function winLr() {
  AppStateLr.gameOver = true;
  AppStateLr.hint = null;
  AppStateLr.sel = -1;
  const text = "All rings are loose - solved in " + AppStateLr.moves + " moves!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusLr(text);
  if (typeof GameStats !== "undefined") GameStats.record("loosen", "win", { hinted: AppStateLr.hinted });
  if (window.ResultModal) window.ResultModal.show(tLr("lr_win_title"), I18n.msg(text));
  clearSavedLrGame();
  renderLr();
}

/*** Drawing ***/

// An arc of ring centred (cx, cy) from angle a to b (degrees, a < b).
function arcLr(cx, cy, r, a, b) {
  const rad = (d) => d * Math.PI / 180;
  const x1 = cx + r * Math.cos(rad(a)), y1 = cy + r * Math.sin(rad(a));
  const x2 = cx + r * Math.cos(rad(b)), y2 = cy + r * Math.sin(rad(b));
  return "M" + x1.toFixed(1) + " " + y1.toFixed(1) + "A" + r + " " + r + " 0 " + (b - a > 180 ? 1 : 0) + " 1 " + x2.toFixed(1) + " " + y2.toFixed(1);
}

// The whole picture as SVG elements (also used for the rules example).
// Rings first, each without its gap; then at every crossing the ring on
// top is drawn again over a white edge, so the ring underneath shows a
// clear break there. opts: { sel, hint } ring numbers to mark.
function boardSvgLr(p, s, opts) {
  opts = opts || {};
  const pad = LR_R + 12;
  const pos = p.cells.map(([x, y]) => [pad + x * LR_S, pad + y * LR_S]);
  const L = LoosenCore.links(p);
  let rings = "", over = "", marks = "";
  const stroke = 'fill="none" stroke="#141413" stroke-width="7" stroke-linecap="round"';
  p.cells.forEach((c, i) => {
    if (!s.present[i]) return;
    const [cx, cy] = pos[i];
    const g = LR_ANGLE[s.gaps[i]];
    rings += '<path d="' + arcLr(cx, cy, LR_R, g + LR_GAP, g + 360 - LR_GAP) + '" ' + stroke + "/>";
    // On top at the crossing where the neighbour lies underneath: that is
    // the neighbour's own "underneath" position, seen from this ring the
    // second crossing (CROSS_BOTH[...][1]).
    L[i].forEach(([j]) => {
      if (!s.present[j]) return;
      const key = (p.cells[j][0] - c[0]) + "," + (p.cells[j][1] - c[1]);
      const top = LR_ANGLE[LoosenCore.CROSS_BOTH[key][1]];
      // Not where this ring has its gap.
      const diff = Math.abs((((top - g) % 360) + 540) % 360 - 180);
      if (diff < LR_GAP + LR_UNDER) return;
      const d = arcLr(cx, cy, LR_R, top - LR_UNDER, top + LR_UNDER);
      over += '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="22"/><path d="' + d + '" fill="none" stroke="#141413" stroke-width="7"/>';
    });
    const mark = opts.hint === i ? "lr-hint" : opts.sel === i ? "lr-sel" : "";
    if (mark) marks += '<circle class="' + mark + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (LR_R * 0.5).toFixed(1) + '"/>';
    marks += '<text class="lr-num" x="' + cx.toFixed(1) + '" y="' + (cy + 7).toFixed(1) + '" text-anchor="middle">' + (i + 1) + "</text>";
  });
  const w = 2 * pad + Math.max(...p.cells.map((c) => c[0])) * LR_S, h = 2 * pad + Math.max(...p.cells.map((c) => c[1])) * LR_S;
  return { svg: rings + over + marks, w, h, pos };
}

function renderLr() {
  const p = AppStateLr.puzzle, s = AppStateLr.state;
  if (!p) return;
  const hintRing = AppStateLr.hint ? AppStateLr.hint.ring : -1;
  const b = boardSvgLr(p, s, { sel: AppStateLr.sel, hint: hintRing });
  let html = '<svg class="lr-svg" viewBox="0 0 ' + b.w.toFixed(1) + " " + b.h.toFixed(1) + '" aria-hidden="true" focusable="false"><rect width="' + b.w.toFixed(1) + '" height="' + b.h.toFixed(1) + '" fill="#fff"/>' + b.svg + "</svg>";
  // Tap targets: a round button in the middle of every ring still there.
  p.cells.forEach((c, i) => {
    if (!s.present[i]) return;
    const [cx, cy] = b.pos[i];
    const size = (LR_R * 1.2 / b.w * 100).toFixed(2);
    const label = tLr("lr_aria_ring").split("{N}").join(String(i + 1)).split("{D}").join(tLr("lr_dir_" + s.gaps[i]));
    html += '<button type="button" class="lr-ring-btn" data-ring="' + i + '" aria-label="' + label.replace(/"/g, "&quot;") + '" style="left:' + ((cx / b.w) * 100).toFixed(2) + "%;top:" + ((cy / b.h) * 100).toFixed(2) + "%;width:" + size + "%;height:" + ((LR_R * 1.2 / b.h) * 100).toFixed(2) + '%"></button>';
  });
  const box = document.getElementById("lr-board");
  box.innerHTML = html;
  box.style.maxWidth = (b.w / 10).toFixed(1) + "rem";
  box.querySelectorAll(".lr-ring-btn").forEach((btn) => btn.addEventListener("click", () => onRingLr(parseInt(btn.getAttribute("data-ring"), 10))));
  const left = s.present.filter(Boolean).length;
  const info = document.getElementById("lr-info");
  if (info) I18n.setMsg(info, "Rings left: " + left + " · Moves: " + AppStateLr.moves + " · Fewest: " + p.best);
  const noSel = AppStateLr.gameOver || AppStateLr.sel < 0 || !s.present[AppStateLr.sel];
  document.getElementById("lr-left").disabled = noSel;
  document.getElementById("lr-right").disabled = noSel;
  document.getElementById("lr-undo").disabled = AppStateLr.gameOver || !AppStateLr.history.length;
  document.getElementById("lr-hint").disabled = AppStateLr.gameOver;
}

document.addEventListener("DOMContentLoaded", initLrApp);
