// calcudoku-app.js
// Wires CalcudokuCore to calcudoku.html through the shared RegionPuzzle
// page logic (region-puzzle.js): a grid size (4x4 to 7x7) and a
// difficulty (average cage size) are picked before "New puzzle". Cages
// are outlined with thick lines, their target and operation sit small in
// the top-left cell; input and conflict marking work like Sudoku's.

(function () {
  function readOptions() {
    const sizeEl = document.getElementById("calcudoku-size-inline");
    const levelEl = document.getElementById("calcudoku-level-inline");
    return {
      size: sizeEl ? parseInt(sizeEl.value, 10) : 5,
      difficulty: levelEl ? levelEl.value : "medium"
    };
  }

  function applyOptions(options) {
    const sizeEl = document.getElementById("calcudoku-size-inline");
    const levelEl = document.getElementById("calcudoku-level-inline");
    if (sizeEl && options.size) sizeEl.value = String(options.size);
    if (levelEl && options.difficulty) levelEl.value = options.difficulty;
  }

  function toRegionPuzzle(p) {
    return {
      rows: p.size,
      cols: p.size,
      maxDigit: p.size,
      cages: p.cages,
      regions: p.cages.map((cage) => cage.cells),
      labels: p.cages.map(CalcudokuCore.cageLabel),
      givens: new Array(p.size * p.size).fill(0),
      style: "solid",
      boxes: false
    };
  }

  function init() {
    RegionPuzzle.init({
      prefix: "calcudoku",
      saveKey: "einkchess_save_calcudoku",
      statsKey: "calcudoku",
      startButtonId: "start-calcudoku-game",
      statusId: "offline-calcudoku-status",
      readOptions,
      applyOptions,
      daily: { buttonId: "daily-calcudoku-button", options: { size: 5, difficulty: "medium" } },
      // A puzzle that the hint could not finish without trying things
      // out is passed over (rare; see hint-engine.js).
      generate(options, done, rng) {
        done(toRegionPuzzle(HintEngine.pickSolvable(
          () => CalcudokuCore.generatePuzzle(options.size, options.difficulty, rng),
          (p) => HintEngine.solvable(HintEngine.calcudokuModel(p.size, p.cages), new Array(p.size * p.size).fill(0)))));
      },
      hint: { flavor: "calcudoku", model: (p) => HintEngine.calcudokuModel(p.rows, p.cages) },
      findConflicts: (p, grid) => CalcudokuCore.findConflicts(p.rows, p.cages, grid),
      isComplete: (p, grid) => CalcudokuCore.isComplete(p.rows, p.cages, grid),
      regionAria: (p, region) => "cage " + p.labels[region]
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
