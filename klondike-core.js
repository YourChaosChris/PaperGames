// klondike-core.js
// Dependency-free Klondike Solitaire engine. No DOM/UI here, same
// separation of concerns as every other <game>-core.js - just no
// opponent, since Klondike (like FreeCell and Mahjong Solitaire here)
// is solitaire.
//
// This is the standard "draw 1" ruleset (the site favors the
// lower-friction variant over draw-3, matching PaperGames's general
// preference for fewer taps): 7 tableau columns dealt 1-7 cards with
// only the top card of each column face-up, 4 foundations (one per
// suit, built up Ace to King), and a stock/waste pair - tap the stock
// to flip its top card face-up onto the waste, and once the stock is
// empty tapping it again recycles the whole waste back into the stock
// (reversed, so it draws in the same order again) rather than ending
// the draw supply. There's no redeal limit, again favoring the
// lower-friction version of the rules.
//
// A card is { rank, suit, faceUp } - rank 1-13 (Ace-King), suit one of
// "S","H","D","C". Tableau building is alternating color, descending;
// unlike FreeCell there's no free-cell/empty-column capacity limit on
// how many cards can move together, since real Klondike never had
// that restriction in the first place - any already-stacked, all
// face-up, alternating-descending run can move as one unit.

const KlondikeCore = (function () {
  const SUITS = ["S", "H", "D", "C"];
  const COLUMN_COUNT = 7;

  function isRed(card) {
    return card.suit === "H" || card.suit === "D";
  }

  function createDeck() {
    const deck = [];
    SUITS.forEach((suit) => {
      for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, faceUp: false });
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
    const tableau = [];
    let pos = 0;
    for (let c = 0; c < COLUMN_COUNT; c++) {
      const col = [];
      for (let n = 0; n <= c; n++) {
        const card = deck[pos++];
        col.push({ rank: card.rank, suit: card.suit, faceUp: n === c });
      }
      tableau.push(col);
    }
    const stock = deck.slice(pos).map((card) => ({ rank: card.rank, suit: card.suit, faceUp: false }));
    return {
      tableau,
      foundations: { S: 0, H: 0, D: 0, C: 0 },
      stock,
      waste: []
    };
  }

  function cloneCard(card) {
    return { rank: card.rank, suit: card.suit, faceUp: card.faceUp };
  }

  function cloneState(state) {
    return {
      tableau: state.tableau.map((col) => col.map(cloneCard)),
      foundations: Object.assign({}, state.foundations),
      stock: state.stock.map(cloneCard),
      waste: state.waste.map(cloneCard)
    };
  }

  function topOfColumn(column) {
    return column.length ? column[column.length - 1] : null;
  }

  // Flips the new top card of a tableau column face-up, if it exists
  // and isn't already - called right after a card/run leaves a column.
  function revealTop(column) {
    const top = topOfColumn(column);
    if (top && !top.faceUp) top.faceUp = true;
  }

  // How many cards, counting from the top of `column` downward, form a
  // single valid face-up alternating-color descending run - the
  // longest suffix a player could pick up as one group. A lone top
  // card always counts as a (length-1) run, as long as it's face-up.
  function movableSequenceLength(column) {
    if (!column.length) return 0;
    const top = column[column.length - 1];
    if (!top.faceUp) return 0;
    let len = 1;
    for (let i = column.length - 1; i > 0; i--) {
      const upper = column[i - 1];
      const lower = column[i];
      if (!upper.faceUp) break;
      if (upper.rank === lower.rank + 1 && isRed(upper) !== isRed(lower)) len++;
      else break;
    }
    return len;
  }

  // Whether the cards at column[cardIndex..end] form a movable
  // sequence on their own (a prerequisite for picking up more than
  // just the single top card).
  function isMovableSequenceStart(state, colIndex, cardIndex) {
    const column = state.tableau[colIndex];
    if (cardIndex < 0 || cardIndex >= column.length) return false;
    const runLen = movableSequenceLength(column);
    return cardIndex >= column.length - runLen;
  }

  function canPlaceOnColumn(card, destColumn) {
    if (destColumn.length === 0) return card.rank === 13; // only a King starts an empty column
    const top = destColumn[destColumn.length - 1];
    return top.faceUp && top.rank === card.rank + 1 && isRed(top) !== isRed(card);
  }

  function canPlaceOnFoundation(card, foundations) {
    return foundations[card.suit] === card.rank - 1;
  }

  // Moves the face-up run starting at column[cardIndex] (count cards)
  // from `fromCol` onto `toCol`. Returns { state, ok, reason }.
  function moveColumnToColumn(state, fromCol, count, toCol) {
    const column = state.tableau[fromCol];
    if (fromCol === toCol) return { state, ok: false, reason: "same-column" };
    if (count < 1 || count > column.length) return { state, ok: false, reason: "bad-count" };
    const startIndex = column.length - count;
    if (!isMovableSequenceStart(state, fromCol, startIndex)) {
      return { state, ok: false, reason: "not-a-sequence" };
    }
    const movingCard = column[startIndex];
    if (!canPlaceOnColumn(movingCard, state.tableau[toCol])) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    const moving = next.tableau[fromCol].splice(startIndex, count);
    next.tableau[toCol] = next.tableau[toCol].concat(moving);
    revealTop(next.tableau[fromCol]);
    return { state: next, ok: true };
  }

  function moveColumnToFoundation(state, fromCol) {
    const column = state.tableau[fromCol];
    const card = topOfColumn(column);
    if (!card || !card.faceUp) return { state, ok: false, reason: "empty-column" };
    if (!canPlaceOnFoundation(card, state.foundations)) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    next.tableau[fromCol].pop();
    next.foundations[card.suit] = card.rank;
    revealTop(next.tableau[fromCol]);
    return { state: next, ok: true };
  }

  function moveWasteToColumn(state, toCol) {
    const card = topOfColumn(state.waste);
    if (!card) return { state, ok: false, reason: "empty-waste" };
    if (!canPlaceOnColumn(card, state.tableau[toCol])) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    const moving = next.waste.pop();
    moving.faceUp = true;
    next.tableau[toCol].push(moving);
    return { state: next, ok: true };
  }

  function moveWasteToFoundation(state) {
    const card = topOfColumn(state.waste);
    if (!card) return { state, ok: false, reason: "empty-waste" };
    if (!canPlaceOnFoundation(card, state.foundations)) {
      return { state, ok: false, reason: "illegal-placement" };
    }

    const next = cloneState(state);
    next.waste.pop();
    next.foundations[card.suit] = card.rank;
    return { state: next, ok: true };
  }

  // Draws one card from the stock onto the waste, or - once the stock
  // is empty - recycles the whole waste back into the stock (reversed,
  // so cards come back out in the same order they went in) rather than
  // ending the draw supply. `recycled` tells the UI which happened.
  function drawFromStock(state) {
    if (state.stock.length === 0 && state.waste.length === 0) {
      return { state, ok: false, reason: "nothing-to-draw" };
    }

    const next = cloneState(state);
    if (next.stock.length === 0) {
      next.stock = next.waste.reverse().map((card) => ({ rank: card.rank, suit: card.suit, faceUp: false }));
      next.waste = [];
      return { state: next, ok: true, recycled: true };
    }

    const card = next.stock.pop();
    card.faceUp = true;
    next.waste.push(card);
    return { state: next, ok: true, recycled: false };
  }

  // Every currently-available "send to foundation" move, as
  // { source: "column"|"waste", index } - used for the optional
  // one-click "collect" convenience.
  function getFoundationMoves(state) {
    const moves = [];
    state.tableau.forEach((col, i) => {
      const top = topOfColumn(col);
      if (top && top.faceUp && canPlaceOnFoundation(top, state.foundations)) {
        moves.push({ source: "column", index: i });
      }
    });
    const wasteTop = topOfColumn(state.waste);
    if (wasteTop && canPlaceOnFoundation(wasteTop, state.foundations)) {
      moves.push({ source: "waste", index: 0 });
    }
    return moves;
  }

  function isWon(state) {
    return SUITS.every((s) => state.foundations[s] === 13);
  }

  return {
    SUITS,
    COLUMN_COUNT,
    isRed,
    createDeck,
    shuffle,
    createInitialState,
    cloneState,
    topOfColumn,
    movableSequenceLength,
    isMovableSequenceStart,
    canPlaceOnColumn,
    canPlaceOnFoundation,
    moveColumnToColumn,
    moveColumnToFoundation,
    moveWasteToColumn,
    moveWasteToFoundation,
    drawFromStock,
    getFoundationMoves,
    isWon
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KlondikeCore;
}
if (typeof window !== "undefined") {
  window.KlondikeCore = KlondikeCore;
}
