// shogi-ai.js
// Offline Shogi opponent, three strength levels built on shogi-core.js,
// mirroring xiangqi-ai.js's structure but treating drops as ordinary
// actions alongside board moves (Shogi's branching factor is much
// larger than Xiangqi's once both hands fill up with captured pieces,
// so search stays shallow and leans on a wall-clock deadline as the
// real safety net - node count alone doesn't reliably bound time when
// per-node cost varies, the same lesson learned tuning the Othello AI):
//   1 = easy   - random legal action (move or drop)
//   2 = medium - 1-ply material evaluation with light randomness
//   3 = hard   - shallow alpha-beta search over moves and drops alike,
//                bounded by both a node budget and a time budget

const ShogiAi = (function () {
  const INF = 1e9;

  const PIECE_VALUE = {
    P: 100, L: 300, N: 350, S: 500, G: 600, B: 850, R: 1000,
    "+P": 550, "+L": 600, "+N": 600, "+S": 650, "+B": 1050, "+R": 1200,
    K: 20000
  };

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function evaluateFor(color, state) {
    let score = 0; // positive favors black ("b")
    for (let r = 0; r < ShogiCore.SIZE; r++) {
      for (let c = 0; c < ShogiCore.SIZE; c++) {
        const piece = state.board[r][c];
        if (!piece) continue;
        const sign = piece.color === "b" ? 1 : -1;
        score += sign * (PIECE_VALUE[piece.type] || 0);
      }
    }
    ShogiCore.HAND_TYPES.forEach((t) => {
      score += state.hands.b[t] * (PIECE_VALUE[t] || 0);
      score -= state.hands.w[t] * (PIECE_VALUE[t] || 0);
    });
    return color === "b" ? score : -score;
  }

  function getActions(state, color) {
    const moves = ShogiCore.legalMoves(state, color).map((m) => Object.assign({ kind: "move" }, m));
    const drops = ShogiCore.legalDrops(state, color).map((d) => Object.assign({ kind: "drop" }, d));
    return moves.concat(drops);
  }

  function applyAction(state, color, action) {
    if (action.kind === "move") return ShogiCore.applyMove(state, action);
    return ShogiCore.applyDrop(state, color, action.piece, action.to[0], action.to[1]);
  }

  function orderActions(actions) {
    return actions.slice().sort((a, b) => {
      const aCap = a.kind === "move" && a.captured ? 1 : 0;
      const bCap = b.kind === "move" && b.captured ? 1 : 0;
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

    const actions = getActions(state, colorToMove);
    if (!actions.length) {
      // Checkmate (Shogi has no stalemate) - the side to move has lost.
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const ordered = orderActions(actions);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const action of ordered) {
      const next = applyAction(state, colorToMove, action);
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

  function searchBestAction(state, color, actions, maxDepth, nodeBudget, timeBudgetMs) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let ordered = orderActions(actions);

    const rootScored = ordered.map((action) => ({
      action,
      score: evaluateFor(color, applyAction(state, color, action)) + (Math.random() - 0.5) * 2
    }));
    rootScored.sort((a, b) => b.score - a.score);
    ordered = rootScored.map((e) => e.action);

    let lastCompleteBest = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestAction = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const action of ordered) {
        const next = applyAction(state, color, action);
        const score = minimax(next, otherColor(color), 1, depth, alpha, INF, color, searchState);
        if (searchState.aborted) {
          depthAborted = true;
          break;
        }
        if (score > bestScore) {
          bestScore = score;
          bestAction = action;
          if (score > alpha) alpha = score;
        }
      }

      if (depthAborted || !bestAction) break;

      lastCompleteBest = bestAction;
      ordered = [bestAction].concat(ordered.filter((a) => a !== bestAction));
    }

    return lastCompleteBest || actions[Math.floor(Math.random() * actions.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 4 },
    3: { style: "search", maxDepth: 2, nodeBudget: 60000, timeBudgetMs: 2500 }
  };

  function chooseAction(state, color, level) {
    const actions = getActions(state, color);
    if (!actions.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return actions[Math.floor(Math.random() * actions.length)];
    }

    if (config.style === "greedy") {
      const scored = actions.map((action) => ({
        action,
        score: evaluateFor(color, applyAction(state, color, action))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].action;
    }

    return searchBestAction(state, color, actions, config.maxDepth, config.nodeBudget, config.timeBudgetMs);
  }

  return {
    evaluateFor,
    getActions,
    chooseAction
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ShogiAi;
}
if (typeof window !== "undefined") {
  window.ShogiAi = ShogiAi;
}
