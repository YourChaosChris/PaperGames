// shogi-core.js
// Dependency-free rules engine for Shogi (Japanese Chess). Mirrors the
// separation of concerns in chess-core.js/xiangqi-core.js: rules only,
// no DOM/UI.
//
// Board: 9 rows (0-8) x 9 columns (0-8). White ("w"/Gote) starts on rows
// 0-2, Black ("b"/Sente) on rows 6-8 - Black moves first, as in real
// Shogi. A board cell is null or { color: 'b'|'w', type }, where `type`
// is one of K,R,B,G,S,N,L,P for an unpromoted piece or "+R","+B","+S",
// "+N","+L","+P" for a promoted one (King and Gold never promote).
//
// What makes Shogi distinct from the other games here is the drop
// rule: a captured piece switches to the capturing side, is demoted if
// it was promoted, and joins that player's "hand" - from there it can
// be dropped onto any empty square on a later turn instead of moving a
// piece already on the board. A handful of drop-specific restrictions
// exist purely to stop a dropped piece from being permanently stuck
// with no legal move ever again, plus one purely tactical one (a pawn
// drop may never deliver checkmate - see legalDrops below).

const ShogiCore = (function () {
  const SIZE = 9;
  const HAND_TYPES = ["P", "L", "N", "S", "G", "B", "R"];
  const PROMOTABLE = ["P", "L", "N", "S", "B", "R"]; // King and Gold never promote

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function forwardDir(color) {
    return color === "b" ? -1 : 1;
  }

  function baseType(type) {
    return type.charAt(0) === "+" ? type.slice(1) : type;
  }

  function isPromoted(type) {
    return type.charAt(0) === "+";
  }

  // Rows 0-2 for Black (moving toward row 0), rows 6-8 for White.
  function inPromotionZone(color, r) {
    return color === "b" ? r <= 2 : r >= 6;
  }

  function farthestRank(color) {
    return color === "b" ? 0 : 8;
  }

  function emptyHand() {
    const hand = {};
    HAND_TYPES.forEach((t) => { hand[t] = 0; });
    return hand;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    const backRank = ["L", "N", "S", "G", "K", "G", "S", "N", "L"];
    backRank.forEach((type, c) => {
      board[0][c] = { color: "w", type };
      board[8][c] = { color: "b", type };
    });
    board[1][1] = { color: "w", type: "R" };
    board[1][7] = { color: "w", type: "B" };
    board[7][1] = { color: "b", type: "B" };
    board[7][7] = { color: "b", type: "R" };
    for (let c = 0; c < SIZE; c++) {
      board[2][c] = { color: "w", type: "P" };
      board[6][c] = { color: "b", type: "P" };
    }
    return board;
  }

  function createInitialState() {
    return { board: createInitialBoard(), hands: { b: emptyHand(), w: emptyHand() } };
  }

  function cloneBoard(board) {
    return board.map((row) => row.map((cell) => (cell ? { color: cell.color, type: cell.type } : null)));
  }

  function cloneState(state) {
    return {
      board: cloneBoard(state.board),
      hands: { b: Object.assign({}, state.hands.b), w: Object.assign({}, state.hands.w) }
    };
  }

  function findKing(board, color) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = board[r][c];
        if (cell && cell.color === color && cell.type === "K") return { r, c };
      }
    }
    return null;
  }

  // Non-sliding offsets for a piece moving one step at a time.
  function stepOffsets(color, type) {
    const f = forwardDir(color);
    if (type === "K") {
      return [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    }
    if (type === "G" || type === "+P" || type === "+L" || type === "+N" || type === "+S") {
      return [[f, -1], [f, 0], [f, 1], [0, -1], [0, 1], [-f, 0]];
    }
    if (type === "S") {
      return [[f, -1], [f, 0], [f, 1], [-f, -1], [-f, 1]];
    }
    if (type === "P") {
      return [[f, 0]];
    }
    if (type === "N") {
      return [[2 * f, -1], [2 * f, 1]];
    }
    return null; // sliding piece, handled separately
  }

  // Sliding directions for rook/bishop and their promoted forms (Lance
  // also slides, but its single direction depends on color, so it's
  // handled inline in pieceMoves instead).
  function slideDirections(type) {
    if (type === "R") return [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (type === "B") return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return null;
  }

  function extraKingStepDirections(type) {
    if (type === "+R") return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    if (type === "+B") return [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return null;
  }

  // Pseudo-legal board moves for the piece at (r,c) - doesn't yet check
  // whether the move leaves the mover's own king in check, and doesn't
  // yet expand the promote/don't-promote choice (see legalMoves).
  function pieceMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const { color, type } = piece;
    const moves = [];
    const addIfOk = (tr, tc) => {
      if (!inBounds(tr, tc)) return;
      const target = board[tr][tc];
      if (target && target.color === color) return;
      moves.push({ from: [r, c], to: [tr, tc], captured: target });
    };
    const slide = (dr, dc) => {
      let tr = r + dr, tc = c + dc;
      while (inBounds(tr, tc)) {
        const target = board[tr][tc];
        if (!target) {
          moves.push({ from: [r, c], to: [tr, tc], captured: null });
        } else {
          if (target.color !== color) moves.push({ from: [r, c], to: [tr, tc], captured: target });
          break;
        }
        tr += dr; tc += dc;
      }
    };

    const base = baseType(type);
    if (base === "L" && !isPromoted(type)) {
      slide(forwardDir(color), 0);
      return moves;
    }
    if (base === "R" || base === "B") {
      slideDirections(base === "R" ? "R" : "B").forEach(([dr, dc]) => slide(dr, dc));
      const extra = extraKingStepDirections(type);
      if (extra) extra.forEach(([dr, dc]) => addIfOk(r + dr, c + dc));
      return moves;
    }

    const offsets = stepOffsets(color, type);
    if (offsets) offsets.forEach(([dr, dc]) => addIfOk(r + dr, c + dc));
    return moves;
  }

  function applyMove(state, move) {
    const next = cloneState(state);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const piece = next.board[fr][fc];
    const captured = next.board[tr][tc];
    if (captured) {
      next.hands[piece.color][baseType(captured.type)]++;
    }
    next.board[tr][tc] = { color: piece.color, type: move.promote ? "+" + baseType(piece.type) : piece.type };
    next.board[fr][fc] = null;
    return next;
  }

  function applyDrop(state, color, type, r, c) {
    const next = cloneState(state);
    next.board[r][c] = { color, type };
    next.hands[color][type]--;
    return next;
  }

  function isSquareAttacked(board, byColor, r, c) {
    for (let pr = 0; pr < SIZE; pr++) {
      for (let pc = 0; pc < SIZE; pc++) {
        const piece = board[pr][pc];
        if (!piece || piece.color !== byColor) continue;
        if (pieceMoves(board, pr, pc).some((m) => m.to[0] === r && m.to[1] === c)) return true;
      }
    }
    return false;
  }

  function isInCheck(board, color) {
    const king = findKing(board, color);
    if (!king) return false;
    return isSquareAttacked(board, otherColor(color), king.r, king.c);
  }

  function canPromote(color, fr, tr) {
    return inPromotionZone(color, fr) || inPromotionZone(color, tr);
  }

  function mustPromote(type, color, tr) {
    const base = baseType(type);
    if (base === "P" || base === "L") return tr === farthestRank(color);
    if (base === "N") return color === "b" ? tr <= 1 : tr >= 7;
    return false;
  }

  // Every fully legal board move for `color` (drops are separate - see
  // legalDrops), expanded into distinct promote/don't-promote choices
  // where the player actually has a choice.
  function legalMoves(state, color) {
    const board = state.board;
    const legal = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;
        pieceMoves(board, r, c).forEach((m) => {
          const [tr] = m.to;
          const eligible = PROMOTABLE.indexOf(baseType(piece.type)) !== -1 && !isPromoted(piece.type)
            && canPromote(color, r, tr);
          const forced = eligible && mustPromote(piece.type, color, tr);
          const options = forced ? [true] : (eligible ? [false, true] : [false]);
          options.forEach((promote) => {
            const candidate = Object.assign({}, m, { promote });
            const nextBoard = applyMove(state, candidate).board;
            if (!isInCheck(nextBoard, color)) legal.push(candidate);
          });
        });
      }
    }
    return legal;
  }

  // Whether dropping `type` for `color` on (r,c) is legal, given the
  // restrictions that exist purely to avoid a permanently stuck piece
  // (P/L never on the farthest rank, N never on the farthest two), the
  // no-two-unpromoted-pawns-per-file rule ("nifu"), the ban on a pawn
  // drop that delivers checkmate ("uchifuzume"), and - like any other
  // move - the requirement that it actually gets your own king out of
  // check if it was already in one (a drop can block a sliding attack,
  // but can never capture the checking piece, so it's illegal whenever
  // it leaves that check unanswered).
  function isLegalDrop(state, color, type, r, c) {
    if (state.board[r][c]) return false;
    if (state.hands[color][type] <= 0) return false;
    if (type === "P" || type === "L") {
      if (r === farthestRank(color)) return false;
    }
    if (type === "N") {
      if (color === "b" ? r <= 1 : r >= 7) return false;
    }
    if (type === "P") {
      for (let rr = 0; rr < SIZE; rr++) {
        const cell = state.board[rr][c];
        if (cell && cell.color === color && cell.type === "P") return false; // nifu
      }
    }

    const dropped = applyDrop(state, color, type, r, c);
    if (isInCheck(dropped.board, color)) return false;

    if (type === "P") {
      const opp = otherColor(color);
      if (isInCheck(dropped.board, opp)) {
        const oppHasMove = legalMoves(dropped, opp).length > 0 || legalDrops(dropped, opp).length > 0;
        if (!oppHasMove) return false; // uchifuzume
      }
    }
    return true;
  }

  function legalDrops(state, color) {
    const drops = [];
    HAND_TYPES.forEach((type) => {
      if (state.hands[color][type] <= 0) return;
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (isLegalDrop(state, color, type, r, c)) drops.push({ type: "drop", piece: type, to: [r, c] });
        }
      }
    });
    return drops;
  }

  // Identifies a position for the sennichite (repetition) rule: board,
  // both hands and the side to move - all three must match for two
  // positions to count as the same.
  function positionKey(state, colorToMove) {
    let key = colorToMove + "|";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = state.board[r][c];
        key += cell ? cell.color + cell.type + "," : ".,";
      }
    }
    ["b", "w"].forEach((color) => {
      key += "|" + HAND_TYPES.map((t) => state.hands[color][t] || 0).join(",");
    });
    return key;
  }

  // { status: "normal" | "checkmate", winner: color|null }. Shogi has
  // no stalemate: with drops always available for material still in
  // hand, a side with pieces and no legal action only occurs when
  // checkmated (or, in this simplified engine, when genuinely stuck -
  // treated the same way, since it never happens in reachable play).
  function detectGameEnd(state, colorToMove) {
    const hasMove = legalMoves(state, colorToMove).length > 0 || legalDrops(state, colorToMove).length > 0;
    if (hasMove) return { status: "normal", winner: null };
    return { status: "checkmate", winner: otherColor(colorToMove) };
  }

  return {
    SIZE,
    HAND_TYPES,
    PROMOTABLE,
    otherColor,
    inBounds,
    forwardDir,
    baseType,
    isPromoted,
    inPromotionZone,
    farthestRank,
    createInitialState,
    createInitialBoard,
    cloneState,
    cloneBoard,
    findKing,
    pieceMoves,
    applyMove,
    applyDrop,
    isSquareAttacked,
    isInCheck,
    canPromote,
    mustPromote,
    legalMoves,
    isLegalDrop,
    legalDrops,
    positionKey,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ShogiCore;
}
if (typeof window !== "undefined") {
  window.ShogiCore = ShogiCore;
}
