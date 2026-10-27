// tests/villains-core.js
// VillainsCore ("Fairy-Tale Villains", rules version 3: heroes are events
// from the deck, nobody places them): data, rules and balance.
//  1. Six villains, three places each (one of each sign), plans of 3 or 4
//     steps; every villain, place, step and hero has its name in 12
//     languages. The spell deck has 36 cards.
//  2. Balance: GAMES (default 3000; fewer games scatter too much for the
//     +/- 5 seat limit) computer games (level 3) for each number
//     of players (2, 3, 4) with random villains. Every game ends, every move
//     is legal, cards (spells and heroes) are neither lost nor doubled; each villain wins within
//     +/- 8 points of its fair share (1 / players), each seat within +/- 5
//     points (a shared win counts as a part for each winner). Average
//     rounds and the share of shared wins are printed.
//  3. Levels: GAMES games per number of players with one player of level 3
//     against the others on level 2, and one of level 2 against level 1
//     (seat turned over the games): the one of the higher level wins at
//     least 5 points more than the fair share.
//  4. Single rules: paying (own sign full value, other signs 1, least
//     spent), a hero raises the price at his place and leaves when the step
//     there is done, the final step comes last, there is no scheme action,
//     a hero drawn from the deck appears at the active player's place of
//     its sign (or moves on when a hero stands there) and the draw goes on
//     to a spell card, collecting over 6 cards asks to drop one, finishing
//     ends the turn and the round is played to its end (most value left
//     wins, a full tie is shared), old states (rules 1 and 2) are not
//     current.
// No server or browser needed.

const path = require("path");
const V = require(path.join(__dirname, "..", "villains-core.js"));
const STRINGS = require("./load-i18n").loadI18n().STRINGS;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const N = parseInt(process.env.GAMES || "3000", 10);

// --- 1. data ----------------------------------------------------------------
check(V.VILLAIN_IDS.length === 6, "there should be 6 villains");
check(V.spellDeck().length === 36, "the spell deck should have 36 cards, has " + V.spellDeck().length);
const names = ["vl_card_dust"];
V.SIGNS.forEach((sg) => names.push("vl_sign_" + sg));
V.VILLAIN_IDS.forEach((v) => {
  const D = V.VILLAINS[v];
  check(D.places.length === 3, v + ": 3 places expected");
  check(D.places.map((pl) => pl[1]).sort().join() === "herb,moon,star", v + ": one place of each sign expected");
  check(D.steps.length >= 3 && D.steps.length <= 4, v + ": 3 or 4 steps expected");
  check(D.steps.filter((st) => st[3]).length <= 1 && D.steps.every((st, j) => !st[3] || j === D.steps.length - 1), v + ": at most one final step, at the end");
  D.places.forEach((pl) => names.push("vl_place_" + pl[0]));
  D.steps.forEach((st) => names.push("vl_step_" + st[0]));
  names.push("vl_villain_" + v, "vl_goal_" + v);
});
V.HEROES.forEach((h) => names.push("vl_card_" + h[0]));
new Set(names).forEach((k) => Object.keys(STRINGS).forEach((l) => check(!!STRINGS[l][k], l + ": no text " + k)));
check(new Set([].concat(...V.VILLAIN_IDS.map((v) => V.VILLAINS[v].places.map((p) => p[0])))).size === 18, "places repeat between villains");

// --- 2./3. computer games -----------------------------------------------------
function totalCards(s) {
  let n = s.deck.length + s.discard.length + s.heroDiscard.length + s.market.filter((c) => c !== null).length;
  s.players.forEach((p) => { n += p.hand.length + p.heroes.length; });
  return n;
}
function play(vs, levels, seed) {
  const rng = V.makeRng(seed);
  const s = V.createGame(vs, rng);
  const cards = totalCards(s);
  for (let steps = 0; s.winner === null; steps++) {
    if (steps > 4000) return { stuck: true };
    const a = V.chooseAction(s, rng, levels[s.current]);
    if (!V.isLegal(s, a)) return { illegal: JSON.stringify(a) };
    V.apply(s, a, rng);
    if (totalCards(s) !== cards) return { illegal: "cards lost or doubled after " + JSON.stringify(a) };
  }
  return { winners: s.winners, rounds: s.turn };
}
function pickVillains(rng, n) {
  const pool = V.VILLAIN_IDS.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  return pool.slice(0, n);
}

const t0 = Date.now();
[2, 3, 4].forEach((n) => {
  const wins = {}, games = {}, seat = new Array(n).fill(0);
  let rounds = 0, done = 0, shared = 0;
  const pr = V.makeRng(9100 + n);
  for (let g = 0; g < N; g++) {
    const vs = pickVillains(pr, n);
    const r = play(vs, new Array(n).fill(3), 424242 + 1000 * n + g);
    if (r.stuck) { fails.push(n + " players: game " + g + " did not end"); continue; }
    if (r.illegal) { fails.push(n + " players: game " + g + " illegal: " + r.illegal); continue; }
    vs.forEach((v) => { games[v] = (games[v] || 0) + 1; });
    // A shared win counts as a part for each winner.
    r.winners.forEach((w) => { wins[vs[w]] = (wins[vs[w]] || 0) + 1 / r.winners.length; seat[w] += 1 / r.winners.length; });
    if (r.winners.length > 1) shared++;
    rounds += r.rounds; done++;
  }
  const fair = 100 / n;
  const line = V.VILLAIN_IDS.map((v) => {
    const pct = 100 * (wins[v] || 0) / (games[v] || 1);
    check(Math.abs(pct - fair) <= 8, n + " players: " + v + " wins " + pct.toFixed(1) + " %, fair share " + fair.toFixed(1) + " %");
    return v + " " + pct.toFixed(1) + " %";
  }).join(", ");
  const seats = seat.map((w, i) => {
    const pct = 100 * w / done;
    check(Math.abs(pct - fair) <= 5, n + " players: seat " + i + " wins " + pct.toFixed(1) + " %, fair share " + fair.toFixed(1) + " %");
    return "seat " + i + " " + pct.toFixed(1) + " %";
  }).join(" / ");
  console.log(n + " players, " + N + " games level 3 (fair share " + fair.toFixed(1) + " %): " + line);
  console.log("  wins per seat: " + seats + "; " + (rounds / done).toFixed(1) + " rounds on average, " + (100 * shared / done).toFixed(1) + " % shared wins");
});

// Levels: one player of a level against the others of the level below
// (2 players: head to head), the seat turned over the games.
[2, 3, 4].forEach((n) => {
  const parts = [[3, 2], [2, 1]].map(([hi, lo]) => {
    const pr = V.makeRng(7700 + 10 * n + hi);
    let w = 0, done = 0;
    for (let g = 0; g < N; g++) {
      const seat = g % n;
      const lv = new Array(n).fill(lo);
      lv[seat] = hi;
      const r = play(pickVillains(pr, n), lv, 777000 + 10000 * n + 1000 * hi + g);
      if (r.stuck || r.illegal) { fails.push(n + " players (levels): game " + g + " " + (r.illegal || "did not end")); continue; }
      done++;
      if (r.winners.indexOf(seat) !== -1) w += 1 / r.winners.length;
    }
    const pct = 100 * w / done;
    check(pct >= 100 / n + 5, n + " players: one level " + hi + " against level " + lo + " wins only " + pct.toFixed(1) + " %");
    return "level " + hi + " vs " + lo + ": " + pct.toFixed(1) + " %";
  });
  console.log(n + " players, one against the others (fair share " + (100 / n).toFixed(1) + " %): " + parts.join(", "));
});
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

// --- 4. single rules -----------------------------------------------------------
(function rules() {
  const rng = V.makeRng(5);
  let s = V.createGame(["witch", "wolf"], rng);
  check(s.rules === 3 && V.isCurrentState(s), "a new game is current (rules 3)");
  check(s.actionsLeft === 2 && s.finished.length === 0 && s.winners.length === 0, "a turn has two actions");
  check(s.players.every((p) => p.hand.length === 3 && p.hand.every((id) => V.card(id).kind === "spell")) && s.market.length === 3 && s.market.every((id) => V.card(id).kind === "spell"),
    "3 spell cards each, 3 in the market");
  check(s.players[0].heroes.length === 1 && V.card(s.players[0].heroes[0].card).str === 1 && V.placeSign(s.players[0], s.players[0].heroes[0].place) === V.card(s.players[0].heroes[0].card).sign &&
    !s.players[1].heroes.length, "the starting player begins with a hero of strength 1 at the place of its sign, the other with none");
  check(V.heroesInDeck(s) === V.EVENTS && s.deck.length === 36 - 9 + V.EVENTS && s.deck.indexOf(s.players[0].heroes[0].card) === -1, "the heroes are shuffled into the deck after dealing: " + V.heroesInDeck(s) + " heroes, " + s.deck.length + " cards");
  check(V.SIGNS.every((sg) => V.HEROES.filter((h) => V.card(h[0]).sign === sg).reduce((a, h) => a + h[1], 0) === 18), "hero strengths add up to 18 per sign");
  check(!V.HEROES.some((h) => h[0] === "kingsson"), "the King's Son is not a hero any more");
  check(!V.VILLAINS.thornfairy.steps.some((st) => st[0] === "hedge"), "the Thorn Fairy has no hedge step");
  check(V.SIGNS.every((sg) => V.HEROES.some((h) => V.card(h[0]).sign === sg)), "heroes of every sign");
  check(!V.isCurrentState({ players: [{ villain: "witch", place: 0, gold: 2, hand: [], heroes: [], prog: {} }], current: 0 }), "an old state (rules 1) is not current");
  check(!V.isCurrentState({ rules: 2, players: [{ villain: "witch", hand: [], done: [false, false, false, false], heroes: [] }], finished: [], market: [], heroRow: [], deck: [], heroDiscard: [] }), "an old state (rules 2) is not current");
  check(!V.legalActions(s).some((a) => a.type === "scheme"), "no scheme action");

  // A hero comes up from the deck: it appears at the active player's place
  // of its sign, the draw goes on to a spell card; a second hero of the
  // same sign moves on.
  {
    const e = V.createGame(["witch", "wolf"], V.makeRng(77));
    e.players[0].heroes = [];
    e.log = [];
    const moonHeroes = V.HEROES.map((h) => h[0]).filter((id) => V.card(id).sign === "moon");
    e.deck.push("moon1", moonHeroes[1], "star2", moonHeroes[0]);
    e.actionsLeft = 2;
    V.apply(e, { type: "collect" }, rng);
    V.apply(e, { type: "take", from: -1 }, rng);
    const w = e.players[0];
    check(w.heroes.length === 1 && w.heroes[0].card === moonHeroes[0] && w.heroes[0].place === 0 && w.hand[w.hand.length - 1] === "star2",
      "a moon hero appears at the witch's moon place (Gingerbread House), she gets the next spell card; got " + JSON.stringify(w.heroes) + " " + w.hand.join());
    V.apply(e, { type: "take", from: -1 }, rng);
    check(w.heroes.length === 1 && e.heroDiscard.indexOf(moonHeroes[1]) !== -1 && w.hand[w.hand.length - 1] === "moon1", "a second moon hero moves on");
    check(e.log.some((x) => x.k === "hero") && e.log.some((x) => x.k === "herogone"), "both events are in the log");
    check(e.players[1].heroes.length === 0, "the other player gets no hero");
  }

  // Price, hero and payment.
  let p = s.players[0];
  p.heroes = [];
  p.hand = ["star3", "star2", "moon3", "dust"];
  check(V.stepPrice(p, 0) === 5, "the witch's dough costs 5");
  p.heroes.push({ card: "hunter", place: 1 });
  check(V.stepPrice(p, 0) === 8, "a hero with strength 3 at the bakery raises the price to 8");
  check(JSON.stringify(V.stepPayment(p, 0)) === "[0,1,2,3]", "8 at a star place: star 3 + star 2 + moon 3 (counts 1) + dust 2, got " + JSON.stringify(V.stepPayment(p, 0)));
  p.heroes = [];
  check(JSON.stringify(V.stepPayment(p, 0)) === "[0,1]", "5 at a star place: star 3 + star 2, without dust");
  check(V.payment(["moon1", "herb1", "moon2"], "star", 3) !== null && V.payment(["moon3", "herb3"], "star", 3) === null, "other signs count 1 each");
  check(!V.legalActions(s).some((a) => a.type === "step" && a.step === 3), "the oven (final step) is not open before the others");
  p.heroes.push({ card: "dwarf", place: 1 });
  s.actionsLeft = 1;
  V.apply(s, { type: "step", step: 0 }, rng);
  check(p.done[0] && !p.heroes.length && s.heroDiscard.indexOf("dwarf") !== -1, "the step at the bakery is done and the dwarf leaves");
  check(s.current === 1 && s.actionsLeft === 2, "after the last action the other player has 2 actions");

  // Finishing: the round is played to its end; most value in hand wins,
  // a full tie is shared.
  s = V.createGame(["witch", "wolf", "rumpel"], rng);
  s.players[1].done = [true, true, true, false];
  s.players[1].hand = ["moon3", "moon3", "star1"];
  s.players[2].done = [true, true, true, false];
  s.players[2].hand = ["star3", "star3", "herb1", "moon1"];
  const t = V.clone(s);
  s.current = 1; s.actionsLeft = 2;
  V.apply(s, { type: "step", step: 3 }, rng);
  check(s.winner === null && s.finished.join() === "1" && s.current === 2, "finishing ends the turn, the round goes on");
  V.apply(s, { type: "step", step: 3 }, rng);
  check(s.winners.join() === "2", "both finished: Rumpelstiltskin keeps 2, the wolf 1; got " + JSON.stringify(s.winners));
  t.players[2].hand = ["star3", "star3", "herb1"];
  t.current = 1; t.actionsLeft = 2;
  V.apply(t, { type: "step", step: 3 }, rng);
  V.apply(t, { type: "step", step: 3 }, rng);
  check(t.winners.join() === "1,2" && t.winner === 1, "same value and cards left: a shared win; got " + JSON.stringify(t.winners));

  // Collecting over 6 cards asks to drop one.
  s = V.createGame(["sorcerer", "rumpel"], rng);
  s.actionsLeft = 2;
  p = s.players[0];
  p.hand = ["moon1", "moon1", "moon1", "herb1", "herb1"];
  V.apply(s, { type: "collect" }, rng);
  V.apply(s, { type: "take", from: 0 }, rng);
  V.apply(s, { type: "take", from: -1 }, rng);
  check(s.phase === "trim" && p.hand.length === 7, "7 cards: drop one");
  V.apply(s, { type: "drop", card: 0 }, rng);
  check(s.phase === "act" && p.hand.length === 6 && s.actionsLeft === 1, "after dropping the turn goes on");
})();

if (fails.length) {
  fails.slice(0, 30).forEach((f) => console.log("FAIL: " + f));
  console.log("=== VILLAINS CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== VILLAINS CORE: 0 failures ===");
