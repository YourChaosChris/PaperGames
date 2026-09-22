// amazons-ai.js
// Offline opponent for The Game of the Amazons, mirroring the
// structure used for the other strategy games here:
//   1 = easy   - random legal move
//   2 = medium - 1-ply evaluation (mobility) with light randomness
//                among the best few
//   3 = hard   - iterative deepening alpha-beta, with the branch list
//                capped to a handful of the most promising moves per
//                node (a single Amazons turn can offer well over a
//                thousand legal move+arrow combinations - searching
//                all of them several plies deep would blow any node
//                budget before finding anything useful), plus the
//                usual node-budget/wall-clock-deadline safety net.
//
// Amazons has no material and no captures - the whole game is a fight
// over movement space, so the evaluation is exactly the heuristic
// classic Amazons engines start from: mobility. For each side, count
// every distinct square any of its amazons could slide to right now
// (a plain Set of "r,c" keys, so two amazons that can both reach the
// same square only count it once) and take the difference. A side
// that is running out of room to move sees this number collapse long
// before it actually loses, which is exactly the warning an evaluation
// function needs to give here.

const AmazonsAi = (function () {
  const INF = 1e9;

  function totalMobility(board, player) {
    const reachable = {};
    AmazonsCore.amazonPositions(board, player).forEach(([r, c]) => {
      AmazonsCore.slideTargets(board, r, c).forEach(([tr, tc]) => {
        reachable[tr + "," + tc] = true;
      });
    });
    return Object.keys(reachable).length;
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      return state.winner === side ? INF / 2 : -INF / 2;
    }
    const opp = AmazonsCore.otherPlayer(side);
    const myMobility = totalMobility(state.board, side);
    const oppMobility = totalMobility(state.board, opp);
    return (myMobility - oppMobility) * 10;
  }

  // A quick, cheap-to-compute score used only to pick which moves are
  // worth exploring further, not the real evaluation.
  function candidateScore(state, player, move) {
    const next = AmazonsCore.applyMove(state, player, move);
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

    const allMoves = AmazonsCore.getLegalMoves(state, playerToMove);
    if (!allMoves.length) {
      // playerToMove is stuck: they lose right here.
      return playerToMove === perspective ? -INF / 2 + depth : INF / 2 - depth;
    }
    const moves = topCandidates(state, playerToMove, allMoves, branchCap);
    const isMaximizing = playerToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const next = AmazonsCore.applyMove(state, playerToMove, m);
      const score = minimax(next, AmazonsCore.otherPlayer(playerToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, branchCap);
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
        const next = AmazonsCore.applyMove(state, side, m);
        const score = minimax(next, AmazonsCore.otherPlayer(side), 1, depth, alpha, INF, side, searchState, branchCap);
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
    2: { style: "greedy", topN: 3 },
    3: { style: "search", maxDepth: 2, nodeBudget: 6000, timeBudgetMs: 2500, branchCap: 8 }
  };

  function chooseMove(state, side, level) {
    const moves = AmazonsCore.getLegalMoves(state, side);
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

  return { evaluateFor, totalMobility, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AmazonsAi;
}
if (typeof window !== "undefined") {
  window.AmazonsAi = AmazonsAi;
}
