// nim-core.js
// Rules of Nim (task 118), without any DOM or browser feature. Heaps of
// stones; a move takes one or more stones from one heap. Normal play: who
// takes the last stone wins. Misère: who takes the last stone loses. Two
// players, 0 and 1.
//
// Perfect play (Charles L. Bouton, 1901): with normal play the player to
// move wins exactly when the xor of the heap sizes ("nim sum") is not 0.
// Misère is the same while some heap has two or more stones; when every
// heap has at most one stone, the player to move wins exactly when the
// number of single stones is even.
// Computer: "easy" any legal move, "medium" the perfect move half of the
// time, "hard" always the perfect move - from a winning position it
// cannot be beaten; from a losing one it takes one stone from the biggest
// heap.
//
// The state is a plain serialisable object:
// { heaps, start, misere, turn, over, winner, moves, last }.
// Every function returns a new state, or the very same object when the
// move is not allowed.

const NimCore = (() => {
  const PRESETS = { small: [3, 4, 5], classic: [1, 3, 5, 7] };

  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // opts: { heaps, misere, first }
  function newGame(opts) {
    const o = opts || {};
    const heaps = (Array.isArray(o.heaps) && o.heaps.length ? o.heaps : PRESETS.small).map((x) => Math.max(0, Math.floor(x) || 0));
    return { heaps, start: heaps.slice(), misere: !!o.misere, turn: o.first === 1 ? 1 : 0, over: false, winner: null, moves: 0, last: null };
  }

  // 3 or 4 heaps of 1 to 7 stones, not all the same.
  function randomHeaps(rng) {
    const r = rng || Math.random;
    const n = 3 + Math.floor(r() * 2), heaps = [];
    for (let i = 0; i < n; i++) heaps.push(1 + Math.floor(r() * 7));
    if (heaps.every((x) => x === heaps[0])) heaps[0] = heaps[0] % 7 + 1;
    return heaps;
  }

  function nimSum(heaps) {
    return heaps.reduce((a, b) => a ^ b, 0);
  }

  // Does the player to move win with perfect play?
  function isWinning(heaps, misere) {
    if (misere && heaps.every((x) => x <= 1)) return heaps.filter((x) => x === 1).length % 2 === 0;
    return nimSum(heaps) !== 0;
  }

  // A move into a position that is lost for the other player, or null when
  // the position itself is lost.
  function perfectMove(heaps, misere) {
    if (!isWinning(heaps, misere)) return null;
    for (let h = 0; h < heaps.length; h++) {
      for (let count = 1; count <= heaps[h]; count++) {
        const next = heaps.slice();
        next[h] -= count;
        if (!isWinning(next, misere)) return { heap: h, count };
      }
    }
    return null;
  }

  function legalMoves(heaps) {
    const out = [];
    heaps.forEach((n, h) => { for (let count = 1; count <= n; count++) out.push({ heap: h, count }); });
    return out;
  }

  // level: "easy" | "medium" | "hard".
  function aiMove(state, level, rng) {
    const r = rng || Math.random;
    const moves = legalMoves(state.heaps);
    if (!moves.length) return null;
    const random = () => moves[Math.min(moves.length - 1, Math.floor(r() * moves.length))];
    if (level === "easy") return random();
    const best = perfectMove(state.heaps, state.misere);
    if (level === "medium") return r() < 0.5 && best ? best : random();
    if (best) return best;
    const big = Math.max.apply(null, state.heaps);
    return { heap: state.heaps.indexOf(big), count: 1 };
  }

  function move(state, heap, count) {
    if (state.over || !(heap >= 0 && heap < state.heaps.length) || !(count >= 1 && count <= state.heaps[heap]) || Math.floor(count) !== count) return state;
    const heaps = state.heaps.slice();
    heaps[heap] -= count;
    const over = heaps.every((x) => x === 0);
    return Object.assign({}, state, {
      heaps,
      last: { player: state.turn, heap, count },
      turn: 1 - state.turn,
      moves: state.moves + 1,
      over,
      winner: over ? (state.misere ? 1 - state.turn : state.turn) : null
    });
  }

  return { PRESETS, makeRng, newGame, randomHeaps, nimSum, isWinning, perfectMove, legalMoves, aiMove, move };
})();

if (typeof module !== "undefined") module.exports = NimCore;
if (typeof window !== "undefined") window.NimCore = NimCore;
