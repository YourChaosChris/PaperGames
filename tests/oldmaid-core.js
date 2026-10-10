// oldmaid-core.js test
// "Old Maid": 500 games per number of players (2, 3, 4), the computer
// drawing at random for everyone. Every game must end, at the end exactly
// one player must hold exactly the Black Peter, and the number of cards
// (in hands plus laid-down pairs) must stay the pack size throughout.
const path = require("path");
const C = require(path.join(__dirname, "..", "oldmaid-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const fails = [];
const stats = {};
for (const n of [2, 3, 4]) {
  const packSize = C.PAIRS[n] * 2 + 1;
  let moves = 0, maxMoves = 0, humanLost = 0;
  for (let g = 1; g <= 500; g++) {
    const r = rng(g * 7919 + n);
    let s = C.createInitialState(n, r);
    let ok = true, steps = 0;
    while (!s.gameOver) {
      if (C.cardCount(s) !== packSize) { ok = false; fails.push(n + "p #" + g + ": card count " + C.cardCount(s)); break; }
      const from = C.giver(s);
      const res = C.draw(s, Math.floor(r() * s.hands[from].length), r, 0);
      if (!res.ok) { ok = false; fails.push(n + "p #" + g + ": draw refused"); break; }
      s = res.state;
      if (++steps > 10000) { ok = false; fails.push(n + "p #" + g + ": does not end"); break; }
    }
    if (!ok) continue;
    if (C.cardCount(s) !== packSize) fails.push(n + "p #" + g + ": card count at the end " + C.cardCount(s));
    const holders = s.hands.map((h, p) => (h.length ? p : -1)).filter((p) => p >= 0);
    if (holders.length !== 1 || s.hands[holders[0]].length !== 1 || s.hands[holders[0]][0] !== C.PETER || s.loser !== holders[0]) {
      fails.push(n + "p #" + g + ": end state wrong " + JSON.stringify(s.hands));
    }
    moves += steps; maxMoves = Math.max(maxMoves, steps);
    if (s.loser === 0) humanLost++;
  }
  stats[n] = { avgDraws: (moves / 500).toFixed(1), maxDraws: maxMoves, player1HoldsPeter: humanLost };
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== OLD MAID CORE: 1500 games, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
