#!/usr/bin/env node
// Mouse Ring (maeusekreis-core.js / maeusekreis-ai.js): neighbours (the mouse
// only along the circle, the cat also over the lines across), the cat catches
// the mouse by stepping onto it, the mouse may not step onto the cat, the game
// ends after `limit` cat steps, and the backward search: the starts and step
// counts of every level, best play on both sides wins for the cat with `limit`
// and for the mouse with `limit - 1` (every start, level 3 against level 3),
// and weaker play makes mistakes (100 games each). No server or browser needed.
const path = require("path");
const Core = require(path.join(__dirname, "..", "maeusekreis-core.js"));
global.MaeusekreisCore = Core;
const Ai = require(path.join(__dirname, "..", "maeusekreis-ai.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }
const sorted = (a) => a.slice().sort((x, y) => x - y).join();

// A small seeded random source, so the measurements repeat.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Boards: 8, 10, 12 points.
check(Core.BOARDS[1].points === 8 && Core.BOARDS[2].points === 10 && Core.BOARDS[3].points === 12, "board sizes 8/10/12");

// Neighbours: the mouse only along the circle, the cat also over the lines across.
check(sorted(Core.neighbours(1, "mouse", 0)) === "1,7", "level 1 mouse at 0: 1 and 7");
check(sorted(Core.neighbours(1, "cat", 0)) === "1,2,7", "level 1 cat at 0: 1, 7 and across to 2");
check(sorted(Core.neighbours(1, "cat", 2)) === "0,1,3", "level 1 cat at 2: back across to 0");
check(sorted(Core.neighbours(3, "cat", 6)) === "5,7,9", "level 3 cat at 6: 5, 7 and across to 9");
check(sorted(Core.neighbours(3, "mouse", 6)) === "5,7", "level 3 mouse at 6: only 5 and 7");
[1, 2, 3].forEach((lv) => {
  const b = Core.BOARDS[lv];
  for (let p = 0; p < b.points; p++) {
    const m = Core.neighbours(lv, "mouse", p);
    check(m.length === 2 && m.every((q) => Core.distance(b.points, p, q) === 1), "mouse neighbours on the circle, level " + lv + " point " + p);
    const across = b.chords.filter((c) => c[0] === p || c[1] === p).length;
    check(Core.neighbours(lv, "cat", p).length === 2 + across, "cat neighbours, level " + lv + " point " + p);
  }
});

// A fixed position on level 1: mouse at 3, cat at 0, mouse to move.
const base = () => ({ level: 1, cat: 0, mouse: 3, start: { cat: 0, mouse: 3 }, limit: 6, catSteps: 0, turn: "mouse", last: null, result: null });
let s = base();
check(sorted(Core.getLegalMoves(s)) === "2,4", "mouse moves 2 and 4");
check(!Core.isLegalMove(s, 3) && !Core.isLegalMove(s, 5), "no standing still, no jumping");
// Mouse may not step onto the cat.
s = base(); s.cat = 2;
check(sorted(Core.getLegalMoves(s)) === "4", "the mouse may not step onto the cat");
// The cat catches the mouse by stepping onto its point (over the line across).
s = base(); s.mouse = 2; s.turn = "cat";
check(sorted(Core.getLegalMoves(s)) === "1,2,7", "cat moves include the line across");
let n = Core.applyMove(s, 2);
check(n.result && n.result.winner === "cat" && n.catSteps === 1 && n.last.who === "cat" && n.last.from === 0 && n.last.to === 2, "the cat catches the mouse");
check(Core.getLegalMoves(n).length === 0, "no moves after the end");
// A mouse step: turn changes to the cat, no step counted.
n = Core.applyMove(base(), 4);
check(n.mouse === 4 && n.turn === "cat" && n.catSteps === 0 && !n.result && n.last.who === "mouse", "mouse step");
// The end after `limit` cat steps: the mouse gets away.
s = base(); s.turn = "cat"; s.catSteps = 5; s.mouse = 5;
n = Core.applyMove(s, 1);
check(n.result && n.result.winner === "mouse" && Core.left(n) === 0, "the cat's last step misses: the mouse gets away");
s = base(); s.turn = "cat"; s.catSteps = 5; s.mouse = 1;
n = Core.applyMove(s, 1);
check(n.result && n.result.winner === "cat", "a catch on the last step counts for the cat");
// The state does not change in place.
s = base(); Core.applyMove(s, 4);
check(s.mouse === 3 && s.turn === "mouse", "applyMove leaves the state alone");

// Start states.
[1, 2, 3].forEach((lv) => {
  const a = Core.createInitialState(lv, rng(lv));
  const b = Core.createInitialState(lv, rng(lv), true);
  check(a.turn === "mouse" && a.catSteps === 0 && !a.result && a.limit === Core.steps(lv, a.cat, a.mouse, "mouse"), "start level " + lv + ": cat has just enough steps");
  check(b.limit === Core.steps(lv, b.cat, b.mouse, "mouse") - 1, "start level " + lv + ": person as mouse, one step less");
});
check(Core.createInitialState(9, rng(1)).level === 2, "unknown level falls back to 2");

// Plays a game; `cat` and `mouse` are AI levels.
function play(state, catLevel, mouseLevel, r) {
  let st = state;
  let guard = 0;
  while (!st.result && guard++ < 200) {
    const m = Ai.chooseMove(st, st.turn === "cat" ? catLevel : mouseLevel, r);
    if (!Core.isLegalMove(st, m)) { failures.push("illegal computer move " + m + " in " + JSON.stringify(st)); return null; }
    st = Core.applyMove(st, m);
  }
  return st.result ? st.result.winner : null;
}
function fromStart(lv, p, mouseSide) {
  return { level: lv, cat: p.cat, mouse: p.mouse, start: { cat: p.cat, mouse: p.mouse }, limit: mouseSide ? p.steps - 1 : p.steps, catSteps: 0, turn: "mouse", last: null, result: null };
}

// Backward search: starts and step counts; best play on both sides.
[1, 2, 3].forEach((lv) => {
  const b = Core.BOARDS[lv];
  const list = Core.starts(lv);
  const counts = {};
  list.forEach((p) => { counts[p.steps] = (counts[p.steps] || 0) + 1; });
  console.log("Level " + lv + " (" + b.points + " points): " + list.length + " starts, cat steps " +
    Object.keys(counts).map((k) => k + ": " + counts[k]).join(", "));
  check(list.length > 0, "level " + lv + " has starts");
  check(list.every((p) => p.steps >= b.minSteps && p.steps <= b.maxSteps && Core.distance(b.points, p.cat, p.mouse) >= 3), "level " + lv + " starts in range");
  let catWins = 0;
  let mouseWins = 0;
  list.forEach((p) => {
    if (play(fromStart(lv, p, false), 3, 3) === "cat") catWins++;
    if (play(fromStart(lv, p, true), 3, 3) === "mouse") mouseWins++;
    // `winning` agrees with the search: with `limit` the mouse (to move) is lost.
    check(Core.winning(fromStart(lv, p, false)) === false && Core.winning(fromStart(lv, p, true)) === true, "winning() at start " + JSON.stringify(p));
  });
  console.log("  best play: cat wins with limit " + catWins + "/" + list.length + ", mouse wins with limit-1 " + mouseWins + "/" + list.length);
  check(catWins === list.length, "level " + lv + ": with limit the best cat always catches the mouse");
  check(mouseWins === list.length, "level " + lv + ": with limit-1 the best mouse always gets away");
});

// Mistakes: weaker sides lose sometimes (100 games each, level 3 board).
[1, 2, 3].forEach((lv) => {
  const list = Core.starts(lv);
  const r = rng(100 + lv);
  let mouseWins = 0;
  let catWins = 0;
  for (let i = 0; i < 100; i++) {
    const p = list[Math.floor(r() * list.length)];
    if (play(fromStart(lv, p, false), 2, 3, r) === "mouse") mouseWins++;
    if (play(fromStart(lv, p, true), 3, 2, r) === "cat") catWins++;
  }
  console.log("Level " + lv + ": cat level 2 vs mouse level 3 with limit: mouse gets away " + mouseWins + "%; mouse level 2 vs cat level 3 with limit-1: cat catches " + catWins + "%");
  check(mouseWins > 0, "level " + lv + ": the medium cat makes mistakes");
  check(catWins > 0, "level " + lv + ": the medium mouse makes mistakes");
});

// Every level always answers with a legal move and every game ends.
let ended = 0;
[1, 2, 3].forEach((lv) => {
  const r = rng(7 * lv);
  for (let i = 0; i < 30; i++) {
    const cl = 1 + (i % 3);
    const ml = 1 + Math.floor(i / 10);
    if (play(Core.createInitialState(lv, r, i % 2 === 0), cl, ml, r)) ended++;
  }
});
check(ended === 90, "all 90 random games end, " + ended);

if (failures.length) failures.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(`=== MAEUSEKREIS CORE: neighbours, catching, mouse not onto the cat, end after limit, backward search, best play with limit and limit-1, mistakes, ${checks} checks, ${failures.length} failures ===`);
process.exit(failures.length ? 1 : 0);
