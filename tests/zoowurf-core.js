// zoowurf-core.js test (rules 2, task 145)
// "Zoo Toss": fixed rolls check every rule (everyone starts with an own
// card from the pile, one roll per turn, dice that fit go onto the card,
// the player puts a paw where there is a choice, a full card brings one
// point per animal and the next turn starts with one of two open cards,
// reaching the target finishes the round, the most points win, equal
// points share the win, refused moves, old states are not current); the
// card set (30 cards, three to five animals, all different); the expected
// turns against a simulation; then computer games for 2, 3 and 4 players
// from fixed seeds (default 300 each, `--games 500` for the full
// measurement): every game ends, the cards are always all there (30 in
// pile, yard, own cards and won), every computer step is legal, the state
// survives JSON. Measured and checked: the share of wins per seat when all
// computers play "normal" (at most 5 points from a fair share), the share
// of a "normal" computer against "beginners" (clearly above a fair share),
// rounds per game, draws.
const path = require("path");
const C = require(path.join(__dirname, "..", "zoowurf-core.js"));

const argGames = process.argv.indexOf("--games");
const GAMES = argGames > 0 ? parseInt(process.argv[argGames + 1], 10) : 1000;
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// a game with given own cards, open cards and pile
function fixed(own, yard, pile, players) {
  const s = C.newGame({ players: players || 2, rng: C.makeRng(1) });
  s.plays = own.map((c) => (c ? { card: c.slice(), need: c.slice(), size: C.sum(c) } : null));
  s.yard = yard.map((c) => c.slice());
  s.pile = (pile || []).map((c) => c.slice());
  s.phase = s.plays[0] ? "roll" : "choose";
  return s;
}

// ---- single rules ----
const g0 = C.newGame({ players: 3, rng: C.makeRng(5) });
check("new game: rules 2, everyone has an own card, two open cards, the first player rolls", g0.rules === 2 && g0.plays.every((p) => p && C.sum(p.need) === p.size && p.size >= 3) && g0.yard.length === 2 && g0.pile.length === 30 - 3 - 2 && g0.phase === "roll" && g0.current === 0 && C.isCurrentState(g0));
check("choose refused while the player has a card", C.choose(g0, 0) === g0);
const LLM = [2, 0, 0, 1, 0]; // two lions and a monkey
let s = fixed([LLM, [1, 1, 1, 0, 0]], [[0, 0, 0, 1, 2], [1, 0, 1, 0, 1]], [[0, 1, 1, 1, 0]]);
let t = C.roll(s, null, [0, 4, 2]);
check("one roll: matching dice go onto the own card, then the next player", t.plays[0].need.join() === "1,0,0,1,0" && t.last.dice.hits.join() === "true,false,false" && t.last.got === 1 && t.last.left === 2 && t.current === 1 && t.phase === "roll" && t.seq === 1);
check("the other player's card is untouched", t.plays[1].need.join() === "1,1,1,0,0");
check("more dice of an animal than needed: only the needed ones count", C.applyDice([1, 0, 0, 0, 0], [0, 0, 0]).need.join() === "0,0,0,0,0");
check("a roll uses as many dice as the card still needs", (() => { const r = C.roll(t, C.makeRng(3)); return r.last.dice.faces.length === 3; })());
check("a roll from the generator gives faces 0..5", (() => { const r = C.makeRng(5); for (let i = 0; i < 100; i++) { const g = C.roll(s, r); if (!g.dice.faces.every((f) => f >= 0 && f <= 5)) return false; } return true; })());
let u = C.roll(t, null, [0, 1, 2]);
check("a full card brings one point per animal; the player has no card now", u.scores[1] === 3 && u.won[1] === 1 && u.plays[1] === null && u.last.action === "win" && u.last.size === 3 && u.current === 0 && u.phase === "roll" && u.round === 2);
u = C.roll(u, null, [3, 4]);
check("player 1 without a card chooses first", u.current === 1 && u.phase === "choose" && C.roll(u, null, [0]) === u);
let v = C.choose(u, 1);
check("choose: the open card becomes the own card, replaced from the pile", v.phase === "roll" && v.plays[1].card.join() === "1,0,1,0,1" && v.yard[1].join() === "0,1,1,1,0" && v.pile.length === 0 && v.current === 1);
check("choose refused out of range", C.choose(u, 5) === u && C.choose(u, -1) === u);
// paws
s = fixed([[1, 0, 0, 1, 1], [1, 1, 1, 0, 0]], [[1, 1, 1, 0, 0], [1, 1, 1, 0, 0]], []);
t = C.roll(s, null, [5, 1, 2]);
check("paw: one paw and three open animals waits for the player", t.phase === "paw" && t.paws.join() === "0" && t.current === 0);
check("paw: roll and choose are refused while a paw waits; a closed place is refused", C.roll(t, null, [0]) === t && C.choose(t, 0) === t && C.placePaw(t, 1) === t && C.placePaw(t, 9) === t);
u = C.placePaw(t, 4);
check("paw: the paw goes on the chosen animal, then the next player", u.plays[0].need.join() === "1,0,0,1,0" && u.last.dice.on.join() === "4,-1,-1" && u.current === 1 && u.phase === "roll");
t = C.roll(s, null, [3, 5, 5]);
check("paw: as many paws as places fill the card without a question", t.scores[0] === 3 && t.last.action === "win");
t = C.roll(fixed([[2, 0, 0, 1, 0], [1, 1, 1, 0, 0]], [[1, 1, 1, 0, 0]], []), null, [3, 5, 4]);
check("paw: one open animal left means no choice", t.plays[0].need.join() === "1,0,0,0,0" && t.current === 1);
// the end: the round is finished, then the most points win
s = fixed([[1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 0]], [[1, 1, 1, 0, 0]], [], 3);
s.target = 12; s.scores = [11, 10, 5];
t = C.roll(s, null, [0]);
check("reaching the target does not end the game at once", t.phase === "roll" && t.ending === true && t.endedBy === 0 && t.scores[0] === 12 && t.current === 1);
t = C.roll(t, null, [1]);
t = C.roll(t, null, [3]);
check("after the last seat the game is over, the most points win", t.phase === "over" && t.winner === 0 && t.winners.join() === "0" && C.outcomeFor(t, 0) === "win" && C.outcomeFor(t, 1) === "loss" && C.outcomeFor(s, 0) === null);
check("no action after the end", C.roll(t, null, [0]) === t && C.aiStep(t) === t && C.choose(t, 0) === t);
s.scores = [11, 11, 5];
t = C.roll(C.roll(C.roll(s, null, [0]), null, [1]), null, [3]);
check("equal points share the win (a draw for each of them)", t.phase === "over" && t.winner === null && t.winners.join() === "0,1" && C.outcomeFor(t, 0) === "draw" && C.outcomeFor(t, 1) === "draw" && C.outcomeFor(t, 2) === "loss");
check("same seed, same game", JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })) === JSON.stringify(C.newGame({ players: 3, rng: C.makeRng(7) })));
check("player count limited to 2..4", C.newGame({ players: 9 }).n === 4 && C.newGame({ players: 1 }).n === 2);
check("an old state (first rules: shared card, no rules field) is not current", !C.isCurrentState({ game: "zoowurf", n: 2, computer: [false, true], current: 0, target: 4, scores: [0, 0], yard: [], pile: [], phase: "choose", play: null, rolls: 0 }) && !C.isCurrentState(null));
check("no level means normal; beginner is stored", !("level" in C.newGame({ players: 2 })) && C.newGame({ players: 2, level: "beginner" }).level === "beginner" && !("level" in C.newGame({ players: 2, level: "x" })));

// ---- the cards ----
const g1 = C.newGame({ players: 2, rng: C.makeRng(11) });
const cards = g1.pile.concat(g1.yard, g1.plays.map((p) => p.card));
const keys = {};
cards.forEach((c) => { keys[c.join()] = 1; });
check("30 cards, all different", cards.length === 30 && Object.keys(keys).length === 30);
check("each size 3, 4, 5 appears 10 times", [3, 4, 5].every((n) => cards.filter((c) => C.sum(c) === n).length === 10));
check("a card needs at most 3 of the same animal", cards.every((c) => Math.max.apply(null, c) <= 3));

// ---- expected turns against a simulation ----
function simulate(card, n, seed) {
  const rng = C.makeRng(seed);
  let total = 0;
  for (let i = 0; i < n; i++) {
    let need = card.slice(), turns = 0;
    while (C.sum(need) > 0 && turns < 200) {
      const faces = [];
      for (let k = 0; k < C.sum(need); k++) faces.push(Math.floor(rng() * 6));
      need = C.applyDice(need, faces).need;
      turns++;
    }
    total += turns;
  }
  return total / n;
}
[[1, 1, 1, 1, 1], [3, 0, 0, 0, 0], [2, 1, 1, 0, 0]].forEach((card) => {
  const exact = C.expectedTurns(C.key(card));
  const sim = simulate(card, 20000, 17);
  console.log("expected turns " + card.join("") + ": exact " + exact.toFixed(2) + ", simulated " + sim.toFixed(2));
  check("expected turns match the simulation " + card.join(""), Math.abs(exact - sim) < 0.08);
});

// ---- games ----
function conserved(g) {
  return g.pile.length + g.yard.length + g.plays.filter(Boolean).length + g.won.reduce((a, b) => a + b, 0) === 30;
}

// dumb: seats that play like the beginner level
function playGame(n, seed, dumb) {
  const rng = C.makeRng(seed);
  let g = C.newGame({ players: n, computer: new Array(n).fill(true), rng: rng });
  let guard = 0;
  while (g.phase !== "over" && guard++ < 3000) {
    const next = C.aiStep(g, rng, { dumb: !!(dumb && dumb[g.current]) });
    if (next === g) { fails.push("computer step refused in game " + n + "/" + seed); return g; }
    g = next;
    if (!conserved(g)) { fails.push("cards not conserved " + n + "/" + seed); return g; }
    if (!C.isCurrentState(g)) { fails.push("state not current " + n + "/" + seed); return g; }
  }
  if (JSON.stringify(JSON.parse(JSON.stringify(g))) !== JSON.stringify(g)) fails.push("state not serialisable");
  return g;
}

const t0 = Date.now();
[2, 3, 4].forEach((n) => {
  const seat = new Array(n).fill(0);
  let rounds = 0, maxRounds = 0, turns = 0, draws = 0, bad = 0;
  for (let i = 0; i < GAMES; i++) {
    const g = playGame(n, 1000 + i);
    if (g.phase !== "over" || !g.winners.length || Math.max.apply(null, g.scores) < g.target) bad++;
    g.winners.forEach((w) => { seat[w] += 1 / g.winners.length; });
    if (g.winners.length > 1) draws++;
    rounds += g.round; turns += g.turns; maxRounds = Math.max(maxRounds, g.round);
  }
  const shares = seat.map((x) => 100 * x / GAMES);
  const dev = Math.max.apply(null, shares.map((x) => Math.abs(x - 100 / n)));
  console.log(n + " players, " + GAMES + " games, all normal: wins per seat " + shares.map((x, i) => "seat " + i + " " + x.toFixed(1) + "%").join(" / ") + " (largest gap to fair " + dev.toFixed(1) + " points), draws " + (100 * draws / GAMES).toFixed(1) + "%, rounds " + (rounds / GAMES).toFixed(1) + " (longest " + maxRounds + "), turns " + (turns / GAMES).toFixed(1));
  check(n + " players: every game ends with a winner at the target", bad === 0);
  check(n + " players: seat advantage at most 5 points", dev <= 5);
  check(n + " players: games are not too long", maxRounds <= 30);
  // one normal computer against beginners, on every seat in turn
  let w = 0;
  for (let i = 0; i < GAMES; i++) {
    const me = i % n;
    const dumb = {};
    for (let k = 0; k < n; k++) if (k !== me) dumb[k] = true;
    const g = playGame(n, 5000 + i, dumb);
    if (g.winners.indexOf(me) >= 0) w += 1 / g.winners.length;
  }
  const share = 100 * w / GAMES;
  console.log(n + " players, " + GAMES + " games: level normal against beginners wins " + share.toFixed(1) + "% (fair share " + (100 / n).toFixed(1) + "%), each beginner " + ((100 - share) / (n - 1)).toFixed(1) + "%");
  check(n + " players: level normal clearly beats beginners", share >= 100 / n + 5);
});
console.log("time " + ((Date.now() - t0) / 1000).toFixed(1) + " s");

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== ZOOWURF CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== ZOOWURF CORE: rules 2, 3 x " + (2 * GAMES) + " computer games (2, 3, 4 players), seat advantage at most 5 points, normal beats beginner, 0 failures ===");
