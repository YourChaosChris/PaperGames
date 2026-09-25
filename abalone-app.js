// abalone-app.js
// Wires AbaloneCore/AbaloneAi to the abalone.html UI. The board is a
// 61-cell hexagon (rows of 5,6,7,8,9,8,7,6,5), rendered with the same
// percentage-based absolute-positioning technique used for Fanorona/
// Hex/Go (a JS-enforced non-square aspect ratio, computed from the
// hex-grid geometry below), with each cell a plain circular button -
// the marbles themselves are what's hexagonal about this game, not
// the cells, so round buttons (as Fanorona/Go already use) read just
// as clearly on e-ink as a true hexagon tiling and are far simpler to
// get pixel-perfect on an old WebView.
//
// Abalone's move model needs its own interaction style beyond plain
// tap-to-select-then-tap-to-move, since a move can involve 1-3 of the
// player's own marbles selected one at a time:
//   - Tapping an own marble starts or extends the current selection
//     (AppStateAbalone.selected, an array of up to 3 cell indices in
//     click order). Extending only succeeds if the new marble keeps
//     the selection a straight contiguous line (AbaloneCore.resolveGroup
//     validates this); otherwise the tap starts a fresh selection.
//     Tapping the sole selected marble again clears the selection.
//   - Once 1-3 marbles are selected, every legal destination for that
//     exact group is highlighted (AbaloneCore.moveNewCells gives the
//     cell(s) that actually change for each move); tapping one of them
//     plays that move immediately, including a sumito push into an
//     enemy-occupied cell.

const AppStateAbalone = {
  mode: "offline",        // "offline" | "offline-ai"
  board: AbaloneCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black moves first
  selected: [],           // 0-3 cell indices, in click order
  lastMove: null,         // { from: [idx,...], to: [idx,...] } for highlighting
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const ABALONE_SAVE_KEY = "einkchess_save_abalone";

function saveAbaloneGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(ABALONE_SAVE_KEY, {
    mode: AppStateAbalone.mode,
    board: AppStateAbalone.board,
    turn: AppStateAbalone.turn,
    lastMove: AppStateAbalone.lastMove,
    humanColor: AppStateAbalone.humanColor,
    aiLevel: AppStateAbalone.aiLevel,
    moveCount: AppStateAbalone.moveCount
  });
}

function clearSavedAbaloneGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(ABALONE_SAVE_KEY);
}

function recordAbaloneStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateAbalone.mode !== "offline-ai") return;
  GameStats.record("abalone", outcome);
}

function colorNameAbalone(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusAbalone(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultAbalone(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleAbalone(winner) {
  if (AppStateAbalone.mode === "offline-ai") {
    return winner === AppStateAbalone.humanColor ? "You win!" : "You lose";
  }
  return colorNameAbalone(winner) + " wins";
}

function announceGameResultAbalone(resultCode, message) {
  setGameResultAbalone(message);
  setStatusAbalone("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackAbalone() {
  AppStateAbalone.undoStack = [];
}

function pushUndoSnapshotAbalone() {
  AppStateAbalone.undoStack.push({
    board: AbaloneCore.cloneBoard(AppStateAbalone.board),
    turn: AppStateAbalone.turn,
    gameOver: AppStateAbalone.gameOver,
    moveCount: AppStateAbalone.moveCount,
    lastMove: AppStateAbalone.lastMove
  });
}

function initAbaloneApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("abalone-color-choice");
  const levelInline = document.getElementById("abalone-level-inline");
  const startGameBtn = document.getElementById("start-abalone-game");
  const resignBtn = document.getElementById("resign-button");
  const clearSelectionBtn = document.getElementById("abalone-clear-selection-btn");

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
    AppStateAbalone.mode = mode;
    AppStateAbalone.board = AbaloneCore.createInitialBoard();
    AppStateAbalone.turn = "b";
    AppStateAbalone.selected = [];
    AppStateAbalone.lastMove = null;
    AppStateAbalone.humanColor = humanColor;
    AppStateAbalone.aiLevel = level;
    AppStateAbalone.gameOver = false;
    AppStateAbalone.moveCount = 0;
    resetUndoStackAbalone();
    setGameResultAbalone("");
    showBoardSectionAbalone();
    buildAbaloneBoardDOM();
    updateAbaloneBoard();
    updateGameLabelsAbalone();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusAbalone("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineAbalone, 250);
    } else {
      setStatusAbalone("board-info", colorNameAbalone(AppStateAbalone.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateAbalone.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusAbalone("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='abalone-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "b", 0);
      setStatusAbalone("offline-abalone-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusAbalone("offline-abalone-status",
      "You play " + colorNameAbalone(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateAbalone.gameOver) return;
      const loser = AppStateAbalone.turn;
      const winner = AbaloneCore.otherColor(loser);
      AppStateAbalone.gameOver = true;
      AppStateAbalone.selected = [];
      announceGameResultAbalone(resultTitleAbalone(winner), colorNameAbalone(winner) + " wins by resignation.");
      recordAbaloneStatsIfVsAi("loss");
      updateGameLabelsAbalone();
    });
  }

  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener("click", () => {
      AppStateAbalone.selected = [];
      updateAbaloneBoard();
      setStatusAbalone("board-info", colorNameAbalone(AppStateAbalone.turn) + " to move.");
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(ABALONE_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateAbalone.mode = savedGame.mode;
    AppStateAbalone.board = savedGame.board;
    AppStateAbalone.turn = savedGame.turn;
    AppStateAbalone.selected = [];
    AppStateAbalone.lastMove = savedGame.lastMove;
    AppStateAbalone.humanColor = savedGame.humanColor;
    AppStateAbalone.aiLevel = savedGame.aiLevel;
    AppStateAbalone.moveCount = savedGame.moveCount;
    AppStateAbalone.gameOver = false;
    resetUndoStackAbalone();
    setActiveModeButton(AppStateAbalone.mode);
    setGameResultAbalone("");
    showBoardSectionAbalone();
    buildAbaloneBoardDOM();
    updateAbaloneBoard();
    updateGameLabelsAbalone();
    if (AppStateAbalone.mode === "offline-ai" && AppStateAbalone.turn !== AppStateAbalone.humanColor) {
      setStatusAbalone("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineAbalone, 250);
    } else {
      setStatusAbalone("board-info", colorNameAbalone(AppStateAbalone.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching kakuro.html's behavior.
}

function isHumanTurnAbalone() {
  if (AppStateAbalone.gameOver) return false;
  if (AppStateAbalone.mode === "offline-ai" && AppStateAbalone.turn !== AppStateAbalone.humanColor) return false;
  return true;
}

// The moves currently available to the exact group the player has
// selected so far (empty if the current selection isn't itself a
// valid contiguous line of the mover's own marbles).
function currentSelectionMoves() {
  const sel = AppStateAbalone.selected;
  if (!sel.length) return [];
  const group = AbaloneCore.resolveGroup(AppStateAbalone.board, AppStateAbalone.turn, sel);
  if (!group) return [];
  return AbaloneCore.getGroupMoves(AppStateAbalone.board, AppStateAbalone.turn, group);
}

function onAbaloneCellClick(i) {
  if (AppStateAbalone.gameOver) {
    setStatusAbalone("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnAbalone()) {
    setStatusAbalone("board-info", "Computer to move.");
    return;
  }

  const board = AppStateAbalone.board;
  const turn = AppStateAbalone.turn;

  // First: does this tap land on a legal destination for the current
  // selection? If so, just play that move regardless of what's on i.
  const movesNow = currentSelectionMoves();
  for (const m of movesNow) {
    const destCells = AbaloneCore.moveNewCells(m);
    if (destCells.indexOf(i) !== -1) {
      playAbaloneMove(m);
      return;
    }
  }

  if (board[i] === turn) {
    const sel = AppStateAbalone.selected;
    if (sel.indexOf(i) !== -1) {
      // Tapping a marble already in the selection: clear back to just
      // that marble (or clear entirely if it was the only one).
      AppStateAbalone.selected = sel.length === 1 ? [] : [i];
    } else if (sel.length < 3) {
      const candidate = sel.concat([i]);
      const group = AbaloneCore.resolveGroup(board, turn, candidate);
      AppStateAbalone.selected = group ? candidate : [i];
    } else {
      AppStateAbalone.selected = [i];
    }
    updateAbaloneBoard();
    return;
  }

  // Tapped an empty or enemy cell that isn't a legal destination.
  if (AppStateAbalone.selected.length) {
    AppStateAbalone.selected = [];
    updateAbaloneBoard();
    setStatusAbalone("board-info", "Invalid move.");
  }
}

function playAbaloneMove(move) {
  pushUndoSnapshotAbalone();
  const mover = AppStateAbalone.turn;
  const newCells = AbaloneCore.moveNewCells(move);
  AppStateAbalone.board = AbaloneCore.applyMove(AppStateAbalone.board, mover, move);
  AppStateAbalone.lastMove = { from: move.cells.slice(), to: newCells };
  AppStateAbalone.selected = [];
  AppStateAbalone.moveCount++;
  AppStateAbalone.turn = AbaloneCore.otherColor(mover);
  updateAbaloneBoard();
  updateGameLabelsAbalone();

  const end = AbaloneCore.detectGameEnd(AppStateAbalone.board, AppStateAbalone.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameAbalone(end.winner);
    const reason = end.status === "marbles" ? "6 marbles pushed off the board" : "no legal moves";
    AppStateAbalone.gameOver = true;
    announceGameResultAbalone(resultTitleAbalone(end.winner), winnerName + " wins (" + reason + ").");
    recordAbaloneStatsIfVsAi(end.winner === AppStateAbalone.humanColor ? "win" : "loss");
    updateGameLabelsAbalone();
    return;
  }

  const capturedNote = move.capturedCount > 0 ? " Marble pushed off!" : "";
  setStatusAbalone("board-info", colorNameAbalone(mover) + " played." + capturedNote + " " + colorNameAbalone(AppStateAbalone.turn) + " to move.");

  if (AppStateAbalone.mode === "offline-ai" && !AppStateAbalone.gameOver && AppStateAbalone.turn !== AppStateAbalone.humanColor) {
    setStatusAbalone("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineAbalone, 300);
  }
}

function aiMoveOfflineAbalone() {
  if (AppStateAbalone.mode !== "offline-ai" || AppStateAbalone.gameOver) return;
  const aiColor = AbaloneCore.otherColor(AppStateAbalone.humanColor);
  if (AppStateAbalone.turn !== aiColor) return;

  const move = AbaloneAi.chooseMove(AppStateAbalone.board, aiColor, AppStateAbalone.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss
  playAbaloneMove(move);
}

function undoLastMove() {
  if (!AppStateAbalone.undoStack || !AppStateAbalone.undoStack.length) return;
  let prev = AppStateAbalone.undoStack.pop();
  if (AppStateAbalone.mode === "offline-ai") {
    while (prev.turn !== AppStateAbalone.humanColor && AppStateAbalone.undoStack.length) {
      prev = AppStateAbalone.undoStack.pop();
    }
  }
  AppStateAbalone.board = prev.board;
  AppStateAbalone.turn = prev.turn;
  AppStateAbalone.gameOver = prev.gameOver;
  AppStateAbalone.moveCount = prev.moveCount;
  AppStateAbalone.lastMove = prev.lastMove;
  AppStateAbalone.selected = [];
  setGameResultAbalone("");
  updateAbaloneBoard();
  updateGameLabelsAbalone();
  setStatusAbalone("board-info", "Move undone.");
}

function showBoardSectionAbalone() {
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
 * Percentage-based absolute positioning (the same technique as Go's/
 * Fanorona's/Hex's boards): every cell's pixel center comes from the
 * standard cube-coordinate-to-pixel formula for a flat-top hex grid
 * (px = sqrt(3)*(x + z/2), py = 1.5*z, both scaled by UNIT), which is
 * exactly what produces the classic "hexagon of hexagons" Abalone
 * board shape - rows of 5,6,7,8,9,8,7,6,5 each offset by half a cell
 * from the one above/below. The bounding box of all 61 cells is
 * computed once to size the SVG-free div board and to convert each
 * cell's position to a percentage, so the whole thing scales with the
 * container; the container's own height is then JS-enforced from its
 * measured width (see ensureAbaloneBoardAspect) since `aspect-ratio`
 * is unreliable on E-Ink browsers.
 */
const ABALONE_UNIT = 100;
const ABALONE_PAD = 60;
const ABALONE_CELL_SIZE = 68;

function abalonePx(i) {
  const c = AbaloneCore.CELLS[i];
  return ABALONE_UNIT * Math.sqrt(3) * (c.x + c.z / 2);
}
function abalonePy(i) {
  const c = AbaloneCore.CELLS[i];
  return ABALONE_UNIT * 1.5 * c.z;
}

const ABALONE_GEOMETRY = (function () {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < AbaloneCore.TOTAL_CELLS; i++) {
    const px = abalonePx(i), py = abalonePy(i);
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }
  const totalW = (maxX - minX) + ABALONE_PAD * 2;
  const totalH = (maxY - minY) + ABALONE_PAD * 2;
  return { minX, minY, totalW, totalH, aspect: totalH / totalW };
})();

function abalonePct(value, total) {
  return (value / total * 100) + "%";
}

function buildAbaloneBoardDOM() {
  const boardEl = document.getElementById("abalone-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let i = 0; i < AbaloneCore.TOTAL_CELLS; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "abalone-cell";
    const left = abalonePx(i) - ABALONE_GEOMETRY.minX + ABALONE_PAD;
    const top = abalonePy(i) - ABALONE_GEOMETRY.minY + ABALONE_PAD;
    cell.style.left = abalonePct(left, ABALONE_GEOMETRY.totalW);
    cell.style.top = abalonePct(top, ABALONE_GEOMETRY.totalH);
    cell.style.width = abalonePct(ABALONE_CELL_SIZE, ABALONE_GEOMETRY.totalW);
    cell.style.height = abalonePct(ABALONE_CELL_SIZE, ABALONE_GEOMETRY.totalH);
    cell.dataset.cell = i;

    const piece = document.createElement("span");
    piece.className = "abalone-piece";
    cell.appendChild(piece);

    cell.addEventListener("click", () => onAbaloneCellClick(i));
    boardEl.appendChild(cell);
  }

  ensureAbaloneBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureAbaloneBoardAspect);
  } else {
    setTimeout(ensureAbaloneBoardAspect, 0);
  }
  ensureAbaloneResizeHandler();
}

let einkAbaloneResizeHandlerAttached = false;
let einkAbaloneResizeTimeoutId = null;

function ensureAbaloneBoardAspect() {
  const boardEl = document.getElementById("abalone-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * ABALONE_GEOMETRY.aspect) + "px";
}

function ensureAbaloneResizeHandler() {
  if (einkAbaloneResizeHandlerAttached) return;
  einkAbaloneResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkAbaloneResizeTimeoutId !== null) clearTimeout(einkAbaloneResizeTimeoutId);
    einkAbaloneResizeTimeoutId = setTimeout(() => {
      einkAbaloneResizeTimeoutId = null;
      ensureAbaloneBoardAspect();
    }, 150);
  });
}

function updateAbaloneBoard() {
  const boardEl = document.getElementById("abalone-board");
  if (!boardEl) return;

  const board = AppStateAbalone.board;
  const turn = AppStateAbalone.turn;
  const sel = AppStateAbalone.selected;

  let highlightSet = new Set();
  let sumitoSet = new Set();
  if (!AppStateAbalone.gameOver && isHumanTurnAbalone()) {
    if (sel.length) {
      currentSelectionMoves().forEach((m) => {
        AbaloneCore.moveNewCells(m).forEach((c) => {
          highlightSet.add(c);
          if (m.capturedCount > 0 || board[c] !== null) sumitoSet.add(c);
        });
      });
    } else {
      AbaloneCore.getLegalMoves(board, turn).forEach((m) => {
        m.cells.forEach((c) => highlightSet.add(c));
      });
    }
  }

  boardEl.querySelectorAll(".abalone-cell").forEach((cellEl) => {
    const i = parseInt(cellEl.dataset.cell, 10);
    const piece = board[i];
    const pieceEl = cellEl.querySelector(".abalone-piece");
    if (pieceEl) {
      pieceEl.classList.remove("abalone-piece-black", "abalone-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "abalone-piece-black" : "abalone-piece-white");
    }

    const isSelected = sel.indexOf(i) !== -1;
    cellEl.classList.toggle("abalone-cell-selected", isSelected);
    cellEl.classList.toggle("abalone-cell-movable", highlightSet.has(i) && !isSelected);
    cellEl.classList.toggle("abalone-cell-sumito", sumitoSet.has(i) && !isSelected);
    cellEl.classList.toggle("last-move", !!(AppStateAbalone.lastMove &&
      (AppStateAbalone.lastMove.from.indexOf(i) !== -1 || AppStateAbalone.lastMove.to.indexOf(i) !== -1)));

    const c = AbaloneCore.CELLS[i];
    let label = "Row " + (c.row + 1) + ", position " + (c.col + 1);
    if (piece) label += ", " + (piece === "b" ? "Black" : "White") + " marble";
    else label += ", empty";
    if (isSelected) label += ", selected";
    else if (highlightSet.has(i)) label += ", movable";
    cellEl.setAttribute("aria-label", label);
  });

  ensureAbaloneBoardAspect();
  updateAbaloneSelectionUI();
  updateScoreLineAbalone();
}

function updateAbaloneSelectionUI() {
  const container = document.getElementById("abalone-selection-controls");
  if (!container) return;
  const show = AppStateAbalone.selected.length > 0 && !AppStateAbalone.gameOver && isHumanTurnAbalone();
  container.classList.toggle("hidden", !show);
}

function updateScoreLineAbalone() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const lostB = AbaloneCore.PIECES_PER_PLAYER - AbaloneCore.countColor(AppStateAbalone.board, "b");
  const lostW = AbaloneCore.PIECES_PER_PLAYER - AbaloneCore.countColor(AppStateAbalone.board, "w");
  const active = AppStateAbalone.moveCount > 0 || lostB > 0 || lostW > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  capturesEl.textContent = "Pushed off (of 6 to lose) – Black: " + lostB + " · White: " + lostW;
}

function updateGameLabelsAbalone() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateAbalone.moveCount ? "Move " + AppStateAbalone.moveCount : "";
  updateUndoButtonVisibilityAbalone();
  updateResignVisibilityAbalone();

  if (AppStateAbalone.gameOver) clearSavedAbaloneGame();
  else saveAbaloneGame();
}

function updateUndoButtonVisibilityAbalone() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateAbalone.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateAbalone.gameOver));
}

function updateResignVisibilityAbalone() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateAbalone.gameOver);
}

document.addEventListener("DOMContentLoaded", initAbaloneApp);
