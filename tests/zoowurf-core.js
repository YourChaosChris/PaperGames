// zoowurf-core.js test
// "Zoo Toss": fixed rolls check every rule (dice that fit go onto the card,
// the paw counts for the animal needed most, three rolls make a turn, the
// rest of the card goes on to the next player, a full card ends the round
// and the next player chooses, four cards win, refused moves); the card set
// (30 cards, three to five animals, all different, each fillable with five
// dice); the exact win chance function against a simulation; then 1000
// games computer against computer for each of 2, 3 and 4 players from fixed
// seeds: every game ends with exactly one winner with 4 cards, the cards are
// always all there (30 in pile, yard, play and won), every computer step is
// a legal move, the state survives JSON.stringify/parse. Finally the
// computer's card choice plays 3000 games against a player who always takes
// the worst open card and wins clearly more than half of them.
const path = require("path");
const C = require(path.join(__dirname, "..", "zoowurf-core.js"));

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

function fixed(cards, pile, players) {
  const s = C.newGame({ players: players || 2, rng: C.makeRng(1) });
  s.yard = cards.map((c) => c.slice());
  s.pile = (pile || []).map((c) => c.slice());
  return s;
}

// ---- single rules ----
const LLM = [2, 0, 0, 1, 0]; // two lions and a monkey
let s = C.choose(fixed([LLM, [1, 1, 1, 0, 0]], [[0, 0, 0, 1, 2]]), 0);
check("choose: card in play, replaced from the pile, roll phase", s.phase === "roll" && s.play.size === 3 && s.play.need.join() === "2,0,0,1,0" && s.play.card.join() === "2,0,0,1,0" && s.yard.length === 2 && s.yard[0].join() === "0,0,0,1,2" && s.pile.length === 0);
check("choose refused outside the choose phase or out of range", C.choose(s, 0) === s && (() => { const g = fixed([LLM]); return C.choose(g, 5) === g && C.choose(g, -1) === g; })());
check("roll refused in the choose phase", (() => { const g = fixed([LLM]); return C.roll(g, null, [0, 0, 0]) === g; })());
let t = C.roll(s, null, [0, 4, 3]);
check("matching dice go onto the card, others do not", t.play.need.join() === "1,0,0,0,0" && t.dice.hits.join() === "true,false,true" && t.rolls === 1 && t.current === 0 && t.phase === "roll");
check("more dice of an animal than needed: only the needed ones count", C.applyDice([1, 0, 0, 0, 0], [0, 0, 0]).need.join() === "0,0,0,0,0" && C.applyDice([1, 0, 0, 0, 0], [0, 0, 0]).hits.join() === "true,false,false");
check("paw counts for the animal needed most", C.applyDice([2, 0, 0, 1, 0], [5, 4, 3]).need.join() === "1,0,0,0,0" && C.applyDice([1, 0, 0, 2, 0], [5]).need.join() === "1,0,0,1,0");
check("paw with nothing to fill does nothing", C.applyDice([0, 0, 0, 0, 0], [5]).hits.join() === "false");
check("animals are used before the paw (a paw rolled first still fills the other place)", C.applyDice([1, 0, 0, 1, 0], [5, 0]).need.join() === "0,0,0,0,0" && C.applyDice([1, 0, 0, 1, 0], [5, 3]).need.join() === "0,0,0,0,0" && C.applyDice([1, 0, 0, 1, 0], [5, 3]).hits.join() === "true,true");
t = C.roll(t, null, [1]);
check("a miss keeps the rest, second roll counted", t.rolls === 2 && t.play.need.join() === "1,0,0,0,0" && t.current === 0);
t = C.roll(t, null, [2]);
check("after three rolls the turn passes, the card stays", t.current === 1 && t.rolls === 0 && t.phase === "roll" && t.play.need.join() === "1,0,0,0,0" && t.last.action === "pass" && t.last.left === 1 && t.seq === 1);
let u = C.roll(t, null, [5]);
check("the next player fills the card: one point, next round, next player chooses", u.scores[1] === 1 && u.scores[0] === 0 && u.phase === "choose" && u.current === 0 && u.play === null && u.last.action === "win" && u.last.player === 1 && u.last.left === 0);
check("number of dice rolled equals the number needed", (() => { const g = C.choose(fixed([[1, 1, 1, 1, 1]]), 0); const r = C.roll(g, C.makeRng(3)); return r.dice.faces.length === 5; })());
check("a roll from the generator gives faces 0..5", (() => { const r = C.makeRng(5); for (let i = 0; i < 100; i++) { const g = C.roll(C.choose(fixed([[1, 1, 1, 1, 1]]), 0), r); if (!g.dice.faces.every((f) => f >= 0 && f <= 5)) return false; } return true; })());
// the fourth card ends the game
s = fixed([[1, 0, 0, 0, 0]], [], 2);
s.scores[0] = 3;
s = C.choose(s, 0);
t = C.roll(s, null, [0]);
check("the fourth card wins at once", t.phase === "over" && t.winner === 0 && t.scores[0] === 4 && C.outcomeFor(t, 0) === "win" && C.outcomeFor(t, 1) === "loss" && C.outcomeFor(s, 0) === null);
check("no action after the end", C.roll(t, null, [0]) === t && C.aiStep(t) === t && C.choose(t, 0) === t);
check("same seed, same game", JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })) === JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })));
check("player count limited to 2..4", C.newGame({ players: 9 }).n === 4 && C.newGame({ players: 1 }).n === 2);

// ---- the cards ----
const g0 = C.newGame({ players: 2, rng: C.makeRng(11) });
const cards = g0.pile.concat(g0.yard);
const keys = {};
cards.forEach((c) => { keys[c.join()] = (keys[c.join()] || 0) + 1; });
check("30 cards, all different", cards.length === 30 && Object.keys(keys).length === 30);
check("each size 3, 4, 5 appears 10 times", [3, 4, 5].every((n) => cards.filter((c) => C.sum(c) === n).length === 10));
check("a card needs at most 3 of the same animal", cards.every((c) => Math.max.apply(null, c) <= 3));
check("every card is fillable (chance of the first player is between 0.4 and 0.95)", cards.every((c) => { const p = C.firstChance(C.key(c)); return p > 0.4 && p < 0.95; }));

// ---- the win chance against a simulation ----
function simulate(card, games, seed) {
  const rng = C.makeRng(seed);
  let first = 0;
  for (let i = 0; i < games; i++) {
    let g = C.newGame({ players: 2, rng: rng });
    g.yard = [card.slice(), card.slice()];
    g = C.choose(g, 0);
    const starter = g.current;
    let guard = 0;
    while (g.phase === "roll" && guard++ < 500) g = C.roll(g, rng);
    if (g.last.player === starter) first++;
  }
  return first / games;
}
[[1, 1, 1, 1, 1], [3, 0, 0, 0, 0], [2, 1, 1, 0, 0]].forEach((card) => {
  const exact = C.firstChance(C.key(card));
  const sim = simulate(card, 10000, 17);
  console.log("first-player chance " + card.join("") + ": exact " + exact.toFixed(3) + ", simulated " + sim.toFixed(3));
  check("exact chance matches simulation " + card.join(""), Math.abs(exact - sim) < 0.02);
});

// ---- games ----
function conserved(g) {
  const all = g.pile.length + g.yard.length + (g.play ? 1 : 0) + g.scores.reduce((a, b) => a + b, 0);
  return all === 30;
}

function playGame(n, seed, pickWorst, seat) {
  const rng = C.makeRng(seed);
  let g = C.newGame({ players: n, computer: new Array(n).fill(true), rng: rng });
  let guard = 0;
  while (g.phase !== "over" && guard++ < 5000) {
    let next;
    if (pickWorst && g.phase === "choose" && g.current === seat) {
      let best = 0, bv = 9;
      g.yard.forEach((c, i) => { const v = C.cardValue(c); if (v < bv) { bv = v; best = i; } });
      next = C.choose(g, best);
    } else next = C.aiStep(g, rng);
    if (next === g) { fails.push("computer step refused in game " + n + "/" + seed); return g; }
    g = next;
    if (!conserved(g)) { fails.push("cards not conserved " + n + "/" + seed); return g; }
    if (JSON.stringify(JSON.parse(JSON.stringify(g))) !== JSON.stringify(g)) { fails.push("state not serialisable"); return g; }
  }
  return g;
}

[2, 3, 4].forEach((n) => {
  let turns = 0, maxTurns = 0, bad = 0;
  for (let i = 0; i < 1000; i++) {
    const g = playGame(n, i + 1);
    if (g.phase !== "over" || g.winner === null || g.scores[g.winner] !== C.TARGET || g.scores.filter((x) => x >= C.TARGET).length !== 1) bad++;
    turns += g.turns;
    maxTurns = Math.max(maxTurns, g.turns);
  }
  console.log(n + " players: 1000 games, average " + (turns / 1000).toFixed(1) + " turns, longest " + maxTurns + " turns");
  check(n + " players: every game ends with one winner of 4 cards", bad === 0);
  check(n + " players: games are not too long", maxTurns < 60);
});

let wins = 0;
const N = 3000;
for (let i = 0; i < N; i++) {
  const seat = i % 2;
  const g = playGame(2, 5000 + i, true, seat);
  if (g.winner !== seat) wins++;
}
console.log("card choice against always-the-worst-card: " + wins + " of " + N + " (" + (100 * wins / N).toFixed(1) + " %)");
check("the card choice wins more than half against the worst choice", wins / N > 0.52);


// ---- level "Beginner" (task 99s): the computers choose the open card at random ----
(() => {
  const old = C.newGame({ players: 2, computer: [false, true], rng: C.makeRng(3) });
  check("a game without a level has no level field (older saved states are the same)", old.level === undefined && !("level" in old));
  const beg = C.newGame({ players: 2, computer: [false, true], rng: C.makeRng(3), level: "beginner" });
  check("level beginner is stored in the state and survives a save", beg.level === "beginner" && JSON.parse(JSON.stringify(beg)).level === "beginner");
  check("an unknown level is the standard", C.newGame({ players: 2, level: "x" }).level === undefined);
  // the standard picks the same open card every time; the beginner picks both
  const at = (g) => ({ ...g, current: 1 });
  const normalPicks = new Set(), beginnerPicks = new Set();
  const r = C.makeRng(99);
  for (let i = 0; i < 100; i++) {
    const a = C.newGame({ players: 2, computer: [false, true], rng: C.makeRng(200 + i) });
    const b = C.newGame({ players: 2, computer: [false, true], rng: C.makeRng(200 + i), level: "beginner" });
    const na = C.aiStep(at(a), r), nb = C.aiStep(at(b), r);
    check("the beginner step is a legal choice " + i, nb !== at(b) && nb.phase === "roll");
    normalPicks.add(i + ":" + (na.play.card.join("") === a.yard[C.chooseCard(a)].join("")));
    beginnerPicks.add(nb.play.card.join("") === b.yard[0].join("") ? "first" : "second");
  }
  check("the standard always picks the card with the best chance", [...normalPicks].every((x) => x.endsWith("true")));
  check("the beginner picks both open cards over 100 rounds", beginnerPicks.has("first") && beginnerPicks.has("second"));
  // 100 games, two players: the standard against the beginner
  let smartWins = 0;
  const N2 = 100;
  for (let i = 0; i < N2; i++) {
    const smartSeat = i % 2, rr = C.makeRng(7000 + i);
    let g = C.newGame({ players: 2, computer: [true, true], rng: rr });
    let guard = 0;
    while (g.phase !== "over" && guard++ < 2000) {
      const next = C.aiStep(g, rr, { dumb: g.current !== smartSeat });
      if (next === g) break;
      g = next;
    }
    if (g.winner === smartSeat) smartWins++;
  }
  console.log("level beginner: the standard computer wins " + smartWins + " of " + N2 + " games against a computer that chooses cards at random");
  check("the standard computer beats the random chooser more often than not", smartWins >= 50);
})();

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== ZOOWURF CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== ZOOWURF CORE: 3 x 1000 computer games (2, 3, 4 players), every game ended with one winner of 4 cards, 0 failures ===");
