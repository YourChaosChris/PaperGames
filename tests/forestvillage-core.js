// tests/forestvillage-core.js
// ForestVillageCore ("Forest Village"): data, rules and computer games.
//  1. 50 different cards (25 buildings, 25 animals), every animal belongs
//     to exactly one building and the other way round; every card, field,
//     resource, season and task has its text in 12 languages.
//  2. 500 computer games for each number of players (1 to 4): every game
//     ends, every move is legal, resources never go below 0, at most 15
//     cards per village, at most 8 in hand. With 2 to 4 players the first
//     player wins within +/- 8 percentage points of the fair share. The
//     range of points and the turns per player are printed.
//  3. Hard beats Easy in at least 70 % of 400 two-player games.
//  4. Single rules: an animal moves in for free next to its building,
//     a taken field is closed for others while shared fields are not,
//     spring gives a squirrel and lets production cards produce again,
//     the village holds at most 15 cards, scoring of pairs.
// No server or browser needed.

const path = require("path");
const F = require(path.join(__dirname, "..", "forestvillage-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "500", 10);

// --- 1. data -----------------------------------------------------------------
const ids = F.CARDS.map((c) => c.id);
check(new Set(ids).size === 50, "50 different cards expected, got " + new Set(ids).size);
check(F.CARDS.filter((c) => c.kind === "building").length === 25, "25 buildings expected");
F.CARDS.forEach((c) => {
  const partner = F.card(c.partner);
  check(!!partner && partner.kind !== c.kind && partner.partner === c.id, c.id + ": partner " + c.partner + " does not point back");
  check(Object.keys(c.cost).every((k) => F.RES.indexOf(k) !== -1 && c.cost[k] > 0), c.id + ": bad cost");
});
const keys = ids.map((id) => "fv_card_" + id)
  .concat(F.FIELDS.map((f) => "fv_field_" + f.id), F.RES.map((r) => "fv_res_" + r), F.SEASONS.map((x) => "fv_season_" + x), F.TASKS.map((t) => "fv_task_" + t.id));
keys.forEach((k) => Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][k], l + ": no text " + k)));
const de = ids.map((id) => STRINGS.de["fv_card_" + id]);
check(new Set(de).size === de.length, "German card names repeat");

// --- 2. computer games ---------------------------------------------------------
const t0 = Date.now();
[1, 2, 3, 4].forEach((n) => {
  let firstWins = 0, games = 0, turns = 0, minS = Infinity, maxS = -Infinity, soloWins = 0;
  const levels = ["easy", "medium", "hard"];
  for (let g = 0; g < N; g++) {
    const rng = F.makeRng(707 * n + g);
    const s = F.createGame(n, rng);
    const lv = s.players.map((_, i) => levels[(g + i) % 3]);
    let steps = 0, broken = "";
    while (!s.over && steps < 3000) {
      const a = F.chooseAction(s, n === 1 ? "medium" : lv[s.current], rng);
      if (!F.isLegal(s, a)) { broken = "illegal move " + JSON.stringify(a); break; }
      F.apply(s, a, rng);
      const bad = s.players.find((p) => F.RES.some((k) => p.res[k] < 0) || p.village.length > F.MAX_VILLAGE || p.hand.length > F.MAX_HAND);
      if (bad) { broken = "negative resources or too many cards"; break; }
      steps++;
    }
    if (broken) { fails.push(n + " players, game " + g + ": " + broken); continue; }
    if (!s.over) { fails.push(n + " players, game " + g + ": did not end"); continue; }
    games++;
    turns += s.players.reduce((a, p) => a + p.turns, 0) / n;
    s.players.forEach((p, i) => { const t = F.score(s, i).total; minS = Math.min(minS, t); maxS = Math.max(maxS, t); });
    const w = F.winners(s);
    if (n === 1) { if (w.length) soloWins++; } else if (w.indexOf(0) !== -1) firstWins += 1 / w.length;
  }
  if (n === 1) {
    console.log("1 player, " + N + " games: target " + F.SOLO_TARGET + " reached in " + (100 * soloWins / games).toFixed(1) + " %; points " + minS + " to " + maxS + "; " + (turns / games).toFixed(1) + " turns");
  } else {
    const pct = 100 * firstWins / games, fair = 100 / n;
    check(Math.abs(pct - fair) <= 8, n + " players: first player wins " + pct.toFixed(1) + " %, fair share " + fair.toFixed(1) + " %");
    console.log(n + " players, " + N + " games: first player wins " + pct.toFixed(1) + " % (fair " + fair.toFixed(1) + " %); points " + minS + " to " + maxS + "; " + (turns / games).toFixed(1) + " turns per player");
  }
});

// --- 3. Hard against Easy --------------------------------------------------------
(function () {
  let wins = 0;
  const M = 400;
  for (let g = 0; g < M; g++) {
    const rng = F.makeRng(99000 + g);
    const s = F.createGame(2, rng);
    const hardSeat = g % 2;
    let steps = 0;
    while (!s.over && steps < 3000) { F.apply(s, F.chooseAction(s, s.current === hardSeat ? "hard" : "easy", rng), rng); steps++; }
    const w = F.winners(s);
    if (w.indexOf(hardSeat) !== -1) wins += 1 / w.length;
  }
  const pct = 100 * wins / M;
  check(pct >= 70, "Hard should beat Easy in at least 70 %, got " + pct.toFixed(1) + " %");
  console.log("Hard against Easy: " + pct.toFixed(1) + " % of " + M + " games");
})();
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

// --- 4. single rules ----------------------------------------------------------------
(function rules() {
  const rng = F.makeRng(3);
  let s = F.createGame(2, rng);
  let p = s.players[0];
  // Building the bakery, then the hedgehog moves in for free.
  p.res = { w: 2, r: 0, p: 1, b: 0 };
  p.hand = ["bakery", "hedgehog"];
  check(F.isLegal(s, { type: "build", from: "hand", index: 0 }), "the bakery should be buildable with 2 wood and 1 pebble");
  F.apply(s, { type: "build", from: "hand", index: 0 }, rng);
  check(p.res.w === 0 && p.res.p === 0 && p.res.b === 2, "the bakery costs 2 wood, 1 pebble and gives 2 berries at once: " + JSON.stringify(p.res));
  s.current = 0;
  p.res = { w: 0, r: 0, p: 0, b: 0 };
  check(F.freeMoveIn(p, "hedgehog") && F.isLegal(s, { type: "build", from: "hand", index: 0 }), "the hedgehog should move in for free next to the bakery");
  F.apply(s, { type: "build", from: "hand", index: 0 }, rng);
  check(F.pairs(p) === 1 && F.score(s, 0).pairs === F.PAIR_BONUS, "bakery and hedgehog should be one pair worth " + F.PAIR_BONUS);
  check(!F.freeMoveIn(p, "hedgehog"), "a second hedgehog needs a second bakery");

  // A taken field is closed for the next player, a shared field is not.
  s = F.createGame(2, rng);
  F.apply(s, { type: "place", field: 0 }, rng);
  check(!F.isLegal(s, { type: "place", field: 0 }), "the woodpile is taken");
  F.apply(s, { type: "place", field: 7 }, rng);
  s.current = 0;
  check(F.isLegal(s, { type: "place", field: 7 }), "the market has room for everyone");

  // Spring: workers back, +1 worker, production again.
  s = F.createGame(1, rng);
  p = s.players[0];
  p.village = [{ id: "sawmill" }];
  p.res = { w: 0, r: 0, p: 0, b: 0 };
  F.apply(s, { type: "place", field: 0 }, rng);
  F.apply(s, { type: "place", field: 1 }, rng);
  check(F.isLegal(s, { type: "season" }), "with all squirrels out the season can change");
  F.apply(s, { type: "season" }, rng);
  check(F.season(p) === "spring" && p.workers === 3 && p.placed === 0, "spring should bring a third squirrel");
  check(p.res.w === 3 + 2, "the sawmill should produce 2 wood in spring: " + JSON.stringify(p.res));
  check(s.fields[0].length === 0, "the squirrels come back from the forest");

  // At most 15 cards.
  p.village = Array.from({ length: 15 }, () => ({ id: "pantry" }));
  p.res = { w: 9, r: 9, p: 9, b: 9 };
  p.hand = ["well"];
  check(!F.canBuild(s, p, "well"), "a full village takes no more cards");
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== FOREST VILLAGE CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== FOREST VILLAGE CORE: 0 failures ===");
