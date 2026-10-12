// rings-app.js
// Wires RingsCore ("Turn the Rings", Ringe drehen) to rings.html.
//
// The rings are drawn as one round picture; under it every ring has a row
// with "turn left" and "turn right". A ring jumps to its new place at once
// (no animation). Undo takes back a turn, Hint names the next good turn
// and frames that ring's buttons. The fewest moves are shown from the
// start. No time limit.

const RG_SAVE_KEY = "einkchess_save_rings";

const AppStateRg = {
  puzzle: null,
  offsets: [],
  history: [],     // offsets before each turn
  moves: 0,
  hint: null,      // { ring, dir }
  hinted: false,
  gameOver: false
};

function tRg(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusRg(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveRgGame() {
  if (typeof GameStorage === "undefined" || !AppStateRg.puzzle) return;
  GameStorage.save(RG_SAVE_KEY, { puzzle: AppStateRg.puzzle, offsets: AppStateRg.offsets, history: AppStateRg.history, moves: AppStateRg.moves, hinted: AppStateRg.hinted });
}

function clearSavedRgGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(RG_SAVE_KEY);
}

function initRgApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("rg-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-rg-game").addEventListener("click", () => startNewRgGame(levelSel.value));
  document.getElementById("rg-undo").addEventListener("click", undoRg);
  document.getElementById("rg-hint").addEventListener("click", hintRg);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateRg.puzzle) renderRg(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(RG_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.rings && Array.isArray(saved.offsets) && saved.offsets.length === saved.puzzle.rings.length) {
    AppStateRg.puzzle = saved.puzzle;
    AppStateRg.offsets = saved.offsets;
    AppStateRg.history = saved.history || [];
    AppStateRg.moves = saved.moves || 0;
    AppStateRg.hinted = !!saved.hinted;
    AppStateRg.gameOver = false;
    levelSel.value = saved.puzzle.level;
    showBoardRg();
    setStatusRg(saved.puzzle.coupled ? "Turn the rings until every ray shows one shape. Each ring turns the next ring outwards along." : "Turn the rings until every ray shows one shape.");
  }
}

function showBoardRg() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderRg();
}

function startNewRgGame(level) {
  const p = RingsCore.generatePuzzle(level);
  AppStateRg.puzzle = p;
  AppStateRg.offsets = p.start.slice();
  AppStateRg.history = [];
  AppStateRg.moves = 0;
  AppStateRg.hint = null;
  AppStateRg.hinted = false;
  AppStateRg.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardRg();
  setStatusRg(p.coupled ? "Turn the rings until every ray shows one shape. Each ring turns the next ring outwards along." : "Turn the rings until every ray shows one shape.");
  saveRgGame();
}

function turnRg(k, dir) {
  const p = AppStateRg.puzzle;
  if (!p || AppStateRg.gameOver) return;
  AppStateRg.history.push(AppStateRg.offsets.slice());
  AppStateRg.offsets = RingsCore.turn(p, AppStateRg.offsets, k, dir);
  AppStateRg.moves++;
  AppStateRg.hint = null;
  if (RingsCore.isSolved(p, AppStateRg.offsets)) {
    winRg();
    return;
  }
  setStatusRg((dir > 0 ? "Ring " + (k + 1) + " turned right." : "Ring " + (k + 1) + " turned left.") + (p.coupled && k < p.rings.length - 1 ? " Ring " + (k + 2) + " turned along." : ""));
  renderRg();
  saveRgGame();
}

function undoRg() {
  if (!AppStateRg.puzzle || AppStateRg.gameOver) return;
  if (!AppStateRg.history.length) {
    setStatusRg("Nothing to undo.");
    return;
  }
  AppStateRg.offsets = AppStateRg.history.pop();
  AppStateRg.moves++;
  AppStateRg.hint = null;
  setStatusRg("The last turn is undone.");
  renderRg();
  saveRgGame();
}

function hintRg() {
  const p = AppStateRg.puzzle;
  if (!p || AppStateRg.gameOver) return;
  AppStateRg.hinted = true;
  const h = RingsCore.findHint(p, AppStateRg.offsets);
  AppStateRg.hint = h;
  if (h) setStatusRg(h.dir > 0 ? "Hint: turn ring " + (h.ring + 1) + " right." : "Hint: turn ring " + (h.ring + 1) + " left.");
  renderRg();
  saveRgGame();
}

function winRg() {
  AppStateRg.gameOver = true;
  AppStateRg.hint = null;
  const text = "Every ray shows one shape - solved in " + AppStateRg.moves + " moves (fewest: " + AppStateRg.puzzle.min + ")!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusRg(text);
  if (typeof GameStats !== "undefined") GameStats.record("rings", "win", { hinted: AppStateRg.hinted });
  if (window.ResultModal) window.ResultModal.show(tRg("rg_win_title"), I18n.msg(text));
  clearSavedRgGame();
  renderRg();
}

/*** Rendering ***/

// A shape centred on (x, y), about `s` wide. Filled and open shapes
// differ in black and white alone.
function shapeSvgRg(id, x, y, s) {
  const K = "#141413", h = s / 2;
  const f = (n) => n.toFixed(1);
  switch (id) {
    case "circle": return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(h * 0.85) + '" fill="' + K + '"/>';
    case "ring": return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(h * 0.75) + '" fill="#fff" stroke="' + K + '" stroke-width="' + (s / 6).toFixed(2) + '"/>';
    case "triangle": return '<path d="M' + f(x) + " " + f(y - h) + "L" + f(x + h) + " " + f(y + h * 0.8) + "H" + f(x - h) + 'Z" fill="' + K + '"/>';
    case "square": return '<rect x="' + f(x - h * 0.75) + '" y="' + f(y - h * 0.75) + '" width="' + f(h * 1.5) + '" height="' + f(h * 1.5) + '" fill="#fff" stroke="' + K + '" stroke-width="' + (s / 7).toFixed(2) + '"/>';
    case "star": {
      let d = "";
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? h * 0.42 : h;
        d += (i ? "L" : "M") + f(x + r * Math.cos(a)) + " " + f(y + r * Math.sin(a));
      }
      return '<path d="' + d + 'Z" fill="' + K + '"/>';
    }
    case "diamond": return '<path d="M' + f(x) + " " + f(y - h) + "L" + f(x + h * 0.75) + " " + f(y) + "L" + f(x) + " " + f(y + h) + "L" + f(x - h * 0.75) + " " + f(y) + 'Z" fill="#fff" stroke="' + K + '" stroke-width="' + (s / 7).toFixed(2) + '"/>';
    case "cross": return '<path d="M' + f(x - h * 0.3) + " " + f(y - h) + "H" + f(x + h * 0.3) + "V" + f(y - h * 0.3) + "H" + f(x + h) + "V" + f(y + h * 0.3) + "H" + f(x + h * 0.3) + "V" + f(y + h) + "H" + f(x - h * 0.3) + "V" + f(y + h * 0.3) + "H" + f(x - h) + "V" + f(y - h * 0.3) + "H" + f(x - h * 0.3) + 'Z" fill="' + K + '"/>';
    case "moon": return '<path d="M' + f(x + h * 0.2) + " " + f(y - h) + "A" + f(h) + " " + f(h) + " 0 1 0 " + f(x + h * 0.2) + " " + f(y + h) + "A" + f(h * 0.75) + " " + f(h * 0.75) + ' 0 1 1 ' + f(x + h * 0.2) + " " + f(y - h) + 'Z" fill="' + K + '"/>';
  }
  return "";
}

// The whole picture: rings from the inside out, the 8 rays as thin lines.
function ringsSvgRg(p, offsets, size) {
  const n = p.rings.length, W = 40, R0 = 40, C = R0 + n * W + 4;
  let svg = '<svg class="rg-svg" viewBox="0 0 ' + 2 * C + " " + 2 * C + '" aria-hidden="true" focusable="false"' + (size ? ' width="' + size + '" height="' + size + '"' : "") + ">";
  svg += '<circle cx="' + C + '" cy="' + C + '" r="' + (R0 + n * W) + '" fill="#fff" stroke="#141413" stroke-width="3"/>';
  for (let k = 0; k <= n; k++) svg += '<circle cx="' + C + '" cy="' + C + '" r="' + (R0 + k * W) + '" fill="none" stroke="#141413" stroke-width="' + (k === 0 || k === n ? 3 : 1.5) + '"/>';
  for (let j = 0; j < 8; j++) {
    const a = (j * 45 - 90 - 22.5) * Math.PI / 180;
    svg += '<path d="M' + (C + R0 * Math.cos(a)).toFixed(1) + " " + (C + R0 * Math.sin(a)).toFixed(1) + "L" + (C + (R0 + n * W) * Math.cos(a)).toFixed(1) + " " + (C + (R0 + n * W) * Math.sin(a)).toFixed(1) + '" stroke="#141413" stroke-width="1" stroke-dasharray="3 3"/>';
  }
  for (let k = 0; k < n; k++) {
    const rm = R0 + k * W + W / 2;
    for (let j = 0; j < 8; j++) {
      const a = (j * 45 - 90) * Math.PI / 180;
      svg += shapeSvgRg(RingsCore.shapeAt(p, offsets, k, j), C + rm * Math.cos(a), C + rm * Math.sin(a), Math.min(W * 0.62, rm * 0.55));
    }
  }
  // Ring numbers on the left of the top ray.
  for (let k = 0; k < n; k++) {
    const rm = R0 + k * W + W / 2, a = (-90 - 22.5) * Math.PI / 180;
    const x = C + rm * Math.cos(a), y = C + rm * Math.sin(a);
    svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="8" fill="#fff" stroke="#141413" stroke-width="1.2"/><text x="' + x.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#141413">' + (k + 1) + "</text>";
  }
  return svg + "</svg>";
}

function renderRg() {
  const p = AppStateRg.puzzle;
  if (!p) return;
  const box = document.getElementById("rg-board");
  box.innerHTML = ringsSvgRg(p, AppStateRg.offsets);
  // Screen readers: every ring as a line of its 8 shapes from the top
  // clockwise.
  const desc = p.rings.map((r, k) => tRg("rg_aria_ring").split("{N}").join(String(k + 1)) + ": " +
    [0, 1, 2, 3, 4, 5, 6, 7].map((j) => tRg("rg_shape_" + RingsCore.shapeAt(p, AppStateRg.offsets, k, j))).join(", ")).join(". ");
  box.setAttribute("aria-label", desc);
  const rows = document.getElementById("rg-turns");
  rows.innerHTML = "";
  for (let k = p.rings.length - 1; k >= 0; k--) {
    const row = document.createElement("div");
    row.className = "rg-turn-row";
    const label = document.createElement("span");
    label.className = "rg-turn-label";
    label.textContent = tRg("rg_aria_ring").split("{N}").join(String(k + 1));
    row.appendChild(label);
    [[-1, "rg_turn_left", "↺"], [1, "rg_turn_right", "↻"]].forEach((d) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "secondary rg-turn" + (AppStateRg.hint && AppStateRg.hint.ring === k && AppStateRg.hint.dir === d[0] ? " hint-cell" : "");
      btn.textContent = d[2];
      btn.disabled = AppStateRg.gameOver;
      btn.setAttribute("aria-label", tRg(d[1]).split("{N}").join(String(k + 1)));
      btn.addEventListener("click", () => turnRg(k, d[0]));
      row.appendChild(btn);
    });
    rows.appendChild(row);
  }
  const info = document.getElementById("rg-info");
  if (info) I18n.setMsg(info, "Moves: " + AppStateRg.moves + " · Fewest: " + p.min);
  document.getElementById("rg-undo").disabled = AppStateRg.gameOver || !AppStateRg.history.length;
  document.getElementById("rg-hint").disabled = AppStateRg.gameOver;
}

document.addEventListener("DOMContentLoaded", initRgApp);
