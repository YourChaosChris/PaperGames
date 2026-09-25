// spidersolitaire-app.js
// Wires SpiderSolitaireCore to the spidersolitaire.html UI. Solitaire,
// like Klondike/FreeCell here - no opponent, no AI, just a difficulty
// picker (how many suits are in play) chosen before "New game", the
// same way Kakuro/Mastermind offer a picker before starting.
//
// Cards show their rank and suit as plain text - the four suit glyphs
// (♠ ♥ ♦ ♣) are already shape-distinct from each other, so nothing
// here needs traditional red/black suit coloring to stay readable on a
// monochrome E-Ink display. Face-down tableau cards get a hatched
// back instead of a color, the same "structural, not color"
// convention used everywhere else in this app.
//
// Tap-to-select-source, tap-to-select-destination, exactly like
// Klondike/FreeCell: tap the exposed top card of a column (or the
// start of a valid same-suit descending run further up that column)
// to select it, then tap a tableau column to move it there. Clicking a
// different valid source while something is already selected just
// switches the selection, rather than requiring a deselect first. A
// dedicated "Deal" button deals the next batch of 10 cards from the
// stock (one face-up card onto each column), which the rules disallow
// while any column is empty.
//
// Card sizing: unlike Klondike/FreeCell's `.klondike-card`/`.freecell-
// card` (which lean on CSS `aspect-ratio`, unreliable on some E-Ink
// browsers), `.spider-card` gets its height set explicitly in JS from
// the measured column width - the same "JS-enforced aspect ratio"
// technique used for this app's square game boards (see
// ensureSpiderCardAspectRatio below) - recomputed on resize.

const SUIT_SYMBOL_SP = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANK_LABEL_SP = { 1: "A", 11: "J", 12: "Q", 13: "K" };

function spiderCardLabel(card) {
  const rank = RANK_LABEL_SP[card.rank] || String(card.rank);
  return rank + SUIT_SYMBOL_SP[card.suit];
}

function t18nSpider(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

const AppStateSpider = {
  state: null,
  selected: null, // { type: "column", col, index } | null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const SPIDER_SAVE_KEY = "einkchess_save_spidersolitaire";

function saveSpiderGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(SPIDER_SAVE_KEY, {
    state: AppStateSpider.state,
    moveCount: AppStateSpider.moveCount
  });
}

function clearSavedSpiderGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(SPIDER_SAVE_KEY);
}

function setStatusSpider(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultSpider(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultSpider(title, message) {
  setGameResultSpider(message);
  setStatusSpider("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackSpider() {
  AppStateSpider.undoStack = [];
}

function pushUndoSnapshotSpider() {
  AppStateSpider.undoStack.push({
    state: SpiderSolitaireCore.cloneState(AppStateSpider.state),
    moveCount: AppStateSpider.moveCount
  });
}

function initSpiderApp() {
  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const levelInline = document.getElementById("spidersolitaire-level-inline");
  const startGameBtn = document.getElementById("start-spidersolitaire-game");

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

  function startNewGameSpider(suitCount) {
    AppStateSpider.state = SpiderSolitaireCore.createInitialState(suitCount);
    AppStateSpider.selected = null;
    AppStateSpider.gameOver = false;
    AppStateSpider.moveCount = 0;
    resetUndoStackSpider();
    setGameResultSpider("");
    showBoardSectionSpider();
    buildSpiderBoardDOM();
    updateSpiderBoard();
    updateGameLabelsSpider();
    setStatusSpider("board-info", t18nSpider("spidersolitaire_hint_default"));
  }

  startGameBtn.addEventListener("click", () => {
    const suitCount = levelInline ? parseInt(levelInline.value, 10) : 2;
    startNewGameSpider(suitCount);
  });

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStateSpider.state) updateSpiderBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(SPIDER_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateSpider.state = savedGame.state;
    AppStateSpider.moveCount = savedGame.moveCount;
    AppStateSpider.selected = null;
    AppStateSpider.gameOver = false;
    resetUndoStackSpider();
    if (levelInline) levelInline.value = String(AppStateSpider.state.suitCount);
    setGameResultSpider("");
    showBoardSectionSpider();
    buildSpiderBoardDOM();
    updateSpiderBoard();
    updateGameLabelsSpider();
    setStatusSpider("board-info", t18nSpider("spidersolitaire_hint_default"));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player picks a difficulty and presses "New game".
}

function selectionsEqualSpider(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  return a.col === b.col && a.index === b.index;
}

function trySelectSourceSpider(col, index) {
  if (!SpiderSolitaireCore.isMovableSequenceStart(AppStateSpider.state, col, index)) return false;
  AppStateSpider.selected = { type: "column", col, index };
  return true;
}

function onSpiderColumnClick(colIndex, cardIndex) {
  if (AppStateSpider.gameOver || !AppStateSpider.state) return;
  const sel = AppStateSpider.selected;

  if (sel && typeof cardIndex === "number" && selectionsEqualSpider(sel, { type: "column", col: colIndex, index: cardIndex })) {
    AppStateSpider.selected = null;
    updateSpiderBoard();
    setStatusSpider("board-info", t18nSpider("spidersolitaire_hint_default"));
    return;
  }

  if (sel) {
    const count = AppStateSpider.state.tableau[sel.col].length - sel.index;
    const result = SpiderSolitaireCore.moveColumnToColumn(AppStateSpider.state, sel.col, count, colIndex);
    if (result.ok) {
      pushUndoSnapshotSpider();
      AppStateSpider.state = result.state;
      AppStateSpider.selected = null;
      AppStateSpider.moveCount++;
      finishSpiderAction(result.completedSuit ? [result.completedSuit] : []);
      return;
    }
  }

  // No selection, or the move above failed - try treating this click as
  // picking a new source instead (a single click can both fail a move
  // and immediately start a new one, so re-picking never needs a
  // separate deselect click first).
  if (typeof cardIndex === "number" && trySelectSourceSpider(colIndex, cardIndex)) {
    updateSpiderBoard();
    setStatusSpider("board-info", t18nSpider("spidersolitaire_hint_selected"));
  } else {
    setStatusSpider("board-info", sel ? t18nSpider("spidersolitaire_msg_cant_place") : t18nSpider("spidersolitaire_msg_cant_pick"));
  }
}

function onSpiderDealClick() {
  if (AppStateSpider.gameOver || !AppStateSpider.state) return;
  if (!SpiderSolitaireCore.canDealStock(AppStateSpider.state)) {
    setStatusSpider("board-info", AppStateSpider.state.stock.length === 0
      ? t18nSpider("spidersolitaire_msg_stock_empty")
      : t18nSpider("spidersolitaire_msg_needs_full_columns"));
    return;
  }
  const result = SpiderSolitaireCore.dealFromStock(AppStateSpider.state);
  if (!result.ok) {
    setStatusSpider("board-info", t18nSpider("spidersolitaire_msg_stock_empty"));
    return;
  }
  pushUndoSnapshotSpider();
  AppStateSpider.state = result.state;
  AppStateSpider.selected = null;
  AppStateSpider.moveCount++;
  finishSpiderAction(result.completedSuits || []);
}

function finishSpiderAction(completedSuits) {
  updateSpiderBoard();
  updateGameLabelsSpider();

  if (SpiderSolitaireCore.isWon(AppStateSpider.state)) {
    AppStateSpider.gameOver = true;
    announceGameResultSpider(t18nSpider("spidersolitaire_win_title"), t18nSpider("spidersolitaire_win_message"));
    updateGameLabelsSpider();
  } else if (completedSuits && completedSuits.length) {
    setStatusSpider("board-info", t18nSpider("spidersolitaire_msg_sequence_completed"));
  } else {
    setStatusSpider("board-info", t18nSpider("spidersolitaire_hint_default"));
  }
}

function undoLastMove() {
  if (!AppStateSpider.undoStack || !AppStateSpider.undoStack.length) return;
  const prev = AppStateSpider.undoStack.pop();
  AppStateSpider.state = prev.state;
  AppStateSpider.moveCount = prev.moveCount;
  AppStateSpider.selected = null;
  AppStateSpider.gameOver = false;
  setGameResultSpider("");
  updateSpiderBoard();
  updateGameLabelsSpider();
  setStatusSpider("board-info", t18nSpider("spidersolitaire_msg_undone"));
}

function showBoardSectionSpider() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering ***/

function buildSpiderBoardDOM() {
  const stockEl = document.getElementById("spider-stock");
  const sequencesEl = document.getElementById("spider-sequences");
  const columnsEl = document.getElementById("spider-columns");
  if (!stockEl || !sequencesEl || !columnsEl) return;

  stockEl.innerHTML = "";
  stockEl.addEventListener("click", onSpiderDealClick);

  columnsEl.innerHTML = "";
  for (let c = 0; c < SpiderSolitaireCore.COLUMN_COUNT; c++) {
    const col = document.createElement("div");
    col.className = "spider-column";
    col.dataset.col = c;
    col.addEventListener("click", () => onSpiderColumnClick(c, null));
    columnsEl.appendChild(col);
  }
}

function updateSpiderBoard() {
  const state = AppStateSpider.state;
  if (!state) return;
  const sel = AppStateSpider.selected;

  const stockEl = document.getElementById("spider-stock");
  if (stockEl) {
    const deals = SpiderSolitaireCore.remainingStockDeals(state);
    const canDeal = SpiderSolitaireCore.canDealStock(state);
    stockEl.className = "spider-cell spider-stock" + (state.stock.length > 0 ? " spider-card-back" : "");
    stockEl.textContent = state.stock.length > 0 ? String(deals) : "";
    stockEl.disabled = state.stock.length === 0;
    stockEl.classList.toggle("spider-stock-blocked", state.stock.length > 0 && !canDeal);
    stockEl.setAttribute("aria-label", t18nSpider("spidersolitaire_aria_stock") + ": " +
      (state.stock.length > 0 ? deals + " " + t18nSpider("spidersolitaire_aria_deals_left") : t18nSpider("spidersolitaire_aria_empty")));
  }

  const sequencesEl = document.getElementById("spider-sequences");
  if (sequencesEl) {
    sequencesEl.textContent = state.completed + " / " + SpiderSolitaireCore.TOTAL_SEQUENCES;
    sequencesEl.setAttribute("aria-label", t18nSpider("spidersolitaire_aria_sequences") + ": " + state.completed + " / " + SpiderSolitaireCore.TOTAL_SEQUENCES);
  }

  const columnsEl = document.getElementById("spider-columns");
  if (columnsEl) {
    columnsEl.querySelectorAll(".spider-column").forEach((colEl) => {
      const c = parseInt(colEl.dataset.col, 10);
      colEl.innerHTML = "";
      const column = state.tableau[c];
      if (!column.length) {
        const empty = document.createElement("span");
        empty.className = "spider-empty-slot";
        empty.setAttribute("aria-hidden", "true");
        colEl.appendChild(empty);
        return;
      }
      column.forEach((card, index) => {
        const cardEl = document.createElement("button");
        cardEl.type = "button";
        cardEl.style.zIndex = String(index + 1);
        if (card.faceUp) {
          cardEl.className = "spider-card";
          cardEl.textContent = spiderCardLabel(card);
          const isSelected = !!(sel && sel.col === c && index >= sel.index);
          cardEl.classList.toggle("spider-card-selected", isSelected);
          cardEl.setAttribute("aria-label", spiderCardLabel(card));
        } else {
          cardEl.className = "spider-card spider-card-back";
          cardEl.setAttribute("aria-label", t18nSpider("spidersolitaire_aria_face_down"));
        }
        cardEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onSpiderColumnClick(c, index);
        });
        colEl.appendChild(cardEl);
      });
    });
  }

  ensureSpiderCardAspectRatio();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(ensureSpiderCardAspectRatio);
  } else {
    setTimeout(ensureSpiderCardAspectRatio, 0);
  }
  ensureSpiderResizeHandler();
}

// Cards are 5:3 (width:height), same proportion as Klondike/FreeCell's
// cards, but set in JS from the measured column width rather than CSS
// `aspect-ratio`, which some E-Ink browsers (Tolino confirmed) don't
// support reliably. Recomputed after every render and on resize.
let einkSpiderResizeHandlerAttached = false;
let einkSpiderResizeTimeoutId = null;

function ensureSpiderCardAspectRatio() {
  const columnsEl = document.getElementById("spider-columns");
  if (!columnsEl) return;
  const firstCol = columnsEl.querySelector(".spider-column");
  if (!firstCol) return;
  const rect = firstCol.getBoundingClientRect();
  if (!rect || !rect.width) return;
  const height = Math.round(rect.width * 0.6); // 5:3 width:height
  columnsEl.querySelectorAll(".spider-card, .spider-empty-slot").forEach((el) => {
    el.style.height = height + "px";
  });
}

function ensureSpiderResizeHandler() {
  if (einkSpiderResizeHandlerAttached) return;
  einkSpiderResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkSpiderResizeTimeoutId !== null) clearTimeout(einkSpiderResizeTimeoutId);
    einkSpiderResizeTimeoutId = setTimeout(() => {
      einkSpiderResizeTimeoutId = null;
      ensureSpiderCardAspectRatio();
    }, 150);
  });
}

function updateGameLabelsSpider() {
  const meta = document.getElementById("game-meta");
  if (meta) meta.textContent = AppStateSpider.moveCount ? t18nSpider("spidersolitaire_move_label") + " " + AppStateSpider.moveCount : "";
  updateUndoButtonVisibilitySpider();

  if (AppStateSpider.gameOver) clearSavedSpiderGame();
  else saveSpiderGame();
}

function updateUndoButtonVisibilitySpider() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateSpider.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateSpider.gameOver));
}

document.addEventListener("DOMContentLoaded", initSpiderApp);
