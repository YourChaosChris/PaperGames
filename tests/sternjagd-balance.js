#!/usr/bin/env node
// Sternjagd, balance for the second player (task 130): with 2 players the
// player who does not start has two turns in a row the first time.
// GAMES computer games (default 1000) with 2 players, the starter changing
// seats every game, once without and once with the balance; the starter's
// win rate is printed for both, and with the balance it must lie between
// 45 and 55 %. A few rule checks: the double turn comes exactly once and
// only for the second player, 3 and 4 players ignore the setting, and a
// state saved before task 130 (no `balance`, no `bonus`) plays as before.
const path = require("path");
const C = require(path.join(__dirname, "..", "sternjagd-core.js"));
const GAMES = parseInt(process.env.GAMES || process.argv[2] || "1000", 10);
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// Who moved in which order during the first turns of a game.
function order(s, rng, turns) {
  const seen = [];
  for (let guard = 0; s.phase !== "over" && seen.length < turns && guard < 100; guard++) {
    const before = s;
    s = C.aiStep(s, rng);
    if (s.seq !== before.seq) seen.push(s.last.player + (s.last.again ? "+" : ""));
  }
  return seen.join(" ");
}

// Rule checks.
{
  const rng = seeded(1301);
  for (const first of [0, 1]) {
    const s = C.newGame({ players: 2, computer: [true, true], first, balance: true });
    check("balance stored", s.balance === true && s.bonus === 1 - first);
    const o = order(s, rng, 5);
    const a = String(first), b = String(1 - first);
    check("order with balance, first " + first + ": " + o, o === [a, b + "+", b, a, b].join(" "));
    const plain = C.newGame({ players: 2, computer: [true, true], first });
    check("no balance by default", plain.balance === false && plain.bonus === -1);
    const p = order(plain, rng, 4);
    check("order without balance, first " + first + ": " + p, p === [a, b, a, b].join(" "));
  }
  for (const n of [3, 4]) {
    const s = C.newGame({ players: n, computer: new Array(n).fill(true), first: 1, balance: true });
    check(n + " players ignore the balance", s.balance === false && s.bonus === -1);
    const o = order(s, rng, n + 1);
    const want = [];
    for (let i = 0; i <= n; i++) want.push(String((1 + i) % n));
    check(n + " players order " + o, o === want.join(" "));
  }
  const old = C.newGame({ players: 2, computer: [true, true], first: 0, balance: true });
  delete old.balance;
  delete old.bonus;
  const o = order(old, rng, 4);
  check("old save without the fields: " + o, o === "0 1 0 1");
}

// The games.
const pct = (x) => (100 * x / GAMES).toFixed(1);
function run(balance, seed) {
  const rng = seeded(seed);
  let starter = 0, draws = 0;
  for (let g = 0; g < GAMES; g++) {
    const first = g % 2;
    let s = C.newGame({ players: 2, computer: [true, true], first, balance });
    for (let guard = 0; s.phase !== "over"; guard++) {
      const next = C.aiStep(s, rng);
      if (next === s || guard > 20000) { fails.push("game " + g + " hangs"); break; }
      s = next;
    }
    if (s.winner === -1) draws++;
    else if (s.winner === first) starter++;
  }
  return { starter, draws };
}
const without = run(false, 130100);
const withB = run(true, 130200);
console.log("2 players, no balance: the starter wins " + pct(without.starter) + "% (draws " + without.draws + ")");
console.log("2 players, balance for the second: the starter wins " + pct(withB.starter) + "% (draws " + withB.draws + ")");
const p = 100 * withB.starter / GAMES;
check("with balance the starter wins " + p.toFixed(1) + "% (want 45-55 %)", p >= 45 && p <= 55);
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== STERNJAGD BALANCE: " + GAMES + " games with 2 players without and with the balance, starter " + pct(without.starter) + "% / " + pct(withB.starter) + "%, rule checks, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
