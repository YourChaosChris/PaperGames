// seega-core.js
// Dependency-free rules engine for Seega, the Egyptian game of placing
// and custodian capture. Rules only, no DOM/UI.
//
// Rules as decided for PaperGames on 06.10.2026, after Wikipedia,
// "Seega (game)" (https://en.wikipedia.org/wiki/Seega_(game)) and the
// Ludii Portal, "Seega" (https://ludii.games/details.php?keyword=Seega):
//
// Board: 5x5 squares, indexed r*5+c. 12 stones per side.
//
// Placing phase: the sides take turns, each turn placing two stones on
// empty squares - never on the centre, which stays empty - until all 24
// stones are on the board. Nothing is captured while placing.
//
// Moving phase: whoever began placing moves first. As the centre is then
// the only empty square, that first move necessarily brings a stone onto
// it. A stone moves one square across or down/up (never diagonally) to
// an empty neighbouring square.
//
// Capture (custodian): an enemy stone that the move leaves between the
// moved stone and another own stone, in a straight line across or down,
// is captured. One move can capture several stones (in different
// directions). A stone that moves between two enemy stones itself is not
// captured. The centre is not a safe square.
//
// After a capturing move the same player may move again, as long as
// that move captures too. PaperGames rule: with the same stone (so it
// works like a multi-jump elsewhere); the player may also stop.
//
// A player who cannot move on their turn passes. The game is won by
// taking all of the opponent's stones. PaperGames rule to end blocked or
// endless games: after QUIET_LIMIT (40) turns in a row without a capture
// (20 per side; a pass counts as a turn), or when neither side can move,
// the game ends; whoever has more stones wins, equal numbers is a draw.

const SeegaCore = (function () {
  const SIZE = 5;
  const CELLS = SIZE * SIZE;
  const CENTER = 12;
  const STONES = 12;
  const PER_TURN = 2;
  const QUIET_LIMIT = 40;

  function rowOf(i) { return Math.floor(i / SIZE); }
  function colOf(i) { return i % SIZE; }
  function otherColor(c) { return c === "b" ? "w" : "b"; }

  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  // STEP[i] = [{ to, dr, dc }] orthogonal neighbours.
  const STEP = [];
  for (let i = 0; i < CELLS; i++) {
    const r = rowOf(i), c = colOf(i), list = [];
    DIRS.forEach(([dr, dc]) => {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) list.push({ to: nr * SIZE + nc, dr, dc });
    });
    STEP.push(list);
  }

  // starter: the colour that places (and later moves) first.
  function createInitialState(starter) {
    return {
      board: new Array(CELLS).fill(null),
      phase: "place",
      inHand: { b: STONES, w: STONES },
      turn: starter,
      starter: starter,
      placedInTurn: 0,
      quiet: 0,
      chain: null,       // square of the stone that may capture again, or null
      passed: null,      // colour that had to pass just now, or null
      over: false,
      result: null       // { winner: "b"|"w"|null, reason }
    };
  }

  function cloneState(s) {
    return {
      board: s.board.slice(), phase: s.phase, inHand: { b: s.inHand.b, w: s.inHand.w },
      turn: s.turn, starter: s.starter, placedInTurn: s.placedInTurn, quiet: s.quiet,
      chain: s.chain, passed: s.passed || null, over: s.over, result: s.result ? { winner: s.result.winner, reason: s.result.reason } : null
    };
  }

  function count(board, color) {
    let n = 0;
    for (let i = 0; i < CELLS; i++) if (board[i] === color) n++;
    return n;
  }

  function legalPlacements(s) {
    if (s.over || s.phase !== "place") return [];
    const out = [];
    for (let i = 0; i < CELLS; i++) if (i !== CENTER && s.board[i] === null) out.push(i);
    return out;
  }

  // The enemy stones a stone of `color` arriving on `to` would capture.
  function capturesFor(board, to, color) {
    const enemy = otherColor(color);
    const r = rowOf(to), c = colOf(to), out = [];
    DIRS.forEach(([dr, dc]) => {
      const r1 = r + dr, c1 = c + dc, r2 = r + 2 * dr, c2 = c + 2 * dc;
      if (r2 < 0 || r2 >= SIZE || c2 < 0 || c2 >= SIZE) return;
      if (board[r1 * SIZE + c1] === enemy && board[r2 * SIZE + c2] === color) out.push(r1 * SIZE + c1);
    });
    return out;
  }

  function stepMoves(board, color, onlyFrom) {
    const out = [];
    for (let i = 0; i < CELLS; i++) {
      if (board[i] !== color || (onlyFrom !== undefined && onlyFrom !== null && i !== onlyFrom)) continue;
      STEP[i].forEach(({ to }) => {
        if (board[to] !== null) return;
        const b = board.slice();
        b[to] = color; b[i] = null;
        out.push({ from: i, to, captured: capturesFor(b, to, color) });
      });
    }
    return out;
  }

  // Legal moves in the moving phase. During a capture chain only further
  // capturing moves of that stone, plus { stop: true } to end the turn.
  function legalMoves(s) {
    if (s.over || s.phase !== "move") return [];
    if (s.chain !== null) {
      const more = stepMoves(s.board, s.turn, s.chain).filter((m) => m.captured.length);
      return more.concat([{ stop: true }]);
    }
    return stepMoves(s.board, s.turn);
  }

  function canMove(board, color) {
    return stepMoves(board, color).length > 0;
  }

  function finish(s, reason) {
    const b = count(s.board, "b"), w = count(s.board, "w");
    s.over = true;
    s.chain = null;
    s.result = { winner: b === w ? null : (b > w ? "b" : "w"), reason };
    return s;
  }

  // Hands the turn over; passes a side that cannot move; ends the game
  // when a side has no stones, neither side can move, or the quiet limit
  // is reached.
  function endTurn(s) {
    s.chain = null;
    if (count(s.board, "b") === 0 || count(s.board, "w") === 0) {
      s.over = true;
      s.result = { winner: count(s.board, "b") ? "b" : "w", reason: "all-captured" };
      return s;
    }
    if (s.quiet >= QUIET_LIMIT) return finish(s, "quiet");
    s.turn = otherColor(s.turn);
    if (!canMove(s.board, s.turn)) {
      if (!canMove(s.board, otherColor(s.turn))) return finish(s, "blocked");
      s.passed = s.turn;          // remembered for the status line
      s.quiet++;
      if (s.quiet >= QUIET_LIMIT) return finish(s, "quiet");
      s.turn = otherColor(s.turn);
    } else {
      s.passed = null;
    }
    return s;
  }

  function applyPlacement(state, i) {
    const s = cloneState(state);
    s.board[i] = s.turn;
    s.inHand[s.turn]--;
    s.placedInTurn++;
    if (s.inHand.b === 0 && s.inHand.w === 0) {
      s.phase = "move";
      s.placedInTurn = 0;
      s.turn = s.starter;
      if (!canMove(s.board, s.turn)) {
        // Only possible if all four squares next to the centre hold the
        // other side's stones: the starter passes.
        s.passed = s.turn;
        s.turn = otherColor(s.turn);
      }
      return s;
    }
    if (s.placedInTurn >= PER_TURN || s.inHand[s.turn] === 0) {
      s.placedInTurn = 0;
      s.turn = otherColor(s.turn);
    }
    return s;
  }

  function applyMove(state, move) {
    const s = cloneState(state);
    if (move.stop) return endTurn(s);
    s.board[move.to] = s.board[move.from];
    s.board[move.from] = null;
    move.captured.forEach((i) => { s.board[i] = null; });
    if (move.captured.length) {
      s.quiet = 0;
      const enemyLeft = count(s.board, otherColor(s.turn));
      const more = enemyLeft && stepMoves(s.board, s.turn, move.to).some((m) => m.captured.length);
      if (more) { s.chain = move.to; return s; }
      return endTurn(s);
    }
    s.quiet++;
    return endTurn(s);
  }

  return {
    SIZE, CELLS, CENTER, STONES, PER_TURN, QUIET_LIMIT, STEP, rowOf, colOf, otherColor,
    createInitialState, cloneState, count, legalPlacements, capturesFor, stepMoves, legalMoves,
    canMove, applyPlacement, applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SeegaCore;
}
if (typeof window !== "undefined") {
  window.SeegaCore = SeegaCore;
}
