// cake-core.js
// "Who Took the Cake?" - a detective logic puzzle. Dependency-free, no DOM.
//
// The board is an N x N floor plan split into rooms. Some cells hold
// furniture (table, chair, rug, plant, cupboard); a window sits on the
// left or right outer wall of one row. N things are placed: N-1 animals
// and the cake, one per row and one per column. The cake always stands
// on a table; animals never stand on a table or a cupboard. Exactly one
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
//   { t: "window", a }         a is in the window's row
//   { t: "edge", a, side }     a is in the top/bottom row or left/right column
//   { t: "same", a, b }        a and b are in the same room

const CakeCore = (function () {
  const ANIMALS = ["dog", "cat", "rabbit", "mouse", "hedgehog"];
  const ROOM_NAMES = ["kitchen", "living", "hall", "bath", "bedroom", "garden", "cellar"];
  const FURNITURE = ["table", "chair", "rug", "plant", "cupboard"];
  const LEVELS = {
    easy: { n: 4, rooms: [3, 4], level: 1 },
    medium: { n: 5, rooms: [4, 5], level: 2 },
    hard: { n: 6, rooms: [5, 6], level: 3 }
  };

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

  // Does this clue hold if animal clue.a stands on cell i? ("same" is not
  // a one-cell clue and always passes here.)
  function clueAllows(p, clue, i) {
    const r = rowOf(p, i), c = colOf(p, i);
    switch (clue.t) {
      case "in": return p.rooms[i] === clue.room;
      case "notin": return p.rooms[i] !== clue.room;
      case "on": return p.furniture[i] === clue.f;
      case "next": return neighbours(p.n, i).some((j) => p.furniture[j] === clue.f);
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
      if (f === "table" || f === "cupboard") continue;
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
      ["plant", "cupboard"].forEach((f) => { if (neighbours(n, i).some((j) => p.furniture[j] === f)) out.push({ t: "next", a, f }); });
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
  // the level's depth.
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
      p.clues.sort((x, y) => x.a - y.a || (x.t < y.t ? -1 : x.t > y.t ? 1 : 0));
      p.level = levelName;
      return p;
    }
    return null;
  }

  /*** Hint ***/

  // placed: cell per thing (-1 = not on the board); crosses: cells marked
  // "nothing here". Returns
  //   { kind: "wrong", thing, cell }   a thing stands in the wrong cell
  //   { kind: "wrongx", cell }         a cross marks a cell the solution uses
  //   { kind: "step", thing, cell }    where the next thing goes
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
    let best = animals[0];
    for (const k of animals) if (rank(k) < rank(best)) best = k;
    return { kind: "step", thing: best, cell: p.solution[best] };
  }

  /*** Texts ***/

  // Builds the sentence for a clue from ready-made phrases (t = I18n.t):
  // every animal, room and furniture has its own phrase per sentence
  // type, so articles, cases and word order stay right in every language.
  function fill(s, vars) {
    Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }

  function clueText(p, clue, t) {
    const a = ANIMALS[clue.a];
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
      case "same": vars.B = t("cake_" + ANIMALS[clue.b] + "_mid"); return fill(t("cake_clue_same"), vars);
      default: return "";
    }
  }

  function thingName(p, k, t) {
    return isCake(p, k) ? t("cake_thing_cake") : t("cake_" + ANIMALS[k] + "_name");
  }

  // The animal in the cake's room, by the solution.
  function culprit(p) {
    const room = p.rooms[p.solution[p.n - 1]];
    for (let a = 0; a < p.n - 1; a++) if (p.rooms[p.solution[a]] === room) return a;
    return -1;
  }

  return {
    ANIMALS, ROOM_NAMES, FURNITURE, LEVELS,
    neighbours, clueAllows, baseCandidates, isSolution, countSolutions, deduce,
    randomRooms, candidateClues, generatePuzzle, findHint, clueText, thingName, culprit, fill
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CakeCore;
}
if (typeof window !== "undefined") {
  window.CakeCore = CakeCore;
}
