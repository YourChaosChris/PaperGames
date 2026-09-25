// mahjong-app.js
// Wires MahjongCore to the mahjong.html UI. Solitaire, like the other
// puzzles here - no opponent, no AI, no difficulty picker, since the
// board layout is always the same 80-tile layered "turtle" shape (see
// mahjong-core.js for why the deal is always guaranteed solvable
// rather than a plain random shuffle of symbols).
//
// The board uses absolute positioning on a percentage grid (the same
// approach as Go/Xiangqi/Gomoku's point grids) rather than the usual
// float-grid, since tiles overlap across three layers instead of
// sitting in a simple rectangular arrangement - each higher layer gets
// a small fixed pixel nudge up-and-left purely for the classic layered
// "mound" look, tiny enough not to throw off click targeting.
//
// Click a free tile to select it, then click a second free tile with
// the same symbol to clear both. Tiles are matched purely by their
// printed glyph, so nothing here depends on color to be readable on a
// monochrome E-Ink display.

const AppStateMahjong = {
  state: null,
  selected: null, // tile id or null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const MAHJONG_SAVE_KEY = "einkchess_save_mahjong";

function saveMahjongGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MAHJONG_SAVE_KEY, {
    state: AppStateMahjong.state,
    moveCount: AppStateMahjong.moveCount
  });
}

function clearSavedMahjongGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MAHJONG_SAVE_KEY);
}

function recordMahjongStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("mahjong", outcome);
}

function setStatusMahjong(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultMahjong(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultMahjong(title, message) {
  setGameResultMahjong(message);
  setStatusMahjong("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackMahjong() {
  AppStateMahjong.undoStack = [];
}

function pushUndoSnapshotMahjong() {
  AppStateMahjong.undoStack.push({
    state: { removed: AppStateMahjong.state.removed.slice(), symbols: AppStateMahjong.state.symbols },
    moveCount: AppStateMahjong.moveCount
  });
}

function initMahjongApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-mahjong-game");
  const shuffleBtn = document.getElementById("mahjong-shuffle-button");

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

  function startNewGameMahjong() {
    AppStateMahjong.state = MahjongCore.createInitialState();
    AppStateMahjong.selected = null;
    AppStateMahjong.gameOver = false;
    AppStateMahjong.moveCount = 0;
    resetUndoStackMahjong();
    setGameResultMahjong("");
    showBoardSectionMahjong();
    buildMahjongBoardDOM();
    updateMahjongBoard();
    updateGameLabelsMahjong();
    setStatusMahjong("board-info", "Click a free tile, then click its matching pair.");
  }

  startGameBtn.addEventListener("click", startNewGameMahjong);

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      if (!AppStateMahjong.state || AppStateMahjong.gameOver) return;
      pushUndoSnapshotMahjong();
      AppStateMahjong.state = MahjongCore.reshuffleRemaining(AppStateMahjong.state);
      AppStateMahjong.selected = null;
      AppStateMahjong.moveCount++;
      updateMahjongBoard();
      updateGameLabelsMahjong();
      setStatusMahjong("board-info", "Tiles reshuffled - a solution is still guaranteed from here.");
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(MAHJONG_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateMahjong.state = savedGame.state;
    AppStateMahjong.moveCount = savedGame.moveCount;
    AppStateMahjong.selected = null;
    AppStateMahjong.gameOver = false;
    resetUndoStackMahjong();
    setGameResultMahjong("");
    showBoardSectionMahjong();
    buildMahjongBoardDOM();
    updateMahjongBoard();
    updateGameLabelsMahjong();
    setStatusMahjong("board-info", "Click a free tile, then click its matching pair.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function onMahjongTileClick(id) {
  if (AppStateMahjong.gameOver || !AppStateMahjong.state) return;
  const state = AppStateMahjong.state;
  if (state.removed[id]) return;

  if (!MahjongCore.isFree(state, id)) {
    setStatusMahjong("board-info", "That tile is blocked - it can't be picked up yet.");
    return;
  }

  if (AppStateMahjong.selected === id) {
    AppStateMahjong.selected = null;
    updateMahjongBoard();
    setStatusMahjong("board-info", "Click a free tile, then click its matching pair.");
    return;
  }

  if (AppStateMahjong.selected === null) {
    AppStateMahjong.selected = id;
    updateMahjongBoard();
    setStatusMahjong("board-info", "Now click a matching free tile.");
    return;
  }

  if (MahjongCore.isMatch(state, AppStateMahjong.selected, id)) {
    pushUndoSnapshotMahjong();
    AppStateMahjong.state = MahjongCore.removePair(state, AppStateMahjong.selected, id);
    AppStateMahjong.selected = null;
    AppStateMahjong.moveCount++;
    updateMahjongBoard();
    updateGameLabelsMahjong();

    if (MahjongCore.isWon(AppStateMahjong.state)) {
      AppStateMahjong.gameOver = true;
      announceGameResultMahjong("Cleared!", "All tiles matched - well done!");
      recordMahjongStats("win");
      updateGameLabelsMahjong();
      return;
    }

    if (!MahjongCore.hasAnyMove(AppStateMahjong.state)) {
      setStatusMahjong("board-info", "No matches left - try Shuffle remaining tiles to keep going.");
      updateGameLabelsMahjong();
      return;
    }

    setStatusMahjong("board-info", "Click a free tile, then click its matching pair.");
  } else {
    // Not a match - just switch the selection to the newly clicked
    // free tile instead of erroring, so re-picking is a single click.
    AppStateMahjong.selected = id;
    updateMahjongBoard();
    setStatusMahjong("board-info", "Not a match. Now click a matching free tile.");
  }
}

function undoLastMove() {
  if (!AppStateMahjong.undoStack || !AppStateMahjong.undoStack.length) return;
  const prev = AppStateMahjong.undoStack.pop();
  AppStateMahjong.state = prev.state;
  AppStateMahjong.moveCount = prev.moveCount;
  AppStateMahjong.selected = null;
  AppStateMahjong.gameOver = false;
  setGameResultMahjong("");
  updateMahjongBoard();
  updateGameLabelsMahjong();
  setStatusMahjong("board-info", "Move undone.");
}

function showBoardSectionMahjong() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering (percentage grid across 3 overlapping layers) ***/

const MAHJONG_GRID_WIDTH = 16; // half-tile units - see mahjong-core.js's generateLayout
const MAHJONG_GRID_HEIGHT = 12;

function buildMahjongBoardDOM() {
  const boardEl = document.getElementById("mahjong-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  MahjongCore.LAYOUT.forEach((tile) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mahjong-tile";
    btn.dataset.id = tile.id;
    btn.style.left = (tile.cx / MAHJONG_GRID_WIDTH * 100) + "%";
    btn.style.top = (tile.cy / MAHJONG_GRID_HEIGHT * 100) + "%";
    btn.style.width = (2 / MAHJONG_GRID_WIDTH * 100) + "%";
    btn.style.height = (2 / MAHJONG_GRID_HEIGHT * 100) + "%";
    btn.style.zIndex = String(tile.layer + 1);
    btn.style.transform = "translate(" + (-tile.layer * 3) + "px, " + (-tile.layer * 3) + "px)";

    const label = document.createElement("span");
    label.className = "mahjong-tile-label";
    btn.appendChild(label);

    btn.addEventListener("click", () => onMahjongTileClick(tile.id));
    boardEl.appendChild(btn);
  });

  ensureMahjongAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureMahjongAspectRatio);
  } else {
    setTimeout(ensureMahjongAspectRatio, 0);
  }
  ensureMahjongResizeHandler();
}

let einkMahjongResizeHandlerAttached = false;
let einkMahjongResizeTimeoutId = null;

function ensureMahjongAspectRatio() {
  const boardEl = document.getElementById("mahjong-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * MAHJONG_GRID_HEIGHT / MAHJONG_GRID_WIDTH) + "px";
}

function ensureMahjongResizeHandler() {
  if (einkMahjongResizeHandlerAttached) return;
  einkMahjongResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkMahjongResizeTimeoutId !== null) clearTimeout(einkMahjongResizeTimeoutId);
    einkMahjongResizeTimeoutId = setTimeout(() => {
      einkMahjongResizeTimeoutId = null;
      ensureMahjongAspectRatio();
    }, 150);
  });
}

function updateMahjongBoard() {
  const boardEl = document.getElementById("mahjong-board");
  if (!boardEl || !AppStateMahjong.state) return;
  const state = AppStateMahjong.state;

  boardEl.querySelectorAll(".mahjong-tile").forEach((btn) => {
    const id = parseInt(btn.dataset.id, 10);
    const isRemoved = state.removed[id];
    btn.classList.toggle("hidden", isRemoved);
    if (isRemoved) return;

    const free = MahjongCore.isFree(state, id);
    btn.classList.toggle("mahjong-tile-blocked", !free);
    btn.classList.toggle("mahjong-tile-selected", AppStateMahjong.selected === id);

    const label = btn.querySelector(".mahjong-tile-label");
    if (label) label.textContent = state.symbols[id];
    I18n.setAria(btn, "Tile " + state.symbols[id] + (free ? ", free" : ", blocked"));
  });
}

function updateGameLabelsMahjong() {
  const meta = document.getElementById("game-meta");
  if (meta && AppStateMahjong.state) {
    const remaining = AppStateMahjong.state.removed.filter((r) => !r).length;
    I18n.setMsg(meta, remaining + " tiles left");
  }
  updateUndoButtonVisibilityMahjong();
  updateShuffleButtonVisibilityMahjong();

  if (AppStateMahjong.gameOver) clearSavedMahjongGame();
  else saveMahjongGame();
}

function updateUndoButtonVisibilityMahjong() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateMahjong.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateMahjong.gameOver));
}

function updateShuffleButtonVisibilityMahjong() {
  const btn = document.getElementById("mahjong-shuffle-button");
  if (!btn) return;
  btn.classList.toggle("hidden", AppStateMahjong.gameOver);
}

document.addEventListener("DOMContentLoaded", initMahjongApp);
