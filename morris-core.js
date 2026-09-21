// morris-core.js
// Dependency-free rules engine for Nine Men's Morris (Mühle), standard
// rules with the common "flying" endgame rule included. Mirrors the
// separation of concerns in checkers-core.js/go-core.js: rules only, no
// DOM/UI.
//
// Board: 24 points arranged as three concentric squares (rings 0=outer,
// 1=middle, 2=inner) of 8 points each, indexed ring*8+pos where pos 0-7
// goes clockwise from the top-left corner (0=TL corner, 1=top-mid,
// 2=TR corner, 3=right-mid, 4=BR corner, 5=bottom-mid, 6=BL corner,
// 7=left-mid). Points slide-connect to their neighbours within the same
// ring, and the four "mid" points (odd pos) additionally connect
// radially to the corresponding point on the adjacent ring - the
// standard board, with no corner-to-corner diagonals.
//
// Game has two phases per player, based on how many of their 9 pieces
// are still off the board: while any remain, each turn places one;
// once all 9 have been placed, each turn instead moves one already on
// the board to an adjacent empty point - or, once reduced to exactly 3
// pieces on the board, to ANY empty point ("flying").
//
// Forming a mill (three in a row along a drawn line) with the
// placed/moved piece lets the mover remove one opposing piece from the
// board - one that isn't itself part of an opponent mill, unless every
// opposing piece is in a mill. Since that removal is an integral part of
// the same turn, each legal "move" already bundles the resulting
// removal choice (or none) as a single atomic action, the same way
// checkers-core.js bundles a whole mandatory-capture chain into one move.

const MorrisCore = (function () {
  const TOTAL_POINTS = 24;
  const PIECES_PER_PLAYER = 9;

  function idx(ring, pos) {
    return ring * 8 + pos;
  }

  function buildAdjacency() {
    const adj = [];
    for (let i = 0; i < TOTAL_POINTS; i++) adj.push([]);
    for (let ring = 0; ring < 3; ring++) {
      for (let pos = 0; pos < 8; pos++) {
        const i = idx(ring, pos);
        adj[i].push(idx(ring, (pos + 1) % 8));
        adj[i].push(idx(ring, (pos + 7) % 8));
        if (pos % 2 === 1) {
          if (ring > 0) adj[i].push(idx(ring - 1, pos));
          if (ring < 2) adj[i].push(idx(ring + 1, pos));
        }
      }
    }
    return adj;
  }

  function buildMills() {
    const mills = [];
    for (let ring = 0; ring < 3; ring++) {
      for (let side = 0; side < 4; side++) {
        const a = side * 2, b = (side * 2 + 1) % 8, c = (side * 2 + 2) % 8;
        mills.push([idx(ring, a), idx(ring, b), idx(ring, c)]);
      }
    }
    for (let pos = 1; pos < 8; pos += 2) {
      mills.push([idx(0, pos), idx(1, pos), idx(2, pos)]);
    }
    return mills;
  }

  const ADJACENCY = buildAdjacency();
  const MILLS = buildMills();
  // Point -> list of mills it participates in, precomputed for speed.
  const MILLS_BY_POINT = (function () {
    const byPoint = [];
    for (let i = 0; i < TOTAL_POINTS; i++) byPoint.push([]);
    MILLS.forEach((mill) => mill.forEach((p) => byPoint[p].push(mill)));
    return byPoint;
  })();

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialState() {
    return {
      board: new Array(TOTAL_POINTS).fill(null),
      toPlace: { b: PIECES_PER_PLAYER, w: PIECES_PER_PLAYER }
    };
  }

  function cloneState(state) {
    return {
      board: state.board.slice(),
      toPlace: { b: state.toPlace.b, w: state.toPlace.w }
    };
  }

  function countOnBoard(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) n++;
    return n;
  }

  function formsMillAt(board, color, pointIdx) {
    return MILLS_BY_POINT[pointIdx].some((mill) => mill.every((p) => board[p] === color));
  }

  function isInAnyMill(board, color, pointIdx) {
    return formsMillAt(board, color, pointIdx);
  }

  // Which of `color`'s pieces the opponent may remove after milling:
  // any piece not currently part of one of `color`'s own mills, unless
  // every one of `color`'s pieces is in a mill (then all are eligible).
  function getRemovablePieces(board, color) {
    const all = [];
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) all.push(i);
    const free = all.filter((i) => !isInAnyMill(board, color, i));
    return free.length ? free : all;
  }

  function phaseFor(state, color) {
    if (state.toPlace[color] > 0) return "place";
    return countOnBoard(state.board, color) <= 3 ? "fly" : "move";
  }

  // Every legal move for `color`, each a single atomic action:
  // { type: "place"|"move", from?, to, remove: pointIdx|null }
  function getLegalMoves(state, color) {
    const phase = phaseFor(state, color);
    const baseMoves = [];

    if (phase === "place") {
      for (let i = 0; i < TOTAL_POINTS; i++) {
        if (!state.board[i]) baseMoves.push({ type: "place", to: i });
      }
    } else {
      for (let i = 0; i < TOTAL_POINTS; i++) {
        if (state.board[i] !== color) continue;
        if (phase === "fly") {
          for (let j = 0; j < TOTAL_POINTS; j++) {
            if (!state.board[j]) baseMoves.push({ type: "move", from: i, to: j });
          }
        } else {
          for (const j of ADJACENCY[i]) {
            if (!state.board[j]) baseMoves.push({ type: "move", from: i, to: j });
          }
        }
      }
    }

    const opponent = otherColor(color);
    const moves = [];
    for (const bm of baseMoves) {
      const testBoard = state.board.slice();
      if (bm.type === "move") testBoard[bm.from] = null;
      testBoard[bm.to] = color;
      if (formsMillAt(testBoard, color, bm.to) && countOnBoard(testBoard, opponent) > 0) {
        const removable = getRemovablePieces(testBoard, opponent);
        removable.forEach((r) => moves.push(Object.assign({}, bm, { remove: r })));
      } else {
        moves.push(Object.assign({}, bm, { remove: null }));
      }
    }
    return moves;
  }

  function applyMove(state, color, move) {
    const newState = cloneState(state);
    if (move.type === "place") {
      newState.toPlace[color] -= 1;
    } else {
      newState.board[move.from] = null;
    }
    newState.board[move.to] = color;
    if (move.remove !== null && move.remove !== undefined) {
      newState.board[move.remove] = null;
    }
    return newState;
  }

  // { status: "normal" | "reduced" | "blocked", winner: "b" | "w" | null }
  function detectGameEnd(state, colorToMove) {
    const onBoard = countOnBoard(state.board, colorToMove);
    if (state.toPlace[colorToMove] === 0 && onBoard <= 2) {
      return { status: "reduced", winner: otherColor(colorToMove) };
    }
    if (getLegalMoves(state, colorToMove).length === 0) {
      return { status: "blocked", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    TOTAL_POINTS,
    PIECES_PER_PLAYER,
    ADJACENCY,
    MILLS,
    idx,
    otherColor,
    createInitialState,
    cloneState,
    countOnBoard,
    formsMillAt,
    getRemovablePieces,
    phaseFor,
    getLegalMoves,
    applyMove,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MorrisCore;
}
if (typeof window !== "undefined") {
  window.MorrisCore = MorrisCore;
}
