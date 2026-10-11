// snakesladders-core.js
// "Snakes and Ladders" (Leiterspiel). Dependency-free, no DOM.
//
// Two fixed boards of our own: 100 fields (10 x 10) and, for small
// children, 50 fields (10 x 5). Fields run in a snake line from the
// bottom left (field 1). Landing on the foot of a ladder takes a token up
// to its top; landing on a snake's head takes it down to the tail.
// Tokens start off the board (position 0) and enter with the first roll.
// Whoever reaches the last field first wins.
//
// Tokens: s.shapes[p] is the shape of player p's token (0 circle,
// 1 square, 2 triangle, 3 star). The people playing choose theirs, the
// computers get the others (assignShapes). Who rolls first is chosen too:
// "me" (the first person), "computer" (the first computer) or "random"
// (firstPlayer). States saved before this have no `shapes`: player p then
// has shape p, as before.
//
// Finishing: "spare" (the default) - a roll that goes past the last field
// still reaches it, the spare pips are lost; "exact" - the roll must fit
// exactly, otherwise the token stays where it is.

const SnakesLaddersCore = (function () {
  const SHAPES = ["circle", "square", "triangle", "star"];
  const BOARDS = {
    big: {
      size: 100, cols: 10,
      ladders: { 2: 23, 7: 29, 22: 41, 33: 52, 46: 65, 57: 83, 69: 88, 78: 97 },
      snakes: { 26: 5, 38: 16, 49: 30, 61: 43, 74: 53, 85: 64, 92: 71, 99: 80 }
    },
    small: {
      size: 50, cols: 10,
      ladders: { 3: 14, 9: 27, 20: 33, 31: 44 },
      snakes: { 18: 6, 26: 12, 38: 23, 47: 35 }
    }
  };

  // Row and column of a field on screen (row 0 = top), for drawing.
  function cellOf(boardName, field) {
    const b = BOARDS[boardName];
    const rows = b.size / b.cols;
    const idx = field - 1;
    const rowFromBottom = Math.floor(idx / b.cols);
    const col = rowFromBottom % 2 === 0 ? idx % b.cols : b.cols - 1 - (idx % b.cols);
    return { row: rows - 1 - rowFromBottom, col };
  }

  // Shapes for all seats: the people (seats 0..humans-1) get their
  // choices in order - a shape already taken goes to the next free one -
  // the computers the shapes left over, in order.
  function assignShapes(numPlayers, choices) {
    const n = Math.max(2, Math.min(4, numPlayers || 2));
    const taken = [], out = [];
    (choices || []).slice(0, n).forEach((c) => {
      let k = SHAPES.indexOf(c) !== -1 ? SHAPES.indexOf(c) : (typeof c === "number" ? c : 0);
      if (!(k >= 0 && k < SHAPES.length)) k = 0;
      while (taken.indexOf(k) !== -1) k = (k + 1) % SHAPES.length;
      taken.push(k); out.push(k);
    });
    for (let k = 0; out.length < n; k++) if (taken.indexOf(k) === -1) { taken.push(k); out.push(k); }
    return out;
  }

  // Who rolls first: "me" - seat 0 (the first person), "computer" - the
  // first computer (seat `humans`; seat 0 when nobody is a computer),
  // "random" - any seat. rng: () => [0, 1).
  function firstPlayer(choice, numPlayers, humans, rng) {
    const n = Math.max(2, Math.min(4, numPlayers || 2));
    if (choice === "me") return 0;
    if (choice === "computer") return humans >= 0 && humans < n ? humans : 0;
    return Math.floor((rng || Math.random)() * n);
  }

  // players: number of tokens (2-4). opts: { shapes, first } (both
  // optional: shapes 0..n-1 and seat 0 when left out).
  function createInitialState(boardName, numPlayers, finish, opts) {
    const board = BOARDS[boardName] ? boardName : "big";
    const n = Math.max(2, Math.min(4, numPlayers || 2));
    const o = opts || {};
    const shapes = Array.isArray(o.shapes) && o.shapes.length === n ? o.shapes.slice() : assignShapes(n, []);
    const first = o.first >= 0 && o.first < n ? o.first : 0;
    return {
      board, numPlayers: n, finish: finish === "exact" ? "exact" : "spare", shapes,
      pos: new Array(n).fill(0), turn: first, first, gameOver: false, winner: -1, turns: 0, last: null
    };
  }

  // Moves the player on turn by `roll` (1-6). Returns the new state with
  // state.last = { player, roll, from, to (before ladder/snake), end,
  // via: "ladder" | "snake" | null, blocked: true when an exact finish
  // did not fit }.
  function move(s0, roll) {
    if (s0.gameOver) return s0;
    const s = { board: s0.board, numPlayers: s0.numPlayers, finish: s0.finish, pos: s0.pos.slice(), turn: s0.turn, gameOver: false, winner: -1, turns: s0.turns + 1, last: null };
    if (s0.shapes) s.shapes = s0.shapes.slice();
    if (s0.first !== undefined) s.first = s0.first;
    const b = BOARDS[s.board];
    const p = s.turn, from = s.pos[p];
    let to = from + roll, blocked = false;
    if (to > b.size) {
      if (s.finish === "exact") { to = from; blocked = true; } else to = b.size;
    }
    let end = to, via = null;
    if (!blocked && b.ladders[to]) { end = b.ladders[to]; via = "ladder"; }
    else if (!blocked && b.snakes[to]) { end = b.snakes[to]; via = "snake"; }
    s.pos[p] = end;
    s.last = { player: p, roll, from, to, end, via, blocked };
    if (end === b.size) {
      s.gameOver = true;
      s.winner = p;
    } else {
      s.turn = (p + 1) % s.numPlayers;
    }
    return s;
  }

  function rollDie(rng) {
    return 1 + Math.floor((rng || Math.random)() * 6);
  }

  return { BOARDS, SHAPES, cellOf, assignShapes, firstPlayer, createInitialState, move, rollDie };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = SnakesLaddersCore;
}
if (typeof window !== "undefined") {
  window.SnakesLaddersCore = SnakesLaddersCore;
}
