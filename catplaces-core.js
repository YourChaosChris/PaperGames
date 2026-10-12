// catplaces-core.js
// "Cat Places" (Katzenplätze): rules, generator, logical solver and hint.
//
// A square field of N x N cells is split into N rooms. Place N cats so that
// every row, every column and every room holds exactly one cat, and no two
// cats touch - not even at a corner. (The general logic-puzzle genre is
// known as "Star Battle"; this is its one-per-line form.)
//
// The generator places N cats (one per row and column, none touching),
// grows a room around each cat at random and keeps the field only if the
// solver below finishes it by deduction alone - which also proves that it
// has exactly one solution. Deductions, in the order a person would try
// them:
//   1. a cat rules out its row, column, room and the eight cells around it;
//   2. a row, column or room with one free cell left gets its cat there;
//   3. if all free cells of a room lie in one row (or column), the rest of
//      that row is ruled out - and the other way round (a row whose free
//      cells lie in one room rules out the rest of the room);
//   4. a cell whose cat would leave some row, column or room without any
//      free cell is ruled out;
//   5. (Hard only) k rooms whose free cells lie in k rows (or columns) rule
//      out the rest of those rows, and the other way round.
// Easy uses 1-3, Medium 1-4, Hard 1-5.
//
// Pure logic - no DOM.

const CatPlacesCore = (function () {
  const LEVELS = {
    easy: { n: 5, rules: 3 },
    medium: { n: 7, rules: 4 },
    hard: { n: 8, rules: 5 }
  };

  function rnd(k) { return Math.floor(Math.random() * k); }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function neighbours(n, i) {
    const r = Math.floor(i / n), c = i % n, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < n && cc >= 0 && cc < n) out.push(rr * n + cc);
    }
    return out;
  }

  // Rows, columns and rooms of a field, and what each cell rules out,
  // worked out once per field.
  const cache = typeof WeakMap !== "undefined" ? new WeakMap() : null;
  function ctxOf(p) {
    let c = cache && cache.get(p);
    if (c && c.rooms === p.rooms.join()) return c;
    const U = units(p), ruled = [];
    for (let i = 0; i < p.n * p.n; i++) ruled.push(ruledOutBy(p, i));
    const unitsOf = [];
    for (let i = 0; i < p.n * p.n; i++) unitsOf.push([]);
    U.forEach((u, k) => u.forEach((i) => unitsOf[i].push(k)));
    c = { rooms: p.rooms.join(), U, ruled, unitsOf };
    if (cache) cache.set(p, c);
    return c;
  }

  // The 3n units: rows, columns, rooms - each a list of cells.
  function units(p) {
    const n = p.n, out = [];
    for (let r = 0; r < n; r++) { const u = []; for (let c = 0; c < n; c++) u.push(r * n + c); out.push(u); }
    for (let c = 0; c < n; c++) { const u = []; for (let r = 0; r < n; r++) u.push(r * n + c); out.push(u); }
    for (let k = 0; k < n; k++) out.push([]);
    p.rooms.forEach((k, i) => out[2 * n + k].push(i));
    return out;
  }

  // Cells sharing a row, column or room with i, or touching it.
  function ruledOutBy(p, i) {
    const n = p.n, r = Math.floor(i / n), c = i % n, set = new Set(neighbours(n, i));
    for (let j = 0; j < n * n; j++) {
      if (j === i) continue;
      if (Math.floor(j / n) === r || j % n === c || p.rooms[j] === p.rooms[i]) set.add(j);
    }
    return Array.from(set);
  }

  // Conflicts among the cats placed: cats sharing a row, column or room,
  // or touching. Returns the set of cells involved.
  function conflicts(p, cats) {
    const n = p.n, bad = new Set();
    for (let a = 0; a < cats.length; a++) for (let b = a + 1; b < cats.length; b++) {
      const i = cats[a], j = cats[b];
      const ri = Math.floor(i / n), ci = i % n, rj = Math.floor(j / n), cj = j % n;
      if (ri === rj || ci === cj || p.rooms[i] === p.rooms[j] || (Math.abs(ri - rj) <= 1 && Math.abs(ci - cj) <= 1)) { bad.add(i); bad.add(j); }
    }
    return bad;
  }

  function isSolved(p, cats) {
    return cats.length === p.n && conflicts(p, cats).size === 0;
  }

  // Number of solutions (stops at limit), by plain search row by row.
  function countSolutions(p, limit) {
    const n = p.n;
    limit = limit || 2;
    const colUsed = [], roomUsed = [];
    let count = 0, prev = -2;
    function go(r, prevCol) {
      if (count >= limit) return;
      if (r === n) { count++; return; }
      for (let c = 0; c < n; c++) {
        if (colUsed[c] || Math.abs(c - prevCol) <= 1) continue;
        const k = p.rooms[r * n + c];
        if (roomUsed[k]) continue;
        colUsed[c] = roomUsed[k] = true;
        go(r + 1, c);
        colUsed[c] = roomUsed[k] = false;
      }
    }
    go(0, prev);
    return count;
  }

  // Logical solver. state: { cat: bool[], out: bool[] }. Applies one
  // deduction of the allowed rules and returns a description of it, or
  // null when stuck. Rule 1 is applied as part of placing a cat.
  function freeCells(state, u) { return u.filter((i) => !state.cat[i] && !state.out[i]); }
  function hasCat(state, u) { return u.some((i) => state.cat[i]); }

  function place(p, state, i) {
    state.cat[i] = true;
    ctxOf(p).ruled[i].forEach((j) => { if (!state.cat[j]) state.out[j] = true; });
  }

  function step(p, state, maxRule) {
    const n = p.n, X = ctxOf(p), U = X.U;
    // Rule 2: a unit with one free cell and no cat.
    for (let u = 0; u < U.length; u++) {
      if (hasCat(state, U[u])) continue;
      const f = freeCells(state, U[u]);
      if (f.length === 1) { place(p, state, f[0]); return { rule: 2, place: f[0], unit: u }; }
    }
    if (maxRule < 3) return null;
    // Rule 3: a room confined to one row/column, or a row/column confined
    // to one room.
    const lineOf = [(i) => Math.floor(i / n), (i) => i % n];
    for (let k = 0; k < n; k++) {
      const room = U[2 * n + k];
      if (hasCat(state, room)) continue;
      const f = freeCells(state, room);
      if (!f.length) continue;
      for (let t = 0; t < 2; t++) {
        const line = lineOf[t](f[0]);
        if (f.every((i) => lineOf[t](i) === line)) {
          const out = freeCells(state, U[t * n + line]).filter((i) => p.rooms[i] !== k);
          if (out.length) { out.forEach((i) => { state.out[i] = true; }); return { rule: 3, out }; }
        }
      }
    }
    for (let u = 0; u < 2 * n; u++) {
      if (hasCat(state, U[u])) continue;
      const f = freeCells(state, U[u]);
      if (!f.length) continue;
      const k = p.rooms[f[0]];
      if (f.every((i) => p.rooms[i] === k)) {
        const out = freeCells(state, U[2 * n + k]).filter((i) => U[u].indexOf(i) === -1);
        if (out.length) { out.forEach((i) => { state.out[i] = true; }); return { rule: 3, out }; }
      }
    }
    if (maxRule < 4) return null;
    // Rule 4: a cat here would empty another unit.
    for (let i = 0; i < n * n; i++) {
      if (state.cat[i] || state.out[i]) continue;
      const gone = new Set(X.ruled[i]);
      gone.add(i);
      const mine = X.unitsOf[i];
      const dead = U.some((u, k) => mine.indexOf(k) === -1 && !hasCat(state, u) && freeCells(state, u).every((j) => gone.has(j)));
      if (dead) { state.out[i] = true; return { rule: 4, out: [i] }; }
    }
    if (maxRule < 5) return null;
    // Rule 5: k rooms within k lines, or k lines within k rooms.
    const openRooms = [];
    for (let k = 0; k < n; k++) if (!hasCat(state, U[2 * n + k])) openRooms.push(k);
    for (let t = 0; t < 2; t++) {
      const openLines = [];
      for (let l = 0; l < n; l++) if (!hasCat(state, U[t * n + l])) openLines.push(l);
      // rooms -> lines
      const res = subsets(openRooms, (set) => {
        const lines = new Set();
        set.forEach((k) => freeCells(state, U[2 * n + k]).forEach((i) => lines.add(lineOf[t](i))));
        if (lines.size !== set.length) return null;
        const out = [];
        lines.forEach((l) => freeCells(state, U[t * n + l]).forEach((i) => { if (set.indexOf(p.rooms[i]) === -1) out.push(i); }));
        return out.length ? out : null;
      });
      if (res) { res.forEach((i) => { state.out[i] = true; }); return { rule: 5, out: res }; }
      // lines -> rooms
      const res2 = subsets(openLines, (set) => {
        const rooms = new Set();
        set.forEach((l) => freeCells(state, U[t * n + l]).forEach((i) => rooms.add(p.rooms[i])));
        if (rooms.size !== set.length) return null;
        const out = [];
        rooms.forEach((k) => freeCells(state, U[2 * n + k]).forEach((i) => { if (set.indexOf(lineOf[t](i)) === -1) out.push(i); }));
        return out.length ? out : null;
      });
      if (res2) { res2.forEach((i) => { state.out[i] = true; }); return { rule: 5, out: res2 }; }
    }
    return null;
  }

  // Calls fn on every subset of size 2 .. len-1; returns the first
  // non-null result.
  function subsets(items, fn) {
    const m = items.length;
    for (let mask = 1; mask < (1 << m) - 1; mask++) {
      let bits = 0;
      for (let b = mask; b; b &= b - 1) bits++;
      if (bits < 2) continue;
      const set = [];
      for (let b = 0; b < m; b++) if (mask & (1 << b)) set.push(items[b]);
      const r = fn(set);
      if (r) return r;
    }
    return null;
  }

  // Solves by deduction; returns { cats, steps, maxRule } or null if stuck
  // or contradictory.
  function solveLogically(p, maxRule, givenCats) {
    const n = p.n;
    const state = { cat: new Array(n * n).fill(false), out: new Array(n * n).fill(false) };
    (givenCats || []).forEach((i) => place(p, state, i));
    const steps = [];
    let used = 0;
    for (let guard = 0; guard < 10 * n * n; guard++) {
      const cats = state.cat.reduce((a, v, i) => (v ? a.concat(i) : a), []);
      if (cats.length === n) return isSolved(p, cats) ? { cats, steps, maxRule: used } : null;
      const s = step(p, state, maxRule);
      if (!s) return null;
      steps.push(s);
      used = Math.max(used, s.rule);
    }
    return null;
  }

  function randomCats(n) {
    // One per row and column, rows next to each other at least 2 columns
    // apart.
    for (let tries = 0; tries < 1000; tries++) {
      const cols = [], used = new Array(n).fill(false);
      const ok = (function go(r) {
        if (r === n) return true;
        const order = shuffle(Array.from({ length: n }, (_, c) => c));
        for (const c of order) {
          if (used[c] || (r && Math.abs(c - cols[r - 1]) <= 1)) continue;
          used[c] = true; cols.push(c);
          if (go(r + 1)) return true;
          used[c] = false; cols.pop();
        }
        return false;
      })(0);
      if (ok) return cols.map((c, r) => r * n + c);
    }
    return null;
  }

  // Grows a room from every cat until the field is full.
  function growRooms(n, cats) {
    const rooms = new Array(n * n).fill(-1);
    const front = cats.map((i, k) => { rooms[i] = k; return [i]; });
    let left = n * n - n;
    while (left > 0) {
      const k = rnd(n);
      const cand = [];
      front[k].forEach((i) => [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].forEach((j) => {
        if (j >= 0 && j < n * n && rooms[j] === -1) cand.push(j);
      }));
      if (!cand.length) continue;
      const j = cand[rnd(cand.length)];
      rooms[j] = k;
      front[k].push(j);
      left--;
    }
    // Number rooms in reading order of their first cell.
    const map = {}, out = [];
    let next = 0;
    rooms.forEach((k) => { if (map[k] === undefined) map[k] = next++; out.push(map[k]); });
    return out;
  }

  // Whether room k stays in one piece without cell i.
  function connectedWithout(n, rooms, k, i) {
    const cells = [];
    rooms.forEach((r, j) => { if (r === k && j !== i) cells.push(j); });
    if (!cells.length) return false;
    const seen = new Set([cells[0]]), st = [cells[0]];
    while (st.length) {
      const j = st.pop();
      [j - n, j + n, j % n ? j - 1 : -1, j % n < n - 1 ? j + 1 : -1].forEach((m) => {
        if (m >= 0 && m < n * n && m !== i && rooms[m] === k && !seen.has(m)) { seen.add(m); st.push(m); }
      });
    }
    return seen.size === cells.length;
  }

  function renumber(rooms) {
    const map = {}, out = [];
    let next = 0;
    rooms.forEach((k) => { if (map[k] === undefined) map[k] = next++; out.push(map[k]); });
    return out;
  }

  // Random rooms, then single border cells handed to a neighbouring room
  // as long as that does not raise the number of solutions, until only
  // one is left; kept if the deduction finishes it with the level's rules.
  function generatePuzzle(level) {
    const L = LEVELS[level] || LEVELS.easy;
    const n = L.n;
    const lv = level in LEVELS ? level : "easy";
    for (let tries = 0; tries < 5000; tries++) {
      const cats = randomCats(n);
      const isCat = new Array(n * n).fill(false);
      cats.forEach((i) => { isCat[i] = true; });
      let rooms = growRooms(n, cats);
      let count = countSolutions({ n, rooms }, 40);
      for (let it = 0; it < 60 * n && count > 1; it++) {
        const i = rnd(n * n);
        if (isCat[i]) continue;
        const nb = [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].filter((j) => j >= 0 && j < n * n && rooms[j] !== rooms[i]);
        if (!nb.length) continue;
        const k = rooms[nb[rnd(nb.length)]];
        if (!connectedWithout(n, rooms, rooms[i], i)) continue;
        const next = rooms.slice();
        next[i] = k;
        const c2 = countSolutions({ n, rooms: next }, 40);
        if (c2 >= 1 && c2 <= count) { rooms = next; count = c2; }
      }
      if (count !== 1) continue;
      const p = { level: lv, n, rooms: renumber(rooms) };
      const res = solveLogically(p, L.rules);
      if (!res) continue;
      // Medium and Hard should need their own rule at least once.
      if (L.rules >= 4 && res.maxRule < L.rules) continue;
      p.solution = res.cats.slice().sort((x, y) => x - y);
      return p;
    }
    return null;
  }

  // Hint for the player's cats: a cat in a wrong place first, otherwise
  // the next cat the deduction reaches from the correct cats placed.
  function findHint(p, cats) {
    const wrong = cats.find((i) => p.solution.indexOf(i) === -1);
    if (wrong !== undefined) return { wrong };
    const L = LEVELS[p.level] || LEVELS.hard;
    const state = { cat: new Array(p.n * p.n).fill(false), out: new Array(p.n * p.n).fill(false) };
    cats.forEach((i) => place(p, state, i));
    for (let guard = 0; guard < 10 * p.n * p.n; guard++) {
      const s = step(p, state, Math.max(L.rules, 5));
      if (!s) break;
      if (s.place !== undefined && cats.indexOf(s.place) === -1) return { place: s.place };
    }
    const missing = p.solution.find((i) => cats.indexOf(i) === -1);
    return missing === undefined ? null : { place: missing };
  }

  // Thick borders: for each cell, whether its right / bottom side is a
  // room border.
  function borders(p) {
    const n = p.n, right = [], bottom = [];
    for (let i = 0; i < n * n; i++) {
      right.push(i % n < n - 1 && p.rooms[i] !== p.rooms[i + 1]);
      bottom.push(i < n * (n - 1) && p.rooms[i] !== p.rooms[i + n]);
    }
    return { right, bottom };
  }

  return {
    LEVELS, neighbours, units, conflicts, isSolved, countSolutions,
    solveLogically, generatePuzzle, findHint, borders, growRooms, randomCats
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = CatPlacesCore;
