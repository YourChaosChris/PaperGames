// forestvillage-core.js
// "Forest Village" (Waldsiedlung) - squirrels gather clay, seeds and feathers
// on a forest map for a settlement of buildings and animals; 1 to 4 players
// (alone against a target score, or against the computer). Dependency-free,
// no DOM. Saves from before the card and key names of v274 (`meadow`, old
// card ids) fail isCurrentState and are dropped.
//
// Rules (version 3, `state.rules === RULES`):
// - Resources: clay, seeds and feathers (c, s, f).
// - The year has four shared seasons (spring, summer, autumn, winter).
//   Everybody starts each season with 3 squirrels plus one for every 4
//   cards in their village (at most 6).
// - A turn: send one squirrel to a forest field and take its reward, then
//   build at most one card (from hand or the Clearing, 6 open cards) or end
//   the turn. Every field takes any number of squirrels; the first squirrel
//   on a field in a season gets its extra. After every second squirrel a
//   player has sent, the production cards of their village pay out.
// - A season ends when all squirrels are out; then they come back, every
//   hand is filled up to 4 cards, and the next player starts the season.
//   After winter the game ends.
// - Cards belong to one of five habitats. An animal costs one feather less
//   while its habitat has more buildings than animals in your village.
//   Every habitat with at least 3 cards in your village is a home range
//   worth 3 points.
// - Points: the cards, the home ranges, the end bonuses of some cards and
//   the open task card. Villages hold 12 cards. Alone: reach the target.

const ForestVillageCore = (function () {
  const RULES = 3;
  const RES = ["c", "s", "f"];
  const SEASONS = ["spring", "summer", "autumn", "winter"];
  const HABITATS = ["stream", "hedge", "rock", "treetop", "heath"];
  const START_WORKERS = 3;
  const WORKER_STEP = 4;        // one more squirrel per 4 cards in the village
  const MAX_WORKERS = 6;
  const HAND_FILL = 4;          // hands are filled up to 4 at each season start
  const MAX_VILLAGE = 12;
  const CLEARING = 6;
  const RANGE_MIN = 3;          // cards of one habitat for a home range
  const RANGE_PTS = 3;
  const SOLO_TARGET = 45;
  // Later seats start with a few resources (measured, see tests).
  const SEAT_RES = [{}, { f: 1 }, { c: 1, f: 1 }, { c: 1, s: 1, f: 1 }];

  // Fields of the forest: what every squirrel gets, and the extra for the
  // first squirrel there in a season.
  const FIELDS = [
    { id: "claybank", gain: { c: 2 }, first: { c: 1 } },
    { id: "seedpatch", gain: { s: 2 }, first: { s: 1 } },
    { id: "featherbed", gain: { f: 2 }, first: { f: 1 } },
    { id: "fernpath", gain: { c: 1, f: 1 }, first: { draw: 1 } },
    { id: "mossytrail", gain: { s: 1, f: 1 }, first: { draw: 1 } },
    { id: "sunnyhollow", gain: { c: 1, s: 1 }, first: { draw: 1 } },
    { id: "oldoak", gain: { c: 1 }, draw: 1, first: { f: 1 } },
    { id: "market", draw: 2, first: { draw: 1 } }
  ];

  // Cards: [id, kind, cost, points, effect, habitat, copies]
  //   effect: { prod: {res}, gain: {res}, draw: n, end: { per, n } }
  //   prod gives at build and after every second squirrel sent; gain/draw
  //   once at build; end scores at the end (per "building" | "animal" |
  //   "prod" | "range" | "leftover").
  const C = (id, kind, cost, pts, fx, habitat, copies) => ({ id, kind, cost, pts, fx: fx || {}, habitat, copies: copies || 2 });
  const CARDS = [
    C("bakery", "building", { c: 2, f: 1 }, 2, { prod: { f: 2 } }, "hedge", 3),
    C("sawmill", "building", { s: 1, f: 1 }, 2, { prod: { c: 2 } }, "stream", 3),
    C("seedloft", "building", { c: 2, f: 1 }, 2, { prod: { s: 1 } }, "treetop", 3),
    C("gravelpit", "building", { c: 2, s: 1 }, 2, { prod: { f: 1 } }, "rock", 3),
    C("pantry", "building", { c: 2 }, 1, { prod: { c: 1, f: 1 } }, "hedge", 3),
    C("watermill", "building", { c: 3, f: 1 }, 3, { prod: { s: 1, f: 1 } }, "stream"),
    C("beehive", "building", { c: 1, f: 1 }, 1, { prod: { s: 1 } }, "heath"),
    C("noticeboard", "building", { c: 2, s: 1 }, 2, { draw: 3 }, "treetop"),
    C("library", "building", { s: 2, f: 1 }, 3, { draw: 2, gain: { f: 1 } }, "rock"),
    C("orchard", "building", { c: 2, s: 1 }, 2, { gain: { f: 3 } }, "heath"),
    C("well", "building", { c: 2 }, 1, { gain: { s: 1, f: 1 } }, "stream"),
    C("treehouse", "building", { c: 3, f: 2 }, 4, {}, "treetop"),
    C("workshop", "building", { c: 2, s: 1 }, 2, { gain: { c: 1, s: 1, f: 1 } }, "rock"),
    C("markethall", "building", { c: 2, s: 1, f: 1 }, 3, { gain: { c: 1, s: 1, f: 2 } }, "treetop"),
    C("teahouse", "building", { c: 2, s: 2, f: 1 }, 2, { end: { per: "animal", n: 1 } }, "stream", 1),
    C("bandstand", "building", { c: 2, s: 2, f: 1 }, 2, { end: { per: "prod", n: 1 } }, "heath", 1),
    C("townhall", "building", { c: 3, s: 2, f: 2 }, 2, { end: { per: "building", n: 1 } }, "heath", 1),
    C("herbgarden", "building", { c: 1, s: 1 }, 1, { prod: { f: 1 }, draw: 1 }, "hedge"),
    C("mushroomcellar", "building", { c: 1, f: 1 }, 1, { prod: { f: 2 } }, "rock"),
    C("pottery", "building", { c: 2, f: 1 }, 2, { end: { per: "leftover", n: 1 } }, "hedge", 1),
    C("bridge", "building", { s: 1, f: 1 }, 2, { gain: { c: 3 } }, "stream"),
    C("lanternhouse", "building", { c: 2, s: 1 }, 2, { draw: 2 }, "heath"),
    C("observatory", "building", { s: 2, f: 3 }, 2, { end: { per: "range", n: 2 } }, "treetop", 1),
    C("tailor", "building", { c: 2, s: 1, f: 1 }, 3, {}, "rock"),
    C("rosearbor", "building", { c: 2, s: 1, f: 2 }, 3, {}, "hedge"),
    C("hedgehog", "animal", { f: 2 }, 1, { prod: { f: 1 } }, "hedge", 3),
    C("beaver", "animal", { f: 2 }, 1, { prod: { c: 1 } }, "stream", 3),
    C("woodpecker", "animal", { c: 1, f: 2 }, 1, { prod: { s: 1 } }, "treetop", 3),
    C("mole", "animal", { f: 3 }, 1, { prod: { f: 1 } }, "rock", 3),
    C("hamster", "animal", { f: 1 }, 1, { draw: 1 }, "hedge", 3),
    C("otter", "animal", { f: 2 }, 2, { gain: { c: 2 } }, "stream"),
    C("bear", "animal", { f: 4 }, 3, {}, "heath"),
    C("owl", "animal", { f: 2 }, 2, { draw: 2 }, "treetop"),
    C("badger", "animal", { c: 1, f: 2 }, 2, { gain: { f: 1 } }, "rock"),
    C("fox", "animal", { f: 3 }, 2, { gain: { s: 1, f: 1 } }, "heath"),
    C("frog", "animal", { f: 2 }, 1, { gain: { f: 1 } }, "stream"),
    C("hawk", "animal", { f: 3 }, 2, { draw: 1, gain: { s: 1 } }, "treetop"),
    C("raccoon", "animal", { f: 3 }, 2, { gain: { c: 2, s: 1 } }, "rock"),
    C("magpie", "animal", { c: 1, f: 2 }, 2, { gain: { f: 1 } }, "treetop"),
    C("snail", "animal", { f: 2 }, 2, {}, "stream"),
    C("cricket", "animal", { f: 2 }, 1, { end: { per: "animal", n: 1 } }, "heath", 1),
    C("stag", "animal", { f: 4 }, 3, {}, "heath"),
    C("rabbit", "animal", { f: 1 }, 1, { gain: { f: 1 }, draw: 1 }, "hedge"),
    C("boar", "animal", { f: 3 }, 2, { gain: { c: 1, f: 1 } }, "rock"),
    C("blackbird", "animal", { c: 1, f: 1 }, 1, { gain: { s: 1 } }, "hedge"),
    C("duck", "animal", { f: 1 }, 1, { gain: { f: 2 } }, "stream"),
    C("firefly", "animal", { f: 1 }, 1, { draw: 1 }, "heath"),
    C("bat", "animal", { f: 3 }, 1, { end: { per: "animal", n: 1 } }, "treetop", 1),
    C("spider", "animal", { s: 1, f: 2 }, 2, {}, "rock"),
    C("lark", "animal", { f: 2 }, 2, {}, "hedge")
  ];
  const BY_ID = {};
  CARDS.forEach((c) => { BY_ID[c.id] = c; });
  function card(id) { return BY_ID[id]; }

  // Task cards: one lies open per game; everyone who fulfils it at the end
  // gets its points.
  const TASKS = [
    { id: "producers", n: 4, pts: 5 },     // at least 4 production cards
    { id: "animals", n: 6, pts: 5 },       // at least 6 animals
    { id: "ranges", n: 2, pts: 6 },        // at least 2 home ranges
    { id: "buildings", n: 7, pts: 5 },     // at least 7 buildings
    { id: "full", n: 11, pts: 5 },         // at least 11 cards
    { id: "allres", n: 3, pts: 6 }         // producers of all 3 resources
  ];

  function shuffle(a, rnd) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function fullDeck() {
    const out = [];
    CARDS.forEach((c) => { for (let i = 0; i < c.copies; i++) out.push(c.id); });
    return out;
  }

  function workersFor(p) { return Math.min(MAX_WORKERS, START_WORKERS + Math.floor(p.village.length / WORKER_STEP)); }

  function fillHand(s, p, rnd) { while (p.hand.length < HAND_FILL) { if (!giveCard(s, p, rnd)) break; } }

  function createGame(n, rng) {
    const rnd = rng || Math.random;
    const s = {
      rules: RULES,
      deck: shuffle(fullDeck(), rnd), discard: [], clearing: [],
      fields: FIELDS.map(() => []),   // player indexes per field, in order
      task: TASKS[Math.floor(rnd() * TASKS.length)].id,
      players: [], season: 0, starter: 0, current: 0, phase: "place", turn: 0, over: false, log: []
    };
    for (let i = 0; i < n; i++) {
      const res = { c: 0, s: 0, f: 0 };
      if (n > 1) addRes({ res }, SEAT_RES[i]);
      s.players.push({ res, hand: [], village: [], workers: START_WORKERS, placed: 0, placementsSinceProduction: 0, turns: 0 });
    }
    for (let i = 0; i < CLEARING; i++) s.clearing.push(drawOne(s, rnd));
    s.players.forEach((p) => fillHand(s, p, rnd));
    return s;
  }

  // Is this a game of the current rules? (Older saves are dropped.)
  function isCurrentState(s) {
    return !!s && s.rules === RULES && Array.isArray(s.players) && s.players.length >= 1 && s.players.length <= 4 &&
      Array.isArray(s.fields) && s.fields.length === FIELDS.length && Array.isArray(s.clearing) &&
      typeof s.season === "number" && s.season >= 0 && s.season < SEASONS.length && (s.phase === "place" || s.phase === "build") &&
      s.players.every((p) => p && p.res && Array.isArray(p.hand) && Array.isArray(p.village) &&
        p.village.every((v) => v && card(v.id)) && p.hand.every((id) => !!card(id)));
  }

  function drawOne(s, rnd) {
    if (!s.deck.length) {
      if (!s.discard.length) return null;
      s.deck = shuffle(s.discard, rnd);
      s.discard = [];
    }
    return s.deck.pop();
  }
  function giveCard(s, p, rnd) {
    const c = drawOne(s, rnd);
    if (c === null || c === undefined) return false;
    p.hand.push(c);
    return true;
  }

  function log(s, e) {
    s.log.push(e);
    if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  }

  function addRes(p, gain) { RES.forEach((k) => { if (gain && gain[k]) p.res[k] += gain[k]; }); }
  function canAfford(p, cost) { return Object.keys(cost).every((k) => p.res[k] >= cost[k]); }

  function habitatCount(p, habitat, kind) {
    return p.village.filter((v) => card(v.id).habitat === habitat && (!kind || card(v.id).kind === kind)).length;
  }

  // Is `id` eligible for a one-feather discount? Its habitat has more
  // buildings than animals in the village.
  function discountedAnimal(p, id) {
    const c = card(id);
    if (c.kind !== "animal") return false;
    return habitatCount(p, c.habitat, "building") > habitatCount(p, c.habitat, "animal");
  }

  function costFor(p, id) {
    const cost = Object.assign({}, card(id).cost);
    if (discountedAnimal(p, id)) cost.f = Math.max(0, (cost.f || 0) - 1);
    return cost;
  }

  function canBuild(s, p, id) {
    if (p.village.length >= MAX_VILLAGE) return false;
    return canAfford(p, costFor(p, id));
  }

  function season(s) { return SEASONS[s.season]; }

  function buildActions(s, p) {
    const out = [];
    p.hand.forEach((id, i) => { if (canBuild(s, p, id)) out.push({ type: "build", from: "hand", index: i }); });
    s.clearing.forEach((id, i) => { if (id && canBuild(s, p, id)) out.push({ type: "build", from: "clearing", index: i }); });
    return out;
  }

  // Legal actions of the active player:
  //   place phase: { type: "place", field };
  //   build phase: { type: "build", from: "hand" | "clearing", index }, { type: "end" }.
  function legalActions(s) {
    if (s.over) return [];
    const p = s.players[s.current];
    if (s.phase === "place") return FIELDS.map((f, i) => ({ type: "place", field: i }));
    return buildActions(s, p).concat([{ type: "end" }]);
  }

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function isLegal(s, act) { return legalActions(s).some((a) => same(a, act)); }

  function gainOf(f, first) {
    const g = Object.assign({}, f.gain || {});
    let draw = f.draw || 0;
    if (first && f.first) {
      RES.forEach((k) => { if (f.first[k]) g[k] = (g[k] || 0) + f.first[k]; });
      draw += f.first.draw || 0;
    }
    return { res: g, draw };
  }

  function endSeason(s, rnd) {
    if (s.season >= SEASONS.length - 1) { s.over = true; log(s, { k: "end" }); return; }
    s.season++;
    s.fields = FIELDS.map(() => []);
    s.players.forEach((p) => { p.placed = 0; p.workers = workersFor(p); fillHand(s, p, rnd); });
    s.starter = (s.starter + 1) % s.players.length;
    s.current = s.starter;
    s.phase = "place";
    log(s, { k: "season", season: season(s), p: s.starter });
  }

  // Next player with a squirrel left (in seat order), or the end of the season.
  function nextTurn(s, rnd) {
    const n = s.players.length;
    for (let k = 1; k <= n; k++) {
      const i = (s.current + k) % n;
      if (s.players[i].placed < s.players[i].workers) { s.current = i; s.phase = "place"; return; }
    }
    endSeason(s, rnd);
  }

  // Carries out a legal action (false: illegal, nothing changed).
  function apply(s, act, rng) {
    if (!isLegal(s, act)) return false;
    const rnd = rng || Math.random;
    const me = s.current, p = s.players[me];
    if (act.type === "place") {
      const f = FIELDS[act.field];
      const first = !s.fields[act.field].length;
      s.fields[act.field].push(me);
      p.placed++;
      const g = gainOf(f, first);
      addRes(p, g.res);
      for (let i = 0; i < g.draw; i++) giveCard(s, p, rnd);
      p.placementsSinceProduction = (p.placementsSinceProduction || 0) + 1;
      let produced = false;
      if (p.placementsSinceProduction >= 2) {
        p.placementsSinceProduction = 0;
        p.village.forEach((v) => { const c = card(v.id); if (c.fx.prod) { addRes(p, c.fx.prod); produced = true; } });
      }
      log(s, { k: "place", p: me, field: act.field, first, produced });
      p.turns++;
      s.turn++;
      if (buildActions(s, p).length) { s.phase = "build"; return true; }
      nextTurn(s, rnd);
      return true;
    }
    if (act.type === "build") {
      const id = act.from === "hand" ? p.hand[act.index] : s.clearing[act.index];
      const c = card(id);
      const discounted = discountedAnimal(p, id);
      const cost = costFor(p, id);
      Object.keys(cost).forEach((k) => { p.res[k] -= cost[k]; });
      if (act.from === "hand") p.hand.splice(act.index, 1);
      else s.clearing[act.index] = drawOne(s, rnd);
      p.village.push({ id });
      if (c.fx.prod) addRes(p, c.fx.prod);
      addRes(p, c.fx.gain);
      for (let i = 0; i < (c.fx.draw || 0); i++) giveCard(s, p, rnd);
      log(s, { k: "build", p: me, c: id, discounted });
    }
    nextTurn(s, rnd);
    return true;
  }

  // --- scoring ---------------------------------------------------------------

  function countOf(p, pred) { return p.village.filter((v) => pred(card(v.id))).length; }
  // Home ranges: habitats with at least RANGE_MIN cards in the village.
  function ranges(p) { return HABITATS.filter((h) => habitatCount(p, h) >= RANGE_MIN).length; }
  function taskDone(s, p) {
    const t = TASKS.find((x) => x.id === s.task);
    switch (t.id) {
      case "producers": return countOf(p, (c) => !!c.fx.prod) >= t.n;
      case "animals": return countOf(p, (c) => c.kind === "animal") >= t.n;
      case "ranges": return ranges(p) >= t.n;
      case "buildings": return countOf(p, (c) => c.kind === "building") >= t.n;
      case "full": return p.village.length >= t.n;
      default: return RES.every((r) => p.village.some((v) => card(v.id).fx.prod && card(v.id).fx.prod[r]));
    }
  }

  // Points of player i: { cards, ranges, bonus, task, total }.
  function score(s, i) {
    const p = s.players[i];
    const cards = p.village.reduce((a, v) => a + card(v.id).pts, 0);
    const rg = ranges(p) * RANGE_PTS;
    let bonus = 0;
    p.village.forEach((v) => {
      const e = card(v.id).fx.end;
      if (!e) return;
      let k = 0;
      if (e.per === "building") k = countOf(p, (c) => c.kind === "building");
      else if (e.per === "animal") k = countOf(p, (c) => c.kind === "animal");
      else if (e.per === "prod") k = countOf(p, (c) => !!c.fx.prod);
      else if (e.per === "range") k = ranges(p);
      else if (e.per === "leftover") k = Math.min(5, Math.floor(RES.reduce((a, r) => a + p.res[r], 0) / 2));
      bonus += k * e.n;
    });
    const task = taskDone(s, p) ? TASKS.find((x) => x.id === s.task).pts : 0;
    return { cards, ranges: rg, bonus, task, total: cards + rg + bonus + task };
  }

  function winners(s) {
    const totals = s.players.map((p, i) => score(s, i).total);
    if (s.players.length === 1) return totals[0] >= SOLO_TARGET ? [0] : [];
    const best = Math.max.apply(null, totals);
    return totals.map((t, i) => i).filter((i) => totals[i] === best);
  }

  // --- the computer -----------------------------------------------------------

  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function sumRes(r) { return RES.reduce((a, k) => a + ((r && r[k]) || 0), 0); }

  // Squirrels p will still send this game (rough guess for later seasons).
  function placementsLeft(s, p) {
    const now = Math.max(0, p.workers - p.placed);
    const later = SEASONS.length - 1 - s.season;
    return now + later * Math.min(MAX_WORKERS, START_WORKERS + Math.floor((p.village.length + 2) / WORKER_STEP));
  }

  // How much a card in reach is worth to player p now (points, production
  // for the rest of the game, home ranges, end bonuses), minus its cost.
  function cardValue(s, p, id, level) {
    const c = card(id);
    const discounted = discountedAnimal(p, id);
    let v = c.pts;
    const left = placementsLeft(s, p);
    if (c.fx.prod) v += sumRes(c.fx.prod) * (1 + Math.floor(left / 2)) * (level === "hard" ? 0.45 : 0.6);
    if (c.fx.gain) v += sumRes(c.fx.gain) * 0.6;
    if (c.fx.draw) v += c.fx.draw * (s.season >= 3 ? 0.15 : 0.4);
    if (level !== "easy") {
      // Home range: the third card of a habitat completes one.
      const have = habitatCount(p, c.habitat);
      if (have === RANGE_MIN - 1) v += RANGE_PTS;
      else if (have === RANGE_MIN - 2 && level === "hard" && s.season < 3) v += 1;
      // A new squirrel next season.
      if (level === "hard" && s.season < 3 && (p.village.length + 1) % WORKER_STEP === 0 && workersFor(p) < MAX_WORKERS) v += 1.5;
    }
    if (c.fx.end && level !== "easy") {
      const e = c.fx.end;
      const guess = { building: 6, animal: 5, prod: 4, range: 1.5, leftover: 2 }[e.per] || 2;
      v += guess * e.n * (s.season >= 2 ? 1 : 0.8);
    }
    if (level === "hard") {
      // Late in the game a village place is worth more than a cheap card.
      const room = MAX_VILLAGE - p.village.length;
      if (room <= 6) v -= Math.max(0, 2.5 - c.pts) * (7 - room) * 0.35;
      if (s.task === "animals" && c.kind === "animal") v += 0.6;
      if (s.task === "buildings" && c.kind === "building") v += 0.6;
      if (s.task === "producers" && c.fx.prod) v += 0.6;
    }
    return v - sumRes(costFor(p, id)) * (level === "hard" ? 0.25 : 0.3) + (discounted ? 0.4 : 0);
  }

  function bestBuildValue(s, p, level) {
    let best = 0;
    if (p.village.length >= MAX_VILLAGE) return 0;
    p.hand.concat(s.clearing).forEach((id) => {
      if (!id || !canAfford(p, costFor(p, id))) return;
      best = Math.max(best, cardValue(s, p, id, level));
    });
    return best;
  }

  // What a field is worth to p now.
  function fieldValue(s, p, i, level) {
    const f = FIELDS[i];
    const g = gainOf(f, !s.fields[i].length);
    let v = sumRes(g.res) * 0.7 + g.draw * (s.season >= 3 ? 0.15 : 0.45);
    if (level === "easy") return v;
    // Production pays out after this squirrel?
    const want = { c: 0, s: 0, f: 0 };
    p.hand.concat(s.clearing).forEach((id) => {
      if (!id) return;
      const c = card(id);
      if (cardValue(s, p, id, level) < 2) return;
      Object.keys(c.cost).forEach((k) => { want[k] += Math.max(0, c.cost[k] - p.res[k]) * 0.15; });
    });
    const cap = level === "hard" ? 2 : 1.2;
    RES.forEach((k) => { if (g.res[k]) v += Math.min(want[k] * (level === "hard" ? 1.6 : 1), cap) * g.res[k]; });
    if (level === "hard") {
      // Look one step ahead: the best card this squirrel lets me build.
      const q = { res: Object.assign({}, p.res), hand: p.hand, village: p.village, workers: p.workers, placed: p.placed + 1 };
      addRes(q, g.res);
      if ((p.placementsSinceProduction || 0) + 1 >= 2) p.village.forEach((x) => addRes(q, card(x.id).fx.prod));
      v += Math.max(0, bestBuildValue(s, q, level) - bestBuildValue(s, p, level)) * 0.8;
    }
    return v;
  }

  function chooseAction(s, level, rng) {
    const rnd = rng || Math.random;
    const p = s.players[s.current];
    const acts = legalActions(s);
    if (level === "easy" && rnd() < 0.5) {
      const pick = acts.filter((a) => a.type !== "end");
      if (pick.length) return pick[Math.floor(rnd() * pick.length)];
    }
    let best = null, bv = -Infinity;
    acts.forEach((a) => {
      let v;
      if (a.type === "build") {
        const id = a.from === "hand" ? p.hand[a.index] : s.clearing[a.index];
        v = cardValue(s, p, id, level) + 0.5;
        if (p.village.length >= MAX_VILLAGE - 2 && card(id).pts <= 1 && !discountedAnimal(p, id)) v -= 2;
      } else if (a.type === "place") v = fieldValue(s, p, a.field, level);
      else v = 0.6; // end the turn without building
      v += rnd() * (level === "hard" ? 0.05 : 0.3);
      if (v > bv) { bv = v; best = a; }
    });
    return best;
  }

  return { RULES, RES, SEASONS, HABITATS, FIELDS, CARDS, TASKS, START_WORKERS, WORKER_STEP, MAX_WORKERS, HAND_FILL, MAX_VILLAGE, CLEARING,
    RANGE_MIN, RANGE_PTS, SOLO_TARGET, SEAT_RES,
    card, makeRng, createGame, isCurrentState, legalActions, isLegal, apply, canBuild, costFor, discountedAnimal, workersFor,
    gainOf, score, winners, taskDone, ranges, chooseAction, clone, season };
})();

if (typeof module !== "undefined" && module.exports) module.exports = ForestVillageCore;
if (typeof window !== "undefined") window.ForestVillageCore = ForestVillageCore;
