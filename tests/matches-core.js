// tests/matches-core.js
// "Matchstick Puzzles" (Streichholzrätsel): every fixed puzzle.
//
// Checks: at least 80 puzzles, 30 per level, no puzzle twice. Sums: the
// start reads back as itself, every digit and sign valid, and is wrong.
// Squares: the start figure is the outline of its cells (each cell a
// closed square, no loose match) and does not already have the asked
// number. Every puzzle: a full search finds at least one solution with k
// moves and none with fewer; sums have exactly one solution. Following
// the hint from the start solves the puzzle in exactly k moves. The digit
// shapes: every digit reads back as itself.
//
// Run: node tests/matches-core.js

const M = require("../matches-core.js");

const fails = [];
const stats = {};
let total = 0;
const seen = new Set();

for (let d = 0; d <= 9; d++) {
  const s = d + "+0=" + d;
  if (M.readSum(s, M.sumSlots(s)) !== s) fails.push("digit " + d + " does not read back");
}

Object.keys(M.PUZZLES).forEach((lv) => {
  const list = M.PUZZLES[lv];
  if (list.length !== 30) fails.push(lv + ": " + list.length + " puzzles");
  list.forEach((p, i) => {
    total++;
    const tag = lv + " " + (i + 1) + " (" + M.RAW[lv][i] + ")";
    if (seen.has(M.RAW[lv][i])) fails.push(tag + ": twice");
    seen.add(M.RAW[lv][i]);
    const start = M.startSlots(p);
    if (p.kind === "e") {
      if (M.readSum(p.start, start) !== p.start) fails.push(tag + ": start does not read back");
      if (M.sumIsTrue(p.start)) fails.push(tag + ": start is already right");
    } else {
      const c = M.countSquares(p.w, p.h, start);
      if (c.n !== p.cells.length || c.loose) fails.push(tag + ": start figure is not its cells");
      if (c.n === p.n) fails.push(tag + ": start already has " + p.n + " squares");
    }
    if (M.isSolved(p, start)) fails.push(tag + ": solved at the start");
    const sols = M.solutions(p, p.k);
    if (!sols.length) fails.push(tag + ": no solution with " + p.k + " moves");
    if (sols.some((s) => s.moves < p.k)) fails.push(tag + ": solvable with fewer moves");
    if (p.kind === "e" && sols.length !== 1) fails.push(tag + ": " + sols.length + " solutions");
    // Play it with the hint.
    let set = start.slice(), moves = 0;
    while (!M.isSolved(p, set) && moves < 5) {
      const h = M.findHint(p, set, sols);
      if (!h) { fails.push(tag + ": no hint"); break; }
      set = set.filter((x) => x !== h.from).concat([h.to]);
      moves++;
    }
    if (!M.isSolved(p, set) || moves !== p.k || M.movedCount(p, set) > p.k) fails.push(tag + ": hint needs " + moves + " moves");
    const key = lv + " " + (p.kind === "e" ? "sums" : "squares") + ", " + p.k + " move" + (p.k > 1 ? "s" : "");
    const s = stats[key] || (stats[key] = { n: 0, sols: 0 });
    s.n++;
    s.sols += sols.length;
  });
});

Object.keys(stats).forEach((k) => console.log(k + ": " + stats[k].n + " puzzles, " + (stats[k].sols / stats[k].n).toFixed(1) + " solutions on average"));
console.log(total + " puzzles, each solvable with exactly its number of moves, solved with the hint");
if (total < 80) fails.push("only " + total + " puzzles");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== MATCHES CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== MATCHES CORE: 0 failures ===");
