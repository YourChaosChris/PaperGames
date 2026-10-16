// tests/bingo-core.js
// Bingo core, no server or browser needed.
// - every deck: right size, no repeated item, number columns 1-15 .. 61-75
//   with a free centre in 5 x 5, picture cards 25 cells = 24 pictures + free centre
// - every number / picture is called exactly once, then the call is empty
// - patterns row / col / diag / line / full are recognised exactly (checked
//   against a plain brute-force over random marks)
// - Bingo check: wrong marks (not called) are returned, never valid with one
// - 1000 games against computer cards: always ends with a valid winner
//
// Run: node tests/bingo-core.js
const B = require("../bingo-core");
const assert = require("assert");

let decks = 0, calls = 0;
for (let run = 0; run < 1000; run++) {
  const kind = run % 2 ? "numbers" : "pictures", size = run % 3 ? 3 : 5;
  const s = B.createDeck(kind, size);
  decks++;
  assert.equal(s.size, size);
  assert.equal(s.board.length, size * size, kind + " " + size + " cell count");
  const real = s.board.filter((x) => x !== null);
  assert.equal(new Set(real).size, real.length, "no repeated item");
  if (size === 5) {
    assert.strictEqual(s.board[12], null);
    assert.equal(real.length, 24);
    if (kind === "numbers") for (let c = 0; c < 5; c++) for (let r = 0; r < 5; r++) { const v = s.board[r * 5 + c]; if (v !== null) assert(v > c * 15 && v <= (c + 1) * 15); }
    else assert.equal(new Set(real).size, 24, "all 24 pictures on a 5 x 5 picture card");
  } else assert(s.board.every((x) => x !== null));
  assert.deepEqual(s.marked, s.board.map((v) => v === null), "only the free cell starts marked");
  const seen = new Set(); let v;
  while ((v = B.draw(s)) !== null) { assert(!seen.has(v)); seen.add(v); calls++; }
  assert.equal(seen.size, kind === "pictures" ? 24 : 75);
  assert.strictEqual(B.draw(s), null);
}

// Patterns against brute force.
function brute(n, marked, pattern) {
  const at = (r, c) => marked[r * n + c];
  const row = [...Array(n).keys()].some((r) => [...Array(n).keys()].every((c) => at(r, c)));
  const col = [...Array(n).keys()].some((c) => [...Array(n).keys()].every((r) => at(r, c)));
  const dg = [...Array(n).keys()].every((i) => at(i, i)) || [...Array(n).keys()].every((i) => at(i, n - 1 - i));
  return { row, col, diag: dg, line: row || col || dg, full: marked.every(Boolean) }[pattern];
}
let pat = 0;
for (let k = 0; k < 4000; k++) {
  const n = k % 2 ? 3 : 5;
  const p = k % 7 === 0 ? 0.9 : 0.35;
  const marked = Array.from({ length: n * n }, () => Math.random() < p);
  ["row", "col", "diag", "line", "full"].forEach((pattern) => {
    assert.equal(B.hasPattern({ size: n }, marked, pattern), brute(n, marked, pattern), pattern + " " + marked.join());
    pat++;
  });
}

// Check: wrong marks.
{
  const st = { size: 3, board: [1, 2, 3, 4, 5, 6, 7, 8, 9], marked: [true, true, true, false, false, false, false, false, false], drawn: [1, 2] };
  let r = B.check(st, "row");
  assert(!r.valid); assert.deepEqual(r.incorrect, [2]);
  st.drawn = [1, 2, 3];
  r = B.check(st, "row");
  assert(r.valid); assert.deepEqual(r.incorrect, []); assert.deepEqual(r.winning, [0, 1, 2]);
  assert(!B.check(st, "col").valid); assert(!B.check(st, "full").valid);
  // marks that are right but pattern incomplete: not valid, nothing wrong
  st.marked = [true, true, false, false, false, false, false, false, false];
  r = B.check(st, "line");
  assert(!r.valid && r.incorrect.length === 0 && !r.complete);
  // free centre needs no call
  const c5 = B.createDeck("numbers", 5);
  [0, 1, 2, 3, 4].forEach((c) => { c5.marked[2 * 5 + c] = true; c5.drawn.push(c5.board[2 * 5 + c]); });
  c5.drawn = c5.drawn.filter((x) => x !== null);
  assert(B.check(c5, "row").valid, "row through the free centre");
}

// 1000 games against the computer: player marks correctly by hand.
let games = 0;
for (let g = 0; g < 1000; g++) {
  const kind = g % 2 ? "numbers" : "pictures", size = g % 3 === 0 ? 5 : 3, pattern = ["row", "col", "diag", "line", "full"][g % 5];
  const cards = [B.createDeck(kind, size), B.createDeck(kind, size), B.createDeck(kind, size)];
  const drawn = [], probe = { kind, drawn };
  let winner = -1, v;
  while (winner < 0 && (v = B.draw(probe)) !== null) {
    cards.forEach((c, i) => { c.drawn = drawn.slice(); B.autoMark(c, v); });
    cards.forEach((c, i) => { if (winner < 0 && B.check(c, pattern).valid) winner = i; });
  }
  // full card with free centre must always end before the pool is empty or exactly at the end
  assert(winner >= 0, "somebody wins (" + kind + size + pattern + ")");
  assert.deepEqual(B.wrongMarks(cards[winner]), []);
  games++;
}
console.log("Bingo core: " + decks + " decks, " + calls + " calls (each item exactly once), " + pat + " pattern checks, " + games + " computer games - all passed.");
