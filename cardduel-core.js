// cardduel-core.js
// "Card Duel" (Kartenduell) - a fantasy card game for two: two mages, 20
// life each, with ready-made decks of 20 cards, one per element (forest,
// fire, water, stone). Dependency-free, no DOM.
//
// Rules (state.rules === 2, since task 149; older saves are not loaded):
// - Power is a store: each turn 3 power is added (the starter gets only 2
//   in the very first turn); power that is not used stays, up to 9.
// - A turn: draw a card, play cards, attack with creatures, end. Cards in
//   hand: at most 7 - with a full hand no card is drawn (it stays on the
//   deck). An empty deck: the own discard pile (spells played, own
//   creatures defeated) is shuffled and becomes the new deck.
// - Every creature attacks once per turn, also in the turn it is played.
//   The attacker picks the target - the other mage or one of their
//   creatures; two creatures hit each other at the same time. Damage on a
//   creature stays. At most 6 creatures a side.
// - Evening out the start: both start with 4 cards; the starter's first
//   turn brings 2 power instead of 3 (see START_GAIN, tests/cardduel-core.js).
//
// The six abilities (ABILITIES):
//   ward   - when a creature attacks its owner's mage, the ward with the
//            highest attack strikes the attacker first (its attack as
//            damage); an attacker that does not survive this misses
//   ranged - when it attacks a creature, that creature does not hit back
//   armor  - takes 1 damage less from every hit
//   regrow - gets 2 life back (up to its full life) at the end of its
//            owner's turn
//   insight - when played, its owner draws a card
//   ember  - when played, 2 damage to the other mage
// Cards: { id, el, kind: "creature" | "spell", cost, atk, hp, abil, fx }.
// fx is the effect of a spell (or a creature on play):
//   { type: "dmg", n }      n damage to a chosen creature or mage
//   { type: "aoe", n }      n damage to every creature of the other side
//   { type: "quake", n }    n damage to every creature
//   { type: "heal", n }     own mage gets n life back (at most 20)
//   { type: "draw", n }     draw n cards
//   { type: "bounce", max } a chosen creature costing at most `max` goes back
//                           to its owner's hand
//   { type: "buff", n, m }  a chosen own creature gets +n attack, +m life
//   { type: "buffall", n, m } every own creature gets +n/+m
//   { type: "summon", n, token } n creatures `token`
// Actions: { type: "play", card: hand index, target? }, { type: "attack",
// attacker: board index, target: "mage" | board index }, { type: "end" }.
// A target: { side: 0 | 1, index: board index | "mage" }.

const CardDuelCore = (function () {
  const RULES = 2;
  const START_LIFE = 20;
  const POWER_GAIN = 3;
  const START_GAIN = 2;
  const STARTER_LIFE = 17;
  const MAX_STORE = 9;
  const MAX_BOARD = 6;
  const MAX_HAND = 7;
  const START_HAND = 4;
  const COPIES = 2;
  const DECK_SIZE = 20;
  const REGROW = 2;
  const EMBER = 2;
  const ELEMENTS = ["forest", "fire", "water", "stone"];
  const ABILITIES = ["ward", "ranged", "armor", "regrow", "insight", "ember"];

  const C = (id, el, cost, atk, hp, abil, fx, count) => ({ id, el, kind: "creature", cost, atk, hp, abil: abil || [], fx: fx || null, count: count === undefined ? COPIES : count });
  const S = (id, el, cost, fx, count) => ({ id, el, kind: "spell", cost, atk: 0, hp: 0, abil: [], fx, count: count === undefined ? COPIES : count });

  const CARDS = [
    // Forest: many small creatures that grow back.
    C("forest_mosskin", "forest", 1, 1, 2),
    C("forest_shroomrunner", "forest", 1, 1, 1, ["ranged"]),
    C("forest_barkbeetle", "forest", 2, 2, 4, ["regrow"]),
    C("forest_foxspirit", "forest", 2, 2, 2),
    S("forest_seedcall", "forest", 2, { type: "summon", n: 2, token: "forest_sapling" }),
    S("forest_growth", "forest", 1, { type: "buff", n: 2, m: 2 }),
    C("forest_mossbear", "forest", 4, 3, 5, ["regrow"]),
    S("forest_choir", "forest", 4, { type: "buffall", n: 1, m: 1 }),
    C("forest_stardeer", "forest", 5, 3, 4, [], { type: "buffall", n: 1, m: 1 }),
    C("forest_oldlinden", "forest", 7, 5, 7, ["ward", "regrow"]),
    // Fire: direct damage.
    C("fire_sparkimp", "fire", 1, 2, 2),
    C("fire_embersalamander", "fire", 2, 2, 2, ["ember"]),
    S("fire_sparkflight", "fire", 1, { type: "dmg", n: 2 }),
    C("fire_ashwolf", "fire", 3, 3, 3, ["ranged"]),
    S("fire_emberwave", "fire", 3, { type: "aoe", n: 1 }),
    S("fire_lavaspear", "fire", 3, { type: "dmg", n: 4 }),
    C("fire_flamedancer", "fire", 3, 3, 3, ["ember"]),
    C("fire_flamesteed", "fire", 4, 3, 3, ["ranged"]),
    S("fire_starblaze", "fire", 4, { type: "dmg", n: 5 }),
    C("fire_magmadrake", "fire", 6, 6, 6, ["ember"]),
    // Water: drawing cards and sending creatures back.
    C("water_dropsprite", "water", 2, 2, 3, ["insight"]),
    S("water_whirlpool", "water", 2, { type: "bounce", max: 4 }),
    C("water_mistotter", "water", 2, 2, 5, ["ward"]),
    S("water_tidesight", "water", 3, { type: "draw", n: 2 }),
    C("water_shellsentry", "water", 3, 2, 5, ["ward"]),
    C("water_waverider", "water", 4, 4, 4, ["insight"]),
    S("water_springwater", "water", 2, { type: "heal", n: 7 }),
    C("water_frostnixie", "water", 4, 4, 5),
    S("water_floodsurge", "water", 3, { type: "aoe", n: 2 }),
    C("water_tidesquid", "water", 6, 6, 7, ["insight"]),
    // Stone: few strong defenders.
    C("stone_pebblewight", "stone", 1, 1, 2, ["ward"]),
    C("stone_granitekeeper", "stone", 3, 3, 5, ["ward"]),
    C("stone_rockram", "stone", 3, 3, 4),
    S("stone_rockhide", "stone", 2, { type: "buffall", n: 0, m: 2 }),
    C("stone_quartzknight", "stone", 2, 2, 3, ["armor"]),
    S("stone_boulder", "stone", 3, { type: "dmg", n: 3 }),
    C("stone_basalttortoise", "stone", 5, 3, 8, ["ward"]),
    S("stone_rumble", "stone", 3, { type: "quake", n: 2 }),
    C("stone_oregolem", "stone", 5, 4, 6, ["armor"]),
    C("stone_peakcolossus", "stone", 7, 6, 7, ["ward", "armor"])
  ];
  // Creatures only ever summoned by a card, never in a deck.
  const TOKENS = [
    C("forest_sapling", "forest", 0, 1, 1, [], null, 0)
  ];
  const BY_ID = {};
  CARDS.concat(TOKENS).forEach((c) => { BY_ID[c.id] = c; });

  function card(id) { return BY_ID[id]; }
  function isToken(id) { return TOKENS.some((t) => t.id === id); }

  function deckList(el) {
    const out = [];
    CARDS.filter((c) => c.el === el).forEach((c) => { for (let i = 0; i < c.count; i++) out.push(c.id); });
    return out;
  }

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
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

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  // Whether a saved state follows the current rules (older saves are
  // dropped by the app).
  function isCurrentState(s) {
    return !!s && s.rules === RULES && Array.isArray(s.players) && s.players.length === 2 &&
      s.players.every((p) => p && Array.isArray(p.deck) && Array.isArray(p.hand) && Array.isArray(p.board) && Array.isArray(p.grave));
  }

  // A new game. decks: [element of player 0, element of player 1];
  // starter: the player who takes the first turn.
  function createGame(decks, starter, rng) {
    const rnd = rng || Math.random;
    const s = {
      rules: RULES,
      decks: decks.slice(),
      starter,
      current: starter,
      turn: 0,
      winner: null,
      uid: 1,
      seed: 0,
      log: [],
      players: [0, 1].map((p) => ({ deck: shuffle(deckList(decks[p]), rnd), hand: [], board: [], grave: [], life: START_LIFE, power: 0 }))
    };
    s.seed = Math.floor(rnd() * 4294967296) >>> 0;
    s.players[starter].life = STARTER_LIFE;
    [0, 1].forEach((p) => {
      for (let i = 0; i < START_HAND; i++) s.players[p].hand.push(s.players[p].deck.pop());
    });
    startTurn(s);
    return s;
  }

  function log(s, entry) {
    s.log.push(entry);
    if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  }

  function checkWinner(s) {
    if (s.winner !== null) return;
    const dead = [0, 1].filter((p) => s.players[p].life <= 0);
    if (dead.length === 2) s.winner = 1 - s.current; // the active player's own doing: the other one wins
    else if (dead.length === 1) s.winner = 1 - dead[0];
    if (s.winner !== null) log(s, { k: "win", p: s.winner });
  }

  function draw(s, p) {
    const pl = s.players[p];
    if (pl.hand.length >= MAX_HAND) {
      log(s, { k: "full", p });
      return;
    }
    if (!pl.deck.length) {
      if (!pl.grave.length) return;
      const rnd = makeRng(s.seed);
      pl.deck = shuffle(pl.grave, rnd);
      pl.grave = [];
      s.seed = Math.floor(rnd() * 4294967296) >>> 0;
      log(s, { k: "reshuffle", p, n: pl.deck.length });
    }
    pl.hand.push(pl.deck.pop());
  }

  function startTurn(s) {
    const pl = s.players[s.current];
    s.turn++;
    pl.power = Math.min(MAX_STORE, pl.power + (s.turn === 1 ? START_GAIN : POWER_GAIN));
    pl.board.forEach((m) => { m.ready = true; });
    log(s, { k: "turn", p: s.current, n: pl.power });
    draw(s, s.current);
  }

  function has(m, a) { return m.abil.indexOf(a) !== -1; }

  function makeCreature(s, id) {
    const c = card(id);
    return { id, uid: s.uid++, atk: c.atk, hp: c.hp, max: c.hp, abil: c.abil.slice(), ready: true };
  }

  // Damage to a creature (armor counts).
  function hurt(s, side, m, n) {
    const d = Math.max(0, n - (has(m, "armor") ? 1 : 0));
    m.hp -= d;
    return d;
  }

  function sweepDead(s) {
    [0, 1].forEach((p) => {
      const pl = s.players[p];
      const dead = pl.board.filter((m) => m.hp <= 0);
      dead.forEach((m) => {
        log(s, { k: "dies", p, c: m.id });
        if (!isToken(m.id)) pl.grave.push(m.id);
      });
      pl.board = pl.board.filter((m) => m.hp > 0);
    });
  }

  // The ward of `side` that strikes an attacker of its mage: the one with
  // the highest attack (the first of them in the row), or -1.
  function wardOf(s, side) {
    let best = -1;
    s.players[side].board.forEach((m, i) => {
      if (has(m, "ward") && m.hp > 0 && m.atk > 0 && (best === -1 || m.atk > s.players[side].board[best].atk)) best = i;
    });
    return best;
  }

  // What kind of target a card needs: null, "any" (creature or mage),
  // "creature" (either side) or "own" (own creature).
  function targetKind(id) {
    const fx = card(id).fx;
    if (!fx) return null;
    if (fx.type === "dmg") return "any";
    if (fx.type === "bounce") return "creature";
    if (fx.type === "buff") return "own";
    return null;
  }

  function validTargets(s, id) {
    const kind = targetKind(id);
    const me = s.current, op = 1 - me;
    const out = [];
    if (!kind) return out;
    if (kind === "any") { out.push({ side: op, index: "mage" }); out.push({ side: me, index: "mage" }); }
    const sides = kind === "own" ? [me] : [op, me];
    const fx = card(id).fx;
    sides.forEach((side) => s.players[side].board.forEach((m, i) => {
      if (fx.max === undefined || card(m.id).cost <= fx.max) out.push({ side, index: i });
    }));
    return out;
  }

  function canPlay(s, i) {
    const pl = s.players[s.current];
    const id = pl.hand[i];
    if (id === undefined) return false;
    const c = card(id);
    if (c.cost > pl.power) return false;
    if (c.kind === "creature" && pl.board.length >= MAX_BOARD) return false;
    if (targetKind(id) && !validTargets(s, id).length) return false;
    return true;
  }

  // Legal targets of an attack by creature `a` of the active player.
  function attackTargets(s, a) {
    const me = s.current, op = 1 - me;
    const m = s.players[me].board[a];
    if (!m || !m.ready || m.atk <= 0) return [];
    const out = ["mage"];
    s.players[op].board.forEach((x, i) => out.push(i));
    return out;
  }

  function legalActions(s) {
    if (s.winner !== null) return [];
    const out = [];
    const pl = s.players[s.current];
    pl.hand.forEach((id, i) => {
      if (!canPlay(s, i)) return;
      if (targetKind(id)) validTargets(s, id).forEach((t) => out.push({ type: "play", card: i, target: t }));
      else out.push({ type: "play", card: i });
    });
    pl.board.forEach((m, a) => attackTargets(s, a).forEach((t) => out.push({ type: "attack", attacker: a, target: t })));
    out.push({ type: "end" });
    return out;
  }

  function sameTarget(a, b) {
    return !!a && !!b && a.side === b.side && a.index === b.index;
  }

  function isLegal(s, act) {
    if (!act || s.winner !== null) return false;
    if (act.type === "end") return true;
    if (act.type === "play") {
      if (!canPlay(s, act.card)) return false;
      const id = s.players[s.current].hand[act.card];
      if (!targetKind(id)) return !act.target;
      return validTargets(s, id).some((t) => sameTarget(t, act.target));
    }
    if (act.type === "attack") return attackTargets(s, act.attacker).indexOf(act.target) !== -1;
    return false;
  }

  function damageTarget(s, t, n, src) {
    if (t.index === "mage") {
      s.players[t.side].life -= n;
      log(s, { k: "hitmage", p: s.current, c: src, side: t.side, n });
    } else {
      const m = s.players[t.side].board[t.index];
      const d = hurt(s, t.side, m, n);
      log(s, { k: "hit", p: s.current, c: src, side: t.side, t: m.id, n: d });
    }
  }

  function runEffect(s, id, fx, target) {
    const me = s.current, op = 1 - me;
    const pl = s.players[me];
    switch (fx.type) {
      case "dmg":
        damageTarget(s, target, fx.n, id);
        break;
      case "aoe":
        s.players[op].board.forEach((m) => hurt(s, op, m, fx.n));
        log(s, { k: "aoe", p: me, c: id, n: fx.n });
        break;
      case "quake":
        [op, me].forEach((side) => s.players[side].board.forEach((m) => hurt(s, side, m, fx.n)));
        log(s, { k: "quake", p: me, c: id, n: fx.n });
        break;
      case "heal": {
        const before = pl.life;
        pl.life = Math.min(START_LIFE, pl.life + fx.n);
        log(s, { k: "heal", p: me, c: id, n: pl.life - before });
        break;
      }
      case "draw":
        for (let i = 0; i < fx.n; i++) draw(s, me);
        log(s, { k: "draw", p: me, c: id, n: fx.n });
        break;
      case "bounce": {
        const owner = s.players[target.side];
        const m = owner.board[target.index];
        owner.board.splice(target.index, 1);
        log(s, { k: "bounce", p: me, c: id, side: target.side, t: m.id });
        if (!isToken(m.id)) {
          if (owner.hand.length < MAX_HAND) owner.hand.push(m.id);
          else owner.grave.push(m.id);
        }
        break;
      }
      case "buff": {
        const m = pl.board[target.index];
        m.atk += fx.n; m.hp += fx.m; m.max += fx.m;
        log(s, { k: "buff", p: me, c: id, t: m.id, n: fx.n, m: fx.m });
        break;
      }
      case "buffall":
        pl.board.forEach((m) => { m.atk += fx.n; m.hp += fx.m; m.max += fx.m; });
        log(s, { k: "buffall", p: me, c: id, n: fx.n, m: fx.m });
        break;
      case "summon":
        for (let i = 0; i < fx.n && pl.board.length < MAX_BOARD; i++) pl.board.push(makeCreature(s, fx.token));
        log(s, { k: "summon", p: me, c: id, t: fx.token, n: fx.n });
        break;
    }
  }

  // Carries out a legal action; returns false (and changes nothing) for
  // an illegal one.
  function apply(s, act) {
    if (!isLegal(s, act)) return false;
    const me = s.current, op = 1 - me;
    const pl = s.players[me];
    if (act.type === "play") {
      const id = pl.hand[act.card];
      const c = card(id);
      pl.hand.splice(act.card, 1);
      pl.power -= c.cost;
      log(s, { k: "play", p: me, c: id });
      if (c.kind === "creature") {
        const m = makeCreature(s, id);
        pl.board.push(m);
        if (c.fx) runEffect(s, id, c.fx, act.target);
        if (has(m, "insight")) { draw(s, me); log(s, { k: "insight", p: me, c: id }); }
        if (has(m, "ember")) { s.players[op].life -= EMBER; log(s, { k: "hitmage", p: me, c: id, side: op, n: EMBER }); }
      } else {
        runEffect(s, id, c.fx, act.target);
        pl.grave.push(id);
      }
      sweepDead(s);
      checkWinner(s);
    } else if (act.type === "attack") {
      const m = pl.board[act.attacker];
      m.ready = false;
      if (act.target === "mage") {
        const w = wardOf(s, op);
        if (w !== -1) {
          const ward = s.players[op].board[w];
          const d = hurt(s, me, m, ward.atk);
          log(s, { k: "ward", p: op, c: ward.id, t: m.id, n: d });
        }
        if (m.hp > 0) {
          s.players[op].life -= m.atk;
          log(s, { k: "attackmage", p: me, c: m.id, n: m.atk });
        }
      } else {
        const t = s.players[op].board[act.target];
        const d1 = hurt(s, op, t, m.atk);
        const d2 = has(m, "ranged") ? 0 : hurt(s, me, m, t.atk);
        log(s, { k: "attack", p: me, c: m.id, t: t.id, n: d1, m: d2 });
      }
      sweepDead(s);
      checkWinner(s);
    } else {
      pl.board.forEach((m) => { if (has(m, "regrow")) m.hp = Math.min(m.max, m.hp + REGROW); });
      log(s, { k: "end", p: me });
      s.current = op;
      startTurn(s);
    }
    return true;
  }

  // --- the computer -------------------------------------------------------

  function creatureValue(m) {
    let v = m.atk * 1.0 + m.hp * 0.8;
    if (has(m, "ward")) v += 1 + m.atk * 0.5;
    if (has(m, "ranged")) v += 1;
    if (has(m, "armor")) v += 1.5;
    if (has(m, "regrow")) v += 1 + (m.max - m.hp) * 0.3;
    return v + 1;
  }

  // How good the position is for player p.
  function evaluate(s, p) {
    if (s.winner === p) return 1e6;
    if (s.winner === 1 - p) return -1e6;
    const me = s.players[p], op = s.players[1 - p];
    const lifeVal = (l) => (l <= 0 ? -100 : Math.sqrt(l) * 6);
    let v = lifeVal(me.life) - lifeVal(op.life);
    me.board.forEach((m) => { v += creatureValue(m); });
    op.board.forEach((m) => { v -= creatureValue(m); });
    v += (Math.min(me.hand.length, 6) - Math.min(op.hand.length, 6)) * 1.2;
    // Stored power is worth a little (it stays for the next turn).
    v += (me.power - op.power) * 0.15;
    // Damage the other side can do next turn against my life.
    const threat = op.board.reduce((a, m) => a + m.atk, 0);
    if (threat >= me.life) v -= 30;
    return v;
  }

  // Easy: half the time a random legal move (ending the turn now and
  // then), otherwise the medium choice.
  function easyAction(s, rnd) {
    if (rnd() < 0.5) return mediumAction(s, rnd);
    const acts = legalActions(s).filter((a) => a.type !== "end");
    if (!acts.length || rnd() < 0.25) return { type: "end" };
    return acts[Math.floor(rnd() * acts.length)];
  }

  // Medium: the action that leaves the best position right after it
  // (one step, see evaluate), ending the turn when nothing improves it.
  function mediumAction(s, rnd) {
    const me = s.current;
    const acts = legalActions(s);
    let best = { type: "end" }, bestV = evaluate(s, me) + 0.01;
    acts.forEach((a) => {
      if (a.type === "end") return;
      const t = clone(s);
      apply(t, a);
      const v = evaluate(t, me) + (rnd ? rnd() * 0.5 : 0);
      if (v > bestV) { bestV = v; best = a; }
    });
    return best;
  }

  // Plays the active player's turn to its end with the medium rule (no
  // randomness); returns false when the game ended on the way.
  function finishTurn(t) {
    const p = t.current;
    for (let k = 0; k < 40 && t.winner === null && t.current === p; k++) apply(t, mediumAction(t, null));
    return t.winner === null;
  }

  // Hard: tries every action, plays the rest of its own turn and the
  // other side's whole answer with the medium rule, and takes the action
  // whose position after that answer is best.
  function hardAction(s, rnd) {
    const me = s.current;
    const look = (t) => {
      if (t.current === me && t.winner === null) finishTurn(t);
      if (t.winner === null) finishTurn(t);
      return evaluate(t, me);
    };
    let best = { type: "end" }, bestV = -Infinity;
    legalActions(s).forEach((a) => {
      const t = clone(s);
      apply(t, a);
      const v = look(t) + rnd() * 0.1;
      if (v > bestV) { bestV = v; best = a; }
    });
    return best;
  }

  function chooseAction(s, level, rng) {
    const rnd = rng || Math.random;
    if (level === "easy") return easyAction(s, rnd);
    if (level === "hard") return hardAction(s, rnd);
    return mediumAction(s, rnd);
  }

  return {
    RULES, START_LIFE, POWER_GAIN, START_GAIN, MAX_STORE, MAX_BOARD, MAX_HAND, START_HAND, DECK_SIZE, ELEMENTS, ABILITIES, CARDS, TOKENS,
    card, deckList, makeRng, createGame, isCurrentState, legalActions, isLegal, apply, canPlay, targetKind, validTargets, attackTargets,
    wardOf, evaluate, chooseAction, clone
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CardDuelCore;
}
if (typeof window !== "undefined") {
  window.CardDuelCore = CardDuelCore;
}
