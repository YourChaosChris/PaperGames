// snakesladders-core.js test
// "Snakes and Ladders": checks both boards (no field is the start of two
// things, no ladder or snake starts or ends on another's start, ladders
// go up and snakes down, everything on the board), then plays 1000
// computer games per board in each finishing mode: every game must end
// and no token may ever stand outside 0..last field. Then 1000 computer
// games with every combination of the chosen token (circle, square,
// triangle, star), who starts (me, computer, random), 2-4 players and one
// or two people: every game ends, the tokens are all different and the
// person has the chosen one, and the chosen starter really rolls first.
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
// Token and starter.
const combos = [];
for (const shape of C.SHAPES) for (const start of ["me", "computer", "random"]) for (const n of [2, 3, 4]) for (const humans of [1, 2]) if (humans < n) combos.push({ shape, start, n, humans });
const starts = { me: 0, computer: 0, random: 0 };
const randomSeats = {};
for (let g = 0; g < 1000; g++) {
  const c = combos[g % combos.length];
  const r = rng(g * 7907 + 11);
  const tag = "token game " + g + " (" + JSON.stringify(c) + ")";
  // The second person (if any) asks for the same shape: gets the next free one.
  const shapes = C.assignShapes(c.n, c.humans === 2 ? [c.shape, c.shape] : [c.shape]);
  if (shapes[0] !== C.SHAPES.indexOf(c.shape)) fails.push(tag + ": person did not get the chosen token");
  if (new Set(shapes).size !== c.n || shapes.some((k) => k < 0 || k > 3)) fails.push(tag + ": tokens not all different " + shapes);
  const first = C.firstPlayer(c.start, c.n, c.humans, r);
  const want = c.start === "me" ? 0 : c.start === "computer" ? c.humans : first;
  if (first !== want || first < 0 || first >= c.n) fails.push(tag + ": starter " + first);
  if (c.start === "random") randomSeats[c.n + "/" + first] = (randomSeats[c.n + "/" + first] || 0) + 1;
  let s = C.createInitialState(g % 2 ? "big" : "small", c.n, g % 3 ? "spare" : "exact", { shapes, first });
  if (s.turn !== first || JSON.stringify(s.shapes) !== JSON.stringify(shapes)) fails.push(tag + ": state does not take token/starter");
  let k = 0;
  while (!s.gameOver) {
    s = C.move(s, C.rollDie(r));
    if (k === 0 && s.last.player !== want) fails.push(tag + ": first roll by seat " + s.last.player + ", expected " + want);
    if (JSON.stringify(s.shapes) !== JSON.stringify(shapes)) { fails.push(tag + ": tokens changed"); break; }
    if (++k > 20000) { fails.push(tag + ": no end"); break; }
  }
  starts[c.start]++;
}
// Every seat comes up as a random starter.
for (const n of [2, 3, 4]) for (let p = 0; p < n; p++) if (!randomSeats[n + "/" + p]) fails.push("random start never picked seat " + p + " of " + n);
// An old state without shapes plays on.
{
  let s = C.createInitialState("big", 3, "spare");
  delete s.shapes; delete s.first;
  const r = rng(99);
  let k = 0;
  while (!s.gameOver && k++ < 20000) s = C.move(s, C.rollDie(r));
  if (!s.gameOver || s.shapes) fails.push("old state without shapes");
}
console.log("token games by starter: " + JSON.stringify(starts) + ", random starters: " + JSON.stringify(randomSeats));

fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== SNAKES AND LADDERS CORE: 4000 games, 1000 games with chosen token and starter (" + combos.length + " combinations), " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
