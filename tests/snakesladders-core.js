// snakesladders-core.js test
// "Snakes and Ladders": checks both boards (no field is the start of two
// things, no ladder or snake starts or ends on another's start, ladders
// go up and snakes down, everything on the board), then plays 1000
// computer games per board in each finishing mode: every game must end
// and no token may ever stand outside 0..last field.
const path = require("path");
const C = require(path.join(__dirname, "..", "snakesladders-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const fails = [];
for (const name of Object.keys(C.BOARDS)) {
  const b = C.BOARDS[name];
  const starts = Object.keys(b.ladders).concat(Object.keys(b.snakes)).map(Number);
  if (new Set(starts).size !== starts.length) fails.push(name + ": a field starts two things");
  Object.entries(b.ladders).forEach(([f, t]) => { f = +f; if (!(t > f && t < b.size && f > 1)) fails.push(name + ": ladder " + f + "->" + t); if (starts.includes(t)) fails.push(name + ": ladder top " + t + " starts something"); });
  Object.entries(b.snakes).forEach(([f, t]) => { f = +f; if (!(t < f && t >= 1 && f < b.size)) fails.push(name + ": snake " + f + "->" + t); if (starts.includes(t)) fails.push(name + ": snake tail " + t + " starts something"); });
  const seen = new Set();
  for (let f = 1; f <= b.size; f++) { const c = C.cellOf(name, f); seen.add(c.row + "," + c.col); }
  if (seen.size !== b.size) fails.push(name + ": cells overlap");
}
const stats = {};
for (const name of Object.keys(C.BOARDS)) {
  for (const finish of ["spare", "exact"]) {
    let turns = 0, maxTurns = 0;
    for (let g = 1; g <= 1000; g++) {
      const r = rng(g * 31337 + name.length * 7 + finish.length);
      let s = C.createInitialState(name, 2 + (g % 3), finish);
      let k = 0;
      while (!s.gameOver) {
        s = C.move(s, C.rollDie(r));
        if (s.pos.some((p) => p < 0 || p > C.BOARDS[name].size)) { fails.push(name + "/" + finish + " #" + g + ": token outside"); break; }
        if (++k > 20000) { fails.push(name + "/" + finish + " #" + g + ": no end"); break; }
      }
      if (s.gameOver && s.pos[s.winner] !== C.BOARDS[name].size) fails.push(name + "/" + finish + " #" + g + ": winner not on the last field");
      turns += k; maxTurns = Math.max(maxTurns, k);
    }
    stats[name + "/" + finish] = { avgTurns: (turns / 1000).toFixed(1), maxTurns };
  }
}
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== SNAKES AND LADDERS CORE: 4000 games, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
