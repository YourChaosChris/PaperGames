// animalsudoku-app.js
// Wires AnimalSudokuCore ("Animal Sudoku") to animalsudoku.html. Solitaire
// like the other puzzles: size (4 x 4 or 6 x 6) and level, a fresh puzzle
// each time, a hint button, the game saved between visits.
//
// Input like "Who Took the Cake?": pick an animal in the row of buttons
// under the board (or the eraser), then tap a cell. Tapping a cell again
// with the same animal takes it off. Animals that are part of the puzzle
// have a heavy inner frame and can't be changed; an animal that repeats
// in a row, column or box gets a dashed frame (as in Sudoku) - shapes,
// never grey. The animals are the line drawings of pairs-animals.js.
//
// Status texts are English sentences that I18n.msg translates (the
// msg_t_animalsudoku_* templates; animal names through the
// msg_pairs_animal_* keys).

const AppStateAnimalSudoku = {
  size: 4,
  level: "easy",
  puzzle: null,
  solution: null,
  grid: null,
  tool: 1,            // animal value 1..n, or 0 = eraser
  hinted: false,
  hintCells: [],
  gameOver: false
};

const ANIMALSUDOKU_SAVE_KEY = "einkchess_save_animalsudoku";
const ANIMALSUDOKU_EN = { dog: "Dog", cat: "Cat", rabbit: "Rabbit", mouse: "Mouse", owl: "Owl", fish: "Fish" };

// Three presses per step, as in Sudoku: mark the cell, say why, place it.
const animalSudokuHintSession = (function () {
  let key = null, stage = 0, hint = null;
  return {
    next(stateKey, compute) {
      if (stateKey !== key || !hint || hint.kind !== "step" || stage >= 3) {
        key = stateKey;
        hint = compute();
        stage = 1;
      } else {
        stage++;
      }
      return { hint, stage };
    },
    reset() { key = null; stage = 0; hint = null; }
  };
})();

function animalNameEn(v) {
  return ANIMALSUDOKU_EN[AnimalSudokuCore.ANIMALS[v - 1]];
}

function animalSvg(v, cls) {
  const name = AnimalSudokuCore.ANIMALS[v - 1];
  const idx = typeof PairsAnimals !== "undefined" ? PairsAnimals.NAMES.indexOf(name) : -1;
  return idx >= 0 ? PairsAnimals.svg(idx, cls) : "";
}

function setStatusAnimalSudoku(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveAnimalSudokuGame() {
  if (typeof GameStorage === "undefined" || !AppStateAnimalSudoku.puzzle) return;
  const s = AppStateAnimalSudoku;
  GameStorage.save(ANIMALSUDOKU_SAVE_KEY, { size: s.size, level: s.level, puzzle: s.puzzle, solution: s.solution, grid: s.grid, hinted: s.hinted });
}

function clearSavedAnimalSudokuGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(ANIMALSUDOKU_SAVE_KEY);
}

function initAnimalSudokuApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const sizeSelect = document.getElementById("animalsudoku-size");
  const levelSelect = document.getElementById("animalsudoku-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-animalsudoku-game").addEventListener("click", () => {
    startNewAnimalSudoku(parseInt(sizeSelect.value, 10) === 6 ? 6 : 4, levelSelect.value);
  });
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.addEventListener("click", hintAnimalSudoku);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(renderAnimalSudokuPalette);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ANIMALSUDOKU_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.grid) && Array.isArray(saved.puzzle) && (saved.size === 4 || saved.size === 6)) {
    const s = AppStateAnimalSudoku;
    s.size = saved.size;
    s.level = saved.level || "easy";
    s.puzzle = saved.puzzle;
    s.solution = saved.solution;
    s.grid = saved.grid;
    s.hinted = !!saved.hinted;
    s.tool = 1;
    s.gameOver = false;
    if (sizeSelect) sizeSelect.value = String(s.size);
    if (levelSelect) levelSelect.value = s.level;
    showAnimalSudokuBoard();
    buildAnimalSudokuBoard();
    setStatusAnimalSudoku("Choose an animal below, then tap a cell.");
  }
}

function startNewAnimalSudoku(size, level) {
  const p = AnimalSudokuCore.generatePuzzle(size, level);
  const s = AppStateAnimalSudoku;
  s.size = p.n;
  s.level = level;
  s.puzzle = p.puzzle;
  s.solution = p.solution;
  s.grid = p.puzzle.slice();
  s.tool = 1;
  s.hinted = false;
  s.hintCells = [];
  s.gameOver = false;
  animalSudokuHintSession.reset();
  if (window.ResultModal) window.ResultModal.hide();
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  showAnimalSudokuBoard();
  buildAnimalSudokuBoard();
  setStatusAnimalSudoku("Choose an animal below, then tap a cell.");
  saveAnimalSudokuGame();
}

function showAnimalSudokuBoard() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board ***/

function buildAnimalSudokuBoard() {
  const s = AppStateAnimalSudoku;
  const n = s.size;
  const boardEl = document.getElementById("animalsudoku-board");
  boardEl.innerHTML = "";
  boardEl.className = "animalsudoku-board animalsudoku-board-" + n;
  const cfg = AnimalSudokuCore.SIZES[n];
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "square animalsudoku-cell";
    cell.setAttribute("data-i18n-attr", "");
    cell.dataset.index = i;
    cell.style.width = (100 / n) + "%";
    if (r % cfg.boxRows === 0 && r > 0) cell.classList.add("animalsudoku-box-t");
    if (c % cfg.boxCols === 0 && c > 0) cell.classList.add("animalsudoku-box-l");
    cell.addEventListener("click", () => onAnimalSudokuCellClick(i));
    boardEl.appendChild(cell);
  }
  buildAnimalSudokuPalette();
  sizeAnimalSudokuBoard();
  if (window.requestAnimationFrame) window.requestAnimationFrame(sizeAnimalSudokuBoard);
  if (!buildAnimalSudokuBoard.resizeAttached) {
    buildAnimalSudokuBoard.resizeAttached = true;
    let timer = null;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(sizeAnimalSudokuBoard, 150);
    });
  }
  renderAnimalSudoku();
}

// Square cells by explicit pixel height (no CSS aspect-ratio on e-ink).
function sizeAnimalSudokuBoard() {
  const boardEl = document.getElementById("animalsudoku-board");
  const s = AppStateAnimalSudoku;
  if (!boardEl || !s.grid) return;
  const w = boardEl.getBoundingClientRect().width;
  if (!w) return;
  const frame = boardEl.offsetWidth - boardEl.clientWidth;
  const size = Math.floor((w - frame) / s.size);
  boardEl.querySelectorAll(".animalsudoku-cell").forEach((cell) => { cell.style.height = size + "px"; });
  boardEl.style.height = (size * s.size + frame) + "px";
}

function buildAnimalSudokuPalette() {
  const s = AppStateAnimalSudoku;
  const el = document.getElementById("animalsudoku-palette");
  el.innerHTML = "";
  const tools = [];
  for (let v = 1; v <= s.size; v++) tools.push(v);
  tools.push(0);
  tools.forEach((tool) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary cake-pick";
    btn.setAttribute("data-i18n-attr", "");
    btn.dataset.tool = String(tool);
    const icon = tool ? animalSvg(tool, "cake-pick-icon") : (typeof CakeIcons !== "undefined" ? CakeIcons.svg("x", "cake-pick-icon") : "");
    btn.innerHTML = icon + '<span class="cake-pick-name"></span>';
    btn.addEventListener("click", () => {
      AppStateAnimalSudoku.tool = tool;
      renderAnimalSudokuPalette();
    });
    el.appendChild(btn);
  });
  renderAnimalSudokuPalette();
}

function renderAnimalSudokuPalette() {
  document.querySelectorAll("#animalsudoku-palette .cake-pick").forEach((btn) => {
    const tool = parseInt(btn.dataset.tool, 10);
    const name = tool ? I18n.t("msg_pairs_animal_" + AnimalSudokuCore.ANIMALS[tool - 1]) : I18n.t("animalsudoku_erase");
    btn.querySelector(".cake-pick-name").textContent = name;
    const on = AppStateAnimalSudoku.tool === tool;
    btn.classList.toggle("cake-pick-selected", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", name);
  });
}

function renderAnimalSudoku() {
  const s = AppStateAnimalSudoku;
  if (!s.grid) return;
  const n = s.size;
  const bad = AnimalSudokuCore.conflicts(n, s.grid);
  document.querySelectorAll("#animalsudoku-board .animalsudoku-cell").forEach((cell) => {
    const i = parseInt(cell.dataset.index, 10);
    const v = s.grid[i];
    const given = !!s.puzzle[i];
    const view = v + (given ? "g" : "");
    if (cell.dataset.view !== view) {
      cell.dataset.view = view;
      cell.innerHTML = v ? animalSvg(v, "animalsudoku-animal") : "";
    }
    cell.classList.toggle("animalsudoku-given", given);
    cell.classList.toggle("animalsudoku-conflict", bad.has(i));
    cell.classList.toggle("hint-cell", s.hintCells.indexOf(i) !== -1);
    let label = "Row " + (Math.floor(i / n) + 1) + ", column " + (i % n + 1);
    label += v ? ", " + animalNameEn(v) + (given ? ", given" : "") : ", empty";
    if (bad.has(i)) label += ", conflict";
    I18n.setAria(cell, label);
  });
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Placed: " + s.grid.filter((x) => x).length + " / " + n * n);
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", s.gameOver);
}

/*** Moves ***/

function onAnimalSudokuCellClick(i) {
  const s = AppStateAnimalSudoku;
  if (!s.grid || s.gameOver) return;
  if (s.puzzle[i]) {
    setStatusAnimalSudoku("This animal is part of the puzzle and stays.");
    return;
  }
  s.hintCells = [];
  animalSudokuHintSession.reset();
  const tool = s.tool;
  s.grid[i] = tool && s.grid[i] !== tool ? tool : 0;
  afterAnimalSudokuMove();
}

function afterAnimalSudokuMove() {
  const s = AppStateAnimalSudoku;
  if (AnimalSudokuCore.isSolved(s.size, s.grid, s.solution)) {
    s.gameOver = true;
    s.hintCells = [];
    renderAnimalSudoku();
    const text = "Solved! Every animal is in its place.";
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    setStatusAnimalSudoku(text);
    if (typeof GameStats !== "undefined") GameStats.record("animalsudoku", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("msg_solved"), I18n.msg("Every animal is in its place."));
    clearSavedAnimalSudokuGame();
    return;
  }
  renderAnimalSudoku();
  saveAnimalSudokuGame();
}

/*** Hint ***/

function describeAnimalSudokuHint(h, stage) {
  const n = AppStateAnimalSudoku.size;
  const r = Math.floor((h.cell || 0) / n) + 1, c = (h.cell || 0) % n + 1;
  if (h.kind === "conflict") return "Some animals appear twice in a row, column or box. The cells are marked.";
  if (h.kind === "wrong") return "The animal in row " + r + ", column " + c + " does not belong there. Remove it, then ask for a hint again.";
  if (h.kind !== "step") return "";
  const name = animalNameEn(h.value);
  if (stage === 3) return "Placed: " + name + " in row " + r + ", column " + c + ".";
  if (h.tech === "hidden") {
    if (stage === 1) {
      if (h.unit.kind === "row") return "In row " + r + ", one animal has only one cell left. The cell is marked.";
      if (h.unit.kind === "column") return "In column " + c + ", one animal has only one cell left. The cell is marked.";
      return "In this box, one animal has only one cell left. The cell is marked.";
    }
    return "Still missing there: " + name + ". Every other free cell is ruled out for it, so it goes in the marked cell.";
  }
  if (stage === 1) return "Only one animal fits the marked cell (row " + r + ", column " + c + ").";
  return "Its row, column and box already hold every other animal. Only one is left: " + name + ".";
}

function hintAnimalSudoku() {
  const s = AppStateAnimalSudoku;
  if (!s.grid || s.gameOver) return;
  s.hinted = true;
  const res = animalSudokuHintSession.next(s.grid.join(""), () => AnimalSudokuCore.findHint(s.size, s.grid, s.solution));
  const h = res.hint;
  const text = describeAnimalSudokuHint(h, res.stage);
  if (h.kind === "step" && res.stage === 3) {
    s.grid[h.cell] = h.value;
    s.hintCells = [h.cell];
    animalSudokuHintSession.reset();
    afterAnimalSudokuMove();
    if (!s.gameOver) setStatusAnimalSudoku(text);
    return;
  }
  if (h.kind === "conflict") s.hintCells = h.cells.slice();
  else if (h.kind === "wrong" || h.kind === "step") s.hintCells = [h.cell];
  else s.hintCells = [];
  renderAnimalSudoku();
  setStatusAnimalSudoku(text);
  saveAnimalSudokuGame();
}

document.addEventListener("DOMContentLoaded", initAnimalSudokuApp);
