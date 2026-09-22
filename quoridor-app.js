// quoridor-app.js
// Wires QuoridorCore/QuoridorAi to the quoridor.html UI. Unlike the
// float-grid boards elsewhere in this app, Quoridor needs clickable
// targets BETWEEN cells too (the wall slots), so the board uses
// percentage-based absolute positioning instead - the same technique
// already proven for Go's line-and-point board, with a JS-enforced
// square aspect ratio for the same reason (CSS `aspect-ratio` is
// unreliable on E-Ink browsers).
//
// Since each player only ever has a single pawn, there's no
// select-a-piece step: every turn, every legal pawn destination and
// every legal wall slot is highlighted at once, and clicking either
// directly makes that move.

const AppStateQuoridor = {
  mode: "offline",        // "offline" | "offline-ai"
  state: QuoridorCore.createInitialState(),
  turn: "p1",             // "p1" | "p2" - p1 moves first
  lastMove: null,         // the last applied move, for highlighting
  humanSide: "p1",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  pendingWall: null       // { wr, wc, orientation, toggled } | null - a wall placement being previewed
};

const QUORIDOR_SAVE_KEY = "einkchess_save_quoridor";

function saveQuoridorGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(QUORIDOR_SAVE_KEY, {
    mode: AppStateQuoridor.mode,
    state: AppStateQuoridor.state,
    turn: AppStateQuoridor.turn,
    lastMove: AppStateQuoridor.lastMove,
    humanSide: AppStateQuoridor.humanSide,
    aiLevel: AppStateQuoridor.aiLevel,
    moveCount: AppStateQuoridor.moveCount
  });
}

function clearSavedQuoridorGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(QUORIDOR_SAVE_KEY);
}

function recordQuoridorStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateQuoridor.mode !== "offline-ai") return;
  GameStats.record("quoridor", outcome);
}

function sideNameQuoridor(side) {
  return side === "p1" ? "Player 1" : "Player 2";
}

function setStatusQuoridor(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultQuoridor(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultQuoridor(resultCode, message) {
  setGameResultQuoridor(message);
  setStatusQuoridor("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackQuoridor() {
  AppStateQuoridor.undoStack = [];
}

function pushUndoSnapshotQuoridor() {
  AppStateQuoridor.undoStack.push({
    state: QuoridorCore.cloneState(AppStateQuoridor.state),
    turn: AppStateQuoridor.turn,
    gameOver: AppStateQuoridor.gameOver,
    moveCount: AppStateQuoridor.moveCount,
    lastMove: AppStateQuoridor.lastMove
  });
}

function initQuoridorApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("quoridor-side-choice");
  const levelInline = document.getElementById("quoridor-level-inline");
  const startGameBtn = document.getElementById("start-quoridor-game");
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
    AppStateQuoridor.mode = mode;
    AppStateQuoridor.state = QuoridorCore.createInitialState();
    AppStateQuoridor.turn = "p1";
    AppStateQuoridor.lastMove = null;
    AppStateQuoridor.humanSide = humanSide;
    AppStateQuoridor.aiLevel = level;
    AppStateQuoridor.gameOver = false;
    AppStateQuoridor.moveCount = 0;
    AppStateQuoridor.pendingWall = null;
    resetUndoStackQuoridor();
    setGameResultQuoridor("");
    showBoardSectionQuoridor();
    buildQuoridorBoardDOM();
    updateQuoridorBoard();
    updateGameLabelsQuoridor();

    if (mode === "offline-ai" && humanSide !== "p1") {
      setStatusQuoridor("board-info", "Computer thinking…");
      setTimeout(aiTurnQuoridor, 300);
    } else {
      setStatusQuoridor("board-info", sideNameQuoridor(AppStateQuoridor.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateQuoridor.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusQuoridor("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='quoridor-side']:checked");
    const humanSide = sideInput && sideInput.value === "p2" ? "p2" : "p1";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "p1", 0);
      setStatusQuoridor("offline-quoridor-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusQuoridor("offline-quoridor-status",
      "You play " + sideNameQuoridor(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateQuoridor.gameOver) return;
      const loser = AppStateQuoridor.turn;
      const winner = QuoridorCore.otherPlayer(loser);
      AppStateQuoridor.gameOver = true;
      announceGameResultQuoridor(sideNameQuoridor(winner) + " wins", sideNameQuoridor(winner) + " wins by resignation.");
      recordQuoridorStatsIfVsAi("loss");
      updateGameLabelsQuoridor();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(QUORIDOR_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateQuoridor.mode = savedGame.mode;
    AppStateQuoridor.state = savedGame.state;
    AppStateQuoridor.turn = savedGame.turn;
    AppStateQuoridor.lastMove = savedGame.lastMove;
    AppStateQuoridor.humanSide = savedGame.humanSide;
    AppStateQuoridor.aiLevel = savedGame.aiLevel;
    AppStateQuoridor.moveCount = savedGame.moveCount;
    AppStateQuoridor.gameOver = false;
    AppStateQuoridor.pendingWall = null;
    resetUndoStackQuoridor();
    setActiveModeButton(AppStateQuoridor.mode);
    setGameResultQuoridor("");
    showBoardSectionQuoridor();
    buildQuoridorBoardDOM();
    updateQuoridorBoard();
    updateGameLabelsQuoridor();
    if (AppStateQuoridor.mode === "offline-ai" && AppStateQuoridor.turn !== AppStateQuoridor.humanSide) {
      setStatusQuoridor("board-info", "Computer thinking…");
      setTimeout(aiTurnQuoridor, 300);
    } else {
      setStatusQuoridor("board-info", sideNameQuoridor(AppStateQuoridor.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isHumanTurnQuoridor() {
  if (AppStateQuoridor.gameOver) return false;
  if (AppStateQuoridor.mode === "offline-ai" && AppStateQuoridor.turn !== AppStateQuoridor.humanSide) return false;
  return true;
}

function onQuoridorCellClick(r, c) {
  if (!isHumanTurnQuoridor()) {
    setStatusQuoridor("board-info", "Computer to move.");
    return;
  }
  if (AppStateQuoridor.pendingWall) {
    AppStateQuoridor.pendingWall = null;
    updateQuoridorBoard();
  }
  const moves = QuoridorCore.getLegalMoves(AppStateQuoridor.state, AppStateQuoridor.turn)
    .filter((m) => m.type === "move");
  const match = moves.find((m) => m.to[0] === r && m.to[1] === c);
  if (!match) return;
  applyQuoridorMove(match);
}

// Each of the 64 intersections has exactly one small clickable square
// (never overlapping a neighbor, unlike a full 2-cell wall bar would),
// and handles choosing between the two orientations that could start
// there: first tap previews one orientation, a second tap on the same
// intersection either switches to the other orientation (if both are
// legal there) or confirms, and a further tap always confirms.
function onQuoridorIntersectionClick(wr, wc) {
  if (!isHumanTurnQuoridor()) {
    setStatusQuoridor("board-info", "Computer to move.");
    return;
  }
  const wallMoves = QuoridorCore.getLegalMoves(AppStateQuoridor.state, AppStateQuoridor.turn)
    .filter((m) => m.type === "wall");
  const legalH = wallMoves.some((m) => m.orientation === "h" && m.row === wr && m.col === wc);
  const legalV = wallMoves.some((m) => m.orientation === "v" && m.row === wr && m.col === wc);

  if (!legalH && !legalV) {
    setStatusQuoridor("board-info", "No wall can be placed there.");
    return;
  }

  const pending = AppStateQuoridor.pendingWall;
  if (pending && pending.wr === wr && pending.wc === wc) {
    if (legalH && legalV && !pending.toggled) {
      pending.orientation = pending.orientation === "h" ? "v" : "h";
      pending.toggled = true;
      updateQuoridorBoard();
      setStatusQuoridor("board-info", "Tap again to place this wall.");
      return;
    }
    applyQuoridorMove({ type: "wall", orientation: pending.orientation, row: wr, col: wc });
    AppStateQuoridor.pendingWall = null;
    return;
  }

  AppStateQuoridor.pendingWall = { wr, wc, orientation: legalH ? "h" : "v", toggled: false };
  updateQuoridorBoard();
  setStatusQuoridor("board-info", legalH && legalV
    ? "Tap again to place this wall, or tap once more to switch orientation."
    : "Tap again to place this wall.");
}

function applyQuoridorMove(move) {
  pushUndoSnapshotQuoridor();
  const mover = AppStateQuoridor.turn;
  AppStateQuoridor.state = QuoridorCore.applyMove(AppStateQuoridor.state, mover, move);
  AppStateQuoridor.lastMove = move;
  AppStateQuoridor.pendingWall = null;
  AppStateQuoridor.moveCount++;
  AppStateQuoridor.turn = QuoridorCore.otherPlayer(mover);
  updateQuoridorBoard();
  updateGameLabelsQuoridor();

  if (AppStateQuoridor.state.gameOver) {
    AppStateQuoridor.gameOver = true;
    const winnerName = sideNameQuoridor(AppStateQuoridor.state.winner);
    announceGameResultQuoridor(winnerName + " wins", winnerName + " wins by reaching the far side!");
    recordQuoridorStatsIfVsAi(AppStateQuoridor.state.winner === AppStateQuoridor.humanSide ? "win" : "loss");
    updateGameLabelsQuoridor();
    return;
  }

  setStatusQuoridor("board-info", sideNameQuoridor(mover) + " played. " + sideNameQuoridor(AppStateQuoridor.turn) + " to move.");

  if (AppStateQuoridor.mode === "offline-ai" && AppStateQuoridor.turn !== AppStateQuoridor.humanSide) {
    setStatusQuoridor("board-info", "Computer thinking…");
    setTimeout(aiTurnQuoridor, 350);
  }
}

function aiTurnQuoridor() {
  if (AppStateQuoridor.mode !== "offline-ai" || AppStateQuoridor.gameOver) return;
  const aiSide = QuoridorCore.otherPlayer(AppStateQuoridor.humanSide);
  if (AppStateQuoridor.turn !== aiSide) return;

  const move = QuoridorAi.chooseMove(AppStateQuoridor.state, aiSide, AppStateQuoridor.aiLevel);
  if (!move) return;
  applyQuoridorMove(move);
}

function undoLastMove() {
  if (!AppStateQuoridor.undoStack || !AppStateQuoridor.undoStack.length) return;
  let prev = AppStateQuoridor.undoStack.pop();
  if (AppStateQuoridor.mode === "offline-ai") {
    while (prev.turn !== AppStateQuoridor.humanSide && AppStateQuoridor.undoStack.length) {
      prev = AppStateQuoridor.undoStack.pop();
    }
  }
  AppStateQuoridor.state = prev.state;
  AppStateQuoridor.turn = prev.turn;
  AppStateQuoridor.gameOver = prev.gameOver;
  AppStateQuoridor.moveCount = prev.moveCount;
  AppStateQuoridor.lastMove = prev.lastMove;
  AppStateQuoridor.pendingWall = null;
  setGameResultQuoridor("");
  updateQuoridorBoard();
  updateGameLabelsQuoridor();
  setStatusQuoridor("board-info", "Move undone. " + sideNameQuoridor(AppStateQuoridor.turn) + " to move.");
}

function showBoardSectionQuoridor() {
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
     technique as Go's board), since wall slots need clickable targets
     between cells, not just on them. ***/

const QUORIDOR_N = 9; // cells per side
const QUORIDOR_GAP_PCT = 1.6;
const QUORIDOR_CELL_PCT = (100 - (QUORIDOR_N - 1) * QUORIDOR_GAP_PCT) / QUORIDOR_N;
const QUORIDOR_STEP_PCT = QUORIDOR_CELL_PCT + QUORIDOR_GAP_PCT;

function buildQuoridorBoardDOM() {
  const boardEl = document.getElementById("quoridor-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < QUORIDOR_N; r++) {
    for (let c = 0; c < QUORIDOR_N; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "quoridor-cell";
      cell.style.left = (c * QUORIDOR_STEP_PCT) + "%";
      cell.style.top = (r * QUORIDOR_STEP_PCT) + "%";
      cell.style.width = QUORIDOR_CELL_PCT + "%";
      cell.style.height = QUORIDOR_CELL_PCT + "%";
      cell.dataset.row = r;
      cell.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "quoridor-piece";
      cell.appendChild(piece);
      cell.addEventListener("click", () => onQuoridorCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  // The 2-cell-long wall bars themselves are drawn as non-interactive
  // overlays (see renderQuoridorWallBars below) so their footprints
  // can freely span/overlap without stealing clicks. The ONLY
  // clickable wall control is a small square exactly at each of the
  // 64 intersections, so neighboring wall candidates never fight over
  // the same tap target the way two overlapping 2-cell bars would.
  for (let wr = 0; wr < QuoridorCore.WALL_GRID; wr++) {
    for (let wc = 0; wc < QuoridorCore.WALL_GRID; wc++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "quoridor-intersection";
      dot.style.left = (wc * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT) + "%";
      dot.style.top = (wr * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT) + "%";
      dot.style.width = QUORIDOR_GAP_PCT + "%";
      dot.style.height = QUORIDOR_GAP_PCT + "%";
      dot.dataset.row = wr;
      dot.dataset.col = wc;
      dot.addEventListener("click", () => onQuoridorIntersectionClick(wr, wc));
      boardEl.appendChild(dot);
    }
  }

  const wallLayer = document.createElement("div");
  wallLayer.id = "quoridor-wall-layer";
  wallLayer.className = "quoridor-wall-layer";
  boardEl.appendChild(wallLayer);

  ensureQuoridorBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureQuoridorBoardSquare);
  } else {
    setTimeout(ensureQuoridorBoardSquare, 0);
  }
  ensureQuoridorResizeHandler();
}

let einkQuoridorResizeHandlerAttached = false;
let einkQuoridorResizeTimeoutId = null;

function ensureQuoridorBoardSquare() {
  const boardEl = document.getElementById("quoridor-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureQuoridorResizeHandler() {
  if (einkQuoridorResizeHandlerAttached) return;
  einkQuoridorResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkQuoridorResizeTimeoutId !== null) clearTimeout(einkQuoridorResizeTimeoutId);
    einkQuoridorResizeTimeoutId = setTimeout(() => {
      einkQuoridorResizeTimeoutId = null;
      ensureQuoridorBoardSquare();
    }, 150);
  });
}

function updateQuoridorBoard() {
  const boardEl = document.getElementById("quoridor-board");
  if (!boardEl) return;
  const state = AppStateQuoridor.state;
  const turn = AppStateQuoridor.turn;
  const humanCanAct = isHumanTurnQuoridor();
  const legalMoves = humanCanAct ? QuoridorCore.getLegalMoves(state, turn) : [];
  const legalCellKeys = {};
  const legalWallKeys = {};
  legalMoves.forEach((m) => {
    if (m.type === "move") legalCellKeys[m.to[0] + "," + m.to[1]] = true;
    else legalWallKeys[m.orientation + "," + m.row + "," + m.col] = true;
  });

  boardEl.querySelectorAll(".quoridor-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const pieceEl = cell.querySelector(".quoridor-piece");
    pieceEl.classList.remove("quoridor-piece-p1", "quoridor-piece-p2");
    if (state.pawns.p1[0] === r && state.pawns.p1[1] === c) pieceEl.classList.add("quoridor-piece-p1");
    if (state.pawns.p2[0] === r && state.pawns.p2[1] === c) pieceEl.classList.add("quoridor-piece-p2");
    cell.classList.toggle("quoridor-cell-movable", !!legalCellKeys[r + "," + c]);
    cell.classList.toggle("last-move", !!(AppStateQuoridor.lastMove && AppStateQuoridor.lastMove.type === "move" &&
      AppStateQuoridor.lastMove.to[0] === r && AppStateQuoridor.lastMove.to[1] === c));
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (state.pawns.p1[0] === r && state.pawns.p1[1] === c) label += ", Player 1";
    else if (state.pawns.p2[0] === r && state.pawns.p2[1] === c) label += ", Player 2";
    cell.setAttribute("aria-label", label);
  });

  boardEl.querySelectorAll(".quoridor-intersection").forEach((dot) => {
    const wr = parseInt(dot.dataset.row, 10);
    const wc = parseInt(dot.dataset.col, 10);
    const legalHere = legalWallKeys["h," + wr + "," + wc] || legalWallKeys["v," + wr + "," + wc];
    const isPending = !!(AppStateQuoridor.pendingWall && AppStateQuoridor.pendingWall.wr === wr && AppStateQuoridor.pendingWall.wc === wc);
    dot.classList.toggle("quoridor-intersection-available", !!legalHere);
    dot.classList.toggle("quoridor-intersection-pending", isPending);
  });

  renderQuoridorWallBars(state);
  updateScoreLineQuoridor();
}

function quoridorWallBarStyle(orientation, wr, wc) {
  if (orientation === "h") {
    return {
      left: (wc * QUORIDOR_STEP_PCT) + "%",
      top: (wr * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT) + "%",
      width: (QUORIDOR_CELL_PCT * 2 + QUORIDOR_GAP_PCT) + "%",
      height: QUORIDOR_GAP_PCT + "%"
    };
  }
  return {
    left: (wc * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT) + "%",
    top: (wr * QUORIDOR_STEP_PCT) + "%",
    width: QUORIDOR_GAP_PCT + "%",
    height: (QUORIDOR_CELL_PCT * 2 + QUORIDOR_GAP_PCT) + "%"
  };
}

function renderQuoridorWallBars(state) {
  const layer = document.getElementById("quoridor-wall-layer");
  if (!layer) return;
  layer.innerHTML = "";

  for (let wr = 0; wr < QuoridorCore.WALL_GRID; wr++) {
    for (let wc = 0; wc < QuoridorCore.WALL_GRID; wc++) {
      if (state.horizontalWalls[wr][wc]) layer.appendChild(makeQuoridorWallBar("h", wr, wc, "quoridor-wall-bar-placed"));
      if (state.verticalWalls[wr][wc]) layer.appendChild(makeQuoridorWallBar("v", wr, wc, "quoridor-wall-bar-placed"));
    }
  }

  const pending = AppStateQuoridor.pendingWall;
  if (pending) {
    layer.appendChild(makeQuoridorWallBar(pending.orientation, pending.wr, pending.wc, "quoridor-wall-bar-preview"));
  }
}

function makeQuoridorWallBar(orientation, wr, wc, extraClass) {
  const bar = document.createElement("div");
  bar.className = "quoridor-wall-bar " + extraClass;
  const style = quoridorWallBarStyle(orientation, wr, wc);
  bar.style.left = style.left;
  bar.style.top = style.top;
  bar.style.width = style.width;
  bar.style.height = style.height;
  return bar;
}

function updateScoreLineQuoridor() {
  const container = document.getElementById("score-line");
  const wallsEl = document.getElementById("score-captures");
  if (!container || !wallsEl) return;
  container.classList.remove("hidden");
  wallsEl.textContent = "Walls left – Player 1: " + AppStateQuoridor.state.wallsRemaining.p1 +
    " · Player 2: " + AppStateQuoridor.state.wallsRemaining.p2;
}

function updateGameLabelsQuoridor() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateQuoridor.moveCount ? "Move " + AppStateQuoridor.moveCount : "";
  updateUndoButtonVisibilityQuoridor();
  updateResignVisibilityQuoridor();

  if (AppStateQuoridor.gameOver) clearSavedQuoridorGame();
  else saveQuoridorGame();
}

function updateUndoButtonVisibilityQuoridor() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateQuoridor.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateQuoridor.gameOver));
}

function updateResignVisibilityQuoridor() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateQuoridor.gameOver);
}

document.addEventListener("DOMContentLoaded", initQuoridorApp);
