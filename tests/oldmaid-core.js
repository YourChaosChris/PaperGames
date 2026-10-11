// oldmaid-core.js test
// "Old Maid": 500 games per number of players (2, 3, 4), the computer
// drawing at random for everyone. Every game must end, at the end exactly
// one player must hold exactly the Black Peter, and the number of cards
// (in hands plus laid-down pairs) must stay the pack size throughout.
// The list of laid-down pairs (s.laid) must match the pair count of every
// player after every draw, a pair made by a draw must be the drawn card
// on top of that list, and every animal must be in a hand or laid down
// exactly as often as it is in the pack. A state without `laid` (saved
// before it existed) must still play to the end.
const path = require("path");
const C = require(path.join(__dirname, "..", "oldmaid-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Every animal twice in the pack: in hands plus laid pairs, and the laid
// list as long as the pair count for every player.
function laidOk(s, n) {
  for (let p = 0; p < s.numPlayers; p++) if (!Array.isArray(s.laid[p]) || s.laid[p].length !== s.pairs[p]) return false;
  const count = {};
  s.hands.forEach((h) => h.forEach((c) => { count[c] = (count[c] || 0) + 1; }));
  s.laid.forEach((l) => l.forEach((c) => { count[c] = (count[c] || 0) + 2; }));
  for (let a = 0; a < C.PAIRS[n]; a++) if (count[a] !== 2) return false;
  return count[C.PETER] === 1;
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
      if (!laidOk(s, n)) { ok = false; fails.push(n + "p #" + g + ": laid pairs wrong " + JSON.stringify(s.laid) + " / " + JSON.stringify(s.pairs)); break; }
      const from = C.giver(s);
      const res = C.draw(s, Math.floor(r() * s.hands[from].length), r, 0);
      if (!res.ok) { ok = false; fails.push(n + "p #" + g + ": draw refused"); break; }
      if (res.pair && res.state.laid[res.taker][res.state.laid[res.taker].length - 1] !== res.card) { ok = false; fails.push(n + "p #" + g + ": drawn pair not on top"); break; }
      if (!res.pair && res.state.laid[res.taker].length !== s.laid[res.taker].length) { ok = false; fails.push(n + "p #" + g + ": laid changed without pair"); break; }
      s = res.state;
      if (++steps > 10000) { ok = false; fails.push(n + "p #" + g + ": does not end"); break; }
    }
    if (!ok) continue;
    if (C.cardCount(s) !== packSize) fails.push(n + "p #" + g + ": card count at the end " + C.cardCount(s));
    if (!laidOk(s, n)) fails.push(n + "p #" + g + ": laid pairs wrong at the end");
    const holders = s.hands.map((h, p) => (h.length ? p : -1)).filter((p) => p >= 0);
    if (holders.length !== 1 || s.hands[holders[0]].length !== 1 || s.hands[holders[0]][0] !== C.PETER || s.loser !== holders[0]) {
      fails.push(n + "p #" + g + ": end state wrong " + JSON.stringify(s.hands));
    }
    moves += steps; maxMoves = Math.max(maxMoves, steps);
    if (s.loser === 0) humanLost++;
  }
  stats[n] = { avgDraws: (moves / 500).toFixed(1), maxDraws: maxMoves, player1HoldsPeter: humanLost };
}
// An old state without `laid` plays on.
{
  const r = rng(4242);
  let s = C.createInitialState(3, r);
  delete s.laid;
  let steps = 0;
  while (!s.gameOver && steps++ < 10000) {
    const res = C.draw(s, Math.floor(r() * s.hands[C.giver(s)].length), r, 0);
    if (!res.ok || res.state.laid) { fails.push("old state without laid: " + (res.ok ? "laid appeared" : "draw refused")); break; }
    s = res.state;
  }
  if (!s.gameOver) fails.push("old state without laid does not end");
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== OLD MAID CORE: 1500 games plus one from an old save, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
