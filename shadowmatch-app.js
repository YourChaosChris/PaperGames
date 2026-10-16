// shadowmatch-app.js
// Wires ShadowMatchCore ("Whose Shadow Is It?") to shadowmatch.html.
//
// A game is 6 rounds. A picture is shown on top and below it black
// shadows; tap the shadow that belongs to the picture. The right one gets
// a double frame and "Next" appears; a wrong one is crossed out and cannot
// be tapped again (no time, no penalty beyond the count of mistakes).
// "Hint" marks the right shadow. The game is saved after every tap.

const AppStateShadowMatch = {
  level: "easy",
  rounds: null,
  index: 0,
  mistakes: 0,
  wrong: [],       // shadows of the current round already crossed out
  answered: false, // the current round is solved
  hinted: false,
  hintShown: false,
  gameOver: false
};

const SHADOWMATCH_SAVE_KEY = "einkchess_save_shadowmatch";

function setStatusShadowMatch(text) {
  const el = document.getElementById("board-info");
  if (el) I18n.setMsg(el, text || "");
}

function saveShadowMatchGame() {
  if (typeof GameStorage === "undefined" || !AppStateShadowMatch.rounds) return;
  const s = AppStateShadowMatch;
  GameStorage.save(SHADOWMATCH_SAVE_KEY, { level: s.level, rounds: s.rounds, index: s.index, mistakes: s.mistakes, wrong: s.wrong, answered: s.answered, hinted: s.hinted });
}

function clearSavedShadowMatchGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(SHADOWMATCH_SAVE_KEY);
}

function initShadowMatchApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelSelect = document.getElementById("shadowmatch-level");
  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      const hidden = settingsPanel.classList.toggle("hidden");
      I18n.setKey(menuToggle, hidden ? "menu_toggle" : "menu_close");
    });
  }
  document.getElementById("start-shadowmatch-game").addEventListener("click", () => startNewShadowMatch(levelSelect.value));
  document.getElementById("shadowmatch-next").addEventListener("click", nextShadowMatch);
  document.getElementById("hint-btn").addEventListener("click", hintShadowMatch);

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(SHADOWMATCH_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.rounds) && saved.rounds.length && ShadowMatchCore.LEVELS[saved.level] && saved.rounds.every(ShadowMatchCore.isValidRound)) {
    const s = AppStateShadowMatch;
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
    showShadowMatchBoard();
    renderShadowMatch();
    setStatusShadowMatch(s.answered ? "Right! Tap Next." : "Which shadow belongs to the picture? Tap it.");
  }
}

function startNewShadowMatch(level) {
  const p = ShadowMatchCore.generatePuzzle(level);
  const s = AppStateShadowMatch;
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
  showShadowMatchBoard();
  renderShadowMatch();
  setStatusShadowMatch("Which shadow belongs to the picture? Tap it.");
  saveShadowMatchGame();
}

function showShadowMatchBoard() {
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

function renderShadowMatch() {
  const s = AppStateShadowMatch;
  if (!s.rounds) return;
  const round = s.rounds[s.index];
  const pic = document.getElementById("shadowmatch-picture");
  pic.innerHTML = KidsPics.svg(round.id, "line", "none", 120);
  I18n.setAria(pic, "Picture");

  const optEl = document.getElementById("shadowmatch-options");
  optEl.innerHTML = "";
  optEl.classList.toggle("kq-n3", round.options.length === 3);
  round.options.forEach((o, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "kq-option";
    const isWrong = s.wrong.indexOf(i) !== -1;
    const isRight = s.answered && i === round.correct;
    btn.innerHTML = KidsPics.svg(o.id, "shadow", o.tr, 80) + (isWrong ? '<svg class="kq-cross" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M6 6L34 34M34 6L6 34" stroke="#141413" stroke-width="8" stroke-linecap="round"/><path d="M6 6L34 34M34 6L6 34" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>' : "");
    btn.classList.toggle("kq-wrong", isWrong);
    btn.classList.toggle("kq-right", isRight);
    btn.classList.toggle("hint-cell", s.hintShown && !s.answered && i === round.correct);
    btn.disabled = isWrong || s.answered;
    btn.setAttribute("data-i18n-attr", "");
    I18n.setAria(btn, "Shadow " + (i + 1) + (isWrong ? ", not right" : isRight ? ", right" : ""));
    btn.addEventListener("click", () => onShadowMatchAnswer(i));
    optEl.appendChild(btn);
  });

  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, "Picture " + (s.index + 1) + " of " + s.rounds.length + " · Mistakes: " + s.mistakes);
  const next = document.getElementById("shadowmatch-next");
  if (next) next.classList.toggle("hidden", !s.answered || s.gameOver);
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) hintBtn.classList.toggle("hidden", s.answered || s.gameOver);
}

/*** Play ***/

function onShadowMatchAnswer(i) {
  const s = AppStateShadowMatch;
  if (!s.rounds || s.gameOver || s.answered) return;
  const round = s.rounds[s.index];
  if (s.wrong.indexOf(i) !== -1) return;
  if (i !== round.correct) {
    s.wrong.push(i);
    s.mistakes++;
    s.hintShown = false;
    setStatusShadowMatch("That shadow does not fit. Try another one.");
    renderShadowMatch();
    saveShadowMatchGame();
    return;
  }
  s.answered = true;
  s.hintShown = false;
  if (s.index === s.rounds.length - 1) {
    s.gameOver = true;
    renderShadowMatch();
    const text = "All pictures done! Mistakes: " + s.mistakes + ".";
    const result = document.getElementById("game-result");
    if (result) I18n.setMsg(result, text);
    setStatusShadowMatch(text);
    if (typeof GameStats !== "undefined") GameStats.record("shadowmatch", "win", { hinted: s.hinted });
    if (window.ResultModal) window.ResultModal.show(I18n.t("sm_win_title"), I18n.msg("All pictures done. Mistakes: " + s.mistakes + "."));
    clearSavedShadowMatchGame();
    return;
  }
  setStatusShadowMatch("Right! Tap Next.");
  renderShadowMatch();
  saveShadowMatchGame();
}

function nextShadowMatch() {
  const s = AppStateShadowMatch;
  if (!s.rounds || !s.answered || s.gameOver) return;
  s.index++;
  s.wrong = [];
  s.answered = false;
  s.hintShown = false;
  setStatusShadowMatch("Which shadow belongs to the picture? Tap it.");
  renderShadowMatch();
  saveShadowMatchGame();
}

function hintShadowMatch() {
  const s = AppStateShadowMatch;
  if (!s.rounds || s.gameOver || s.answered) return;
  s.hinted = true;
  s.hintShown = true;
  setStatusShadowMatch("Hint: the marked shadow is the right one.");
  renderShadowMatch();
  saveShadowMatchGame();
}

document.addEventListener("DOMContentLoaded", initShadowMatchApp);
