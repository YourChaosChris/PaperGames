// hashi-app.js
// Wires HashiCore/HashiPuzzles to the hashi.html UI. Solitaire, like
// Sudoku/Kakuro/Nonogram - no opponent, just a difficulty picker and a
// fresh puzzle each time.
//
// The board isn't a plain filled grid - islands sit at scattered
// positions on a size x size grid, most cells empty - so it's rendered
// with the same percentage-based absolute-positioning technique used for
// Fanorona/Hex/Quoridor/Go (a JS-enforced square-ish aspect ratio, since
// CSS `aspect-ratio` is unreliable on E-Ink browsers), with every
// candidate bridge connection drawn as an SVG line UNDER the island
// buttons - but unlike Fanorona's fixed, purely decorative connection
// lines, here each line is itself the primary clickable game element: a
// click/tap on the line between two islands (or, equivalently, clicking
// one island then another) cycles that connection through empty ->
// single bridge -> double bridge -> empty again, rejecting the step
// outright (with a status message, never a crash) whenever it would
// cross another bridge already on the board.
//
// An island's number is shown in its circle at all times (it never
// changes); what changes is the circle's style once its current bridge
// count reaches or exceeds that number - the same "this clue is already
// satisfied" feedback idea Kakuro's conflict-highlighting expresses in
// reverse (see HashiCore.findSatisfiedIslands/findOverfilledIslands).

const AppStateHashi = {
  difficulty: "medium",
  size: 11,
  board: null,          // HashiCore board: { rows, cols, islands, islandAt, edges }
  bridgeCounts: null,   // array parallel to board.edges, each 0/1/2
  selectedIsland: null, // island id, or null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const HASHI_SAVE_KEY = "einkchess_save_hashi";

function saveHashiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(HASHI_SAVE_KEY, {
    difficulty: AppStateHashi.difficulty,
    size: AppStateHashi.size,
    islands: AppStateHashi.board ? AppStateHashi.board.islands : null,
    bridgeCounts: AppStateHashi.bridgeCounts,
    moveCount: AppStateHashi.moveCount
  });
}

function clearSavedHashiGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(HASHI_SAVE_KEY);
}

function recordHashiStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("hashi", "win");
}

function setStatusHashi(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultHashi(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultHashi(message) {
  setGameResultHashi(message);
  setStatusHashi("board-info", message);
  if (window.ResultModal) {
    const title = (window.I18n && I18n.t("hashi_win_title")) || "Solved!";
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackHashi() {
  AppStateHashi.undoStack = [];
}

function pushUndoSnapshotHashi() {
  AppStateHashi.undoStack.push({
    bridgeCounts: AppStateHashi.bridgeCounts.slice(),
    moveCount: AppStateHashi.moveCount
  });
}

function hintTextHashi() {
  return (window.I18n && I18n.t("hashi_hint")) || "Tap a line (or two islands) to add a bridge.";
}

function initHashiApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("hashi-level-inline");
  const startGameBtn = document.getElementById("start-hashi-game");

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

  function startNewGameHashi(difficulty) {
    setStatusHashi("offline-hashi-status", (window.I18n && I18n.t("hashi_generating")) || "Generating puzzle…");
    setStatusHashi("board-info", (window.I18n && I18n.t("hashi_generating")) || "Generating puzzle…");
    // Generation involves a real uniqueness-verifying search and can take
    // up to roughly a second on "hard" - yielding a tick first keeps the
    // "Generating…" status visible instead of the click feeling stuck.
    setTimeout(() => {
      const puzzle = HashiPuzzles.generatePuzzle(difficulty);
      AppStateHashi.difficulty = difficulty;
      AppStateHashi.size = puzzle.size;
      AppStateHashi.board = HashiCore.buildBoard(puzzle.size, puzzle.size, puzzle.islands);
      AppStateHashi.bridgeCounts = HashiCore.createEmptyBridgeCounts(AppStateHashi.board);
      AppStateHashi.selectedIsland = null;
      AppStateHashi.gameOver = false;
      AppStateHashi.moveCount = 0;
      resetUndoStackHashi();
      setGameResultHashi("");
      showBoardSectionHashi();
      buildHashiBoardDOM();
      updateHashiBoard();
      updateGameLabelsHashi();
      setStatusHashi("offline-hashi-status", "");
      setStatusHashi("board-info", hintTextHashi());
    }, 10);
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "medium";
    startNewGameHashi(difficulty);
  });

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(HASHI_SAVE_KEY) : null;
  if (savedGame && savedGame.islands) {
    AppStateHashi.difficulty = savedGame.difficulty;
    AppStateHashi.size = savedGame.size;
    AppStateHashi.board = HashiCore.buildBoard(savedGame.size, savedGame.size, savedGame.islands);
    AppStateHashi.bridgeCounts = savedGame.bridgeCounts;
    AppStateHashi.moveCount = savedGame.moveCount;
    AppStateHashi.selectedIsland = null;
    AppStateHashi.gameOver = false;
    resetUndoStackHashi();
    if (levelInline) levelInline.value = AppStateHashi.difficulty;
    setGameResultHashi("");
    showBoardSectionHashi();
    buildHashiBoardDOM();
    updateHashiBoard();
    updateGameLabelsHashi();
    setStatusHashi("board-info", hintTextHashi());
  }
  // Otherwise no puzzle is pre-generated: the placeholder shows until the
  // player picks a difficulty and presses New puzzle.
}

/*** Move handling ***/

function applyHashiEdgeAttempt(edgeId) {
  if (AppStateHashi.gameOver || edgeId === -1 || edgeId === undefined) {
    if (edgeId === -1) {
      setStatusHashi("board-info", (window.I18n && I18n.t("hashi_msg_no_line")) || "No clear line between those islands.");
    }
    return;
  }
  pushUndoSnapshotHashi();
  const result = HashiCore.cycleBridge(AppStateHashi.board, AppStateHashi.bridgeCounts, edgeId);
  if (result === null) {
    AppStateHashi.undoStack.pop(); // nothing actually changed - drop the snapshot
    setStatusHashi("board-info", (window.I18n && I18n.t("hashi_msg_blocked")) || "That would cross another bridge.");
    return;
  }
  AppStateHashi.moveCount++;
  updateHashiBoard();
  updateGameLabelsHashi();

  if (HashiCore.isComplete(AppStateHashi.board, AppStateHashi.bridgeCounts)) {
    AppStateHashi.gameOver = true;
    const message = (window.I18n && I18n.t("hashi_win_message")) || "All islands connected! Well done.";
    announceGameResultHashi(message);
    recordHashiStats();
    updateGameLabelsHashi();
  } else {
    setStatusHashi("board-info", hintTextHashi());
  }
}

function onHashiEdgeClick(edgeId) {
  if (AppStateHashi.gameOver) return;
  AppStateHashi.selectedIsland = null;
  applyHashiEdgeAttempt(edgeId);
  updateHashiBoard();
}

function onHashiIslandClick(islandId) {
  if (AppStateHashi.gameOver) return;
  if (AppStateHashi.selectedIsland === null) {
    AppStateHashi.selectedIsland = islandId;
    updateHashiBoard();
    return;
  }
  if (AppStateHashi.selectedIsland === islandId) {
    AppStateHashi.selectedIsland = null;
    updateHashiBoard();
    return;
  }
  const edgeId = HashiCore.findEdgeBetween(AppStateHashi.board, AppStateHashi.selectedIsland, islandId);
  AppStateHashi.selectedIsland = null;
  applyHashiEdgeAttempt(edgeId);
  updateHashiBoard();
}

function undoLastMove() {
  if (!AppStateHashi.undoStack || !AppStateHashi.undoStack.length) return;
  const prev = AppStateHashi.undoStack.pop();
  AppStateHashi.bridgeCounts = prev.bridgeCounts;
  AppStateHashi.moveCount = prev.moveCount;
  AppStateHashi.selectedIsland = null;
  setGameResultHashi("");
  updateHashiBoard();
  updateGameLabelsHashi();
  setStatusHashi("board-info", (window.I18n && I18n.t("hashi_undone")) || "Move undone.");
}

function showBoardSectionHashi() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering: absolutely-positioned island buttons over a single
     SVG line layer, the same overall technique as fanorona-app.js's
     point-and-line board, sized by the puzzle's own row/col count
     instead of a fixed shape. ***/

const HASHI_UNIT = 100;
const HASHI_PAD = 60;
const HASHI_ISLAND_SIZE = 64;
const HASHI_DOUBLE_OFFSET = 9;
const SVG_NS_HASHI = "http://www.w3.org/2000/svg";

function hashiTotalW() { return (AppStateHashi.size - 1) * HASHI_UNIT + HASHI_PAD * 2; }
function hashiTotalH() { return (AppStateHashi.size - 1) * HASHI_UNIT + HASHI_PAD * 2; }
function hashiX(c) { return HASHI_PAD + c * HASHI_UNIT; }
function hashiY(r) { return HASHI_PAD + r * HASHI_UNIT; }
function hashiPct(value, total) { return (value / total * 100) + "%"; }

function buildHashiBoardDOM() {
  const boardEl = document.getElementById("hashi-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";
  const board = AppStateHashi.board;
  const totalW = hashiTotalW(), totalH = hashiTotalH();

  const svg = document.createElementNS(SVG_NS_HASHI, "svg");
  svg.setAttribute("class", "hashi-lines");
  svg.setAttribute("viewBox", "0 0 " + totalW + " " + totalH);
  svg.setAttribute("preserveAspectRatio", "none");

  board.edges.forEach((edge, edgeId) => {
    const x1 = hashiX(edge.c1), y1 = hashiY(edge.r1);
    const x2 = hashiX(edge.c2), y2 = hashiY(edge.r2);

    const hit = document.createElementNS(SVG_NS_HASHI, "line");
    hit.setAttribute("class", "hashi-edge-hit");
    hit.setAttribute("x1", x1); hit.setAttribute("y1", y1);
    hit.setAttribute("x2", x2); hit.setAttribute("y2", y2);
    hit.setAttribute("role", "button");
    hit.setAttribute("tabindex", "-1");
    hit.addEventListener("click", () => onHashiEdgeClick(edgeId));
    svg.appendChild(hit);

    const isH = edge.dir === "h";
    const dx = isH ? 0 : HASHI_DOUBLE_OFFSET;
    const dy = isH ? HASHI_DOUBLE_OFFSET : 0;

    const line1 = document.createElementNS(SVG_NS_HASHI, "line");
    line1.setAttribute("class", "hashi-edge-line hashi-edge-line-1");
    line1.setAttribute("x1", x1 - dx); line1.setAttribute("y1", y1 - dy);
    line1.setAttribute("x2", x2 - dx); line1.setAttribute("y2", y2 - dy);
    line1.style.display = "none";
    svg.appendChild(line1);

    const line2 = document.createElementNS(SVG_NS_HASHI, "line");
    line2.setAttribute("class", "hashi-edge-line hashi-edge-line-2");
    line2.setAttribute("x1", x1 + dx); line2.setAttribute("y1", y1 + dy);
    line2.setAttribute("x2", x2 + dx); line2.setAttribute("y2", y2 + dy);
    line2.style.display = "none";
    svg.appendChild(line2);

    edge.domLine1 = line1;
    edge.domLine2 = line2;
  });
  boardEl.appendChild(svg);

  board.islands.forEach((isl, id) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hashi-island";
    btn.style.left = hashiPct(hashiX(isl.col) - HASHI_ISLAND_SIZE / 2, totalW);
    btn.style.top = hashiPct(hashiY(isl.row) - HASHI_ISLAND_SIZE / 2, totalH);
    btn.style.width = hashiPct(HASHI_ISLAND_SIZE, totalW);
    btn.style.height = hashiPct(HASHI_ISLAND_SIZE, totalH);
    btn.dataset.island = id;
    const label = document.createElement("span");
    label.className = "hashi-island-value";
    label.textContent = String(isl.need);
    btn.appendChild(label);
    btn.addEventListener("click", () => onHashiIslandClick(id));
    boardEl.appendChild(btn);
  });

  ensureHashiBoardAspect();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureHashiBoardAspect);
  } else {
    setTimeout(ensureHashiBoardAspect, 0);
  }
  ensureHashiResizeHandler();
}

let einkHashiResizeHandlerAttached = false;
let einkHashiResizeTimeoutId = null;

function ensureHashiBoardAspect() {
  const boardEl = document.getElementById("hashi-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const aspect = hashiTotalH() / hashiTotalW();
  boardEl.style.height = (rect.width * aspect) + "px";
}

function ensureHashiResizeHandler() {
  if (einkHashiResizeHandlerAttached) return;
  einkHashiResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkHashiResizeTimeoutId !== null) clearTimeout(einkHashiResizeTimeoutId);
    einkHashiResizeTimeoutId = setTimeout(() => {
      einkHashiResizeTimeoutId = null;
      ensureHashiBoardAspect();
    }, 150);
  });
}

function updateHashiBoard() {
  const boardEl = document.getElementById("hashi-board");
  if (!boardEl) return;
  const board = AppStateHashi.board;
  const bridgeCounts = AppStateHashi.bridgeCounts;
  const counts = HashiCore.computeIslandCounts(board, bridgeCounts);
  const satisfied = HashiCore.findSatisfiedIslands(board, bridgeCounts);
  const overfilled = HashiCore.findOverfilledIslands(board, bridgeCounts);
  const selected = AppStateHashi.selectedIsland;

  boardEl.querySelectorAll(".hashi-island").forEach((btn) => {
    const id = parseInt(btn.dataset.island, 10);
    const isl = board.islands[id];
    btn.classList.toggle("hashi-island-selected", id === selected);
    btn.classList.toggle("hashi-island-satisfied", satisfied.has(id) && !overfilled.has(id));
    btn.classList.toggle("hashi-island-over", overfilled.has(id));
    const label = "Island " + (isl.row + 1) + "," + (isl.col + 1) + ": needs " + isl.need +
      ", currently " + counts[id] + (overfilled.has(id) ? ", too many" : satisfied.has(id) ? ", satisfied" : "");
    btn.setAttribute("aria-label", label);
  });

  board.edges.forEach((edge, edgeId) => {
    const count = bridgeCounts[edgeId] || 0;
    if (edge.domLine1) edge.domLine1.style.display = count >= 1 ? "" : "none";
    if (edge.domLine2) edge.domLine2.style.display = count >= 2 ? "" : "none";
  });
}

function updateGameLabelsHashi() {
  const meta = document.getElementById("game-meta");
  if (meta) {
    if (AppStateHashi.board) {
      const satisfied = HashiCore.findSatisfiedIslands(AppStateHashi.board, AppStateHashi.bridgeCounts);
      const overfilled = HashiCore.findOverfilledIslands(AppStateHashi.board, AppStateHashi.bridgeCounts);
      let ok = 0;
      satisfied.forEach((id) => { if (!overfilled.has(id)) ok++; });
      meta.textContent = ok + " / " + AppStateHashi.board.islands.length + " satisfied";
    } else {
      meta.textContent = "";
    }
  }
  updateUndoButtonVisibilityHashi();

  if (AppStateHashi.gameOver) clearSavedHashiGame();
  else saveHashiGame();
}

function updateUndoButtonVisibilityHashi() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateHashi.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateHashi.gameOver));
}

document.addEventListener("DOMContentLoaded", initHashiApp);
