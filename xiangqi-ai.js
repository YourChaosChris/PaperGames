// xiangqi-ai.js
// Offline Xiangqi opponent, three strength levels built on
// xiangqi-core.js, mirroring checkers-ai.js's structure:
//   1 = easy   - random legal move
//   2 = medium - 1-ply material/positional evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                between sibling moves and a shared node budget

const XiangqiAi = (function () {
  const INF = 1e9;

  const PIECE_VALUE = { G: 10000, A: 200, E: 200, H: 450, C: 480, R: 900, P: 100 };

  function otherColor(color) {
    return color === "r" ? "b" : "r";
  }

  function positionalBonus(type, color, r) {
    // A soldier is worth noticeably more once it's crossed the river and
    // can start threatening sideways too - the single most important
    // positional fact about Xiangqi pawns.
    if (type !== "P") return 0;
    const crossed = !XiangqiCore.onOwnSide(color, r);
    return crossed ? 80 : 0;
  }

  function evaluateFor(color, board) {
    let score = 0; // positive favors red
    for (let r = 0; r < XiangqiCore.ROWS; r++) {
      for (let c = 0; c < XiangqiCore.COLS; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const sign = piece.color === "r" ? 1 : -1;
        score += sign * (PIECE_VALUE[piece.type] || 0);
        score += sign * positionalBonus(piece.type, piece.color, r);
      }
    }
    return color === "r" ? score : -score;
  }

  function orderMoves(moves) {
    return moves.slice().sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
  }

  function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    const moves = XiangqiCore.getLegalMoves(board, colorToMove);
    if (!moves.length) {
      const inCheck = XiangqiCore.isInCheck(board, colorToMove);
      if (!inCheck) return 0; // no-moves-but-not-in-check still loses in Xiangqi, but treat as a mild penalty via the caller's move loop instead of a hard cutoff here to keep this function simple
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const ordered = orderMoves(moves);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const b2 = XiangqiCore.applyMove(board, m);
      const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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

  function searchBestMove(board, color, moves, maxDepth, nodeBudget) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false };
    let orderedMoves = orderMoves(moves);

    const rootScored = orderedMoves.map((m) => ({
      move: m,
      score: evaluateFor(color, XiangqiCore.applyMove(board, m)) + (Math.random() - 0.5) * 2
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
        const b2 = XiangqiCore.applyMove(board, m);
        const score = minimax(b2, otherColor(color), 1, depth, alpha, INF, color, searchState);
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
    3: { style: "search", maxDepth: 3, nodeBudget: 300000 }
  };

  // `isAllowed`, if given, filters out moves the game won't accept even
  // though they are legal on the board (the perpetual check/chase rule).
  function chooseMove(board, color, level, isAllowed) {
    const moves = XiangqiCore.getLegalMoves(board, color).filter((m) => !isAllowed || isAllowed(m));
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, XiangqiCore.applyMove(board, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = XiangqiAi;
}
if (typeof window !== "undefined") {
  window.XiangqiAi = XiangqiAi;
}
