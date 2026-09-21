// gomoku-ai.js
// Offline Gomoku (Five in a Row) opponent, three strength levels built
// on gomoku-core.js. A 15x15 board has far too many empty points for a
// plain alpha-beta search the way Connect Four's tiny board allows, so
// the search here is restricted to candidate moves near existing
// stones (see GomokuCore.candidateMoves) and kept shallow, with an
// explicit "take an immediate win / block an immediate loss" check at
// every level so tactical blunders don't slip through even when the
// search itself is shallow:
//   1 = easy   - random move among nearby candidates
//   2 = medium - 1-ply line-scoring evaluation, always takes a winning
//                move or blocks an opponent's if one exists
//   3 = hard   - same tactical checks, then a short alpha-beta search
//                over the best-scoring candidates

const GomokuAi = (function () {
  const INF = 1e9;
  const SIZE = 15;
  const WIN = 5;

  // Scores one 5-cell window for `color`, favoring windows that are
  // already partly built up with your own stones (especially open-
  // ended ones, which can't be blocked from both sides at once) and
  // ignoring any window the opponent has already contested.
  function scoreWindow(cells, color) {
    const opp = GomokuCore.otherColor(color);
    let mine = 0;
    let theirs = 0;
    for (const cell of cells) {
      if (cell === color) mine++;
      else if (cell === opp) theirs++;
    }
    if (mine > 0 && theirs > 0) return 0;
    if (mine === 5) return 100000;
    if (mine === 4) return 5000;
    if (mine === 3) return 500;
    if (mine === 2) return 50;
    if (mine === 1) return 5;
    if (theirs === 4) return -6000;
    if (theirs === 3) return -600;
    if (theirs === 2) return -60;
    return 0;
  }

  function evaluateFor(color, board) {
    let score = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c <= SIZE - WIN; c++) {
        score += scoreWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3], board[r][c + 4]], color);
      }
    }
    for (let c = 0; c < SIZE; c++) {
      for (let r = 0; r <= SIZE - WIN; r++) {
        score += scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c], board[r + 4][c]], color);
      }
    }
    for (let r = 0; r <= SIZE - WIN; r++) {
      for (let c = 0; c <= SIZE - WIN; c++) {
        score += scoreWindow(
          [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3], board[r + 4][c + 4]], color);
        score += scoreWindow(
          [board[r + 4][c], board[r + 3][c + 1], board[r + 2][c + 2], board[r + 1][c + 3], board[r][c + 4]], color);
      }
    }
    return score;
  }

  // A move that wins immediately for `color`, if one exists among
  // `candidates`.
  function findWinningMove(board, color, candidates) {
    for (const [r, c] of candidates) {
      const after = GomokuCore.applyMove(board, color, r, c);
      if (GomokuCore.getWinnerAt(after, r, c) === color) return [r, c];
    }
    return null;
  }

  function scoredCandidates(board, color, candidates) {
    return candidates
      .map(([r, c]) => ({ r, c, score: evaluateFor(color, GomokuCore.applyMove(board, color, r, c)) }))
      .sort((a, b) => b.score - a.score);
  }

  function minimax(board, colorToMove, depth, maxDepth, alpha, beta, perspective, searchState) {
    if (searchState) {
      if (searchState.aborted) return 0;
      searchState.nodes++;
      if (searchState.nodes > searchState.budget || Date.now() > searchState.deadline) {
        searchState.aborted = true;
        return 0;
      }
    }

    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const candidates = GomokuCore.candidateMoves(board, 2);
    if (!candidates.length) return 0; // board full, draw

    // Narrow to the most promising handful of candidates per node -
    // essential for keeping a multi-ply search on a 15x15 board fast.
    const ranked = scoredCandidates(board, colorToMove, candidates).slice(0, 8);

    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const { r, c } of ranked) {
      const b2 = GomokuCore.applyMove(board, colorToMove, r, c);
      const winner = GomokuCore.getWinnerAt(b2, r, c);
      let score;
      if (winner) {
        score = winner === perspective ? INF / 2 - depth : -INF / 2 + depth;
      } else {
        score = minimax(b2, GomokuCore.otherColor(colorToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
      }
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

  function searchBestMove(board, color, candidates, maxDepth, nodeBudget, timeBudgetMs) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    const ranked = scoredCandidates(board, color, candidates).slice(0, 10);

    let bestMove = null;
    let bestScore = -INF;
    let alpha = -INF;

    for (const { r, c } of ranked) {
      const b2 = GomokuCore.applyMove(board, color, r, c);
      const winner = GomokuCore.getWinnerAt(b2, r, c);
      const score = winner ? INF / 2 : minimax(b2, GomokuCore.otherColor(color), 1, maxDepth, alpha, INF, color, searchState);
      if (score > bestScore || bestMove === null) {
        bestScore = score;
        bestMove = [r, c];
        if (score > alpha) alpha = score;
      }
      if (searchState.aborted) break;
    }

    return bestMove || ranked[0] && [ranked[0].r, ranked[0].c];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy" },
    3: { style: "search", maxDepth: 2, nodeBudget: 60000, timeBudgetMs: 2000 }
  };

  function chooseMove(board, color, level) {
    const candidates = GomokuCore.candidateMoves(board, 2);
    if (!candidates.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Tactical safety net for both non-easy levels: take a move that
    // wins outright, or block the opponent's if they have one, before
    // relying on positional judgement at all.
    const ownWin = findWinningMove(board, color, candidates);
    if (ownWin) return ownWin;
    const opponentWin = findWinningMove(board, GomokuCore.otherColor(color), candidates);
    if (opponentWin) return opponentWin;

    if (config.style === "greedy") {
      const ranked = scoredCandidates(board, color, candidates);
      const topN = Math.min(3, ranked.length);
      const pick = ranked[Math.floor(Math.random() * topN)];
      return [pick.r, pick.c];
    }

    return searchBestMove(board, color, candidates, config.maxDepth, config.nodeBudget, config.timeBudgetMs);
  }

  return {
    evaluateFor,
    chooseMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GomokuAi;
}
if (typeof window !== "undefined") {
  window.GomokuAi = GomokuAi;
}
