// twenty48-app.js
// Wires Twenty48Core to the twenty48.html UI. Solitaire, like the other
// puzzles here - no opponent, no AI, no difficulty picker even, since
// the classic game only ever has the one 4x4 board and the same 90%/10%
// two-or-four tile spawn.
//
// Input goes through the keyboard's arrow keys, a swipe gesture (for a
// touchscreen e-reader), or four on-screen buttons as a fallback for
// whichever of those doesn't work on a given device. Tiles are told
// apart purely by their printed number and a handful of border/weight
// steps as the value grows, never by color, so this reads fine on a
// monochrome E-Ink display without needing the classic game's usual
// color-per-value palette.

const AppState2048 = {
  state: null,
  gameOver: false,
  wonAnnounced: false,
  moveCount: 0,
  undoStack: [],
  bestScore: 0,
  isDaily: false
};

// Only set while a Daily Challenge is in progress, so every tile spawn -
// the initial board and every move afterwards - draws from the same
// seeded stream and the puzzle stays identical for every player today.
// A plain "New game" leaves this null, so Twenty48Core falls back to
// Math.random as usual.
let dailyRng2048 = null;

const TWENTY48_SAVE_KEY = "einkchess_save_2048";
const TWENTY48_BEST_KEY = "einkchess_best_2048";

function save2048Game() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(TWENTY48_SAVE_KEY, {
    state: AppState2048.state,
    moveCount: AppState2048.moveCount,
    wonAnnounced: AppState2048.wonAnnounced,
    isDaily: AppState2048.isDaily
  });
}

function clearSaved2048Game() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(TWENTY48_SAVE_KEY);
}

function loadBestScore2048() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(TWENTY48_BEST_KEY) : null;
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

function saveBestScore2048(score) {
  try {
    if (window.localStorage) window.localStorage.setItem(TWENTY48_BEST_KEY, String(score));
  } catch (e) { /* storage unavailable - just don't persist */ }
}

function record2048Stats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("twenty48", outcome);
}

function setStatus2048(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResult2048(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResult2048(title, message) {
  setGameResult2048(message);
  setStatus2048("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStack2048() {
  AppState2048.undoStack = [];
}

function pushUndoSnapshot2048() {
  const s = AppState2048.state;
  AppState2048.undoStack.push({
    state: { grid: Twenty48Core.cloneGrid(s.grid), score: s.score, won: s.won, over: s.over },
    moveCount: AppState2048.moveCount,
    wonAnnounced: AppState2048.wonAnnounced
  });
}

function initTwenty48App() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-twenty48-game");

  AppState2048.bestScore = loadBestScore2048();

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

  function startNewGame2048(isDaily) {
    dailyRng2048 = isDaily ? DailyChallenge.makeTodaysRng("twenty48") : null;
    AppState2048.state = Twenty48Core.createInitialState(dailyRng2048);
    AppState2048.isDaily = !!isDaily;
    AppState2048.gameOver = false;
    AppState2048.wonAnnounced = false;
    AppState2048.moveCount = 0;
    resetUndoStack2048();
    setGameResult2048("");
    showBoardSection2048();
    buildTwenty48BoardDOM();
    updateTwenty48Board();
    updateGameLabels2048();
    setStatus2048("board-info", isDaily
      ? "Daily Challenge (" + DailyChallenge.todayKey() + "). Swipe, use the arrow keys, or tap a direction button."
      : "Swipe, use the arrow keys, or tap a direction button.");
  }

  startGameBtn.addEventListener("click", () => startNewGame2048(false));

  const dailyBtn = document.getElementById("daily-twenty48-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => startNewGame2048(true));
  }

  document.addEventListener("keydown", (e) => {
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const dir = map[e.key];
    if (!dir || !AppState2048.state) return;
    e.preventDefault();
    applyMove2048(dir);
  });

  const dirButtons = { up: "twenty48-up", down: "twenty48-down", left: "twenty48-left", right: "twenty48-right" };
  Object.keys(dirButtons).forEach((dir) => {
    const btn = document.getElementById(dirButtons[dir]);
    if (btn) btn.addEventListener("click", () => applyMove2048(dir));
  });

  let touchStartX = null, touchStartY = null;
  const boardWrap = document.getElementById("board-container");
  if (boardWrap) {
    boardWrap.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    boardWrap.addEventListener("touchend", (e) => {
      if (touchStartX === null || touchStartY === null) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      const threshold = 24;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      applyMove2048(dir);
    }, { passive: true });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(TWENTY48_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppState2048.state = savedGame.state;
    AppState2048.moveCount = savedGame.moveCount;
    AppState2048.wonAnnounced = savedGame.wonAnnounced;
    AppState2048.isDaily = !!savedGame.isDaily;
    // A seeded RNG closure can't be persisted across a reload, so a
    // resumed Daily Challenge continues with fresh randomness rather
    // than replaying the exact same seeded stream from the start.
    dailyRng2048 = null;
    AppState2048.gameOver = savedGame.state.over;
    resetUndoStack2048();
    setGameResult2048("");
    showBoardSection2048();
    buildTwenty48BoardDOM();
    updateTwenty48Board();
    updateGameLabels2048();
    setStatus2048("board-info", AppState2048.gameOver ? "" : "Swipe, use the arrow keys, or tap a direction button.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function applyMove2048(direction) {
  if (!AppState2048.state || AppState2048.gameOver) return;
  const before = AppState2048.state;
  const next = Twenty48Core.move(before, direction, dailyRng2048);
  if (next === before) return; // no-op move - nothing slid

  pushUndoSnapshot2048();
  AppState2048.state = next;
  AppState2048.moveCount++;

  if (next.score > AppState2048.bestScore) {
    AppState2048.bestScore = next.score;
    saveBestScore2048(next.score);
  }

  updateTwenty48Board();
  updateGameLabels2048();

  if (next.won && !AppState2048.wonAnnounced) {
    AppState2048.wonAnnounced = true;
    announceGameResult2048("2048!", "You reached 2048! Keep going for a higher score, or start a new game.");
    record2048Stats("win");
    // Winning doesn't end the game - the player may keep going for a
    // higher score - so only the stat and labels update here.
    updateGameLabels2048();
    return;
  }

  if (next.over) {
    AppState2048.gameOver = true;
    announceGameResult2048("Game over", "No more moves left. Final score: " + next.score);
    if (!next.won) record2048Stats("loss");
    updateGameLabels2048();
  }
}

function undoLastMove() {
  if (!AppState2048.undoStack || !AppState2048.undoStack.length) return;
  const prev = AppState2048.undoStack.pop();
  AppState2048.state = prev.state;
  AppState2048.moveCount = prev.moveCount;
  AppState2048.wonAnnounced = prev.wonAnnounced;
  AppState2048.gameOver = false;
  setGameResult2048("");
  updateTwenty48Board();
  updateGameLabels2048();
  setStatus2048("board-info", "Move undone.");
}

function showBoardSection2048() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (float-grid, same technique as chess/checkers/Connect Four) ***/

function buildTwenty48BoardDOM() {
  const boardEl = document.getElementById("twenty48-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < Twenty48Core.SIZE; r++) {
    for (let c = 0; c < Twenty48Core.SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "square twenty48-cell";
      cell.dataset.row = r;
      cell.dataset.col = c;

      const label = document.createElement("span");
      label.className = "twenty48-cell-value";
      cell.appendChild(label);

      boardEl.appendChild(cell);
    }
  }

  ensureTwenty48SquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureTwenty48SquareAspectRatio);
  } else {
    setTimeout(ensureTwenty48SquareAspectRatio, 0);
  }
  ensureTwenty48ResizeHandler();
}

let eink2048ResizeHandlerAttached = false;
let eink2048ResizeTimeoutId = null;

function ensureTwenty48SquareAspectRatio() {
  const boardEl = document.getElementById("twenty48-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / Twenty48Core.SIZE;
  boardEl.querySelectorAll(".twenty48-cell").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureTwenty48ResizeHandler() {
  if (eink2048ResizeHandlerAttached) return;
  eink2048ResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (eink2048ResizeTimeoutId !== null) clearTimeout(eink2048ResizeTimeoutId);
    eink2048ResizeTimeoutId = setTimeout(() => {
      eink2048ResizeTimeoutId = null;
      ensureTwenty48SquareAspectRatio();
    }, 150);
  });
}

function twenty48SizeClass(value) {
  if (value >= 1024) return "twenty48-cell-huge";
  if (value >= 128) return "twenty48-cell-big";
  return "";
}

function updateTwenty48Board() {
  const boardEl = document.getElementById("twenty48-board");
  if (!boardEl || !AppState2048.state) return;

  boardEl.querySelectorAll(".twenty48-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const value = AppState2048.state.grid[r][c];
    const label = cell.querySelector(".twenty48-cell-value");
    if (label) label.textContent = value ? String(value) : "";

    cell.classList.toggle("twenty48-cell-filled", value !== 0);
    cell.classList.remove("twenty48-cell-big", "twenty48-cell-huge");
    const sizeClass = twenty48SizeClass(value);
    if (sizeClass) cell.classList.add(sizeClass);

    I18n.setAria(cell, "Row " + (r + 1) + ", column " + (c + 1) + (value ? ", " + value : ", empty"));
  });
}

function updateGameLabels2048() {
  const meta = document.getElementById("game-meta");
  if (meta && AppState2048.state) {
    I18n.setMsg(meta, "Score: " + AppState2048.state.score + "   Best: " + AppState2048.bestScore);
  }
  updateUndoButtonVisibility2048();

  if (AppState2048.gameOver) clearSaved2048Game();
  else save2048Game();
}

function updateUndoButtonVisibility2048() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppState2048.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppState2048.gameOver));
}

document.addEventListener("DOMContentLoaded", initTwenty48App);
