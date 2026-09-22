// halma-ai.js
// Offline opponent for Halma, mirroring the structure used elsewhere
// in this app:
//   1 = easy   - random legal move
//   2 = medium - 1-ply evaluation with light randomness among the
//                best few
//   3 = hard   - the same 1-ply evaluation, always taking the single
//                best-scoring move (ties broken at random) - see the
//                "best" branch of chooseMove for why a deeper search
//                doesn't actually help here.
//
// Halma has no material to fight over - it's a pure race - so the
// evaluation is simply each player's total remaining travel distance
// to their goal camp: for every piece, the Chebyshev distance (the
// number of king-move steps, since Halma pieces move like a chess
// king) to the nearest empty-or-any cell of that player's goal camp.
// A lower total is better; a jump-heavy move that closes a lot of
// distance in one turn scores well here, encouraging the AI to chain
// jumps the way strong human play does.

const HalmaAi = (function () {
  const INF = 1e9;

  function chebyshev(r1, c1, r2, c2) {
    return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
  }

  // A piece already resting on one of its own goal cells counts as
  // distance 0; every other piece counts its distance to the nearest
  // still-EMPTY goal cell, not just the nearest goal cell in general -
  // once the camp starts filling up, "nearest goal cell" alone would
  // often point at a cell one of the player's own pieces already
  // occupies, understating how far the last few pieces actually still
  // have to travel to reach one of the few genuinely open slots left.
  function totalDistanceToGoal(board, player) {
    const goalCells = HalmaCore.goalCampCells(player);
    const emptyGoalCells = goalCells.filter(([r, c]) => !board[r][c]);
    let total = 0;
    for (let r = 0; r < HalmaCore.SIZE; r++) {
      for (let c = 0; c < HalmaCore.SIZE; c++) {
        if (board[r][c] !== player) continue;
        const onGoal = goalCells.some(([gr, gc]) => gr === r && gc === c);
        if (onGoal) continue;
        let best = INF;
        (emptyGoalCells.length ? emptyGoalCells : goalCells).forEach(([gr, gc]) => {
          const d = chebyshev(r, c, gr, gc);
          if (d < best) best = d;
        });
        total += best;
      }
    }
    return total;
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      return state.winner === side ? INF / 2 : -INF / 2;
    }
    const opp = HalmaCore.otherPlayer(side);
    const myDist = totalDistanceToGoal(state.board, side);
    const oppDist = totalDistanceToGoal(state.board, opp);
    return (oppDist - myDist) * 5;
  }

  function candidateScore(state, player, move) {
    const next = HalmaCore.applyMove(state, player, move);
    return evaluateFor(player, next);
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 3 },
    3: { style: "best" }
  };

  // Moving a piece back into your OWN home camp is never useful (it
  // undoes progress a piece may have already made, or delays a piece
  // that was never going to help). Purely random play has no sense of
  // that, so without this a random game can - unlike every other
  // game here, since Halma has no captures to force the pace - take
  // a very long time for a full camp to empty out by chance alone.
  // Filtering these out (when some other legal move exists) keeps
  // "easy" weak and undirected everywhere else while still assuring
  // real forward progress.
  function filterOutRetreatsIntoOwnCamp(state, side, moves) {
    const isOwnCamp = side === "p1" ? HalmaCore.isCampP1 : HalmaCore.isCampP2;
    const forward = moves.filter((m) => !isOwnCamp(m.to[0], m.to[1]));
    return forward.length ? forward : moves;
  }

  function chooseMove(state, side, level) {
    const moves = HalmaCore.getLegalMoves(state, side);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      const candidates = filterOutRetreatsIntoOwnCamp(state, side, moves);
      // Pick uniformly among PIECES first, then among that piece's
      // moves - a piece near a crowded corner naturally has far fewer
      // legal moves than one out in the open, so sampling flatly over
      // every move would rarely ever pick it and could leave it
      // stranded for a very long time (this is what "random" means to
      // a beginner picking a piece to move, and unlike every other
      // game here Halma has no captures to force such a piece's hand).
      const byPiece = {};
      candidates.forEach((m) => {
        const key = m.from.join(",");
        (byPiece[key] = byPiece[key] || []).push(m);
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

    // "best": Halma has no tactics to look ahead for - no captures,
    // no forks, nothing one side does directly threatens the other -
    // it's a pure race, so a multi-ply search over the opponent's
    // reply doesn't earn its keep here. Worse, capping candidates
    // per node while also modeling the opponent's (especially a weak,
    // undirected) reply was measured to actively mislead deeper
    // search into picking a move that scores well two plies out but
    // makes zero real progress this turn, occasionally stalling for
    // a hundred-plus plies against a weak opponent's unpredictable
    // play. A plain 1-ply best-of-every-legal-move greedy, breaking
    // ties at random, reliably keeps closing the distance instead.
    const scored = moves.map((m) => ({ move: m, score: candidateScore(state, side, m) }));
    scored.sort((a, b) => b.score - a.score);
    const bestScore = scored[0].score;
    const bestMoves = scored.filter((e) => e.score === bestScore);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
  }

  return { evaluateFor, totalDistanceToGoal, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HalmaAi;
}
if (typeof window !== "undefined") {
  window.HalmaAi = HalmaAi;
}
