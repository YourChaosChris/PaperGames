// pegsolitaire-core.js
// Dependency-free rules engine for Peg Solitaire on three square-grid
// boards. Solitaire, like Sudoku - no opponent, no AI, just the puzzle
// itself - so this is simpler than the two-player cores: no color, no
// turn order, just pegs and jumps.
//
// Boards (BOARDS), all played with the same orthogonal jumps:
//   english   - 7x7 without the four 2x2 corners, 33 holes (the default)
//   european  - 7x7 without a three-hole corner at each corner, 37 holes
//   wiegleb   - 9x9 without the four 3x3 corners, 45 holes (J. C.
//               Wiegleb, 1779)
//   square36  - the full 6x6 grid, 36 holes
//   diamond41 - a diamond on a 9x9 grid, |r-4| + |c-4| <= 4, 41 holes
// The 13-hole diamond (5x5) is missing on purpose: no starting hole on
// it can be solved down to one peg with orthogonal jumps (5 is the best).
// Each board's starting hole was checked with a depth-first search to
// be solvable down to a single peg. The European board is not solvable
// from its centre, so it starts with the hole directly above the centre.
//
// A board is a size x size grid; a cell is null when it's off the board,
// otherwise a boolean - true for a peg, false for an empty hole. Every
// function reads the grid size from the board it is given. Jumps are
// orthogonal only (no diagonals): a peg jumps over an adjacent peg into
// an empty hole two cells further in the same direction, and the
// jumped-over peg is removed.

const PegSolitaireCore = (function () {
  const DIRECTIONS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
  const DEFAULT_VARIANT = "english";

  const BOARDS = {
    english: {
      size: 7,
      holes: 33,
      contains: (r, c) => (r >= 2 && r <= 4) || (c >= 2 && c <= 4),
      start: [3, 3]
    },
    european: {
      size: 7,
      holes: 37,
      // A corner cell and its two neighbours along the edges are cut off.
      contains: (r, c) => Math.min(r, 6 - r) + Math.min(c, 6 - c) >= 2,
      start: [2, 3]
    },
    wiegleb: {
      size: 9,
      holes: 45,
      contains: (r, c) => (r >= 3 && r <= 5) || (c >= 3 && c <= 5),
      start: [4, 4]
    },
    square36: {
      size: 6,
      holes: 36,
      contains: () => true,
      start: [2, 2] // upper left of the four middle holes
    },
    diamond41: {
      size: 9,
      holes: 41,
      contains: (r, c) => Math.abs(r - 4) + Math.abs(c - 4) <= 4,
      // Only two starting holes (up to symmetry) can be solved down to a
      // single peg on this board; this is the one nearer the centre.
      start: [2, 4]
    }
  };
  const VARIANTS = Object.keys(BOARDS);

  // A saved game from before the board choice existed has no variant and
  // is the English board.
  function variantOf(value) {
    return BOARDS[value] ? value : DEFAULT_VARIANT;
  }

  function isOnBoard(r, c, variant) {
    const b = BOARDS[variantOf(variant)];
    if (r < 0 || r >= b.size || c < 0 || c >= b.size) return false;
    return b.contains(r, c);
  }

  function createInitialBoard(variant) {
    const v = variantOf(variant);
    const b = BOARDS[v];
    const board = [];
    for (let r = 0; r < b.size; r++) {
      const row = [];
      for (let c = 0; c < b.size; c++) {
        row.push(isOnBoard(r, c, v) ? true : null);
      }
      board.push(row);
    }
    board[b.start[0]][b.start[1]] = false; // the starting hole
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function cellAt(board, r, c) {
    if (r < 0 || r >= board.length || c < 0 || c >= board[r].length) return null;
    return board[r][c];
  }

  function isLegalMove(board, fr, fc, tr, tc) {
    if (cellAt(board, fr, fc) !== true) return false;
    if (cellAt(board, tr, tc) !== false) return false;
    const dr = tr - fr, dc = tc - fc;
    const isJump = DIRECTIONS.some((d) => d.dr * 2 === dr && d.dc * 2 === dc);
    if (!isJump) return false;
    return cellAt(board, fr + dr / 2, fc + dc / 2) === true;
  }

  // Every legal move for the current board - {from:[r,c], to:[r,c], over:[r,c]}.
  function getLegalMoves(board) {
    const moves = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] !== true) continue;
        DIRECTIONS.forEach(({ dr, dc }) => {
          const tr = r + dr * 2, tc = c + dc * 2;
          if (isLegalMove(board, r, c, tr, tc)) {
            moves.push({ from: [r, c], to: [tr, tc], over: [r + dr, c + dc] });
          }
        });
      }
    }
    return moves;
  }

  function applyMove(board, move) {
    const next = cloneBoard(board);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const [or_, oc] = move.over;
    next[fr][fc] = false;
    next[or_][oc] = false;
    next[tr][tc] = true;
    return next;
  }

  function countPegs(board) {
    let count = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === true) count++;
      }
    }
    return count;
  }

  function countHoles(board) {
    let count = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] !== null) count++;
      }
    }
    return count;
  }

  // { over: boolean, won: boolean, pegs: number }. `won` means the
  // puzzle is solved down to the traditional single peg; `over` means
  // no legal move remains, win or not.
  function evaluateBoard(board) {
    const pegs = countPegs(board);
    const hasMove = getLegalMoves(board).length > 0;
    return {
      over: !hasMove,
      won: !hasMove && pegs === 1,
      pegs
    };
  }

  return {
    BOARDS,
    VARIANTS,
    DEFAULT_VARIANT,
    variantOf,
    isOnBoard,
    createInitialBoard,
    cloneBoard,
    isLegalMove,
    getLegalMoves,
    applyMove,
    countPegs,
    countHoles,
    evaluateBoard
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PegSolitaireCore;
}
if (typeof window !== "undefined") {
  window.PegSolitaireCore = PegSolitaireCore;
}
