// tests/bridge-core.js
// Bridge: fixed scoring examples, then 500 deals between computers.
//
// 1. Fixed examples worked out by hand after Wikipedia ("Bridge scoring",
//    "Chicago (bridge card game)"): contract points, overtricks, doubled
//    and redoubled contracts, slams, undertricks, honours; Chicago
//    (vulnerability, game and fourth-deal part-score bonuses, part-scores
//    adding up to a game, passed-out deals) and rubber bonuses.
// 2. 500 deals (Chicago and rubber), levels mixed. Each must follow the
//    rules, checked here on their own: every call is allowed (a bid higher
//    than the last, double only an opponent's undoubled bid, redouble
//    only an opponent's double), the auction ends correctly, the declarer
//    is the first of the side to name the strain, every card follows suit
//    when it can, each card is played once, 13 tricks, the trick goes to
//    the right card, and the score matches a separate calculation.
//
// Run: node tests/bridge-core.js

const B = require("../bridge-core.js");
const A = require("../bridge-ai.js");

const fails = [];
let examples = 0;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const check = (name, got, want) => { examples++; if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(name + ": " + JSON.stringify(got) + ", expected " + JSON.stringify(want)); };
const C = (level, strain, doubled) => ({ level, strain, doubled: doubled || 0 });
// Total for the declaring side (positive) or the penalty (negative).
const tot = (sc) => (sc.made ? sc.below + sc.overtricks + sc.insult + sc.slam : -sc.penalty);

// Deal scores (no game bonus): [name, contract, vulnerable, tricks, expected total]
const DEALS = [
  ["1NT made", C(1, "N"), false, 7, 40],
  ["3NT made with an overtrick", C(3, "N"), false, 10, 130],
  ["4 spades made", C(4, "S"), false, 10, 120],
  ["2 hearts +2", C(2, "H"), false, 10, 120],
  ["5 clubs made", C(5, "C"), true, 11, 100],
  ["1 club made", C(1, "C"), false, 7, 20],
  ["2 diamonds doubled made", C(2, "D", 1), false, 8, 130],
  ["2 diamonds doubled +1 not vulnerable", C(2, "D", 1), false, 9, 230],
  ["2 diamonds doubled +1 vulnerable", C(2, "D", 1), true, 9, 330],
  ["1NT redoubled made", C(1, "N", 2), false, 7, 260],
  ["1NT redoubled +1 vulnerable", C(1, "N", 2), true, 8, 660],
  ["6 spades made not vulnerable", C(6, "S"), false, 12, 680],
  ["6 spades made vulnerable", C(6, "S"), true, 12, 930],
  ["7NT made vulnerable", C(7, "N"), true, 13, 1720],
  ["7 clubs made not vulnerable", C(7, "C"), false, 13, 1140],
  ["4 spades down 1", C(4, "S"), false, 9, -50],
  ["4 spades down 3 vulnerable", C(4, "S"), true, 7, -300],
  ["3NT doubled down 1", C(3, "N", 1), false, 8, -100],
  ["3NT doubled down 2", C(3, "N", 1), false, 7, -300],
  ["3NT doubled down 3", C(3, "N", 1), false, 6, -500],
  ["3NT doubled down 4", C(3, "N", 1), false, 5, -800],
  ["3NT doubled down 1 vulnerable", C(3, "N", 1), true, 8, -200],
  ["3NT doubled down 2 vulnerable", C(3, "N", 1), true, 7, -500],
  ["3NT doubled down 3 vulnerable", C(3, "N", 1), true, 6, -800],
  ["3NT redoubled down 1", C(3, "N", 2), false, 8, -200],
  ["3NT redoubled down 2 vulnerable", C(3, "N", 2), true, 7, -1000],
  ["7NT doubled down 13 vulnerable", C(7, "N", 1), true, 0, -3800],
  ["4 hearts doubled made vulnerable", C(4, "H", 1), true, 10, 290]
];
DEALS.forEach(([n, c, v, t, want]) => check(n, tot(B.dealScore(c, v, t)), want));
check("contract points 3NT", B.contractPoints(C(3, "N")), 100);
check("contract points 2 clubs doubled", B.contractPoints(C(2, "C", 1)), 80);

// A finished deal for the match functions: contract, declarer seat, tricks, honours.
const cards = (str) => str.split(" ").filter(Boolean).map((t) => ({ rank: { A: 14, K: 13, Q: 12, J: 11, T: 10 }[t[0]] || +t[0], suit: t[1] }));
function done(contract, declarer, tricks, original) {
  const s = B.deal({ dealer: 0 }, rng(1));
  if (original) s.original = original;
  s.phase = "over";
  s.contract = contract;
  s.declarer = declarer;
  s.dummy = B.partner(declarer);
  return Object.assign(s, { result: { declarer, contract, tricks, score: null, honours: B.honours(s.original, contract) } });
}
function play(m, contract, declarer, tricks, original) {
  const s = done(contract, declarer, tricks, original);
  s.result.score = B.dealScore(contract, B.vulnerability(m)[B.side(declarer)], tricks);
  return B.scoreDeal(m, s);
}
const noHon = [cards("2C 3C 4C 5C 6C 7C 8C 2D 3D 4D 5D 6D 7D"), cards("2H 3H 4H 5H 6H 7H 8H 2S 3S 4S 5S 6S 7S"),
  cards("9C TC JC 8D 9D TD JD 9H TH JH 8S JS AS"), cards("QC KC AC QD KD AD QH KH AH 9S TS QS KS")];
// Chicago, dealer North (side 0).
let m = B.newMatch("chicago", 0);
check("Chicago deal 1: nobody vulnerable", B.vulnerability(m), [false, false]);
let r = play(m, C(4, "S"), 2, 10, noHon);
check("Chicago deal 1: 4 spades made = 420", r.entry.points, [420, 0]);
m = r.match;
check("Chicago deal 2: dealer East, East-West vulnerable", B.vulnerability(m), [false, true]);
r = play(m, C(1, "N"), 0, 7, noHon);
check("Chicago deal 2: 1NT part-score, no bonus", r.entry.points, [40, 0]);
m = r.match;
check("Chicago deal 3: dealer South, North-South vulnerable", B.vulnerability(m), [true, false]);
r = play(m, C(2, "H"), 2, 8, noHon);
check("Chicago deal 3: 40 + 60 = game, vulnerable 500", r.entry.points, [560, 0]);
m = r.match;
check("Chicago deal 4: both vulnerable", B.vulnerability(m), [true, true]);
r = play(m, C(2, "C"), 1, 8, noHon);
check("Chicago deal 4: part-score bonus 100", r.entry.points, [0, 140]);
check("Chicago over after 4 deals", [r.match.over, r.match.totals, r.match.winner], [true, [1020, 140], 0]);
// Part-score on deal 4 that completes a game: game bonus, no part-score bonus.
m = B.newMatch("chicago", 0);
m = play(m, C(1, "N"), 1, 7, noHon).match;       // EW 40
m = play(m, C(2, "C"), 0, 8, noHon).match;       // NS 40
m = play(m, C(2, "H"), 0, 8, noHon).match;       // NS 60 -> 100 game (deal 3 dealer South, NS vulnerable)
check("Chicago: game resets both part-scores", m.below, [0, 0]);
r = play(m, C(3, "H"), 3, 9, noHon);
check("Chicago deal 4: 90 is a part-score after the reset, +100", r.entry.points, [0, 190]);
m = B.newMatch("chicago", 0);
m = play(m, C(2, "S"), 1, 8, noHon).match;       // EW 60
m = play(m, C(1, "D"), 0, 7, noHon).match;       // NS 20
m = play(m, C(1, "C"), 0, 7, noHon).match;       // NS 40
r = play(m, C(2, "D"), 1, 8, noHon);              // EW 60 + 40 = game, deal 4 both vulnerable
check("Chicago deal 4: part-score completing a game gets the game bonus", r.entry.points, [0, 540]);
// Down: penalty to the defenders.
m = B.newMatch("chicago", 0);
r = play(m, C(3, "N", 1), 0, 7, noHon);
check("Chicago: 3NT doubled down 2 to the defenders", r.entry.points, [0, 300]);
// Honours.
const hon4 = [cards("AS KS QS JS 2C 3C 4C 5C 6C 7C 8C 9C TC"), cards("2H 3H 4H 5H 6H 7H 8H 9H TH JH QH KH AH"),
  cards("TS 2D 3D 4D 5D 6D 7D 8D 9D TD JD QD KD"), cards("2S 3S 4S 5S 6S 7S 8S 9S AD JC QC KC AC")];
check("honours: four trump honours", B.honours(hon4, C(4, "S")), { seat: 0, side: 0, points: 100 });
check("honours: four aces in no trump", B.honours([cards("AS AH AD AC 2C 3C 4C 5C 6C 7C 8C 9C TC"), [], [], []], C(3, "N")), { seat: 0, side: 0, points: 150 });
check("honours: all five", B.honours([cards("AS KS QS JS TS 3C 4C 5C 6C 7C 8C 9C 2C"), [], [], []], C(2, "S")), { seat: 0, side: 0, points: 150 });
check("honours: none", B.honours(noHon, C(4, "S")), null);
m = B.newMatch("chicago", 0);
r = play(m, C(4, "S"), 1, 10, hon4);
check("Chicago: honours count for the defenders too", r.entry.points, [100, 420]);
// Passed out.
m = B.newMatch("chicago", 2);
let sp = B.dealFor(m, rng(3));
["pass", "pass", "pass", "pass"].forEach(() => { sp = B.applyCall(sp, { type: "pass" }); });
check("passed out after four passes", sp.result, { passedOut: true });
r = B.scoreDeal(m, sp);
check("passed out: same dealer, deal not counted", [r.match.dealer, r.match.deal, r.entry.points], [2, 0, [0, 0]]);
// Rubber.
m = B.newMatch("rubber", 0);
m = play(m, C(4, "H"), 0, 10, noHon).match;
check("rubber: game won, North-South vulnerable", B.vulnerability(m), [true, false]);
r = play(m, C(3, "N"), 2, 9, noHon);
check("rubber: 2-0 = 700", [r.entry.points, r.match.over, r.match.winner], [[800, 0], true, 0]);
m = B.newMatch("rubber", 0);
m = play(m, C(4, "H"), 0, 10, noHon).match;
m = play(m, C(5, "D"), 1, 11, noHon).match;
r = play(m, C(4, "S"), 3, 10, noHon);
check("rubber: 2-1 = 500", [r.entry.points, r.match.games], [[0, 620], [1, 2]]);
// Auction rules.
let s = B.deal({ dealer: 0 }, rng(5));
check("double not allowed at the start", B.legalCall(s, { type: "double" }), false);
s = B.applyCall(s, { type: "bid", level: 1, strain: "H" });
check("1 club after 1 heart not allowed", B.legalCall(s, { type: "bid", level: 1, strain: "C" }), false);
check("1 spade after 1 heart allowed", B.legalCall(s, { type: "bid", level: 1, strain: "S" }), true);
check("opponent may double", B.legalCall(s, { type: "double" }), true);
s = B.applyCall(s, { type: "double" });
check("partner of the bidder may redouble", B.legalCall(s, { type: "redouble" }), true);
s = B.applyCall(s, { type: "pass" });
check("doubler's partner may not redouble", B.legalCall(s, { type: "redouble" }), false);
s = B.applyCall(s, { type: "bid", level: 1, strain: "S" });
s = B.applyCall(s, { type: "bid", level: 2, strain: "H" });
s = B.applyCall(s, { type: "pass" });
s = B.applyCall(s, { type: "pass" });
s = B.applyCall(s, { type: "pass" });
check("declarer: first of the side to name hearts (North)", [s.phase, s.declarer, s.contract], ["play", 0, C(2, "H")]);

/*** 500 deals ***/

function refScore(c, vul, tricks) {
  const need = c.level + 6, mult = [1, 2, 4][c.doubled];
  if (tricks >= need) {
    const per = c.strain === "C" || c.strain === "D" ? 20 : 30;
    const below = (c.strain === "N" ? 10 : 0) + per * c.level * 1;
    const over = tricks - need;
    const overPts = c.doubled ? over * (vul ? 200 : 100) * (c.doubled === 2 ? 2 : 1) : over * per;
    const slam = c.level === 6 ? (vul ? 750 : 500) : c.level === 7 ? (vul ? 1500 : 1000) : 0;
    return below * mult + overPts + [0, 50, 100][c.doubled] + slam;
  }
  const down = need - tricks;
  if (!c.doubled) return -down * (vul ? 100 : 50);
  const steps = vul ? [200, 300, 300] : [100, 200, 200, 300];
  let t = 0;
  for (let i = 0; i < down; i++) t += steps[Math.min(i, steps.length - 1)];
  return -t * (c.doubled === 2 ? 2 : 1);
}

const stats = { deals: 0, passedOut: 0, contracts: {}, made: 0, down: 0, doubled: 0, redoubled: 0, slams: 0, games: 0, matches: 0, nsWins: 0, ewWins: 0 };
const g = rng(61);
let match = null, levels = null, mi = 0;
for (let di = 0; di < 500; di++) {
  if (!match || match.over) {
    if (match) { stats.matches++; if (match.winner === 0) stats.nsWins++; if (match.winner === 1) stats.ewWins++; }
    match = B.newMatch(mi % 3 === 2 ? "rubber" : "chicago", mi % 4);
    levels = [0, 1, 2, 3].map(() => 1 + Math.floor(g() * 3));
    mi++;
  }
  let s = B.dealFor(match, g);
  const orig = s.hands.map((h) => h.slice());
  // Auction, checked on its own.
  let lastBid = null, lastAct = null;
  while (s.phase === "auction") {
    const seat = s.turn;
    const call = A.chooseCall(s, levels[seat], g);
    if (call.type === "bid") {
      if (lastBid && (call.level - 1) * 5 + B.STRAINS.indexOf(call.strain) <= (lastBid.call.level - 1) * 5 + B.STRAINS.indexOf(lastBid.call.strain)) fails.push("deal " + di + ": bid not higher");
    } else if (call.type === "double") {
      if (!lastAct || lastAct.call.type !== "bid" || lastAct.seat % 2 === seat % 2) fails.push("deal " + di + ": wrong double");
    } else if (call.type === "redouble") {
      if (!lastAct || lastAct.call.type !== "double" || lastAct.seat % 2 === seat % 2) fails.push("deal " + di + ": wrong redouble");
    }
    const n = B.applyCall(s, call);
    if (!n) { fails.push("deal " + di + ": illegal call " + JSON.stringify(call)); break; }
    if (call.type !== "pass") lastAct = { seat, call };
    if (call.type === "bid") lastBid = { seat, call };
    s = n;
  }
  stats.deals++;
  if (s.phase === "over" && s.result && s.result.passedOut) {
    stats.passedOut++;
    if (lastBid) fails.push("deal " + di + ": passed out with a bid");
    match = B.scoreDeal(match, s).match;
    continue;
  }
  if (s.phase !== "play") { fails.push("deal " + di + ": auction did not end"); continue; }
  const a = s.auction;
  if (!a.slice(-3).every((x) => x.call.type === "pass")) fails.push("deal " + di + ": auction ended without three passes");
  const decSide = lastBid.seat % 2;
  const firstNamer = a.find((x) => x.call.type === "bid" && x.call.strain === lastBid.call.strain && x.seat % 2 === decSide).seat;
  if (s.declarer !== firstNamer) fails.push("deal " + di + ": wrong declarer");
  const wantDoubled = lastAct.call.type === "double" ? 1 : lastAct.call.type === "redouble" ? 2 : 0;
  if (s.contract.doubled !== wantDoubled) fails.push("deal " + di + ": wrong doubling");
  if (s.turn !== (s.declarer + 1) % 4) fails.push("deal " + di + ": wrong opening leader");
  stats.contracts[s.contract.level + s.contract.strain] = (stats.contracts[s.contract.level + s.contract.strain] || 0) + 1;
  if (s.contract.doubled === 1) stats.doubled++;
  if (s.contract.doubled === 2) stats.redoubled++;
  if (s.contract.level >= 6) stats.slams++;
  // Play, checked on its own.
  const trump = s.contract.strain === "N" ? null : s.contract.strain;
  const seen = new Set();
  let trick = [], won = [0, 0];
  while (s.phase === "play") {
    const seat = s.turn;
    const hand = s.hands[seat];
    const card = A.chooseCard(s, levels[B.controller(s, seat)], g, { samples: 1 });
    if (trick.length && card.suit !== trick[0].card.suit && hand.some((c) => c.suit === trick[0].card.suit)) fails.push("deal " + di + ": did not follow suit");
    const key = card.rank + card.suit;
    if (seen.has(key)) fails.push("deal " + di + ": card played twice");
    seen.add(key);
    if (!orig[seat].some((c) => c.rank === card.rank && c.suit === card.suit)) fails.push("deal " + di + ": card not in hand");
    const n = B.playCard(s, card);
    if (!n) { fails.push("deal " + di + ": illegal card"); break; }
    trick.push({ seat, card });
    if (trick.length === 4) {
      let best = trick[0];
      trick.forEach((e) => {
        if (e.card.suit === best.card.suit ? e.card.rank > best.card.rank : e.card.suit === trump) best = e;
      });
      if (n.lastTrick.winner !== best.seat) fails.push("deal " + di + ": wrong trick winner");
      if (n.phase === "play" && n.turn !== best.seat) fails.push("deal " + di + ": winner does not lead");
      won[best.seat % 2]++;
      trick = [];
    }
    s = n;
  }
  if (won[0] + won[1] !== 13 || seen.size !== 52) fails.push("deal " + di + ": " + (won[0] + won[1]) + " tricks, " + seen.size + " cards");
  const vul = B.vulnerability(match)[decSide];
  const want = refScore(s.contract, vul, won[decSide]);
  if (tot(s.result.score) !== want) fails.push("deal " + di + ": score " + tot(s.result.score) + ", expected " + want + " " + JSON.stringify(s.contract) + " " + won[decSide]);
  if (want > 0) stats.made++; else stats.down++;
  const before = match;
  const res = B.scoreDeal(match, s);
  const sum = res.entry.points[0] + res.entry.points[1];
  const totDiff = res.match.totals[0] - before.totals[0] + res.match.totals[1] - before.totals[1];
  if (sum !== totDiff) fails.push("deal " + di + ": totals do not add up");
  if (res.entry.game !== undefined) stats.games++;
  match = res.match;
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 25).join("\n"));
  console.log("=== BRIDGE CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== BRIDGE CORE: " + examples + " fixed examples, 500 deals, 0 failures ===");
