// sternhalma-app.js
// Wires SternhalmaCore/SternhalmaAi to the sternhalma.html UI (Chinese
// Checkers). Unlike every square-board game here, this board is a
// six-pointed star, so - following hex-app.js's proven approach for
// Hex's non-rectangular rhombus board - it's rendered as absolutely
// positioned round buttons (percentage-based, so it resizes cleanly)
// rather than the usual float-grid, with a JS-enforced aspect ratio
// re-checked on resize (see ensureSternhalmaBoardAspectRatio below,
// the same technique as ensureHexBoardAspectRatio).
//
// Cells are addressed by cube coordinates [x, y, z] (x + y + z = 0)
// exactly as SternhalmaCore stores them - see that file for why a
// triangular lattice needs a third coordinate. Sides are told apart
// structurally, not by color alone (a filled disc for Player 1, an
// outlined one for Player 2), and each side's home/goal point gets a
// shaded background so it's clear at a glance where marbles still
// need to travel to - the same conventions as halma-app.js.
//
// Since a hop can chain several hops in one turn, clicking a marble
// highlights every hole it could end this turn on - a single step,
// or the landing point of any complete hop sequence (the player may
// stop earlier in a chain than the longest one available, and every
// stopping point is offered as its own distinct destination) - and
// clicking one of those directly makes that whole move.

const AppStateSternhalma = {
  mode: "offline",        // "offline" | "offline-ai"
  state: SternhalmaCore.createInitialState(),
  turn: "p1",             // "p1" | "p2" - p1 moves first
  selected: null,         // [x, y, z] | null
  legalTargets: {},       // "x,y,z" -> the move object, for the current selection
  lastMove: null,         // { from:[x,y,z], to:[x,y,z] } | null
  humanSide: "p1",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const STERNHALMA_SAVE_KEY = "einkchess_save_sternhalma";

function saveSternhalmaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(STERNHALMA_SAVE_KEY, {
    mode: AppStateSternhalma.mode,
    state: AppStateSternhalma.state,
    turn: AppStateSternhalma.turn,
    lastMove: AppStateSternhalma.lastMove,
    humanSide: AppStateSternhalma.humanSide,
    aiLevel: AppStateSternhalma.aiLevel,
    moveCount: AppStateSternhalma.moveCount
  });
}

function clearSavedSternhalmaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(STERNHALMA_SAVE_KEY);
}

function recordSternhalmaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateSternhalma.mode !== "offline-ai") return;
  GameStats.record("sternhalma", outcome);
}

function sideNameSternhalma(side) {
  return side === "p1" ? "Player 1" : "Player 2";
}

function setStatusSternhalma(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSternhalma(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleSternhalma(winner) {
  if (AppStateSternhalma.mode === "offline-ai") {
    return winner === AppStateSternhalma.humanSide ? "You win!" : "You lose";
  }
  return sideNameSternhalma(winner) + " wins";
}

function announceGameResultSternhalma(resultCode, message) {
  setGameResultSternhalma(message);
  setStatusSternhalma("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackSternhalma() {
  AppStateSternhalma.undoStack = [];
}

function pushUndoSnapshotSternhalma() {
  AppStateSternhalma.undoStack.push({
    state: SternhalmaCore.cloneState(AppStateSternhalma.state),
    turn: AppStateSternhalma.turn,
    gameOver: AppStateSternhalma.gameOver,
    moveCount: AppStateSternhalma.moveCount,
    lastMove: AppStateSternhalma.lastMove
  });
}

function initSternhalmaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("sternhalma-side-choice");
  const levelInline = document.getElementById("sternhalma-level-inline");
  const startGameBtn = document.getElementById("start-sternhalma-game");
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
    AppStateSternhalma.mode = mode;
    AppStateSternhalma.state = SternhalmaCore.createInitialState();
    AppStateSternhalma.turn = "p1";
    AppStateSternhalma.selected = null;
    AppStateSternhalma.legalTargets = {};
    AppStateSternhalma.lastMove = null;
    AppStateSternhalma.humanSide = humanSide;
    AppStateSternhalma.aiLevel = level;
    AppStateSternhalma.gameOver = false;
    AppStateSternhalma.moveCount = 0;
    resetUndoStackSternhalma();
    setGameResultSternhalma("");
    showBoardSectionSternhalma();
    buildSternhalmaBoardDOM();
    updateSternhalmaBoard();
    updateGameLabelsSternhalma();

    if (mode === "offline-ai" && humanSide !== "p1") {
      setStatusSternhalma("board-info", "Computer thinking…");
      setTimeout(aiTurnSternhalma, 300);
    } else {
      setStatusSternhalma("board-info", sideNameSternhalma(AppStateSternhalma.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateSternhalma.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusSternhalma("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='sternhalma-side']:checked");
    const humanSide = sideInput && sideInput.value === "p2" ? "p2" : "p1";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "p1", 0);
      setStatusSternhalma("offline-sternhalma-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusSternhalma("offline-sternhalma-status",
      "You play " + sideNameSternhalma(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateSternhalma.gameOver) return;
      const loser = AppStateSternhalma.turn;
      const winner = SternhalmaCore.otherPlayer(loser);
      AppStateSternhalma.gameOver = true;
      announceGameResultSternhalma(resultTitleSternhalma(winner), sideNameSternhalma(winner) + " wins by resignation.");
      recordSternhalmaStatsIfVsAi("loss");
      updateGameLabelsSternhalma();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(STERNHALMA_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateSternhalma.mode = savedGame.mode;
    AppStateSternhalma.state = savedGame.state;
    AppStateSternhalma.turn = savedGame.turn;
    AppStateSternhalma.selected = null;
    AppStateSternhalma.legalTargets = {};
    AppStateSternhalma.lastMove = savedGame.lastMove;
    AppStateSternhalma.humanSide = savedGame.humanSide;
    AppStateSternhalma.aiLevel = savedGame.aiLevel;
    AppStateSternhalma.moveCount = savedGame.moveCount;
    AppStateSternhalma.gameOver = false;
    resetUndoStackSternhalma();
    setActiveModeButton(AppStateSternhalma.mode);
    setGameResultSternhalma("");
    showBoardSectionSternhalma();
    buildSternhalmaBoardDOM();
    updateSternhalmaBoard();
    updateGameLabelsSternhalma();
    if (AppStateSternhalma.mode === "offline-ai" && AppStateSternhalma.turn !== AppStateSternhalma.humanSide) {
      setStatusSternhalma("board-info", "Computer thinking…");
      setTimeout(aiTurnSternhalma, 300);
    } else {
      setStatusSternhalma("board-info", sideNameSternhalma(AppStateSternhalma.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeySternhalma(x, y, z) {
  return SternhalmaCore.key(x, y, z);
}

function computeLegalTargetsSternhalma(from) {
  const targets = {};
  SternhalmaCore.getLegalMoves(AppStateSternhalma.state, AppStateSternhalma.turn)
    .filter((m) => m.from[0] === from[0] && m.from[1] === from[1] && m.from[2] === from[2])
    .forEach((m) => { targets[targetKeySternhalma(m.to[0], m.to[1], m.to[2])] = m; });
  return targets;
}

function onSternhalmaCellClick(x, y, z) {
  if (AppStateSternhalma.gameOver) {
    setStatusSternhalma("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateSternhalma.mode === "offline-ai" && AppStateSternhalma.turn !== AppStateSternhalma.humanSide) {
    setStatusSternhalma("board-info", "Computer to move.");
    return;
  }

  const piece = AppStateSternhalma.state.board[SternhalmaCore.key(x, y, z)];
  const turn = AppStateSternhalma.turn;
  const key = targetKeySternhalma(x, y, z);

  if (AppStateSternhalma.selected && AppStateSternhalma.legalTargets[key]) {
    applySternhalmaMove(AppStateSternhalma.legalTargets[key]);
    return;
  }

  if (piece === turn) {
    AppStateSternhalma.selected = [x, y, z];
    AppStateSternhalma.legalTargets = computeLegalTargetsSternhalma([x, y, z]);
    updateSternhalmaBoard();
    setStatusSternhalma("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateSternhalma.selected) {
    AppStateSternhalma.selected = null;
    AppStateSternhalma.legalTargets = {};
    updateSternhalmaBoard();
    setStatusSternhalma("board-info", sideNameSternhalma(turn) + " to move.");
  }
}

function applySternhalmaMove(move) {
  pushUndoSnapshotSternhalma();
  const mover = AppStateSternhalma.turn;
  AppStateSternhalma.state = SternhalmaCore.applyMove(AppStateSternhalma.state, mover, move);
  AppStateSternhalma.lastMove = { from: move.from, to: move.to };
  AppStateSternhalma.moveCount++;
  AppStateSternhalma.selected = null;
  AppStateSternhalma.legalTargets = {};
  AppStateSternhalma.turn = SternhalmaCore.otherPlayer(mover);
  updateSternhalmaBoard();
  updateGameLabelsSternhalma();

  if (AppStateSternhalma.state.gameOver) {
    AppStateSternhalma.gameOver = true;
    const winnerName = sideNameSternhalma(AppStateSternhalma.state.winner);
    announceGameResultSternhalma(resultTitleSternhalma(AppStateSternhalma.state.winner), winnerName + " wins by filling the opposite point!");
    recordSternhalmaStatsIfVsAi(AppStateSternhalma.state.winner === AppStateSternhalma.humanSide ? "win" : "loss");
    updateGameLabelsSternhalma();
    return;
  }

  setStatusSternhalma("board-info", sideNameSternhalma(mover) + " played. " + sideNameSternhalma(AppStateSternhalma.turn) + " to move.");

  if (AppStateSternhalma.mode === "offline-ai" && AppStateSternhalma.turn !== AppStateSternhalma.humanSide) {
    setStatusSternhalma("board-info", "Computer thinking…");
    setTimeout(aiTurnSternhalma, 350);
  }
}

function aiTurnSternhalma() {
  if (AppStateSternhalma.mode !== "offline-ai" || AppStateSternhalma.gameOver) return;
  const aiSide = SternhalmaCore.otherPlayer(AppStateSternhalma.humanSide);
  if (AppStateSternhalma.turn !== aiSide) return;

  const move = SternhalmaAi.chooseMove(AppStateSternhalma.state, aiSide, AppStateSternhalma.aiLevel);
  if (!move) return;
  applySternhalmaMove(move);
}

function undoLastMove() {
  if (!AppStateSternhalma.undoStack || !AppStateSternhalma.undoStack.length) return;
  let prev = AppStateSternhalma.undoStack.pop();
  if (AppStateSternhalma.mode === "offline-ai") {
    while (prev.turn !== AppStateSternhalma.humanSide && AppStateSternhalma.undoStack.length) {
      prev = AppStateSternhalma.undoStack.pop();
    }
  }
  AppStateSternhalma.state = prev.state;
  AppStateSternhalma.turn = prev.turn;
  AppStateSternhalma.gameOver = prev.gameOver;
  AppStateSternhalma.moveCount = prev.moveCount;
  AppStateSternhalma.lastMove = prev.lastMove;
  AppStateSternhalma.selected = null;
  AppStateSternhalma.legalTargets = {};
  setGameResultSternhalma("");
  updateSternhalmaBoard();
  updateGameLabelsSternhalma();
  setStatusSternhalma("board-info", "Move undone. " + sideNameSternhalma(AppStateSternhalma.turn) + " to move.");
}

function showBoardSectionSternhalma() {
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

/*** Board rendering: a six-pointed star of round holes via
     percentage-based absolute positioning (the same technique as
     Hex's board), with a JS-enforced non-square aspect ratio
     computed from the geometry below. ***/

// Cube coordinates [x, y, z] are converted to 2D pixel positions the
// standard way for a pointy-top triangular/hex lattice: treat (x, z)
// as axial coordinates (y is redundant since x+y+z=0). This places
// the "n" point (z very negative) at the top of the board and the
// "s" point (z very positive, this game's 2-player goal for "p1") at
// the bottom - a vertical top/bottom layout, matching how Halma's
// two camps sit in opposite corners.
const STERNHALMA_SQRT3 = Math.sqrt(3);
const STERNHALMA_MARGIN = 1.8;   // padding around the board, in the same units as the cells below
const STERNHALMA_CELL_DIAMETER = 1.55; // < the ~1.73 unit spacing between adjacent holes, so holes don't touch

function sternhalmaCellPixel(x, y, z) {
  return { px: STERNHALMA_SQRT3 * (x + z / 2), py: 1.5 * z };
}

const STERNHALMA_LAYOUT = (function () {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  SternhalmaCore.ALL_CELLS.forEach(([x, y, z]) => {
    const p = sternhalmaCellPixel(x, y, z);
    if (p.px < minX) minX = p.px;
    if (p.px > maxX) maxX = p.px;
    if (p.py < minY) minY = p.py;
    if (p.py > maxY) maxY = p.py;
  });
  const totalW = (maxX - minX) + STERNHALMA_MARGIN * 2;
  const totalH = (maxY - minY) + STERNHALMA_MARGIN * 2;
  const positions = {};
  SternhalmaCore.ALL_CELLS.forEach(([x, y, z]) => {
    const p = sternhalmaCellPixel(x, y, z);
    positions[SternhalmaCore.key(x, y, z)] = {
      leftPct: ((p.px - minX) + STERNHALMA_MARGIN) / totalW * 100,
      topPct: ((p.py - minY) + STERNHALMA_MARGIN) / totalH * 100
    };
  });
  return {
    positions,
    aspect: totalH / totalW,
    cellWidthPct: STERNHALMA_CELL_DIAMETER / totalW * 100,
    cellHeightPct: STERNHALMA_CELL_DIAMETER / totalH * 100
  };
})();

function sternhalmaHomeClassFor(x, y, z) {
  const k = SternhalmaCore.key(x, y, z);
  const isHomeP1 = SternhalmaCore.homePointCells("p1").some((c) => SternhalmaCore.key(c[0], c[1], c[2]) === k);
  if (isHomeP1) return "sternhalma-cell-home-p1";
  const isHomeP2 = SternhalmaCore.homePointCells("p2").some((c) => SternhalmaCore.key(c[0], c[1], c[2]) === k);
  if (isHomeP2) return "sternhalma-cell-home-p2";
  return null;
}

function buildSternhalmaBoardDOM() {
  const boardEl = document.getElementById("sternhalma-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  SternhalmaCore.ALL_CELLS.forEach(([x, y, z]) => {
    const key = SternhalmaCore.key(x, y, z);
    const pos = STERNHALMA_LAYOUT.positions[key];

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "sternhalma-cell";
    const homeClass = sternhalmaHomeClassFor(x, y, z);
    if (homeClass) cell.classList.add(homeClass);
    cell.style.left = (pos.leftPct - STERNHALMA_LAYOUT.cellWidthPct / 2) + "%";
    cell.style.top = (pos.topPct - STERNHALMA_LAYOUT.cellHeightPct / 2) + "%";
    cell.style.width = STERNHALMA_LAYOUT.cellWidthPct + "%";
    cell.style.height = STERNHALMA_LAYOUT.cellHeightPct + "%";
    cell.dataset.x = x;
    cell.dataset.y = y;
    cell.dataset.z = z;

    const marble = document.createElement("span");
    marble.className = "sternhalma-marble";
    cell.appendChild(marble);

    cell.addEventListener("click", () => onSternhalmaCellClick(x, y, z));
    boardEl.appendChild(cell);
  });

  ensureSternhalmaBoardAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSternhalmaBoardAspectRatio);
  } else {
    setTimeout(ensureSternhalmaBoardAspectRatio, 0);
  }
  ensureSternhalmaResizeHandler();
}

let einkSternhalmaResizeHandlerAttached = false;
let einkSternhalmaResizeTimeoutId = null;

function ensureSternhalmaBoardAspectRatio() {
  const boardEl = document.getElementById("sternhalma-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * STERNHALMA_LAYOUT.aspect) + "px";
}

function ensureSternhalmaResizeHandler() {
  if (einkSternhalmaResizeHandlerAttached) return;
  einkSternhalmaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSternhalmaResizeTimeoutId !== null) clearTimeout(einkSternhalmaResizeTimeoutId);
    einkSternhalmaResizeTimeoutId = setTimeout(() => {
      einkSternhalmaResizeTimeoutId = null;
      ensureSternhalmaBoardAspectRatio();
    }, 150);
  });
}

function updateSternhalmaBoard() {
  const boardEl = document.getElementById("sternhalma-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".sternhalma-cell").forEach((cell) => {
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    const z = parseInt(cell.dataset.z, 10);
    const key = SternhalmaCore.key(x, y, z);
    const piece = AppStateSternhalma.state.board[key];
    const marbleEl = cell.querySelector(".sternhalma-marble");
    if (marbleEl) {
      marbleEl.classList.remove("sternhalma-marble-p1", "sternhalma-marble-p2");
      if (piece) marbleEl.classList.add(piece === "p1" ? "sternhalma-marble-p1" : "sternhalma-marble-p2");
    }

    const isSelected = AppStateSternhalma.selected
      && AppStateSternhalma.selected[0] === x && AppStateSternhalma.selected[1] === y && AppStateSternhalma.selected[2] === z;
    cell.classList.toggle("selected", !!isSelected);
    cell.classList.toggle("sternhalma-cell-movable", !!AppStateSternhalma.legalTargets[key]);
    cell.classList.toggle("last-move", !!(AppStateSternhalma.lastMove &&
      ((AppStateSternhalma.lastMove.from[0] === x && AppStateSternhalma.lastMove.from[1] === y && AppStateSternhalma.lastMove.from[2] === z) ||
       (AppStateSternhalma.lastMove.to[0] === x && AppStateSternhalma.lastMove.to[1] === y && AppStateSternhalma.lastMove.to[2] === z))));

    let label = "Hole " + x + "," + y + "," + z;
    label += piece ? ", " + sideNameSternhalma(piece) : ", empty";
    cell.setAttribute("aria-label", label);
  });
}

function updateGameLabelsSternhalma() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateSternhalma.moveCount ? "Move " + AppStateSternhalma.moveCount : "";
  updateUndoButtonVisibilitySternhalma();
  updateResignVisibilitySternhalma();

  if (AppStateSternhalma.gameOver) clearSavedSternhalmaGame();
  else saveSternhalmaGame();
}

function updateUndoButtonVisibilitySternhalma() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSternhalma.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSternhalma.gameOver));
}

function updateResignVisibilitySternhalma() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateSternhalma.gameOver);
}

document.addEventListener("DOMContentLoaded", initSternhalmaApp);
