// tests/blackjack-core.js
// "17 and 4" / "Blackjack": fixed hand values, then 10000 rounds per
// variant with a random player. Fails unless the points are counted right
// (Ace 1 or 11 in Blackjack), the bank keeps its rule (draws below 17,
// stands from 17), no card is dealt twice, the chips move by the bet as
// the result says and never go below 0.
//
// Run: node tests/blackjack-core.js

const C = require("../blackjack-core.js");

const fails = [];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const card = (t) => {
  const rank = { A: 1, J: 11, Q: 12, K: 13 }[t.slice(0, -1)] || parseInt(t, 10);
  return { rank, suit: t.slice(-1) };
};
const hand = (str) => str.split(" ").map(card);

// Fixed examples: [variant, cards, total, soft, natural, fire]
const EXAMPLES = [
  ["blackjack", "AS KH", 21, true, true, false],
  ["blackjack", "AS 10H", 21, true, true, false],
  ["blackjack", "AS AH", 12, true, false, false],
  ["blackjack", "AS AH AD", 13, true, false, false],
  ["blackjack", "AS 6H", 17, true, false, false],
  ["blackjack", "AS 6H 9C", 16, false, false, false],
  ["blackjack", "AS 5H 5C", 21, true, false, false],
  ["blackjack", "KS QH", 20, false, false, false],
  ["blackjack", "KS QH 2C", 22, false, false, false],
  ["blackjack", "7S 7H 7C", 21, false, false, false],
  ["blackjack", "AS AH 9C", 21, true, false, false],
  ["blackjack", "AS AH 9C KD", 21, false, false, false],
  ["seventeen", "AS KH", 15, false, false, false],
  ["seventeen", "AS 10H", 21, false, true, false],
  ["seventeen", "AS AH", 21, false, true, true],
  ["seventeen", "AS AH 7C", 29, false, false, false],
  ["seventeen", "KS QH JC", 9, false, false, false],
  ["seventeen", "10S 7H KC", 21, false, false, false],
  ["seventeen", "9S 8H", 17, false, false, false],
  ["seventeen", "AS 9H 2C", 22, false, false, false]
];
EXAMPLES.forEach(([v, str, total, soft, natural, fire]) => {
  const h = C.handValue(v, hand(str));
  if (h.total !== total || h.soft !== soft || h.natural !== natural || h.fire !== fire || h.bust !== (total > 21)) {
    fails.push(v + " " + str + ": got " + JSON.stringify(h));
  }
});

// Independent count for the simulation.
function count(v, cards) {
  if (v === "seventeen") {
    if (cards.length === 2 && cards[0].rank === 1 && cards[1].rank === 1) return 21;
    return cards.reduce((t, c) => t + ({ 1: 11, 11: 2, 12: 3, 13: 4 }[c.rank] || c.rank), 0);
  }
  let t = 0, a = 0;
  cards.forEach((c) => { t += c.rank === 1 ? 1 : Math.min(10, c.rank); if (c.rank === 1) a++; });
  return a && t + 10 <= 21 ? t + 10 : t;
}

const stats = {};
["seventeen", "blackjack"].forEach((v) => {
  const r = rng(v === "blackjack" ? 7 : 3);
  const st = { rounds: 0, win: 0, loss: 0, push: 0, naturals: 0, fire: 0, doubles: 0, bankBust: 0, restarts: 0, minChips: Infinity, maxChips: 0 };
  let s = C.createGame(v);
  while (st.rounds < 10000) {
    if (s.phase === "broke") { s = C.createGame(v); st.restarts++; }
    const before = s.chips;
    const bet = C.BETS[Math.floor(r() * C.BETS.length)];
    s = C.startRound(s, bet, r);
    if (!s) { fails.push(v + ": round could not start"); break; }
    st.rounds++;
    while (s.phase === "player") {
      const pv = count(v, s.player);
      if (C.canDouble(s) && r() < 0.15) { s = C.double(s); st.doubles++; }
      else if (pv < 12 || (pv < 18 && r() < 0.5)) s = C.hit(s);
      else s = C.stand(s);
    }
    const all = s.player.concat(s.bank).map((c) => c.rank + c.suit);
    if (new Set(all).size !== all.length) fails.push(v + " round " + st.rounds + ": a card was dealt twice");
    if (all.length + s.deck.length !== (v === "seventeen" ? 32 : 52)) fails.push(v + " round " + st.rounds + ": card count");
    const p = count(v, s.player), b = count(v, s.bank);
    if (p !== C.handValue(v, s.player).total || b !== C.handValue(v, s.bank).total) fails.push(v + " round " + st.rounds + ": points");
    // The bank: stands from 17, and every card it drew was drawn below 17.
    if (s.result.reason !== "bust" && s.result.reason !== "natural" && s.result.reason !== "banknatural" && s.result.reason !== "bothnatural" &&
        s.result.reason !== "fire" && s.result.reason !== "bankfire" && b < 17) {
      fails.push(v + " round " + st.rounds + ": bank stopped at " + b);
    }
    for (let k = 2; k < s.bank.length; k++) {
      if (count(v, s.bank.slice(0, k)) >= 17) fails.push(v + " round " + st.rounds + ": bank drew at " + count(v, s.bank.slice(0, k)));
    }
    // The result and the chips.
    const pn = s.player.length === 2 && p === 21, bn = s.bank.length === 2 && b === 21;
    let want;
    if (p > 21) want = "loss";
    else if (v === "seventeen") want = (pn && s.player[0].rank === 1 && s.player[1].rank === 1 && !(s.bank.length === 2 && s.bank[0].rank === 1 && s.bank[1].rank === 1)) ? "win" :
      (s.bank.length === 2 && s.bank[0].rank === 1 && s.bank[1].rank === 1) ? "loss" : b > 21 ? "win" : p > b ? "win" : "loss";
    else want = pn && bn ? "push" : pn ? "win" : bn ? "loss" : b > 21 ? "win" : p > b ? "win" : p === b ? "push" : "loss";
    if (s.result.outcome !== want) fails.push(v + " round " + st.rounds + ": outcome " + s.result.outcome + ", expected " + want);
    const stake = s.bet;
    const wantDelta = want === "push" ? 0 : want === "loss" ? -stake : (v === "blackjack" && pn ? Math.floor(stake * 3 / 2) : stake);
    if (s.chips - before !== wantDelta || s.result.delta !== wantDelta) fails.push(v + " round " + st.rounds + ": chips " + before + " -> " + s.chips + ", expected change " + wantDelta);
    if (s.chips < 0) fails.push(v + " round " + st.rounds + ": chips below 0");
    if (v === "seventeen" && s.doubled) fails.push(v + ": doubled in 17 and 4");
    st[s.result.outcome]++;
    if (pn) st.naturals++;
    if (s.result.reason === "fire") st.fire++;
    if (b > 21) st.bankBust++;
    st.minChips = Math.min(st.minChips, s.chips);
    st.maxChips = Math.max(st.maxChips, s.chips);
  }
  stats[v] = st;
});

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 20).join("\n"));
  console.log(`=== 17 AND 4 / BLACKJACK CORE: ${fails.length} failure(s) ===`);
  process.exit(1);
}
console.log(`=== 17 AND 4 / BLACKJACK CORE: ${EXAMPLES.length} fixed hands, 2 x 10000 rounds, 0 failures ===`);
