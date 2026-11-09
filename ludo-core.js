// ludo-core.js
// Dependency-free rules engine for Ludo, the simplified modern
// descendant of the ancient Indian race game Pachisi (see
// ludo-history.html for the background). No DOM code lives here - this
// is pure board/turn state plus legal-move generation, shared by
// ludo-app.js (human interaction) and ludo-ai.js (computer players).
//
// Board model: up to 4 colors (red, green, yellow, blue) - 6 on the
// six-arm board, plus purple and orange - each with 4
// tokens. Rather than storing pixel/grid coordinates here (that's
// ludo-app.js's job for rendering the cross-shaped board), each color's
// journey is tracked as a single "relative position" number:
//
//   token.state === "home"     - sitting in the home base, not yet in play
//   token.state === "active"   - on the board, token.rel is 0..56
//   token.state === "finished" - safely in the center finish hub
//
// For an active token, rel 0..50 (51 squares) means it's on the shared
// 52-square outer track, at absolute square (START_INDEX[color] + rel)
// mod 52; rel 51..55 (5 squares) means it's in that color's own private
// home column ("home stretch"), never shared with any other color -
// matching the physical board, where each arm has room for only 5
// private squares between the shared track and the center hub. Reaching
// rel 56 - one step past the last home column square - means the token
// has arrived in the center finish hub.
//
// Colors are spaced 13 squares apart around the 52-square track (52 / 4
// colors = 13), in clockwise order red -> green -> yellow -> blue, which
// is also ludo-app.js's rendering order around the cross-shaped board.
//
// Six-player board (task 109): the same rules on a board with six arms.
// Every arm still has 13 track squares, so the track has 6 x 13 = 78
// squares, the colors start 13 apart (0, 13, 26, 39, 52, 65), a token
// walks 77 squares of shared track before its 5-square home column and
// reaches the finish at rel 82. A state for this board carries
// `board: 6`; a state without `board` (every classic game and every
// save from before) is the classic 4-arm board, unchanged. The exported
// constants below (TRACK_LENGTH, START_INDEX, ...) describe the classic
// board; geometry(board) gives the numbers for either board.

// Arrow Ludo (task 189, rules redone in task 191 after a player's report):
// the same rules as Ludo on the classic four-arm board, plus one arrow
// square per color, the 4th square after its start (own route square 4,
// the inner end of the arm right beside the middle). The four arrow
// squares are 4, 17, 30 and 43 on the track. A token that ends its move
// on ANY arrow square - its own or another color's, on its first lap or
// later - flies diagonally across the middle to the arrow square
// opposite, 26 track squares away. For a token on the first half of its
// lap (own route square 4 or 17) that is a jump forward; on the second
// half (30 or 43) the opposite square lies behind it, so it flies back
// and has to walk half a lap again. The landing square of a flight never
// starts a second flight. The flight captures on the arrow square and on
// the square it lands on, and is not allowed when two opposing tokens
// block the landing square. It never leaves the shared track, so no
// token can skip its own path into the finish. A state for this game
// carries `arrows: true`; every other state is plain Ludo.
const LudoCore = (function () {
  const COLOR_ORDER = ["red", "green", "yellow", "blue"];
  const PIECES_PER_COLOR = 4;
  const TRACK_LENGTH = 52;
  const HOME_COLUMN_LENGTH = 5;
  const MAIN_TRACK_STEPS = TRACK_LENGTH - 1; // 51: rel 0..50 sit on the shared track
  const LAST_TRACK_REL = MAIN_TRACK_STEPS - 1; // 50: last rel value still on the shared track
  const FINISH_REL = MAIN_TRACK_STEPS + HOME_COLUMN_LENGTH; // 56
  const SIX_STREAK_LIMIT = 3; // three 6s in a row forfeits the turn (common Ludo variant)

  const START_INDEX = { red: 0, green: 13, yellow: 26, blue: 39 };
  // Own arrow square (route square 4) and where its flight lands (30).
  const ARROW_FROM_REL = 4;
  const ARROW_FLIGHT = 26;
  const ARROW_TO_REL = ARROW_FROM_REL + ARROW_FLIGHT;
  // The four arrow squares on the track (red, green, yellow, blue).
  const ARROW_SQUARES = [4, 17, 30, 43];
  // The traditional "star" safe square on each arm, 8 squares ahead of
  // that color's own start square.
  const STAR_OFFSET = 8;
  const SQUARES_PER_ARM = 13;
  // The six colors in clockwise order around the six-arm board.
  const COLOR_ORDER_6 = ["red", "green", "yellow", "blue", "purple", "orange"];

  // Track numbers for a board with 4 or 6 arms (anything else counts as
  // the classic board).
  const GEOMETRY = {};
  [4, 6].forEach((arms) => {
    const colors = arms === 6 ? COLOR_ORDER_6 : COLOR_ORDER;
    const trackLength = arms * SQUARES_PER_ARM;
    const start = {};
    const safe = {};
    colors.forEach((c, i) => {
      start[c] = i * SQUARES_PER_ARM;
      safe[start[c]] = true;
      safe[(start[c] + STAR_OFFSET) % trackLength] = true;
    });
    const mainTrackSteps = trackLength - 1;
    GEOMETRY[arms] = {
      arms,
      colors,
      trackLength,
      mainTrackSteps,
      lastTrackRel: mainTrackSteps - 1,
      finishRel: mainTrackSteps + HOME_COLUMN_LENGTH,
      start,
      safe
    };
  });

  // `board` is 4, 6 or a game state (its `board` field, missing = 4).
  function geometry(board) {
    const arms = board && typeof board === "object" ? board.board : board;
    return GEOMETRY[arms === 6 ? 6 : 4];
  }

  function isSafeAbs(absIndex, board) {
    return !!geometry(board).safe[absIndex];
  }

  function absTrackIndex(color, rel, board) {
    const g = geometry(board);
    return (g.start[color] + rel) % g.trackLength;
  }

  // options.board: 6 for the six-arm board; the classic state has no
  // `board` field at all, exactly as before.
  function createInitialState(activeColors, options) {
    const arrows = !!(options && options.arrows);
    const board = !arrows && options && options.board === 6 ? 6 : 4;
    const colors = (activeColors && activeColors.length ? activeColors : geometry(board).colors).slice();
    const tokens = {};
    colors.forEach((c) => {
      tokens[c] = [];
      for (let i = 0; i < PIECES_PER_COLOR; i++) tokens[c].push({ state: "home", rel: null });
    });
    const state = {
      activeColors: colors,
      tokens,
      turnIndex: 0,
      gameOver: false,
      winner: null
    };
    if (board === 6) state.board = 6;
    if (arrows) state.arrows = true;
    return state;
  }

  function cloneState(state) {
    const tokens = {};
    state.activeColors.forEach((c) => {
      tokens[c] = state.tokens[c].map((t) => ({ state: t.state, rel: t.rel }));
    });
    const copy = {
      activeColors: state.activeColors.slice(),
      tokens,
      turnIndex: state.turnIndex,
      gameOver: state.gameOver,
      winner: state.winner
    };
    if (state.board === 6) copy.board = 6;
    if (state.arrows) copy.arrows = true;
    return copy;
  }

  function currentColor(state) {
    return state.activeColors[state.turnIndex];
  }

  function nextTurnIndex(state) {
    return (state.turnIndex + 1) % state.activeColors.length;
  }

  function rollDie(rng) {
    const random = rng || Math.random;
    return Math.floor(random() * 6) + 1;
  }

  // How many of `color`'s own active tokens (still on the shared track,
  // rel <= 50, or <= 76 on the six-arm board) currently sit on absolute
  // square `absIndex`.
  function colorCountAtAbs(state, color, absIndex) {
    const g = geometry(state);
    let count = 0;
    state.tokens[color].forEach((t) => {
      if (t.state === "active" && t.rel <= g.lastTrackRel && absTrackIndex(color, t.rel, state) === absIndex) count++;
    });
    return count;
  }

  // Two or more of one color's tokens sharing a shared-track square form
  // a "block" that opponents can neither land on nor move past.
  function isBlockedForOpponent(state, movingColor, absIndex) {
    return state.activeColors.some((c) => c !== movingColor && colorCountAtAbs(state, c, absIndex) >= 2);
  }

  // Walks the squares a token would cross (not counting the one it's
  // already on) for a given roll, stopping once it would leave the
  // shared track for its own private home column. Returns true if any
  // of those shared-track squares holds an opposing block.
  function pathBlocked(state, color, fromRel, roll) {
    const g = geometry(state);
    for (let step = 1; step <= roll; step++) {
      const r = fromRel + step;
      if (r > g.lastTrackRel) break; // now inside the home column/hub - no shared squares left to cross
      const abs = absTrackIndex(color, r, state);
      if (isBlockedForOpponent(state, color, abs)) return true;
    }
    return false;
  }

  function isLegalMove(state, color, tokenIndex, roll) {
    const token = state.tokens[color] && state.tokens[color][tokenIndex];
    if (!token) return false;
    if (token.state === "finished") return false;

    if (token.state === "home") {
      if (roll !== 6) return false;
      return !isBlockedForOpponent(state, color, absTrackIndex(color, 0, state));
    }

    // active
    const target = token.rel + roll;
    if (target > geometry(state).finishRel) return false; // would overshoot the finish hub
    if (pathBlocked(state, color, token.rel, roll)) return false;
    return !arrowBlocked(state, color, target);
  }

  // Arrow Ludo: where a token of `color` that ends its move on route
  // square `rel` flies to (a route square again), or null when `rel` is
  // no arrow square (or the game has no arrows).
  function arrowFlightRel(state, color, rel) {
    if (!state.arrows || rel === null || rel > LAST_TRACK_REL) return null;
    const abs = absTrackIndex(color, rel, state);
    if (ARROW_SQUARES.indexOf(abs) === -1) return null;
    const toAbs = (abs + ARROW_FLIGHT) % TRACK_LENGTH;
    return (toAbs - START_INDEX[color] + TRACK_LENGTH) % TRACK_LENGTH;
  }

  // Landing on an arrow square sends the token to the arrow square
  // opposite, so an opposing block there stops the move.
  function arrowBlocked(state, color, target) {
    const to = arrowFlightRel(state, color, target);
    return to !== null && isBlockedForOpponent(state, color, absTrackIndex(color, to, state));
  }

  // Why a move isn't allowed - for the on-screen hint, not for the rules
  // (isLegalMove above stays the single source of truth). Returns null
  // when the move is legal.
  function illegalReason(state, color, tokenIndex, roll) {
    const token = state.tokens[color] && state.tokens[color][tokenIndex];
    if (!token) return null;
    if (token.state === "finished") return "finished";
    if (token.state === "home") {
      if (roll !== 6) return "needs-six";
      return isBlockedForOpponent(state, color, absTrackIndex(color, 0, state)) ? "blocked" : null;
    }
    if (token.rel + roll > geometry(state).finishRel) return "overshoot";
    if (pathBlocked(state, color, token.rel, roll)) return "blocked";
    if (arrowBlocked(state, color, token.rel + roll)) return "blocked";
    return null;
  }

  function getLegalMoves(state, color, roll) {
    const moves = [];
    for (let i = 0; i < PIECES_PER_COLOR; i++) {
      if (isLegalMove(state, color, i, roll)) moves.push(i);
    }
    return moves;
  }

  // Returns { state, captured, finished, enteredPlay }. `captured` is a
  // list of { color, index } for opposing tokens sent back to their home
  // base by this move.
  function applyMove(state, color, tokenIndex, roll) {
    const g = geometry(state);
    const next = cloneState(state);
    const token = next.tokens[color][tokenIndex];
    const captured = [];
    let finished = false;
    let enteredPlay = false;
    let jumped = false;
    let flightFromRel = null; // the arrow square a flight started from

    if (token.state === "home") {
      token.state = "active";
      token.rel = 0;
      enteredPlay = true;
      // The start square is always one of the fixed safe squares, so
      // entering play never captures anything - kept generic anyway.
      maybeCapture(next, color, absTrackIndex(color, 0, next), captured);
    } else {
      const target = token.rel + roll;
      if (target === g.finishRel) {
        token.state = "finished";
        token.rel = null;
        finished = true;
      } else {
        token.rel = target;
        if (target <= g.lastTrackRel) {
          maybeCapture(next, color, absTrackIndex(color, target, next), captured);
        }
        const flyTo = arrowFlightRel(next, color, target);
        if (flyTo !== null) {
          flightFromRel = target;
          token.rel = flyTo;
          jumped = true;
          maybeCapture(next, color, absTrackIndex(color, flyTo, next), captured);
        }
      }
    }

    const allFinished = next.tokens[color].every((t) => t.state === "finished");
    if (allFinished) {
      next.gameOver = true;
      next.winner = color;
    }

    // `jumped`: the token flew from route square `flightFromRel` across
    // the middle (forward or back) to where it stands now.
    return { state: next, captured, finished, enteredPlay, jumped, flightFromRel };
  }

  function maybeCapture(state, movingColor, absIndex, captured) {
    if (isSafeAbs(absIndex, state)) return;
    const g = geometry(state);
    state.activeColors.forEach((oc) => {
      if (oc === movingColor) return;
      state.tokens[oc].forEach((t, i) => {
        if (t.state === "active" && t.rel <= g.lastTrackRel && absTrackIndex(oc, t.rel, state) === absIndex) {
          t.state = "home";
          t.rel = null;
          captured.push({ color: oc, index: i });
        }
      });
    });
  }

  function getWinner(state) {
    return state.winner;
  }

  function tokensFinished(state, color) {
    return state.tokens[color].filter((t) => t.state === "finished").length;
  }

  return {
    COLOR_ORDER,
    PIECES_PER_COLOR,
    TRACK_LENGTH,
    HOME_COLUMN_LENGTH,
    MAIN_TRACK_STEPS,
    LAST_TRACK_REL,
    FINISH_REL,
    SIX_STREAK_LIMIT,
    START_INDEX,
    ARROW_FROM_REL,
    ARROW_TO_REL,
    ARROW_FLIGHT,
    ARROW_SQUARES,
    STAR_OFFSET,
    COLOR_ORDER_6,
    geometry,
    isSafeAbs,
    absTrackIndex,
    createInitialState,
    cloneState,
    currentColor,
    nextTurnIndex,
    rollDie,
    colorCountAtAbs,
    isBlockedForOpponent,
    isLegalMove,
    arrowFlightRel,
    illegalReason,
    getLegalMoves,
    applyMove,
    getWinner,
    tokensFinished
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = LudoCore;
}
if (typeof window !== "undefined") {
  window.LudoCore = LudoCore;
}
