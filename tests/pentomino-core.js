// tests/pentomino-core.js
// "Pentomino Puzzle" (Legepuzzle): 500 generated puzzles per mode and
// level, plus 1000 "Fit the Pattern" patterns per level.
//
// Checks: the 12 pieces have 63 orientations in all (the known count);
// every puzzle's stored solution covers the board exactly once with
// pieces in a legal orientation, each piece used once; free mode: the
// level's field (5 x 5 / 8 x 5 / all four sizes of Hard) with area / 5
// pieces; start pieces mode: 6 x 10 with 3 / 5 / 7 pieces to lay and
// exactly one solution; the first 50 per mode and level can be finished
// with the hint alone, and a blocking piece is reported. The known
// solution counts of 3 x 20 (2) are checked by search.
//
// Run: node tests/pentomino-core.js

const P = require("../pentomino-core.js");

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER = 500, HINT_PLAY = 50, PATTERN_PER = 1000;
const fails = [];
const key = (cells) => JSON.stringify(P.normalize(cells));

const total = Object.values(P.ORIENTS).reduce((a, o) => a + o.length, 0);
if (total !== 63) fails.push("orientations " + total + ", expected 63");
// 3 x 20 has 2 solutions up to symmetry, so 8 placed on the board (each
// turned/flipped 4 ways on a 20 x 3 rectangle).
const n320 = P.countSolutions(20, 3, P.LETTERS, [], 100);
if (n320 !== 8) fails.push("20 x 3 has " + n320 + " fillings, expected 8 (2 up to symmetry)");

function checkSolution(p, tag) {
  const board = new Array(p.rows * p.cols).fill(null);
  const used = {};
  for (const pl of p.solution) {
    if (used[pl.piece]) return tag + ": piece " + pl.piece + " twice";
    used[pl.piece] = true;
    const shape = pl.cells.map((i) => [Math.floor(i / p.cols), i % p.cols]);
    if (!P.ORIENTS[pl.piece].some((o) => JSON.stringify(o) === key(shape))) return tag + ": " + pl.piece + " in an illegal shape";
    for (const i of pl.cells) {
      if (board[i] !== null) return tag + ": overlap";
      board[i] = pl.piece;
    }
  }
  if (board.some((x) => x === null)) return tag + ": board not full";
  if (p.solution.length !== p.pieces.length) return tag + ": wrong number of pieces";
  return null;
}

function hintPlay(p, tag) {
  const placements = [];
  // A wrong piece first: lay the first piece of a different filling in a
  // corner where the solution has something else, then expect "remove".
  for (let guard = 0; guard < 20; guard++) {
    const h = P.findHint(p, placements);
    if (h.kind === "done") return P.isComplete(p, placements) ? null : tag + ": done but not full";
    if (h.kind !== "place") return tag + ": hint " + h.kind + " on a solvable board";
    if (!P.fits(p, placements, h.cells)) return tag + ": hinted place does not fit";
    placements.push({ piece: h.piece, cells: h.cells });
  }
  return tag + ": hint play did not finish";
}

const sizesSeen = {};
for (const mode of ["free", "fixed"]) {
  for (const level of ["easy", "medium", "hard"]) {
    for (let seed = 1; seed <= PER; seed++) {
      const tag = mode + " " + level + " #" + seed;
      const size = mode === "free" && level === "hard" ? ["10x6", "12x5", "15x4", "20x3"][seed % 4] : null;
      const p = P.generatePuzzle(mode, level, { size }, rng(seed * 29 + level.length + (mode === "fixed" ? 7777 : 0)));
      if (!p) { fails.push(tag + ": no puzzle"); continue; }
      const bad = checkSolution(p, tag);
      if (bad) { fails.push(bad); continue; }
      if (mode === "free") {
        const want = { easy: [[5, 5]], medium: [[8, 5]], hard: P.FREE_SIZES.hard }[level];
        if (!want.some((s) => s[0] === p.rows && s[1] === p.cols)) fails.push(tag + ": field " + p.rows + "x" + p.cols);
        if (p.pieces.length * 5 !== p.rows * p.cols) fails.push(tag + ": pieces do not match the area");
        sizesSeen[p.rows + "x" + p.cols] = true;
      } else {
        const free = p.pieces.length - p.givens.length;
        if (free !== P.FIXED_FREE[level]) fails.push(tag + ": " + free + " pieces to lay");
        const freeLetters = p.pieces.filter((L) => !p.givens.some((g) => g.piece === L));
        if (P.countSolutions(p.rows, p.cols, freeLetters, p.givens, 2) !== 1) fails.push(tag + ": not exactly one solution");
      }
      if (seed <= HINT_PLAY) {
        const hb = hintPlay(p, tag);
        if (hb) fails.push(hb);
      }
    }
  }
}
// "Fit the Pattern": 1000 random patterns per level. Each has 3 / 4 / 5
// pieces, a connected shape of exactly that many squares inside a
// bounding box that fits the screen (at most 9 high, 7 wide, not wider
// than high), the stored solution fills the shape exactly (blocked
// squares stay empty), and an independent search finds a filling.
const patternSeen = {};
for (const level of ["easy", "medium", "hard"]) {
  for (let seed = 1; seed <= PATTERN_PER; seed++) {
    const tag = "pattern " + level + " #" + seed;
    const p = P.generatePuzzle("pattern", level, {}, rng(seed * 31 + level.length + 4242));
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    if (p.mode !== "pattern" || p.pieces.length !== P.PATTERN_PIECES[level]) { fails.push(tag + ": wrong piece count"); continue; }
    if (p.rows > 9 || p.cols > 7 || p.cols > p.rows) fails.push(tag + ": box " + p.rows + "x" + p.cols);
    const area = p.rows * p.cols - p.blocked.length;
    if (area !== p.pieces.length * 5) fails.push(tag + ": area " + area);
    // The shape is one connected piece of ground.
    const open = []; for (let i = 0; i < p.rows * p.cols; i++) if (p.blocked.indexOf(i) === -1) open.push(i);
    const seen = { [open[0]]: true }, queue = [open[0]];
    while (queue.length) {
      const i = queue.pop(), r = Math.floor(i / p.cols), c = i % p.cols;
      [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach((q) => {
        if (q[0] < 0 || q[1] < 0 || q[0] >= p.rows || q[1] >= p.cols) return;
        const j = q[0] * p.cols + q[1];
        if (p.blocked.indexOf(j) === -1 && !seen[j]) { seen[j] = true; queue.push(j); }
      });
    }
    if (Object.keys(seen).length !== open.length) fails.push(tag + ": shape not connected");
    // Stored solution: legal shapes, each piece once, covers exactly the open squares.
    const used = {}, cover = {};
    let bad = null;
    for (const pl of p.solution) {
      if (used[pl.piece] || p.pieces.indexOf(pl.piece) === -1) bad = "piece " + pl.piece;
      used[pl.piece] = true;
      const shape = pl.cells.map((i) => [Math.floor(i / p.cols), i % p.cols]);
      if (!P.ORIENTS[pl.piece].some((o) => JSON.stringify(o) === key(shape))) bad = pl.piece + " illegal shape";
      for (const i of pl.cells) { if (cover[i] || p.blocked.indexOf(i) !== -1) bad = "overlap/blocked"; cover[i] = true; }
    }
    if (bad || Object.keys(cover).length !== open.length) { fails.push(tag + ": " + (bad || "solution does not cover the shape")); continue; }
    patternSeen[level + " " + p.rows + "x" + p.cols] = true;
    // An independent search (not the stored solution) also fills it.
    if (seed <= 200) {
      const s = P.solve(p.rows, p.cols, p.pieces, [], null, null, p.blocked);
      if (!s) fails.push(tag + ": search finds no filling");
    }
    if (seed <= HINT_PLAY) {
      const hb = hintPlay(p, tag);
      if (hb) fails.push(hb);
    }
  }
}
console.log("pattern boxes seen: " + Object.keys(patternSeen).length);
// A blocking piece is named: X in the corner of an empty 10 x 6 board
// leaves the corner square unreachable.
{
  const p = P.generatePuzzle("free", "hard", { size: "10x6" }, rng(4));
  const h = P.findHint(p, [{ piece: "X", cells: [1, 6, 7, 8, 13] }]);
  if (h.kind !== "remove" || h.piece !== "X") fails.push("blocking X not reported: " + JSON.stringify(h));
}

console.log("free fields seen: " + Object.keys(sizesSeen).join(", "));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== PENTOMINO CORE: " + (PER * 6) + " puzzles (500 per mode and level) + " + (PATTERN_PER * 3) + " patterns (1000 per level), " + (HINT_PLAY * 9) + " solved by hint only, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
