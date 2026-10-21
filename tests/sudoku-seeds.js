// sudoku-seeds.js test
// Sudoku and Killer Sudoku: the same seed must give the same puzzle, also
// after the solvers are made faster (Aufgabe 104). Generates puzzles for
// all levels from fixed seeds, checks that each has exactly one solution,
// and compares a fingerprint of all of them with the one the generators
// gave before the speed-up (v258).
//   node tests/sudoku-seeds.js [repoDir]   (repoDir: another checkout)
const path = require("path");
const crypto = require("crypto");
const root = process.argv[2] || path.join(__dirname, "..");
const SudokuCore = require(path.join(root, "sudoku-core.js"));
global.SudokuCore = SudokuCore;
const KillerSudokuCore = require(path.join(root, "killersudoku-core.js"));

const EXPECTED = "5e2ad8fc08c803b2";
const PER = 20;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const fails = [];
const hash = crypto.createHash("sha256");
let total = 0;
for (const [name, core] of [["sudoku", SudokuCore], ["killer", KillerSudokuCore]]) {
  for (const level of ["easy", "medium", "hard"]) {
    for (let k = 1; k <= PER; k++) {
      total++;
      const p = core.generatePuzzle(level, rng(k * 7919 + level.length));
      hash.update(name + level + k + JSON.stringify(p));
      const n = name === "sudoku" ? SudokuCore.countSolutions(p.puzzle, 2) : KillerSudokuCore.countSolutions(p.cages, p.givens, 2);
      if (n !== 1) fails.push(`${name} ${level} #${k}: ${n} solutions instead of 1`);
    }
  }
}
const got = hash.digest("hex").slice(0, 16);
if (got !== EXPECTED) fails.push(`fingerprint ${got}, expected ${EXPECTED}: the same seeds give different puzzles`);
fails.forEach((f) => console.log("FAIL " + f));
console.log(`\n=== SUDOKU SEEDS: ${total} puzzles from fixed seeds, fingerprint ${got}, ${fails.length} failures ===`);
process.exit(fails.length ? 1 : 0);
