// tests/mathcross-core.js
// "Math Cross" (Rechenkreuz): 500 generated puzzles per level.
//
// Checks: the solution uses 1-9 once each and every row and column gives
// its result, worked out from left to right with whole numbers above 0
// throughout; only the level's operators appear (Medium at least one x,
// Hard at least one division); exactly one solution with the givens;
// deduce() (no guessing) fills the grid from the givens; 4 (Easy) /
// 3 (Medium) / 2 (Hard) givens, more only when needed, at most six;
// solving with the hint alone fills every cell correctly, a wrong entry
// is reported first. Fixed examples of the left-to-right rule.
//
// Run: node tests/mathcross-core.js

const C = require("../mathcross-core.js");

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER_LEVEL = 500;
const fails = [];
const stats = {};

// Left to right, no "times before plus": 3 + 4 x 2 = 14; 9 - 2 - 7 is not
// allowed (0); 7 / 2 is not allowed (not whole).
if (C.evalLine(3, "+", 4, "*", 2) !== 14) fails.push("3 + 4 x 2 should be 14");
if (!isNaN(C.evalLine(9, "-", 2, "-", 7))) fails.push("9 - 2 - 7 = 0 should not be allowed");
if (!isNaN(C.evalLine(7, "/", 2, "+", 1))) fails.push("7 / 2 should not be allowed");
if (C.evalLine(8, "/", 4, "*", 3) !== 6) fails.push("8 / 4 x 3 should be 6");

for (const level of Object.keys(C.LEVELS)) {
  const cfg = C.LEVELS[level];
  const st = stats[level] = { givens: 0, min: 9, max: 0, needed: 0, ops: {} };
  for (let seed = 1; seed <= PER_LEVEL; seed++) {
    const tag = level + " #" + seed;
    const p = C.generatePuzzle(level, rng(seed * 101 + level.length));
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    if (!C.isSolution(p, p.solution)) { fails.push(tag + ": solution does not work"); continue; }
    const ops = p.rowOps.concat(p.colOps).reduce((a, b) => a.concat(b), []);
    if (ops.some((o) => cfg.ops.indexOf(o) === -1)) fails.push(tag + ": operator outside the level");
    if (cfg.need && ops.indexOf(cfg.need) === -1) fails.push(tag + ": no " + cfg.need);
    ops.forEach((o) => { st.ops[o] = (st.ops[o] || 0) + 1; });
    if (C.countSolutions(p, p.givens, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
    if (!C.solvableBy(p, p.givens)) { fails.push(tag + ": not solvable without guessing"); continue; }
    if (p.givens.length > 6) fails.push(tag + ": more than six givens");
    if (p.givens.length !== Math.max(cfg.givens, p.needed)) fails.push(tag + ": " + p.givens.length + " givens, needed " + p.needed);
    st.givens += p.givens.length; st.needed += p.needed;
    st.min = Math.min(st.min, p.givens.length); st.max = Math.max(st.max, p.givens.length);
    // Hint only.
    const entries = new Array(9).fill(0);
    const free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => p.givens.indexOf(i) === -1);
    entries[free[0]] = p.solution[free[0]] === 9 ? 1 : p.solution[free[0]] + 1;
    const w = C.findHint(p, entries);
    if (w.kind !== "wrong" || w.cell !== free[0]) fails.push(tag + ": wrong entry not reported");
    entries[free[0]] = 0;
    let guard = 0, h;
    while ((h = C.findHint(p, entries)).kind === "fill" && guard++ < 20) {
      if (h.value !== p.solution[h.cell] || p.givens.indexOf(h.cell) !== -1 || entries[h.cell]) { fails.push(tag + ": bad hint"); break; }
      entries[h.cell] = h.value;
    }
    if (h.kind !== "done" || free.some((i) => entries[i] !== p.solution[i])) fails.push(tag + ": hint play did not finish");
  }
}

Object.keys(stats).forEach((lv) => {
  const st = stats[lv];
  console.log(lv + ": givens on average " + (st.givens / PER_LEVEL).toFixed(2) + " (" + st.min + "-" + st.max + "), needed on average " + (st.needed / PER_LEVEL).toFixed(2) + ", operators " + JSON.stringify(st.ops));
});
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== MATH CROSS CORE: " + (PER_LEVEL * 3) + " puzzles (500 per level), " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
