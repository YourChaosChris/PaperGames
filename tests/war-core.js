// war-core.js test
// "War": 1000 games "to the end" and 1000 "short" games from fixed seeds.
// Every game must end (short: after 30 rounds at the latest; full: after
// at most 2000 rounds, else a draw), and the 32 cards must all stay in
// play - no card lost or doubled - after every round.
const path = require("path");
const C = require(path.join(__dirname, "..", "war-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const key = (c) => c.suit + c.rank;
const fails = [];
const out = {};
for (const mode of ["full", "short"]) {
  const res = { wins0: 0, wins1: 0, draws: 0, maxRounds: 0, avgRounds: 0, wars: 0, limit: 0 };
  for (let g = 1; g <= 1000; g++) {
    const r = rng(g * 104729 + mode.length);
    let s = C.createInitialState(mode, r);
    let steps = 0;
    while (!s.gameOver) {
      s = C.playRound(s, r);
      steps++;
      const all = s.piles[0].concat(s.piles[1]).map(key);
      if (all.length !== 32 || new Set(all).size !== 32) { fails.push(mode + " #" + g + ": cards " + all.length + "/" + new Set(all).size); break; }
      res.wars += s.last.wars;
      if (steps > C.MAX_ROUNDS + 1) { fails.push(mode + " #" + g + ": no end"); break; }
    }
    if (mode === "short" && s.round > C.SHORT_ROUNDS) fails.push(mode + " #" + g + ": more than 30 rounds");
    if (s.winner === 0) res.wins0++; else if (s.winner === 1) res.wins1++; else res.draws++;
    if (s.endReason === "limit") res.limit++;
    res.maxRounds = Math.max(res.maxRounds, s.round);
    res.avgRounds += s.round / 1000;
  }
  res.avgRounds = res.avgRounds.toFixed(1);
  out[mode] = res;
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(out));
console.log("\n=== WAR CORE: 2000 games, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
