// connectfour-core.js
// Dependency-free rules engine for Connect Four. Mirrors the separation
// of concerns in the other <game>-core.js modules: rules only, no
// DOM/UI.
//
// Board: 6 rows x 7 columns, board[row][col] is "b", "w", or null, with
// row 0 the TOP row and row 5 the bottom - matching every other board
// game here. A move drops a disc into a column; it falls to the lowest
// (highest row index) empty cell in that column, exactly like the
// physical game. Black always moves first.

const ConnectFourCore = (function () {
  const ROWS = 6;
  const COLS = 7;
  const WIN_LENGTH = 4;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialBoard() {
    return Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
  }

  // The row a disc dropped in `col` would land on, or -1 if the column
  // is full.
  function landingRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) return r;
    }
    return -1;
  }

  function getLegalMoves(board, color) {
    const moves = [];
    for (let c = 0; c < COLS; c++) {
      if (landingRow(board, c) !== -1) moves.push(c);
    }
    return moves;
  }

  function applyMove(board, color, col) {
    const row = landingRow(board, col);
    const newBoard = board.map((r) => r.slice());
    newBoard[row][col] = color;
    return { board: newBoard, row, col };
  }

  const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

  // Returns the winning color if `board` contains four-in-a-row
  // anywhere, else null. Cheap enough to run on the whole (42-cell)
  // board after every move rather than checking only around the last
  // placed disc.
  function getWinner(board) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = board[r][c];
        if (!color) continue;
        for (const [dr, dc] of DIRECTIONS) {
          let count = 1;
          let rr = r + dr;
          let cc = c + dc;
          while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === color) {
            count++;
            rr += dr;
            cc += dc;
          }
          if (count >= WIN_LENGTH) return color;
        }
      }
    }
    return null;
  }

  function isFull(board) {
    return board[0].every((cell) => cell !== null);
  }

  return {
    ROWS,
    COLS,
    WIN_LENGTH,
    otherColor,
    createInitialBoard,
    landingRow,
    getLegalMoves,
    applyMove,
    getWinner,
    isFull
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ConnectFourCore;
}
if (typeof window !== "undefined") {
  window.ConnectFourCore = ConnectFourCore;
}
