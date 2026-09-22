// kakuro-app.js
// Wires KakuroCore/KakuroPuzzles to the kakuro.html UI. Solitaire, like
// Sudoku - no opponent, just a difficulty picker and a fresh puzzle each
// time. The board is a float-grid sized by the puzzle's own layout
// (7x7/9x9/11x11 depending on difficulty, unlike Sudoku's fixed 9x9), a
// JS-enforced square cell size since CSS `aspect-ratio` is unreliable on
// E-Ink browsers.
//
// A black "clue" cell shows its sum(s) on a black background: the
// across-run sum in the upper-right corner, the down-run sum in the
// lower-left, with a thin diagonal divider drawn between them only when
// a cell carries both (see .kakuro-cell-split in style.css) - the
// standard Kakuro notation. Digit entry goes through the same on-screen
// number pad Sudoku uses (built for touchscreen e-readers that may have
// no physical keyboard), plus the keyboard's digit/backspace keys once a
// cell is focused.

const AppStateKakuro = {
  difficulty: "medium",
  size: 9,
  layout: null,      // 2D "black" | "white"
  clues: null,       // 2D {right, down} | null, matching layout's black cells
  solution: null,    // 2D digit | null - kept for save/restore parity, not needed to validate moves
  playerGrid: null,  // 2D digit (0 = empty) | null, matching layout's white cells
  selected: null,    // [row, col] or null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const KAKURO_SAVE_KEY = "einkchess_save_kakuro";

function saveKakuroGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(KAKURO_SAVE_KEY, {
    difficulty: AppStateKakuro.difficulty,
    layout: AppStateKakuro.layout,
    clues: AppStateKakuro.clues,
    solution: AppStateKakuro.solution,
    playerGrid: AppStateKakuro.playerGrid,
    moveCount: AppStateKakuro.moveCount
  });
}

function clearSavedKakuroGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(KAKURO_SAVE_KEY);
}

function recordKakuroStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("kakuro", "win");
}

function setStatusKakuro(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultKakuro(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultKakuro(message) {
  setGameResultKakuro(message);
  setStatusKakuro("board-info", message);
  if (window.ResultModal) {
    const title = (window.I18n && I18n.t("kakuro_win_title")) || "Solved!";
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackKakuro() {
  AppStateKakuro.undoStack = [];
}

function pushUndoSnapshotKakuro() {
  AppStateKakuro.undoStack.push({
    playerGrid: AppStateKakuro.playerGrid.map((row) => row.slice()),
    moveCount: AppStateKakuro.moveCount
  });
}

function initKakuroApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("kakuro-level-inline");
  const startGameBtn = document.getElementById("start-kakuro-game");
  const eraseBtn = document.getElementById("kakuro-erase-button");

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) menuToggle.textContent = "☰ Menu";
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) menuToggle.textContent = "✕ Close";
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function startNewGameKakuro(difficulty) {
    setStatusKakuro("offline-kakuro-status", (window.I18n && I18n.t("kakuro_generating")) || "Generating puzzle…");
    setStatusKakuro("board-info", (window.I18n && I18n.t("kakuro_generating")) || "Generating puzzle…");
    // Generation is a couple of milliseconds even on "hard", but
    // yielding a tick keeps the "Generating…" status visible instead of
    // the click feeling unresponsive.
    setTimeout(() => {
      const puzzle = KakuroPuzzles.generatePuzzle(difficulty);
      AppStateKakuro.difficulty = difficulty;
      AppStateKakuro.size = puzzle.size;
      AppStateKakuro.layout = puzzle.layout;
      AppStateKakuro.clues = puzzle.clues;
      AppStateKakuro.solution = puzzle.solution;
      AppStateKakuro.playerGrid = KakuroCore.createEmptyPlayerGrid(puzzle.layout);
      AppStateKakuro.selected = null;
      AppStateKakuro.gameOver = false;
      AppStateKakuro.moveCount = 0;
      resetUndoStackKakuro();
      setGameResultKakuro("");
      showBoardSectionKakuro();
      buildKakuroBoardDOM();
      buildKakuroNumpadDOM();
      updateKakuroBoard();
      updateGameLabelsKakuro();
      setStatusKakuro("offline-kakuro-status", "");
      setStatusKakuro("board-info", (window.I18n && I18n.t("kakuro_hint")) || "Select a cell, then pick a number.");
    }, 10);
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameKakuro(difficulty);
  });

  if (eraseBtn) {
    eraseBtn.addEventListener("click", () => enterDigitKakuro(0));
  }

  document.addEventListener("keydown", (e) => {
    if (AppStateKakuro.selected === null || AppStateKakuro.gameOver) return;
    if (e.key >= "1" && e.key <= "9") {
      enterDigitKakuro(parseInt(e.key, 10));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      enterDigitKakuro(0);
    }
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(KAKURO_SAVE_KEY) : null;
  if (savedGame && savedGame.layout) {
    AppStateKakuro.difficulty = savedGame.difficulty;
    AppStateKakuro.size = savedGame.layout.length;
    AppStateKakuro.layout = savedGame.layout;
    AppStateKakuro.clues = savedGame.clues;
    AppStateKakuro.solution = savedGame.solution;
    AppStateKakuro.playerGrid = savedGame.playerGrid;
    AppStateKakuro.moveCount = savedGame.moveCount;
    AppStateKakuro.selected = null;
    AppStateKakuro.gameOver = false;
    resetUndoStackKakuro();
    if (levelInline) levelInline.value = AppStateKakuro.difficulty;
    setGameResultKakuro("");
    showBoardSectionKakuro();
    buildKakuroBoardDOM();
    buildKakuroNumpadDOM();
    updateKakuroBoard();
    updateGameLabelsKakuro();
    setStatusKakuro("board-info", (window.I18n && I18n.t("kakuro_hint")) || "Select a cell, then pick a number.");
  }
  // Otherwise no puzzle is pre-generated: the placeholder shows until
  // the player picks a difficulty and presses New puzzle.
}

function onKakuroCellClick(r, c) {
  if (AppStateKakuro.gameOver) return;
  if (AppStateKakuro.layout[r][c] !== KakuroCore.WHITE) return;
  AppStateKakuro.selected = [r, c];
  updateKakuroBoard();
}

function enterDigitKakuro(digit) {
  const sel = AppStateKakuro.selected;
  if (!sel || AppStateKakuro.gameOver) return;
  const [r, c] = sel;
  if (AppStateKakuro.layout[r][c] !== KakuroCore.WHITE) return;
  if (AppStateKakuro.playerGrid[r][c] === digit) return;

  pushUndoSnapshotKakuro();
  AppStateKakuro.playerGrid[r][c] = digit;
  AppStateKakuro.moveCount++;
  updateKakuroBoard();
  updateGameLabelsKakuro();

  if (KakuroCore.isComplete(AppStateKakuro.playerGrid, AppStateKakuro.layout, AppStateKakuro.clues)) {
    AppStateKakuro.gameOver = true;
    const message = (window.I18n && I18n.t("kakuro_win_message")) || "Puzzle solved! Well done.";
    announceGameResultKakuro(message);
    recordKakuroStats();
    updateGameLabelsKakuro();
  } else {
    setStatusKakuro("board-info", (window.I18n && I18n.t("kakuro_hint")) || "Select a cell, then pick a number.");
  }
}

function undoLastMove() {
  if (!AppStateKakuro.undoStack || !AppStateKakuro.undoStack.length) return;
  const prev = AppStateKakuro.undoStack.pop();
  AppStateKakuro.playerGrid = prev.playerGrid;
  AppStateKakuro.moveCount = prev.moveCount;
  setGameResultKakuro("");
  updateKakuroBoard();
  updateGameLabelsKakuro();
  setStatusKakuro("board-info", (window.I18n && I18n.t("kakuro_undone")) || "Move undone.");
}

function showBoardSectionKakuro() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as Sudoku's board, but
     the size varies per difficulty instead of a fixed 9x9) ***/

function buildKakuroBoardDOM() {
  const boardEl = document.getElementById("kakuro-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const size = AppStateKakuro.size;
  const layout = AppStateKakuro.layout;
  const clues = AppStateKakuro.clues;
  const widthPct = 100 / size;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isWhite = layout[r][c] === KakuroCore.WHITE;
      let cell;
      if (isWhite) {
        cell = document.createElement("button");
        cell.type = "button";
        cell.className = "square kakuro-cell kakuro-cell-white";
        cell.addEventListener("click", () => onKakuroCellClick(r, c));
        const label = document.createElement("span");
        label.className = "kakuro-cell-value";
        cell.appendChild(label);
      } else {
        cell = document.createElement("div");
        cell.className = "square kakuro-cell kakuro-cell-black";
        const clue = clues[r][c];
        if (clue && clue.right !== null && clue.down !== null) cell.classList.add("kakuro-cell-split");
        if (clue && clue.right !== null) {
          const span = document.createElement("span");
          span.className = "kakuro-clue kakuro-clue-right";
          span.textContent = String(clue.right);
          cell.appendChild(span);
        }
        if (clue && clue.down !== null) {
          const span = document.createElement("span");
          span.className = "kakuro-clue kakuro-clue-down";
          span.textContent = String(clue.down);
          cell.appendChild(span);
        }
      }
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.width = widthPct + "%";
      boardEl.appendChild(cell);
    }
  }

  ensureKakuroSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureKakuroSquareAspectRatio);
  } else {
    setTimeout(ensureKakuroSquareAspectRatio, 0);
  }
  ensureKakuroResizeHandler();
}

let einkKakuroResizeHandlerAttached = false;
let einkKakuroResizeTimeoutId = null;

function ensureKakuroSquareAspectRatio() {
  const boardEl = document.getElementById("kakuro-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const size = AppStateKakuro.size || 9;
  const squareSize = rect.width / size;
  boardEl.querySelectorAll(".kakuro-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureKakuroResizeHandler() {
  if (einkKakuroResizeHandlerAttached) return;
  einkKakuroResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkKakuroResizeTimeoutId !== null) clearTimeout(einkKakuroResizeTimeoutId);
    einkKakuroResizeTimeoutId = setTimeout(() => {
      einkKakuroResizeTimeoutId = null;
      ensureKakuroSquareAspectRatio();
    }, 150);
  });
}

function buildKakuroNumpadDOM() {
  const el = document.getElementById("kakuro-numpad");
  if (!el) return;
  el.innerHTML = "";
  for (let d = 1; d <= 9; d++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kakuro-numpad-btn";
    btn.textContent = String(d);
    btn.addEventListener("click", () => enterDigitKakuro(d));
    el.appendChild(btn);
  }
}

function updateKakuroBoard() {
  const boardEl = document.getElementById("kakuro-board");
  if (!boardEl) return;
  const conflicts = KakuroCore.findConflicts(AppStateKakuro.playerGrid, AppStateKakuro.layout, AppStateKakuro.clues);
  const selected = AppStateKakuro.selected;

  boardEl.querySelectorAll(".kakuro-cell-white").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const value = AppStateKakuro.playerGrid[r][c];
    const label = cell.querySelector(".kakuro-cell-value");
    if (label) label.textContent = value ? String(value) : "";

    const key = r + "," + c;
    cell.classList.toggle("selected", !!selected && selected[0] === r && selected[1] === c);
    cell.classList.toggle("kakuro-cell-conflict", conflicts.has(key));

    let label2 = "Row " + (r + 1) + ", column " + (c + 1);
    label2 += value ? ", " + value : ", empty";
    if (conflicts.has(key)) label2 += ", conflict";
    cell.setAttribute("aria-label", label2);
  });
}

function updateGameLabelsKakuro() {
  const meta = document.getElementById("game-meta");
  if (meta) {
    if (AppStateKakuro.layout) {
      let filled = 0, total = 0;
      for (let r = 0; r < AppStateKakuro.size; r++) {
        for (let c = 0; c < AppStateKakuro.size; c++) {
          if (AppStateKakuro.layout[r][c] === KakuroCore.WHITE) {
            total++;
            if (AppStateKakuro.playerGrid[r][c]) filled++;
          }
        }
      }
      meta.textContent = filled + " / " + total + " filled";
    } else {
      meta.textContent = "";
    }
  }
  updateUndoButtonVisibilityKakuro();
  updateEraseButtonVisibilityKakuro();

  if (AppStateKakuro.gameOver) clearSavedKakuroGame();
  else saveKakuroGame();
}

function updateUndoButtonVisibilityKakuro() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateKakuro.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateKakuro.gameOver));
}

function updateEraseButtonVisibilityKakuro() {
  const btn = document.getElementById("kakuro-erase-button");
  if (btn) btn.classList.toggle("hidden", AppStateKakuro.gameOver || !AppStateKakuro.layout);
}

document.addEventListener("DOMContentLoaded", initKakuroApp);
