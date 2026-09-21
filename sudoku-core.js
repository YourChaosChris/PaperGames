// sudoku-core.js
// Dependency-free Sudoku engine: puzzle generation (a full random valid
// grid, then cells removed one at a time as long as the puzzle keeps a
// unique solution) plus the validation logic the UI needs (conflicts,
// completion). No DOM/UI here, same separation of concerns as every
// other <game>-core.js in this app - just no opponent, since Sudoku is
// solitaire.
//
// A grid is a flat array of 81 numbers, 0 for empty, 1-9 for filled;
// index i is row Math.floor(i/9), column i%9. Candidate tracking uses a
// 10-bit mask per row/column/3x3 box (bit d set means digit d is
// already placed in that row/column/box) so both solving and counting
// solutions can prune hard instead of re-scanning the grid.

const SudokuCore = (function () {
  const SIZE = 9;
  const CELLS = SIZE * SIZE;

  function boxIndex(r, c) {
    return Math.floor(r / 3) * 3 + Math.floor(c / 3);
  }

  function emptyGrid() {
    return new Array(CELLS).fill(0);
  }

  function cloneGrid(grid) {
    return grid.slice();
  }

  function buildMasks(grid) {
    const rows = new Array(SIZE).fill(0);
    const cols = new Array(SIZE).fill(0);
    const boxes = new Array(SIZE).fill(0);
    for (let i = 0; i < CELLS; i++) {
      const v = grid[i];
      if (!v) continue;
      const r = Math.floor(i / SIZE), c = i % SIZE;
      const bit = 1 << v;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[boxIndex(r, c)] |= bit;
    }
    return { rows, cols, boxes };
  }

  function candidateMask(masks, r, c) {
    return ~(masks.rows[r] | masks.cols[c] | masks.boxes[boxIndex(r, c)]);
  }

  function candidateDigits(masks, r, c) {
    const mask = candidateMask(masks, r, c);
    const digits = [];
    for (let d = 1; d <= 9; d++) {
      if (mask & (1 << d)) digits.push(d);
    }
    return digits;
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // Fills `grid` completely via randomized backtracking (always
  // possible from an empty grid) - used to generate a fresh solved
  // Sudoku to derive puzzles from.
  function generateSolvedGrid(rng) {
    const grid = emptyGrid();
    const masks = { rows: new Array(SIZE).fill(0), cols: new Array(SIZE).fill(0), boxes: new Array(SIZE).fill(0) };

    function place(pos) {
      if (pos === CELLS) return true;
      const r = Math.floor(pos / SIZE), c = pos % SIZE;
      const digits = shuffle(candidateDigits(masks, r, c), rng);
      for (const d of digits) {
        const bit = 1 << d;
        grid[pos] = d;
        masks.rows[r] |= bit; masks.cols[c] |= bit; masks.boxes[boxIndex(r, c)] |= bit;
        if (place(pos + 1)) return true;
        grid[pos] = 0;
        masks.rows[r] &= ~bit; masks.cols[c] &= ~bit; masks.boxes[boxIndex(r, c)] &= ~bit;
      }
      return false;
    }

    place(0);
    return grid;
  }

  // Counts solutions of `grid` up to `limit` (default 2, just enough to
  // distinguish "unique" from "not unique" without solving further than
  // needed), using the minimum-remaining-values heuristic to keep the
  // search fast even on a nearly-empty grid.
  function countSolutions(grid, limit) {
    limit = limit || 2;
    const working = cloneGrid(grid);
    const masks = buildMasks(working);
    let count = 0;

    function search() {
      let bestPos = -1, bestDigits = null;
      for (let i = 0; i < CELLS; i++) {
        if (working[i]) continue;
        const r = Math.floor(i / SIZE), c = i % SIZE;
        const digits = candidateDigits(masks, r, c);
        if (digits.length === 0) return; // dead end
        if (!bestDigits || digits.length < bestDigits.length) {
          bestPos = i; bestDigits = digits;
          if (digits.length === 1) break; // can't do better than a forced cell
        }
      }
      if (bestPos === -1) { // no empty cells left - a full valid solution
        count++;
        return;
      }
      const r = Math.floor(bestPos / SIZE), c = bestPos % SIZE;
      for (const d of bestDigits) {
        if (count >= limit) return;
        const bit = 1 << d;
        working[bestPos] = d;
        masks.rows[r] |= bit; masks.cols[c] |= bit; masks.boxes[boxIndex(r, c)] |= bit;
        search();
        working[bestPos] = 0;
        masks.rows[r] &= ~bit; masks.cols[c] &= ~bit; masks.boxes[boxIndex(r, c)] &= ~bit;
        if (count >= limit) return;
      }
    }

    search();
    return count;
  }

  function solve(grid) {
    const working = cloneGrid(grid);
    const masks = buildMasks(working);

    function place() {
      let bestPos = -1, bestDigits = null;
      for (let i = 0; i < CELLS; i++) {
        if (working[i]) continue;
        const r = Math.floor(i / SIZE), c = i % SIZE;
        const digits = candidateDigits(masks, r, c);
        if (digits.length === 0) return false;
        if (!bestDigits || digits.length < bestDigits.length) {
          bestPos = i; bestDigits = digits;
          if (digits.length === 1) break;
        }
      }
      if (bestPos === -1) return true;
      const r = Math.floor(bestPos / SIZE), c = bestPos % SIZE;
      for (const d of bestDigits) {
        const bit = 1 << d;
        working[bestPos] = d;
        masks.rows[r] |= bit; masks.cols[c] |= bit; masks.boxes[boxIndex(r, c)] |= bit;
        if (place()) return true;
        working[bestPos] = 0;
        masks.rows[r] &= ~bit; masks.cols[c] &= ~bit; masks.boxes[boxIndex(r, c)] &= ~bit;
      }
      return false;
    }

    return place() ? working : null;
  }

  // Difficulty is expressed as a target number of remaining givens -
  // approximate, since the removal loop stops early if it runs out of
  // cells that can be removed without breaking uniqueness.
  const DIFFICULTY_GIVENS = { easy: 38, medium: 30, hard: 24 };

  function generatePuzzle(difficulty, rng) {
    const solution = generateSolvedGrid(rng);
    const puzzle = cloneGrid(solution);
    const targetGivens = DIFFICULTY_GIVENS[difficulty] || DIFFICULTY_GIVENS.medium;

    const order = shuffle(Array.from({ length: CELLS }, (_, i) => i), rng);
    let givens = CELLS;
    for (const pos of order) {
      if (givens <= targetGivens) break;
      const saved = puzzle[pos];
      puzzle[pos] = 0;
      if (countSolutions(puzzle, 2) === 1) {
        givens--;
      } else {
        puzzle[pos] = saved;
      }
    }

    return { puzzle, solution, givens };
  }

  // Every currently-filled cell that conflicts with another filled cell
  // sharing its row, column, or box - returned as a Set of cell indices
  // (a pair of conflicting cells both appear in the set).
  function findConflicts(grid) {
    const conflicts = new Set();
    const groups = [];
    for (let r = 0; r < SIZE; r++) groups.push(Array.from({ length: SIZE }, (_, c) => r * SIZE + c));
    for (let c = 0; c < SIZE; c++) groups.push(Array.from({ length: SIZE }, (_, r) => r * SIZE + c));
    for (let b = 0; b < SIZE; b++) {
      const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
      const cells = [];
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((br + dr) * SIZE + (bc + dc));
      groups.push(cells);
    }
    groups.forEach((cells) => {
      const seen = {};
      cells.forEach((i) => {
        const v = grid[i];
        if (!v) return;
        if (seen[v] !== undefined) {
          conflicts.add(i);
          conflicts.add(seen[v]);
        } else {
          seen[v] = i;
        }
      });
    });
    return conflicts;
  }

  function isComplete(grid) {
    if (grid.some((v) => !v)) return false;
    return findConflicts(grid).size === 0;
  }

  return {
    SIZE,
    CELLS,
    boxIndex,
    emptyGrid,
    cloneGrid,
    candidateDigits,
    generateSolvedGrid,
    countSolutions,
    solve,
    generatePuzzle,
    findConflicts,
    isComplete
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SudokuCore;
}
if (typeof window !== "undefined") {
  window.SudokuCore = SudokuCore;
}
