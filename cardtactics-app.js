// onitama-app.js
// Wires OnitamaCore/OnitamaAi to the onitama.html UI. The board is a
// 5x5 float-grid (same technique as chess/checkers, with the width
// override the Connect Four lesson calls for whenever a board isn't 8
// columns wide). Pieces are told apart by fill (Blue solid, Red
// outlined) plus the master getting its own distinct ring marker, the
// same structural-not-color-based convention used everywhere else in
// this app.
//
// Turn flow mirrors the physical game: click one of your two cards to
// make it active, click one of your own pieces to see where that card
// lets it go, then click a highlighted destination to move. The used
// card swaps into the middle and the previous middle card joins your
// hand in its place - shown directly by redrawing all three card rows
// after every move rather than animating the exchange.

const ONITAMA_KANJI = {}; // reserved, not currently used - cards render as small move-diagrams instead of text

const AppStateOnitama = {
  mode: "offline",        // "offline" | "offline-ai"
  state: OnitamaCore.createInitialState(),
  turn: "blue",           // "blue" | "red" - Blue always moves first
  humanColor: "blue",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  selectedCard: null,     // cardId or null
  selectedPiece: null,    // [r,c] or null
  legalTargets: {},       // "r,c" -> true, for the current card+piece selection
  moveCount: 0,
  lastMove: null,         // {from: [r, c], to: [r, c]} of the latest move, for the board marker
  undoStack: []
};

const ONITAMA_SAVE_KEY = "einkchess_save_onitama";

function saveOnitamaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(ONITAMA_SAVE_KEY, {
    mode: AppStateOnitama.mode,
    state: AppStateOnitama.state,
    turn: AppStateOnitama.turn,
    humanColor: AppStateOnitama.humanColor,
    aiLevel: AppStateOnitama.aiLevel,
    moveCount: AppStateOnitama.moveCount
  });
}

function clearSavedOnitamaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(ONITAMA_SAVE_KEY);
}

function recordOnitamaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateOnitama.mode !== "offline-ai") return;
  GameStats.record("onitama", outcome);
}

function colorNameOnitama(color) {
  return color === "blue" ? "Blue" : "Red";
}

function setStatusOnitama(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultOnitama(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleOnitama(winner) {
  if (AppStateOnitama.mode === "offline-ai") {
    return winner === AppStateOnitama.humanColor ? "You win!" : "You lose";
  }
  return colorNameOnitama(winner) + " wins";
}

function announceGameResultOnitama(resultCode, message) {
  setGameResultOnitama(message);
  setStatusOnitama("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackOnitama() {
  AppStateOnitama.undoStack = [];
}

function pushUndoSnapshotOnitama() {
  AppStateOnitama.undoStack.push({
    state: OnitamaCore.cloneState(AppStateOnitama.state),
    turn: AppStateOnitama.turn,
    gameOver: AppStateOnitama.gameOver,
    moveCount: AppStateOnitama.moveCount,
    lastMove: AppStateOnitama.lastMove
  });
}

function initOnitamaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("onitama-color-choice");
  const levelInline = document.getElementById("onitama-level-inline");
  const startGameBtn = document.getElementById("start-onitama-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibilityOnitama() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonOnitama(mode) {
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

  function startNewGameOnitama(mode, humanColor, level) {
    AppStateOnitama.mode = mode;
    AppStateOnitama.state = OnitamaCore.createInitialState();
    AppStateOnitama.turn = "blue";
    AppStateOnitama.humanColor = humanColor;
    AppStateOnitama.aiLevel = level;
    AppStateOnitama.gameOver = false;
    AppStateOnitama.selectedCard = null;
    AppStateOnitama.selectedPiece = null;
    AppStateOnitama.legalTargets = {};
    AppStateOnitama.moveCount = 0;
    AppStateOnitama.lastMove = null;
    resetUndoStackOnitama();
    setGameResultOnitama("");
    showBoardSectionOnitama();
    buildOnitamaBoardDOM();
    updateOnitamaBoard();
    updateOnitamaCards();
    updateGameLabelsOnitama();

    if (mode === "offline-ai" && humanColor !== "blue") {
      setStatusOnitama("board-info", "Computer thinking…");
      setTimeout(aiTurnOnitama, AiPacing.delay(300));
    } else {
      setStatusOnitama("board-info", colorNameOnitama(AppStateOnitama.turn) + " to move. Choose a card.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonOnitama("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameOnitama("offline", "blue", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonOnitama("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateOnitama.aiLevel || 2);
    updateColorChoiceVisibilityOnitama();
    setStatusOnitama("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityOnitama);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='onitama-color']:checked");
    const humanColor = colorInput && colorInput.value === "red" ? "red" : "blue";

    if (level === 0) {
      setActiveModeButtonOnitama("offline-ai");
      startNewGameOnitama("offline", "blue", 0);
      setStatusOnitama("offline-onitama-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonOnitama("offline-ai");
    startNewGameOnitama("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusOnitama("offline-onitama-status",
      "You play " + colorNameOnitama(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateOnitama.gameOver) return;
      const loser = AppStateOnitama.turn;
      const winner = OnitamaCore.otherPlayer(loser);
      AppStateOnitama.gameOver = true;
      announceGameResultOnitama(resultTitleOnitama(winner), colorNameOnitama(winner) + " wins by resignation.");
      recordOnitamaStatsIfVsAi("loss");
      updateGameLabelsOnitama();
    });
  }

  updateColorChoiceVisibilityOnitama();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(ONITAMA_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateOnitama.mode = savedGame.mode;
    AppStateOnitama.state = savedGame.state;
    AppStateOnitama.turn = savedGame.turn;
    AppStateOnitama.humanColor = savedGame.humanColor;
    AppStateOnitama.aiLevel = savedGame.aiLevel;
    AppStateOnitama.moveCount = savedGame.moveCount;
    AppStateOnitama.lastMove = null;
    AppStateOnitama.gameOver = false;
    AppStateOnitama.selectedCard = null;
    AppStateOnitama.selectedPiece = null;
    AppStateOnitama.legalTargets = {};
    resetUndoStackOnitama();
    setActiveModeButtonOnitama(AppStateOnitama.mode);
    setGameResultOnitama("");
    showBoardSectionOnitama();
    buildOnitamaBoardDOM();
    updateOnitamaBoard();
    updateOnitamaCards();
    updateGameLabelsOnitama();
    if (AppStateOnitama.mode === "offline-ai" && AppStateOnitama.turn !== AppStateOnitama.humanColor) {
      setStatusOnitama("board-info", "Computer thinking…");
      setTimeout(aiTurnOnitama, AiPacing.delay(300));
    } else {
      setStatusOnitama("board-info", colorNameOnitama(AppStateOnitama.turn) + " to move. Choose a card.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeyOnitama(r, c) {
  return r + "," + c;
}

function computeLegalTargetsOnitama() {
  const targets = {};
  const sel = AppStateOnitama.selectedPiece;
  const card = AppStateOnitama.selectedCard;
  if (!sel || !card) return targets;
  OnitamaCore.getLegalMoves(AppStateOnitama.state, AppStateOnitama.turn)
    .filter((m) => m.from[0] === sel[0] && m.from[1] === sel[1] && m.card === card)
    .forEach((m) => { targets[targetKeyOnitama(m.to[0], m.to[1])] = true; });
  return targets;
}

function onOnitamaCardClick(color, cardId) {
  if (AppStateOnitama.gameOver) return;
  if (color !== AppStateOnitama.turn) return;
  if (AppStateOnitama.mode === "offline-ai" && AppStateOnitama.turn !== AppStateOnitama.humanColor) return;

  if (AppStateOnitama.selectedCard === cardId) {
    AppStateOnitama.selectedCard = null;
    AppStateOnitama.selectedPiece = null;
    AppStateOnitama.legalTargets = {};
  } else {
    AppStateOnitama.selectedCard = cardId;
    AppStateOnitama.selectedPiece = null;
    AppStateOnitama.legalTargets = {};
  }
  updateOnitamaBoard();
  updateOnitamaCards();
  setStatusOnitama("board-info", AppStateOnitama.selectedCard
    ? "Choose one of your pieces to move with this card."
    : colorNameOnitama(AppStateOnitama.turn) + " to move. Choose a card.");
}

function onOnitamaSquareClick(r, c) {
  if (AppStateOnitama.gameOver) return;
  if (AppStateOnitama.mode === "offline-ai" && AppStateOnitama.turn !== AppStateOnitama.humanColor) {
    setStatusOnitama("board-info", "Computer to move.");
    return;
  }
  const piece = AppStateOnitama.state.board[r][c];
  const key = targetKeyOnitama(r, c);

  if (AppStateOnitama.selectedPiece && AppStateOnitama.legalTargets[key]) {
    applyOnitamaMove({ from: AppStateOnitama.selectedPiece, to: [r, c], card: AppStateOnitama.selectedCard });
    return;
  }

  if (!AppStateOnitama.selectedCard) {
    setStatusOnitama("board-info", "Choose a card first.");
    return;
  }

  if (piece && piece.color === AppStateOnitama.turn) {
    const hasMove = OnitamaCore.getLegalMoves(AppStateOnitama.state, AppStateOnitama.turn)
      .some((m) => m.from[0] === r && m.from[1] === c && m.card === AppStateOnitama.selectedCard);
    if (!hasMove) {
      setStatusOnitama("board-info", "That piece has no legal move with this card.");
      return;
    }
    AppStateOnitama.selectedPiece = [r, c];
    AppStateOnitama.legalTargets = computeLegalTargetsOnitama();
    updateOnitamaBoard();
    setStatusOnitama("board-info", "Choose where to move it.");
  } else {
    AppStateOnitama.selectedPiece = null;
    AppStateOnitama.legalTargets = {};
    updateOnitamaBoard();
  }
}

function applyOnitamaMove(move) {
  pushUndoSnapshotOnitama();
  const mover = AppStateOnitama.turn;
  AppStateOnitama.state = OnitamaCore.applyMove(AppStateOnitama.state, mover, move);
  AppStateOnitama.lastMove = { from: move.from.slice(), to: move.to.slice() };
  AppStateOnitama.moveCount++;
  AppStateOnitama.selectedCard = null;
  AppStateOnitama.selectedPiece = null;
  AppStateOnitama.legalTargets = {};
  updateOnitamaBoard();
  updateOnitamaCards();
  updateGameLabelsOnitama();

  if (AppStateOnitama.state.gameOver) {
    AppStateOnitama.gameOver = true;
    const winnerName = colorNameOnitama(AppStateOnitama.state.winner);
    const reason = AppStateOnitama.state.winReason === "shrine" ? " by reaching the shrine!" : " by capturing the master!";
    announceGameResultOnitama(resultTitleOnitama(AppStateOnitama.state.winner), winnerName + " wins" + reason);
    recordOnitamaStatsIfVsAi(AppStateOnitama.state.winner === AppStateOnitama.humanColor ? "win" : "loss");
    updateGameLabelsOnitama();
    return;
  }

  AppStateOnitama.turn = OnitamaCore.otherPlayer(mover);
  updateOnitamaBoard();
  updateOnitamaCards();
  updateGameLabelsOnitama();
  maybeTriggerAiTurnOnitama();
  if (!(AppStateOnitama.mode === "offline-ai" && AppStateOnitama.turn !== AppStateOnitama.humanColor)) {
    setStatusOnitama("board-info", colorNameOnitama(mover) + " played. " + colorNameOnitama(AppStateOnitama.turn) + " to move. Choose a card.");
  }
}

function maybeTriggerAiTurnOnitama() {
  if (AppStateOnitama.gameOver) return;
  if (AppStateOnitama.mode === "offline-ai" && AppStateOnitama.turn !== AppStateOnitama.humanColor) {
    setTimeout(aiTurnOnitama, AiPacing.delay(400));
  }
}

function aiTurnOnitama() {
  if (AppStateOnitama.mode !== "offline-ai" || AppStateOnitama.gameOver) return;
  const aiColor = OnitamaCore.otherPlayer(AppStateOnitama.humanColor);
  if (AppStateOnitama.turn !== aiColor) return;

  setStatusOnitama("board-info", "Computer thinking…");
  setTimeout(() => {
    const move = OnitamaAi.chooseMove(AppStateOnitama.state, aiColor, AppStateOnitama.aiLevel);
    if (!move) return;
    applyOnitamaMove(move);
  }, AiPacing.delay(350));
}

function undoLastMove() {
  if (!AppStateOnitama.undoStack || !AppStateOnitama.undoStack.length) return;
  let prev = AppStateOnitama.undoStack.pop();
  if (AppStateOnitama.mode === "offline-ai") {
    while (prev.turn !== AppStateOnitama.humanColor && AppStateOnitama.undoStack.length) {
      prev = AppStateOnitama.undoStack.pop();
    }
  }
  AppStateOnitama.state = prev.state;
  AppStateOnitama.turn = prev.turn;
  AppStateOnitama.gameOver = prev.gameOver;
  AppStateOnitama.moveCount = prev.moveCount;
  AppStateOnitama.lastMove = prev.lastMove || null;
  AppStateOnitama.selectedCard = null;
  AppStateOnitama.selectedPiece = null;
  AppStateOnitama.legalTargets = {};
  setGameResultOnitama("");
  updateOnitamaBoard();
  updateOnitamaCards();
  updateGameLabelsOnitama();
  setStatusOnitama("board-info", "Move undone. " + colorNameOnitama(AppStateOnitama.turn) + " to move. Choose a card.");
}

function showBoardSectionOnitama() {
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

/*** Board rendering (float-grid, same technique as chess/checkers) ***/

function buildOnitamaBoardDOM() {
  const boardEl = document.getElementById("onitama-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < OnitamaCore.SIZE; r++) {
    for (let c = 0; c < OnitamaCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square onitama-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (r === OnitamaCore.RED_SHRINE[0] && c === OnitamaCore.RED_SHRINE[1]) square.classList.add("onitama-square-shrine");
      if (r === OnitamaCore.BLUE_SHRINE[0] && c === OnitamaCore.BLUE_SHRINE[1]) square.classList.add("onitama-square-shrine");

      const piece = document.createElement("span");
      piece.className = "onitama-piece";
      square.appendChild(piece);

      square.addEventListener("click", () => onOnitamaSquareClick(r, c));
      boardEl.appendChild(square);
    }
  }

  ensureOnitamaSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureOnitamaSquareAspectRatio);
  } else {
    setTimeout(ensureOnitamaSquareAspectRatio, 0);
  }
  ensureOnitamaResizeHandler();
}

let einkOnitamaResizeHandlerAttached = false;
let einkOnitamaResizeTimeoutId = null;

function ensureOnitamaSquareAspectRatio() {
  const boardEl = document.getElementById("onitama-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / OnitamaCore.SIZE;
  boardEl.querySelectorAll(".onitama-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureOnitamaResizeHandler() {
  if (einkOnitamaResizeHandlerAttached) return;
  einkOnitamaResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkOnitamaResizeTimeoutId !== null) clearTimeout(einkOnitamaResizeTimeoutId);
    einkOnitamaResizeTimeoutId = setTimeout(() => {
      einkOnitamaResizeTimeoutId = null;
      ensureOnitamaSquareAspectRatio();
    }, 150);
  });
}

function updateOnitamaBoard() {
  const boardEl = document.getElementById("onitama-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".onitama-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateOnitama.state.board[r][c];
    const pieceEl = sq.querySelector(".onitama-piece");
    if (pieceEl) {
      pieceEl.classList.remove("onitama-piece-blue", "onitama-piece-red", "onitama-piece-king");
      if (piece) {
        pieceEl.classList.add(piece.color === "blue" ? "onitama-piece-blue" : "onitama-piece-red");
        if (piece.king) pieceEl.classList.add("onitama-piece-king");
      }
    }

    const isSelected = AppStateOnitama.selectedPiece
      && AppStateOnitama.selectedPiece[0] === r && AppStateOnitama.selectedPiece[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("onitama-square-movable", !!AppStateOnitama.legalTargets[targetKeyOnitama(r, c)]);
    const last = AppStateOnitama.lastMove;
    sq.classList.toggle("lm-from", !!last && last.from[0] === r && last.from[1] === c);
    sq.classList.toggle("lm-to", !!last && last.to[0] === r && last.to[1] === c);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + colorNameOnitama(piece.color) + (piece.king ? " master" : " pawn") : ", empty";
    I18n.setAria(sq, label);
  });
}

/*** Card rendering (small move-diagrams) ***/

function buildCardDiagram(cardId, forColor) {
  const wrap = document.createElement("div");
  wrap.className = "onitama-card-diagram";
  const moves = OnitamaCore.cardMovesFor(cardId, forColor);
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const cell = document.createElement("span");
      cell.className = "onitama-card-cell";
      if (r === 0 && c === 0) cell.classList.add("onitama-card-cell-center");
      else if (moves.some(([dr, dc]) => dr === r && dc === c)) cell.classList.add("onitama-card-cell-move");
      wrap.appendChild(cell);
    }
  }
  return wrap;
}

function buildCardElement(cardId, ownerColor) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "onitama-card";
  const isSelected = AppStateOnitama.selectedCard === cardId && AppStateOnitama.turn === ownerColor;
  card.classList.toggle("onitama-card-selected", isSelected);
  const label = document.createElement("div");
  label.className = "onitama-card-name";
  I18n.setKey(label, "cardtactics_card_" + cardId);
  card.appendChild(label);
  card.appendChild(buildCardDiagram(cardId, ownerColor));
  card.addEventListener("click", () => onOnitamaCardClick(ownerColor, cardId));
  return card;
}

function updateOnitamaCards() {
  const redRow = document.getElementById("onitama-cards-red");
  const blueRow = document.getElementById("onitama-cards-blue");
  const neutralEl = document.getElementById("onitama-neutral-card");
  if (!redRow || !blueRow || !neutralEl) return;

  redRow.innerHTML = "";
  AppStateOnitama.state.cards.red.forEach((id) => redRow.appendChild(buildCardElement(id, "red")));

  blueRow.innerHTML = "";
  AppStateOnitama.state.cards.blue.forEach((id) => blueRow.appendChild(buildCardElement(id, "blue")));

  neutralEl.innerHTML = "";
  neutralEl.appendChild(buildCardDiagram(AppStateOnitama.state.cards.neutral, "blue"));
  const label = document.createElement("div");
  label.className = "onitama-card-name";
  I18n.setKey(label, "cardtactics_card_" + AppStateOnitama.state.cards.neutral);
  neutralEl.insertBefore(label, neutralEl.firstChild);
}

function updateGameLabelsOnitama() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateOnitama.moveCount ? "Move " + AppStateOnitama.moveCount : "");
  updateUndoButtonVisibilityOnitama();
  updateResignVisibilityOnitama();

  if (AppStateOnitama.gameOver) clearSavedOnitamaGame();
  else saveOnitamaGame();
}

function updateUndoButtonVisibilityOnitama() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateOnitama.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateOnitama.gameOver));
}

function updateResignVisibilityOnitama() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateOnitama.gameOver);
}

document.addEventListener("DOMContentLoaded", initOnitamaApp);
