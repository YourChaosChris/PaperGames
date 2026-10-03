// reversi-app.js
// Wires ReversiCore/ReversiAi to the reversi.html UI. The board is a
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

const AppStateReversi = {
  mode: "offline",        // "offline" | "offline-ai"
  board: ReversiCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  lastMove: null,         // {row, col, flips} of the latest move, for the board marker
  undoStack: []
};

const REVERSI_SAVE_KEY = "einkchess_save_reversi";

function saveReversiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(REVERSI_SAVE_KEY, {
    mode: AppStateReversi.mode,
    board: AppStateReversi.board,
    turn: AppStateReversi.turn,
    humanColor: AppStateReversi.humanColor,
    aiLevel: AppStateReversi.aiLevel,
    moveCount: AppStateReversi.moveCount
  });
}

function clearSavedReversiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(REVERSI_SAVE_KEY);
}

function recordReversiStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateReversi.mode !== "offline-ai") return;
  GameStats.record("reversi", outcome);
}

function colorNameReversi(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusReversi(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultReversi(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// winner is null/undefined for a draw. Kept short for the modal title even
// where the message body includes the disc count.
function resultTitleReversi(winner) {
  if (!winner) return "Draw";
  if (AppStateReversi.mode === "offline-ai") {
    return winner === AppStateReversi.humanColor ? "You win!" : "You lose";
  }
  return colorNameReversi(winner) + " wins";
}

function announceGameResultReversi(resultCode, message) {
  setGameResultReversi(message);
  setStatusReversi("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackReversi() {
  AppStateReversi.undoStack = [];
}

function pushUndoSnapshotReversi() {
  AppStateReversi.undoStack.push({
    board: AppStateReversi.board.map((row) => row.slice()),
    turn: AppStateReversi.turn,
    gameOver: AppStateReversi.gameOver,
    moveCount: AppStateReversi.moveCount,
    lastMove: AppStateReversi.lastMove
  });
}

function initReversiApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("reversi-color-choice");
  const levelInline = document.getElementById("reversi-level-inline");
  const startGameBtn = document.getElementById("start-reversi-game");
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

  function startNewGameReversi(mode, humanColor, level) {
    AppStateReversi.mode = mode;
    AppStateReversi.board = ReversiCore.createInitialBoard();
    AppStateReversi.turn = "b";
    AppStateReversi.humanColor = humanColor;
    AppStateReversi.aiLevel = level;
    AppStateReversi.gameOver = false;
    AppStateReversi.moveCount = 0;
    AppStateReversi.lastMove = null;
    resetUndoStackReversi();
    setGameResultReversi("");
    showBoardSectionReversi();
    buildReversiBoardDOM();
    updateReversiBoard();
    updateGameLabelsReversi();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusReversi("board-info", "Computer thinking…");
      setTimeout(aiTurnReversi, AiPacing.delay(300));
    } else {
      setStatusReversi("board-info", colorNameReversi(AppStateReversi.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameReversi("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateReversi.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusReversi("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='reversi-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "white" ? "w" : "b", ["w", "b"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameReversi("offline", "b", 0);
      setStatusReversi("offline-reversi-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameReversi("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusReversi("offline-reversi-status",
      RandomStart.label("You play " + colorNameReversi(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateReversi.gameOver) return;
      const loser = AppStateReversi.turn;
      const winner = ReversiCore.otherColor(loser);
      AppStateReversi.gameOver = true;
      announceGameResultReversi(resultTitleReversi(winner), colorNameReversi(winner) + " wins by resignation.");
      recordReversiStatsIfVsAi("loss");
      updateGameLabelsReversi();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(REVERSI_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateReversi.mode = savedGame.mode;
    AppStateReversi.board = savedGame.board;
    AppStateReversi.turn = savedGame.turn;
    AppStateReversi.humanColor = savedGame.humanColor;
    AppStateReversi.aiLevel = savedGame.aiLevel;
    AppStateReversi.moveCount = savedGame.moveCount;
    AppStateReversi.lastMove = null;
    AppStateReversi.gameOver = false;
    resetUndoStackReversi();
    setActiveModeButton(AppStateReversi.mode);
    setGameResultReversi("");
    showBoardSectionReversi();
    buildReversiBoardDOM();
    updateReversiBoard();
    updateGameLabelsReversi();
    if (AppStateReversi.mode === "offline-ai" && AppStateReversi.turn !== AppStateReversi.humanColor) {
      setStatusReversi("board-info", "Computer thinking…");
      setTimeout(aiTurnReversi, AiPacing.delay(300));
    } else {
      setStatusReversi("board-info", colorNameReversi(AppStateReversi.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onReversiSquareClick(e) {
  const row = parseInt(e.currentTarget.dataset.row, 10);
  const col = parseInt(e.currentTarget.dataset.col, 10);
  attemptReversiMove(row, col);
}

function attemptReversiMove(row, col) {
  if (AppStateReversi.gameOver) {
    setStatusReversi("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateReversi.mode === "offline-ai" && AppStateReversi.turn !== AppStateReversi.humanColor) {
    setStatusReversi("board-info", "Computer to move.");
    return;
  }
  const flips = ReversiCore.flipsForMove(AppStateReversi.board, AppStateReversi.turn, row, col);
  if (!flips.length) return; // not a legal square - silently ignore the click

  applyReversiMove({ row, col, flips });
}

// After `mover`'s move, hands the turn to the opponent - unless the
// opponent has no legal move at all, in which case their turn is
// skipped automatically and it comes back to `mover`, exactly as real
// Reversi rules require. If NEITHER side can move, the game is over.
function advanceReversiTurn(mover) {
  const opponent = ReversiCore.otherColor(mover);
  const opponentMoves = ReversiCore.getLegalMoves(AppStateReversi.board, opponent);
  if (opponentMoves.length) {
    AppStateReversi.turn = opponent;
    updateReversiBoard();
    updateGameLabelsReversi();
    maybeTriggerAiTurnReversi();
    if (!(AppStateReversi.mode === "offline-ai" && AppStateReversi.turn !== AppStateReversi.humanColor)) {
      setStatusReversi("board-info", colorNameReversi(mover) + " played. " + colorNameReversi(opponent) + " to move.");
    }
    return;
  }

  const moverMoves = ReversiCore.getLegalMoves(AppStateReversi.board, mover);
  if (!moverMoves.length) {
    endGameReversi();
    return;
  }

  // Opponent has no legal move at all - their turn is skipped and it
  // stays with the mover.
  AppStateReversi.turn = mover;
  updateReversiBoard();
  updateGameLabelsReversi();
  maybeTriggerAiTurnReversi();
  if (!(AppStateReversi.mode === "offline-ai" && AppStateReversi.turn !== AppStateReversi.humanColor)) {
    setStatusReversi("board-info", colorNameReversi(opponent) + " has no legal move and passes. " + colorNameReversi(mover) + " to move again.");
  }
}

function endGameReversi() {
  AppStateReversi.gameOver = true;
  const winner = ReversiCore.getWinner(AppStateReversi.board);
  const b = ReversiCore.countDiscs(AppStateReversi.board, "b");
  const w = ReversiCore.countDiscs(AppStateReversi.board, "w");
  const message = winner
    ? colorNameReversi(winner) + " wins " + Math.max(b, w) + "-" + Math.min(b, w) + "!"
    : "It's a draw, " + b + "-" + w + "!";
  announceGameResultReversi(resultTitleReversi(winner), message);
  if (winner) {
    recordReversiStatsIfVsAi(winner === AppStateReversi.humanColor ? "win" : "loss");
  } else {
    recordReversiStatsIfVsAi("draw");
  }
  updateReversiBoard();
  updateGameLabelsReversi();
}

function applyReversiMove(move) {
  pushUndoSnapshotReversi();
  const mover = AppStateReversi.turn;
  AppStateReversi.board = ReversiCore.applyMove(AppStateReversi.board, mover, move);
  AppStateReversi.lastMove = { row: move.row, col: move.col, flips: move.flips };
  AppStateReversi.moveCount++;
  advanceReversiTurn(mover);
}

function maybeTriggerAiTurnReversi() {
  if (AppStateReversi.gameOver) return;
  if (AppStateReversi.mode === "offline-ai" && AppStateReversi.turn !== AppStateReversi.humanColor) {
    setTimeout(aiTurnReversi, AiPacing.delay(400));
  }
}

function aiTurnReversi() {
  if (AppStateReversi.mode !== "offline-ai" || AppStateReversi.gameOver) return;
  const aiColor = ReversiCore.otherColor(AppStateReversi.humanColor);
  if (AppStateReversi.turn !== aiColor) return;

  setStatusReversi("board-info", "Computer thinking…");
  // The position this search is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = AppStateReversi.board;
  setTimeout(() => {
    if (AppStateReversi.gameOver || AppStateReversi.board !== scheduledFor || AppStateReversi.turn !== aiColor) return;
    const move = ReversiAi.chooseMove(AppStateReversi.board, aiColor, AppStateReversi.aiLevel);
    if (!move) return;
    applyReversiMove(move);
  }, AiPacing.delay(200));
}

function undoLastMove() {
  if (!AppStateReversi.undoStack || !AppStateReversi.undoStack.length) return;
  let prev = AppStateReversi.undoStack.pop();
  if (AppStateReversi.mode === "offline-ai") {
    while (prev.turn !== AppStateReversi.humanColor && AppStateReversi.undoStack.length) {
      prev = AppStateReversi.undoStack.pop();
    }
  }
  AppStateReversi.board = prev.board;
  AppStateReversi.turn = prev.turn;
  AppStateReversi.gameOver = prev.gameOver;
  AppStateReversi.moveCount = prev.moveCount;
  AppStateReversi.lastMove = prev.lastMove || null;
  setGameResultReversi("");
  updateReversiBoard();
  updateGameLabelsReversi();
  setStatusReversi("board-info", "Move undone. " + colorNameReversi(AppStateReversi.turn) + " to move.");
}

function showBoardSectionReversi() {
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

function buildReversiBoardDOM() {
  const boardEl = document.getElementById("reversi-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < ReversiCore.SIZE; r++) {
    for (let c = 0; c < ReversiCore.SIZE; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square reversi-square";
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "reversi-piece";
      square.appendChild(piece);
      square.addEventListener("click", onReversiSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureReversiSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureReversiSquareAspectRatio);
  } else {
    setTimeout(ensureReversiSquareAspectRatio, 0);
  }
  ensureReversiResizeHandler();
}

let einkReversiResizeHandlerAttached = false;
let einkReversiResizeTimeoutId = null;

function ensureReversiSquareAspectRatio() {
  const boardEl = document.getElementById("reversi-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / ReversiCore.SIZE;
  boardEl.querySelectorAll(".reversi-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureReversiResizeHandler() {
  if (einkReversiResizeHandlerAttached) return;
  einkReversiResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkReversiResizeTimeoutId !== null) clearTimeout(einkReversiResizeTimeoutId);
    einkReversiResizeTimeoutId = setTimeout(() => {
      einkReversiResizeTimeoutId = null;
      ensureReversiSquareAspectRatio();
    }, 150);
  });
}

function updateReversiBoard() {
  const boardEl = document.getElementById("reversi-board");
  if (!boardEl) return;

  const legalMoves = AppStateReversi.gameOver
    ? []
    : ReversiCore.getLegalMoves(AppStateReversi.board, AppStateReversi.turn);
  const movableSet = new Set(legalMoves.map((m) => m.row + "," + m.col));
  const last = AppStateReversi.lastMove;
  const flipped = new Set(last ? last.flips.map(([fr, fc]) => fr + "," + fc) : []);

  boardEl.querySelectorAll(".reversi-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateReversi.board[r][c];
    const pieceEl = sq.querySelector(".reversi-piece");
    if (pieceEl) {
      pieceEl.classList.remove("reversi-piece-black", "reversi-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "reversi-piece-black" : "reversi-piece-white");
    }
    const isMovable = movableSet.has(r + "," + c);
    sq.classList.toggle("reversi-square-movable", isMovable);
    // Latest move: solid frame on the placed disc, dotted on the flipped ones.
    sq.classList.toggle("lm-to", !!last && last.row === r && last.col === c);
    sq.classList.toggle("lm-changed", flipped.has(r + "," + c));
    sq.disabled = !isMovable;

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " disc" : ", empty";
    if (isMovable) label += ", movable";
    I18n.setAria(sq, label);
  });

  updateScoreLineReversi();
}

function updateScoreLineReversi() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const b = ReversiCore.countDiscs(AppStateReversi.board, "b");
  const w = ReversiCore.countDiscs(AppStateReversi.board, "w");
  const active = AppStateReversi.moveCount > 0;
  container.classList.toggle("hidden", !active);
  I18n.setMsg(capturesEl, active ? "Discs – Black: " + b + " · White: " + w : "");
}

function updateGameLabelsReversi() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateReversi.moveCount ? "Move " + AppStateReversi.moveCount : "");
  updateUndoButtonVisibilityReversi();
  updateResignVisibilityReversi();

  if (AppStateReversi.gameOver) clearSavedReversiGame();
  else saveReversiGame();
}

function updateUndoButtonVisibilityReversi() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateReversi.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateReversi.gameOver));
}

function updateResignVisibilityReversi() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateReversi.gameOver);
}

document.addEventListener("DOMContentLoaded", initReversiApp);
