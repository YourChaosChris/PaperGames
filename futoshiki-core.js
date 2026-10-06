// futoshiki-core.js
// Dependency-free Futoshiki engine: generator, solution counter and the
// checks the page needs. No DOM, same separation as calcudoku-core.js
// (rebuilt here rather than shared, so Calcudoku stays untouched).
//
// The rules: an N x N grid (4, 5 or 6) where every row and every column
// holds each number 1..N exactly once. Between some neighbouring cells
// a "less than" sign says which of the two holds the smaller number. A
// few numbers may be given; many puzzles have none. Every puzzle has
// exactly one solution.
//
// A puzzle is { size, givens: [n per cell, 0 = empty], ineq: [{ a, b }],
// solution } where each { a, b } is a pair of side-by-side or stacked
// cells and the number in a is smaller than the number in b. Cell i is
// row Math.floor(i / N), column i % N.
//
// Generation: a random Latin square, every neighbouring pair turned into
// a sign; if that is not yet unique, givens are added until it is. Then
// the clues are taken away one by one in random order, each removal kept
// only while the puzzle still has exactly one solution and - when the
// caller passes `accept` - still passes that check (the page uses it to
// keep only puzzles the hint can solve without guessing). Every solver
// run has a node budget and the whole generator a try limit, so nothing
// ever hangs: an aborted count is treated as "not unique".

const FutoshikiCore = (function () {
  const SIZES = [4, 5, 6];
  const DEFAULT_SIZE = 5;
  const NODE_BUDGET = 20000;
  const MAX_SQUARE_TRIES = 50;

  function shuffle(arr, random) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // Random Latin square by randomised backtracking (any square can come up).
  function randomLatinSquare(n, random) {
    for (let attempt = 0; attempt < MAX_SQUARE_TRIES; attempt++) {
      const grid = new Array(n * n).fill(0);
      let nodes = 0;
      const fill = (i) => {
        if (i === n * n) return true;
        if (++nodes > 5000) return false;
        const r = Math.floor(i / n), c = i % n;
        const options = shuffle(Array.from({ length: n }, (_, k) => k + 1), random);
        for (const v of options) {
          let ok = true;
          for (let k = 0; k < c && ok; k++) if (grid[r * n + k] === v) ok = false;
          for (let k = 0; k < r && ok; k++) if (grid[k * n + c] === v) ok = false;
          if (!ok) continue;
          grid[i] = v;
          if (fill(i + 1)) return true;
          grid[i] = 0;
        }
        return false;
      };
      if (fill(0)) return grid;
    }
    // Fallback (never needed in practice): a cyclic square.
    return Array.from({ length: n * n }, (_, i) => ((Math.floor(i / n) + i % n) % n) + 1);
  }

  function allSigns(n, solution) {
    const out = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const i = r * n + c;
        [c < n - 1 ? i + 1 : -1, r < n - 1 ? i + n : -1].forEach((j) => {
          if (j === -1) return;
          out.push(solution[i] < solution[j] ? { a: i, b: j } : { a: j, b: i });
        });
      }
    }
    return out;
  }

  // Counts solutions up to `limit`. Returns -1 when the node budget runs out.
  function countSolutions(n, givens, ineq, limit, budget) {
    const size = n * n;
    const full = (1 << n) - 1;
    const less = [], more = []; // less[i]: cells that must be smaller than i
    for (let i = 0; i < size; i++) { less.push([]); more.push([]); }
    ineq.forEach(({ a, b }) => { less[b].push(a); more[a].push(b); });
    const grid = givens.slice();
    let count = 0, nodes = 0;
    const max = budget || NODE_BUDGET;
    const lim = limit || 2;

    // The signs form a chain-free order (no cycles), so lower and upper
    // bounds can be pushed along whole chains: a cell is at least one
    // more than the lowest any cell below it can be, and so on.
    const order = [];
    const indeg = less.map((l) => l.length);
    const queue = [];
    for (let i = 0; i < size; i++) if (!indeg[i]) queue.push(i);
    while (queue.length) {
      const i = queue.shift();
      order.push(i);
      more[i].forEach((j) => { if (--indeg[j] === 0) queue.push(j); });
    }
    if (order.length !== size) return 0; // a cycle of signs: no solution
    const lo = new Array(size), hi = new Array(size);

    // Fills lo/hi; false when a placed number already breaks a chain.
    function bounds() {
      let consistent = true;
      for (const i of order) {
        let v = 1;
        less[i].forEach((j) => { if (lo[j] + 1 > v) v = lo[j] + 1; });
        if (grid[i]) { if (v > grid[i]) consistent = false; v = grid[i]; }
        lo[i] = v;
      }
      for (let k = order.length - 1; k >= 0; k--) {
        const i = order[k];
        let v = n;
        more[i].forEach((j) => { if (hi[j] - 1 < v) v = hi[j] - 1; });
        if (grid[i]) { if (v < grid[i]) consistent = false; v = grid[i]; }
        hi[i] = v;
      }
      return consistent;
    }

    function candidates(i) {
      const r = Math.floor(i / n), c = i % n;
      let mask = full;
      for (let k = 0; k < n; k++) {
        const vr = grid[r * n + k], vc = grid[k * n + c];
        if (vr) mask &= ~(1 << (vr - 1));
        if (vc) mask &= ~(1 << (vc - 1));
      }
      for (let v = 1; v <= n; v++) if (v < lo[i] || v > hi[i]) mask &= ~(1 << (v - 1));
      return mask;
    }

    function bits(m) { let k = 0; while (m) { m &= m - 1; k++; } return k; }

    // Fills in every forced number (only one candidate left in a cell, or
    // only one place left for a number in a row or column). Returns false
    // on a contradiction; `placed` collects the cells filled, for undoing.
    function settle(placed) {
      for (;;) {
        if (!bounds()) return false;
        let progress = false;
        const masks = new Array(size);
        for (let i = 0; i < size; i++) {
          if (grid[i]) continue;
          const m = candidates(i);
          if (!m) return false;
          masks[i] = m;
          if (!(m & (m - 1))) { grid[i] = 31 - Math.clz32(m) + 1; placed.push(i); progress = true; }
        }
        if (progress) continue;
        for (let line = 0; line < n && !progress; line++) {
          for (let v = 1; v <= n && !progress; v++) {
            const bit = 1 << (v - 1);
            let rowAt = -1, rowN = 0, rowHas = false, colAt = -1, colN = 0, colHas = false;
            for (let k = 0; k < n; k++) {
              const ir = line * n + k, ic = k * n + line;
              if (grid[ir] === v) rowHas = true; else if (!grid[ir] && (masks[ir] & bit)) { rowN++; rowAt = ir; }
              if (grid[ic] === v) colHas = true; else if (!grid[ic] && (masks[ic] & bit)) { colN++; colAt = ic; }
            }
            if ((!rowHas && rowN === 0) || (!colHas && colN === 0)) return false;
            if (!rowHas && rowN === 1) { grid[rowAt] = v; placed.push(rowAt); progress = true; }
            else if (!colHas && colN === 1) { grid[colAt] = v; placed.push(colAt); progress = true; }
          }
        }
        if (!progress) return true;
      }
    }

    function search() {
      if (++nodes > max) return false;
      const placed = [];
      const undo = () => { placed.forEach((i) => { grid[i] = 0; }); };
      if (!settle(placed)) { undo(); return true; }
      let best = -1, bestMask = 0, bestBits = 99;
      for (let i = 0; i < size; i++) {
        if (grid[i]) continue;
        const m = candidates(i);
        const b = bits(m);
        if (b < bestBits) { best = i; bestMask = m; bestBits = b; }
      }
      if (best === -1) {
        count++;
        undo();
        return count < lim;
      }
      for (let v = 1; v <= n; v++) {
        if (!(bestMask & (1 << (v - 1)))) continue;
        grid[best] = v;
        const go = search();
        grid[best] = 0;
        if (!go) { undo(); return false; }
      }
      undo();
      return true;
    }

    // Givens must not already break a sign or repeat.
    if (!bounds()) return 0;
    for (let i = 0; i < size; i++) {
      if (!grid[i]) continue;
      const v = grid[i];
      grid[i] = 0;
      const ok = candidates(i) & (1 << (v - 1));
      grid[i] = v;
      if (!ok) return 0;
    }
    search();
    if (nodes > max) return -1;
    return count;
  }

  function isUnique(n, givens, ineq) {
    return countSolutions(n, givens, ineq, 2) === 1;
  }

  // accept(puzzle) -> bool: an extra condition every kept removal must meet.
  function generatePuzzle(size, rng, accept) {
    const random = rng || Math.random;
    const n = SIZES.indexOf(size) !== -1 ? size : DEFAULT_SIZE;
    const solution = randomLatinSquare(n, random);
    let ineq = allSigns(n, solution);
    let givens = new Array(n * n).fill(0);
    const order = shuffle(Array.from({ length: n * n }, (_, i) => i), random);
    for (let k = 0; !isUnique(n, givens, ineq) && k < order.length; k++) givens[order[k]] = solution[order[k]];

    const clues = shuffle(
      ineq.map((e) => ({ type: "sign", e })).concat(givens.map((v, i) => v ? { type: "given", i } : null).filter(Boolean)),
      random);
    const removed = [];
    clues.forEach((clue) => {
      if (clue.type === "sign") {
        const next = ineq.filter((e) => e !== clue.e);
        if (isUnique(n, givens, next)) { ineq = next; removed.push(clue); }
      } else {
        const next = givens.slice();
        next[clue.i] = 0;
        if (isUnique(n, next, ineq)) { givens = next; removed.push(clue); }
      }
    });

    // With `accept`: put back the fewest of the last-removed clues that
    // make the puzzle pass (binary search - a clue more never hurts).
    const withBack = (k) => {
      const g = givens.slice(), q = ineq.slice();
      removed.slice(removed.length - k).forEach((clue) => {
        if (clue.type === "sign") q.push(clue.e); else g[clue.i] = solution[clue.i];
      });
      return { size: n, givens: g, ineq: q, solution };
    };
    let puzzle = withBack(0);
    if (accept && !accept(puzzle)) {
      let lo = 1, hi = removed.length;
      if (!accept(withBack(hi))) {
        lo = hi; // even the full set doesn't pass: keep the unique minimal puzzle
        puzzle = withBack(0);
      } else {
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (accept(withBack(mid))) hi = mid; else lo = mid + 1;
        }
        puzzle = withBack(lo);
      }
    }
    puzzle.ineq.sort((x, y) => Math.min(x.a, x.b) - Math.min(y.a, y.b) || Math.max(x.a, x.b) - Math.max(y.a, y.b));
    return puzzle;
  }

  // Filled cells that repeat a number in their row or column, and both
  // cells of a sign whose two numbers are filled in the wrong order.
  function findConflicts(puzzle, grid) {
    const n = puzzle.size;
    const bad = new Set();
    for (let line = 0; line < n; line++) {
      const seenR = {}, seenC = {};
      for (let k = 0; k < n; k++) {
        const ir = line * n + k, ic = k * n + line;
        if (grid[ir]) { if (seenR[grid[ir]] !== undefined) { bad.add(ir); bad.add(seenR[grid[ir]]); } else seenR[grid[ir]] = ir; }
        if (grid[ic]) { if (seenC[grid[ic]] !== undefined) { bad.add(ic); bad.add(seenC[grid[ic]]); } else seenC[grid[ic]] = ic; }
      }
    }
    puzzle.ineq.forEach(({ a, b }) => {
      if (grid[a] && grid[b] && !(grid[a] < grid[b])) { bad.add(a); bad.add(b); }
    });
    return bad;
  }

  function isComplete(puzzle, grid) {
    const n = puzzle.size;
    if (grid.length !== n * n || grid.some((v) => !v || v > n)) return false;
    return findConflicts(puzzle, grid).size === 0;
  }

  // A model for hint-engine.js: rows and columns as units, every sign as
  // a two-cell rule ("cage") whose test is the inequality.
  function hintModel(puzzle) {
    const n = puzzle.size, size = n * n;
    const units = [];
    const values = Array.from({ length: n }, (_, k) => k + 1);
    for (let r = 0; r < n; r++) units.push({ kind: "row", cells: values.map((v, c) => r * n + c), values });
    for (let c = 0; c < n; c++) units.push({ kind: "column", cells: values.map((v, r) => r * n + c), values });
    const peers = [];
    for (let i = 0; i < size; i++) {
      const r = Math.floor(i / n), c = i % n, list = [];
      for (let k = 0; k < n; k++) {
        if (k !== c) list.push(r * n + k);
        if (k !== r) list.push(k * n + c);
      }
      peers.push(list);
    }
    const cages = puzzle.ineq.map(({ a, b }) => ({ cells: [a, b], distinct: false, sign: true, test: (vals) => vals[0] < vals[1] }));
    return { size, maxOf: () => n, units, cages, peers };
  }

  return { SIZES, DEFAULT_SIZE, randomLatinSquare, allSigns, countSolutions, isUnique, generatePuzzle, findConflicts, isComplete, hintModel };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FutoshikiCore;
}
if (typeof window !== "undefined") {
  window.FutoshikiCore = FutoshikiCore;
}
