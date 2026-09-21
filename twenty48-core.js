// twenty48-core.js
// Dependency-free 2048 engine. No DOM/UI here, same separation of
// concerns as every other <game>-core.js - just no opponent, since
// 2048 (like the other puzzles in this app) is solitaire.
//
// Board: a 4x4 grid of numbers, 0 for empty. Every move slides every
// tile as far as it can go in the chosen direction and merges each
// pair of equal tiles it collides with - but only once per tile per
// move, so a run of three equal tiles sliding together merges the
// leading pair and leaves the third alone rather than cascading, the
// same rule the original game uses.

const Twenty48Core = (function () {
  const SIZE = 4;

  function createEmptyGrid() {
    const grid = [];
    for (let r = 0; r < SIZE; r++) grid.push(new Array(SIZE).fill(0));
    return grid;
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function emptyCells(grid) {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) cells.push([r, c]);
      }
    }
    return cells;
  }

  function spawnRandomTile(grid, rng) {
    const random = rng || Math.random;
    const cells = emptyCells(grid);
    if (!cells.length) return grid;
    const [r, c] = cells[Math.floor(random() * cells.length)];
    const next = cloneGrid(grid);
    next[r][c] = random() < 0.9 ? 2 : 4;
    return next;
  }

  function createInitialState(rng) {
    let grid = createEmptyGrid();
    grid = spawnRandomTile(grid, rng);
    grid = spawnRandomTile(grid, rng);
    return { grid, score: 0, won: false, over: false };
  }

  // Slides and merges one line (array of numbers, empty = 0) toward
  // index 0. Returns { line, gained } - `line` is the new line (same
  // length, zero-padded at the end), `gained` is the score added by
  // any merges in this line.
  function slideLine(line) {
    const values = line.filter((v) => v !== 0);
    const merged = [];
    let gained = 0;
    for (let i = 0; i < values.length; i++) {
      if (i < values.length - 1 && values[i] === values[i + 1]) {
        const mergedValue = values[i] * 2;
        merged.push(mergedValue);
        gained += mergedValue;
        i++; // skip the tile just merged in - each tile merges at most once
      } else {
        merged.push(values[i]);
      }
    }
    while (merged.length < line.length) merged.push(0);
    return { line: merged, gained };
  }

  function getLine(grid, direction, index) {
    const line = [];
    if (direction === "left" || direction === "right") {
      for (let c = 0; c < SIZE; c++) line.push(grid[index][c]);
      if (direction === "right") line.reverse();
    } else {
      for (let r = 0; r < SIZE; r++) line.push(grid[r][index]);
      if (direction === "up") line.reverse();
    }
    return line;
  }

  function setLine(grid, direction, index, line) {
    const oriented = (direction === "right" || direction === "up") ? line.slice().reverse() : line;
    if (direction === "left" || direction === "right") {
      for (let c = 0; c < SIZE; c++) grid[index][c] = oriented[c];
    } else {
      for (let r = 0; r < SIZE; r++) grid[r][index] = oriented[r];
    }
  }

  // Applies one move without spawning a new tile - used both by the
  // real move() below and by canMove()'s look-ahead, since spawning is
  // a separate, randomized step that only happens after a move that
  // actually changed the board.
  function slideGrid(grid, direction) {
    const next = cloneGrid(grid);
    let gained = 0;
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
      const before = getLine(grid, direction, i);
      const { line, gained: lineGained } = slideLine(before);
      if (line.some((v, idx) => v !== before[idx])) moved = true;
      gained += lineGained;
      setLine(next, direction, i, line);
    }
    return { grid: next, gained, moved };
  }

  function hasWinningTile(grid) {
    return grid.some((row) => row.some((v) => v >= 2048));
  }

  function canMove(grid) {
    if (emptyCells(grid).length > 0) return true;
    return ["left", "right", "up", "down"].some((dir) => slideGrid(grid, dir).moved);
  }

  // Returns a new state. If the move doesn't change the board (an
  // illegal/no-op move, e.g. sliding left with nothing left to slide),
  // the returned state is unchanged.
  function move(state, direction, rng) {
    const { grid, gained, moved } = slideGrid(state.grid, direction);
    if (!moved) return state;

    let nextGrid = spawnRandomTile(grid, rng);
    const won = state.won || hasWinningTile(nextGrid);
    const over = !canMove(nextGrid);
    return {
      grid: nextGrid,
      score: state.score + gained,
      won,
      over
    };
  }

  return {
    SIZE,
    createEmptyGrid,
    cloneGrid,
    emptyCells,
    spawnRandomTile,
    createInitialState,
    slideGrid,
    canMove,
    hasWinningTile,
    move
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Twenty48Core;
}
if (typeof window !== "undefined") {
  window.Twenty48Core = Twenty48Core;
}
