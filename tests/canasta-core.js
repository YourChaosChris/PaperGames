// tests/canasta-core.js
// Canasta: fixed examples, then 500 games between computers.
//
// 1. Fixed examples worked out by hand: card values, the minimum for the
//    first meld, valid and invalid melds, taking the pile (frozen, not
//    frozen, before the first meld, black Three on top), going out only
//    with two canastas, and the score of a hand.
// 2. 500 games (to 5000, every fifth one the short game to 2000), levels
//    mixed. After every move: still 108 cards, every meld valid (one rank,
//    at least two natural cards, at most three wild cards, at least three
//    cards; black Threes only when going out), one meld per rank and
//    player. After every hand the score is recomputed here on its own.
//    Every game must end.
//
// Run: node tests/canasta-core.js

const C = require("../canasta-core.js");
const A = require("../canasta-ai.js");

const fails = [];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const R = { A: 14, K: 13, Q: 12, J: 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };
let nextId = 1000;
const card = (t) => (t === "JK" ? { id: nextId++, joker: true } : { id: nextId++, rank: R[t.slice(0, -1)], suit: t.slice(-1) });
const cards = (str) => str.split(" ").filter(Boolean).map(card);
const check = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(name + ": " + JSON.stringify(got) + ", expected " + JSON.stringify(want)); };

// Card values.
check("values", cards("JK 2C AH KS 8D 7C 4H 3S").map(C.value), [50, 20, 20, 10, 10, 5, 5, 5]);
check("red three bonus value", C.value(card("3H")), 100);
// Minimum for the first meld.
check("minimum", [-5, 0, 1495, 1500, 2995, 3000, 4990].map(C.minimum), [15, 50, 50, 90, 90, 120, 120]);
// Melds.
check("meld 3 naturals", C.validMeld(9, cards("9C 9D 9S")), true);
check("meld 2 naturals + wild", C.validMeld(9, cards("9C 9D 2S")), true);
check("meld 1 natural + 2 wild", C.validMeld(9, cards("9C 2D JK")), false);
check("meld 4 wild", C.validMeld(9, cards("9C 9D 9H 9S 2D 2C JK JK")), false);
check("meld 3 wild", C.validMeld(9, cards("9C 9D 9H 9S 2D 2C JK")), true);
check("meld mixed ranks", C.validMeld(9, cards("9C 9D 8S")), false);
check("meld two cards", C.validMeld(9, cards("9C 9D")), false);
check("meld of threes", C.validMeld(3, cards("3C 3S 3C")), true);
check("red threes no meld", C.validMeld(3, cards("3H 3D 3C")), false);

// A hand-made state.
function state(o) {
  const s = C.deal({ dealer: 1 }, rng(1));
  s.stock = cards(o.stock || "4C 4C 4C 4C 4C 4C 4C 4C 4C 4C");
  s.discard = cards(o.discard || "");
  s.hands = [cards(o.hand0 || ""), cards(o.hand1 || "5C 6C 7C 8C")];
  s.melds = [(o.melds0 || []).map(([r, t]) => ({ rank: r, cards: cards(t) })), (o.melds1 || []).map(([r, t]) => ({ rank: r, cards: cards(t) }))];
  s.red3 = [cards(o.red0 || ""), cards(o.red1 || "")];
  s.known = [[], []];
  s.turn = 0; s.phase = o.phase || "draw";
  s.req = o.req || [50, 50];
  s.meldedBefore = [s.melds[0].length > 0, s.melds[1].length > 0];
  return s;
}
const ids = (s, p, str) => { const want = str.split(" "); const h = s.hands[p].slice(); return want.map((t) => { const c = card(t); const i = h.findIndex((x) => (c.joker ? x.joker : x.rank === c.rank && x.suit === c.suit)); const x = h.splice(i, 1)[0]; return x.id; }); };

// Taking the pile.
let s = state({ discard: "5C KD", hand0: "KC KH 9S 9D 9H 4C 6D", req: [50, 50] });
// First meld K K K (30) + 9 9 9 (30) = 60 >= 50: allowed.
let r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC KH") }, { ids: ids(s, 0, "9S 9D 9H") }] });
check("take pile first meld 60", r.ok, true);
if (r.ok) check("take pile hand", r.state.hands[0].length, 3);
r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC KH") }] });
check("take pile first meld 30 too low", r.reason, "below-minimum");
s = state({ discard: "5C KD", hand0: "KC 2H 9S 9D 9H 4C 6D", req: [15, 50] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC 2H") }] });
check("take pile before first meld needs two naturals", r.reason, "frozen-first");
s = state({ discard: "5C KD", hand0: "KC 2H 9S 9D 4C 6D", melds0: [[8, "8C 8D 8S"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC 2H") }] });
check("take pile natural + wild, not frozen", r.ok, true);
s = state({ discard: "2C 5C KD", hand0: "KC 2H 9S 9D 4C 6D", melds0: [[8, "8C 8D 8S"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC 2H") }] });
check("take frozen pile with natural + wild", r.reason, "frozen");
s = state({ discard: "2C 5C KD", hand0: "KC KS 9S 9D 4C 6D", melds0: [[8, "8C 8D 8S"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: ids(s, 0, "KC KS") }] });
check("take frozen pile with two naturals", r.ok, true);
s = state({ discard: "5C KD", hand0: "9S 9D 4C 6D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: [] }] });
check("take pile onto own meld", r.ok && r.state.melds[0][0].cards.length, 4);
s = state({ discard: "2C 5C KD", hand0: "9S 9D 4C 6D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: [] }] });
check("frozen pile not onto own meld", r.reason, "frozen");
s = state({ discard: "5C 3S", hand0: "3C 3S 4C 6D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: [] }] });
check("black three on top", r.reason, "pile-black-three");
s = state({ discard: "5C 2D", hand0: "4C 6D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "takePile", groups: [{ ids: [] }] });
check("wild on top", r.reason, "pile-wild");
// Melding.
s = state({ phase: "play", hand0: "7C 7D 7H 2C JK 9S 9D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "2C JK"), target: 13 }] });
check("wild cards onto own meld", r.ok && r.state.melds[0][0].cards.length, 5);
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "7C 2C JK") }] });
check("one natural + two wild", r.reason, "not-a-meld");
s = state({ phase: "play", hand0: "7C 7D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "7C"), target: 13 }] });
check("wrong rank onto meld", r.reason, "not-a-meld");
s = state({ phase: "play", hand0: "KD 9C 9D", melds0: [[13, "KC KS KH"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "KD") }] });
check("same rank goes onto the existing meld", r.ok && r.state.melds[0].length, 1);
// Going out.
s = state({ phase: "play", hand0: "KD 9C", melds0: [[13, "KC KS KH KC KS KH 2D"], [10, "10C 10S 10H"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "KD") }] });
check("one canasta: must keep two cards", r.reason, "keep-card");
s = state({ phase: "play", hand0: "KD 9C", melds0: [[13, "KC KS KH KC KS KH 2D"], [10, "10C 10S 10H 10D 10C 10S 10H"]], melds1: [[5, "5C 5D 5S"]], hand1: "6C 6D JK", red0: "3H", red1: "3D 3H" });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "KD") }] });
check("two canastas: may meld down to one card", r.ok, true);
if (r.ok) {
  const r2 = C.applyMove(r.state, { type: "discard", id: r.state.hands[0][0].id });
  check("going out by discarding", r2.ok && r2.state.phase, "over");
  if (r2.ok) {
    const res = r2.state.result;
    // Player 0: melds K×7 (+K = 8 cards: 7 K = 70 + 2 = 20 -> 90) mixed 300; 10×7 = 70 natural 500; red Three 100; out 100.
    check("score hand player 0", res.parts[0], { melded: 160, canastas: 800, red: 100, out: 100, hand: 0, total: 1160 });
    // Player 1: 5 5 5 = 15; red Threes 200; hand 6 6 JK = 60.
    check("score hand player 1", res.parts[1], { melded: 15, canastas: 0, red: 200, out: 0, hand: 60, total: 155 });
  }
}
// Going out step by step: melding down to one card is allowed when that
// card can still go on a meld and make the second canasta.
s = state({ phase: "play", hand0: "4D 2C", melds0: [[4, "4C 4D 4H 4S 4C 2H"], [12, "QC QD QH QS QC QD"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "4D"), target: 4 }] });
check("step by step: down to the last card", r.ok, true);
if (r.ok) {
  const r2 = C.applyMove(r.state, { type: "meld", groups: [{ ids: [r.state.hands[0][0].id], target: 12 }] });
  check("step by step: last card makes the second canasta and goes out", r2.ok && r2.state.phase, "over");
}
s = state({ phase: "play", hand0: "4D 2C", melds0: [[4, "4C 4D 4H 4S 4C 2H"], [12, "QC QD QH QS QC"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "4D"), target: 4 }] });
check("step by step: not if the last card can't make the second canasta", r.reason, "keep-card");
s = state({ phase: "play", hand0: "9C 9D 9S 9H 9C 9D 9S 4C", hand1: "6C 6D", red1: "3D 3H 3C" });
s.red3[1] = cards("3D 3H 3H 3D");
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "9C 9D 9S 9H 9C 9D 9S") }] });
check("concealed: one canasta is not enough", r.reason, "keep-card");
// Four red Threes without a meld: -800.
const sc = C.sideScore(s, 1, 0);
check("four red threes, no meld", sc.red, -800);
s = state({ phase: "play", hand0: "9C 9D 9S 9H 9C 9D 9S 8C 8D 8S 8H 8C 8D 8S" });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "9C 9D 9S 9H 9C 9D 9S") }, { ids: ids(s, 0, "8C 8D 8S 8H 8C 8D 8S") }] });
check("concealed going out with two canastas", r.ok && r.state.result && r.state.result.parts[0], { melded: 140, canastas: 1000, red: 0, out: 200, hand: 0, total: 1340 });
s = state({ phase: "play", hand0: "3C 3S 3C KD", melds0: [[13, "KC KS KH KC KS KH 2D"], [10, "10C 10S 10H 10D 10C 10S 10H"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "3C 3S 3C") }] });
check("black threes when going out", r.ok, true);
s = state({ phase: "play", hand0: "3C 3S 3C KD 9C", melds0: [[13, "KC KS KH KC KS KH 2D"], [10, "10C 10S 10H 10D 10C 10S 10H"]] });
r = C.applyMove(s, { type: "meld", groups: [{ ids: ids(s, 0, "3C 3S 3C") }] });
check("black threes not without going out", r.reason, "black-three");
// Game end.
s = state({ phase: "play", hand0: "KD", melds0: [[13, "KC KS KH KC KS KH 2D"], [10, "10C 10S 10H 10D 10C 10S 10H"]] });
s.scores = [4000, 4900];
r = C.applyMove(s, { type: "discard", id: s.hands[0][0].id });
check("game over at 5000", r.ok && r.state.result.gameOver, true);
if (r.ok) check("winner", r.state.result.winner, 0);

/*** 500 games ***/

function checkMelds(s, where) {
  for (let p = 0; p < 2; p++) {
    const seen = {};
    s.melds[p].forEach((m) => {
      if (seen[m.rank]) fails.push(where + ": two melds of rank " + m.rank);
      seen[m.rank] = true;
      const nat = m.cards.filter((c) => !(c.joker || c.rank === 2));
      const wild = m.cards.length - nat.length;
      if (m.cards.length < 3) fails.push(where + ": meld with " + m.cards.length + " cards");
      if (m.rank === 3) {
        if (!m.cards.every((c) => !c.joker && c.rank === 3 && (c.suit === "C" || c.suit === "S"))) fails.push(where + ": bad meld of threes");
        // Melded in the turn the player goes out: the last card (if any) is discarded next.
        if (s.phase !== "over" && !(s.turn === p && s.phase === "play" && s.hands[p].length <= 1)) fails.push(where + ": black threes melded without going out");
      } else {
        if (nat.some((c) => c.rank !== m.rank)) fails.push(where + ": wrong rank in meld");
        if (nat.length < 2) fails.push(where + ": fewer than two naturals");
        if (wild > 3) fails.push(where + ": more than three wild cards");
        if (m.rank < 4) fails.push(where + ": meld of rank " + m.rank);
      }
    });
  }
}
const val = (c) => (c.joker ? 50 : c.rank === 2 || c.rank === 14 ? 20 : c.rank >= 8 ? 10 : 5);
function refScore(s, p, out) {
  let t = 0;
  s.melds[p].forEach((m) => {
    t += m.cards.reduce((a, c) => a + val(c), 0);
    if (m.cards.length >= 7) t += m.cards.some((c) => c.joker || c.rank === 2) ? 300 : 500;
  });
  const n = s.red3[p].length;
  const red = n === 4 ? 800 : 100 * n;
  t += s.melds[p].length ? red : -red;
  if (out === p) t += s.meldedBefore[p] ? 100 : 200;
  t -= s.hands[p].reduce((a, c) => a + val(c), 0);
  return t;
}

const stats = { games: 0, hands: 0, short: 0, wins: [0, 0, 0], wentOut: 0, concealed: 0, stockOut: 0, pileTakes: 0, canastas: 0, natural: 0, maxHands: 0, moves: 0 };
const g = rng(60);
for (let gi = 0; gi < 500; gi++) {
  const target = gi % 5 === 4 ? 2000 : 5000;
  if (target === 2000) stats.short++;
  const levels = [1 + Math.floor(g() * 3), 1 + Math.floor(g() * 3)];
  let s = C.deal({ target, dealer: gi % 2 }, g);
  let hands = 0, guard = 0, ended = false;
  while (guard++ < 200000) {
    if (s.phase === "over") {
      hands++;
      stats.hands++;
      const res = s.result;
      if (res.outPlayer !== null) stats.wentOut++; else stats.stockOut++;
      if (res.concealed) stats.concealed++;
      for (let p = 0; p < 2; p++) {
        const want = refScore(s, p, res.outPlayer);
        if (want !== res.parts[p].total) fails.push("game " + gi + " hand " + hands + ": score " + res.parts[p].total + ", expected " + want);
        if (res.before[p] + res.parts[p].total !== s.scores[p]) fails.push("game " + gi + ": total does not add up");
        s.melds[p].forEach((m) => { if (m.cards.length >= 7) { stats.canastas++; if (!m.cards.some((c) => c.joker || c.rank === 2)) stats.natural++; } });
      }
      if (res.outPlayer !== null && s.hands[res.outPlayer].length) fails.push("game " + gi + ": went out with cards in hand");
      if (res.outPlayer !== null && s.melds[res.outPlayer].filter((m) => m.cards.length >= 7).length < 2) fails.push("game " + gi + ": went out without two canastas");
      if (res.gameOver) {
        const w = s.scores[0] > s.scores[1] ? 0 : s.scores[1] > s.scores[0] ? 1 : -1;
        if (w !== res.winner) fails.push("game " + gi + ": wrong winner");
        if (Math.max(s.scores[0], s.scores[1]) < target) fails.push("game " + gi + ": ended below the target");
        stats.wins[w === -1 ? 2 : w]++;
        ended = true;
        break;
      }
      if (Math.max(s.scores[0], s.scores[1]) >= target) fails.push("game " + gi + ": target reached but not over");
      s = C.nextHand(s, g);
      continue;
    }
    const before = s;
    const m = A.chooseMove(s, levels[s.turn], g, { samples: 1, depth: 10 });
    const r = C.applyMove(s, m);
    stats.moves++;
    if (!r.ok) { fails.push("game " + gi + ": illegal computer move " + m.type + " (" + r.reason + ")"); break; }
    if (m.type === "takePile") stats.pileTakes++;
    s = r.state;
    if (C.totalCards(s) !== 108) { fails.push("game " + gi + ": " + C.totalCards(s) + " cards"); break; }
    const allIds = new Set();
    [s.stock, s.discard, s.hands[0], s.hands[1], s.red3[0], s.red3[1]].concat(s.melds[0].map((x) => x.cards), s.melds[1].map((x) => x.cards))
      .forEach((a) => a.forEach((c) => allIds.add(c.id)));
    if (allIds.size !== 108) { fails.push("game " + gi + ": a card is twice"); break; }
    checkMelds(s, "game " + gi);
    if (s.hands.some((h) => h.some((c) => !c.joker && c.rank === 3 && (c.suit === "H" || c.suit === "D")))) fails.push("game " + gi + ": red three in a hand");
    if (m.type === "draw" && before.stock.length === 0) fails.push("game " + gi + ": drew from an empty stock");
  }
  stats.games++;
  stats.maxHands = Math.max(stats.maxHands, hands);
  if (!ended) fails.push("game " + gi + ": did not end");
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 25).join("\n"));
  console.log("=== CANASTA CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== CANASTA CORE: fixed examples ok, 500 games, 0 failures ===");
