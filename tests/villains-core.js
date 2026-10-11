// tests/villains-core.js
// VillainsCore ("Fairy-Tale Villains"): data, rules and balance.
//  1. Six villains, four places each with known actions; every villain,
//     place and card has its name in 12 languages.
//  2. Balance: 500 computer games for each number of players (2, 3, 4)
//     with random villains. Every game ends and every move is legal; each
//     villain wins within +/- 8 percentage points of its fair share
//     (1 / players). The average number of rounds is printed.
//  3. Single rules: a hero blocks his place, helpers lower the price of
//     defeating him, the Messenger keeps Rumpelstiltskin from winning, the
//     thorn hedge grows where a hero stands, the wolf must end a turn in
//     the Dark Forest, a twist puts a hero on a free place.
// No server or browser needed. About two minutes.

const path = require("path");
const V = require(path.join(__dirname, "..", "villains-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "500", 10);
const ACTS = ["gold1", "gold2", "gold3", "play", "discard", "move", "defeat", "twist", "goal"];

// --- 1. data ----------------------------------------------------------------
check(V.VILLAIN_IDS.length === 6, "there should be 6 villains");
const names = [];
V.VILLAIN_IDS.forEach((v) => {
  const D = V.VILLAINS[v];
  check(D.places.length === 4, v + ": 4 places expected");
  D.places.forEach((pl) => {
    check(pl[1].length >= 2 && pl[1].length <= 3, v + "/" + pl[0] + ": 2 or 3 actions expected");
    pl[1].forEach((a) => check(ACTS.indexOf(a) !== -1, v + "/" + pl[0] + ": unknown action " + a));
    names.push("vl_place_" + pl[0]);
  });
  check(D.places.some((pl) => pl[1].indexOf("defeat") !== -1), v + ": no place to defeat heroes");
  check(D.places.some((pl) => pl[1].indexOf("twist") !== -1), v + ": no place for a twist of the tale");
  names.push("vl_villain_" + v, "vl_goal_" + v, "vl_card_" + D.trump, "vl_card_" + D.ward);
  D.heroes.forEach((h) => names.push("vl_card_" + h[0]));
});
V.SHARED.concat(V.SHARED_TWIST).forEach((c) => names.push("vl_card_" + c.id));
names.forEach((k) => Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][k], l + ": no text " + k)));
check(new Set(V.VILLAIN_IDS.map((v) => V.VILLAINS[v].places.map((p) => p[0]).join())).size === 6, "places repeat between villains");

// --- 2. balance --------------------------------------------------------------
function play(n, seed) {
  const rng = V.makeRng(seed);
  const pool = V.VILLAIN_IDS.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  const vs = pool.slice(0, n);
  const s = V.createGame(vs, rng);
  for (let steps = 0; s.winner === null; steps++) {
    if (steps > 5000) return { vs, stuck: true };
    const a = V.chooseAction(s, rng);
    if (!V.isLegal(s, a)) return { vs, illegal: JSON.stringify(a) };
    V.apply(s, a, rng);
    if (s.players.some((p) => p.gold < 0)) return { vs, illegal: "negative gold" };
  }
  return { vs, winner: s.winner, rounds: s.turn };
}

const t0 = Date.now();
[2, 3, 4].forEach((n) => {
  const wins = {}, games = {};
  let rounds = 0, done = 0;
  for (let g = 0; g < N; g++) {
    const r = play(n, 424242 + 1000 * n + g);
    if (r.stuck) { fails.push(n + " players: game " + g + " did not end"); continue; }
    if (r.illegal) { fails.push(n + " players: game " + g + " illegal move " + r.illegal); continue; }
    r.vs.forEach((v) => { games[v] = (games[v] || 0) + 1; });
    wins[r.vs[r.winner]] = (wins[r.vs[r.winner]] || 0) + 1;
    rounds += r.rounds; done++;
  }
  const fair = 100 / n;
  const line = V.VILLAIN_IDS.map((v) => {
    const pct = 100 * (wins[v] || 0) / games[v];
    check(Math.abs(pct - fair) <= 8, n + " players: " + v + " wins " + pct.toFixed(1) + " %, fair share " + fair.toFixed(1) + " %");
    return v + " " + pct.toFixed(1) + " %";
  }).join(", ");
  console.log(n + " players, " + N + " games (fair share " + fair.toFixed(1) + " %): " + line + "; " + (rounds / done).toFixed(1) + " rounds on average");
});
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

// --- 3. single rules -----------------------------------------------------------
(function rules() {
  const rng = V.makeRng(5);
  // A hero blocks his place: only defeating him (or ending the turn).
  let s = V.createGame(["witch", "wolf"], rng);
  let p = s.players[0];
  p.heroes.push({ card: "gretel", place: 0 });
  p.gold = 10;
  V.apply(s, { type: "move", place: 0 }, rng);
  let acts = V.legalActions(s);
  check(acts.every((a) => a.type === "defeat" || a.type === "end"), "a blocked place should only allow defeat or end: " + JSON.stringify(acts));
  // Helpers lower the price.
  p.helpers.push({ card: "raven", place: 0 });
  check(V.heroPrice(p, p.heroes[0]) === 2, "Gretel (3) with a Raven (1) should cost 2, got " + V.heroPrice(p, p.heroes[0]));
  V.apply(s, { type: "defeat", hero: 0 }, rng);
  check(p.heroes.length === 0 && p.gold === 8, "defeating should remove Gretel for 2 gold");
  check(V.legalActions(s).some((a) => a.type === "gold"), "after the hero is gone the place's actions are free again");

  // The Messenger keeps Rumpelstiltskin from winning.
  s = V.createGame(["rumpel", "witch"], rng);
  p = s.players[0];
  const target = V.prm(s).rumpelTarget;
  p.gold = target;
  p.heroes.push({ card: "messenger", place: 2 });
  check(!V.hasWon(s, p, true), "Rumpelstiltskin must not win with the Messenger in his domain");
  p.heroes = [{ card: "king", place: 2 }];
  check(V.hasWon(s, p, true), "Rumpelstiltskin wins with enough gold when only other heroes are there");

  // The thorn hedge grows where a hero stands.
  s = V.createGame(["thornfairy", "witch"], rng);
  p = s.players[0];
  p.gold = 20;
  p.heroes.push({ card: "cook", place: 1 });
  V.apply(s, { type: "move", place: 1 }, rng);
  check(V.legalActions(s).some((a) => a.type === "goal"), "the thorn fairy may let the hedge grow at a blocked place");

  // The wolf must end a turn in the Dark Forest.
  s = V.createGame(["wolf", "witch"], rng);
  p = s.players[0];
  p.prog.chalk = p.prog.flour = p.prog.door = true;
  p.place = 3;
  check(!V.hasWon(s, p, true), "the wolf must not win outside the Dark Forest");
  p.place = 0;
  check(V.hasWon(s, p, true), "the wolf wins ending a turn in the Dark Forest");

  // A twist puts a hero on a free place of the other villain.
  s = V.createGame(["sorcerer", "witch"], rng);
  p = s.players[0];
  V.apply(s, { type: "move", place: 1 }, rng); // Bird Meadow: goal, twist
  V.apply(s, { type: "twist", target: 1 }, rng);
  check(s.phase === "twist" && s.pendingTwist.cards.length === 2, "a twist draws two cards");
  const pick = V.legalActions(s).find((a) => a.type === "pick" && a.place !== undefined) || V.legalActions(s)[0];
  V.apply(s, pick, rng);
  check(s.phase === "act", "after picking the turn goes on");
  if (pick.place !== undefined) check(s.players[1].heroes.some((h) => h.place === pick.place), "the hero should stand on the chosen place");
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== VILLAINS CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== VILLAINS CORE: 0 failures ===");
