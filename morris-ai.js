// morris-ai.js
// Offline Nine Men's Morris opponent, three strength levels built on
// morris-core.js, mirroring checkers-ai.js's structure:
//   1 = easy   - random legal move
//   2 = medium - 1-ply material/positional evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                and a shared node budget
//
// Like checkers, a mill's removal choice is already bundled into the
// move by morris-core.js, so a search ply lands cleanly on the position
// after the whole action (place/move + any capture) rather than needing
// a separate decision node for it.

const MorrisAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // Mobility (how many neighbors of a point are empty or friendly, i.e.
  // useful board control) and mill-adjacency (points that are one move
  // from completing a mill) are the classic Nine Men's Morris heuristics
  // once material alone stops discriminating between quiet positions.
  function evaluateFor(color, state) {
    const board = state.board;
    const opp = otherColor(color);
    let score = 0;

    score += (MorrisCore.countOnBoard(board, color) - MorrisCore.countOnBoard(board, opp)) * 100;
    score += (state.toPlace[opp] - state.toPlace[color]) * 2; // placing pieces sooner is slightly better (more info later)

    for (let i = 0; i < MorrisCore.TOTAL_POINTS; i++) {
      const piece = board[i];
      if (!piece) continue;
      const sign = piece === color ? 1 : -1;
      const mobility = MorrisCore.ADJACENCY[i].filter((j) => !board[j]).length;
      score += sign * mobility * 3;
    }

    // Reward positions with more ways to complete a mill next turn: for
    // each mill line with exactly two of our pieces and one empty point,
    // add a bonus (a real "double mill" threat, i.e. two such lines
    // sharing that empty point, naturally scores twice - a fair proxy
    // for the classic swinging-mill trap).
    MorrisCore.MILLS.forEach((mill) => {
      const mine = mill.filter((p) => board[p] === color).length;
      const theirs = mill.filter((p) => board[p] === opp).length;
      const empty = mill.filter((p) => !board[p]).length;
      if (mine === 2 && empty === 1) score += 15;
      if (theirs === 2 && empty === 1) score -= 15;
    });

    return score;
  }

  function orderMoves(moves) {
    return moves.slice().sort((a, b) => (b.remove !== null ? 1 : 0) - (a.remove !== null ? 1 : 0));
  }

  function minimax(state, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget) {
        searchState.aborted = true;
        return 0;
      }
    }

    const end = MorrisCore.detectGameEnd(state, colorToMove);
    if (end.status !== "normal") {
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const moves = orderMoves(MorrisCore.getLegalMoves(state, colorToMove));
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const next = MorrisCore.applyMove(state, colorToMove, m);
      const score = minimax(next, otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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

  function searchBestMove(state, color, moves, maxDepth, nodeBudget) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false };
    let orderedMoves = orderMoves(moves);

    const rootScored = orderedMoves.map((m) => ({
      move: m,
      score: evaluateFor(color, MorrisCore.applyMove(state, color, m)) + (Math.random() - 0.5) * 2
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
        const next = MorrisCore.applyMove(state, color, m);
        const score = minimax(next, otherColor(color), 1, depth, alpha, INF, color, searchState);
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
    3: { style: "search", maxDepth: 4, nodeBudget: 250000 }
  };

  function chooseMove(state, color, level) {
    const moves = MorrisCore.getLegalMoves(state, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, MorrisCore.applyMove(state, color, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(state, color, moves, config.maxDepth, config.nodeBudget);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MorrisAi;
}
if (typeof window !== "undefined") {
  window.MorrisAi = MorrisAi;
}
