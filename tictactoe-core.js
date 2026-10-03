// tictactoe-core.js
// Dependency-free rules engine for Tic-Tac-Toe (Noughts and Crosses).
// Mirrors the separation of concerns in the other <game>-core.js
// modules: rules only, no DOM/UI.
//
// A 3x3 board, cells numbered 0..8 row by row. Player 1 (X) always
// moves first; players take turns putting their mark on an empty cell.
// Three of your own marks in a row, column or diagonal wins at once; a
// full board without a line is a draw. With perfect play the game is
// always a draw - the strongest computer level never loses.
//
// State shape:
//   cells       - array of 9: null or the player id ("1"/"2")
//   turn        - "1" | "2", whose move it is
//   gameOver    - true once someone has a line or the board is full
//   winner      - "1" | "2" | "draw" | null (null until gameOver)
//   winningLine - the three cell numbers of the winning line, or null

const TicTacToeCore = (function () {
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  function createInitialState() {
    return {
      cells: new Array(9).fill(null),
      turn: "1",
      gameOver: false,
      winner: null,
      winningLine: null
    };
  }

  function cloneState(state) {
    return {
      cells: state.cells.slice(),
      turn: state.turn,
      gameOver: state.gameOver,
      winner: state.winner,
      winningLine: state.winningLine ? state.winningLine.slice() : null
    };
  }

  function otherPlayer(p) {
    return p === "1" ? "2" : "1";
  }

  function isLegalMove(state, cell) {
    return !state.gameOver && Number.isInteger(cell) && cell >= 0 && cell < 9 && state.cells[cell] === null;
  }

  function getLegalMoves(state) {
    const moves = [];
    if (state.gameOver) return moves;
    for (let i = 0; i < 9; i++) if (state.cells[i] === null) moves.push(i);
    return moves;
  }

  // { winner: "1" | "2", line: [a, b, c] } for a completed line,
  // { winner: "draw", line: null } for a full board, otherwise null.
  function findWinner(cells) {
    for (const line of LINES) {
      const [a, b, c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a], line: line.slice() };
      }
    }
    if (cells.every((v) => v !== null)) return { winner: "draw", line: null };
    return null;
  }

  // Puts the current player's mark on `cell` and returns the new state.
  // Assumes the caller checked isLegalMove, like every other core here.
  function applyMove(state, cell) {
    const next = cloneState(state);
    next.cells[cell] = state.turn;
    const result = findWinner(next.cells);
    if (result) {
      next.gameOver = true;
      next.winner = result.winner;
      next.winningLine = result.line;
    } else {
      next.turn = otherPlayer(state.turn);
    }
    return next;
  }

  return {
    LINES,
    createInitialState,
    cloneState,
    otherPlayer,
    isLegalMove,
    getLegalMoves,
    applyMove,
    findWinner
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TicTacToeCore;
}
if (typeof window !== "undefined") {
  window.TicTacToeCore = TicTacToeCore;
}
