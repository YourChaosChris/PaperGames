#!/usr/bin/env node
// Devilish Seven (teufelsieben-core.js, task 121):
//   - the deck: numbers 0..12, each as often as its value (0 once) = 79,
//     plus 11 special cards = 90;
//   - going bust on a number twice, the Rescue card, seven different
//     numbers end the round with the bonus, Pause, Second helping (three
//     cards; specials drawn then have no effect), +3, +5, Double;
//   - round points and game end (target), a tie;
//   - computer against computer: GAMES games (default 500) each with 2, 3,
//     4 and 6 players, levels mixed and rotated over the seats: no hang, no
//     rule error (cards conserved, points as computed); wins per level
//     (level 3 must win more often than level 1);
//   - the computer's chance counts only open cards: the same open cards
//     with a different hidden deck order give the same chance;
//   - save and load (JSON) in the middle of a game plays on.
const path = require("path");
const C = require(path.join(__dirname, "..", "teufelsieben-core.js"));
const GAMES = parseInt(process.env.GAMES || "500", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// The deck.
{
  const nums = C.DECK.filter((c) => typeof c === "number");
  check("79 number cards", nums.length === 79);
  for (let v = 0; v <= 12; v++) check("number " + v + " count", nums.filter((c) => c === v).length === Math.max(1, v));
  check("90 cards", C.DECK.length === 90);
  const sp = (k) => C.DECK.filter((c) => c === k).length;
  check("specials", sp("pause") === 2 && sp("helping") === 2 && sp("rescue") === 2 && sp("plus3") === 2 && sp("plus5") === 2 && sp("double") === 1);
}

// A state with a fixed deck (cards drawn from the front).
function fixed(players, deck, extra) {
  const s = C.newGame({ players, computer: [], target: 150 }, C.makeRng(1));
  // start a fresh round on a known deck
  const t = JSON.parse(JSON.stringify(s));
  t.hands = [];
  for (let i = 0; i < players; i++) t.hands.push({ numbers: [], extras: [], rescue: false, status: "in", forced: 0 });
  t.deck = deck.slice();
  t.discard = [];
  t.phase = "turn";
  t.dealQueue = null;
  t.current = 0;
  return Object.assign(t, extra || {});
}

// Bust, Rescue, seven numbers.
{
  let s = fixed(2, [5, 7, 5]);
  s = C.draw(s); // p0: 5
  s = C.draw(s); // p1: 7
  s = C.draw(s); // p0: 5 again -> bust
  check("bust on a number twice", s.hands[0].status === "bust" && C.handPoints(s.hands[0]) === 0);
  check("round goes on with the other player", s.phase === "turn" && s.current === 1);
  s = C.stop(s);
  check("round over when nobody is left", s.phase === "roundover" && s.roundPoints[0] === 0 && s.roundPoints[1] === 7);
  let r = fixed(2, ["rescue", 1, 4, 4, 2]);
  r = C.draw(r); // p0 rescue
  r = C.draw(r); // p1: 1
  r = C.draw(r); // p0: 4
  r = C.stop(r); // p1 stops
  r = C.draw(r); // p0: 4 again -> rescued
  check("Rescue saves once", r.hands[0].status === "in" && !r.hands[0].rescue && r.hands[0].numbers.join() === "4" && r.last.type === "rescued");
  let q = fixed(2, [1, 2, 3, 4, 5, 6, 0]);
  q.current = 0;
  q.hands[1].status = "stop";
  for (let k = 0; k < 7; k++) q = C.draw(q);
  check("seven numbers end the round with the bonus", q.phase === "roundover" && q.roundPoints[0] === 1 + 2 + 3 + 4 + 5 + 6 + 0 + C.BONUS);
}
// Points cards.
{
  let s = fixed(2, [10, 1, "double", 2, "plus3", 3, "plus5"]);
  for (let k = 0; k < 7; k++) s = C.draw(s);
  check("p0: 10, double, +3, +5", s.hands[0].numbers.join() === "10" && C.handPoints(s.hands[0]) === 10 * 2 + 3 + 5);
  check("p1: 1, 2, 3", C.handPoints(s.hands[1]) === 6);
}
// Pause and Second helping.
{
  let s = fixed(3, ["pause", 8, 9, 3, 4]);
  s = C.draw(s); // p0 gets pause
  check("Pause waits for a target", s.phase === "target" && C.targets(s).join() === "0,1,2");
  s = C.giveTo(s, 2);
  check("Pause stops player 3", s.hands[2].status === "stop" && s.phase === "turn" && s.current === 1);
  let h = fixed(2, [6, "helping", 1, "pause", 1, 9]);
  h = C.draw(h); // p0: 6
  h = C.draw(h); // p1: helping
  h = C.giveTo(h, 0); // p0 must take 3: 1, pause (void), 1 -> bust at third
  check("Second helping: three cards, Pause has no effect, bust on the third", h.hands[0].status === "bust" && h.discard.indexOf("pause") !== -1);
}
// Game end and tie.
{
  let s = fixed(2, [12, 12, 11, 11]);
  s.totals = [140, 140];
  s = C.draw(s); s = C.draw(s); s = C.stop(s); s = C.stop(s);
  check("tie at the end: both win", s.phase === "over" && s.winners.join() === "0,1" && C.outcomeFor(s, 0) === "draw");
  let t = fixed(2, [12, 1]);
  t.totals = [140, 0];
  t = C.draw(t); t = C.stop(t); t = C.draw(t); t = C.stop(t);
  check("game over at the target", t.phase === "over" && t.winners.join() === "0" && C.outcomeFor(t, 1) === "loss");
  check("next round only after a round", C.nextRound(t) === t);
}
// The chance counts only open cards.
{
  const s = fixed(2, [3, 4, 5, 6, 7, 8, 9]);
  s.hands[0].numbers = [12, 11];
  const a = C.bustChance(s, 0);
  const b = C.bustChance(Object.assign({}, s, { deck: s.deck.slice().reverse() }), 0);
  check("same chance for another hidden order", a === b);
  check("chance from the unseen cards: (11 + 10) / 88", Math.abs(a - 21 / 88) < 1e-9);
}

// Computer games.
const perLevel = { 1: { games: 0, wins: 0 }, 2: { games: 0, wins: 0 }, 3: { games: 0, wins: 0 } };
const rounds = {};
for (const n of [2, 3, 4, 6]) {
  let roundSum = 0;
  for (let g = 0; g < GAMES; g++) {
    const rng = C.makeRng(n * 100000 + g);
    const levels = [];
    for (let i = 0; i < n; i++) levels.push(1 + ((i + g) % 3));
    let s = C.newGame({ players: n, computer: new Array(n).fill(true), levels, target: 150 }, rng);
    let guard = 0, problem = null;
    while (s.phase !== "over" && guard++ < 20000) {
      const before = s;
      s = s.phase === "roundover" ? C.nextRound(s, rng) : C.aiStep(s, rng);
      if (s === before) { problem = "stuck in " + s.phase; break; }
      // cards conserved (after a round the hands stay on show, their cards
      // are already on the discard pile)
      let cards = s.deck.length + s.discard.length;
      if (s.phase !== "roundover" && s.phase !== "over") {
        s.hands.forEach((h) => { cards += h.numbers.length + h.extras.length + (h.rescue ? 1 : 0); });
      }
      if (s.pending) cards += 1;
      if (cards !== 90) { problem = "cards " + cards; break; }
      if (guard === 300) s = JSON.parse(JSON.stringify(s));
    }
    if (!problem && s.phase !== "over") problem = "no end";
    if (problem) { fails.push(n + " players, game " + g + ": " + problem); continue; }
    roundSum += s.round;
    for (let i = 0; i < n; i++) {
      perLevel[levels[i]].games++;
      if (s.winners.indexOf(i) !== -1 && s.winners.length === 1) perLevel[levels[i]].wins++;
    }
  }
  rounds[n] = (roundSum / GAMES).toFixed(1);
}
const rate = (l) => perLevel[l].games ? 100 * perLevel[l].wins / perLevel[l].games : 0;
console.log("wins per level (games won / games played): " + [1, 2, 3].map((l) => "level " + l + " " + rate(l).toFixed(1) + "% (" + perLevel[l].wins + "/" + perLevel[l].games + ")").join(", "));
console.log("rounds per game (target 150): " + Object.keys(rounds).map((n) => n + " players " + rounds[n]).join(", "));
check("level 3 beats level 1", rate(3) > rate(1));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== DEVILISH SEVEN CORE: deck, bust, rescue, seven, specials, points, end, " + GAMES + " computer games each for 2, 3, 4 and 6 players, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
