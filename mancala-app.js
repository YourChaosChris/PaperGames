// mancala-app.js
// Wires MancalaCore/MancalaAi to the mancala.html UI. Board: 12 pits in
// a 6-column, 2-row grid (bottom row = Player 1's pits left to right,
// top row = Player 2's pits right to left, matching a physical board's
// counter-clockwise sowing direction) plus a store well at each end.
// Unlike the app's other games, a "move" here is a single click on one
// of your own non-empty pits - no piece selection or destination step,
// and no dice roll to wait on first.

const AppStateMancala = {
  mode: "offline",        // "offline" | "offline-ai"
  state: MancalaCore.createInitialState(),
  turn: "a",              // "a" | "b" - Player 1 (a) always moves first
  humanSide: "a",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const MANCALA_SAVE_KEY = "einkchess_save_mancala";

function saveMancalaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MANCALA_SAVE_KEY, {
    mode: AppStateMancala.mode,
    state: AppStateMancala.state,
    turn: AppStateMancala.turn,
    humanSide: AppStateMancala.humanSide,
    aiLevel: AppStateMancala.aiLevel,
    moveCount: AppStateMancala.moveCount
  });
}

function clearSavedMancalaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MANCALA_SAVE_KEY);
}

function recordMancalaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateMancala.mode !== "offline-ai") return;
  GameStats.record("mancala", outcome);
}

function sideNameMancala(side) {
  return side === "a" ? "Player 1" : "Player 2";
}

function setStatusMancala(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultMancala(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// winner is null/undefined for a draw. Kept short for the modal title even
// where the message body goes into more detail (score, resignation, etc).
function resultTitleMancala(winner) {
  if (!winner) return "Draw";
  if (AppStateMancala.mode === "offline-ai") {
    return winner === AppStateMancala.humanSide ? "You win!" : "You lose";
  }
  return sideNameMancala(winner) + " wins";
}

function announceGameResultMancala(title, message) {
  setGameResultMancala(message);
  setStatusMancala("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackMancala() {
  AppStateMancala.undoStack = [];
}

function pushUndoSnapshotMancala() {
  AppStateMancala.undoStack.push({
    state: MancalaCore.cloneState(AppStateMancala.state),
    turn: AppStateMancala.turn,
    gameOver: AppStateMancala.gameOver,
    moveCount: AppStateMancala.moveCount
  });
}

function initMancalaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("mancala-side-choice");
  const levelInline = document.getElementById("mancala-level-inline");
  const startGameBtn = document.getElementById("start-mancala-game");
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

  function startNewGameMancala(mode, humanSide, level) {
    AppStateMancala.mode = mode;
    AppStateMancala.state = MancalaCore.createInitialState();
    AppStateMancala.turn = "a";
    AppStateMancala.humanSide = humanSide;
    AppStateMancala.aiLevel = level;
    AppStateMancala.gameOver = false;
    AppStateMancala.moveCount = 0;
    resetUndoStackMancala();
    setGameResultMancala("");
    showBoardSectionMancala();
    buildMancalaBoardDOM();
    updateMancalaBoard();
    updateGameLabelsMancala();

    if (mode === "offline-ai" && humanSide !== "a") {
      setStatusMancala("board-info", "Computer thinking…");
      setTimeout(aiTurnMancala, 300);
    } else {
      setStatusMancala("board-info", sideNameMancala(AppStateMancala.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameMancala("offline", "a", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateMancala.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusMancala("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='mancala-side']:checked");
    const humanSide = sideInput && sideInput.value === "b" ? "b" : "a";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGameMancala("offline", "a", 0);
      setStatusMancala("offline-mancala-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGameMancala("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusMancala("offline-mancala-status",
      "You play " + sideNameMancala(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateMancala.gameOver) return;
      const loser = AppStateMancala.turn;
      const winner = MancalaCore.otherPlayer(loser);
      AppStateMancala.gameOver = true;
      announceGameResultMancala(resultTitleMancala(winner), sideNameMancala(winner) + " wins by resignation.");
      recordMancalaStatsIfVsAi("loss");
      updateGameLabelsMancala();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(MANCALA_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateMancala.mode = savedGame.mode;
    AppStateMancala.state = savedGame.state;
    AppStateMancala.turn = savedGame.turn;
    AppStateMancala.humanSide = savedGame.humanSide;
    AppStateMancala.aiLevel = savedGame.aiLevel;
    AppStateMancala.moveCount = savedGame.moveCount;
    AppStateMancala.gameOver = false;
    resetUndoStackMancala();
    setActiveModeButton(AppStateMancala.mode);
    setGameResultMancala("");
    showBoardSectionMancala();
    buildMancalaBoardDOM();
    updateMancalaBoard();
    updateGameLabelsMancala();
    if (AppStateMancala.mode === "offline-ai" && AppStateMancala.turn !== AppStateMancala.humanSide) {
      setStatusMancala("board-info", "Computer thinking…");
      setTimeout(aiTurnMancala, 300);
    } else {
      setStatusMancala("board-info", sideNameMancala(AppStateMancala.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching the other games here.
}

function onMancalaPitClick(e) {
  const pit = parseInt(e.currentTarget.dataset.pit, 10);
  attemptMancalaMove(pit);
}

function attemptMancalaMove(pit) {
  if (AppStateMancala.gameOver) {
    setStatusMancala("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateMancala.mode === "offline-ai" && AppStateMancala.turn !== AppStateMancala.humanSide) {
    setStatusMancala("board-info", "Computer to move.");
    return;
  }
  const legalMoves = MancalaCore.getLegalMoves(AppStateMancala.state, AppStateMancala.turn);
  if (legalMoves.indexOf(pit) === -1) return; // not a legal pit for this turn - silently ignore

  applyMancalaMove(pit);
}

function applyMancalaMove(pit) {
  pushUndoSnapshotMancala();
  const mover = AppStateMancala.turn;
  const result = MancalaCore.applyMove(AppStateMancala.state, mover, pit);
  AppStateMancala.state = result.state;
  AppStateMancala.moveCount++;
  updateMancalaBoard();
  updateGameLabelsMancala();

  if (AppStateMancala.state.gameOver) {
    AppStateMancala.gameOver = true;
    const winner = MancalaCore.getWinner(AppStateMancala.state);
    const message = winner ? sideNameMancala(winner) + " wins!" : "It's a draw!";
    announceGameResultMancala(resultTitleMancala(winner), message);
    if (winner) {
      recordMancalaStatsIfVsAi(winner === AppStateMancala.humanSide ? "win" : "loss");
    } else {
      recordMancalaStatsIfVsAi("draw");
    }
    updateGameLabelsMancala();
    return;
  }

  if (result.extraTurn) {
    setStatusMancala("board-info", sideNameMancala(mover) + " landed in their store - go again!");
    maybeTriggerAiTurnMancala();
    return;
  }

  AppStateMancala.turn = MancalaCore.otherPlayer(mover);
  updateMancalaBoard();
  updateGameLabelsMancala();
  maybeTriggerAiTurnMancala();
  if (!(AppStateMancala.mode === "offline-ai" && AppStateMancala.turn !== AppStateMancala.humanSide)) {
    const capturedNote = result.captured ? ", captured " + result.captured + "!" : ".";
    setStatusMancala("board-info", sideNameMancala(mover) + " played" + capturedNote + " " + sideNameMancala(AppStateMancala.turn) + " to move.");
  }
}

function maybeTriggerAiTurnMancala() {
  if (AppStateMancala.gameOver) return;
  if (AppStateMancala.mode === "offline-ai" && AppStateMancala.turn !== AppStateMancala.humanSide) {
    setTimeout(aiTurnMancala, 400);
  }
}

function aiTurnMancala() {
  if (AppStateMancala.mode !== "offline-ai" || AppStateMancala.gameOver) return;
  const aiSide = MancalaCore.otherPlayer(AppStateMancala.humanSide);
  if (AppStateMancala.turn !== aiSide) return;

  setStatusMancala("board-info", "Computer thinking…");
  setTimeout(() => {
    const pit = MancalaAi.chooseMove(AppStateMancala.state, aiSide, AppStateMancala.aiLevel);
    if (pit === null || pit === undefined) return;
    applyMancalaMove(pit);
  }, 350);
}

function undoLastMove() {
  if (!AppStateMancala.undoStack || !AppStateMancala.undoStack.length) return;
  let prev = AppStateMancala.undoStack.pop();
  if (AppStateMancala.mode === "offline-ai") {
    while (prev.turn !== AppStateMancala.humanSide && AppStateMancala.undoStack.length) {
      prev = AppStateMancala.undoStack.pop();
    }
  }
  AppStateMancala.state = prev.state;
  AppStateMancala.turn = prev.turn;
  AppStateMancala.gameOver = prev.gameOver;
  AppStateMancala.moveCount = prev.moveCount;
  setGameResultMancala("");
  updateMancalaBoard();
  updateGameLabelsMancala();
  setStatusMancala("board-info", "Move undone. " + sideNameMancala(AppStateMancala.turn) + " to move.");
}

function showBoardSectionMancala() {
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

/*** Board rendering ***/

// Top row shows Player 2's pits right-to-left (12,11,...,7) and the
// bottom row shows Player 1's pits left-to-right (0..5), matching a
// physical board's layout - so sowing always visually runs one
// continuous loop around the board (left-to-right along the bottom,
// then right-to-left along the top) even though the underlying array
// is one flat counter-clockwise sequence.
const MANCALA_TOP_ROW = [12, 11, 10, 9, 8, 7];
const MANCALA_BOTTOM_ROW = [0, 1, 2, 3, 4, 5];

function buildMancalaBoardDOM() {
  const pitsEl = document.getElementById("mancala-pits");
  if (!pitsEl) return;
  pitsEl.innerHTML = "";

  function buildRow(indices) {
    indices.forEach((i) => {
      const pit = document.createElement("button");
      pit.type = "button";
      pit.className = "mancala-pit";
      pit.dataset.pit = i;
      const count = document.createElement("span");
      count.className = "mancala-pit-count";
      pit.appendChild(count);
      pit.addEventListener("click", onMancalaPitClick);
      pitsEl.appendChild(pit);
    });
  }

  buildRow(MANCALA_TOP_ROW);
  buildRow(MANCALA_BOTTOM_ROW);

  ensureMancalaPitAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureMancalaPitAspectRatio);
  } else {
    setTimeout(ensureMancalaPitAspectRatio, 0);
  }
  ensureMancalaResizeHandler();
}

let einkMancalaResizeHandlerAttached = false;
let einkMancalaResizeTimeoutId = null;

// Pits are laid out as a 6-column CSS grid; `aspect-ratio` alone is
// silently ignored on some E-Ink browsers (same issue noted throughout
// the other <game>-app.js files), so each pit's height is instead set
// in JS to match its own measured width, keeping them circular.
function ensureMancalaPitAspectRatio() {
  const pitsEl = document.getElementById("mancala-pits");
  if (!pitsEl) return;
  const firstPit = pitsEl.querySelector(".mancala-pit");
  if (!firstPit) return;
  const width = firstPit.getBoundingClientRect().width;
  if (!width) return;
  pitsEl.querySelectorAll(".mancala-pit").forEach((pit) => {
    pit.style.height = width + "px";
  });
}

function ensureMancalaResizeHandler() {
  if (einkMancalaResizeHandlerAttached) return;
  einkMancalaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkMancalaResizeTimeoutId !== null) clearTimeout(einkMancalaResizeTimeoutId);
    einkMancalaResizeTimeoutId = setTimeout(() => {
      einkMancalaResizeTimeoutId = null;
      ensureMancalaPitAspectRatio();
    }, 150);
  });
}

function updateMancalaBoard() {
  const pitsEl = document.getElementById("mancala-pits");
  if (!pitsEl) return;
  const board = AppStateMancala.state.board;
  const legalMoves = AppStateMancala.gameOver
    ? []
    : MancalaCore.getLegalMoves(AppStateMancala.state, AppStateMancala.turn);
  const movableSet = new Set(legalMoves);

  pitsEl.querySelectorAll(".mancala-pit").forEach((pitEl) => {
    const i = parseInt(pitEl.dataset.pit, 10);
    const seeds = board[i];
    const countEl = pitEl.querySelector(".mancala-pit-count");
    if (countEl) countEl.textContent = String(seeds);
    const owner = MancalaCore.PITS_A.indexOf(i) !== -1 ? "a" : "b";
    const isMovable = movableSet.has(i);
    pitEl.classList.toggle("mancala-pit-movable", isMovable);
    pitEl.disabled = !isMovable;
    pitEl.setAttribute("aria-label",
      sideNameMancala(owner) + " pit, " + seeds + " seed" + (seeds === 1 ? "" : "s") + (isMovable ? ", your move" : ""));
  });

  setStatusMancala("mancala-store-a-count", String(board[MancalaCore.STORE_A]));
  setStatusMancala("mancala-store-b-count", String(board[MancalaCore.STORE_B]));
}

function updateGameLabelsMancala() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateMancala.moveCount ? "Move " + AppStateMancala.moveCount : "";
  updateUndoButtonVisibilityMancala();
  updateResignVisibilityMancala();

  if (AppStateMancala.gameOver) clearSavedMancalaGame();
  else saveMancalaGame();
}

function updateUndoButtonVisibilityMancala() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateMancala.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateMancala.gameOver));
}

function updateResignVisibilityMancala() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateMancala.gameOver);
}

document.addEventListener("DOMContentLoaded", initMancalaApp);
