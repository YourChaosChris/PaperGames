// hnefatafl-core.js
// Dependency-free rules engine for Hnefatafl (Viking Chess), Brandub
// variant: a 7x7 board, a king starting on the center throne guarded
// by four defenders, besieged by eight attackers from the four edges.
// This is a real, ancient game (the Tafl family predates written
// record in parts of Scandinavia and the British Isles), so - unlike
// Onitama - there's no IP-safety reason to invent anything here; this
// module implements a clearly-documented, self-consistent simplified
// ruleset rather than any one strict historical reconstruction (real
// Tafl rulesets vary a lot on capture edge-cases between sources).
//
// Board: 7x7, row/col 0..6. The throne (center) and the four corners
// are "restricted" squares - only the king may ever occupy them, and
// regular pieces may not move through them either (they act like a
// wall for everyone but the king).
//
// Movement: every piece moves like a rook - any distance in a
// straight line, but never through or onto an occupied square, and
// never through or onto a restricted square unless it's the king.
//
// Capture (regular pieces): custodian capture - after a move, look at
// each of the mover's four neighbors; if that neighbor is an enemy
// regular piece and the square beyond it (same direction) is hostile
// (an own piece, or a restricted square), the neighbor is captured.
// Only the piece that just moved can trigger a capture - moving a
// piece between two enemies is always safe, matching the historical
// game.
//
// Capture (the king): the king needs all four orthogonal neighbors to
// be hostile (an attacker piece, or the edge of the board) to be
// captured - only ever checked after an attacker's move. The throne
// is never counted as hostile to the king in this ruleset, to keep
// the rule simple and unambiguous.
//
// Win conditions: the king reaches any of the four corners (defenders
// win), the king is captured (attackers win), or the side to move has
// no legal move at all (they lose, the same forced-loss convention
// already used for the other strategy games here).

const HnefataflCore = (function () {
  const SIZE = 7;
  const THRONE = [3, 3];
  const CORNERS = [[0, 0], [0, 6], [6, 0], [6, 6]];
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
    const attackers = [
      [0, 3], [1, 3], [5, 3], [6, 3],
      [3, 0], [3, 1], [3, 5], [3, 6]
    ];
    const defenders = [[2, 3], [4, 3], [3, 2], [3, 4]];
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

  function isKingSurrounded(board, r, c) {
    for (let i = 0; i < DIRS.length; i++) {
      const nr = r + DIRS[i][0], nc = c + DIRS[i][1];
      if (!inBounds(nr, nc)) continue; // the board edge itself counts as hostile
      const cell = board[nr][nc];
      if (!(cell && cell.side === "attacker")) return false;
    }
    return true;
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
    isKingSurrounded,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HnefataflCore;
}
if (typeof window !== "undefined") {
  window.HnefataflCore = HnefataflCore;
}
