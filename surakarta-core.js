// surakarta-core.js
// Dependency-free rules engine for Surakarta, the Indonesian board game
// named after the city of Surakarta (Solo) on Java. Mirrors the
// separation of concerns in fanorona-core.js/checkers-core.js: rules
// only, no DOM/UI. Chrome 61 (Tolino) safe: no optional chaining,
// Array.flat, Object.fromEntries, etc. - see the project-wide
// compatibility notes in style.css's header comments for the full list.
//
// ============================================================================
// BOARD GEOMETRY - READ THIS BEFORE TOUCHING THE LOOP-TRACK CODE BELOW
// ============================================================================
// The board is a plain 6x6 grid of points, indexed r*6+c (r,c both 0-5).
// Every point connects to its 8 neighbours (orthogonal + diagonal) for
// ordinary one-step movement.
//
// The loop tracks are the game's namesake mechanic and the one part of
// this file most worth double-checking against a reference diagram if
// you have one handy. What we implemented, precisely:
//
//   - Only 4 lines on the board carry a loop track at all: row index 1
//     (the "2nd row" in 1-indexed board terms), row index 4 (the "5th
//     row"), column index 1 (the "2nd column"), and column index 4 (the
//     "5th column"). Every OTHER row/column (0, 2, 3, 5) simply ends at
//     the board edge with nothing beyond it.
//   - Each of these 4 special lines has a loop-track connector at BOTH
//     of its ends, so there are 8 "ends" total (row1-left, row1-right,
//     row4-left, row4-right, col1-top, col1-bottom, col4-top,
//     col4-bottom). We pair these 8 ends into 4 arcs, one per corner of
//     the board, pairing each end with the other special line's end
//     that is physically nearest the same corner:
//       * top-left corner:     row1-left  <-> col1-top
//       * top-right corner:    row1-right <-> col4-top
//       * bottom-left corner:  row4-left  <-> col1-bottom
//       * bottom-right corner: row4-right <-> col4-bottom
//     That's 4 physical corner arcs. Each is usable in either direction
//     (sliding off row 1 to the left re-enters going down column 1, and
//     symmetrically sliding off column 1 going up re-enters going right
//     along row 1) - so as 8 one-directional transitions, matching the
//     traditional board's commonly-cited "8 arcs" description, this
//     engine's LOOP_EXITS table below has exactly 8 entries, one per
//     directional transition.
//   - A piece sliding off row 1 or row 4 diagonally, or off any
//     non-special row/column, simply runs off the edge with no loop:
//     no capture is possible along that line. This matches the real
//     board, where the loop arcs are physically attached only to the
//     four special straight lines, not to diagonals or to the other
//     rows/columns - so diagonal *captures* never occur here even
//     though diagonal *quiet moves* are allowed per this app's movement
//     rule (see below). This was a deliberate, documented choice made
//     because the task's own geometry description ties the loops
//     exclusively to "row/column 2 and 5"; a human reviewer with a
//     printed board in hand should double check the 4 corner pairings
//     above against it, since this is the one piece of this
//     implementation that is a best-effort reconstruction rather than
//     a verified transcription.
//
// MOVEMENT vs CAPTURE (per this app's specification - also worth noting
// since it differs from some traditional descriptions of Surakarta,
// which only allow orthogonal movement): a quiet move is a single step
// to an adjacent empty point in any of the 8 directions (orthogonal or
// diagonal) and NEVER captures, no matter what. A capturing move is a
// completely separate action: a piece slides along one fixed straight
// line (one of its 8 directions) for as many squares as the line and
// its loop connections allow, jumping over every piece - friendly or
// enemy - along the way without effect, until it has used at least one
// loop-arc transition AND the next occupied square it reaches after
// that is an enemy piece; that piece is captured and the slider lands
// on its square. If the line runs off the board with no loop (a
// non-special row/column, or any diagonal), or if it loops back onto a
// square it has already passed through without ever meeting a
// qualifying enemy piece, no capture exists along that line. Capturing
// is NOT mandatory here (unlike Fanorona): a player with an available
// capture may still choose to play a quiet move instead, since the task
// spec doesn't say otherwise and traditional Surakarta is normally
// described as optional-capture too.
//
// STARTING POSITION: each side's 12 stones fill the two rows nearest
// their own edge. Black is placed on rows 0-1 (nearest the "top"),
// White on rows 4-5 (nearest the "bottom"); rows 2-3 start empty. Black
// moves first - an arbitrary but documented choice, matching the
// majority convention used by the other 2-player games in this
// collection (Fanorona's White-first start is the one deliberate,
// separately-documented exception).
// ============================================================================

const SurakartaCore = (function () {
  const SIZE = 6;
  const TOTAL_POINTS = SIZE * SIZE;
  const PIECES_PER_PLAYER = 12;

  function idx(r, c) {
    return r * SIZE + c;
  }
  function rowOf(i) {
    return Math.floor(i / SIZE);
  }
  function colOf(i) {
    return i % SIZE;
  }
  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }
  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  // The 8 step directions for ordinary movement (and for the starting
  // direction of a capture-slide, which then follows the fixed line
  // this direction defines).
  const DIRS = [
    { dr: -1, dc: 0, name: "N" },
    { dr: 1, dc: 0, name: "S" },
    { dr: 0, dc: -1, name: "W" },
    { dr: 0, dc: 1, name: "E" },
    { dr: -1, dc: -1, name: "NW" },
    { dr: -1, dc: 1, name: "NE" },
    { dr: 1, dc: -1, name: "SW" },
    { dr: 1, dc: 1, name: "SE" }
  ];

  // The loop-track connectivity graph - see the header comment above for
  // the exact reasoning. Keyed by "r,c,dr,dc" describing the LAST point
  // still on the board and the direction being travelled when the slide
  // is about to step off the edge; the value says where it reappears and
  // in which direction it continues.
  function loopKey(r, c, dr, dc) {
    return r + "," + c + "," + dr + "," + dc;
  }

  const LOOP_EXITS = (function () {
    const table = {};
    function add(fromR, fromC, fromDr, fromDc, toR, toC, toDr, toDc) {
      table[loopKey(fromR, fromC, fromDr, fromDc)] = { r: toR, c: toC, dr: toDr, dc: toDc };
    }
    // Row 1 (2nd row), left end -> top-left corner -> column 1 (2nd
    // column), entering from above, heading down.
    add(1, 0, 0, -1, 0, 1, 1, 0);
    // Column 1, top end -> top-left corner -> row 1, entering from the
    // left, heading right (the reverse transition of the pair above).
    add(0, 1, -1, 0, 1, 0, 0, 1);
    // Row 1, right end -> top-right corner -> column 4 (5th column),
    // entering from above, heading down.
    add(1, 5, 0, 1, 0, 4, 1, 0);
    // Column 4, top end -> top-right corner -> row 1, entering from the
    // right, heading left.
    add(0, 4, -1, 0, 1, 5, 0, -1);
    // Row 4 (5th row), left end -> bottom-left corner -> column 1,
    // entering from below, heading up.
    add(4, 0, 0, -1, 5, 1, -1, 0);
    // Column 1, bottom end -> bottom-left corner -> row 4, entering from
    // the left, heading right.
    add(5, 1, 1, 0, 4, 0, 0, 1);
    // Row 4, right end -> bottom-right corner -> column 4, entering from
    // below, heading up.
    add(4, 5, 0, 1, 5, 4, -1, 0);
    // Column 4, bottom end -> bottom-right corner -> row 4, entering
    // from the right, heading left.
    add(5, 4, 1, 0, 4, 5, 0, -1);
    return table;
  })();

  // Black on rows 0-1, White on rows 4-5, rows 2-3 start empty - see
  // header comment for the (documented, arbitrary) choice of who's where
  // and who moves first.
  function createInitialBoard() {
    const board = new Array(TOTAL_POINTS).fill(null);
    for (let c = 0; c < SIZE; c++) {
      board[idx(0, c)] = "b";
      board[idx(1, c)] = "b";
      board[idx(4, c)] = "w";
      board[idx(5, c)] = "w";
    }
    return board;
  }

  function cloneBoard(board) {
    return board.slice();
  }

  function countPieces(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) n++;
    return n;
  }

  // Every quiet (non-capturing) move for `color`: a single step to an
  // adjacent empty point, in any of the 8 directions. Never captures,
  // ever - see header comment.
  function getQuietMoves(board, color) {
    const moves = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== color) continue;
      const r = rowOf(i), c = colOf(i);
      DIRS.forEach((d) => {
        const nr = r + d.dr, nc = c + d.dc;
        if (!inBounds(nr, nc)) return;
        const to = idx(nr, nc);
        if (board[to] === null) {
          moves.push({ from: i, to, type: "quiet", captured: [] });
        }
      });
    }
    return moves;
  }

  // Simulates a capture-slide starting at (fromR, fromC) heading
  // (dr, dc). Returns { to, captured: [to], loopsUsed } on success, or
  // null if this direction yields no capture (dead end with no loop, or
  // the path cycles forever without ever meeting a qualifying enemy
  // piece).
  //
  // Cycle detection tracks (square, direction) TRAVEL STATES, not just
  // squares. That distinction matters here: row 1 and column 1 (and
  // row 4/column 4) physically cross the board at one shared point, so
  // a slide that goes off row 1 and loops back down column 1 legitimately
  // passes back through that single crossing point once - that's not a
  // cycle, just the two special lines meeting where they always do.
  // Since the (square, direction) transition graph is fully
  // deterministic (every state has exactly one successor state), a
  // state can only ever repeat if the path has looped back on itself
  // completely - so this check has no false positives, and the
  // MAX_STEPS cap below is just a defensive backstop, never expected to
  // actually trigger on a 36-point board with only 4 corner arcs.
  function slideForCapture(board, fromR, fromC, dr, dc, color) {
    const enemy = otherColor(color);
    let r = fromR, c = fromC, curDr = dr, curDc = dc;
    let loopsUsed = 0;
    const visitedStates = new Set();
    const MAX_STEPS = 8 * TOTAL_POINTS;

    for (let step = 0; step < MAX_STEPS; step++) {
      const stateKey = r + "," + c + "," + curDr + "," + curDc;
      if (visitedStates.has(stateKey)) return null; // truly repeating: dead loop, no capture
      visitedStates.add(stateKey);

      const nr = r + curDr, nc = c + curDc;
      if (inBounds(nr, nc)) {
        const occupant = board[idx(nr, nc)];
        if (occupant !== null) {
          if (occupant === enemy && loopsUsed >= 1) {
            return { to: idx(nr, nc), captured: [idx(nr, nc)], loopsUsed };
          }
          // Friendly piece, or an enemy met before any loop was used:
          // jumped over transparently either way - see header comment.
        }
        r = nr; c = nc;
        continue;
      }
      // Off the board: only a loop-track transition can continue this
      // slide; anything else is a dead end for this direction.
      const transition = LOOP_EXITS[loopKey(r, c, curDr, curDc)];
      if (!transition) return null;
      loopsUsed++;
      r = transition.r; c = transition.c; curDr = transition.dr; curDc = transition.dc;
    }
    return null;
  }

  // Every capturing move available to the piece at `atIndex` - at most
  // one per direction, since a direction's slide stops at (and
  // captures) the first qualifying enemy it finds.
  function getCaptureMovesForPiece(board, atIndex, color) {
    const r = rowOf(atIndex), c = colOf(atIndex);
    const results = [];
    DIRS.forEach((d) => {
      const found = slideForCapture(board, r, c, d.dr, d.dc, color);
      if (found) {
        results.push({ from: atIndex, to: found.to, type: "capture", captured: found.captured, dirName: d.name, loopsUsed: found.loopsUsed });
      }
    });
    return results;
  }

  // Every capturing move for `color`, anywhere on the board.
  function getCaptureMoves(board, color) {
    const moves = [];
    for (let i = 0; i < TOTAL_POINTS; i++) {
      if (board[i] !== color) continue;
      getCaptureMovesForPiece(board, i, color).forEach((m) => moves.push(m));
    }
    return moves;
  }

  // All legal moves for `color`: quiet moves and capturing moves both,
  // since capturing is optional here (see header comment) rather than
  // mandatory the way it is in Fanorona/checkers.
  function getLegalMoves(board, color) {
    return getQuietMoves(board, color).concat(getCaptureMoves(board, color));
  }

  // Applies one move (quiet or capture) to a fresh copy of the board.
  function applyMove(board, move) {
    const next = cloneBoard(board);
    const piece = next[move.from];
    next[move.from] = null;
    (move.captured || []).forEach((i) => { next[i] = null; });
    next[move.to] = piece;
    return next;
  }

  // { status: "normal" | "no-pieces" | "no-moves", winner: "b" | "w" | null }
  function detectGameEnd(board, colorToMove) {
    if (countPieces(board, colorToMove) === 0) {
      return { status: "no-pieces", winner: otherColor(colorToMove) };
    }
    if (countPieces(board, otherColor(colorToMove)) === 0) {
      return { status: "no-pieces", winner: colorToMove };
    }
    if (getLegalMoves(board, colorToMove).length === 0) {
      return { status: "no-moves", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    SIZE,
    TOTAL_POINTS,
    PIECES_PER_PLAYER,
    DIRS,
    LOOP_EXITS,
    idx,
    rowOf,
    colOf,
    inBounds,
    otherColor,
    loopKey,
    createInitialBoard,
    cloneBoard,
    countPieces,
    getQuietMoves,
    getCaptureMoves,
    getCaptureMovesForPiece,
    getLegalMoves,
    slideForCapture,
    applyMove,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SurakartaCore;
}
if (typeof window !== "undefined") {
  window.SurakartaCore = SurakartaCore;
}
