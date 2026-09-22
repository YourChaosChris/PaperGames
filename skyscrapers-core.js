// skyscrapers-core.js
// Dependency-free Skyscrapers engine: the board/clue data model plus the
// validation logic the UI needs (Latin-square conflicts, edge-clue
// status, win-checking). No DOM/UI here and no puzzle generation - same
// separation of concerns as every other <game>-core.js in this app, with
// generation and solving split out into skyscrapers-puzzles.js the way
// kakuro-core.js/kakuro-puzzles.js split those concerns for Kakuro.
//
// A grid is a flat array of n*n building heights, 0 for empty, 1-n for
// filled; index i is row Math.floor(i/n), column i%n. Skyscrapers is a
// Latin square like Sudoku (every row and column contains every height
// exactly once) but has no sub-box rule - instead it adds "edge clues"
// around all four sides: a clue is how many buildings are visible
// looking into that row/column from just outside that edge, where a
// taller building completely hides every shorter one behind it from
// that viewpoint.
//
// Clues are stored as { top, bottom, left, right }, each an array of n
// values that are either a number (revealed) or null (not shown for
// that row/column on that side) - top/bottom index by column, left/right
// index by row, matching the board's own row/column order.

const SkyscrapersCore = (function () {
  function cellIndex(n, r, c) {
    return r * n + c;
  }

  function emptyGrid(n) {
    return new Array(n * n).fill(0);
  }

  function cloneGrid(grid) {
    return grid.slice();
  }

  function rowValues(grid, n, r) {
    const line = [];
    for (let c = 0; c < n; c++) line.push(grid[r * n + c]);
    return line;
  }

  function colValues(grid, n, c) {
    const line = [];
    for (let r = 0; r < n; r++) line.push(grid[r * n + c]);
    return line;
  }

  // How many buildings are visible looking along `line` from its first
  // element toward its last - a taller building blocks every shorter one
  // that comes after it. Used for all four clue directions by reversing
  // the line (or not) before calling this: top/left read the line as
  // stored, bottom/right read it reversed (see computeAllClues in
  // skyscrapers-puzzles.js and clueStatuses/allCluesSatisfied below).
  function countVisible(line) {
    let count = 0;
    let tallest = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] > tallest) {
        count++;
        tallest = line[i];
      }
    }
    return count;
  }

  // Every filled cell that shares its height with another filled cell in
  // the same row or column - the Latin-square conflict, with no sub-box
  // rule (unlike Sudoku). Returned as a Set of cell indices, the same
  // shape as SudokuCore.findConflicts/KakuroCore.findConflicts.
  function findConflicts(grid, n) {
    const conflicts = new Set();
    for (let r = 0; r < n; r++) {
      const seen = {};
      for (let c = 0; c < n; c++) {
        const i = cellIndex(n, r, c);
        const v = grid[i];
        if (!v) continue;
        if (seen[v] !== undefined) {
          conflicts.add(i);
          conflicts.add(seen[v]);
        } else {
          seen[v] = i;
        }
      }
    }
    for (let c = 0; c < n; c++) {
      const seen = {};
      for (let r = 0; r < n; r++) {
        const i = cellIndex(n, r, c);
        const v = grid[i];
        if (!v) continue;
        if (seen[v] !== undefined) {
          conflicts.add(i);
          conflicts.add(seen[v]);
        } else {
          seen[v] = i;
        }
      }
    }
    return conflicts;
  }

  function judgeClue(clueValue, lineComplete, computeVisibleFn) {
    if (clueValue === null || clueValue === undefined) return null;
    if (!lineComplete) return "unknown";
    return computeVisibleFn() === clueValue ? "ok" : "violated";
  }

  // For every clue position, whether the row/column it looks along
  // currently satisfies it: null (no clue shown there), "unknown" (that
  // line isn't completely filled in yet, so it's too early to tell),
  // "ok", or "violated". Only a fully-filled line is judged - a
  // partially-filled line's eventual visible count can still go either
  // way as its remaining cells are filled in, the same reasoning
  // KakuroCore.findConflicts uses to only flag a run's sum once every
  // cell in it is filled.
  function clueStatuses(grid, n, clues) {
    const status = { top: [], bottom: [], left: [], right: [] };
    for (let c = 0; c < n; c++) {
      const col = colValues(grid, n, c);
      const complete = col.every((v) => v !== 0);
      status.top.push(judgeClue(clues.top[c], complete, () => countVisible(col)));
      status.bottom.push(judgeClue(clues.bottom[c], complete, () => countVisible(col.slice().reverse())));
    }
    for (let r = 0; r < n; r++) {
      const row = rowValues(grid, n, r);
      const complete = row.every((v) => v !== 0);
      status.left.push(judgeClue(clues.left[r], complete, () => countVisible(row)));
      status.right.push(judgeClue(clues.right[r], complete, () => countVisible(row.slice().reverse())));
    }
    return status;
  }

  function isFull(grid) {
    return grid.every((v) => v !== 0);
  }

  // Every displayed clue matches the grid's actual visible count - only
  // meaningful once the grid (or at least every relevant row/column) is
  // completely filled in.
  function allCluesSatisfied(grid, n, clues) {
    for (let c = 0; c < n; c++) {
      const col = colValues(grid, n, c);
      if (clues.top[c] !== null && countVisible(col) !== clues.top[c]) return false;
      if (clues.bottom[c] !== null && countVisible(col.slice().reverse()) !== clues.bottom[c]) return false;
    }
    for (let r = 0; r < n; r++) {
      const row = rowValues(grid, n, r);
      if (clues.left[r] !== null && countVisible(row) !== clues.left[r]) return false;
      if (clues.right[r] !== null && countVisible(row.slice().reverse()) !== clues.right[r]) return false;
    }
    return true;
  }

  function isComplete(grid, n, clues) {
    if (!isFull(grid)) return false;
    if (findConflicts(grid, n).size > 0) return false;
    return allCluesSatisfied(grid, n, clues);
  }

  return {
    cellIndex,
    emptyGrid,
    cloneGrid,
    rowValues,
    colValues,
    countVisible,
    findConflicts,
    clueStatuses,
    isFull,
    allCluesSatisfied,
    isComplete
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SkyscrapersCore;
}
if (typeof window !== "undefined") {
  window.SkyscrapersCore = SkyscrapersCore;
}
