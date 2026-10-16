#!/usr/bin/env node
// tests/klappenkasten-core.js
// Rules of Klappenkasten (klappenkasten-core.js): legal and illegal
// closings, the one-die rule, scoring, "box shut", rounds, and 1000
// computer-against-computer games that must all end without an error.
//
// No server or browser needed. Run: node tests/klappenkasten-core.js

const assert = require("assert");
const C = require("../klappenkasten-core.js");

// A seedable generator for repeatable simulations.
function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
// A generator that returns the given dice faces one after the other.
function faces(list) {
  let i = 0;
  return () => (list[i++] - 1 + 0.01) / 6;
}

// ---- Start ----
let s = C.newGame({ players: 2, computer: [false, true] });
assert.deepStrictEqual(s.open, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
assert.strictEqual(s.phase, "roll");
assert.strictEqual(C.newGame({ players: 3, size: 12 }).open.length, 12);
assert.strictEqual(C.newGame({ players: 9 }).n, 4);
assert.strictEqual(C.newGame({ players: 2, rounds: 7 }).rounds, 3);

// ---- Closing before rolling, or the wrong flaps, is refused ----
assert.strictEqual(C.close(s, [2]), s);
s = C.roll(s, 2, faces([3, 5]));
assert.deepStrictEqual(s.dice, [3, 5]);
assert.strictEqual(s.phase, "close");
assert.strictEqual(C.roll(s, 2, faces([1, 1])), s, "cannot roll twice in a row");
assert.strictEqual(C.close(s, [7]), s, "wrong sum");
assert.strictEqual(C.close(s, [4, 4]), s, "a flap only once");
assert.strictEqual(C.close(s, [8, 0]), s, "flap that does not exist");
assert.strictEqual(C.close(s, []), s);
assert.strictEqual(C.close(s, "8"), s);
const ch = C.choices(s).map((c) => c.join("+"));
assert.deepStrictEqual(ch.sort(), ["1+2+5", "1+3+4", "1+7", "2+6", "3+5", "8"].sort());
s = C.close(s, [3, 5]);
assert.deepStrictEqual(s.open, [1, 2, 4, 6, 7, 8, 9]);
assert.strictEqual(s.phase, "roll");
assert.strictEqual(s.current, 0, "the same player rolls again");
assert.deepStrictEqual(s.turnClosed, [3, 5]);
assert.strictEqual(C.close(s, [1]), s, "no closing without a roll");

// ---- One die only when 7, 8 and 9 are closed ----
assert.strictEqual(C.roll(s, 1, faces([2])), s, "one die is not allowed yet");
assert.strictEqual(C.canOneDie(s), false);
let one = C.newGame({ players: 2 });
one.open = [1, 2, 4, 5];
assert.strictEqual(C.canOneDie(one), true);
one = C.roll(one, 1, faces([5]));
assert.strictEqual(one.dice.length, 1);
assert.deepStrictEqual(one.dice, [5]);
const six = C.newGame({ players: 2, size: 12 });
six.open = [1, 3, 8];
assert.strictEqual(C.canOneDie(six), false, "flap 8 is still open (12 variant)");

// ---- Turn ends when nothing fits; the open flaps are the points ----
let t = C.newGame({ players: 2, computer: [false, false] });
t.open = [8, 9];
t = C.roll(t, 2, faces([1, 2]));
assert.strictEqual(t.phase, "roll", "next player's turn");
assert.strictEqual(t.current, 1);
assert.deepStrictEqual(t.scores[0], [17]);
assert.strictEqual(t.last.points, 17);
assert.deepStrictEqual(t.last.dice, [1, 2]);
assert.deepStrictEqual(t.open, [1, 2, 3, 4, 5, 6, 7, 8, 9], "fresh flaps for the next turn");

// ---- Box shut: instant win with 0 points ----
let b = C.newGame({ players: 2, rounds: 5 });
b.open = [3, 4];
b = C.roll(b, 2, faces([3, 4]));
b = C.close(b, [3, 4]);
assert.strictEqual(b.phase, "over");
assert.strictEqual(b.winner, 0);
assert.strictEqual(b.boxShut, true);
assert.deepStrictEqual(b.scores[0], [0]);
assert.strictEqual(C.roll(b, 2, faces([1, 1])), b, "nothing after the game");
assert.strictEqual(C.outcomeFor(b, 0), "win");
assert.strictEqual(C.outcomeFor(b, 1), "loss");

// ---- Rounds, lowest total wins, a tie is a draw ----
let g = C.newGame({ players: 2, rounds: 1 });
g.open = [9];
g = C.roll(g, 2, faces([1, 1]));          // player 0: 9 points
g.open = [4];
g = C.roll(g, 2, faces([1, 1]));          // player 1: 4 points
assert.strictEqual(g.phase, "over");
assert.deepStrictEqual(C.totals(g), [9, 4]);
assert.strictEqual(g.winner, 1);
let d = C.newGame({ players: 2, rounds: 1 });
d.open = [5];
d = C.roll(d, 2, faces([1, 1]));
d.open = [5];
d = C.roll(d, 2, faces([1, 1]));
assert.strictEqual(d.winner, -1);
assert.strictEqual(C.outcomeFor(d, 0), "draw");
let r3 = C.newGame({ players: 2, rounds: 3 });
for (let i = 0; i < 5; i++) { r3.open = [9]; r3 = C.roll(r3, 2, faces([1, 1])); }
assert.strictEqual(r3.phase, "roll");
assert.strictEqual(r3.round, 3);

// ---- Computer: high flaps first ----
let a = C.newGame({ players: 2 });
a = C.roll(a, 2, faces([4, 4]));
assert.deepStrictEqual(C.chooseAi(a), [8]);
a = C.newGame({ players: 2 });
a.open = [1, 2, 3, 4, 5, 6];
a = C.roll(a, 2, faces([5, 6]));
assert.deepStrictEqual(C.chooseAi(a).slice().sort((x, y) => y - x)[0], 6, "11 = 5+6 closes the 6 first");
// One die is chosen when it gives the better chance.
const low = C.newGame({ players: 2 });
low.open = [1, 2, 3];
assert.strictEqual(C.aiDiceCount(low), 1);
const high = C.newGame({ players: 2 });
high.open = [8, 9];
assert.strictEqual(C.aiDiceCount(high), 2);

// ---- 1000 computer against computer games ----
let turns = 0;
let boxes = 0;
let draws = 0;
const wins = [0, 0, 0, 0];
for (let i = 0; i < 1000; i++) {
  const rng = seeded(i + 1);
  const players = 2 + (i % 3);
  const size = i % 4 === 3 ? 12 : 9;
  const rounds = [1, 3, 5][i % 3];
  let x = C.newGame({ players, computer: [true, true, true, true], size, rounds });
  let steps = 0;
  while (x.phase !== "over") {
    const before = x;
    x = C.aiStep(x, rng);
    assert.notStrictEqual(x, before, "the computer never gets stuck");
    assert.ok(++steps < 5000, "game does not end");
    x.open.forEach((f) => assert.ok(f >= 1 && f <= size));
  }
  turns += x.turns;
  if (x.boxShut) boxes += 1;
  if (x.winner === -1) draws += 1; else wins[x.winner] += 1;
  if (!x.boxShut) assert.strictEqual(x.turns, players * rounds);
  assert.ok(x.scores.every((list) => list.length <= rounds));
}
console.log("Klappenkasten core: 1000 computer games, " + turns + " turns, " + boxes + " box shut, " + draws + " draws, wins per seat " + wins.join("/"));
console.log("Klappenkasten core: pass");
