#!/usr/bin/env node
// Experimental comparison of the extreme deck with and without mul/div cards.
const path = require("path");
const C = require(path.join(__dirname, "..", "teufelsieben-core.js"));
const GAMES = parseInt(process.env.GAMES || "300", 10);

function cardsTotal(s) {
  let n = s.deck.length + s.discard.length;
  s.hands.forEach((h) => { n += h.numbers.length + (h.courage ? 1 : 0) + h.bridges + h.collectors + (h.stars || 0) + (h.weights || 0) + (h.links || 0) + (h.doubles || 0) + (h.halves || 0); });
  return n;
}
function play(n, g, variant) {
  const levels = Array.from({ length: n }, (_, i) => 1 + ((i + g) % 3));
  const rng = C.makeRng(5200000 + n * 100000 + g);
  const s0 = C.newGame({ players: n, mode: "extreme", measureVariant: variant ? "muldiv" : undefined, computer: Array(n).fill(true), levels, target: 250 }, rng);
  const rounds = [], sStats = { 1: { wins: 0, games: 0 }, 2: { wins: 0, games: 0 }, 3: { wins: 0, games: 0 } };
  let s = s0, steps = 0;
  while (s.phase !== "over" && steps++ < 6000) {
    const before = s;
    s = s.phase === "roundover" ? C.nextRound(s, rng) : C.aiStep(s, rng);
    if (s === before) throw new Error("stuck");
    if (s.phase === "roundover" || s.phase === "over") rounds.push(...s.roundPoints);
    if (cardsTotal(s) !== (variant ? 80 : 78)) throw new Error("card conservation: " + cardsTotal(s));
  }
  if (s.phase !== "over") throw new Error("game hang");
  for (let i = 0; i < n; i++) { sStats[levels[i]].games++; if (s.winners.includes(i)) sStats[levels[i]].wins++; }
  return { rounds, sStats };
}
function measure(variant) {
  const level = { 1: { wins: 0, games: 0 }, 2: { wins: 0, games: 0 }, 3: { wins: 0, games: 0 } };
  let games = 0, sumRounds = 0, points = [], zero = 0;
  for (const n of [2, 3, 4, 5, 6]) for (let g = 0; g < GAMES; g++) {
    const result = play(n, g, variant); games++; sumRounds += result.rounds.length / n;
    points.push(...result.rounds); zero += result.rounds.filter((x) => x === 0).length;
    for (const l of [1, 2, 3]) { level[l].wins += result.sStats[l].wins; level[l].games += result.sStats[l].games; }
  }
  const mean = points.reduce((a, b) => a + b, 0) / Math.max(1, points.length);
  const variance = points.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, points.length);
  const rates = [1, 2, 3].map((l) => 100 * level[l].wins / Math.max(1, level[l].games));
  return { name: variant ? "muldiv" : "standard", gap: rates[2] - rates[0], rounds: sumRounds / games, zero: 100 * zero / Math.max(1, points.length), sd: Math.sqrt(variance), rates };
}
const standard = measure(false), muldiv = measure(true);
for (const m of [standard, muldiv]) {
  console.log(m.name + ": level 1 " + m.rates[0].toFixed(1) + "%, level 2 " + m.rates[1].toFixed(1) + "%, level 3 " + m.rates[2].toFixed(1) + "%");
  console.log(m.name + ": skill gap " + m.gap.toFixed(1) + " pp; mean rounds " + m.rounds.toFixed(1) + "; zero-point rounds " + m.zero.toFixed(1) + "%; round-points SD " + m.sd.toFixed(2));
}
const improved = muldiv.gap > standard.gap && muldiv.rounds <= standard.rounds;
console.log("VERDICT: " + (improved ? "muldiv improves the game" : "muldiv does not improve the game"));
