// amazons-core.js
// Dependency-free rules engine for The Game of the Amazons: a 10x10
// board, four amazons per player, no captures. A turn has two parts -
// move one of your own amazons any number of empty squares like a
// chess queen (horizontally, vertically, or diagonally), then from
// that amazon's new square shoot an arrow the same way. Wherever the
// arrow lands is burned: permanently impassable terrain for the rest
// of the game, for every amazon and every future arrow alike.
//
// Cells are (row, col) in 0..9. Board values are null (empty), "p1",
// "p2", or "burned". There is no capturing anywhere in this game - a
// player loses only when it's their turn and not one of their four
// amazons has a single legal queen-move left (every direction from
// every amazon is blocked by another amazon, a burned square, or the
// edge of the board).

const AmazonsCore = (function () {
  const SIZE = 10;

  const DIRS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  // The standard starting position: each side's four amazons sit at
  // the 180-degree rotational mirror of the other's (the classic
  // d1/g1/a4/j4 for one side and d10/g10/a7/j7 for the other, once
  // columns a-j become 0-9 and this engine's row 0 is one side's own
  // back rank).
  const P1_START = [[0, 3], [0, 6], [3, 0], [3, 9]];
  const P2_START = [[9, 3], [9, 6], [6, 0], [6, 9]];

  function otherPlayer(player) {
    return player === "p1" ? "p2" : "p1";
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function createInitialBoard() {
    const board = [];
    for (let r = 0; r < SIZE; r++) board.push(new Array(SIZE).fill(null));
    P1_START.forEach(([r, c]) => { board[r][c] = "p1"; });
    P2_START.forEach(([r, c]) => { board[r][c] = "p2"; });
    return board;
  }

  function createInitialState() {
    return {
      board: createInitialBoard(),
      currentPlayer: "p1",
      gameOver: false,
      winner: null
    };
  }

  function cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  function cloneState(state) {
    return {
      board: cloneBoard(state.board),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner
    };
  }

  // Every square reachable from (r, c) by one queen-style slide: any
  // number of steps in a straight line through empty squares, landing
  // on an empty square - shared by both halves of a turn (the piece
  // move and the arrow shot use exactly the same movement rule, just
  // from a different starting square and leaving a different mark
  // behind them).
  function slideTargets(board, r, c) {
    const targets = [];
    DIRS.forEach(([dr, dc]) => {
      let nr = r + dr, nc = c + dc;
      while (inBounds(nr, nc) && !board[nr][nc]) {
        targets.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
    });
    return targets;
  }

  function amazonPositions(board, player) {
    const positions = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === player) positions.push([r, c]);
      }
    }
    return positions;
  }

  // What the amazon now sitting at `to` (having just vacated `from`)
  // can shoot its arrow at - computed on a temporary board so the
  // vacated square correctly counts as passable/landable again.
  function arrowTargetsAfterMove(board, from, to, player) {
    const temp = cloneBoard(board);
    temp[from[0]][from[1]] = null;
    temp[to[0]][to[1]] = player;
    return slideTargets(temp, to[0], to[1]);
  }

  // Whether `player` has at least one legal move at all. An amazon
  // that can move anywhere can always also shoot an arrow: at worst,
  // straight back along the path it just came from, since that path
  // was just proven clear and its origin square is now empty again -
  // so checking for game-over reduces to "can any amazon move a
  // single step in any direction", without needing to enumerate every
  // move+arrow combination just to answer that.
  function playerHasAnyMove(board, player) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] !== player) continue;
        for (let i = 0; i < DIRS.length; i++) {
          const nr = r + DIRS[i][0], nc = c + DIRS[i][1];
          if (inBounds(nr, nc) && !board[nr][nc]) return true;
        }
      }
    }
    return false;
  }

  // Every full legal move (piece-move + arrow-shot) for `player`, as
  // { from:[r,c], to:[r,c], arrow:[r,c] }. Used by the AI, which needs
  // the whole menu of options to choose from; the UI instead builds
  // its three tap steps from slideTargets/arrowTargetsAfterMove
  // directly, one step at a time, so it never needs this full
  // (potentially large) combined list.
  function getLegalMoves(state, player) {
    const board = state.board;
    const moves = [];
    amazonPositions(board, player).forEach(([r, c]) => {
      slideTargets(board, r, c).forEach(([mr, mc]) => {
        arrowTargetsAfterMove(board, [r, c], [mr, mc], player).forEach(([ar, ac]) => {
          moves.push({ from: [r, c], to: [mr, mc], arrow: [ar, ac] });
        });
      });
    });
    return moves;
  }

  function applyMove(state, player, move) {
    const next = cloneState(state);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    const [ar, ac] = move.arrow;
    next.board[fr][fc] = null;
    next.board[tr][tc] = player;
    next.board[ar][ac] = "burned";
    next.currentPlayer = otherPlayer(player);
    if (!playerHasAnyMove(next.board, next.currentPlayer)) {
      next.gameOver = true;
      next.winner = player;
    }
    return next;
  }

  return {
    SIZE,
    DIRS,
    P1_START,
    P2_START,
    otherPlayer,
    inBounds,
    createInitialBoard,
    createInitialState,
    cloneBoard,
    cloneState,
    slideTargets,
    amazonPositions,
    arrowTargetsAfterMove,
    playerHasAnyMove,
    getLegalMoves,
    applyMove
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AmazonsCore;
}
if (typeof window !== "undefined") {
  window.AmazonsCore = AmazonsCore;
}
