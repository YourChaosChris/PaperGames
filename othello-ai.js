// othello-ai.js
// Offline Reversi/Othello opponent, three strength levels built on
// othello-core.js, mirroring the structure of checkers-ai.js:
//   1 = easy   - random legal move
//   2 = medium - 1-ply positional evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                between sibling moves and a shared node budget
//
// A player with no legal move must pass rather than choosing a move -
// the search handles that by recursing with the other color at the
// same board, and treats two passes in a row (neither side can move)
// as the game actually ending, scored by final disc count rather than
// searched any further.

const OthelloAi = (function () {
  const INF = 1e9;

  // Classic static weight table: corners are extremely valuable (and,
  // once taken, permanently safe), the squares diagonally adjacent to a
  // corner are heavily penalized (playing there usually hands the
  // opponent that corner next), and edges are mildly favored over
  // central squares.
  const WEIGHTS = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120]
  ];

  function positionalScore(board, color) {
    let score = 0;
    for (let r = 0; r < OthelloCore.SIZE; r++) {
      for (let c = 0; c < OthelloCore.SIZE; c++) {
        if (board[r][c] === color) score += WEIGHTS[r][c];
      }
    }
    return score;
  }

  function evaluateFor(color, board) {
    const opp = OthelloCore.otherColor(color);
    let score = positionalScore(board, color) - positionalScore(board, opp);
    // Mobility matters more than raw disc count for most of the game -
    // having more available moves than your opponent keeps pressure on
    // and denies them good squares.
    const myMoves = OthelloCore.getLegalMoves(board, color).length;
    const oppMoves = OthelloCore.getLegalMoves(board, opp).length;
    score += (myMoves - oppMoves) * 3;
    return score;
  }

  function terminalScore(board, perspective) {
    const winner = OthelloCore.getWinner(board);
    if (winner === perspective) return INF / 2;
    if (winner === null) return 0;
    return -INF / 2;
  }

  function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState, justPassed) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      // The node budget alone doesn't bound wall-clock time well here -
      // move generation cost varies a lot with how many empty squares
      // are left, and real e-reader hardware is far slower than this
      // was tuned on - so also give up once a fixed time budget is
      // spent, falling back to the last fully-completed depth exactly
      // like a budget-triggered abort does.
      if (searchState.nodes > searchState.budget ||
          (searchState.nodes % 512 === 0 && Date.now() > searchState.deadline)) {
        searchState.aborted = true;
        return 0;
      }
    }

    const moves = OthelloCore.getLegalMoves(board, colorToMove);
    if (!moves.length) {
      if (justPassed) return terminalScore(board, perspective); // neither side can move
      return minimax(board, OthelloCore.otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, true);
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const b2 = OthelloCore.applyMove(board, colorToMove, m);
      const score = minimax(b2, OthelloCore.otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, false);
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

  function searchBestMove(board, color, moves, maxDepth, nodeBudget, timeBudgetMs) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let orderedMoves = moves.slice();

    const rootScored = orderedMoves.map((m) => ({
      move: m,
      score: evaluateFor(color, OthelloCore.applyMove(board, color, m)) + (Math.random() - 0.5) * 2
    }));
    rootScored.sort((a, b) => b.score - a.score);
    orderedMoves = rootScored.map((e) => e.move);

    let lastCompleteBestMove = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const m of orderedMoves) {
        const b2 = OthelloCore.applyMove(board, color, m);
        const score = minimax(b2, OthelloCore.otherColor(color), 1, depth, alpha, INF, color, searchState, false);
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

      lastCompleteBestMove = bestMove;
      orderedMoves = [bestMove].concat(orderedMoves.filter((m) => m !== bestMove));
    }

    return lastCompleteBestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 4 },
    3: { style: "search", maxDepth: 6, nodeBudget: 40000, timeBudgetMs: 2000 }
  };

  function chooseMove(board, color, level) {
    const moves = OthelloCore.getLegalMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, OthelloCore.applyMove(board, color, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget, config.timeBudgetMs);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OthelloAi;
}
if (typeof window !== "undefined") {
  window.OthelloAi = OthelloAi;
}
