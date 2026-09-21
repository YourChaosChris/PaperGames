// minesweeper-app.js
// Wires MinesweeperCore to the minesweeper.html UI. Solitaire, like
// Sudoku and Peg Solitaire - no opponent, no AI, just a difficulty
// picker. Unlike those two, undo doesn't exist here even as an option:
// the classic game's entire tension comes from a decision being final,
// so this is the one solitaire game in the collection without an Undo
// button.
//
// The board is a float-grid (same JS-enforced square cell size
// technique as the other games), wrapped in a horizontally scrollable
// container so the 30-column Expert board stays playable at a sane
// cell size on a narrow e-reader screen instead of squeezing every
// cell down to illegibility.
//
// Left-click (or a tap while "Flag mode" is off) reveals a cell; a real
// right-click always toggles a flag regardless of mode, for desktop
// browsers, while "Flag mode" exists so a touchscreen e-reader without
// a right-click can flag too. Clicking an already-revealed numbered
// cell "chords" it if enough neighbors are flagged, revealing the rest
// at once - exactly like a middle-click in the classic desktop game.

const MINESWEEPER_PRESETS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 }
};

const AppStateMinesweeper = {
  preset: "intermediate",
  state: null,
  flagMode: false,
  gameOver: false,
  elapsedSeconds: 0,
  timerHandle: null
};

const MINESWEEPER_SAVE_KEY = "einkchess_save_minesweeper";

function saveMinesweeperGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MINESWEEPER_SAVE_KEY, {
    preset: AppStateMinesweeper.preset,
    state: AppStateMinesweeper.state,
    elapsedSeconds: AppStateMinesweeper.elapsedSeconds
  });
}

function clearSavedMinesweeperGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MINESWEEPER_SAVE_KEY);
}

function recordMinesweeperStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("minesweeper", outcome);
}

function setStatusMinesweeper(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultMinesweeper(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultMinesweeper(title, message) {
  setGameResultMinesweeper(message);
  setStatusMinesweeper("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function stopMinesweeperTimer() {
  if (AppStateMinesweeper.timerHandle !== null) {
    clearInterval(AppStateMinesweeper.timerHandle);
    AppStateMinesweeper.timerHandle = null;
  }
}

function startMinesweeperTimer() {
  stopMinesweeperTimer();
  AppStateMinesweeper.timerHandle = setInterval(() => {
    AppStateMinesweeper.elapsedSeconds++;
    updateTimerDisplayMinesweeper();
  }, 1000);
}

function updateTimerDisplayMinesweeper() {
  setStatusMinesweeper("minesweeper-timer", "⏱ " + AppStateMinesweeper.elapsedSeconds + "s");
}

function initMinesweeperApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("minesweeper-level-inline");
  const startGameBtn = document.getElementById("start-minesweeper-game");
  const flagToggleBtn = document.getElementById("minesweeper-flag-toggle");

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

  function startNewGameMinesweeper(preset) {
    const cfg = MINESWEEPER_PRESETS[preset] || MINESWEEPER_PRESETS.intermediate;
    AppStateMinesweeper.preset = preset;
    AppStateMinesweeper.state = MinesweeperCore.createState(cfg.rows, cfg.cols, cfg.mines);
    AppStateMinesweeper.flagMode = false;
    AppStateMinesweeper.gameOver = false;
    AppStateMinesweeper.elapsedSeconds = 0;
    stopMinesweeperTimer();
    setGameResultMinesweeper("");
    showBoardSectionMinesweeper();
    buildMinesweeperBoardDOM();
    updateMinesweeperBoard();
    updateGameLabelsMinesweeper();
    updateTimerDisplayMinesweeper();
    updateFlagModeButtonMinesweeper();
    setStatusMinesweeper("board-info", "Reveal a cell to begin.");
  }

  startGameBtn.addEventListener("click", () => {
    const preset = levelInline ? levelInline.value : "intermediate";
    startNewGameMinesweeper(preset);
  });

  if (flagToggleBtn) {
    flagToggleBtn.addEventListener("click", () => {
      AppStateMinesweeper.flagMode = !AppStateMinesweeper.flagMode;
      updateFlagModeButtonMinesweeper();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(MINESWEEPER_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateMinesweeper.preset = savedGame.preset;
    AppStateMinesweeper.state = savedGame.state;
    AppStateMinesweeper.elapsedSeconds = savedGame.elapsedSeconds || 0;
    AppStateMinesweeper.flagMode = false;
    AppStateMinesweeper.gameOver = savedGame.state.gameOver;
    if (levelInline) levelInline.value = AppStateMinesweeper.preset;
    setGameResultMinesweeper("");
    showBoardSectionMinesweeper();
    buildMinesweeperBoardDOM();
    updateMinesweeperBoard();
    updateGameLabelsMinesweeper();
    updateTimerDisplayMinesweeper();
    updateFlagModeButtonMinesweeper();
    if (!AppStateMinesweeper.gameOver && AppStateMinesweeper.state.minesPlaced) {
      startMinesweeperTimer();
    }
    setStatusMinesweeper("board-info", AppStateMinesweeper.gameOver ? "" : "Reveal a cell to continue.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function onMinesweeperCellClick(r, c) {
  if (AppStateMinesweeper.gameOver || !AppStateMinesweeper.state) return;
  const cell = AppStateMinesweeper.state.cells[r][c];

  if (AppStateMinesweeper.flagMode) {
    doToggleFlagMinesweeper(r, c);
    return;
  }

  if (cell.revealed) {
    doChordMinesweeper(r, c);
    return;
  }

  doRevealMinesweeper(r, c);
}

function onMinesweeperCellContextMenu(e, r, c) {
  e.preventDefault();
  if (AppStateMinesweeper.gameOver || !AppStateMinesweeper.state) return;
  doToggleFlagMinesweeper(r, c);
}

function doRevealMinesweeper(r, c) {
  const wasFirstReveal = !AppStateMinesweeper.state.minesPlaced;
  AppStateMinesweeper.state = MinesweeperCore.reveal(AppStateMinesweeper.state, r, c);
  if (wasFirstReveal && AppStateMinesweeper.state.minesPlaced) startMinesweeperTimer();
  finishMinesweeperAction();
}

function doChordMinesweeper(r, c) {
  const before = AppStateMinesweeper.state.revealedCount;
  AppStateMinesweeper.state = MinesweeperCore.chord(AppStateMinesweeper.state, r, c);
  if (AppStateMinesweeper.state.revealedCount !== before || AppStateMinesweeper.state.gameOver) {
    finishMinesweeperAction();
  }
}

function doToggleFlagMinesweeper(r, c) {
  AppStateMinesweeper.state = MinesweeperCore.toggleFlag(AppStateMinesweeper.state, r, c);
  updateMinesweeperBoard();
  updateGameLabelsMinesweeper();
}

function finishMinesweeperAction() {
  updateMinesweeperBoard();
  updateGameLabelsMinesweeper();

  if (AppStateMinesweeper.state.gameOver) {
    AppStateMinesweeper.gameOver = true;
    stopMinesweeperTimer();
    if (AppStateMinesweeper.state.won) {
      announceGameResultMinesweeper("Cleared!", "All clear in " + AppStateMinesweeper.elapsedSeconds + " seconds - well done!");
      recordMinesweeperStats("win");
    } else {
      announceGameResultMinesweeper("Boom!", "You hit a mine. Try again!");
      recordMinesweeperStats("loss");
    }
    updateGameLabelsMinesweeper();
  } else {
    setStatusMinesweeper("board-info", MinesweeperCore.countRemainingMines(AppStateMinesweeper.state) + " mines left.");
  }
}

function showBoardSectionMinesweeper() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as chess/checkers/Connect Four) ***/

function buildMinesweeperBoardDOM() {
  const boardEl = document.getElementById("minesweeper-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const cols = AppStateMinesweeper.state.cols;
  boardEl.style.width = (cols * 32) + "px";

  for (let r = 0; r < AppStateMinesweeper.state.rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("button");
      cell.className = "square minesweeper-cell";
      cell.type = "button";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.width = (100 / cols) + "%";

      const label = document.createElement("span");
      label.className = "minesweeper-cell-label";
      cell.appendChild(label);

      cell.addEventListener("click", () => onMinesweeperCellClick(r, c));
      cell.addEventListener("contextmenu", (e) => onMinesweeperCellContextMenu(e, r, c));
      boardEl.appendChild(cell);
    }
  }

  ensureMinesweeperSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureMinesweeperSquareAspectRatio);
  } else {
    setTimeout(ensureMinesweeperSquareAspectRatio, 0);
  }
  ensureMinesweeperResizeHandler();
}

let einkMinesweeperResizeHandlerAttached = false;
let einkMinesweeperResizeTimeoutId = null;

function ensureMinesweeperSquareAspectRatio() {
  const boardEl = document.getElementById("minesweeper-board");
  if (!boardEl || !AppStateMinesweeper.state) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / AppStateMinesweeper.state.cols;
  boardEl.querySelectorAll(".minesweeper-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureMinesweeperResizeHandler() {
  if (einkMinesweeperResizeHandlerAttached) return;
  einkMinesweeperResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkMinesweeperResizeTimeoutId !== null) clearTimeout(einkMinesweeperResizeTimeoutId);
    einkMinesweeperResizeTimeoutId = setTimeout(() => {
      einkMinesweeperResizeTimeoutId = null;
      ensureMinesweeperSquareAspectRatio();
    }, 150);
  });
}

function updateMinesweeperBoard() {
  const boardEl = document.getElementById("minesweeper-board");
  if (!boardEl || !AppStateMinesweeper.state) return;
  const explodedAt = AppStateMinesweeper.state.explodedAt;

  boardEl.querySelectorAll(".minesweeper-cell").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const cell = AppStateMinesweeper.state.cells[r][c];
    const label = sq.querySelector(".minesweeper-cell-label");

    sq.classList.toggle("minesweeper-cell-revealed", cell.revealed);
    sq.classList.toggle("minesweeper-cell-flagged", cell.flagged && !cell.revealed);
    sq.classList.toggle("minesweeper-cell-mine", cell.revealed && cell.mine);
    sq.classList.toggle("minesweeper-cell-exploded",
      !!(explodedAt && explodedAt[0] === r && explodedAt[1] === c));

    let text = "";
    let ariaExtra = ", hidden";
    if (cell.flagged && !cell.revealed) {
      text = "⚑";
      ariaExtra = ", flagged";
    } else if (cell.revealed) {
      if (cell.mine) {
        text = "●";
        ariaExtra = ", mine";
      } else if (cell.adjacent > 0) {
        text = String(cell.adjacent);
        ariaExtra = ", " + cell.adjacent + " adjacent mines";
      } else {
        ariaExtra = ", empty";
      }
    }
    if (label) label.textContent = text;
    sq.setAttribute("aria-label", "Row " + (r + 1) + ", column " + (c + 1) + ariaExtra);
  });
}

function updateGameLabelsMinesweeper() {
  const meta = document.getElementById("game-meta");
  if (meta && AppStateMinesweeper.state) {
    meta.textContent = AppStateMinesweeper.state.revealedCount + " cells revealed";
  }
  const counter = document.getElementById("minesweeper-mine-counter");
  if (counter && AppStateMinesweeper.state) {
    counter.textContent = "⚑ " + MinesweeperCore.countRemainingMines(AppStateMinesweeper.state);
  }

  if (AppStateMinesweeper.gameOver) clearSavedMinesweeperGame();
  else saveMinesweeperGame();
}

function updateFlagModeButtonMinesweeper() {
  const btn = document.getElementById("minesweeper-flag-toggle");
  if (btn) btn.classList.toggle("active-mode", AppStateMinesweeper.flagMode);
}

document.addEventListener("DOMContentLoaded", initMinesweeperApp);
