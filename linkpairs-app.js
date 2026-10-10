// linkpairs-app.js
// Wires LinkPairsCore ("Link the Pairs") to linkpairs.html.
//
// Drawing: drag a finger from a symbol, or - for e-readers that handle
// dragging badly - tap a symbol and then tap the cells one after another.
// A line follows horizontal and vertical neighbours only; it ends when it
// reaches the twin symbol. Running into another line cuts that line back;
// tapping a cell of a line shortens the line to end there (and lets you
// go on drawing from there); tapping a symbol starts its line afresh, so
// tapping the symbol where a line begins clears it. "Undo" takes back
// any number of steps, "Hint" draws one correct line in full.
//
// Lines are thick black strokes. Which line belongs to which pair is told
// without colour: every cell of a line carries a small copy of its
// symbol (the number, or the animal) in a white disc.

const AppStateLinkPairs = {
  level: "easy",
  symbols: "numbers",
  puzzle: null,
  index: -1,          // which stored puzzle, for the save and "played" list
  lines: [],          // per pair: cells from one symbol on ([] = none)
  active: -1,         // the pair being drawn (-1 = none)
  history: [],        // { lines, active } before each step, for Undo
  hinted: false,
  gameOver: false
};

const LINKPAIRS_SAVE_KEY = "einkchess_save_linkpairs";
const LINKPAIRS_SYMBOLS_KEY = "papergames_linkpairs_symbols";
const LINKPAIRS_PLAYED_KEY = "papergames_linkpairs_played";
const LINKPAIRS_ANIMAL_EN = {
  dog: "Dog", cat: "Cat", rabbit: "Rabbit", mouse: "Mouse", hedgehog: "Hedgehog", owl: "Owl", fish: "Fish",
  turtle: "Turtle", snail: "Snail", duck: "Duck", frog: "Frog", pig: "Pig", elephant: "Elephant",
  butterfly: "Butterfly", bee: "Bee", lion: "Lion", giraffe: "Giraffe", sheep: "Sheep"
};

/*** Symbols ***/

function linkPairsAnimalBody(k) {
  const name = PairsAnimals.NAMES[k % PairsAnimals.NAMES.length];
  return PairsAnimals.own[name] || (typeof CakeIcons !== "undefined" ? CakeIcons.icons[name] : "") || "";
}

// The English name of pair k's symbol: its number, or its animal (the
// i18n layer translates it).
function linkPairsSymbolName(k) {
  if (AppStateLinkPairs.symbols === "animals") return LINKPAIRS_ANIMAL_EN[PairsAnimals.NAMES[k % PairsAnimals.NAMES.length]];
  return String(k + 1);
}

/*** Status and save ***/

function setStatusLinkPairs(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveLinkPairsGame() {
  if (typeof GameStorage === "undefined" || !AppStateLinkPairs.puzzle) return;
  const s = AppStateLinkPairs;
  GameStorage.save(LINKPAIRS_SAVE_KEY, { level: s.level, index: s.index, lines: s.lines, history: s.history.slice(-200), hinted: s.hinted });
}

function clearSavedLinkPairsGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(LINKPAIRS_SAVE_KEY);
}

function loadLinkPairsPlayed() {
  try {
    const v = JSON.parse(localStorage.getItem(LINKPAIRS_PLAYED_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch (e) {
    return {};
  }
}

// A stored puzzle not played lately: the last half of each level's list
// is remembered and skipped.
function pickLinkPairsPuzzle(level) {
  const list = LinkPairsPuzzles[level];
  const played = loadLinkPairsPlayed();
  const recent = Array.isArray(played[level]) ? played[level] : [];
  const free = [];
  for (let i = 0; i < list.length; i++) if (recent.indexOf(i) === -1) free.push(i);
  const pool = free.length ? free : list.map((_, i) => i);
  const index = pool[Math.floor(Math.random() * pool.length)];
  recent.push(index);
  while (recent.length > Math.floor(list.length / 2)) recent.shift();
  played[level] = recent;
  try { localStorage.setItem(LINKPAIRS_PLAYED_KEY, JSON.stringify(played)); } catch (e) { /* not kept */ }
  return index;
}

/*** Setup ***/

function initLinkPairsApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("linkpairs-level");
  const symbolSelect = document.getElementById("linkpairs-symbols");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  try {
    const v = localStorage.getItem(LINKPAIRS_SYMBOLS_KEY);
    if (v === "animals" || v === "numbers") AppStateLinkPairs.symbols = v;
  } catch (e) { /* default */ }
  if (symbolSelect) {
    symbolSelect.value = AppStateLinkPairs.symbols;
    symbolSelect.addEventListener("change", () => {
      AppStateLinkPairs.symbols = symbolSelect.value === "animals" ? "animals" : "numbers";
      try { localStorage.setItem(LINKPAIRS_SYMBOLS_KEY, AppStateLinkPairs.symbols); } catch (e) { /* not kept */ }
      if (AppStateLinkPairs.puzzle) renderLinkPairs();
    });
  }
  document.getElementById("start-linkpairs-game").addEventListener("click", () => startNewLinkPairs(levelSelect.value));
  document.getElementById("linkpairs-undo").addEventListener("click", undoLinkPairs);
  document.getElementById("hint-btn").addEventListener("click", hintLinkPairs);
  wireLinkPairsBoard();
  window.addEventListener("resize", () => { if (AppStateLinkPairs.puzzle) sizeLinkPairsBoard(); });
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateLinkPairs.puzzle) renderLinkPairs(); });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(LINKPAIRS_SAVE_KEY) : null;
  if (saved && LinkPairsCore.LEVELS[saved.level] && LinkPairsPuzzles[saved.level] && LinkPairsPuzzles[saved.level][saved.index]) {
    const s = AppStateLinkPairs;
    s.level = saved.level;
    s.index = saved.index;
    s.puzzle = LinkPairsCore.decode(saved.level, LinkPairsPuzzles[saved.level][saved.index]);
    const k = s.puzzle.ends.length;
    s.lines = Array.isArray(saved.lines) && saved.lines.length === k ? saved.lines : s.puzzle.ends.map(() => []);
    s.history = Array.isArray(saved.history) ? saved.history : [];
    s.hinted = !!saved.hinted;
    s.active = -1;
    s.gameOver = false;
    if (levelSelect) levelSelect.value = s.level;
    showLinkPairsBoard();
    buildLinkPairsBoard();
    setStatusLinkPairs("Tap a symbol or drag from it to draw its line.");
  }
}

function startNewLinkPairs(level) {
  const s = AppStateLinkPairs;
  s.level = LinkPairsCore.LEVELS[level] ? level : "easy";
  s.index = pickLinkPairsPuzzle(s.level);
  s.puzzle = LinkPairsCore.decode(s.level, LinkPairsPuzzles[s.level][s.index]);
  s.lines = s.puzzle.ends.map(() => []);
  s.active = -1;
  s.history = [];
  s.hinted = false;
  s.gameOver = false;
  if (window.ResultModal) window.ResultModal.hide();
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  showLinkPairsBoard();
  buildLinkPairsBoard();
  setStatusLinkPairs("Tap a symbol or drag from it to draw its line.");
  saveLinkPairsGame();
}

function showLinkPairsBoard() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
}

function buildLinkPairsBoard() {
  const p = AppStateLinkPairs.puzzle;
  const n = p.n;
  const board = document.getElementById("linkpairs-board");
  board.innerHTML = "";
  board.className = "linkpairs-board linkpairs-board-" + n;
  for (let i = 0; i < n * n; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "square linkpairs-cell";
    cell.dataset.index = i;
    cell.setAttribute("data-i18n-attr", "");
    board.appendChild(cell);
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "linkpairs-lines");
  svg.setAttribute("viewBox", "0 0 " + 40 * n + " " + 40 * n);
  AppStateLinkPairs.cell = 40;
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  board.appendChild(svg);
  sizeLinkPairsBoard();
}

// Square cells by explicit pixel size (no CSS aspect-ratio on e-ink); the
// board also shrinks so that the info line, board and buttons fit on one
// screen where possible, but not below 30px cells.
function sizeLinkPairsBoard() {
  const board = document.getElementById("linkpairs-board");
  const wrap = document.getElementById("linkpairs-wrap");
  if (!board || !wrap || !AppStateLinkPairs.puzzle) return;
  const n = AppStateLinkPairs.puzzle.n;
  board.style.width = "";
  const w = wrap.clientWidth;
  if (!w) { renderLinkPairs(); return; }
  let side = Math.min(w, 560);
  const info = document.getElementById("board-info");
  const actions = document.getElementById("board-actions");
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  if (info && actions && viewH) {
    const boardH = board.getBoundingClientRect().height;
    const rest = actions.getBoundingClientRect().bottom - info.getBoundingClientRect().top - boardH;
    side = Math.min(side, Math.max(viewH - rest - 24, n * 30));
  }
  const frame = 6;
  const size = Math.floor((side - frame) / n);
  board.style.width = (size * n + frame) + "px";
  board.style.height = (size * n + frame) + "px";
  board.querySelectorAll(".linkpairs-cell").forEach((cell) => {
    cell.style.width = size + "px";
    cell.style.height = size + "px";
  });
  // The drawing layer works in real pixels, so its text sizes are true sizes.
  AppStateLinkPairs.cell = size;
  const svg = board.querySelector(".linkpairs-lines");
  if (svg) svg.setAttribute("viewBox", "0 0 " + size * n + " " + size * n);
  renderLinkPairs();
}

/*** Drawing ***/

function linkPairsOwner(i) {
  const lines = AppStateLinkPairs.lines;
  for (let k = 0; k < lines.length; k++) {
    const at = lines[k].indexOf(i);
    if (at !== -1) return { pair: k, at };
  }
  return null;
}

function snapshotLinkPairs() {
  return { lines: AppStateLinkPairs.lines.map((l) => l.slice()), active: AppStateLinkPairs.active };
}

// Can the active line go on to cell i?
function linkPairsCanExtend(i) {
  const s = AppStateLinkPairs, p = s.puzzle;
  const k = s.active;
  if (k < 0) return false;
  const l = s.lines[k];
  if (!l.length || LinkPairsCore.lineComplete(p, s.lines, k)) return false;
  const last = l[l.length - 1];
  if (!LinkPairsCore.adjacent(p.n, last, i) || l.indexOf(i) !== -1) return false;
  const sym = s.endMap[i];
  if (sym === -1) return true;
  return sym === k && i !== l[0];
}

function linkPairsExtend(i) {
  const s = AppStateLinkPairs, p = s.puzzle, k = s.active;
  const other = linkPairsOwner(i);
  // Running into another line cuts it back to just before this cell.
  if (other && other.pair !== k) {
    s.lines[other.pair] = s.lines[other.pair].slice(0, other.at);
  }
  s.lines[k].push(i);
  if (LinkPairsCore.lineComplete(p, s.lines, k)) {
    s.active = -1;
    setStatusLinkPairs("Pair " + linkPairsSymbolName(k) + " is joined.");
  }
}

// One tap (or the first touch of a drag) on cell i. Returns true if it
// changed anything.
function linkPairsTap(i) {
  const s = AppStateLinkPairs;
  if (s.active >= 0 && linkPairsCanExtend(i)) {
    linkPairsExtend(i);
    return true;
  }
  const sym = s.endMap[i];
  if (sym !== -1) {
    // A symbol starts its line afresh.
    s.lines[sym] = [i];
    s.active = sym;
    setStatusLinkPairs("Now tap the cells one after another, or drag.");
    return true;
  }
  const own = linkPairsOwner(i);
  if (own) {
    // A cell of a line: the line now ends here, and drawing goes on from it.
    s.lines[own.pair] = s.lines[own.pair].slice(0, own.at + 1);
    s.active = own.pair;
    setStatusLinkPairs("The line ends here now. Go on from this cell.");
    return true;
  }
  if (s.active >= 0 && s.lines[s.active].length) {
    setStatusLinkPairs("Only a cell right next to the end of the line can come next.");
  } else {
    setStatusLinkPairs("Start a line at a symbol.");
  }
  return false;
}

// Dragging over cell i: go on, or go back along the active line.
function linkPairsDragTo(i) {
  const s = AppStateLinkPairs;
  const k = s.active;
  if (k < 0) return false;
  const l = s.lines[k];
  if (l[l.length - 1] === i) return false;
  if (linkPairsCanExtend(i)) { linkPairsExtend(i); return true; }
  const at = l.indexOf(i);
  if (at !== -1) { s.lines[k] = l.slice(0, at + 1); return true; }
  return false;
}

function wireLinkPairsBoard() {
  const board = document.getElementById("linkpairs-board");
  let dragging = false, before = null, changed = false, lastCell = -1;
  const cellAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const cell = el && el.closest ? el.closest(".linkpairs-cell") : null;
    return cell && board.contains(cell) ? parseInt(cell.dataset.index, 10) : -1;
  };
  board.addEventListener("pointerdown", (e) => {
    const s = AppStateLinkPairs;
    if (!s.puzzle || s.gameOver) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0) return;
    e.preventDefault();
    before = snapshotLinkPairs();
    changed = linkPairsTap(i);
    dragging = true;
    lastCell = i;
    try { board.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
    renderLinkPairs();
  });
  board.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0 || i === lastCell) return;
    lastCell = i;
    if (linkPairsDragTo(i)) { changed = true; renderLinkPairs(); }
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    if (changed && before) AppStateLinkPairs.history.push(before);
    before = null;
    if (changed) afterLinkPairsStep();
    changed = false;
  };
  board.addEventListener("pointerup", end);
  board.addEventListener("pointercancel", end);
  // Keyboard (Enter/Space on a focused cell) arrives as a click without
  // a pointer.
  board.addEventListener("click", (e) => {
    if (e.detail !== 0) return;
    const cell = e.target.closest ? e.target.closest(".linkpairs-cell") : null;
    const s = AppStateLinkPairs;
    if (!cell || !s.puzzle || s.gameOver) return;
    const snap = snapshotLinkPairs();
    if (linkPairsTap(parseInt(cell.dataset.index, 10))) {
      s.history.push(snap);
      afterLinkPairsStep();
    } else renderLinkPairs();
  });
}

function afterLinkPairsStep() {
  const s = AppStateLinkPairs, p = s.puzzle;
  renderLinkPairs();
  if (LinkPairsCore.isSolved(p, s.lines)) {
    s.gameOver = true;
    s.active = -1;
    renderLinkPairs();
    const text = "Solved! Every pair is joined and every cell is used.";
    setStatusLinkPairs(text);
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    if (typeof GameStats !== "undefined") GameStats.record("linkpairs", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("msg_solved"), I18n.msg("Every pair is joined and every cell is used."));
    clearSavedLinkPairsGame();
    return;
  }
  if (p.ends.every((_, k) => LinkPairsCore.lineComplete(p, s.lines, k))) {
    const empty = p.n * p.n - LinkPairsCore.coveredCount(p, s.lines);
    setStatusLinkPairs("All pairs are joined, but every cell must be used. Empty cells: " + empty + ".");
  }
  saveLinkPairsGame();
}

function undoLinkPairs() {
  const s = AppStateLinkPairs;
  if (!s.puzzle || s.gameOver || !s.history.length) return;
  const prev = s.history.pop();
  s.lines = prev.lines;
  s.active = prev.active;
  setStatusLinkPairs("Move undone.");
  renderLinkPairs();
  saveLinkPairsGame();
}

function hintLinkPairs() {
  const s = AppStateLinkPairs, p = s.puzzle;
  if (!p || s.gameOver) return;
  const h = LinkPairsCore.findHint(p, s.lines);
  if (h.kind !== "line") return;
  s.history.push(snapshotLinkPairs());
  s.hinted = true;
  s.lines = LinkPairsCore.applyLine(p, s.lines, h.pair, h.cells);
  s.active = -1;
  afterLinkPairsStep();
  if (!s.gameOver) setStatusLinkPairs("Hint: the line for " + linkPairsSymbolName(h.pair) + " is drawn.");
}

/*** Rendering ***/

function renderLinkPairs() {
  const s = AppStateLinkPairs, p = s.puzzle;
  if (!p) return;
  const n = p.n;
  s.endMap = LinkPairsCore.endMap(p);
  const animals = s.symbols === "animals";
  const owner = new Array(n * n).fill(-1);
  s.lines.forEach((l, k) => l.forEach((c) => { owner[c] = k; }));
  // Lines, then the small symbol discs on them, then the symbols.
  let out = "";
  const u = s.cell || 40;
  const f = (v) => Math.round(v * 100) / 100;
  const xy = (c) => [f(((c % n) + 0.5) * u), f((Math.floor(c / n) + 0.5) * u)];
  s.lines.forEach((l) => {
    if (l.length < 2) return;
    out += '<polyline points="' + l.map((c) => xy(c).join(",")).join(" ") + '" fill="none" stroke="#141413" stroke-width="' + f(0.3 * u) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  const mark = (k, c, r) => {
    const [x, y] = xy(c);
    if (animals) {
      const sc = (r * 1.5) / 40;
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#141413" stroke-width="' + f(0.05 * u) + '"/>' +
        '<g transform="translate(' + (x - 20 * sc) + " " + (y - 20 * sc) + ") scale(" + sc + ')">' + linkPairsAnimalBody(k) + "</g>";
    }
    const fs = f(Math.max(r * 1.25, 11));
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#141413" stroke-width="' + f(0.05 * u) + '"/>' +
      '<text x="' + x + '" y="' + f(y + fs * 0.35) + '" text-anchor="middle" font-size="' + fs + '" font-weight="700" fill="#141413">' + (k + 1) + "</text>";
  };
  s.lines.forEach((l, k) => l.forEach((c) => { if (s.endMap[c] === -1) out += mark(k, c, f(0.27 * u)); }));
  p.ends.forEach((e, k) => e.forEach((c) => {
    const [x, y] = xy(c);
    if (animals) {
      const sc = (0.66 * u) / 40;
      out += '<circle cx="' + x + '" cy="' + y + '" r="' + f(0.44 * u) + '" fill="#fff" stroke="#141413" stroke-width="' + f(0.08 * u) + '"/>' +
        '<g transform="translate(' + (x - 20 * sc) + " " + (y - 20 * sc) + ") scale(" + sc + ')">' + linkPairsAnimalBody(k) + "</g>";
    } else {
      out += '<circle cx="' + x + '" cy="' + y + '" r="' + f(0.38 * u) + '" fill="#141413"/>' +
        '<text x="' + x + '" y="' + f(y + 0.17 * u) + '" text-anchor="middle" font-size="' + f(0.48 * u) + '" font-weight="700" fill="#fff">' + (k + 1) + "</text>";
    }
  }));
  // The end of the line being drawn gets a dashed frame.
  if (s.active >= 0 && s.lines[s.active].length) {
    const c = s.lines[s.active][s.lines[s.active].length - 1];
    out += '<rect x="' + f(((c % n) + 0.06) * u) + '" y="' + f((Math.floor(c / n) + 0.06) * u) + '" width="' + f(0.88 * u) + '" height="' + f(0.88 * u) + '" fill="none" stroke="#141413" stroke-width="' + f(0.06 * u) + '" stroke-dasharray="' + f(0.14 * u) + " " + f(0.1 * u) + '"/>';
  }
  const svg = document.querySelector("#linkpairs-board .linkpairs-lines");
  if (svg) svg.innerHTML = out;
  // Screen-reader labels: position, then what is there.
  document.querySelectorAll("#linkpairs-board .linkpairs-cell").forEach((cell) => {
    const i = parseInt(cell.dataset.index, 10);
    const parts = ["Row " + (Math.floor(i / n) + 1) + ", column " + ((i % n) + 1)];
    if (s.endMap[i] !== -1) {
      const k = s.endMap[i];
      parts.push("symbol " + linkPairsSymbolName(k));
      if (LinkPairsCore.lineComplete(p, s.lines, k)) parts.push("joined");
    } else if (owner[i] !== -1) parts.push("line " + linkPairsSymbolName(owner[i]));
    else parts.push("empty");
    if (s.active >= 0 && s.lines[s.active].length && s.lines[s.active][s.lines[s.active].length - 1] === i) parts.push("end of the line");
    I18n.setAria(cell, parts.join(", "));
  });
  const meta = document.getElementById("game-meta");
  if (meta) {
    const done = p.ends.filter((_, k) => LinkPairsCore.lineComplete(p, s.lines, k)).length;
    I18n.setMsg(meta, "Joined: " + done + " / " + p.ends.length);
  }
  const undo = document.getElementById("linkpairs-undo");
  if (undo) undo.disabled = !s.history.length || s.gameOver;
}

document.addEventListener("DOMContentLoaded", initLinkPairsApp);
