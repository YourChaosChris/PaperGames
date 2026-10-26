// advent-app.js
// The page of the puzzle Advent calendar (advent-core.js): the 24 doors as
// a grid, and behind an open door its puzzle, drawn here from the puzzle
// data (the games' own pages draw into fixed element ids, so their code is
// not reused for drawing). Digits are entered by tapping a cell and then a
// number below; a picture cell cycles empty - filled - crossed; a light
// switches itself and its neighbours.
//
// Saved under einkchess_save_advent: { v, year, solved, work } (see
// AdventCore.normalizeSave). "Open all doors" is remembered on its own
// (papergames_advent_all_open), not in the save.

const ADVENT_SAVE_KEY = "einkchess_save_advent";
const ADVENT_ALL_KEY = "papergames_advent_all_open";

const AppStateAdvent = {
  save: null,
  allOpen: false,
  door: 0,        // the open puzzle (0 = calendar)
  selected: -1,   // selected cell of a digit puzzle
  // Tests set a date here (Date) instead of the device clock.
  now: null
};

function tAdv(key, values) {
  let text = window.I18n ? I18n.t(key) : key;
  Object.keys(values || {}).forEach((k) => { text = text.split("{" + k + "}").join(String(values[k])); });
  return text;
}
function nowAdv() { return AppStateAdvent.now || new Date(); }

function loadAdvent() {
  const year = AdventCore.dayOf(nowAdv()).year;
  const raw = typeof GameStorage !== "undefined" ? GameStorage.load(ADVENT_SAVE_KEY) : null;
  AppStateAdvent.save = AdventCore.normalizeSave(raw, year);
  try { AppStateAdvent.allOpen = localStorage.getItem(ADVENT_ALL_KEY) === "1"; } catch (e) { AppStateAdvent.allOpen = false; }
}

function storeAdvent() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(ADVENT_SAVE_KEY, AppStateAdvent.save);
}

function statesAdv() {
  return AdventCore.doorStates(nowAdv(), AppStateAdvent.save.solved, AppStateAdvent.allOpen);
}

// ---- The calendar ----

function renderCalendarAdv() {
  const states = statesAdv();
  const wrap = document.getElementById("adv-doors");
  wrap.innerHTML = "";
  const today = AdventCore.season(nowAdv()) === "advent" ? AdventCore.dayOf(nowAdv()).day : 0;
  for (let n = 1; n <= AdventCore.COUNT; n++) {
    const st = states[n];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "adv-door-btn adv-" + st + (n === today ? " adv-today" : "");
    b.setAttribute("data-door", String(n));
    b.innerHTML = '<span class="adv-num">' + n + "</span>" + (st === "solved" ? '<span class="adv-mark" aria-hidden="true">&#10003;</span>' : "");
    b.setAttribute("aria-label", tAdv("adv_door_" + st + "_aria", { n }));
    b.addEventListener("click", () => tapDoorAdv(n));
    wrap.appendChild(b);
  }
  document.getElementById("board-info").textContent = calendarLineAdv(states);
  document.getElementById("adv-new-game").disabled = !AdventCore.nextDoor(states, nowAdv());
}

// "Open the next door": today's door, else the lowest open unsolved one.
function openNextAdv() {
  const n = AdventCore.nextDoor(statesAdv(), nowAdv());
  if (n) openDoorAdv(n);
}

function calendarLineAdv(states) {
  const when = AdventCore.season(nowAdv());
  const done = AppStateAdvent.save.solved.length;
  const count = done ? " " + tAdv("adv_count", { n: done }) : "";
  if (AppStateAdvent.allOpen) return tAdv("adv_line_all_open") + count;
  if (when === "before") return tAdv("adv_line_before");
  if (when === "after") return tAdv("adv_line_after") + count;
  const next = AdventCore.nextDoor(states, nowAdv());
  if (done === AdventCore.COUNT) return tAdv("adv_line_all_done");
  return (next ? tAdv("adv_line_today", { n: next }) : tAdv("adv_line_wait")) + count;
}

function tapDoorAdv(n) {
  const st = statesAdv()[n];
  if (st === "closed") {
    const why = AdventCore.closedReason(nowAdv(), AppStateAdvent.save.solved, n);
    document.getElementById("board-info").textContent = tAdv("adv_closed_" + why, { n, m: n - 1 });
    return;
  }
  openDoorAdv(n);
}

// ---- A door ----

function workAdv(p) {
  const saved = AppStateAdvent.save.work[p.n];
  const w = AdventCore.fitWork(p, saved);
  return AppStateAdvent.save.solved.indexOf(p.n) !== -1 && !AdventCore.isSolved(p, w) ? solvedWorkAdv(p) : w;
}

// The filled-in solution, shown for a solved door whose work is missing.
function solvedWorkAdv(p) {
  if (p.kind === "lights") return new Array(p.size * p.size).fill(false);
  if (p.kind === "nonogram") return [].concat.apply([], p.solution).map((v) => (v ? 1 : 0));
  return p.solution.slice();
}

function openDoorAdv(n) {
  const p = AdventCore.puzzle(n);
  if (!p) return;
  AppStateAdvent.door = n;
  AppStateAdvent.selected = -1;
  document.getElementById("adv-calendar").classList.add("hidden");
  document.getElementById("adv-door").classList.remove("hidden");
  renderDoorAdv();
  const title = document.getElementById("adv-door-title");
  if (title.scrollIntoView) title.scrollIntoView();
}

function closeDoorAdv() {
  AppStateAdvent.door = 0;
  document.getElementById("adv-door").classList.add("hidden");
  document.getElementById("adv-calendar").classList.remove("hidden");
  renderCalendarAdv();
}

function renderDoorAdv() {
  const n = AppStateAdvent.door;
  const p = AdventCore.puzzle(n);
  const w = workAdv(p);
  const solved = AppStateAdvent.save.solved.indexOf(n) !== -1;
  document.getElementById("adv-door-title").textContent = tAdv("adv_door_title", { n, name: tAdv("adv_kind_" + p.kind) });
  document.getElementById("adv-door-how").textContent = tAdv("adv_how_" + p.kind);
  const box = document.getElementById("adv-puzzle");
  box.innerHTML = "";
  box.className = "adv-puzzle adv-kind-" + p.kind + (solved ? " adv-puzzle-solved" : "");
  box.appendChild(DRAW_ADV[p.kind](p, w, solved));
  renderPadAdv(p, solved);
  document.getElementById("adv-solved").classList.toggle("hidden", !solved);
  document.getElementById("adv-solved-text").textContent = solved ? tAdv("adv_text_" + n) : "";
  document.getElementById("adv-reset").classList.toggle("hidden", solved);
  const note = document.getElementById("adv-door-note");
  note.textContent = !solved && AdventCore.isFull(p, w) ? tAdv("adv_not_yet") : "";
  document.getElementById("board-info").textContent = (solved ? tAdv("adv_line_solved", { n }) + " " : "") + tAdv("adv_count", { n: AppStateAdvent.save.solved.length });
}

function cellBtnAdv(label, cls, onTap, aria) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "adv-cell " + (cls || "");
  b.textContent = label;
  if (aria) b.setAttribute("aria-label", aria);
  if (onTap) b.addEventListener("click", onTap); else b.disabled = true;
  return b;
}

function gridAdv(cols, extraClass) {
  const g = document.createElement("div");
  g.className = "adv-grid " + (extraClass || "");
  g.style.gridTemplateColumns = cols;
  return g;
}

// A digit cell (sudoku, futoshiki, skyscrapers, calcudoku).
function digitCellAdv(p, w, i, solved, cls) {
  const given = AdventCore.isGiven(p, i);
  const r = Math.floor(i / p.size) + 1, c = (i % p.size) + 1;
  const aria = tAdv("adv_cell_aria", { r, c }) + (w[i] ? ": " + w[i] : "");
  const tap = solved || given ? null : () => { AppStateAdvent.selected = i; renderDoorAdv(); };
  const b = cellBtnAdv(w[i] ? String(w[i]) : "", (cls || "") + (given ? " adv-given" : "") + (i === AppStateAdvent.selected ? " adv-selected" : ""), tap, aria);
  if (given) { b.disabled = false; b.setAttribute("aria-disabled", "true"); }
  return b;
}

function drawSudokuAdv(p, w, solved) {
  const n = p.size, cfg = AnimalSudokuCore.SIZES[n];
  const g = gridAdv("repeat(" + n + ", 1fr)", "adv-grid-" + n);
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n;
    let cls = "";
    if (c % cfg.boxCols === 0 && c) cls += " adv-thick-l";
    if (r % cfg.boxRows === 0 && r) cls += " adv-thick-t";
    g.appendChild(digitCellAdv(p, w, i, solved, cls));
  }
  return g;
}

function drawFutoshikiAdv(p, w, solved) {
  const n = p.size;
  const cols = [];
  for (let c = 0; c < n; c++) cols.push(c < n - 1 ? "1fr 0.42fr" : "1fr");
  const g = gridAdv(cols.join(" "), "adv-grid-futo");
  const sign = (a, b) => {
    const e = p.ineq.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (!e) return "";
    const horizontal = Math.abs(a - b) === 1;
    if (horizontal) return e.a === a ? "<" : ">";
    return e.a === a ? "∧" : "∨";
  };
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      g.appendChild(digitCellAdv(p, w, i, solved, ""));
      if (c < n - 1) { const s = document.createElement("span"); s.className = "adv-sign"; s.textContent = sign(i, i + 1); g.appendChild(s); }
    }
    if (r < n - 1) {
      for (let c = 0; c < n; c++) {
        const s = document.createElement("span");
        s.className = "adv-sign adv-sign-v";
        s.textContent = sign(r * n + c, (r + 1) * n + c);
        g.appendChild(s);
        if (c < n - 1) g.appendChild(document.createElement("span"));
      }
    }
  }
  return g;
}

function drawSkyscrapersAdv(p, w, solved) {
  const n = p.size;
  const g = gridAdv("repeat(" + (n + 2) + ", 1fr)", "adv-grid-sky");
  const clue = (v) => { const s = document.createElement("span"); s.className = "adv-clue"; s.textContent = v == null ? "" : String(v); return s; };
  g.appendChild(clue(null));
  for (let c = 0; c < n; c++) g.appendChild(clue(p.clues.top[c]));
  g.appendChild(clue(null));
  for (let r = 0; r < n; r++) {
    g.appendChild(clue(p.clues.left[r]));
    for (let c = 0; c < n; c++) g.appendChild(digitCellAdv(p, w, r * n + c, solved, ""));
    g.appendChild(clue(p.clues.right[r]));
  }
  g.appendChild(clue(null));
  for (let c = 0; c < n; c++) g.appendChild(clue(p.clues.bottom[c]));
  g.appendChild(clue(null));
  return g;
}

function drawCalcudokuAdv(p, w, solved) {
  const n = p.size;
  const cageOf = new Array(n * n);
  p.cages.forEach((cage, k) => cage.cells.forEach((i) => { cageOf[i] = k; }));
  const g = gridAdv("repeat(" + n + ", 1fr)", "adv-grid-" + n);
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, k = cageOf[i];
    let cls = "adv-cage";
    if (c && cageOf[i - 1] !== k) cls += " adv-thick-l";
    if (r && cageOf[i - n] !== k) cls += " adv-thick-t";
    const b = digitCellAdv(p, w, i, solved, cls);
    const cage = p.cages[k];
    if (Math.min.apply(null, cage.cells) === i) {
      const lab = document.createElement("span");
      lab.className = "adv-cage-label";
      lab.textContent = CalcudokuCore.cageLabel(cage);
      b.appendChild(lab);
      b.setAttribute("aria-label", b.getAttribute("aria-label") + ", " + lab.textContent);
    }
    g.appendChild(b);
  }
  return g;
}

function drawNonogramAdv(p, w, solved) {
  const n = p.size;
  const g = gridAdv("auto repeat(" + n + ", 1fr)", "adv-grid-nono");
  g.appendChild(document.createElement("span"));
  for (let c = 0; c < n; c++) {
    const s = document.createElement("span");
    s.className = "adv-clue adv-clue-col";
    s.innerHTML = p.clues.cols[c].join("<br>");
    g.appendChild(s);
  }
  for (let r = 0; r < n; r++) {
    const s = document.createElement("span");
    s.className = "adv-clue adv-clue-row";
    s.textContent = p.clues.rows[r].join(" ");
    g.appendChild(s);
    for (let c = 0; c < n; c++) {
      const i = r * n + c, v = w[i];
      const tap = solved ? null : () => {
        const work = workAdv(p);
        work[i] = (work[i] + 1) % 3;
        changeWorkAdv(p, work);
      };
      const state = v === 1 ? "adv_state_filled" : v === 2 ? "adv_state_crossed" : "adv_state_empty";
      g.appendChild(cellBtnAdv(v === 2 ? "×" : "", v === 1 ? "adv-filled" : v === 2 ? "adv-crossed" : "", tap,
        tAdv("adv_cell_aria", { r: r + 1, c: c + 1 }) + ": " + tAdv(state)));
    }
  }
  return g;
}

function drawLightsAdv(p, w, solved) {
  const n = p.size;
  const g = gridAdv("repeat(" + n + ", 1fr)", "adv-grid-lights");
  for (let i = 0; i < n * n; i++) {
    const tap = solved ? null : () => changeWorkAdv(p, AdventCore.pressLight(p, workAdv(p), i));
    g.appendChild(cellBtnAdv("", w[i] ? "adv-on" : "adv-off", tap,
      tAdv("adv_cell_aria", { r: Math.floor(i / n) + 1, c: (i % n) + 1 }) + ": " + tAdv(w[i] ? "adv_state_on" : "adv_state_off")));
  }
  return g;
}

const DRAW_ADV = {
  sudoku: drawSudokuAdv,
  futoshiki: drawFutoshikiAdv,
  skyscrapers: drawSkyscrapersAdv,
  calcudoku: drawCalcudokuAdv,
  nonogram: drawNonogramAdv,
  lights: drawLightsAdv
};

function renderPadAdv(p, solved) {
  const pad = document.getElementById("adv-pad");
  pad.innerHTML = "";
  const digits = p.kind !== "lights" && p.kind !== "nonogram";
  pad.classList.toggle("hidden", !digits || solved);
  if (!digits || solved) return;
  for (let v = 1; v <= p.size; v++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "secondary adv-pad-btn";
    b.textContent = String(v);
    b.addEventListener("click", () => enterAdv(v));
    pad.appendChild(b);
  }
  const del = document.createElement("button");
  del.type = "button";
  del.className = "secondary adv-pad-btn adv-pad-erase";
  del.textContent = tAdv("adv_erase");
  del.addEventListener("click", () => enterAdv(0));
  pad.appendChild(del);
}

function enterAdv(v) {
  const p = AdventCore.puzzle(AppStateAdvent.door);
  const i = AppStateAdvent.selected;
  if (!p || i < 0 || AdventCore.isGiven(p, i)) {
    document.getElementById("adv-door-note").textContent = tAdv("adv_pick_cell");
    return;
  }
  const work = workAdv(p);
  work[i] = v;
  changeWorkAdv(p, work);
}

function changeWorkAdv(p, work) {
  const save = AppStateAdvent.save;
  save.work[p.n] = work;
  if (AdventCore.isSolved(p, work) && save.solved.indexOf(p.n) === -1) {
    save.solved.push(p.n);
    save.solved.sort((a, b) => a - b);
    AppStateAdvent.selected = -1;
    if (typeof GameStats !== "undefined") GameStats.record("advent", "win");
  }
  storeAdvent();
  renderDoorAdv();
}

function resetDoorAdv() {
  const p = AdventCore.puzzle(AppStateAdvent.door);
  if (!p || AppStateAdvent.save.solved.indexOf(p.n) !== -1) return;
  delete AppStateAdvent.save.work[p.n];
  AppStateAdvent.selected = -1;
  storeAdvent();
  renderDoorAdv();
}

function renderAdvent() {
  if (AppStateAdvent.door) renderDoorAdv(); else renderCalendarAdv();
}

function initAdventApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      if (window.I18n) I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  loadAdvent();
  const all = document.getElementById("adv-all-open");
  all.checked = AppStateAdvent.allOpen;
  all.addEventListener("change", () => {
    AppStateAdvent.allOpen = all.checked;
    try { localStorage.setItem(ADVENT_ALL_KEY, all.checked ? "1" : "0"); } catch (e) {}
    if (AppStateAdvent.door && statesAdv()[AppStateAdvent.door] === "closed") closeDoorAdv(); else renderAdvent();
  });
  document.getElementById("adv-back").addEventListener("click", closeDoorAdv);
  document.getElementById("adv-new-game").addEventListener("click", openNextAdv);
  document.getElementById("adv-reset").addEventListener("click", resetDoorAdv);
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(renderAdvent);
  renderCalendarAdv();
}

document.addEventListener("DOMContentLoaded", initAdventApp);
