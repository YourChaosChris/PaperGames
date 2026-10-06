// foxandgeese-app.js
// Wires FoxAndGeeseCore/FoxAndGeeseAi to the foxandgeese.html UI. The
// board is the 33-point cross, points joined across and down, drawn the
// way alquerque-app.js draws its lattice: one non-interactive SVG line
// layer under percentage-positioned point buttons, the board's height
// set from its width in JS (no CSS `aspect-ratio`).
//
// The two sides differ by shape, not by grey: a goose is a filled disc,
// the fox a triangle.
//
// Interaction: tap a piece of your side, then a highlighted point. A
// multi-jump is entered one landing point at a time; since the fox may
// stop after any jump (see foxandgeese-core.js), while further jumps are
// possible the fox stays selected - tap a highlighted point to jump on,
// or tap the fox itself to end the move there.

const AppStateFoxGeese = {
  mode: "offline",        // "offline" | "offline-ai"
  board: FoxAndGeeseCore.createInitialBoard(),
  turn: "fox",            // the fox moves first
  path: null,             // points entered so far in this move: [from, ...]
  lastMove: null,         // { from, to }
  humanSide: "geese",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const FOXGEESE_SAVE_KEY = "einkchess_save_foxandgeese";

function saveFoxGeeseGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(FOXGEESE_SAVE_KEY, {
    mode: AppStateFoxGeese.mode,
    board: AppStateFoxGeese.board,
    turn: AppStateFoxGeese.turn,
    lastMove: AppStateFoxGeese.lastMove,
    humanSide: AppStateFoxGeese.humanSide,
    aiLevel: AppStateFoxGeese.aiLevel,
    moveCount: AppStateFoxGeese.moveCount
  });
}

function clearSavedFoxGeeseGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(FOXGEESE_SAVE_KEY);
}

function recordFoxGeeseStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateFoxGeese.mode !== "offline-ai") return;
  GameStats.record("foxandgeese", outcome);
}

function sideNameFoxGeese(side) {
  return side === "fox" ? "Fox" : "Geese";
}

function setStatusFoxGeese(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultFoxGeese(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleFoxGeese(winner) {
  if (AppStateFoxGeese.mode === "offline-ai") {
    return winner === AppStateFoxGeese.humanSide ? "You win!" : "You lose";
  }
  return winner === "fox" ? "The fox wins" : "The geese win";
}

function announceGameResultFoxGeese(title, message) {
  setGameResultFoxGeese(message);
  setStatusFoxGeese("board-info", message);
  if (window.ResultModal) window.ResultModal.show(title, message);
}

function pushUndoSnapshotFoxGeese() {
  AppStateFoxGeese.undoStack.push({
    board: FoxAndGeeseCore.cloneBoard(AppStateFoxGeese.board),
    turn: AppStateFoxGeese.turn,
    gameOver: AppStateFoxGeese.gameOver,
    moveCount: AppStateFoxGeese.moveCount,
    lastMove: AppStateFoxGeese.lastMove
  });
}

function toMoveTextFoxGeese() {
  return sideNameFoxGeese(AppStateFoxGeese.turn) + " to move.";
}

function initFoxGeeseApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("foxandgeese-side-choice");
  const levelInline = document.getElementById("foxandgeese-level-inline");
  const startGameBtn = document.getElementById("start-foxandgeese-game");
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

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const opening = settingsPanel.classList.contains("hidden");
      settingsPanel.classList.toggle("hidden", !opening);
      I18n.setKey(menuToggle, opening ? "menu_close" : "menu_toggle");
    });
  }

  function startNewGame(mode, humanSide, level) {
    AppStateFoxGeese.mode = mode;
    AppStateFoxGeese.board = FoxAndGeeseCore.createInitialBoard();
    AppStateFoxGeese.turn = "fox";
    AppStateFoxGeese.path = null;
    AppStateFoxGeese.lastMove = null;
    AppStateFoxGeese.humanSide = humanSide;
    AppStateFoxGeese.aiLevel = level;
    AppStateFoxGeese.gameOver = false;
    AppStateFoxGeese.moveCount = 0;
    AppStateFoxGeese.undoStack = [];
    setGameResultFoxGeese("");
    showBoardSectionFoxGeese();
    buildFoxGeeseBoardDOM();
    updateFoxGeeseBoard();
    updateGameLabelsFoxGeese();

    if (mode === "offline-ai" && humanSide !== AppStateFoxGeese.turn) {
      setStatusFoxGeese("board-info", "Computer thinking…");
      setTimeout(aiMoveFoxGeese, AiPacing.delay(300));
    } else {
      setStatusFoxGeese("board-info", toMoveTextFoxGeese());
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "geese", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateFoxGeese.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusFoxGeese("board-info", "");
  });

  if (levelInline) levelInline.addEventListener("change", updateSideChoiceVisibility);

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='foxandgeese-side']:checked");
    const humanSide = RandomStart.choose(sideInput && sideInput.value === "fox" ? "fox" : "geese", ["fox", "geese"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "geese", 0);
      setStatusFoxGeese("offline-foxandgeese-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusFoxGeese("offline-foxandgeese-status",
      RandomStart.label("You play " + sideNameFoxGeese(humanSide) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateFoxGeese.gameOver) return;
      const loser = AppStateFoxGeese.mode === "offline-ai" ? AppStateFoxGeese.humanSide : AppStateFoxGeese.turn;
      const winner = FoxAndGeeseCore.otherSide(loser);
      AppStateFoxGeese.gameOver = true;
      AppStateFoxGeese.path = null;
      announceGameResultFoxGeese(resultTitleFoxGeese(winner),
        winner === "fox" ? "The fox wins by resignation." : "The geese win by resignation.");
      recordFoxGeeseStatsIfVsAi("loss");
      updateFoxGeeseBoard();
      updateGameLabelsFoxGeese();
    });
  }

  updateSideChoiceVisibility();

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(FOXGEESE_SAVE_KEY) : null;
  if (saved && saved.board) {
    AppStateFoxGeese.mode = saved.mode;
    AppStateFoxGeese.board = saved.board;
    AppStateFoxGeese.turn = saved.turn;
    AppStateFoxGeese.path = null;
    AppStateFoxGeese.lastMove = saved.lastMove;
    AppStateFoxGeese.humanSide = saved.humanSide;
    AppStateFoxGeese.aiLevel = saved.aiLevel;
    AppStateFoxGeese.moveCount = saved.moveCount;
    AppStateFoxGeese.gameOver = false;
    AppStateFoxGeese.undoStack = [];
    setActiveModeButton(AppStateFoxGeese.mode);
    setGameResultFoxGeese("");
    showBoardSectionFoxGeese();
    buildFoxGeeseBoardDOM();
    updateFoxGeeseBoard();
    updateGameLabelsFoxGeese();
    if (AppStateFoxGeese.mode === "offline-ai" && AppStateFoxGeese.turn !== AppStateFoxGeese.humanSide) {
      setStatusFoxGeese("board-info", "Computer thinking…");
      setTimeout(aiMoveFoxGeese, AiPacing.delay(300));
    } else {
      setStatusFoxGeese("board-info", toMoveTextFoxGeese());
    }
  }
  // Otherwise the placeholder shows until a mode is picked, as everywhere.
}

function isHumanTurnFoxGeese() {
  if (AppStateFoxGeese.gameOver) return false;
  if (AppStateFoxGeese.mode === "offline-ai" && AppStateFoxGeese.turn !== AppStateFoxGeese.humanSide) return false;
  return true;
}

// Legal moves that start with the points entered so far.
function matchingMovesFoxGeese() {
  const path = AppStateFoxGeese.path;
  if (!path) return [];
  return FoxAndGeeseCore.getLegalMoves(AppStateFoxGeese.board, AppStateFoxGeese.turn)
    .filter((m) => m.path.length >= path.length && path.every((p, k) => m.path[k] === p));
}

function nextTargetsFoxGeese() {
  const path = AppStateFoxGeese.path;
  const targets = new Set();
  if (!path) return targets;
  matchingMovesFoxGeese().forEach((m) => {
    if (m.path.length > path.length) targets.add(m.path[path.length]);
  });
  return targets;
}

// The board as it looks with the jumps entered so far already made.
function displayBoardFoxGeese() {
  const path = AppStateFoxGeese.path;
  if (!path || path.length < 2) return AppStateFoxGeese.board;
  const board = AppStateFoxGeese.board.slice();
  for (let k = 1; k < path.length; k++) {
    const from = path[k - 1], to = path[k];
    board[to] = board[from];
    board[from] = "";
    const jump = FoxAndGeeseCore.JUMPS[from].find((j) => j.to === to);
    if (jump) board[jump.over] = "";
  }
  return board;
}

function pieceOfSideFoxGeese(side) {
  return side === "fox" ? "F" : "G";
}

function onFoxGeesePointClick(i) {
  if (AppStateFoxGeese.gameOver) {
    setStatusFoxGeese("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnFoxGeese()) {
    setStatusFoxGeese("board-info", "Computer to move.");
    return;
  }

  const board = AppStateFoxGeese.board;
  const turn = AppStateFoxGeese.turn;
  const path = AppStateFoxGeese.path;

  if (path && nextTargetsFoxGeese().has(i)) {
    AppStateFoxGeese.path = path.concat([i]);
    const remaining = matchingMovesFoxGeese();
    const exact = remaining.find((m) => m.path.length === AppStateFoxGeese.path.length);
    if (exact && remaining.length === 1) {
      applyFoxGeeseMove(exact);
    } else {
      updateFoxGeeseBoard();
      setStatusFoxGeese("board-info", "Jump on, or tap the fox to stop here.");
    }
    return;
  }

  // In the middle of a multi-jump: tapping the fox ends the move there.
  if (path && path.length > 1) {
    if (i === path[path.length - 1]) {
      const exact = matchingMovesFoxGeese().find((m) => m.path.length === path.length);
      if (exact) applyFoxGeeseMove(exact);
      return;
    }
    setStatusFoxGeese("board-info", "Jump on, or tap the fox to stop here.");
    return;
  }

  if (board[i] === pieceOfSideFoxGeese(turn)) {
    const legal = FoxAndGeeseCore.getLegalMoves(board, turn);
    if (!legal.some((m) => m.from === i)) {
      AppStateFoxGeese.path = null;
      updateFoxGeeseBoard();
      setStatusFoxGeese("board-info", "Invalid move.");
      return;
    }
    AppStateFoxGeese.path = [i];
    updateFoxGeeseBoard();
    setStatusFoxGeese("board-info", "Choose where to move it.");
    return;
  }

  if (path) {
    AppStateFoxGeese.path = null;
    updateFoxGeeseBoard();
    setStatusFoxGeese("board-info", toMoveTextFoxGeese());
  }
}

function endTextFoxGeese(status) {
  if (status === "fox-trapped") return "The geese win: the fox cannot move.";
  if (status === "geese-stuck") return "The fox wins: the geese cannot move.";
  return "The fox wins: too few geese are left to trap it.";
}

function applyFoxGeeseMove(move) {
  pushUndoSnapshotFoxGeese();
  const mover = AppStateFoxGeese.turn;
  AppStateFoxGeese.board = FoxAndGeeseCore.applyMove(AppStateFoxGeese.board, move);
  AppStateFoxGeese.lastMove = { from: move.from, to: move.to };
  AppStateFoxGeese.moveCount++;
  AppStateFoxGeese.turn = FoxAndGeeseCore.otherSide(mover);
  AppStateFoxGeese.path = null;
  updateFoxGeeseBoard();
  updateGameLabelsFoxGeese();

  const end = FoxAndGeeseCore.detectGameEnd(AppStateFoxGeese.board, AppStateFoxGeese.turn);
  if (end.status !== "normal") {
    AppStateFoxGeese.gameOver = true;
    announceGameResultFoxGeese(resultTitleFoxGeese(end.winner), endTextFoxGeese(end.status));
    recordFoxGeeseStatsIfVsAi(end.winner === AppStateFoxGeese.humanSide ? "win" : "loss");
    updateFoxGeeseBoard();
    updateGameLabelsFoxGeese();
    return;
  }

  setStatusFoxGeese("board-info", sideNameFoxGeese(mover) + " played. " + toMoveTextFoxGeese());
  if (AppStateFoxGeese.mode === "offline-ai" && AppStateFoxGeese.turn !== AppStateFoxGeese.humanSide) {
    setStatusFoxGeese("board-info", "Computer thinking…");
    setTimeout(aiMoveFoxGeese, AiPacing.delay(300));
  }
}

function aiMoveFoxGeese() {
  if (AppStateFoxGeese.mode !== "offline-ai" || AppStateFoxGeese.gameOver) return;
  const aiSide = FoxAndGeeseCore.otherSide(AppStateFoxGeese.humanSide);
  if (AppStateFoxGeese.turn !== aiSide) return;
  const move = FoxAndGeeseAi.chooseMove(AppStateFoxGeese.board, aiSide, AppStateFoxGeese.aiLevel);
  if (!move) return;
  applyFoxGeeseMove(move);
}

function undoLastMove() {
  if (!AppStateFoxGeese.undoStack || !AppStateFoxGeese.undoStack.length) return;
  let prev = AppStateFoxGeese.undoStack.pop();
  if (AppStateFoxGeese.mode === "offline-ai") {
    while (prev.turn !== AppStateFoxGeese.humanSide && AppStateFoxGeese.undoStack.length) {
      prev = AppStateFoxGeese.undoStack.pop();
    }
  }
  AppStateFoxGeese.board = prev.board;
  AppStateFoxGeese.turn = prev.turn;
  AppStateFoxGeese.gameOver = prev.gameOver;
  AppStateFoxGeese.moveCount = prev.moveCount;
  AppStateFoxGeese.lastMove = prev.lastMove;
  AppStateFoxGeese.path = null;
  setGameResultFoxGeese("");
  updateFoxGeeseBoard();
  updateGameLabelsFoxGeese();
  setStatusFoxGeese("board-info", "Move undone.");
}

function showBoardSectionFoxGeese() {
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
 * Points sit on a UNIT-spaced 7x7 grid with a PAD margin, positioned by
 * percentage; the board is square, its pixel height set from its width.
 */
const FOXGEESE_UNIT = 100;
const FOXGEESE_PAD = 50;
const FOXGEESE_TOTAL = (FoxAndGeeseCore.SIZE - 1) * FOXGEESE_UNIT + FOXGEESE_PAD * 2;
const FOXGEESE_POINT_SIZE = 76;
const SVG_NS_FOXGEESE = "http://www.w3.org/2000/svg";

function foxGeeseX(c) { return FOXGEESE_PAD + c * FOXGEESE_UNIT; }
function foxGeeseY(r) { return FOXGEESE_PAD + r * FOXGEESE_UNIT; }
function foxGeesePct(value) { return (value / FOXGEESE_TOTAL * 100) + "%"; }

function buildFoxGeeseBoardDOM() {
  const boardEl = document.getElementById("foxandgeese-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const CORE = FoxAndGeeseCore;

  const svg = document.createElementNS(SVG_NS_FOXGEESE, "svg");
  svg.setAttribute("class", "foxandgeese-lines");
  svg.setAttribute("viewBox", "0 0 " + FOXGEESE_TOTAL + " " + FOXGEESE_TOTAL);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  CORE.POINTS.forEach((i) => {
    CORE.NEIGHBORS[i].forEach(({ to }) => {
      if (to <= i) return;
      const line = document.createElementNS(SVG_NS_FOXGEESE, "line");
      line.setAttribute("x1", foxGeeseX(CORE.colOf(i)));
      line.setAttribute("y1", foxGeeseY(CORE.rowOf(i)));
      line.setAttribute("x2", foxGeeseX(CORE.colOf(to)));
      line.setAttribute("y2", foxGeeseY(CORE.rowOf(to)));
      svg.appendChild(line);
    });
  });
  boardEl.appendChild(svg);

  CORE.POINTS.forEach((i) => {
    const r = CORE.rowOf(i), c = CORE.colOf(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "foxandgeese-point";
    point.style.left = foxGeesePct(foxGeeseX(c));
    point.style.top = foxGeesePct(foxGeeseY(r));
    point.style.width = foxGeesePct(FOXGEESE_POINT_SIZE);
    point.style.height = foxGeesePct(FOXGEESE_POINT_SIZE);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "foxandgeese-piece";
    piece.setAttribute("aria-hidden", "true");
    point.appendChild(piece);
    point.addEventListener("click", () => onFoxGeesePointClick(i));
    boardEl.appendChild(point);
  });

  ensureFoxGeeseBoardAspect();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensureFoxGeeseBoardAspect);
  else setTimeout(ensureFoxGeeseBoardAspect, 0);
  ensureFoxGeeseResizeHandler();
}

let foxGeeseResizeHandlerAttached = false;
let foxGeeseResizeTimeoutId = null;

function ensureFoxGeeseBoardAspect() {
  const boardEl = document.getElementById("foxandgeese-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureFoxGeeseResizeHandler() {
  if (foxGeeseResizeHandlerAttached) return;
  foxGeeseResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (foxGeeseResizeTimeoutId !== null) clearTimeout(foxGeeseResizeTimeoutId);
    foxGeeseResizeTimeoutId = setTimeout(() => {
      foxGeeseResizeTimeoutId = null;
      ensureFoxGeeseBoardAspect();
    }, 150);
  });
}

// The fox is drawn as a triangle, a goose as a filled disc (CSS).
const FOXGEESE_FOX_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M50 8 L94 88 L6 88 Z" fill="#fff" stroke="#111" stroke-width="10" stroke-linejoin="round"/><path d="M50 40 L70 76 L30 76 Z" fill="#111"/></svg>';

function updateFoxGeeseBoard() {
  const boardEl = document.getElementById("foxandgeese-board");
  if (!boardEl) return;

  const board = displayBoardFoxGeese();
  const path = AppStateFoxGeese.path;
  const activeIndex = path ? path[path.length - 1] : null;
  let highlight = new Set();
  if (!AppStateFoxGeese.gameOver && isHumanTurnFoxGeese()) {
    if (path) {
      highlight = nextTargetsFoxGeese();
    } else {
      FoxAndGeeseCore.getLegalMoves(AppStateFoxGeese.board, AppStateFoxGeese.turn).forEach((m) => highlight.add(m.from));
    }
  }

  boardEl.querySelectorAll(".foxandgeese-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".foxandgeese-piece");
    if (pieceEl) {
      const kind = piece === "F" ? "fox" : piece === "G" ? "goose" : "";
      if (pieceEl.dataset.kind !== kind) {
        pieceEl.dataset.kind = kind;
        pieceEl.className = "foxandgeese-piece" + (kind ? " foxandgeese-piece-" + kind : "");
        pieceEl.innerHTML = kind === "fox" ? FOXGEESE_FOX_SVG : "";
      }
    }
    const isActive = activeIndex === i;
    pt.classList.toggle("foxandgeese-point-selected", isActive);
    pt.classList.toggle("foxandgeese-point-movable", !!path && highlight.has(i));
    pt.classList.toggle("foxandgeese-point-selectable", !path && highlight.has(i));
    pt.classList.toggle("last-move", !path && !!(AppStateFoxGeese.lastMove &&
      (AppStateFoxGeese.lastMove.from === i || AppStateFoxGeese.lastMove.to === i)));

    const r = FoxAndGeeseCore.rowOf(i), c = FoxAndGeeseCore.colOf(i);
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece === "F" ? ", fox" : piece === "G" ? ", goose" : ", empty";
    if (isActive) label += ", selected";
    else if (highlight.has(i)) label += ", movable";
    I18n.setAria(pt, label);
  });

  ensureFoxGeeseBoardAspect();
  updateScoreLineFoxGeese();
}

function updateScoreLineFoxGeese() {
  const container = document.getElementById("score-line");
  const textEl = document.getElementById("score-captures");
  if (!container || !textEl) return;
  const left = FoxAndGeeseCore.countGeese(AppStateFoxGeese.board);
  container.classList.remove("hidden");
  I18n.setMsg(textEl, "Geese left: " + left + " of " + FoxAndGeeseCore.TOTAL_GEESE +
    " · the fox wins at " + FoxAndGeeseCore.GEESE_TO_LOSE + ".");
}

function updateGameLabelsFoxGeese() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateFoxGeese.moveCount ? "Move " + AppStateFoxGeese.moveCount : "");
  const undoBtn = document.getElementById("undo-btn");
  if (undoBtn) undoBtn.classList.toggle("hidden", !(AppStateFoxGeese.undoStack.length && !AppStateFoxGeese.gameOver));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateFoxGeese.gameOver);
  if (AppStateFoxGeese.gameOver) clearSavedFoxGeeseGame();
  else saveFoxGeeseGame();
}

document.addEventListener("DOMContentLoaded", initFoxGeeseApp);
