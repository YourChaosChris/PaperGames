// lightswitch-app.js
// Wires LightSwitchCore to the lightswitch.html UI. Solitaire, like Sudoku,
// Minesweeper and 2048 - no opponent, no AI, just a difficulty picker.
//
// The board is a fixed 5x5 float-grid (same JS-enforced square cell size
// technique as 2048/Minesweeper), so a click toggles the pressed cell and
// its orthogonal neighbors in a single re-render. Difficulty only
// controls how many random button-presses scramble the starting grid -
// more presses tends to look more scrambled, though it isn't a strict
// guarantee of a "harder" puzzle in any rigorous sense.

const LIGHTSWITCH_SIZE = 5;
const LIGHTSWITCH_PRESETS = {
  easy: 5,
  medium: 10,
  hard: 20
};

const AppStateLightSwitch = {
  difficulty: "medium",
  grid: null,        // 2D boolean, true = on/lit
  moveCount: 0,
  gameOver: false
};

const LIGHTSWITCH_SAVE_KEY = "einkchess_save_lightswitch";

function saveLightSwitchGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(LIGHTSWITCH_SAVE_KEY, {
    difficulty: AppStateLightSwitch.difficulty,
    grid: AppStateLightSwitch.grid,
    moveCount: AppStateLightSwitch.moveCount
  });
}

function clearSavedLightSwitchGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(LIGHTSWITCH_SAVE_KEY);
}

function recordLightSwitchStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("lightswitch", "win");
}

function setStatusLightSwitch(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultLightSwitch(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultLightSwitch(message) {
  setGameResultLightSwitch(message);
  setStatusLightSwitch("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Solved!", message);
  }
}

function initLightSwitchApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("lightswitch-level-inline");
  const startGameBtn = document.getElementById("start-lightswitch-game");

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

  function startNewGameLightSwitch(difficulty) {
    const presses = LIGHTSWITCH_PRESETS[difficulty] || LIGHTSWITCH_PRESETS.medium;
    const generated = LightSwitchCore.generatePuzzle(LIGHTSWITCH_SIZE, presses);

    AppStateLightSwitch.difficulty = difficulty;
    AppStateLightSwitch.grid = generated.grid;
    AppStateLightSwitch.moveCount = 0;
    AppStateLightSwitch.gameOver = false;
    setGameResultLightSwitch("");
    showBoardSectionLightSwitch();
    buildLightSwitchBoardDOM();
    updateLightSwitchBoard();
    updateGameLabelsLightSwitch();
    setStatusLightSwitch("board-info", "Turn off every light to win.");
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameLightSwitch(difficulty);
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(LIGHTSWITCH_SAVE_KEY) : null;
  if (savedGame && savedGame.grid) {
    AppStateLightSwitch.difficulty = savedGame.difficulty;
    AppStateLightSwitch.grid = savedGame.grid;
    AppStateLightSwitch.moveCount = savedGame.moveCount || 0;
    AppStateLightSwitch.gameOver = false;
    if (levelInline) levelInline.value = AppStateLightSwitch.difficulty;
    setGameResultLightSwitch("");
    showBoardSectionLightSwitch();
    buildLightSwitchBoardDOM();
    updateLightSwitchBoard();
    updateGameLabelsLightSwitch();
    setStatusLightSwitch("board-info", "Turn off every light to win.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function onLightSwitchCellClick(r, c) {
  if (AppStateLightSwitch.gameOver || !AppStateLightSwitch.grid) return;
  AppStateLightSwitch.grid = LightSwitchCore.pressCell(AppStateLightSwitch.grid, r, c);
  AppStateLightSwitch.moveCount++;
  updateLightSwitchBoard();
  updateGameLabelsLightSwitch();

  if (LightSwitchCore.isSolved(AppStateLightSwitch.grid)) {
    AppStateLightSwitch.gameOver = true;
    const moves = AppStateLightSwitch.moveCount;
    announceGameResultLightSwitch("All lights off in " + moves + (moves === 1 ? " move" : " moves") + " - well done!");
    recordLightSwitchStats();
    updateGameLabelsLightSwitch();
  } else {
    setStatusLightSwitch("board-info", "Turn off every light to win.");
  }
}

function showBoardSectionLightSwitch() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as 2048/Minesweeper) ***/

function buildLightSwitchBoardDOM() {
  const boardEl = document.getElementById("lightswitch-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < LIGHTSWITCH_SIZE; r++) {
    for (let c = 0; c < LIGHTSWITCH_SIZE; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "square lightswitch-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => onLightSwitchCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  ensureLightSwitchSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureLightSwitchSquareAspectRatio);
  } else {
    setTimeout(ensureLightSwitchSquareAspectRatio, 0);
  }
  ensureLightSwitchResizeHandler();
}

let einkLightSwitchResizeHandlerAttached = false;
let einkLightSwitchResizeTimeoutId = null;

function ensureLightSwitchSquareAspectRatio() {
  const boardEl = document.getElementById("lightswitch-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / LIGHTSWITCH_SIZE;
  boardEl.querySelectorAll(".lightswitch-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureLightSwitchResizeHandler() {
  if (einkLightSwitchResizeHandlerAttached) return;
  einkLightSwitchResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkLightSwitchResizeTimeoutId !== null) clearTimeout(einkLightSwitchResizeTimeoutId);
    einkLightSwitchResizeTimeoutId = setTimeout(() => {
      einkLightSwitchResizeTimeoutId = null;
      ensureLightSwitchSquareAspectRatio();
    }, 150);
  });
}

function updateLightSwitchBoard() {
  const boardEl = document.getElementById("lightswitch-board");
  if (!boardEl || !AppStateLightSwitch.grid) return;

  boardEl.querySelectorAll(".lightswitch-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const on = AppStateLightSwitch.grid[r][c];
    cell.classList.toggle("lightswitch-cell-on", on);
    I18n.setAria(cell, "Row " + (r + 1) + ", column " + (c + 1) + ", " + (on ? "on" : "off"));
  });
}

function updateGameLabelsLightSwitch() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Moves: " + AppStateLightSwitch.moveCount);

  if (AppStateLightSwitch.gameOver) clearSavedLightSwitchGame();
  else saveLightSwitchGame();
}

document.addEventListener("DOMContentLoaded", initLightSwitchApp);
