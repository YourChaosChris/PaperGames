// rings-core.js
// "Turn the Rings" (Ringe drehen) - rings one inside the other, each with
// 8 fields carrying shapes. Turn the rings until every one of the 8 rays
// from the middle outwards shows the same shape on every ring.
// Dependency-free, no DOM.
//
// A puzzle: { level, rings: [[8 shape ids] per ring, inner first],
//             coupled, start: [offset per ring], min }.
// The state is one offset per ring (0-7): ring k shows at position j
// (0 = top, then clockwise) its field (j - offset) mod 8. Turning a ring
// right (clockwise) adds 1, left subtracts 1. On Hard the rings are
// coupled: turning a ring also turns the next ring outwards by the same
// step (the outermost ring turns alone).
//
// Every puzzle is a solved pattern, scrambled; the fewest moves are found
// by a breadth-first search over all 8^rings states (at most 32768).
//
// Levels: easy 3 rings, 4 shapes, 3-5 moves; medium 4 rings, 6 shapes,
// 5-8 moves; hard 5 rings, 8 shapes, coupled, 7-11 moves.

const RingsCore = (function () {
  const SHAPES = ["circle", "ring", "triangle", "square", "star", "diamond", "cross", "moon"];
  const LEVELS = {
    easy: { rings: 3, shapes: 4, coupled: false, minMoves: 3, maxMoves: 5 },
    medium: { rings: 4, shapes: 6, coupled: false, minMoves: 5, maxMoves: 8 },
    hard: { rings: 5, shapes: 8, coupled: true, minMoves: 7, maxMoves: 11 }
  };

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // What ring k shows at position j.
  function shapeAt(p, offsets, k, j) {
    return p.rings[k][(((j - offsets[k]) % 8) + 8) % 8];
  }

  function isSolved(p, offsets) {
    for (let j = 0; j < 8; j++) {
      const s = shapeAt(p, offsets, 0, j);
      for (let k = 1; k < p.rings.length; k++) if (shapeAt(p, offsets, k, j) !== s) return false;
    }
    return true;
  }

  // The offsets after turning ring k by dir (+1 right, -1 left).
  function turn(p, offsets, k, dir) {
    const out = offsets.slice();
    const last = p.coupled ? Math.min(k + 1, out.length - 1) : k;
    for (let i = k; i <= last; i++) out[i] = (((out[i] + dir) % 8) + 8) % 8;
    return out;
  }

  const encode = (offsets) => offsets.reduce((a, o) => a * 8 + o, 0);
  function decode(code, n) {
    const out = new Array(n);
    for (let i = n - 1; i >= 0; i--) { out[i] = code % 8; code = Math.floor(code / 8); }
    return out;
  }

  // Breadth-first search backwards from every solved state: distance to
  // the nearest solution for every state. Turning is reversible (left
  // undoes right), so the distances are the same both ways.
  // The last result is kept: the hint asks again after every turn.
  let cacheKey = null, cacheDist = null;
  function distances(p) {
    const ck = JSON.stringify(p.rings) + p.coupled;
    if (ck === cacheKey) return cacheDist;
    const n = p.rings.length, size = Math.pow(8, n);
    const dist = new Int8Array(size).fill(-1);
    const queue = [];
    for (let c = 0; c < size; c++) if (isSolved(p, decode(c, n))) { dist[c] = 0; queue.push(c); }
    for (let h = 0; h < queue.length; h++) {
      const c = queue[h], off = decode(c, n);
      for (let k = 0; k < n; k++) {
        for (const d of [1, -1]) {
          const nc = encode(turn(p, off, k, d));
          if (dist[nc] === -1) { dist[nc] = dist[c] + 1; queue.push(nc); }
        }
      }
    }
    cacheKey = ck;
    cacheDist = dist;
    return dist;
  }

  function minMoves(p, offsets) {
    return distances(p)[encode(offsets)];
  }

  // A move that brings the rings one step nearer to a solution:
  // { ring, dir }, or null when solved.
  function findHint(p, offsets) {
    const dist = distances(p);
    const here = dist[encode(offsets)];
    if (here <= 0) return null;
    for (let k = 0; k < offsets.length; k++) {
      for (const d of [1, -1]) {
        if (dist[encode(turn(p, offsets, k, d))] === here - 1) return { ring: k, dir: d };
      }
    }
    return null;
  }

  function generatePuzzle(level, rng) {
    const lv = LEVELS[level] ? level : "easy";
    const cfg = LEVELS[lv];
    const random = rng || Math.random;
    for (;;) {
      // The shapes of the 8 rays: every chosen shape at least once, and no
      // turned copy of the pattern equals itself (one solution up to
      // turning all rings together).
      const pool = SHAPES.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      const use = pool.slice(0, cfg.shapes);
      const rays = use.slice();
      while (rays.length < 8) rays.push(use[Math.floor(random() * use.length)]);
      for (let i = 7; i > 0; i--) { const j = Math.floor(random() * (i + 1)); const t = rays[i]; rays[i] = rays[j]; rays[j] = t; }
      let symmetric = false;
      for (let s = 1; s < 8; s++) if (rays.every((x, j) => x === rays[(j + s) % 8])) symmetric = true;
      if (symmetric) continue;
      const p = { level: lv, rings: [], coupled: cfg.coupled };
      for (let k = 0; k < cfg.rings; k++) p.rings.push(rays.slice());
      const dist = distances(p);
      // Pick a start state at the wanted distance.
      const want = cfg.minMoves + Math.floor(random() * (cfg.maxMoves - cfg.minMoves + 1));
      const cand = [];
      for (let c = 0; c < dist.length; c++) if (dist[c] === want) cand.push(c);
      if (!cand.length) continue;
      p.start = decode(cand[Math.floor(random() * cand.length)], cfg.rings);
      p.min = want;
      return p;
    }
  }

  return { SHAPES, LEVELS, makeRng, shapeAt, isSolved, turn, distances, minMoves, findHint, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = RingsCore;
}
if (typeof window !== "undefined") {
  window.RingsCore = RingsCore;
}
