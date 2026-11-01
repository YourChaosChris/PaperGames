#!/usr/bin/env node
// Irrgarten core (task 170). For every level and every one of its five
// mazes: the grid has the level's size, walls match on both sides, the maze
// is "perfect" (n * n - 1 open passages and every cell reachable, so exactly
// one way between any two cells), start and goal are joined, the maze is the
// same when made again from its seed, and the five mazes of a level differ.
// Play: walking the solution with single taps and with straight taps solves
// it; a tap through a wall or off the line changes nothing; stepping back
// shortens the way; a tap on an older cell of the way goes back to it; the
// drawing finger follows up to three cells; the hint leads out of a dead end;
// undo; valid() refuses broken saves.
const C = require("../irrgarten-core.js");
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

let mazes = 0, cells = 0, solLen = {};
for (const level of C.LEVELS) {
  const seen = new Set();
  for (let k = 0; k < C.COUNT; k++) {
    const m = C.maze(level, k);
    const n = C.SIZE[level];
    mazes++;
    cells += n * n;
    check(level + k + " size", m.n === n && m.open.length === n * n && m.start === 0 && m.goal === n * n - 1);
    let edges = 0, sym = true, border = true;
    for (let c = 0; c < n * n; c++) {
      const x = c % n, y = (c - x) / n;
      C.DIRS.forEach((d) => {
        if (!(m.open[c] & d[0])) return;
        const nx = x + d[1], ny = y + d[2];
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) { border = false; return; }
        if (!(m.open[ny * n + nx] & d[3])) sym = false;
        edges++;
      });
    }
    check(level + k + " walls match on both sides", sym && border);
    check(level + k + " perfect: " + edges / 2 + " passages", edges / 2 === n * n - 1);
    const reach = new Set([0]), q = [0];
    while (q.length) C.neighbours(m, q.shift()).forEach((c) => { if (!reach.has(c)) { reach.add(c); q.push(c); } });
    check(level + k + " every cell reachable", reach.size === n * n);
    const sol = C.solution(m);
    check(level + k + " start and goal joined", sol && sol[0] === 0 && sol[sol.length - 1] === m.goal);
    solLen[level] = Math.min(solLen[level] || Infinity, sol.length);
    // Made again from the seed by a freshly loaded core: the same maze.
    delete require.cache[require.resolve("../irrgarten-core.js")];
    const fresh = require("../irrgarten-core.js");
    check(level + k + " the same maze when made again", fresh.maze(level, k).open.join(",") === m.open.join(","));
    const key = m.open.join(",");
    check(level + k + " differs from the other mazes of its level", !seen.has(key));
    seen.add(key);

    // Walk the solution cell by cell.
    let s = C.newGame(level, k);
    for (let i = 1; i < sol.length; i++) {
      const r = C.tap(s, sol[i]);
      if (!r.ok) { check(level + k + " solution step " + i + " " + r.reason, false); break; }
      s = r.state;
    }
    check(level + k + " solved by single steps", s.solved && C.valid(s) && s.path.length === sol.length);
    // Walk it with straight taps: the farthest cell of each straight run.
    s = C.newGame(level, k);
    let i = 0, taps = 0;
    while (i < sol.length - 1) {
      let j = i + 1;
      const same = (a, b) => (a % n === b % n) || (Math.floor(a / n) === Math.floor(b / n));
      while (j + 1 < sol.length && same(sol[i], sol[j + 1]) && (sol[j + 1] % n === sol[i] % n ? sol[j] % n === sol[i] % n : Math.floor(sol[j] / n) === Math.floor(sol[i] / n))) j++;
      const r = C.tap(s, sol[j]);
      if (!r.ok) { check(level + k + " straight tap " + r.reason, false); break; }
      s = r.state;
      taps++;
      i = j;
    }
    check(level + k + " solved by straight taps (" + taps + " taps)", s.solved && s.path.join() === sol.join() && taps < sol.length - 1 + 1);
  }
}

// Single rules on easy maze 0.
const m = C.maze("easy", 0), n = m.n;
let s = C.newGame("easy", 0);
const nb = C.neighbours(m, 0);
// A wall: a neighbour cell of the start that is not open.
const closed = [1, n].filter((c) => nb.indexOf(c) < 0);
if (closed.length) check("tap through a wall changes nothing", C.tap(s, closed[0]).reason === "wall" && C.tap(s, closed[0]).state === s);
check("tap off the line is 'far'", C.tap(s, n + 1).reason === "far" || C.tap(s, n + 1).reason === "wall");
check("tap on yourself is 'same'", C.tap(s, 0).reason === "same");
s = C.tap(s, nb[0]).state;
const one = C.neighbours(m, nb[0]).filter((c) => c !== 0);
if (one.length) {
  s = C.tap(s, one[0]).state;
  check("three cells walked", s.path.length === 3);
  const back = C.tap(s, nb[0]);
  check("stepping back shortens the way", back.ok && back.state.path.length === 2);
  const home = C.tap(s, 0);
  check("tap on the start goes back to it", home.ok && home.reason === "back" && home.state.path.length === 1);
  check("undo takes one cell back", C.undo(s).path.length === 2 && C.undo(C.newGame("easy", 0)).path.length === 1);
}
// Drawing: up to three cells ahead, round corners.
const sol = C.solution(m);
const d3 = C.drawTo(C.newGame("easy", 0), sol[3]);
check("drawing follows three cells", d3.ok && d3.state.path.join() === sol.slice(0, 4).join());
check("drawing does not jump four cells", !C.drawTo(C.newGame("easy", 0), sol[4]).ok);
// Hint out of a dead end: walk into a wrong branch, the hint leads back.
const big = C.maze("hard", 2), bn = big.n, bsol = C.solution(big);
let wrong = null;
for (let i = 0; i < bsol.length && !wrong; i++) {
  C.neighbours(big, bsol[i]).forEach((c) => { if (!wrong && bsol.indexOf(c) < 0) wrong = { from: i, cell: c }; });
}
let hs = C.newGame("hard", 2);
for (let i = 1; i <= wrong.from; i++) hs = C.tap(hs, bsol[i]).state;
hs = C.drawTo(hs, wrong.cell).state;
const h = C.hint(hs, 3);
check("hint from a wrong branch leads back to the right way " + JSON.stringify(h), h[0] === bsol[wrong.from] && h.length === 3);
check("hint on the right way is its next cells", JSON.stringify(C.hint(C.newGame("hard", 2), 3)) === JSON.stringify(bsol.slice(1, 4)));
// Saves.
check("valid save", C.valid(hs));
check("broken saves refused", !C.valid(null) && !C.valid(Object.assign({}, hs, { path: [0, bn * bn - 1] })) && !C.valid(Object.assign({}, hs, { k: 9 })) && !C.valid(Object.assign({}, hs, { level: "x" })) && !C.valid(Object.assign({}, hs, { path: [1] })));
check("JSON round trip", C.valid(JSON.parse(JSON.stringify(hs))));
check("next maze in a circle of five", C.nextMaze(4) === 0 && C.nextMaze(0) === 1);

console.log("shortest solutions: " + JSON.stringify(solLen));
console.log("=== IRRGARTEN CORE: " + mazes + " mazes, " + cells + " cells, all perfect (one way between any two cells), reproducible, solved by steps and straight taps, walls, back, drawing, hint, saves, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
