// hnefatafl-app.js
// Wires HnefataflCore/HnefataflAi to the hnefatafl.html UI. Board
// rendering is the standard per-square-button float-grid technique
// (a 7x7 board, so .hnefatafl-square needs the usual explicit width
// override - the shared .square base class assumes 8 columns). Sides
// are told apart structurally, not by color alone: the attackers are
// a plain filled disc, the defenders an outlined disc, and the king
// gets his own crown-shaped marker on top of the defender disc.
//
// Since every piece moves like a rook (not just one step, like
// checkers), clicking a piece highlights every square it could slide
// to this turn - the same click-piece-then-click-destination flow as
// checkers/shogi, just with more destinations lit up at once.

const AppStateHnefatafl = {
  mode: "offline",        // "offline" | "offline-ai"
  state: HnefataflCore.createInitialState(),
  turn: "attacker",       // "attacker" | "defender" - attackers move first
  selected: null,         // [r, c] | null
  legalTargets: {},       // "r,c" -> true, for the current selection
  lastMove: null,         // { from:[r,c], to:[r,c] } | null
  humanSide: "defender",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const HNEFATAFL_SAVE_KEY = "einkchess_save_hnefatafl";

function saveHnefataflGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(HNEFATAFL_SAVE_KEY, {
    mode: AppStateHnefatafl.mode,
    state: AppStateHnefatafl.state,
    turn: AppStateHnefatafl.turn,
    lastMove: AppStateHnefatafl.lastMove,
    humanSide: AppStateHnefatafl.humanSide,
    aiLevel: AppStateHnefatafl.aiLevel,
    moveCount: AppStateHnefatafl.moveCount
  });
}

function clearSavedHnefataflGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(HNEFATAFL_SAVE_KEY);
}

function recordHnefataflStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateHnefatafl.mode !== "offline-ai") return;
  GameStats.record("hnefatafl", outcome);
}

function sideNameHnefatafl(side) {
  return side === "attacker" ? "Attackers" : "Defenders";
}

function setStatusHnefatafl(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultHnefatafl(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleHnefatafl(winner) {
  if (AppStateHnefatafl.mode === "offline-ai") {
    return winner === AppStateHnefatafl.humanSide ? "You win!" : "You lose";
  }
  return sideNameHnefatafl(winner) + " win";
}

function announceGameResultHnefatafl(resultCode, message) {
  setGameResultHnefatafl(message);
  setStatusHnefatafl("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackHnefatafl() {
  AppStateHnefatafl.undoStack = [];
}

function pushUndoSnapshotHnefatafl() {
  AppStateHnefatafl.undoStack.push({
    state: HnefataflCore.cloneState(AppStateHnefatafl.state),
    turn: AppStateHnefatafl.turn,
    gameOver: AppStateHnefatafl.gameOver,
    moveCount: AppStateHnefatafl.moveCount,
    lastMove: AppStateHnefatafl.lastMove
  });
}

function initHnefataflApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("hnefatafl-side-choice");
  const levelInline = document.getElementById("hnefatafl-level-inline");
  const startGameBtn = document.getElementById("start-hnefatafl-game");
  const resignBtn = document.getElementById("resign-button");

  function updateSideChoiceVisibility() {
    if (!sideChoice || !levelInline) return;
    sideChoice.classList.toggle("hidden", levelInline.value === "0");
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

  function startNewGame(mode, humanSide, level) {
    AppStateHnefatafl.mode = mode;
    AppStateHnefatafl.state = HnefataflCore.createInitialState();
    AppStateHnefatafl.turn = "attacker";
    AppStateHnefatafl.selected = null;
    AppStateHnefatafl.legalTargets = {};
    AppStateHnefatafl.lastMove = null;
    AppStateHnefatafl.humanSide = humanSide;
    AppStateHnefatafl.aiLevel = level;
    AppStateHnefatafl.gameOver = false;
    AppStateHnefatafl.moveCount = 0;
    resetUndoStackHnefatafl();
    setGameResultHnefatafl("");
    showBoardSectionHnefatafl();
    buildHnefataflBoardDOM();
    updateHnefataflBoard();
    updateGameLabelsHnefatafl();

    if (mode === "offline-ai" && humanSide !== "attacker") {
      setStatusHnefatafl("board-info", "Computer thinking…");
      setTimeout(aiTurnHnefatafl, 300);
    } else {
      setStatusHnefatafl("board-info", sideNameHnefatafl(AppStateHnefatafl.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "defender", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateHnefatafl.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusHnefatafl("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='hnefatafl-side']:checked");
    const humanSide = sideInput && sideInput.value === "attacker" ? "attacker" : "defender";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "defender", 0);
      setStatusHnefatafl("offline-hnefatafl-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusHnefatafl("offline-hnefatafl-status",
      "You play " + sideNameHnefatafl(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateHnefatafl.gameOver) return;
      const loser = AppStateHnefatafl.turn;
      const winner = HnefataflCore.otherPlayer(loser);
      AppStateHnefatafl.gameOver = true;
      announceGameResultHnefatafl(resultTitleHnefatafl(winner), sideNameHnefatafl(winner) + " win by resignation.");
      recordHnefataflStatsIfVsAi("loss");
      updateGameLabelsHnefatafl();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(HNEFATAFL_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateHnefatafl.mode = savedGame.mode;
    AppStateHnefatafl.state = savedGame.state;
    AppStateHnefatafl.turn = savedGame.turn;
    AppStateHnefatafl.selected = null;
    AppStateHnefatafl.legalTargets = {};
    AppStateHnefatafl.lastMove = savedGame.lastMove;
    AppStateHnefatafl.humanSide = savedGame.humanSide;
    AppStateHnefatafl.aiLevel = savedGame.aiLevel;
    AppStateHnefatafl.moveCount = savedGame.moveCount;
    AppStateHnefatafl.gameOver = false;
    resetUndoStackHnefatafl();
    setActiveModeButton(AppStateHnefatafl.mode);
    setGameResultHnefatafl("");
    showBoardSectionHnefatafl();
    buildHnefataflBoardDOM();
    updateHnefataflBoard();
    updateGameLabelsHnefatafl();
    if (AppStateHnefatafl.mode === "offline-ai" && AppStateHnefatafl.turn !== AppStateHnefatafl.humanSide) {
      setStatusHnefatafl("board-info", "Computer thinking…");
      setTimeout(aiTurnHnefatafl, 300);
    } else {
      setStatusHnefatafl("board-info", sideNameHnefatafl(AppStateHnefatafl.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeyHnefatafl(r, c) {
  return r + "," + c;
}

function computeLegalTargetsHnefatafl(from) {
  const targets = {};
  HnefataflCore.getLegalMoves(AppStateHnefatafl.state, AppStateHnefatafl.turn)
    .filter((m) => m.from[0] === from[0] && m.from[1] === from[1])
    .forEach((m) => { targets[targetKeyHnefatafl(m.to[0], m.to[1])] = true; });
  return targets;
}

function onHnefataflSquareClick(e) {
  if (AppStateHnefatafl.gameOver) {
    setStatusHnefatafl("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateHnefatafl.mode === "offline-ai" && AppStateHnefatafl.turn !== AppStateHnefatafl.humanSide) {
    setStatusHnefatafl("board-info", "Computer to move.");
    return;
  }

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const piece = AppStateHnefatafl.state.board[r][c];
  const turn = AppStateHnefatafl.turn;
  const key = targetKeyHnefatafl(r, c);

  if (AppStateHnefatafl.selected && AppStateHnefatafl.legalTargets[key]) {
    applyHnefataflMove({ from: AppStateHnefatafl.selected, to: [r, c] });
    return;
  }

  if (piece && piece.side === turn) {
    AppStateHnefatafl.selected = [r, c];
    AppStateHnefatafl.legalTargets = computeLegalTargetsHnefatafl([r, c]);
    updateHnefataflBoard();
    setStatusHnefatafl("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateHnefatafl.selected) {
    AppStateHnefatafl.selected = null;
    AppStateHnefatafl.legalTargets = {};
    updateHnefataflBoard();
    setStatusHnefatafl("board-info", sideNameHnefatafl(turn) + " to move.");
  }
}

function applyHnefataflMove(move) {
  pushUndoSnapshotHnefatafl();
  const mover = AppStateHnefatafl.turn;
  AppStateHnefatafl.state = HnefataflCore.applyMove(AppStateHnefatafl.state, mover, move);
  AppStateHnefatafl.lastMove = { from: move.from, to: move.to };
  AppStateHnefatafl.moveCount++;
  AppStateHnefatafl.selected = null;
  AppStateHnefatafl.legalTargets = {};
  AppStateHnefatafl.turn = HnefataflCore.otherPlayer(mover);
  updateHnefataflBoard();
  updateGameLabelsHnefatafl();

  if (AppStateHnefatafl.state.gameOver) {
    AppStateHnefatafl.gameOver = true;
    const winnerName = sideNameHnefatafl(AppStateHnefatafl.state.winner);
    const reasons = {
      capture: " by capturing the king!",
      escape: " as the king reaches a corner!",
      "no-moves": " - the other side has no legal move!"
    };
    const reason = reasons[AppStateHnefatafl.state.winReason] || ".";
    announceGameResultHnefatafl(resultTitleHnefatafl(AppStateHnefatafl.state.winner), winnerName + " win" + reason);
    recordHnefataflStatsIfVsAi(AppStateHnefatafl.state.winner === AppStateHnefatafl.humanSide ? "win" : "loss");
    updateGameLabelsHnefatafl();
    return;
  }

  setStatusHnefatafl("board-info", sideNameHnefatafl(mover) + " played. " + sideNameHnefatafl(AppStateHnefatafl.turn) + " to move.");

  if (AppStateHnefatafl.mode === "offline-ai" && AppStateHnefatafl.turn !== AppStateHnefatafl.humanSide) {
    setStatusHnefatafl("board-info", "Computer thinking…");
    setTimeout(aiTurnHnefatafl, 350);
  }
}

function aiTurnHnefatafl() {
  if (AppStateHnefatafl.mode !== "offline-ai" || AppStateHnefatafl.gameOver) return;
  const aiSide = HnefataflCore.otherPlayer(AppStateHnefatafl.humanSide);
  if (AppStateHnefatafl.turn !== aiSide) return;

  const move = HnefataflAi.chooseMove(AppStateHnefatafl.state, aiSide, AppStateHnefatafl.aiLevel);
  if (!move) return; // the previous move's no-legal-move check already caught a loss here
  applyHnefataflMove(move);
}

function undoLastMove() {
  if (!AppStateHnefatafl.undoStack || !AppStateHnefatafl.undoStack.length) return;
  let prev = AppStateHnefatafl.undoStack.pop();
  if (AppStateHnefatafl.mode === "offline-ai") {
    while (prev.turn !== AppStateHnefatafl.humanSide && AppStateHnefatafl.undoStack.length) {
      prev = AppStateHnefatafl.undoStack.pop();
    }
  }
  AppStateHnefatafl.state = prev.state;
  AppStateHnefatafl.turn = prev.turn;
  AppStateHnefatafl.gameOver = prev.gameOver;
  AppStateHnefatafl.moveCount = prev.moveCount;
  AppStateHnefatafl.lastMove = prev.lastMove;
  AppStateHnefatafl.selected = null;
  AppStateHnefatafl.legalTargets = {};
  setGameResultHnefatafl("");
  updateHnefataflBoard();
  updateGameLabelsHnefatafl();
  setStatusHnefatafl("board-info", "Move undone. " + sideNameHnefatafl(AppStateHnefatafl.turn) + " to move.");
}

function showBoardSectionHnefatafl() {
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

/*** Board rendering (float-grid, same technique as chess/checkers/shogi) ***/

function buildHnefataflBoardDOM() {
  const boardEl = document.getElementById("hnefatafl-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < HnefataflCore.SIZE; r++) {
    for (let c = 0; c < HnefataflCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square hnefatafl-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (HnefataflCore.isThrone(r, c)) square.classList.add("hnefatafl-square-throne");
      if (HnefataflCore.isCorner(r, c)) square.classList.add("hnefatafl-square-corner");

      const piece = document.createElement("span");
      piece.className = "hnefatafl-piece";
      square.appendChild(piece);

      square.addEventListener("click", onHnefataflSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureHnefataflSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureHnefataflSquareAspectRatio);
  } else {
    setTimeout(ensureHnefataflSquareAspectRatio, 0);
  }
  ensureHnefataflResizeHandler();
}

let einkHnefataflResizeHandlerAttached = false;
let einkHnefataflResizeTimeoutId = null;

function ensureHnefataflSquareAspectRatio() {
  const boardEl = document.getElementById("hnefatafl-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / HnefataflCore.SIZE;
  boardEl.querySelectorAll(".hnefatafl-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureHnefataflResizeHandler() {
  if (einkHnefataflResizeHandlerAttached) return;
  einkHnefataflResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkHnefataflResizeTimeoutId !== null) clearTimeout(einkHnefataflResizeTimeoutId);
    einkHnefataflResizeTimeoutId = setTimeout(() => {
      einkHnefataflResizeTimeoutId = null;
      ensureHnefataflSquareAspectRatio();
    }, 150);
  });
}

function updateHnefataflBoard() {
  const boardEl = document.getElementById("hnefatafl-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".hnefatafl-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateHnefatafl.state.board[r][c];
    const pieceEl = sq.querySelector(".hnefatafl-piece");
    if (pieceEl) {
      pieceEl.classList.remove("hnefatafl-piece-attacker", "hnefatafl-piece-defender", "hnefatafl-piece-king");
      if (piece) {
        pieceEl.classList.add(piece.side === "attacker" ? "hnefatafl-piece-attacker" : "hnefatafl-piece-defender");
        if (piece.king) pieceEl.classList.add("hnefatafl-piece-king");
      }
    }

    const isSelected = AppStateHnefatafl.selected
      && AppStateHnefatafl.selected[0] === r && AppStateHnefatafl.selected[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("hnefatafl-square-movable", !!AppStateHnefatafl.legalTargets[targetKeyHnefatafl(r, c)]);
    sq.classList.toggle("last-move", !!(AppStateHnefatafl.lastMove &&
      ((AppStateHnefatafl.lastMove.from[0] === r && AppStateHnefatafl.lastMove.from[1] === c) ||
       (AppStateHnefatafl.lastMove.to[0] === r && AppStateHnefatafl.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece.king ? "King" : (piece.side === "attacker" ? "Attacker" : "Defender"));
    } else {
      label += ", empty";
    }
    sq.setAttribute("aria-label", label);
  });
}

function updateGameLabelsHnefatafl() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateHnefatafl.moveCount ? "Move " + AppStateHnefatafl.moveCount : "";
  updateUndoButtonVisibilityHnefatafl();
  updateResignVisibilityHnefatafl();

  if (AppStateHnefatafl.gameOver) clearSavedHnefataflGame();
  else saveHnefataflGame();
}

function updateUndoButtonVisibilityHnefatafl() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateHnefatafl.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateHnefatafl.gameOver));
}

function updateResignVisibilityHnefatafl() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateHnefatafl.gameOver);
}

document.addEventListener("DOMContentLoaded", initHnefataflApp);
