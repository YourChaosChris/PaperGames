// tests/yut-ai.js
const assert = require("assert");
const Y = require("../yut-core.js");
const AI = require("../yut-ai.js");
function lcg(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
// capture is preferred
{
  const g = Y.createGame({ players: 2 });
  g.pieces[0].route = [1];
  g.pieces[4].route = [3];
  g.pending = [2];
  g.owed = 0;
  const h = AI.hint(g);
  assert.deepStrictEqual(h.captures, [4], "hint takes the capture");
}
// finish is preferred
{
  const g = Y.createGame({ players: 2 });
  g.pieces[0].route = [18];
  g.pending = [2];
  g.owed = 0;
  assert(AI.hint(g).finishes);
}
// no move -> null
{
  const g = Y.createGame({ players: 2 });
  g.pending = [-1];
  g.owed = 0;
  assert.strictEqual(AI.chooseMove(g, lcg(1), 2), null);
  assert.strictEqual(AI.hint(g), null);
}
// AI vs AI games end; level 2 beats level 1 most of the time
let wins2 = 0;
const GAMES = 60;
for (let seed = 1; seed <= GAMES; seed++) {
  const rng = lcg(seed * 97);
  let s = Y.createGame({ players: 2 });
  const level = [2, 1]; // player 0 level 2, player 1 level 1
  let guard = 0;
  while (!Y.isOver(s)) {
    assert(++guard < 20000);
    if (s.owed > 0) s = Y.addThrow(s, Y.throwSticks(rng));
    s = Y.skipUnusable(s);
    if (Y.isOver(s) || (s.owed > 0 && !s.pending.length)) continue;
    const m = AI.chooseMove(s, rng, level[s.turn]);
    if (!m) continue;
    s = Y.applyMove(s, m);
  }
  if (s.winner === 0) wins2++;
}
console.log("level 2 won " + wins2 + " of " + GAMES);
assert(wins2 > GAMES * 0.55, "level 2 is clearly stronger than level 1");
console.log("yut-ai: ALL CHECKS PASS");
