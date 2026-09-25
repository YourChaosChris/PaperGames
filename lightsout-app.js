// lightsout-app.js
// Wires LightsOutCore to the lightsout.html UI. Solitaire, like Sudoku,
// Minesweeper and 2048 - no opponent, no AI, just a difficulty picker.
//
// The board is a fixed 5x5 float-grid (same JS-enforced square cell size
// technique as 2048/Minesweeper), so a click toggles the pressed cell and
// its orthogonal neighbors in a single re-render. Difficulty only
// controls how many random button-presses scramble the starting grid -
// more presses tends to look more scrambled, though it isn't a strict
// guarantee of a "harder" puzzle in any rigorous sense.

const LIGHTSOUT_SIZE = 5;
const LIGHTSOUT_PRESETS = {
  easy: 5,
  medium: 10,
  hard: 20
};

const AppStateLightsOut = {
  difficulty: "medium",
  grid: null,        // 2D boolean, true = on/lit
  moveCount: 0,
  gameOver: false
};

const LIGHTSOUT_SAVE_KEY = "einkchess_save_lightsout";

function saveLightsOutGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(LIGHTSOUT_SAVE_KEY, {
    difficulty: AppStateLightsOut.difficulty,
    grid: AppStateLightsOut.grid,
    moveCount: AppStateLightsOut.moveCount
  });
}

function clearSavedLightsOutGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(LIGHTSOUT_SAVE_KEY);
}

function recordLightsOutStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("lightsout", "win");
}

function setStatusLightsOut(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultLightsOut(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultLightsOut(message) {
  setGameResultLightsOut(message);
  setStatusLightsOut("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Solved!", message);
  }
}

function initLightsOutApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("lightsout-level-inline");
  const startGameBtn = document.getElementById("start-lightsout-game");

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

  function startNewGameLightsOut(difficulty) {
    const presses = LIGHTSOUT_PRESETS[difficulty] || LIGHTSOUT_PRESETS.medium;
    const generated = LightsOutCore.generatePuzzle(LIGHTSOUT_SIZE, presses);

    AppStateLightsOut.difficulty = difficulty;
    AppStateLightsOut.grid = generated.grid;
    AppStateLightsOut.moveCount = 0;
    AppStateLightsOut.gameOver = false;
    setGameResultLightsOut("");
    showBoardSectionLightsOut();
    buildLightsOutBoardDOM();
    updateLightsOutBoard();
    updateGameLabelsLightsOut();
    setStatusLightsOut("board-info", "Turn off every light to win.");
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameLightsOut(difficulty);
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(LIGHTSOUT_SAVE_KEY) : null;
  if (savedGame && savedGame.grid) {
    AppStateLightsOut.difficulty = savedGame.difficulty;
    AppStateLightsOut.grid = savedGame.grid;
    AppStateLightsOut.moveCount = savedGame.moveCount || 0;
    AppStateLightsOut.gameOver = false;
    if (levelInline) levelInline.value = AppStateLightsOut.difficulty;
    setGameResultLightsOut("");
    showBoardSectionLightsOut();
    buildLightsOutBoardDOM();
    updateLightsOutBoard();
    updateGameLabelsLightsOut();
    setStatusLightsOut("board-info", "Turn off every light to win.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function onLightsOutCellClick(r, c) {
  if (AppStateLightsOut.gameOver || !AppStateLightsOut.grid) return;
  AppStateLightsOut.grid = LightsOutCore.pressCell(AppStateLightsOut.grid, r, c);
  AppStateLightsOut.moveCount++;
  updateLightsOutBoard();
  updateGameLabelsLightsOut();

  if (LightsOutCore.isSolved(AppStateLightsOut.grid)) {
    AppStateLightsOut.gameOver = true;
    const moves = AppStateLightsOut.moveCount;
    announceGameResultLightsOut("All lights off in " + moves + (moves === 1 ? " move" : " moves") + " - well done!");
    recordLightsOutStats();
    updateGameLabelsLightsOut();
  } else {
    setStatusLightsOut("board-info", "Turn off every light to win.");
  }
}

function showBoardSectionLightsOut() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as 2048/Minesweeper) ***/

function buildLightsOutBoardDOM() {
  const boardEl = document.getElementById("lightsout-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < LIGHTSOUT_SIZE; r++) {
    for (let c = 0; c < LIGHTSOUT_SIZE; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "square lightsout-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => onLightsOutCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  ensureLightsOutSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureLightsOutSquareAspectRatio);
  } else {
    setTimeout(ensureLightsOutSquareAspectRatio, 0);
  }
  ensureLightsOutResizeHandler();
}

let einkLightsOutResizeHandlerAttached = false;
let einkLightsOutResizeTimeoutId = null;

function ensureLightsOutSquareAspectRatio() {
  const boardEl = document.getElementById("lightsout-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / LIGHTSOUT_SIZE;
  boardEl.querySelectorAll(".lightsout-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureLightsOutResizeHandler() {
  if (einkLightsOutResizeHandlerAttached) return;
  einkLightsOutResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkLightsOutResizeTimeoutId !== null) clearTimeout(einkLightsOutResizeTimeoutId);
    einkLightsOutResizeTimeoutId = setTimeout(() => {
      einkLightsOutResizeTimeoutId = null;
      ensureLightsOutSquareAspectRatio();
    }, 150);
  });
}

function updateLightsOutBoard() {
  const boardEl = document.getElementById("lightsout-board");
  if (!boardEl || !AppStateLightsOut.grid) return;

  boardEl.querySelectorAll(".lightsout-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const on = AppStateLightsOut.grid[r][c];
    cell.classList.toggle("lightsout-cell-on", on);
    cell.setAttribute("aria-label", "Row " + (r + 1) + ", column " + (c + 1) + ", " + (on ? "on" : "off"));
  });
}

function updateGameLabelsLightsOut() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = "Moves: " + AppStateLightsOut.moveCount;

  if (AppStateLightsOut.gameOver) clearSavedLightsOutGame();
  else saveLightsOutGame();
}

document.addEventListener("DOMContentLoaded", initLightsOutApp);
