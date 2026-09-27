// calcudoku-core.js
// Dependency-free Calcudoku engine: puzzle generation and the validation
// logic the UI needs. No DOM here, same separation as every other
// <game>-core.js in this app.
//
// The rules: an N x N grid (4 to 7) where every row and every column
// holds each digit 1..N exactly once - no 3x3-style boxes. The grid is
// split into cages; each cage shows a target and an operation, and its
// digits must produce the target with that operation (+ and x in any
// order and any cage size; - and / only on two-cell cages, always larger
// minus / divided by smaller). A one-cell cage just shows its digit. A
// digit may repeat inside a cage as long as its row and column allow it.
//
// Generation: a random Latin square, cut into connected cages of one to
// four cells, an operation per cage that gives a whole number, then our
// own solver checks the clues allow exactly one solution; if not, the
// cut is thrown away and the square cut again (same "generate, count
// solutions, discard if more than one" idea as SudokuCore.countSolutions).
// Each solver run has a node budget so a slow e-reader never hangs on
// one unlucky attempt - it just counts as "not unique" and we try again.
//
// A grid is a flat array of N*N numbers (0 = empty); index i is row
// Math.floor(i / N), column i % N. A cage is { cells: [index...], op,
// target } with op one of "+", "-", "*", "/", "=" (single cell).

const CalcudokuCore = (function () {
  const SIZES = [4, 5, 6, 7];

  // Cage-size weights per difficulty: small cages are easier (more
  // single cells and pairs, which pin digits down quickly).
  // `keepSingles` is the share of one-cell cages left alone after
  // cutting; the rest are merged into a neighbouring cage, since every
  // one-cell cage simply gives its digit away.
  const DIFFICULTY = {
    easy: { weights: { 1: 1, 2: 6, 3: 3 }, keepSingles: 0.5 },
    medium: { weights: { 2: 4, 3: 5, 4: 2 }, keepSingles: 0.25 },
    hard: { weights: { 2: 2, 3: 4, 4: 5 }, keepSingles: 0.1 }
  };
  const MAX_CAGE = 4;

  const NODE_BUDGET = 60000;
  const MAX_ATTEMPTS = 400;

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

  // A cyclic Latin square with rows, columns and symbols shuffled -
  // every Latin square of these sizes is reachable closely enough for
  // puzzle variety, and it is instant.
  function randomLatinSquare(n, random) {
    const rows = shuffle(Array.from({ length: n }, (_, i) => i), random);
    const cols = shuffle(Array.from({ length: n }, (_, i) => i), random);
    const syms = shuffle(Array.from({ length: n }, (_, i) => i + 1), random);
    const grid = new Array(n * n);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        grid[r * n + c] = syms[(rows[r] + cols[c]) % n];
      }
    }
    return grid;
  }

  function neighbors4(i, n) {
    const r = Math.floor(i / n), c = i % n;
    const out = [];
    if (r > 0) out.push(i - n);
    if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    if (c < n - 1) out.push(i + 1);
    return out;
  }

  // Cuts the grid into connected cages, growing each from a random
  // unassigned cell towards a randomly picked target size.
  function randomCages(n, weights, random) {
    const owner = new Array(n * n).fill(-1);
    const cages = [];
    const order = shuffle(Array.from({ length: n * n }, (_, i) => i), random);
    order.forEach((start) => {
      if (owner[start] !== -1) return;
      const id = cages.length;
      const cells = [start];
      owner[start] = id;
      const target = weightedPick(weights, random);
      while (cells.length < target) {
        const frontier = [];
        cells.forEach((cell) => {
          neighbors4(cell, n).forEach((nb) => {
            if (owner[nb] === -1 && frontier.indexOf(nb) === -1) frontier.push(nb);
          });
        });
        if (!frontier.length) break;
        const pick = frontier[Math.floor(random() * frontier.length)];
        owner[pick] = id;
        cells.push(pick);
      }
      cages.push({ cells });
    });
    return cages;
  }

  // Merges most one-cell cages into a neighbouring cage that still has
  // room, then renumbers. Cells in each cage end up sorted, so the first
  // one is the cage's top-left-most cell (where its label goes).
  function mergeSingles(n, cages, keepShare, random) {
    const owner = new Array(n * n);
    cages.forEach((cage, id) => cage.cells.forEach((i) => { owner[i] = id; }));
    cages.forEach((cage, id) => {
      if (cage.cells.length !== 1 || random() < keepShare) return;
      const cell = cage.cells[0];
      const options = neighbors4(cell, n)
        .map((nb) => owner[nb])
        .filter((o) => o !== id && cages[o].cells.length > 0 && cages[o].cells.length < MAX_CAGE);
      if (!options.length) return;
      const target = options[Math.floor(random() * options.length)];
      cages[target].cells.push(cell);
      owner[cell] = target;
      cage.cells = [];
    });
    const out = cages.filter((cage) => cage.cells.length > 0);
    out.forEach((cage) => cage.cells.sort((a, b) => a - b));
    return out;
  }

  // Picks an operation for a cage from its solved digits. Pairs prefer
  // - and / (they narrow things down most); / only when it divides
  // evenly.
  function assignOperation(cage, solution, random) {
    const vals = cage.cells.map((i) => solution[i]);
    if (vals.length === 1) {
      cage.op = "=";
      cage.target = vals[0];
      return;
    }
    if (vals.length === 2) {
      const hi = Math.max(vals[0], vals[1]), lo = Math.min(vals[0], vals[1]);
      const options = [["-", 3], ["+", 1], ["*", 1]];
      if (hi % lo === 0) options.push(["/", 3]);
      const weights = {};
      options.forEach((o, idx) => { weights[idx] = o[1]; });
      const op = options[weightedPick(weights, random)][0];
      cage.op = op;
      cage.target = op === "-" ? hi - lo : op === "/" ? hi / lo : op === "+" ? hi + lo : hi * lo;
      return;
    }
    const product = vals.reduce((a, b) => a * b, 1);
    // Very large products are hard to read in a small corner label and
    // give little away; keep them to sums.
    const useProduct = product <= 999 && random() < 0.45;
    cage.op = useProduct ? "*" : "+";
    cage.target = useProduct ? product : vals.reduce((a, b) => a + b, 0);
  }

  function cageValueOk(op, target, vals) {
    if (op === "=") return vals[0] === target;
    if (op === "+") return vals.reduce((a, b) => a + b, 0) === target;
    if (op === "*") return vals.reduce((a, b) => a * b, 1) === target;
    if (vals.length !== 2) return false;
    const hi = Math.max(vals[0], vals[1]), lo = Math.min(vals[0], vals[1]);
    if (op === "-") return hi - lo === target;
    if (op === "/") return hi === lo * target;
    return false;
  }

  // Every digit tuple a cage's cells could hold on their own: the cage
  // arithmetic works out, and no two cells of the cage that share a row
  // or column hold the same digit.
  function cageTuples(n, cage) {
    const cells = cage.cells;
    const k = cells.length;
    const tuples = [];
    const cur = new Array(k);
    function rec(pos) {
      if (pos === k) {
        if (cageValueOk(cage.op, cage.target, cur)) tuples.push(cur.slice());
        return;
      }
      const r = Math.floor(cells[pos] / n), c = cells[pos] % n;
      for (let d = 1; d <= n; d++) {
        let clash = false;
        for (let q = 0; q < pos; q++) {
          if (cur[q] !== d) continue;
          const rq = Math.floor(cells[q] / n), cq = cells[q] % n;
          if (rq === r || cq === c) { clash = true; break; }
        }
        if (clash) continue;
        // Cheap early exits for the common operations.
        if (cage.op === "+") {
          let s = d;
          for (let q = 0; q < pos; q++) s += cur[q];
          if (s + (k - pos - 1) > cage.target) continue;
        } else if (cage.op === "*") {
          let p = d;
          for (let q = 0; q < pos; q++) p *= cur[q];
          if (cage.target % p !== 0) continue;
        }
        cur[pos] = d;
        rec(pos + 1);
      }
    }
    rec(0);
    return tuples;
  }

  // Finds up to `limit` solutions. Returns { count, solutions, aborted }
  // - aborted is true when the node budget ran out first, in which case
  // count is not reliable.
  function solveCages(n, cages, limit, budget) {
    limit = limit || 2;
    budget = budget || NODE_BUDGET;
    const cells = n * n;
    const full = ((1 << (n + 1)) - 1) & ~1;
    const grid = new Array(cells).fill(0);
    const rowMask = new Array(n).fill(0);
    const colMask = new Array(n).fill(0);
    const cageOf = new Array(cells).fill(-1);
    const posInCage = new Array(cells).fill(-1);
    cages.forEach((cage, id) => cage.cells.forEach((i, p) => { cageOf[i] = id; posInCage[i] = p; }));
    const tuples = cages.map((cage) => cageTuples(n, cage));
    const solutions = [];
    let nodes = 0;
    let aborted = false;

    if (tuples.some((t) => t.length === 0)) return { count: 0, solutions, aborted };

    // Allowed-digit mask for every empty cell: its row/column must allow
    // the digit, and some tuple of its cage that matches the cage's
    // filled cells (and whose other digits fit their rows/columns) must
    // put that digit there.
    function allowedMasks() {
      const masks = new Array(cells).fill(0);
      for (let id = 0; id < cages.length; id++) {
        const cage = cages[id];
        const cc = cage.cells;
        let anyEmpty = false;
        for (let p = 0; p < cc.length; p++) if (!grid[cc[p]]) { anyEmpty = true; break; }
        if (!anyEmpty) continue;
        const list = tuples[id];
        for (let t = 0; t < list.length; t++) {
          const tup = list[t];
          let ok = true;
          for (let p = 0; p < cc.length; p++) {
            const i = cc[p];
            const v = grid[i];
            if (v) {
              if (v !== tup[p]) { ok = false; break; }
            } else {
              const bit = 1 << tup[p];
              if ((rowMask[Math.floor(i / n)] | colMask[i % n]) & bit) { ok = false; break; }
            }
          }
          if (!ok) continue;
          for (let p = 0; p < cc.length; p++) {
            if (!grid[cc[p]]) masks[cc[p]] |= 1 << tup[p];
          }
        }
      }
      return masks;
    }

    function search() {
      if (solutions.length >= limit || aborted) return;
      if (++nodes > budget) { aborted = true; return; }
      const masks = allowedMasks();
      let best = -1, bestCount = 99, bestMask = 0;
      for (let i = 0; i < cells; i++) {
        if (grid[i]) continue;
        const m = masks[i] & full & ~(rowMask[Math.floor(i / n)] | colMask[i % n]);
        if (!m) return; // dead end
        let cnt = 0;
        for (let x = m; x; x &= x - 1) cnt++;
        if (cnt < bestCount) {
          best = i; bestCount = cnt; bestMask = m;
          if (cnt === 1) break;
        }
      }
      if (best === -1) {
        solutions.push(grid.slice());
        return;
      }
      const r = Math.floor(best / n), c = best % n;
      for (let d = 1; d <= n; d++) {
        const bit = 1 << d;
        if (!(bestMask & bit)) continue;
        grid[best] = d;
        rowMask[r] |= bit; colMask[c] |= bit;
        search();
        grid[best] = 0;
        rowMask[r] &= ~bit; colMask[c] &= ~bit;
        if (solutions.length >= limit || aborted) return;
      }
    }

    search();
    return { count: solutions.length, solutions, aborted };
  }

  function countSolutions(n, cages, limit) {
    const res = solveCages(n, cages, limit || 2);
    return res.aborted ? -1 : res.count;
  }

  function generatePuzzle(size, difficulty, rng) {
    const random = rng || Math.random;
    const n = SIZES.indexOf(size) !== -1 ? size : 5;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    let solution = randomLatinSquare(n, random);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // A fresh square now and then, so a square that is hard to cut
      // uniquely doesn't eat every attempt.
      if (attempt > 0 && attempt % 25 === 0) solution = randomLatinSquare(n, random);
      const cages = mergeSingles(n, randomCages(n, cfg.weights, random), cfg.keepSingles, random);
      cages.forEach((cage) => assignOperation(cage, solution, random));
      if (countSolutions(n, cages, 2) === 1) {
        return { size: n, difficulty, cages, solution };
      }
    }
    // Practically never reached; single-cell cages everywhere are
    // always unique, so the player is never left without a puzzle.
    const cages = Array.from({ length: n * n }, (_, i) => ({ cells: [i], op: "=", target: solution[i] }));
    return { size: n, difficulty, cages, solution };
  }

  // Filled cells that repeat a digit in their row or column, plus the
  // cells of any completely filled cage whose arithmetic doesn't work
  // out. Returned as a Set of cell indices.
  function findConflicts(n, cages, grid) {
    const conflicts = new Set();
    for (let line = 0; line < n; line++) {
      const seenR = {}, seenC = {};
      for (let k = 0; k < n; k++) {
        const ir = line * n + k, ic = k * n + line;
        const vr = grid[ir], vc = grid[ic];
        if (vr) {
          if (seenR[vr] !== undefined) { conflicts.add(ir); conflicts.add(seenR[vr]); } else seenR[vr] = ir;
        }
        if (vc) {
          if (seenC[vc] !== undefined) { conflicts.add(ic); conflicts.add(seenC[vc]); } else seenC[vc] = ic;
        }
      }
    }
    cages.forEach((cage) => {
      const vals = cage.cells.map((i) => grid[i]);
      if (vals.some((v) => !v)) return;
      if (!cageValueOk(cage.op, cage.target, vals)) cage.cells.forEach((i) => conflicts.add(i));
    });
    return conflicts;
  }

  function isComplete(n, cages, grid) {
    if (grid.length !== n * n || grid.some((v) => !v || v > n)) return false;
    return findConflicts(n, cages, grid).size === 0;
  }

  // The corner label of a cage: "12+", "2÷", or just "3" for one cell.
  const OP_SYMBOL = { "+": "+", "-": "–", "*": "×", "/": "÷", "=": "" };
  function cageLabel(cage) {
    return String(cage.target) + OP_SYMBOL[cage.op];
  }

  return {
    SIZES,
    DIFFICULTY,
    randomLatinSquare,
    randomCages,
    mergeSingles,
    cageTuples,
    solveCages,
    countSolutions,
    generatePuzzle,
    findConflicts,
    isComplete,
    cageLabel
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CalcudokuCore;
}
if (typeof window !== "undefined") {
  window.CalcudokuCore = CalcudokuCore;
}
