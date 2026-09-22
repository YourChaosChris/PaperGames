// fanorona-core.js
// Dependency-free rules engine for Fanorona, the national board game of
// Madagascar, played on the standard 5x9 "Fanoron-Tsivy" board. Mirrors
// the separation of concerns in checkers-core.js/morris-core.js: rules
// only, no DOM/UI.
//
// Board: 45 points in a 5-row x 9-column grid, indexed r*COLS+c (r 0-4,
// c 0-8). Every point connects orthogonally to its in-bounds neighbours.
// Diagonal connections exist only at "strong" points - where (r+c) is
// even - which connect diagonally to all four of their in-bounds
// diagonal neighbours; "weak" points ((r+c) odd) have no diagonal
// connections at all. Diagonal steps never change the parity of (r+c)
// (both coordinates change by 1), so a strong point's diagonal
// neighbours are always strong too - this is the well-documented
// "tetrakis square tiling" pattern real Fanorona boards are drawn with:
// degree-8 hubs and degree-4 (orthogonal-only) points alternating in a
// checkerboard, which is what actually produces the herringbone/
// interlocking-triangle look of a real board (each unit cell's single
// drawn diagonal alternates "\"/"/" from cell to cell). This was
// verified against the board diagram in Schadd et al., "Best Play in
// Fanorona Leads to a Draw" (ICGA), and against Wikipedia's "weak vs.
// strong intersection" description, rather than guessed.
//
// Starting position (also verified against the same source's Figure 1,
// not guessed): White is traditionally placed nearest the bottom of the
// board and moves first (an intentional, source-verified difference
// from this app's other 2-player games, most of which start Black).
// Each side fills the two rows nearest it (18 pieces) plus half of the
// middle row (4 more, 22 total): reading the middle row from the edge
// nearest Black inward, it alternates strictly by column, with the
// dead-centre point left empty - e.g. with Black on rows 0-1 and White
// on rows 3-4, middle-row column c (0-indexed) is Black if c is even
// and c<4, White if c is odd and c<4, empty at the centre (c=4), and the
// mirror image (with colours swapped) for c>4. This exact arrangement
// is 180-degree-rotation-symmetric once colours are swapped, which is
// what makes the position fair.
//
// Moves: a "paika" is a non-capturing slide to an adjacent empty point,
// legal only when the player has no capturing move at all anywhere on
// the board (capturing is mandatory). A capturing move slides a piece
// to an adjacent empty point and, depending on the direction of that
// slide, may capture a contiguous line of enemy pieces beyond the new
// position ("approach") and/or a contiguous line of enemy pieces behind
// the piece's old position, in the opposite direction ("withdrawal") -
// if both are available from the same slide the player must choose one
// (verified: a single move can never do both at once). Unlike checkers,
// continuing a capture chain with the same piece is optional, not
// forced (verified against Schadd et al. section 2.2 and Wikipedia -
// "the player may stop capturing after any number of opponent pieces
// are captured", explicitly called out as different from the checkers
// rule): this engine reflects that by generating each capturing move as
// a single step that is already itself a complete, legal move, with
// getChainContinuations() exposed separately so a caller (the app, or
// the AI) can choose to extend it further. The two chain-specific
// restrictions (verified against the same source) are: (1) a capturing
// step may not be in the same exact direction as the immediately
// preceding capturing step of this same chain (repeating that direction
// later, after an intervening different-direction step, is fine), and
// (2) the piece may never land on a point it has already occupied
// earlier in this same chain (including its own starting point).

const FanoronaCore = (function () {
  const ROWS = 5;
  const COLS = 9;
  const TOTAL_POINTS = ROWS * COLS;
  const CENTER = idx(2, 4);
  const PIECES_PER_PLAYER = 22;

  function idx(r, c) {
    return r * COLS + c;
  }
  function rowOf(i) {
    return Math.floor(i / COLS);
  }
  function colOf(i) {
    return i % COLS;
  }
  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }
  function isStrong(r, c) {
    return (r + c) % 2 === 0;
  }

  // The 8 possible slide directions, ordered as opposite pairs so that
  // opposite(i) is a simple XOR-with-1 - index 0/1 = N/S, 2/3 = W/E,
  // 4/5 = NW/SE, 6/7 = NE/SW.
  const DIRS = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: -1, dc: -1 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 }
  ];
  function opposite(dirIndex) {
    return dirIndex % 2 === 0 ? dirIndex + 1 : dirIndex - 1;
  }

  // Precomputed per-point neighbour list: [{ to, dir }, ...]. Built once
  // since the board's connection graph never changes.
  function buildNeighbors() {
    const table = [];
    for (let i = 0; i < TOTAL_POINTS; i++) table.push([]);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(r, c);
        const strong = isStrong(r, c);
        DIRS.forEach((d, dirIndex) => {
          const isDiagonal = dirIndex >= 4;
          if (isDiagonal && !strong) return;
          const nr = r + d.dr, nc = c + d.dc;
          if (!inBounds(nr, nc)) return;
          table[i].push({ to: idx(nr, nc), dir: dirIndex });
        });
      }
    }
    return table;
  }

  const NEIGHBORS = buildNeighbors();

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // Black occupies rows 0-1 (top), White rows 3-4 (bottom) - matching
  // the source diagram's convention that White sits nearest the bottom
  // and moves first.
  function createInitialBoard() {
    const board = new Array(TOTAL_POINTS).fill(null);
    for (let c = 0; c < COLS; c++) {
      board[idx(0, c)] = "b";
      board[idx(1, c)] = "b";
      board[idx(3, c)] = "w";
      board[idx(4, c)] = "w";
    }
    for (let c = 0; c < COLS; c++) {
      if (c === 4) continue; // dead centre stays empty
      const nearBlackHalf = c < 4;
      const parityColor = c % 2 === 0 ? "b" : "w"; // even columns start Black-side, odd White-side...
      // ...mirrored (colour-swapped) on the far half, so the whole
      // middle row is symmetric under a 180-degree rotation that also
      // swaps colours - see the file header for the verification.
      board[idx(2, c)] = nearBlackHalf ? parityColor : otherColor(parityColor);
    }
    return board;
  }

  function cloneBoard(board) {
    return board.slice();
  }

  function countPieces(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) n++;
    return n;
  }

  // Walks from (fromR, fromC) one step in direction `dirIndex`, then
  // continues collecting a contiguous run of `enemyColor` pieces,
  // stopping at the first empty point, own piece, or the edge of the
  // board. Returns [] if even the first square isn't an enemy piece.
  function collectEnemyLine(board, fromR, fromC, dirIndex, enemyColor) {
    const d = DIRS[dirIndex];
    const result = [];
    let r = fromR + d.dr, c = fromC + d.dc;
    while (inBounds(r, c) && board[idx(r, c)] === enemyColor) {
      result.push(idx(r, c));
      r += d.dr;
      c += d.dc;
    }
    return result;
  }

  // Every capturing continuation available to `color`'s piece currently
  // at `atIndex`, given the set of points already visited this chain
  // and the direction of the immediately preceding step (null if this
  // is the first step of a move). Each result is
  // { to, dirIndex, type: "approach"|"withdrawal", captured: [idx,...] }
  // - both types are returned separately when a single slide would
  // qualify as both, since the rules require the player to choose one.
  function getChainContinuations(board, atIndex, color, visited, lastDirIndex) {
    const r = rowOf(atIndex), c = colOf(atIndex);
    const enemy = otherColor(color);
    const results = [];

    NEIGHBORS[atIndex].forEach(({ to, dir }) => {
      if (board[to] !== null) return; // destination must be empty
      if (visited && visited.has(to)) return; // can't land on a point already used this chain
      if (lastDirIndex !== null && lastDirIndex !== undefined && dir === lastDirIndex) return; // no immediate repeat direction

      const toR = rowOf(to), toC = colOf(to);
      const approach = collectEnemyLine(board, toR, toC, dir, enemy);
      if (approach.length) {
        results.push({ to, dirIndex: dir, type: "approach", captured: approach });
      }

      const withdrawDir = opposite(dir);
      const withdrawal = collectEnemyLine(board, r, c, withdrawDir, enemy);
      if (withdrawal.length) {
        results.push({ to, dirIndex: dir, type: "withdrawal", captured: withdrawal });
      }
    });

    return results;
  }

  // Every legal move for `color`, as a single atomic step:
  // { from, to, type: "paika"|"approach"|"withdrawal", dirIndex, captured }
  // If any capturing move exists anywhere on the board for `color`, only
  // capturing moves are returned (mandatory capture). Each capturing
  // move here is already a complete, legal move on its own - see
  // getChainContinuations for extending one further.
  function getLegalMoves(board, color) {
    const captureMoves = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== color) continue;
      const options = getChainContinuations(board, i, color, new Set([i]), null);
      options.forEach((opt) => {
        captureMoves.push({ from: i, to: opt.to, dirIndex: opt.dirIndex, type: opt.type, captured: opt.captured });
      });
    }
    if (captureMoves.length) return captureMoves;

    const paikaMoves = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== color) continue;
      NEIGHBORS[i].forEach(({ to }) => {
        if (board[to] === null) {
          paikaMoves.push({ from: i, to, type: "paika", dirIndex: null, captured: [] });
        }
      });
    }
    return paikaMoves;
  }

  // Applies one atomic step (paika or a single capturing step) to a
  // fresh copy of the board.
  function applyStep(board, from, to, captured) {
    const next = cloneBoard(board);
    const piece = next[from];
    next[from] = null;
    (captured || []).forEach((i) => { next[i] = null; });
    next[to] = piece;
    return next;
  }

  // Enumerates every full move sequence available to `color`, i.e. every
  // legal stopping point of every legal capture chain (since continuing
  // is always optional, every prefix of a legal chain is itself a
  // complete legal move), or the plain paika moves if no capture is
  // available at all. Used by the AI, which needs to weigh whole
  // sequences (and how many pieces they capture) against each other,
  // not just single steps. Each result is
  // { from, to, steps: [{from,to,dirIndex,type,captured}, ...], captured: [idx,...] }
  function enumerateFullMoves(board, color) {
    const first = getLegalMoves(board, color);
    if (!first.length) return [];
    if (first[0].type === "paika") {
      return first.map((m) => ({ from: m.from, to: m.to, steps: [m], captured: [] }));
    }

    const results = [];
    const startPoints = new Set(first.map((m) => m.from));
    const MAX_DEPTH = 40; // generous safety cap; the visited-set constraint already bounds real chains well below this

    function dfs(curBoard, from, atIndex, visited, lastDirIndex, stepsSoFar, capturedSoFar) {
      if (stepsSoFar.length) {
        results.push({ from, to: atIndex, steps: stepsSoFar.slice(), captured: capturedSoFar.slice() });
      }
      if (stepsSoFar.length >= MAX_DEPTH) return;
      const continuations = getChainContinuations(curBoard, atIndex, color, visited, lastDirIndex);
      continuations.forEach((opt) => {
        const nextBoard = applyStep(curBoard, atIndex, opt.to, opt.captured);
        const nextVisited = new Set(visited);
        nextVisited.add(opt.to);
        const step = { from: atIndex, to: opt.to, dirIndex: opt.dirIndex, type: opt.type, captured: opt.captured };
        dfs(nextBoard, from, opt.to, nextVisited, opt.dirIndex, stepsSoFar.concat([step]), capturedSoFar.concat(opt.captured));
      });
    }

    startPoints.forEach((from) => {
      dfs(board, from, from, new Set([from]), null, [], []);
    });
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
    ROWS,
    COLS,
    TOTAL_POINTS,
    CENTER,
    PIECES_PER_PLAYER,
    DIRS,
    NEIGHBORS,
    idx,
    rowOf,
    colOf,
    inBounds,
    isStrong,
    opposite,
    otherColor,
    createInitialBoard,
    cloneBoard,
    countPieces,
    getChainContinuations,
    getLegalMoves,
    applyStep,
    enumerateFullMoves,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FanoronaCore;
}
if (typeof window !== "undefined") {
  window.FanoronaCore = FanoronaCore;
}
