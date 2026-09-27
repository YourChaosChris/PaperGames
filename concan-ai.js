// concan-ai.js
// Computer player for Concan (see concan-core.js), three levels:
//   1 (easy)   - lays out whatever melds it finds and discards a random
//                card it can't use.
//   2 (medium) - lays out the biggest melds first and discards the card
//                least likely to help it later (no pair, no neighbour).
//   3 (hard)   - like medium, and never discards a card its opponent could
//                add to one of the opponent's melds on the table - such a
//                card would have to be taken and would bring the opponent
//                closer to eleven.
// chooseMove returns one move at a time; the page calls it until the
// computer has discarded (or won).

const ConcanAi = (function () {
  const C = typeof ConcanCore !== "undefined" ? ConcanCore : require("./concan-core.js");

  function usefulness(card, hand) {
    let score = 0;
    hand.forEach((c) => {
      if (C.sameCard(c, card)) return;
      if (c.rank === card.rank) score += 2;
      if (c.suit === card.suit) {
        const d = Math.abs(C.order(c.rank) - C.order(card.rank));
        if (d === 1) score += 2;
        else if (d === 2) score += 1;
      }
    });
    return score;
  }

  function opponentCanUse(s, p, card) {
    const o = 1 - p;
    return s.melds[o].some((m) => C.extendMeld(m, card));
  }

  function chooseMove(s, level, rng) {
    const random = rng || Math.random;
    const p = s.turn;
    const hand = s.hands[p];

    if (s.phase === "start") {
      return s.mustTakeDiscard ? { type: "takeDiscard" } : { type: "draw" };
    }

    // Lay out the taken card first.
    if (s.taken) {
      const ext = s.melds[p].findIndex((m) => C.extendMeld(m, s.taken));
      if (ext !== -1) return { type: "extend", meld: ext };
      const melds = C.possibleMelds(s, p).filter((m) => !(hand.length - m.cards.length === 0 && C.meldedCount(s, p) + m.meld.cards.length < C.GOAL));
      melds.sort((a, b) => a.cards.length - b.cards.length);
      if (melds.length) return { type: "meld", cards: melds[0].cards };
    }

    // Add hand cards to own melds.
    for (let i = 0; i < s.melds[p].length; i++) {
      for (const card of hand) {
        if (C.extendMeld(s.melds[p][i], card) && (hand.length > 1 || C.meldedCount(s, p) + 1 >= C.GOAL)) {
          return { type: "extend", meld: i, card };
        }
      }
    }

    // New melds from the hand.
    let melds = C.possibleMelds(s, p).filter((m) => hand.length - m.cards.length > 0 || C.meldedCount(s, p) + m.meld.cards.length >= C.GOAL);
    if (melds.length) {
      if (level <= 1) return { type: "meld", cards: melds[Math.floor(random() * melds.length)].cards };
      melds.sort((a, b) => b.cards.length - a.cards.length);
      return { type: "meld", cards: melds[0].cards };
    }

    // Discard.
    let pool = hand.slice();
    if (level >= 3) {
      const safe = pool.filter((c) => !opponentCanUse(s, p, c));
      if (safe.length) pool = safe;
    }
    if (level <= 1) {
      const idle = pool.filter((c) => usefulness(c, hand) === 0);
      const from = idle.length ? idle : pool;
      return { type: "discard", card: from[Math.floor(random() * from.length)] };
    }
    pool.sort((a, b) => usefulness(a, hand) - usefulness(b, hand) || C.order(b.rank) - C.order(a.rank));
    return { type: "discard", card: pool[0] };
  }

  return { chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ConcanAi;
}
if (typeof window !== "undefined") {
  window.ConcanAi = ConcanAi;
}
