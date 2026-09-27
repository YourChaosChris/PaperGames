// numberblocks-core.js
// Dependency-free Number Blocks engine (the puzzle Naoki Inaba published
// in 2001): puzzle generation and the validation logic the UI needs. No
// DOM here, same separation as every other <game>-core.js in this app.
//
// The rules: a rectangular grid split into blocks of one to five cells.
// A block of n cells holds the digits 1..n, each exactly once, and two
// equal digits never touch - not side by side and not diagonally, so
// none of a cell's up to eight neighbours may repeat its digit. Some
// digits are given; the puzzle has exactly one solution.
//
// Generation: build the blocks and a valid solution together (see
// generateFilled), then remove givens one at a time as long as
// our own solver still finds exactly one solution (the same "count
// solutions, keep only unique" idea as SudokuCore.countSolutions). Every
// solver run has a node budget, so a slow e-reader never hangs on one
// unlucky attempt - it just counts as "not unique" and we move on.
//
// A grid is a flat array of rows*cols numbers (0 = empty); index i is
// row Math.floor(i / cols), column i % cols. `blocks` is an array of
// cell-index arrays; `blockOf[i]` is the block a cell belongs to.

const NumberBlocksCore = (function () {
  const MAX_BLOCK = 5;

  // Grid size and the share of cells left as givens per difficulty.
  const DIFFICULTY = {
    easy: { size: 6, givenShare: 0.42 },
    medium: { size: 7, givenShare: 0.3 },
    hard: { size: 8, givenShare: 0.2 }
  };

  const FILL_BUDGET = 20000;
  const COUNT_BUDGET = 40000;
  const MAX_ATTEMPTS = 60;

  function shuffle(arr, random) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function neighbors8(i, rows, cols) {
    const r = Math.floor(i / cols), c = i % cols;
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) out.push(rr * cols + cc);
      }
    }
    return out;
  }

  function blockOfFrom(blocks, total) {
    const blockOf = new Array(total).fill(-1);
    blocks.forEach((cells, id) => cells.forEach((i) => { blockOf[i] = id; }));
    return blockOf;
  }

  // Backtracking search over the empty cells (fewest candidates first,
  // or the fewest places a block's missing digit can still go). Returns
  // { solutions, aborted }; aborted means the node budget ran out.
  function search(rows, cols, blocks, givens, limit, budget) {
    const total = rows * cols;
    const blockOf = blockOfFrom(blocks, total);
    const grid = givens.slice();
    const usedInBlock = blocks.map(() => 0);
    const nb8 = Array.from({ length: total }, (_, i) => neighbors8(i, rows, cols));
    const solutions = [];
    let nodes = 0;
    let aborted = false;

    for (let i = 0; i < total; i++) {
      const v = grid[i];
      if (!v) continue;
      const b = blockOf[i];
      if (v > blocks[b].length || (usedInBlock[b] & (1 << v))) return { solutions, aborted };
      usedInBlock[b] |= 1 << v;
      for (const j of nb8[i]) if (grid[j] === v && j < i) return { solutions, aborted };
    }

    function candidates(i) {
      const b = blockOf[i];
      let mask = ((1 << (blocks[b].length + 1)) - 2) & ~usedInBlock[b];
      for (const j of nb8[i]) if (grid[j]) mask &= ~(1 << grid[j]);
      return mask;
    }

    const masks = new Array(total).fill(0);

    function rec() {
      if (solutions.length >= limit || aborted) return;
      if (++nodes > budget) { aborted = true; return; }
      // Branch on the empty cell with the fewest candidates...
      let best = -1, bestMask = 0, bestCount = 99;
      for (let i = 0; i < total; i++) {
        if (grid[i]) continue;
        const m = candidates(i);
        if (!m) return;
        masks[i] = m;
        let cnt = 0;
        for (let x = m; x; x &= x - 1) cnt++;
        if (cnt < bestCount) { best = i; bestMask = m; bestCount = cnt; }
      }
      if (best === -1) {
        solutions.push(grid.slice());
        return;
      }
      // ...or, if it narrows things down more, on the cells where a digit
      // a block still needs can go (none left = dead end).
      let placeDigit = 0, placeCells = null;
      if (bestCount > 1) {
        for (let b = 0; b < blocks.length && bestCount > 1; b++) {
          const cells = blocks[b];
          for (let d = 1; d <= cells.length; d++) {
            if (usedInBlock[b] & (1 << d)) continue;
            const spots = [];
            for (const i of cells) if (!grid[i] && (masks[i] & (1 << d))) spots.push(i);
            if (!spots.length) return;
            if (spots.length < bestCount) {
              bestCount = spots.length; placeDigit = d; placeCells = spots;
              if (bestCount === 1) break;
            }
          }
        }
      }
      if (placeDigit) {
        for (const i of placeCells) {
          const b = blockOf[i];
          grid[i] = placeDigit;
          usedInBlock[b] |= 1 << placeDigit;
          rec();
          grid[i] = 0;
          usedInBlock[b] &= ~(1 << placeDigit);
          if (solutions.length >= limit || aborted) return;
        }
        return;
      }
      const b = blockOf[best];
      const digits = [];
      for (let d = 1; d <= MAX_BLOCK; d++) if (bestMask & (1 << d)) digits.push(d);
      for (const d of digits) {
        grid[best] = d;
        usedInBlock[b] |= 1 << d;
        rec();
        grid[best] = 0;
        usedInBlock[b] &= ~(1 << d);
        if (solutions.length >= limit || aborted) return;
      }
    }

    rec();
    return { solutions, aborted };
  }

  // Builds blocks and a valid solution together, cell by cell in reading
  // order with backtracking: each cell either starts a new block (digit
  // 1) or joins a block touching it from the left or above (digit = that
  // block's size + 1), as long as no already-placed neighbour holds the
  // same digit. Every block of n cells then holds exactly 1..n, and the
  // touching rule holds by construction - far more reliable than cutting
  // blocks first and hoping they can be filled (most random cuts of an
  // 8x8 grid can't be). Joining is preferred, so blocks come out mostly
  // three to five cells big.
  function generateFilled(rows, cols, random, budget) {
    const total = rows * cols;
    const owner = new Array(total).fill(-1);
    const digit = new Array(total).fill(0);
    const sizes = [];
    let nodes = 0;

    function clashes(i, d) {
      const r = Math.floor(i / cols), c = i % cols;
      if (c > 0 && digit[i - 1] === d) return true;
      if (r > 0) {
        if (digit[i - cols] === d) return true;
        if (c > 0 && digit[i - cols - 1] === d) return true;
        if (c < cols - 1 && digit[i - cols + 1] === d) return true;
      }
      return false;
    }

    function rec(i) {
      if (i === total) return true;
      if (++nodes > budget) return false;
      const r = Math.floor(i / cols), c = i % cols;
      const joins = [];
      if (c > 0) joins.push(owner[i - 1]);
      if (r > 0 && joins.indexOf(owner[i - cols]) === -1) joins.push(owner[i - cols]);
      shuffle(joins, random);
      const options = joins.filter((b) => sizes[b] < MAX_BLOCK).map((b) => ({ block: b }));
      const fresh = { block: -1 };
      // Usually grow a neighbouring block; now and then start a new one
      // first, so not every block ends up at the maximum size.
      if (random() < 0.3 || !options.length) options.unshift(fresh); else options.push(fresh);
      for (const opt of options) {
        const b = opt.block === -1 ? sizes.length : opt.block;
        const d = opt.block === -1 ? 1 : sizes[b] + 1;
        if (clashes(i, d)) continue;
        owner[i] = b;
        digit[i] = d;
        if (opt.block === -1) sizes.push(1); else sizes[b]++;
        if (rec(i + 1)) return true;
        if (opt.block === -1) sizes.pop(); else sizes[b]--;
        owner[i] = -1;
        digit[i] = 0;
        if (nodes > budget) return false;
      }
      return false;
    }

    if (!rec(0)) return null;
    const blocks = sizes.map(() => []);
    for (let i = 0; i < total; i++) blocks[owner[i]].push(i);
    return { blocks, solution: digit };
  }

  function countSolutions(rows, cols, blocks, givens, limit) {
    const res = search(rows, cols, blocks, givens, limit || 2, COUNT_BUDGET);
    return res.aborted ? -1 : res.solutions.length;
  }

  function solve(rows, cols, blocks, givens) {
    const res = search(rows, cols, blocks, givens, 1, 1e7);
    return res.solutions[0] || null;
  }

  function generatePuzzle(difficulty, rng) {
    const random = rng || Math.random;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    const rows = cfg.size, cols = cfg.size;
    const total = rows * cols;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const filled = generateFilled(rows, cols, random, FILL_BUDGET);
      if (!filled) continue;
      const blocks = filled.blocks;
      const solution = filled.solution;
      const puzzle = solution.slice();
      const target = Math.round(total * cfg.givenShare);
      let givens = total;
      for (const pos of shuffle(Array.from({ length: total }, (_, i) => i), random)) {
        if (givens <= target) break;
        const saved = puzzle[pos];
        puzzle[pos] = 0;
        if (countSolutions(rows, cols, blocks, puzzle, 2) === 1) givens--;
        else puzzle[pos] = saved;
      }
      return { rows, cols, difficulty, blocks, puzzle, solution };
    }
    // Practically never reached (see the generator test in the project's
    // validation notes): try again with no fill budget, so the player is
    // never left without a puzzle.
    for (;;) {
      const filled = generateFilled(rows, cols, random, 1e7);
      if (filled) return { rows, cols, difficulty, blocks: filled.blocks, puzzle: filled.solution.slice(), solution: filled.solution };
    }
  }

  // Filled cells that break a rule: a digit larger than its block, the
  // same digit twice in a block, or the same digit in two touching
  // cells (both cells are marked). Returned as a Set of cell indices.
  function findConflicts(rows, cols, blocks, grid) {
    const conflicts = new Set();
    const total = rows * cols;
    blocks.forEach((cells) => {
      const seen = {};
      cells.forEach((i) => {
        const v = grid[i];
        if (!v) return;
        if (v > cells.length) conflicts.add(i);
        if (seen[v] !== undefined) { conflicts.add(i); conflicts.add(seen[v]); } else seen[v] = i;
      });
    });
    for (let i = 0; i < total; i++) {
      if (!grid[i]) continue;
      neighbors8(i, rows, cols).forEach((j) => {
        if (j > i && grid[j] === grid[i]) { conflicts.add(i); conflicts.add(j); }
      });
    }
    return conflicts;
  }

  function isComplete(rows, cols, blocks, grid) {
    if (grid.length !== rows * cols || grid.some((v) => !v)) return false;
    return findConflicts(rows, cols, blocks, grid).size === 0;
  }

  function maxBlockSize(blocks) {
    return blocks.reduce((m, cells) => Math.max(m, cells.length), 1);
  }

  return {
    MAX_BLOCK,
    DIFFICULTY,
    generateFilled,
    countSolutions,
    solve,
    generatePuzzle,
    findConflicts,
    isComplete,
    maxBlockSize
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = NumberBlocksCore;
}
if (typeof window !== "undefined") {
  window.NumberBlocksCore = NumberBlocksCore;
}
