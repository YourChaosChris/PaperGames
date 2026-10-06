// seega-ai.js
// Offline opponent for Seega, three heuristic levels (no deep search):
//   1 = easy   - a random legal placement or move
//   2 = medium - captures when it can (the most stones); when placing,
//                never puts a stone alone between two enemy stones; when
//                moving, avoids leaving a stone the opponent can capture
//   3 = hard   - like medium, plus one level of look-ahead: every move is
//                scored by what it takes minus what the opponent's best
//                answer takes back
// Ties are broken at random.

const SeegaAi = (function () {
  const CORE = SeegaCore;

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function bestBy(list, scoreOf) {
    let best = -Infinity, top = [];
    list.forEach((x) => {
      const s = scoreOf(x);
      if (s > best) { best = s; top = [x]; } else if (s === best) top.push(x);
    });
    return pickRandom(top);
  }

  // Would a stone on i sit alone between two enemy stones (across or down)?
  function betweenEnemies(board, i, color) {
    const enemy = CORE.otherColor(color);
    const r = CORE.rowOf(i), c = CORE.colOf(i);
    const at = (rr, cc) => (rr >= 0 && rr < CORE.SIZE && cc >= 0 && cc < CORE.SIZE ? board[rr * CORE.SIZE + cc] : undefined);
    return (at(r - 1, c) === enemy && at(r + 1, c) === enemy) || (at(r, c - 1) === enemy && at(r, c + 1) === enemy);
  }

  function friends(board, i, color) {
    return CORE.STEP[i].filter(({ to }) => board[to] === color).length;
  }

  function choosePlacement(state, level) {
    const cells = CORE.legalPlacements(state);
    if (!cells.length) return null;
    if (level === 1) return pickRandom(cells);
    const color = state.turn;
    return bestBy(cells, (i) => (betweenEnemies(state.board, i, color) ? -100 : 0) + friends(state.board, i, color) * 3 +
      (level >= 3 ? -CORE.STEP[i].filter(({ to }) => to === CORE.CENTER).length * 2 : 0));
  }

  // Most stones `color` could capture with one move (a chain counts its
  // first step only) if it were to move now.
  function bestCapture(board, color) {
    let best = 0;
    CORE.stepMoves(board, color).forEach((m) => { if (m.captured.length > best) best = m.captured.length; });
    return best;
  }

  // Stones taken by a move plus the best follow-up chain with that stone.
  function chainGain(state, move) {
    if (move.stop) return 0;
    let gain = move.captured.length;
    let s = CORE.applyMove(state, move);
    let guard = 0;
    while (!s.over && s.chain !== null && guard++ < 20) {
      const more = CORE.legalMoves(s).filter((m) => !m.stop);
      if (!more.length) break;
      const m = bestBy(more, (x) => x.captured.length);
      gain += m.captured.length;
      s = CORE.applyMove(s, m);
    }
    return gain;
  }

  function chooseMove(state, level) {
    const moves = CORE.legalMoves(state);
    if (!moves.length) return null;
    if (level === 1) return pickRandom(moves);
    const color = state.turn, enemy = CORE.otherColor(color);
    if (level === 2) {
      return bestBy(moves, (m) => {
        if (m.stop) return 0;
        const after = CORE.applyMove(state, m);
        return m.captured.length * 100 - (after.over ? 0 : bestCapture(after.board, enemy) * 50) + friends(after.board, m.to, color);
      });
    }
    return bestBy(moves, (m) => {
      if (m.stop) return 0;
      const gain = chainGain(state, m);
      const after = CORE.applyMove(state, m);
      if (after.over) return after.result && after.result.winner === color ? 10000 : -10000;
      // The opponent's best answer (with its own chain).
      let worst = 0;
      if (after.chain === null && after.turn === enemy) {
        CORE.legalMoves(after).forEach((r) => {
          if (r.stop) return;
          const g = r.captured.length ? chainGain(after, r) : 0;
          if (g > worst) worst = g;
        });
      }
      return gain * 100 - worst * 100 + friends(after.board, m.to, color);
    });
  }

  return { choosePlacement, chooseMove, betweenEnemies };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SeegaAi;
}
if (typeof window !== "undefined") {
  window.SeegaAi = SeegaAi;
}
