// pairs-core.js
// Dependency-free rules engine for Pairs, the card-matching game: all
// cards lie face down, a turn turns over two of them, a matching pair is
// taken and the same player goes again; otherwise both are turned back
// and the turn passes. Rules only, no DOM/UI.
//
// E-ink: nothing in here ever turns a card back by itself. After a
// second card that doesn't match, the state simply waits with both cards
// open (`pendingMiss`) until resolveMiss() is called - the app does that
// on the player's next tap, never on a timer.
//
// State:
//   cols, rows       board size; cols*rows cards, all symbols paired
//   cards[i]         symbol number (0..pairs-1) of card i
//   taken[i]         null | "1" | "2" | "solo" - who took card i's pair
//   open             indices of the face-up, not yet taken cards (0..2)
//   pendingMiss      true while two non-matching cards wait to be turned back
//   turn             "1" | "2" (always "1" in solo play)
//   solo             one player against the move count
//   scores           pairs taken: { "1": n, "2": n }
//   moves            completed turns of two cards
//   gameOver, winner "1" | "2" | "draw" | "solo" once every pair is taken

const PairsCore = (function () {
  const SIZES = {
    "4x3": { cols: 4, rows: 3 },
    "4x4": { cols: 4, rows: 4 },
    "6x4": { cols: 6, rows: 4 },
    "6x6": { cols: 6, rows: 6 }
  };
  const DEFAULT_SIZE = "4x4";

  function otherPlayer(p) { return p === "1" ? "2" : "1"; }

  function shuffle(list, rng) {
    const r = rng || Math.random;
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  function createState(sizeKey, solo, rng) {
    const size = SIZES[sizeKey] || SIZES[DEFAULT_SIZE];
    const n = size.cols * size.rows;
    const cards = [];
    for (let s = 0; s < n / 2; s++) cards.push(s, s);
    shuffle(cards, rng);
    return {
      size: SIZES[sizeKey] ? sizeKey : DEFAULT_SIZE,
      cols: size.cols,
      rows: size.rows,
      cards,
      taken: new Array(n).fill(null),
      open: [],
      pendingMiss: false,
      turn: "1",
      solo: !!solo,
      scores: { "1": 0, "2": 0 },
      moves: 0,
      gameOver: false,
      winner: null
    };
  }

  function cloneState(s) {
    return Object.assign({}, s, {
      cards: s.cards.slice(),
      taken: s.taken.slice(),
      open: s.open.slice(),
      scores: { "1": s.scores["1"], "2": s.scores["2"] }
    });
  }

  function pairCount(state) { return state.cards.length / 2; }

  // Cards that may be turned over now.
  function canFlip(state, i) {
    return !state.gameOver && !state.pendingMiss && i >= 0 && i < state.cards.length &&
      state.taken[i] === null && state.open.indexOf(i) === -1 && state.open.length < 2;
  }

  function hiddenCards(state) {
    const out = [];
    for (let i = 0; i < state.cards.length; i++) {
      if (state.taken[i] === null && state.open.indexOf(i) === -1) out.push(i);
    }
    return out;
  }

  // Turns card i over. With the second card the turn is decided at once
  // if it is a pair (taken, same player again); a miss is left open with
  // pendingMiss set. Returns the new state; result: "first" | "pair" | "miss".
  function flip(state, i) {
    if (!canFlip(state, i)) return { state, result: null };
    const next = cloneState(state);
    next.open.push(i);
    if (next.open.length === 1) return { state: next, result: "first" };
    next.moves++;
    const a = next.open[0], b = next.open[1];
    if (next.cards[a] === next.cards[b]) {
      const owner = next.solo ? "solo" : next.turn;
      next.taken[a] = owner;
      next.taken[b] = owner;
      next.open = [];
      next.scores[next.turn]++;
      if (next.taken.every((t) => t !== null)) {
        next.gameOver = true;
        if (next.solo) next.winner = "solo";
        else if (next.scores["1"] === next.scores["2"]) next.winner = "draw";
        else next.winner = next.scores["1"] > next.scores["2"] ? "1" : "2";
      }
      return { state: next, result: "pair" };
    }
    next.pendingMiss = true;
    return { state: next, result: "miss" };
  }

  // The tap after a miss: both cards go face down, the turn passes.
  function resolveMiss(state) {
    if (!state.pendingMiss) return state;
    const next = cloneState(state);
    next.open = [];
    next.pendingMiss = false;
    if (!next.solo) next.turn = otherPlayer(next.turn);
    return next;
  }

  return { SIZES, DEFAULT_SIZE, otherPlayer, shuffle, createState, cloneState, pairCount, canFlip, hiddenCards, flip, resolveMiss };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PairsCore;
}
if (typeof window !== "undefined") {
  window.PairsCore = PairsCore;
}
