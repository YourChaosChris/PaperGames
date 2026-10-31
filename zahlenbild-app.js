// zahlenbild-app.js
// Wires ZahlenbildCore ("Zahlenbild", en "Dot Picture") to zahlenbild.html.
//
// The board is one square svg with the numbered dots of a picture. Tap dot
// 1, then 2, then 3 ...; a line joins each dot to the one before. A wrong dot
// changes nothing; the status line names the dot that was tapped and the one
// being looked for. After the last dot the line closes back to dot 1 and the
// finished picture shows with its name (and its small extra lines).
//
// Task 169 (no flicker, closer dots): the board shows the whole picture at
// one fixed scale for the whole game (from medium on fitted to the board, the
// numbers as large as they fit without covering each other). A tap does not
// build the board again: the dot turns black, the line grows by one piece,
// the next number turns bold - nothing moves, the scale never changes.
// "Magnify" (only on request, remembered) draws the closest dots 30 px apart
// in a fixed part around the next dot; the part only moves with "Go to the
// next dot". A tap counts for the dot being looked for when it is one of the
// two dots closest to the tap within 22 px. Nothing is animated, no timer.
// Undo takes back dots, the hint gives the next dot a double ring.

const ZAHLENBILD_SAVE_KEY = "einkchess_save_zahlenbild";
const ZB_LAST_KEY = "papergames_zahlenbild_last";
const ZB_HIT_PX = 22;
const ZB_MIN = -4;
const ZB_SPAN = 108;

const AppStateZB = {
  state: null,
  magnify: null, // centre {x, y} (board units) of the fixed magnified part, or null: whole picture
  hint: false,   // the next dot has a double ring
  hints: 0,
  note: "",      // the last message (wrong dot), until the next tap
  view: null     // the part of the board drawn (see viewZB), for taps
};

function tZB(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function dotsZB() {
  const s = AppStateZB.state;
  return ZahlenbildCore.dotsOf(s.level, s.motif);
}

/*** Save and load ***/

function saveZB() {
  if (typeof GameStorage === "undefined" || !AppStateZB.state) return;
  if (AppStateZB.state.solved) { GameStorage.clear(ZAHLENBILD_SAVE_KEY); return; }
  GameStorage.save(ZAHLENBILD_SAVE_KEY, { state: AppStateZB.state, magnify: AppStateZB.magnify, hints: AppStateZB.hints });
}

// The picture after the last one played at this level (a circle of five).
function nextMotifZB(level) {
  let last = {};
  try { last = JSON.parse(window.localStorage.getItem(ZB_LAST_KEY) || "{}") || {}; } catch (e) { last = {}; }
  const id = last[level] ? ZahlenbildCore.nextMotif(level, last[level]) : ZahlenbildCore.MOTIFS[level][0].id;
  last[level] = id;
  try { window.localStorage.setItem(ZB_LAST_KEY, JSON.stringify(last)); } catch (e) { /* the same picture may come again */ }
  return id;
}

/*** Game flow ***/

function startZB() {
  const level = document.getElementById("zb-level").value;
  const lv = ZahlenbildCore.LEVELS.indexOf(level) >= 0 ? level : "easy";
  AppStateZB.state = ZahlenbildCore.newGame(lv, nextMotifZB(lv));
  AppStateZB.hint = false;
  AppStateZB.hints = 0;
  AppStateZB.note = "";
  AppStateZB.magnify = null;
  setResultZB("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardZB();
  renderZB();
  saveZB();
}

function showBoardZB() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const panel = document.getElementById("settings-panel");
  const toggle = document.getElementById("menu-toggle");
  if (panel) panel.classList.add("hidden");
  if (toggle) I18n.setKey(toggle, "menu_toggle");
}

function tapDotZB(i) {
  const s = AppStateZB.state;
  if (!s || s.solved) return;
  const r = ZahlenbildCore.tap(s, i);
  AppStateZB.state = r.state;
  if (r.ok) {
    AppStateZB.hint = false;
    AppStateZB.note = "";
    if (r.state.solved) { finishZB(); renderZB(); }
    else updateDotZB(i);
  } else if (r.reason === "wrong") {
    AppStateZB.note = tZB("zb_wrong", { n: i + 1, m: s.done + 1 });
    renderInfoZB();
  }
  saveZB();
}

function undoZB() {
  const s = AppStateZB.state;
  if (!s || !s.done) return;
  AppStateZB.state = ZahlenbildCore.undo(s);
  AppStateZB.note = "";
  setResultZB("");
  if (window.ResultModal) window.ResultModal.hide();
  renderZB();
  saveZB();
}

function hintZB() {
  const s = AppStateZB.state;
  if (!s || s.solved) return;
  AppStateZB.hint = true;
  AppStateZB.hints++;
  AppStateZB.note = tZB("zb_hint_text", { n: s.done + 1 });
  drawHintZB();
  renderInfoZB();
  saveZB();
}

// "Magnify" / "Whole picture": the magnified part is centred on the next
// dot once, when the button is pressed, and then stays where it is.
function zoomZB() {
  AppStateZB.magnify = AppStateZB.magnify ? null : nextCentreZB();
  renderZB();
  saveZB();
}

// "Go to the next dot": moves the magnified part to the next dot.
function followZB() {
  if (!AppStateZB.magnify) return;
  AppStateZB.magnify = nextCentreZB();
  renderZB();
  saveZB();
}

function nextCentreZB() {
  const s = AppStateZB.state;
  const dots = dotsZB();
  const p = dots[Math.min(s.done, dots.length - 1)];
  return { x: p[0], y: p[1] };
}

function finishZB() {
  const s = AppStateZB.state;
  const text = tZB("zb_done", { s: I18n.t("zb_motif_" + s.motif) });
  setResultZB(text);
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("zahlenbild", "win", { hinted: AppStateZB.hints > 0 });
}

/*** Display ***/

function setStatusZB(text) {
  const el = document.getElementById("board-info");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function setResultZB(text) {
  const el = document.getElementById("game-result");
  if (el) { el.removeAttribute("data-i18n"); el.textContent = text || ""; }
}

function f2ZB(x) {
  return (Math.round(x * 100) / 100).toString();
}

// The part of the board shown: [x, y, size] in board units, and pixels per
// unit. The whole picture unless "Magnify" is on; the scale depends only on
// the picture, the board width and the button, never on the taps.
function viewZB() {
  const s = AppStateZB.state;
  const wrap = document.getElementById("zb-board");
  const px = Math.max(200, wrap.clientWidth || 320);
  const whole = ZahlenbildCore.wholeView(s.level, s.motif, px);
  const mag = ZahlenbildCore.magnifyScale(s.level, s.motif);
  const zoomable = s.level !== "easy" && mag > whole.scale * 1.05;
  const base = { zoomable: zoomable, zoomed: false };
  if (!zoomable || !AppStateZB.magnify || s.solved) return Object.assign(base, whole);
  const size = px / mag;
  const clampX = (v) => Math.max(Math.min(whole.x, ZB_MIN), Math.min(Math.max(whole.x + whole.size, ZB_MIN + ZB_SPAN) - size, v));
  const clampY = (v) => Math.max(Math.min(whole.y, ZB_MIN), Math.min(Math.max(whole.y + whole.size, ZB_MIN + ZB_SPAN) - size, v));
  return Object.assign(base, { x: clampX(AppStateZB.magnify.x - size / 2), y: clampY(AppStateZB.magnify.y - size / 2), size: size, scale: mag, zoomed: true });
}

// Is the next dot inside the part shown (with room for a tap round it)?
function nextInViewZB(v) {
  const s = AppStateZB.state;
  const dots = dotsZB();
  if (s.done >= dots.length) return true;
  const p = dots[s.done];
  const m = 22 / v.scale;
  return p[0] >= v.x + m && p[0] <= v.x + v.size - m && p[1] >= v.y + m && p[1] <= v.y + v.size - m;
}

// The svg is drawn in pixels (so numbers have their real font size); board
// units map to pixels with X() and Y().
function boardHtmlZB(v) {
  const s = AppStateZB.state;
  const dots = dotsZB();
  const m = ZahlenbildCore.motif(s.level, s.motif);
  const side = v.size * v.scale;
  const X = (x) => f2ZB((x - v.x) * v.scale);
  const Y = (y) => f2ZB((y - v.y) * v.scale);
  // Number size, dot radius and number places for this scale (task 169).
  // The whole picture keeps every number inside the board.
  const lay = ZahlenbildCore.layout(s.level, s.motif, v.scale, v.zoomed ? null : { x: v.x, y: v.y, size: v.size });
  AppStateZB.layout = lay;
  const r = lay.dot;
  const font = lay.font;
  let html = '<svg viewBox="0 0 ' + f2ZB(side) + " " + f2ZB(side) + '" width="100%" height="100%" role="group" aria-label="' + tZB("zb_board_aria") + '" focusable="false">';
  html += '<rect x="0" y="0" width="' + f2ZB(side) + '" height="' + f2ZB(side) + '" fill="#fff"/>';
  const pts = dots.slice(0, s.done).map((p) => X(p[0]) + "," + Y(p[1])).join(" ");
  if (s.solved) {
    html += '<polygon points="' + pts + '" fill="none" stroke="#141413" stroke-width="3.5" stroke-linejoin="round"/>';
    html += '<g transform="translate(' + X(0) + " " + Y(0) + ") scale(" + f2ZB(v.scale) + ')">';
    m.details.forEach((d) => { html += '<path d="' + d + '" fill="none" stroke="#141413" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>'; });
    return html + "</g></svg>";
  }
  // The line (always there, so a tap only adds a point) and the hint rings.
  html += '<polyline id="zb-line" points="' + pts + '" fill="none" stroke="#141413" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
  html += '<g id="zb-hint"></g>';
  const dirs = lay.dirs;
  dots.forEach((p, i) => {
    const next = i === s.done;
    const done = i < s.done;
    const cx = X(p[0]), cy = Y(p[1]);
    html += '<g id="zb-d' + i + '" data-dot="' + i + '"' + (next ? ' class="zb-next" role="button" tabindex="0"' : ' role="img"') + ' aria-label="' + tZB("zb_dot_aria", { n: i + 1 }) + '">';
    html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + f2ZB(r) + '" fill="' + (done ? "#141413" : "#fff") + '" stroke="#141413" stroke-width="2"/>';
    const box = ZahlenbildCore.labelBox(i, font);
    const off = ZahlenbildCore.offsetFor(dirs[i], box, r);
    const lx = (p[0] - v.x) * v.scale + off[0];
    const ly = (p[1] - v.y) * v.scale + off[1] + font * 0.36;
    html += '<text class="zb-num" x="' + f2ZB(lx) + '" y="' + f2ZB(ly) + '" text-anchor="middle" font-family="sans-serif" font-weight="' + (next ? 700 : 400) + '" font-size="' + f2ZB(font) + '" fill="#141413">' + (i + 1) + "</text>";
    html += "</g>";
  });
  return html + "</svg>";
}

// Point of dot i in svg pixels.
function pxZB(i) {
  const v = AppStateZB.view;
  const p = dotsZB()[i];
  return [(p[0] - v.x) * v.scale, (p[1] - v.y) * v.scale];
}

// The double ring of the hint round the next dot (only that group changes).
function drawHintZB() {
  const g = document.getElementById("zb-hint");
  if (!g) return;
  const s = AppStateZB.state;
  if (!AppStateZB.hint || s.solved) { g.innerHTML = ""; return; }
  const c = pxZB(s.done);
  const r = AppStateZB.layout ? AppStateZB.layout.dot : 5;
  g.innerHTML = '<circle cx="' + f2ZB(c[0]) + '" cy="' + f2ZB(c[1]) + '" r="' + f2ZB(r + 6) + '" fill="none" stroke="#141413" stroke-width="2"/>' +
    '<circle cx="' + f2ZB(c[0]) + '" cy="' + f2ZB(c[1]) + '" r="' + f2ZB(r + 11) + '" fill="none" stroke="#141413" stroke-width="2"/>';
}

// After a right tap on dot i (task 169): only dot i, the next dot, the line
// and the hint change - the board is not drawn again, nothing moves.
function updateDotZB(i) {
  const done = document.getElementById("zb-d" + i);
  if (!done) { renderZB(); return; }
  done.classList.remove("zb-next");
  done.setAttribute("role", "img");
  done.removeAttribute("tabindex");
  done.querySelector("circle").setAttribute("fill", "#141413");
  done.querySelector("text").setAttribute("font-weight", "400");
  const next = document.getElementById("zb-d" + (i + 1));
  if (next) {
    next.classList.add("zb-next");
    next.setAttribute("role", "button");
    next.setAttribute("tabindex", "0");
    next.querySelector("text").setAttribute("font-weight", "700");
  }
  const line = document.getElementById("zb-line");
  const c = pxZB(i);
  const pts = line.getAttribute("points");
  line.setAttribute("points", (pts ? pts + " " : "") + f2ZB(c[0]) + "," + f2ZB(c[1]));
  drawHintZB();
  renderInfoZB();
}

function renderZB() {
  const s = AppStateZB.state;
  if (!s) return;
  const wrap = document.getElementById("zb-board");
  // Square also where aspect-ratio is unknown (older e-reader browsers).
  wrap.style.height = wrap.offsetWidth + "px";
  const v = viewZB();
  AppStateZB.view = v;
  wrap.innerHTML = boardHtmlZB(v);
  drawHintZB();
  renderInfoZB();
}

// Everything round the board: progress, buttons, name, status line.
function renderInfoZB() {
  const s = AppStateZB.state;
  const v = AppStateZB.view;
  const n = dotsZB().length;
  document.getElementById("game-meta").textContent = tZB("zb_progress", { n: s.done, m: n }) + " · " + I18n.t("zb_level_" + s.level);
  const zoomBtn = document.getElementById("zb-zoom");
  zoomBtn.classList.toggle("hidden", !v.zoomable || s.solved);
  zoomBtn.setAttribute("data-i18n", v.zoomed ? "zb_zoom_out" : "zb_zoom_in");
  zoomBtn.textContent = I18n.t(v.zoomed ? "zb_zoom_out" : "zb_zoom_in");
  const follow = document.getElementById("zb-follow");
  follow.classList.toggle("hidden", !v.zoomed || s.solved || nextInViewZB(v));
  document.getElementById("undo-btn").disabled = !s.done;
  document.getElementById("hint-btn").disabled = s.solved;
  const name = document.getElementById("zb-name");
  const title = I18n.t("zb_motif_" + s.motif);
  name.textContent = s.solved ? title.charAt(0).toUpperCase() + title.slice(1) : "";
  name.classList.toggle("hidden", !s.solved);
  if (s.solved) setStatusZB(tZB("zb_done", { s: I18n.t("zb_motif_" + s.motif) }));
  else setStatusZB(AppStateZB.note || tZB("zb_tap_next", { n: s.done + 1 }));
}

/*** Taps ***/

// The dot for a tap at (clientX, clientY): the next dot when it is one of
// the two closest dots within reach (task 169), else the closest dot within
// reach, else -1.
function dotAtZB(clientX, clientY) {
  const svg = document.querySelector("#zb-board svg");
  if (!svg || !svg.getScreenCTM()) return -1;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  // svg pixels -> board units (the svg may be drawn a little smaller or larger).
  const v = AppStateZB.view;
  const p = { x: v.x + q.x / v.scale, y: v.y + q.y / v.scale };
  const scale = v.scale * (svg.getScreenCTM().a || 1);
  const reach = ZB_HIT_PX / scale;
  // Only dots inside the part shown can be meant.
  const s = AppStateZB.state;
  const hit = ZahlenbildCore.dotAt(s.level, s.motif, p.x, p.y, reach, s.done);
  if (hit < 0) return -1;
  const q2 = dotsZB()[hit];
  return q2[0] >= v.x && q2[0] <= v.x + v.size && q2[1] >= v.y && q2[1] <= v.y + v.size ? hit : -1;
}

function initZahlenbildApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-zb-game").addEventListener("click", startZB);
  document.getElementById("undo-btn").addEventListener("click", undoZB);
  document.getElementById("hint-btn").addEventListener("click", hintZB);
  document.getElementById("zb-zoom").addEventListener("click", zoomZB);
  document.getElementById("zb-follow").addEventListener("click", followZB);
  const board = document.getElementById("zb-board");
  board.addEventListener("click", (e) => {
    if (!AppStateZB.state || AppStateZB.state.solved) return;
    const i = dotAtZB(e.clientX, e.clientY);
    if (i >= 0) tapDotZB(i);
  });
  board.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target && e.target.closest ? e.target.closest(".zb-next") : null;
    if (!g) return;
    e.preventDefault();
    tapDotZB(parseInt(g.getAttribute("data-dot"), 10));
  });
  const S = '<svg class="howto-svg" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true" focusable="false">';
  const dot = (x, y, n, full) => '<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + (full ? "#141413" : "#fff") + '" stroke="#141413" stroke-width="2"/>' + (n ? '<text x="' + (x + 9) + '" y="' + (y - 4) + '" font-family="sans-serif" font-weight="700" font-size="12" fill="#141413">' + n + "</text>" : "");
  const line = (pts, w) => '<polyline points="' + pts + '" fill="none" stroke="#141413" stroke-width="' + (w || 3) + '" stroke-linejoin="round"/>';
  Howto.init({ slug: "zahlenbild", actions: ["zb-board"], steps: [
    { pics: S + dot(12, 48, 1) + dot(30, 12, 2) + dot(48, 48, 3) + "</svg>", key: "zb_howto_1" },
    { pics: S + line("12,48 30,12") + dot(12, 48, 1, true) + dot(30, 12, 2, true) + dot(48, 48, 3) + "</svg>", key: "zb_howto_2" },
    { pics: S + dot(12, 48, 1, true) + dot(30, 12, 2) + dot(48, 48, 3) + '<path d="M40 30L56 46M56 30L40 46" stroke="#141413" stroke-width="3" stroke-linecap="round"/></svg>', key: "zb_howto_3" },
    { pics: S + '<polygon points="10,54 10,28 30,8 50,28 50,54" fill="none" stroke="#141413" stroke-width="3" stroke-linejoin="round"/><path d="M25 54V40H35V54" fill="none" stroke="#141413" stroke-width="2.5"/></svg>', key: "zb_howto_4" }
  ] });
  window.addEventListener("resize", () => { if (AppStateZB.state) renderZB(); });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateZB.state) renderZB(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ZAHLENBILD_SAVE_KEY) : null;
  if (saved && ZahlenbildCore.valid(saved.state) && !saved.state.solved) {
    AppStateZB.state = saved.state;
    // Older saves had "zoom" (magnified by default): they start with the whole picture.
    AppStateZB.magnify = saved.magnify && typeof saved.magnify.x === "number" && typeof saved.magnify.y === "number" ? saved.magnify : null;
    AppStateZB.hints = saved.hints || 0;
    document.getElementById("zb-level").value = saved.state.level;
    showBoardZB();
    renderZB();
  }
}

document.addEventListener("DOMContentLoaded", initZahlenbildApp);
