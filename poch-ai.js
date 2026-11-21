// poch-ai.js
// Computer player for Poch (see poch-core.js), three levels.
//
// Betting (Pochen) looks only at the player's own set and the bets so far:
//   1 (easy)   - mostly checks, calls about half the time, rarely raises.
//   2 (medium) - raises with three or four of a kind or a high pair, calls
//                with a middling pair, folds a low pair against a raise.
//   3 (hard)   - like medium, but weighs how many others are still in and
//                folds a weak set earlier against a high bet.
// Leading (third stage) uses what everyone can see: the cards already
// played and the face-up pay card.
//   1 plays any card.
//   2 prefers a card nobody can follow (so it keeps the lead).
//   3 also counts how many of its own cards a chain would shed, and takes
//     the lead-in that empties its hand soonest.

const PochAi = (function () {
  const C = typeof PochCore !== "undefined" ? PochCore : require("./poch-core.js");

  function pick(list, random) {
    return list[Math.floor(random() * list.length)];
  }

  function strength(s, p) {
    const c = s.combos[p];
    if (!c) return 0;
    const high = (C.order(c.rank) - 7) / 7; // 0 for a Seven, 1 for the Ace
    const paySuit = c.key[2] >= 10 ? 0.3 : 0;
    if (c.count === 4) return 6 + high;
    if (c.count === 3) return 4 + high;
    return 1 + 2 * high + paySuit;
  }

  function chooseBet(s, level, random) {
    const legal = C.legalMoves(s);
    const has = (t) => legal.some((m) => m.type === t);
    const p = s.turn, b = s.bet;
    // The move that keeps a player in without raising (a player who cannot pay the call can only fold).
    const stay = has("call") ? { type: "call" } : (has("check") ? { type: "check" } : { type: "fold" });
    if (level === 1) {
      if (has("raise") && random() < 0.15) return { type: "raise" };
      if (has("check")) return { type: "check" };
      return random() < 0.55 && has("call") ? { type: "call" } : { type: "fold" };
    }
    let st = strength(s, p);
    if (level === 3) st -= 0.25 * (b.order.filter((q) => !b.folded[q]).length - 2);
    if (st >= 4 && has("raise")) return { type: "raise" };
    if (st >= 2.6 && has("raise") && b.high <= 1) return { type: "raise" };
    if (st >= 2.2) return stay;
    // A weak pair: stay in for one chip, give up against more.
    const cost = b.high - b.put[p];
    if (has("check")) return { type: "check" };
    const limit = level === 3 ? 1 : 2;
    return cost <= limit && has("call") ? { type: "call" } : { type: "fold" };
  }

  // What a lead-in would do, judged from public cards and the own hand.
  function leadScore(s, p, idx, level) {
    const hand = s.hands[p].slice();
    let card = hand.splice(idx, 1)[0];
    let shed = 1;
    for (;;) {
      if (!hand.length) return 100;
      const nr = C.nextRank(card.rank);
      if (nr === null) return 10 + shed;
      if (C.same(s.payCard, { rank: nr, suit: card.suit }) || s.played.some((c) => c.rank === nr && c.suit === card.suit)) return 10 + shed;
      const own = hand.findIndex((c) => c.rank === nr && c.suit === card.suit);
      if (own < 0) return level === 3 ? shed - 1.5 : 0;
      card = hand.splice(own, 1)[0];
      shed++;
    }
  }

  function chooseLead(s, level, random) {
    const p = s.turn;
    const n = s.hands[p].length;
    const all = [];
    for (let i = 0; i < n; i++) all.push(i);
    if (level === 1) return { type: "lead", card: pick(all, random) };
    let best = -Infinity, ties = [];
    all.forEach((i) => {
      let score = leadScore(s, p, i, level);
      if (level === 2) score = score >= 10 ? 1 : 0;
      if (score > best) { best = score; ties = [i]; } else if (score === best) ties.push(i);
    });
    return { type: "lead", card: pick(ties, random) };
  }

  function chooseMove(s, level, rng) {
    const random = rng || Math.random;
    if (s.phase === "lead") return chooseLead(s, level, random);
    return chooseBet(s, level, random);
  }

  return { chooseMove, strength, leadScore };
})();

if (typeof module !== "undefined" && module.exports) module.exports = PochAi;
