// senet-ai.js
// Offline Senet opponent, three strength levels built on senet-core.js.
// Like backgammon and Ur, a turn is driven by an unknown-in-advance
// stick throw, so a deep minimax tree over future rolls isn't the
// natural fit; instead these levels differ in how much positional
// understanding goes into picking which piece to move for the roll
// that was already thrown:
//   1 = easy   - random legal move
//   2 = medium - greedy 1-ply heuristic (progress, captures, safety)
//   3 = hard   - the same heuristic, weighted more heavily against
//                leaving an exposed single piece behind

const SenetAi = (function () {
  function otherPlayer(player) {
    return player === "a" ? "b" : "a";
  }

  function totalProgress(state, player) {
    let total = state.borneOff[player] * SenetCore.BOARD_SIZE;
    state.board.forEach((slot, i) => {
      if (slot.owner === player) total += (i + 1) * slot.count;
    });
    return total;
  }

  function evaluateFor(player, state) {
    const opp = otherPlayer(player);
    let score = totalProgress(state, player) - totalProgress(state, opp);
    score += state.borneOff[player] * 100 - state.borneOff[opp] * 100;

    state.board.forEach((slot, i) => {
      if (!slot.owner) return;
      const sign = slot.owner === player ? 1 : -1;
      if (slot.count >= 2) score += sign * 6;
      else if (i !== SenetCore.HOUSE_OF_REBIRTH) score -= sign * 3;
    });

    return score;
  }

  function chooseMove(state, player, roll, level) {
    const moves = SenetCore.getLegalMoves(state, player, roll);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    if (level === 1) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const weight = level === 3 ? 1.6 : 1;
    const scored = moves.map((from) => {
      const result = SenetCore.applyMove(state, player, from, roll);
      let score = evaluateFor(player, result.state);
      if (result.captured) score += 15 * weight;
      if (result.borneOff) score += 50;
      return { from, score };
    });
    scored.sort((a, b) => b.score - a.score);

    if (level === 2) {
      const topN = Math.min(3, scored.length);
      return scored[Math.floor(Math.random() * topN)].from;
    }

    return scored[0].from; // level 3: always take the best-evaluated move
  }

  return { evaluateFor, totalProgress, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SenetAi;
}
if (typeof window !== "undefined") {
  window.SenetAi = SenetAi;
}
