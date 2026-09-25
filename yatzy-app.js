// yatzy-app.js
// Wires YatzyCore to the yatzy.html UI. Solitaire, like the other
// puzzles here - no opponent, no AI, just the dice and the scoresheet.
//
// Dice are drawn as flat, monochrome pip-face SVGs (no color, matching
// the rest of the site's e-ink-friendly icon style) rather than photos
// or a color-per-value scheme. A held die is shown inverted (dark face,
// light pips) instead of using a color to mark it, so "held" reads
// clearly in plain black-and-white. Category names in the scoresheet
// are built from CATEGORIES at runtime (not static HTML), so they're
// re-labelled through I18n.t() directly, with an I18n.onChange listener
// keeping them in sync if the language changes mid-game.

const AppStateYatzy = {
  state: null,
  bestScore: 0
};

const YATZY_SAVE_KEY = "einkchess_save_yatzy";
const YATZY_BEST_KEY = "einkchess_best_yatzy";

function saveYatzyGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(YATZY_SAVE_KEY, { state: AppStateYatzy.state });
}

function clearSavedYatzyGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(YATZY_SAVE_KEY);
}

function loadBestScoreYatzy() {
  try {
    const raw = window.localStorage ? window.localStorage.getItem(YATZY_BEST_KEY) : null;
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

function saveBestScoreYatzy(score) {
  try {
    if (window.localStorage) window.localStorage.setItem(YATZY_BEST_KEY, String(score));
  } catch (e) { /* storage unavailable - just don't persist */ }
}

function t18n(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

function setStatusYatzy(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultYatzy(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultYatzy(title, message) {
  setGameResultYatzy(message);
  setStatusYatzy("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

/*** Dice rendering: flat pip-dot SVG faces, monochrome ***/

// 3x3 pip grid positions (as fractions of the die face) per value.
const YATZY_PIP_LAYOUT = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]]
};
const YATZY_PIP_COORD = [27, 50, 73];

function yatzyDieSvg(value, held) {
  const faceFill = held ? "#141413" : "#ffffff";
  const pipFill = held ? "#ffffff" : "#141413";
  const dashed = value < 1 || value > 6;
  const rect = '<rect x="6" y="6" width="88" height="88" rx="16" fill="' + faceFill +
    '" stroke="#141413" stroke-width="5"' + (dashed ? ' stroke-dasharray="9 7"' : "") + "/>";
  let pips = "";
  if (!dashed) {
    (YATZY_PIP_LAYOUT[value] || []).forEach((pos) => {
      const cx = YATZY_PIP_COORD[pos[0]];
      const cy = YATZY_PIP_COORD[pos[1]];
      pips += '<circle cx="' + cx + '" cy="' + cy + '" r="8.5" fill="' + pipFill + '"/>';
    });
  }
  return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + rect + pips + "</svg>";
}

function initYatzyApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-yatzy-game");
  const rollBtn = document.getElementById("yatzy-roll-btn");

  AppStateYatzy.bestScore = loadBestScoreYatzy();

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_toggle");
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) I18n.setKey(menuToggle, "menu_close");
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function startNewGameYatzy() {
    AppStateYatzy.state = YatzyCore.createInitialState();
    setGameResultYatzy("");
    showBoardSectionYatzy();
    buildYatzyDiceDOM();
    buildYatzyScoresheetDOM();
    updateYatzyBoard();
    setStatusYatzy("board-info", t18n("yatzy_roll_hint"));
  }

  startGameBtn.addEventListener("click", startNewGameYatzy);

  if (rollBtn) {
    rollBtn.addEventListener("click", rollYatzyDice);
  }

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStateYatzy.state) updateYatzyBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(YATZY_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateYatzy.state = savedGame.state;
    setGameResultYatzy("");
    showBoardSectionYatzy();
    buildYatzyDiceDOM();
    buildYatzyScoresheetDOM();
    updateYatzyBoard();
    setStatusYatzy("board-info", AppStateYatzy.state.gameOver ? "" :
      (AppStateYatzy.state.rollsUsed > 0 ? t18n("yatzy_pick_hint") : t18n("yatzy_roll_hint")));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function rollYatzyDice() {
  if (!AppStateYatzy.state) return;
  const next = YatzyCore.roll(AppStateYatzy.state);
  if (next === AppStateYatzy.state) return; // no-op: already used 3 rolls, or game over
  AppStateYatzy.state = next;
  updateYatzyBoard();
  setStatusYatzy("board-info", t18n("yatzy_pick_hint"));
}

function toggleYatzyHold(index) {
  if (!AppStateYatzy.state) return;
  const next = YatzyCore.toggleHold(AppStateYatzy.state, index);
  if (next === AppStateYatzy.state) return;
  AppStateYatzy.state = next;
  updateYatzyBoard();
}

function chooseYatzyCategory(categoryId) {
  if (!AppStateYatzy.state) return;
  const before = AppStateYatzy.state;
  const next = YatzyCore.commitCategory(before, categoryId);
  if (next === before) return; // no-op: no roll yet this round, or category already filled

  AppStateYatzy.state = next;

  if (next.gameOver) {
    const totals = YatzyCore.computeTotals(next.scores);
    if (totals.grandTotal > AppStateYatzy.bestScore) {
      AppStateYatzy.bestScore = totals.grandTotal;
      saveBestScoreYatzy(totals.grandTotal);
    }
    updateYatzyBoard();
    announceGameResultYatzy(t18n("yatzy_game_over_title"), t18n("yatzy_final_score") + ": " + totals.grandTotal);
    return;
  }

  updateYatzyBoard();
  setStatusYatzy("board-info", t18n("yatzy_roll_hint"));
}

function showBoardSectionYatzy() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Dice row ***/

function buildYatzyDiceDOM() {
  const diceRow = document.getElementById("yatzy-dice-row");
  if (!diceRow) return;
  diceRow.innerHTML = "";
  for (let i = 0; i < YatzyCore.DICE_COUNT; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "yatzy-die";
    btn.dataset.index = i;
    btn.addEventListener("click", () => toggleYatzyHold(i));
    diceRow.appendChild(btn);
  }
}

function updateYatzyDice() {
  const state = AppStateYatzy.state;
  const diceRow = document.getElementById("yatzy-dice-row");
  if (!diceRow || !state) return;
  const canHold = state.rollsUsed >= 1 && state.rollsUsed < YatzyCore.MAX_ROLLS && !state.gameOver;

  diceRow.querySelectorAll(".yatzy-die").forEach((btn) => {
    const i = parseInt(btn.dataset.index, 10);
    const value = state.dice[i];
    const held = !!state.held[i];
    btn.innerHTML = yatzyDieSvg(value, held);
    btn.classList.toggle("yatzy-die-held", held);
    btn.disabled = !canHold;

    const valueLabel = value >= 1 && value <= 6 ? String(value) : t18n("yatzy_not_rolled");
    let label = t18n("yatzy_die_label") + " " + (i + 1) + ": " + valueLabel;
    if (held) label += ", " + t18n("yatzy_held");
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-pressed", held ? "true" : "false");
  });
}

/*** Scoresheet ***/

function buildYatzyScoresheetDOM() {
  const body = document.getElementById("yatzy-scoresheet-body");
  if (!body) return;
  body.innerHTML = "";

  YatzyCore.UPPER_IDS.forEach((id) => body.appendChild(buildYatzyCategoryRow(id)));
  body.appendChild(buildYatzySubtotalRow("yatzy-row-upper-sum", "yatzy_upper_sum"));
  body.appendChild(buildYatzySubtotalRow("yatzy-row-upper-bonus", "yatzy_upper_bonus"));
  YatzyCore.LOWER_IDS.forEach((id) => body.appendChild(buildYatzyCategoryRow(id)));
  body.appendChild(buildYatzySubtotalRow("yatzy-row-grand-total", "yatzy_grand_total", true));
}

function buildYatzyCategoryRow(categoryId) {
  const tr = document.createElement("tr");
  tr.dataset.category = categoryId;

  const nameCell = document.createElement("td");
  nameCell.className = "yatzy-cat-name";
  tr.appendChild(nameCell);

  const scoreCell = document.createElement("td");
  scoreCell.className = "yatzy-cat-score";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "yatzy-score-btn";
  btn.addEventListener("click", () => chooseYatzyCategory(categoryId));
  scoreCell.appendChild(btn);
  tr.appendChild(scoreCell);

  return tr;
}

function buildYatzySubtotalRow(rowId, labelKey, strong) {
  const tr = document.createElement("tr");
  tr.id = rowId;
  tr.className = "yatzy-subtotal-row" + (strong ? " yatzy-grand-total-row" : "");

  const nameCell = document.createElement("td");
  nameCell.dataset.i18nKey = labelKey;
  tr.appendChild(nameCell);

  const scoreCell = document.createElement("td");
  scoreCell.className = "yatzy-subtotal-value";
  tr.appendChild(scoreCell);

  return tr;
}

function updateYatzyScoresheet() {
  const state = AppStateYatzy.state;
  const body = document.getElementById("yatzy-scoresheet-body");
  if (!body || !state) return;

  body.querySelectorAll("tr[data-category]").forEach((tr) => {
    const categoryId = tr.dataset.category;
    const nameCell = tr.querySelector(".yatzy-cat-name");
    if (nameCell) nameCell.textContent = t18n("yatzy_cat_" + toSnakeCaseYatzy(categoryId));

    const filled = YatzyCore.isCategoryFilled(state, categoryId);
    const btn = tr.querySelector(".yatzy-score-btn");
    if (!btn) return;

    if (filled) {
      btn.textContent = String(state.scores[categoryId]);
      btn.disabled = true;
      btn.className = "yatzy-score-btn yatzy-score-filled";
    } else if (state.rollsUsed >= 1 && !state.gameOver) {
      const preview = YatzyCore.potentialScore(state.dice, categoryId);
      btn.textContent = String(preview);
      btn.disabled = false;
      btn.className = "yatzy-score-btn yatzy-score-preview";
    } else {
      btn.textContent = "–"; // en dash: not yet available
      btn.disabled = true;
      btn.className = "yatzy-score-btn";
    }
    btn.setAttribute("aria-label", nameCell ? (nameCell.textContent + ": " + btn.textContent) : btn.textContent);
  });

  body.querySelectorAll("[data-i18n-key]").forEach((cell) => {
    cell.textContent = t18n(cell.dataset.i18nKey);
  });

  const totals = YatzyCore.computeTotals(state.scores);
  setSubtotalValueYatzy("yatzy-row-upper-sum", totals.upperTotal);
  setSubtotalValueYatzy("yatzy-row-upper-bonus", totals.bonus);
  setSubtotalValueYatzy("yatzy-row-grand-total", totals.grandTotal);
}

function setSubtotalValueYatzy(rowId, value) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const cell = row.querySelector(".yatzy-subtotal-value");
  if (cell) cell.textContent = String(value);
}

// "threeOfKind" -> "three_of_kind", "onePair" -> "one_pair", etc. -
// matches the yatzy_cat_* i18n key naming for each CATEGORIES id.
function toSnakeCaseYatzy(id) {
  return id.replace(/([A-Z])/g, "_$1").toLowerCase();
}

function updateYatzyBoard() {
  const state = AppStateYatzy.state;
  if (!state) return;

  updateYatzyDice();
  updateYatzyScoresheet();

  const rollBtn = document.getElementById("yatzy-roll-btn");
  if (rollBtn) {
    rollBtn.disabled = state.gameOver || state.rollsUsed >= YatzyCore.MAX_ROLLS;
  }

  const meta = document.getElementById("game-meta");
  if (meta) {
    const totals = YatzyCore.computeTotals(state.scores);
    const roundLabel = state.gameOver ? YatzyCore.CATEGORIES.length : Math.min(state.round, YatzyCore.CATEGORIES.length);
    meta.textContent = t18n("yatzy_round_label") + " " + roundLabel + " / " + YatzyCore.CATEGORIES.length +
      "   " + t18n("yatzy_rolls_left") + ": " + (YatzyCore.MAX_ROLLS - state.rollsUsed) +
      "   " + t18n("yatzy_total_label") + ": " + totals.grandTotal;
  }

  if (state.gameOver) clearSavedYatzyGame();
  else saveYatzyGame();
}

document.addEventListener("DOMContentLoaded", initYatzyApp);
