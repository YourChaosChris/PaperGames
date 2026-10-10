// shapesort-app.js
// Wires ShapeSortCore ("Shape Sort") to shapesort.html.
//
// Tap a tube: its top stone (with the same shapes right below it) is
// marked and the tube gets a double frame. Tap another tube: the stones
// go there if that tube is empty or has the same shape on top and room
// left. Tap the marked tube again to let go. "Undo" takes back any
// number of moves, "Shuffle" deals a new puzzle, "Hint" marks the two
// tubes of a move that leads to a solution (or says honestly that the
// position can no longer be solved, so an undo is needed).
//
// Stones differ by shape only - circle, square, triangle, star, heart,
// cross, diamond, moon - drawn black on white, some filled and some
// outlined as an extra cue. Each tube has its number under it, which the
// status line and the screen-reader labels use.

const AppStateShapeSort = {
  level: "easy",
  tubes: null,
  start: null,       // the deal, for nothing but the save
  history: [],       // positions before each move, for Undo
  plan: null,        // solving plan the hint follows (ShapeSortCore.findHint)
  selected: -1,
  hintTubes: [],
  hinted: false,
  moves: 0,
  gameOver: false
};

const SHAPESORT_SAVE_KEY = "einkchess_save_shapesort";
const SHAPESORT_EN = { circle: "Circle", square: "Square", triangle: "Triangle", star: "Star", heart: "Heart", cross: "Cross", diamond: "Diamond", moon: "Moon" };

// Shape drawings, viewBox 0 0 40 40.
const SHAPESORT_ICONS = (function () {
  const F = 'fill="#141413"';
  const O = 'fill="#fff" stroke="#141413" stroke-width="4.5" stroke-linejoin="round"';
  return {
    circle: '<circle cx="20" cy="20" r="14" ' + F + '/>',
    square: '<rect x="8" y="8" width="24" height="24" ' + O + '/>',
    triangle: '<polygon points="20,5 36,34 4,34" ' + F + '/>',
    star: '<polygon points="20,3 24.5,14.5 37,15 27.5,23 31,35.5 20,28.5 9,35.5 12.5,23 3,15 15.5,14.5" ' + F + '/>',
    heart: '<path d="M20 34C13 28 6 23 6 15.5C6 10.5 10 7 14 7C16.8 7 19 8.8 20 11C21 8.8 23.2 7 26 7C30 7 34 10.5 34 15.5C34 23 27 28 20 34Z" ' + O + '/>',
    cross: '<polygon points="15,5 25,5 25,15 35,15 35,25 25,25 25,35 15,35 15,25 5,25 5,15 15,15" ' + F + '/>',
    diamond: '<polygon points="20,4 35,20 20,36 5,20" ' + O + '/>',
    moon: '<path d="M26 5A15 15 0 1 0 35 27A12 12 0 1 1 26 5Z" ' + F + '/>'
  };
})();

function shapeSvg(s) {
  const name = ShapeSortCore.SHAPES[s];
  return '<svg class="shapesort-stone-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">' + SHAPESORT_ICONS[name] + "</svg>";
}

function shapeNameEn(s) {
  return SHAPESORT_EN[ShapeSortCore.SHAPES[s]];
}

function setStatusShapeSort(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveShapeSortGame() {
  if (typeof GameStorage === "undefined" || !AppStateShapeSort.tubes) return;
  const s = AppStateShapeSort;
  GameStorage.save(SHAPESORT_SAVE_KEY, { level: s.level, tubes: s.tubes, start: s.start, history: s.history, moves: s.moves, hinted: s.hinted });
}

function clearSavedShapeSortGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(SHAPESORT_SAVE_KEY);
}

function initShapeSortApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("shapesort-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-shapesort-game").addEventListener("click", () => startNewShapeSort(levelSelect.value));
  document.getElementById("shapesort-shuffle").addEventListener("click", () => startNewShapeSort(AppStateShapeSort.level));
  document.getElementById("shapesort-undo").addEventListener("click", undoShapeSort);
  document.getElementById("hint-btn").addEventListener("click", hintShapeSort);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SHAPESORT_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.tubes) && ShapeSortCore.LEVELS[saved.level]) {
    const s = AppStateShapeSort;
    s.level = saved.level;
    s.tubes = saved.tubes;
    s.start = saved.start || saved.tubes;
    s.history = Array.isArray(saved.history) ? saved.history : [];
    s.moves = saved.moves || 0;
    s.hinted = !!saved.hinted;
    s.plan = null;
    s.selected = -1;
    s.gameOver = false;
    if (levelSelect) levelSelect.value = s.level;
    showShapeSortBoard();
    buildShapeSortBoard();
    setStatusShapeSort("Tap a tube, then the tube the stones should go to.");
  }
}

function startNewShapeSort(level) {
  const p = ShapeSortCore.generatePuzzle(level);
  const s = AppStateShapeSort;
  s.level = level;
  s.tubes = p.tubes;
  s.start = p.tubes;
  s.history = [];
  s.plan = ShapeSortCore.makePlan(p.tubes, p.solution);
  s.selected = -1;
  s.hintTubes = [];
  s.hinted = false;
  s.moves = 0;
  s.gameOver = false;
  if (window.ResultModal) window.ResultModal.hide();
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  showShapeSortBoard();
  buildShapeSortBoard();
  setStatusShapeSort("Tap a tube, then the tube the stones should go to.");
  saveShapeSortGame();
}

function showShapeSortBoard() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Board ***/

function buildShapeSortBoard() {
  const s = AppStateShapeSort;
  const el = document.getElementById("shapesort-tubes");
  el.innerHTML = "";
  s.tubes.forEach((_, i) => {
    const wrap = document.createElement("span");
    wrap.className = "shapesort-tube-wrap";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "shapesort-tube";
    btn.setAttribute("data-i18n-attr", "");
    btn.dataset.tube = i;
    for (let k = ShapeSortCore.CAPACITY - 1; k >= 0; k--) {
      const slot = document.createElement("span");
      slot.className = "shapesort-slot";
      slot.dataset.slot = k;
      btn.appendChild(slot);
    }
    btn.addEventListener("click", () => onShapeSortTubeClick(i));
    const num = document.createElement("span");
    num.className = "shapesort-tube-num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(i + 1);
    wrap.appendChild(btn);
    wrap.appendChild(num);
    el.appendChild(wrap);
  });
  layoutShapeSortRows();
  if (!buildShapeSortBoard.resizeAttached) {
    buildShapeSortBoard.resizeAttached = true;
    let timer = null;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(layoutShapeSortRows, 150);
    });
  }
  renderShapeSort();
}

// Even rows: when the tubes don't fit in one row, they are split into
// rows of (almost) the same length instead of a long row and a short one.
function layoutShapeSortRows() {
  const el = document.getElementById("shapesort-tubes");
  const first = el && el.querySelector(".shapesort-tube-wrap");
  if (!first) return;
  el.style.maxWidth = "";
  const avail = el.parentNode.getBoundingClientRect().width;
  const style = window.getComputedStyle(first);
  const w = first.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  const n = AppStateShapeSort.tubes.length;
  const perRowMax = Math.max(1, Math.floor(avail / w));
  const rows = Math.ceil(n / perRowMax);
  const perRow = Math.ceil(n / rows);
  el.style.maxWidth = Math.ceil(perRow * w + 1) + "px";
}

function renderShapeSort() {
  const s = AppStateShapeSort;
  if (!s.tubes) return;
  const sel = s.selected;
  const runSel = sel >= 0 ? ShapeSortCore.topRun(s.tubes[sel]) : 0;
  document.querySelectorAll("#shapesort-tubes .shapesort-tube").forEach((btn) => {
    const i = parseInt(btn.dataset.tube, 10);
    const t = s.tubes[i];
    btn.querySelectorAll(".shapesort-slot").forEach((slot) => {
      const k = parseInt(slot.dataset.slot, 10);
      const stone = k < t.length ? t[k] : -1;
      const view = String(stone);
      if (slot.dataset.view !== view) {
        slot.dataset.view = view;
        slot.innerHTML = stone >= 0 ? shapeSvg(stone) : "";
      }
      slot.classList.toggle("shapesort-stone-marked", i === sel && k < t.length && k >= t.length - runSel);
    });
    btn.classList.toggle("shapesort-tube-selected", i === sel);
    btn.classList.toggle("shapesort-tube-done", ShapeSortCore.isComplete(t));
    btn.classList.toggle("hint-cell", s.hintTubes.indexOf(i) !== -1);
    let label = "Tube " + (i + 1) + ", ";
    label += t.length ? t.map(shapeNameEn).join(", ") : "empty";
    if (i === sel) label += ", selected";
    I18n.setAria(btn, label);
  });
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Moves: " + s.moves);
  const undo = document.getElementById("shapesort-undo");
  if (undo) undo.disabled = !s.history.length || s.gameOver;
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", s.gameOver);
}

/*** Moves ***/

function onShapeSortTubeClick(i) {
  const s = AppStateShapeSort;
  if (!s.tubes || s.gameOver) return;
  s.hintTubes = [];
  if (s.selected === -1) {
    if (!s.tubes[i].length) {
      setStatusShapeSort("This tube is empty. Tap a tube with stones first.");
    } else {
      s.selected = i;
      setStatusShapeSort("Now tap the tube the stones should go to.");
    }
    renderShapeSort();
    return;
  }
  if (s.selected === i) {
    s.selected = -1;
    setStatusShapeSort("Tap a tube, then the tube the stones should go to.");
    renderShapeSort();
    return;
  }
  const from = s.selected;
  const next = ShapeSortCore.applyMove(s.tubes, from, i);
  if (!next) {
    setStatusShapeSort(s.tubes[i].length >= ShapeSortCore.CAPACITY
      ? "That tube is full. Choose another one."
      : "Stones can only go onto the same shape or into an empty tube.");
    return;
  }
  s.history.push(s.tubes);
  s.tubes = next;
  s.selected = -1;
  s.moves++;
  afterShapeSortMove();
}

function afterShapeSortMove() {
  const s = AppStateShapeSort;
  if (ShapeSortCore.isSolved(s.tubes)) {
    s.gameOver = true;
    s.hintTubes = [];
    renderShapeSort();
    const text = "Sorted! Every tube holds one shape. Moves: " + s.moves + ".";
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    setStatusShapeSort(text);
    if (typeof GameStats !== "undefined") GameStats.record("shapesort", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("msg_solved"), I18n.msg("Every tube holds one shape. Moves: " + s.moves + "."));
    clearSavedShapeSortGame();
    return;
  }
  setStatusShapeSort("Tap a tube, then the tube the stones should go to.");
  renderShapeSort();
  saveShapeSortGame();
}

function undoShapeSort() {
  const s = AppStateShapeSort;
  if (!s.history.length || s.gameOver) return;
  s.tubes = s.history.pop();
  s.moves = Math.max(0, s.moves - 1);
  s.selected = -1;
  s.hintTubes = [];
  setStatusShapeSort("Move undone.");
  renderShapeSort();
  saveShapeSortGame();
}

function hintShapeSort() {
  const s = AppStateShapeSort;
  if (!s.tubes || s.gameOver) return;
  s.hinted = true;
  s.selected = -1;
  const h = ShapeSortCore.findHint(s.tubes, s.plan);
  if (h.kind === "move") {
    s.plan = h.plan;
    s.hintTubes = [h.from, h.to];
    setStatusShapeSort("Hint: move the top stones from tube " + (h.from + 1) + " to tube " + (h.to + 1) + ".");
  } else if (h.kind === "stuck") {
    s.hintTubes = [];
    setStatusShapeSort("From here the stones can no longer all be sorted. Undo a few moves.");
  }
  renderShapeSort();
  saveShapeSortGame();
}

document.addEventListener("DOMContentLoaded", initShapeSortApp);
