// gomoku-app.js
// Wires GomokuCore/GomokuAi to the gomoku.html UI. The board is a
// fixed 15x15 intersection grid, rendered exactly like go-app.js
// renders its own grid (absolute percentage positioning, a
// JS-enforced square board height since `aspect-ratio` alone is
// silently ignored on some E-Ink browsers) - stones sit on
// intersections, not inside squares, and never move or get captured
// once placed.

const AppStateGomoku = {
  mode: "offline",        // "offline" | "offline-ai"
  board: GomokuCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  lastMove: null,         // { r, c } | null
  moveCount: 0,
  undoStack: []
};

const GOMOKU_SAVE_KEY = "einkchess_save_gomoku";

function saveGomokuGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(GOMOKU_SAVE_KEY, {
    mode: AppStateGomoku.mode,
    board: AppStateGomoku.board,
    turn: AppStateGomoku.turn,
    humanColor: AppStateGomoku.humanColor,
    aiLevel: AppStateGomoku.aiLevel,
    lastMove: AppStateGomoku.lastMove,
    moveCount: AppStateGomoku.moveCount
  });
}

function clearSavedGomokuGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(GOMOKU_SAVE_KEY);
}

function recordGomokuStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateGomoku.mode !== "offline-ai") return;
  GameStats.record("gomoku", outcome);
}

function colorNameGomoku(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusGomoku(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultGomoku(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleGomoku(winner) {
  if (AppStateGomoku.mode === "offline-ai") {
    return winner === AppStateGomoku.humanColor ? "You win!" : "You lose";
  }
  return colorNameGomoku(winner) + " wins";
}

function announceGameResultGomoku(resultCode, message) {
  setGameResultGomoku(message);
  setStatusGomoku("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackGomoku() {
  AppStateGomoku.undoStack = [];
}

function pushUndoSnapshotGomoku() {
  AppStateGomoku.undoStack.push({
    board: AppStateGomoku.board.map((row) => row.slice()),
    turn: AppStateGomoku.turn,
    gameOver: AppStateGomoku.gameOver,
    lastMove: AppStateGomoku.lastMove,
    moveCount: AppStateGomoku.moveCount
  });
}

function initGomokuApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("gomoku-color-choice");
  const levelInline = document.getElementById("gomoku-level-inline");
  const startGameBtn = document.getElementById("start-gomoku-game");
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

  function startNewGameGomoku(mode, humanColor, level) {
    AppStateGomoku.mode = mode;
    AppStateGomoku.board = GomokuCore.createInitialBoard();
    AppStateGomoku.turn = "b";
    AppStateGomoku.humanColor = humanColor;
    AppStateGomoku.aiLevel = level;
    AppStateGomoku.gameOver = false;
    AppStateGomoku.lastMove = null;
    AppStateGomoku.moveCount = 0;
    resetUndoStackGomoku();
    setGameResultGomoku("");
    showBoardSectionGomoku();
    buildGomokuBoardDOM();
    updateGomokuBoard();
    updateGameLabelsGomoku();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusGomoku("board-info", "Computer thinking…");
      setTimeout(aiTurnGomoku, AiPacing.delay(300));
    } else {
      setStatusGomoku("board-info", colorNameGomoku(AppStateGomoku.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameGomoku("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateGomoku.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusGomoku("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='gomoku-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameGomoku("offline", "b", 0);
      setStatusGomoku("offline-gomoku-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameGomoku("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusGomoku("offline-gomoku-status",
      "You play " + colorNameGomoku(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateGomoku.gameOver) return;
      const loser = AppStateGomoku.turn;
      const winner = GomokuCore.otherColor(loser);
      AppStateGomoku.gameOver = true;
      announceGameResultGomoku(resultTitleGomoku(winner), colorNameGomoku(winner) + " wins by resignation.");
      recordGomokuStatsIfVsAi("loss");
      updateGameLabelsGomoku();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(GOMOKU_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateGomoku.mode = savedGame.mode;
    AppStateGomoku.board = savedGame.board;
    AppStateGomoku.turn = savedGame.turn;
    AppStateGomoku.humanColor = savedGame.humanColor;
    AppStateGomoku.aiLevel = savedGame.aiLevel;
    AppStateGomoku.lastMove = savedGame.lastMove;
    AppStateGomoku.moveCount = savedGame.moveCount;
    AppStateGomoku.gameOver = false;
    resetUndoStackGomoku();
    setActiveModeButton(AppStateGomoku.mode);
    setGameResultGomoku("");
    showBoardSectionGomoku();
    buildGomokuBoardDOM();
    updateGomokuBoard();
    updateGameLabelsGomoku();
    if (AppStateGomoku.mode === "offline-ai" && AppStateGomoku.turn !== AppStateGomoku.humanColor) {
      setStatusGomoku("board-info", "Computer thinking…");
      setTimeout(aiTurnGomoku, AiPacing.delay(300));
    } else {
      setStatusGomoku("board-info", colorNameGomoku(AppStateGomoku.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onGomokuPointClick(e) {
  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  attemptGomokuMove(r, c);
}

function attemptGomokuMove(r, c) {
  if (AppStateGomoku.gameOver) {
    setStatusGomoku("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateGomoku.mode === "offline-ai" && AppStateGomoku.turn !== AppStateGomoku.humanColor) {
    setStatusGomoku("board-info", "Computer to move.");
    return;
  }
  if (AppStateGomoku.board[r][c]) return; // occupied - silently ignore

  applyGomokuMove(r, c);
}

function applyGomokuMove(r, c) {
  pushUndoSnapshotGomoku();
  const mover = AppStateGomoku.turn;
  AppStateGomoku.board = GomokuCore.applyMove(AppStateGomoku.board, mover, r, c);
  AppStateGomoku.lastMove = { r, c };
  AppStateGomoku.moveCount++;
  updateGomokuBoard();
  updateGameLabelsGomoku();

  const winner = GomokuCore.getWinnerAt(AppStateGomoku.board, r, c);
  if (winner) {
    AppStateGomoku.gameOver = true;
    const winnerName = colorNameGomoku(winner);
    announceGameResultGomoku(resultTitleGomoku(winner), winnerName + " wins - five in a row!");
    recordGomokuStatsIfVsAi(winner === AppStateGomoku.humanColor ? "win" : "loss");
    updateGameLabelsGomoku();
    return;
  }
  if (GomokuCore.isFull(AppStateGomoku.board)) {
    AppStateGomoku.gameOver = true;
    announceGameResultGomoku("Draw", "It's a draw - the board is full!");
    recordGomokuStatsIfVsAi("draw");
    updateGameLabelsGomoku();
    return;
  }

  AppStateGomoku.turn = GomokuCore.otherColor(mover);
  updateGomokuBoard();
  updateGameLabelsGomoku();
  maybeTriggerAiTurnGomoku();
  if (!(AppStateGomoku.mode === "offline-ai" && AppStateGomoku.turn !== AppStateGomoku.humanColor)) {
    setStatusGomoku("board-info", colorNameGomoku(mover) + " played. " + colorNameGomoku(AppStateGomoku.turn) + " to move.");
  }
}

function maybeTriggerAiTurnGomoku() {
  if (AppStateGomoku.gameOver) return;
  if (AppStateGomoku.mode === "offline-ai" && AppStateGomoku.turn !== AppStateGomoku.humanColor) {
    setTimeout(aiTurnGomoku, AiPacing.delay(400));
  }
}

function aiTurnGomoku() {
  if (AppStateGomoku.mode !== "offline-ai" || AppStateGomoku.gameOver) return;
  const aiColor = GomokuCore.otherColor(AppStateGomoku.humanColor);
  if (AppStateGomoku.turn !== aiColor) return;

  setStatusGomoku("board-info", "Computer thinking…");
  setTimeout(() => {
    const move = GomokuAi.chooseMove(AppStateGomoku.board, aiColor, AppStateGomoku.aiLevel);
    if (!move) return;
    applyGomokuMove(move[0], move[1]);
  }, AiPacing.delay(200));
}

function undoLastMove() {
  if (!AppStateGomoku.undoStack || !AppStateGomoku.undoStack.length) return;
  let prev = AppStateGomoku.undoStack.pop();
  if (AppStateGomoku.mode === "offline-ai") {
    while (prev.turn !== AppStateGomoku.humanColor && AppStateGomoku.undoStack.length) {
      prev = AppStateGomoku.undoStack.pop();
    }
  }
  AppStateGomoku.board = prev.board;
  AppStateGomoku.turn = prev.turn;
  AppStateGomoku.gameOver = prev.gameOver;
  AppStateGomoku.lastMove = prev.lastMove;
  AppStateGomoku.moveCount = prev.moveCount;
  setGameResultGomoku("");
  updateGomokuBoard();
  updateGameLabelsGomoku();
  setStatusGomoku("board-info", "Move undone. " + colorNameGomoku(AppStateGomoku.turn) + " to move.");
}

function showBoardSectionGomoku() {
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

/*** Board rendering (mirrors go-app.js's intersection-grid approach) ***/

function buildGomokuBoardDOM() {
  const grid = document.getElementById("gomoku-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const n = GomokuCore.SIZE;
  const step = 100 / (n - 1);

  for (let i = 0; i < n; i++) {
    const hLine = document.createElement("div");
    hLine.className = "gomoku-line gomoku-line-h";
    hLine.style.top = (i * step) + "%";
    grid.appendChild(hLine);

    const vLine = document.createElement("div");
    vLine.className = "gomoku-line gomoku-line-v";
    vLine.style.left = (i * step) + "%";
    grid.appendChild(vLine);
  }

  const pointSize = step * 0.92;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const pt = document.createElement("button");
      pt.type = "button";
      pt.className = "gomoku-point";
      pt.style.top = (r * step) + "%";
      pt.style.left = (c * step) + "%";
      pt.style.width = pointSize + "%";
      pt.style.height = pointSize + "%";
      pt.dataset.row = r;
      pt.dataset.col = c;
      const stone = document.createElement("span");
      stone.className = "gomoku-stone";
      pt.appendChild(stone);
      pt.addEventListener("click", onGomokuPointClick);
      grid.appendChild(pt);
    }
  }

  ensureGomokuBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureGomokuBoardSquare);
  } else {
    setTimeout(ensureGomokuBoardSquare, 0);
  }
  ensureGomokuResizeHandler();
}

let einkGomokuResizeHandlerAttached = false;
let einkGomokuResizeTimeoutId = null;

function ensureGomokuBoardSquare() {
  const boardEl = document.getElementById("gomoku-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureGomokuResizeHandler() {
  if (einkGomokuResizeHandlerAttached) return;
  einkGomokuResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkGomokuResizeTimeoutId !== null) clearTimeout(einkGomokuResizeTimeoutId);
    einkGomokuResizeTimeoutId = setTimeout(() => {
      einkGomokuResizeTimeoutId = null;
      ensureGomokuBoardSquare();
    }, 150);
  });
}

function updateGomokuBoard() {
  const grid = document.getElementById("gomoku-grid");
  if (!grid) return;

  grid.querySelectorAll(".gomoku-point").forEach((pt) => {
    const r = parseInt(pt.dataset.row, 10);
    const c = parseInt(pt.dataset.col, 10);
    const stone = AppStateGomoku.board[r][c];
    const stoneEl = pt.querySelector(".gomoku-stone");
    if (stoneEl) {
      stoneEl.classList.remove("gomoku-stone-black", "gomoku-stone-white");
      if (stone === "b") stoneEl.classList.add("gomoku-stone-black");
      else if (stone === "w") stoneEl.classList.add("gomoku-stone-white");
    }

    pt.classList.toggle(
      "last-move",
      !!(AppStateGomoku.lastMove && AppStateGomoku.lastMove.r === r && AppStateGomoku.lastMove.c === c)
    );

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += stone ? ", " + (stone === "b" ? "Black" : "White") + " stone" : ", empty";
    I18n.setAria(pt, label);
  });
}

function updateGameLabelsGomoku() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateGomoku.moveCount ? "Move " + AppStateGomoku.moveCount : "");
  updateUndoButtonVisibilityGomoku();
  updateResignVisibilityGomoku();

  if (AppStateGomoku.gameOver) clearSavedGomokuGame();
  else saveGomokuGame();
}

function updateUndoButtonVisibilityGomoku() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateGomoku.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateGomoku.gameOver));
}

function updateResignVisibilityGomoku() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateGomoku.gameOver);
}

document.addEventListener("DOMContentLoaded", initGomokuApp);
