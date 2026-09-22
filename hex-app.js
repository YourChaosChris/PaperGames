// hex-app.js
// Wires HexCore/HexAi to the hex.html UI. Hex's board is a rhombus of
// hexagonal cells, each row shifted right relative to the one above -
// nothing like a square float-grid - so it uses percentage-based
// absolute positioning (the same technique already proven for Go's
// board), with each cell clipped into an actual hexagon shape and a
// JS-enforced aspect ratio (the rhombus is noticeably wider than it
// is tall, unlike every other board in this app, so the ratio itself
// is computed from the geometry below rather than assumed to be 1:1).
//
// Stones are told apart structurally, not by color alone (a filled
// hexagon for Red, an outlined one for Blue), and each player's two
// target edges get a distinct thicker border so it's clear which
// side is trying to connect where without relying on color for that
// either.

const AppStateHex = {
  mode: "offline",        // "offline" | "offline-ai"
  state: HexCore.createInitialState(),
  turn: "r",              // "r" | "b" - Red moves first
  lastMove: null,         // [r,c] | null
  humanColor: "r",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const HEX_SAVE_KEY = "einkchess_save_hex";

function saveHexGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(HEX_SAVE_KEY, {
    mode: AppStateHex.mode,
    state: AppStateHex.state,
    turn: AppStateHex.turn,
    lastMove: AppStateHex.lastMove,
    humanColor: AppStateHex.humanColor,
    aiLevel: AppStateHex.aiLevel,
    moveCount: AppStateHex.moveCount
  });
}

function clearSavedHexGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(HEX_SAVE_KEY);
}

function recordHexStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateHex.mode !== "offline-ai") return;
  GameStats.record("hex", outcome);
}

function colorNameHex(color) {
  return color === "r" ? "Red" : "Blue";
}

function setStatusHex(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultHex(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleHex(winner) {
  if (AppStateHex.mode === "offline-ai") {
    return winner === AppStateHex.humanColor ? "You win!" : "You lose";
  }
  return colorNameHex(winner) + " wins";
}

function announceGameResultHex(resultCode, message) {
  setGameResultHex(message);
  setStatusHex("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackHex() {
  AppStateHex.undoStack = [];
}

function pushUndoSnapshotHex() {
  AppStateHex.undoStack.push({
    state: HexCore.cloneState(AppStateHex.state),
    turn: AppStateHex.turn,
    gameOver: AppStateHex.gameOver,
    moveCount: AppStateHex.moveCount,
    lastMove: AppStateHex.lastMove
  });
}

function initHexApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("hex-color-choice");
  const levelInline = document.getElementById("hex-level-inline");
  const startGameBtn = document.getElementById("start-hex-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibility() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

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

  function startNewGame(mode, humanColor, level) {
    AppStateHex.mode = mode;
    AppStateHex.state = HexCore.createInitialState();
    AppStateHex.turn = "r";
    AppStateHex.lastMove = null;
    AppStateHex.humanColor = humanColor;
    AppStateHex.aiLevel = level;
    AppStateHex.gameOver = false;
    AppStateHex.moveCount = 0;
    resetUndoStackHex();
    setGameResultHex("");
    showBoardSectionHex();
    buildHexBoardDOM();
    updateHexBoard();
    updateGameLabelsHex();

    if (mode === "offline-ai" && humanColor !== "r") {
      setStatusHex("board-info", "Computer thinking…");
      setTimeout(aiTurnHex, 300);
    } else {
      setStatusHex("board-info", colorNameHex(AppStateHex.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "r", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateHex.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusHex("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='hex-color']:checked");
    const humanColor = colorInput && colorInput.value === "b" ? "b" : "r";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "r", 0);
      setStatusHex("offline-hex-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusHex("offline-hex-status",
      "You play " + colorNameHex(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateHex.gameOver) return;
      const loser = AppStateHex.turn;
      const winner = HexCore.otherPlayer(loser);
      AppStateHex.gameOver = true;
      announceGameResultHex(resultTitleHex(winner), colorNameHex(winner) + " wins by resignation.");
      recordHexStatsIfVsAi("loss");
      updateGameLabelsHex();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(HEX_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateHex.mode = savedGame.mode;
    AppStateHex.state = savedGame.state;
    AppStateHex.turn = savedGame.turn;
    AppStateHex.lastMove = savedGame.lastMove;
    AppStateHex.humanColor = savedGame.humanColor;
    AppStateHex.aiLevel = savedGame.aiLevel;
    AppStateHex.moveCount = savedGame.moveCount;
    AppStateHex.gameOver = false;
    resetUndoStackHex();
    setActiveModeButton(AppStateHex.mode);
    setGameResultHex("");
    showBoardSectionHex();
    buildHexBoardDOM();
    updateHexBoard();
    updateGameLabelsHex();
    if (AppStateHex.mode === "offline-ai" && AppStateHex.turn !== AppStateHex.humanColor) {
      setStatusHex("board-info", "Computer thinking…");
      setTimeout(aiTurnHex, 300);
    } else {
      setStatusHex("board-info", colorNameHex(AppStateHex.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isHumanTurnHex() {
  if (AppStateHex.gameOver) return false;
  if (AppStateHex.mode === "offline-ai" && AppStateHex.turn !== AppStateHex.humanColor) return false;
  return true;
}

function onHexCellClick(r, c) {
  if (!isHumanTurnHex()) {
    setStatusHex("board-info", "Computer to move.");
    return;
  }
  if (AppStateHex.state.board[r][c]) return;
  applyHexMove([r, c]);
}

function applyHexMove(move) {
  pushUndoSnapshotHex();
  const mover = AppStateHex.turn;
  AppStateHex.state = HexCore.applyMove(AppStateHex.state, mover, move);
  AppStateHex.lastMove = move;
  AppStateHex.moveCount++;
  AppStateHex.turn = HexCore.otherPlayer(mover);
  updateHexBoard();
  updateGameLabelsHex();

  if (AppStateHex.state.gameOver) {
    AppStateHex.gameOver = true;
    const winnerName = colorNameHex(AppStateHex.state.winner);
    announceGameResultHex(resultTitleHex(AppStateHex.state.winner), winnerName + " wins by connecting both sides!");
    recordHexStatsIfVsAi(AppStateHex.state.winner === AppStateHex.humanColor ? "win" : "loss");
    updateGameLabelsHex();
    return;
  }

  setStatusHex("board-info", colorNameHex(mover) + " played. " + colorNameHex(AppStateHex.turn) + " to move.");

  if (AppStateHex.mode === "offline-ai" && AppStateHex.turn !== AppStateHex.humanColor) {
    setStatusHex("board-info", "Computer thinking…");
    setTimeout(aiTurnHex, 350);
  }
}

function aiTurnHex() {
  if (AppStateHex.mode !== "offline-ai" || AppStateHex.gameOver) return;
  const aiColor = HexCore.otherPlayer(AppStateHex.humanColor);
  if (AppStateHex.turn !== aiColor) return;

  const move = HexAi.chooseMove(AppStateHex.state, aiColor, AppStateHex.aiLevel);
  if (!move) return;
  applyHexMove(move);
}

function undoLastMove() {
  if (!AppStateHex.undoStack || !AppStateHex.undoStack.length) return;
  let prev = AppStateHex.undoStack.pop();
  if (AppStateHex.mode === "offline-ai") {
    while (prev.turn !== AppStateHex.humanColor && AppStateHex.undoStack.length) {
      prev = AppStateHex.undoStack.pop();
    }
  }
  AppStateHex.state = prev.state;
  AppStateHex.turn = prev.turn;
  AppStateHex.gameOver = prev.gameOver;
  AppStateHex.moveCount = prev.moveCount;
  AppStateHex.lastMove = prev.lastMove;
  setGameResultHex("");
  updateHexBoard();
  updateGameLabelsHex();
  setStatusHex("board-info", "Move undone. " + colorNameHex(AppStateHex.turn) + " to move.");
}

function showBoardSectionHex() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) menuToggle.textContent = "☰ Menu";
}

/*** Board rendering: a rhombus of hexagons via percentage-based
     absolute positioning (the same technique as Go's board), with a
     JS-enforced non-square aspect ratio computed from the geometry
     below. ***/

const HEX_N = HexCore.SIZE;
const HEX_UNIT = 100;      // one hex's nominal width/height, in arbitrary units
const HEX_ROW_STEP = HEX_UNIT * 0.75;
const HEX_COL_SHIFT = HEX_UNIT * 0.5;
const HEX_TOTAL_W = HEX_N * HEX_UNIT + (HEX_N - 1) * HEX_COL_SHIFT;
const HEX_TOTAL_H = HEX_UNIT + (HEX_N - 1) * HEX_ROW_STEP;
const HEX_ASPECT = HEX_TOTAL_H / HEX_TOTAL_W;

function buildHexBoardDOM() {
  const boardEl = document.getElementById("hex-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < HEX_N; r++) {
    for (let c = 0; c < HEX_N; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "hex-cell";
      const leftUnits = c * HEX_UNIT + r * HEX_COL_SHIFT;
      const topUnits = r * HEX_ROW_STEP;
      cell.style.left = (leftUnits / HEX_TOTAL_W * 100) + "%";
      cell.style.top = (topUnits / HEX_TOTAL_H * 100) + "%";
      cell.style.width = (HEX_UNIT / HEX_TOTAL_W * 100) + "%";
      cell.style.height = (HEX_UNIT / HEX_TOTAL_H * 100) + "%";
      cell.dataset.row = r;
      cell.dataset.col = c;

      const border = document.createElement("span");
      border.className = "hex-cell-border";
      cell.appendChild(border);
      const fill = document.createElement("span");
      fill.className = "hex-cell-fill";
      cell.appendChild(fill);

      const stone = document.createElement("span");
      stone.className = "hex-stone";
      cell.appendChild(stone);

      cell.addEventListener("click", () => onHexCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  ensureHexBoardAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureHexBoardAspectRatio);
  } else {
    setTimeout(ensureHexBoardAspectRatio, 0);
  }
  ensureHexResizeHandler();
}

let einkHexResizeHandlerAttached = false;
let einkHexResizeTimeoutId = null;

function ensureHexBoardAspectRatio() {
  const boardEl = document.getElementById("hex-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * HEX_ASPECT) + "px";
}

function ensureHexResizeHandler() {
  if (einkHexResizeHandlerAttached) return;
  einkHexResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkHexResizeTimeoutId !== null) clearTimeout(einkHexResizeTimeoutId);
    einkHexResizeTimeoutId = setTimeout(() => {
      einkHexResizeTimeoutId = null;
      ensureHexBoardAspectRatio();
    }, 150);
  });
}

function updateHexBoard() {
  const boardEl = document.getElementById("hex-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".hex-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const piece = AppStateHex.state.board[r][c];
    const stoneEl = cell.querySelector(".hex-stone");
    if (stoneEl) {
      stoneEl.classList.remove("hex-stone-r", "hex-stone-b");
      if (piece) stoneEl.classList.add(piece === "r" ? "hex-stone-r" : "hex-stone-b");
    }
    cell.classList.toggle("last-move", !!(AppStateHex.lastMove && AppStateHex.lastMove[0] === r && AppStateHex.lastMove[1] === c));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + colorNameHex(piece) : ", empty";
    cell.setAttribute("aria-label", label);
  });
}

function updateGameLabelsHex() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateHex.moveCount ? "Move " + AppStateHex.moveCount : "";
  updateUndoButtonVisibilityHex();
  updateResignVisibilityHex();

  if (AppStateHex.gameOver) clearSavedHexGame();
  else saveHexGame();
}

function updateUndoButtonVisibilityHex() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateHex.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateHex.gameOver));
}

function updateResignVisibilityHex() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateHex.gameOver);
}

document.addEventListener("DOMContentLoaded", initHexApp);
