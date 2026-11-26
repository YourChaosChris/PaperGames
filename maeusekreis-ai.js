// maeusekreis-ai.js
// Computer side of Mouse Ring, from the backward search of the core.
// Cat: a step that still catches the mouse in the steps left, the quickest
// one; if there is none, the step closest to the mouse. Mouse: a step after
// which the cat can no longer catch it; if there is none, the step that
// keeps it free longest.
//   1 = easy   - every second step at random
//   2 = medium - one step in five at random
//   3 = hard   - always the best step

const MaeusekreisAi = (function () {
  const Core = typeof MaeusekreisCore !== "undefined" ? MaeusekreisCore : require("./maeusekreis-core.js");

  function best(state) {
    const moves = Core.getLegalMoves(state);
    if (!moves.length) return null;
    const n = Core.BOARDS[state.level].points;
    const scored = moves.map((to) => {
      const next = Core.applyMove(state, to);
      let v;
      if (state.turn === "cat") {
        if (next.result && next.result.winner === "cat") v = 1000;
        else if (next.result) v = -1000;
        else {
          const need = Core.steps(state.level, next.cat, next.mouse, "mouse");
          v = need <= Core.left(next) ? 500 - need : -Core.distance(n, next.cat, next.mouse);
        }
      } else {
        if (next.result && next.result.winner === "mouse") v = 1000;
        else if (next.result) v = -1000;
        else {
          const need = Core.steps(state.level, next.cat, next.mouse, "cat");
          v = need > Core.left(next) ? 500 + Core.distance(n, next.cat, next.mouse) : Math.min(need, 99);
        }
      }
      return { to: to, v: v };
    });
    scored.sort((a, b) => b.v - a.v || a.to - b.to);
    return scored[0].to;
  }

  function chooseMove(state, level, rng) {
    const r = rng || Math.random;
    const moves = Core.getLegalMoves(state);
    if (!moves.length) return null;
    const chance = level <= 1 ? 0.5 : level === 2 ? 0.2 : 0;
    if (r() < chance) return moves[Math.floor(r() * moves.length)];
    return best(state);
  }

  return { chooseMove, best };
})();

if (typeof module !== "undefined") module.exports = MaeusekreisAi;
