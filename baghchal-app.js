// baghchal-app.js
// Wires BaghChalCore/BaghChalAi to the baghchal.html UI. Like Fanorona,
// Bagh-Chal isn't played on a plain rectangular grid of squares - it's
// played on a 5x5 lattice of POINTS joined by lines (some diagonal), so
// it's rendered the same way fanorona-app.js renders its board:
// percentage-based absolute-positioned point buttons over a single
// non-interactive SVG line layer, with the board's own height enforced
// in JS on load and on resize (no CSS `aspect-ratio`, which some E-Ink
// browsers silently ignore).
//
// Interaction has two distinct shapes depending on the phase:
//  - Placement phase (goat's turn, before all 20 goats are down): tap
//    any empty point to place a goat there. Tigers already on the board
//    move/capture normally on their own turns throughout.
//  - Movement phase (or any tiger turn, any time): tap your own piece
//    to select it, then tap a highlighted destination - a plain
//    click-piece-then-click-destination flow, the same as every other
//    point-and-line board game here. A highlighted destination for a
//    selected tiger may be a capture (the jump target) or a quiet move;
//    both are shown together since capturing is optional in this
//    ruleset (see baghchal-core.js's header for why).

const AppStateBaghChal = {
  mode: "offline",        // "offline" | "offline-ai"
  state: BaghChalCore.createInitialState(),
  selected: null,         // point index while a piece is selected
  legalTargets: {},       // "to index" -> move, for the current selection
  lastMove: null,         // { from, to } | { to } for placements
  humanSide: "goat",      // "tiger" | "goat"
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const BAGHCHAL_SAVE_KEY = "einkchess_save_baghchal";

function saveBaghChalGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(BAGHCHAL_SAVE_KEY, {
    mode: AppStateBaghChal.mode,
    state: AppStateBaghChal.state,
    lastMove: AppStateBaghChal.lastMove,
    humanSide: AppStateBaghChal.humanSide,
    aiLevel: AppStateBaghChal.aiLevel,
    moveCount: AppStateBaghChal.moveCount
  });
}

function clearSavedBaghChalGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(BAGHCHAL_SAVE_KEY);
}

function recordBaghChalStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateBaghChal.mode !== "offline-ai") return;
  GameStats.record("baghchal", outcome);
}

function sideNameBaghChal(side) {
  return side === "tiger" ? "Tigers" : "Goats";
}

function setStatusBaghChal(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultBaghChal(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleBaghChal(winner) {
  if (AppStateBaghChal.mode === "offline-ai") {
    return winner === AppStateBaghChal.humanSide ? "You win!" : "You lose";
  }
  return sideNameBaghChal(winner) + " win";
}

function announceGameResultBaghChal(resultCode, message) {
  setGameResultBaghChal(message);
  setStatusBaghChal("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackBaghChal() {
  AppStateBaghChal.undoStack = [];
}

function pushUndoSnapshotBaghChal() {
  AppStateBaghChal.undoStack.push({
    state: BaghChalCore.cloneState(AppStateBaghChal.state),
    gameOver: AppStateBaghChal.gameOver,
    moveCount: AppStateBaghChal.moveCount,
    lastMove: AppStateBaghChal.lastMove
  });
}

function initBaghChalApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("baghchal-side-choice");
  const levelInline = document.getElementById("baghchal-level-inline");
  const startGameBtn = document.getElementById("start-baghchal-game");
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
    AppStateBaghChal.mode = mode;
    AppStateBaghChal.state = BaghChalCore.createInitialState();
    AppStateBaghChal.selected = null;
    AppStateBaghChal.legalTargets = {};
    AppStateBaghChal.lastMove = null;
    AppStateBaghChal.humanSide = humanSide;
    AppStateBaghChal.aiLevel = level;
    AppStateBaghChal.gameOver = false;
    AppStateBaghChal.moveCount = 0;
    resetUndoStackBaghChal();
    setGameResultBaghChal("");
    showBoardSectionBaghChal();
    buildBaghChalBoardDOM();
    updateBaghChalBoard();
    updateGameLabelsBaghChal();

    const turn = AppStateBaghChal.state.currentPlayer;
    if (mode === "offline-ai" && humanSide !== turn) {
      setStatusBaghChal("board-info", "Computer thinking…");
      setTimeout(aiTurnBaghChal, 300);
    } else {
      setStatusBaghChal("board-info", sideNameBaghChal(turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "goat", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateBaghChal.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusBaghChal("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='baghchal-side']:checked");
    const humanSide = sideInput && sideInput.value === "tiger" ? "tiger" : "goat";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "goat", 0);
      setStatusBaghChal("offline-baghchal-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusBaghChal("offline-baghchal-status",
      "You play " + sideNameBaghChal(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateBaghChal.gameOver) return;
      const loser = AppStateBaghChal.state.currentPlayer;
      const winner = BaghChalCore.otherPlayer(loser);
      AppStateBaghChal.gameOver = true;
      announceGameResultBaghChal(resultTitleBaghChal(winner), sideNameBaghChal(winner) + " win by resignation.");
      recordBaghChalStatsIfVsAi("loss");
      updateGameLabelsBaghChal();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(BAGHCHAL_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateBaghChal.mode = savedGame.mode;
    AppStateBaghChal.state = savedGame.state;
    AppStateBaghChal.selected = null;
    AppStateBaghChal.legalTargets = {};
    AppStateBaghChal.lastMove = savedGame.lastMove;
    AppStateBaghChal.humanSide = savedGame.humanSide;
    AppStateBaghChal.aiLevel = savedGame.aiLevel;
    AppStateBaghChal.moveCount = savedGame.moveCount;
    AppStateBaghChal.gameOver = false;
    resetUndoStackBaghChal();
    setActiveModeButton(AppStateBaghChal.mode);
    setGameResultBaghChal("");
    showBoardSectionBaghChal();
    buildBaghChalBoardDOM();
    updateBaghChalBoard();
    updateGameLabelsBaghChal();
    const turn = AppStateBaghChal.state.currentPlayer;
    if (AppStateBaghChal.mode === "offline-ai" && turn !== AppStateBaghChal.humanSide) {
      setStatusBaghChal("board-info", "Computer thinking…");
      setTimeout(aiTurnBaghChal, 300);
    } else {
      setStatusBaghChal("board-info", sideNameBaghChal(turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching every other game here.
}

function computeLegalTargetsBaghChal(from) {
  const targets = {};
  BaghChalCore.getLegalMoves(AppStateBaghChal.state, AppStateBaghChal.state.currentPlayer)
    .filter((m) => m.type !== "place" && m.from === from)
    .forEach((m) => { targets[m.to] = m; });
  return targets;
}

function isHumanTurnBaghChal() {
  if (AppStateBaghChal.gameOver) return false;
  if (AppStateBaghChal.mode === "offline-ai" && AppStateBaghChal.state.currentPlayer !== AppStateBaghChal.humanSide) return false;
  return true;
}

function onBaghChalPointClick(i) {
  if (AppStateBaghChal.gameOver) {
    setStatusBaghChal("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnBaghChal()) {
    setStatusBaghChal("board-info", "Computer to move.");
    return;
  }

  const state = AppStateBaghChal.state;
  const turn = state.currentPlayer;
  const board = state.board;

  // Placement phase, goat's turn: a tap on any empty point places a goat.
  if (turn === "goat" && state.phase === "placement") {
    if (board[i] !== null) {
      setStatusBaghChal("board-info", "That point is occupied.");
      return;
    }
    applyBaghChalMove({ type: "place", to: i });
    return;
  }

  // Movement/capture: click own piece, then click a highlighted target.
  if (AppStateBaghChal.selected !== null && AppStateBaghChal.legalTargets[i]) {
    applyBaghChalMove(AppStateBaghChal.legalTargets[i]);
    return;
  }

  if (board[i] === turn) {
    AppStateBaghChal.selected = i;
    AppStateBaghChal.legalTargets = computeLegalTargetsBaghChal(i);
    updateBaghChalBoard();
    setStatusBaghChal("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateBaghChal.selected !== null) {
    AppStateBaghChal.selected = null;
    AppStateBaghChal.legalTargets = {};
    updateBaghChalBoard();
    setStatusBaghChal("board-info", sideNameBaghChal(turn) + " to move.");
  }
}

function applyBaghChalMove(move) {
  pushUndoSnapshotBaghChal();
  const mover = AppStateBaghChal.state.currentPlayer;
  const captured = move.type === "capture";
  AppStateBaghChal.state = BaghChalCore.applyMove(AppStateBaghChal.state, mover, move);
  AppStateBaghChal.lastMove = move.type === "place" ? { to: move.to } : { from: move.from, to: move.to };
  AppStateBaghChal.moveCount++;
  AppStateBaghChal.selected = null;
  AppStateBaghChal.legalTargets = {};
  updateBaghChalBoard();
  updateGameLabelsBaghChal();

  if (AppStateBaghChal.state.gameOver) {
    AppStateBaghChal.gameOver = true;
    const winnerName = sideNameBaghChal(AppStateBaghChal.state.winner);
    const reasons = {
      captures: " by capturing 5 goats!",
      trapped: " by trapping every tiger!",
      "no-moves": " - the other side has no legal move!"
    };
    const reason = reasons[AppStateBaghChal.state.winReason] || ".";
    announceGameResultBaghChal(resultTitleBaghChal(AppStateBaghChal.state.winner), winnerName + " win" + reason);
    recordBaghChalStatsIfVsAi(AppStateBaghChal.state.winner === AppStateBaghChal.humanSide ? "win" : "loss");
    updateGameLabelsBaghChal();
    return;
  }

  const nextTurn = AppStateBaghChal.state.currentPlayer;
  const capturedNote = captured ? " A goat was captured!" : "";
  setStatusBaghChal("board-info", sideNameBaghChal(mover) + " played." + capturedNote + " " + sideNameBaghChal(nextTurn) + " to move.");

  if (AppStateBaghChal.mode === "offline-ai" && nextTurn !== AppStateBaghChal.humanSide) {
    setStatusBaghChal("board-info", "Computer thinking…");
    setTimeout(aiTurnBaghChal, 350);
  }
}

function aiTurnBaghChal() {
  if (AppStateBaghChal.mode !== "offline-ai" || AppStateBaghChal.gameOver) return;
  const aiSide = BaghChalCore.otherPlayer(AppStateBaghChal.humanSide);
  if (AppStateBaghChal.state.currentPlayer !== aiSide) return;

  const move = BaghChalAi.chooseMove(AppStateBaghChal.state, aiSide, AppStateBaghChal.aiLevel);
  if (!move) return; // the previous move's no-legal-move check already caught a loss here
  applyBaghChalMove(move);
}

function undoLastMove() {
  if (!AppStateBaghChal.undoStack || !AppStateBaghChal.undoStack.length) return;
  let prev = AppStateBaghChal.undoStack.pop();
  if (AppStateBaghChal.mode === "offline-ai") {
    while (prev.state.currentPlayer !== AppStateBaghChal.humanSide && AppStateBaghChal.undoStack.length) {
      prev = AppStateBaghChal.undoStack.pop();
    }
  }
  AppStateBaghChal.state = prev.state;
  AppStateBaghChal.gameOver = prev.gameOver;
  AppStateBaghChal.moveCount = prev.moveCount;
  AppStateBaghChal.lastMove = prev.lastMove;
  AppStateBaghChal.selected = null;
  AppStateBaghChal.legalTargets = {};
  setGameResultBaghChal("");
  updateBaghChalBoard();
  updateGameLabelsBaghChal();
  setStatusBaghChal("board-info", "Move undone. " + sideNameBaghChal(AppStateBaghChal.state.currentPlayer) + " to move.");
}

function showBoardSectionBaghChal() {
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

/*** Board geometry and rendering ***
 * Percentage-based absolute positioning, the same technique fanorona-app.js
 * uses: points sit on a UNIT-spaced grid with a PAD margin on every side.
 * Bagh-Chal's board is square (5x5), so width and height use the same
 * total, but the board's own pixel height is still JS-enforced on load
 * and resize rather than via CSS `aspect-ratio` (unsupported on the
 * Tolino's Chrome 61 WebView).
 */
const BAGHCHAL_UNIT = 100;
const BAGHCHAL_PAD = 55;
const BAGHCHAL_TOTAL = (BaghChalCore.COLS - 1) * BAGHCHAL_UNIT + BAGHCHAL_PAD * 2;
const BAGHCHAL_POINT_SIZE = 62;

function baghchalPointX(c) {
  return BAGHCHAL_PAD + c * BAGHCHAL_UNIT;
}
function baghchalPointY(r) {
  return BAGHCHAL_PAD + r * BAGHCHAL_UNIT;
}
function baghchalPct(value) {
  return (value / BAGHCHAL_TOTAL * 100) + "%";
}

const SVG_NS = "http://www.w3.org/2000/svg";

function buildBaghChalBoardDOM() {
  const boardEl = document.getElementById("baghchal-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "baghchal-lines");
  svg.setAttribute("viewBox", "0 0 " + BAGHCHAL_TOTAL + " " + BAGHCHAL_TOTAL);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const seenEdges = new Set();
  for (let i = 0; i < BaghChalCore.TOTAL_POINTS; i++) {
    BaghChalCore.NEIGHBORS[i].forEach(({ to }) => {
      if (to <= i) return;
      const key = i + "-" + to;
      if (seenEdges.has(key)) return;
      seenEdges.add(key);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", baghchalPointX(BaghChalCore.colOf(i)));
      line.setAttribute("y1", baghchalPointY(BaghChalCore.rowOf(i)));
      line.setAttribute("x2", baghchalPointX(BaghChalCore.colOf(to)));
      line.setAttribute("y2", baghchalPointY(BaghChalCore.rowOf(to)));
      svg.appendChild(line);
    });
  }
  boardEl.appendChild(svg);

  for (let i = 0; i < BaghChalCore.TOTAL_POINTS; i++) {
    const r = BaghChalCore.rowOf(i), c = BaghChalCore.colOf(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "baghchal-point";
    point.style.left = baghchalPct(baghchalPointX(c));
    point.style.top = baghchalPct(baghchalPointY(r));
    point.style.width = baghchalPct(BAGHCHAL_POINT_SIZE);
    point.style.height = baghchalPct(BAGHCHAL_POINT_SIZE);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "baghchal-piece";
    point.appendChild(piece);
    point.addEventListener("click", () => onBaghChalPointClick(i));
    boardEl.appendChild(point);
  }

  ensureBaghChalBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureBaghChalBoardAspect);
  } else {
    setTimeout(ensureBaghChalBoardAspect, 0);
  }
  ensureBaghChalResizeHandler();
}

let einkBaghChalResizeHandlerAttached = false;
let einkBaghChalResizeTimeoutId = null;

function ensureBaghChalBoardAspect() {
  const boardEl = document.getElementById("baghchal-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px"; // the board is square
}

function ensureBaghChalResizeHandler() {
  if (einkBaghChalResizeHandlerAttached) return;
  einkBaghChalResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkBaghChalResizeTimeoutId !== null) clearTimeout(einkBaghChalResizeTimeoutId);
    einkBaghChalResizeTimeoutId = setTimeout(() => {
      einkBaghChalResizeTimeoutId = null;
      ensureBaghChalBoardAspect();
    }, 150);
  });
}

function updateBaghChalBoard() {
  const boardEl = document.getElementById("baghchal-board");
  if (!boardEl) return;

  const state = AppStateBaghChal.state;
  const board = state.board;
  const turn = state.currentPlayer;

  let placementHighlight = false;
  if (isHumanTurnBaghChal() && AppStateBaghChal.selected === null && turn === "goat" && state.phase === "placement") {
    placementHighlight = true;
  }
  let selectableSet = null;
  if (isHumanTurnBaghChal() && AppStateBaghChal.selected === null && !placementHighlight) {
    selectableSet = new Set();
    BaghChalCore.getLegalMoves(state, turn).forEach((m) => { if (m.from !== undefined) selectableSet.add(m.from); });
  }

  boardEl.querySelectorAll(".baghchal-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".baghchal-piece");
    if (pieceEl) {
      pieceEl.classList.remove("baghchal-piece-tiger", "baghchal-piece-goat");
      if (piece) pieceEl.classList.add(piece === "tiger" ? "baghchal-piece-tiger" : "baghchal-piece-goat");
    }

    const isSelected = AppStateBaghChal.selected === i;
    const isTarget = !!AppStateBaghChal.legalTargets[i];
    const isCaptureTarget = isTarget && AppStateBaghChal.legalTargets[i].type === "capture";
    const isPlacementSpot = placementHighlight && piece === null;
    pt.classList.toggle("baghchal-point-selected", isSelected);
    pt.classList.toggle("baghchal-point-movable", isTarget || isPlacementSpot);
    pt.classList.toggle("baghchal-point-capture", isCaptureTarget);
    pt.classList.toggle("baghchal-point-selectable", !!(selectableSet && selectableSet.has(i)));
    pt.classList.toggle("last-move", !!(AppStateBaghChal.lastMove &&
      ((AppStateBaghChal.lastMove.from === i) || AppStateBaghChal.lastMove.to === i)));

    const r = BaghChalCore.rowOf(i), c = BaghChalCore.colOf(i);
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece === "tiger" ? "Tiger" : "Goat");
    } else {
      label += ", empty";
    }
    if (isSelected) label += ", selected";
    else if (isCaptureTarget) label += ", capture here";
    else if (isTarget || isPlacementSpot) label += ", movable";
    pt.setAttribute("aria-label", label);
  });

  ensureBaghChalBoardAspect();
  updateScoreLineBaghChal();
}

function updateScoreLineBaghChal() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const state = AppStateBaghChal.state;
  container.classList.remove("hidden");
  if (state.phase === "placement") {
    capturesEl.textContent = "Goats placed: " + state.placedGoats + "/" + BaghChalCore.TOTAL_GOATS +
      " · Captured: " + state.capturedGoats + "/" + BaghChalCore.CAPTURE_TARGET;
  } else {
    capturesEl.textContent = "Movement phase · Captured: " + state.capturedGoats + "/" + BaghChalCore.CAPTURE_TARGET;
  }
}

function updateGameLabelsBaghChal() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateBaghChal.moveCount ? "Move " + AppStateBaghChal.moveCount : "";
  updateUndoButtonVisibilityBaghChal();
  updateResignVisibilityBaghChal();

  if (AppStateBaghChal.gameOver) clearSavedBaghChalGame();
  else saveBaghChalGame();
}

function updateUndoButtonVisibilityBaghChal() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateBaghChal.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateBaghChal.gameOver));
}

function updateResignVisibilityBaghChal() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateBaghChal.gameOver);
}

document.addEventListener("DOMContentLoaded", initBaghChalApp);
