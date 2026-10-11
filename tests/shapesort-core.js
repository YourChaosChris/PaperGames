// shapesort-core.js test
// "Shape Sort": for every number of stones per tube (4, 6, 8, 10) and
// every level, deals 200 puzzles from fixed seeds and checks that each
// one has the right stones, starts with no finished tube and two empty
// ones, is dealt in under a second and is solved by its own solution.
// 50 of them per combination are played to the end with the hint only,
// 10 more after a few random moves first (then the hint either finishes
// the puzzle or the solver confirms there is no way out). Also: a tube is
// finished only when it is full with one shape, and old calls without a
// stone count still mean 4.
const path = require("path");
const C = require(path.join(__dirname, "..", "shapesort-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function playHints(tubes, plan, cap) {
  let t = tubes;
  for (let i = 0; i < 1000; i++) {
    const h = C.findHint(t, plan, cap);
    if (h.kind === "done") return { ok: C.isSolved(t, cap) };
    if (h.kind !== "move") return { ok: false, stuck: true };
    const next = C.applyMove(t, h.from, h.to, cap);
    if (!next) return { ok: false };
    t = next; plan = h.plan;
  }
  return { ok: false };
}

const PER = 200, HINTED = 50, RANDOM = 10;
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
let total = 0, hinted = 0, slowest = 0;
const stats = [];

// Fixed examples: winning needs full tubes of one shape.
check("4 equal stones finish a tube of 4", C.isComplete([1, 1, 1, 1], 4));
check("4 equal stones do not finish a tube of 6", !C.isComplete([1, 1, 1, 1], 6));
check("6 equal stones finish a tube of 6", C.isComplete([2, 2, 2, 2, 2, 2], 6));
check("10 equal stones finish a tube of 10", C.isComplete([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10));
check("not solved with a tube of 5 in cap 10", !C.isSolved([[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], []], 10));
check("solved with full tubes and empty ones", C.isSolved([[0, 0, 0, 0, 0, 0], [], [1, 1, 1, 1, 1, 1]], 6));
check("no stone count means 4", C.isComplete([3, 3, 3, 3]) && C.capOf(undefined) === 4 && C.capOf(7) === 4);
check("a full tube of 6 takes no more", !C.canMove([[1], [1, 1, 1, 1, 1, 1]], 0, 1, 6));
check("a tube of 6 with 4 stones still takes one", C.canMove([[1], [1, 1, 1, 1]], 0, 1, 6));
check("move carries the run, as many as fit", C.moveCount([[2, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], 0, 1, 10) === 2);

for (const cap of C.CAPACITIES) {
  for (const level of ["easy", "medium", "hard"]) {
    const cfg = C.LEVELS[level];
    let worst = 0, moves = 0;
    for (let k = 1; k <= PER; k++) {
      total++;
      const tag = cap + " stones, " + level + " #" + k;
      const r = rng(k * 97 + level.length * 7 + cap * 1009);
      const t0 = Date.now();
      const p = C.generatePuzzle(level, r, cap);
      const dt = Date.now() - t0;
      worst = Math.max(worst, dt);
      if (dt >= 1000) fails.push(tag + ": dealt in " + dt + " ms");
      if (!p) { fails.push(tag + ": no puzzle"); continue; }
      if (p.cap !== cap || p.tubes.length !== cfg.tubes || C.stoneCount(p.tubes) !== cfg.shapes * cap) { fails.push(tag + ": wrong stones"); continue; }
      const counts = new Array(cfg.shapes).fill(0);
      p.tubes.forEach((t) => t.forEach((s) => counts[s]++));
      if (counts.some((n) => n !== cap)) { fails.push(tag + ": not " + cap + " of each shape"); continue; }
      if (p.tubes.filter((t) => !t.length).length !== 2 || p.tubes.some((t) => t.length && t.length !== cap) || p.tubes.some((t) => C.isComplete(t, cap))) { fails.push(tag + ": bad start"); continue; }
      let t = p.tubes;
      for (const m of p.solution) { t = t && C.applyMove(t, m.from, m.to, cap); }
      if (!t || !C.isSolved(t, cap)) { fails.push(tag + ": solution does not solve"); continue; }
      moves += p.solution.length;
      if (k <= HINTED) {
        hinted++;
        // Half with the deal's plan (as the page does), half from nothing.
        const plan = k % 2 ? C.makePlan(p.tubes, p.solution, cap) : null;
        if (!playHints(p.tubes, plan, cap).ok) fails.push(tag + ": hint-only play failed");
      }
      if (k > HINTED && k <= HINTED + RANDOM) {
        let u = p.tubes;
        for (let i = 0; i < 6; i++) {
          const opts = [];
          for (let a = 0; a < u.length; a++) for (let b = 0; b < u.length; b++) if (C.canMove(u, a, b, cap)) opts.push([a, b]);
          if (!opts.length) break;
          const o = opts[Math.floor(r() * opts.length)];
          u = C.applyMove(u, o[0], o[1], cap);
        }
        const res = playHints(u, null, cap);
        if (!res.ok && !(res.stuck && C.solve(u, 2000000, cap) === null)) fails.push(tag + ": hint after random moves failed");
      }
    }
    slowest = Math.max(slowest, worst);
    stats.push(cap + "/" + level + ": slowest deal " + worst + " ms, solution " + (moves / PER).toFixed(1) + " moves on average");
  }
}
stats.forEach((s) => console.log(s));
fails.slice(0, 30).forEach((f) => console.log("FAIL " + f));
console.log("\n=== SHAPE SORT CORE: " + total + " puzzles (" + PER + " per stone count and level), " + hinted + " solved by hint only, slowest deal " + slowest + " ms, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
