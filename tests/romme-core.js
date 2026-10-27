// romme-core.js test
// Rommé rules (romme-core.js) and computer (romme-ai.js), no browser.
//   - Task 106: a joker added to a run with room at both ends goes to the
//     chosen end; afterwards the next card fits there; the computer picks
//     the end that saves it a hand card; the house rule "add the swapped
//     joker" works with the choice.
//   - Task 107: "Hand-Rommé" - lay out only everything at once, no minimum,
//     penalties count double, computer goes out that way.
//   - Task 108: knocking - who may knock, keep or give, the knocker
//     discards, the players in between miss their turn.
//   - Task 154: a card taken from the table (house rule) can't be added to
//     a meld on the table, only laid out in a new meld of three or more.
//   - Computer games with every option (GAMES, default 200): every round
//     ends and all 110 cards stay in play.
//   node tests/romme-core.js [GAMES]
const path = require("path");
const C = require(path.join(__dirname, "..", "romme-core.js"));
global.RommeCore = C;
const AI = require(path.join(__dirname, "..", "romme-ai.js"));

const GAMES = parseInt(process.argv[2], 10) || 200;
let fails = 0, checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { fails++; console.log("FAIL " + msg); }
}
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

let nextId = 1000;
const card = (rank, suit) => ({ id: nextId++, rank, suit });
const joker = () => ({ id: nextId++, joker: true });
const run = (owner, suit, from, to) => {
  const cards = [];
  for (let r = from; r <= to; r++) cards.push(card(r, suit));
  const m = C.buildMeld(cards);
  m.owner = owner;
  return m;
};
// A state in phase "play" for player 0 with the given hand and table.
function playState(hand, melds, extra) {
  const s = C.createInitialState(Object.assign({ players: 2, dealer: 1, rng: rng(7) }, extra || {}));
  s.players[0].hand = hand;
  s.players[0].opened = true;
  s.players[1].opened = true;
  s.melds = melds;
  s.turn = 0;
  s.phase = "play";
  s.firstTurn = false;
  return s;
}
function apply(s, move, msg) {
  const r = C.applyMove(s, move);
  ok(r.ok, msg + " (" + (r.reason || "") + ")");
  return r.state;
}
const ranks = (m) => m.entries.map((e) => e.rank).join(",");

// ---- Task 106: joker at the chosen end ------------------------------------
{
  // (a) Run 4-5-6 of hearts, hand: 2 of hearts and a joker.
  const j = joker(), two = card(2, "H");
  let s = playState([two, j], [run(1, "H", 4, 6)]);
  ok(C.jokerEnds(s.melds[0]).map((e) => e.end + e.rank).join(" ") === "low3 high7", "106a: both ends offered (3 and 7)");
  s = apply(s, { type: "extend", meld: 0, id: j.id, end: "low" }, "106a: joker at the low end");
  ok(ranks(s.melds[0]) === "3,4,5,6", "106a: joker stands for the 3: " + ranks(s.melds[0]));
  ok(s.melds[0].entries[0].card.joker, "106a: the joker is the first card");
  s = apply(s, { type: "extend", meld: 0, id: two.id }, "106a: then the 2 fits in front of the joker");
  ok(ranks(s.melds[0]) === "2,3,4,5,6", "106a: run 2-6");
  ok(s.over && s.winner === 0 && s.players[0].hand.length === 0, "106a: hand empty, round won");
}
{
  // (b) The high end stays possible, also without `end` (as before).
  const j = joker();
  let s = playState([j, card(9, "C")], [run(1, "H", 4, 6)]);
  const hi = apply(s, { type: "extend", meld: 0, id: j.id, end: "high" }, "106b: joker at the high end");
  ok(ranks(hi.melds[0]) === "4,5,6,7", "106b: joker as 7: " + ranks(hi.melds[0]));
  const plain = apply(s, { type: "extend", meld: 0, id: j.id }, "106b: joker without end");
  ok(ranks(plain.melds[0]) === "4,5,6,7", "106b: without end it goes to the high end as before");
}
{
  // (c) A run ending with the Ace on top: only the low end, no question.
  const j = joker();
  const full = C.buildMeld([card(12, "S"), card(13, "S"), card(1, "S")]);
  full.owner = 1;
  ok(ranks(full) === "12,13,14", "106c: Q-K-A built");
  ok(C.jokerEnds(full).map((e) => e.end).join() === "low", "106c: only the low end");
  let s = playState([j, card(9, "C")], [full]);
  s = apply(s, { type: "extend", meld: 0, id: j.id }, "106c: joker without end");
  ok(ranks(s.melds[0]) === "11,12,13,14", "106c: joker as Jack: " + ranks(s.melds[0]));
  const bad = C.applyMove(playState([j, card(9, "C")], [full]), { type: "extend", meld: 0, id: j.id, end: "high" });
  ok(!bad.ok, "106c: the high end is refused");
  // A-2-3: only the high end.
  const low = run(1, "D", 1, 3);
  ok(C.jokerEnds(low).map((e) => e.end).join() === "high", "106c: A-2-3 only the high end");
}
{
  // (d) Sets are unchanged: no ends, the joker just joins.
  const set = C.buildMeld([card(8, "C"), card(8, "S"), card(8, "H")]);
  set.owner = 1;
  ok(C.jokerEnds(set).length === 0, "106d: no ends on a set");
  const j = joker();
  let s = playState([j, card(2, "C")], [set]);
  s = apply(s, { type: "extend", meld: 0, id: j.id, end: "low" }, "106d: joker on a set (end ignored)");
  ok(s.melds[0].entries.length === 4 && s.melds[0].entries[3].card.joker && s.melds[0].entries[3].rank === 8, "106d: set of four with joker");
}
{
  // (e) House rule "add the swapped joker": swap the 5 of hearts in, add the
  // joker at the low end of the same run, then the 2 of hearts.
  const j = joker();
  const five = card(5, "H"), two = card(2, "H");
  const m = C.buildMeld([card(4, "H"), j, card(6, "H")]);
  m.owner = 1;
  let s = playState([five, two, card(13, "C")], [m], { jokerLayoffRule: true });
  s.jokerLayoffRule = true;
  s = apply(s, { type: "swapJoker", meld: 0, id: five.id }, "106e: swap the 5 for the joker");
  ok(s.pendingJoker === j.id, "106e: joker must be laid out");
  ok(C.jokerEnds(s.melds[0]).length === 2, "106e: both ends free");
  s = apply(s, { type: "extend", meld: 0, id: j.id, end: "low" }, "106e: swapped joker to the low end");
  ok(ranks(s.melds[0]) === "3,4,5,6" && s.pendingJoker === null, "106e: joker as 3, duty done");
  s = apply(s, { type: "extend", meld: 0, id: two.id }, "106e: 2 of hearts added");
  ok(ranks(s.melds[0]) === "2,3,4,5,6", "106e: run 2-6");
}
{
  // Computer: chooses the end a hand card can follow.
  const j = joker(), two = card(2, "H");
  for (const level of [2, 3]) {
    const s = playState([j, two, card(13, "C"), card(9, "D")], [run(1, "H", 4, 6)]);
    s.turn = 0;
    const mv = AI.chooseMove(s, level, rng(1));
    // Hand has 4 cards, so a medium computer keeps its joker; make it go.
    const s2 = playState([j, two], [run(1, "H", 4, 6)]);
    const mv2 = AI.chooseMove(s2, level, rng(1));
    ok(mv2.type === "extend" && (mv2.id === two.id || mv2.end === "low"), "106 AI level " + level + ": joker to the low end or 2 first: " + JSON.stringify(mv2));
    ok(mv.type !== "extend" || mv.id !== j.id || mv.end === "low", "106 AI: no joker to the high end with the 2 in hand");
  }
  const s3 = playState([j, card(8, "H")], [run(1, "H", 4, 6)]);
  s3.players[0].hand = [j, card(8, "H")];
  const mv3 = AI.chooseMove(s3, 2, rng(1));
  ok(mv3.type === "extend" && mv3.id === j.id && mv3.end === "high", "106 AI: with the 8 the joker goes high: " + JSON.stringify(mv3));
}

// ---- Task 107: Hand-Rommé ------------------------------------------------
function handState(hand, extra) {
  const s = C.createInitialState(Object.assign({ players: 3, dealer: 2, rng: rng(11), handRule: true }, extra || {}));
  s.players[0].hand = hand;
  s.turn = 0;
  s.phase = "play";
  s.firstTurn = false;
  return s;
}
{
  // (a) Whole hand in melds plus one discard: round over, others doubled.
  const a = [card(2, "C"), card(3, "C"), card(4, "C")];
  const b = [card(9, "S"), card(9, "H"), card(9, "D")];
  const last = card(13, "D");
  let s = handState(a.concat(b, [last]));
  ok(s.handRule === true, "107: option stored");
  s.players[1].hand = [card(5, "S"), card(6, "S")];      // 11 points
  s.players[2].hand = [joker(), card(1, "H")];           // 31 points
  s = apply(s, { type: "meld", ids: a.map((c) => c.id) }, "107a: stage run");
  ok(s.melds.length === 0 && s.pending.length === 1, "107a: staged, not on the table");
  s = apply(s, { type: "meld", ids: b.map((c) => c.id) }, "107a: stage set");
  s = apply(s, { type: "confirmOpen" }, "107a: lay out everything");
  ok(s.over && s.winner === 0, "107a: round over, player wins");
  ok(s.doubled === true, "107a: marked as doubled");
  ok(s.penalties.join() === "0,22,62", "107a: penalties doubled: " + s.penalties.join());
  ok(C.topDiscard(s).id === last.id, "107a: last card on the discard pile");
  ok(s.melds.length === 2, "107a: melds on the table");
}
{
  // (b) Not everything fits: refused with reason hand-all.
  const a = [card(2, "C"), card(3, "C"), card(4, "C")];
  let s = handState(a.concat([card(13, "D"), card(7, "S")]));
  s = apply(s, { type: "meld", ids: a.map((c) => c.id) }, "107b: stage");
  const r = C.applyMove(s, { type: "confirmOpen" });
  ok(!r.ok && r.reason === "hand-all", "107b: refused with hand-all: " + r.reason);
  const d = C.applyMove(s, { type: "discard", id: s.players[0].hand[0].id });
  ok(!d.ok && d.reason === "staged-open", "107b: no discard while staged");
  s = apply(s, { type: "cancelPending" }, "107b: take back");
  ok(s.players[0].hand.length === 5, "107b: cards back in hand");
}
{
  // (c) No adding to melds and no laying out in between: the table stays
  // empty, extend/take/split/swap need a first meld that never happens.
  const a = [card(2, "C"), card(3, "C"), card(4, "C")];
  let s = handState(a.concat([card(5, "C"), card(13, "D"), card(12, "D")]), { takeRule: true, splitRule: true });
  s.melds = [Object.assign(run(1, "C", 6, 8), {})];   // impossible in play, only to try
  const ext = C.applyMove(s, { type: "extend", meld: 0, id: s.players[0].hand[3].id });
  ok(!ext.ok, "107c: adding refused (" + ext.reason + ")");
  s = apply(s, { type: "meld", ids: a.map((c) => c.id) }, "107c: stage");
  const conf = C.applyMove(s, { type: "confirmOpen" });
  ok(!conf.ok, "107c: partial lay out refused");
  ok(s.players[0].opened === false, "107c: no first meld in between");
}
{
  // (d) No minimum: a single cheap run of 2-3-4 plus one discard ends it.
  const a = [card(2, "H"), card(3, "H"), card(4, "H")];
  let s = handState(a.concat([card(9, "C")]), { threshold: 51 });
  s = apply(s, { type: "meld", ids: a.map((c) => c.id) }, "107d: stage 9 points");
  s = apply(s, { type: "confirmOpen" }, "107d: lay out below 51 points");
  ok(s.over && s.winner === 0, "107d: no minimum needed");
  // And with nothing to discard.
  let t = handState(a.slice());
  t = apply(t, { type: "meld", ids: a.map((c) => c.id) }, "107d: stage all");
  t = apply(t, { type: "confirmOpen" }, "107d: out without discard");
  ok(t.over && t.winner === 0, "107d: out with an empty hand");
}
{
  // (e) Joker in a meld.
  const j = joker();
  const a = [card(7, "S"), j, card(9, "S")];
  const b = [card(11, "C"), card(11, "D"), card(11, "H")];
  let s = handState(a.concat(b, [card(2, "D")]));
  s = apply(s, { type: "meld", ids: a.map((c) => c.id) }, "107e: stage run with joker");
  s = apply(s, { type: "meld", ids: b.map((c) => c.id) }, "107e: stage set");
  s = apply(s, { type: "confirmOpen" }, "107e: lay out");
  ok(s.over && s.winner === 0 && s.melds[0].entries[1].card.joker && s.melds[0].entries[1].rank === 8, "107e: joker stands for the 8");
}
{
  // (f) The computer goes out by Hand-Rommé.
  for (const level of [1, 2, 3]) {
    const a = [card(5, "D"), card(6, "D"), card(7, "D")];
    const b = [card(10, "S"), card(10, "H"), card(10, "C")];
    let s = handState(a.concat(b, [card(12, "S")]));
    s.turn = 0;
    let steps = 0;
    while (!s.over && steps++ < 10) {
      const mv = AI.chooseMove(s, level, rng(3));
      s = apply(s, mv, "107f: computer move " + JSON.stringify(mv));
    }
    ok(s.over && s.winner === 0 && s.doubled, "107f: computer level " + level + " wins by Hand-Rommé");
  }
  // ...and doesn't lay out when it can't place everything.
  const a = [card(5, "D"), card(6, "D"), card(7, "D")];
  let s = handState(a.concat([card(12, "S"), card(2, "C")]));
  const mv = AI.chooseMove(s, 2, rng(3));
  ok(mv.type === "discard", "107f: computer discards instead: " + mv.type);
  // Option off: first meld rules unchanged.
  const off = C.createInitialState({ players: 2, rng: rng(5) });
  ok(off.handRule === false && off.knockRule === false, "107: options off by default");
}

// ---- Task 108: knocking ---------------------------------------------------
function knockState(extra) {
  const s = C.createInitialState(Object.assign({ players: 3, dealer: 1, rng: rng(21), knockRule: true }, extra || {}));
  // Player 1 (computer) is to move and discards; then 2 draws, 0 waits.
  s.firstTurn = false;
  s.turn = 1;
  s.phase = "play";
  return s;
}
{
  ok(C.createInitialState({ players: 2, knockRule: true }).knockRule === false, "108e: no knocking with 2 players");
  ok(C.createInitialState({ players: 3, knockRule: true }).knockRule === true, "108: knocking with 3 players");
  // (a) After 1 discards, 0 may knock (2 is next), 2 and 1 may not.
  let s = knockState();
  const c = s.players[1].hand[0];
  s = apply(s, { type: "discard", id: c.id }, "108a: player 1 discards");
  ok(s.turn === 2 && s.phase === "draw", "108a: player 2 to draw");
  ok(C.canKnock(s, 0), "108a: player 0 may knock");
  ok(!C.canKnock(s, 2) && !C.canKnock(s, 1), "108a: the next player and the discarder may not");
  // After 2 discards, 0 is next: no knocking for 0.
  let t = apply(s, { type: "draw" }, "108a: 2 draws");
  ok(!C.canKnock(t, 0), "108d: knocking over once the next player drew");
  t = apply(t, { type: "discard", id: t.players[2].hand[0].id }, "108a: 2 discards");
  ok(t.turn === 0 && !C.canKnock(t, 0), "108a: 0 is next - no knocking");
  ok(C.canKnock(t, 1), "108a: 1 could knock (3 players)");

  // (b) Knock, the player to move keeps the card.
  let k = apply(s, { type: "knock", player: 0 }, "108b: 0 knocks");
  ok(k.phase === "knocked" && k.knocker === 0, "108b: phase knocked");
  const d1 = C.applyMove(k, { type: "draw" });
  ok(!d1.ok, "108b: no drawing while a knock is open");
  const keep = apply(k, { type: "takeDiscard" }, "108b: 2 keeps the card");
  ok(keep.turn === 2 && keep.phase === "play" && keep.players[2].hand.some((x) => x.id === c.id), "108b: card in the hand of 2");
  ok(keep.players[0].hand.length === 13, "108b: knocker unchanged");

  // (c) Knock, the card goes to the knocker, who discards; then player 1
  // (after the knocker) moves, player 2 misses the turn.
  const give = apply(k, { type: "knockGive" }, "108c: 2 leaves the card");
  ok(give.turn === 0 && give.phase === "knockDiscard", "108c: knocker must discard");
  ok(give.players[0].hand.some((x) => x.id === c.id) && give.players[0].hand.length === 14, "108c: knocker has the card");
  ok(!C.applyMove(give, { type: "meld", ids: give.players[0].hand.slice(0, 3).map((x) => x.id) }).ok, "108c: only discarding allowed");
  const after = apply(give, { type: "discard", id: give.players[0].hand[2].id }, "108c: knocker discards");
  ok(after.turn === 1 && after.phase === "draw" && after.players[0].hand.length === 13, "108c: player after the knocker moves");
  ok(after.players[2].hand.length === 13, "108c: player 2 missed the turn");
  ok(C.cardCount(after) === 110, "108c: 110 cards");

  // (f) With the house rule "take cards from melds": knocking works the
  // same, the knocker may not take from the table while discarding.
  let h = knockState({ takeRule: true });
  h.players[0].opened = true;
  h.melds = [run(1, "S", 2, 6)];
  h = apply(h, { type: "discard", id: h.players[1].hand[0].id }, "108f: discard");
  h = apply(h, { type: "knock", player: 0 }, "108f: knock");
  h = apply(h, { type: "knockGive" }, "108f: give");
  const tk = C.applyMove(h, { type: "take", meld: 0, id: h.melds[0].entries[0].card.id });
  ok(!tk.ok && tk.reason === "knock-discard", "108f: no taking while discarding after a knock: " + tk.reason);
  ok(C.takeOptions(h).length === 0, "108f: no take options");
  // With the variant "take the discard only to lay it out" nobody knocks.
  let v = knockState({ discardRule: true });
  v = apply(v, { type: "discard", id: v.players[1].hand[0].id }, "108f: discard (variant)");
  ok(!C.canKnock(v, 0), "108f: no knocking with the discard variant");

  // Computer decides: keeps a card that forms a meld, else gives it.
  const kk = C.clone(k);
  kk.players[2].hand = [card(c.rank === 13 ? 11 : c.rank + 1, c.suit), card(c.rank === 13 ? 12 : (c.rank + 2 > 13 ? c.rank - 1 : c.rank + 2), c.suit), card(13, "C")];
  if (!c.joker) {
    ok(AI.chooseMove(kk, 2).type === "takeDiscard", "108b: computer keeps a fitting card");
  }
  const kg = C.clone(k);
  kg.players[2].hand = [card(13, "C")];
  const top = C.topDiscard(kg);
  if (!top.joker && !(top.rank === 13)) ok(AI.chooseMove(kg, 2).type === "knockGive", "108c: computer gives a useless card");
  // Without the option no knocking.
  let n = knockState({ knockRule: false });
  n = apply(n, { type: "discard", id: n.players[1].hand[0].id }, "108: discard without option");
  ok(!C.canKnock(n, 0) && !C.applyMove(n, { type: "knock", player: 0 }).ok, "108: knocking off by default");
}

// ---- Task 154: a taken card only goes into a NEW meld --------------------
{
  // Kirsten's case: 8♠ taken from a set of four 8s, run 9-Q♠ on the table,
  // 7♠ in hand. Adding the 8♠ to the run is refused; 8♠ with only the 7♠
  // is no meld; 6-7-8 is; other hand cards may still be added.
  const eights = C.buildMeld([card(8, "S"), card(8, "H"), card(8, "D"), card(8, "C")]);
  eights.owner = 1;
  const spades = run(0, "S", 9, 12);
  const seven = card(7, "S"), six = card(6, "S"), king = card(13, "H"), kingS = card(13, "S");
  let s = playState([seven, king, kingS], [eights, spades], { takeRule: true });
  const eight = eights.entries.find((e) => e.suit === "S").card;
  s = apply(s, { type: "take", meld: 0, id: eight.id }, "154: take the 8♠");
  ok(s.takenIds.length === 1 && s.takenIds[0] === eight.id && s.melds[0].entries.length === 3, "154: 8♠ taken, three 8s stay");
  const ext = C.applyMove(s, { type: "extend", meld: 1, id: eight.id });
  ok(!ext.ok && ext.reason === "taken-new-meld", "154: taken 8♠ not added to the run: " + ext.reason);
  const back = C.applyMove(s, { type: "extend", meld: 0, id: eight.id });
  ok(!back.ok && back.reason === "taken-new-meld", "154: not even back to its own set: " + back.reason);
  const two = C.applyMove(s, { type: "meld", ids: [seven.id, eight.id] });
  ok(!two.ok && two.reason === "not-a-meld", "154: 7♠ 8♠ alone are no meld: " + two.reason);
  const dis = C.applyMove(s, { type: "discard", id: king.id });
  ok(!dis.ok && dis.reason === "taken-first", "154: no discard while the 8♠ is in hand: " + dis.reason);
  const kAdd = apply(s, { type: "extend", meld: 1, id: kingS.id }, "154: another hand card (K♠) may still be added");
  ok(ranks(kAdd.melds[1]) === "9,10,11,12,13" && kAdd.takenIds.length === 1, "154: run 9-K♠, the 8♠ still to lay out");
  // With the 6♠ as third card: new run 6-7-8, then discarding is allowed.
  let t = playState([seven, six, king], [C.clone(eights), C.clone(spades)], { takeRule: true });
  t = apply(t, { type: "take", meld: 0, id: eight.id }, "154: take the 8♠ (b)");
  t = apply(t, { type: "meld", ids: [six.id, seven.id, eight.id] }, "154: new run 6-7-8♠");
  ok(!t.takenIds.length && t.melds.length === 3, "154: taken card laid out, duty gone");
  t = apply(t, { type: "discard", id: king.id }, "154: discard allowed afterwards");
}

// ---- Computer games with every option ------------------------------------
const OPTIONS = [
  {},
  { handRule: true },
  { knockRule: true },
  { handRule: true, knockRule: true, takeRule: true, splitRule: true, jokerLayoffRule: true },
  { jokerLayoffRule: true, takeRule: true },
  { discardRule: true, knockRule: true }
];
const stats = { rounds: 0, wins: 0, noWinner: 0, handOuts: 0, knocks: 0, gives: 0, lowJokers: 0, maxSteps: 0 };
for (let g = 1; g <= GAMES; g++) {
  const opt = OPTIONS[g % OPTIONS.length];
  const players = 2 + (g % 3);
  const r = rng(g * 7919);
  let s = C.createInitialState(Object.assign({ players, rng: r, dealer: g % players }, opt));
  let steps = 0;
  while (!s.over) {
    // Player 0 knocks now and then where allowed (as the human would).
    if (s.knockRule && C.canKnock(s, 0) && r() < 0.3) {
      s = apply(s, { type: "knock", player: 0 }, "game " + g + ": knock");
      stats.knocks++;
    }
    const mv = AI.chooseMove(s, 1 + (g % 3), r);
    const res = C.applyMove(s, mv);
    if (!res.ok) { ok(false, "game " + g + ": computer move refused " + JSON.stringify(mv) + " " + res.reason + " phase " + s.phase); break; }
    if (mv.type === "knockGive") stats.gives++;
    if (mv.type === "extend" && mv.end === "low") stats.lowJokers++;
    s = res.state;
    if (C.cardCount(s) !== 110) { ok(false, "game " + g + ": " + C.cardCount(s) + " cards"); break; }
    if (++steps > 5000) { ok(false, "game " + g + ": no end"); break; }
  }
  stats.maxSteps = Math.max(stats.maxSteps, steps);
  stats.rounds++;
  if (s.winner === null) stats.noWinner++; else stats.wins++;
  if (s.lastEvent && s.lastEvent.type === "handOut") stats.handOuts++;
}
console.log("Computer games: " + JSON.stringify(stats));
console.log(checks + " checks, " + fails + " failures");
if (fails) { console.log("romme-core: FAILED"); process.exit(1); }
console.log("romme-core: OK");
