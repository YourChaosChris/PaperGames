// shogi-app.js
// Wires ShogiCore/ShogiAi to the shogi.html UI. The board is a 9x9
// float-grid (same technique as the chess/checkers/Connect Four boards -
// a JS-enforced square cell size, since CSS `aspect-ratio` is
// unreliable on E-Ink browsers). Pieces are rendered the traditional
// Shogi way: a plain pentagon with the piece's kanji, rotated 180deg
// for White - so which side a piece belongs to is a *shape* fact (which
// way it's pointing), never a color fact, which happens to make it one
// of the more naturally E-Ink-friendly games here rather than something
// that needed retrofitting (see the Xiangqi color fix for contrast).
// Promoted pieces get their own traditional single-kanji abbreviation
// (と, 杏, 圭, 全, 馬, 龍) instead of red ink, for the same reason.
//
// Captured pieces switch sides and join the capturing player's hand,
// shown as a row of labelled buttons above/below the board; clicking
// one selects it for dropping, exactly like selecting a board piece to
// move, just landing on an empty square instead of an occupied one.

const SHOGI_KANJI = {
  R: "飛", "+R": "龍",
  B: "角", "+B": "馬",
  G: "金",
  S: "銀", "+S": "全",
  N: "桂", "+N": "圭",
  L: "香", "+L": "杏",
  P: "歩", "+P": "と"
};

function shogiPieceLabel(piece) {
  if (piece.type === "K") return piece.color === "b" ? "王" : "玉";
  return SHOGI_KANJI[piece.type] || "?";
}

const AppStateShogi = {
  mode: "offline",        // "offline" | "offline-ai"
  state: ShogiCore.createInitialState(),
  turn: "b",              // "b" | "w" - Black always moves first
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  selected: null,         // { kind: "square", r, c } | { kind: "hand", piece } | null
  legalTargets: {},       // "r,c" -> { promoteOptions: [false] | [true] | [false, true] }
  pendingPromotion: null, // { from, to, captured } while the promote/don't-promote prompt is open
  lastMove: null,         // { from: [r,c]|null, to: [r,c] } for highlighting
  moveCount: 0,
  undoStack: []
};

const SHOGI_SAVE_KEY = "einkchess_save_shogi";

function saveShogiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SHOGI_SAVE_KEY, {
    mode: AppStateShogi.mode,
    state: AppStateShogi.state,
    turn: AppStateShogi.turn,
    humanColor: AppStateShogi.humanColor,
    aiLevel: AppStateShogi.aiLevel,
    moveCount: AppStateShogi.moveCount
  });
}

function clearSavedShogiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SHOGI_SAVE_KEY);
}

function recordShogiStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateShogi.mode !== "offline-ai") return;
  GameStats.record("shogi", outcome);
}

function colorNameShogi(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusShogi(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultShogi(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultShogi(resultCode, message) {
  setGameResultShogi(message);
  setStatusShogi("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackShogi() {
  AppStateShogi.undoStack = [];
}

function pushUndoSnapshotShogi() {
  AppStateShogi.undoStack.push({
    state: ShogiCore.cloneState(AppStateShogi.state),
    turn: AppStateShogi.turn,
    gameOver: AppStateShogi.gameOver,
    moveCount: AppStateShogi.moveCount,
    lastMove: AppStateShogi.lastMove
  });
}

function initShogiApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("shogi-color-choice");
  const levelInline = document.getElementById("shogi-level-inline");
  const startGameBtn = document.getElementById("start-shogi-game");
  const resignBtn = document.getElementById("resign-button");
  const promoteYesBtn = document.getElementById("shogi-promote-yes");
  const promoteNoBtn = document.getElementById("shogi-promote-no");

  function updateColorChoiceVisibilityShogi() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonShogi(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) menuToggle.textContent = "☰ Menu";
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) menuToggle.textContent = "✕ Close";
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function startNewGameShogi(mode, humanColor, level) {
    AppStateShogi.mode = mode;
    AppStateShogi.state = ShogiCore.createInitialState();
    AppStateShogi.turn = "b";
    AppStateShogi.humanColor = humanColor;
    AppStateShogi.aiLevel = level;
    AppStateShogi.gameOver = false;
    AppStateShogi.selected = null;
    AppStateShogi.legalTargets = {};
    AppStateShogi.pendingPromotion = null;
    AppStateShogi.lastMove = null;
    AppStateShogi.moveCount = 0;
    resetUndoStackShogi();
    setGameResultShogi("");
    showBoardSectionShogi();
    buildShogiBoardDOM();
    updateShogiBoard();
    updateShogiHands();
    updateGameLabelsShogi();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusShogi("board-info", "Computer thinking…");
      setTimeout(aiTurnShogi, 300);
    } else {
      setStatusShogi("board-info", colorNameShogi(AppStateShogi.turn) + " to move.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonShogi("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameShogi("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonShogi("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateShogi.aiLevel || 2);
    updateColorChoiceVisibilityShogi();
    setStatusShogi("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityShogi);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='shogi-color']:checked");
    const humanColor = colorInput && colorInput.value === "w" ? "w" : "b";

    if (level === 0) {
      setActiveModeButtonShogi("offline-ai");
      startNewGameShogi("offline", "b", 0);
      setStatusShogi("offline-shogi-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonShogi("offline-ai");
    startNewGameShogi("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusShogi("offline-shogi-status",
      "You play " + colorNameShogi(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateShogi.gameOver) return;
      const loser = AppStateShogi.turn;
      const winner = ShogiCore.otherColor(loser);
      AppStateShogi.gameOver = true;
      announceGameResultShogi(colorNameShogi(winner) + " wins", colorNameShogi(winner) + " wins by resignation.");
      recordShogiStatsIfVsAi("loss");
      updateGameLabelsShogi();
    });
  }

  if (promoteYesBtn) promoteYesBtn.addEventListener("click", () => resolvePendingPromotionShogi(true));
  if (promoteNoBtn) promoteNoBtn.addEventListener("click", () => resolvePendingPromotionShogi(false));

  updateColorChoiceVisibilityShogi();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SHOGI_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateShogi.mode = savedGame.mode;
    AppStateShogi.state = savedGame.state;
    AppStateShogi.turn = savedGame.turn;
    AppStateShogi.humanColor = savedGame.humanColor;
    AppStateShogi.aiLevel = savedGame.aiLevel;
    AppStateShogi.moveCount = savedGame.moveCount;
    AppStateShogi.gameOver = false;
    AppStateShogi.selected = null;
    AppStateShogi.legalTargets = {};
    AppStateShogi.pendingPromotion = null;
    AppStateShogi.lastMove = null;
    resetUndoStackShogi();
    setActiveModeButtonShogi(AppStateShogi.mode);
    setGameResultShogi("");
    showBoardSectionShogi();
    buildShogiBoardDOM();
    updateShogiBoard();
    updateShogiHands();
    updateGameLabelsShogi();
    if (AppStateShogi.mode === "offline-ai" && AppStateShogi.turn !== AppStateShogi.humanColor) {
      setStatusShogi("board-info", "Computer thinking…");
      setTimeout(aiTurnShogi, 300);
    } else {
      setStatusShogi("board-info", colorNameShogi(AppStateShogi.turn) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

/*** Selection & move/drop application ***/

function clearSelectionShogi() {
  AppStateShogi.selected = null;
  AppStateShogi.legalTargets = {};
}

function targetKey(r, c) {
  return r + "," + c;
}

function computeLegalTargetsShogi() {
  const targets = {};
  const sel = AppStateShogi.selected;
  if (!sel) return targets;
  if (sel.kind === "square") {
    ShogiCore.legalMoves(AppStateShogi.state, AppStateShogi.turn)
      .filter((m) => m.from[0] === sel.r && m.from[1] === sel.c)
      .forEach((m) => {
        const key = targetKey(m.to[0], m.to[1]);
        if (!targets[key]) targets[key] = { promoteOptions: [] };
        if (targets[key].promoteOptions.indexOf(m.promote) === -1) targets[key].promoteOptions.push(m.promote);
      });
  } else if (sel.kind === "hand") {
    ShogiCore.legalDrops(AppStateShogi.state, AppStateShogi.turn)
      .filter((d) => d.piece === sel.piece)
      .forEach((d) => {
        targets[targetKey(d.to[0], d.to[1])] = { promoteOptions: [false] };
      });
  }
  return targets;
}

function onShogiSquareClick(e) {
  if (AppStateShogi.gameOver) {
    setStatusShogi("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateShogi.pendingPromotion) return; // must resolve the prompt first
  if (AppStateShogi.mode === "offline-ai" && AppStateShogi.turn !== AppStateShogi.humanColor) {
    setStatusShogi("board-info", "Computer to move.");
    return;
  }
  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const key = targetKey(r, c);
  const piece = AppStateShogi.state.board[r][c];

  if (AppStateShogi.selected && AppStateShogi.legalTargets[key]) {
    beginMoveOrDropShogi(r, c, AppStateShogi.legalTargets[key]);
    return;
  }

  if (piece && piece.color === AppStateShogi.turn) {
    AppStateShogi.selected = { kind: "square", r, c };
    AppStateShogi.legalTargets = computeLegalTargetsShogi();
  } else {
    clearSelectionShogi();
  }
  updateShogiBoard();
  updateShogiHands();
}

function onShogiHandClick(color, piece) {
  if (AppStateShogi.gameOver) return;
  if (AppStateShogi.pendingPromotion) return;
  if (color !== AppStateShogi.turn) return;
  if (AppStateShogi.mode === "offline-ai" && AppStateShogi.turn !== AppStateShogi.humanColor) return;
  if (AppStateShogi.state.hands[color][piece] <= 0) return;

  if (AppStateShogi.selected && AppStateShogi.selected.kind === "hand" && AppStateShogi.selected.piece === piece) {
    clearSelectionShogi();
  } else {
    AppStateShogi.selected = { kind: "hand", piece };
    AppStateShogi.legalTargets = computeLegalTargetsShogi();
  }
  updateShogiBoard();
  updateShogiHands();
}

function beginMoveOrDropShogi(r, c, targetInfo) {
  const sel = AppStateShogi.selected;
  if (sel.kind === "hand") {
    applyShogiDrop(sel.piece, r, c);
    return;
  }
  const options = targetInfo.promoteOptions;
  const from = [sel.r, sel.c];
  const to = [r, c];
  if (options.length === 1) {
    applyShogiMove(from, to, options[0]);
    return;
  }
  AppStateShogi.pendingPromotion = { from, to };
  clearSelectionShogi();
  updateShogiBoard();
  const promptEl = document.getElementById("shogi-promotion-prompt");
  if (promptEl) promptEl.classList.remove("hidden");
  setStatusShogi("board-info", "Promote this piece?");
}

function resolvePendingPromotionShogi(promote) {
  const pending = AppStateShogi.pendingPromotion;
  if (!pending) return;
  AppStateShogi.pendingPromotion = null;
  const promptEl = document.getElementById("shogi-promotion-prompt");
  if (promptEl) promptEl.classList.add("hidden");
  applyShogiMove(pending.from, pending.to, promote);
}

function applyShogiMove(from, to, promote) {
  pushUndoSnapshotShogi();
  const mover = AppStateShogi.turn;
  AppStateShogi.state = ShogiCore.applyMove(AppStateShogi.state, { from, to, promote });
  AppStateShogi.lastMove = { from, to };
  finishShogiTurn(mover);
}

function applyShogiDrop(piece, r, c) {
  pushUndoSnapshotShogi();
  const mover = AppStateShogi.turn;
  AppStateShogi.state = ShogiCore.applyDrop(AppStateShogi.state, mover, piece, r, c);
  AppStateShogi.lastMove = { from: null, to: [r, c] };
  finishShogiTurn(mover);
}

function finishShogiTurn(mover) {
  AppStateShogi.moveCount++;
  clearSelectionShogi();
  const nextTurn = ShogiCore.otherColor(mover);
  AppStateShogi.turn = nextTurn;
  updateShogiBoard();
  updateShogiHands();
  updateGameLabelsShogi();

  const end = ShogiCore.detectGameEnd(AppStateShogi.state, nextTurn);
  if (end.status === "checkmate") {
    AppStateShogi.gameOver = true;
    const winnerName = colorNameShogi(end.winner);
    announceGameResultShogi(winnerName + " wins", winnerName + " wins by checkmate!");
    recordShogiStatsIfVsAi(end.winner === AppStateShogi.humanColor ? "win" : "loss");
    updateGameLabelsShogi();
    return;
  }

  const inCheck = ShogiCore.isInCheck(AppStateShogi.state.board, nextTurn);
  maybeTriggerAiTurnShogi();
  if (!(AppStateShogi.mode === "offline-ai" && nextTurn !== AppStateShogi.humanColor)) {
    setStatusShogi("board-info", colorNameShogi(nextTurn) + " to move." + (inCheck ? " Check!" : ""));
  }
}

function maybeTriggerAiTurnShogi() {
  if (AppStateShogi.gameOver) return;
  if (AppStateShogi.mode === "offline-ai" && AppStateShogi.turn !== AppStateShogi.humanColor) {
    setTimeout(aiTurnShogi, 400);
  }
}

function aiTurnShogi() {
  if (AppStateShogi.mode !== "offline-ai" || AppStateShogi.gameOver) return;
  const aiColor = ShogiCore.otherColor(AppStateShogi.humanColor);
  if (AppStateShogi.turn !== aiColor) return;

  setStatusShogi("board-info", "Computer thinking…");
  setTimeout(() => {
    const action = ShogiAi.chooseAction(AppStateShogi.state, aiColor, AppStateShogi.aiLevel);
    if (!action) return;
    pushUndoSnapshotShogi();
    if (action.kind === "move") {
      AppStateShogi.state = ShogiCore.applyMove(AppStateShogi.state, action);
      AppStateShogi.lastMove = { from: action.from, to: action.to };
    } else {
      AppStateShogi.state = ShogiCore.applyDrop(AppStateShogi.state, aiColor, action.piece, action.to[0], action.to[1]);
      AppStateShogi.lastMove = { from: null, to: action.to };
    }
    finishShogiTurn(aiColor);
  }, 350);
}

function undoLastMove() {
  if (!AppStateShogi.undoStack || !AppStateShogi.undoStack.length) return;
  let prev = AppStateShogi.undoStack.pop();
  if (AppStateShogi.mode === "offline-ai") {
    while (prev.turn !== AppStateShogi.humanColor && AppStateShogi.undoStack.length) {
      prev = AppStateShogi.undoStack.pop();
    }
  }
  AppStateShogi.state = prev.state;
  AppStateShogi.turn = prev.turn;
  AppStateShogi.gameOver = prev.gameOver;
  AppStateShogi.moveCount = prev.moveCount;
  AppStateShogi.lastMove = prev.lastMove;
  AppStateShogi.pendingPromotion = null;
  clearSelectionShogi();
  setGameResultShogi("");
  const promptEl = document.getElementById("shogi-promotion-prompt");
  if (promptEl) promptEl.classList.add("hidden");
  updateShogiBoard();
  updateShogiHands();
  updateGameLabelsShogi();
  setStatusShogi("board-info", "Move undone. " + colorNameShogi(AppStateShogi.turn) + " to move.");
}

function showBoardSectionShogi() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");

  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) menuToggle.textContent = "☰ Menu";
}

/*** Board rendering (float-grid, same technique as chess/checkers/Connect Four) ***/

function buildShogiBoardDOM() {
  const boardEl = document.getElementById("shogi-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < ShogiCore.SIZE; r++) {
    for (let c = 0; c < ShogiCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square shogi-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;

      const piece = document.createElement("span");
      piece.className = "shogi-piece hidden";
      square.appendChild(piece);

      square.addEventListener("click", onShogiSquareClick);
      boardEl.appendChild(square);
    }
  }

  ensureShogiSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureShogiSquareAspectRatio);
  } else {
    setTimeout(ensureShogiSquareAspectRatio, 0);
  }
  ensureShogiResizeHandler();
}

let einkShogiResizeHandlerAttached = false;
let einkShogiResizeTimeoutId = null;

function ensureShogiSquareAspectRatio() {
  const boardEl = document.getElementById("shogi-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / ShogiCore.SIZE;
  boardEl.querySelectorAll(".shogi-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureShogiResizeHandler() {
  if (einkShogiResizeHandlerAttached) return;
  einkShogiResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkShogiResizeTimeoutId !== null) clearTimeout(einkShogiResizeTimeoutId);
    einkShogiResizeTimeoutId = setTimeout(() => {
      einkShogiResizeTimeoutId = null;
      ensureShogiSquareAspectRatio();
    }, 150);
  });
}

function updateShogiBoard() {
  const boardEl = document.getElementById("shogi-board");
  if (!boardEl) return;

  const inCheckColor = AppStateShogi.gameOver ? null : AppStateShogi.turn;
  const kingInCheck = inCheckColor && ShogiCore.isInCheck(AppStateShogi.state.board, inCheckColor)
    ? ShogiCore.findKing(AppStateShogi.state.board, inCheckColor) : null;

  boardEl.querySelectorAll(".shogi-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateShogi.state.board[r][c];
    const pieceEl = sq.querySelector(".shogi-piece");
    if (pieceEl) {
      if (piece) {
        pieceEl.textContent = shogiPieceLabel(piece);
        pieceEl.classList.remove("hidden");
        pieceEl.classList.toggle("shogi-piece-w", piece.color === "w");
      } else {
        pieceEl.textContent = "";
        pieceEl.classList.add("hidden");
      }
    }

    const isSelected = AppStateShogi.selected && AppStateShogi.selected.kind === "square"
      && AppStateShogi.selected.r === r && AppStateShogi.selected.c === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("shogi-square-movable", !!AppStateShogi.legalTargets[targetKey(r, c)]);
    sq.classList.toggle("shogi-square-last-from",
      !!(AppStateShogi.lastMove && AppStateShogi.lastMove.from && AppStateShogi.lastMove.from[0] === r && AppStateShogi.lastMove.from[1] === c));
    sq.classList.toggle("shogi-square-last-to",
      !!(AppStateShogi.lastMove && AppStateShogi.lastMove.to[0] === r && AppStateShogi.lastMove.to[1] === c));
    sq.classList.toggle("shogi-square-check", !!(kingInCheck && kingInCheck.r === r && kingInCheck.c === c));

    let label = "Square " + (r + 1) + "," + (c + 1);
    label += piece ? ", " + colorNameShogi(piece.color) + " " + shogiPieceLabel(piece) : ", empty";
    sq.setAttribute("aria-label", label);
  });
}

function updateShogiHands() {
  [["b", "shogi-hand-b"], ["w", "shogi-hand-w"]].forEach(([color, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    ShogiCore.HAND_TYPES.forEach((type) => {
      const count = AppStateShogi.state.hands[color][type];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shogi-hand-piece" + (color === "w" ? " shogi-piece-w" : "");
      btn.disabled = count <= 0;
      const isSelected = AppStateShogi.selected && AppStateShogi.selected.kind === "hand"
        && AppStateShogi.selected.piece === type && AppStateShogi.turn === color;
      btn.classList.toggle("shogi-hand-piece-selected", !!isSelected);
      const label = document.createElement("span");
      label.className = "shogi-hand-piece-label";
      label.textContent = SHOGI_KANJI[type];
      const countEl = document.createElement("span");
      countEl.className = "shogi-hand-piece-count";
      countEl.textContent = String(count);
      btn.appendChild(label);
      btn.appendChild(countEl);
      btn.setAttribute("aria-label", colorNameShogi(color) + " hand, " + type + ", " + count + " available");
      btn.addEventListener("click", () => onShogiHandClick(color, type));
      el.appendChild(btn);
    });
  });
}

function updateGameLabelsShogi() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateShogi.moveCount ? "Move " + AppStateShogi.moveCount : "";
  updateUndoButtonVisibilityShogi();
  updateResignVisibilityShogi();

  if (AppStateShogi.gameOver) clearSavedShogiGame();
  else saveShogiGame();
}

function updateUndoButtonVisibilityShogi() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateShogi.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateShogi.gameOver));
}

function updateResignVisibilityShogi() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateShogi.gameOver);
}

document.addEventListener("DOMContentLoaded", initShogiApp);
