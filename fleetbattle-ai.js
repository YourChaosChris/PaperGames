// fleetbattle-ai.js
// Computer opponent for Fleet Battle: fleet auto-placement (reuses
// FleetBattleCore's shared random-placement algorithm, respecting the
// same no-touching rule as manual placement) and a classic "hunt and
// target" shot-selection algorithm with three difficulty levels.
//
// Hunt and target, the standard approach used by essentially every
// digital Battleship-style opponent:
//  - HUNT mode: no ship is currently known to be partially hit, so fire
//    at a random cell that hasn't been tried yet. "hard" biases this
//    toward a checkerboard parity pattern - since every ship here is at
//    least 2 cells long, it must occupy at least one cell of either
//    checkerboard color, so restricting hunting to one color roughly
//    halves the search space without ever missing a ship.
//  - TARGET mode: once a hit lands on a ship that isn't fully sunk yet,
//    switch to firing at that hit's immediate orthogonal neighbors. Once
//    a second hit on the same ship reveals its orientation (row or
//    column), keep extending along that line in both directions until
//    the ship is sunk, then return to hunt mode.
//
// The AI's state (`{ mode, hits, axis }`) is intentionally tiny and
// carries no cached candidate list - the list of cells worth trying next
// is always recomputed on demand from `hits`/`axis` plus the shots
// already fired, so it can never go stale across a save/resume cycle.
//
// Difficulty levels:
//  - easy:   pure random hunting, no targeting-mode follow-up at all
//            (a hit is not exploited beyond the shot that landed it).
//  - medium: full hunt-and-target, but plain random hunting.
//  - hard:   full hunt-and-target, with checkerboard-parity-biased hunting.

const FleetBattleAi = (function () {
  const Core = (typeof window !== "undefined" && window.FleetBattleCore) ||
    (typeof require === "function" ? require("./fleetbattle-core.js") : null);

  const LEVELS = ["easy", "medium", "hard"];

  function normalizeLevel(level) {
    return LEVELS.indexOf(level) === -1 ? "medium" : level;
  }

  // Fleet auto-placement: same validated, no-touching random algorithm
  // used for the human player's "Random placement" convenience button.
  function placeFleet(rng) {
    return Core.randomPlacement(rng);
  }

  function createState() {
    return { mode: "hunt", hits: [], axis: null };
  }

  function orthogonalNeighbors(r, c) {
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter((cell) => Core.inBounds(cell[0], cell[1]));
  }

  function allUntriedCells(shots) {
    const cells = [];
    for (let r = 0; r < Core.BOARD_SIZE; r++) {
      for (let c = 0; c < Core.BOARD_SIZE; c++) {
        if (!shots[Core.cellKey(r, c)]) cells.push([r, c]);
      }
    }
    return cells;
  }

  function pickRandom(list, rng) {
    const random = rng || Math.random;
    return list[Math.floor(random() * list.length)];
  }

  // Cells still worth trying to finish off the ship currently being
  // targeted, computed fresh from `hits`/`axis` and the shots fired so
  // far (never from stored state) so it's always consistent even after
  // a save/resume.
  function computeTargetQueue(hits, axis, shots) {
    if (!hits.length) return [];

    if (!axis) {
      const seen = {};
      const queue = [];
      hits.forEach((hit) => {
        orthogonalNeighbors(hit[0], hit[1]).forEach((cell) => {
          const key = Core.cellKey(cell[0], cell[1]);
          if (!shots[key] && !seen[key]) {
            seen[key] = true;
            queue.push(cell);
          }
        });
      });
      return queue;
    }

    const candidates = [];
    if (axis === "row") {
      const row = hits[0][0];
      const cols = hits.map((h) => h[1]);
      candidates.push([row, Math.min.apply(null, cols) - 1]);
      candidates.push([row, Math.max.apply(null, cols) + 1]);
    } else {
      const col = hits[0][1];
      const rows = hits.map((h) => h[0]);
      candidates.push([Math.min.apply(null, rows) - 1, col]);
      candidates.push([Math.max.apply(null, rows) + 1, col]);
    }
    return candidates.filter((cell) => Core.inBounds(cell[0], cell[1]) && !shots[Core.cellKey(cell[0], cell[1])]);
  }

  function chooseHuntCell(shots, level, rng) {
    const untried = allUntriedCells(shots);
    if (!untried.length) return null;
    if (level === "hard") {
      const parityA = untried.filter((cell) => (cell[0] + cell[1]) % 2 === 0);
      const parityB = untried.filter((cell) => (cell[0] + cell[1]) % 2 === 1);
      const preferred = parityA.length ? parityA : parityB;
      if (preferred.length) return pickRandom(preferred, rng);
    }
    return pickRandom(untried, rng);
  }

  // Picks the computer's next shot: a [row, col] cell that has not been
  // fired at yet, or null if the whole board has already been shot at
  // (should never happen before the game ends).
  function chooseShot(shots, aiState, level, rng) {
    const lvl = normalizeLevel(level);
    if (lvl !== "easy" && aiState.mode === "target") {
      const queue = computeTargetQueue(aiState.hits, aiState.axis, shots);
      if (queue.length) return pickRandom(queue, rng);
      // Safety net: queue emptied without the ship sinking (should not
      // happen given correct bookkeeping) - fall back to hunting.
    }
    return chooseHuntCell(shots, lvl, rng);
  }

  // Updates AI state after the computer's shot at (r,c) resolves against
  // the human fleet. `hit`/`sunk` mirror FleetBattleCore.fireShot's result.
  function updateStateAfterShot(aiState, level, r, c, hit, sunk) {
    const lvl = normalizeLevel(level);
    if (lvl === "easy") {
      return createState(); // easy never enters/stays in target mode
    }

    if (aiState.mode === "hunt") {
      if (hit && !sunk) return { mode: "target", hits: [[r, c]], axis: null };
      return createState();
    }

    // aiState.mode === "target"
    if (!hit) {
      return { mode: "target", hits: aiState.hits, axis: aiState.axis };
    }
    if (sunk) {
      return createState();
    }
    const hits = aiState.hits.concat([[r, c]]);
    let axis = aiState.axis;
    if (!axis) {
      axis = hits[0][0] === r ? "row" : "col";
    }
    return { mode: "target", hits, axis };
  }

  return {
    LEVELS,
    normalizeLevel,
    placeFleet,
    createState,
    chooseShot,
    updateStateAfterShot,
    // Exposed for tests only - not used by any normal-play code path.
    _computeTargetQueue: computeTargetQueue
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = FleetBattleAi;
}
if (typeof window !== "undefined") {
  window.FleetBattleAi = FleetBattleAi;
}
