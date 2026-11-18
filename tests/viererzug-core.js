#!/usr/bin/env node
// Four Moves (viererzug-core.js / viererzug-ai.js, task 224): winning sets
// (28 lines, 16 squares), placing and moving rules, repetition draw, passing
// when a side is stuck, and the computer: every level always answers with a
// legal move, takes a win, and Hard beats Easy. No server or browser needed.
const path = require("path");
const Core = require(path.join(__dirname, "..", "viererzug-core.js"));
global.ViererzugCore = Core;
const Ai = require(path.join(__dirname, "..", "viererzug-ai.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
const empty = () => Core.createInitialState();
function put(state, cells, color) { cells.forEach(([r, c]) => { state.board[r][c] = color; }); }
const ONLY_LINES = Core.WINDOWS.filter((w) => w.kind === "line").length;
const ONLY_SQUARES = Core.WINDOWS.filter((w) => w.kind === "square").length;
check(ONLY_LINES === 28 && ONLY_SQUARES === 16, "28 lines and 16 squares, got " + ONLY_LINES + "/" + ONLY_SQUARES);

// Every winning set wins for the owner, for both colours; three stones do not.
Core.WINDOWS.forEach((w, i) => {
  ["b", "w"].forEach((color) => {
    const s = empty();
    put(s, w.cells, color);
    const win = Core.getWinner(s.board);
    check(win && win.winner === color && win.kind === w.kind, "window " + i + " " + color);
    s.board[w.cells[3][0]][w.cells[3][1]] = null;
    check(Core.getWinner(s.board) === null, "three stones of window " + i);
  });
});
{ const s = empty(); put(s, [[0, 0], [0, 1], [0, 2]], "b"); put(s, [[0, 3]], "w"); put(s, [[0, 4]], "b"); check(Core.getWinner(s.board) === null, "mixed row no win"); }
{ const s = empty(); put(s, [[0, 0], [0, 1], [1, 0]], "b"); put(s, [[1, 1]], "w"); check(Core.getWinner(s.board) === null, "mixed square no win"); }

// Placing: 25 moves at the start, four stones each, then moving.
let s = empty();
check(Core.phase(s) === "place" && Core.getLegalMoves(s).length === 25, "start: 25 placements");
const order = [[0, 0], [4, 4], [0, 4], [4, 0], [2, 0], [2, 4], [4, 2], [0, 2]];
order.forEach((to, i) => {
  check(Core.phase(s) === "place", "placing phase before stone " + i);
  const mover = s.turn;
  s = Core.applyMove(s, { from: null, to });
  check(s.board[to[0]][to[1]] === mover, "stone " + i + " placed");
  check(s.turn === Core.otherColor(mover) || s.result, "turn passes " + i);
});
check(!s.result && Core.phase(s) === "move" && s.placed.b === 4 && s.placed.w === 4, "moving phase after eight stones");
Core.getLegalMoves(s).forEach((m) => {
  check(m.from && s.board[m.from[0]][m.from[1]] === s.turn && !s.board[m.to[0]][m.to[1]] &&
    Math.max(Math.abs(m.from[0] - m.to[0]), Math.abs(m.from[1] - m.to[1])) === 1, "legal move shape " + JSON.stringify(m));
});
// Black corner stone (0,0): neighbours (0,1),(1,0),(1,1) are free -> 3 moves; nobody else is next to it.
check(Core.getLegalMoves(s).filter((m) => m.from[0] === 0 && m.from[1] === 0).length === 3, "corner stone has 3 moves");

// A move that completes a square or line wins at once, with the cells.
{ const t = empty(); t.placed = { b: 4, w: 4 }; put(t, [[0, 0], [0, 1], [1, 0], [3, 3]], "b"); put(t, [[4, 0], [4, 1], [4, 2], [4, 4]], "w");
  const w = Core.applyMove(t, { from: [3, 3], to: [2, 2] }); check(!w.result, "no win yet");
  const t2 = empty(); t2.placed = { b: 4, w: 4 }; put(t2, [[0, 0], [0, 1], [1, 0], [2, 1]], "b"); put(t2, [[4, 0], [4, 1], [4, 2], [4, 4]], "w");
  const w2 = Core.applyMove(t2, { from: [2, 1], to: [1, 1] });
  check(w2.result && w2.result.winner === "b" && w2.result.kind === "square" && w2.result.cells.length === 4, "square wins");
  const t3 = empty(); t3.placed = { b: 4, w: 4 }; put(t3, [[1, 0], [1, 1], [1, 2], [2, 4]], "b"); put(t3, [[4, 0], [4, 1], [4, 2], [4, 4]], "w");
  const w3 = Core.applyMove(t3, { from: [2, 4], to: [1, 3] });
  check(w3.result && w3.result.winner === "b" && w3.result.kind === "line", "line wins");
  check(Core.getLegalMoves(w3).length === 0, "no moves after the end"); }

// Repetition: the same position the third time is a draw.
{ const t = empty(); t.placed = { b: 4, w: 4 }; put(t, [[0, 0], [0, 2], [2, 0], [2, 2]], "b"); put(t, [[4, 0], [4, 2], [4, 4], [2, 4]], "w");
  let u = Core.applyMove(t, { from: [0, 0], to: [0, 1] }); // first sighting of the next position
  const loop = [{ from: [4, 0], to: [4, 1] }, { from: [0, 1], to: [0, 0] }, { from: [4, 1], to: [4, 0] }, { from: [0, 0], to: [0, 1] }];
  let rounds = 0;
  while (!u.result && rounds < 30) { loop.forEach((m) => { if (!u.result) u = Core.applyMove(u, m); }); rounds++; }
  check(u.result && u.result.draw === "repetition" && rounds <= 3, "repetition draw after " + rounds + " rounds"); }

// A side without a move is skipped (cannot happen with four stones a side on
// a real game, so the position is built by hand). Random games never pass or block.
{ const t = empty(); t.placed = { b: 4, w: 4 };
  put(t, [[0, 0], [0, 1]], "w"); put(t, [[1, 0], [1, 1], [1, 2], [0, 2], [4, 4]], "b");
  const u = Core.applyMove(t, { from: [4, 4], to: [4, 3] });
  check(!u.result && u.passed === "w" && u.turn === "b", "stuck white is skipped, black moves again");
  check(Core.getLegalMoves(u).every((m) => u.board[m.from[0]][m.from[1]] === "b"), "after the pass only black moves");
  let ended = 0;
  for (let i = 0; i < 100; i++) {
    let g = Core.createInitialState();
    for (let n = 0; n < 400 && !g.result; n++) { const moves = Core.getLegalMoves(g); g = Core.applyMove(g, moves[Math.floor(Math.random() * moves.length)]); check(!g.passed, "no pass in a real game"); }
    if (g.result) ended++;
  }
  check(ended >= 30, "random games end in a win or a draw (" + ended + " of 100 within 400 plies)"); }

// The computer: legal answers on random positions, wins when it can, Hard beats Easy.
function randomState(plies) {
  let g = Core.createInitialState();
  for (let n = 0; n < plies && !g.result; n++) { const moves = Core.getLegalMoves(g); g = Core.applyMove(g, moves[Math.floor(Math.random() * moves.length)]); }
  return g;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (let i = 0; i < 100; i++) {
  const g = randomState(Math.floor(Math.random() * 30));
  if (g.result) continue;
  [1, 2, 3].forEach((level) => {
    const m = Ai.chooseMove(g, level);
    check(Core.getLegalMoves(g).some((x) => same(x, m)), "level " + level + " answers with a legal move");
  });
}
{ // takes the win
  const t = empty(); t.placed = { b: 4, w: 4 }; put(t, [[0, 0], [0, 1], [1, 0], [2, 1]], "b"); put(t, [[4, 0], [4, 1], [4, 2], [4, 4]], "w");
  [1, 2, 3].forEach((level) => { const m = Ai.chooseMove(t, level); check(same(m, { from: [2, 1], to: [1, 1] }) || (Core.step(t, m).result || {}).winner === "b", "level " + level + " takes the win"); });
  // blocks: White threatens a square with (0,0),(0,1),(1,0)+(2,1)->(1,1); black must not leave it (Medium and Hard)
}
function play(levelB, levelW, maxPlies) {
  let g = Core.createInitialState();
  for (let n = 0; n < maxPlies && !g.result; n++) g = Core.applyMove(g, Ai.chooseMove(g, g.turn === "b" ? levelB : levelW));
  return g.result;
}
let hardWins = 0, easyWins = 0;
for (let i = 0; i < 10; i++) {
  const r1 = play(3, 1, 80); if (r1 && r1.winner === "b") hardWins++; if (r1 && r1.winner === "w") easyWins++;
  const r2 = play(1, 3, 80); if (r2 && r2.winner === "w") hardWins++; if (r2 && r2.winner === "b") easyWins++;
}
check(hardWins >= 14 && hardWins > easyWins, "Hard beats Easy in most games (" + hardWins + " to " + easyWins + " of 20)");
console.log(`=== VIERERZUG CORE: ${checks} checks (44 winning sets, placing, moving, repetition, passing, computer on 3 levels), ${failures.length} failure(s) ===`);
if (failures.length) { console.error(failures.slice(0, 20).join("\n")); process.exitCode = 1; }
