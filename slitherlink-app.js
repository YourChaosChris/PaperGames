// slitherlink-app.js
// Wires SlitherlinkCore/SlitherlinkPuzzles to the slitherlink.html UI.
// Solitaire, like Sudoku/Kakuro/Nonogram - no opponent, just a difficulty
// picker and a fresh puzzle each time.
//
// The board is drawn in two layers, the same split fanorona-app.js uses
// for its fixed board lines - just with the roles reversed. There, the
// SVG lines are purely decorative and the clickable points sit on top as
// real buttons; here the dots and the numbers are the decorative SVG
// layer (drawn once, aria-hidden, and re-styled in place as the game
// state changes), while every potential edge between two dots is a real
// absolutely-positioned <button>, invisible until it's "on", sized
// generously so it's still easy to tap precisely between two dots on a
// touchscreen e-reader. That keeps every edge a genuine focusable
// button, so BoardA11y's arrow-key navigation and screen readers both
// work exactly the way they do on every other board in this app.
//
// Like Kakuro's board, the SVG's aspect ratio is JS-enforced with an
// explicit pixel height recomputed on resize rather than relying on CSS
// `aspect-ratio`, which is unreliable on E-Ink browsers.

const AppStateSlitherlink = {
  difficulty: "easy",
  isDaily: false,  // true when the current puzzle is today's Daily Challenge
  rows: 5,
  cols: 5,
  clues: null,     // 2D clue (0-3) | null
  solution: null,  // {H, V} - kept for save/restore parity, not needed to validate moves
  edges: null,     // {H, V} player's current edge states (0 empty / 1 on / 2 marked)
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const SLITHERLINK_SAVE_KEY = "einkchess_save_slitherlink";

function saveSlitherlinkGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SLITHERLINK_SAVE_KEY, {
    difficulty: AppStateSlitherlink.difficulty,
    rows: AppStateSlitherlink.rows,
    cols: AppStateSlitherlink.cols,
    clues: AppStateSlitherlink.clues,
    solution: AppStateSlitherlink.solution,
    edges: AppStateSlitherlink.edges,
    moveCount: AppStateSlitherlink.moveCount
  });
}

function clearSavedSlitherlinkGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SLITHERLINK_SAVE_KEY);
}

function recordSlitherlinkStats() {
  if (typeof GameStats === "undefined") return;
  GameStats.record("slitherlink", "win");
}

function setStatusSlitherlink(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSlitherlink(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultSlitherlink(message) {
  setGameResultSlitherlink(message);
  setStatusSlitherlink("board-info", message);
  if (window.ResultModal) {
    const title = (window.I18n && I18n.t("slitherlink_win_title")) || "Solved!";
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackSlitherlink() {
  AppStateSlitherlink.undoStack = [];
}

function pushUndoSnapshotSlitherlink() {
  AppStateSlitherlink.undoStack.push({
    edges: SlitherlinkCore.cloneEdges(AppStateSlitherlink.edges),
    moveCount: AppStateSlitherlink.moveCount
  });
}

function hintTextSlitherlink() {
  return (window.I18n && I18n.t("slitherlink_hint")) || "Tap an edge to draw the loop.";
}

function initSlitherlinkApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("slitherlink-level-inline");
  const startGameBtn = document.getElementById("start-slitherlink-game");
  const clearBtn = document.getElementById("slitherlink-clear-button");

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

  function startNewGameSlitherlink(difficulty, rng, isDaily) {
    setStatusSlitherlink("offline-slitherlink-status", (window.I18n && I18n.t("slitherlink_generating")) || "Generating puzzle…");
    setStatusSlitherlink("board-info", (window.I18n && I18n.t("slitherlink_generating")) || "Generating puzzle…");
    // Generation can take up to a couple of seconds on "hard" (a real
    // uniqueness-verifying solve runs after every clue removed - see
    // slitherlink-puzzles.js) - yielding a tick first keeps the
    // "Generating…" status visible instead of the tap feeling stuck.
    setTimeout(() => {
      const puzzle = SlitherlinkPuzzles.generatePuzzle(difficulty, rng);
      AppStateSlitherlink.difficulty = difficulty;
      AppStateSlitherlink.isDaily = !!isDaily;
      AppStateSlitherlink.rows = puzzle.rows;
      AppStateSlitherlink.cols = puzzle.cols;
      AppStateSlitherlink.clues = puzzle.clues;
      AppStateSlitherlink.solution = puzzle.solution;
      AppStateSlitherlink.edges = SlitherlinkCore.createEmptyEdges(puzzle.rows, puzzle.cols);
      AppStateSlitherlink.gameOver = false;
      AppStateSlitherlink.moveCount = 0;
      resetUndoStackSlitherlink();
      setGameResultSlitherlink("");
      showBoardSectionSlitherlink();
      buildSlitherlinkBoardDOM();
      updateSlitherlinkBoard();
      updateGameLabelsSlitherlink();
      setStatusSlitherlink("offline-slitherlink-status", "");
      setStatusSlitherlink("board-info", isDaily
        ? "Daily Challenge (" + DailyChallenge.todayKey() + "). " + hintTextSlitherlink()
        : hintTextSlitherlink());
    }, 10);
  }

  startGameBtn.addEventListener("click", () => {
    const difficulty = levelInline ? levelInline.value : "easy";
    startNewGameSlitherlink(difficulty);
  });

  const dailyBtn = document.getElementById("daily-slitherlink-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      startNewGameSlitherlink("easy", DailyChallenge.makeTodaysRng("slitherlink"), true);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!AppStateSlitherlink.edges || AppStateSlitherlink.gameOver) return;
      pushUndoSnapshotSlitherlink();
      AppStateSlitherlink.edges = SlitherlinkCore.createEmptyEdges(AppStateSlitherlink.rows, AppStateSlitherlink.cols);
      AppStateSlitherlink.moveCount++;
      updateSlitherlinkBoard();
      updateGameLabelsSlitherlink();
      setStatusSlitherlink("board-info", hintTextSlitherlink());
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SLITHERLINK_SAVE_KEY) : null;
  if (savedGame && savedGame.clues) {
    AppStateSlitherlink.difficulty = savedGame.difficulty;
    AppStateSlitherlink.rows = savedGame.rows;
    AppStateSlitherlink.cols = savedGame.cols;
    AppStateSlitherlink.clues = savedGame.clues;
    AppStateSlitherlink.solution = savedGame.solution;
    AppStateSlitherlink.edges = savedGame.edges;
    AppStateSlitherlink.moveCount = savedGame.moveCount;
    AppStateSlitherlink.gameOver = false;
    resetUndoStackSlitherlink();
    if (levelInline) levelInline.value = AppStateSlitherlink.difficulty;
    setGameResultSlitherlink("");
    showBoardSectionSlitherlink();
    buildSlitherlinkBoardDOM();
    updateSlitherlinkBoard();
    updateGameLabelsSlitherlink();
    setStatusSlitherlink("board-info", hintTextSlitherlink());
  }
  // Otherwise no puzzle is pre-generated: the placeholder shows until
  // the player picks a difficulty and presses New puzzle.
}

function onSlitherlinkEdgeClick(ref) {
  if (AppStateSlitherlink.gameOver || !AppStateSlitherlink.edges) return;
  pushUndoSnapshotSlitherlink();
  const current = SlitherlinkCore.getEdge(AppStateSlitherlink.edges, ref);
  SlitherlinkCore.setEdge(AppStateSlitherlink.edges, ref, SlitherlinkCore.cycleEdgeValue(current));
  AppStateSlitherlink.moveCount++;
  updateSlitherlinkBoard();
  updateGameLabelsSlitherlink();

  if (SlitherlinkCore.checkWin(AppStateSlitherlink.edges, AppStateSlitherlink.clues, AppStateSlitherlink.rows, AppStateSlitherlink.cols)) {
    AppStateSlitherlink.gameOver = true;
    const message = (window.I18n && I18n.t("slitherlink_win_message")) || "Loop complete! Well done.";
    announceGameResultSlitherlink(message);
    recordSlitherlinkStats();
    updateGameLabelsSlitherlink();
  } else {
    setStatusSlitherlink("board-info", hintTextSlitherlink());
  }
}

function undoLastMove() {
  if (!AppStateSlitherlink.undoStack || !AppStateSlitherlink.undoStack.length) return;
  const prev = AppStateSlitherlink.undoStack.pop();
  AppStateSlitherlink.edges = prev.edges;
  AppStateSlitherlink.moveCount = prev.moveCount;
  setGameResultSlitherlink("");
  updateSlitherlinkBoard();
  updateGameLabelsSlitherlink();
  setStatusSlitherlink("board-info", (window.I18n && I18n.t("slitherlink_undone")) || "Move undone.");
}

function showBoardSectionSlitherlink() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering: a decorative SVG layer (dots, clue numbers, and the
     loop lines themselves) underneath a grid of real, invisible-until-
     "on" <button> elements - one per potential edge - positioned with
     the same percentage-of-container technique fanorona-app.js uses for
     its (also real-button) points. ***/

const SL_UNIT = 100;
const SL_PAD = 34;
const SVG_NS_SL = "http://www.w3.org/2000/svg";

function slTotalW() { return AppStateSlitherlink.cols * SL_UNIT + SL_PAD * 2; }
function slTotalH() { return AppStateSlitherlink.rows * SL_UNIT + SL_PAD * 2; }
function slDotX(c) { return SL_PAD + c * SL_UNIT; }
function slDotY(r) { return SL_PAD + r * SL_UNIT; }
function slPctX(value) { return (value / slTotalW() * 100) + "%"; }
function slPctY(value) { return (value / slTotalH() * 100) + "%"; }

function buildSlitherlinkBoardDOM() {
  const boardEl = document.getElementById("slitherlink-board");
  if (!boardEl) return;
  boardEl.innerHTML = "";

  const rows = AppStateSlitherlink.rows, cols = AppStateSlitherlink.cols;
  const totalW = slTotalW(), totalH = slTotalH();

  const svg = document.createElementNS(SVG_NS_SL, "svg");
  svg.setAttribute("class", "slitherlink-svg");
  svg.setAttribute("viewBox", "0 0 " + totalW + " " + totalH);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  // Clue cell numbers, each with a small dashed ring drawn behind it
  // that's only shown (via the "conflict" class) once that cell's
  // current edges make its clue impossible to satisfy.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const clue = AppStateSlitherlink.clues[r][c];
      if (clue === null || clue === undefined) continue;
      const cx = SL_PAD + (c + 0.5) * SL_UNIT;
      const cy = SL_PAD + (r + 0.5) * SL_UNIT;
      const ring = document.createElementNS(SVG_NS_SL, "circle");
      ring.setAttribute("class", "slitherlink-clue-ring");
      ring.setAttribute("cx", cx);
      ring.setAttribute("cy", cy);
      ring.setAttribute("r", SL_UNIT * 0.34);
      ring.dataset.row = r;
      ring.dataset.col = c;
      svg.appendChild(ring);

      const text = document.createElementNS(SVG_NS_SL, "text");
      text.setAttribute("class", "slitherlink-clue-text");
      text.setAttribute("x", cx);
      text.setAttribute("y", cy);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.textContent = String(clue);
      text.dataset.row = r;
      text.dataset.col = c;
      svg.appendChild(text);
    }
  }

  // The loop lines themselves - one visual element per potential edge,
  // restyled (not rebuilt) as state changes.
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const line = document.createElementNS(SVG_NS_SL, "line");
      line.setAttribute("class", "slitherlink-edge-line");
      line.setAttribute("x1", slDotX(c));
      line.setAttribute("y1", slDotY(r));
      line.setAttribute("x2", slDotX(c + 1));
      line.setAttribute("y2", slDotY(r));
      line.dataset.type = "H";
      line.dataset.r = r;
      line.dataset.c = c;
      svg.appendChild(line);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const line = document.createElementNS(SVG_NS_SL, "line");
      line.setAttribute("class", "slitherlink-edge-line");
      line.setAttribute("x1", slDotX(c));
      line.setAttribute("y1", slDotY(r));
      line.setAttribute("x2", slDotX(c));
      line.setAttribute("y2", slDotY(r + 1));
      line.dataset.type = "V";
      line.dataset.r = r;
      line.dataset.c = c;
      svg.appendChild(line);
    }
  }

  // Dots on top of the lines, restyled the same way when a branch
  // (3+ "on" edges meeting there) makes them a conflict.
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const dot = document.createElementNS(SVG_NS_SL, "circle");
      dot.setAttribute("class", "slitherlink-dot");
      dot.setAttribute("cx", slDotX(c));
      dot.setAttribute("cy", slDotY(r));
      dot.setAttribute("r", SL_UNIT * 0.06);
      dot.dataset.r = r;
      dot.dataset.c = c;
      svg.appendChild(dot);
    }
  }

  boardEl.appendChild(svg);

  // Real, focusable buttons - one per potential edge - overlaid exactly
  // on top of each line above, generously sized for touch.
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      appendSlitherlinkEdgeButton(boardEl, { type: "H", r, c },
        (c + 0.5) * SL_UNIT + SL_PAD, r * SL_UNIT + SL_PAD, SL_UNIT * 0.92, SL_UNIT * 0.52);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      appendSlitherlinkEdgeButton(boardEl, { type: "V", r, c },
        c * SL_UNIT + SL_PAD, (r + 0.5) * SL_UNIT + SL_PAD, SL_UNIT * 0.52, SL_UNIT * 0.92);
    }
  }

  ensureSlitherlinkAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSlitherlinkAspectRatio);
  } else {
    setTimeout(ensureSlitherlinkAspectRatio, 0);
  }
  ensureSlitherlinkResizeHandler();
}

function appendSlitherlinkEdgeButton(boardEl, ref, centerX, centerY, w, h) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "slitherlink-edge-btn";
  btn.style.left = slPctX(centerX - w / 2);
  btn.style.top = slPctY(centerY - h / 2);
  btn.style.width = slPctX(w);
  btn.style.height = slPctY(h);
  btn.dataset.type = ref.type;
  btn.dataset.r = ref.r;
  btn.dataset.c = ref.c;
  btn.addEventListener("click", () => onSlitherlinkEdgeClick(ref));
  boardEl.appendChild(btn);
}

let slitherlinkResizeHandlerAttached = false;
let slitherlinkResizeTimeoutId = null;

function ensureSlitherlinkAspectRatio() {
  const boardEl = document.getElementById("slitherlink-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const aspect = slTotalH() / slTotalW();
  boardEl.style.height = (rect.width * aspect) + "px";
}

function ensureSlitherlinkResizeHandler() {
  if (slitherlinkResizeHandlerAttached) return;
  slitherlinkResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (slitherlinkResizeTimeoutId !== null) clearTimeout(slitherlinkResizeTimeoutId);
    slitherlinkResizeTimeoutId = setTimeout(() => {
      slitherlinkResizeTimeoutId = null;
      ensureSlitherlinkAspectRatio();
    }, 150);
  });
}

function slitherlinkStateLabel(value) {
  if (value === SlitherlinkCore.ON) return "line";
  if (value === SlitherlinkCore.MARKED) return "marked off";
  return "empty";
}

function updateSlitherlinkBoard() {
  const boardEl = document.getElementById("slitherlink-board");
  if (!boardEl || !AppStateSlitherlink.edges) return;
  const edges = AppStateSlitherlink.edges;
  const rows = AppStateSlitherlink.rows, cols = AppStateSlitherlink.cols;
  const conflicts = SlitherlinkCore.findConflicts(edges, AppStateSlitherlink.clues, rows, cols);

  boardEl.querySelectorAll(".slitherlink-edge-line").forEach((line) => {
    const ref = { type: line.dataset.type, r: parseInt(line.dataset.r, 10), c: parseInt(line.dataset.c, 10) };
    const value = SlitherlinkCore.getEdge(edges, ref);
    line.classList.toggle("slitherlink-edge-on", value === SlitherlinkCore.ON);
    line.classList.toggle("slitherlink-edge-marked", value === SlitherlinkCore.MARKED);
  });

  boardEl.querySelectorAll(".slitherlink-edge-btn").forEach((btn) => {
    const ref = { type: btn.dataset.type, r: parseInt(btn.dataset.r, 10), c: parseInt(btn.dataset.c, 10) };
    const value = SlitherlinkCore.getEdge(edges, ref);
    const label = ref.type === "H"
      ? "Edge between dot row " + ref.r + ", column " + ref.c + " and column " + (ref.c + 1)
      : "Edge between dot row " + ref.r + " and row " + (ref.r + 1) + ", column " + ref.c;
    btn.setAttribute("aria-label", label + ", " + slitherlinkStateLabel(value));
    btn.classList.toggle("slitherlink-edge-btn-on", value === SlitherlinkCore.ON);
  });

  boardEl.querySelectorAll(".slitherlink-clue-ring, .slitherlink-clue-text").forEach((el) => {
    const r = parseInt(el.dataset.row, 10), c = parseInt(el.dataset.col, 10);
    el.classList.toggle("slitherlink-conflict", conflicts.cellConflicts.has(r + "," + c));
  });

  boardEl.querySelectorAll(".slitherlink-dot").forEach((dot) => {
    const r = parseInt(dot.dataset.r, 10), c = parseInt(dot.dataset.c, 10);
    dot.classList.toggle("slitherlink-conflict", conflicts.dotConflicts.has(r + "," + c));
  });
}

function updateGameLabelsSlitherlink() {
  const meta = document.getElementById("game-meta");
  if (meta) {
    if (AppStateSlitherlink.edges) {
      const status = SlitherlinkCore.getLoopStatus(AppStateSlitherlink.edges, AppStateSlitherlink.rows, AppStateSlitherlink.cols);
      meta.textContent = status.onEdgeCount + ((window.I18n && I18n.t("slitherlink_edges_drawn")) || " edges drawn");
    } else {
      meta.textContent = "";
    }
  }
  updateUndoButtonVisibilitySlitherlink();
  updateClearButtonVisibilitySlitherlink();

  if (AppStateSlitherlink.gameOver) clearSavedSlitherlinkGame();
  else saveSlitherlinkGame();
}

function updateUndoButtonVisibilitySlitherlink() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSlitherlink.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSlitherlink.gameOver));
}

function updateClearButtonVisibilitySlitherlink() {
  const btn = document.getElementById("slitherlink-clear-button");
  if (btn) btn.classList.toggle("hidden", AppStateSlitherlink.gameOver || !AppStateSlitherlink.edges);
}

document.addEventListener("DOMContentLoaded", initSlitherlinkApp);
