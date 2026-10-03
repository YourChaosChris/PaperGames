// dotsandboxes-core.js
// Dependency-free rules engine for Dots and Boxes. Mirrors the separation
// of concerns in the other <game>-core.js modules: rules only, no
// DOM/UI.
//
// Board: a square grid of 5, 6, 7 or 9 dots per side (4x4, 5x5, 6x6
// or 8x8 boxes), chosen when a game starts and kept in the state as `dots`;
// every function reads the size from the state it is given. A state
// saved before sizes existed has no `dots` and is read as 5 (its grid
// is 5x5). Players take turns drawing one horizontal or
// vertical line segment between two adjacent dots. Completing the 4th
// side of a box scores that box for whoever drew the completing line,
// and that player immediately moves again - which can chain through
// several boxes, or several separate turns, before a line is finally
// drawn that completes nothing and control passes to the other player.
// The game ends once all lines are drawn; most boxes wins, equal boxes
// is a draw.
//
// State shape:
//   dots         - dots per side (5, 6, 7 or 9)
//   hLines[r][c] - the horizontal line between dot(r,c) and dot(r,c+1);
//                  r: 0..dots-1, c: 0..dots-2
//   vLines[r][c] - the vertical line between dot(r,c) and dot(r+1,c);
//                  r: 0..dots-2, c: 0..dots-1
//   Both hold null (undrawn) or the player id ("1"/"2") who drew it.
//   boxes[r][c]  - box (r,c) (top-left dot at (r,c)), null until
//                  completed, then the player id who completed it.
//   turn         - "1" | "2", whose move it is now.
//   scores       - { "1": n, "2": n } boxes completed so far.
//   linesDrawn   - count of lines drawn so far (game ends once all
//                  dots * (dots - 1) * 2 lines are drawn: 40, 60, 84 or 144).
//   gameOver     - true once every line is drawn.
//   winner       - "1" | "2" | "draw" | null (null until gameOver).

const DotsAndBoxesCore = (function () {
  // Allowed dots per side (4x4, 5x5, 6x6, 8x8 boxes). Deliberately no
  // 10x10 (11 dots): on a 632 px reader a line's tap area would shrink
  // to about 38 px, too small to hit reliably with a finger (the floor
  // here is 44 px). Don't add it without solving that first.
  const SIZES = [5, 6, 7, 9];
  const DEFAULT_DOTS = 5;

  function makeGrid(rows, cols, fill) {
    return Array.from({ length: rows }, () => new Array(cols).fill(fill));
  }

  // Dots per side of a state; a state saved before sizes existed has no
  // `dots`, its grid (5 rows of horizontal lines) tells.
  function dotsOf(state) {
    if (state && SIZES.indexOf(state.dots) !== -1) return state.dots;
    if (state && state.hLines && SIZES.indexOf(state.hLines.length) !== -1) return state.hLines.length;
    return DEFAULT_DOTS;
  }

  function totalLines(state) {
    const d = dotsOf(state);
    return d * (d - 1) * 2;
  }

  function createInitialState(dots) {
    const d = SIZES.indexOf(dots) !== -1 ? dots : DEFAULT_DOTS;
    return {
      dots: d,
      hLines: makeGrid(d, d - 1, null),
      vLines: makeGrid(d - 1, d, null),
      boxes: makeGrid(d - 1, d - 1, null),
      turn: "1",
      scores: { "1": 0, "2": 0 },
      linesDrawn: 0,
      gameOver: false,
      winner: null
    };
  }

  function cloneState(state) {
    return {
      dots: dotsOf(state),
      hLines: state.hLines.map((row) => row.slice()),
      vLines: state.vLines.map((row) => row.slice()),
      boxes: state.boxes.map((row) => row.slice()),
      turn: state.turn,
      scores: { "1": state.scores["1"], "2": state.scores["2"] },
      linesDrawn: state.linesDrawn,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  function otherPlayer(p) {
    return p === "1" ? "2" : "1";
  }

  function inBoundsMove(move, state) {
    const d = dotsOf(state);
    if (move.type === "h") return move.r >= 0 && move.r < d && move.c >= 0 && move.c < d - 1;
    if (move.type === "v") return move.r >= 0 && move.r < d - 1 && move.c >= 0 && move.c < d;
    return false;
  }

  function isLineDrawn(state, move) {
    if (move.type === "h") return !!state.hLines[move.r][move.c];
    return !!state.vLines[move.r][move.c];
  }

  function isLegalMove(state, move) {
    return !state.gameOver && inBoundsMove(move, state) && !isLineDrawn(state, move);
  }

  function getLegalMoves(state) {
    const moves = [];
    if (state.gameOver) return moves;
    const d = dotsOf(state);
    for (let r = 0; r < d; r++) {
      for (let c = 0; c < d - 1; c++) {
        if (!state.hLines[r][c]) moves.push({ type: "h", r, c });
      }
    }
    for (let r = 0; r < d - 1; r++) {
      for (let c = 0; c < d; c++) {
        if (!state.vLines[r][c]) moves.push({ type: "v", r, c });
      }
    }
    return moves;
  }

  // The box(es) - zero, one, or two - that touch a given line. An edge
  // line touches only one box; every interior line touches the two
  // boxes on either side of it. The board size comes from `state`.
  function adjacentBoxes(move, state) {
    const lastBox = dotsOf(state) - 2;
    const boxes = [];
    if (move.type === "h") {
      // Horizontal line at dot-row r spans dot(r,c)-dot(r,c+1): the box
      // above it is box(r-1,c), the box below it is box(r,c).
      if (move.r - 1 >= 0) boxes.push([move.r - 1, move.c]);
      if (move.r <= lastBox) boxes.push([move.r, move.c]);
    } else {
      // Vertical line at dot-col c spans dot(r,c)-dot(r+1,c): the box
      // to its left is box(r,c-1), the box to its right is box(r,c).
      if (move.c - 1 >= 0) boxes.push([move.r, move.c - 1]);
      if (move.c <= lastBox) boxes.push([move.r, move.c]);
    }
    return boxes;
  }

  function boxSidesDrawn(state, br, bc) {
    let n = 0;
    if (state.hLines[br][bc]) n++;       // top
    if (state.hLines[br + 1][bc]) n++;   // bottom
    if (state.vLines[br][bc]) n++;       // left
    if (state.vLines[br][bc + 1]) n++;   // right
    return n;
  }

  function isBoxComplete(state, br, bc) {
    return boxSidesDrawn(state, br, bc) === 4;
  }

  // Applies `move` for the player whose turn it currently is. Returns
  // { state: newState, boxesCompleted: [[r,c], ...] }. Assumes the
  // caller already checked isLegalMove/getLegalMoves - like every other
  // <game>-core.js here, invalid input isn't defensively rejected.
  function applyMove(state, move) {
    const mover = state.turn;
    const newState = cloneState(state);

    if (move.type === "h") newState.hLines[move.r][move.c] = mover;
    else newState.vLines[move.r][move.c] = mover;
    newState.linesDrawn++;

    const boxesCompleted = [];
    adjacentBoxes(move, newState).forEach(([br, bc]) => {
      if (newState.boxes[br][bc] == null && isBoxComplete(newState, br, bc)) {
        newState.boxes[br][bc] = mover;
        newState.scores[mover]++;
        boxesCompleted.push([br, bc]);
      }
    });

    if (newState.linesDrawn >= totalLines(newState)) {
      newState.gameOver = true;
      if (newState.scores["1"] > newState.scores["2"]) newState.winner = "1";
      else if (newState.scores["2"] > newState.scores["1"]) newState.winner = "2";
      else newState.winner = "draw";
    } else {
      // Completing at least one box earns an extra turn; otherwise play
      // passes to the other player. This is the one rule that makes
      // Dots and Boxes different from a plain alternating-turns game,
      // and it's what lets a single player run through a whole chain of
      // boxes across many consecutive calls to applyMove.
      newState.turn = boxesCompleted.length > 0 ? mover : otherPlayer(mover);
    }

    return { state: newState, boxesCompleted };
  }

  // True if drawing `move` would leave some not-yet-owned adjacent box
  // at exactly 3 drawn sides - i.e. it would hand the opponent a free
  // capture next turn. A move that completes a box itself (bringing it
  // to 4) is never "unsafe" by this definition.
  function wouldCreateThreeSideBox(state, move) {
    return adjacentBoxes(move, state).some(([br, bc]) => {
      if (state.boxes[br][bc] != null) return false;
      return boxSidesDrawn(state, br, bc) + 1 === 3;
    });
  }

  // True if drawing `move` completes at least one box outright (it's
  // already sitting at 3 drawn sides).
  function moveCompletesBox(state, move) {
    return adjacentBoxes(move, state).some(([br, bc]) => {
      if (state.boxes[br][bc] != null) return false;
      return boxSidesDrawn(state, br, bc) === 3;
    });
  }

  function safeMoves(state) {
    return getLegalMoves(state).filter((m) => !wouldCreateThreeSideBox(state, m));
  }

  function capturingMoves(state) {
    return getLegalMoves(state).filter((m) => moveCompletesBox(state, m));
  }

  return {
    SIZES,
    DEFAULT_DOTS,
    dotsOf,
    totalLines,
    createInitialState,
    cloneState,
    otherPlayer,
    inBoundsMove,
    isLineDrawn,
    isLegalMove,
    getLegalMoves,
    adjacentBoxes,
    boxSidesDrawn,
    isBoxComplete,
    applyMove,
    wouldCreateThreeSideBox,
    moveCompletesBox,
    safeMoves,
    capturingMoves
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DotsAndBoxesCore;
}
if (typeof window !== "undefined") {
  window.DotsAndBoxesCore = DotsAndBoxesCore;
}
