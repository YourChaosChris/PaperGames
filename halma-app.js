// halma-app.js
// Wires HalmaCore/HalmaAi to the halma.html UI. Board rendering is
// the standard per-square-button float-grid technique (a 10x10
// board, so .halma-square needs the usual explicit width override -
// the shared .square base class assumes 8 columns). Sides are told
// apart structurally, not by color alone: Player 1 is a filled disc,
// Player 2 an outlined disc, and each side's home/goal camp gets a
// shaded background so it's clear at a glance where pieces still
// need to travel to.
//
// Since a jump can chain several hops in one turn, clicking a piece
// highlights every square it could end this turn on - a single
// step, or the landing point of any complete jump sequence (the
// player may stop earlier in a chain than the longest one available,
// and every one of those stopping points is offered as its own
// distinct destination) - and clicking one of those directly makes
// that whole move.

const AppStateHalma = {
  mode: "offline",        // "offline" | "offline-ai"
  state: HalmaCore.createInitialState(),
  turn: "p1",             // "p1" | "p2" - p1 moves first
  selected: null,         // [r, c] | null
  legalTargets: {},       // "r,c" -> the move object, for the current selection
  lastMove: null,         // { from:[r,c], to:[r,c] } | null
  humanSide: "p1",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const HALMA_SAVE_KEY = "einkchess_save_halma";

function saveHalmaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(HALMA_SAVE_KEY, {
    mode: AppStateHalma.mode,
    state: AppStateHalma.state,
    turn: AppStateHalma.turn,
    lastMove: AppStateHalma.lastMove,
    humanSide: AppStateHalma.humanSide,
    aiLevel: AppStateHalma.aiLevel,
    moveCount: AppStateHalma.moveCount
  });
}

function clearSavedHalmaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(HALMA_SAVE_KEY);
}

function recordHalmaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateHalma.mode !== "offline-ai") return;
  GameStats.record("halma", outcome);
}

function sideNameHalma(side) {
  return side === "p1" ? "Player 1" : "Player 2";
}

function setStatusHalma(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultHalma(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleHalma(winner) {
  if (AppStateHalma.mode === "offline-ai") {
    return winner === AppStateHalma.humanSide ? "You win!" : "You lose";
  }
  return sideNameHalma(winner) + " wins";
}

function announceGameResultHalma(resultCode, message) {
  setGameResultHalma(message);
  setStatusHalma("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackHalma() {
  AppStateHalma.undoStack = [];
}

function pushUndoSnapshotHalma() {
  AppStateHalma.undoStack.push({
    state: HalmaCore.cloneState(AppStateHalma.state),
    turn: AppStateHalma.turn,
    gameOver: AppStateHalma.gameOver,
    moveCount: AppStateHalma.moveCount,
    lastMove: AppStateHalma.lastMove
  });
}

function initHalmaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("halma-side-choice");
  const levelInline = document.getElementById("halma-level-inline");
  const startGameBtn = document.getElementById("start-halma-game");
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
    AppStateHalma.mode = mode;
    AppStateHalma.state = HalmaCore.createInitialState();
    AppStateHalma.turn = "p1";
    AppStateHalma.selected = null;
    AppStateHalma.legalTargets = {};
    AppStateHalma.lastMove = null;
    AppStateHalma.humanSide = humanSide;
    AppStateHalma.aiLevel = level;
    AppStateHalma.gameOver = false;
    AppStateHalma.moveCount = 0;
    resetUndoStackHalma();
    setGameResultHalma("");
    showBoardSectionHalma();
    buildHalmaBoardDOM();
    updateHalmaBoard();
    updateGameLabelsHalma();

    if (mode === "offline-ai" && humanSide !== "p1") {
      setStatusHalma("board-info", "Computer thinking…");
      setTimeout(aiTurnHalma, AiPacing.delay(300));
    } else {
      setStatusHalma("board-info", sideNameHalma(AppStateHalma.turn) + " to move.");
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
    if (levelInline) levelInline.value = String(AppStateHalma.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusHalma("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='halma-side']:checked");
    const humanSide = sideInput && sideInput.value === "p2" ? "p2" : "p1";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "p1", 0);
      setStatusHalma("offline-halma-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusHalma("offline-halma-status",
      "You play " + sideNameHalma(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateHalma.gameOver) return;
      const loser = AppStateHalma.turn;
      const winner = HalmaCore.otherPlayer(loser);
      AppStateHalma.gameOver = true;
      announceGameResultHalma(resultTitleHalma(winner), sideNameHalma(winner) + " wins by resignation.");
      recordHalmaStatsIfVsAi("loss");
      updateGameLabelsHalma();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(HALMA_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateHalma.mode = savedGame.mode;
    AppStateHalma.state = savedGame.state;
    AppStateHalma.turn = savedGame.turn;
    AppStateHalma.selected = null;
    AppStateHalma.legalTargets = {};
    AppStateHalma.lastMove = savedGame.lastMove;
    AppStateHalma.humanSide = savedGame.humanSide;
    AppStateHalma.aiLevel = savedGame.aiLevel;
    AppStateHalma.moveCount = savedGame.moveCount;
    AppStateHalma.gameOver = false;
    resetUndoStackHalma();
    setActiveModeButton(AppStateHalma.mode);
    setGameResultHalma("");
    showBoardSectionHalma();
    buildHalmaBoardDOM();
    updateHalmaBoard();
    updateGameLabelsHalma();
    if (AppStateHalma.mode === "offline-ai" && AppStateHalma.turn !== AppStateHalma.humanSide) {
      setStatusHalma("board-info", "Computer thinking…");
      setTimeout(aiTurnHalma, AiPacing.delay(300));
    } else {
      setStatusHalma("board-info", sideNameHalma(AppStateHalma.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeyHalma(r, c) {
  return r + "," + c;
}

function computeLegalTargetsHalma(from) {
  const targets = {};
  HalmaCore.getLegalMoves(AppStateHalma.state, AppStateHalma.turn)
    .filter((m) => m.from[0] === from[0] && m.from[1] === from[1])
    .forEach((m) => { targets[targetKeyHalma(m.to[0], m.to[1])] = m; });
  return targets;
}

function onHalmaSquareClick(r, c) {
  if (AppStateHalma.gameOver) {
    setStatusHalma("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateHalma.mode === "offline-ai" && AppStateHalma.turn !== AppStateHalma.humanSide) {
    setStatusHalma("board-info", "Computer to move.");
    return;
  }

  const piece = AppStateHalma.state.board[r][c];
  const turn = AppStateHalma.turn;
  const key = targetKeyHalma(r, c);

  if (AppStateHalma.selected && AppStateHalma.legalTargets[key]) {
    applyHalmaMove(AppStateHalma.legalTargets[key]);
    return;
  }

  if (piece === turn) {
    AppStateHalma.selected = [r, c];
    AppStateHalma.legalTargets = computeLegalTargetsHalma([r, c]);
    updateHalmaBoard();
    setStatusHalma("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateHalma.selected) {
    AppStateHalma.selected = null;
    AppStateHalma.legalTargets = {};
    updateHalmaBoard();
    setStatusHalma("board-info", sideNameHalma(turn) + " to move.");
  }
}

function applyHalmaMove(move) {
  pushUndoSnapshotHalma();
  const mover = AppStateHalma.turn;
  AppStateHalma.state = HalmaCore.applyMove(AppStateHalma.state, mover, move);
  AppStateHalma.lastMove = { from: move.from, to: move.to };
  AppStateHalma.moveCount++;
  AppStateHalma.selected = null;
  AppStateHalma.legalTargets = {};
  AppStateHalma.turn = HalmaCore.otherPlayer(mover);
  updateHalmaBoard();
  updateGameLabelsHalma();

  if (AppStateHalma.state.gameOver) {
    AppStateHalma.gameOver = true;
    const winnerName = sideNameHalma(AppStateHalma.state.winner);
    announceGameResultHalma(resultTitleHalma(AppStateHalma.state.winner), winnerName + " wins by filling the opposite camp!");
    recordHalmaStatsIfVsAi(AppStateHalma.state.winner === AppStateHalma.humanSide ? "win" : "loss");
    updateGameLabelsHalma();
    return;
  }

  setStatusHalma("board-info", sideNameHalma(mover) + " played. " + sideNameHalma(AppStateHalma.turn) + " to move.");

  if (AppStateHalma.mode === "offline-ai" && AppStateHalma.turn !== AppStateHalma.humanSide) {
    setStatusHalma("board-info", "Computer thinking…");
    setTimeout(aiTurnHalma, AiPacing.delay(350));
  }
}

function aiTurnHalma() {
  if (AppStateHalma.mode !== "offline-ai" || AppStateHalma.gameOver) return;
  const aiSide = HalmaCore.otherPlayer(AppStateHalma.humanSide);
  if (AppStateHalma.turn !== aiSide) return;

  const move = HalmaAi.chooseMove(AppStateHalma.state, aiSide, AppStateHalma.aiLevel);
  if (!move) return;
  applyHalmaMove(move);
}

function undoLastMove() {
  if (!AppStateHalma.undoStack || !AppStateHalma.undoStack.length) return;
  let prev = AppStateHalma.undoStack.pop();
  if (AppStateHalma.mode === "offline-ai") {
    while (prev.turn !== AppStateHalma.humanSide && AppStateHalma.undoStack.length) {
      prev = AppStateHalma.undoStack.pop();
    }
  }
  AppStateHalma.state = prev.state;
  AppStateHalma.turn = prev.turn;
  AppStateHalma.gameOver = prev.gameOver;
  AppStateHalma.moveCount = prev.moveCount;
  AppStateHalma.lastMove = prev.lastMove;
  AppStateHalma.selected = null;
  AppStateHalma.legalTargets = {};
  setGameResultHalma("");
  updateHalmaBoard();
  updateGameLabelsHalma();
  setStatusHalma("board-info", "Move undone. " + sideNameHalma(AppStateHalma.turn) + " to move.");
}

function showBoardSectionHalma() {
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

/*** Board rendering (float-grid, same technique as chess/checkers/shogi) ***/

function buildHalmaBoardDOM() {
  const boardEl = document.getElementById("halma-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < HalmaCore.SIZE; r++) {
    for (let c = 0; c < HalmaCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square halma-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (HalmaCore.isCampP1(r, c)) square.classList.add("halma-square-camp-p1");
      if (HalmaCore.isCampP2(r, c)) square.classList.add("halma-square-camp-p2");

      const piece = document.createElement("span");
      piece.className = "halma-piece";
      square.appendChild(piece);

      square.addEventListener("click", () => onHalmaSquareClick(r, c));
      boardEl.appendChild(square);
    }
  }

  ensureHalmaSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureHalmaSquareAspectRatio);
  } else {
    setTimeout(ensureHalmaSquareAspectRatio, 0);
  }
  ensureHalmaResizeHandler();
}

let einkHalmaResizeHandlerAttached = false;
let einkHalmaResizeTimeoutId = null;

function ensureHalmaSquareAspectRatio() {
  const boardEl = document.getElementById("halma-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / HalmaCore.SIZE;
  boardEl.querySelectorAll(".halma-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureHalmaResizeHandler() {
  if (einkHalmaResizeHandlerAttached) return;
  einkHalmaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkHalmaResizeTimeoutId !== null) clearTimeout(einkHalmaResizeTimeoutId);
    einkHalmaResizeTimeoutId = setTimeout(() => {
      einkHalmaResizeTimeoutId = null;
      ensureHalmaSquareAspectRatio();
    }, 150);
  });
}

function updateHalmaBoard() {
  const boardEl = document.getElementById("halma-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".halma-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateHalma.state.board[r][c];
    const pieceEl = sq.querySelector(".halma-piece");
    if (pieceEl) {
      pieceEl.classList.remove("halma-piece-p1", "halma-piece-p2");
      if (piece) pieceEl.classList.add(piece === "p1" ? "halma-piece-p1" : "halma-piece-p2");
    }

    const isSelected = AppStateHalma.selected
      && AppStateHalma.selected[0] === r && AppStateHalma.selected[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("halma-square-movable", !!AppStateHalma.legalTargets[targetKeyHalma(r, c)]);
    sq.classList.toggle("last-move", !!(AppStateHalma.lastMove &&
      ((AppStateHalma.lastMove.from[0] === r && AppStateHalma.lastMove.from[1] === c) ||
       (AppStateHalma.lastMove.to[0] === r && AppStateHalma.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + sideNameHalma(piece) : ", empty";
    I18n.setAria(sq, label);
  });
}

function updateGameLabelsHalma() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateHalma.moveCount ? "Move " + AppStateHalma.moveCount : "");
  updateUndoButtonVisibilityHalma();
  updateResignVisibilityHalma();

  if (AppStateHalma.gameOver) clearSavedHalmaGame();
  else saveHalmaGame();
}

function updateUndoButtonVisibilityHalma() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateHalma.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateHalma.gameOver));
}

function updateResignVisibilityHalma() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateHalma.gameOver);
}

document.addEventListener("DOMContentLoaded", initHalmaApp);
