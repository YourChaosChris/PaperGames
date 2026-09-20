// checkers-core.js
// Dependency-free rules engine for English draughts (American checkers):
// 8x8 board, 12 men per side, mandatory capture with multi-jump chains,
// kings crowned on the back row (one square at a time, not "flying").
// Mirrors the separation of concerns in go-core.js/chess-core.js - rules
// only, no DOM/UI.
//
// Board representation: 8x8 array of rows, each cell is one of
// null | "b" | "B" | "w" | "B" (lowercase = man, uppercase = king,
// "b"/"w" = color). Coordinates are [row, col], both 0-indexed.
// Black starts on rows 0-2 and moves toward row 7; White starts on rows
// 5-7 and moves toward row 0. Black moves first (matching Go's convention
// elsewhere in this app).

const CheckersCore = (function () {
  const SIZE = 8;

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 === 1) board[r][c] = "b";
      }
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 === 1) board[r][c] = "w";
      }
    }
    return board;
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function colorOf(piece) {
    if (!piece) return null;
    return piece.toLowerCase();
  }

  function isKing(piece) {
    return !!piece && piece === piece.toUpperCase();
  }

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function promotionRow(color) {
    return color === "b" ? SIZE - 1 : 0;
  }

  function forwardDirs(color) {
    // Black moves toward increasing row, White toward decreasing row.
    return color === "b" ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
  }

  const ALL_DIAGONALS = [[1, -1], [1, 1], [-1, -1], [-1, 1]];

  function keysToCoords(keySet) {
    return Array.from(keySet).map((k) => k.split(",").map(Number));
  }

  function encodePiece(color, king) {
    return king ? color.toUpperCase() : color;
  }

  // Recursively finds every maximal capture chain starting from a piece
  // already at (r, c) mid-chain (or at its starting square on the first
  // call). A chain is "maximal": once a capture is available from the
  // current landing square, the player must keep capturing with that same
  // piece - so a shorter path that stops early when a further capture
  // exists is never a legal result on its own, only as a prefix of a
  // longer one returned here. Promotion ends the chain immediately, even
  // if a further capture would otherwise be available (standard rule).
  function findCaptureChains(board, r, c, color, king, captured) {
    const dirs = king ? ALL_DIAGONALS : forwardDirs(color);
    const results = [];

    for (const [dr, dc] of dirs) {
      const midR = r + dr;
      const midC = c + dc;
      const landR = r + 2 * dr;
      const landC = c + 2 * dc;
      if (!inBounds(landR, landC)) continue;

      const midKey = midR + "," + midC;
      if (captured.has(midKey)) continue; // can't jump the same piece twice in one chain

      const midPiece = board[midR][midC];
      if (!midPiece || colorOf(midPiece) === color) continue; // must be an enemy piece
      if (board[landR][landC] !== null) continue; // landing square must be empty

      const newBoard = cloneBoard(board);
      newBoard[r][c] = null;
      const willPromote = !king && landR === promotionRow(color);
      newBoard[landR][landC] = encodePiece(color, king || willPromote);

      const newCaptured = new Set(captured);
      newCaptured.add(midKey);

      if (willPromote) {
        // Promotion ends the capture sequence immediately.
        results.push({ to: [landR, landC], captured: keysToCoords(newCaptured), promoted: true });
        continue;
      }

      const further = findCaptureChains(newBoard, landR, landC, color, king, newCaptured);
      if (further.length) {
        results.push(...further);
      } else {
        results.push({ to: [landR, landC], captured: keysToCoords(newCaptured), promoted: false });
      }
    }

    return results;
  }

  // Returns every legal move for `color`. If any capture is available for
  // any piece, only (maximal) capturing moves are legal - mandatory
  // capture, the defining rule of checkers. Each move is
  // { from: [r,c], to: [r,c], captured: [[r,c], ...], promoted: bool }.
  function getLegalMoves(board, color) {
    const captureMoves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (!piece || colorOf(piece) !== color) continue;
        const chains = findCaptureChains(board, r, c, color, isKing(piece), new Set());
        chains.forEach((chain) => {
          captureMoves.push({ from: [r, c], to: chain.to, captured: chain.captured, promoted: chain.promoted });
        });
      }
    }
    if (captureMoves.length) return captureMoves;

    const simpleMoves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (!piece || colorOf(piece) !== color) continue;
        const dirs = isKing(piece) ? ALL_DIAGONALS : forwardDirs(color);
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (!inBounds(nr, nc) || board[nr][nc] !== null) continue;
          simpleMoves.push({
            from: [r, c],
            to: [nr, nc],
            captured: [],
            promoted: !isKing(piece) && nr === promotionRow(color)
          });
        }
      }
    }
    return simpleMoves;
  }

  function applyMove(board, move) {
    const newBoard = cloneBoard(board);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const piece = newBoard[fr][fc];
    newBoard[fr][fc] = null;
    (move.captured || []).forEach(([cr, cc]) => {
      newBoard[cr][cc] = null;
    });
    newBoard[tr][tc] = move.promoted ? piece.toUpperCase() : piece;
    return newBoard;
  }

  function countPieces(board, color) {
    let count = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] && colorOf(board[r][c]) === color) count++;
      }
    }
    return count;
  }

  // { status: "normal" | "no-pieces" | "no-moves", winner: "b" | "w" | null }
  function detectGameEnd(board, colorToMove) {
    if (countPieces(board, colorToMove) === 0) {
      return { status: "no-pieces", winner: otherColor(colorToMove) };
    }
    if (getLegalMoves(board, colorToMove).length === 0) {
      return { status: "no-moves", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    SIZE,
    createInitialBoard,
    cloneBoard,
    inBounds,
    colorOf,
    isKing,
    otherColor,
    promotionRow,
    getLegalMoves,
    applyMove,
    countPieces,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = CheckersCore;
}
if (typeof window !== "undefined") {
  window.CheckersCore = CheckersCore;
}
