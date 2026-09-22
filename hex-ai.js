// hex-ai.js
// Offline opponent for Hex, mirroring the structure used elsewhere in
// this app:
//   1 = easy   - random legal move
//   2 = medium - 1-ply evaluation using a shortest-path-to-connect
//                heuristic, with light randomness among the best few
//   3 = hard   - the same heuristic driving a shallow alpha-beta
//                search over a capped set of the most promising
//                candidates (Hex's branching factor - up to 81 empty
//                cells - makes a full-width search hopeless within
//                any real budget), plus the usual node-budget/
//                wall-clock-deadline safety net.
//
// Hex has no material to count - the standard way to evaluate a
// position is a shortest-path search: treat your own stones as free
// to pass through, empty cells as costing one move, and the
// opponent's stones as impassable, then find the cheapest route
// across the board. Fewer moves needed is better; this is a real,
// well-established Hex heuristic (a simplification of the
// "resistance distance" evaluation used by strong Hex engines).

const HexAi = (function () {
  const INF = 1e9;
  const N = HexCore.SIZE;

  // 0-1 BFS (a deque-based shortest path for edge weights of only 0
  // or 1) from a virtual start node representing `player`'s starting
  // edge to a virtual end node representing their goal edge.
  function shortestConnectDistance(board, player) {
    const total = N * N;
    const START = total, END = total + 1;
    const dist = new Array(total + 2).fill(INF);
    const deque = [];
    dist[START] = 0;
    deque.push(START);

    function cellCost(r, c) {
      const occ = board[r][c];
      if (occ === player) return 0;
      if (occ === null) return 1;
      return INF; // opponent stone - impassable
    }

    function pushFront(node) { deque.unshift(node); }
    function pushBack(node) { deque.push(node); }

    while (deque.length) {
      const u = deque.shift();
      let neighbors;
      if (u === START) {
        neighbors = [];
        if (player === "r") {
          for (let c = 0; c < N; c++) neighbors.push([0, c]);
        } else {
          for (let r = 0; r < N; r++) neighbors.push([r, 0]);
        }
      } else if (u === END) {
        continue;
      } else {
        const r = Math.floor(u / N), c = u % N;
        neighbors = HexCore.neighborsOf(r, c);
        const onGoalEdge = player === "r" ? r === N - 1 : c === N - 1;
        if (onGoalEdge) {
          if (dist[u] < dist[END]) {
            dist[END] = dist[u];
            pushFront(END);
          }
        }
      }

      neighbors.forEach(([nr, nc]) => {
        const cost = cellCost(nr, nc);
        if (cost >= INF) return;
        const v = nr * N + nc;
        const nd = dist[u] + cost;
        if (nd < dist[v]) {
          dist[v] = nd;
          if (cost === 0) pushFront(v);
          else pushBack(v);
        }
      });
    }

    return dist[END];
  }

  function evaluateFor(side, state) {
    if (state.gameOver) {
      return state.winner === side ? INF / 2 : -INF / 2;
    }
    const opp = HexCore.otherPlayer(side);
    const myDist = shortestConnectDistance(state.board, side);
    const oppDist = shortestConnectDistance(state.board, opp);
    return (oppDist - myDist) * 10;
  }

  function candidateScore(state, player, move) {
    const next = HexCore.applyMove(state, player, move);
    return evaluateFor(player, next);
  }

  function topCandidates(state, player, moves, cap) {
    if (moves.length <= cap) return moves;
    const scored = moves.map((m) => ({ move: m, score: candidateScore(state, player, m) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, cap).map((e) => e.move);
  }

  function minimax(state, playerToMove, depth, maxDepth, alpha, beta, perspective, searchState, branchCap) {
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
    if (depth >= maxDepth) {
      return evaluateFor(perspective, state);
    }

    const allMoves = HexCore.getLegalMoves(state);
    const moves = topCandidates(state, playerToMove, allMoves, branchCap);
    const isMaximizing = playerToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of moves) {
      const next = HexCore.applyMove(state, playerToMove, m);
      const score = minimax(next, HexCore.otherPlayer(playerToMove), depth + 1, maxDepth, alpha, beta, perspective, searchState, branchCap);
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

  function searchBestMove(state, side, moves, maxDepth, nodeBudget, timeBudgetMs, branchCap) {
    const searchState = { nodes: 0, budget: nodeBudget, aborted: false, deadline: Date.now() + timeBudgetMs };
    let ordered = topCandidates(state, side, moves, branchCap);

    let lastCompleteBest = null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      let depthAborted = false;

      for (const m of ordered) {
        const next = HexCore.applyMove(state, side, m);
        const score = minimax(next, HexCore.otherPlayer(side), 1, depth, alpha, INF, side, searchState, branchCap);
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
    2: { style: "greedy", topN: 3 },
    3: { style: "search", maxDepth: 2, nodeBudget: 25000, timeBudgetMs: 2200, branchCap: 8 }
  };

  function chooseMove(state, side, level) {
    const moves = HexCore.getLegalMoves(state);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({ move: m, score: candidateScore(state, side, m) }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(state, side, moves, config.maxDepth, config.nodeBudget, config.timeBudgetMs, config.branchCap);
  }

  return { evaluateFor, shortestConnectDistance, chooseMove };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HexAi;
}
if (typeof window !== "undefined") {
  window.HexAi = HexAi;
}
