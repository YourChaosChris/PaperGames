// tests/yut-core.js
const assert = require("assert");
const Y = require("../yut-core.js");
function lcg(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
function withPiece(route, steps) {
  const g = Y.createGame({ players: 2 });
  g.pieces[0].route = route;
  g.pending = [steps];
  g.owed = 0;
  return g;
}
const to = (g, steps, choice) => Y.legalMoves(g, steps).filter((m) => m.choice === choice || (!choice && !m.choice) || !m.choice).map((m) => m.to);
function dest(g, steps, choice) {
  const onBoard = g.pieces[0].route.length > 0;
  const m = Y.legalMoves(g, steps).find((x) => (!onBoard || x.from !== -1) && (!choice || x.choice === choice));
  return m && m.to;
}
// entry
assert.strictEqual(dest(withPiece([], 5), 5), 5, "enter with 5 -> node 5");
// corner choice
assert.strictEqual(dest(withPiece([5], 2), 2, "diag"), 21);
assert.strictEqual(dest(withPiece([5], 2), 2, "ring"), 7);
assert.strictEqual(dest(withPiece([10], 3), 3, "diag"), 22);
assert.strictEqual(dest(withPiece([10], 3), 3, "ring"), 13);
// no choice when merely passing a corner
assert.strictEqual(Y.legalMoves(withPiece([3], 4), 4).filter((m) => m.from === 3).length, 1);
assert.strictEqual(dest(withPiece([3], 4), 4), 7);
// center
assert.strictEqual(dest(withPiece([22], 3), 3), "finish", "from center 3 steps finishes (27,28,finish)");
assert.strictEqual(dest(withPiece([22], 2), 2), 28);
assert.strictEqual(dest(withPiece([5], 5), 5, "diag"), 24);
assert.strictEqual(dest(withPiece([5, 20], 4), 4), 24, "pass center on diag A");
assert.strictEqual(dest(withPiece([5, 20], 5), 5), 15);
assert.strictEqual(dest(withPiece([10, 25], 4), 4), 28, "pass center on diag B");
assert.strictEqual(dest(withPiece([10, 25], 5), 5), "finish");
// ring finish
assert.strictEqual(dest(withPiece([18], 2), 2), "finish");
assert.strictEqual(dest(withPiece([18], 1), 1), 19);
// capture
{
  const g = withPiece([1], 2);
  g.pieces[4].route = [3];
  const m = Y.legalMoves(g, 2).find((x) => x.to === 3);
  assert.deepStrictEqual(m.captures, [4]);
  const s = Y.applyMove(g, m);
  assert.strictEqual(s.owed, 1, "capture gives extra throw");
  assert.deepStrictEqual(s.pieces[4].route, [], "captured piece waits");
  assert.strictEqual(s.turn, 0, "turn stays with the capturer");
}
// stacking moves together and merges
{
  const g = withPiece([2], 2);
  g.pieces[1].route = [2];
  const ms = Y.legalMoves(g, 2).filter((m) => m.from === 2);
  assert.strictEqual(ms.length, 1);
  assert.strictEqual(ms[0].pieceIds.length, 2);
  const g2 = withPiece([2], 1);
  g2.pieces[1].route = [3];
  const mm = Y.legalMoves(g2, 1).find((m) => m.from === 2);
  const s2 = Y.applyMove(g2, mm);
  assert.strictEqual(s2.pieces[0].route[s2.pieces[0].route.length - 1], 3);
  assert.deepStrictEqual(s2.pieces[0].route, s2.pieces[1].route, "merged stacks share a route");
}
// backdo
{
  const g = withPiece([3], -1);
  const m = Y.legalMoves(g, -1)[0];
  assert.strictEqual(Y.applyMove(g, m).pieces[0].route.length, 0, "backdo from entry -> waiting");
  const g2 = withPiece([5, 6, 7], -1);
  assert.strictEqual(Y.legalMoves(g2, -1)[0].to, 6);
  const g3 = Y.createGame({ players: 2 });
  g3.pending = [-1]; g3.owed = 0;
  assert.strictEqual(Y.legalMoves(g3, -1).length, 0, "no backdo without a piece on the board");
  assert.strictEqual(Y.skipUnusable(g3).turn, 1, "lost backdo passes the turn");
}
// extra throws
{
  let g = Y.createGame({ players: 2 });
  g = Y.addThrow(g, { name: "yut", steps: 4, extraThrow: true });
  assert.strictEqual(g.owed, 1);
  g = Y.addThrow(g, { name: "mo", steps: 5, extraThrow: true });
  assert.strictEqual(g.owed, 1);
  g = Y.addThrow(g, { name: "do", steps: 1, extraThrow: false });
  assert.strictEqual(g.owed, 0);
  assert.deepStrictEqual(g.pending, [4, 5, 1]);
}
// throw distribution
{
  const rng = lcg(7);
  const c = {};
  const N = 20000;
  for (let i = 0; i < N; i++) { const t = Y.throwSticks(rng); c[t.name] = (c[t.name] || 0) + 1; }
  const exp = { mo: 1 / 16, yut: 1 / 16, geol: 4 / 16, gae: 6 / 16, do: 3 / 16, backdo: 1 / 16 };
  Object.keys(exp).forEach((k) => assert(Math.abs(c[k] / N - exp[k]) < 0.01, "distribution " + k));
}
// random full games
[2, 3, 4].forEach((n) => {
  for (let seed = 1; seed <= 20; seed++) {
    const rng = lcg(seed * 31 + n);
    let s = Y.createGame({ players: n });
    let guard = 0;
    while (!Y.isOver(s)) {
      assert(++guard < 20000, "game must end");
      if (s.owed > 0) { s = Y.addThrow(s, Y.throwSticks(rng)); }
      s = Y.skipUnusable(s);
      if (Y.isOver(s) || s.owed > 0 && s.pending.length === 0) continue;
      const all = [];
      s.pending.forEach((st) => Y.legalMoves(s, st).forEach((m) => all.push(m)));
      if (!all.length) continue;
      s = Y.applyMove(s, all[Math.floor(rng() * all.length)]);
      assert.strictEqual(s.pieces.length, n * 4);
      s.pieces.forEach((pc) => assert(pc.route.length === 0 || !pc.done));
    }
    assert(s.winner !== null);
    assert(s.pieces.filter((pc) => pc.player === s.winner).every((pc) => pc.done));
  }
});
console.log("yut-core: ALL CHECKS PASS");
