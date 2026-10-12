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
//   hard   11 x 11, 2-7 cells with at most two corners, gliding arrows
//   master as hard, with three hearts in the app (a tap that does not
//          take an arrow out costs one) and no hint
// A "round" takes out every arrow that can leave at the same time; the
// number of rounds measures the nesting.
//
// Gliding arrows (puzzles with `glide: true`, Hard and Master): a tapped
// arrow whose way out is blocked does not stay put - it creeps forward
// like a snake (the body follows the head) up to the obstacle and stops
// there. A wrong move can so block other arrows for good; undo takes it
// back. The positions are then kept per arrow (`pos[k]` = its cells now,
// null once it has left). Every puzzle still has a solution: the order it
// was built in, taking the arrows out without any gliding. The generator
// keeps only Hard puzzles where a player who keeps tapping any arrow that
// can move gets stuck in most tries (randomFailRate).
// Puzzles saved before gliding existed (no `glide`) keep the old rules.
//
// A puzzle: { level, rows, cols, arrows: [{ cells, dir }], glide? }.

const ArrowsCore = (function () {
  const DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
  const LEVELS = {
    easy: { rows: 5, cols: 5, minLen: 1, maxLen: 2, rounds: 3, fill: 0.8 },
    medium: { rows: 7, cols: 7, minLen: 2, maxLen: 4, rounds: 5, fill: 0.85 },
    hard: { rows: 11, cols: 11, minLen: 2, maxLen: 7, maxBends: 2, rounds: 7, fill: 0.86, glide: true, failRate: 0.8 },
    master: { rows: 11, cols: 11, minLen: 2, maxLen: 7, maxBends: 2, rounds: 7, fill: 0.86, glide: true, failRate: 0.8, hearts: 3 }
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

  // The empty cells, and those of them in the way of an arrow already
  // there.
  function freeCells(p, cfg, occ) {
    const n = cfg.rows * cfg.cols;
    const empty = [];
    for (let i = 0; i < n; i++) if (!occ[i]) empty.push(i);
    const inWay = {};
    p.arrows.forEach((b) => rayCells(p, b).forEach((i) => { if (!occ[i]) inWay[i] = true; }));
    return { empty, blocking: empty.filter((i) => inWay[i]) };
  }

  // One new arrow from a random start (null if it does not fit).
  function candidate(p, cfg, occ, random, free) {
    const empty = free.empty, blocking = free.blocking;
    if (!empty.length) return null;
    // Mostly start in the way of an arrow already there, so the arrows
    // block each other in longer chains.
    const pool = blocking.length && random() < 0.7 ? blocking : empty;
    const start = pool[Math.floor(random() * pool.length)];
    const len = cfg.minLen + Math.floor(random() * (cfg.maxLen - cfg.minLen + 1));
    const cells = [start];
    const mine = {};
    mine[start] = true;
    let lastDir = Math.floor(random() * 4);
    let bends = 0;
    for (let s = 1; s < len; s++) {
      const cur = cells[cells.length - 1];
      const r = Math.floor(cur / cfg.cols), c = cur % cfg.cols;
      // Mostly straight on, sometimes a bend.
      let dirs = shuffle([0, 1, 2, 3], random);
      if (s > 1 && random() < 0.55) dirs.unshift(lastDir);
      if (cfg.maxBends !== undefined && s > 1 && bends >= cfg.maxBends) dirs = [lastDir];
      let moved = false;
      for (const d of dirs) {
        const rr = r + DR[d], cc = c + DC[d], i = rr * cfg.cols + cc;
        if (rr < 0 || rr >= cfg.rows || cc < 0 || cc >= cfg.cols || occ[i] || mine[i]) continue;
        if (s > 1 && d !== lastDir) bends++;
        cells.push(i); mine[i] = true; lastDir = d; moved = true;
        break;
      }
      if (!moved) break;
    }
    if (cells.length < cfg.minLen) return null;
    const a = { cells, dir: cells.length > 1 ? lastDir : Math.floor(random() * 4) };
    const ray = rayCells(p, a);
    if (ray.some((i) => occ[i] || mine[i])) return null;
    return a;
  }

  // Traps a new arrow x sets (gliding levels): earlier arrows whose first
  // obstacle is x and whose glide up to x ends in x's way out - glided too
  // early, they and x block each other for good.
  // `open`: per earlier arrow the free part of its way out (from the
  // head up to the first arrow in the way).
  function traps(p, open, x) {
    const mine = {};
    x.cells.forEach((i) => { mine[i] = true; });
    const xRay = {};
    rayCells(p, x).forEach((i) => { xRay[i] = true; });
    let n = 0;
    open.forEach((ray) => {
      let hit = false;
      for (let j = 0; j < ray.length; j++) {
        const i = ray[j];
        if (mine[i]) { if (hit) n++; return; }
        if (xRay[i]) hit = true;
      }
    });
    return n;
  }

  // One try at filling the field backwards (see above). On the gliding
  // levels each new arrow is the one with the most traps out of several
  // candidates.
  function build(cfg, random) {
    const p = { rows: cfg.rows, cols: cfg.cols, arrows: [] };
    const n = cfg.rows * cfg.cols;
    const occ = new Array(n).fill(false);
    let used = 0, misses = 0;
    // A miss on a gliding level already tried 30 candidates.
    const maxMisses = cfg.glide ? 15 : 400;
    while (used < cfg.fill * n && misses < maxMisses) {
      let a = null, best = -1;
      const tries = cfg.glide ? 30 : 1;
      const free = freeCells(p, cfg, occ);
      const open = cfg.glide ? p.arrows.map((b) => {
        const ray = rayCells(p, b), out = [];
        for (let j = 0; j < ray.length && !occ[ray[j]]; j++) out.push(ray[j]);
        return out;
      }) : null;
      for (let t = 0; t < tries; t++) {
        const c = candidate(p, cfg, occ, random, free);
        if (!c) continue;
        const score = cfg.glide ? traps(p, open, c) + random() * 0.5 : 0;
        if (score > best) { best = score; a = c; }
      }
      if (!a) { misses++; continue; }
      p.arrows.push(a);
      a.cells.forEach((i) => { occ[i] = true; });
      used += a.cells.length;
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
    if (cfg.glide) return generateGlide(lv, cfg, random);
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

  // Hard and Master: the build with the highest share of stuck random
  // players (40 tries each, up to 150 builds), until one reaches the
  // level's rate.
  function generateGlide(lv, cfg, random) {
    let best = null, bestRate = -1;
    for (let tries = 0; tries < 150; tries++) {
      const p = build(cfg, random);
      if (rounds(p) < cfg.rounds) continue;
      p.glide = true;
      const rate = randomFailRate(p, 40, random);
      if (rate > bestRate) { best = p; bestRate = rate; }
      if (rate >= cfg.failRate) break;
    }
    if (!best) { best = build(cfg, random); best.glide = true; }
    best.level = lv;
    return best;
  }

  /*** Gliding arrows ***/

  function startPos(p) {
    return p.arrows.map((a) => a.cells.slice());
  }

  function occupancyPos(p, pos) {
    const occ = new Array(p.rows * p.cols).fill(-1);
    pos.forEach((cells, k) => { if (cells) cells.forEach((i) => { occ[i] = k; }); });
    return occ;
  }

  // What a tap on arrow k does: { type: "leave" } when its way out is
  // free, { type: "slide", cells } when it can creep forward at least one
  // cell, { type: "blocked" } otherwise.
  function moveOf(p, pos, k, occ) {
    const cells = pos[k];
    if (!cells) return { type: "blocked" };
    occ = occ || occupancyPos(p, pos);
    const a = p.arrows[k];
    const ray = rayCells(p, { cells, dir: a.dir });
    if (ray.every((i) => occ[i] === -1)) return { type: "leave" };
    let n = 0;
    while (n < ray.length && occ[ray[n]] === -1) n++;
    if (!n) return { type: "blocked" };
    return { type: "slide", cells: cells.concat(ray.slice(0, n)).slice(n) };
  }

  // The positions after tapping arrow k (a new array), and what happened.
  function applyMove(p, pos, k) {
    const m = moveOf(p, pos, k);
    const next = pos.slice();
    if (m.type === "leave") next[k] = null;
    else if (m.type === "slide") next[k] = m.cells;
    return { move: m, pos: next };
  }

  function cleared(pos) {
    return pos.every((c) => c === null);
  }

  // Keeps tapping a random arrow that can move; true when it gets stuck.
  function randomPlayStuck(p, random) {
    let pos = startPos(p);
    for (let guard = 0; guard < 2000; guard++) {
      if (cleared(pos)) return false;
      const occ = occupancyPos(p, pos);
      const can = [];
      pos.forEach((c, k) => { if (c && moveOf(p, pos, k, occ).type !== "blocked") can.push(k); });
      if (!can.length) return true;
      pos = applyMove(p, pos, can[Math.floor(random() * can.length)]).pos;
    }
    return true;
  }

  function randomFailRate(p, tries, random) {
    let stuck = 0;
    for (let t = 0; t < tries; t++) if (randomPlayStuck(p, random || Math.random)) stuck++;
    return stuck / tries;
  }

  // A way to clear the field from `pos`: the list of arrows to tap, or
  // null when there is none (or the search gives up). Arrows that can
  // leave are taken first - leaving never blocks anyone - then gliding
  // moves are tried with a memo of positions seen.
  function solveGlide(p, pos, limit) {
    const seen = new Set();
    let nodes = 0;
    limit = limit || 20000;
    function go(cur, path) {
      if (cleared(cur)) return path;
      if (++nodes > limit) return null;
      const key = cur.map((c) => (c ? c.join(".") : "-")).join("|");
      if (seen.has(key)) return null;
      seen.add(key);
      const occ = occupancyPos(p, cur);
      const leave = [], slide = [];
      cur.forEach((c, k) => {
        if (!c) return;
        const t = moveOf(p, cur, k, occ).type;
        if (t === "leave") leave.push(k); else if (t === "slide") slide.push(k);
      });
      if (leave.length) {
        const next = cur.slice();
        leave.forEach((k) => { next[k] = null; });
        const r = go(next, path.concat(leave));
        if (r) return r;
        return null;
      }
      for (const k of slide) {
        const r = go(applyMove(p, cur, k).pos, path.concat([k]));
        if (r) return r;
      }
      return null;
    }
    return go(pos, []);
  }

  // Hint with gliding: the first arrow of a way out, -1 when there is none
  // from here (then only undo helps).
  function findHintGlide(p, pos) {
    const way = solveGlide(p, pos);
    return way && way.length ? way[0] : -1;
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

  return {
    LEVELS, DR, DC, makeRng, occupancy, rayCells, canLeave, blocker, rounds, generatePuzzle, minMoves, findHint,
    startPos, occupancyPos, moveOf, applyMove, cleared, randomPlayStuck, randomFailRate, solveGlide, findHintGlide
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ArrowsCore;
}
if (typeof window !== "undefined") {
  window.ArrowsCore = ArrowsCore;
}
