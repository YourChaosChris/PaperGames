// villains-core.js
// "Fairy-Tale Villains" (Märchen-Schurken) - every player is a villain from
// the Grimms' fairy tales with an own goal, 2 to 4 players. Dependency-free,
// no DOM.
//
// Each villain has a domain of 4 places, each with 2 or 3 actions. A turn:
// move the figure to another place of the own domain, then use the actions
// there, each once, in any order; at the end draw back up to 4 cards.
// Actions:
//   gold1/gold2/gold3  take that much gold
//   play     play one card from the hand (pay its cost in gold)
//   discard  discard any number of cards (drawn back at the end of the turn)
//   move     move one of your helpers or one hero in your domain to another
//            place
//   defeat   defeat a hero anywhere in your domain: pay its strength in gold,
//            minus the strength of your helpers at its place
//   twist    "Twist of the tale": draw 2 cards of another villain's twist
//            pile and put one of them into that villain's domain (a hero on
//            a free place of your choice, or an event that happens at once);
//            the other is discarded
//   goal     the villain's own goal action (see GOALS)
// A hero blocks his place: its actions can't be used, only the hero there
// can be defeated (same price). Helpers stay where they were played.
// The player after the first starts with 1 gold, the next with 2, the
// next with 3.
//
// State: { players: [{ villain, place (index or -1), gold, hand, deck,
// discard, helpers: [{ card, place }], heroes: [{ card, place }], twist,
// twistDiscard, prog: {...} }], current, turn, winner, log, phase,
// used: [actions used this turn], pendingTwist }.

const VillainsCore = (function () {
  const HAND = 4;
  const START_GOLD = [0, 1, 2, 3];

  // Cards in every villain's deck: helpers (strength) and tricks.
  const SHARED = [
    { id: "goldcoin", kind: "trick", cost: 0, fx: "gold", n: 2, count: 3 },
    { id: "raven", kind: "helper", cost: 1, str: 1, count: 2 },
    { id: "toad", kind: "helper", cost: 2, str: 2, count: 2 },
    { id: "giant", kind: "helper", cost: 4, str: 3, count: 1 },
    { id: "cunningplan", kind: "trick", cost: 0, fx: "draw", n: 2, count: 2 },
    { id: "evileye", kind: "trick", cost: 1, fx: "shove", count: 1 }
  ];
  // Twist cards in every villain's twist pile (events).
  const SHARED_TWIST = [
    { id: "badluck", kind: "event", fx: "losegold", n: 2, count: 2 },
    { id: "chasedoff", kind: "event", fx: "losehelper", count: 1 }
  ];

  // Per villain: places (name ids and actions), the goal, two own cards
  // (trump: does the goal action from anywhere; ward: removes a hero) and
  // the heroes of the twist pile [id, strength].
  const VILLAINS = {
    witch: {
      places: [["gingerhouse", ["gold2", "play"]], ["bakery", ["goal", "discard", "gold1"]], ["deepwood", ["twist", "play", "move"]], ["oven", ["goal", "defeat", "gold1"]]],
      trump: "magicdough", ward: "sweets",
      heroes: [["hansel", 2], ["gretel", 3], ["woodcutter", 3], ["whiteduck", 1], ["whitebird", 2]]
    },
    wolf: {
      places: [["darkwood", ["gold2", "play", "discard"]], ["chandler", ["goal", "twist"]], ["mill", ["goal", "gold1", "defeat"]], ["goathouse", ["goal", "move", "play"]]],
      trump: "swiftpaw", ward: "sheepskin",
      heroes: [["mothergoat", 3], ["youngestkid", 1], ["hunter", 3], ["redcap", 2], ["grandmother", 2]]
    },
    rumpel: {
      places: [["spinningroom", ["goal", "play"]], ["royalcourt", ["gold1", "twist"]], ["fireplace", ["gold1", "play", "defeat"]], ["woodhut", ["gold1", "discard", "move"]]],
      trump: "goldenwheel", ward: "falsename",
      heroes: [["queen", 3], ["king", 3], ["messenger", 2], ["miller", 2], ["guard", 1]]
    },
    stepmother: {
      places: [["mirrorhall", ["goal", "gold2"]], ["castlekitchen", ["play", "gold1", "discard"]], ["sevenhills", ["twist", "move", "gold1"]], ["dwarfhouse", ["goal", "defeat", "play"]]],
      trump: "magicmirror", ward: "disguise",
      heroes: [["snowwhite", 2], ["huntsman", 2], ["dwarf", 1], ["prince", 3], ["sevendwarfs", 3]]
    },
    sorcerer: {
      places: [["towerroom", ["gold3", "play"]], ["birdmeadow", ["goal", "twist"]], ["castlegate", ["defeat", "move", "discard"]], ["magicwell", ["gold2", "play"]]],
      trump: "lureflute", ward: "transform",
      heroes: [["joringel", 3], ["jorinde", 2], ["shepherd", 2], ["redflower", 1], ["nightingale", 1]]
    },
    thornfairy: {
      places: [["festhall", ["goal", "gold1", "twist"]], ["spindletower", ["goal", "play", "discard"]], ["castleyard", ["goal", "gold1", "defeat"]], ["castlegate2", ["goal", "move", "gold1"]]],
      trump: "wildvine", ward: "deepsleep",
      heroes: [["kingsson", 3], ["princess", 2], ["oldking", 2], ["cook", 1], ["twelfthfairy", 3]]
    }
  };
  const VILLAIN_IDS = Object.keys(VILLAINS);

  // Goal numbers by the number of players (2, 3, 4), tuned with
  // computer games (checked by tests/villains-core.js) so that each villain
  // wins about as often as the others: with more players there are more
  // twists and more heroes, which slows some goals more than others.
  // prm(s) gives the numbers of a game.
  const BASE = {
    witchHouse: 3, witchHouses: 3, witchOven: 3,
    wolfChalk: 4, wolfFlour: 4, wolfDoor: 4,
    rumpelSpin: 2, rumpelTarget: 12,
    stepGift: [2, 3, 4], stepMirror: 1,
    sorcBird: 4, sorcBirds: 4, sorcCheap: 0,
    thornCost: 3, thornCheap: 0,
    trumpCost: 2, wardCost: 2
  };
  const PN = {
    2: { witchHouse: 4, witchHouses: 3, witchOven: 3, wolfChalk: 4, wolfFlour: 4, wolfDoor: 5, rumpelSpin: 2, rumpelTarget: 19, stepGift: [3,  4,  5], stepMirror: 3, sorcBird: 6, sorcBirds: 4, sorcCheap: 0, thornCost: 3, thornCheap: 2, trumpCost: 2, wardCost: 2 },
    3: { witchHouse: 5, witchHouses: 3, witchOven: 3, wolfChalk: 6, wolfFlour: 6, wolfDoor: 6, rumpelSpin: 2, rumpelTarget: 17, stepGift: [4,  5,  5], stepMirror: 3, sorcBird: 7, sorcBirds: 4, sorcCheap: 3, thornCost: 3, thornCheap: 2, trumpCost: 2, wardCost: 2 },
    4: { witchHouse: 5, witchHouses: 3, witchOven: 4, wolfChalk: 6, wolfFlour: 6, wolfDoor: 7, rumpelSpin: 2, rumpelTarget: 16, stepGift: [4,  5,  6], stepMirror: 3, sorcBird: 7, sorcBirds: 4, sorcCheap: 3, thornCost: 3, thornCheap: 1, trumpCost: 2, wardCost: 2 }
  };
  let P = PN[2];
  function prm(s) { return PN[s.players.length] || PN[2]; }

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

  // Card data by id ("toad", "witch:magicdough", "witch:hansel", ...).
  const CARDS = {};
  SHARED.forEach((c) => { CARDS[c.id] = c; });
  SHARED_TWIST.forEach((c) => { CARDS[c.id] = c; });
  VILLAIN_IDS.forEach((v) => {
    const V = VILLAINS[v];
    CARDS[V.trump] = { id: V.trump, kind: "trick", cost: BASE.trumpCost, fx: "trump", count: 2, villain: v };
    CARDS[V.ward] = { id: V.ward, kind: "trick", cost: BASE.wardCost, fx: "ward", count: 2, villain: v };
    V.heroes.forEach((h) => { CARDS[h[0]] = { id: h[0], kind: "hero", str: h[1], villain: v }; });
  });
  function card(id) { return CARDS[id]; }

  function deckFor(v) {
    const V = VILLAINS[v];
    const out = [];
    SHARED.forEach((c) => { for (let i = 0; i < c.count; i++) out.push(c.id); });
    out.push(V.trump, V.trump, V.ward, V.ward);
    return out;
  }

  function twistFor(v) {
    const out = VILLAINS[v].heroes.map((h) => h[0]);
    SHARED_TWIST.forEach((c) => { for (let i = 0; i < c.count; i++) out.push(c.id); });
    return out;
  }

  function newProg(v) {
    if (v === "witch") return { houses: 0, oven: false };
    if (v === "wolf") return { chalk: false, flour: false, door: false };
    if (v === "rumpel") return {};
    if (v === "stepmother") return { gifts: 0, mirror: false };
    if (v === "sorcerer") return { birds: 0, caughtThisTurn: false };
    return { hedges: [] };
  }

  function createGame(villains, rng) {
    const rnd = rng || Math.random;
    const s = {
      players: villains.map((v, i) => ({
        villain: v, place: -1, gold: START_GOLD[i], hand: [], deck: shuffle(deckFor(v), rnd), discard: [],
        helpers: [], heroes: [], twist: shuffle(twistFor(v), rnd), twistDiscard: [], prog: newProg(v)
      })),
      current: 0, turn: 1, winner: null, log: [], phase: "move", used: [], pendingTwist: null, seed: Math.floor(rnd() * 1e9)
    };
    s.players.forEach((p) => refill(s, p, rnd));
    return s;
  }

  function log(s, e) {
    s.log.push(e);
    if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  }

  function drawCard(p, rnd) {
    if (!p.deck.length) {
      if (!p.discard.length) return null;
      p.deck = shuffle(p.discard, rnd);
      p.discard = [];
    }
    return p.deck.pop();
  }

  function refill(s, p, rnd) {
    while (p.hand.length < HAND) {
      const c = drawCard(p, rnd);
      if (c === null) break;
      p.hand.push(c);
    }
  }

  function placeActs(p, i) { return VILLAINS[p.villain].places[i][1]; }
  function heroAt(p, i) { return p.heroes.find((h) => h.place === i) || null; }
  function helperStr(p, i) { return p.helpers.filter((h) => h.place === i).reduce((a, h) => a + card(h.card).str, 0); }
  function heroPrice(p, h) { return Math.max(0, card(h.card).str - helperStr(p, h.place)); }

  // The goal action's price at place i, or null when it can't be done now.
  function goalPrice(s, p, i) {
    P = prm(s);
    const g = p.prog, v = p.villain, name = VILLAINS[v].places[i][0];
    if (v === "witch") {
      if (name === "bakery") return g.houses < P.witchHouses ? P.witchHouse : null;
      if (name === "oven") return g.houses >= P.witchHouses && !g.oven ? P.witchOven : null;
    } else if (v === "wolf") {
      if (name === "chandler") return !g.chalk ? P.wolfChalk : null;
      if (name === "mill") return !g.flour ? P.wolfFlour : null;
      if (name === "goathouse") return g.chalk && g.flour && !g.door ? P.wolfDoor : null;
    } else if (v === "rumpel") {
      return p.hand.length ? 0 : null;
    } else if (v === "stepmother") {
      if (name === "dwarfhouse") return g.gifts < 3 ? P.stepGift[g.gifts] : null;
      if (name === "mirrorhall") return g.gifts >= 3 && !g.mirror ? P.stepMirror : null;
    } else if (v === "sorcerer") {
      return g.birds < P.sorcBirds && !g.caughtThisTurn ? P.sorcBird - (g.birds < P.sorcCheap ? 1 : 0) : null;
    } else if (v === "thornfairy") {
      return g.hedges.indexOf(i) === -1 ? P.thornCost - (g.hedges.length < P.thornCheap ? 1 : 0) : null;
    }
    return null;
  }

  // The best place the trump card can do the goal action for (cheapest).
  function trumpPlace(s, p) {
    let best = -1, price = Infinity;
    for (let i = 0; i < 4; i++) {
      const g = goalAt(p, i) ? goalPrice(s, p, i) : null;
      if (g !== null && g < price) { best = i; price = g; }
    }
    return best;
  }
  function goalAt(p, i) { return placeActs(p, i).indexOf("goal") !== -1; }

  // Progress 0..1 (for the computer and the goal card).
  function progress(s, p) {
    P = prm(s);
    const g = p.prog;
    switch (p.villain) {
      case "witch": return (g.houses + (g.oven ? 1 : 0)) / 4;
      case "wolf": return ((g.chalk ? 1 : 0) + (g.flour ? 1 : 0) + (g.door ? 1 : 0) + (g.door && p.place === 0 ? 1 : 0)) / 4;
      case "rumpel": return Math.min(1, p.gold / P.rumpelTarget) * (p.heroes.some((h) => h.card === "messenger") ? 0.8 : 1);
      case "stepmother": return (g.gifts + (g.mirror ? 1 : 0)) / 4;
      case "sorcerer": return g.birds / P.sorcBirds;
      default: return g.hedges.length / 4;
    }
  }

  function hasWon(s, p, endOfTurn) {
    P = prm(s);
    const g = p.prog;
    switch (p.villain) {
      case "witch": return g.oven;
      case "wolf": return endOfTurn && g.door && p.place === 0;
      case "rumpel": return endOfTurn && p.gold >= P.rumpelTarget && !p.heroes.some((h) => h.card === "messenger");
      case "stepmother": return g.mirror;
      case "sorcerer": return g.birds >= P.sorcBirds;
      default: return g.hedges.length >= 4;
    }
  }

  function doGoal(s, p, i, cardIdx) {
    P = prm(s);
    const g = p.prog, v = p.villain, name = VILLAINS[v].places[i][0];
    const price = goalPrice(s, p, i);
    p.gold -= price;
    let step;
    if (v === "witch") { if (name === "bakery") { g.houses++; step = "house"; } else { g.oven = true; step = "oven"; } }
    else if (v === "wolf") {
      if (name === "chandler") { g.chalk = true; step = "chalk"; }
      else if (name === "mill") { g.flour = true; step = "flour"; }
      else { g.door = true; step = "door"; }
    } else if (v === "rumpel") {
      const ci = cardIdx !== undefined && cardIdx >= 0 && cardIdx < p.hand.length ? cardIdx : p.hand.length - 1;
      p.discard.push(p.hand.splice(ci, 1)[0]);
      p.gold += P.rumpelSpin;
      step = "spin";
    }
    else if (v === "stepmother") { if (name === "dwarfhouse") { g.gifts++; step = "gift" + g.gifts; } else { g.mirror = true; step = "mirror"; } }
    else if (v === "sorcerer") { g.birds++; g.caughtThisTurn = true; step = "bird"; }
    else { g.hedges.push(i); step = "hedge"; }
    log(s, { k: "goal", p: s.current, step, place: i });
  }

  // What the active player can do now: [{ type, ... }].
  //   phase "move": { type: "move", place }
  //   phase "act":  { type: "gold" | "play" | "discard" | "shift" | "defeat" | "twist" | "goal" | "end", ... }
  //   phase "twist": { type: "pick", index, place? }
  function legalActions(s) {
    if (s.winner !== null) return [];
    const me = s.current, p = s.players[me];
    const out = [];
    if (s.phase === "move") {
      for (let i = 0; i < 4; i++) if (i !== p.place) out.push({ type: "move", place: i });
      return out;
    }
    if (s.phase === "twist") {
      const t = s.pendingTwist, target = s.players[t.target];
      t.cards.forEach((c, idx) => {
        if (card(c).kind === "hero") {
          const free = [0, 1, 2, 3].filter((i) => !heroAt(target, i));
          if (free.length) free.forEach((pl) => out.push({ type: "pick", index: idx, place: pl }));
          else out.push({ type: "pick", index: idx });
        } else out.push({ type: "pick", index: idx });
      });
      return out;
    }
    const here = p.place;
    const blocker = heroAt(p, here);
    if (blocker) {
      if (s.used.indexOf("defeat-here") === -1 && heroPrice(p, blocker) <= p.gold) out.push({ type: "defeat", hero: p.heroes.indexOf(blocker) });
      // The thorn hedge grows even where a hero stands.
      if (p.villain === "thornfairy" && s.used.indexOf("goal") === -1) { const g = goalPrice(s, p, here); if (g !== null && g <= p.gold) out.push({ type: "goal" }); }
      out.push({ type: "end" });
      return out;
    }
    placeActs(p, here).forEach((a) => {
      if (s.used.indexOf(a) !== -1) return;
      if (a === "gold1" || a === "gold2" || a === "gold3") out.push({ type: "gold", act: a });
      else if (a === "play") p.hand.forEach((c, i) => { if (canPlay(s, p, c)) out.push({ type: "play", card: i }); });
      else if (a === "discard") { if (p.hand.length) out.push({ type: "discard", cards: p.hand.map((c, i) => i) }); }
      else if (a === "move") {
        p.helpers.forEach((h, hi) => { for (let t = 0; t < 4; t++) if (t !== h.place) out.push({ type: "shift", what: "helper", index: hi, to: t }); });
        p.heroes.forEach((h, hi) => { for (let t = 0; t < 4; t++) if (t !== h.place && !heroAt(p, t)) out.push({ type: "shift", what: "hero", index: hi, to: t }); });
      } else if (a === "defeat") p.heroes.forEach((h, hi) => { if (heroPrice(p, h) <= p.gold) out.push({ type: "defeat", hero: hi }); });
      else if (a === "twist") s.players.forEach((q, qi) => { if (qi !== me) out.push({ type: "twist", target: qi }); });
      else if (a === "goal") { const g = goalPrice(s, p, here); if (g !== null && g <= p.gold) out.push({ type: "goal" }); }
    });
    out.push({ type: "end" });
    return out;
  }

  function canPlay(s, p, id) {
    P = prm(s);
    const c = card(id);
    if (c.cost > p.gold) return false;
    if (c.fx === "shove") return p.heroes.length > 0 && p.heroes.some((h) => [0, 1, 2, 3].some((t) => t !== h.place && !heroAt(p, t)));
    if (c.fx === "ward") return p.heroes.length > 0;
    if (c.fx === "trump") { const tp = trumpPlace(s, p); return tp !== -1 && goalPrice(s, p, tp) + c.cost <= p.gold; }
    return true;
  }

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function isLegal(s, act) {
    if (!act) return false;
    if (act.type === "discard") {
      const ok = legalActions(s).some((a) => a.type === "discard");
      const p = s.players[s.current];
      return ok && Array.isArray(act.cards) && act.cards.length > 0 && act.cards.every((i) => i >= 0 && i < p.hand.length) && new Set(act.cards).size === act.cards.length;
    }
    if (act.type === "goal" && act.card !== undefined) {
      return legalActions(s).some((a) => a.type === "goal") && act.card >= 0 && act.card < s.players[s.current].hand.length;
    }
    if (act.type === "play" && act.hero !== undefined) {
      return legalActions(s).some((a) => a.type === "play" && a.card === act.card);
    }
    return legalActions(s).some((a) => same(a, act));
  }

  // Carries out a legal action; false (nothing changed) for an illegal one.
  // rng is used for shuffling decks and piles.
  function apply(s, act, rng) {
    if (!isLegal(s, act)) return false;
    const rnd = rng || Math.random;
    const me = s.current, p = s.players[me];
    switch (act.type) {
      case "move":
        p.place = act.place;
        s.phase = "act";
        log(s, { k: "move", p: me, place: act.place });
        break;
      case "gold": {
        const n = parseInt(act.act.slice(4), 10);
        p.gold += n;
        s.used.push(act.act);
        log(s, { k: "gold", p: me, n });
        break;
      }
      case "play": {
        const id = p.hand[act.card];
        const c = card(id);
        p.hand.splice(act.card, 1);
        p.gold -= c.cost;
        s.used.push("play");
        log(s, { k: "play", p: me, c: id });
        if (c.kind === "helper") { p.helpers.push({ card: id, place: p.place }); break; }
        p.discard.push(id);
        if (c.fx === "gold") p.gold += c.n;
        else if (c.fx === "draw") { for (let i = 0; i < c.n; i++) { const d = drawCard(p, rnd); if (d !== null) p.hand.push(d); } }
        else if (c.fx === "shove") {
          // The hero standing on the most useful place goes to the least
          // useful free one (the player picks with act.hero / act.to).
          const hi = act.hero !== undefined ? act.hero : bestShove(s, p).hero;
          const to = act.to !== undefined ? act.to : bestShove(s, p).to;
          if (p.heroes[hi] && to !== undefined && !heroAt(p, to)) { p.heroes[hi].place = to; log(s, { k: "shift", p: me, c: p.heroes[hi].card, to }); }
        } else if (c.fx === "ward") {
          const hi = act.hero !== undefined ? act.hero : strongestHero(p);
          const h = p.heroes.splice(hi, 1)[0];
          if (h) { p.twistDiscard.push(h.card); log(s, { k: "defeat", p: me, c: h.card, n: 0 }); }
        } else if (c.fx === "trump") {
          const tp = trumpPlace(s, p);
          doGoal(s, p, tp);
        }
        break;
      }
      case "discard": {
        const set = act.cards.slice().sort((a, b) => b - a);
        set.forEach((i) => p.discard.push(p.hand.splice(i, 1)[0]));
        s.used.push("discard");
        log(s, { k: "discard", p: me, n: set.length });
        break;
      }
      case "shift": {
        const list = act.what === "helper" ? p.helpers : p.heroes;
        list[act.index].place = act.to;
        s.used.push("move");
        log(s, { k: "shift", p: me, c: list[act.index].card, to: act.to });
        break;
      }
      case "defeat": {
        const h = p.heroes[act.hero];
        const price = heroPrice(p, h);
        const blocked = heroAt(p, p.place) === h;
        p.gold -= price;
        p.heroes.splice(act.hero, 1);
        p.twistDiscard.push(h.card);
        s.used.push(blocked ? "defeat-here" : "defeat");
        log(s, { k: "defeat", p: me, c: h.card, n: price });
        break;
      }
      case "twist": {
        const target = s.players[act.target];
        const cards = [];
        for (let i = 0; i < 2; i++) {
          if (!target.twist.length) { target.twist = shuffle(target.twistDiscard, rnd); target.twistDiscard = []; }
          if (target.twist.length) cards.push(target.twist.pop());
        }
        s.used.push("twist");
        if (!cards.length) break;
        s.pendingTwist = { target: act.target, cards };
        s.phase = "twist";
        break;
      }
      case "pick": {
        const t = s.pendingTwist, target = s.players[t.target];
        const id = t.cards[act.index];
        t.cards.forEach((c, i) => { if (i !== act.index) target.twistDiscard.push(c); });
        const c = card(id);
        if (c.kind === "hero") {
          if (act.place !== undefined) {
            target.heroes.push({ card: id, place: act.place });
            log(s, { k: "hero", p: me, t: t.target, c: id, place: act.place });
            if (id === "kingsson" && target.prog.hedges && target.prog.hedges.length) {
              target.prog.hedges.pop();
              log(s, { k: "cuthedge", t: t.target });
            }
          } else target.twistDiscard.push(id);
        } else {
          target.twistDiscard.push(id);
          if (c.fx === "losegold") { const n = Math.min(target.gold, c.n); target.gold -= n; log(s, { k: "event", p: me, t: t.target, c: id, n }); }
          else if (c.fx === "losehelper") {
            let best = -1;
            target.helpers.forEach((h, i) => { if (best < 0 || card(h.card).str > card(target.helpers[best].card).str) best = i; });
            if (best >= 0) { const h = target.helpers.splice(best, 1)[0]; target.discard.push(h.card); log(s, { k: "event", p: me, t: t.target, c: id, n: 1, lost: h.card }); }
            else log(s, { k: "event", p: me, t: t.target, c: id, n: 0 });
          }
        }
        s.pendingTwist = null;
        s.phase = "act";
        break;
      }
      case "goal":
        s.used.push("goal");
        doGoal(s, p, p.place, act.card);
        break;
      case "end":
        log(s, { k: "end", p: me });
        if (hasWon(s, p, true)) { s.winner = me; log(s, { k: "win", p: me }); return true; }
        refill(s, p, rnd);
        if (p.prog.caughtThisTurn !== undefined) p.prog.caughtThisTurn = false;
        s.current = (me + 1) % s.players.length;
        if (s.current === 0) s.turn++;
        s.phase = "move";
        s.used = [];
        return true;
    }
    if (hasWon(s, p, false)) { s.winner = me; log(s, { k: "win", p: me }); }
    return true;
  }

  function strongestHero(p) {
    let best = 0;
    p.heroes.forEach((h, i) => { if (card(h.card).str > card(p.heroes[best].card).str) best = i; });
    return best;
  }

  // For "evil eye": move the hero on the most useful place (goal places
  // first) to a free place that has no goal action.
  function bestShove(s, p) {
    let best = null;
    p.heroes.forEach((h, hi) => {
      const val = (goalAt(p, h.place) ? 2 : 0) + 1;
      for (let t = 0; t < 4; t++) {
        if (t === h.place || heroAt(p, t)) continue;
        const v = val - (goalAt(p, t) ? 2 : 0);
        if (!best || v > best.v) best = { hero: hi, to: t, v };
      }
    });
    return best || { hero: 0, to: undefined };
  }

  // --- the computer -----------------------------------------------------

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  // How good the position is for player i: own progress counts most,
  // gold and helpers a little, heroes in the own domain cost.
  function evaluate(s, i) {
    const p = s.players[i];
    if (s.winner === i) return 1e6;
    if (s.winner !== null) return -1e6;
    let v = progress(s, p) * 100 + Math.min(p.gold, 12) * 2 + p.helpers.reduce((a, h) => a + card(h.card).str, 0) * 1.5;
    v -= p.heroes.reduce((a, h) => a + card(h.card).str * (goalAt(p, h.place) ? 4 : 2.5), 0);
    // The others' progress counts against.
    let lead = 0;
    s.players.forEach((q, qi) => { if (qi !== i) lead = Math.max(lead, progress(s, q)); });
    return v - lead * 40;
  }

  // The leader among the other players (for twists).
  function leaderOf(s, me) {
    let best = -1, bv = -1;
    s.players.forEach((q, qi) => {
      if (qi === me) return;
      const v = progress(s, q);
      if (v > bv) { bv = v; best = qi; }
    });
    return best;
  }

  // Plays the rest of the turn greedily from state t (phase "act"); returns
  // the actions taken.
  function greedyRest(t, rnd) {
    const me = t.current;
    const taken = [];
    for (let k = 0; k < 20 && t.winner === null && t.current === me; k++) {
      const acts = legalActions(t);
      let best = null, bv = -Infinity;
      acts.forEach((a) => {
        let v;
        if (a.type === "end") v = evaluate(t, me) + 0.5;
        else if (a.type === "twist") { v = a.target === leaderOf(t, me) ? evaluate(t, me) + 6 : -Infinity; }
        else if (a.type === "pick") {
          const u = clone(t); apply(u, a, rnd);
          v = -evaluate(u, t.pendingTwist.target) * 0.5 + evaluate(u, me) * 0.5;
        } else if (a.type === "discard") {
          // Throw away the cards that can't be used soon.
          const p = t.players[me];
          const bad = p.hand.map((c, i) => i).filter((i) => { const c = card(p.hand[i]); return c.fx === "ward" ? !p.heroes.length : (c.fx === "shove" ? !p.heroes.length : false); });
          if (!bad.length) v = -Infinity;
          else { a = { type: "discard", cards: bad }; const u = clone(t); apply(u, a, rnd); v = evaluate(u, me) + 1; }
        } else {
          const u = clone(t); apply(u, a, rnd);
          v = evaluate(u, me);
        }
        if (v > bv) { bv = v; best = a; }
      });
      if (!best) best = { type: "end" };
      taken.push(best);
      apply(t, best, rnd);
      if (best.type === "end") break;
    }
    return taken;
  }

  // The computer's next action.
  function chooseAction(s, rng) {
    const rnd = rng || Math.random;
    const me = s.current;
    if (s.phase === "move") {
      let best = null, bv = -Infinity;
      legalActions(s).forEach((a) => {
        const t = clone(s);
        apply(t, a, rnd);
        greedyRest(t, makeRng(1));
        const v = (t.winner === me ? 1e6 : evaluate(t, me)) + rnd() * 0.5;
        if (v > bv) { bv = v; best = a; }
      });
      return best;
    }
    const t = clone(s);
    const plan = greedyRest(t, makeRng(2));
    return plan[0] || { type: "end" };
  }

  return { HAND, VILLAINS, VILLAIN_IDS, SHARED, SHARED_TWIST, PN, prm, card, deckFor, twistFor, makeRng, createGame, legalActions, isLegal, apply,
    goalPrice, heroAt, heroPrice, helperStr, progress, hasWon, chooseAction, evaluate, clone, placeActs, canPlay, trumpPlace };
})();

if (typeof module !== "undefined" && module.exports) module.exports = VillainsCore;
if (typeof window !== "undefined") window.VillainsCore = VillainsCore;
