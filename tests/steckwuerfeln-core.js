#!/usr/bin/env node
// tests/steckwuerfeln-core.js
// Rules of Steckwuerfeln (steckwuerfeln-core.js): the two ways to peg, the
// refused pegs, the double-six joker in its three settings, points,
// rounds, an instant win with every hole pegged, the shared-board variant
// (who cannot peg is out) and 1000 computer games that must all end.
//
// No server or browser needed. Run: node tests/steckwuerfeln-core.js

const assert = require("assert");
const C = require("../steckwuerfeln-core.js");

function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
function faces(list) {
  let i = 0;
  return () => (list[i++] - 1 + 0.01) / 6;
}
const key = (list) => list.map((c) => c.join("+")).sort().join(" ");

// ---- Start: eleven free holes 2..12 ----
let s = C.newGame({ players: 2, computer: [false, true] });
assert.deepStrictEqual(s.open, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.strictEqual(s.phase, "roll");
assert.strictEqual(s.mode, "score");
assert.strictEqual(s.sixes, "again");
assert.strictEqual(C.newGame({ players: 7 }).n, 4);
assert.strictEqual(C.plug(s, [2]), s, "nothing to peg before the roll");

// ---- 2 and 4: hole 6, or holes 2 and 4 ----
assert.strictEqual(key(C.waysFor(s.open, 2, 4)), "2+4 6");
assert.strictEqual(key(C.waysFor(s.open, 3, 3)), "6", "a double only has the total");
assert.strictEqual(key(C.waysFor(s.open, 1, 4)), "5", "there is no hole 1");
assert.strictEqual(key(C.waysFor([2, 3, 6], 2, 4)), "6");
assert.strictEqual(key(C.waysFor([2, 4], 2, 4)), "2+4");
assert.strictEqual(key(C.waysFor([3, 5], 2, 4)), "");

s = C.roll(s, faces([2, 4]));
assert.deepStrictEqual(s.dice, [2, 4]);
assert.strictEqual(s.phase, "plug");
assert.strictEqual(C.roll(s, faces([1, 1])), s, "cannot roll before pegging");
assert.strictEqual(C.plug(s, [5]), s, "wrong hole");
assert.strictEqual(C.plug(s, [2]), s, "one die alone is not allowed");
assert.strictEqual(C.plug(s, [6, 2, 4]), s);
assert.strictEqual(C.plug(s, []), s);
assert.strictEqual(C.plug(s, "6"), s);
let two = C.plug(s, [4, 2]);
assert.deepStrictEqual(two.open, [3, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.strictEqual(two.phase, "roll");
assert.strictEqual(two.current, 0, "the same player goes on");
let one = C.plug(s, [6]);
assert.deepStrictEqual(one.open, [2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);
assert.strictEqual(C.plug(one, [6]), one, "nothing to peg without a roll");

// ---- Turn ends when nothing can be pegged; free holes add up ----
let t = C.newGame({ players: 2, computer: [false, false], rounds: 1 });
t.open = [2, 8, 12];
t = C.roll(t, faces([1, 2]));       // total 3, hole 3 is pegged -> nothing
assert.strictEqual(t.current, 1);
assert.deepStrictEqual(t.scores[0], [22]);
assert.strictEqual(t.last.kind, "stuck");
assert.deepStrictEqual(t.open, C.FIELDS, "fresh board for the next player");

// ---- Every hole pegged: 0 points and an instant win ----
let f = C.newGame({ players: 2, rounds: 5 });
f.open = [4, 6];
f = C.roll(f, faces([2, 4]));
assert.strictEqual(key(C.choices(f)), "6", "hole 2 is not free, so only the total");
f = C.plug(f, [6]);
assert.strictEqual(f.phase, "roll");
f = C.roll(f, faces([1, 3]));
f = C.plug(f, [4]);
assert.strictEqual(f.phase, "over");
assert.strictEqual(f.winner, 0);
assert.strictEqual(f.full, true);
assert.deepStrictEqual(f.scores[0], [0]);

// ---- Double six, three settings ----
let a = C.newGame({ players: 2, sixes: "again" });
a = C.roll(a, faces([6, 6]));
assert.strictEqual(a.phase, "roll", "again: roll again");
assert.strictEqual(a.current, 0);
assert.strictEqual(a.last.kind, "again");
assert.deepStrictEqual(a.open, C.FIELDS, "again: nothing pegged");
let o = C.newGame({ players: 2, sixes: "out" });
o.open = [3, 12];
o = C.roll(o, faces([6, 6]));
assert.strictEqual(o.current, 1, "out: the turn ends");
assert.deepStrictEqual(o.scores[0], [15]);
let p = C.newGame({ players: 2, sixes: "plug" });
p = C.roll(p, faces([6, 6]));
assert.strictEqual(p.phase, "plug", "plug: normal total");
assert.strictEqual(key(C.choices(p)), "12");
p = C.plug(p, [12]);
assert.ok(p.open.indexOf(12) < 0);

// ---- Rounds, lowest total wins, a tie is a draw ----
let g = C.newGame({ players: 2, rounds: 1 });
g.open = [9];
g = C.roll(g, faces([1, 2]));
g.open = [4];
g = C.roll(g, faces([1, 2]));
assert.strictEqual(g.phase, "over");
assert.deepStrictEqual(C.totals(g), [9, 4]);
assert.strictEqual(g.winner, 1);
assert.strictEqual(C.outcomeFor(g, 1), "win");
assert.strictEqual(C.outcomeFor(g, 0), "loss");
let d = C.newGame({ players: 2, rounds: 1 });
d.open = [5];
d = C.roll(d, faces([1, 2]));
d.open = [5];
d = C.roll(d, faces([1, 2]));
assert.strictEqual(d.winner, -1);
assert.strictEqual(C.outcomeFor(d, 0), "draw");
assert.strictEqual(C.roll(d, faces([1, 1])), d, "nothing after the game");

// ---- Shared board: who cannot peg is out, the last one wins ----
let h = C.newGame({ players: 3, mode: "shared", computer: [false, false, false] });
h = C.roll(h, faces([2, 4]));
h = C.plug(h, [6]);
assert.strictEqual(h.current, 1, "next player");
assert.deepStrictEqual(h.open, [2, 3, 4, 5, 7, 8, 9, 10, 11, 12], "the board is shared");
h.open = [12];
h = C.roll(h, faces([1, 2]));
assert.strictEqual(h.out[1], true);
assert.strictEqual(h.phase, "roll");
assert.strictEqual(h.current, 2, "the next player still in the game");
h = C.roll(h, faces([3, 3]));
assert.strictEqual(h.out[2], true);
assert.strictEqual(h.phase, "over");
assert.strictEqual(h.winner, 0);
// joker "out" in the shared game: pass without losing
let hp = C.newGame({ players: 2, mode: "shared", sixes: "out" });
hp = C.roll(hp, faces([6, 6]));
assert.strictEqual(hp.current, 1);
assert.strictEqual(hp.out[0], false);

// ---- Computer ----
// Keeps later rolls playable: with 6 free and 2+4 rolled it prefers the two pegs when that leaves more rolls.
let ai = C.newGame({ players: 2, computer: [false, true] });
ai = C.roll(ai, faces([3, 4]));
const pick = C.chooseAi(ai);
assert.ok(Array.isArray(pick) && C.choices(ai).some((c) => c.join() === pick.join()));
assert.ok(C.playableShare(C.FIELDS, "again") > 0.99);
assert.ok(C.playableShare([12], "plug") < 0.05);

// ---- 1000 computer against computer games ----
const stats = { score: 0, shared: 0, full: 0, draws: 0 };
for (let i = 0; i < 1000; i++) {
  const rng = seeded(i + 7);
  const mode = i % 2 ? "shared" : "score";
  const sixes = ["again", "out", "plug"][i % 3];
  const players = 2 + (i % 3);
  const rounds = [1, 3, 5][i % 3];
  let x = C.newGame({ players, computer: [true, true, true, true], mode, sixes, rounds });
  let steps = 0;
  while (x.phase !== "over") {
    const before = x;
    x = C.aiStep(x, rng);
    assert.notStrictEqual(x, before, "the computer never gets stuck");
    assert.ok(++steps < 20000, "game does not end");
    x.open.forEach((v) => assert.ok(v >= 2 && v <= 12));
  }
  stats[mode] += 1;
  if (x.full) stats.full += 1;
  if (x.winner === -1) stats.draws += 1;
  if (mode === "shared") assert.ok(x.winner >= 0 && x.out.filter((v) => !v).length === 1);
  else if (!x.full) assert.strictEqual(x.turns, players * rounds);
}
console.log("Steckwuerfeln core: 1000 computer games (" + stats.score + " score, " + stats.shared + " shared), " + stats.full + " boards full, " + stats.draws + " draws");
console.log("Steckwuerfeln core: pass");
