// backgammon-app.js
// Wires BackgammonCore/BackgammonAi to the backgammon.html UI. The board
// is a 13-column x 2-row CSS grid (point lanes 1-24 plus a middle bar
// column spanning both rows) - explicit grid-column/grid-row placement
// throughout rather than relying on auto-flow, so nothing depends on
// `aspect-ratio` or the `inset` shorthand (both silently ignored on some
// E-Ink browsers - explicit top/left/width/height and a JS-enforced
// height are used instead, the same approach as the other boards here).
// The bar and each color's borne-off checkers have no point of their
// own, so - like Ur's off-board pieces - they're simple clickable
// counters above/below the board rather than board squares.
//
// This app deliberately doesn't implement the doubling cube - see the
// note in backgammon-core.js about the "maximize dice usage" rule too.

const TOP_ROW = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const BOTTOM_ROW = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const AppStateBackgammon = {
  mode: "offline",        // "offline" | "offline-ai"
  state: BackgammonCore.createInitialState(),
  turn: "b",              // "b" | "w" - Black always moves first
  dice: [],               // remaining unplayed die values this turn
  selected: null,         // 'bar' | point number | null
  humanColor: "b",
  aiLevel: 2,             // 1 = easy, 2 = medium, 3 = hard
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

function colorNameBg(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusBg(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultBg(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultBg(resultCode, message) {
  setGameResultBg(message);
  setStatusBg("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show("Game Over", message);
  }
}

function resetUndoStackBg() {
  AppStateBackgammon.undoStack = [];
}

function pushUndoSnapshotBg() {
  AppStateBackgammon.undoStack.push({
    state: BackgammonCore.cloneState(AppStateBackgammon.state),
    turn: AppStateBackgammon.turn,
    dice: AppStateBackgammon.dice.slice(),
    gameOver: AppStateBackgammon.gameOver,
    moveCount: AppStateBackgammon.moveCount
  });
}

function pointGridColumn(pointNum, row) {
  const order = row === "top" ? TOP_ROW : BOTTOM_ROW;
  const i = order.indexOf(pointNum);
  return i < 6 ? i + 1 : i + 2; // column 7 is reserved for the bar
}

function initBackgammonApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("backgammon-color-choice");
  const levelInline = document.getElementById("backgammon-level-inline");
  const startGameBtn = document.getElementById("start-backgammon-game");
  const resignBtn = document.getElementById("resign-button");
  const rollBtn = document.getElementById("backgammon-roll-button");
  const barTop = document.getElementById("backgammon-bar-top");
  const barBottom = document.getElementById("backgammon-bar-bottom");
  const offTop = document.getElementById("backgammon-off-top");
  const offBottom = document.getElementById("backgammon-off-bottom");

  function updateColorChoiceVisibilityBg() {
    if (!colorChoice || !levelInline) return;
    colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButtonBg(mode) {
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

  function startNewGameBg(mode, humanColor, level) {
    AppStateBackgammon.mode = mode;
    AppStateBackgammon.state = BackgammonCore.createInitialState();
    AppStateBackgammon.turn = "b";
    AppStateBackgammon.dice = [];
    AppStateBackgammon.selected = null;
    AppStateBackgammon.humanColor = humanColor;
    AppStateBackgammon.aiLevel = level;
    AppStateBackgammon.gameOver = false;
    AppStateBackgammon.moveCount = 0;
    resetUndoStackBg();
    setGameResultBg("");
    showBoardSectionBg();
    buildBackgammonBoardDOM();
    updateBackgammonBoard();
    updateGameLabelsBg();

    if (mode === "offline-ai" && humanColor !== "b") {
      setStatusBg("board-info", "Computer thinking…");
      setTimeout(aiTurnBg, 300);
    } else {
      setStatusBg("board-info", colorNameBg(AppStateBackgammon.turn) + " to move. Roll the dice.");
    }
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButtonBg("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameBg("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButtonBg("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateBackgammon.aiLevel || 2);
    updateColorChoiceVisibilityBg();
    setStatusBg("board-info", "");
  });

  if (levelInline) {
    levelInline.addEventListener("change", updateColorChoiceVisibilityBg);
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='backgammon-color']:checked");
    const humanColor = colorInput && colorInput.value === "white" ? "w" : "b";

    if (level === 0) {
      setActiveModeButtonBg("offline-ai");
      startNewGameBg("offline", "b", 0);
      setStatusBg("offline-backgammon-status", "Local 2-player game (no computer).");
      return;
    }

    setActiveModeButtonBg("offline-ai");
    startNewGameBg("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusBg("offline-backgammon-status",
      "You play " + colorNameBg(humanColor) + ", computer level: " + (levelNames[level] || level) + ".");
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateBackgammon.gameOver) return;
      const loser = AppStateBackgammon.turn;
      const winner = BackgammonCore.otherColor(loser);
      AppStateBackgammon.gameOver = true;
      announceGameResultBg(colorNameBg(winner) + " wins", colorNameBg(winner) + " wins by resignation.");
      updateGameLabelsBg();
    });
  }

  if (rollBtn) rollBtn.addEventListener("click", rollDiceBg);
  if (barTop) barTop.addEventListener("click", () => onBackgammonSourceClick("bar", "b"));
  if (barBottom) barBottom.addEventListener("click", () => onBackgammonSourceClick("bar", "w"));
  if (offTop) offTop.addEventListener("click", () => onBackgammonDestClick("off", "b"));
  if (offBottom) offBottom.addEventListener("click", () => onBackgammonDestClick("off", "w"));

  updateColorChoiceVisibilityBg();
  // No mode is pre-selected and no game auto-starts: the placeholder
  // shows until the player picks 2-player or configures vs-computer and
  // presses New game, matching chess.html's behavior.
}

function rollDiceBg() {
  if (AppStateBackgammon.gameOver) return;
  if (AppStateBackgammon.mode === "offline-ai" && AppStateBackgammon.turn !== AppStateBackgammon.humanColor) return;
  if (AppStateBackgammon.dice.length) return; // already rolled, must finish this turn first

  const dice = BackgammonCore.rollDice();
  AppStateBackgammon.dice = dice;
  AppStateBackgammon.selected = null;
  updateBackgammonBoard();
  updateGameLabelsBg();

  if (!BackgammonCore.hasAnyLegalMove(AppStateBackgammon.state, AppStateBackgammon.turn, dice)) {
    setStatusBg("board-info", colorNameBg(AppStateBackgammon.turn) + " rolled " + dice.join("-") + ". No legal move - turn passes.");
    setTimeout(endTurnBg, 900);
    return;
  }
  setStatusBg("board-info", colorNameBg(AppStateBackgammon.turn) + " rolled " + dice.join("-") + ". Choose a piece to move.");
}

function endTurnBg() {
  AppStateBackgammon.dice = [];
  AppStateBackgammon.selected = null;
  AppStateBackgammon.turn = BackgammonCore.otherColor(AppStateBackgammon.turn);
  updateBackgammonBoard();
  updateGameLabelsBg();
  maybeTriggerAiTurnBg();
  if (!(AppStateBackgammon.mode === "offline-ai" && AppStateBackgammon.turn !== AppStateBackgammon.humanColor)) {
    setStatusBg("board-info", colorNameBg(AppStateBackgammon.turn) + " to move. Roll the dice.");
  }
}

function maybeTriggerAiTurnBg() {
  if (AppStateBackgammon.gameOver) return;
  if (AppStateBackgammon.mode === "offline-ai" && AppStateBackgammon.turn !== AppStateBackgammon.humanColor) {
    setTimeout(aiTurnBg, 400);
  }
}

// Every currently-reachable destination from `src` (either 'bar' or a
// point number) given the remaining dice, each tagged with which die
// value would be used.
function legalDestinationsFrom(src) {
  const dests = [];
  const seenDieValues = new Set();
  AppStateBackgammon.dice.forEach((die) => {
    if (seenDieValues.has(die)) return;
    seenDieValues.add(die);
    const moves = BackgammonCore.getLegalMovesForDie(AppStateBackgammon.state, AppStateBackgammon.turn, die);
    moves.forEach((m) => {
      if (m.from === src) dests.push({ to: m.to, die });
    });
  });
  return dests;
}

function onBackgammonSourceClick(pointRef, ownerColor) {
  if (AppStateBackgammon.gameOver) {
    setStatusBg("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (AppStateBackgammon.mode === "offline-ai" && AppStateBackgammon.turn !== AppStateBackgammon.humanColor) {
    setStatusBg("board-info", "Computer to move.");
    return;
  }
  if (!AppStateBackgammon.dice.length) {
    setStatusBg("board-info", "Roll the dice first.");
    return;
  }
  if (ownerColor !== AppStateBackgammon.turn) return;

  if (AppStateBackgammon.selected === pointRef) {
    AppStateBackgammon.selected = null;
    updateBackgammonBoard();
    return;
  }
  if (!legalDestinationsFrom(pointRef).length) return; // no legal move from here right now
  AppStateBackgammon.selected = pointRef;
  updateBackgammonBoard();
}

function onBackgammonDestClick(pointRef, trayColor) {
  if (AppStateBackgammon.selected === null) return;
  if (AppStateBackgammon.gameOver) return;
  if (pointRef === "off" && trayColor !== AppStateBackgammon.turn) return;

  const dests = legalDestinationsFrom(AppStateBackgammon.selected);
  const match = dests.find((d) => d.to === pointRef);
  if (!match) {
    setStatusBg("board-info", "Invalid move.");
    return;
  }
  applyBackgammonMove({ from: AppStateBackgammon.selected, to: pointRef }, match.die);
}

function applyBackgammonMove(move, die) {
  pushUndoSnapshotBg();
  const mover = AppStateBackgammon.turn;
  AppStateBackgammon.state = BackgammonCore.applyMove(AppStateBackgammon.state, mover, move);
  AppStateBackgammon.moveCount++;
  AppStateBackgammon.selected = null;
  const dieIdx = AppStateBackgammon.dice.indexOf(die);
  if (dieIdx !== -1) AppStateBackgammon.dice.splice(dieIdx, 1);
  updateBackgammonBoard();
  updateGameLabelsBg();

  if (BackgammonCore.hasWon(AppStateBackgammon.state, mover)) {
    AppStateBackgammon.gameOver = true;
    const mult = BackgammonCore.scoreMultiplier(AppStateBackgammon.state, mover);
    const kind = mult === 3 ? "backgammon" : mult === 2 ? "gammon" : "single game";
    announceGameResultBg(colorNameBg(mover) + " wins", colorNameBg(mover) + " wins (" + kind + ")!");
    return;
  }

  // This is the single place that decides what happens next after a
  // move - both the human click handlers and aiTurnBg funnel through
  // here, so there's never more than one pending endTurnBg/aiTurnBg
  // callback racing to flip the turn twice.
  const diceExhausted = !AppStateBackgammon.dice.length;
  const stuck = !diceExhausted && !BackgammonCore.hasAnyLegalMove(AppStateBackgammon.state, mover, AppStateBackgammon.dice);

  if (diceExhausted || stuck) {
    if (stuck) setStatusBg("board-info", colorNameBg(mover) + " played. No further legal move this turn.");
    setTimeout(endTurnBg, stuck ? 500 : 0);
    return;
  }

  setStatusBg("board-info", colorNameBg(mover) + " played. " + AppStateBackgammon.dice.length + " di" + (AppStateBackgammon.dice.length === 1 ? "e" : "ce") + " left to play.");

  if (AppStateBackgammon.mode === "offline-ai" && mover === BackgammonCore.otherColor(AppStateBackgammon.humanColor)) {
    setTimeout(aiTurnBg, 350);
  }
}

function aiTurnBg() {
  if (AppStateBackgammon.mode !== "offline-ai" || AppStateBackgammon.gameOver) return;
  const aiColor = BackgammonCore.otherColor(AppStateBackgammon.humanColor);
  if (AppStateBackgammon.turn !== aiColor) return;

  if (!AppStateBackgammon.dice.length) {
    const dice = BackgammonCore.rollDice();
    AppStateBackgammon.dice = dice;
    setStatusBg("board-info", "Computer rolled " + dice.join("-") + ".");
    updateGameLabelsBg();
    if (!BackgammonCore.hasAnyLegalMove(AppStateBackgammon.state, aiColor, dice)) {
      setTimeout(endTurnBg, 700);
      return;
    }
  }

  setTimeout(() => {
    if (AppStateBackgammon.gameOver || AppStateBackgammon.turn !== aiColor) return;
    // Play exactly one die here; applyBackgammonMove is the single
    // authority that decides whether to end the turn or schedule the
    // next aiTurnBg step for the remaining dice.
    for (let i = 0; i < AppStateBackgammon.dice.length; i++) {
      const die = AppStateBackgammon.dice[i];
      const move = BackgammonAi.chooseMove(AppStateBackgammon.state, aiColor, die, AppStateBackgammon.aiLevel);
      if (move) {
        applyBackgammonMove(move, die);
        return;
      }
    }
    endTurnBg(); // shouldn't normally happen given the hasAnyLegalMove guard above, but a safe fallback
  }, 350);
}

function undoLastMove() {
  if (!AppStateBackgammon.undoStack || !AppStateBackgammon.undoStack.length) return;
  let prev = AppStateBackgammon.undoStack.pop();
  if (AppStateBackgammon.mode === "offline-ai") {
    while (prev.turn !== AppStateBackgammon.humanColor && AppStateBackgammon.undoStack.length) {
      prev = AppStateBackgammon.undoStack.pop();
    }
  }
  AppStateBackgammon.state = prev.state;
  AppStateBackgammon.turn = prev.turn;
  AppStateBackgammon.dice = prev.dice;
  AppStateBackgammon.gameOver = prev.gameOver;
  AppStateBackgammon.moveCount = prev.moveCount;
  AppStateBackgammon.selected = null;
  setGameResultBg("");
  updateBackgammonBoard();
  updateGameLabelsBg();
  setStatusBg("board-info", "Move undone.");
}

function showBoardSectionBg() {
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

/*** Board rendering ***/

function buildBackgammonBoardDOM() {
  const boardEl = document.getElementById("backgammon-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const bar = document.createElement("div");
  bar.className = "bg-bar";
  bar.style.gridColumn = "7";
  bar.style.gridRow = "1 / 3";
  boardEl.appendChild(bar);

  [["top", TOP_ROW], ["bottom", BOTTOM_ROW]].forEach(([rowName, order]) => {
    order.forEach((pointNum) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "bg-point bg-point-" + rowName + (pointNum % 2 === 0 ? " bg-point-alt" : "");
      cell.style.gridColumn = String(pointGridColumn(pointNum, rowName));
      cell.style.gridRow = rowName === "top" ? "1" : "2";
      cell.dataset.point = pointNum;

      const label = document.createElement("span");
      label.className = "bg-point-label";
      label.textContent = pointNum;
      cell.appendChild(label);

      const stack = document.createElement("div");
      stack.className = "bg-point-stack";
      cell.appendChild(stack);

      cell.addEventListener("click", () => {
        const owner = AppStateBackgammon.state.points[pointNum].color;
        if (AppStateBackgammon.selected === null) {
          if (owner) onBackgammonSourceClick(pointNum, owner);
        } else if (AppStateBackgammon.selected === pointNum) {
          onBackgammonSourceClick(pointNum, owner); // toggles the selection off
        } else if (owner === AppStateBackgammon.turn) {
          // Clicking another of your own points re-selects it from
          // there instead, matching checkers/morris. Moving onto a
          // point you already occupy is legal but never required, so
          // this click always means "pick this piece up next."
          onBackgammonSourceClick(pointNum, owner);
        } else {
          onBackgammonDestClick(pointNum, null);
        }
      });
      boardEl.appendChild(cell);
    });
  });

  ensureBackgammonBoardSquare();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureBackgammonBoardSquare);
  } else {
    setTimeout(ensureBackgammonBoardSquare, 0);
  }
  ensureBackgammonResizeHandler();
}

let einkBgResizeHandlerAttached = false;
let einkBgResizeTimeoutId = null;

function ensureBackgammonBoardSquare() {
  const boardEl = document.getElementById("backgammon-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  boardEl.style.height = (rect.width * 0.62) + "px";
}

function ensureBackgammonResizeHandler() {
  if (einkBgResizeHandlerAttached) return;
  einkBgResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkBgResizeTimeoutId !== null) clearTimeout(einkBgResizeTimeoutId);
    einkBgResizeTimeoutId = setTimeout(() => {
      einkBgResizeTimeoutId = null;
      ensureBackgammonBoardSquare();
    }, 150);
  });
}

const MAX_STACK_SHOWN = 5;

function renderCheckerStack(container, color, count) {
  container.innerHTML = "";
  if (!color || count === 0) return;
  const shown = Math.min(count, MAX_STACK_SHOWN);
  for (let i = 0; i < shown; i++) {
    const checker = document.createElement("span");
    checker.className = "bg-checker " + (color === "b" ? "bg-checker-black" : "bg-checker-white");
    container.appendChild(checker);
  }
  if (count > MAX_STACK_SHOWN) {
    const badge = document.createElement("span");
    badge.className = "bg-checker-overflow";
    badge.textContent = "+" + (count - MAX_STACK_SHOWN);
    container.appendChild(badge);
  }
}

function updateBackgammonBoard() {
  const boardEl = document.getElementById("backgammon-board");
  if (!boardEl) return;

  const dests = AppStateBackgammon.selected !== null ? legalDestinationsFrom(AppStateBackgammon.selected) : [];
  const destSet = new Set(dests.map((d) => d.to));

  boardEl.querySelectorAll(".bg-point").forEach((cell) => {
    const p = parseInt(cell.dataset.point, 10);
    const pt = AppStateBackgammon.state.points[p];
    renderCheckerStack(cell.querySelector(".bg-point-stack"), pt.color, pt.count);
    cell.classList.toggle("bg-point-selected", AppStateBackgammon.selected === p);
    cell.classList.toggle("bg-point-movable", destSet.has(p));
  });

  const barTop = document.getElementById("backgammon-bar-top");
  const barBottom = document.getElementById("backgammon-bar-bottom");
  const offTop = document.getElementById("backgammon-off-top");
  const offBottom = document.getElementById("backgammon-off-bottom");
  if (barTop) {
    setStatusBg("backgammon-bar-top-count", String(AppStateBackgammon.state.bar.b));
    barTop.classList.toggle("bg-tray-movable", AppStateBackgammon.turn === "b" && AppStateBackgammon.state.bar.b > 0 && legalDestinationsFrom("bar").length > 0 && AppStateBackgammon.selected === null);
  }
  if (barBottom) {
    setStatusBg("backgammon-bar-bottom-count", String(AppStateBackgammon.state.bar.w));
    barBottom.classList.toggle("bg-tray-movable", AppStateBackgammon.turn === "w" && AppStateBackgammon.state.bar.w > 0 && legalDestinationsFrom("bar").length > 0 && AppStateBackgammon.selected === null);
  }
  if (offTop) {
    setStatusBg("backgammon-off-top-count", String(AppStateBackgammon.state.off.b));
    offTop.classList.toggle("bg-tray-movable", destSet.has("off") && AppStateBackgammon.turn === "b");
  }
  if (offBottom) {
    setStatusBg("backgammon-off-bottom-count", String(AppStateBackgammon.state.off.w));
    offBottom.classList.toggle("bg-tray-movable", destSet.has("off") && AppStateBackgammon.turn === "w");
  }

  updateDiceDisplayBg();
}

function updateDiceDisplayBg() {
  const el = document.getElementById("backgammon-dice-display");
  if (!el) return;
  el.innerHTML = "";
  AppStateBackgammon.dice.forEach((d) => {
    const die = document.createElement("span");
    die.className = "bg-die";
    die.textContent = String(d);
    el.appendChild(die);
  });
}

function updateGameLabelsBg() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateBackgammon.moveCount ? "Move " + AppStateBackgammon.moveCount : "";
  updateUndoButtonVisibilityBg();
  updateResignVisibilityBg();
  updateRollButtonVisibilityBg();
}

function updateUndoButtonVisibilityBg() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateBackgammon.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateBackgammon.gameOver));
}

function updateResignVisibilityBg() {
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", AppStateBackgammon.gameOver);
}

function updateRollButtonVisibilityBg() {
  const rollBtn = document.getElementById("backgammon-roll-button");
  if (!rollBtn) return;
  const isHumanTurn = !(AppStateBackgammon.mode === "offline-ai" && AppStateBackgammon.turn !== AppStateBackgammon.humanColor);
  rollBtn.disabled = AppStateBackgammon.gameOver || !isHumanTurn || AppStateBackgammon.dice.length > 0;
}

document.addEventListener("DOMContentLoaded", initBackgammonApp);
