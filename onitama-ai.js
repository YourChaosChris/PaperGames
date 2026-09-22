// onitama-ai.js
// Offline opponent for the Onitama-style duel, mirroring xiangqi-ai.js's
// structure:
//   1 = easy   - random legal move
//   2 = medium - 1-ply material/positional evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta with a shared node
//                budget AND a wall-clock deadline (the branching factor
//                here is small, but the deadline is still the real
//                safety net across very different devices - the same
//                lesson learned tuning the Othello AI)

const OnitamaAi = (function () {
  const INF = 1e9;
  const PAWN_VALUE = 100;
  const KING_VALUE = 100000;

  // A gentle pull toward the center and toward the opponent's shrine
  // for pawns - the king's positional value is dominated by safety
  // (captured/shrine-reached is already a hard win/loss, handled
  // separately), so it gets no positional bonus here.
  function positionalBonus(color, r, c) {
    const centerBonus = 2 - (Math.abs(c - 2));
    const advance = color === "blue" ? (4 - r) : r;
    return centerBonus + advance * 0.5;
  }

  function evaluateFor(color, state) {
    if (state.gameOver) {
      if (state.winner === color) return INF / 2;
      if (state.winner) return -INF / 2;
    }
    const opp = OnitamaCore.otherPlayer(color);
    let score = 0;
    for (let r = 0; r < OnitamaCore.SIZE; r++) {
      for (let c = 0; c < OnitamaCore.SIZE; c++) {
        const piece = state.board[r][c];
        if (!piece) continue;
        const sign = piece.color === color ? 1 : -1;
        const value = piece.king ? KING_VALUE : PAWN_VALUE;
        score += sign * value;
        if (!piece.king) score += sign * positionalBonus(piece.color, r, c);
      }
    }
    // Being one move from delivering a shrine win is worth a lot -
    // reward the king for being close to the target shrine.
    [color, opp].forEach((who) => {
      const king = findKing(state, who);
      if (!king) return;
      const [sr, sc] = OnitamaCore.shrineFor(who);
      const dist = Math.abs(king[0] - sr) + Math.abs(king[1] - sc);
      const sign = who === color ? 1 : -1;
      score += sign * (8 - dist) * 3;
    });
    return score;
  }

  function findKing(state, color) {
    for (let r = 0; r < OnitamaCore.SIZE; r++) {
      for (let c = 0; c < OnitamaCore.SIZE; c++) {
        const piece = state.board[r][c];
        if (piece && piece.color === color && piece.king) return [r, c];
      }
    }
    return null;
  }

  function orderMoves(moves, state) {
    return moves.slice().sort((a, b) => {
      const aCap = state.board[a.to[0]][a.to[1]] ? 1 : 0;
      const bCap = state.board[b.to[0]][b.to[1]] ? 1 : 0;
      return bCap - aCap;
    });
  }

  function minimax(state, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget || Date.now() > searchState.deadline) {
        searchState.aborted = true;
        return 0;
      }
    }

    if (state.gameOver) {
      return colorToMove === perspective
        ? (state.winner === perspective ? INF / 2 : -INF / 2)
        : (state.winner === perspective ? INF / 2 : -INF / 2);
    }

    const moves = OnitamaCore.getLegalMoves(state, colorToMove);
    if (!moves.length) {
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const ordered = orderMoves(moves, state);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const next = OnitamaCore.applyMove(state, colorToMove, m);
      const score = minimax(next, OnitamaCore.otherPlayer(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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

  function searchBestMove(state, color, moves, maxDepth, nodeBudget, timeBudgetMs) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let ordered = orderMoves(moves, state);

    const rootScored = ordered.map((m) => ({
      move: m,
      score: evaluateFor(color, OnitamaCore.applyMove(state, color, m)) + (Math.random() - 0.5) * 2
    }));
    rootScored.sort((a, b) => b.score - a.score);
    ordered = rootScored.map((e) => e.move);

    let lastCompleteBest = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const m of ordered) {
        const next = OnitamaCore.applyMove(state, color, m);
        const score = minimax(next, OnitamaCore.otherPlayer(color), 1, depth, alpha, INF, color, searchState);
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
    2: { style: "greedy", topN: 4 },
    3: { style: "search", maxDepth: 3, nodeBudget: 100000, timeBudgetMs: 2000 }
  };

  function chooseMove(state, color, level) {
    const moves = OnitamaCore.getLegalMoves(state, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, OnitamaCore.applyMove(state, color, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(state, color, moves, config.maxDepth, config.nodeBudget, config.timeBudgetMs);
  }

  return { evaluateFor, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OnitamaAi;
}
if (typeof window !== "undefined") {
  window.OnitamaAi = OnitamaAi;
}
