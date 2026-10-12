// tests/arrows-core.js
// "Arrows" (Pfeile): 500 generated puzzles per level.
//
// Checks: every arrow lies on the field, its cells are neighbours in a
// line without overlap, a line of two or more cells points the way of its
// last step; the level's field size and arrow lengths; no two arrows on
// the same cell. Solvable: following the hint from the start clears the
// field, every hinted arrow can really leave, and it takes exactly as
// many moves as minMoves() says (the number of arrows - no puzzle can be
// done in fewer, since every arrow must leave once). The nesting (rounds
// of "all free arrows leave") reaches the level's minimum. A blocked
// arrow is reported with the arrow in its way.
//
// Run: node tests/arrows-core.js

const A = require("../arrows-core.js");

const PER = 500;
const fails = [];
const stats = {};

function check(p, lv, seed) {
  const cfg = A.LEVELS[lv];
  const tag = lv + " #" + seed;
  if (p.rows !== cfg.rows || p.cols !== cfg.cols) return tag + ": field " + p.rows + " x " + p.cols;
  const seen = {};
  for (const a of p.arrows) {
    if (a.cells.length < cfg.minLen || a.cells.length > cfg.maxLen) return tag + ": arrow of " + a.cells.length + " cells";
    for (let j = 0; j < a.cells.length; j++) {
      const i = a.cells[j];
      if (i < 0 || i >= p.rows * p.cols) return tag + ": cell off the field";
      if (seen[i]) return tag + ": two arrows on cell " + i;
      seen[i] = true;
      if (j > 0) {
        const prev = a.cells[j - 1];
        const dr = Math.floor(i / p.cols) - Math.floor(prev / p.cols), dc = i % p.cols - prev % p.cols;
        if (Math.abs(dr) + Math.abs(dc) !== 1) return tag + ": cells not neighbours";
        if (j === a.cells.length - 1 && (A.DR[a.dir] !== dr || A.DC[a.dir] !== dc)) return tag + ": head points the wrong way";
      }
    }
  }
  const r = A.rounds(p);
  if (r < 0) return tag + ": cannot be cleared";
  if (r < cfg.rounds) return tag + ": only " + r + " rounds";
  // Play it with the hint alone.
  const present = p.arrows.map(() => true);
  let moves = 0;
  for (;;) {
    if (!present.some(Boolean)) break;
    const k = A.findHint(p, present);
    if (k < 0) return tag + ": hint found nothing with " + present.filter(Boolean).length + " arrows left";
    const occ = A.occupancy(p, present);
    if (!A.canLeave(p, occ, k)) return tag + ": hinted arrow cannot leave";
    present[k] = false;
    moves++;
  }
  if (moves !== A.minMoves(p) || moves !== p.arrows.length) return tag + ": " + moves + " moves, minMoves " + A.minMoves(p);
  // Blocked arrows name the arrow in their way.
  const all = p.arrows.map(() => true), occ = A.occupancy(p, all);
  for (let k = 0; k < p.arrows.length; k++) {
    if (!A.canLeave(p, occ, k)) {
      const b = A.blocker(p, occ, k);
      if (b < 0 || b === undefined) return tag + ": blocked arrow without blocker";
      if (!A.rayCells(p, p.arrows[k]).some((i) => occ[i] === b)) return tag + ": blocker not in the way";
    }
  }
  const s = stats[lv] || (stats[lv] = { arrows: [], rounds: [] });
  s.arrows.push(p.arrows.length);
  s.rounds.push(r);
  return null;
}

const t0 = Date.now();
for (const lv of Object.keys(A.LEVELS)) {
  for (let seed = 1; seed <= PER; seed++) {
    const err = check(A.generatePuzzle(lv, A.makeRng(seed * 7919 + lv.length)), lv, seed);
    if (err) fails.push(err);
  }
}
const range = (a) => Math.min.apply(null, a) + "-" + Math.max.apply(null, a) + " (average " + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + ")";
Object.keys(stats).forEach((lv) => console.log(lv + ": " + PER + " puzzles, arrows " + range(stats[lv].arrows) + ", rounds " + range(stats[lv].rounds) + ", solved with the hint in the fewest moves"));
console.log("time " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== ARROWS CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== ARROWS CORE: 0 failures ===");
