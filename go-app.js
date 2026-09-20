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
  captures: { b: 0, w: 0 } // stones captured BY black / BY white
};

let einkGoResizeHandlerAttached = false;
let einkGoResizeTimeoutId = null;

function colorNameGo(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusGo(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultGo(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
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
    lastMove: AppStateGo.lastMove
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
  const winnerLetter = score.winner === "b" ? "B" : "W";
  setGameResultGo(winnerLetter + "+" + margin);
  setStatusGo("board-info",
    "Both passed. " + colorNameGo(score.winner) + " wins by " + margin +
    " (Black " + score.blackScore + " – White " + score.whiteScore + ").");
  updateGameLabelsGo();
}

function explainIllegalGoMove(reason) {
  if (reason === "occupied") return "Invalid move: that point is already occupied.";
  if (reason === "suicide") return "Invalid move: that would leave your stones with no liberties.";
  if (reason === "ko") return "Invalid move: forbidden by the ko rule (recaptures immediately).";
  return "Invalid move.";
}

function initGoApp() {
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
      setGameResultGo((winner === "b" ? "B" : "W") + "+R");
      setStatusGo("board-info", colorNameGo(winner) + " wins by resignation.");
      updateGameLabelsGo();
    });
  }

  updateGoColorChoiceVisibility();
  setActiveModeButtonGo("offline");
  startNewGame(9, "offline", "b", 0);
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
  const result = GoCore.tryMove(AppStateGo.board, AppStateGo.size, r, c, AppStateGo.turn, AppStateGo.koPoint);
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

  const move = GoAi.chooseMove(AppStateGo.board, AppStateGo.size, aiColor, AppStateGo.aiLevel, AppStateGo.koPoint);

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
  if (menuToggle) menuToggle.textContent = "☰ Menu";
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

  ensureGoResizeHandler();
}

function ensureGoResizeHandler() {
  if (einkGoResizeHandlerAttached) return;
  einkGoResizeHandlerAttached = true;
  // The board is pure CSS percentage layout, so no JS resize math is
  // currently needed - kept as a debounced no-op hook in case a future
  // E-Ink browser needs a manual nudge, mirroring app.js's pattern.
  window.addEventListener("resize", () => {
    if (einkGoResizeTimeoutId !== null) clearTimeout(einkGoResizeTimeoutId);
    einkGoResizeTimeoutId = setTimeout(() => {
      einkGoResizeTimeoutId = null;
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
  });
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
  capturesEl.textContent = "Captured – Black: " + AppStateGo.captures.b + " · White: " + AppStateGo.captures.w;
}

function updateGameLabelsGo() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateGo.moveCount ? "Move " + AppStateGo.moveCount : "";
  updateUndoButtonVisibilityGo();
  updatePassResignVisibilityGo();
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
