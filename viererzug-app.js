// viererzug-app.js
// Wires ViererzugCore/ViererzugAi to viererzug.html (Four Moves). 5 x 5 grid
// of uniform squares like fourinarow-app.js. While placing, tap a free field.
// While moving, tap one of your stones, then a free neighbouring field.

const AppStateViererzug = {
  mode: "offline",        // "offline" | "offline-ai"
  state: ViererzugCore.createInitialState(),
  turn: "b",              // mirrors state.turn - Black always moves first
  humanColor: "b",
  aiLevel: 2,
  gameOver: false,
  moveCount: 0,
  lastMove: null,         // { from, to } of the latest move, for the board marker
  selected: null,         // [r, c] of the stone picked up while moving
  undoStack: []
};

const VIERERZUG_SAVE_KEY = "einkchess_save_viererzug";

function setStateViererzug(state) {
  AppStateViererzug.state = state;
  AppStateViererzug.turn = state.turn;
  AppStateViererzug.gameOver = !!state.result;
}

function saveViererzugGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(VIERERZUG_SAVE_KEY, {
    mode: AppStateViererzug.mode,
    state: AppStateViererzug.state,
    humanColor: AppStateViererzug.humanColor,
    aiLevel: AppStateViererzug.aiLevel,
    moveCount: AppStateViererzug.moveCount,
    lastMove: AppStateViererzug.lastMove,
    undoStack: AppStateViererzug.undoStack.slice(-60)
  });
}

function clearSavedViererzugGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(VIERERZUG_SAVE_KEY);
}

function isViererzugState(s) {
  return !!s && Array.isArray(s.board) && s.board.length === ViererzugCore.SIZE &&
    s.board.every((row) => Array.isArray(row) && row.length === ViererzugCore.SIZE) &&
    (s.turn === "b" || s.turn === "w") && !!s.placed && typeof s.seen === "object";
}

function recordViererzugStatsIfVsAi(outcome) {
  if (typeof GameStats === "undefined") return;
  if (AppStateViererzug.mode !== "offline-ai") return;
  GameStats.record("viererzug", outcome);
}

function colorNameViererzug(color) {
  return color === "b" ? "Black" : "White";
}

function setStatusViererzug(elementId, text) {
  if (AppStateViererzug.mode === "offline-ai" && text && /status|info/i.test(String(elementId))) {
    text = UiStatus.rewrite(text, AppStateViererzug);
  }
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultViererzug(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) window.ResultModal.hide();
}

function resultTitleViererzug(winner) {
  if (AppStateViererzug.mode === "offline-ai") {
    return winner === AppStateViererzug.humanColor ? "You win!" : "You lose";
  }
  return colorNameViererzug(winner) + " wins";
}

function announceGameResultViererzug(resultCode, message) {
  setGameResultViererzug(message);
  setStatusViererzug("board-info", message);
  if (window.ResultModal) window.ResultModal.show(resultCode, message);
}

// The sentence that says what the side to move does next.
function promptViererzug() {
  const st = AppStateViererzug.state;
  const name = colorNameViererzug(st.turn);
  if (ViererzugCore.phase(st) === "place") return name + ": place a stone (" + (st.placed[st.turn] + 1) + " of " + ViererzugCore.STONES + ").";
  if (AppStateViererzug.selected) return "Choose where to move it.";
  return name + ": move a stone.";
}

function showPromptViererzug(prefix) {
  const mine = AppStateViererzug.mode === "offline-ai" && AppStateViererzug.turn !== AppStateViererzug.humanColor;
  setStatusViererzug("board-info", mine ? "Computer thinking…" : (prefix ? prefix + " " : "") + promptViererzug());
}

function pushUndoSnapshotViererzug() {
  AppStateViererzug.undoStack.push({
    state: AppStateViererzug.state,
    moveCount: AppStateViererzug.moveCount,
    lastMove: AppStateViererzug.lastMove
  });
}

function initViererzugApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const modeOffline = document.getElementById("mode-offline");
  const modeOfflineAi = document.getElementById("mode-offline-ai");
  const offlineAiControls = document.getElementById("offline-ai-controls");
  const levelInline = document.getElementById("viererzug-level-inline");
  const startGameBtn = document.getElementById("start-viererzug-game");
  const resignBtn = document.getElementById("resign-button");

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

  function startNewGameViererzug(mode, humanColor, level) {
    AppStateViererzug.mode = mode;
    setStateViererzug(ViererzugCore.createInitialState());
    AppStateViererzug.humanColor = humanColor;
    AppStateViererzug.aiLevel = level;
    AppStateViererzug.moveCount = 0;
    AppStateViererzug.lastMove = null;
    AppStateViererzug.selected = null;
    AppStateViererzug.undoStack = [];
    setGameResultViererzug("");
    showBoardSectionViererzug();
    buildViererzugBoardDOM();
    updateViererzugBoard();
    updateGameLabelsViererzug();
    showPromptViererzug();
    maybeTriggerAiTurnViererzug();
  }

  modeOffline.addEventListener("click", () => {
    setActiveModeButton("offline");
    offlineAiControls.classList.add("hidden");
    startNewGameViererzug("offline", "b", 0);
  });

  modeOfflineAi.addEventListener("click", () => {
    setActiveModeButton("offline-ai");
    offlineAiControls.classList.remove("hidden");
    if (levelInline) levelInline.value = String(AppStateViererzug.aiLevel || 2);
    setStatusViererzug("board-info", "");
  });

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? parseInt(levelInline.value, 10) : 2;
    const colorInput = document.querySelector("input[name='viererzug-color']:checked");
    const humanColor = RandomStart.choose(colorInput && colorInput.value === "white" ? "w" : "b", ["w", "b"]);
    setActiveModeButton("offline-ai");
    startNewGameViererzug("offline-ai", humanColor, level);
    const levelNames = { 1: "Easy", 2: "Medium", 3: "Hard" };
    setStatusViererzug("offline-viererzug-status",
      RandomStart.label("You play " + colorNameViererzug(humanColor) + ", computer level: " + (levelNames[level] || level) + "."));
  });

  if (resignBtn) {
    resignBtn.addEventListener("click", () => {
      if (AppStateViererzug.gameOver) return;
      const loser = UiStatus.resigner(AppStateViererzug);
      const winner = ViererzugCore.otherColor(loser);
      AppStateViererzug.gameOver = true;
      AppStateViererzug.selected = null;
      announceGameResultViererzug(resultTitleViererzug(winner), colorNameViererzug(winner) + " wins by resignation.");
      recordViererzugStatsIfVsAi("loss");
      updateViererzugBoard();
      updateGameLabelsViererzug();
    });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(VIERERZUG_SAVE_KEY) : null;
  if (saved && isViererzugState(saved.state) && !saved.state.result) {
    AppStateViererzug.mode = saved.mode === "offline-ai" ? "offline-ai" : "offline";
    setStateViererzug(saved.state);
    AppStateViererzug.humanColor = saved.humanColor === "w" ? "w" : "b";
    AppStateViererzug.aiLevel = saved.aiLevel || 2;
    AppStateViererzug.moveCount = saved.moveCount || 0;
    AppStateViererzug.lastMove = saved.lastMove || null;
    AppStateViererzug.selected = null;
    AppStateViererzug.undoStack = Array.isArray(saved.undoStack) ? saved.undoStack.filter((u) => u && isViererzugState(u.state)) : [];
    setActiveModeButton(AppStateViererzug.mode);
    setGameResultViererzug("");
    showBoardSectionViererzug();
    buildViererzugBoardDOM();
    updateViererzugBoard();
    updateGameLabelsViererzug();
    showPromptViererzug();
    maybeTriggerAiTurnViererzug();
  }
  // Otherwise no game starts by itself: the placeholder shows until the
  // player picks a mode, like the other games here.
}

function humanCanActViererzug() {
  const A = AppStateViererzug;
  if (A.gameOver) return false;
  return !(A.mode === "offline-ai" && A.turn !== A.humanColor);
}

function onViererzugSquareClick(e) {
  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const A = AppStateViererzug;
  if (A.gameOver) {
    setStatusViererzug("board-info", "Game is over. Start a new game to play again.");
    return;
  }
  if (!humanCanActViererzug()) {
    setStatusViererzug("board-info", "Computer to move.");
    return;
  }
  const st = A.state;
  if (ViererzugCore.phase(st) === "place") {
    if (!st.board[r][c]) applyViererzugMove({ from: null, to: [r, c] });
    return;
  }
  const own = st.board[r][c] === st.turn;
  const legal = ViererzugCore.getLegalMoves(st);
  if (own) {
    const same = A.selected && A.selected[0] === r && A.selected[1] === c;
    A.selected = same || !legal.some((m) => m.from[0] === r && m.from[1] === c) ? null : [r, c];
    updateViererzugBoard();
    showPromptViererzug();
    return;
  }
  if (A.selected && legal.some((m) => m.from[0] === A.selected[0] && m.from[1] === A.selected[1] && m.to[0] === r && m.to[1] === c)) {
    applyViererzugMove({ from: A.selected, to: [r, c] });
  }
}

function applyViererzugMove(move) {
  const A = AppStateViererzug;
  pushUndoSnapshotViererzug();
  const mover = A.state.turn;
  const next = ViererzugCore.applyMove(A.state, move);
  setStateViererzug(next);
  A.selected = null;
  A.lastMove = { from: move.from, to: move.to };
  A.moveCount++;
  updateViererzugBoard();
  updateGameLabelsViererzug();

  const res = next.result;
  if (res && res.winner) {
    announceGameResultViererzug(resultTitleViererzug(res.winner),
      colorNameViererzug(res.winner) + (res.kind === "square" ? " wins - a square of four!" : " wins - four in a row!"));
    recordViererzugStatsIfVsAi(res.winner === A.humanColor ? "win" : "loss");
    updateGameLabelsViererzug();
    return;
  }
  if (res) {
    announceGameResultViererzug("Draw", res.draw === "repetition" ? "Draw by repetition." : "Draw (stalemate).");
    recordViererzugStatsIfVsAi("draw");
    updateGameLabelsViererzug();
    return;
  }
  showPromptViererzug(next.passed ? colorNameViererzug(next.passed) + " cannot move and passes." : "");
  maybeTriggerAiTurnViererzug();
}

function maybeTriggerAiTurnViererzug() {
  const A = AppStateViererzug;
  if (A.gameOver) return;
  if (A.mode === "offline-ai" && A.turn !== A.humanColor) setTimeout(aiTurnViererzug, AiPacing.delay(400));
}

function aiTurnViererzug() {
  const A = AppStateViererzug;
  if (A.mode !== "offline-ai" || A.gameOver) return;
  const aiColor = ViererzugCore.otherColor(A.humanColor);
  if (A.turn !== aiColor) return;
  setStatusViererzug("board-info", "Computer thinking…");
  // The position this search is for: if it has changed by the time the
  // pause is over (undo, new game), the computer must not move.
  const scheduledFor = A.state;
  setTimeout(() => {
    if (A.gameOver || A.state !== scheduledFor || A.turn !== aiColor) return;
    const move = ViererzugAi.chooseMove(A.state, A.aiLevel);
    if (move) applyViererzugMove(move);
  }, AiPacing.delay(300));
}

function undoLastMove() {
  const A = AppStateViererzug;
  if (!A.undoStack || !A.undoStack.length) return;
  let prev = A.undoStack.pop();
  if (A.mode === "offline-ai") {
    while (prev.state.turn !== A.humanColor && A.undoStack.length) prev = A.undoStack.pop();
  }
  setStateViererzug(prev.state);
  A.moveCount = prev.moveCount;
  A.lastMove = prev.lastMove || null;
  A.selected = null;
  setGameResultViererzug("");
  updateViererzugBoard();
  updateGameLabelsViererzug();
  showPromptViererzug("Move undone.");
  maybeTriggerAiTurnViererzug();
}

function showBoardSectionViererzug() {
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

function buildViererzugBoardDOM() {
  const boardEl = document.getElementById("viererzug-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  for (let r = 0; r < ViererzugCore.SIZE; r++) {
    for (let c = 0; c < ViererzugCore.SIZE; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square vz-square";
      square.dataset.row = r;
      square.dataset.col = c;
      const piece = document.createElement("span");
      piece.className = "vz-piece";
      square.appendChild(piece);
      square.addEventListener("click", onViererzugSquareClick);
      boardEl.appendChild(square);
    }
  }
  ensureViererzugSquareAspectRatio();
  if (window.requestAnimationFrame) window.requestAnimationFrame(ensureViererzugSquareAspectRatio);
  else setTimeout(ensureViererzugSquareAspectRatio, 0);
  ensureViererzugResizeHandler();
}

let einkViererzugResizeHandlerAttached = false;
let einkViererzugResizeTimeoutId = null;

function ensureViererzugSquareAspectRatio() {
  const boardEl = document.getElementById("viererzug-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const size = rect.width / ViererzugCore.SIZE;
  boardEl.querySelectorAll(".vz-square").forEach((sq) => { sq.style.height = size + "px"; });
}

function ensureViererzugResizeHandler() {
  if (einkViererzugResizeHandlerAttached) return;
  einkViererzugResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkViererzugResizeTimeoutId !== null) clearTimeout(einkViererzugResizeTimeoutId);
    einkViererzugResizeTimeoutId = setTimeout(() => {
      einkViererzugResizeTimeoutId = null;
      ensureViererzugSquareAspectRatio();
    }, 150);
  });
}

function updateViererzugBoard() {
  const boardEl = document.getElementById("viererzug-board");
  if (!boardEl) return;
  const A = AppStateViererzug;
  const st = A.state;
  const active = humanCanActViererzug();
  const placing = ViererzugCore.phase(st) === "place";
  const legal = active ? ViererzugCore.getLegalMoves(st) : [];
  const movable = new Set(legal.filter((m) => m.from).map((m) => m.from[0] + "," + m.from[1]));
  const targets = new Set(legal.filter((m) => m.from && A.selected && m.from[0] === A.selected[0] && m.from[1] === A.selected[1]).map((m) => m.to[0] + "," + m.to[1]));
  const win = st.result && st.result.winner ? new Set(st.result.cells.map((p) => p[0] + "," + p[1])) : null;
  const last = A.lastMove;

  boardEl.querySelectorAll(".vz-square").forEach((sq) => {
    const r = parseInt(sq.dataset.row, 10);
    const c = parseInt(sq.dataset.col, 10);
    const key = r + "," + c;
    const piece = st.board[r][c];
    const pieceEl = sq.querySelector(".vz-piece");
    if (pieceEl) {
      pieceEl.classList.remove("vz-piece-black", "vz-piece-white");
      if (piece) pieceEl.classList.add(piece === "b" ? "vz-piece-black" : "vz-piece-white");
    }
    const selected = !!A.selected && A.selected[0] === r && A.selected[1] === c;
    const isTarget = targets.has(key);
    const canPlace = active && placing && !piece;
    const canPick = active && !placing && movable.has(key);
    sq.classList.toggle("vz-selected", selected);
    sq.classList.toggle("vz-target", isTarget);
    sq.classList.toggle("vz-win", !!win && win.has(key));
    sq.classList.toggle("lm-to", !!last && last.to[0] === r && last.to[1] === c);
    sq.disabled = !(canPlace || canPick || isTarget);

    let label = "Row " + (r + 1) + ", column " + (c + 1);
    label += piece ? ", " + (piece === "b" ? "Black" : "White") + " stone" : ", empty";
    if (selected) label += ", selected";
    else if (canPick) label += ", can move";
    I18n.setAria(sq, label);
  });
  if (typeof BoardSummary !== "undefined") {
    const on = { b: 0, w: 0 };
    st.board.forEach((row) => row.forEach((p) => { if (p) on[p]++; }));
    BoardSummary.set(boardEl, (tr) => tr("a11y_t_discs", { w: on.w, b: on.b, white: tr("a11y_white"), black: tr("a11y_black") }));
  }
}

function updateGameLabelsViererzug() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateViererzug.moveCount ? "Move " + AppStateViererzug.moveCount : "");
  const undo = document.getElementById("undo-btn");
  if (undo) undo.disabled = !(AppStateViererzug.undoStack || []).length;
  const resign = document.getElementById("resign-button");
  if (resign) resign.classList.toggle("hidden", AppStateViererzug.gameOver);
  if (AppStateViererzug.gameOver) clearSavedViererzugGame();
  else saveViererzugGame();
}

document.addEventListener("DOMContentLoaded", initViererzugApp);

// Hint button - marks the move the hard computer would make: the stone and
// its target while moving, only the field while placing.
document.addEventListener("DOMContentLoaded", () => {
  const cell = (p) => `[data-row="${p[0]}"][data-col="${p[1]}"]`;
  MoveHint.init({
    button: "viererzug-hint", board: "viererzug-board", app: AppStateViererzug,
    move: () => ViererzugAi.chooseMove(AppStateViererzug.state, 3),
    marks: (m) => (m.from ? [cell(m.from), cell(m.to)] : [cell(m.to)])
  });
});
