// zahlenschloss-app.js
// Wires ZahlenschlossCore ("Zahlenschloss", en "Lock Logic") to
// zahlenschloss.html. A puzzle for one person: find the code from the
// clues. No mode, no timer, nothing animated. "Show solution" (after a
// question on the page) puts the code in and counts the puzzle as given up.
//
// - Clues: one card per clue, its digits as boxes (like cards), under them
//   the sentences (each its own element, through I18n.setMsg).
// - Notes: tapping a digit of a clue crosses it out or back in
//   (state.struck[clue] = places). "Undo" (#zl-undo, not #undo-btn: that id
//   is counted by tests/undo.js) takes the last note back (state.undo).
// - Code: 3 or 4 fields, the chosen one has a thick frame; digit keys 0-9,
//   "Delete", "Unlock" (#zl-check). Digits may not repeat: a digit already in another
//   field is locked on the keypad (dashed frame) until it is deleted there.
// - Hint: ZahlenschlossCore.hint(puzzle, state.hints); the facts join
//   state.hints, the clues it uses get a thick frame, the sentence shows in
//   the status line.
// The board is built once per puzzle; a tap only changes classes and texts.

const ZAHLENSCHLOSS_SAVE_KEY = "einkchess_save_zahlenschloss";
const ZL_NEXT_KEY = "papergames_zahlenschloss_next";
const ZL_EMPTY = "_";

const AppStateZL = {
  state: null,
  sel: 0,          // the code field chosen for the next digit
  built: ""        // level:number of the board built last
};

/*** Save and load ***/

function saveZL() {
  if (typeof GameStorage === "undefined" || !AppStateZL.state) return;
  if (AppStateZL.state.solved) { GameStorage.clear(ZAHLENSCHLOSS_SAVE_KEY); return; }
  GameStorage.save(ZAHLENSCHLOSS_SAVE_KEY, { state: AppStateZL.state });
}

// The number of the next puzzle at this level (1, 2, 3 ...), remembered,
// and the level played last (`level`).
function nextNumberZL(level) {
  let next = {};
  try { next = JSON.parse(window.localStorage.getItem(ZL_NEXT_KEY) || "{}") || {}; } catch (e) { next = {}; }
  const n = Number.isInteger(next[level]) && next[level] > 0 ? next[level] : 1;
  next[level] = n + 1;
  next.level = level;
  try { window.localStorage.setItem(ZL_NEXT_KEY, JSON.stringify(next)); } catch (e) { /* the same puzzle may come again */ }
  return n;
}

// A saved state whose clues lead to its code alone (else it is dropped).
// Checked against the clues, not against generate(): a puzzle saved before
// the easy level changed (task 237) stays playable.
function validZL(s) {
  if (!s || !ZahlenschlossCore.LEVELS[s.level] || !Number.isInteger(s.number) || s.number < 1) return false;
  const d = ZahlenschlossCore.LEVELS[s.level].digits;
  if (s.digits !== d || typeof s.code !== "string" || !Array.isArray(s.clues) || !s.clues.length) return false;
  if (!s.clues.every((c) => c && typeof c.guess === "string" && c.guess.length === d && Number.isInteger(c.right) && Number.isInteger(c.wrong))) return false;
  if (ZahlenschlossCore.solutions(s.clues, d).join() !== s.code) return false;
  if (!Array.isArray(s.struck) || s.struck.length !== s.clues.length) return false;
  return typeof s.entry === "string" && Array.isArray(s.hints);
}

// Fills in fields a state from the core does not have yet.
function normaliseZL(s) {
  let e = String(s.entry || "");
  while (e.length < s.digits) e += ZL_EMPTY;
  s.entry = e.slice(0, s.digits);
  if (!Array.isArray(s.undo)) s.undo = [];
  if (!Number.isInteger(s.hintCount)) s.hintCount = 0;
  if (!Number.isInteger(s.mistakes)) s.mistakes = 0;
  if (s.lastHint === undefined) s.lastHint = null;
  return s;
}

/*** Game flow ***/

function startZL() {
  const sel = document.getElementById("zahlenschloss-level");
  const level = ZahlenschlossCore.LEVELS[Number(sel.value)] ? Number(sel.value) : 1;
  setStateZL(normaliseZL(ZahlenschlossCore.createInitialState(level, nextNumberZL(level))));
  if (window.ResultModal) window.ResultModal.hide();
  saveZL();
}

function setStateZL(s) {
  AppStateZL.state = s;
  AppStateZL.sel = firstEmptyZL(s, 0);
  document.getElementById("zahlenschloss-level").value = String(s.level);
  askSolveZL(false);
  showBoardZL();
  buildZL();
  updateZL();
}

function showBoardZL() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const panel = document.getElementById("settings-panel");
  const toggle = document.getElementById("menu-toggle");
  if (panel) panel.classList.add("hidden");
  if (toggle) I18n.setKey(toggle, "menu_toggle");
}

// The first empty field from `from` on (round to the start), or `from`.
function firstEmptyZL(s, from) {
  for (let i = 0; i < s.digits; i++) {
    const p = (from + i) % s.digits;
    if (s.entry[p] === ZL_EMPTY) return p;
  }
  return Math.min(from, s.digits - 1);
}

function setEntryZL(place, ch) {
  const s = AppStateZL.state;
  s.entry = s.entry.slice(0, place) + ch + s.entry.slice(place + 1);
}

function typeDigitZL(d) {
  const s = AppStateZL.state;
  if (!s || s.solved) return;
  const ch = String(d);
  const at = s.entry.indexOf(ch);
  if (at !== -1 && at !== AppStateZL.sel) return; // locked: already in another field
  setEntryZL(AppStateZL.sel, ch);
  AppStateZL.sel = firstEmptyZL(s, (AppStateZL.sel + 1) % s.digits);
  setStatusZL("");
  updateZL();
  saveZL();
}

// Deletes the chosen digit, or else the last digit before the chosen field.
function eraseZL() {
  const s = AppStateZL.state;
  if (!s || s.solved) return;
  let p = AppStateZL.sel;
  if (s.entry[p] === ZL_EMPTY) {
    p = -1;
    for (let i = s.digits - 1; i >= 0; i--) if (s.entry[i] !== ZL_EMPTY) { p = i; break; }
    if (p < 0) return;
  }
  setEntryZL(p, ZL_EMPTY);
  AppStateZL.sel = p;
  setStatusZL("");
  updateZL();
  saveZL();
}

function selectFieldZL(p) {
  const s = AppStateZL.state;
  if (!s || s.solved || p === AppStateZL.sel) return;
  AppStateZL.sel = p;
  updateZL();
}

function checkZL() {
  const s = AppStateZL.state;
  if (!s || s.solved) return;
  if (s.entry.indexOf(ZL_EMPTY) !== -1) {
    setStatusZL(s.digits === 4 ? "Fill in all 4 fields first." : "Fill in all 3 fields first.");
    return;
  }
  if (s.entry === s.code) {
    s.solved = true;
    updateZL();
    finishZL();
  } else {
    s.mistakes++;
    updateZL();
    setStatusZL("Not the code. Mistakes: " + s.mistakes + ".");
  }
  saveZL();
}

function finishZL() {
  const s = AppStateZL.state;
  const text = "The lock is open. Mistakes: " + s.mistakes + ". Hints: " + s.hintCount + ".";
  setResultZL("The lock is open.");
  setStatusZL("");
  if (window.ResultModal) window.ResultModal.show("You win!", text);
  if (typeof GameStats !== "undefined") GameStats.record("zahlenschloss", "win", { hinted: s.hintCount > 0 });
}

// "Show solution": asks on the page first (a Kindle has no window.confirm).
function askSolveZL(open) {
  const s = AppStateZL.state;
  document.getElementById("zl-solve-ask").classList.toggle("hidden", !open || !s || s.solved);
}

function solveZL() {
  const s = AppStateZL.state;
  askSolveZL(false);
  if (!s || s.solved) return;
  s.entry = s.code;
  s.solved = true;
  s.gaveUp = true;
  s.lastHint = null;
  updateZL();
  setStatusZL("");
  if (window.ResultModal) window.ResultModal.show("Game over", shownTextZL(s));
  if (typeof GameStats !== "undefined") GameStats.record("zahlenschloss", "loss");
  saveZL();
}

function shownTextZL(s) {
  return "The code is " + s.code + ". Puzzle given up.";
}

function toggleNoteZL(clue, place) {
  const s = AppStateZL.state;
  if (!s || s.solved) return;
  toggleStruckZL(s, clue, place);
  s.undo.push([clue, place]);
  updateZL();
  saveZL();
}

function toggleStruckZL(s, clue, place) {
  const list = s.struck[clue];
  const i = list.indexOf(place);
  if (i === -1) list.push(place);
  else list.splice(i, 1);
}

function undoZL() {
  const s = AppStateZL.state;
  if (!s || s.solved || !s.undo.length) return;
  const last = s.undo.pop();
  toggleStruckZL(s, last[0], last[1]);
  updateZL();
  saveZL();
}

function hintZL() {
  const s = AppStateZL.state;
  if (!s || s.solved) return;
  const h = ZahlenschlossCore.hint({ clues: s.clues, digits: s.digits, code: s.code }, s.hints);
  if (h) {
    h.facts.forEach((f) => s.hints.push(f));
    s.hintCount++;
  }
  s.lastHint = h || { clues: [], facts: [] };
  updateZL();
  saveZL();
}

/*** Texts ***/

// The sentences under a clue, each its own English sentence.
function clueSentencesZL(c) {
  if (c.right === 0 && c.wrong === 0) return ["No digit is right."];
  const out = [];
  if (c.right === 1) out.push("One digit is right and in the right place.");
  else if (c.right > 1) out.push(c.right + " digits are right and in the right place.");
  if (c.wrong > 0) {
    if (c.right > 0) out.push(c.wrong === 1 ? "One more digit is right but in the wrong place." : c.wrong + " more digits are right but in the wrong place.");
    else out.push(c.wrong === 1 ? "One digit is right but in the wrong place." : c.wrong + " digits are right but in the wrong place.");
  }
  return out;
}

// The sentence of a hint ({ clues, facts } from the core).
function hintSentenceZL(h) {
  const s = AppStateZL.state;
  if (!h || !h.facts.length) return "The hints already show everything. Enter the code.";
  const f = h.facts[0];
  const place = (f.place || 0) + 1;
  if (!h.clues.length) return "One digit of the code: " + f.digit + " is in place " + place + ".";
  const from = h.clues.length === 2
    ? "From " + s.clues[h.clues[0]].guess + " and " + s.clues[h.clues[1]].guess + " it follows: "
    : "From " + s.clues[h.clues[0]].guess + " it follows: ";
  if (f.kind === "absent") {
    if (h.facts.length > 1) return from + h.facts.map((x) => x.digit).join(", ") + " are not in the code.";
    return from + f.digit + " is not in the code.";
  }
  if (f.kind === "present") return from + f.digit + " is in the code.";
  if (f.kind === "place") return from + f.digit + " is in place " + place + ".";
  return from + f.digit + " is not in place " + place + ".";
}

function setStatusZL(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function setResultZL(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
}

/*** Display ***/

// Built once per puzzle: the clue cards, the code fields, the keypad.
function buildZL() {
  const s = AppStateZL.state;
  const id = s.level + ":" + s.number;
  if (AppStateZL.built === id && document.querySelector("#zl-clues .zl-clue")) return;
  AppStateZL.built = id;
  const clues = document.getElementById("zl-clues");
  clues.innerHTML = s.clues.map((c, i) => '<div class="zl-clue" role="listitem" data-clue="' + i + '"><div class="zl-digits">' +
    c.guess.split("").map((d, p) => '<button type="button" class="zl-digit" data-clue="' + i + '" data-place="' + p + '" aria-pressed="false">' + d + "</button>").join("") +
    '</div><div class="zl-says">' + clueSentencesZL(c).map(() => '<p class="zl-say"></p>').join("") + "</div></div>").join("");
  clues.querySelectorAll(".zl-clue").forEach((card, i) => {
    const says = clueSentencesZL(s.clues[i]);
    card.querySelectorAll(".zl-say").forEach((p, k) => I18n.setMsg(p, says[k]));
    card.querySelectorAll(".zl-digit").forEach((b) => {
      I18n.setAria(b, "Digit " + b.textContent);
      b.addEventListener("click", () => toggleNoteZL(i, Number(b.getAttribute("data-place"))));
    });
  });
  const code = document.getElementById("zl-code");
  code.innerHTML = "";
  for (let p = 0; p < s.digits; p++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "zl-slot";
    b.setAttribute("data-place", String(p));
    b.addEventListener("click", () => selectFieldZL(p));
    code.appendChild(b);
  }
  const keys = document.getElementById("zl-keys");
  if (!keys.firstChild) {
    for (let d = 0; d <= 9; d++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "zl-key";
      b.setAttribute("data-digit", String(d));
      b.textContent = String(d);
      b.addEventListener("click", () => typeDigitZL(d));
      keys.appendChild(b);
    }
  }
}

function updateZL() {
  const s = AppStateZL.state;
  if (!s) return;
  const label = document.getElementById("game-label");
  const levelKey = s.level === 3 ? "level_hard" : s.level === 2 ? "level_medium" : "level_easy";
  if (label.getAttribute("data-i18n") !== levelKey) I18n.setKey(label, levelKey);
  const meta = document.getElementById("game-meta");
  const metaText = "Puzzle " + s.number + " · Mistakes: " + s.mistakes;
  if (meta.getAttribute("data-i18n-msg") !== metaText) I18n.setMsg(meta, metaText);
  // Clues: struck digits, clues of the last hint.
  const marked = s.lastHint && !s.solved ? s.lastHint.clues : [];
  document.querySelectorAll("#zl-clues .zl-clue").forEach((card, i) => {
    card.classList.toggle("zl-hinted", marked.indexOf(i) !== -1);
    card.querySelectorAll(".zl-digit").forEach((b) => {
      const on = String(s.struck[i].indexOf(Number(b.getAttribute("data-place"))) !== -1);
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      b.disabled = !!s.solved;
    });
  });
  // Code fields.
  document.querySelectorAll("#zl-code .zl-slot").forEach((b, p) => {
    const ch = s.entry[p];
    const text = ch === ZL_EMPTY ? "" : ch;
    if (b.textContent !== text) b.textContent = text;
    b.classList.toggle("zl-empty", ch === ZL_EMPTY);
    b.classList.toggle("zl-sel", !s.solved && p === AppStateZL.sel);
    b.classList.toggle("zl-shown", !!s.gaveUp);
    b.disabled = !!s.solved;
    const aria = ch === ZL_EMPTY ? "Field " + (p + 1) + ": empty" : "Field " + (p + 1) + ": " + ch;
    if (b.getAttribute("data-i18n-aria") !== aria) I18n.setAria(b, aria);
  });
  // Keypad: a digit in another field is locked.
  document.querySelectorAll("#zl-keys .zl-key").forEach((b) => {
    const at = s.entry.indexOf(b.getAttribute("data-digit"));
    const locked = at !== -1 && at !== AppStateZL.sel;
    b.classList.toggle("zl-locked", locked);
    b.disabled = !!s.solved || locked;
  });
  document.getElementById("zl-erase").disabled = !!s.solved || s.entry.split("").every((c) => c === ZL_EMPTY);
  document.getElementById("zl-check").disabled = !!s.solved;
  document.getElementById("zl-undo").disabled = !!s.solved || !s.undo.length;
  document.getElementById("hint-btn").disabled = !!s.solved;
  document.getElementById("zl-solve").disabled = !!s.solved;
  if (s.solved) askSolveZL(false);
  if (s.solved) setResultZL(s.gaveUp ? shownTextZL(s) : "The lock is open.");
  else {
    setResultZL("");
    const info = document.getElementById("board-info");
    if (s.lastHint) setStatusZL(hintSentenceZL(s.lastHint));
    else if (!info.textContent) setStatusZL("Choose a field, then tap a digit.");
  }
}

function initZahlenschlossApp() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("settings-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const hidden = panel.classList.toggle("hidden");
      I18n.setKey(toggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-zahlenschloss-game").addEventListener("click", startZL);
  document.getElementById("zl-erase").addEventListener("click", eraseZL);
  document.getElementById("zl-check").addEventListener("click", checkZL);
  document.getElementById("zl-undo").addEventListener("click", undoZL);
  document.getElementById("hint-btn").addEventListener("click", hintZL);
  document.getElementById("zl-solve").addEventListener("click", () => askSolveZL(true));
  document.getElementById("zl-solve-yes").addEventListener("click", solveZL);
  document.getElementById("zl-solve-no").addEventListener("click", () => askSolveZL(false));
  if (window.I18n && typeof I18n.onChange === "function") I18n.onChange(() => { if (AppStateZL.state) updateZL(); });
  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ZAHLENSCHLOSS_SAVE_KEY) : null;
  if (saved && saved.state && validZL(saved.state) && !saved.state.solved) {
    setStateZL(normaliseZL(saved.state));
    return;
  }
  if (saved) GameStorage.clear(ZAHLENSCHLOSS_SAVE_KEY);
  // No mode to choose: the page starts with the next puzzle of
  // the level played last (papergames_zahlenschloss_next.level).
  window.setTimeout(() => {
    if (AppStateZL.state) return;
    let last = 0;
    try { last = (JSON.parse(window.localStorage.getItem(ZL_NEXT_KEY) || "{}") || {}).level; } catch (e) { last = 0; }
    if (ZahlenschlossCore.LEVELS[last]) document.getElementById("zahlenschloss-level").value = String(last);
    startZL();
  }, 0);
}

document.addEventListener("DOMContentLoaded", initZahlenschlossApp);
