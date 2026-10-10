// canasta-core.js
// Rules engine for Canasta for two players - no DOM here; the page is
// canasta-app.js, the computer player canasta-ai.js.
//
// Rules after the English and German Wikipedia ("Canasta"), two-player
// version:
//   - 108 cards: two packs of 52 plus 4 jokers. Each player gets 15 cards.
//     The rest is the stock; its top card is turned up as the discard
//     pile. A turned-up joker, Two or red Three stays in the pile (it
//     freezes it) and the next card is turned, until it is a natural card
//     or a black Three.
//   - Wild cards: jokers and Twos. Red Threes are laid out at once
//     (dealt or drawn) and replaced from the stock; they only count as a
//     bonus. Black Threes can only be melded when going out.
//   - A turn: draw two cards from the stock (two-player rule) or take the
//     whole discard pile; meld; discard one card.
//   - A meld: at least three cards of one rank (Four to Ace), at least two
//     of them natural, at most three wild cards. A player has only one
//     meld per rank; more cards of that rank are added to it.
//   - Canasta: a meld of seven or more cards - natural (no wild card) 500,
//     mixed 300.
//   - First meld: the cards laid out in that turn must count at least 50
//     points (15 below 0, 90 from 1500, 120 from 3000 points).
//   - Taking the pile: the top card must be laid out at once, in a new
//     meld with at least two cards from the hand or (when the pile is not
//     frozen) on the own meld of its rank. The pile is frozen while a
//     wild card (or a red Three from the start) lies in it, and always
//     for a player without a meld: then the top card needs two natural
//     cards of its rank from the hand. Before the first meld the top card
//     counts towards the minimum. A black Three or a wild card on top
//     can't be taken.
//   - Going out: no cards left - by melding all of them or by discarding
//     the last one. Two-player rule: only with at least two canastas.
//     Bonus 100, going out "concealed" (without any meld before this
//     turn) 200.
//   - Empty stock: a player who can take the discard pile must; if not,
//     the hand ends. A red Three as the last card of the stock ends the
//     hand at once.
//   - Score of a hand: the cards in the melds, canasta bonuses, red Threes
//     (100 each, all four 800; minus that for a player without a meld),
//     going out; minus the cards left in the hand. Card values: joker 50,
//     Ace and Two 20, Eight to King 10, Four to Seven and black Three 5.
//   - The game ends when a player reaches the target (5000, short game
//     2000) at the end of a hand; the higher score wins.
// PaperGames rules (not from the sources, marked on the rules page):
//   - Going out concealed still needs the minimum for a first meld.
//   - Taking the top card means taking it in the same move as the melds
//     that use it, so taking the pile can't fail (no 50-point penalty).
//
// Card: { id, rank 2..14 (14 = Ace), suit "C"|"S"|"H"|"D" } or
// { id, joker: true }. Meld: { rank, cards: [...] } (rank 3 only for black
// Threes when going out).

const CanastaCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const TARGETS = [5000, 2000];

  function isWild(c) { return !!c.joker || c.rank === 2; }
  function isRedThree(c) { return !c.joker && c.rank === 3 && (c.suit === "H" || c.suit === "D"); }
  function isBlackThree(c) { return !c.joker && c.rank === 3 && (c.suit === "C" || c.suit === "S"); }
  function isNatural(c) { return !c.joker && c.rank >= 4; }

  function value(c) {
    if (c.joker) return 50;
    if (c.rank === 2 || c.rank === 14) return 20;
    if (c.rank >= 8) return 10;
    if (c.rank === 3) return isRedThree(c) ? 100 : 5;
    return 5;
  }

  function sum(cards) { return cards.reduce((t, c) => t + value(c), 0); }

  function minimum(score) {
    if (score < 0) return 15;
    if (score < 1500) return 50;
    if (score < 3000) return 90;
    return 120;
  }

  function newDeck() {
    const d = [];
    let id = 0;
    for (let k = 0; k < 2; k++) {
      SUITS.forEach((suit) => { for (let r = 2; r <= 14; r++) d.push({ id: id++, rank: r, suit }); });
      d.push({ id: id++, joker: true });
      d.push({ id: id++, joker: true });
    }
    return d;
  }

  function shuffle(a, rng) {
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  /*** Melds ***/

  function wildCount(cards) { return cards.filter(isWild).length; }
  function naturalCount(cards) { return cards.filter((c) => !isWild(c)).length; }

  // Is `cards` a valid meld of `rank` (whole meld, after any addition)?
  function validMeld(rank, cards) {
    if (cards.length < 3) return false;
    if (rank === 3) return cards.every(isBlackThree);
    if (rank < 4 || rank > 14) return false;
    if (!cards.every((c) => isWild(c) || c.rank === rank)) return false;
    return naturalCount(cards) >= 2 && wildCount(cards) <= 3;
  }

  function isCanasta(m) { return m.cards.length >= 7; }
  function isNaturalCanasta(m) { return isCanasta(m) && wildCount(m.cards) === 0; }
  function canastaCount(melds) { return melds.filter(isCanasta).length; }

  // The rank a group of hand cards stands for: its natural cards'.
  function groupRank(cards) {
    const nat = cards.filter((c) => !isWild(c));
    if (!nat.length) return null;
    const r = nat[0].rank;
    return nat.every((c) => c.rank === r) ? r : -1;
  }

  /*** Deal ***/

  function layRedThrees(s, p) {
    // Lays out red Threes in p's hand and replaces them from the stock.
    let found = true;
    while (found) {
      found = false;
      const h = s.hands[p];
      for (let i = 0; i < h.length; i++) {
        if (isRedThree(h[i])) {
          s.red3[p].push(h.splice(i, 1)[0]);
          if (s.stock.length) h.push(s.stock.pop());
          found = true;
          break;
        }
      }
    }
  }

  function deal(opts, rng) {
    const o = opts || {};
    const s = {
      target: o.target || 5000,
      scores: (o.scores || [0, 0]).slice(),
      hand: o.hand || 1,
      dealer: o.dealer === undefined ? 1 : o.dealer,
      stock: shuffle(newDeck(), rng),
      discard: [],
      hands: [[], []],
      melds: [[], []],
      red3: [[], []],
      known: [[], []],       // ids of cards in a hand that came from the pile (seen by both)
      turn: 0,
      phase: "draw",
      meldedBefore: [false, false], // a meld before the current turn
      drawn: [],             // ids drawn from the stock this turn
      last: null,            // last event
      result: null
    };
    for (let k = 0; k < 15; k++) for (let p = 0; p < 2; p++) s.hands[p].push(s.stock.pop());
    s.req = [minimum(s.scores[0]), minimum(s.scores[1])];
    for (let p = 0; p < 2; p++) layRedThrees(s, p);
    // Turn up the first discard.
    for (;;) {
      const c = s.stock.pop();
      s.discard.push(c);
      if (!(isWild(c) || isRedThree(c))) break;
    }
    s.turn = 1 - s.dealer;
    return s;
  }

  /*** Discard pile ***/

  function topDiscard(s) { return s.discard.length ? s.discard[s.discard.length - 1] : null; }

  function pileFrozen(s) { return s.discard.some((c) => isWild(c) || isRedThree(c)); }

  function frozenFor(s, p) { return pileFrozen(s) || !s.melds[p].length; }

  function ownMeld(s, p, rank) { return s.melds[p].find((m) => m.rank === rank) || null; }

  /*** Moves ***/

  // Checks and applies meld groups for player p on state s (mutates s).
  // groups: [{ ids, cards }] with cards already taken out of the hand.
  // Returns an error string or null. Each group either goes onto the own
  // meld of its rank or becomes a new one; a group of wild cards only
  // needs `target` (a rank with an own meld).
  function placeGroups(s, p, groups) {
    for (const g of groups) {
      let rank = g.target !== undefined && g.target !== null ? g.target : groupRank(g.cards);
      if (rank === null) return "wild-needs-meld";
      if (rank === -1) return "mixed-ranks";
      if (g.cards.some(isBlackThree)) {
        if (!g.cards.every(isBlackThree)) return "black-three";
        rank = 3;
      }
      if (g.cards.some(isRedThree)) return "red-three";
      const existing = ownMeld(s, p, rank);
      if (existing) {
        if (rank === 3) return "black-three";
        const all = existing.cards.concat(g.cards);
        if (!validMeld(rank, all)) return wildCount(all) > 3 ? "too-many-wild" : "not-a-meld";
        existing.cards = all;
      } else {
        if (!validMeld(rank, g.cards)) {
          if (g.cards.length < 3) return "too-few";
          return wildCount(g.cards) > 3 ? "too-many-wild" : "not-a-meld";
        }
        s.melds[p].push({ rank, cards: g.cards.slice() });
      }
    }
    s.melds[p].sort((a, b) => a.rank - b.rank);
    return null;
  }

  function takeFromHand(s, p, ids) {
    const h = s.hands[p];
    const out = [];
    for (const id of ids) {
      const i = h.findIndex((c) => c.id === id);
      if (i === -1) return null;
      out.push(h.splice(i, 1)[0]);
    }
    return out;
  }

  function canGoOut(s, p) { return canastaCount(s.melds[p]) >= 2; }

  // After melds: the hand may be empty only when going out is allowed,
  // and must keep at least two cards (one to discard) otherwise - unless
  // the one card left can still be laid out on an own meld so that the
  // player then has two canastas and goes out (melding step by step).
  function handCheck(s, p) {
    const n = s.hands[p].length;
    if (canGoOut(s, p)) return null;
    if (n === 1 && lastCardGoesOut(s, p)) return null;
    if (n < 2) return "keep-card";
    return null;
  }

  function lastCardGoesOut(s, p) {
    const c = s.hands[p][0];
    if (isRedThree(c) || isBlackThree(c)) return false;
    const melds = s.melds[p];
    return melds.some((m, i) => {
      if (m.rank === 3 || !(isWild(c) || c.rank === m.rank)) return false;
      const cards = m.cards.concat([c]);
      if (!validMeld(m.rank, cards)) return false;
      return melds.filter((x, j) => (j === i ? cards.length >= 7 : isCanasta(x))).length >= 2;
    });
  }

  function newMeldValue(groups) { return groups.reduce((t, g) => t + sum(g.cards), 0); }

  // Black Threes may only be melded when the player goes out with it.
  function blackThreeCheck(s, p, groups) {
    if (!groups.some((g) => g.cards.some(isBlackThree))) return null;
    if (!canGoOut(s, p) || s.hands[p].length > 1) return "black-three";
    return null;
  }

  function endTurn(s) {
    const p = s.turn;
    s.meldedBefore[p] = s.melds[p].length > 0;
    s.turn = 1 - p;
    s.phase = "draw";
    s.drawn = [];
    s.pileTaken = false;
    if (!s.stock.length && !canTakePile(s, s.turn)) finishHand(s, null);
  }

  function goOut(s) {
    finishHand(s, s.turn);
  }

  // move: { type: "draw" } | { type: "takePile", groups: [{ ids, target? }] }
  //     | { type: "meld", groups: [...] } | { type: "discard", id }
  function applyMove(state, move) {
    if (!state || state.phase === "over") return { ok: false, reason: "over" };
    const s = clone(state);
    const p = s.turn;
    s.last = null;
    if (move.type === "draw") {
      if (s.phase !== "draw") return { ok: false, reason: "not-now" };
      if (!s.stock.length) return { ok: false, reason: "stock-empty" };
      const n = Math.min(2, s.stock.length);
      const got = [];
      let red = [];
      for (let k = 0; k < n; k++) {
        let c = s.stock.pop();
        while (c && isRedThree(c)) {
          s.red3[p].push(c);
          red.push(c);
          if (!s.stock.length) {
            // A red Three as the last card ends the hand at once.
            s.drawn = got.map((x) => x.id);
            s.hands[p] = s.hands[p].concat(got);
            s.last = { type: "draw", player: p, count: got.length, red };
            finishHand(s, null);
            return { ok: true, state: s };
          }
          c = s.stock.pop();
        }
        if (c) got.push(c);
      }
      s.hands[p] = s.hands[p].concat(got);
      s.drawn = got.map((c) => c.id);
      s.phase = "play";
      s.last = { type: "draw", player: p, count: got.length, red };
      return { ok: true, state: s };
    }
    if (move.type === "takePile") {
      if (s.phase !== "draw") return { ok: false, reason: "not-now" };
      const top = topDiscard(s);
      if (!top) return { ok: false, reason: "no-pile" };
      if (isBlackThree(top)) return { ok: false, reason: "pile-black-three" };
      if (isWild(top) || isRedThree(top)) return { ok: false, reason: "pile-wild" };
      const groups = (move.groups || []).map((g) => ({ ids: g.ids || [], target: g.target }));
      if (!groups.length) groups.push({ ids: [] });
      const hadMelds = s.melds[p].length > 0;
      const frozen = frozenFor(s, p);
      // Group 0 holds the top card.
      const taken = [];
      for (const g of groups) {
        const cards = takeFromHand(s, p, g.ids);
        if (!cards) return { ok: false, reason: "not-in-hand" };
        g.cards = cards;
        taken.push.apply(taken, cards);
      }
      const g0 = groups[0];
      if (g0.cards.some((c) => !isWild(c) && c.rank !== top.rank)) return { ok: false, reason: "top-rank" };
      const naturalsOfTop = g0.cards.filter((c) => !isWild(c) && c.rank === top.rank).length;
      if (frozen) {
        if (naturalsOfTop < 2) return { ok: false, reason: hadMelds ? "frozen" : "frozen-first" };
      } else if (!ownMeld(s, p, top.rank) && g0.cards.length < 2) {
        return { ok: false, reason: "top-needs-two" };
      }
      g0.cards = [top].concat(g0.cards);
      g0.target = top.rank;
      if (!hadMelds) {
        const v = newMeldValue(groups);
        if (v < s.req[p]) return { ok: false, reason: "below-minimum", value: v };
      }
      s.discard.pop();
      const err = placeGroups(s, p, groups);
      if (err) return { ok: false, reason: err };
      // The rest of the pile goes into the hand; red Threes from the start
      // are laid out (no replacement).
      const rest = s.discard.splice(0, s.discard.length);
      rest.forEach((c) => {
        if (isRedThree(c)) s.red3[p].push(c);
        else { s.hands[p].push(c); s.known[p].push(c.id); }
      });
      s.known[p] = s.known[p].filter((id) => s.hands[p].some((c) => c.id === id));
      const bt = blackThreeCheck(s, p, groups);
      if (bt) return { ok: false, reason: bt };
      if (!s.hands[p].length) {
        if (!canGoOut(s, p)) return { ok: false, reason: "keep-card" };
        s.phase = "play";
        s.last = { type: "takePile", player: p, card: top, count: rest.length + 1 };
        goOut(s);
        return { ok: true, state: s };
      }
      if (s.hands[p].length === 1 && !canGoOut(s, p)) {
        // One card left to discard would mean going out.
        return { ok: false, reason: "keep-card" };
      }
      s.phase = "play";
      s.pileTaken = true;
      s.last = { type: "takePile", player: p, card: top, count: rest.length + 1 };
      return { ok: true, state: s };
    }
    if (move.type === "meld") {
      if (s.phase !== "play") return { ok: false, reason: "draw-first" };
      const groups = (move.groups || []).map((g) => ({ ids: g.ids || [], target: g.target }));
      if (!groups.length || groups.some((g) => !g.ids.length)) return { ok: false, reason: "select" };
      const hadMelds = s.melds[p].length > 0;
      for (const g of groups) {
        const cards = takeFromHand(s, p, g.ids);
        if (!cards) return { ok: false, reason: "not-in-hand" };
        g.cards = cards;
        if (!hadMelds && g.target !== undefined && g.target !== null) return { ok: false, reason: "no-meld-yet" };
      }
      if (!hadMelds) {
        const v = newMeldValue(groups);
        if (v < s.req[p]) return { ok: false, reason: "below-minimum", value: v };
      }
      const err = placeGroups(s, p, groups);
      if (err) return { ok: false, reason: err };
      const bt = blackThreeCheck(s, p, groups);
      if (bt) return { ok: false, reason: bt };
      const hc = handCheck(s, p);
      if (hc) return { ok: false, reason: hc };
      s.known[p] = s.known[p].filter((id) => s.hands[p].some((c) => c.id === id));
      s.last = { type: "meld", player: p, count: groups.reduce((t, g) => t + g.cards.length, 0), first: !hadMelds, value: newMeldValue(groups) };
      if (!s.hands[p].length) goOut(s);
      return { ok: true, state: s };
    }
    if (move.type === "discard") {
      if (s.phase !== "play") return { ok: false, reason: "draw-first" };
      const h = s.hands[p];
      const i = h.findIndex((c) => c.id === move.id);
      if (i === -1) return { ok: false, reason: "not-in-hand" };
      if (h.length === 1 && !canGoOut(s, p)) return { ok: false, reason: "keep-card" };
      const c = h.splice(i, 1)[0];
      s.discard.push(c);
      s.known[p] = s.known[p].filter((id) => id !== c.id);
      s.last = { type: "discard", player: p, card: c };
      if (!h.length) { goOut(s); return { ok: true, state: s }; }
      endTurn(s);
      return { ok: true, state: s };
    }
    return { ok: false, reason: "unknown" };
  }

  /*** Taking the pile: is it possible at all? ***/

  // The best first meld from `hand` (black Threes and red Threes left
  // out), optionally with a forced group for the top card `top`. Returns
  // { value, groups: [{ ids, target? }] } or null if no meld is possible.
  // Greedy: every rank with three or more naturals, then pairs (highest
  // first) with one wild card each, then the remaining wild cards onto the
  // groups (at most three per group).
  function bestMelds(hand, top, opts) {
    const o = opts || {};
    const byRank = {};
    hand.forEach((c) => { if (isNatural(c)) (byRank[c.rank] = byRank[c.rank] || []).push(c); });
    let wilds = hand.filter(isWild).slice().sort((a, b) => value(b) - value(a));
    if (o.keepWild) wilds = wilds.slice(0, Math.max(0, wilds.length - o.keepWild));
    const groups = [];
    if (top) {
      const nat = byRank[top.rank] || [];
      delete byRank[top.rank];
      const need = o.frozen ? 2 : 1;
      if (nat.length < need) return null;
      const g = { rank: top.rank, cards: nat.slice(), top: true };
      if (nat.length < 2) {
        if (!wilds.length) return null;
        g.cards.push(wilds.shift());
      }
      groups.push(g);
    }
    Object.keys(byRank).map(Number).sort((a, b) => b - a).forEach((r) => {
      if (byRank[r].length >= 3) groups.push({ rank: r, cards: byRank[r].slice() });
    });
    Object.keys(byRank).map(Number).sort((a, b) => value(byRank[b][0]) - value(byRank[a][0]) || b - a).forEach((r) => {
      if (byRank[r].length === 2 && wilds.length && !o.noPairs) groups.push({ rank: r, cards: byRank[r].concat([wilds.shift()]) });
    });
    if (!o.saveWild) {
      groups.forEach((g) => {
        while (wilds.length && wildCount(g.cards) < 3 && (!o.wildLimit || wildCount(g.cards) < o.wildLimit)) g.cards.push(wilds.shift());
      });
    }
    if (!groups.length) return null;
    let value_ = groups.reduce((t, g) => t + sum(g.cards), 0) + (top ? value(top) : 0);
    return {
      value: value_,
      groups: groups.map((g) => (g.top ? { ids: g.cards.map((c) => c.id), target: g.rank, top: true } : { ids: g.cards.map((c) => c.id) }))
    };
  }

  function canTakePile(s, p) {
    const top = topDiscard(s);
    if (!top || !isNatural(top)) return false;
    const hand = s.hands[p];
    const frozen = frozenFor(s, p);
    const nat = hand.filter((c) => isNatural(c) && c.rank === top.rank).length;
    const wild = hand.filter(isWild).length;
    if (s.melds[p].length) {
      if (frozen) return nat >= 2;
      return !!ownMeld(s, p, top.rank) || nat >= 2 || (nat >= 1 && wild >= 1);
    }
    if (nat < 2) return false;
    const b = bestMelds(hand, top, { frozen: true });
    return !!b && b.value >= s.req[p] && hand.length - (b.groups.reduce((t, g) => t + g.ids.length, 0)) + s.discard.length - 1 >= 1;
  }

  /*** End of a hand ***/

  function sideScore(s, p, outPlayer) {
    const melded = s.melds[p].reduce((t, m) => t + sum(m.cards), 0);
    const canastas = s.melds[p].reduce((t, m) => t + (isCanasta(m) ? (isNaturalCanasta(m) ? 500 : 300) : 0), 0);
    const n3 = s.red3[p].length;
    let red = n3 === 4 ? 800 : n3 * 100;
    if (!s.melds[p].length) red = -red;
    let out = 0;
    if (outPlayer === p) out = s.meldedBefore[p] ? 100 : 200;
    const hand = sum(s.hands[p]);
    return { melded, canastas, red, out, hand, total: melded + canastas + red + out - hand };
  }

  function finishHand(s, outPlayer) {
    const parts = [sideScore(s, 0, outPlayer), sideScore(s, 1, outPlayer)];
    const before = s.scores.slice();
    s.scores = [before[0] + parts[0].total, before[1] + parts[1].total];
    s.phase = "over";
    const gameOver = s.scores[0] >= s.target || s.scores[1] >= s.target;
    let winner = null;
    if (gameOver) winner = s.scores[0] > s.scores[1] ? 0 : s.scores[1] > s.scores[0] ? 1 : -1;
    s.result = { outPlayer, parts, before, gameOver, winner, concealed: outPlayer !== null && !s.meldedBefore[outPlayer] };
  }

  function nextHand(s, rng) {
    return deal({ target: s.target, scores: s.scores, hand: s.hand + 1, dealer: 1 - s.dealer }, rng);
  }

  function totalCards(s) {
    return s.stock.length + s.discard.length + s.hands[0].length + s.hands[1].length + s.red3[0].length + s.red3[1].length +
      s.melds[0].reduce((t, m) => t + m.cards.length, 0) + s.melds[1].reduce((t, m) => t + m.cards.length, 0);
  }

  return {
    SUITS, TARGETS, isWild, isRedThree, isBlackThree, isNatural, value, sum, minimum, newDeck, shuffle, clone,
    validMeld, isCanasta, isNaturalCanasta, canastaCount, groupRank, deal, topDiscard, pileFrozen, frozenFor, ownMeld,
    applyMove, bestMelds, canTakePile, canGoOut, sideScore, finishHand, nextHand, totalCards, wildCount
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CanastaCore;
}
if (typeof window !== "undefined") {
  window.CanastaCore = CanastaCore;
}
