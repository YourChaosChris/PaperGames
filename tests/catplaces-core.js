// tests/catplaces-core.js
// "Cat Places": 500 generated fields per level.
//
// Checks per field: the size of the level (5, 7, 8), n rooms, each one
// connected piece; exactly one solution, counted by a search of its own
// here (every cell tried, not the core's row-by-row search); the stored
// solution is that one and keeps all rules (one cat per row, column and
// room, none touching); the deduction alone finishes it with the level's
// rules (Medium and Hard need their hardest rule at least once). Playing
// with the hint alone fills the field, starting from one wrongly placed
// cat, which the hint names first. The conflict check flags two cats at a
// corner, in one row, one column and one room.
//
// Run: node tests/catplaces-core.js

const C = require("../catplaces-core.js");

const fails = [];
const SIZE = { easy: 5, medium: 7, hard: 8 };
const N = 500;

// All solutions, brute force over cells (up to 2).
function countOwn(p) {
  const n = p.n;
  let found = 0, sol = null;
  const cats = [];
  function ok(i) {
    const r = Math.floor(i / n), c = i % n;
    return cats.every((j) => {
      const rj = Math.floor(j / n), cj = j % n;
      return r !== rj && c !== cj && p.rooms[i] !== p.rooms[j] && !(Math.abs(r - rj) <= 1 && Math.abs(c - cj) <= 1);
    });
  }
  (function go(start) {
    if (found >= 2) return;
    if (cats.length === n) { found++; sol = cats.slice(); return; }
    for (let i = start; i < n * n; i++) if (ok(i)) { cats.push(i); go(i + 1); cats.pop(); }
  })(0);
  return { found, sol };
}

function connected(p, k) {
  const n = p.n, cells = [];
  p.rooms.forEach((r, i) => { if (r === k) cells.push(i); });
  if (!cells.length) return false;
  const seen = new Set([cells[0]]), st = [cells[0]];
  while (st.length) {
    const i = st.pop();
    [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].forEach((j) => {
      if (j >= 0 && j < n * n && p.rooms[j] === k && !seen.has(j)) { seen.add(j); st.push(j); }
    });
  }
  return seen.size === cells.length;
}

// Conflict check.
{
  const p = { n: 5, rooms: [0, 0, 1, 1, 1, 0, 0, 1, 2, 2, 3, 3, 1, 2, 2, 3, 4, 4, 4, 2, 3, 4, 4, 4, 4] };
  const cases = [[[0, 6], true, "corner"], [[0, 3], true, "row"], [[0, 15], true, "column"], [[2, 4], true, "room"], [[0, 13], false, "apart"]];
  cases.forEach(([cats, want, what]) => {
    if ((C.conflicts(p, cats).size > 0) !== want) fails.push("conflict check wrong for " + what);
  });
}

const t0 = Date.now();
Object.keys(SIZE).forEach((lv) => {
  const ids = new Set();
  let rule = 0;
  for (let k = 0; k < N; k++) {
    const p = C.generatePuzzle(lv);
    const tag = lv + " #" + (k + 1);
    if (!p) { fails.push(tag + ": no field"); continue; }
    if (p.n !== SIZE[lv] || p.rooms.length !== p.n * p.n) { fails.push(tag + ": size " + p.n); continue; }
    ids.add(p.rooms.join(""));
    const roomIds = new Set(p.rooms);
    if (roomIds.size !== p.n) fails.push(tag + ": " + roomIds.size + " rooms");
    for (let r = 0; r < p.n; r++) if (!connected(p, r)) fails.push(tag + ": room " + r + " in pieces");
    const own = countOwn(p);
    if (own.found !== 1) { fails.push(tag + ": " + own.found + " solutions"); continue; }
    if (own.sol.join() !== p.solution.join()) fails.push(tag + ": stored solution differs");
    if (!C.isSolved(p, p.solution)) fails.push(tag + ": solution breaks a rule");
    const res = C.solveLogically(p, C.LEVELS[lv].rules);
    if (!res) fails.push(tag + ": deduction gets stuck");
    else {
      rule = Math.max(rule, res.maxRule);
      if (C.LEVELS[lv].rules >= 4 && res.maxRule < C.LEVELS[lv].rules) fails.push(tag + ": never needs rule " + C.LEVELS[lv].rules);
    }
    // Hint only, from one wrong cat.
    const wrong = Array.from({ length: p.n * p.n }, (_, i) => i).find((i) => p.solution.indexOf(i) === -1);
    let cats = [wrong];
    const h0 = C.findHint(p, cats);
    if (!h0 || h0.wrong !== wrong) fails.push(tag + ": hint does not name the wrong cat");
    cats = [];
    for (let s = 0; s < p.n + 2 && !C.isSolved(p, cats); s++) {
      const h = C.findHint(p, cats);
      if (!h || h.place === undefined) { fails.push(tag + ": no hint"); break; }
      if (p.solution.indexOf(h.place) === -1) { fails.push(tag + ": hint places a wrong cat"); break; }
      cats.push(h.place);
    }
    if (!C.isSolved(p, cats)) fails.push(tag + ": hint does not finish");
  }
  console.log(lv + ": " + N + " fields " + SIZE[lv] + " x " + SIZE[lv] + ", " + ids.size + " different, each with exactly one solution, solved by deduction (hardest rule used: " + rule + ")");
});
console.log("time: " + ((Date.now() - t0) / 1000).toFixed(1) + " s");

if (fails.length) {
  fails.slice(0, 20).forEach((f) => console.log("FAIL: " + f));
  console.log("=== CAT PLACES CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== CAT PLACES CORE: 0 failures ===");
