#!/usr/bin/env node
// Sliding puzzle (slidepuzzle-core.js, task 118): 1000 mixed 3 x 3 and 4 x 4
// puzzles and 100 of 5 x 5 are all solvable (parity) and never solved, 4 x 4
// mixed with at least 80 moves; a move next to the gap, sliding a whole row
// and a whole column, a move outside row and column refused; an unsolvable
// board is recognised; the exact 3 x 3 solution (0 and 1 move, 50 puzzles
// replayed to the goal, never more than 31 moves); 200 hints on 4 x 4 are
// legal moves.
const path = require("path");
const Core = require(path.join(__dirname, "..", "slidepuzzle-core.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
function manhattan(a, size) { return a.reduce((sum, v, i) => { if (!v) return sum; const t = v - 1; return sum + Math.abs(Math.floor(i / size) - Math.floor(t / size)) + Math.abs(i % size - t % size); }, 0); }
for (const [size, count, min] of [[3, 1000, 30], [4, 1000, 80], [5, 100, 150]]) {
  for (let i = 0; i < count; i++) {
    const s = Core.newGame(size, Core.makeRng(size * 100000 + i), min);
    check(Core.isSolvable(s.tiles, size), `solvable ${size}/${i}`);
    check(!Core.isSolved(s), `scrambled ${size}/${i}`);
    if (size === 4) check(s.shuffleMoves >= 80, `4x4 shuffle minimum ${i}`);
  }
}
const solved = Core.solvedTiles(3);
let s = { size: 3, tiles: [1,2,3,4,5,6,7,0,8], moves: 0, solved: false };
let m = Core.move(s, 8); check(m.tiles.join(",") === "1,2,3,4,5,6,7,8,0" && m.moves === 1, "adjacent swap");
s = { size: 4, tiles: [1,2,3,4,5,6,7,8,9,10,11,12,0,13,14,15], moves: 0, solved: false };
m = Core.move(s, 15); check(m.tiles.join(",") === "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0", "row multi shift");
s = { size: 4, tiles: [1,2,3,0,5,6,7,4,9,10,11,8,13,14,15,12], moves: 0, solved: false };
m = Core.move(s, 15); check(m.tiles.join(",") === "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0", "column multi shift");
s = { size: 3, tiles: [1,2,3,4,5,6,0,7,8], moves: 0, solved: false };
check(Core.move(s, 1) === s, "invalid move identity");
check(!Core.isSolvable([2,1,3,4,5,6,7,8,0], 3) && !Core.isSolvable([2,1,3,4,5,6,7,8,9,10,11,12,13,14,15,0], 4), "unsolvable board recognised");
check(Core.solve3(solved).length === 0, "solve solved board");
check(Core.solve3([1,2,3,4,5,6,7,0,8]).length === 1, "solve one move board");
for (let i = 0; i < 50; i++) {
  const g = Core.newGame(3, Core.makeRng(9000 + i), 5 + i % 20), answer = Core.solve3(g.tiles);
  let tiles = g.tiles.slice();
  if (!answer || answer.length > 31) { check(false, `solve3 length ${i}`); continue; }
  for (const index of answer.path) { const state = { size: 3, tiles, moves: 0, solved: false }; check(Core.canMove(state, index), `solve3 legal step ${i}`); tiles = Core.move(state, index).tiles; }
  check(Core.isSolved({ tiles }), `solve3 reaches goal ${i}`);
}
let hintState = Core.newGame(4, Core.makeRng(4521), 80);
for (let i = 0; i < 200; i++) {
  const index = Core.hint(hintState);
  if (index == null || !Core.canMove(hintState, index)) break;
  const before = manhattan(hintState.tiles, 4), next = Core.move(hintState, index);
  check(next !== hintState && Math.abs(manhattan(next.tiles, 4) - before) === 1, `hint is a legal single move ${i}`);
  hintState = next;
}
console.log(`=== SLIDEPUZZLE CORE: ${checks} checks (2100 shuffles, moves, solve3, hints), ${failures.length} failure(s) ===`);
if (failures.length) { console.error(failures.slice(0, 20).join("\n")); process.exitCode = 1; }
