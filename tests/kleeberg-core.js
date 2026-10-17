#!/usr/bin/env node
// tests/kleeberg-core.js
// Rules of Kleeberg (kleeberg-core.js): the pyramid (15 fields, 18 lines of
// three), fields open only above two filled fields, three in a line wins
// along the row and both slopes, the draw on a full board, refused moves,
// the computer's choices (win, block, no gift) and 1000 computer games that
// must all end without an error.
//
// No server or browser needed. Run: node tests/kleeberg-core.js

const assert = require("assert");
const C = require("../kleeberg-core.js");

function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
const first = () => 0;   // always the first of equal choices

// ---- The pyramid ----
assert.strictEqual(C.ROWS, 5);
assert.strictEqual(C.CELLS, 15);
assert.strictEqual(C.LINES.length, 18, "6 lines along the rows, 6 + 6 along the slopes");
for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) {
  const i = C.id(r, c);
  assert.strictEqual(C.rowOf(i), r);
  assert.strictEqual(C.colOf(i), c);
}
assert.strictEqual(C.id(0, 0), 0);
assert.strictEqual(C.id(4, 4), 14);
C.LINES.forEach((ln) => {
  assert.strictEqual(new Set(ln).size, 3);
  ln.forEach((x) => assert.ok(x >= 0 && x < 15));
});

// ---- Open fields ----
let s = C.newGame({ computer: [false, true] });
assert.deepStrictEqual(C.destinations(s), [10, 11, 12, 13, 14], "only the bottom row at first");
assert.strictEqual(s.current, 0);
assert.strictEqual(C.newGame({ first: 1 }).current, 1);
assert.strictEqual(C.newGame({ first: 7 }).current, 0);
assert.strictEqual(C.place(s, 6), s, "a field with free fields below is refused");
assert.strictEqual(C.place(s, 99), s);
assert.strictEqual(C.place(s, -1), s);
assert.strictEqual(C.place(s, "10"), s);
let t = C.place(s, 10);
assert.strictEqual(t.board[10], 1, "player 0 puts hearts");
assert.strictEqual(t.current, 1);
assert.strictEqual(t.last, 10);
assert.strictEqual(s.board[10], 0, "the old state is not changed");
assert.strictEqual(C.place(t, 10), t, "a filled field is refused");
assert.deepStrictEqual(C.destinations(t), [11, 12, 13, 14], "9 needs 10 and 11");
t = C.place(t, 11);
assert.strictEqual(t.board[11], 2, "player 1 puts clovers");
assert.deepStrictEqual(C.destinations(t), [6, 12, 13, 14], "field 6 sits on 10 and 11");

// ---- Three in a line wins (row, both slopes) ----
function play(moves) {
  let st = C.newGame({});
  moves.forEach((m) => {
    const n = C.place(st, m);
    assert.notStrictEqual(n, st, "move " + m + " must be allowed");
    st = n;
  });
  return st;
}
// row: hearts 10, 11, 12 (clovers 13, 14)
let w = play([10, 13, 11, 14, 12]);
assert.strictEqual(w.phase, "over");
assert.strictEqual(w.winner, 0);
assert.deepStrictEqual(w.line, [10, 11, 12]);
assert.strictEqual(C.outcomeFor(w, 0), "win");
assert.strictEqual(C.outcomeFor(w, 1), "loss");
assert.strictEqual(C.place(w, 6), w, "nothing after the end");
// slope: left edge 3, 6, 10 (hearts)
w = play([10, 11, 6, 12, 13, 7, 3]);
assert.strictEqual(w.winner, 0);
assert.deepStrictEqual(w.line.slice().sort((a, b) => a - b), [3, 6, 10]);
// other slope: right edge 5, 9, 14 (hearts)
w = play([14, 13, 9, 12, 10, 8, 5]);
assert.strictEqual(w.winner, 0, "right edge 5, 9, 14");
assert.deepStrictEqual(w.line.slice().sort((a, b) => a - b), [5, 9, 14]);
// clovers can win too: the row 12, 13, 14
w = play([10, 13, 11, 14, 6, 12]);
assert.strictEqual(w.winner, 1);
assert.strictEqual(C.outcomeFor(w, 1), "win");
assert.deepStrictEqual(w.line.slice().sort((a, b) => a - b), [12, 13, 14]);
// no win from two in a line, nor from a bent shape
s = play([10, 13, 11, 14, 6]);
assert.strictEqual(s.phase, "play", "hearts 10, 11, 6 are not a line");

// ---- A draw on the full board ----
// Fill by search: any full board without a line is a draw; find one by play.
(function findDraw() {
  const rng = seeded(7);
  for (let g = 0; g < 5000; g++) {
    let st = C.newGame({});
    while (st.phase === "play") {
      const cells = C.destinations(st);
      st = C.place(st, cells[Math.floor(rng() * cells.length)]);
    }
    if (st.winner === -1) {
      assert.strictEqual(st.moves, 15);
      assert.ok(st.board.every((x) => x !== 0));
      assert.strictEqual(C.outcomeFor(st, 0), "draw");
      assert.strictEqual(C.outcomeFor(st, 1), "draw");
      assert.strictEqual(st.line, null);
      return;
    }
  }
  assert.fail("no draw found in 5000 random games");
})();

// ---- The computer ----
function board(list, current) {
  const st = C.newGame({ computer: [true, true], first: current });
  list.forEach((m) => { st.board[m[0]] = m[1]; });
  st.moves = list.length;
  return st;
}
// 1. It completes its own line.
s = board([[10, 1], [11, 1], [13, 2], [14, 2]], 0);
assert.strictEqual(C.chooseAi(s, first), 12, "hearts complete 10-11-12");
s = board([[10, 1], [11, 1], [6, 1], [13, 2], [14, 2], [12, 2]], 0);
// 2. It stops a line of the opponent.
s = board([[10, 2], [11, 2], [14, 1]], 0);
assert.strictEqual(C.chooseAi(s, first), 12, "the threat on 12 is blocked");
// 3. It does not open a field where the opponent wins.
s = board([[10, 2], [11, 1], [6, 2], [12, 2]], 0);
assert.deepStrictEqual(C.destinations(s), [7, 13, 14]);
for (let g = 0; g < 200; g++) {
  const pick = C.chooseAi(s, seeded(g + 1));
  assert.notStrictEqual(pick, 7, "7 would open 3 for the clovers (3, 6, 10)");
}
// If every field is a gift, it still plays an allowed field.
for (let g = 0; g < 200; g++) {
  const r = seeded(g + 1);
  let st = C.newGame({ computer: [true, true], first: g % 2 });
  let n = 0;
  while (st.phase === "play") {
    const mv = C.chooseAi(st, r);
    assert.ok(C.destinations(st).indexOf(mv) >= 0, "the computer plays an allowed field");
    st = C.place(st, mv);
    assert.ok(n++ < 20);
  }
  assert.strictEqual(C.chooseAi(st, r), null, "no move after the end");
  assert.strictEqual(C.aiStep(st, r), st);
}

// ---- 1000 computer games ----
const rng = seeded(20261017);
let games = 0;
let totalMoves = 0;
const result = { first: 0, second: 0, draw: 0 };
for (let g = 0; g < 1000; g++) {
  const starter = g % 2;
  let st = C.newGame({ computer: [true, true], first: starter });
  let guard = 0;
  while (st.phase !== "over") {
    const next = C.aiStep(st, rng);
    assert.notStrictEqual(next, st, "the computer always acts");
    assert.strictEqual(next.moves, st.moves + 1);
    assert.strictEqual(next.board.filter((x) => x !== 0).length, next.moves);
    // the pyramid stays supported: every filled field has both fields below it filled
    next.board.forEach((x, i) => {
      if (!x) return;
      const r = C.rowOf(i);
      if (r < 4) {
        const c = C.colOf(i);
        assert.ok(next.board[C.id(r + 1, c)] && next.board[C.id(r + 1, c + 1)], "supported");
      }
    });
    assert.strictEqual(C.place(next, next.last), next, "a filled field is refused");
    st = next;
    assert.ok(guard++ < 20, "a game must end");
  }
  games += 1;
  totalMoves += st.moves;
  if (st.winner === -1) result.draw += 1;
  else {
    assert.ok(st.line && st.line.length === 3);
    st.line.forEach((x) => assert.strictEqual(st.board[x], st.winner + 1));
    if (st.winner === starter) result.first += 1; else result.second += 1;
  }
}
console.log("kleeberg-core: " + games + " computer games, " + (totalMoves / games).toFixed(1) + " moves on average, " + result.first + " won by the starter, " + result.second + " by the other, " + result.draw + " draws");
console.log("OK");
