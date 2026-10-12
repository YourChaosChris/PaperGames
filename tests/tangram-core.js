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
// "Outline only": 29 more outlines (numbers, letters, animals, people,
// houses, boats), checked the same way. Their picture (tangram-app.js) is
// one path and nothing else: every piece of its line has the figure on
// exactly one side (no line inside), and together the line runs along the
// whole edge of the figure; there are no solution lines. A piece may be
// laid sticking out (placeFree) - then the outline does not count as
// full - and laying the solution with placeFree fills it.
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

const want = { easy: 20, medium: 20, hard: 21, outline: 29 };
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
if (total < 90) fails.push("only " + total + " outlines");

// The outline picture of the "outline only" level.
{
  const fs = require("fs"), vm = require("vm"), path = require("path");
  const ctx = { document: { addEventListener() {} }, console, Math, window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "tangram-core.js"), "utf8") + fs.readFileSync(path.join(__dirname, "..", "tangram-app.js"), "utf8") +
    ";this.loops=outlineLoopsTg;this.svg=outlineSvgTg;", ctx);
  let segs = 0;
  T.LEVELS.outline.forEach((f) => {
    const fig = T.parseFigure(f.rows);
    const html = ctx.svg(fig, 40);
    if ((html.match(/<path/g) || []).length !== 1 || /dasharray/.test(html)) fails.push(f.id + ": outline picture is not one plain path");
    // Inside test: a point is in the figure if it lies in one of its quarters.
    const inside = (x, y) => {
      const c = Math.floor(x), r = Math.floor(y), fx = x - c, fy = y - r;
      const q = fy < fx ? (fy < 1 - fx ? 0 : 1) : (fy < 1 - fx ? 3 : 2);
      return !!fig.quarters[r + "," + c + "," + q];
    };
    let len = 0;
    ctx.loops(fig).forEach((pts) => {
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % pts.length];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        len += L;
        // Check several points along the piece of line.
        for (let t = 0.1; t < 1; t += 0.2) {
          const mx = a[0] + (b[0] - a[0]) * t, my = a[1] + (b[1] - a[1]) * t;
          const nx = -(b[1] - a[1]) / L * 0.01, ny = (b[0] - a[0]) / L * 0.01;
          if (inside(mx + nx, my + ny) === inside(mx - nx, my - ny)) { fails.push(f.id + ": a line inside the figure or outside it"); return; }
        }
        segs++;
      });
    });
    // Length of the whole edge, counted from the quarters.
    const across = { 0: [[-1, 0, 2], [0, 0, 1], [0, 0, 3]], 1: [[0, 1, 3], [0, 0, 2], [0, 0, 0]], 2: [[1, 0, 0], [0, 0, 3], [0, 0, 1]], 3: [[0, -1, 1], [0, 0, 0], [0, 0, 2]] };
    let edge = 0;
    Object.keys(fig.quarters).forEach((k) => {
      const [r, c, q] = k.split(",").map(Number);
      across[q].forEach((d, i) => { if (!fig.quarters[(r + d[0]) + "," + (c + d[1]) + "," + d[2]]) edge += i === 0 ? 1 : Math.SQRT1_2; });
    });
    if (Math.abs(edge - len) > 1e-6) fails.push(f.id + ": the line covers " + len.toFixed(2) + " of an edge of " + edge.toFixed(2));
    // Free laying: a piece sticking out is allowed but the outline is not full.
    const sol = T.solve(fig);
    let placed = [];
    const out = T.placeFree(fig, [], "Q", 0, false, -0.5, -0.5, 2, 1);
    if (!out || T.fits(fig, [], out)) fails.push(f.id + ": no square laid sticking out");
    else if (T.isComplete(fig, [out])) fails.push(f.id + ": sticking-out piece counts as filled");
    sol.forEach((pl) => {
      const poly = T.placementPolygon(pl);
      const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
      const got = T.placeFree(fig, placed, pl.piece, pl.k, pl.flip, cx, cy, 0.5, 1);
      if (got) placed.push(got);
    });
    if (!T.isComplete(fig, placed)) fails.push(f.id + ": laying the solution freely does not fill it");
  });
  console.log("outline only: " + T.LEVELS.outline.length + " pictures drawn as one line along the edge (" + segs + " pieces of line checked), no lines inside; free laying works");
}
if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== TANGRAM CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== TANGRAM CORE: 0 failures ===");
