// teufelsieben-core.js
// Rules of "Devilish Seven" (Teuflische Sieben), a push-your-luck card game
// made for PaperGames (task 121), without any DOM or browser feature.
//
// The deck (DECK, 90 cards): number cards 0 to 12, each number as often as
// its value (the 0 once): 79 cards. Special cards: "Pause" x2 (a player of
// your choice must stop and keeps the points of the round), "Second
// helping" x2 (a player of your choice must turn up three cards one after
// another), "Rescue" x2 (protects its owner once from going bust), "+3" x2,
// "+5" x2 and "Double" x1 (doubles the number points of its owner).
//
// A round: every player gets one card, then in turn each player still in
// the round turns up one card or stops. Stopping keeps the round points. A
// number that the player already has makes them go bust: no points this
// round (a Rescue card is used up instead and the second number is thrown
// away). Seven different numbers end the round at once, with a bonus of
// BONUS points. The round also ends when nobody is left in it.
// Round points: the sum of the numbers (doubled with Double), plus +3/+5,
// plus the bonus. The game ends after the round in which somebody reaches
// the target (100, 150 or 200); the most points win, a tie lets all of
// them win.
// Special cards turned up during a Second helping (Pause, Second helping)
// have no effect and are put away; Rescue and point cards are kept.
//
// The computer stops when the chance to go bust with the next card is
// above the risk of its level, counted only from the cards that are known:
// the deck minus every card lying open (in front of the players and on the
// discard pile) - never from the hidden order of the deck. It also stops
// when its round points reach the level's aim, or when stopping wins the
// game. It gives Pause and Second helping to the player that is ahead.
//
// The state is a plain serialisable object; every function returns a new
// state, or the very same object when the action is not allowed.

const TeufelSiebenCore = (() => {
  const BONUS = 20;
  const SEVEN = 7;
  const TARGETS = [100, 150, 200];
  const SPECIALS = [
    { kind: "pause", n: 2 }, { kind: "helping", n: 2 }, { kind: "rescue", n: 2 },
    { kind: "plus3", n: 2 }, { kind: "plus5", n: 2 }, { kind: "double", n: 1 }
  ];
  // Risk (chance to go bust) and round points at which each level stops.
  const LEVELS = { 1: { risk: 0.15, aim: 18 }, 2: { risk: 0.25, aim: 27 }, 3: { risk: 0.32, aim: 35 } };

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A card: a number 0..12, or a string for a special card.
  function buildDeck() {
    const deck = [0];
    for (let v = 1; v <= 12; v++) for (let k = 0; k < v; k++) deck.push(v);
    SPECIALS.forEach((s) => { for (let k = 0; k < s.n; k++) deck.push(s.kind); });
    return deck;
  }
  const DECK = buildDeck();

  function shuffle(list, rng) {
    const a = list.slice(), r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function isNumber(card) {
    return typeof card === "number";
  }

  function newHand() {
    return { numbers: [], extras: [], rescue: false, status: "in", forced: 0 };
  }

  // opts: { players: 2..6, computer: [bool...], levels: [1..3...], target }
  function newGame(opts, rng) {
    const o = opts || {};
    const n = Math.max(2, Math.min(6, o.players || 2));
    const s = {
      game: "teufelsieben",
      n,
      computer: [],
      levels: [],
      totals: [],
      target: TARGETS.indexOf(o.target) !== -1 ? o.target : 150,
      deck: shuffle(DECK, rng),
      discard: [],
      hands: [],
      dealer: 0,
      current: 0,
      phase: "deal",       // "deal" | "turn" | "target" | "roundover" | "over"
      pending: null,       // { card, from } a Pause / Second helping waiting for its target
      round: 0,
      roundPoints: null,   // points of the last finished round, per player
      winners: null,
      last: null,          // the last thing that happened (for the screen)
      seq: 0
    };
    for (let i = 0; i < n; i++) {
      s.computer.push(!!(o.computer && o.computer[i]));
      s.levels.push(o.levels && o.levels[i] ? o.levels[i] : 2);
      s.totals.push(0);
    }
    return startRound(s, rng);
  }

  function drawCard(s, rng) {
    if (!s.deck.length) {
      s.deck = shuffle(s.discard, rng);
      s.discard = [];
    }
    return s.deck.length ? s.deck.shift() : null;
  }

  function inRound(s) {
    const out = [];
    s.hands.forEach((h, i) => { if (h.status === "in") out.push(i); });
    return out;
  }

  function nextInRound(s, from) {
    for (let k = 1; k <= s.n; k++) {
      const i = (from + k) % s.n;
      if (s.hands[i].status === "in") return i;
    }
    return -1;
  }

  // Points of a hand as it stands (0 when bust).
  function handPoints(h) {
    if (h.status === "bust") return 0;
    let sum = h.numbers.reduce((a, b) => a + b, 0);
    if (h.extras.indexOf("double") !== -1) sum *= 2;
    h.extras.forEach((e) => { if (e === "plus3") sum += 3; if (e === "plus5") sum += 5; });
    if (h.numbers.length >= SEVEN) sum += BONUS;
    return sum;
  }

  function note(s, what) {
    s.seq += 1;
    s.last = Object.assign({ seq: s.seq }, what);
  }

  // Deal: one card to every player, starting after the dealer. Special
  // cards are dealt like in a turn (a Pause / Second helping waits for its
  // target).
  function startRound(s0, rng) {
    const s = s0.phase === "deal" && !s0.round ? s0 : clone(s0);
    s.round += 1;
    s.hands = [];
    for (let i = 0; i < s.n; i++) s.hands.push(newHand());
    s.pending = null;
    s.phase = "turn";
    s.dealQueue = [];
    for (let k = 1; k <= s.n; k++) s.dealQueue.push((s.dealer + k) % s.n);
    s.current = s.dealQueue[0];
    return continueDeal(s, rng);
  }

  // Deals the next card of the first round of cards; stops when a special
  // card needs a target.
  function continueDeal(s, rng) {
    while (s.dealQueue && s.dealQueue.length && s.phase === "turn") {
      const p = s.dealQueue.shift();
      if (s.hands[p].status !== "in") continue;
      s.current = p;
      reveal(s, p, rng, false);
      if (roundIsOver(s)) return endRound(s);
    }
    if (s.phase === "turn" && (!s.dealQueue || !s.dealQueue.length)) {
      s.dealQueue = null;
      s.current = nextInRound(s, s.dealer);
      if (s.current < 0) return endRound(s);
    }
    return s;
  }

  // Turns up one card for player p and applies it. inHelping: during a
  // Second helping (Pause and Second helping have no effect then).
  function reveal(s, p, rng, inHelping) {
    const h = s.hands[p];
    const card = drawCard(s, rng);
    if (card === null) { h.status = "stop"; note(s, { type: "empty", player: p }); return; }
    if (isNumber(card)) {
      if (h.numbers.indexOf(card) !== -1) {
        if (h.rescue) {
          h.rescue = false;
          s.discard.push(card, "rescue");
          note(s, { type: "rescued", player: p, card });
        } else {
          h.status = "bust";
          h.numbers.push(card);
          note(s, { type: "bust", player: p, card });
        }
        return;
      }
      h.numbers.push(card);
      note(s, { type: h.numbers.length >= SEVEN ? "seven" : "number", player: p, card });
      return;
    }
    if (card === "rescue") {
      if (h.rescue) { s.discard.push(card); note(s, { type: "rescue-extra", player: p, card }); }
      else { h.rescue = true; note(s, { type: "rescue", player: p, card }); }
      return;
    }
    if (card === "plus3" || card === "plus5" || card === "double") {
      h.extras.push(card);
      note(s, { type: "extra", player: p, card });
      return;
    }
    // pause / helping
    if (inHelping) {
      s.discard.push(card);
      note(s, { type: "void", player: p, card });
      return;
    }
    s.pending = { card, from: p };
    s.phase = "target";
    note(s, { type: "special", player: p, card });
  }

  function roundIsOver(s) {
    return s.hands.some((h) => h.status !== "bust" && h.numbers.length >= SEVEN) || inRound(s).length === 0;
  }

  // Players a Pause or Second helping may go to (everyone still in the
  // round, the card's owner too).
  function targets(s) {
    return s.phase === "target" ? inRound(s) : [];
  }

  // The owner of a waiting special card gives it to player t.
  function giveTo(s0, t, rng) {
    if (s0.phase !== "target" || targets(s0).indexOf(t) === -1) return s0;
    const s = clone(s0);
    const card = s.pending.card, from = s.pending.from;
    s.pending = null;
    s.phase = "turn";
    s.discard.push(card);
    if (card === "pause") {
      s.hands[t].status = "stop";
      note(s, { type: "paused", player: from, target: t, card });
    } else {
      note(s, { type: "helping", player: from, target: t, card });
      for (let k = 0; k < 3 && s.hands[t].status === "in"; k++) {
        reveal(s, t, rng, true);
        if (s.hands[t].numbers.length >= SEVEN) break;
      }
    }
    if (roundIsOver(s)) return endRound(s);
    if (s.dealQueue) return continueDeal(s, rng);
    s.current = nextInRound(s, from);
    if (s.current < 0) return endRound(s);
    return s;
  }

  // The player to move turns up a card.
  function draw(s0, rng) {
    if (s0.phase !== "turn" || s0.dealQueue || s0.hands[s0.current].status !== "in") return s0;
    const s = clone(s0);
    const p = s.current;
    reveal(s, p, rng, false);
    if (s.phase === "target") return s;
    if (roundIsOver(s)) return endRound(s);
    s.current = nextInRound(s, p);
    if (s.current < 0) return endRound(s);
    return s;
  }

  // The player to move stops and keeps the round points.
  function stop(s0) {
    if (s0.phase !== "turn" || s0.dealQueue || s0.hands[s0.current].status !== "in") return s0;
    const s = clone(s0);
    const p = s.current;
    s.hands[p].status = "stop";
    note(s, { type: "stop", player: p, points: handPoints(s.hands[p]) });
    if (roundIsOver(s)) return endRound(s);
    s.current = nextInRound(s, p);
    if (s.current < 0) return endRound(s);
    return s;
  }

  function endRound(s) {
    s.roundPoints = s.hands.map(handPoints);
    s.roundPoints.forEach((pts, i) => { s.totals[i] += pts; });
    // the cards of the round go to the discard pile (open)
    s.hands.forEach((h) => {
      h.numbers.forEach((c) => s.discard.push(c));
      h.extras.forEach((c) => s.discard.push(c));
      if (h.rescue) s.discard.push("rescue");
    });
    s.phase = "roundover";
    s.pending = null;
    s.dealQueue = null;
    const best = Math.max.apply(null, s.totals);
    if (best >= s.target) {
      s.phase = "over";
      s.winners = [];
      s.totals.forEach((t, i) => { if (t === best) s.winners.push(i); });
    }
    note(s, { type: s.phase === "over" ? "gameover" : "roundover" });
    return s;
  }

  // The next round (after the screen showed the round's result).
  function nextRound(s0, rng) {
    if (s0.phase !== "roundover") return s0;
    const s = clone(s0);
    s.dealer = (s.dealer + 1) % s.n;
    return startRound(s, rng);
  }

  // ---- Computer ----

  // Cards not open anywhere: the whole deck minus the open cards (hands of
  // this round and the discard pile). Their order is not looked at.
  function unseen(s) {
    const counts = {};
    DECK.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
    const open = s.discard.slice();
    s.hands.forEach((h) => { h.numbers.forEach((c) => open.push(c)); h.extras.forEach((c) => open.push(c)); if (h.rescue) open.push("rescue"); });
    open.forEach((c) => { if (counts[c]) counts[c] -= 1; });
    return counts;
  }

  // Chance that player p goes bust with the next card.
  function bustChance(s, p) {
    const h = s.hands[p];
    if (h.rescue) return 0;
    const counts = unseen(s);
    let total = 0, bad = 0;
    Object.keys(counts).forEach((c) => {
      total += counts[c];
      const v = Number(c);
      if (!isNaN(v) && h.numbers.indexOf(v) !== -1) bad += counts[c];
    });
    return total ? bad / total : 0;
  }

  // Draw or stop for the player to move (a computer).
  function wantsToStop(s) {
    const p = s.current, h = s.hands[p], lv = LEVELS[s.levels[p]] || LEVELS[2];
    const pts = handPoints(h);
    if (!h.numbers.length && !h.extras.length) return false;
    if (s.totals[p] + pts >= s.target && s.levels[p] >= 2) return true;
    if (pts >= lv.aim) return true;
    return bustChance(s, p) > lv.risk;
  }

  // Where a computer gives Pause / Second helping: Pause to the opponent
  // with the most points (total and round) - or itself when it is alone or
  // ahead of everyone; Second helping to the opponent with the most round
  // points (more cards, more risk) - itself only when nobody else is left.
  function chooseTarget(s) {
    const from = s.pending.from, card = s.pending.card;
    const list = targets(s);
    const others = list.filter((i) => i !== from);
    if (!others.length) return from;
    const score = (i) => s.totals[i] + handPoints(s.hands[i]);
    if (card === "pause" && s.levels[from] >= 2 && handPoints(s.hands[from]) >= (LEVELS[s.levels[from]] || LEVELS[2]).aim * 0.6 && bustChance(s, from) > 0.2) return from;
    if (s.levels[from] === 1) return others[0];
    let best = others[0];
    others.forEach((i) => { if ((card === "pause" ? score(i) : handPoints(s.hands[i])) > (card === "pause" ? score(best) : handPoints(s.hands[best]))) best = i; });
    return best;
  }

  // One step of the computer whose turn it is.
  function aiStep(s, rng) {
    if (s.phase === "target") return giveTo(s, chooseTarget(s), rng);
    if (s.phase !== "turn" || s.dealQueue) return s;
    return wantsToStop(s) ? stop(s) : draw(s, rng);
  }

  // Whose decision it is now (the owner of a waiting special card, or the
  // player to move).
  function actor(s) {
    if (s.phase === "target") return s.pending.from;
    return s.current;
  }

  function outcomeFor(s, p) {
    if (s.phase !== "over") return null;
    if (s.winners.indexOf(p) === -1) return "loss";
    return s.winners.length > 1 ? "draw" : "win";
  }

  return { DECK, BONUS, SEVEN, TARGETS, LEVELS, makeRng, newGame, draw, stop, giveTo, targets, nextRound, handPoints, bustChance, unseen, wantsToStop, chooseTarget, aiStep, actor, outcomeFor, isNumber };
})();

if (typeof module !== "undefined") module.exports = TeufelSiebenCore;
if (typeof window !== "undefined") window.TeufelSiebenCore = TeufelSiebenCore;
