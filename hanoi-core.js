// hanoi-core.js
// Rules of the Tower of Hanoi (task 118), without any DOM or browser
// feature. Three rods (0, 1, 2) and n discs (3 to 8; disc 1 is the
// smallest). At the start every disc is on rod 0; the goal is to move them
// all to rod 2. One move takes the top disc of a rod onto another rod; a
// disc may never lie on a smaller one. The fewest moves from the start are
// 2^n - 1.
// Hint: the first move of a shortest way from the current position to the
// goal, from a table of all 3^n positions (at most 6,561), built per n on
// first use - so it also works after moves that left the shortest way.
//
// The state is a plain serialisable object:
// { n, pegs: [[bottom ... top], [], []], moves, history: [[from, to], ...], solved }.
// Every function returns a new state, or the very same object when the
// move is not allowed.

const HanoiCore = (() => {
  const tables = {};   // n -> Map(position key -> moves to the goal)

  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newGame(n) {
    const k = n >= 3 && n <= 8 ? Math.floor(n) : 4;
    const first = [];
    for (let d = k; d >= 1; d--) first.push(d);
    return { n: k, pegs: [first, [], []], moves: 0, history: [], solved: false };
  }

  function minMoves(n) {
    return Math.pow(2, n) - 1;
  }

  function top(peg) {
    return peg.length ? peg[peg.length - 1] : undefined;
  }

  // { ok: true } or { ok: false, reason: "same" | "empty" | "bigger" }.
  function canMove(state, from, to) {
    if (from === to) return { ok: false, reason: "same" };
    const a = state.pegs[from], b = state.pegs[to];
    if (!a || !b || !a.length) return { ok: false, reason: "empty" };
    if (b.length && top(a) > top(b)) return { ok: false, reason: "bigger" };
    return { ok: true };
  }

  function isSolved(state) {
    return state.pegs[2].length === state.n;
  }

  function move(state, from, to) {
    if (!canMove(state, from, to).ok) return state;
    const pegs = state.pegs.map((p) => p.slice());
    pegs[to].push(pegs[from].pop());
    return Object.assign({}, state, { pegs, moves: state.moves + 1, history: state.history.concat([[from, to]]), solved: pegs[2].length === state.n });
  }

  // Takes back the last move.
  function undo(state) {
    if (!state.history.length) return state;
    const last = state.history[state.history.length - 1];
    const pegs = state.pegs.map((p) => p.slice());
    pegs[last[0]].push(pegs[last[1]].pop());
    return Object.assign({}, state, { pegs, moves: state.moves - 1, history: state.history.slice(0, -1), solved: pegs[2].length === state.n });
  }

  // The rod of every disc, smallest first, as a key.
  function key(pegs) {
    const pos = [];
    pegs.forEach((p, rod) => p.forEach((d) => { pos[d - 1] = rod; }));
    return pos.join("");
  }

  // Moves to the goal for every position with n discs (breadth-first from
  // the goal; moves can be reversed, so the distances are the same).
  function table(n) {
    if (tables[n]) return tables[n];
    const goal = [[], [], []];
    for (let d = n; d >= 1; d--) goal[2].push(d);
    const dist = new Map([[key(goal), 0]]), queue = [goal];
    for (let q = 0; q < queue.length; q++) {
      const pegs = queue[q], d = dist.get(key(pegs));
      for (let a = 0; a < 3; a++) {
        for (let b = 0; b < 3; b++) {
          if (a === b || !pegs[a].length || (pegs[b].length && top(pegs[a]) > top(pegs[b]))) continue;
          const next = pegs.map((p) => p.slice());
          next[b].push(next[a].pop());
          const k = key(next);
          if (!dist.has(k)) { dist.set(k, d + 1); queue.push(next); }
        }
      }
    }
    tables[n] = dist;
    return dist;
  }

  function movesToSolve(state) {
    return table(state.n).get(key(state.pegs));
  }

  // [from, to] of the next move on a shortest way to the goal, or null.
  function nextMove(state) {
    if (isSolved(state)) return null;
    const dist = table(state.n), here = dist.get(key(state.pegs));
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        if (!canMove(state, a, b).ok) continue;
        const pegs = state.pegs.map((p) => p.slice());
        pegs[b].push(pegs[a].pop());
        if (dist.get(key(pegs)) === here - 1) return [a, b];
      }
    }
    return null;
  }

  return { makeRng, newGame, minMoves, canMove, move, undo, isSolved, nextMove, movesToSolve };
})();

if (typeof module !== "undefined") module.exports = HanoiCore;
if (typeof window !== "undefined") window.HanoiCore = HanoiCore;
