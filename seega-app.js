// seega-app.js
// Wires SeegaCore/SeegaAi to the seega.html UI: a 5x5 board of square
// cells (a CSS grid whose row height is set from its width in JS - no
// CSS `aspect-ratio`). Black stones are filled discs, White stones thick
// rings, so the sides differ by shape, not grey.
//
// The game has two phases, and the page always says which one is on:
// the phase line under the board ("Placing phase ..." / "Moving phase
// ...") and the status line above it, which names the side to move and
// what it has to do.
//
// Placing: tap an empty square (not the centre) - two stones per turn.
// Moving: tap one of your stones, then a highlighted square. After a
// capture the same stone may capture again: it stays selected, further
// capturing squares are highlighted, and tapping the stone itself ends
// the turn.

const AppStateSeega = {
  mode: "offline",        // "offline" | "offline-ai"
  state: SeegaCore.createInitialState("w"),
  selected: null,         // square of the stone picked to move
  lastMove: null,         // { from, to } or { to } for a placement
  humanColor: "w",
  aiLevel: 2,
  moveCount: 0,
  undoStack: []
};

const SEEGA_SAVE_KEY = "einkchess_save_seega";
const SEEGA_STARTER = "w"; // White places and moves first

function saveSeegaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SEEGA_SAVE_KEY, {
    mode: AppStateSeega.mode,
    state: AppStateSeega.state,
    lastMove: AppStateSeega.lastMove,
    humanColor: AppStateSeega.humanColor,
    aiLevel: AppStateSeega.aiLevel,
    moveCount: AppStateSeega.moveCount
  });
}

function clearSavedSeegaGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SEEGA_SAVE_KEY);
}

function recordSeegaStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateSeega.mode !== "offline-ai") return;
  GameStats.record("seega", outcome);
}

function colorNameSeega(c) { return c === "b" ? "Black" : "White"; }

function setStatusSeega(id, text) {
  const el = document.getElementById(id);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSeega(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function isAiTurnSeega() {
  const s = AppStateSeega.state;
  return AppStateSeega.mode === "offline-ai" && !s.over && s.turn !== AppStateSeega.humanColor;
}

// What the side to move has to do now.
function promptSeega() {
  const s = AppStateSeega.state;
  const who = colorNameSeega(s.turn);
  if (s.phase === "place") return who + ": place a stone (" + (s.placedInTurn + 1) + " of " + SeegaCore.PER_TURN + ").";
  if (s.chain !== null) return who + " can capture again with the same stone. Tap it to end the turn.";
  if (s.board[SeegaCore.CENTER] === null && SeegaCore.count(s.board, null) === 1) return who + ": move a stone onto the centre.";
  return who + ": move a stone.";
}

function passTextSeega(s) {
  return s.passed ? colorNameSeega(s.passed) + " cannot move and passes. " : "";
}

function pushUndoSeega() {
  AppStateSeega.undoStack.push({
    state: SeegaCore.cloneState(AppStateSeega.state),
    lastMove: AppStateSeega.lastMove,
    moveCount: AppStateSeega.moveCount
  });
}

function initSeegaApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const colorChoice = document.getElementById("seega-color-choice");
  const levelInline = document.getElementById("seega-level-inline");
  const startGameBtn = document.getElementById("start-seega-game");
  const resignBtn = document.getElementById("resign-button");

  function updateColorChoiceVisibility() {
    if (colorChoice && levelInline) colorChoice.classList.toggle("hidden", levelInline.value === "0");
  }

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const opening = settingsPanel.classList.contains("hidden");
      settingsPanel.classList.toggle("hidden", !opening);
      I18n.setKey(menuToggle, opening ? "menu_close" : "menu_toggle");
    });
  }

  function startNewGame(mode, humanColor, level) {
    AppStateSeega.mode = mode;
    AppStateSeega.state = SeegaCore.createInitialState(SEEGA_STARTER);
    AppStateSeega.selected = null;
    AppStateSeega.lastMove = null;
    AppStateSeega.humanColor = humanColor;
    AppStateSeega.aiLevel = level;
    AppStateSeega.moveCount = 0;
    AppStateSeega.undoStack = [];
    setGameResultSeega("");
    showBoardSectionSeega();
    buildSeegaBoardDOM();
    afterChangeSeega("");
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGame("offline", "w", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateSeega.aiLevel || 2);
    updateColorChoiceVisibility();
    setStatusSeega("board-info", "");
  });

  if (levelInline) levelInline.addEventListener("change", updateColorChoiceVisibility);

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='seega-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "black" ? "b" : "w", ["b", "w"]);
    if (level === 0) {
      setActiveModeButton("offline-ai");
      startNewGame("offline", "w", 0);
      setStatusSeega("offline-seega-status", "Local 2-player game (no computer).");
      return;
    }
    setActiveModeButton("offline-ai");
    startNewGame("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusSeega("offline-seega-status",
      RandomStart.label("You play " + colorNameSeega(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      const s = AppStateSeega.state;
      if (s.over) return;
      const loser = AppStateSeega.mode === "offline-ai" ? AppStateSeega.humanColor : s.turn;
      const winner = SeegaCore.otherColor(loser);
      s.over = true;
      s.chain = null;
      s.result = { winner, reason: "resign" };
      AppStateSeega.selected = null;
      const msg = colorNameSeega(winner) + " wins by resignation.";
      setGameResultSeega(msg);
      setStatusSeega("board-info", msg);
      if (window.ResultModal) window.ResultModal.show(resultTitleSeega(winner), msg);
      recordSeegaStatsIfVsAi("loss");
      updateSeegaBoard();
      updateGameLabelsSeega();
    });
  }

  updateColorChoiceVisibility();

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SEEGA_SAVE_KEY) : null;
  if (saved && saved.state && !saved.state.over) {
    AppStateSeega.mode = saved.mode;
    AppStateSeega.state = saved.state;
    AppStateSeega.selected = null;
    AppStateSeega.lastMove = saved.lastMove;
    AppStateSeega.humanColor = saved.humanColor;
    AppStateSeega.aiLevel = saved.aiLevel;
    AppStateSeega.moveCount = saved.moveCount;
    AppStateSeega.undoStack = [];
    setActiveModeButton(AppStateSeega.mode);
    setGameResultSeega("");
    showBoardSectionSeega();
    buildSeegaBoardDOM();
    afterChangeSeega("");
  }
}

function resultTitleSeega(winner) {
  if (winner === null) return "Draw";
  if (AppStateSeega.mode === "offline-ai") return winner === AppStateSeega.humanColor ? "You win!" : "You lose";
  return colorNameSeega(winner) + " wins";
}

function endTextSeega(s) {
  const r = s.result;
  const nb = SeegaCore.count(s.board, "b"), nw = SeegaCore.count(s.board, "w");
  if (r.reason === "all-captured") return colorNameSeega(r.winner) + " wins: every stone of the other side is captured.";
  const hi = Math.max(nb, nw), lo = Math.min(nb, nw);
  if (r.winner === null) {
    return r.reason === "quiet" ? "Draw: " + nb + " stones each after 40 turns without a capture." : "Draw: " + nb + " stones each, neither side can move.";
  }
  return r.reason === "quiet"
    ? colorNameSeega(r.winner) + " wins on stones (" + hi + " to " + lo + ") after 40 turns without a capture."
    : colorNameSeega(r.winner) + " wins on stones (" + hi + " to " + lo + "): neither side can move.";
}

// Called after every change of the game: redraw, report, hand over to
// the computer when it is its turn.
function afterChangeSeega(prefix) {
  const s = AppStateSeega.state;
  updateSeegaBoard();
  updateGameLabelsSeega();
  if (s.over) {
    const msg = endTextSeega(s);
    setGameResultSeega(msg);
    setStatusSeega("board-info", msg);
    if (window.ResultModal) window.ResultModal.show(resultTitleSeega(s.result.winner), msg);
    if (s.result.winner === null) recordSeegaStatsIfVsAi("draw");
    else recordSeegaStatsIfVsAi(s.result.winner === AppStateSeega.humanColor ? "win" : "loss");
    updateGameLabelsSeega();
    return;
  }
  if (isAiTurnSeega()) {
    setStatusSeega("board-info", prefix + passTextSeega(s) + "Computer thinking…");
    setTimeout(aiStepSeega, AiPacing.delay(300));
  } else {
    setStatusSeega("board-info", prefix + passTextSeega(s) + promptSeega());
  }
}

function aiStepSeega() {
  if (!isAiTurnSeega()) return;
  const s = AppStateSeega.state;
  if (s.phase === "place") {
    const i = SeegaAi.choosePlacement(s, AppStateSeega.aiLevel);
    if (i === null) return;
    doPlacementSeega(i);
    return;
  }
  const m = SeegaAi.chooseMove(s, AppStateSeega.aiLevel);
  if (!m) return;
  doMoveSeega(m);
}

function doPlacementSeega(i) {
  pushUndoSeega();
  AppStateSeega.state = SeegaCore.applyPlacement(AppStateSeega.state, i);
  AppStateSeega.lastMove = { to: i };
  AppStateSeega.moveCount++;
  afterChangeSeega("");
}

function doMoveSeega(m) {
  const mover = AppStateSeega.state.turn;
  pushUndoSeega();
  AppStateSeega.state = SeegaCore.applyMove(AppStateSeega.state, m);
  AppStateSeega.selected = AppStateSeega.state.chain !== null ? AppStateSeega.state.chain : null;
  if (!m.stop) {
    AppStateSeega.lastMove = { from: m.from, to: m.to };
    AppStateSeega.moveCount++;
  }
  const prefix = m.captured && m.captured.length ? colorNameSeega(mover) + " captured " + m.captured.length + ". " : "";
  afterChangeSeega(prefix);
}

function onSeegaCellClick(i) {
  const s = AppStateSeega.state;
  if (s.over) {
    setStatusSeega("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (isAiTurnSeega()) {
    setStatusSeega("board-info", "Computer to move.");
    return;
  }
  if (s.phase === "place") {
    if (SeegaCore.legalPlacements(s).indexOf(i) === -1) {
      setStatusSeega("board-info", "Invalid move.");
      return;
    }
    doPlacementSeega(i);
    return;
  }
  const moves = SeegaCore.legalMoves(s);
  if (s.chain !== null) {
    if (i === s.chain) { doMoveSeega({ stop: true }); return; }
    const m = moves.find((x) => !x.stop && x.to === i);
    if (m) doMoveSeega(m);
    else setStatusSeega("board-info", promptSeega());
    return;
  }
  if (AppStateSeega.selected !== null) {
    const m = moves.find((x) => x.from === AppStateSeega.selected && x.to === i);
    if (m) { doMoveSeega(m); return; }
  }
  if (s.board[i] === s.turn && moves.some((x) => x.from === i)) {
    AppStateSeega.selected = i;
    updateSeegaBoard();
    setStatusSeega("board-info", "Choose where to move it.");
    return;
  }
  if (s.board[i] === s.turn) {
    setStatusSeega("board-info", "Invalid move.");
    return;
  }
  AppStateSeega.selected = null;
  updateSeegaBoard();
  setStatusSeega("board-info", promptSeega());
}

function undoLastMove() {
  if (!AppStateSeega.undoStack.length) return;
  let prev = AppStateSeega.undoStack.pop();
  if (AppStateSeega.mode === "offline-ai") {
    while ((prev.state.turn !== AppStateSeega.humanColor || prev.state.chain !== null) && AppStateSeega.undoStack.length) {
      prev = AppStateSeega.undoStack.pop();
    }
  }
  AppStateSeega.state = prev.state;
  AppStateSeega.lastMove = prev.lastMove;
  AppStateSeega.moveCount = prev.moveCount;
  AppStateSeega.selected = AppStateSeega.state.chain;
  setGameResultSeega("");
  updateSeegaBoard();
  updateGameLabelsSeega();
  setStatusSeega("board-info", "Move undone. " + promptSeega());
}

function showBoardSectionSeega() {
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

function buildSeegaBoardDOM() {
  const boardEl = document.getElementById("seega-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  for (let i = 0; i < SeegaCore.CELLS; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "seega-cell" + (i === SeegaCore.CENTER ? " seega-cell-center" : "");
    cell.dataset.cell = i;
    const stone = document.createElement("span");
    stone.className = "seega-stone";
    stone.setAttribute("aria-hidden", "true");
    cell.appendChild(stone);
    cell.addEventListener("click", () => onSeegaCellClick(i));
    boardEl.appendChild(cell);
  }
  ensureSeegaBoardAspect();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensureSeegaBoardAspect);
  else setTimeout(ensureSeegaBoardAspect, 0);
  ensureSeegaResizeHandler();
}

let seegaResizeAttached = false;
let seegaResizeTimeout = null;

function ensureSeegaBoardAspect() {
  const boardEl = document.getElementById("seega-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const h = (rect.width - 6) / SeegaCore.SIZE;
  boardEl.querySelectorAll(".seega-cell").forEach((c) => { c.style.height = h + "px"; });
}

function ensureSeegaResizeHandler() {
  if (seegaResizeAttached) return;
  seegaResizeAttached = true;
  window.addEventListener("resize", () => {
    if (seegaResizeTimeout !== null) clearTimeout(seegaResizeTimeout);
    seegaResizeTimeout = setTimeout(() => { seegaResizeTimeout = null; ensureSeegaBoardAspect(); }, 150);
  });
}

function updateSeegaBoard() {
  const boardEl = document.getElementById("seega-board");
  if (!boardEl) return;
  const s = AppStateSeega.state;
  const human = !s.over && !isAiTurnSeega();
  let targets = new Set(), selectable = new Set();
  if (human && s.phase === "place") {
    SeegaCore.legalPlacements(s).forEach((i) => targets.add(i));
  } else if (human) {
    const moves = SeegaCore.legalMoves(s);
    if (s.chain !== null) moves.forEach((m) => { if (!m.stop) targets.add(m.to); });
    else if (AppStateSeega.selected !== null) moves.forEach((m) => { if (m.from === AppStateSeega.selected) targets.add(m.to); });
    else moves.forEach((m) => selectable.add(m.from));
  }
  const active = s.chain !== null ? s.chain : AppStateSeega.selected;
  boardEl.querySelectorAll(".seega-cell").forEach((cell) => {
    const i = parseInt(cell.dataset.cell, 10);
    const v = s.board[i];
    const stone = cell.querySelector(".seega-stone");
    stone.className = "seega-stone" + (v === "b" ? " seega-stone-black" : v === "w" ? " seega-stone-white" : "");
    cell.classList.toggle("seega-cell-target", targets.has(i) && s.phase === "move");
    cell.classList.toggle("seega-cell-selectable", selectable.has(i));
    cell.classList.toggle("seega-cell-selected", active === i);
    const lm = AppStateSeega.lastMove;
    cell.classList.toggle("last-move", !!lm && (lm.to === i || lm.from === i));
    let label = "Row " + (SeegaCore.rowOf(i) + 1) + ", column " + (SeegaCore.colOf(i) + 1);
    label += v ? ", " + colorNameSeega(v) + " stone" : ", empty";
    if (i === SeegaCore.CENTER) label += ", centre";
    if (active === i) label += ", selected";
    else if (targets.has(i) || selectable.has(i)) label += ", movable";
    I18n.setAria(cell, label);
  });
  ensureSeegaBoardAspect();
  updatePhaseLineSeega();
}

function updatePhaseLineSeega() {
  const container = document.getElementById("score-line");
  const textEl = document.getElementById("score-captures");
  if (!container || !textEl) return;
  const s = AppStateSeega.state;
  container.classList.remove("hidden");
  if (s.phase === "place") {
    I18n.setMsg(textEl, "Placing phase · stones to place – Black: " + s.inHand.b + " · White: " + s.inHand.w);
  } else {
    I18n.setMsg(textEl, "Moving phase · stones – Black: " + SeegaCore.count(s.board, "b") + " · White: " +
      SeegaCore.count(s.board, "w") + " · turns without capture: " + s.quiet + " of " + SeegaCore.QUIET_LIMIT);
  }
}

function updateGameLabelsSeega() {
  const s = AppStateSeega.state;
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateSeega.moveCount ? "Move " + AppStateSeega.moveCount : "");
  const undoBtn = document.getElementById("undo-btn");
  if (undoBtn) undoBtn.classList.toggle("hidden", !(AppStateSeega.undoStack.length && !s.over));
  const resignBtn = document.getElementById("resign-button");
  if (resignBtn) resignBtn.classList.toggle("hidden", s.over);
  if (s.over) clearSavedSeegaGame();
  else saveSeegaGame();
}

document.addEventListener("DOMContentLoaded", initSeegaApp);
