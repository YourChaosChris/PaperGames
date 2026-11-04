// checkers-core.js
// Dependency-free rules engine for checkers on the 8x8 board, two rule
// sets (task 179):
//   "en" - English draughts (American checkers), the default: men move and
//          capture forward only, kings one square at a time (not "flying"),
//          mandatory capture with multi-jump chains.
//   "de" - German draughts: men move forward but capture forward and
//          backward, kings fly (move any distance and capture from afar,
//          landing on any free square behind the taken piece), mandatory
//          capture with multi-jump chains, free choice between capture
//          paths (no majority rule). A man that reaches the back row in the
//          middle of a chain and can capture on keeps capturing as a man
//          and is crowned only if the move ends there. Taken pieces stay
//          on the board until the move is over: they can't be jumped
//          twice and block the way.
// Every function that needs the rules takes them as its last argument;
// anything but "de" (including a missing value, so old saves) is "en".
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

  const RULES = ["en", "de"];

  function normalizeRules(rules) {
    return rules === "de" ? "de" : "en";
  }

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

  // German rules: the same idea as findCaptureChains, but men jump in all
  // four directions and kings scan along each diagonal for the first piece,
  // jump it from afar and may land on any free square behind it. If some
  // of those landing squares allow a further capture, the king must land
  // on one of them (the chain has to go on while it can). Men are only
  // crowned at the end of the chain, so a man passing the back row
  // mid-chain keeps capturing as a man.
  function findCaptureChainsDe(board, r, c, color, king, captured) {
    const results = [];
    for (const [dr, dc] of ALL_DIAGONALS) {
      let midR = r + dr;
      let midC = c + dc;
      if (king) {
        while (inBounds(midR, midC) && board[midR][midC] === null) {
          midR += dr;
          midC += dc;
        }
      }
      if (!inBounds(midR, midC)) continue;
      const midPiece = board[midR][midC];
      const midKey = midR + "," + midC;
      // An own piece, or one already taken in this chain, blocks the line.
      if (!midPiece || colorOf(midPiece) === color || captured.has(midKey)) continue;

      const landings = [];
      let landR = midR + dr;
      let landC = midC + dc;
      while (inBounds(landR, landC) && board[landR][landC] === null) {
        landings.push([landR, landC]);
        if (!king) break;
        landR += dr;
        landC += dc;
      }
      if (!landings.length) continue;

      const newCaptured = new Set(captured);
      newCaptured.add(midKey);
      const branches = landings.map(([lr, lc]) => {
        const newBoard = cloneBoard(board);
        newBoard[r][c] = null;
        newBoard[lr][lc] = encodePiece(color, king);
        return { to: [lr, lc], further: findCaptureChainsDe(newBoard, lr, lc, color, king, newCaptured) };
      });
      const goesOn = branches.some((b) => b.further.length > 0);
      branches.forEach((b) => {
        if (b.further.length) {
          results.push(...b.further);
        } else if (!goesOn) {
          results.push({
            to: b.to,
            captured: keysToCoords(newCaptured),
            promoted: !king && b.to[0] === promotionRow(color)
          });
        }
      });
    }
    return results;
  }

  // Returns every legal move for `color` under `rules` ("en" when left
  // out). If any capture is available for any piece, only (maximal)
  // capturing moves are legal - mandatory capture, the defining rule of
  // checkers. Each move is
  // { from: [r,c], to: [r,c], captured: [[r,c], ...], promoted: bool }.
  function getLegalMoves(board, color, rules) {
    const german = normalizeRules(rules) === "de";
    const captureMoves = [];
    const seen = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (!piece || colorOf(piece) !== color) continue;
        const chains = german
          ? findCaptureChainsDe(board, r, c, color, isKing(piece), new Set())
          : findCaptureChains(board, r, c, color, isKing(piece), new Set());
        chains.forEach((chain) => {
          if (german) {
            // A flying king can take the same pieces in another order and
            // end on the same square: one of those moves is enough.
            const key = r + "," + c + ">" + chain.to.join(",") + ":" +
              chain.captured.map((p) => p.join(",")).sort().join(";");
            if (seen.has(key)) return;
            seen.add(key);
          }
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
        const king = isKing(piece);
        const dirs = king ? ALL_DIAGONALS : forwardDirs(color);
        for (const [dr, dc] of dirs) {
          let nr = r + dr;
          let nc = c + dc;
          while (inBounds(nr, nc) && board[nr][nc] === null) {
            simpleMoves.push({
              from: [r, c],
              to: [nr, nc],
              captured: [],
              promoted: !king && nr === promotionRow(color)
            });
            if (!(german && king)) break; // only a German king flies
            nr += dr;
            nc += dc;
          }
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
  function detectGameEnd(board, colorToMove, rules) {
    if (countPieces(board, colorToMove) === 0) {
      return { status: "no-pieces", winner: otherColor(colorToMove) };
    }
    if (getLegalMoves(board, colorToMove, rules).length === 0) {
      return { status: "no-moves", winner: otherColor(colorToMove) };
    }
    return { status: "normal", winner: null };
  }

  return {
    SIZE,
    RULES,
    normalizeRules,
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
