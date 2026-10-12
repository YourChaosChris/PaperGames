// tests/loosen-core.js
// "Loosen the Rings": 500 generated puzzles per level.
//
// Checks: the level's number of rings, one connected group, no square of
// four (a closed loop could never come apart), on Hard at least one ring
// hooked to three others; no ring free at the start. Solvable in the
// stored fewest moves: following the solver's first move again and again
// clears the field in exactly that many moves, every move legal (only
// free rings are taken out). For the first 40 puzzles per level a second,
// independent breadth-first search written here confirms the fewest
// moves. A random player (taps a random ring: takes it out if free,
// otherwise turns it a random way) is counted as failing when the field
// is not clear after twice the fewest moves; on Hard it has to fail in
// most tries (20 tries per puzzle, the share is printed). Turning a ring
// turns its hooked neighbours the other way.
//
// Run: node tests/loosen-core.js

const C = require("../loosen-core.js");

const PER = 500;
const fails = [];
const stats = {};

// Independent search: states as strings, moves as in the rules text.
function ownBest(p) {
  const n = p.cells.length;
  const nb = p.cells.map(([x, y]) => p.cells.map(([u, v], j) => [j, u - x, v - y]).filter(([, dx, dy]) => Math.abs(dx) + Math.abs(dy) === 1));
  const under = { "1,0": 0, "0,1": 1, "-1,0": 2, "0,-1": 3 };
  const key = (pr, g) => pr.map((x, i) => (x ? g[i] : "-")).join("");
  let frontier = [[p.cells.map(() => true), p.gaps.slice()]];
  const seen = new Set([key(frontier[0][0], frontier[0][1])]);
  for (let d = 0; d < 60; d++) {
    const next = [];
    for (const [pr, g] of frontier) {
      if (pr.every((x) => !x)) return d;
      for (let i = 0; i < n; i++) {
        if (!pr[i]) continue;
        const free = nb[i].every(([j, dx, dy]) => !pr[j] || g[i] === under[dx + "," + dy]);
        const cand = [];
        if (free) { const p2 = pr.slice(); p2[i] = false; cand.push([p2, g.slice()]); }
        for (const dir of [1, -1]) {
          const g2 = g.slice();
          g2[i] = (g2[i] + dir + 4) % 4;
          nb[i].forEach(([j]) => { if (pr[j]) g2[j] = (g2[j] - dir + 4) % 4; });
          cand.push([pr.slice(), g2]);
        }
        for (const [p2, g2] of cand) {
          const k = key(p2, g2);
          if (!seen.has(k)) { seen.add(k); next.push([p2, g2]); }
        }
      }
    }
    frontier = next;
  }
  return -1;
}

function check(p, lv, seed) {
  const cfg = C.LEVELS[lv];
  const tag = lv + " #" + seed;
  const n = p.cells.length;
  if (n < cfg.rings[0] || n > cfg.rings[1]) return tag + ": " + n + " rings";
  const has = (x, y) => p.cells.some(([u, v]) => u === x && v === y);
  if (p.cells.some(([x, y]) => has(x + 1, y) && has(x, y + 1) && has(x + 1, y + 1))) return tag + ": square of four";
  // connected
  const seen = new Set([0]), st = [0];
  const L = C.links(p);
  while (st.length) { const i = st.pop(); L[i].forEach(([j]) => { if (!seen.has(j)) { seen.add(j); st.push(j); } }); }
  if (seen.size !== n) return tag + ": not one group";
  if (cfg.extra && !L.some((l) => l.length >= 3)) return tag + ": no ring hooked to three";
  let s = C.startState(p);
  if (p.cells.some((c, i) => C.isFree(p, s, i))) return tag + ": a ring is free at the start";
  if (p.best < cfg.best[0] || p.best > cfg.best[1]) return tag + ": fewest moves " + p.best;
  // Follow the solver.
  let moves = 0;
  while (!C.solved(s) && moves < 100) {
    const r = C.solve(p, s);
    if (!r || !r.move) return tag + ": solver found nothing";
    if (r.moves !== p.best - moves) return tag + ": solver says " + r.moves + " left after " + moves + " moves";
    const m = r.move;
    if (m.type === "out") {
      if (!C.isFree(p, s, m.ring)) return tag + ": solver takes out a ring that is not free";
      s = C.remove(s, m.ring);
    } else {
      const before = s;
      s = C.turn(p, s, m.ring, m.dir);
      // the turned ring moved by dir, hooked present neighbours by -dir
      if (s.gaps[m.ring] !== (before.gaps[m.ring] + m.dir + 4) % 4) return tag + ": turn wrong";
      for (const [j] of L[m.ring]) if (before.present[j] && s.gaps[j] !== (before.gaps[j] - m.dir + 4) % 4) return tag + ": neighbour did not turn back";
    }
    moves++;
  }
  if (!C.solved(s) || moves !== p.best) return tag + ": cleared in " + moves + ", fewest " + p.best;
  if (seed <= 40) {
    const own = ownBest(p);
    if (own !== p.best) return tag + ": own search finds " + own + ", stored " + p.best;
  }
  const stt = stats[lv] || (stats[lv] = { rings: [], best: [], fail: 0, tries: 0 });
  stt.rings.push(n);
  stt.best.push(p.best);
  const random = C.makeRng(seed * 31 + n);
  for (let t = 0; t < 20; t++) { stt.tries++; if (C.randomPlayFails(p, 2 * p.best, random)) stt.fail++; }
  return null;
}

const t0 = Date.now();
for (const lv of Object.keys(C.LEVELS)) {
  for (let seed = 1; seed <= PER; seed++) {
    const err = check(C.generatePuzzle(lv, C.makeRng(seed * 7907 + lv.length)), lv, seed);
    if (err) fails.push(err);
  }
}
const range = (a) => Math.min.apply(null, a) + "-" + Math.max.apply(null, a) + " (average " + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + ")";
Object.keys(stats).forEach((lv) => {
  const s = stats[lv], rate = s.fail / s.tries;
  console.log(lv + ": " + PER + " puzzles, rings " + range(s.rings) + ", fewest moves " + range(s.best) + ", solved in exactly that many; random player fails (not clear after twice the fewest moves) in " + s.fail + " of " + s.tries + " tries (" + (100 * rate).toFixed(1) + " %)");
  if (lv === "hard" && rate <= 0.5) fails.push("hard: random player fails in only " + (100 * rate).toFixed(1) + " %");
});
console.log("time " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== LOOSEN CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== LOOSEN CORE: 0 failures ===");
