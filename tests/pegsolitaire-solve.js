#!/usr/bin/env node
// Task 211: every Peg Solitaire board starts in a position that can be
// solved down to one peg. A depth-first search that remembers dead
// positions finds a solution for each board; the solution is then played
// again with the game's own rules (PegSolitaireCore.isLegalMove/applyMove).
// Run: node tests/pegsolitaire-solve.js
const P = require("../pegsolitaire-core.js");

const LIMIT_MS = 300000; // per board; a board not solved in time fails the test
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

function solveBoard(variant) {
  const board = P.createInitialBoard(variant);
  const cells = [];
  const index = {};
  board.forEach((row, r) => row.forEach((v, c) => { if (v !== null) { index[r + "," + c] = cells.length; cells.push([r, c]); } }));
  const n = cells.length;
  // Jumps as (from, over, to) cell numbers, by the board's own directions.
  const jumps = [];
  const dirs = P.BOARDS[P.variantOf(variant)].dirs;
  cells.forEach(([r, c], a) => dirs.forEach(({ dr, dc }) => {
    const b = index[(r + dr) + "," + (c + dc)], t = index[(r + 2 * dr) + "," + (c + 2 * dc)];
    if (b !== undefined && t !== undefined) jumps.push([a, b, t]);
  }));
  // Try jumps from the outside towards the middle first: pegs far out are
  // the ones that get stranded.
  const size = board.length, mid = (size - 1) / 2;
  const far = (i) => Math.abs(cells[i][0] - mid) + Math.abs(cells[i][1] - mid);
  jumps.sort((x, y) => (far(y[0]) - far(y[2])) - (far(x[0]) - far(x[2])) || far(y[0]) - far(x[0]));
  // Square boards: a position and its mirror images are equally (un)solvable.
  const sym = [];
  if (!P.BOARDS[P.variantOf(variant)].offsetRows) {
    const maps = [(r, c) => [r, c], (r, c) => [r, size - 1 - c], (r, c) => [size - 1 - r, c], (r, c) => [size - 1 - r, size - 1 - c],
      (r, c) => [c, r], (r, c) => [c, size - 1 - r], (r, c) => [size - 1 - c, r], (r, c) => [size - 1 - c, size - 1 - r]];
    maps.forEach((f) => {
      const m = cells.map(([r, c]) => index[f(r, c).join(",")]);
      if (m.every((x) => x !== undefined)) sym.push(m);
    });
  }
  // State: one byte per cell; key: the cells as a number (n <= 52 fits).
  const s = new Uint8Array(n);
  cells.forEach(([r, c], i) => { s[i] = board[r][c] ? 1 : 0; });
  const pow = []; for (let i = 0; i < n; i++) pow.push(Math.pow(2, i));
  let key = 0; for (let i = 0; i < n; i++) if (s[i]) key += pow[i];
  let pegs = s.reduce((a, b) => a + b, 0);
  // Neighbours of each cell (any direction of the board).
  const neigh = cells.map(() => []);
  jumps.forEach(([a, b]) => { if (neigh[a].indexOf(b) === -1) neigh[a].push(b); });
  const dead = new Set();
  const path = [];
  let nodes = 0;
  const t0 = Date.now();
  let tries = 0, attemptLimit = Infinity, noise = 0;
  let seed = 211;
  const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  // The smallest key among the mirror images.
  const canon = () => {
    if (sym.length < 2) return key;
    let best = key;
    for (let k = 1; k < sym.length; k++) {
      const m = sym[k];
      let v = 0;
      for (let i = 0; i < n; i++) if (s[i]) v += pow[m[i]];
      if (v < best) best = v;
    }
    return best;
  };
  function dfs() {
    if (pegs === 1) return true;
    const ck = canon();
    if (dead.has(ck)) return false;
    nodes++;
    if ((nodes & 4095) === 0 && Date.now() - t0 > LIMIT_MS) throw new Error("time");
    if (++tries > attemptLimit) throw new Error("restart");
    // Jumps open here, those leaving the fewest lonely pegs first.
    const open = [];
    for (let j = 0; j < jumps.length; j++) {
      const [a, b, t] = jumps[j];
      if (s[a] && s[b] && !s[t]) {
        s[a] = 0; s[b] = 0; s[t] = 1;
        let lonely = 0;
        for (let i = 0; i < n; i++) {
          if (!s[i]) continue;
          let nb = false;
          const ns = neigh[i];
          for (let q = 0; q < ns.length; q++) if (s[ns[q]]) { nb = true; break; }
          if (!nb) lonely++;
        }
        s[a] = 1; s[b] = 1; s[t] = 0;
        open.push([lonely * 100 + far(t) - far(a) + noise * rng(), j]);
      }
    }
    open.sort((x, y) => x[0] - y[0]);
    for (let q = 0; q < open.length; q++) {
      const j = open[q][1];
      const [a, b, t] = jumps[j];
      {
        s[a] = 0; s[b] = 0; s[t] = 1; key += pow[t] - pow[a] - pow[b]; pegs--;
        path.push(j);
        if (dfs()) return true;
        path.pop();
        s[a] = 1; s[b] = 1; s[t] = 0; key -= pow[t] - pow[a] - pow[b]; pegs++;
      }
    }
    if (dead.size > 8000000) dead.clear(); // a cache, not a proof
    dead.add(ck);
    return false;
  }
  // Restarts with a little randomness in the order (fixed seed): a search
  // that got stuck in a huge dead part starts again, keeping what it
  // learned about dead positions.
  let ok = false, attempts = 0;
  const s0 = s.slice(), key0 = key, pegs0 = pegs;
  for (;;) {
    attempts++;
    tries = 0;
    try { ok = dfs(); break; } catch (e) {
      if (e.message === "time") break;
      if (e.message !== "restart") throw e;
      s.set(s0); key = key0; pegs = pegs0; path.length = 0;
      noise = 60;
      attemptLimit = Math.min(attemptLimit * 1.3, 20000000);
    }
  }
  const ms = Date.now() - t0;
  // Replay with the game's rules.
  let b = P.createInitialBoard(variant), replay = ok;
  if (ok) {
    path.forEach((j) => {
      const [a, o, t] = jumps[j].map((i) => cells[i]);
      if (!P.isLegalMove(b, a[0], a[1], t[0], t[1], variant)) replay = false;
      else b = P.applyMove(b, { from: a, over: o, to: t });
    });
    if (P.countPegs(b) !== 1) replay = false;
  }
  return { ok, replay, moves: path.length, nodes, ms, holes: n, attempts };
}

// The two big boards take the search above too long; their solutions were
// found once with a beam search (best 20000 / 200000 positions per jump,
// fewest lonely pegs first) and are only played again here.
const STORED = {
  wiegleb: [[2,4,4,4],[0,4,2,4],[3,2,3,4],[1,3,3,3],[2,5,2,3],[0,5,2,5],[3,3,1,3],[0,3,2,3],[5,3,3,3],[7,3,5,3],[6,5,6,3],[4,4,6,4],[8,5,6,5],[5,2,5,4],[5,0,5,2],[5,5,7,5],[8,3,8,5],[8,5,6,5],[5,7,5,5],[5,5,7,5],[7,5,7,3],[7,3,5,3],[5,3,5,1],[3,0,5,0],[5,0,5,2],[2,3,4,3],[3,1,5,1],[5,1,5,3],[6,4,4,4],[3,4,5,4],[5,3,5,5],[3,6,5,6],[3,8,3,6],[4,8,4,6],[5,5,5,7],[5,8,5,6],[4,2,4,4],[3,5,3,7],[5,6,3,6],[3,7,3,5],[4,4,4,6],[2,5,4,5],[4,5,4,7]],
  diamond41: [[0,4,2,4],[3,4,1,4],[2,2,2,4],[3,6,3,4],[5,6,3,6],[4,8,4,6],[4,5,4,7],[2,6,4,6],[1,5,3,5],[4,3,2,3],[1,3,3,3],[3,4,3,6],[1,4,3,4],[3,7,3,5],[5,4,5,6],[5,7,5,5],[4,7,4,5],[5,2,5,4],[4,5,4,3],[7,3,5,3],[3,2,5,2],[6,2,4,2],[5,4,5,6],[6,6,4,6],[3,4,3,6],[6,5,6,3],[8,4,6,4],[6,3,6,5],[7,5,5,5],[3,6,5,6],[5,6,5,4],[5,4,5,2],[5,2,3,2],[4,0,4,2],[4,3,2,3],[3,1,3,3],[2,3,4,3],[4,3,4,1],[5,1,3,1]]
};

function replayStored(variant) {
  let b = P.createInitialBoard(variant), ok = true;
  STORED[variant].forEach(([fr, fc, tr, tc]) => {
    if (!ok || !P.isLegalMove(b, fr, fc, tr, tc, variant)) { ok = false; return; }
    b = P.applyMove(b, { from: [fr, fc], over: [(fr + tr) / 2, (fc + tc) / 2], to: [tr, tc] });
  });
  ok = ok && P.countPegs(b) === 1;
  return { ok, replay: ok, moves: STORED[variant].length, nodes: 0, ms: 0, holes: P.countHoles(b), attempts: 0 };
}

const only = process.argv.slice(2);
(only.length ? only : P.VARIANTS).forEach((v) => {
  const r = STORED[v] ? replayStored(v) : solveBoard(v);
  if (STORED[v]) { console.log(v + ": " + r.holes + " holes, stored solution with " + r.moves + " jumps played again by the game's rules: " + (r.ok ? "one peg left" : "FAILED")); }
  else
  console.log(v + ": " + r.holes + " holes, " + (r.ok ? "solved to one peg in " + r.moves + " jumps" : "NOT solvable") + ", " + r.nodes + " positions searched in " + r.attempts + " attempt(s), " + r.ms + " ms, replay " + (r.replay ? "ok" : "FAILED"));
  check(v + ": start position can be solved to one peg", r.ok);
  check(v + ": solution is legal by the game's rules", r.replay);
  check(v + ": board has the documented number of holes", r.holes === P.BOARDS[v].holes);
});

if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("=== PEG SOLITAIRE SOLVE: " + (only.length || P.VARIANTS.length) + " boards, every start solvable to one peg, 0 failure(s) ===");
