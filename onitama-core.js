// onitama-core.js
// Dependency-free rules engine for an Onitama-style card-driven duel.
// Mirrors the separation of concerns in the other <game>-core.js
// modules: rules only, no DOM/UI.
//
// The move cards below are an original set (elemental names and
// hand-designed movement patterns) rather than a reproduction of any
// published game's specific card names or art - the mechanic (five
// cards in play, two per player plus one spare in the middle, each
// defining a set of relative moves any of your own pieces may use,
// swapped out for the spare after every move) is what's being
// implemented, not any particular publisher's card set.
//
// Board: 5x5, row 0 is Red's home row, row 4 is Blue's home row. Each
// side has 4 pawns and 1 master on their home row's other four
// squares, master on the center square. A card's moves are written
// from Blue's point of view (negative dr = toward Red, i.e. "forward"
// for Blue); Red uses the same card rotated 180 degrees, i.e. every
// offset negated on both axes.

const OnitamaCore = (function () {
  const SIZE = 5;
  const BLUE_SHRINE = [4, 2]; // Blue's own home shrine - Red wins by reaching it
  const RED_SHRINE = [0, 2]; // Red's own home shrine - Blue wins by reaching it

  const CARDS = {
    wind: { color: "blue", moves: [[-1, -1], [-1, 1], [1, 0]] },
    wave: { color: "red", moves: [[1, -1], [1, 1], [-1, 0]] },
    stone: { color: "blue", moves: [[-1, -2], [-1, 2], [1, 0]] },
    flame: { color: "red", moves: [[1, -2], [1, 2], [-1, 0]] },
    thunder: { color: "blue", moves: [[-2, 0], [1, -1], [1, 1]] },
    frost: { color: "red", moves: [[2, 0], [-1, -1], [-1, 1]] },
    mist: { color: "blue", moves: [[-1, -1], [0, -2], [1, 1]] },
    shadow: { color: "red", moves: [[-1, 1], [0, 2], [1, -1]] },
    ember: { color: "blue", moves: [[-1, 0], [0, -1], [1, 1]] },
    gale: { color: "red", moves: [[-1, 0], [0, 1], [1, -1]] },
    tide: { color: "blue", moves: [[-1, -1], [1, -1], [1, 1]] },
    quake: { color: "red", moves: [[-1, 1], [-1, -1], [1, 1]] },
    spark: { color: "blue", moves: [[-2, -1], [-2, 1], [1, 0]] },
    gust: { color: "red", moves: [[2, -1], [2, 1], [-1, 0]] },
    drift: { color: "blue", moves: [[-1, -1], [-1, 0], [-1, 1]] },
    blaze: { color: "red", moves: [[1, -1], [1, 0], [1, 1]] }
  };
  const CARD_IDS = Object.keys(CARDS);

  function otherPlayer(player) {
    return player === "blue" ? "red" : "blue";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function cardMovesFor(cardId, player) {
    const base = CARDS[cardId].moves;
    if (player === "blue") return base;
    return base.map(([dr, dc]) => [-dr, -dc]);
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    for (let c = 0; c < SIZE; c++) {
      board[0][c] = { color: "red", king: c === 2 };
      board[4][c] = { color: "blue", king: c === 2 };
    }
    return board;
  }

  function shuffle(arr, rng) {
    const random = rng || Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  // Deals 5 of the 16 cards at random: 2 to Blue, 2 to Red, 1 spare in
  // the middle. Blue always moves first here, a simplification of the
  // published game's color-matching rule for who starts (this
  // implementation only borrows the mechanic, not that specific
  // bookkeeping rule).
  function createInitialState(rng) {
    const dealt = shuffle(CARD_IDS, rng).slice(0, 5);
    return {
      board: createInitialBoard(),
      cards: { blue: [dealt[0], dealt[1]], red: [dealt[2], dealt[3]], neutral: dealt[4] },
      currentPlayer: "blue",
      gameOver: false,
      winner: null,
      winReason: null
    };
  }

  function cloneState(state) {
    return {
      board: state.board.map((row) => row.map((cell) => (cell ? { color: cell.color, king: cell.king } : null))),
      cards: { blue: state.cards.blue.slice(), red: state.cards.red.slice(), neutral: state.cards.neutral },
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner,
      winReason: state.winReason
    };
  }

  // Every legal move for `player`: { from:[r,c], to:[r,c], card }.
  function getLegalMoves(state, player) {
    const moves = [];
    const hand = state.cards[player];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = state.board[r][c];
        if (!piece || piece.color !== player) continue;
        hand.forEach((cardId) => {
          cardMovesFor(cardId, player).forEach(([dr, dc]) => {
            const tr = r + dr, tc = c + dc;
            if (!inBounds(tr, tc)) return;
            const target = state.board[tr][tc];
            if (target && target.color === player) return;
            moves.push({ from: [r, c], to: [tr, tc], card: cardId });
          });
        });
      }
    }
    return moves;
  }

  function shrineFor(player) {
    return player === "blue" ? RED_SHRINE : BLUE_SHRINE;
  }

  // Applies a legal move (assumed already validated by the caller via
  // getLegalMoves) and returns the resulting state, including the card
  // exchange (the played card goes to the middle, the old middle card
  // joins the mover's hand in its place) and any win condition.
  function applyMove(state, player, move) {
    const next = cloneState(state);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const moving = next.board[fr][fc];
    const captured = next.board[tr][tc];
    next.board[tr][tc] = moving;
    next.board[fr][fc] = null;

    const hand = next.cards[player];
    const usedIndex = hand.indexOf(move.card);
    const oldNeutral = next.cards.neutral;
    hand[usedIndex] = oldNeutral;
    next.cards.neutral = move.card;

    let gameOver = false;
    let winner = null;
    let winReason = null;
    if (captured && captured.king) {
      gameOver = true;
      winner = player;
      winReason = "capture";
    } else if (moving.king) {
      const [sr, sc] = shrineFor(player);
      if (tr === sr && tc === sc) {
        gameOver = true;
        winner = player;
        winReason = "shrine";
      }
    }

    next.currentPlayer = otherPlayer(player);
    next.gameOver = gameOver;
    next.winner = winner;
    next.winReason = winReason;
    return next;
  }

  // Onitama has no stalemate - a side with no legal move (all its
  // pieces boxed in by its own pieces on both cards, and this is
  // strictly a legality corner case that can happen very rarely) still
  // just forfeits its turn's action, but for simplicity - matching the
  // published game's own tournament ruling - a player with zero legal
  // moves loses immediately, since it should not occur in practice
  // with 4 pawns plus a master on a 5x5 board.
  function detectGameEnd(state, colorToMove) {
    if (state.gameOver) return { status: "over", winner: state.winner, reason: state.winReason };
    const moves = getLegalMoves(state, colorToMove);
    if (moves.length > 0) return { status: "normal", winner: null, reason: null };
    return { status: "no-moves", winner: otherPlayer(colorToMove), reason: "no-moves" };
  }

  return {
    SIZE,
    CARDS,
    CARD_IDS,
    BLUE_SHRINE,
    RED_SHRINE,
    otherPlayer,
    inBounds,
    cardMovesFor,
    createInitialBoard,
    createInitialState,
    cloneState,
    getLegalMoves,
    shrineFor,
    applyMove,
    detectGameEnd
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = OnitamaCore;
}
if (typeof window !== "undefined") {
  window.OnitamaCore = OnitamaCore;
}
