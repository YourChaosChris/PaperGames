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

const IRRGARTEN_SAVE_KEY = "einkchess_save_irrgarten";
const IG_LAST_KEY = "papergames_irrgarten_last";
const IG_INPUT_KEY = "papergames_irrgarten_input";

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

// The maze after the last one played at this level (a circle of five).
function nextMazeIG(level) {
  let last = {};
  try { last = JSON.parse(window.localStorage.getItem(IG_LAST_KEY) || "{}") || {}; } catch (e) { last = {}; }
  const k = Number.isInteger(last[level]) ? IrrgartenCore.nextMaze(last[level]) : 0;
  last[level] = k;
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

/*** Game flow ***/

function startIG() {
  const level = document.getElementById("ig-level").value;
  const lv = IrrgartenCore.LEVELS.indexOf(level) >= 0 ? level : "easy";
  AppStateIG.state = IrrgartenCore.newGame(lv, nextMazeIG(lv));
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
    AppStateIG.state = r.state;
    AppStateIG.note = "";
    AppStateIG.hint = false;
    updateWayIG();
    if (r.state.solved) finishIG();
    saveIG();
  } else if (r.reason === "wall" || r.reason === "far") {
    AppStateIG.note = I18n.t(r.reason === "wall" ? "ig_wall" : "ig_far");
    renderInfoIG();
  }
  return s !== AppStateIG.state;
}

function tapCellIG(c) {
  const s = AppStateIG.state;
  if (!s || s.solved) return;
  applyIG(IrrgartenCore.tap(s, c));
}

function undoIG() {
  const s = AppStateIG.state;
  if (!s || s.path.length < 2) return;
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
  const text = I18n.t("ig_done");
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
  // Start: an open ring; goal: a small flag.
  const st = centreIG(m.start), gl = centreIG(m.goal);
  html += '<circle cx="' + f2IG(st[0]) + '" cy="' + f2IG(st[1]) + '" r="' + f2IG(z * 0.32) + '" fill="none" stroke="#141413" stroke-width="' + f2IG(Math.max(1.5, z * 0.06)) + '"/>';
  const fx = gl[0] - z * 0.15, fy = gl[1] + z * 0.3;
  html += '<path d="M' + f2IG(fx) + " " + f2IG(fy) + "V" + f2IG(gl[1] - z * 0.32) + "L" + f2IG(fx + z * 0.38) + " " + f2IG(gl[1] - z * 0.18) + "L" + f2IG(fx) + " " + f2IG(gl[1] - z * 0.04) + '" fill="#141413" stroke="#141413" stroke-width="' + f2IG(Math.max(1.5, z * 0.06)) + '" stroke-linejoin="round"/>';
  html += '<path d="' + wallsIG(m, z) + '" fill="none" stroke="#141413" stroke-width="' + f2IG(wall) + '" stroke-linecap="square"/>';
  html += '<g id="ig-hint"></g>';
  html += '<polyline id="ig-way" points="" fill="none" stroke="#141413" stroke-width="' + f2IG(Math.max(2, z * 0.22)) + '" stroke-linejoin="round" stroke-linecap="round"/>';
  html += '<circle id="ig-me" cx="' + f2IG(st[0]) + '" cy="' + f2IG(st[1]) + '" r="' + f2IG(Math.max(3, z * 0.3)) + '" fill="#141413"/>';
  return html + "</svg>";
}

// After a move: only the line, the circle and the hint change.
function updateWayIG() {
  const s = AppStateIG.state;
  const way = document.getElementById("ig-way");
  const me = document.getElementById("ig-me");
  if (!way || !me) { renderIG(); return; }
  const pts = s.path.length > 1 ? s.path.map((c) => { const p = centreIG(c); return f2IG(p[0]) + "," + f2IG(p[1]); }).join(" ") : "";
  if (way.getAttribute("points") !== pts) way.setAttribute("points", pts);
  const p = centreIG(IrrgartenCore.last(s));
  me.setAttribute("cx", f2IG(p[0]));
  me.setAttribute("cy", f2IG(p[1]));
  drawHintIG();
  renderInfoIG();
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
  textIG(document.getElementById("game-meta"), tIG("ig_meta", { k: s.k + 1, m: IrrgartenCore.COUNT, n: n }) + " · " + I18n.t("ig_level_" + s.level));
  const undo = document.getElementById("ig-back");
  if (undo.disabled !== s.path.length < 2) undo.disabled = s.path.length < 2;
  const hint = document.getElementById("hint-btn");
  if (hint.disabled !== !!s.solved) hint.disabled = !!s.solved;
  if (s.solved) setStatusIG(I18n.t("ig_done"));
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
  AppStateIG.drag = { x: clientX, y: clientY, moved: false, joined: false };
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
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(IRRGARTEN_SAVE_KEY) : null;
  if (saved && IrrgartenCore.valid(saved.state) && !saved.state.solved) {
    AppStateIG.state = saved.state;
    AppStateIG.hints = saved.hints || 0;
    document.getElementById("ig-level").value = saved.state.level;
    showBoardIG();
    renderIG();
  }
}

document.addEventListener("DOMContentLoaded", initIrrgartenApp);
