// quoridor-core.js
// Dependency-free rules engine for Quoridor: a 9x9 board, two pawns
// racing for the opposite edge, and ten walls per player that can
// slow the opponent down but must never fully block either player's
// path to their goal.
//
// Cells are (row, col) in 0..8. Player 1 starts at the top (row 0)
// and aims for row 8; player 2 starts at the bottom (row 8) and aims
// for row 0.
//
// Walls sit on the grid of intersections between cells, indexed
// (wallRow, wallCol) in 0..7. A horizontal wall at (wr, wc) blocks
// vertical movement between row wr/wr+1 at BOTH column wc and column
// wc+1 (a wall is two cell-edges long); a vertical wall at (wr, wc)
// blocks horizontal movement between column wc/wc+1 at both row wr
// and row wr+1. Two walls may never overlap the same edge segment,
// and a horizontal and vertical wall may never cross at the same
// intersection - both standard Quoridor rules.

const QuoridorCore = (function () {
  const SIZE = 9;
  const WALL_GRID = 8;
  const GOAL_ROW = { p1: 8, p2: 0 };
  const START = { p1: [0, 4], p2: [8, 4] };
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function otherPlayer(player) {
    return player === "p1" ? "p2" : "p1";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function makeWallGrid() {
    const grid = [];
    for (let r = 0; r < WALL_GRID; r++) grid.push(new Array(WALL_GRID).fill(false));
    return grid;
  }

  function createInitialState() {
    return {
      pawns: { p1: START.p1.slice(), p2: START.p2.slice() },
      wallsRemaining: { p1: 10, p2: 10 },
      horizontalWalls: makeWallGrid(),
      verticalWalls: makeWallGrid(),
      currentPlayer: "p1",
      gameOver: false,
      winner: null
    };
  }

  function cloneState(state) {
    return {
      pawns: { p1: state.pawns.p1.slice(), p2: state.pawns.p2.slice() },
      wallsRemaining: { p1: state.wallsRemaining.p1, p2: state.wallsRemaining.p2 },
      horizontalWalls: state.horizontalWalls.map((row) => row.slice()),
      verticalWalls: state.verticalWalls.map((row) => row.slice()),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  // Is the edge between two orthogonally-adjacent cells blocked by a wall?
  function isWallBetween(state, a, b) {
    const [r1, c1] = a, [r2, c2] = b;
    if (r1 === r2) {
      const c = Math.min(c1, c2);
      const r = r1;
      const hasAt = (wr) => wr >= 0 && wr < WALL_GRID && state.verticalWalls[wr][c];
      return hasAt(r) || hasAt(r - 1);
    }
    if (c1 === c2) {
      const r = Math.min(r1, r2);
      const c = c1;
      const hasAt = (wc) => wc >= 0 && wc < WALL_GRID && state.horizontalWalls[r][wc];
      return hasAt(c) || hasAt(c - 1);
    }
    return true; // not orthogonally adjacent
  }

  function canPlaceWallShape(state, orientation, wr, wc) {
    if (wr < 0 || wr >= WALL_GRID || wc < 0 || wc >= WALL_GRID) return false;
    if (orientation === "h") {
      if (state.horizontalWalls[wr][wc]) return false;
      if (wc > 0 && state.horizontalWalls[wr][wc - 1]) return false;
      if (wc < WALL_GRID - 1 && state.horizontalWalls[wr][wc + 1]) return false;
      if (state.verticalWalls[wr][wc]) return false; // crossing
    } else {
      if (state.verticalWalls[wr][wc]) return false;
      if (wr > 0 && state.verticalWalls[wr - 1][wc]) return false;
      if (wr < WALL_GRID - 1 && state.verticalWalls[wr + 1][wc]) return false;
      if (state.horizontalWalls[wr][wc]) return false; // crossing
    }
    return true;
  }

  function placeWallInGrids(state, orientation, wr, wc) {
    if (orientation === "h") state.horizontalWalls[wr][wc] = true;
    else state.verticalWalls[wr][wc] = true;
  }

  // Breadth-first search for the shortest distance (in steps) from
  // `from` to any cell in row `goalRow`, respecting walls but
  // ignoring pawns - the standard way to check "is a path still
  // open", since pawns can always maneuver around each other.
  function shortestDistanceToRow(state, from, goalRow) {
    const visited = new Array(SIZE * SIZE).fill(false);
    const key = (r, c) => r * SIZE + c;
    let frontier = [from];
    visited[key(from[0], from[1])] = true;
    let dist = 0;
    while (frontier.length) {
      for (let i = 0; i < frontier.length; i++) {
        if (frontier[i][0] === goalRow) return dist;
      }
      const next = [];
      for (const [r, c] of frontier) {
        DIRS.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (!inBounds(nr, nc)) return;
          if (visited[key(nr, nc)]) return;
          if (isWallBetween(state, [r, c], [nr, nc])) return;
          visited[key(nr, nc)] = true;
          next.push([nr, nc]);
        });
      }
      frontier = next;
      dist++;
    }
    return Infinity;
  }

  function hasPathToGoal(state, from, goalRow) {
    return shortestDistanceToRow(state, from, goalRow) !== Infinity;
  }

  function pawnMoves(state, player) {
    const moves = [];
    const pos = state.pawns[player];
    const oppPos = state.pawns[otherPlayer(player)];
    DIRS.forEach(([dr, dc]) => {
      const nr = pos[0] + dr, nc = pos[1] + dc;
      if (!inBounds(nr, nc)) return;
      if (isWallBetween(state, pos, [nr, nc])) return;
      if (nr === oppPos[0] && nc === oppPos[1]) {
        const jr = nr + dr, jc = nc + dc;
        if (inBounds(jr, jc) && !isWallBetween(state, [nr, nc], [jr, jc])) {
          moves.push({ type: "move", to: [jr, jc] });
          return;
        }
        const perp = dr !== 0 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]];
        perp.forEach(([pr, pc]) => {
          const tr = nr + pr, tc = nc + pc;
          if (inBounds(tr, tc) && !isWallBetween(state, [nr, nc], [tr, tc])) {
            moves.push({ type: "move", to: [tr, tc] });
          }
        });
      } else {
        moves.push({ type: "move", to: [nr, nc] });
      }
    });
    return moves;
  }

  function wallMoves(state, player) {
    if (state.wallsRemaining[player] <= 0) return [];
    const moves = [];
    for (let wr = 0; wr < WALL_GRID; wr++) {
      for (let wc = 0; wc < WALL_GRID; wc++) {
        ["h", "v"].forEach((orientation) => {
          if (!canPlaceWallShape(state, orientation, wr, wc)) return;
          const test = cloneState(state);
          placeWallInGrids(test, orientation, wr, wc);
          if (hasPathToGoal(test, test.pawns.p1, GOAL_ROW.p1) && hasPathToGoal(test, test.pawns.p2, GOAL_ROW.p2)) {
            moves.push({ type: "wall", orientation, row: wr, col: wc });
          }
        });
      }
    }
    return moves;
  }

  function getLegalMoves(state, player) {
    return pawnMoves(state, player).concat(wallMoves(state, player));
  }

  function applyMove(state, player, move) {
    const next = cloneState(state);
    if (move.type === "move") {
      next.pawns[player] = move.to.slice();
      if (move.to[0] === GOAL_ROW[player]) {
        next.gameOver = true;
        next.winner = player;
      }
    } else {
      placeWallInGrids(next, move.orientation, move.row, move.col);
      next.wallsRemaining[player]--;
    }
    next.currentPlayer = otherPlayer(player);
    return next;
  }

  return {
    SIZE,
    WALL_GRID,
    GOAL_ROW,
    START,
    otherPlayer,
    inBounds,
    createInitialState,
    cloneState,
    isWallBetween,
    canPlaceWallShape,
    shortestDistanceToRow,
    hasPathToGoal,
    getLegalMoves,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = QuoridorCore;
}
if (typeof window !== "undefined") {
  window.QuoridorCore = QuoridorCore;
}
