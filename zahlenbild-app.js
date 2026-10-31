// zahlenbild-app.js
// Wires ZahlenbildCore ("Zahlenbild", en "Dot Picture") to zahlenbild.html.
//
// The board is one square svg with the numbered dots of a picture. Tap dot
// 1, then 2, then 3 ...; a line joins each dot to the one before. A wrong dot
// changes nothing; the status line names the dot that was tapped and the one
// being looked for. After the last dot the line closes back to dot 1 and the
// finished picture shows with its name (and its small extra lines).
//
// Tap targets (task 166): a tap counts for the dot being looked for when it
// is less than 22 px from it. When the closest two dots of a picture would be
// less than 44 px apart on this screen, the board shows a magnified part
// around the next dot ("Magnify", on by default); "Whole picture" shows all
// of it with smaller numbers. The magnified part follows the next dot.
// Nothing is animated, no timer. Undo takes back dots, the hint gives the next
// dot a double ring.

const ZAHLENBILD_SAVE_KEY = "einkchess_save_zahlenbild";
const ZB_LAST_KEY = "papergames_zahlenbild_last";
const ZB_HIT_PX = 22;
const ZB_MIN = -4;
const ZB_SPAN = 108;

const AppStateZB = {
  state: null,
  zoom: true,    // magnified part when the dots are close together
  hint: false,   // the next dot has a double ring
  hints: 0,
  note: ""       // the last message (wrong dot), until the next tap
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
  GameStorage.save(ZAHLENBILD_SAVE_KEY, { state: AppStateZB.state, zoom: AppStateZB.zoom, hints: AppStateZB.hints });
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
    if (r.state.solved) finishZB();
  } else if (r.reason === "wrong") {
    AppStateZB.note = tZB("zb_wrong", { n: i + 1, m: s.done + 1 });
  }
  renderZB();
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
  renderZB();
  saveZB();
}

function zoomZB() {
  AppStateZB.zoom = !AppStateZB.zoom;
  renderZB();
  saveZB();
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

// The part of the board shown: [x, y, size] in board units, and pixels per unit.
function viewZB() {
  const s = AppStateZB.state;
  const wrap = document.getElementById("zb-board");
  const px = Math.max(200, wrap.clientWidth || 320);
  const need = ZahlenbildCore.scaleFor(s.level, s.motif);
  const whole = px / ZB_SPAN;
  const zoomable = whole < need - 1e-9;
  if (!zoomable || !AppStateZB.zoom || s.solved) return { x: ZB_MIN, y: ZB_MIN, size: ZB_SPAN, scale: whole, zoomable, zoomed: false, need };
  const size = px / need;
  const dots = dotsZB();
  const at = dots[Math.min(s.done, dots.length - 1)];
  const clamp = (v) => Math.max(ZB_MIN, Math.min(ZB_MIN + ZB_SPAN - size, v));
  return { x: clamp(at[0] - size / 2), y: clamp(at[1] - size / 2), size, scale: need, zoomable, zoomed: true, need };
}

function boardHtmlZB(v) {
  const s = AppStateZB.state;
  const dots = dotsZB();
  const look = ZahlenbildCore.LOOK[s.level];
  const m = ZahlenbildCore.motif(s.level, s.motif);
  // Below the scale of a tap target ("Whole picture") everything shrinks a little.
  const k = Math.min(1, v.scale / v.need);
  const u = (pxv) => pxv / v.scale;
  const r = u(Math.max(3, look.dot * k));
  const font = u(Math.max(9, look.font * k));
  let html = '<svg viewBox="' + f2ZB(v.x) + " " + f2ZB(v.y) + " " + f2ZB(v.size) + " " + f2ZB(v.size) + '" width="100%" height="100%" role="group" aria-label="' + tZB("zb_board_aria") + '" focusable="false">';
  html += '<rect x="' + f2ZB(v.x) + '" y="' + f2ZB(v.y) + '" width="' + f2ZB(v.size) + '" height="' + f2ZB(v.size) + '" fill="#fff"/>';
  const pts = dots.slice(0, s.done).map((p) => p[0] + "," + p[1]).join(" ");
  if (s.solved) {
    html += '<polygon points="' + pts + '" fill="none" stroke="#141413" stroke-width="' + f2ZB(u(3.5)) + '" stroke-linejoin="round"/>';
    m.details.forEach((d) => { html += '<path d="' + d + '" fill="none" stroke="#141413" stroke-width="' + f2ZB(u(3)) + '" stroke-linecap="round" stroke-linejoin="round"/>'; });
    return html + "</svg>";
  }
  if (s.done > 1) html += '<polyline points="' + pts + '" fill="none" stroke="#141413" stroke-width="' + f2ZB(u(2.6)) + '" stroke-linejoin="round" stroke-linecap="round"/>';
  const dirs = ZahlenbildCore.labels(s.level, s.motif);
  dots.forEach((p, i) => {
    const next = i === s.done;
    const done = i < s.done;
    html += '<g' + (next ? ' class="zb-next" data-dot="' + i + '" role="button" tabindex="0"' : ' role="img"') + ' aria-label="' + tZB("zb_dot_aria", { n: i + 1 }) + '">';
    if (next && AppStateZB.hint) {
      html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f2ZB(r + u(6)) + '" fill="none" stroke="#141413" stroke-width="' + f2ZB(u(2)) + '"/>';
      html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f2ZB(r + u(11)) + '" fill="none" stroke="#141413" stroke-width="' + f2ZB(u(2)) + '"/>';
    }
    html += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f2ZB(r) + '" fill="' + (done ? "#141413" : "#fff") + '" stroke="#141413" stroke-width="' + f2ZB(u(2)) + '"/>';
    const box = ZahlenbildCore.labelBox(i, look.font);
    const off = ZahlenbildCore.offsetFor(dirs[i], box, look.dot);
    const lx = p[0] + u(off[0] * k);
    const ly = p[1] + u(off[1] * k) + font * 0.36;
    html += '<text class="zb-num" x="' + f2ZB(lx) + '" y="' + f2ZB(ly) + '" text-anchor="middle" font-family="sans-serif" font-weight="' + (next ? 700 : 400) + '" font-size="' + f2ZB(font) + '" fill="#141413">' + (i + 1) + "</text>";
    html += "</g>";
  });
  return html + "</svg>";
}

function renderZB() {
  const s = AppStateZB.state;
  if (!s) return;
  const wrap = document.getElementById("zb-board");
  // Square also where aspect-ratio is unknown (older e-reader browsers).
  wrap.style.height = wrap.offsetWidth + "px";
  const v = viewZB();
  wrap.innerHTML = boardHtmlZB(v);
  const n = dotsZB().length;
  document.getElementById("game-meta").textContent = tZB("zb_progress", { n: s.done, m: n }) + " · " + I18n.t("zb_level_" + s.level);
  const zoomBtn = document.getElementById("zb-zoom");
  zoomBtn.classList.toggle("hidden", !v.zoomable || s.solved);
  zoomBtn.setAttribute("data-i18n", AppStateZB.zoom ? "zb_zoom_out" : "zb_zoom_in");
  zoomBtn.textContent = I18n.t(AppStateZB.zoom ? "zb_zoom_out" : "zb_zoom_in");
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

// The dot for a tap at (clientX, clientY): the next dot when it is close
// enough, else the closest dot within reach, else -1.
function dotAtZB(clientX, clientY) {
  const svg = document.querySelector("#zb-board svg");
  if (!svg || !svg.getScreenCTM()) return -1;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  const scale = svg.getScreenCTM().a || 1;
  const reach = ZB_HIT_PX / scale;
  const dots = dotsZB();
  const d = (i) => Math.hypot(dots[i][0] - p.x, dots[i][1] - p.y);
  const next = AppStateZB.state.done;
  if (next < dots.length && d(next) <= reach) return next;
  let best = -1;
  dots.forEach((q, i) => { if (d(i) <= reach && (best < 0 || d(i) < d(best))) best = i; });
  return best;
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
    AppStateZB.zoom = saved.zoom !== false;
    AppStateZB.hints = saved.hints || 0;
    document.getElementById("zb-level").value = saved.state.level;
    showBoardZB();
    renderZB();
  }
}

document.addEventListener("DOMContentLoaded", initZahlenbildApp);
