// backgammon-core.js
// Dependency-free rules engine for standard backgammon. The doubling
// cube is a stakes multiplier tracked at the app layer (see
// backgammon-app.js) since it doesn't affect move legality. Mirrors the
// separation of concerns in checkers-core.js/go-core.js: rules only, no
// DOM/UI.
//
// Board: 24 points, numbered 1-24. White ("w") moves from 24 toward 1
// and bears off past 1; Black ("b") moves from 1 toward 24 and bears
// off past 24 - the standard mirrored setup. A point holds checkers of
// at most one color at a time; landing on a single opposing checker (a
// "blot") hits it to the bar, where it must re-enter before that
// player can make any other move.
//
// Each turn's two (or, on doubles, four) die values are played one at a
// time: call getLegalMovesForDie for whichever die the player wants to
// use next, apply one of the returned moves, then move on to the next
// die. This app deliberately doesn't enforce the tournament-precision
// "you must maximize how many dice you use, and play the larger die if
// only one can be played" edge case - if a legal move exists for a
// remaining die, the player may use it in any order; a die that has no
// legal move once it's its turn is simply forfeited.

const BackgammonCore = (function () {
  const POINTS = 24;
  const CHECKERS_PER_PLAYER = 15;

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function direction(color) {
    return color === "w" ? -1 : 1;
  }

  // The two points range that make up each color's home board.
  function homeRange(color) {
    return color === "w" ? [1, 6] : [19, 24];
  }

  function isInHome(color, point) {
    const [lo, hi] = homeRange(color);
    return point >= lo && point <= hi;
  }

  // Pip-distance from a point to bearing off, used to compare "how far
  // from home exit" two points are regardless of color.
  function exitDistance(color, point) {
    return color === "w" ? point : 25 - point;
  }

  function entryPoint(color, die) {
    return color === "w" ? 25 - die : die;
  }

  function createInitialState() {
    const points = new Array(25).fill(null).map(() => ({ color: null, count: 0 }));
    const set = (p, color, count) => { points[p] = { color, count }; };
    set(24, "w", 2); set(13, "w", 5); set(8, "w", 3); set(6, "w", 5);
    set(1, "b", 2); set(12, "b", 5); set(17, "b", 3); set(19, "b", 5);
    return {
      points,
      bar: { b: 0, w: 0 },
      off: { b: 0, w: 0 }
    };
  }

  function cloneState(state) {
    return {
      points: state.points.map((p) => ({ color: p.color, count: p.count })),
      bar: { b: state.bar.b, w: state.bar.w },
      off: { b: state.off.b, w: state.off.w }
    };
  }

  function allCheckersHome(state, color) {
    if (state.bar[color] > 0) return false;
    for (let p = 1; p <= POINTS; p++) {
      if (state.points[p].color === color && !isInHome(color, p)) return false;
    }
    return true;
  }

  function hasCheckerFurtherFromExit(state, color, point) {
    const pDist = exitDistance(color, point);
    const [lo, hi] = homeRange(color);
    for (let q = lo; q <= hi; q++) {
      if (state.points[q].color === color && state.points[q].count > 0 && exitDistance(color, q) > pDist) return true;
    }
    return false;
  }

  function pointIsOpenFor(state, color, point) {
    const target = state.points[point];
    return !target.color || target.color === color || target.count <= 1;
  }

  // Legal moves using a single die value: { from: 'bar'|point, to: point|'off' }
  function getLegalMovesForDie(state, color, die) {
    const moves = [];
    const dir = direction(color);

    if (state.bar[color] > 0) {
      const entry = entryPoint(color, die);
      if (pointIsOpenFor(state, color, entry)) moves.push({ from: "bar", to: entry });
      return moves; // must enter from the bar before any other move
    }

    const canBearOff = allCheckersHome(state, color);
    for (let p = 1; p <= POINTS; p++) {
      if (state.points[p].color !== color || state.points[p].count === 0) continue;
      const to = p + dir * die;
      if (to >= 1 && to <= POINTS) {
        if (pointIsOpenFor(state, color, to)) moves.push({ from: p, to });
      } else if (canBearOff) {
        const exact = color === "w" ? p === die : p === 25 - die;
        if (exact || !hasCheckerFurtherFromExit(state, color, p)) {
          moves.push({ from: p, to: "off" });
        }
      }
    }
    return moves;
  }

  function applyMove(state, color, move) {
    const newState = cloneState(state);
    const opp = otherColor(color);

    if (move.from === "bar") {
      newState.bar[color] -= 1;
    } else {
      const src = newState.points[move.from];
      src.count -= 1;
      if (src.count === 0) src.color = null;
    }

    if (move.to === "off") {
      newState.off[color] += 1;
    } else {
      const dst = newState.points[move.to];
      if (dst.color === opp && dst.count === 1) {
        dst.color = null;
        dst.count = 0;
        newState.bar[opp] += 1;
      }
      if (dst.color === color) {
        dst.count += 1;
      } else {
        dst.color = color;
        dst.count = 1;
      }
    }
    return newState;
  }

  function rollDice(rng) {
    const random = rng || Math.random;
    const d1 = 1 + Math.floor(random() * 6);
    const d2 = 1 + Math.floor(random() * 6);
    return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
  }

  function hasAnyLegalMove(state, color, dice) {
    return dice.some((d) => getLegalMovesForDie(state, color, d).length > 0);
  }

  function hasWon(state, color) {
    return state.off[color] === CHECKERS_PER_PLAYER;
  }

  // "Gammon" (opponent bore off none) and "backgammon" (opponent still
  // has a checker in the winner's home board or on the bar) scoring, for
  // display purposes only - this app doesn't use a doubling cube/stakes.
  function scoreMultiplier(state, winner) {
    const loser = otherColor(winner);
    if (state.off[loser] > 0) return 1;
    const [lo, hi] = homeRange(winner);
    if (state.bar[loser] > 0) return 3;
    for (let p = lo; p <= hi; p++) {
      if (state.points[p].color === loser) return 3;
    }
    return 2;
  }

  return {
    POINTS,
    CHECKERS_PER_PLAYER,
    otherColor,
    direction,
    homeRange,
    isInHome,
    entryPoint,
    createInitialState,
    cloneState,
    allCheckersHome,
    getLegalMovesForDie,
    applyMove,
    rollDice,
    hasAnyLegalMove,
    hasWon,
    scoreMultiplier
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BackgammonCore;
}
if (typeof window !== "undefined") {
  window.BackgammonCore = BackgammonCore;
}
