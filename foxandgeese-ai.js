// foxandgeese-ai.js
// Offline opponent for Fox and Geese, for either side, three heuristic
// levels (no deep search):
//   1 = easy   - a random legal move
//   2 = medium - the fox takes the most geese it can and otherwise keeps
//                away from points where it would be shut in; the geese
//                move up together and never leave a goose where the fox
//                can jump it
//   3 = hard   - like medium, plus one level of look-ahead: every move is
//                scored by the position after the opponent's best answer
// Ties are broken at random.

const FoxAndGeeseAi = (function () {
  const CORE = FoxAndGeeseCore;

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
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

  // Most geese the fox could take with one move from here.
  function foxThreat(board) {
    let best = 0;
    CORE.foxMoves(board).forEach((m) => { if (m.captured.length > best) best = m.captured.length; });
    return best;
  }

  // Points the fox can step to (its room to breathe).
  function foxRoom(board) {
    const f = CORE.foxAt(board);
    if (f === -1) return 0;
    return CORE.NEIGHBORS[f].filter(({ to }) => board[to] === "").length;
  }

  // Points the fox could still walk to (empty points connected to it):
  // the geese win by shrinking this to nothing.
  function foxArea(board) {
    const f = CORE.foxAt(board);
    if (f === -1) return 0;
    const seen = new Set([f]);
    const stack = [f];
    while (stack.length) {
      const i = stack.pop();
      CORE.NEIGHBORS[i].forEach(({ to }) => {
        if (board[to] === "" && !seen.has(to)) { seen.add(to); stack.push(to); }
      });
    }
    return seen.size - 1;
  }

  // Directions around the fox that are shut for good: a goose there that
  // cannot be jumped (the point behind it is taken or off the board).
  function foxWalls(board) {
    const f = CORE.foxAt(board);
    if (f === -1) return 0;
    const r = CORE.rowOf(f), c = CORE.colOf(f);
    let walls = 0;
    CORE.DIRS.forEach((d) => {
      const r1 = r + d.dr, c1 = c + d.dc;
      if (!CORE.isOnBoard(r1, c1)) { walls++; return; }
      if (board[CORE.idx(r1, c1)] !== "G") return;
      const r2 = r1 + d.dr, c2 = c1 + d.dc;
      if (!CORE.isOnBoard(r2, c2) || board[CORE.idx(r2, c2)] !== "") walls++;
    });
    return walls;
  }

  // How far up the geese have come, how few of them stand alone, and how
  // few are already above the fox: geese never move back down, so a
  // goose above the fox can no longer help to shut it in.
  function geeseShape(board) {
    let advance = 0, lonely = 0, passed = 0;
    const f = CORE.foxAt(board);
    const foxRow = f === -1 ? 0 : CORE.rowOf(f);
    CORE.POINTS.forEach((i) => {
      if (board[i] !== "G") return;
      if (CORE.rowOf(i) < foxRow) passed++;
      advance += CORE.SIZE - 1 - CORE.rowOf(i);
      const friends = CORE.NEIGHBORS[i].filter(({ to }) => board[to] === "G").length;
      if (!friends) lonely++;
    });
    return advance - lonely * 3 - passed * 20;
  }

  // The position from the geese's side: more is better for the geese.
  function evaluate(board, toMove) {
    const end = CORE.detectGameEnd(board, toMove);
    if (end.status !== "normal") return end.winner === "geese" ? 10000 : -10000;
    return CORE.countGeese(board) * 100
      - foxArea(board) * 6
      - foxRoom(board) * 12
      + foxWalls(board) * 15
      - (toMove === "fox" ? foxThreat(board) * 80 : 0)
      + geeseShape(board);
  }

  function chooseMedium(board, side, moves) {
    if (side === "fox") {
      return bestBy(moves, (m) => {
        const after = CORE.applyMove(board, m);
        return m.captured.length * 100 + foxRoom(after) * 10 + (CORE.geeseMoves(after).length ? 0 : 1000);
      });
    }
    return bestBy(moves, (m) => {
      const after = CORE.applyMove(board, m);
      let s = -foxThreat(after) * 100 - foxArea(after) * 4 - foxRoom(after) * 10 + foxWalls(after) * 10 + geeseShape(after);
      if (!CORE.foxMoves(after).length) s += 10000;
      return s;
    });
  }

  function chooseHard(board, side, moves) {
    const other = CORE.otherSide(side);
    const sign = side === "geese" ? 1 : -1;
    return bestBy(moves, (m) => {
      const after = CORE.applyMove(board, m);
      const replies = CORE.getLegalMoves(after, other);
      if (!replies.length || CORE.detectGameEnd(after, other).status !== "normal") return sign * evaluate(after, other);
      let worst = Infinity;
      replies.forEach((r) => {
        const v = sign * evaluate(CORE.applyMove(after, r), side);
        if (v < worst) worst = v;
      });
      return worst;
    });
  }

  function chooseMove(board, side, level) {
    const moves = CORE.getLegalMoves(board, side);
    if (!moves.length) return null;
    if (level === 1) return pickRandom(moves);
    if (level === 2) return chooseMedium(board, side, moves);
    return chooseHard(board, side, moves);
  }

  return { chooseMove, evaluate, foxThreat };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FoxAndGeeseAi;
}
if (typeof window !== "undefined") {
  window.FoxAndGeeseAi = FoxAndGeeseAi;
}
