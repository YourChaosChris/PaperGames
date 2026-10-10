// poker-ai.js
// Computer players for Texas Hold'em (poker-core.js).
//
// No computer ever looks at another player's face-down cards: hand
// strength is estimated only from its own two cards, the shared cards and
// the number of opponents still in the hand, by dealing the unknown cards
// at random many times (Monte Carlo).
//
// Easy mostly checks and calls, folds weak hands now and then and raises
// only with a pair or better. Medium compares its chance of winning with
// the price of calling. Hard does the same with more samples, raises
// strong hands more often and bluffs now and then.

const PokerAi = (function () {
  const C = (typeof PokerCore !== "undefined") ? PokerCore : require("./poker-core.js");

  // Chance (0..1) that `hole` with `board` beats `opponents` random hands.
  function equity(hole, board, opponents, samples, rng) {
    const r = rng || Math.random;
    const known = hole.concat(board);
    const deck = C.newDeck().filter((c) => !known.some((k) => k.rank === c.rank && k.suit === c.suit));
    let score = 0;
    const need = 5 - board.length;
    for (let t = 0; t < samples; t++) {
      // Partial shuffle: only as many cards as needed.
      const take = need + 2 * opponents;
      for (let i = 0; i < take; i++) {
        const j = i + Math.floor(r() * (deck.length - i));
        const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
      }
      const full = board.concat(deck.slice(0, need));
      const mine = C.evaluate(hole.concat(full));
      let best = 0, ties = 0, lost = false;
      for (let o = 0; o < opponents; o++) {
        const opp = C.evaluate([deck[need + 2 * o], deck[need + 2 * o + 1]].concat(full));
        if (opp > mine) { lost = true; break; }
        if (opp === mine) ties++;
        best = Math.max(best, opp);
      }
      if (!lost) score += ties ? 1 / (ties + 1) : 1;
    }
    return score / samples;
  }

  // Returns "fold", "check", "call" or "raise".
  function choose(s, level, rng, opts) {
    const r = rng || Math.random;
    const L = C.legal(s);
    const i = s.toAct, me = s.players[i];
    const opponents = C.inHand(s).length - 1;
    const free = L.check;
    const pot = C.potOf(s);
    const potOdds = L.callAmount / (pot + L.callAmount || 1);
    const pass = () => (free ? "check" : "call");
    if (level <= 1) {
      const sc = C.evaluate(me.hole.concat(s.board));
      const cat = C.categoryOf(sc);
      const pairOrHigh = cat >= 1 || (s.board.length === 0 && Math.max(me.hole[0].rank, me.hole[1].rank) >= 12);
      if (cat >= 2 && L.raise && r() < 0.5) return "raise";
      if (pairOrHigh && L.raise && r() < 0.15) return "raise";
      if (!free && !pairOrHigh && r() < 0.3) return "fold";
      return pass();
    }
    const samples = (opts && opts.samples) || (level >= 3 ? 300 : 120);
    const eq = equity(me.hole, s.board, Math.max(1, opponents), samples, r);
    // A fair share of the pot against this many opponents.
    const fair = 1 / (opponents + 1);
    if (level === 2) {
      if (eq > Math.max(0.6, fair * 1.6) && L.raise) return "raise";
      if (free) return "check";
      return eq >= potOdds + 0.05 ? "call" : "fold";
    }
    // Hard.
    if (eq > Math.max(0.55, fair * 1.5) && L.raise) return r() < 0.85 ? "raise" : pass();
    if (free) {
      // Bluff now and then, more readily against one opponent.
      if (L.raise && r() < (opponents === 1 ? 0.12 : 0.05)) return "raise";
      return "check";
    }
    if (eq >= potOdds) return eq > fair * 1.2 && L.raise && r() < 0.25 ? "raise" : "call";
    if (L.raise && s.street === 3 && opponents === 1 && r() < 0.04) return "raise";
    return "fold";
  }

  return { equity, choose };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PokerAi;
}
if (typeof window !== "undefined") {
  window.PokerAi = PokerAi;
}
