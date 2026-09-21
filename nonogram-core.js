// nonogram-core.js
// Dependency-free Nonogram (Picross) engine: computing row/column clues
// from a solved picture, checking a player's grid against it, and a
// real constraint-propagation-plus-backtracking solver used (offline,
// while authoring puzzles) to confirm each curated picture has one and
// only one valid solution - a picture whose clues admit more than one
// filling would let a player reach a different, equally valid grid and
// have the game wrongly refuse to call it solved.
//
// A solved picture is a 2D array of booleans (true = filled). The
// player's own grid uses the same shape but each cell is one of
// "empty" | "filled" | "marked" (marked = the player's own "definitely
// not filled" note, purely a memory aid with no effect on win checking
// beyond counting as not-filled).

const NonogramCore = (function () {
  function computeClues(grid) {
    const rows = grid.length;
    const cols = grid[0].length;

    function lineClue(cells) {
      const clue = [];
      let run = 0;
      cells.forEach((filled) => {
        if (filled) {
          run++;
        } else if (run > 0) {
          clue.push(run);
          run = 0;
        }
      });
      if (run > 0) clue.push(run);
      return clue.length ? clue : [0];
    }

    const rowClues = grid.map((row) => lineClue(row));
    const colClues = [];
    for (let c = 0; c < cols; c++) {
      const column = [];
      for (let r = 0; r < rows; r++) column.push(grid[r][c]);
      colClues.push(lineClue(column));
    }
    return { rows: rowClues, cols: colClues };
  }

  function createEmptyPlayerGrid(rows, cols) {
    const grid = [];
    for (let r = 0; r < rows; r++) grid.push(new Array(cols).fill("empty"));
    return grid;
  }

  // A puzzle is solved when the player has filled exactly the cells the
  // solution has filled - a "marked" (crossed-out) cell counts the same
  // as a plain empty one for this check, since marking is just a memory
  // aid with no effect on correctness.
  function checkSolved(playerGrid, solutionGrid) {
    for (let r = 0; r < solutionGrid.length; r++) {
      for (let c = 0; c < solutionGrid[0].length; c++) {
        const shouldBeFilled = solutionGrid[r][c];
        const isFilled = playerGrid[r][c] === "filled";
        if (shouldBeFilled !== isFilled) return false;
      }
    }
    return true;
  }

  // Every way `clue` can fit into a line of `length` cells, as boolean
  // arrays - used by the solver below (and only there; the runtime UI
  // never needs this, since curated puzzles already have a known
  // solution).
  function lineCandidates(clue, length) {
    if (clue.length === 1 && clue[0] === 0) {
      return [new Array(length).fill(false)];
    }
    const k = clue.length;
    const results = [];

    function rec(pos, blockIdx, cells) {
      if (blockIdx === k) {
        const line = cells.slice();
        while (line.length < length) line.push(false);
        results.push(line.slice(0, length));
        return;
      }
      const blockLen = clue[blockIdx];
      let minRest = 0;
      for (let i = blockIdx + 1; i < k; i++) minRest += clue[i] + 1;
      for (let s = pos; s + blockLen + minRest <= length; s++) {
        const cells2 = cells.slice();
        while (cells2.length < s) cells2.push(false);
        for (let i = 0; i < blockLen; i++) cells2.push(true);
        cells2.push(false);
        rec(cells2.length, blockIdx + 1, cells2);
      }
    }

    rec(0, 0, []);
    return results;
  }

  // One round of constraint propagation: for every row and column, keep
  // only the candidate fillings consistent with what's already known,
  // then any cell that's the same in every remaining candidate for its
  // row (or column) becomes known. Repeats until nothing changes.
  // `grid` holds true/false/null (unknown) per cell and is updated in
  // place; returns false if some line has no consistent candidate left
  // (a contradiction - can only happen while backtracking below).
  function propagate(grid, rowClues, colClues) {
    const rows = grid.length, cols = grid[0].length;
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < rows; r++) {
        const known = grid[r];
        const candidates = lineCandidates(rowClues[r], cols)
          .filter((line) => line.every((v, c) => known[c] === null || known[c] === v));
        if (!candidates.length) return false;
        for (let c = 0; c < cols; c++) {
          if (known[c] !== null) continue;
          const allSame = candidates.every((line) => line[c] === candidates[0][c]);
          if (allSame) { known[c] = candidates[0][c]; changed = true; }
        }
      }
      for (let c = 0; c < cols; c++) {
        const known = grid.map((row) => row[c]);
        const candidates = lineCandidates(colClues[c], rows)
          .filter((line) => line.every((v, r) => known[r] === null || known[r] === v));
        if (!candidates.length) return false;
        for (let r = 0; r < rows; r++) {
          if (known[r] !== null) continue;
          const allSame = candidates.every((line) => line[r] === candidates[0][r]);
          if (allSame) { grid[r][c] = candidates[0][r]; changed = true; }
        }
      }
    }
    return true;
  }

  // Counts solutions consistent with the given clues, up to `limit`
  // (default 2 - just enough to tell "unique" from "not unique"). Used
  // only to validate curated puzzles, never at runtime.
  function countSolutions(rowClues, colClues, limit) {
    limit = limit || 2;
    const rows = rowClues.length, cols = colClues.length;
    const grid = [];
    for (let r = 0; r < rows; r++) grid.push(new Array(cols).fill(null));
    let count = 0;

    function search(g) {
      if (count >= limit) return;
      const working = g.map((row) => row.slice());
      if (!propagate(working, rowClues, colClues)) return;

      let target = null;
      outer:
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (working[r][c] === null) { target = [r, c]; break outer; }
        }
      }
      if (!target) { count++; return; }

      const [tr, tc] = target;
      for (const val of [true, false]) {
        if (count >= limit) return;
        const branch = working.map((row) => row.slice());
        branch[tr][tc] = val;
        search(branch);
      }
    }

    search(grid);
    return count;
  }

  return {
    computeClues,
    createEmptyPlayerGrid,
    checkSolved,
    lineCandidates,
    propagate,
    countSolutions
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = NonogramCore;
}
if (typeof window !== "undefined") {
  window.NonogramCore = NonogramCore;
}
