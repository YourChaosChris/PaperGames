// yut-ai.js
// Computer opponent and hint for Yut. Draft by Gemini (flash-lite), reviewed and
// corrected by Claude (ring danger check without wrap-around, backdo rule).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./yut-core.js"));
  else root.YutAI = factory(root.YutCore);
})(typeof self !== "undefined" ? self : this, function (YutCore) {
  "use strict";
  const SPECIAL = [5, 10, 15, 22];
  const pos = (p) => (p.route.length ? p.route[p.route.length - 1] : -1);

  function allMoves(state) {
    if (!state.pending || !state.pending.length) return [];
    let moves = [];
    Array.from(new Set(state.pending)).forEach((st) => { moves = moves.concat(YutCore.legalMoves(state, st)); });
    return moves;
  }

  // An opponent piece 1..5 ring steps behind the node can hit it.
  function threatened(state, node) {
    if (typeof node !== "number" || node < 1 || node > 19) return false;
    return state.pieces.some((p) => {
      if (p.player === state.turn || p.done) return false;
      const at = pos(p);
      return at >= 1 && at <= 19 && node - at >= 1 && node - at <= 5;
    });
  }

  function scoreMove(state, move) {
    let score = 0;
    if (move.finishes) score += 100;
    score += (move.captures ? move.captures.length : 0) * 60;
    if (SPECIAL.includes(move.to)) score += 8;
    if (move.from === -1) score += 5 * move.pieceIds.length;
    if (move.steps > 0) score += 3 * move.steps;
    if (threatened(state, move.to)) score -= 25;
    if (move.steps === -1) {
      score -= 15;
      if (threatened(state, move.from) && !threatened(state, move.to)) score += 40;
    }
    if (state.pieces.some((p) => p.player === state.turn && !p.done && !move.pieceIds.includes(p.id) && pos(p) === move.to)) score += 10;
    return score;
  }

  function ranked(state) {
    return allMoves(state).map((m) => ({ move: m, score: scoreMove(state, m) })).sort((a, b) => b.score - a.score);
  }

  function chooseMove(state, rng, level) {
    const r = ranked(state);
    if (!r.length) return null;
    const rand = typeof rng === "function" ? rng : Math.random;
    if (level === 1 && rand() < 0.7) return r[Math.floor(rand() * r.length)].move;
    const best = r.filter((x) => x.score === r[0].score);
    return best[Math.floor(rand() * best.length)].move;
  }

  function hint(state) {
    const r = ranked(state);
    return r.length ? r[0].move : null;
  }

  return { allMoves, scoreMove, chooseMove, hint };
});
