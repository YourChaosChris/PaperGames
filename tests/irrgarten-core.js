#!/usr/bin/env node
// Irrgarten core (tasks 170 and 174). For every level, both modes ("one",
// "multi") and every one of the five mazes:
// - the grid has the level's size, walls match on both sides, the maze is
//   "perfect" (n * n - 1 open passages and every cell reachable), and a
//   count of all ways without a repeated cell finds exactly ONE way from
//   each start to its goal (proof of the unique solution);
// - task 174: 2 or 3 ways leave each start (easy: 2), exactly one of them
//   reaches the goal, every other one is a dead end of at least MIN_BRANCH
//   cells without the goal; the goal is at least MIN_WAY (multi: MULTI_WAY)
//   steps away; starts and goals of a maze are all different cells;
// - the maze is the same when made again from its seed, the five mazes of a
//   level differ;
// - over the five mazes of a level the goal is not always at the bottom
//   right and changes place; starts lie on the edge and in the middle;
// - higher levels have more branches (share of cells with 3 or 4 ways).
// Play: walking a solution with single taps and with straight taps solves
// it; a tap through a wall or off the line changes nothing; stepping back
// shortens the way; a tap on an older cell of the way goes back to it; the
// drawing finger follows up to three cells; the hint leads out of a dead end;
// undo; multi: a tap on another figure selects it, an arrived figure hands
// over to the next, the maze is solved only when all have arrived;
// valid() refuses broken and old (rules 1) saves.
const C = require("../irrgarten-core.js");
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

// All ways from a to b without a repeated cell (stops counting at 2).
function countWays(m, a, b) {
  let count = 0;
  const seen = new Set([a]);
  (function walk(c) {
    if (count > 1) return;
    if (c === b) { count++; return; }
    C.neighbours(m, c).forEach((d) => { if (!seen.has(d)) { seen.add(d); walk(d); seen.delete(d); } });
  })(a);
  return count;
}

// Cells of the branch leaving start through neighbour b.
function branchCells(m, start, b) {
  const seen = new Set([start, b]), q = [b];
  while (q.length) C.neighbours(m, q.shift()).forEach((c) => { if (!seen.has(c)) { seen.add(c); q.push(c); } });
  seen.delete(start);
  return seen;
}

function solveByTaps(level, k, mode, straight) {
  let s = C.newGame(level, k, mode);
  const m = C.mazeOf(s), n = m.n;
  let taps = 0;
  for (let f = 0; f < m.starts.length; f++) {
    if (s.sel !== f) {
      const r = C.tap(s, C.last(s, f));
      if (!r.ok || r.reason !== "select") return { s, error: "select " + f + " " + r.reason };
      s = r.state;
    }
    const sol = C.solution(m, f);
    let i = 0;
    while (i < sol.length - 1) {
      let j = i + 1;
      if (straight) {
        const row = (c) => Math.floor(c / n), col = (c) => c % n;
        const dirRow = row(sol[i + 1]) === row(sol[i]);
        while (j + 1 < sol.length && (dirRow ? row(sol[j + 1]) === row(sol[i]) : col(sol[j + 1]) === col(sol[i]))) j++;
      }
      // Another figure standing on the target cell would be selected: go one by one there.
      if (C.figureAt(s, sol[j]) >= 0) j = i + 1;
      if (C.figureAt(s, sol[j]) >= 0) return { s, error: "figure in the way" };
      const r = C.tap(s, sol[j]);
      if (!r.ok) return { s, error: "tap " + r.reason };
      s = r.state;
      taps++;
      i = j;
    }
    if (!C.arrived(s, f)) return { s, error: "figure " + f + " not arrived" };
  }
  return { s, taps };
}

let mazes = 0, cells = 0;
const solLen = {}, junctions = {};
for (const level of C.LEVELS) {
  for (const mode of C.MODES) {
    const seen = new Set(), goals = [], starts = [];
    let jun = 0, all = 0;
    for (let k = 0; k < C.COUNT; k++) {
      const m = C.maze(level, k, mode);
      const n = C.SIZE[level];
      const id = level + "/" + mode + k;
      mazes++;
      cells += n * n;
      const figs = mode === "multi" ? C.FIGURES[level] : 1;
      check(id + " size and figures", m.n === n && m.open.length === n * n && m.starts.length === figs && m.goals.length === figs);
      check(id + " 2 or 3 figures in multi", mode === "one" || (figs >= 2 && figs <= 3));
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
        if (C.bits(m.open[c]) >= 3) jun++;
        all++;
      }
      check(id + " walls match on both sides", sym && border);
      check(id + " perfect: " + edges / 2 + " passages", edges / 2 === n * n - 1);
      const reach = new Set([0]), q = [0];
      while (q.length) C.neighbours(m, q.shift()).forEach((c) => { if (!reach.has(c)) { reach.add(c); q.push(c); } });
      check(id + " every cell reachable", reach.size === n * n);
      check(id + " starts and goals all different", new Set(m.starts.concat(m.goals)).size === 2 * figs);
      for (let f = 0; f < figs; f++) {
        const way = C.solution(m, f);
        check(id + " no other figure stands on the way of figure " + f, m.starts.concat(m.goals).every((c, i) => i % figs === f || way.indexOf(c) < 0));
      }
      for (let f = 0; f < figs; f++) {
        const start = m.starts[f], goal = m.goals[f];
        check(id + " fig " + f + ": exactly one way start -> goal", countWays(m, start, goal) === 1);
        const sol = C.solution(m, f);
        check(id + " fig " + f + " solution joins start and goal", sol && sol[0] === start && sol[sol.length - 1] === goal);
        const minWay = mode === "multi" ? C.MULTI_WAY[level] : C.MIN_WAY[level];
        check(id + " fig " + f + " way long enough (" + (sol.length - 1) + " >= " + minWay + ")", sol.length - 1 >= minWay);
        const ways = C.neighbours(m, start);
        const wanted = level === "easy" ? [2] : [2, 3];
        check(id + " fig " + f + " " + ways.length + " ways off the start", wanted.indexOf(ways.length) >= 0);
        const branches = ways.map((b) => branchCells(m, start, b));
        check(id + " fig " + f + " exactly one way reaches the goal", branches.filter((b) => b.has(goal)).length === 1 && C.startWays(m, f).right === 1);
        if (mode === "one") check(id + " wrong ways are dead ends of >= " + C.MIN_BRANCH[level] + " cells", branches.every((b) => b.has(goal) || b.size >= C.MIN_BRANCH[level]));
        solLen[level + "/" + mode] = Math.min(solLen[level + "/" + mode] || Infinity, sol.length - 1);
        goals.push(goal);
        starts.push(start);
      }
      delete require.cache[require.resolve("../irrgarten-core.js")];
      const fresh = require("../irrgarten-core.js");
      const again = fresh.maze(level, k, mode);
      check(id + " the same maze when made again", again.open.join(",") === m.open.join(",") && again.starts.join() === m.starts.join() && again.goals.join() === m.goals.join());
      const key = m.open.join(",");
      check(id + " differs from the other mazes of its level", !seen.has(key));
      seen.add(key);

      const steps = solveByTaps(level, k, mode, false);
      check(id + " solved by single steps " + (steps.error || ""), !steps.error && steps.s.solved && C.valid(steps.s));
      const straight = solveByTaps(level, k, mode, true);
      check(id + " solved by straight taps " + (straight.error || ""), !straight.error && straight.s.solved);
    }
    const n = C.SIZE[level], corner = n * n - 1;
    const edge = (c) => c % n === 0 || c % n === n - 1 || c < n || c >= n * n - n;
    check(level + "/" + mode + " goal not always bottom right", goals.some((g) => g !== corner) && new Set(goals).size >= 3);
    check(level + "/" + mode + " start not always top left", starts.some((s) => s !== 0) && new Set(starts).size >= 3);
    junctions[level + "/" + mode] = Math.round((jun / all) * 1000) / 10;
  }
}
// Starts both on the edge and in the middle over all mazes.
{
  const all = [];
  C.LEVELS.forEach((lv) => C.MODES.forEach((md) => { for (let k = 0; k < C.COUNT; k++) { const m = C.maze(lv, k, md); m.starts.forEach((s) => all.push([s, m.n])); } }));
  const onEdge = all.filter(([c, n]) => c % n === 0 || c % n === n - 1 || c < n || c >= n * n - n).length;
  check("starts on the edge and in the middle (" + onEdge + " of " + all.length + " on the edge)", onEdge > 0 && onEdge < all.length);
}
// More branches on higher levels.
check("more branches on higher levels " + JSON.stringify(junctions), junctions["easy/one"] < junctions["medium/one"] && junctions["medium/one"] < junctions["hard/one"] && junctions["hard/one"] < junctions["expert/one"]);

// Single rules on easy maze 0.
const m = C.maze("easy", 0), n = m.n, st = m.start;
let s = C.newGame("easy", 0);
const nb = C.neighbours(m, st);
const around = [st - n, st + 1, st + n, st - 1].filter((c) => c >= 0 && c < n * n && (Math.abs((c % n) - (st % n)) <= 1));
const closed = around.filter((c) => nb.indexOf(c) < 0);
if (closed.length) check("tap through a wall changes nothing", C.tap(s, closed[0]).reason === "wall" && C.tap(s, closed[0]).state === s);
const diag = [st + n + 1, st - n - 1, st + n - 1, st - n + 1].filter((c) => c >= 0 && c < n * n && Math.abs((c % n) - (st % n)) === 1);
check("tap off the line is 'far'", C.tap(s, diag[0]).reason === "far");
check("tap on yourself is 'same'", C.tap(s, st).reason === "same");
s = C.tap(s, nb[0]).state;
const one = C.neighbours(m, nb[0]).filter((c) => c !== st);
if (one.length) {
  s = C.tap(s, one[0]).state;
  check("three cells walked", C.path(s).length === 3);
  const back = C.tap(s, nb[0]);
  check("stepping back shortens the way", back.ok && C.path(back.state).length === 2);
  const home = C.tap(s, st);
  check("tap on the start goes back to it", home.ok && home.reason === "back" && C.path(home.state).length === 1);
  check("undo takes one cell back", C.path(C.undo(s)).length === 2 && C.path(C.undo(C.newGame("easy", 0))).length === 1);
}
// Drawing: up to three cells ahead, round corners.
const sol = C.solution(m);
const d3 = C.drawTo(C.newGame("easy", 0), sol[3]);
check("drawing follows three cells", d3.ok && C.path(d3.state).join() === sol.slice(0, 4).join());
check("drawing does not jump four cells", !C.drawTo(C.newGame("easy", 0), sol[4]).ok);
// Hint out of a dead end: walk into a wrong branch, the hint leads back.
const big = C.maze("hard", 2), bsol = C.solution(big);
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

// Multi: selection, hand-over, solved only with all figures home.
{
  let ms = C.newGame("hard", 0, "multi");
  const mm = C.mazeOf(ms);
  check("multi starts with the first figure selected", ms.sel === 0 && ms.paths.length === 3);
  const sel = C.tap(ms, mm.starts[2]);
  check("tap on another figure selects it", sel.ok && sel.reason === "select" && sel.state.sel === 2 && sel.state.paths === ms.paths);
  const s0 = C.solution(mm, 0);
  for (let i = 1; i < s0.length; i++) { const r = C.tap(ms, s0[i]); if (r.reason === "select") { ms = C.select(r.state, 0); i--; continue; } ms = r.state; }
  check("first figure home, selection moves on, not yet solved", C.arrived(ms, 0) && ms.sel === 1 && !ms.solved);
  ms = C.select(ms, 0);
  const off = C.neighbours(mm, mm.goals[0]).filter((c) => s0.indexOf(c) < 0);
  if (off.length) check("an arrived figure does not walk on", C.tap(ms, off[0]).reason === "home");
  const done = solveByTaps("hard", 0, "multi", true);
  check("multi solved when all have arrived", done.s.solved && done.s.paths.every((_, f) => C.arrived(done.s, f)));
  check("hint follows the selected figure", JSON.stringify(C.hint(C.select(C.newGame("hard", 0, "multi"), 1), 2)) === JSON.stringify(C.solution(mm, 1).slice(1, 3)));
}

// Saves.
check("valid save", C.valid(hs));
check("broken saves refused", !C.valid(null) && !C.valid(Object.assign({}, hs, { paths: [[big.start, big.goal]] })) && !C.valid(Object.assign({}, hs, { k: 9 })) && !C.valid(Object.assign({}, hs, { level: "x" })) && !C.valid(Object.assign({}, hs, { paths: [[big.start === 1 ? 2 : 1]] })) && !C.valid(Object.assign({}, hs, { sel: 3 })) && !C.valid(Object.assign({}, hs, { mode: "x" })));
check("old saves (rules 1) refused", !C.valid({ game: "irrgarten", rules: 1, level: "easy", k: 0, path: [0], steps: 0, solved: false }));
check("JSON round trip", C.valid(JSON.parse(JSON.stringify(hs))) && C.valid(JSON.parse(JSON.stringify(C.newGame("medium", 3, "multi")))));
check("next maze in a circle of five", C.nextMaze(4) === 0 && C.nextMaze(0) === 1);

console.log("shortest solutions: " + JSON.stringify(solLen));
console.log("cells with 3 or 4 ways (%): " + JSON.stringify(junctions));
console.log("=== IRRGARTEN CORE: " + mazes + " mazes, " + cells + " cells, all perfect, exactly one way per figure, 2-3 ways off every start, free goals, multi mode, reproducible, solved by steps and straight taps, walls, back, drawing, hint, saves, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
