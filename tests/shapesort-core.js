// shapesort-core.js test
// "Shape Sort": deals puzzles for every level from fixed seeds and checks
// that each one has the right stones, starts with no finished tube and
// two empty ones, is solved by its own solution, and can be played to the
// end with the hint only - also after a few random moves first.
const path = require("path");
const C = require(path.join(__dirname, "..", "shapesort-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function playHints(tubes, plan) {
  let t = tubes;
  for (let i = 0; i < 400; i++) {
    const h = C.findHint(t, plan);
    if (h.kind === "done") return { ok: true };
    if (h.kind !== "move") return { ok: false, stuck: true };
    const next = C.applyMove(t, h.from, h.to);
    if (!next) return { ok: false };
    t = next; plan = h.plan;
  }
  return { ok: false };
}

const PER = 40;
const fails = [];
let total = 0;
for (const level of ["easy", "medium", "hard"]) {
  const cfg = C.LEVELS[level];
  for (let k = 1; k <= PER; k++) {
    total++;
    const tag = level + " #" + k;
    const r = rng(k * 97 + level.length * 7);
    const p = C.generatePuzzle(level, r);
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    if (p.tubes.length !== cfg.tubes || C.stoneCount(p.tubes) !== cfg.shapes * C.CAPACITY) { fails.push(tag + ": wrong stones"); continue; }
    if (p.tubes.filter((t) => !t.length).length !== 2 || p.tubes.some(C.isComplete)) { fails.push(tag + ": bad start"); continue; }
    let t = p.tubes;
    for (const m of p.solution) { t = t && C.applyMove(t, m.from, m.to); }
    if (!t || !C.isSolved(t)) { fails.push(tag + ": solution does not solve"); continue; }
    if (!playHints(p.tubes, C.makePlan(p.tubes, p.solution)).ok) { fails.push(tag + ": hint-only play failed"); continue; }
    // A few random legal moves, then hints from there: either they finish
    // the puzzle or the solver confirms there is no way out.
    let u = p.tubes;
    for (let i = 0; i < 6; i++) {
      const opts = [];
      for (let a = 0; a < u.length; a++) for (let b = 0; b < u.length; b++) if (C.canMove(u, a, b)) opts.push([a, b]);
      if (!opts.length) break;
      const o = opts[Math.floor(r() * opts.length)];
      u = C.applyMove(u, o[0], o[1]);
    }
    const res = playHints(u, null);
    if (!res.ok && !(res.stuck && C.solve(u, 2000000) === null)) fails.push(tag + ": hint after random moves failed");
  }
}
fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== SHAPE SORT CORE: " + total + " puzzles, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
