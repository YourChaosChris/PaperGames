// mastermind-app.js
// Wires MastermindCore to the mastermind.html UI. Solitaire, like Sudoku
// and Minesweeper - no opponent, no AI, just a hidden code chosen once
// at the start of the game and a limited number of guesses to crack it.
//
// The classic game uses six colored pegs; this monochrome e-ink version
// swaps color for six flat shapes instead (see MastermindCore.SYMBOLS),
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

const AppStateMastermind = {
  state: null,
  currentGuess: null
};

const MASTERMIND_SAVE_KEY = "einkchess_save_mastermind";

function saveMastermindGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(MASTERMIND_SAVE_KEY, {
    state: AppStateMastermind.state,
    currentGuess: AppStateMastermind.currentGuess
  });
}

function clearSavedMastermindGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(MASTERMIND_SAVE_KEY);
}

function recordMastermindStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("mastermind", outcome);
}

function t18nMastermind(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

function setStatusMastermind(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text || "";
}

function setGameResultMastermind(text) {
  const el = document.getElementById("game-result");
  if (el) el.textContent = text || "";
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultMastermind(title, message) {
  setGameResultMastermind(message);
  setStatusMastermind("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

/*** Shape rendering: flat, monochrome inline SVGs - one per symbol ***/

function mastermindShapeMarkup(symbol, color) {
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

function mastermindSymbolSvg(symbol, color) {
  return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + mastermindShapeMarkup(symbol, color || "#141413") + "</svg>";
}

function mastermindSymbolName(symbol) {
  return t18nMastermind("mastermind_symbol_" + symbol);
}

function initMastermindApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("mastermind-level-inline");
  const startGameBtn = document.getElementById("start-mastermind-game");
  const submitBtn = document.getElementById("mastermind-submit-btn");

  function closeSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.add("hidden");
    if (menuToggle) menuToggle.textContent = "☰ Menu";
  }

  function openSettingsPanel() {
    if (!settingsPanel) return;
    settingsPanel.classList.remove("hidden");
    if (menuToggle) menuToggle.textContent = "✕ Close";
  }

  if (menuToggle && settingsPanel) {
    menuToggle.addEventListener("click", () => {
      if (settingsPanel.classList.contains("hidden")) openSettingsPanel();
      else closeSettingsPanel();
    });
  }

  function defaultGuess() {
    return new Array(MastermindCore.CODE_LENGTH).fill(MastermindCore.SYMBOLS[0]);
  }

  function startNewGameMastermind(level) {
    AppStateMastermind.state = MastermindCore.createState(level);
    AppStateMastermind.currentGuess = defaultGuess();
    setGameResultMastermind("");
    showBoardSectionMastermind();
    buildMastermindGuessRowDOM();
    updateMastermindBoard();
    setStatusMastermind("board-info", t18nMastermind("mastermind_hint_start"));
  }

  startGameBtn.addEventListener("click", () => {
    const level = levelInline ? levelInline.value : "medium";
    startNewGameMastermind(level);
  });

  if (submitBtn) {
    submitBtn.addEventListener("click", onSubmitGuessMastermind);
  }

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStateMastermind.state) updateMastermindBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(MASTERMIND_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateMastermind.state = savedGame.state;
    AppStateMastermind.currentGuess = savedGame.currentGuess && savedGame.currentGuess.length === MastermindCore.CODE_LENGTH
      ? savedGame.currentGuess
      : defaultGuess();
    if (levelInline) levelInline.value = AppStateMastermind.state.level;
    setGameResultMastermind("");
    showBoardSectionMastermind();
    buildMastermindGuessRowDOM();
    updateMastermindBoard();
    setStatusMastermind("board-info", AppStateMastermind.state.gameOver ? "" : t18nMastermind("mastermind_hint_continue"));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses New game.
}

function onSlotClickMastermind(index) {
  if (!AppStateMastermind.state || AppStateMastermind.state.gameOver) return;
  const symbols = MastermindCore.SYMBOLS;
  const current = AppStateMastermind.currentGuess[index];
  const next = symbols[(symbols.indexOf(current) + 1) % symbols.length];
  AppStateMastermind.currentGuess[index] = next;
  updateMastermindGuessRow();
  saveMastermindGame();
}

function onSubmitGuessMastermind() {
  if (!AppStateMastermind.state || AppStateMastermind.state.gameOver) return;
  const guess = AppStateMastermind.currentGuess.slice();
  AppStateMastermind.state = MastermindCore.submitGuess(AppStateMastermind.state, guess);
  AppStateMastermind.currentGuess = new Array(MastermindCore.CODE_LENGTH).fill(MastermindCore.SYMBOLS[0]);

  updateMastermindBoard();

  if (AppStateMastermind.state.gameOver) {
    if (AppStateMastermind.state.won) {
      const used = AppStateMastermind.state.guesses.length;
      const message = t18nMastermind("mastermind_win_message") + ": " + used + " / " + AppStateMastermind.state.maxGuesses;
      announceGameResultMastermind(t18nMastermind("mastermind_win_title"), message);
      recordMastermindStats("win");
    } else {
      const codeNames = AppStateMastermind.state.secret.map(mastermindSymbolName).join(", ");
      const message = t18nMastermind("mastermind_lose_message") + ": " + codeNames;
      announceGameResultMastermind(t18nMastermind("mastermind_lose_title"), message);
      recordMastermindStats("loss");
    }
  } else {
    const last = AppStateMastermind.state.guesses[AppStateMastermind.state.guesses.length - 1];
    const status = t18nMastermind("mastermind_black_pegs_label") + ": " + last.black + "   " +
      t18nMastermind("mastermind_white_pegs_label") + ": " + last.white;
    setStatusMastermind("board-info", status);
  }
}

function showBoardSectionMastermind() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Guess-in-progress row: 4 slots, each cycling through the 6 shapes ***/

function buildMastermindGuessRowDOM() {
  const row = document.getElementById("mastermind-guess-row");
  if (!row) return;
  row.innerHTML = "";
  for (let i = 0; i < MastermindCore.CODE_LENGTH; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mastermind-slot";
    btn.dataset.index = i;
    btn.addEventListener("click", () => onSlotClickMastermind(i));
    row.appendChild(btn);
  }
  updateMastermindGuessRow();
}

function updateMastermindGuessRow() {
  const row = document.getElementById("mastermind-guess-row");
  if (!row || !AppStateMastermind.currentGuess) return;
  const gameOver = !!(AppStateMastermind.state && AppStateMastermind.state.gameOver);
  row.querySelectorAll(".mastermind-slot").forEach((btn) => {
    const i = parseInt(btn.dataset.index, 10);
    const symbol = AppStateMastermind.currentGuess[i];
    btn.innerHTML = mastermindSymbolSvg(symbol, "#141413");
    btn.disabled = gameOver;
    btn.setAttribute("aria-label",
      t18nMastermind("mastermind_slot_aria") + " " + (i + 1) + ": " + mastermindSymbolName(symbol) + ". " + t18nMastermind("mastermind_slot_hint"));
  });
}

/*** Guess history: one row per past guess, shapes plus black/white pegs ***/

function mastermindPegRowMarkup(black, white) {
  let html = "";
  for (let i = 0; i < black; i++) html += '<span class="mastermind-peg mastermind-peg-black"></span>';
  for (let i = 0; i < white; i++) html += '<span class="mastermind-peg mastermind-peg-white"></span>';
  const empty = MastermindCore.CODE_LENGTH - black - white;
  for (let i = 0; i < empty; i++) html += '<span class="mastermind-peg mastermind-peg-empty"></span>';
  return html;
}

function renderMastermindHistory() {
  const list = document.getElementById("mastermind-history");
  if (!list || !AppStateMastermind.state) return;
  list.innerHTML = "";

  AppStateMastermind.state.guesses.forEach((entry, idx) => {
    const row = document.createElement("div");
    row.className = "mastermind-history-row";

    const number = document.createElement("div");
    number.className = "mastermind-history-number";
    number.textContent = t18nMastermind("mastermind_guess_number_label") + " " + (idx + 1);
    row.appendChild(number);

    const shapes = document.createElement("div");
    shapes.className = "mastermind-history-shapes";
    entry.guess.forEach((symbol) => {
      const shape = document.createElement("span");
      shape.className = "mastermind-history-shape";
      shape.innerHTML = mastermindSymbolSvg(symbol, "#141413");
      shape.setAttribute("aria-label", mastermindSymbolName(symbol));
      shapes.appendChild(shape);
    });
    row.appendChild(shapes);

    const pegs = document.createElement("div");
    pegs.className = "mastermind-history-pegs";
    pegs.innerHTML = mastermindPegRowMarkup(entry.black, entry.white);
    pegs.setAttribute("aria-label",
      t18nMastermind("mastermind_black_pegs_label") + ": " + entry.black + ", " +
      t18nMastermind("mastermind_white_pegs_label") + ": " + entry.white);
    row.appendChild(pegs);

    list.appendChild(row);
  });
}

function updateMastermindBoard() {
  const state = AppStateMastermind.state;
  if (!state) return;

  updateMastermindGuessRow();
  renderMastermindHistory();

  const submitBtn = document.getElementById("mastermind-submit-btn");
  if (submitBtn) submitBtn.disabled = state.gameOver;

  const meta = document.getElementById("game-meta");
  if (meta) {
    const remaining = MastermindCore.guessesRemaining(state);
    meta.textContent = t18nMastermind("mastermind_guesses_used_label") + ": " + state.guesses.length + " / " + state.maxGuesses +
      "   " + t18nMastermind("mastermind_guesses_left_label") + ": " + remaining;
  }

  if (state.gameOver) clearSavedMastermindGame();
  else saveMastermindGame();
}

document.addEventListener("DOMContentLoaded", initMastermindApp);
