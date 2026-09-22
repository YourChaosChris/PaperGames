// skyscrapers-puzzles.js
// Skyscrapers puzzle generator and clue-only solver, adapted from
// SudokuCore's generate-then-reduce approach: build a fully solved
// random Latin square (no sub-box rule, just rows/columns, so the
// backtracking here is simpler than Sudoku's), compute every one of the
// 4*n possible edge-visibility clues from it, then reveal only a subset
// of those clues - starting from all of them and repeatedly trying to
// hide one at random, re-verifying uniqueness with the solver below and
// backing out the hide if it breaks uniqueness - continuing until the
// difficulty's target clue count is reached or no more can be hidden.
// Mirrors SudokuCore.generatePuzzle's reduction loop exactly, just
// removing clues instead of givens (a Skyscrapers puzzle has no
// pre-filled cells at all, only edge clues).

const SkyscrapersPuzzles = (function () {
  const SIZE_BY_DIFFICULTY = { easy: 4, medium: 5, hard: 6 };
  // Target number of the 4*n possible clues left revealed once the
  // reduction loop below is done - approximate, since the loop stops
  // early if it runs out of clues that can be hidden without breaking
  // uniqueness (the same caveat SudokuCore's DIFFICULTY_GIVENS carries).
  const TARGET_CLUES = { easy: 8, medium: 10, hard: 12 };

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // Fills an n*n grid completely via randomized backtracking so every
  // row and column holds each height 1..n exactly once (a Latin square,
  // no box constraint) - always possible from an empty grid, the same
  // technique as SudokuCore.generateSolvedGrid minus the box mask.
  function generateSolvedGrid(n, rng) {
    const grid = new Array(n * n).fill(0);
    const rows = new Array(n).fill(0);
    const cols = new Array(n).fill(0);

    function place(pos) {
      if (pos === n * n) return true;
      const r = Math.floor(pos / n), c = pos % n;
      const used = rows[r] | cols[c];
      const candidates = [];
      for (let d = 1; d <= n; d++) {
        if (!(used & (1 << d))) candidates.push(d);
      }
      shuffle(candidates, rng);
      for (const d of candidates) {
        const bit = 1 << d;
        grid[pos] = d;
        rows[r] |= bit; cols[c] |= bit;
        if (place(pos + 1)) return true;
        grid[pos] = 0;
        rows[r] &= ~bit; cols[c] &= ~bit;
      }
      return false;
    }

    place(0);
    return grid;
  }

  // Derives all 4*n edge clues from a completed solution grid - top/left
  // read each column/row as stored, bottom/right read it reversed, per
  // the direction each side actually looks from.
  function computeAllClues(solution, n) {
    const top = [], bottom = [], left = [], right = [];
    for (let c = 0; c < n; c++) {
      const col = [];
      for (let r = 0; r < n; r++) col.push(solution[r * n + c]);
      top.push(SkyscrapersCore.countVisible(col));
      bottom.push(SkyscrapersCore.countVisible(col.slice().reverse()));
    }
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) row.push(solution[r * n + c]);
      left.push(SkyscrapersCore.countVisible(row));
      right.push(SkyscrapersCore.countVisible(row.slice().reverse()));
    }
    return { top, bottom, left, right };
  }

  // Deduces every cell whose value is forced purely by an extreme clue,
  // and seeds a partial grid with them - a clue of n pins its whole line
  // into strict ascending order away from the viewer (the only
  // permutation of 1..n that is strictly increasing is the sorted one
  // itself), and a clue of 1 pins the tallest building (n) right at that
  // edge. These are always true of ANY solution consistent with that
  // clue value, so seeding them before the backtracking search below is
  // sound regardless of which particular solution the puzzle came from -
  // the same "constrain everything derivable first, guess only what's
  // left" idea as SudokuCore's candidate masks, just derived from clues
  // instead of givens. `grid[i]` is left 0 wherever nothing is forced.
  function forcedGridFromClues(n, clues) {
    const grid = new Array(n * n).fill(0);
    for (let r = 0; r < n; r++) {
      if (clues.left[r] === n) {
        for (let c = 0; c < n; c++) grid[r * n + c] = c + 1;
      } else if (clues.right[r] === n) {
        for (let c = 0; c < n; c++) grid[r * n + c] = n - c;
      }
      if (clues.left[r] === 1 && !grid[r * n + 0]) grid[r * n + 0] = n;
      if (clues.right[r] === 1 && !grid[r * n + (n - 1)]) grid[r * n + (n - 1)] = n;
    }
    for (let c = 0; c < n; c++) {
      if (clues.top[c] === n) {
        for (let r = 0; r < n; r++) { if (!grid[r * n + c]) grid[r * n + c] = r + 1; }
      } else if (clues.bottom[c] === n) {
        for (let r = 0; r < n; r++) { if (!grid[r * n + c]) grid[r * n + c] = n - r; }
      }
      if (clues.top[c] === 1 && !grid[c]) grid[c] = n;
      if (clues.bottom[c] === 1 && !grid[(n - 1) * n + c]) grid[(n - 1) * n + c] = n;
    }
    return grid;
  }

  // Shared search core for both countSolutionsFromClues and solve: seeds
  // the grid with forcedGridFromClues, then fills the remaining cells
  // using the minimum-remaining-values heuristic (always branch on
  // whichever empty cell currently has the fewest legal heights left),
  // the same heuristic SudokuCore.countSolutions/solve use to keep a
  // search over a mostly-empty grid fast. A row's clues are checked the
  // instant every one of its cells is filled, and a column's clues the
  // instant every one of its cells is filled - tracked by a per-row/
  // -column fill count rather than assuming any particular fill order,
  // since MRV branches wherever is most constrained next rather than
  // row-major - so a bad branch is abandoned as soon as it's provably
  // bad instead of only once the whole grid is full, the same
  // early-pruning idea as KakuroCore.solveFromClues checking a run's
  // feasibility as soon as enough of it is known. Proving a puzzle
  // *unique* (as the generator's reduction loop needs to) requires
  // fully exhausting the search once one solution is found, which is
  // exactly the case this heuristic matters most for. `onSolution(grid)`
  // is called with the finished grid each time the search reaches one;
  // returning true from it stops the search early. `maxNodes`, if given,
  // aborts the search (setting the returned `budgetExceeded` flag) once
  // that many cells have been branched on - a safety valve for the
  // difficulty-reduction loop below, since proving a very sparsely-clued
  // large grid unique can otherwise take an unbounded number of nodes.
  function search(n, clues, onSolution, maxNodes) {
    const CELLS = n * n;
    const grid = forcedGridFromClues(n, clues);
    const rows = new Array(n).fill(0);
    const cols = new Array(n).fill(0);
    const rowFilled = new Array(n).fill(0);
    const colFilled = new Array(n).fill(0);
    for (let i = 0; i < CELLS; i++) {
      const v = grid[i];
      if (!v) continue;
      const r = Math.floor(i / n), c = i % n;
      const bit = 1 << v;
      if ((rows[r] & bit) || (cols[c] & bit)) {
        // Never expected for a clue set with at least one real solution
        // (see forcedGridFromClues), but stay correct rather than seed
        // a bad forced value if it somehow happened.
        grid[i] = 0;
        continue;
      }
      rows[r] |= bit; cols[c] |= bit;
      rowFilled[r]++; colFilled[c]++;
    }

    function checkRow(r) {
      const line = [];
      for (let c = 0; c < n; c++) line.push(grid[r * n + c]);
      if (clues.left[r] !== null && SkyscrapersCore.countVisible(line) !== clues.left[r]) return false;
      if (clues.right[r] !== null && SkyscrapersCore.countVisible(line.slice().reverse()) !== clues.right[r]) return false;
      return true;
    }
    function checkCol(c) {
      const line = [];
      for (let r = 0; r < n; r++) line.push(grid[r * n + c]);
      if (clues.top[c] !== null && SkyscrapersCore.countVisible(line) !== clues.top[c]) return false;
      if (clues.bottom[c] !== null && SkyscrapersCore.countVisible(line.slice().reverse()) !== clues.bottom[c]) return false;
      return true;
    }

    function candidateDigits(r, c) {
      const used = rows[r] | cols[c];
      const out = [];
      for (let d = 1; d <= n; d++) {
        if (!(used & (1 << d))) out.push(d);
      }
      return out;
    }

    let stop = false;
    let budgetExceeded = false;
    let nodes = 0;

    function place() {
      if (stop) return;
      if (maxNodes && ++nodes > maxNodes) {
        budgetExceeded = true;
        stop = true;
        return;
      }
      let bestPos = -1, bestR = -1, bestC = -1, bestCands = null;
      for (let i = 0; i < CELLS; i++) {
        if (grid[i]) continue;
        const r = Math.floor(i / n), c = i % n;
        const cands = candidateDigits(r, c);
        if (cands.length === 0) return; // dead end
        if (!bestCands || cands.length < bestCands.length) {
          bestPos = i; bestR = r; bestC = c; bestCands = cands;
          if (cands.length === 1) break; // can't do better than a forced cell
        }
      }
      if (bestPos === -1) { // no empty cells left - a full valid solution
        stop = !!onSolution(grid);
        return;
      }
      for (const d of bestCands) {
        if (stop) return;
        const bit = 1 << d;
        grid[bestPos] = d;
        rows[bestR] |= bit; cols[bestC] |= bit;
        rowFilled[bestR]++; colFilled[bestC]++;
        let ok = true;
        if (rowFilled[bestR] === n) ok = checkRow(bestR);
        if (ok && colFilled[bestC] === n) ok = checkCol(bestC);
        if (ok) place();
        grid[bestPos] = 0;
        rows[bestR] &= ~bit; cols[bestC] &= ~bit;
        rowFilled[bestR]--; colFilled[bestC]--;
      }
    }

    place();
    return { budgetExceeded };
  }

  // Counts solutions of a from-scratch board (edge clues only, no
  // pre-filled cells) up to `limit` - just enough to distinguish
  // "unique" from "not unique" without solving further than needed, the
  // same idea as SudokuCore.countSolutions. This is the uniqueness check
  // the difficulty-reduction loop in generatePuzzle relies on. With
  // `maxNodes` given and exceeded before the search resolves, returns -1
  // (inconclusive) rather than blocking indefinitely - the reduction
  // loop treats that exactly like "not unique" (safe: it only ever keeps
  // a clue removed once uniqueness is positively confirmed).
  function countSolutionsFromClues(n, clues, limit, maxNodes) {
    limit = limit || 2;
    let count = 0;
    const result = search(n, clues, () => {
      count++;
      return count >= limit;
    }, maxNodes);
    return result.budgetExceeded ? -1 : count;
  }

  // Solves a puzzle from its clues alone (no access to whatever solution
  // a generator derived them from) - the plain solve() every other
  // -core.js/-puzzles.js pairing here also exposes.
  function solve(n, clues) {
    let solution = null;
    search(n, clues, (grid) => {
      solution = grid.slice();
      return true;
    });
    return solution;
  }

  // Bounds how long a single uniqueness check inside generatePuzzle is
  // allowed to search before giving up on it (see countSolutionsFromClues's
  // `maxNodes`) - large enough to comfortably resolve any check the
  // reduction loop actually needs in practice, small enough to keep
  // "New puzzle" responsive on slow E-Ink hardware even in the rare case
  // a particular clue removal would otherwise take an excessively long
  // search to (dis)prove unique.
  const NODE_BUDGET = 60000;

  function generatePuzzle(difficulty, rng) {
    const random = rng || Math.random;
    const n = SIZE_BY_DIFFICULTY[difficulty] || SIZE_BY_DIFFICULTY.medium;

    // Unlike Sudoku (where a full grid of givens trivially has a unique
    // solution - itself), a Skyscrapers grid's full 4*n-clue set is NOT
    // guaranteed to pin down just one Latin square: two different grids
    // can happen to produce the exact same edge-visibility profile, and
    // empirically that's common enough (especially at n=6) that it needs
    // a real retry loop rather than a single attempt - verify uniqueness
    // and try a fresh solved grid until one qualifies. A full clue set is
    // heavily constrained, so this resolves quickly in practice; -1
    // (budget exceeded) is treated the same as "not unique yet".
    let solution, allClues;
    let attempts = 0;
    do {
      solution = generateSolvedGrid(n, random);
      allClues = computeAllClues(solution, n);
      attempts++;
    } while (countSolutionsFromClues(n, allClues, 2, NODE_BUDGET) !== 1 && attempts < 300);

    const clues = {
      top: allClues.top.slice(),
      bottom: allClues.bottom.slice(),
      left: allClues.left.slice(),
      right: allClues.right.slice()
    };

    const positions = [];
    ["top", "bottom", "left", "right"].forEach((side) => {
      for (let i = 0; i < n; i++) positions.push([side, i]);
    });
    shuffle(positions, random);

    // Try removing one clue at a time (in random order), keeping the
    // removal only if the puzzle is still confirmed uniquely solvable -
    // the exact SudokuCore.generatePuzzle reduction loop pattern, just
    // over clue positions instead of grid cells. A removal whose
    // uniqueness check hits the node budget is treated as unsafe (kept
    // revealed) rather than risking a puzzle with more than one solution.
    const targetClues = TARGET_CLUES[difficulty] || TARGET_CLUES.medium;
    let revealedCount = positions.length;
    for (const [side, i] of positions) {
      if (revealedCount <= targetClues) break;
      const saved = clues[side][i];
      clues[side][i] = null;
      if (countSolutionsFromClues(n, clues, 2, NODE_BUDGET) === 1) {
        revealedCount--;
      } else {
        clues[side][i] = saved;
      }
    }

    return { n, solution, clues, difficulty, revealedCount };
  }

  return {
    SIZE_BY_DIFFICULTY,
    TARGET_CLUES,
    generateSolvedGrid,
    computeAllClues,
    forcedGridFromClues,
    countSolutionsFromClues,
    solve,
    generatePuzzle
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SkyscrapersPuzzles;
}
if (typeof window !== "undefined") {
  window.SkyscrapersPuzzles = SkyscrapersPuzzles;
}
