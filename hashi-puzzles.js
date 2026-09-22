// hashi-puzzles.js
// Hashiwokakero puzzle generator with three difficulty tiers, matching
// the Kakuro-style split of a core engine (hashi-core.js) plus a
// generator file that builds fresh puzzles on top of it - but, like
// Sudoku and Nonogram (and unlike the current Kakuro generator), a
// freshly built puzzle is only ever handed to the player once
// HashiCore.countSolutions confirms it has EXACTLY ONE valid bridge
// layout. A Hashi puzzle whose numbers admit two different valid
// networks would let a player complete it "wrong but numerically valid"
// and have the game (correctly) refuse to call that a win, which is far
// more confusing here than in a digit-entry puzzle - so every generated
// board is verified, and silently discarded/retried if it isn't unique.
//
// Approach, following the project's established discipline for a
// generated-with-a-guaranteed-unique-solution puzzle: scatter islands at
// random valid grid positions, connect them into a single random SPANNING
// TREE of single/double bridges (so the "known solution" is connected by
// construction and never crosses itself - a tree has exactly one path
// between any two islands, which keeps the ambiguity rate low enough that
// a handful of retries almost always finds a unique puzzle), read each
// island's number off that solution's bridge counts, throw the bridges
// away, and verify the bare numbers alone still pin down that one layout
// (HashiCore.solveBoard/countSolutions, which knows nothing about how the
// puzzle was built - the real Hashi-solving search, not a shortcut).

const HashiPuzzles = (function () {
  // `size` is both rows and cols. Difficulty scales island count and grid
  // size together, the same "bigger board, more interacting clues" idea
  // as KakuroPuzzles' size/density pairing and NonogramPuzzles' picture
  // sizes - roughly 10-12 islands on a small 7x7 board up to ~30 on a
  // 15x15 board, matching the ranges the project brief calls for.
  const DIFFICULTY = {
    easy: { size: 7, islands: 11 },
    medium: { size: 11, islands: 20 },
    hard: { size: 15, islands: 30 }
  };

  const MAX_ATTEMPTS = 60;
  const MAX_GROWTH_TRIES = 250;
  const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // Do two axis-aligned segments (already in the {r1,c1,r2,c2} convention
  // HashiCore.buildBoard uses - 'h' sorted by column, 'v' sorted by row)
  // cross at an interior point? Same open-interval test as
  // HashiCore.buildBoard's own crossing precomputation.
  function segmentsCross(h, v) {
    return v.c1 > h.c1 && v.c1 < h.c2 && h.r1 > v.r1 && h.r1 < v.r2;
  }

  // Grows a random spanning tree of islands directly, rather than
  // scattering islands first and hoping a valid tree exists afterward:
  // starting from one island, each new island is attached to a randomly
  // chosen already-placed island by walking a random distance in a
  // random direction, stopping short of anything that would block or
  // cross - so the tree is connected AND crossing-free by construction,
  // with no separate connectivity search needed. Cells strictly between
  // a newly connected pair are reserved (never given to a later island)
  // so that connection stays each pair's true nearest-neighbor edge for
  // the rest of generation - otherwise a later island landing in between
  // would silently invalidate that edge once the real candidate-edge
  // graph is recomputed at the end.
  //
  // Returns `{ islands, treeEdges }` (each treeEdge `{ a, b, dir, r1, c1,
  // r2, c2 }`, mirroring HashiCore.buildBoard's own edge shape) or null
  // if it got stuck growing the tree within a reasonable number of tries
  // - rare, and just means this generation attempt is abandoned for a
  // fresh one.
  function growIslandTree(size, count, rng) {
    const random = rng || Math.random;
    const islands = [];
    const treeEdges = [];
    const occupied = new Set();
    const reserved = new Set(); // cells that must stay empty to protect an edge

    function cellFree(r, c) {
      const key = r + "," + c;
      return !occupied.has(key) && !reserved.has(key);
    }

    const startRow = Math.floor(random() * size);
    const startCol = Math.floor(random() * size);
    islands.push({ row: startRow, col: startCol });
    occupied.add(startRow + "," + startCol);

    while (islands.length < count) {
      let placed = false;
      for (let tries = 0; tries < MAX_GROWTH_TRIES && !placed; tries++) {
        const fromId = Math.floor(random() * islands.length);
        const from = islands[fromId];
        const [dr, dc] = DIRECTIONS[Math.floor(random() * 4)];

        let reach = 0;
        while (true) {
          const r = from.row + dr * (reach + 1);
          const c = from.col + dc * (reach + 1);
          if (r < 0 || r >= size || c < 0 || c >= size || !cellFree(r, c)) break;
          reach++;
        }
        if (reach < 1) continue;

        const dist = 1 + Math.floor(random() * reach);
        const toRow = from.row + dr * dist;
        const toCol = from.col + dc * dist;

        const dir = dr === 0 ? "h" : "v";
        const edge = dir === "h"
          ? { dir, r1: from.row, r2: from.row, c1: Math.min(from.col, toCol), c2: Math.max(from.col, toCol) }
          : { dir, c1: from.col, c2: from.col, r1: Math.min(from.row, toRow), r2: Math.max(from.row, toRow) };

        let crosses = false;
        for (let i = 0; i < treeEdges.length && !crosses; i++) {
          const other = treeEdges[i];
          if (other.dir === dir) continue;
          crosses = dir === "h" ? segmentsCross(edge, other) : segmentsCross(other, edge);
        }
        if (crosses) continue;

        const toId = islands.length;
        islands.push({ row: toRow, col: toCol });
        occupied.add(toRow + "," + toCol);
        for (let d = 1; d < dist; d++) {
          reserved.add((from.row + dr * d) + "," + (from.col + dc * d));
        }
        treeEdges.push(Object.assign({ a: fromId, b: toId }, edge));
        placed = true;
      }
      if (!placed) return null;
    }

    return { islands, treeEdges };
  }

  function generatePuzzle(difficulty, rng) {
    const random = rng || Math.random;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const grown = growIslandTree(cfg.size, cfg.islands, random);
      if (!grown) continue;

      const islandDefs = grown.islands.map((isl) => ({ row: isl.row, col: isl.col, need: 0 }));
      const scratchBoard = HashiCore.buildBoard(cfg.size, cfg.size, islandDefs);
      // The final board almost always has MORE candidate edges than the
      // grown tree used (any two islands that happen to share a clear
      // row/column become a candidate edge, whether or not growth
      // connected them directly) - that's normal and is exactly what
      // gives the puzzle deduction to do. What must still hold is that
      // every grown tree edge is still that exact pair's nearest-
      // neighbor edge on the final board (the reserved-cell bookkeeping
      // above is meant to guarantee this); mappingOk below checks it.
      const bridgeCounts = HashiCore.createEmptyBridgeCounts(scratchBoard);
      let mappingOk = true;
      grown.treeEdges.forEach((te) => {
        const edgeId = HashiCore.findEdgeBetween(scratchBoard, te.a, te.b);
        if (edgeId === -1) { mappingOk = false; return; }
        bridgeCounts[edgeId] = 1;
      });
      if (!mappingOk) continue;

      // Upgrade a random subset of the tree's edges to double bridges,
      // for islands whose numbers go beyond a plain 1-per-neighbor board.
      scratchBoard.edges.forEach((edge, edgeId) => {
        if (bridgeCounts[edgeId] === 1 && random() < 0.35) {
          HashiCore.addBridge(scratchBoard, bridgeCounts, edgeId);
        }
      });

      const counts = HashiCore.computeIslandCounts(scratchBoard, bridgeCounts);
      if (counts.some((c) => c === 0)) continue; // every island must need at least one bridge

      const puzzleIslandDefs = islandDefs.map((d, id) => ({ row: d.row, col: d.col, need: counts[id] }));
      const puzzleBoard = HashiCore.buildBoard(cfg.size, cfg.size, puzzleIslandDefs);

      if (HashiCore.countSolutions(puzzleBoard, 2) !== 1) continue;

      return { size: cfg.size, islands: puzzleIslandDefs, difficulty };
    }

    // Should be vanishingly rare at these island counts (see the
    // generator/uniqueness test in this project's validation notes), but
    // never leave the player with nothing: fall back to a tiny, trivially
    // unique two-island puzzle (a single required bridge between the two
    // corners) rather than surfacing an error.
    const fallbackIslands = [
      { row: 0, col: 0, need: 1 },
      { row: 0, col: cfg.size - 1, need: 1 }
    ];
    return { size: cfg.size, islands: fallbackIslands, difficulty };
  }

  return { DIFFICULTY, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HashiPuzzles;
}
if (typeof window !== "undefined") {
  window.HashiPuzzles = HashiPuzzles;
}
