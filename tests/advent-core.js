#!/usr/bin/env node
// Puzzle Advent calendar (advent-core.js, task 122):
//   - every one of the 24 puzzles has exactly one solution, counted again
//     here with the games' own solvers (Lights Out: exactly one set of
//     presses on 3 x 3), and the stored solution is that solution;
//   - the same door always gives the same puzzle (a second load of the
//     module in a fresh context gives identical data);
//   - the kinds take turns and the doors get harder (size / givens);
//   - unlocking by date: before 1 December, 5 December with and without
//     door 4 solved, after 24 December, "open all doors";
//   - normalizeSave with old, broken and foreign data.
const path = require("path");
const vm = require("vm");
const fs = require("fs");
const ROOT = path.join(__dirname, "..");
const A = require(path.join(ROOT, "advent-core.js"));
const LS = require(path.join(ROOT, "lightswitch-core.js"));
const AS = require(path.join(ROOT, "animalsudoku-core.js"));
const FU = require(path.join(ROOT, "futoshiki-core.js"));
const SC = require(path.join(ROOT, "skyscrapers-puzzles.js"));
const CA = require(path.join(ROOT, "calcudoku-core.js"));
const NG = require(path.join(ROOT, "nonogram-core.js"));
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// 1. Uniqueness of all 24.
const kinds = {};
const lines = [];
for (let n = 1; n <= A.COUNT; n++) {
  const p = A.puzzle(n);
  check("door " + n + " has a puzzle", !!p);
  if (!p) continue;
  kinds[p.kind] = (kinds[p.kind] || 0) + 1;
  let count = -1, extra = "";
  if (p.kind === "lights") {
    const sols = LS.allSolutions(p.start);
    count = sols.length;
    // Pressing the one solution switches every light off.
    let w = A.emptyWork(p);
    (sols[0] || []).forEach(([r, c]) => { w = A.pressLight(p, w, r * p.size + c); });
    check("door " + n + ": the presses solve it", A.isSolved(p, w) && !A.isSolved(p, A.emptyWork(p)));
    extra = (sols[0] || []).length + " presses";
  } else if (p.kind === "sudoku") {
    count = AS.countSolutions(p.size, p.givens, 2);
    extra = p.givens.filter(Boolean).length + " givens";
  } else if (p.kind === "futoshiki") {
    count = FU.countSolutions(p.size, p.givens, p.ineq, 2, 2000000);
    extra = p.ineq.length + " signs, " + p.givens.filter(Boolean).length + " givens";
    check("door " + n + ": at least " + p.size + " signs", p.ineq.length >= p.size);
  } else if (p.kind === "skyscrapers") {
    count = SC.countSolutionsFromClues(p.size, p.clues, 2);
    const sol = SC.solve(p.size, p.clues);
    check("door " + n + ": solver finds the stored solution", sol && [].concat.apply([], sol).join() === p.solution.join());
    extra = ["top", "bottom", "left", "right"].reduce((s, k) => s + p.clues[k].filter((v) => v != null).length, 0) + " clues";
  } else if (p.kind === "calcudoku") {
    count = CA.countSolutions(p.size, p.cages, 2);
    const res = CA.solveCages(p.size, p.cages, 1);
    check("door " + n + ": solver finds the stored solution", res.solutions[0] && res.solutions[0].join() === p.solution.join());
    extra = p.cages.length + " cages";
  } else if (p.kind === "nonogram") {
    count = NG.countSolutions(p.clues.rows, p.clues.cols, 2);
    extra = [].concat.apply([], p.solution).filter(Boolean).length + " filled";
  }
  check("door " + n + " (" + p.kind + ") has exactly one solution, found " + count, count === 1);
  if (p.kind !== "lights") {
    const sol = p.kind === "nonogram" ? [].concat.apply([], p.solution).map((v) => (v ? 1 : 0)) : p.solution.slice();
    check("door " + n + ": the solution counts as solved", A.isSolved(p, sol));
    check("door " + n + ": the empty grid does not", !A.isSolved(p, A.emptyWork(p)));
    if (p.givens) check("door " + n + ": givens agree with the solution", p.givens.every((v, i) => !v || v === p.solution[i]));
  }
  lines.push(n + " " + p.kind + " " + p.size + "x" + p.size + " (" + extra + ")");
}
check("all six kinds used", A.KINDS.every((k) => kinds[k] >= 2));
for (let n = 2; n <= A.COUNT; n++) check("doors " + (n - 1) + " and " + n + " are different kinds", A.DOORS[n].kind !== A.DOORS[n - 1].kind);
const sizeOf = (n) => A.puzzle(n).size;
check("the first week is small (3 or 4)", [1, 2, 3, 4, 5, 6, 7].every((n) => sizeOf(n) <= 5 && (A.DOORS[n].kind === "nonogram" || sizeOf(n) <= 4)));
check("the last week is bigger (5 or 6)", [18, 19, 20, 21, 22, 23, 24].every((n) => sizeOf(n) >= 5));

// 2. Fixed seeds: a fresh copy of the module gives the same puzzles.
{
  const ctx = { console, globalThis: null };
  ctx.globalThis = ctx;
  ["lightswitch-core.js", "animalsudoku-core.js", "futoshiki-core.js", "skyscrapers-core.js", "skyscrapers-puzzles.js", "calcudoku-core.js", "nonogram-core.js", "advent-core.js"].forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^const (\w+) = /m, "globalThis.$1 = ");
    vm.runInNewContext(src, ctx, { filename: f });
  });
  for (let n = 1; n <= A.COUNT; n++) {
    check("door " + n + " is the same in a fresh copy", JSON.stringify(ctx.AdventCore.puzzle(n)) === JSON.stringify(A.puzzle(n)));
  }
}

// 3. Unlocking by date.
const at = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);
const open = (st) => st.map((s, i) => (s === "open" ? i : 0)).filter(Boolean).join(",");
{
  const s = A.doorStates(at(2026, 11, 30), [], false);
  check("30 Nov: season before, all closed", A.season(at(2026, 11, 30)) === "before" && s.slice(1).every((x) => x === "closed"));
  check("30 Nov: door 1 closed for the season", A.closedReason(at(2026, 11, 30), [], 1) === "season");
  check("1 Jan is before too", A.season(at(2027, 1, 1)) === "before");
  const d1 = A.doorStates(at(2026, 12, 1), [], false);
  check("1 Dec: only door 1 open " + open(d1), open(d1) === "1");
  const without = A.doorStates(at(2026, 12, 5), [1, 2, 3], false);
  check("5 Dec, door 4 not solved: door 4 open, 5 closed " + open(without), open(without) === "4" && without[5] === "closed");
  check("5 Dec: door 5 waits for door 4", A.closedReason(at(2026, 12, 5), [1, 2, 3], 5) === "previous");
  check("5 Dec: door 6 waits for its day", A.closedReason(at(2026, 12, 5), [1, 2, 3], 6) === "day");
  const withD4 = A.doorStates(at(2026, 12, 5), [1, 2, 3, 4], false);
  check("5 Dec, door 4 solved: door 5 open " + open(withD4), open(withD4) === "5" && withD4[4] === "solved" && withD4[6] === "closed");
  check("5 Dec: next door is 5", A.nextDoor(withD4, at(2026, 12, 5)) === 5);
  const late = A.doorStates(at(2026, 12, 10), [1, 2], false);
  check("10 Dec with doors 1-2 solved: door 3 open, 4 closed (missed days follow one by one)", late[3] === "open" && late[4] === "closed");
  const after = A.doorStates(at(2026, 12, 25), [], false);
  check("25 Dec: every door open", A.season(at(2026, 12, 25)) === "after" && after.slice(1).every((x) => x === "open"));
  const all = A.doorStates(at(2026, 11, 2), [7], true);
  check("open all doors in November: all open, door 7 solved", all.slice(1).every((x, i) => (i === 6 ? x === "solved" : x === "open")));
  const allAdvent = A.doorStates(at(2026, 12, 3), [], true);
  check("open all doors in Advent: all open", allAdvent.slice(1).every((x) => x === "open"));
}

// 4. Saves.
{
  const y = 2026;
  check("null save", JSON.stringify(A.normalizeSave(null, y)) === JSON.stringify({ v: 1, year: y, solved: [], work: {} }));
  check("string save", A.normalizeSave("broken", y).solved.length === 0);
  check("last year's save is not used", A.normalizeSave({ year: 2025, solved: [1, 2] }, y).solved.length === 0);
  const s = A.normalizeSave({ year: y, solved: [3, "x", 1, 1, 99, 2.5, 2], work: { 4: [1, 2], foo: [1], 30: [1], 5: "no" } }, y);
  check("solved cleaned " + JSON.stringify(s.solved), JSON.stringify(s.solved) === "[1,2,3]");
  check("work cleaned " + JSON.stringify(Object.keys(s.work)), JSON.stringify(Object.keys(s.work)) === '["4"]');
  const p = A.puzzle(2);
  check("work of the wrong length gives the empty grid", JSON.stringify(A.fitWork(p, [1, 2])) === JSON.stringify(A.emptyWork(p)));
  const odd = A.fitWork(p, new Array(16).fill(9));
  check("numbers out of range are emptied, givens kept", odd.every((v, i) => (p.givens[i] ? v === p.givens[i] : v === 0)));
}

lines.forEach((l) => console.log("door " + l));
fails.slice(0, 30).forEach((f) => console.log("FAIL " + f));
console.log("=== ADVENT CORE: 24 puzzles each with exactly one solution, fixed seeds, unlocking by date (before 1 Dec, 5 Dec with and without door 4, after 24 Dec, open all), saves, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
