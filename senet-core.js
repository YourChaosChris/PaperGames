// senet-core.js
// Dependency-free rules engine for Senet, the ancient Egyptian race
// game. No rulebook for Senet has ever been found - everything below is
// PaperGames's take on the widely used modern reconstruction (based on
// the squares' names as recorded on the "Game of Thirty Squares" and
// on Egyptological work such as Timothy Kendall's), not a claim of
// verified authenticity. See senet-history.html for the background.
//
// Board layout: 30 squares in a single boustrophedon (snake) path,
// indexed 0-29 here (square "1" through "30" in the traditional
// numbering). A piece that moves past index 29 bears off the board
// entirely - see BOARD_SIZE below.
//
// Each square holds at most one player's pieces at a time, but any
// number of same-color pieces may stack on one square (two or more
// makes it a "protected" square the opponent cannot land on). A single
// piece can be captured by landing on it: the two pieces simply swap
// squares, mirroring how captures work on Senet's actual board.

const SenetCore = (function () {
  const BOARD_SIZE = 30;
  const PIECES_PER_PLAYER = 5;
  const HOUSE_OF_REBIRTH = 14;  // square 15 - always safe, never capturable
  const HOUSE_OF_BEAUTY = 25;   // square 26 - cannot be jumped over, only landed on
  const HOUSE_OF_WATER = 26;    // square 27 - landing here sends the piece back

  function otherPlayer(player) {
    return player === "a" ? "b" : "a";
  }

  function emptySlot() {
    return { owner: null, count: 0 };
  }

  function createInitialState() {
    const board = [];
    for (let i = 0; i < BOARD_SIZE; i++) board.push(emptySlot());
    // Pieces start alternating on squares 1-10 (indices 0-9): player a
    // on the odd squares (index 0,2,4,6,8), player b on the even ones.
    for (let i = 0; i < 10; i++) {
      board[i] = { owner: i % 2 === 0 ? "a" : "b", count: 1 };
    }
    return {
      board,
      borneOff: { a: 0, b: 0 },
      currentPlayer: "a",
      gameOver: false,
      winner: null
    };
  }

  function cloneState(state) {
    return {
      board: state.board.map((s) => ({ owner: s.owner, count: s.count })),
      borneOff: { a: state.borneOff.a, b: state.borneOff.b },
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  // Four two-sided throwing sticks: each lands marked-side-up or not,
  // 50/50. The number of marked sides up is the throw, except throwing
  // none of them face-up counts as the best result, 6, rather than 0.
  // Throws of 1, 4 or 6 grant the same player another turn.
  function rollSticks(rng) {
    const random = rng || Math.random;
    let ups = 0;
    for (let i = 0; i < 4; i++) {
      if (random() < 0.5) ups++;
    }
    const value = ups === 0 ? 6 : ups;
    const extraTurn = value === 1 || value === 4 || value === 6;
    return { value, extraTurn };
  }

  function isProtectedForCapture(slot, targetIndex) {
    if (targetIndex === HOUSE_OF_REBIRTH) return true; // always safe, any count
    return slot.count >= 2;
  }

  function isLegalMove(state, player, fromIndex, roll) {
    const board = state.board;
    const slot = board[fromIndex];
    if (!slot || slot.owner !== player) return false;
    const target = fromIndex + roll;
    if (target > BOARD_SIZE) return false; // overshoot past the last square
    if (target === BOARD_SIZE) return true; // bearing off - always fine if exact

    // The House of Beauty (square 26) can't be skipped over, only
    // landed on exactly.
    if (fromIndex < HOUSE_OF_BEAUTY && target > HOUSE_OF_BEAUTY) return false;

    const destSlot = board[target];
    if (destSlot.owner === otherPlayer(player)) {
      if (isProtectedForCapture(destSlot, target)) return false;
    }
    return true;
  }

  function getLegalMoves(state, player, roll) {
    const moves = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (state.board[i].owner === player && isLegalMove(state, player, i, roll)) {
        moves.push(i);
      }
    }
    return moves;
  }

  // Places a piece of `owner` back onto the board at the House of
  // Rebirth (square 15) if it's free, square 1 if not, or otherwise
  // the first free square found - used both for the House of Water's
  // relocation and for a capture whose vacated square still holds
  // another of the mover's own pieces (so the displaced piece has
  // nowhere to swap into). The House of Rebirth is always safe for
  // whoever already sits on it (see isProtectedForCapture), so this
  // never bumps a piece that's already there - it simply looks
  // elsewhere, which also keeps it simple and always piece-conserving.
  function washBackPiece(board, owner) {
    const fits = (idx) => board[idx].owner === owner || board[idx].owner === null;
    let dest = fits(HOUSE_OF_REBIRTH) ? HOUSE_OF_REBIRTH : (fits(0) ? 0 : -1);
    if (dest === -1) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (fits(i)) { dest = i; break; }
      }
    }
    board[dest] = { owner, count: (board[dest].owner === owner ? board[dest].count : 0) + 1 };
  }

  function relocateFromWater(board, player) {
    board[HOUSE_OF_WATER] = emptySlot();
    washBackPiece(board, player);
  }

  // Returns { state, captured, borneOff, sentToWater }.
  function applyMove(state, player, fromIndex, roll) {
    const board = state.board.map((s) => ({ owner: s.owner, count: s.count }));
    const borneOff = { a: state.borneOff.a, b: state.borneOff.b };
    const target = fromIndex + roll;
    const opp = otherPlayer(player);

    board[fromIndex].count--;
    if (board[fromIndex].count <= 0) board[fromIndex] = emptySlot();

    let captured = false;
    let sentToWater = false;

    if (target === BOARD_SIZE) {
      borneOff[player]++;
    } else {
      if (board[target].owner === opp) {
        // Single opposing piece: it's displaced by the capture. It
        // swaps into the square just vacated when that square is now
        // empty; otherwise (the mover had a stack there) it washes
        // back to a safe square instead, since it can't share a square
        // with the piece(s) left behind.
        board[target] = { owner: player, count: 1 };
        if (board[fromIndex].owner === null) {
          board[fromIndex] = { owner: opp, count: 1 };
        } else {
          washBackPiece(board, opp);
        }
        captured = true;
      } else if (board[target].owner === player) {
        board[target].count++;
      } else {
        board[target] = { owner: player, count: 1 };
      }
      if (target === HOUSE_OF_WATER) {
        relocateFromWater(board, player);
        sentToWater = true;
      }
    }

    const gameOver = borneOff[player] >= PIECES_PER_PLAYER;
    return {
      state: {
        board,
        borneOff,
        currentPlayer: state.currentPlayer,
        gameOver,
        winner: gameOver ? player : null
      },
      captured,
      borneOff: target === BOARD_SIZE,
      sentToWater
    };
  }

  function getWinner(state) {
    if (state.borneOff.a >= PIECES_PER_PLAYER) return "a";
    if (state.borneOff.b >= PIECES_PER_PLAYER) return "b";
    return null;
  }

  return {
    BOARD_SIZE,
    PIECES_PER_PLAYER,
    HOUSE_OF_REBIRTH,
    HOUSE_OF_BEAUTY,
    HOUSE_OF_WATER,
    otherPlayer,
    createInitialState,
    cloneState,
    rollSticks,
    isLegalMove,
    getLegalMoves,
    applyMove,
    getWinner
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SenetCore;
}
if (typeof window !== "undefined") {
  window.SenetCore = SenetCore;
}
