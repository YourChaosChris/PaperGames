// halma-core.js
// Dependency-free rules engine for Halma: a race, not a capture game.
// Each player starts with all of their pieces in a triangular "camp"
// in one corner of the board and must be the first to move every one
// of them into the camp diagonally opposite. This plays a smaller,
// commonly used simplified size (10x10, ten pieces per side) rather
// than the traditional 16x16/19-piece board, to keep games shorter
// and comfortable on a small screen - the mechanic itself is
// unchanged.
//
// Movement: on your turn, either step one square in any of the 8
// directions into an empty cell, or make one or more chained jumps -
// each jump hops in a straight line over an adjacent piece (yours or
// the opponent's - nothing is captured, jumping is purely a way to
// travel father in one turn) onto the empty square immediately beyond
// it. A turn is either exactly one step, or one or more chained
// jumps; you may stop after any jump in the chain rather than being
// forced to continue.

const HalmaCore = (function () {
  const SIZE = 10;
  const CAMP_SIZE = 10; // triangle side 4: rows of 4+3+2+1 cells

  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  function otherPlayer(player) {
    return player === "p1" ? "p2" : "p1";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  // Player 1's home camp (and Player 2's goal) sits in the
  // bottom-right corner; Player 2's home camp (and Player 1's goal)
  // sits in the top-left corner - the two triangles are point-mirror
  // images of each other through the board's center.
  function isCampP1(r, c) {
    return (SIZE - 1 - r) + (SIZE - 1 - c) <= 3;
  }

  function isCampP2(r, c) {
    return r + c <= 3;
  }

  function homeCampCells(player) {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (player === "p1" ? isCampP1(r, c) : isCampP2(r, c)) cells.push([r, c]);
      }
    }
    return cells;
  }

  function goalCampCells(player) {
    return homeCampCells(otherPlayer(player));
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    homeCampCells("p1").forEach(([r, c]) => { board[r][c] = "p1"; });
    homeCampCells("p2").forEach(([r, c]) => { board[r][c] = "p2"; });
    return board;
  }

  function createInitialState() {
    return {
      board: createInitialBoard(),
      currentPlayer: "p1",
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

  function stepMovesFrom(board, r, c) {
    const moves = [];
    DIRS.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && !board[nr][nc]) {
        moves.push({ type: "step", from: [r, c], to: [nr, nc], path: [[r, c], [nr, nc]] });
      }
    });
    return moves;
  }

  // Every distinct jump sequence starting at (r,c), of any length >= 1
  // (a player may stop after any single jump) - cycle-guarded so a
  // chain can never land on a square it has already visited.
  function jumpMovesFrom(board, r, c) {
    const moves = [];
    const visited = new Set([r + "," + c]);

    function extend(curR, curC, path) {
      DIRS.forEach(([dr, dc]) => {
        const midR = curR + dr, midC = curC + dc;
        const landR = curR + dr * 2, landC = curC + dc * 2;
        if (!inBounds(landR, landC)) return;
        if (!board[midR][midC]) return; // must jump OVER an occupied square
        if (board[landR][landC]) return; // landing square must be empty
        const key = landR + "," + landC;
        if (visited.has(key)) return;
        visited.add(key);
        const newPath = path.concat([[landR, landC]]);
        moves.push({ type: "jump", from: [r, c], to: [landR, landC], path: newPath });
        extend(landR, landC, newPath);
        visited.delete(key);
      });
    }

    extend(r, c, [[r, c]]);
    return moves;
  }

  function getLegalMoves(state, player) {
    const moves = [];
    const board = state.board;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== player) continue;
        moves.push.apply(moves, stepMovesFrom(board, r, c));
        moves.push.apply(moves, jumpMovesFrom(board, r, c));
      }
    }
    return moves;
  }

  function hasWon(board, player) {
    const cells = goalCampCells(player);
    return cells.every(([r, c]) => board[r][c] === player);
  }

  function applyMove(state, player, move) {
    const next = cloneState(state);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    next.board[tr][tc] = next.board[fr][fc];
    next.board[fr][fc] = null;

    if (hasWon(next.board, player)) {
      next.gameOver = true;
      next.winner = player;
    }
    next.currentPlayer = otherPlayer(player);
    return next;
  }

  return {
    SIZE,
    CAMP_SIZE,
    DIRS,
    otherPlayer,
    inBounds,
    isCampP1,
    isCampP2,
    homeCampCells,
    goalCampCells,
    createInitialBoard,
    createInitialState,
    cloneState,
    stepMovesFrom,
    jumpMovesFrom,
    getLegalMoves,
    hasWon,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HalmaCore;
}
if (typeof window !== "undefined") {
  window.HalmaCore = HalmaCore;
}
