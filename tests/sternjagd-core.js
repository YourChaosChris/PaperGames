#!/usr/bin/env node
// tests/sternjagd-core.js
// Rules of Sternjagd (sternjagd-core.js): the board (twelve fields, two
// arrows from each, the same from every corner), the exact steps of the die,
// catching only where a move ends, stars and the return to a free corner,
// the last player left wins, the draw after 600 moves, the computer's
// capture and 1000 computer games that must all end.
//
// No server or browser needed. Run: node tests/sternjagd-core.js

const assert = require("assert");
const C = require("../sternjagd-core.js");

function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
function face(n) {
  return () => (n - 1 + 0.01) / 6;
}

// ---- The board ----
assert.strictEqual(C.NODES, 12);
let inDegree = new Array(12).fill(0);
C.NEXT.forEach((list, v) => {
  assert.strictEqual(list.length, 2, "two arrows leave field " + v);
  assert.notStrictEqual(list[0], list[1]);
  list.forEach((w) => {
    assert.notStrictEqual(w, v, "no arrow into itself");
    inDegree[w] += 1;
  });
});
assert.deepStrictEqual(inDegree, new Array(12).fill(2), "two arrows arrive at every field");
// Turning the board by a quarter maps the arrows onto each other.
function turn(v) {
  return v < 4 ? (v + 1) % 4 : 4 * Math.floor(v / 4) + (v % 4 + 1) % 4;
}
C.NEXT.forEach((list, v) => {
  const turned = list.map(turn).sort((a, b) => a - b);
  assert.deepStrictEqual(turned, C.NEXT[turn(v)].slice().sort((a, b) => a - b), "symmetry at " + v);
});
// Every field can be reached from every other (so nobody is cut off).
for (let a = 0; a < 12; a++) {
  const seen = { [a]: true };
  let frontier = [a];
  while (frontier.length) {
    const next = [];
    frontier.forEach((v) => C.NEXT[v].forEach((w) => { if (!seen[w]) { seen[w] = true; next.push(w); } }));
    frontier = next;
  }
  assert.strictEqual(Object.keys(seen).length, 12, "field " + a + " reaches all");
}

// ---- Steps are exact ----
assert.deepStrictEqual(C.reachable(0, 1), [4, 8]);
assert.deepStrictEqual(C.reachable(0, 2), [1, 5, 9, 7].sort((a, b) => a - b).filter((v) => C.reachable(0, 2).indexOf(v) >= 0));
for (let from = 0; from < 12; from++) {
  for (let k = 1; k <= 6; k++) {
    const list = C.reachable(from, k);
    assert.ok(list.indexOf(from) < 0, "never the field it starts on");
    // walk by hand
    let cur = { [from]: true };
    for (let i = 0; i < k; i++) {
      const nxt = {};
      Object.keys(cur).forEach((v) => C.NEXT[v].forEach((w) => { nxt[w] = true; }));
      cur = nxt;
    }
    delete cur[from];
    assert.deepStrictEqual(list, Object.keys(cur).map(Number).sort((a, b) => a - b));
  }
}

// ---- Start ----
assert.deepStrictEqual(C.startFields(2), [0, 2]);
assert.deepStrictEqual(C.startFields(3), [1, 0, 2], "3 players go round against the arrows (task 128)");
assert.deepStrictEqual(C.newGame({ players: 3 }).homes, [1, 0, 2]);
{
  const old = C.newGame({ players: 3 });
  delete old.homes;
  assert.deepStrictEqual(C.homesOf(old), [0, 1, 2], "a 3-player game saved before task 128 keeps its corners");
}
assert.deepStrictEqual(C.startFields(4), [0, 1, 2, 3]);
let s = C.newGame({ players: 2, computer: [false, true] });
assert.deepStrictEqual(s.pos, [0, 2]);
assert.deepStrictEqual(s.stars, [3, 3]);
assert.strictEqual(s.phase, "roll");
assert.strictEqual(s.current, 0);
assert.strictEqual(C.newGame({ players: 9 }).n, 4);
assert.strictEqual(C.newGame({ players: 3, first: 2 }).current, 2);
assert.strictEqual(C.newGame({ players: 3, first: 7 }).current, 0, "a seat that does not exist is ignored");
assert.strictEqual(C.move(s, 4), s, "no move before the roll");

// ---- A roll and a move ----
s = C.roll(s, face(1));
assert.strictEqual(s.die, 1);
assert.strictEqual(s.phase, "move");
assert.deepStrictEqual(C.destinations(s), [4, 8]);
assert.strictEqual(C.roll(s, face(2)), s, "cannot roll twice");
assert.strictEqual(C.move(s, 5), s, "not a field of this roll");
assert.strictEqual(C.move(s, 0), s, "never the starting field");
let t = C.move(s, 8);
assert.deepStrictEqual(t.pos, [8, 2]);
assert.strictEqual(t.current, 1);
assert.strictEqual(t.phase, "roll");
assert.strictEqual(t.die, 0);
assert.strictEqual(t.last.kind, "move");
assert.strictEqual(t.seq, 1);
assert.strictEqual(s.pos[0], 0, "the old state is not changed");

// ---- Passing over changes nothing, catching only at the end ----
// Player 0 on corner 0, player 1 on field 4 (one step ahead), die 2: the
// field 4 is passed on the way to corner 1, nobody is caught.
s = C.newGame({ players: 2 });
s.pos = [0, 4];
s = C.roll(s, face(2));
assert.ok(C.destinations(s).indexOf(1) >= 0, "corner 1 is two steps away over field 4");
t = C.move(s, 1);
assert.deepStrictEqual(t.stars, [3, 3], "passing over a piece is harmless");
assert.strictEqual(t.last.kind, "move");

// ---- Catching: a star less, back to a free corner ----
s = C.newGame({ players: 2 });
s.pos = [0, 4];
s = C.roll(s, face(1));
t = C.move(s, 4);
assert.strictEqual(t.last.kind, "capture");
assert.strictEqual(t.last.captured, 1);
assert.deepStrictEqual(t.stars, [3, 2]);
assert.strictEqual(t.alive[1], true);
assert.strictEqual(t.pos[0], 4);
assert.strictEqual(t.pos[1], 2, "the caught piece goes back to its own corner");
assert.strictEqual(t.current, 1);

// own corner taken by another piece: the next free one (a game saved
// before task 128, corners 0, 1, 2)
s = C.newGame({ players: 3 });
delete s.homes;
s.pos = [0, 4, 1];       // player 2 stands on player 1's corner (1)
s = C.roll(s, face(1));
t = C.move(s, 4);
assert.strictEqual(t.last.kind, "capture");
assert.strictEqual(t.pos[1], 2, "corner 1 is taken, so the next free corner (2)");
assert.strictEqual(new Set(t.pos).size, 3, "no two pieces on one field");
// a new 3-player game: the caught piece goes back to its own corner (0)
s = C.newGame({ players: 3 });
s.pos = [1, 5, 2];
s = C.roll(s, face(1));
t = C.move(s, 5);
assert.strictEqual(t.last.kind, "capture");
assert.strictEqual(t.pos[1], 0, "player 2's own corner is 0 since task 128");

// ---- Out of stars: out of the game; the last one left wins ----
s = C.newGame({ players: 3 });
s.pos = [0, 4, 9];
s.stars = [3, 1, 3];
s = C.roll(s, face(1));
t = C.move(s, 4);
assert.strictEqual(t.alive[1], false, "no star left: out");
assert.strictEqual(t.phase, "roll");
assert.strictEqual(t.current, 2, "the next living player is up");
assert.strictEqual(C.outcomeFor(t, 0), null);
// the last star of the last opponent
let f = C.newGame({ players: 2 });
f.pos = [0, 4];
f.stars = [3, 1];
f = C.move(C.roll(f, face(1)), 4);
assert.strictEqual(f.phase, "over");
assert.strictEqual(f.winner, 0);
assert.strictEqual(C.outcomeFor(f, 0), "win");
assert.strictEqual(C.outcomeFor(f, 1), "loss");
assert.strictEqual(C.roll(f, face(1)), f);
assert.strictEqual(C.move(f, 1), f);

// ---- A roll with no field: the turn passes ----
s = C.newGame({ players: 2 });
let found = false;
for (let from = 0; from < 12 && !found; from++) {
  for (let k = 1; k <= 6 && !found; k++) {
    if (!C.reachable(from, k).length) {
      s.pos = [from, (from + 6) % 12];
      t = C.roll(s, face(k));
      assert.strictEqual(t.last.kind, "pass");
      assert.strictEqual(t.current, 1);
      assert.strictEqual(t.phase, "roll");
      found = true;
    }
  }
}
// (If every roll has a field on this board the pass is never needed.)

// ---- Draw after the move limit ----
s = C.newGame({ players: 2 });
s.moves = C.MAX_MOVES - 1;
s.pos = [0, 2];
s = C.move(C.roll(s, face(1)), 4);
assert.strictEqual(s.phase, "over");
assert.strictEqual(s.winner, -1);
assert.strictEqual(C.outcomeFor(s, 0), "draw");

// ---- The computer catches when it can, and only plays legal moves ----
s = C.newGame({ players: 2, computer: [true, true] });
s.pos = [0, 8];
s = C.roll(s, face(1));
assert.strictEqual(C.chooseAi(s), 8, "a capture first");
for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
  const th = C.threat(a, b);
  assert.ok(th >= 0 && th <= 1);
}

// ---- 1000 computer games ----
const rng = seeded(20261017);
let games = 0;
let totalMoves = 0;
let draws = 0;
for (let g = 0; g < 1000; g++) {
  const n = 2 + (g % 3);
  let st = C.newGame({ players: n, computer: new Array(n).fill(true), first: g % n });
  let guard = 0;
  while (st.phase !== "over") {
    const next = C.aiStep(st, rng);
    assert.notStrictEqual(next, st, "the computer always acts");
    // invariants
    assert.strictEqual(next.pos.length, n);
    const live = [];
    next.alive.forEach((a, i) => { if (a) live.push(next.pos[i]); });
    assert.strictEqual(new Set(live).size, live.length, "no two living pieces on one field");
    next.stars.forEach((x, i) => {
      assert.ok(x >= 0 && x <= C.STARS);
      assert.strictEqual(next.alive[i], x > 0);
    });
    st = next;
    assert.ok(guard++ < 20000, "a game must end");
  }
  games += 1;
  totalMoves += st.moves;
  if (st.winner === -1) draws += 1;
  else assert.strictEqual(st.alive.filter(Boolean).length, 1);
}
console.log("sternjagd-core: " + games + " computer games, " + (totalMoves / games).toFixed(1) + " moves on average, " + draws + " draws");
console.log("OK");
