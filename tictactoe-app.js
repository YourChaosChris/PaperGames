// tictactoe-app.js
// Wires TicTacToeCore/TicTacToeAi to the tictactoe.html UI, following
// gomoku-app.js. The board is nine buttons placed by percentage inside a
// square, JS-sized box (`aspect-ratio` alone is ignored on some E-Ink
// browsers). Marks are inline SVG, not font glyphs: a cross for
// Player 1, a circle for Player 2. When the game is won, the three
// cells of the winning line turn solid black with the mark in white -
// told apart by fill, not by colour.

const AppStateTicTacToe = {
  mode: "offline",        // "offline" | "offline-ai"
  state: TicTacToeCore.createInitialState(),
  humanPlayer: "1",       // "1" (X, moves first) | "2" (O) vs. the computer
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  lastMove: null,         // cell number of the latest mark, or null
  moveCount: 0,
  undoStack: []
};

const TICTACTOE_SAVE_KEY = "einkchess_save_tictactoe";

const TTT_MARK_X = '<svg class="ttt-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
  '<line x1="24" y1="24" x2="76" y2="76"/><line x1="76" y1="24" x2="24" y2="76"/></svg>';
const TTT_MARK_O = '<svg class="ttt-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
  '<circle cx="50" cy="50" r="27"/></svg>';

function saveTicTacToeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(TICTACTOE_SAVE_KEY, {
    mode: AppStateTicTacToe.mode,
    state: AppStateTicTacToe.state,
    humanPlayer: AppStateTicTacToe.humanPlayer,
    aiLevel: AppStateTicTacToe.aiLevel,
    lastMove: AppStateTicTacToe.lastMove,
    moveCount: AppStateTicTacToe.moveCount
  });
}

function clearSavedTicTacToeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(TICTACTOE_SAVE_KEY);
}

function recordTicTacToeStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateTicTacToe.mode !== "offline-ai") return;
  GameStats.record("tictactoe", outcome);
}

function playerNameTicTacToe(player) {
  return player === "1" ? "Player 1" : "Player 2";
}

function setStatusTicTacToe(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultTicTacToe(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleTicTacToe(winner) {
  if (winner === "draw") return "Draw";
  if (AppStateTicTacToe.mode === "offline-ai") {
    return winner === AppStateTicTacToe.humanPlayer ? "You win!" : "You lose";
  }
  return playerNameTicTacToe(winner) + " wins";
}

function announceGameResultTicTacToe(resultCode, message) {
  setGameResultTicTacToe(message);
  setStatusTicTacToe("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackTicTacToe() {
  AppStateTicTacToe.undoStack = [];
}

function pushUndoSnapshotTicTacToe() {
  AppStateTicTacToe.undoStack.push({
    state: TicTacToeCore.cloneState(AppStateTicTacToe.state),
    gameOver: AppStateTicTacToe.gameOver,
    lastMove: AppStateTicTacToe.lastMove,
    moveCount: AppStateTicTacToe.moveCount
  });
}

function initTicTacToeApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const playerChoice = document.getElementById("tictactoe-player-choice");
  const levelInline = document.getElementById("tictactoe-level-inline");
  const startGameBtn = document.getElementById("start-tictactoe-game");
  const resignBtn = document.getElementById("resign-button");

  function updatePlayerChoiceVisibility() {
    if (!playerChoice || !levelInline) return;
    playerChoice.classList.toggle("hidden", levelInline.value === "0");
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

  function startNewGameTicTacToe(mode, humanPlayer, level) {
    AppStateTicTacToe.mode = mode;
    AppStateTicTacToe.state = TicTacToeCore.createInitialState();
    AppStateTicTacToe.humanPlayer = humanPlayer;
    AppStateTicTacToe.aiLevel = level;
    AppStateTicTacToe.gameOver = false;
    AppStateTicTacToe.lastMove = null;
    AppStateTicTacToe.moveCount = 0;
    resetUndoStackTicTacToe();
    setGameResultTicTacToe("");
    showBoardSectionTicTacToe();
    buildTicTacToeBoardDOM();
    updateTicTacToeBoard();
    updateGameLabelsTicTacToe();

    if (mode === "offline-ai" && humanPlayer !== "1") {
      setStatusTicTacToe("board-info", "Computer thinking…");
      setTimeout(aiTurnTicTacToe, AiPacing.delay(300));
    } else {
      setStatusTicTacToe("board-info", playerNameTicTacToe(AppStateTicTacToe.state.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameTicTacToe("offline", "1", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateTicTacToe.aiLevel || 2);
    updatePlayerChoiceVisibility();
    setStatusTicTacToe("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updatePlayerChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const playerInput = document.querySelector("input[name='tictactoe-player']:checked");
    const humanPlayer = playerInput && playerInput.value === "2" ? "2" : "1";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameTicTacToe("offline", "1", 0);
      setStatusTicTacToe("offline-tictactoe-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameTicTacToe("offline-ai", humanPlayer, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusTicTacToe("offline-tictactoe-status",
      "You play " + playerNameTicTacToe(humanPlayer) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateTicTacToe.gameOver) return;
      const loser = AppStateTicTacToe.state.turn;
      const winner = TicTacToeCore.otherPlayer(loser);
      AppStateTicTacToe.gameOver = true;
      announceGameResultTicTacToe(resultTitleTicTacToe(winner), playerNameTicTacToe(winner) + " wins by resignation.");
      recordTicTacToeStatsIfVsAi("loss");
      updateGameLabelsTicTacToe();
    });
  }

  updatePlayerChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(TICTACTOE_SAVE_KEY) : null;
  if (savedGame && savedGame.state && Array.isArray(savedGame.state.cells) && savedGame.state.cells.length === 9) {
    AppStateTicTacToe.mode = savedGame.mode === "offline-ai" ? "offline-ai" : "offline";
    AppStateTicTacToe.state = savedGame.state;
    AppStateTicTacToe.humanPlayer = savedGame.humanPlayer === "2" ? "2" : "1";
    AppStateTicTacToe.aiLevel = savedGame.aiLevel || 2;
    AppStateTicTacToe.lastMove = typeof savedGame.lastMove === "number" ? savedGame.lastMove : null;
    AppStateTicTacToe.moveCount = savedGame.moveCount || 0;
    AppStateTicTacToe.gameOver = false;
    resetUndoStackTicTacToe();
    setActiveModeButton(AppStateTicTacToe.mode);
    setGameResultTicTacToe("");
    showBoardSectionTicTacToe();
    buildTicTacToeBoardDOM();
    updateTicTacToeBoard();
    updateGameLabelsTicTacToe();
    if (AppStateTicTacToe.mode === "offline-ai" && AppStateTicTacToe.state.turn !== AppStateTicTacToe.humanPlayer) {
      setStatusTicTacToe("board-info", "Computer thinking…");
      setTimeout(aiTurnTicTacToe, AiPacing.delay(300));
    } else {
      setStatusTicTacToe("board-info", playerNameTicTacToe(AppStateTicTacToe.state.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function isHumanTurnTicTacToe() {
  if (AppStateTicTacToe.gameOver) return false;
  if (AppStateTicTacToe.mode === "offline-ai" && AppStateTicTacToe.state.turn !== AppStateTicTacToe.humanPlayer) return false;
  return true;
}

function onTicTacToeCellClick(e) {
  attemptTicTacToeMove(parseInt(e.currentTarget.dataset.cell, 10));
}

function attemptTicTacToeMove(cell) {
  if (AppStateTicTacToe.gameOver) {
    setStatusTicTacToe("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnTicTacToe()) {
    setStatusTicTacToe("board-info", "Computer to move.");
    return;
  }
  if (!TicTacToeCore.isLegalMove(AppStateTicTacToe.state, cell)) return; // occupied - silently ignore
  applyTicTacToeMove(cell);
}

function applyTicTacToeMove(cell) {
  pushUndoSnapshotTicTacToe();
  const mover = AppStateTicTacToe.state.turn;
  AppStateTicTacToe.state = TicTacToeCore.applyMove(AppStateTicTacToe.state, cell);
  AppStateTicTacToe.lastMove = cell;
  AppStateTicTacToe.moveCount++;
  updateTicTacToeBoard();

  const state = AppStateTicTacToe.state;
  if (state.gameOver) {
    AppStateTicTacToe.gameOver = true;
    if (state.winner === "draw") {
      announceGameResultTicTacToe("Draw", "It's a draw - the board is full!");
      recordTicTacToeStatsIfVsAi("draw");
    } else {
      announceGameResultTicTacToe(resultTitleTicTacToe(state.winner), playerNameTicTacToe(state.winner) + " wins - three in a row!");
      recordTicTacToeStatsIfVsAi(state.winner === AppStateTicTacToe.humanPlayer ? "win" : "loss");
    }
    updateTicTacToeBoard();
    updateGameLabelsTicTacToe();
    return;
  }

  updateGameLabelsTicTacToe();
  maybeTriggerAiTurnTicTacToe();
  if (isHumanTurnTicTacToe()) {
    setStatusTicTacToe("board-info", playerNameTicTacToe(mover) + " played. " + playerNameTicTacToe(state.turn) + " to move.");
  }
}

function maybeTriggerAiTurnTicTacToe() {
  if (AppStateTicTacToe.gameOver) return;
  if (AppStateTicTacToe.mode === "offline-ai" && AppStateTicTacToe.state.turn !== AppStateTicTacToe.humanPlayer) {
    setStatusTicTacToe("board-info", "Computer thinking…");
    setTimeout(aiTurnTicTacToe, AiPacing.delay(400));
  }
}

function aiTurnTicTacToe() {
  if (AppStateTicTacToe.mode !== "offline-ai" || AppStateTicTacToe.gameOver) return;
  const aiPlayer = TicTacToeCore.otherPlayer(AppStateTicTacToe.humanPlayer);
  if (AppStateTicTacToe.state.turn !== aiPlayer) return;
  // The position this move is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = AppStateTicTacToe.state;
  setTimeout(() => {
    if (AppStateTicTacToe.gameOver || AppStateTicTacToe.state !== scheduledFor || AppStateTicTacToe.state.turn !== aiPlayer) return;
    const cell = TicTacToeAi.chooseMove(AppStateTicTacToe.state, aiPlayer, AppStateTicTacToe.aiLevel);
    if (cell === null || cell === undefined) return;
    applyTicTacToeMove(cell);
  }, AiPacing.delay(200));
}

function undoLastMove() {
  if (!AppStateTicTacToe.undoStack || !AppStateTicTacToe.undoStack.length) return;
  let prev = AppStateTicTacToe.undoStack.pop();
  if (AppStateTicTacToe.mode === "offline-ai") {
    while (prev.state.turn !== AppStateTicTacToe.humanPlayer && AppStateTicTacToe.undoStack.length) {
      prev = AppStateTicTacToe.undoStack.pop();
    }
  }
  AppStateTicTacToe.state = prev.state;
  AppStateTicTacToe.gameOver = prev.gameOver;
  AppStateTicTacToe.lastMove = prev.lastMove;
  AppStateTicTacToe.moveCount = prev.moveCount;
  setGameResultTicTacToe("");
  updateTicTacToeBoard();
  updateGameLabelsTicTacToe();
  setStatusTicTacToe("board-info", "Move undone. " + playerNameTicTacToe(AppStateTicTacToe.state.turn) + " to move.");
  maybeTriggerAiTurnTicTacToe();
}

function showBoardSectionTicTacToe() {
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

/*** Board rendering: nine buttons, absolute percentage positions ***/

function buildTicTacToeBoardDOM() {
  const boardEl = document.getElementById("tictactoe-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const step = 100 / 3;
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ttt-cell";
    btn.dataset.cell = i;
    btn.style.left = (c * step) + "%";
    btn.style.top = (r * step) + "%";
    btn.style.width = step + "%";
    btn.style.height = step + "%";
    btn.addEventListener("click", onTicTacToeCellClick);
    boardEl.appendChild(btn);
  }

  ensureTicTacToeBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureTicTacToeBoardSquare);
  } else {
    setTimeout(ensureTicTacToeBoardSquare, 0);
  }
  ensureTicTacToeResizeHandler();
}

let einkTicTacToeResizeHandlerAttached = false;
let einkTicTacToeResizeTimeoutId = null;

function ensureTicTacToeBoardSquare() {
  const boardEl = document.getElementById("tictactoe-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureTicTacToeResizeHandler() {
  if (einkTicTacToeResizeHandlerAttached) return;
  einkTicTacToeResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkTicTacToeResizeTimeoutId !== null) clearTimeout(einkTicTacToeResizeTimeoutId);
    einkTicTacToeResizeTimeoutId = setTimeout(() => {
      einkTicTacToeResizeTimeoutId = null;
      ensureTicTacToeBoardSquare();
    }, 150);
  });
}

function updateTicTacToeBoard() {
  const boardEl = document.getElementById("tictactoe-board");
  if (!boardEl) return;
  const state = AppStateTicTacToe.state;
  const win = state.winningLine || [];
  boardEl.querySelectorAll(".ttt-cell").forEach((btn) => {
    const i = parseInt(btn.dataset.cell, 10);
    const owner = state.cells[i];
    const mark = owner === "1" ? "x" : owner === "2" ? "o" : "";
    if (btn.dataset.mark !== mark) { // unchanged cells keep their content - fewer e-ink redraws
      btn.dataset.mark = mark;
      btn.innerHTML = mark === "x" ? TTT_MARK_X : mark === "o" ? TTT_MARK_O : "";
    }
    btn.classList.toggle("ttt-cell-win", win.indexOf(i) !== -1);
    btn.classList.toggle("lm-to", AppStateTicTacToe.lastMove === i && !state.gameOver);
    const r = Math.floor(i / 3) + 1;
    const c = (i % 3) + 1;
    I18n.setAria(btn, "Row " + r + ", column " + c + ", " + (owner ? playerNameTicTacToe(owner) : "empty"));
  });
}

function updateGameLabelsTicTacToe() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateTicTacToe.moveCount ? "Move " + AppStateTicTacToe.moveCount : "");
  updateUndoButtonVisibilityTicTacToe();
  updateResignVisibilityTicTacToe();

  if (AppStateTicTacToe.gameOver) clearSavedTicTacToeGame();
  else saveTicTacToeGame();
}

function updateUndoButtonVisibilityTicTacToe() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateTicTacToe.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateTicTacToe.gameOver));
}

function updateResignVisibilityTicTacToe() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateTicTacToe.gameOver);
}

document.addEventListener("DOMContentLoaded", initTicTacToeApp);
