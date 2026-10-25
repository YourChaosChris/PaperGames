#!/usr/bin/env node
// Quick board of "Blocked Path" (task 110, s.board === "quick"):
//   - the board is connected, every house entry is equally far from the
//     goal, 6 stones at the start (game end "one"), 4 tokens per player,
//     four rest fields, no stone on a rest field at the start;
//   - rest field: a token there cannot be sent back, only one token may
//     stand there (own tokens too), no stone may be put there; there is no
//     safe half (a token in the bottom row can be sent back);
//   - computer against computer, 2, 3 and 4 players, GAMES games each
//     (default 200), levels mixed: every game ends, every move follows the
//     roll and passes no stone, the number of stones stays the same, never
//     two tokens on a rest field and never a stone on one; a save (JSON) in
//     the middle of every game plays on; game length against the normal
//     board with the same computers;
//   - "all" works on the quick board too; an old normal state is untouched.
const path = require("path");
const C = require(path.join(__dirname, "..", "blockers-core.js"));
const A = require(path.join(__dirname, "..", "blockers-ai.js"));

const GAMES = parseInt(process.env.GAMES || "200", 10);
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const Q = C.boardOf("quick");
const at = (r, c) => r * Q.cols + c;

// The board.
{
  const seen = new Set([Q.goal]);
  const queue = [Q.goal];
  while (queue.length) { const f = queue.shift(); Q.neighbours[f].forEach((n) => { if (!seen.has(n)) { seen.add(n); queue.push(n); } }); }
  check("quick board connected", seen.size === Q.fields.length);
  const d = Q.houseCols.map((c) => Q.distToGoal[Q.entry(c)]);
  check("every house equally far: " + d.join(","), d.every((x) => x === d[0]));
  console.log("quick board: " + Q.rows + " rows, " + Q.fields.length + " fields, house entries " + d[0] + " steps from the goal (normal board " + C.distToGoal[(C.ROWS - 1) * C.COLS + C.HOUSE_COLS[0]] + "), " + Q.rest.length + " rest fields");
  check("four rest fields", Q.rest.length === 4);
  check("no stone on a rest field at the start", !Q.startStones.some((f) => Q.isRest(f)));
  const s = C.createInitialState(4, { board: "quick" });
  check("6 stones at the start", s.stones.length === 6);
  check("4 tokens per player", s.tokens.every((t) => t.length === 4));
  check("state marked quick", s.board === "quick" && C.boardOf(s) === Q);
  check("at most 4 players", C.createInitialState(6, { board: "quick" }).numPlayers <= 4);
  check("houses inside the quick board", s.houses.every((h) => h >= 0 && h < 4));
  const all = C.createInitialState(3, { board: "quick", finish: "all", tokens: 5 });
  check("all: 4 tokens, stone next to the goal off", all.tokens[0].length === 4 && all.stones.every((f) => Q.distToGoal[f] > C.NEAR_GOAL));
  const normal = C.createInitialState(2);
  check("normal state has no board field", !("board" in normal));
}

// Rest fields.
{
  const rest = at(4, 4); // a rest field
  check("(4,4) is a rest field", Q.isRest(rest));
  let s = C.createInitialState(2, { board: "quick", houses: [0, 3] });
  s.stones = [];
  s.tokens[1][0] = rest;          // the other player rests there
  s.tokens[0][0] = at(6, 4);      // two steps below: (6,4) -> (5,4) -> (4,4)
  s = C.setRoll(s, 2);
  check("no move ends on another token on a rest field", !C.legalMoves(s).some((m) => m.to === rest));
  s.tokens[1][0] = -1;
  s.tokens[0][1] = rest;          // own token rests there
  check("no second own token on a rest field", !C.legalMoves(s).some((m) => m.to === rest));
  s.tokens[0][1] = -1;
  check("a free rest field can be reached", C.legalMoves(s).some((m) => m.to === rest));
  // Stones never on a rest field.
  let t = C.createInitialState(2, { board: "quick" });
  t.phase = "stone";
  check("no stone target on a rest field", !C.stoneTargets(t).some((f) => Q.isRest(f)));
  check("placing a stone on a rest field fails", C.placeStone(t, rest) === null);
  // No safe half: a token in the bottom row can be sent back.
  let u = C.createInitialState(2, { board: "quick", houses: [0, 3] });
  u.stones = [];
  u.tokens[1][0] = at(6, 2);
  u.tokens[0][0] = at(6, 0);
  u = C.setRoll(u, 2);
  const hit = C.legalMoves(u).find((m) => m.to === at(6, 2));
  check("bottom row is not safe on the quick board", !!hit && C.applyMove(u, hit).captured);
}

// Computer games.
function play(n, seed, board, finish) {
  const r = rng(seed);
  const opts = { first: seed % n, finish: finish || "one", tokens: 3 };
  if (board) opts.board = board;
  let s = C.createInitialState(n, opts);
  const B = C.boardOf(s);
  const stones = s.stones.length;
  let problem = null;
  for (let t = 0; t < 20000 && !s.gameOver; t++) {
    s = C.setRoll(s, C.rollDie(r));
    const moves = C.legalMoves(s);
    if (!moves.length) { s = C.pass(s); continue; }
    const m = A.chooseMove(s, 1 + ((seed + s.turn) % 3), r);
    if (!moves.some((x) => x.token === m.token && x.to === m.to)) { problem = "illegal move"; break; }
    if (m.path.length !== s.roll || new Set(m.path).size !== m.path.length) { problem = "path does not match the roll"; break; }
    if (m.path.slice(0, -1).some((f) => s.stones.indexOf(f) !== -1)) { problem = "passed a stone"; break; }
    const res = C.applyMove(s, m);
    s = res.state;
    if (res.stone && !s.gameOver) {
      const f = A.chooseStone(s, 2, r);
      if (B.isRest(f)) { problem = "stone on a rest field"; break; }
      s = C.placeStone(s, f);
      if (!s) { problem = "stone not placed"; break; }
    }
    if (s.stones.length !== stones) { problem = "stone count"; break; }
    const onRest = {};
    for (const tk of s.tokens) for (const f of tk) if (B.isRest(f)) onRest[f] = (onRest[f] || 0) + 1;
    if (Object.values(onRest).some((c) => c > 1)) { problem = "two tokens on a rest field"; break; }
    if (t === 40) s = JSON.parse(JSON.stringify(s)); // save and load
  }
  if (!problem && !s.gameOver) problem = "no end";
  if (board && s.board !== board) problem = "board lost";
  return { problem, turns: s.turns, winner: s.winner, houses: s.houses };
}
const lengths = {};
const winsByHouse = {};
for (const n of [2, 3, 4]) {
  let quickTurns = 0, normalTurns = 0, done = 0;
  for (let g = 0; g < GAMES; g++) {
    const q = play(n, 1000 * n + g, "quick");
    if (q.problem) { fails.push(n + " players, game " + g + ": " + q.problem); continue; }
    done++;
    quickTurns += q.turns;
    if (n === 4) { const h = q.houses[q.winner]; winsByHouse[h] = (winsByHouse[h] || 0) + 1; }
    const o = play(n, 1000 * n + g);
    if (o.problem) fails.push("normal " + n + " players, game " + g + ": " + o.problem);
    normalTurns += o.turns;
  }
  lengths[n] = { quick: +(quickTurns / Math.max(1, done)).toFixed(1), normal: +(normalTurns / GAMES).toFixed(1), games: done };
  check(n + " players: quick games clearly shorter", lengths[n].quick < lengths[n].normal * 0.8);
}
for (let g = 0; g < 50; g++) {
  const a = play(3, 777 + g, "quick", "all");
  if (a.problem) fails.push("quick all, game " + g + ": " + a.problem);
}
console.log("average game length in turns (quick / normal): " + Object.keys(lengths).map((n) => n + " players " + lengths[n].quick + " / " + lengths[n].normal).join(", "));
console.log("4 players, wins by house (houses 1-4): " + [0, 1, 2, 3].map((h) => winsByHouse[h] || 0).join(", "));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== BLOCKED PATH QUICK BOARD: board, rest fields, " + GAMES + " computer games each for 2, 3 and 4 players, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
