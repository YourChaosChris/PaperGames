// mathcross-core.js
// "Math Cross" (Rechenkreuz) - a 3 x 3 grid of the numbers 1 to 9, each
// used once, linked by calculations: every row and every column is a
// sum like "a + b x c = 24" with its result at the end. Dependency-free,
// no DOM.
//
// Calculations are worked out from left to right (top to bottom in a
// column), without "multiplication before addition": 3 + 4 x 2 = 14,
// because 3 + 4 = 7 and 7 x 2 = 14. Every intermediate result and every
// result is a whole number greater than 0, so a division always comes
// out even.
//
// A puzzle:
//   solution  9 numbers, row by row (cell i = row * 3 + col)
//   rowOps    rowOps[r] = [op between columns 0-1, op between 1-2]
//   colOps    colOps[c] = [op between rows 0-1, op between 1-2]
//   rowRes    result of each row, colRes of each column
//   givens    cells shown from the start
//   level     "easy" | "medium" | "hard"
// Ops are "+", "-", "*", "/".
//
// Every generated puzzle has exactly one solution and can be solved
// without guessing: deduce() - which only uses "this calculation can't
// work with that number here" and "each number exactly once" - fills
// the whole grid from the givens.

const MathCrossCore = (function () {
  const OPS = ["+", "-", "*", "/"];
  // Easy: plus and minus, 4 numbers given. Medium: also times, 3 given.
  // Hard: all four, at least one division, 2 given. More only when
  // deduction needs them (never more than six).
  const LEVELS = {
    easy: { ops: ["+", "-"], givens: 4 },
    medium: { ops: ["+", "-", "*"], givens: 3, need: "*" },
    hard: { ops: ["+", "-", "*", "/"], givens: 2, need: "/" }
  };
  // The three cells of each line: rows 0-2, then columns 0-2.
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8]];

  function apply(a, op, b) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 && a % b === 0 ? a / b : NaN;
      default: return NaN;
    }
  }

  // Left to right; NaN when an intermediate result or the result is not
  // a whole number greater than 0.
  function evalLine(x, op1, y, op2, z) {
    const first = apply(x, op1, y);
    if (!(first >= 1) || first !== Math.floor(first)) return NaN;
    const r = apply(first, op2, z);
    if (!(r >= 1) || r !== Math.floor(r)) return NaN;
    return r;
  }

  function lineOps(p, li) {
    return li < 3 ? p.rowOps[li] : p.colOps[li - 3];
  }

  function lineRes(p, li) {
    return li < 3 ? p.rowRes[li] : p.colRes[li - 3];
  }

  function shuffle(arr, random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Does every line of the grid (9 numbers) give its result?
  function isSolution(p, grid) {
    for (let li = 0; li < 6; li++) {
      const c = LINES[li], ops = lineOps(p, li);
      if (evalLine(grid[c[0]], ops[0], grid[c[1]], ops[1], grid[c[2]]) !== lineRes(p, li)) return false;
    }
    return new Set(grid).size === 9 && grid.every((v) => v >= 1 && v <= 9);
  }

  // Number of solutions with the givens fixed, counting up to `limit`.
  // Rows are filled one by one, each only with triples that give its
  // result; the columns are checked at the end.
  function countSolutions(p, givens, limit) {
    const lim = limit || 2;
    const fixed = {};
    (givens || []).forEach((i) => { fixed[i] = p.solution[i]; });
    const grid = new Array(9).fill(0), used = new Array(10).fill(false);
    let count = 0;
    function row(r) {
      if (count >= lim) return;
      if (r === 3) {
        if (isSolution(p, grid)) count++;
        return;
      }
      const ops = p.rowOps[r];
      for (let a = 1; a <= 9; a++) {
        const ia = r * 3;
        if (used[a] || (fixed[ia] !== undefined && fixed[ia] !== a)) continue;
        used[a] = true; grid[ia] = a;
        for (let b = 1; b <= 9; b++) {
          if (used[b] || (fixed[ia + 1] !== undefined && fixed[ia + 1] !== b)) continue;
          used[b] = true; grid[ia + 1] = b;
          for (let c = 1; c <= 9; c++) {
            if (used[c] || (fixed[ia + 2] !== undefined && fixed[ia + 2] !== c)) continue;
            if (evalLine(a, ops[0], b, ops[1], c) !== p.rowRes[r]) continue;
            used[c] = true; grid[ia + 2] = c;
            row(r + 1);
            used[c] = false;
            if (count >= lim) break;
          }
          used[b] = false;
          if (count >= lim) break;
        }
        used[a] = false;
        if (count >= lim) break;
      }
    }
    row(0);
    return count;
  }

  // Deduction without guessing. Candidates per cell (the known numbers
  // fixed); repeated until nothing changes:
  //  - a number stays possible in a cell only if the cell's row and its
  //    column can each still be completed with it (different numbers,
  //    from the other cells' candidates);
  //  - a cell with one candidate keeps it, no other cell may have it;
  //  - a number possible in only one cell goes there.
  // Returns { cand, solved, steps }.
  function deduce(p, known) {
    const cand = [];
    for (let i = 0; i < 9; i++) cand.push(known[i] ? [known[i]] : [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let steps = 0, changed = true;
    function setOnly(i, v) {
      if (cand[i].length === 1 && cand[i][0] === v) return false;
      cand[i] = [v];
      return true;
    }
    while (changed) {
      changed = false;
      steps++;
      // Singles: a fixed number leaves every other cell.
      for (let i = 0; i < 9; i++) {
        if (cand[i].length !== 1) continue;
        for (let j = 0; j < 9; j++) {
          if (j === i) continue;
          const k = cand[j].indexOf(cand[i][0]);
          if (k !== -1) { cand[j].splice(k, 1); changed = true; }
        }
      }
      // Lines: keep only numbers that some completion of the line uses.
      for (let li = 0; li < 6; li++) {
        const c = LINES[li], ops = lineOps(p, li), res = lineRes(p, li);
        const keep = [new Set(), new Set(), new Set()];
        cand[c[0]].forEach((x) => cand[c[1]].forEach((y) => {
          if (y === x) return;
          cand[c[2]].forEach((z) => {
            if (z === x || z === y) return;
            if (evalLine(x, ops[0], y, ops[1], z) === res) { keep[0].add(x); keep[1].add(y); keep[2].add(z); }
          });
        }));
        for (let k = 0; k < 3; k++) {
          const before = cand[c[k]].length;
          cand[c[k]] = cand[c[k]].filter((v) => keep[k].has(v));
          if (cand[c[k]].length !== before) changed = true;
        }
      }
      // Each number once: a number with only one possible cell goes there.
      for (let v = 1; v <= 9; v++) {
        const where = [];
        for (let i = 0; i < 9; i++) if (cand[i].indexOf(v) !== -1) where.push(i);
        if (where.length === 1 && setOnly(where[0], v)) changed = true;
      }
      if (cand.some((cs) => cs.length === 0)) break;
    }
    const solved = cand.every((cs, i) => cs.length === 1 && cs[0] === p.solution[i]);
    return { cand, solved, steps };
  }

  function knownFrom(p, givens) {
    const known = new Array(9).fill(0);
    givens.forEach((i) => { known[i] = p.solution[i]; });
    return known;
  }

  function solvableBy(p, givens) {
    return deduce(p, knownFrom(p, givens)).solved;
  }

  // A random grid with operators from the level whose six lines all work
  // out (whole numbers above 0 throughout).
  function randomLayout(cfg, random) {
    for (let tries = 0; tries < 2000; tries++) {
      const sol = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
      const pick = () => cfg.ops[Math.floor(random() * cfg.ops.length)];
      const p = { solution: sol, rowOps: [], colOps: [], rowRes: [], colRes: [] };
      for (let k = 0; k < 3; k++) { p.rowOps.push([pick(), pick()]); p.colOps.push([pick(), pick()]); }
      let ok = true;
      for (let li = 0; li < 6 && ok; li++) {
        const c = LINES[li], ops = lineOps(p, li);
        const r = evalLine(sol[c[0]], ops[0], sol[c[1]], ops[1], sol[c[2]]);
        if (!(r >= 1)) ok = false;
        else if (li < 3) p.rowRes.push(r);
        else p.colRes.push(r);
      }
      if (!ok) continue;
      if (cfg.need && !p.rowOps.concat(p.colOps).some((o) => o.indexOf(cfg.need) !== -1)) continue;
      return p;
    }
    return null;
  }

  // A new puzzle: the fewest givens (found by adding, then trying to take
  // each away again) with which deduce() solves it, topped up to the
  // level's number of givens.
  function generatePuzzle(level, rng) {
    const random = rng || Math.random;
    const lv = LEVELS[level] ? level : "easy";
    const cfg = LEVELS[lv];
    for (let attempt = 0; attempt < 200; attempt++) {
      const p = randomLayout(cfg, random);
      if (!p) continue;
      const order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], random);
      let givens = [];
      for (const i of order) {
        if (solvableBy(p, givens)) break;
        givens.push(i);
      }
      if (!solvableBy(p, givens)) continue;
      shuffle(givens, random).forEach((i) => {
        const fewer = givens.filter((g) => g !== i);
        if (solvableBy(p, fewer)) givens = fewer;
      });
      p.needed = givens.length;
      const rest = order.filter((i) => givens.indexOf(i) === -1);
      givens = givens.concat(rest.slice(0, Math.max(0, cfg.givens - givens.length)));
      // Never more than six numbers given: three cells are always left.
      if (givens.length > 6) continue;
      p.givens = givens.sort((a, b) => a - b);
      p.level = lv;
      return p;
    }
    return null;
  }

  // The hint: a wrong entry first ({ kind: "wrong", cell }); otherwise an
  // empty cell that deduction from the correct entries fixes
  // ({ kind: "fill", cell, value }), or { kind: "done" }.
  function findHint(p, entries) {
    for (let i = 0; i < 9; i++) if (entries[i] && entries[i] !== p.solution[i]) return { kind: "wrong", cell: i };
    const known = new Array(9).fill(0);
    p.givens.forEach((i) => { known[i] = p.solution[i]; });
    for (let i = 0; i < 9; i++) if (entries[i]) known[i] = entries[i];
    const empty = [];
    for (let i = 0; i < 9; i++) if (!known[i]) empty.push(i);
    if (!empty.length) return { kind: "done" };
    const d = deduce(p, known);
    const sure = empty.filter((i) => d.cand[i].length === 1);
    const cell = sure.length ? sure[0] : empty[0];
    return { kind: "fill", cell, value: p.solution[cell] };
  }

  return { OPS, LEVELS, LINES, apply, evalLine, isSolution, countSolutions, deduce, solvableBy, generatePuzzle, findHint, lineOps, lineRes };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MathCrossCore;
}
if (typeof window !== "undefined") {
  window.MathCrossCore = MathCrossCore;
}
