// cake-core.js
// "Who Took the Cake?" - a detective logic puzzle. Dependency-free, no DOM.
//
// Rules (puzzle.rules === 2; older saves without it are not used again):
//   1. The board is an N x N floor plan split into N-1 rooms. N-1 animals
//      are placed, exactly one in every room.
//   2. The cake is placed too. It never shares a square with an animal and
//      may stand in any room.
//   3. Two animals never stand directly next to each other, not even
//      diagonally.
//   4. Exactly one animal stands directly next to the cake (side or corner,
//      walls do not matter). That animal took the cake.
// Clues about the animals and the cake pin the placement down to a single
// solution.
//
// A puzzle:
//   n          board size
//   rules      2
//   rooms      room index per cell (cell i = row * n + col), rooms 0..n-2
//   roomNames  room name id per room index ("kitchen", "garden", ...)
//   clues      see below
//   solution   cell per thing: things 0..n-2 are animals (theme order),
//              thing n-1 is the cake
//
// Clues (a, b: animal index; "size" may also be about the cake, a = n-1):
//   { t: "size", a, size }    a is in a room of `size` squares
//   { t: "higher", a, b }     a stands in a higher row than b
//   { t: "left", a, b }       a stands in a column further left than b
//   { t: "border", a, b }     the rooms of a and b share a wall
//   { t: "steps", a, d }      a is d steps from the cake (up, down, left,
//                             right; walls do not matter), d >= 2

const CakeCore = (function () {
  const RULES = 2;
  const ANIMALS = ["dog", "cat", "rabbit", "mouse", "hedgehog"];
  // Themes: the same puzzle with other pictures and names (p.motif). Each
  // has five suspects told apart by pattern and name, and its own thing
  // instead of the cake: cats and a fish, bears and cookies, dogs and a
  // ball, magpies and a key; a family and the cake, neighbours' children
  // and a treasure chest. Rules, generator and clues stay the same. A
  // puzzle without p.motif is the animals theme. suffix: the texts that
  // name the thing have their own key (base + suffix); people: the
  // suspects are people, so "Two animals never stand ..." has its own text.
  const CATS = ["cattiger", "catluna", "catmimi", "catfelix", "catmax"];
  const BEARS = ["bearbruno", "bearpaula", "bearotto", "bearlilli", "bearfritz"];
  const DOGS = ["dogbello", "doglotte", "dogbenny", "dogsusi", "dogrudi"];
  const MAGPIES = ["magpiepip", "magpiekiki", "magpierosa", "magpiejakob", "magpielou"];
  const FAMILY = ["greta", "anton", "lisa", "jonas", "emma"];
  const KIDS = ["tom", "nora", "ben", "ida", "leo"];
  const THEMES = {
    animals: { who: ANIMALS, thing: "cake", suffix: "" },
    cats: { who: CATS, thing: "fish", suffix: "_fish" },
    bears: { who: BEARS, thing: "cookies", suffix: "_cookies" },
    dogs: { who: DOGS, thing: "ball", suffix: "_ball" },
    magpies: { who: MAGPIES, thing: "key", suffix: "_key" },
    family: { who: FAMILY, thing: "cake", suffix: "_family", people: true },
    treasure: { who: KIDS, thing: "treasure", suffix: "_treasure", people: true }
  };
  const MOTIFS = Object.keys(THEMES);
  function theme(p) {
    return (p && THEMES[p.motif]) || THEMES.animals;
  }
  const ROOM_NAMES = ["kitchen", "living", "hall", "bath", "bedroom", "garden", "cellar", "kids", "attic", "dining", "office", "terrace"];
  const CLUE_TYPES = ["size", "higher", "left", "border", "steps"];
  // level: deduction depth the puzzle must be solvable with (see deduce);
  // extra: clues added on top of the ones that are needed (Easy 2,
  // Medium 1, Hard none), the simplest kinds first.
  const LEVELS = {
    easy: { n: 4, level: 1, extra: 2 },
    medium: { n: 5, level: 2, extra: 1 },
    hard: { n: 6, level: 3, extra: 0 }
  };

  function rowOf(p, i) { return Math.floor(i / p.n); }
  function colOf(p, i) { return i % p.n; }
  function isCake(p, k) { return k === p.n - 1; }

  // Side neighbours (for walls between rooms).
  function neighbours(n, i) {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n);
    if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    if (c < n - 1) out.push(i + 1);
    return out;
  }

  // Do cells i and j touch (side or corner)? A cell does not touch itself.
  function touches(n, i, j) {
    if (i === j) return false;
    return Math.abs(Math.floor(i / n) - Math.floor(j / n)) <= 1 && Math.abs((i % n) - (j % n)) <= 1;
  }

  // The cells touching cell i (up to eight).
  function around(n, i) {
    const out = [], r = Math.floor(i / n), c = i % n;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const y = r + dr, x = c + dc;
      if (y >= 0 && y < n && x >= 0 && x < n) out.push(y * n + x);
    }
    return out;
  }

  function steps(n, i, j) {
    return Math.abs(Math.floor(i / n) - Math.floor(j / n)) + Math.abs((i % n) - (j % n));
  }

  // Room sizes and which rooms share a wall, worked out once per floor
  // plan (keyed by the rooms array).
  const roomInfoCache = new WeakMap();
  function roomInfo(p) {
    let info = roomInfoCache.get(p.rooms);
    if (info) return info;
    const n = p.n, count = Math.max.apply(null, p.rooms) + 1;
    const size = new Array(count).fill(0);
    const border = Array.from({ length: count }, () => new Array(count).fill(false));
    for (let i = 0; i < n * n; i++) {
      size[p.rooms[i]]++;
      neighbours(n, i).forEach((j) => { if (p.rooms[j] !== p.rooms[i]) border[p.rooms[i]][p.rooms[j]] = true; });
    }
    info = { size, border };
    roomInfoCache.set(p.rooms, info);
    return info;
  }

  function roomSize(p, room) {
    return roomInfo(p).size[room] || 0;
  }

  // Do rooms x and y share a wall (two side-by-side cells)?
  function roomsBorder(p, x, y) {
    const b = roomInfo(p).border[x];
    return !!(b && b[y]);
  }

  // The thing on the other end of a two-thing clue (-1 for "size").
  function otherOf(p, cl, k) {
    if (cl.t === "size") return -1;
    const b = cl.t === "steps" ? p.n - 1 : cl.b;
    if (cl.a === k) return b;
    if (b === k) return cl.a;
    return -1;
  }

  // Does clue cl hold with thing cl.a on cell i and the other thing (cl.b,
  // or the cake for "steps") on cell j? ("size" ignores j.)
  function pairHolds(p, cl, i, j) {
    switch (cl.t) {
      case "size": return roomSize(p, p.rooms[i]) === cl.size;
      case "higher": return rowOf(p, i) < rowOf(p, j);
      case "left": return colOf(p, i) < colOf(p, j);
      case "border": return roomsBorder(p, p.rooms[i], p.rooms[j]);
      case "steps": return steps(p.n, i, j) === cl.d;
      default: return true;
    }
  }

  // Does clue cl hold for thing k on cell i, given where the others stand
  // (cells: cell per thing, -1 = open)? Open ends always pass.
  function clueHolds(p, cl, k, i, cells) {
    if (cl.t === "size") return cl.a !== k || pairHolds(p, cl, i, -1);
    const o = otherOf(p, cl, k);
    if (o < 0) return true;
    const j = cells ? cells[o] : -1;
    if (j === undefined || j < 0) return true;
    return cl.a === k ? pairHolds(p, cl, i, j) : pairHolds(p, cl, j, i);
  }

  // The cells thing k may stand on by its "size" clues alone.
  function baseCandidates(p, k) {
    const out = [];
    for (let i = 0; i < p.n * p.n; i++) {
      if (p.clues.every((cl) => cl.t !== "size" || cl.a !== k || pairHolds(p, cl, i, -1))) out.push(i);
    }
    return out;
  }

  // Checks a complete placement against every rule and clue.
  function isSolution(p, cells) {
    const n = p.n, cake = n - 1;
    if (!cells || cells.length !== n) return false;
    for (let k = 0; k < n; k++) if (!(cells[k] >= 0 && cells[k] < n * n)) return false;
    const rooms = new Set();
    for (let a = 0; a < n - 1; a++) {
      rooms.add(p.rooms[cells[a]]);
      for (let b = a + 1; b < n - 1; b++) if (cells[a] === cells[b] || touches(n, cells[a], cells[b])) return false;
      if (cells[a] === cells[cake]) return false;
    }
    if (rooms.size !== n - 1) return false;
    let near = 0;
    for (let a = 0; a < n - 1; a++) if (touches(n, cells[a], cells[cake])) near++;
    if (near !== 1) return false;
    return p.clues.every((cl) => (cl.t === "size" ? pairHolds(p, cl, cells[cl.a], -1) : pairHolds(p, cl, cells[cl.a], cells[otherOf(p, cl, cl.a)])));
  }

  // Counts solutions (up to `limit`) by plain backtracking: the animals
  // room by room, then the cake.
  function countSolutions(p, limit) {
    limit = limit || 2;
    const n = p.n, cake = n - 1;
    // Level 1 of the deduction only removes squares that cannot be right,
    // so it is safe to start from there.
    const sets = [];
    for (let k = 0; k < n; k++) sets.push(new Set(baseCandidates(p, k)));
    for (;;) {
      if (broken(p, sets)) return 0;
      if (!level1(p, sets)) break;
    }
    const cand = sets.map((s) => Array.from(s));
    const order = Array.from({ length: n - 1 }, (_, k) => k).sort((x, y) => cand[x].length - cand[y].length);
    const cells = new Array(n).fill(-1);
    const usedRoom = new Array(n).fill(false);
    const twoThing = p.clues.filter((cl) => cl.t !== "size");
    let count = 0;
    function fits(k, i) {
      for (const cl of twoThing) {
        if (!clueHolds(p, cl, k, i, cells)) return false;
      }
      return true;
    }
    function rec(d) {
      if (count >= limit) return;
      if (d === n - 1) {
        for (const x of cand[cake]) {
          let near = 0, on = false;
          for (let a = 0; a < n - 1; a++) {
            if (cells[a] === x) on = true;
            else if (touches(n, cells[a], x)) near++;
          }
          if (on || near !== 1) continue;
          if (!fits(cake, x)) continue;
          count++;
          if (count >= limit) return;
        }
        return;
      }
      const k = order[d];
      for (const i of cand[k]) {
        const room = p.rooms[i];
        if (usedRoom[room]) continue;
        let bad = false;
        for (let a = 0; a < n - 1 && !bad; a++) if (cells[a] >= 0 && (cells[a] === i || touches(n, cells[a], i))) bad = true;
        if (bad || !fits(k, i)) continue;
        cells[k] = i; usedRoom[room] = true;
        rec(d + 1);
        cells[k] = -1; usedRoom[room] = false;
        if (count >= limit) return;
      }
    }
    rec(0);
    return count;
  }

  /*** Solving by deduction only ***/

  // Level 1: "size" clues; a thing whose squares all lie in one room keeps
  //          the other animals out of that room; a settled animal keeps the
  //          others off the squares around it and the cake off its square;
  //          a room only one animal can still reach gets that animal; a
  //          square needs a square at the other end of each two-thing clue
  //          that fits it; once all animals are settled, the cake stands
  //          next to exactly one of them.
  // Level 2: also the rules between two open things: the partner square
  //          of a two-thing clue must not be in the same room or next to
  //          it, an animal square must not leave another animal no square,
  //          and the cake rule (exactly one animal next to the cake) while
  //          animals are open.
  // Level 3: also trying one square: if putting a thing there leads to a
  //          contradiction by levels 1 and 2, the square is out.
  // `start` (optional) is what the player already knows for sure:
  // { placed: cell per thing or -1, crosses: cells with nothing }.
  // Returns { solved, cells, levelUsed, fixedAt } - fixedAt[k] counts the
  // deduction steps until thing k had a single cell left (0 = from the
  // start; -1 = never), so the hint can follow the order of reasoning.
  function deduce(p, maxLevel, start) {
    const n = p.n;
    let cand = [];
    for (let k = 0; k < n; k++) cand.push(new Set(baseCandidates(p, k)));
    if (start) {
      const crosses = start.crosses || [];
      for (let k = 0; k < n; k++) {
        const at = start.placed ? start.placed[k] : -1;
        if (at >= 0) cand[k] = new Set(cand[k].has(at) ? [at] : []);
        else crosses.forEach((i) => cand[k].delete(i));
      }
    }
    let levelUsed = 1;
    let step = 0;
    const fixedAt = new Array(n).fill(-1);
    const noteFixed = () => { for (let k = 0; k < n; k++) if (fixedAt[k] === -1 && cand[k].size === 1) fixedAt[k] = step; };
    noteFixed();
    for (;;) {
      if (broken(p, cand)) return { solved: false, cells: null, levelUsed, fixedAt };
      step++;
      if (level1(p, cand)) { noteFixed(); continue; }
      if (maxLevel >= 2 && level2(p, cand)) { levelUsed = Math.max(levelUsed, 2); noteFixed(); continue; }
      if (maxLevel >= 3 && level3(p, cand)) { levelUsed = Math.max(levelUsed, 3); noteFixed(); continue; }
      break;
    }
    if (cand.some((s) => s.size !== 1)) return { solved: false, cells: null, levelUsed, fixedAt };
    const cells = cand.map((s) => s.values().next().value);
    return { solved: isSolution(p, cells), cells, levelUsed, fixedAt };
  }

  function removeWhere(cand, k, pred) {
    let changed = false;
    for (const i of Array.from(cand[k])) if (pred(i)) { cand[k].delete(i); changed = true; }
    return changed;
  }

  // A thing without squares, or a room no animal can reach any more.
  function broken(p, cand) {
    if (cand.some((s) => s.size === 0)) return true;
    const n = p.n;
    for (let room = 0; room < n - 1; room++) {
      let any = false;
      for (let a = 0; a < n - 1 && !any; a++) for (const i of cand[a]) if (p.rooms[i] === room) { any = true; break; }
      if (!any) return true;
    }
    return false;
  }

  function level1(p, cand) {
    const n = p.n, cake = n - 1;
    let changed = false;
    for (let a = 0; a < n - 1; a++) {
      const rooms = new Set(Array.from(cand[a]).map((i) => p.rooms[i]));
      if (rooms.size === 1) {
        const room = rooms.values().next().value;
        for (let o = 0; o < n - 1; o++) if (o !== a && removeWhere(cand, o, (i) => p.rooms[i] === room)) changed = true;
      }
      if (cand[a].size === 1) {
        const x = cand[a].values().next().value;
        for (let o = 0; o < n - 1; o++) if (o !== a && removeWhere(cand, o, (i) => i === x || touches(n, i, x))) changed = true;
        if (removeWhere(cand, cake, (i) => i === x)) changed = true;
      }
    }
    if (cand[cake].size === 1) {
      const x = cand[cake].values().next().value;
      for (let a = 0; a < n - 1; a++) if (removeWhere(cand, a, (i) => i === x)) changed = true;
    }
    for (let room = 0; room < n - 1; room++) {
      const who = [];
      for (let a = 0; a < n - 1; a++) if (Array.from(cand[a]).some((i) => p.rooms[i] === room)) who.push(a);
      if (who.length === 1 && removeWhere(cand, who[0], (i) => p.rooms[i] !== room)) changed = true;
    }
    // Two-thing clues: a square needs some square at the other end that
    // fits the clue.
    for (const cl of p.clues) {
      if (cl.t === "size") continue;
      const b = otherOf(p, cl, cl.a);
      const cb = Array.from(cand[b]);
      if (removeWhere(cand, cl.a, (i) => !cb.some((j) => j !== i && pairHolds(p, cl, i, j)))) changed = true;
      const ca = Array.from(cand[cl.a]);
      if (removeWhere(cand, b, (j) => !ca.some((i) => i !== j && pairHolds(p, cl, i, j)))) changed = true;
    }
    // All animals settled: the cake stands next to exactly one of them.
    const settled = [];
    for (let a = 0; a < n - 1; a++) if (cand[a].size === 1) settled.push(cand[a].values().next().value);
    if (settled.length === n - 1 && removeWhere(cand, cake, (x) => settled.indexOf(x) !== -1 || settled.filter((i) => touches(n, i, x)).length !== 1)) changed = true;
    return changed;
  }

  function level2(p, cand) {
    const n = p.n, cake = n - 1;
    let changed = false;
    // Two-thing clues: a square needs a partner square at the other end.
    for (const cl of p.clues) {
      if (cl.t === "size") continue;
      const b = otherOf(p, cl, cl.a);
      const partner = (x, y, i, mine) => Array.from(cand[y]).some((j) => j !== i && (x === cake || y === cake || (!touches(n, i, j) && p.rooms[i] !== p.rooms[j])) && (mine ? pairHolds(p, cl, i, j) : pairHolds(p, cl, j, i)));
      if (removeWhere(cand, cl.a, (i) => !partner(cl.a, b, i, true))) changed = true;
      if (removeWhere(cand, b, (i) => !partner(b, cl.a, i, false))) changed = true;
    }
    // An animal square that leaves another animal no square at all.
    for (let a = 0; a < n - 1; a++) {
      for (let o = 0; o < n - 1; o++) {
        if (o === a) continue;
        if (removeWhere(cand, a, (i) => Array.from(cand[o]).every((j) => j === i || touches(n, i, j) || p.rooms[j] === p.rooms[i]))) changed = true;
      }
    }
    // The cake: some animal must be able to stand next to it, and not two
    // animals that can stand nowhere else.
    const forcedNear = (x) => {
      let c = 0;
      for (let a = 0; a < n - 1; a++) if (Array.from(cand[a]).every((i) => touches(n, i, x))) c++;
      return c;
    };
    const canNear = (x) => {
      const out = [];
      for (let a = 0; a < n - 1; a++) if (Array.from(cand[a]).some((i) => touches(n, i, x))) out.push(a);
      return out;
    };
    if (removeWhere(cand, cake, (x) => canNear(x).length === 0 || forcedNear(x) >= 2 || Array.from({ length: n - 1 }, (_, a) => a).some((a) => cand[a].size === 1 && cand[a].has(x)))) changed = true;
    if (cand[cake].size === 1) {
      const x = cand[cake].values().next().value;
      const can = canNear(x);
      if (can.length === 1 && removeWhere(cand, can[0], (i) => !touches(n, i, x))) changed = true;
      for (let a = 0; a < n - 1; a++) {
        if (!Array.from(cand[a]).every((i) => touches(n, i, x))) continue;
        for (let o = 0; o < n - 1; o++) if (o !== a && removeWhere(cand, o, (i) => touches(n, i, x))) changed = true;
      }
    }
    return changed;
  }

  function level3(p, cand) {
    const n = p.n;
    for (let k = 0; k < n; k++) {
      if (cand[k].size < 2) continue;
      for (const i of Array.from(cand[k])) {
        const trial = cand.map((s) => new Set(s));
        trial[k] = new Set([i]);
        let bad = false;
        for (;;) {
          if (broken(p, trial)) { bad = true; break; }
          if (level1(p, trial)) continue;
          if (level2(p, trial)) continue;
          break;
        }
        if (!bad && trial.every((s) => s.size === 1) && !isSolution(p, trial.map((s) => s.values().next().value))) bad = true;
        if (bad) { cand[k].delete(i); return true; }
      }
    }
    return false;
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

  // Every true clue about the solution.
  function candidateClues(p, sol) {
    const n = p.n, cake = n - 1, out = [];
    for (let k = 0; k < n; k++) out.push({ t: "size", a: k, size: roomSize(p, p.rooms[sol[k]]) });
    for (let a = 0; a < n - 1; a++) {
      const d = steps(n, sol[a], sol[cake]);
      if (d >= 2) out.push({ t: "steps", a, d });
      for (let b = 0; b < n - 1; b++) {
        if (b === a) continue;
        if (rowOf(p, sol[a]) < rowOf(p, sol[b])) out.push({ t: "higher", a, b });
        if (colOf(p, sol[a]) < colOf(p, sol[b])) out.push({ t: "left", a, b });
        if (a < b && roomsBorder(p, p.rooms[sol[a]], p.rooms[sol[b]])) out.push({ t: "border", a, b });
      }
    }
    return out;
  }

  // One attempt at a board with a solution that obeys every rule.
  function randomBoard(cfg, rnd) {
    const n = cfg.n, k = n - 1;
    const rooms = randomRooms(n, k, rnd);
    if (!rooms) return null;
    const names = shuffle(ROOM_NAMES.slice(), rnd).slice(0, k);
    for (let tries = 0; tries < 30; tries++) {
      // One animal per room, in random order, never touching.
      const roomOrder = shuffle(Array.from({ length: k }, (_, r) => r), rnd);
      const sol = [];
      let ok = true;
      for (const room of roomOrder) {
        const free = shuffle(Array.from({ length: n * n }, (_, i) => i).filter((i) => rooms[i] === room && sol.every((j) => j !== i && !touches(n, i, j))), rnd);
        if (!free.length) { ok = false; break; }
        sol.push(free[0]);
      }
      if (!ok) continue;
      const spots = [];
      for (let x = 0; x < n * n; x++) {
        if (sol.indexOf(x) !== -1) continue;
        if (sol.filter((i) => touches(n, i, x)).length === 1) spots.push(x);
      }
      if (!spots.length) continue;
      sol.push(spots[Math.floor(rnd() * spots.length)]);
      return { n, rules: RULES, rooms, roomNames: names, clues: [], solution: sol };
    }
    return null;
  }

  // Does clue cl name thing k?
  function names(p, cl, k) {
    return cl.a === k || otherOf(p, cl, cl.a) === k;
  }

  // Clues are added until the puzzle has exactly one solution, every
  // clue that is not needed for that is removed again (each animal stays
  // named by at least one clue), and the result must be solvable by
  // deduction alone at the level's depth. Then Easy and Medium get
  // cfg.extra more true clues (p.needed keeps the number that was needed).
  function generatePuzzle(levelName, rng) {
    const rnd = rng || Math.random;
    const cfg = LEVELS[levelName] || LEVELS.medium;
    for (let attempt = 0; attempt < 400; attempt++) {
      const p = randomBoard(cfg, rnd);
      if (!p) continue;
      const pool = shuffle(candidateClues(p, p.solution), rnd);
      const clues = [];
      for (let a = 0; a < p.n - 1; a++) {
        if (clues.some((cl) => names(p, cl, a))) continue;
        const own = pool.filter((cl) => names(p, cl, a));
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
        let named = true;
        for (let a = 0; a < p.n - 1; a++) if (names(p, cl, a) && !rest.some((x) => names(p, x, a))) named = false;
        if (!named) continue;
        const before = p.clues;
        p.clues = rest;
        if (countSolutions(p, 2) !== 1) p.clues = before;
      }
      const d = deduce(p, cfg.level);
      if (!d.solved) continue;
      // Medium and Hard should need more than the simplest steps; after
      // many tries any deducible one is taken, so a puzzle always comes out.
      if (cfg.level >= 2 && attempt < 200 && deduce(p, cfg.level - 1).solved) continue;
      p.needed = p.clues.length;
      addExtraClues(p, pool, cfg.extra || 0);
      p.clues.sort((x, y) => x.a - y.a || CLUE_TYPES.indexOf(x.t) - CLUE_TYPES.indexOf(y.t));
      p.level = levelName;
      return p;
    }
    return null;
  }

  function sameClue(x, y) {
    return x.t === y.t && x.a === y.a && x.b === y.b && x.size === y.size && x.d === y.d;
  }

  // Extra clues: the simplest kinds first ("size", then "steps", ...), for
  // the things named least so far.
  function addExtraClues(p, pool, count) {
    for (let added = 0; added < count; added++) {
      const left = pool.filter((cl) => !p.clues.some((x) => sameClue(x, cl)));
      if (!left.length) return;
      const have = (k) => p.clues.filter((x) => names(p, x, k)).length;
      const score = (cl) => CLUE_TYPES.indexOf(cl.t) * 100 + have(cl.a);
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
  //   { kind: "step", thing, cell, reason }  where the next animal goes,
  //                                    and why (see explainStep)
  //   { kind: "last" }                 all animals stand right, the cake is open
  //   { kind: "done" }
  function findHint(p, placed, crosses) {
    for (let k = 0; k < p.n; k++) {
      if (placed[k] >= 0 && placed[k] !== p.solution[k]) return { kind: "wrong", thing: k, cell: placed[k] };
    }
    for (const i of crosses || []) if (p.solution.indexOf(i) !== -1) return { kind: "wrongx", cell: i };
    // Animals come before the cake: setting the cake ends the puzzle, and
    // that last step stays the player's.
    if (placed[p.n - 1] === p.solution[p.n - 1]) return { kind: "done" };
    const animals = [];
    for (let k = 0; k < p.n - 1; k++) if (placed[k] !== p.solution[k]) animals.push(k);
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

  // The cells animal t can still use on the board as it is: no cross, not
  // taken, not in the room of another placed animal, not next to one
  // (rules 1 to 3), and every clue in clueIdx holds against the things
  // already placed.
  function openCells(p, placed, crosses, t, clueIdx) {
    const n = p.n, out = [];
    const crossSet = new Set(crosses || []);
    for (let i = 0; i < n * n; i++) {
      if (crossSet.has(i)) continue;
      let ok = true;
      for (let o = 0; o < n && ok; o++) {
        if (o === t || placed[o] < 0) continue;
        if (placed[o] === i) ok = false;
        else if (o < n - 1 && (p.rooms[placed[o]] === p.rooms[i] || touches(n, placed[o], i))) ok = false;
      }
      if (ok && clueIdx.every((ci) => clueHolds(p, p.clues[ci], t, i, placed))) out.push(i);
    }
    return out;
  }

  // The clues about animal t that can be checked on the board as it is:
  // "size", or a two-thing clue whose other end is placed.
  function usableClues(p, placed, t) {
    const out = [];
    p.clues.forEach((cl, idx) => {
      if (!names(p, cl, t)) return;
      if (cl.t === "size" || placed[otherOf(p, cl, t)] >= 0) out.push(idx);
    });
    return out;
  }

  // Why animal k must stand on its solution cell, seen from the board as
  // it is (placed things and crosses; both already checked to be right):
  //   { kind: "free" }              only this cell is still free for it
  //                                 (rules 1 to 3 with the placed things)
  //   { kind: "clue", clues: [i] }  clue i (or clues i, j together) leave
  //                                 only this cell free
  //   { kind: "room" }              no other animal can still go into this
  //                                 room, and in it only this cell is free
  //   { kind: "rules" }             follows by deduction level 1
  //   { kind: "pairs" }             follows by level 2 (two-thing clues,
  //                                 the cake rule)
  //   { kind: "try" }               every other cell leads to a
  //                                 contradiction (level 3)
  //   { kind: "general", clues }    none of these; clues lists the clues
  //                                 about k
  function explainStep(p, placed, crosses, k) {
    const n = p.n, target = p.solution[k];
    const only = (cells) => cells.length === 1 && cells[0] === target;
    if (only(openCells(p, placed, crosses, k, []))) return { kind: "free" };
    const own = usableClues(p, placed, k);
    for (const ci of own) if (only(openCells(p, placed, crosses, k, [ci]))) return { kind: "clue", clues: [ci] };
    for (let x = 0; x < own.length; x++) for (let y = x + 1; y < own.length; y++) {
      if (only(openCells(p, placed, crosses, k, [own[x], own[y]]))) return { kind: "clue", clues: [own[x], own[y]] };
    }
    const room = p.rooms[target];
    const mine = openCells(p, placed, crosses, k, own).filter((i) => p.rooms[i] === room);
    let others = false;
    for (let t = 0; t < n - 1 && !others; t++) {
      if (t === k || placed[t] >= 0) continue;
      if (openCells(p, placed, crosses, t, usableClues(p, placed, t)).some((i) => p.rooms[i] === room)) others = true;
    }
    if (!others && only(mine)) return { kind: "room" };
    const start = { placed, crosses };
    const levelKinds = ["rules", "pairs", "try"];
    for (let lv = 1; lv <= 3; lv++) {
      const d = deduce(p, lv, start);
      if (d.fixedAt[k] !== -1) return { kind: levelKinds[lv - 1] };
    }
    const all = [];
    p.clues.forEach((cl, idx) => { if (names(p, cl, k)) all.push(idx); });
    return { kind: "general", clues: all };
  }

  // How simple a reason is, for choosing the hint (lower = simpler).
  const REASON_ORDER = ["free", "clue", "room", "rules", "pairs", "try", "general"];

  /*** Texts ***/

  // Builds the sentence for a clue from ready-made phrases (t = I18n.t).
  function fill(s, vars) {
    Object.keys(vars).forEach((k) => { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }

  // The id of animal k in the puzzle's theme (names: cake_<id>_..., icons:
  // CakeIcons <id>).
  function animalId(p, k) {
    return theme(p).who[k];
  }

  // The id of thing k: an animal, or "cake" / "fish" for the last one.
  function thingId(p, k) {
    if (isCake(p, k)) return theme(p).thing;
    return animalId(p, k);
  }

  // A text key in the puzzle's theme: base + "_fish" when the cats look for
  // a fish, and so on (only for the texts that name the cake).
  function themed(p, key) {
    return key + theme(p).suffix;
  }

  // The key of rule 3 ("Two animals never ...") for the theme.
  function always3Key(p) {
    return theme(p).people ? "cake_always_3_people" : "cake_always_3";
  }

  function clueText(p, clue, t) {
    const vars = {};
    if (!isCake(p, clue.a)) vars.A = t("cake_" + animalId(p, clue.a) + "_cap");
    if (clue.b !== undefined) vars.B = t("cake_" + animalId(p, clue.b) + "_mid");
    switch (clue.t) {
      case "size":
        vars.N = String(clue.size);
        return fill(t(isCake(p, clue.a) ? themed(p, "cake_clue_cakesize") : "cake_clue_size"), vars);
      case "higher": return fill(t("cake_clue_higher"), vars);
      case "left": return fill(t("cake_clue_leftof"), vars);
      case "border": return fill(t("cake_clue_border"), vars);
      case "steps": vars.N = String(clue.d); return fill(t(themed(p, "cake_clue_steps")), vars);
      default: return "";
    }
  }

  function thingName(p, k, t) {
    return isCake(p, k) ? t("cake_thing_" + thingId(p, k)) : t("cake_" + animalId(p, k) + "_name");
  }

  // The animal next to the cake, by the solution.
  function culprit(p) {
    const x = p.solution[p.n - 1];
    for (let a = 0; a < p.n - 1; a++) if (touches(p.n, p.solution[a], x)) return a;
    return -1;
  }

  // Can a saved puzzle still be played under today's rules?
  function isCurrent(p) {
    try {
      return !!p && p.rules === RULES && Array.isArray(p.rooms) && Array.isArray(p.clues) && isSolution(p, p.solution) && countSolutions(p, 2) === 1;
    } catch (e) {
      return false;
    }
  }

  return {
    RULES, ANIMALS, CATS, BEARS, DOGS, MAGPIES, FAMILY, KIDS, THEMES, MOTIFS, ROOM_NAMES, CLUE_TYPES, LEVELS, animalId, thingId, themed, always3Key,
    neighbours, touches, around, steps, roomSize, roomsBorder, pairHolds, clueHolds, baseCandidates, isSolution, countSolutions, deduce,
    randomRooms, candidateClues, generatePuzzle, addExtraClues, findHint, explainStep, openCells, usableClues, clueText, thingName, culprit, isCurrent, fill
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CakeCore;
}
if (typeof window !== "undefined") {
  window.CakeCore = CakeCore;
}
