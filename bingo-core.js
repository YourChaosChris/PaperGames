// BingoCore: logic for number and picture bingo, no DOM.
// Cards: 3 x 3 or 5 x 5. Numbers run from 1 to 90 (task 173); number cards
// in 5 x 5 take one column per 18 numbers (1-18, 19-36, 37-54, 55-72,
// 73-90) with a free centre; picture cards use the 24 pictures (5 x 5: all
// 24 plus a free centre). Patterns: "row", "col", "diag" (any one), "line"
// (any row, column or diagonal), "full".
// Every number n is also an age: ageFigure(n) says how the person of that
// age is drawn, 1 the youngest child up to 90 the old man.
(function (root) {
  "use strict";
  const PICTURE_COUNT = 24;
  const MAX_NUMBER = 90;
  const COLUMN = MAX_NUMBER / 5;
  function pool(kind) {
    return kind === "pictures" ? Array.from({ length: PICTURE_COUNT }, (_, i) => "picture" + i) : Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);
  }
  // Stages: 0 baby (1-2), 1 small child (3-5), 2 school child (6-12),
  // 3 teenager (13-17), 4 young adult (18-39), 5 adult with glasses
  // (40-59), 6 grey-haired (60-74), 7 old man with beard and stick (75-90).
  // height (0-100) grows until 18, stays, and shrinks from 70 on; bend
  // (0-1) grows from 75 on, so the age keeps rising picture by picture.
  const STAGE_FROM = [1, 3, 6, 13, 18, 40, 60, 75];
  function ageFigure(n) {
    const a = Math.max(1, Math.min(MAX_NUMBER, Math.round(Number(n)) || 1));
    let stage = 0;
    STAGE_FROM.forEach((from, i) => { if (a >= from) stage = i; });
    const height = a <= 18 ? 34 + (a - 1) * 3 : a < 70 ? 85 : 85 - (a - 70) * 0.4;
    const bend = a < 75 ? 0 : (a - 74) / 16;
    return { age: a, stage, height: Math.round(height * 10) / 10, bend: Math.round(bend * 100) / 100 };
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
      for (let c = 0; c < 5; c++) cols.push(shuffled(Array.from({ length: COLUMN }, (_, i) => c * COLUMN + i + 1), random).slice(0, 5));
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
  const api = { PICTURE_COUNT, MAX_NUMBER, COLUMN, STAGE_FROM, ageFigure, pool, createDeck, draw, hasPattern, lines, wrongMarks, check, autoMark, shuffled };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BingoCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
