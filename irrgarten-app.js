// irrgarten-app.js
// Wires IrrgartenCore ("Irrgarten", en "Maze", task 170) to irrgarten.html.
//
// The board is one square svg: the walls (one path, drawn once per game),
// the walked way (one polyline), a black circle where you are, a flag at the
// goal and the hint (a group of small rings). A move only changes the line,
// the circle and the hint - the board is never built again for a move (no
// flicker on e-ink, see task 169). Nothing is animated, no timer.
//
// Two ways of playing (setting, remembered; tap is the default):
// - Tapping: tap a cell next to you, or further along a straight, open
//   passage; a tap on a cell of your way goes back to it.
// - Drawing: the finger draws the way; the circle follows from cell to cell
//   (up to three cells at once round a corner). Taps work as well.
// "Back" (#ig-back, "Zurück" as task 170 asks, not the shared "Undo" label:
// it steps back along the way) takes one cell back, "Hint" shows the next three cells of the right
// way (also out of a dead end).
//
// Task 174: start and goal lie anywhere (from the maze). Mode "Several
// figures" (setting #ig-mode, remembered): 2 or 3 figures - child (filled
// circle) to school, dog (filled square) to kennel, cat (filled triangle)
// to basket; each goal is the same shape drawn open, so black and white
// tell them apart by form. Each figure has its own line (solid, dashed,
// dotted). Tap a figure on the board or its button under the board
// (#ig-figs) to choose it; the chosen one gets a ring. A move changes only
// the lines, the figures' shapes, the ring and the buttons' marks.

const IRRGARTEN_SAVE_KEY = "einkchess_save_irrgarten";
const IG_LAST_KEY = "papergames_irrgarten_last";
const IG_INPUT_KEY = "papergames_irrgarten_input";
const IG_MODE_KEY = "papergames_irrgarten_mode";
// Figure f: shape, line dash (in cell widths), name and goal keys.
const IG_FIGS = [
  { shape: "circle", dash: "", name: "ig_fig_0", goal: "ig_goal_0" },
  { shape: "square", dash: "0.5 0.35", name: "ig_fig_1", goal: "ig_goal_1" },
  { shape: "triangle", dash: "0.04 0.35", name: "ig_fig_2", goal: "ig_goal_2" }
];

const AppStateIG = {
  state: null,
  hint: false,
  hints: 0,
  note: "",
  input: "tap",
  cell: 0,     // cell size in svg pixels of the last drawing
  width: 0,    // board width of the last drawing (resize only redraws on a change)
  drag: null,
  skipClick: 0
};

function tIG(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function textIG(el, text) {
  if (el && el.textContent !== text) el.textContent = text;
}

/*** Save and load ***/

function saveIG() {
  if (typeof GameStorage === "undefined" || !AppStateIG.state) return;
  if (AppStateIG.state.solved) { GameStorage.clear(IRRGARTEN_SAVE_KEY); return; }
  GameStorage.save(IRRGARTEN_SAVE_KEY, { state: AppStateIG.state, hints: AppStateIG.hints });
}

// The maze after the last one played at this level and mode (a circle of five).
function nextMazeIG(level, mode) {
  let last = {};
  try { last = JSON.parse(window.localStorage.getItem(IG_LAST_KEY) || "{}") || {}; } catch (e) { last = {}; }
  const key = mode === "multi" ? level + ":multi" : level;
  const k = Number.isInteger(last[key]) ? IrrgartenCore.nextMaze(last[key]) : 0;
  last[key] = k;
  try { window.localStorage.setItem(IG_LAST_KEY, JSON.stringify(last)); } catch (e) { /* the same maze may come again */ }
  return k;
}

function loadInputIG() {
  let v = "";
  try { v = window.localStorage.getItem(IG_INPUT_KEY) || ""; } catch (e) { v = ""; }
  return v === "drag" ? "drag" : "tap";
}

function setInputIG(v) {
  AppStateIG.input = v === "drag" ? "drag" : "tap";
  try { window.localStorage.setItem(IG_INPUT_KEY, AppStateIG.input); } catch (e) { /* only for this visit */ }
  const sel = document.getElementById("ig-input");
  if (sel) sel.value = AppStateIG.input;
  const board = document.getElementById("ig-board");
  if (board) board.classList.toggle("ig-drag-mode", AppStateIG.input === "drag");
  if (AppStateIG.state) renderInfoIG();
}

function loadModeIG() {
  let v = "";
  try { v = window.localStorage.getItem(IG_MODE_KEY) || ""; } catch (e) { v = ""; }
  return v === "multi" ? "multi" : "one";
}

function setModeIG(v) {
  const mode = v === "multi" ? "multi" : "one";
  try { window.localStorage.setItem(IG_MODE_KEY, mode); } catch (e) { /* only for this visit */ }
  const sel = document.getElementById("ig-mode");
  if (sel) sel.value = mode;
}

/*** Game flow ***/

function startIG() {
  const level = document.getElementById("ig-level").value;
  const lv = IrrgartenCore.LEVELS.indexOf(level) >= 0 ? level : "easy";
  const modeSel = document.getElementById("ig-mode");
  const mode = modeSel && modeSel.value === "multi" ? "multi" : "one";
  setModeIG(mode);
  AppStateIG.state = IrrgartenCore.newGame(lv, nextMazeIG(lv, mode), mode);
  AppStateIG.hint = false;
  AppStateIG.hints = 0;
  AppStateIG.note = "";
  setResultIG("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardIG();
  renderIG();
  saveIG();
}

function showBoardIG() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const panel = document.getElementById("settings-panel");
  const toggle = document.getElementById("menu-toggle");
  if (panel) panel.classList.add("hidden");
  if (toggle) I18n.setKey(toggle, "menu_toggle");
}

// Applies a result of IrrgartenCore.tap / drawTo / undo.
function applyIG(r) {
  const s = AppStateIG.state;
  if (r.ok) {
    const before = s.sel;
    AppStateIG.state = r.state;
    AppStateIG.note = "";
    AppStateIG.hint = false;
    if (s.mode === "multi" && !r.state.solved) {
      // Who has just arrived, or who is chosen now.
      if (IrrgartenCore.arrived(r.state, before) && !IrrgartenCore.arrived(s, before)) AppStateIG.note = tIG("ig_fig_home", { fig: I18n.t(IG_FIGS[before].name), goal: I18n.t(IG_FIGS[before].goal) });
      else if (r.reason === "select") AppStateIG.note = tIG("ig_fig_chosen", { fig: I18n.t(IG_FIGS[r.state.sel].name), goal: I18n.t(IG_FIGS[r.state.sel].goal) });
    }
    updateWayIG();
    if (r.state.solved) finishIG();
    saveIG();
  } else if (r.reason === "wall" || r.reason === "far") {
    AppStateIG.note = I18n.t(r.reason === "wall" ? "ig_wall" : "ig_far");
    renderInfoIG();
  } else if (r.reason === "home") {
    AppStateIG.note = tIG("ig_fig_is_home", { fig: I18n.t(IG_FIGS[s.sel].name) });
    renderInfoIG();
  }
  return s !== AppStateIG.state;
}

function tapCellIG(c) {
  const s = AppStateIG.state;
  if (!s || s.solved) return;
  applyIG(IrrgartenCore.tap(s, c));
}

function selectFigIG(f) {
  const s = AppStateIG.state;
  if (!s || s.solved || s.mode !== "multi" || f === s.sel) return;
  applyIG({ ok: true, reason: "select", state: IrrgartenCore.select(s, f) });
}

function undoIG() {
  const s = AppStateIG.state;
  if (!s || IrrgartenCore.path(s).length < 2) return;
  applyIG({ ok: true, state: IrrgartenCore.undo(s) });
  setResultIG("");
  if (window.ResultModal) window.ResultModal.hide();
}

function hintIG() {
  const s = AppStateIG.state;
  if (!s || s.solved) return;
  AppStateIG.hint = true;
  AppStateIG.hints++;
  AppStateIG.note = I18n.t("ig_hint_text");
  drawHintIG();
  renderInfoIG();
  saveIG();
}

function finishIG() {
  const text = I18n.t(AppStateIG.state.mode === "multi" ? "ig_done_multi" : "ig_done");
  setResultIG(text);
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("irrgarten", "win", { hinted: AppStateIG.hints > 0 });
}

/*** Display ***/

function setStatusIG(text) {
  const el = document.getElementById("board-info");
  if (el) { if (el.hasAttribute("data-i18n")) el.removeAttribute("data-i18n"); textIG(el, text || ""); }
}

function setResultIG(text) {
  const el = document.getElementById("game-result");
  if (el) { if (el.hasAttribute("data-i18n")) el.removeAttribute("data-i18n"); textIG(el, text || ""); }
}

function f2IG(x) {
  return (Math.round(x * 100) / 100).toString();
}

// Centre of a cell in svg pixels.
function centreIG(c) {
  const n = IrrgartenCore.mazeOf(AppStateIG.state).n;
  const x = c % n, y = (c - x) / n;
  const z = AppStateIG.cell;
  return [(x + 0.5) * z, (y + 0.5) * z];
}

// The walls as one path: the outer frame plus the closed east and south
// sides of every cell.
function wallsIG(m, z) {
  const n = m.n;
  let d = "M0 0H" + f2IG(n * z) + "V" + f2IG(n * z) + "H0Z";
  for (let c = 0; c < n * n; c++) {
    const x = c % n, y = (c - x) / n;
    if (x < n - 1 && !(m.open[c] & IrrgartenCore.E)) d += "M" + f2IG((x + 1) * z) + " " + f2IG(y * z) + "V" + f2IG((y + 1) * z);
    if (y < n - 1 && !(m.open[c] & IrrgartenCore.S)) d += "M" + f2IG(x * z) + " " + f2IG((y + 1) * z) + "H" + f2IG((x + 1) * z);
  }
  return d;
}

function boardHtmlIG() {
  const s = AppStateIG.state;
  const m = IrrgartenCore.mazeOf(s);
  const z = AppStateIG.cell;
  const side = m.n * z;
  const wall = Math.max(2, Math.min(5, z * 0.1));
  const pad = wall / 2;
  let html = '<svg viewBox="' + f2IG(-pad) + " " + f2IG(-pad) + " " + f2IG(side + wall) + " " + f2IG(side + wall) + '" width="100%" height="100%" role="img" aria-label="' + tIG("ig_board_aria", { n: m.n }) + '" focusable="false">';
  html += '<rect x="' + f2IG(-pad) + '" y="' + f2IG(-pad) + '" width="' + f2IG(side + wall) + '" height="' + f2IG(side + wall) + '" fill="#fff"/>';
  const line = f2IG(Math.max(1.5, z * 0.06));
  const multi = s.mode === "multi";
  if (multi) {
    // Goals: the figure's shape drawn open (school, kennel, basket).
    m.goals.forEach((c, f) => {
      const p = centreIG(c);
      html += shapeIG(IG_FIGS[f].shape, p[0], p[1], z * 0.36, false, line);
    });
  } else {
    // Start: an open ring; goal: a small flag.
    const st = centreIG(m.start), gl = centreIG(m.goal);
    html += '<circle cx="' + f2IG(st[0]) + '" cy="' + f2IG(st[1]) + '" r="' + f2IG(z * 0.32) + '" fill="none" stroke="#141413" stroke-width="' + line + '"/>';
    const fx = gl[0] - z * 0.15, fy = gl[1] + z * 0.3;
    html += '<path d="M' + f2IG(fx) + " " + f2IG(fy) + "V" + f2IG(gl[1] - z * 0.32) + "L" + f2IG(fx + z * 0.38) + " " + f2IG(gl[1] - z * 0.18) + "L" + f2IG(fx) + " " + f2IG(gl[1] - z * 0.04) + '" fill="#141413" stroke="#141413" stroke-width="' + line + '" stroke-linejoin="round"/>';
  }
  html += '<path d="' + wallsIG(m, z) + '" fill="none" stroke="#141413" stroke-width="' + f2IG(wall) + '" stroke-linecap="square"/>';
  html += '<g id="ig-hint"></g>';
  // One line per figure: solid, dashed, dotted.
  const width = Math.max(2, z * (multi ? 0.14 : 0.22));
  s.paths.forEach((_, f) => {
    const dash = multi && IG_FIGS[f].dash ? ' stroke-dasharray="' + IG_FIGS[f].dash.split(" ").map((x) => f2IG(Number(x) * z)).join(" ") + '"' : "";
    html += '<polyline id="ig-way' + (f ? "-" + f : "") + '" points="" fill="none" stroke="#141413" stroke-width="' + f2IG(width) + '"' + dash + ' stroke-linejoin="round" stroke-linecap="round"/>';
  });
  if (multi) {
    html += '<circle id="ig-sel" cx="0" cy="0" r="' + f2IG(z * 0.47) + '" fill="none" stroke="#141413" stroke-width="' + line + '"/>';
    // Each figure drawn once at (0, 0) and moved by its transform.
    s.paths.forEach((_, f) => { html += '<g id="ig-fig-' + f + '">' + shapeIG(IG_FIGS[f].shape, 0, 0, z * 0.3, true, 0) + "</g>"; });
  } else {
    const st = centreIG(m.start);
    html += '<circle id="ig-me" cx="' + f2IG(st[0]) + '" cy="' + f2IG(st[1]) + '" r="' + f2IG(Math.max(3, z * 0.3)) + '" fill="#141413"/>';
  }
  return html + "</svg>";
}

// A figure's shape at (x, y): filled (the figure) or open (its goal).
function shapeIG(shape, x, y, r, filled, line) {
  const paint = filled ? 'fill="#141413"' : 'fill="#fff" stroke="#141413" stroke-width="' + line + '"';
  if (shape === "square") return '<rect x="' + f2IG(x - r * 0.85) + '" y="' + f2IG(y - r * 0.85) + '" width="' + f2IG(r * 1.7) + '" height="' + f2IG(r * 1.7) + '" ' + paint + "/>";
  if (shape === "triangle") return '<path d="M' + f2IG(x) + " " + f2IG(y - r) + "L" + f2IG(x + r) + " " + f2IG(y + r * 0.8) + "H" + f2IG(x - r) + 'Z" ' + paint + ' stroke-linejoin="round"/>';
  return '<circle cx="' + f2IG(x) + '" cy="' + f2IG(y) + '" r="' + f2IG(r * 0.9) + '" ' + paint + "/>";
}

// After a move: only the lines, the figures, the ring and the hint change.
function updateWayIG() {
  const s = AppStateIG.state;
  const multi = s.mode === "multi";
  const me = document.getElementById(multi ? "ig-sel" : "ig-me");
  if (!me || !document.getElementById("ig-way")) { renderIG(); return; }
  s.paths.forEach((path, f) => {
    const way = document.getElementById("ig-way" + (f ? "-" + f : ""));
    if (!way) return;
    const pts = path.length > 1 ? path.map((c) => { const p = centreIG(c); return f2IG(p[0]) + "," + f2IG(p[1]); }).join(" ") : "";
    if (way.getAttribute("points") !== pts) way.setAttribute("points", pts);
    if (multi) {
      const g = document.getElementById("ig-fig-" + f);
      const p = centreIG(IrrgartenCore.last(s, f));
      const move = "translate(" + f2IG(p[0]) + " " + f2IG(p[1]) + ")";
      if (g && g.getAttribute("transform") !== move) g.setAttribute("transform", move);
    }
  });
  const p = centreIG(IrrgartenCore.last(s));
  if (me.getAttribute("cx") !== f2IG(p[0])) me.setAttribute("cx", f2IG(p[0]));
  if (me.getAttribute("cy") !== f2IG(p[1])) me.setAttribute("cy", f2IG(p[1]));
  drawHintIG();
  renderFigsIG();
  renderInfoIG();
}

// The buttons under the board in "multi": one per figure, with its shape,
// "child -> school" and a tick once it has arrived; the chosen one pressed.
function renderFigsIG() {
  const box = document.getElementById("ig-figs");
  if (!box) return;
  const s = AppStateIG.state;
  const multi = !!s && s.mode === "multi";
  if (box.classList.contains("hidden") === multi) box.classList.toggle("hidden", !multi);
  if (!multi) { if (box.firstChild) box.innerHTML = ""; return; }
  if (box.children.length !== s.paths.length) {
    box.innerHTML = s.paths.map((_, f) => '<button type="button" class="secondary small ig-fig-btn" data-fig="' + f + '"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">' + shapeIG(IG_FIGS[f].shape, 10, 10, 8, true, 0) + "</svg><span></span></button>").join("");
    Array.from(box.children).forEach((b) => b.addEventListener("click", () => selectFigIG(Number(b.getAttribute("data-fig")))));
  }
  Array.from(box.children).forEach((b, f) => {
    const home = IrrgartenCore.arrived(s, f);
    textIG(b.querySelector("span"), tIG("ig_fig_line", { fig: I18n.t(IG_FIGS[f].name), goal: I18n.t(IG_FIGS[f].goal) }) + (home ? " ✓" : ""));
    const pressed = String(f === s.sel);
    if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
  });
}

function drawHintIG() {
  const g = document.getElementById("ig-hint");
  if (!g) return;
  const s = AppStateIG.state;
  if (!AppStateIG.hint || s.solved) { if (g.firstChild) g.innerHTML = ""; return; }
  const r = Math.max(3, AppStateIG.cell * 0.2);
  g.innerHTML = IrrgartenCore.hint(s, 3).map((c) => { const p = centreIG(c); return '<circle cx="' + f2IG(p[0]) + '" cy="' + f2IG(p[1]) + '" r="' + f2IG(r) + '" fill="none" stroke="#141413" stroke-width="2" stroke-dasharray="3 2"/>'; }).join("");
}

function renderIG() {
  const s = AppStateIG.state;
  if (!s) return;
  const wrap = document.getElementById("ig-board");
  // Square also where aspect-ratio is unknown (older e-reader browsers).
  wrap.style.height = wrap.offsetWidth + "px";
  AppStateIG.width = wrap.clientWidth;
  const n = IrrgartenCore.mazeOf(s).n;
  AppStateIG.cell = Math.max(200, wrap.clientWidth || 320) / n;
  wrap.innerHTML = boardHtmlIG();
  updateWayIG();
}

function renderInfoIG() {
  const s = AppStateIG.state;
  const n = IrrgartenCore.mazeOf(s).n;
  const multi = s.mode === "multi";
  textIG(document.getElementById("game-meta"), tIG("ig_meta", { k: s.k + 1, m: IrrgartenCore.COUNT, n: n }) + " · " + I18n.t("ig_level_" + s.level) + (multi ? " · " + I18n.t("ig_mode_multi") : ""));
  const goalLine = document.querySelector("#board-section .goal-line");
  const goalKey = multi ? "ig_goal_line_multi" : "ig_goal_line";
  if (goalLine && goalLine.getAttribute("data-i18n") !== goalKey) I18n.setKey(goalLine, goalKey);
  const short = IrrgartenCore.path(s).length < 2;
  const undo = document.getElementById("ig-back");
  if (undo.disabled !== short) undo.disabled = short;
  const hint = document.getElementById("hint-btn");
  if (hint.disabled !== !!s.solved) hint.disabled = !!s.solved;
  if (s.solved) setStatusIG(I18n.t(multi ? "ig_done_multi" : "ig_done"));
  else if (multi) setStatusIG(AppStateIG.note || tIG("ig_status_multi", { fig: I18n.t(IG_FIGS[s.sel].name), goal: I18n.t(IG_FIGS[s.sel].goal) }));
  else setStatusIG(AppStateIG.note || I18n.t(AppStateIG.input === "drag" ? "ig_status_drag" : "ig_status_tap"));
}

/*** Taps and drawing ***/

// The cell under a screen point, or -1.
function cellAtIG(clientX, clientY) {
  const svg = document.querySelector("#ig-board svg");
  if (!svg || !svg.getScreenCTM() || !AppStateIG.state) return -1;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  const n = IrrgartenCore.mazeOf(AppStateIG.state).n;
  const x = Math.floor(q.x / AppStateIG.cell), y = Math.floor(q.y / AppStateIG.cell);
  return x >= 0 && y >= 0 && x < n && y < n ? y * n + x : -1;
}

function dragStartIG(clientX, clientY) {
  if (AppStateIG.input !== "drag" || !AppStateIG.state || AppStateIG.state.solved) return false;
  // A finger put down on another figure chooses it and then draws its way.
  const other = IrrgartenCore.figureAt(AppStateIG.state, cellAtIG(clientX, clientY));
  if (other >= 0) applyIG({ ok: true, reason: "select", state: IrrgartenCore.select(AppStateIG.state, other) });
  AppStateIG.drag = { x: clientX, y: clientY, moved: false, joined: other >= 0 };
  dragMoveIG(clientX, clientY);
  return true;
}

// The finger over a cell: the circle follows when the way there is short;
// further cells and walls are passed over without a message.
function dragMoveIG(clientX, clientY) {
  const d = AppStateIG.drag;
  const s = AppStateIG.state;
  if (!d || !s || s.solved) return;
  if (Math.abs(clientX - d.x) > 8 || Math.abs(clientY - d.y) > 8) d.moved = true;
  const c = cellAtIG(clientX, clientY);
  if (c < 0 || c === IrrgartenCore.last(s)) return;
  const r = IrrgartenCore.drawTo(s, c);
  if (r.ok) { d.joined = true; applyIG(r); }
}

function dragEndIG() {
  const d = AppStateIG.drag;
  AppStateIG.drag = null;
  if (d && (d.moved || d.joined)) AppStateIG.skipClick = Date.now();
}

function initIrrgartenApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-ig-game").addEventListener("click", startIG);
  document.getElementById("ig-back").addEventListener("click", undoIG);
  document.getElementById("hint-btn").addEventListener("click", hintIG);
  const board = document.getElementById("ig-board");
  board.addEventListener("click", (e) => {
    if (!AppStateIG.state || AppStateIG.state.solved) return;
    if (AppStateIG.skipClick && Date.now() - AppStateIG.skipClick < 600) { AppStateIG.skipClick = 0; return; }
    const c = cellAtIG(e.clientX, e.clientY);
    if (c >= 0) tapCellIG(c);
  });
  // Drawing: pointer events where there are, touch events else (older
  // e-reader browsers).
  if (window.PointerEvent) {
    board.addEventListener("pointerdown", (e) => {
      if (e.button > 0 || !dragStartIG(e.clientX, e.clientY)) return;
      if (board.setPointerCapture) { try { board.setPointerCapture(e.pointerId); } catch (err) { /* moves outside the board are lost */ } }
    });
    board.addEventListener("pointermove", (e) => { if (AppStateIG.drag) { e.preventDefault(); dragMoveIG(e.clientX, e.clientY); } });
    board.addEventListener("pointerup", dragEndIG);
    board.addEventListener("pointercancel", dragEndIG);
  } else {
    const at = (e) => e.touches && e.touches[0] ? e.touches[0] : null;
    board.addEventListener("touchstart", (e) => { const t = at(e); if (t) dragStartIG(t.clientX, t.clientY); }, { passive: true });
    board.addEventListener("touchmove", (e) => { const t = at(e); if (t && AppStateIG.drag) { e.preventDefault(); dragMoveIG(t.clientX, t.clientY); } }, { passive: false });
    board.addEventListener("touchend", dragEndIG);
    board.addEventListener("touchcancel", dragEndIG);
  }
  const inputSel = document.getElementById("ig-input");
  if (inputSel) inputSel.addEventListener("change", () => setInputIG(inputSel.value));
  setInputIG(loadInputIG());
  const modeSel = document.getElementById("ig-mode");
  if (modeSel) modeSel.addEventListener("change", () => setModeIG(modeSel.value));
  setModeIG(loadModeIG());
  const S = '<svg class="howto-svg" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true" focusable="false">';
  const walls = '<path d="M4 4H56V56H4Z M22 4V38 M40 22V56" fill="none" stroke="#141413" stroke-width="3"/>';
  const flag = '<path d="M46 52V36L54 40L46 44" fill="#141413" stroke="#141413" stroke-width="2" stroke-linejoin="round"/>';
  Howto.init({ slug: "irrgarten", actions: ["ig-board"], steps: [
    { pics: S + walls + '<circle cx="13" cy="13" r="6" fill="#141413"/>' + flag + "</svg>", key: "ig_howto_1" },
    { pics: S + walls + '<polyline points="13,13 13,48 31,48 31,13" fill="none" stroke="#141413" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="13" r="6" fill="#141413"/>' + flag + "</svg>", key: "ig_howto_2" },
    { pics: S + walls + '<circle cx="13" cy="13" r="6" fill="#141413"/><path d="M26 10L36 20M36 10L26 20" stroke="#141413" stroke-width="3" stroke-linecap="round"/></svg>', key: "ig_howto_3" },
    { pics: S + walls + '<polyline points="13,13 13,48 31,48 31,13 48,13 48,44" fill="none" stroke="#141413" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' + flag + "</svg>", key: "ig_howto_4" }
  ] });
  // Only a new board width draws again (the phone sends "resize" when its
  // address bar comes or goes).
  window.addEventListener("resize", () => {
    const w = document.getElementById("ig-board").clientWidth;
    if (AppStateIG.state && w !== AppStateIG.width) renderIG();
  });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateIG.state) renderIG(); });
  // An old save (rules 1, before task 174) does not fit the new mazes: dropped.
  const old = typeof GameStorage !== "undefined" ? GameStorage.load(IRRGARTEN_SAVE_KEY) : null;
  if (old && !IrrgartenCore.valid(old.state)) GameStorage.clear(IRRGARTEN_SAVE_KEY);
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(IRRGARTEN_SAVE_KEY) : null;
  if (saved && IrrgartenCore.valid(saved.state) && !saved.state.solved) {
    AppStateIG.state = saved.state;
    AppStateIG.hints = saved.hints || 0;
    document.getElementById("ig-level").value = saved.state.level;
    setModeIG(saved.state.mode);
    showBoardIG();
    renderIG();
  }
}

document.addEventListener("DOMContentLoaded", initIrrgartenApp);
