// tests/forestvillage-core.js
// ForestVillageCore ("Forest Village", rules 3): data, rules and computer games.
//  1. 50 different cards (25 buildings, 25 animals) in five habitats with
//     5 buildings and 5 animals each; every card, field, resource, season,
//     habitat and task has its text in 12 languages.
//  2. GAMES (default 500) computer games for each number of players (1 to
//     4), levels mixed and rotated over the seats: every game ends, every
//     move is legal, resources never go below 0, at most 12 cards per
//     village. Printed: wins per level, points, turns per player.
//  3. Seat advantage: GAMES games per number of players (2 to 4) with Hard
//     on every seat; every seat wins within 5 percentage points of the fair
//     share.
//  4. Levels: Hard beats Easy in at least 75 %, Hard beats Medium and
//     Medium beats Easy in more than 50 % of 2-player games (seats swapped).
//  5. Single rules: shared seasons, first squirrel extra, production after
//     every second squirrel, habitat discount, home ranges, more squirrels
//     with a bigger village, hands filled up to 4, the 12-card village,
//     old saves (rules 2) are not current.
// No server or browser needed.

const path = require("path");
const F = require(path.join(__dirname, "..", "forestvillage-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "500", 10);
const LEVELS = ["easy", "medium", "hard"];

// --- 1. data -----------------------------------------------------------------
const ids = F.CARDS.map((c) => c.id);
check(new Set(ids).size === 50, "50 different cards expected, got " + new Set(ids).size);
check(F.CARDS.filter((c) => c.kind === "building").length === 25, "25 buildings expected");
F.HABITATS.forEach((h) => {
  const b = F.CARDS.filter((c) => c.habitat === h && c.kind === "building").length;
  const a = F.CARDS.filter((c) => c.habitat === h && c.kind === "animal").length;
  check(b === 5 && a === 5, h + ": 5 buildings and 5 animals expected, got " + b + "/" + a);
});
F.CARDS.forEach((c) => {
  check(F.HABITATS.indexOf(c.habitat) !== -1, c.id + ": unknown habitat " + c.habitat);
  check(!("partner" in c), c.id + ": cards have no fixed partner any more");
  check(Object.keys(c.cost).every((k) => F.RES.indexOf(k) !== -1 && c.cost[k] > 0), c.id + ": bad cost");
});
const keys = ids.map((id) => "fv_card_" + id)
  .concat(F.FIELDS.map((f) => "fv_field_" + f.id), F.RES.map((r) => "fv_res_" + r), F.SEASONS.map((x) => "fv_season_" + x),
    F.TASKS.map((t) => "fv_task_" + t.id), F.HABITATS.map((h) => "fv_habitat_" + h));
keys.forEach((k) => Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][k], l + ": no text " + k)));
const de = ids.map((id) => STRINGS.de["fv_card_" + id]);
check(new Set(de).size === de.length, "German card names repeat");

let maxHand = 0;
function play(n, levelOf, seed) {
  const rng = F.makeRng(seed);
  const s = F.createGame(n, rng);
  let steps = 0;
  while (!s.over && steps < 3000) {
    const a = F.chooseAction(s, levelOf(s.current), rng);
    if (!F.isLegal(s, a)) return { s, broken: "illegal move " + JSON.stringify(a) };
    F.apply(s, a, rng);
    const bad = s.players.find((p) => F.RES.some((k) => p.res[k] < 0) || p.village.length > F.MAX_VILLAGE || p.workers > F.MAX_WORKERS);
    if (bad) return { s, broken: "negative resources, too many cards or squirrels" };
    s.players.forEach((p) => { maxHand = Math.max(maxHand, p.hand.length); });
    steps++;
  }
  if (!s.over) return { s, broken: "did not end" };
  return { s, steps };
}

// --- 2. mixed computer games ----------------------------------------------------
const t0 = Date.now();
const lvWins = { easy: 0, medium: 0, hard: 0 }, lvGames = { easy: 0, medium: 0, hard: 0 }, lvPts = { easy: 0, medium: 0, hard: 0 };
[1, 2, 3, 4].forEach((n) => {
  let games = 0, turns = 0, minS = Infinity, maxS = -Infinity, soloWins = 0, sum = 0, cards = 0, full = 0;
  for (let g = 0; g < N; g++) {
    const lv = Array.from({ length: n }, (_, i) => LEVELS[(g + i) % 3]);
    const r = play(n, (i) => (n === 1 ? "medium" : lv[i]), 707 * n + g);
    if (r.broken) { fails.push(n + " players, game " + g + ": " + r.broken); continue; }
    const s = r.s;
    games++;
    turns += s.players.reduce((a, p) => a + p.turns, 0) / n;
    const w = F.winners(s);
    s.players.forEach((p, i) => {
      const t = F.score(s, i).total;
      minS = Math.min(minS, t); maxS = Math.max(maxS, t); sum += t; cards += p.village.length; if (p.village.length >= F.MAX_VILLAGE) full++;
      if (n > 1) { lvGames[lv[i]]++; lvPts[lv[i]] += t; if (w.indexOf(i) !== -1) lvWins[lv[i]] += 1 / w.length; }
    });
    if (n === 1 && w.length) soloWins++;
  }
  const avg = (sum / games / n).toFixed(1), cpp = (cards / games / n).toFixed(1) + " (full " + (100 * full / games / n).toFixed(0) + " %)";
  if (n === 1) console.log("1 player, " + games + " games (Medium): target " + F.SOLO_TARGET + " reached in " + (100 * soloWins / games).toFixed(1) + " %; points " + minS + " to " + maxS + " (mean " + avg + "); " + cpp + " cards; " + (turns / games).toFixed(1) + " turns");
  else console.log(n + " players, " + games + " games (levels mixed): points " + minS + " to " + maxS + " (mean " + avg + "); " + cpp + " cards per village; " + (turns / games).toFixed(1) + " turns per player");
});
console.log("wins per level (share of player games, 2-4 players): " + LEVELS.map((l) => l + " " + (100 * lvWins[l] / lvGames[l]).toFixed(1) + " % (mean " + (lvPts[l] / lvGames[l]).toFixed(1) + " points)").join(", "));
console.log("largest hand: " + maxHand + " cards");
check(lvWins.hard / lvGames.hard > lvWins.medium / lvGames.medium && lvWins.medium / lvGames.medium > lvWins.easy / lvGames.easy, "wins per level should rise with the level");

// --- 3. seat advantage (Hard on every seat) ---------------------------------------
[2, 3, 4].forEach((n) => {
  const wins = Array(n).fill(0);
  let games = 0;
  for (let g = 0; g < N; g++) {
    const r = play(n, () => "hard", 31000 * n + g);
    if (r.broken) { fails.push("seat test " + n + " players, game " + g + ": " + r.broken); continue; }
    games++;
    const w = F.winners(r.s);
    w.forEach((i) => { wins[i] += 1 / w.length; });
  }
  const fair = 100 / n;
  const pct = wins.map((x) => 100 * x / games);
  pct.forEach((x, i) => check(Math.abs(x - fair) <= 5, n + " players: seat " + i + " wins " + x.toFixed(1) + " %, fair share " + fair.toFixed(1) + " %"));
  console.log("wins per seat (Hard, " + n + " players, " + games + " games): " + pct.map((x, i) => "seat " + i + " " + x.toFixed(1) + " %").join(" / ") + " (fair " + fair.toFixed(1) + " %)");
});

// --- 4. levels head to head ------------------------------------------------------
function duel(a, b, M, seed) {
  let wins = 0;
  for (let g = 0; g < M; g++) {
    const seatA = g % 2;
    const r = play(2, (i) => (i === seatA ? a : b), seed + g);
    if (r.broken) { fails.push(a + " vs " + b + ", game " + g + ": " + r.broken); continue; }
    const w = F.winners(r.s);
    if (w.indexOf(seatA) !== -1) wins += 1 / w.length;
  }
  return 100 * wins / M;
}
const M = Math.max(40, Math.round(N * 0.8));
const he = duel("hard", "easy", M, 99000), hm = duel("hard", "medium", M, 98000), me = duel("medium", "easy", M, 97000);
check(he >= 75, "Hard should beat Easy in at least 75 %, got " + he.toFixed(1) + " %");
check(hm > 50, "Hard should beat Medium in more than 50 %, got " + hm.toFixed(1) + " %");
check(me > 50, "Medium should beat Easy in more than 50 %, got " + me.toFixed(1) + " %");
console.log("2 players, " + M + " games each: Hard beats Easy " + he.toFixed(1) + " %, Hard beats Medium " + hm.toFixed(1) + " %, Medium beats Easy " + me.toFixed(1) + " %");
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

// --- 5. single rules ----------------------------------------------------------------
(function rules() {
  const rng = F.makeRng(3);
  let s = F.createGame(2, rng);
  check(s.rules === F.RULES && F.isCurrentState(s), "a new game is a current state");
  check(s.players.every((p) => p.hand.length === F.HAND_FILL && p.workers === F.START_WORKERS), "everyone starts with 4 cards and 3 squirrels");
  check(s.players[0].res.f === 0 && s.players[1].res.f === 1, "the second seat starts with 1 feather");
  check(F.season(s) === "spring" && s.phase === "place", "the game starts in spring with a placement");

  // First squirrel on a field gets the extra, the second one does not.
  let p0 = s.players[0], p1 = s.players[1];
  p0.res = { c: 0, s: 0, f: 0 }; p1.res = { c: 0, s: 0, f: 0 };
  p0.hand = []; p1.hand = []; s.meadow = s.meadow.map(() => "bear");
  F.apply(s, { type: "place", field: 0 }, rng);
  check(p0.res.c === 3, "the first squirrel on the Clay Bank gets 3 clay: " + JSON.stringify(p0.res));
  check(s.current === 1 && s.phase === "place", "nothing to build: the turn passes on at once");
  F.apply(s, { type: "place", field: 0 }, rng);
  check(p1.res.c === 2, "the second squirrel on the Clay Bank gets 2 clay: " + JSON.stringify(p1.res));

  // Build phase: after placing, one card or end.
  s = F.createGame(2, rng);
  p0 = s.players[0];
  p0.res = { c: 1, s: 0, f: 1 };
  p0.hand = ["bakery", "hedgehog"];
  F.apply(s, { type: "place", field: 0 }, rng);
  check(s.phase === "build" && s.current === 0, "with a card to pay for, the player may build");
  check(F.isLegal(s, { type: "build", from: "hand", index: 0 }) && F.isLegal(s, { type: "end" }), "build or end");
  check(!F.isLegal(s, { type: "place", field: 1 }), "only one squirrel per turn");
  F.apply(s, { type: "build", from: "hand", index: 0 }, rng);
  check(p0.res.c === 2 && p0.res.f === 2, "the bakery costs 2 clay and 1 feather and gives 2 feathers: " + JSON.stringify(p0.res));
  check(s.current === 1, "after building the next player is on");

  // Habitat discount: an animal of the hedge next to a hedge building.
  check(F.discountedAnimal(p0, "hedgehog") && F.discountedAnimal(p0, "lark") && !F.discountedAnimal(p0, "otter"), "hedge animals get the discount next to the bakery, a stream animal does not");
  check(F.costFor(p0, "lark").f === 1, "the lark costs 1 feather instead of 2");
  p0.village.push({ id: "rabbit" });
  check(!F.discountedAnimal(p0, "hedgehog"), "one hedge building gives one discount");

  // Home ranges.
  p0.village = [{ id: "bakery" }, { id: "rabbit" }, { id: "lark" }, { id: "otter" }, { id: "bridge" }];
  check(F.ranges(p0) === 1 && F.score(s, 0).ranges === F.RANGE_PTS, "three hedge cards are one home range worth " + F.RANGE_PTS);

  // Production after every second squirrel; shared seasons; more squirrels.
  s = F.createGame(1, rng);
  const p = s.players[0];
  p.village = [{ id: "sawmill" }, { id: "pantry" }, { id: "well" }, { id: "inn" }];
  p.res = { c: 0, s: 0, f: 0 };
  p.hand = []; s.meadow = s.meadow.map(() => "bear");
  F.apply(s, { type: "place", field: 1 }, rng);
  check(p.res.c === 0, "no production after the first squirrel");
  F.apply(s, { type: "place", field: 2 }, rng);
  check(p.res.c === 3 && p.res.f === 4, "sawmill and pantry produce after the second squirrel: " + JSON.stringify(p.res));
  if (s.phase === "build") F.apply(s, { type: "end" }, rng);
  p.res = { c: 0, s: 0, f: 0 };
  F.apply(s, { type: "place", field: 3 }, rng);
  check(F.season(s) === "summer" && p.placed === 0 && p.workers === 4, "after 3 squirrels summer begins, with 4 squirrels for 4 cards");
  check(p.hand.length >= F.HAND_FILL, "the hand is filled up to 4 cards");
  check(s.fields.every((f) => !f.length), "the squirrels come back from the forest");

  // Seasons pass for everybody together, the starter moves on.
  s = F.createGame(3, rng);
  let guard = 0;
  while (F.season(s) === "spring" && guard++ < 50) F.apply(s, F.chooseAction(s, "medium", rng), rng);
  check(F.season(s) === "summer" && s.current === 1 && s.starter === 1, "seat 1 starts the summer");
  check(s.players.every((q) => q.placed === 0), "all squirrels are back for everybody");

  // At most 12 cards.
  p.village = Array.from({ length: 12 }, () => ({ id: "pantry" }));
  p.res = { c: 9, s: 9, f: 9 };
  check(!F.canBuild(s, p, "well") && F.workersFor(p) === F.MAX_WORKERS, "a full village takes no more cards and has 6 squirrels");

  // Old saves are not current.
  const old = { deck: [], discard: [], meadow: [], fields: [[], [], [], [], [], [], [], []], task: "pairs", players: [{ res: { c: 0, s: 0, f: 0 }, hand: [], village: [], workers: 2, placed: 0, season: 0, passed: false, turns: 0 }], current: 0, turn: 0, over: false, log: [] };
  check(!F.isCurrentState(old), "a save of the old rules is not current");
  check(!F.isCurrentState(null), "no save is not current");
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== FOREST VILLAGE CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== FOREST VILLAGE CORE: 0 failures ===");
