// baghchal-ai.js
// Offline opponent for Bagh-Chal, able to play either side, mirroring the
// structure used for the other asymmetric-goal games here (Hnefatafl,
// Fanorona):
//   1 = easy   - random legal move/placement
//   2 = medium - 1-ply material/positional evaluation with light
//                randomness among the top candidates
//   3 = hard   - iterative deepening alpha-beta with a shared node
//                budget AND a wall-clock deadline
//
// The evaluation function is deliberately asymmetric, matching how the
// two sides actually win:
//   - Tigers care about captured goats (the only way tigers win) and
//     about their own mobility (a tiger with no legal move anywhere is
//     how goats win, so staying mobile is existential, not just nice).
//   - Goats care about how many goats remain in play (their only
//     resource) and about restricting tiger mobility (their only path
//     to victory is trapping every tiger) - a goat placement/move that
//     leaves itself immediately capturable is scored down via the
//     "capture threats available to the tiger right now" term, which
//     is what gives the goat AI its "safe placement/blocking" bias.

const BaghChalAi = (function () {
  const INF = 1e9;
  const CORE = BaghChalCore;

  function countLegal(state, player) {
    return CORE.getLegalMoves(state, player).length;
  }

  function countCaptureThreats(state) {
    // Number of distinct goats a tiger could capture right now - a
    // direct measure of how exposed the goat side currently is.
    const board = state.board;
    const threatened = new Set();
    for (let i = 0; i < CORE.TOTAL_POINTS; i++) {
      if (board[i] !== "tiger") continue;
      CORE.JUMPS[i].forEach(({ mid, landing }) => {
        if (board[mid] === "goat" && board[landing] === null) threatened.add(mid);
      });
    }
    return threatened.size;
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      if (state.winner === side) return INF / 2;
      if (state.winner) return -INF / 2;
    }

    const goatsAlive = CORE.countPieces(state.board, "goat");
    const goatsInHand = CORE.TOTAL_GOATS - state.placedGoats;
    const goatResource = goatsAlive + goatsInHand; // goats already lost can never come back
    const tigerMobility = countLegal(state, "tiger");
    const goatMobility = countLegal(state, "goat");
    const captureThreats = countCaptureThreats(state);

    let score = 0;
    // Captures are the tiger's only win condition, so they dominate.
    score += (side === "tiger" ? 1 : -1) * state.capturedGoats * 120;
    // Goats losing their only resource is symmetric to the above, but
    // weighted a bit lighter since a captured goat is already reflected
    // in capturedGoats above too (double-counting on purpose: capturing
    // is good for tigers AND bad for goats, not just a zero-sum swap of
    // a single shared term, since goats separately need enough goats
    // left to eventually surround every tiger).
    score += (side === "goat" ? 1 : -1) * goatResource * 8;
    // Tiger mobility matters enormously to tigers (their only loss
    // condition is having none) and matters to goats too (restricting
    // it is literally their win condition).
    score += (side === "tiger" ? 1 : -1) * tigerMobility * 6;
    // A goat that can't move is only a minor concern (goats don't lose
    // by immobility under the standard win conditions), but a
    // completely locked position is still worth a small nudge away from.
    score += (side === "goat" ? 1 : -1) * goatMobility * 0.5;
    // Immediate capture exposure: bad for goats, good for tigers, since
    // it's a capture the tiger AI can very likely take next.
    score += (side === "tiger" ? 1 : -1) * captureThreats * 25;

    return score;
  }

  function moveKey(m) {
    if (m.type === "place") return "P" + m.to;
    if (m.type === "capture") return "C" + m.from + "-" + m.to;
    return "M" + m.from + "-" + m.to;
  }

  function orderMoves(moves) {
    // Captures first, then anything that doesn't hand back a capture -
    // cheap and effective move ordering for alpha-beta pruning.
    return moves.slice().sort((a, b) => {
      const aCap = a.type === "capture" ? 1 : 0;
      const bCap = b.type === "capture" ? 1 : 0;
      return bCap - aCap;
    });
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

    const moves = CORE.getLegalMoves(state, playerToMove);
    if (!moves.length) {
      return playerToMove === perspective ? -INF / 2 + depth : INF / 2 - depth;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const ordered = orderMoves(moves);
    const isMaximizing = playerToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const next = CORE.applyMove(state, playerToMove, m);
      const score = minimax(next, CORE.otherPlayer(playerToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState);
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
    let ordered = orderMoves(moves);

    const rootScored = ordered.map((m) => ({
      move: m,
      score: evaluateFor(side, CORE.applyMove(state, side, m)) + (Math.random() - 0.5) * 2
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
        const next = CORE.applyMove(state, side, m);
        const score = minimax(next, CORE.otherPlayer(side), 1, depth, alpha, INF, side, searchState);
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
      const bestKey = moveKey(bestMove);
      ordered = [bestMove].concat(ordered.filter((m) => moveKey(m) !== bestKey));
    }

    return lastCompleteBest || moves[Math.floor(Math.random() * moves.length)];
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 4 },
    3: { style: "search", maxDepth: 3, nodeBudget: 50000, timeBudgetMs: 2000 }
  };

  function chooseMove(state, side, level) {
    const moves = CORE.getLegalMoves(state, side);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(side, CORE.applyMove(state, side, m))
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
  module.exports = BaghChalAi;
}
if (typeof window !== "undefined") {
  window.BaghChalAi = BaghChalAi;
}
