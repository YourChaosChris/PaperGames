// foxandgeese-core.js
// Dependency-free rules engine for Fox and Geese, the medieval hunt game:
// one fox against thirteen geese on the 33-point cross. Rules only, no
// DOM/UI - the same separation as baghchal-core.js/alquerque-core.js.
//
// Board: a 7x7 grid without the four 2x2 corners, 33 points, indexed
// r*7+c (r,c 0..6). The same shape as the English Peg Solitaire board,
// rebuilt here rather than shared - each game keeps its own engine.
// Points are joined across and down only; this version has no diagonal
// lines.
//
// Setup (the oldest form, with 13 geese): the fox stands on the centre
// point; the geese fill the bottom arm of the cross (6 points) and the
// whole row above it (7 points).
//
// Moves, one step along a line to an empty neighbouring point:
//   - the fox in any of the four directions;
//   - a goose straight ahead (up) or sideways, never back (down).
// The fox moves first.
//
// Capturing: the fox jumps over a neighbouring goose to the empty point
// directly beyond it and removes that goose. After a jump it may jump
// again with the same move, also changing direction, as often as it can
// - but it never has to: capturing is not compulsory, and the fox may
// stop after any jump. So every prefix of a jump sequence is a complete,
// legal move. Geese never capture or jump.
//
// End: the geese win when the fox cannot move on its turn. The fox wins
// when only GEESE_TO_LOSE (5) or fewer geese are left - too few to shut
// it in - or when the geese cannot move on their turn.

const FoxAndGeeseCore = (function () {
  const SIZE = 7;
  const TOTAL_GEESE = 13;
  const GEESE_TO_LOSE = 5;
  const CENTER = 3 * SIZE + 3;

  function idx(r, c) { return r * SIZE + c; }
  function rowOf(i) { return Math.floor(i / SIZE); }
  function colOf(i) { return i % SIZE; }
  function isOnBoard(r, c) {
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
    return (r >= 2 && r <= 4) || (c >= 2 && c <= 4);
  }

  const DIRS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
  const UP = 0, DOWN = 1;

  const POINTS = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (isOnBoard(r, c)) POINTS.push(idx(r, c));

  // NEIGHBORS[i] = [{ to, dir }] for every line leaving point i.
  const NEIGHBORS = [];
  // JUMPS[i] = [{ over, to }]: two steps along the same line from i.
  const JUMPS = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = rowOf(i), c = colOf(i);
    const n = [], j = [];
    if (isOnBoard(r, c)) {
      DIRS.forEach((d, dir) => {
        if (isOnBoard(r + d.dr, c + d.dc)) {
          n.push({ to: idx(r + d.dr, c + d.dc), dir });
          if (isOnBoard(r + 2 * d.dr, c + 2 * d.dc)) j.push({ over: idx(r + d.dr, c + d.dc), to: idx(r + 2 * d.dr, c + 2 * d.dc) });
        }
      });
    }
    NEIGHBORS.push(n);
    JUMPS.push(j);
  }

  function otherSide(side) { return side === "fox" ? "geese" : "fox"; }

  // Board: array of 49; null off the board, "" empty, "F" fox, "G" goose.
  function createInitialBoard() {
    const board = new Array(SIZE * SIZE).fill(null);
    POINTS.forEach((i) => { board[i] = ""; });
    board[CENTER] = "F";
    POINTS.forEach((i) => {
      const r = rowOf(i);
      if (r >= 4) board[i] = "G";
    });
    return board;
  }

  function cloneBoard(board) { return board.slice(); }

  function countGeese(board) {
    let n = 0;
    for (let i = 0; i < board.length; i++) if (board[i] === "G") n++;
    return n;
  }

  function foxAt(board) { return board.indexOf("F"); }

  // Every fox move: steps, plus every jump sequence and each of its
  // prefixes, as { from, to, path: [from, ...landings], captured: [...] }.
  function foxMoves(board) {
    const from = foxAt(board);
    if (from === -1) return [];
    const moves = [];
    NEIGHBORS[from].forEach(({ to }) => {
      if (board[to] === "") moves.push({ from, to, path: [from, to], captured: [] });
    });
    function extend(b, at, path, captured) {
      JUMPS[at].forEach(({ over, to }) => {
        if (b[over] !== "G" || b[to] !== "") return;
        const next = b.slice();
        next[to] = "F";
        next[at] = "";
        next[over] = "";
        const p = path.concat([to]), cap = captured.concat([over]);
        moves.push({ from, to, path: p, captured: cap });
        extend(next, to, p, cap);
      });
    }
    extend(board, from, [from], []);
    return moves;
  }

  function geeseMoves(board) {
    const moves = [];
    POINTS.forEach((i) => {
      if (board[i] !== "G") return;
      NEIGHBORS[i].forEach(({ to, dir }) => {
        if (dir === DOWN) return;
        if (board[to] === "") moves.push({ from: i, to, path: [i, to], captured: [] });
      });
    });
    return moves;
  }

  function getLegalMoves(board, side) {
    return side === "fox" ? foxMoves(board) : geeseMoves(board);
  }

  function applyMove(board, move) {
    const next = board.slice();
    next[move.to] = next[move.from];
    if (move.to !== move.from) next[move.from] = "";
    move.captured.forEach((i) => { next[i] = ""; });
    return next;
  }

  // { status: "normal" } or { status, winner } for the side about to move:
  //   "fox-trapped"  the fox cannot move - geese win
  //   "too-few"      GEESE_TO_LOSE or fewer geese left - fox wins
  //   "geese-stuck"  the geese cannot move - fox wins
  function detectGameEnd(board, toMove) {
    if (countGeese(board) <= GEESE_TO_LOSE) return { status: "too-few", winner: "fox" };
    if (!getLegalMoves(board, toMove).length) {
      return toMove === "fox" ? { status: "fox-trapped", winner: "geese" } : { status: "geese-stuck", winner: "fox" };
    }
    return { status: "normal" };
  }

  return {
    SIZE, TOTAL_GEESE, GEESE_TO_LOSE, CENTER, DIRS, UP, DOWN, POINTS, NEIGHBORS, JUMPS,
    idx, rowOf, colOf, isOnBoard, otherSide, createInitialBoard, cloneBoard, countGeese,
    foxAt, foxMoves, geeseMoves, getLegalMoves, applyMove, detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FoxAndGeeseCore;
}
if (typeof window !== "undefined") {
  window.FoxAndGeeseCore = FoxAndGeeseCore;
}
