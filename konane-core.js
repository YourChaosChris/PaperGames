// konane-core.js
// Dependency-free rules engine for Konane (Hawaiian checkers / "pebble
// hopping"), played on an 8x8 board. Mirrors the separation of concerns in
// checkers-core.js/fanorona-core.js: rules only, no DOM/UI.
//
// Board representation: 8x8 array of rows, each cell is one of
// null | "b" | "w" ("b" = black stone, "w" = white stone). Coordinates are
// [row, col], both 0-indexed. There are no kings and no diagonal moves -
// Konane is a full-board game (every one of the 64 cells starts occupied,
// unlike checkers which only fills the dark squares) and captures jump
// orthogonally (up/down/left/right only), never diagonally.
//
// Setup is a two-step "opening ritual" unique to Konane, before any normal
// jumps happen:
//   1. Black removes one of their own stones from either a corner or one
//      of the four center-most squares (the traditional starting choices).
//   2. White removes one of their own stones that sits orthogonally
//      adjacent to the square Black just emptied.
// Only after both removals does normal jump-chain play begin, with Black
// making the first jump (this engine exposes the removal step as its own
// pair of functions - openingRemovalOptions/adjacentRemovalOptions/
// applyRemoval - rather than folding it into getLegalMoves, since it's a
// one-time special action with different legality rules than a jump).
//
// Movement: after setup, players alternate turns. A jump moves a stone
// over one orthogonally-adjacent enemy stone into the empty square
// immediately beyond it in a straight line, removing the jumped stone.
// Capturing is mandatory - if any of your stones has a legal jump, you
// must play one - but, unlike checkers, continuing a capture chain with
// the same stone afterward is always optional: you may stop after any
// jump, or keep going (in any direction, including reversing) as long as
// a further jump is available. That mirrors Fanorona's chain model rather
// than checkers' forced-maximal one: getChainContinuations() returns the
// next single jump options for a piece already mid-chain, and the caller
// (the app, or the AI's enumerateFullMoves) decides how far to extend it.
// A player with no legal jump at all on their turn loses immediately.

const KonaneCore = (function () {
  const SIZE = 8;

  // The two traditional opening-removal choices: a corner, or one of the
  // four center-most squares. Exactly two of each set match Black's color
  // and two match White's, since the board alternates strictly - so this
  // is also, unmodified, the set adjacentRemovalOptions draws its search
  // from (White's own set of legal replies is computed from whichever one
  // Black actually picked, not from this list directly).
  const CORNER_CELLS = [[0, 0], [0, SIZE - 1], [SIZE - 1, 0], [SIZE - 1, SIZE - 1]];
  const CENTER_CELLS = [[3, 3], [3, 4], [4, 3], [4, 4]];

  // Orthogonal only - the key difference from checkers' diagonal jumps.
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) {
        row.push((r + c) % 2 === 0 ? "b" : "w");
      }
      board.push(row);
    }
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function countPieces(board, color) {
    let n = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === color) n++;
      }
    }
    return n;
  }

  function cellKey(cell) {
    return cell[0] + "," + cell[1];
  }

  /*** Opening ritual ***/

  // Every one of Black's own stones sitting on a corner or center-most
  // square - Black's choice of which one to remove first.
  function openingRemovalOptions(board, color) {
    const candidates = CORNER_CELLS.concat(CENTER_CELLS);
    return candidates.filter(([r, c]) => board[r][c] === color);
  }

  // White's own stones orthogonally adjacent to the square Black just
  // emptied - White's choice of which one to remove second.
  function adjacentRemovalOptions(board, emptyCell, color) {
    const [r, c] = emptyCell;
    const options = [];
    DIRS.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] === color) options.push([nr, nc]);
    });
    return options;
  }

  function applyRemoval(board, cell) {
    const next = cloneBoard(board);
    next[cell[0]][cell[1]] = null;
    return next;
  }

  /*** Normal play: orthogonal jump chains, continuation optional ***/

  // Every single jump available to the piece currently at (r, c) - the
  // next step of a chain, or the first step of a brand new move. Each
  // result is { to: [r,c], captured: [midR, midC] }.
  function getChainContinuations(board, r, c, color) {
    const enemy = otherColor(color);
    const results = [];
    DIRS.forEach(([dr, dc]) => {
      const midR = r + dr, midC = c + dc;
      const landR = r + 2 * dr, landC = c + 2 * dc;
      if (!inBounds(landR, landC)) return;
      if (board[midR][midC] !== enemy) return;
      if (board[landR][landC] !== null) return;
      results.push({ to: [landR, landC], captured: [midR, midC] });
    });
    return results;
  }

  // Every legal FIRST jump for `color` - one atomic step per result:
  // { from: [r,c], to: [r,c], captured: [[r,c]] }. Since capturing is
  // mandatory, having any entry here means color must play one of them
  // (any piece with a jump may be chosen); an empty result means color
  // has no legal move at all and loses.
  function getLegalMoves(board, color) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== color) continue;
        getChainContinuations(board, r, c, color).forEach((opt) => {
          moves.push({ from: [r, c], to: opt.to, captured: [opt.captured] });
        });
      }
    }
    return moves;
  }

  // Applies one atomic jump step (captured is an array of [r,c] cells -
  // always exactly one for a single Konane jump) to a fresh copy of the
  // board.
  function applyStep(board, from, to, captured) {
    const next = cloneBoard(board);
    const piece = next[from[0]][from[1]];
    next[from[0]][from[1]] = null;
    (captured || []).forEach(([r, c]) => { next[r][c] = null; });
    next[to[0]][to[1]] = piece;
    return next;
  }

  // Enumerates every full turn available to `color`: every legal stopping
  // point of every legal jump chain, since stopping early is always
  // allowed (every prefix of a legal chain is itself a complete, legal
  // turn) - the same "enumerate every stop, not just maximal chains"
  // approach fanorona-core.js's enumerateFullMoves uses, needed because
  // the AI must weigh whole turns against each other. Each result is
  // { from: [r,c], to: [r,c], steps: [...], captured: [[r,c], ...] }.
  // A chain can capture at most one stone of the enemy's ~32, so no
  // artificial visited-set is needed to guarantee termination - every
  // step permanently removes one board stone - but a generous depth cap
  // is still kept as a defensive safety net.
  function enumerateFullMoves(board, color) {
    const first = getLegalMoves(board, color);
    if (!first.length) return [];

    const results = [];
    const MAX_DEPTH = 32;
    const startCells = [];
    const seen = new Set();
    first.forEach((m) => {
      const key = cellKey(m.from);
      if (!seen.has(key)) {
        seen.add(key);
        startCells.push(m.from);
      }
    });

    function dfs(curBoard, from, atCell, stepsSoFar, capturedSoFar) {
      if (stepsSoFar.length) {
        results.push({ from, to: atCell, steps: stepsSoFar.slice(), captured: capturedSoFar.slice() });
      }
      if (stepsSoFar.length >= MAX_DEPTH) return;
      const continuations = getChainContinuations(curBoard, atCell[0], atCell[1], color);
      continuations.forEach((opt) => {
        const nextBoard = applyStep(curBoard, atCell, opt.to, [opt.captured]);
        const step = { from: atCell, to: opt.to, captured: [opt.captured] };
        dfs(nextBoard, from, opt.to, stepsSoFar.concat([step]), capturedSoFar.concat([opt.captured]));
      });
    }

    startCells.forEach((from) => dfs(board, from, from, [], []));
    return results;
  }

  // { status: "normal" | "no-pieces" | "no-moves", winner: "b" | "w" | null }
  function detectGameEnd(board, colorToMove) {
    if (countPieces(board, colorToMove) === 0) {
      return { status: "no-pieces", winner: otherColor(colorToMove) };
    }
    if (getLegalMoves(board, colorToMove).length === 0) {
      return { status: "no-moves", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    SIZE,
    CORNER_CELLS,
    CENTER_CELLS,
    DIRS,
    createInitialBoard,
    cloneBoard,
    inBounds,
    otherColor,
    countPieces,
    openingRemovalOptions,
    adjacentRemovalOptions,
    applyRemoval,
    getChainContinuations,
    getLegalMoves,
    applyStep,
    enumerateFullMoves,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KonaneCore;
}
if (typeof window !== "undefined") {
  window.KonaneCore = KonaneCore;
}
