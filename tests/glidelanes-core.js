// tests/glidelanes-core.js
// "Glide Lanes" (Pfeile): 500 generated puzzles per existing level, 200 for
// Grandmaster and 50 for each of the twelve picture shapes.
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
// Hard and Master (gliding arrows): 11 x 11, at most two corners per
// arrow; the solver finds a way out from the start and replaying it
// clears the field; playing with the gliding hint alone clears it too; a
// glide keeps the arrow's length, moves it forward along its way and only
// over free squares. A random player (always some arrow that can move)
// gets stuck in at least 60 % of all tries on Hard (20 tries per puzzle,
// the share is printed). Easy and Medium make the same puzzles as before.
//
// Run: node tests/glidelanes-core.js [--levels easy,medium]
// (--levels runs only those levels, so run-all.sh can spread the levels over
// several parts; the fingerprint check belongs to easy and medium.)

const A = require("../glidelanes-core.js");

const levelArg = process.argv.filter((a) => /^--levels=/.test(a))[0] || (process.argv.indexOf("--levels") > 0 ? "--levels=" + process.argv[process.argv.indexOf("--levels") + 1] : "");
const ONLY = levelArg ? levelArg.replace(/^--levels=/, "").split(",") : null;
const use = (lv) => !ONLY || ONLY.indexOf(lv) >= 0;
const PER = 500;
const GRAND_PER = 200;
const SHAPE_PER = 50;
const fails = [];
const stats = {};

function check(p, lv, seed, shape) {
  const cfg = A.LEVELS[lv];
  const tag = lv + (shape ? " (" + shape + ")" : "") + " #" + seed;
  if (p.rows !== cfg.rows || p.cols !== cfg.cols) return tag + ": field " + p.rows + " x " + p.cols;
  if (!!p.glide !== !!cfg.glide) return tag + ": glide flag wrong";
  const seen = {};
  for (const a of p.arrows) {
    if (a.cells.length < cfg.minLen || a.cells.length > cfg.maxLen) return tag + ": arrow of " + a.cells.length + " cells";
    if (cfg.maxBends !== undefined && bendsOf(p, a.cells) > cfg.maxBends) return tag + ": arrow with " + bendsOf(p, a.cells) + " corners";
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
  if (shape) {
    const mask = new Set(p.mask || []), covered = new Set(p.arrows.flatMap((a) => a.cells));
    if (!mask.size || covered.size < Math.ceil(mask.size * 0.9)) return tag + ": silhouette coverage below 90 %";
    if (Array.from(covered).some((i) => !mask.has(i))) return tag + ": an arrow cell lies outside the silhouette";
    if (p.shape !== shape || p.mask.join() !== A.maskFor(shape).join()) return tag + ": shape or mask not stored";
    // not trivial: not every arrow free at the start
    const occ0 = A.occupancy(p, p.arrows.map(() => true));
    if (p.arrows.every((_a, k) => A.canLeave(p, occ0, k))) return tag + ": every arrow is free at the start";
  }
  const r = A.rounds(p);
  if (r < 0) return tag + ": cannot be cleared";
  if (r < cfg.rounds) return tag + ": only " + r + " rounds";
  if (cfg.glide) {
    const err = checkGlide(p, lv, tag, r);
    if (err) return err;
    const statKey = shape ? lv + "/" + shape : lv;
    const s = stats[statKey] || (stats[statKey] = { arrows: [], rounds: [], free: [], puzzles: 0 });
    const initialOcc = A.occupancy(p, p.arrows.map(() => true));
    s.arrows.push(p.arrows.length);
    s.rounds.push(r);
    s.free.push(p.arrows.reduce((n, _a, k) => n + (A.canLeave(p, initialOcc, k) ? 1 : 0), 0));
    s.puzzles++;
    return null;
  }
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
  const statKey = shape ? lv + "/" + shape : lv;
  const s = stats[statKey] || (stats[statKey] = { arrows: [], rounds: [], free: [], puzzles: 0 });
  s.arrows.push(p.arrows.length);
  s.rounds.push(r);
  const initialOcc = A.occupancy(p, p.arrows.map(() => true));
  s.free.push(p.arrows.reduce((n, _a, k) => n + (A.canLeave(p, initialOcc, k) ? 1 : 0), 0));
  s.puzzles++;
  return null;
}

function bendsOf(p, cells) {
  let n = 0;
  for (let j = 2; j < cells.length; j++) {
    const d1 = cells[j - 1] - cells[j - 2], d2 = cells[j] - cells[j - 1];
    if (d1 !== d2) n++;
  }
  return n;
}

const glide = {};
function checkGlide(p, lv, tag, r) {
  const way = A.solveGlide(p, A.startPos(p));
  if (!way) return tag + ": solver finds no way out";
  let pos = A.startPos(p);
  for (const k of way) {
    const m = A.applyMove(p, pos, k);
    if (m.move.type === "blocked") return tag + ": solution taps a blocked arrow";
    if (m.move.type === "slide") {
      const before = pos[k], after = m.pos[k];
      if (after.length !== before.length) return tag + ": glide changes the length";
      const occ = A.occupancyPos(p, pos);
      const ray = A.rayCells(p, { cells: before, dir: p.arrows[k].dir });
      const newCells = after.filter((i) => before.indexOf(i) === -1);
      if (newCells.some((i) => occ[i] !== -1 || ray.indexOf(i) === -1)) return tag + ": glide over taken or wrong squares";
    }
    pos = m.pos;
  }
  if (!A.cleared(pos)) return tag + ": solution does not clear the field";
  // Hint only.
  pos = A.startPos(p);
  for (let guard = 0; guard < 500 && !A.cleared(pos); guard++) {
    const k = A.findHintGlide(p, pos);
    if (k < 0) return tag + ": gliding hint found nothing";
    pos = A.applyMove(p, pos, k).pos;
  }
  if (!A.cleared(pos)) return tag + ": gliding hint does not clear the field";
  // Random players.
  const g = glide[lv] || (glide[lv] = { arrows: [], stuck: 0, tries: 0, rounds: [], puzzles: 0 });
  const random = A.makeRng(tag.length * 131 + p.arrows.length * 17 + way.length);
  for (let t = 0; t < 20; t++) { g.tries++; if (A.randomPlayStuck(p, random)) g.stuck++; }
  g.arrows.push(p.arrows.length);
  g.rounds.push(r);
  g.puzzles++;
  return null;
}

// Easy and Medium: the same puzzles as before gliding came (fingerprints
// of the first puzzles from fixed seeds).
const FINGER = { easy: "4149842568", medium: "1057272333" };
const finger = (lv) => {
  let h = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const p = A.generatePuzzle(lv, A.makeRng(seed * 7919 + lv.length));
    JSON.stringify(p.arrows).split("").forEach((ch) => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; });
  }
  return String(h);
};
Object.keys(FINGER).filter(use).forEach((lv) => { const f = finger(lv); if (f !== FINGER[lv]) fails.push(lv + ": puzzles changed (fingerprint " + f + ")"); });

const t0 = Date.now();
if (ONLY) ONLY.forEach((lv) => { if (!A.LEVELS[lv]) fails.push("unknown level " + lv); });
for (const lv of Object.keys(A.LEVELS).filter(use)) {
  const shapes = lv === "pictures" ? Object.keys(A.SHAPES) : [null];
  const count = lv === "grandmaster" ? GRAND_PER : lv === "pictures" ? SHAPE_PER : PER;
  for (const shape of shapes) for (let seed = 1; seed <= count; seed++) {
    const p = A.generatePuzzle(lv, A.makeRng(seed * 7919 + lv.length + (shape ? shape.length * 101 : 0)), shape || undefined);
    const err = check(p, lv, seed, shape);
    if (err) fails.push(err);
  }
}
const range = (a) => Math.min.apply(null, a) + "-" + Math.max.apply(null, a) + " (average " + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) + ")";
Object.keys(stats).forEach((lv) => console.log(lv + ": " + stats[lv].puzzles + " puzzles, arrows " + range(stats[lv].arrows) + ", free at start " + range(stats[lv].free) + ", dependency chain (rounds) " + range(stats[lv].rounds) + ", solved with the hint in the fewest moves"));
Object.keys(glide).forEach((lv) => {
  const g = glide[lv], rate = g.stuck / g.tries;
  const cfg = A.LEVELS[lv];
  console.log(lv + ": " + g.puzzles + " puzzles " + cfg.rows + " x " + cfg.cols + " with gliding arrows, arrows " + range(g.arrows) + ", rounds " + range(g.rounds) + ", solved by the solver and with the hint; random player stuck in " + g.stuck + " of " + g.tries + " tries (" + (100 * rate).toFixed(1) + " %)");
  if ((lv === "hard" || lv === "master") && rate < 0.6) fails.push(lv + ": random player stuck in only " + (100 * rate).toFixed(1) + " %");
});
console.log("time " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== GLIDELANES CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== GLIDELANES CORE: 0 failures ===");
