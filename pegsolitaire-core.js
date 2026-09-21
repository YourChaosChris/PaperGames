// pegsolitaire-core.js
// Dependency-free rules engine for Peg Solitaire, using the classic
// English 33-hole cross board. Solitaire, like Sudoku - no opponent, no
// AI, just the puzzle itself - so this is simpler than the two-player
// cores: no color, no turn order, just pegs and jumps.
//
// Board: a 7x7 grid where the four 2x2 corners are off the board,
// leaving a plus/cross shape of 33 valid holes. A cell is null when
// it's off the board, otherwise a boolean - true for a peg, false for
// an empty hole. Jumps are orthogonal only (no diagonals): a peg jumps
// over an adjacent peg into an empty hole two cells further in the same
// direction, and the jumped-over peg is removed.

const PegSolitaireCore = (function () {
  const SIZE = 7;
  const DIRECTIONS = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];

  function isOnBoard(r, c) {
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
    const rowOk = r >= 2 && r <= 4;
    const colOk = c >= 2 && c <= 4;
    return rowOk || colOk;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) {
      const row = [];
      for (let c = 0; c < SIZE; c++) {
        row.push(isOnBoard(r, c) ? true : null);
      }
      board.push(row);
    }
    board[3][3] = false; // the center hole starts empty
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function isLegalMove(board, fr, fc, tr, tc) {
    if (!isOnBoard(fr, fc) || !isOnBoard(tr, tc)) return false;
    if (board[fr][fc] !== true) return false;
    if (board[tr][tc] !== false) return false;
    const dr = tr - fr, dc = tc - fc;
    const isJump = DIRECTIONS.some((d) => d.dr * 2 === dr && d.dc * 2 === dc);
    if (!isJump) return false;
    const mr = fr + dr / 2, mc = fc + dc / 2;
    return board[mr][mc] === true;
  }

  // Every legal move for the current board - {from:[r,c], to:[r,c], over:[r,c]}.
  function getLegalMoves(board) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
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
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === true) count++;
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
    SIZE,
    isOnBoard,
    createInitialBoard,
    cloneBoard,
    isLegalMove,
    getLegalMoves,
    applyMove,
    countPegs,
    evaluateBoard
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PegSolitaireCore;
}
if (typeof window !== "undefined") {
  window.PegSolitaireCore = PegSolitaireCore;
}
