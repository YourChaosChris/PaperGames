#!/usr/bin/env node
// Tower of Hanoi (hanoi-core.js, task 118): from the start the hint leads
// to the goal in exactly 2^n - 1 moves for n = 3..8; moves onto a smaller
// disc, from an empty rod and onto the same rod are refused with their
// reason; undo; from 300 positions after random legal moves the hint
// reaches the goal on a shortest way (checked by a search in the test).
const path = require("path");
const Core = require(path.join(__dirname, "..", "hanoi-core.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
function key(pegs) { const pos = []; pegs.forEach((p, peg) => p.forEach(d => { pos[d - 1] = peg; })); return pos.join(""); }
function bfsDistance(state) {
  const goal = key([[], [], Array.from({ length: state.n }, (_, i) => state.n - i)]), queue = [state.pegs.map(p => p.slice())], seen = new Map([[key(state.pegs), 0]]);
  for (let q = 0; q < queue.length; q++) { const pegs = queue[q], k = key(pegs), d = seen.get(k); if (k === goal) return d;
    for (let from = 0; from < 3; from++) for (let to = 0; to < 3; to++) {
      if (from === to || !pegs[from].length) continue;
      const disk = pegs[from][pegs[from].length - 1], top = pegs[to][pegs[to].length - 1]; if (top !== undefined && disk > top) continue;
      const next = pegs.map(p => p.slice()); next[to].push(next[from].pop()); const nk = key(next); if (!seen.has(nk)) { seen.set(nk, d + 1); queue.push(next); }
    }
  } return Infinity;
}
for (let n = 3; n <= 8; n++) {
  let s = Core.newGame(n), steps = 0;
  while (!Core.isSolved(s) && steps <= Core.minMoves(n)) { const move = Core.nextMove(s); check(Array.isArray(move), `nextMove start n=${n}`); s = Core.move(s, move[0], move[1]); steps++; }
  check(Core.isSolved(s) && steps === 2 ** n - 1, `optimal start n=${n}`);
  check(Core.movesToSolve(Core.newGame(n)) === 2 ** n - 1, `distance start n=${n}`);
}
let s = Core.newGame(3);
for (const [state, from, to, reason] of [[s,0,0,"same"],[s,1,2,"empty"],[{ ...s, pegs: [[3,2],[1],[]] },0,1,"bigger"]]) { const before = state; check(Core.canMove(state, from, to).reason === reason, `reject ${reason}`); check(Core.move(state, from, to) === before, `identity ${reason}`); }
s = Core.move(s, 0, 2); const after = Core.move(s, 2, 1), undone = Core.undo(after);
check(JSON.stringify(undone.pegs) === JSON.stringify(s.pegs) && undone.moves === s.moves, "undo restores previous state");
const rng = Core.makeRng(87321);
for (let trial = 0; trial < 300; trial++) {
  const n = 3 + Math.floor(rng() * 3); let state = Core.newGame(n);
  for (let j = 0, limit = Math.floor(rng() * 25); j < limit; j++) {
    const options = [];
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (Core.canMove(state, a, b).ok) options.push([a,b]);
    const chosen = options[Math.floor(rng() * options.length)]; state = Core.move(state, chosen[0], chosen[1]);
  }
  const expected = bfsDistance(state), reported = Core.movesToSolve(state); let done = state, count = 0;
  while (!Core.isSolved(done) && count <= expected) { const mv = Core.nextMove(done); if (!mv) break; done = Core.move(done, mv[0], mv[1]); count++; }
  check(count === expected && Core.isSolved(done), `random optimal path ${trial}`);
  check(reported === expected, `random movesToSolve ${trial}`);
}
console.log(`=== HANOI CORE: ${checks} checks (6 starts, 300 random states, legality, undo), ${failures.length} failure(s) ===`);
if (failures.length) { console.error(failures.slice(0, 20).join("\n")); process.exitCode = 1; }
