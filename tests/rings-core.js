// tests/rings-core.js
// "Turn the Rings" (Ringe drehen): 500 generated puzzles per level.
//
// Checks: the level's number of rings (3 / 4 / 5), every ring with 8
// fields, the number of different shapes (4 / 6 / 8), coupling only on
// Hard; the pattern of rays has no turned copy of itself; the start is not
// solved. Fewest moves: the stored number lies in the level's range
// (3-5 / 5-8 / 7-11), and an independent breadth-first search forwards
// from the start (written here, not taken from rings-core.js) finds the
// same number; following the hint from the start solves the puzzle in
// exactly that many moves. Turning left undoes turning right, also for
// coupled rings.
//
// Run: node tests/rings-core.js

const R = require("../rings-core.js");

const PER = 500;
const fails = [];
const stats = {};

// Forward search from the start until the first solved state.
function bfsMin(p, start) {
  const n = p.rings.length;
  const key = (o) => o.join("");
  const seen = new Set([key(start)]);
  let layer = [start], d = 0;
  while (layer.length) {
    for (const o of layer) {
      let ok = true;
      for (let j = 0; j < 8 && ok; j++) {
        const s = p.rings[0][(j - o[0] + 8) % 8];
        for (let k = 1; k < n; k++) if (p.rings[k][(j - o[k] + 8) % 8] !== s) { ok = false; break; }
      }
      if (ok) return d;
    }
    const next = [];
    for (const o of layer) {
      for (let k = 0; k < n; k++) {
        for (const dir of [1, 7]) {
          const m = o.slice();
          m[k] = (m[k] + dir) % 8;
          if (p.coupled && k + 1 < n) m[k + 1] = (m[k + 1] + dir) % 8;
          const kk = key(m);
          if (!seen.has(kk)) { seen.add(kk); next.push(m); }
        }
      }
    }
    layer = next;
    d++;
  }
  return -1;
}

function check(p, lv, seed) {
  const cfg = R.LEVELS[lv];
  const tag = lv + " #" + seed;
  if (p.rings.length !== cfg.rings) return tag + ": " + p.rings.length + " rings";
  if (p.coupled !== cfg.coupled) return tag + ": coupling wrong";
  if (p.rings.some((r) => r.length !== 8)) return tag + ": ring without 8 fields";
  const kinds = new Set(p.rings[0]);
  if (kinds.size !== cfg.shapes) return tag + ": " + kinds.size + " shapes";
  for (const s of kinds) if (R.SHAPES.indexOf(s) < 0) return tag + ": unknown shape " + s;
  for (let s = 1; s < 8; s++) if (p.rings[0].every((x, j) => x === p.rings[0][(j + s) % 8])) return tag + ": symmetric pattern";
  if (R.isSolved(p, p.start)) return tag + ": starts solved";
  if (p.min < cfg.minMoves || p.min > cfg.maxMoves) return tag + ": " + p.min + " moves";
  if (R.minMoves(p, p.start) !== p.min) return tag + ": minMoves disagrees";
  const ind = bfsMin(p, p.start);
  if (ind !== p.min) return tag + ": independent search finds " + ind + ", stored " + p.min;
  for (let k = 0; k < p.rings.length; k++) {
    if (R.turn(p, R.turn(p, p.start, k, 1), k, -1).join() !== p.start.join()) return tag + ": left does not undo right";
  }
  let off = p.start, moves = 0;
  while (!R.isSolved(p, off)) {
    const h = R.findHint(p, off);
    if (!h) return tag + ": no hint while unsolved";
    off = R.turn(p, off, h.ring, h.dir);
    if (++moves > 30) return tag + ": hint goes in circles";
  }
  if (moves !== p.min) return tag + ": hint needs " + moves + " moves, fewest " + p.min;
  const s = stats[lv] || (stats[lv] = {});
  s[p.min] = (s[p.min] || 0) + 1;
  return null;
}

const t0 = Date.now();
for (const lv of Object.keys(R.LEVELS)) {
  for (let seed = 1; seed <= PER; seed++) {
    const err = check(R.generatePuzzle(lv, R.makeRng(seed * 104729 + lv.length)), lv, seed);
    if (err) fails.push(err);
  }
}
Object.keys(stats).forEach((lv) => console.log(lv + ": " + PER + " puzzles, fewest moves " + Object.keys(stats[lv]).map((m) => m + ": " + stats[lv][m]).join(", ") + "; independent search and hint agree"));
console.log("time " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== RINGS CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== RINGS CORE: 0 failures ===");
