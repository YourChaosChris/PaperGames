// skat-core.js
// Skat for three players after the official rules (International Skat
// Order, ISkO). Dependency-free, no DOM.
//
// 32 cards (7 to Ace), 10 per player, 2 in the skat. Seats from the
// dealer: Vorhand (forehand) = dealer + 1, Mittelhand = dealer + 2,
// Hinterhand = the dealer. Bidding: Mittelhand bids to Vorhand, who holds
// or passes; the survivor is then bid to by Hinterhand. If all pass,
// Vorhand may still play at 18; otherwise the deal is passed in
// (written down, not replayed).
// The declarer takes the skat and discards two cards, or plays "Hand".
// Games: a suit game (Clubs 12, Spades 11, Hearts 10, Diamonds 9),
// Grand (24) or Null (23, Hand 35, Ouvert 46, Ouvert Hand 59). In a Hand
// game Schneider, Schwarz and Ouvert can be announced.
// Value of a suit game or Grand: base value x (matadors "with/without" +
// 1 for the game + Hand + Schneider + Schneider announced + Schwarz +
// Schwarz announced + Ouvert). The declarer wins with 61 or more points
// (90 if Schneider was announced, all tricks if Schwarz was announced).
// A lost game counts double against the declarer. If the value turns out
// lower than the bid (overbid), the game is lost and counts as the lowest
// multiple of the base value that reaches the bid, doubled.

const SkatCore = (function () {
  const SUITS = ["C", "S", "H", "D"];          // Clubs, Spades, Hearts, Diamonds (in German: Kreuz, Pik, Herz, Karo)
  const RANKS = [7, 8, 9, 10, 11, 12, 13, 14]; // 11 Jack, 12 Queen, 13 King, 14 Ace
  const POINTS = { 14: 11, 10: 10, 13: 4, 12: 3, 11: 2, 9: 0, 8: 0, 7: 0 };
  const BASE = { C: 12, S: 11, H: 10, D: 9, grand: 24 };
  const NULL_VALUE = { plain: 23, hand: 35, ouvert: 46, ouvertHand: 59 };
  // Every value a game can have, from 18 on: what can be bid.
  const BID_VALUES = (function () {
    const v = new Set([23, 35, 46, 59]);
    // Suit games reach at most x18 (with 11, game, hand and five more
    // levels), Grand x11.
    [9, 10, 11, 12].forEach((b) => { for (let m = 2; m <= 18; m++) v.add(b * m); });
    for (let m = 2; m <= 11; m++) v.add(24 * m);
    return Array.from(v).filter((x) => x >= 18).sort((a, b) => a - b);
  })();

  function newDeck() {
    const d = [];
    SUITS.forEach((suit) => RANKS.forEach((rank) => d.push({ rank, suit })));
    return d;
  }

  function shuffle(a, rng) {
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  const same = (a, b) => a.rank === b.rank && a.suit === b.suit;
  const pointsOf = (cards) => cards.reduce((t, c) => t + POINTS[c.rank], 0);

  /*** Card order in a game ***/

  function isTrump(game, c) {
    if (!game || game.type === "null") return false;
    if (c.rank === 11) return true;
    return game.type !== "grand" && c.suit === game.type;
  }

  // The group a card belongs to for following suit: "T" for trumps,
  // else its suit.
  function followGroup(game, c) {
    return isTrump(game, c) ? "T" : c.suit;
  }

  const JACK_ORDER = { C: 4, S: 3, H: 2, D: 1 };
  const PLAIN_ORDER = { 14: 7, 10: 6, 13: 5, 12: 4, 11: 3.5, 9: 3, 8: 2, 7: 1 };
  const NULL_ORDER = { 14: 8, 13: 7, 12: 6, 11: 5, 10: 4, 9: 3, 8: 2, 7: 1 };

  // Strength of a card within the trick, given the group led.
  function strength(game, c, ledGroup) {
    if (game.type === "null") return c.suit === ledGroup ? NULL_ORDER[c.rank] : 0;
    if (isTrump(game, c)) return c.rank === 11 ? 200 + JACK_ORDER[c.suit] : 100 + PLAIN_ORDER[c.rank];
    return c.suit === ledGroup ? PLAIN_ORDER[c.rank] : 0;
  }

  function trickWinner(game, trick) {
    const led = followGroup(game, trick[0].card);
    let best = 0;
    for (let i = 1; i < trick.length; i++) {
      if (strength(game, trick[i].card, led) > strength(game, trick[best].card, led)) best = i;
    }
    return trick[best].player;
  }

  // Trumps from the highest down, for counting matadors.
  function trumpLadder(game) {
    const jacks = ["C", "S", "H", "D"].map((s) => ({ rank: 11, suit: s }));
    if (game.type === "grand") return jacks;
    return jacks.concat([14, 10, 13, 12, 9, 8, 7].map((r) => ({ rank: r, suit: game.type })));
  }

  // Matadors: "with n" (counted from the Jack of Clubs while present)
  // or "without n" (missing ones from the top). { with: bool, count }.
  function matadors(game, cards) {
    const ladder = trumpLadder(game);
    const has = (c) => cards.some((x) => same(x, c));
    const first = has(ladder[0]);
    let n = 0;
    while (n < ladder.length && has(ladder[n]) === first) n++;
    return { with: first, count: n };
  }

  function nullValue(game) {
    if (game.ouvert) return game.hand ? NULL_VALUE.ouvertHand : NULL_VALUE.ouvert;
    return game.hand ? NULL_VALUE.hand : NULL_VALUE.plain;
  }

  // Game value for given cards of the declarer (hand + skat) and the
  // outcome so far (schneider / schwarz reached).
  function gameValue(game, cards12, reached) {
    if (game.type === "null") return nullValue(game);
    const m = matadors(game, cards12).count;
    const r = reached || {};
    const level = m + 1 + (game.hand ? 1 : 0) + (r.schneider ? 1 : 0) + (game.schneider ? 1 : 0) +
      (r.schwarz ? 1 : 0) + (game.schwarz ? 1 : 0) + (game.ouvert ? 1 : 0);
    return level * BASE[game.type];
  }

  /*** Deal and bidding ***/

  function seats(dealer) {
    return { vorhand: (dealer + 1) % 3, mittelhand: (dealer + 2) % 3, hinterhand: dealer };
  }

  function deal(dealer, rng) {
    const d = shuffle(newDeck(), rng);
    const hands = [d.slice(0, 10), d.slice(10, 20), d.slice(20, 30)];
    const st = seats(dealer);
    return {
      dealer, hands, skat: d.slice(30, 32), phase: "bid",
      bidding: { stage: 1, bidder: st.mittelhand, listener: st.vorhand, bid: 0, waiting: "bid", passed: [false, false, false] },
      declarer: -1, game: null, bid: 0, handGame: false, declarerCards: null, discarded: null,
      trick: [], turn: -1, tricks: [[], [], []], trickCount: [0, 0, 0], lastTrick: null, voids: [{}, {}, {}], result: null, played: []
    };
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function nextBid(bid) { return BID_VALUES.find((v) => v > bid); }

  // Who has to act in the bidding and how: { player, kind: "bid" | "answer" | "open" }.
  function bidTurn(s) {
    const b = s.bidding;
    if (s.phase !== "bid") return null;
    if (b.waiting === "open") return { player: seats(s.dealer).vorhand, kind: "open" };
    return b.waiting === "bid" ? { player: b.bidder, kind: "bid" } : { player: b.listener, kind: "answer" };
  }

  function becomeDeclarer(s, p) {
    s.declarer = p;
    s.bid = Math.max(s.bidding.bid, 18);
    s.phase = "skat";
  }

  // action: "bid" (with value), "hold", "pass". "open": "bid" means play
  // at 18, "pass" passes the deal in.
  function bidAction(s0, action, value) {
    const t = bidTurn(s0);
    if (!t) return null;
    const s = clone(s0);
    const b = s.bidding;
    const st = seats(s.dealer);
    if (t.kind === "open") {
      if (action === "bid") becomeDeclarer(s, st.vorhand);
      else if (action === "pass") { s.phase = "over"; s.result = { passedIn: true, deltas: [0, 0, 0] }; }
      else return null;
      return s;
    }
    if (t.kind === "bid") {
      if (action === "bid") {
        if (BID_VALUES.indexOf(value) === -1 || value <= b.bid) return null;
        b.bid = value;
        b.waiting = "answer";
        return s;
      }
      if (action !== "pass") return null;
      b.passed[b.bidder] = true;
      if (b.stage === 1) {
        b.stage = 2;
        const survivor = b.listener;
        b.bidder = st.hinterhand; b.listener = survivor; b.waiting = "bid";
      } else {
        // Hinterhand passes: the listener plays, unless nobody bid yet.
        if (b.bid === 0) {
          if (b.listener === st.vorhand && !b.passed[st.vorhand]) b.waiting = "open";
          else becomeDeclarer(s, b.listener);
        } else becomeDeclarer(s, b.listener);
      }
      return s;
    }
    // answer
    if (action === "hold") { b.waiting = "bid"; return s; }
    if (action !== "pass") return null;
    b.passed[b.listener] = true;
    if (b.stage === 1) {
      b.stage = 2;
      const survivor = b.bidder;
      b.bidder = st.hinterhand; b.listener = survivor; b.waiting = "bid";
    } else {
      becomeDeclarer(s, b.bidder);
    }
    return s;
  }

  /*** Skat, discard, announcement ***/

  function takeSkat(s0) {
    if (s0.phase !== "skat") return null;
    const s = clone(s0);
    s.hands[s.declarer] = s.hands[s.declarer].concat(s.skat);
    s.declarerCards = s.hands[s.declarer].slice();
    s.handGame = false;
    s.phase = "discard";
    return s;
  }

  function playHand(s0) {
    if (s0.phase !== "skat") return null;
    const s = clone(s0);
    s.declarerCards = s.hands[s.declarer].concat(s.skat);
    s.handGame = true;
    s.discarded = s.skat.slice();
    s.phase = "announce";
    return s;
  }

  function discard(s0, two) {
    if (s0.phase !== "discard" || !two || two.length !== 2 || same(two[0], two[1])) return null;
    const hand = s0.hands[s0.declarer];
    if (!two.every((c) => hand.some((x) => same(x, c)))) return null;
    const s = clone(s0);
    s.hands[s.declarer] = hand.filter((x) => !two.some((c) => same(c, x)));
    s.discarded = two.map((c) => ({ rank: c.rank, suit: c.suit }));
    s.phase = "announce";
    return s;
  }

  // Which announcements are allowed: game = { type, schneider, schwarz, ouvert }.
  function announceProblem(s, game) {
    if (s.phase !== "announce") return "phase";
    const types = ["C", "S", "H", "D", "grand", "null"];
    if (types.indexOf(game.type) === -1) return "type";
    if (game.type === "null") {
      if (game.schneider || game.schwarz) return "null-extras";
      const v = nullValue({ type: "null", hand: s.handGame, ouvert: !!game.ouvert });
      if (v < s.bid) return "null-too-low";
      return null;
    }
    if ((game.schneider || game.schwarz || game.ouvert) && !s.handGame) return "needs-hand";
    if (game.schwarz && !game.schneider) return "schwarz-needs-schneider";
    if (game.ouvert && !(game.schwarz && game.schneider)) return "ouvert-needs-schwarz";
    return null;
  }

  function announce(s0, g) {
    const game = { type: g.type, hand: s0.handGame, schneider: !!g.schneider, schwarz: !!g.schwarz, ouvert: !!g.ouvert };
    if (game.ouvert && game.type !== "null") { game.schneider = true; game.schwarz = true; }
    if (announceProblem(s0, game)) return null;
    const s = clone(s0);
    s.game = game;
    s.phase = "play";
    s.turn = seats(s.dealer).vorhand;
    s.trick = [];
    return s;
  }

  /*** Play ***/

  function legalCards(s, p) {
    const hand = s.hands[p];
    if (s.phase !== "play" || s.turn !== p) return [];
    if (!s.trick.length) return hand.slice();
    const led = followGroup(s.game, s.trick[0].card);
    const follow = hand.filter((c) => followGroup(s.game, c) === led);
    return follow.length ? follow : hand.slice();
  }

  function playCard(s0, card) {
    const p = s0.turn;
    if (!legalCards(s0, p).some((c) => same(c, card))) return null;
    const s = clone(s0);
    if (s.trick.length) {
      const led = followGroup(s.game, s.trick[0].card);
      if (followGroup(s.game, card) !== led) s.voids[p][led] = true;
    }
    s.hands[p] = s.hands[p].filter((c) => !same(c, card));
    s.trick.push({ player: p, card: { rank: card.rank, suit: card.suit } });
    s.played.push({ player: p, card: { rank: card.rank, suit: card.suit } });
    if (s.trick.length < 3) { s.turn = (p + 1) % 3; return s; }
    const w = trickWinner(s.game, s.trick);
    s.trick.forEach((e) => s.tricks[w].push(e.card));
    s.trickCount[w]++;
    s.lastTrick = { cards: s.trick, winner: w };
    s.trick = [];
    s.turn = w;
    const done = s.hands.every((h) => h.length === 0);
    // A Null game is lost at once when the declarer takes a trick.
    if (s.game.type === "null" && w === s.declarer) finish(s);
    else if (done) finish(s);
    return s;
  }

  // The outcome of a game from its facts: eyes = the declarer's points
  // (tricks + skat), tricks taken by each side. Returns { won, value,
  // schneider, schwarz, overbid, delta } (delta for the declarer).
  function score(game, cards12, bid, eyes, declarerTricks, defenderTricks) {
    let won, value, schneider = false, schwarz = false, overbid = false;
    if (game.type === "null") {
      won = declarerTricks === 0;
      value = nullValue(game);
    } else {
      schneider = eyes >= 90 || eyes <= 30;
      schwarz = defenderTricks === 0 || declarerTricks === 0;
      won = eyes >= 61;
      if (game.schneider && eyes < 90) won = false;
      if (game.schwarz && defenderTricks > 0) won = false;
      value = gameValue(game, cards12, { schneider, schwarz });
      if (value < bid) {
        overbid = true;
        won = false;
        value = Math.ceil(bid / BASE[game.type]) * BASE[game.type];
      }
    }
    return { won, value, schneider, schwarz, overbid, delta: won ? value : -2 * value };
  }

  function finish(s) {
    const d = s.declarer, g = s.game;
    const defTricks = s.trickCount[(d + 1) % 3] + s.trickCount[(d + 2) % 3];
    const eyes = g.type === "null" ? null : pointsOf(s.tricks[d]) + pointsOf(s.discarded);
    const r = score(g, s.declarerCards, s.bid, eyes, s.trickCount[d], defTricks);
    const deltas = [0, 0, 0];
    deltas[d] = r.delta;
    s.result = {
      won: r.won, value: r.value, eyes, defenderEyes: eyes === null ? null : 120 - eyes, schneider: r.schneider, schwarz: r.schwarz,
      overbid: r.overbid, deltas, matadors: g.type === "null" ? null : matadors(g, s.declarerCards), tricksDeclarer: s.trickCount[d]
    };
    s.phase = "over";
    s.turn = -1;
  }

  // Name of a game for display, e.g. "Hearts Hand", "Null Ouvert".
  function gameName(game) {
    const base = { C: "Clubs", S: "Spades", H: "Hearts", D: "Diamonds", grand: "Grand", null: "Null" }[game.type];
    const parts = [base];
    if (game.ouvert) parts.push("Ouvert");
    if (game.hand) parts.push("Hand");
    if (game.type !== "null" && !game.ouvert) {
      if (game.schwarz) parts.push("Schwarz announced");
      else if (game.schneider) parts.push("Schneider announced");
    }
    return parts.join(" ");
  }

  return {
    SUITS, RANKS, POINTS, BASE, NULL_VALUE, BID_VALUES, newDeck, shuffle, same, pointsOf, isTrump, followGroup, strength,
    trickWinner, matadors, gameValue, nullValue, seats, deal, nextBid, bidTurn, bidAction, takeSkat, playHand, discard,
    announceProblem, announce, legalCards, playCard, gameName, trumpLadder, score
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SkatCore;
}
if (typeof window !== "undefined") {
  window.SkatCore = SkatCore;
}
