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

// Task 213: variant "twelve" (state.variant; a state without it is Nine
// Men's Morris) - Twelve Men's Morris: 12 pieces each, the same three
// squares plus the four corner diagonals, which are lines too (a mill
// along a diagonal counts). If the board is full when the last piece has
// been placed, the game is a draw.

const MorrisCore = (function () {
  const TOTAL_POINTS = 24;
  const PIECES_PER_PLAYER = 9;
  const PIECES_TWELVE = 12;

  function idx(ring, pos) {
    return ring * 8 + pos;
  }

  function buildAdjacency(diagonals) {
    const adj = [];
    for (let i = 0; i < TOTAL_POINTS; i++) adj.push([]);
    for (let ring = 0; ring < 3; ring++) {
      for (let pos = 0; pos < 8; pos++) {
        const i = idx(ring, pos);
        adj[i].push(idx(ring, (pos + 1) % 8));
        adj[i].push(idx(ring, (pos + 7) % 8));
        if (pos % 2 === 1 || diagonals) {
          if (ring > 0) adj[i].push(idx(ring - 1, pos));
          if (ring < 2) adj[i].push(idx(ring + 1, pos));
        }
      }
    }
    return adj;
  }

  function buildMills(diagonals) {
    const mills = [];
    for (let ring = 0; ring < 3; ring++) {
      for (let side = 0; side < 4; side++) {
        const a = side * 2, b = (side * 2 + 1) % 8, c = (side * 2 + 2) % 8;
        mills.push([idx(ring, a), idx(ring, b), idx(ring, c)]);
      }
    }
    for (let pos = diagonals ? 0 : 1; pos < 8; pos += diagonals ? 1 : 2) {
      mills.push([idx(0, pos), idx(1, pos), idx(2, pos)]);
    }
    return mills;
  }

  function millsByPoint(mills) {
    const byPoint = [];
    for (let i = 0; i < TOTAL_POINTS; i++) byPoint.push([]);
    mills.forEach((mill) => mill.forEach((p) => byPoint[p].push(mill)));
    return byPoint;
  }

  const ADJACENCY = buildAdjacency(false);
  const MILLS = buildMills(false);
  // Point -> list of mills it participates in, precomputed for speed.
  const MILLS_BY_POINT = millsByPoint(MILLS);
  const ADJACENCY_TWELVE = buildAdjacency(true);
  const MILLS_TWELVE = buildMills(true);
  const MILLS_BY_POINT_TWELVE = millsByPoint(MILLS_TWELVE);

  function isTwelve(state) {
    return !!state && state.variant === "twelve";
  }
  function adjacencyOf(state) { return isTwelve(state) ? ADJACENCY_TWELVE : ADJACENCY; }
  function millsOf(state) { return isTwelve(state) ? MILLS_TWELVE : MILLS; }
  function millsByPointOf(state) { return isTwelve(state) ? MILLS_BY_POINT_TWELVE : MILLS_BY_POINT; }

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialState(variant) {
    const n = variant === "twelve" ? PIECES_TWELVE : PIECES_PER_PLAYER;
    const s = {
      board: new Array(TOTAL_POINTS).fill(null),
      toPlace: { b: n, w: n }
    };
    if (variant === "twelve") s.variant = "twelve";
    return s;
  }

  function cloneState(state) {
    const s = {
      board: state.board.slice(),
      toPlace: { b: state.toPlace.b, w: state.toPlace.w }
    };
    if (isTwelve(state)) s.variant = "twelve";
    return s;
  }

  function countOnBoard(board, color) {
    let n = 0;
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) n++;
    return n;
  }

  // `variantState` (optional): a state whose variant decides the lines.
  function formsMillAt(board, color, pointIdx, variantState) {
    return millsByPointOf(variantState)[pointIdx].some((mill) => mill.every((p) => board[p] === color));
  }

  function isInAnyMill(board, color, pointIdx, variantState) {
    return formsMillAt(board, color, pointIdx, variantState);
  }

  // Which of `color`'s pieces the opponent may remove after milling:
  // any piece not currently part of one of `color`'s own mills, unless
  // every one of `color`'s pieces is in a mill (then all are eligible).
  function getRemovablePieces(board, color, variantState) {
    const all = [];
    for (let i = 0; i < TOTAL_POINTS; i++) if (board[i] === color) all.push(i);
    const free = all.filter((i) => !isInAnyMill(board, color, i, variantState));
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
          for (const j of adjacencyOf(state)[i]) {
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
      if (formsMillAt(testBoard, color, bm.to, state) && countOnBoard(testBoard, opponent) > 0) {
        const removable = getRemovablePieces(testBoard, opponent, state);
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

  // { status: "normal" | "reduced" | "blocked" | "full", winner: "b" | "w" | null }
  function detectGameEnd(state, colorToMove) {
    const onBoard = countOnBoard(state.board, colorToMove);
    // Twelve Men's Morris: all 24 points taken after placing - a draw.
    if (isTwelve(state) && state.toPlace.b === 0 && state.toPlace.w === 0 &&
        countOnBoard(state.board, "b") + countOnBoard(state.board, "w") === TOTAL_POINTS) {
      return { status: "full", winner: null };
    }
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
    PIECES_TWELVE,
    isTwelve,
    adjacencyOf,
    millsOf,
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
