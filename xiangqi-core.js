// xiangqi-core.js
// Dependency-free rules engine for Xiangqi (Chinese Chess). Mirrors the
// separation of concerns in chess-core.js/checkers-core.js: rules only,
// no DOM/UI.
//
// Board: 10 rows (0-9) x 9 columns (0-8) of intersections - pieces sit
// ON points, not in squares, like Go. Black occupies rows 0-4 (its
// palace is rows 0-2, cols 3-5), Red occupies rows 5-9 (palace rows
// 7-9, cols 3-5) - matching the usual on-screen convention of Red at
// the bottom. Red moves first (the standard Xiangqi rule - unlike the
// other games in this app, which all have Black moving first).
//
// Piece codes: G=general, A=advisor, E=elephant, H=horse, R=chariot,
// C=cannon, P=soldier. A board cell is null or { color: 'r'|'b', type }.

const XiangqiCore = (function () {
  const ROWS = 10;
  const COLS = 9;

  function otherColor(color) {
    return color === "r" ? "b" : "r";
  }

  function inBounds(r, c) {
    return r >= 0 && r < ROWS && c >= 0 && c < COLS;
  }

  function palaceRows(color) {
    return color === "b" ? [0, 2] : [7, 9];
  }

  function inPalace(color, r, c) {
    const [lo, hi] = palaceRows(color);
    return r >= lo && r <= hi && c >= 3 && c <= 5;
  }

  function onOwnSide(color, r) {
    return color === "b" ? r <= 4 : r >= 5;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < ROWS; r++) board.push(new Array(COLS).fill(null));
    const backRank = ["R", "H", "E", "A", "G", "A", "E", "H", "R"];
    backRank.forEach((type, c) => {
      board[0][c] = { color: "b", type };
      board[9][c] = { color: "r", type };
    });
    [1, 7].forEach((c) => {
      board[2][c] = { color: "b", type: "C" };
      board[7][c] = { color: "r", type: "C" };
    });
    [0, 2, 4, 6, 8].forEach((c) => {
      board[3][c] = { color: "b", type: "P" };
      board[6][c] = { color: "r", type: "P" };
    });
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.map((cell) => (cell ? { color: cell.color, type: cell.type } : null)));
  }

  function findGeneral(board, color) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (cell && cell.color === color && cell.type === "G") return { r, c };
      }
    }
    return null;
  }

  // Whether the two generals face each other on a clear, open file -
  // illegal to allow this after your own move (the "flying general" rule).
  function generalsFacing(board) {
    const g1 = findGeneral(board, "r");
    const g2 = findGeneral(board, "b");
    if (!g1 || !g2 || g1.c !== g2.c) return false;
    const lo = Math.min(g1.r, g2.r), hi = Math.max(g1.r, g2.r);
    for (let r = lo + 1; r < hi; r++) {
      if (board[r][g1.c]) return false;
    }
    return true;
  }

  const HORSE_MOVES = [
    { dr: -2, dc: -1, br: -1, bc: 0 }, { dr: -2, dc: 1, br: -1, bc: 0 },
    { dr: 2, dc: -1, br: 1, bc: 0 }, { dr: 2, dc: 1, br: 1, bc: 0 },
    { dr: -1, dc: -2, br: 0, bc: -1 }, { dr: 1, dc: -2, br: 0, bc: -1 },
    { dr: -1, dc: 2, br: 0, bc: 1 }, { dr: 1, dc: 2, br: 0, bc: 1 }
  ];
  const ORTHOGONAL = [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }];
  const DIAGONAL = [{ dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }];

  // Pseudo-legal moves for the piece at (r,c) - doesn't yet check
  // whether the move leaves the mover's own general in check.
  function pieceMoves(board, r, c) {
    const piece = board[r][c];
    if (!piece) return [];
    const { color, type } = piece;
    const moves = [];
    const addIfOk = (tr, tc) => {
      if (!inBounds(tr, tc)) return;
      const target = board[tr][tc];
      if (target && target.color === color) return;
      moves.push({ from: [r, c], to: [tr, tc], captured: !!target });
    };

    if (type === "G") {
      ORTHOGONAL.forEach(({ dr, dc }) => {
        const tr = r + dr, tc = c + dc;
        if (inPalace(color, tr, tc)) addIfOk(tr, tc);
      });
    } else if (type === "A") {
      DIAGONAL.forEach(({ dr, dc }) => {
        const tr = r + dr, tc = c + dc;
        if (inPalace(color, tr, tc)) addIfOk(tr, tc);
      });
    } else if (type === "E") {
      DIAGONAL.forEach(({ dr, dc }) => {
        const tr = r + dr * 2, tc = c + dc * 2;
        const eyeR = r + dr, eyeC = c + dc;
        if (!inBounds(tr, tc) || !onOwnSide(color, tr) || board[eyeR][eyeC]) return;
        addIfOk(tr, tc);
      });
    } else if (type === "H") {
      HORSE_MOVES.forEach(({ dr, dc, br, bc }) => {
        const legR = r + br, legC = c + bc;
        if (!inBounds(legR, legC) || board[legR][legC]) return; // off-board or blocked leg
        addIfOk(r + dr, c + dc);
      });
    } else if (type === "R") {
      ORTHOGONAL.forEach(({ dr, dc }) => {
        let tr = r + dr, tc = c + dc;
        while (inBounds(tr, tc)) {
          const target = board[tr][tc];
          if (!target) {
            moves.push({ from: [r, c], to: [tr, tc], captured: false });
          } else {
            if (target.color !== color) moves.push({ from: [r, c], to: [tr, tc], captured: true });
            break;
          }
          tr += dr; tc += dc;
        }
      });
    } else if (type === "C") {
      ORTHOGONAL.forEach(({ dr, dc }) => {
        let tr = r + dr, tc = c + dc;
        let screenFound = false;
        while (inBounds(tr, tc)) {
          const target = board[tr][tc];
          if (!screenFound) {
            if (!target) {
              moves.push({ from: [r, c], to: [tr, tc], captured: false });
            } else {
              screenFound = true;
            }
          } else if (target) {
            if (target.color !== color) moves.push({ from: [r, c], to: [tr, tc], captured: true });
            break;
          }
          tr += dr; tc += dc;
        }
      });
    } else if (type === "P") {
      const forward = color === "b" ? 1 : -1;
      addIfOk(r + forward, c);
      if (!onOwnSide(color, r)) {
        addIfOk(r, c - 1);
        addIfOk(r, c + 1);
      }
    }

    return moves;
  }

  function applyMove(board, move) {
    const newBoard = cloneBoard(board);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    newBoard[tr][tc] = newBoard[fr][fc];
    newBoard[fr][fc] = null;
    return newBoard;
  }

  function isSquareAttacked(board, byColor, r, c) {
    for (let pr = 0; pr < ROWS; pr++) {
      for (let pc = 0; pc < COLS; pc++) {
        const piece = board[pr][pc];
        if (!piece || piece.color !== byColor) continue;
        if (pieceMoves(board, pr, pc).some((m) => m.to[0] === r && m.to[1] === c)) return true;
      }
    }
    return false;
  }

  function isInCheck(board, color) {
    const general = findGeneral(board, color);
    if (!general) return false;
    if (isSquareAttacked(board, otherColor(color), general.r, general.c)) return true;
    return generalsFacing(board);
  }

  // Every fully legal move for `color`: pseudo-legal moves that don't
  // leave that color's own general in check (or exposed to the flying
  // general rule) afterwards.
  function getLegalMoves(board, color) {
    const legal = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;
        pieceMoves(board, r, c).forEach((m) => {
          const next = applyMove(board, m);
          if (!isInCheck(next, color)) legal.push(m);
        });
      }
    }
    return legal;
  }

  // Rough piece values, only used to tell whether an attack on a
  // defended piece still counts as a chase (a cheaper piece attacking a
  // dearer one, e.g. a horse on a chariot).
  const CHASE_VALUE = { R: 9, C: 4.5, H: 4, E: 2, A: 2 };

  // Squares of `attackerColor`'s opponent pieces that `attackerColor`
  // currently "chases" in the Xiangqi sense: attacked and either not
  // defended at all, or attacked by a cheaper piece. The General and the
  // soldiers are never chased (checks are counted separately; attacking
  // soldiers is allowed). A simplified form of the Asian rules, enough
  // to recognise a piece being hounded around the board.
  function chasedSquares(board, attackerColor) {
    const defender = otherColor(attackerColor);
    const attacked = {};
    for (let pr = 0; pr < ROWS; pr++) {
      for (let pc = 0; pc < COLS; pc++) {
        const piece = board[pr][pc];
        if (!piece || piece.color !== attackerColor) continue;
        pieceMoves(board, pr, pc).forEach((m) => {
          const target = board[m.to[0]][m.to[1]];
          if (!target || target.color !== defender || !CHASE_VALUE[target.type]) return;
          const k = m.to[0] + "," + m.to[1];
          const cheapest = attacked[k];
          const value = piece.type === "G" ? 99 : (CHASE_VALUE[piece.type] || 1);
          attacked[k] = cheapest === undefined ? value : Math.min(cheapest, value);
        });
      }
    }
    const chased = new Set();
    Object.keys(attacked).forEach((k) => {
      const [r, c] = k.split(",").map(Number);
      const target = board[r][c];
      if (attacked[k] < CHASE_VALUE[target.type]) { chased.add(k); return; }
      // Defended? Pretend the target were an attacker's piece and see
      // whether any of its own side could then capture on that square.
      const probe = cloneBoard(board);
      probe[r][c] = { color: attackerColor, type: target.type };
      if (!isSquareAttacked(probe, defender, r, c)) chased.add(k);
    });
    return chased;
  }

  // Whether `move` by `color` is "forcing" for the perpetual rules: it
  // gives check, or it starts chasing a piece that wasn't chased before.
  function forcingKind(board, move, color) {
    const next = applyMove(board, move);
    if (isInCheck(next, otherColor(color))) return "check";
    const before = chasedSquares(board, color);
    const after = chasedSquares(next, color);
    for (const k of after) if (!before.has(k)) return "chase";
    return null;
  }

  // A compact string identifying this exact position (board layout plus
  // whose turn it is), for spotting a recurring position - e.g. to warn
  // about perpetual check. Not used for legality at all, only for that
  // advisory hint.
  function positionKey(board, colorToMove) {
    let key = colorToMove;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        key += cell ? cell.color + cell.type : ".";
      }
    }
    return key;
  }

  // { status: "normal" | "checkmate" | "no-moves", winner: color|null }
  // Unlike international chess, Xiangqi has no stalemate draw: a player
  // with no legal move loses whether or not they're in check.
  function detectGameEnd(board, colorToMove) {
    const moves = getLegalMoves(board, colorToMove);
    if (moves.length > 0) return { status: "normal", winner: null };
    const inCheck = isInCheck(board, colorToMove);
    return {
      status: inCheck ? "checkmate" : "no-moves",
      winner: otherColor(colorToMove)
    };
  }

  return {
    ROWS,
    COLS,
    otherColor,
    inBounds,
    inPalace,
    onOwnSide,
    createInitialBoard,
    cloneBoard,
    findGeneral,
    pieceMoves,
    applyMove,
    isInCheck,
    getLegalMoves,
    positionKey,
    chasedSquares,
    forcingKind,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = XiangqiCore;
}
if (typeof window !== "undefined") {
  window.XiangqiCore = XiangqiCore;
}
