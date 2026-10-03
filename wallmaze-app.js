// wallmaze-app.js
// Wires WallMazeCore/WallMazeAi to the wallmaze.html UI. Unlike the
// float-grid boards elsewhere in this app, WallMaze needs clickable
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

const AppStateWallMaze = {
  mode: "offline",        // "offline" | "offline-ai"
  state: WallMazeCore.createInitialState(),
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

const WALLMAZE_SAVE_KEY = "einkchess_save_wallmaze";

function saveWallMazeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(WALLMAZE_SAVE_KEY, {
    mode: AppStateWallMaze.mode,
    state: AppStateWallMaze.state,
    turn: AppStateWallMaze.turn,
    lastMove: AppStateWallMaze.lastMove,
    humanSide: AppStateWallMaze.humanSide,
    aiLevel: AppStateWallMaze.aiLevel,
    moveCount: AppStateWallMaze.moveCount
  });
}

function clearSavedWallMazeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(WALLMAZE_SAVE_KEY);
}

function recordWallMazeStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateWallMaze.mode !== "offline-ai") return;
  GameStats.record("wallmaze", outcome);
}

function sideNameWallMaze(side) {
  return side === "p1" ? "Player 1" : "Player 2";
}

function setStatusWallMaze(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultWallMaze(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleWallMaze(winner) {
  if (AppStateWallMaze.mode === "offline-ai") {
    return winner === AppStateWallMaze.humanSide ? "You win!" : "You lose";
  }
  return sideNameWallMaze(winner) + " wins";
}

function announceGameResultWallMaze(resultCode, message) {
  setGameResultWallMaze(message);
  setStatusWallMaze("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackWallMaze() {
  AppStateWallMaze.undoStack = [];
}

function pushUndoSnapshotWallMaze() {
  AppStateWallMaze.undoStack.push({
    state: WallMazeCore.cloneState(AppStateWallMaze.state),
    turn: AppStateWallMaze.turn,
    gameOver: AppStateWallMaze.gameOver,
    moveCount: AppStateWallMaze.moveCount,
    lastMove: AppStateWallMaze.lastMove
  });
}

function initWallMazeApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("wallmaze-side-choice");
  const levelInline = document.getElementById("wallmaze-level-inline");
  const startGameBtn = document.getElementById("start-wallmaze-game");
  const resignBtn = document.getElementById("resign-button");
  const wallModeBtn = document.getElementById("wallmaze-wall-mode-btn");
  const orientationBtn = document.getElementById("wallmaze-orientation-btn");
  const confirmWallBtn = document.getElementById("wallmaze-confirm-wall-btn");

  if (wallModeBtn) {
    wallModeBtn.addEventListener("click", () => {
      if (AppStateWallMaze.wallMode) exitWallMazeWallMode();
      else enterWallMazeWallMode();
    });
  }
  if (orientationBtn) {
    orientationBtn.addEventListener("click", toggleWallMazeWallOrientation);
  }
  if (confirmWallBtn) {
    confirmWallBtn.addEventListener("click", confirmWallMazePendingWall);
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

  function startNewGame(mode, humanSide, level) {
    AppStateWallMaze.mode = mode;
    AppStateWallMaze.state = WallMazeCore.createInitialState();
    AppStateWallMaze.turn = "p1";
    AppStateWallMaze.lastMove = null;
    AppStateWallMaze.humanSide = humanSide;
    AppStateWallMaze.aiLevel = level;
    AppStateWallMaze.gameOver = false;
    AppStateWallMaze.moveCount = 0;
    AppStateWallMaze.pendingWall = null;
    AppStateWallMaze.wallMode = false;
    resetUndoStackWallMaze();
    setGameResultWallMaze("");
    showBoardSectionWallMaze();
    buildWallMazeBoardDOM();
    updateWallMazeBoard();
    updateGameLabelsWallMaze();

    if (mode === "offline-ai" && humanSide !== "p1") {
      setStatusWallMaze("board-info", "Computer thinking…");
      setTimeout(aiTurnWallMaze, AiPacing.delay(300));
    } else {
      setStatusWallMaze("board-info", sideNameWallMaze(AppStateWallMaze.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateWallMaze.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusWallMaze("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='wallmaze-side']:checked");
    const humanSide = RandomStart.choose(sideInput && sideInput.value === "p2" ? "p2" : "p1", ["p2", "p1"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "p1", 0);
      setStatusWallMaze("offline-wallmaze-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusWallMaze("offline-wallmaze-status",
      RandomStart.label("You play " + sideNameWallMaze(humanSide) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateWallMaze.gameOver) return;
      const loser = AppStateWallMaze.turn;
      const winner = WallMazeCore.otherPlayer(loser);
      AppStateWallMaze.gameOver = true;
      announceGameResultWallMaze(resultTitleWallMaze(winner), sideNameWallMaze(winner) + " wins by resignation.");
      recordWallMazeStatsIfVsAi("loss");
      updateGameLabelsWallMaze();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(WALLMAZE_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateWallMaze.mode = savedGame.mode;
    AppStateWallMaze.state = savedGame.state;
    AppStateWallMaze.turn = savedGame.turn;
    AppStateWallMaze.lastMove = savedGame.lastMove;
    AppStateWallMaze.humanSide = savedGame.humanSide;
    AppStateWallMaze.aiLevel = savedGame.aiLevel;
    AppStateWallMaze.moveCount = savedGame.moveCount;
    AppStateWallMaze.gameOver = false;
    AppStateWallMaze.pendingWall = null;
    AppStateWallMaze.wallMode = false;
    resetUndoStackWallMaze();
    setActiveModeButton(AppStateWallMaze.mode);
    setGameResultWallMaze("");
    showBoardSectionWallMaze();
    buildWallMazeBoardDOM();
    updateWallMazeBoard();
    updateGameLabelsWallMaze();
    if (AppStateWallMaze.mode === "offline-ai" && AppStateWallMaze.turn !== AppStateWallMaze.humanSide) {
      setStatusWallMaze("board-info", "Computer thinking…");
      setTimeout(aiTurnWallMaze, AiPacing.delay(300));
    } else {
      setStatusWallMaze("board-info", sideNameWallMaze(AppStateWallMaze.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function isHumanTurnWallMaze() {
  if (AppStateWallMaze.gameOver) return false;
  if (AppStateWallMaze.mode === "offline-ai" && AppStateWallMaze.turn !== AppStateWallMaze.humanSide) return false;
  return true;
}

function onWallMazeCellClick(r, c) {
  if (AppStateWallMaze.wallMode) return; // the tap-catcher overlay handles taps in wall mode
  if (!isHumanTurnWallMaze()) {
    setStatusWallMaze("board-info", "Computer to move.");
    return;
  }
  const moves = WallMazeCore.getLegalMoves(AppStateWallMaze.state, AppStateWallMaze.turn)
    .filter((m) => m.type === "move");
  const match = moves.find((m) => m.to[0] === r && m.to[1] === c);
  if (!match) return;
  applyWallMazeMove(match);
}

// A horizontal and a vertical wall anchored at the same (wr, wc) cross
// at the same intersection point, so both orientations share this one
// center-point formula regardless of which is being asked for.
function wallCenterPct(wr, wc) {
  return {
    x: wc * WALLMAZE_STEP_PCT + WALLMAZE_CELL_PCT + WALLMAZE_GAP_PCT / 2,
    y: wr * WALLMAZE_STEP_PCT + WALLMAZE_CELL_PCT + WALLMAZE_GAP_PCT / 2
  };
}

// Finds whichever legal wall of the currently selected orientation has
// its center closest to (px, py) (board-relative percentages) and
// previews it - this is what makes the whole board a single forgiving
// tap target instead of 128 tiny, overlapping candidate buttons.
function selectNearestWallAtPoint(px, py) {
  const wallMoves = WallMazeCore.getLegalMoves(AppStateWallMaze.state, AppStateWallMaze.turn)
    .filter((m) => m.type === "wall" && m.orientation === AppStateWallMaze.wallOrientation);

  if (!wallMoves.length) {
    setStatusWallMaze("board-info", AppStateWallMaze.wallOrientation === "h"
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

  AppStateWallMaze.pendingWall = { wr: best.row, wc: best.col, orientation: best.orientation };
  updateWallMazeBoard();
  updateWallMazeWallModeUI();
  setStatusWallMaze("board-info", "Tap ✓ Place to confirm, or tap elsewhere to move it.");
}

function onWallMazeBoardTap(evt) {
  if (!AppStateWallMaze.wallMode || !isHumanTurnWallMaze()) return;
  const boardEl = document.getElementById("wallmaze-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const px = ((evt.clientX - rect.left) / rect.width) * 100;
  const py = ((evt.clientY - rect.top) / rect.height) * 100;
  selectNearestWallAtPoint(px, py);
}

function enterWallMazeWallMode() {
  if (!isHumanTurnWallMaze()) {
    setStatusWallMaze("board-info", "Computer to move.");
    return;
  }
  AppStateWallMaze.wallMode = true;
  AppStateWallMaze.pendingWall = null;
  updateWallMazeBoard();
  updateWallMazeWallModeUI();
  setStatusWallMaze("board-info", "Tap anywhere on the board to preview a wall there.");
}

function exitWallMazeWallMode() {
  AppStateWallMaze.wallMode = false;
  AppStateWallMaze.pendingWall = null;
  updateWallMazeBoard();
  updateWallMazeWallModeUI();
  setStatusWallMaze("board-info", sideNameWallMaze(AppStateWallMaze.turn) + " to move.");
}

function toggleWallMazeWallOrientation() {
  AppStateWallMaze.wallOrientation = AppStateWallMaze.wallOrientation === "h" ? "v" : "h";
  const pending = AppStateWallMaze.pendingWall;
  updateWallMazeWallModeUI();
  if (pending) {
    const center = wallCenterPct(pending.wr, pending.wc);
    selectNearestWallAtPoint(center.x, center.y);
  } else {
    updateWallMazeBoard();
  }
}

function confirmWallMazePendingWall() {
  const pending = AppStateWallMaze.pendingWall;
  if (!pending) return;
  applyWallMazeMove({ type: "wall", orientation: pending.orientation, row: pending.wr, col: pending.wc });
  AppStateWallMaze.wallMode = false;
  updateWallMazeBoard();
  updateWallMazeWallModeUI();
}

function applyWallMazeMove(move) {
  pushUndoSnapshotWallMaze();
  const mover = AppStateWallMaze.turn;
  AppStateWallMaze.state = WallMazeCore.applyMove(AppStateWallMaze.state, mover, move);
  AppStateWallMaze.lastMove = move;
  AppStateWallMaze.pendingWall = null;
  AppStateWallMaze.moveCount++;
  AppStateWallMaze.turn = WallMazeCore.otherPlayer(mover);
  updateWallMazeBoard();
  updateGameLabelsWallMaze();

  if (AppStateWallMaze.state.gameOver) {
    AppStateWallMaze.gameOver = true;
    const winnerName = sideNameWallMaze(AppStateWallMaze.state.winner);
    announceGameResultWallMaze(resultTitleWallMaze(AppStateWallMaze.state.winner), winnerName + " wins by reaching the far side!");
    recordWallMazeStatsIfVsAi(AppStateWallMaze.state.winner === AppStateWallMaze.humanSide ? "win" : "loss");
    updateGameLabelsWallMaze();
    return;
  }

  setStatusWallMaze("board-info", sideNameWallMaze(mover) + " played. " + sideNameWallMaze(AppStateWallMaze.turn) + " to move.");

  if (AppStateWallMaze.mode === "offline-ai" && AppStateWallMaze.turn !== AppStateWallMaze.humanSide) {
    setStatusWallMaze("board-info", "Computer thinking…");
    setTimeout(aiTurnWallMaze, AiPacing.delay(350));
  }
}

function aiTurnWallMaze() {
  if (AppStateWallMaze.mode !== "offline-ai" || AppStateWallMaze.gameOver) return;
  const aiSide = WallMazeCore.otherPlayer(AppStateWallMaze.humanSide);
  if (AppStateWallMaze.turn !== aiSide) return;

  const move = WallMazeAi.chooseMove(AppStateWallMaze.state, aiSide, AppStateWallMaze.aiLevel);
  if (!move) return;
  applyWallMazeMove(move);
}

function undoLastMove() {
  if (!AppStateWallMaze.undoStack || !AppStateWallMaze.undoStack.length) return;
  let prev = AppStateWallMaze.undoStack.pop();
  if (AppStateWallMaze.mode === "offline-ai") {
    while (prev.turn !== AppStateWallMaze.humanSide && AppStateWallMaze.undoStack.length) {
      prev = AppStateWallMaze.undoStack.pop();
    }
  }
  AppStateWallMaze.state = prev.state;
  AppStateWallMaze.turn = prev.turn;
  AppStateWallMaze.gameOver = prev.gameOver;
  AppStateWallMaze.moveCount = prev.moveCount;
  AppStateWallMaze.lastMove = prev.lastMove;
  AppStateWallMaze.pendingWall = null;
  AppStateWallMaze.wallMode = false;
  setGameResultWallMaze("");
  updateWallMazeBoard();
  updateGameLabelsWallMaze();
  setStatusWallMaze("board-info", "Move undone. " + sideNameWallMaze(AppStateWallMaze.turn) + " to move.");
}

function showBoardSectionWallMaze() {
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

/*** Board rendering: percentage-based absolute positioning (same
     technique as Go's board), since wall slots need clickable targets
     between cells, not just on them. ***/

const WALLMAZE_N = 9; // cells per side
const WALLMAZE_GAP_PCT = 1.6;
const WALLMAZE_CELL_PCT = (100 - (WALLMAZE_N - 1) * WALLMAZE_GAP_PCT) / WALLMAZE_N;
const WALLMAZE_STEP_PCT = WALLMAZE_CELL_PCT + WALLMAZE_GAP_PCT;

function buildWallMazeBoardDOM() {
  const boardEl = document.getElementById("wallmaze-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < WALLMAZE_N; r++) {
    for (let c = 0; c < WALLMAZE_N; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "wallmaze-cell";
      cell.style.left = (c * WALLMAZE_STEP_PCT) + "%";
      cell.style.top = (r * WALLMAZE_STEP_PCT) + "%";
      cell.style.width = WALLMAZE_CELL_PCT + "%";
      cell.style.height = WALLMAZE_CELL_PCT + "%";
      cell.dataset.row = r;
      cell.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "wallmaze-piece";
      cell.appendChild(piece);
      cell.addEventListener("click", () => onWallMazeCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  // The 2-cell-long wall bars are drawn as a non-interactive overlay
  // (see renderWallMazeWallBars below). The single interactive layer
  // for walls is the tap-catcher added next: a plain full-board
  // overlay that only becomes clickable while wall mode is active
  // (see onWallMazeBoardTap), turning the entire board into one big,
  // forgiving tap target instead of many small, easily-missed ones.
  const wallLayer = document.createElement("div");
  wallLayer.id = "wallmaze-wall-layer";
  wallLayer.className = "wallmaze-wall-layer";
  boardEl.appendChild(wallLayer);

  const tapCatcher = document.createElement("div");
  tapCatcher.id = "wallmaze-wall-tap-catcher";
  tapCatcher.className = "wallmaze-wall-tap-catcher";
  tapCatcher.addEventListener("click", onWallMazeBoardTap);
  boardEl.appendChild(tapCatcher);

  ensureWallMazeBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureWallMazeBoardSquare);
  } else {
    setTimeout(ensureWallMazeBoardSquare, 0);
  }
  ensureWallMazeResizeHandler();
}

let einkWallMazeResizeHandlerAttached = false;
let einkWallMazeResizeTimeoutId = null;

function ensureWallMazeBoardSquare() {
  const boardEl = document.getElementById("wallmaze-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureWallMazeResizeHandler() {
  if (einkWallMazeResizeHandlerAttached) return;
  einkWallMazeResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkWallMazeResizeTimeoutId !== null) clearTimeout(einkWallMazeResizeTimeoutId);
    einkWallMazeResizeTimeoutId = setTimeout(() => {
      einkWallMazeResizeTimeoutId = null;
      ensureWallMazeBoardSquare();
    }, 150);
  });
}

function updateWallMazeBoard() {
  const boardEl = document.getElementById("wallmaze-board");
  if (!boardEl) return;
  const state = AppStateWallMaze.state;
  const turn = AppStateWallMaze.turn;
  const humanCanAct = isHumanTurnWallMaze() && !AppStateWallMaze.wallMode;
  const legalMoves = humanCanAct ? WallMazeCore.getLegalMoves(state, turn).filter((m) => m.type === "move") : [];
  const legalCellKeys = {};
  legalMoves.forEach((m) => {
    legalCellKeys[m.to[0] + "," + m.to[1]] = true;
  });

  boardEl.querySelectorAll(".wallmaze-cell").forEach((cell) => {
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const pieceEl = cell.querySelector(".wallmaze-piece");
    pieceEl.classList.remove("wallmaze-piece-p1", "wallmaze-piece-p2");
    if (state.pawns.p1[0] === r && state.pawns.p1[1] === c) pieceEl.classList.add("wallmaze-piece-p1");
    if (state.pawns.p2[0] === r && state.pawns.p2[1] === c) pieceEl.classList.add("wallmaze-piece-p2");
    cell.classList.toggle("wallmaze-cell-movable", !!legalCellKeys[r + "," + c]);
    cell.classList.toggle("last-move", !!(AppStateWallMaze.lastMove && AppStateWallMaze.lastMove.type === "move" &&
      AppStateWallMaze.lastMove.to[0] === r && AppStateWallMaze.lastMove.to[1] === c));
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (state.pawns.p1[0] === r && state.pawns.p1[1] === c) label += ", Player 1";
    else if (state.pawns.p2[0] === r && state.pawns.p2[1] === c) label += ", Player 2";
    I18n.setAria(cell, label);
  });

  const tapCatcher = document.getElementById("wallmaze-wall-tap-catcher");
  if (tapCatcher) tapCatcher.classList.toggle("active", AppStateWallMaze.wallMode);

  renderWallMazeWallBars(state);
  updateScoreLineWallMaze();
}

function wallmazeWallBarStyle(orientation, wr, wc) {
  if (orientation === "h") {
    return {
      left: (wc * WALLMAZE_STEP_PCT) + "%",
      top: (wr * WALLMAZE_STEP_PCT + WALLMAZE_CELL_PCT) + "%",
      width: (WALLMAZE_CELL_PCT * 2 + WALLMAZE_GAP_PCT) + "%",
      height: WALLMAZE_GAP_PCT + "%"
    };
  }
  return {
    left: (wc * WALLMAZE_STEP_PCT + WALLMAZE_CELL_PCT) + "%",
    top: (wr * WALLMAZE_STEP_PCT) + "%",
    width: WALLMAZE_GAP_PCT + "%",
    height: (WALLMAZE_CELL_PCT * 2 + WALLMAZE_GAP_PCT) + "%"
  };
}

function renderWallMazeWallBars(state) {
  const layer = document.getElementById("wallmaze-wall-layer");
  if (!layer) return;
  layer.innerHTML = "";

  for (let wr = 0; wr < WallMazeCore.WALL_GRID; wr++) {
    for (let wc = 0; wc < WallMazeCore.WALL_GRID; wc++) {
      if (state.horizontalWalls[wr][wc]) layer.appendChild(makeWallMazeWallBar("h", wr, wc, "wallmaze-wall-bar-placed"));
      if (state.verticalWalls[wr][wc]) layer.appendChild(makeWallMazeWallBar("v", wr, wc, "wallmaze-wall-bar-placed"));
    }
  }

  const pending = AppStateWallMaze.pendingWall;
  if (pending) {
    layer.appendChild(makeWallMazeWallBar(pending.orientation, pending.wr, pending.wc, "wallmaze-wall-bar-preview"));
  }
}

function makeWallMazeWallBar(orientation, wr, wc, extraClass) {
  const bar = document.createElement("div");
  bar.className = "wallmaze-wall-bar " + extraClass;
  const style = wallmazeWallBarStyle(orientation, wr, wc);
  bar.style.left = style.left;
  bar.style.top = style.top;
  bar.style.width = style.width;
  bar.style.height = style.height;
  return bar;
}

function updateScoreLineWallMaze() {
  const container = document.getElementById("score-line");
  const wallsEl = document.getElementById("score-captures");
  if (!container || !wallsEl) return;
  container.classList.remove("hidden");
  I18n.setMsg(wallsEl, "Walls left – Player 1: " + AppStateWallMaze.state.wallsRemaining.p1 +
    " · Player 2: " + AppStateWallMaze.state.wallsRemaining.p2);
}

function updateGameLabelsWallMaze() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateWallMaze.moveCount ? "Move " + AppStateWallMaze.moveCount : "");
  updateUndoButtonVisibilityWallMaze();
  updateResignVisibilityWallMaze();
  updateWallMazeWallModeUI();

  if (AppStateWallMaze.gameOver) clearSavedWallMazeGame();
  else saveWallMazeGame();
}

function updateUndoButtonVisibilityWallMaze() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateWallMaze.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateWallMaze.gameOver));
}

function updateResignVisibilityWallMaze() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateWallMaze.gameOver);
}

function updateWallMazeWallModeUI() {
  const wallModeBtn = document.getElementById("wallmaze-wall-mode-btn");
  const orientationBtn = document.getElementById("wallmaze-orientation-btn");
  const confirmWallBtn = document.getElementById("wallmaze-confirm-wall-btn");
  if (!wallModeBtn || !orientationBtn || !confirmWallBtn) return;

  const canAct = isHumanTurnWallMaze();
  const t = window.I18n ? window.I18n.t : (key) => key;
  wallModeBtn.classList.toggle("hidden", AppStateWallMaze.gameOver || (!canAct && !AppStateWallMaze.wallMode));
  wallModeBtn.textContent = AppStateWallMaze.wallMode ? t("wallmaze_wall_mode_cancel") : t("wallmaze_wall_mode_start");

  orientationBtn.classList.toggle("hidden", !AppStateWallMaze.wallMode);
  orientationBtn.textContent = AppStateWallMaze.wallOrientation === "h" ? t("wallmaze_wall_orientation_h") : t("wallmaze_wall_orientation_v");

  confirmWallBtn.classList.toggle("hidden", !AppStateWallMaze.wallMode || !AppStateWallMaze.pendingWall);
}

document.addEventListener("DOMContentLoaded", initWallMazeApp);
