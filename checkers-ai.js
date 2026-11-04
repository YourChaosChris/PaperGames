// checkers-ai.js
// Offline checkers opponent, three strength levels built on
// checkers-core.js, mirroring the structure of go-ai.js/ai-engine.js:
//   1 = easy   - random legal move (mandatory capture already narrows this)
//   2 = medium - 1-ply material/positional evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                between sibling moves and a shared node budget, the same
//                approach validated for chess's ai-engine.js
//
// No quiescence search is needed here the way chess needs one: mandatory
// capture chains are already generated as single atomic moves in
// checkers-core.js, so a normal search ply always lands on the position
// after a complete forced sequence rather than stopping mid-chain.

const CheckersAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // A flying king (German rules) covers whole diagonals, so it is worth
  // far more than an English king that steps one square.
  function pieceValue(piece, rules) {
    if (!CheckersCore.isKing(piece)) return 100;
    return rules === "de" ? 300 : 130;
  }

  // Cheap positional terms: reward advancing men toward promotion, and
  // keeping some pieces on the home back row (a well-known checkers
  // heuristic - it denies the opponent's men an easy promotion square).
  function positionalBonus(piece, r, color) {
    if (CheckersCore.isKing(piece)) return 0;
    const advancement = color === "b" ? r : (CheckersCore.SIZE - 1 - r);
    let bonus = advancement * 2;
    const homeRow = color === "b" ? 0 : CheckersCore.SIZE - 1;
    if (r === homeRow) bonus += 5;
    return bonus;
  }

  function evaluateFor(color, board, rules) {
    let score = 0; // positive favors black
    for (let r = 0; r < CheckersCore.SIZE; r++) {
      for (let c = 0; c < CheckersCore.SIZE; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const pieceColor = CheckersCore.colorOf(piece);
        const sign = pieceColor === "b" ? 1 : -1;
        score += sign * pieceValue(piece, rules);
        score += sign * positionalBonus(piece, r, pieceColor);
      }
    }
    return color === "b" ? score : -score;
  }

  function orderMoves(moves) {
    // Captures first (especially longer chains) - cheap, effective pruning aid.
    return moves.slice().sort((a, b) => b.captured.length - a.captured.length);
  }

  function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState, rules) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    const moves = CheckersCore.getLegalMoves(board, colorToMove, rules);
    if (!moves.length) {
      // colorToMove has no legal moves and therefore loses immediately.
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board, rules);
    }

    const ordered = orderMoves(moves);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const b2 = CheckersCore.applyMove(board, m);
      const score = minimax(b2, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, rules);
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

  // Iterative deepening with root-level alpha-beta tightening between
  // sibling moves (real pruning across the whole root, not just within
  // each candidate's own subtree) and a shared node budget: if a slow
  // device can't finish the target depth in time, the last fully
  // completed shallower depth's move is kept instead of hanging.
  function searchBestMove(board, color, moves, maxDepth, nodeBudget, rules) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false };
    let orderedMoves = orderMoves(moves);

    const rootScored = orderedMoves.map((m) => ({
      move: m,
      score: evaluateFor(color, CheckersCore.applyMove(board, m), rules) + (Math.random() - 0.5) * 2
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
        const b2 = CheckersCore.applyMove(board, m);
        const score = minimax(b2, otherColor(color), 1, depth, alpha, INF, color, searchState, rules);
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
    3: { style: "search", maxDepth: 11, nodeBudget: 600000 }
  };

  // `rules` is "en" (default) or "de", see checkers-core.js.
  function chooseMove(board, color, level, rules) {
    rules = CheckersCore.normalizeRules(rules);
    const moves = CheckersCore.getLegalMoves(board, color, rules);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, CheckersCore.applyMove(board, m), rules)
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget, rules);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CheckersAi;
}
if (typeof window !== "undefined") {
  window.CheckersAi = CheckersAi;
}
