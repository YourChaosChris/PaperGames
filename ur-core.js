// ur-core.js
// Dependency-free rules engine for the Royal Game of Ur, using the modern
// reconstructed ruleset popularised by Irving Finkel (the same rules used
// by the British Museum's own digital version and royalur.net). Mirrors
// the separation of concerns in go-core.js/checkers-core.js: rules only,
// no DOM/UI.
//
// Path model: each player has an independent, linear 14-square path
// (positions 1-14). Position 0 means "not yet entered the board" and
// position 15 means "borne off / home". Squares 1-4 and 13-14 are that
// player's own private squares (physically a different board square per
// player, even though the position numbers match); squares 5-12 are the
// single shared lane both players' pieces travel through and can capture
// on. Three squares - the 4th and 14th of each private stretch, and the
// middle (8th) square of the shared lane - are rosettes: landing on one
// is always safe from capture and grants the mover another roll.
//
// Dice: four binary (2-sided) dice are rolled together, each contributing
// 0 or 1, for a total of 0-4 per roll (see rollDice()). A roll of 0 means
// no piece can move and the turn passes.

const UrCore = (function () {
  const PIECES_PER_PLAYER = 7;
  const PATH_LENGTH = 14;      // squares 1..14 are on the board
  const HOME = PATH_LENGTH + 1; // 15 = borne off
  const ROSETTES = new Set([4, 8, 14]);
  const SHARED_START = 5;
  const SHARED_END = 12;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function createInitialState() {
    return {
      positions: {
        b: new Array(PIECES_PER_PLAYER).fill(0),
        w: new Array(PIECES_PER_PLAYER).fill(0)
      }
    };
  }

  function cloneState(state) {
    return {
      positions: {
        b: state.positions.b.slice(),
        w: state.positions.w.slice()
      }
    };
  }

  function isRosette(pos) {
    return ROSETTES.has(pos);
  }

  function isShared(pos) {
    return pos >= SHARED_START && pos <= SHARED_END;
  }

  // Sum of four independent fair coin flips, matching the four two-sided
  // (binary) dice used in the real game: P(0)=1/16, P(1)=4/16, P(2)=6/16,
  // P(3)=4/16, P(4)=1/16.
  function rollDice(rng) {
    const random = rng || Math.random;
    let total = 0;
    for (let i = 0; i < 4; i++) {
      if (random() < 0.5) total++;
    }
    return total;
  }

  // Exact binomial distribution of rollDice(), for AI risk evaluation.
  const ROLL_PROBABILITY = { 0: 1 / 16, 1: 4 / 16, 2: 6 / 16, 3: 4 / 16, 4: 1 / 16 };

  // Every legal move for `color` given an already-rolled `roll` (1-4; a
  // roll of 0 always yields no moves). Each move is:
  // { pieceIndex, from, to, captured, rosette, finishes }
  // `to` uses the mover's own path numbering; `finishes` means the piece
  // reaches HOME (borne off) with this move.
  function getLegalMoves(state, color, roll) {
    if (!roll || roll <= 0) return [];
    const moves = [];
    const own = state.positions[color];
    const opp = state.positions[otherColor(color)];

    for (let i = 0; i < own.length; i++) {
      const from = own[i];
      if (from >= HOME) continue; // already home
      const to = from + roll;
      if (to > HOME) continue; // overshoots even the exit - illegal

      if (to === HOME) {
        // Bearing off requires landing exactly on HOME (an overshoot past
        // the last square is illegal, handled by the check above).
        moves.push({ pieceIndex: i, from, to: HOME, captured: false, rosette: false, finishes: true });
        continue;
      }

      // `to` is now a normal square in range 1..PATH_LENGTH (14). Landing
      // exactly on square 14 is still a rosette on the board, not yet
      // home - it falls through to the same occupancy checks as any
      // other square below.
      if (own.includes(to)) continue; // blocked by one of your own pieces

      if (isShared(to)) {
        if (isRosette(to)) {
          if (opp.includes(to)) continue; // rosette is safe: can't land on an occupied one
        } else if (opp.includes(to)) {
          moves.push({ pieceIndex: i, from, to, captured: true, rosette: false, finishes: false });
          continue;
        }
      }

      moves.push({ pieceIndex: i, from, to, captured: false, rosette: isRosette(to), finishes: false });
    }

    return moves;
  }

  function applyMove(state, color, move) {
    const newState = cloneState(state);
    newState.positions[color][move.pieceIndex] = move.to;
    if (move.captured) {
      const opp = otherColor(color);
      const idx = newState.positions[opp].indexOf(move.to);
      if (idx !== -1) newState.positions[opp][idx] = 0;
    }
    return newState;
  }

  function hasWon(state, color) {
    return state.positions[color].every((p) => p >= HOME);
  }

  function countHome(state, color) {
    return state.positions[color].filter((p) => p >= HOME).length;
  }

  function countAtStart(state, color) {
    return state.positions[color].filter((p) => p === 0).length;
  }

  return {
    PIECES_PER_PLAYER,
    PATH_LENGTH,
    HOME,
    SHARED_START,
    SHARED_END,
    ROLL_PROBABILITY,
    otherColor,
    createInitialState,
    cloneState,
    isRosette,
    isShared,
    rollDice,
    getLegalMoves,
    applyMove,
    hasWon,
    countHome,
    countAtStart
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = UrCore;
}
if (typeof window !== "undefined") {
  window.UrCore = UrCore;
}
