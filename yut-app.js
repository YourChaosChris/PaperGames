// yut-app.js
// Yut (Yut Nori) page: board drawing, input and computer turns.
// Rules live in yut-core.js, the computer's choices in yut-ai.js.
// You play A; the other players are the computer.

const YUT_SAVE_KEY = "einkchess_save_yut";
const YUT_LETTERS = ["A", "B", "C", "D"];
// Korean names of the throws (do, gae, geol, yut, mo, backdo), shown with the number of steps.
const YUT_THROW_NAMES = { "1": "도", "2": "개", "3": "걸", "4": "윷", "5": "모", "-1": "빽도" };

// Field centres on the 600 x 640 board: ring 0-19, shortcut A 20-24, shortcut B 25-28.
const YUT_XY = (function () {
  const c = { 0: [540, 540] };
  let i;
  for (i = 1; i <= 4; i++) c[i] = [540, 540 - 96 * i];
  c[5] = [540, 60];
  for (i = 6; i <= 9; i++) c[i] = [540 - 96 * (i - 5), 60];
  c[10] = [60, 60];
  for (i = 11; i <= 14; i++) c[i] = [60, 60 + 96 * (i - 10)];
  c[15] = [60, 540];
  for (i = 16; i <= 19; i++) c[i] = [60 + 96 * (i - 15), 540];
  c[20] = [460, 140]; c[21] = [380, 220]; c[22] = [300, 300]; c[23] = [220, 380]; c[24] = [140, 460];
  c[25] = [140, 140]; c[26] = [220, 220]; c[27] = [380, 380]; c[28] = [460, 460];
  return c;
})();

const AppStateYut = { g: null, players: 2, level: 2, sel: 0, from: null, hint: null, note: null, busy: false, over: false, timer: null };

function ty(key, params) {
  let s = I18n.t(key);
  if (params) Object.keys(params).forEach((k) => { s = s.split("{" + k + "}").join(String(params[k])); });
  return s;
}

function posYut(pc) { return pc.route.length ? pc.route[pc.route.length - 1] : -1; }
function humanTurnYut() { return AppStateYut.g && AppStateYut.g.turn === 0 && AppStateYut.g.winner === null; }
function stepsYut() { const g = AppStateYut.g; return g.pending[Math.min(AppStateYut.sel, g.pending.length - 1)]; }
function movesYut() { const g = AppStateYut.g; return g.pending.length ? YutCore.legalMoves(g, stepsYut()) : []; }

function shapeYut(p, x, y, on) {
  const fill = on ? "#141413" : "#fff";
  const ink = on ? "#fff" : "#141413";
  let s;
  if (p === 0) s = '<circle cx="' + x + '" cy="' + y + '" r="17" fill="' + fill + '" stroke="#141413" stroke-width="3"/>';
  else if (p === 1) s = '<rect x="' + (x - 16) + '" y="' + (y - 16) + '" width="32" height="32" fill="' + fill + '" stroke="#141413" stroke-width="3"/>';
  else if (p === 2) s = '<polygon points="' + x + "," + (y - 19) + " " + (x + 18) + "," + (y + 15) + " " + (x - 18) + "," + (y + 15) + '" fill="' + fill + '" stroke="#141413" stroke-width="3"/>';
  else s = '<polygon points="' + x + "," + (y - 20) + " " + (x + 19) + "," + y + " " + x + "," + (y + 20) + " " + (x - 19) + "," + y + '" fill="' + fill + '" stroke="#141413" stroke-width="3"/>';
  return s + '<text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="16" font-weight="bold" fill="' + ink + '">' + YUT_LETTERS[p] + "</text>";
}

// A backdo from the first field sends the piece back to the start (target
// -1, task 191): it waits there again and is drawn on the start field.
function fieldLabelYut(n) { return n === -1 ? ty("yut_back_start") : n < 0 ? "–" : n === "finish" ? ty("yut_home") : String(n); }
function fieldXYYut(n) { return YUT_XY[n === "finish" || n === -1 ? 0 : n]; }

// The last happening, kept as data so it is shown in the current language.
function noteTextYut() {
  const n = AppStateYut.note;
  if (!n) return "";
  if (n.kind === "throw") return ty("yut_thrown", { p: YUT_LETTERS[n.p], n: YUT_THROW_NAMES[n.steps], s: n.steps }) + (n.lost ? " " + ty("yut_lost") : "");
  return ty("yut_moved", { p: YUT_LETTERS[n.p], a: fieldLabelYut(n.a), b: fieldLabelYut(n.b) }) + (n.cap ? " " + ty("yut_captures") : "");
}

function statusTextYut() {
  const g = AppStateYut.g;
  if (g.winner !== null) return ty(g.winner === 0 ? "ui_status_you_win" : "ui_status_computer_wins");
  if (g.turn !== 0) return ty("ui_status_computer_turn");
  return ty("ui_status_your_turn") + (g.owed > 0 ? "" : " " + ty("yut_status_move", { p: YUT_LETTERS[0] }));
}

function renderYut() {
  const st = AppStateYut;
  const g = st.g;
  if (!g) return;
  const boardEl = document.getElementById("yut-board");
  const mv = humanTurnYut() && g.owed === 0 ? movesYut() : [];
  let h = '<rect x="60" y="60" width="480" height="480" fill="none" stroke="#141413" stroke-width="3"/>' +
    '<line x1="540" y1="60" x2="60" y2="540" stroke="#141413" stroke-width="3"/><line x1="60" y1="60" x2="540" y2="540" stroke="#141413" stroke-width="3"/>';
  const big = { 0: 1, 5: 1, 10: 1, 15: 1, 22: 1 };
  for (let n = 0; n <= 28; n++) {
    h += '<circle cx="' + YUT_XY[n][0] + '" cy="' + YUT_XY[n][1] + '" r="' + (big[n] ? 24 : 14) + '" fill="#fff" stroke="#141413" stroke-width="' + (big[n] ? 4 : 2) + '"/>';
  }
  h += '<text x="540" y="595" text-anchor="middle" font-size="16" font-weight="bold">' + ty("yut_start_home") + "</text>";
  const groups = {};
  g.pieces.forEach((pc) => { const p = posYut(pc); if (pc.done || p < 0) return; (groups[p] = groups[p] || []).push(pc); });
  Object.keys(groups).forEach((k) => {
    const gr = groups[k];
    const x = YUT_XY[k][0], y = YUT_XY[k][1];
    const can = gr[0].player === 0 && mv.some((m) => m.from === +k);
    h += "<g" + (can ? ' data-from="' + k + '" role="button" tabindex="0" aria-label="' + YUT_LETTERS[gr[0].player] + " " + k + '"' : "") + ">" + shapeYut(gr[0].player, x, y, st.from === +k);
    if (gr.length > 1) h += '<circle cx="' + (x + 18) + '" cy="' + (y - 18) + '" r="11" fill="#141413"/><text x="' + (x + 18) + '" y="' + (y - 13) + '" text-anchor="middle" font-size="14" fill="#fff">' + gr.length + "</text>";
    if (can) h += '<circle cx="' + x + '" cy="' + y + '" r="26" fill="none" stroke="#141413" stroke-width="2" stroke-dasharray="5 4"/>';
    h += "</g>";
  });
  if (st.from !== null) {
    mv.forEach((m, ix) => {
      if (m.from !== st.from) return;
      const xy = fieldXYYut(m.to);
      if (!xy) return;
      const x = xy[0], y = xy[1];
      h += '<g data-mv="' + ix + '" role="button" tabindex="0" aria-label="' + fieldLabelYut(m.to) + '"><circle cx="' + x + '" cy="' + y + '" r="30" fill="#fff" fill-opacity="0.01" stroke="#141413" stroke-width="5"/>' +
        (m.choice ? '<text x="' + x + '" y="' + (y - 36) + '" text-anchor="middle" font-size="16" font-weight="bold">' + ty("yut_" + m.choice) + "</text>" : "") + "</g>";
    });
  }
  if (st.hint) {
    const hx = fieldXYYut(st.hint.to) || YUT_XY[0];
    h += '<circle cx="' + hx[0] + '" cy="' + hx[1] + '" r="36" fill="none" stroke="#141413" stroke-width="3" stroke-dasharray="2 6"/>';
    if (st.hint.from >= 0) h += '<circle cx="' + YUT_XY[st.hint.from][0] + '" cy="' + YUT_XY[st.hint.from][1] + '" r="36" fill="none" stroke="#141413" stroke-width="3" stroke-dasharray="2 6"/>';
  }
  boardEl.innerHTML = h;

  let a = "";
  if (g.winner === null && humanTurnYut()) {
    if (g.owed > 0) a += '<button type="button" class="primary" data-a="throw">' + ty("yut_throw") + "</button>";
    else {
      const cur = Math.min(st.sel, g.pending.length - 1);
      g.pending.forEach((s, ix) => { a += '<button type="button" data-t="' + ix + '" class="' + (ix === cur ? "on" : "") + '">' + YUT_THROW_NAMES[s] + " (" + s + ")</button>"; });
      if (mv.some((m) => m.from === -1)) a += '<button type="button" data-from="-1" class="' + (st.from === -1 ? "on" : "") + '">' + ty("yut_waiting_piece") + "</button>";
      a += '<button type="button" data-a="hint">' + ty("yut_hint") + "</button>";
    }
  }
  document.getElementById("yut-acts").innerHTML = a;

  const note = noteTextYut();
  const info = document.getElementById("board-info");
  if (info) info.textContent = statusTextYut() + (note ? " " + note : "");
  document.getElementById("yut-info").textContent = ty("yut_pieces") + ": " + YUT_LETTERS.slice(0, g.players).map((l, p) => {
    const mine = g.pieces.filter((x) => x.player === p);
    return l + " " + mine.filter((x) => !x.done && !x.route.length).length + " " + ty("yut_waiting") + ", " + mine.filter((x) => x.done).length + " " + ty("yut_home");
  }).join(" | ");
}

function saveYut() {
  if (typeof GameStorage === "undefined" || !AppStateYut.g) return;
  GameStorage.save(YUT_SAVE_KEY, { players: AppStateYut.players, level: AppStateYut.level, g: AppStateYut.g, note: AppStateYut.note });
}
function clearSaveYut() { if (typeof GameStorage !== "undefined") GameStorage.clear(YUT_SAVE_KEY); }

function afterYut() {
  const st = AppStateYut;
  st.g = YutCore.skipUnusable(st.g);
  st.sel = 0; st.from = null; st.hint = null;
  if (st.g.winner !== null) { finishYut(); return; }
  saveYut();
  renderYut();
  scheduleYut();
}

function finishYut() {
  const st = AppStateYut;
  st.over = true;
  const text = ty("yut_win", { p: YUT_LETTERS[st.g.winner] });
  const res = document.getElementById("game-result");
  if (res) res.textContent = text;
  if (typeof GameStats !== "undefined") GameStats.record("yut", st.g.winner === 0 ? "win" : "loss");
  clearSaveYut();
  renderYut();
  if (window.ResultModal) window.ResultModal.show(text, "");
}

function throwYut() {
  const st = AppStateYut;
  const t = YutCore.throwSticks(Math.random);
  const p = st.g.turn;
  st.g = YutCore.addThrow(st.g, t);
  const lost = YutCore.skipUnusable(st.g).pending.length < st.g.pending.length;
  st.note = { kind: "throw", p: p, steps: t.steps, lost: lost };
  afterYut();
}

function moveYut(m) {
  const st = AppStateYut;
  st.note = { kind: "move", p: st.g.turn, a: m.from, b: m.to, cap: m.captures.length > 0 };
  st.g = YutCore.applyMove(st.g, m);
  afterYut();
}

// Safety net (task 191): an error in one move or drawing must not leave
// the game stuck (a player had to start again). The selection is
// cleared, a throw that can't be used is dropped, and play goes on.
function safeYut(fn) {
  return function () {
    try {
      return fn.apply(this, arguments);
    } catch (e) {
      if (window.console) console.error(e);
      const st = AppStateYut;
      st.from = null; st.hint = null; st.sel = 0; st.busy = false;
      if (!st.g) return undefined;
      try { st.g = YutCore.skipUnusable(st.g); saveYut(); renderYut(); } catch (e2) { if (window.console) console.error(e2); }
      scheduleYut();
      return undefined;
    }
  };
}

function scheduleYut() {
  const st = AppStateYut;
  if (!st.g || st.g.winner !== null || st.g.turn === 0 || st.busy) return;
  st.busy = true;
  const wait = typeof AiPacing !== "undefined" ? AiPacing.delay(500) : 700;
  st.timer = setTimeout(safeYut(() => {
    st.busy = false;
    if (!st.g || st.g.winner !== null || st.g.turn === 0) return;
    if (st.g.owed > 0) { throwYut(); return; }
    const m = YutAI.chooseMove(st.g, Math.random, st.level);
    if (m) moveYut(m); else afterYut();
  }), wait);
}

function startYut(fromSave) {
  const st = AppStateYut;
  if (st.timer) clearTimeout(st.timer);
  st.busy = false;
  if (!fromSave) {
    st.players = parseInt(document.getElementById("yut-num-players").value, 10);
    st.level = parseInt(document.getElementById("yut-level").value, 10);
    st.g = YutCore.createGame({ players: st.players, piecesPerPlayer: 4 });
    st.note = null;
  }
  st.sel = 0; st.from = null; st.hint = null; st.over = false;
  const res = document.getElementById("game-result");
  if (res) res.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
  document.getElementById("board-placeholder").classList.add("hidden");
  document.getElementById("board-container").classList.remove("hidden");
  document.getElementById("settings-panel").classList.add("hidden");
  const mt = document.getElementById("menu-toggle");
  if (mt) I18n.setKey(mt, "menu_toggle");
  saveYut();
  renderYut();
  scheduleYut();
}

function initYutApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-yut-game").addEventListener("click", () => startYut(false));
  const board = document.getElementById("yut-board");
  const onBoard = safeYut((e) => {
    const el = e.target.closest("[data-mv],[data-from]");
    if (!el || !humanTurnYut()) return;
    const mv = movesYut();
    if (el.getAttribute("data-mv") !== null) { moveYut(mv[+el.getAttribute("data-mv")]); return; }
    AppStateYut.from = +el.getAttribute("data-from");
    renderYut();
  });
  board.addEventListener("click", onBoard);
  board.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBoard(e); } });
  document.getElementById("yut-acts").addEventListener("click", safeYut((e) => {
    const el = e.target.closest("button");
    const st = AppStateYut;
    if (!el || !humanTurnYut()) return;
    if (el.getAttribute("data-a") === "throw") { throwYut(); return; }
    if (el.getAttribute("data-a") === "hint") {
      st.hint = YutAI.hint(st.g);
      if (st.hint) { const ix = st.g.pending.indexOf(st.hint.steps); if (ix >= 0) st.sel = ix; }
      renderYut();
      return;
    }
    if (el.getAttribute("data-t") !== null) { st.sel = +el.getAttribute("data-t"); st.from = null; st.hint = null; renderYut(); return; }
    if (el.getAttribute("data-from") !== null) { st.from = +el.getAttribute("data-from"); renderYut(); }
  }));
  if (typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateYut.g) renderYut(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(YUT_SAVE_KEY) : null;
  if (saved && saved.g && saved.g.winner === null && Array.isArray(saved.g.pieces)) {
    Object.assign(AppStateYut, { players: saved.players, level: saved.level, g: saved.g, note: saved.note || null });
    startYut(true);
  }
}

document.addEventListener("DOMContentLoaded", initYutApp);
