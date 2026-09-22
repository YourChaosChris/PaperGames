// surakarta-ai.js
// Offline Surakarta opponent, three strength levels built on
// surakarta-core.js, mirroring fanorona-ai.js's/checkers-ai.js's overall
// structure:
//   1 = easy   - random legal move (quiet or capture)
//   2 = medium - 1-ply evaluation with light randomness among the top
//                candidates
//   3 = hard   - 2-ply minimax with alpha-beta pruning
//
// Kept shallow on purpose: a loop-track capture search (slideForCapture)
// walks the board's loop connectivity graph for every piece in every
// direction, which is cheap per call but adds up across a full-width
// search - the task's own guidance ("1-2 ply is reasonable given the
// capture-path search can be expensive") is followed literally rather
// than pushed further, since Surakarta has no forced-capture pruning to
// shrink the branching factor the way Fanorona's mandatory-capture rule
// does.
//
// Evaluation = material + mobility + threatened-capture scoring, as
// specified: piece count dominates, then how many capturing lines each
// side currently has available (a capture you can make next turn is a
// concrete threat, whether or not the opponent removes it first), then
// plain mobility (more legal moves = more flexibility) as a small
// tie-breaker.

const SurakartaAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // Material is worth far more than any positional signal - captures
  // are the only way to win, so nothing should outweigh them.
  const MATERIAL_WEIGHT = 100;
  const CAPTURE_THREAT_WEIGHT = 12;
  const MOBILITY_WEIGHT = 1;

  function evaluateFor(color, board) {
    const opp = otherColor(color);
    const myPieces = SurakartaCore.countPieces(board, color);
    const oppPieces = SurakartaCore.countPieces(board, opp);
    const myCaptures = SurakartaCore.getCaptureMoves(board, color).length;
    const oppCaptures = SurakartaCore.getCaptureMoves(board, opp).length;
    const myQuiet = SurakartaCore.getQuietMoves(board, color).length;
    const oppQuiet = SurakartaCore.getQuietMoves(board, opp).length;

    return (myPieces - oppPieces) * MATERIAL_WEIGHT +
      (myCaptures - oppCaptures) * CAPTURE_THREAT_WEIGHT +
      (myQuiet - oppQuiet) * MOBILITY_WEIGHT;
  }

  function orderMoves(moves) {
    // Captures first (and among captures, more loop-arcs used first,
    // since a longer loop-capture is harder for the opponent to have
    // seen coming and often signals a juicier tactical shot) - a cheap,
    // effective move-ordering heuristic for alpha-beta pruning.
    return moves.slice().sort((a, b) => {
      if (a.type !== b.type) return a.type === "capture" ? -1 : 1;
      return (b.loopsUsed || 0) - (a.loopsUsed || 0);
    });
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

    const end = SurakartaCore.detectGameEnd(board, colorToMove);
    if (end.status !== "normal") {
      return end.winner === perspective ? INF / 2 : -INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const moves = orderMoves(SurakartaCore.getLegalMoves(board, colorToMove));
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const b2 = SurakartaCore.applyMove(board, m);
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
    let bestScore = -INF;
    let bestMove = null;
    let alpha = -INF;

    for (const m of ordered) {
      const b2 = SurakartaCore.applyMove(board, m);
      const score = minimax(b2, otherColor(color), 1, maxDepth, alpha, INF, color, searchState);
      if (searchState.aborted) break;
      if (score > bestScore || !bestMove) {
        bestScore = score;
        bestMove = m;
        if (score > alpha) alpha = score;
      }
    }

    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 4 },
    3: { style: "search", maxDepth: 2, nodeBudget: 60000 }
  };

  // Returns a single move: { from, to, type: "quiet"|"capture", captured: [idx,...] }
  function chooseMove(board, color, level) {
    const moves = SurakartaCore.getLegalMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, SurakartaCore.applyMove(board, m)) + (Math.random() - 0.5) * 4
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
  module.exports = SurakartaAi;
}
if (typeof window !== "undefined") {
  window.SurakartaAi = SurakartaAi;
}
