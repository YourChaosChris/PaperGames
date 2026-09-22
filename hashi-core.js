// hashi-core.js
// Dependency-free Hashiwokakero ("Bridges") engine: the board/island/edge
// model, bridge placement/removal legality, win-checking, and a real
// constraint-propagation-plus-backtracking solver used (at generation
// time) to confirm a freshly built puzzle has one and only one valid
// solution - the same discipline SudokuCore.countSolutions and
// NonogramCore.countSolutions use, just searching bridge counts on edges
// instead of digits or filled cells. No DOM/UI here, same separation of
// concerns as every other <game>-core.js in this app - solitaire, like
// Sudoku, Nonogram and Kakuro: no opponent, just a puzzle to satisfy.
//
// A board is `{ rows, cols, islands, edges }`:
//   - `islands`: an array of `{ row, col, need }`, indexed by "island id"
//     (its position in the array). `need` is the exact number of bridge
//     endpoints that must touch it.
//   - `edges`: every geometrically valid straight connection between two
//     islands that are the NEAREST island to each other along a row or
//     column (so no other island can possibly sit between them - the
//     "clear line of sight" rule falls out of this for free, since a
//     farther island is never even considered a candidate). Each edge is
//     `{ a, b, dir, r1, c1, r2, c2, crosses }`, where `crosses` is the
//     list of other edge ids it would physically cross (always the
//     perpendicular direction - two edges in the same direction can
//     never overlap, since each is already the nearest-neighbor pair on
//     its own row/column).
//
// A move is placing or removing a bridge on one edge. `bridgeCounts` is a
// plain array parallel to `edges`, each slot 0/1/2 - how many parallel
// bridges currently run along that edge. The core never stores "the"
// solution a puzzle was generated from; exactly like KakuroCore.isComplete
// and NonogramCore.checkSolved, winning is checked directly against the
// rules (every island's count matches its clue, and the network is fully
// connected) so any valid bridge layout is recognized, not just the one
// the generator happened to build.

const HashiCore = (function () {
  function buildBoard(rows, cols, islandDefs) {
    const islands = islandDefs.map((d) => ({ row: d.row, col: d.col, need: d.need }));
    const islandAt = {};
    islands.forEach((isl, id) => { islandAt[isl.row + "," + isl.col] = id; });

    const edges = [];
    islands.forEach((isl, id) => {
      // Nearest island strictly to the right, same row.
      let bestId = null, bestCol = Infinity;
      islands.forEach((other, otherId) => {
        if (otherId === id || other.row !== isl.row) return;
        if (other.col > isl.col && other.col < bestCol) { bestCol = other.col; bestId = otherId; }
      });
      if (bestId !== null) {
        edges.push({ a: id, b: bestId, dir: "h", r1: isl.row, c1: isl.col, r2: isl.row, c2: bestCol });
      }
      // Nearest island strictly below, same column.
      let bestId2 = null, bestRow = Infinity;
      islands.forEach((other, otherId) => {
        if (otherId === id || other.col !== isl.col) return;
        if (other.row > isl.row && other.row < bestRow) { bestRow = other.row; bestId2 = otherId; }
      });
      if (bestId2 !== null) {
        edges.push({ a: id, b: bestId2, dir: "v", r1: isl.row, c1: isl.col, r2: bestRow, c2: isl.col });
      }
    });

    edges.forEach((e) => { e.crosses = []; });
    for (let i = 0; i < edges.length; i++) {
      const h = edges[i];
      if (h.dir !== "h") continue;
      for (let j = 0; j < edges.length; j++) {
        const v = edges[j];
        if (v.dir !== "v") continue;
        // h spans row h.r1, columns (h.c1, h.c2) exclusive; v spans column
        // v.c1, rows (v.r1, v.r2) exclusive. They cross iff each line's
        // fixed coordinate falls strictly inside the other's open span.
        if (v.c1 > h.c1 && v.c1 < h.c2 && h.r1 > v.r1 && h.r1 < v.r2) {
          h.crosses.push(j);
          v.crosses.push(i);
        }
      }
    }

    return { rows, cols, islands, islandAt, edges };
  }

  function createEmptyBridgeCounts(board) {
    return new Array(board.edges.length).fill(0);
  }

  function cloneBridgeCounts(counts) {
    return counts.slice();
  }

  function findEdgeBetween(board, idA, idB) {
    for (let i = 0; i < board.edges.length; i++) {
      const e = board.edges[i];
      if ((e.a === idA && e.b === idB) || (e.a === idB && e.b === idA)) return i;
    }
    return -1;
  }

  // Would adding one more bridge to edge `edgeId` be legal right now? Max
  // 2 parallel bridges per edge, and no bridge may cross a perpendicular
  // edge that already carries one - the two hard geometric constraints.
  function canAddBridge(board, bridgeCounts, edgeId) {
    const edge = board.edges[edgeId];
    if (!edge) return false;
    const current = bridgeCounts[edgeId] || 0;
    if (current >= 2) return false;
    for (let i = 0; i < edge.crosses.length; i++) {
      if ((bridgeCounts[edge.crosses[i]] || 0) > 0) return false;
    }
    return true;
  }

  function addBridge(board, bridgeCounts, edgeId) {
    if (!canAddBridge(board, bridgeCounts, edgeId)) return false;
    bridgeCounts[edgeId] = (bridgeCounts[edgeId] || 0) + 1;
    return true;
  }

  // Removes the bridge(s) on an edge entirely (a double bridge is removed
  // as one unit - there's no real-world "remove just one of the two
  // parallel spans" gesture worth modeling). Returns false if there was
  // nothing there to remove.
  function removeBridge(board, bridgeCounts, edgeId) {
    if (!bridgeCounts[edgeId]) return false;
    bridgeCounts[edgeId] = 0;
    return true;
  }

  // The click-cycle every UI on top of this core drives: empty -> single
  // -> double -> empty again. Returns the resulting count, or null if the
  // requested step was geometrically illegal (an empty->single attempt
  // blocked by a crossing bridge - the only step that can actually fail).
  function cycleBridge(board, bridgeCounts, edgeId) {
    const current = bridgeCounts[edgeId] || 0;
    if (current === 0) {
      return addBridge(board, bridgeCounts, edgeId) ? bridgeCounts[edgeId] : null;
    }
    if (current === 1) {
      return addBridge(board, bridgeCounts, edgeId) ? bridgeCounts[edgeId] : null;
    }
    removeBridge(board, bridgeCounts, edgeId);
    return 0;
  }

  function computeIslandCounts(board, bridgeCounts) {
    const counts = new Array(board.islands.length).fill(0);
    board.edges.forEach((e, id) => {
      const c = bridgeCounts[id] || 0;
      if (c > 0) { counts[e.a] += c; counts[e.b] += c; }
    });
    return counts;
  }

  function isConnected(board, bridgeCounts) {
    const n = board.islands.length;
    if (n <= 1) return true;
    const parent = [];
    for (let i = 0; i < n; i++) parent.push(i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
    board.edges.forEach((e, id) => { if ((bridgeCounts[id] || 0) > 0) union(e.a, e.b); });
    const root = find(0);
    for (let i = 1; i < n; i++) if (find(i) !== root) return false;
    return true;
  }

  // Island ids whose current bridge count already equals their required
  // number - the "this clue is already satisfied" positive feedback the
  // UI highlights, the same idea as KakuroCore's conflict highlighting
  // just inverted (green instead of an error).
  function findSatisfiedIslands(board, bridgeCounts) {
    const counts = computeIslandCounts(board, bridgeCounts);
    const out = new Set();
    counts.forEach((c, id) => { if (c === board.islands[id].need) out.add(id); });
    return out;
  }

  // Island ids that already have MORE bridges than their number allows -
  // always a mistake to fix, shown the same way KakuroCore flags a
  // run whose sum has overshot its clue.
  function findOverfilledIslands(board, bridgeCounts) {
    const counts = computeIslandCounts(board, bridgeCounts);
    const out = new Set();
    counts.forEach((c, id) => { if (c > board.islands[id].need) out.add(id); });
    return out;
  }

  function isComplete(board, bridgeCounts) {
    const counts = computeIslandCounts(board, bridgeCounts);
    for (let i = 0; i < board.islands.length; i++) {
      if (counts[i] !== board.islands[i].need) return false;
    }
    return isConnected(board, bridgeCounts);
  }

  /*** Solver: given ONLY the islands and their numbers (no bridges drawn),
       how many valid bridge layouts satisfy every island's number AND
       connect the whole board? Used both to verify a freshly generated
       puzzle has exactly one solution (countSolutions, called with
       limit=2 - just enough to tell "unique" from "not unique") and to
       expose a plain solve() any future feature (e.g. a hint) could use.

       Each edge is a variable whose domain is a subset of {0, 1, 2}.
       Constraint propagation - "an island's remaining need vs. what its
       still-undetermined edges can possibly cover" (the same bounding
       idea as KakuroCore's run-feasibility check, just with per-edge
       values of 0-2 instead of unique 1-9 digits) plus "a bridge on this
       edge forces every edge it crosses to 0" - narrows every edge's
       domain until either a contradiction appears, every edge is
       determined, or nothing more can be deduced and the most-constrained
       remaining edge is branched on (backtracking search, same overall
       shape as SudokuCore/KakuroCore/NonogramCore's solvers). Whenever a
       full assignment is reached, it's also checked for full connectivity
       - the one constraint that's cheap to check only at the end rather
       than propagate throughout the search. ***/

  function domainMin(dom) { for (let v = 0; v <= 2; v++) if (dom[v]) return v; return -1; }
  function domainMax(dom) { for (let v = 2; v >= 0; v--) if (dom[v]) return v; return -1; }
  function domainSize(dom) { return (dom[0] ? 1 : 0) + (dom[1] ? 1 : 0) + (dom[2] ? 1 : 0); }

  function solveBoard(board, limit) {
    limit = limit || 1;
    const edges = board.edges;
    const nEdges = edges.length;
    const islands = board.islands;
    const nIslands = islands.length;

    const incident = islands.map(() => []);
    edges.forEach((e, id) => { incident[e.a].push(id); incident[e.b].push(id); });

    const solutions = [];

    // One full round of propagation over `domains` (an array of
    // [bool,bool,bool] per edge, mutated in place). Returns false the
    // moment a contradiction is found (an edge or island left with no
    // remaining possibility).
    function propagate(domains) {
      let changed = true;
      while (changed) {
        changed = false;

        for (let id = 0; id < nEdges; id++) {
          const dom = domains[id];
          if (domainMin(dom) > 0) {
            const crosses = edges[id].crosses;
            for (let k = 0; k < crosses.length; k++) {
              const odom = domains[crosses[k]];
              if (odom[1] || odom[2]) {
                odom[1] = false; odom[2] = false;
                if (!odom[0]) return false;
                changed = true;
              }
            }
          }
        }

        for (let isl = 0; isl < nIslands; isl++) {
          const need = islands[isl].need;
          const inc = incident[isl];
          let minSum = 0, maxSum = 0;
          for (let k = 0; k < inc.length; k++) {
            const d = domains[inc[k]];
            minSum += domainMin(d);
            maxSum += domainMax(d);
          }
          if (need < minSum || need > maxSum) return false;
          for (let k = 0; k < inc.length; k++) {
            const d = domains[inc[k]];
            const dMin = domainMin(d), dMax = domainMax(d);
            const otherMin = minSum - dMax;
            const otherMax = maxSum - dMin;
            for (let v = 0; v <= 2; v++) {
              if (!d[v]) continue;
              const rem = need - v;
              if (rem < otherMin || rem > otherMax) { d[v] = false; changed = true; }
            }
            if (!d[0] && !d[1] && !d[2]) return false;
          }
        }
      }
      return true;
    }

    function search(domains) {
      if (solutions.length >= limit) return;
      if (!propagate(domains)) return;

      let bestId = -1, bestSize = 4;
      for (let id = 0; id < nEdges; id++) {
        const sz = domainSize(domains[id]);
        if (sz > 1 && sz < bestSize) {
          bestSize = sz; bestId = id;
          if (sz === 2) break;
        }
      }

      if (bestId === -1) {
        const counts = domains.map((d) => domainMax(d));
        if (isConnected(board, counts)) solutions.push(counts);
        return;
      }

      const dom = domains[bestId];
      for (let v = 0; v <= 2; v++) {
        if (!dom[v]) continue;
        if (solutions.length >= limit) return;
        const branch = domains.map((d) => d.slice());
        branch[bestId] = [v === 0, v === 1, v === 2];
        search(branch);
      }
    }

    const initialDomains = edges.map(() => [true, true, true]);
    search(initialDomains);
    return solutions;
  }

  function countSolutions(board, limit) {
    return solveBoard(board, limit || 2).length;
  }

  function solve(board) {
    const solutions = solveBoard(board, 1);
    return solutions.length ? solutions[0] : null;
  }

  return {
    buildBoard,
    createEmptyBridgeCounts,
    cloneBridgeCounts,
    findEdgeBetween,
    canAddBridge,
    addBridge,
    removeBridge,
    cycleBridge,
    computeIslandCounts,
    isConnected,
    findSatisfiedIslands,
    findOverfilledIslands,
    isComplete,
    solveBoard,
    countSolutions,
    solve
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HashiCore;
}
if (typeof window !== "undefined") {
  window.HashiCore = HashiCore;
}
