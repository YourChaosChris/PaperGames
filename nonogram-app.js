// nonogram-app.js
// Wires NonogramCore/NonogramPuzzles to the nonogram.html UI. Solitaire,
// like Sudoku, Peg Solitaire and Minesweeper - no opponent, no AI, just
// a difficulty picker that randomly serves one of that difficulty's
// curated pictures.
//
// The board is a CSS grid rather than the usual float-grid: a Nonogram
// needs a row of column clues above the picture and a column of row
// clues to its left, in addition to the picture cells themselves, so a
// simple square-per-cell float layout doesn't fit the shape of the
// puzzle. Two input modes - Fill and Mark X - share a single tap/click,
// since a touchscreen e-reader has no modifier key to hold down like a
// desktop right-click-to-cross-out convention would need.

const AppStateNonogram = {
  difficulty: "medium",
  puzzleName: "",
  solution: null,     // 2D boolean grid
  clues: null,         // { rows: [[...]], cols: [[...]] }
  playerGrid: null,    // 2D "empty" | "filled" | "marked"
  mode: "fill",        // "fill" | "mark"
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  isDaily: false
};

const NONOGRAM_SAVE_KEY = "einkchess_save_nonogram";

function saveNonogramGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(NONOGRAM_SAVE_KEY, {
    difficulty: AppStateNonogram.difficulty,
    puzzleName: AppStateNonogram.puzzleName,
    solution: AppStateNonogram.solution,
    playerGrid: AppStateNonogram.playerGrid,
    moveCount: AppStateNonogram.moveCount
  });
}

function clearSavedNonogramGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(NONOGRAM_SAVE_KEY);
}

function recordNonogramStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("nonogram", "win");
}

function setStatusNonogram(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultNonogram(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultNonogram(message) {
  setGameResultNonogram(message);
  setStatusNonogram("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Solved!", message);
  }
}

function resetUndoStackNonogram() {
  AppStateNonogram.undoStack = [];
}

function pushUndoSnapshotNonogram() {
  AppStateNonogram.undoStack.push({
    playerGrid: AppStateNonogram.playerGrid.map((row) => row.slice()),
    moveCount: AppStateNonogram.moveCount
  });
}

function initNonogramApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("nonogram-level-inline");
  const startGameBtn = document.getElementById("start-nonogram-game");
  const modeFillBtn = document.getElementById("nonogram-mode-fill");
  const modeMarkBtn = document.getElementById("nonogram-mode-mark");

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

  function setModeNonogram(mode) {
    AppStateNonogram.mode = mode;
    if (modeFillBtn) modeFillBtn.classList.toggle("active-mode", mode === "fill");
    if (modeMarkBtn) modeMarkBtn.classList.toggle("active-mode", mode === "mark");
  }

  if (modeFillBtn) modeFillBtn.addEventListener("click", () => setModeNonogram("fill"));
  if (modeMarkBtn) modeMarkBtn.addEventListener("click", () => setModeNonogram("mark"));

  function startNewGameNonogram(difficulty, isDaily) {
    const pool = NonogramPuzzles[difficulty] || NonogramPuzzles.medium;
    const index = isDaily
      ? DailyChallenge.nonogramIndexForToday("nonogram-" + difficulty, pool.length)
      : Math.floor(Math.random() * pool.length);
    const chosen = pool[index];
    const solution = nonogramGridFromStrings(chosen.grid);

    AppStateNonogram.difficulty = difficulty;
    AppStateNonogram.puzzleName = chosen.name;
    AppStateNonogram.solution = solution;
    AppStateNonogram.clues = NonogramCore.computeClues(solution);
    AppStateNonogram.playerGrid = NonogramCore.createEmptyPlayerGrid(solution.length, solution[0].length);
    AppStateNonogram.isDaily = !!isDaily;
    AppStateNonogram.gameOver = false;
    AppStateNonogram.moveCount = 0;
    resetUndoStackNonogram();
    setModeNonogram("fill");
    setGameResultNonogram("");
    showBoardSectionNonogram();
    buildNonogramBoardDOM();
    updateNonogramBoard();
    updateGameLabelsNonogram();
    setStatusNonogram("board-info", isDaily
      ? "Daily Challenge (" + DailyChallenge.todayKey() + "). Fill in the cells the clues describe."
      : "Fill in the cells the clues describe.");
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameNonogram(difficulty);
  });

  const dailyBtn = document.getElementById("daily-nonogram-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      const difficulty = levelInline ? levelInline.value : "medium";
      startNewGameNonogram(difficulty, true);
    });
  }

  const printBtn = document.getElementById("print-puzzle-button");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(NONOGRAM_SAVE_KEY) : null;
  if (savedGame && savedGame.solution) {
    AppStateNonogram.difficulty = savedGame.difficulty;
    AppStateNonogram.puzzleName = savedGame.puzzleName;
    AppStateNonogram.solution = savedGame.solution;
    AppStateNonogram.clues = NonogramCore.computeClues(savedGame.solution);
    AppStateNonogram.playerGrid = savedGame.playerGrid;
    AppStateNonogram.moveCount = savedGame.moveCount;
    AppStateNonogram.gameOver = false;
    resetUndoStackNonogram();
    if (levelInline) levelInline.value = AppStateNonogram.difficulty;
    setModeNonogram("fill");
    setGameResultNonogram("");
    showBoardSectionNonogram();
    buildNonogramBoardDOM();
    updateNonogramBoard();
    updateGameLabelsNonogram();
    setStatusNonogram("board-info", "Fill in the cells the clues describe.");
  }
  // Otherwise no puzzle is pre-picked: the placeholder shows until the
  // player picks a difficulty and presses New puzzle.
}

function onNonogramCellClick(r, c) {
  if (AppStateNonogram.gameOver) return;
  pushUndoSnapshotNonogram();
  const current = AppStateNonogram.playerGrid[r][c];
  const target = AppStateNonogram.mode === "fill" ? "filled" : "marked";
  AppStateNonogram.playerGrid[r][c] = current === target ? "empty" : target;
  AppStateNonogram.moveCount++;
  updateNonogramBoard();
  updateGameLabelsNonogram();

  if (NonogramCore.checkSolved(AppStateNonogram.playerGrid, AppStateNonogram.solution)) {
    AppStateNonogram.gameOver = true;
    announceGameResultNonogram("Solved “" + AppStateNonogram.puzzleName + "” - well done!");
    recordNonogramStats();
    updateGameLabelsNonogram();
  } else {
    setStatusNonogram("board-info", "Fill in the cells the clues describe.");
  }
}

function undoLastMove() {
  if (!AppStateNonogram.undoStack || !AppStateNonogram.undoStack.length) return;
  const prev = AppStateNonogram.undoStack.pop();
  AppStateNonogram.playerGrid = prev.playerGrid;
  AppStateNonogram.moveCount = prev.moveCount;
  setGameResultNonogram("");
  updateNonogramBoard();
  updateGameLabelsNonogram();
  setStatusNonogram("board-info", "Move undone.");
}

function showBoardSectionNonogram() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (CSS grid: clue headers + picture cells) ***/

function buildNonogramBoardDOM() {
  const gridEl = document.getElementById("nonogram-grid");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  const rows = AppStateNonogram.solution.length;
  const cols = AppStateNonogram.solution[0].length;
  const clues = AppStateNonogram.clues;
  const maxRowClueLen = Math.max(...clues.rows.map((c) => c.length));
  const maxColClueLen = Math.max(...clues.cols.map((c) => c.length));

  gridEl.style.gridTemplateColumns = "minmax(2.4em, auto) repeat(" + cols + ", 1fr)";
  gridEl.style.gridTemplateRows = "minmax(1.6em, auto) repeat(" + rows + ", 1fr)";

  const corner = document.createElement("div");
  corner.className = "nonogram-corner";
  gridEl.appendChild(corner);

  for (let c = 0; c < cols; c++) {
    const clueEl = document.createElement("div");
    clueEl.className = "nonogram-clue nonogram-clue-col";
    clueEl.dataset.col = c;
    clues.cols[c].forEach((n) => {
      const span = document.createElement("span");
      span.textContent = n === 0 ? "" : String(n);
      clueEl.appendChild(span);
    });
    gridEl.appendChild(clueEl);
  }

  for (let r = 0; r < rows; r++) {
    const rowClueEl = document.createElement("div");
    rowClueEl.className = "nonogram-clue nonogram-clue-row";
    rowClueEl.dataset.row = r;
    clues.rows[r].forEach((n) => {
      const span = document.createElement("span");
      span.textContent = n === 0 ? "" : String(n);
      rowClueEl.appendChild(span);
    });
    gridEl.appendChild(rowClueEl);

    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "nonogram-cell";
      if (c % 5 === 0) cell.classList.add("nonogram-cell-block-left");
      if (r % 5 === 0) cell.classList.add("nonogram-cell-block-top");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => onNonogramCellClick(r, c));
      gridEl.appendChild(cell);
    }
  }
}

function updateNonogramBoard() {
  const gridEl = document.getElementById("nonogram-grid");
  if (!gridEl) return;
  gridEl.querySelectorAll(".nonogram-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const value = AppStateNonogram.playerGrid[r][c];
    cell.classList.toggle("nonogram-cell-filled", value === "filled");
    cell.classList.toggle("nonogram-cell-marked", value === "marked");
    cell.textContent = value === "marked" ? "×" : "";
    let label = "Row " + (r + 1) + ", column " + (c + 1) + ", " + value;
    cell.setAttribute("aria-label", label);
  });
}

function updateGameLabelsNonogram() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateNonogram.puzzleName ? AppStateNonogram.puzzleName : "";
  updateUndoButtonVisibilityNonogram();

  if (AppStateNonogram.gameOver) clearSavedNonogramGame();
  else saveNonogramGame();
}

function updateUndoButtonVisibilityNonogram() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateNonogram.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateNonogram.gameOver));
}

document.addEventListener("DOMContentLoaded", initNonogramApp);
