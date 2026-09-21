// backgammon-ai.js
// Offline backgammon opponent, three strength levels built on
// backgammon-core.js. Unlike the deterministic games elsewhere in this
// app, a turn plays multiple dice one at a time and the next roll is
// unknown, so a deep minimax tree isn't the natural fit (same reasoning
// as ur-ai.js); instead these levels differ in how much positional
// understanding goes into picking each single-die move:
//   1 = easy   - random legal move for the current die
//   2 = medium - greedy 1-ply heuristic (pip progress, hitting, safety)
//   3 = hard   - the same heuristic plus blot-exposure risk, weighing
//                how likely a left-behind checker is to be hit next
//                turn given the real two-dice probabilities

const BackgammonAi = (function () {
  // Number of ways (out of 36) two ordinary dice can cover a gap of
  // exactly n pips, either directly or via an intermediate point,
  // ignoring blocked intermediate points for simplicity (a reasonable
  // approximation for a heuristic AI, not a solved-game engine).
  const HIT_WAYS_36 = { 1: 11, 2: 12, 3: 14, 4: 15, 5: 14, 6: 17, 7: 6, 8: 6, 9: 5, 10: 3, 11: 2, 12: 1 };

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function pipCountFor(state, color) {
    let pips = state.bar[color] * 25;
    for (let p = 1; p <= BackgammonCore.POINTS; p++) {
      const pt = state.points[p];
      if (pt.color === color) pips += BackgammonCore.direction(color) === -1 ? p * pt.count : (25 - p) * pt.count;
    }
    return pips;
  }

  function blotExposure(state, color) {
    // Sum, over every blot of `color`, the chance (out of 36) that the
    // opponent has a checker at the right distance to hit it.
    const opp = otherColor(color);
    let exposure = 0;
    for (let p = 1; p <= BackgammonCore.POINTS; p++) {
      const pt = state.points[p];
      if (pt.color !== color || pt.count !== 1) continue;
      for (let q = 1; q <= BackgammonCore.POINTS; q++) {
        const opt = state.points[q];
        if (opt.color !== opp) continue;
        const dist = BackgammonCore.direction(opp) === -1 ? q - p : p - q;
        if (dist >= 1 && dist <= 12 && HIT_WAYS_36[dist]) exposure += HIT_WAYS_36[dist];
      }
      if (state.bar[opp] > 0 && BackgammonCore.isInHome(color, p)) {
        // Approximate: a checker on the bar can hit anything reachable
        // from its entry points 1-6 combined - just add a flat share
        // when the blot sits in the entering player's target home board.
        exposure += 6;
      }
    }
    return exposure;
  }

  function evaluateFor(color, state) {
    const opp = otherColor(color);
    let score = 0;
    score += (pipCountFor(state, opp) - pipCountFor(state, color)) * 2; // being ahead on pips is good
    score += state.off[color] * 50 - state.off[opp] * 50;
    score += state.bar[opp] * 20 - state.bar[color] * 20;

    // Reward holding points (2+ checkers - safe, and blocks the opponent).
    for (let p = 1; p <= BackgammonCore.POINTS; p++) {
      const pt = state.points[p];
      if (!pt.color) continue;
      const sign = pt.color === color ? 1 : -1;
      if (pt.count >= 2) score += sign * 4;
    }

    score -= blotExposure(state, color) * 0.5;
    score += blotExposure(state, opp) * 0.5;
    return score;
  }

  function chooseMove(state, color, die, level) {
    const moves = BackgammonCore.getLegalMovesForDie(state, color, die);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    if (level === 1) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const scored = moves.map((m) => ({
      move: m,
      score: evaluateFor(color, BackgammonCore.applyMove(state, color, m))
    }));
    scored.sort((a, b) => b.score - a.score);

    if (level === 2) {
      const topN = Math.min(3, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return scored[0].move; // level 3: always take the best-evaluated move
  }

  // Very rough doubling-cube heuristic: a double should be declined once
  // the player's winning chance drops below roughly 25%. Pip count alone
  // is an imperfect proxy for that (it ignores blocking/timing), but a
  // reasonable approximation for a casual, non-tournament AI opponent.
  function shouldAcceptDouble(state, color) {
    const opp = otherColor(color);
    const pipDiff = pipCountFor(state, color) - pipCountFor(state, opp);
    return pipDiff < 16;
  }

  return {
    evaluateFor,
    pipCountFor,
    shouldAcceptDouble,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BackgammonAi;
}
if (typeof window !== "undefined") {
  window.BackgammonAi = BackgammonAi;
}
