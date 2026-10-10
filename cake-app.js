// cake-app.js
// Wires CakeCore ("Who Took the Cake?") to cake.html. Solitaire, like the
// other logic puzzles: a level picker, a fresh generated puzzle each time,
// a hint button, the game saved between visits.
//
// Pick a thing in the row of buttons under the board (an animal, the
// cake, or "X" for "nothing here"), then tap a cell. Tapping the same cell
// with the same pick takes it off again; a thing set somewhere new leaves
// its old cell. Clues are numbered under the board and can be ticked off
// as a memory aid.
//
// All text comes from I18n.t() with ready-made phrases (see
// CakeCore.clueText) and is rebuilt when the language changes.

const AppStateCake = {
  level: "easy",
  puzzle: null,
  placed: [],        // cell per thing, -1 = not on the board
  crosses: [],       // cells marked "nothing here"
  tool: 0,           // thing index, or "x"
  cluesDone: [],     // clue index -> ticked off
  hinted: false,     // the hint button was used on this puzzle
  hintCell: -1,      // cell the current hint marks
  gameOver: false,
  status: null       // { key, vars } of the current info line
};

const CAKE_SAVE_KEY = "einkchess_save_cake";

function tCake(key, vars) {
  const s = (typeof I18n !== "undefined") ? I18n.t(key) : key;
  return vars ? CakeCore.fill(s, vars) : s;
}

function saveCakeGame() {
  if (typeof GameStorage === "undefined" || !AppStateCake.puzzle) return;
  GameStorage.save(CAKE_SAVE_KEY, {
    level: AppStateCake.level,
    puzzle: AppStateCake.puzzle,
    placed: AppStateCake.placed,
    crosses: AppStateCake.crosses,
    cluesDone: AppStateCake.cluesDone,
    hinted: AppStateCake.hinted
  });
}

function clearSavedCakeGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(CAKE_SAVE_KEY);
}

function setCakeStatus(key, vars) {
  AppStateCake.status = key ? { key, vars: vars || null } : null;
  renderCakeStatus();
}

function renderCakeStatus() {
  const el = document.getElementById("board-info");
  if (!el) return;
  const s = AppStateCake.status;
  if (!s) { el.textContent = ""; return; }
  const vars = s.vars ? Object.assign({}, s.vars) : null;
  if (vars && vars.thing !== undefined) vars.THING = CakeCore.thingName(AppStateCake.puzzle, vars.thing, tCake);
  el.textContent = tCake(s.key, vars);
}

function cakeWinText() {
  const a = CakeCore.culprit(AppStateCake.puzzle);
  return tCake("cake_win_" + CakeCore.ANIMALS[a]);
}

function initCakeApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("cake-level-inline");

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }

  document.getElementById("start-cake-game").addEventListener("click", () => {
    startNewCakeGame(levelInline ? levelInline.value : "easy");
  });
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.addEventListener("click", hintCake);

  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateCake.puzzle) renderCakeAll(); });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(CAKE_SAVE_KEY) : null;
  // A saved puzzle whose clues no longer fit its solution under today's
  // rules (for instance "next to" across a wall) is replaced by a new one.
  if (saved && saved.puzzle && saved.puzzle.solution && !savedCakePuzzleValid(saved.puzzle)) {
    const lv = CakeCore.LEVELS[saved.level] ? saved.level : "easy";
    if (levelInline) levelInline.value = lv;
    startNewCakeGame(lv);
  } else if (saved && saved.puzzle && saved.puzzle.solution) {
    AppStateCake.level = saved.level || "easy";
    AppStateCake.puzzle = saved.puzzle;
    AppStateCake.placed = saved.placed || saved.puzzle.solution.map(() => -1);
    AppStateCake.crosses = saved.crosses || [];
    AppStateCake.cluesDone = saved.cluesDone || [];
    AppStateCake.hinted = !!saved.hinted;
    AppStateCake.hintCell = -1;
    AppStateCake.tool = 0;
    AppStateCake.gameOver = false;
    if (levelInline) levelInline.value = AppStateCake.level;
    showCakeBoard();
    setCakeStatus("cake_status_pick");
  }
  // Otherwise the placeholder shows until a level is picked and New puzzle pressed.
}

function savedCakePuzzleValid(p) {
  try {
    return CakeCore.isSolution(p, p.solution) && CakeCore.countSolutions(p, 2) === 1;
  } catch (e) {
    return false;
  }
}

function startNewCakeGame(level) {
  const puzzle = CakeCore.generatePuzzle(level);
  if (!puzzle) return;
  AppStateCake.level = level;
  AppStateCake.puzzle = puzzle;
  AppStateCake.placed = puzzle.solution.map(() => -1);
  AppStateCake.crosses = [];
  AppStateCake.cluesDone = puzzle.clues.map(() => false);
  AppStateCake.hinted = false;
  AppStateCake.hintCell = -1;
  AppStateCake.tool = 0;
  AppStateCake.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) result.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  showCakeBoard();
  setCakeStatus("cake_status_pick");
  saveCakeGame();
}

function showCakeBoard() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  buildCakeBoardDOM();
  renderCakeAll();
}

/*** Board ***/

function buildCakeBoardDOM() {
  const p = AppStateCake.puzzle;
  const n = p.n;
  const boardEl = document.getElementById("cake-board");
  boardEl.innerHTML = "";
  boardEl.className = "cake-board cake-board-" + n;
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "square cake-cell";
    cell.setAttribute("data-i18n-attr", "");
    cell.dataset.index = i;
    cell.style.width = (100 / n) + "%";
    const room = p.rooms[i];
    if (r === 0 || p.rooms[i - n] !== room) cell.classList.add("cake-wall-t");
    if (r === n - 1 || p.rooms[i + n] !== room) cell.classList.add("cake-wall-b");
    if (c === 0 || p.rooms[i - 1] !== room) cell.classList.add("cake-wall-l");
    if (c === n - 1 || p.rooms[i + 1] !== room) cell.classList.add("cake-wall-r");
    cell.innerHTML = '<span class="cake-furn"></span><span class="cake-thing"></span>';
    cell.addEventListener("click", () => onCakeCellClick(i));
    boardEl.appendChild(cell);
  }
  // Room names: one label per room in the top strip of a run of the
  // room's cells in one row - a strip furniture and placed things leave
  // free. Which run is picked once the text and cell size are known
  // (fitCakeLabels).
  const labels = document.createElement("div");
  labels.className = "cake-labels";
  labels.setAttribute("aria-hidden", "true");
  const rooms = Array.from(new Set(p.rooms)).sort((a, b) => a - b);
  rooms.forEach((room) => {
    const el = document.createElement("span");
    el.className = "cake-room-label";
    el.dataset.room = room;
    labels.appendChild(el);
  });
  boardEl.appendChild(labels);
  // The window hangs on the outer wall of its row, outside the board.
  const wrap = document.getElementById("cake-board-wrap");
  let win = document.getElementById("cake-window");
  if (!win) {
    win = document.createElement("span");
    win.id = "cake-window";
    win.className = "cake-window";
    wrap.appendChild(win);
  }
  win.innerHTML = CakeIcons.svg("window");
  win.className = "cake-window cake-window-" + p.window.side;
  win.style.top = (p.window.row * 100 / n) + "%";
  win.style.height = (100 / n) + "%";
  sizeCakeBoard();
  if (window.requestAnimationFrame) window.requestAnimationFrame(sizeCakeBoard);
  if (!buildCakeBoardDOM.resizeAttached) {
    buildCakeBoardDOM.resizeAttached = true;
    let timer = null;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(sizeCakeBoard, 150);
    });
  }
  buildCakePalette();
}

// Square cells by explicit pixel height (no CSS aspect-ratio on e-ink).
// The board also shrinks so that the info line, board, buttons and clues
// fit on one screen together where possible - on an e-reader every scroll
// is a page turn - but never below 48px cells.
function sizeCakeBoard() {
  const boardEl = document.getElementById("cake-board");
  const wrap = document.getElementById("cake-board-wrap");
  if (!boardEl || !wrap || !AppStateCake.puzzle) return;
  const n = AppStateCake.puzzle.n;
  wrap.style.maxWidth = "";
  const w = boardEl.getBoundingClientRect().width;
  if (!w) return;
  let side = w;
  const info = document.getElementById("board-info");
  const last = document.getElementById("cake-clues");
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  if (info && last && viewH) {
    // First choice: the whole page down to the last clue on one screen;
    // if that would make the cells too small, from the info line down.
    const boardH = boardEl.getBoundingClientRect().height;
    const scrollY = window.pageYOffset || 0;
    const lastBottom = last.getBoundingClientRect().bottom + scrollY;
    let room = viewH - (lastBottom - boardH) - 16;
    if (room < n * 60) room = viewH - (last.getBoundingClientRect().bottom - info.getBoundingClientRect().top - boardH) - 16;
    side = Math.min(w, Math.max(room, n * 48));
  }
  if (side < w) wrap.style.maxWidth = Math.floor(side + (wrap.offsetWidth - w)) + "px";
  // The board's frame is part of its height (border-box), so it is added
  // on top of the cells - otherwise the bottom row is cut off and the
  // room names, placed in percent, drift upwards.
  const frame = boardEl.offsetWidth - boardEl.clientWidth;
  const size = Math.floor((side - frame) / n);
  boardEl.querySelectorAll(".cake-cell").forEach((cell) => { cell.style.height = size + "px"; });
  boardEl.style.height = (size * n + frame) + "px";
  fitCakeLabels();
}

function buildCakePalette() {
  const p = AppStateCake.puzzle;
  const el = document.getElementById("cake-palette");
  el.innerHTML = "";
  const tools = [];
  for (let k = 0; k < p.n; k++) tools.push(k);
  tools.push("x");
  tools.forEach((tool) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary cake-pick";
    btn.setAttribute("data-i18n-attr", "");
    btn.dataset.tool = String(tool);
    const icon = tool === "x" ? "x" : (tool === p.n - 1 ? "cake" : CakeCore.ANIMALS[tool]);
    btn.innerHTML = CakeIcons.svg(icon, "cake-pick-icon") + '<span class="cake-pick-name"></span>';
    btn.addEventListener("click", () => {
      AppStateCake.tool = tool;
      renderCakePalette();
    });
    el.appendChild(btn);
  });
}

// Every run of one room's cells in a row, per room: longest first, then
// topmost, then leftmost.
function cakeLabelRuns(p) {
  const n = p.n, runs = {};
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      const room = p.rooms[r * n + c];
      let len = 1;
      while (c + len < n && p.rooms[r * n + c + len] === room) len++;
      (runs[room] = runs[room] || []).push({ row: r, col: c, len });
      c += len;
    }
  }
  Object.keys(runs).forEach((k) => runs[k].sort((a, b) => b.len - a.len || a.row - b.row || a.col - b.col));
  return runs;
}

function cakeThingAt(i) {
  return AppStateCake.placed.indexOf(i);
}

function renderCakeAll() {
  renderCakeBoard();
  renderCakePalette();
  renderCakeClues();
  renderCakeStatus();
  renderCakeMeta();
  const boardEl = document.getElementById("cake-board");
  if (boardEl) boardEl.setAttribute("aria-label", tCake("cake_board_label"));
  const win = document.getElementById("game-result");
  if (win && AppStateCake.gameOver) win.textContent = cakeWinText();
}

function renderCakeBoard() {
  const p = AppStateCake.puzzle;
  const n = p.n;
  document.querySelectorAll("#cake-board .cake-cell").forEach((cell) => {
    const i = parseInt(cell.dataset.index, 10);
    const r = Math.floor(i / n), c = i % n;
    const room = p.rooms[i];
    const roomName = tCake("cake_room_" + p.roomNames[room] + "_name");
    const f = p.furniture[i];
    cell.querySelector(".cake-furn").innerHTML = f ? CakeIcons.svg(f, "cake-furn-icon") : "";
    const k = cakeThingAt(i);
    const crossed = AppStateCake.crosses.indexOf(i) !== -1;
    const thing = cell.querySelector(".cake-thing");
    if (k >= 0) thing.innerHTML = CakeIcons.svg(k === n - 1 ? "cake" : CakeCore.ANIMALS[k], "cake-thing-icon");
    else if (crossed) thing.innerHTML = CakeIcons.svg("x", "cake-thing-icon cake-cross-icon");
    else thing.innerHTML = "";
    cell.classList.toggle("hint-cell", AppStateCake.hintCell === i);
    const parts = [tCake("cake_aria_cell", { R: r + 1, C: c + 1 }), roomName];
    if (f) parts.push(tCake("cake_furn_" + f + "_name"));
    if (r === p.window.row && ((p.window.side === "left" && c === 0) || (p.window.side === "right" && c === n - 1))) parts.push(tCake("cake_window_name"));
    if (k >= 0) parts.push(CakeCore.thingName(p, k, tCake));
    else if (crossed) parts.push(tCake("cake_tool_x"));
    if (AppStateCake.hintCell === i) parts.unshift(tCake("cake_aria_hint"));
    cell.setAttribute("aria-label", parts.join(", "));
  });
  fitCakeLabels();
}

// A room name is written out in full, on one line, at the normal size,
// on the first run of its cells that is wide enough. A room with no such
// run gets a number instead, and the legend under the board says which
// room the number stands for.
function fitCakeLabels() {
  const p = AppStateCake.puzzle;
  const legend = document.getElementById("cake-legend");
  if (!p) return;
  const n = p.n;
  const runs = cakeLabelRuns(p);
  const keyed = [];
  document.querySelectorAll("#cake-board .cake-room-label").forEach((el) => {
    const room = parseInt(el.dataset.room, 10);
    const name = tCake("cake_room_" + p.roomNames[room] + "_name");
    const place = (run) => {
      el.style.left = (run.col * 100 / n) + "%";
      el.style.top = (run.row * 100 / n) + "%";
      el.style.width = (run.len * 100 / n) + "%";
    };
    el.textContent = name;
    el.classList.remove("cake-room-key");
    const fits = runs[room].some((run) => {
      place(run);
      return el.scrollWidth <= el.clientWidth;
    });
    if (fits) return;
    place(runs[room][0]);
    keyed.push({ el, name });
  });
  // Numbers follow the board from top to bottom, left to right.
  keyed.sort((a, b) => parseFloat(a.el.style.top) - parseFloat(b.el.style.top) || parseFloat(a.el.style.left) - parseFloat(b.el.style.left));
  keyed.forEach((k, idx) => {
    k.el.textContent = String(idx + 1);
    k.el.classList.add("cake-room-key");
  });
  if (!legend) return;
  legend.innerHTML = "";
  keyed.forEach((k, idx) => {
    const item = document.createElement("span");
    item.className = "cake-legend-item";
    const key = document.createElement("b");
    key.textContent = String(idx + 1);
    item.appendChild(key);
    item.appendChild(document.createTextNode("\u00a0" + k.name));
    legend.appendChild(item);
  });
  legend.classList.toggle("hidden", !keyed.length);
}

function renderCakePalette() {
  const p = AppStateCake.puzzle;
  document.querySelectorAll("#cake-palette .cake-pick").forEach((btn) => {
    const tool = btn.dataset.tool === "x" ? "x" : parseInt(btn.dataset.tool, 10);
    const name = tool === "x" ? tCake("cake_tool_x") : CakeCore.thingName(p, tool, tCake);
    btn.querySelector(".cake-pick-name").textContent = tool === "x" ? "X" : name;
    btn.setAttribute("aria-label", name);
    const on = AppStateCake.tool === tool;
    btn.classList.toggle("cake-pick-selected", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function renderCakeClues() {
  const p = AppStateCake.puzzle;
  const list = document.getElementById("cake-clues");
  const heading = document.getElementById("cake-clues-title");
  if (heading) heading.textContent = tCake("cake_clues_title");
  list.innerHTML = "";
  p.clues.forEach((clue, idx) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cake-clue";
    btn.setAttribute("data-i18n-attr", "");
    const done = !!AppStateCake.cluesDone[idx];
    btn.classList.toggle("cake-clue-done", done);
    btn.setAttribute("aria-pressed", done ? "true" : "false");
    btn.textContent = CakeCore.clueText(p, clue, tCake);
    btn.addEventListener("click", () => {
      AppStateCake.cluesDone[idx] = !AppStateCake.cluesDone[idx];
      renderCakeClues();
      saveCakeGame();
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderCakeMeta() {
  const meta = document.getElementById("game-meta");
  const p = AppStateCake.puzzle;
  if (meta && p) meta.textContent = tCake("cake_meta_placed", { N: AppStateCake.placed.filter((x) => x >= 0).length, M: p.n });
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", AppStateCake.gameOver || !p);
}

/*** Moves ***/

function onCakeCellClick(i) {
  if (AppStateCake.gameOver || !AppStateCake.puzzle) return;
  AppStateCake.hintCell = -1;
  const tool = AppStateCake.tool;
  const placed = AppStateCake.placed;
  const crossAt = AppStateCake.crosses.indexOf(i);
  if (tool === "x") {
    if (crossAt !== -1) AppStateCake.crosses.splice(crossAt, 1);
    else {
      const k = cakeThingAt(i);
      if (k >= 0) placed[k] = -1;
      AppStateCake.crosses.push(i);
    }
  } else if (placed[tool] === i) {
    placed[tool] = -1;
  } else {
    const k = cakeThingAt(i);
    if (k >= 0) placed[k] = -1;
    if (crossAt !== -1) AppStateCake.crosses.splice(crossAt, 1);
    placed[tool] = i;
  }
  afterCakeMove();
}

function afterCakeMove() {
  const p = AppStateCake.puzzle;
  // Solved as soon as the cake is on its cell; the rest is then shown.
  if (AppStateCake.placed[p.n - 1] === p.solution[p.n - 1]) {
    AppStateCake.gameOver = true;
    AppStateCake.placed = p.solution.slice();
    AppStateCake.crosses = [];
    AppStateCake.hintCell = -1;
    renderCakeAll();
    const text = cakeWinText();
    const result = document.getElementById("game-result");
    if (result) result.textContent = text;
    setCakeStatus(null);
    const el = document.getElementById("board-info");
    if (el) el.textContent = text;
    if (typeof GameStats !== "undefined") GameStats.record("cake", "win", { hinted: AppStateCake.hinted });
    if (window.ResultModal) window.ResultModal.show(tCake("cake_win_title"), text);
    clearSavedCakeGame();
    return;
  }
  renderCakeAll();
  saveCakeGame();
}

/*** Hint (CakeCore.findHint) ***/

// Like Sudoku's hint, a mistake is shown first; otherwise one correct
// thing is set and its cell marked.
function hintCake() {
  const p = AppStateCake.puzzle;
  if (!p || AppStateCake.gameOver) return;
  AppStateCake.hinted = true;
  const h = CakeCore.findHint(p, AppStateCake.placed, AppStateCake.crosses);
  const n = p.n;
  if (h.kind === "wrong") {
    AppStateCake.hintCell = h.cell;
    setCakeStatus("cake_hint_wrong");
    renderCakeAll();
  } else if (h.kind === "wrongx") {
    AppStateCake.hintCell = h.cell;
    setCakeStatus("cake_hint_wrongx");
    renderCakeAll();
  } else if (h.kind === "last") {
    AppStateCake.hintCell = -1;
    setCakeStatus("cake_hint_last");
    renderCakeAll();
  } else if (h.kind === "step") {
    const k = cakeThingAt(h.cell);
    if (k >= 0) AppStateCake.placed[k] = -1;
    const crossAt = AppStateCake.crosses.indexOf(h.cell);
    if (crossAt !== -1) AppStateCake.crosses.splice(crossAt, 1);
    AppStateCake.placed[h.thing] = h.cell;
    AppStateCake.hintCell = h.cell;
    setCakeStatus("cake_hint_step", { thing: h.thing, R: Math.floor(h.cell / n) + 1, C: h.cell % n + 1 });
    afterCakeMove();
    return;
  }
  saveCakeGame();
}

document.addEventListener("DOMContentLoaded", initCakeApp);
