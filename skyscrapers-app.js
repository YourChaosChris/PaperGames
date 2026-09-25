// skyscrapers-app.js
// Wires SkyscrapersCore/SkyscrapersPuzzles to the skyscrapers.html UI.
// Solitaire, like Sudoku and Kakuro - no opponent, just a difficulty
// picker and a fresh puzzle each time. The board is an (n+2)x(n+2) CSS
// grid (n varies 4/5/6 by difficulty): the inner n x n cells are the
// fillable Latin-square grid, and the outer ring holds the edge-visibility
// clue numbers, with the four corners left blank. Cell height is set by
// JS to match the measured square width, the same JS-enforced-square
// technique Sudoku/Kakuro use since CSS `aspect-ratio` is unreliable on
// E-Ink browsers.
//
// A cell that repeats a height already used in its row/column gets a
// dashed outline, same convention as Sudoku's conflict cells. A revealed
// edge clue gets no extra styling while its row/column isn't completely
// filled in yet, an underline once it's satisfied, and a dashed outline
// if the completed row/column doesn't actually match it - the same
// dashed-outline-means-conflict convention, applied to a clue instead of
// a cell. Input goes through an on-screen number pad (built for
// touchscreen e-readers that may have no physical keyboard) or the
// keyboard's digit/backspace keys once a cell is selected.

const AppStateSkyscrapers = {
  difficulty: "easy",
  n: 4,
  solution: null,     // flat n*n array, kept for save/restore parity
  clues: null,        // { top, bottom, left, right }, each length n, number | null
  grid: null,         // flat n*n array, current state (0 = empty)
  selected: null,      // cell index or null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const SKYSCRAPERS_SAVE_KEY = "einkchess_save_skyscrapers";

function saveSkyscrapersGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SKYSCRAPERS_SAVE_KEY, {
    difficulty: AppStateSkyscrapers.difficulty,
    n: AppStateSkyscrapers.n,
    solution: AppStateSkyscrapers.solution,
    clues: AppStateSkyscrapers.clues,
    grid: AppStateSkyscrapers.grid,
    moveCount: AppStateSkyscrapers.moveCount
  });
}

function clearSavedSkyscrapersGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SKYSCRAPERS_SAVE_KEY);
}

function recordSkyscrapersStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("skyscrapers", "win");
}

function setStatusSkyscrapers(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSkyscrapers(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultSkyscrapers(message) {
  setGameResultSkyscrapers(message);
  setStatusSkyscrapers("board-info", message);
  if (window.ResultModal) {
    const title = (window.I18n && I18n.t("skyscrapers_win_title")) || "Solved!";
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackSkyscrapers() {
  AppStateSkyscrapers.undoStack = [];
}

function pushUndoSnapshotSkyscrapers() {
  AppStateSkyscrapers.undoStack.push({
    grid: AppStateSkyscrapers.grid.slice(),
    moveCount: AppStateSkyscrapers.moveCount
  });
}

function initSkyscrapersApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("skyscrapers-level-inline");
  const startGameBtn = document.getElementById("start-skyscrapers-game");
  const eraseBtn = document.getElementById("skyscrapers-erase-button");

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_close");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function startNewGameSkyscrapers(difficulty) {
    setStatusSkyscrapers("offline-skyscrapers-status", (window.I18n && I18n.t("skyscrapers_generating")) || "Generating puzzle…");
    setStatusSkyscrapers("board-info", (window.I18n && I18n.t("skyscrapers_generating")) || "Generating puzzle…");
    // Generation can take up to a second or so on the largest (6x6)
    // grid, so yield a tick first to let the "Generating…" status
    // actually paint before the (synchronous) generator runs.
    setTimeout(() => {
      const puzzle = SkyscrapersPuzzles.generatePuzzle(difficulty);
      AppStateSkyscrapers.difficulty = difficulty;
      AppStateSkyscrapers.n = puzzle.n;
      AppStateSkyscrapers.solution = puzzle.solution;
      AppStateSkyscrapers.clues = puzzle.clues;
      AppStateSkyscrapers.grid = SkyscrapersCore.emptyGrid(puzzle.n);
      AppStateSkyscrapers.selected = null;
      AppStateSkyscrapers.gameOver = false;
      AppStateSkyscrapers.moveCount = 0;
      resetUndoStackSkyscrapers();
      setGameResultSkyscrapers("");
      showBoardSectionSkyscrapers();
      buildSkyscrapersBoardDOM();
      buildSkyscrapersNumpadDOM();
      updateSkyscrapersBoard();
      updateGameLabelsSkyscrapers();
      setStatusSkyscrapers("offline-skyscrapers-status", "");
      setStatusSkyscrapers("board-info", (window.I18n && I18n.t("skyscrapers_hint")) || "Select a cell, then pick a height.");
    }, 10);
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "easy";
    startNewGameSkyscrapers(difficulty);
  });

  if (eraseBtn) {
    eraseBtn.addEventListener("click", () => enterHeightSkyscrapers(0));
  }

  document.addEventListener("keydown", (e) => {
    if (AppStateSkyscrapers.selected === null || AppStateSkyscrapers.gameOver) return;
    const n = AppStateSkyscrapers.n;
    if (e.key >= "1" && e.key <= String(n)) {
      enterHeightSkyscrapers(parseInt(e.key, 10));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      enterHeightSkyscrapers(0);
    }
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SKYSCRAPERS_SAVE_KEY) : null;
  if (savedGame && savedGame.grid && savedGame.clues) {
    AppStateSkyscrapers.difficulty = savedGame.difficulty;
    AppStateSkyscrapers.n = savedGame.n;
    AppStateSkyscrapers.solution = savedGame.solution;
    AppStateSkyscrapers.clues = savedGame.clues;
    AppStateSkyscrapers.grid = savedGame.grid;
    AppStateSkyscrapers.moveCount = savedGame.moveCount;
    AppStateSkyscrapers.selected = null;
    AppStateSkyscrapers.gameOver = false;
    resetUndoStackSkyscrapers();
    if (levelInline) levelInline.value = AppStateSkyscrapers.difficulty;
    setGameResultSkyscrapers("");
    showBoardSectionSkyscrapers();
    buildSkyscrapersBoardDOM();
    buildSkyscrapersNumpadDOM();
    updateSkyscrapersBoard();
    updateGameLabelsSkyscrapers();
    setStatusSkyscrapers("board-info", (window.I18n && I18n.t("skyscrapers_hint")) || "Select a cell, then pick a height.");
  }
  // Otherwise no puzzle is pre-generated: the placeholder shows until
  // the player picks a difficulty and presses New puzzle.
}

function onSkyscrapersCellClick(index) {
  if (AppStateSkyscrapers.gameOver) return;
  AppStateSkyscrapers.selected = index;
  updateSkyscrapersBoard();
}

function enterHeightSkyscrapers(height) {
  const index = AppStateSkyscrapers.selected;
  if (index === null || AppStateSkyscrapers.gameOver) return;
  if (AppStateSkyscrapers.grid[index] === height) return;

  pushUndoSnapshotSkyscrapers();
  AppStateSkyscrapers.grid[index] = height;
  AppStateSkyscrapers.moveCount++;
  updateSkyscrapersBoard();
  updateGameLabelsSkyscrapers();

  if (SkyscrapersCore.isComplete(AppStateSkyscrapers.grid, AppStateSkyscrapers.n, AppStateSkyscrapers.clues)) {
    AppStateSkyscrapers.gameOver = true;
    const message = (window.I18n && I18n.t("skyscrapers_win_message")) || "Puzzle solved! Well done.";
    announceGameResultSkyscrapers(message);
    recordSkyscrapersStats();
    updateGameLabelsSkyscrapers();
  } else {
    setStatusSkyscrapers("board-info", (window.I18n && I18n.t("skyscrapers_hint")) || "Select a cell, then pick a height.");
  }
}

function undoLastMove() {
  if (!AppStateSkyscrapers.undoStack || !AppStateSkyscrapers.undoStack.length) return;
  const prev = AppStateSkyscrapers.undoStack.pop();
  AppStateSkyscrapers.grid = prev.grid;
  AppStateSkyscrapers.moveCount = prev.moveCount;
  setGameResultSkyscrapers("");
  updateSkyscrapersBoard();
  updateGameLabelsSkyscrapers();
  setStatusSkyscrapers("board-info", (window.I18n && I18n.t("skyscrapers_undone")) || "Move undone.");
}

function showBoardSectionSkyscrapers() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering: an (n+2)x(n+2) CSS grid - a ring of edge-clue cells
     (and 4 blank corners) around the fillable n x n interior. ***/

function makeSkyscrapersClueCell(side, index) {
  const cell = document.createElement("div");
  cell.className = "skyscrapers-cell skyscrapers-clue-cell";
  cell.dataset.side = side;
  cell.dataset.index = index;
  const span = document.createElement("span");
  span.className = "skyscrapers-clue-value";
  cell.appendChild(span);
  return cell;
}

function buildSkyscrapersBoardDOM() {
  const boardEl = document.getElementById("skyscrapers-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const n = AppStateSkyscrapers.n;
  boardEl.style.gridTemplateColumns = "repeat(" + (n + 2) + ", 1fr)";

  for (let gr = 0; gr < n + 2; gr++) {
    for (let gc = 0; gc < n + 2; gc++) {
      let cell;
      if ((gr === 0 || gr === n + 1) && (gc === 0 || gc === n + 1)) {
        cell = document.createElement("div");
        cell.className = "skyscrapers-cell skyscrapers-corner";
      } else if (gr === 0) {
        cell = makeSkyscrapersClueCell("top", gc - 1);
      } else if (gr === n + 1) {
        cell = makeSkyscrapersClueCell("bottom", gc - 1);
      } else if (gc === 0) {
        cell = makeSkyscrapersClueCell("left", gr - 1);
      } else if (gc === n + 1) {
        cell = makeSkyscrapersClueCell("right", gr - 1);
      } else {
        const r = gr - 1, c = gc - 1;
        const index = SkyscrapersCore.cellIndex(n, r, c);
        cell = document.createElement("button");
        cell.type = "button";
        cell.className = "skyscrapers-cell skyscrapers-cell-board";
        cell.dataset.index = index;
        const label = document.createElement("span");
        label.className = "skyscrapers-cell-value";
        cell.appendChild(label);
        cell.addEventListener("click", () => onSkyscrapersCellClick(index));
      }
      boardEl.appendChild(cell);
    }
  }

  ensureSkyscrapersSquareCells();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSkyscrapersSquareCells);
  } else {
    setTimeout(ensureSkyscrapersSquareCells, 0);
  }
  ensureSkyscrapersResizeHandler();
}

let einkSkyscrapersResizeHandlerAttached = false;
let einkSkyscrapersResizeTimeoutId = null;

function ensureSkyscrapersSquareCells() {
  const boardEl = document.getElementById("skyscrapers-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const n = AppStateSkyscrapers.n || 4;
  const squareSize = rect.width / (n + 2);
  boardEl.querySelectorAll(".skyscrapers-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureSkyscrapersResizeHandler() {
  if (einkSkyscrapersResizeHandlerAttached) return;
  einkSkyscrapersResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSkyscrapersResizeTimeoutId !== null) clearTimeout(einkSkyscrapersResizeTimeoutId);
    einkSkyscrapersResizeTimeoutId = setTimeout(() => {
      einkSkyscrapersResizeTimeoutId = null;
      ensureSkyscrapersSquareCells();
    }, 150);
  });
}

function buildSkyscrapersNumpadDOM() {
  const el = document.getElementById("skyscrapers-numpad");
  if (!el) return;
  el.innerHTML = "";
  for (let d = 1; d <= AppStateSkyscrapers.n; d++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "skyscrapers-numpad-btn";
    btn.textContent = String(d);
    btn.addEventListener("click", () => enterHeightSkyscrapers(d));
    el.appendChild(btn);
  }
}

function updateSkyscrapersBoard() {
  const boardEl = document.getElementById("skyscrapers-board");
  if (!boardEl) return;
  const n = AppStateSkyscrapers.n;
  const grid = AppStateSkyscrapers.grid;
  const clues = AppStateSkyscrapers.clues;
  const conflicts = SkyscrapersCore.findConflicts(grid, n);
  const statuses = SkyscrapersCore.clueStatuses(grid, n, clues);
  const selected = AppStateSkyscrapers.selected;

  boardEl.querySelectorAll(".skyscrapers-cell-board").forEach((cell) => {
    const index = parseInt(cell.dataset.index, 10);
    const value = grid[index];
    const label = cell.querySelector(".skyscrapers-cell-value");
    if (label) label.textContent = value ? String(value) : "";

    cell.classList.toggle("selected", selected === index);
    cell.classList.toggle("skyscrapers-cell-conflict", conflicts.has(index));

    const r = Math.floor(index / n), c = index % n;
    let label2 = "Row " + (r + 1) + ", column " + (c + 1);
    label2 += value ? ", height " + value : ", empty";
    if (conflicts.has(index)) label2 += ", conflict";
    cell.setAttribute("aria-label", label2);
  });

  boardEl.querySelectorAll(".skyscrapers-clue-cell").forEach((cell) => {
    const side = cell.dataset.side;
    const i = parseInt(cell.dataset.index, 10);
    const value = clues[side][i];
    const label = cell.querySelector(".skyscrapers-clue-value");
    if (label) label.textContent = value === null ? "" : String(value);
    const status = statuses[side][i];
    cell.classList.toggle("skyscrapers-clue-ok", status === "ok");
    cell.classList.toggle("skyscrapers-clue-violated", status === "violated");
    if (value !== null) {
      let label2 = side + " clue, " + value;
      if (status === "ok") label2 += ", satisfied";
      else if (status === "violated") label2 += ", not satisfied";
      cell.setAttribute("aria-label", label2);
    } else {
      cell.removeAttribute("aria-label");
    }
  });
}

function updateGameLabelsSkyscrapers() {
  const meta = document.getElementById("game-meta");
  if (meta) {
    if (AppStateSkyscrapers.grid) {
      const total = AppStateSkyscrapers.n * AppStateSkyscrapers.n;
      const filled = AppStateSkyscrapers.grid.filter((v) => v !== 0).length;
      I18n.setMsg(meta, filled + " / " + total + " filled");
    } else {
      meta.textContent = "";
    }
  }
  updateUndoButtonVisibilitySkyscrapers();
  updateEraseButtonVisibilitySkyscrapers();

  if (AppStateSkyscrapers.gameOver) clearSavedSkyscrapersGame();
  else saveSkyscrapersGame();
}

function updateUndoButtonVisibilitySkyscrapers() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSkyscrapers.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSkyscrapers.gameOver));
}

function updateEraseButtonVisibilitySkyscrapers() {
  const btn = document.getElementById("skyscrapers-erase-button");
  if (btn) btn.classList.toggle("hidden", AppStateSkyscrapers.gameOver || !AppStateSkyscrapers.grid);
}

document.addEventListener("DOMContentLoaded", initSkyscrapersApp);
