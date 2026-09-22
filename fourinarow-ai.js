// connectfour-ai.js
// Offline Connect Four opponent, three strength levels built on
// connectfour-core.js, mirroring the structure of checkers-ai.js. The
// board is tiny (6x7) with a branching factor of at most 7, so a plain
// iterative-deepening alpha-beta search goes comfortably deep within
// budget - no special-casing needed the way Ur or Backgammon need for
// their randomness.
//   1 = easy   - random legal move
//   2 = medium - 1-ply window-scoring evaluation with light randomness
//   3 = hard   - iterative deepening alpha-beta

const ConnectFourAi = (function () {
  const INF = 1e9;

  // Scores one 4-cell window for `color`: strongly rewards windows
  // already partly filled with your own discs (especially 3-of-4,
  // which is an immediate threat) and only counts a window at all if
  // the opponent hasn't already blocked it.
  function scoreWindow(cells, color) {
    const opp = ConnectFourCore.otherColor(color);
    const mine = cells.filter((c) => c === color).length;
    const theirs = cells.filter((c) => c === opp).length;
    const empty = cells.filter((c) => c === null).length;
    if (mine > 0 && theirs > 0) return 0; // dead window, both sides present
    if (mine === 4) return 1000;
    if (mine === 3 && empty === 1) return 50;
    if (mine === 2 && empty === 2) return 10;
    if (theirs === 3 && empty === 1) return -80; // weigh blocking slightly higher than building
    return 0;
  }

  function evaluateFor(color, board) {
    let score = 0;
    const rows = ConnectFourCore.ROWS;
    const cols = ConnectFourCore.COLS;

    // Center column control is a well-known strong Connect Four heuristic.
    const centerCol = Math.floor(cols / 2);
    for (let r = 0; r < rows; r++) {
      if (board[r][centerCol] === color) score += 3;
      else if (board[r][centerCol] === ConnectFourCore.otherColor(color)) score -= 3;
    }

    function addWindow(cells) {
      score += scoreWindow(cells, color);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        addWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
      }
    }
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r <= rows - 4; r++) {
        addWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
      }
    }
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        addWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
        addWindow([board[r + 3][c], board[r + 2][c + 1], board[r + 1][c + 2], board[r][c + 3]]);
      }
    }
    return score;
  }

  function orderMoves(moves, cols) {
    // Center-first move ordering is a cheap, effective way to help
    // alpha-beta prune sooner, since central columns are usually
    // strongest.
    const center = Math.floor(cols / 2);
    return moves.slice().sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
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

    const winner = ConnectFourCore.getWinner(board);
    if (winner) {
      const bonus = (maxDepth - depth); // prefer a faster win / slower loss
      return winner === perspective ? INF / 2 + bonus : -INF / 2 - bonus;
    }
    const moves = ConnectFourCore.getLegalMoves(board, colorToMove);
    if (!moves.length) return 0; // board full, draw

    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const ordered = orderMoves(moves, ConnectFourCore.COLS);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const col of ordered) {
      const { board: b2 } = ConnectFourCore.applyMove(board, colorToMove, col);
      const score = minimax(b2, ConnectFourCore.otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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
    let orderedMoves = orderMoves(moves, ConnectFourCore.COLS);

    let lastCompleteBestMove = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const col of orderedMoves) {
        const { board: b2 } = ConnectFourCore.applyMove(board, color, col);
        const score = minimax(b2, ConnectFourCore.otherColor(color), 1, depth, alpha, INF, color, searchState);
        if (searchState.aborted) {
          depthAborted = true;
          break;
        }
        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
          if (score > alpha) alpha = score;
        }
      }

      if (depthAborted || bestMove === null) break;

      lastCompleteBestMove = bestMove;
      orderedMoves = [bestMove].concat(orderedMoves.filter((c) => c !== bestMove));
    }

    return lastCompleteBestMove !== null ? lastCompleteBestMove : moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 3 },
    3: { style: "search", maxDepth: 8, nodeBudget: 300000 }
  };

  function chooseMove(board, color, level) {
    const moves = ConnectFourCore.getLegalMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((col) => ({
        col,
        score: evaluateFor(color, ConnectFourCore.applyMove(board, color, col).board)
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].col;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ConnectFourAi;
}
if (typeof window !== "undefined") {
  window.ConnectFourAi = ConnectFourAi;
}
