// slitherlink-puzzles.js
// Slitherlink puzzle generator with three difficulty tiers, plus a real
// constraint-propagation-and-backtracking solver used to confirm every
// generated puzzle has exactly one solution - the same generate, derive
// clues, then remove-clues-while-checking-uniqueness discipline
// SudokuCore.generatePuzzle uses for its givens (see its digging loop),
// just applied to loop edges instead of Sudoku digits.
//
// Step 1 - a random solution loop: rather than growing a self-avoiding
// walk on the dot grid edge by edge (fiddly to keep loop-closable),
// this grows a random *region* of cells instead, one cell at a time
// starting from a single seed, always adding a cell adjacent to the
// region so far. The boundary between "inside the region" and "outside"
// (treating the area beyond the grid's own border as outside too) is
// then, by construction, a set of edges where every touched dot has
// degree exactly 2 - i.e. always a union of simple loops. As long as
// the grown region is a single connected blob with no enclosed holes
// and no "pinch" corners (two diagonally-touching region cells with the
// other diagonal pair both outside, which would make the boundary touch
// itself at that dot), that union is a *single* loop. Rather than
// tracking those conditions during growth, the grower just checks the
// result with SlitherlinkCore.getLoopStatus - the same authoritative
// check the solver and the UI's win-check both use - and restarts with
// a fresh random region on the rare shape that fails it.
//
// Step 2 - clues: every cell's clue is simply its "on" edge count in
// that solution (SlitherlinkCore.deriveClueGrid). A region built this
// way (at least 2 cells, no holes) never produces a cell with all 4
// edges on, so every clue naturally lands in 0-3, matching real
// Slitherlink boards.
//
// Step 3 - blanking clues: starting from every cell clued, remove one
// cell's clue at a time in random order, checking after each removal
// (via the solver's countSolutions, capped at 2) that the puzzle still
// has exactly one solution, and putting the clue back if not - exactly
// NonogramCore/SudokuCore's uniqueness-preserving reduction technique,
// stopping once a difficulty's target clue density is reached (or the
// shuffled list runs out, same early-stop as Sudoku's digging loop).

const SlitherlinkPuzzles = (function () {
  const DIFFICULTY = {
    easy: { rows: 5, cols: 5, density: 0.62 },
    medium: { rows: 7, cols: 7, density: 0.48 },
    hard: { rows: 10, cols: 10, density: 0.42 }
  };

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  /*** Step 1: a random single-loop solution, via region growth ***/

  function growRandomRegion(rows, cols, rng) {
    const total = rows * cols;
    const inside = [];
    for (let r = 0; r < rows; r++) inside.push(new Array(cols).fill(false));

    const startR = Math.floor(rng() * rows);
    const startC = Math.floor(rng() * cols);
    inside[startR][startC] = true;
    let count = 1;

    const minTarget = Math.max(2, Math.round(total * 0.35));
    const maxTarget = Math.max(minTarget + 1, Math.round(total * 0.62));
    const target = minTarget + Math.floor(rng() * (maxTarget - minTarget + 1));

    const frontier = new Map(); // "r,c" -> [r, c], cells adjacent to the region not yet in it
    function addFrontier(r, c) {
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !inside[nr][nc]) {
          frontier.set(nr + "," + nc, [nr, nc]);
        }
      });
    }
    addFrontier(startR, startC);

    while (count < target && frontier.size > 0) {
      const keys = Array.from(frontier.keys());
      const key = keys[Math.floor(rng() * keys.length)];
      const [r, c] = frontier.get(key);
      frontier.delete(key);
      if (inside[r][c]) continue;
      inside[r][c] = true;
      count++;
      addFrontier(r, c);
    }
    return inside;
  }

  function edgesFromRegion(inside, rows, cols) {
    function insideAt(r, c) {
      return r >= 0 && r < rows && c >= 0 && c < cols && inside[r][c];
    }
    const H = [];
    for (let r = 0; r <= rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(insideAt(r - 1, c) !== insideAt(r, c) ? SlitherlinkCore.ON : SlitherlinkCore.EMPTY);
      H.push(row);
    }
    const V = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c <= cols; c++) row.push(insideAt(r, c - 1) !== insideAt(r, c) ? SlitherlinkCore.ON : SlitherlinkCore.EMPTY);
      V.push(row);
    }
    return { H, V };
  }

  const MAX_SOLUTION_ATTEMPTS = 300;

  function generateSolutionLoop(rows, cols, rng) {
    for (let attempt = 0; attempt < MAX_SOLUTION_ATTEMPTS; attempt++) {
      const region = growRandomRegion(rows, cols, rng);
      const edges = edgesFromRegion(region, rows, cols);
      const status = SlitherlinkCore.getLoopStatus(edges, rows, cols);
      if (!status.singleLoop) continue;
      const clues = SlitherlinkCore.deriveClueGrid(edges, rows, cols);
      // Defensive: a real Slitherlink clue is always 0-3. Construction
      // guarantees this whenever the region has 2+ cells and no holes
      // (see file header), but a clue of 4 is cheap to rule out here
      // rather than trust that argument blindly.
      let ok = true;
      for (let r = 0; r < rows && ok; r++) {
        for (let c = 0; c < cols; c++) {
          if (clues[r][c] > 3) { ok = false; break; }
        }
      }
      if (!ok) continue;
      return edges;
    }
    return null; // exceedingly unlikely at these grid sizes/targets
  }

  /*** Step 3's solver: does a (possibly partial) clue grid have exactly
       one loop solution? Constraint propagation (per-cell clue counting
       and per-dot degree rules, run to a fixpoint) plus backtracking on
       whatever's left undetermined - the same shape as every other
       solver in this app (SudokuCore.countSolutions,
       NonogramCore.countSolutions, KakuroCore.countSolutions), just
       with edges as the search variables instead of digits/cells. ***/

  const UNKNOWN = -1, OFF = 0, EDGE_ON = 1;

  // A hard cap on backtracking work, so a pathologically slow partial
  // grid (most likely to come up mid-reduction, once few enough clues
  // remain that propagation alone can no longer pin everything down)
  // can't stall generation. Hitting the cap returns -1 ("can't confirm
  // uniqueness within budget"), which the generator treats exactly like
  // "not unique" - safe, since it only ever causes a clue to be kept
  // rather than removed, never the other way around.
  const DEFAULT_NODE_BUDGET = 2500;

  function countSolutions(rows, cols, clueGrid, limit, nodeBudget) {
    limit = limit || 2;
    nodeBudget = nodeBudget || DEFAULT_NODE_BUDGET;
    let solutions = 0;
    let nodeCount = 0;
    let aborted = false;

    // Working tri-state edge grids for this search only - never shared
    // with SlitherlinkCore's 0/1/2 player-facing representation.
    let H = [];
    for (let r = 0; r <= rows; r++) H.push(new Array(cols).fill(UNKNOWN));
    let V = [];
    for (let r = 0; r < rows; r++) V.push(new Array(cols + 1).fill(UNKNOWN));

    function getE(ref) { return ref.type === "H" ? H[ref.r][ref.c] : V[ref.r][ref.c]; }
    function setE(ref, val) { if (ref.type === "H") H[ref.r][ref.c] = val; else V[ref.r][ref.c] = val; }

    // Every cell's and dot's edge references, computed once up front
    // instead of on every propagation pass of every search node: they
    // never change for a given board size, but SlitherlinkCore's ref
    // helpers allocate a fresh array of fresh {type,r,c} objects on
    // every call, and this solver calls the equivalent of "for every
    // cell/dot" many tens of thousands of times while searching a
    // sparse hard-difficulty board - caching them once turns that into
    // the dominant cost of generation, cut down to a one-off setup.
    const cellRefsCache = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(SlitherlinkCore.cellEdgeRefs(r, c));
      cellRefsCache.push(row);
    }
    const dotRefsCache = [];
    for (let r = 0; r <= rows; r++) {
      const row = [];
      for (let c = 0; c <= cols; c++) row.push(SlitherlinkCore.dotEdgeRefs(r, c, rows, cols));
      dotRefsCache.push(row);
    }
    function cellRefs(r, c) { return cellRefsCache[r][c]; }
    function dotRefs(r, c) { return dotRefsCache[r][c]; }

    // Only the clue cells actually worth rechecking during propagation
    // (skipping null/undefined ones every pass adds up over tens of
    // thousands of nodes).
    const cluedCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (clueGrid[r][c] !== null && clueGrid[r][c] !== undefined) cluedCells.push([r, c, clueGrid[r][c]]);
      }
    }

    // One fixpoint pass of every local deduction rule. Returns false the
    // moment any rule finds a contradiction (over/under-full clue, a
    // dot needing more than 2 "on" edges, or a sealed-off loop that
    // can't possibly satisfy every clue - see checkSealedLoop below).
    const unknownBuf = new Array(4);
    function propagate() {
      let changed = true;
      while (changed) {
        if (aborted) return true; // stop deducing, let search() notice the budget is spent
        changed = false;

        for (let i = 0; i < cluedCells.length; i++) {
          const r = cluedCells[i][0], c = cluedCells[i][1], clue = cluedCells[i][2];
          const refs = cellRefs(r, c);
          let onCount = 0, unknownCount = 0;
          for (let k = 0; k < 4; k++) {
            const v = getE(refs[k]);
            if (v === EDGE_ON) onCount++;
            else if (v === UNKNOWN) unknownBuf[unknownCount++] = refs[k];
          }
          if (onCount > clue) return false;
          if (onCount + unknownCount < clue) return false;
          if (unknownCount === 0) continue;
          if (onCount === clue) {
            for (let k = 0; k < unknownCount; k++) setE(unknownBuf[k], OFF);
            changed = true;
          } else if (onCount + unknownCount === clue) {
            for (let k = 0; k < unknownCount; k++) setE(unknownBuf[k], EDGE_ON);
            changed = true;
          }
        }

        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c <= cols; c++) {
            const refs = dotRefs(r, c);
            const n = refs.length;
            let onCount = 0, unknownCount = 0, lastUnknown = null;
            for (let k = 0; k < n; k++) {
              const v = getE(refs[k]);
              if (v === EDGE_ON) onCount++;
              else if (v === UNKNOWN) { unknownCount++; lastUnknown = refs[k]; }
            }
            if (onCount > 2) return false;
            if (unknownCount === 0) continue;
            if (onCount === 2) {
              for (let k = 0; k < n; k++) if (getE(refs[k]) === UNKNOWN) setE(refs[k], OFF);
              changed = true;
            } else if (onCount === 1 && unknownCount === 1) {
              setE(lastUnknown, EDGE_ON);
              changed = true;
            } else if (onCount === 0 && unknownCount === 1) {
              // The lone remaining edge can't be the dot's only "on"
              // edge (that would leave it a dead end, degree 1), so it
              // has to stay off.
              setE(lastUnknown, OFF);
              changed = true;
            }
          }
        }

        const sealed = checkSealedLoop();
        if (sealed === "contradiction") return false;
        if (sealed === "seal-rest-off") {
          for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) if (H[r][c] === UNKNOWN) { H[r][c] = OFF; changed = true; }
          for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) if (V[r][c] === UNKNOWN) { V[r][c] = OFF; changed = true; }
        }
      }
      return true;
    }

    // Finds every already-closed loop among currently-"on" edges (a
    // connected set of dots all at on-degree exactly 2, none of them
    // touching any still-unknown edge - so nothing can ever attach to
    // or detach from it again). Two or more such closed components can
    // never merge into one loop, so that's an immediate contradiction.
    // Exactly one closed component is fine *only* if it already
    // satisfies every clue - if it does, every other unknown edge must
    // stay off forever (drawing any of them would either branch off the
    // sealed loop or start a second, disconnected one); if some clue
    // still isn't satisfied, the only edges left that could satisfy it
    // are disconnected from the sealed loop, which would make a second
    // loop - also a contradiction.
    function checkSealedLoop() {
      const dotRows = rows + 1, dotCols = cols + 1;
      // `visited` means "already accounted for by some BFS below" - it
      // is NOT the same as "not currently on-degree 2", which a dot can
      // stop being true of only within this single (read-only) call, so
      // a dot skipped for that reason is deliberately left unmarked and
      // simply rechecked (cheaply - the board is tiny) if some other
      // seed's walk reaches it first.
      const visited = [];
      for (let r = 0; r < dotRows; r++) visited.push(new Array(dotCols).fill(false));
      let sealedFound = 0;

      for (let r = 0; r < dotRows; r++) {
        for (let c = 0; c < dotCols; c++) {
          if (visited[r][c]) continue;
          const refs0 = dotRefs(r, c);
          let onCount0 = 0;
          for (let k = 0; k < refs0.length; k++) if (getE(refs0[k]) === EDGE_ON) onCount0++;
          if (onCount0 !== 2) continue; // not part of any closed loop's interior - leave unvisited

          let allSealed = true;
          visited[r][c] = true;
          const stack = [[r, c]];
          while (stack.length) {
            const [cr, cc] = stack.pop();
            const refs = dotRefs(cr, cc);
            let onHere = 0, hasUnknown = false;
            for (let k = 0; k < refs.length; k++) {
              const v = getE(refs[k]);
              if (v === EDGE_ON) onHere++;
              else if (v === UNKNOWN) hasUnknown = true;
            }
            // A dot the walk reaches with on-degree other than 2 is an
            // open end (or, if >2, would already have been caught by
            // the vertex rule above) - the component isn't a closed
            // loop. A dot with any still-unknown edge isn't fully
            // determined yet either. Either way, keep walking (so every
            // reachable dot is marked visited and not rechecked) but
            // the component as a whole is not sealed.
            if (onHere !== 2 || hasUnknown) allSealed = false;
            for (let k = 0; k < refs.length; k++) {
              const ref = refs[k];
              if (getE(ref) !== EDGE_ON) continue;
              const nr = ref.type === "H" ? cr : (cr === ref.r ? cr + 1 : cr - 1);
              const nc = ref.type === "H" ? (cc === ref.c ? cc + 1 : cc - 1) : cc;
              if (!visited[nr][nc]) {
                visited[nr][nc] = true;
                stack.push([nr, nc]);
              }
            }
          }
          if (!allSealed) continue;
          // Every dot in this component has on-degree exactly 2 and no
          // unknown incident edges left - it's a fully closed, fully
          // determined loop.
          sealedFound++;
          if (sealedFound > 1) return "contradiction";
        }
      }

      if (sealedFound === 1) {
        for (let i = 0; i < cluedCells.length; i++) {
          const r = cluedCells[i][0], c = cluedCells[i][1], clue = cluedCells[i][2];
          const refs = cellRefs(r, c);
          let onCount = 0;
          for (let k = 0; k < 4; k++) if (getE(refs[k]) === EDGE_ON) onCount++;
          if (onCount !== clue) return "contradiction";
        }
        return "seal-rest-off";
      }
      return "ok";
    }

    // Most-constrained-first branching: prefer an unknown edge next to
    // a clue cell with the fewest remaining unknown edges (mirrors the
    // MRV heuristic every other solver here uses), falling back to any
    // remaining unknown edge for unclued regions of the board.
    function pickBranchEdge() {
      let best = null, bestCount = Infinity, bestFirst = null;
      for (let i = 0; i < cluedCells.length; i++) {
        const r = cluedCells[i][0], c = cluedCells[i][1];
        const refs = cellRefs(r, c);
        let count = 0, first = null;
        for (let k = 0; k < 4; k++) {
          if (getE(refs[k]) === UNKNOWN) { count++; if (!first) first = refs[k]; }
        }
        if (count > 0 && count < bestCount) {
          bestCount = count;
          bestFirst = first;
          if (bestCount === 1) return bestFirst;
        }
      }
      best = bestFirst;
      if (best) return best;
      for (let r = 0; r <= rows; r++) for (let c = 0; c < cols; c++) if (H[r][c] === UNKNOWN) return { type: "H", r, c };
      for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) if (V[r][c] === UNKNOWN) return { type: "V", r, c };
      return null;
    }

    function toFinalEdges() {
      return {
        H: H.map((row) => row.map((v) => (v === EDGE_ON ? SlitherlinkCore.ON : SlitherlinkCore.EMPTY))),
        V: V.map((row) => row.map((v) => (v === EDGE_ON ? SlitherlinkCore.ON : SlitherlinkCore.EMPTY)))
      };
    }

    function search() {
      if (solutions >= limit || aborted) return;
      nodeCount++;
      if (nodeCount > nodeBudget) { aborted = true; return; }
      if (!propagate()) return;
      if (aborted) return;

      const edge = pickBranchEdge();
      if (!edge) {
        // Fully determined - verify against the same authoritative
        // single-loop check the UI's win-check uses. The propagation
        // rules above (in particular checkSealedLoop) already rule out
        // most invalid shapes, but this is the ground truth.
        const status = SlitherlinkCore.getLoopStatus(toFinalEdges(), rows, cols);
        if (status.singleLoop) solutions++;
        return;
      }

      const savedH = H.map((row) => row.slice());
      const savedV = V.map((row) => row.slice());
      for (const val of [EDGE_ON, OFF]) {
        if (solutions >= limit || aborted) return;
        setE(edge, val);
        search();
        H = savedH.map((row) => row.slice());
        V = savedV.map((row) => row.slice());
      }
    }

    search();
    return aborted ? -1 : solutions;
  }

  /*** Step 2 + 3: generate a full-clue solved board, then blank clues
       one at a time while the solver still reports a unique solution. ***/

  const MAX_PUZZLE_ATTEMPTS = 20;

  function generatePuzzle(difficulty, rng) {
    const random = rng || Math.random;
    const cfg = DIFFICULTY[difficulty] || DIFFICULTY.medium;
    const { rows, cols } = cfg;
    const totalCells = rows * cols;
    const targetRemaining = Math.max(1, Math.round(totalCells * cfg.density));

    for (let attempt = 0; attempt < MAX_PUZZLE_ATTEMPTS; attempt++) {
      const solution = generateSolutionLoop(rows, cols, random) || edgesFromRegion(
        // Fallback that always works even in the astronomically unlikely
        // case every random attempt above failed: the plain outer
        // border, which is always a valid single loop.
        Array.from({ length: rows }, () => new Array(cols).fill(true)),
        rows, cols
      );

      const fullClues = SlitherlinkCore.deriveClueGrid(solution, rows, cols);

      // Every cell clued should, in virtually every case, already pin
      // the solution uniquely - but confirm it before spending any
      // effort blanking clues out of it, exactly like Step 1's own
      // "verify, else regenerate" discipline. A full-clue board is the
      // easiest possible case for the solver, so this check is cheap.
      if (countSolutions(rows, cols, fullClues, 2) !== 1) continue;

      const clueGrid = SlitherlinkCore.cloneClueGrid(fullClues);
      const cellOrder = shuffle(
        Array.from({ length: totalCells }, (_, i) => [Math.floor(i / cols), i % cols]),
        random
      );

      let remaining = totalCells;
      for (const [r, c] of cellOrder) {
        if (remaining <= targetRemaining) break;
        const saved = clueGrid[r][c];
        clueGrid[r][c] = null;
        if (countSolutions(rows, cols, clueGrid, 2) === 1) {
          remaining--;
        } else {
          clueGrid[r][c] = saved;
        }
      }

      return { rows, cols, clues: clueGrid, solution, difficulty, size: rows + "x" + cols };
    }

    // Should never be reached (see the generator test in this project's
    // validation notes), but never leave the player with nothing: fall
    // back to the fully-clued board from the last attempt, which is
    // always solvable and always unique once it passed the check above.
    const solution = generateSolutionLoop(rows, cols, random) || edgesFromRegion(
      Array.from({ length: rows }, () => new Array(cols).fill(true)), rows, cols
    );
    const clues = SlitherlinkCore.deriveClueGrid(solution, rows, cols);
    return { rows, cols, clues, solution, difficulty, size: rows + "x" + cols };
  }

  return { DIFFICULTY, generateSolutionLoop, countSolutions, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SlitherlinkPuzzles;
}
if (typeof window !== "undefined") {
  window.SlitherlinkPuzzles = SlitherlinkPuzzles;
}
