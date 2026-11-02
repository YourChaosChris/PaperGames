// irrgarten-core.js
// Rules and mazes of "Irrgarten" (en "Maze", tasks 170 and 174): a square
// grid of cells with walls; walk from the start to the goal. One person, no
// opponent, no timer.
//
// Every maze is made by the program (no copied maze): a "growing tree" walk
// over the grid, driven by a small seeded random number generator, so maze k
// of a level is the same on every device and a saved game can be loaded
// again. The result is a "perfect" maze: every cell can be reached and there
// is exactly one way between any two cells, so exactly one way from a start
// to its goal. The walk takes the newest cell (long corridors, like a
// depth-first walk) or, more often on higher levels, an older one, which
// gives more branches (BRANCHING).
//
// Start and goal (task 174) are chosen in the finished maze, anywhere on the
// edge or in the middle: the start has 2 or 3 open sides, so 2 or 3 ways go
// off; exactly one of them leads to the goal, the others end in dead ends of
// at least MIN_BRANCH cells. The goal is at least MIN_WAY cells away.
//
// Two modes: "one" (one walker, one goal) and "multi" (task 174: 2 or 3
// figures - FIGURES per level - with their own start and goal on one maze;
// child -> school, dog -> kennel, cat -> basket; drawn as circle, square and
// triangle). Each figure has exactly one way to its goal (perfect maze).
//
// Four levels: easy (children, 6 x 6, 2 ways at the start, few branches),
// medium (10 x 10), hard (15 x 15) and very hard (20 x 20). Each level has
// five mazes (SEEDS) per mode, one after the other.
//
// The walked way of a figure is always the one way from its start to where
// it is: stepping into a new cell adds it, stepping back takes the last
// cell off. A tap may also go several cells at once along a straight, open
// passage. In "multi" a tap on another figure selects it.
//
// The state is a plain serialisable object; functions return a new state.
// rules: 2 since task 174 (saves of the old mazes are refused).

const IrrgartenCore = (() => {
  const LEVELS = ["easy", "medium", "hard", "expert"];
  const MODES = ["one", "multi"];
  const SIZE = { easy: 6, medium: 10, hard: 15, expert: 20 };
  const SEEDS = {
    easy: [1101, 1102, 1103, 1104, 1105],
    medium: [2201, 2202, 2203, 2204, 2205],
    hard: [3301, 3302, 3303, 3304, 3305],
    expert: [4401, 4402, 4403, 4404, 4405]
  };
  // Seeds of "multi" mazes are SEEDS + MULTI_SEED, so they differ from "one".
  const MULTI_SEED = 50;
  const COUNT = 5;
  const RULES = 2;
  // Chance to take an older cell instead of the newest: more branches.
  const BRANCHING = { easy: 0, medium: 0.4, hard: 0.6, expert: 0.8 };
  // Ways off the start: easy always 2, higher levels 2 or 3 (3 preferred).
  const START_WAYS = { easy: [2], medium: [2, 3], hard: [3, 2], expert: [3, 2] };
  const MIN_WAY = { easy: 8, medium: 18, hard: 30, expert: 42 };
  const MIN_BRANCH = { easy: 2, medium: 3, hard: 4, expert: 5 };
  const FIGURES = { easy: 2, medium: 2, hard: 3, expert: 3 };
  const MULTI_WAY = { easy: 5, medium: 10, hard: 16, expert: 22 };
  // Open sides of a cell: north, east, south, west.
  const N = 1, E = 2, S = 4, W = 8;
  const DIRS = [[N, 0, -1, S], [E, 1, 0, W], [S, 0, 1, N], [W, -1, 0, E]];
  // How far a drawing finger may get ahead of the walked way in one move
  // (a quick finger skips a cell at a corner).
  const DRAG_REACH = 3;

  // mulberry32: small, fast, the same on every browser.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function bits(v) {
    return (v & 1) + ((v >> 1) & 1) + ((v >> 2) & 1) + ((v >> 3) & 1);
  }

  // Growing tree over an n x n grid: open sides per cell.
  function carve(n, rand, branching) {
    const open = new Array(n * n).fill(0);
    const seen = new Array(n * n).fill(false);
    const first = Math.floor(rand() * n * n);
    const active = [first];
    seen[first] = true;
    while (active.length) {
      const i = rand() < branching ? Math.floor(rand() * active.length) : active.length - 1;
      const c = active[i];
      const x = c % n, y = (c - x) / n;
      const next = [];
      DIRS.forEach((d) => {
        const nx = x + d[1], ny = y + d[2];
        if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]) next.push(d);
      });
      if (!next.length) { active.splice(i, 1); continue; }
      const d = next[Math.floor(rand() * next.length)];
      const to = (y + d[2]) * n + x + d[1];
      open[c] |= d[0];
      open[to] |= d[3];
      seen[to] = true;
      active.push(to);
    }
    return open;
  }

  function neighboursOf(n, open, c) {
    const x = c % n, y = (c - x) / n;
    const out = [];
    DIRS.forEach((d) => { if (open[c] & d[0]) out.push((y + d[2]) * n + x + d[1]); });
    return out;
  }

  // Distance (in steps) from cell a to every cell.
  function distances(n, open, a) {
    const dist = new Array(n * n).fill(-1);
    dist[a] = 0;
    const queue = [a];
    for (let i = 0; i < queue.length; i++) {
      neighboursOf(n, open, queue[i]).forEach((c) => { if (dist[c] < 0) { dist[c] = dist[queue[i]] + 1; queue.push(c); } });
    }
    return dist;
  }

  // The cells of the branch that leaves start through its neighbour b.
  function branch(n, open, start, b) {
    const seen = new Set([start, b]);
    const queue = [b];
    for (let i = 0; i < queue.length; i++) {
      neighboursOf(n, open, queue[i]).forEach((c) => { if (!seen.has(c)) { seen.add(c); queue.push(c); } });
    }
    seen.delete(start);
    return seen;
  }

  // One start and goal for mode "one": start with the wanted number of ways,
  // every way but the right one a dead end of at least MIN_BRANCH cells,
  // goal at least MIN_WAY steps away. Rules are loosened step by step only
  // if no cell fits (never seen with the fixed seeds; tests check that).
  function placeOne(level, n, open, rand) {
    const order = shuffle(Array.from({ length: n * n }, (_, i) => i), rand);
    const tries = [[MIN_WAY[level], MIN_BRANCH[level]], [Math.floor(MIN_WAY[level] / 2), 1], [1, 1]];
    for (const [minWay, minBranch] of tries) {
      for (const ways of START_WAYS[level]) {
        for (const start of order) {
          if (bits(open[start]) !== ways) continue;
          const dist = distances(n, open, start);
          const far = order.filter((c) => dist[c] >= minWay);
          if (!far.length) continue;
          const goal = far[Math.floor(rand() * far.length)];
          const ok = neighboursOf(n, open, start).every((b) => {
            const cells = branch(n, open, start, b);
            return cells.has(goal) || cells.size >= minBranch;
          });
          if (ok) return { starts: [start], goals: [goal] };
        }
      }
    }
    return { starts: [0], goals: [n * n - 1] };
  }

  // Starts and goals for mode "multi": all different cells, each goal at
  // least MULTI_WAY steps from its start; starts with 2 or 3 ways if possible
  // (with the fixed seeds always; tests check that). No start or goal lies on
  // the way of another figure.
  function placeMulti(level, n, open, rand) {
    const count = FIGURES[level];
    const order = shuffle(Array.from({ length: n * n }, (_, i) => i), rand);
    const used = new Set();   // starts and goals so far
    const ways = new Set();   // cells on the ways of the figures so far
    const starts = [], goals = [];
    const m = { n, open };
    for (let f = 0; f < count; f++) {
      let done = false;
      for (const minWay of [MULTI_WAY[level], Math.floor(MULTI_WAY[level] / 2), 1]) {
        for (const wide of [true, false]) {
          for (const start of order) {
            if (used.has(start) || ways.has(start) || (wide && (bits(open[start]) < 2 || bits(open[start]) > 3))) continue;
            const dist = distances(n, open, start);
            // No figure ever stands on the way of another (a figure at its
            // goal stays there), so no way is blocked.
            const far = order.filter((c) => !used.has(c) && !ways.has(c) && c !== start && dist[c] >= minWay && !route(m, start, c).some((x) => used.has(x)));
            if (!far.length) continue;
            const goal = far[Math.floor(rand() * far.length)];
            starts.push(start); goals.push(goal); used.add(start); used.add(goal);
            route(m, start, goal).forEach((x) => ways.add(x));
            done = true;
            break;
          }
          if (done) break;
        }
        if (done) break;
      }
    }
    return { starts, goals };
  }

  const cache = {};

  // Maze k (0 to 4) of a level and mode:
  // { n, open: [bits per cell], starts: [cell per figure], goals: [...],
  //   start, goal (of the first figure) }.
  function maze(level, k, mode) {
    const md = mode === "multi" ? "multi" : "one";
    const id = level + ":" + k + ":" + md;
    if (cache[id]) return cache[id];
    const n = SIZE[level];
    const rand = rng(SEEDS[level][k] + (md === "multi" ? MULTI_SEED : 0));
    const open = carve(n, rand, BRANCHING[level]);
    const place = md === "multi" ? placeMulti(level, n, open, rand) : placeOne(level, n, open, rand);
    cache[id] = { n, open, mode: md, starts: place.starts, goals: place.goals, start: place.starts[0], goal: place.goals[0] };
    return cache[id];
  }

  function neighbours(m, c) {
    return neighboursOf(m.n, m.open, c);
  }

  function adjacentOpen(m, a, b) {
    return neighbours(m, a).indexOf(b) >= 0;
  }

  // The one way from cell a to cell b (both included).
  function route(m, a, b) {
    const prev = new Array(m.n * m.n).fill(-1);
    prev[a] = a;
    const queue = [a];
    for (let i = 0; i < queue.length && prev[b] < 0; i++) {
      neighbours(m, queue[i]).forEach((c) => { if (prev[c] < 0) { prev[c] = queue[i]; queue.push(c); } });
    }
    if (prev[b] < 0) return null;
    const out = [b];
    while (out[0] !== a) out.unshift(prev[out[0]]);
    return out;
  }

  // The way of figure f (default the first) from its start to its goal.
  function solution(m, f) {
    const i = f || 0;
    return route(m, m.starts[i], m.goals[i]);
  }

  // How many ways lead off the start of figure f, and how many of them
  // reach its goal (task 174: 2 or 3 ways, exactly one right).
  function startWays(m, f) {
    const i = f || 0;
    const ways = neighbours(m, m.starts[i]);
    const right = ways.filter((b) => branch(m.n, m.open, m.starts[i], b).has(m.goals[i])).length;
    return { ways: ways.length, right };
  }

  function mazeOf(s) {
    return maze(s.level, s.k, s.mode);
  }

  function newGame(level, k, mode) {
    const lv = LEVELS.indexOf(level) >= 0 ? level : "easy";
    const kk = Number.isInteger(k) && k >= 0 && k < COUNT ? k : 0;
    const md = mode === "multi" ? "multi" : "one";
    const m = maze(lv, kk, md);
    return { game: "irrgarten", rules: RULES, level: lv, k: kk, mode: md, paths: m.starts.map((c) => [c]), sel: 0, steps: 0, solved: false };
  }

  function valid(s) {
    if (!s || s.game !== "irrgarten" || s.rules !== RULES || LEVELS.indexOf(s.level) < 0 || MODES.indexOf(s.mode) < 0) return false;
    if (!Number.isInteger(s.k) || s.k < 0 || s.k >= COUNT || !Array.isArray(s.paths)) return false;
    const m = mazeOf(s);
    if (s.paths.length !== m.starts.length || !Number.isInteger(s.sel) || s.sel < 0 || s.sel >= s.paths.length) return false;
    return s.paths.every((p, f) => {
      if (!Array.isArray(p) || !p.length || p[0] !== m.starts[f]) return false;
      for (let i = 1; i < p.length; i++) if (!adjacentOpen(m, p[i - 1], p[i])) return false;
      return new Set(p).size === p.length;
    });
  }

  // Where figure f is (default the selected one).
  function last(s, f) {
    const p = s.paths[f === undefined ? s.sel : f];
    return p[p.length - 1];
  }

  // The walked way of the selected figure.
  function path(s) {
    return s.paths[s.sel];
  }

  function arrived(s, f) {
    return last(s, f) === mazeOf(s).goals[f];
  }

  // One step to an open neighbour: back when it is the cell before, else on.
  function stepTo(p, c) {
    if (p.length > 1 && p[p.length - 2] === c) p.pop();
    else p.push(c);
  }

  // New way p for the selected figure. In "multi", a figure that has just
  // arrived hands the selection to the next one still on its way.
  function finish(s, p, steps) {
    const paths = s.paths.slice();
    paths[s.sel] = p;
    const next = Object.assign({}, s, { paths, steps: s.steps + steps });
    next.solved = paths.every((_, f) => arrived(next, f));
    if (!next.solved && arrived(next, s.sel) && !arrived(s, s.sel)) {
      for (let k = 1; k < paths.length; k++) {
        const f = (s.sel + k) % paths.length;
        if (!arrived(next, f)) { next.sel = f; break; }
      }
    }
    return next;
  }

  // The figure (other than the selected one) standing on cell c, or -1.
  function figureAt(s, c) {
    for (let f = 0; f < s.paths.length; f++) if (f !== s.sel && last(s, f) === c) return f;
    return -1;
  }

  function select(s, f) {
    if (!Number.isInteger(f) || f < 0 || f >= s.paths.length || f === s.sel) return s;
    return Object.assign({}, s, { sel: f });
  }

  // A tap on cell c. Results: "select" (another figure stands there: it is
  // selected), "same" (where you are), "step" (one or more cells along a
  // straight open passage, forwards or back), "back" (a cell of the walked
  // way further back: the way goes back to it), "wall" (a wall in between),
  // "far" (not in a straight line), "home" (this figure is at its goal and
  // the tap is not on its way). Only "select", "step" and "back" change the
  // state.
  function tap(s, c) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    const other = figureAt(s, c);
    if (other >= 0) return { state: select(s, other), ok: true, reason: "select" };
    const m = mazeOf(s);
    const at = last(s);
    if (c === at) return { state: s, ok: false, reason: "same" };
    const way = path(s);
    const i = way.indexOf(c);
    if (i >= 0) return { state: finish(s, way.slice(0, i + 1), way.length - 1 - i), ok: true, reason: "back" };
    if (arrived(s, s.sel)) return { state: s, ok: false, reason: "home" };
    const ax = at % m.n, ay = (at - ax) / m.n, cx = c % m.n, cy = (c - cx) / m.n;
    if (ax !== cx && ay !== cy) return { state: s, ok: false, reason: "far" };
    const dx = Math.sign(cx - ax), dy = Math.sign(cy - ay);
    const p = way.slice();
    let q = at, steps = 0;
    while (q !== c) {
      const r = q + dy * m.n + dx;
      if (!adjacentOpen(m, q, r)) return { state: s, ok: false, reason: "wall" };
      stepTo(p, r);
      steps++;
      q = r;
      if (q === m.goals[s.sel] && q !== c) break;
    }
    return { state: finish(s, p, steps), ok: true, reason: "step" };
  }

  // A drawing finger is over cell c: follow it when the way there is at most
  // DRAG_REACH cells long (any direction, round corners).
  function drawTo(s, c) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    const m = mazeOf(s);
    const at = last(s);
    if (c === at) return { state: s, ok: false, reason: "same" };
    const way = path(s);
    if (arrived(s, s.sel) && way.indexOf(c) < 0) return { state: s, ok: false, reason: "home" };
    const r = route(m, at, c);
    if (!r || r.length - 1 > DRAG_REACH) return { state: s, ok: false, reason: "far" };
    const p = way.slice();
    for (let i = 1; i < r.length; i++) stepTo(p, r[i]);
    return { state: finish(s, p, r.length - 1), ok: true, reason: "step" };
  }

  // "Back": one cell back along the walked way of the selected figure.
  function undo(s) {
    const way = path(s);
    if (way.length < 2) return s;
    const paths = s.paths.slice();
    paths[s.sel] = way.slice(0, -1);
    return Object.assign({}, s, { paths, steps: s.steps + 1, solved: false });
  }

  // "Hint": the next cells of the right way of the selected figure from
  // where it is (also out of a dead end, back to where the right way goes on).
  function hint(s, count) {
    const m = mazeOf(s);
    return route(m, last(s), m.goals[s.sel]).slice(1, 1 + (count || 3));
  }

  function nextMaze(k) {
    return (k + 1) % COUNT;
  }

  return { LEVELS, MODES, SIZE, SEEDS, MULTI_SEED, COUNT, RULES, BRANCHING, START_WAYS, MIN_WAY, MIN_BRANCH, FIGURES, MULTI_WAY, N, E, S, W, DIRS, DRAG_REACH, rng, bits, maze, mazeOf, neighbours, adjacentOpen, route, solution, startWays, distances, newGame, valid, last, path, arrived, figureAt, select, tap, drawTo, undo, hint, nextMaze };
})();

if (typeof module !== "undefined") module.exports = IrrgartenCore;
if (typeof window !== "undefined") window.IrrgartenCore = IrrgartenCore;
