// tenpairs-core.js
// Rules for "Pairs to Ten" (Zehner-Paare), the pen-and-paper puzzle of
// crossing out pairs of digits - no DOM here; the page is tenpairs-app.js.
//
// Rules as played here:
//   - Digits 1 to 9 stand in a field nine columns wide, read row by row.
//   - Two digits are crossed out together when they are equal (3 and 3)
//     or add up to 10 (3 and 7).
//   - The two must "see" each other: next to each other across, down or
//     diagonally, or with only crossed-out cells between them on that
//     line. Across also runs over the end of a row (the last digit of a
//     row and the first of the next, and so on in reading order).
//   - "Add" writes all digits not yet crossed out, in the same order, at
//     the end of the field. At most 5 times per game.
//   - A row with all nine cells crossed out disappears (also the last,
//     shorter row once all of it is crossed out).
//   - Won when every digit is crossed out. Lost when no pair is left and
//     no "Add" either, or when the field grows to more than 40 rows.
//
// State: { cells: [{ d: 1..9, x: crossed out }], adds, mode, level }.

const TenPairsCore = (function () {
  const COLS = 9;
  const MAX_ADDS = 5;
  const MAX_ROWS = 40;
  const CLASSIC = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9];
  // Random starts: rows of digits and the share of digits that make a
  // pair with the one before (easier to find).
  const LEVELS = { 1: { rows: 3, easy: 0.5 }, 2: { rows: 4, easy: 0.3 }, 3: { rows: 5, easy: 0.1 } };

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  function newGame(mode, level, rng) {
    const r = rng || Math.random;
    let digits;
    if (mode === "classic") digits = CLASSIC.slice();
    else {
      const L = LEVELS[level] || LEVELS[2];
      digits = [];
      for (let i = 0; i < L.rows * COLS; i++) {
        const prev = digits[i - 1];
        if (prev && r() < L.easy) digits.push(r() < 0.5 ? prev : 10 - prev);
        else digits.push(1 + Math.floor(r() * 9));
      }
    }
    return { cells: digits.map((d) => ({ d, x: false })), adds: 0, mode: mode === "classic" ? "classic" : "random", level: mode === "classic" ? 0 : (level || 2) };
  }

  function rows(s) { return Math.ceil(s.cells.length / COLS); }
  function left(s) { return s.cells.filter((c) => !c.x).length; }
  function matches(a, b) { return a === b || a + b === 10; }

  // Do cells i and j see each other? Returns the direction or null.
  function sees(s, i, j) {
    if (i === j) return null;
    if (i > j) { const t = i; i = j; j = t; }
    const n = s.cells;
    // Across, in reading order (also over the end of a row).
    let ok = true;
    for (let k = i + 1; k < j; k++) if (!n[k].x) { ok = false; break; }
    if (ok) return "across";
    const ri = Math.floor(i / COLS), ci = i % COLS, rj = Math.floor(j / COLS), cj = j % COLS;
    const dr = rj - ri, dc = cj - ci;
    let step = 0, dir = null;
    if (dc === 0) { step = COLS; dir = "down"; }
    else if (dr === dc) { step = COLS + 1; dir = "diagonal"; }
    else if (dr === -dc) { step = COLS - 1; dir = "diagonal"; }
    else return null;
    for (let k = i + step; k < j; k += step) if (!n[k].x) return null;
    return dir;
  }

  // Why i and j can't go (or null if they can): "crossed", "see", "sum".
  function check(s, i, j) {
    const a = s.cells[i], b = s.cells[j];
    if (!a || !b || i === j || a.x || b.x) return "crossed";
    if (!matches(a.d, b.d)) return "sum";
    if (!sees(s, i, j)) return "see";
    return null;
  }

  // Removes rows whose cells are all crossed out.
  function dropEmptyRows(s) {
    const out = [];
    let removed = 0;
    for (let r = 0; r < rows(s); r++) {
      const row = s.cells.slice(r * COLS, r * COLS + COLS);
      if (row.every((c) => c.x)) removed++;
      else out.push.apply(out, row);
    }
    s.cells = out;
    return removed;
  }

  function cross(state, i, j) {
    if (check(state, i, j)) return null;
    const s = clone(state);
    s.cells[i].x = true;
    s.cells[j].x = true;
    s.lastRemovedRows = dropEmptyRows(s);
    return s;
  }

  // The first pair that can be crossed out, or null.
  function findPair(s) {
    const n = s.cells;
    for (let i = 0; i < n.length; i++) {
      if (n[i].x) continue;
      // Next open cell in reading order.
      for (let k = i + 1; k < n.length; k++) if (!n[k].x) { if (matches(n[i].d, n[k].d)) return [i, k]; break; }
      const c = i % COLS;
      const steps = [COLS];
      if (c < COLS - 1) steps.push(COLS + 1);
      if (c > 0) steps.push(COLS - 1);
      for (const st of steps) {
        let k = i + st, col = c;
        while (k < n.length) {
          col += st === COLS ? 0 : st === COLS + 1 ? 1 : -1;
          if (col < 0 || col >= COLS) break;
          if (!n[k].x) { if (matches(n[i].d, n[k].d)) return [i, k]; break; }
          k += st;
        }
      }
    }
    return null;
  }

  function canAdd(s) { return s.adds < MAX_ADDS && left(s) > 0; }

  function add(state) {
    if (!canAdd(state)) return null;
    const s = clone(state);
    const open = s.cells.filter((c) => !c.x).map((c) => ({ d: c.d, x: false }));
    s.cells = s.cells.concat(open);
    s.adds++;
    return s;
  }

  // "won", "lost-adds", "lost-rows" or null (still playing).
  function status(s) {
    if (!left(s)) return "won";
    if (rows(s) > MAX_ROWS) return "lost-rows";
    if (!findPair(s) && !canAdd(s)) return "lost-adds";
    return null;
  }

  return { COLS, MAX_ADDS, MAX_ROWS, CLASSIC, LEVELS, clone, newGame, rows, left, matches, sees, check, cross, findPair, canAdd, add, status, dropEmptyRows };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TenPairsCore;
}
if (typeof window !== "undefined") {
  window.TenPairsCore = TenPairsCore;
}
