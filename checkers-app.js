// checkers-app.js
// Wires CheckersCore/CheckersAi to the checkers.html UI. Board rendering
// reuses chess's proven per-square-button/float-grid approach (app.js's
// buildBoardDOM/ensureSquareAspectRatio) rather than Go's line-based
// board, since checkers is a square-occupying game like chess. That
// approach is already confirmed working on a real E-Ink browser that
// silently ignores both `aspect-ratio` and the `inset` shorthand.

const AppStateCheckers = {
  mode: "offline",        // "offline" | "offline-ai"
  board: CheckersCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black always moves first
  selected: null,         // [r, c] | null
  lastMove: null,         // { from: [r,c], to: [r,c] } | null
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  movesSinceCapture: 0,   // draw-by-inactivity counter, mirrors chess's 50-move rule
  undoStack: [],
  captures: { b: 0, w: 0 } // pieces captured BY black / BY white
};

let einkCheckersResizeHandlerAttached = false;
let einkCheckersResizeTimeoutId = null;

const CHECKERS_SAVE_KEY = "einkchess_save_checkers";

function saveCheckersGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(CHECKERS_SAVE_KEY, {
    mode: AppStateCheckers.mode,
    board: AppStateCheckers.board,
    turn: AppStateCheckers.turn,
    lastMove: AppStateCheckers.lastMove,
    humanColor: AppStateCheckers.humanColor,
    aiLevel: AppStateCheckers.aiLevel,
    moveCount: AppStateCheckers.moveCount,
    movesSinceCapture: AppStateCheckers.movesSinceCapture,
    captures: AppStateCheckers.captures
  });
}

function clearSavedCheckersGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(CHECKERS_SAVE_KEY);
}

function recordCheckersStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateCheckers.mode !== "offline-ai") return;
  GameStats.record("checkers", outcome);
}

function colorNameCheckers(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusCheckers(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultCheckers(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultCheckers(resultCode, message) {
  setGameResultCheckers(message);
  setStatusCheckers("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackCheckers() {
  AppStateCheckers.undoStack = [];
}

function pushUndoSnapshotCheckers() {
  AppStateCheckers.undoStack.push({
    board: CheckersCore.cloneBoard(AppStateCheckers.board),
    turn: AppStateCheckers.turn,
    gameOver: AppStateCheckers.gameOver,
    moveCount: AppStateCheckers.moveCount,
    movesSinceCapture: AppStateCheckers.movesSinceCapture,
    captures: { b: AppStateCheckers.captures.b, w: AppStateCheckers.captures.w },
    lastMove: AppStateCheckers.lastMove
  });
}

function initCheckersApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("checkers-color-choice");
  const levelInline = document.getElementById("checkers-level-inline");
  const startGameBtn = document.getElementById("start-checkers-game");
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
    AppStateCheckers.mode = mode;
    AppStateCheckers.board = CheckersCore.createInitialBoard();
    AppStateCheckers.turn = "b";
    AppStateCheckers.selected = null;
    AppStateCheckers.lastMove = null;
    AppStateCheckers.humanColor = humanColor;
    AppStateCheckers.aiLevel = level;
    AppStateCheckers.gameOver = false;
    AppStateCheckers.moveCount = 0;
    AppStateCheckers.movesSinceCapture = 0;
    AppStateCheckers.captures = { b: 0, w: 0 };
    resetUndoStackCheckers();
    setGameResultCheckers("");
    showBoardSectionCheckers();
    buildCheckersBoardDOM();
    updateCheckersBoard();
    updateGameLabelsCheckers();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusCheckers("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineCheckers, 10);
    } else {
      setStatusCheckers("board-info", colorNameCheckers(AppStateCheckers.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateCheckers.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusCheckers("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='checkers-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "b", 0);
      setStatusCheckers("offline-checkers-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusCheckers("offline-checkers-status",
      "You play " + colorNameCheckers(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateCheckers.gameOver) return;
      const loser = AppStateCheckers.turn;
      const winner = CheckersCore.otherColor(loser);
      AppStateCheckers.gameOver = true;
      announceGameResultCheckers(colorNameCheckers(winner) + " wins", colorNameCheckers(winner) + " wins by resignation.");
      recordCheckersStatsIfVsAi("loss");
      updateGameLabelsCheckers();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(CHECKERS_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateCheckers.mode = savedGame.mode;
    AppStateCheckers.board = savedGame.board;
    AppStateCheckers.turn = savedGame.turn;
    AppStateCheckers.selected = null;
    AppStateCheckers.lastMove = savedGame.lastMove;
    AppStateCheckers.humanColor = savedGame.humanColor;
    AppStateCheckers.aiLevel = savedGame.aiLevel;
    AppStateCheckers.moveCount = savedGame.moveCount;
    AppStateCheckers.movesSinceCapture = savedGame.movesSinceCapture;
    AppStateCheckers.captures = savedGame.captures;
    AppStateCheckers.gameOver = false;
    resetUndoStackCheckers();
    setActiveModeButton(AppStateCheckers.mode);
    setGameResultCheckers("");
    showBoardSectionCheckers();
    buildCheckersBoardDOM();
    updateCheckersBoard();
    updateGameLabelsCheckers();
    if (AppStateCheckers.mode === "offline-ai" && AppStateCheckers.turn !== AppStateCheckers.humanColor) {
      setStatusCheckers("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineCheckers, 10);
    } else {
      setStatusCheckers("board-info", colorNameCheckers(AppStateCheckers.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isPieceOfTurn(piece, turn) {
  return !!piece && CheckersCore.colorOf(piece) === turn;
}

function onCheckersSquareClick(e) {
  if (AppStateCheckers.gameOver) {
    setStatusCheckers("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateCheckers.mode === "offline-ai" && AppStateCheckers.turn !== AppStateCheckers.humanColor) {
    setStatusCheckers("board-info", "Computer to move.");
    return;
  }

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const board = AppStateCheckers.board;
  const turn = AppStateCheckers.turn;

  if (!AppStateCheckers.selected) {
    const piece = board[r][c];
    if (!isPieceOfTurn(piece, turn)) return;
    AppStateCheckers.selected = [r, c];
    updateCheckersBoard();
    return;
  }

  const [sr, sc] = AppStateCheckers.selected;
  if (sr === r && sc === c) {
    AppStateCheckers.selected = null;
    updateCheckersBoard();
    return;
  }

  // Clicking another one of your own pieces re-selects instead of moving.
  const clickedPiece = board[r][c];
  if (isPieceOfTurn(clickedPiece, turn)) {
    AppStateCheckers.selected = [r, c];
    updateCheckersBoard();
    return;
  }

  const legalMoves = CheckersCore.getLegalMoves(board, turn);
  const match = legalMoves.find((m) => m.from[0] === sr && m.from[1] === sc && m.to[0] === r && m.to[1] === c);
  if (!match) {
    const hadCaptures = legalMoves.some((m) => m.captured.length > 0);
    setStatusCheckers("board-info", hadCaptures
      ? "Invalid move: a capture is available and must be taken."
      : "Invalid move.");
    AppStateCheckers.selected = null;
    updateCheckersBoard();
    return;
  }

  applyCheckersMove(match);

  if (AppStateCheckers.mode === "offline-ai" && !AppStateCheckers.gameOver && AppStateCheckers.turn !== AppStateCheckers.humanColor) {
    setStatusCheckers("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineCheckers, 10);
  }
}

function applyCheckersMove(move) {
  pushUndoSnapshotCheckers();
  const mover = AppStateCheckers.turn;
  AppStateCheckers.board = CheckersCore.applyMove(AppStateCheckers.board, move);
  if (move.captured.length) {
    AppStateCheckers.captures[mover] += move.captured.length;
    AppStateCheckers.movesSinceCapture = 0;
  } else {
    AppStateCheckers.movesSinceCapture++;
  }
  AppStateCheckers.lastMove = { from: move.from, to: move.to };
  AppStateCheckers.selected = null;
  AppStateCheckers.moveCount++;
  AppStateCheckers.turn = CheckersCore.otherColor(mover);
  updateCheckersBoard();
  updateGameLabelsCheckers();

  if (AppStateCheckers.movesSinceCapture >= 80) {
    AppStateCheckers.gameOver = true;
    announceGameResultCheckers("Draw", "Draw (no capture in the last 40 moves).");
    recordCheckersStatsIfVsAi("draw");
    updateGameLabelsCheckers();
    return;
  }

  const end = CheckersCore.detectGameEnd(AppStateCheckers.board, AppStateCheckers.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameCheckers(end.winner);
    const reason = end.status === "no-pieces" ? "no pieces left" : "no legal moves";
    AppStateCheckers.gameOver = true;
    announceGameResultCheckers(winnerName + " wins", winnerName + " wins (" + reason + ").");
    recordCheckersStatsIfVsAi(end.winner === AppStateCheckers.humanColor ? "win" : "loss");
    updateGameLabelsCheckers();
    return;
  }

  setStatusCheckers("board-info", colorNameCheckers(mover) + " played. " + colorNameCheckers(AppStateCheckers.turn) + " to move.");
}

function aiMoveOfflineCheckers() {
  if (AppStateCheckers.mode !== "offline-ai" || AppStateCheckers.gameOver) return;
  const aiColor = CheckersCore.otherColor(AppStateCheckers.humanColor);
  if (AppStateCheckers.turn !== aiColor) return;

  const move = CheckersAi.chooseMove(AppStateCheckers.board, aiColor, AppStateCheckers.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  pushUndoSnapshotCheckers();
  AppStateCheckers.board = CheckersCore.applyMove(AppStateCheckers.board, move);
  if (move.captured.length) {
    AppStateCheckers.captures[aiColor] += move.captured.length;
    AppStateCheckers.movesSinceCapture = 0;
  } else {
    AppStateCheckers.movesSinceCapture++;
  }
  AppStateCheckers.lastMove = { from: move.from, to: move.to };
  AppStateCheckers.moveCount++;
  AppStateCheckers.turn = CheckersCore.otherColor(aiColor);
  updateCheckersBoard();
  updateGameLabelsCheckers();

  if (AppStateCheckers.movesSinceCapture >= 80) {
    AppStateCheckers.gameOver = true;
    announceGameResultCheckers("Draw", "Draw (no capture in the last 40 moves).");
    recordCheckersStatsIfVsAi("draw");
    updateGameLabelsCheckers();
    return;
  }

  const end = CheckersCore.detectGameEnd(AppStateCheckers.board, AppStateCheckers.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameCheckers(end.winner);
    const reason = end.status === "no-pieces" ? "no pieces left" : "no legal moves";
    AppStateCheckers.gameOver = true;
    announceGameResultCheckers(winnerName + " wins", winnerName + " wins (" + reason + ").");
    recordCheckersStatsIfVsAi(end.winner === AppStateCheckers.humanColor ? "win" : "loss");
    updateGameLabelsCheckers();
    return;
  }

  setStatusCheckers("board-info", "Computer played. Your move.");
}

function undoLastMove() {
  if (!AppStateCheckers.undoStack || !AppStateCheckers.undoStack.length) return;
  let prev = AppStateCheckers.undoStack.pop();
  if (AppStateCheckers.mode === "offline-ai") {
    while (prev.turn !== AppStateCheckers.humanColor && AppStateCheckers.undoStack.length) {
      prev = AppStateCheckers.undoStack.pop();
    }
  }
  AppStateCheckers.board = prev.board;
  AppStateCheckers.turn = prev.turn;
  AppStateCheckers.gameOver = prev.gameOver;
  AppStateCheckers.moveCount = prev.moveCount;
  AppStateCheckers.movesSinceCapture = prev.movesSinceCapture;
  AppStateCheckers.captures = prev.captures;
  AppStateCheckers.lastMove = prev.lastMove;
  AppStateCheckers.selected = null;
  setGameResultCheckers("");
  updateCheckersBoard();
  updateGameLabelsCheckers();
  setStatusCheckers("board-info", "Move undone.");
}

function showBoardSectionCheckers() {
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

/*** Board rendering (mirrors app.js's per-square float-grid approach) ***/

function buildCheckersBoardDOM() {
  const boardEl = document.getElementById("checkers-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 7; r >= 0; r--) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement("button");
      square.className = "square checkers-square";
      const isDark = (r + c) % 2 === 1;
      square.classList.add(isDark ? "dark" : "light");
      square.dataset.row = r;
      square.dataset.col = c;
      if (isDark) {
        const piece = document.createElement("span");
        piece.className = "checkers-piece";
        square.appendChild(piece);
        square.addEventListener("click", onCheckersSquareClick);
      } else {
        // Light squares are never played on - keep them out of the tab
        // order and hidden from screen readers instead of leaving 32
        // unlabeled, unusable buttons in the way.
        square.tabIndex = -1;
        square.setAttribute("aria-hidden", "true");
      }
      boardEl.appendChild(square);
    }
  }

  ensureCheckersSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureCheckersSquareAspectRatio);
  } else {
    setTimeout(ensureCheckersSquareAspectRatio, 0);
  }
  ensureCheckersResizeHandler();
}

function ensureCheckersSquareAspectRatio() {
  const boardEl = document.getElementById("checkers-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / 8;
  boardEl.querySelectorAll(".checkers-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureCheckersResizeHandler() {
  if (einkCheckersResizeHandlerAttached) return;
  einkCheckersResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkCheckersResizeTimeoutId !== null) clearTimeout(einkCheckersResizeTimeoutId);
    einkCheckersResizeTimeoutId = setTimeout(() => {
      einkCheckersResizeTimeoutId = null;
      ensureCheckersSquareAspectRatio();
    }, 150);
  });
}

function updateCheckersBoard() {
  const boardEl = document.getElementById("checkers-board");
  if (!boardEl) return;
  const squares = boardEl.querySelectorAll(".checkers-square");
  squares.forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateCheckers.board[r][c];
    const pieceEl = sq.querySelector(".checkers-piece");
    if (pieceEl) {
      pieceEl.classList.remove("checkers-piece-black", "checkers-piece-white", "checkers-piece-king");
      // The king badge (see .checkers-king-mark in style.css) is a nested
      // element rather than a CSS-only pseudo-element, since .checkers-piece
      // already uses its own ::before for the piece's depth rim - so it's
      // added/removed here alongside the checkers-piece-king class instead.
      const existingMark = pieceEl.querySelector(".checkers-king-mark");
      if (existingMark) existingMark.remove();
      if (piece) {
        pieceEl.classList.add(CheckersCore.colorOf(piece) === "b" ? "checkers-piece-black" : "checkers-piece-white");
        if (CheckersCore.isKing(piece)) {
          pieceEl.classList.add("checkers-piece-king");
          const mark = document.createElement("span");
          mark.className = "checkers-king-mark";
          pieceEl.appendChild(mark);
        }
      }
    }

    const isSelected = !!(AppStateCheckers.selected && AppStateCheckers.selected[0] === r && AppStateCheckers.selected[1] === c);
    sq.classList.toggle("selected", isSelected);
    sq.classList.toggle("last-move", !!(AppStateCheckers.lastMove &&
      ((AppStateCheckers.lastMove.from[0] === r && AppStateCheckers.lastMove.from[1] === c) ||
       (AppStateCheckers.lastMove.to[0] === r && AppStateCheckers.lastMove.to[1] === c))));

    if (sq.classList.contains("dark")) {
      let label = "Row " + (r + 1) + ", column " + (c + 1);
      if (piece) {
        label += ", " + (CheckersCore.colorOf(piece) === "b" ? "Black" : "White") +
          (CheckersCore.isKing(piece) ? " king" : " piece");
      } else {
        label += ", empty";
      }
      if (isSelected) label += ", selected";
      sq.setAttribute("aria-label", label);
    }
  });
  ensureCheckersSquareAspectRatio();
  updateScoreLineCheckers();
}

function updateScoreLineCheckers() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateCheckers.moveCount > 0 || AppStateCheckers.captures.b > 0 || AppStateCheckers.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  capturesEl.textContent = "Captured – Black: " + AppStateCheckers.captures.b + " · White: " + AppStateCheckers.captures.w;
}

function updateGameLabelsCheckers() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateCheckers.moveCount ? "Move " + AppStateCheckers.moveCount : "";
  updateUndoButtonVisibilityCheckers();
  updateResignVisibilityCheckers();

  if (AppStateCheckers.gameOver) clearSavedCheckersGame();
  else saveCheckersGame();
}

function updateUndoButtonVisibilityCheckers() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateCheckers.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateCheckers.gameOver));
}

function updateResignVisibilityCheckers() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateCheckers.gameOver);
}

document.addEventListener("DOMContentLoaded", initCheckersApp);
