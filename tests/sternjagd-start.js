#!/usr/bin/env node
// Sternjagd, who starts (task 128): GAMES computer games (default 1000)
// each with 2, 3 and 4 players, once with seat 1 always starting (as
// measured in task 117) and once with a random starter (as the page does
// it). With the random starter every seat must win within 5 percentage
// points of the mean (100 / players). The starter's own win rate is
// printed too.
const path = require("path");
const C = require(path.join(__dirname, "..", "sternjagd-core.js"));
const GAMES = parseInt(process.env.GAMES || "1000", 10);
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
const pct = (x) => (100 * x / GAMES).toFixed(1);
function run(n, random, seed) {
  const rng = seeded(seed);
  const wins = new Array(n).fill(0);
  let starterWins = 0, draws = 0;
  for (let g = 0; g < GAMES; g++) {
    const first = random ? Math.floor(rng() * n) : 0;
    let s = C.newGame({ players: n, computer: new Array(n).fill(true), first });
    for (let guard = 0; s.phase !== "over"; guard++) {
      const next = C.aiStep(s, rng);
      if (next === s || guard > 20000) { fails.push(n + " players: game " + g + " hangs"); break; }
      s = next;
    }
    if (s.winner === -1) { draws++; continue; }
    wins[s.winner]++;
    if (s.winner === first) starterWins++;
  }
  return { wins, starterWins, draws };
}
for (const n of [2, 3, 4]) {
  const before = run(n, false, 128000 + n);
  const after = run(n, true, 128100 + n);
  const mean = 100 / n;
  console.log(n + " players, seat 1 starts: " + before.wins.map((w, i) => "seat " + (i + 1) + " " + pct(w) + "%").join(", ") + " (draws " + before.draws + ")");
  console.log(n + " players, random starter: " + after.wins.map((w, i) => "seat " + (i + 1) + " " + pct(w) + "%").join(", ") + "; the starter wins " + pct(after.starterWins) + "% (draws " + after.draws + ")");
  after.wins.forEach((w, i) => {
    const p = 100 * w / GAMES;
    if (Math.abs(p - mean) > 5) fails.push(n + " players, random starter: seat " + (i + 1) + " wins " + p.toFixed(1) + "% (mean " + mean.toFixed(1) + "%)");
  });
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== STERNJAGD START: " + GAMES + " games each with 2, 3 and 4 players, fixed and random starter, every seat within 5 points with a random starter, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
