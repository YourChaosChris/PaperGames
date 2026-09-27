// numberblocks-app.js
// Wires NumberBlocksCore to numberblocks.html through the shared
// RegionPuzzle page logic (region-puzzle.js): pick a difficulty (grid
// size and number of givens) and press "New puzzle". Blocks are outlined
// with thick lines; the number pad offers 1 up to the largest block
// size. A digit that repeats in its block, is too big for it, or touches
// the same digit (also diagonally) is marked on every cell involved.

(function () {
  function readOptions() {
    const levelEl = document.getElementById("numberblocks-level-inline");
    return { difficulty: levelEl ? levelEl.value : "medium" };
  }

  function applyOptions(options) {
    const levelEl = document.getElementById("numberblocks-level-inline");
    if (levelEl && options.difficulty) levelEl.value = options.difficulty;
  }

  function toRegionPuzzle(p) {
    return {
      rows: p.rows,
      cols: p.cols,
      maxDigit: NumberBlocksCore.maxBlockSize(p.blocks),
      regions: p.blocks,
      labels: p.blocks.map(() => ""),
      givens: p.puzzle,
      style: "solid",
      boxes: false
    };
  }

  function init() {
    RegionPuzzle.init({
      prefix: "numberblocks",
      saveKey: "einkchess_save_numberblocks",
      statsKey: "numberblocks",
      startButtonId: "start-numberblocks-game",
      statusId: "offline-numberblocks-status",
      readOptions,
      applyOptions,
      generate(options, done) {
        done(toRegionPuzzle(NumberBlocksCore.generatePuzzle(options.difficulty)));
      },
      findConflicts: (p, grid) => NumberBlocksCore.findConflicts(p.rows, p.cols, p.regions, grid),
      isComplete: (p, grid) => NumberBlocksCore.isComplete(p.rows, p.cols, p.regions, grid),
      regionAria: (p, region) => "block of " + p.regions[region].length + " cells"
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
