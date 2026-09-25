// klondike-app.js
// Wires KlondikeCore to the klondike.html UI. Solitaire, like the other
// card/tile puzzles here - no opponent, no AI, no difficulty picker,
// since a Klondike deal is just a fresh random shuffle each time.
//
// Cards show their rank and suit as plain text - the four suit glyphs
// (♠ ♥ ♦ ♣) are already shape-distinct from each other, so nothing
// here needs the traditional red/black suit coloring to stay readable
// on a monochrome E-Ink display; the game's own alternating-color
// stacking rule works the same way it always has, just learned by
// suit shape instead of by color. Face-down tableau cards get a
// hatched back instead of a color, the same "structural, not color"
// convention used everywhere else in this app.
//
// Tap-to-select-source, tap-to-select-destination, exactly like
// FreeCell: tap the exposed top card of a waste/tableau pile (or the
// start of a valid run further up a tableau column) to select it,
// then tap a tableau column or a foundation to move it there. Tap the
// stock pile to draw a card (or to recycle the waste back into the
// stock once it's empty). Clicking a different valid source while
// something is already selected just switches the selection, rather
// than requiring a deselect first.

const SUIT_SYMBOL_K = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANK_LABEL_K = { 1: "A", 11: "J", 12: "Q", 13: "K" };

function klondikeCardLabel(card) {
  const rank = RANK_LABEL_K[card.rank] || String(card.rank);
  return rank + SUIT_SYMBOL_K[card.suit];
}

function t18nKlondike(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

const AppStateKlondike = {
  state: null,
  selected: null, // { type: "column", col, index } | { type: "waste" } | null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const KLONDIKE_SAVE_KEY = "einkchess_save_klondike";

function saveKlondikeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(KLONDIKE_SAVE_KEY, {
    state: AppStateKlondike.state,
    moveCount: AppStateKlondike.moveCount
  });
}

function clearSavedKlondikeGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(KLONDIKE_SAVE_KEY);
}

function setStatusKlondike(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultKlondike(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultKlondike(title, message) {
  setGameResultKlondike(message);
  setStatusKlondike("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackKlondike() {
  AppStateKlondike.undoStack = [];
}

function pushUndoSnapshotKlondike() {
  AppStateKlondike.undoStack.push({
    state: KlondikeCore.cloneState(AppStateKlondike.state),
    moveCount: AppStateKlondike.moveCount
  });
}

function initKlondikeApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-klondike-game");

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

  function startNewGameKlondike() {
    AppStateKlondike.state = KlondikeCore.createInitialState();
    AppStateKlondike.selected = null;
    AppStateKlondike.gameOver = false;
    AppStateKlondike.moveCount = 0;
    resetUndoStackKlondike();
    setGameResultKlondike("");
    showBoardSectionKlondike();
    buildKlondikeBoardDOM();
    updateKlondikeBoard();
    updateGameLabelsKlondike();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_default"));
  }

  startGameBtn.addEventListener("click", startNewGameKlondike);

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStateKlondike.state) updateKlondikeBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(KLONDIKE_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateKlondike.state = savedGame.state;
    AppStateKlondike.moveCount = savedGame.moveCount;
    AppStateKlondike.selected = null;
    AppStateKlondike.gameOver = false;
    resetUndoStackKlondike();
    setGameResultKlondike("");
    showBoardSectionKlondike();
    buildKlondikeBoardDOM();
    updateKlondikeBoard();
    updateGameLabelsKlondike();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_default"));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function selectionsEqualKlondike(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "column") return a.col === b.col && a.index === b.index;
  return true;
}

function trySelectSourceKlondike(type, col, index) {
  if (type === "column") {
    if (!KlondikeCore.isMovableSequenceStart(AppStateKlondike.state, col, index)) return false;
    AppStateKlondike.selected = { type: "column", col, index };
    return true;
  }
  if (!KlondikeCore.topOfColumn(AppStateKlondike.state.waste)) return false;
  AppStateKlondike.selected = { type: "waste" };
  return true;
}

// The currently-selected card itself (for suit/rank checks), or null.
function selectedCardKlondike() {
  const sel = AppStateKlondike.selected;
  if (!sel) return null;
  if (sel.type === "waste") return KlondikeCore.topOfColumn(AppStateKlondike.state.waste);
  return AppStateKlondike.state.tableau[sel.col][sel.index];
}

function onKlondikeColumnClick(colIndex, cardIndex) {
  if (AppStateKlondike.gameOver || !AppStateKlondike.state) return;
  const sel = AppStateKlondike.selected;

  if (sel && sel.type === "column" && selectionsEqualKlondike(sel, { type: "column", col: colIndex, index: cardIndex })) {
    AppStateKlondike.selected = null;
    updateKlondikeBoard();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_default"));
    return;
  }

  if (sel) {
    const result = sel.type === "column"
      ? KlondikeCore.moveColumnToColumn(AppStateKlondike.state, sel.col, AppStateKlondike.state.tableau[sel.col].length - sel.index, colIndex)
      : KlondikeCore.moveWasteToColumn(AppStateKlondike.state, colIndex);
    if (result.ok) {
      pushUndoSnapshotKlondike();
      AppStateKlondike.state = result.state;
      AppStateKlondike.selected = null;
      AppStateKlondike.moveCount++;
      finishKlondikeAction();
      return;
    }
  }

  // No selection, or the move above failed - try treating this click as
  // picking a new source instead (a single click can both fail a move
  // and immediately start a new one, so re-picking never needs a
  // separate deselect click first).
  if (typeof cardIndex === "number" && trySelectSourceKlondike("column", colIndex, cardIndex)) {
    updateKlondikeBoard();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_selected"));
  } else {
    setStatusKlondike("board-info", sel ? t18nKlondike("klondike_msg_cant_place") : t18nKlondike("klondike_msg_cant_pick"));
  }
}

function onKlondikeWasteClick() {
  if (AppStateKlondike.gameOver || !AppStateKlondike.state) return;
  const sel = AppStateKlondike.selected;

  if (sel && sel.type === "waste") {
    AppStateKlondike.selected = null;
    updateKlondikeBoard();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_default"));
    return;
  }

  if (trySelectSourceKlondike("waste")) {
    updateKlondikeBoard();
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_selected"));
  } else {
    setStatusKlondike("board-info", t18nKlondike("klondike_msg_nothing_waste"));
  }
}

function onKlondikeStockClick() {
  if (AppStateKlondike.gameOver || !AppStateKlondike.state) return;
  const result = KlondikeCore.drawFromStock(AppStateKlondike.state);
  if (!result.ok) {
    setStatusKlondike("board-info", t18nKlondike("klondike_msg_stock_empty"));
    return;
  }
  pushUndoSnapshotKlondike();
  AppStateKlondike.state = result.state;
  AppStateKlondike.selected = null;
  AppStateKlondike.moveCount++;
  updateKlondikeBoard();
  updateGameLabelsKlondike();
  setStatusKlondike("board-info", result.recycled
    ? t18nKlondike("klondike_msg_recycled")
    : t18nKlondike("klondike_hint_default"));
}

function onKlondikeFoundationClick(suit) {
  if (AppStateKlondike.gameOver || !AppStateKlondike.state) return;
  const sel = AppStateKlondike.selected;
  if (!sel) return;

  const card = selectedCardKlondike();
  const count = sel.type === "column" ? AppStateKlondike.state.tableau[sel.col].length - sel.index : 1;
  if (!card || card.suit !== suit || count !== 1) {
    setStatusKlondike("board-info", t18nKlondike("klondike_msg_cant_place"));
    return;
  }

  const result = sel.type === "column"
    ? KlondikeCore.moveColumnToFoundation(AppStateKlondike.state, sel.col)
    : KlondikeCore.moveWasteToFoundation(AppStateKlondike.state);
  if (result.ok) {
    pushUndoSnapshotKlondike();
    AppStateKlondike.state = result.state;
    AppStateKlondike.selected = null;
    AppStateKlondike.moveCount++;
    finishKlondikeAction();
  } else {
    setStatusKlondike("board-info", t18nKlondike("klondike_msg_cant_place_yet"));
  }
}

function finishKlondikeAction() {
  updateKlondikeBoard();
  updateGameLabelsKlondike();

  if (KlondikeCore.isWon(AppStateKlondike.state)) {
    AppStateKlondike.gameOver = true;
    announceGameResultKlondike(t18nKlondike("klondike_win_title"), t18nKlondike("klondike_win_message"));
    updateGameLabelsKlondike();
  } else {
    setStatusKlondike("board-info", t18nKlondike("klondike_hint_default"));
  }
}

function undoLastMove() {
  if (!AppStateKlondike.undoStack || !AppStateKlondike.undoStack.length) return;
  const prev = AppStateKlondike.undoStack.pop();
  AppStateKlondike.state = prev.state;
  AppStateKlondike.moveCount = prev.moveCount;
  AppStateKlondike.selected = null;
  AppStateKlondike.gameOver = false;
  setGameResultKlondike("");
  updateKlondikeBoard();
  updateGameLabelsKlondike();
  setStatusKlondike("board-info", t18nKlondike("klondike_msg_undone"));
}

function showBoardSectionKlondike() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering ***/

function buildKlondikeBoardDOM() {
  const stockEl = document.getElementById("klondike-stock");
  const wasteEl = document.getElementById("klondike-waste");
  const foundationsEl = document.getElementById("klondike-foundations");
  const columnsEl = document.getElementById("klondike-columns");
  if (!stockEl || !wasteEl || !foundationsEl || !columnsEl) return;

  stockEl.innerHTML = "";
  stockEl.addEventListener("click", onKlondikeStockClick);

  wasteEl.innerHTML = "";
  wasteEl.addEventListener("click", onKlondikeWasteClick);

  foundationsEl.innerHTML = "";
  KlondikeCore.SUITS.forEach((suit) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "klondike-cell klondike-foundation";
    cell.dataset.suit = suit;
    cell.addEventListener("click", () => onKlondikeFoundationClick(suit));
    foundationsEl.appendChild(cell);
  });

  columnsEl.innerHTML = "";
  for (let c = 0; c < KlondikeCore.COLUMN_COUNT; c++) {
    const col = document.createElement("div");
    col.className = "klondike-column";
    col.dataset.col = c;
    col.addEventListener("click", () => onKlondikeColumnClick(c, null));
    columnsEl.appendChild(col);
  }
}

function updateKlondikeBoard() {
  const state = AppStateKlondike.state;
  if (!state) return;
  const sel = AppStateKlondike.selected;

  const stockEl = document.getElementById("klondike-stock");
  if (stockEl) {
    const hasStock = state.stock.length > 0;
    const hasWaste = state.waste.length > 0;
    stockEl.className = "klondike-cell klondike-stock" + (hasStock ? " klondike-card-back" : "");
    stockEl.textContent = hasStock ? "" : (hasWaste ? "↺" : "");
    stockEl.disabled = !hasStock && !hasWaste;
    stockEl.setAttribute("aria-label", hasStock
      ? t18nKlondike("klondike_aria_stock") + ": " + state.stock.length
      : (hasWaste
        ? t18nKlondike("klondike_aria_stock") + " " + t18nKlondike("klondike_aria_empty") + ", " + t18nKlondike("klondike_aria_tap_recycle")
        : t18nKlondike("klondike_aria_stock") + " " + t18nKlondike("klondike_aria_empty")));
  }

  const wasteEl = document.getElementById("klondike-waste");
  if (wasteEl) {
    const top = KlondikeCore.topOfColumn(state.waste);
    wasteEl.className = "klondike-cell klondike-waste" + (sel && sel.type === "waste" ? " klondike-card-selected" : "");
    wasteEl.textContent = top ? klondikeCardLabel(top) : "";
    wasteEl.setAttribute("aria-label", t18nKlondike("klondike_aria_waste") + ", " + (top ? klondikeCardLabel(top) : t18nKlondike("klondike_aria_empty")));
  }

  const foundationsEl = document.getElementById("klondike-foundations");
  if (foundationsEl) {
    foundationsEl.querySelectorAll(".klondike-foundation").forEach((cell) => {
      const suit = cell.dataset.suit;
      const rank = state.foundations[suit];
      cell.textContent = rank ? klondikeCardLabel({ rank, suit }) : SUIT_SYMBOL_K[suit];
      cell.classList.toggle("klondike-foundation-empty", rank === 0);
      cell.setAttribute("aria-label", t18nKlondike("klondike_aria_foundation") + " " + SUIT_SYMBOL_K[suit] + ", " +
        (rank ? t18nKlondike("klondike_aria_up_to") + " " + klondikeCardLabel({ rank, suit }) : t18nKlondike("klondike_aria_empty")));
    });
  }

  const columnsEl = document.getElementById("klondike-columns");
  if (columnsEl) {
    columnsEl.querySelectorAll(".klondike-column").forEach((colEl) => {
      const c = parseInt(colEl.dataset.col, 10);
      colEl.innerHTML = "";
      const column = state.tableau[c];
      if (!column.length) {
        const empty = document.createElement("span");
        empty.className = "klondike-empty-slot";
        empty.setAttribute("aria-hidden", "true");
        colEl.appendChild(empty);
        return;
      }
      column.forEach((card, index) => {
        const cardEl = document.createElement("button");
        cardEl.type = "button";
        cardEl.style.zIndex = String(index + 1);
        if (card.faceUp) {
          cardEl.className = "klondike-card";
          cardEl.textContent = klondikeCardLabel(card);
          const isSelected = !!(sel && sel.type === "column" && sel.col === c && index >= sel.index);
          cardEl.classList.toggle("klondike-card-selected", isSelected);
          cardEl.setAttribute("aria-label", klondikeCardLabel(card));
        } else {
          cardEl.className = "klondike-card klondike-card-back";
          cardEl.setAttribute("aria-label", t18nKlondike("klondike_aria_face_down"));
        }
        cardEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onKlondikeColumnClick(c, index);
        });
        colEl.appendChild(cardEl);
      });
    });
  }
  ensureKlondikeCardAspectRatio();
}

// Cards are 5:3 (width:height) - set in JS from the measured column width
// rather than CSS `aspect-ratio`, which some E-Ink browsers (Tolino
// confirmed) don't support reliably. Recomputed after every render and on
// resize.
let einkKlondikeResizeHandlerAttached = false;
let einkKlondikeResizeTimeoutId = null;

function ensureKlondikeCardAspectRatio() {
  const columnsEl = document.getElementById("klondike-columns");
  if (!columnsEl) return;
  const firstCol = columnsEl.querySelector(".klondike-column");
  if (!firstCol) return;
  const rect = firstCol.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const height = Math.round(rect.width * 0.6); // 5:3 width:height
  columnsEl.querySelectorAll(".klondike-card, .klondike-empty-slot").forEach((el) => {
    el.style.height = height + "px";
  });
  ensureKlondikeResizeHandler();
}

function ensureKlondikeResizeHandler() {
  if (einkKlondikeResizeHandlerAttached) return;
  einkKlondikeResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkKlondikeResizeTimeoutId !== null) clearTimeout(einkKlondikeResizeTimeoutId);
    einkKlondikeResizeTimeoutId = setTimeout(() => {
      einkKlondikeResizeTimeoutId = null;
      ensureKlondikeCardAspectRatio();
    }, 150);
  });
}

function updateGameLabelsKlondike() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateKlondike.moveCount ? t18nKlondike("klondike_move_label") + " " + AppStateKlondike.moveCount : "";
  updateUndoButtonVisibilityKlondike();

  if (AppStateKlondike.gameOver) clearSavedKlondikeGame();
  else saveKlondikeGame();
}

function updateUndoButtonVisibilityKlondike() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateKlondike.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateKlondike.gameOver));
}

document.addEventListener("DOMContentLoaded", initKlondikeApp);
