// blockers-core.js test
// "Path Blockers": 500 computer games per number of players (2, 3, 4,
// levels mixed). Every game must end; no move may pass over a stone, use
// a field twice or deviate from the roll; the number of stones stays the
// same; every player keeps 5 tokens; stones never land in the bottom row
// or on the goal.
const path = require("path");
const C = require(path.join(__dirname, "..", "blockers-core.js"));
const A = require(path.join(__dirname, "..", "blockers-ai.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const fails = [];
const stats = {};
const STONES = C.startStones.length;
for (const n of [2, 3, 4]) {
  let turns = 0, maxTurns = 0, captures = 0, stoneMoves = 0;
  const wins = new Array(n).fill(0);
  for (let g = 1; g <= 500; g++) {
    const r = rng(g * 7907 + n);
    const levels = Array.from({ length: n }, (_, p) => 1 + ((g + p) % 3));
    let s = C.createInitialState(n);
    let ok = true;
    for (let t = 0; t < 20000 && !s.gameOver; t++) {
      s = C.setRoll(s, C.rollDie(r));
      const moves = C.legalMoves(s);
      for (const m of moves) {
        const stones = new Set(s.stones);
        if (m.path.length !== s.roll) { fails.push(n + "p #" + g + ": path length " + m.path.length + " for roll " + s.roll); ok = false; }
        if (new Set(m.path).size !== m.path.length) { fails.push(n + "p #" + g + ": field used twice"); ok = false; }
        if (m.path.slice(0, -1).some((f) => stones.has(f))) { fails.push(n + "p #" + g + ": passes over a stone"); ok = false; }
        for (let i = 1; i < m.path.length; i++) if (C.neighbours[m.path[i - 1]].indexOf(m.path[i]) === -1) { fails.push(n + "p #" + g + ": jump"); ok = false; }
      }
      if (!ok) break;
      const m = A.chooseMove(s, levels[s.turn], r);
      if (!m) { s = C.pass(s); continue; }
      const res = C.applyMove(s, m);
      if (res.captured) captures++;
      s = res.state;
      if (res.stone) {
        const f = A.chooseStone(s, levels[s.turn], r);
        if (f === null || C.isBottomRow(f) || f === C.goal) { fails.push(n + "p #" + g + ": bad stone field"); ok = false; break; }
        s = C.placeStone(s, f);
        stoneMoves++;
      }
      if (s.stones.length !== STONES && !s.gameOver) { fails.push(n + "p #" + g + ": stones " + s.stones.length); ok = false; break; }
      if (s.tokens.some((ts) => ts.length !== C.TOKENS)) { fails.push(n + "p #" + g + ": token count"); ok = false; break; }
      if (new Set(s.stones).size !== s.stones.length) { fails.push(n + "p #" + g + ": two stones on a field"); ok = false; break; }
    }
    if (!ok) continue;
    if (!s.gameOver) { fails.push(n + "p #" + g + ": no end"); continue; }
    wins[s.winner]++;
    turns += s.turns; maxTurns = Math.max(maxTurns, s.turns);
  }
  stats[n] = { avgTurns: (turns / 500).toFixed(1), maxTurns, captures, stoneMoves, wins };
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== PATH BLOCKERS CORE: 1500 games, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
