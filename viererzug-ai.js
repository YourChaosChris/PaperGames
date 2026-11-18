// viererzug-ai.js
// Offline opponent for Four Moves, three levels on viererzug-core.js.
//   1 = easy   - random legal move, but takes an immediate win
//   2 = medium - looks one reply ahead (takes a win, avoids giving one), light randomness
//   3 = hard   - iterative deepening alpha-beta with a node budget

const ViererzugAi = (function () {
  const INF = 1e9;
  const MAX_DEPTH = 6;
  const NODE_BUDGET = 40000;

  // Open four-cell sets of one colour count, sets with both colours are dead.
  function evaluateFor(color, board) {
    const opp = ViererzugCore.otherColor(color);
    const weight = [0, 1, 10, 60];
    let score = 0;
    for (const w of ViererzugCore.WINDOWS) {
      let mine = 0;
      let theirs = 0;
      for (const [r, c] of w.cells) {
        if (board[r][c] === color) mine++;
        else if (board[r][c] === opp) theirs++;
      }
      if (mine && theirs) continue;
      if (mine) score += weight[mine];
      else if (theirs) score -= weight[theirs];
    }
    return score;
  }

  function terminalScore(state, perspective, depth) {
    const res = state.result;
    if (res.winner) return res.winner === perspective ? INF / 2 - depth : -INF / 2 + depth;
    return 0;
  }

  function minimax(state, depth, maxDepth, alpha, beta, perspective, ss) {
    if (ss.aborted) return 0;
    if (++ss.nodes > ss.budget) { ss.aborted = true; return 0; }
    if (state.result) return terminalScore(state, perspective, depth);
    if (depth >= maxDepth) return evaluateFor(perspective, state.board);
    const maximizing = state.turn === perspective;
    let best = maximizing ? -INF : INF;
    for (const m of ViererzugCore.getLegalMoves(state)) {
      const score = minimax(ViererzugCore.step(state, m), depth + 1, maxDepth, alpha, beta, perspective, ss);
      if (ss.aborted) return best;
      if (maximizing) { if (score > best) best = score; if (score > alpha) alpha = score; }
      else { if (score < best) best = score; if (score < beta) beta = score; }
      if (beta <= alpha) break;
    }
    return best;
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function searchBest(state, moves, maxDepth, budget) {
    const color = state.turn;
    const ss = { nodes: 0, budget, aborted: false };
    let ordered = shuffle(moves);
    let best = null;
    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      for (const m of ordered) {
        const score = minimax(ViererzugCore.step(state, m), 1, depth, alpha, INF, color, ss);
        if (ss.aborted) break;
        if (score > bestScore) { bestScore = score; bestMove = m; if (score > alpha) alpha = score; }
      }
      if (ss.aborted || !bestMove) break;
      best = bestMove;
      if (bestScore > INF / 4) break; // forced win found
      ordered = [bestMove].concat(ordered.filter((m) => m !== bestMove));
    }
    return best || moves[Math.floor(Math.random() * moves.length)];
  }

  function chooseMove(state, level) {
    const moves = ViererzugCore.getLegalMoves(state);
    if (!moves.length) return null;
    const color = state.turn;
    const wins = moves.filter((m) => {
      const r = ViererzugCore.step(state, m).result;
      return r && r.winner === color;
    });
    if (wins.length) return wins[Math.floor(Math.random() * wins.length)];
    if (typeof level !== "number" || level < 1) level = 1;
    if (level === 1) return moves[Math.floor(Math.random() * moves.length)];
    if (level === 2) {
      const scored = moves.map((m) => {
        const next = ViererzugCore.step(state, m);
        const replies = ViererzugCore.getLegalMoves(next);
        // A move that lets the other side win at once is the worst one.
        const loses = replies.some((rm) => {
          const r = ViererzugCore.step(next, rm).result;
          return r && r.winner && r.winner !== color;
        });
        return { m, score: loses ? -INF : evaluateFor(color, next.board) };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored[Math.floor(Math.random() * Math.min(3, scored.length))].m;
    }
    return searchBest(state, moves, MAX_DEPTH, NODE_BUDGET);
  }

  return { evaluateFor, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ViererzugAi;
}
if (typeof window !== "undefined") {
  window.ViererzugAi = ViererzugAi;
}
