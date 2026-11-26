// dreitafeln-app.js
// Wires DreitafelnCore/DreitafelnAi to dreitafeln.html (Three Grids). Three
// 3 x 3 grids with the fields numbered 1-9, below them the three open cards.
// Tap a card: the fields with its number that are still free light up, tap
// one of them. Or tap a free field whose number lies open at once. Tapping
// the chosen card again puts it back.

const AppStateDreitafeln = {
  mode: "offline",        // "offline" | "offline-ai"
  state: DreitafelnCore.createInitialState(),
  turn: "x",              // mirrors state.turn - X always moves first
  humanColor: "x",
  aiLevel: 2,
  gameOver: false,
  selected: null,         // slot of the chosen open card
  undoStack: []
};

const DREITAFELN_SAVE_KEY = "einkchess_save_dreitafeln";

const DT_MARK_SVG = {
  x: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M9 9 L31 31 M31 9 L9 31" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
  o: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="5"/></svg>'
};

function setStateDreitafeln(state) {
  AppStateDreitafeln.state = state;
  AppStateDreitafeln.turn = state.turn;
  AppStateDreitafeln.gameOver = !!state.result;
}

function saveDreitafelnGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(DREITAFELN_SAVE_KEY, {
    mode: AppStateDreitafeln.mode,
    state: AppStateDreitafeln.state,
    humanColor: AppStateDreitafeln.humanColor,
    aiLevel: AppStateDreitafeln.aiLevel,
    undoStack: AppStateDreitafeln.undoStack.slice(-50)
  });
}

function clearSavedDreitafelnGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(DREITAFELN_SAVE_KEY);
}

function isDreitafelnState(s) {
  return !!s && Array.isArray(s.boards) && s.boards.length === DreitafelnCore.BOARDS &&
    s.boards.every((b) => Array.isArray(b) && b.length === 9) &&
    Array.isArray(s.won) && s.won.length === DreitafelnCore.BOARDS && Array.isArray(s.lines) &&
    Array.isArray(s.open) && s.open.length === DreitafelnCore.OPEN && Array.isArray(s.deck) &&
    (s.turn === "x" || s.turn === "o");
}

function recordDreitafelnStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateDreitafeln.mode !== "offline-ai") return;
  GameStats.record("dreitafeln", outcome);
}

function sideNameDreitafeln(side) {
  return side === "x" ? "X" : "O";
}

function setStatusDreitafeln(elementId, text) {
  if (AppStateDreitafeln.mode === "offline-ai" && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateDreitafeln);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultDreitafeln(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleDreitafeln(winner) {
  if (AppStateDreitafeln.mode === "offline-ai") {
    return winner === AppStateDreitafeln.humanColor ? "You win!" : "You lose";
  }
  return sideNameDreitafeln(winner) + " wins";
}

function announceGameResultDreitafeln(resultCode, message) {
  setGameResultDreitafeln(message);
  setStatusDreitafeln("board-info", message);
  if (window.ResultModal) window.ResultModal.show(resultCode, message);
}

// The sentence that says what the side to move does next.
function promptDreitafeln() {
  const A = AppStateDreitafeln;
  const st = A.state;
  if (A.selected !== null && st.open[A.selected] !== null) {
    return "Card " + st.open[A.selected] + ": tap a highlighted field.";
  }
  return sideNameDreitafeln(st.turn) + " to move. Take a card.";
}

function showPromptDreitafeln(prefix) {
  const A = AppStateDreitafeln;
  if (A.gameOver) return;
  const computer = A.mode === "offline-ai" && A.turn !== A.humanColor;
  setStatusDreitafeln("board-info", computer ? "Computer thinking…" : (prefix ? prefix + " " : "") + promptDreitafeln());
}

function pushUndoSnapshotDreitafeln() {
  AppStateDreitafeln.undoStack.push({ state: AppStateDreitafeln.state });
}

function initDreitafelnApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const levelInline = document.getElementById("dreitafeln-level-inline");
  const startGameBtn = document.getElementById("start-dreitafeln-game");
  const resignBtn = document.getElementById("resign-button");

  function setActiveModeButton(mode) {
    if (!modeOffline || !modeOfflineAi) return;
    modeOffline.classList.toggle("active-mode", mode === "offline");
    modeOfflineAi.classList.toggle("active-mode", mode === "offline-ai");
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_close");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function startNewGameDreitafeln(mode, humanColor, level) {
    AppStateDreitafeln.mode = mode;
    setStateDreitafeln(DreitafelnCore.createInitialState());
    AppStateDreitafeln.humanColor = humanColor;
    AppStateDreitafeln.aiLevel = level;
    AppStateDreitafeln.selected = null;
    AppStateDreitafeln.undoStack = [];
    setGameResultDreitafeln("");
    showBoardSectionDreitafeln();
    buildDreitafelnBoardDOM();
    updateDreitafelnBoard();
    updateGameLabelsDreitafeln();
    showPromptDreitafeln();
    maybeTriggerAiTurnDreitafeln();
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameDreitafeln("offline", "x", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateDreitafeln.aiLevel || 2);
    setStatusDreitafeln("board-info", "");
  });

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='dreitafeln-color']:checked");
    const choice = colorInput ? colorInput.value : "x";
    const drawn = choice === "random";
    const humanColor = drawn ? RandomStart.pick(["x", "o"]) : RandomStart.choose(choice === "o" ? "o" : "x", ["x", "o"]);
    setActiveModeButton("offline-ai");
    startNewGameDreitafeln("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    const text = "You play " + sideNameDreitafeln(humanColor) + ", computer level: " + (levelNames[level] || level) + ".";
    // Straight to the element: UiStatus.rewrite would turn this line into "Your turn.".
    I18n.setMsg(document.getElementById("offline-dreitafeln-status"),
      drawn ? text.replace(/^You play /, "Chance decided: you play ") : RandomStart.label(text));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateDreitafeln.gameOver) return;
      const loser = UiStatus.resigner(AppStateDreitafeln);
      const winner = DreitafelnCore.other(loser);
      AppStateDreitafeln.gameOver = true;
      AppStateDreitafeln.selected = null;
      announceGameResultDreitafeln(resultTitleDreitafeln(winner), sideNameDreitafeln(winner) + " wins by resignation.");
      recordDreitafelnStatsIfVsAi("loss");
      updateDreitafelnBoard();
      updateGameLabelsDreitafeln();
    });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(DREITAFELN_SAVE_KEY) : null;
  if (saved && isDreitafelnState(saved.state) && !saved.state.result) {
    AppStateDreitafeln.mode = saved.mode === "offline-ai" ? "offline-ai" : "offline";
    setStateDreitafeln(saved.state);
    AppStateDreitafeln.humanColor = saved.humanColor === "o" ? "o" : "x";
    AppStateDreitafeln.aiLevel = saved.aiLevel || 2;
    AppStateDreitafeln.selected = null;
    AppStateDreitafeln.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack : [];
    AppStateDreitafeln.undoStack = AppStateDreitafeln.undoStack.filter((u) => u && isDreitafelnState(u.state));
    setActiveModeButton(AppStateDreitafeln.mode);
    setGameResultDreitafeln("");
    showBoardSectionDreitafeln();
    buildDreitafelnBoardDOM();
    updateDreitafelnBoard();
    updateGameLabelsDreitafeln();
    showPromptDreitafeln();
    maybeTriggerAiTurnDreitafeln();
  }
  // Otherwise no game starts by itself: the placeholder shows until the
  // player picks a mode, like the other games here.
}

function humanCanActDreitafeln() {
  const A = AppStateDreitafeln;
  if (A.gameOver) return false;
  return !(A.mode === "offline-ai" && A.turn !== A.humanColor);
}

function refuseDreitafeln() {
  if (AppStateDreitafeln.gameOver) {
    setStatusDreitafeln("board-info", "Game is over. Start a new game to play again.");
    return true;
  }
  if (!humanCanActDreitafeln()) {
    setStatusDreitafeln("board-info", "Computer to move.");
    return true;
  }
  return false;
}

function onDreitafelnCardClick(e) {
  if (refuseDreitafeln()) return;
  const A = AppStateDreitafeln;
  const slot = parseInt(e.currentTarget.dataset.slot, 10);
  if (A.state.open[slot] === null) return;
  A.selected = A.selected === slot ? null : slot;
  updateDreitafelnBoard();
  showPromptDreitafeln();
}

function onDreitafelnCellClick(e) {
  if (refuseDreitafeln()) return;
  const A = AppStateDreitafeln;
  const st = A.state;
  const board = parseInt(e.currentTarget.dataset.board, 10);
  const n = parseInt(e.currentTarget.dataset.cell, 10) + 1;
  const first = st.open.indexOf(n);
  // The core lists one move per number (the first card that shows it); the
  // card actually tapped is the one that goes, when it shows the same number.
  if (first < 0 || !DreitafelnCore.isLegalMove(st, { slot: first, board: board })) return;
  const slot = A.selected !== null && st.open[A.selected] === n ? A.selected : first;
  applyDreitafelnMove({ slot: slot, board: board });
}

function applyDreitafelnMove(move) {
  const A = AppStateDreitafeln;
  pushUndoSnapshotDreitafeln();
  const next = DreitafelnCore.applyMove(A.state, move);
  setStateDreitafeln(next);
  A.selected = null;
  updateDreitafelnBoard();
  updateGameLabelsDreitafeln();

  const res = next.result;
  if (res && res.winner) {
    const w = DreitafelnCore.count(next, res.winner);
    const l = DreitafelnCore.count(next, DreitafelnCore.other(res.winner));
    const name = sideNameDreitafeln(res.winner);
    announceGameResultDreitafeln(resultTitleDreitafeln(res.winner),
      w >= 2 ? name + " wins two grids!" : name + " wins on grids, " + w + " to " + l + ".");
    recordDreitafelnStatsIfVsAi(res.winner === A.humanColor ? "win" : "loss");
    updateGameLabelsDreitafeln();
    return;
  }
  if (res) {
    announceGameResultDreitafeln("Draw", "Draw: " + DreitafelnCore.count(next, "x") + " grids each.");
    recordDreitafelnStatsIfVsAi("draw");
    updateGameLabelsDreitafeln();
    return;
  }
  showPromptDreitafeln();
  maybeTriggerAiTurnDreitafeln();
}

function maybeTriggerAiTurnDreitafeln() {
  const A = AppStateDreitafeln;
  if (A.gameOver) return;
  if (A.mode === "offline-ai" && A.turn !== A.humanColor) setTimeout(aiTurnDreitafeln, AiPacing.delay(400));
}

function aiTurnDreitafeln() {
  const A = AppStateDreitafeln;
  if (A.mode !== "offline-ai" || A.gameOver) return;
  const aiColor = DreitafelnCore.other(A.humanColor);
  if (A.turn !== aiColor) return;
  setStatusDreitafeln("board-info", "Computer thinking…");
  // The position this move is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = A.state;
  setTimeout(() => {
    if (A.gameOver || A.state !== scheduledFor || A.turn !== aiColor) return;
    const move = DreitafelnAi.chooseMove(A.state, A.aiLevel);
    if (move) applyDreitafelnMove(move);
  }, AiPacing.delay(300));
}

function undoLastMove() {
  const A = AppStateDreitafeln;
  if (!A.undoStack || !A.undoStack.length) return;
  let prev = A.undoStack.pop();
  if (A.mode === "offline-ai") {
    while (prev.state.turn !== A.humanColor && A.undoStack.length) prev = A.undoStack.pop();
  }
  // The card that came up after the move is known now: shuffle the hidden
  // stack again so it says nothing about the next card.
  setStateDreitafeln(DreitafelnCore.reshuffle(prev.state));
  A.selected = null;
  setGameResultDreitafeln("");
  updateDreitafelnBoard();
  updateGameLabelsDreitafeln();
  showPromptDreitafeln("Move undone.");
  maybeTriggerAiTurnDreitafeln();
}

function showBoardSectionDreitafeln() {
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

function buildDreitafelnBoardDOM() {
  const boardEl = document.getElementById("dreitafeln-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const grids = document.createElement("div");
  grids.className = "dt-grids";
  for (let b = 0; b < DreitafelnCore.BOARDS; b++) {
    const grid = document.createElement("div");
    grid.className = "dt-grid";
    grid.dataset.grid = b;
    const title = document.createElement("div");
    title.className = "dt-grid-title";
    grid.appendChild(title);
    const cells = document.createElement("div");
    cells.className = "dt-cells";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "dt-cell";
      cell.dataset.board = b;
      cell.dataset.cell = i;
      const num = document.createElement("span");
      num.className = "dt-num";
      num.textContent = String(i + 1);
      num.setAttribute("aria-hidden", "true");
      const mark = document.createElement("span");
      mark.className = "dt-mark";
      cell.appendChild(num);
      cell.appendChild(mark);
      cell.addEventListener("click", onDreitafelnCellClick);
      cells.appendChild(cell);
    }
    grid.appendChild(cells);
    grids.appendChild(grid);
  }
  boardEl.appendChild(grids);

  const hand = document.createElement("div");
  hand.className = "dt-hand";
  const label = document.createElement("div");
  label.className = "dt-cards-label";
  I18n.setMsg(label, "Open cards");
  hand.appendChild(label);
  const cards = document.createElement("div");
  cards.className = "dt-cards";
  for (let s = 0; s < DreitafelnCore.OPEN; s++) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "dt-card";
    card.dataset.slot = s;
    card.addEventListener("click", onDreitafelnCardClick);
    cards.appendChild(card);
  }
  hand.appendChild(cards);
  const stack = document.createElement("div");
  stack.className = "dt-stack";
  stack.id = "dt-stack";
  hand.appendChild(stack);
  boardEl.appendChild(hand);
}

function updateDreitafelnBoard() {
  const boardEl = document.getElementById("dreitafeln-board");
  if (!boardEl || !boardEl.querySelector(".dt-cell")) return;
  const A = AppStateDreitafeln;
  const st = A.state;
  const active = humanCanActDreitafeln();
  if (A.selected !== null && (!active || st.open[A.selected] === null)) A.selected = null;
  const chosen = A.selected !== null ? st.open[A.selected] : null;
  const last = st.last;

  boardEl.querySelectorAll(".dt-grid").forEach((grid) => {
    const b = parseInt(grid.dataset.grid, 10);
    const owner = st.won[b];
    grid.classList.toggle("dt-grid-won", !!owner);
    const title = grid.querySelector(".dt-grid-title");
    I18n.setMsg(title, owner ? "Grid " + (b + 1) + " - won by " + sideNameDreitafeln(owner) : "Grid " + (b + 1));
  });

  boardEl.querySelectorAll(".dt-cell").forEach((cell) => {
    const b = parseInt(cell.dataset.board, 10);
    const i = parseInt(cell.dataset.cell, 10);
    const v = st.boards[b][i];
    const mark = cell.querySelector(".dt-mark");
    const want = v || "";
    if (mark.dataset.side !== want) {
      mark.dataset.side = want;
      mark.innerHTML = v ? DT_MARK_SVG[v] : "";
    }
    const playable = active && v === null && st.open.indexOf(i + 1) !== -1;
    cell.disabled = !playable;
    cell.classList.toggle("dt-filled", !!v);
    cell.classList.toggle("dt-fit", playable && chosen === i + 1);
    cell.classList.toggle("dt-winline", !!st.lines[b] && st.lines[b].indexOf(i) !== -1);
    cell.classList.toggle("lm-to", !!last && last.board === b && last.cell === i);
    I18n.setAria(cell, "Grid " + (b + 1) + ", field " + (i + 1) + ": " + (v ? sideNameDreitafeln(v) : "free"));
  });

  boardEl.querySelectorAll(".dt-card").forEach((card) => {
    const s = parseInt(card.dataset.slot, 10);
    const n = st.open[s];
    card.textContent = n === null ? "" : String(n);
    if (n === null) card.removeAttribute("data-n");
    else card.dataset.n = n;
    card.classList.toggle("dt-card-empty", n === null);
    card.classList.toggle("dt-card-selected", A.selected === s);
    card.setAttribute("aria-pressed", A.selected === s ? "true" : "false");
    card.disabled = !active || n === null;
    I18n.setAria(card, n === null ? "No card" : "Card " + n + (A.selected === s ? ", chosen" : ""));
  });

  const stack = document.getElementById("dt-stack");
  if (stack) I18n.setMsg(stack, "Cards in the stack: " + st.deck.length);
}

function updateGameLabelsDreitafeln() {
  const A = AppStateDreitafeln;
  const st = A.state;
  const label = document.getElementById("game-label");
  if (label) I18n.setMsg(label, "Grids: X " + DreitafelnCore.count(st, "x") + " – O " + DreitafelnCore.count(st, "o"));
  const meta = document.getElementById("game-meta");
  if (meta) {
    const l = st.last;
    let text = "";
    if (l) {
      const won = st.won[l.board] === l.side && !!st.lines[l.board] && st.lines[l.board].indexOf(l.cell) !== -1;
      text = won ? sideNameDreitafeln(l.side) + " took " + l.card + " and wins grid " + (l.board + 1) + "."
        : "Last move: " + sideNameDreitafeln(l.side) + " took " + l.card + ", grid " + (l.board + 1) + ".";
    }
    I18n.setMsg(meta, text);
  }
  const undo = document.getElementById("undo-btn");
  if (undo) undo.disabled = !(A.undoStack || []).length;
  const resign = document.getElementById("resign-button");
  if (resign) resign.classList.toggle("hidden", A.gameOver);
  if (A.gameOver) clearSavedDreitafelnGame();
  else saveDreitafelnGame();
}

document.addEventListener("DOMContentLoaded", initDreitafelnApp);

// Hint button - marks the card and the field the hard computer would take.
document.addEventListener("DOMContentLoaded", () => {
  MoveHint.init({
    button: "dreitafeln-hint", board: "dreitafeln-board", app: AppStateDreitafeln,
    move: () => DreitafelnAi.chooseMove(AppStateDreitafeln.state, 3),
    marks: (m) => ['.dt-card[data-slot="' + m.slot + '"]',
      '.dt-cell[data-board="' + m.board + '"][data-cell="' + (AppStateDreitafeln.state.open[m.slot] - 1) + '"]']
  });
});
