// tests/cardduel-core.js
// CardDuelCore ("Card Duel"): the decks, the rules and the computer.
//  1. Decks: 4 elements, 30 cards each, at most 6 abilities in the game,
//     every card name and ability has its texts (cd_card_*, cd_ab_*).
//  2. Balance: 500 games per deck pairing (all 16, both seats), medium
//     against medium, the starter chosen in turn. Every game ends, every
//     move is legal; each deck wins 40-60 % in every pairing, the starter
//     at most 55 %.
//  3. Hard against easy: at least 70 % over 200 games.
//  4. A few rules on their own: Bulwark, Nimble, Thick Skin, the empty
//     deck, the 6-creature limit, the evening out of the start.
//  5. Pictures (cardduel-art.js): every card has its own drawing, no
//     drawing belongs to two cards, no drawing without a card, a portrait
//     for every element; the size of the picture file (under 300 KB).
// No server or browser needed. About 90 seconds.

const path = require("path");
const C = require(path.join(__dirname, "..", "cardduel-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "500", 10);

// --- 1. decks -----------------------------------------------------------
C.ELEMENTS.forEach((el) => check(C.deckList(el).length === 30, el + ": deck has " + C.deckList(el).length + " cards, expected 30"));
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
function play(decks, starter, seed, levels) {
  const rng = C.makeRng(seed);
  const s = C.createGame(decks, starter, rng);
  for (let steps = 0; s.winner === null; steps++) {
    if (steps > 3000) return { stuck: true };
    const a = C.chooseAction(s, levels[s.current], rng);
    if (!C.isLegal(s, a)) return { illegal: JSON.stringify(a) };
    C.apply(s, a);
  }
  return { winner: s.winner, turns: s.turn };
}

const t0 = Date.now();
const rows = [];
let seed = 1, starterWins = 0, games = 0, turns = 0;
const deckW = {}, deckG = {};
C.ELEMENTS.forEach((a) => C.ELEMENTS.forEach((b) => {
  let w0 = 0;
  for (let i = 0; i < N; i++) {
    const starter = i % 2;
    const r = play([a, b], starter, seed++, ["medium", "medium"]);
    if (r.stuck) { fails.push(a + " vs " + b + ": a game did not end"); continue; }
    if (r.illegal) { fails.push(a + " vs " + b + ": illegal move " + r.illegal); continue; }
    if (r.winner === 0) w0++;
    if (r.winner === starter) starterWins++;
    games++; turns += r.turns;
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
check(starterPct <= 55, "the starter wins " + starterPct.toFixed(1) + " %, more than 55 %");

console.log("Deck pairings, " + N + " games each (medium vs medium), wins of the first deck:");
console.log("  " + ["", ...C.ELEMENTS].map((x) => x.padEnd(8)).join(""));
C.ELEMENTS.forEach((a) => {
  console.log("  " + a.padEnd(8) + C.ELEMENTS.map((b) => (rows.find((r) => r.a === a && r.b === b).pct.toFixed(1) + " %").padEnd(8)).join(""));
});
console.log("Each deck against the others: " + C.ELEMENTS.map((e) => e + " " + (100 * deckW[e] / deckG[e]).toFixed(1) + " %").join(", "));
console.log("Starter wins: " + starterPct.toFixed(1) + " % of " + games + " games, " + (turns / games).toFixed(1) + " turns on average, " + Math.round((Date.now() - t0) / 1000) + " s");

// --- 3. hard against easy ------------------------------------------------
let hardWins = 0;
const HN = 200;
for (let k = 0; k < HN; k++) {
  const hardSide = k % 2;
  const decks = [C.ELEMENTS[k % 4], C.ELEMENTS[(k >> 2) % 4]];
  const levels = hardSide === 0 ? ["hard", "easy"] : ["easy", "hard"];
  const r = play(decks, (k >> 1) % 2, 100000 + k, levels);
  if (r.winner === hardSide) hardWins++;
  if (r.stuck || r.illegal) fails.push("hard vs easy: game " + k + " " + (r.illegal ? "illegal move" : "did not end"));
}
const hardPct = 100 * hardWins / HN;
check(hardPct >= 70, "hard beats easy only " + hardPct.toFixed(1) + " %");
console.log("Hard against easy: " + hardPct.toFixed(1) + " % of " + HN + " games");

// --- 4. single rules ---------------------------------------------------------
function blank(decks) {
  const s = C.createGame(decks || ["forest", "stone"], 0, C.makeRng(7));
  s.players.forEach((p) => { p.hand = []; p.board = []; p.power = 10; p.maxPower = 10; });
  return s;
}
function put(s, side, id, ready) {
  const c = C.card(id);
  s.players[side].board.push({ id, uid: s.uid++, atk: c.atk, hp: c.hp, max: c.hp, abil: c.abil.slice(), ready: !!ready });
}
(function rules() {
  let s = blank();
  put(s, 0, "forest_mossbear", true);
  put(s, 1, "stone_granitekeeper");
  put(s, 1, "stone_rockram");
  const t = C.attackTargets(s, 0);
  check(t.length === 1 && t[0] === 0, "Bulwark: only the Bulwark may be attacked, got " + JSON.stringify(t));
  s = blank();
  s.players[0].hand = ["fire_ashwolf", "forest_foxspirit"];
  s.players[0].board = [];
  s.decks = ["fire", "stone"];
  C.apply(s, { type: "play", card: 0 });
  C.apply(s, { type: "play", card: 0 });
  check(C.attackTargets(s, 0).length > 0, "Nimble: Ash Wolf should attack at once");
  check(C.attackTargets(s, 1).length === 0, "a fresh creature without Nimble attacked at once");
  s = blank();
  put(s, 0, "fire_sparkimp", true);
  put(s, 1, "stone_quartzknight");
  C.apply(s, { type: "attack", attacker: 0, target: 0 });
  check(s.players[1].board[0].hp === 2, "Thick Skin: 2 damage should become 1 (life 3 -> 2), got " + s.players[1].board[0].hp);
  s = blank();
  s.players[1].deck = [];
  const life = s.players[1].life;
  C.apply(s, { type: "end" });
  check(s.players[1].life === life - C.EMPTY_DECK_DAMAGE, "empty deck should cost " + C.EMPTY_DECK_DAMAGE + " life");
  s = blank();
  for (let i = 0; i < 6; i++) put(s, 0, "forest_mosskin");
  s.players[0].hand = ["forest_mosskin"];
  check(!C.canPlay(s, 0), "a 7th creature could be played");
  s = C.createGame(["water", "water"], 1, C.makeRng(3));
  check(s.players[1].hand.length === 3 && s.players[0].hand.length === 4, "start: starter 3 cards (no draw in the first turn), the other 4");
  C.apply(s, { type: "end" });
  check(s.players[0].power === 2 && s.players[0].maxPower === 1, "the second player's first turn should have 2 power (1 + 1)");
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
