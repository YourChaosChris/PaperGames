// pyramidsolitaire-core.js
// Dependency-free Pyramid Solitaire engine. No DOM/UI here, same
// separation of concerns as klondike-core.js/freecell-core.js - just no
// opponent, since Pyramid, like this collection's other solitaires, is
// a single-player patience game.
//
// The whole deck is dealt into a 7-row triangle (row 0 has 1 card, row
// 6 has 7 cards, 1+2+...+7 = 28 cards) plus a 24-card stock. Unlike
// Klondike/FreeCell's sequence-building, Pyramid clears cards in pairs
// that sum to exactly 13 (Ace=1 ... King=13), or a lone King (which
// already equals 13 by itself). A card in the pyramid can only be
// picked once neither of the two cards resting on it in the row below
// remain - the bottom row starts fully exposed since nothing is below
// it. The stock deals one card at a time face-up onto a waste pile;
// only the waste's current top card is available for pairing. Once the
// stock runs out, a limited number of redeals recycle the waste back
// into the stock (see REDEAL_LIMIT below).
//
// A card is { rank, suit } - rank 1-13 (Ace-King), suit one of
// "S","H","D","C". All 28 pyramid cards are visible face-up from the
// very start (the standard rule for this game, unlike Klondike) - only
// whether a card can currently be picked up changes as the pyramid is
// cleared.
//
// Winning only requires clearing all 28 pyramid cards - the stock and
// waste don't need to be emptied too. That's the standard/common win
// condition most implementations of this game use.

const PyramidSolitaireCore = (function () {
  const SUITS = ["S", "H", "D", "C"];
  const ROWS = 7;
  const REDEAL_LIMIT = 2;
  const TARGET_SUM = 13;

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

  function cloneCard(card) {
    return card ? { rank: card.rank, suit: card.suit } : null;
  }

  function createInitialState(rng) {
    const deck = shuffle(createDeck(), rng);
    let pos = 0;
    const pyramid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c <= r; c++) row.push(cloneCard(deck[pos++]));
      pyramid.push(row);
    }
    const stock = deck.slice(pos).map(cloneCard);
    return {
      pyramid,
      stock,
      waste: [],
      redealsLeft: REDEAL_LIMIT
    };
  }

  function cloneState(state) {
    return {
      pyramid: state.pyramid.map((row) => row.map(cloneCard)),
      stock: state.stock.map(cloneCard),
      waste: state.waste.map(cloneCard),
      redealsLeft: state.redealsLeft
    };
  }

  function topOfWaste(state) {
    return state.waste.length ? state.waste[state.waste.length - 1] : null;
  }

  // A pyramid card is exposed once the (up to) two cards resting on it
  // in the row below are both gone. Row ROWS-1 (the bottom row) has
  // nothing below it, so it's always exposed as long as the card is
  // still there.
  function isExposed(pyramid, row, col) {
    if (row < 0 || row >= ROWS) return false;
    const rowCards = pyramid[row];
    if (!rowCards || !rowCards[col]) return false;
    if (row === ROWS - 1) return true;
    const below = pyramid[row + 1];
    return !below[col] && !below[col + 1];
  }

  // `loc` is { type: "pyramid", row, col } or { type: "waste" }.
  function cardAt(state, loc) {
    if (!loc) return null;
    if (loc.type === "waste") return topOfWaste(state);
    if (loc.type === "pyramid") {
      const row = state.pyramid[loc.row];
      return row ? row[loc.col] : null;
    }
    return null;
  }

  function isLocationPlayable(state, loc) {
    const card = cardAt(state, loc);
    if (!card) return false;
    if (loc.type === "pyramid") return isExposed(state.pyramid, loc.row, loc.col);
    return true; // the waste's top card is always playable once it exists
  }

  function locationsEqual(a, b) {
    if (!a || !b || a.type !== b.type) return false;
    if (a.type === "pyramid") return a.row === b.row && a.col === b.col;
    return true;
  }

  function removeAtLocation(state, loc) {
    if (loc.type === "waste") state.waste.pop();
    else state.pyramid[loc.row][loc.col] = null;
  }

  // Removes a single exposed King (rank 13 already equals the target
  // sum on its own, so it needs no partner).
  function removeSingleKing(state, loc) {
    if (!isLocationPlayable(state, loc)) return { state, ok: false, reason: "not-available" };
    const card = cardAt(state, loc);
    if (card.rank !== 13) return { state, ok: false, reason: "not-a-king" };

    const next = cloneState(state);
    removeAtLocation(next, loc);
    return { state: next, ok: true };
  }

  // Removes two exposed cards (pyramid and/or the waste's top card)
  // whose ranks sum to exactly 13.
  function removePair(state, locA, locB) {
    if (locationsEqual(locA, locB)) return { state, ok: false, reason: "same-location" };
    if (!isLocationPlayable(state, locA) || !isLocationPlayable(state, locB)) {
      return { state, ok: false, reason: "not-available" };
    }
    const cardA = cardAt(state, locA);
    const cardB = cardAt(state, locB);
    if (cardA.rank + cardB.rank !== TARGET_SUM) return { state, ok: false, reason: "bad-sum" };

    const next = cloneState(state);
    removeAtLocation(next, locA);
    removeAtLocation(next, locB);
    return { state: next, ok: true };
  }

  // Draws one card from the stock onto the waste, or - once the stock
  // is empty - recycles the whole waste back into the stock (reversed,
  // so cards come back out in the same order), as long as a redeal is
  // still available. `recycled` tells the UI which happened.
  function drawFromStock(state) {
    if (state.stock.length === 0) {
      if (state.waste.length === 0 || state.redealsLeft <= 0) {
        return { state, ok: false, reason: "no-stock" };
      }
      const next = cloneState(state);
      next.stock = next.waste.slice().reverse();
      next.waste = [];
      next.redealsLeft -= 1;
      return { state: next, ok: true, recycled: true };
    }

    const next = cloneState(state);
    const card = next.stock.pop();
    next.waste.push(card);
    return { state: next, ok: true, recycled: false };
  }

  function getExposedPyramidLocations(state) {
    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= r; c++) {
        if (state.pyramid[r][c] && isExposed(state.pyramid, r, c)) {
          out.push({ type: "pyramid", row: r, col: c });
        }
      }
    }
    return out;
  }

  function isWon(state) {
    return state.pyramid.every((row) => row.every((card) => !card));
  }

  // Whether any King-alone removal or sum-to-13 pair currently exists
  // among the exposed pyramid cards plus the waste's top card.
  function hasAnyMove(state) {
    const exposed = getExposedPyramidLocations(state);
    const values = exposed.map((loc) => cardAt(state, loc).rank);
    const wasteTop = topOfWaste(state);
    if (wasteTop) values.push(wasteTop.rank);

    if (values.some((v) => v === TARGET_SUM)) return true;
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] + values[j] === TARGET_SUM) return true;
      }
    }
    return false;
  }

  // A loss requires the stock to be fully exhausted with no redeal
  // left to refill it (otherwise the player can always just keep
  // drawing/redealing) and no King or pair currently available.
  function isLost(state) {
    if (isWon(state)) return false;
    if (state.stock.length > 0) return false;
    if (state.redealsLeft > 0 && state.waste.length > 0) return false;
    return !hasAnyMove(state);
  }

  return {
    SUITS,
    ROWS,
    REDEAL_LIMIT,
    TARGET_SUM,
    createDeck,
    shuffle,
    createInitialState,
    cloneState,
    cloneCard,
    topOfWaste,
    isExposed,
    cardAt,
    isLocationPlayable,
    locationsEqual,
    removeSingleKing,
    removePair,
    drawFromStock,
    getExposedPyramidLocations,
    isWon,
    hasAnyMove,
    isLost
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PyramidSolitaireCore;
}
if (typeof window !== "undefined") {
  window.PyramidSolitaireCore = PyramidSolitaireCore;
}
