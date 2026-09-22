// sternhalma-ai.js
// Offline opponent for Chinese Checkers, mirroring the structure used
// elsewhere in this app (see halma-ai.js, the closest relative - this
// is the same "pure race" family of game, just on a star board):
//   1 = easy   - random legal move
//   2 = medium - 1-ply evaluation with light randomness among the
//                best few
//   3 = hard   - the same 1-ply evaluation, always taking the single
//                best-scoring move (ties broken at random)
//
// Like Halma, Chinese Checkers has no material to fight over - it's
// a pure race - so the evaluation is each player's total remaining
// travel distance to their goal point: for every marble, the cube
// distance (the number of hop-length steps on the triangular
// lattice) to the nearest empty-or-any hole of that player's goal
// point. A lower total is better. Because the score is computed on
// the position AFTER the candidate move, a move that chains several
// hops to cover a lot of ground scores exactly as well as the
// distance it actually closes - so the same 1-ply comparison used
// for single steps automatically seeks out long jump chains too,
// without any separate "look for a jump" logic.

const SternhalmaAi = (function () {
  const INF = 1e9;

  function cubeDistance(a, b) {
    return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  }

  // A marble already resting on one of its own goal holes counts as
  // distance 0; every other marble counts its distance to the
  // nearest still-EMPTY goal hole, not just the nearest goal hole in
  // general - once the target point starts filling up, "nearest goal
  // hole" alone would often point at a hole one of the player's own
  // marbles already occupies, understating how far the last few
  // marbles actually still have to travel to reach one of the few
  // genuinely open slots left (same reasoning as HalmaAi).
  function totalDistanceToGoal(board, player) {
    const goalCells = SternhalmaCore.goalPointCells(player);
    const emptyGoalCells = goalCells.filter((c) => !board[SternhalmaCore.key(c[0], c[1], c[2])]);
    const targets = emptyGoalCells.length ? emptyGoalCells : goalCells;
    let total = 0;
    SternhalmaCore.ALL_CELLS.forEach((cell) => {
      const k = SternhalmaCore.key(cell[0], cell[1], cell[2]);
      if (board[k] !== player) return;
      const onGoal = goalCells.some((g) => g[0] === cell[0] && g[1] === cell[1] && g[2] === cell[2]);
      if (onGoal) return;
      let best = INF;
      targets.forEach((g) => {
        const d = cubeDistance(cell, g);
        if (d < best) best = d;
      });
      total += best;
    });
    return total;
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      return state.winner === side ? INF / 2 : -INF / 2;
    }
    const opp = SternhalmaCore.otherPlayer(side);
    const myDist = totalDistanceToGoal(state.board, side);
    const oppDist = totalDistanceToGoal(state.board, opp);
    return (oppDist - myDist) * 5;
  }

  function candidateScore(state, player, move) {
    const next = SternhalmaCore.applyMove(state, player, move);
    return evaluateFor(player, next);
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 3 },
    3: { style: "best" }
  };

  // Moving a marble back into your OWN home point is never useful
  // (it undoes progress a marble may have made, or delays a marble
  // that was never going to help). Purely random play has no sense
  // of that, so without this a random game could wander for a very
  // long time before a full point empties out by chance alone - see
  // the identical reasoning in HalmaAi.
  function filterOutRetreatsIntoOwnHome(state, side, moves) {
    const home = SternhalmaCore.homePointCells(side).map((c) => c.join(","));
    const forward = moves.filter((m) => home.indexOf(m.to.join(",")) === -1);
    return forward.length ? forward : moves;
  }

  function chooseMove(state, side, level) {
    const moves = SternhalmaCore.getLegalMoves(state, side);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      const candidates = filterOutRetreatsIntoOwnHome(state, side, moves);
      // Pick uniformly among MARBLES first, then among that marble's
      // moves - a marble deep in a crowded point naturally has far
      // fewer legal moves than one out in the open, so sampling
      // flatly over every move would rarely pick it and could leave
      // it stranded for a very long time (same reasoning as
      // HalmaAi's "easy" level).
      const byPiece = {};
      candidates.forEach((m) => {
        const from = m.from.join(",");
        (byPiece[from] = byPiece[from] || []).push(m);
      });
      const pieceKeys = Object.keys(byPiece);
      const chosenKey = pieceKeys[Math.floor(Math.random() * pieceKeys.length)];
      const pieceMoves = byPiece[chosenKey];
      return pieceMoves[Math.floor(Math.random() * pieceMoves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({ move: m, score: candidateScore(state, side, m) }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    // "best": like Halma, this game has no tactics to look ahead for
    // - no captures, no forks, nothing one side does directly
    // threatens the other - it's a pure race, so a multi-ply search
    // over the opponent's reply doesn't earn its keep here. A plain
    // 1-ply best-of-every-legal-move greedy, breaking ties at
    // random, reliably keeps closing the distance instead, and
    // naturally prefers a long jump chain over a short one whenever
    // the chain actually closes more distance (see the module
    // comment above).
    const scored = moves.map((m) => ({ move: m, score: candidateScore(state, side, m) }));
    scored.sort((a, b) => b.score - a.score);
    const bestScore = scored[0].score;
    const bestMoves = scored.filter((e) => e.score === bestScore);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
  }

  return { evaluateFor, totalDistanceToGoal, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SternhalmaAi;
}
if (typeof window !== "undefined") {
  window.SternhalmaAi = SternhalmaAi;
}
