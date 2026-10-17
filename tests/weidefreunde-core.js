// weidefreunde-core.js test
// "Pasture Friends": fixed rolls check every rule (take, farmer, send back,
// refused moves, the pile never runs out); then 1000 games computer against
// computer for each of 2, 3 and 4 players from fixed seeds: every game ends
// with exactly one full pasture (the winner's), the 35 cards are always all
// there (7 of each animal in pile, yard and pastures), the yard keeps its
// 5 cards, every computer step is a legal move, the state survives
// JSON.stringify/parse. Finally the computer's strategy plays 2000 games
// against a computer that chooses at random (both seat orders) and wins
// clearly more than half of them.
const path = require("path");
const C = require(path.join(__dirname, "..", "weidefreunde-core.js"));

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

function fixed(yard, own, pile) {
  const s = C.newGame({ players: 2, rng: C.makeRng(1) });
  s.yard = yard.slice();
  s.own[0] = own.slice();
  s.pile = pile.slice();
  return s;
}

// ---- single rules ----
let s = fixed([0, 1, 2, 3, 4], [0, 0, 0, 0, 0], [4, 4, 4]);
let t = C.roll(s, null, 2);
check("animal in the yard is taken", t.own[0][2] === 1 && t.yard[2] === 4 && t.pile.length === 2 && t.current === 1 && t.phase === "roll" && t.last.action === "take" && t.last.animal === 2);
t = C.roll(fixed([0, 1, 2, 3, 4], [0, 0, 1, 0, 0], [4]), null, 2);
check("animal I already have: send back", t.phase === "swap" && t.current === 0 && t.die === 2);
t = C.roll(fixed([0, 0, 2, 3, 4], [0, 0, 0, 0, 0], [4]), null, 1);
check("animal not in the yard: send back", t.phase === "swap");
let u = C.swap(t, 0);
check("send back: card under the pile, new card in the same place", u.yard[0] === 4 && u.pile[u.pile.length - 1] === 0 && u.pile.length === 1 && u.current === 1 && u.phase === "roll" && u.last.action === "swap" && u.last.animal === 0 && u.last.shown === 4);
s = fixed([0, 1, 2, 3, 4], [0, 0, 0, 0, 0], [1]);
check("swap refused in roll phase", C.swap(s, 0) === s && C.pick(s, 0) === s);
t = C.roll(fixed([0, 1, 2, 3, 4], [1, 1, 0, 0, 0], [3]), null, 5);
check("farmer with something to take: pick phase", t.phase === "pick" && t.die === 5);
check("farmer cannot take an animal already owned", C.pick(t, 0) === t && C.pick(t, 1) === t);
u = C.pick(t, 3);
check("farmer takes the chosen card", u.own[0][3] === 1 && u.yard[3] === 3 && u.current === 1 && u.last.action === "farmer" && u.last.animal === 3);
t = C.roll(fixed([0, 1, 0, 1, 1], [1, 1, 0, 0, 0], [3]), null, 5);
check("farmer with nothing to take: send back", t.phase === "swap");
t = C.roll(fixed([0, 1, 2, 3, 4], [1, 1, 1, 1, 0], [4]), null, 4);
check("last animal wins at once", t.phase === "over" && t.winner === 0 && C.count(t, 0) === 5 && C.outcomeFor(t, 0) === "win" && C.outcomeFor(t, 1) === "loss");
check("no action after the end", C.roll(t, null, 0) === t && C.aiStep(t) === t);
check("a roll from the generator is a face 0..5", (() => { const r = C.makeRng(5); for (let i = 0; i < 200; i++) { const d = C.roll(C.newGame({ players: 2, rng: r }), r).die; if (!(d >= 0 && d <= 5)) return false; } return true; })());
check("new game: 35 cards, yard of 5, pile of 30", (() => { const g = C.newGame({ players: 4, rng: C.makeRng(9) }); return g.yard.length === 5 && g.pile.length === 30 && g.n === 4 && g.own.length === 4; })());
check("same seed, same game", JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })) === JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })));
check("player count limited to 2..4", C.newGame({ players: 9 }).n === 4 && C.newGame({ players: 1 }).n === 2);

// ---- games ----
function conserved(g) {
  const seen = [0, 0, 0, 0, 0];
  g.pile.forEach((a) => seen[a]++);
  g.yard.forEach((a) => seen[a]++);
  g.own.forEach((o) => o.forEach((has, a) => { if (has) seen[a]++; }));
  return seen.every((c) => c === C.COPIES) && g.yard.length === C.YARD;
}

function play(n, seed, dumbSeats) {
  const rng = C.makeRng(seed);
  let g = C.newGame({ players: n, computer: new Array(n).fill(true), rng: rng });
  let steps = 0;
  while (g.phase !== "over") {
    const next = C.aiStep(g, rng, { dumb: dumbSeats ? !!dumbSeats[g.current] : false });
    if (next === g) { fails.push("n" + n + " seed " + seed + ": computer step refused in phase " + g.phase); return null; }
    g = next;
    if (steps++ % 7 === 0 && !conserved(g)) { fails.push("n" + n + " seed " + seed + ": cards not conserved"); return null; }
    if (g.turns > 600) { fails.push("n" + n + " seed " + seed + ": game too long"); return null; }
  }
  return g;
}

const PER = 1000;
const lines = [];
for (const n of [2, 3, 4]) {
  let turnsSum = 0, turnsMax = 0, minPile = 99;
  const wins = new Array(n).fill(0);
  let ended = 0;
  for (let k = 1; k <= PER; k++) {
    const g = play(n, k * 15485863 + n, null);
    if (!g) continue;
    ended++;
    const tag = "n" + n + " seed " + k;
    check(tag + ": one winner", g.winner >= 0 && g.winner < n);
    check(tag + ": winner has all five", C.count(g, g.winner) === 5);
    check(tag + ": nobody else has all five", g.own.every((o, p) => p === g.winner || C.count(g, p) < 5));
    check(tag + ": cards conserved at the end", conserved(g));
    check(tag + ": state is plain data", JSON.stringify(JSON.parse(JSON.stringify(g))) === JSON.stringify(g));
    wins[g.winner]++;
    turnsSum += g.turns;
    turnsMax = Math.max(turnsMax, g.turns);
    minPile = Math.min(minPile, g.pile.length);
  }
  check("n" + n + ": all games ended", ended === PER);
  check("n" + n + ": the pile never ran out", minPile >= 1);
  lines.push(n + " players: " + ended + " games, turns per game " + (turnsSum / PER).toFixed(1) + " (longest " + turnsMax + "), wins per seat " + wins.join("/") + ", smallest pile " + minPile);
}

// the strategy against random choices, both seat orders
let strong = 0, total = 0;
for (let k = 1; k <= 1000; k++) {
  const a = play(2, k * 7919 + 3, [false, true]);
  const b = play(2, k * 7919 + 4, [true, false]);
  if (a) { total++; if (a.winner === 0) strong++; }
  if (b) { total++; if (b.winner === 1) strong++; }
}
const share = strong / total;
check("strategy beats random choices (" + (share * 100).toFixed(1) + " %)", share > 0.52);
lines.push("strategy against random choices: " + strong + " of " + total + " games won (" + (share * 100).toFixed(1) + " %)");

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== WEIDEFREUNDE CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log(lines.join("\n"));
console.log("=== WEIDEFREUNDE CORE: 3 x " + PER + " computer games (2, 3, 4 players), all ended with one full pasture, 0 failures ===");
