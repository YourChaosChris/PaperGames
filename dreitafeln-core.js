// dreitafeln-core.js
// Rules engine for Three Grids (Drei Tafeln), no DOM.
// Three 3 x 3 boards, fields numbered 1-9. A stack of 27 cards holds every
// number three times, so every card always fits on some board. Three cards
// lie face up. The side to move takes one of them and puts its mark on the
// field with that number on one of the three boards where the field is free;
// the next card of the stack takes its place. Three marks in a line win that
// board for good (the board stays open, later lines there count no more).
// Whoever wins two boards first wins the game. When all 27 cards are played,
// more boards win; the same number is a draw. X moves first.

const DreitafelnCore = (function () {
  const BOARDS = 3;
  const OPEN = 3;     // face-up cards
  const COPIES = 3;   // cards of each number
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  function other(side) {
    return side === "x" ? "o" : "x";
  }

  function shuffle(list, rng) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng || Math.random)() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function createInitialState(rng) {
    const cards = [];
    for (let n = 1; n <= 9; n++) for (let k = 0; k < COPIES; k++) cards.push(n);
    const deck = shuffle(cards, rng);
    return {
      boards: [0, 1, 2].map(() => new Array(9).fill(null)),
      won: [null, null, null],     // "x" | "o" | null per board
      lines: [null, null, null],   // the winning line of a board
      open: deck.splice(0, OPEN),  // face-up cards (null when the stack is empty)
      deck: deck,
      turn: "x",
      last: null,                  // { side, card, board, cell }
      result: null                 // null | { winner } | { draw: true }
    };
  }

  function copy(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function lineOf(board, side) {
    for (const l of LINES) if (l.every((i) => board[i] === side)) return l;
    return null;
  }

  // Every move: { slot, board } (slot = index of the face-up card).
  function getLegalMoves(state) {
    if (state.result) return [];
    const moves = [];
    const seen = {};
    state.open.forEach((card, slot) => {
      if (card === null || seen[card]) return;
      seen[card] = true;
      for (let b = 0; b < BOARDS; b++) if (state.boards[b][card - 1] === null) moves.push({ slot: slot, board: b });
    });
    return moves;
  }

  function isLegalMove(state, m) {
    return !!m && getLegalMoves(state).some((x) => x.slot === m.slot && x.board === m.board);
  }

  function count(state, side) {
    return state.won.filter((w) => w === side).length;
  }

  function applyMove(state, m) {
    const s = copy(state);
    const card = s.open[m.slot];
    const cell = card - 1;
    const side = s.turn;
    s.boards[m.board][cell] = side;
    if (!s.won[m.board]) {
      const l = lineOf(s.boards[m.board], side);
      if (l) { s.won[m.board] = side; s.lines[m.board] = l; }
    }
    s.open[m.slot] = s.deck.length ? s.deck.shift() : null;
    s.last = { side: side, card: card, board: m.board, cell: cell };
    if (count(s, side) >= 2) s.result = { winner: side };
    else if (s.open.every((c) => c === null)) {
      const x = count(s, "x");
      const o = count(s, "o");
      s.result = x === o ? { draw: true } : { winner: x > o ? "x" : "o" };
    }
    s.moves = (s.moves || 0) + 1;
    s.turn = other(side);
    return s;
  }

  // The hidden stack shuffled again: after Undo the card that came up next
  // is known, so the rest of the stack gets a new order and that knowledge
  // is worth nothing.
  function reshuffle(state, rng) {
    const s = copy(state);
    s.deck = shuffle(s.deck, rng);
    return s;
  }

  return { reshuffle, BOARDS, OPEN, COPIES, LINES, other, createInitialState, getLegalMoves, isLegalMove, applyMove, lineOf, count, copy };
})();

if (typeof module !== "undefined") module.exports = DreitafelnCore;
