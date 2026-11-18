// zahlenschritt-core.js
// Rules engine for Step Numbers (Zahlenschritt), no DOM.
// Each side has a sheet of ROWS rows with three fields: left, middle, right.
// Setup: every side writes ROWS numbers (0..max, a number may repeat) into its
// middle column. Play: the side to move turns up the top card of a shuffled
// stack. A card N fits the left field of a row whose middle number is N + 1
// and the right field of a row whose middle number is N - 1; if some field
// fits, the side writes N in (its choice if several fit), otherwise the card
// is out. Whoever first has every field filled wins. Black moves first.
// Fields that can never be filled (left of 0, right of the highest number)
// count as filled from the start ("x").

const ZahlenschrittCore = (function () {
  // level -> highest number and rows per sheet (Easy 0-5 with 4 rows,
  // Medium 0-9 with 7, Hard 0-15 with 10).
  const LEVELS = { 1: { max: 5, rows: 4 }, 2: { max: 9, rows: 7 }, 3: { max: 15, rows: 10 } };
  const COPIES = 4; // cards of each number in a stack
  const BLOCKED = "x";

  function otherColor(color) {
    return color === "b" ? "w" : "b";
  }

  function shuffle(list, rng) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng || Math.random)() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function newDeck(max, rng) {
    const cards = [];
    for (let n = 0; n <= max; n++) for (let k = 0; k < COPIES; k++) cards.push(n);
    return shuffle(cards, rng);
  }

  function createInitialState(level, rng) {
    const cfg = LEVELS[level] || LEVELS[2];
    return {
      level: LEVELS[level] ? level : 2,
      max: cfg.max,
      rows: cfg.rows,
      phase: "setup", // "setup" | "draw" | "place" | "over"
      turn: "b",
      mids: { b: [], w: [] },
      cells: { b: [], w: [] }, // per row [left, right]: null | number | "x"
      deck: newDeck(cfg.max, rng),
      card: null,
      last: null, // { side, card, fit, row, col }
      result: null // null | { winner }
    };
  }

  function copy(state) {
    return JSON.parse(JSON.stringify(state));
  }

  // Writes one number into the middle column of the side that is setting up.
  function addMid(state, n) {
    if (state.phase !== "setup" || !Number.isInteger(n) || n < 0 || n > state.max) return null;
    const s = copy(state);
    const side = s.turn;
    s.mids[side].push(n);
    s.cells[side].push([n - 1 < 0 ? BLOCKED : null, n + 1 > s.max ? BLOCKED : null]);
    if (s.mids[side].length === s.rows) {
      if (side === "b") s.turn = "w";
      else { s.turn = "b"; s.phase = "draw"; }
    }
    return s;
  }

  // Takes back the last number of the side that is setting up.
  function removeLastMid(state) {
    if (state.phase !== "setup" || !state.mids[state.turn].length) return null;
    const s = copy(state);
    s.mids[s.turn].pop();
    s.cells[s.turn].pop();
    return s;
  }

  // The open fields the current card fits for the side to move.
  function fits(state) {
    if (state.phase !== "place" || state.card === null) return [];
    const side = state.turn;
    const list = [];
    state.mids[side].forEach((m, row) => {
      if (m - 1 === state.card && state.cells[side][row][0] === null) list.push({ row, col: 0 });
      if (m + 1 === state.card && state.cells[side][row][1] === null) list.push({ row, col: 1 });
    });
    return list;
  }

  // The side to move turns up a card. With no fitting field the card is out
  // and the turn passes.
  function draw(state, rng) {
    if (state.phase !== "draw") return null;
    const s = copy(state);
    if (!s.deck.length) s.deck = newDeck(s.max, rng);
    const card = s.deck.pop();
    const side = s.turn;
    s.card = card;
    s.phase = "place";
    if (!fits(s).length) {
      s.last = { side, card, fit: false };
      s.card = null;
      s.phase = "draw";
      s.turn = otherColor(side);
    }
    return s;
  }

  function isLegalPlace(state, row, col) {
    return fits(state).some((f) => f.row === row && f.col === col);
  }

  function place(state, row, col) {
    if (!isLegalPlace(state, row, col)) return null;
    const s = copy(state);
    const side = s.turn;
    s.cells[side][row][col] = s.card;
    s.last = { side, card: s.card, fit: true, row, col };
    s.card = null;
    if (s.cells[side].every((r) => r[0] !== null && r[1] !== null)) {
      s.phase = "over";
      s.result = { winner: side };
    } else {
      s.phase = "draw";
      s.turn = otherColor(side);
    }
    return s;
  }

  // Fields still open for a side.
  function openCount(state, side) {
    let n = 0;
    state.cells[side].forEach((r) => r.forEach((v) => { if (v === null) n++; }));
    return n;
  }

  // A move is { kind: "num", n } (setup), { kind: "draw" } or { kind: "cell", row, col }.
  function isLegalMove(state, m) {
    if (!m || state.result) return false;
    if (m.kind === "num") return state.phase === "setup" && Number.isInteger(m.n) && m.n >= 0 && m.n <= state.max;
    if (m.kind === "draw") return state.phase === "draw";
    if (m.kind === "cell") return isLegalPlace(state, m.row, m.col);
    return false;
  }

  return { LEVELS, COPIES, BLOCKED, otherColor, newDeck, createInitialState, addMid, removeLastMid, fits, draw, place, isLegalPlace, isLegalMove, openCount };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ZahlenschrittCore;
}
if (typeof window !== "undefined") {
  window.ZahlenschrittCore = ZahlenschrittCore;
}
