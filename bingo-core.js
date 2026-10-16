// BingoCore: logic for number and picture bingo, no DOM.
// Cards: 3 x 3 or 5 x 5. Number cards in 5 x 5 follow the usual columns
// (1-15, 16-30, 31-45, 46-60, 61-75) with a free centre; picture cards use
// the 24 pictures (5 x 5: all 24 plus a free centre). Patterns: "row",
// "col", "diag" (any one), "line" (any row, column or diagonal), "full".
(function (root) {
  "use strict";
  const PICTURE_COUNT = 24;
  function pool(kind) {
    return kind === "pictures" ? Array.from({ length: PICTURE_COUNT }, (_, i) => "picture" + i) : Array.from({ length: 75 }, (_, i) => i + 1);
  }
  function shuffled(items, random) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((random || Math.random)() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function createDeck(kind, size, random) {
    const n = size === 5 ? 5 : 3;
    const k = kind === "pictures" ? "pictures" : "numbers";
    let board;
    if (k === "numbers" && n === 5) {
      const cols = [];
      for (let c = 0; c < 5; c++) cols.push(shuffled(Array.from({ length: 15 }, (_, i) => c * 15 + i + 1), random).slice(0, 5));
      board = Array.from({ length: 25 }, (_, i) => cols[i % 5][Math.floor(i / 5)]);
      board[12] = null;
    } else if (k === "pictures" && n === 5) {
      board = shuffled(pool(k), random);
      board.splice(12, 0, null);
    } else board = shuffled(pool(k), random).slice(0, n * n);
    return { kind: k, size: n, board, marked: board.map((v) => v === null), drawn: [], winner: false };
  }
  function draw(state, random) {
    const remaining = pool(state.kind).filter((x) => state.drawn.indexOf(x) === -1);
    if (!remaining.length) return null;
    const value = remaining[Math.floor((random || Math.random)() * remaining.length)];
    state.drawn.push(value);
    return value;
  }
  function lines(n, pattern) {
    const out = [];
    const rows = pattern === "row" || pattern === "line", cols = pattern === "col" || pattern === "line", diag = pattern === "diag" || pattern === "line";
    if (rows) for (let r = 0; r < n; r++) out.push(Array.from({ length: n }, (_, c) => r * n + c));
    if (cols) for (let c = 0; c < n; c++) out.push(Array.from({ length: n }, (_, r) => r * n + c));
    if (diag) {
      out.push(Array.from({ length: n }, (_, i) => i * n + i));
      out.push(Array.from({ length: n }, (_, i) => i * n + n - i - 1));
    }
    return out;
  }
  function hasPattern(state, marked, pattern) {
    if (pattern === "full") return marked.every(Boolean);
    return lines(state.size, pattern).some((line) => line.every((i) => marked[i]));
  }
  // Marked cells that were never called (free cells are always fine).
  function wrongMarks(state) {
    const out = [];
    state.marked.forEach((m, i) => { if (m && state.board[i] !== null && state.drawn.indexOf(state.board[i]) === -1) out.push(i); });
    return out;
  }
  function check(state, pattern) {
    const incorrect = wrongMarks(state);
    const complete = hasPattern(state, state.marked, pattern);
    const valid = incorrect.length === 0 && complete;
    let winning = [];
    if (valid) winning = pattern === "full" ? state.board.map((_, i) => i) : [].concat.apply([], lines(state.size, pattern).filter((l) => l.every((i) => state.marked[i])));
    return { valid, incorrect, complete, winning };
  }
  // The computer marks every called item on its own card.
  function autoMark(state, value) {
    const i = state.board.indexOf(value);
    if (i >= 0) state.marked[i] = true;
    return i;
  }
  const api = { PICTURE_COUNT, pool, createDeck, draw, hasPattern, lines, wrongMarks, check, autoMark, shuffled };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BingoCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
