// animalsudoku-core.js
// "Animal Sudoku" - a small Sudoku for children with animals instead of
// numbers. Dependency-free, no DOM.
//
// Board sizes: 4 x 4 with four 2 x 2 boxes, or 6 x 6 with six boxes of
// 2 rows x 3 columns. Values are 1..n (the app draws value v as animal
// ANIMALS[v - 1]); 0 = empty. Every animal appears exactly once in each
// row, column and box.
//
// A puzzle is made by filling a random complete grid and then taking
// animals away in random order. A cell stays empty only if the puzzle
// still has exactly one solution and can still be solved with the two
// simplest steps alone - "only one animal fits this cell" and "this
// animal has only one cell left in this row/column/box" - so no puzzle
// ever needs guessing. The level sets how many animals stay on the board.

const AnimalSudokuCore = (function () {
  const ANIMALS = ["dog", "cat", "rabbit", "mouse", "owl", "fish"];
  const SIZES = {
    4: { n: 4, boxRows: 2, boxCols: 2 },
    6: { n: 6, boxRows: 2, boxCols: 3 }
  };
  // Animals left on the board per size and level.
  const GIVENS = {
    4: { easy: 10, medium: 8, hard: 6 },
    6: { easy: 24, medium: 19, hard: 15 }
  };

  const unitCache = {};

  // Rows, columns and boxes as lists of cell indices, plus each cell's
  // peers (cells sharing a unit).
  function geometry(n) {
    if (unitCache[n]) return unitCache[n];
    const cfg = SIZES[n];
    const units = [];
    for (let r = 0; r < n; r++) {
      const cells = [];
      for (let c = 0; c < n; c++) cells.push(r * n + c);
      units.push({ kind: "row", index: r, cells });
    }
    for (let c = 0; c < n; c++) {
      const cells = [];
      for (let r = 0; r < n; r++) cells.push(r * n + c);
      units.push({ kind: "column", index: c, cells });
    }
    const boxesPerRow = n / cfg.boxCols;
    for (let b = 0; b < n; b++) {
      const r0 = Math.floor(b / boxesPerRow) * cfg.boxRows, c0 = (b % boxesPerRow) * cfg.boxCols;
      const cells = [];
      for (let r = 0; r < cfg.boxRows; r++) for (let c = 0; c < cfg.boxCols; c++) cells.push((r0 + r) * n + c0 + c);
      units.push({ kind: "box", index: b, cells });
    }
    const peers = [];
    for (let i = 0; i < n * n; i++) peers.push(new Set());
    units.forEach((u) => u.cells.forEach((a) => u.cells.forEach((b) => { if (a !== b) peers[a].add(b); })));
    const g = { n, cfg, units, peers: peers.map((s) => Array.from(s)) };
    unitCache[n] = g;
    return g;
  }

  function boxOf(n, i) {
    const cfg = SIZES[n];
    const r = Math.floor(i / n), c = i % n;
    return Math.floor(r / cfg.boxRows) * (n / cfg.boxCols) + Math.floor(c / cfg.boxCols);
  }

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function allowed(g, grid, i, v) {
    return g.peers[i].every((p) => grid[p] !== v);
  }

  // A random complete grid.
  function randomSolution(n, rnd) {
    const g = geometry(n);
    const grid = new Array(n * n).fill(0);
    (function fill(i) {
      if (i === n * n) return true;
      for (const v of shuffle(Array.from({ length: n }, (_, k) => k + 1), rnd)) {
        if (!allowed(g, grid, i, v)) continue;
        grid[i] = v;
        if (fill(i + 1)) return true;
      }
      grid[i] = 0;
      return false;
    })(0);
    return grid;
  }

  // Number of solutions, stopping at `limit`.
  function countSolutions(n, puzzle, limit) {
    const g = geometry(n);
    const grid = puzzle.slice();
    let count = 0;
    (function search() {
      if (count >= limit) return;
      let best = -1, bestOpts = null;
      for (let i = 0; i < n * n; i++) {
        if (grid[i]) continue;
        const opts = [];
        for (let v = 1; v <= n; v++) if (allowed(g, grid, i, v)) opts.push(v);
        if (!opts.length) return;
        if (best === -1 || opts.length < bestOpts.length) { best = i; bestOpts = opts; }
      }
      if (best === -1) { count++; return; }
      for (const v of bestOpts) {
        grid[best] = v;
        search();
        grid[best] = 0;
        if (count >= limit) return;
      }
    })();
    return count;
  }

  // The next step by the two simple rules, or null. Returns
  // { cell, value, tech: "hidden" | "naked", unit }.
  function simpleStep(n, grid) {
    const g = geometry(n);
    const cand = (i) => {
      const out = [];
      for (let v = 1; v <= n; v++) if (allowed(g, grid, i, v)) out.push(v);
      return out;
    };
    for (const u of g.units) {
      for (let v = 1; v <= n; v++) {
        if (u.cells.some((i) => grid[i] === v)) continue;
        const where = u.cells.filter((i) => !grid[i] && allowed(g, grid, i, v));
        if (where.length === 1) return { cell: where[0], value: v, tech: "hidden", unit: u };
      }
    }
    for (let i = 0; i < n * n; i++) {
      if (grid[i]) continue;
      const c = cand(i);
      if (c.length === 1) return { cell: i, value: c[0], tech: "naked", unit: null };
    }
    return null;
  }

  // True when the simple steps alone fill the whole grid.
  function simpleSolvable(n, puzzle) {
    const grid = puzzle.slice();
    for (;;) {
      if (grid.every((v) => v)) return true;
      const s = simpleStep(n, grid);
      if (!s) return false;
      grid[s.cell] = s.value;
    }
  }

  // { n, level, puzzle, solution }. rng: () => [0, 1).
  function generatePuzzle(n, level, rng) {
    const rnd = rng || Math.random;
    const size = SIZES[n] ? n : 4;
    const target = (GIVENS[size][level] || GIVENS[size].medium);
    let best = null;
    for (let attempt = 0; attempt < 30; attempt++) {
      const solution = randomSolution(size, rnd);
      const puzzle = solution.slice();
      let givens = size * size;
      for (const i of shuffle(Array.from({ length: size * size }, (_, k) => k), rnd)) {
        if (givens <= target) break;
        const keep = puzzle[i];
        puzzle[i] = 0;
        if (countSolutions(size, puzzle, 2) === 1 && simpleSolvable(size, puzzle)) givens--;
        else puzzle[i] = keep;
      }
      if (!best || givens < best.givens) best = { puzzle, solution, givens };
      if (givens <= target) break;
    }
    return { n: size, level, puzzle: best.puzzle, solution: best.solution, givens: best.givens };
  }

  // Cells whose animal repeats in a row, column or box.
  function conflicts(n, grid) {
    const g = geometry(n);
    const bad = new Set();
    for (let i = 0; i < n * n; i++) {
      if (!grid[i]) continue;
      g.peers[i].forEach((p) => { if (grid[p] === grid[i]) { bad.add(i); bad.add(p); } });
    }
    return bad;
  }

  function isSolved(n, grid, solution) {
    return grid.every((v, i) => v === solution[i]);
  }

  // Like Sudoku's hint (hint-engine.js), in this order:
  //   { kind: "conflict", cells }   an animal repeats in a row/column/box
  //   { kind: "wrong", cell }       an animal differs from the solution
  //   { kind: "step", cell, value, tech, unit }   the next simple step
  //   { kind: "done" }
  // Every puzzle is solvable by the simple steps, so from a grid without
  // mistakes there is always a step.
  function findHint(n, grid, solution) {
    const bad = conflicts(n, grid);
    if (bad.size) return { kind: "conflict", cells: Array.from(bad).sort((a, b) => a - b) };
    for (let i = 0; i < n * n; i++) if (grid[i] && grid[i] !== solution[i]) return { kind: "wrong", cell: i };
    if (grid.every((v) => v)) return { kind: "done" };
    const s = simpleStep(n, grid);
    if (s) return Object.assign({ kind: "step" }, s);
    const i = grid.findIndex((v) => !v);
    return { kind: "step", cell: i, value: solution[i], tech: "deep", unit: null };
  }

  return { ANIMALS, SIZES, GIVENS, geometry, boxOf, randomSolution, countSolutions, simpleStep, simpleSolvable, generatePuzzle, conflicts, isSolved, findHint };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AnimalSudokuCore;
}
if (typeof window !== "undefined") {
  window.AnimalSudokuCore = AnimalSudokuCore;
}
