// blackjack-core.js
// "17 and 4" / "Blackjack": you against the bank. Dependency-free, no DOM.
//
// Two variants:
//   "seventeen" - 17 and 4 with 32 cards (7 to Ace): Ace 11, King 4,
//     Queen 3, Jack 2, number cards their value. Two aces as the first
//     two cards ("fire") are the best hand. Equal points: the bank wins.
//   "blackjack" - 52 cards: Ace 1 or 11, picture cards 10, number cards
//     their value. Ace + 10-card as the first two cards is a blackjack and
//     wins 3 to 2 (rounded down). Equal points: you keep your bet.
//     Doubling on the first two cards: twice the bet, exactly one more
//     card. No splitting, no insurance.
// In both, the bank draws up to 16 and stands from 17. Whoever goes over
// 21 has lost. Chips are only points in the game; you start with 100.
// The cards are shuffled anew for every round.

const BlackjackCore = (function () {
  const SUITS = ["C", "S", "H", "D"];
  const START_CHIPS = 100;
  const BETS = [5, 10, 20];

  function newDeck(variant) {
    const ranks = variant === "seventeen" ? [7, 8, 9, 10, 11, 12, 13, 1] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const deck = [];
    SUITS.forEach((suit) => ranks.forEach((rank) => deck.push({ rank, suit })));
    return deck;
  }

  function shuffle(deck, rng) {
    const r = rng || Math.random;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    return deck;
  }

  // Points of one card; in Blackjack an Ace counts 1 here (handValue
  // decides whether it counts 11).
  function cardValue(variant, card) {
    if (variant === "seventeen") {
      if (card.rank === 1) return 11;
      if (card.rank === 13) return 4;
      if (card.rank === 12) return 3;
      if (card.rank === 11) return 2;
      return card.rank;
    }
    if (card.rank === 1) return 1;
    return Math.min(10, card.rank);
  }

  // { total, soft, bust, natural, fire }. soft: an Ace counts 11 and could
  // still count 1. natural: 21 with the first two cards. fire: two aces
  // in 17 and 4 (counts as 21).
  function handValue(variant, cards) {
    let total = 0, aces = 0;
    cards.forEach((c) => { total += cardValue(variant, c); if (c.rank === 1) aces++; });
    let soft = false, fire = false;
    if (variant === "seventeen") {
      if (cards.length === 2 && aces === 2) { fire = true; total = 21; }
    } else if (aces > 0 && total + 10 <= 21) {
      total += 10;
      soft = true;
    }
    return { total, soft, bust: total > 21, natural: cards.length === 2 && total === 21, fire };
  }

  function createGame(variant, chips) {
    return {
      variant: variant === "seventeen" ? "seventeen" : "blackjack",
      chips: typeof chips === "number" ? chips : START_CHIPS,
      deck: [], player: [], bank: [], bet: 0, doubled: false,
      phase: "bet",         // bet -> player -> over (round) ; "broke" when no chips left
      holeHidden: false,    // the bank's second card is face down
      result: null,         // { outcome, delta, reason }
      rounds: 0
    };
  }

  function clone(s) {
    return Object.assign({}, s, { deck: s.deck.slice(), player: s.player.slice(), bank: s.bank.slice(), result: s.result ? Object.assign({}, s.result) : null });
  }

  function canDouble(s) {
    return s.variant === "blackjack" && s.phase === "player" && s.player.length === 2 && !s.doubled && s.chips >= 2 * s.bet;
  }

  // Starts a round: you get two cards, the bank one open and one face
  // down. Blackjack: a 21 with two cards on either side ends the round at
  // once. 17 and 4: fire on either side, or a 21 of the bank, ends it at
  // once; your own 21 stands by itself and the bank plays.
  function startRound(s0, bet, rng) {
    if (s0.phase !== "bet" && s0.phase !== "over") return null;
    if (s0.chips <= 0) return null;
    const s = clone(s0);
    s.bet = Math.max(1, Math.min(bet, s.chips));
    s.doubled = false;
    s.deck = shuffle(newDeck(s.variant), rng);
    s.player = [s.deck.pop(), s.deck.pop()];
    s.bank = [s.deck.pop(), s.deck.pop()];
    s.holeHidden = true;
    s.result = null;
    s.phase = "player";
    s.rounds++;
    const p = handValue(s.variant, s.player), b = handValue(s.variant, s.bank);
    if (s.variant === "blackjack" ? (p.natural || b.natural) : (p.fire || b.fire || b.total === 21)) {
      s.holeHidden = false;
      settle(s);
    } else if (p.total === 21) {
      return stand(s);
    }
    return s;
  }

  function hit(s0) {
    if (s0.phase !== "player") return null;
    const s = clone(s0);
    s.player.push(s.deck.pop());
    const p = handValue(s.variant, s.player);
    if (p.bust) { s.holeHidden = false; settle(s); }
    else if (p.total === 21) return stand(s);
    return s;
  }

  function double(s0) {
    if (!canDouble(s0)) return null;
    const s = clone(s0);
    s.doubled = true;
    s.bet *= 2;
    s.player.push(s.deck.pop());
    if (handValue(s.variant, s.player).bust) { s.holeHidden = false; settle(s); return s; }
    return stand(s);
  }

  // The bank's fixed rule: draw while below 17.
  function bankPlay(s) {
    while (handValue(s.variant, s.bank).total < 17) s.bank.push(s.deck.pop());
  }

  function stand(s0) {
    if (s0.phase !== "player") return null;
    const s = clone(s0);
    s.holeHidden = false;
    bankPlay(s);
    settle(s);
    return s;
  }

  // Decides the round and moves the chips. outcome: "win", "loss" or
  // "push"; reason says why.
  function settle(s) {
    const p = handValue(s.variant, s.player), b = handValue(s.variant, s.bank);
    let outcome, reason, delta;
    if (p.bust) { outcome = "loss"; reason = "bust"; }
    else if (s.variant === "seventeen") {
      if (p.fire && !b.fire) { outcome = "win"; reason = "fire"; }
      else if (b.fire) { outcome = "loss"; reason = "bankfire"; }
      else if (b.bust) { outcome = "win"; reason = "bankbust"; }
      else if (p.total > b.total) { outcome = "win"; reason = "more"; }
      else if (p.total === b.total) { outcome = "loss"; reason = "tie"; }
      else { outcome = "loss"; reason = "less"; }
    } else {
      if (p.natural && b.natural) { outcome = "push"; reason = "bothnatural"; }
      else if (p.natural) { outcome = "win"; reason = "natural"; }
      else if (b.natural) { outcome = "loss"; reason = "banknatural"; }
      else if (b.bust) { outcome = "win"; reason = "bankbust"; }
      else if (p.total > b.total) { outcome = "win"; reason = "more"; }
      else if (p.total === b.total) { outcome = "push"; reason = "tie"; }
      else { outcome = "loss"; reason = "less"; }
    }
    if (outcome === "win") delta = reason === "natural" ? Math.floor(s.bet * 3 / 2) : s.bet;
    else if (outcome === "loss") delta = -s.bet;
    else delta = 0;
    s.chips += delta;
    s.result = { outcome, reason, delta };
    s.phase = s.chips <= 0 ? "broke" : "over";
    return s;
  }

  return { SUITS, START_CHIPS, BETS, newDeck, shuffle, cardValue, handValue, createGame, canDouble, startRound, hit, double, stand, bankPlay };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BlackjackCore;
}
if (typeof window !== "undefined") {
  window.BlackjackCore = BlackjackCore;
}
