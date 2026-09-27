// schwimmen-ai.js
// Computer player for Schwimmen (see schwimmen-core.js), three levels:
//   1 (easy)   - takes an obviously better swap now and then, otherwise
//                passes; knocks on a whim with a fair hand.
//   2 (medium) - always makes the best swap it can see, knocks once its
//                hand is good and further swaps hardly help.
//   3 (hard)   - like medium, but knocks earlier or later depending on how
//                many players are left and how many lives it has, and
//                among equally good swaps leaves the middle as poor as
//                possible for the next player.

const SchwimmenAi = (function () {
  const C = typeof SchwimmenCore !== "undefined" ? SchwimmenCore : require("./schwimmen-core.js");

  // The best-scoring options for the player to move.
  function options(s) {
    const p = s.turn;
    const hand = s.hands[p];
    const list = [{ move: { type: "pass" }, score: C.handScore(hand), table: s.table }];
    for (let h = 0; h < 3; h++) {
      for (let t = 0; t < 3; t++) {
        const nh = hand.slice(); const nt = s.table.slice();
        nh[h] = s.table[t]; nt[t] = hand[h];
        list.push({ move: { type: "swap", hand: h, table: t }, score: C.handScore(nh), table: nt });
      }
    }
    list.push({ move: { type: "swapAll" }, score: C.handScore(s.table), table: hand.slice() });
    return list;
  }

  function tableValue(table) {
    return C.handScore(table);
  }

  function chooseMove(s, level, rng) {
    const random = rng || Math.random;
    const p = s.turn;
    const current = C.handScore(s.hands[p]);
    const opts = options(s);
    const bestScore = Math.max.apply(null, opts.map((o) => o.score));
    const lastTurn = s.knockedBy !== null; // after a knock this is the final turn

    if (level <= 1) {
      if (!lastTurn && C.canKnock(s) && current >= 25 && random() < 0.35) return { type: "knock" };
      if (bestScore > current && random() < 0.7) return opts.find((o) => o.score === bestScore).move;
      if (random() < 0.2) return opts[1 + Math.floor(random() * 9)].move;
      return { type: "pass" };
    }

    const active = C.activePlayers(s).length;
    let threshold = 27;
    if (level >= 3) {
      threshold = active >= 4 ? 25.5 : active === 3 ? 26 : 27;
      if (s.swimming[p]) threshold += 1; // one more loss means out: be careful
      if (s.lives[p] >= 3) threshold -= 0.5;
    }
    if (!lastTurn && C.canKnock(s) && current >= threshold && bestScore - current < 2 && bestScore < 31) {
      return { type: "knock" };
    }
    if (bestScore > current || bestScore === 31) {
      const best = opts.filter((o) => o.score === bestScore && o.move.type !== "pass");
      if (best.length) {
        if (level >= 3) best.sort((a, b) => tableValue(a.table) - tableValue(b.table));
        return best[0].move;
      }
    }
    return { type: "pass" };
  }

  return { chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchwimmenAi;
}
if (typeof window !== "undefined") {
  window.SchwimmenAi = SchwimmenAi;
}
