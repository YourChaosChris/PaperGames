// hex-core.js
// Dependency-free rules engine for Hex: a 9x9 rhombus of hexagonal
// cells, two players alternately placing a stone on any empty cell,
// each trying to build an unbroken chain of their own stones linking
// their own pair of opposite sides. There are no captures and no
// draws are possible - once the board is full, exactly one player's
// chain must exist, a real topological property of the game.
//
// Cells are (row, col) in 0..N-1. "r" (red) connects row 0 to row
// N-1 (top to bottom); "b" (blue) connects column 0 to column N-1
// (left to right). Board rows are conceptually staggered rightward
// as row increases (the classic Hex rhombus), which is why each
// cell's six neighbors are NOT simply the four orthogonal cells plus
// two corners - see NEIGHBOR_OFFSETS below.

const HexCore = (function () {
  const SIZE = 9;

  // For cell (r, c): the up-neighbors are (r-1, c) and (r-1, c+1),
  // the down-neighbors are (r+1, c-1) and (r+1, c), and the
  // same-row neighbors are (r, c-1) and (r, c+1) - the standard
  // adjacency for a rightward-staggered Hex grid.
  const NEIGHBOR_OFFSETS = [
    [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0]
  ];

  function otherPlayer(player) {
    return player === "r" ? "b" : "r";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function neighborsOf(r, c) {
    const result = [];
    NEIGHBOR_OFFSETS.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc)) result.push([nr, nc]);
    });
    return result;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    return board;
  }

  function createInitialState() {
    return {
      board: createInitialBoard(),
      currentPlayer: "r",
      gameOver: false,
      winner: null
    };
  }

  function cloneState(state) {
    return {
      board: state.board.map((row) => row.slice()),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  function getLegalMoves(state) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!state.board[r][c]) moves.push([r, c]);
      }
    }
    return moves;
  }

  // Flood-fill from every one of `player`'s stones on their starting
  // edge, following only `player`'s own stones, to see whether any
  // reach the opposite edge.
  function checkWin(board, player) {
    const visited = new Array(SIZE * SIZE).fill(false);
    const key = (r, c) => r * SIZE + c;
    const stack = [];
    if (player === "r") {
      for (let c = 0; c < SIZE; c++) {
        if (board[0][c] === "r") { stack.push([0, c]); visited[key(0, c)] = true; }
      }
    } else {
      for (let r = 0; r < SIZE; r++) {
        if (board[r][0] === "b") { stack.push([r, 0]); visited[key(r, 0)] = true; }
      }
    }
    while (stack.length) {
      const [r, c] = stack.pop();
      if (player === "r" && r === SIZE - 1) return true;
      if (player === "b" && c === SIZE - 1) return true;
      neighborsOf(r, c).forEach(([nr, nc]) => {
        if (visited[key(nr, nc)]) return;
        if (board[nr][nc] !== player) return;
        visited[key(nr, nc)] = true;
        stack.push([nr, nc]);
      });
    }
    return false;
  }

  function applyMove(state, player, move) {
    const next = cloneState(state);
    const [r, c] = move;
    next.board[r][c] = player;
    if (checkWin(next.board, player)) {
      next.gameOver = true;
      next.winner = player;
    }
    next.currentPlayer = otherPlayer(player);
    return next;
  }

  return {
    SIZE,
    NEIGHBOR_OFFSETS,
    otherPlayer,
    inBounds,
    neighborsOf,
    createInitialBoard,
    createInitialState,
    cloneState,
    getLegalMoves,
    checkWin,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HexCore;
}
if (typeof window !== "undefined") {
  window.HexCore = HexCore;
}
