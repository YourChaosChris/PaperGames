// animalsudoku-core.js test
// "Animal Sudoku": generates puzzles for both sizes and all levels from
// fixed seeds and checks that each one has exactly one solution, matches
// its solution in every given cell, can be solved with the two simple
// steps alone, and can be played to the end with the hint only (a wrong
// animal is reported first).
const path = require("path");
const C = require(path.join(__dirname, "..", "animalsudoku-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER = 60;
const fails = [];
let total = 0;
for (const n of [4, 6]) {
  for (const level of ["easy", "medium", "hard"]) {
    for (let k = 1; k <= PER; k++) {
      total++;
      const tag = n + "x" + n + " " + level + " #" + k;
      const p = C.generatePuzzle(n, level, rng(k * 31 + n * 1000 + level.length));
      if (C.countSolutions(n, p.puzzle, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
      if (p.puzzle.some((v, i) => v && v !== p.solution[i])) { fails.push(tag + ": given differs from solution"); continue; }
      if (!C.simpleSolvable(n, p.puzzle)) { fails.push(tag + ": needs more than the simple steps"); continue; }
      if (p.givens > C.GIVENS[n][level]) { fails.push(tag + ": too many givens (" + p.givens + ")"); continue; }
      const g = p.puzzle.slice();
      const e = g.indexOf(0);
      g[e] = (p.solution[e] % n) + 1;
      const h0 = C.findHint(n, g, p.solution);
      if (!((h0.kind === "conflict" && h0.cells.indexOf(e) !== -1) || (h0.kind === "wrong" && h0.cell === e))) { fails.push(tag + ": mistake not reported"); continue; }
      g[e] = 0;
      let ok = true;
      for (let t = 0; t < n * n; t++) {
        const h = C.findHint(n, g, p.solution);
        if (h.kind === "done") break;
        if (h.kind !== "step" || g[h.cell] || h.value !== p.solution[h.cell]) { ok = false; break; }
        g[h.cell] = h.value;
      }
      if (!ok || !C.isSolved(n, g, p.solution)) fails.push(tag + ": hint sequence broken");
    }
  }
}
fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== ANIMAL SUDOKU CORE: " + total + " puzzles, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
