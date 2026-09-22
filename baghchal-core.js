// baghchal-core.js
// Dependency-free rules engine for Bagh-Chal ("Tigers and Goats"), the
// traditional Nepali hunt game. Mirrors the separation of concerns used
// throughout this app (fanorona-core.js/hnefatafl-core.js): rules only,
// no DOM/UI.
//
// Board: 25 points in a 5x5 grid, indexed r*5+c (r,c 0..4). Every point
// connects orthogonally to its in-bounds neighbors. Diagonal connections
// exist only at "strong" points - where (r+c) is even - which connect
// diagonally to all of their in-bounds diagonal neighbors; "weak" points
// ((r+c) odd) have no diagonal connections at all. This is exactly the
// same adjacency rule fanorona-core.js uses (verified there against
// published sources for the general "tetrakis square tiling" pattern),
// and it produces the traditional alquerque-style lattice of lines and
// triangles Bagh-Chal is played on: the four corners and the center are
// full 8-direction hubs, the four edge-midpoints have some diagonals,
// and the remaining points are orthogonal-only. Diagonal steps never
// change the parity of (r+c) (both coordinates change by 1), so this
// graph is well-defined and symmetric (see fanorona-core.js's header
// for the same proof, which applies unchanged here).
//
// Pieces: 4 tigers (bagh) start on the board's four corners; 20 goats
// (bakhera) start off the board and are placed one at a time.
//
// Two phases:
//  - "placement": the goat player places one new goat per turn on any
//    empty point. The tiger player never places anything - tigers can
//    already move and capture from turn 1. Turns strictly alternate
//    (goat places, then tiger moves), so this phase lasts exactly 40
//    plies (20 goat placements interleaved with 20 tiger turns).
//  - "movement": once all 20 goats are placed, both sides just slide
//    one of their own pieces, one step, along a connecting line to an
//    adjacent empty point.
//
// Capture: a tiger adjacent to a goat may jump over it in a straight
// line (following one of the board's real connections) to the empty
// point immediately beyond, removing the goat. This engine implements
// capture as OPTIONAL, not mandatory - a documented choice, since real
// Bagh-Chal rulesets disagree on this (some regional/family variants
// require capturing whenever possible, but "optional capture" is the
// more common ruleset in modern play and in most published rules pages
// and apps) - see baghchal-rules.html for the same note to players.
//
// Win conditions: tigers win by capturing 5 goats in total (the
// standard published threshold). Goats win by trapping all 4 tigers so
// that the tiger to move has no legal move (slide or capture) at all.
// As a safety net matching every other asymmetric game in this app,
// a side with literally no legal move on its turn (of any kind) simply
// loses - which for goats can only happen in the rare movement-phase
// case where every goat is fully blocked.

const BaghChalCore = (function () {
  const ROWS = 5;
  const COLS = 5;
  const TOTAL_POINTS = ROWS * COLS;
  const TOTAL_GOATS = 20;
  const CAPTURE_TARGET = 5;
  const CORNERS = [idx(0, 0), idx(0, COLS - 1), idx(ROWS - 1, 0), idx(ROWS - 1, COLS - 1)];

  function idx(r, c) {
    return r * COLS + c;
  }
  function rowOf(i) {
    return Math.floor(i / COLS);
  }
  function colOf(i) {
    return i % COLS;
  }
  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }
  function isStrong(r, c) {
    return (r + c) % 2 === 0;
  }

  // 8 directions, ordered as opposite pairs (only used internally to
  // build the jump table - callers never need direction indices).
  const DIRS = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
    { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: -1, dc: -1 }, { dr: 1, dc: 1 },
    { dr: -1, dc: 1 }, { dr: 1, dc: -1 }
  ];

  // Precomputed per-point neighbor list: [{ to, dir }, ...].
  function buildNeighbors() {
    const table = [];
    for (let i = 0; i < TOTAL_POINTS; i++) table.push([]);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = idx(r, c);
        const strong = isStrong(r, c);
        DIRS.forEach((d, dirIndex) => {
          const isDiagonal = dirIndex >= 4;
          if (isDiagonal && !strong) return;
          const nr = r + d.dr, nc = c + d.dc;
          if (!inBounds(nr, nc)) return;
          table[i].push({ to: idx(nr, nc), dir: dirIndex });
        });
      }
    }
    return table;
  }

  const NEIGHBORS = buildNeighbors();

  // Precomputed jump table for captures: JUMPS[i] = [{ mid, landing }]
  // for every straight-line hop of exactly two board connections in the
  // same direction starting at i. A jump only exists where both the
  // i->mid and mid->landing edges are real board connections in that
  // same direction, which the NEIGHBORS table already encodes.
  function buildJumps() {
    const table = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const jumps = [];
      NEIGHBORS[i].forEach(({ to: mid, dir }) => {
        const landingEntry = NEIGHBORS[mid].find((n) => n.dir === dir);
        if (landingEntry) jumps.push({ mid, landing: landingEntry.to });
      });
      table.push(jumps);
    }
    return table;
  }

  const JUMPS = buildJumps();

  function otherPlayer(player) {
    return player === "tiger" ? "goat" : "tiger";
  }

  function createInitialBoard() {
    const board = new Array(TOTAL_POINTS).fill(null);
    CORNERS.forEach((i) => { board[i] = "tiger"; });
    return board;
  }

  function createInitialState() {
    return {
      board: createInitialBoard(),
      phase: "placement",       // "placement" | "movement"
      placedGoats: 0,
      capturedGoats: 0,
      currentPlayer: "goat",    // goats place first
      gameOver: false,
      winner: null,
      winReason: null           // "captures" | "trapped" | "no-moves"
    };
  }

  function cloneState(state) {
    return {
      board: state.board.slice(),
      phase: state.phase,
      placedGoats: state.placedGoats,
      capturedGoats: state.capturedGoats,
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner,
      winReason: state.winReason
    };
  }

  function countPieces(board, player) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === player) n++;
    return n;
  }

  // Every legal move for `player`, independent of whose turn it
  // actually is in `state` (so the AI/evaluator can probe either side's
  // mobility at any position). Shapes:
  //   { type: "place", to }
  //   { type: "move", from, to }
  //   { type: "capture", from, to, captured: [midIndex] }
  // For tigers, capturing moves and plain moves are both returned
  // together (capture is optional - see file header).
  function getLegalMoves(state, player) {
    const board = state.board;
    const moves = [];

    if (player === "goat" && state.phase === "placement") {
      for (let i = 0; i < TOTAL_POINTS; i++) {
        if (board[i] === null) moves.push({ type: "place", to: i });
      }
      return moves;
    }

    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== player) continue;
      if (player === "tiger") {
        JUMPS[i].forEach(({ mid, landing }) => {
          if (board[mid] === "goat" && board[landing] === null) {
            moves.push({ type: "capture", from: i, to: landing, captured: [mid] });
          }
        });
      }
      NEIGHBORS[i].forEach(({ to }) => {
        if (board[to] === null) moves.push({ type: "move", from: i, to });
      });
    }
    return moves;
  }

  function hasAnyCapture(state, player) {
    if (player !== "tiger") return false;
    const board = state.board;
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== "tiger") continue;
      if (JUMPS[i].some(({ mid, landing }) => board[mid] === "goat" && board[landing] === null)) return true;
    }
    return false;
  }

  // Applies a legal move (assumed already validated by the caller via
  // getLegalMoves) and returns the resulting state, including any
  // captures, phase transition, and win condition.
  function applyMove(state, player, move) {
    const next = cloneState(state);
    const board = next.board;

    if (move.type === "place") {
      board[move.to] = "goat";
      next.placedGoats++;
      if (next.placedGoats >= TOTAL_GOATS) next.phase = "movement";
    } else if (move.type === "move") {
      board[move.to] = board[move.from];
      board[move.from] = null;
    } else if (move.type === "capture") {
      board[move.to] = board[move.from];
      board[move.from] = null;
      (move.captured || []).forEach((i) => { board[i] = null; });
      next.capturedGoats++;
    }

    const opponent = otherPlayer(player);
    next.currentPlayer = opponent;

    let gameOver = false;
    let winner = null;
    let winReason = null;

    if (next.capturedGoats >= CAPTURE_TARGET) {
      gameOver = true;
      winner = "tiger";
      winReason = "captures";
    }

    if (!gameOver) {
      const opponentMoves = getLegalMoves(next, opponent);
      if (!opponentMoves.length) {
        gameOver = true;
        winner = player;
        winReason = opponent === "tiger" ? "trapped" : "no-moves";
      }
    }

    next.gameOver = gameOver;
    next.winner = winner;
    next.winReason = winReason;
    return next;
  }

  return {
    ROWS,
    COLS,
    TOTAL_POINTS,
    TOTAL_GOATS,
    CAPTURE_TARGET,
    CORNERS,
    DIRS,
    NEIGHBORS,
    JUMPS,
    idx,
    rowOf,
    colOf,
    inBounds,
    isStrong,
    otherPlayer,
    createInitialBoard,
    createInitialState,
    cloneState,
    countPieces,
    getLegalMoves,
    hasAnyCapture,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BaghChalCore;
}
if (typeof window !== "undefined") {
  window.BaghChalCore = BaghChalCore;
}
