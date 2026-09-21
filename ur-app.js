// ur-app.js
// Wires UrCore/UrAi to the ur.html UI. The board is a 3x8 float-grid
// (mirrors checkers-app.js's per-square approach, proven safe on a real
// E-Ink browser that silently ignores `aspect-ratio` and the `inset`
// shorthand) with four square positions left as visual gaps to form the
// traditional H-shaped Ur board. Off-board ("start") and finished
// ("home") pieces have no board square of their own, so they're shown as
// simple counters in a tray above/below the board instead.
//
// Turn flow: the current player presses "Roll dice", then either clicks
// one of their highlighted movable pieces (or the highlighted "start"
// tray slot, to bring a new piece onto the board) or, if the roll leaves
// no legal move, the turn auto-passes after a short delay. Landing on a
// rosette keeps the turn with the same player instead of switching it.

const UR_ROW_FOR_COLOR = { b: 0, w: 2 };
const UR_COLOR_FOR_ROW = { 0: "b", 2: "w" };

const AppStateUr = {
  mode: "offline",        // "offline" | "offline-ai"
  state: UrCore.createInitialState(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  roll: null,             // null until rolled this turn, then 0-4
  legalMoves: [],
  moveCount: 0,
  undoStack: []
};

const UR_SAVE_KEY = "einkchess_save_ur";

function saveUrGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(UR_SAVE_KEY, {
    mode: AppStateUr.mode,
    state: AppStateUr.state,
    turn: AppStateUr.turn,
    roll: AppStateUr.roll,
    humanColor: AppStateUr.humanColor,
    aiLevel: AppStateUr.aiLevel,
    moveCount: AppStateUr.moveCount
  });
}

function clearSavedUrGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(UR_SAVE_KEY);
}

function recordUrStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateUr.mode !== "offline-ai") return;
  GameStats.record("ur", outcome);
}

function colorNameUr(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusUr(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultUr(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultUr(resultCode, message) {
  setGameResultUr(message);
  setStatusUr("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackUr() {
  AppStateUr.undoStack = [];
}

function pushUndoSnapshotUr() {
  AppStateUr.undoStack.push({
    state: UrCore.cloneState(AppStateUr.state),
    turn: AppStateUr.turn,
    gameOver: AppStateUr.gameOver,
    moveCount: AppStateUr.moveCount
  });
}

// Physical square <-> path position mapping. Row 1 (the middle row) is
// the shared lane both players travel through; rows 0 and 2 are each
// player's own private squares, with a two-square gap in the middle
// where the shared lane passes beneath them.
//
// Column direction is chosen so a piece never visually "teleports"
// between lanes: it enters the board at column 3 (the inner edge of its
// private lane, next to the gap) and travels OUTWARD to column 0 (square
// 4, a rosette, at the board's true outer edge); from there it drops
// straight down into the shared lane at that same column 0 and sweeps
// all the way across to column 7; it then rises straight up into its
// private end lane at that same column 7 (square 13), and finally moves
// back inward to column 6 (square 14, a rosette) before bearing off. So
// every lane change happens in the same column, and every square is
// adjacent to the one before it along the path - the classic S-shaped
// route across the board.
function urSquareInfo(row, col) {
  if (row === 1) {
    return { pos: col + 5, owner: null };
  }
  if (row === 0 || row === 2) {
    const owner = UR_COLOR_FOR_ROW[row];
    if (col >= 0 && col <= 3) return { pos: 4 - col, owner };
    if (col >= 6 && col <= 7) return { pos: 20 - col, owner };
  }
  return null; // gap square, purely visual
}

function initUrApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("ur-color-choice");
  const levelInline = document.getElementById("ur-level-inline");
  const startGameBtn = document.getElementById("start-ur-game");
  const resignBtn = document.getElementById("resign-button");
  const rollBtn = document.getElementById("ur-roll-button");
  const trayTopStart = document.getElementById("ur-tray-top-start");
  const trayBottomStart = document.getElementById("ur-tray-bottom-start");

  function updateColorChoiceVisibilityUr() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonUr(mode) {
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

  function startNewGameUr(mode, humanColor, level) {
    AppStateUr.mode = mode;
    AppStateUr.state = UrCore.createInitialState();
    AppStateUr.turn = "b";
    AppStateUr.humanColor = humanColor;
    AppStateUr.aiLevel = level;
    AppStateUr.gameOver = false;
    AppStateUr.roll = null;
    AppStateUr.legalMoves = [];
    AppStateUr.moveCount = 0;
    resetUndoStackUr();
    setGameResultUr("");
    showBoardSectionUr();
    buildUrBoardDOM();
    updateUrBoard();
    updateGameLabelsUr();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusUr("board-info", "Computer thinking…");
      setTimeout(aiTurnUr, 300);
    } else {
      setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " to move. Roll the dice.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonUr("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameUr("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonUr("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateUr.aiLevel || 2);
    updateColorChoiceVisibilityUr();
    setStatusUr("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityUr);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='ur-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButtonUr("offline-ai");
      startNewGameUr("offline", "b", 0);
      setStatusUr("offline-ur-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonUr("offline-ai");
    startNewGameUr("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusUr("offline-ur-status",
      "You play " + colorNameUr(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateUr.gameOver) return;
      const loser = AppStateUr.turn;
      const winner = UrCore.otherColor(loser);
      AppStateUr.gameOver = true;
      announceGameResultUr(colorNameUr(winner) + " wins", colorNameUr(winner) + " wins by resignation.");
      recordUrStatsIfVsAi("loss");
      updateGameLabelsUr();
    });
  }

  if (rollBtn) {
    rollBtn.addEventListener("click", rollDiceUr);
  }

  if (trayTopStart) trayTopStart.addEventListener("click", () => onUrTrayClick("b"));
  if (trayBottomStart) trayBottomStart.addEventListener("click", () => onUrTrayClick("w"));

  updateColorChoiceVisibilityUr();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(UR_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateUr.mode = savedGame.mode;
    AppStateUr.state = savedGame.state;
    AppStateUr.turn = savedGame.turn;
    AppStateUr.roll = savedGame.roll;
    AppStateUr.legalMoves = savedGame.roll !== null
      ? UrCore.getLegalMoves(AppStateUr.state, AppStateUr.turn, savedGame.roll)
      : [];
    AppStateUr.humanColor = savedGame.humanColor;
    AppStateUr.aiLevel = savedGame.aiLevel;
    AppStateUr.moveCount = savedGame.moveCount;
    AppStateUr.gameOver = false;
    resetUndoStackUr();
    setActiveModeButtonUr(AppStateUr.mode);
    setGameResultUr("");
    showBoardSectionUr();
    buildUrBoardDOM();
    updateDiceDisplayUr(AppStateUr.roll);
    updateUrBoard();
    updateGameLabelsUr();
    if (AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor) {
      setStatusUr("board-info", "Computer thinking…");
      setTimeout(aiTurnUr, 300);
    } else if (AppStateUr.roll !== null) {
      setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " rolled " + AppStateUr.roll + ". Choose a piece to move.");
    } else {
      setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " to move. Roll the dice.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function rollDiceUr() {
  if (AppStateUr.gameOver) return;
  if (AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor) return;
  if (AppStateUr.roll !== null) return; // already rolled, must move (or wait for auto-pass) first

  const roll = UrCore.rollDice();
  AppStateUr.roll = roll;
  AppStateUr.legalMoves = UrCore.getLegalMoves(AppStateUr.state, AppStateUr.turn, roll);
  updateDiceDisplayUr(roll);
  updateUrBoard();
  updateGameLabelsUr();

  if (!AppStateUr.legalMoves.length) {
    setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " rolled " + roll + ". No legal move - turn passes.");
    setTimeout(passTurnUr, 700);
    return;
  }

  setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " rolled " + roll + ". Choose a piece to move.");
}

function passTurnUr() {
  AppStateUr.roll = null;
  AppStateUr.legalMoves = [];
  AppStateUr.turn = UrCore.otherColor(AppStateUr.turn);
  updateDiceDisplayUr(null);
  updateUrBoard();
  updateGameLabelsUr();
  maybeTriggerAiTurnUr();
  if (!(AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor)) {
    setStatusUr("board-info", colorNameUr(AppStateUr.turn) + " to move. Roll the dice.");
  }
}

function maybeTriggerAiTurnUr() {
  if (AppStateUr.gameOver) return;
  if (AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor) {
    setTimeout(aiTurnUr, 400);
  }
}

function onUrSquareClick(e) {
  const pos = parseInt(e.currentTarget.dataset.pos, 10);
  attemptUrMoveFrom(pos);
}

function onUrTrayClick(color) {
  if (color !== AppStateUr.turn) return;
  attemptUrMoveFrom(0);
}

function attemptUrMoveFrom(fromPos) {
  if (AppStateUr.gameOver) {
    setStatusUr("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor) {
    setStatusUr("board-info", "Computer to move.");
    return;
  }
  if (AppStateUr.roll === null) {
    setStatusUr("board-info", "Roll the dice first.");
    return;
  }
  const move = AppStateUr.legalMoves.find((m) => m.from === fromPos);
  if (!move) return; // not a legal source for this roll - silently ignore the click

  applyUrMove(move);
}

function applyUrMove(move) {
  pushUndoSnapshotUr();
  const mover = AppStateUr.turn;
  AppStateUr.state = UrCore.applyMove(AppStateUr.state, mover, move);
  AppStateUr.moveCount++;
  AppStateUr.roll = null;
  AppStateUr.legalMoves = [];
  updateDiceDisplayUr(null);
  updateUrBoard();
  updateGameLabelsUr();

  if (UrCore.hasWon(AppStateUr.state, mover)) {
    AppStateUr.gameOver = true;
    const winnerName = colorNameUr(mover);
    announceGameResultUr(winnerName + " wins", winnerName + " wins - all pieces home!");
    recordUrStatsIfVsAi(mover === AppStateUr.humanColor ? "win" : "loss");
    updateGameLabelsUr();
    return;
  }

  if (move.rosette) {
    setStatusUr("board-info", colorNameUr(mover) + " landed on a rosette - roll again!");
    maybeTriggerAiTurnUr();
    return;
  }

  AppStateUr.turn = UrCore.otherColor(mover);
  updateUrBoard();
  updateGameLabelsUr();
  maybeTriggerAiTurnUr();
  if (!(AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor)) {
    setStatusUr("board-info", colorNameUr(mover) + " played. " + colorNameUr(AppStateUr.turn) + " to move.");
  }
}

function aiTurnUr() {
  if (AppStateUr.mode !== "offline-ai" || AppStateUr.gameOver) return;
  const aiColor = UrCore.otherColor(AppStateUr.humanColor);
  if (AppStateUr.turn !== aiColor) return;

  const roll = UrCore.rollDice();
  updateDiceDisplayUr(roll);
  const legalMoves = UrCore.getLegalMoves(AppStateUr.state, aiColor, roll);
  setStatusUr("board-info", "Computer rolled " + roll + ".");

  if (!legalMoves.length) {
    setStatusUr("board-info", "Computer rolled " + roll + ". No legal move - turn passes.");
    setTimeout(passTurnUr, 700);
    return;
  }

  setStatusUr("board-info", "Computer rolled " + roll + ", thinking…");
  setTimeout(() => {
    const move = UrAi.chooseMove(AppStateUr.state, aiColor, roll, AppStateUr.aiLevel);
    if (!move) return;
    applyUrMove(move);
  }, 350);
}

function undoLastMove() {
  if (!AppStateUr.undoStack || !AppStateUr.undoStack.length) return;
  let prev = AppStateUr.undoStack.pop();
  if (AppStateUr.mode === "offline-ai") {
    while (prev.turn !== AppStateUr.humanColor && AppStateUr.undoStack.length) {
      prev = AppStateUr.undoStack.pop();
    }
  }
  AppStateUr.state = prev.state;
  AppStateUr.turn = prev.turn;
  AppStateUr.gameOver = prev.gameOver;
  AppStateUr.moveCount = prev.moveCount;
  AppStateUr.roll = null;
  AppStateUr.legalMoves = [];
  setGameResultUr("");
  updateDiceDisplayUr(null);
  updateUrBoard();
  updateGameLabelsUr();
  setStatusUr("board-info", "Move undone. " + colorNameUr(AppStateUr.turn) + " to move. Roll the dice.");
}

function showBoardSectionUr() {
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

/*** Board rendering (mirrors checkers-app.js's per-square float-grid approach) ***/

function buildUrBoardDOM() {
  const boardEl = document.getElementById("ur-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  // The actual grid lives in its own wrapper, inset-clipped 3px inside
  // #ur-board's own H-shape (see style.css) - that's what turns the
  // board's outer edge and its two inner "waist" notches into a visible
  // border ring instead of a plain rectangle.
  const gridEl = document.createElement("div");
  gridEl.id = "ur-grid";
  boardEl.appendChild(gridEl);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const info = urSquareInfo(row, col);
      const square = document.createElement("button");
      square.className = "square ur-square";
      square.type = "button";
      square.dataset.row = row;
      square.dataset.col = col;

      if (!info) {
        square.classList.add("ur-square-gap");
        square.disabled = true;
        square.setAttribute("aria-hidden", "true");
        gridEl.appendChild(square);
        continue;
      }

      square.dataset.pos = info.pos;
      if (row === 1) square.classList.add("ur-square-shared");
      if (UrCore.isRosette(info.pos)) square.classList.add("ur-square-rosette");

      const piece = document.createElement("span");
      piece.className = "ur-piece";
      square.appendChild(piece);
      square.addEventListener("click", onUrSquareClick);
      gridEl.appendChild(square);
    }
  }

  ensureUrSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureUrSquareAspectRatio);
  } else {
    setTimeout(ensureUrSquareAspectRatio, 0);
  }
  ensureUrResizeHandler();
}

let einkUrResizeHandlerAttached = false;
let einkUrResizeTimeoutId = null;

function ensureUrSquareAspectRatio() {
  const boardEl = document.getElementById("ur-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / 8;
  boardEl.querySelectorAll(".ur-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureUrResizeHandler() {
  if (einkUrResizeHandlerAttached) return;
  einkUrResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkUrResizeTimeoutId !== null) clearTimeout(einkUrResizeTimeoutId);
    einkUrResizeTimeoutId = setTimeout(() => {
      einkUrResizeTimeoutId = null;
      ensureUrSquareAspectRatio();
    }, 150);
  });
}

// Finds which color's piece (if any) currently occupies board position
// `pos` for the given `owner` (fixed for private squares, either color
// for the shared lane).
function urPieceColorAt(pos, owner) {
  if (owner) {
    return AppStateUr.state.positions[owner].includes(pos) ? owner : null;
  }
  if (AppStateUr.state.positions.b.includes(pos)) return "b";
  if (AppStateUr.state.positions.w.includes(pos)) return "w";
  return null;
}

function updateUrBoard() {
  const boardEl = document.getElementById("ur-board");
  if (!boardEl) return;

  const movableFrom = new Set(AppStateUr.legalMoves.map((m) => m.from));

  boardEl.querySelectorAll(".ur-square").forEach((sq) => {
    if (sq.classList.contains("ur-square-gap")) return;
    const pos = parseInt(sq.dataset.pos, 10);
    const row = parseInt(sq.dataset.row, 10);
    const owner = row === 1 ? null : UR_COLOR_FOR_ROW[row];
    const occupant = urPieceColorAt(pos, owner);
    const pieceEl = sq.querySelector(".ur-piece");
    if (pieceEl) {
      pieceEl.classList.remove("ur-piece-black", "ur-piece-white");
      if (occupant) pieceEl.classList.add(occupant === "b" ? "ur-piece-black" : "ur-piece-white");
    }
    const isMovable = movableFrom.has(pos);
    sq.classList.toggle("ur-square-movable", isMovable);

    let label = "Path square " + pos;
    if (UrCore.isRosette(pos)) label += ", rosette";
    label += occupant ? ", " + (occupant === "b" ? "Black" : "White") + " piece" : ", empty";
    if (isMovable) label += ", movable";
    sq.setAttribute("aria-label", label);
  });

  updateUrTrays();
}

function updateUrTrays() {
  const topStart = AppStateUr.state.positions.b.filter((p) => p === 0).length;
  const topHome = UrCore.countHome(AppStateUr.state, "b");
  const bottomStart = AppStateUr.state.positions.w.filter((p) => p === 0).length;
  const bottomHome = UrCore.countHome(AppStateUr.state, "w");

  setStatusUr("ur-tray-top-start-count", String(topStart));
  setStatusUr("ur-tray-top-home-count", String(topHome));
  setStatusUr("ur-tray-bottom-start-count", String(bottomStart));
  setStatusUr("ur-tray-bottom-home-count", String(bottomHome));

  const movableFromStart = AppStateUr.legalMoves.some((m) => m.from === 0);
  const topStartBtn = document.getElementById("ur-tray-top-start");
  const bottomStartBtn = document.getElementById("ur-tray-bottom-start");
  if (topStartBtn) {
    topStartBtn.classList.toggle("ur-tray-slot-movable", movableFromStart && AppStateUr.turn === "b");
    topStartBtn.setAttribute("aria-label", "Black start, " + topStart + " piece" + (topStart === 1 ? "" : "s") + " waiting");
  }
  if (bottomStartBtn) {
    bottomStartBtn.classList.toggle("ur-tray-slot-movable", movableFromStart && AppStateUr.turn === "w");
    bottomStartBtn.setAttribute("aria-label", "White start, " + bottomStart + " piece" + (bottomStart === 1 ? "" : "s") + " waiting");
  }
}

function updateDiceDisplayUr(roll) {
  const el = document.getElementById("ur-dice-display");
  if (!el) return;
  el.innerHTML = "";
  if (roll === null || roll === undefined) return;
  for (let i = 0; i < 4; i++) {
    const die = document.createElement("span");
    die.className = "ur-die " + (i < roll ? "ur-die-marked" : "ur-die-blank");
    el.appendChild(die);
  }
  const label = document.createElement("span");
  label.className = "ur-die-total";
  label.textContent = String(roll);
  el.appendChild(label);
}

function updateGameLabelsUr() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateUr.moveCount ? "Move " + AppStateUr.moveCount : "";
  updateUndoButtonVisibilityUr();
  updateResignVisibilityUr();
  updateRollButtonVisibilityUr();

  if (AppStateUr.gameOver) clearSavedUrGame();
  else saveUrGame();
}

function updateUndoButtonVisibilityUr() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateUr.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateUr.gameOver));
}

function updateResignVisibilityUr() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateUr.gameOver);
}

function updateRollButtonVisibilityUr() {
  const rollBtn = document.getElementById("ur-roll-button");
  if (!rollBtn) return;
  const isHumanTurn = !(AppStateUr.mode === "offline-ai" && AppStateUr.turn !== AppStateUr.humanColor);
  rollBtn.disabled = AppStateUr.gameOver || !isHumanTurn || AppStateUr.roll !== null;
}

document.addEventListener("DOMContentLoaded", initUrApp);
