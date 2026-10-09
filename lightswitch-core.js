// lightswitch-core.js
// Dependency-free Light Switch engine. Solitaire, like Sudoku, Minesweeper
// and the other single-player puzzles here - no opponent, no AI.
//
// The board is a 5x5 grid of booleans (true = "on"/lit). Pressing a cell
// toggles it and its orthogonal (up/down/left/right) neighbors - a
// classic linear-algebra-over-GF(2) puzzle: every button is its own
// inverse (pressing it twice cancels out) and presses commute (order
// never matters), because toggling is just XOR.
//
// That algebra is exactly what makes the generator below simple and
// provably correct: starting from the all-off grid and pressing a
// random sequence of buttons always leaves a grid that sequence itself
// can undo - press the very same buttons again, in any order, and every
// cell gets toggled an even number of times overall except for nothing
// extra, returning the grid to all-off. So generating a puzzle this way
// guarantees it is solvable, with no separate solver or validator
// needed (unlike Nonograms, which does need one, since not every
// possible picture's clues are satisfiable at all - here every grid this
// generator can produce is solvable by construction).

const LightSwitchCore = (function () {
  const DEFAULT_SIZE = 5;

  function createEmptyGrid(size) {
    const grid = [];
    for (let r = 0; r < size; r++) grid.push(new Array(size).fill(false));
    return grid;
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  // The cell itself plus any in-bounds orthogonal neighbor - a corner
  // cell has only 2 neighbors (3 cells total), an edge cell has 3 (4
  // cells total), and every other cell has all 4 (5 cells total).
  function affectedCells(size, r, c) {
    const cells = [[r, c]];
    if (r > 0) cells.push([r - 1, c]);
    if (r < size - 1) cells.push([r + 1, c]);
    if (c > 0) cells.push([r, c - 1]);
    if (c < size - 1) cells.push([r, c + 1]);
    return cells;
  }

  // Presses (r, c): toggles that cell and its orthogonal neighbors.
  // Returns a new grid, leaving the one passed in untouched.
  function pressCell(grid, r, c) {
    const size = grid.length;
    const next = cloneGrid(grid);
    affectedCells(size, r, c).forEach(([nr, nc]) => { next[nr][nc] = !next[nr][nc]; });
    return next;
  }

  function isSolved(grid) {
    return grid.every((row) => row.every((cell) => !cell));
  }

  function countOn(grid) {
    let n = 0;
    grid.forEach((row) => row.forEach((cell) => { if (cell) n++; }));
    return n;
  }

  // Scrambles a fresh puzzle by starting from the all-off grid and
  // pressing `presses` random cells - see the file comment above for why
  // this guarantees the result is solvable. Also returns the exact
  // sequence of presses used, so a game (or a test) could replay it to
  // solve the puzzle deterministically if it ever wanted to.
  //
  // A tiny loop guards against the (rare, but possible for a small
  // press count) case where the random presses happen to cancel each
  // other out and land back on all-off - that would hand the player an
  // already-solved puzzle, which isn't a scramble at all.
  function generatePuzzle(size, presses, rng) {
    const random = rng || Math.random;
    let grid;
    let sequence;
    do {
      grid = createEmptyGrid(size);
      sequence = [];
      for (let i = 0; i < presses; i++) {
        const r = Math.floor(random() * size);
        const c = Math.floor(random() * size);
        grid = pressCell(grid, r, c);
        sequence.push([r, c]);
      }
    } while (presses > 0 && isSolved(grid));
    return { grid, sequence };
  }

  // Every set of presses that turns the grid all-off. Over GF(2) a
  // solution is a set of cells (pressing twice cancels, order never
  // matters), and it is fixed entirely by its top row: once row r is
  // settled, a light left on in row r can only still be switched by the
  // cell directly below it, so row r + 1's presses are forced. Trying all
  // 2^size top rows and following each one down ("chasing" the presses)
  // therefore yields every solution exactly once - four on the 5x5 board
  // for any solvable grid, none for an unsolvable one.
  function allSolutions(grid) {
    const size = grid.length;
    const out = [];
    for (let mask = 0; mask < (1 << size); mask++) {
      let g = grid;
      const presses = [];
      for (let c = 0; c < size; c++) {
        if (mask & (1 << c)) { g = pressCell(g, 0, c); presses.push([0, c]); }
      }
      for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size; c++) {
          if (g[r][c]) { g = pressCell(g, r + 1, c); presses.push([r + 1, c]); }
        }
      }
      if (isSolved(g)) out.push(presses);
    }
    return out;
  }

  // A solution with the fewest presses (cells in reading order), or null
  // if the grid cannot be solved. Ties go to the first one found.
  function shortestSolution(grid) {
    let best = null;
    allSolutions(grid).forEach((presses) => {
      if (!best || presses.length < best.length) best = presses;
    });
    if (!best) return null;
    return best.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }

  return {
    DEFAULT_SIZE,
    createEmptyGrid,
    cloneGrid,
    affectedCells,
    pressCell,
    isSolved,
    countOn,
    generatePuzzle,
    allSolutions,
    shortestSolution
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = LightSwitchCore;
}
if (typeof window !== "undefined") {
  window.LightSwitchCore = LightSwitchCore;
}
