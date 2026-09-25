// tablut-app.js
// Wires TablutCore/TablutAi to the tablut.html UI. Board rendering is the
// standard per-square-button float-grid technique (a 9x9 board, so
// .tablut-square needs the usual explicit width override - the shared
// .square base class assumes 8 columns). Sides are told apart
// structurally, not by color alone: the attackers are a plain filled
// disc, the defenders an outlined disc, and the king gets his own
// crown-shaped marker on top of the defender disc - the same
// conventions hnefatafl-app.js uses for its own (smaller) board.
//
// Since every piece moves like a rook (not just one step, like
// checkers), clicking a piece highlights every square it could slide
// to this turn - the same click-piece-then-click-destination flow as
// checkers/shogi/hnefatafl, just with more destinations lit up at once
// on this larger board.

const AppStateTablut = {
  mode: "offline",        // "offline" | "offline-ai"
  state: TablutCore.createInitialState(),
  turn: "attacker",       // "attacker" | "defender" - attackers move first
  selected: null,         // [r, c] | null
  legalTargets: {},       // "r,c" -> true, for the current selection
  lastMove: null,         // { from:[r,c], to:[r,c] } | null
  humanSide: "defender",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const TABLUT_SAVE_KEY = "einkchess_save_tablut";

function saveTablutGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(TABLUT_SAVE_KEY, {
    mode: AppStateTablut.mode,
    state: AppStateTablut.state,
    turn: AppStateTablut.turn,
    lastMove: AppStateTablut.lastMove,
    humanSide: AppStateTablut.humanSide,
    aiLevel: AppStateTablut.aiLevel,
    moveCount: AppStateTablut.moveCount
  });
}

function clearSavedTablutGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(TABLUT_SAVE_KEY);
}

function recordTablutStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateTablut.mode !== "offline-ai") return;
  GameStats.record("tablut", outcome);
}

function sideNameTablut(side) {
  return side === "attacker" ? "Attackers" : "Defenders";
}

function setStatusTablut(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultTablut(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleTablut(winner) {
  if (AppStateTablut.mode === "offline-ai") {
    return winner === AppStateTablut.humanSide ? "You win!" : "You lose";
  }
  return sideNameTablut(winner) + " win";
}

function announceGameResultTablut(resultCode, message) {
  setGameResultTablut(message);
  setStatusTablut("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackTablut() {
  AppStateTablut.undoStack = [];
}

function pushUndoSnapshotTablut() {
  AppStateTablut.undoStack.push({
    state: TablutCore.cloneState(AppStateTablut.state),
    turn: AppStateTablut.turn,
    gameOver: AppStateTablut.gameOver,
    moveCount: AppStateTablut.moveCount,
    lastMove: AppStateTablut.lastMove
  });
}

function initTablutApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const sideChoice = document.getElementById("tablut-side-choice");
  const levelInline = document.getElementById("tablut-level-inline");
  const startGameBtn = document.getElementById("start-tablut-game");
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
    AppStateTablut.mode = mode;
    AppStateTablut.state = TablutCore.createInitialState();
    AppStateTablut.turn = "attacker";
    AppStateTablut.selected = null;
    AppStateTablut.legalTargets = {};
    AppStateTablut.lastMove = null;
    AppStateTablut.humanSide = humanSide;
    AppStateTablut.aiLevel = level;
    AppStateTablut.gameOver = false;
    AppStateTablut.moveCount = 0;
    resetUndoStackTablut();
    setGameResultTablut("");
    showBoardSectionTablut();
    buildTablutBoardDOM();
    updateTablutBoard();
    updateGameLabelsTablut();

    if (mode === "offline-ai" && humanSide !== "attacker") {
      setStatusTablut("board-info", "Computer thinking…");
      setTimeout(aiTurnTablut, 300);
    } else {
      setStatusTablut("board-info", sideNameTablut(AppStateTablut.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "defender", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateTablut.aiLevel || 2);
    updateSideChoiceVisibility();
    setStatusTablut("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateSideChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const sideInput = document.querySelector("input[name='tablut-side']:checked");
    const humanSide = sideInput && sideInput.value === "attacker" ? "attacker" : "defender";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "defender", 0);
      setStatusTablut("offline-tablut-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanSide, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusTablut("offline-tablut-status",
      "You play " + sideNameTablut(humanSide) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateTablut.gameOver) return;
      const loser = AppStateTablut.turn;
      const winner = TablutCore.otherPlayer(loser);
      AppStateTablut.gameOver = true;
      announceGameResultTablut(resultTitleTablut(winner), sideNameTablut(winner) + " win by resignation.");
      recordTablutStatsIfVsAi("loss");
      updateGameLabelsTablut();
    });
  }

  updateSideChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(TABLUT_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateTablut.mode = savedGame.mode;
    AppStateTablut.state = savedGame.state;
    AppStateTablut.turn = savedGame.turn;
    AppStateTablut.selected = null;
    AppStateTablut.legalTargets = {};
    AppStateTablut.lastMove = savedGame.lastMove;
    AppStateTablut.humanSide = savedGame.humanSide;
    AppStateTablut.aiLevel = savedGame.aiLevel;
    AppStateTablut.moveCount = savedGame.moveCount;
    AppStateTablut.gameOver = false;
    resetUndoStackTablut();
    setActiveModeButton(AppStateTablut.mode);
    setGameResultTablut("");
    showBoardSectionTablut();
    buildTablutBoardDOM();
    updateTablutBoard();
    updateGameLabelsTablut();
    if (AppStateTablut.mode === "offline-ai" && AppStateTablut.turn !== AppStateTablut.humanSide) {
      setStatusTablut("board-info", "Computer thinking…");
      setTimeout(aiTurnTablut, 300);
    } else {
      setStatusTablut("board-info", sideNameTablut(AppStateTablut.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeyTablut(r, c) {
  return r + "," + c;
}

function computeLegalTargetsTablut(from) {
  const targets = {};
  TablutCore.getLegalMoves(AppStateTablut.state, AppStateTablut.turn)
    .filter((m) => m.from[0] === from[0] && m.from[1] === from[1])
    .forEach((m) => { targets[targetKeyTablut(m.to[0], m.to[1])] = true; });
  return targets;
}

function onTablutSquareClick(e) {
  if (AppStateTablut.gameOver) {
    setStatusTablut("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateTablut.mode === "offline-ai" && AppStateTablut.turn !== AppStateTablut.humanSide) {
    setStatusTablut("board-info", "Computer to move.");
    return;
  }

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const piece = AppStateTablut.state.board[r][c];
  const turn = AppStateTablut.turn;
  const key = targetKeyTablut(r, c);

  if (AppStateTablut.selected && AppStateTablut.legalTargets[key]) {
    applyTablutMove({ from: AppStateTablut.selected, to: [r, c] });
    return;
  }

  if (piece && piece.side === turn) {
    AppStateTablut.selected = [r, c];
    AppStateTablut.legalTargets = computeLegalTargetsTablut([r, c]);
    updateTablutBoard();
    setStatusTablut("board-info", "Choose where to move it.");
    return;
  }

  if (AppStateTablut.selected) {
    AppStateTablut.selected = null;
    AppStateTablut.legalTargets = {};
    updateTablutBoard();
    setStatusTablut("board-info", sideNameTablut(turn) + " to move.");
  }
}

function applyTablutMove(move) {
  pushUndoSnapshotTablut();
  const mover = AppStateTablut.turn;
  AppStateTablut.state = TablutCore.applyMove(AppStateTablut.state, mover, move);
  AppStateTablut.lastMove = { from: move.from, to: move.to };
  AppStateTablut.moveCount++;
  AppStateTablut.selected = null;
  AppStateTablut.legalTargets = {};
  AppStateTablut.turn = TablutCore.otherPlayer(mover);
  updateTablutBoard();
  updateGameLabelsTablut();

  if (AppStateTablut.state.gameOver) {
    AppStateTablut.gameOver = true;
    const winnerName = sideNameTablut(AppStateTablut.state.winner);
    const reasons = {
      capture: " by capturing the king!",
      escape: " as the king reaches a corner!",
      "no-moves": " - the other side has no legal move!"
    };
    const reason = reasons[AppStateTablut.state.winReason] || ".";
    announceGameResultTablut(resultTitleTablut(AppStateTablut.state.winner), winnerName + " win" + reason);
    recordTablutStatsIfVsAi(AppStateTablut.state.winner === AppStateTablut.humanSide ? "win" : "loss");
    updateGameLabelsTablut();
    return;
  }

  setStatusTablut("board-info", sideNameTablut(mover) + " played. " + sideNameTablut(AppStateTablut.turn) + " to move.");

  if (AppStateTablut.mode === "offline-ai" && AppStateTablut.turn !== AppStateTablut.humanSide) {
    setStatusTablut("board-info", "Computer thinking…");
    setTimeout(aiTurnTablut, 350);
  }
}

function aiTurnTablut() {
  if (AppStateTablut.mode !== "offline-ai" || AppStateTablut.gameOver) return;
  const aiSide = TablutCore.otherPlayer(AppStateTablut.humanSide);
  if (AppStateTablut.turn !== aiSide) return;

  const move = TablutAi.chooseMove(AppStateTablut.state, aiSide, AppStateTablut.aiLevel);
  if (!move) return; // the previous move's no-legal-move check already caught a loss here
  applyTablutMove(move);
}

function undoLastMove() {
  if (!AppStateTablut.undoStack || !AppStateTablut.undoStack.length) return;
  let prev = AppStateTablut.undoStack.pop();
  if (AppStateTablut.mode === "offline-ai") {
    while (prev.turn !== AppStateTablut.humanSide && AppStateTablut.undoStack.length) {
      prev = AppStateTablut.undoStack.pop();
    }
  }
  AppStateTablut.state = prev.state;
  AppStateTablut.turn = prev.turn;
  AppStateTablut.gameOver = prev.gameOver;
  AppStateTablut.moveCount = prev.moveCount;
  AppStateTablut.lastMove = prev.lastMove;
  AppStateTablut.selected = null;
  AppStateTablut.legalTargets = {};
  setGameResultTablut("");
  updateTablutBoard();
  updateGameLabelsTablut();
  setStatusTablut("board-info", "Move undone. " + sideNameTablut(AppStateTablut.turn) + " to move.");
}

function showBoardSectionTablut() {
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

/*** Board rendering (float-grid, same technique as chess/checkers/hnefatafl) ***/

function buildTablutBoardDOM() {
  const boardEl = document.getElementById("tablut-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < TablutCore.SIZE; r++) {
    for (let c = 0; c < TablutCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square tablut-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (TablutCore.isThrone(r, c)) square.classList.add("tablut-square-throne");
      if (TablutCore.isCorner(r, c)) square.classList.add("tablut-square-corner");

      const piece = document.createElement("span");
      piece.className = "tablut-piece";
      square.appendChild(piece);

      square.addEventListener("click", onTablutSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureTablutSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureTablutSquareAspectRatio);
  } else {
    setTimeout(ensureTablutSquareAspectRatio, 0);
  }
  ensureTablutResizeHandler();
}

let einkTablutResizeHandlerAttached = false;
let einkTablutResizeTimeoutId = null;

function ensureTablutSquareAspectRatio() {
  const boardEl = document.getElementById("tablut-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / TablutCore.SIZE;
  boardEl.querySelectorAll(".tablut-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureTablutResizeHandler() {
  if (einkTablutResizeHandlerAttached) return;
  einkTablutResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkTablutResizeTimeoutId !== null) clearTimeout(einkTablutResizeTimeoutId);
    einkTablutResizeTimeoutId = setTimeout(() => {
      einkTablutResizeTimeoutId = null;
      ensureTablutSquareAspectRatio();
    }, 150);
  });
}

function updateTablutBoard() {
  const boardEl = document.getElementById("tablut-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".tablut-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateTablut.state.board[r][c];
    const pieceEl = sq.querySelector(".tablut-piece");
    if (pieceEl) {
      pieceEl.classList.remove("tablut-piece-attacker", "tablut-piece-defender", "tablut-piece-king");
      if (piece) {
        pieceEl.classList.add(piece.side === "attacker" ? "tablut-piece-attacker" : "tablut-piece-defender");
        if (piece.king) pieceEl.classList.add("tablut-piece-king");
      }
    }

    const isSelected = AppStateTablut.selected
      && AppStateTablut.selected[0] === r && AppStateTablut.selected[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("tablut-square-movable", !!AppStateTablut.legalTargets[targetKeyTablut(r, c)]);
    sq.classList.toggle("last-move", !!(AppStateTablut.lastMove &&
      ((AppStateTablut.lastMove.from[0] === r && AppStateTablut.lastMove.from[1] === c) ||
       (AppStateTablut.lastMove.to[0] === r && AppStateTablut.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece.king ? "King" : (piece.side === "attacker" ? "Attacker" : "Defender"));
    } else {
      label += ", empty";
    }
    sq.setAttribute("aria-label", label);
  });
}

function updateGameLabelsTablut() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateTablut.moveCount ? "Move " + AppStateTablut.moveCount : "";
  updateUndoButtonVisibilityTablut();
  updateResignVisibilityTablut();

  if (AppStateTablut.gameOver) clearSavedTablutGame();
  else saveTablutGame();
}

function updateUndoButtonVisibilityTablut() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateTablut.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateTablut.gameOver));
}

function updateResignVisibilityTablut() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateTablut.gameOver);
}

document.addEventListener("DOMContentLoaded", initTablutApp);
