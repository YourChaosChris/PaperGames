#!/usr/bin/env node
// Computer levels (task 181): Kleeberg, Klappenkasten, Steckwuerfeln and
// Pfotenwurf have Easy / Medium / Hard against the computer. Plays the
// computer against itself at different levels (seat 0 and seat 1 swap) and
// checks that every game ends and that a higher level wins clearly more
// often than a lower one. An old save without a level plays as Hard.
const path = require("path");
const load = (n) => require(path.join(__dirname, "..", n + "-core.js"));
const GAMES = parseInt(process.env.GAMES || "400", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); console.log((ok ? "ok   " : "FAIL ") + name); };

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// One game; returns the score of "high" (1 win, 0.5 draw, 0 loss).
function match(core, make, high, low, g) {
  const rng = seeded(1000 + g);
  const highSeat = g % 2;
  const lv = (seat) => (seat === highSeat ? high : low);
  let s = make(g);
  let guard = 0;
  while (s.phase !== "over" && guard++ < 5000) {
    const n = s.current;
    const next = core.aiStep(s, rng, lv(n));
    if (next === s) throw new Error("computer stuck");
    s = next;
  }
  if (s.phase !== "over") throw new Error("game does not end");
  const o = core.outcomeFor(s, highSeat);
  return o === "win" ? 1 : o === "draw" ? 0.5 : 0;
}

const games = {
  kleeberg: (g) => ({ core: load("kleeberg"), make: (i) => load("kleeberg").newGame({ computer: [true, true], first: i % 2 }) }),
  klappenkasten: () => ({ core: load("klappenkasten"), make: (i) => load("klappenkasten").newGame({ players: 2, computer: [true, true], rounds: 3 }) }),
  steckwuerfeln: () => ({ core: load("steckwuerfeln"), make: (i) => load("steckwuerfeln").newGame({ players: 2, computer: [true, true], rounds: 3 }) }),
  pfotenwurf: () => ({ core: load("pfotenwurf"), make: (i) => load("pfotenwurf").newGame({ players: 2, computer: [true, true] }) })
};

for (const name of Object.keys(games)) {
  const { core, make } = games[name](0);
  const rate = (high, low) => {
    let sum = 0;
    for (let g = 0; g < GAMES; g++) sum += match(core, make, high, low, g);
    return sum / GAMES;
  };
  const r31 = rate(3, 1), r21 = rate(2, 1), r32 = rate(3, 2);
  console.log(name + ": hard vs easy " + r31.toFixed(2) + ", medium vs easy " + r21.toFixed(2) + ", hard vs medium " + r32.toFixed(2));
  check(name + ": hard clearly beats easy", r31 >= 0.6);
  check(name + ": medium beats easy", r21 >= 0.52);
  check(name + ": hard beats medium", r32 >= 0.52);
  const old = make(0);
  delete old.level;
  check(name + ": old save without level counts as hard", core.aiStep(old, seeded(1)) !== old);
  check(name + ": new game keeps the chosen level", make(0).level === 3 && (function () {
    const mk = { kleeberg: () => core.newGame({ computer: [true, true], level: 1 }), klappenkasten: () => core.newGame({ players: 2, level: 1 }), steckwuerfeln: () => core.newGame({ players: 2, level: 1 }), pfotenwurf: () => core.newGame({ players: 2, level: 1 }) };
    return mk[name]().level === 1 && core.newGame({ level: 7 }).level === 3;
  })());
}
if (fails.length) { console.log("FAIL computer-levels: " + fails.length + " problem(s)"); process.exit(1); }
console.log("OK computer-levels: 4 games, every level plays to the end, higher levels win more often");
