// viererzug-core.js
// Rules engine for Four Moves (Viererzug), no DOM. 5 x 5 board, board[r][c]
// is "b", "w" or null, row 0 on top. Black moves first.
// Phase 1: the sides take turns putting four stones each on free fields.
// Phase 2: the sides take turns moving one of their stones to a free
// neighbouring field (diagonals too). Four own stones in a straight row
// (horizontal, vertical, diagonal) or in a 2 x 2 square win at once. The same
// position (with the same side to move) for the third time is a draw.
// A move is { from: null | [r, c], to: [r, c] }; from is null while placing.

const ViererzugCore = (function () {
  const SIZE = 5;
  const STONES = 4;
  const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
  const NEIGHBOURS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  // Every winning set of four cells: 28 straight lines and 16 squares.
  const WINDOWS = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      DIRS.forEach(([dr, dc]) => {
        const er = r + 3 * dr;
        const ec = c + 3 * dc;
        if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) return;
        WINDOWS.push({ kind: "line", cells: [0, 1, 2, 3].map((i) => [r + i * dr, c + i * dc]) });
      });
      if (r + 1 < SIZE && c + 1 < SIZE) {
        WINDOWS.push({ kind: "square", cells: [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]] });
      }
    }
  }

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialState() {
    return {
      board: Array.from({ length: SIZE }, () => new Array(SIZE).fill(null)),
      turn: "b",
      placed: { b: 0, w: 0 },
      seen: {},
      result: null, // null | { winner, kind, cells } | { draw: "repetition" | "blocked" }
      passed: null // the side that had no move and was skipped by the last move
    };
  }

  function phase(state) {
    return state.placed.b + state.placed.w < 2 * STONES ? "place" : "move";
  }

  // The legal moves of `color` on `board` (phase decides placing or moving).
  function movesFor(board, color, placing) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (placing) {
          if (!board[r][c]) moves.push({ from: null, to: [r, c] });
        } else if (board[r][c] === color) {
          NEIGHBOURS.forEach(([dr, dc]) => {
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && !board[rr][cc]) moves.push({ from: [r, c], to: [rr, cc] });
          });
        }
      }
    }
    return moves;
  }

  function getLegalMoves(state) {
    if (state.result) return [];
    return movesFor(state.board, state.turn, phase(state) === "place");
  }

  // The winning set of four, or null: { winner, kind: "line" | "square", cells }.
  function getWinner(board) {
    for (const w of WINDOWS) {
      const color = board[w.cells[0][0]][w.cells[0][1]];
      if (color && w.cells.every(([r, c]) => board[r][c] === color)) return { winner: color, kind: w.kind, cells: w.cells };
    }
    return null;
  }

  // One move without the repetition count (fast, for the computer's search).
  function step(state, move) {
    const mover = state.turn;
    const board = state.board.map((row) => row.slice());
    const placed = { b: state.placed.b, w: state.placed.w };
    if (move.from) board[move.from[0]][move.from[1]] = null;
    else placed[mover]++;
    board[move.to[0]][move.to[1]] = mover;
    const next = { board, turn: otherColor(mover), placed, seen: state.seen, result: null, passed: null };
    const win = getWinner(board);
    if (win) {
      next.result = win;
      next.turn = mover;
      return next;
    }
    if (!movesFor(board, next.turn, phase(next) === "place").length) {
      // The side to move is stuck: it passes. If the mover is stuck too, draw.
      if (movesFor(board, mover, phase(next) === "place").length) {
        next.passed = next.turn;
        next.turn = mover;
      } else {
        next.result = { draw: "blocked" };
      }
    }
    return next;
  }

  function positionKey(state) {
    return state.board.map((row) => row.map((v) => v || ".").join("")).join("/") + state.turn;
  }

  // One move with the repetition count: third time the same position = draw.
  function applyMove(state, move) {
    const next = step(state, move);
    if (!next.result && phase(next) === "move") {
      const key = positionKey(next);
      const seen = Object.assign({}, next.seen);
      seen[key] = (seen[key] || 0) + 1;
      next.seen = seen;
      if (seen[key] >= 3) next.result = { draw: "repetition" };
    }
    return next;
  }

  return { SIZE, STONES, WINDOWS, otherColor, createInitialState, phase, movesFor, getLegalMoves, getWinner, step, applyMove, positionKey };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ViererzugCore;
}
if (typeof window !== "undefined") {
  window.ViererzugCore = ViererzugCore;
}
