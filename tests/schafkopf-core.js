// tests/schafkopf-core.js
// Schafkopf: fixed scoring examples, then 1000 games between computers.
//
// 1. Fixed examples of the tariff (Sauspiel 10, Solo and Wenz 50, plus 10
//    each for Schneider, Schwarz and every Laufender) and of counting the
//    Laufende, worked out by hand.
// 2. 1000 games, four computers, levels mixed. Each must follow the rules,
//    checked here on its own: the trick goes to the right card (Obers,
//    Unters, then the trump suit; in the Wenz only the Unters), every card
//    follows suit when it can, the called Sow is played when its suit is
//    led, it is not thrown away before that (unless its holder ran away or
//    it is the last card), the 120 points are all counted, the score
//    matches a separate calculation and adds up to 0.
//
// Run: node tests/schafkopf-core.js

const C = require("../schafkopf-core.js");
const A = require("../schafkopf-ai.js");

const fails = [];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const R = { A: 14, "10": 10, K: 13, O: 12, U: 11, "9": 9, "8": 8, "7": 7 };
const parse = (t) => ({ rank: R[t.slice(0, -1)], suit: t.slice(-1) });
const cards = (str) => str.split(" ").filter(Boolean).map(parse);

// [description, game, player, partner, points, tricks, laufende, expected deltas]
const SAU = { type: "sau", suit: "C" }, SOLO = { type: "solo", suit: "S" }, WENZ = { type: "wenz" };
const SCORES = [
  ["Sauspiel won with 70", SAU, 0, 2, 70, 5, 0, [10, -10, 10, -10]],
  ["Sauspiel won Schneider (95)", SAU, 0, 2, 95, 6, 0, [20, -20, 20, -20]],
  ["Sauspiel won Schwarz", SAU, 1, 3, 120, 8, 0, [-30, 30, -30, 30]],
  ["Sauspiel lost with 60", SAU, 0, 1, 60, 4, 0, [-10, -10, 10, 10]],
  ["Sauspiel lost Schneider (30)", SAU, 0, 1, 30, 2, 0, [-20, -20, 20, 20]],
  ["Sauspiel lost Schwarz", SAU, 2, 3, 0, 0, 0, [30, 30, -30, -30]],
  ["Sauspiel won with 3 Laufende", SAU, 0, 2, 66, 5, 3, [40, -40, 40, -40]],
  ["Solo won with 70", SOLO, 1, -1, 70, 5, 0, [-50, 150, -50, -50]],
  ["Solo won Schneider, 4 Laufende", SOLO, 1, -1, 100, 7, 4, [-100, 300, -100, -100]],
  ["Solo lost with 55", SOLO, 3, -1, 55, 3, 0, [50, 50, 50, -150]],
  ["Wenz won with 2 Laufende", WENZ, 0, -1, 80, 6, 2, [210, -70, -70, -70]],
  ["Wenz lost Schwarz", WENZ, 2, -1, 0, 0, 0, [70, 70, -210, 70]],
  ["Exactly 61 wins", SAU, 0, 3, 61, 4, 0, [10, -10, -10, 10]],
  ["Exactly 60 loses", SAU, 0, 3, 60, 4, 0, [-10, 10, 10, -10]],
  ["90 is not Schneider", SAU, 0, 3, 90, 6, 0, [10, -10, -10, 10]],
  ["91 is Schneider", SAU, 0, 3, 91, 6, 0, [20, -20, -20, 20]],
  ["31 lost is not Schneider", SOLO, 0, -1, 31, 2, 0, [-150, 50, 50, 50]],
  ["30 lost is Schneider", SOLO, 0, -1, 30, 2, 0, [-180, 60, 60, 60]],
  ["Solo lost Schwarz with 3 Laufende", SOLO, 0, -1, 0, 0, 3, [-300, 100, 100, 100]]
];
SCORES.forEach(([d, g, pl, pa, pts, tr, lf, want]) => {
  const r = C.score(g, pl, pa, pts, tr, lf);
  if (JSON.stringify(r.deltas) !== JSON.stringify(want)) fails.push(d + ": " + JSON.stringify(r.deltas) + ", expected " + JSON.stringify(want));
  if (r.deltas.reduce((t, x) => t + x, 0) !== 0) fails.push(d + ": does not add up to 0");
});

// Laufende: [description, game, cards of the playing side, expected]
const LAUF = [
  ["Sauspiel with the three top Obers", SAU, "OC OS OH UD 7H", 3],
  ["Sauspiel without the three top Obers", SAU, "OD UC UH AH", 3],
  ["Sauspiel with two Obers only", SAU, "OC OS UC UH", 0],
  ["Sauspiel all 14 trumps", SAU, "OC OS OH OD UC US UH UD AH 10H KH 9H 8H 7H", 14],
  ["Wenz with the two top Unters", WENZ, "UC US AC AS", 2],
  ["Wenz with one Unter", WENZ, "UC UH AC", 0],
  ["Wenz without three Unters", WENZ, "UD AC 10C", 3],
  ["Solo Grass: Obers, Unters, Sow", SOLO, "OC OS OH OD UC US UH UD AS KS", 9]
];
LAUF.forEach(([d, g, cs, want]) => {
  const n = C.laufende(g, cards(cs));
  if (n !== want) fails.push(d + ": " + n + ", expected " + want);
});

// Separate trick winner for the games.
function refWinner(g, trick) {
  const trumpSuit = g.type === "sau" ? "H" : g.type === "solo" ? g.suit : null;
  const so = { C: 4, S: 3, H: 2, D: 1 };
  const plain = g.type === "wenz" ? { 14: 8, 10: 7, 13: 6, 12: 5, 9: 4, 8: 3, 7: 2 } : { 14: 8, 10: 7, 13: 6, 9: 4, 8: 3, 7: 2 };
  const val = (c, led) => {
    if (g.type !== "wenz" && c.rank === 12) return 1000 + so[c.suit];
    if (c.rank === 11) return 900 + so[c.suit];
    if (trumpSuit && c.suit === trumpSuit) return 500 + plain[c.rank];
    return c.suit === led ? plain[c.rank] : 0;
  };
  const isT = (c) => (g.type !== "wenz" && c.rank === 12) || c.rank === 11 || (trumpSuit && c.suit === trumpSuit);
  const led = isT(trick[0].card) ? "T" : trick[0].card.suit;
  let best = trick[0];
  trick.forEach((e) => { if (val(e.card, led) > val(best.card, led)) best = e; });
  return best.player;
}

const stats = { games: 0, thrownIn: 0, played: 0, won: 0, types: {}, ranAway: 0, sought: 0, laufende: 0, schneider: 0, schwarz: 0 };
const r = rng(59);
for (let gi = 0; gi < 1000; gi++) {
  const levels = [0, 1, 2, 3].map(() => 1 + Math.floor(r() * 3));
  let s = C.deal(gi % 4, r);
  const dealt = s.hands.map((h) => h.slice());
  while (s.phase === "announce") {
    const ch = A.announceChoice(s, levels[s.announceTurn]);
    const n = C.announce(s, ch);
    if (!n) { fails.push("game " + gi + ": bad announcement " + JSON.stringify(ch)); break; }
    s = n;
  }
  stats.games++;
  if (s.phase === "over") { stats.thrownIn++; continue; }
  stats.played++;
  stats.types[s.game.type] = (stats.types[s.game.type] || 0) + 1;
  const g = s.game;
  if (g.type === "sau") {
    const ph = dealt[s.player];
    if (ph.some((c) => c.suit === g.suit && c.rank === 14) || !ph.some((c) => c.suit === g.suit && c.rank !== 12 && c.rank !== 11)) fails.push("game " + gi + ": Sow may not be called");
  }
  const sow = g.type === "sau" ? { rank: 14, suit: g.suit } : null;
  let sought = false, ran = false;
  const isT = (c) => C.isTrump(g, c);
  let trick = [];
  while (s.phase === "play") {
    const p = s.turn;
    const hand = s.hands[p];
    const card = A.chooseCard(s, levels[p], r, { samples: 3 });
    // Rules, checked here on their own.
    if (trick.length) {
      const ledT = isT(trick[0].card), ledS = trick[0].card.suit;
      const followsLed = (c) => (ledT ? isT(c) : !isT(c) && c.suit === ledS);
      if (!followsLed(card) && hand.some(followsLed)) fails.push("game " + gi + ": did not follow suit");
      if (sow && !ledT && ledS === sow.suit && hand.some((c) => C.same(c, sow)) && !C.same(card, sow)) fails.push("game " + gi + ": did not play the called Sow");
      if (sow && C.same(card, sow) && !sought && !ran && hand.length > 1 && !followsLed(card)) fails.push("game " + gi + ": threw the Sow away early");
    } else if (sow && !isT(card) && card.suit === sow.suit) {
      if (!C.same(card, sow) && hand.some((c) => C.same(c, sow))) {
        if (hand.filter((c) => !isT(c) && c.suit === sow.suit).length < 4 && !sought && !ran) fails.push("game " + gi + ": led the called suit without running away");
        ran = true;
      }
      sought = true;
    }
    const n = C.playCard(s, card);
    if (!n) { fails.push("game " + gi + ": illegal card"); break; }
    trick.push({ player: p, card });
    if (trick.length === 4) {
      if (n.lastTrick.winner !== refWinner(g, trick)) fails.push("game " + gi + ": wrong trick winner");
      trick = [];
    }
    s = n;
  }
  if (s.phase !== "over") continue;
  const total = s.tricks.reduce((t, cs) => t + C.pointsOf(cs), 0);
  if (total !== 120) fails.push("game " + gi + ": points add up to " + total);
  // Separate score: side, points, tricks, Laufende from the dealt cards.
  const side = [0, 1, 2, 3].filter((p) => p === s.player || (g.type === "sau" && dealt[p].some((c) => C.same(c, sow))));
  const pts = side.reduce((t, p) => t + C.pointsOf(s.tricks[p]), 0);
  const tr = side.reduce((t, p) => t + s.trickCount[p], 0);
  const lf = C.laufende(g, side.reduce((a, p) => a.concat(dealt[p]), []));
  const want = C.score(g, s.player, side.find((p) => p !== s.player) === undefined ? -1 : side.find((p) => p !== s.player), pts, tr, lf);
  if (JSON.stringify(want.deltas) !== JSON.stringify(s.result.deltas)) fails.push("game " + gi + ": score " + JSON.stringify(s.result.deltas) + ", expected " + JSON.stringify(want.deltas));
  if (s.result.deltas.reduce((t, x) => t + x, 0) !== 0) fails.push("game " + gi + ": score does not add up to 0");
  if (s.result.won) stats.won++;
  if (ran) stats.ranAway++;
  if (sought) stats.sought++;
  if (s.result.laufende) stats.laufende++;
  if (s.result.schneider) stats.schneider++;
  if (s.result.schwarz) stats.schwarz++;
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 20).join("\n"));
  console.log("=== SCHAFKOPF CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== SCHAFKOPF CORE: " + SCORES.length + " fixed scores, " + LAUF.length + " Laufende examples, 1000 games, 0 failures ===");
