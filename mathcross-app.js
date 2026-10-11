// mathcross-app.js
// Wires MathCrossCore ("Math Cross", Rechenkreuz) to mathcross.html.
// Solitaire like the other logic puzzles: a level picker, a fresh puzzle
// each time, a hint button, the game saved between visits.
//
// The board is a 7 x 7 grid: the nine number squares with the operators
// between them, "=" and the result at the end of every row and below
// every column. Tap an empty square, then a number below the board; tap
// the same number again (or "Clear") to empty it. A number used in
// another square moves here. Once a row or column is full it shows a
// tick or a cross next to its result.

const MC_SAVE_KEY = "einkchess_save_mathcross";

const AppStateMc = {
  level: "easy",
  puzzle: null,
  entries: [0, 0, 0, 0, 0, 0, 0, 0, 0], // the player's numbers (0 = empty)
  selected: -1,
  hintCell: -1,
  hinted: false,
  gameOver: false
};

function tMc(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusMc(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveMcGame() {
  if (typeof GameStorage === "undefined" || !AppStateMc.puzzle) return;
  GameStorage.save(MC_SAVE_KEY, {
    level: AppStateMc.level,
    puzzle: AppStateMc.puzzle,
    entries: AppStateMc.entries,
    hinted: AppStateMc.hinted
  });
}

function clearSavedMcGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(MC_SAVE_KEY);
}

function isGivenMc(i) {
  return AppStateMc.puzzle.givens.indexOf(i) !== -1;
}

// The number in a square: given or entered (0 = empty).
function valueMc(i) {
  return isGivenMc(i) ? AppStateMc.puzzle.solution[i] : AppStateMc.entries[i];
}

function opSymbolMc(op) {
  if (op === "+") return "+";
  if (op === "-") return "−";
  if (op === "*") return "×";
  return tMc("mc_div_symbol");
}

function opNameMc(op) {
  return tMc({ "+": "mc_op_plus", "-": "mc_op_minus", "*": "mc_op_times", "/": "mc_op_div" }[op]);
}

function initMcApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("mc-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-mc-game").addEventListener("click", () => startNewMcGame(levelSelect ? levelSelect.value : "easy"));
  document.getElementById("mc-hint").addEventListener("click", hintMc);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateMc.puzzle) renderMc(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(MC_SAVE_KEY) : null;
  if (saved && saved.puzzle && saved.puzzle.solution) {
    AppStateMc.level = saved.level || "easy";
    AppStateMc.puzzle = saved.puzzle;
    AppStateMc.entries = saved.entries || [0, 0, 0, 0, 0, 0, 0, 0, 0];
    AppStateMc.hinted = !!saved.hinted;
    AppStateMc.selected = -1;
    AppStateMc.hintCell = -1;
    AppStateMc.gameOver = false;
    if (levelSelect) levelSelect.value = AppStateMc.level;
    showBoardMc();
    setStatusMc("Tap an empty square, then a number.");
  }
}

function showBoardMc() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderMc();
}

function startNewMcGame(level) {
  const p = MathCrossCore.generatePuzzle(level);
  if (!p) return;
  AppStateMc.level = level;
  AppStateMc.puzzle = p;
  AppStateMc.entries = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  AppStateMc.selected = -1;
  AppStateMc.hintCell = -1;
  AppStateMc.hinted = false;
  AppStateMc.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardMc();
  setStatusMc("Tap an empty square, then a number.");
  saveMcGame();
}

/*** Input ***/

function onCellMc(i) {
  if (AppStateMc.gameOver) return;
  if (isGivenMc(i)) {
    setStatusMc("This number is given.");
    return;
  }
  AppStateMc.selected = AppStateMc.selected === i ? -1 : i;
  AppStateMc.hintCell = -1;
  if (AppStateMc.selected !== -1) setStatusMc("Now choose a number.");
  renderMc();
}

function onNumberMc(n) {
  if (AppStateMc.gameOver) return;
  const i = AppStateMc.selected;
  if (i === -1) {
    setStatusMc("Tap an empty square first.");
    return;
  }
  AppStateMc.hintCell = -1;
  const e = AppStateMc.entries;
  if (n === 0 || e[i] === n) {
    e[i] = 0;
    setStatusMc("Tap an empty square, then a number.");
  } else {
    const givenAt = AppStateMc.puzzle.givens.find((g) => AppStateMc.puzzle.solution[g] === n);
    if (givenAt !== undefined) {
      setStatusMc(n + " is already given.");
      return;
    }
    const other = e.indexOf(n);
    e[i] = n;
    if (other !== -1 && other !== i) {
      e[other] = 0;
      setStatusMc(n + " was moved here.");
    } else {
      setStatusMc("Tap an empty square, then a number.");
    }
  }
  afterMoveMc();
}

function afterMoveMc() {
  const p = AppStateMc.puzzle;
  const grid = [];
  for (let i = 0; i < 9; i++) grid.push(valueMc(i));
  if (grid.every((v) => v > 0)) {
    if (MathCrossCore.isSolution(p, grid)) {
      winMc();
      return;
    }
    setStatusMc("All squares are filled, but not every calculation works out.");
  }
  renderMc();
  saveMcGame();
}

function winMc() {
  AppStateMc.gameOver = true;
  AppStateMc.selected = -1;
  AppStateMc.hintCell = -1;
  const text = "Every row and column works out - solved!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusMc(text);
  if (typeof GameStats !== "undefined") GameStats.record("mathcross", "win", { hinted: AppStateMc.hinted });
  if (window.ResultModal) window.ResultModal.show(tMc("mc_win_title"), I18n.msg(text));
  clearSavedMcGame();
  renderMc();
}

function hintMc() {
  if (!AppStateMc.puzzle || AppStateMc.gameOver) return;
  AppStateMc.hinted = true;
  const h = MathCrossCore.findHint(AppStateMc.puzzle, AppStateMc.entries);
  if (h.kind === "wrong") {
    AppStateMc.hintCell = h.cell;
    AppStateMc.selected = h.cell;
    setStatusMc("Hint: the marked number is wrong.");
    renderMc();
  } else if (h.kind === "fill") {
    const e = AppStateMc.entries;
    const other = e.indexOf(h.value);
    if (other !== -1) e[other] = 0;
    e[h.cell] = h.value;
    AppStateMc.hintCell = h.cell;
    AppStateMc.selected = -1;
    setStatusMc("Hint: the marked square is filled in.");
    afterMoveMc();
  }
}

/*** Rendering ***/

// Tick or cross once all three squares of a line are filled.
function lineMarkMc(li) {
  const p = AppStateMc.puzzle;
  const c = MathCrossCore.LINES[li], ops = MathCrossCore.lineOps(p, li);
  const v = c.map(valueMc);
  if (v.some((x) => !x)) return "";
  return MathCrossCore.evalLine(v[0], ops[0], v[1], ops[1], v[2]) === MathCrossCore.lineRes(p, li) ? "✓" : "✗";
}

function renderMc() {
  const p = AppStateMc.puzzle;
  if (!p) return;
  const grid = document.getElementById("mc-grid");
  grid.innerHTML = "";
  const add = (cls, text, row, col) => {
    const d = document.createElement("div");
    d.className = "mc-item " + cls;
    d.style.gridRow = String(row + 1);
    d.style.gridColumn = String(col + 1);
    if (text !== undefined) d.textContent = text;
    grid.appendChild(d);
    return d;
  };
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const btn = document.createElement("button");
      btn.type = "button";
      const given = isGivenMc(i);
      const v = valueMc(i);
      btn.className = "mc-item mc-cell" + (given ? " mc-given" : "") + (AppStateMc.selected === i ? " mc-selected" : "") + (AppStateMc.hintCell === i ? " hint-cell" : "");
      btn.style.gridRow = String(r * 2 + 1);
      btn.style.gridColumn = String(c * 2 + 1);
      btn.textContent = v ? String(v) : "";
      let label = tMc("mc_aria_cell").split("{R}").join(String(r + 1)).split("{C}").join(String(c + 1)) + ": " + (v ? v : tMc("mc_aria_empty"));
      if (given) label += ", " + tMc("mc_aria_given");
      btn.setAttribute("aria-label", label);
      btn.addEventListener("click", () => onCellMc(i));
      grid.appendChild(btn);
      if (c < 2) add("mc-op", opSymbolMc(p.rowOps[r][c]), r * 2, c * 2 + 1).setAttribute("aria-label", opNameMc(p.rowOps[r][c]));
      if (r < 2) add("mc-op", opSymbolMc(p.colOps[c][r]), r * 2 + 1, c * 2).setAttribute("aria-label", opNameMc(p.colOps[c][r]));
    }
    add("mc-eq", "=", r * 2, 5);
    add("mc-res", p.rowRes[r] + (lineMarkMc(r) ? " " + lineMarkMc(r) : ""), r * 2, 6);
  }
  for (let c = 0; c < 3; c++) {
    add("mc-eq", "=", 5, c * 2);
    add("mc-res", p.colRes[c] + (lineMarkMc(3 + c) ? " " + lineMarkMc(3 + c) : ""), 6, c * 2);
  }
  renderPadMc();
  const info = document.getElementById("mc-info");
  if (info) {
    const filled = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => valueMc(i) > 0).length;
    I18n.setMsg(info, "Squares filled: " + filled + " of 9");
  }
}

function renderPadMc() {
  const pad = document.getElementById("mc-pad");
  pad.innerHTML = "";
  const used = {};
  for (let i = 0; i < 9; i++) if (valueMc(i)) used[valueMc(i)] = true;
  const sel = AppStateMc.selected;
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary mc-num" + (used[n] ? " mc-num-used" : "") + (sel !== -1 && AppStateMc.entries[sel] === n ? " mc-num-current" : "");
    btn.textContent = String(n);
    btn.disabled = AppStateMc.gameOver;
    btn.addEventListener("click", () => onNumberMc(n));
    pad.appendChild(btn);
  }
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "secondary mc-num mc-clear";
  clear.setAttribute("data-i18n", "mc_clear");
  clear.textContent = tMc("mc_clear");
  clear.disabled = AppStateMc.gameOver;
  clear.addEventListener("click", () => onNumberMc(0));
  pad.appendChild(clear);
}

document.addEventListener("DOMContentLoaded", initMcApp);
