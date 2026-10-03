// fourinarow-app.js
// Wires FourInARowCore/FourInARowAi to the fourinarow.html UI. The
// board is a plain 6x7 grid of uniform squares (mirrors reversi-app.js
// - a real Connect Four board isn't checkered either). Clicking any
// cell in a column drops a disc into that column's lowest empty slot,
// regardless of which row was actually clicked.

const AppStateFourInARow = {
  mode: "offline",        // "offline" | "offline-ai"
  board: FourInARowCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  lastMove: null,         // {row, col} of the latest disc, for the board marker
  undoStack: []
};

const FOURINAROW_SAVE_KEY = "einkchess_save_fourinarow";

function saveFourInARowGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(FOURINAROW_SAVE_KEY, {
    mode: AppStateFourInARow.mode,
    board: AppStateFourInARow.board,
    turn: AppStateFourInARow.turn,
    humanColor: AppStateFourInARow.humanColor,
    aiLevel: AppStateFourInARow.aiLevel,
    moveCount: AppStateFourInARow.moveCount
  });
}

function clearSavedFourInARowGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(FOURINAROW_SAVE_KEY);
}

function recordFourInARowStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateFourInARow.mode !== "offline-ai") return;
  GameStats.record("fourinarow", outcome);
}

function colorNameFourInARow(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusFourInARow(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultFourInARow(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleFourInARow(winner) {
  if (AppStateFourInARow.mode === "offline-ai") {
    return winner === AppStateFourInARow.humanColor ? "You win!" : "You lose";
  }
  return colorNameFourInARow(winner) + " wins";
}

function announceGameResultFourInARow(resultCode, message) {
  setGameResultFourInARow(message);
  setStatusFourInARow("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackFourInARow() {
  AppStateFourInARow.undoStack = [];
}

function pushUndoSnapshotFourInARow() {
  AppStateFourInARow.undoStack.push({
    board: AppStateFourInARow.board.map((row) => row.slice()),
    turn: AppStateFourInARow.turn,
    gameOver: AppStateFourInARow.gameOver,
    moveCount: AppStateFourInARow.moveCount,
    lastMove: AppStateFourInARow.lastMove
  });
}

function initFourInARowApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("fourinarow-color-choice");
  const levelInline = document.getElementById("fourinarow-level-inline");
  const startGameBtn = document.getElementById("start-fourinarow-game");
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

  function startNewGameFourInARow(mode, humanColor, level) {
    AppStateFourInARow.mode = mode;
    AppStateFourInARow.board = FourInARowCore.createInitialBoard();
    AppStateFourInARow.turn = "b";
    AppStateFourInARow.humanColor = humanColor;
    AppStateFourInARow.aiLevel = level;
    AppStateFourInARow.gameOver = false;
    AppStateFourInARow.moveCount = 0;
    AppStateFourInARow.lastMove = null;
    resetUndoStackFourInARow();
    setGameResultFourInARow("");
    showBoardSectionFourInARow();
    buildFourInARowBoardDOM();
    updateFourInARowBoard();
    updateGameLabelsFourInARow();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusFourInARow("board-info", "Computer thinking…");
      setTimeout(aiTurnFourInARow, AiPacing.delay(300));
    } else {
      setStatusFourInARow("board-info", colorNameFourInARow(AppStateFourInARow.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameFourInARow("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateFourInARow.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusFourInARow("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='fourinarow-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "white" ? "w" : "b", ["w", "b"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameFourInARow("offline", "b", 0);
      setStatusFourInARow("offline-fourinarow-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameFourInARow("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusFourInARow("offline-fourinarow-status",
      RandomStart.label("You play " + colorNameFourInARow(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateFourInARow.gameOver) return;
      const loser = AppStateFourInARow.turn;
      const winner = FourInARowCore.otherColor(loser);
      AppStateFourInARow.gameOver = true;
      announceGameResultFourInARow(resultTitleFourInARow(winner), colorNameFourInARow(winner) + " wins by resignation.");
      recordFourInARowStatsIfVsAi("loss");
      updateGameLabelsFourInARow();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(FOURINAROW_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateFourInARow.mode = savedGame.mode;
    AppStateFourInARow.board = savedGame.board;
    AppStateFourInARow.turn = savedGame.turn;
    AppStateFourInARow.humanColor = savedGame.humanColor;
    AppStateFourInARow.aiLevel = savedGame.aiLevel;
    AppStateFourInARow.moveCount = savedGame.moveCount;
    AppStateFourInARow.lastMove = null;
    AppStateFourInARow.gameOver = false;
    resetUndoStackFourInARow();
    setActiveModeButton(AppStateFourInARow.mode);
    setGameResultFourInARow("");
    showBoardSectionFourInARow();
    buildFourInARowBoardDOM();
    updateFourInARowBoard();
    updateGameLabelsFourInARow();
    if (AppStateFourInARow.mode === "offline-ai" && AppStateFourInARow.turn !== AppStateFourInARow.humanColor) {
      setStatusFourInARow("board-info", "Computer thinking…");
      setTimeout(aiTurnFourInARow, AiPacing.delay(300));
    } else {
      setStatusFourInARow("board-info", colorNameFourInARow(AppStateFourInARow.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onFourInARowSquareClick(e) {
  const col = parseInt(e.currentTarget.dataset.col, 10);
  attemptFourInARowMove(col);
}

function attemptFourInARowMove(col) {
  if (AppStateFourInARow.gameOver) {
    setStatusFourInARow("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateFourInARow.mode === "offline-ai" && AppStateFourInARow.turn !== AppStateFourInARow.humanColor) {
    setStatusFourInARow("board-info", "Computer to move.");
    return;
  }
  if (FourInARowCore.landingRow(AppStateFourInARow.board, col) === -1) return; // column full - silently ignore

  applyFourInARowMove(col);
}

function applyFourInARowMove(col) {
  pushUndoSnapshotFourInARow();
  const mover = AppStateFourInARow.turn;
  const row = FourInARowCore.landingRow(AppStateFourInARow.board, col);
  const result = FourInARowCore.applyMove(AppStateFourInARow.board, mover, col);
  AppStateFourInARow.lastMove = { row, col };
  AppStateFourInARow.board = result.board;
  AppStateFourInARow.moveCount++;
  updateFourInARowBoard();
  updateGameLabelsFourInARow();

  const winner = FourInARowCore.getWinner(AppStateFourInARow.board);
  if (winner) {
    AppStateFourInARow.gameOver = true;
    const winnerName = colorNameFourInARow(winner);
    announceGameResultFourInARow(resultTitleFourInARow(winner), winnerName + " wins - four in a row!");
    recordFourInARowStatsIfVsAi(winner === AppStateFourInARow.humanColor ? "win" : "loss");
    updateGameLabelsFourInARow();
    return;
  }
  if (FourInARowCore.isFull(AppStateFourInARow.board)) {
    AppStateFourInARow.gameOver = true;
    announceGameResultFourInARow("Draw", "It's a draw - the board is full!");
    recordFourInARowStatsIfVsAi("draw");
    updateGameLabelsFourInARow();
    return;
  }

  AppStateFourInARow.turn = FourInARowCore.otherColor(mover);
  updateFourInARowBoard();
  updateGameLabelsFourInARow();
  maybeTriggerAiTurnFourInARow();
  if (!(AppStateFourInARow.mode === "offline-ai" && AppStateFourInARow.turn !== AppStateFourInARow.humanColor)) {
    setStatusFourInARow("board-info", colorNameFourInARow(mover) + " played. " + colorNameFourInARow(AppStateFourInARow.turn) + " to move.");
  }
}

function maybeTriggerAiTurnFourInARow() {
  if (AppStateFourInARow.gameOver) return;
  if (AppStateFourInARow.mode === "offline-ai" && AppStateFourInARow.turn !== AppStateFourInARow.humanColor) {
    setTimeout(aiTurnFourInARow, AiPacing.delay(400));
  }
}

function aiTurnFourInARow() {
  if (AppStateFourInARow.mode !== "offline-ai" || AppStateFourInARow.gameOver) return;
  const aiColor = FourInARowCore.otherColor(AppStateFourInARow.humanColor);
  if (AppStateFourInARow.turn !== aiColor) return;

  setStatusFourInARow("board-info", "Computer thinking…");
  // The position this search is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = AppStateFourInARow.board;
  setTimeout(() => {
    if (AppStateFourInARow.gameOver || AppStateFourInARow.board !== scheduledFor || AppStateFourInARow.turn !== aiColor) return;
    const col = FourInARowAi.chooseMove(AppStateFourInARow.board, aiColor, AppStateFourInARow.aiLevel);
    if (col === null || col === undefined) return;
    applyFourInARowMove(col);
  }, AiPacing.delay(300));
}

function undoLastMove() {
  if (!AppStateFourInARow.undoStack || !AppStateFourInARow.undoStack.length) return;
  let prev = AppStateFourInARow.undoStack.pop();
  if (AppStateFourInARow.mode === "offline-ai") {
    while (prev.turn !== AppStateFourInARow.humanColor && AppStateFourInARow.undoStack.length) {
      prev = AppStateFourInARow.undoStack.pop();
    }
  }
  AppStateFourInARow.board = prev.board;
  AppStateFourInARow.turn = prev.turn;
  AppStateFourInARow.gameOver = prev.gameOver;
  AppStateFourInARow.moveCount = prev.moveCount;
  AppStateFourInARow.lastMove = prev.lastMove || null;
  setGameResultFourInARow("");
  updateFourInARowBoard();
  updateGameLabelsFourInARow();
  setStatusFourInARow("board-info", "Move undone. " + colorNameFourInARow(AppStateFourInARow.turn) + " to move.");
}

function showBoardSectionFourInARow() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board rendering (mirrors reversi-app.js's uniform float-grid approach) ***/

function buildFourInARowBoardDOM() {
  const boardEl = document.getElementById("fourinarow-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < FourInARowCore.ROWS; r++) {
    for (let c = 0; c < FourInARowCore.COLS; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square c4-square";
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "c4-piece";
      square.appendChild(piece);
      square.addEventListener("click", onFourInARowSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureFourInARowSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureFourInARowSquareAspectRatio);
  } else {
    setTimeout(ensureFourInARowSquareAspectRatio, 0);
  }
  ensureFourInARowResizeHandler();
}

let einkFourInARowResizeHandlerAttached = false;
let einkFourInARowResizeTimeoutId = null;

function ensureFourInARowSquareAspectRatio() {
  const boardEl = document.getElementById("fourinarow-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / FourInARowCore.COLS;
  boardEl.querySelectorAll(".c4-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureFourInARowResizeHandler() {
  if (einkFourInARowResizeHandlerAttached) return;
  einkFourInARowResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkFourInARowResizeTimeoutId !== null) clearTimeout(einkFourInARowResizeTimeoutId);
    einkFourInARowResizeTimeoutId = setTimeout(() => {
      einkFourInARowResizeTimeoutId = null;
      ensureFourInARowSquareAspectRatio();
    }, 150);
  });
}

function updateFourInARowBoard() {
  const boardEl = document.getElementById("fourinarow-board");
  if (!boardEl) return;

  const legalCols = AppStateFourInARow.gameOver
    ? []
    : FourInARowCore.getLegalMoves(AppStateFourInARow.board, AppStateFourInARow.turn);
  // Only the topmost empty cell of each playable column is highlighted
  // as the "drop here" landing spot, even though clicking anywhere in
  // that column works.
  const landingSpots = new Set(legalCols.map((c) => FourInARowCore.landingRow(AppStateFourInARow.board, c) + "," + c));

  boardEl.querySelectorAll(".c4-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateFourInARow.board[r][c];
    const pieceEl = sq.querySelector(".c4-piece");
    if (pieceEl) {
      pieceEl.classList.remove("c4-piece-black", "c4-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "c4-piece-black" : "c4-piece-white");
    }
    const isLanding = landingSpots.has(r + "," + c);
    sq.classList.toggle("c4-square-movable", isLanding);
    const last = AppStateFourInARow.lastMove;
    sq.classList.toggle("lm-to", !!last && last.row === r && last.col === c);
    sq.disabled = !legalCols.includes(c);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " disc" : ", empty";
    if (isLanding) label += ", drop here";
    I18n.setAria(sq, label);
  });
}

function updateGameLabelsFourInARow() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateFourInARow.moveCount ? "Move " + AppStateFourInARow.moveCount : "");
  updateUndoButtonVisibilityFourInARow();
  updateResignVisibilityFourInARow();

  if (AppStateFourInARow.gameOver) clearSavedFourInARowGame();
  else saveFourInARowGame();
}

function updateUndoButtonVisibilityFourInARow() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateFourInARow.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateFourInARow.gameOver));
}

function updateResignVisibilityFourInARow() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateFourInARow.gameOver);
}

document.addEventListener("DOMContentLoaded", initFourInARowApp);
