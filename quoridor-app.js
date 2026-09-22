// quoridor-app.js
// Wires QuoridorCore/QuoridorAi to the quoridor.html UI. Unlike the
// float-grid boards elsewhere in this app, Quoridor needs clickable
// targets BETWEEN cells too (the walls), so the board uses
// percentage-based absolute positioning instead - the same technique
// already proven for Go's line-and-point board, with a JS-enforced
// square aspect ratio for the same reason (CSS `aspect-ratio` is
// unreliable on E-Ink browsers).
//
// Since each player only ever has a single pawn, there's no
// select-a-piece step for movement: every turn, every legal pawn
// destination is highlighted at once, and clicking one directly makes
// that move.
//
// Wall placement is a separate, explicit mode rather than tiny
// buttons squeezed between cells: a wall is two cells long, so any
// scheme of one button per candidate wall either makes adjacent
// candidates' hit areas overlap (ambiguous taps) or shrinks each
// target down to a sliver only a few pixels wide - both were tried
// and both were awkward to use. Instead, entering "place a wall" mode
// covers the whole board with one big, forgiving tap-catcher: tapping
// anywhere previews whichever LEGAL wall of the current orientation
// has its center closest to that tap, and a separate confirm button
// commits it - so the target is effectively the entire board, and a
// wrong first guess is fixed by just tapping again, not by hitting a
// precise sliver.

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
  wallMode: false,        // true while the player is placing a wall instead of moving
  wallOrientation: "h",   // "h" | "v" - which orientation new taps preview
  pendingWall: null       // { wr, wc, orientation } | null - a wall placement being previewed
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
  const wallModeBtn = document.getElementById("quoridor-wall-mode-btn");
  const orientationBtn = document.getElementById("quoridor-orientation-btn");
  const confirmWallBtn = document.getElementById("quoridor-confirm-wall-btn");

  if (wallModeBtn) {
    wallModeBtn.addEventListener("click", () => {
      if (AppStateQuoridor.wallMode) exitQuoridorWallMode();
      else enterQuoridorWallMode();
    });
  }
  if (orientationBtn) {
    orientationBtn.addEventListener("click", toggleQuoridorWallOrientation);
  }
  if (confirmWallBtn) {
    confirmWallBtn.addEventListener("click", confirmQuoridorPendingWall);
  }

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
    AppStateQuoridor.wallMode = false;
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
    AppStateQuoridor.wallMode = false;
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
  if (AppStateQuoridor.wallMode) return; // the tap-catcher overlay handles taps in wall mode
  if (!isHumanTurnQuoridor()) {
    setStatusQuoridor("board-info", "Computer to move.");
    return;
  }
  const moves = QuoridorCore.getLegalMoves(AppStateQuoridor.state, AppStateQuoridor.turn)
    .filter((m) => m.type === "move");
  const match = moves.find((m) => m.to[0] === r && m.to[1] === c);
  if (!match) return;
  applyQuoridorMove(match);
}

// A horizontal and a vertical wall anchored at the same (wr, wc) cross
// at the same intersection point, so both orientations share this one
// center-point formula regardless of which is being asked for.
function wallCenterPct(wr, wc) {
  return {
    x: wc * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT + QUORIDOR_GAP_PCT / 2,
    y: wr * QUORIDOR_STEP_PCT + QUORIDOR_CELL_PCT + QUORIDOR_GAP_PCT / 2
  };
}

// Finds whichever legal wall of the currently selected orientation has
// its center closest to (px, py) (board-relative percentages) and
// previews it - this is what makes the whole board a single forgiving
// tap target instead of 128 tiny, overlapping candidate buttons.
function selectNearestWallAtPoint(px, py) {
  const wallMoves = QuoridorCore.getLegalMoves(AppStateQuoridor.state, AppStateQuoridor.turn)
    .filter((m) => m.type === "wall" && m.orientation === AppStateQuoridor.wallOrientation);

  if (!wallMoves.length) {
    setStatusQuoridor("board-info", AppStateQuoridor.wallOrientation === "h"
      ? "No horizontal wall can be placed right now."
      : "No vertical wall can be placed right now.");
    return;
  }

  let best = null;
  let bestDist = Infinity;
  wallMoves.forEach((m) => {
    const center = wallCenterPct(m.row, m.col);
    const dist = Math.hypot(center.x - px, center.y - py);
    if (dist < bestDist) {
      bestDist = dist;
      best = m;
    }
  });

  AppStateQuoridor.pendingWall = { wr: best.row, wc: best.col, orientation: best.orientation };
  updateQuoridorBoard();
  updateQuoridorWallModeUI();
  setStatusQuoridor("board-info", "Tap ✓ Place to confirm, or tap elsewhere to move it.");
}

function onQuoridorBoardTap(evt) {
  if (!AppStateQuoridor.wallMode || !isHumanTurnQuoridor()) return;
  const boardEl = document.getElementById("quoridor-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const px = ((evt.clientX - rect.left) / rect.width) * 100;
  const py = ((evt.clientY - rect.top) / rect.height) * 100;
  selectNearestWallAtPoint(px, py);
}

function enterQuoridorWallMode() {
  if (!isHumanTurnQuoridor()) {
    setStatusQuoridor("board-info", "Computer to move.");
    return;
  }
  AppStateQuoridor.wallMode = true;
  AppStateQuoridor.pendingWall = null;
  updateQuoridorBoard();
  updateQuoridorWallModeUI();
  setStatusQuoridor("board-info", "Tap anywhere on the board to preview a wall there.");
}

function exitQuoridorWallMode() {
  AppStateQuoridor.wallMode = false;
  AppStateQuoridor.pendingWall = null;
  updateQuoridorBoard();
  updateQuoridorWallModeUI();
  setStatusQuoridor("board-info", sideNameQuoridor(AppStateQuoridor.turn) + " to move.");
}

function toggleQuoridorWallOrientation() {
  AppStateQuoridor.wallOrientation = AppStateQuoridor.wallOrientation === "h" ? "v" : "h";
  const pending = AppStateQuoridor.pendingWall;
  updateQuoridorWallModeUI();
  if (pending) {
    const center = wallCenterPct(pending.wr, pending.wc);
    selectNearestWallAtPoint(center.x, center.y);
  } else {
    updateQuoridorBoard();
  }
}

function confirmQuoridorPendingWall() {
  const pending = AppStateQuoridor.pendingWall;
  if (!pending) return;
  applyQuoridorMove({ type: "wall", orientation: pending.orientation, row: pending.wr, col: pending.wc });
  AppStateQuoridor.wallMode = false;
  updateQuoridorBoard();
  updateQuoridorWallModeUI();
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
  AppStateQuoridor.wallMode = false;
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

  // The 2-cell-long wall bars are drawn as a non-interactive overlay
  // (see renderQuoridorWallBars below). The single interactive layer
  // for walls is the tap-catcher added next: a plain full-board
  // overlay that only becomes clickable while wall mode is active
  // (see onQuoridorBoardTap), turning the entire board into one big,
  // forgiving tap target instead of many small, easily-missed ones.
  const wallLayer = document.createElement("div");
  wallLayer.id = "quoridor-wall-layer";
  wallLayer.className = "quoridor-wall-layer";
  boardEl.appendChild(wallLayer);

  const tapCatcher = document.createElement("div");
  tapCatcher.id = "quoridor-wall-tap-catcher";
  tapCatcher.className = "quoridor-wall-tap-catcher";
  tapCatcher.addEventListener("click", onQuoridorBoardTap);
  boardEl.appendChild(tapCatcher);

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
  const humanCanAct = isHumanTurnQuoridor() && !AppStateQuoridor.wallMode;
  const legalMoves = humanCanAct ? QuoridorCore.getLegalMoves(state, turn).filter((m) => m.type === "move") : [];
  const legalCellKeys = {};
  legalMoves.forEach((m) => {
    legalCellKeys[m.to[0] + "," + m.to[1]] = true;
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

  const tapCatcher = document.getElementById("quoridor-wall-tap-catcher");
  if (tapCatcher) tapCatcher.classList.toggle("active", AppStateQuoridor.wallMode);

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
  updateQuoridorWallModeUI();

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

function updateQuoridorWallModeUI() {
  const wallModeBtn = document.getElementById("quoridor-wall-mode-btn");
  const orientationBtn = document.getElementById("quoridor-orientation-btn");
  const confirmWallBtn = document.getElementById("quoridor-confirm-wall-btn");
  if (!wallModeBtn || !orientationBtn || !confirmWallBtn) return;

  const canAct = isHumanTurnQuoridor();
  const t = window.I18n ? window.I18n.t : (key) => key;
  wallModeBtn.classList.toggle("hidden", AppStateQuoridor.gameOver || (!canAct && !AppStateQuoridor.wallMode));
  wallModeBtn.textContent = AppStateQuoridor.wallMode ? t("quoridor_wall_mode_cancel") : t("quoridor_wall_mode_start");

  orientationBtn.classList.toggle("hidden", !AppStateQuoridor.wallMode);
  orientationBtn.textContent = AppStateQuoridor.wallOrientation === "h" ? t("quoridor_wall_orientation_h") : t("quoridor_wall_orientation_v");

  confirmWallBtn.classList.toggle("hidden", !AppStateQuoridor.wallMode || !AppStateQuoridor.pendingWall);
}

document.addEventListener("DOMContentLoaded", initQuoridorApp);
