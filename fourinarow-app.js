// connectfour-app.js
// Wires ConnectFourCore/ConnectFourAi to the connectfour.html UI. The
// board is a plain 6x7 grid of uniform squares (mirrors reversi-app.js
// - a real Connect Four board isn't checkered either). Clicking any
// cell in a column drops a disc into that column's lowest empty slot,
// regardless of which row was actually clicked.

const AppStateConnectFour = {
  mode: "offline",        // "offline" | "offline-ai"
  board: ConnectFourCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const CONNECTFOUR_SAVE_KEY = "einkchess_save_connectfour";

function saveConnectFourGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(CONNECTFOUR_SAVE_KEY, {
    mode: AppStateConnectFour.mode,
    board: AppStateConnectFour.board,
    turn: AppStateConnectFour.turn,
    humanColor: AppStateConnectFour.humanColor,
    aiLevel: AppStateConnectFour.aiLevel,
    moveCount: AppStateConnectFour.moveCount
  });
}

function clearSavedConnectFourGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(CONNECTFOUR_SAVE_KEY);
}

function recordConnectFourStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateConnectFour.mode !== "offline-ai") return;
  GameStats.record("connectfour", outcome);
}

function colorNameConnectFour(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusConnectFour(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultConnectFour(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleConnectFour(winner) {
  if (AppStateConnectFour.mode === "offline-ai") {
    return winner === AppStateConnectFour.humanColor ? "You win!" : "You lose";
  }
  return colorNameConnectFour(winner) + " wins";
}

function announceGameResultConnectFour(resultCode, message) {
  setGameResultConnectFour(message);
  setStatusConnectFour("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackConnectFour() {
  AppStateConnectFour.undoStack = [];
}

function pushUndoSnapshotConnectFour() {
  AppStateConnectFour.undoStack.push({
    board: AppStateConnectFour.board.map((row) => row.slice()),
    turn: AppStateConnectFour.turn,
    gameOver: AppStateConnectFour.gameOver,
    moveCount: AppStateConnectFour.moveCount
  });
}

function initConnectFourApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("connectfour-color-choice");
  const levelInline = document.getElementById("connectfour-level-inline");
  const startGameBtn = document.getElementById("start-connectfour-game");
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

  function startNewGameConnectFour(mode, humanColor, level) {
    AppStateConnectFour.mode = mode;
    AppStateConnectFour.board = ConnectFourCore.createInitialBoard();
    AppStateConnectFour.turn = "b";
    AppStateConnectFour.humanColor = humanColor;
    AppStateConnectFour.aiLevel = level;
    AppStateConnectFour.gameOver = false;
    AppStateConnectFour.moveCount = 0;
    resetUndoStackConnectFour();
    setGameResultConnectFour("");
    showBoardSectionConnectFour();
    buildConnectFourBoardDOM();
    updateConnectFourBoard();
    updateGameLabelsConnectFour();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusConnectFour("board-info", "Computer thinking…");
      setTimeout(aiTurnConnectFour, 300);
    } else {
      setStatusConnectFour("board-info", colorNameConnectFour(AppStateConnectFour.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameConnectFour("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateConnectFour.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusConnectFour("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='connectfour-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameConnectFour("offline", "b", 0);
      setStatusConnectFour("offline-connectfour-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameConnectFour("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusConnectFour("offline-connectfour-status",
      "You play " + colorNameConnectFour(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateConnectFour.gameOver) return;
      const loser = AppStateConnectFour.turn;
      const winner = ConnectFourCore.otherColor(loser);
      AppStateConnectFour.gameOver = true;
      announceGameResultConnectFour(resultTitleConnectFour(winner), colorNameConnectFour(winner) + " wins by resignation.");
      recordConnectFourStatsIfVsAi("loss");
      updateGameLabelsConnectFour();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(CONNECTFOUR_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateConnectFour.mode = savedGame.mode;
    AppStateConnectFour.board = savedGame.board;
    AppStateConnectFour.turn = savedGame.turn;
    AppStateConnectFour.humanColor = savedGame.humanColor;
    AppStateConnectFour.aiLevel = savedGame.aiLevel;
    AppStateConnectFour.moveCount = savedGame.moveCount;
    AppStateConnectFour.gameOver = false;
    resetUndoStackConnectFour();
    setActiveModeButton(AppStateConnectFour.mode);
    setGameResultConnectFour("");
    showBoardSectionConnectFour();
    buildConnectFourBoardDOM();
    updateConnectFourBoard();
    updateGameLabelsConnectFour();
    if (AppStateConnectFour.mode === "offline-ai" && AppStateConnectFour.turn !== AppStateConnectFour.humanColor) {
      setStatusConnectFour("board-info", "Computer thinking…");
      setTimeout(aiTurnConnectFour, 300);
    } else {
      setStatusConnectFour("board-info", colorNameConnectFour(AppStateConnectFour.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onConnectFourSquareClick(e) {
  const col = parseInt(e.currentTarget.dataset.col, 10);
  attemptConnectFourMove(col);
}

function attemptConnectFourMove(col) {
  if (AppStateConnectFour.gameOver) {
    setStatusConnectFour("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateConnectFour.mode === "offline-ai" && AppStateConnectFour.turn !== AppStateConnectFour.humanColor) {
    setStatusConnectFour("board-info", "Computer to move.");
    return;
  }
  if (ConnectFourCore.landingRow(AppStateConnectFour.board, col) === -1) return; // column full - silently ignore

  applyConnectFourMove(col);
}

function applyConnectFourMove(col) {
  pushUndoSnapshotConnectFour();
  const mover = AppStateConnectFour.turn;
  const result = ConnectFourCore.applyMove(AppStateConnectFour.board, mover, col);
  AppStateConnectFour.board = result.board;
  AppStateConnectFour.moveCount++;
  updateConnectFourBoard();
  updateGameLabelsConnectFour();

  const winner = ConnectFourCore.getWinner(AppStateConnectFour.board);
  if (winner) {
    AppStateConnectFour.gameOver = true;
    const winnerName = colorNameConnectFour(winner);
    announceGameResultConnectFour(resultTitleConnectFour(winner), winnerName + " wins - four in a row!");
    recordConnectFourStatsIfVsAi(winner === AppStateConnectFour.humanColor ? "win" : "loss");
    updateGameLabelsConnectFour();
    return;
  }
  if (ConnectFourCore.isFull(AppStateConnectFour.board)) {
    AppStateConnectFour.gameOver = true;
    announceGameResultConnectFour("Draw", "It's a draw - the board is full!");
    recordConnectFourStatsIfVsAi("draw");
    updateGameLabelsConnectFour();
    return;
  }

  AppStateConnectFour.turn = ConnectFourCore.otherColor(mover);
  updateConnectFourBoard();
  updateGameLabelsConnectFour();
  maybeTriggerAiTurnConnectFour();
  if (!(AppStateConnectFour.mode === "offline-ai" && AppStateConnectFour.turn !== AppStateConnectFour.humanColor)) {
    setStatusConnectFour("board-info", colorNameConnectFour(mover) + " played. " + colorNameConnectFour(AppStateConnectFour.turn) + " to move.");
  }
}

function maybeTriggerAiTurnConnectFour() {
  if (AppStateConnectFour.gameOver) return;
  if (AppStateConnectFour.mode === "offline-ai" && AppStateConnectFour.turn !== AppStateConnectFour.humanColor) {
    setTimeout(aiTurnConnectFour, 400);
  }
}

function aiTurnConnectFour() {
  if (AppStateConnectFour.mode !== "offline-ai" || AppStateConnectFour.gameOver) return;
  const aiColor = ConnectFourCore.otherColor(AppStateConnectFour.humanColor);
  if (AppStateConnectFour.turn !== aiColor) return;

  setStatusConnectFour("board-info", "Computer thinking…");
  setTimeout(() => {
    const col = ConnectFourAi.chooseMove(AppStateConnectFour.board, aiColor, AppStateConnectFour.aiLevel);
    if (col === null || col === undefined) return;
    applyConnectFourMove(col);
  }, 300);
}

function undoLastMove() {
  if (!AppStateConnectFour.undoStack || !AppStateConnectFour.undoStack.length) return;
  let prev = AppStateConnectFour.undoStack.pop();
  if (AppStateConnectFour.mode === "offline-ai") {
    while (prev.turn !== AppStateConnectFour.humanColor && AppStateConnectFour.undoStack.length) {
      prev = AppStateConnectFour.undoStack.pop();
    }
  }
  AppStateConnectFour.board = prev.board;
  AppStateConnectFour.turn = prev.turn;
  AppStateConnectFour.gameOver = prev.gameOver;
  AppStateConnectFour.moveCount = prev.moveCount;
  setGameResultConnectFour("");
  updateConnectFourBoard();
  updateGameLabelsConnectFour();
  setStatusConnectFour("board-info", "Move undone. " + colorNameConnectFour(AppStateConnectFour.turn) + " to move.");
}

function showBoardSectionConnectFour() {
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

/*** Board rendering (mirrors reversi-app.js's uniform float-grid approach) ***/

function buildConnectFourBoardDOM() {
  const boardEl = document.getElementById("connectfour-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < ConnectFourCore.ROWS; r++) {
    for (let c = 0; c < ConnectFourCore.COLS; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square c4-square";
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "c4-piece";
      square.appendChild(piece);
      square.addEventListener("click", onConnectFourSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureConnectFourSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureConnectFourSquareAspectRatio);
  } else {
    setTimeout(ensureConnectFourSquareAspectRatio, 0);
  }
  ensureConnectFourResizeHandler();
}

let einkConnectFourResizeHandlerAttached = false;
let einkConnectFourResizeTimeoutId = null;

function ensureConnectFourSquareAspectRatio() {
  const boardEl = document.getElementById("connectfour-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / ConnectFourCore.COLS;
  boardEl.querySelectorAll(".c4-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureConnectFourResizeHandler() {
  if (einkConnectFourResizeHandlerAttached) return;
  einkConnectFourResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkConnectFourResizeTimeoutId !== null) clearTimeout(einkConnectFourResizeTimeoutId);
    einkConnectFourResizeTimeoutId = setTimeout(() => {
      einkConnectFourResizeTimeoutId = null;
      ensureConnectFourSquareAspectRatio();
    }, 150);
  });
}

function updateConnectFourBoard() {
  const boardEl = document.getElementById("connectfour-board");
  if (!boardEl) return;

  const legalCols = AppStateConnectFour.gameOver
    ? []
    : ConnectFourCore.getLegalMoves(AppStateConnectFour.board, AppStateConnectFour.turn);
  // Only the topmost empty cell of each playable column is highlighted
  // as the "drop here" landing spot, even though clicking anywhere in
  // that column works.
  const landingSpots = new Set(legalCols.map((c) => ConnectFourCore.landingRow(AppStateConnectFour.board, c) + "," + c));

  boardEl.querySelectorAll(".c4-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateConnectFour.board[r][c];
    const pieceEl = sq.querySelector(".c4-piece");
    if (pieceEl) {
      pieceEl.classList.remove("c4-piece-black", "c4-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "c4-piece-black" : "c4-piece-white");
    }
    const isLanding = landingSpots.has(r + "," + c);
    sq.classList.toggle("c4-square-movable", isLanding);
    sq.disabled = !legalCols.includes(c);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " disc" : ", empty";
    if (isLanding) label += ", drop here";
    sq.setAttribute("aria-label", label);
  });
}

function updateGameLabelsConnectFour() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateConnectFour.moveCount ? "Move " + AppStateConnectFour.moveCount : "";
  updateUndoButtonVisibilityConnectFour();
  updateResignVisibilityConnectFour();

  if (AppStateConnectFour.gameOver) clearSavedConnectFourGame();
  else saveConnectFourGame();
}

function updateUndoButtonVisibilityConnectFour() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateConnectFour.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateConnectFour.gameOver));
}

function updateResignVisibilityConnectFour() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateConnectFour.gameOver);
}

document.addEventListener("DOMContentLoaded", initConnectFourApp);
