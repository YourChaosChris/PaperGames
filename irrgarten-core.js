// irrgarten-core.js
// Rules and mazes of "Irrgarten" (en "Maze", task 170): a square grid of
// cells with walls; walk from the start (top left) to the goal (bottom
// right). One person, no opponent, no timer.
//
// Every maze is made by the program (no copied maze): a depth-first walk
// with backtracking over the grid, driven by a small seeded random number
// generator, so maze k of a level is the same on every device and a saved
// game can be loaded again. The result is a "perfect" maze: every cell can
// be reached and there is exactly one way between any two cells, so exactly
// one way from start to goal.
//
// Four levels: easy (children, 6 x 6, wide passages), medium (10 x 10), hard
// (15 x 15) and very hard (20 x 20). Each level has five mazes (SEEDS), one
// after the other.
//
// The walked way is always the one way from the start to where you are:
// stepping into a new cell adds it, stepping back takes the last cell off.
// A tap may also go several cells at once along a straight, open passage.
//
// The state is a plain serialisable object; functions return a new state.

const IrrgartenCore = (() => {
  const LEVELS = ["easy", "medium", "hard", "expert"];
  const SIZE = { easy: 6, medium: 10, hard: 15, expert: 20 };
  const SEEDS = {
    easy: [1101, 1102, 1103, 1104, 1105],
    medium: [2201, 2202, 2203, 2204, 2205],
    hard: [3301, 3302, 3303, 3304, 3305],
    expert: [4401, 4402, 4403, 4404, 4405]
  };
  const COUNT = 5;
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

  const cache = {};

  // Maze k (0 to 4) of a level: { n, open: [bits per cell], start, goal }.
  function maze(level, k) {
    const id = level + ":" + k;
    if (cache[id]) return cache[id];
    const n = SIZE[level];
    const rand = rng(SEEDS[level][k]);
    const open = new Array(n * n).fill(0);
    const seen = new Array(n * n).fill(false);
    const stack = [0];
    seen[0] = true;
    while (stack.length) {
      const c = stack[stack.length - 1];
      const x = c % n, y = (c - x) / n;
      const next = [];
      DIRS.forEach((d) => {
        const nx = x + d[1], ny = y + d[2];
        if (nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]) next.push(d);
      });
      if (!next.length) { stack.pop(); continue; }
      const d = next[Math.floor(rand() * next.length)];
      const to = (y + d[2]) * n + x + d[1];
      open[c] |= d[0];
      open[to] |= d[3];
      seen[to] = true;
      stack.push(to);
    }
    cache[id] = { n, open, start: 0, goal: n * n - 1 };
    return cache[id];
  }

  function neighbours(m, c) {
    const x = c % m.n, y = (c - x) / m.n;
    const out = [];
    DIRS.forEach((d) => { if (m.open[c] & d[0]) out.push((y + d[2]) * m.n + x + d[1]); });
    return out;
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

  function solution(m) {
    return route(m, m.start, m.goal);
  }

  function mazeOf(s) {
    return maze(s.level, s.k);
  }

  function newGame(level, k) {
    const lv = LEVELS.indexOf(level) >= 0 ? level : "easy";
    const kk = Number.isInteger(k) && k >= 0 && k < COUNT ? k : 0;
    return { game: "irrgarten", rules: 1, level: lv, k: kk, path: [0], steps: 0, solved: false };
  }

  function valid(s) {
    if (!s || s.game !== "irrgarten" || s.rules !== 1 || LEVELS.indexOf(s.level) < 0) return false;
    if (!Number.isInteger(s.k) || s.k < 0 || s.k >= COUNT || !Array.isArray(s.path) || !s.path.length || s.path[0] !== 0) return false;
    const m = mazeOf(s);
    for (let i = 1; i < s.path.length; i++) if (!adjacentOpen(m, s.path[i - 1], s.path[i])) return false;
    return new Set(s.path).size === s.path.length;
  }

  function last(s) {
    return s.path[s.path.length - 1];
  }

  // One step to an open neighbour: back when it is the cell before, else on.
  function stepTo(path, c) {
    if (path.length > 1 && path[path.length - 2] === c) path.pop();
    else path.push(c);
  }

  function finish(s, path, steps) {
    const m = mazeOf(s);
    return Object.assign({}, s, { path, steps: s.steps + steps, solved: path[path.length - 1] === m.goal });
  }

  // A tap on cell c. Results: "same" (where you are), "step" (one or more
  // cells along a straight open passage, forwards or back), "back" (a cell of
  // the walked way further back: the way goes back to it), "wall" (a wall in
  // between), "far" (not in a straight line). Only "step" and "back" change
  // the state.
  function tap(s, c) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    const m = mazeOf(s);
    const at = last(s);
    if (c === at) return { state: s, ok: false, reason: "same" };
    const i = s.path.indexOf(c);
    if (i >= 0) return { state: finish(s, s.path.slice(0, i + 1), s.path.length - 1 - i), ok: true, reason: "back" };
    const ax = at % m.n, ay = (at - ax) / m.n, cx = c % m.n, cy = (c - cx) / m.n;
    if (ax !== cx && ay !== cy) return { state: s, ok: false, reason: "far" };
    const dx = Math.sign(cx - ax), dy = Math.sign(cy - ay);
    const path = s.path.slice();
    let p = at, steps = 0;
    while (p !== c) {
      const q = p + dy * m.n + dx;
      if (!adjacentOpen(m, p, q)) return { state: s, ok: false, reason: "wall" };
      stepTo(path, q);
      steps++;
      p = q;
    }
    return { state: finish(s, path, steps), ok: true, reason: "step" };
  }

  // A drawing finger is over cell c: follow it when the way there is at most
  // DRAG_REACH cells long (any direction, round corners).
  function drawTo(s, c) {
    if (s.solved) return { state: s, ok: false, reason: "solved" };
    const m = mazeOf(s);
    const at = last(s);
    if (c === at) return { state: s, ok: false, reason: "same" };
    const r = route(m, at, c);
    if (!r || r.length - 1 > DRAG_REACH) return { state: s, ok: false, reason: "far" };
    const path = s.path.slice();
    for (let i = 1; i < r.length; i++) stepTo(path, r[i]);
    return { state: finish(s, path, r.length - 1), ok: true, reason: "step" };
  }

  // "Back": one cell back along the walked way.
  function undo(s) {
    if (s.path.length < 2) return s;
    return Object.assign({}, s, { path: s.path.slice(0, -1), steps: s.steps + 1, solved: false });
  }

  // "Hint": the next cells of the right way from where you are (also out of
  // a dead end, back to where the right way goes on).
  function hint(s, count) {
    const m = mazeOf(s);
    return route(m, last(s), m.goal).slice(1, 1 + (count || 3));
  }

  function nextMaze(k) {
    return (k + 1) % COUNT;
  }

  return { LEVELS, SIZE, SEEDS, COUNT, N, E, S, W, DIRS, DRAG_REACH, rng, maze, mazeOf, neighbours, adjacentOpen, route, solution, newGame, valid, last, tap, drawTo, undo, hint, nextMaze };
})();

if (typeof module !== "undefined") module.exports = IrrgartenCore;
if (typeof window !== "undefined") window.IrrgartenCore = IrrgartenCore;
