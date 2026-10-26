#!/usr/bin/env node
// Lucky Chain (teufelsieben-core.js, rules 2): deck, turn order, specials,
// scoring, computer play, card conservation, save/load, and seat balance.
const path = require("path");
const C = require(path.join(__dirname, "..", "teufelsieben-core.js"));
const GAMES = parseInt(process.env.GAMES || "500", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const clone = (x) => JSON.parse(JSON.stringify(x));

{
  check("60 cards", C.DECK.length === 60);
  for (const [v, n] of Object.entries(C.COUNTS)) check("number " + v + " count", C.DECK.filter((x) => x === Number(v)).length === n);
  check("no zero, eleven, or twelve", !C.DECK.some((x) => typeof x === "number" && (x < 1 || x > 10)));
  check("six special types, two each", C.SPECIALS.length === 6 && C.SPECIALS.every((x) => C.DECK.filter((c) => c === x).length === 2));
}

function fixed(players, deck, extra) {
  const s = clone(C.newGame({ players, target: 120 }, C.makeRng(1)));
  s.deck = deck.slice(); s.discard = []; s.hands = Array.from({ length: players }, () => ({ numbers: [], courage: false, courageUsed: 0, bridges: 0, collectors: 0, status: "wait", drawn: 0 }));
  s.phase = "turn"; s.roundPoints = null; s.turnsLeft = Array.from({ length: players }, (_, i) => i); s.current = 0; s.hands[0].status = "in";
  return Object.assign(s, extra || {});
}
function advanceByStop(s) { return s.hands[s.current].drawn ? C.stop(s) : s; }

{
  let s = fixed(3, [5, 7, 7, 2]);
  check("stop before a card is rejected", C.stop(s) === s);
  s = C.draw(s); s = C.stop(s); check("next player takes one turn", s.current === 1 && s.hands[1].status === "in");
  s = C.draw(s); s = C.draw(s);
  check("duplicate number busts and remains visible", s.hands[1].status === "bust" && s.hands[1].numbers.join() === "7,7" && s.phase === "turn");
  s = C.draw(s); s = C.stop(s);
  check("round ends after every player has one turn", s.phase === "roundover" && s.roundPoints[0] === 5);
  const dealer = s.dealer; s = C.nextRound(s); check("dealer advances and first seat rotates", s.dealer === (dealer + 1) % 3 && s.current === (dealer + 2) % 3);
}
{
  let s = fixed(2, ["courage", 4, 4, 1]);
  s = C.draw(s); s = C.draw(s); s = C.draw(s);
  check("courage saves once and costs five points", s.hands[0].status === "in" && !s.hands[0].courage && s.hands[0].courageUsed === 1 && s.last.type === "saved");
  s = C.stop(s); s = C.draw(s); s = C.stop(s);
  check("courage penalty applied at round end", s.phase === "roundover" && s.roundPoints[0] === 0);
  let q = fixed(2, ["courage", "courage", 3, 2]); q = C.draw(q); q = C.draw(q);
  check("second courage has no effect", q.hands[0].courage && q.last.type === "void" && q.discard.includes("courage"));
}
{
  let s = fixed(2, [5, "strike", 7, 2]); s = C.draw(s); s = C.draw(s);
  check("strike removes latest number", s.hands[0].numbers.join() === "" && s.discard.includes(5) && s.last.type === "strike");
  let p = fixed(3, ["pass", 3, 4, 5]); p = C.draw(p); p = C.stop(p);
  check("pass schedules one forced card", p.forced === 0 && p.current === 1 && p.hands[1].numbers.join() === "3");
  check("forced card counts as the next player's turn", p.hands[1].drawn === 1 && p.turnsLeft.join() === "1,2");
  let multi = fixed(3, ["pass", "pass", 3, 3]); multi = C.draw(multi); multi = C.draw(multi); multi = C.stop(multi);
  check("passes add and bust ends that forced turn", multi.hands[1].status === "bust" && multi.current === 2 && multi.hands[2].drawn === 0 && multi.forced === 0);
  let last = fixed(2, [1, "pass", 2]); last.hands[1].status = "stop"; last.turnsLeft = [0]; last = C.draw(last);
  check("pass has no effect when nobody follows", last.forced === 0);
}
{
  const h = { numbers: [3, 4, 6, 7], bridges: 1, collectors: 0, courageUsed: 0, status: "in" };
  check("bridge fills a five-number chain for fifteen", C.runLength(h.numbers, 1) === 5 && C.handPoints(h) === 35);
  check("collector scores per number", C.handPoints({ ...h, numbers: [3, 4], bridges: 0, collectors: 2 }) === 11);
  check("bridge can extend a chain at the edge", C.runLength([4, 5, 6], 1) === 4);
  check("two bridges fill two gaps", C.runLength([2, 4, 6], 2) === 5);
  check("no numbers do not form a chain", C.runLength([], 3) === 0);
  let c = fixed(2, ["bridge", "collector", 3, 4]); c = C.draw(c); c = C.stop(c); c = C.draw(c); c = C.stop(c);
  check("bridge and collector cards are retained", c.roundPoints[0] === 0 && c.roundPoints[1] === 0);
}
{
  let s = fixed(2, ["peek", 8, 3]); s = C.draw(s);
  check("peek reveals top card", s.peek === 8 && s.last.type === "peek");
  s = C.draw(s); check("peek clears on next draw", s.peek === null && s.hands[0].numbers.join() === "8");
  let e = fixed(2, [1]); e = C.draw(e); const prev = e; e = C.draw(e);
  check("empty deck ends the turn as stop", e.current === 1 && e.hands[0].status === "stop" && e.last.type === "empty" && e !== prev);
}
{
  let s = fixed(2, [1, 2]); s = C.draw(s); s = JSON.parse(JSON.stringify(s)); s = C.stop(s); s = C.draw(s); s = C.stop(s);
  check("JSON save and load continues play", s.phase === "roundover" && C.isCurrentState(s));
  const old = clone(s); delete old.rules; check("old rules-less state is rejected", !C.isCurrentState(old));
  let t = fixed(2, [10, 10]); t.totals = [80, 80]; t.target = 90; t = C.draw(t); t = C.stop(t); t = C.draw(t); t = C.stop(t);
  check("target tie gives all top players a win", t.phase === "over" && t.winners.join() === "0,1" && C.outcomeFor(t, 0) === "draw");
  check("game ends after target round", t.last.type === "gameover" && C.outcomeFor(t, 1) === "draw");
}
{
  const a = fixed(2, [1, 2, 3, 4, 5]); a.hands[0].numbers = [2, 4];
  const b = clone(a); b.deck.reverse();
  check("bust chance ignores hidden deck order", C.bustChance(a, 0) === C.bustChance(b, 0));
}

function cardsTotal(s) {
  let n = s.deck.length + s.discard.length;
  s.hands.forEach((h) => { n += h.numbers.length + (h.courage ? 1 : 0) + h.bridges + h.collectors; });
  return n;
}
function play(n, levels, target, seed) {
  const rng = C.makeRng(seed), s0 = C.newGame({ players: n, computer: Array(n).fill(true), levels, target }, rng);
  let s = s0, steps = 0, rounds = 0, problem = "";
  while (s.phase !== "over" && steps++ < 2000) {
    const beforeRound = s.round;
    const before = s;
    s = s.phase === "roundover" ? C.nextRound(s, rng) : C.aiStep(s, rng);
    if (s === before) { problem = "stuck"; break; }
    if (s.round !== beforeRound) rounds++;
    if (cardsTotal(s) !== 60) { problem = "cards " + cardsTotal(s); break; }
  }
  if (!problem && s.phase !== "over") problem = "hang";
  return { s, rounds, problem };
}
const levelStats = { 1: { games: 0, wins: 0, points: 0, rounds: 0 }, 2: { games: 0, wins: 0, points: 0, rounds: 0 }, 3: { games: 0, wins: 0, points: 0, rounds: 0 } };
const roundMeans = {};
for (const n of [2, 3, 4, 5, 6]) {
  let totalRounds = 0;
  for (let g = 0; g < GAMES; g++) {
    const levels = Array.from({ length: n }, (_, i) => 1 + ((i + g) % 3));
    const result = play(n, levels, 90, n * 100000 + g);
    if (result.problem) { fails.push(n + " players game " + g + ": " + result.problem); continue; }
    totalRounds += result.s.round;
    for (let i = 0; i < n; i++) { const x = levelStats[levels[i]]; x.games++; x.points += result.s.totals[i]; x.rounds += result.s.round; if (result.s.winners.includes(i)) x.wins++; }
  }
  roundMeans[n] = (totalRounds / GAMES).toFixed(1);
}
const seatStats = {};
for (const n of [2, 3, 4, 5, 6]) for (let g = 0; g < GAMES; g++) {
  const result = play(n, Array(n).fill(3), 90, 900000 + n * 100000 + g);
  if (result.problem) { fails.push(n + " seat game " + g + ": " + result.problem); continue; }
  if (!seatStats[n]) seatStats[n] = Array.from({ length: n }, () => ({ games: 0, wins: 0 }));
  // Seat 0 begins the first round; the first player moves on every round.
  for (let i = 0; i < n; i++) { seatStats[n][i].games++; if (result.s.winners.includes(i)) seatStats[n][i].wins++; }
}
const rates = [1, 2, 3].map((l) => 100 * levelStats[l].wins / Math.max(1, levelStats[l].games));
console.log("wins per level (solo wins / player games): " + [1, 2, 3].map((l) => "level " + l + " " + rates[l - 1].toFixed(1) + "%").join(", "));
const seats = [];
for (const n of [2, 3, 4, 5, 6]) seats.push(n + "p " + seatStats[n].map((x, i) => "seat " + i + " " + (100 * x.wins / Math.max(1, x.games)).toFixed(1) + "%").join(" / "));
console.log("wins per seat (level 3): " + seats.join("; "));
console.log("rounds per game (target 90): " + Object.keys(roundMeans).map((n) => n + " players " + roundMeans[n]).join(", "));
for (const target of [60, 90, 120]) {
  const means = [];
  for (const n of [2, 3, 4, 5, 6]) {
    let sum = 0;
    for (let g = 0; g < GAMES; g++) { const lv = Array.from({ length: n }, (_, i) => 1 + ((i + g) % 3)); const r = play(n, lv, target, 1700000 + target * 1000 + n * 100000 + g); if (!r.problem) sum += r.s.round; else fails.push(n + " players target " + target + " game " + g + ": " + r.problem); }
    means.push(n + "p " + (sum / GAMES).toFixed(1));
  }
  console.log("rounds per game (target " + target + "): " + means.join(", "));
}
console.log("mean round points per level: " + [1, 2, 3].map((l) => "level " + l + " " + (levelStats[l].points / Math.max(1, levelStats[l].rounds)).toFixed(1)).join(", "));
check("level 3 wins more than level 1", rates[2] > rates[0]);
for (const n of [2, 3, 4, 5, 6]) {
  const tolerance = 5;
  for (let i = 0; i < n; i++) {
    const rate = 100 * seatStats[n][i].wins / Math.max(1, seatStats[n][i].games);
    check("seat balance n=" + n + " seat=" + i, Math.abs(rate - 100 / n) <= tolerance);
  }
}
fails.slice(0, 30).forEach((f) => console.log("FAIL " + f));
console.log("=== LUCKY CHAIN CORE: " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
