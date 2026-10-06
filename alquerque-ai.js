// alquerque-ai.js
// Offline opponent for Alquerque, three heuristic levels (no deep
// search):
//   1 = easy   - a random legal move
//   2 = medium - the capture sequence that takes the most pieces; with no
//                capture available, a step that leaves no piece of its
//                own open to an immediate capture
//   3 = hard   - like medium, plus one level of look-ahead: every
//                candidate is scored by what it takes minus what the
//                opponent's best answer takes back
// Ties are broken at random, so the computer doesn't always play the
// same game.

const AlquerqueAi = (function () {
  const CORE = AlquerqueCore;

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // Most pieces the side to move could take with its best capture now.
  function bestCaptureCount(board, color) {
    let best = 0;
    CORE.getLegalMoves(board, color).forEach((m) => {
      if (m.captured.length > best) best = m.captured.length;
    });
    return best;
  }

  function bestBy(moves, scoreOf) {
    let best = -Infinity;
    let top = [];
    moves.forEach((m) => {
      const s = scoreOf(m);
      if (s > best) { best = s; top = [m]; } else if (s === best) top.push(m);
    });
    return pickRandom(top);
  }

  function chooseMedium(board, color, moves) {
    const enemy = CORE.otherColor(color);
    if (moves[0].captured.length) {
      return bestBy(moves, (m) => m.captured.length);
    }
    const safe = moves.filter((m) => bestCaptureCount(CORE.applyMove(board, m), enemy) === 0);
    return pickRandom(safe.length ? safe : moves);
  }

  function chooseHard(board, color, moves) {
    const enemy = CORE.otherColor(color);
    return bestBy(moves, (m) => {
      const after = CORE.applyMove(board, m);
      if (!CORE.countPieces(after, enemy) || !CORE.getLegalMoves(after, enemy).length) return 1000;
      return m.captured.length * 10 - bestCaptureCount(after, enemy) * 10;
    });
  }

  function chooseMove(board, color, level) {
    const moves = CORE.getLegalMoves(board, color);
    if (!moves.length) return null;
    if (level === 1) return pickRandom(moves);
    if (level === 2) return chooseMedium(board, color, moves);
    return chooseHard(board, color, moves);
  }

  return { chooseMove, bestCaptureCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AlquerqueAi;
}
if (typeof window !== "undefined") {
  window.AlquerqueAi = AlquerqueAi;
}
