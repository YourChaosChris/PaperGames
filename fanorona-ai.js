// fanorona-ai.js
// Offline Fanorona opponent, three strength levels built on
// fanorona-core.js, mirroring checkers-ai.js's/morris-ai.js's structure:
//   1 = easy   - random full move (a full move is one legal capture
//                chain stopped at any legal point, or a paika move)
//   2 = medium - 1-ply material/positional evaluation with light
//                randomness among the top candidates
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                between sibling moves and a shared node budget
//
// A "move" here is always a FULL move as enumerated by
// FanoronaCore.enumerateFullMoves: since continuing a capture chain is
// optional (unlike checkers), that already includes every legal
// stopping point of every chain, not just maximal ones, so a normal
// search ply lands cleanly on the position after one complete turn.

const FanoronaAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function applyFullMove(board, fullMove) {
    return fullMove.steps.reduce(
      (b, step) => FanoronaCore.applyStep(b, step.from, step.to, step.captured),
      board
    );
  }

  // Strong (fully-connected) points are worth a little more: they give a
  // piece more ways to both capture and be captured, so a slight central
  // preference (most strong points cluster away from the board's own
  // orthogonal-only edges) is a reasonable, cheap positional signal once
  // material alone stops discriminating between quiet positions.
  function positionalBonus(i, color, board) {
    const r = FanoronaCore.rowOf(i), c = FanoronaCore.colOf(i);
    let bonus = FanoronaCore.NEIGHBORS[i].length; // mobility of this square itself
    const centerColDist = Math.abs(c - 4);
    bonus += (4 - centerColDist) * 0.5; // mild pull toward the center column
    return bonus;
  }

  function evaluateFor(color, board) {
    const opp = otherColor(color);
    let score = 0;
    for (let i = 0; i < FanoronaCore.TOTAL_POINTS; i++) {
      const piece = board[i];
      if (!piece) continue;
      const sign = piece === color ? 1 : -1;
      score += sign * 100;
      score += sign * positionalBonus(i, piece, board);
    }
    return score;
  }

  function orderMoves(moves) {
    // Longer capture chains (more pieces removed) first - cheap, effective pruning aid.
    return moves.slice().sort((a, b) => b.captured.length - a.captured.length);
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

    const moves = FanoronaCore.enumerateFullMoves(board, colorToMove);
    if (!moves.length) {
      // colorToMove has no legal moves and therefore loses immediately.
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const ordered = orderMoves(moves);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const b2 = applyFullMove(board, m);
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
      score: evaluateFor(color, applyFullMove(board, m)) + (Math.random() - 0.5) * 2
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
        const b2 = applyFullMove(board, m);
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
    3: { style: "search", maxDepth: 3, nodeBudget: 150000 }
  };

  // Returns a full move: { from, to, steps: [...], captured: [...] }
  function chooseMove(board, color, level) {
    const moves = FanoronaCore.enumerateFullMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, applyFullMove(board, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget);
  }

  return {
    evaluateFor,
    applyFullMove,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FanoronaAi;
}
if (typeof window !== "undefined") {
  window.FanoronaAi = FanoronaAi;
}
