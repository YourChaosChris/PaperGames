// go-app.js
// Wires GoCore/GoAi to the go.html UI. Mirrors app.js's structure and
// conventions (settings panel, undo stack, board-fit handling) but Go's
// own flow: click-to-place stones, Pass to end a game, area scoring.

const AppStateGo = {
  mode: "offline",        // "offline" | "offline-ai"
  size: 9,
  board: GoCore.createEmptyBoard(9),
  turn: "b",              // "b" | "w" - Black always moves first
  koPoint: null,
  lastMove: null,         // { r, c } | { pass: true, color } | null
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  consecutivePasses: 0,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 }, // stones captured BY black / BY white
  // GoCore.boardKey() of every position the game has had so far, for the
  // positional superko rule (no move may recreate an earlier position).
  boardHistory: []
};

function goHistorySet() {
  return new Set(AppStateGo.boardHistory || []);
}

let einkGoResizeHandlerAttached = false;
let einkGoResizeTimeoutId = null;

const GO_SAVE_KEY = "einkchess_save_go";

function saveGoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(GO_SAVE_KEY, {
    mode: AppStateGo.mode,
    size: AppStateGo.size,
    board: AppStateGo.board,
    turn: AppStateGo.turn,
    koPoint: AppStateGo.koPoint,
    lastMove: AppStateGo.lastMove,
    humanColor: AppStateGo.humanColor,
    aiLevel: AppStateGo.aiLevel,
    consecutivePasses: AppStateGo.consecutivePasses,
    moveCount: AppStateGo.moveCount,
    captures: AppStateGo.captures,
    boardHistory: AppStateGo.boardHistory
  });
}

function clearSavedGoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(GO_SAVE_KEY);
}

function recordGoStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateGo.mode !== "offline-ai") return;
  GameStats.record("go", outcome);
}

function colorNameGo(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusGo(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultGo(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Sets the compact result badge (#game-result) and the status line, and
// shows a centered popup with the same description - so the outcome is
// impossible to miss regardless of mode (2-player or vs-computer).
// Go's own resultCode is scoring notation ("B+7", "W+R") - clear to a Go
// player but not a useful modal title at a glance, so the title is built
// from the winner color plus the same you/computer distinction the rest of
// the app uses instead.
function resultTitleGo(winner) {
  if (AppStateGo.mode === "offline-ai") {
    return winner === AppStateGo.humanColor ? "You win!" : "The computer wins";
  }
  return colorNameGo(winner) + " wins";
}

function announceGameResultGo(resultCode, message) {
  setGameResultGo(message);
  setStatusGo("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackGo() {
  AppStateGo.undoStack = [];
}

function pushUndoSnapshotGo() {
  AppStateGo.undoStack.push({
    board: GoCore.cloneBoard(AppStateGo.board),
    turn: AppStateGo.turn,
    koPoint: AppStateGo.koPoint,
    gameOver: AppStateGo.gameOver,
    consecutivePasses: AppStateGo.consecutivePasses,
    moveCount: AppStateGo.moveCount,
    captures: { b: AppStateGo.captures.b, w: AppStateGo.captures.w },
    lastMove: AppStateGo.lastMove,
    historyLength: (AppStateGo.boardHistory || []).length
  });
}

function recordPassGo(color) {
  AppStateGo.consecutivePasses = (AppStateGo.consecutivePasses || 0) + 1;
  AppStateGo.lastMove = { pass: true, color };
  AppStateGo.moveCount++;
}

function endGameByScoreGo() {
  AppStateGo.gameOver = true;
  const score = GoCore.scoreArea(AppStateGo.board, AppStateGo.size, GoCore.DEFAULT_KOMI);
  const margin = Math.abs(score.blackScore - score.whiteScore);
  announceGameResultGo(resultTitleGo(score.winner),
    "Both passed. " + colorNameGo(score.winner) + " wins by " + margin +
    " (Black " + score.blackScore + " – White " + score.whiteScore + ").");
  recordGoStatsIfVsAi(score.winner === AppStateGo.humanColor ? "win" : "loss");
  updateGameLabelsGo();
}

function explainIllegalGoMove(reason) {
  if (reason === "occupied") return "Invalid move: that point is already occupied.";
  if (reason === "suicide") return "Invalid move: that would leave your stones with no liberties.";
  if (reason === "ko") return "Invalid move: forbidden by the ko rule (recaptures immediately).";
  if (reason === "superko") return "Invalid move: it would repeat an earlier board position (superko rule).";
  return "Invalid move.";
}

function initGoApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const goColorChoice = document.getElementById("go-color-choice");
  const goLevelInline = document.getElementById("go-level-inline");
  const goSizeInline = document.getElementById("go-size-inline");
  const startGoGameBtn = document.getElementById("start-go-game");
  const passBtn = document.getElementById("pass-button");
  const resignBtn = document.getElementById("resign-button");

  function updateGoColorChoiceVisibility() {
    if (!goColorChoice || !goLevelInline) return;
    goColorChoice.classList.toggle("hidden", goLevelInline.value === "0");
  }

  function setActiveModeButtonGo(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  // Same collapsible-settings pattern as chess.html: open until a game is
  // actually running, then out of the way but reachable via the menu button.
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

  function startNewGame(size, mode, humanColor, level) {
    AppStateGo.mode = mode;
    AppStateGo.size = size;
    AppStateGo.board = GoCore.createEmptyBoard(size);
    AppStateGo.turn = "b";
    AppStateGo.koPoint = null;
    AppStateGo.lastMove = null;
    AppStateGo.humanColor = humanColor;
    AppStateGo.aiLevel = level;
    AppStateGo.gameOver = false;
    AppStateGo.consecutivePasses = 0;
    AppStateGo.moveCount = 0;
    AppStateGo.captures = { b: 0, w: 0 };
    AppStateGo.boardHistory = [GoCore.boardKey(AppStateGo.board)];
    resetUndoStackGo();
    setGameResultGo("");
    showBoardSectionGo();
    buildGoBoardDOM();
    updateGoBoard();
    updateGameLabelsGo();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusGo("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineGo, 10);
    } else {
      setStatusGo("board-info", colorNameGo(AppStateGo.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonGo("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame(9, "offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonGo("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (goLevelInline) goLevelInline.value = String(AppStateGo.aiLevel || 2);
    updateGoColorChoiceVisibility();
    setStatusGo("board-info", "");
  });

  if (goLevelInline) {
    goLevelInline.addEventListener("change", updateGoColorChoiceVisibility);
  }

  startGoGameBtn.addEventListener("click", () => {
    const size = goSizeInline ? parseInt(goSizeInline.value, 10) : 9;
    const level = goLevelInline ? parseInt(goLevelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='go-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButtonGo("offline-ai");
      startNewGame(size, "offline", "b", 0);
      setStatusGo("offline-go-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonGo("offline-ai");
    startNewGame(size, "offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusGo("offline-go-status",
      "You play " + colorNameGo(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (passBtn) {
    passBtn.addEventListener("click", () => {
      if (AppStateGo.gameOver) return;
      if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) return;

      pushUndoSnapshotGo();
      const passer = AppStateGo.turn;
      recordPassGo(passer);
      AppStateGo.turn = passer === "b" ? "w" : "b";
      updateGameLabelsGo();

      if (AppStateGo.consecutivePasses >= 2) {
        endGameByScoreGo();
        return;
      }
      setStatusGo("board-info", colorNameGo(passer) + " passed. " + colorNameGo(AppStateGo.turn) + " to move.");

      if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
        setStatusGo("board-info", "Computer thinking…");
        setTimeout(aiMoveOfflineGo, 10);
      }
    });
  }

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateGo.gameOver) return;
      const loser = AppStateGo.turn;
      const winner = loser === "b" ? "w" : "b";
      AppStateGo.gameOver = true;
      announceGameResultGo(resultTitleGo(winner), colorNameGo(winner) + " wins by resignation.");
      recordGoStatsIfVsAi("loss");
      updateGameLabelsGo();
    });
  }

  updateGoColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(GO_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateGo.mode = savedGame.mode;
    AppStateGo.size = savedGame.size;
    AppStateGo.board = savedGame.board;
    AppStateGo.turn = savedGame.turn;
    AppStateGo.koPoint = savedGame.koPoint;
    AppStateGo.lastMove = savedGame.lastMove;
    AppStateGo.humanColor = savedGame.humanColor;
    AppStateGo.aiLevel = savedGame.aiLevel;
    AppStateGo.consecutivePasses = savedGame.consecutivePasses;
    AppStateGo.moveCount = savedGame.moveCount;
    AppStateGo.captures = savedGame.captures;
    AppStateGo.boardHistory = Array.isArray(savedGame.boardHistory) && savedGame.boardHistory.length
      ? savedGame.boardHistory
      : [GoCore.boardKey(AppStateGo.board)];
    AppStateGo.gameOver = false;
    resetUndoStackGo();
    setActiveModeButtonGo(AppStateGo.mode);
    setGameResultGo("");
    showBoardSectionGo();
    buildGoBoardDOM();
    updateGoBoard();
    updateGameLabelsGo();
    if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
      setStatusGo("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineGo, 10);
    } else {
      setStatusGo("board-info", colorNameGo(AppStateGo.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function onGoPointClick(e) {
  if (AppStateGo.gameOver) {
    setStatusGo("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateGo.mode === "offline-ai" && AppStateGo.turn !== AppStateGo.humanColor) {
    setStatusGo("board-info", "Computer to move.");
    return;
  }

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const result = GoCore.tryMove(AppStateGo.board, AppStateGo.size, r, c, AppStateGo.turn, AppStateGo.koPoint, goHistorySet());
  if (!result.legal) {
    setStatusGo("board-info", explainIllegalGoMove(result.reason));
    return;
  }

  applyGoMove(result, r, c);

  if (AppStateGo.mode === "offline-ai" && !AppStateGo.gameOver && AppStateGo.turn !== AppStateGo.humanColor) {
    setStatusGo("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineGo, 10);
  }
}

function applyGoMove(result, r, c) {
  pushUndoSnapshotGo();
  const mover = AppStateGo.turn;
  AppStateGo.board = result.board;
  AppStateGo.koPoint = result.koPoint;
  AppStateGo.boardHistory.push(GoCore.boardKey(result.board));
  AppStateGo.captures[mover] += result.captured.length;
  AppStateGo.lastMove = { r, c };
  AppStateGo.consecutivePasses = 0;
  AppStateGo.moveCount++;
  AppStateGo.turn = mover === "b" ? "w" : "b";
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", colorNameGo(mover) + " played. " + colorNameGo(AppStateGo.turn) + " to move.");
}

function aiMoveOfflineGo() {
  if (AppStateGo.mode !== "offline-ai" || AppStateGo.gameOver) return;
  const aiColor = AppStateGo.humanColor === "b" ? "w" : "b";
  if (AppStateGo.turn !== aiColor) return;

  const move = GoAi.chooseMove(AppStateGo.board, AppStateGo.size, aiColor, AppStateGo.aiLevel, AppStateGo.koPoint, goHistorySet());

  if (!move) {
    pushUndoSnapshotGo();
    recordPassGo(aiColor);
    AppStateGo.turn = aiColor === "b" ? "w" : "b";
    updateGameLabelsGo();
    if (AppStateGo.consecutivePasses >= 2) {
      endGameByScoreGo();
      return;
    }
    setStatusGo("board-info", "Computer passes. Your move.");
    return;
  }

  pushUndoSnapshotGo();
  AppStateGo.board = move.result.board;
  AppStateGo.koPoint = move.result.koPoint;
  AppStateGo.boardHistory.push(GoCore.boardKey(move.result.board));
  AppStateGo.captures[aiColor] += move.result.captured.length;
  AppStateGo.lastMove = { r: move.r, c: move.c };
  AppStateGo.consecutivePasses = 0;
  AppStateGo.moveCount++;
  AppStateGo.turn = aiColor === "b" ? "w" : "b";
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", "Computer played. Your move.");
}

function undoLastMove() {
  if (!AppStateGo.undoStack || !AppStateGo.undoStack.length) return;
  let prev = AppStateGo.undoStack.pop();
  if (AppStateGo.mode === "offline-ai") {
    // Undo the human's own last move, not just one ply - keep popping
    // until it's the human's turn again.
    while (prev.turn !== AppStateGo.humanColor && AppStateGo.undoStack.length) {
      prev = AppStateGo.undoStack.pop();
    }
  }
  AppStateGo.board = prev.board;
  AppStateGo.turn = prev.turn;
  AppStateGo.koPoint = prev.koPoint;
  AppStateGo.gameOver = prev.gameOver;
  AppStateGo.consecutivePasses = prev.consecutivePasses;
  AppStateGo.moveCount = prev.moveCount;
  AppStateGo.captures = prev.captures;
  AppStateGo.lastMove = prev.lastMove;
  if (typeof prev.historyLength === "number") AppStateGo.boardHistory.length = prev.historyLength;
  setGameResultGo("");
  updateGoBoard();
  updateGameLabelsGo();
  setStatusGo("board-info", "Move undone.");
}

function showBoardSectionGo() {
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

/*** Board rendering ***/

function buildGoBoardDOM() {
  const grid = document.getElementById("go-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const n = AppStateGo.size;
  const step = 100 / (n - 1);

  for (let i = 0; i < n; i++) {
    const hLine = document.createElement("div");
    hLine.className = "go-line go-line-h";
    hLine.style.top = (i * step) + "%";
    grid.appendChild(hLine);

    const vLine = document.createElement("div");
    vLine.className = "go-line go-line-v";
    vLine.style.left = (i * step) + "%";
    grid.appendChild(vLine);
  }

  GoCore.hoshiPoints(n).forEach(([r, c]) => {
    const dot = document.createElement("div");
    dot.className = "go-hoshi";
    dot.style.top = (r * step) + "%";
    dot.style.left = (c * step) + "%";
    grid.appendChild(dot);
  });

  const pointSize = step * 0.92;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const pt = document.createElement("button");
      pt.className = "go-point";
      pt.style.top = (r * step) + "%";
      pt.style.left = (c * step) + "%";
      pt.style.width = pointSize + "%";
      pt.style.height = pointSize + "%";
      pt.dataset.row = r;
      pt.dataset.col = c;
      const stone = document.createElement("span");
      stone.className = "go-stone";
      pt.appendChild(stone);
      pt.addEventListener("click", onGoPointClick);
      grid.appendChild(pt);
    }
  }

  // Fallback if `aspect-ratio` isn't supported (seen on real E-Ink browsers,
  // e.g. older Tolino WebViews): without it, #go-board's height comes only
  // from its percentage padding, and #go-grid - sized 100%/100% of that -
  // collapses to near zero, squashing the whole grid onto one line. Setting
  // an explicit pixel height mirrors app.js's ensureSquareAspectRatio().
  ensureGoBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureGoBoardSquare);
  } else {
    setTimeout(ensureGoBoardSquare, 0);
  }
  ensureGoResizeHandler();
}

function ensureGoBoardSquare() {
  const boardEl = document.getElementById("go-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureGoResizeHandler() {
  if (einkGoResizeHandlerAttached) return;
  einkGoResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkGoResizeTimeoutId !== null) clearTimeout(einkGoResizeTimeoutId);
    einkGoResizeTimeoutId = setTimeout(() => {
      einkGoResizeTimeoutId = null;
      ensureGoBoardSquare();
    }, 150);
  });
}

function updateGoBoard() {
  const grid = document.getElementById("go-grid");
  if (!grid) return;
  const points = grid.querySelectorAll(".go-point");
  points.forEach((pt) => {
    const r = parseInt(pt.dataset.row, 10);
    const c = parseInt(pt.dataset.col, 10);
    const stone = AppStateGo.board[r][c];
    const stoneEl = pt.querySelector(".go-stone");
    stoneEl.classList.remove("go-stone-black", "go-stone-white");
    if (stone === "b") stoneEl.classList.add("go-stone-black");
    else if (stone === "w") stoneEl.classList.add("go-stone-white");

    pt.classList.toggle(
      "last-move",
      !!(AppStateGo.lastMove && !AppStateGo.lastMove.pass &&
         AppStateGo.lastMove.r === r && AppStateGo.lastMove.c === c)
    );

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += stone ? ", " + (stone === "b" ? "Black" : "White") + " stone" : ", empty";
    pt.setAttribute("aria-label", label);
  });
  ensureGoBoardSquare();
  updateScoreLineGo();
}

function updateScoreLineGo() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateGo.moveCount > 0 || AppStateGo.captures.b > 0 || AppStateGo.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Captured – Black: " + AppStateGo.captures.b + " · White: " + AppStateGo.captures.w);
}

function updateGameLabelsGo() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateGo.moveCount ? "Move " + AppStateGo.moveCount : "");
  updateUndoButtonVisibilityGo();
  updatePassResignVisibilityGo();

  if (AppStateGo.gameOver) clearSavedGoGame();
  else saveGoGame();
}

function updateUndoButtonVisibilityGo() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateGo.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateGo.gameOver));
}

function updatePassResignVisibilityGo() {
  const passBtn = document.getElementById("pass-button");
  const resignBtn = document.getElementById("resign-button");
  const show = !AppStateGo.gameOver &&
    (AppStateGo.mode === "offline" || AppStateGo.turn === AppStateGo.humanColor);
  if (passBtn) passBtn.classList.toggle("hidden", !show);
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateGo.gameOver);
}

document.addEventListener("DOMContentLoaded", initGoApp);
