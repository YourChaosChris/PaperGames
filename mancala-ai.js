// mancala-ai.js
// Offline Mancala (Kalaha) opponent, three strength levels built on
// mancala-core.js, mirroring the structure of checkers-ai.js - Mancala
// has no hidden information and a small branching factor (at most 6
// legal moves per turn), so the same iterative-deepening alpha-beta
// search fits well:
//   1 = easy   - random legal move
//   2 = medium - 1-ply store-difference evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta, several plies deep
//
// The "land your last seed in your own store -> move again" rule means
// a single logical turn can chain several sows in a row for the same
// player - the search handles that by recursing with the SAME player
// to move (not flipping to the opponent) whenever a move grants an
// extra turn, exactly as a human's turn would continue.

const MancalaAi = (function () {
  const INF = 1e9;

  function evaluateFor(player, state) {
    const opp = MancalaCore.otherPlayer(player);
    const board = state.board;
    let score = board[MancalaCore.storeOf(player)] - board[MancalaCore.storeOf(opp)];
    // Small bonus for seeds still sitting in your own pits over the
    // opponent's - keeps the AI from racing to empty its own side just
    // to end the game, when holding seeds for a future capture is
    // stronger.
    const mySeeds = MancalaCore.pitsOf(player).reduce((s, i) => s + board[i], 0);
    const oppSeeds = MancalaCore.pitsOf(opp).reduce((s, i) => s + board[i], 0);
    score += (mySeeds - oppSeeds) * 0.1;
    return score;
  }

  function minimax(state, toMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    if (state.gameOver) {
      const winner = MancalaCore.getWinner(state);
      if (winner === perspective) return INF / 2;
      if (winner === null) return 0;
      return -INF / 2;
    }

    const moves = MancalaCore.getLegalMoves(state, toMove);
    if (!moves.length || depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const isMaximizing = toMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const pit of moves) {
      const result = MancalaCore.applyMove(state, toMove, pit);
      const nextToMove = result.extraTurn ? toMove : MancalaCore.otherPlayer(toMove);
      const score = minimax(result.state, nextToMove, depth + 1, maxDepth, alpha, beta, perspective, searchState);
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

  function searchBestMove(state, player, moves, maxDepth, nodeBudget) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false };
    let orderedMoves = moves.slice();

    const rootScored = orderedMoves.map((pit) => {
      const result = MancalaCore.applyMove(state, player, pit);
      return { pit, score: evaluateFor(player, result.state) + (Math.random() - 0.5) * 0.5 };
    });
    rootScored.sort((a, b) => b.score - a.score);
    orderedMoves = rootScored.map((e) => e.pit);

    let lastCompleteBestMove = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const pit of orderedMoves) {
        const result = MancalaCore.applyMove(state, player, pit);
        const nextToMove = result.extraTurn ? player : MancalaCore.otherPlayer(player);
        const score = minimax(result.state, nextToMove, 1, depth, alpha, INF, player, searchState);
        if (searchState.aborted) {
          depthAborted = true;
          break;
        }
        if (score > bestScore) {
          bestScore = score;
          bestMove = pit;
          if (score > alpha) alpha = score;
        }
      }

      if (depthAborted || bestMove === null) break;

      lastCompleteBestMove = bestMove;
      orderedMoves = [bestMove].concat(orderedMoves.filter((p) => p !== bestMove));
    }

    return lastCompleteBestMove !== null ? lastCompleteBestMove : moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 3 },
    3: { style: "search", maxDepth: 14, nodeBudget: 500000 }
  };

  function chooseMove(state, player, level) {
    const moves = MancalaCore.getLegalMoves(state, player);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((pit) => ({
        pit,
        score: evaluateFor(player, MancalaCore.applyMove(state, player, pit).state)
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].pit;
    }

    return searchBestMove(state, player, moves, config.maxDepth, config.nodeBudget);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MancalaAi;
}
if (typeof window !== "undefined") {
  window.MancalaAi = MancalaAi;
}
