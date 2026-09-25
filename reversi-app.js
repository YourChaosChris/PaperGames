// othello-app.js
// Wires OthelloCore/OthelloAi to the othello.html UI. The board is a
// plain 8x8 grid of uniform squares (mirrors checkers-app.js's
// per-square float-grid approach), and a move is a single click on a
// legal empty square - closer to go-app.js's "click to place a stone"
// flow than to checkers' select-then-destination one, since a disc
// never moves once placed.
//
// A player who has no legal move must skip their turn entirely rather
// than choosing to pass - handled automatically after every move by
// checking both sides' legal moves and, if neither has one, ending the
// game by disc count.

const AppStateOthello = {
  mode: "offline",        // "offline" | "offline-ai"
  board: OthelloCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const OTHELLO_SAVE_KEY = "einkchess_save_othello";

function saveOthelloGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(OTHELLO_SAVE_KEY, {
    mode: AppStateOthello.mode,
    board: AppStateOthello.board,
    turn: AppStateOthello.turn,
    humanColor: AppStateOthello.humanColor,
    aiLevel: AppStateOthello.aiLevel,
    moveCount: AppStateOthello.moveCount
  });
}

function clearSavedOthelloGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(OTHELLO_SAVE_KEY);
}

function recordOthelloStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateOthello.mode !== "offline-ai") return;
  GameStats.record("othello", outcome);
}

function colorNameOthello(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusOthello(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultOthello(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// winner is null/undefined for a draw. Kept short for the modal title even
// where the message body includes the disc count.
function resultTitleOthello(winner) {
  if (!winner) return "Draw";
  if (AppStateOthello.mode === "offline-ai") {
    return winner === AppStateOthello.humanColor ? "You win!" : "You lose";
  }
  return colorNameOthello(winner) + " wins";
}

function announceGameResultOthello(resultCode, message) {
  setGameResultOthello(message);
  setStatusOthello("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackOthello() {
  AppStateOthello.undoStack = [];
}

function pushUndoSnapshotOthello() {
  AppStateOthello.undoStack.push({
    board: AppStateOthello.board.map((row) => row.slice()),
    turn: AppStateOthello.turn,
    gameOver: AppStateOthello.gameOver,
    moveCount: AppStateOthello.moveCount
  });
}

function initOthelloApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("othello-color-choice");
  const levelInline = document.getElementById("othello-level-inline");
  const startGameBtn = document.getElementById("start-othello-game");
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

  function startNewGameOthello(mode, humanColor, level) {
    AppStateOthello.mode = mode;
    AppStateOthello.board = OthelloCore.createInitialBoard();
    AppStateOthello.turn = "b";
    AppStateOthello.humanColor = humanColor;
    AppStateOthello.aiLevel = level;
    AppStateOthello.gameOver = false;
    AppStateOthello.moveCount = 0;
    resetUndoStackOthello();
    setGameResultOthello("");
    showBoardSectionOthello();
    buildOthelloBoardDOM();
    updateOthelloBoard();
    updateGameLabelsOthello();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusOthello("board-info", "Computer thinking…");
      setTimeout(aiTurnOthello, AiPacing.delay(300));
    } else {
      setStatusOthello("board-info", colorNameOthello(AppStateOthello.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameOthello("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateOthello.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusOthello("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='othello-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameOthello("offline", "b", 0);
      setStatusOthello("offline-othello-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameOthello("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusOthello("offline-othello-status",
      "You play " + colorNameOthello(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateOthello.gameOver) return;
      const loser = AppStateOthello.turn;
      const winner = OthelloCore.otherColor(loser);
      AppStateOthello.gameOver = true;
      announceGameResultOthello(resultTitleOthello(winner), colorNameOthello(winner) + " wins by resignation.");
      recordOthelloStatsIfVsAi("loss");
      updateGameLabelsOthello();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(OTHELLO_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateOthello.mode = savedGame.mode;
    AppStateOthello.board = savedGame.board;
    AppStateOthello.turn = savedGame.turn;
    AppStateOthello.humanColor = savedGame.humanColor;
    AppStateOthello.aiLevel = savedGame.aiLevel;
    AppStateOthello.moveCount = savedGame.moveCount;
    AppStateOthello.gameOver = false;
    resetUndoStackOthello();
    setActiveModeButton(AppStateOthello.mode);
    setGameResultOthello("");
    showBoardSectionOthello();
    buildOthelloBoardDOM();
    updateOthelloBoard();
    updateGameLabelsOthello();
    if (AppStateOthello.mode === "offline-ai" && AppStateOthello.turn !== AppStateOthello.humanColor) {
      setStatusOthello("board-info", "Computer thinking…");
      setTimeout(aiTurnOthello, AiPacing.delay(300));
    } else {
      setStatusOthello("board-info", colorNameOthello(AppStateOthello.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onOthelloSquareClick(e) {
  const row = parseInt(e.currentTarget.dataset.row, 10);
  const col = parseInt(e.currentTarget.dataset.col, 10);
  attemptOthelloMove(row, col);
}

function attemptOthelloMove(row, col) {
  if (AppStateOthello.gameOver) {
    setStatusOthello("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateOthello.mode === "offline-ai" && AppStateOthello.turn !== AppStateOthello.humanColor) {
    setStatusOthello("board-info", "Computer to move.");
    return;
  }
  const flips = OthelloCore.flipsForMove(AppStateOthello.board, AppStateOthello.turn, row, col);
  if (!flips.length) return; // not a legal square - silently ignore the click

  applyOthelloMove({ row, col, flips });
}

// After `mover`'s move, hands the turn to the opponent - unless the
// opponent has no legal move at all, in which case their turn is
// skipped automatically and it comes back to `mover`, exactly as real
// Othello rules require. If NEITHER side can move, the game is over.
function advanceOthelloTurn(mover) {
  const opponent = OthelloCore.otherColor(mover);
  const opponentMoves = OthelloCore.getLegalMoves(AppStateOthello.board, opponent);
  if (opponentMoves.length) {
    AppStateOthello.turn = opponent;
    updateOthelloBoard();
    updateGameLabelsOthello();
    maybeTriggerAiTurnOthello();
    if (!(AppStateOthello.mode === "offline-ai" && AppStateOthello.turn !== AppStateOthello.humanColor)) {
      setStatusOthello("board-info", colorNameOthello(mover) + " played. " + colorNameOthello(opponent) + " to move.");
    }
    return;
  }

  const moverMoves = OthelloCore.getLegalMoves(AppStateOthello.board, mover);
  if (!moverMoves.length) {
    endGameOthello();
    return;
  }

  // Opponent has no legal move at all - their turn is skipped and it
  // stays with the mover.
  AppStateOthello.turn = mover;
  updateOthelloBoard();
  updateGameLabelsOthello();
  maybeTriggerAiTurnOthello();
  if (!(AppStateOthello.mode === "offline-ai" && AppStateOthello.turn !== AppStateOthello.humanColor)) {
    setStatusOthello("board-info", colorNameOthello(opponent) + " has no legal move and passes. " + colorNameOthello(mover) + " to move again.");
  }
}

function endGameOthello() {
  AppStateOthello.gameOver = true;
  const winner = OthelloCore.getWinner(AppStateOthello.board);
  const b = OthelloCore.countDiscs(AppStateOthello.board, "b");
  const w = OthelloCore.countDiscs(AppStateOthello.board, "w");
  const message = winner
    ? colorNameOthello(winner) + " wins " + Math.max(b, w) + "-" + Math.min(b, w) + "!"
    : "It's a draw, " + b + "-" + w + "!";
  announceGameResultOthello(resultTitleOthello(winner), message);
  if (winner) {
    recordOthelloStatsIfVsAi(winner === AppStateOthello.humanColor ? "win" : "loss");
  } else {
    recordOthelloStatsIfVsAi("draw");
  }
  updateOthelloBoard();
  updateGameLabelsOthello();
}

function applyOthelloMove(move) {
  pushUndoSnapshotOthello();
  const mover = AppStateOthello.turn;
  AppStateOthello.board = OthelloCore.applyMove(AppStateOthello.board, mover, move);
  AppStateOthello.moveCount++;
  advanceOthelloTurn(mover);
}

function maybeTriggerAiTurnOthello() {
  if (AppStateOthello.gameOver) return;
  if (AppStateOthello.mode === "offline-ai" && AppStateOthello.turn !== AppStateOthello.humanColor) {
    setTimeout(aiTurnOthello, AiPacing.delay(400));
  }
}

function aiTurnOthello() {
  if (AppStateOthello.mode !== "offline-ai" || AppStateOthello.gameOver) return;
  const aiColor = OthelloCore.otherColor(AppStateOthello.humanColor);
  if (AppStateOthello.turn !== aiColor) return;

  setStatusOthello("board-info", "Computer thinking…");
  setTimeout(() => {
    const move = OthelloAi.chooseMove(AppStateOthello.board, aiColor, AppStateOthello.aiLevel);
    if (!move) return;
    applyOthelloMove(move);
  }, AiPacing.delay(200));
}

function undoLastMove() {
  if (!AppStateOthello.undoStack || !AppStateOthello.undoStack.length) return;
  let prev = AppStateOthello.undoStack.pop();
  if (AppStateOthello.mode === "offline-ai") {
    while (prev.turn !== AppStateOthello.humanColor && AppStateOthello.undoStack.length) {
      prev = AppStateOthello.undoStack.pop();
    }
  }
  AppStateOthello.board = prev.board;
  AppStateOthello.turn = prev.turn;
  AppStateOthello.gameOver = prev.gameOver;
  AppStateOthello.moveCount = prev.moveCount;
  setGameResultOthello("");
  updateOthelloBoard();
  updateGameLabelsOthello();
  setStatusOthello("board-info", "Move undone. " + colorNameOthello(AppStateOthello.turn) + " to move.");
}

function showBoardSectionOthello() {
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

/*** Board rendering (mirrors checkers-app.js's per-square float-grid approach) ***/

function buildOthelloBoardDOM() {
  const boardEl = document.getElementById("othello-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < OthelloCore.SIZE; r++) {
    for (let c = 0; c < OthelloCore.SIZE; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square othello-square";
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "othello-piece";
      square.appendChild(piece);
      square.addEventListener("click", onOthelloSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureOthelloSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureOthelloSquareAspectRatio);
  } else {
    setTimeout(ensureOthelloSquareAspectRatio, 0);
  }
  ensureOthelloResizeHandler();
}

let einkOthelloResizeHandlerAttached = false;
let einkOthelloResizeTimeoutId = null;

function ensureOthelloSquareAspectRatio() {
  const boardEl = document.getElementById("othello-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / OthelloCore.SIZE;
  boardEl.querySelectorAll(".othello-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureOthelloResizeHandler() {
  if (einkOthelloResizeHandlerAttached) return;
  einkOthelloResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkOthelloResizeTimeoutId !== null) clearTimeout(einkOthelloResizeTimeoutId);
    einkOthelloResizeTimeoutId = setTimeout(() => {
      einkOthelloResizeTimeoutId = null;
      ensureOthelloSquareAspectRatio();
    }, 150);
  });
}

function updateOthelloBoard() {
  const boardEl = document.getElementById("othello-board");
  if (!boardEl) return;

  const legalMoves = AppStateOthello.gameOver
    ? []
    : OthelloCore.getLegalMoves(AppStateOthello.board, AppStateOthello.turn);
  const movableSet = new Set(legalMoves.map((m) => m.row + "," + m.col));

  boardEl.querySelectorAll(".othello-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateOthello.board[r][c];
    const pieceEl = sq.querySelector(".othello-piece");
    if (pieceEl) {
      pieceEl.classList.remove("othello-piece-black", "othello-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "othello-piece-black" : "othello-piece-white");
    }
    const isMovable = movableSet.has(r + "," + c);
    sq.classList.toggle("othello-square-movable", isMovable);
    sq.disabled = !isMovable;

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " disc" : ", empty";
    if (isMovable) label += ", movable";
    I18n.setAria(sq, label);
  });

  updateScoreLineOthello();
}

function updateScoreLineOthello() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const b = OthelloCore.countDiscs(AppStateOthello.board, "b");
  const w = OthelloCore.countDiscs(AppStateOthello.board, "w");
  const active = AppStateOthello.moveCount > 0;
  container.classList.toggle("hidden", !active);
  I18n.setMsg(capturesEl, active ? "Discs – Black: " + b + " · White: " + w : "");
}

function updateGameLabelsOthello() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateOthello.moveCount ? "Move " + AppStateOthello.moveCount : "");
  updateUndoButtonVisibilityOthello();
  updateResignVisibilityOthello();

  if (AppStateOthello.gameOver) clearSavedOthelloGame();
  else saveOthelloGame();
}

function updateUndoButtonVisibilityOthello() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateOthello.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateOthello.gameOver));
}

function updateResignVisibilityOthello() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateOthello.gameOver);
}

document.addEventListener("DOMContentLoaded", initOthelloApp);
