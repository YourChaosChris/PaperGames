// mahjong-core.js
// Dependency-free Mahjong Solitaire engine. No DOM/UI here, same
// separation of concerns as every other <game>-core.js - just no
// opponent, since this is solitaire.
//
// Tiles sit in a layered "turtle" layout described in half-tile-width
// coordinates: a tile at (layer, cx, cy) occupies a 2x2 box centered on
// (cx, cy), so a tile on the layer above overlaps ("covers") a tile
// below it whenever their centers are within 2 units on each axis, and
// two tiles on the same layer sit side by side ("adjacent") when their
// centers are exactly 2 units apart on one axis and equal on the
// other. A tile is "free" - eligible to be picked up - when nothing
// covers it from above and at least one of its same-layer left/right
// neighbors is missing or already removed.
//
// The deal is never dealt purely at random: symbols are assigned by
// replaying a valid removal sequence backward (repeatedly finding two
// tiles that are simultaneously free given only the tiles placed so
// far, marking them a matching pair, and "removing" them from the
// construction), the same technique solitaire card games use to
// guarantee a winnable deal - an arbitrary random assignment of
// symbols to positions can easily be unsolvable from the very first
// move, since a symbol's two matching tiles might both start buried.

const MahjongCore = (function () {
  function generateLayout() {
    const tiles = [];
    let id = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 8; c++) tiles.push({ id: id++, layer: 0, cx: 2 * c, cy: 2 * r });
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) tiles.push({ id: id++, layer: 1, cx: 2 * c + 3, cy: 2 * r + 3 });
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) tiles.push({ id: id++, layer: 2, cx: 2 * c + 5, cy: 2 * r + 5 });
    }
    return tiles;
  }

  const LAYOUT = generateLayout();
  // Plain geometric/card-suit glyphs, not pictorial emoji: those render
  // as small full-color images on most platforms (a colorful bitmap,
  // not ink respecting the page's monochrome palette), which turns to
  // visual noise once an E-Ink panel dithers it to grayscale. These are
  // ordinary text characters that pick up the page's own text color
  // and are supported by essentially every font, the same reasoning
  // already applied to the chess/card glyphs used elsewhere in this
  // app (app.js's piece letters, FreeCell's suit symbols).
  const SYMBOLS = ["●", "○", "■", "□", "▲", "△", "▼", "▽", "◆", "◇",
    "★", "☆", "♠", "♣", "♥", "♦", "▶", "◀", "▮", "▯"];

  function isCoveredAmong(tile, present) {
    return LAYOUT.some((t) => present[t.id] && t.layer > tile.layer
      && Math.abs(t.cx - tile.cx) < 2 && Math.abs(t.cy - tile.cy) < 2);
  }

  function hasOpenSideAmong(tile, present) {
    const leftBlocked = LAYOUT.some((t) => present[t.id] && t.layer === tile.layer
      && t.cy === tile.cy && t.cx === tile.cx - 2);
    const rightBlocked = LAYOUT.some((t) => present[t.id] && t.layer === tile.layer
      && t.cy === tile.cy && t.cx === tile.cx + 2);
    return !leftBlocked || !rightBlocked;
  }

  function isFreeAmong(tile, present) {
    return present[tile.id] && !isCoveredAmong(tile, present) && hasOpenSideAmong(tile, present);
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // Builds a fresh, guaranteed-solvable deal: an array parallel to
  // LAYOUT giving each tile's symbol (a string). See the file comment
  // for why this can't just be a random shuffle of symbols.
  //
  // Occasionally (empirically under 1% of attempts) the random choice
  // of which free tiles to pair up next paints itself into a corner -
  // exactly one tile free with others still left to place, so no pair
  // can be formed. That's a dead end for this specific construction
  // attempt, not a flaw in the layout, so it just starts over; at this
  // failure rate a handful of retries is enough in practice.
  // `startPresent` restricts the construction to a subset of LAYOUT -
  // used both for the initial deal (every tile present) and for
  // reshuffling only the tiles still on the board when a player gets
  // stuck (see reshuffleRemaining below), so a reshuffle can never
  // require a tile that's already been removed to reappear.
  function dealSymbols(rng, startPresent) {
    const random = rng || Math.random;
    const base = startPresent || new Array(LAYOUT.length).fill(true);
    const totalPresent = base.filter(Boolean).length;

    for (let attempt = 0; attempt < 200; attempt++) {
      const present = base.slice();
      const symbols = new Array(LAYOUT.length).fill(null);
      let symbolIndex = 0;
      let remaining = totalPresent;
      let deadEnd = false;

      while (remaining > 0) {
        const free = LAYOUT.filter((t) => isFreeAmong(t, present));
        if (free.length < 2) { deadEnd = true; break; }
        const shuffled = shuffle(free.slice(), random);
        const a = shuffled[0];
        const b = shuffled[1];
        const symbol = SYMBOLS[symbolIndex % SYMBOLS.length];
        symbolIndex++;
        symbols[a.id] = symbol;
        symbols[b.id] = symbol;
        present[a.id] = false;
        present[b.id] = false;
        remaining -= 2;
      }

      if (!deadEnd) return symbols;
    }
    throw new Error("MahjongCore.dealSymbols: failed to construct a solvable deal after 200 attempts");
  }

  // Redeals symbols only among the tiles still on the board - offered
  // when the player is stuck (no legal match anywhere) so they can
  // keep going without restarting the whole board from scratch. The
  // new assignment is, by the same construction used for the initial
  // deal, guaranteed solvable from the current position onward.
  function reshuffleRemaining(state, rng) {
    const startPresent = present(state);
    const symbols = dealSymbols(rng, startPresent);
    return { removed: state.removed.slice(), symbols };
  }

  function createInitialState(rng) {
    const symbols = dealSymbols(rng);
    return {
      removed: new Array(LAYOUT.length).fill(false),
      symbols
    };
  }

  function present(state) {
    return state.removed.map((r) => !r);
  }

  function isFree(state, tileId) {
    const pres = present(state);
    return isFreeAmong(LAYOUT[tileId], pres);
  }

  function getFreeTiles(state) {
    const pres = present(state);
    return LAYOUT.filter((t) => isFreeAmong(t, pres)).map((t) => t.id);
  }

  function isMatch(state, idA, idB) {
    if (idA === idB) return false;
    if (state.removed[idA] || state.removed[idB]) return false;
    if (state.symbols[idA] !== state.symbols[idB]) return false;
    return isFree(state, idA) && isFree(state, idB);
  }

  function removePair(state, idA, idB) {
    const next = { removed: state.removed.slice(), symbols: state.symbols };
    next.removed[idA] = true;
    next.removed[idB] = true;
    return next;
  }

  function isWon(state) {
    return state.removed.every((r) => r);
  }

  // Whether any legal match remains anywhere on the board - the game
  // is stuck (though not lost outright; see the app for a shuffle/undo
  // offer) once this is false and the board isn't fully cleared.
  function hasAnyMove(state) {
    const freeIds = getFreeTiles(state);
    for (let i = 0; i < freeIds.length; i++) {
      for (let j = i + 1; j < freeIds.length; j++) {
        if (state.symbols[freeIds[i]] === state.symbols[freeIds[j]]) return true;
      }
    }
    return false;
  }

  return {
    LAYOUT,
    SYMBOLS,
    createInitialState,
    reshuffleRemaining,
    present,
    isFree,
    getFreeTiles,
    isMatch,
    removePair,
    isWon,
    hasAnyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MahjongCore;
}
if (typeof window !== "undefined") {
  window.MahjongCore = MahjongCore;
}
