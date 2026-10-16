// oddone-app.js
// Wires OddOneCore ("Which One Is Different?") to oddone.html.
//
// A game is 6 rounds. Each round shows a few cards - all alike in one way
// but one. Tap the card that does not belong. The right one gets a double
// frame and "Next" appears; a wrong one is crossed out and cannot be
// tapped again (no time, no penalty beyond the count of mistakes). "Hint"
// marks the odd card. The game is saved after every tap.
//
// Group rounds show drawings (KidsPics, "line" mode). Attribute rounds
// show 1 to 3 copies of a shape - solid, outline, or outline with a small
// solid shape inside - black on white.

const AppStateOddOne = {
  level: "easy",
  rounds: null,
  index: 0,
  mistakes: 0,
  wrong: [],       // cards of the current round already crossed out
  answered: false, // the current round is solved
  hinted: false,
  hintShown: false,
  gameOver: false
};

const ODDONE_SAVE_KEY = "einkchess_save_oddone";

// Shapes for the attribute rounds, viewBox 0 0 40 40; @ is the fill part.
const ODDONE_SHAPES = {
  circle: '<circle cx="20" cy="20" r="14" @/>',
  square: '<rect x="8" y="8" width="24" height="24" @/>',
  triangle: '<polygon points="20,5 36,34 4,34" @/>',
  star: '<polygon points="20,3 24.5,14.5 37,15 27.5,23 31,35.5 20,28.5 9,35.5 12.5,23 3,15 15.5,14.5" @/>',
  heart: '<path d="M20 34C13 28 6 23 6 15.5C6 10.5 10 7 14 7C16.8 7 19 8.8 20 11C21 8.8 23.2 7 26 7C30 7 34 10.5 34 15.5C34 23 27 28 20 34Z" @/>',
  diamond: '<polygon points="20,4 35,20 20,36 5,20" @/>'
};
const ODDONE_SOLID = 'fill="#141413" stroke="#141413" stroke-width="2" stroke-linejoin="round"';
const ODDONE_OUTLINE = 'fill="#fff" stroke="#141413" stroke-width="4.5" stroke-linejoin="round"';
// Centres and scale of 1, 2 or 3 copies in the 60 x 60 card.
const ODDONE_LAYOUT = {
  1: { s: 1.25, at: [[30, 30]] },
  2: { s: 0.7, at: [[16, 30], [44, 30]] },
  3: { s: 0.62, at: [[30, 16], [17, 43], [43, 43]] }
};

function oddOneShapeMarkup(shape, fill) {
  const d = ODDONE_SHAPES[shape];
  if (fill === 0) return d.replace("@", ODDONE_SOLID);
  let m = d.replace("@", ODDONE_OUTLINE);
  if (fill === 2) m += '<g transform="translate(20 20) scale(0.42) translate(-20 -20)">' + d.replace("@", ODDONE_SOLID) + "</g>";
  return m;
}

function oddOneCardSvg(round, card, size) {
  if (round.type === "group") return KidsPics.svg(card.id, "line", "none", size);
  const shape = OddOneCore.SHAPES[card.s];
  const lay = ODDONE_LAYOUT[card.n];
  let body = "";
  lay.at.forEach((p) => {
    body += '<g transform="translate(' + (p[0] - 20 * lay.s) + " " + (p[1] - 20 * lay.s) + ") scale(" + lay.s + ')">' + oddOneShapeMarkup(shape, card.f) + "</g>";
  });
  return '<svg viewBox="0 0 60 60" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' + body + "</svg>";
}

function setStatusOddOne(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveOddOneGame() {
  if (typeof GameStorage === "undefined" || !AppStateOddOne.rounds) return;
  const s = AppStateOddOne;
  GameStorage.save(ODDONE_SAVE_KEY, { level: s.level, rounds: s.rounds, index: s.index, mistakes: s.mistakes, wrong: s.wrong, answered: s.answered, hinted: s.hinted });
}

function clearSavedOddOneGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(ODDONE_SAVE_KEY);
}

function initOddOneApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("oddone-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-oddone-game").addEventListener("click", () => startNewOddOne(levelSelect.value));
  document.getElementById("oddone-next").addEventListener("click", nextOddOne);
  document.getElementById("hint-btn").addEventListener("click", hintOddOne);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(ODDONE_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.rounds) && saved.rounds.length && OddOneCore.LEVELS[saved.level] && saved.rounds.every(OddOneCore.isValidRound)) {
    const s = AppStateOddOne;
    s.level = saved.level;
    s.rounds = saved.rounds;
    s.index = Math.min(Math.max(0, saved.index | 0), s.rounds.length - 1);
    s.mistakes = saved.mistakes | 0;
    s.wrong = Array.isArray(saved.wrong) ? saved.wrong : [];
    s.answered = !!saved.answered;
    s.hinted = !!saved.hinted;
    s.hintShown = false;
    s.gameOver = false;
    if (levelSelect) levelSelect.value = s.level;
    showOddOneBoard();
    renderOddOne();
    setStatusOddOne(s.answered ? "Right! Tap Next." : "Which one does not belong? Tap it.");
  }
}

function startNewOddOne(level) {
  const p = OddOneCore.generatePuzzle(level);
  const s = AppStateOddOne;
  s.level = p.level;
  s.rounds = p.rounds;
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
  showOddOneBoard();
  renderOddOne();
  setStatusOddOne("Which one does not belong? Tap it.");
  saveOddOneGame();
}

function showOddOneBoard() {
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

function renderOddOne() {
  const s = AppStateOddOne;
  if (!s.rounds) return;
  const round = s.rounds[s.index];
  const optEl = document.getElementById("oddone-options");
  optEl.innerHTML = "";
  // Four cards: two rows of two; three, five or six: rows of three.
  optEl.classList.toggle("kq-n3", round.cards.length !== 4);
  round.cards.forEach((card, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kq-option";
    const isWrong = s.wrong.indexOf(i) !== -1;
    const isRight = s.answered && i === round.correct;
    btn.innerHTML = oddOneCardSvg(round, card, 80) + (isWrong ? '<svg class="kq-cross" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M6 6L34 34M34 6L6 34" stroke="#141413" stroke-width="8" stroke-linecap="round"/><path d="M6 6L34 34M34 6L6 34" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>' : "");
    btn.classList.toggle("kq-wrong", isWrong);
    btn.classList.toggle("kq-right", isRight);
    btn.classList.toggle("hint-cell", s.hintShown && !s.answered && i === round.correct);
    btn.disabled = isWrong || s.answered;
    btn.setAttribute("data-i18n-attr", "");
    I18n.setAria(btn, "Card " + (i + 1) + (isWrong ? ", not right" : isRight ? ", right" : ""));
    btn.addEventListener("click", () => onOddOneAnswer(i));
    optEl.appendChild(btn);
  });

  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Round " + (s.index + 1) + " of " + s.rounds.length + " · Mistakes: " + s.mistakes);
  const next = document.getElementById("oddone-next");
  if (next) next.classList.toggle("hidden", !s.answered || s.gameOver);
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", s.answered || s.gameOver);
}

/*** Play ***/

function onOddOneAnswer(i) {
  const s = AppStateOddOne;
  if (!s.rounds || s.gameOver || s.answered) return;
  const round = s.rounds[s.index];
  if (s.wrong.indexOf(i) !== -1) return;
  if (i !== round.correct) {
    s.wrong.push(i);
    s.mistakes++;
    s.hintShown = false;
    setStatusOddOne("That one belongs with the others. Try another one.");
    renderOddOne();
    saveOddOneGame();
    return;
  }
  s.answered = true;
  s.hintShown = false;
  if (s.index === s.rounds.length - 1) {
    s.gameOver = true;
    renderOddOne();
    const text = "All rounds finished! Mistakes: " + s.mistakes + ".";
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    setStatusOddOne(text);
    if (typeof GameStats !== "undefined") GameStats.record("oddone", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("od_win_title"), I18n.msg("All rounds finished. Mistakes: " + s.mistakes + "."));
    clearSavedOddOneGame();
    return;
  }
  setStatusOddOne("Right! Tap Next.");
  renderOddOne();
  saveOddOneGame();
}

function nextOddOne() {
  const s = AppStateOddOne;
  if (!s.rounds || !s.answered || s.gameOver) return;
  s.index++;
  s.wrong = [];
  s.answered = false;
  s.hintShown = false;
  setStatusOddOne("Which one does not belong? Tap it.");
  renderOddOne();
  saveOddOneGame();
}

function hintOddOne() {
  const s = AppStateOddOne;
  if (!s.rounds || s.gameOver || s.answered) return;
  s.hinted = true;
  s.hintShown = true;
  setStatusOddOne("Hint: the marked card is the odd one.");
  renderOddOne();
  saveOddOneGame();
}

document.addEventListener("DOMContentLoaded", initOddOneApp);
