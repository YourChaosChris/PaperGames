// kakuro-core.js
// Dependency-free Kakuro engine: the grid model (black "clue" cells vs.
// white fillable cells), run detection, a real constraint-solving search
// used to verify a freshly generated puzzle has exactly one solution (the
// same idea as SudokuCore's countSolutions and NonogramCore's solver,
// just searching sums instead of a fixed digit set or picture), and the
// move-validation/win-detection logic the UI needs. No DOM/UI here, same
// separation of concerns as every other <game>-core.js in this app - just
// no opponent, since Kakuro (like Sudoku) is solitaire.
//
// A layout is a size x size grid of "black" | "white" strings, with the
// outermost ring always black (the frame every clue sits just inside
// of). A run is a maximal horizontal or vertical line of contiguous
// white cells, 2 or more long, with its sum clue displayed on the black
// cell immediately before it - "clueCell". A black cell that starts both
// a horizontal and a vertical run at once (the classic diagonal-split
// clue cell) simply has both a `right` and a `down` value; either can be
// null when that black cell starts no run in that direction.
//
// A player grid mirrors the layout's shape: 0 for an empty white cell,
// 1-9 for a filled one, null for black cells (never editable).

const KakuroCore = (function () {
  const BLACK = "black";
  const WHITE = "white";

  function createBorderedLayout(size) {
    const grid = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        const border = r === 0 || c === 0 || r === size - 1 || c === size - 1;
        row.push(border ? BLACK : WHITE);
      }
      grid.push(row);
    }
    return grid;
  }

  function cloneLayout(layout) {
    return layout.map((row) => row.slice());
  }

  // Removes every white run shorter than 2 cells by blackening its lone
  // cell, alternating row and column passes until a full pass changes
  // nothing. Cells only ever turn white->black here, never the reverse,
  // so the white-cell count strictly decreases whenever anything
  // changes - this always terminates, and afterward no row or column
  // has an isolated single white cell. Kept as a defensive cleanup for
  // any hand-built or externally-supplied layout; randomizeLayout below
  // avoids ever needing it by checking each black cell as it's placed.
  function repairShortRuns(layout) {
    const size = layout.length;
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 1; r < size - 1; r++) {
        let c = 1;
        while (c < size - 1) {
          if (layout[r][c] === WHITE) {
            const start = c;
            while (c < size - 1 && layout[r][c] === WHITE) c++;
            if (c - start === 1) { layout[r][start] = BLACK; changed = true; }
          } else {
            c++;
          }
        }
      }
      for (let c = 1; c < size - 1; c++) {
        let r = 1;
        while (r < size - 1) {
          if (layout[r][c] === WHITE) {
            const start = r;
            while (r < size - 1 && layout[r][c] === WHITE) r++;
            if (r - start === 1) { layout[start][c] = BLACK; changed = true; }
          } else {
            r++;
          }
        }
      }
    }
  }

  // Would blackening the (currently white) cell (r,c) leave a run of
  // exactly 1 white cell on any of its four sides? Used to build up a
  // layout one black cell at a time without ever creating the short run
  // repairShortRuns would otherwise have to clean up after the fact -
  // avoids the cascading collapse a blanket per-cell random density
  // (blacken, then repair) can trigger, where fixing one short run
  // creates another next to it.
  function wouldCreateShortRun(layout, r, c) {
    const size = layout.length;
    let left = 0;
    for (let cc = c - 1; cc >= 0 && layout[r][cc] === WHITE; cc--) left++;
    if (left === 1) return true;
    let right = 0;
    for (let cc = c + 1; cc < size && layout[r][cc] === WHITE; cc++) right++;
    if (right === 1) return true;
    let up = 0;
    for (let rr = r - 1; rr >= 0 && layout[rr][c] === WHITE; rr--) up++;
    if (up === 1) return true;
    let down = 0;
    for (let rr = r + 1; rr < size && layout[rr][c] === WHITE; rr++) down++;
    if (down === 1) return true;
    return false;
  }

  // Builds a layout by placing black cells one at a time, in random
  // order, skipping any placement that would leave a length-1 run
  // behind - so the result never needs repairShortRuns and never
  // collapses into an overly sparse board the way a blanket random
  // density followed by repair can.
  function randomizeLayout(size, density, rng) {
    const random = rng || Math.random;
    const layout = createBorderedLayout(size);
    const interior = [];
    for (let r = 1; r < size - 1; r++) {
      for (let c = 1; c < size - 1; c++) interior.push([r, c]);
    }
    shuffle(interior, random);
    const targetBlack = Math.round(interior.length * density);
    let placed = 0;
    for (const [r, c] of interior) {
      if (placed >= targetBlack) break;
      layout[r][c] = BLACK;
      if (wouldCreateShortRun(layout, r, c)) {
        layout[r][c] = WHITE;
      } else {
        placed++;
      }
    }
    return layout;
  }

  // Every maximal horizontal/vertical run of contiguous white cells,
  // length 2 or more (a generated layout never has a shorter one - see
  // repairShortRuns - but this also validates any hand-built layout).
  function computeRuns(layout) {
    const size = layout.length;
    const runs = [];
    for (let r = 0; r < size; r++) {
      let c = 0;
      while (c < size) {
        if (layout[r][c] === WHITE) {
          const start = c;
          while (c < size && layout[r][c] === WHITE) c++;
          if (c - start >= 2) {
            const cells = [];
            for (let cc = start; cc < c; cc++) cells.push([r, cc]);
            runs.push({ dir: "h", cells, clueCell: [r, start - 1] });
          }
        } else {
          c++;
        }
      }
    }
    for (let c = 0; c < size; c++) {
      let r = 0;
      while (r < size) {
        if (layout[r][c] === WHITE) {
          const start = r;
          while (r < size && layout[r][c] === WHITE) r++;
          if (r - start >= 2) {
            const cells = [];
            for (let rr = start; rr < r; rr++) cells.push([rr, c]);
            runs.push({ dir: "v", cells, clueCell: [start - 1, c] });
          }
        } else {
          r++;
        }
      }
    }
    return runs;
  }

  // Every white cell indexed to the (at most one) horizontal run and
  // the (at most one) vertical run it belongs to - the two constraints
  // a single cell's digit has to satisfy at once.
  function buildRunIndex(runs) {
    const hOf = {}, vOf = {};
    runs.forEach((run) => {
      run.cells.forEach(([r, c]) => {
        const key = r + "," + c;
        if (run.dir === "h") hOf[key] = run; else vOf[key] = run;
      });
    });
    return { hOf, vOf };
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // Fills every white cell with 1-9 so that no run repeats a digit - no
  // sums involved yet, just a valid Latin-square-like assignment to
  // derive a fresh puzzle's clues from (see kakuro-puzzles.js).
  // Randomized backtracking with a most-constrained-cell heuristic, the
  // same technique as SudokuCore.generateSolvedGrid.
  function fillRandomSolution(layout, rng) {
    const runs = computeRuns(layout);
    const { hOf, vOf } = buildRunIndex(runs);
    const size = layout.length;
    const solution = layout.map((row) => row.map((cell) => (cell === WHITE ? 0 : null)));
    const whiteCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (layout[r][c] === WHITE) whiteCells.push([r, c]);
      }
    }

    function candidatesFor(r, c) {
      const used = new Set();
      const hr = hOf[r + "," + c], vr = vOf[r + "," + c];
      if (hr) hr.cells.forEach(([rr, cc]) => { if (solution[rr][cc]) used.add(solution[rr][cc]); });
      if (vr) vr.cells.forEach(([rr, cc]) => { if (solution[rr][cc]) used.add(solution[rr][cc]); });
      const out = [];
      for (let d = 1; d <= 9; d++) if (!used.has(d)) out.push(d);
      return out;
    }

    function backtrack() {
      let best = null, bestCands = null;
      for (const [r, c] of whiteCells) {
        if (solution[r][c]) continue;
        const cands = candidatesFor(r, c);
        if (cands.length === 0) return false;
        if (!bestCands || cands.length < bestCands.length) {
          best = [r, c]; bestCands = cands;
          if (cands.length === 1) break;
        }
      }
      if (!best) return true;
      const [r, c] = best;
      for (const d of shuffle(bestCands.slice(), rng)) {
        solution[r][c] = d;
        if (backtrack()) return true;
        solution[r][c] = 0;
      }
      return false;
    }

    return backtrack() ? solution : null;
  }

  // Derives each run's clue (its cells' sum) from a filled solution grid,
  // stored on the black cell immediately before the run - `right` for a
  // horizontal run, `down` for a vertical one.
  function buildClueGrid(layout, runs, solution) {
    const clues = layout.map((row) => row.map((cell) => (cell === BLACK ? { right: null, down: null } : null)));
    runs.forEach((run) => {
      const sum = run.cells.reduce((s, [r, c]) => s + solution[r][c], 0);
      const [cr, cc] = run.clueCell;
      if (run.dir === "h") clues[cr][cc].right = sum;
      else clues[cr][cc].down = sum;
    });
    return clues;
  }

  function createEmptyPlayerGrid(layout) {
    return layout.map((row) => row.map((cell) => (cell === WHITE ? 0 : null)));
  }

  function clonePlayerGrid(grid) {
    return grid.map((row) => row.slice());
  }

  // Solves a puzzle from its clues alone, with no access to whatever
  // solution a generator derived them from - the actual Kakuro-solving
  // search, used both to confirm a freshly generated puzzle has exactly
  // one solution (countSolutions) and as the plain solve() every other
  // -core.js here also exposes.
  //
  // Search order always picks the white cell with the fewest remaining
  // candidates (most-constrained-variable, as in SudokuCore), and a
  // candidate digit is only offered if the remaining cells in both its
  // row-run and column-run can still reach their target sums using
  // distinct digits not already used in that run - the same bounding
  // idea as a Sudoku candidate mask, just computed from a sum instead of
  // a fixed digit set.
  function solveFromClues(layout, clueGrid, limit) {
    limit = limit || 1;
    const runs = computeRuns(layout);
    runs.forEach((run) => {
      const [cr, cc] = run.clueCell;
      const clue = clueGrid[cr][cc];
      run.target = run.dir === "h" ? clue.right : clue.down;
    });
    const { hOf, vOf } = buildRunIndex(runs);
    const size = layout.length;
    const grid = layout.map((row) => row.map((cell) => (cell === WHITE ? 0 : null)));
    const whiteCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (layout[r][c] === WHITE) whiteCells.push([r, c]);
      }
    }

    const solutions = [];

    function runState(run) {
      let sum = 0, filled = 0;
      const used = new Set();
      run.cells.forEach(([r, c]) => {
        const v = grid[r][c];
        if (v) { sum += v; filled++; used.add(v); }
      });
      return { sum, filled, used };
    }

    // Can `run` still reach its target sum if `extra` (a candidate digit
    // for the cell being considered) is added to what's filled so far?
    function feasible(run, extra) {
      const state = runState(run);
      let sum = state.sum, filled = state.filled;
      const used = state.used;
      if (extra !== undefined) { sum += extra; filled++; used.add(extra); }
      const remaining = run.cells.length - filled;
      if (remaining === 0) return sum === run.target;
      const need = run.target - sum;
      const available = [];
      for (let d = 1; d <= 9; d++) if (!used.has(d)) available.push(d);
      if (available.length < remaining) return false;
      available.sort((a, b) => a - b);
      const minSum = available.slice(0, remaining).reduce((s, d) => s + d, 0);
      const maxSum = available.slice(available.length - remaining).reduce((s, d) => s + d, 0);
      return need >= minSum && need <= maxSum;
    }

    function candidatesFor(r, c) {
      const hr = hOf[r + "," + c], vr = vOf[r + "," + c];
      const usedH = hr ? runState(hr).used : new Set();
      const usedV = vr ? runState(vr).used : new Set();
      const out = [];
      for (let d = 1; d <= 9; d++) {
        if (usedH.has(d) || usedV.has(d)) continue;
        if (hr && !feasible(hr, d)) continue;
        if (vr && !feasible(vr, d)) continue;
        out.push(d);
      }
      return out;
    }

    function search() {
      if (solutions.length >= limit) return;
      let best = null, bestCands = null;
      for (const [r, c] of whiteCells) {
        if (grid[r][c]) continue;
        const cands = candidatesFor(r, c);
        if (cands.length === 0) return;
        if (!bestCands || cands.length < bestCands.length) {
          best = [r, c]; bestCands = cands;
          if (cands.length === 1) break;
        }
      }
      if (!best) {
        solutions.push(grid.map((row) => row.slice()));
        return;
      }
      const [r, c] = best;
      for (const d of bestCands) {
        if (solutions.length >= limit) return;
        grid[r][c] = d;
        search();
        grid[r][c] = 0;
      }
    }

    search();
    return solutions;
  }

  function countSolutions(layout, clueGrid, limit) {
    return solveFromClues(layout, clueGrid, limit || 2).length;
  }

  function solve(layout, clueGrid) {
    const solutions = solveFromClues(layout, clueGrid, 1);
    return solutions.length ? solutions[0] : null;
  }

  // Every currently-filled white cell that either repeats a digit
  // already used elsewhere in its row-run or column-run, or belongs to
  // a fully-filled run whose sum doesn't match its clue - returned as a
  // Set of "r,c" keys, the same shape as SudokuCore.findConflicts.
  function findConflicts(playerGrid, layout, clueGrid) {
    const runs = computeRuns(layout);
    const conflicts = new Set();
    runs.forEach((run) => {
      const [cr, cc] = run.clueCell;
      const clue = clueGrid[cr][cc];
      const target = run.dir === "h" ? clue.right : clue.down;
      const seen = {};
      let allFilled = true;
      let sum = 0;
      run.cells.forEach(([r, c]) => {
        const v = playerGrid[r][c];
        if (!v) { allFilled = false; return; }
        sum += v;
        const key = r + "," + c;
        if (seen[v] !== undefined) {
          conflicts.add(key);
          conflicts.add(seen[v]);
        } else {
          seen[v] = key;
        }
      });
      if (allFilled && sum !== target) {
        run.cells.forEach(([r, c]) => conflicts.add(r + "," + c));
      }
    });
    return conflicts;
  }

  function isComplete(playerGrid, layout, clueGrid) {
    const size = layout.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (layout[r][c] === WHITE && !playerGrid[r][c]) return false;
      }
    }
    return findConflicts(playerGrid, layout, clueGrid).size === 0;
  }

  return {
    BLACK,
    WHITE,
    createBorderedLayout,
    cloneLayout,
    repairShortRuns,
    randomizeLayout,
    computeRuns,
    buildRunIndex,
    shuffle,
    fillRandomSolution,
    buildClueGrid,
    createEmptyPlayerGrid,
    clonePlayerGrid,
    solveFromClues,
    countSolutions,
    solve,
    findConflicts,
    isComplete
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KakuroCore;
}
if (typeof window !== "undefined") {
  window.KakuroCore = KakuroCore;
}
