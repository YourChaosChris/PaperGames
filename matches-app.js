// matches-app.js
// Wires MatchesCore ("Matchstick Puzzles", Streichholzrätsel) to
// matches.html.
//
// Tap a match to pick it up, then tap a free place to lay it there (no
// dragging). Undo takes back the last step, "Start over" lays every
// match back, Hint marks a match and the place it should go. 30 fixed
// puzzles per level; solved ones get a tick in the puzzle list.

const MT_SAVE_KEY = "einkchess_save_matches";
const MT_DONE_KEY = "einkchess_matches_done";

const AppStateMt = {
  level: "easy",
  index: 0,
  puzzle: null,
  set: [],          // slots holding a match on the board
  held: null,       // slot the match in hand was taken from
  history: [],      // { set, held } before each step
  hint: null,       // { from, to }
  hinted: false,
  gameOver: false,
  sols: null
};

function tMt(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusMt(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function doneMt() {
  const d = typeof GameStorage !== "undefined" ? GameStorage.load(MT_DONE_KEY) : null;
  return d && typeof d === "object" ? d : {};
}

function saveMtGame() {
  if (typeof GameStorage === "undefined" || !AppStateMt.puzzle) return;
  GameStorage.save(MT_SAVE_KEY, { level: AppStateMt.level, index: AppStateMt.index, set: AppStateMt.set, held: AppStateMt.held, history: AppStateMt.history, hinted: AppStateMt.hinted });
}

function clearSavedMtGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(MT_SAVE_KEY);
}

// The puzzle list with a tick on solved puzzles.
function fillPuzzleListMt() {
  const levelSel = document.getElementById("mt-level");
  const numSel = document.getElementById("mt-number");
  const done = doneMt();
  const lv = levelSel.value;
  const keep = numSel.value;
  numSel.innerHTML = "";
  MatchesCore.PUZZLES[lv].forEach((p, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = (i + 1) + (done[lv + ":" + i] ? " ✓" : "");
    numSel.appendChild(o);
  });
  if (keep && +keep < MatchesCore.PUZZLES[lv].length) numSel.value = keep;
  else {
    // The first puzzle not solved yet.
    const first = MatchesCore.PUZZLES[lv].findIndex((p, i) => !done[lv + ":" + i]);
    numSel.value = String(first < 0 ? 0 : first);
  }
}

function initMtApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("mt-level");
  const numSel = document.getElementById("mt-number");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  levelSel.addEventListener("change", () => { numSel.value = ""; fillPuzzleListMt(); });
  fillPuzzleListMt();
  document.getElementById("start-mt-game").addEventListener("click", () => startMtGame(levelSel.value, +numSel.value));
  document.getElementById("mt-undo").addEventListener("click", undoMt);
  document.getElementById("mt-reset").addEventListener("click", resetMt);
  document.getElementById("mt-hint").addEventListener("click", hintMt);
  document.getElementById("mt-next").addEventListener("click", nextMt);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateMt.puzzle) renderMt(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(MT_SAVE_KEY) : null;
  if (saved && MatchesCore.PUZZLES[saved.level] && MatchesCore.PUZZLES[saved.level][saved.index] && Array.isArray(saved.set)) {
    loadPuzzleMt(saved.level, saved.index);
    AppStateMt.set = saved.set;
    AppStateMt.held = saved.held || null;
    AppStateMt.history = saved.history || [];
    AppStateMt.hinted = !!saved.hinted;
    levelSel.value = saved.level;
    numSel.value = "";
    fillPuzzleListMt();
    numSel.value = String(saved.index);
    showBoardMt();
    setStatusMt(AppStateMt.held ? "Now tap a free place to lay the match." : "Tap a match to pick it up.");
  }
}

function loadPuzzleMt(level, index) {
  AppStateMt.level = level;
  AppStateMt.index = index;
  AppStateMt.puzzle = MatchesCore.PUZZLES[level][index];
  AppStateMt.set = MatchesCore.startSlots(AppStateMt.puzzle);
  AppStateMt.held = null;
  AppStateMt.history = [];
  AppStateMt.hint = null;
  AppStateMt.hinted = false;
  AppStateMt.gameOver = false;
  AppStateMt.sols = null;
}

function showBoardMt() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderMt();
}

function startMtGame(level, index) {
  loadPuzzleMt(level, index);
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardMt();
  setStatusMt("Tap a match to pick it up.");
  saveMtGame();
}

function nextMt() {
  const list = MatchesCore.PUZZLES[AppStateMt.level];
  const done = doneMt();
  let i = AppStateMt.index;
  for (let s = 1; s <= list.length; s++) {
    const j = (AppStateMt.index + s) % list.length;
    if (!done[AppStateMt.level + ":" + j]) { i = j; break; }
    if (s === 1) i = j;
  }
  document.getElementById("mt-number").value = String(i);
  startMtGame(AppStateMt.level, i);
}

function pushHistoryMt() {
  AppStateMt.history.push({ set: AppStateMt.set.slice(), held: AppStateMt.held });
}

function onSlotMt(id) {
  const p = AppStateMt.puzzle;
  if (!p || AppStateMt.gameOver) return;
  const on = AppStateMt.set.indexOf(id) !== -1;
  AppStateMt.hint = null;
  if (AppStateMt.held === null) {
    if (!on) { setStatusMt("Tap a match to pick it up."); renderMt(); return; }
    pushHistoryMt();
    AppStateMt.set = AppStateMt.set.filter((x) => x !== id);
    AppStateMt.held = id;
    setStatusMt("Now tap a free place to lay the match.");
    renderMt();
    saveMtGame();
    return;
  }
  if (on) { setStatusMt("Lay the match on a free place first."); renderMt(); return; }
  pushHistoryMt();
  const back = id === AppStateMt.held;
  AppStateMt.set = AppStateMt.set.concat([id]);
  AppStateMt.held = null;
  afterStepMt(back ? "The match is back in its place." : "Match moved.");
}

function afterStepMt(text) {
  const p = AppStateMt.puzzle;
  const moved = MatchesCore.movedCount(p, AppStateMt.set);
  if (moved <= p.k && MatchesCore.isSolved(p, AppStateMt.set)) {
    winMt();
    return;
  }
  if (moved > p.k) setStatusMt("Too many matches moved - undo or start over.");
  else if (moved === p.k) setStatusMt("Not right yet - undo or move a match again.");
  else setStatusMt(text);
  renderMt();
  saveMtGame();
}

function undoMt() {
  if (!AppStateMt.puzzle || AppStateMt.gameOver) return;
  if (!AppStateMt.history.length) { setStatusMt("Nothing to undo."); return; }
  const h = AppStateMt.history.pop();
  AppStateMt.set = h.set;
  AppStateMt.held = h.held;
  AppStateMt.hint = null;
  setStatusMt(AppStateMt.held ? "Now tap a free place to lay the match." : "Tap a match to pick it up.");
  renderMt();
  saveMtGame();
}

function resetMt() {
  if (!AppStateMt.puzzle || AppStateMt.gameOver) return;
  pushHistoryMt();
  AppStateMt.set = MatchesCore.startSlots(AppStateMt.puzzle);
  AppStateMt.held = null;
  AppStateMt.hint = null;
  setStatusMt("Back to the start.");
  renderMt();
  saveMtGame();
}

function hintMt() {
  const p = AppStateMt.puzzle;
  if (!p || AppStateMt.gameOver) return;
  AppStateMt.hinted = true;
  // A match in hand goes back first.
  if (AppStateMt.held !== null) {
    AppStateMt.set = AppStateMt.set.concat([AppStateMt.held]);
    AppStateMt.held = null;
  }
  if (!AppStateMt.sols) AppStateMt.sols = MatchesCore.solutions(p);
  AppStateMt.hint = MatchesCore.findHint(p, AppStateMt.set, AppStateMt.sols);
  setStatusMt("Hint: move the marked match to the marked place.");
  renderMt();
  saveMtGame();
}

function winMt() {
  AppStateMt.gameOver = true;
  AppStateMt.hint = null;
  const text = "Right! The puzzle is solved.";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusMt(text);
  if (typeof GameStorage !== "undefined") {
    const done = doneMt();
    done[AppStateMt.level + ":" + AppStateMt.index] = true;
    GameStorage.save(MT_DONE_KEY, done);
  }
  if (typeof GameStats !== "undefined") GameStats.record("matches", "win", { hinted: AppStateMt.hinted });
  if (window.ResultModal) window.ResultModal.show(tMt("mt_win_title"), I18n.msg(text));
  clearSavedMtGame();
  fillPuzzleListMt();
  document.getElementById("mt-number").value = String(AppStateMt.index);
  renderMt();
}

/*** Rendering ***/

// One match: a light stick with a black outline and a dark head at one
// end, drawn along the slot line.
function matchSvgMt(l, cls) {
  const dx = l.x2 - l.x1, dy = l.y2 - l.y1, len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len, inset = 4;
  const x1 = l.x1 + ux * inset, y1 = l.y1 + uy * inset, x2 = l.x2 - ux * inset, y2 = l.y2 - uy * inset;
  const hx = x2 - ux * 4, hy = y2 - uy * 4;
  return '<g class="' + (cls || "") + '"><path d="M' + x1.toFixed(1) + " " + y1.toFixed(1) + "L" + x2.toFixed(1) + " " + y2.toFixed(1) + '" stroke="#141413" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M' + x1.toFixed(1) + " " + y1.toFixed(1) + "L" + x2.toFixed(1) + " " + y2.toFixed(1) + '" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" rx="' + (ux ? 6 : 5) + '" ry="' + (ux ? 5 : 6) + '" fill="#141413"/></g>';
}

function frameSvgMt(l, cls) {
  const x = Math.min(l.x1, l.x2) - 8, y = Math.min(l.y1, l.y2) - 8;
  return '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + (Math.abs(l.x2 - l.x1) + 16) + '" height="' + (Math.abs(l.y2 - l.y1) + 16) + '" rx="6"/>';
}

function taskTextMt(p) {
  const key = (p.kind === "e" ? "mt_task_sum_" : "mt_task_sq_") + p.k;
  return tMt(key).split("{N}").join(String(p.n));
}

function renderMt() {
  const p = AppStateMt.puzzle;
  if (!p) return;
  const g = MatchesCore.geometry(p);
  const on = {};
  AppStateMt.set.forEach((id) => { on[id] = true; });
  let svg = '<svg class="pt-svg" viewBox="0 0 ' + g.w + " " + g.h + '" aria-hidden="true" focusable="false">';
  // Free places: thin dotted lines, clearer while a match is in hand.
  g.lines.forEach((l) => {
    if (!on[l.id]) svg += '<path d="M' + l.x1 + " " + l.y1 + "L" + l.x2 + " " + l.y2 + '" stroke="#141413" stroke-width="' + (AppStateMt.held !== null ? 1.6 : 0.8) + '" stroke-dasharray="2 5" stroke-linecap="round"/>';
  });
  g.lines.forEach((l) => { if (on[l.id]) svg += matchSvgMt(l); });
  if (AppStateMt.held !== null) {
    const l = g.lines.find((x) => x.id === AppStateMt.held);
    if (l) svg += frameSvgMt(l, "mt-held");
  }
  if (AppStateMt.hint) {
    [AppStateMt.hint.from, AppStateMt.hint.to].forEach((id) => {
      const l = g.lines.find((x) => x.id === id);
      if (l) svg += frameSvgMt(l, "pt-hint");
    });
  }
  svg += "</svg>";
  const box = document.getElementById("mt-board");
  let html = svg;
  g.lines.forEach((l, n) => {
    const horiz = l.y1 === l.y2;
    const len = Math.abs(horiz ? l.x2 - l.x1 : l.y2 - l.y1);
    const thick = Math.min(26, len * 0.5);
    const cx = (l.x1 + l.x2) / 2, cy = (l.y1 + l.y2) / 2;
    const w = horiz ? len * 0.8 : thick, h = horiz ? thick : len * 0.8;
    const style = "left:" + ((cx - w / 2) / g.w * 100).toFixed(2) + "%;top:" + ((cy - h / 2) / g.h * 100).toFixed(2) + "%;width:" + (w / g.w * 100).toFixed(2) + "%;height:" + (h / g.h * 100).toFixed(2) + "%";
    const state = on[l.id] ? tMt("mt_aria_full") : (AppStateMt.held === l.id ? tMt("mt_aria_held") : tMt("mt_aria_free"));
    html += '<button type="button" class="mt-slot" style="' + style + '" data-id="' + l.id + '" aria-label="' + tMt("mt_aria_place").split("{N}").join(String(n + 1)) + ": " + state + '"></button>';
  });
  box.innerHTML = html;
  box.style.maxWidth = (g.w / 12).toFixed(1) + "rem";
  box.querySelectorAll(".mt-slot").forEach((btn) => btn.addEventListener("click", () => onSlotMt(btn.getAttribute("data-id"))));
  // Read out what the matches show now.
  let reading = "";
  if (p.kind === "e") reading = MatchesCore.readSum(p.start, AppStateMt.set) || "?";
  else reading = tMt("mt_aria_squares").split("{N}").join(String(MatchesCore.countSquares(p.w, p.h, AppStateMt.set).n));
  box.setAttribute("aria-label", reading);
  const task = document.getElementById("mt-task");
  if (task) task.textContent = (AppStateMt.index + 1) + ". " + taskTextMt(p);
  const info = document.getElementById("mt-info");
  if (info) I18n.setMsg(info, "Moved: " + MatchesCore.movedCount(p, AppStateMt.set) + " of " + p.k);
  document.getElementById("mt-undo").disabled = AppStateMt.gameOver || !AppStateMt.history.length;
  document.getElementById("mt-reset").disabled = AppStateMt.gameOver;
  document.getElementById("mt-hint").disabled = AppStateMt.gameOver;
  document.getElementById("mt-next").classList.toggle("hidden", !AppStateMt.gameOver);
}

document.addEventListener("DOMContentLoaded", initMtApp);
