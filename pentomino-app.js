// pentomino-app.js
// Wires PentominoCore ("Pentomino Puzzle", Legepuzzle) to pentomino.html.
//
// Choose a piece below the board, turn or flip it with the buttons, then
// tap the square where its dot should go. Tap a laid piece to pick it up
// again (fixed start pieces stay). No dragging anywhere. Pieces are told
// apart by black-and-white patterns and their letter, never by colour.

const PT_SAVE_KEY = "einkchess_save_pentomino";
const PT_CELL = 40;

const AppStatePt = {
  puzzle: null,
  placements: [],   // [{ piece, cells }] laid by the player, in order
  selected: null,   // letter
  rot: 0,
  mirror: false,
  hintPiece: null,
  hintCells: [],
  hinted: false,
  gameOver: false
};

function tPt(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusPt(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function savePtGame() {
  if (typeof GameStorage === "undefined" || !AppStatePt.puzzle) return;
  GameStorage.save(PT_SAVE_KEY, { puzzle: AppStatePt.puzzle, placements: AppStatePt.placements, hinted: AppStatePt.hinted });
}

function clearSavedPtGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(PT_SAVE_KEY);
}

// Pattern fills, one per letter (black on white, no grey).
const PT_PATTERNS = {
  F: '<rect width="8" height="8" fill="#141413"/>',
  I: '<rect width="8" height="8" fill="#fff"/><path d="M0.5 2H3.5M4.5 6H7.5" stroke="#141413" stroke-width="1.6"/>',
  L: '<rect width="8" height="8" fill="#fff"/><path d="M0 2H8M0 6H8" stroke="#141413" stroke-width="1.6"/>',
  N: '<rect width="8" height="8" fill="#fff"/><path d="M2 0V8M6 0V8" stroke="#141413" stroke-width="1.6"/>',
  P: '<rect width="8" height="8" fill="#fff"/><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="#141413" stroke-width="1.6"/>',
  T: '<rect width="8" height="8" fill="#fff"/><path d="M-2 6L2 10M0 0L8 8M6-2L10 2" stroke="#141413" stroke-width="1.6"/>',
  U: '<rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="1.3" fill="#141413"/>',
  V: '<rect width="8" height="8" fill="#fff"/><path d="M0 4H8M4 0V8" stroke="#141413" stroke-width="1.2"/>',
  W: '<rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#141413"/><rect x="4" y="4" width="4" height="4" fill="#141413"/>',
  X: '<rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="2.6" fill="#141413"/>',
  Y: '<rect width="8" height="8" fill="#fff"/><circle cx="4" cy="4" r="2.4" fill="none" stroke="#141413" stroke-width="1.3"/>',
  Z: '<rect width="8" height="8" fill="#fff"/><path d="M0 4L4 0L8 4L4 8Z" fill="none" stroke="#141413" stroke-width="1.2"/>'
};

function ptDefs(prefix) {
  return "<defs>" + PentominoCore.LETTERS.map((L) =>
    '<pattern id="' + prefix + L + '" width="8" height="8" patternUnits="userSpaceOnUse">' + PT_PATTERNS[L] + "</pattern>").join("") + "</defs>";
}

// A piece's cells ([[r, c], ...]) as SVG: patterned squares, the outline,
// the letter on a white label in its middle square; `dot` marks the
// anchor square (the one placed on the tapped square).
function ptShapeSvg(cells, letter, prefix, size, dot) {
  let out = "";
  const has = {};
  cells.forEach((p) => { has[p[0] + "," + p[1]] = true; });
  cells.forEach((p) => {
    out += '<rect x="' + p[1] * size + '" y="' + p[0] * size + '" width="' + size + '" height="' + size + '" fill="url(#' + prefix + letter + ')"/>';
  });
  cells.forEach((p) => {
    const x = p[1] * size, y = p[0] * size;
    const edges = [];
    if (!has[(p[0] - 1) + "," + p[1]]) edges.push("M" + x + " " + y + "H" + (x + size));
    if (!has[(p[0] + 1) + "," + p[1]]) edges.push("M" + x + " " + (y + size) + "H" + (x + size));
    if (!has[p[0] + "," + (p[1] - 1)]) edges.push("M" + x + " " + y + "V" + (y + size));
    if (!has[p[0] + "," + (p[1] + 1)]) edges.push("M" + (x + size) + " " + y + "V" + (y + size));
    if (edges.length) out += '<path d="' + edges.join("") + '" stroke="#141413" stroke-width="' + (size / 8) + '" stroke-linecap="square"/>';
  });
  const mid = ptMiddleCell(cells);
  out += '<rect x="' + (mid[1] * size + size * 0.22) + '" y="' + (mid[0] * size + size * 0.22) + '" width="' + size * 0.56 + '" height="' + size * 0.56 + '" fill="#fff" stroke="#141413" stroke-width="' + (size / 20) + '"/>' +
    '<text x="' + (mid[1] * size + size / 2) + '" y="' + (mid[0] * size + size * 0.66) + '" text-anchor="middle" font-size="' + size * 0.42 + '" font-weight="700" fill="#141413">' + letter + "</text>";
  if (dot) {
    const d = dot;
    out += '<circle cx="' + (d[1] * size + size / 2) + '" cy="' + (d[0] * size + size / 2) + '" r="' + size * 0.13 + '" fill="#141413" stroke="#fff" stroke-width="' + size / 20 + '"/>';
  }
  return out;
}

// The square nearest to the middle of a piece (for its letter).
function ptMiddleCell(cells) {
  const cr = cells.reduce((a, p) => a + p[0], 0) / cells.length, cc = cells.reduce((a, p) => a + p[1], 0) / cells.length;
  let best = cells[0], bd = Infinity;
  cells.forEach((p) => { const d = (p[0] - cr) * (p[0] - cr) + (p[1] - cc) * (p[1] - cc); if (d < bd) { bd = d; best = p; } });
  return best;
}

function initPtApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeSel = document.getElementById("pt-mode");
  const levelSel = document.getElementById("pt-level");
  const sizeSel = document.getElementById("pt-size");
  const sizeWrap = document.getElementById("pt-size-wrap");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  // The field size can only be chosen when all 12 pieces go into a free
  // rectangle (Hard, free laying).
  function updateSize() {
    if (sizeWrap) sizeWrap.classList.toggle("hidden", !(modeSel.value === "free" && levelSel.value === "hard"));
  }
  modeSel.addEventListener("change", updateSize);
  levelSel.addEventListener("change", updateSize);
  updateSize();
  document.getElementById("start-pt-game").addEventListener("click", () => startNewPtGame(modeSel.value, levelSel.value, sizeSel ? sizeSel.value : null));
  document.getElementById("pt-rotate").addEventListener("click", () => turnPt(1, false));
  document.getElementById("pt-mirror").addEventListener("click", () => turnPt(0, true));
  document.getElementById("pt-hint").addEventListener("click", hintPt);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStatePt.puzzle) renderPt(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(PT_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.rows) {
    AppStatePt.puzzle = saved.puzzle;
    AppStatePt.placements = saved.placements || [];
    AppStatePt.hinted = !!saved.hinted;
    AppStatePt.selected = null;
    AppStatePt.gameOver = false;
    modeSel.value = saved.puzzle.mode;
    levelSel.value = saved.puzzle.level;
    updateSize();
    showBoardPt();
    setStatusPt("Choose a piece below the board.");
  }
}

function showBoardPt() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderPt();
}

function startNewPtGame(mode, level, size) {
  const p = PentominoCore.generatePuzzle(mode, level, { size: size });
  if (!p) return;
  AppStatePt.puzzle = p;
  AppStatePt.placements = [];
  AppStatePt.selected = null;
  AppStatePt.rot = 0;
  AppStatePt.mirror = false;
  AppStatePt.hintPiece = null;
  AppStatePt.hintCells = [];
  AppStatePt.hinted = false;
  AppStatePt.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardPt();
  setStatusPt("Choose a piece below the board.");
  savePtGame();
}

function isGivenPt(letter) {
  return AppStatePt.puzzle.givens.some((g) => g.piece === letter);
}

function selectPt(letter) {
  if (AppStatePt.gameOver) return;
  if (isGivenPt(letter)) {
    setStatusPt("That piece is fixed.");
    return;
  }
  // A laid piece goes back into the hand.
  const at = AppStatePt.placements.findIndex((pl) => pl.piece === letter);
  if (at !== -1) AppStatePt.placements.splice(at, 1);
  if (AppStatePt.selected !== letter) { AppStatePt.rot = 0; AppStatePt.mirror = false; }
  AppStatePt.selected = letter;
  AppStatePt.hintPiece = null;
  AppStatePt.hintCells = [];
  setStatusPt(at !== -1 ? "Piece " + letter + " picked up." : "Turn or flip it if needed, then tap where its dot should go.");
  renderPt();
  savePtGame();
}

function turnPt(rot, flip) {
  if (!AppStatePt.selected || AppStatePt.gameOver) {
    setStatusPt("Choose a piece below the board.");
    return;
  }
  if (flip) AppStatePt.mirror = !AppStatePt.mirror;
  AppStatePt.rot = (AppStatePt.rot + rot) % 4;
  renderPt();
}

function currentShapePt() {
  return PentominoCore.transform(AppStatePt.selected, AppStatePt.rot, AppStatePt.mirror);
}

function onCellPt(i) {
  if (AppStatePt.gameOver) return;
  const p = AppStatePt.puzzle;
  const board = PentominoCore.emptyBoard(p.rows, p.cols, p.givens.concat(AppStatePt.placements));
  if (board[i] !== null) {
    if (isGivenPt(board[i])) setStatusPt("That piece is fixed.");
    else selectPt(board[i]);
    return;
  }
  if (!AppStatePt.selected) {
    setStatusPt("Choose a piece below the board.");
    return;
  }
  const cells = PentominoCore.cellsAt(p.rows, p.cols, currentShapePt(), 0, i);
  if (!cells || !PentominoCore.fits(p, AppStatePt.placements, cells)) {
    setStatusPt("The piece does not fit there.");
    return;
  }
  AppStatePt.placements.push({ piece: AppStatePt.selected, cells: cells });
  AppStatePt.selected = null;
  AppStatePt.hintPiece = null;
  AppStatePt.hintCells = [];
  if (PentominoCore.isComplete(p, AppStatePt.placements)) {
    winPt();
    return;
  }
  setStatusPt("Choose a piece below the board.");
  renderPt();
  savePtGame();
}

function winPt() {
  AppStatePt.gameOver = true;
  const text = "The rectangle is full - solved!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusPt(text);
  if (typeof GameStats !== "undefined") GameStats.record("pentomino", "win", { hinted: AppStatePt.hinted });
  if (window.ResultModal) window.ResultModal.show(tPt("pt_win_title"), I18n.msg(text));
  clearSavedPtGame();
  renderPt();
}

function hintPt() {
  const p = AppStatePt.puzzle;
  if (!p || AppStatePt.gameOver) return;
  AppStatePt.hinted = true;
  const h = PentominoCore.findHint(p, AppStatePt.placements);
  AppStatePt.hintPiece = null;
  AppStatePt.hintCells = [];
  if (h.kind === "place") {
    AppStatePt.hintPiece = h.piece;
    AppStatePt.hintCells = h.cells;
    setStatusPt("Hint: piece " + h.piece + " goes in the marked place.");
  } else if (h.kind === "remove") {
    AppStatePt.hintPiece = h.piece;
    setStatusPt("Hint: piece " + h.piece + " blocks the solution - take it off.");
  } else if (h.kind === "none") {
    setStatusPt("Hint: no way found - take off a piece.");
  }
  renderPt();
  savePtGame();
}

/*** Rendering ***/

function renderPt() {
  const p = AppStatePt.puzzle;
  if (!p) return;
  const S = PT_CELL, W = p.cols * S, H = p.rows * S;
  const board = PentominoCore.emptyBoard(p.rows, p.cols, p.givens.concat(AppStatePt.placements));
  let svg = '<svg class="pt-svg" viewBox="-2 -2 ' + (W + 4) + " " + (H + 4) + '" aria-hidden="true" focusable="false">' + ptDefs("ptb") +
    '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
  for (let r = 0; r <= p.rows; r++) svg += '<path d="M0 ' + r * S + "H" + W + '" stroke="#141413" stroke-width="0.8"/>';
  for (let c = 0; c <= p.cols; c++) svg += '<path d="M' + c * S + " 0V" + H + '" stroke="#141413" stroke-width="0.8"/>';
  p.givens.concat(AppStatePt.placements).forEach((pl) => {
    const cells = pl.cells.map((i) => [Math.floor(i / p.cols), i % p.cols]);
    svg += '<g class="' + (isGivenPt(pl.piece) ? "pt-given" : "pt-laid") + '">' + ptShapeSvg(cells, pl.piece, "ptb", S, null) + "</g>";
    if (isGivenPt(pl.piece)) {
      // Fixed pieces: an extra inner frame on every square.
      svg += cells.map((q) => '<rect x="' + (q[1] * S + 5) + '" y="' + (q[0] * S + 5) + '" width="' + (S - 10) + '" height="' + (S - 10) + '" fill="none" stroke="#141413" stroke-width="1.5" stroke-dasharray="3 3"/>').join("");
    }
  });
  if (AppStatePt.hintCells.length) {
    svg += AppStatePt.hintCells.map((i) => '<rect class="pt-hint" x="' + ((i % p.cols) * S + 3) + '" y="' + (Math.floor(i / p.cols) * S + 3) + '" width="' + (S - 6) + '" height="' + (S - 6) + '"/>').join("");
  } else if (AppStatePt.hintPiece) {
    const pl = AppStatePt.placements.find((x) => x.piece === AppStatePt.hintPiece);
    if (pl) svg += pl.cells.map((i) => '<rect class="pt-hint" x="' + ((i % p.cols) * S + 3) + '" y="' + (Math.floor(i / p.cols) * S + 3) + '" width="' + (S - 6) + '" height="' + (S - 6) + '"/>').join("");
  }
  svg += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#141413" stroke-width="4"/></svg>';
  const boardEl = document.getElementById("pt-board");
  // The button grid covers exactly the squares (the drawing has a 2-unit
  // margin for the frame).
  const ix = (200 / (W + 4)).toFixed(3) + "%", iy = (200 / (H + 4)).toFixed(3) + "%";
  let html = svg + '<div class="pt-cells" style="left:' + ix + ";right:" + ix + ";top:" + iy + ";bottom:" + iy +
    ";grid-template-columns:repeat(" + p.cols + ",1fr);grid-template-rows:repeat(" + p.rows + ',1fr)">';
  for (let i = 0; i < p.rows * p.cols; i++) html += '<button type="button" class="pt-cell" data-i="' + i + '"></button>';
  boardEl.innerHTML = html + "</div>";
  // About 3.6rem per square at most, narrower on a small screen.
  boardEl.style.maxWidth = (p.cols * 3.6) + "rem";
  boardEl.querySelectorAll(".pt-cell").forEach((btn) => {
    const i = parseInt(btn.getAttribute("data-i"), 10);
    const r = Math.floor(i / p.cols) + 1, c = (i % p.cols) + 1;
    let label = tPt("pt_aria_cell").split("{R}").join(String(r)).split("{C}").join(String(c)) + ": " +
      (board[i] ? tPt("pt_aria_piece").split("{L}").join(board[i]) + (isGivenPt(board[i]) ? ", " + tPt("pt_aria_fixed") : "") : tPt("pt_aria_empty"));
    btn.setAttribute("aria-label", label);
    btn.addEventListener("click", () => onCellPt(i));
  });
  renderTrayPt();
  renderCurrentPt();
  const info = document.getElementById("pt-info");
  const toLay = p.pieces.length - p.givens.length;
  if (info) I18n.setMsg(info, "Pieces laid: " + AppStatePt.placements.length + " of " + toLay);
}

function renderTrayPt() {
  const p = AppStatePt.puzzle;
  const tray = document.getElementById("pt-tray");
  tray.innerHTML = "";
  p.pieces.filter((L) => !isGivenPt(L)).forEach((L) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const laid = AppStatePt.placements.some((pl) => pl.piece === L);
    btn.className = "secondary pt-piece" + (AppStatePt.selected === L ? " pt-piece-selected" : "") + (laid ? " pt-piece-laid" : "") + (AppStatePt.hintPiece === L ? " hint-cell" : "");
    const shape = PentominoCore.transform(L, 0, false);
    const h = Math.max.apply(null, shape.map((q) => q[0])) + 1, w = Math.max.apply(null, shape.map((q) => q[1])) + 1;
    // Drawn at 24 units per square (the button scales it down), so the
    // letter's font size stays at a readable 10.
    btn.innerHTML = '<svg viewBox="-2 -2 ' + (w * 24 + 4) + " " + (h * 24 + 4) + '" aria-hidden="true" focusable="false">' + ptDefs("ptt" + L) + ptShapeSvg(shape, L, "ptt" + L, 24, null) + "</svg>";
    btn.setAttribute("aria-label", tPt("pt_aria_piece").split("{L}").join(L) + (laid ? ", " + tPt("pt_aria_laid") : ""));
    btn.addEventListener("click", () => selectPt(L));
    tray.appendChild(btn);
  });
}

function renderCurrentPt() {
  const box = document.getElementById("pt-current");
  const L = AppStatePt.selected;
  document.getElementById("pt-rotate").disabled = !L || AppStatePt.gameOver;
  document.getElementById("pt-mirror").disabled = !L || AppStatePt.gameOver;
  if (!L) { box.innerHTML = ""; box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  const shape = currentShapePt();
  const h = Math.max.apply(null, shape.map((q) => q[0])) + 1, w = Math.max.apply(null, shape.map((q) => q[1])) + 1;
  box.innerHTML = '<svg viewBox="-2 -2 ' + (w * 24 + 4) + " " + (h * 24 + 4) + '" style="width:' + w * 1.6 + "rem;height:" + h * 1.6 + 'rem" role="img" aria-label="' +
    tPt("pt_aria_piece").split("{L}").join(L) + '">' + ptDefs("ptc") + ptShapeSvg(shape, L, "ptc", 24, shape[0]) + "</svg>";
}

document.addEventListener("DOMContentLoaded", initPtApp);
