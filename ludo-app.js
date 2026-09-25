// ludo-app.js
// Wires LudoCore/LudoAi to the ludo.html UI: a cross-shaped board built
// as one 15x15 CSS grid (grid `gap` is fine on E-Ink browsers - it's
// only flexbox `gap` that Tolino silently drops - but this board uses
// none anyway, each cell is simply placed at its own grid row/column).
//
// Board geometry (all 0-indexed row/col within the 15x15 grid):
//   - Four 6x6 home bases in the corners (red top-left, green top-right,
//     yellow bottom-right, blue bottom-left), each holding up to 4
//     tokens before they enter play.
//   - A 52-cell shared outer track running around the cross, verified
//     by construction to visit each cell once and return to its start
//     (see the coordinate list below) - 13 cells per color, matching
//     LudoCore.START_INDEX.
//   - A 5-cell private "home stretch" per color leading from the track
//     into the 3x3 center hub (the hub's 4 corner cells are themselves
//     shared-track cells - the classic cross-shaped board's track bends
//     through them - while its middle cross-shape is purely decorative).
//   - Four small always-empty "gap" cells inside the arms that no
//     color's path touches, rendered as plain filler so the arms read
//     as solid rectangles (the same idea as ur-app.js's H-shape gaps).
//
// Turn flow: whoever's turn it is presses "Roll", then either clicks a
// highlighted movable token (or its home base, to bring a new token onto
// the board on a 6) or, with no legal move, the turn passes automatically
// after a short delay. Rolling a 6 grants an extra roll for the same
// player - unless it's their third 6 in a row, which forfeits the turn
// instead (the classic anti-stalling variant). A computer-controlled
// color plays itself the same way, just via LudoAi instead of a click.

const LUDO_TRACK_CELLS = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0]
];

const LUDO_HOME_COLUMN_CELLS = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};

const LUDO_GAP_CELLS = [[6, 0], [0, 8], [8, 14], [14, 6]];

const LUDO_HOME_BASE_ORIGIN = { red: [0, 0], green: [0, 9], yellow: [9, 9], blue: [9, 0] };
const LUDO_HUB_ORIGIN = [6, 6];
const LUDO_GRID_SIZE = 15;

const AppStateLudo = {
  mode: "vs-ai",        // "vs-ai" | "hotseat"
  numPlayers: 4,
  activeColors: LudoCore.COLOR_ORDER.slice(),
  humanColor: "red",    // ignored in hotseat mode
  aiColors: [],
  aiLevel: 2,           // 1 = easy, 2 = medium, 3 = hard
  state: null,
  roll: null,           // null until rolled this turn, then 1-6
  legalMoves: [],        // legal token indices for the current color+roll
  sixStreak: 0,
  gameOver: false,
  moveCount: 0,
  undoStack: [],
  started: false,
  // The latest move, so the board can mark where the token came from and
  // where it landed (a token otherwise just reappears several squares on,
  // which read as "squares being skipped"). Display only, never saved.
  lastMove: null
};

const LUDO_SAVE_KEY = "einkchess_save_ludo";

function ludoColorName(color) {
  const names = { red: "Red", green: "Green", yellow: "Yellow", blue: "Blue" };
  return names[color] || color;
}

function saveLudoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(LUDO_SAVE_KEY, {
    mode: AppStateLudo.mode,
    numPlayers: AppStateLudo.numPlayers,
    activeColors: AppStateLudo.activeColors,
    humanColor: AppStateLudo.humanColor,
    aiColors: AppStateLudo.aiColors,
    aiLevel: AppStateLudo.aiLevel,
    state: AppStateLudo.state,
    roll: AppStateLudo.roll,
    sixStreak: AppStateLudo.sixStreak,
    moveCount: AppStateLudo.moveCount
  });
}

function clearSavedLudoGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(LUDO_SAVE_KEY);
}

function recordLudoStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateLudo.mode !== "vs-ai") return;
  GameStats.record("ludo", outcome);
}

function isAiColorLudo(color) {
  return AppStateLudo.mode === "vs-ai" && AppStateLudo.aiColors.indexOf(color) !== -1;
}

function currentColorLudo() {
  return LudoCore.currentColor(AppStateLudo.state);
}

function setStatusLudo(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultLudo(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleLudo(winner) {
  if (AppStateLudo.mode === "vs-ai") {
    return winner === AppStateLudo.humanColor ? "You win!" : "You lose";
  }
  return ludoColorName(winner) + " wins";
}

function announceGameResultLudo(resultCode, message) {
  setGameResultLudo(message);
  setStatusLudo("board-info", message);
  if (window.ResultModal) window.ResultModal.show(resultCode, message);
}

function resetUndoStackLudo() {
  AppStateLudo.undoStack = [];
}

function pushUndoSnapshotLudo() {
  AppStateLudo.undoStack.push({
    state: LudoCore.cloneState(AppStateLudo.state),
    sixStreak: AppStateLudo.sixStreak,
    gameOver: AppStateLudo.gameOver,
    moveCount: AppStateLudo.moveCount
  });
}

function pickActiveColors(numPlayers, startColor) {
  const order = LudoCore.COLOR_ORDER;
  const startIdx = Math.max(0, order.indexOf(startColor));
  const colors = [];
  for (let i = 0; i < numPlayers; i++) colors.push(order[(startIdx + i) % order.length]);
  return colors;
}

function initLudoApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("ludo-color-choice");
  const levelInline = document.getElementById("ludo-level-inline");
  const numPlayersSelect = document.getElementById("ludo-num-players");
  const startGameBtn = document.getElementById("start-ludo-game");
  const resignBtn = document.getElementById("resign-button");
  const rollBtn = document.getElementById("ludo-roll-button");

  let pendingMode = "vs-ai";

  function setActiveModeButtonLudo(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "hotseat");
    modeOfflineAi.classList.toggle("active-mode", mode === "vs-ai");
  }

  function updateColorChoiceVisibilityLudo() {
    if (colorChoice) colorChoice.classList.toggle("hidden", pendingMode !== "vs-ai");
    const levelWrap = document.getElementById("ludo-level-wrap");
    if (levelWrap) levelWrap.classList.toggle("hidden", pendingMode !== "vs-ai");
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

  if (modeOffline) {
    modeOffline.addEventListener("click", () => {
      pendingMode = "hotseat";
      setActiveModeButtonLudo("hotseat");
      updateColorChoiceVisibilityLudo();
    });
  }
  if (modeOfflineAi) {
    modeOfflineAi.addEventListener("click", () => {
      pendingMode = "vs-ai";
      setActiveModeButtonLudo("vs-ai");
      updateColorChoiceVisibilityLudo();
    });
  }

  function startNewGameLudo(mode, numPlayers, humanColor, level) {
    const activeColors = mode === "hotseat"
      ? LudoCore.COLOR_ORDER.slice(0, numPlayers)
      : pickActiveColors(numPlayers, humanColor);

    AppStateLudo.mode = mode;
    AppStateLudo.numPlayers = numPlayers;
    AppStateLudo.activeColors = activeColors;
    AppStateLudo.humanColor = mode === "vs-ai" ? humanColor : null;
    AppStateLudo.aiColors = mode === "vs-ai" ? activeColors.filter((c) => c !== humanColor) : [];
    AppStateLudo.aiLevel = level;
    AppStateLudo.state = LudoCore.createInitialState(activeColors);
    AppStateLudo.roll = null;
    AppStateLudo.legalMoves = [];
    AppStateLudo.sixStreak = 0;
    AppStateLudo.gameOver = false;
    AppStateLudo.moveCount = 0;
    AppStateLudo.started = true;
    AppStateLudo.lastMove = null;
    resetUndoStackLudo();
    setGameResultLudo("");
    showBoardSectionLudo();
    buildLudoBoardDOM();
    updateLudoBoard();
    updateGameLabelsLudo();

    const first = currentColorLudo();
    if (isAiColorLudo(first)) {
      setStatusLudo("board-info", "Computer thinking…");
      setTimeout(aiRollLudo, AiPacing.delay(300));
    } else {
      setStatusLudo("board-info", ludoColorName(first) + "'s turn. Roll the die.");
    }
  }

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      const numPlayers = numPlayersSelect ? parseInt(numPlayersSelect.value, 10) : 4;
      const level = levelInline ? parseInt(levelInline.value, 10) : 2;
      const colorInput = document.querySelector("input[name='ludo-color']:checked");
      const humanColor = colorInput ? colorInput.value : "red";
      setActiveModeButtonLudo(pendingMode);
      startNewGameLudo(pendingMode, numPlayers, humanColor, level);
      if (pendingMode === "vs-ai") {
        const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
        setStatusLudo("offline-ludo-status",
          "You play " + ludoColorName(humanColor) + " against " + (numPlayers - 1) + " computer player(s), level: " + (levelNames[level] || level) + ".");
      } else {
        setStatusLudo("offline-ludo-status", "Local " + numPlayers + "-player hotseat game (no computer).");
      }
    });
  }

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateLudo.gameOver || !AppStateLudo.started) return;
      const loser = currentColorLudo();
      const remaining = AppStateLudo.activeColors.filter((c) => c !== loser);
      const winner = remaining.length ? remaining[0] : loser;
      AppStateLudo.gameOver = true;
      AppStateLudo.state.gameOver = true;
      AppStateLudo.state.winner = winner;
      announceGameResultLudo(resultTitleLudo(winner), ludoColorName(loser) + " resigned. " + ludoColorName(winner) + " wins.");
      recordLudoStatsIfVsAi(winner === AppStateLudo.humanColor ? "win" : "loss");
      updateGameLabelsLudo();
    });
  }

  if (rollBtn) rollBtn.addEventListener("click", humanRollLudo);

  updateColorChoiceVisibilityLudo();

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(LUDO_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateLudo.mode = savedGame.mode;
    AppStateLudo.numPlayers = savedGame.numPlayers;
    AppStateLudo.activeColors = savedGame.activeColors;
    AppStateLudo.humanColor = savedGame.humanColor;
    AppStateLudo.aiColors = savedGame.aiColors || [];
    AppStateLudo.aiLevel = savedGame.aiLevel;
    AppStateLudo.state = savedGame.state;
    AppStateLudo.roll = savedGame.roll;
    AppStateLudo.sixStreak = savedGame.sixStreak || 0;
    AppStateLudo.legalMoves = savedGame.roll !== null
      ? LudoCore.getLegalMoves(AppStateLudo.state, currentColorLudo(), savedGame.roll)
      : [];
    AppStateLudo.moveCount = savedGame.moveCount;
    AppStateLudo.gameOver = false;
    AppStateLudo.started = true;
    AppStateLudo.lastMove = null;
    resetUndoStackLudo();
    pendingMode = AppStateLudo.mode;
    setActiveModeButtonLudo(AppStateLudo.mode);
    updateColorChoiceVisibilityLudo();
    setGameResultLudo("");
    showBoardSectionLudo();
    buildLudoBoardDOM();
    updateDiceDisplayLudo(AppStateLudo.roll);
    updateLudoBoard();
    updateGameLabelsLudo();
    const cur = currentColorLudo();
    if (isAiColorLudo(cur)) {
      setStatusLudo("board-info", "Computer thinking…");
      setTimeout(aiRollLudo, AiPacing.delay(300));
    } else if (AppStateLudo.roll !== null) {
      setStatusLudo("board-info", ludoColorName(cur) + " rolled " + AppStateLudo.roll + ". Choose a token to move.");
    } else {
      setStatusLudo("board-info", ludoColorName(cur) + "'s turn. Roll the die.");
    }
  }
  // Otherwise no mode is pre-selected and no game auto-starts: the
  // placeholder shows until settings are configured and New game is
  // pressed, matching chess.html's behavior.
}

/*** Turn flow ***/

function humanRollLudo() {
  if (AppStateLudo.gameOver || !AppStateLudo.started) return;
  const color = currentColorLudo();
  if (isAiColorLudo(color)) return;
  if (AppStateLudo.roll !== null) return;
  performRollLudo();
}

function aiRollLudo() {
  if (AppStateLudo.gameOver || !AppStateLudo.started) return;
  const color = currentColorLudo();
  if (!isAiColorLudo(color)) return;
  performRollLudo();
}

function performRollLudo() {
  const color = currentColorLudo();
  const value = LudoCore.rollDie();
  AppStateLudo.roll = value;

  if (value === 6) {
    AppStateLudo.sixStreak++;
  } else {
    AppStateLudo.sixStreak = 0;
  }
  updateDiceDisplayLudo(value);

  if (AppStateLudo.sixStreak >= LudoCore.SIX_STREAK_LIMIT) {
    AppStateLudo.legalMoves = [];
    updateLudoBoard();
    updateGameLabelsLudo();
    setStatusLudo("board-info", ludoColorName(color) + " rolled a third 6 in a row - turn forfeited!");
    setTimeout(() => advanceTurnLudo(), AiPacing.delay(800));
    return;
  }

  AppStateLudo.legalMoves = LudoCore.getLegalMoves(AppStateLudo.state, color, value);
  updateLudoBoard();
  updateGameLabelsLudo();

  if (!AppStateLudo.legalMoves.length) {
    setStatusLudo("board-info", ludoColorName(color) + " rolled " + value + ". No legal move.");
    setTimeout(() => afterMoveOrPassLudo(value === 6), AiPacing.delay(700));
    return;
  }

  if (isAiColorLudo(color)) {
    setStatusLudo("board-info", "Computer (" + ludoColorName(color) + ") rolled " + value + ", thinking…");
    setTimeout(() => {
      const tokenIndex = LudoAi.chooseMove(AppStateLudo.state, color, value, AppStateLudo.aiLevel);
      if (tokenIndex === null || tokenIndex === undefined) return;
      applyLudoMove(tokenIndex);
    }, AiPacing.delay(350));
  } else {
    setStatusLudo("board-info", ludoColorName(color) + " rolled " + value + ". Choose a token to move.");
  }
}

function attemptLudoMoveFrom(tokenIndex) {
  if (AppStateLudo.gameOver) {
    setStatusLudo("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  const color = currentColorLudo();
  if (isAiColorLudo(color)) {
    setStatusLudo("board-info", "Computer to move.");
    return;
  }
  if (AppStateLudo.roll === null) {
    setStatusLudo("board-info", "Roll the die first.");
    return;
  }
  if (AppStateLudo.legalMoves.indexOf(tokenIndex) === -1) return; // not legal - ignore the click
  applyLudoMove(tokenIndex);
}

function applyLudoMove(tokenIndex) {
  pushUndoSnapshotLudo();
  const mover = currentColorLudo();
  const roll = AppStateLudo.roll;
  const before = AppStateLudo.state.tokens[mover][tokenIndex];
  const fromState = before.state;
  const fromRel = before.rel;
  const result = LudoCore.applyMove(AppStateLudo.state, mover, tokenIndex, roll);
  AppStateLudo.state = result.state;
  AppStateLudo.moveCount++;
  const after = AppStateLudo.state.tokens[mover][tokenIndex];
  AppStateLudo.lastMove = {
    color: mover,
    tokenIndex: tokenIndex,
    roll: roll,
    fromState: fromState,
    fromRel: fromRel,
    toState: after.state,
    toRel: after.rel
  };
  AppStateLudo.roll = null;
  AppStateLudo.legalMoves = [];
  updateDiceDisplayLudo(null);
  updateLudoBoard();
  updateGameLabelsLudo();

  if (AppStateLudo.state.gameOver) {
    AppStateLudo.gameOver = true;
    const winner = AppStateLudo.state.winner;
    const capturedNote = result.captured.length
      ? " " + result.captured.map((c) => ludoColorName(c.color)).join(", ") + " sent home."
      : "";
    announceGameResultLudo(resultTitleLudo(winner), ludoColorName(winner) + " wins - all 4 tokens home!" + capturedNote);
    recordLudoStatsIfVsAi(winner === AppStateLudo.humanColor ? "win" : "loss");
    updateGameLabelsLudo();
    return;
  }

  // Name the token and how far it went, so a move can be followed
  // without having to spot which token changed.
  const tokenNo = tokenIndex + 1;
  const what = fromState === "home"
    ? ludoColorName(mover) + " brought token " + tokenNo + " into play"
    : ludoColorName(mover) + " moved token " + tokenNo + " forward " + roll;
  let message = what + ".";
  if (result.captured.length) {
    message = what + " and captured " + result.captured.map((c) => ludoColorName(c.color)).join(", ") + "!";
  } else if (result.finished) {
    message = what + " and got it home!";
  }
  setStatusLudo("board-info", message);
  setTimeout(() => afterMoveOrPassLudo(roll === 6), AiPacing.delay(500));
}

// `grantExtraTurn` is true when the roll that led here was a 6 (and
// didn't hit the three-in-a-row forfeit case).
function afterMoveOrPassLudo(grantExtraTurn) {
  if (AppStateLudo.gameOver) return;
  AppStateLudo.roll = null;
  AppStateLudo.legalMoves = [];
  updateDiceDisplayLudo(null);
  updateLudoBoard();
  if (grantExtraTurn) {
    const color = currentColorLudo();
    updateGameLabelsLudo();
    if (isAiColorLudo(color)) {
      setTimeout(aiRollLudo, AiPacing.delay(350));
    } else {
      setStatusLudo("board-info", ludoColorName(color) + " rolled a 6 - roll again!");
      updateThrowButtonVisibilityLudo();
    }
    return;
  }
  advanceTurnLudo();
}

function advanceTurnLudo() {
  AppStateLudo.state.turnIndex = LudoCore.nextTurnIndex(AppStateLudo.state);
  AppStateLudo.sixStreak = 0;
  AppStateLudo.roll = null;
  AppStateLudo.legalMoves = [];
  updateDiceDisplayLudo(null);
  updateLudoBoard();
  updateGameLabelsLudo();
  const color = currentColorLudo();
  if (isAiColorLudo(color)) {
    setTimeout(aiRollLudo, AiPacing.delay(400));
  } else {
    setStatusLudo("board-info", ludoColorName(color) + "'s turn. Roll the die.");
  }
}

function undoLastMoveLudo() {
  if (!AppStateLudo.undoStack || !AppStateLudo.undoStack.length) return;
  let prev = AppStateLudo.undoStack.pop();
  if (AppStateLudo.mode === "vs-ai") {
    while (isAiColorLudo(LudoCore.currentColor(prev.state)) && AppStateLudo.undoStack.length) {
      prev = AppStateLudo.undoStack.pop();
    }
  }
  AppStateLudo.state = prev.state;
  AppStateLudo.sixStreak = prev.sixStreak;
  AppStateLudo.gameOver = prev.gameOver;
  AppStateLudo.moveCount = prev.moveCount;
  AppStateLudo.roll = null;
  AppStateLudo.legalMoves = [];
  AppStateLudo.lastMove = null;
  setGameResultLudo("");
  updateDiceDisplayLudo(null);
  updateLudoBoard();
  updateGameLabelsLudo();
  setStatusLudo("board-info", "Move undone. " + ludoColorName(currentColorLudo()) + "'s turn. Roll the die.");
}

/*** Board construction & rendering ***/

function showBoardSectionLudo() {
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

function gridArea(row, col, rowSpan, colSpan) {
  const rs = rowSpan || 1;
  const cs = colSpan || 1;
  return (row + 1) + " / " + (col + 1) + " / " + (row + 1 + rs) + " / " + (col + 1 + cs);
}

function buildLudoBoardDOM() {
  const boardEl = document.getElementById("ludo-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = "repeat(" + LUDO_GRID_SIZE + ", 1fr)";
  boardEl.style.gridTemplateRows = "repeat(" + LUDO_GRID_SIZE + ", 1fr)";

  // Filler cells for the whole 15x15 grid, so the cross's background
  // reads as solid rather than leaving the four home-base corners
  // (which get their own overlay element) showing the page background.
  for (let r = 0; r < LUDO_GRID_SIZE; r++) {
    for (let c = 0; c < LUDO_GRID_SIZE; c++) {
      const inHomeBase = LudoCore.COLOR_ORDER.some((color) => {
        const o = LUDO_HOME_BASE_ORIGIN[color];
        return r >= o[0] && r < o[0] + 6 && c >= o[1] && c < o[1] + 6;
      });
      if (inHomeBase) continue;
      const filler = document.createElement("div");
      filler.className = "ludo-filler";
      filler.style.gridArea = gridArea(r, c);
      boardEl.appendChild(filler);
    }
  }

  // Gap cells (unused corners inside the arms) sit on top of the filler,
  // styled identically - purely cosmetic, non-interactive.
  LUDO_GAP_CELLS.forEach(([r, c]) => {
    const el = document.createElement("div");
    el.className = "ludo-filler";
    el.style.gridArea = gridArea(r, c);
    boardEl.appendChild(el);
  });

  // The 52 shared track cells.
  LUDO_TRACK_CELLS.forEach(([r, c], idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ludo-cell ludo-cell-track";
    btn.style.gridArea = gridArea(r, c);
    btn.dataset.trackIndex = idx;
    if (LudoCore.isSafeAbs(idx)) btn.classList.add("ludo-cell-safe");
    const tokensWrap = document.createElement("span");
    tokensWrap.className = "ludo-cell-tokens";
    btn.appendChild(tokensWrap);
    btn.addEventListener("click", () => onLudoTrackCellClick(idx));
    boardEl.appendChild(btn);
  });

  // The per-color home-stretch cells.
  LudoCore.COLOR_ORDER.forEach((color) => {
    LUDO_HOME_COLUMN_CELLS[color].forEach(([r, c], step) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ludo-cell ludo-cell-home-column ludo-cell-home-column-" + color;
      btn.style.gridArea = gridArea(r, c);
      btn.dataset.color = color;
      btn.dataset.homeStep = step;
      const tokensWrap = document.createElement("span");
      tokensWrap.className = "ludo-cell-tokens";
      btn.appendChild(tokensWrap);
      btn.addEventListener("click", () => onLudoHomeColumnCellClick(color, step));
      boardEl.appendChild(btn);
    });
  });

  // The four home bases, each a 6x6 overlay containing 4 token slots.
  LudoCore.COLOR_ORDER.forEach((color) => {
    const origin = LUDO_HOME_BASE_ORIGIN[color];
    const base = document.createElement("div");
    base.className = "ludo-home-base ludo-home-base-" + color;
    base.style.gridArea = gridArea(origin[0], origin[1], 6, 6);
    base.dataset.color = color;
    for (let i = 0; i < LudoCore.PIECES_PER_COLOR; i++) {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "ludo-home-slot ludo-home-slot-" + color;
      slot.dataset.color = color;
      slot.dataset.slot = i;
      slot.addEventListener("click", () => onLudoHomeBaseClick(color));
      base.appendChild(slot);
    }
    boardEl.appendChild(base);
  });

  // The center hub. Its 4 corner cells ((6,6)/(6,8)/(8,6)/(8,8)) are
  // themselves shared-track cells (already built above as ordinary
  // track buttons - the classic board's track literally bends through
  // them), so only the remaining 5 cells - the "+"-shaped middle of the
  // 3x3 hub - are this purely decorative overlay: one color-tinted wedge
  // next to each color's own home-column entrance, plus the center
  // finish-tally cell. Each is its own 1x1 grid cell rather than one
  // big 3x3 div, precisely so it never overlaps (and steals clicks
  // from) those 4 track-cell corners.
  const HUB_WEDGES = [
    { row: 7, col: 6, color: "red" },    // beside red's home column (7,5)
    { row: 6, col: 7, color: "green" },  // beside green's home column (5,7)
    { row: 7, col: 8, color: "yellow" }, // beside yellow's home column (7,9)
    { row: 8, col: 7, color: "blue" }    // beside blue's home column (9,7)
  ];
  HUB_WEDGES.forEach((w) => {
    const wedge = document.createElement("div");
    wedge.className = "ludo-hub-wedge ludo-hub-wedge-" + w.color;
    wedge.style.gridArea = gridArea(w.row, w.col);
    boardEl.appendChild(wedge);
  });
  const center = document.createElement("div");
  center.className = "ludo-hub-center";
  center.style.gridArea = gridArea(LUDO_HUB_ORIGIN[0] + 1, LUDO_HUB_ORIGIN[1] + 1);
  const finishedTally = document.createElement("span");
  finishedTally.id = "ludo-finished-tally";
  finishedTally.className = "ludo-finished-tally";
  center.appendChild(finishedTally);
  boardEl.appendChild(center);

  ensureLudoBoardSquare();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensureLudoBoardSquare);
  else setTimeout(ensureLudoBoardSquare, 0);
  ensureLudoResizeHandler();
}

let einkLudoResizeHandlerAttached = false;
let einkLudoResizeTimeoutId = null;

function ensureLudoBoardSquare() {
  const boardEl = document.getElementById("ludo-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = rect.width + "px";
}

function ensureLudoResizeHandler() {
  if (einkLudoResizeHandlerAttached) return;
  einkLudoResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkLudoResizeTimeoutId !== null) clearTimeout(einkLudoResizeTimeoutId);
    einkLudoResizeTimeoutId = setTimeout(() => {
      einkLudoResizeTimeoutId = null;
      ensureLudoBoardSquare();
    }, 150);
  });
}

function onLudoTrackCellClick(absIndex) {
  if (AppStateLudo.gameOver || !AppStateLudo.started) return;
  const color = currentColorLudo();
  if (isAiColorLudo(color) || AppStateLudo.roll === null) return;
  const tokenIndex = findOwnTokenIndexAt(color, "active", (rel) => rel <= LudoCore.LAST_TRACK_REL && LudoCore.absTrackIndex(color, rel) === absIndex);
  if (tokenIndex === -1) return;
  attemptLudoMoveFrom(tokenIndex);
}

function onLudoHomeColumnCellClick(color, step) {
  if (color !== currentColorLudo()) return;
  const rel = LudoCore.MAIN_TRACK_STEPS + step;
  const tokenIndex = findOwnTokenIndexAt(color, "active", (r) => r === rel);
  if (tokenIndex === -1) return;
  attemptLudoMoveFrom(tokenIndex);
}

function onLudoHomeBaseClick(color) {
  if (color !== currentColorLudo()) return;
  const tokens = AppStateLudo.state.tokens[color];
  const tokenIndex = tokens.findIndex((t) => t.state === "home");
  if (tokenIndex === -1) return;
  attemptLudoMoveFrom(tokenIndex);
}

function findOwnTokenIndexAt(color, wantState, relPredicate) {
  const tokens = AppStateLudo.state.tokens[color];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].state === wantState && relPredicate(tokens[i].rel) && AppStateLudo.legalMoves.indexOf(i) !== -1) {
      return i;
    }
  }
  return -1;
}

// The board element showing a token of `color` at the given position:
// its start slot while at home, a track cell, or a home-column cell.
// Finished tokens have no cell of their own, so this returns null.
function ludoPositionElement(boardEl, color, state, rel, tokenIndex) {
  if (state === "home") {
    return boardEl.querySelector(".ludo-home-slot-" + color + "[data-slot='" + tokenIndex + "']");
  }
  if (state !== "active") return null;
  if (rel <= LudoCore.LAST_TRACK_REL) {
    const abs = LudoCore.absTrackIndex(color, rel);
    return boardEl.querySelector(".ludo-cell-track[data-track-index='" + abs + "']");
  }
  const step = rel - LudoCore.MAIN_TRACK_STEPS;
  return boardEl.querySelector(".ludo-cell-home-column-" + color + "[data-home-step='" + step + "']");
}

function markLastMoveLudo(boardEl) {
  boardEl.querySelectorAll(".ludo-cell-last-from, .ludo-cell-last-to, .ludo-home-slot-last").forEach((el) => {
    el.classList.remove("ludo-cell-last-from", "ludo-cell-last-to", "ludo-home-slot-last");
  });
  const lm = AppStateLudo.lastMove;
  if (!lm) return;
  const fromEl = ludoPositionElement(boardEl, lm.color, lm.fromState, lm.fromRel, lm.tokenIndex);
  if (fromEl) fromEl.classList.add(lm.fromState === "home" ? "ludo-home-slot-last" : "ludo-cell-last-from");
  const toEl = ludoPositionElement(boardEl, lm.color, lm.toState, lm.toRel, lm.tokenIndex);
  if (toEl) toEl.classList.add("ludo-cell-last-to");
}

function updateLudoBoard() {
  const boardEl = document.getElementById("ludo-board");
  if (!boardEl) return;
  const state = AppStateLudo.state;
  const currentColor = currentColorLudo();
  const legalSet = new Set(AppStateLudo.legalMoves);

  // Clear all cells first.
  boardEl.querySelectorAll(".ludo-cell-tokens").forEach((el) => { el.innerHTML = ""; });
  boardEl.querySelectorAll(".ludo-cell").forEach((el) => el.classList.remove("ludo-cell-movable"));
  boardEl.querySelectorAll(".ludo-home-slot").forEach((el) => {
    el.classList.remove("ludo-home-slot-filled", "ludo-home-slot-movable");
  });

  LudoCore.COLOR_ORDER.forEach((color) => {
    if (state.activeColors.indexOf(color) === -1) return;
    const tokens = state.tokens[color];
    tokens.forEach((token, tokenIndex) => {
      const isMovable = color === currentColor && legalSet.has(tokenIndex);
      if (token.state === "home") {
        const slot = boardEl.querySelector(".ludo-home-slot-" + color + "[data-slot='" + tokenIndex + "']");
        if (slot) {
          slot.classList.add("ludo-home-slot-filled");
          if (isMovable) slot.classList.add("ludo-home-slot-movable");
        }
      } else if (token.state === "active") {
        let cellEl;
        if (token.rel <= LudoCore.LAST_TRACK_REL) {
          const abs = LudoCore.absTrackIndex(color, token.rel);
          cellEl = boardEl.querySelector(".ludo-cell-track[data-track-index='" + abs + "']");
        } else {
          const step = token.rel - LudoCore.MAIN_TRACK_STEPS;
          cellEl = boardEl.querySelector(".ludo-cell-home-column-" + color + "[data-home-step='" + step + "']");
        }
        if (cellEl) {
          const dot = document.createElement("span");
          dot.className = "ludo-token ludo-token-" + color;
          cellEl.querySelector(".ludo-cell-tokens").appendChild(dot);
          if (isMovable) cellEl.classList.add("ludo-cell-movable");
        }
      }
      // "finished" tokens have no board cell - tallied below.
    });
  });

  // Stack-count badges for cells holding 2+ of the same color.
  boardEl.querySelectorAll(".ludo-cell-tokens").forEach((wrap) => {
    const dots = wrap.querySelectorAll(".ludo-token");
    if (dots.length > 1) {
      dots.forEach((d, i) => { if (i > 0) d.classList.add("ludo-token-stacked"); });
    }
  });

  const tally = document.getElementById("ludo-finished-tally");
  if (tally) {
    tally.innerHTML = "";
    LudoCore.COLOR_ORDER.filter((c) => state.activeColors.indexOf(c) !== -1).forEach((c) => {
      const item = document.createElement("span");
      item.textContent = ludoColorName(c)[0] + LudoCore.tokensFinished(state, c);
      tally.appendChild(item);
    });
  }

  markLastMoveLudo(boardEl);
  updateLudoAriaLabels();
  updateTurnIndicatorLudo();
}

function updateLudoAriaLabels() {
  const boardEl = document.getElementById("ludo-board");
  if (!boardEl) return;
  boardEl.querySelectorAll(".ludo-cell-track").forEach((el) => {
    const idx = parseInt(el.dataset.trackIndex, 10);
    let label = "Track square " + (idx + 1);
    if (LudoCore.isSafeAbs(idx)) label += ", safe square";
    const count = el.querySelectorAll(".ludo-token").length;
    if (count) label += ", " + count + " token" + (count > 1 ? "s" : "");
    if (el.classList.contains("ludo-cell-movable")) label += ", movable";
    I18n.setAria(el, label);
  });
  boardEl.querySelectorAll(".ludo-home-slot").forEach((el) => {
    const color = el.dataset.color;
    let label = ludoColorName(color) + " home token";
    if (el.classList.contains("ludo-home-slot-filled")) label += ", waiting";
    else label += ", in play";
    if (el.classList.contains("ludo-home-slot-movable")) label += ", movable";
    I18n.setAria(el, label);
  });
}

function updateTurnIndicatorLudo() {
  const el = document.getElementById("ludo-turn-indicator");
  if (!el) return;
  el.innerHTML = "";
  const current = currentColorLudo();
  AppStateLudo.activeColors.forEach((color) => {
    const chip = document.createElement("span");
    chip.className = "ludo-turn-chip ludo-turn-chip-" + color;
    if (color === current) chip.classList.add("ludo-turn-chip-active");
    if (isAiColorLudo(color)) chip.classList.add("ludo-turn-chip-ai");
    chip.title = I18n.msg(ludoColorName(color) + (isAiColorLudo(color) ? " (computer)" : (AppStateLudo.mode === "vs-ai" ? " (you)" : "")));
    el.appendChild(chip);
  });
}

function updateDiceDisplayLudo(roll) {
  const el = document.getElementById("ludo-dice-display");
  if (!el) return;
  el.innerHTML = "";
  if (roll === null || roll === undefined) return;
  const die = document.createElement("span");
  die.className = "ludo-die";
  die.textContent = String(roll);
  el.appendChild(die);
}

function updateGameLabelsLudo() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateLudo.moveCount ? "Move " + AppStateLudo.moveCount : "");
  updateUndoButtonVisibilityLudo();
  updateResignVisibilityLudo();
  updateThrowButtonVisibilityLudo();
  updateTurnIndicatorLudo();

  if (AppStateLudo.gameOver) clearSavedLudoGame();
  else if (AppStateLudo.started) saveLudoGame();
}

function updateUndoButtonVisibilityLudo() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateLudo.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateLudo.gameOver));
}

function updateResignVisibilityLudo() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateLudo.gameOver || !AppStateLudo.started);
}

function updateThrowButtonVisibilityLudo() {
  const rollBtn = document.getElementById("ludo-roll-button");
  if (!rollBtn) return;
  const color = AppStateLudo.started ? currentColorLudo() : null;
  const isHumanTurn = AppStateLudo.started && !isAiColorLudo(color);
  rollBtn.disabled = AppStateLudo.gameOver || !isHumanTurn || AppStateLudo.roll !== null;
}

document.addEventListener("DOMContentLoaded", initLudoApp);
