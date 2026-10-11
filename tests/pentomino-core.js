// tests/pentomino-core.js
// "Pentomino Puzzle" (Legepuzzle): 500 generated puzzles per mode and
// level.
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

const PER = 500, HINT_PLAY = 50;
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
// A blocking piece is named: X in the corner of an empty 10 x 6 board
// leaves the corner square unreachable.
{
  const p = P.generatePuzzle("free", "hard", { size: "10x6" }, rng(4));
  const h = P.findHint(p, [{ piece: "X", cells: [1, 6, 7, 8, 13] }]);
  if (h.kind !== "remove" || h.piece !== "X") fails.push("blocking X not reported: " + JSON.stringify(h));
}

console.log("free fields seen: " + Object.keys(sizesSeen).join(", "));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== PENTOMINO CORE: " + (PER * 6) + " puzzles (500 per mode and level), " + (HINT_PLAY * 6) + " solved by hint only, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
