// forestvillage-core.js
// "Forest Village" (Waldsiedlung) - forest animals build a village through
// the seasons; 1 to 4 players (alone against a target score, or against
// the computer). Dependency-free, no DOM.
//
// Resources: clay, seeds and feathers (c, s, f). Everyone starts
// with 2 workers (squirrels). A turn is one of:
//   place  send a worker to a forest space and take its reward; after every
//          second placement, the player's production cards pay out;
//   build  pay for a card from hand or the Clearing (6 open cards); a
//          matching animal gets a one-feather discount; villages hold 12;
//   season return all workers and advance at the player's own pace;
//   pass   (winter only) done for this game.
// The game ends when everyone has passed. Points: the cards, 2 per pair
// (building with its animal), the end bonuses of some cards and the open
// task card. Alone: reach the target score.
// Hand at most 8 cards (a card drawn beyond is lost). Later seats start
// with more cards in hand (5, 6, 7, 8).

const ForestVillageCore = (function () {
  const RES = ["c", "s", "f"];
  const SEASONS = ["latewinter", "spring", "summer", "autumn", "winter"];
  const NEW_WORKERS = { spring: 1, summer: 0, autumn: 2, winter: 0 };
  const MAX_VILLAGE = 12;
  const MAX_HAND = 8;
  const MEADOW = 6;
  const START_HAND = [5, 6, 7, 8];
  const PAIR_BONUS = 2;
  const SOLO_TARGET = 45;

  // Fields of the forest map: what a worker gets; shared fields take any
  // number of workers.
  const FIELDS = [
    { id: "claybank", gain: { c: 3 } },
    { id: "seedpatch", gain: { s: 2 } },
    { id: "featherbed", gain: { f: 2 } },
    { id: "fernpath", gain: { c: 1, f: 1 } },
    { id: "mossytrail", gain: { s: 1, f: 1 } },
    { id: "sunnyhollow", gain: { c: 1, s: 1 } },
    { id: "oldoak", gain: { c: 1 }, draw: 2, shared: true },
    { id: "market", draw: 3, shared: true }
  ];

  // Cards: [id, kind, cost, points, effect, partner, copies]
  //   effect: { prod: {res}, gain: {res}, draw: n, end: { per, n } }
  //   prod gives at build and after every second worker placement; gain/draw once at
  //   build; end scores at the end (per "building" | "animal" | "prod" |
  //   "pair" | "leftover").
  const C = (id, kind, cost, pts, fx, partner, copies) => ({ id, kind, cost, pts, fx: fx || {}, partner, copies: copies || 2 });
  const CARDS = [
    C("bakery", "building", { w: 2, p: 1 }, 2, { prod: { b: 2 } }, "hedgehog", 3),
    C("sawmill", "building", { r: 1, p: 1 }, 2, { prod: { w: 2 } }, "beaver", 3),
    C("resinkettle", "building", { w: 2, p: 1 }, 2, { prod: { r: 1 } }, "woodpecker", 3),
    C("gravelpit", "building", { w: 2, r: 1 }, 2, { prod: { p: 1 } }, "mole", 3),
    C("pantry", "building", { w: 2 }, 1, { prod: { w: 1, b: 1 } }, "hamster", 3),
    C("watermill", "building", { w: 3, p: 1 }, 3, { prod: { r: 1, b: 1 } }, "otter"),
    C("beehive", "building", { w: 1, b: 1 }, 1, { prod: { r: 1 } }, "bear"),
    C("school", "building", { w: 2, r: 1 }, 2, { draw: 3 }, "owl"),
    C("library", "building", { r: 2, p: 1 }, 3, { draw: 2, gain: { p: 1 } }, "badger"),
    C("inn", "building", { w: 2, r: 1 }, 2, { gain: { b: 3 } }, "fox"),
    C("well", "building", { w: 2 }, 1, { gain: { r: 1, p: 1 } }, "frog"),
    C("lookout", "building", { w: 3, p: 2 }, 4, {}, "hawk"),
    C("workshop", "building", { w: 2, r: 1 }, 2, { gain: { w: 1, r: 1, p: 1 } }, "raccoon"),
    C("markethall", "building", { w: 2, r: 1, p: 1 }, 3, { gain: { w: 1, r: 1, p: 1, b: 1 } }, "magpie"),
    C("teahouse", "building", { w: 2, r: 2, p: 1 }, 2, { end: { per: "animal", n: 1 } }, "snail", 1),
    C("bandstand", "building", { w: 2, r: 2, p: 1 }, 2, { end: { per: "prod", n: 1 } }, "cricket", 1),
    C("townhall", "building", { w: 3, r: 2, p: 2 }, 2, { end: { per: "building", n: 1 } }, "stag", 1),
    C("herbgarden", "building", { w: 1, r: 1 }, 1, { prod: { b: 1 }, draw: 1 }, "rabbit"),
    C("mushroomcellar", "building", { w: 1, p: 1 }, 1, { prod: { b: 2 } }, "boar"),
    C("pottery", "building", { w: 2, p: 1 }, 2, { end: { per: "leftover", n: 1 } }, "blackbird", 1),
    C("bridge", "building", { r: 1, p: 1 }, 2, { gain: { w: 3 } }, "duck"),
    C("lanternhouse", "building", { w: 2, r: 1 }, 2, { draw: 2 }, "firefly"),
    C("observatory", "building", { r: 2, p: 3 }, 2, { end: { per: "pair", n: 2 } }, "bat", 1),
    C("tailor", "building", { w: 2, r: 1, p: 1 }, 3, {}, "spider"),
    C("fairground", "building", { w: 2, r: 1, b: 2 }, 3, {}, "lark"),
    C("hedgehog", "animal", { b: 2 }, 1, { prod: { b: 1 } }, "bakery", 3),
    C("beaver", "animal", { b: 2 }, 1, { prod: { w: 1 } }, "sawmill", 3),
    C("woodpecker", "animal", { b: 2, w: 1 }, 1, { prod: { r: 1 } }, "resinkettle", 3),
    C("mole", "animal", { b: 3 }, 1, { prod: { p: 1 } }, "gravelpit", 3),
    C("hamster", "animal", { b: 1 }, 1, { draw: 1 }, "pantry", 3),
    C("otter", "animal", { b: 2 }, 2, { gain: { w: 2 } }, "watermill"),
    C("bear", "animal", { b: 4 }, 3, {}, "beehive"),
    C("owl", "animal", { b: 2 }, 2, { draw: 2 }, "school"),
    C("badger", "animal", { b: 2, w: 1 }, 2, { gain: { p: 1 } }, "library"),
    C("fox", "animal", { b: 3 }, 2, { gain: { r: 1, p: 1 } }, "inn"),
    C("frog", "animal", { b: 2 }, 1, { gain: { p: 1 } }, "well"),
    C("hawk", "animal", { b: 3 }, 2, { draw: 1, gain: { r: 1 } }, "lookout"),
    C("raccoon", "animal", { b: 3 }, 2, { gain: { w: 2, r: 1 } }, "workshop"),
    C("magpie", "animal", { b: 2, w: 1 }, 2, { gain: { p: 1 } }, "markethall"),
    C("snail", "animal", { b: 2 }, 2, {}, "teahouse"),
    C("cricket", "animal", { b: 2 }, 1, { end: { per: "animal", n: 1 } }, "bandstand", 1),
    C("stag", "animal", { b: 4 }, 3, {}, "townhall"),
    C("rabbit", "animal", { b: 1 }, 1, { gain: { b: 1 }, draw: 1 }, "herbgarden"),
    C("boar", "animal", { b: 3 }, 2, { gain: { w: 1, b: 1 } }, "mushroomcellar"),
    C("blackbird", "animal", { b: 1, w: 1 }, 1, { gain: { r: 1 } }, "pottery"),
    C("duck", "animal", { b: 1 }, 1, { gain: { b: 2 } }, "bridge"),
    C("firefly", "animal", { b: 1 }, 1, { draw: 1 }, "lanternhouse"),
    C("bat", "animal", { b: 3 }, 1, { end: { per: "animal", n: 1 } }, "observatory", 1),
    C("spider", "animal", { b: 2, r: 1 }, 2, {}, "tailor"),
    C("lark", "animal", { b: 2 }, 2, {}, "fairground")
  ];
  // Cards began with a four-resource prototype. Convert their costs and effects
  // into the current three-resource economy, combining stone/food into feathers.
  const convertResources = (obj) => {
    const out = {};
    Object.keys(obj || {}).forEach((k) => {
      const key = ({ w: "c", r: "s", p: "f", b: "f" })[k] || k;
      out[key] = (out[key] || 0) + obj[k];
    });
    return out;
  };
  CARDS.forEach((c) => {
    c.cost = convertResources(c.cost);
    if (c.fx.prod) c.fx.prod = convertResources(c.fx.prod);
    if (c.fx.gain) c.fx.gain = convertResources(c.fx.gain);
  });
  const BY_ID = {};
  CARDS.forEach((c) => { BY_ID[c.id] = c; });
  function card(id) { return BY_ID[id]; }

  // Task cards: one lies open per game; everyone who fulfils it at the end
  // gets its points.
  const TASKS = [
    { id: "producers", n: 4, pts: 5 },     // at least 4 production cards
    { id: "animals", n: 6, pts: 5 },       // at least 6 animals
    { id: "pairs", n: 3, pts: 6 },         // at least 3 pairs
    { id: "buildings", n: 7, pts: 5 },     // at least 7 buildings
    { id: "full", n: 11, pts: 5 },         // at least 13 cards
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

  function createGame(n, rng) {
    const rnd = rng || Math.random;
    const s = {
      deck: shuffle(fullDeck(), rnd), discard: [], meadow: [],
      fields: FIELDS.map(() => []),   // player indexes per field
      task: TASKS[Math.floor(rnd() * TASKS.length)].id,
      players: [], current: 0, turn: 0, over: false, log: []
    };
    for (let i = 0; i < n; i++) {
      s.players.push({ res: { c: 0, s: 0, f: 0 }, hand: [], village: [], workers: 2, placed: 0, placementsSinceProduction: 0, season: 0, passed: false, turns: 0 });
    }
    for (let i = 0; i < MEADOW; i++) s.meadow.push(drawOne(s, rnd));
    s.players.forEach((p, i) => { for (let k = 0; k < START_HAND[i]; k++) giveCard(s, p, rnd); });
    return s;
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
    if (c === null) return;
    if (p.hand.length >= MAX_HAND) s.discard.push(c);
    else p.hand.push(c);
  }

  function log(s, e) {
    s.log.push(e);
    if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  }

  function addRes(p, gain) { Object.keys(gain || {}).forEach((k) => { p.res[k] += gain[k]; }); }
  function canAfford(p, cost) { return Object.keys(cost).every((k) => p.res[k] >= cost[k]); }

  // Is `id` eligible for a one-feather discount because its partner building
  // stands in the village without that animal yet?
  function discountedAnimal(p, id) {
    const c = card(id);
    if (c.kind !== "animal") return false;
    return p.village.filter((v) => v.id === c.partner).length > p.village.filter((v) => v.id === id).length;
  }

  function canBuild(s, p, id) {
    if (p.village.length >= MAX_VILLAGE) return false;
    const cost = Object.assign({}, card(id).cost);
    if (discountedAnimal(p, id)) cost.f = Math.max(0, (cost.f || 0) - 1);
    return canAfford(p, cost);
  }

  function season(p) { return SEASONS[p.season]; }

  // Legal actions of the active player:
  //   { type: "place", field }, { type: "build", from: "hand" | "meadow",
  //   index }, { type: "season" }, { type: "pass" }.
  function legalActions(s) {
    if (s.over) return [];
    const p = s.players[s.current];
    const out = [];
    if (p.placed < p.workers) {
      FIELDS.forEach((f, i) => { if (f.shared || !s.fields[i].length) out.push({ type: "place", field: i }); });
    }
    p.hand.forEach((id, i) => { if (canBuild(s, p, id)) out.push({ type: "build", from: "hand", index: i }); });
    s.meadow.forEach((id, i) => { if (id && canBuild(s, p, id)) out.push({ type: "build", from: "meadow", index: i }); });
    if (p.placed >= p.workers && p.season < SEASONS.length - 1) out.push({ type: "season" });
    if (season(p) === "winter") out.push({ type: "pass" });
    // Nothing else possible: the season must change (or, in winter, pass).
    if (!out.length) out.push(p.season < SEASONS.length - 1 ? { type: "season" } : { type: "pass" });
    return out;
  }

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function isLegal(s, act) { return legalActions(s).some((a) => same(a, act)); }

  function produce(s, p, c, rnd) {
    if (c.fx.prod) addRes(p, c.fx.prod);
  }

  // Carries out a legal action (false: illegal, nothing changed).
  function apply(s, act, rng) {
    if (!isLegal(s, act)) return false;
    const rnd = rng || Math.random;
    const me = s.current, p = s.players[me];
    if (act.type === "place") {
      const f = FIELDS[act.field];
      s.fields[act.field].push(me);
      p.placed++;
      addRes(p, f.gain);
      p.placementsSinceProduction = (p.placementsSinceProduction || 0) + 1;
      if (p.placementsSinceProduction >= 2) {
        p.placementsSinceProduction = 0;
        p.village.forEach((v) => produce(s, p, card(v.id), rnd));
      }
      for (let i = 0; i < (f.draw || 0); i++) giveCard(s, p, rnd);
      log(s, { k: "place", p: me, field: act.field });
    } else if (act.type === "build") {
      const id = act.from === "hand" ? p.hand[act.index] : s.meadow[act.index];
      const c = card(id);
      const discounted = discountedAnimal(p, id);
      const cost = Object.assign({}, c.cost);
      if (discounted) cost.f = Math.max(0, (cost.f || 0) - 1);
      Object.keys(cost).forEach((k) => { p.res[k] -= cost[k]; });
      if (act.from === "hand") p.hand.splice(act.index, 1);
      else s.meadow[act.index] = drawOne(s, rnd);
      p.village.push({ id });
      produce(s, p, c, rnd);
      addRes(p, c.fx.gain);
      for (let i = 0; i < (c.fx.draw || 0); i++) giveCard(s, p, rnd);
      log(s, { k: "build", p: me, c: id, discounted });
    } else if (act.type === "season") {
      s.fields.forEach((list) => { for (let i = list.length - 1; i >= 0; i--) if (list[i] === me) list.splice(i, 1); });
      p.placed = 0;
      p.season++;
      const name = season(p);
      p.workers += NEW_WORKERS[name] || 0;
      if (name === "summer") { giveCard(s, p, rnd); giveCard(s, p, rnd); }
      log(s, { k: "season", p: me, season: name });
    } else if (act.type === "pass") {
      p.passed = true;
      s.fields.forEach((list) => { for (let i = list.length - 1; i >= 0; i--) if (list[i] === me) list.splice(i, 1); });
      log(s, { k: "pass", p: me });
    }
    p.turns++;
    s.turn++;
    if (s.players.every((q) => q.passed)) { s.over = true; log(s, { k: "end" }); return true; }
    // Next player who has not passed.
    let n = me;
    do { n = (n + 1) % s.players.length; } while (s.players[n].passed);
    s.current = n;
    return true;
  }

  // --- scoring ---------------------------------------------------------------

  function countOf(p, pred) { return p.village.filter((v) => pred(card(v.id))).length; }
  // Pairs: each building with one animal of its partner kind.
  function pairs(p) {
    let n = 0;
    CARDS.forEach((c) => {
      if (c.kind !== "building") return;
      n += Math.min(p.village.filter((v) => v.id === c.id).length, p.village.filter((v) => v.id === c.partner).length);
    });
    return n;
  }
  function taskDone(s, p) {
    const t = TASKS.find((x) => x.id === s.task);
    switch (t.id) {
      case "producers": return countOf(p, (c) => !!c.fx.prod) >= t.n;
      case "animals": return countOf(p, (c) => c.kind === "animal") >= t.n;
      case "pairs": return pairs(p) >= t.n;
      case "buildings": return countOf(p, (c) => c.kind === "building") >= t.n;
      case "full": return p.village.length >= t.n;
      default: return RES.every((r) => p.village.some((v) => card(v.id).fx.prod && card(v.id).fx.prod[r]));
    }
  }

  // Points of player i: { cards, pairs, bonus, task, total }.
  function score(s, i) {
    const p = s.players[i];
    const cards = p.village.reduce((a, v) => a + card(v.id).pts, 0);
    const pr = pairs(p) * PAIR_BONUS;
    let bonus = 0;
    p.village.forEach((v) => {
      const e = card(v.id).fx.end;
      if (!e) return;
      let k = 0;
      if (e.per === "building") k = countOf(p, (c) => c.kind === "building");
      else if (e.per === "animal") k = countOf(p, (c) => c.kind === "animal");
      else if (e.per === "prod") k = countOf(p, (c) => !!c.fx.prod);
      else if (e.per === "pair") k = pairs(p);
      else if (e.per === "leftover") k = Math.min(5, Math.floor(RES.reduce((a, r) => a + p.res[r], 0) / 2));
      bonus += k * e.n;
    });
    const task = taskDone(s, p) ? TASKS.find((x) => x.id === s.task).pts : 0;
    return { cards, pairs: pr, bonus, task, total: cards + pr + bonus + task };
  }

  function winners(s) {
    const totals = s.players.map((p, i) => score(s, i).total);
    if (s.players.length === 1) return totals[0] >= SOLO_TARGET ? [0] : [];
    const best = Math.max.apply(null, totals);
    return totals.map((t, i) => i).filter((i) => totals[i] === best);
  }

  // --- the computer -----------------------------------------------------------

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  // How much a card in reach is worth to player p now (points, production
  // for the rest of the game, pairs, end bonuses), minus its cost.
  function cardValue(s, p, id, level) {
    const c = card(id);
    const discounted = discountedAnimal(p, id);
    let v = c.pts;
    const placementsLeft = Math.max(0, p.workers - p.placed); // future production opportunities
    if (c.fx.prod) v += sumRes(c.fx.prod) * (1 + Math.ceil(placementsLeft / 2)) * 0.6;
    if (c.fx.gain) v += sumRes(c.fx.gain) * 0.6;
    if (c.fx.draw) v += c.fx.draw * 0.5;
    const nb = p.village.filter((x) => x.id === (c.kind === "animal" ? c.partner : c.id)).length;
    const na = p.village.filter((x) => x.id === (c.kind === "animal" ? c.id : c.partner)).length;
    if (c.kind === "animal" ? nb > na : na > nb) v += PAIR_BONUS;
    if (c.fx.end && level !== "easy") {
      const e = c.fx.end;
      const guess = { building: 6, animal: 5, prod: 4, pair: 3, leftover: 2 }[e.per] || 2;
      v += guess * e.n * (p.season >= 3 ? 1 : 0.8);
    }
    if (c.kind === "building" && level === "hard") {
      // A partner animal that is in reach makes the building worth more.
      const partnerVisible = p.hand.concat(s.meadow).indexOf(c.partner) !== -1;
      if (partnerVisible) v += 1.5;
    }
    if (level === "hard") {
      // Late in the game a village place is worth more than a cheap card.
      const room = MAX_VILLAGE - p.village.length;
      if (room <= 6) v -= Math.max(0, 2.5 - c.pts) * (7 - room) * 0.35;
    }
    const effectiveCost = Object.assign({}, c.cost);
    if (discounted) effectiveCost.f = Math.max(0, (effectiveCost.f || 0) - 1);
    return v - sumRes(effectiveCost) * (level === "hard" ? 0.25 : 0.3) + (discounted ? 0.4 : 0);
  }
  function sumRes(r) { return Object.keys(r || {}).reduce((a, k) => a + r[k], 0); }

  // What the resources of a field are worth to p (what is missing for the
  // best cards in reach counts more).
  function fieldValue(s, p, f, level) {
    let v = sumRes(f.gain) * 0.7 + (f.draw || 0) * 0.45;
    if (level !== "easy") {
      const want = { c: 0, s: 0, f: 0 };
      p.hand.concat(s.meadow).forEach((id) => {
        if (!id) return;
        const c = card(id);
        if (cardValue(s, p, id, level) < 2) return;
        Object.keys(c.cost).forEach((k) => { want[k] += Math.max(0, c.cost[k] - p.res[k]) * 0.15; });
      });
      const cap = level === "hard" ? 2 : 1.2;
      Object.keys(f.gain || {}).forEach((k) => { v += Math.min(want[k] * (level === "hard" ? 1.6 : 1), cap) * f.gain[k]; });
      if (p.hand.length >= MAX_HAND - 1) v -= (f.draw || 0) * 0.45;
    }
    return v;
  }

  function chooseAction(s, level, rng) {
    const rnd = rng || Math.random;
    const p = s.players[s.current];
    const acts = legalActions(s);
    if (level === "easy" && rnd() < 0.5) {
      const nonSeason = acts.filter((a) => a.type !== "season" && a.type !== "pass");
      if (nonSeason.length) return nonSeason[Math.floor(rnd() * nonSeason.length)];
    }
    let best = null, bv = -Infinity;
    acts.forEach((a) => {
      let v;
      if (a.type === "build") {
        const id = a.from === "hand" ? p.hand[a.index] : s.meadow[a.index];
        v = cardValue(s, p, id, level) + 0.5;
        if (p.village.length >= MAX_VILLAGE - 2 && card(id).pts <= 1 && !discountedAnimal(p, id)) v -= 2;
      } else if (a.type === "place") v = fieldValue(s, p, FIELDS[a.field], level);
      else if (a.type === "season") v = 0.2;
      else v = 0.1; // pass
      v += rnd() * (level === "hard" ? 0.05 : 0.3);
      if (v > bv) { bv = v; best = a; }
    });
    // In winter nothing worth doing: pass.
    if (best && best.type !== "pass" && season(p) === "winter" && bv < 0.4) return { type: "pass" };
    return best;
  }

  return { RES, SEASONS, FIELDS, CARDS, TASKS, MAX_VILLAGE, MAX_HAND, MEADOW, START_HAND, PAIR_BONUS, SOLO_TARGET,
    card, makeRng, createGame, legalActions, isLegal, apply, canBuild, discountedAnimal, score, winners, taskDone, pairs, chooseAction, clone, season };
})();

if (typeof module !== "undefined" && module.exports) module.exports = ForestVillageCore;
if (typeof window !== "undefined") window.ForestVillageCore = ForestVillageCore;
