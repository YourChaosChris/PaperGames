// tests/cardduel-core.js
// CardDuelCore ("Card Duel"): the decks, the rules and the computer.
//  1. Decks: 4 elements, 20 cards each, at most 6 abilities in the game,
//     every card name and ability has its texts (cd_card_*, cd_ab_*).
//  2. Balance: GAMES (500) games per deck pairing (all 16), medium against
//     medium, the starter chosen in turn. Every game ends, every move is
//     legal, no card gets lost or doubled; each deck wins 40-60 % in every
//     pairing, the starter 45-55 % (seat advantage at most 5 points).
//  3. Levels: hard against medium, medium against easy, hard against easy
//     (LEVEL_GAMES, 200 each, seats and decks in turn): the higher level
//     wins at least 60 / 70 / 80 %.
//  4. Single rules (task 149): power store (3 a turn, at most 9, starter
//     2 in the first turn), start life 17 / 20 and 4 cards each, new
//     creatures attack at once, Warden, Ranged, Thick Skin, the hand limit
//     of 7 (no draw), the discard pile as new deck, 6 creatures, old saves
//     (no rules: 2) are not current.
//  5. Pictures (cardduel-art.js): every card has its own drawing, no
//     drawing belongs to two cards, no drawing without a card, a portrait
//     for every element; the size of the picture file (under 300 KB).
// No server or browser needed. About 60 seconds.

const path = require("path");
const C = require(path.join(__dirname, "..", "cardduel-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "500", 10);
const LN = parseInt(process.env.LEVEL_GAMES || "200", 10);

// --- 1. decks -----------------------------------------------------------
C.ELEMENTS.forEach((el) => check(C.deckList(el).length === C.DECK_SIZE && C.DECK_SIZE === 20, el + ": deck has " + C.deckList(el).length + " cards, expected 20"));
const used = {};
C.CARDS.concat(C.TOKENS).forEach((c) => {
  c.abil.forEach((a) => { used[a] = true; });
  const key = "cd_card_" + c.id.replace(/^[a-z]+_/, "");
  Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][key], l + ": no text " + key));
});
check(Object.keys(used).length <= 6 && C.ABILITIES.length <= 6, "more than 6 abilities");
Object.keys(used).forEach((a) => check(C.ABILITIES.indexOf(a) !== -1, "ability " + a + " not in ABILITIES"));
C.ABILITIES.forEach((a) => Object.keys(STRINGS).forEach((l) => {
  check(!!STRINGS[l]["cd_ab_" + a] && !!STRINGS[l]["cd_ab_" + a + "_desc"], l + ": no text for ability " + a);
}));

// --- 2. balance -----------------------------------------------------------
// Every card of a player is in exactly one place: deck, hand, row (not the
// summoned Saplings) or discard pile.
function cardsKept(s) {
  return [0, 1].every((p) => {
    const pl = s.players[p];
    const all = pl.deck.concat(pl.hand, pl.grave, pl.board.map((m) => m.id).filter((id) => id !== "forest_sapling")).sort();
    return all.join() === C.deckList(s.decks[p]).sort().join();
  });
}

function play(decks, starter, seed, levels) {
  const rng = C.makeRng(seed);
  const s = C.createGame(decks, starter, rng);
  for (let steps = 0; s.winner === null; steps++) {
    if (steps > 3000) return { stuck: true };
    const a = C.chooseAction(s, levels[s.current], rng);
    if (!C.isLegal(s, a)) return { illegal: JSON.stringify(a) };
    C.apply(s, a);
    if (a.type === "end" && !cardsKept(s)) return { lost: true };
  }
  if (!cardsKept(s)) return { lost: true };
  return { winner: s.winner, turns: s.turn, reshuffles: s.log.filter((e) => e.k === "reshuffle").length };
}

const t0 = Date.now();
const rows = [];
let seed = 1, starterWins = 0, games = 0, turns = 0, maxTurns = 0;
const deckW = {}, deckG = {};
C.ELEMENTS.forEach((a) => C.ELEMENTS.forEach((b) => {
  let w0 = 0;
  for (let i = 0; i < N; i++) {
    const starter = i % 2;
    const r = play([a, b], starter, seed++, ["medium", "medium"]);
    if (r.stuck) { fails.push(a + " vs " + b + ": a game did not end"); continue; }
    if (r.illegal) { fails.push(a + " vs " + b + ": illegal move " + r.illegal); continue; }
    if (r.lost) { fails.push(a + " vs " + b + ": a card got lost or doubled"); continue; }
    if (r.winner === 0) w0++;
    if (r.winner === starter) starterWins++;
    games++; turns += r.turns; maxTurns = Math.max(maxTurns, r.turns);
  }
  const pct = 100 * w0 / N;
  rows.push({ a, b, pct });
  check(pct >= 40 && pct <= 60, a + " vs " + b + ": " + pct.toFixed(1) + " % for " + a + ", outside 40-60 %");
  if (a !== b) {
    deckW[a] = (deckW[a] || 0) + w0; deckG[a] = (deckG[a] || 0) + N;
    deckW[b] = (deckW[b] || 0) + N - w0; deckG[b] = (deckG[b] || 0) + N;
  }
}));
const starterPct = 100 * starterWins / games;
check(starterPct >= 45 && starterPct <= 55, "the starter wins " + starterPct.toFixed(1) + " %, outside 45-55 %");

console.log("Deck pairings, " + N + " games each (medium vs medium), wins of the first deck:");
console.log("  " + ["", ...C.ELEMENTS].map((x) => x.padEnd(8)).join(""));
C.ELEMENTS.forEach((a) => {
  console.log("  " + a.padEnd(8) + C.ELEMENTS.map((b) => (rows.find((r) => r.a === a && r.b === b).pct.toFixed(1) + " %").padEnd(8)).join(""));
});
console.log("Each deck against the others: " + C.ELEMENTS.map((e) => e + " " + (100 * deckW[e] / deckG[e]).toFixed(1) + " %").join(", "));
console.log("Seats: starter " + starterPct.toFixed(1) + " %, second player " + (100 - starterPct).toFixed(1) + " % of " + games + " games");
console.log("Game length: " + (turns / games).toFixed(1) + " turns on average (both players together), at most " + maxTurns + "; " + Math.round((Date.now() - t0) / 1000) + " s");

// --- 3. levels --------------------------------------------------------------
function duel(hi, lo, minPct) {
  let wins = 0, t = 0;
  for (let k = 0; k < LN; k++) {
    const hiSide = k % 2;
    const decks = [C.ELEMENTS[k % 4], C.ELEMENTS[(k >> 2) % 4]];
    const levels = hiSide === 0 ? [hi, lo] : [lo, hi];
    const r = play(decks, (k >> 1) % 2, 100000 + k, levels);
    if (r.stuck || r.illegal || r.lost) { fails.push(hi + " vs " + lo + ": game " + k + " " + (r.illegal ? "illegal move" : r.lost ? "card lost" : "did not end")); continue; }
    if (r.winner === hiSide) wins++;
    t += r.turns;
  }
  const pct = 100 * wins / LN;
  check(pct >= minPct, hi + " beats " + lo + " only " + pct.toFixed(1) + " %, expected at least " + minPct);
  console.log("Level " + hi + " against " + lo + ": " + pct.toFixed(1) + " % of " + LN + " games for " + hi + ", " + (t / LN).toFixed(1) + " turns");
}
duel("hard", "medium", 60);
duel("medium", "easy", 70);
duel("hard", "easy", 80);

// --- 4. single rules ---------------------------------------------------------
function blank(decks) {
  const s = C.createGame(decks || ["forest", "stone"], 0, C.makeRng(7));
  s.players.forEach((p) => { p.hand = []; p.board = []; p.power = 9; });
  return s;
}
function put(s, side, id, ready) {
  const c = C.card(id);
  s.players[side].board.push({ id, uid: s.uid++, atk: c.atk, hp: c.hp, max: c.hp, abil: c.abil.slice(), ready: ready !== false });
}
(function rules() {
  // Start: 4 cards each before the first draw, life 17 / 20, 2 power.
  let s = C.createGame(["water", "fire"], 1, C.makeRng(3));
  check(s.rules === 2 && C.isCurrentState(s), "a new game is not current (rules: 2)");
  check(s.players[1].hand.length === 5 && s.players[0].hand.length === 4, "start: 4 cards each, the starter draws 1 in the first turn");
  check(s.players[1].life === 17 && s.players[0].life === 20, "start: the starter has 17 life, the other 20");
  check(s.players[1].power === 2, "the starter's first turn should bring 2 power, got " + s.players[1].power);
  C.apply(s, { type: "end" });
  check(s.players[0].power === 3, "the second player's first turn should bring 3 power");
  C.apply(s, { type: "end" });
  check(s.players[1].power === 5, "unused power should stay (2 + 3 = 5), got " + s.players[1].power);
  for (let i = 0; i < 6; i++) C.apply(s, { type: "end" });
  check(s.players[1].power === 9, "the power store should stop at 9, got " + s.players[1].power);
  // Old saves (no rules: 2) are not current.
  const old = C.clone(s); delete old.rules;
  check(!C.isCurrentState(old), "a save without rules: 2 counts as current");
  const old2 = C.clone(s); old2.players.forEach((p) => { delete p.grave; });
  check(!C.isCurrentState(old2), "a save without discard piles counts as current");
  check(!C.isCurrentState(null) && !C.isCurrentState({}), "an empty save counts as current");
  // New creatures attack at once.
  s = blank(["fire", "stone"]);
  s.players[0].hand = ["fire_sparkimp"];
  C.apply(s, { type: "play", card: 0 });
  check(C.attackTargets(s, 0).indexOf("mage") !== -1, "a creature should attack in the turn it is played");
  C.apply(s, { type: "attack", attacker: 0, target: "mage" });
  check(C.attackTargets(s, 0).length === 0, "a creature attacked twice in one turn");
  // Warden: the one with the highest attack strikes the attacker of its mage first.
  s = blank();
  put(s, 0, "fire_sparkimp");
  put(s, 1, "stone_pebblewight");
  put(s, 1, "stone_granitekeeper");
  let life = s.players[1].life;
  C.apply(s, { type: "attack", attacker: 0, target: "mage" });
  check(s.players[0].board.length === 0 && s.players[1].life === life, "Warden: Granite Keeper (attack 3) should defeat the Spark Imp (2 life) before it hits the mage");
  check(s.players[0].grave.indexOf("fire_sparkimp") !== -1, "a defeated creature should go to the discard pile");
  s = blank();
  put(s, 0, "stone_oregolem");
  put(s, 1, "stone_pebblewight");
  life = s.players[1].life;
  C.apply(s, { type: "attack", attacker: 0, target: "mage" });
  check(s.players[0].board[0].hp === 6 && s.players[1].life === life - 4, "Warden 1 against Thick Skin: no damage, the golem still hits for 4");
  check(C.attackTargets(blank(), 0).length === 0, "an empty row has no attacks");
  s = blank();
  put(s, 0, "forest_mossbear");
  put(s, 1, "stone_granitekeeper");
  put(s, 1, "stone_rockram");
  check(C.attackTargets(s, 0).length === 3, "a Warden does not stop attacks on other targets");
  // Ranged: no damage back.
  s = blank(["fire", "water"]);
  put(s, 0, "fire_ashwolf");
  put(s, 1, "water_mistotter");
  C.apply(s, { type: "attack", attacker: 0, target: 0 });
  check(s.players[0].board[0].hp === 3 && s.players[1].board[0].hp === 2, "Ranged: the wolf takes nothing, the otter keeps 2");
  // Thick Skin.
  s = blank();
  put(s, 0, "fire_sparkimp");
  put(s, 1, "stone_quartzknight");
  C.apply(s, { type: "attack", attacker: 0, target: 0 });
  check(s.players[1].board[0].hp === 2, "Thick Skin: 2 damage should become 1 (life 3 -> 2), got " + s.players[1].board[0].hp);
  // Hand limit: with 7 cards no card is drawn, it stays on the deck.
  s = blank();
  s.players[1].hand = ["stone_boulder", "stone_boulder", "stone_rumble", "stone_rumble", "stone_rockram", "stone_rockram", "stone_rockhide"];
  let deck = s.players[1].deck.length;
  C.apply(s, { type: "end" });
  check(s.players[1].hand.length === 7 && s.players[1].deck.length === deck, "a full hand (7) should draw nothing and keep the deck");
  // Empty deck: the discard pile becomes the new deck.
  s = blank();
  s.players[1].deck = [];
  s.players[1].grave = ["stone_boulder", "stone_rockram", "stone_rumble"];
  life = s.players[1].life;
  C.apply(s, { type: "end" });
  check(s.players[1].hand.length === 1 && s.players[1].deck.length === 2 && s.players[1].grave.length === 0 && s.players[1].life === life, "empty deck: the discard pile should become the deck, no life lost");
  s = blank();
  s.players[1].deck = [];
  s.players[1].grave = [];
  C.apply(s, { type: "end" });
  check(s.players[1].hand.length === 0 && s.winner === null, "empty deck and discard pile: simply no card");
  // A spell goes to the discard pile.
  s = blank(["fire", "stone"]);
  s.players[0].hand = ["fire_sparkflight"];
  C.apply(s, { type: "play", card: 0, target: { side: 1, index: "mage" } });
  check(s.players[0].grave.join() === "fire_sparkflight", "a played spell should go to the discard pile");
  // At most 6 creatures.
  s = blank();
  for (let i = 0; i < 6; i++) put(s, 0, "forest_mosskin");
  s.players[0].hand = ["forest_mosskin"];
  check(!C.canPlay(s, 0), "a 7th creature could be played");
})();

// --- 5. pictures ------------------------------------------------------------
(function () {
  const fs = require("fs");
  const vm = require("vm");
  const file = path.join(__dirname, "..", "cardduel-art.js");
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8") + "\nthis.CardDuelArt = CardDuelArt;", ctx);
  const A = ctx.CardDuelArt;
  const cards = C.CARDS.concat(C.TOKENS).map((c) => c.id);
  const seen = {};
  cards.forEach((id) => {
    const pic = A.picture(id);
    check(/^<svg [^>]*viewBox="0 0 100 70"/.test(pic) && pic.length > 300, id + ": no picture");
    check(pic.indexOf("url(#cda-fr-" + id.split("_")[0] + ")") !== -1, id + ": picture without the frame of its element");
    // The drawing alone, without the element frame.
    const body = pic.replace(/cda-fr-[a-z]+/g, "");
    if (seen[body]) fails.push(id + ": same picture as " + seen[body]);
    seen[body] = id;
  });
  A.ids().forEach((id) => check(cards.indexOf(id) !== -1, "picture " + id + " belongs to no card"));
  const ports = C.ELEMENTS.map((el) => A.portrait(el));
  ports.forEach((p, i) => check(/viewBox="0 0 60 60"/.test(p), C.ELEMENTS[i] + ": no mage portrait"));
  check(new Set(ports).size === ports.length, "two mages share a portrait");
  const kb = fs.statSync(file).size / 1024;
  check(kb < 300, "cardduel-art.js is " + kb.toFixed(1) + " KB, expected under 300");
  console.log("pictures: " + cards.length + " cards, " + Object.keys(seen).length + " different drawings, " + ports.length + " portraits; cardduel-art.js " + kb.toFixed(1) + " KB");
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== CARD DUEL CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== CARD DUEL CORE: 0 failures ===");
