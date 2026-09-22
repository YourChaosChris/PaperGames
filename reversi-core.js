// othello-core.js
// Dependency-free rules engine for Reversi/Othello. Mirrors the
// separation of concerns in the other <game>-core.js modules: rules
// only, no DOM/UI.
//
// Board: an 8x8 grid, board[row][col] is "b", "w", or null. Black
// always moves first. A move places a disc on an empty square that
// "flanks" - in at least one of the 8 directions - an unbroken line of
// one or more opponent discs terminated by one of the mover's own
// discs; every flanked disc in every such direction flips to the
// mover's color. If a player has no legal move, their turn is skipped
// entirely (there is no voluntary pass); if NEITHER player has a legal
// move, the game ends and whoever holds more discs wins.

const OthelloCore = (function () {
  const SIZE = 8;
  const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialBoard() {
    const board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));
    board[3][3] = "w";
    board[3][4] = "b";
    board[4][3] = "b";
    board[4][4] = "w";
    return board;
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  // The squares that would flip if `color` played at (row, col), across
  // every direction - empty if the square is occupied or the move
  // wouldn't flank anything.
  function flipsForMove(board, color, row, col) {
    if (board[row][col]) return [];
    const opp = otherColor(color);
    const allFlips = [];
    for (const [dr, dc] of DIRECTIONS) {
      const lineFlips = [];
      let r = row + dr;
      let c = col + dc;
      while (inBounds(r, c) && board[r][c] === opp) {
        lineFlips.push([r, c]);
        r += dr;
        c += dc;
      }
      if (lineFlips.length && inBounds(r, c) && board[r][c] === color) {
        allFlips.push.apply(allFlips, lineFlips);
      }
    }
    return allFlips;
  }

  function getLegalMoves(board, color) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c]) continue;
        const flips = flipsForMove(board, color, r, c);
        if (flips.length) moves.push({ row: r, col: c, flips });
      }
    }
    return moves;
  }

  function applyMove(board, color, move) {
    const newBoard = board.map((row) => row.slice());
    newBoard[move.row][move.col] = color;
    move.flips.forEach(([r, c]) => { newBoard[r][c] = color; });
    return newBoard;
  }

  function countDiscs(board, color) {
    let n = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === color) n++;
      }
    }
    return n;
  }

  // null means a draw (equal disc counts) - only meaningful once
  // neither side has a legal move left.
  function getWinner(board) {
    const b = countDiscs(board, "b");
    const w = countDiscs(board, "w");
    if (b > w) return "b";
    if (w > b) return "w";
    return null;
  }

  return {
    SIZE,
    otherColor,
    createInitialBoard,
    flipsForMove,
    getLegalMoves,
    applyMove,
    countDiscs,
    getWinner
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OthelloCore;
}
if (typeof window !== "undefined") {
  window.OthelloCore = OthelloCore;
}
