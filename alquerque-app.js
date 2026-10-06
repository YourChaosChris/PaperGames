// alquerque-app.js
// Wires AlquerqueCore/AlquerqueAi to the alquerque.html UI. The board is
// a 5x5 lattice of points joined by lines, some diagonal, so it is drawn
// the way baghchal-app.js and fanorona-app.js draw theirs: one
// non-interactive SVG line layer under percentage-positioned point
// buttons, with the board's height set from its width in JS (no CSS
// `aspect-ratio`, which some E-Ink browsers ignore). The lines matter
// here more than anywhere: they are the only way to see which diagonal
// steps exist.
//
// Interaction: tap one of your pieces, then a highlighted point. A
// multi-jump is entered one landing point at a time - after each jump the
// piece stays selected and the next possible landing points are
// highlighted, until the sequence is complete. Since capturing is
// compulsory (see alquerque-core.js), only pieces that can capture are
// selectable while a capture exists.

const AppStateAlquerque = {
  mode: "offline",        // "offline" | "offline-ai"
  board: AlquerqueCore.createInitialBoard(),
  turn: "w",              // White (the ring stones, bottom) moves first
  selected: null,         // index of the piece being moved
  path: null,             // landing points entered so far in this move: [from, ...]
  lastMove: null,         // { from, to }
  humanColor: "w",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 } // pieces captured BY black / BY white
};

const ALQUERQUE_SAVE_KEY = "einkchess_save_alquerque";

function saveAlquerqueGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(ALQUERQUE_SAVE_KEY, {
    mode: AppStateAlquerque.mode,
    board: AppStateAlquerque.board,
    turn: AppStateAlquerque.turn,
    lastMove: AppStateAlquerque.lastMove,
    humanColor: AppStateAlquerque.humanColor,
    aiLevel: AppStateAlquerque.aiLevel,
    moveCount: AppStateAlquerque.moveCount,
    captures: AppStateAlquerque.captures
  });
}

function clearSavedAlquerqueGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(ALQUERQUE_SAVE_KEY);
}

function recordAlquerqueStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateAlquerque.mode !== "offline-ai") return;
  GameStats.record("alquerque", outcome);
}

function colorNameAlquerque(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusAlquerque(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultAlquerque(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleAlquerque(winner) {
  if (AppStateAlquerque.mode === "offline-ai") {
    return winner === AppStateAlquerque.humanColor ? "You win!" : "You lose";
  }
  return colorNameAlquerque(winner) + " wins";
}

function announceGameResultAlquerque(resultCode, message) {
  setGameResultAlquerque(message);
  setStatusAlquerque("board-info", message);
  if (window.ResultModal) window.ResultModal.show(resultCode, message);
}

function resetUndoStackAlquerque() {
  AppStateAlquerque.undoStack = [];
}

function pushUndoSnapshotAlquerque() {
  AppStateAlquerque.undoStack.push({
    board: AlquerqueCore.cloneBoard(AppStateAlquerque.board),
    turn: AppStateAlquerque.turn,
    gameOver: AppStateAlquerque.gameOver,
    moveCount: AppStateAlquerque.moveCount,
    captures: { b: AppStateAlquerque.captures.b, w: AppStateAlquerque.captures.w },
    lastMove: AppStateAlquerque.lastMove
  });
}

function initAlquerqueApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("alquerque-color-choice");
  const levelInline = document.getElementById("alquerque-level-inline");
  const startGameBtn = document.getElementById("start-alquerque-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibility() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const opening = settingsPanel.classList.contains("hidden");
      settingsPanel.classList.toggle("hidden", !opening);
      I18n.setKey(menuToggle, opening ? "menu_close" : "menu_toggle");
    });
  }

  function startNewGame(mode, humanColor, level) {
    AppStateAlquerque.mode = mode;
    AppStateAlquerque.board = AlquerqueCore.createInitialBoard();
    AppStateAlquerque.turn = "w";
    AppStateAlquerque.selected = null;
    AppStateAlquerque.path = null;
    AppStateAlquerque.lastMove = null;
    AppStateAlquerque.humanColor = humanColor;
    AppStateAlquerque.aiLevel = level;
    AppStateAlquerque.gameOver = false;
    AppStateAlquerque.moveCount = 0;
    AppStateAlquerque.captures = { b: 0, w: 0 };
    resetUndoStackAlquerque();
    setGameResultAlquerque("");
    showBoardSectionAlquerque();
    buildAlquerqueBoardDOM();
    updateAlquerqueBoard();
    updateGameLabelsAlquerque();

    if (mode === "offline-ai" && humanColor !== AppStateAlquerque.turn) {
      setStatusAlquerque("board-info", "Computer thinking…");
      setTimeout(aiMoveAlquerque, AiPacing.delay(300));
    } else {
      setStatusAlquerque("board-info", colorNameAlquerque(AppStateAlquerque.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "w", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateAlquerque.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusAlquerque("board-info", "");
  });

  if (levelInline) levelInline.addEventListener("change", updateColorChoiceVisibility);

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='alquerque-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "black" ? "b" : "w", ["b", "w"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "w", 0);
      setStatusAlquerque("offline-alquerque-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusAlquerque("offline-alquerque-status",
      RandomStart.label("You play " + colorNameAlquerque(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateAlquerque.gameOver) return;
      const winner = AlquerqueCore.otherColor(AppStateAlquerque.turn);
      AppStateAlquerque.gameOver = true;
      AppStateAlquerque.selected = null;
      AppStateAlquerque.path = null;
      announceGameResultAlquerque(resultTitleAlquerque(winner), colorNameAlquerque(winner) + " wins by resignation.");
      recordAlquerqueStatsIfVsAi("loss");
      updateAlquerqueBoard();
      updateGameLabelsAlquerque();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(ALQUERQUE_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateAlquerque.mode = savedGame.mode;
    AppStateAlquerque.board = savedGame.board;
    AppStateAlquerque.turn = savedGame.turn;
    AppStateAlquerque.selected = null;
    AppStateAlquerque.path = null;
    AppStateAlquerque.lastMove = savedGame.lastMove;
    AppStateAlquerque.humanColor = savedGame.humanColor;
    AppStateAlquerque.aiLevel = savedGame.aiLevel;
    AppStateAlquerque.moveCount = savedGame.moveCount;
    AppStateAlquerque.captures = savedGame.captures || { b: 0, w: 0 };
    AppStateAlquerque.gameOver = false;
    resetUndoStackAlquerque();
    setActiveModeButton(AppStateAlquerque.mode);
    setGameResultAlquerque("");
    showBoardSectionAlquerque();
    buildAlquerqueBoardDOM();
    updateAlquerqueBoard();
    updateGameLabelsAlquerque();
    if (endIfOverAlquerque()) {
      // finished under the current rules
    } else if (AppStateAlquerque.mode === "offline-ai" && AppStateAlquerque.turn !== AppStateAlquerque.humanColor) {
      setStatusAlquerque("board-info", "Computer thinking…");
      setTimeout(aiMoveAlquerque, AiPacing.delay(300));
    } else {
      setStatusAlquerque("board-info", colorNameAlquerque(AppStateAlquerque.turn) + " to move.");
    }
  }
  // Otherwise the placeholder shows until a mode is picked, as everywhere.
}

function isHumanTurnAlquerque() {
  if (AppStateAlquerque.gameOver) return false;
  if (AppStateAlquerque.mode === "offline-ai" && AppStateAlquerque.turn !== AppStateAlquerque.humanColor) return false;
  return true;
}

// Legal moves that continue the landing points entered so far.
function matchingMovesAlquerque() {
  const path = AppStateAlquerque.path;
  return AlquerqueCore.getLegalMoves(AppStateAlquerque.board, AppStateAlquerque.turn)
    .filter((m) => path && m.path.length > path.length - 1 && path.every((p, k) => m.path[k] === p));
}

// The next points the selected piece may land on.
function nextTargetsAlquerque() {
  const path = AppStateAlquerque.path;
  const targets = new Set();
  if (!path) return targets;
  matchingMovesAlquerque().forEach((m) => {
    if (m.path.length > path.length) targets.add(m.path[path.length]);
  });
  return targets;
}

// The board as it looks with the jumps entered so far already made.
function displayBoardAlquerque() {
  const path = AppStateAlquerque.path;
  if (!path || path.length < 2) return AppStateAlquerque.board;
  const board = AppStateAlquerque.board.slice();
  for (let k = 1; k < path.length; k++) {
    const from = path[k - 1], to = path[k];
    board[to] = board[from];
    board[from] = null;
    const over = AlquerqueCore.JUMPS[from].find((j) => j.to === to);
    if (over) board[over.over] = null;
  }
  return board;
}

function onAlquerquePointClick(i) {
  if (AppStateAlquerque.gameOver) {
    setStatusAlquerque("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnAlquerque()) {
    setStatusAlquerque("board-info", "Computer to move.");
    return;
  }

  const board = AppStateAlquerque.board;
  const turn = AppStateAlquerque.turn;
  const path = AppStateAlquerque.path;

  if (path && nextTargetsAlquerque().has(i)) {
    AppStateAlquerque.path = path.concat([i]);
    const remaining = matchingMovesAlquerque();
    const done = remaining.find((m) => m.path.length === AppStateAlquerque.path.length);
    if (done && remaining.length === 1) {
      applyAlquerqueMove(done);
    } else {
      updateAlquerqueBoard();
      setStatusAlquerque("board-info", "Keep jumping with this piece.");
    }
    return;
  }

  // In the middle of a multi-jump the piece is committed.
  if (path && path.length > 1) {
    setStatusAlquerque("board-info", "Keep jumping with this piece.");
    return;
  }

  if (board[i] === turn) {
    const legal = AlquerqueCore.getLegalMoves(board, turn);
    if (!legal.some((m) => m.from === i)) {
      AppStateAlquerque.selected = null;
      AppStateAlquerque.path = null;
      updateAlquerqueBoard();
      setStatusAlquerque("board-info", legal[0] && legal[0].captured.length
        ? "Invalid move: a capture is available and must be taken."
        : "Invalid move.");
      return;
    }
    AppStateAlquerque.selected = i;
    AppStateAlquerque.path = [i];
    updateAlquerqueBoard();
    setStatusAlquerque("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateAlquerque.selected !== null) {
    AppStateAlquerque.selected = null;
    AppStateAlquerque.path = null;
    updateAlquerqueBoard();
    setStatusAlquerque("board-info", colorNameAlquerque(turn) + " to move.");
  }
}

function applyAlquerqueMove(move) {
  pushUndoSnapshotAlquerque();
  const mover = AppStateAlquerque.turn;
  AppStateAlquerque.board = AlquerqueCore.applyMove(AppStateAlquerque.board, move);
  AppStateAlquerque.captures[mover] += move.captured.length;
  AppStateAlquerque.lastMove = { from: move.from, to: move.to };
  AppStateAlquerque.moveCount++;
  AppStateAlquerque.turn = AlquerqueCore.otherColor(mover);
  AppStateAlquerque.selected = null;
  AppStateAlquerque.path = null;
  updateAlquerqueBoard();
  updateGameLabelsAlquerque();

  if (endIfOverAlquerque()) return;

  setStatusAlquerque("board-info", colorNameAlquerque(mover) + " played. " + colorNameAlquerque(AppStateAlquerque.turn) + " to move.");
  if (AppStateAlquerque.mode === "offline-ai" && AppStateAlquerque.turn !== AppStateAlquerque.humanColor) {
    setStatusAlquerque("board-info", "Computer thinking…");
    setTimeout(aiMoveAlquerque, AiPacing.delay(300));
  }
}

// Ends the game if the side to move has no piece or no legal move.
// Also run on a restored game: a position saved before pieces were
// barred from moving backwards may have no legal move any more.
function endIfOverAlquerque() {
  const end = AlquerqueCore.detectGameEnd(AppStateAlquerque.board, AppStateAlquerque.turn);
  if (end.status === "normal") return false;
  AppStateAlquerque.gameOver = true;
  const reason = end.status === "no-pieces" ? "no pieces left" : "no legal moves";
  announceGameResultAlquerque(resultTitleAlquerque(end.winner), colorNameAlquerque(end.winner) + " wins (" + reason + ").");
  recordAlquerqueStatsIfVsAi(end.winner === AppStateAlquerque.humanColor ? "win" : "loss");
  updateAlquerqueBoard();
  updateGameLabelsAlquerque();
  return true;
}

function aiMoveAlquerque() {
  if (AppStateAlquerque.mode !== "offline-ai" || AppStateAlquerque.gameOver) return;
  const aiColor = AlquerqueCore.otherColor(AppStateAlquerque.humanColor);
  if (AppStateAlquerque.turn !== aiColor) return;
  const move = AlquerqueAi.chooseMove(AppStateAlquerque.board, aiColor, AppStateAlquerque.aiLevel);
  if (!move) return; // detectGameEnd after the previous move already ended the game
  applyAlquerqueMove(move);
}

function undoLastMove() {
  if (!AppStateAlquerque.undoStack || !AppStateAlquerque.undoStack.length) return;
  let prev = AppStateAlquerque.undoStack.pop();
  if (AppStateAlquerque.mode === "offline-ai") {
    while (prev.turn !== AppStateAlquerque.humanColor && AppStateAlquerque.undoStack.length) {
      prev = AppStateAlquerque.undoStack.pop();
    }
  }
  AppStateAlquerque.board = prev.board;
  AppStateAlquerque.turn = prev.turn;
  AppStateAlquerque.gameOver = prev.gameOver;
  AppStateAlquerque.moveCount = prev.moveCount;
  AppStateAlquerque.captures = prev.captures;
  AppStateAlquerque.lastMove = prev.lastMove;
  AppStateAlquerque.selected = null;
  AppStateAlquerque.path = null;
  setGameResultAlquerque("");
  updateAlquerqueBoard();
  updateGameLabelsAlquerque();
  setStatusAlquerque("board-info", "Move undone.");
}

function showBoardSectionAlquerque() {
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

/*** Board geometry and rendering ***
 * Points sit on a UNIT-spaced grid with a PAD margin on every side,
 * positioned by percentage; the board is square, its pixel height set
 * from its width on load and resize.
 */
const ALQUERQUE_UNIT = 100;
const ALQUERQUE_PAD = 55;
const ALQUERQUE_TOTAL = (AlquerqueCore.COLS - 1) * ALQUERQUE_UNIT + ALQUERQUE_PAD * 2;
const ALQUERQUE_POINT_SIZE = 64;
const SVG_NS_ALQUERQUE = "http://www.w3.org/2000/svg";

function alquerquePointX(c) { return ALQUERQUE_PAD + c * ALQUERQUE_UNIT; }
function alquerquePointY(r) { return ALQUERQUE_PAD + r * ALQUERQUE_UNIT; }
function alquerquePct(value) { return (value / ALQUERQUE_TOTAL * 100) + "%"; }

function buildAlquerqueBoardDOM() {
  const boardEl = document.getElementById("alquerque-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const svg = document.createElementNS(SVG_NS_ALQUERQUE, "svg");
  svg.setAttribute("class", "alquerque-lines");
  svg.setAttribute("viewBox", "0 0 " + ALQUERQUE_TOTAL + " " + ALQUERQUE_TOTAL);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  for (let i = 0; i < AlquerqueCore.TOTAL_POINTS; i++) {
    AlquerqueCore.NEIGHBORS[i].forEach(({ to }) => {
      if (to <= i) return;
      const line = document.createElementNS(SVG_NS_ALQUERQUE, "line");
      line.setAttribute("x1", alquerquePointX(AlquerqueCore.colOf(i)));
      line.setAttribute("y1", alquerquePointY(AlquerqueCore.rowOf(i)));
      line.setAttribute("x2", alquerquePointX(AlquerqueCore.colOf(to)));
      line.setAttribute("y2", alquerquePointY(AlquerqueCore.rowOf(to)));
      svg.appendChild(line);
    });
  }
  boardEl.appendChild(svg);

  for (let i = 0; i < AlquerqueCore.TOTAL_POINTS; i++) {
    const r = AlquerqueCore.rowOf(i), c = AlquerqueCore.colOf(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "alquerque-point";
    point.style.left = alquerquePct(alquerquePointX(c));
    point.style.top = alquerquePct(alquerquePointY(r));
    point.style.width = alquerquePct(ALQUERQUE_POINT_SIZE);
    point.style.height = alquerquePct(ALQUERQUE_POINT_SIZE);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "alquerque-piece";
    point.appendChild(piece);
    point.addEventListener("click", () => onAlquerquePointClick(i));
    boardEl.appendChild(point);
  }

  ensureAlquerqueBoardAspect();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensureAlquerqueBoardAspect);
  else setTimeout(ensureAlquerqueBoardAspect, 0);
  ensureAlquerqueResizeHandler();
}

let alquerqueResizeHandlerAttached = false;
let alquerqueResizeTimeoutId = null;

function ensureAlquerqueBoardAspect() {
  const boardEl = document.getElementById("alquerque-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureAlquerqueResizeHandler() {
  if (alquerqueResizeHandlerAttached) return;
  alquerqueResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (alquerqueResizeTimeoutId !== null) clearTimeout(alquerqueResizeTimeoutId);
    alquerqueResizeTimeoutId = setTimeout(() => {
      alquerqueResizeTimeoutId = null;
      ensureAlquerqueBoardAspect();
    }, 150);
  });
}

function updateAlquerqueBoard() {
  const boardEl = document.getElementById("alquerque-board");
  if (!boardEl) return;

  const board = displayBoardAlquerque();
  const path = AppStateAlquerque.path;
  const activeIndex = path ? path[path.length - 1] : null;
  let highlight = new Set();
  if (!AppStateAlquerque.gameOver && isHumanTurnAlquerque()) {
    if (path) {
      highlight = nextTargetsAlquerque();
    } else {
      AlquerqueCore.getLegalMoves(AppStateAlquerque.board, AppStateAlquerque.turn).forEach((m) => highlight.add(m.from));
    }
  }

  boardEl.querySelectorAll(".alquerque-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".alquerque-piece");
    if (pieceEl) {
      pieceEl.classList.remove("alquerque-piece-black", "alquerque-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "alquerque-piece-black" : "alquerque-piece-white");
    }
    const isActive = activeIndex === i;
    const isTarget = !!path && highlight.has(i);
    pt.classList.toggle("alquerque-point-selected", isActive);
    pt.classList.toggle("alquerque-point-movable", isTarget);
    pt.classList.toggle("alquerque-point-selectable", !path && highlight.has(i));
    pt.classList.toggle("last-move", !path && !!(AppStateAlquerque.lastMove &&
      (AppStateAlquerque.lastMove.from === i || AppStateAlquerque.lastMove.to === i)));

    const r = AlquerqueCore.rowOf(i), c = AlquerqueCore.colOf(i);
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " piece" : ", empty";
    if (isActive) label += ", selected";
    else if (highlight.has(i)) label += ", movable";
    I18n.setAria(pt, label);
  });

  ensureAlquerqueBoardAspect();
  updateScoreLineAlquerque();
}

function updateScoreLineAlquerque() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const caps = AppStateAlquerque.captures;
  if (!AppStateAlquerque.moveCount && !caps.b && !caps.w) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Captured – Black: " + caps.b + " · White: " + caps.w);
}

function updateGameLabelsAlquerque() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateAlquerque.moveCount ? "Move " + AppStateAlquerque.moveCount : "");
  const undoBtn = document.getElementById("undo-btn");
  if (undoBtn) undoBtn.classList.toggle("hidden", !(AppStateAlquerque.undoStack.length && !AppStateAlquerque.gameOver));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateAlquerque.gameOver);
  if (AppStateAlquerque.gameOver) clearSavedAlquerqueGame();
  else saveAlquerqueGame();
}

document.addEventListener("DOMContentLoaded", initAlquerqueApp);
