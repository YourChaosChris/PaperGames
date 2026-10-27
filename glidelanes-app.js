// glidelanes-app.js
// Wires ArrowsCore ("Glide Lanes") to glidelanes.html.
//
// Tap an arrow: it leaves the field at once (no animation) if its way out
// is free; otherwise it stays, a short line says so and the arrow in the
// way gets a dotted frame - no penalty. Undo puts the last arrow back,
// Hint frames an arrow that can leave. No time limit.
//
// Hard and Master (puzzles with `glide`): a blocked arrow glides forward
// up to the obstacle (ArrowsCore.moveOf) - a wrong move can block others
// for good, undo takes it back, and Hint looks for a way out from the
// current position. Master has no hint and counts taps that do not let
// an arrow leave as misses.

const AW_SAVE_KEY = "einkchess_save_glidelanes";
const AW_CELL = 40;

const AppStateAw = {
  puzzle: null,
  present: [],    // per arrow: still in the field
  history: [],    // arrows taken out, in order (gliding: earlier positions)
  pos: null,      // gliding puzzles: per arrow its cells now, or null
  misses: 0,
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
  GameStorage.save(AW_SAVE_KEY, { puzzle: AppStateAw.puzzle, present: AppStateAw.present, history: AppStateAw.history, moves: AppStateAw.moves, hinted: AppStateAw.hinted, pos: AppStateAw.pos, misses: AppStateAw.misses });
}

function glideAw() {
  return !!(AppStateAw.puzzle && AppStateAw.puzzle.glide);
}

function masterAw() {
  return !!(AppStateAw.puzzle && AppStateAw.puzzle.level === "master");
}

function missesModeAw(p) {
  return !!(p && (p.level === "master" || p.level === "grandmaster" || p.level === "pictures"));
}

// Cells of arrow k now (moved by gliding), and whether it is still there.
function cellsAw(k) {
  return glideAw() ? AppStateAw.pos[k] : (AppStateAw.present[k] ? AppStateAw.puzzle.arrows[k].cells : null);
}

function occupancyAw() {
  const p = AppStateAw.puzzle;
  return glideAw() ? ArrowsCore.occupancyPos(p, AppStateAw.pos) : ArrowsCore.occupancy(p, AppStateAw.present);
}

function syncPresentAw() {
  if (glideAw()) AppStateAw.present = AppStateAw.pos.map((c) => c !== null);
}

function clearSavedAwGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(AW_SAVE_KEY);
}

function initAwApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("aw-level");
  const shapeSel = document.getElementById("aw-shape");
  const syncShape = () => shapeSel.classList.toggle("hidden", levelSel.value !== "pictures");
  levelSel.addEventListener("change", syncShape);
  syncShape();
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-aw-game").addEventListener("click", () => startNewAwGame(levelSel.value, shapeSel.value));
  document.getElementById("aw-undo").addEventListener("click", undoAw);
  document.getElementById("aw-hint").addEventListener("click", hintAw);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateAw.puzzle) renderAw(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(AW_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.arrows && Array.isArray(saved.present) && saved.present.length === saved.puzzle.arrows.length &&
      (!saved.puzzle.glide || (Array.isArray(saved.pos) && saved.pos.length === saved.puzzle.arrows.length))) {
    AppStateAw.puzzle = saved.puzzle;
    AppStateAw.present = saved.present;
    AppStateAw.pos = saved.puzzle.glide ? saved.pos : null;
    AppStateAw.misses = typeof saved.misses === "number" ? saved.misses : 0;
    AppStateAw.history = saved.history || [];
    AppStateAw.moves = saved.moves || 0;
    AppStateAw.hinted = !!saved.hinted;
    AppStateAw.gameOver = false;
    levelSel.value = saved.puzzle.level;
    shapeSel.value = saved.puzzle.shape || "snail";
    syncShape();
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

function startNewAwGame(level, shape) {
  startAwPuzzle(ArrowsCore.generatePuzzle(level, undefined, shape));
}

function startAwPuzzle(p) {
  AppStateAw.puzzle = p;
  AppStateAw.present = p.arrows.map(() => true);
  AppStateAw.pos = p.glide ? ArrowsCore.startPos(p) : null;
  AppStateAw.misses = 0;
  AppStateAw.history = [];
  AppStateAw.moves = 0;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  AppStateAw.hinted = false;
  AppStateAw.gameOver = false;
  const levelSel = document.getElementById("aw-level"), shapeSel = document.getElementById("aw-shape");
  if (levelSel) levelSel.value = p.level;
  if (shapeSel) { shapeSel.value = p.shape || "snail"; shapeSel.classList.toggle("hidden", p.level !== "pictures"); }
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
  if (glideAw()) { onCellGlideAw(i); return; }
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

// Gliding arrows: leave, glide up to the obstacle, or stay when the very
// next square is taken. A tap that does not let an arrow leave counts as a miss.
function onCellGlideAw(i) {
  const p = AppStateAw.puzzle;
  const occ = ArrowsCore.occupancyPos(p, AppStateAw.pos);
  const k = occ[i];
  if (k === -1) {
    setStatusAw("Tap an arrow to send it out of the field.");
    return;
  }
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  const before = AppStateAw.pos;
  const r = ArrowsCore.applyMove(p, before, k);
  let text;
  if (r.move.type === "blocked") {
    if (!masterAw()) AppStateAw.blocker = occ[ArrowsCore.rayCells(p, { cells: before[k], dir: p.arrows[k].dir })[0]];
    text = "Blocked - another arrow is in the way.";
  } else {
    AppStateAw.history.push(before);
    AppStateAw.pos = r.pos;
    syncPresentAw();
    AppStateAw.moves++;
    if (ArrowsCore.cleared(r.pos)) { winAw(); return; }
    text = r.move.type === "leave" ? "The arrow leaves the field." : "The arrow glides forward up to the next arrow.";
  }
  if (missesModeAw(p) && r.move.type !== "leave") AppStateAw.misses++;
  if (r.move.type !== "blocked" && stuckAw()) text = "No arrow can move any more - undo some moves.";
  setStatusAw(text);
  renderAw();
  saveAwGame();
}

// No arrow can move, but some are left.
function stuckAw() {
  const p = AppStateAw.puzzle, pos = AppStateAw.pos;
  if (ArrowsCore.cleared(pos)) return false;
  const occ = ArrowsCore.occupancyPos(p, pos);
  return !pos.some((c, k) => c && ArrowsCore.moveOf(p, pos, k, occ).type !== "blocked");
}

function undoAw() {
  if (!AppStateAw.puzzle || AppStateAw.gameOver) return;
  if (!AppStateAw.history.length) {
    setStatusAw("Nothing to undo.");
    return;
  }
  const k = AppStateAw.history.pop();
  if (glideAw()) {
    AppStateAw.pos = k;
    syncPresentAw();
  } else AppStateAw.present[k] = true;
  AppStateAw.moves++;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  setStatusAw(glideAw() ? "Undone." : "Undone: the arrow is back.");
  renderAw();
  saveAwGame();
}

function hintAw() {
  const p = AppStateAw.puzzle;
  if (!p || AppStateAw.gameOver || masterAw()) return;
  AppStateAw.hinted = true;
  AppStateAw.blocker = -1;
  if (glideAw()) {
    AppStateAw.hint = ArrowsCore.findHintGlide(p, AppStateAw.pos);
    if (AppStateAw.hint < 0) setStatusAw("There is no way out from here - undo some moves.");
    else setStatusAw(ArrowsCore.moveOf(p, AppStateAw.pos, AppStateAw.hint).type === "leave" ? "Hint: the marked arrow can leave." : "Hint: let the marked arrow glide forward.");
  } else {
    AppStateAw.hint = ArrowsCore.findHint(p, AppStateAw.present);
    setStatusAw("Hint: the marked arrow can leave.");
  }
  renderAw();
  saveAwGame();
}

function winAw() {
  AppStateAw.gameOver = true;
  AppStateAw.hint = -1;
  AppStateAw.blocker = -1;
  const text = missesModeAw(AppStateAw.puzzle) ? "Solved with " + AppStateAw.misses + " misses." : "All arrows are out - solved in " + AppStateAw.moves + " moves!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusAw(text);
  if (typeof GameStats !== "undefined") GameStats.record("glidelanes", "win", { hinted: AppStateAw.hinted });
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

function frameSvgAw(p, cells, S, cls) {
  return cells.map((i) => '<rect class="' + cls + '" x="' + ((i % p.cols) * S + 3) + '" y="' + (Math.floor(i / p.cols) * S + 3) + '" width="' + (S - 6) + '" height="' + (S - 6) + '"/>').join("");
}

function renderAw() {
  const p = AppStateAw.puzzle;
  if (!p) return;
  const S = AW_CELL, W = p.cols * S, H = p.rows * S;
  const mask = p.mask ? new Set(p.mask) : null;
  // The 15 x 15 boards (Grandmaster, pictures) have no margin around the
  // grid, so a cell is a full 24 px on a 360 px wide screen.
  const M = p.cols >= 15 ? 0 : 2;
  let svg = '<svg class="pt-svg" viewBox="' + (-M) + " " + (-M) + " " + (W + 2 * M) + " " + (H + 2 * M) + '" aria-hidden="true" focusable="false">' +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
  if (mask) {
    mask.forEach((i) => { const x = (i % p.cols) * S, y = Math.floor(i / p.cols) * S;
      svg += '<rect x="' + x + '" y="' + y + '" width="' + S + '" height="' + S + '" fill="#fff" stroke="#141413" stroke-width="0.8"/>'; });
  } else {
    for (let r = 1; r < p.rows; r++) svg += '<path d="M0 ' + r * S + "H" + W + '" stroke="#141413" stroke-width="0.6" stroke-dasharray="2 4"/>';
    for (let c = 1; c < p.cols; c++) svg += '<path d="M' + c * S + " 0V" + H + '" stroke="#141413" stroke-width="0.6" stroke-dasharray="2 4"/>';
  }
  p.arrows.forEach((a, k) => { const c = cellsAw(k); if (c) svg += arrowSvgAw(p, { cells: c, dir: a.dir }, S); });
  if (AppStateAw.hint >= 0 && cellsAw(AppStateAw.hint)) svg += frameSvgAw(p, cellsAw(AppStateAw.hint), S, "pt-hint");
  if (AppStateAw.blocker >= 0 && cellsAw(AppStateAw.blocker)) svg += frameSvgAw(p, cellsAw(AppStateAw.blocker), S, "aw-blocker");
  if (!mask) svg += M ? '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#141413" stroke-width="4"/></svg>' : '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" fill="none" stroke="#141413" stroke-width="4"/></svg>';
  else svg += "</svg>";
  const boardEl = document.getElementById("aw-board");
  const ix = (100 * M / (W + 2 * M)).toFixed(3) + "%", iy = (100 * M / (H + 2 * M)).toFixed(3) + "%";
  let html = svg + '<div class="pt-cells" style="left:' + ix + ";right:" + ix + ";top:" + iy + ";bottom:" + iy +
    ";grid-template-columns:repeat(" + p.cols + ",1fr);grid-template-rows:repeat(" + p.rows + ',1fr)">';
  for (let i = 0; i < p.rows * p.cols; i++) html += '<button type="button" class="pt-cell' + (mask && !mask.has(i) ? ' aw-cell-outside' : '') + '" data-i="' + i + '"' + (mask && !mask.has(i) ? ' disabled tabindex="-1" aria-hidden="true"' : '') + '></button>';
  boardEl.innerHTML = html + "</div>";
  boardEl.style.maxWidth = (p.cols * 3.4) + "rem";
  boardEl.classList.toggle("aw-board-large", p.cols >= 10);
  boardEl.classList.toggle("aw-board-full", p.cols >= 15);
  const occ = occupancyAw();
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
  if (info) {
    I18n.setMsg(info, missesModeAw(p) ? "Arrows left: " + left + " · Moves: " + AppStateAw.moves + " · Misses: " + AppStateAw.misses : "Arrows left: " + left + " · Moves: " + AppStateAw.moves + " · Fewest: " + ArrowsCore.minMoves(p));
  }

  document.getElementById("aw-undo").disabled = AppStateAw.gameOver || !AppStateAw.history.length;
  document.getElementById("aw-hint").disabled = AppStateAw.gameOver;
  document.getElementById("aw-hint").classList.toggle("hidden", masterAw());
}

document.addEventListener("DOMContentLoaded", initAwApp);
