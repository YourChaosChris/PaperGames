// konane-ai.js
// Offline Konane opponent, three strength levels built on konane-core.js,
// mirroring fanorona-ai.js's structure:
//   1 = easy   - random full turn (a full turn is one legal jump chain
//                stopped at any legal point - mandatory capture already
//                narrows the very first jump, but stopping early is
//                always a legal choice thereafter)
//   2 = medium - 1-ply material/positional/mobility evaluation with light
//                randomness among the top candidates
//   3 = hard   - iterative deepening alpha-beta with root-level pruning
//                between sibling moves and a shared node budget
//
// A "move" here is always a FULL turn as enumerated by
// KonaneCore.enumerateFullMoves: since stopping a jump chain is optional,
// that already includes every legal stopping point, not just maximal
// chains, so a normal search ply lands cleanly on the position after one
// complete turn - the same reasoning fanorona-ai.js documents for its own
// enumerateFullMoves. Depth is kept shallow (like Fanorona's) rather than
// checkers' deeper search, since a single Konane turn can itself branch
// into a large number of different stopping points once a long chain is
// available, making each ply more expensive to expand.
//
// Evaluation combines simple material (stone count) with mobility - the
// number of jumps immediately available to each side - since Konane has
// no material comeback mechanic once a side runs low on legal jumps: a
// player who is maneuvered into zero legal jumps loses outright, so
// mobility is nearly as important a signal as material, especially in
// the endgame. The minimax loss detection below (an empty move list
// scoring -INF/INF for whoever is to move) already captures that
// "leaving yourself with no jumps loses" endgame case directly, rather
// than relying on the mobility heuristic to approximate it.

const KonaneAi = (function () {
  const INF = 1e9;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function applyFullMove(board, fullMove) {
    return fullMove.steps.reduce(
      (b, step) => KonaneCore.applyStep(b, step.from, step.to, step.captured),
      board
    );
  }

  // A mild center-control bonus: a stone away from the board's edges has
  // more potential jump directions available over the course of the
  // game, which is the closest Konane analogue to checkers' advancement
  // bonus (Konane has no promotion to reward instead).
  function positionalBonus(r, c) {
    return 7 - (Math.abs(r - 3.5) + Math.abs(c - 3.5));
  }

  function evaluateFor(color, board) {
    const opp = otherColor(color);
    let score = 0;
    for (let r = 0; r < KonaneCore.SIZE; r++) {
      for (let c = 0; c < KonaneCore.SIZE; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        const sign = piece === color ? 1 : -1;
        score += sign * 100;
        score += sign * positionalBonus(r, c) * 0.5;
      }
    }
    // Mobility: how many single jumps are immediately available to each
    // side right now - a cheap proxy for how close either player is to
    // running out of legal moves and losing outright.
    const myMobility = KonaneCore.getLegalMoves(board, color).length;
    const oppMobility = KonaneCore.getLegalMoves(board, opp).length;
    score += (myMobility - oppMobility) * 4;
    return score;
  }

  function orderMoves(moves) {
    // Turns capturing more stones first - cheap, effective pruning aid.
    return moves.slice().sort((a, b) => b.captured.length - a.captured.length);
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

    const moves = KonaneCore.enumerateFullMoves(board, colorToMove);
    if (!moves.length) {
      // colorToMove has no legal jump and therefore loses immediately.
      return colorToMove === perspective ? -INF / 2 : INF / 2;
    }
    if (depth >= maxDepth) {
      return evaluateFor(perspective, board);
    }

    const ordered = orderMoves(moves);
    const isMaximizing = colorToMove === perspective;
    let best = isMaximizing ? -INF : INF;

    for (const m of ordered) {
      const b2 = applyFullMove(board, m);
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
    let orderedMoves = orderMoves(moves);

    const rootScored = orderedMoves.map((m) => ({
      move: m,
      score: evaluateFor(color, applyFullMove(board, m)) + (Math.random() - 0.5) * 2
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
        const b2 = applyFullMove(board, m);
        const score = minimax(b2, otherColor(color), 1, depth, alpha, INF, color, searchState);
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
    3: { style: "search", maxDepth: 3, nodeBudget: 150000 }
  };

  // Returns a full turn: { from, to, steps: [...], captured: [...] }
  function chooseMove(board, color, level) {
    const moves = KonaneCore.enumerateFullMoves(board, color);
    if (!moves.length) return null;

    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    if (config.style === "random") {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    if (config.style === "greedy") {
      const scored = moves.map((m) => ({
        move: m,
        score: evaluateFor(color, applyFullMove(board, m))
      }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(Math.random() * topN)].move;
    }

    return searchBestMove(board, color, moves, config.maxDepth, config.nodeBudget);
  }

  // Picks an opening-ritual removal cell for the AI: a small preference
  // for corners over the center (corners have fewer own neighbors to
  // worry about early) with randomness, since the two starting choices
  // are close enough in strength that hard-coding one "best" pick isn't
  // meaningfully stronger play.
  function chooseRemoval(options) {
    if (!options || !options.length) return null;
    return options[Math.floor(Math.random() * options.length)];
  }

  return {
    evaluateFor,
    applyFullMove,
    chooseMove,
    chooseRemoval
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KonaneAi;
}
if (typeof window !== "undefined") {
  window.KonaneAi = KonaneAi;
}
