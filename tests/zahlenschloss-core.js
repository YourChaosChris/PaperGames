#!/usr/bin/env node
// Lock Logic (zahlenschloss-core.js): the example of the source has the
// single solution 043; on every level 100 puzzles (numbers 1-100) have
// exactly one solution, no clue too many, different digits; easy has a clue
// "no digit is right", medium none, hard has four digits; the same number
// gives the same puzzle; the hint chain leads to the code and every fact is
// true for it. Prints the spread of clue counts and the slowest puzzle.
// No server or browser needed.
const path = require("path");
const Core = require(path.join(__dirname, "..", "zahlenschloss-core.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }

// Example of the source: 983 (1 right place), 914 (1 wrong place),
// 309 (2 wrong place), 728 (none), 780 (1 wrong place) -> 043.
const example = [
  { guess: "983", right: 1, wrong: 0 },
  { guess: "914", right: 0, wrong: 1 },
  { guess: "309", right: 0, wrong: 2 },
  { guess: "728", right: 0, wrong: 0 },
  { guess: "780", right: 0, wrong: 1 }
];
check(Core.solutions(example, 3).join() === "043", "example: only 043 (different digits) " + Core.solutions(example, 3).join());
check(Core.solutions(example, 3, true).join() === "043", "example: only 043 (digits may repeat) " + Core.solutions(example, 3, true).join());
example.forEach((c) => { const f = Core.feedback("043", c.guess); check(f.right === c.right && f.wrong === c.wrong, "feedback 043 / " + c.guess); });

function holds(code, f) {
  const ch = String(f.digit);
  if (f.kind === "absent") return code.indexOf(ch) === -1;
  if (f.kind === "present") return code.indexOf(ch) !== -1;
  if (f.kind === "place") return code[f.place] === ch;
  if (f.kind === "notplace") return code[f.place] !== ch;
  return false;
}

let slowest = 0, slowestAt = "";
let hintMax = 0;
const N = 100;
[1, 2, 3].forEach((lv) => {
  const cfg = Core.LEVELS[lv];
  const spread = {};
  for (let n = 1; n <= N; n++) {
    const t0 = Date.now();
    const p = Core.generate(lv, n);
    const ms = Date.now() - t0;
    if (ms > slowest) { slowest = ms; slowestAt = lv + ":" + n; }
    if (!p) { check(false, "no puzzle " + lv + ":" + n); continue; }
    const tag = lv + ":" + n;
    spread[p.clues.length] = (spread[p.clues.length] || 0) + 1;
    check(p.digits === cfg.digits && p.code.length === cfg.digits, "digits " + tag);
    check(new Set(p.code).size === p.code.length, "code digits differ " + tag);
    p.clues.forEach((c) => check(c.guess.length === cfg.digits && new Set(c.guess).size === c.guess.length, "clue digits differ " + tag + " " + c.guess));
    const sol = Core.solutions(p.clues, p.digits);
    check(sol.length === 1 && sol[0] === p.code, "one solution " + tag + " " + sol.join());
    check(Core.minimal(p.clues, p.digits), "no clue too many " + tag);
    const none = p.clues.some((c) => c.right + c.wrong === 0);
    if (lv === 1) check(none, "easy has a clue with no right digit " + tag);
    if (lv === 2) check(!none, "medium has no clue without right digits " + tag);
    check(p.clues.length >= cfg.minClues && p.clues.length <= cfg.maxClues, "clue count " + tag);
    if (n <= 20) check(JSON.stringify(Core.generate(lv, n)) === JSON.stringify(p), "same number, same puzzle " + tag);
    // Hint chain: apply facts until one code is left.
    const known = [];
    let left = Core.codes(p.digits);
    let steps = 0;
    while (left.length > 1 && steps < 40) {
      const h = Core.hint(p, known);
      if (!h) break;
      h.facts.forEach((f) => { check(holds(p.code, f), "fact true " + tag + " " + JSON.stringify(f)); known.push(f); });
      steps++;
      // The facts alone (without the clues) narrow the codes down.
      left = Core.codes(p.digits).filter((c) => known.every((f) => holds(c, f)));
    }
    check(left.length === 1 && left[0] === p.code, "hint chain leads to the code " + tag + " (" + left.length + " left after " + steps + " hints)");
    if (steps > hintMax) hintMax = steps;
    const st = Core.createInitialState(lv, n);
    check(st.code === p.code && st.struck.length === p.clues.length && st.entry === "" && st.mistakes === 0 && st.hints.length === 0, "initial state " + tag);
  }
  console.log("level " + lv + ": clue counts " + Object.keys(spread).sort().map((k) => k + " clues x" + spread[k]).join(", "));
});
check(JSON.stringify(Core.generate(1, 1)) !== JSON.stringify(Core.generate(1, 2)), "different numbers, different puzzles");
console.log("slowest puzzle " + slowest + " ms (" + slowestAt + "), most hints to the code " + hintMax);
check(slowest < 1000, "a puzzle is made in under 1 s (" + slowest + " ms)");

if (failures.length) {
  console.log(failures.slice(0, 20).join("\n"));
  console.log(`=== ZAHLENSCHLOSS CORE: ${failures.length} failure(s) of ${checks} checks ===`);
  process.exit(1);
}
console.log(`=== ZAHLENSCHLOSS CORE: example 043, ${N * 3} puzzles on three levels with one solution and no clue too many, hint chains to the code, 0 failures of ${checks} checks ===`);
