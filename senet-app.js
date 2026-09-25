// senet-app.js
// Wires SenetCore/SenetAi to the senet.html UI. The board is a 3x10
// float-grid (same technique as the chess/checkers/Connect Four boards -
// a JS-enforced square size per cell, since CSS `aspect-ratio` alone is
// unreliable on E-Ink browsers), with the 30 squares numbered in the
// traditional boustrophedon ("as the ox ploughs") path: left to right
// along the top row, right to left along the middle row, then left to
// right again along the bottom row.
//
// Turn flow: the current player presses "Throw sticks", then clicks one
// of their highlighted movable pieces. A throw of 1, 4 or 6 grants
// another throw for the same player; any other throw passes the turn -
// unless there's no legal move for what was thrown, in which case the
// turn always passes regardless of the throw's value, exactly as it
// would with an unplayable stick throw at the table.

function senetSquareInfo(row, col) {
  if (row === 0) return col;
  if (row === 1) return 10 + (9 - col);
  return 20 + col;
}

const AppStateSenet = {
  mode: "offline",        // "offline" | "offline-ai"
  state: SenetCore.createInitialState(),
  turn: "a",              // "a" | "b" - player a always moves first
  humanColor: "a",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  roll: null,             // null until thrown this turn, then { value, extraTurn }
  legalMoves: [],
  moveCount: 0,
  lastMove: null,         // {from, to: [...], changed: [...]} of the latest move, for the board marker
  undoStack: []
};

const SENET_SAVE_KEY = "einkchess_save_senet";

function saveSenetGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SENET_SAVE_KEY, {
    mode: AppStateSenet.mode,
    state: AppStateSenet.state,
    turn: AppStateSenet.turn,
    roll: AppStateSenet.roll,
    humanColor: AppStateSenet.humanColor,
    aiLevel: AppStateSenet.aiLevel,
    moveCount: AppStateSenet.moveCount
  });
}

function clearSavedSenetGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SENET_SAVE_KEY);
}

function recordSenetStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateSenet.mode !== "offline-ai") return;
  GameStats.record("senet", outcome);
}

function colorNameSenet(color) {
  return color === "a" ? "Black" : "White";
}

function setStatusSenet(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSenet(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleSenet(winner) {
  if (AppStateSenet.mode === "offline-ai") {
    return winner === AppStateSenet.humanColor ? "You win!" : "You lose";
  }
  return colorNameSenet(winner) + " wins";
}

function announceGameResultSenet(resultCode, message) {
  setGameResultSenet(message);
  setStatusSenet("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackSenet() {
  AppStateSenet.undoStack = [];
}

function pushUndoSnapshotSenet() {
  AppStateSenet.undoStack.push({
    state: SenetCore.cloneState(AppStateSenet.state),
    turn: AppStateSenet.turn,
    gameOver: AppStateSenet.gameOver,
    moveCount: AppStateSenet.moveCount,
    lastMove: AppStateSenet.lastMove
  });
}

function initSenetApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("senet-color-choice");
  const levelInline = document.getElementById("senet-level-inline");
  const startGameBtn = document.getElementById("start-senet-game");
  const resignBtn = document.getElementById("resign-button");
  const throwBtn = document.getElementById("senet-throw-button");

  function updateColorChoiceVisibilitySenet() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonSenet(mode) {
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

  function startNewGameSenet(mode, humanColor, level) {
    AppStateSenet.mode = mode;
    AppStateSenet.state = SenetCore.createInitialState();
    AppStateSenet.turn = "a";
    AppStateSenet.humanColor = humanColor;
    AppStateSenet.aiLevel = level;
    AppStateSenet.gameOver = false;
    AppStateSenet.roll = null;
    AppStateSenet.legalMoves = [];
    AppStateSenet.moveCount = 0;
    AppStateSenet.lastMove = null;
    resetUndoStackSenet();
    setGameResultSenet("");
    showBoardSectionSenet();
    buildSenetBoardDOM();
    updateSenetBoard();
    updateGameLabelsSenet();

    if (mode === "offline-ai" && humanColor !== "a") {
      setStatusSenet("board-info", "Computer thinking…");
      setTimeout(aiTurnSenet, AiPacing.delay(300));
    } else {
      setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " to move. Throw the sticks.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonSenet("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameSenet("offline", "a", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonSenet("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateSenet.aiLevel || 2);
    updateColorChoiceVisibilitySenet();
    setStatusSenet("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilitySenet);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='senet-color']:checked");
    const humanColor = colorInput && colorInput.value === "b" ? "b" : "a";

    if (level === 0) {
      setActiveModeButtonSenet("offline-ai");
      startNewGameSenet("offline", "a", 0);
      setStatusSenet("offline-senet-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonSenet("offline-ai");
    startNewGameSenet("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusSenet("offline-senet-status",
      "You play " + colorNameSenet(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateSenet.gameOver) return;
      const loser = AppStateSenet.turn;
      const winner = SenetCore.otherPlayer(loser);
      AppStateSenet.gameOver = true;
      announceGameResultSenet(resultTitleSenet(winner), colorNameSenet(winner) + " wins by resignation.");
      recordSenetStatsIfVsAi("loss");
      updateGameLabelsSenet();
    });
  }

  if (throwBtn) {
    throwBtn.addEventListener("click", throwSticksSenet);
  }

  updateColorChoiceVisibilitySenet();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SENET_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateSenet.mode = savedGame.mode;
    AppStateSenet.state = savedGame.state;
    AppStateSenet.turn = savedGame.turn;
    AppStateSenet.roll = savedGame.roll;
    AppStateSenet.legalMoves = savedGame.roll !== null
      ? SenetCore.getLegalMoves(AppStateSenet.state, AppStateSenet.turn, savedGame.roll.value)
      : [];
    AppStateSenet.humanColor = savedGame.humanColor;
    AppStateSenet.aiLevel = savedGame.aiLevel;
    AppStateSenet.moveCount = savedGame.moveCount;
    AppStateSenet.lastMove = null;
    AppStateSenet.gameOver = false;
    resetUndoStackSenet();
    setActiveModeButtonSenet(AppStateSenet.mode);
    setGameResultSenet("");
    showBoardSectionSenet();
    buildSenetBoardDOM();
    updateSticksDisplaySenet(AppStateSenet.roll);
    updateSenetBoard();
    updateGameLabelsSenet();
    if (AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor) {
      setStatusSenet("board-info", "Computer thinking…");
      setTimeout(aiTurnSenet, AiPacing.delay(300));
    } else if (AppStateSenet.roll !== null) {
      setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " threw " + AppStateSenet.roll.value + ". Choose a piece to move.");
    } else {
      setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " to move. Throw the sticks.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function throwSticksSenet() {
  if (AppStateSenet.gameOver) return;
  if (AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor) return;
  if (AppStateSenet.roll !== null) return; // already thrown, must move (or wait for auto-pass) first

  const roll = SenetCore.rollSticks();
  AppStateSenet.roll = roll;
  AppStateSenet.legalMoves = SenetCore.getLegalMoves(AppStateSenet.state, AppStateSenet.turn, roll.value);
  updateSticksDisplaySenet(roll);
  updateSenetBoard();
  updateGameLabelsSenet();

  if (!AppStateSenet.legalMoves.length) {
    setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " threw " + roll.value + ". No legal move - turn passes.");
    setTimeout(passTurnSenet, AiPacing.delay(700));
    return;
  }

  setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " threw " + roll.value + ". Choose a piece to move.");
}

function passTurnSenet() {
  AppStateSenet.roll = null;
  AppStateSenet.legalMoves = [];
  AppStateSenet.turn = SenetCore.otherPlayer(AppStateSenet.turn);
  updateSticksDisplaySenet(null);
  updateSenetBoard();
  updateGameLabelsSenet();
  maybeTriggerAiTurnSenet();
  if (!(AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor)) {
    setStatusSenet("board-info", colorNameSenet(AppStateSenet.turn) + " to move. Throw the sticks.");
  }
}

function maybeTriggerAiTurnSenet() {
  if (AppStateSenet.gameOver) return;
  if (AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor) {
    setTimeout(aiTurnSenet, AiPacing.delay(400));
  }
}

function onSenetSquareClick(e) {
  const pos = parseInt(e.currentTarget.dataset.pos, 10);
  attemptSenetMoveFrom(pos);
}

function attemptSenetMoveFrom(fromIndex) {
  if (AppStateSenet.gameOver) {
    setStatusSenet("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor) {
    setStatusSenet("board-info", "Computer to move.");
    return;
  }
  if (AppStateSenet.roll === null) {
    setStatusSenet("board-info", "Throw the sticks first.");
    return;
  }
  if (AppStateSenet.legalMoves.indexOf(fromIndex) === -1) return; // not a legal source - silently ignore

  applySenetMove(fromIndex);
}

function applySenetMove(fromIndex) {
  pushUndoSnapshotSenet();
  const mover = AppStateSenet.turn;
  const roll = AppStateSenet.roll;
  const before = AppStateSenet.state.board;
  const result = SenetCore.applyMove(AppStateSenet.state, mover, fromIndex, roll.value);
  AppStateSenet.state = result.state;
  // Compared square by square so the marker also covers a piece washed
  // out of the House of Water and an opposing piece that was displaced.
  const to = [];
  const changed = [];
  result.state.board.forEach((slot, i) => {
    const old = before[i];
    if (slot.owner === mover && (old.owner !== mover || slot.count > old.count)) to.push(i);
    else if (slot.owner && slot.owner !== mover && old.owner !== slot.owner) changed.push(i);
  });
  AppStateSenet.lastMove = { from: fromIndex, to, changed };
  AppStateSenet.moveCount++;
  AppStateSenet.roll = null;
  AppStateSenet.legalMoves = [];
  updateSticksDisplaySenet(null);
  updateSenetBoard();
  updateGameLabelsSenet();

  if (AppStateSenet.state.gameOver) {
    AppStateSenet.gameOver = true;
    const winnerName = colorNameSenet(mover);
    announceGameResultSenet(resultTitleSenet(mover), winnerName + " wins - all pieces borne off!");
    recordSenetStatsIfVsAi(mover === AppStateSenet.humanColor ? "win" : "loss");
    updateGameLabelsSenet();
    return;
  }

  if (roll.extraTurn) {
    let msg = colorNameSenet(mover) + " threw a " + roll.value + " - throw again!";
    if (result.captured) msg = colorNameSenet(mover) + " captured a piece and throws again!";
    setStatusSenet("board-info", msg);
    maybeTriggerAiTurnSenet();
    return;
  }

  AppStateSenet.turn = SenetCore.otherPlayer(mover);
  updateSenetBoard();
  updateGameLabelsSenet();
  maybeTriggerAiTurnSenet();
  if (!(AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor)) {
    setStatusSenet("board-info", colorNameSenet(mover) + " played. " + colorNameSenet(AppStateSenet.turn) + " to move.");
  }
}

function aiTurnSenet() {
  if (AppStateSenet.mode !== "offline-ai" || AppStateSenet.gameOver) return;
  const aiColor = SenetCore.otherPlayer(AppStateSenet.humanColor);
  if (AppStateSenet.turn !== aiColor) return;

  const roll = SenetCore.rollSticks();
  updateSticksDisplaySenet(roll);
  AppStateSenet.roll = roll;
  const legalMoves = SenetCore.getLegalMoves(AppStateSenet.state, aiColor, roll.value);
  setStatusSenet("board-info", "Computer threw " + roll.value + ".");

  if (!legalMoves.length) {
    setStatusSenet("board-info", "Computer threw " + roll.value + ". No legal move - turn passes.");
    setTimeout(() => {
      if (aiThrowStillCurrentSenet(roll, aiColor)) passTurnSenet();
    }, AiPacing.delay(700));
    return;
  }

  setStatusSenet("board-info", "Computer threw " + roll.value + ", thinking…");
  setTimeout(() => {
    if (!aiThrowStillCurrentSenet(roll, aiColor)) return;
    const from = SenetAi.chooseMove(AppStateSenet.state, aiColor, roll.value, AppStateSenet.aiLevel);
    if (from === null || from === undefined) return;
    applySenetMove(from);
  }, AiPacing.delay(350));
}

// An undo or a new game while the computer is still "thinking" replaces
// the throw its pending timer was scheduled for; that timer must then do
// nothing instead of moving with a throw that no longer exists.
function aiThrowStillCurrentSenet(roll, aiColor) {
  return !AppStateSenet.gameOver && AppStateSenet.roll === roll && AppStateSenet.turn === aiColor;
}

function undoLastMove() {
  if (!AppStateSenet.undoStack || !AppStateSenet.undoStack.length) return;
  let prev = AppStateSenet.undoStack.pop();
  if (AppStateSenet.mode === "offline-ai") {
    while (prev.turn !== AppStateSenet.humanColor && AppStateSenet.undoStack.length) {
      prev = AppStateSenet.undoStack.pop();
    }
  }
  AppStateSenet.state = prev.state;
  AppStateSenet.turn = prev.turn;
  AppStateSenet.gameOver = prev.gameOver;
  AppStateSenet.moveCount = prev.moveCount;
  AppStateSenet.lastMove = prev.lastMove || null;
  AppStateSenet.roll = null;
  AppStateSenet.legalMoves = [];
  setGameResultSenet("");
  updateSticksDisplaySenet(null);
  updateSenetBoard();
  updateGameLabelsSenet();
  setStatusSenet("board-info", "Move undone. " + colorNameSenet(AppStateSenet.turn) + " to move. Throw the sticks.");
}

function showBoardSectionSenet() {
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

/*** Board rendering (float-grid, same technique as chess/checkers/Connect Four) ***/

function senetSquareSpecialClass(idx) {
  if (idx === SenetCore.HOUSE_OF_REBIRTH) return "senet-square-rebirth";
  if (idx === SenetCore.HOUSE_OF_BEAUTY) return "senet-square-beauty";
  if (idx === SenetCore.HOUSE_OF_WATER) return "senet-square-water";
  return null;
}

function buildSenetBoardDOM() {
  const boardEl = document.getElementById("senet-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      const idx = senetSquareInfo(row, col);
      const square = document.createElement("button");
      square.className = "square senet-square";
      square.type = "button";
      square.dataset.pos = idx;
      const special = senetSquareSpecialClass(idx);
      if (special) square.classList.add(special);

      const number = document.createElement("span");
      number.className = "senet-square-number";
      number.textContent = String(idx + 1);
      square.appendChild(number);

      const piece = document.createElement("span");
      piece.className = "senet-piece";
      square.appendChild(piece);

      const count = document.createElement("span");
      count.className = "senet-piece-count hidden";
      square.appendChild(count);

      square.addEventListener("click", onSenetSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureSenetSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSenetSquareAspectRatio);
  } else {
    setTimeout(ensureSenetSquareAspectRatio, 0);
  }
  ensureSenetResizeHandler();
}

let einkSenetResizeHandlerAttached = false;
let einkSenetResizeTimeoutId = null;

function ensureSenetSquareAspectRatio() {
  const boardEl = document.getElementById("senet-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / 10;
  boardEl.querySelectorAll(".senet-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureSenetResizeHandler() {
  if (einkSenetResizeHandlerAttached) return;
  einkSenetResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSenetResizeTimeoutId !== null) clearTimeout(einkSenetResizeTimeoutId);
    einkSenetResizeTimeoutId = setTimeout(() => {
      einkSenetResizeTimeoutId = null;
      ensureSenetSquareAspectRatio();
    }, 150);
  });
}

function updateSenetBoard() {
  const boardEl = document.getElementById("senet-board");
  if (!boardEl) return;

  const movableFrom = new Set(AppStateSenet.legalMoves);

  boardEl.querySelectorAll(".senet-square").forEach((sq) => {
    const pos = parseInt(sq.dataset.pos, 10);
    const slot = AppStateSenet.state.board[pos];
    const pieceEl = sq.querySelector(".senet-piece");
    const countEl = sq.querySelector(".senet-piece-count");
    if (pieceEl) {
      pieceEl.classList.remove("senet-piece-a", "senet-piece-b");
      if (slot.owner) pieceEl.classList.add(slot.owner === "a" ? "senet-piece-a" : "senet-piece-b");
    }
    if (countEl) {
      if (slot.owner && slot.count >= 2) {
        countEl.textContent = String(slot.count);
        countEl.classList.remove("hidden");
      } else {
        countEl.textContent = "";
        countEl.classList.add("hidden");
      }
    }
    const isMovable = movableFrom.has(pos);
    sq.classList.toggle("senet-square-movable", isMovable);
    const last = AppStateSenet.lastMove;
    sq.classList.toggle("lm-from", !!last && last.from === pos);
    sq.classList.toggle("lm-to", !!last && last.to.indexOf(pos) !== -1);
    sq.classList.toggle("lm-changed", !!last && last.changed.indexOf(pos) !== -1);

    let label = "Square " + (pos + 1);
    if (pos === SenetCore.HOUSE_OF_REBIRTH) label += ", House of Rebirth";
    if (pos === SenetCore.HOUSE_OF_BEAUTY) label += ", House of Beauty";
    if (pos === SenetCore.HOUSE_OF_WATER) label += ", House of Water";
    label += slot.owner ? ", " + colorNameSenet(slot.owner) + " piece" + (slot.count > 1 ? " (" + slot.count + ")" : "") : ", empty";
    if (isMovable) label += ", movable";
    I18n.setAria(sq, label);
  });

  updateBorneOffDisplaySenet();
}

function updateBorneOffDisplaySenet() {
  const el = document.getElementById("senet-borne-off");
  if (!el) return;
  const off = AppStateSenet.state.borneOff;
  I18n.setMsg(el, "Black borne off: " + off.a + " / 5     White borne off: " + off.b + " / 5");
}

function updateSticksDisplaySenet(roll) {
  const el = document.getElementById("senet-sticks-display");
  if (!el) return;
  el.innerHTML = "";
  if (!roll) return;
  // A throw of 6 is the special "all four sticks round-side up" result,
  // so it displays as zero marked sticks rather than four.
  const marked = roll.value === 6 ? 0 : roll.value;
  for (let i = 0; i < 4; i++) {
    const stick = document.createElement("span");
    stick.className = "senet-stick " + (i < marked ? "senet-stick-marked" : "senet-stick-blank");
    el.appendChild(stick);
  }
  const label = document.createElement("span");
  label.className = "senet-stick-total";
  label.textContent = String(roll.value) + (roll.extraTurn ? " ↻" : "");
  el.appendChild(label);
}

function updateGameLabelsSenet() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateSenet.moveCount ? "Move " + AppStateSenet.moveCount : "");
  updateUndoButtonVisibilitySenet();
  updateResignVisibilitySenet();
  updateThrowButtonVisibilitySenet();

  if (AppStateSenet.gameOver) clearSavedSenetGame();
  else saveSenetGame();
}

function updateUndoButtonVisibilitySenet() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSenet.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSenet.gameOver));
}

function updateResignVisibilitySenet() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateSenet.gameOver);
}

function updateThrowButtonVisibilitySenet() {
  const throwBtn = document.getElementById("senet-throw-button");
  if (!throwBtn) return;
  const isHumanTurn = !(AppStateSenet.mode === "offline-ai" && AppStateSenet.turn !== AppStateSenet.humanColor);
  throwBtn.disabled = AppStateSenet.gameOver || !isHumanTurn || AppStateSenet.roll !== null;
}

document.addEventListener("DOMContentLoaded", initSenetApp);
