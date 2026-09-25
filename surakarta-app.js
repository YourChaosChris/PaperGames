// surakarta-app.js
// Wires SurakartaCore/SurakartaAi to the surakarta.html UI. The board is
// a plain 6x6 grid of points (unlike Fanorona's wider-than-tall 5x9), so
// it reuses the same percentage-based absolute-positioning technique as
// fanorona-app.js - a JS-enforced square aspect ratio, with the grid's
// connecting lines drawn as a single non-interactive SVG layer UNDER the
// point buttons - but adds the game's namesake feature on top: the 4
// corner loop-track arcs are drawn as curved SVG paths in that same
// layer (see buildSurakartaBoardDOM), since without them the board
// would just look like an ordinary empty grid and the whole point of
// the game would be invisible.
//
// Interaction model is simpler than Fanorona's: a quiet move never
// captures and a capturing slide always has exactly one destination per
// direction (the first qualifying enemy along that line - see
// surakarta-core.js), so there's no approach/withdrawal-style choice to
// resolve. Selecting a piece highlights every square it could reach
// this turn - both quiet destinations and capture destinations (marked
// distinctly, see .surakarta-point-capturable) - and capturing is
// optional here, exactly like a quiet move is just another legal choice
// (see surakarta-core.js's header comment for why capture isn't
// mandatory in this implementation).

const AppStateSurakarta = {
  mode: "offline",        // "offline" | "offline-ai"
  board: SurakartaCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black moves first (see surakarta-core.js header)
  selected: null,         // point index while choosing a move's destination
  lastMove: null,         // { from, to } for highlighting
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 } // pieces captured BY black / BY white
};

const SURAKARTA_SAVE_KEY = "einkchess_save_surakarta";

function saveSurakartaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SURAKARTA_SAVE_KEY, {
    mode: AppStateSurakarta.mode,
    board: AppStateSurakarta.board,
    turn: AppStateSurakarta.turn,
    lastMove: AppStateSurakarta.lastMove,
    humanColor: AppStateSurakarta.humanColor,
    aiLevel: AppStateSurakarta.aiLevel,
    moveCount: AppStateSurakarta.moveCount,
    captures: AppStateSurakarta.captures
  });
}

function clearSavedSurakartaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SURAKARTA_SAVE_KEY);
}

function recordSurakartaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateSurakarta.mode !== "offline-ai") return;
  GameStats.record("surakarta", outcome);
}

function colorNameSurakarta(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusSurakarta(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSurakarta(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Same resultTitle<Game> convention every 2-player game here follows:
// color-based in local 2-player, framed from the human's perspective vs
// the built-in AI.
function resultTitleSurakarta(winner) {
  if (AppStateSurakarta.mode === "offline-ai") {
    return winner === AppStateSurakarta.humanColor ? "You win!" : "You lose";
  }
  return colorNameSurakarta(winner) + " wins";
}

function announceGameResultSurakarta(resultCode, message) {
  setGameResultSurakarta(message);
  setStatusSurakarta("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackSurakarta() {
  AppStateSurakarta.undoStack = [];
}

function pushUndoSnapshotSurakarta() {
  AppStateSurakarta.undoStack.push({
    board: SurakartaCore.cloneBoard(AppStateSurakarta.board),
    turn: AppStateSurakarta.turn,
    gameOver: AppStateSurakarta.gameOver,
    moveCount: AppStateSurakarta.moveCount,
    captures: { b: AppStateSurakarta.captures.b, w: AppStateSurakarta.captures.w },
    lastMove: AppStateSurakarta.lastMove
  });
}

function initSurakartaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("surakarta-color-choice");
  const levelInline = document.getElementById("surakarta-level-inline");
  const startGameBtn = document.getElementById("start-surakarta-game");
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

  function startNewGame(mode, humanColor, level) {
    AppStateSurakarta.mode = mode;
    AppStateSurakarta.board = SurakartaCore.createInitialBoard();
    AppStateSurakarta.turn = "b";
    AppStateSurakarta.selected = null;
    AppStateSurakarta.lastMove = null;
    AppStateSurakarta.humanColor = humanColor;
    AppStateSurakarta.aiLevel = level;
    AppStateSurakarta.gameOver = false;
    AppStateSurakarta.moveCount = 0;
    AppStateSurakarta.captures = { b: 0, w: 0 };
    resetUndoStackSurakarta();
    setGameResultSurakarta("");
    showBoardSectionSurakarta();
    buildSurakartaBoardDOM();
    updateSurakartaBoard();
    updateGameLabelsSurakarta();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusSurakarta("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineSurakarta, 10);
    } else {
      setStatusSurakarta("board-info", colorNameSurakarta(AppStateSurakarta.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateSurakarta.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusSurakarta("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='surakarta-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "b", 0);
      setStatusSurakarta("offline-surakarta-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusSurakarta("offline-surakarta-status",
      "You play " + colorNameSurakarta(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateSurakarta.gameOver) return;
      const loser = AppStateSurakarta.turn;
      const winner = SurakartaCore.otherColor(loser);
      AppStateSurakarta.gameOver = true;
      announceGameResultSurakarta(resultTitleSurakarta(winner), colorNameSurakarta(winner) + " wins by resignation.");
      recordSurakartaStatsIfVsAi("loss");
      updateGameLabelsSurakarta();
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SURAKARTA_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateSurakarta.mode = savedGame.mode;
    AppStateSurakarta.board = savedGame.board;
    AppStateSurakarta.turn = savedGame.turn;
    AppStateSurakarta.selected = null;
    AppStateSurakarta.lastMove = savedGame.lastMove;
    AppStateSurakarta.humanColor = savedGame.humanColor;
    AppStateSurakarta.aiLevel = savedGame.aiLevel;
    AppStateSurakarta.moveCount = savedGame.moveCount;
    AppStateSurakarta.captures = savedGame.captures;
    AppStateSurakarta.gameOver = false;
    resetUndoStackSurakarta();
    setActiveModeButton(AppStateSurakarta.mode);
    setGameResultSurakarta("");
    showBoardSectionSurakarta();
    buildSurakartaBoardDOM();
    updateSurakartaBoard();
    updateGameLabelsSurakarta();
    if (AppStateSurakarta.mode === "offline-ai" && AppStateSurakarta.turn !== AppStateSurakarta.humanColor) {
      setStatusSurakarta("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineSurakarta, 10);
    } else {
      setStatusSurakarta("board-info", colorNameSurakarta(AppStateSurakarta.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching fanorona.html's behavior.
}

function isHumanTurnSurakarta() {
  if (AppStateSurakarta.gameOver) return false;
  if (AppStateSurakarta.mode === "offline-ai" && AppStateSurakarta.turn !== AppStateSurakarta.humanColor) return false;
  return true;
}

function onSurakartaPointClick(i) {
  if (AppStateSurakarta.gameOver) {
    setStatusSurakarta("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnSurakarta()) {
    setStatusSurakarta("board-info", "Computer to move.");
    return;
  }

  const board = AppStateSurakarta.board;
  const turn = AppStateSurakarta.turn;

  if (AppStateSurakarta.selected === null) {
    if (board[i] !== turn) return;
    AppStateSurakarta.selected = i;
    updateSurakartaBoard();
    return;
  }

  if (AppStateSurakarta.selected === i) {
    AppStateSurakarta.selected = null;
    updateSurakartaBoard();
    return;
  }

  if (board[i] === turn) {
    AppStateSurakarta.selected = i;
    updateSurakartaBoard();
    return;
  }

  const legalMoves = SurakartaCore.getLegalMoves(board, turn);
  const match = legalMoves.find((m) => m.from === AppStateSurakarta.selected && m.to === i);
  if (!match) {
    setStatusSurakarta("board-info", "Invalid move.");
    AppStateSurakarta.selected = null;
    updateSurakartaBoard();
    return;
  }

  AppStateSurakarta.selected = null;
  pushUndoSnapshotSurakarta();
  applySurakartaMove(match);
}

function applySurakartaMove(move) {
  const mover = AppStateSurakarta.turn;
  AppStateSurakarta.board = SurakartaCore.applyMove(AppStateSurakarta.board, move);
  AppStateSurakarta.captures[mover] += move.captured.length;
  AppStateSurakarta.lastMove = { from: move.from, to: move.to };
  AppStateSurakarta.moveCount++;
  AppStateSurakarta.turn = SurakartaCore.otherColor(mover);
  updateSurakartaBoard();
  updateGameLabelsSurakarta();

  const end = SurakartaCore.detectGameEnd(AppStateSurakarta.board, AppStateSurakarta.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameSurakarta(end.winner);
    const reason = end.status === "no-pieces" ? "no pieces left" : "no legal moves";
    AppStateSurakarta.gameOver = true;
    announceGameResultSurakarta(resultTitleSurakarta(end.winner), winnerName + " wins (" + reason + ").");
    recordSurakartaStatsIfVsAi(end.winner === AppStateSurakarta.humanColor ? "win" : "loss");
    updateGameLabelsSurakarta();
    return;
  }

  const verb = move.type === "capture" ? " captured. " : " played. ";
  setStatusSurakarta("board-info", colorNameSurakarta(mover) + verb + colorNameSurakarta(AppStateSurakarta.turn) + " to move.");

  if (AppStateSurakarta.mode === "offline-ai" && !AppStateSurakarta.gameOver && AppStateSurakarta.turn !== AppStateSurakarta.humanColor) {
    setStatusSurakarta("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineSurakarta, 250);
  }
}

function aiMoveOfflineSurakarta() {
  if (AppStateSurakarta.mode !== "offline-ai" || AppStateSurakarta.gameOver) return;
  const aiColor = SurakartaCore.otherColor(AppStateSurakarta.humanColor);
  if (AppStateSurakarta.turn !== aiColor) return;

  const move = SurakartaAi.chooseMove(AppStateSurakarta.board, aiColor, AppStateSurakarta.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss

  pushUndoSnapshotSurakarta();
  applySurakartaMove(move);
}

function undoLastMove() {
  if (!AppStateSurakarta.undoStack || !AppStateSurakarta.undoStack.length) return;
  let prev = AppStateSurakarta.undoStack.pop();
  if (AppStateSurakarta.mode === "offline-ai") {
    while (prev.turn !== AppStateSurakarta.humanColor && AppStateSurakarta.undoStack.length) {
      prev = AppStateSurakarta.undoStack.pop();
    }
  }
  AppStateSurakarta.board = prev.board;
  AppStateSurakarta.turn = prev.turn;
  AppStateSurakarta.gameOver = prev.gameOver;
  AppStateSurakarta.moveCount = prev.moveCount;
  AppStateSurakarta.captures = prev.captures;
  AppStateSurakarta.lastMove = prev.lastMove;
  AppStateSurakarta.selected = null;
  setGameResultSurakarta("");
  updateSurakartaBoard();
  updateGameLabelsSurakarta();
  setStatusSurakarta("board-info", "Move undone.");
}

function showBoardSectionSurakarta() {
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
 * Percentage-based absolute positioning (same technique as Fanorona's/
 * Go's/Quoridor's/Hex's boards): points sit on a UNIT-spaced 6x6 grid
 * with a PAD margin on every side, plus an extra EXT margin beyond that
 * where the 4 corner loop-track arcs curve - so the SVG viewBox has to
 * be a little larger than just the point grid itself. Because the board
 * is square (6x6), width and height use the same total, unlike
 * Fanorona's 9x5 board.
 */
const SURAKARTA_UNIT = 100;
const SURAKARTA_PAD = 70;
const SURAKARTA_EXT = 50; // how far a loop-track stub/arc extends beyond the board edge
const SURAKARTA_TOTAL = (SurakartaCore.SIZE - 1) * SURAKARTA_UNIT + SURAKARTA_PAD * 2;
const SURAKARTA_POINT_SIZE = 62;

function surakartaPointX(c) {
  return SURAKARTA_PAD + c * SURAKARTA_UNIT;
}
function surakartaPointY(r) {
  return SURAKARTA_PAD + r * SURAKARTA_UNIT;
}
function surakartaPct(value) {
  return (value / SURAKARTA_TOTAL * 100) + "%";
}

// The 4 corner loop-track arcs, one entry per corner: rowPoint/colPoint
// are the [row, col] of the two board points that arc connects (the
// same pairing SurakartaCore.LOOP_EXITS encodes - see that file's
// header comment for the full reasoning), signX/signY say which way
// each stub extends off the board before the curve takes over.
const SURAKARTA_LOOP_CORNERS = [
  { rowPoint: [1, 0], colPoint: [0, 1], signX: -1, signY: -1 }, // top-left
  { rowPoint: [1, 5], colPoint: [0, 4], signX: 1, signY: -1 },  // top-right
  { rowPoint: [4, 0], colPoint: [5, 1], signX: -1, signY: 1 },  // bottom-left
  { rowPoint: [4, 5], colPoint: [5, 4], signX: 1, signY: 1 }    // bottom-right
];

const SVG_NS = "http://www.w3.org/2000/svg";

function buildSurakartaBoardDOM() {
  const boardEl = document.getElementById("surakarta-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "surakarta-lines");
  svg.setAttribute("viewBox", "0 0 " + SURAKARTA_TOTAL + " " + SURAKARTA_TOTAL);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  // Plain orthogonal grid lines (the board itself has no diagonal
  // lines drawn, even though diagonal quiet moves are legal - see
  // surakarta-core.js's header comment).
  const SIZE = SurakartaCore.SIZE;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c < SIZE - 1) {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", surakartaPointX(c));
        line.setAttribute("y1", surakartaPointY(r));
        line.setAttribute("x2", surakartaPointX(c + 1));
        line.setAttribute("y2", surakartaPointY(r));
        svg.appendChild(line);
      }
      if (r < SIZE - 1) {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", surakartaPointX(c));
        line.setAttribute("y1", surakartaPointY(r));
        line.setAttribute("x2", surakartaPointX(c));
        line.setAttribute("y2", surakartaPointY(r + 1));
        svg.appendChild(line);
      }
    }
  }

  // The 4 corner loop-track arcs: a short straight stub from the
  // board's own edge point, then a curved (quadratic Bezier) arc
  // connecting the row-side stub to the column-side stub, approximating
  // the real board's rounded corner loops - see the file header and
  // surakarta-core.js for the exact connectivity this represents.
  SURAKARTA_LOOP_CORNERS.forEach((corner) => {
    const rowPx = surakartaPointX(corner.rowPoint[1]);
    const rowPy = surakartaPointY(corner.rowPoint[0]);
    const rowStubX = rowPx + corner.signX * SURAKARTA_EXT;
    const rowStubY = rowPy;

    const colPx = surakartaPointX(corner.colPoint[1]);
    const colPy = surakartaPointY(corner.colPoint[0]);
    const colStubX = colPx;
    const colStubY = colPy + corner.signY * SURAKARTA_EXT;

    const stubRow = document.createElementNS(SVG_NS, "line");
    stubRow.setAttribute("class", "surakarta-loop-stub");
    stubRow.setAttribute("x1", rowPx);
    stubRow.setAttribute("y1", rowPy);
    stubRow.setAttribute("x2", rowStubX);
    stubRow.setAttribute("y2", rowStubY);
    svg.appendChild(stubRow);

    const stubCol = document.createElementNS(SVG_NS, "line");
    stubCol.setAttribute("class", "surakarta-loop-stub");
    stubCol.setAttribute("x1", colPx);
    stubCol.setAttribute("y1", colPy);
    stubCol.setAttribute("x2", colStubX);
    stubCol.setAttribute("y2", colStubY);
    svg.appendChild(stubCol);

    const arc = document.createElementNS(SVG_NS, "path");
    arc.setAttribute("class", "surakarta-loop-arc");
    const d = "M " + rowStubX + " " + rowStubY +
      " Q " + rowStubX + " " + colStubY + " " + colStubX + " " + colStubY;
    arc.setAttribute("d", d);
    svg.appendChild(arc);
  });

  boardEl.appendChild(svg);

  for (let i = 0; i < SurakartaCore.TOTAL_POINTS; i++) {
    const r = SurakartaCore.rowOf(i), c = SurakartaCore.colOf(i);
    const point = document.createElement("button");
    point.type = "button";
    point.className = "surakarta-point";
    point.style.left = surakartaPct(surakartaPointX(c));
    point.style.top = surakartaPct(surakartaPointY(r));
    point.style.width = surakartaPct(SURAKARTA_POINT_SIZE);
    point.style.height = surakartaPct(SURAKARTA_POINT_SIZE);
    point.dataset.point = i;
    const piece = document.createElement("span");
    piece.className = "surakarta-piece";
    point.appendChild(piece);
    point.addEventListener("click", () => onSurakartaPointClick(i));
    boardEl.appendChild(point);
  }

  ensureSurakartaBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSurakartaBoardAspect);
  } else {
    setTimeout(ensureSurakartaBoardAspect, 0);
  }
  ensureSurakartaResizeHandler();
}

let einkSurakartaResizeHandlerAttached = false;
let einkSurakartaResizeTimeoutId = null;

function ensureSurakartaBoardAspect() {
  const boardEl = document.getElementById("surakarta-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px"; // board is square (6x6)
}

function ensureSurakartaResizeHandler() {
  if (einkSurakartaResizeHandlerAttached) return;
  einkSurakartaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSurakartaResizeTimeoutId !== null) clearTimeout(einkSurakartaResizeTimeoutId);
    einkSurakartaResizeTimeoutId = setTimeout(() => {
      einkSurakartaResizeTimeoutId = null;
      ensureSurakartaBoardAspect();
    }, 150);
  });
}

function updateSurakartaBoard() {
  const boardEl = document.getElementById("surakarta-board");
  if (!boardEl) return;

  const board = AppStateSurakarta.board;
  const turn = AppStateSurakarta.turn;

  let quietSet = new Set();
  let captureSet = new Set();
  let activeIndex = null;

  if (!AppStateSurakarta.gameOver) {
    if (AppStateSurakarta.selected !== null && isHumanTurnSurakarta()) {
      activeIndex = AppStateSurakarta.selected;
      const legalMoves = SurakartaCore.getLegalMoves(board, turn);
      legalMoves.filter((m) => m.from === AppStateSurakarta.selected).forEach((m) => {
        if (m.type === "capture") captureSet.add(m.to);
        else quietSet.add(m.to);
      });
    } else if (isHumanTurnSurakarta()) {
      const legalMoves = SurakartaCore.getLegalMoves(board, turn);
      legalMoves.forEach((m) => {
        if (m.type === "capture") captureSet.add(m.from);
        else quietSet.add(m.from);
      });
    }
  }

  boardEl.querySelectorAll(".surakarta-point").forEach((pt) => {
    const i = parseInt(pt.dataset.point, 10);
    const piece = board[i];
    const pieceEl = pt.querySelector(".surakarta-piece");
    if (pieceEl) {
      pieceEl.classList.remove("surakarta-piece-black", "surakarta-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "surakarta-piece-black" : "surakarta-piece-white");
    }

    const isActive = activeIndex === i;
    const isCapturable = captureSet.has(i);
    pt.classList.toggle("surakarta-point-selected", isActive);
    pt.classList.toggle("surakarta-point-movable", quietSet.has(i) || isCapturable);
    pt.classList.toggle("surakarta-point-capturable", isCapturable);
    pt.classList.toggle("last-move", !!(AppStateSurakarta.lastMove &&
      (AppStateSurakarta.lastMove.from === i || AppStateSurakarta.lastMove.to === i)));

    const r = SurakartaCore.rowOf(i), c = SurakartaCore.colOf(i);
    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece === "b" ? "Black" : "White") + " piece";
    } else {
      label += ", empty";
    }
    if (isActive) label += ", selected";
    else if (isCapturable) label += ", capture available";
    else if (quietSet.has(i)) label += ", movable";
    pt.setAttribute("aria-label", label);
  });

  ensureSurakartaBoardAspect();
  updateScoreLineSurakarta();
}

function updateScoreLineSurakarta() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateSurakarta.moveCount > 0 || AppStateSurakarta.captures.b > 0 || AppStateSurakarta.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  capturesEl.textContent = "Captured – Black: " + AppStateSurakarta.captures.b + " · White: " + AppStateSurakarta.captures.w;
}

function updateGameLabelsSurakarta() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateSurakarta.moveCount ? "Move " + AppStateSurakarta.moveCount : "";
  updateUndoButtonVisibilitySurakarta();
  updateResignVisibilitySurakarta();

  if (AppStateSurakarta.gameOver) clearSavedSurakartaGame();
  else saveSurakartaGame();
}

function updateUndoButtonVisibilitySurakarta() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSurakarta.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSurakarta.gameOver));
}

function updateResignVisibilitySurakarta() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateSurakarta.gameOver);
}

document.addEventListener("DOMContentLoaded", initSurakartaApp);
