// shapesort-core.js
// "Shape Sort" - sort stones by shape into tubes. Dependency-free, no DOM.
//
// Every tube holds up to 4 stones; tubes[i] lists its stones bottom to
// top, each a shape index 0..k-1 (SHAPES). A move takes the top stone
// of one tube - and the stones of the same shape right below it, as
// many as fit - onto another tube that is empty or has the same shape on
// top and room left. The puzzle is solved when every tube is empty or
// holds 4 stones of one shape.
//
// Levels: easy 4 shapes in 6 tubes, medium 6 shapes in 8 tubes, hard 8
// shapes in 10 tubes - always two tubes empty at the start. Every deal
// is checked with the solver below, so each puzzle can be solved.

const ShapeSortCore = (function () {
  const SHAPES = ["circle", "square", "triangle", "star", "heart", "cross", "diamond", "moon"];
  const CAPACITY = 4;
  const LEVELS = {
    easy: { shapes: 4, tubes: 6 },
    medium: { shapes: 6, tubes: 8 },
    hard: { shapes: 8, tubes: 10 }
  };

  function clone(tubes) {
    return tubes.map((t) => t.slice());
  }

  function top(t) {
    return t.length ? t[t.length - 1] : -1;
  }

  // Number of same-shape stones on top of a tube.
  function topRun(t) {
    if (!t.length) return 0;
    const s = t[t.length - 1];
    let n = 1;
    while (n < t.length && t[t.length - 1 - n] === s) n++;
    return n;
  }

  function canMove(tubes, from, to) {
    if (from === to) return false;
    const a = tubes[from], b = tubes[to];
    if (!a || !b || !a.length || b.length >= CAPACITY) return false;
    return !b.length || top(b) === top(a);
  }

  // How many stones a move from -> to carries (0 if not allowed).
  function moveCount(tubes, from, to) {
    if (!canMove(tubes, from, to)) return 0;
    return Math.min(topRun(tubes[from]), CAPACITY - tubes[to].length);
  }

  function applyMove(tubes, from, to) {
    const n = moveCount(tubes, from, to);
    if (!n) return null;
    const next = clone(tubes);
    for (let i = 0; i < n; i++) next[to].push(next[from].pop());
    return next;
  }

  function isComplete(t) {
    return t.length === CAPACITY && t.every((s) => s === t[0]);
  }

  function isSolved(tubes) {
    return tubes.every((t) => !t.length || isComplete(t));
  }

  function key(tubes) {
    return tubes.map((t) => t.join(",")).sort().join("|");
  }

  // Moves worth trying from a position, the more useful ones first:
  // never pour a finished tube, never move a whole one-shape tube into an
  // empty tube (that changes nothing), prefer moves onto a matching
  // stone, and only one of several empty targets.
  function usefulMoves(tubes) {
    const moves = [];
    for (let from = 0; from < tubes.length; from++) {
      const a = tubes[from];
      if (!a.length || isComplete(a)) continue;
      const run = topRun(a);
      let emptyTried = false;
      for (let to = 0; to < tubes.length; to++) {
        if (!canMove(tubes, from, to)) continue;
        const b = tubes[to];
        if (!b.length) {
          if (run === a.length || emptyTried) continue;
          emptyTried = true;
          moves.push({ from, to, score: 0 });
        } else {
          const n = Math.min(run, CAPACITY - b.length);
          // Filling a tube up, or clearing a tube's top run, scores higher.
          moves.push({ from, to, score: 2 + (b.length + n === CAPACITY ? 2 : 0) + (n === run ? 1 : 0) });
        }
      }
    }
    moves.sort((x, y) => y.score - x.score);
    return moves;
  }

  // A list of moves [{ from, to }] that solves the position, or null if
  // there is none (or the search gave up after `limit` positions).
  function solve(tubes, limit) {
    const max = limit || 200000;
    const seen = new Set();
    const path = [];
    let count = 0;
    function dfs(t) {
      if (isSolved(t)) return true;
      if (++count > max) return false;
      const k = key(t);
      if (seen.has(k)) return false;
      seen.add(k);
      for (const m of usefulMoves(t)) {
        path.push({ from: m.from, to: m.to });
        if (dfs(applyMove(t, m.from, m.to))) return true;
        path.pop();
      }
      return false;
    }
    return dfs(clone(tubes)) ? path : null;
  }

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // { level, tubes, solution } - a solvable deal where no tube starts
  // finished. rng: () => [0, 1).
  function generatePuzzle(level, rng) {
    const rnd = rng || Math.random;
    const cfg = LEVELS[level] || LEVELS.easy;
    for (let attempt = 0; attempt < 50; attempt++) {
      const stones = [];
      for (let s = 0; s < cfg.shapes; s++) for (let i = 0; i < CAPACITY; i++) stones.push(s);
      shuffle(stones, rnd);
      const tubes = [];
      for (let i = 0; i < cfg.shapes; i++) tubes.push(stones.slice(i * CAPACITY, (i + 1) * CAPACITY));
      for (let i = cfg.shapes; i < cfg.tubes; i++) tubes.push([]);
      if (tubes.some(isComplete)) continue;
      const solution = solve(tubes);
      if (solution) return { level, tubes, solution };
    }
    return null;
  }

  // A plan is a solving path plus the position before each of its moves,
  // so a hint can follow it as long as the player does.
  function makePlan(tubes, moves) {
    const keys = [];
    let t = tubes;
    for (const m of moves) {
      keys.push(key(t));
      t = applyMove(t, m.from, m.to);
    }
    return { keys, moves };
  }

  // The next move towards a solution from this position:
  //   { kind: "move", from, to, plan }  |  { kind: "done" }  |  { kind: "stuck" }
  // `plan` (from an earlier hint or the deal) is followed while the
  // position is on it; otherwise the position is solved afresh. Solving
  // afresh is what fails when the player has moved into a dead end.
  function findHint(tubes, plan) {
    if (isSolved(tubes)) return { kind: "done" };
    const k = key(tubes);
    if (plan && plan.keys) {
      const i = plan.keys.indexOf(k);
      if (i !== -1) return { kind: "move", from: plan.moves[i].from, to: plan.moves[i].to, plan };
    }
    const path = solve(tubes, 400000);
    if (!path || !path.length) return { kind: "stuck" };
    const fresh = makePlan(tubes, path);
    return { kind: "move", from: path[0].from, to: path[0].to, plan: fresh };
  }

  function stoneCount(tubes) {
    return tubes.reduce((s, t) => s + t.length, 0);
  }

  return { SHAPES, CAPACITY, LEVELS, top, topRun, canMove, moveCount, applyMove, isComplete, isSolved, key, solve, makePlan, generatePuzzle, findHint, stoneCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ShapeSortCore;
}
if (typeof window !== "undefined") {
  window.ShapeSortCore = ShapeSortCore;
}
