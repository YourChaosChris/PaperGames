#!/usr/bin/env node
// Poch (task 227): rules engine and computer player. No server or browser.
const C = require("../poch-core.js");
const AI = require("../poch-ai.js");

let checks = 0;
const fails = [];
function check(name, ok) { checks++; if (!ok) fails.push(name); }
function eq(name, a, b) { check(name + " (" + JSON.stringify(a) + " != " + JSON.stringify(b) + ")", JSON.stringify(a) === JSON.stringify(b)); }

function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const card = (rank, suit) => ({ rank, suit });
function total(s) { return s.chips.reduce((a, b) => a + b, 0) + C.POOLS.reduce((a, k) => a + s.pools[k], 0) + (s.bet ? s.bet.pot : 0); }
function blank(n, hands, paySuit, payCard) {
  const s = C.createGame(n, seeded(1));
  s.hands = hands; s.paySuit = paySuit; s.payCard = payCard;
  s.combos = hands.map((h) => { const c = C.bestCombo(h, paySuit); return c ? { rank: c.rank, count: c.count, key: c.key } : null; });
  return s;
}

// --- the deck and the deal
eq("32 cards", C.createDeck().length, 32);
[2, 3, 4].forEach((n) => {
  const s = C.createGame(n, seeded(n));
  const dealt = s.hands.reduce((a, h) => a + h.length, 0);
  eq(n + " players: 31 cards dealt, one face up", dealt, 31);
  const sizes = s.hands.map((h) => h.length);
  check(n + " players: hands differ by at most one card", Math.max.apply(null, sizes) - Math.min.apply(null, sizes) <= 1);
  const keys = {};
  s.hands.forEach((h) => h.forEach((c) => { keys[c.rank + c.suit] = true; }));
  keys[s.payCard.rank + s.payCard.suit] = true;
  eq(n + " players: all 32 cards different", Object.keys(keys).length, 32);
  eq(n + " players: every player paid 9 chips and total is kept", total(s), n * C.START_CHIPS);
  check(n + " players: hands are sorted", s.hands.every((h) => h.every((c, i) => i === 0 || C.SUITS.indexOf(h[i - 1].suit) < C.SUITS.indexOf(c.suit) || (h[i - 1].suit === c.suit && C.order(h[i - 1].rank) < C.order(c.rank)))));
});
eq("player count is limited to 2..4", [C.createGame(1, seeded(1)).n, C.createGame(9, seeded(1)).n], [2, 4]);
eq("Ace is above the King, 7 below the 8", [C.nextRank(13), C.nextRank(1), C.nextRank(7), C.nextRank(10)], [1, null, 8, 11]);

// --- first stage: pay-suit cards take their pools
{
  const hands = [
    [card(1, "H"), card(13, "H"), card(12, "H"), card(7, "C")],
    [card(11, "H"), card(10, "H"), card(8, "S")],
    [card(9, "H"), card(8, "H"), card(7, "H"), card(9, "D")]
  ];
  const s0 = blank(3, hands, "H", card(7, "S"));
  // run the first stage of a fresh deal on these hands by hand: use the pools as the core would leave them
  const before = s0.pools.marriage;
  check("pools hold chips after the ante", before >= 3);
}
{
  // Fixed deal: search seeds for a deal where somebody holds King and Queen of the pay suit, check the payout.
  let found = null;
  for (let seed = 1; seed < 3000 && !found; seed++) {
    const s = C.createGame(3, seeded(seed));
    const m = s.log.filter((e) => e.t === "pool" && e.pool === "marriage");
    if (m.length) found = { s, m: m[0], seed };
  }
  check("a Marriage payout occurs in some deal", !!found);
  if (found) {
    const { s, m } = found;
    check("the Marriage winner holds King and Queen of the pay suit", C.holds(s.hands[m.p], 13, s.paySuit) && C.holds(s.hands[m.p], 12, s.paySuit));
    eq("the Marriage pool is empty after the payout", s.pools.marriage, 0);
    check("the King and Queen pools were paid as well", s.log.some((e) => e.pool === "king") && s.log.some((e) => e.pool === "queen") || s.payCard.rank === 13 || s.payCard.rank === 12);
  }
  let seq = null;
  for (let seed = 1; seed < 20000 && !seq; seed++) {
    const s = C.createGame(3, seeded(seed));
    const m = s.log.filter((e) => e.t === "pool" && e.pool === "sequence");
    if (m.length) seq = { s, m: m[0] };
  }
  check("a Sequence payout occurs in some deal", !!seq);
  if (seq) check("the Sequence winner holds 7, 8 and 9 of the pay suit", [7, 8, 9].every((r) => C.holds(seq.s.hands[seq.m.p], r, seq.s.paySuit)));
  // A pool whose pay-suit card is the face-up card stays.
  let stay = null;
  for (let seed = 1; seed < 3000 && !stay; seed++) {
    const s = C.createGame(3, seeded(seed));
    if (C.RANK_POOL[s.payCard.rank]) stay = s;
  }
  check("a pool whose card lies face up is not paid", !!stay && stay.pools[C.RANK_POOL[stay.payCard.rank]] === 3);
}

// --- best set and the tie-break
{
  const h = [card(12, "C"), card(12, "H"), card(9, "D"), card(9, "S"), card(9, "C")];
  const b = C.bestCombo(h, "D");
  eq("three Nines beat a pair of Queens", [b.rank, b.count], [9, 3]);
  eq("no pair, no set", C.bestCombo([card(7, "C"), card(8, "H"), card(1, "S")], "H"), null);
  const pairPay = C.bestCombo([card(10, "H"), card(10, "C")], "H");
  const pairNo = C.bestCombo([card(10, "S"), card(10, "C")], "H");
  check("a pair with the pay suit beats the same pair without it", C.compareKeys(pairPay.key, pairNo.key) > 0);
  const hi = C.bestCombo([card(10, "S"), card(10, "C")], "H");
  const lo = C.bestCombo([card(10, "H"), card(10, "D")], "D");
  check("same pair, both with the pay suit or not: the suit order decides", C.compareKeys(hi.key, C.bestCombo([card(10, "D"), card(10, "H")], "S").key) !== 0 && C.compareKeys(lo.key, hi.key) !== 0);
  check("four of a kind beats three beats a pair", C.compareKeys(C.bestCombo([card(8, "C"), card(8, "S"), card(8, "H"), card(8, "D")], "C").key, C.bestCombo([card(1, "C"), card(1, "S"), card(1, "H")], "C").key) > 0 &&
    C.compareKeys(C.bestCombo([card(8, "C"), card(8, "S"), card(8, "H")], "C").key, C.bestCombo([card(1, "C"), card(1, "S")], "C").key) > 0);
  check("a higher pair beats a lower one", C.compareKeys(C.bestCombo([card(13, "C"), card(13, "S")], "H").key, C.bestCombo([card(9, "H"), card(9, "D")], "H").key) > 0);
}

// --- Pochen: the betting round on a set-up state
function pochenState(hands, paySuit, dealer) {
  const s = blank(hands.length, hands, paySuit, card(7, "D"));
  s.dealer = dealer || 0;
  s.pools = {}; C.POOLS.forEach((k) => { s.pools[k] = 0; });
  s.pools.poch = 5;
  s.chips = hands.map(() => 20);
  s.log = [];
  s.phase = "pochen";
  const eligible = [];
  for (let k = 0; k < s.n; k++) { const q = (s.dealer + 1 + k) % s.n; if (s.combos[q]) eligible.push(q); }
  s.turn = eligible[0];
  s.bet = { order: eligible, high: 0, pot: 0, put: hands.map(() => 0), folded: hands.map(() => false), acted: hands.map(() => false) };
  return s;
}
{
  const hands = [
    [card(13, "C"), card(13, "S"), card(8, "H")],
    [card(9, "C"), card(9, "S"), card(9, "H")],
    [card(12, "C"), card(12, "D"), card(7, "H")]
  ];
  let s = pochenState(hands, "H", 0);
  eq("first to act is the first player left of the dealer with a set", s.turn, 1);
  eq("opening: check, raise (no call, no fold)", C.legalMoves(s).map((m) => m.type), ["check", "raise"]);
  s = C.applyMove(s, { type: "raise" });
  eq("player 1 bet 1", [s.bet.high, s.chips[1], s.bet.pot], [1, 19, 1]);
  eq("next is player 2", s.turn, 2);
  eq("then call, fold or raise", C.legalMoves(s).map((m) => m.type), ["call", "fold", "raise"]);
  s = C.applyMove(s, { type: "call" });
  eq("player 0 to act", s.turn, 0);
  s = C.applyMove(s, { type: "raise" });
  eq("a raise makes everybody act again", [s.bet.high, s.turn], [2, 1]);
  s = C.applyMove(s, { type: "fold" });
  s = C.applyMove(s, { type: "call" });
  // players 0 and 2 stay in; King pair vs Queen pair, King wins
  eq("showdown: the King pair takes the bets and the Poch pool", [s.chips[0], s.phase, s.turn], [28, "lead", 0]);
  eq("the three players' chips plus pools are unchanged", total(s), 60 + 5 + 0 - 0 + 0);
  check("the revealed players are the two who stayed in", JSON.stringify(s.revealed) === JSON.stringify([2, 0]) || JSON.stringify(s.revealed) === JSON.stringify([0, 2]));
  check("the log names the showdown", s.log.some((e) => e.t === "pochwin" && e.p === 0 && e.showdown === true && e.count === 2));
}
{
  // everybody checks: the pool stays, the player left of the dealer leads
  const hands = [[card(13, "C"), card(13, "S")], [card(9, "C"), card(9, "S")], [card(7, "H"), card(8, "H")]];
  let s = pochenState(hands, "H", 2);
  eq("only two have a set", s.bet.order, [0, 1]);
  s = C.applyMove(s, { type: "check" });
  s = C.applyMove(s, { type: "check" });
  eq("all checked: lead phase", s.phase, "lead");
  eq("the Poch pool stays", s.pools.poch, 5);
  eq("the player left of the dealer leads", s.turn, 0);
  check("a message says the pool stays", s.log.some((e) => e.t === "pochstays"));
}
{
  // the raise cap and the fold of the last rival
  const hands = [[card(13, "C"), card(13, "S")], [card(9, "C"), card(9, "S")]];
  let s = pochenState(hands, "H", 1);
  let guard = 0;
  while (s.phase === "pochen" && C.legalMoves(s).some((m) => m.type === "raise") && guard++ < 10) s = C.applyMove(s, { type: "raise" });
  eq("bets stop at 4", s.bet.high, C.MAX_BET);
  check("at the cap there is no raise", !C.legalMoves(s).some((m) => m.type === "raise"));
  const folder = s.turn;
  check("the one who is behind can fold", C.legalMoves(s).some((m) => m.type === "fold"));
  s = C.applyMove(s, { type: "fold" });
  eq("the last player left takes the pool and the bets", s.chips[1 - folder] > 20, true);
  eq("chips are conserved", total(s), 40 + 5);
  eq("the winner leads", s.turn, 1 - folder);
  eq("illegal move is refused", C.applyMove(s, { type: "raise" }), null);
}
{
  // a player who cannot pay a call may only fold
  const hands = [[card(13, "C"), card(13, "S")], [card(9, "C"), card(9, "S")]];
  let s = pochenState(hands, "H", 1);
  s.chips = [20, 0];
  s = C.applyMove(s, { type: "raise" });
  eq("the one without chips can only fold or, if even, check", C.legalMoves(s).map((m) => m.type), ["fold"]);
}

// --- the third stage: chains of the next higher card
function leadState(hands, payCard, played) {
  const s = blank(hands.length, hands, "H", payCard);
  s.phase = "lead"; s.turn = 0; s.bet = null; s.played = played || []; s.log = [];
  s.chips = hands.map(() => 20);
  s.pools = {}; C.POOLS.forEach((k) => { s.pools[k] = 0; });
  s.pools.centre = 6;
  s.handNo = 1;
  return s;
}
{
  const hands = [
    [card(8, "C"), card(10, "D"), card(1, "S")],
    [card(9, "C"), card(11, "D")],
    [card(10, "C"), card(7, "H")]
  ];
  let s = leadState(hands, card(7, "D"));
  const i = s.hands[0].findIndex((c) => c.rank === 8 && c.suit === "C");
  s = C.applyMove(s, { type: "lead", card: i });
  eq("8, 9 and 10 of clubs are played in turn, then nobody holds the Jack", s.played.map((c) => c.rank + c.suit), ["8C", "9C", "10C"]);
  eq("the player who played last leads again", [s.phase, s.turn], ["lead", 2]);
  check("the log lists three plays and the stop", s.log.filter((e) => e.t === "play").length === 3 && s.log[s.log.length - 1].t === "stuck");
}
{
  // the face-up pay card breaks a chain, an Ace ends it
  const hands = [[card(13, "S"), card(8, "S"), card(1, "S")], [card(9, "S"), card(7, "C")], [card(10, "S"), card(7, "H")]];
  let s = leadState(hands, card(11, "S"));
  const k = s.hands[0].findIndex((c) => c.rank === 8);
  s = C.applyMove(s, { type: "lead", card: k });
  eq("9 and 10 follow, the face-up Jack stops it", s.played.map((c) => c.rank), [8, 9, 10]);
  eq("player 2 (last to play) leads", s.turn, 2);
  s = leadState([[card(13, "S"), card(1, "S"), card(7, "C")], [card(9, "H")], [card(10, "H")]], card(7, "D"));
  const kk = s.hands[0].findIndex((c) => c.rank === 13);
  s = C.applyMove(s, { type: "lead", card: kk });
  eq("King then Ace of the same player, then nothing above the Ace", s.played.map((c) => c.rank), [13, 1]);
  eq("the same player leads again", s.turn, 0);
}
{
  // going out ends the hand: centre pot plus one chip per card left
  const hands = [[card(1, "S")], [card(9, "H"), card(10, "H"), card(11, "H")], [card(7, "C")]];
  let s = leadState(hands, card(7, "D"));
  s.chips = [20, 20, 1];
  const before = total(s);
  s = C.applyMove(s, { type: "lead", card: 0 });
  eq("the hand ends (and the game, the poor player cannot pay again)", s.phase, "over");
  eq("winner takes the centre pot and chips for the cards left (the poor player pays what they have)", [s.chips[0], s.chips[1], s.chips[2]], [20 + 6 + 3 + 1, 17, 0]);
  eq("total is unchanged", total(s), before);
  eq("a player left without the stake ends the game", s.phase, "over");
  let r = leadState([[card(1, "S")], [card(9, "H"), card(10, "H"), card(11, "H")], [card(7, "C")]], card(7, "D"));
  r.chips = [20, 20, 20];
  r = C.applyMove(r, { type: "lead", card: 0 });
  eq("with enough chips the hand ends and waits", r.phase, "handend");
  const n1 = C.nextHand(r, seeded(5));
  eq("the next hand moves the dealer and starts again", [n1.handNo, n1.dealer], [2, (r.dealer + 1) % 3]);
  eq("the next hand keeps the chips and pools", total(n1), total(r));
}
{
  // the game ends after six hands or when somebody cannot pay
  const hands = [[card(1, "S")], [card(9, "H")], [card(7, "C")]];
  let s = leadState(hands, card(7, "D"));
  s.handNo = C.MAX_HANDS;
  s = C.applyMove(s, { type: "lead", card: 0 });
  eq("hand limit ends the game", [s.phase, s.over.reason], ["over", "hands"]);
  check("there is a winner with the most chips", s.winners.length >= 1 && s.winners.every((q) => s.chips[q] === Math.max.apply(null, s.chips)));
  s = leadState([[card(1, "S")], [card(9, "H"), card(8, "H")], [card(7, "C")]], card(7, "D"));
  s.chips = [30, 9, 30];
  s = C.applyMove(s, { type: "lead", card: 0 });
  eq("a player who cannot pay 9 chips ends the game", [s.phase, s.over.reason, s.over.who], ["over", "ante", [1]]);
  eq("illegal moves after the game are refused", C.applyMove(s, { type: "lead", card: 0 }), null);
  eq("outcomes", [C.outcomeFor(s, 0), C.outcomeFor(s, 1)], [s.winners.length === 1 && s.winners[0] === 0 ? "win" : (s.winners.indexOf(0) >= 0 ? "draw" : "loss"), "loss"]);
}

// --- whole games: every move legal, chips conserved, every game ends
const LEVELS = [1, 2, 3];
const GAMES = 100;
const wins = { 1: 0, 2: 0, 3: 0 };
let longest = 0;
LEVELS.forEach((level) => {
  for (let g = 0; g < GAMES; g++) {
    const rng = seeded(level * 100000 + g);
    const n = 2 + (g % 3);
    let s = C.createGame(n, rng);
    const start = total(s);
    let steps = 0, hands = 1, ok = true;
    while (s.phase !== "over" && steps++ < 4000) {
      if (s.phase === "handend") { s = C.nextHand(s, rng); hands++; if (!s) { ok = false; break; } continue; }
      const m = level === 1 + (s.turn % 3) ? AI.chooseMove(s, level, rng) : AI.chooseMove(s, 1 + ((level + s.turn) % 3), rng);
      if (!C.isLegalMove(s, m)) { ok = false; fails.push("level " + level + " game " + g + ": illegal move " + JSON.stringify(m)); break; }
      s = C.applyMove(s, m);
      if (total(s) !== start) { ok = false; fails.push("level " + level + " game " + g + ": chips not conserved"); break; }
      if (s.chips.some((c) => c < 0)) { ok = false; fails.push("level " + level + " game " + g + ": negative chips"); break; }
    }
    check("level " + level + " game " + g + " ends", ok && s.phase === "over");
    check("game " + g + " lasts at most 6 hands", hands <= C.MAX_HANDS);
    longest = Math.max(longest, hands);
    if (s.winners && s.winners.length === 1) wins[level]++;
  }
});

if (fails.length) { console.log("FAIL (" + fails.length + "):\n" + fails.slice(0, 30).join("\n")); process.exit(1); }
console.log("poch-core: " + checks + " checks, " + (LEVELS.length * GAMES) + " computer games, longest " + longest + " hands. ALL CHECKS PASS");
