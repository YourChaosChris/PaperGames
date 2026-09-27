// freecell-app.js
// Wires FreeCellCore to the freecell.html UI. Solitaire, like the other
// card/tile puzzles here - no opponent, no AI, no difficulty picker,
// since a FreeCell deal is just a fresh random shuffle each time (see
// freecell-core.js for why that's fine here unlike Mahjong's deal).
//
// Cards show their rank as text and their suit as a small SVG from
// card-faces.js: red suits (hearts, diamonds) hollow, black suits
// (spades, clubs) filled. The alternating red/black stacking rule needs
// the colour, and on a monochrome E-Ink display it can't be shown as
// colour - the suit shapes alone proved too hard to tell apart at card
// size - so the fill carries it instead.
//
// Click a free cell card or a tableau card (the exposed bottom card of
// a column, or the start of a valid same-suit-alternating run further
// up) to select it, then click a column, an empty free cell, or a
// foundation pile to move it there. Clicking a different valid source
// while something is already selected just switches the selection,
// rather than requiring a deselect first.

const SUIT_SYMBOL = CardFaces.SYMBOL;

function freecellCardLabel(card) {
  return CardFaces.label(card);
}

const AppStateFreeCell = {
  state: null,
  selected: null, // { type: "column", col, index } | { type: "freecell", index } | null
  gameOver: false,
  moveCount: 0,
  undoStack: []
};

const FREECELL_SAVE_KEY = "einkchess_save_freecell";

function saveFreeCellGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.save(FREECELL_SAVE_KEY, {
    state: AppStateFreeCell.state,
    moveCount: AppStateFreeCell.moveCount
  });
}

function clearSavedFreeCellGame() {
  if (typeof GameStorage === "undefined") return;
  GameStorage.clear(FREECELL_SAVE_KEY);
}

function recordFreeCellStats(outcome) {
  if (typeof GameStats === "undefined") return;
  GameStats.record("freecell", outcome);
}

function setStatusFreeCell(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) I18n.setMsg(el, text || "");
}

function setGameResultFreeCell(text) {
  const el = document.getElementById("game-result");
  if (el) I18n.setMsg(el, text || "");
  if (!text && window.ResultModal) {
    window.ResultModal.hide();
  }
}

function announceGameResultFreeCell(title, message) {
  setGameResultFreeCell(message);
  setStatusFreeCell("board-info", message);
  if (window.ResultModal) {
    window.ResultModal.show(title, message);
  }
}

function resetUndoStackFreeCell() {
  AppStateFreeCell.undoStack = [];
}

function pushUndoSnapshotFreeCell() {
  AppStateFreeCell.undoStack.push({
    state: FreeCellCore.cloneState(AppStateFreeCell.state),
    moveCount: AppStateFreeCell.moveCount
  });
}

function initFreeCellApp() {
  const menuToggle = document.getElementById("menu-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const startGameBtn = document.getElementById("start-freecell-game");
  const collectBtn = document.getElementById("freecell-collect-button");

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

  function startNewGameFreeCell() {
    AppStateFreeCell.state = FreeCellCore.createInitialState();
    AppStateFreeCell.selected = null;
    AppStateFreeCell.gameOver = false;
    AppStateFreeCell.moveCount = 0;
    resetUndoStackFreeCell();
    setGameResultFreeCell("");
    showBoardSectionFreeCell();
    buildFreeCellBoardDOM();
    updateFreeCellBoard();
    updateGameLabelsFreeCell();
    setStatusFreeCell("board-info", "Click a card, then click where to move it.");
  }

  startGameBtn.addEventListener("click", startNewGameFreeCell);

  if (collectBtn) {
    collectBtn.addEventListener("click", () => {
      if (!AppStateFreeCell.state || AppStateFreeCell.gameOver) return;
      pushUndoSnapshotFreeCell();
      let state = AppStateFreeCell.state;
      let moved = 0;
      let more = true;
      while (more) {
        more = false;
        const moves = FreeCellCore.getFoundationMoves(state);
        if (!moves.length) break;
        const m = moves[0];
        const result = m.source === "column"
          ? FreeCellCore.moveColumnToFoundation(state, m.index)
          : FreeCellCore.moveFreeCellToFoundation(state, m.index);
        if (result.ok) { state = result.state; moved++; more = true; }
      }
      if (moved === 0) {
        AppStateFreeCell.undoStack.pop(); // nothing actually happened - drop the no-op snapshot
        setStatusFreeCell("board-info", "No cards can go to a foundation right now.");
        return;
      }
      AppStateFreeCell.state = state;
      AppStateFreeCell.selected = null;
      AppStateFreeCell.moveCount += moved;
      finishFreeCellAction();
    });
  }

  const savedGame = typeof GameStorage !== "undefined" ? GameStorage.load(FREECELL_SAVE_KEY) : null;
  if (savedGame && savedGame.state) {
    AppStateFreeCell.state = savedGame.state;
    AppStateFreeCell.moveCount = savedGame.moveCount;
    AppStateFreeCell.selected = null;
    AppStateFreeCell.gameOver = false;
    resetUndoStackFreeCell();
    setGameResultFreeCell("");
    showBoardSectionFreeCell();
    buildFreeCellBoardDOM();
    updateFreeCellBoard();
    updateGameLabelsFreeCell();
    setStatusFreeCell("board-info", "Click a card, then click where to move it.");
  }
  // Otherwise no board is pre-built: the placeholder shows until the
  // player presses "New game".
}

function selectionsEqual(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "column") return a.col === b.col && a.index === b.index;
  return a.index === b.index;
}

function trySelectSource(type, col, index) {
  if (type === "column") {
    if (!FreeCellCore.isMovableSequenceStart(AppStateFreeCell.state, col, index)) return false;
    AppStateFreeCell.selected = { type: "column", col, index };
    return true;
  }
  AppStateFreeCell.selected = { type: "freecell", index: col };
  return true;
}

function onFreeCellColumnCardClick(colIndex, cardIndex) {
  if (AppStateFreeCell.gameOver || !AppStateFreeCell.state) return;
  const sel = AppStateFreeCell.selected;

  // cardIndex is null when the column itself was clicked (an empty
  // column, the only place not covered by a card).
  if (sel && sel.type === "column" && typeof cardIndex === "number" &&
      selectionsEqual(sel, { type: "column", col: colIndex, index: cardIndex })) {
    AppStateFreeCell.selected = null;
    updateFreeCellBoard();
    setStatusFreeCell("board-info", "Click a card, then click where to move it.");
    return;
  }

  if (sel) {
    const count = sel.type === "column" ? AppStateFreeCell.state.columns[sel.col].length - sel.index : 1;
    const result = sel.type === "column"
      ? FreeCellCore.moveColumnToColumn(AppStateFreeCell.state, sel.col, count, colIndex)
      : FreeCellCore.moveFreeCellToColumn(AppStateFreeCell.state, sel.index, colIndex);
    if (result.ok) {
      pushUndoSnapshotFreeCell();
      AppStateFreeCell.state = result.state;
      AppStateFreeCell.selected = null;
      AppStateFreeCell.moveCount++;
      finishFreeCellAction();
      return;
    }
  }

  // No selection, or the move above failed - try treating this click as
  // picking a new source instead (a single click can both fail a move
  // and immediately start a new one, so re-picking never needs a
  // separate deselect click first).
  if (typeof cardIndex === "number" && trySelectSource("column", colIndex, cardIndex)) {
    updateFreeCellBoard();
    setStatusFreeCell("board-info", "Now click where to move it.");
  } else if (typeof cardIndex === "number") {
    setStatusFreeCell("board-info", "That card can't be picked up right now.");
  } else {
    setStatusFreeCell("board-info", sel ? "That card can't go there." : "Click a card, then click where to move it.");
  }
}

function onFreeCellCellClick(cellIndex) {
  if (AppStateFreeCell.gameOver || !AppStateFreeCell.state) return;
  const sel = AppStateFreeCell.selected;
  const card = AppStateFreeCell.state.freeCells[cellIndex];

  if (sel && sel.type === "freecell" && sel.index === cellIndex) {
    AppStateFreeCell.selected = null;
    updateFreeCellBoard();
    setStatusFreeCell("board-info", "Click a card, then click where to move it.");
    return;
  }

  if (sel && !card) {
    const count = sel.type === "column" ? AppStateFreeCell.state.columns[sel.col].length - sel.index : 1;
    if (count === 1) {
      const result = sel.type === "column"
        ? FreeCellCore.moveColumnToFreeCell(AppStateFreeCell.state, sel.col, cellIndex)
        : { ok: false }; // free cell to free cell isn't a real move
      if (result.ok) {
        pushUndoSnapshotFreeCell();
        AppStateFreeCell.state = result.state;
        AppStateFreeCell.selected = null;
        AppStateFreeCell.moveCount++;
        finishFreeCellAction();
        return;
      }
    }
  }

  if (card) {
    AppStateFreeCell.selected = { type: "freecell", index: cellIndex };
    updateFreeCellBoard();
    setStatusFreeCell("board-info", "Now click where to move it.");
  } else {
    setStatusFreeCell("board-info", "Nothing to move there yet.");
  }
}

function onFreeCellFoundationClick(suit) {
  if (AppStateFreeCell.gameOver || !AppStateFreeCell.state) return;
  const sel = AppStateFreeCell.selected;
  if (!sel) return;

  const card = sel.type === "column"
    ? AppStateFreeCell.state.columns[sel.col][sel.index]
    : AppStateFreeCell.state.freeCells[sel.index];
  const count = sel.type === "column" ? AppStateFreeCell.state.columns[sel.col].length - sel.index : 1;
  if (!card || card.suit !== suit || count !== 1) {
    setStatusFreeCell("board-info", "That card can't go there.");
    return;
  }

  const result = sel.type === "column"
    ? FreeCellCore.moveColumnToFoundation(AppStateFreeCell.state, sel.col)
    : FreeCellCore.moveFreeCellToFoundation(AppStateFreeCell.state, sel.index);
  if (result.ok) {
    pushUndoSnapshotFreeCell();
    AppStateFreeCell.state = result.state;
    AppStateFreeCell.selected = null;
    AppStateFreeCell.moveCount++;
    finishFreeCellAction();
  } else {
    setStatusFreeCell("board-info", "That card can't go there yet.");
  }
}

function finishFreeCellAction() {
  updateFreeCellBoard();
  updateGameLabelsFreeCell();

  if (FreeCellCore.isWon(AppStateFreeCell.state)) {
    AppStateFreeCell.gameOver = true;
    announceGameResultFreeCell("Cleared!", "All four foundations complete - well done!");
    recordFreeCellStats("win");
    updateGameLabelsFreeCell();
  } else {
    setStatusFreeCell("board-info", "Click a card, then click where to move it.");
  }
}

function undoLastMove() {
  if (!AppStateFreeCell.undoStack || !AppStateFreeCell.undoStack.length) return;
  const prev = AppStateFreeCell.undoStack.pop();
  AppStateFreeCell.state = prev.state;
  AppStateFreeCell.moveCount = prev.moveCount;
  AppStateFreeCell.selected = null;
  AppStateFreeCell.gameOver = false;
  setGameResultFreeCell("");
  updateFreeCellBoard();
  updateGameLabelsFreeCell();
  setStatusFreeCell("board-info", "Move undone.");
}

function showBoardSectionFreeCell() {
  const section = document.getElementById("board-section");
  if (section) section.classList.remove("hidden");
  const placeholder = document.getElementById("board-placeholder");
  const boardContainer = document.getElementById("board-container");
  if (placeholder) placeholder.classList.add("hidden");
  if (boardContainer) boardContainer.classList.remove("hidden");
}

/*** Board rendering ***/

function buildFreeCellBoardDOM() {
  const freeCellsEl = document.getElementById("freecell-freecells");
  const foundationsEl = document.getElementById("freecell-foundations");
  const columnsEl = document.getElementById("freecell-columns");
  if (!freeCellsEl || !foundationsEl || !columnsEl) return;

  freeCellsEl.innerHTML = "";
  for (let i = 0; i < FreeCellCore.FREE_CELL_COUNT; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "freecell-cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => onFreeCellCellClick(i));
    freeCellsEl.appendChild(cell);
  }

  foundationsEl.innerHTML = "";
  FreeCellCore.SUITS.forEach((suit) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "freecell-cell freecell-foundation";
    cell.dataset.suit = suit;
    cell.addEventListener("click", () => onFreeCellFoundationClick(suit));
    foundationsEl.appendChild(cell);
  });

  columnsEl.innerHTML = "";
  for (let c = 0; c < FreeCellCore.COLUMN_COUNT; c++) {
    const col = document.createElement("div");
    col.className = "freecell-column";
    col.dataset.col = c;
    col.addEventListener("click", () => onFreeCellColumnCardClick(c, null));
    columnsEl.appendChild(col);
  }
}

function updateFreeCellBoard() {
  const state = AppStateFreeCell.state;
  if (!state) return;
  const sel = AppStateFreeCell.selected;

  const freeCellsEl = document.getElementById("freecell-freecells");
  if (freeCellsEl) {
    freeCellsEl.querySelectorAll(".freecell-cell").forEach((cell) => {
      const i = parseInt(cell.dataset.index, 10);
      const card = state.freeCells[i];
      if (card) CardFaces.render(cell, card);
      else cell.textContent = "";
      cell.classList.toggle("freecell-cell-selected", !!(sel && sel.type === "freecell" && sel.index === i));
      I18n.setAria(cell, "Free cell " + (i + 1) + (card ? ", " + freecellCardLabel(card) : ", empty"));
    });
  }

  const foundationsEl = document.getElementById("freecell-foundations");
  if (foundationsEl) {
    foundationsEl.querySelectorAll(".freecell-foundation").forEach((cell) => {
      const suit = cell.dataset.suit;
      const rank = state.foundations[suit];
      if (rank) CardFaces.render(cell, { rank, suit });
      else CardFaces.renderSuit(cell, suit);
      cell.classList.toggle("freecell-foundation-empty", rank === 0);
      I18n.setAria(cell, "Foundation " + SUIT_SYMBOL[suit] + (rank ? ", up to " + freecellCardLabel({ rank, suit }) : ", empty"));
    });
  }

  const columnsEl = document.getElementById("freecell-columns");
  if (columnsEl) {
    columnsEl.querySelectorAll(".freecell-column").forEach((colEl) => {
      const c = parseInt(colEl.dataset.col, 10);
      colEl.innerHTML = "";
      state.columns[c].forEach((card, index) => {
        const cardEl = document.createElement("button");
        cardEl.type = "button";
        cardEl.className = "freecell-card";
        CardFaces.render(cardEl, card);
        cardEl.style.zIndex = String(index + 1);
        const isSelected = !!(sel && sel.type === "column" && sel.col === c && index >= sel.index);
        cardEl.classList.toggle("freecell-card-selected", isSelected);
        cardEl.addEventListener("click", (e) => {
          e.stopPropagation(); // not also the column's own click handler
          onFreeCellColumnCardClick(c, index);
        });
        colEl.appendChild(cardEl);
      });
    });
  }
  ensureFreeCellCardAspectRatio();
}

// Card height and overlap come from CardFaces.layoutColumns (card-faces.js),
// recomputed after every render and on resize.
let einkFreeCellResizeHandlerAttached = false;
let einkFreeCellResizeTimeoutId = null;

function ensureFreeCellCardAspectRatio() {
  const columnsEl = document.getElementById("freecell-columns");
  if (!CardFaces.layoutColumns(columnsEl, ".freecell-column", ".freecell-card")) return;
  ensureFreeCellResizeHandler();
}

function ensureFreeCellResizeHandler() {
  if (einkFreeCellResizeHandlerAttached) return;
  einkFreeCellResizeHandlerAttached = true;
  window.addEventListener("resize", () => {
    if (einkFreeCellResizeTimeoutId !== null) clearTimeout(einkFreeCellResizeTimeoutId);
    einkFreeCellResizeTimeoutId = setTimeout(() => {
      einkFreeCellResizeTimeoutId = null;
      ensureFreeCellCardAspectRatio();
    }, 150);
  });
}

function updateGameLabelsFreeCell() {
  const meta = document.getElementById("game-meta");
  if (meta) I18n.setMsg(meta, AppStateFreeCell.moveCount ? "Move " + AppStateFreeCell.moveCount : "");
  updateUndoButtonVisibilityFreeCell();

  if (AppStateFreeCell.gameOver) clearSavedFreeCellGame();
  else saveFreeCellGame();
}

function updateUndoButtonVisibilityFreeCell() {
  const btn = document.getElementById("undo-btn");
  if (!btn) return;
  const hasUndo = (AppStateFreeCell.undoStack || []).length > 0;
  btn.classList.toggle("hidden", !(hasUndo && !AppStateFreeCell.gameOver));
}

document.addEventListener("DOMContentLoaded", initFreeCellApp);
