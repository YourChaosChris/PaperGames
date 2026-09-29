// cardtactics-app.js
// Wires CardTacticsCore/CardTacticsAi to the cardtactics.html UI. The board is a
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

const CARDTACTICS_KANJI = {}; // reserved, not currently used - cards render as small move-diagrams instead of text

const AppStateCardTactics = {
  mode: "offline",        // "offline" | "offline-ai"
  state: CardTacticsCore.createInitialState(),
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

const CARDTACTICS_SAVE_KEY = "einkchess_save_cardtactics";

function saveCardTacticsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(CARDTACTICS_SAVE_KEY, {
    mode: AppStateCardTactics.mode,
    state: AppStateCardTactics.state,
    turn: AppStateCardTactics.turn,
    humanColor: AppStateCardTactics.humanColor,
    aiLevel: AppStateCardTactics.aiLevel,
    moveCount: AppStateCardTactics.moveCount
  });
}

function clearSavedCardTacticsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(CARDTACTICS_SAVE_KEY);
}

function recordCardTacticsStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateCardTactics.mode !== "offline-ai") return;
  GameStats.record("cardtactics", outcome);
}

function colorNameCardTactics(color) {
  return color === "blue" ? "Blue" : "Red";
}

function setStatusCardTactics(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultCardTactics(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function resultTitleCardTactics(winner) {
  if (AppStateCardTactics.mode === "offline-ai") {
    return winner === AppStateCardTactics.humanColor ? "You win!" : "You lose";
  }
  return colorNameCardTactics(winner) + " wins";
}

function announceGameResultCardTactics(resultCode, message) {
  setGameResultCardTactics(message);
  setStatusCardTactics("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackCardTactics() {
  AppStateCardTactics.undoStack = [];
}

function pushUndoSnapshotCardTactics() {
  AppStateCardTactics.undoStack.push({
    state: CardTacticsCore.cloneState(AppStateCardTactics.state),
    turn: AppStateCardTactics.turn,
    gameOver: AppStateCardTactics.gameOver,
    moveCount: AppStateCardTactics.moveCount,
    lastMove: AppStateCardTactics.lastMove
  });
}

function initCardTacticsApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("cardtactics-color-choice");
  const levelInline = document.getElementById("cardtactics-level-inline");
  const startGameBtn = document.getElementById("start-cardtactics-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibilityCardTactics() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonCardTactics(mode) {
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

  function startNewGameCardTactics(mode, humanColor, level) {
    AppStateCardTactics.mode = mode;
    AppStateCardTactics.state = CardTacticsCore.createInitialState();
    AppStateCardTactics.turn = "blue";
    AppStateCardTactics.humanColor = humanColor;
    AppStateCardTactics.aiLevel = level;
    AppStateCardTactics.gameOver = false;
    AppStateCardTactics.selectedCard = null;
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
    AppStateCardTactics.moveCount = 0;
    AppStateCardTactics.lastMove = null;
    resetUndoStackCardTactics();
    setGameResultCardTactics("");
    showBoardSectionCardTactics();
    buildCardTacticsBoardDOM();
    updateCardTacticsBoard();
    updateCardTacticsCards();
    updateGameLabelsCardTactics();

    if (mode === "offline-ai" && humanColor !== "blue") {
      setStatusCardTactics("board-info", "Computer thinking…");
      setTimeout(aiTurnCardTactics, AiPacing.delay(300));
    } else {
      setStatusCardTactics("board-info", colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonCardTactics("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameCardTactics("offline", "blue", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonCardTactics("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateCardTactics.aiLevel || 2);
    updateColorChoiceVisibilityCardTactics();
    setStatusCardTactics("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityCardTactics);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='cardtactics-color']:checked");
    const humanColor = colorInput && colorInput.value === "red" ? "red" : "blue";

    if (level === 0) {
      setActiveModeButtonCardTactics("offline-ai");
      startNewGameCardTactics("offline", "blue", 0);
      setStatusCardTactics("offline-cardtactics-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonCardTactics("offline-ai");
    startNewGameCardTactics("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusCardTactics("offline-cardtactics-status",
      "You play " + colorNameCardTactics(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateCardTactics.gameOver) return;
      const loser = AppStateCardTactics.turn;
      const winner = CardTacticsCore.otherPlayer(loser);
      AppStateCardTactics.gameOver = true;
      announceGameResultCardTactics(resultTitleCardTactics(winner), colorNameCardTactics(winner) + " wins by resignation.");
      recordCardTacticsStatsIfVsAi("loss");
      updateGameLabelsCardTactics();
    });
  }

  updateColorChoiceVisibilityCardTactics();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(CARDTACTICS_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateCardTactics.mode = savedGame.mode;
    AppStateCardTactics.state = savedGame.state;
    AppStateCardTactics.turn = savedGame.turn;
    AppStateCardTactics.humanColor = savedGame.humanColor;
    AppStateCardTactics.aiLevel = savedGame.aiLevel;
    AppStateCardTactics.moveCount = savedGame.moveCount;
    AppStateCardTactics.lastMove = null;
    AppStateCardTactics.gameOver = false;
    AppStateCardTactics.selectedCard = null;
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
    resetUndoStackCardTactics();
    setActiveModeButtonCardTactics(AppStateCardTactics.mode);
    setGameResultCardTactics("");
    showBoardSectionCardTactics();
    buildCardTacticsBoardDOM();
    updateCardTacticsBoard();
    updateCardTacticsCards();
    updateGameLabelsCardTactics();
    if (AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor) {
      setStatusCardTactics("board-info", "Computer thinking…");
      setTimeout(aiTurnCardTactics, AiPacing.delay(300));
    } else {
      setStatusCardTactics("board-info", colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function targetKeyCardTactics(r, c) {
  return r + "," + c;
}

function computeLegalTargetsCardTactics() {
  const targets = {};
  const sel = AppStateCardTactics.selectedPiece;
  const card = AppStateCardTactics.selectedCard;
  if (!sel || !card) return targets;
  CardTacticsCore.getLegalMoves(AppStateCardTactics.state, AppStateCardTactics.turn)
    .filter((m) => m.from[0] === sel[0] && m.from[1] === sel[1] && m.card === card)
    .forEach((m) => { targets[targetKeyCardTactics(m.to[0], m.to[1])] = true; });
  return targets;
}

function onCardTacticsCardClick(color, cardId) {
  if (AppStateCardTactics.gameOver) return;
  if (color !== AppStateCardTactics.turn) return;
  if (AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor) return;

  if (AppStateCardTactics.selectedCard === cardId) {
    AppStateCardTactics.selectedCard = null;
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
  } else {
    AppStateCardTactics.selectedCard = cardId;
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
  }
  updateCardTacticsBoard();
  updateCardTacticsCards();
  setStatusCardTactics("board-info", AppStateCardTactics.selectedCard
    ? "Choose one of your pieces to move with this card."
    : colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.");
}

function onCardTacticsSquareClick(r, c) {
  if (AppStateCardTactics.gameOver) return;
  if (AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor) {
    setStatusCardTactics("board-info", "Computer to move.");
    return;
  }
  const piece = AppStateCardTactics.state.board[r][c];
  const key = targetKeyCardTactics(r, c);

  if (AppStateCardTactics.selectedPiece && AppStateCardTactics.legalTargets[key]) {
    applyCardTacticsMove({ from: AppStateCardTactics.selectedPiece, to: [r, c], card: AppStateCardTactics.selectedCard });
    return;
  }

  if (!AppStateCardTactics.selectedCard) {
    setStatusCardTactics("board-info", "Choose a card first.");
    return;
  }

  if (piece && piece.color === AppStateCardTactics.turn) {
    const hasMove = CardTacticsCore.getLegalMoves(AppStateCardTactics.state, AppStateCardTactics.turn)
      .some((m) => m.from[0] === r && m.from[1] === c && m.card === AppStateCardTactics.selectedCard);
    if (!hasMove) {
      setStatusCardTactics("board-info", "That piece has no legal move with this card.");
      return;
    }
    AppStateCardTactics.selectedPiece = [r, c];
    AppStateCardTactics.legalTargets = computeLegalTargetsCardTactics();
    updateCardTacticsBoard();
    setStatusCardTactics("board-info", "Choose where to move it.");
  } else {
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
    updateCardTacticsBoard();
  }
}

function applyCardTacticsMove(move) {
  pushUndoSnapshotCardTactics();
  const mover = AppStateCardTactics.turn;
  AppStateCardTactics.state = CardTacticsCore.applyMove(AppStateCardTactics.state, mover, move);
  AppStateCardTactics.lastMove = { from: move.from.slice(), to: move.to.slice() };
  AppStateCardTactics.moveCount++;
  AppStateCardTactics.selectedCard = null;
  AppStateCardTactics.selectedPiece = null;
  AppStateCardTactics.legalTargets = {};
  updateCardTacticsBoard();
  updateCardTacticsCards();
  updateGameLabelsCardTactics();

  if (AppStateCardTactics.state.gameOver) {
    AppStateCardTactics.gameOver = true;
    const winnerName = colorNameCardTactics(AppStateCardTactics.state.winner);
    const reason = AppStateCardTactics.state.winReason === "shrine" ? " by reaching the shrine!" : " by capturing the master!";
    announceGameResultCardTactics(resultTitleCardTactics(AppStateCardTactics.state.winner), winnerName + " wins" + reason);
    recordCardTacticsStatsIfVsAi(AppStateCardTactics.state.winner === AppStateCardTactics.humanColor ? "win" : "loss");
    updateGameLabelsCardTactics();
    return;
  }

  AppStateCardTactics.turn = CardTacticsCore.otherPlayer(mover);
  updateCardTacticsBoard();
  updateCardTacticsCards();
  updateGameLabelsCardTactics();
  maybeTriggerAiTurnCardTactics();
  if (!(AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor)) {
    setStatusCardTactics("board-info", colorNameCardTactics(mover) + " played. " + colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.");
  }
}

function maybeTriggerAiTurnCardTactics() {
  if (AppStateCardTactics.gameOver) return;
  if (AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor) {
    setTimeout(aiTurnCardTactics, AiPacing.delay(400));
  }
}

function aiTurnCardTactics() {
  if (AppStateCardTactics.mode !== "offline-ai" || AppStateCardTactics.gameOver) return;
  const aiColor = CardTacticsCore.otherPlayer(AppStateCardTactics.humanColor);
  if (AppStateCardTactics.turn !== aiColor) return;

  setStatusCardTactics("board-info", "Computer thinking…");
  // The position this search is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = AppStateCardTactics.state;
  setTimeout(() => {
    if (AppStateCardTactics.gameOver || AppStateCardTactics.state !== scheduledFor || AppStateCardTactics.turn !== aiColor) return;
    const move = CardTacticsAi.chooseMove(AppStateCardTactics.state, aiColor, AppStateCardTactics.aiLevel);
    if (!move) return;
    applyCardTacticsMove(move);
  }, AiPacing.delay(350));
}

function undoLastMove() {
  if (!AppStateCardTactics.undoStack || !AppStateCardTactics.undoStack.length) return;
  let prev = AppStateCardTactics.undoStack.pop();
  if (AppStateCardTactics.mode === "offline-ai") {
    while (prev.turn !== AppStateCardTactics.humanColor && AppStateCardTactics.undoStack.length) {
      prev = AppStateCardTactics.undoStack.pop();
    }
  }
  AppStateCardTactics.state = prev.state;
  AppStateCardTactics.turn = prev.turn;
  AppStateCardTactics.gameOver = prev.gameOver;
  AppStateCardTactics.moveCount = prev.moveCount;
  AppStateCardTactics.lastMove = prev.lastMove || null;
  AppStateCardTactics.selectedCard = null;
  AppStateCardTactics.selectedPiece = null;
  AppStateCardTactics.legalTargets = {};
  setGameResultCardTactics("");
  updateCardTacticsBoard();
  updateCardTacticsCards();
  updateGameLabelsCardTactics();
  setStatusCardTactics("board-info", "Move undone. " + colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.");
}

function showBoardSectionCardTactics() {
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

function buildCardTacticsBoardDOM() {
  const boardEl = document.getElementById("cardtactics-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 0; r < CardTacticsCore.SIZE; r++) {
    for (let c = 0; c < CardTacticsCore.SIZE; c++) {
      const square = document.createElement("button");
      square.className = "square cardtactics-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (r === CardTacticsCore.RED_SHRINE[0] && c === CardTacticsCore.RED_SHRINE[1]) square.classList.add("cardtactics-square-shrine");
      if (r === CardTacticsCore.BLUE_SHRINE[0] && c === CardTacticsCore.BLUE_SHRINE[1]) square.classList.add("cardtactics-square-shrine");

      const piece = document.createElement("span");
      piece.className = "cardtactics-piece";
      square.appendChild(piece);

      square.addEventListener("click", () => onCardTacticsSquareClick(r, c));
      boardEl.appendChild(square);
    }
  }

  ensureCardTacticsSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureCardTacticsSquareAspectRatio);
  } else {
    setTimeout(ensureCardTacticsSquareAspectRatio, 0);
  }
  ensureCardTacticsResizeHandler();
}

let einkCardTacticsResizeHandlerAttached = false;
let einkCardTacticsResizeTimeoutId = null;

function ensureCardTacticsSquareAspectRatio() {
  const boardEl = document.getElementById("cardtactics-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / CardTacticsCore.SIZE;
  boardEl.querySelectorAll(".cardtactics-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureCardTacticsResizeHandler() {
  if (einkCardTacticsResizeHandlerAttached) return;
  einkCardTacticsResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkCardTacticsResizeTimeoutId !== null) clearTimeout(einkCardTacticsResizeTimeoutId);
    einkCardTacticsResizeTimeoutId = setTimeout(() => {
      einkCardTacticsResizeTimeoutId = null;
      ensureCardTacticsSquareAspectRatio();
    }, 150);
  });
}

function updateCardTacticsBoard() {
  const boardEl = document.getElementById("cardtactics-board");
  if (!boardEl) return;

  boardEl.querySelectorAll(".cardtactics-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const piece = AppStateCardTactics.state.board[r][c];
    const pieceEl = sq.querySelector(".cardtactics-piece");
    if (pieceEl) {
      pieceEl.classList.remove("cardtactics-piece-blue", "cardtactics-piece-red", "cardtactics-piece-king");
      if (piece) {
        pieceEl.classList.add(piece.color === "blue" ? "cardtactics-piece-blue" : "cardtactics-piece-red");
        if (piece.king) pieceEl.classList.add("cardtactics-piece-king");
      }
    }

    const isSelected = AppStateCardTactics.selectedPiece
      && AppStateCardTactics.selectedPiece[0] === r && AppStateCardTactics.selectedPiece[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("cardtactics-square-movable", !!AppStateCardTactics.legalTargets[targetKeyCardTactics(r, c)]);
    const last = AppStateCardTactics.lastMove;
    sq.classList.toggle("lm-from", !!last && last.from[0] === r && last.from[1] === c);
    sq.classList.toggle("lm-to", !!last && last.to[0] === r && last.to[1] === c);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + colorNameCardTactics(piece.color) + (piece.king ? " master" : " pawn") : ", empty";
    I18n.setAria(sq, label);
  });
}

/*** Card rendering (small move-diagrams) ***/

function buildCardDiagram(cardId, forColor) {
  const wrap = document.createElement("div");
  wrap.className = "cardtactics-card-diagram";
  const moves = CardTacticsCore.cardMovesFor(cardId, forColor);
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const cell = document.createElement("span");
      cell.className = "cardtactics-card-cell";
      if (r === 0 && c === 0) cell.classList.add("cardtactics-card-cell-center");
      else if (moves.some(([dr, dc]) => dr === r && dc === c)) cell.classList.add("cardtactics-card-cell-move");
      wrap.appendChild(cell);
    }
  }
  return wrap;
}

function buildCardElement(cardId, ownerColor) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "cardtactics-card";
  const isSelected = AppStateCardTactics.selectedCard === cardId && AppStateCardTactics.turn === ownerColor;
  card.classList.toggle("cardtactics-card-selected", isSelected);
  const label = document.createElement("div");
  label.className = "cardtactics-card-name";
  I18n.setKey(label, "cardtactics_card_" + cardId);
  card.appendChild(label);
  card.appendChild(buildCardDiagram(cardId, ownerColor));
  card.addEventListener("click", () => onCardTacticsCardClick(ownerColor, cardId));
  return card;
}

function updateCardTacticsCards() {
  const redRow = document.getElementById("cardtactics-cards-red");
  const blueRow = document.getElementById("cardtactics-cards-blue");
  const neutralEl = document.getElementById("cardtactics-neutral-card");
  if (!redRow || !blueRow || !neutralEl) return;

  redRow.innerHTML = "";
  AppStateCardTactics.state.cards.red.forEach((id) => redRow.appendChild(buildCardElement(id, "red")));

  blueRow.innerHTML = "";
  AppStateCardTactics.state.cards.blue.forEach((id) => blueRow.appendChild(buildCardElement(id, "blue")));

  neutralEl.innerHTML = "";
  neutralEl.appendChild(buildCardDiagram(AppStateCardTactics.state.cards.neutral, "blue"));
  const label = document.createElement("div");
  label.className = "cardtactics-card-name";
  I18n.setKey(label, "cardtactics_card_" + AppStateCardTactics.state.cards.neutral);
  neutralEl.insertBefore(label, neutralEl.firstChild);
}

function updateGameLabelsCardTactics() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateCardTactics.moveCount ? "Move " + AppStateCardTactics.moveCount : "");
  updateUndoButtonVisibilityCardTactics();
  updateResignVisibilityCardTactics();

  if (AppStateCardTactics.gameOver) clearSavedCardTacticsGame();
  else saveCardTacticsGame();
}

function updateUndoButtonVisibilityCardTactics() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateCardTactics.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateCardTactics.gameOver));
}

function updateResignVisibilityCardTactics() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateCardTactics.gameOver);
}

document.addEventListener("DOMContentLoaded", initCardTacticsApp);
