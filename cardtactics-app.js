// cardtactics-app.js
// Wires CardTacticsCore/CardTacticsAi (rules 2) to cardtactics.html. The
// board is a 7 x 6 float-grid. Black stones are filled discs, White
// stones outlined discs (told apart by shape, not by color).
//
// Turn flow: tap one of the three open cards, tap one of your stones,
// tap a marked square. The used card goes to the end of the queue and
// the next queue card takes its place; the page shows the open cards
// (drawn from the view of the side to move) and the next two cards.

const AppStateCardTactics = {
  mode: "offline",        // "offline" | "offline-ai"
  state: CardTacticsCore.createInitialState(),
  turn: "black",
  humanColor: "black",
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
    rules: CardTacticsCore.RULES,
    mode: AppStateCardTactics.mode,
    state: AppStateCardTactics.state,
    turn: AppStateCardTactics.turn,
    humanColor: AppStateCardTactics.humanColor,
    aiLevel: AppStateCardTactics.aiLevel,
    moveCount: AppStateCardTactics.moveCount,
    undoStack: AppStateCardTactics.undoStack.slice(-50),
  });
}

function clearSavedCardTacticsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(CARDTACTICS_SAVE_KEY);
}

// A save of the first Card Tactics rules (5 x 5, hands of two cards) has
// no `rules: 2`; it cannot be continued and is dropped without a message.
function isCurrentCardTacticsSave(saved) {
  return !!saved && saved.rules === CardTacticsCore.RULES && CardTacticsCore.isCurrentState(saved.state)
    && (saved.humanColor === "black" || saved.humanColor === "white");
}

function recordCardTacticsStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateCardTactics.mode !== "offline-ai") return;
  GameStats.record("cardtactics", outcome);
}

function colorNameCardTactics(color) {
  return color === "black" ? "Black" : "White";
}

function fillCardTactics(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function setStatusCardTactics(elementId, text) {
  if (((AppStateCardTactics.mode === "offline-ai")) && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateCardTactics);
  }
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
  if (winner === "draw") return "Draw";
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

function resultMessageCardTactics(state) {
  const name = colorNameCardTactics(state.winner);
  const limit = CardTacticsCore.MAX_PLIES;
  switch (state.winReason) {
    case "home": return name + " wins with two stones home!";
    case "captured": return name + " wins: the other side can no longer bring two stones home.";
    case "limit-home": return name + " wins after " + limit + " moves with more stones home.";
    case "limit-stones": return name + " wins after " + limit + " moves with more stones on the board.";
    default: return "Draw after " + limit + " moves: same number of stones.";
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

function toMoveTextCardTactics() {
  let text = colorNameCardTactics(AppStateCardTactics.turn) + " to move. Choose a card.";
  if (AppStateCardTactics.state.ply === 0) text += " Opening move: one row at most.";
  return text;
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

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonCardTactics("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameCardTactics("offline", "black", 0);
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
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "white" ? "white" : "black", ["white", "black"]);

    if (level === 0) {
      setActiveModeButtonCardTactics("offline-ai");
      startNewGameCardTactics("offline", "black", 0);
      setStatusCardTactics("offline-cardtactics-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonCardTactics("offline-ai");
    startNewGameCardTactics("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusCardTactics("offline-cardtactics-status",
      RandomStart.label("You play " + colorNameCardTactics(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateCardTactics.gameOver) return;
      const loser = AppStateCardTactics.mode === "offline-ai" ? AppStateCardTactics.humanColor : AppStateCardTactics.turn;
      const winner = CardTacticsCore.otherPlayer(loser);
      AppStateCardTactics.gameOver = true;
      announceGameResultCardTactics(resultTitleCardTactics(winner), colorNameCardTactics(winner) + " wins by resignation.");
      recordCardTacticsStatsIfVsAi("loss");
      updateGameLabelsCardTactics();
    });
  }

  updateColorChoiceVisibilityCardTactics();
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => updateCardTacticsCards());

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(CARDTACTICS_SAVE_KEY) : null;
  if (savedGame && !isCurrentCardTacticsSave(savedGame)) {
    clearSavedCardTacticsGame();
  } else if (savedGame) {
    AppStateCardTactics.mode = savedGame.mode === "offline-ai" ? "offline-ai" : "offline";
    AppStateCardTactics.state = savedGame.state;
    AppStateCardTactics.turn = savedGame.state.currentPlayer;
    AppStateCardTactics.humanColor = savedGame.humanColor;
    AppStateCardTactics.aiLevel = savedGame.aiLevel || 2;
    AppStateCardTactics.moveCount = savedGame.moveCount || 0;
    AppStateCardTactics.lastMove = null;
    AppStateCardTactics.gameOver = false;
    AppStateCardTactics.selectedCard = null;
    AppStateCardTactics.selectedPiece = null;
    AppStateCardTactics.legalTargets = {};
    AppStateCardTactics.undoStack = Array.isArray(savedGame.undoStack) ? savedGame.undoStack : [];
    AppStateCardTactics.undoStack = AppStateCardTactics.undoStack
      .filter((u) => u && CardTacticsCore.isCurrentState(u.state));
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
      setStatusCardTactics("board-info", toMoveTextCardTactics());
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching chess.html's behavior.
}

function startNewGameCardTactics(mode, humanColor, level) {
  AppStateCardTactics.mode = mode;
  AppStateCardTactics.state = CardTacticsCore.createInitialState();
  AppStateCardTactics.turn = AppStateCardTactics.state.currentPlayer;
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

  if (mode === "offline-ai" && humanColor !== AppStateCardTactics.turn) {
    setStatusCardTactics("board-info", "Computer thinking…");
    setTimeout(aiTurnCardTactics, AiPacing.delay(300));
  } else {
    setStatusCardTactics("board-info", toMoveTextCardTactics());
  }
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

function humanMayActCardTactics() {
  if (AppStateCardTactics.gameOver) return false;
  return !(AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor);
}

function onCardTacticsCardClick(cardId) {
  if (!humanMayActCardTactics()) return;
  if (AppStateCardTactics.selectedCard === cardId) {
    AppStateCardTactics.selectedCard = null;
  } else {
    AppStateCardTactics.selectedCard = cardId;
  }
  AppStateCardTactics.selectedPiece = null;
  AppStateCardTactics.legalTargets = {};
  updateCardTacticsBoard();
  updateCardTacticsCards();
  setStatusCardTactics("board-info", AppStateCardTactics.selectedCard
    ? "Choose one of your pieces to move with this card."
    : toMoveTextCardTactics());
}

function onCardTacticsSquareClick(r, c) {
  if (AppStateCardTactics.gameOver) return;
  if (!humanMayActCardTactics()) {
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

// move = a legal move, or null for a pass (no legal move).
function applyCardTacticsMove(move) {
  pushUndoSnapshotCardTactics();
  const mover = AppStateCardTactics.turn;
  const before = AppStateCardTactics.state;
  AppStateCardTactics.state = move
    ? CardTacticsCore.applyMove(before, mover, move)
    : CardTacticsCore.applyPass(before, mover);
  AppStateCardTactics.lastMove = move ? { from: move.from.slice(), to: move.to.slice() } : null;
  AppStateCardTactics.moveCount++;
  AppStateCardTactics.selectedCard = null;
  AppStateCardTactics.selectedPiece = null;
  AppStateCardTactics.legalTargets = {};

  if (AppStateCardTactics.state.gameOver) {
    AppStateCardTactics.gameOver = true;
    updateCardTacticsBoard();
    updateCardTacticsCards();
    const winner = AppStateCardTactics.state.winner;
    announceGameResultCardTactics(resultTitleCardTactics(winner), resultMessageCardTactics(AppStateCardTactics.state));
    if (winner === "draw") recordCardTacticsStatsIfVsAi("draw");
    else recordCardTacticsStatsIfVsAi(winner === AppStateCardTactics.humanColor ? "win" : "loss");
    updateGameLabelsCardTactics();
    return;
  }

  AppStateCardTactics.turn = AppStateCardTactics.state.currentPlayer;
  updateCardTacticsBoard();
  updateCardTacticsCards();
  updateGameLabelsCardTactics();

  let note = colorNameCardTactics(mover) + (move ? " played." : " has no legal move and passes.");
  if (move && AppStateCardTactics.state.home[mover] > before.home[mover]) {
    note = colorNameCardTactics(mover) + " brings a stone home (" + AppStateCardTactics.state.home[mover] + " of " + CardTacticsCore.GOAL + ").";
  }
  const next = AppStateCardTactics.turn;
  if (!CardTacticsCore.getLegalMoves(AppStateCardTactics.state, next).length) {
    // The next player cannot move: pass for them after a short pause.
    setStatusCardTactics("board-info", note + " " + colorNameCardTactics(next) + " has no legal move and passes.");
    const scheduledFor = AppStateCardTactics.state;
    setTimeout(() => {
      if (AppStateCardTactics.gameOver || AppStateCardTactics.state !== scheduledFor) return;
      applyCardTacticsMove(null);
    }, AiPacing.delay(900));
    return;
  }
  if (AppStateCardTactics.mode === "offline-ai" && next !== AppStateCardTactics.humanColor) {
    maybeTriggerAiTurnCardTactics();
  } else {
    setStatusCardTactics("board-info", note + " " + colorNameCardTactics(next) + " to move. Choose a card.");
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
  if (AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.turn !== AppStateCardTactics.humanColor) {
    maybeTriggerAiTurnCardTactics();
  }
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

  for (let r = 0; r < CardTacticsCore.ROWS; r++) {
    for (let c = 0; c < CardTacticsCore.COLS; c++) {
      const square = document.createElement("button");
      square.className = "square cardtactics-square";
      square.type = "button";
      square.dataset.row = r;
      square.dataset.col = c;
      if (r === 0 || r === CardTacticsCore.ROWS - 1) square.classList.add("cardtactics-square-goal");

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
  const squareSize = (rect.width - 6) / CardTacticsCore.COLS;
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
      pieceEl.classList.remove("cardtactics-piece-black", "cardtactics-piece-white");
      if (piece) pieceEl.classList.add(piece.color === "black" ? "cardtactics-piece-black" : "cardtactics-piece-white");
    }

    const isSelected = AppStateCardTactics.selectedPiece
      && AppStateCardTactics.selectedPiece[0] === r && AppStateCardTactics.selectedPiece[1] === c;
    sq.classList.toggle("selected", !!isSelected);
    sq.classList.toggle("cardtactics-square-movable", !!AppStateCardTactics.legalTargets[targetKeyCardTactics(r, c)]);
    const last = AppStateCardTactics.lastMove;
    sq.classList.toggle("lm-from", !!last && last.from[0] === r && last.from[1] === c);
    sq.classList.toggle("lm-to", !!last && last.to[0] === r && last.to[1] === c);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + colorNameCardTactics(piece.color) + " stone" : ", empty";
    I18n.setAria(sq, label);
  });
}

/*** Card rendering (small move-diagrams, seen from the side to move) ***/

function buildCardDiagram(cardId, forColor) {
  const wrap = document.createElement("div");
  wrap.className = "cardtactics-card-diagram";
  wrap.setAttribute("aria-hidden", "true");
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

function buildCardElement(cardId, forColor, small) {
  const card = document.createElement(small ? "div" : "button");
  if (!small) card.type = "button";
  card.className = "cardtactics-card" + (small ? " cardtactics-card-small" : "");
  card.dataset.card = cardId;
  if (!small) {
    card.classList.toggle("cardtactics-card-selected", AppStateCardTactics.selectedCard === cardId);
    card.setAttribute("aria-pressed", AppStateCardTactics.selectedCard === cardId ? "true" : "false");
    card.addEventListener("click", () => onCardTacticsCardClick(cardId));
  }
  const label = document.createElement("div");
  label.className = "cardtactics-card-name";
  I18n.setKey(label, "cardtactics_card_" + cardId);
  card.appendChild(label);
  card.appendChild(buildCardDiagram(cardId, forColor));
  return card;
}

function updateCardTacticsCards() {
  const displayRow = document.getElementById("cardtactics-display");
  const nextRow = document.getElementById("cardtactics-next");
  const homeLine = document.getElementById("cardtactics-home-line");
  const s = AppStateCardTactics.state;
  if (!displayRow || !nextRow) return;
  const viewer = AppStateCardTactics.turn;

  displayRow.innerHTML = "";
  s.display.forEach((id) => displayRow.appendChild(buildCardElement(id, viewer, false)));

  nextRow.innerHTML = "";
  CardTacticsCore.nextCards(s).forEach((id) => nextRow.appendChild(buildCardElement(id, viewer, true)));

  const forLine = document.getElementById("cardtactics-cards-for");
  if (forLine) I18n.setKey(forLine, viewer === "black" ? "cardtactics_cards_for_black" : "cardtactics_cards_for_white");
  if (homeLine) {
    homeLine.textContent = fillCardTactics("cardtactics_home_line", { b: s.home.black, w: s.home.white, n: CardTacticsCore.GOAL });
  }
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
  btn.disabled = !(hasUndo);
}

function updateResignVisibilityCardTactics() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateCardTactics.gameOver);
}

document.addEventListener("DOMContentLoaded", initCardTacticsApp);
