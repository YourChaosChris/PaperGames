// killersudoku-app.js
// Wires KillerSudokuCore to killersudoku.html through the shared
// RegionPuzzle page logic (region-puzzle.js): pick a difficulty (average
// cage size and number of givens) and press "New puzzle". The 3x3 boxes
// keep Sudoku's thick lines; each cage is traced by a dashed line with
// its sum in the top-left cell - dashed versus solid differ in shape,
// not grey, so both read on E-Ink. Generation runs in small steps
// (generatePuzzleAsync) so the page stays responsive on slow readers.

(function () {
  function readOptions() {
    const levelEl = document.getElementById("killersudoku-level-inline");
    return { difficulty: levelEl ? levelEl.value : "medium" };
  }

  function applyOptions(options) {
    const levelEl = document.getElementById("killersudoku-level-inline");
    if (levelEl && options.difficulty) levelEl.value = options.difficulty;
  }

  function toRegionPuzzle(p) {
    return {
      rows: 9,
      cols: 9,
      maxDigit: 9,
      cages: p.cages,
      regions: p.cages.map((cage) => cage.cells),
      labels: p.cages.map((cage) => String(cage.sum)),
      givens: p.givens,
      style: "dashed",
      boxes: true
    };
  }

  function init() {
    RegionPuzzle.init({
      prefix: "killersudoku",
      saveKey: "einkchess_save_killersudoku",
      statsKey: "killersudoku",
      startButtonId: "start-killersudoku-game",
      statusId: "offline-killersudoku-status",
      readOptions,
      applyOptions,
      // A puzzle that the hint could not finish without trying things
      // out is passed over (about one in twenty; see hint-engine.js), at
      // most 20 times.
      generate(options, done, rng) {
        let tries = 0;
        (function attempt() {
          KillerSudokuCore.generatePuzzleAsync(options.difficulty, rng || null, (p) => {
            tries++;
            if (tries >= 20 || HintEngine.solvable(HintEngine.killerModel(p.cages), p.givens)) done(toRegionPuzzle(p));
            else attempt();
          });
        })();
      },
      hint: { flavor: "killer", model: (p) => HintEngine.killerModel(p.cages) },
      daily: { buttonId: "daily-killersudoku-button", options: { difficulty: "medium" } },
      findConflicts: (p, grid) => KillerSudokuCore.findConflicts(p.cages, grid),
      isComplete: (p, grid) => KillerSudokuCore.isComplete(p.cages, grid),
      regionAria: (p, region) => "cage " + p.labels[region]
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
