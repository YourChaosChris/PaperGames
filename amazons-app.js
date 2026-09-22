// amazons-app.js
// Wires AmazonsCore/AmazonsAi to the amazons.html UI. The board uses
// the same percentage-based absolute-positioning technique as Wall
// Maze and Hex (a JS-enforced square aspect ratio, since CSS
// `aspect-ratio` alone is unreliable on E-Ink browsers) rather than
// the float-grid used for 8x8-ish boards elsewhere, simply because a
// 10x10 board needs the same per-cell percentage sizing those two
// already use.
//
// Every turn is three taps rather than one: tap one of your own
// amazons to select it, tap where it moves to, then - from that new
// square - tap where it shoots its arrow. Each step highlights only
// the squares legal for that step (computed fresh from the current
// board, or from a temporary "as if it had already moved there" board
// for the arrow step), so there is never a way to tap your way into
// an illegal move. Amazons are told apart the same structural way as
// every other two-player game here: Player 1 is a filled disc, Player
// 2 an outlined disc; a burned square gets its own crosshatch fill,
// visually distinct from both.

const AppStateAmazons = {
  mode: "offline",        // "offline" | "offline-ai"
  state: AmazonsCore.createInitialState(),
  turn: "p1",             // "p1" | "p2" - p1 moves first
  selectedFrom: null,     // [r, c] | null - the amazon chosen in step 1
  pendingTo: null,        // [r, c] | null - the destination chosen in step 2
  moveTargets: {},        // "r,c" -> true, valid step-2 destinations
  arrowTargets: {},       // "r,c" -> true, valid step-3 arrow landings
  lastMove: null,         // { from:[r,c], to:[r,c], arrow:[r,c] } | null
  humanSide: "p1",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const AMAZONS_SAVE_KEY = "einkchess_save_amazons";

function saveAmazonsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(AMAZONS_SAVE_KEY, {
    mode: AppStateAmazons.mode,
    state: AppStateAmazons.state,
    turn: AppStateAmazons.turn,
    lastMove: AppStateAmazons.lastMove,
    humanSide: AppStateAmazons.humanSide,
    aiLevel: AppStateAmazons.aiLevel,
    moveCount: AppStateAmazons.moveCount
  });
}

function clearSavedAmazonsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(AMAZONS_SAVE_KEY);
}

function recordAmazonsStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateAmazons.mode !== "offline-ai") return;
  GameStats.record("amazons", outcome);
}

function sideNameAmazons(side) {
  return side === "p1" ? "Player 1" : "Player 2";
}

function setStatusAmazons(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultAmazons(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleAmazons(winner) {
  if (AppStateAmazons.mode === "offline-ai") {
    return winner === AppStateAmazons.humanSide ? "You win!" : "You lose";
  }
  return sideNameAmazons(winner) + " wins";
}

function announceGameResultAmazons(resultCode, message) {
  setGameResultAmazons(message);
  setStatusAmazons("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackAmazons() {
  AppStateAmazons.undoStack = [];
}

function pushUndoSnapshotAmazons() {
  AppStateAmazons.undoStack.push({
    state: AmazonsCore.cloneState(AppStateAmazons.state),
    turn: AppStateAmazons.turn,
    gameOver: AppStateAmazons.gameOver,
    moveCount: AppStateAmazons.moveCount,
    lastMove: AppStateAmazons.lastMove
  });
}

function resetSelectionAmazons() {
  AppStateAmazons.selectedFrom = null;
  AppStateAmazons.pendingTo = null;
  AppStateAmazons.moveTargets = {};
  AppStateAmazons.arrowTargets = {};
}

function initAmazonsApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("amazons-side-choice");
  const levelInline = document.getElementById("amazons-level-inline");
  const startGameBtn = document.getElementById("start-amazons-game");
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
    AppStateAmazons.mode = mode;
    AppStateAmazons.state = AmazonsCore.createInitialState();
    AppStateAmazons.turn = "p1";
    resetSelectionAmazons();
    AppStateAmazons.lastMove = null;
    AppStateAmazons.humanSide = humanSide;
    AppStateAmazons.aiLevel = level;
    AppStateAmazons.gameOver = false;
    AppStateAmazons.moveCount = 0;
    resetUndoStackAmazons();
    setGameResultAmazons("");
    showBoardSectionAmazons();
    buildAmazonsBoardDOM();
    updateAmazonsBoard();
    updateGameLabelsAmazons();

    if (mode === "offline-ai" && humanSide !== "p1") {
      setStatusAmazons("board-info", "Computer thinking…");
      setTimeout(aiTurnAmazons, 300);
    } else {
      setStatusAmazons("board-info", sideNameAmazons(AppStateAmazons.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "p1", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateAmazons.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusAmazons("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='amazons-side']:checked");
    const humanSide = sideInput && sideInput.value === "p2" ? "p2" : "p1";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "p1", 0);
      setStatusAmazons("offline-amazons-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusAmazons("offline-amazons-status",
      "You play " + sideNameAmazons(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateAmazons.gameOver) return;
      const loser = AppStateAmazons.turn;
      const winner = AmazonsCore.otherPlayer(loser);
      AppStateAmazons.gameOver = true;
      announceGameResultAmazons(resultTitleAmazons(winner), sideNameAmazons(winner) + " wins by resignation.");
      recordAmazonsStatsIfVsAi("loss");
      updateGameLabelsAmazons();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(AMAZONS_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateAmazons.mode = savedGame.mode;
    AppStateAmazons.state = savedGame.state;
    AppStateAmazons.turn = savedGame.turn;
    resetSelectionAmazons();
    AppStateAmazons.lastMove = savedGame.lastMove;
    AppStateAmazons.humanSide = savedGame.humanSide;
    AppStateAmazons.aiLevel = savedGame.aiLevel;
    AppStateAmazons.moveCount = savedGame.moveCount;
    AppStateAmazons.gameOver = false;
    resetUndoStackAmazons();
    setActiveModeButton(AppStateAmazons.mode);
    setGameResultAmazons("");
    showBoardSectionAmazons();
    buildAmazonsBoardDOM();
    updateAmazonsBoard();
    updateGameLabelsAmazons();
    if (AppStateAmazons.mode === "offline-ai" && AppStateAmazons.turn !== AppStateAmazons.humanSide) {
      setStatusAmazons("board-info", "Computer thinking…");
      setTimeout(aiTurnAmazons, 300);
    } else {
      setStatusAmazons("board-info", sideNameAmazons(AppStateAmazons.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isHumanTurnAmazons() {
  if (AppStateAmazons.gameOver) return false;
  if (AppStateAmazons.mode === "offline-ai" && AppStateAmazons.turn !== AppStateAmazons.humanSide) return false;
  return true;
}

function targetKeyAmazons(r, c) {
  return r + "," + c;
}

function computeMoveTargetsAmazons(from) {
  const targets = {};
  AmazonsCore.slideTargets(AppStateAmazons.state.board, from[0], from[1]).forEach(([r, c]) => {
    targets[targetKeyAmazons(r, c)] = true;
  });
  return targets;
}

function computeArrowTargetsAmazons(from, to) {
  const targets = {};
  AmazonsCore.arrowTargetsAfterMove(AppStateAmazons.state.board, from, to, AppStateAmazons.turn).forEach(([r, c]) => {
    targets[targetKeyAmazons(r, c)] = true;
  });
  return targets;
}

function selectAmazonAt(r, c) {
  AppStateAmazons.selectedFrom = [r, c];
  AppStateAmazons.pendingTo = null;
  AppStateAmazons.moveTargets = computeMoveTargetsAmazons([r, c]);
  AppStateAmazons.arrowTargets = {};
  updateAmazonsBoard();
  setStatusAmazons("board-info", "Choose where to move it.");
}

function onAmazonsCellClick(r, c) {
  if (AppStateAmazons.gameOver) {
    setStatusAmazons("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnAmazons()) {
    setStatusAmazons("board-info", "Computer to move.");
    return;
  }

  const board = AppStateAmazons.state.board;
  const turn = AppStateAmazons.turn;
  const key = targetKeyAmazons(r, c);

  // Step 3: the amazon already has its destination - this tap picks
  // where it shoots its arrow from there.
  if (AppStateAmazons.pendingTo) {
    if (AppStateAmazons.arrowTargets[key]) {
      applyAmazonsMove({ from: AppStateAmazons.selectedFrom, to: AppStateAmazons.pendingTo, arrow: [r, c] });
      return;
    }
    if (board[r][c] === turn) {
      selectAmazonAt(r, c);
      return;
    }
    resetSelectionAmazons();
    updateAmazonsBoard();
    setStatusAmazons("board-info", sideNameAmazons(turn) + " to move.");
    return;
  }

  // Step 2: an amazon is selected - this tap picks where it moves to.
  if (AppStateAmazons.selectedFrom) {
    if (AppStateAmazons.moveTargets[key]) {
      AppStateAmazons.pendingTo = [r, c];
      AppStateAmazons.moveTargets = {};
      AppStateAmazons.arrowTargets = computeArrowTargetsAmazons(AppStateAmazons.selectedFrom, [r, c]);
      updateAmazonsBoard();
      setStatusAmazons("board-info", "Now choose where to shoot the arrow from there.");
      return;
    }
    if (board[r][c] === turn) {
      selectAmazonAt(r, c);
      return;
    }
    resetSelectionAmazons();
    updateAmazonsBoard();
    setStatusAmazons("board-info", sideNameAmazons(turn) + " to move.");
    return;
  }

  // Step 1: nothing selected yet - this tap picks which amazon moves.
  if (board[r][c] === turn) {
    selectAmazonAt(r, c);
  }
}

function applyAmazonsMove(move) {
  pushUndoSnapshotAmazons();
  const mover = AppStateAmazons.turn;
  AppStateAmazons.state = AmazonsCore.applyMove(AppStateAmazons.state, mover, move);
  AppStateAmazons.lastMove = move;
  AppStateAmazons.moveCount++;
  resetSelectionAmazons();
  AppStateAmazons.turn = AmazonsCore.otherPlayer(mover);
  updateAmazonsBoard();
  updateGameLabelsAmazons();

  if (AppStateAmazons.state.gameOver) {
    AppStateAmazons.gameOver = true;
    const winnerName = sideNameAmazons(AppStateAmazons.state.winner);
    announceGameResultAmazons(resultTitleAmazons(AppStateAmazons.state.winner), winnerName + " wins - the other player has no legal move left!");
    recordAmazonsStatsIfVsAi(AppStateAmazons.state.winner === AppStateAmazons.humanSide ? "win" : "loss");
    updateGameLabelsAmazons();
    return;
  }

  setStatusAmazons("board-info", sideNameAmazons(mover) + " played. " + sideNameAmazons(AppStateAmazons.turn) + " to move.");

  if (AppStateAmazons.mode === "offline-ai" && AppStateAmazons.turn !== AppStateAmazons.humanSide) {
    setStatusAmazons("board-info", "Computer thinking…");
    setTimeout(aiTurnAmazons, 350);
  }
}

function aiTurnAmazons() {
  if (AppStateAmazons.mode !== "offline-ai" || AppStateAmazons.gameOver) return;
  const aiSide = AmazonsCore.otherPlayer(AppStateAmazons.humanSide);
  if (AppStateAmazons.turn !== aiSide) return;

  const move = AmazonsAi.chooseMove(AppStateAmazons.state, aiSide, AppStateAmazons.aiLevel);
  if (!move) return;
  applyAmazonsMove(move);
}

function undoLastMove() {
  if (!AppStateAmazons.undoStack || !AppStateAmazons.undoStack.length) return;
  let prev = AppStateAmazons.undoStack.pop();
  if (AppStateAmazons.mode === "offline-ai") {
    while (prev.turn !== AppStateAmazons.humanSide && AppStateAmazons.undoStack.length) {
      prev = AppStateAmazons.undoStack.pop();
    }
  }
  AppStateAmazons.state = prev.state;
  AppStateAmazons.turn = prev.turn;
  AppStateAmazons.gameOver = prev.gameOver;
  AppStateAmazons.moveCount = prev.moveCount;
  AppStateAmazons.lastMove = prev.lastMove;
  resetSelectionAmazons();
  setGameResultAmazons("");
  updateAmazonsBoard();
  updateGameLabelsAmazons();
  setStatusAmazons("board-info", "Move undone. " + sideNameAmazons(AppStateAmazons.turn) + " to move.");
}

function showBoardSectionAmazons() {
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

/*** Board rendering: percentage-based absolute positioning (same
     technique as Wall Maze/Hex), with a JS-enforced square aspect
     ratio since CSS `aspect-ratio` alone is unreliable on E-Ink
     browsers. ***/

const AMAZONS_N = 10; // cells per side
const AMAZONS_GAP_PCT = 1.0;
const AMAZONS_CELL_PCT = (100 - (AMAZONS_N - 1) * AMAZONS_GAP_PCT) / AMAZONS_N;
const AMAZONS_STEP_PCT = AMAZONS_CELL_PCT + AMAZONS_GAP_PCT;

function buildAmazonsBoardDOM() {
  const boardEl = document.getElementById("amazons-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < AMAZONS_N; r++) {
    for (let c = 0; c < AMAZONS_N; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "amazons-cell";
      cell.style.left = (c * AMAZONS_STEP_PCT) + "%";
      cell.style.top = (r * AMAZONS_STEP_PCT) + "%";
      cell.style.width = AMAZONS_CELL_PCT + "%";
      cell.style.height = AMAZONS_CELL_PCT + "%";
      cell.dataset.row = r;
      cell.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "amazons-piece";
      cell.appendChild(piece);
      cell.addEventListener("click", () => onAmazonsCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  ensureAmazonsBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureAmazonsBoardSquare);
  } else {
    setTimeout(ensureAmazonsBoardSquare, 0);
  }
  ensureAmazonsResizeHandler();
}

let einkAmazonsResizeHandlerAttached = false;
let einkAmazonsResizeTimeoutId = null;

function ensureAmazonsBoardSquare() {
  const boardEl = document.getElementById("amazons-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureAmazonsResizeHandler() {
  if (einkAmazonsResizeHandlerAttached) return;
  einkAmazonsResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkAmazonsResizeTimeoutId !== null) clearTimeout(einkAmazonsResizeTimeoutId);
    einkAmazonsResizeTimeoutId = setTimeout(() => {
      einkAmazonsResizeTimeoutId = null;
      ensureAmazonsBoardSquare();
    }, 150);
  });
}

function updateAmazonsBoard() {
  const boardEl = document.getElementById("amazons-board");
  if (!boardEl) return;
  const state = AppStateAmazons.state;
  const board = state.board;
  const lastMove = AppStateAmazons.lastMove;

  boardEl.querySelectorAll(".amazons-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const value = board[r][c];
    const key = targetKeyAmazons(r, c);
    const pieceEl = cell.querySelector(".amazons-piece");

    pieceEl.classList.remove("amazons-piece-p1", "amazons-piece-p2");
    if (value === "p1") pieceEl.classList.add("amazons-piece-p1");
    else if (value === "p2") pieceEl.classList.add("amazons-piece-p2");

    cell.classList.toggle("amazons-cell-burned", value === "burned");
    cell.classList.toggle("selected", !!(AppStateAmazons.selectedFrom &&
      AppStateAmazons.selectedFrom[0] === r && AppStateAmazons.selectedFrom[1] === c));
    cell.classList.toggle("amazons-cell-pending-to", !!(AppStateAmazons.pendingTo &&
      AppStateAmazons.pendingTo[0] === r && AppStateAmazons.pendingTo[1] === c));
    cell.classList.toggle("amazons-cell-movable", !!AppStateAmazons.moveTargets[key]);
    cell.classList.toggle("amazons-cell-arrow-target", !!AppStateAmazons.arrowTargets[key]);
    cell.classList.toggle("last-move", !!(lastMove && (
      (lastMove.from[0] === r && lastMove.from[1] === c) ||
      (lastMove.to[0] === r && lastMove.to[1] === c) ||
      (lastMove.arrow[0] === r && lastMove.arrow[1] === c)
    )));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (value === "p1") label += ", Player 1";
    else if (value === "p2") label += ", Player 2";
    else if (value === "burned") label += ", burned";
    else label += ", empty";
    cell.setAttribute("aria-label", label);
  });

  updateScoreLineAmazons();
}

function updateScoreLineAmazons() {
  const container = document.getElementById("score-line");
  const infoEl = document.getElementById("score-captures");
  if (!container || !infoEl) return;
  if (typeof AmazonsAi === "undefined") {
    container.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");
  const board = AppStateAmazons.state.board;
  const p1Mobility = AmazonsAi.totalMobility(board, "p1");
  const p2Mobility = AmazonsAi.totalMobility(board, "p2");
  infoEl.textContent = "Reachable squares – Player 1: " + p1Mobility + " · Player 2: " + p2Mobility;
}

function updateGameLabelsAmazons() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateAmazons.moveCount ? "Move " + AppStateAmazons.moveCount : "";
  updateUndoButtonVisibilityAmazons();
  updateResignVisibilityAmazons();

  if (AppStateAmazons.gameOver) clearSavedAmazonsGame();
  else saveAmazonsGame();
}

function updateUndoButtonVisibilityAmazons() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateAmazons.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateAmazons.gameOver));
}

function updateResignVisibilityAmazons() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateAmazons.gameOver);
}

document.addEventListener("DOMContentLoaded", initAmazonsApp);
