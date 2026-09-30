// cratepusher-core.js
// Rules engine and level generator for Crate Pusher ("Kistenschieber"):
// push every crate onto a target. No DOM here - the page is
// cratepusher-app.js.
//
// Rules: a rectangular grid of wall and floor cells, one pusher, as many
// crates as targets. The pusher walks up, down, left and right. Walking
// into a crate pushes it one cell on if the cell behind it is free (no
// wall, no second crate) - never two crates at once, and crates can't be
// pulled. The level is solved when every crate stands on a target.
//
// Every level is made by this program; none comes from anywhere else.
// Generation works backwards, so every level is solvable by construction:
//   1. A room: walls all round, some inner walls, one connected floor.
//   2. Targets are chosen and the crates put right on them - solved.
//   3. From there the game is played in reverse: a reverse move is a
//      pull (the pusher stands next to a crate, steps away and drags it
//      along). A breadth-first search over pulls finds, for every
//      position it reaches, the fewest pushes that solve it.
//   4. The position furthest away (in pushes, not steps) with no crate on
//      a target becomes the level.
//   5. An independent forward solver checks the level and measures its
//      shortest solution in pushes - the difficulty.
// Levels that are too short, or whose search runs over budget, are thrown
// away and the next room is tried. All of this runs in small steps
// (createGenerator / generateLevelAsync), so a slow e-reader never
// freezes.
//
// Cells are numbered y * width + x. A position is { crates: [cells],
// pusher: cell }.

const CratePusherCore = (function () {
  const LEVELS = {
    easy:   { width: 7,  height: 7,  crates: 3, minPushes: 8,  walls: [0.10, 0.18], reverseBudget: 20000, solveBudget: 60000 },
    medium: { width: 9,  height: 9,  crates: 4, minPushes: 15, walls: [0.12, 0.22], reverseBudget: 40000, solveBudget: 150000 },
    hard:   { width: 10, height: 10, crates: 5, minPushes: 25, walls: [0.25, 0.35], reverseBudget: 60000, solveBudget: 300000 }
  };
  const STEP_NODES = 1200; // search nodes per generator step (about 0.1 s on a slow reader)

  function makeRng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function dirs(width) {
    return [-width, width, -1, 1];
  }

  /*** Rooms ***/

  // A room of the given size: walls[] true for wall cells, with one
  // connected floor area. Returns null if the floor came out too small.
  function makeRoom(width, height, rng, density) {
    const dens = density || [0.10, 0.18];
    const n = width * height;
    const walls = new Array(n).fill(true);
    const inner = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        walls[y * width + x] = false;
        inner.push(y * width + x);
      }
    }
    // Scatter inner walls: single cells and short bars.
    const pieces = Math.round(inner.length * (dens[0] + rng() * (dens[1] - dens[0])));
    for (let k = 0; k < pieces; k++) {
      const c = inner[Math.floor(rng() * inner.length)];
      walls[c] = true;
      const r = rng();
      if (r < 0.35) {
        const d = rng() < 0.5 ? 1 : width;
        if (!isBorder(c + d, width, height)) walls[c + d] = true;
      }
    }
    // Keep the largest connected floor area.
    const seen = new Array(n).fill(false);
    let best = [];
    inner.forEach((c) => {
      if (walls[c] || seen[c]) return;
      const comp = flood(c, (x) => !walls[x], width, seen);
      if (comp.length > best.length) best = comp;
    });
    const keep = new Set(best);
    inner.forEach((c) => { if (!keep.has(c)) walls[c] = true; });
    // Fill dead ends (floor with three wall neighbours) - they only make
    // the room larger without making it more interesting.
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of inner) {
        if (walls[c]) continue;
        const open = dirs(width).filter((d) => !walls[c + d]).length;
        if (open <= 1) { walls[c] = true; changed = true; }
      }
    }
    const floor = inner.filter((c) => !walls[c]);
    if (floor.length < inner.length * 0.45) return null;
    // Still one area after filling dead ends? (It is, but make sure.)
    const check = flood(floor[0], (x) => !walls[x], width, new Array(n).fill(false));
    if (check.length !== floor.length) return null;
    return { width, height, walls, floor };
  }

  function isBorder(c, width, height) {
    const x = c % width, y = Math.floor(c / width);
    return x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1;
  }

  // Cells reachable from start through cells where ok(cell) holds.
  function flood(start, ok, width, seen) {
    const out = [start];
    seen[start] = true;
    const ds = dirs(width);
    for (let i = 0; i < out.length; i++) {
      const c = out[i];
      for (const d of ds) {
        const t = c + d;
        if (!seen[t] && ok(t)) { seen[t] = true; out.push(t); }
      }
    }
    return out;
  }

  /*** Positions ***/

  // Where the pusher can walk without pushing, plus the smallest such
  // cell (used to tell positions apart independent of the exact square
  // the pusher stands on).
  function reach(room, occupied, from) {
    const seen = new Uint8Array(room.walls.length);
    const stack = [from];
    seen[from] = 1;
    let min = from;
    const ds = dirs(room.width);
    while (stack.length) {
      const c = stack.pop();
      if (c < min) min = c;
      for (const d of ds) {
        const t = c + d;
        if (!seen[t] && !room.walls[t] && !occupied[t]) { seen[t] = 1; stack.push(t); }
      }
    }
    return { seen, min };
  }

  // Only the smallest reachable cell, with buffers shared per room - the
  // search calls this for every new position, so it must not allocate.
  function reachMin(room, occupied, from) {
    if (!room._stamp) {
      room._stamp = new Int32Array(room.walls.length);
      room._stack = new Int32Array(room.walls.length);
      room._gen = 0;
      room._ds = dirs(room.width);
    }
    const stamp = room._stamp, stack = room._stack, ds = room._ds, walls = room.walls;
    const gen = ++room._gen;
    let top = 0, min = from;
    stack[top++] = from;
    stamp[from] = gen;
    while (top) {
      const c = stack[--top];
      if (c < min) min = c;
      for (let k = 0; k < 4; k++) {
        const t = c + ds[k];
        if (stamp[t] !== gen && !walls[t] && !occupied[t]) { stamp[t] = gen; stack[top++] = t; }
      }
    }
    return min;
  }

  function keyOf(crates, pusherMin) {
    let k = String.fromCharCode(pusherMin + 32);
    for (const c of crates) k += String.fromCharCode(c + 32);
    return k;
  }

  function occupancy(n, crates) {
    const occ = new Uint8Array(n);
    for (const c of crates) occ[c] = 1;
    return occ;
  }

  function onTargets(crates, targetSet) {
    let k = 0;
    for (const c of crates) if (targetSet[c]) k++;
    return k;
  }

  // Cells from which a single crate can still be pushed onto a target
  // (ignoring other crates). A crate anywhere else is stuck for good.
  function liveCells(room, targets) {
    const n = room.walls.length;
    const live = new Uint8Array(n);
    const queue = [];
    targets.forEach((t) => { live[t] = 1; queue.push(t); });
    const ds = dirs(room.width);
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      for (const d of ds) {
        // A crate at p+d pushed by a pusher at p+2d arrives at p.
        const a = p + d, b = p + 2 * d;
        if (a < 0 || b < 0 || a >= n || b >= n) continue;
        if (!live[a] && !room.walls[a] && !room.walls[b]) { live[a] = 1; queue.push(a); }
      }
    }
    return live;
  }

  /*** Reverse search (pulls) ***/

  // Breadth-first search over pulls from the solved position(s). Resumable:
  // run(maxNodes) expands at most that many positions and returns true
  // once finished (queue empty or budget used up).
  function createReverseSearch(room, targets, budget, earlyExit) {
    const n = room.walls.length;
    const ds = dirs(room.width);
    const targetSet = new Uint8Array(n);
    targets.forEach((t) => { targetSet[t] = 1; });
    const seenKeys = new Map();
    const queue = [];
    let head = 0;
    let deepest = 0;
    const byDepth = []; // depth -> list of queue indices
    const crates0 = targets.slice().sort((a, b) => a - b);
    const occ0 = occupancy(n, crates0);
    // The pusher may be in any area left free by the crates.
    const covered = new Uint8Array(n);
    room.floor.forEach((c) => {
      if (occ0[c] || covered[c]) return;
      const r = reach(room, occ0, c);
      for (let i = 0; i < n; i++) if (r.seen[i]) covered[i] = 1;
      const key = keyOf(crates0, r.min);
      if (!seenKeys.has(key)) {
        seenKeys.set(key, 0);
        queue.push({ crates: crates0, pusher: r.min, depth: 0 });
      }
    });

    function add(state) {
      const idx = queue.length;
      queue.push(state);
      if (!byDepth[state.depth]) byDepth[state.depth] = [];
      byDepth[state.depth].push(idx);
      if (state.depth > deepest) deepest = state.depth;
    }

    function run(maxNodes) {
      let nodes = 0;
      while (head < queue.length) {
        if (nodes++ >= maxNodes) return false;
        if (queue.length > budget) { head = queue.length; break; }
        // A room that spreads wide instead of deep: once half the budget
        // is used and the search is not even halfway to the depth needed,
        // give up early and let the generator try the next room.
        if (earlyExit && queue.length > budget / 2 && deepest * 2 < earlyExit) { head = queue.length; break; }
        const s = queue[head++];
        const occ = occupancy(n, s.crates);
        const r = reach(room, occ, s.pusher);
        for (let i = 0; i < s.crates.length; i++) {
          const b = s.crates[i];
          for (const d of ds) {
            const stand = b + d, to = b + 2 * d;
            if (!r.seen[stand]) continue;
            if (room.walls[to] || occ[to]) continue;
            const crates = s.crates.slice();
            crates[i] = stand;
            crates.sort((x, y) => x - y);
            occ[b] = 0; occ[stand] = 1;
            const min2 = reachMin(room, occ, to);
            occ[b] = 1; occ[stand] = 0;
            const key = keyOf(crates, min2);
            if (seenKeys.has(key)) continue;
            seenKeys.set(key, s.depth + 1);
            add({ crates, pusher: to, depth: s.depth + 1 });
          }
        }
      }
      return true;
    }

    // Candidate starting positions, deepest first, with no crate on a
    // target. Returns [{ crates, pusher, depth }].
    function candidates(minDepth) {
      const out = [];
      for (let d = deepest; d >= minDepth; d--) {
        const list = byDepth[d] || [];
        list.forEach((idx) => {
          const s = queue[idx];
          if (onTargets(s.crates, targetSet) === 0) out.push(s);
        });
        if (out.length) break;
      }
      return out;
    }

    return { run, candidates, get deepest() { return deepest; }, get size() { return queue.length; } };
  }

  /*** Forward solver (pushes) ***/

  // Breadth-first search over pushes from a position to any solved one.
  // Resumable like the reverse search. result: null while running, then
  // { solvable, pushes, first } or { solvable: false, aborted: true }.
  // `first` is the first push of that shortest solution, { from, to }
  // (the crate's cell and the cell it goes to); null when already solved.
  // The pusher can always walk to the cell behind `from` without pushing.
  function createSolver(room, targets, start, budget) {
    const n = room.walls.length;
    const ds = dirs(room.width);
    const targetSet = new Uint8Array(n);
    targets.forEach((t) => { targetSet[t] = 1; });
    const live = liveCells(room, targets);
    const seenKeys = new Set();
    const crates0 = start.crates.slice().sort((a, b) => a - b);
    const r0 = reach(room, occupancy(n, crates0), start.pusher);
    const queue = [{ crates: crates0, pusher: r0.min, depth: 0, first: null }];
    seenKeys.add(keyOf(crates0, r0.min));
    let head = 0;
    let result = null;
    if (onTargets(crates0, targetSet) === crates0.length) result = { solvable: true, pushes: 0, first: null };
    if (!result && crates0.some((c) => !live[c])) result = { solvable: false };

    function run(maxNodes) {
      if (result) return true;
      let nodes = 0;
      while (head < queue.length) {
        if (nodes++ >= maxNodes) return false;
        if (seenKeys.size > budget) { result = { solvable: false, aborted: true }; return true; }
        const s = queue[head++];
        const occ = occupancy(n, s.crates);
        const r = reach(room, occ, s.pusher);
        for (let i = 0; i < s.crates.length; i++) {
          const b = s.crates[i];
          for (const d of ds) {
            const from = b - d, to = b + d;
            if (!r.seen[from]) continue;
            if (room.walls[to] || occ[to] || !live[to]) continue;
            const crates = s.crates.slice();
            crates[i] = to;
            crates.sort((x, y) => x - y);
            const first = s.first || { from: b, to };
            if (onTargets(crates, targetSet) === crates.length) {
              result = { solvable: true, pushes: s.depth + 1, first };
              return true;
            }
            occ[b] = 0; occ[to] = 1;
            const min2 = reachMin(room, occ, b);
            occ[b] = 1; occ[to] = 0;
            const key = keyOf(crates, min2);
            if (seenKeys.has(key)) continue;
            seenKeys.add(key);
            queue.push({ crates, pusher: b, depth: s.depth + 1, first });
          }
        }
      }
      result = { solvable: false };
      return true;
    }

    return { run, get result() { return result; } };
  }

  function solve(room, targets, start, budget) {
    const s = createSolver(room, targets, start, budget || 1e6);
    while (!s.run(1e9)) { /* runs to the end */ }
    return s.result;
  }

  /*** The generator ***/

  // Makes a level in small steps. step() returns null until the level is
  // ready, then { width, height, walls, targets, crates, pusher,
  // minPushes, difficulty }.
  function createGenerator(difficulty, rng) {
    const cfg = LEVELS[difficulty] || LEVELS.medium;
    const random = rng || Math.random;
    let phase = "room";
    let room, targets, search, solver, chosen;
    let tries = 0;

    function pickTargets() {
      const pool = room.floor.slice();
      const out = [];
      for (let k = 0; k < cfg.crates && pool.length; k++) {
        const i = Math.floor(random() * pool.length);
        out.push(pool.splice(i, 1)[0]);
      }
      return out;
    }

    function step() {
      if (phase === "room") {
        tries++;
        room = makeRoom(cfg.width, cfg.height, random, cfg.walls);
        if (!room || room.floor.length < cfg.crates + 6) return null;
        targets = pickTargets();
        search = createReverseSearch(room, targets, cfg.reverseBudget, cfg.minPushes);
        phase = "reverse";
        return null;
      }
      if (phase === "reverse") {
        if (!search.run(STEP_NODES)) return null;
        const cands = search.candidates(cfg.minPushes);
        if (!cands.length) { phase = "room"; return null; }
        const s = cands[Math.floor(random() * cands.length)];
        // Put the pusher on a concrete cell of its area.
        const occ = occupancy(room.walls.length, s.crates);
        const r = reach(room, occ, s.pusher);
        const cells = [];
        for (let i = 0; i < r.seen.length; i++) if (r.seen[i]) cells.push(i);
        chosen = { crates: s.crates.slice(), pusher: cells[Math.floor(random() * cells.length)], depth: s.depth };
        solver = createSolver(room, targets, chosen, cfg.solveBudget);
        phase = "verify";
        return null;
      }
      if (phase === "verify") {
        if (!solver.run(STEP_NODES)) return null;
        const res = solver.result;
        if (!res.solvable || res.pushes < cfg.minPushes) { phase = "room"; return null; }
        return {
          width: room.width,
          height: room.height,
          walls: room.walls.map((w) => (w ? 1 : 0)),
          targets: targets.slice().sort((a, b) => a - b),
          crates: chosen.crates.slice(),
          pusher: chosen.pusher,
          minPushes: res.pushes,
          reverseDepth: chosen.depth,
          difficulty,
          tries
        };
      }
      return null;
    }

    return { step };
  }

  function generateLevel(difficulty, rng) {
    const g = createGenerator(difficulty, rng);
    let lvl = null;
    while (!(lvl = g.step())) { /* keep going */ }
    return lvl;
  }

  function generateLevelAsync(difficulty, rng, done) {
    const g = createGenerator(difficulty, rng);
    function tick() {
      const lvl = g.step();
      if (lvl) done(lvl);
      else setTimeout(tick, 0);
    }
    tick();
  }

  /*** Playing ***/

  function roomOf(level) {
    const floor = [];
    level.walls.forEach((w, i) => { if (!w) floor.push(i); });
    return { width: level.width, height: level.height, walls: level.walls, floor };
  }

  // One step in direction d ("up", "down", "left", "right") from the
  // position. Returns { ok, crates, pusher, pushed: { from, to } | null,
  // reason }.
  function move(level, pos, dir) {
    const d = { up: -level.width, down: level.width, left: -1, right: 1 }[dir];
    if (d === undefined) return { ok: false, reason: "bad-dir" };
    const t = pos.pusher + d;
    if (level.walls[t]) return { ok: false, reason: "wall" };
    const i = pos.crates.indexOf(t);
    if (i === -1) return { ok: true, crates: pos.crates.slice(), pusher: t, pushed: null };
    const beyond = t + d;
    if (level.walls[beyond]) return { ok: false, reason: "crate-wall" };
    if (pos.crates.indexOf(beyond) !== -1) return { ok: false, reason: "crate-crate" };
    const crates = pos.crates.slice();
    crates[i] = beyond;
    return { ok: true, crates, pusher: t, pushed: { from: t, to: beyond } };
  }

  // The shortest walk (list of cells, excluding the start) to `target`
  // without pushing any crate, or null.
  function walkPath(level, pos, target) {
    if (level.walls[target] || pos.crates.indexOf(target) !== -1) return null;
    if (target === pos.pusher) return [];
    const n = level.walls.length;
    const occ = occupancy(n, pos.crates);
    const prev = new Int32Array(n).fill(-1);
    const queue = [pos.pusher];
    prev[pos.pusher] = pos.pusher;
    const ds = dirs(level.width);
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i];
      if (c === target) break;
      for (const d of ds) {
        const t = c + d;
        if (t < 0 || t >= n || prev[t] !== -1 || level.walls[t] || occ[t]) continue;
        prev[t] = c;
        queue.push(t);
      }
    }
    if (prev[target] === -1) return null;
    const path = [];
    for (let c = target; c !== pos.pusher; c = prev[c]) path.push(c);
    return path.reverse();
  }

  function cratesOnTargets(level, crates) {
    return crates.filter((c) => level.targets.indexOf(c) !== -1).length;
  }

  function isSolved(level, crates) {
    return cratesOnTargets(level, crates) === crates.length;
  }

  // Crates standing in a corner (walls on two sides at right angles) on a
  // cell that is not a target - they can never move again.
  function cornerStuck(level, crates) {
    const w = level.width;
    return crates.filter((c) => {
      if (level.targets.indexOf(c) !== -1) return false;
      const up = level.walls[c - w], down = level.walls[c + w];
      const left = level.walls[c - 1], right = level.walls[c + 1];
      return (up || down) && (left || right);
    });
  }

  return {
    LEVELS,
    STEP_NODES,
    makeRng,
    makeRoom,
    liveCells,
    createReverseSearch,
    createSolver,
    solve,
    createGenerator,
    generateLevel,
    generateLevelAsync,
    roomOf,
    move,
    walkPath,
    cratesOnTargets,
    isSolved,
    cornerStuck
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CratePusherCore;
}
if (typeof window !== "undefined") {
  window.CratePusherCore = CratePusherCore;
}
