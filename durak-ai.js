// durak-ai.js
// Computer player for Durak (see durak-core.js), three levels:
//   1 (easy)   - beats with the lowest card that works, leads its lowest
//                card, throws in at random.
//   2 (medium) - keeps its trumps back: leads and throws low plain cards,
//                and would rather take the cards than spend a high trump
//                while the stock is still large.
//   3 (hard)   - like medium, and also counts the cards that have left the
//                game, so it knows which higher trumps are still out
//                there and spends a trump more readily once it is the
//                strongest one left.

const DurakAi = (function () {
  const C = typeof DurakCore !== "undefined" ? DurakCore : require("./durak-core.js");

  function strength(card, trump) {
    return card.rank + (card.suit === trump ? 20 : 0);
  }

  function lowest(cards, trump) {
    return cards.slice().sort((a, b) => strength(a, trump) - strength(b, trump))[0];
  }

  // Higher trumps than `card` that neither the player holds nor have left
  // the game (hard level only).
  function unseenHigherTrumps(s, p, card) {
    let n = 0;
    for (let r = card.rank + 1; r <= 14; r++) {
      const c = { rank: r, suit: s.trumpSuit };
      const gone = s.discardSeen.some((d) => C.sameCard(d, c)) || s.hands[p].some((d) => C.sameCard(d, c)) ||
        s.table.some((pair) => C.sameCard(pair.attack, c) || C.sameCard(pair.defense, c));
      if (!gone) n++;
    }
    return n;
  }

  function chooseMove(s, level, rng) {
    const random = rng || Math.random;
    const p = s.actor;
    const trump = s.trumpSuit;
    const hand = s.hands[p];
    const moves = C.legalMoves(s);

    if (s.phase === "lead") {
      if (level <= 1) return { type: "lead", card: lowest(hand, trump) };
      // Lowest plain card; lead a pair's rank when there is one.
      const plain = hand.filter((c) => c.suit !== trump);
      const pool = plain.length ? plain : hand;
      const counts = {};
      pool.forEach((c) => { counts[c.rank] = (counts[c.rank] || 0) + 1; });
      const pairs = pool.filter((c) => counts[c.rank] >= 2 && c.rank <= 10);
      return { type: "lead", card: lowest(pairs.length ? pairs : pool, trump) };
    }

    if (s.phase === "defend") {
      const defends = moves.filter((m) => m.type === "defend").map((m) => m.card);
      const transfers = moves.filter((m) => m.type === "transfer").map((m) => m.card);
      if (level >= 2 && transfers.length) {
        const t = lowest(transfers, trump);
        if (t.suit !== trump && t.rank <= 11) return { type: "transfer", card: t };
      }
      if (!defends.length) return { type: "take" };
      const pick = lowest(defends, trump);
      if (level <= 1) return { type: "defend", card: pick };
      const bigStock = s.stock.length > 8;
      if (pick.suit === trump && pick.rank >= 12 && bigStock) {
        if (level >= 3 && unseenHigherTrumps(s, p, pick) === 0 && s.table.length >= 3) return { type: "defend", card: pick };
        return { type: "take" };
      }
      // Several cards still to beat and only trumps would do it: take
      // while the stock is large.
      if (pick.suit === trump && bigStock && s.table.filter((x) => !x.defense).length > 1) return { type: "take" };
      return { type: "defend", card: pick };
    }

    if (s.phase === "throw") {
      const throws = moves.filter((m) => m.type === "throw").map((m) => m.card);
      if (!throws.length) return { type: "pass" };
      if (level <= 1) {
        return random() < 0.5 ? { type: "throw", card: throws[Math.floor(random() * throws.length)] } : { type: "pass" };
      }
      const endgame = s.stock.length === 0;
      const cheap = throws.filter((c) => c.suit !== trump && (c.rank <= 11 || endgame || s.taking));
      if (cheap.length) return { type: "throw", card: lowest(cheap, trump) };
      if (endgame && level >= 3) return { type: "throw", card: lowest(throws, trump) };
      return { type: "pass" };
    }
    return moves[0] || { type: "pass" };
  }

  return { chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DurakAi;
}
if (typeof window !== "undefined") {
  window.DurakAi = DurakAi;
}
