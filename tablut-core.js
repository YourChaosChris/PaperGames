// tablut-core.js
// Dependency-free rules engine for Tablut, the larger 9x9 member of the
// Tafl family (a separate, standalone implementation from this repo's
// existing hnefatafl-core.js, which plays the smaller 7x7 Brandub
// variant - see tablut-history.html for how the two relate). Tablut is
// the best-documented Tafl variant, thanks to Carl Linnaeus's 1732
// notes on the game as played by the Sami in Lapland; even so, his
// account leaves some capture edge-cases ambiguous, so - like
// hnefatafl-core.js - this module implements one clearly-documented,
// self-consistent modern ruleset rather than claiming to be the one
// true historical reconstruction.
//
// Board: 9x9, row/col 0..8. The throne (center, [4,4]) and the four
// corners are "restricted" squares - only the king may ever occupy
// them, and regular pieces may not move through them either (they act
// like a wall for everyone but the king).
//
// Starting position (17 pieces, symmetric under 90-degree rotation):
//   - The king starts on the throne.
//   - 8 defenders form a plus/cross around the throne: its four
//     orthogonal neighbors, plus one further square out in each of
//     the same four directions.
//   - 8 attackers sit two per edge, aligned on the edge-midpoint row/
//     column: the edge square itself plus one square inward.
//
// Movement: every piece moves like a rook - any distance in a
// straight line, but never through or onto an occupied square, and
// never through or onto a restricted square unless it's the king.
//
// Capture (regular pieces): custodian capture - after a move, look at
// each of the mover's four neighbors; if that neighbor is an enemy
// regular piece and the square beyond it (same direction) is hostile
// (an own piece, or a restricted square - the throne or a corner,
// whether occupied by the king or empty), the neighbor is captured.
// Only the piece that just moved can trigger a capture - moving a
// piece between two enemies is always safe.
//
// Capture (the king): the king needs all four orthogonal neighbors to
// be hostile to be captured. A neighbor is hostile if it holds an
// attacker, or if it's the throne AND the throne is currently empty
// (an occupied throne can't happen here since only the king ever
// stands on it, but the check is written generally). Unlike a regular
// piece, the board edge is never treated as an extra hostile side for
// the king in this ruleset - only real attackers (or the vacated
// throne) may close the trap. This is documented explicitly on
// tablut-rules.html since Tafl king-capture rules vary a lot between
// sources.
//
// Win conditions: the king reaches any of the four corners (defenders
// win), the king is captured (attackers win), or the side to move has
// no legal move at all (they lose, the same forced-loss convention
// used for the other strategy games here, including hnefatafl).

const TablutCore = (function () {
  const SIZE = 9;
  const THRONE = [4, 4];
  const CORNERS = [[0, 0], [0, 8], [8, 0], [8, 8]];
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function otherPlayer(player) {
    return player === "attacker" ? "defender" : "attacker";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function isThrone(r, c) {
    return r === THRONE[0] && c === THRONE[1];
  }

  function isCorner(r, c) {
    return CORNERS.some(([cr, cc]) => cr === r && cc === c);
  }

  function isRestricted(r, c) {
    return isThrone(r, c) || isCorner(r, c);
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));

    // Two per edge, aligned on the edge-midpoint row/column: the edge
    // square itself, plus one square inward (a5/b5, i5/h5, e1/e2, e9/e8
    // in the classic a-i / 1-9 coordinate system).
    const attackers = [
      [4, 0], [4, 1], // a5, b5
      [4, 8], [4, 7], // i5, h5
      [0, 4], [1, 4], // e1, e2
      [8, 4], [7, 4]  // e9, e8
    ];
    // The throne's four orthogonal neighbors, plus one further square
    // out in each direction (c5/d5, f5/g5, e3/e4, e6/e7).
    const defenders = [
      [4, 2], [4, 3], // c5, d5
      [4, 6], [4, 5], // g5, f5
      [2, 4], [3, 4], // e3, e4
      [6, 4], [5, 4]  // e7, e6
    ];
    attackers.forEach(([r, c]) => { board[r][c] = { side: "attacker" }; });
    defenders.forEach(([r, c]) => { board[r][c] = { side: "defender" }; });
    board[THRONE[0]][THRONE[1]] = { side: "defender", king: true };
    return board;
  }

  function createInitialState() {
    return {
      board: createInitialBoard(),
      currentPlayer: "attacker",
      gameOver: false,
      winner: null,
      winReason: null
    };
  }

  function cloneState(state) {
    return {
      board: state.board.map((row) => row.map((cell) => (cell ? { side: cell.side, king: !!cell.king } : null))),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner,
      winReason: state.winReason
    };
  }

  function findKing(board) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (piece && piece.king) return [r, c];
      }
    }
    return null;
  }

  // Every legal move for `player`: { from:[r,c], to:[r,c] }.
  function getLegalMoves(state, player) {
    const moves = [];
    const board = state.board;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        if (!piece || piece.side !== player) continue;
        const isKing = !!piece.king;
        DIRS.forEach(([dr, dc]) => {
          for (let step = 1; step < SIZE; step++) {
            const nr = r + dr * step, nc = c + dc * step;
            if (!inBounds(nr, nc)) break;
            if (board[nr][nc]) break;
            if (isRestricted(nr, nc) && !isKing) break;
            moves.push({ from: [r, c], to: [nr, nc] });
          }
        });
      }
    }
    return moves;
  }

  // A square is hostile to the king if it holds an attacker, or if
  // it's the (necessarily empty, since only the king stands there)
  // throne. The board edge is deliberately NOT hostile here - see the
  // header comment and tablut-rules.html for why.
  function isHostileToKing(board, r, c) {
    if (!inBounds(r, c)) return false;
    const cell = board[r][c];
    if (cell && cell.side === "attacker") return true;
    if (isThrone(r, c) && !cell) return true;
    return false;
  }

  function isKingSurrounded(board, r, c) {
    return DIRS.every(([dr, dc]) => isHostileToKing(board, r + dr, c + dc));
  }

  // Applies a legal move (assumed already validated by the caller via
  // getLegalMoves) and returns the resulting state, including any
  // captures and win condition.
  function applyMove(state, player, move) {
    const next = cloneState(state);
    const board = next.board;
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const moving = board[fr][fc];
    board[tr][tc] = moving;
    board[fr][fc] = null;

    const opponent = otherPlayer(player);
    let gameOver = false;
    let winner = null;
    let winReason = null;

    DIRS.forEach(([dr, dc]) => {
      if (gameOver) return;
      const nr = tr + dr, nc = tc + dc;
      if (!inBounds(nr, nc)) return;
      const neighbor = board[nr][nc];
      if (!neighbor || neighbor.side !== opponent) return;
      if (neighbor.king) {
        if (player === "attacker" && isKingSurrounded(board, nr, nc)) {
          gameOver = true;
          winner = "attacker";
          winReason = "capture";
        }
        return;
      }
      const br = nr + dr, bc = nc + dc;
      let hostile = false;
      if (inBounds(br, bc)) {
        const beyond = board[br][bc];
        hostile = (beyond && beyond.side === player) || isRestricted(br, bc);
      }
      if (hostile) board[nr][nc] = null;
    });

    if (!gameOver && moving.king && isCorner(tr, tc)) {
      gameOver = true;
      winner = "defender";
      winReason = "escape";
    }

    next.currentPlayer = opponent;

    if (!gameOver) {
      const opponentMoves = getLegalMoves(next, opponent);
      if (!opponentMoves.length) {
        gameOver = true;
        winner = player;
        winReason = "no-moves";
      }
    }

    next.gameOver = gameOver;
    next.winner = winner;
    next.winReason = winReason;
    return next;
  }

  return {
    SIZE,
    THRONE,
    CORNERS,
    otherPlayer,
    inBounds,
    isThrone,
    isCorner,
    isRestricted,
    createInitialBoard,
    createInitialState,
    cloneState,
    findKing,
    getLegalMoves,
    isHostileToKing,
    isKingSurrounded,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TablutCore;
}
if (typeof window !== "undefined") {
  window.TablutCore = TablutCore;
}
