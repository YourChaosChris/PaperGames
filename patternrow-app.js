// patternrow-app.js
// Wires PatternRowCore ("Continue the Pattern") to patternrow.html.
//
// A game is 6 rows. A row of symbols is shown with an empty place at the
// end; the answers are below it. Tap an answer: the right one goes into
// the empty place and "Next" appears; a wrong one is crossed out and
// cannot be tapped again, nothing else happens (no time, no penalty
// beyond the count of mistakes). "Hint" marks the right answer. The game
// is saved after every tap and picked up again on the next visit.
//
// Symbols are shapes in black on white, solid or as an outline.

const AppStatePatternRow = {
  level: "easy",
  rows: null,
  index: 0,
  mistakes: 0,
  wrong: [],       // answers of the current row already crossed out
  answered: false, // the current row is solved
  hinted: false,
  hintShown: false,
  gameOver: false
};

const PATTERNROW_SAVE_KEY = "einkchess_save_patternrow";

const PATTERNROW_ICONS = (function () {
  const F = 'fill="#141413"';
  const O = 'fill="#fff" stroke="#141413" stroke-width="4.5" stroke-linejoin="round"';
  const draw = (solid, d) => d.replace("@", solid ? F : O);
  return {
    circle: (s) => draw(s, '<circle cx="20" cy="20" r="14" @/>'),
    square: (s) => draw(s, '<rect x="8" y="8" width="24" height="24" @/>'),
    triangle: (s) => draw(s, '<polygon points="20,5 36,34 4,34" @/>'),
    star: (s) => draw(s, '<polygon points="20,3 24.5,14.5 37,15 27.5,23 31,35.5 20,28.5 9,35.5 12.5,23 3,15 15.5,14.5" @/>'),
    heart: (s) => draw(s, '<path d="M20 34C13 28 6 23 6 15.5C6 10.5 10 7 14 7C16.8 7 19 8.8 20 11C21 8.8 23.2 7 26 7C30 7 34 10.5 34 15.5C34 23 27 28 20 34Z" @/>'),
    cross: (s) => draw(s, '<polygon points="15,5 25,5 25,15 35,15 35,25 25,25 25,35 15,35 15,25 5,25 5,15 15,15" @/>'),
    diamond: (s) => draw(s, '<polygon points="20,4 35,20 20,36 5,20" @/>'),
    moon: (s) => draw(s, '<path d="M26 5A15 15 0 1 0 35 27A12 12 0 1 1 26 5Z" @/>')
  };
})();

function symbolSvgPatternRow(sym, size) {
  const shape = PatternRowCore.SHAPES[PatternRowCore.shapeOf(sym)];
  const solid = PatternRowCore.fillOf(sym) === 0;
  return '<svg viewBox="0 0 40 40" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' + PATTERNROW_ICONS[shape](solid) + "</svg>";
}

function setStatusPatternRow(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function savePatternRowGame() {
  if (typeof GameStorage === "undefined" || !AppStatePatternRow.rows) return;
  const s = AppStatePatternRow;
  GameStorage.save(PATTERNROW_SAVE_KEY, { level: s.level, rows: s.rows, index: s.index, mistakes: s.mistakes, wrong: s.wrong, answered: s.answered, hinted: s.hinted });
}

function clearSavedPatternRowGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(PATTERNROW_SAVE_KEY);
}

function initPatternRowApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("patternrow-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-patternrow-game").addEventListener("click", () => startNewPatternRow(levelSelect.value));
  document.getElementById("patternrow-next").addEventListener("click", nextPatternRow);
  document.getElementById("hint-btn").addEventListener("click", hintPatternRow);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(PATTERNROW_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.rows) && saved.rows.length && PatternRowCore.LEVELS[saved.level] && saved.rows.every(PatternRowCore.isValidRow)) {
    const s = AppStatePatternRow;
    s.level = saved.level;
    s.rows = saved.rows;
    s.index = Math.min(Math.max(0, saved.index | 0), s.rows.length - 1);
    s.mistakes = saved.mistakes | 0;
    s.wrong = Array.isArray(saved.wrong) ? saved.wrong : [];
    s.answered = !!saved.answered;
    s.hinted = !!saved.hinted;
    s.hintShown = false;
    s.gameOver = false;
    if (levelSelect) levelSelect.value = s.level;
    showPatternRowBoard();
    renderPatternRow();
    setStatusPatternRow(s.answered ? "Right! Tap Next." : "Which symbol comes next? Tap the answer.");
  }
}

function startNewPatternRow(level) {
  const p = PatternRowCore.generatePuzzle(level);
  const s = AppStatePatternRow;
  s.level = p.level;
  s.rows = p.rows;
  s.index = 0;
  s.mistakes = 0;
  s.wrong = [];
  s.answered = false;
  s.hinted = false;
  s.hintShown = false;
  s.gameOver = false;
  if (window.ResultModal) window.ResultModal.hide();
  const result = document.getElementById("game-result");
  if (result) I18n.setMsg(result, "");
  showPatternRowBoard();
  renderPatternRow();
  setStatusPatternRow("Which symbol comes next? Tap the answer.");
  savePatternRowGame();
}

function showPatternRowBoard() {
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const settingsPanel = document.getElementById("settings-panel");
  const menuToggle = document.getElementById("menu-toggle");
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
}

/*** Drawing ***/

function renderPatternRow() {
  const s = AppStatePatternRow;
  if (!s.rows) return;
  const row = s.rows[s.index];
  const rowEl = document.getElementById("patternrow-row");
  const n = row.seq.length + 1;
  const width = Math.floor(1000 / n) / 10 + "%";
  let html = "";
  row.seq.forEach((sym) => {
    html += '<span class="kq-cell" style="width:' + width + '">' + symbolSvgPatternRow(sym, 40) + "</span>";
  });
  html += '<span class="kq-cell kq-cell-q' + (s.answered ? " kq-cell-filled" : "") + '" style="width:' + width + '">' +
    (s.answered ? symbolSvgPatternRow(row.answer, 40) : '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M13 14C13 8 27 8 27 14C27 19 20 19 20 25M20 31V33" fill="none" stroke="#141413" stroke-width="4.5" stroke-linecap="round"/></svg>') + "</span>";
  rowEl.innerHTML = html;
  I18n.setAria(rowEl, "Pattern row. The last place is empty.");

  const optEl = document.getElementById("patternrow-options");
  optEl.innerHTML = "";
  row.options.forEach((sym, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kq-option";
    const isWrong = s.wrong.indexOf(i) !== -1;
    const isRight = s.answered && i === row.correct;
    btn.innerHTML = symbolSvgPatternRow(sym, 48) + (isWrong ? '<svg class="kq-cross" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M6 6L34 34M34 6L6 34" stroke="#141413" stroke-width="3" stroke-linecap="round"/></svg>' : "");
    btn.classList.toggle("kq-wrong", isWrong);
    btn.classList.toggle("kq-right", isRight);
    btn.classList.toggle("hint-cell", s.hintShown && !s.answered && i === row.correct);
    btn.disabled = isWrong || s.answered;
    btn.setAttribute("data-i18n-attr", "");
    I18n.setAria(btn, "Answer " + (i + 1) + (isWrong ? ", not right" : isRight ? ", right" : ""));
    btn.addEventListener("click", () => onPatternRowAnswer(i));
    optEl.appendChild(btn);
  });

  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Row " + (s.index + 1) + " of " + s.rows.length + " · Mistakes: " + s.mistakes);
  const next = document.getElementById("patternrow-next");
  if (next) next.classList.toggle("hidden", !s.answered || s.gameOver);
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", s.answered || s.gameOver);
}

/*** Play ***/

function onPatternRowAnswer(i) {
  const s = AppStatePatternRow;
  if (!s.rows || s.gameOver || s.answered) return;
  const row = s.rows[s.index];
  if (s.wrong.indexOf(i) !== -1) return;
  if (i !== row.correct) {
    s.wrong.push(i);
    s.mistakes++;
    s.hintShown = false;
    setStatusPatternRow("That is not it. Try another one.");
    renderPatternRow();
    savePatternRowGame();
    return;
  }
  s.answered = true;
  s.hintShown = false;
  if (s.index === s.rows.length - 1) {
    s.gameOver = true;
    renderPatternRow();
    const text = "All rows finished! Mistakes: " + s.mistakes + ".";
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    setStatusPatternRow(text);
    if (typeof GameStats !== "undefined") GameStats.record("patternrow", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("pr_win_title"), I18n.msg("All rows finished. Mistakes: " + s.mistakes + "."));
    clearSavedPatternRowGame();
    return;
  }
  setStatusPatternRow("Right! Tap Next.");
  renderPatternRow();
  savePatternRowGame();
}

function nextPatternRow() {
  const s = AppStatePatternRow;
  if (!s.rows || !s.answered || s.gameOver) return;
  s.index++;
  s.wrong = [];
  s.answered = false;
  s.hintShown = false;
  setStatusPatternRow("Which symbol comes next? Tap the answer.");
  renderPatternRow();
  savePatternRowGame();
}

function hintPatternRow() {
  const s = AppStatePatternRow;
  if (!s.rows || s.gameOver || s.answered) return;
  s.hinted = true;
  s.hintShown = true;
  setStatusPatternRow("Hint: the marked symbol is the right one.");
  renderPatternRow();
  savePatternRowGame();
}

document.addEventListener("DOMContentLoaded", initPatternRowApp);
