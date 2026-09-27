// concan-core.js
// Rules engine for Concan (also written Conquian), the old Mexican card
// game counted among the ancestors of the rummy family. No DOM here - the
// page is concan-app.js, the computer player concan-ai.js.
//
// The version played here (Concan has come down in several variants that
// differ in details; concan-rules.html says which one this is):
//   - 40 cards: the usual pack without Eights, Nines and Tens. Runs go
//     A, 2, 3, 4, 5, 6, 7, J, Q, K - the Jack follows the Seven.
//   - Two players, ten cards each; one card face up starts the discard
//     pile.
//   - Goal: be the first to have eleven cards laid out in melds - sets of
//     three or more of a rank, or runs of three or more of a suit.
//   - A turn: the top discard may only be taken if it is laid out at once,
//     in a new meld or on one of your own melds - and if it can be used,
//     it MUST be taken. Otherwise draw the top card of the stock. After
//     taking or drawing you may lay out more melds or add to your own,
//     then you discard one card, which is offered to your opponent.
//   - Reaching eleven laid-out cards ends the game at once (no discard
//     needed). Since every turn ends with a discard, the last hand card
//     can only be laid out when it makes eleven. If the stock runs out
//     before anybody finishes, the game is a draw.
//
// Cards are { rank, suit } with rank 1..7, 11, 12, 13 (the numbering
// card-faces.js draws). A meld is { type: "set" | "run", cards: [...] }
// with run cards kept in order.

const ConcanCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];
  const HAND_SIZE = 10;
  const GOAL = 11;

  function order(rank) {
    return RANKS.indexOf(rank);
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function sameCard(a, b) {
    return !!a && !!b && a.rank === b.rank && a.suit === b.suit;
  }

  // The meld these cards form, or null.
  function meldOf(cards) {
    if (cards.length < 3) return null;
    if (cards.every((c) => c.rank === cards[0].rank)) {
      return { type: "set", cards: cards.slice().sort((a, b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)) };
    }
    if (!cards.every((c) => c.suit === cards[0].suit)) return null;
    const sorted = cards.slice().sort((a, b) => order(a.rank) - order(b.rank));
    for (let i = 1; i < sorted.length; i++) {
      if (order(sorted[i].rank) !== order(sorted[i - 1].rank) + 1) return null;
    }
    return { type: "run", cards: sorted };
  }

  // The meld after adding `card`, or null if it doesn't fit.
  function extendMeld(meld, card) {
    return meldOf(meld.cards.concat([card]));
  }

  function meldedCount(s, p) {
    return s.melds[p].reduce((n, m) => n + m.cards.length, 0);
  }

  function createInitialState(rng) {
    const deck = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => deck.push({ rank, suit })));
    shuffle(deck, rng);
    const hands = [deck.splice(0, HAND_SIZE), deck.splice(0, HAND_SIZE)];
    const discard = [deck.shift()];
    const s = {
      hands,
      melds: [[], []],
      stock: deck,
      discard,
      turn: 0,
      phase: "start",   // "start": take the discard or draw; "meld": lay out, then discard
      taken: null,      // the discard taken this turn until it is laid out
      mustTakeDiscard: false,
      offeredBy: null,  // who discarded the card on top (null for the first card)
      gameOver: false,
      winner: null,
      draw: false,
      lastEvent: null
    };
    s.mustTakeDiscard = canUseCard(s, 0, discard[0]);
    return s;
  }

  // Every way `card` can be laid out by player p right now: added to one
  // of p's melds, or in a new meld with two or more hand cards.
  function usesOfCard(s, p, card) {
    const uses = [];
    s.melds[p].forEach((meld, i) => {
      if (extendMeld(meld, card)) uses.push({ type: "extend", meld: i });
    });
    const hand = s.hands[p];
    // New sets: two or three hand cards of the same rank.
    const same = hand.filter((c) => c.rank === card.rank && !sameCard(c, card));
    if (same.length >= 2) uses.push({ type: "new", cards: same.slice(0, 2) });
    // New runs: the card plus neighbours of its suit.
    const suited = hand.filter((c) => c.suit === card.suit && !sameCard(c, card));
    const o = order(card.rank);
    const at = (k) => suited.find((c) => order(c.rank) === k);
    const combos = [[o - 2, o - 1], [o - 1, o + 1], [o + 1, o + 2]];
    combos.forEach(([a, b]) => {
      const ca = at(a), cb = at(b);
      if (ca && cb) uses.push({ type: "new", cards: [ca, cb] });
    });
    // A new meld may not use up the whole hand unless it makes eleven:
    // one card must be left to discard.
    return uses.filter((u) => u.type !== "new" || hand.length - u.cards.length > 0 ||
      meldedCount(s, p) + u.cards.length + 1 >= GOAL);
  }

  function canUseCard(s, p, card) {
    return !!card && usesOfCard(s, p, card).length > 0;
  }

  function topDiscard(s) {
    return s.discard.length ? s.discard[s.discard.length - 1] : null;
  }

  function checkWin(s, p) {
    if (meldedCount(s, p) >= GOAL) {
      s.gameOver = true;
      s.winner = p;
      s.phase = "over";
      return true;
    }
    return false;
  }

  function removeCards(hand, cards) {
    for (const card of cards) {
      const i = hand.findIndex((c) => sameCard(c, card));
      if (i === -1) return false;
      hand.splice(i, 1);
    }
    return true;
  }

  // Applies a move for s.turn. Moves:
  //   { type: "takeDiscard" }                     phase "start", card usable
  //   { type: "draw" }                            phase "start", card not usable
  //   { type: "meld", cards: [...] }              new meld from hand (+ the taken card)
  //   { type: "extend", meld: i, card }           add a hand card (or the taken card) to own meld i
  //   { type: "discard", card }                   phase "meld", taken card laid out
  // Returns { ok, state, reason }.
  function applyMove(state, move) {
    if (state.gameOver) return { ok: false, state, reason: "over" };
    const s = clone(state);
    const p = s.turn;
    const hand = s.hands[p];

    if (move.type === "takeDiscard") {
      if (s.phase !== "start") return { ok: false, state, reason: "not-now" };
      const top = topDiscard(s);
      if (!canUseCard(s, p, top)) return { ok: false, state, reason: "cant-use" };
      s.taken = s.discard.pop();
      s.phase = "meld";
      s.mustTakeDiscard = false;
      s.lastEvent = { type: "take", player: p, card: s.taken };
      return { ok: true, state: s };
    }

    if (move.type === "draw") {
      if (s.phase !== "start") return { ok: false, state, reason: "not-now" };
      if (s.mustTakeDiscard) return { ok: false, state, reason: "must-take" };
      if (!s.stock.length) {
        s.gameOver = true;
        s.draw = true;
        s.phase = "over";
        s.lastEvent = { type: "stock-empty", player: p };
        return { ok: true, state: s };
      }
      const card = s.stock.shift();
      hand.push(card);
      s.phase = "meld";
      s.lastEvent = { type: "draw", player: p, card };
      return { ok: true, state: s };
    }

    if (move.type === "meld") {
      if (s.phase !== "meld") return { ok: false, state, reason: "not-now" };
      const cards = move.cards.slice();
      if (s.taken) cards.push(s.taken);
      const meld = meldOf(cards);
      if (!meld) return { ok: false, state, reason: "not-a-meld" };
      const fromHand = s.taken ? move.cards : cards;
      if (!removeCards(hand, fromHand)) return { ok: false, state, reason: "not-in-hand" };
      if (!hand.length && meldedCount(s, p) + meld.cards.length < GOAL) return { ok: false, state, reason: "keep-one" };
      s.melds[p].push(meld);
      const usedTaken = !!s.taken;
      s.taken = null;
      s.lastEvent = { type: "meld", player: p, cards: meld.cards, usedTaken };
      checkWin(s, p);
      return { ok: true, state: s };
    }

    if (move.type === "extend") {
      if (s.phase !== "meld") return { ok: false, state, reason: "not-now" };
      const meld = s.melds[p][move.meld];
      if (!meld) return { ok: false, state, reason: "no-meld" };
      const card = s.taken || move.card;
      if (!card) return { ok: false, state, reason: "no-card" };
      const grown = extendMeld(meld, card);
      if (!grown) return { ok: false, state, reason: "doesnt-fit" };
      if (s.taken) s.taken = null;
      else if (!removeCards(hand, [card])) return { ok: false, state, reason: "not-in-hand" };
      if (!hand.length && meldedCount(s, p) + 1 < GOAL) return { ok: false, state, reason: "keep-one" };
      s.melds[p][move.meld] = grown;
      s.lastEvent = { type: "extend", player: p, card };
      checkWin(s, p);
      return { ok: true, state: s };
    }

    if (move.type === "discard") {
      if (s.phase !== "meld") return { ok: false, state, reason: "not-now" };
      if (s.taken) return { ok: false, state, reason: "lay-out-taken" };
      if (!removeCards(hand, [move.card])) return { ok: false, state, reason: "not-in-hand" };
      s.discard.push(move.card);
      s.offeredBy = p;
      s.lastEvent = { type: "discard", player: p, card: move.card };
      s.turn = 1 - p;
      s.phase = "start";
      s.mustTakeDiscard = canUseCard(s, s.turn, move.card);
      return { ok: true, state: s };
    }
    return { ok: false, state, reason: "bad-move" };
  }

  // All new melds player p could lay out from the hand (plus the taken
  // card, which then must be part of it).
  function possibleMelds(s, p) {
    const hand = s.hands[p];
    const found = [];
    const seen = {};
    const add = (cards) => {
      const all = s.taken ? cards.concat([s.taken]) : cards;
      const m = meldOf(all);
      if (!m) return;
      const key = m.cards.map((c) => c.rank + c.suit).join(",");
      if (seen[key]) return;
      seen[key] = true;
      found.push({ cards, meld: m });
    };
    const n = hand.length;
    const need = s.taken ? 2 : 3;
    // Sets and runs of up to four hand cards are enough to find every
    // useful meld in a ten-card hand.
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      if (need === 2) add([hand[a], hand[b]]);
      for (let c = b + 1; c < n; c++) {
        add([hand[a], hand[b], hand[c]]);
        for (let d = c + 1; d < n; d++) add([hand[a], hand[b], hand[c], hand[d]]);
      }
    }
    return found;
  }

  return {
    SUITS,
    RANKS,
    HAND_SIZE,
    GOAL,
    order,
    sameCard,
    meldOf,
    extendMeld,
    meldedCount,
    createInitialState,
    usesOfCard,
    canUseCard,
    topDiscard,
    applyMove,
    possibleMelds
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ConcanCore;
}
if (typeof window !== "undefined") {
  window.ConcanCore = ConcanCore;
}
