// spidersolitaire-core.js
// Dependency-free Spider Solitaire engine. No DOM/UI here, same
// separation of concerns as every other <game>-core.js - just no
// opponent, since Spider (like Klondike and FreeCell here) is
// solitaire.
//
// Spider is played with two full standard decks (104 cards) dealt
// across 10 tableau columns - the first 4 get 6 cards each, the other
// 6 get 5 cards each (54 dealt total), only the top card of each
// column face-up. The remaining 50 cards form the stock, dealt out
// later in batches of 10 - one card face-up onto each of the 10
// columns - whenever the player chooses, but never while any column
// is empty.
//
// Unlike Klondike/FreeCell there are no foundations and no color
// rule: a card can be placed onto a tableau card exactly one rank
// higher regardless of suit. But only an already-stacked run that is
// strictly descending AND same-suit can be picked up and moved as one
// group - a single card can always be moved on its own as long as
// nothing sits on top of it. Whenever a complete King-to-Ace run of
// the same suit (13 cards) ends up contiguous at the bottom of a
// column, it's automatically detected and removed, incrementing a
// "completed sequences" counter; the game is won once all 8 such runs
// (104 / 13) have been cleared.
//
// A card is { rank, suit, faceUp } - rank 1-13 (Ace-King), suit one of
// "S","H","D","C". Which suits actually appear in the 104-card deck
// depends on the chosen difficulty (see createDeck): 1 suit (8 copies
// of it), 2 suits (4 copies of each) or all 4 suits (2 copies of
// each, i.e. exactly like two real decks shuffled together).

const SpiderSolitaireCore = (function () {
  const SUITS = ["S", "H", "D", "C"];
  const COLUMN_COUNT = 10;
  const SEQUENCE_LENGTH = 13;
  const TOTAL_SEQUENCES = 8; // 104 cards / 13, regardless of suit-count mode
  const STOCK_DEAL_SIZE = 10;
  const CARDS_PER_SUIT_MODE_DECK = 104;

  function createDeck(suitCount) {
    const count = suitCount === 1 || suitCount === 2 || suitCount === 4 ? suitCount : 4;
    const suits = SUITS.slice(0, count);
    const copiesPerSuit = 8 / count; // 8, 4 or 2 - always 104 cards total
    const deck = [];
    suits.forEach((suit) => {
      for (let copy = 0; copy < copiesPerSuit; copy++) {
        for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, faceUp: false });
      }
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

  function createInitialState(suitCount, rng) {
    const mode = suitCount === 1 || suitCount === 2 || suitCount === 4 ? suitCount : 2;
    const deck = shuffle(createDeck(mode), rng);
    const tableau = [];
    let pos = 0;
    for (let c = 0; c < COLUMN_COUNT; c++) {
      const dealCount = c < 4 ? 6 : 5;
      const col = [];
      for (let n = 0; n < dealCount; n++) {
        const card = deck[pos++];
        col.push({ rank: card.rank, suit: card.suit, faceUp: n === dealCount - 1 });
      }
      tableau.push(col);
    }
    const stock = deck.slice(pos).map((card) => ({ rank: card.rank, suit: card.suit, faceUp: false }));
    return {
      suitCount: mode,
      tableau,
      stock,
      completed: 0
    };
  }

  function cloneCard(card) {
    return { rank: card.rank, suit: card.suit, faceUp: card.faceUp };
  }

  function cloneState(state) {
    return {
      suitCount: state.suitCount,
      tableau: state.tableau.map((col) => col.map(cloneCard)),
      stock: state.stock.map(cloneCard),
      completed: state.completed
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
  // single valid face-up descending SAME-SUIT run - the longest suffix
  // a player could pick up as one group. A lone top card always counts
  // as a (length-1) run, as long as it's face-up (there's no suit
  // requirement to move just one card by itself).
  function movableSequenceLength(column) {
    if (!column.length) return 0;
    const top = column[column.length - 1];
    if (!top.faceUp) return 0;
    let len = 1;
    for (let i = column.length - 1; i > 0; i--) {
      const upper = column[i - 1];
      const lower = column[i];
      if (!upper.faceUp) break;
      if (upper.suit === lower.suit && upper.rank === lower.rank + 1) len++;
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

  // Any card (or a valid same-suit run) may land on a tableau card
  // exactly one rank higher, regardless of suit - unlike Klondike,
  // there's no color-alternation requirement. An empty column accepts
  // anything, with no rank restriction at all.
  function canPlaceOnColumn(card, destColumn) {
    if (destColumn.length === 0) return true;
    const top = destColumn[destColumn.length - 1];
    return top.faceUp && top.rank === card.rank + 1;
  }

  // Whether the top SEQUENCE_LENGTH cards of `column` form a complete,
  // contiguous, same-suit King-down-to-Ace run - the shape that gets
  // auto-collected. Returns the run's suit, or null.
  function completedSequenceSuit(column) {
    if (column.length < SEQUENCE_LENGTH) return null;
    const start = column.length - SEQUENCE_LENGTH;
    const suit = column[start].suit;
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      const card = column[start + i];
      if (!card.faceUp) return null;
      if (card.suit !== suit) return null;
      if (card.rank !== SEQUENCE_LENGTH - i) return null;
    }
    return suit;
  }

  // Removes a completed run from the top of `column` if one is there,
  // incrementing `state.completed` and revealing the newly-exposed
  // card. Mutates the (already-cloned) state in place. Returns the
  // completed suit, or null if there was nothing to remove.
  function collectCompletedSequence(state, colIndex) {
    const column = state.tableau[colIndex];
    const suit = completedSequenceSuit(column);
    if (!suit) return null;
    column.splice(column.length - SEQUENCE_LENGTH, SEQUENCE_LENGTH);
    state.completed++;
    revealTop(column);
    return suit;
  }

  // Moves the face-up, same-suit run starting at column[fromCol][cardIndex]
  // (count cards, where cardIndex = column.length - count) onto toCol.
  // Returns { state, ok, reason, completedSuit }.
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
    const completedSuit = collectCompletedSequence(next, toCol);
    return { state: next, ok: true, completedSuit };
  }

  // The stock can only be dealt when every tableau column holds at
  // least one card, and only while cards remain in the stock.
  function canDealStock(state) {
    return state.stock.length > 0 && state.tableau.every((col) => col.length > 0);
  }

  // Deals one card face-up onto each of the 10 columns. Returns
  // { state, ok, reason, completedSuits } - completedSuits lists any
  // runs that ended up complete as a result (rare, but more than one
  // column can complete off the same deal).
  function dealFromStock(state) {
    if (state.stock.length === 0) return { state, ok: false, reason: "stock-empty" };
    if (!state.tableau.every((col) => col.length > 0)) {
      return { state, ok: false, reason: "empty-column" };
    }

    const next = cloneState(state);
    const batch = next.stock.splice(0, STOCK_DEAL_SIZE);
    batch.forEach((card, i) => {
      card.faceUp = true;
      next.tableau[i].push(card);
    });
    const completedSuits = [];
    for (let c = 0; c < COLUMN_COUNT; c++) {
      const suit = collectCompletedSequence(next, c);
      if (suit) completedSuits.push(suit);
    }
    return { state: next, ok: true, completedSuits };
  }

  function isWon(state) {
    return state.completed >= TOTAL_SEQUENCES;
  }

  function remainingStockDeals(state) {
    return Math.floor(state.stock.length / STOCK_DEAL_SIZE);
  }

  return {
    SUITS,
    COLUMN_COUNT,
    SEQUENCE_LENGTH,
    TOTAL_SEQUENCES,
    STOCK_DEAL_SIZE,
    CARDS_PER_SUIT_MODE_DECK,
    createDeck,
    shuffle,
    createInitialState,
    cloneState,
    topOfColumn,
    movableSequenceLength,
    isMovableSequenceStart,
    canPlaceOnColumn,
    completedSequenceSuit,
    moveColumnToColumn,
    canDealStock,
    dealFromStock,
    isWon,
    remainingStockDeals
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SpiderSolitaireCore;
}
if (typeof window !== "undefined") {
  window.SpiderSolitaireCore = SpiderSolitaireCore;
}
