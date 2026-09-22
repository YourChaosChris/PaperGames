// abalone-ai.js
// Offline Abalone opponent, three strength levels built on
// abalone-core.js, mirroring fanorona-ai.js's/checkers-ai.js's
// structure:
//   1 = easy   - random legal move
//   2 = medium - 1-ply material/positional evaluation with light
//                randomness among the top candidates
//   3 = hard   - 2-ply minimax with alpha-beta pruning and a shared
//                node budget (Abalone's branching factor - up to ~40-50
//                moves per position - makes a deep full search
//                expensive, so this stays intentionally shallow; see
//                the evaluation function below for the heuristics that
//                make it play sensibly anyway)
//
// Unlike Fanorona/checkers, an Abalone move is always a single atomic
// step (there are no capture chains), so a "move" here is exactly one
// of AbaloneCore.getLegalMoves()'s results.

const AbaloneAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // Evaluation combines three heuristics per marble - material (simply
  // by counting what's still on the board; a captured marble stops
  // contributing at all, which is by far the dominant term since
  // losing 6 marbles is instant loss), center-control (marbles near
  // the board's center are safer and more flexible - a marble on the
  // rim is one push away from real danger) and cohesion (marbles
  // touching friendly marbles are harder to isolate and push out) -
  // plus a light "threat of sumito" term counting how many pushing
  // moves are immediately available to each side right now, which
  // rewards setting up an actual capture over merely centralizing.
  function evaluateFor(color, board) {
    const opp = otherColor(color);
    let score = 0;
    for (let i = 0; i < AbaloneCore.TOTAL_CELLS; i++) {
      const piece = board[i];
      if (!piece) continue;
      const sign = piece === color ? 1 : -1;
      score += sign * 100; // material
      score += sign * (4 - AbaloneCore.CELLS[i].dist) * 3; // center control
      let sameNeighbors = 0;
      for (let d = 0; d < 6; d++) {
        const n = AbaloneCore.NEIGHBORS[i][d];
        if (n !== null && board[n] === piece) sameNeighbors++;
      }
      score += sign * sameNeighbors * 2; // cohesion
    }
    const myThreats = AbaloneCore.getLegalMoves(board, color).filter((m) => m.capturedCount > 0).length;
    const oppThreats = AbaloneCore.getLegalMoves(board, opp).filter((m) => m.capturedCount > 0).length;
    score += (myThreats - oppThreats) * 25;
    return score;
  }

  function orderMoves(moves) {
    // Capturing moves first, then moves that at least approach an
    // enemy line - a cheap, effective aid for alpha-beta pruning.
    return moves.slice().sort((a, b) => b.capturedCount - a.capturedCount);
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

    const end = AbaloneCore.detectGameEnd(board, colorToMove);
    if (end.status !== "normal") {
      return end.winner === perspective ? INF / 2 : -INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const moves = AbaloneCore.getLegalMoves(board, colorToMove);
    if (!moves.length) {
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }

    const ordered = orderMoves(moves);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const b2 = AbaloneCore.applyMove(board, colorToMove, m);
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
    const ordered = orderMoves(moves);
    let bestMove = null;
    let bestScore = -INF;
    let alpha = -INF;

    for (const m of ordered) {
      const b2 = AbaloneCore.applyMove(board, color, m);
      const score = minimax(b2, otherColor(color), 1, maxDepth, alpha, INF, color, searchState);
      if (score > bestScore || bestMove === null) {
        bestScore = score;
        bestMove = m;
        if (score > alpha) alpha = score;
      }
      if (searchState.aborted) break;
    }
    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 5 },
    3: { style: "search", maxDepth: 2, nodeBudget: 20000 }
  };

  // Returns one legal move (a single atomic step - see file header).
  function chooseMove(board, color, level) {
    const moves = AbaloneCore.getLegalMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, AbaloneCore.applyMove(board, color, m))
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
  module.exports = AbaloneAi;
}
if (typeof window !== "undefined") {
  window.AbaloneAi = AbaloneAi;
}
