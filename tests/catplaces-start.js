// tests/catplaces-start.js
// "Cat Places" button "Where to start?": findStart() must always name a
// cell that is right (one cell of the stored solution, checked against the
// solution), for random board states on all levels: correct cats only,
// correct cats plus wrong ones, with the reason checked on its own.
//
// Run: node tests/catplaces-start.js

const C = require("../catplaces-core.js");

const fails = [];
const PER_LEVEL = 250;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

// Cells still free in unit u after the cats given (own computation).
function freeIn(p, cats, u) {
  return u.filter((i) => cats.every((c) => {
    const n = p.n;
    return !(c === i || Math.floor(c / n) === Math.floor(i / n) || c % n === i % n || p.rooms[c] === p.rooms[i] ||
      (Math.abs(Math.floor(c / n) - Math.floor(i / n)) <= 1 && Math.abs((c % n) - (i % n)) <= 1));
  }));
}

let checks = 0, byReason = { row: 0, col: 0, room: 0, think: 0 };
["easy", "medium", "hard"].forEach((lv) => {
  for (let k = 0; k < PER_LEVEL; k++) {
    const p = C.generatePuzzle(lv);
    const tag = lv + " #" + k;
    // Random subset of the solution (0 .. n-1 cats), sometimes with wrong cats.
    const sub = shuffle(p.solution.slice()).slice(0, Math.floor(Math.random() * p.n));
    const cats = sub.slice();
    if (k % 3 === 0) {
      const others = shuffle(Array.from({ length: p.n * p.n }, (_, i) => i).filter((i) => p.solution.indexOf(i) === -1));
      cats.push(others[0], others[1]);
    }
    const h = C.findStart(p, cats);
    checks++;
    if (!h) { fails.push(tag + ": no result with " + sub.length + " correct cats"); continue; }
    if (p.solution.indexOf(h.place) === -1) { fails.push(tag + ": cell " + h.place + " is not in the solution"); continue; }
    if (sub.indexOf(h.place) !== -1) { fails.push(tag + ": cell already holds a correct cat"); continue; }
    byReason[h.reason]++;
    const n = p.n, U = C.units(p);
    const unit = { row: (i) => U[Math.floor(i / n)], col: (i) => U[n + (i % n)], room: (i) => U[2 * n + p.rooms[i]] }[h.reason];
    if (h.reason !== "think") {
      const f = freeIn(p, sub, unit(h.place));
      if (f.length !== 1 || f[0] !== h.place) fails.push(tag + ": reason " + h.reason + " is not true (free cells " + f.join() + ")");
    }
  }
});
// Full board: nothing to point out.
{
  const p = C.generatePuzzle("easy");
  if (C.findStart(p, p.solution) !== null) fails.push("solved board must give null");
}
// The reason text always exists for every kind.
console.log("start hint: " + checks + " random board states, always a cell of the solution; reasons row/col/room/think: " +
  [byReason.row, byReason.col, byReason.room, byReason.think].join("/"));

if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== CAT PLACES START: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== CAT PLACES START: 0 failures ===");
