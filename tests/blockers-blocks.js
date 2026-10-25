#!/usr/bin/env node
// Blocked Path, number of blocks chosen before the game (task 123):
//   - "normal" is the map's six blocks on both boards, exactly as before
//     (also without the option), "few" 4, "many" 11 (normal board with 2
//     to 4 players only; otherwise "many" falls back to "normal");
//   - with "all" the blocks near the goal stay off as before;
//   - a free way: from every house a path leads to the goal, and the
//     fewest blocks on such a path are the same for every house and at
//     most MAX_ON_WAY (a block must be hit exactly to get past it);
//   - save and load through JSON keeps the choice, states without
//     `blocks` are "normal";
//   - computer against computer: GAMES games (default 200) for each choice
//     and number of players (normal board 2 to 6, "many" and the quick
//     board 2 to 4), no
//     hang, every move legal, the number of blocks never changes; the
//     average game length in turns is printed.
const path = require("path");
const C = require(path.join(__dirname, "..", "blockers-core.js"));
const A = require(path.join(__dirname, "..", "blockers-ai.js"));
const GAMES = parseInt(process.env.GAMES || "200", 10);
const MAX_ON_WAY = 3;
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

check("choices few/normal/many", C.BLOCK_CHOICES.join(",") === "few,normal,many");
// Normal: unchanged, with and without the option.
for (const board of [undefined, "quick"]) {
  const plain = C.createInitialState(2, board ? { board } : {});
  const normal = C.createInitialState(2, board ? { board, blocks: "normal" } : { blocks: "normal" });
  const name = board || "normal board";
  check(name + ": 6 blocks as before", plain.stones.length === 6 && JSON.stringify(plain) === JSON.stringify(normal) && plain.blocks === undefined);
  check(name + ": the map's blocks", JSON.stringify(plain.stones) === JSON.stringify(C.boardOf(board).startStones));
  const few = C.createInitialState(2, board ? { board, blocks: "few" } : { blocks: "few" });
  check(name + ": few = 4", few.stones.length === 4 && few.blocks === "few" && few.stones.every((f) => plain.stones.indexOf(f) !== -1));
}
const many = C.createInitialState(2, { blocks: "many" });
check("normal board: many = 11", many.stones.length === 11 && many.blocks === "many" && new Set(many.stones).size === 11);
check("many blocks on fields, not in the bottom row, not the goal", many.stones.every((f) => C.fields.indexOf(f) !== -1 && !C.isBottomRow(f) && f !== C.goal));
const quickMany = C.createInitialState(2, { board: "quick", blocks: "many" });
check("quick board: many falls back to normal", quickMany.stones.length === 6 && quickMany.blocks === undefined);
for (const n of [5, 6]) {
  const s = C.createInitialState(n, { blocks: "many" });
  check(n + " players: many falls back to normal (the board fills up)", s.stones.length === 6 && s.blocks === undefined && C.MANY_MAX_PLAYERS === 4);
}
// With "all" the blocks near the goal stay off.
for (const blocks of C.BLOCK_CHOICES) {
  const s = C.createInitialState(2, { blocks, finish: "all", tokens: 3 });
  check(blocks + " with all: none near the goal", s.stones.every((f) => C.distToGoal[f] > C.NEAR_GOAL));
}
// Save and load.
{
  let s = C.createInitialState(3, { blocks: "many" });
  s = C.pass(C.setRoll(s, 2));
  const loaded = JSON.parse(JSON.stringify(s));
  check("save/load keeps many", loaded.blocks === "many" && C.setRoll(loaded, 3).blocks === "many" && loaded.stones.length === 11);
  const old = C.createInitialState(2);
  delete old.blocks;
  check("old state without blocks plays", C.legalMoves(C.setRoll(old, 3)).length > 0 && C.setRoll(old, 3).blocks === undefined);
}

// Fewest blocks on a way from a field to the goal (0-1 search: stepping
// onto a block costs 1).
function blocksOnWay(board, stones, from) {
  const b = C.boardOf(board);
  const set = new Set(stones);
  const cost = {};
  const dq = [[from, set.has(from) ? 1 : 0]];
  cost[from] = dq[0][1];
  while (dq.length) {
    const [f, c] = dq.shift();
    if (c > cost[f]) continue;
    if (f === b.goal) return c;
    for (const n of b.neighbours[f]) {
      const nc = c + (set.has(n) ? 1 : 0);
      if (cost[n] === undefined || nc < cost[n]) {
        cost[n] = nc;
        if (nc === c) dq.unshift([n, nc]); else dq.push([n, nc]);
      }
    }
  }
  return Infinity;
}
const ways = {};
for (const board of ["normal", "quick"]) {
  for (const blocks of C.BLOCK_CHOICES) {
    if (board === "quick" && blocks === "many") continue;
    for (const finish of ["one", "all"]) {
      const b = C.boardOf(board);
      const s = C.createInitialState(2, { board, blocks, finish, tokens: 3 });
      const per = b.houseCols.map((col) => blocksOnWay(board, s.stones, b.entry(col)));
      if (finish === "one") ways[board + " " + blocks] = per.join("/");
      check(board + " " + blocks + " " + finish + ": free way from every house " + per.join(","), per.every((x) => x === per[0] && x <= MAX_ON_WAY));
    }
  }
}

function play(board, blocks, n, seed, level) {
  const r = rng(seed);
  let s = C.createInitialState(n, { board, blocks, first: Math.floor(r() * n) });
  const stones = s.stones.length;
  let problem = null;
  for (let t = 0; t < 50000 && !s.gameOver; t++) {
    s = C.setRoll(s, C.rollDie(r));
    const moves = C.legalMoves(s);
    if (!moves.length) { s = C.pass(s); continue; }
    const m = A.chooseMove(s, level, r);
    if (!moves.some((x) => x.token === m.token && x.to === m.to)) { problem = "illegal move"; break; }
    const res = C.applyMove(s, m);
    s = res.state;
    if (res.stone && !s.gameOver) s = C.placeStone(s, A.chooseStone(s, level, r));
    if (!s) { problem = "stone"; break; }
    if (s.stones.length !== stones) { problem = "block count"; break; }
    if (t === 40) s = JSON.parse(JSON.stringify(s)); // save and load
  }
  if (!problem && !s.gameOver) problem = "no end";
  return { problem, s };
}
const lengths = [];
for (const board of ["normal", "quick"]) {
  for (const blocks of C.BLOCK_CHOICES) {
    if (board === "quick" && blocks === "many") continue;
    const parts = [];
    for (const n of board === "quick" || blocks === "many" ? [2, 3, 4] : [2, 3, 4, 5, 6]) {
      let turns = 0;
      for (let g = 0; g < GAMES; g++) {
        const r = play(board, blocks, n, 123000 + 1000 * n + g + (board === "quick" ? 50000 : 0) + 7 * C.BLOCK_CHOICES.indexOf(blocks), 1 + (g % 3));
        if (r.problem) { fails.push(board + " " + blocks + " " + n + " players, game " + g + ": " + r.problem); continue; }
        turns += r.s.turns;
      }
      parts.push(n + "p " + (turns / GAMES).toFixed(1));
    }
    lengths.push(board + " " + blocks + ": " + parts.join(", "));
  }
}
console.log("fewest blocks on the way per house: " + Object.keys(ways).map((k) => k + " " + ways[k]).join("; "));
console.log("average game length in turns (" + GAMES + " games each):");
lengths.forEach((l) => console.log("  " + l));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== BLOCKED PATH BLOCKS: few/normal/many, free way, save/load, " + GAMES + " games per choice and number of players, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
