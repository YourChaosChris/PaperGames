// tests/skat-core.js
// Skat: fixed game values, then 1000 games between computers.
//
// 1. 32 fixed examples of game values and results (worked out by hand
//    from the official rules): matadors with/without, Hand, Schneider,
//    Schwarz, announcements, Ouvert, Null values, lost games (double) and
//    overbid games.
// 2. 1000 games, three computers, levels mixed. Each game must be played
//    by the rules: bids only from the list of game values and rising,
//    every card follows suit when it can (checked here separately), the
//    32 cards are all accounted for, the points add up to 120, and the
//    game value and result match a separate calculation in this test.
//
// Run: node tests/skat-core.js

const C = require("../skat-core.js");
const A = require("../skat-ai.js");

const fails = [];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const R = { "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14 };
const parse = (t) => ({ rank: R[t.slice(0, -1)], suit: t.slice(-1) });

// Twelve declarer cards with exactly the given trumps (rest: plain cards).
function cards12(type, trumps) {
  const out = trumps.split(" ").filter(Boolean).map(parse);
  const isT = (c) => C.isTrump({ type }, c);
  C.newDeck().forEach((c) => {
    if (out.length < 12 && !isT(c) && c.rank !== 11 && !out.some((x) => C.same(x, c))) out.push(c);
  });
  return out;
}

// [description, game, trumps of the declarer, bid, eyes, declarer tricks,
//  defender tricks, expected value, expected delta]
const G = (type, o) => Object.assign({ type, hand: false, schneider: false, schwarz: false, ouvert: false }, o || {});
const EXAMPLES = [
  ["Clubs with 2, game 3", G("C"), "JC JS", 18, 70, 6, 4, 36, 36],
  ["Clubs without 1, game 2", G("C"), "JS", 18, 61, 5, 5, 24, 24],
  ["Spades without 4, game 5", G("S"), "AS 10S 9S", 18, 75, 7, 3, 55, 55],
  ["Hearts with 1, game 2", G("H"), "JC AH 10H", 18, 61, 5, 5, 20, 20],
  ["Diamonds with 4, game 5", G("D"), "JC JS JH JD 10D", 18, 80, 7, 3, 45, 45],
  ["Diamonds with 5, game 6", G("D"), "JC JS JH JD AD", 18, 80, 7, 3, 54, 54],
  ["Grand with 4, game 5", G("grand"), "JC JS JH JD", 18, 70, 6, 4, 120, 120],
  ["Grand without 2, game 3", G("grand"), "JH", 18, 70, 6, 4, 72, 72],
  ["Grand Hand with 1, game 2, hand 3", G("grand", { hand: true }), "JC JH", 18, 66, 6, 4, 72, 72],
  ["Hearts Hand with 2, hand 4", G("H", { hand: true }), "JC JS AH", 18, 64, 6, 4, 40, 40],
  ["Clubs with 1, Schneider reached", G("C"), "JC JH", 18, 95, 8, 2, 36, 36],
  ["Clubs with 1, Schwarz reached", G("C"), "JC JH", 18, 120, 10, 0, 48, 48],
  ["Spades Hand without 3, Schneider announced and reached", G("S", { hand: true, schneider: true }), "JD AS", 18, 92, 8, 2, 77, 77],
  ["Spades Hand with 1, Schwarz announced and reached", G("S", { hand: true, schneider: true, schwarz: true }), "JC JH", 18, 120, 10, 0, 77, 77],
  ["Grand Ouvert with 2, Schwarz", G("grand", { hand: true, ouvert: true, schneider: true, schwarz: true }), "JC JS", 18, 120, 10, 0, 216, 216],
  ["Null won", G("null"), "", 18, null, 0, 10, 23, 23],
  ["Null Hand won", G("null", { hand: true }), "", 18, null, 0, 10, 35, 35],
  ["Null Ouvert won", G("null", { ouvert: true }), "", 18, null, 0, 10, 46, 46],
  ["Null Ouvert Hand won", G("null", { hand: true, ouvert: true }), "", 18, null, 0, 10, 59, 59],
  ["Diamonds without 1, game 2", G("D"), "JS JH", 18, 61, 4, 6, 18, 18],
  ["Hearts without 11 (no trump at all)", G("H"), "", 18, 62, 5, 5, 120, 120],
  ["Clubs with 11 (all trumps)", G("C"), "JC JS JH JD AC 10C KC QC 9C 8C 7C", 18, 61, 5, 5, 144, 144],
  ["Grand without 4", G("grand"), "", 18, 63, 5, 5, 120, 120],
  ["Clubs with 1 overbid: bid 30, value 24", G("C"), "JC JH", 30, 70, 6, 4, 36, -72],
  ["Hearts without 2 overbid: bid 33, value 30", G("H"), "JH", 33, 80, 7, 3, 40, -80],
  ["Spades with 2 lost with 50", G("S"), "JC JS", 18, 50, 4, 6, 33, -66],
  ["Hearts with 1 lost Schneider (25 points)", G("H"), "JC JH", 18, 25, 2, 8, 30, -60],
  ["Clubs Hand with 1, Schneider announced, only 70", G("C", { hand: true, schneider: true }), "JC JH", 18, 70, 6, 4, 48, -96],
  ["Diamonds Hand with 3, game 4, hand 5", G("D", { hand: true }), "JC JS JH", 18, 61, 5, 5, 45, 45],
  ["Grand with 3, Schneider reached", G("grand"), "JC JS JH", 18, 90, 8, 2, 120, 120],
  ["Grand Hand without 1", G("grand", { hand: true }), "JS JH", 18, 61, 5, 5, 72, 72],
  ["Null Ouvert lost", G("null", { ouvert: true }), "", 18, null, 1, 3, 46, -92],
  ["Exactly 60 is lost: Clubs with 1", G("C"), "JC JH", 18, 60, 5, 5, 24, -48]
];
EXAMPLES.forEach(([desc, game, trumps, bid, eyes, dt, ft, value, delta]) => {
  const r = C.score(game, cards12(game.type === "null" ? "C" : game.type, trumps), bid, eyes, dt, ft);
  if (r.value !== value || r.delta !== delta) fails.push(desc + ": value " + r.value + " delta " + r.delta + ", expected " + value + " / " + delta);
});

// Separate calculation for the game simulation.
function refValue(s) {
  const g = s.game;
  if (g.type === "null") return { won: s.trickCount[s.declarer] === 0, value: g.ouvert ? (g.hand ? 59 : 46) : (g.hand ? 35 : 23) };
  const ladder = ["JC", "JS", "JH", "JD"].concat(g.type === "grand" ? [] : ["A", "10", "K", "Q", "9", "8", "7"].map((r) => r + g.type)).map(parse);
  const has = (c) => s.declarerCards.some((x) => x.rank === c.rank && x.suit === c.suit);
  let m = 0;
  const first = has(ladder[0]);
  while (m < ladder.length && has(ladder[m]) === first) m++;
  const pts = { 14: 11, 10: 10, 13: 4, 12: 3, 11: 2 };
  const eyes = s.tricks[s.declarer].concat(s.discarded).reduce((t, c) => t + (pts[c.rank] || 0), 0);
  const d = s.declarer, ft = s.trickCount[(d + 1) % 3] + s.trickCount[(d + 2) % 3];
  const schneider = eyes >= 90 || eyes <= 30, schwarz = ft === 0 || s.trickCount[d] === 0;
  let level = m + 1 + (g.hand ? 1 : 0) + (schneider ? 1 : 0) + (g.schneider ? 1 : 0) + (schwarz ? 1 : 0) + (g.schwarz ? 1 : 0) + (g.ouvert ? 1 : 0);
  const base = { C: 12, S: 11, H: 10, D: 9, grand: 24 }[g.type];
  let value = level * base;
  let won = eyes > 60 && (!g.schneider || eyes >= 90) && (!g.schwarz || ft === 0);
  if (value < s.bid) { won = false; while (value < s.bid) value += base; value = Math.ceil(s.bid / base) * base; }
  return { won, value, eyes };
}

const stats = { games: 0, passedIn: 0, won: 0, lost: 0, overbid: 0, types: {}, hand: 0, maxValue: 0 };
const r = rng(58);
for (let g = 0; g < 1000; g++) {
  const levels = [1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3)];
  let s = C.deal(g % 3, r);
  const bids = [];
  let guard = 0;
  while (s.phase === "bid" && guard++ < 200) {
    const t = C.bidTurn(s);
    const ch = A.bidChoice(s, levels[t.player]);
    const before = s.bidding.bid;
    const n = C.bidAction(s, ch.action, ch.value);
    if (!n) { fails.push("game " + g + ": bad bid " + JSON.stringify(ch)); break; }
    if (ch.action === "bid" && t.kind === "bid") {
      if (C.BID_VALUES.indexOf(ch.value) === -1 || ch.value <= before) fails.push("game " + g + ": bid " + ch.value + " after " + before);
      bids.push(ch.value);
    }
    s = n;
  }
  stats.games++;
  if (s.phase === "over" && s.result.passedIn) { stats.passedIn++; continue; }
  if (s.phase !== "skat") { fails.push("game " + g + ": bidding did not end"); continue; }
  const lv = levels[s.declarer];
  if (A.wantsHand(s, lv)) {
    s = C.playHand(s);
    s = C.announce(s, { type: A.handGameChoice(s, lv) });
    stats.hand++;
  } else {
    s = C.takeSkat(s);
    const choice = A.discardAndGame(s, lv, r);
    s = C.discard(s, choice.discard);
    s = C.announce(s, { type: choice.type });
  }
  if (!s || s.phase !== "play") { fails.push("game " + g + ": could not announce"); continue; }
  stats.types[s.game.type] = (stats.types[s.game.type] || 0) + 1;
  while (s.phase === "play") {
    const p = s.turn;
    const card = A.chooseCard(s, levels[p], r, { samples: 3 });
    // Follow suit, checked here on its own.
    if (s.trick.length) {
      const g0 = s.game, led = s.trick[0].card;
      const grp = (c) => (g0.type !== "null" && (c.rank === 11 || (g0.type !== "grand" && c.suit === g0.type))) ? "T" : c.suit;
      if (grp(card) !== grp(led) && s.hands[p].some((c) => grp(c) === grp(led))) fails.push("game " + g + ": did not follow suit");
    }
    const n = C.playCard(s, card);
    if (!n) { fails.push("game " + g + ": illegal card"); break; }
    s = n;
  }
  if (s.phase !== "over") continue;
  const all = s.played.map((e) => e.card).concat(s.hands[0], s.hands[1], s.hands[2], s.discarded);
  if (all.length !== 32 || new Set(all.map((c) => c.rank + c.suit)).size !== 32) fails.push("game " + g + ": cards lost or doubled");
  if (s.game.type !== "null") {
    const pts = s.tricks.reduce((t, cs) => t + C.pointsOf(cs), 0) + C.pointsOf(s.discarded);
    if (pts !== 120) fails.push("game " + g + ": points add up to " + pts);
  }
  const ref = refValue(s);
  if (ref.won !== s.result.won || ref.value !== s.result.value) fails.push("game " + g + ": " + JSON.stringify(s.game) + " result " + s.result.won + "/" + s.result.value + ", expected " + ref.won + "/" + ref.value);
  if (s.result.deltas[s.declarer] !== (s.result.won ? s.result.value : -2 * s.result.value)) fails.push("game " + g + ": score");
  if (s.result.won) stats.won++; else stats.lost++;
  if (s.result.overbid) stats.overbid++;
  stats.maxValue = Math.max(stats.maxValue, s.result.value);
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 20).join("\n"));
  console.log("=== SKAT CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== SKAT CORE: " + EXAMPLES.length + " fixed game values, 1000 games, 0 failures ===");
