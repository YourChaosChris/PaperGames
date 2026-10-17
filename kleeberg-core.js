// kleeberg-core.js
// Rules of Kleeberg, a building game for two on a pyramid of round fields,
// without any DOM or browser feature. The board, the hearts and the clovers
// are our own drawing and the rules are our own invention.
//
// The pyramid has five rows: 1 field at the top, 5 at the bottom (15
// fields). One player puts hearts, the other clovers, one piece per turn.
// A field may be used when it is free and both fields below it are already
// filled (the bottom row is always open), so the pyramid grows from the
// bottom up and the top is the last field. Whoever first has three of
// their own symbols in a straight line of neighbouring fields (along a row
// or along either slope) wins. If all fifteen fields are filled and nobody
// has a line, the game is a draw.
//
// Fields are numbered row by row from the top: row r (0..4) has r + 1
// fields, the field (r, c) is number r * (r + 1) / 2 + c. The two fields
// below (r, c) are (r + 1, c) and (r + 1, c + 1).
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const KleebergCore = (() => {
  const ROWS = 5;
  const CELLS = ROWS * (ROWS + 1) / 2;   // 15

  function id(r, c) {
    return r * (r + 1) / 2 + c;
  }

  function rowOf(i) {
    let r = 0;
    while ((r + 1) * (r + 2) / 2 <= i) r++;
    return r;
  }

  function colOf(i) {
    return i - id(rowOf(i), 0);
  }

  // All straight lines of three neighbouring fields.
  const LINES = [];
  (function build() {
    const dirs = [[0, 1], [1, 0], [1, 1]];     // along the row, down-left, down-right
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= r; c++) {
        dirs.forEach((d) => {
          const line = [];
          for (let k = 0; k < 3; k++) {
            const rr = r + d[0] * k;
            const cc = c + d[1] * k;
            if (rr >= ROWS || cc > rr) return;
            line.push(id(rr, cc));
          }
          LINES.push(line);
        });
      }
    }
  })();

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  // board[i]: 0 free, 1 hearts (player 0), 2 clovers (player 1).
  function open(board, i) {
    if (board[i] !== 0) return false;
    const r = rowOf(i);
    if (r === ROWS - 1) return true;
    const c = colOf(i);
    return board[id(r + 1, c)] !== 0 && board[id(r + 1, c + 1)] !== 0;
  }

  function openCells(board) {
    const list = [];
    for (let i = 0; i < CELLS; i++) if (open(board, i)) list.push(i);
    return list;
  }

  function lineOf(board, mark) {
    for (let i = 0; i < LINES.length; i++) {
      if (LINES[i].every((x) => board[x] === mark)) return LINES[i].slice();
    }
    return null;
  }

  // opts: { computer: [bool, bool], first: 0 or 1 }
  function newGame(opts) {
    const o = opts || {};
    return {
      game: "kleeberg",
      computer: [!!(o.computer && o.computer[0]), !!(o.computer && o.computer[1])],
      board: new Array(CELLS).fill(0),
      current: o.first === 1 ? 1 : 0,
      phase: "play",              // "play" | "over"
      moves: 0,
      winner: null,               // 0, 1, -1 for a draw, null while playing
      line: null,                 // the winning three fields
      last: -1                    // field of the last piece
    };
  }

  function destinations(s) {
    return s.phase === "play" ? openCells(s.board) : [];
  }

  function place(s, i) {
    if (s.phase !== "play") return s;
    if (typeof i !== "number" || i < 0 || i >= CELLS || !open(s.board, i)) return s;
    const t = clone(s);
    const mark = t.current + 1;
    t.board[i] = mark;
    t.moves += 1;
    t.last = i;
    const line = lineOf(t.board, mark);
    if (line) {
      t.phase = "over";
      t.winner = t.current;
      t.line = line;
      return t;
    }
    if (t.moves >= CELLS) {
      t.phase = "over";
      t.winner = -1;
      return t;
    }
    t.current = 1 - t.current;
    return t;
  }

  // ---- Computer ----

  function wins(board, i, mark) {
    const b = board.slice();
    b[i] = mark;
    return !!lineOf(b, mark);
  }

  // The plain strategy, in this order:
  // 1. complete a line of your own;
  // 2. stop a line of the opponent (take the field where they would win);
  // 3. do not open a field above your piece where the opponent wins;
  // 4. otherwise any allowed field, picked by chance.
  function chooseAi(s, rng) {
    const cells = destinations(s);
    if (!cells.length) return null;
    const me = s.current + 1;
    const you = 3 - me;
    const pick = (list) => list[Math.floor((rng || Math.random)() * list.length)];
    const mine = cells.filter((i) => wins(s.board, i, me));
    if (mine.length) return pick(mine);
    const block = cells.filter((i) => wins(s.board, i, you));
    if (block.length) return pick(block);
    const safe = cells.filter((i) => {
      const b = s.board.slice();
      b[i] = me;
      return !openCells(b).some((j) => wins(b, j, you));
    });
    return pick(safe.length ? safe : cells);
  }

  function aiStep(s, rng) {
    if (s.phase !== "play") return s;
    return place(s, chooseAi(s, rng));
  }

  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winner === -1) return "draw";
    return s.winner === player ? "win" : "loss";
  }

  return { ROWS, CELLS, LINES, id, rowOf, colOf, open, openCells, newGame, destinations, place, chooseAi, aiStep, outcomeFor };
})();

if (typeof module !== "undefined") module.exports = KleebergCore;
