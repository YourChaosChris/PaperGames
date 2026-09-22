// ludo-core.js
// Dependency-free rules engine for Ludo, the simplified modern
// descendant of the ancient Indian race game Pachisi (see
// ludo-history.html for the background). No DOM code lives here - this
// is pure board/turn state plus legal-move generation, shared by
// ludo-app.js (human interaction) and ludo-ai.js (computer players).
//
// Board model: up to 4 colors (red, green, yellow, blue), each with 4
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
  // The traditional "star" safe square on each arm, 8 squares ahead of
  // that color's own start square.
  const STAR_OFFSET = 8;

  const SAFE_SQUARES = (function () {
    const set = {};
    COLOR_ORDER.forEach((c) => {
      set[START_INDEX[c]] = true;
      set[(START_INDEX[c] + STAR_OFFSET) % TRACK_LENGTH] = true;
    });
    return set;
  })();

  function isSafeAbs(absIndex) {
    return !!SAFE_SQUARES[absIndex];
  }

  function absTrackIndex(color, rel) {
    return (START_INDEX[color] + rel) % TRACK_LENGTH;
  }

  function createInitialState(activeColors) {
    const colors = (activeColors && activeColors.length ? activeColors : COLOR_ORDER).slice();
    const tokens = {};
    colors.forEach((c) => {
      tokens[c] = [];
      for (let i = 0; i < PIECES_PER_COLOR; i++) tokens[c].push({ state: "home", rel: null });
    });
    return {
      activeColors: colors,
      tokens,
      turnIndex: 0,
      gameOver: false,
      winner: null
    };
  }

  function cloneState(state) {
    const tokens = {};
    state.activeColors.forEach((c) => {
      tokens[c] = state.tokens[c].map((t) => ({ state: t.state, rel: t.rel }));
    });
    return {
      activeColors: state.activeColors.slice(),
      tokens,
      turnIndex: state.turnIndex,
      gameOver: state.gameOver,
      winner: state.winner
    };
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
  // rel <= 50) currently sit on absolute square `absIndex`.
  function colorCountAtAbs(state, color, absIndex) {
    let count = 0;
    state.tokens[color].forEach((t) => {
      if (t.state === "active" && t.rel <= LAST_TRACK_REL && absTrackIndex(color, t.rel) === absIndex) count++;
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
    for (let step = 1; step <= roll; step++) {
      const r = fromRel + step;
      if (r > LAST_TRACK_REL) break; // now inside the home column/hub - no shared squares left to cross
      const abs = absTrackIndex(color, r);
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
      return !isBlockedForOpponent(state, color, absTrackIndex(color, 0));
    }

    // active
    const target = token.rel + roll;
    if (target > FINISH_REL) return false; // would overshoot the finish hub
    return !pathBlocked(state, color, token.rel, roll);
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
    const next = cloneState(state);
    const token = next.tokens[color][tokenIndex];
    const captured = [];
    let finished = false;
    let enteredPlay = false;

    if (token.state === "home") {
      token.state = "active";
      token.rel = 0;
      enteredPlay = true;
      // The start square is always one of the fixed safe squares, so
      // entering play never captures anything - kept generic anyway.
      maybeCapture(next, color, absTrackIndex(color, 0), captured);
    } else {
      const target = token.rel + roll;
      if (target === FINISH_REL) {
        token.state = "finished";
        token.rel = null;
        finished = true;
      } else {
        token.rel = target;
        if (target <= LAST_TRACK_REL) {
          maybeCapture(next, color, absTrackIndex(color, target), captured);
        }
      }
    }

    const allFinished = next.tokens[color].every((t) => t.state === "finished");
    if (allFinished) {
      next.gameOver = true;
      next.winner = color;
    }

    return { state: next, captured, finished, enteredPlay };
  }

  function maybeCapture(state, movingColor, absIndex, captured) {
    if (isSafeAbs(absIndex)) return;
    state.activeColors.forEach((oc) => {
      if (oc === movingColor) return;
      state.tokens[oc].forEach((t, i) => {
        if (t.state === "active" && t.rel <= LAST_TRACK_REL && absTrackIndex(oc, t.rel) === absIndex) {
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
    STAR_OFFSET,
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
