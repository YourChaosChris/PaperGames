// domino-ai.js
// Computer players for Domino, three levels:
//   1 (easy)   - any legal move, at random.
//   2 (medium) - gets rid of doubles first (they only fit one number, so
//                they're the easiest tiles to get stuck with), then the
//                tile with the most pips (fewer pips left if the line
//                blocks).
//   3 (hard)   - like medium, but also remembers which numbers each
//                opponent was seen unable to play (DominoCore keeps that
//                in state.missing) and prefers leaving those numbers on
//                the open ends, above all against the next player.
// Drawing and passing aren't choices in this ruleset, so the only
// decision is which tile goes on which end.

const DominoAi = (function () {
  function core() {
    return typeof DominoCore !== "undefined" ? DominoCore : require("./domino-core.js");
  }

  function mediumScore(C, tile) {
    return (C.isDouble(tile) ? 100 : 0) + C.pips(tile);
  }

  // Open ends after playing `move`.
  function endsAfter(C, state, move) {
    return C.openEnds(C.applyMove(state, move.index, move.side).state);
  }

  function hardScore(C, state, move) {
    const player = state.turn;
    const tile = state.hands[player][move.index];
    let score = mediumScore(C, tile);
    const ends = endsAfter(C, state, move);
    if (!ends) return score;
    for (let k = 1; k < state.numPlayers; k++) {
      const opp = (player + k) % state.numPlayers;
      const weight = k === 1 ? 60 : 25;
      const missing = state.missing[opp] || [];
      if (missing.indexOf(ends.left) !== -1) score += weight;
      if (missing.indexOf(ends.right) !== -1) score += weight;
    }
    // Keep numbers we still hold on the ends, so we can follow up.
    const rest = state.hands[player].filter((t, i) => i !== move.index);
    if (rest.some((t) => t[0] === ends.left || t[1] === ends.left)) score += 8;
    if (rest.some((t) => t[0] === ends.right || t[1] === ends.right)) score += 8;
    return score;
  }

  function chooseMove(state, level, rng) {
    const C = core();
    const random = rng || Math.random;
    const moves = C.legalMoves(state, state.turn);
    if (!moves.length) return null;
    if (level <= 1) return moves[Math.floor(random() * moves.length)];
    let best = null;
    let bestScore = -Infinity;
    moves.forEach((m) => {
      const tile = state.hands[state.turn][m.index];
      // Small random tie-breaker so equal choices don't always look alike.
      const s = (level >= 3 ? hardScore(C, state, m) : mediumScore(C, tile)) + random() * 0.5;
      if (s > bestScore) { bestScore = s; best = m; }
    });
    return best;
  }

  return { chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DominoAi;
}
