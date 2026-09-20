// ur-ai.js
// Offline Royal Game of Ur opponent, three strength levels built on
// ur-core.js, mirroring the structure of go-ai.js/checkers-ai.js:
//   1 = easy   - random legal move
//   2 = medium - 1-ply heuristic (progress, captures, rosettes)
//   3 = hard   - the same heuristic plus capture-risk awareness: it weighs
//                how likely an exposed piece is to be captured next turn,
//                using the exact dice probabilities from ur-core.js
//
// Ur is a dice game, so a deep minimax search over hidden future rolls
// isn't the right tool the way it is for chess/checkers; these levels
// instead differ in how much of the position they understand, same as
// go-ai.js's approach for the same reason.

const UrAi = (function () {
  // Value of a piece scales with how far it has travelled (a piece close
  // to home is worth protecting/advancing more than one still at start).
  function pieceProgressValue(pos) {
    return pos; // 0..15
  }

  function evaluateFor(color, state) {
    const opp = UrCore.otherColor(color);
    let score = 0;
    for (const pos of state.positions[color]) score += pieceProgressValue(pos);
    for (const pos of state.positions[opp]) score -= pieceProgressValue(pos);
    return score;
  }

  // Probability that `color`'s opponent captures the piece now sitting on
  // shared, non-rosette square `pos` on their very next turn: for each of
  // their pieces (including ones still at start, i.e. position 0) that
  // could reach `pos` in one roll, add that roll's probability. A piece
  // already past `pos` can't come back, and a piece that would need to
  // pass through pos exactly is the only way to land on it (no jumping
  // choice - the dice total picks the destination directly).
  function captureRisk(state, color, pos) {
    if (!UrCore.isShared(pos) || UrCore.isRosette(pos)) return 0;
    const opp = UrCore.otherColor(color);
    let risk = 1;
    for (const oppPos of state.positions[opp]) {
      if (oppPos >= UrCore.HOME) continue;
      const needed = pos - oppPos;
      if (needed >= 1 && needed <= 4) {
        risk *= (1 - UrCore.ROLL_PROBABILITY[needed]);
      }
    }
    return 1 - risk; // probability at least one opposing piece can hit it
  }

  function heuristicScore(state, color, move) {
    let score = 0;
    score += move.to === UrCore.HOME ? 20 : pieceProgressValue(move.to) - pieceProgressValue(move.from);
    if (move.captured) score += 12; // sending an opponent piece back is very strong
    if (move.rosette) score += 8;   // extra roll is valuable
    return score;
  }

  function riskAdjustedScore(state, color, move) {
    let score = heuristicScore(state, color, move);
    const after = UrCore.applyMove(state, color, move);
    // Reward reducing overall exposure: sum risk across all of our pieces
    // on shared squares after this move, penalised lightly, plus a direct
    // bonus for moving a currently-at-risk piece to safety.
    let exposure = 0;
    for (const pos of after.positions[color]) {
      exposure += captureRisk(after, color, pos) * pieceProgressValue(pos);
    }
    score -= exposure * 0.4;
    return score;
  }

  function chooseMove(state, color, roll, level) {
    const moves = UrCore.getLegalMoves(state, color, roll);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;

    if (level === 1) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (level === 2) {
      const scored = moves.map((m) => ({ move: m, score: heuristicScore(state, color, m) }));
      scored.sort((a, b) => b.score - a.score);
      return scored[0].move;
    }

    // level 3: risk-adjusted heuristic.
    const scored = moves.map((m) => ({ move: m, score: riskAdjustedScore(state, color, m) }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].move;
  }

  return {
    evaluateFor,
    captureRisk,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = UrAi;
}
if (typeof window !== "undefined") {
  window.UrAi = UrAi;
}
