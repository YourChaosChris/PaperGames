// BingoCore: deterministic helpers for number and picture bingo.
(function (root) {
  "use strict";
  function shuffled(items, random) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((random || Math.random)() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function createDeck(kind, size, random) {
    const n = size === 5 ? 5 : 3;
    const source = kind === "pictures" ? Array.from({ length: 24 }, (_, i) => "picture" + i) : Array.from({ length: 75 }, (_, i) => i + 1);
    let board;
    if (kind !== "pictures" && n === 5) {
      board = [];
      for (let c = 0; c < 5; c++) board.push(...shuffled(Array.from({ length: 15 }, (_, i) => c * 15 + i + 1), random).slice(0, 5));
      board = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => board[c * 5 + r])).flat();
      board[12] = null;
    } else board = shuffled(source, random).slice(0, n * n);
    if (kind !== "pictures" && n === 5) board[12] = null;
    return { kind: kind === "pictures" ? "pictures" : "numbers", size: n, board, marked: board.map((v) => v === null), drawn: [], winner: false };
  }
  function draw(state, random) {
    const pool = state.kind === "pictures" ? Array.from({ length: 24 }, (_, i) => "picture" + i) : Array.from({ length: 75 }, (_, i) => i + 1);
    const remaining = pool.filter((x) => !state.drawn.includes(x));
    if (!remaining.length) return null;
    const value = remaining[Math.floor((random || Math.random)() * remaining.length)];
    state.drawn.push(value);
    return value;
  }
  function hasPattern(state, marked, pattern) {
    const n = state.size, lines = [];
    if (pattern === "line" || pattern === "full") {
      for (let r = 0; r < n; r++) lines.push(Array.from({ length: n }, (_, c) => r * n + c));
      for (let c = 0; c < n; c++) lines.push(Array.from({ length: n }, (_, r) => r * n + c));
      lines.push(Array.from({ length: n }, (_, i) => i * n + i));
      lines.push(Array.from({ length: n }, (_, i) => i * n + n - i - 1));
    }
    if (pattern === "full") return marked.every(Boolean);
    return lines.some((line) => line.every((i) => marked[i]));
  }
  function check(state, pattern) {
    const incorrect = state.marked.map((v, i) => v && state.board[i] !== null && !state.drawn.includes(state.board[i]) ? i : -1).filter((i) => i >= 0);
    const valid = incorrect.length === 0 && hasPattern(state, state.marked, pattern);
    const winLines = [];
    const n = state.size;
    for (let r = 0; r < n; r++) winLines.push(Array.from({ length: n }, (_, c) => r * n + c));
    for (let c = 0; c < n; c++) winLines.push(Array.from({ length: n }, (_, r) => r * n + c));
    winLines.push(Array.from({ length: n }, (_, i) => i * n + i));
    winLines.push(Array.from({ length: n }, (_, i) => i * n + n - i - 1));
    const allowed = pattern === "full" ? state.board.map((_, i) => i) : winLines.filter((l) => l.every((i) => state.marked[i])).flat();
    return { valid, incorrect, winning: valid ? allowed : [] };
  }
  const api = { createDeck, draw, hasPattern, check, shuffled };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BingoCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
