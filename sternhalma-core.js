// sternhalma-core.js
// Dependency-free rules engine for Chinese Checkers (internal slug
// "sternhalma", German for "star Halma" - the name for this game in
// several European languages, since it IS a direct descendant of
// Halma, just played on a six-pointed star board instead of a
// square one - see sternhalma-history.html for the real history of
// how it got its globally-recognized English name instead).
//
// The standard board is a hexagram: a central hexagon (radius 4 in
// cube coordinates, 61 holes) plus six triangular point-extensions
// (10 holes each, one per player in the full 2/3/4/6-player game),
// for 121 holes total. This module implements the 2-player game
// used by this site: each player's 10 marbles start filling one
// point and must be the first to move every one of them into the
// point diagonally (here: directly) opposite.
//
// Movement: on your turn, either step one hole in any of the 6
// adjacent directions into an empty hole, or make one or more
// chained hops - each hop leaps in a straight line over an adjacent
// marble (yours or the opponent's - nothing is captured, hopping is
// purely a way to travel farther in one turn) onto the empty hole
// immediately beyond it. A turn is either exactly one step, or one
// or more chained hops; you may stop after any hop in the chain
// rather than being forced to continue.
//
// Cells are cube coordinates [x, y, z] with x + y + z = 0 (the
// standard way to address a triangular/hex lattice - see e.g.
// hex-core.js for the simpler plain-hex-grid case this game's board
// generalizes). The board is stored as a plain object keyed by
// "x,y,z" -> "p1" | "p2" (an absent key means the hole is empty),
// so it round-trips through JSON for GameStorage exactly like every
// other game's board here.

const SternhalmaCore = (function () {
  const HEX_RADIUS = 4;  // central hexagon: cells with max(|x|,|y|,|z|) <= 4
  const ARM = 4;         // each triangular point has a side of 4 (10 cells)

  // The 6 directions between adjacent holes on the triangular lattice.
  const DIRS = [
    [1, -1, 0], [1, 0, -1], [0, 1, -1],
    [-1, 1, 0], [-1, 0, 1], [0, -1, 1]
  ];

  function key(x, y, z) {
    return x + "," + y + "," + z;
  }

  function otherPlayer(player) {
    return player === "p1" ? "p2" : "p1";
  }

  // The 61-hole central hexagon: every cube-coordinate cell within
  // HEX_RADIUS of the center.
  function hexagonCells() {
    const cells = [];
    for (let x = -HEX_RADIUS; x <= HEX_RADIUS; x++) {
      for (let y = -HEX_RADIUS; y <= HEX_RADIUS; y++) {
        const z = -x - y;
        if (z < -HEX_RADIUS || z > HEX_RADIUS) continue;
        cells.push([x, y, z]);
      }
    }
    return cells;
  }

  // One triangular 10-cell point, attached to the hexagon edge where
  // `axis` (one of "x"/"y"/"z") is most extreme in direction `sign`
  // (+1 or -1). Stepping k = 1..ARM holes further out along that
  // axis, the other two coordinates taper from a 4-cell row down to
  // a single cell, giving the classic 4+3+2+1 = 10 triangular count.
  // (Six calls with every axis/sign combination give the board's six
  // points; see ALL_CELLS below.)
  function pointCells(axis, sign) {
    const others = axis === "x" ? ["y", "z"] : axis === "y" ? ["x", "z"] : ["x", "y"];
    const cells = [];
    for (let k = 1; k <= ARM; k++) {
      if (sign < 0) {
        const extreme = -(HEX_RADIUS + k);
        for (let a = k; a <= HEX_RADIUS; a++) {
          const b = (HEX_RADIUS + k) - a;
          if (b < k || b > HEX_RADIUS) continue;
          const coord = {};
          coord[axis] = extreme;
          coord[others[0]] = a;
          coord[others[1]] = b;
          cells.push([coord.x, coord.y, coord.z]);
        }
      } else {
        const extreme = HEX_RADIUS + k;
        for (let a = -HEX_RADIUS; a <= -k; a++) {
          const b = -(HEX_RADIUS + k) - a;
          if (b < -HEX_RADIUS || b > -k) continue;
          const coord = {};
          coord[axis] = extreme;
          coord[others[0]] = a;
          coord[others[1]] = b;
          cells.push([coord.x, coord.y, coord.z]);
        }
      }
    }
    return cells;
  }

  // The six points, identified by which axis is extreme and in what
  // direction. "p1" starts in the z-negative point and aims for the
  // z-positive point directly opposite (through the center) - see
  // homePointCells/goalPointCells. The other four points ("e"/"w"/
  // "ne"-ish etc.) exist on the board (so a marble may pass through
  // or briefly rest in them) but no one starts there in this
  // 2-player game, matching how this site's Halma is 2-player only
  // even though the full game supports more.
  const POINTS = {
    n: pointCells("z", -1),
    s: pointCells("z", 1),
    x_pos: pointCells("x", 1),
    x_neg: pointCells("x", -1),
    y_pos: pointCells("y", 1),
    y_neg: pointCells("y", -1)
  };

  const ALL_CELLS = hexagonCells()
    .concat(POINTS.n, POINTS.s, POINTS.x_pos, POINTS.x_neg, POINTS.y_pos, POINTS.y_neg);

  const CELL_SET = {};
  ALL_CELLS.forEach(([x, y, z]) => { CELL_SET[key(x, y, z)] = true; });

  function cellExists(x, y, z) {
    return CELL_SET.hasOwnProperty(key(x, y, z));
  }

  function homePointCells(player) {
    return player === "p1" ? POINTS.n : POINTS.s;
  }

  function goalPointCells(player) {
    return homePointCells(otherPlayer(player));
  }

  function createInitialBoard() {
    const board = {};
    homePointCells("p1").forEach(([x, y, z]) => { board[key(x, y, z)] = "p1"; });
    homePointCells("p2").forEach(([x, y, z]) => { board[key(x, y, z)] = "p2"; });
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
      board: Object.assign({}, state.board),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  function stepMovesFrom(board, x, y, z) {
    const moves = [];
    DIRS.forEach(([dx, dy, dz]) => {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (!cellExists(nx, ny, nz)) return;
      if (board[key(nx, ny, nz)]) return;
      moves.push({ type: "step", from: [x, y, z], to: [nx, ny, nz], path: [[x, y, z], [nx, ny, nz]] });
    });
    return moves;
  }

  // Every distinct hop sequence starting at (x,y,z), of any length
  // >= 1 (a player may stop after any single hop) - cycle-guarded so
  // a chain can never land on a hole it has already visited.
  function jumpMovesFrom(board, x, y, z) {
    const moves = [];
    const visited = {};
    visited[key(x, y, z)] = true;

    function extend(cx, cy, cz, path) {
      DIRS.forEach(([dx, dy, dz]) => {
        const mx = cx + dx, my = cy + dy, mz = cz + dz;
        const lx = cx + dx * 2, ly = cy + dy * 2, lz = cz + dz * 2;
        if (!cellExists(lx, ly, lz)) return;
        if (!cellExists(mx, my, mz)) return;
        if (!board[key(mx, my, mz)]) return; // must hop OVER an occupied hole
        if (board[key(lx, ly, lz)]) return;  // landing hole must be empty
        const landKey = key(lx, ly, lz);
        if (visited[landKey]) return;
        visited[landKey] = true;
        const newPath = path.concat([[lx, ly, lz]]);
        moves.push({ type: "jump", from: [x, y, z], to: [lx, ly, lz], path: newPath });
        extend(lx, ly, lz, newPath);
        delete visited[landKey];
      });
    }

    extend(x, y, z, [[x, y, z]]);
    return moves;
  }

  function getLegalMoves(state, player) {
    const moves = [];
    const board = state.board;
    ALL_CELLS.forEach(([x, y, z]) => {
      if (board[key(x, y, z)] !== player) return;
      moves.push.apply(moves, stepMovesFrom(board, x, y, z));
      moves.push.apply(moves, jumpMovesFrom(board, x, y, z));
    });
    return moves;
  }

  function hasWon(board, player) {
    return goalPointCells(player).every(([x, y, z]) => board[key(x, y, z)] === player);
  }

  function applyMove(state, player, move) {
    const next = cloneState(state);
    const fromKey = key(move.from[0], move.from[1], move.from[2]);
    const toKey = key(move.to[0], move.to[1], move.to[2]);
    next.board[toKey] = next.board[fromKey];
    delete next.board[fromKey];

    if (hasWon(next.board, player)) {
      next.gameOver = true;
      next.winner = player;
    }
    next.currentPlayer = otherPlayer(player);
    return next;
  }

  return {
    HEX_RADIUS,
    ARM,
    DIRS,
    ALL_CELLS,
    POINTS,
    key,
    otherPlayer,
    cellExists,
    homePointCells,
    goalPointCells,
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
  module.exports = SternhalmaCore;
}
if (typeof window !== "undefined") {
  window.SternhalmaCore = SternhalmaCore;
}
