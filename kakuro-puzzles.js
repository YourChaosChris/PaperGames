// kakuro-puzzles.js
// Kakuro puzzle generator with three difficulty tiers: build a random
// layout of black/white cells, fill its white cells with any valid
// (no-repeat-per-run) digit assignment, then derive every run's clue
// straight from that filled grid. Hand-authoring enough valid Kakuro
// layouts (the way Nonogram curates a picture bank) isn't practical
// here, so every puzzle is generated fresh instead.
//
// Every white cell starts blank; unlike Sudoku's partially-filled grid,
// a Kakuro puzzle's only given information is the sum clues themselves.
// Difficulty is expressed as grid size (bigger board, longer runs, more
// interacting clues) plus black-cell density (how sparse the runs are).
//
// Unlike Sudoku/Nonogram, the generator does not verify the resulting
// puzzle has a *unique* solution: KakuroCore.isComplete() checks the
// player's grid against the Kakuro rules directly (no repeat per run,
// every run's sum matches its clue), not against this one stored
// solution grid, so any valid fill - even a different one than the
// generator happened to land on - is correctly recognized as solved.
// A full uniqueness search (KakuroCore.solveFromClues/countSolutions,
// also used to confirm solvability offline in testing) is too slow to
// run on every "New game" tap on the e-ink hardware this app targets.

const KakuroPuzzles = (function () {
  // `size` includes the black border ring, so the fillable interior is
  // (size - 2) x (size - 2). `density` is the chance an interior cell
  // starts black (KakuroCore.randomizeLayout skips any placement that
  // would leave a length-1 run behind) - both together set each
  // difficulty's average run length.
  const DIFFICULTY = {
    easy: { size: 7, density: 0.22 },
    medium: { size: 9, density: 0.26 },
    hard: { size: 11, density: 0.3 }
  };

  const MAX_ATTEMPTS = 30;

  function generatePuzzle(difficulty, rng) {
    const random = rng || Math.random;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const layout = KakuroCore.randomizeLayout(cfg.size, cfg.density, random);
      const runs = KakuroCore.computeRuns(layout);
      if (!runs.length) continue;

      // Vanishingly rare at these densities, but a layout's run shape
      // can still occasionally have no valid digit assignment at all
      // (e.g. two same-length runs crossing in a way that forces a
      // repeat) - just try another random layout when that happens.
      const solution = KakuroCore.fillRandomSolution(layout, random);
      if (!solution) continue;

      const clues = KakuroCore.buildClueGrid(layout, runs, solution);
      return { layout, solution, clues, size: cfg.size, difficulty };
    }

    // Should never be reached at these densities (see the generator
    // test in the project's validation notes), but never leave the
    // player with nothing: a bordered-only layout with no interior
    // black cells always has a valid fill.
    const layout = KakuroCore.createBorderedLayout(cfg.size);
    const runs = KakuroCore.computeRuns(layout);
    const solution = KakuroCore.fillRandomSolution(layout, random);
    const clues = KakuroCore.buildClueGrid(layout, runs, solution);
    return { layout, solution, clues, size: cfg.size, difficulty };
  }

  return { DIFFICULTY, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = KakuroPuzzles;
}
if (typeof window !== "undefined") {
  window.KakuroPuzzles = KakuroPuzzles;
}
