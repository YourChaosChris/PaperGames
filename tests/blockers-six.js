#!/usr/bin/env node
// Blocked Path with 5 and 6 players (task 111), normal board:
//   - houses and shapes are all different (6 shapes, ring and cross for
//     seats 5 and 6), every house as far from the goal as the others;
//   - turn order, sending back, taking and putting a block, the ranking
//     after a win with "all" (6 places), save and load through JSON;
//   - computer against computer: GAMES games (default 200) each with 5
//     and with 6 players, no hang, every move legal;
//   - fairness: FAIR games (default 600) with 6 Medium computers and a
//     random starter, wins per house within 5 percentage points of 1/6;
//   - game length with 5 and 6 players for "one" and for "all" with 3
//     tokens (printed).
// Up to 4 players nothing changes (tests/blockers-core.js).
const path = require("path");
const C = require(path.join(__dirname, "..", "blockers-core.js"));
const A = require(path.join(__dirname, "..", "blockers-ai.js"));
const GAMES = parseInt(process.env.GAMES || "200", 10);
const FAIR = parseInt(process.env.FAIR || "600", 10);
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

check("6 shapes", C.SHAPES.length === 6 && C.SHAPES[4] === "ring" && C.SHAPES[5] === "cross");
for (const n of [5, 6]) {
  const s = C.createInitialState(n);
  check(n + " players created", s.numPlayers === n && s.tokens.length === n);
  check(n + " players: houses different", new Set(s.houses).size === n);
  check(n + " players: shapes different", new Set(s.shapes).size === n);
  const d = s.houses.map((h, p) => C.distToGoal[C.entryOf(s, p)]);
  check(n + " players: entries equally far " + d.join(","), d.every((x) => x === d[0]));
  const chosen = C.assignHouses(n, [5, 5]);
  check(n + " players: a taken house goes to the next free one", chosen[0] === 5 && chosen[1] === 0 && new Set(chosen).size === n);
}
// Turn order around six seats.
{
  let s = C.createInitialState(6, { first: 4 });
  const order = [];
  for (let i = 0; i < 7; i++) { order.push(s.turn); s = C.pass(C.setRoll(s, 1)); }
  check("turn order 4,5,0,1,2,3,4: " + order.join(","), order.join(",") === "4,5,0,1,2,3,4");
}
// Sending back in the upper half, block taken and put back.
{
  let s = C.createInitialState(6, { first: 5 });
  s.stones = [];
  const target = 3 * C.COLS + 4;           // row 3, upper half
  const from = 3 * C.COLS + 3;
  s.tokens[2][0] = target;
  s.tokens[5][0] = from;
  s = C.setRoll(s, 1);
  const m = C.legalMoves(s).find((x) => x.to === target);
  const r = m && C.applyMove(s, m);
  check("seat 6 sends seat 3 back", r && r.captured && r.captured.player === 2 && r.state.tokens[2][0] === -1);
  let t = C.createInitialState(6, { first: 4 });
  const stone = t.stones[0];
  const near = C.neighbours[stone].find((f) => t.stones.indexOf(f) === -1);
  t.tokens[4][0] = near;
  t = C.setRoll(t, 1);
  const mv = C.legalMoves(t).find((x) => x.to === stone);
  const res = mv && C.applyMove(t, mv);
  check("seat 5 takes a block", res && res.stone && res.state.phase === "stone");
  const placed = res && C.placeStone(res.state, C.stoneTargets(res.state)[0]);
  check("and puts it back; seat 6 is next", placed && placed.stones.length === t.stones.length && placed.turn === 5);
}
// Ranking with 6 places after a win with "all".
{
  const s = C.createInitialState(6, { finish: "all", tokens: 3 });
  s.tokens[3] = [C.ARRIVED, C.ARRIVED, C.ARRIVED];
  s.tokens[1] = [C.ARRIVED, C.ARRIVED, -1];
  s.tokens[0] = [C.ARRIVED, -1, -1];
  s.gameOver = true; s.winner = 3;
  const rk = C.ranking(s);
  check("ranking 6 places: " + rk.join(","), rk.length === 6 && rk[0] === 3 && rk[1] === 1 && rk[2] === 0 && new Set(rk).size === 6);
}

function play(n, seed, finish, level) {
  const r = rng(seed);
  let s = C.createInitialState(n, { first: Math.floor(r() * n), finish, tokens: 3 });
  const stones = s.stones.length;
  let problem = null;
  for (let t = 0; t < 50000 && !s.gameOver; t++) {
    s = C.setRoll(s, C.rollDie(r));
    const moves = C.legalMoves(s);
    if (!moves.length) { s = C.pass(s); continue; }
    const m = A.chooseMove(s, level || 1 + ((seed + s.turn) % 3), r);
    if (!moves.some((x) => x.token === m.token && x.to === m.to)) { problem = "illegal move"; break; }
    if (m.path.length !== s.roll) { problem = "path length"; break; }
    const res = C.applyMove(s, m);
    s = res.state;
    if (res.stone && !s.gameOver) s = C.placeStone(s, A.chooseStone(s, level || 2, r));
    if (!s) { problem = "stone"; break; }
    if (s.stones.length !== stones) { problem = "stone count"; break; }
    if (t === 60) s = JSON.parse(JSON.stringify(s)); // save and load
  }
  if (!problem && !s.gameOver) problem = "no end";
  return { problem, s };
}
const lengths = {};
for (const n of [5, 6]) {
  for (const finish of ["one", "all"]) {
    let turns = 0;
    for (let g = 0; g < GAMES; g++) {
      const r = play(n, 50000 * n + g + (finish === "all" ? 7777 : 0), finish);
      if (r.problem) { fails.push(n + " players " + finish + ", game " + g + ": " + r.problem); continue; }
      turns += r.s.turns;
      if (finish === "all" && n === 6 && C.ranking(r.s).length !== 6) fails.push("ranking length");
    }
    lengths[n + " " + finish] = (turns / GAMES).toFixed(1);
  }
}
const wins = new Array(6).fill(0);
for (let g = 0; g < FAIR; g++) {
  const r = play(6, 900000 + g * 7, "one", 2);
  if (!r.problem) wins[r.s.houses[r.s.winner]]++;
}
const pct = wins.map((w) => 100 * w / FAIR);
pct.forEach((p, h) => check("house " + (h + 1) + " wins " + p.toFixed(1) + "% (fair 16.7%)", Math.abs(p - 100 / 6) <= 5));
console.log("average game length in turns: " + Object.keys(lengths).map((k) => k + (k.endsWith("all") ? " (3 tokens)" : "") + ": " + lengths[k]).join(", "));
console.log("6 players, " + FAIR + " games, Medium: wins per house " + pct.map((p, h) => (h + 1) + ": " + p.toFixed(1) + "%").join(", "));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== BLOCKED PATH 5 AND 6 PLAYERS: houses, shapes, turns, ranking, " + GAMES + " games each, fairness " + FAIR + " games, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
