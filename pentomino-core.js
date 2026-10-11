// pentomino-core.js
// "Pentomino Puzzle" (Legepuzzle) - lay pieces of five squares into a
// rectangle. Dependency-free, no DOM.
//
// The 12 pieces carry their usual letters F I L N P T U V W X Y Z. A
// board is `rows` x `cols` (rows >= cols, so it stands upright on a
// screen); cell i = r * cols + c. Pieces may be turned and flipped.
//
// Two modes:
//   free     - lay the given pieces until the rectangle is full; any
//              filling counts (6 x 10 alone has thousands of solutions).
//              Easy: 5 pieces in 5 x 5, Medium: 8 pieces in 8 x 5, Hard:
//              all 12 in 10 x 6, 12 x 5, 15 x 4 or 20 x 3.
//   fixed    - "start pieces given": on 10 x 6 some pieces lie fixed and
//              the rest must fit around them; exactly one solution. Easy:
//              3 pieces to lay, Medium: 5, Hard: 7.
// A puzzle: { mode, level, rows, cols, pieces: [letters to use],
//             givens: [{ piece, cells }] }.

const PentominoCore = (function () {
  const SHAPES = {
    F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
    I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
    N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
    P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
    T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
    U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
    V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
    W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
    X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
    Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
    Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]
  };
  const LETTERS = Object.keys(SHAPES);
  const FREE_SIZES = { easy: [[5, 5]], medium: [[8, 5]], hard: [[10, 6], [12, 5], [15, 4], [20, 3]] };
  const FIXED_FREE = { easy: 3, medium: 5, hard: 7 };

  // Shift to the top left corner and sort, so equal shapes compare equal.
  function normalize(cells) {
    const minR = Math.min.apply(null, cells.map((p) => p[0]));
    const minC = Math.min.apply(null, cells.map((p) => p[1]));
    return cells.map((p) => [p[0] - minR, p[1] - minC]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  }

  // The shape turned `rot` quarter turns clockwise, flipped first when
  // `mirror` is set.
  function transform(letter, rot, mirror) {
    let cells = SHAPES[letter].map((p) => [p[0], mirror ? -p[1] : p[1]]);
    for (let k = 0; k < ((rot % 4) + 4) % 4; k++) cells = cells.map((p) => [p[1], -p[0]]);
    return normalize(cells);
  }

  // The distinct orientations of every piece (1 to 8).
  const ORIENTS = {};
  LETTERS.forEach((L) => {
    const seen = {};
    ORIENTS[L] = [];
    for (let m = 0; m < 2; m++) {
      for (let r = 0; r < 4; r++) {
        const cells = transform(L, r, m === 1);
        const key = JSON.stringify(cells);
        if (!seen[key]) { seen[key] = true; ORIENTS[L].push(cells); }
      }
    }
  });

  function shuffle(arr, random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // The cells a shape covers when its cell `anchor` (index into the
  // normalized shape) lies on cell `at`, or null when it leaves the board.
  function cellsAt(rows, cols, shape, anchor, at) {
    const r0 = Math.floor(at / cols) - shape[anchor][0], c0 = at % cols - shape[anchor][1];
    const out = [];
    for (const p of shape) {
      const r = r0 + p[0], c = c0 + p[1];
      if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
      out.push(r * cols + c);
    }
    return out;
  }

  // Exact cover by backtracking: the first empty cell (reading order) is
  // filled by every unused piece in every orientation whose first cell
  // lands there. Calls onSolution(placements) for each solution and stops
  // when it returns true. `board` holds a letter per filled cell or null.
  // `budget` (optional) caps the number of steps; search() returns true
  // when it ran out before finishing.
  function search(rows, cols, board, letters, random, onSolution, budget) {
    const used = {};
    const placed = [];
    let stop = false, steps = 0, aborted = false;
    const orientsOf = (L) => (random ? shuffle(ORIENTS[L], random) : ORIENTS[L]);
    function rec() {
      if (stop) return;
      if (budget && ++steps > budget) { stop = true; aborted = true; return; }
      const empty = board.indexOf(null);
      if (empty === -1) {
        if (onSolution(placed.slice())) stop = true;
        return;
      }
      const order = random ? shuffle(letters, random) : letters;
      for (const L of order) {
        if (used[L]) continue;
        for (const shape of orientsOf(L)) {
          const cells = cellsAt(rows, cols, shape, 0, empty);
          if (!cells || cells.some((i) => board[i] !== null)) continue;
          cells.forEach((i) => { board[i] = L; });
          used[L] = true;
          placed.push({ piece: L, cells });
          rec();
          placed.pop();
          used[L] = false;
          cells.forEach((i) => { board[i] = null; });
          if (stop) return;
        }
      }
    }
    rec();
    return aborted;
  }

  function emptyBoard(rows, cols, placements) {
    const board = new Array(rows * cols).fill(null);
    (placements || []).forEach((pl) => pl.cells.forEach((i) => { board[i] = pl.piece; }));
    return board;
  }

  // Number of ways to fill the board with `letters` around `placements`,
  // counting up to `limit`.
  function countSolutions(rows, cols, letters, placements, limit) {
    let n = 0;
    search(rows, cols, emptyBoard(rows, cols, placements), letters, null, () => ++n >= (limit || 2));
    return n;
  }

  // One way to fill the board (random when rng is given), or null. With
  // a step budget, undefined means "not found within the budget".
  function solve(rows, cols, letters, placements, rng, budget) {
    let found = null;
    const aborted = search(rows, cols, emptyBoard(rows, cols, placements), letters, rng || null, (s) => { found = s; return true; }, budget);
    return found || (aborted ? undefined : null);
  }

  function generatePuzzle(mode, level, opts, rng) {
    const random = rng || Math.random;
    const lv = FIXED_FREE[level] ? level : "easy";
    if (mode === "fixed") {
      for (let attempt = 0; attempt < 50; attempt++) {
        const sol = solve(10, 6, LETTERS, [], random);
        for (let t = 0; t < 30; t++) {
          const free = shuffle(LETTERS, random).slice(0, FIXED_FREE[lv]);
          const givens = sol.filter((pl) => free.indexOf(pl.piece) === -1);
          if (countSolutions(10, 6, free, givens, 2) === 1) {
            return { mode: "fixed", level: lv, rows: 10, cols: 6, pieces: LETTERS.slice(), givens, solution: sol };
          }
        }
      }
      return null;
    }
    const sizes = FREE_SIZES[lv];
    let size = sizes[0];
    if (lv === "hard" && opts && opts.size) size = sizes.find((s) => s[0] + "x" + s[1] === opts.size) || size;
    const need = size[0] * size[1] / 5;
    for (let attempt = 0; attempt < 200; attempt++) {
      const pieces = need === 12 ? LETTERS.slice() : shuffle(LETTERS, random).slice(0, need).sort();
      const sol = solve(size[0], size[1], pieces, [], random);
      if (sol) return { mode: "free", level: lv, rows: size[0], cols: size[1], pieces, givens: [], solution: sol };
    }
    return null;
  }

  // Is `cells` a legal place for piece `letter` on a board with the
  // placements so far (shape matches one orientation, cells free)?
  function fits(p, placements, cells) {
    const board = emptyBoard(p.rows, p.cols, p.givens.concat(placements));
    return cells.every((i) => i >= 0 && i < p.rows * p.cols && board[i] === null);
  }

  function isComplete(p, placements) {
    const board = emptyBoard(p.rows, p.cols, p.givens.concat(placements));
    return board.every((x) => x !== null) && placements.length + p.givens.length === p.pieces.length;
  }

  const HINT_BUDGET = 150000;

  // The hint: when the pieces laid so far still leave a way to fill the
  // board, the next piece of such a filling ({ kind: "place", piece,
  // cells }); otherwise the most recently laid piece that blocks it
  // ({ kind: "remove", piece }); { kind: "done" } when full. In the fixed
  // mode the filling is the one solution. In the free mode the search has
  // a step budget, so the hint never keeps a slow e-reader busy: a board
  // it can't complete within the budget counts as blocked.
  function findHint(p, placements) {
    if (isComplete(p, placements)) return { kind: "done" };
    if (p.mode === "fixed" && p.solution) {
      const key = (pl) => pl.piece + ":" + pl.cells.slice().sort((a, b) => a - b).join(",");
      const good = {};
      p.solution.forEach((pl) => { good[key(pl)] = true; });
      for (let i = placements.length - 1; i >= 0; i--) {
        if (!good[key(placements[i])]) return { kind: "remove", piece: placements[i].piece };
      }
      const next = p.solution.find((pl) => !p.givens.some((g) => g.piece === pl.piece) && !placements.some((x) => x.piece === pl.piece));
      return next ? { kind: "place", piece: next.piece, cells: next.cells } : { kind: "done" };
    }
    const left = (ps) => p.pieces.filter((L) => !p.givens.some((g) => g.piece === L) && !ps.some((x) => x.piece === L));
    for (let drop = 0; drop <= placements.length; drop++) {
      const keep = placements.slice(0, placements.length - drop);
      const sol = solve(p.rows, p.cols, left(keep), p.givens.concat(keep), null, HINT_BUDGET);
      if (!sol) continue;
      if (drop > 0) return { kind: "remove", piece: placements[placements.length - drop].piece };
      return { kind: "place", piece: sol[0].piece, cells: sol[0].cells };
    }
    return { kind: "none" };
  }

  return { SHAPES, LETTERS, ORIENTS, FREE_SIZES, FIXED_FREE, normalize, transform, cellsAt, countSolutions, solve, generatePuzzle, fits, isComplete, findHint, emptyBoard };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PentominoCore;
}
if (typeof window !== "undefined") {
  window.PentominoCore = PentominoCore;
}
