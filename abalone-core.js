// abalone-core.js
// Dependency-free rules engine for Abalone: two players push marbles
// around a hexagonal board of 61 cells (rows of 5,6,7,8,9,8,7,6,5),
// trying to shove 6 of the opponent's marbles off the edge. Mirrors the
// separation of concerns in fanorona-core.js/hex-core.js: rules only,
// no DOM/UI.
//
// Board representation: cells are addressed by cube coordinates
// (x, y, z) with x + y + z = 0 and max(|x|,|y|,|z|) <= 4 - the standard
// "hexagon of radius 4" coordinate system (61 = 3*4*5 + 1 cells), which
// makes the 6 hex directions simple unit vectors and keeps line/axis
// detection (needed for inline vs. broadside moves) trivial. Each cell
// also carries a (row, col) pair, with row 0 at one edge of the
// hexagon (5 cells) widening to row 4 in the middle (9 cells) and back
// down to row 8 (5 cells) - this is only used for a11y labels and
// pixel layout in abalone-app.js; all rules logic uses the cube
// coordinates and the precomputed NEIGHBORS table below.
//
// Moves: a "group" is 1, 2 or 3 of the mover's own marbles, contiguous
// along one of the board's 3 axes. A single marble may step into any
// adjacent empty cell. A 2- or 3-marble group may move along its own
// axis ("inline") or sideways ("broadside"). A broadside move requires
// every destination cell to be empty (no pushing). An inline move
// requires the cell immediately ahead to be empty (plain slide) OR to
// hold a contiguous line of enemy marbles shorter than the mover's own
// group ("sumito") with room to give: either an empty cell right past
// that enemy line, or the edge of the board (in which case the last
// enemy marble in the line is eliminated - this is how a player
// scores). A group can never move off the board itself; only marbles
// it pushes can be eliminated. Game ends when either side has lost 6
// marbles.

const AbaloneCore = (function () {
  const ROWS_LENGTHS = [5, 6, 7, 8, 9, 8, 7, 6, 5];
  const ROWS = ROWS_LENGTHS.length;
  const TOTAL_CELLS = ROWS_LENGTHS.reduce((a, b) => a + b, 0); // 61
  const PIECES_PER_PLAYER = 14;
  const MARBLES_TO_LOSE = 6;

  // The 6 hex directions as cube-coordinate unit vectors, ordered as
  // opposite pairs (0/3, 1/4, 2/5) so opposite(d) is a simple (d+3)%6.
  const DIRS = [
    { dx: 1, dy: -1, dz: 0 },
    { dx: 1, dy: 0, dz: -1 },
    { dx: 0, dy: 1, dz: -1 },
    { dx: -1, dy: 1, dz: 0 },
    { dx: -1, dy: 0, dz: 1 },
    { dx: 0, dy: -1, dz: 1 }
  ];
  // The 3 axes a line of marbles can lie along, named by one of their
  // two direction indices (the other is its opposite).
  const AXES = [0, 1, 2];

  function opposite(dir) {
    return (dir + 3) % 6;
  }

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function rowOffset(row) {
    // Row r (z = r-4) holds cube-x values in [max(-4,-4-z), min(4,4-z)],
    // i.e. [max(-4, row-8), min(4, row)] - this is the leftmost column's
    // cube-x distance from 0, i.e. how much to subtract from a
    // 0-indexed column to get cube-x. Since row is always 0-8, the
    // lower bound never binds, so this simplifies to min(4, row).
    return Math.min(4, row);
  }

  // Build the 61 cells (cube coords + row/col) and the lookup tables
  // used everywhere else: CELLS[index], an index-by-(row,col) table,
  // and an index-by-cube-coordinate map for neighbor resolution.
  function buildCells() {
    const cells = [];
    const byRowCol = [];
    const byCube = new Map();
    for (let row = 0; row < ROWS; row++) {
      byRowCol.push([]);
      const len = ROWS_LENGTHS[row];
      const offset = rowOffset(row);
      for (let col = 0; col < len; col++) {
        const x = col - offset;
        const z = row - 4;
        const y = -x - z;
        const dist = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
        const index = cells.length;
        cells.push({ index, row, col, x, y, z, dist });
        byRowCol[row].push(index);
        byCube.set(x + "," + y + "," + z, index);
      }
    }
    return { cells, byRowCol, byCube };
  }

  const { cells: CELLS, byRowCol: BY_ROW_COL, byCube: BY_CUBE } = buildCells();

  // NEIGHBORS[index][dir] = neighbor's index, or null if off-board.
  function buildNeighbors() {
    const table = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const c = CELLS[i];
      const row = [];
      DIRS.forEach((d) => {
        const key = (c.x + d.dx) + "," + (c.y + d.dy) + "," + (c.z + d.dz);
        row.push(BY_CUBE.has(key) ? BY_CUBE.get(key) : null);
      });
      table.push(row);
    }
    return table;
  }

  const NEIGHBORS = buildNeighbors();

  function createInitialBoard() {
    const board = new Array(TOTAL_CELLS).fill(null);
    function setRow(row, color) {
      BY_ROW_COL[row].forEach((idx) => { board[idx] = color; });
    }
    function setRowMiddle(row, cols, color) {
      cols.forEach((col) => { board[BY_ROW_COL[row][col]] = color; });
    }
    // Black fills rows 0-1 plus the middle 3 of row 2 (14 marbles);
    // White mirrors it on rows 8-7 plus the middle 3 of row 6.
    setRow(0, "b");
    setRow(1, "b");
    setRowMiddle(2, [2, 3, 4], "b");
    setRow(8, "w");
    setRow(7, "w");
    setRowMiddle(6, [2, 3, 4], "w");
    return board;
  }

  function cloneBoard(board) {
    return board.slice();
  }

  function countColor(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) if (board[i] === color) n++;
    return n;
  }

  // Every group of 1, 2 or 3 of `color`'s marbles that forms a
  // contiguous line: { cells: [idx,...] ordered along axisDir, axisDir }
  // (axisDir is null for a lone marble, which has no axis).
  function getGroups(board, color) {
    const groups = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (board[i] === color) groups.push({ cells: [i], axisDir: null });
    }
    AXES.forEach((d) => {
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (board[i] !== color) continue;
        const j = NEIGHBORS[i][d];
        if (j === null || board[j] !== color) continue;
        groups.push({ cells: [i, j], axisDir: d });
        const k = NEIGHBORS[j][d];
        if (k !== null && board[k] === color) {
          groups.push({ cells: [i, j, k], axisDir: d });
        }
      }
    });
    return groups;
  }

  // Given an arbitrary (order-independent) array of 1-3 of `color`'s
  // cells, returns the properly-ordered group object if they form a
  // valid contiguous line, or null if they don't. Used by the UI to
  // validate a player's click-by-click marble selection.
  function resolveGroup(board, color, cellsArr) {
    if (!cellsArr || cellsArr.length < 1 || cellsArr.length > 3) return null;
    const set = new Set(cellsArr);
    if (set.size !== cellsArr.length) return null;
    if (cellsArr.length === 1) {
      return board[cellsArr[0]] === color ? { cells: cellsArr.slice(), axisDir: null } : null;
    }
    for (const d of AXES) {
      const od = opposite(d);
      const starts = cellsArr.filter((c) => {
        const p = NEIGHBORS[c][od];
        return !(p !== null && set.has(p));
      });
      if (starts.length !== 1) continue;
      let cur = starts[0];
      if (board[cur] !== color) continue;
      const ordered = [cur];
      let ok = true;
      for (let k = 1; k < cellsArr.length; k++) {
        const nxt = NEIGHBORS[cur][d];
        if (nxt === null || !set.has(nxt) || board[nxt] !== color) { ok = false; break; }
        ordered.push(nxt);
        cur = nxt;
      }
      if (ok && ordered.length === cellsArr.length) {
        return { cells: ordered, axisDir: d };
      }
    }
    return null;
  }

  // Every legal move for a specific group:
  // { cells, dir, type: "single"|"inline"|"broadside", enemyLine: [idx,...], capturedCount: 0|1 }
  // enemyLine is ordered nearest-to-farthest from the group and is only
  // non-empty for an inline sumito; capturedCount is 1 only when the
  // farthest enemy marble in that line is pushed off the board.
  function getGroupMoves(board, color, group) {
    const moves = [];
    const cells = group.cells;
    const axisDir = group.axisDir;
    const opp = otherColor(color);

    for (let dir = 0; dir < 6; dir++) {
      if (cells.length === 1) {
        const dest = NEIGHBORS[cells[0]][dir];
        if (dest !== null && board[dest] === null) {
          moves.push({ cells, dir, type: "single", enemyLine: [], capturedCount: 0 });
        }
        continue;
      }

      const isInline = dir === axisDir || dir === opposite(axisDir);
      if (isInline) {
        const front = dir === axisDir ? cells[cells.length - 1] : cells[0];
        const dest = NEIGHBORS[front][dir];
        if (dest === null) continue; // a group may never move itself off the board
        if (board[dest] === null) {
          moves.push({ cells, dir, type: "inline", enemyLine: [], capturedCount: 0 });
        } else if (board[dest] === opp) {
          const enemyLine = [];
          let cur = dest;
          while (cur !== null && board[cur] === opp) {
            enemyLine.push(cur);
            cur = NEIGHBORS[cur][dir];
          }
          if (cells.length > enemyLine.length) {
            if (cur === null) {
              moves.push({ cells, dir, type: "inline", enemyLine, capturedCount: 1 });
            } else if (board[cur] === null) {
              moves.push({ cells, dir, type: "inline", enemyLine, capturedCount: 0 });
            }
            // else: blocked by another marble past the enemy line - illegal
          }
          // else: enemy line is as long as or longer than the group - illegal
        }
        // else: blocked by the mover's own marble - illegal
      } else {
        // Broadside: every cell in the group shifts sideways by one step;
        // every destination must be empty (no pushing on a broadside).
        const destCells = cells.map((c) => NEIGHBORS[c][dir]);
        if (destCells.some((d) => d === null)) continue;
        if (destCells.every((d) => board[d] === null)) {
          moves.push({ cells, dir, type: "broadside", enemyLine: [], capturedCount: 0 });
        }
      }
    }
    return moves;
  }

  function getLegalMoves(board, color) {
    const groups = getGroups(board, color);
    const moves = [];
    groups.forEach((g) => { getGroupMoves(board, color, g).forEach((m) => moves.push(m)); });
    return moves;
  }

  // The set of cells the move lands on that weren't already occupied by
  // the group itself - i.e. the cell(s) a UI should highlight as this
  // move's clickable destination. Always 1 cell for an inline move
  // (the rest of the group slides into cells it already touched) and
  // exactly `cells.length` cells for a broadside or single move.
  function moveNewCells(move) {
    const originalSet = new Set(move.cells);
    const result = [];
    move.cells.forEach((c) => {
      const dest = NEIGHBORS[c][move.dir];
      if (dest !== null && !originalSet.has(dest)) result.push(dest);
    });
    return result;
  }

  // Applies a move to a fresh copy of the board. Returns the new board;
  // move.capturedCount (already computed by getGroupMoves) tells the
  // caller whether an opponent marble was eliminated.
  function applyMove(board, color, move) {
    const next = board.slice();
    const opp = otherColor(color);
    move.cells.forEach((c) => { next[c] = null; });
    move.enemyLine.forEach((c) => { next[c] = null; });
    move.enemyLine.forEach((c) => {
      const dest = NEIGHBORS[c][move.dir];
      if (dest !== null) next[dest] = opp;
    });
    move.cells.forEach((c) => {
      const dest = NEIGHBORS[c][move.dir];
      next[dest] = color;
    });
    return next;
  }

  // { status: "normal" | "marbles" | "no-moves", winner: "b" | "w" | null }
  function detectGameEnd(board, colorToMove) {
    const lostB = PIECES_PER_PLAYER - countColor(board, "b");
    const lostW = PIECES_PER_PLAYER - countColor(board, "w");
    if (lostB >= MARBLES_TO_LOSE) return { status: "marbles", winner: "w" };
    if (lostW >= MARBLES_TO_LOSE) return { status: "marbles", winner: "b" };
    if (colorToMove && getLegalMoves(board, colorToMove).length === 0) {
      return { status: "no-moves", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    ROWS,
    ROWS_LENGTHS,
    TOTAL_CELLS,
    PIECES_PER_PLAYER,
    MARBLES_TO_LOSE,
    DIRS,
    AXES,
    CELLS,
    BY_ROW_COL,
    NEIGHBORS,
    opposite,
    otherColor,
    createInitialBoard,
    cloneBoard,
    countColor,
    getGroups,
    resolveGroup,
    getGroupMoves,
    getLegalMoves,
    moveNewCells,
    applyMove,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AbaloneCore;
}
if (typeof window !== "undefined") {
  window.AbaloneCore = AbaloneCore;
}
