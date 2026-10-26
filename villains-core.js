// villains-core.js
// "Fairy-Tale Villains" (Märchen-Schurken) - every player is a villain from
// the Grimms' fairy tales with an own plan, 2 to 4 players. Dependency-free,
// no DOM. Rules version 2 (state.rules === 2); states of the older rules
// are not valid any more (isCurrentState).
//
// Each villain has a domain of 3 places; every place has a sign (moon, star
// or herb). The plan is a list of steps, each at one place with a price; the
// steps can be done in any order, a final step (if there is one) last.
//
// Cards: one shared deck of 36 spell cards (a sign and a value 1 to 3, and
// "fairy dust" that counts as any sign with value 2). Three cards lie open
// in the market. Everyone starts with 3 cards; at most 6 at the end of an
// action (more: drop cards).
//
// A turn has 2 actions, in any order, the same one twice allowed:
//   collect  take 2 cards, each one from the market or the top of the deck
//   step     do one step of the plan: pay cards with a total of at least
//            the price; a card of the place's sign (and fairy dust) counts
//            its value, any other card 1. The game picks the cards (least
//            value spent).
// Besides, once per turn and without using an action:
//   scheme   give up your lowest card and put one of the 2 open heroes on a
//            free place of another villain. A hero raises the price of the
//            steps at his place by his strength; when that villain does a
//            step there, the hero is outwitted and leaves.
// The King's Son, sent to the Thorn Fairy, cuts down the hedge at his place.
// Whoever finishes the plan ends his turn; the round is played to its end
// (everyone has the same number of turns). Of those who finished, the one
// with the most value left in the hand wins (then the most cards); a full
// tie is a shared win.
//
// State: { rules: 2, players: [{ villain, hand, done: [bool per step],
// heroes: [{ card, place }] }], deck, discard, market, heroPile, heroRow,
// heroDiscard, current, turn, actionsLeft, phase ("act" | "collect" |
// "trim"), collectLeft, schemed, finished, winner (first winner), winners,
// log, seed }.

const VillainsCore = (function () {
  const RULES = 2;
  const HAND_MAX = 6;
  const START_HAND = 3;
  const ACTIONS = 2;
  const MARKET = 3;
  const HERO_ROW = 2;
  const SIGNS = ["moon", "star", "herb"];
  // Spell cards per sign: value -> count. Fairy dust: value 2, any sign.
  const VALUES = { 1: 4, 2: 4, 3: 3 };
  const DUST = 3;
  const DUST_VALUE = 2;

  // Heroes (all in one shared pile): [id, strength].
  const HEROES = [
    ["hansel", 2], ["gretel", 2], ["woodcutter", 2], ["whiteduck", 1], ["whitebird", 1],
    ["mothergoat", 3], ["youngestkid", 1], ["hunter", 3], ["redcap", 2], ["grandmother", 1],
    ["queen", 3], ["king", 3], ["messenger", 2], ["miller", 1], ["guard", 2],
    ["snowwhite", 2], ["huntsman", 2], ["dwarf", 1], ["prince", 3], ["sevendwarfs", 3],
    ["joringel", 2], ["jorinde", 2], ["shepherd", 1], ["redflower", 1], ["nightingale", 1],
    ["kingsson", 3], ["princess", 2], ["oldking", 2], ["cook", 1], ["twelfthfairy", 2]
  ];

  // Per villain: 3 places [id, sign] and the plan [step id, place, price,
  // final?]. Prices tuned with computer games (tests/villains-core.js).
  const VILLAINS = {
    witch: {
      places: [["gingerhouse", "moon"], ["bakery", "star"], ["oven", "herb"]],
      steps: [["dough", 1, 5], ["roof", 0, 5], ["windows", 0, 5], ["oven", 2, 6, true]]
    },
    wolf: {
      places: [["chandler", "herb"], ["mill", "star"], ["goathouse", "moon"]],
      steps: [["chalk", 0, 5], ["paw", 1, 5], ["flour", 1, 5], ["door", 2, 6, true]]
    },
    rumpel: {
      places: [["spinningroom", "moon"], ["royalcourt", "herb"], ["fireplace", "star"]],
      steps: [["spin", 0, 5], ["spin", 0, 5], ["court", 1, 5], ["dance", 2, 6, true]]
    },
    stepmother: {
      places: [["mirrorhall", "moon"], ["castlekitchen", "star"], ["dwarfhouse", "herb"]],
      steps: [["lace", 2, 5], ["comb", 2, 5], ["apple", 1, 5], ["mirror", 0, 6, true]]
    },
    sorcerer: {
      places: [["towerroom", "herb"], ["birdmeadow", "star"], ["magicwell", "moon"]],
      steps: [["bird", 1, 5], ["bird", 1, 5], ["water", 2, 5], ["cage", 0, 6, true]]
    },
    thornfairy: {
      places: [["festhall", "moon"], ["spindletower", "star"], ["castleyard", "herb"]],
      steps: [["hedge", 0, 6], ["hedge", 1, 6], ["hedge", 2, 6], ["spindle", 1, 4, true]]
    }
  };
  const VILLAIN_IDS = Object.keys(VILLAINS);

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

  // Card data by id: "moon2", "dust", "hansel", ...
  const CARDS = {};
  SIGNS.forEach((sg) => Object.keys(VALUES).forEach((v) => {
    CARDS[sg + v] = { id: sg + v, kind: "spell", sign: sg, value: +v };
  }));
  CARDS.dust = { id: "dust", kind: "spell", sign: "any", value: DUST_VALUE };
  HEROES.forEach((h) => { CARDS[h[0]] = { id: h[0], kind: "hero", str: h[1] }; });
  function card(id) { return CARDS[id]; }

  function spellDeck() {
    const out = [];
    SIGNS.forEach((sg) => Object.keys(VALUES).forEach((v) => { for (let i = 0; i < VALUES[v]; i++) out.push(sg + v); }));
    for (let i = 0; i < DUST; i++) out.push("dust");
    return out;
  }

  function isCurrentState(s) {
    return !!s && s.rules === RULES && Array.isArray(s.players) && Array.isArray(s.finished) && Array.isArray(s.market) && Array.isArray(s.heroRow) &&
      s.players.every((p) => VILLAINS[p.villain] && Array.isArray(p.done) && p.done.length === VILLAINS[p.villain].steps.length && Array.isArray(p.hand) && Array.isArray(p.heroes));
  }

  function drawSpell(s, rnd) {
    if (!s.deck.length) {
      if (!s.discard.length) return null;
      s.deck = shuffle(s.discard, rnd);
      s.discard = [];
    }
    return s.deck.pop();
  }
  function drawHero(s, rnd) {
    if (!s.heroPile.length) {
      if (!s.heroDiscard.length) return null;
      s.heroPile = shuffle(s.heroDiscard, rnd);
      s.heroDiscard = [];
    }
    return s.heroPile.pop();
  }
  function refillMarket(s, rnd) {
    for (let i = 0; i < MARKET; i++) if (s.market[i] === null || s.market[i] === undefined) s.market[i] = drawSpell(s, rnd);
  }
  function refillHeroes(s, rnd) {
    for (let i = 0; i < HERO_ROW; i++) if (s.heroRow[i] === null || s.heroRow[i] === undefined) s.heroRow[i] = drawHero(s, rnd);
  }

  function createGame(villains, rng) {
    const rnd = rng || Math.random;
    const s = {
      rules: RULES,
      players: villains.map((v) => ({ villain: v, hand: [], done: VILLAINS[v].steps.map(() => false), heroes: [] })),
      deck: shuffle(spellDeck(), rnd), discard: [], market: [],
      heroPile: shuffle(HEROES.map((h) => h[0]), rnd), heroRow: [], heroDiscard: [],
      current: 0, turn: 1, actionsLeft: ACTIONS, phase: "act", collectLeft: 0, schemed: false,
      finished: [], winner: null, winners: [], log: [], seed: Math.floor(rnd() * 1e9)
    };
    s.players.forEach((p) => { for (let i = 0; i < START_HAND; i++) p.hand.push(drawSpell(s, rnd)); });
    refillMarket(s, rnd);
    refillHeroes(s, rnd);
    return s;
  }

  function log(s, e) {
    s.log.push(e);
    if (s.log.length > 60) s.log.splice(0, s.log.length - 60);
  }

  function heroAt(p, i) { return p.heroes.find((h) => h.place === i) || null; }
  function placeSign(p, i) { return VILLAINS[p.villain].places[i][1]; }
  function stepsOf(p) { return VILLAINS[p.villain].steps; }

  // Is step j open now (not done; a final step only after all others)?
  function stepOpen(p, j) {
    const st = stepsOf(p)[j];
    if (p.done[j]) return false;
    if (st[3]) return p.done.every((d, k) => d || k === j);
    return true;
  }
  // The price of step j now: its own price plus the strength of a hero at
  // its place.
  function stepPrice(p, j) {
    const st = stepsOf(p)[j];
    const h = heroAt(p, st[1]);
    return st[2] + (h ? card(h.card).str : 0);
  }
  function fits(id, sign) { const c = card(id); return c.sign === sign || c.sign === "any"; }

  // What a card counts at a place: its value when the sign fits (fairy dust
  // always), otherwise 1.
  function countAt(id, sign) { return fits(id, sign) ? card(id).value : 1; }

  // The hand cards (indexes) that pay `need` at a place of `sign` with the
  // least value spent beyond the price, then the fewest fairy dust, then
  // the fewest cards; null if the hand can't pay.
  function payment(hand, sign, need) {
    let best = null, bk = null;
    for (let m = 1; m < (1 << hand.length); m++) {
      let sum = 0, spent = 0, dust = 0, n = 0;
      const pick = [];
      for (let b = 0; b < hand.length; b++) if (m & (1 << b)) {
        const c = card(hand[b]);
        sum += countAt(hand[b], sign); spent += c.value; n++; if (c.sign === "any") dust++;
        pick.push(b);
      }
      if (sum < need) continue;
      const key = [spent - need, dust, n];
      if (!bk || key[0] < bk[0] || (key[0] === bk[0] && (key[1] < bk[1] || (key[1] === bk[1] && key[2] < bk[2])))) { bk = key; best = pick; }
    }
    return best;
  }
  // The card a scheme costs: the lowest value, fairy dust only when there
  // is nothing else; the last such card of the hand.
  function schemeCard(hand) {
    let best = -1, bv = Infinity;
    hand.forEach((id, i) => { const c = card(id); const v = c.value + (c.sign === "any" ? 10 : 0); if (v <= bv) { bv = v; best = i; } });
    return best;
  }
  function stepPayment(p, j) { return payment(p.hand, placeSign(p, stepsOf(p)[j][1]), stepPrice(p, j)); }

  function progress(s, p) {
    const st = stepsOf(p);
    let total = 0, got = 0;
    st.forEach((x, j) => { total += x[2]; if (p.done[j]) got += x[2]; });
    return got / total;
  }
  function hasWon(p) { return p.done.every(Boolean); }

  function canCollect(s) {
    return s.deck.length + s.discard.length > 0 || s.market.some((c) => c !== null);
  }

  // What the active player can do now: [{ type, ... }].
  //   phase "act":     collect | step { step } | scheme { hero, target, place } | end
  //   phase "collect": take { from } (market index 0-2, or -1 for the deck)
  function legalActions(s) {
    if (s.winner !== null) return [];
    const me = s.current, p = s.players[me];
    const out = [];
    if (s.phase === "trim") {
      p.hand.forEach((c, i) => out.push({ type: "drop", card: i }));
      return out;
    }
    if (s.phase === "collect") {
      s.market.forEach((c, i) => { if (c !== null) out.push({ type: "take", from: i }); });
      if (s.deck.length + s.discard.length > 0) out.push({ type: "take", from: -1 });
      return out;
    }
    if (canCollect(s)) out.push({ type: "collect" });
    stepsOf(p).forEach((st, j) => { if (stepOpen(p, j) && stepPayment(p, j)) out.push({ type: "step", step: j }); });
    if (!s.schemed && p.hand.length) {
      s.heroRow.forEach((h, k) => {
        if (h === null) return;
        s.players.forEach((q, t) => {
          if (t === me || s.finished.indexOf(t) !== -1) return;
          for (let pl = 0; pl < 3; pl++) if (!heroAt(q, pl)) out.push({ type: "scheme", hero: k, target: t, place: pl });
        });
      });
    }
    out.push({ type: "end" });
    return out;
  }

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function isLegal(s, act) { return !!act && legalActions(s).some((a) => same(a, act)); }

  function handValue(p) { return p.hand.reduce((a, id) => a + card(id).value, 0); }

  // The winner among those who finished the plan in the last round: the
  // most value left in the hand, then the one later in the round.
  function decideWinner(s) {
    const key = (i) => handValue(s.players[i]) * 10 + s.players[i].hand.length;
    let top = -1;
    s.finished.forEach((i) => { top = Math.max(top, key(i)); });
    s.winners = s.finished.filter((i) => key(i) === top).sort((a, b) => a - b);
    s.winner = s.winners[0];
    s.winners.forEach((i) => log(s, { k: "win", p: i }));
  }

  function endTurn(s) {
    s.current = (s.current + 1) % s.players.length;
    if (s.current === 0 && s.finished.length) { decideWinner(s); return; }
    if (s.current === 0) s.turn++;
    s.actionsLeft = ACTIONS;
    s.phase = "act";
    s.collectLeft = 0;
    s.schemed = false;
  }
  function actionDone(s) {
    s.actionsLeft--;
    if (s.actionsLeft <= 0 && s.winner === null) { log(s, { k: "end", p: s.current }); endTurn(s); }
  }

  // Carries out a legal action; false (nothing changed) for an illegal one.
  function apply(s, act, rng) {
    if (!isLegal(s, act)) return false;
    const rnd = rng || Math.random;
    const me = s.current, p = s.players[me];
    switch (act.type) {
      case "collect":
        s.phase = "collect";
        s.collectLeft = 2;
        break;
      case "take": {
        let id;
        if (act.from === -1) id = drawSpell(s, rnd);
        else { id = s.market[act.from]; s.market[act.from] = null; refillMarket(s, rnd); }
        p.hand.push(id);
        log(s, { k: "take", p: me, c: act.from === -1 ? null : id });
        s.collectLeft--;
        if (s.collectLeft <= 0 || !legalActions(s).length) {
          s.collectLeft = 0;
          if (p.hand.length > HAND_MAX) s.phase = "trim";
          else { s.phase = "act"; actionDone(s); }
        }
        break;
      }
      case "drop":
        s.discard.push(p.hand.splice(act.card, 1)[0]);
        log(s, { k: "drop", p: me });
        if (p.hand.length <= HAND_MAX) { s.phase = "act"; actionDone(s); }
        break;
      case "step": {
        const pay = stepPayment(p, act.step).slice().sort((a, b) => b - a);
        const paid = pay.map((i) => p.hand[i]);
        pay.forEach((i) => s.discard.push(p.hand.splice(i, 1)[0]));
        p.done[act.step] = true;
        const place = stepsOf(p)[act.step][1];
        log(s, { k: "step", p: me, step: act.step, cards: paid });
        const h = heroAt(p, place);
        if (h) {
          p.heroes.splice(p.heroes.indexOf(h), 1);
          s.heroDiscard.push(h.card);
          log(s, { k: "leave", p: me, c: h.card });
        }
        if (hasWon(p)) {
          s.finished.push(me);
          log(s, { k: "done", p: me });
          endTurn(s);
          return true;
        }
        actionDone(s);
        break;
      }
      case "scheme": {
        const q = s.players[act.target];
        const id = s.heroRow[act.hero];
        const ci = schemeCard(p.hand);
        const paid = p.hand.splice(ci, 1)[0];
        s.discard.push(paid);
        s.heroRow[act.hero] = null;
        q.heroes.push({ card: id, place: act.place });
        s.schemed = true;
        log(s, { k: "hero", p: me, t: act.target, c: id, place: act.place, paid });
        if (id === "kingsson" && q.villain === "thornfairy") {
          const j = stepsOf(q).findIndex((st, k) => st[1] === act.place && q.done[k]);
          if (j !== -1) { q.done[j] = false; log(s, { k: "cuthedge", t: act.target, place: act.place }); }
        }
        refillHeroes(s, rnd);
        break;
      }
      case "end":
        log(s, { k: "end", p: me });
        endTurn(s);
        break;
    }
    return true;
  }

  // --- the computer -----------------------------------------------------
  // Levels: 1 = easy (mostly random), 2 = medium (steps when it can, takes
  // any card of a sign it still needs, never schemes), 3 = hard (highest
  // useful cards, keeps fairy dust, the step that leaves the best hand,
  // sends the strongest hero to the cheapest open step of the leader; it
  // only knows what a human could see of the others: steps, heroes, number
  // of hand cards).

  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  // Level 3 schemes when the leader's distance (see distance) is at most
  // SCHEME_AT[players] (with 3 or 4 players only late: a scheme costs a
  // card and helps the third ones too); a player who still plays in this
  // round counts TURN_GAIN nearer when choosing the leader (values from
  // computer games).
  const SCHEME_AT = { 2: 10, 3: 3, 4: 4 };
  const TURN_GAIN = 1.2;

  // What is still missing per sign: price sum of the open steps minus the
  // hand cards of that sign (fairy dust counts later).
  function deficits(p) {
    const need = { moon: 0, star: 0, herb: 0 };
    stepsOf(p).forEach((st, j) => { if (!p.done[j]) need[placeSign(p, st[1])] += stepPrice(p, j); });
    const have = { moon: 0, star: 0, herb: 0 };
    let dust = 0;
    p.hand.forEach((id) => { const c = card(id); if (c.sign === "any") dust += c.value; else have[c.sign] += c.value; });
    const out = {};
    SIGNS.forEach((sg) => { out[sg] = Math.max(0, need[sg] - have[sg]); });
    out.dust = dust;
    return out;
  }

  // How far player i is: done prices plus usable hand value, minus heroes.
  function evaluate(s, i) {
    const p = s.players[i];
    if (s.winner === i) return 1e6;
    if (s.winner !== null) return -1e6;
    const d = deficits(p);
    let left = 0;
    SIGNS.forEach((sg) => { left += d[sg]; });
    left = Math.max(0, left - d.dust);
    return progress(s, p) * 100 - left * 6;
  }

  // Value of a spell card for player p (for collecting).
  function cardWorth(p, id, level) {
    const c = card(id);
    const used = stepsOf(p).some((st, j) => !p.done[j] && fits(id, placeSign(p, st[1])));
    const v = used ? c.value : 0.2;
    if (level < 3) return v;
    // Hard: fairy dust and the sign of the step nearest to being paid
    // are worth a little more.
    if (c.sign === "any") return v + 0.4;
    const t = targetStep(p, null);
    return v + (t && t.sign === c.sign ? 0.3 : 0);
  }
  // { sign, short }: the open step with the smallest shortfall (price minus
  // what the hand can put in, not counting the card `skip` once).
  function targetStep(p, skip) {
    let best = null;
    stepsOf(p).forEach((st, j) => {
      if (!stepOpen(p, j)) return;
      const sign = placeSign(p, st[1]);
      let have = 0, skipped = false;
      p.hand.forEach((id) => { if (!skipped && id === skip) { skipped = true; return; } have += countAt(id, sign); });
      const short = Math.max(0, stepPrice(p, j) - have);
      if (!best || short < best.short) best = { sign, short };
    });
    return best;
  }

  // Remaining distance of player q to the goal from what everyone can see
  // (price sum of the open steps minus about 1.7 per hand card; the cards
  // themselves are secret), for choosing whom to scheme against.
  function distance(q) {
    let left = 0;
    stepsOf(q).forEach((st, j) => { if (!q.done[j]) left += stepPrice(q, j); });
    return left - 1.7 * q.hand.length;
  }

  function bestScheme(s, legal, level) {
    const me = s.current, n = s.players.length;
    const schemes = legal.filter((a) => a.type === "scheme");
    if (!schemes.length) return null;
    // The leader among the others (on a tie the one who plays sooner).
    let lead = -1, la = Infinity;
    for (let k = 1; k < n; k++) {
      const t = (me + k) % n;
      if (s.finished.indexOf(t) !== -1) continue;
      // Who plays after me in this round has one turn less behind him.
      const dq = distance(s.players[t]) - (t > me ? TURN_GAIN : 0);
      if (dq < la) { la = dq; lead = t; }
    }
    if (lead < 0) return null;
    const q = s.players[lead];
    const ld = distance(q);
    const open = stepsOf(q).map((st, j) => j).filter((j) => !q.done[j]);
    if (ld > SCHEME_AT[n]) return null;
    // The place of the cheapest step the leader can do now.
    let bestPlace = -1, bv = -Infinity;
    open.forEach((j) => {
      const pl = stepsOf(q)[j][1];
      if (heroAt(q, pl)) return;
      const v = (stepOpen(q, j) ? 20 : 0) - stepPrice(q, j);
      if (v > bv) { bv = v; bestPlace = pl; }
    });
    if (bestPlace === -1) return null;
    let bestHero = -1, hs = -1;
    s.heroRow.forEach((h, k) => {
      if (h === null) return;
      let str = card(h).str;
      if (h === "kingsson" && q.villain === "thornfairy") str += 4;
      if (str > hs) { hs = str; bestHero = k; }
    });
    if (level < 3) bestHero = s.heroRow.findIndex((h) => h !== null);
    const act = { type: "scheme", hero: bestHero, target: lead, place: bestPlace };
    return schemes.some((a) => same(a, act)) ? act : null;
  }

  // The computer's next action. level 1, 2 or 3 (default 3).
  function chooseAction(s, rng, level) {
    const rnd = rng || Math.random;
    const lv = level || 3;
    const legal = legalActions(s);
    const me = s.current, p = s.players[me];
    if (!legal.length) return null;
    if (s.phase === "trim") {
      if (lv === 1) return legal[Math.floor(rnd() * legal.length)];
      let best = legal[0], bv = Infinity;
      const base = lv >= 3 ? (targetStep(p, null) || { short: 0 }).short : 0;
      legal.forEach((a) => {
        const id = p.hand[a.card];
        let v;
        if (lv >= 3) {
          const t = targetStep(p, id);
          const c = card(id);
          const used = c.sign === "any" || stepsOf(p).some((st, j) => !p.done[j] && placeSign(p, st[1]) === c.sign);
          v = ((t ? t.short : 0) - base) * 10 + (used ? c.value * 0.5 : 0) + (c.sign === "any" ? 3 : 0);
        } else v = cardWorth(p, id, lv);
        if (v < bv) { bv = v; best = a; }
      });
      return best;
    }
    if (s.phase === "collect") {
      if (lv === 1 && rnd() < 0.6) return legal[Math.floor(rnd() * legal.length)];
      if (lv === 2) {
        // Medium: any market card of a sign still needed, else the deck.
        const ok = legal.filter((a) => a.from !== -1 && cardWorth(p, s.market[a.from], 2) >= 1);
        return ok.length ? ok[Math.floor(rnd() * ok.length)] : legal[legal.length - 1];
      }
      let best = legal[legal.length - 1], bv = -Infinity;
      legal.forEach((a) => {
        const v = a.from === -1 ? (lv >= 3 ? 1.3 : 1.1) : cardWorth(p, s.market[a.from], lv);
        if (v > bv) { bv = v; best = a; }
      });
      return best;
    }
    const steps = legal.filter((a) => a.type === "step");
    if (lv === 1) {
      if (steps.length && rnd() < 0.7) return steps[Math.floor(rnd() * steps.length)];
      if (rnd() < 0.15) { const sc = legal.filter((a) => a.type === "scheme"); if (sc.length) return sc[Math.floor(rnd() * sc.length)]; }
      return legal.find((a) => a.type === "collect") || legal[legal.length - 1];
    }
    // A step that finishes the plan wins.
    const win = steps.find((a) => { const t = clone(s); apply(t, a, makeRng(1)); return hasWon(t.players[me]); });
    if (win) return win;
    const sc = lv >= 3 ? bestScheme(s, legal, lv) : null;
    if (sc) return sc;
    if (steps.length) {
      // Prefer the step that leaves the best hand behind.
      let best = null, bv = -Infinity;
      steps.forEach((a) => {
        const t = clone(s); apply(t, a, makeRng(1));
        const v = lv >= 3 ? evaluate(t, me) : -stepsOf(p)[a.step][2];
        if (v > bv) { bv = v; best = a; }
      });
      return best;
    }
    const col = legal.find((a) => a.type === "collect");
    if (col) return col;
    return { type: "end" };
  }

  return {
    RULES, HAND_MAX, ACTIONS, SIGNS, HEROES, VILLAINS, VILLAIN_IDS, card, spellDeck, makeRng, createGame, isCurrentState,
    legalActions, isLegal, apply, heroAt, placeSign, stepsOf, stepOpen, stepPrice, stepPayment, payment, progress, hasWon,
    chooseAction, evaluate, clone
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = VillainsCore;
if (typeof window !== "undefined") window.VillainsCore = VillainsCore;
