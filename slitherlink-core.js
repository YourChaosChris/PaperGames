// slitherlink-core.js
// Dependency-free Slitherlink ("Fences" / "Loop the Loop") engine: the
// dot/edge/cell data model, deriving a cell's clue count from a full edge
// assignment, and the win-checking logic the UI needs (does the current
// set of "on" edges form exactly one simple closed loop that matches
// every numbered cell?). No DOM/UI here, same separation of concerns as
// every other <game>-core.js in this app - and, like Sudoku/Kakuro/
// Nonogram, no opponent: Slitherlink is solitaire. Puzzle generation and
// the uniqueness-verifying solver live in slitherlink-puzzles.js, not
// here (see that file's header for why).
//
// A board is `rows` x `cols` cells, which means a (rows+1) x (cols+1)
// grid of dots. Between dots run two families of potential edges:
//   H[r][c] for r in 0..rows, c in 0..cols-1  - the horizontal edge
//     between dot(r,c) and dot(r,c+1). It's the *top* edge of cell
//     (r,c) and the *bottom* edge of cell (r-1,c).
//   V[r][c] for r in 0..rows-1, c in 0..cols  - the vertical edge
//     between dot(r,c) and dot(r+1,c). It's the *left* edge of cell
//     (r,c) and the *right* edge of cell (r,c-1).
// Every edge holds one of three player-facing states: 0 = empty/off,
// 1 = on (part of the loop), 2 = marked (the player's own "definitely
// not part of the loop" note - a memory aid, counts as "not on" for
// every check here, same idea as Nonogram's "marked" cell state).
//
// A cell's clue is a small integer 0-3, or null for an unconstrained
// cell, stored as a `rows` x `cols` grid parallel to the cell grid.

const SlitherlinkCore = (function () {
  const EMPTY = 0;
  const ON = 1;
  const MARKED = 2;

  function createEmptyEdges(rows, cols) {
    const H = [];
    for (let r = 0; r <= rows; r++) H.push(new Array(cols).fill(EMPTY));
    const V = [];
    for (let r = 0; r < rows; r++) V.push(new Array(cols + 1).fill(EMPTY));
    return { H, V };
  }

  function cloneEdges(edges) {
    return {
      H: edges.H.map((row) => row.slice()),
      V: edges.V.map((row) => row.slice())
    };
  }

  // The four edge references bounding cell (r,c), in a fixed order used
  // consistently everywhere in this file (top, bottom, left, right).
  function cellEdgeRefs(r, c) {
    return [
      { type: "H", r: r, c: c },
      { type: "H", r: r + 1, c: c },
      { type: "V", r: r, c: c },
      { type: "V", r: r, c: c + 1 }
    ];
  }

  // Every edge incident to dot (r,c) - up to 4, fewer along the border.
  function dotEdgeRefs(r, c, rows, cols) {
    const refs = [];
    if (c > 0) refs.push({ type: "H", r: r, c: c - 1 });
    if (c < cols) refs.push({ type: "H", r: r, c: c });
    if (r > 0) refs.push({ type: "V", r: r - 1, c: c });
    if (r < rows) refs.push({ type: "V", r: r, c: c });
    return refs;
  }

  function getEdge(edges, ref) {
    return ref.type === "H" ? edges.H[ref.r][ref.c] : edges.V[ref.r][ref.c];
  }

  function setEdge(edges, ref, value) {
    if (ref.type === "H") edges.H[ref.r][ref.c] = value;
    else edges.V[ref.r][ref.c] = value;
  }

  function edgeKey(ref) {
    return ref.type + ":" + ref.r + "," + ref.c;
  }

  // off -> on -> marked -> off. Drawing a line is the primary action (one
  // tap), with the "definitely not part of the loop" cross as a third
  // state for players who want it - the same idea as Nonogram's Fill/Mark
  // distinction, just folded into a single tap-to-cycle instead of a
  // separate mode switch, since an edge (unlike a Nonogram cell) has no
  // ambiguity about which of the two non-empty states was intended.
  function cycleEdgeValue(value) {
    if (value === EMPTY) return ON;
    if (value === ON) return MARKED;
    return EMPTY;
  }

  function countAroundCell(edges, r, c, predicate) {
    let count = 0;
    cellEdgeRefs(r, c).forEach((ref) => {
      if (predicate(getEdge(edges, ref))) count++;
    });
    return count;
  }

  function onCountAroundCell(edges, r, c) {
    return countAroundCell(edges, r, c, (v) => v === ON);
  }

  // Every cell's clue, derived straight from a *complete* edge
  // assignment (typically a freshly generated solution loop): the count
  // of that cell's 4 edges currently "on". Used by the generator to turn
  // a random solved loop into a full clue grid before it starts blanking
  // clues out - the exact same role KakuroCore.buildClueGrid plays for
  // Kakuro's run sums, just counting edges instead of summing digits.
  function deriveClueGrid(edges, rows, cols) {
    const clues = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) row.push(onCountAroundCell(edges, r, c));
      clues.push(row);
    }
    return clues;
  }

  function cloneClueGrid(clues) {
    return clues.map((row) => row.slice());
  }

  // The heart of both win-checking and the solver's final-answer check:
  // do the current "on" edges form exactly one simple closed loop? That
  // requires every touched dot to have on-degree exactly 2 (0 means the
  // dot isn't part of the loop at all; 1 is a dead end; 3+ is a branch -
  // neither is allowed), and every dot with on-degree 2 must belong to
  // the same connected component (otherwise the "on" edges form two or
  // more separate loops instead of one). A board with no "on" edges at
  // all is not a loop either - the player has to actually draw one.
  function getLoopStatus(edges, rows, cols) {
    const dotRows = rows + 1, dotCols = cols + 1;
    const degree = [];
    for (let r = 0; r < dotRows; r++) degree.push(new Array(dotCols).fill(0));

    let onEdgeCount = 0;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (edges.H[r][c] === ON) {
          degree[r][c]++;
          degree[r][c + 1]++;
          onEdgeCount++;
        }
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (edges.V[r][c] === ON) {
          degree[r][c]++;
          degree[r + 1][c]++;
          onEdgeCount++;
        }
      }
    }

    const badDots = [];
    for (let r = 0; r < dotRows; r++) {
      for (let c = 0; c < dotCols; c++) {
        if (degree[r][c] !== 0 && degree[r][c] !== 2) badDots.push([r, c]);
      }
    }

    // Connected components among dots that are actually part of the loop
    // (degree 2), walking only along "on" edges.
    const visited = [];
    for (let r = 0; r < dotRows; r++) visited.push(new Array(dotCols).fill(false));
    let components = 0;
    for (let r = 0; r < dotRows; r++) {
      for (let c = 0; c < dotCols; c++) {
        if (degree[r][c] !== 2 || visited[r][c]) continue;
        components++;
        const stack = [[r, c]];
        visited[r][c] = true;
        while (stack.length) {
          const [cr, cc] = stack.pop();
          dotEdgeRefs(cr, cc, rows, cols).forEach((ref) => {
            if (getEdge(edges, ref) !== ON) return;
            const nr = ref.type === "H" ? cr : (cr === ref.r ? cr + 1 : cr - 1);
            const nc = ref.type === "H" ? (cc === ref.c ? cc + 1 : cc - 1) : cc;
            if (!visited[nr][nc]) { visited[nr][nc] = true; stack.push([nr, nc]); }
          });
        }
      }
    }

    const singleLoop = badDots.length === 0 && onEdgeCount > 0 && components === 1;
    return { singleLoop, badDots, components, onEdgeCount };
  }

  function checkWin(edges, clues, rows, cols) {
    const status = getLoopStatus(edges, rows, cols);
    if (!status.singleLoop) return false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const clue = clues[r][c];
        if (clue === null || clue === undefined) continue;
        if (onCountAroundCell(edges, r, c) !== clue) return false;
      }
    }
    return true;
  }

  // Live hints, same spirit as every other -core.js's findConflicts: a
  // clue cell is flagged the moment it's already wrong (too many "on"
  // edges) or already unreachable (too few edges left that could still
  // turn "on" to reach the clue, once marked-off edges are taken into
  // account) - well before the whole board is filled in. A dot is
  // flagged the moment 3+ of its edges are "on" (an outright branch,
  // never allowed in a single loop) - degree exactly 1 is not flagged,
  // since every loop-in-progress necessarily has open ends until it's
  // closed.
  function findConflicts(edges, clues, rows, cols) {
    const cellConflicts = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const clue = clues[r][c];
        if (clue === null || clue === undefined) continue;
        const refs = cellEdgeRefs(r, c);
        const onCount = refs.filter((ref) => getEdge(edges, ref) === ON).length;
        const openCount = refs.filter((ref) => getEdge(edges, ref) === EMPTY).length;
        if (onCount > clue || onCount + openCount < clue) cellConflicts.add(r + "," + c);
      }
    }

    const dotConflicts = new Set();
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const onCount = dotEdgeRefs(r, c, rows, cols).filter((ref) => getEdge(edges, ref) === ON).length;
        if (onCount > 2) dotConflicts.add(r + "," + c);
      }
    }

    return { cellConflicts, dotConflicts };
  }

  return {
    EMPTY,
    ON,
    MARKED,
    createEmptyEdges,
    cloneEdges,
    cellEdgeRefs,
    dotEdgeRefs,
    getEdge,
    setEdge,
    edgeKey,
    cycleEdgeValue,
    onCountAroundCell,
    deriveClueGrid,
    cloneClueGrid,
    getLoopStatus,
    checkWin,
    findConflicts
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SlitherlinkCore;
}
if (typeof window !== "undefined") {
  window.SlitherlinkCore = SlitherlinkCore;
}
