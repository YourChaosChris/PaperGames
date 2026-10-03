// marblepush-app.js
// Wires MarblePushCore/MarblePushAi to the marblepush.html UI. The board is a
// 61-cell hexagon (rows of 5,6,7,8,9,8,7,6,5), rendered with the same
// percentage-based absolute-positioning technique used for Fanorona/
// Hex/Go (a JS-enforced non-square aspect ratio, computed from the
// hex-grid geometry below), with each cell a plain circular button -
// the marbles themselves are what's hexagonal about this game, not
// the cells, so round buttons (as Fanorona/Go already use) read just
// as clearly on e-ink as a true hexagon tiling and are far simpler to
// get pixel-perfect on an old WebView.
//
// MarblePush's move model needs its own interaction style beyond plain
// tap-to-select-then-tap-to-move, since a move can involve 1-3 of the
// player's own marbles selected one at a time:
//   - Tapping an own marble starts or extends the current selection
//     (AppStateMarblePush.selected, an array of up to 3 cell indices in
//     click order). Extending only succeeds if the new marble keeps
//     the selection a straight contiguous line (MarblePushCore.resolveGroup
//     validates this); otherwise the tap starts a fresh selection.
//     Tapping the sole selected marble again clears the selection.
//   - Once 1-3 marbles are selected, every legal destination for that
//     exact group is highlighted (MarblePushCore.moveNewCells gives the
//     cell(s) that actually change for each move); tapping one of them
//     plays that move immediately, including a sumito push into an
//     enemy-occupied cell.

const AppStateMarblePush = {
  mode: "offline",        // "offline" | "offline-ai"
  board: MarblePushCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - Black moves first
  selected: [],           // 0-3 cell indices, in click order
  lastMove: null,         // { from: [idx,...], to: [idx,...] } for highlighting
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const MARBLEPUSH_SAVE_KEY = "einkchess_save_marblepush";

function saveMarblePushGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MARBLEPUSH_SAVE_KEY, {
    mode: AppStateMarblePush.mode,
    board: AppStateMarblePush.board,
    turn: AppStateMarblePush.turn,
    lastMove: AppStateMarblePush.lastMove,
    humanColor: AppStateMarblePush.humanColor,
    aiLevel: AppStateMarblePush.aiLevel,
    moveCount: AppStateMarblePush.moveCount
  });
}

function clearSavedMarblePushGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MARBLEPUSH_SAVE_KEY);
}

function recordMarblePushStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateMarblePush.mode !== "offline-ai") return;
  GameStats.record("marblepush", outcome);
}

function colorNameMarblePush(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusMarblePush(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultMarblePush(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleMarblePush(winner) {
  if (AppStateMarblePush.mode === "offline-ai") {
    return winner === AppStateMarblePush.humanColor ? "You win!" : "You lose";
  }
  return colorNameMarblePush(winner) + " wins";
}

function announceGameResultMarblePush(resultCode, message) {
  setGameResultMarblePush(message);
  setStatusMarblePush("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackMarblePush() {
  AppStateMarblePush.undoStack = [];
}

function pushUndoSnapshotMarblePush() {
  AppStateMarblePush.undoStack.push({
    board: MarblePushCore.cloneBoard(AppStateMarblePush.board),
    turn: AppStateMarblePush.turn,
    gameOver: AppStateMarblePush.gameOver,
    moveCount: AppStateMarblePush.moveCount,
    lastMove: AppStateMarblePush.lastMove
  });
}

function initMarblePushApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("marblepush-color-choice");
  const levelInline = document.getElementById("marblepush-level-inline");
  const startGameBtn = document.getElementById("start-marblepush-game");
  const resignBtn = document.getElementById("resign-button");
  const clearSelectionBtn = document.getElementById("marblepush-clear-selection-btn");

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
    AppStateMarblePush.mode = mode;
    AppStateMarblePush.board = MarblePushCore.createInitialBoard();
    AppStateMarblePush.turn = "b";
    AppStateMarblePush.selected = [];
    AppStateMarblePush.lastMove = null;
    AppStateMarblePush.humanColor = humanColor;
    AppStateMarblePush.aiLevel = level;
    AppStateMarblePush.gameOver = false;
    AppStateMarblePush.moveCount = 0;
    resetUndoStackMarblePush();
    setGameResultMarblePush("");
    showBoardSectionMarblePush();
    buildMarblePushBoardDOM();
    updateMarblePushBoard();
    updateGameLabelsMarblePush();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusMarblePush("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineMarblePush, AiPacing.delay(250));
    } else {
      setStatusMarblePush("board-info", colorNameMarblePush(AppStateMarblePush.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateMarblePush.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusMarblePush("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='marblepush-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "white" ? "w" : "b", ["b", "w"]);

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "b", 0);
      setStatusMarblePush("offline-marblepush-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusMarblePush("offline-marblepush-status",
      RandomStart.label("You play " + colorNameMarblePush(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateMarblePush.gameOver) return;
      const loser = AppStateMarblePush.turn;
      const winner = MarblePushCore.otherColor(loser);
      AppStateMarblePush.gameOver = true;
      AppStateMarblePush.selected = [];
      announceGameResultMarblePush(resultTitleMarblePush(winner), colorNameMarblePush(winner) + " wins by resignation.");
      recordMarblePushStatsIfVsAi("loss");
      updateGameLabelsMarblePush();
    });
  }

  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener("click", () => {
      AppStateMarblePush.selected = [];
      updateMarblePushBoard();
      setStatusMarblePush("board-info", colorNameMarblePush(AppStateMarblePush.turn) + " to move.");
    });
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(MARBLEPUSH_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateMarblePush.mode = savedGame.mode;
    AppStateMarblePush.board = savedGame.board;
    AppStateMarblePush.turn = savedGame.turn;
    AppStateMarblePush.selected = [];
    AppStateMarblePush.lastMove = savedGame.lastMove;
    AppStateMarblePush.humanColor = savedGame.humanColor;
    AppStateMarblePush.aiLevel = savedGame.aiLevel;
    AppStateMarblePush.moveCount = savedGame.moveCount;
    AppStateMarblePush.gameOver = false;
    resetUndoStackMarblePush();
    setActiveModeButton(AppStateMarblePush.mode);
    setGameResultMarblePush("");
    showBoardSectionMarblePush();
    buildMarblePushBoardDOM();
    updateMarblePushBoard();
    updateGameLabelsMarblePush();
    if (AppStateMarblePush.mode === "offline-ai" && AppStateMarblePush.turn !== AppStateMarblePush.humanColor) {
      setStatusMarblePush("board-info", "Computer thinking…");
      setTimeout(aiMoveOfflineMarblePush, AiPacing.delay(250));
    } else {
      setStatusMarblePush("board-info", colorNameMarblePush(AppStateMarblePush.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching kakuro.html's behavior.
}

function isHumanTurnMarblePush() {
  if (AppStateMarblePush.gameOver) return false;
  if (AppStateMarblePush.mode === "offline-ai" && AppStateMarblePush.turn !== AppStateMarblePush.humanColor) return false;
  return true;
}

// The moves currently available to the exact group the player has
// selected so far (empty if the current selection isn't itself a
// valid contiguous line of the mover's own marbles).
function currentSelectionMoves() {
  const sel = AppStateMarblePush.selected;
  if (!sel.length) return [];
  const group = MarblePushCore.resolveGroup(AppStateMarblePush.board, AppStateMarblePush.turn, sel);
  if (!group) return [];
  return MarblePushCore.getGroupMoves(AppStateMarblePush.board, AppStateMarblePush.turn, group);
}

function onMarblePushCellClick(i) {
  if (AppStateMarblePush.gameOver) {
    setStatusMarblePush("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnMarblePush()) {
    setStatusMarblePush("board-info", "Computer to move.");
    return;
  }

  const board = AppStateMarblePush.board;
  const turn = AppStateMarblePush.turn;

  // First: does this tap land on a legal destination for the current
  // selection? If so, just play that move regardless of what's on i.
  const movesNow = currentSelectionMoves();
  for (const m of movesNow) {
    const destCells = MarblePushCore.moveNewCells(m);
    if (destCells.indexOf(i) !== -1) {
      playMarblePushMove(m);
      return;
    }
  }

  if (board[i] === turn) {
    const sel = AppStateMarblePush.selected;
    if (sel.indexOf(i) !== -1) {
      // Tapping a marble already in the selection: clear back to just
      // that marble (or clear entirely if it was the only one).
      AppStateMarblePush.selected = sel.length === 1 ? [] : [i];
    } else if (sel.length < 3) {
      const candidate = sel.concat([i]);
      const group = MarblePushCore.resolveGroup(board, turn, candidate);
      AppStateMarblePush.selected = group ? candidate : [i];
    } else {
      AppStateMarblePush.selected = [i];
    }
    updateMarblePushBoard();
    return;
  }

  // Tapped an empty or enemy cell that isn't a legal destination.
  if (AppStateMarblePush.selected.length) {
    AppStateMarblePush.selected = [];
    updateMarblePushBoard();
    setStatusMarblePush("board-info", "Invalid move.");
  }
}

function playMarblePushMove(move) {
  pushUndoSnapshotMarblePush();
  const mover = AppStateMarblePush.turn;
  const newCells = MarblePushCore.moveNewCells(move);
  AppStateMarblePush.board = MarblePushCore.applyMove(AppStateMarblePush.board, mover, move);
  AppStateMarblePush.lastMove = { from: move.cells.slice(), to: newCells };
  AppStateMarblePush.selected = [];
  AppStateMarblePush.moveCount++;
  AppStateMarblePush.turn = MarblePushCore.otherColor(mover);
  updateMarblePushBoard();
  updateGameLabelsMarblePush();

  const end = MarblePushCore.detectGameEnd(AppStateMarblePush.board, AppStateMarblePush.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameMarblePush(end.winner);
    const reason = end.status === "marbles" ? "6 marbles pushed off the board" : "no legal moves";
    AppStateMarblePush.gameOver = true;
    announceGameResultMarblePush(resultTitleMarblePush(end.winner), winnerName + " wins (" + reason + ").");
    recordMarblePushStatsIfVsAi(end.winner === AppStateMarblePush.humanColor ? "win" : "loss");
    updateGameLabelsMarblePush();
    return;
  }

  // After a push-off, name the score too: whose marble went and how
  // many of the 6 that side has lost so far.
  let capturedNote = "";
  if (move.capturedCount > 0) {
    const victim = MarblePushCore.otherColor(mover);
    const lost = MarblePushCore.PIECES_PER_PLAYER - MarblePushCore.countColor(AppStateMarblePush.board, victim);
    capturedNote = " Marble pushed off – " + colorNameMarblePush(victim) + ": " + lost + " of 6 lost.";
  }
  setStatusMarblePush("board-info", colorNameMarblePush(mover) + " played." + capturedNote + " " + colorNameMarblePush(AppStateMarblePush.turn) + " to move.");

  if (AppStateMarblePush.mode === "offline-ai" && !AppStateMarblePush.gameOver && AppStateMarblePush.turn !== AppStateMarblePush.humanColor) {
    setStatusMarblePush("board-info", "Computer thinking…");
    setTimeout(aiMoveOfflineMarblePush, AiPacing.delay(300));
  }
}

function aiMoveOfflineMarblePush() {
  if (AppStateMarblePush.mode !== "offline-ai" || AppStateMarblePush.gameOver) return;
  const aiColor = MarblePushCore.otherColor(AppStateMarblePush.humanColor);
  if (AppStateMarblePush.turn !== aiColor) return;

  const move = MarblePushAi.chooseMove(AppStateMarblePush.board, aiColor, AppStateMarblePush.aiLevel);
  if (!move) return; // detectGameEnd after the human's move already caught a no-moves loss
  playMarblePushMove(move);
}

function undoLastMove() {
  if (!AppStateMarblePush.undoStack || !AppStateMarblePush.undoStack.length) return;
  let prev = AppStateMarblePush.undoStack.pop();
  if (AppStateMarblePush.mode === "offline-ai") {
    while (prev.turn !== AppStateMarblePush.humanColor && AppStateMarblePush.undoStack.length) {
      prev = AppStateMarblePush.undoStack.pop();
    }
  }
  AppStateMarblePush.board = prev.board;
  AppStateMarblePush.turn = prev.turn;
  AppStateMarblePush.gameOver = prev.gameOver;
  AppStateMarblePush.moveCount = prev.moveCount;
  AppStateMarblePush.lastMove = prev.lastMove;
  AppStateMarblePush.selected = [];
  setGameResultMarblePush("");
  updateMarblePushBoard();
  updateGameLabelsMarblePush();
  setStatusMarblePush("board-info", "Move undone.");
}

function showBoardSectionMarblePush() {
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
 * exactly what produces the classic "hexagon of hexagons" MarblePush
 * board shape - rows of 5,6,7,8,9,8,7,6,5 each offset by half a cell
 * from the one above/below. The bounding box of all 61 cells is
 * computed once to size the SVG-free div board and to convert each
 * cell's position to a percentage, so the whole thing scales with the
 * container; the container's own height is then JS-enforced from its
 * measured width (see ensureMarblePushBoardAspect) since `aspect-ratio`
 * is unreliable on E-Ink browsers.
 */
const MARBLEPUSH_UNIT = 100;
const MARBLEPUSH_PAD = 60;
const MARBLEPUSH_CELL_SIZE = 68;

function marblepushPx(i) {
  const c = MarblePushCore.CELLS[i];
  return MARBLEPUSH_UNIT * Math.sqrt(3) * (c.x + c.z / 2);
}
function marblepushPy(i) {
  const c = MarblePushCore.CELLS[i];
  return MARBLEPUSH_UNIT * 1.5 * c.z;
}

const MARBLEPUSH_GEOMETRY = (function () {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < MarblePushCore.TOTAL_CELLS; i++) {
    const px = marblepushPx(i), py = marblepushPy(i);
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }
  const totalW = (maxX - minX) + MARBLEPUSH_PAD * 2;
  const totalH = (maxY - minY) + MARBLEPUSH_PAD * 2;
  return { minX, minY, totalW, totalH, aspect: totalH / totalW };
})();

function marblepushPct(value, total) {
  return (value / total * 100) + "%";
}

function buildMarblePushBoardDOM() {
  const boardEl = document.getElementById("marblepush-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let i = 0; i < MarblePushCore.TOTAL_CELLS; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "marblepush-cell";
    const left = marblepushPx(i) - MARBLEPUSH_GEOMETRY.minX + MARBLEPUSH_PAD;
    const top = marblepushPy(i) - MARBLEPUSH_GEOMETRY.minY + MARBLEPUSH_PAD;
    cell.style.left = marblepushPct(left, MARBLEPUSH_GEOMETRY.totalW);
    cell.style.top = marblepushPct(top, MARBLEPUSH_GEOMETRY.totalH);
    cell.style.width = marblepushPct(MARBLEPUSH_CELL_SIZE, MARBLEPUSH_GEOMETRY.totalW);
    cell.style.height = marblepushPct(MARBLEPUSH_CELL_SIZE, MARBLEPUSH_GEOMETRY.totalH);
    cell.dataset.cell = i;

    const piece = document.createElement("span");
    piece.className = "marblepush-piece";
    cell.appendChild(piece);

    cell.addEventListener("click", () => onMarblePushCellClick(i));
    boardEl.appendChild(cell);
  }

  ensureMarblePushBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureMarblePushBoardAspect);
  } else {
    setTimeout(ensureMarblePushBoardAspect, 0);
  }
  ensureMarblePushResizeHandler();
}

let einkMarblePushResizeHandlerAttached = false;
let einkMarblePushResizeTimeoutId = null;

function ensureMarblePushBoardAspect() {
  const boardEl = document.getElementById("marblepush-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * MARBLEPUSH_GEOMETRY.aspect) + "px";
}

function ensureMarblePushResizeHandler() {
  if (einkMarblePushResizeHandlerAttached) return;
  einkMarblePushResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkMarblePushResizeTimeoutId !== null) clearTimeout(einkMarblePushResizeTimeoutId);
    einkMarblePushResizeTimeoutId = setTimeout(() => {
      einkMarblePushResizeTimeoutId = null;
      ensureMarblePushBoardAspect();
    }, 150);
  });
}

function updateMarblePushBoard() {
  const boardEl = document.getElementById("marblepush-board");
  if (!boardEl) return;

  const board = AppStateMarblePush.board;
  const turn = AppStateMarblePush.turn;
  const sel = AppStateMarblePush.selected;

  let highlightSet = new Set();
  let sumitoSet = new Set();
  if (!AppStateMarblePush.gameOver && isHumanTurnMarblePush()) {
    if (sel.length) {
      currentSelectionMoves().forEach((m) => {
        MarblePushCore.moveNewCells(m).forEach((c) => {
          highlightSet.add(c);
          if (m.capturedCount > 0 || board[c] !== null) sumitoSet.add(c);
        });
      });
    } else {
      MarblePushCore.getLegalMoves(board, turn).forEach((m) => {
        m.cells.forEach((c) => highlightSet.add(c));
      });
    }
  }

  boardEl.querySelectorAll(".marblepush-cell").forEach((cellEl) => {
    const i = parseInt(cellEl.dataset.cell, 10);
    const piece = board[i];
    const pieceEl = cellEl.querySelector(".marblepush-piece");
    if (pieceEl) {
      pieceEl.classList.remove("marblepush-piece-black", "marblepush-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "marblepush-piece-black" : "marblepush-piece-white");
    }

    const isSelected = sel.indexOf(i) !== -1;
    cellEl.classList.toggle("marblepush-cell-selected", isSelected);
    cellEl.classList.toggle("marblepush-cell-movable", highlightSet.has(i) && !isSelected);
    cellEl.classList.toggle("marblepush-cell-sumito", sumitoSet.has(i) && !isSelected);
    cellEl.classList.toggle("last-move", !!(AppStateMarblePush.lastMove &&
      (AppStateMarblePush.lastMove.from.indexOf(i) !== -1 || AppStateMarblePush.lastMove.to.indexOf(i) !== -1)));

    const c = MarblePushCore.CELLS[i];
    let label = "Row " + (c.row + 1) + ", position " + (c.col + 1);
    if (piece) label += ", " + (piece === "b" ? "Black" : "White") + " marble";
    else label += ", empty";
    if (isSelected) label += ", selected";
    else if (highlightSet.has(i)) label += ", movable";
    I18n.setAria(cellEl, label);
  });

  ensureMarblePushBoardAspect();
  updateMarblePushSelectionUI();
  updateScoreLineMarblePush();
}

function updateMarblePushSelectionUI() {
  const container = document.getElementById("marblepush-selection-controls");
  if (!container) return;
  const show = AppStateMarblePush.selected.length > 0 && !AppStateMarblePush.gameOver && isHumanTurnMarblePush();
  container.classList.toggle("hidden", !show);
}

function updateScoreLineMarblePush() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const lostB = MarblePushCore.PIECES_PER_PLAYER - MarblePushCore.countColor(AppStateMarblePush.board, "b");
  const lostW = MarblePushCore.PIECES_PER_PLAYER - MarblePushCore.countColor(AppStateMarblePush.board, "w");
  const active = AppStateMarblePush.moveCount > 0 || lostB > 0 || lostW > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Pushed off (of 6 to lose) – Black: " + lostB + " · White: " + lostW);
}

function updateGameLabelsMarblePush() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateMarblePush.moveCount ? "Move " + AppStateMarblePush.moveCount : "");
  updateUndoButtonVisibilityMarblePush();
  updateResignVisibilityMarblePush();

  if (AppStateMarblePush.gameOver) clearSavedMarblePushGame();
  else saveMarblePushGame();
}

function updateUndoButtonVisibilityMarblePush() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateMarblePush.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateMarblePush.gameOver));
}

function updateResignVisibilityMarblePush() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateMarblePush.gameOver);
}

document.addEventListener("DOMContentLoaded", initMarblePushApp);
