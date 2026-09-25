// sudoku-app.js
// Wires SudokuCore to the sudoku.html UI. Unlike every other game here,
// Sudoku is solitaire - no opponent, no color choice, just a difficulty
// picker and a fresh puzzle each time. The board is a 9x9 float-grid
// (same technique as the chess/checkers/Connect Four boards - a
// JS-enforced square cell size, since CSS `aspect-ratio` is unreliable
// on E-Ink browsers), with thicker borders marking the 3x3 boxes.
//
// Given (pre-filled) cells are bold and locked; a conflicting entry
// (the same digit twice in a row, column, or box) gets a dashed border
// instead of a color, so the distinction still reads on a monochrome
// E-Ink display. Input goes through an on-screen number pad (built for
// touchscreen e-readers that may have no physical keyboard) or the
// keyboard's digit/backspace keys once a cell is focused.

const AppStateSudoku = {
  difficulty: "medium",
  isDaily: false,    // true when the current puzzle is today's Daily Challenge
  puzzle: null,      // the original generated puzzle (0 = empty givens)
  solution: null,
  grid: null,        // current state, including the player's entries
  givenMask: null,   // true = pre-filled, not editable
  selected: null,    // cell index or null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const SUDOKU_SAVE_KEY = "einkchess_save_sudoku";

function saveSudokuGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SUDOKU_SAVE_KEY, {
    difficulty: AppStateSudoku.difficulty,
    puzzle: AppStateSudoku.puzzle,
    solution: AppStateSudoku.solution,
    grid: AppStateSudoku.grid,
    moveCount: AppStateSudoku.moveCount
  });
}

function clearSavedSudokuGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SUDOKU_SAVE_KEY);
}

function recordSudokuStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("sudoku", "win");
}

function setStatusSudoku(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSudoku(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultSudoku(message) {
  setGameResultSudoku(message);
  setStatusSudoku("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Solved!", message);
  }
}

function resetUndoStackSudoku() {
  AppStateSudoku.undoStack = [];
}

function pushUndoSnapshotSudoku() {
  AppStateSudoku.undoStack.push({
    grid: AppStateSudoku.grid.slice(),
    moveCount: AppStateSudoku.moveCount
  });
}

function initSudokuApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("sudoku-level-inline");
  const startGameBtn = document.getElementById("start-sudoku-game");
  const eraseBtn = document.getElementById("sudoku-erase-button");

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

  function startNewGameSudoku(difficulty, rng, isDaily) {
    setStatusSudoku("offline-sudoku-status", "Generating puzzle…");
    setStatusSudoku("board-info", "Generating puzzle…");
    // Generation is a few milliseconds even on "hard", but yielding a
    // tick keeps the "Generating…" status visible instead of the click
    // feeling unresponsive.
    setTimeout(() => {
      const { puzzle, solution } = SudokuCore.generatePuzzle(difficulty, rng);
      AppStateSudoku.difficulty = difficulty;
      AppStateSudoku.isDaily = !!isDaily;
      AppStateSudoku.puzzle = puzzle;
      AppStateSudoku.solution = solution;
      AppStateSudoku.grid = puzzle.slice();
      AppStateSudoku.givenMask = puzzle.map((v) => v !== 0);
      AppStateSudoku.selected = null;
      AppStateSudoku.gameOver = false;
      AppStateSudoku.moveCount = 0;
      resetUndoStackSudoku();
      setGameResultSudoku("");
      showBoardSectionSudoku();
      buildSudokuBoardDOM();
      buildSudokuNumpadDOM();
      updateSudokuBoard();
      updateGameLabelsSudoku();
      setStatusSudoku("offline-sudoku-status", "");
      setStatusSudoku("board-info", isDaily
        ? "Daily Challenge (" + DailyChallenge.todayKey() + "). Select a cell, then pick a number."
        : "Select a cell, then pick a number.");
    }, 10);
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameSudoku(difficulty);
  });

  const dailyBtn = document.getElementById("daily-sudoku-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      startNewGameSudoku("medium", DailyChallenge.makeTodaysRng("sudoku"), true);
    });
  }

  const printBtn = document.getElementById("print-puzzle-button");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  if (eraseBtn) {
    eraseBtn.addEventListener("click", () => enterDigitSudoku(0));
  }

  document.addEventListener("keydown", (e) => {
    if (AppStateSudoku.selected === null || AppStateSudoku.gameOver) return;
    if (e.key >= "1" && e.key <= "9") {
      enterDigitSudoku(parseInt(e.key, 10));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      enterDigitSudoku(0);
    }
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SUDOKU_SAVE_KEY) : null;
  if (savedGame && savedGame.puzzle) {
    AppStateSudoku.difficulty = savedGame.difficulty;
    AppStateSudoku.puzzle = savedGame.puzzle;
    AppStateSudoku.solution = savedGame.solution;
    AppStateSudoku.grid = savedGame.grid;
    AppStateSudoku.givenMask = savedGame.puzzle.map((v) => v !== 0);
    AppStateSudoku.moveCount = savedGame.moveCount;
    AppStateSudoku.selected = null;
    AppStateSudoku.gameOver = false;
    resetUndoStackSudoku();
    if (levelInline) levelInline.value = AppStateSudoku.difficulty;
    setGameResultSudoku("");
    showBoardSectionSudoku();
    buildSudokuBoardDOM();
    buildSudokuNumpadDOM();
    updateSudokuBoard();
    updateGameLabelsSudoku();
    setStatusSudoku("board-info", "Select a cell, then pick a number.");
  }
  // Otherwise no puzzle is pre-generated: the placeholder shows until
  // the player picks a difficulty and presses New puzzle.
}

function onSudokuCellClick(index) {
  if (AppStateSudoku.gameOver) return;
  if (AppStateSudoku.givenMask[index]) {
    AppStateSudoku.selected = null;
  } else {
    AppStateSudoku.selected = index;
  }
  updateSudokuBoard();
}

function enterDigitSudoku(digit) {
  const index = AppStateSudoku.selected;
  if (index === null || AppStateSudoku.gameOver) return;
  if (AppStateSudoku.givenMask[index]) return;
  if (AppStateSudoku.grid[index] === digit) return;

  pushUndoSnapshotSudoku();
  AppStateSudoku.grid[index] = digit;
  AppStateSudoku.moveCount++;
  updateSudokuBoard();
  updateGameLabelsSudoku();

  if (SudokuCore.isComplete(AppStateSudoku.grid)) {
    AppStateSudoku.gameOver = true;
    announceGameResultSudoku("Puzzle solved! Well done.");
    recordSudokuStats();
    updateGameLabelsSudoku();
  } else {
    setStatusSudoku("board-info", "Select a cell, then pick a number.");
  }
}

function undoLastMove() {
  if (!AppStateSudoku.undoStack || !AppStateSudoku.undoStack.length) return;
  const prev = AppStateSudoku.undoStack.pop();
  AppStateSudoku.grid = prev.grid;
  AppStateSudoku.moveCount = prev.moveCount;
  setGameResultSudoku("");
  updateSudokuBoard();
  updateGameLabelsSudoku();
  setStatusSudoku("board-info", "Move undone.");
}

function showBoardSectionSudoku() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as chess/checkers/Connect Four) ***/

function buildSudokuBoardDOM() {
  const boardEl = document.getElementById("sudoku-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const index = r * 9 + c;
      const cell = document.createElement("button");
      cell.className = "square sudoku-cell";
      cell.type = "button";
      cell.dataset.index = index;
      if (c % 3 === 0) cell.classList.add("sudoku-box-left");
      if (c === 8) cell.classList.add("sudoku-box-right");
      if (r % 3 === 0) cell.classList.add("sudoku-box-top");
      if (r === 8) cell.classList.add("sudoku-box-bottom");

      const label = document.createElement("span");
      label.className = "sudoku-cell-value";
      cell.appendChild(label);

      cell.addEventListener("click", () => onSudokuCellClick(index));
      boardEl.appendChild(cell);
    }
  }

  ensureSudokuSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSudokuSquareAspectRatio);
  } else {
    setTimeout(ensureSudokuSquareAspectRatio, 0);
  }
  ensureSudokuResizeHandler();
}

let einkSudokuResizeHandlerAttached = false;
let einkSudokuResizeTimeoutId = null;

function ensureSudokuSquareAspectRatio() {
  const boardEl = document.getElementById("sudoku-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / 9;
  boardEl.querySelectorAll(".sudoku-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureSudokuResizeHandler() {
  if (einkSudokuResizeHandlerAttached) return;
  einkSudokuResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSudokuResizeTimeoutId !== null) clearTimeout(einkSudokuResizeTimeoutId);
    einkSudokuResizeTimeoutId = setTimeout(() => {
      einkSudokuResizeTimeoutId = null;
      ensureSudokuSquareAspectRatio();
    }, 150);
  });
}

function buildSudokuNumpadDOM() {
  const el = document.getElementById("sudoku-numpad");
  if (!el) return;
  el.innerHTML = "";
  for (let d = 1; d <= 9; d++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sudoku-numpad-btn";
    btn.textContent = String(d);
    btn.addEventListener("click", () => enterDigitSudoku(d));
    el.appendChild(btn);
  }
}

function updateSudokuBoard() {
  const boardEl = document.getElementById("sudoku-board");
  if (!boardEl) return;
  const conflicts = SudokuCore.findConflicts(AppStateSudoku.grid);

  boardEl.querySelectorAll(".sudoku-cell").forEach((cell) => {
    const index = parseInt(cell.dataset.index, 10);
    const value = AppStateSudoku.grid[index];
    const isGiven = AppStateSudoku.givenMask[index];
    const label = cell.querySelector(".sudoku-cell-value");
    if (label) label.textContent = value ? String(value) : "";

    cell.classList.toggle("sudoku-cell-given", isGiven);
    cell.classList.toggle("selected", AppStateSudoku.selected === index);
    cell.classList.toggle("sudoku-cell-conflict", conflicts.has(index));

    let label2 = "Row " + (Math.floor(index / 9) + 1) + ", column " + (index % 9 + 1);
    label2 += value ? ", " + value + (isGiven ? " (given)" : "") : ", empty";
    if (conflicts.has(index)) label2 += ", conflict";
    I18n.setAria(cell, label2);
  });
}

function updateGameLabelsSudoku() {
  const meta = document.getElementById("game-meta");
  const filled = AppStateSudoku.grid ? AppStateSudoku.grid.filter((v) => v !== 0).length : 0;
  if (meta) I18n.setMsg(meta, AppStateSudoku.grid ? filled + " / 81 filled" : "");
  updateUndoButtonVisibilitySudoku();
  updateEraseButtonVisibilitySudoku();

  if (AppStateSudoku.gameOver) clearSavedSudokuGame();
  else saveSudokuGame();
}

function updateUndoButtonVisibilitySudoku() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSudoku.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSudoku.gameOver));
}

function updateEraseButtonVisibilitySudoku() {
  const btn = document.getElementById("sudoku-erase-button");
  if (btn) btn.classList.toggle("hidden", AppStateSudoku.gameOver || !AppStateSudoku.grid);
}

document.addEventListener("DOMContentLoaded", initSudokuApp);
