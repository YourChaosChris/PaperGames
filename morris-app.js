// morris-app.js
// Wires MorrisCore/MorrisAi to the morris.html UI. Nine Men's Morris
// isn't a filled square grid like chess/checkers, so the board is
// rendered the way go-app.js renders its point-and-line grid: a square
// container (JS-enforced height=width, since `aspect-ratio` alone is
// silently ignored on some E-Ink browsers) holding absolutely positioned
// line segments and point buttons, placed with plain top/left/width/
// height percentages rather than the `inset` shorthand (also silently
// ignored on the same browsers).

const AppStateMorris = {
  mode: "offline",        // "offline" | "offline-ai"
  state: MorrisCore.createInitialState(),
  turn: "b",              // "b" | "w" - Black always moves first
  selected: null,         // point index while choosing a move's destination
  pendingRemoval: null,   // { type, from, to, options: [pointIdx,...] } while choosing which piece to remove
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

function colorNameMorris(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusMorris(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultMorris(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultMorris(resultCode, message) {
  setGameResultMorris(message);
  setStatusMorris("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackMorris() {
  AppStateMorris.undoStack = [];
}

function pushUndoSnapshotMorris() {
  AppStateMorris.undoStack.push({
    state: MorrisCore.cloneState(AppStateMorris.state),
    turn: AppStateMorris.turn,
    gameOver: AppStateMorris.gameOver,
    moveCount: AppStateMorris.moveCount
  });
}

// --- Board geometry (UI-only; MorrisCore knows nothing about pixels) ---
// Points sit on a 7x7 coordinate grid (0-6 in both row and col): ring r
// occupies rows/cols [r, 6-r], its 8 points running corner-mid-corner
// clockwise from the top-left, matching MorrisCore's pos numbering.
function morrisPointCoord(ring, pos) {
  const lo = ring, hi = 6 - ring, mid = 3;
  switch (pos) {
    case 0: return { row: lo, col: lo };
    case 1: return { row: lo, col: mid };
    case 2: return { row: lo, col: hi };
    case 3: return { row: mid, col: hi };
    case 4: return { row: hi, col: hi };
    case 5: return { row: hi, col: mid };
    case 6: return { row: hi, col: lo };
    default: return { row: mid, col: lo }; // pos 7
  }
}

function morrisPointCoordByIndex(i) {
  return morrisPointCoord(Math.floor(i / 8), i % 8);
}

function pct(gridUnits) {
  return (gridUnits / 6 * 100) + "%";
}

function initMorrisApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("morris-color-choice");
  const levelInline = document.getElementById("morris-level-inline");
  const startGameBtn = document.getElementById("start-morris-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibilityMorris() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonMorris(mode) {
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

  function startNewGameMorris(mode, humanColor, level) {
    AppStateMorris.mode = mode;
    AppStateMorris.state = MorrisCore.createInitialState();
    AppStateMorris.turn = "b";
    AppStateMorris.selected = null;
    AppStateMorris.pendingRemoval = null;
    AppStateMorris.humanColor = humanColor;
    AppStateMorris.aiLevel = level;
    AppStateMorris.gameOver = false;
    AppStateMorris.moveCount = 0;
    resetUndoStackMorris();
    setGameResultMorris("");
    showBoardSectionMorris();
    buildMorrisBoardDOM();
    updateMorrisBoard();
    updateGameLabelsMorris();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusMorris("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineMorris, 300);
    } else {
      setStatusMorris("board-info", colorNameMorris(AppStateMorris.turn) + " to move: place a piece.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonMorris("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameMorris("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonMorris("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateMorris.aiLevel || 2);
    updateColorChoiceVisibilityMorris();
    setStatusMorris("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityMorris);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='morris-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButtonMorris("offline-ai");
      startNewGameMorris("offline", "b", 0);
      setStatusMorris("offline-morris-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonMorris("offline-ai");
    startNewGameMorris("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusMorris("offline-morris-status",
      "You play " + colorNameMorris(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateMorris.gameOver) return;
      const loser = AppStateMorris.turn;
      const winner = MorrisCore.otherColor(loser);
      AppStateMorris.gameOver = true;
      announceGameResultMorris(colorNameMorris(winner) + " wins", colorNameMorris(winner) + " wins by resignation.");
      updateGameLabelsMorris();
    });
  }

  updateColorChoiceVisibilityMorris();
  // No mode is pre-selected and no game auto-starts: the placeholder
  // shows until the player picks 2-player or configures vs-computer and
  // presses New game, matching chess.html's behavior.
}

// Legal moves that share the same physical action (same from/to for a
// move, or same to for a placement) but differ only in which opposing
// piece gets removed - the set the player picks from when a mill forms.
function findMoveGroup(legalMoves, type, from, to) {
  return legalMoves.filter((m) => m.type === type && m.to === to && (type === "place" || m.from === from));
}

function onMorrisPointClick(pointIdx) {
  if (AppStateMorris.gameOver) {
    setStatusMorris("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateMorris.mode === "offline-ai" && AppStateMorris.turn !== AppStateMorris.humanColor) {
    setStatusMorris("board-info", "Computer to move.");
    return;
  }

  const turn = AppStateMorris.turn;
  const board = AppStateMorris.state.board;

  if (AppStateMorris.pendingRemoval) {
    const { type, from, to, options } = AppStateMorris.pendingRemoval;
    if (!options.includes(pointIdx)) {
      setStatusMorris("board-info", "Choose a highlighted opponent piece to remove.");
      return;
    }
    const group = findMoveGroup(MorrisCore.getLegalMoves(AppStateMorris.state, turn), type, from, to);
    const move = group.find((m) => m.remove === pointIdx);
    AppStateMorris.pendingRemoval = null;
    if (move) applyMorrisMove(move);
    return;
  }

  const phase = MorrisCore.phaseFor(AppStateMorris.state, turn);
  const legalMoves = MorrisCore.getLegalMoves(AppStateMorris.state, turn);

  if (phase === "place") {
    if (board[pointIdx]) return; // occupied, nothing to do
    const group = findMoveGroup(legalMoves, "place", null, pointIdx);
    if (!group.length) return;
    resolveMoveOrAskRemoval(group);
    return;
  }

  // move / fly phase
  if (!AppStateMorris.selected) {
    if (board[pointIdx] !== turn) return;
    AppStateMorris.selected = pointIdx;
    updateMorrisBoard();
    return;
  }

  if (AppStateMorris.selected === pointIdx) {
    AppStateMorris.selected = null;
    updateMorrisBoard();
    return;
  }

  if (board[pointIdx] === turn) {
    AppStateMorris.selected = pointIdx;
    updateMorrisBoard();
    return;
  }

  const group = findMoveGroup(legalMoves, "move", AppStateMorris.selected, pointIdx);
  if (!group.length) {
    setStatusMorris("board-info", "Invalid move.");
    return;
  }
  AppStateMorris.selected = null;
  resolveMoveOrAskRemoval(group);
}

function resolveMoveOrAskRemoval(group) {
  if (group.length === 1) {
    applyMorrisMove(group[0]);
    return;
  }
  const sample = group[0];
  AppStateMorris.pendingRemoval = {
    type: sample.type,
    from: sample.from,
    to: sample.to,
    options: group.map((m) => m.remove)
  };
  updateMorrisBoard();
  setStatusMorris("board-info", colorNameMorris(AppStateMorris.turn) + " formed a mill - choose an opponent piece to remove.");
}

function applyMorrisMove(move) {
  pushUndoSnapshotMorris();
  const mover = AppStateMorris.turn;
  AppStateMorris.state = MorrisCore.applyMove(AppStateMorris.state, mover, move);
  AppStateMorris.moveCount++;
  AppStateMorris.selected = null;
  AppStateMorris.pendingRemoval = null;
  AppStateMorris.turn = MorrisCore.otherColor(mover);
  updateMorrisBoard();
  updateGameLabelsMorris();

  const end = MorrisCore.detectGameEnd(AppStateMorris.state, AppStateMorris.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameMorris(end.winner);
    const reason = end.status === "reduced" ? "reduced to two pieces" : "no legal moves left";
    AppStateMorris.gameOver = true;
    announceGameResultMorris(winnerName + " wins", winnerName + " wins (" + reason + ").");
    updateGameLabelsMorris();
    return;
  }

  const millText = move.remove !== null ? " Mill! A piece was removed." : "";
  setStatusMorris("board-info", colorNameMorris(mover) + " played." + millText + " " + colorNameMorris(AppStateMorris.turn) + " to move.");

  if (AppStateMorris.mode === "offline-ai" && AppStateMorris.turn !== AppStateMorris.humanColor) {
    setStatusMorris("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineMorris, 300);
  }
}

function aiMoveOfflineMorris() {
  if (AppStateMorris.mode !== "offline-ai" || AppStateMorris.gameOver) return;
  const aiColor = MorrisCore.otherColor(AppStateMorris.humanColor);
  if (AppStateMorris.turn !== aiColor) return;

  const move = MorrisAi.chooseMove(AppStateMorris.state, aiColor, AppStateMorris.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  applyMorrisMove(move);
}

function undoLastMove() {
  if (!AppStateMorris.undoStack || !AppStateMorris.undoStack.length) return;
  let prev = AppStateMorris.undoStack.pop();
  if (AppStateMorris.mode === "offline-ai") {
    while (prev.turn !== AppStateMorris.humanColor && AppStateMorris.undoStack.length) {
      prev = AppStateMorris.undoStack.pop();
    }
  }
  AppStateMorris.state = prev.state;
  AppStateMorris.turn = prev.turn;
  AppStateMorris.gameOver = prev.gameOver;
  AppStateMorris.moveCount = prev.moveCount;
  AppStateMorris.selected = null;
  AppStateMorris.pendingRemoval = null;
  setGameResultMorris("");
  updateMorrisBoard();
  updateGameLabelsMorris();
  setStatusMorris("board-info", "Move undone.");
}

function showBoardSectionMorris() {
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

/*** Board rendering (point-and-line grid, mirrors go-app.js's technique) ***/

function buildMorrisBoardDOM() {
  const boardEl = document.getElementById("morris-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const seenEdges = new Set();
  for (let i = 0; i < MorrisCore.TOTAL_POINTS; i++) {
    for (const j of MorrisCore.ADJACENCY[i]) {
      if (j <= i) continue;
      const key = i + "-" + j;
      if (seenEdges.has(key)) continue;
      seenEdges.add(key);
      boardEl.appendChild(buildMorrisLine(morrisPointCoordByIndex(i), morrisPointCoordByIndex(j)));
    }
  }

  for (let i = 0; i < MorrisCore.TOTAL_POINTS; i++) {
    const coord = morrisPointCoordByIndex(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "morris-point";
    point.style.top = pct(coord.row);
    point.style.left = pct(coord.col);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "morris-piece";
    point.appendChild(piece);
    point.addEventListener("click", () => onMorrisPointClick(i));
    boardEl.appendChild(point);
  }

  ensureMorrisBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureMorrisBoardSquare);
  } else {
    setTimeout(ensureMorrisBoardSquare, 0);
  }
  ensureMorrisResizeHandler();
}

function buildMorrisLine(a, b) {
  const line = document.createElement("div");
  if (a.row === b.row) {
    line.className = "morris-line morris-line-h";
    const left = Math.min(a.col, b.col);
    const width = Math.abs(b.col - a.col);
    line.style.top = pct(a.row);
    line.style.left = pct(left);
    line.style.width = pct(width);
  } else {
    line.className = "morris-line morris-line-v";
    const top = Math.min(a.row, b.row);
    const height = Math.abs(b.row - a.row);
    line.style.left = pct(a.col);
    line.style.top = pct(top);
    line.style.height = pct(height);
  }
  return line;
}

let einkMorrisResizeHandlerAttached = false;
let einkMorrisResizeTimeoutId = null;

function ensureMorrisBoardSquare() {
  const boardEl = document.getElementById("morris-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureMorrisResizeHandler() {
  if (einkMorrisResizeHandlerAttached) return;
  einkMorrisResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkMorrisResizeTimeoutId !== null) clearTimeout(einkMorrisResizeTimeoutId);
    einkMorrisResizeTimeoutId = setTimeout(() => {
      einkMorrisResizeTimeoutId = null;
      ensureMorrisBoardSquare();
    }, 150);
  });
}

function updateMorrisBoard() {
  const boardEl = document.getElementById("morris-board");
  if (!boardEl) return;

  const turn = AppStateMorris.turn;
  const board = AppStateMorris.state.board;
  const legalMoves = AppStateMorris.gameOver ? [] : MorrisCore.getLegalMoves(AppStateMorris.state, turn);
  const phase = AppStateMorris.gameOver ? null : MorrisCore.phaseFor(AppStateMorris.state, turn);

  let movableSources = new Set();
  let destinations = new Set();
  if (AppStateMorris.pendingRemoval) {
    // handled via removalTargets below
  } else if (phase === "move" || phase === "fly") {
    if (AppStateMorris.selected === null) {
      movableSources = new Set(legalMoves.map((m) => m.from));
    } else {
      destinations = new Set(legalMoves.filter((m) => m.from === AppStateMorris.selected).map((m) => m.to));
    }
  }
  const removalTargets = AppStateMorris.pendingRemoval ? new Set(AppStateMorris.pendingRemoval.options) : new Set();

  boardEl.querySelectorAll(".morris-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".morris-piece");
    if (pieceEl) {
      pieceEl.classList.remove("morris-piece-black", "morris-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "morris-piece-black" : "morris-piece-white");
    }
    pt.classList.toggle("morris-point-selected", AppStateMorris.selected === i);
    pt.classList.toggle("morris-point-movable", movableSources.has(i) || destinations.has(i) || (phase === "place" && !piece && legalMoves.some((m) => m.type === "place" && m.to === i)));
    pt.classList.toggle("morris-point-removable", removalTargets.has(i));
  });
}

function updateGameLabelsMorris() {
  const meta = document.getElementById("game-meta");
  if (meta) {
    const state = AppStateMorris.state;
    const inHand = state.toPlace.b + state.toPlace.w;
    meta.textContent = inHand > 0
      ? "Placing - " + inHand + " piece" + (inHand === 1 ? "" : "s") + " left to place"
      : (AppStateMorris.moveCount ? "Move " + AppStateMorris.moveCount : "");
  }
  updateUndoButtonVisibilityMorris();
  updateResignVisibilityMorris();
}

function updateUndoButtonVisibilityMorris() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateMorris.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateMorris.gameOver));
}

function updateResignVisibilityMorris() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateMorris.gameOver);
}

document.addEventListener("DOMContentLoaded", initMorrisApp);
