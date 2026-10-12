// tests/tangram-core.js
// "Tangram": the pieces and every outline.
//
// Checks: the seven pieces cover an area of 8 (32 quarters); the shapes
// of every kind in the grid orientations (L, M, S: 4, Q: 1, P: 4 incl.
// the flipped ones); a turned-by-45-degrees piece has no grid position.
// At least 60 outlines, 20 / 20 / 21 per level, no outline twice, ids
// unique; every outline has 32 quarters, is one connected area, and the
// exact-cover search finds a solution, which is then checked on its own:
// seven pieces, each kind as often as in the set, inside the outline,
// no overlap, outline full. Solution counts are printed per level (Easy
// has the most). Playing every outline with the hint alone fills it; a
// wrongly laid piece is cleared away by the hint.
//
// Run: node tests/tangram-core.js

const T = require("../tangram-core.js");

const fails = [];
const area = T.PIECES.reduce((a, p) => a + T.SHAPES[T.KIND[p]][0].quarters.length, 0);
if (area !== 32) fails.push("pieces cover " + area + " quarters, expected 32");
const counts = { L: 4, M: 4, S: 4, Q: 1, P: 4 };
Object.keys(counts).forEach((k) => { if (T.SHAPES[k].length !== counts[k]) fails.push(k + ": " + T.SHAPES[k].length + " grid shapes, expected " + counts[k]); });
if (T.placementQuarters({ piece: "L1", k: 1, flip: false, x: 0, y: 0 }) !== null) fails.push("a slanted piece has quarters");

const NB = { 0: [[-1, 0, 2], [0, 0, 1], [0, 0, 3]], 1: [[0, 1, 3], [0, 0, 0], [0, 0, 2]], 2: [[1, 0, 0], [0, 0, 1], [0, 0, 3]], 3: [[0, -1, 1], [0, 0, 0], [0, 0, 2]] };
function connected(fig) {
  const keys = Object.keys(fig.quarters);
  const seen = new Set([keys[0]]), st = [keys[0]];
  while (st.length) {
    const [r, c, q] = st.pop().split(",").map(Number);
    NB[q].forEach((d) => { const k = (r + d[0]) + "," + (c + d[1]) + "," + d[2]; if (fig.quarters[k] && !seen.has(k)) { seen.add(k); st.push(k); } });
  }
  return seen.size === keys.length;
}

const want = { easy: 20, medium: 20, hard: 21 };
const ids = new Set(), shapes = new Set();
let total = 0;
const report = [];
Object.keys(want).forEach((lv) => {
  const list = T.LEVELS[lv];
  if (list.length !== want[lv]) fails.push(lv + ": " + list.length + " outlines");
  let sum = 0, unique = 0;
  list.forEach((f, i) => {
    total++;
    const tag = lv + " " + (i + 1) + " (" + f.id + ")";
    if (ids.has(f.id)) fails.push(tag + ": id twice");
    ids.add(f.id);
    if (shapes.has(f.rows.join("/"))) fails.push(tag + ": outline twice");
    shapes.add(f.rows.join("/"));
    const fig = T.parseFigure(f.rows);
    if (Object.keys(fig.quarters).length !== 32) { fails.push(tag + ": " + Object.keys(fig.quarters).length + " quarters"); return; }
    if (!connected(fig)) fails.push(tag + ": not one connected area");
    const sol = T.solve(fig);
    if (!sol) { fails.push(tag + ": no solution"); return; }
    if (sol.map((s) => s.piece).sort().join() !== T.PIECES.slice().sort().join()) fails.push(tag + ": solution uses " + sol.map((s) => s.piece).join(","));
    if (!T.isComplete(fig, sol)) fails.push(tag + ": solution does not fill the outline");
    let placed = [];
    for (const s of sol) { if (!T.fits(fig, placed, s)) fails.push(tag + ": solution piece " + s.piece + " does not fit"); placed.push(s); }
    const n = T.countSolutions(fig, 500);
    sum += n;
    if (n === 1) unique++;
    // Hint only, starting with one wrongly laid piece where possible.
    placed = [];
    const wrong = T.SHAPES.S.map((sh) => ({ piece: "S1", k: sh.k, flip: sh.flip })).flatMap((o) => {
      const out = [];
      for (let y = 0; y < fig.rows; y++) for (let x = 0; x < fig.cols; x++) out.push(Object.assign({ x, y }, o));
      return out;
    }).find((pl) => T.fits(fig, [], pl) && !sol.some((s) => T.samePlace(s, pl)));
    if (wrong) placed.push(wrong);
    let steps = 0;
    while (!T.isComplete(fig, placed) && steps < 20) {
      const h = T.findHint(fig, sol, placed);
      if (!h) { fails.push(tag + ": no hint"); break; }
      placed = placed.filter((p) => h.remove.indexOf(p.piece) === -1 && p.piece !== h.place.piece);
      if (!T.fits(fig, placed, h.place)) { fails.push(tag + ": hinted piece does not fit"); break; }
      placed.push(h.place);
      steps++;
    }
    if (!T.isComplete(fig, placed)) fails.push(tag + ": hint does not fill the outline");
  });
  report.push(lv + ": " + list.length + " outlines, " + (sum / list.length).toFixed(1) + " solutions on average (up to 500 counted), " + unique + " with exactly one");
});
report.forEach((r) => console.log(r));
console.log(total + " outlines, each solvable; filled with the hint alone");
if (total < 60) fails.push("only " + total + " outlines");
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== TANGRAM CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== TANGRAM CORE: 0 failures ===");
