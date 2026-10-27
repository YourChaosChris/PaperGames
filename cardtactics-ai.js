// cardtactics-ai.js
// Offline opponent for Card Tactics (rules 2):
//   1 = easy   - random legal move, but takes a winning move it sees
//   2 = medium - one move deep: material, progress and safety, picked
//                among the best few with some randomness
//   3 = hard   - alpha-beta search three moves deep with a node budget
//                and a wall-clock deadline.
// Levels 2 and 3 look ahead on a blind copy (CardTacticsCore.blindState):
// a card that is used is replaced by an unknown one, so the computer never
// looks into the face-down pile and knows nothing the player cannot see.

const CardTacticsAi = (function () {
  const INF = 1e9;
  const WIN = INF / 2;
  const HOME_VALUE = 900;
  const STONE_VALUE = 100;

  function core() { return CardTacticsCore; }

  // Progress of a stone toward its goal row: 0 on the start row, rising
  // faster near the goal so a stone close to crossing counts more.
  function progressBonus(color, r) {
    const C = core();
    const dist = Math.abs(C.goalRow(color) - r);
    const steps = C.ROWS - 1 - dist;
    return steps * steps * 4;
  }

  // Squares each side attacks with the cards it could use next: the
  // side to move uses the display; the other side, after this move, sees
  // the same display with one card swapped, so the display is a fair
  // estimate for both.
  function attackMap(state, color) {
    const C = core();
    const map = {};
    for (let r = 0; r < C.ROWS; r++) for (let c = 0; c < C.COLS; c++) {
      const p = state.board[r][c];
      if (!p || p.color !== color) continue;
      state.hands[color].forEach((id) => {
        if (!id) return; // an unknown card in a blind search state
        C.cardMovesFor(id, color).forEach(([dr, dc]) => {
          const tr = r + dr, tc = c + dc;
          if (C.inBounds(tr, tc)) map[tr * C.COLS + tc] = true;
        });
      });
    }
    return map;
  }

  function evaluateFor(color, state) {
    const C = core();
    if (state.gameOver) {
      if (state.winner === color) return WIN;
      if (state.winner === "draw") return 0;
      return -WIN;
    }
    const opp = C.otherPlayer(color);
    let score = (state.home[color] - state.home[opp]) * HOME_VALUE;
    const toMove = state.currentPlayer;
    const attacks = { black: attackMap(state, "black"), white: attackMap(state, "white") };
    for (let r = 0; r < C.ROWS; r++) {
      for (let c = 0; c < C.COLS; c++) {
        const piece = state.board[r][c];
        if (!piece) continue;
        const sign = piece.color === color ? 1 : -1;
        let value = STONE_VALUE + progressBonus(piece.color, r);
        const enemy = C.otherPlayer(piece.color);
        // A stone the side to move can take is mostly lost.
        if (enemy === toMove && attacks[enemy][r * C.COLS + c]) value *= 0.45;
        score += sign * value;
      }
    }
    // Stones of the side to move that can cross right now.
    C.getLegalMoves(state, toMove).some((m) => {
      if (!m.home) return false;
      score += (toMove === color ? 1 : -1) * HOME_VALUE * 0.6;
      return true;
    });
    return score;
  }

  function orderMoves(moves, state) {
    const key = (m) => (m.home ? 2 : 0) + (state.board[m.to[0]][m.to[1]] ? 1 : 0);
    return moves.slice().sort((a, b) => key(b) - key(a));
  }

  function step(state, color, m) {
    return m ? core().applyMove(state, color, m) : core().applyPass(state, color);
  }

  function minimax(state, depth, alpha, beta, perspective, searchState) {
    const C = core();
    if (searchState.aborted) return 0;
    searchState.nodes++;
    if (searchState.nodes > searchState.budget || Date.now() > searchState.deadline) {
      searchState.aborted = true;
      return 0;
    }
    if (state.gameOver) {
      const v = evaluateFor(perspective, state);
      // Prefer quicker wins and slower losses.
      return v > 0 ? v - state.ply : (v < 0 ? v + state.ply : 0);
    }
    if (depth <= 0) return evaluateFor(perspective, state);
    const colorToMove = state.currentPlayer;
    let moves = orderMoves(C.getLegalMoves(state, colorToMove), state);
    if (!moves.length) moves = [null];
    const maximizing = colorToMove === perspective;
    let best = maximizing ? -INF : INF;
    for (const m of moves) {
      const score = minimax(step(state, colorToMove, m), depth - 1, alpha, beta, perspective, searchState);
      if (searchState.aborted) return best;
      if (maximizing) {
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

  function searchBestMove(state, color, moves, config, random) {
    const searchState = { nodes: 0, budget: config.nodeBudget, aborted: false, deadline: Date.now() + config.timeBudgetMs };
    let ordered = moves.map((m) => ({ move: m, score: evaluateFor(color, step(state, color, m)) + (random() - 0.5) * config.noise }))
      .sort((a, b) => b.score - a.score).map((e) => e.move);
    let lastCompleteBest = ordered[0];
    for (let depth = 1; depth <= config.maxDepth; depth++) {
      let bestScore = -INF;
      let bestMove = null;
      let alpha = -INF;
      for (const m of ordered) {
        const score = minimax(step(state, color, m), depth - 1, alpha, INF, color, searchState);
        if (searchState.aborted) break;
        if (score > bestScore) {
          bestScore = score;
          bestMove = m;
          if (score > alpha) alpha = score;
        }
      }
      if (searchState.aborted || !bestMove) break;
      lastCompleteBest = bestMove;
      ordered = [bestMove].concat(ordered.filter((m) => m !== bestMove));
    }
    return lastCompleteBest;
  }

  const LEVEL_CONFIG = {
    1: { style: "random" },
    2: { style: "greedy", topN: 3 },
    3: { style: "search", maxDepth: 3, nodeBudget: 60000, timeBudgetMs: 1500, noise: 6 }
  };

  // Returns a move from getLegalMoves, or null when the player has to pass.
  function chooseMove(state, color, level, rng) {
    const C = core();
    const random = rng || Math.random;
    const moves = C.getLegalMoves(state, color);
    if (!moves.length) return null;
    if (typeof level !== "number" || level < 1) level = 1;
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[3];

    const winning = moves.find((m) => step(state, color, m).winner === color);
    if (winning) return winning;

    if (config.style === "random") {
      return moves[Math.floor(random() * moves.length)];
    }
    const blind = C.blindState(state);
    if (config.style === "greedy") {
      const scored = moves.map((m) => ({ move: m, score: evaluateFor(color, step(blind, color, m)) + random() }));
      scored.sort((a, b) => b.score - a.score);
      const topN = Math.min(config.topN, scored.length);
      return scored[Math.floor(random() * topN)].move;
    }
    return searchBestMove(blind, color, moves, config, random);
  }

  return { evaluateFor, chooseMove, LEVEL_CONFIG };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CardTacticsAi;
}
if (typeof window !== "undefined") {
  window.CardTacticsAi = CardTacticsAi;
}
