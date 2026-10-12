// arrows-app.js
// Wires ArrowsCore ("Arrows", Pfeile) to arrows.html.
//
// Tap an arrow: it leaves the field at once (no animation) if its way out
// is free; otherwise it stays, a short line says so and the arrow in the
// way gets a dotted frame - no penalty. Undo puts the last arrow back,
// Hint frames an arrow that can leave. No time limit.

const AW_SAVE_KEY = "einkchess_save_arrows";
const AW_CELL = 40;

const AppStateAw = {
  puzzle: null,
  present: [],    // per arrow: still in the field
  history: [],    // arrows taken out, in order
  moves: 0,
  hint: -1,
  blocker: -1,
  hinted: false,
  gameOver: false
};

function tAw(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusAw(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveAwGame() {
  if (typeof GameStorage === "undefined" || !AppStateAw.puzzle) return;
  GameStorage.save(AW_SAVE_KEY, { puzzle: AppStateAw.puzzle, present: AppStateAw.present, history: AppStateAw.history, moves: AppStateAw.moves, hinted: AppStateAw.hinted });
}

function clearSavedAwGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(AW_SAVE_KEY);
}

function initAwApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("aw-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-aw-game").addEventListener("click", () => startNewAwGame(levelSel.value));
  document.getElementById("aw-undo").addEventListener("click", undoAw);
  document.getElementById("aw-hint").addEventListener("click", hintAw);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateAw.puzzle) renderAw(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(AW_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.arrows && Array.isArray(saved.present) && saved.present.length === saved.puzzle.arrows.length) {
    AppStateAw.puzzle = saved.puzzle;
    AppStateAw.present = saved.present;
    AppStateAw.history = saved.history || [];
    AppStateAw.moves = saved.moves || 0;
    AppStateAw.hinted = !!saved.hinted;
    AppStateAw.gameOver = false;
    levelSel.value = saved.puzzle.level;
    showBoardAw();
    setStatusAw("Tap an arrow to send it out of the field.");
  }
}

function showBoardAw() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderAw();
}

function startNewAwGame(level) {
  const p = ArrowsCore.generatePuzzle(level);
  AppStateAw.puzzle = p;
  AppStateAw.present = p.arrows.map(() => true);
  AppStateAw.history = [];
  AppStateAw.moves = 0;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  AppStateAw.hinted = false;
  AppStateAw.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardAw();
  setStatusAw("Tap an arrow to send it out of the field.");
  saveAwGame();
}

function onCellAw(i) {
  const p = AppStateAw.puzzle;
  if (!p || AppStateAw.gameOver) return;
  const occ = ArrowsCore.occupancy(p, AppStateAw.present);
  const k = occ[i];
  if (k === -1) {
    setStatusAw("Tap an arrow to send it out of the field.");
    return;
  }
  AppStateAw.hint = -1;
  if (!ArrowsCore.canLeave(p, occ, k)) {
    AppStateAw.blocker = ArrowsCore.blocker(p, occ, k);
    setStatusAw("Blocked - another arrow is in the way.");
    renderAw();
    return;
  }
  AppStateAw.blocker = -1;
  AppStateAw.present[k] = false;
  AppStateAw.history.push(k);
  AppStateAw.moves++;
  if (!AppStateAw.present.some(Boolean)) {
    winAw();
    return;
  }
  setStatusAw("The arrow leaves the field.");
  renderAw();
  saveAwGame();
}

function undoAw() {
  if (!AppStateAw.puzzle || AppStateAw.gameOver) return;
  if (!AppStateAw.history.length) {
    setStatusAw("Nothing to undo.");
    return;
  }
  const k = AppStateAw.history.pop();
  AppStateAw.present[k] = true;
  AppStateAw.moves++;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  setStatusAw("Undone: the arrow is back.");
  renderAw();
  saveAwGame();
}

function hintAw() {
  const p = AppStateAw.puzzle;
  if (!p || AppStateAw.gameOver) return;
  AppStateAw.hinted = true;
  AppStateAw.blocker = -1;
  AppStateAw.hint = ArrowsCore.findHint(p, AppStateAw.present);
  setStatusAw("Hint: the marked arrow can leave.");
  renderAw();
  saveAwGame();
}

function winAw() {
  AppStateAw.gameOver = true;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  const text = "All arrows are out - solved in " + AppStateAw.moves + " moves!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusAw(text);
  if (typeof GameStats !== "undefined") GameStats.record("arrows", "win", { hinted: AppStateAw.hinted });
  if (window.ResultModal) window.ResultModal.show(tAw("aw_win_title"), I18n.msg(text));
  clearSavedAwGame();
  renderAw();
}

/*** Rendering ***/

// One arrow: a thick line through the middle of its cells, a round tail
// and a filled head in the last cell.
function arrowSvgAw(p, a, S) {
  const pt = (i) => [(i % p.cols) * S + S / 2, Math.floor(i / p.cols) * S + S / 2];
  const head = pt(a.cells[a.cells.length - 1]);
  const dx = ArrowsCore.DC[a.dir], dy = ArrowsCore.DR[a.dir];
  const tip = [head[0] + dx * S * 0.42, head[1] + dy * S * 0.42];
  const base = [head[0] - dx * S * 0.02, head[1] - dy * S * 0.02];
  const side = [-dy, dx];
  const pts = a.cells.map(pt);
  pts.push(base);
  if (a.cells.length === 1) pts.unshift([head[0] - dx * S * 0.36, head[1] - dy * S * 0.36]);
  const tail = pts[0];
  const line = pts.map((q, j) => (j ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  const w = S * 0.2, hw = S * 0.3;
  return '<path d="' + line + '" fill="none" stroke="#fff" stroke-width="' + (w + 5) + '" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="' + line + '" fill="none" stroke="#141413" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<circle cx="' + tail[0].toFixed(1) + '" cy="' + tail[1].toFixed(1) + '" r="' + (S * 0.15).toFixed(1) + '" fill="#fff" stroke="#141413" stroke-width="' + (S * 0.08).toFixed(1) + '"/>' +
    '<path d="M' + tip[0].toFixed(1) + " " + tip[1].toFixed(1) +
    "L" + (base[0] + side[0] * hw).toFixed(1) + " " + (base[1] + side[1] * hw).toFixed(1) +
    "L" + (base[0] - side[0] * hw).toFixed(1) + " " + (base[1] - side[1] * hw).toFixed(1) + 'Z" fill="#141413" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>';
}

function frameSvgAw(p, a, S, cls) {
  return a.cells.map((i) => '<rect class="' + cls + '" x="' + ((i % p.cols) * S + 3) + '" y="' + (Math.floor(i / p.cols) * S + 3) + '" width="' + (S - 6) + '" height="' + (S - 6) + '"/>').join("");
}

function renderAw() {
  const p = AppStateAw.puzzle;
  if (!p) return;
  const S = AW_CELL, W = p.cols * S, H = p.rows * S;
  let svg = '<svg class="pt-svg" viewBox="-2 -2 ' + (W + 4) + " " + (H + 4) + '" aria-hidden="true" focusable="false">' +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
  for (let r = 1; r < p.rows; r++) svg += '<path d="M0 ' + r * S + "H" + W + '" stroke="#141413" stroke-width="0.6" stroke-dasharray="2 4"/>';
  for (let c = 1; c < p.cols; c++) svg += '<path d="M' + c * S + " 0V" + H + '" stroke="#141413" stroke-width="0.6" stroke-dasharray="2 4"/>';
  p.arrows.forEach((a, k) => { if (AppStateAw.present[k]) svg += arrowSvgAw(p, a, S); });
  if (AppStateAw.hint >= 0) svg += frameSvgAw(p, p.arrows[AppStateAw.hint], S, "pt-hint");
  if (AppStateAw.blocker >= 0) svg += frameSvgAw(p, p.arrows[AppStateAw.blocker], S, "aw-blocker");
  svg += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#141413" stroke-width="4"/></svg>';
  const boardEl = document.getElementById("aw-board");
  const ix = (200 / (W + 4)).toFixed(3) + "%", iy = (200 / (H + 4)).toFixed(3) + "%";
  let html = svg + '<div class="pt-cells" style="left:' + ix + ";right:" + ix + ";top:" + iy + ";bottom:" + iy +
    ";grid-template-columns:repeat(" + p.cols + ",1fr);grid-template-rows:repeat(" + p.rows + ',1fr)">';
  for (let i = 0; i < p.rows * p.cols; i++) html += '<button type="button" class="pt-cell" data-i="' + i + '"></button>';
  boardEl.innerHTML = html + "</div>";
  boardEl.style.maxWidth = (p.cols * 3.4) + "rem";
  const occ = ArrowsCore.occupancy(p, AppStateAw.present);
  boardEl.querySelectorAll(".pt-cell").forEach((btn) => {
    const i = parseInt(btn.getAttribute("data-i"), 10);
    const r = Math.floor(i / p.cols) + 1, c = (i % p.cols) + 1;
    const k = occ[i];
    const what = k === -1 ? tAw("aw_aria_empty") : tAw("aw_aria_arrow").split("{D}").join(tAw("aw_dir_" + p.arrows[k].dir));
    btn.setAttribute("aria-label", tAw("aw_aria_cell").split("{R}").join(String(r)).split("{C}").join(String(c)) + ": " + what);
    btn.addEventListener("click", () => onCellAw(i));
  });
  const left = AppStateAw.present.filter(Boolean).length;
  const info = document.getElementById("aw-info");
  if (info) I18n.setMsg(info, "Arrows left: " + left + " · Moves: " + AppStateAw.moves + " · Fewest: " + ArrowsCore.minMoves(p));
  document.getElementById("aw-undo").disabled = AppStateAw.gameOver || !AppStateAw.history.length;
  document.getElementById("aw-hint").disabled = AppStateAw.gameOver;
}

document.addEventListener("DOMContentLoaded", initAwApp);
