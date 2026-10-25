#!/usr/bin/env node
// tests/trix-ai-games.js
// Trix computer against computer (trix-core.js, trix-ai.js): games on every
// level and in mixed seats must run to the end of the fourth kingdom without
// a move the rules refuse, with twenty deals, every player owning exactly
// one kingdom and the points of every kingdom adding up to zero.
//
// Fixed seeds; Math.random is replaced because the computer uses it.
// No server or browser needed. Run: node tests/trix-ai-games.js

const assert = require("assert");

function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
let rng = seeded(1);
Math.random = () => rng();
const Core = require("../trix-core.js");
const Ai = require("../trix-ai.js");

function playGame(levels, seed) {
  rng = seeded(seed);
  let g = Core.createGame(rng);
  let steps = 0;
  while (!g.gameOver) {
    assert.ok(++steps < 5000, "game " + seed + " (" + levels.join("/") + ") does not end");
    if (g.kingdomOver) { g = Core.nextKingdom(g, rng); continue; }
    if (!g.deal) {
      const r = Core.chooseContract(g, Ai.chooseContract(g, levels[g.owner]));
      assert.ok(r.ok, "contract refused in game " + seed);
      g = r.game;
      continue;
    }
    const r = Core.play(g, Ai.chooseMove(g, levels[g.deal.turn]), rng);
    assert.ok(r.ok, "move refused in game " + seed + ": " + r.reason);
    g = r.game;
  }
  assert.ok(!g.endedEarly);
  assert.strictEqual(g.history.length, 20, "twenty deals");
  const owners = [];
  for (let k = 0; k < 4; k++) {
    const deals = g.history.filter((h) => h.kingdom === k);
    assert.strictEqual(deals.length, 5, "five contracts in kingdom " + k);
    assert.deepStrictEqual(deals.map((h) => h.contract).sort(), Core.CONTRACTS.slice().sort());
    const sum = deals.reduce((n, h) => n + h.scores.reduce((a, b) => a + b, 0), 0);
    assert.strictEqual(sum, 0, "kingdom " + k + " adds up to zero");
    owners.push(deals[0].owner);
  }
  assert.deepStrictEqual(owners.slice().sort(), [0, 1, 2, 3], "every player owns one kingdom");
  assert.strictEqual(g.totals.reduce((a, b) => a + b, 0), 0);
  return g;
}

const runs = [[1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3], [3, 1, 2, 1]];
let games = 0;
runs.forEach((levels, i) => {
  for (let s = 0; s < 15; s++) { playGame(levels, 1000 * (i + 1) + s); games++; }
});
console.log("trix-ai-games: " + games + " computer games ended by the rules");
