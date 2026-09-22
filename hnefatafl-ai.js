// hnefatafl-ai.js
// Offline opponent for Hnefatafl, mirroring the structure used for the
// other asymmetric-goal games here (Xiangqi, Onitama):
//   1 = easy   - random legal move
//   2 = medium - 1-ply material/positional evaluation with light
//                randomness
//   3 = hard   - iterative deepening alpha-beta with a shared node
//                budget AND a wall-clock deadline (rook-style moves
//                give a much larger branching factor than chess here,
//                so the deadline - not the node count - is what
//                actually bounds real time on a slow device)

const HnefataflAi = (function () {
  const INF = 1e9;
  const PIECE_VALUE = 100;
  const KING_VALUE = 100000;
  const CORNERS = HnefataflCore.CORNERS;
  const SIZE = HnefataflCore.SIZE;

  function cornerDistance(r, c) {
    return Math.min.apply(null, CORNERS.map(([cr, cc]) => Math.abs(cr - r) + Math.abs(cc - c)));
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      if (state.winner === side) return INF / 2;
      if (state.winner) return -INF / 2;
    }
    const opponent = HnefataflCore.otherPlayer(side);
    let score = 0;
    let kingPos = null;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = state.board[r][c];
        if (!piece) continue;
        const sign = piece.side === side ? 1 : -1;
        score += sign * (piece.king ? KING_VALUE : PIECE_VALUE);
        if (piece.king) kingPos = [r, c];
      }
    }
    if (kingPos) {
      // The defender wants the king close to a corner (an escape
      // threat forces the attacker to react); the attacker wants the
      // opposite. A max useful distance on a 7x7 board is 12.
      const dist = cornerDistance(kingPos[0], kingPos[1]);
      const escapeScore = (12 - dist) * 4;
      score += (side === "defender" ? 1 : -1) * escapeScore;
    }
    const myMoves = HnefataflCore.getLegalMoves(state, side).length;
    const oppMoves = HnefataflCore.getLegalMoves(state, opponent).length;
    score += (myMoves - oppMoves) * 1.5;
    return score;
  }

  function orderMoves(moves, state, player) {
    const board = state.board;
    return moves.slice().sort((a, b) => {
      const aAdj = countEnemyNeighbors(board, a.to, player);
      const bAdj = countEnemyNeighbors(board, b.to, player);
      return bAdj - aAdj;
    });
  }

  function countEnemyNeighbors(board, [r, c], player) {
    const opponent = HnefataflCore.otherPlayer(player);
    let n = 0;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (HnefataflCore.inBounds(nr, nc)) {
        const cell = board[nr][nc];
        if (cell && cell.side === opponent) n++;
      }
    });
    return n;
  }

  function minimax(state, playerToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
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

    const moves = HnefataflCore.getLegalMoves(state, playerToMove);
    if (!moves.length) {
      return playerToMove === perspective ? -INF / 2 + depth : INF / 2 - depth;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const ordered = orderMoves(moves, state, playerToMove);
    const isMaximizing = playerToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const next = HnefataflCore.applyMove(state, playerToMove, m);
      const score = minimax(next, HnefataflCore.otherPlayer(playerToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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

  function searchBestMove(state, side, moves, maxDepth, nodeBudget, timeBudgetMs) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let ordered = orderMoves(moves, state, side);

    const rootScored = ordered.map((m) => ({
      move: m,
      score: evaluateFor(side, HnefataflCore.applyMove(state, side, m)) + (Math.random() - 0.5) * 2
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
        const next = HnefataflCore.applyMove(state, side, m);
        const score = minimax(next, HnefataflCore.otherPlayer(side), 1, depth, alpha, INF, side, searchState);
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
    3: { style: "search", maxDepth: 3, nodeBudget: 60000, timeBudgetMs: 2200 }
  };

  function chooseMove(state, side, level) {
    const moves = HnefataflCore.getLegalMoves(state, side);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(side, HnefataflCore.applyMove(state, side, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(state, side, moves, config.maxDepth, config.nodeBudget, config.timeBudgetMs);
  }

  return { evaluateFor, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HnefataflAi;
}
if (typeof window !== "undefined") {
  window.HnefataflAi = HnefataflAi;
}
