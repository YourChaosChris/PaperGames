// arrows-core.js
// "Arrows" (Pfeile) - tap an arrow and it slides out of the field in the
// direction it points, if nothing is in its way. Dependency-free, no DOM.
//
// A field is `rows` x `cols`; cell i = r * cols + c. An arrow is a line
// of neighbouring cells, `cells` from its tail to its head, and `dir` is
// where the head points (0 up, 1 right, 2 down, 3 left; for a line of
// two or more cells the direction of its last step). Tapped, it leaves
// the field along its head's direction when every cell from the head to
// the edge is free - its own body included. Otherwise it stays.
//
// Every puzzle is made backwards: arrows are added one at a time, each
// with a free way out among the arrows already there, so taking them out
// in the reverse order always works. Taking out an arrow never blocks
// another, so any arrow that can leave may leave: the fewest moves are
// the number of arrows, and the puzzle cannot get stuck.
//
// Levels (field, arrow length, how deeply the arrows block each other):
//   easy   5 x 5, 1-2 cells, at least 3 rounds
//   medium 7 x 7, 2-4 cells, at least 5 rounds
//   hard   9 x 9, 2-6 cells, at least 7 rounds
// A "round" takes out every arrow that can leave at the same time; the
// number of rounds measures the nesting.
//
// A puzzle: { level, rows, cols, arrows: [{ cells, dir }] }.

const ArrowsCore = (function () {
  const DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
  const LEVELS = {
    easy: { rows: 5, cols: 5, minLen: 1, maxLen: 2, rounds: 3, fill: 0.8 },
    medium: { rows: 7, cols: 7, minLen: 2, maxLen: 4, rounds: 5, fill: 0.85 },
    hard: { rows: 9, cols: 9, minLen: 2, maxLen: 6, rounds: 7, fill: 0.88 }
  };

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // Which arrow covers each cell (-1 for none), for the arrows still in
  // the field (`present[k]` true).
  function occupancy(p, present) {
    const occ = new Array(p.rows * p.cols).fill(-1);
    p.arrows.forEach((a, k) => { if (present[k]) a.cells.forEach((i) => { occ[i] = k; }); });
    return occ;
  }

  // The cells from the head (not included) to the edge.
  function rayCells(p, a) {
    const head = a.cells[a.cells.length - 1];
    let r = Math.floor(head / p.cols) + DR[a.dir], c = head % p.cols + DC[a.dir];
    const out = [];
    while (r >= 0 && r < p.rows && c >= 0 && c < p.cols) {
      out.push(r * p.cols + c);
      r += DR[a.dir]; c += DC[a.dir];
    }
    return out;
  }

  // Whether arrow k can leave now; `occ` from occupancy().
  function canLeave(p, occ, k) {
    return rayCells(p, p.arrows[k]).every((i) => occ[i] === -1);
  }

  // The first arrow that blocks arrow k, or -1.
  function blocker(p, occ, k) {
    const ray = rayCells(p, p.arrows[k]);
    for (let j = 0; j < ray.length; j++) if (occ[ray[j]] !== -1) return occ[ray[j]];
    return -1;
  }

  // Takes out all arrows that can leave, round after round. Returns the
  // number of rounds, or -1 when some arrows can never leave.
  function rounds(p, present) {
    const left = present ? present.slice() : p.arrows.map(() => true);
    let n = 0;
    for (;;) {
      if (!left.some(Boolean)) return n;
      const occ = occupancy(p, left);
      const free = [];
      left.forEach((on, k) => { if (on && canLeave(p, occ, k)) free.push(k); });
      if (!free.length) return -1;
      free.forEach((k) => { left[k] = false; });
      n++;
    }
  }

  function shuffle(a, random) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // One try at filling the field backwards (see above).
  function build(cfg, random) {
    const p = { rows: cfg.rows, cols: cfg.cols, arrows: [] };
    const n = cfg.rows * cfg.cols;
    const occ = new Array(n).fill(false);
    let used = 0, misses = 0;
    while (used < cfg.fill * n && misses < 400) {
      const empty = [];
      for (let i = 0; i < n; i++) if (!occ[i]) empty.push(i);
      // Mostly start in the way of an arrow already there, so the arrows
      // block each other in longer chains.
      const inWay = {};
      p.arrows.forEach((b) => rayCells(p, b).forEach((i) => { if (!occ[i]) inWay[i] = true; }));
      const blocking = empty.filter((i) => inWay[i]);
      const pool = blocking.length && random() < 0.7 ? blocking : empty;
      const start = pool[Math.floor(random() * pool.length)];
      const len = cfg.minLen + Math.floor(random() * (cfg.maxLen - cfg.minLen + 1));
      const cells = [start];
      const mine = {};
      mine[start] = true;
      let lastDir = Math.floor(random() * 4);
      for (let s = 1; s < len; s++) {
        const cur = cells[cells.length - 1];
        const r = Math.floor(cur / cfg.cols), c = cur % cfg.cols;
        // Mostly straight on, sometimes a bend.
        const dirs = shuffle([0, 1, 2, 3], random);
        if (s > 1 && random() < 0.55) dirs.unshift(lastDir);
        let moved = false;
        for (const d of dirs) {
          const rr = r + DR[d], cc = c + DC[d], i = rr * cfg.cols + cc;
          if (rr < 0 || rr >= cfg.rows || cc < 0 || cc >= cfg.cols || occ[i] || mine[i]) continue;
          cells.push(i); mine[i] = true; lastDir = d; moved = true;
          break;
        }
        if (!moved) break;
      }
      if (cells.length < cfg.minLen) { misses++; continue; }
      const a = { cells, dir: cells.length > 1 ? lastDir : Math.floor(random() * 4) };
      const ray = rayCells(p, a);
      if (ray.some((i) => occ[i] || mine[i])) { misses++; continue; }
      p.arrows.push(a);
      cells.forEach((i) => { occ[i] = true; });
      used += cells.length;
      misses = 0;
    }
    // Added last = leaves first: show them in field order, the solving
    // order must not be readable from the list.
    p.arrows.sort((x, y) => x.cells[0] - y.cells[0]);
    return p;
  }

  function generatePuzzle(level, rng) {
    const lv = LEVELS[level] ? level : "easy";
    const cfg = LEVELS[lv];
    const random = rng || Math.random;
    let best = null, bestRounds = -1;
    for (let tries = 0; tries < 60; tries++) {
      const p = build(cfg, random);
      const r = rounds(p);
      if (r > bestRounds) { best = p; bestRounds = r; }
      if (r >= cfg.rounds) break;
    }
    best.level = lv;
    return best;
  }

  // The fewest moves: every arrow leaves once.
  function minMoves(p) {
    return p.arrows.length;
  }

  // An arrow that can leave now (the one nearest the top left), or -1.
  function findHint(p, present) {
    const occ = occupancy(p, present);
    for (let k = 0; k < p.arrows.length; k++) if (present[k] && canLeave(p, occ, k)) return k;
    return -1;
  }

  return { LEVELS, DR, DC, makeRng, occupancy, rayCells, canLeave, blocker, rounds, generatePuzzle, minMoves, findHint };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ArrowsCore;
}
if (typeof window !== "undefined") {
  window.ArrowsCore = ArrowsCore;
}
