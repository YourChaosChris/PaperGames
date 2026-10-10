// tests/poker-core.js
// Texas Hold'em: hand values and whole games.
//
// 1. A fixed list of 200 seven-card hands (20 per category, built so that
//    the category is known) must get the right category.
// 2. Fixed pairs of hands must compare the right way (win or tie).
// 3. 3000 random seven-card hands are compared pairwise with a separate,
//    slower reference (best of the 21 five-card hands), and the shown best
//    five cards must score the same as the hand.
// 4. 2000 games between computers (2 to 4 players, levels mixed): every
//    action must be legal, the chips must always add up to the same total,
//    no stack or bet may go below 0, and the pot must be shared out in full.
//
// Run: node tests/poker-core.js

const P = require("../poker-core.js");
const A = require("../poker-ai.js");

const fails = [];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const R = "23456789TJQKA";
const parse = (str) => str.split(" ").map((t) => ({ rank: R.indexOf(t[0]) + 2, suit: t[1] }));
const show = (cs) => cs.map((c) => R[c.rank - 2] + c.suit).join(" ");

// 1. [hand, category] - 9 royal flush ... 0 high card.
const HANDS = [
  ["5C AH KH QH JH TH 7C", 9],
  ["AH TH 4H KH JH 4C QH", 9],
  ["AD KD 4H QD JD 2S TD", 9],
  ["JS 4C QS TS KS AS 2S", 9],
  ["5S TC 6H JC QC KC AC", 9],
  ["JD KD AD QD 3S TD 9C", 9],
  ["AH KH TH 4D JH QH 6C", 9],
  ["AD QD TD JD KD 6C 5H", 9],
  ["TS KS QS AS JS 4C AD", 9],
  ["2S AH KH 8C QH JH TH", 9],
  ["AS QS 3D 2C KS TS JS", 9],
  ["KD KH AH JH QH TH 3H", 9],
  ["JC AC KC TC TS QC 2H", 9],
  ["AC TC QD JC QC 2D KC", 9],
  ["QS KS AS JS TS 7D JD", 9],
  ["QC AS JC 6C KC AC TC", 9],
  ["JS AS QS TS KS 7C 5S", 9],
  ["AS KC TS QS JS KS 9S", 9],
  ["AC KC 4D QC JC TC 5D", 9],
  ["5D AH JH 7S KH QH TH", 9],
  ["5S 6S 2C 4S 7S 8S TH", 8],
  ["4D 2D AD 5D 3D 5H JC", 8],
  ["JD 7C TC 6C 9C 8C 7H", 8],
  ["2H 7S 8S 9S 7C TS JS", 8],
  ["TS 4C QH 9S 8S 6S 7S", 8],
  ["6D 4C 7D 8D 9D TD JD", 8],
  ["8S 9S JC 7C TS JS 7S", 8],
  ["AH 7C 8C 4C 5C TC 6C", 8],
  ["KC JD QD TD 8S 9D KD", 8],
  ["KD 5C 4C TC 8C 7C 6C", 8],
  ["6C 9C 5C 7C AS 8C 5H", 8],
  ["3H 4H 2H 3S 5H AH KH", 8],
  ["KC QH JH 8H TH 2H 9H", 8],
  ["7S AS 6C 8C 4C 5C 7C", 8],
  ["9C QC 8C 3D JC TC KH", 8],
  ["2H 8H QH JH TH 9H AD", 8],
  ["8C AS 2S 3S JD 4S 5S", 8],
  ["8C JC KH TC QC 9C 5C", 8],
  ["TS 9S 7S 5H 8S 6S 7H", 8],
  ["3S KH 9C 2S 4S 5S 6S", 8],
  ["TD 7S 7D 7C AS 7H 3C", 7],
  ["3C JD AS JS JH JC 6D", 7],
  ["2C QS 2D 7D JD 2H 2S", 7],
  ["3C 3S 3H 5S 3D 5C 9C", 7],
  ["TD 7C 7D 5C 7H 7S KD", 7],
  ["9C TD 9D 9S 9H 6H KS", 7],
  ["7C 5C 5D 5H 5S AH 3S", 7],
  ["6C AH 9H AS 8S AC AD", 7],
  ["3C AS 2S 6D 6H 6C 6S", 7],
  ["9H 9D AC AD 3D AH AS", 7],
  ["KC 4C 4S 2D 4H 4D 7C", 7],
  ["3S 2C 3H 4S 3D AS 3C", 7],
  ["QC 6S JS 9D 6C 6H 6D", 7],
  ["QS JC QH QD 9S QC 8H", 7],
  ["6D 6H 5S AD 6C JD 6S", 7],
  ["QD QH QC 8S 4C 7D QS", 7],
  ["5C AD JC 5H 5S JS 5D", 7],
  ["6C 6S 6D JS 6H 3D 5D", 7],
  ["TC JC TH JH 7D TS TD", 7],
  ["6D 2S 9D 9S 7C 9C 9H", 7],
  ["JH 3C 3S 9H 3D 9C 4C", 6],
  ["KH KS AH 4H 5S 5C 5D", 6],
  ["5H 9S 9D 9H 6S 6C QH", 6],
  ["2S 3D TS 2D 2C 8H 8C", 6],
  ["AH AS 3H AD 6D 3C 4C", 6],
  ["KH 9S 9C KD TD QH KC", 6],
  ["5D 5H 8D AC 8C 5S 8S", 6],
  ["TC AS 8C AC 8D 8H 7D", 6],
  ["KH KS 5H 5D AD 5C 3C", 6],
  ["QS QC AH QH AD 2S 3S", 6],
  ["2H 2C JD JS JH 4C 7C", 6],
  ["7D QS 7H 3D QC 7S TC", 6],
  ["9D TS JH 2D TD JC TH", 6],
  ["QH 7D 8C 7S 7H QC 4S", 6],
  ["5C KD TD TS 5S KH KC", 6],
  ["9S 7C 6H 4S 7S 6D 6C", 6],
  ["9S 5S KD 9H 5C 4D 9D", 6],
  ["5S 5H KH 7D 5C 9S 7S", 6],
  ["JH 6S AH AC AS 6D 3S", 6],
  ["QD 9D 5D 8H 5C 5H 9S", 6],
  ["8C QD 4D 5D TD KD AD", 5],
  ["2H 6H 7H JH KD QS 8H", 5],
  ["JS QS 9S 7S 8S 8D 6D", 5],
  ["3D 6D QD 2D AD JC TD", 5],
  ["QS JS 5S 9S TS QC 8D", 5],
  ["QH 7H JH 9H KH 5S 5H", 5],
  ["5C JC 5D TC 4C 6C 9C", 5],
  ["3H 7H QH 6H 9H JC TH", 5],
  ["2C KC 7C 5C QC JD 3S", 5],
  ["7H 4H 9D 8D KH 2H 8H", 5],
  ["8C 2C TC 3C JC KD 6D", 5],
  ["6S JS 5C KS 2S KD 7S", 5],
  ["AH 9H KH 3C JH 4H 3H", 5],
  ["TS AS QS 8S JS 5C 4H", 5],
  ["2S KS 3C AS 5S 9S 8H", 5],
  ["5D TD QD JD AS 7H 4D", 5],
  ["2H 6D KD 7C 8D JD TD", 5],
  ["8H 2H QH 9H KH 4H QD", 5],
  ["9D 9C KC 4C JC TC 8D", 5],
  ["7S 9C 4C 5S AS 9S 8S", 5],
  ["8S 9H TC 3D 3H 7S JH", 4],
  ["9H TC JD QC KS 3H 6S", 4],
  ["3H 4S 4D KS 5H 6C 7H", 4],
  ["9C 8H KC 5S QD 6H 7D", 4],
  ["4C 8D KS 5S 7S 6C 9C", 4],
  ["5C 4D 3S 2H AD AH 2D", 4],
  ["8C 4S 3H 7C 9H JH TC", 4],
  ["7D QS 8H 9D 9C 6S 5H", 4],
  ["TD 9D 2S 6D 7H KD 8S", 4],
  ["JC TS 9D 7D 8H 7S 2D", 4],
  ["8D 4D 5H 6H 7D 3H 3C", 4],
  ["6D 8C 4D 2C 7H 5C 5D", 4],
  ["2H 4S 5H 3D 6C 9S 2S", 4],
  ["5D 4C 3C 2S 5H 6S 4D", 4],
  ["6S TC 2H 3S 4D 5C 5H", 4],
  ["KC JS QH 8D 9D TH TD", 4],
  ["8D 9H 5C 7D 7C 6C TH", 4],
  ["7H 8S KS JH TD 9C QH", 4],
  ["3H 6S 3S 5D 2S 4D 7C", 4],
  ["JH QD AH 6C KH TC 9H", 4],
  ["5H 5C JS QS 5S 6H 3S", 3],
  ["8S 7S 8D 3S 8H 2C 5H", 3],
  ["5H 2D 4C 7D 5S 8C 5D", 3],
  ["5D 5H 5C 2C 7D 4S 8C", 3],
  ["KC KD AS 8H KH 5H 2D", 3],
  ["9S 7D 3C QH 4H 4D 4C", 3],
  ["JD JH JS AD KH 4C 5H", 3],
  ["5S 7H 5C 5H QS JD 4C", 3],
  ["6D 6C 4C AD 6H 9C QH", 3],
  ["6H QC QD QH TD 4S AC", 3],
  ["JS 8S QC 2D 2H 5C 2S", 3],
  ["AS 4H 7D TD 4D 2H 4C", 3],
  ["7D 4D 7C QC 7S 2C TS", 3],
  ["6H QH QC QD KD AC 3S", 3],
  ["4D 5C 7C 6S JS 7S 7D", 3],
  ["JS JC JH 2D 9C KC 3H", 3],
  ["QC QH JC 9H TS QS 5H", 3],
  ["AC 9S 6C AD AS 4C QD", 3],
  ["7C 6S 3D AC 7D JC 7H", 3],
  ["JD 9H JC 4S 7H JH 6C", 3],
  ["2D 8D AH JD AS 8C 7D", 2],
  ["2C 5D 4H JC JD 6H 6S", 2],
  ["3S 3H 6H 4C 6S TC TD", 2],
  ["3C 3D KH QH QS JC AS", 2],
  ["3S 5S 5H 8D KS 8C JD", 2],
  ["3S 2S 3H QS 9H JD JC", 2],
  ["2H 9D 2S 9C 4D 4S AC", 2],
  ["AS 9S TH 7D 9H 2D 2C", 2],
  ["4C QC JC JD 9H 9S 2H", 2],
  ["7C 2S 5S QD 7D 3H 3S", 2],
  ["QS KS KH AD AC JC 2D", 2],
  ["8H 4H AD 4S 9H 3C 3D", 2],
  ["TC 9D 5S 5H 9H TD KH", 2],
  ["2S 2H 9D 9C AS QC 7D", 2],
  ["AS AH 3D 3C KC QC 9H", 2],
  ["KS 8S KH TS 5C TC 5D", 2],
  ["4H 4S AH 8D 9C AD 8C", 2],
  ["QS QH 2D 9D 4C 2C 5C", 2],
  ["4D TH AC JC TS 4C 3D", 2],
  ["4H 7S 5S 7H TC TD 3D", 2],
  ["2S 6C QD TD KH 8C KS", 1],
  ["8D 6D 7S 2H AH TS AS", 1],
  ["3S 8D QD 6H QS JS 5S", 1],
  ["8C JD QC KC 3H 4D JS", 1],
  ["2S 2D 5S 4C AD KH 6H", 1],
  ["6H 4C 3S 8H 9H 9S QD", 1],
  ["2S AD 6S 5H 5S KH 4S", 1],
  ["5D 4S 6H JC AS AC 7H", 1],
  ["AD TS TC 8C 6S QS 5C", 1],
  ["4S 4C KH 3H 5H 2S 7D", 1],
  ["7S 9H 6C 7H QH 3S TH", 1],
  ["8D JC QS 7D AD 3H AS", 1],
  ["JD QS 3C KS 5C QD TS", 1],
  ["5H 9S 6S JH KS 9H TC", 1],
  ["6H 7C TH 3H TS KS AC", 1],
  ["9S 9D 6H 2C JD AH TH", 1],
  ["KS KC 9S 7S 4H 5D QD", 1],
  ["4C AC 6H 7C QH QS JH", 1],
  ["KC KS 2H QD 7S AC 6H", 1],
  ["QC 4D 8H 5C JD JS 6H", 1],
  ["6S 8H TC AH 7D 2S KH", 0],
  ["3D TS 6H JS QD 7H 8C", 0],
  ["6C AH 5C QD JD 8C KD", 0],
  ["TH 6D 8H 9D KC QC AC", 0],
  ["5C 6S JC AH 3H 2C 7D", 0],
  ["QC 6H 9H 4D AS KS 3H", 0],
  ["QC TD KD 4S 5C 7S 3C", 0],
  ["4C 7D TS AC KS 5D QS", 0],
  ["6D QD 7D KH 8H 5S JH", 0],
  ["2C JS 8S QH KC 7D 4C", 0],
  ["2H AS 9D JC 5C TC 8D", 0],
  ["JC QH 5C 7C KS 9S 6S", 0],
  ["7D 9C 5S 2H KS 3D AC", 0],
  ["7S QS 6D 5D 2D 9D JH", 0],
  ["8H JH 4C 3S AH QS 5S", 0],
  ["5S JD 8S 7H QS KC 3S", 0],
  ["4D KC TD AC QS 8S 9C", 0],
  ["9H QH 6D KS 3S TD 8C", 0],
  ["7D KC AD JD 5S 6C 9H", 0],
  ["4S AS TS 2C 9C QD 7S", 0],
];
HANDS.forEach(([h, cat]) => {
  const got = P.categoryOf(P.evaluate(parse(h)));
  if (got !== cat) fails.push("category of " + h + ": " + got + ", expected " + cat);
  const b = P.bestFive(parse(h));
  if (b.category !== cat || b.name !== P.HAND_NAMES[cat]) fails.push("best five of " + h + ": " + b.name);
});

// 2. [hand a, hand b, expected: 1 a wins, -1 b wins, 0 tie]
const PAIRS = [
  ["AS AH KD 7C 5S 3H 2D", "KS KH AD 7D 5C 3S 2C", 1],      // pair of aces beats pair of kings
  ["AS AH KD 7C 5S 3H 2D", "AD AC QD 7D 5C 3S 2C", 1],      // same pair, king kicker beats queen
  ["AS AH KD 7C 5S 3H 2D", "AD AC KS 7D 5C 3S 2C", 0],      // same five cards in value: tie
  ["9S 9H 4D 4C AS 3H 2D", "9D 9C 4S 4H KS 3C 2C", 1],      // two pair, ace kicker
  ["9S 9H 4D 4C AS 3H 2D", "8D 8C 7S 7H AD 3C 2C", 1],      // nines up beats eights up
  ["9S 9H 4D 4C 3S 3H AD", "9D 9C 4S 4H 2S 2H AC", 0],      // best two pairs and kicker equal
  ["5S 5H 5D KC 2S 7H 9D", "4S 4H 4D AC KS 7C 9C", 1],      // higher three of a kind
  ["5D 4C 3H 2S AD KH QC", "6D 5C 4H 3S 2D KC QD", -1],     // five-high straight loses to six-high
  ["TD JC QH KS AD 2H 3C", "9D TC JH QS KD 2C 3D", 1],      // ace-high straight
  ["TD JC QH KS AD 2H 3C", "TH JD QC KD AS 4C 5D", 0],      // two ace-high straights tie
  ["2S 5S 7S 9S JS AH AD", "2H 5H 7H 9H TH AS AC", 1],      // flush jack high beats ten high
  ["2S 5S 7S 9S JS QS 3D", "2H 5H 7H 9H JH TH 3C", 1],      // flush of six: best five count
  ["KS KH KD 2S 2H 3C 4D", "QS QH QD AS AH 3D 4C", 1],      // full house by the three of a kind
  ["KS KH KD 2S 2H 3C 3D", "KC KH KD 2C 2D 4C 5D", 1],      // kings full of threes beats kings full of twos
  ["KS KH KD QS QH QC 2D", "KC KH KD QC QD 2C 3D", 0],      // both kings full of queens
  ["7S 7H 7D 7C 2S 3H 4D", "6S 6H 6D 6C AS KH QD", 1],      // higher four of a kind
  ["7S 7H 7D 7C AS 3H 4D", "7S 7H 7D 7C KS QH JD", 1],      // same four, ace kicker
  ["5H 4H 3H 2H AH KD KC", "6S 5S 4S 3S 2S AD AC", -1],     // straight flush six high beats five high
  ["AS KS QS JS TS 2H 3D", "KH QH JH TH 9H AD AC", 1],      // royal flush beats king-high straight flush
  ["AS KD QH JC 9S 7H 5D", "AH KC QD JS 9H 7C 4D", 0],      // high card: only the best five count
  ["AS KD QH JC 9S 7H 5D", "AH KC QD JS 8H 7C 6D", 1],      // high card: 9 beats 8 in fifth place
  ["2S 2H 2D 3C 3S 3H 4D", "AS AH KD KC QS QH 4C", 1],      // full house beats two pair
  ["9S 9H 4D 4C 3S 3H 3D", "9D 9C 4S 4H 2S 2H AC", 1],      // full house (threes full of nines) beats two pair
  ["2S 3S 4S 5S 7S 6H 8D", "2H 3H 4H 5H 7H 8C 9D", 0],      // both seven-high flushes; the straight does not count
  ["AS 2D 3H 4C 5S 6D KH", "2C 3D 4S 5H 6C 7D KS", -1],     // six-high straight vs seven-high straight
  ["QS QH JD JC TS TH 9D", "QD QC JS JH 8S 8H AD", -1],     // two pair queens and jacks: ace kicker beats ten
  ["8S 8H 8D AC KS QH 2D", "8C 8H 8D AS KC JH 2C", 0],      // trips with A K kickers: queen or jack is not in the best five
  ["AS AH AD AC 2S 2H 2D", "AS AH AD AC KS 2H 2D", -1],     // four aces: king kicker beats two
  ["TS JS QS KS 9S 8S 7S", "TH JH QH KH 9H 2C 3D", 0],      // both king-high straight flushes
  ["3S 3H 5D 5C 7S 7H KD", "3D 3C 5S 5H 7D 7C QD", 1]       // two best pairs equal, king kicker beats queen
];
PAIRS.forEach(([a, b, want]) => {
  const d = Math.sign(P.evaluate(parse(a)) - P.evaluate(parse(b)));
  if (d !== want) fails.push("compare " + a + " | " + b + ": " + d + ", expected " + want);
});

// 3. Reference: best of 21 five-card hands, as rank lists.
function ref5(cs) {
  const rk = cs.map((c) => c.rank).sort((x, y) => y - x);
  const fl = cs.every((c) => c.suit === cs[0].suit);
  const cnt = {};
  rk.forEach((x) => { cnt[x] = (cnt[x] || 0) + 1; });
  const groups = Object.keys(cnt).map(Number).sort((x, y) => cnt[y] - cnt[x] || y - x);
  const uniq = Array.from(new Set(rk));
  let st = 0;
  if (uniq.length === 5) { if (uniq[0] - uniq[4] === 4) st = uniq[0]; if (uniq.join() === "14,5,4,3,2") st = 5; }
  const pat = groups.map((g) => cnt[g]).join("");
  if (st && fl) return [st === 14 ? 9 : 8, st];
  if (pat === "41") return [7].concat(groups);
  if (pat === "32") return [6].concat(groups);
  if (fl) return [5].concat(rk);
  if (st) return [4, st];
  if (pat === "311") return [3].concat(groups);
  if (pat === "221") return [2].concat(groups);
  if (pat === "2111") return [1].concat(groups);
  return [0].concat(rk);
}
const cmp = (x, y) => { for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return Math.sign(d); } return 0; };
function ref7(cs) {
  let best = null;
  for (let a = 0; a < 7; a++) for (let b = a + 1; b < 7; b++) {
    const v = ref5(cs.filter((_, i) => i !== a && i !== b));
    if (!best || cmp(v, best) > 0) best = v;
  }
  return best;
}
const r3 = rng(3);
let prev = null;
for (let t = 0; t < 3000; t++) {
  const h = P.shuffle(P.newDeck(), r3).slice(0, 7);
  const b = P.bestFive(h);
  if (b.score !== P.evaluate(h)) fails.push("best five of " + show(h) + " scores differently");
  if (P.categoryOf(P.evaluate(h)) !== ref7(h)[0]) fails.push("category of " + show(h) + " differs from the reference");
  if (prev) {
    const d1 = Math.sign(P.evaluate(h) - P.evaluate(prev)), d2 = cmp(ref7(h), ref7(prev));
    if (d1 !== d2) fails.push("compare " + show(h) + " | " + show(prev) + ": " + d1 + ", reference " + d2);
  }
  prev = h;
}

// 4. Games between computers.
const stats = { games: 0, finished: 0, hands: 0, showdowns: 0, sidePots: 0, splits: 0, maxHands: 0, folds: 0, raises: 0, allIns: 0 };
const r4 = rng(4);
for (let g = 0; g < 2000; g++) {
  const comps = 1 + (g % 3);
  let s = P.createGame(comps, r4);
  const levels = s.players.map(() => 1 + Math.floor(r4() * 3));
  const total = s.players.reduce((t, p) => t + p.chips, 0);
  let hands = 0;
  while (s.phase !== "gameover" && hands < 150) {
    s = P.startHand(s, r4);
    hands++;
    let guard = 0;
    while (s.phase === "betting" && guard++ < 500) {
      const lv = levels[s.toAct];
      const a = A.choose(s, lv, r4, { samples: 12 });
      const next = P.act(s, a, r4);
      if (!next) { fails.push("game " + g + ": illegal action " + a); break; }
      if (a === "fold") stats.folds++;
      if (a === "raise") stats.raises++;
      s = next;
      const sum = s.players.reduce((t, p) => t + p.chips + p.total, 0);
      if (s.phase === "betting" && sum !== total) { fails.push("game " + g + ": chips add up to " + sum); break; }
      if (s.players.some((p) => p.chips < 0 || p.bet < 0 || p.total < 0)) { fails.push("game " + g + ": negative chips"); break; }
    }
    if (s.phase === "betting") { fails.push("game " + g + ": betting does not end"); break; }
    const after = s.players.reduce((t, p) => t + p.chips, 0);
    if (after !== total) { fails.push("game " + g + " hand " + hands + ": " + after + " chips after the hand, " + total + " before"); break; }
    if (s.result.won.reduce((t, w) => t + w, 0) !== s.result.pot) fails.push("game " + g + ": pot not shared out in full");
    if (s.result.showdown) stats.showdowns++;
    if (s.result.won.filter((w) => w > 0).length > 1) stats.splits++;
    const totals = new Set(s.players.filter((p) => p.total > 0).map((p) => p.total));
    if (s.result.showdown && totals.size > 1) stats.sidePots++;
    if (s.players.some((p) => p.allIn)) stats.allIns++;
  }
  stats.games++;
  stats.hands += hands;
  stats.maxHands = Math.max(stats.maxHands, hands);
  if (s.phase === "gameover") stats.finished++;
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 20).join("\n"));
  console.log("=== POKER CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== POKER CORE: " + HANDS.length + " fixed hands, " + PAIRS.length + " fixed pairs, 3000 random hands, 2000 games, 0 failures ===");
