// suchbild-app.js
// Wires SuchbildCore ("Suchbild", en "Hidden Odd Ones", task 171) to
// suchbild.html.
//
// The board is one svg: every sign in its cell (drawn once per round), a
// group of rings for the odd ones found and a group for the hint area. A tap
// only adds a ring (or changes the status line on a wrong sign) - the board
// is never built again for a tap (no flicker on e-ink, see task 169). A tap
// counts for the sign closest to the finger within three quarters of a cell;
// on the dense levels a cell is smaller than 44 px (25 px on 360 x 640 at
// very hard), so the page can still be filled with signs. "Magnify" (hard and
// very hard, remembered) makes the board twice as wide in a box that the
// reader scrolls by hand; the part shown never moves by itself. No timer.

const SUCHBILD_SAVE_KEY = "einkchess_save_suchbild";
const SB_LAST_KEY = "papergames_suchbild_last";
const SB_UNIT = SuchbildCore.UNIT; // svg units per cell

const AppStateSB = {
  state: null,
  magnify: false,
  hint: false,
  hints: 0,
  note: "",
  width: 0
};

function tSB(key, values) {
  let text = I18n.t(key);
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}

function textSB(el, text) {
  if (el && el.textContent !== text) el.textContent = text;
}

/*** Save and load ***/

function saveSB() {
  if (typeof GameStorage === "undefined" || !AppStateSB.state) return;
  if (AppStateSB.state.solved) { GameStorage.clear(SUCHBILD_SAVE_KEY); return; }
  GameStorage.save(SUCHBILD_SAVE_KEY, { state: AppStateSB.state, magnify: AppStateSB.magnify, hints: AppStateSB.hints });
}

// The round after the last one played at this level (a circle of five).
function nextRoundSB(level) {
  let last = {};
  try { last = JSON.parse(window.localStorage.getItem(SB_LAST_KEY) || "{}") || {}; } catch (e) { last = {}; }
  const r = Number.isInteger(last[level]) ? SuchbildCore.nextRound(last[level]) : 0;
  last[level] = r;
  try { window.localStorage.setItem(SB_LAST_KEY, JSON.stringify(last)); } catch (e) { /* the same round may come again */ }
  return r;
}

function zoomableSB() {
  const s = AppStateSB.state;
  return !!s && (s.level === "hard" || s.level === "expert");
}

/*** Game flow ***/

function startSB() {
  const level = document.getElementById("sb-level").value;
  const lv = SuchbildCore.LEVELS.indexOf(level) >= 0 ? level : "easy";
  AppStateSB.state = SuchbildCore.newGame(lv, nextRoundSB(lv));
  AppStateSB.hint = false;
  AppStateSB.hints = 0;
  AppStateSB.note = "";
  if (!zoomableSB()) AppStateSB.magnify = false;
  setResultSB("");
  if (window.ResultModal) window.ResultModal.hide();
  showBoardSB();
  renderSB();
  saveSB();
}

function showBoardSB() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const panel = document.getElementById("settings-panel");
  const toggle = document.getElementById("menu-toggle");
  if (panel) panel.classList.add("hidden");
  if (toggle) I18n.setKey(toggle, "menu_toggle");
}

function tapItemSB(i) {
  const s = AppStateSB.state;
  if (!s || s.solved) return;
  const r = SuchbildCore.tap(s, i);
  AppStateSB.state = r.state;
  if (r.ok) {
    AppStateSB.note = "";
    AppStateSB.hint = false;
    addRingSB(i);
    drawHintSB();
    if (r.state.solved) finishSB();
  } else if (r.reason === "wrong") {
    AppStateSB.note = I18n.t("sb_wrong");
  } else if (r.reason === "again") {
    AppStateSB.note = I18n.t("sb_again");
  }
  renderInfoSB();
  saveSB();
}

function hintSB() {
  const s = AppStateSB.state;
  if (!s || s.solved) return;
  AppStateSB.hint = true;
  AppStateSB.hints++;
  AppStateSB.note = I18n.t("sb_hint_text");
  drawHintSB();
  renderInfoSB();
  saveSB();
}

function zoomSB() {
  if (!zoomableSB()) return;
  AppStateSB.magnify = !AppStateSB.magnify;
  renderSB();
  saveSB();
}

function finishSB() {
  const rd = SuchbildCore.roundOf(AppStateSB.state);
  const text = tSB("sb_done", { m: rd.count });
  setResultSB(text);
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("suchbild", "win", { hinted: AppStateSB.hints > 0 });
}

/*** Display ***/

function setStatusSB(text) {
  const el = document.getElementById("board-info");
  if (el) { if (el.hasAttribute("data-i18n")) el.removeAttribute("data-i18n"); textSB(el, text || ""); }
}

function setResultSB(text) {
  const el = document.getElementById("game-result");
  if (el) { if (el.hasAttribute("data-i18n")) el.removeAttribute("data-i18n"); textSB(el, text || ""); }
}

function f2SB(x) {
  return (Math.round(x * 100) / 100).toString();
}

function ringHtmlSB(i) {
  const it = SuchbildCore.roundOf(AppStateSB.state).items[i];
  return '<circle cx="' + f2SB(it.x * SB_UNIT) + '" cy="' + f2SB(it.y * SB_UNIT) + '" r="11.5" fill="none" stroke="#141413" stroke-width="2.8"/>';
}

function boardHtmlSB() {
  const s = AppStateSB.state;
  const rd = SuchbildCore.roundOf(s);
  const w = rd.cols * SB_UNIT, h = rd.rows * SB_UNIT;
  const base = SuchbildCore.sign(rd.base), odd = SuchbildCore.sign(rd.odd);
  let html = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img" aria-label="' + tSB("sb_board_aria", { n: rd.items.length }) + '" focusable="false">';
  html += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>';
  html += "<g>";
  const k = SuchbildCore.SIGN_SCALE;
  rd.items.forEach((it) => { html += '<g class="sb-sign" transform="translate(' + f2SB(it.x * SB_UNIT) + " " + f2SB(it.y * SB_UNIT) + ") scale(" + k + ')">' + (it.odd ? odd : base) + "</g>"; });
  html += "</g>";
  html += '<g id="sb-hint"></g><g id="sb-rings">' + s.found.map(ringHtmlSB).join("") + "</g>";
  return html + "</svg>";
}

// A found odd one: one ring more, nothing else on the board changes.
function addRingSB(i) {
  const g = document.getElementById("sb-rings");
  if (!g) { renderSB(); return; }
  g.insertAdjacentHTML("beforeend", ringHtmlSB(i));
}

function drawHintSB() {
  const g = document.getElementById("sb-hint");
  if (!g) return;
  const a = AppStateSB.hint ? SuchbildCore.hintArea(AppStateSB.state) : null;
  if (!a) { if (g.firstChild) g.innerHTML = ""; return; }
  g.innerHTML = '<rect x="' + (a.x * SB_UNIT + 1.5) + '" y="' + (a.y * SB_UNIT + 1.5) + '" width="' + (a.w * SB_UNIT - 3) + '" height="' + (a.h * SB_UNIT - 3) + '" fill="none" stroke="#141413" stroke-width="3" stroke-dasharray="8 5"/>';
}

function renderSB() {
  const s = AppStateSB.state;
  if (!s) return;
  const rd = SuchbildCore.roundOf(s);
  const scroll = document.getElementById("sb-scroll");
  const wrap = document.getElementById("sb-board");
  scroll.classList.toggle("sb-magnified", AppStateSB.magnify && zoomableSB());
  AppStateSB.width = scroll.clientWidth;
  // Height from the width also where aspect-ratio is unknown.
  wrap.style.height = Math.round(wrap.offsetWidth * rd.rows / rd.cols) + "px";
  wrap.innerHTML = boardHtmlSB();
  drawHintSB();
  renderInfoSB();
}

function renderInfoSB() {
  const s = AppStateSB.state;
  const rd = SuchbildCore.roundOf(s);
  textSB(document.getElementById("game-meta"), tSB("sb_progress", { n: s.found.length, m: rd.count }) + " · " + I18n.t("sb_level_" + s.level));
  const hint = document.getElementById("hint-btn");
  if (hint.disabled !== !!s.solved) hint.disabled = !!s.solved;
  const zoom = document.getElementById("sb-zoom");
  zoom.classList.toggle("hidden", !zoomableSB() || s.solved);
  const zk = AppStateSB.magnify ? "sb_zoom_out" : "sb_zoom_in";
  if (zoom.getAttribute("data-i18n") !== zk) zoom.setAttribute("data-i18n", zk);
  textSB(zoom, I18n.t(zk));
  if (s.solved) setStatusSB(tSB("sb_done", { m: rd.count }));
  else setStatusSB(AppStateSB.note || tSB("sb_status", { m: rd.count }));
}

/*** Taps ***/

function itemAtSB(clientX, clientY) {
  const svg = document.querySelector("#sb-board svg");
  if (!svg || !svg.getScreenCTM() || !AppStateSB.state) return -1;
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  return SuchbildCore.itemAt(SuchbildCore.roundOf(AppStateSB.state), q.x / SB_UNIT, q.y / SB_UNIT, 0.75);
}

function initSuchbildApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-sb-game").addEventListener("click", startSB);
  document.getElementById("hint-btn").addEventListener("click", hintSB);
  document.getElementById("sb-zoom").addEventListener("click", zoomSB);
  document.getElementById("sb-board").addEventListener("click", (e) => {
    if (!AppStateSB.state || AppStateSB.state.solved) return;
    const i = itemAtSB(e.clientX, e.clientY);
    if (i >= 0) tapItemSB(i);
  });
  const S = '<svg class="howto-svg" viewBox="0 0 60 60" width="60" height="60" aria-hidden="true" focusable="false"><g fill="none" stroke="#141413" stroke-width="2.4">';
  const page = (odd, ring) => {
    let g = "";
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
      const cx = 10 + x * 20, cy = 10 + y * 20;
      g += x === 2 && y === 1 && odd ? '<rect x="' + (cx - 5) + '" y="' + (cy - 5) + '" width="10" height="10"/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="5"/>';
    }
    return S + g + (ring ? '<circle cx="50" cy="30" r="9" stroke-width="3.4"/>' : "") + "</g></svg>";
  };
  Howto.init({ slug: "suchbild", actions: ["sb-board"], steps: [
    { pics: page(true, false), key: "sb_howto_1" },
    { pics: page(true, true), key: "sb_howto_2" },
    { pics: S + '<circle cx="30" cy="30" r="9"/><path d="M40 18L52 30M52 18L40 30" stroke-width="3"/></g></svg>', key: "sb_howto_3" },
    { pics: S + '<rect x="6" y="6" width="30" height="30" stroke-dasharray="5 4"/><circle cx="20" cy="20" r="5"/></g></svg>', key: "sb_howto_4" }
  ] });
  window.addEventListener("resize", () => {
    const w = document.getElementById("sb-scroll").clientWidth;
    if (AppStateSB.state && w !== AppStateSB.width) renderSB();
  });
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateSB.state) renderSB(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SUCHBILD_SAVE_KEY) : null;
  if (saved && SuchbildCore.valid(saved.state) && !saved.state.solved) {
    AppStateSB.state = saved.state;
    AppStateSB.magnify = !!saved.magnify;
    AppStateSB.hints = saved.hints || 0;
    document.getElementById("sb-level").value = saved.state.level;
    showBoardSB();
    renderSB();
  }
}

document.addEventListener("DOMContentLoaded", initSuchbildApp);
