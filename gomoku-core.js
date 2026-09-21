// gomoku-core.js
// Dependency-free rules engine for Gomoku (Five in a Row), played on
// the same 15x15 intersection grid as a small Go board. Mirrors the
// separation of concerns in the other <game>-core.js modules: rules
// only, no DOM/UI.
//
// Stones sit on intersections, exactly like Go, and never move or get
// captured once placed - the board only ever fills up. Black always
// moves first. The first player to get five or more of their own
// stones in an unbroken line - horizontally, vertically, or on either
// diagonal - wins immediately; this is "freestyle" Gomoku, so there
// are no forbidden-move restrictions for either side.

const GomokuCore = (function () {
  const SIZE = 15;
  const WIN_LENGTH = 5;
  const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialBoard() {
    return Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function applyMove(board, color, r, c) {
    const newBoard = board.map((row) => row.slice());
    newBoard[r][c] = color;
    return newBoard;
  }

  // Checks whether the stone just placed at (r, c) completes a line of
  // WIN_LENGTH or more - far cheaper than scanning the whole board
  // after every move, since only lines through the new stone can have
  // just become five-in-a-row.
  function getWinnerAt(board, r, c) {
    const color = board[r][c];
    if (!color) return null;
    for (const [dr, dc] of DIRECTIONS) {
      let count = 1;
      let rr = r + dr;
      let cc = c + dc;
      while (inBounds(rr, cc) && board[rr][cc] === color) {
        count++;
        rr += dr;
        cc += dc;
      }
      rr = r - dr;
      cc = c - dc;
      while (inBounds(rr, cc) && board[rr][cc] === color) {
        count++;
        rr -= dr;
        cc -= dc;
      }
      if (count >= WIN_LENGTH) return color;
    }
    return null;
  }

  // Full-board scan, only needed when there's no single "last move" to
  // check from (e.g. validating a loaded/saved board).
  function getWinner(board) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c]) {
          const w = getWinnerAt(board, r, c);
          if (w) return w;
        }
      }
    }
    return null;
  }

  function isFull(board) {
    return board.every((row) => row.every((cell) => cell !== null));
  }

  // Empty cells within `radius` (Chebyshev distance) of any occupied
  // cell - the AI never needs to consider a move far from existing
  // stones, and this keeps the search's branching factor manageable on
  // a 225-point board. Falls back to just the center point on an empty
  // board.
  function candidateMoves(board, radius) {
    let hasStone = false;
    const candidates = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!board[r][c]) continue;
        hasStone = true;
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const rr = r + dr;
            const cc = c + dc;
            if (inBounds(rr, cc) && !board[rr][cc]) candidates.add(rr + "," + cc);
          }
        }
      }
    }
    if (!hasStone) {
      const mid = Math.floor(SIZE / 2);
      return [[mid, mid]];
    }
    return Array.from(candidates).map((key) => key.split(",").map(Number));
  }

  return {
    SIZE,
    WIN_LENGTH,
    otherColor,
    createInitialBoard,
    applyMove,
    getWinnerAt,
    getWinner,
    isFull,
    candidateMoves
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = GomokuCore;
}
if (typeof window !== "undefined") {
  window.GomokuCore = GomokuCore;
}
