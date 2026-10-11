// cake-core.js
// "Who Took the Cake?" - a detective logic puzzle. Dependency-free, no DOM.
//
// The board is an N x N floor plan split into rooms. Some cells hold
// furniture (table, chair, rug, plant, cupboard); a window sits on the
// left or right outer wall of one row. N things are placed: N-1 animals
// and the cake, one per row and one per column. The cake always stands
// on a table; animals never stand on a table, a cupboard or a plant. Exactly one
// animal shares the cake's room - that animal took the cake. Clues about
// the animals pin the placement down to a single solution.
//
// A puzzle:
//   n          board size
//   rooms      room index per cell (cell i = row * n + col)
//   roomNames  room name id per room index ("kitchen", "garden", ...)
//   furniture  "table" | "chair" | "rug" | "plant" | "cupboard" | null per cell
//   window     { row, side: "left" | "right" }
//   clues      see below
//   solution   cell per thing: things 0..n-2 are animals (ANIMALS order),
//              thing n-1 is the cake
//
// Clues (a, b: animal index):
//   { t: "in", a, room }       a is in that room
//   { t: "notin", a, room }    a is not in that room
//   { t: "on", a, f }          a sits on a chair or rug
//   { t: "next", a, f }        a is directly beside (not diagonally) a plant or cupboard
//                              in the same room - not behind a wall
//   { t: "window", a }         a is in the window's row
//   { t: "edge", a, side }     a is in the top/bottom row or left/right column
//   { t: "same", a, b }        a and b are in the same room

const CakeCore = (function () {
  const ANIMALS = ["dog", "cat", "rabbit", "mouse", "hedgehog"];
  // Themes: the same puzzle with other pictures and names. "cats" (p.motif)
  // has five cats told apart by pattern and name, and a fish instead of
  // the cake; rules, generator and clues stay the same. A puzzle without
  // p.motif (older saves) is the animals theme.
  const MOTIFS = ["animals", "cats"];
  const CATS = ["cattiger", "catluna", "catmimi", "catfelix", "catmax"];
  const ROOM_NAMES = ["kitchen", "living", "hall", "bath", "bedroom", "garden", "cellar"];
  const FURNITURE = ["table", "chair", "rug", "plant", "cupboard"];
  // Furniture no animal can stand on (the cake stands on a table).
  const BLOCKING = ["table", "cupboard", "plant"];
  // extra: clues added on top of the ones that are needed (Easy 2,
  // Medium 1, Hard none), positive ones first ("is in", "sits on", ...).
  const LEVELS = {
    easy: { n: 4, rooms: [3, 4], level: 1, extra: 2 },
    medium: { n: 5, rooms: [4, 5], level: 2, extra: 1 },
    hard: { n: 6, rooms: [5, 6], level: 3, extra: 0 }
  };
  const POSITIVE = ["in", "on", "next", "same", "window", "edge"];

  function rowOf(p, i) { return Math.floor(i / p.n); }
  function colOf(p, i) { return i % p.n; }
  function isCake(p, k) { return k === p.n - 1; }

  function neighbours(n, i) {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n);
    if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    if (c < n - 1) out.push(i + 1);
    return out;
  }

  // Is furniture f directly beside cell i (not diagonally) and in the
  // same room? Something on the other side of a wall does not count.
  function nextTo(p, i, f) {
    return neighbours(p.n, i).some((j) => p.furniture[j] === f && p.rooms[j] === p.rooms[i]);
  }

  // Does this clue hold if animal clue.a stands on cell i? ("same" is not
  // a one-cell clue and always passes here.)
  function clueAllows(p, clue, i) {
    const r = rowOf(p, i), c = colOf(p, i);
    switch (clue.t) {
      case "in": return p.rooms[i] === clue.room;
      case "notin": return p.rooms[i] !== clue.room;
      case "on": return p.furniture[i] === clue.f;
      case "next": return nextTo(p, i, clue.f);
      case "window": return r === p.window.row;
      case "edge":
        if (clue.side === "top") return r === 0;
        if (clue.side === "bottom") return r === p.n - 1;
        if (clue.side === "left") return c === 0;
        return c === p.n - 1;
      default: return true;
    }
  }

  // The cells thing k may stand on, from the furniture rule and its own
  // one-cell clues.
  function baseCandidates(p, k) {
    const out = [];
    for (let i = 0; i < p.n * p.n; i++) {
      const f = p.furniture[i];
      if (isCake(p, k)) { if (f === "table") out.push(i); continue; }
      if (BLOCKING.indexOf(f) !== -1) continue;
      if (p.clues.every((cl) => cl.a !== k || clueAllows(p, cl, i))) out.push(i);
    }
    return out;
  }

  // Checks a complete placement against every rule and clue.
  function isSolution(p, cells) {
    const n = p.n, rows = new Set(), cols = new Set();
    for (let k = 0; k < n; k++) {
      const i = cells[k];
      if (i === undefined || i < 0) return false;
      rows.add(rowOf(p, i)); cols.add(colOf(p, i));
      if (baseCandidates(p, k).indexOf(i) === -1) return false;
    }
    if (rows.size !== n || cols.size !== n) return false;
    for (const cl of p.clues) if (cl.t === "same" && p.rooms[cells[cl.a]] !== p.rooms[cells[cl.b]]) return false;
    const cakeRoom = p.rooms[cells[n - 1]];
    let inRoom = 0;
    for (let k = 0; k < n - 1; k++) if (p.rooms[cells[k]] === cakeRoom) inRoom++;
    return inRoom === 1;
  }

  // Counts solutions (up to `limit`) by plain backtracking.
  function countSolutions(p, limit) {
    limit = limit || 2;
    const n = p.n;
    const cand = [];
    for (let k = 0; k < n; k++) cand.push(baseCandidates(p, k));
    const order = Array.from({ length: n }, (_, k) => k).sort((x, y) => cand[x].length - cand[y].length);
    const sames = p.clues.filter((cl) => cl.t === "same");
    const cells = new Array(n).fill(-1), usedR = new Array(n).fill(false), usedC = new Array(n).fill(false);
    let count = 0;
    function ok(k) {
      for (const cl of sames) {
        const o = cl.a === k ? cl.b : (cl.b === k ? cl.a : -1);
        if (o >= 0 && cells[o] >= 0 && p.rooms[cells[o]] !== p.rooms[cells[k]]) return false;
      }
      const cake = cells[n - 1];
      if (cake >= 0) {
        const room = p.rooms[cake];
        let inRoom = 0;
        for (let a = 0; a < n - 1; a++) if (cells[a] >= 0 && p.rooms[cells[a]] === room) inRoom++;
        if (inRoom > 1) return false;
      }
      return true;
    }
    function rec(d) {
      if (count >= limit) return;
      if (d === n) {
        const room = p.rooms[cells[n - 1]];
        let inRoom = 0;
        for (let a = 0; a < n - 1; a++) if (p.rooms[cells[a]] === room) inRoom++;
        if (inRoom === 1) count++;
        return;
      }
      const k = order[d];
      for (const i of cand[k]) {
        const r = rowOf(p, i), c = colOf(p, i);
        if (usedR[r] || usedC[c]) continue;
        cells[k] = i; usedR[r] = usedC[c] = true;
        if (ok(k)) rec(d + 1);
        cells[k] = -1; usedR[r] = usedC[c] = false;
        if (count >= limit) return;
      }
    }
    rec(0);
    return count;
  }

  /*** Solving by deduction only (no trying out, no backtracking) ***/

  // Level 1: a placed thing blocks its row and column; a thing whose cells
  //          all lie in one row/column blocks it for the others; a row or
  //          column only one thing can still reach gets that thing.
  // Level 2: also "same room" clues and the cake rule (exactly one animal
  //          in the cake's room).
  // Level 3: also groups: k things that together can only use k rows (or
  //          columns) block those rows for everyone else.
  // `start` (optional) is what the player already knows for sure:
  // { placed: cell per thing or -1, crosses: cells with nothing }.
  // Returns { solved, cells, levelUsed, fixedAt } - fixedAt[k] counts the
  // deduction steps until thing k had a single cell left (0 = from the
  // start; -1 = never), so the hint can follow the order of reasoning.
  function deduce(p, maxLevel, start) {
    const n = p.n;
    const cand = [];
    for (let k = 0; k < n; k++) cand.push(new Set(baseCandidates(p, k)));
    if (start) {
      const crosses = start.crosses || [];
      for (let k = 0; k < n; k++) {
        const at = start.placed ? start.placed[k] : -1;
        if (at >= 0) cand[k] = new Set(cand[k].has(at) ? [at] : []);
        else crosses.forEach((i) => cand[k].delete(i));
      }
    }
    const sames = p.clues.filter((cl) => cl.t === "same");
    let levelUsed = 1;
    let step = 0;
    const fixedAt = new Array(n).fill(-1);
    const noteFixed = () => { for (let k = 0; k < n; k++) if (fixedAt[k] === -1 && cand[k].size === 1) fixedAt[k] = step; };

    function removeWhere(k, pred) {
      let changed = false;
      for (const i of Array.from(cand[k])) if (pred(i)) { cand[k].delete(i); changed = true; }
      return changed;
    }
    const linesOf = (k, f) => new Set(Array.from(cand[k]).map(f));
    const R = (i) => rowOf(p, i), C = (i) => colOf(p, i);

    function level1() {
      let changed = false;
      for (const f of [R, C]) {
        for (let k = 0; k < n; k++) {
          const lines = linesOf(k, f);
          if (lines.size === 1) {
            const line = lines.values().next().value;
            for (let o = 0; o < n; o++) if (o !== k && removeWhere(o, (i) => f(i) === line)) changed = true;
          }
        }
        for (let line = 0; line < n; line++) {
          const who = [];
          for (let k = 0; k < n; k++) if (Array.from(cand[k]).some((i) => f(i) === line)) who.push(k);
          if (who.length === 1 && removeWhere(who[0], (i) => f(i) !== line)) changed = true;
        }
      }
      return changed;
    }

    function level2() {
      let changed = false;
      for (const cl of sames) {
        for (const [x, y] of [[cl.a, cl.b], [cl.b, cl.a]]) {
          if (removeWhere(x, (i) => !Array.from(cand[y]).some((j) => j !== i && R(j) !== R(i) && C(j) !== C(i) && p.rooms[j] === p.rooms[i]))) changed = true;
        }
      }
      const cake = n - 1;
      const animalsIn = (room, notRow, notCol) => {
        const can = [], forced = [];
        for (let a = 0; a < n - 1; a++) {
          const inside = Array.from(cand[a]).filter((i) => p.rooms[i] === room && R(i) !== notRow && C(i) !== notCol);
          if (inside.length) can.push(a);
          if (Array.from(cand[a]).every((i) => p.rooms[i] === room)) forced.push(a);
        }
        return { can, forced };
      };
      // A table is out if its room would hold no animal or two of them.
      if (removeWhere(cake, (x) => {
        const s = animalsIn(p.rooms[x], R(x), C(x));
        return s.can.length === 0 || s.forced.length >= 2;
      })) changed = true;
      const cakeRooms = new Set(Array.from(cand[cake]).map((i) => p.rooms[i]));
      if (cakeRooms.size === 1) {
        const room = cakeRooms.values().next().value;
        const s = animalsIn(room, -1, -1);
        if (s.forced.length === 1) {
          for (let a = 0; a < n - 1; a++) if (a !== s.forced[0] && removeWhere(a, (i) => p.rooms[i] === room)) changed = true;
        } else if (s.can.length === 1) {
          if (removeWhere(s.can[0], (i) => p.rooms[i] !== room)) changed = true;
        }
      }
      // An animal cannot stand where it would be a second animal in the
      // room of a cake whose place is already settled.
      if (cand[cake].size === 1) {
        const x = cand[cake].values().next().value, room = p.rooms[x];
        const s = animalsIn(room, -1, -1);
        if (s.forced.length === 1) {
          for (let a = 0; a < n - 1; a++) if (a !== s.forced[0] && removeWhere(a, (i) => p.rooms[i] === room)) changed = true;
        }
      }
      return changed;
    }

    function level3() {
      let changed = false;
      const things = Array.from({ length: n }, (_, k) => k);
      for (const f of [R, C]) {
        for (let size = 2; size < n - 1; size++) {
          combinations(things, size, (group) => {
            const lines = new Set();
            group.forEach((k) => linesOf(k, f).forEach((l) => lines.add(l)));
            if (lines.size !== size) return;
            for (let o = 0; o < n; o++) if (group.indexOf(o) === -1 && removeWhere(o, (i) => lines.has(f(i)))) changed = true;
          });
        }
      }
      return changed;
    }

    noteFixed();
    for (;;) {
      if (cand.some((s) => s.size === 0)) return { solved: false, cells: null, levelUsed, fixedAt };
      step++;
      if (level1()) { noteFixed(); continue; }
      if (maxLevel >= 2 && level2()) { levelUsed = Math.max(levelUsed, 2); noteFixed(); continue; }
      if (maxLevel >= 3 && level3()) { levelUsed = Math.max(levelUsed, 3); noteFixed(); continue; }
      break;
    }
    if (cand.some((s) => s.size !== 1)) return { solved: false, cells: null, levelUsed, fixedAt };
    const cells = cand.map((s) => s.values().next().value);
    return { solved: isSolution(p, cells), cells, levelUsed, fixedAt };
  }

  function combinations(arr, k, cb) {
    const pick = [];
    (function rec(start) {
      if (pick.length === k) { cb(pick.slice()); return; }
      for (let i = start; i < arr.length; i++) { pick.push(arr[i]); rec(i + 1); pick.pop(); }
    })(0);
  }

  /*** Generator ***/

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // k connected rooms of at least two cells, grown from random seeds.
  function randomRooms(n, k, rnd) {
    for (let tries = 0; tries < 50; tries++) {
      const rooms = new Array(n * n).fill(-1);
      const seeds = shuffle(Array.from({ length: n * n }, (_, i) => i), rnd).slice(0, k);
      seeds.forEach((s, idx) => { rooms[s] = idx; });
      let left = n * n - k;
      while (left > 0) {
        const room = Math.floor(rnd() * k);
        const edge = [];
        for (let i = 0; i < n * n; i++) {
          if (rooms[i] !== room) continue;
          neighbours(n, i).forEach((j) => { if (rooms[j] === -1) edge.push(j); });
        }
        if (!edge.length) continue;
        rooms[edge[Math.floor(rnd() * edge.length)]] = room;
        left--;
      }
      const sizes = new Array(k).fill(0);
      rooms.forEach((r) => sizes[r]++);
      if (sizes.every((s) => s >= 2)) return rooms;
    }
    return null;
  }

  function candidateClues(p, sol) {
    const n = p.n, out = [];
    for (let a = 0; a < n - 1; a++) {
      const i = sol[a], room = p.rooms[i];
      out.push({ t: "in", a, room });
      const rooms = new Set(p.rooms);
      rooms.forEach((r) => { if (r !== room) out.push({ t: "notin", a, room: r }); });
      if (p.furniture[i] === "chair" || p.furniture[i] === "rug") out.push({ t: "on", a, f: p.furniture[i] });
      ["plant", "cupboard"].forEach((f) => { if (nextTo(p, i, f)) out.push({ t: "next", a, f }); });
      if (rowOf(p, i) === p.window.row) out.push({ t: "window", a });
      if (rowOf(p, i) === 0) out.push({ t: "edge", a, side: "top" });
      if (rowOf(p, i) === n - 1) out.push({ t: "edge", a, side: "bottom" });
      if (colOf(p, i) === 0) out.push({ t: "edge", a, side: "left" });
      if (colOf(p, i) === n - 1) out.push({ t: "edge", a, side: "right" });
      for (let b = a + 1; b < n - 1; b++) if (p.rooms[sol[b]] === room) out.push({ t: "same", a, b });
    }
    return out;
  }

  // One attempt at a board with a solution that obeys every rule.
  function randomBoard(cfg, rnd) {
    const n = cfg.n;
    const k = cfg.rooms[0] + Math.floor(rnd() * (cfg.rooms[1] - cfg.rooms[0] + 1));
    const rooms = randomRooms(n, k, rnd);
    if (!rooms) return null;
    const names = shuffle(ROOM_NAMES.slice(), rnd).slice(0, k);
    for (let tries = 0; tries < 30; tries++) {
      const cols = shuffle(Array.from({ length: n }, (_, i) => i), rnd);
      const rowsOf = shuffle(Array.from({ length: n }, (_, i) => i), rnd);
      const sol = [];
      for (let t = 0; t < n; t++) sol.push(rowsOf[t] * n + cols[rowsOf[t]]);
      const cakeRoom = rooms[sol[n - 1]];
      let inRoom = 0;
      for (let a = 0; a < n - 1; a++) if (rooms[sol[a]] === cakeRoom) inRoom++;
      if (inRoom !== 1) continue;
      const furniture = new Array(n * n).fill(null);
      furniture[sol[n - 1]] = "table";
      const occupied = new Set(sol);
      for (let a = 0; a < n - 1; a++) {
        const x = rnd();
        // Animals sit on a chair or a rug, or stand on a bare cell.
        furniture[sol[a]] = x < 0.35 ? "chair" : (x < 0.6 ? "rug" : null);
      }
      const free = shuffle(Array.from({ length: n * n }, (_, i) => i).filter((i) => !occupied.has(i)), rnd);
      const extra = { table: 1 + Math.floor(rnd() * (n - 2)), cupboard: 1 + Math.floor(rnd() * 2), plant: 1 + Math.floor(rnd() * 2), chair: Math.floor(rnd() * 3), rug: Math.floor(rnd() * 2) };
      Object.keys(extra).forEach((f) => { for (let c = 0; c < extra[f] && free.length; c++) furniture[free.pop()] = f; });
      const win = { row: Math.floor(rnd() * n), side: rnd() < 0.5 ? "left" : "right" };
      return { n, rooms, roomNames: names, furniture, window: win, clues: [], solution: sol };
    }
    return null;
  }

  // Clues are added until the puzzle has exactly one solution, every
  // clue that is not needed for that is removed again (each animal keeps
  // at least one), and the result must be solvable by deduction alone at
  // the level's depth. Then Easy and Medium get cfg.extra more true clues
  // (p.needed keeps the number that was needed): positive ones first,
  // for the animals with the fewest clues; "not in" only if nothing else
  // is left.
  function generatePuzzle(levelName, rng) {
    const rnd = rng || Math.random;
    const cfg = LEVELS[levelName] || LEVELS.medium;
    for (let attempt = 0; attempt < 400; attempt++) {
      const p = randomBoard(cfg, rnd);
      if (!p) continue;
      const pool = shuffle(candidateClues(p, p.solution), rnd);
      const clues = [];
      for (let a = 0; a < p.n - 1; a++) {
        const own = pool.filter((cl) => cl.a === a);
        clues.push(own[Math.floor(rnd() * own.length)]);
      }
      p.clues = clues;
      let unique = countSolutions(p, 2) === 1;
      for (const cl of pool) {
        if (unique) break;
        if (clues.indexOf(cl) !== -1) continue;
        clues.push(cl);
        unique = countSolutions(p, 2) === 1;
      }
      if (!unique) continue;
      for (const cl of shuffle(clues.slice(), rnd)) {
        const rest = p.clues.filter((x) => x !== cl);
        if (!rest.some((x) => x.a === cl.a)) continue;
        const before = p.clues;
        p.clues = rest;
        if (countSolutions(p, 2) !== 1) p.clues = before;
      }
      const d = deduce(p, cfg.level);
      if (!d.solved) continue;
      // Hard puzzles should need more than the simplest steps; after many
      // tries any deducible one is taken, so a puzzle always comes out.
      if (cfg.level >= 3 && attempt < 200 && deduce(p, 1).solved) continue;
      p.needed = p.clues.length;
      addExtraClues(p, pool, cfg.extra || 0);
      p.clues.sort((x, y) => x.a - y.a || (x.t < y.t ? -1 : x.t > y.t ? 1 : 0));
      p.level = levelName;
      return p;
    }
    return null;
  }

  function sameClue(x, y) {
    return x.t === y.t && x.a === y.a && x.b === y.b && x.room === y.room && x.f === y.f && x.side === y.side;
  }

  function addExtraClues(p, pool, count) {
    for (let added = 0; added < count; added++) {
      const left = pool.filter((cl) => !p.clues.some((x) => sameClue(x, cl)));
      if (!left.length) return;
      const have = (a) => p.clues.filter((x) => x.a === a || x.b === a).length;
      const score = (cl) => (POSITIVE.indexOf(cl.t) !== -1 ? 0 : 100) + have(cl.a);
      let best = left[0];
      for (const cl of left) if (score(cl) < score(best)) best = cl;
      p.clues.push(best);
    }
  }

  /*** Hint ***/

  // placed: cell per thing (-1 = not on the board); crosses: cells marked
  // "nothing here". Returns
  //   { kind: "wrong", thing, cell }   a thing stands in the wrong cell
  //   { kind: "wrongx", cell }         a cross marks a cell the solution uses
  //   { kind: "step", thing, cell, reason }  where the next thing goes,
  //                                    and why (see explainStep)
  //   { kind: "last" }                 all animals stand right, the cake is open
  //   { kind: "done" }
  function findHint(p, placed, crosses) {
    for (let k = 0; k < p.n; k++) {
      if (placed[k] >= 0 && placed[k] !== p.solution[k]) return { kind: "wrong", thing: k, cell: placed[k] };
    }
    for (const i of crosses || []) if (p.solution.indexOf(i) !== -1) return { kind: "wrongx", cell: i };
    // The next step is the thing that reasoning from what is already on
    // the board pins down first. Animals come before the cake: setting the
    // cake ends the puzzle, and that last step stays the player's.
    if (placed[p.n - 1] === p.solution[p.n - 1]) return { kind: "done" };
    const animals = [];
    for (let k = 0; k < p.n - 1; k++) if (placed[k] !== p.solution[k]) animals.push(k);
    // Only the cake left: one row and one column are free, and saying so
    // is the whole hint.
    if (!animals.length) return { kind: "last" };
    const fixedAt = deduce(p, 3, { placed, crosses }).fixedAt;
    const rank = (k) => (fixedAt[k] === -1 ? Infinity : fixedAt[k]);
    // An animal whose place can be seen directly from the board as it is
    // comes first, so the reason given is one the player can check.
    let best = -1, bestReason = null;
    const simple = (r) => REASON_ORDER.indexOf(r.kind);
    for (const k of animals) {
      const r = explainStep(p, placed, crosses, k);
      if (best === -1 || simple(r) < simple(bestReason) || (simple(r) === simple(bestReason) && rank(k) < rank(best))) { best = k; bestReason = r; }
    }
    return { kind: "step", thing: best, cell: p.solution[best], reason: bestReason };
  }

  // Why thing k must stand on its solution cell, seen from the board as
  // it is (placed things and crosses; both already checked to be right):
  //   { kind: "free" }              only this cell is still free for it
  //                                 (rows and columns taken, crosses,
  //                                 furniture it cannot stand on)
  //   { kind: "clue", clues: [i] }  clue i (or clues i, j together) leave
  //                                 only this cell free
  //   { kind: "row" } / "col"       nothing else fits in this row/column,
  //                                 and this is its only cell there
  //   { kind: "lines" }             its other cells lie in rows or columns
  //                                 the other things need (level-1 steps)
  //   { kind: "rooms" }             follows with the room rules (exactly
  //                                 one animal in the cake's room, "same
  //                                 room" clues)
  //   { kind: "groups" }            several things together need certain
  //                                 rows or columns
  //   { kind: "general", clues }    none of these alone; clues lists the
  //                                 clues about k
  function explainStep(p, placed, crosses, k) {
    const n = p.n, target = p.solution[k];
    const takenR = new Set(), takenC = new Set();
    for (let t = 0; t < n; t++) if (placed[t] >= 0 && t !== k) { takenR.add(rowOf(p, placed[t])); takenC.add(colOf(p, placed[t])); }
    const crossSet = new Set(crosses || []);
    const open = (i) => !takenR.has(rowOf(p, i)) && !takenC.has(colOf(p, i)) && !crossSet.has(i);
    const standable = (t, i) => (isCake(p, t) ? p.furniture[i] === "table" : BLOCKING.indexOf(p.furniture[i]) === -1);
    const own = [];
    p.clues.forEach((cl, idx) => { if (cl.a === k && cl.t !== "same") own.push(idx); });
    const cellsWith = (t, clueIdx) => {
      const out = [];
      for (let i = 0; i < n * n; i++) {
        if (!open(i) || !standable(t, i)) continue;
        if (clueIdx.every((ci) => clueAllows(p, p.clues[ci], i))) out.push(i);
      }
      return out;
    };
    const only = (cells) => cells.length === 1 && cells[0] === target;
    if (only(cellsWith(k, []))) return { kind: "free" };
    for (const ci of own) if (only(cellsWith(k, [ci]))) return { kind: "clue", clues: [ci] };
    for (let x = 0; x < own.length; x++) for (let y = x + 1; y < own.length; y++) {
      if (only(cellsWith(k, [own[x], own[y]]))) return { kind: "clue", clues: [own[x], own[y]] };
    }
    // Rows and columns: every unplaced thing with all its own clues.
    const cand = [];
    for (let t = 0; t < n; t++) {
      if (placed[t] >= 0 && t !== k) { cand.push([]); continue; }
      const ownT = [];
      p.clues.forEach((cl, idx) => { if (cl.a === t && cl.t !== "same") ownT.push(idx); });
      cand.push(cellsWith(t, ownT));
    }
    for (const [kind, f] of [["row", (i) => rowOf(p, i)], ["col", (i) => colOf(p, i)]]) {
      const line = f(target);
      const mine = cand[k].filter((i) => f(i) === line);
      const others = cand.some((cs, t) => t !== k && cs.some((i) => f(i) === line));
      if (!others && mine.length === 1 && mine[0] === target) return { kind };
    }
    // Reasoning from the board as it is: which kind of step fixes k.
    const start = { placed, crosses };
    const levelKinds = ["lines", "rooms", "groups"];
    for (let lv = 1; lv <= 3; lv++) {
      const d = deduce(p, lv, start);
      if (d.fixedAt[k] !== -1) return { kind: levelKinds[lv - 1] };
    }
    return { kind: "general", clues: own };
  }

  // How simple a reason is, for choosing the hint (lower = simpler).
  const REASON_ORDER = ["free", "clue", "row", "col", "lines", "rooms", "groups", "general"];

  /*** Texts ***/

  // Builds the sentence for a clue from ready-made phrases (t = I18n.t):
  // every animal, room and furniture has its own phrase per sentence
  // type, so articles, cases and word order stay right in every language.
  function fill(s, vars) {
    Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }

  // The id of animal k in the puzzle's theme (names: cake_<id>_..., icons:
  // CakeIcons <id>).
  function animalId(p, k) {
    return (p && p.motif === "cats" ? CATS : ANIMALS)[k];
  }

  // The id of thing k: an animal, or "cake" / "fish" for the last one.
  function thingId(p, k) {
    if (isCake(p, k)) return p.motif === "cats" ? "fish" : "cake";
    return animalId(p, k);
  }

  // A text key in the puzzle's theme: base + "_fish" when the cats look for
  // a fish (only for the texts that name the cake).
  function themed(p, key) {
    return p && p.motif === "cats" ? key + "_fish" : key;
  }

  function clueText(p, clue, t) {
    const a = animalId(p, clue.a);
    const vars = {
      IS: t("cake_" + a + "_is"),
      ISNOT: t("cake_" + a + "_isnot"),
      SITS: t("cake_" + a + "_sits"),
      A: t("cake_" + a + "_cap")
    };
    switch (clue.t) {
      case "in": vars.ROOM = t("cake_room_" + p.roomNames[clue.room] + "_in"); return fill(t("cake_clue_in"), vars);
      case "notin": vars.ROOM = t("cake_room_" + p.roomNames[clue.room] + "_in"); return fill(t("cake_clue_notin"), vars);
      case "on": vars.FURN = t("cake_furn_" + clue.f + "_on"); return fill(t("cake_clue_on"), vars);
      case "next": vars.FURN = t("cake_furn_" + clue.f + "_next"); return fill(t("cake_clue_next"), vars);
      case "window": return fill(t("cake_clue_window"), vars);
      case "edge": return fill(t("cake_clue_" + clue.side), vars);
      case "same": vars.B = t("cake_" + animalId(p, clue.b) + "_mid"); return fill(t("cake_clue_same"), vars);
      default: return "";
    }
  }

  function thingName(p, k, t) {
    return isCake(p, k) ? t("cake_thing_" + thingId(p, k)) : t("cake_" + animalId(p, k) + "_name");
  }

  // The animal in the cake's room, by the solution.
  function culprit(p) {
    const room = p.rooms[p.solution[p.n - 1]];
    for (let a = 0; a < p.n - 1; a++) if (p.rooms[p.solution[a]] === room) return a;
    return -1;
  }

  return {
    ANIMALS, CATS, MOTIFS, ROOM_NAMES, FURNITURE, BLOCKING, LEVELS, animalId, thingId, themed,
    neighbours, nextTo, clueAllows, baseCandidates, isSolution, countSolutions, deduce,
    randomRooms, candidateClues, generatePuzzle, addExtraClues, findHint, explainStep, clueText, thingName, culprit, fill
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CakeCore;
}
if (typeof window !== "undefined") {
  window.CakeCore = CakeCore;
}
