#!/usr/bin/env node
// Nim (nim-core.js, task 118): for every position with 1 to 3 heaps of 0 to
// 6 stones the xor rule (and its misère form) agrees with a full search,
// and the perfect move leads into a lost position exactly when the
// position is won; the hard computer wins 100 games each (normal, misère)
// from a winning position against random moves; illegal moves are refused.
const path = require("path");
const Core = require(path.join(__dirname, "..", "nim-core.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
function search(heaps, misere, memo = new Map()) {
  const key = heaps.join(","); if (memo.has(key)) return memo.get(key);
  const moves = [];
  heaps.forEach((n, h) => { for (let count = 1; count <= n; count++) { const next = heaps.slice(); next[h] -= count; moves.push(next); } });
  let win;
  if (!moves.length) win = !!misere;
  else win = moves.some(next => !search(next, misere, memo));
  memo.set(key, win); return win;
}
for (let n = 1; n <= 3; n++) {
  const total = 7 ** n;
  for (let code = 1; code < total; code++) {
    let x = code, heaps = Array.from({ length: n }, () => { const v = x % 7; x = Math.floor(x / 7); return v; });
    for (const misere of [false, true]) {
      const won = search(heaps, misere);
      check(Core.isWinning(heaps, misere) === won, `isWinning ${heaps}/${misere}`);
      const mv = Core.perfectMove(heaps, misere);
      check((mv !== null) === won, `perfectMove existence ${heaps}/${misere}`);
      if (mv) { const next = heaps.slice(); next[mv.heap] -= mv.count; check(!search(next, misere), `perfectMove child ${heaps}/${misere}`); }
    }
  }
}
const rng = Core.makeRng(712389);
function randomTurn(state) { const options = []; state.heaps.forEach((n,h) => { for (let c=1;c<=n;c++) options.push([h,c]); }); const [h,c] = options[Math.floor(rng() * options.length)]; return Core.move(state,h,c); }
for (const misere of [false, true]) for (let game = 0; game < 100; game++) {
  const heaps = [3 + Math.floor(rng()*4), 3 + Math.floor(rng()*4), 3 + Math.floor(rng()*4)];
  while (!Core.isWinning(heaps, misere)) heaps[0]++;
  let state = Core.newGame({ heaps, misere, first: 0 });
  while (!state.over) {
    if (state.turn === 0) { const mv = Core.aiMove(state, "hard", rng); if (!mv) break; state = Core.move(state, mv.heap, mv.count); }
    else state = randomTurn(state);
  }
  check(state.over && state.winner === 0, `hard wins game ${misere}/${game}`);
}
let state = Core.newGame({ heaps: [2, 0] });
for (const [heap,count] of [[0,0],[0,3],[1,1]]) check(Core.move(state,heap,count) === state, `invalid move ${heap}/${count}`);
console.log(`=== NIM CORE: ${checks} checks (398 heap positions in both rules, 200 hard games, invalid moves), ${failures.length} failure(s) ===`);
if (failures.length) { console.error(failures.slice(0, 20).join("\n")); process.exitCode = 1; }
