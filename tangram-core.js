// tangram-core.js
// "Tangram" - fill an outline with the seven classic pieces: two large
// triangles, a medium one, two small ones, a square and a parallelogram.
// Dependency-free, no DOM.
//
// Units: a small triangle has legs of 1. Every outline here lies on the
// unit grid with edges along the grid or its diagonals, so it is a set of
// "quarters": every unit cell is cut by both diagonals into four
// triangles, N E S W (top, right, bottom, left; y grows downwards). A
// quarter is written "r,c,q" (q = 0 N, 1 E, 2 S, 3 W). The seven pieces
// cover 32 quarters, an area of 8.
//
// A piece is placed turned by k x 45 degrees (k = 0-7, clockwise),
// possibly flipped, and moved by whole units. Turned by an odd k it lies
// slanted and fits no outline of this set - it has to be turned once
// more. A placement: { piece, k, flip, x, y }.
//
// The outlines (FIGURES) are drawn as text, one character per cell:
//   "."  empty     "#"  full
//   "1"  top-left half (N + W)     "2"  top-right half (N + E)
//   "3"  bottom-right half (S + E) "4"  bottom-left half (S + W)
// For each a solution is found by an exact-cover search (solve()); the
// tests check that every outline is solvable.

const TangramCore = (function () {
  const PIECES = ["L1", "L2", "M", "S1", "S2", "Q", "P"];
  const KIND = { L1: "L", L2: "L", M: "M", S1: "S", S2: "S", Q: "Q", P: "P" };
  const BASE = {
    L: [[0, 0], [2, 0], [0, 2]],
    M: [[0, 0], [2, 0], [1, 1]],
    S: [[0, 0], [1, 0], [0, 1]],
    Q: [[0, 0], [1, 0], [1, 1], [0, 1]],
    P: [[0, 0], [1, 0], [2, 1], [1, 1]]
  };
  const R2 = Math.SQRT1_2;

  // The polygon of a kind turned by k x 45 degrees (clockwise on screen,
  // y down), flipped first if asked; moved so its lowest x and y are 0
  // for an even k (whole numbers again).
  function polygon(kind, k, flip) {
    let pts = BASE[kind].map((p) => [flip ? -p[0] : p[0], p[1]]);
    const a = (((k % 8) + 8) % 8) * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    pts = pts.map((p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c]);
    const mx = Math.min.apply(null, pts.map((p) => p[0])), my = Math.min.apply(null, pts.map((p) => p[1]));
    return pts.map((p) => [round(p[0] - mx), round(p[1] - my)]);
  }

  function round(v) {
    const r = Math.round(v);
    return Math.abs(v - r) < 1e-9 ? r : v;
  }

  // The four quarters of cell (r, c) as triangles.
  function quarterTri(r, c, q) {
    const m = [c + 0.5, r + 0.5];
    const corners = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]];
    return [corners[q], corners[(q + 1) % 4], m];
  }

  function inside(pt, poly) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }

  // The quarters a polygon at whole-number position covers, as [r, c, q].
  function polyQuarters(poly) {
    const out = [];
    const W = Math.ceil(Math.max.apply(null, poly.map((p) => p[0]))), H = Math.ceil(Math.max.apply(null, poly.map((p) => p[1])));
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        for (let q = 0; q < 4; q++) {
          const t = quarterTri(r, c, q);
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          if (inside([cx, cy], poly)) out.push([r, c, q]);
        }
      }
    }
    return out;
  }

  // Shapes of every kind in every orientation: { k, flip, poly, quarters }
  // (quarters only for an even k; distinct shapes only).
  const SHAPES = {};
  Object.keys(BASE).forEach((kind) => {
    SHAPES[kind] = [];
    const seen = {};
    for (let f = 0; f < 2; f++) {
      for (let k = 0; k < 8; k += 2) {
        const poly = polygon(kind, k, f === 1);
        const quarters = polyQuarters(poly);
        const key = quarters.map((x) => x.join(",")).sort().join(";");
        if (seen[key]) continue;
        seen[key] = true;
        SHAPES[kind].push({ k, flip: f === 1, poly, quarters });
      }
    }
  });

  // The quarters a placement covers, as keys "r,c,q", or null when the
  // piece lies slanted (odd k).
  function placementQuarters(pl) {
    if (pl.k % 2) return null;
    const poly = polygon(KIND[pl.piece], pl.k, pl.flip);
    return polyQuarters(poly).map((x) => (x[0] + pl.y) + "," + (x[1] + pl.x) + "," + x[2]);
  }

  function placementPolygon(pl) {
    return polygon(KIND[pl.piece], pl.k, pl.flip).map((p) => [p[0] + pl.x, p[1] + pl.y]);
  }

  // An outline from its text rows: { rows, cols, quarters: { key: true } }.
  const CHAR_Q = { "#": [0, 1, 2, 3], "1": [0, 3], "2": [0, 1], "3": [2, 1], "4": [2, 3], ".": [] };
  function parseFigure(rows) {
    const quarters = {};
    rows.forEach((line, r) => {
      for (let c = 0; c < line.length; c++) {
        const qs = CHAR_Q[line[c]];
        if (!qs) throw new Error("bad character " + line[c]);
        qs.forEach((q) => { quarters[r + "," + c + "," + q] = true; });
      }
    });
    return { rows: rows.length, cols: Math.max.apply(null, rows.map((l) => l.length)), quarters };
  }

  // Exact cover: every quarter of the outline covered once by the seven
  // pieces. Returns the placements of one solution, or null; counts up to
  // `limit` solutions when asked (count mode).
  function search(fig, limit, count) {
    const keys = Object.keys(fig.quarters).sort((a, b) => {
      const pa = a.split(",").map(Number), pb = b.split(",").map(Number);
      return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
    });
    if (keys.length !== 32) return count ? 0 : null;
    const covered = {};
    const used = { L: 0, M: 0, S: 0, Q: 0, P: 0 };
    const LIMIT = { L: 2, M: 1, S: 2, Q: 1, P: 1 };
    const chosen = [];
    let found = null, n = 0, steps = 0;
    function rec() {
      if (++steps > 2e6) return true;
      let first = null;
      for (const k of keys) if (!covered[k]) { first = k; break; }
      if (!first) {
        n++;
        if (!found) found = chosen.slice();
        return !count || n >= limit;
      }
      const fr = first.split(",").map(Number);
      for (const kind of ["L", "P", "M", "Q", "S"]) {
        if (used[kind] >= LIMIT[kind]) continue;
        for (const sh of SHAPES[kind]) {
          // The first uncovered quarter (in reading order) must be the
          // shape's first quarter in reading order.
          const q0 = sh.quarters.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])[0];
          const dy = fr[0] - q0[0], dx = fr[1] - q0[1];
          if (q0[2] !== fr[2]) continue;
          const qs = sh.quarters.map((x) => (x[0] + dy) + "," + (x[1] + dx) + "," + x[2]);
          if (!qs.every((x) => fig.quarters[x] && !covered[x])) continue;
          qs.forEach((x) => { covered[x] = true; });
          used[kind]++;
          chosen.push({ kind, k: sh.k, flip: sh.flip, x: dx, y: dy });
          if (rec()) return true;
          chosen.pop();
          used[kind]--;
          qs.forEach((x) => { delete covered[x]; });
        }
      }
      return false;
    }
    rec();
    if (count) return n;
    if (!found) return null;
    // Name the pieces: L1/L2 and S1/S2 in the order found.
    const seenKind = { L: 0, S: 0 };
    return found.map((f) => {
      let piece = f.kind;
      if (f.kind === "L" || f.kind === "S") piece = f.kind + (++seenKind[f.kind]);
      return { piece, k: f.k, flip: f.flip, x: f.x, y: f.y };
    });
  }

  function solve(fig) { return search(fig, 1, false); }
  function countSolutions(fig, limit) { return search(fig, limit || 1000, true); }

  // Whether a placement lies inside the outline and on no placed piece.
  function fits(fig, placed, pl) {
    const qs = placementQuarters(pl);
    if (!qs) return false;
    const taken = {};
    placed.forEach((p) => (placementQuarters(p) || []).forEach((x) => { taken[x] = true; }));
    return qs.every((x) => fig.quarters[x] && !taken[x]);
  }

  function isComplete(fig, placed) {
    if (placed.length !== 7) return false;
    const seen = {};
    for (const p of placed) {
      const qs = placementQuarters(p);
      if (!qs) return false;
      for (const x of qs) { if (!fig.quarters[x] || seen[x]) return false; seen[x] = true; }
    }
    return Object.keys(seen).length === 32;
  }

  // The best whole-number position for a piece turned as given, near the
  // point (px, py) in units: the nearest centre among the positions where
  // it fits, within `reach` units; or null.
  function snap(fig, placed, piece, k, flip, px, py, reach) {
    if (k % 2) return null;
    const poly = polygon(KIND[piece], k, flip);
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    let best = null, bd = (reach || 2) * (reach || 2);
    for (let y = -2; y <= fig.rows + 1; y++) {
      for (let x = -2; x <= fig.cols + 1; x++) {
        const d = (x + cx - px) * (x + cx - px) + (y + cy - py) * (y + cy - py);
        if (d >= bd) continue;
        const pl = { piece, k, flip, x, y };
        if (fits(fig, placed, pl)) { best = pl; bd = d; }
      }
    }
    return best;
  }

  // Outline only: the nearest whole-number position near (px, py) where
  // the piece lies on no placed piece and stays on the board (the outline
  // plus `pad` units around it) - inside the outline or not. Or null.
  function onBoard(fig, pl, pad) {
    const qs = placementQuarters(pl);
    if (!qs) return false;
    return qs.every((x) => {
      const [r, c] = x.split(",").map(Number);
      return r >= -pad && r < fig.rows + pad && c >= -pad && c < fig.cols + pad;
    });
  }
  function placeFree(fig, placed, piece, k, flip, px, py, reach, pad) {
    if (k % 2) return null;
    const poly = polygon(KIND[piece], k, flip);
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    const taken = {};
    placed.forEach((p) => (placementQuarters(p) || []).forEach((x) => { taken[x] = true; }));
    let best = null, bd = (reach || 2) * (reach || 2);
    for (let y = -pad - 2; y <= fig.rows + pad; y++) {
      for (let x = -pad - 2; x <= fig.cols + pad; x++) {
        const d = (x + cx - px) * (x + cx - px) + (y + cy - py) * (y + cy - py);
        if (d >= bd) continue;
        const pl = { piece, k, flip, x, y };
        if (!onBoard(fig, pl, pad)) continue;
        if (placementQuarters(pl).some((q) => taken[q])) continue;
        best = pl; bd = d;
      }
    }
    return best;
  }

  // Same shape on the same quarters (the two large and the two small
  // triangles count as the same piece).
  function samePlace(a, b) {
    if (KIND[a.piece] !== KIND[b.piece]) return false;
    const qa = placementQuarters(a), qb = placementQuarters(b);
    if (!qa || !qb) return false;
    return qa.slice().sort().join(";") === qb.slice().sort().join(";");
  }

  // A hint against the stored solution: the next solution place not yet
  // taken, and which placed pieces lie in its way: { place, remove }.
  function findHint(fig, solution, placed) {
    const free = solution.filter((s) => !placed.some((p) => samePlace(p, s)));
    if (!free.length) return null;
    const target = free[0];
    const tq = {};
    placementQuarters(target).forEach((x) => { tq[x] = true; });
    const remove = placed.filter((p) => (placementQuarters(p) || []).some((x) => tq[x]) || (KIND[p.piece] === KIND[target.piece] && !solution.some((s) => samePlace(p, s))));
    // The piece to use: one of the target's kind that is not already on a
    // solution place.
    const kindLeft = PIECES.filter((pc) => KIND[pc] === KIND[target.piece]).filter((pc) => {
      const at = placed.find((p) => p.piece === pc);
      return !at || remove.indexOf(at) !== -1;
    });
    const place = { piece: kindLeft[0] || target.piece, k: target.k, flip: target.flip, x: target.x, y: target.y };
    return { place, remove: remove.map((p) => p.piece) };
  }

  // --- the outlines --------------------------------------------------------
  // [id, level, rows]: 90 outlines (animals, people, things and signs),
  // drawn for PaperGames on the grid described above. The level follows
  // the number of ways to fill the outline: Easy has the most (and shows
  // the lines of one solution), Hard the fewest - many have only one.
  // "outline" is a level of its own (see there).
  const FIGURES = [
    ["house", "easy", [".34.","3##4",".##.",".##."]],
    ["tree", "easy", [".24..",".3#4.","3###4","..#.."]],
    ["owl", "easy", ["...3","2###","2##1",".21."]],
    ["bird", "easy", ["#####","12#.2","..1.."]],
    ["giraffe", "easy", ["##",".#",".#","##","##"]],
    ["bottle", "easy", [".3.","3#4","###","##1"]],
    ["thinker", "easy", ["##.","###",".##",".#."]],
    ["kneeling", "easy", [".3.","3##",".##","###"]],
    ["crab", "easy", ["...3",".##1","####","1..2"]],
    ["windmill", "easy", ["4..3","####",".##4","...2"]],
    ["church", "easy", [".3#4",".##.","####"]],
    ["lamp", "easy", [".34.","3##4",".#..","###."]],
    ["rectangle", "easy", ["####","####"]],
    ["letter_t", "easy", ["####",".##.",".##."]],
    ["triangle", "easy", ["..3...","..#4..",".3##4.","3#..#4"]],
    ["envelope", "easy", ["4..3","#43#","####"]],
    ["arrow", "easy", ["..4.","###4","###1","..1."]],
    ["big_triangle", "easy", ["...4","..3#",".3##","3###"]],
    ["chevron", "easy", ["#4..","##4.","##1.","#1.."]],
    ["pyramid", "easy", [".34.","3##4","####"]],
    ["cat", "medium", [".43.",".##.","3###","..#1"]],
    ["penguin", "medium", [".3.","##4","###","2#1"]],
    ["sailboat", "medium", [".34..","3##4.","2###1"]],
    ["boat", "medium", ["..24.","2###1",".###."]],
    ["ship", "medium", ["..3..","..#..","..#4.","2###1",".21.."]],
    ["snail", "medium", [".334","3###","###."]],
    ["anchor", "medium", [".24.","..#.","3##4","2##1"]],
    ["bell", "medium", [".#..",".#4.",".##.","3##4",".1.."]],
    ["key", "medium", ["3...","2#..","####","##.."]],
    ["mushroom", "medium", [".3..",".#4.","3##4",".#..","##.."]],
    ["rocket", "medium", [".34.",".##.","3##4","#..#"]],
    ["elephant", "medium", ["2##.","####","#..1"]],
    ["plus", "medium", ["..3.",".2#.","####",".##."]],
    ["plus_sign", "medium", ["2#..",".#4.","####",".21."]],
    ["square", "medium", [".34.","3##4","2##1",".21."]],
    ["kite", "medium", ["2#.",".#4","3##","2#1",".1."]],
    ["crown", "medium", ["4..3","#34#","####"]],
    ["letter_v", "medium", ["31..3","2#..#",".2##1","..21."]],
    ["parallelogram", "medium", ["3....","2###4",".2###"]],
    ["step", "medium", ["#...","##..","###.","##.."]],
    ["rabbit", "hard", ["..3","#1#","###","2#1"]],
    ["dog", "hard", ["##.4","1###",".#.#"]],
    ["fox", "hard", [".3..","##..","2###",".#.#"]],
    ["horse", "hard", ["#...","#...","####","#..#"]],
    ["mouse", "hard", [".3...","###4.","2###1"]],
    ["butterfly", "hard", ["4..3","#43#","#21#","1..2"]],
    ["chair", "hard", ["#..","#..","#..","###","#.#"]],
    ["cup", "hard", [".3..",".##3","2##1",".##."]],
    ["tower", "hard", [".3.#","3###","..#.","..##"]],
    ["turtle", "hard", [".344.","3####","#.#.."]],
    ["camel", "hard", [".#4.","3###","#..#","#..."]],
    ["duck", "hard", [".34..","3#...",".###4",".2#1."]],
    ["hammer", "hard", ["####",".#..",".#..",".##."]],
    ["runner", "hard", [".#..","3##.","#.#4","..2#","...1"]],
    ["sitting", "hard", [".#..",".##.",".###","##.."]],
    ["skier", "hard", [".3..","3#1.",".#4.","####"]],
    ["waving", "hard", ["32#","###",".#.","##."]],
    ["whale", "hard", ["4...","##3#","#2##","1..."]],
    ["letter_l", "hard", ["24..","4#..","##..","###1"]],
    ["star", "hard", ["..4.","4###","21##",".21."]],
    ["zigzag", "hard", ["4...","##..","3##.","..##","...#"]],
    // Outline only: numbers, letters, animals, people, houses and boats.
    // Only the outer line is drawn, and a piece lands where it is tapped
    // even if it sticks out (placeFree) - trying out is part of it.
    ["digit_1", "outline", [".3#",  "3##",  ".##",  ".##"]],
    ["digit_2", "outline", [".2#4",  "...#",  ".3#1",  "3##1"]],
    ["digit_5", "outline", [".3",  "3#",  "#.",  "##",  ".#",  "##"]],
    ["letter_c", "outline", ["###",  "#..",  "#..",  "###"]],
    ["letter_e", "outline", ["##",  "#.",  "##",  "#.",  "##"]],
    ["letter_f", "outline", ["..3",  "3##",  "#..",  "##.",  "#..",  "#.."]],
    ["letter_u", "outline", ["#..#",  "#..#",  "####"]],
    ["letter_y", "outline", ["...#",  "#..#",  "2##1",  ".##."]],
    ["letter_z", "outline", ["2#44",  ".3#1",  "3###"]],
    ["fish", "outline", ["4.34.",  "#####",  "1.21."]],
    ["cat_sitting", "outline", ["4.3",  "###",  ".##",  ".##"]],
    ["bird_flying", "outline", ["..4.3",  "3###1",  "2##..",  ".1..."]],
    ["pony", "outline", ["4....",  "#3###",  "##..#"]],
    ["seal", "outline", ["3....",  "2#...",  ".###4",  ".2##."]],
    ["hen", "outline", [".4..",  "4#4.",  "###4",  ".2#1"]],
    ["swan", "outline", ["3...",  "#...",  "#...",  "2##4",  ".##1"]],
    ["fox_sitting", "outline", [".44.",  ".##.",  "3##4",  ".##."]],
    ["person_coat", "outline", [".#.",  "3#4",  "###",  "#.#"]],
    ["walker", "outline", [".#4",  ".##",  "3##",  "#.#"]],
    ["thrower", "outline", [".3..",  "3###",  ".3#4",  ".#.#"]],
    ["resting", "outline", ["34..",  "##..",  "###4",  "1..#"]],
    ["house_chimney", "outline", ["..#",  ".3#",  "3##",  "###"]],
    ["house_door", "outline", ["..4.",  "3##4",  "#.2#",  "#..#"]],
    ["castle", "outline", ["#.#.#",  "#####"]],
    ["tent", "outline", ["...4..",  "..##4.",  "3####4"]],
    ["hut", "outline", [".3..",  ".#4.",  "3##4",  "2##1"]],
    ["sailing_boat", "outline", ["..4..",  "..#4.",  "2###1",  ".##.."]],
    ["rowboat", "outline", ["..#..",  "4.#.3",  "#####"]],
    ["yacht", "outline", ["..#4.",  "..##4",  "2###1"]]
  ];

  const LEVELS = { easy: [], medium: [], hard: [], outline: [] };
  FIGURES.forEach((f) => { LEVELS[f[1]].push({ id: f[0], level: f[1], rows: f[2] }); });

  return { PIECES, KIND, BASE, SHAPES, FIGURES, LEVELS, polygon, placementQuarters, placementPolygon, parseFigure, solve, countSolutions, fits, isComplete, snap, placeFree, onBoard, samePlace, findHint };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TangramCore;
}
if (typeof window !== "undefined") {
  window.TangramCore = TangramCore;
}
