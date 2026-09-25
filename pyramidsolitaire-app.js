// pyramidsolitaire-app.js
// Wires PyramidSolitaireCore to the pyramidsolitaire.html UI. Solitaire,
// like the other card puzzles here - no opponent, no AI, no difficulty
// picker, since a Pyramid deal is just a fresh random shuffle each time.
//
// Cards show their rank and suit as plain text - the four suit glyphs
// (♠ ♥ ♦ ♣) are already shape-distinct from each other, so nothing
// here needs the traditional red/black suit coloring to stay readable
// on a monochrome E-Ink display, matching Klondike/FreeCell.
//
// All 28 pyramid cards are visible face-up from the start (the
// standard rule for this game); a covered card just gets a dimmed,
// non-interactive look until both cards below it are gone. Click any
// one exposed card (pyramid or the waste's top card) to select it,
// then click a second exposed card to remove the pair if the two
// ranks sum to 13 - or click a single exposed King to remove it right
// away, no partner needed. Clicking a different valid card while one
// is already selected just switches the selection, rather than
// requiring a deselect first.
//
// The pyramid triangle is laid out with absolute positioning: each
// card's left/top/width/height is computed in pixels from the board's
// measured width (see layoutPyramidBoard), the same "measure, then set
// an explicit pixel size" approach used by Mahjong Solitaire's layered
// board, since CSS aspect-ratio isn't available on the older E-Ink
// browsers this app targets. Lower rows get a higher z-index so they
// visually sit in front, overlapping the row above - matching how a
// real card pyramid looks.

const SUIT_SYMBOL_PY = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RANK_LABEL_PY = { 1: "A", 11: "J", 12: "Q", 13: "K" };

function pyramidCardLabel(card) {
  const rank = RANK_LABEL_PY[card.rank] || String(card.rank);
  return rank + SUIT_SYMBOL_PY[card.suit];
}

function t18nPyramid(key) {
  return (typeof I18n !== "undefined") ? I18n.t(key) : key;
}

const AppStatePyramid = {
  state: null,
  selected: null, // { type: "pyramid", row, col } | { type: "waste" } | null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const PYRAMIDSOLITAIRE_SAVE_KEY = "einkchess_save_pyramidsolitaire";

function savePyramidGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(PYRAMIDSOLITAIRE_SAVE_KEY, {
    state: AppStatePyramid.state,
    moveCount: AppStatePyramid.moveCount
  });
}

function clearSavedPyramidGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(PYRAMIDSOLITAIRE_SAVE_KEY);
}

function recordPyramidStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("pyramidsolitaire", outcome);
}

function setStatusPyramid(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultPyramid(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultPyramid(title, message) {
  setGameResultPyramid(message);
  setStatusPyramid("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackPyramid() {
  AppStatePyramid.undoStack = [];
}

function pushUndoSnapshotPyramid() {
  AppStatePyramid.undoStack.push({
    state: PyramidSolitaireCore.cloneState(AppStatePyramid.state),
    moveCount: AppStatePyramid.moveCount
  });
}

function initPyramidApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-pyramidsolitaire-game");

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

  function startNewGamePyramid() {
    AppStatePyramid.state = PyramidSolitaireCore.createInitialState();
    AppStatePyramid.selected = null;
    AppStatePyramid.gameOver = false;
    AppStatePyramid.moveCount = 0;
    resetUndoStackPyramid();
    setGameResultPyramid("");
    showBoardSectionPyramid();
    buildPyramidBoardDOM();
    updatePyramidBoard();
    updateGameLabelsPyramid();
    setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_hint_default"));
  }

  startGameBtn.addEventListener("click", startNewGamePyramid);

  if (typeof I18n !== "undefined") {
    I18n.onChange(() => {
      if (AppStatePyramid.state) updatePyramidBoard();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(PYRAMIDSOLITAIRE_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStatePyramid.state = savedGame.state;
    AppStatePyramid.moveCount = savedGame.moveCount;
    AppStatePyramid.selected = null;
    AppStatePyramid.gameOver = false;
    resetUndoStackPyramid();
    setGameResultPyramid("");
    showBoardSectionPyramid();
    buildPyramidBoardDOM();
    updatePyramidBoard();
    updateGameLabelsPyramid();
    setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_hint_default"));
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".

  if (typeof BoardA11y !== "undefined") BoardA11y.enableArrowNav("#board-container");
}

function locationsEqualPyramid(a, b) {
  return PyramidSolitaireCore.locationsEqual(a, b);
}

// Attempts to handle a click on an already-playable location: removes
// a lone King right away, otherwise starts (or switches) a selection
// waiting for a second card. Returns true once the click was handled
// one way or another (selection made/switched, or a King removed).
function tryPickLocation(loc) {
  const card = PyramidSolitaireCore.cardAt(AppStatePyramid.state, loc);
  if (card && card.rank === 13) {
    const result = PyramidSolitaireCore.removeSingleKing(AppStatePyramid.state, loc);
    if (result.ok) {
      pushUndoSnapshotPyramid();
      AppStatePyramid.state = result.state;
      AppStatePyramid.selected = null;
      AppStatePyramid.moveCount++;
      finishPyramidAction(t18nPyramid("pyramidsolitaire_msg_king_removed"));
      return true;
    }
  }
  AppStatePyramid.selected = loc;
  updatePyramidBoard();
  setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_hint_selected"));
  return true;
}

function onPyramidLocationClick(loc) {
  if (AppStatePyramid.gameOver || !AppStatePyramid.state) return;
  const state = AppStatePyramid.state;
  if (!PyramidSolitaireCore.isLocationPlayable(state, loc)) {
    setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_msg_covered"));
    return;
  }

  const sel = AppStatePyramid.selected;

  if (sel && locationsEqualPyramid(sel, loc)) {
    AppStatePyramid.selected = null;
    updatePyramidBoard();
    setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_hint_default"));
    return;
  }

  if (sel) {
    const result = PyramidSolitaireCore.removePair(state, sel, loc);
    if (result.ok) {
      pushUndoSnapshotPyramid();
      AppStatePyramid.state = result.state;
      AppStatePyramid.selected = null;
      AppStatePyramid.moveCount++;
      finishPyramidAction(t18nPyramid("pyramidsolitaire_msg_pair_removed"));
      return;
    }
  }

  // No selection yet, or the pairing above failed - treat this click as
  // picking a (possibly new) source instead, so re-picking never needs
  // a separate deselect click first.
  tryPickLocation(loc);
}

function onPyramidStockClick() {
  if (AppStatePyramid.gameOver || !AppStatePyramid.state) return;
  const result = PyramidSolitaireCore.drawFromStock(AppStatePyramid.state);
  if (!result.ok) {
    setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_msg_stock_empty"));
    return;
  }
  pushUndoSnapshotPyramid();
  AppStatePyramid.state = result.state;
  AppStatePyramid.selected = null;
  AppStatePyramid.moveCount++;
  updatePyramidBoard();
  updateGameLabelsPyramid();

  if (PyramidSolitaireCore.isLost(AppStatePyramid.state)) {
    AppStatePyramid.gameOver = true;
    announceGameResultPyramid(t18nPyramid("pyramidsolitaire_lose_title"), t18nPyramid("pyramidsolitaire_lose_message"));
    recordPyramidStats("loss");
    updateGameLabelsPyramid();
    return;
  }

  setStatusPyramid("board-info", result.recycled
    ? t18nPyramid("pyramidsolitaire_msg_recycled")
    : t18nPyramid("pyramidsolitaire_hint_default"));
}

function finishPyramidAction(message) {
  updatePyramidBoard();
  updateGameLabelsPyramid();

  if (PyramidSolitaireCore.isWon(AppStatePyramid.state)) {
    AppStatePyramid.gameOver = true;
    announceGameResultPyramid(t18nPyramid("pyramidsolitaire_win_title"), t18nPyramid("pyramidsolitaire_win_message"));
    recordPyramidStats("win");
    updateGameLabelsPyramid();
    return;
  }

  if (PyramidSolitaireCore.isLost(AppStatePyramid.state)) {
    AppStatePyramid.gameOver = true;
    announceGameResultPyramid(t18nPyramid("pyramidsolitaire_lose_title"), t18nPyramid("pyramidsolitaire_lose_message"));
    recordPyramidStats("loss");
    updateGameLabelsPyramid();
    return;
  }

  setStatusPyramid("board-info", message || t18nPyramid("pyramidsolitaire_hint_default"));
}

function undoLastMove() {
  if (!AppStatePyramid.undoStack || !AppStatePyramid.undoStack.length) return;
  const prev = AppStatePyramid.undoStack.pop();
  AppStatePyramid.state = prev.state;
  AppStatePyramid.moveCount = prev.moveCount;
  AppStatePyramid.selected = null;
  AppStatePyramid.gameOver = false;
  setGameResultPyramid("");
  updatePyramidBoard();
  updateGameLabelsPyramid();
  setStatusPyramid("board-info", t18nPyramid("pyramidsolitaire_msg_undone"));
}

function showBoardSectionPyramid() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering ***/
// The pyramid is laid out with absolute positioning: card sizes/offsets
// are computed in pixels from the board's measured width rather than
// via CSS aspect-ratio (unsupported on the older E-Ink browsers this
// targets), the same approach as Mahjong Solitaire's layered board.

const PYRAMID_CARD_ASPECT = 0.66; // card height as a fraction of its width
const PYRAMID_ROW_STEP_FRACTION = 0.56; // vertical offset between rows, as a fraction of card height

function buildPyramidBoardDOM() {
  const boardEl = document.getElementById("pyramidsolitaire-board");
  const stockEl = document.getElementById("pyramidsolitaire-stock");
  const wasteEl = document.getElementById("pyramidsolitaire-waste");
  if (!boardEl || !stockEl || !wasteEl) return;

  stockEl.innerHTML = "";
  stockEl.addEventListener("click", onPyramidStockClick);

  wasteEl.innerHTML = "";
  wasteEl.addEventListener("click", () => onPyramidLocationClick({ type: "waste" }));

  boardEl.innerHTML = "";
  for (let row = 0; row < PyramidSolitaireCore.ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pyramidsolitaire-card";
      btn.dataset.row = row;
      btn.dataset.col = col;
      btn.addEventListener("click", () => onPyramidLocationClick({ type: "pyramid", row, col }));
      boardEl.appendChild(btn);
    }
  }

  layoutPyramidBoard();
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(layoutPyramidBoard);
  } else {
    setTimeout(layoutPyramidBoard, 0);
  }
  ensurePyramidResizeHandler();
}

function layoutPyramidBoard() {
  const boardEl = document.getElementById("pyramidsolitaire-board");
  if (!boardEl) return;
  const rect = boardEl.getBoundingClientRect();
  if (!rect || !rect.width) return;

  const cols = PyramidSolitaireCore.ROWS;
  const cardW = rect.width / cols;
  const cardH = cardW * PYRAMID_CARD_ASPECT;
  const rowStep = cardH * PYRAMID_ROW_STEP_FRACTION;
  const totalHeight = rowStep * (PyramidSolitaireCore.ROWS - 1) + cardH;
  boardEl.style.height = totalHeight + "px";

  boardEl.querySelectorAll(".pyramidsolitaire-card").forEach((btn) => {
    const row = parseInt(btn.dataset.row, 10);
    const col = parseInt(btn.dataset.col, 10);
    const cardsInRow = row + 1;
    const leftUnits = (cols - cardsInRow) / 2 + col;
    btn.style.left = (leftUnits * cardW) + "px";
    btn.style.top = (row * rowStep) + "px";
    btn.style.width = cardW + "px";
    btn.style.height = cardH + "px";
    btn.style.zIndex = String(row + 1); // lower rows sit in front, matching a real card pyramid
  });
}

let einkPyramidResizeHandlerAttached = false;
let einkPyramidResizeTimeoutId = null;

function ensurePyramidResizeHandler() {
  if (einkPyramidResizeHandlerAttached) return;
  einkPyramidResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkPyramidResizeTimeoutId !== null) clearTimeout(einkPyramidResizeTimeoutId);
    einkPyramidResizeTimeoutId = setTimeout(() => {
      einkPyramidResizeTimeoutId = null;
      layoutPyramidBoard();
    }, 150);
  });
}

function updatePyramidBoard() {
  const state = AppStatePyramid.state;
  if (!state) return;
  const sel = AppStatePyramid.selected;

  const boardEl = document.getElementById("pyramidsolitaire-board");
  if (boardEl) {
    boardEl.querySelectorAll(".pyramidsolitaire-card").forEach((btn) => {
      const row = parseInt(btn.dataset.row, 10);
      const col = parseInt(btn.dataset.col, 10);
      const card = state.pyramid[row][col];
      if (!card) {
        btn.className = "pyramidsolitaire-card pyramidsolitaire-card-gone";
        btn.textContent = "";
        btn.disabled = true;
        btn.setAttribute("aria-hidden", "true");
        return;
      }

      const exposed = PyramidSolitaireCore.isExposed(state.pyramid, row, col);
      btn.className = "pyramidsolitaire-card" + (exposed ? "" : " pyramidsolitaire-card-covered");
      btn.textContent = pyramidCardLabel(card);
      btn.disabled = !exposed;
      btn.removeAttribute("aria-hidden");
      const isSelected = !!(sel && sel.type === "pyramid" && sel.row === row && sel.col === col);
      btn.classList.toggle("pyramidsolitaire-card-selected", isSelected);
      btn.setAttribute("aria-label", pyramidCardLabel(card) + (exposed
        ? ""
        : ", " + t18nPyramid("pyramidsolitaire_aria_covered")));
    });
  }

  const stockEl = document.getElementById("pyramidsolitaire-stock");
  if (stockEl) {
    const hasStock = state.stock.length > 0;
    const hasWaste = state.waste.length > 0;
    const canRedeal = !hasStock && hasWaste && state.redealsLeft > 0;
    stockEl.className = "pyramidsolitaire-cell pyramidsolitaire-stock" + (hasStock ? " pyramidsolitaire-card-back" : "");
    stockEl.textContent = hasStock ? "" : (canRedeal ? "↺" : "");
    stockEl.disabled = !hasStock && !canRedeal;
    stockEl.setAttribute("aria-label", hasStock
      ? t18nPyramid("pyramidsolitaire_aria_stock") + ": " + state.stock.length
      : (canRedeal
        ? t18nPyramid("pyramidsolitaire_aria_stock") + " " + t18nPyramid("pyramidsolitaire_aria_empty") + ", " + t18nPyramid("pyramidsolitaire_aria_tap_redeal")
        : t18nPyramid("pyramidsolitaire_aria_stock") + " " + t18nPyramid("pyramidsolitaire_aria_empty")));
  }

  const wasteEl = document.getElementById("pyramidsolitaire-waste");
  if (wasteEl) {
    const top = PyramidSolitaireCore.topOfWaste(state);
    wasteEl.className = "pyramidsolitaire-cell pyramidsolitaire-waste" + (sel && sel.type === "waste" ? " pyramidsolitaire-card-selected" : "");
    wasteEl.textContent = top ? pyramidCardLabel(top) : "";
    wasteEl.disabled = !top;
    wasteEl.setAttribute("aria-label", t18nPyramid("pyramidsolitaire_aria_waste") + ", " + (top ? pyramidCardLabel(top) : t18nPyramid("pyramidsolitaire_aria_empty")));
  }

  const redealEl = document.getElementById("pyramidsolitaire-redeal-info");
  if (redealEl) {
    redealEl.textContent = t18nPyramid("pyramidsolitaire_redeals_label") + ": " + state.redealsLeft;
  }
}

function updateGameLabelsPyramid() {
  const meta = document.getElementById("game-meta");
  if (meta && AppStatePyramid.state) {
    const remaining = AppStatePyramid.state.pyramid.reduce((sum, row) => sum + row.filter((c) => !!c).length, 0);
    meta.textContent = t18nPyramid("pyramidsolitaire_remaining_label") + ": " + remaining;
  }
  updateUndoButtonVisibilityPyramid();

  if (AppStatePyramid.gameOver) clearSavedPyramidGame();
  else savePyramidGame();
}

function updateUndoButtonVisibilityPyramid() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStatePyramid.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStatePyramid.gameOver));
}

document.addEventListener("DOMContentLoaded", initPyramidApp);
