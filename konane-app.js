// konane-app.js
// Wires KonaneCore/KonaneAi to the konane.html UI. Board rendering reuses
// checkers-app.js's proven per-square-button/float-grid approach, except
// every one of the 64 squares is playable here (Konane fills the whole
// board at the start, unlike checkers' dark-squares-only layout), so all
// 64 buttons get a piece span and a click listener instead of only 32.
//
// Two interaction phases exist:
//   1. "opening" - the two-stone removal ritual unique to Konane (see
//      konane-core.js's header comment): first Black taps one of their
//      own highlighted corner/center stones to remove, then White taps
//      one of their own stones orthogonally adjacent to that empty
//      square. AppStateKonane.phase tracks which half of the ritual is
//      current ("opening-black" | "opening-white"); AppStateKonane.
//      openingBlackCell remembers which cell Black emptied so White's
//      options can be computed from it.
//   2. "playing" - normal alternating jump-chain turns. Continuing a
//      chain with the same stone is always optional (never forced to the
//      maximal length), so this follows fanorona-app.js's chain model: a
//      capture leaves AppStateKonane.chain set, further legal
//      continuations are highlighted, and a "Done jumping" button (the
//      same UI pattern as Fanorona's "Done capturing") lets the player
//      stop; tapping a highlighted destination instead continues.

const AppStateKonane = {
  mode: "offline",        // "offline" | "offline-ai"
  board: KonaneCore.createInitialBoard(),
  turn: "b",              // "b" | "w" - whose turn/action is current
  phase: "opening-black", // "opening-black" | "opening-white" | "playing"
  openingBlackCell: null, // [r,c] Black emptied, once phase is "opening-white"
  selected: null,         // [r, c] | null - a piece selected in the "playing" phase
  chain: null,            // { atCell: [r,c], steps: [...] } while a jump chain is in progress
  lastMove: null,         // { from: [r,c], to: [r,c] } | null - for highlighting
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  captures: { b: 0, w: 0 } // pieces captured BY black / BY white
};

let einkKonaneResizeHandlerAttached = false;
let einkKonaneResizeTimeoutId = null;

const KONANE_SAVE_KEY = "einkchess_save_konane";

function saveKonaneGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(KONANE_SAVE_KEY, {
    mode: AppStateKonane.mode,
    board: AppStateKonane.board,
    turn: AppStateKonane.turn,
    phase: AppStateKonane.phase,
    openingBlackCell: AppStateKonane.openingBlackCell,
    chain: AppStateKonane.chain,
    lastMove: AppStateKonane.lastMove,
    humanColor: AppStateKonane.humanColor,
    aiLevel: AppStateKonane.aiLevel,
    moveCount: AppStateKonane.moveCount,
    captures: AppStateKonane.captures
  });
}

function clearSavedKonaneGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(KONANE_SAVE_KEY);
}

function recordKonaneStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateKonane.mode !== "offline-ai") return;
  GameStats.record("konane", outcome);
}

function colorNameKonane(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusKonane(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultKonane(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

// Builds a short, prominent modal title. In local 2-player games there's
// no single "you", so it's color-based; against the built-in AI it's
// framed from the human's perspective - the same resultTitle<Game>
// convention every 2-player game here follows.
function resultTitleKonane(winner) {
  if (AppStateKonane.mode === "offline-ai") {
    return winner === AppStateKonane.humanColor ? "You win!" : "You lose";
  }
  return colorNameKonane(winner) + " wins";
}

function announceGameResultKonane(resultCode, message) {
  setGameResultKonane(message);
  setStatusKonane("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(resultCode, message);
  }
}

function resetUndoStackKonane() {
  AppStateKonane.undoStack = [];
}

function pushUndoSnapshotKonane() {
  AppStateKonane.undoStack.push({
    board: KonaneCore.cloneBoard(AppStateKonane.board),
    turn: AppStateKonane.turn,
    phase: AppStateKonane.phase,
    openingBlackCell: AppStateKonane.openingBlackCell,
    gameOver: AppStateKonane.gameOver,
    moveCount: AppStateKonane.moveCount,
    captures: { b: AppStateKonane.captures.b, w: AppStateKonane.captures.w },
    lastMove: AppStateKonane.lastMove
  });
}

// Which color is the acting side right now - the removal ritual is acted
// out by Black then White regardless of AppStateKonane.turn conventions
// elsewhere, so this is the single place that resolves "whose action is
// this" across both phases.
function currentActorKonane() {
  if (AppStateKonane.phase === "opening-black") return "b";
  if (AppStateKonane.phase === "opening-white") return "w";
  return AppStateKonane.turn;
}

function isHumanTurnKonane() {
  if (AppStateKonane.gameOver) return false;
  if (AppStateKonane.mode === "offline-ai" && currentActorKonane() !== AppStateKonane.humanColor) return false;
  return true;
}

function initKonaneApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("konane-color-choice");
  const levelInline = document.getElementById("konane-level-inline");
  const startGameBtn = document.getElementById("start-konane-game");
  const resignBtn = document.getElementById("resign-button");
  const doneJumpingBtn = document.getElementById("konane-done-jumping-btn");

  function updateColorChoiceVisibility() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
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

  function startNewGame(mode, humanColor, level) {
    AppStateKonane.mode = mode;
    AppStateKonane.board = KonaneCore.createInitialBoard();
    AppStateKonane.turn = "b";
    AppStateKonane.phase = "opening-black";
    AppStateKonane.openingBlackCell = null;
    AppStateKonane.selected = null;
    AppStateKonane.chain = null;
    AppStateKonane.lastMove = null;
    AppStateKonane.humanColor = humanColor;
    AppStateKonane.aiLevel = level;
    AppStateKonane.gameOver = false;
    AppStateKonane.moveCount = 0;
    AppStateKonane.captures = { b: 0, w: 0 };
    resetUndoStackKonane();
    setGameResultKonane("");
    showBoardSectionKonane();
    buildKonaneBoardDOM();
    updateKonaneBoard();
    updateGameLabelsKonane();

    setStatusKonane("board-info", "Black: remove one of the highlighted stones to begin.");
    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusKonane("board-info", "Computer thinking…");
      setTimeout(aiActKonane, AiPacing.delay(10));
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateKonane.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusKonane("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibility);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='konane-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "b", 0);
      setStatusKonane("offline-konane-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusKonane("offline-konane-status",
      "You play " + colorNameKonane(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateKonane.gameOver) return;
      const loser = currentActorKonane();
      const winner = KonaneCore.otherColor(loser);
      AppStateKonane.gameOver = true;
      AppStateKonane.chain = null;
      announceGameResultKonane(resultTitleKonane(winner), colorNameKonane(winner) + " wins by resignation.");
      recordKonaneStatsIfVsAi("loss");
      updateGameLabelsKonane();
    });
  }

  if (doneJumpingBtn) {
    doneJumpingBtn.addEventListener("click", doneJumpingKonane);
  }

  updateColorChoiceVisibility();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(KONANE_SAVE_KEY) : null;
  if (savedGame && savedGame.board) {
    AppStateKonane.mode = savedGame.mode;
    AppStateKonane.board = savedGame.board;
    AppStateKonane.turn = savedGame.turn;
    AppStateKonane.phase = savedGame.phase || "playing";
    AppStateKonane.openingBlackCell = savedGame.openingBlackCell || null;
    AppStateKonane.selected = null;
    AppStateKonane.chain = savedGame.chain || null;
    AppStateKonane.lastMove = savedGame.lastMove;
    AppStateKonane.humanColor = savedGame.humanColor;
    AppStateKonane.aiLevel = savedGame.aiLevel;
    AppStateKonane.moveCount = savedGame.moveCount;
    AppStateKonane.captures = savedGame.captures;
    AppStateKonane.gameOver = false;
    resetUndoStackKonane();
    setActiveModeButton(AppStateKonane.mode);
    setGameResultKonane("");
    showBoardSectionKonane();
    buildKonaneBoardDOM();
    updateKonaneBoard();
    updateGameLabelsKonane();
    if (AppStateKonane.phase === "opening-black") {
      setStatusKonane("board-info", "Black: remove one of the highlighted stones to begin.");
    } else if (AppStateKonane.phase === "opening-white") {
      setStatusKonane("board-info", "White: remove one of the highlighted stones next to the empty square.");
    } else if (AppStateKonane.chain) {
      setStatusKonane("board-info", colorNameKonane(AppStateKonane.turn) + " can continue jumping, or press Done.");
    } else if (!isHumanTurnKonane()) {
      setStatusKonane("board-info", "Computer thinking…");
      setTimeout(aiActKonane, AiPacing.delay(10));
    } else {
      setStatusKonane("board-info", colorNameKonane(currentActorKonane()) + " to move.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until the player picks 2-player or configures
  // vs-computer and presses New game, matching checkers.html's behavior.
}

/*** Click handling ***/

function onKonaneSquareClick(r, c) {
  if (AppStateKonane.gameOver) {
    setStatusKonane("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!isHumanTurnKonane()) {
    setStatusKonane("board-info", "Computer to move.");
    return;
  }

  if (AppStateKonane.phase === "opening-black") {
    onKonaneOpeningBlackClick(r, c);
  } else if (AppStateKonane.phase === "opening-white") {
    onKonaneOpeningWhiteClick(r, c);
  } else {
    onKonanePlayingClick(r, c);
  }
}

function onKonaneOpeningBlackClick(r, c) {
  const options = KonaneCore.openingRemovalOptions(AppStateKonane.board, "b");
  const match = options.some(([or, oc]) => or === r && oc === c);
  if (!match) {
    setStatusKonane("board-info", "Choose one of the highlighted corner or center stones to remove.");
    return;
  }
  pushUndoSnapshotKonane();
  AppStateKonane.board = KonaneCore.applyRemoval(AppStateKonane.board, [r, c]);
  AppStateKonane.openingBlackCell = [r, c];
  AppStateKonane.lastMove = { from: [r, c], to: [r, c] };
  AppStateKonane.phase = "opening-white";
  AppStateKonane.turn = "w";
  updateKonaneBoard();
  updateGameLabelsKonane();

  if (!isHumanTurnKonane()) {
    setStatusKonane("board-info", "Computer thinking…");
    setTimeout(aiActKonane, AiPacing.delay(250));
  } else {
    setStatusKonane("board-info", "White: remove one of the highlighted stones next to the empty square.");
  }
}

function onKonaneOpeningWhiteClick(r, c) {
  const options = KonaneCore.adjacentRemovalOptions(AppStateKonane.board, AppStateKonane.openingBlackCell, "w");
  const match = options.some(([or, oc]) => or === r && oc === c);
  if (!match) {
    setStatusKonane("board-info", "Choose one of White's highlighted stones next to the empty square.");
    return;
  }
  pushUndoSnapshotKonane();
  AppStateKonane.board = KonaneCore.applyRemoval(AppStateKonane.board, [r, c]);
  AppStateKonane.lastMove = { from: [r, c], to: [r, c] };
  AppStateKonane.phase = "playing";
  AppStateKonane.turn = "b";
  updateKonaneBoard();
  updateGameLabelsKonane();
  finishKonaneOpeningOrTurn();
}

// Shared game-end check used right after the opening ritual completes and
// after every finalized turn thereafter.
function finishKonaneOpeningOrTurn() {
  const end = KonaneCore.detectGameEnd(AppStateKonane.board, AppStateKonane.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameKonane(end.winner);
    AppStateKonane.gameOver = true;
    announceGameResultKonane(resultTitleKonane(end.winner), winnerName + " wins (no legal jump available).");
    recordKonaneStatsIfVsAi(end.winner === AppStateKonane.humanColor ? "win" : "loss");
    updateGameLabelsKonane();
    return;
  }

  if (!isHumanTurnKonane()) {
    setStatusKonane("board-info", "Computer thinking…");
    setTimeout(aiActKonane, AiPacing.delay(250));
  } else {
    setStatusKonane("board-info", "Board ready. " + colorNameKonane(AppStateKonane.turn) + " to move.");
  }
}

function onKonanePlayingClick(r, c) {
  const board = AppStateKonane.board;
  const turn = AppStateKonane.turn;

  if (AppStateKonane.chain) {
    const chain = AppStateKonane.chain;
    if (r === chain.atCell[0] && c === chain.atCell[1]) return; // tapping the active piece does nothing
    const continuations = KonaneCore.getChainContinuations(board, chain.atCell[0], chain.atCell[1], turn);
    const match = continuations.find((opt) => opt.to[0] === r && opt.to[1] === c);
    if (!match) {
      setStatusKonane("board-info", "Invalid move: continue jumping with the highlighted piece, or press Done.");
      return;
    }
    applyKonaneChainStep(match);
    return;
  }

  if (!AppStateKonane.selected) {
    const piece = board[r][c];
    if (piece !== turn) return;
    AppStateKonane.selected = [r, c];
    updateKonaneBoard();
    return;
  }

  const [sr, sc] = AppStateKonane.selected;
  if (sr === r && sc === c) {
    AppStateKonane.selected = null;
    updateKonaneBoard();
    return;
  }

  // Clicking another one of your own stones re-selects instead of jumping.
  if (board[r][c] === turn) {
    AppStateKonane.selected = [r, c];
    updateKonaneBoard();
    return;
  }

  const legalMoves = KonaneCore.getLegalMoves(board, turn);
  const match = legalMoves.find((m) => m.from[0] === sr && m.from[1] === sc && m.to[0] === r && m.to[1] === c);
  if (!match) {
    setStatusKonane("board-info", "Invalid move: a jump is mandatory - choose one of the highlighted stones.");
    AppStateKonane.selected = null;
    updateKonaneBoard();
    return;
  }

  pushUndoSnapshotKonane();
  AppStateKonane.selected = null;
  AppStateKonane.board = KonaneCore.applyStep(board, match.from, match.to, match.captured);
  AppStateKonane.captures[turn] += match.captured.length;
  AppStateKonane.chain = { atCell: match.to, steps: [match] };
  continueOrFinalizeKonaneChain();
}

function applyKonaneChainStep(opt) {
  const turn = AppStateKonane.turn;
  const chain = AppStateKonane.chain;
  const step = { from: chain.atCell, to: opt.to, captured: [opt.captured] };
  AppStateKonane.board = KonaneCore.applyStep(AppStateKonane.board, chain.atCell, opt.to, [opt.captured]);
  AppStateKonane.captures[turn] += 1;
  chain.steps.push(step);
  chain.atCell = opt.to;
  continueOrFinalizeKonaneChain();
}

// After every jump: if the same stone has a further legal jump, the
// chain stays open (the player may continue or press Done - continuing
// is never forced); otherwise the turn ends automatically since there is
// nothing left to choose.
function continueOrFinalizeKonaneChain() {
  const chain = AppStateKonane.chain;
  const continuations = KonaneCore.getChainContinuations(AppStateKonane.board, chain.atCell[0], chain.atCell[1], AppStateKonane.turn);
  if (!continuations.length) {
    const steps = chain.steps;
    AppStateKonane.chain = null;
    finalizeKonaneTurn(steps);
    return;
  }
  updateKonaneBoard();
  updateGameLabelsKonane();
  saveKonaneGame();
  setStatusKonane("board-info", colorNameKonane(AppStateKonane.turn) + " jumped - continue with this stone, or press Done.");
}

function doneJumpingKonane() {
  if (!AppStateKonane.chain) return;
  const steps = AppStateKonane.chain.steps;
  AppStateKonane.chain = null;
  finalizeKonaneTurn(steps);
}

function finalizeKonaneTurn(steps) {
  const mover = AppStateKonane.turn;
  AppStateKonane.lastMove = { from: steps[0].from, to: steps[steps.length - 1].to };
  AppStateKonane.moveCount++;
  AppStateKonane.turn = KonaneCore.otherColor(mover);
  updateKonaneBoard();
  updateGameLabelsKonane();

  const end = KonaneCore.detectGameEnd(AppStateKonane.board, AppStateKonane.turn);
  if (end.status !== "normal") {
    const winnerName = colorNameKonane(end.winner);
    AppStateKonane.gameOver = true;
    announceGameResultKonane(resultTitleKonane(end.winner), winnerName + " wins (no legal jump available).");
    recordKonaneStatsIfVsAi(end.winner === AppStateKonane.humanColor ? "win" : "loss");
    updateGameLabelsKonane();
    return;
  }

  setStatusKonane("board-info", colorNameKonane(mover) + " played. " + colorNameKonane(AppStateKonane.turn) + " to move.");

  if (AppStateKonane.mode === "offline-ai" && !AppStateKonane.gameOver && AppStateKonane.turn !== AppStateKonane.humanColor) {
    setStatusKonane("board-info", "Computer thinking…");
    setTimeout(aiActKonane, AiPacing.delay(250));
  }
}

/*** AI (covers both the opening removals and normal jumps) ***/

function aiActKonane() {
  if (AppStateKonane.mode !== "offline-ai" || AppStateKonane.gameOver) return;
  const aiColor = KonaneCore.otherColor(AppStateKonane.humanColor);
  if (currentActorKonane() !== aiColor) return;

  if (AppStateKonane.phase === "opening-black") {
    const options = KonaneCore.openingRemovalOptions(AppStateKonane.board, "b");
    const pick = KonaneAi.chooseRemoval(options);
    if (!pick) return;
    pushUndoSnapshotKonane();
    AppStateKonane.board = KonaneCore.applyRemoval(AppStateKonane.board, pick);
    AppStateKonane.openingBlackCell = pick;
    AppStateKonane.lastMove = { from: pick, to: pick };
    AppStateKonane.phase = "opening-white";
    AppStateKonane.turn = "w";
    updateKonaneBoard();
    updateGameLabelsKonane();
    if (!isHumanTurnKonane()) {
      setStatusKonane("board-info", "Computer thinking…");
      setTimeout(aiActKonane, AiPacing.delay(250));
    } else {
      setStatusKonane("board-info", "White: remove one of the highlighted stones next to the empty square.");
    }
    return;
  }

  if (AppStateKonane.phase === "opening-white") {
    const options = KonaneCore.adjacentRemovalOptions(AppStateKonane.board, AppStateKonane.openingBlackCell, "w");
    const pick = KonaneAi.chooseRemoval(options);
    if (!pick) return;
    pushUndoSnapshotKonane();
    AppStateKonane.board = KonaneCore.applyRemoval(AppStateKonane.board, pick);
    AppStateKonane.lastMove = { from: pick, to: pick };
    AppStateKonane.phase = "playing";
    AppStateKonane.turn = "b";
    updateKonaneBoard();
    updateGameLabelsKonane();
    finishKonaneOpeningOrTurn();
    return;
  }

  const move = KonaneAi.chooseMove(AppStateKonane.board, aiColor, AppStateKonane.aiLevel);
  if (!move) return; // detectGameEnd after the human's last action already caught a no-moves loss

  pushUndoSnapshotKonane();
  AppStateKonane.board = KonaneAi.applyFullMove(AppStateKonane.board, move);
  AppStateKonane.captures[aiColor] += move.captured.length;
  finalizeKonaneTurn(move.steps);
}

function undoLastMove() {
  if (!AppStateKonane.undoStack || !AppStateKonane.undoStack.length) return;
  let prev = AppStateKonane.undoStack.pop();
  if (AppStateKonane.mode === "offline-ai") {
    while (AppStateKonane.undoStack.length && currentActorForSnapshotKonane(prev) !== AppStateKonane.humanColor) {
      prev = AppStateKonane.undoStack.pop();
    }
  }
  AppStateKonane.board = prev.board;
  AppStateKonane.turn = prev.turn;
  AppStateKonane.phase = prev.phase;
  AppStateKonane.openingBlackCell = prev.openingBlackCell;
  AppStateKonane.gameOver = prev.gameOver;
  AppStateKonane.moveCount = prev.moveCount;
  AppStateKonane.captures = prev.captures;
  AppStateKonane.lastMove = prev.lastMove;
  AppStateKonane.selected = null;
  AppStateKonane.chain = null;
  setGameResultKonane("");
  updateKonaneBoard();
  updateGameLabelsKonane();
  setStatusKonane("board-info", "Move undone.");
}

function currentActorForSnapshotKonane(snapshot) {
  if (snapshot.phase === "opening-black") return "b";
  if (snapshot.phase === "opening-white") return "w";
  return snapshot.turn;
}

function showBoardSectionKonane() {
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

/*** Board rendering (mirrors checkers-app.js's per-square float-grid
 * approach, but every square is playable here, not just the dark ones) ***/

function buildKonaneBoardDOM() {
  const boardEl = document.getElementById("konane-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  for (let r = 7; r >= 0; r--) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square konane-square";
      square.classList.add((r + c) % 2 === 0 ? "dark" : "light");
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "konane-piece";
      square.appendChild(piece);
      square.addEventListener("click", () => onKonaneSquareClick(r, c));
      boardEl.appendChild(square);
    }
  }

  ensureKonaneSquareAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureKonaneSquareAspectRatio);
  } else {
    setTimeout(ensureKonaneSquareAspectRatio, 0);
  }
  ensureKonaneResizeHandler();
}

function ensureKonaneSquareAspectRatio() {
  const boardEl = document.getElementById("konane-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const squareSize = rect.width / 8;
  boardEl.querySelectorAll(".konane-square").forEach((sq) => {
    sq.style.height = squareSize + "px";
  });
}

function ensureKonaneResizeHandler() {
  if (einkKonaneResizeHandlerAttached) return;
  einkKonaneResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkKonaneResizeTimeoutId !== null) clearTimeout(einkKonaneResizeTimeoutId);
    einkKonaneResizeTimeoutId = setTimeout(() => {
      einkKonaneResizeTimeoutId = null;
      ensureKonaneSquareAspectRatio();
    }, 150);
  });
}

function updateKonaneBoard() {
  const boardEl = document.getElementById("konane-board");
  if (!boardEl) return;

  const board = AppStateKonane.board;
  const turn = AppStateKonane.turn;
  const phase = AppStateKonane.phase;

  // Compute this render's highlight sets once, up front.
  let removableSet = new Set();
  let movableFromSet = new Set();
  let destinationSet = new Set();
  let activeCell = null;

  if (AppStateKonane.gameOver) {
    // no highlighting once the game has ended
  } else if (phase === "opening-black" && isHumanTurnKonane()) {
    KonaneCore.openingRemovalOptions(board, "b").forEach(([r, c]) => removableSet.add(r + "," + c));
  } else if (phase === "opening-white" && isHumanTurnKonane()) {
    KonaneCore.adjacentRemovalOptions(board, AppStateKonane.openingBlackCell, "w").forEach(([r, c]) => removableSet.add(r + "," + c));
  } else if (phase === "playing" && isHumanTurnKonane()) {
    if (AppStateKonane.chain) {
      activeCell = AppStateKonane.chain.atCell;
      KonaneCore.getChainContinuations(board, activeCell[0], activeCell[1], turn).forEach((opt) => {
        destinationSet.add(opt.to[0] + "," + opt.to[1]);
      });
    } else {
      const legalMoves = KonaneCore.getLegalMoves(board, turn);
      legalMoves.forEach((m) => movableFromSet.add(m.from[0] + "," + m.from[1]));
      if (AppStateKonane.selected) {
        activeCell = AppStateKonane.selected;
        legalMoves
          .filter((m) => m.from[0] === activeCell[0] && m.from[1] === activeCell[1])
          .forEach((m) => destinationSet.add(m.to[0] + "," + m.to[1]));
      }
    }
  }

  boardEl.querySelectorAll(".konane-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const key = r + "," + c;
    const piece = board[r][c];
    const pieceEl = sq.querySelector(".konane-piece");
    if (pieceEl) {
      pieceEl.classList.remove("konane-piece-black", "konane-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "konane-piece-black" : "konane-piece-white");
    }

    const isActive = !!(activeCell && activeCell[0] === r && activeCell[1] === c);
    sq.classList.toggle("selected", isActive);
    sq.classList.toggle("konane-square-removable", removableSet.has(key));
    sq.classList.toggle("konane-square-movable", movableFromSet.has(key) || destinationSet.has(key));
    sq.classList.toggle("last-move", !!(AppStateKonane.lastMove &&
      ((AppStateKonane.lastMove.from[0] === r && AppStateKonane.lastMove.from[1] === c) ||
       (AppStateKonane.lastMove.to[0] === r && AppStateKonane.lastMove.to[1] === c))));

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    if (piece) {
      label += ", " + (piece === "b" ? "Black" : "White") + " stone";
    } else {
      label += ", empty";
    }
    if (isActive) label += ", selected";
    else if (removableSet.has(key)) label += ", removable";
    else if (movableFromSet.has(key) || destinationSet.has(key)) label += ", movable";
    I18n.setAria(sq, label);
  });

  ensureKonaneSquareAspectRatio();
  updateKonaneChainControlsUI();
  updateScoreLineKonane();
}

function updateKonaneChainControlsUI() {
  const container = document.getElementById("konane-chain-controls");
  if (!container) return;
  const show = !!AppStateKonane.chain && !AppStateKonane.gameOver && isHumanTurnKonane();
  container.classList.toggle("hidden", !show);
  const label = document.getElementById("konane-chain-label");
  const doneBtn = document.getElementById("konane-done-jumping-btn");
  if (label && window.I18n) label.textContent = window.I18n.t("konane_continue_jumping");
  if (doneBtn && window.I18n) doneBtn.textContent = window.I18n.t("konane_done_jumping_btn");
}

function updateScoreLineKonane() {
  const container = document.getElementById("score-line");
  const capturesEl = document.getElementById("score-captures");
  if (!container || !capturesEl) return;
  const active = AppStateKonane.moveCount > 0 || AppStateKonane.captures.b > 0 || AppStateKonane.captures.w > 0;
  if (!active) {
    container.classList.add("hidden");
    capturesEl.textContent = "";
    return;
  }
  container.classList.remove("hidden");
  I18n.setMsg(capturesEl, "Captured – Black: " + AppStateKonane.captures.b + " · White: " + AppStateKonane.captures.w);
}

function updateGameLabelsKonane() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateKonane.moveCount ? "Move " + AppStateKonane.moveCount : "");
  updateUndoButtonVisibilityKonane();
  updateResignVisibilityKonane();

  if (AppStateKonane.gameOver) clearSavedKonaneGame();
  else saveKonaneGame();
}

function updateUndoButtonVisibilityKonane() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateKonane.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateKonane.gameOver));
}

function updateResignVisibilityKonane() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateKonane.gameOver);
}

document.addEventListener("DOMContentLoaded", initKonaneApp);
