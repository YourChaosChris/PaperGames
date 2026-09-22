// freecell-core.js
// Dependency-free FreeCell engine. No DOM/UI here, same separation of
// concerns as every other <game>-core.js - just no opponent, since
// FreeCell (like the other card/tile puzzles here) is solitaire.
//
// Unlike Mahjong Solitaire's deal, this one is a plain random shuffle
// rather than a deal built backward to guarantee a solution - the
// overwhelming majority of FreeCell deals (all but a handful out of
// millions, including the original Microsoft FreeCell's famously
// unsolvable #11982) are solvable, so, exactly like the real game,
// PaperGames doesn't try to rule out that rare exception.
//
// A card is { rank, suit } - rank 1-13 (Ace-King), suit one of
// "S","H","D","C". State: 8 tableau columns, 4 free cells (each holds
// at most one card), and 4 foundations (one per suit, tracking the
// highest rank placed so far - 0 means empty).

const FreeCellCore = (function () {
  const SUITS = ["S", "H", "D", "C"];
  const COLUMN_COUNT = 8;
  const FREE_CELL_COUNT = 4;

  function isRed(card) {
    return card.suit === "H" || card.suit === "D";
  }

  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => {
      for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit });
    });
    return deck;
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function createInitialState(rng) {
    const deck = shuffle(createDeck(), rng);
    const columns = [];
    for (let c = 0; c < COLUMN_COUNT; c++) columns.push([]);
    deck.forEach((card, i) => columns[i % COLUMN_COUNT].push(card));
    return {
      columns,
      freeCells: new Array(FREE_CELL_COUNT).fill(null),
      foundations: { S: 0, H: 0, D: 0, C: 0 }
    };
  }

  function cloneState(state) {
    return {
      columns: state.columns.map((col) => col.slice()),
      freeCells: state.freeCells.slice(),
      foundations: Object.assign({}, state.foundations)
    };
  }

  // How many cards, counting from the bottom of `column` upward, form
  // a single valid alternating-color descending run - the longest
  // suffix a player could pick up as one group. A lone bottom card
  // always counts as a (length-1) run.
  function movableSequenceLength(column) {
    if (!column.length) return 0;
    let len = 1;
    for (let i = column.length - 1; i > 0; i--) {
      const upper = column[i - 1];
      const lower = column[i];
      if (upper.rank === lower.rank + 1 && isRed(upper) !== isRed(lower)) len++;
      else break;
    }
    return len;
  }

  // Whether the cards at column[cardIndex..end] form a movable
  // sequence on their own (a prerequisite for picking up more than
  // just the single bottom card).
  function isMovableSequenceStart(state, colIndex, cardIndex) {
    const column = state.columns[colIndex];
    if (cardIndex < 0 || cardIndex >= column.length) return false;
    const runLen = movableSequenceLength(column);
    return cardIndex >= column.length - runLen;
  }

  function countEmptyFreeCells(state) {
    return state.freeCells.filter((c) => c === null).length;
  }

  function countEmptyColumns(state, excludeColIndex) {
    let count = 0;
    state.columns.forEach((col, i) => {
      if (i === excludeColIndex) return;
      if (col.length === 0) count++;
    });
    return count;
  }

  // The classic FreeCell "supermove" capacity formula: (1 + empty free
  // cells) doubled once for every empty column available as a relay -
  // except the destination column itself, if it's empty, since it
  // stops being an empty relay the moment the sequence starts landing
  // there.
  function maxSupermoveSize(state, destColIndex) {
    const destIsEmpty = destColIndex !== undefined && destColIndex !== null
      && state.columns[destColIndex].length === 0;
    const emptyCols = countEmptyColumns(state, destIsEmpty ? destColIndex : undefined);
    return (1 + countEmptyFreeCells(state)) * Math.pow(2, emptyCols);
  }

  function canPlaceOnColumn(card, destColumn) {
    if (destColumn.length === 0) return true;
    const top = destColumn[destColumn.length - 1];
    return top.rank === card.rank + 1 && isRed(top) !== isRed(card);
  }

  function canPlaceOnFoundation(card, foundations) {
    return foundations[card.suit] === card.rank - 1;
  }

  // Moves `count` cards (a valid sequence) from the bottom of column
  // `fromCol` onto column `toCol`. Returns { state, ok, reason }.
  function moveColumnToColumn(state, fromCol, count, toCol) {
    const column = state.columns[fromCol];
    if (fromCol === toCol) return { state, ok: false, reason: "same-column" };
    if (count < 1 || count > column.length) return { state, ok: false, reason: "bad-count" };
    const startIndex = column.length - count;
    if (!isMovableSequenceStart(state, fromCol, startIndex)) {
      return { state, ok: false, reason: "not-a-sequence" };
    }
    if (count > maxSupermoveSize(state, toCol)) {
      return { state, ok: false, reason: "too-many-cards" };
    }
    const movingCard = column[startIndex];
    if (!canPlaceOnColumn(movingCard, state.columns[toCol])) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    const moving = next.columns[fromCol].splice(startIndex, count);
    next.columns[toCol] = next.columns[toCol].concat(moving);
    return { state: next, ok: true };
  }

  function moveColumnToFreeCell(state, fromCol, freeCellIndex) {
    const column = state.columns[fromCol];
    if (!column.length) return { state, ok: false, reason: "empty-column" };
    if (state.freeCells[freeCellIndex] !== null) return { state, ok: false, reason: "cell-occupied" };

    const next = cloneState(state);
    const card = next.columns[fromCol].pop();
    next.freeCells[freeCellIndex] = card;
    return { state: next, ok: true };
  }

  function moveFreeCellToColumn(state, freeCellIndex, toCol) {
    const card = state.freeCells[freeCellIndex];
    if (!card) return { state, ok: false, reason: "empty-cell" };
    if (!canPlaceOnColumn(card, state.columns[toCol])) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    next.freeCells[freeCellIndex] = null;
    next.columns[toCol].push(card);
    return { state: next, ok: true };
  }

  function moveColumnToFoundation(state, fromCol) {
    const column = state.columns[fromCol];
    if (!column.length) return { state, ok: false, reason: "empty-column" };
    const card = column[column.length - 1];
    if (!canPlaceOnFoundation(card, state.foundations)) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    next.columns[fromCol].pop();
    next.foundations[card.suit] = card.rank;
    return { state: next, ok: true };
  }

  function moveFreeCellToFoundation(state, freeCellIndex) {
    const card = state.freeCells[freeCellIndex];
    if (!card) return { state, ok: false, reason: "empty-cell" };
    if (!canPlaceOnFoundation(card, state.foundations)) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    next.freeCells[freeCellIndex] = null;
    next.foundations[card.suit] = card.rank;
    return { state: next, ok: true };
  }

  // Every currently-available "send to foundation" move, as
  // { source: "column"|"freecell", index } - used for the optional
  // one-click "collect" convenience.
  function getFoundationMoves(state) {
    const moves = [];
    state.columns.forEach((col, i) => {
      if (col.length && canPlaceOnFoundation(col[col.length - 1], state.foundations)) {
        moves.push({ source: "column", index: i });
      }
    });
    state.freeCells.forEach((card, i) => {
      if (card && canPlaceOnFoundation(card, state.foundations)) {
        moves.push({ source: "freecell", index: i });
      }
    });
    return moves;
  }

  function isWon(state) {
    return SUITS.every((s) => state.foundations[s] === 13);
  }

  return {
    SUITS,
    COLUMN_COUNT,
    FREE_CELL_COUNT,
    isRed,
    createDeck,
    shuffle,
    createInitialState,
    cloneState,
    movableSequenceLength,
    isMovableSequenceStart,
    maxSupermoveSize,
    canPlaceOnColumn,
    canPlaceOnFoundation,
    moveColumnToColumn,
    moveColumnToFreeCell,
    moveFreeCellToColumn,
    moveColumnToFoundation,
    moveFreeCellToFoundation,
    getFoundationMoves,
    isWon
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FreeCellCore;
}
if (typeof window !== "undefined") {
  window.FreeCellCore = FreeCellCore;
}
