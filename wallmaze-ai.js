// quoridor-ai.js
// Offline opponent for Quoridor, mirroring the structure used for the
// other strategy games here:
//   1 = easy   - random legal move
//   2 = medium - 1-ply evaluation (shortest-path race + walls left)
//                with light randomness among the best few
//   3 = hard   - iterative deepening alpha-beta, but with the branch
//                list capped to a handful of the most promising moves
//                per node (a full Quoridor turn can offer over a
//                hundred legal wall placements alone - searching all
//                of them several plies deep would blow any node
//                budget before finding anything useful), plus the
//                usual node-budget/wall-clock-deadline safety net.

const QuoridorAi = (function () {
  const INF = 1e9;

  // Positive is good for `side`: being closer to your own goal than
  // your opponent is to theirs is what actually wins Quoridor -
  // material doesn't exist here, it's a pure race complicated by
  // walls, so the evaluation is entirely path-distance based.
  function evaluateFor(side, state) {
    if (state.gameOver) {
      return state.winner === side ? INF / 2 : -INF / 2;
    }
    const opp = QuoridorCore.otherPlayer(side);
    const myDist = QuoridorCore.shortestDistanceToRow(state, state.pawns[side], QuoridorCore.GOAL_ROW[side]);
    const oppDist = QuoridorCore.shortestDistanceToRow(state, state.pawns[opp], QuoridorCore.GOAL_ROW[opp]);
    let score = (oppDist - myDist) * 10;
    score += (state.wallsRemaining[side] - state.wallsRemaining[opp]) * 2;
    return score;
  }

  // A quick, cheap-to-compute score used only to pick which moves are
  // worth exploring further, not the real evaluation.
  function candidateScore(state, player, move) {
    const next = QuoridorCore.applyMove(state, player, move);
    return evaluateFor(player, next);
  }

  function topCandidates(state, player, moves, cap) {
    if (moves.length <= cap) return moves;
    const scored = moves.map((m) => ({ move: m, score: candidateScore(state, player, m) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, cap).map((e) => e.move);
  }

  function minimax(state, playerToMove, depth, maxDepth, alpha, beta, perspective, searchState, branchCap) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget || Date.now() > searchState.deadline) {
        searchState.aborted = true;
        return 0;
      }
    }

    if (state.gameOver) {
      return state.winner === perspective ? INF / 2 - depth : -INF / 2 + depth;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const allMoves = QuoridorCore.getLegalMoves(state, playerToMove);
    const moves = topCandidates(state, playerToMove, allMoves, branchCap);
    const isMaximizing = playerToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const next = QuoridorCore.applyMove(state, playerToMove, m);
      const score = minimax(next, QuoridorCore.otherPlayer(playerToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, branchCap);
      if (searchState && searchState.aborted) return best;
      if (isMaximizing) {
        if (score > best) best = score;
        if (score > alpha) alpha = score;
      } else {
        if (score < best) best = score;
        if (score < beta) beta = score;
      }
      if (beta <= alpha) break;
    }
    return best;
  }

  function searchBestMove(state, side, moves, maxDepth, nodeBudget, timeBudgetMs, branchCap) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let ordered = topCandidates(state, side, moves, branchCap);

    let lastCompleteBest = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const m of ordered) {
        const next = QuoridorCore.applyMove(state, side, m);
        const score = minimax(next, QuoridorCore.otherPlayer(side), 1, depth, alpha, INF, side, searchState, branchCap);
        if (searchState.aborted) {
          depthAborted = true;
          break;
        }
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
          if (score > alpha) alpha = score;
        }
      }

      if (depthAborted || !bestMove) break;

      lastCompleteBest = bestMove;
      ordered = [bestMove].concat(ordered.filter((m) => m !== bestMove));
    }

    return lastCompleteBest || moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 2 },
    3: { style: "search", maxDepth: 3, nodeBudget: 40000, timeBudgetMs: 2200, branchCap: 10 }
  };

  function chooseMove(state, side, level) {
    const moves = QuoridorCore.getLegalMoves(state, side);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({ move: m, score: candidateScore(state, side, m) }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(state, side, moves, config.maxDepth, config.nodeBudget, config.timeBudgetMs, config.branchCap);
  }

  return { evaluateFor, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = QuoridorAi;
}
if (typeof window !== "undefined") {
  window.QuoridorAi = QuoridorAi;
}
