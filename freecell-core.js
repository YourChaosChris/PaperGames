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

  // ---- Hint (task 185) ----
  // Single-card moves only: { from: {type:"column",col} | {type:"freecell",index},
  // to: {type:"column",col} | {type:"freecell",index} | {type:"foundation",suit} }.
  // A person can always make them (a one-card selection).
  function singleMoves(state) {
    const out = [];
    const firstEmptyCell = state.freeCells.findIndex((c) => c === null);
    state.columns.forEach((col, c) => {
      if (!col.length) return;
      const card = col[col.length - 1];
      const from = { type: "column", col: c };
      if (canPlaceOnFoundation(card, state.foundations)) {
        out.push({ from, to: { type: "foundation", suit: card.suit }, next: moveColumnToFoundation(state, c) });
      }
      state.columns.forEach((dest, t) => {
        if (t === c) return;
        if (!dest.length && col.length === 1) return; // pointless
        if (canPlaceOnColumn(card, dest)) {
          out.push({ from, to: { type: "column", col: t }, next: moveColumnToColumn(state, c, 1, t) });
        }
      });
      if (firstEmptyCell >= 0) {
        out.push({ from, to: { type: "freecell", index: firstEmptyCell }, next: moveColumnToFreeCell(state, c, firstEmptyCell) });
      }
    });
    state.freeCells.forEach((card, i) => {
      if (!card) return;
      const from = { type: "freecell", index: i };
      if (canPlaceOnFoundation(card, state.foundations)) {
        out.push({ from, to: { type: "foundation", suit: card.suit }, next: moveFreeCellToFoundation(state, i) });
      }
      state.columns.forEach((dest, t) => {
        if (canPlaceOnColumn(card, dest)) {
          out.push({ from, to: { type: "column", col: t }, next: moveFreeCellToColumn(state, i, t) });
        }
      });
    });
    return out.filter((m) => m.next.ok);
  }

  function stateKey(state) {
    const code = (c) => c.suit + c.rank;
    const cols = state.columns.map((col) => col.map(code).join(",")).sort().join("|");
    const cells = state.freeCells.filter(Boolean).map(code).sort().join(",");
    return cols + "#" + cells + "#" + SUITS.map((s) => state.foundations[s]).join(",");
  }

  // Lower is better: few cards on the foundations is bad, cards stacked on
  // a card they cannot sit on (blockers), occupied free cells.
  function weight(state) {
    let placed = 0;
    SUITS.forEach((s) => { placed += state.foundations[s]; });
    let blockers = 0;
    state.columns.forEach((col) => {
      for (let i = 1; i < col.length; i++) {
        const upper = col[i], lower = col[i - 1];
        const ok = lower.rank === upper.rank + 1 && isRed(lower) !== isRed(upper);
        if (!ok) blockers += 1 + (col.length - i) * 0.1;
      }
      // a low card buried under a higher one of the same colour group costs more
      col.forEach((card, i) => {
        for (let j = 0; j < i; j++) if (col[j].suit === card.suit && col[j].rank > card.rank) { blockers += 0.5; break; }
      });
    });
    const cells = state.freeCells.filter(Boolean).length;
    return (52 - placed) * 3 + blockers * 2 + cells * 2;
  }

  // Best-first search. Returns { plan: [move, ...], sure: true } when a
  // way to clear the deal was found inside the node budget, otherwise
  // { plan: [best first move], sure: false }, or null when no move exists.
  function solvePlan(start, budget) {
    const limit = budget || 8000;
    const heap = [];
    const push = (n) => {
      heap.push(n);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].w <= heap[i].w) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && heap[l].w < heap[m].w) m = l;
          if (r < heap.length && heap[r].w < heap[m].w) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]];
          i = m;
        }
      }
      return top;
    };
    const seen = new Set([stateKey(start)]);
    const root = { state: start, parent: null, move: null, w: weight(start) };
    push(root);
    let best = root;
    let nodes = 0;
    const planOf = (n) => {
      const plan = [];
      for (let x = n; x && x.move; x = x.parent) plan.unshift(x.move);
      return plan;
    };
    while (heap.length && nodes < limit) {
      const n = pop();
      nodes++;
      if (isWon(n.state)) return { plan: planOf(n), sure: true };
      if (n.w < best.w) best = n;
      singleMoves(n.state).forEach((m) => {
        const k = stateKey(m.next.state);
        if (seen.has(k)) return;
        seen.add(k);
        push({ state: m.next.state, parent: n, move: { from: m.from, to: m.to }, w: weight(m.next.state) });
      });
    }
    const roots = singleMoves(start);
    if (!roots.length) return null;
    const chain = planOf(best);
    return { plan: chain.length ? chain : [{ from: roots[0].from, to: roots[0].to }], sure: false };
  }

  function hintMove(state, budget) {
    const r = solvePlan(state, budget);
    return r ? { move: r.plan[0], sure: r.sure } : null;
  }

  return {
    solvePlan,
    hintMove,
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
