// catplaces-app.js
// Wires CatPlacesCore ("Cat Places", Katzenplätze) to catplaces.html.
//
// Tap a cell: once for a cat, again for a dot (a note to yourself that no
// cat goes there), a third time to clear it. Cats that break a rule
// (same row, column or room, or touching) get a dashed frame. Undo takes
// back the last tap, Hint frames a cat in the wrong place or a cell where
// a cat belongs. No time limit.

const KZ_SAVE_KEY = "einkchess_save_catplaces";
const KZ_CELL = 40;

const AppStateKz = {
  puzzle: null,
  marks: [],      // per cell: 0 empty, 1 cat, 2 dot
  history: [],    // [cell, previous mark]
  hint: -1,
  hintWrong: false,
  hinted: false,
  gameOver: false
};

function tKz(key) {
  return typeof I18n !== "undefined" ? I18n.t(key) : key;
}

function setStatusKz(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function catsKz() {
  return AppStateKz.marks.reduce((a, m, i) => (m === 1 ? a.concat(i) : a), []);
}

function saveKzGame() {
  if (typeof GameStorage === "undefined" || !AppStateKz.puzzle) return;
  GameStorage.save(KZ_SAVE_KEY, { puzzle: AppStateKz.puzzle, marks: AppStateKz.marks, history: AppStateKz.history, hinted: AppStateKz.hinted });
}

function clearSavedKzGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(KZ_SAVE_KEY);
}

function initKzApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSel = document.getElementById("kz-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  const animalSel = document.getElementById("kz-animal");
  if (animalSel) {
    animalSel.value = animalKz();
    animalSel.addEventListener("change", () => {
      setAnimalKz(animalSel.value);
      if (AppStateKz.puzzle) renderKz();
    });
  }
  document.getElementById("start-kz-game").addEventListener("click", () => startNewKzGame(levelSel.value));
  document.getElementById("kz-undo").addEventListener("click", undoKz);
  document.getElementById("kz-hint").addEventListener("click", hintKz);
  document.getElementById("kz-start").addEventListener("click", startHintKz);
  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => { if (AppStateKz.puzzle) renderKz(); });
  }
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(KZ_SAVE_KEY) : null;
  if (saved && saved.puzzle && Array.isArray(saved.puzzle.rooms) && Array.isArray(saved.marks) && saved.marks.length === saved.puzzle.rooms.length) {
    AppStateKz.puzzle = saved.puzzle;
    AppStateKz.marks = saved.marks;
    AppStateKz.history = saved.history || [];
    AppStateKz.hinted = !!saved.hinted;
    AppStateKz.gameOver = false;
    levelSel.value = saved.puzzle.level;
    showBoardKz();
    setStatusKz("Tap a cell: once for a cat, again for a dot, a third time to clear it.");
  }
}

function showBoardKz() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  renderKz();
}

function startNewKzGame(level) {
  const p = CatPlacesCore.generatePuzzle(level);
  AppStateKz.puzzle = p;
  AppStateKz.marks = p.rooms.map(() => 0);
  AppStateKz.history = [];
  AppStateKz.hint = -1;
  AppStateKz.hintWrong = false;
  AppStateKz.hinted = false;
  AppStateKz.gameOver = false;
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  if (window.ResultModal) window.ResultModal.hide();
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  showBoardKz();
  setStatusKz("Tap a cell: once for a cat, again for a dot, a third time to clear it.");
  saveKzGame();
}

function onCellKz(i) {
  const p = AppStateKz.puzzle;
  if (!p || AppStateKz.gameOver) return;
  const prev = AppStateKz.marks[i];
  AppStateKz.marks[i] = (prev + 1) % 3;
  AppStateKz.history.push([i, prev]);
  AppStateKz.hint = -1;
  const cats = catsKz();
  if (CatPlacesCore.isSolved(p, cats)) { winKz(); return; }
  if (CatPlacesCore.conflicts(p, cats).size) setStatusKz("Two cats share a row, column or room, or touch - see the dashed frames.");
  else setStatusKz("Tap a cell: once for a cat, again for a dot, a third time to clear it.");
  renderKz();
  saveKzGame();
}

function undoKz() {
  if (!AppStateKz.puzzle || AppStateKz.gameOver) return;
  if (!AppStateKz.history.length) {
    setStatusKz("Nothing to undo.");
    return;
  }
  const h = AppStateKz.history.pop();
  AppStateKz.marks[h[0]] = h[1];
  AppStateKz.hint = -1;
  setStatusKz("Undone.");
  renderKz();
  saveKzGame();
}

function hintKz() {
  const p = AppStateKz.puzzle;
  if (!p || AppStateKz.gameOver) return;
  const h = CatPlacesCore.findHint(p, catsKz());
  if (!h) return;
  AppStateKz.hinted = true;
  if (h.wrong !== undefined) {
    AppStateKz.hint = h.wrong;
    AppStateKz.hintWrong = true;
    setStatusKz("Hint: the marked cat is in the wrong place.");
  } else {
    AppStateKz.hint = h.place;
    AppStateKz.hintWrong = false;
    setStatusKz("Hint: a cat belongs in the marked cell.");
  }
  renderKz();
  saveKzGame();
}

// "Where to start?": frames a cell that surely gets a cat and says why.
function startHintKz() {
  const p = AppStateKz.puzzle;
  if (!p || AppStateKz.gameOver) return;
  const h = CatPlacesCore.findStart(p, catsKz());
  if (!h) { setStatusKz("There is no safe cell to point out right now."); return; }
  AppStateKz.hinted = true;
  AppStateKz.hint = h.place;
  AppStateKz.hintWrong = false;
  setStatusKz({
    row: "Start here: in this row only one cell is left for the cat.",
    col: "Start here: in this column only one cell is left for the cat.",
    room: "Start here: in this room only one cell is left for the cat.",
    think: "Start here: after some thinking, only this cell is left for its cat."
  }[h.reason]);
  renderKz();
  saveKzGame();
}

function winKz() {
  AppStateKz.gameOver = true;
  AppStateKz.hint = -1;
  const text = "All " + AppStateKz.puzzle.n + " cats have their places - solved!";
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, text);
  setStatusKz(text);
  if (typeof GameStats !== "undefined") GameStats.record("catplaces", "win", { hinted: AppStateKz.hinted });
  if (window.ResultModal) window.ResultModal.show(tKz("kz_win_title"), I18n.msg(text));
  clearSavedKzGame();
  renderKz();
}

/*** Rendering ***/

// A sleeping cat, curled up, seen from above-front: body, head with two
// ears, closed eyes, the tail around the front.
function catSvgKz(x, y, S) {
  const k = S / 40;
  const f = (v) => v.toFixed(1);
  const X = (v) => f(x + v * k), Y = (v) => f(y + v * k);
  return '<g class="kz-cat">' +
    '<ellipse cx="' + X(22) + '" cy="' + Y(25) + '" rx="' + f(13 * k) + '" ry="' + f(9 * k) + '" fill="#fff" stroke="#141413" stroke-width="' + f(2.2 * k) + '"/>' +
    '<path d="M' + X(9) + " " + Y(28) + "Q" + X(14) + " " + Y(36) + " " + X(30) + " " + Y(33) + '" fill="none" stroke="#141413" stroke-width="' + f(3.2 * k) + '" stroke-linecap="round"/>' +
    '<path d="M' + X(7) + " " + Y(15) + "L" + X(8) + " " + Y(6) + "L" + X(13) + " " + Y(11) + "L" + X(19) + " " + Y(11) + "L" + X(24) + " " + Y(6) + "L" + X(25) + " " + Y(15) + "Q" + X(25) + " " + Y(24) + " " + X(16) + " " + Y(24) + "Q" + X(7) + " " + Y(24) + " " + X(7) + " " + Y(15) + 'Z" fill="#141413"/>' +
    '<path d="M' + X(10.5) + " " + Y(16) + "Q" + X(12.5) + " " + Y(18) + " " + X(14.5) + " " + Y(16) + "M" + X(17.5) + " " + Y(16) + "Q" + X(19.5) + " " + Y(18) + " " + X(21.5) + " " + Y(16) + '" fill="none" stroke="#fff" stroke-width="' + f(1.6 * k) + '" stroke-linecap="round"/>' +
    "</g>";
}

// Figures (task 181): the same puzzle with other animals. Own simple
// drawings in a 40 x 40 box: a head in black and white, like the cat.
const KZ_ANIMALS = ["cat", "dog", "monkey", "elephant", "horse", "cow", "zebra", "giraffe", "bird"];
const KZ_ANIMAL_KEY = "einkchess_kz_animal";
const KZ_INK = "#141413";

function animalKz() {
  try {
    const v = localStorage.getItem(KZ_ANIMAL_KEY);
    if (KZ_ANIMALS.indexOf(v) !== -1) return v;
  } catch (e) { /* storage may be blocked */ }
  return "cat";
}

function setAnimalKz(v) {
  try { localStorage.setItem(KZ_ANIMAL_KEY, v); } catch (e) { /* ignore */ }
}

function eyesKz(x1, x2, y, r) {
  return '<circle cx="' + x1 + '" cy="' + y + '" r="' + r + '" fill="' + KZ_INK + '"/><circle cx="' + x2 + '" cy="' + y + '" r="' + r + '" fill="' + KZ_INK + '"/>';
}

const KZ_DRAW = {
  dog: () =>
    '<ellipse cx="10" cy="19" rx="4.5" ry="9" fill="' + KZ_INK + '" transform="rotate(12 10 19)"/>' +
    '<ellipse cx="30" cy="19" rx="4.5" ry="9" fill="' + KZ_INK + '" transform="rotate(-12 30 19)"/>' +
    '<ellipse cx="20" cy="21" rx="9.5" ry="10.5" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    eyesKz(16, 24, 18, 1.6) +
    '<ellipse cx="20" cy="26" rx="5" ry="3.6" fill="#fff" stroke="' + KZ_INK + '" stroke-width="1.6"/>' +
    '<ellipse cx="20" cy="24.6" rx="2.2" ry="1.5" fill="' + KZ_INK + '"/>' +
    '<path d="M20 26 V29 M16.5 29.5 Q20 32 23.5 29.5" fill="none" stroke="' + KZ_INK + '" stroke-width="1.4" stroke-linecap="round"/>',
  monkey: () =>
    '<circle cx="8.5" cy="20" r="5" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<circle cx="31.5" cy="20" r="5" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<circle cx="20" cy="19" r="11" fill="' + KZ_INK + '"/>' +
    '<path d="M12 18 Q14 13 20 16 Q26 13 28 18 Q29 26 20 31 Q11 26 12 18Z" fill="#fff"/>' +
    eyesKz(16.5, 23.5, 19, 1.5) +
    '<ellipse cx="18.4" cy="24.5" rx="0.9" ry="1.2" fill="' + KZ_INK + '"/><ellipse cx="21.6" cy="24.5" rx="0.9" ry="1.2" fill="' + KZ_INK + '"/>' +
    '<path d="M16.5 27.5 Q20 29.5 23.5 27.5" fill="none" stroke="' + KZ_INK + '" stroke-width="1.4" stroke-linecap="round"/>',
  elephant: () =>
    '<ellipse cx="8" cy="18" rx="6.5" ry="9" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<ellipse cx="32" cy="18" rx="6.5" ry="9" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<circle cx="20" cy="17" r="9" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    eyesKz(16.5, 23.5, 15, 1.5) +
    '<path d="M16 22 Q15 33 20 35 Q23 36 24 32 M24 22 Q25 28 24 32" fill="none" stroke="' + KZ_INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M14 26 Q12 32 14.5 34" fill="none" stroke="' + KZ_INK + '" stroke-width="1.6" stroke-linecap="round"/>',
  horse: () =>
    '<path d="M13 14 L12 4 L18 10 Z M27 14 L28 4 L22 10 Z" fill="' + KZ_INK + '"/>' +
    '<path d="M20 5 Q16 8 17 14 L23 14 Q24 8 20 5Z" fill="' + KZ_INK + '"/>' +
    '<path d="M13 12 Q20 8 27 12 L25 28 Q24 35 20 35 Q16 35 15 28Z" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M18 10 Q20 6 22 10" fill="' + KZ_INK + '"/>' +
    eyesKz(15.8, 24.2, 16, 1.5) +
    '<ellipse cx="18" cy="31" rx="1" ry="1.5" fill="' + KZ_INK + '"/><ellipse cx="22" cy="31" rx="1" ry="1.5" fill="' + KZ_INK + '"/>',
  cow: () =>
    '<path d="M11 11 Q8 5 4 6 M29 11 Q32 5 36 6" fill="none" stroke="' + KZ_INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="7" cy="16" rx="5" ry="2.8" fill="' + KZ_INK + '" transform="rotate(-15 7 16)"/>' +
    '<ellipse cx="33" cy="16" rx="5" ry="2.8" fill="' + KZ_INK + '" transform="rotate(15 33 16)"/>' +
    '<ellipse cx="20" cy="20" rx="10" ry="11" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<path d="M11 14 Q14 9 19 11 Q18 17 13 18 Q10 18 11 14Z" fill="' + KZ_INK + '"/>' +
    eyesKz(16, 25, 19, 1.5) +
    '<ellipse cx="20" cy="29" rx="6.5" ry="4.5" fill="#fff" stroke="' + KZ_INK + '" stroke-width="1.8"/>' +
    '<ellipse cx="17.6" cy="29" rx="1" ry="1.4" fill="' + KZ_INK + '"/><ellipse cx="22.4" cy="29" rx="1" ry="1.4" fill="' + KZ_INK + '"/>',
  zebra: () =>
    '<path d="M13 14 L12 4 L18 10 Z M27 14 L28 4 L22 10 Z" fill="' + KZ_INK + '"/>' +
    '<path d="M20 5 Q16 8 17 14 L23 14 Q24 8 20 5Z" fill="' + KZ_INK + '"/>' +
    '<path d="M13 12 Q20 8 27 12 L25 28 Q24 35 20 35 Q16 35 15 28Z" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M13.2 16 L19 18 M26.8 16 L21 18 M14 21 L19 22.5 M26 21 L21 22.5 M14.6 26 L18.6 26.5 M25.4 26 L21.4 26.5" stroke="' + KZ_INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M18 10 Q20 6 22 10" fill="' + KZ_INK + '"/>' +
    '<ellipse cx="18" cy="31" rx="1" ry="1.5" fill="' + KZ_INK + '"/><ellipse cx="22" cy="31" rx="1" ry="1.5" fill="' + KZ_INK + '"/>',
  giraffe: () =>
    '<path d="M16 11 L15 4 M24 11 L25 4" stroke="' + KZ_INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="15" cy="3.8" r="2" fill="' + KZ_INK + '"/><circle cx="25" cy="3.8" r="2" fill="' + KZ_INK + '"/>' +
    '<ellipse cx="9" cy="15" rx="5" ry="2.4" fill="#fff" stroke="' + KZ_INK + '" stroke-width="1.8" transform="rotate(-20 9 15)"/>' +
    '<ellipse cx="31" cy="15" rx="5" ry="2.4" fill="#fff" stroke="' + KZ_INK + '" stroke-width="1.8" transform="rotate(20 31 15)"/>' +
    '<path d="M14 11 Q20 8 26 11 L25 28 Q24 35 20 35 Q16 35 15 28Z" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<circle cx="17" cy="13" r="1.6" fill="' + KZ_INK + '"/><circle cx="23.5" cy="14" r="1.2" fill="' + KZ_INK + '"/><circle cx="19.5" cy="26" r="1.2" fill="' + KZ_INK + '"/>' +
    eyesKz(16.5, 23.5, 18, 1.5) +
    '<ellipse cx="18.2" cy="31" rx="0.9" ry="1.3" fill="' + KZ_INK + '"/><ellipse cx="21.8" cy="31" rx="0.9" ry="1.3" fill="' + KZ_INK + '"/>',
  bird: () =>
    '<path d="M9 24 L2 20 L3 29Z" fill="' + KZ_INK + '"/>' +
    '<ellipse cx="19" cy="25" rx="12" ry="9" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<path d="M12 24 Q18 17 26 26 Q19 32 12 24Z" fill="' + KZ_INK + '"/>' +
    '<circle cx="28" cy="15" r="6" fill="#fff" stroke="' + KZ_INK + '" stroke-width="2.2"/>' +
    '<path d="M33 13.5 L39 16 L33 18Z" fill="' + KZ_INK + '"/>' +
    '<circle cx="28.5" cy="14" r="1.4" fill="' + KZ_INK + '"/>' +
    '<path d="M18 34 V38 M23 34 V38" stroke="' + KZ_INK + '" stroke-width="1.8" stroke-linecap="round"/>'
};

function animalSvgKz(x, y, S) {
  const k = S / 40;
  const kind = animalKz();
  if (kind === "cat" || !KZ_DRAW[kind]) return catSvgKz(x, y, S);
  return '<g class="kz-cat" transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + k.toFixed(3) + ')">' + KZ_DRAW[kind]() + "</g>";
}

function renderKz() {
  const p = AppStateKz.puzzle;
  if (!p) return;
  const n = p.n, S = KZ_CELL, W = n * S;
  const cats = catsKz();
  const bad = CatPlacesCore.conflicts(p, cats);
  const b = CatPlacesCore.borders(p);
  let svg = '<svg class="pt-svg" viewBox="-2 -2 ' + (W + 4) + " " + (W + 4) + '" aria-hidden="true" focusable="false">' +
    '<rect x="0" y="0" width="' + W + '" height="' + W + '" fill="#fff"/>';
  // Thin dotted grid, thick room borders.
  let thin = "", thick = "";
  for (let i = 0; i < n * n; i++) {
    const x = (i % n) * S, y = Math.floor(i / n) * S;
    if (i % n < n - 1) (b.right[i] ? (s) => { thick += s; } : (s) => { thin += s; })("M" + (x + S) + " " + y + "V" + (y + S));
    if (i < n * (n - 1)) (b.bottom[i] ? (s) => { thick += s; } : (s) => { thin += s; })("M" + x + " " + (y + S) + "H" + (x + S));
  }
  svg += '<path d="' + thin + '" stroke="#141413" stroke-width="0.7" stroke-dasharray="2 3"/>';
  for (let i = 0; i < n * n; i++) {
    const x = (i % n) * S, y = Math.floor(i / n) * S, m = AppStateKz.marks[i];
    if (m === 1) svg += animalSvgKz(x, y, S);
    else if (m === 2) svg += '<circle class="kz-dot" cx="' + (x + S / 2) + '" cy="' + (y + S / 2) + '" r="' + (S * 0.09) + '" fill="#141413"/>';
    if (m === 1 && bad.has(i)) svg += '<rect class="kz-conflict" x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (S - 6) + '" height="' + (S - 6) + '"/>';
  }
  svg += '<path d="' + thick + '" stroke="#141413" stroke-width="3.5" stroke-linecap="square"/>';
  if (AppStateKz.hint >= 0) {
    const i = AppStateKz.hint;
    svg += '<rect class="pt-hint" x="' + ((i % n) * S + 4) + '" y="' + (Math.floor(i / n) * S + 4) + '" width="' + (S - 8) + '" height="' + (S - 8) + '"/>';
  }
  svg += '<rect x="0" y="0" width="' + W + '" height="' + W + '" fill="none" stroke="#141413" stroke-width="4"/></svg>';
  const boardEl = document.getElementById("kz-board");
  const ix = (200 / (W + 4)).toFixed(3) + "%";
  let html = svg + '<div class="pt-cells" style="left:' + ix + ";right:" + ix + ";top:" + ix + ";bottom:" + ix +
    ";grid-template-columns:repeat(" + n + ",1fr);grid-template-rows:repeat(" + n + ',1fr)">';
  for (let i = 0; i < n * n; i++) html += '<button type="button" class="pt-cell" data-i="' + i + '"></button>';
  boardEl.innerHTML = html + "</div>";
  boardEl.style.maxWidth = (n * 3.4) + "rem";
  boardEl.querySelectorAll(".pt-cell").forEach((btn) => {
    const i = parseInt(btn.getAttribute("data-i"), 10);
    const m = AppStateKz.marks[i];
    const what = tKz(m === 1 ? "kz_animal_" + animalKz() : m === 2 ? "kz_aria_dot" : "kz_aria_empty");
    const label = tKz("kz_aria_cell").split("{R}").join(String(Math.floor(i / n) + 1)).split("{C}").join(String((i % n) + 1)).split("{K}").join(String(p.rooms[i] + 1));
    btn.setAttribute("aria-label", label + ": " + what);
    btn.addEventListener("click", () => onCellKz(i));
  });
  const info = document.getElementById("kz-info");
  if (info) I18n.setMsg(info, "Cats: " + cats.length + " of " + n);
  document.getElementById("kz-undo").disabled = AppStateKz.gameOver || !AppStateKz.history.length;
  document.getElementById("kz-hint").disabled = AppStateKz.gameOver;
  document.getElementById("kz-start").disabled = AppStateKz.gameOver;
}

document.addEventListener("DOMContentLoaded", initKzApp);
