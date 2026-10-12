// loosen-core.js
// "Loosen the Rings" (Ringe lösen) - rings hooked into each other, each
// with a gap. Turn them until a ring's gap sits where it crosses the rings
// still hooked into it; then it slips off. Dependency-free, no DOM.
//
// Layout: the rings lie on a square grid, one per cell; rings in cells
// side by side overlap and are hooked into each other. Their centres are
// √2 radii apart, so two hooked rings cross at two points that lie on the
// diagonals of each ring. A ring's gap therefore has four positions, the
// four diagonals, numbered clockwise: 0 upper right, 1 lower right,
// 2 lower left, 3 upper left. Hooked rings are woven like a chain: at one
// of their two crossings the one ring lies on top, at the other the other
// one. A ring lies underneath its neighbour to the right at 0, the one
// below at 1, the one to the left at 2 and the one above at 3 - and it can
// slip off a neighbour only through that crossing.
//
// Moves:
//   - turn a ring a quarter turn (clockwise or anticlockwise); every ring
//     still hooked into it turns a quarter the other way, like gears;
//   - take out a free ring: one whose gap sits at the crossing where the
//     hooked ring lies on top, for every ring still hooked into it (a ring
//     with no hooked ring left is free).
// So a ring hooked to two or more rings cannot come free: the rings at the
// ends have to go first, and turning one also turns its neighbours.
// Goal: all rings out. Every puzzle can be solved - a ring with only one
// ring hooked into it can always be turned free. The fewest moves (turns
// and taking out, counted alike) are found by a full breadth-first search
// over all positions (at most 7 rings: 2^7 x 4^7 states).
//
// A puzzle: { level, cells: [[x, y], ...], gaps: [0-3, ...], best }.

const LoosenCore = (function () {
  const LEVELS = {
    easy: { rings: [3, 3], extra: 0, best: [4, 8] },
    medium: { rings: [4, 5], extra: 0, best: [7, 14] },
    hard: { rings: [6, 7], extra: 1, best: [11, 24] }
  };
  // The gap position through which a ring slips off its neighbour in each
  // direction (where it lies underneath).
  const CROSS = { "1,0": [0], "0,1": [1], "-1,0": [2], "0,-1": [3] };
  // Both crossings with the neighbour in each direction (for drawing; the
  // first is where the ring lies underneath).
  const CROSS_BOTH = { "1,0": [0, 1], "0,1": [1, 2], "-1,0": [2, 3], "0,-1": [3, 0] };

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // For each ring the hooked rings and where it crosses them:
  // [[j, [pos, pos]], ...].
  function links(p) {
    return p.cells.map(([x, y]) => {
      const out = [];
      p.cells.forEach(([u, v], j) => {
        const key = (u - x) + "," + (v - y);
        if (CROSS[key]) out.push([j, CROSS[key]]);
      });
      return out;
    });
  }

  // A state: { present: [bool], gaps: [0-3] }.
  function startState(p) {
    return { present: p.cells.map(() => true), gaps: p.gaps.slice() };
  }

  function isFree(p, s, i, L) {
    if (!s.present[i]) return false;
    L = L || links(p);
    return L[i].every(([j, cr]) => !s.present[j] || cr.indexOf(s.gaps[i]) !== -1);
  }

  // Turn ring i by d (+1 clockwise, -1 anticlockwise): a new state.
  function turn(p, s, i, d, L) {
    L = L || links(p);
    const gaps = s.gaps.slice();
    gaps[i] = (gaps[i] + d + 4) % 4;
    L[i].forEach(([j]) => { if (s.present[j]) gaps[j] = (gaps[j] - d + 4) % 4; });
    return { present: s.present.slice(), gaps };
  }

  function remove(s, i) {
    const present = s.present.slice();
    present[i] = false;
    return { present, gaps: s.gaps.slice() };
  }

  function solved(s) {
    return s.present.every((x) => !x);
  }

  // State as a number: 2 bits per gap, then one bit per ring present.
  // Gaps of rings already out count as 0.
  function code(n, present, gaps) {
    let c = 0;
    for (let i = 0; i < n; i++) c |= (present[i] ? gaps[i] : 0) << (2 * i);
    for (let i = 0; i < n; i++) if (present[i]) c |= 1 << (2 * n + i);
    return c;
  }

  // Breadth-first search from s: the fewest moves to clear the field and
  // the first move of one shortest way ({ type: "turn", ring, dir } or
  // { type: "out", ring }); moves 0 and move null when already clear.
  // Works on numbers: 2 bits per gap, then one bit per ring present.
  function solve(p, s) {
    const n = p.cells.length, L = links(p);
    if (solved(s)) return { moves: 0, move: null };
    const size = 1 << (3 * n), full = (1 << (2 * n)) - 1;
    // Per ring: which neighbours, and per neighbour the two crossing gaps.
    const nb = L.map((l) => l.map(([j]) => j));
    const crossMask = L.map((l) => l.map(([, cr]) => cr.reduce((m, x) => m | (1 << x), 0)));
    const buf = buffers(size);
    const seen = buf.seen, first = buf.first, dist = buf.dist, queue = buf.queue;
    seen.fill(0, 0, size);
    const start = code(n, s.present, s.gaps);
    let head = 0, tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    dist[start] = 0;
    const push = (c, nc, tag) => {
      if (seen[nc]) return false;
      seen[nc] = 1;
      dist[nc] = dist[c] + 1;
      first[nc] = c === start ? tag : first[c];
      if ((nc >> (2 * n)) === 0) return true;
      queue[tail++] = nc;
      return false;
    };
    while (head < tail) {
      const c = queue[head++];
      const pres = c >> (2 * n);
      for (let i = 0; i < n; i++) {
        if (!((pres >> i) & 1)) continue;
        const gi = (c >> (2 * i)) & 3;
        // free?
        let free = true;
        for (let k = 0; k < nb[i].length; k++) {
          const j = nb[i][k];
          if (((pres >> j) & 1) && !((crossMask[i][k] >> gi) & 1)) { free = false; break; }
        }
        if (free) {
          const nc = (c & full & ~(3 << (2 * i))) | ((pres & ~(1 << i)) << (2 * n));
          if (push(c, nc, i * 3 + 2)) return { moves: dist[nc], move: decodeMove(first[nc]) };
        }
        for (let d = 1; d >= -1; d -= 2) {
          let g = c & full;
          g = (g & ~(3 << (2 * i))) | (((gi + d + 4) & 3) << (2 * i));
          for (let k = 0; k < nb[i].length; k++) {
            const j = nb[i][k];
            if (!((pres >> j) & 1)) continue;
            const gj = (g >> (2 * j)) & 3;
            g = (g & ~(3 << (2 * j))) | (((gj - d + 4) & 3) << (2 * j));
          }
          const nc = g | (pres << (2 * n));
          if (push(c, nc, i * 3 + (d === 1 ? 0 : 1))) return { moves: dist[nc], move: decodeMove(first[nc]) };
        }
      }
    }
    return null;
  }

  // Search arrays, kept between searches (the largest size asked so far).
  let bufs = null;
  function buffers(size) {
    if (!bufs || bufs.size < size) {
      bufs = { size, seen: new Uint8Array(size), first: new Int16Array(size), dist: new Int16Array(size), queue: new Int32Array(size) };
    }
    return bufs;
  }

  // Move tags: 3i turn ring i clockwise, 3i+1 anticlockwise, 3i+2 take
  // it out.
  function decodeMove(t) {
    const ring = Math.floor(t / 3), k = t % 3;
    return k === 2 ? { type: "out", ring } : { type: "turn", ring, dir: k === 0 ? 1 : -1 };
  }

  // A random connected set of `count` cells without a square of four (a
  // closed loop of hooked rings could never come apart); with `extra` > 0
  // at least that many rings are hooked to three others (more crossings).
  function randomCells(count, extra, random) {
    for (let tries = 0; tries < 500; tries++) {
      const cells = [[0, 0]];
      const has = (x, y) => cells.some(([u, v]) => u === x && v === y);
      while (cells.length < count) {
        const [x, y] = cells[Math.floor(random() * cells.length)];
        const d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(random() * 4)];
        const nx = x + d[0], ny = y + d[1];
        if (!has(nx, ny)) cells.push([nx, ny]);
      }
      const minX = Math.min(...cells.map((c) => c[0])), minY = Math.min(...cells.map((c) => c[1]));
      const out = cells.map(([x, y]) => [x - minX, y - minY]);
      const w = Math.max(...out.map((c) => c[0])) + 1, h = Math.max(...out.map((c) => c[1])) + 1;
      if (w > 4 || h > 4) continue;
      if (out.some(([x, y]) => has2(out, x + 1, y) && has2(out, x, y + 1) && has2(out, x + 1, y + 1))) continue;
      const hubs = out.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => has2(out, x + dx, y + dy)).length >= 3).length;
      if (hubs < extra) continue;
      out.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      return out;
    }
    return null;
  }
  function has2(cells, x, y) { return cells.some(([u, v]) => u === x && v === y); }

  function generatePuzzle(level, rng) {
    const lv = LEVELS[level] ? level : "easy";
    const cfg = LEVELS[lv];
    const random = rng || Math.random;
    let best = null;
    for (let tries = 0; tries < 400; tries++) {
      const n = cfg.rings[0] + Math.floor(random() * (cfg.rings[1] - cfg.rings[0] + 1));
      const cells = randomCells(n, cfg.extra, random);
      if (!cells) continue;
      const p = { level: lv, cells, gaps: cells.map(() => Math.floor(random() * 4)) };
      const s = startState(p), L = links(p);
      // Nothing free at the start.
      if (cells.some((c, i) => isFree(p, s, i, L))) continue;
      const r = solve(p, s);
      p.best = r.moves;
      if (r.moves >= cfg.best[0] && r.moves <= cfg.best[1]) return p;
      if (!best || Math.abs(r.moves - cfg.best[0]) < Math.abs(best.best - cfg.best[0])) best = p;
    }
    return best;
  }

  // A player who keeps tapping a random ring (taking it out if free,
  // otherwise turning it a random way): true when the field is not clear
  // after `limit` moves.
  function randomPlayFails(p, limit, random) {
    let s = startState(p);
    const L = links(p);
    for (let m = 0; m < limit; m++) {
      if (solved(s)) return false;
      const on = [];
      s.present.forEach((x, i) => { if (x) on.push(i); });
      const i = on[Math.floor(random() * on.length)];
      s = isFree(p, s, i, L) ? remove(s, i) : turn(p, s, i, random() < 0.5 ? 1 : -1, L);
    }
    return !solved(s);
  }

  return { LEVELS, CROSS, CROSS_BOTH, makeRng, links, startState, isFree, turn, remove, solved, solve, generatePuzzle, randomPlayFails, randomCells };
})();

if (typeof module !== "undefined" && module.exports) module.exports = LoosenCore;
if (typeof window !== "undefined") window.LoosenCore = LoosenCore;
