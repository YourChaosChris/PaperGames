// categories-app.js
// "Stadt, Land, Fluss" (Categories / Petit Bac / Tutti Frutti ...): the
// classic pen-and-paper word game, with this page as the game master.
// Everyone plays on their own paper; the page draws the letter from the
// alphabet of the current language, keeps an optional time limit, and
// adds up the points the group agrees on. Nobody types answers here -
// on an e-reader that would be slow, and the fun is in the paper and the
// arguing about whether a river really exists.
//
// Scoring follows the common rule: 20 points for the only answer in a
// category, 10 for a unique answer, 5 for an answer someone else also
// wrote, 0 for none. Tapping a score cell cycles through those values.

const CATEGORIES_SAVE_KEY = "einkchess_save_categories";
const CATEGORIES_PREFS_KEY = "einkchess_prefs_categories";
const CATEGORIES_POINTS = [0, 5, 10, 20];
const CATEGORIES_MAX_PLAYERS = 8;

// Built-in categories; the first six are ticked by default.
const CATEGORIES_PRESETS = ["city", "country", "river", "name", "animal", "job", "plant", "food", "thing", "sport", "music", "title"];
const CATEGORIES_DEFAULT = ["city", "country", "river", "name", "animal", "job"];

// Letters to draw per language: the language's own alphabet without the
// letters almost no word starts with (Q, X, Y and the like), which only
// lead to empty rounds. Chinese has no alphabet, so it uses the initials
// of Hanyu Pinyin syllables instead (no pinyin syllable starts with I, U
// or V).
const CATEGORIES_LETTERS = {
  en: "ABCDEFGHIJKLMNOPRSTUVW",
  de: "ABCDEFGHIJKLMNOPRSTUVWZ",
  fr: "ABCDEFGHIJLMNOPRSTUV",
  es: "ABCDEFGHIJLMNOPRSTUV",
  it: "ABCDEFGILMNOPRSTUVZ",
  nl: "ABCDEFGHIJKLMNOPRSTUVWZ",
  pl: "ABCDEFGHIJKLŁMNOPRSTUWZ",
  uk: "АБВГДЕЗІКЛМНОПРСТУФХЦЧШ",
  ru: "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ",
  ja: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ",
  zh: "ABCDEFGHJKLMNOPQRSTWXYZ"
};

const AppStateCategories = {
  started: false,
  players: [],         // names as typed ("" = use the numbered default)
  categories: [],      // preset ids ("city") or custom labels ("custom:Car brand")
  timerSeconds: 0,
  round: 0,
  letter: null,
  usedLetters: [],
  scores: {},          // "category|playerIndex" -> points for the current round
  totals: [],          // per player
  roundScored: true,   // the current letter's points were already added up
  timerEnd: null,
  timerId: null
};

function tCat(key, vars) {
  let s = (typeof I18n !== "undefined") ? I18n.t(key) : key;
  if (vars) Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(vars[k]); });
  return s;
}

function readJson(key) {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeJson(key, value) {
  try {
    if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* storage unavailable - just don't persist */ }
}

function saveCategoriesGame() {
  const s = AppStateCategories;
  if (typeof GameStorage === "undefined" || !s.started) return;
  GameStorage.save(CATEGORIES_SAVE_KEY, {
    players: s.players, categories: s.categories, timerSeconds: s.timerSeconds, round: s.round,
    letter: s.letter, usedLetters: s.usedLetters, scores: s.scores, totals: s.totals, roundScored: s.roundScored
  });
}

function clearSavedCategoriesGame() {
  if (typeof GameStorage !== "undefined") GameStorage.clear(CATEGORIES_SAVE_KEY);
}

function playerName(i) {
  const name = (AppStateCategories.players[i] || "").trim();
  return name || tCat("categories_player_name", { n: i + 1 });
}

function categoryLabel(id) {
  return id.indexOf("custom:") === 0 ? id.slice(7) : tCat("categories_cat_" + id);
}

function letterPool() {
  const lang = (typeof I18n !== "undefined") ? I18n.getLang() : "en";
  return Array.from(CATEGORIES_LETTERS[lang] || CATEGORIES_LETTERS.en);
}

function setStatusCategories(text) {
  const el = document.getElementById("board-info");
  if (el) el.textContent = text || "";
}

/*** Settings panel ***/

function buildCategorySettings() {
  const prefs = readJson(CATEGORIES_PREFS_KEY) || {};
  const playerCount = document.getElementById("categories-player-count");
  const namesEl = document.getElementById("categories-player-names");
  const presetsEl = document.getElementById("categories-presets");
  const customEl = document.getElementById("categories-custom");
  const timerEl = document.getElementById("categories-timer");
  if (!playerCount || !namesEl || !presetsEl) return;

  if (!playerCount.options.length) {
    for (let n = 1; n <= CATEGORIES_MAX_PLAYERS; n++) {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = String(n);
      playerCount.appendChild(opt);
    }
    playerCount.value = String(prefs.playerCount || 3);
    if (customEl && prefs.custom) customEl.value = prefs.custom;
    if (timerEl && prefs.timer !== undefined) timerEl.value = String(prefs.timer);
    playerCount.addEventListener("change", () => renderPlayerNameInputs());
  }

  const names = prefs.names || [];
  function renderPlayerNameInputs() {
    const existing = Array.from(namesEl.querySelectorAll("input")).map((i) => i.value);
    namesEl.innerHTML = "";
    const count = parseInt(playerCount.value, 10) || 1;
    for (let i = 0; i < count; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 16;
      input.className = "categories-name-input";
      input.value = existing[i] !== undefined ? existing[i] : (names[i] || "");
      input.placeholder = tCat("categories_player_name", { n: i + 1 });
      input.setAttribute("aria-label", tCat("categories_player_name", { n: i + 1 }));
      namesEl.appendChild(input);
    }
  }
  renderPlayerNameInputs();

  const ticked = prefs.categories || CATEGORIES_DEFAULT;
  const checkedNow = Array.from(presetsEl.querySelectorAll("input:checked")).map((c) => c.value);
  presetsEl.innerHTML = "";
  CATEGORIES_PRESETS.forEach((id) => {
    const label = document.createElement("label");
    label.className = "categories-preset";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = id;
    box.checked = presetsEl.dataset.built ? checkedNow.indexOf(id) !== -1 : ticked.indexOf(id) !== -1;
    const text = document.createElement("span");
    text.textContent = tCat("categories_cat_" + id);
    label.appendChild(box);
    label.appendChild(text);
    presetsEl.appendChild(label);
  });
  presetsEl.dataset.built = "1";

  if (timerEl) {
    const current = timerEl.value || String(prefs.timer || 0);
    timerEl.innerHTML = "";
    [0, 60, 90, 120, 180].forEach((sec) => {
      const opt = document.createElement("option");
      opt.value = String(sec);
      opt.textContent = sec ? tCat("categories_timer_seconds", { n: sec }) : tCat("categories_timer_off");
      timerEl.appendChild(opt);
    });
    timerEl.value = current;
  }
}

function readSettings() {
  const count = parseInt(document.getElementById("categories-player-count").value, 10) || 1;
  const names = Array.from(document.querySelectorAll("#categories-player-names input")).slice(0, count).map((i) => i.value.trim());
  const presets = Array.from(document.querySelectorAll("#categories-presets input:checked")).map((c) => c.value);
  const customText = (document.getElementById("categories-custom") || {}).value || "";
  const custom = customText.split(/[,;、，]/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const timer = parseInt((document.getElementById("categories-timer") || {}).value, 10) || 0;
  writeJson(CATEGORIES_PREFS_KEY, { playerCount: count, names, categories: presets, custom: customText, timer });
  return { names, categories: presets.concat(custom.map((c) => "custom:" + c)), timer };
}

/*** Game flow ***/

function startCategoriesGame() {
  const settings = readSettings();
  if (!settings.categories.length) {
    setStatusCategories(tCat("categories_need_category"));
    return;
  }
  stopCategoriesTimer();
  const s = AppStateCategories;
  s.started = true;
  s.players = settings.names;
  s.categories = settings.categories;
  s.timerSeconds = settings.timer;
  s.round = 0;
  s.letter = null;
  s.usedLetters = [];
  s.scores = {};
  s.totals = settings.names.map(() => 0);
  s.roundScored = true;
  showCategoriesBoard();
  renderCategories();
  setStatusCategories(tCat("categories_ready"));
  saveCategoriesGame();
}

function drawCategoriesLetter() {
  const s = AppStateCategories;
  if (!s.started) return;
  // Points of a letter that were never added up are dropped with it.
  let pool = letterPool().filter((l) => s.usedLetters.indexOf(l) === -1);
  let status = "";
  if (!pool.length) {
    s.usedLetters = [];
    pool = letterPool();
    status = tCat("categories_letters_reset") + " ";
  }
  s.letter = pool[Math.floor(Math.random() * pool.length)];
  s.usedLetters.push(s.letter);
  s.round++;
  s.scores = {};
  s.roundScored = false;
  renderCategories();
  startCategoriesTimer();
  setStatusCategories(status + tCat("categories_letter_hint"));
  saveCategoriesGame();
}

function startCategoriesTimer() {
  stopCategoriesTimer();
  const s = AppStateCategories;
  if (!s.timerSeconds) { renderTimer(); return; }
  s.timerEnd = Date.now() + s.timerSeconds * 1000;
  renderTimer();
  s.timerId = setInterval(() => {
    const left = Math.ceil((s.timerEnd - Date.now()) / 1000);
    if (left <= 0) {
      stopCategoriesTimer();
      renderTimer();
      setStatusCategories(tCat("categories_time_up"));
      return;
    }
    // E-ink redraws every change, so only every 5 seconds until the last ten.
    if (left <= 10 || left % 5 === 0) renderTimer();
  }, 1000);
}

function stopCategoriesTimer() {
  const s = AppStateCategories;
  if (s.timerId !== null) clearInterval(s.timerId);
  s.timerId = null;
  s.timerEnd = null;
}

function pressCategoriesStop() {
  if (!AppStateCategories.letter || AppStateCategories.roundScored) return;
  stopCategoriesTimer();
  renderTimer();
  setStatusCategories(tCat("categories_stopped") + " " + tCat("categories_score_hint"));
}

function cycleCategoriesScore(category, player) {
  const s = AppStateCategories;
  if (!s.letter || s.roundScored) {
    setStatusCategories(tCat("categories_draw_first"));
    return;
  }
  const key = category + "|" + player;
  const current = s.scores[key] || 0;
  s.scores[key] = CATEGORIES_POINTS[(CATEGORIES_POINTS.indexOf(current) + 1) % CATEGORIES_POINTS.length];
  renderCategories();
  saveCategoriesGame();
}

function roundSum(player) {
  const s = AppStateCategories;
  return s.categories.reduce((sum, c) => sum + (s.scores[c + "|" + player] || 0), 0);
}

function scoreCategoriesRound() {
  const s = AppStateCategories;
  if (!s.letter || s.roundScored) {
    setStatusCategories(tCat("categories_draw_first"));
    return;
  }
  stopCategoriesTimer();
  s.totals = s.totals.map((t, i) => t + roundSum(i));
  s.roundScored = true;
  renderCategories();
  setStatusCategories(tCat("categories_round_added", { n: s.round }));
  saveCategoriesGame();
}

function finishCategoriesGame() {
  const s = AppStateCategories;
  if (!s.started) return;
  if (!s.roundScored) scoreCategoriesRound();
  stopCategoriesTimer();
  const best = Math.max.apply(null, s.totals);
  const winners = s.totals.map((t, i) => (t === best ? playerName(i) : null)).filter((n) => n !== null);
  const message = winners.length === 1
    ? tCat("categories_result_winner", { p: winners[0], n: best })
    : tCat("categories_result_tie", { n: best, s: winners.join(", ") });
  const ranking = s.totals.map((t, i) => ({ name: playerName(i), t }))
    .sort((a, b) => b.t - a.t).map((r) => r.name + ": " + r.t).join(" · ");
  s.started = false;
  clearSavedCategoriesGame();
  setCategoriesSettingsOpen(true);
  renderCategories();
  setStatusCategories(message + " " + ranking);
  const resultEl = document.getElementById("game-result");
  if (resultEl) resultEl.textContent = message;
  if (window.ResultModal) window.ResultModal.show(tCat("categories_result_title"), message + "\n" + ranking);
}

/*** Rendering ***/

function setCategoriesSettingsOpen(open) {
  const panel = document.getElementById("settings-panel");
  const toggle = document.getElementById("menu-toggle");
  if (!panel) return;
  panel.classList.toggle("hidden", !open);
  if (toggle && typeof I18n !== "undefined") I18n.setKey(toggle, open ? "menu_close" : "menu_toggle");
}

function showCategoriesBoard() {
  setCategoriesSettingsOpen(false);
  const placeholder = document.getElementById("board-placeholder");
  const container = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (container) container.classList.remove("hidden");
  const resultEl = document.getElementById("game-result");
  if (resultEl) resultEl.textContent = "";
  if (window.ResultModal) window.ResultModal.hide();
}

function renderTimer() {
  const el = document.getElementById("categories-timer-display");
  if (!el) return;
  const s = AppStateCategories;
  if (!s.timerSeconds || !s.letter || s.roundScored) { el.textContent = ""; return; }
  if (s.timerEnd === null) { el.textContent = ""; return; }
  const left = Math.max(0, Math.ceil((s.timerEnd - Date.now()) / 1000));
  el.textContent = tCat("categories_time_left", { n: left });
}

function renderCategories() {
  const s = AppStateCategories;
  const letterEl = document.getElementById("categories-letter");
  const metaEl = document.getElementById("game-meta");
  const usedEl = document.getElementById("categories-used");
  if (letterEl) letterEl.textContent = s.letter || "?";
  if (metaEl) metaEl.textContent = s.round ? tCat("categories_round", { n: s.round }) : "";
  if (usedEl) usedEl.textContent = s.usedLetters.length ? tCat("categories_used_letters", { s: s.usedLetters.join(" ") }) : "";

  const drawBtn = document.getElementById("categories-draw-btn");
  const stopBtn = document.getElementById("categories-stop-btn");
  const scoreBtn = document.getElementById("categories-score-btn");
  const finishBtn = document.getElementById("categories-finish-btn");
  const live = s.started && s.letter && !s.roundScored;
  if (drawBtn) drawBtn.disabled = !s.started || (s.letter && !s.roundScored);
  if (stopBtn) stopBtn.disabled = !live;
  if (scoreBtn) scoreBtn.disabled = !live;
  if (finishBtn) finishBtn.disabled = !s.started;

  const table = document.getElementById("categories-board");
  if (!table) return;
  const count = s.totals.length;
  let html = "<thead><tr><th scope=\"col\">" + escapeHtml(tCat("categories_col_category")) + "</th>";
  for (let i = 0; i < count; i++) html += "<th scope=\"col\">" + escapeHtml(playerName(i)) + "</th>";
  html += "</tr></thead><tbody>";
  s.categories.forEach((c, ci) => {
    html += "<tr><th scope=\"row\">" + escapeHtml(categoryLabel(c)) + "</th>";
    for (let i = 0; i < count; i++) {
      const pts = s.scores[c + "|" + i] || 0;
      const label = tCat("categories_cell_aria", { p: playerName(i), s: categoryLabel(c), n: pts });
      html += "<td><button type=\"button\" class=\"categories-cell" + (pts ? " categories-cell-scored" : "") +
        "\" data-cat=\"" + ci + "\" data-player=\"" + i + "\" aria-label=\"" + escapeHtml(label) + "\"" +
        (live ? "" : " disabled") + ">" + pts + "</button></td>";
    }
    html += "</tr>";
  });
  html += "</tbody><tfoot><tr><th scope=\"row\">" + escapeHtml(tCat("categories_row_round")) + "</th>";
  for (let i = 0; i < count; i++) html += "<td>" + (s.roundScored ? "–" : roundSum(i)) + "</td>";
  html += "</tr><tr class=\"categories-total-row\"><th scope=\"row\">" + escapeHtml(tCat("categories_row_total")) + "</th>";
  for (let i = 0; i < count; i++) html += "<td>" + s.totals[i] + "</td>";
  html += "</tr></tfoot>";
  table.innerHTML = html;
  renderTimer();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
}

/*** Init ***/

function initCategoriesApp() {
  buildCategorySettings();
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
  on("menu-toggle", () => {
    const panel = document.getElementById("settings-panel");
    setCategoriesSettingsOpen(!!panel && panel.classList.contains("hidden"));
  });
  on("start-categories-game", startCategoriesGame);
  on("categories-draw-btn", drawCategoriesLetter);
  on("categories-stop-btn", pressCategoriesStop);
  on("categories-score-btn", scoreCategoriesRound);
  on("categories-finish-btn", finishCategoriesGame);
  const table = document.getElementById("categories-board");
  if (table) {
    table.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".categories-cell");
      if (!btn || btn.disabled) return;
      const category = AppStateCategories.categories[parseInt(btn.dataset.cat, 10)];
      cycleCategoriesScore(category, parseInt(btn.dataset.player, 10));
    });
  }

  const saved = typeof GameStorage !== "undefined" ? GameStorage.load(CATEGORIES_SAVE_KEY) : null;
  if (saved && Array.isArray(saved.categories) && Array.isArray(saved.totals)) {
    Object.assign(AppStateCategories, saved, { started: true, timerEnd: null, timerId: null });
    showCategoriesBoard();
    renderCategories();
    setStatusCategories(saved.roundScored ? tCat("categories_ready") : tCat("categories_score_hint"));
  }

  if (typeof I18n !== "undefined" && typeof I18n.onChange === "function") {
    I18n.onChange(() => {
      buildCategorySettings();
      renderCategories();
    });
  }
}

document.addEventListener("DOMContentLoaded", initCategoriesApp);
