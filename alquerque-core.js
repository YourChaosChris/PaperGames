// alquerque-core.js
// Dependency-free rules engine for Alquerque, the jumping game described
// in Alfonso X's Libro de los juegos (1283) and the ancestor of
// checkers. Rules only, no DOM/UI - the same separation as
// baghchal-core.js/fanorona-core.js.
//
// Board: 25 points in a 5x5 grid, indexed r*5+c (r,c 0..4). Every point
// connects orthogonally to its in-bounds neighbours. Diagonal lines
// exist only through the points where (r+c) is even: those connect
// diagonally to all their in-bounds diagonal neighbours, the others have
// no diagonal at all. A diagonal step changes r and c by one each, so it
// never changes the parity of r+c - every diagonal line runs from one
// even point to another, and the drawn pattern is the familiar one: each
// of the 16 unit squares carries exactly one diagonal, alternating
// between "\" and "/" like a chequerboard, so that the four corners and
// the centre are 8-way junctions. That is the same lattice as
// baghchal-core.js's board (rebuilt here, not shared - each game keeps
// its own engine). 40 orthogonal + 16 diagonal = 56 connections.
//
// Pieces: 12 per side. Dark ("b") fills the two rows at the top plus the
// two left points of the middle row; Light ("w") fills the two rows at
// the bottom plus the two right points of the middle row - each side
// therefore holds the half of the middle row on its own right-hand side.
// The centre stays empty. (The mirror-image setup, each side holding the
// half on its left, is the same game reflected left-to-right: the board's
// lines are symmetric under c -> 4-c because 4 is even.)
//
// Moves: a piece steps along a line to an adjacent empty point forward,
// sideways or diagonally forward - never backward, not even diagonally
// backward. Forward means towards the opponent's home rows: down the
// board (rising r) for Dark, up the board for Light. A capture jumps
// along a line over an adjacent enemy piece to the empty point directly
// beyond it, removing the jumped piece; jumps go in every direction,
// backward too (PaperGames rule - the source only forbids moving
// backward). Source: Wikipedia, "Alquerque", section Rules ("A piece
// cannot move backward."), retrieved 2026-10-06.
//
// Capturing is compulsory: whenever the side to move has a capture, only
// capturing moves are legal (the "simple" handling of a missed capture -
// the non-capturing move is never offered at all). The same rule applies
// inside a multi-jump: after a jump, if the same piece can jump again it
// must, so every capture move returned here is a complete sequence that
// cannot be extended. Any complete sequence may be chosen, not only the
// longest.
//
// The game ends when the side to move has no piece left or no legal
// move; that side loses. Since no piece can step backward, every game
// runs towards that end by itself; there is no draw rule.

const AlquerqueCore = (function () {
  const ROWS = 5;
  const COLS = 5;
  const TOTAL_POINTS = ROWS * COLS;
  const PIECES_PER_SIDE = 12;
  const CENTER = 12;

  function idx(r, c) { return r * COLS + c; }
  function rowOf(i) { return Math.floor(i / COLS); }
  function colOf(i) { return i % COLS; }
  function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }
  function hasDiagonals(r, c) { return (r + c) % 2 === 0; }

  // 8 directions; the first four are orthogonal.
  const DIRS = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: -1, dc: -1 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }
  ];

  // NEIGHBORS[i] = [{ to, dir }] for every line leaving point i.
  const NEIGHBORS = (function () {
    const table = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const r = rowOf(i), c = colOf(i);
      const list = [];
      DIRS.forEach((d, dir) => {
        if (dir >= 4 && !hasDiagonals(r, c)) return;
        const nr = r + d.dr, nc = c + d.dc;
        if (inBounds(nr, nc)) list.push({ to: idx(nr, nc), dir });
      });
      table.push(list);
    }
    return table;
  })();

  // JUMPS[i] = [{ over, to }]: two steps along the same line from i.
  const JUMPS = (function () {
    const table = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const list = [];
      NEIGHBORS[i].forEach(({ to: over, dir }) => {
        const beyond = NEIGHBORS[over].find((n) => n.dir === dir);
        if (beyond) list.push({ over, to: beyond.to });
      });
      table.push(list);
    }
    return table;
  })();

  function countConnections() {
    let n = 0;
    NEIGHBORS.forEach((list, i) => list.forEach(({ to }) => { if (to > i) n++; }));
    return n;
  }

  function otherColor(color) { return color === "b" ? "w" : "b"; }

  // Row direction of a forward step: Dark starts at the top.
  function forwardDr(color) { return color === "b" ? 1 : -1; }

  function createInitialBoard() {
    const board = new Array(TOTAL_POINTS).fill(null);
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const r = rowOf(i), c = colOf(i);
      if (r < 2 || (r === 2 && c < 2)) board[i] = "b";
      else if (r > 2 || (r === 2 && c > 2)) board[i] = "w";
    }
    return board;
  }

  function cloneBoard(board) { return board.slice(); }

  function countPieces(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) n++;
    return n;
  }

  // Every complete jump sequence for the piece on `from`, as
  // { from, to, path: [from, ...landings], captured: [...] }.
  function jumpSequences(board, from, color) {
    const enemy = otherColor(color);
    const results = [];
    function extend(b, at, path, captured) {
      let extended = false;
      JUMPS[at].forEach(({ over, to }) => {
        if (b[over] !== enemy || b[to] !== null) return;
        extended = true;
        const next = b.slice();
        next[to] = next[at];
        next[at] = null;
        next[over] = null;
        extend(next, to, path.concat([to]), captured.concat([over]));
      });
      if (!extended && captured.length) {
        results.push({ from, to: at, path, captured });
      }
    }
    extend(board, from, [from], []);
    return results;
  }

  // All legal moves for `color`: only capture sequences if any exist,
  // otherwise plain steps { from, to, path: [from, to], captured: [] } -
  // forward or sideways, never backward.
  function getLegalMoves(board, color) {
    const captures = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] === color) captures.push.apply(captures, jumpSequences(board, i, color));
    }
    if (captures.length) return captures;
    const steps = [];
    const fwd = forwardDr(color);
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== color) continue;
      NEIGHBORS[i].forEach(({ to, dir }) => {
        const dr = DIRS[dir].dr;
        if (dr !== 0 && dr !== fwd) return;
        if (board[to] === null) steps.push({ from: i, to, path: [i, to], captured: [] });
      });
    }
    return steps;
  }

  function applyMove(board, move) {
    const next = board.slice();
    next[move.to] = next[move.from];
    if (move.to !== move.from) next[move.from] = null;
    move.captured.forEach((i) => { next[i] = null; });
    return next;
  }

  // { status: "normal" } or { status: "no-pieces" | "no-moves", winner }
  // for the side about to move.
  function detectGameEnd(board, toMove) {
    if (!countPieces(board, toMove)) return { status: "no-pieces", winner: otherColor(toMove) };
    if (!getLegalMoves(board, toMove).length) return { status: "no-moves", winner: otherColor(toMove) };
    return { status: "normal" };
  }

  return {
    ROWS, COLS, TOTAL_POINTS, PIECES_PER_SIDE, CENTER, DIRS, NEIGHBORS, JUMPS,
    idx, rowOf, colOf, inBounds, hasDiagonals, countConnections, otherColor, forwardDr,
    createInitialBoard, cloneBoard, countPieces, jumpSequences, getLegalMoves,
    applyMove, detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AlquerqueCore;
}
if (typeof window !== "undefined") {
  window.AlquerqueCore = AlquerqueCore;
}
