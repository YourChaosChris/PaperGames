// killersudoku-core.js
// Dependency-free Killer Sudoku engine: puzzle generation and the
// validation logic the UI needs. No DOM here, same separation as every
// other <game>-core.js in this app. Builds on sudoku-core.js (loaded
// first): the solved grid comes from SudokuCore.generateSolvedGrid.
//
// The rules: an ordinary 9x9 Sudoku - every row, column and 3x3 box
// holds 1..9 exactly once - with the grid also split into cages. Each
// cage shows a sum; its digits add up to that sum, and no digit repeats
// inside a cage. There are few or no given digits.
//
// Generation: a solved Sudoku, cut into connected cages of one to five
// cells (never two equal digits in one cage), sums shown and digits
// hidden. Our own solver then counts solutions; while there are two,
// one digit where they differ is revealed as a given, until the puzzle
// has exactly one solution (the same "count solutions, keep only
// unique" idea as SudokuCore.countSolutions). Each solver run has a node
// budget, so a slow e-reader never hangs - an unfinished count reveals a
// random digit instead and tries again.
//
// A grid is a flat array of 81 numbers (0 = empty), index i is row
// Math.floor(i / 9), column i % 9. A cage is { cells: [index...], sum }.

const KillerSudokuCore = (function () {
  const SIZE = 9;
  const CELLS = 81;
  const MAX_CAGE = 5;

  // Cage-size weights, share of one-cell cages kept (the rest merge into
  // a neighbour), and extra givens on top of what uniqueness needs.
  const DIFFICULTY = {
    easy: { weights: { 2: 5, 3: 4, 4: 1 }, keepSingles: 0.4, extraGivens: 6 },
    medium: { weights: { 2: 3, 3: 5, 4: 3 }, keepSingles: 0.2, extraGivens: 2 },
    hard: { weights: { 2: 2, 3: 4, 4: 4, 5: 2 }, keepSingles: 0, extraGivens: 0 }
  };

  const NODE_BUDGET = 15000;

  function shuffle(arr, random) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function weightedPick(weights, random) {
    const keys = Object.keys(weights);
    let total = 0;
    keys.forEach((k) => { total += weights[k]; });
    let x = random() * total;
    for (let i = 0; i < keys.length; i++) {
      x -= weights[keys[i]];
      if (x < 0) return parseInt(keys[i], 10);
    }
    return parseInt(keys[keys.length - 1], 10);
  }

  function neighbors4(i) {
    const r = Math.floor(i / SIZE), c = i % SIZE;
    const out = [];
    if (r > 0) out.push(i - SIZE);
    if (r < SIZE - 1) out.push(i + SIZE);
    if (c > 0) out.push(i - 1);
    if (c < SIZE - 1) out.push(i + 1);
    return out;
  }

  function boxIndex(r, c) {
    return Math.floor(r / 3) * 3 + Math.floor(c / 3);
  }

  // Connected cages without a repeated digit, grown from random cells;
  // most one-cell cages are then merged into a neighbouring cage that
  // has room and doesn't hold that digit yet.
  function randomCages(solution, cfg, random) {
    const owner = new Array(CELLS).fill(-1);
    let cages = [];
    shuffle(Array.from({ length: CELLS }, (_, i) => i), random).forEach((start) => {
      if (owner[start] !== -1) return;
      const id = cages.length;
      const cells = [start];
      owner[start] = id;
      const target = weightedPick(cfg.weights, random);
      while (cells.length < target) {
        const frontier = [];
        cells.forEach((cell) => neighbors4(cell).forEach((nb) => {
          if (owner[nb] !== -1 || frontier.indexOf(nb) !== -1) return;
          if (cells.some((x) => solution[x] === solution[nb])) return;
          frontier.push(nb);
        }));
        if (!frontier.length) break;
        const pick = frontier[Math.floor(random() * frontier.length)];
        owner[pick] = id;
        cells.push(pick);
      }
      cages.push(cells);
    });
    cages.forEach((cells, id) => {
      if (cells.length !== 1 || random() < cfg.keepSingles) return;
      const options = neighbors4(cells[0])
        .map((nb) => owner[nb])
        .filter((o) => o !== id && cages[o].length > 0 && cages[o].length < MAX_CAGE &&
          !cages[o].some((x) => solution[x] === solution[cells[0]]));
      if (!options.length) return;
      const target = options[Math.floor(random() * options.length)];
      cages[target].push(cells[0]);
      owner[cells[0]] = target;
      cages[id] = [];
    });
    cages = cages.filter((cells) => cells.length > 0);
    return cages.map((cells) => {
      cells.sort((a, b) => a - b);
      return { cells, sum: cells.reduce((s, i) => s + solution[i], 0) };
    });
  }

  // Every subset of the digits 1..9 as a bit mask (bit d = digit d), with
  // its size and sum - the building block for "which digits can still
  // complete this cage".
  const SUBSETS = [];
  for (let m = 0; m < 512; m++) {
    let count = 0, sum = 0;
    for (let d = 1; d <= 9; d++) if (m & (1 << (d - 1))) { count++; sum += d; }
    SUBSETS.push({ mask: m << 1, count, sum });
  }
  const allowedCache = new Map();
  const ALL_DIGITS = 0x3fe; // bits 1..9

  // The 27 rows, columns and boxes as cell-index lists.
  const UNITS = [];
  for (let r = 0; r < SIZE; r++) UNITS.push(Array.from({ length: SIZE }, (_, c) => r * SIZE + c));
  for (let c = 0; c < SIZE; c++) UNITS.push(Array.from({ length: SIZE }, (_, r) => r * SIZE + c));
  for (let b = 0; b < SIZE; b++) {
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
    const cells = [];
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((br + dr) * SIZE + bc + dc);
    UNITS.push(cells);
  }

  // Union of the digits that can appear in some completion of a cage:
  // `count` more distinct digits, none of them in `used`, adding up to
  // `sum`.
  function cageAllowed(used, count, sum) {
    if (count <= 0 || sum <= 0) return 0;
    const key = used * 1000 + count * 100 + sum;
    const hit = allowedCache.get(key);
    if (hit !== undefined) return hit;
    let out = 0;
    for (let k = 0; k < SUBSETS.length; k++) {
      const s = SUBSETS[k];
      if (s.count === count && s.sum === sum && !(s.mask & used)) out |= s.mask;
    }
    allowedCache.set(key, out);
    return out;
  }

  // Finds up to `limit` solutions. Returns { solutions, aborted }.
  function solveCages(cages, givens, limit, budget) {
    limit = limit || 2;
    budget = budget || NODE_BUDGET;
    const grid = givens ? givens.slice() : new Array(CELLS).fill(0);
    const rows = new Array(SIZE).fill(0), cols = new Array(SIZE).fill(0), boxes = new Array(SIZE).fill(0);
    const cageOf = new Array(CELLS).fill(-1);
    cages.forEach((cage, id) => cage.cells.forEach((i) => { cageOf[i] = id; }));
    const cUsed = cages.map(() => 0), cFilled = cages.map(() => 0), cSum = cages.map(() => 0);
    const solutions = [];
    let nodes = 0;
    let aborted = false;

    function place(i, d) {
      const r = Math.floor(i / SIZE), c = i % SIZE, bit = 1 << d, id = cageOf[i];
      grid[i] = d;
      rows[r] |= bit; cols[c] |= bit; boxes[boxIndex(r, c)] |= bit;
      cUsed[id] |= bit; cFilled[id]++; cSum[id] += d;
    }
    function unplace(i, d) {
      const r = Math.floor(i / SIZE), c = i % SIZE, bit = 1 << d, id = cageOf[i];
      grid[i] = 0;
      rows[r] &= ~bit; cols[c] &= ~bit; boxes[boxIndex(r, c)] &= ~bit;
      cUsed[id] &= ~bit; cFilled[id]--; cSum[id] -= d;
    }

    for (let i = 0; i < CELLS; i++) {
      const d = grid[i];
      if (!d) continue;
      grid[i] = 0;
      const r = Math.floor(i / SIZE), c = i % SIZE, bit = 1 << d;
      if ((rows[r] | cols[c] | boxes[boxIndex(r, c)] | cUsed[cageOf[i]]) & bit) return { solutions, aborted };
      place(i, d);
    }

    function candidates(i) {
      const r = Math.floor(i / SIZE), c = i % SIZE, id = cageOf[i];
      const cage = cages[id];
      const allowed = cageAllowed(cUsed[id], cage.cells.length - cFilled[id], cage.sum - cSum[id]);
      return allowed & ~(rows[r] | cols[c] | boxes[boxIndex(r, c)]);
    }

    const masks = new Array(CELLS).fill(0);

    function rec() {
      if (solutions.length >= limit || aborted) return;
      if (++nodes > budget) { aborted = true; return; }
      // Branch on the empty cell with the fewest candidates...
      let best = -1, bestMask = 0, bestCount = 99;
      for (let i = 0; i < CELLS; i++) {
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
      // ...unless a row, column or box has a missing digit that fits in
      // only one of its cells (then place it there), or in none (dead
      // end). Bit masks keep this cheap: `once` collects digits seen in
      // at least one cell, `twice` in at least two.
      if (bestCount > 1) {
        for (let u = 0; u < UNITS.length; u++) {
          const unit = UNITS[u];
          let once = 0, twice = 0, placed = 0;
          for (let k = 0; k < 9; k++) {
            const i = unit[k];
            if (grid[i]) { placed |= 1 << grid[i]; continue; }
            twice |= once & masks[i];
            once |= masks[i];
          }
          if ((once | placed) !== ALL_DIGITS) return;
          const single = once & ~twice & ~placed;
          if (!single) continue;
          let d = 1;
          while (!(single & (1 << d))) d++;
          for (let k = 0; k < 9; k++) {
            const i = unit[k];
            if (!grid[i] && (masks[i] & (1 << d))) { best = i; bestMask = 1 << d; bestCount = 1; break; }
          }
          break;
        }
      }
      for (let d = 1; d <= 9; d++) {
        if (!(bestMask & (1 << d))) continue;
        place(best, d);
        rec();
        unplace(best, d);
        if (solutions.length >= limit || aborted) return;
      }
    }

    rec();
    return { solutions, aborted };
  }

  function countSolutions(cages, givens, limit) {
    const res = solveCages(cages, givens, limit || 2);
    return res.aborted ? -1 : res.solutions.length;
  }

  // Generation as a series of small steps (one budget-limited solver run
  // each), so the page can hand control back to the browser in between
  // (generatePuzzleAsync) and a slow e-reader never freezes for seconds.
  // step() returns null until the puzzle is ready.
  function createGenerator(difficulty, rng) {
    const random = rng || Math.random;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    const solution = SudokuCore.generateSolvedGrid(random);
    const cages = randomCages(solution, cfg, random);
    const givens = new Array(CELLS).fill(0);

    function revealRandom() {
      const hidden = [];
      for (let i = 0; i < CELLS; i++) if (!givens[i]) hidden.push(i);
      if (!hidden.length) return;
      const i = hidden[Math.floor(random() * hidden.length)];
      givens[i] = solution[i];
    }

    function finish() {
      for (let k = 0; k < cfg.extraGivens; k++) revealRandom();
      return { difficulty, cages, givens, solution };
    }

    function step() {
      const res = solveCages(cages, givens, 2);
      if (!res.aborted && res.solutions.length === 1) return finish();
      if (!res.aborted && res.solutions.length === 2) {
        // Reveal one digit where the two solutions disagree.
        const a = res.solutions[0], b = res.solutions[1];
        const diff = [];
        for (let i = 0; i < CELLS; i++) if (a[i] !== b[i]) diff.push(i);
        const i = diff[Math.floor(random() * diff.length)];
        givens[i] = solution[i];
      } else {
        // Unfinished count: a random extra given makes the next run
        // cheaper; this ends at the latest with a full grid, which is
        // always unique.
        revealRandom();
      }
      return null;
    }

    return { step };
  }

  function generatePuzzle(difficulty, rng) {
    const gen = createGenerator(difficulty, rng);
    for (;;) {
      const puzzle = gen.step();
      if (puzzle) return puzzle;
    }
  }

  function generatePuzzleAsync(difficulty, rng, done) {
    const gen = createGenerator(difficulty, rng);
    (function tick() {
      const puzzle = gen.step();
      if (puzzle) done(puzzle);
      else setTimeout(tick, 0);
    })();
  }

  // Filled cells that repeat a digit in their row, column, box or cage,
  // plus every cell of a completely filled cage whose sum is wrong.
  function findConflicts(cages, grid) {
    const conflicts = SudokuCore.findConflicts(grid);
    cages.forEach((cage) => {
      const seen = {};
      let sum = 0, full = true;
      cage.cells.forEach((i) => {
        const v = grid[i];
        if (!v) { full = false; return; }
        sum += v;
        if (seen[v] !== undefined) { conflicts.add(i); conflicts.add(seen[v]); } else seen[v] = i;
      });
      if (full && sum !== cage.sum) cage.cells.forEach((i) => conflicts.add(i));
    });
    return conflicts;
  }

  function isComplete(cages, grid) {
    if (grid.length !== CELLS || grid.some((v) => !v)) return false;
    return findConflicts(cages, grid).size === 0;
  }

  return {
    SIZE,
    CELLS,
    DIFFICULTY,
    randomCages,
    solveCages,
    countSolutions,
    createGenerator,
    generatePuzzle,
    generatePuzzleAsync,
    findConflicts,
    isComplete
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KillerSudokuCore;
}
if (typeof window !== "undefined") {
  window.KillerSudokuCore = KillerSudokuCore;
}
