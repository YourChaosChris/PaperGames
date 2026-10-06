// bullsandcows-app.js
// Wires BullsAndCowsCore to the bullsandcows.html UI. Solitaire, like Sudoku
// and Minesweeper - no opponent, no AI, just a hidden code chosen once
// at the start of the game and a limited number of guesses to crack it.
//
// The classic game uses six colored pegs; this monochrome e-ink version
// swaps color for six flat shapes instead (see BullsAndCowsCore.SYMBOLS),
// drawn as small inline SVGs so they stay crisp at any zoom level. Each
// of the four guess slots is a single button: tapping it cycles through
// the six shapes in order, which needs no drag-and-drop, no color
// picker, and no hover state - just repeated taps, which works equally
// well with a finger on a touchscreen e-reader or a mouse.
//
// Feedback pegs (black = right shape & position, white = right shape,
// wrong position) are drawn as small filled/hollow circles rather than
// colored dots, and a short static legend under the guess row spells out
// what they mean since there's no color to lean on.

const AppStateBullsAndCows = {
  state: null,
  currentGuess: null
};

const BULLSANDCOWS_SAVE_KEY = "einkchess_save_bullsandcows";

function saveBullsAndCowsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(BULLSANDCOWS_SAVE_KEY, {
    state: AppStateBullsAndCows.state,
    currentGuess: AppStateBullsAndCows.currentGuess
  });
}

function clearSavedBullsAndCowsGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(BULLSANDCOWS_SAVE_KEY);
}

function recordBullsAndCowsStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("bullsandcows", outcome);
}

function t18nBullsAndCows(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

function setStatusBullsAndCows(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultBullsAndCows(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultBullsAndCows(title, message) {
  setGameResultBullsAndCows(message);
  setStatusBullsAndCows("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

/*** Shape rendering: flat, monochrome inline SVGs - one per symbol ***/

function bullsandcowsShapeMarkup(symbol, color) {
  switch (symbol) {
    case "circle":
      return '<circle cx="50" cy="50" r="34" fill="' + color + '"/>';
    case "square":
      return '<rect x="16" y="16" width="68" height="68" fill="' + color + '"/>';
    case "triangle":
      return '<polygon points="50,12 90,82 10,82" fill="' + color + '"/>';
    case "diamond":
      return '<polygon points="50,8 92,50 50,92 8,50" fill="' + color + '"/>';
    case "star":
      return '<polygon points="50,2 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="' + color + '"/>';
    case "cross":
      return '<rect x="38" y="14" width="24" height="72" fill="' + color + '"/><rect x="14" y="38" width="72" height="24" fill="' + color + '"/>';
    default:
      return "";
  }
}

function bullsandcowsSymbolSvg(symbol, color) {
  return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + bullsandcowsShapeMarkup(symbol, color || "#141413") + "</svg>";
}

function bullsandcowsSymbolName(symbol) {
  return t18nBullsAndCows("bullsandcows_symbol_" + symbol);
}

function initBullsAndCowsApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("bullsandcows-level-inline");
  const startGameBtn = document.getElementById("start-bullsandcows-game");
  const submitBtn = document.getElementById("bullsandcows-submit-btn");

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

  function defaultGuess() {
    return new Array(BullsAndCowsCore.CODE_LENGTH).fill(BullsAndCowsCore.SYMBOLS[0]);
  }

  // rng/isDaily: today's secret (seeded from the UTC date) instead of a random one.
  function startNewGameBullsAndCows(level, rng, isDaily) {
    AppStateBullsAndCows.state = BullsAndCowsCore.createState(level, rng);
    AppStateBullsAndCows.currentGuess = defaultGuess();
    setGameResultBullsAndCows("");
    showBoardSectionBullsAndCows();
    buildBullsAndCowsGuessRowDOM();
    updateBullsAndCowsBoard();
    const hint = t18nBullsAndCows("bullsandcows_hint_start");
    setStatusBullsAndCows("board-info", isDaily ? "Daily Challenge (" + DailyChallenge.todayKey() + "). " + hint : hint);
  }

  const dailyBtn = document.getElementById("daily-bullsandcows-button");
  if (dailyBtn) {
    dailyBtn.addEventListener("click", () => {
      startNewGameBullsAndCows("medium", DailyChallenge.makeTodaysRng("bullsandcows"), true);
    });
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? levelInline.value : "medium";
    startNewGameBullsAndCows(level);
  });

  if (submitBtn) {
    submitBtn.addEventListener("click", onSubmitGuessBullsAndCows);
  }

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStateBullsAndCows.state) updateBullsAndCowsBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(BULLSANDCOWS_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateBullsAndCows.state = savedGame.state;
    AppStateBullsAndCows.currentGuess = savedGame.currentGuess && savedGame.currentGuess.length === BullsAndCowsCore.CODE_LENGTH
      ? savedGame.currentGuess
      : defaultGuess();
    if (levelInline) levelInline.value = AppStateBullsAndCows.state.level;
    setGameResultBullsAndCows("");
    showBoardSectionBullsAndCows();
    buildBullsAndCowsGuessRowDOM();
    updateBullsAndCowsBoard();
    setStatusBullsAndCows("board-info", AppStateBullsAndCows.state.gameOver ? "" : t18nBullsAndCows("bullsandcows_hint_continue"));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function onSlotClickBullsAndCows(index) {
  if (!AppStateBullsAndCows.state || AppStateBullsAndCows.state.gameOver) return;
  const symbols = BullsAndCowsCore.SYMBOLS;
  const current = AppStateBullsAndCows.currentGuess[index];
  const next = symbols[(symbols.indexOf(current) + 1) % symbols.length];
  AppStateBullsAndCows.currentGuess[index] = next;
  updateBullsAndCowsGuessRow();
  saveBullsAndCowsGame();
}

function onSubmitGuessBullsAndCows() {
  if (!AppStateBullsAndCows.state || AppStateBullsAndCows.state.gameOver) return;
  const guess = AppStateBullsAndCows.currentGuess.slice();
  AppStateBullsAndCows.state = BullsAndCowsCore.submitGuess(AppStateBullsAndCows.state, guess);
  AppStateBullsAndCows.currentGuess = new Array(BullsAndCowsCore.CODE_LENGTH).fill(BullsAndCowsCore.SYMBOLS[0]);

  updateBullsAndCowsBoard();

  if (AppStateBullsAndCows.state.gameOver) {
    if (AppStateBullsAndCows.state.won) {
      const used = AppStateBullsAndCows.state.guesses.length;
      const message = t18nBullsAndCows("bullsandcows_win_message") + ": " + used + " / " + AppStateBullsAndCows.state.maxGuesses;
      announceGameResultBullsAndCows(t18nBullsAndCows("bullsandcows_win_title"), message);
      recordBullsAndCowsStats("win");
    } else {
      const codeNames = AppStateBullsAndCows.state.secret.map(bullsandcowsSymbolName).join(", ");
      const message = t18nBullsAndCows("bullsandcows_lose_message") + ": " + codeNames;
      announceGameResultBullsAndCows(t18nBullsAndCows("bullsandcows_lose_title"), message);
      recordBullsAndCowsStats("loss");
    }
  } else {
    const last = AppStateBullsAndCows.state.guesses[AppStateBullsAndCows.state.guesses.length - 1];
    const status = t18nBullsAndCows("bullsandcows_black_pegs_label") + ": " + last.black + "   " +
      t18nBullsAndCows("bullsandcows_white_pegs_label") + ": " + last.white;
    setStatusBullsAndCows("board-info", status);
  }
}

function showBoardSectionBullsAndCows() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Guess-in-progress row: 4 slots, each cycling through the 6 shapes ***/

function buildBullsAndCowsGuessRowDOM() {
  const row = document.getElementById("bullsandcows-guess-row");
  if (!row) return;
  row.innerHTML = "";
  for (let i = 0; i < BullsAndCowsCore.CODE_LENGTH; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bullsandcows-slot";
    btn.dataset.index = i;
    btn.addEventListener("click", () => onSlotClickBullsAndCows(i));
    row.appendChild(btn);
  }
  updateBullsAndCowsGuessRow();
}

function updateBullsAndCowsGuessRow() {
  const row = document.getElementById("bullsandcows-guess-row");
  if (!row || !AppStateBullsAndCows.currentGuess) return;
  const gameOver = !!(AppStateBullsAndCows.state && AppStateBullsAndCows.state.gameOver);
  row.querySelectorAll(".bullsandcows-slot").forEach((btn) => {
    const i = parseInt(btn.dataset.index, 10);
    const symbol = AppStateBullsAndCows.currentGuess[i];
    btn.innerHTML = bullsandcowsSymbolSvg(symbol, "#141413");
    btn.disabled = gameOver;
    I18n.setAria(btn, t18nBullsAndCows("bullsandcows_slot_aria") + " " + (i + 1) + ": " + bullsandcowsSymbolName(symbol) + ". " + t18nBullsAndCows("bullsandcows_slot_hint"));
  });
}

/*** Guess history: one row per past guess, shapes plus black/white pegs ***/

// Two counters (symbol + number) instead of four tiny pegs: on a
// monochrome e-ink screen an empty placeholder peg and a white peg were
// practically indistinguishable. A count still doesn't reveal which
// position is meant, so the rules are unchanged.
function bullsandcowsPegRowMarkup(black, white) {
  function counter(kind, value) {
    return '<span class="bullsandcows-score' + (value === 0 ? ' bullsandcows-score-zero' : '') + '">' +
      '<span class="bullsandcows-peg bullsandcows-peg-' + kind + '" aria-hidden="true"></span>' +
      '<span class="bullsandcows-score-num">' + value + '</span>' +
      '</span>';
  }
  return counter("black", black) + counter("white", white);
}

function renderBullsAndCowsHistory() {
  const list = document.getElementById("bullsandcows-history");
  if (!list || !AppStateBullsAndCows.state) return;
  list.innerHTML = "";

  AppStateBullsAndCows.state.guesses.forEach((entry, idx) => {
    const row = document.createElement("div");
    row.className = "bullsandcows-history-row";

    const number = document.createElement("div");
    number.className = "bullsandcows-history-number";
    number.textContent = t18nBullsAndCows("bullsandcows_guess_number_label") + " " + (idx + 1);
    row.appendChild(number);

    const shapes = document.createElement("div");
    shapes.className = "bullsandcows-history-shapes";
    entry.guess.forEach((symbol) => {
      const shape = document.createElement("span");
      shape.className = "bullsandcows-history-shape";
      shape.innerHTML = bullsandcowsSymbolSvg(symbol, "#141413");
      I18n.setAria(shape, bullsandcowsSymbolName(symbol));
      shapes.appendChild(shape);
    });
    row.appendChild(shapes);

    const pegs = document.createElement("div");
    pegs.className = "bullsandcows-history-pegs";
    pegs.innerHTML = bullsandcowsPegRowMarkup(entry.black, entry.white);
    I18n.setAria(pegs, t18nBullsAndCows("bullsandcows_black_pegs_label") + ": " + entry.black + ", " +
      t18nBullsAndCows("bullsandcows_white_pegs_label") + ": " + entry.white);
    row.appendChild(pegs);

    list.appendChild(row);
  });
}

function updateBullsAndCowsBoard() {
  const state = AppStateBullsAndCows.state;
  if (!state) return;

  updateBullsAndCowsGuessRow();
  renderBullsAndCowsHistory();

  const submitBtn = document.getElementById("bullsandcows-submit-btn");
  if (submitBtn) submitBtn.disabled = state.gameOver;

  const meta = document.getElementById("game-meta");
  if (meta) {
    const remaining = BullsAndCowsCore.guessesRemaining(state);
    meta.textContent = t18nBullsAndCows("bullsandcows_guesses_used_label") + ": " + state.guesses.length + " / " + state.maxGuesses +
      "   " + t18nBullsAndCows("bullsandcows_guesses_left_label") + ": " + remaining;
  }

  if (state.gameOver) clearSavedBullsAndCowsGame();
  else saveBullsAndCowsGame();
}

document.addEventListener("DOMContentLoaded", initBullsAndCowsApp);
