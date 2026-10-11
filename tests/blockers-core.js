// blockers-core.js test
// "Path Blockers": 500 computer games per number of players (2, 3, 4,
// levels mixed). Every game must end; no move may pass over a stone, use
// a field twice or deviate from the roll; the number of stones stays the
// same; every player keeps 5 tokens; stones never land in the bottom row
// or on the goal. Then 500 computer games per house (1-6) and number of
// players with the chosen house, token and starter (me, computer, random
// in turn): every game ends, player 1's tokens enter at the chosen house,
// the chosen starter rolls first, houses and tokens are all different.
// Also: every house is equally far from the goal (printed: steps from
// the entry field), and an old state without houses plays on.
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
// Houses: shortest way to the goal (stones and tokens left out, as they
// move during the game).
const houseDist = C.HOUSE_COLS.map((c) => C.distToGoal[(C.ROWS - 1) * C.COLS + c]);
if (new Set(houseDist).size !== 1) fails.push("houses not equally far: " + houseDist);
console.log("steps from each house's entry field to the goal: " + houseDist.map((d, h) => "house " + (h + 1) + ": " + d).join(", ") + " (plus 1 pip from the house onto the entry field)");
const houseGames = {};
for (let h = 0; h < C.HOUSE_COLS.length; h++) {
  for (const n of [2, 3, 4]) {
    let ended = 0;
    for (let g = 0; g < 500; g++) {
      const r = rng(h * 100003 + n * 1009 + g);
      const start = ["me", "computer", "random"][g % 3];
      const houses = C.assignHouses(n, [h]);
      const shapes = C.assignShapes(n, [g % 4]);
      const first = C.firstPlayer(start, n, 1, r);
      const tag = "house " + (h + 1) + ", " + n + "p, " + start + " #" + g;
      if (houses[0] !== h || new Set(houses).size !== n) { fails.push(tag + ": houses " + houses); break; }
      if (shapes[0] !== g % 4 || new Set(shapes).size !== n) { fails.push(tag + ": shapes " + shapes); break; }
      if ((start === "me" && first !== 0) || (start === "computer" && first !== 1) || first < 0 || first >= n) { fails.push(tag + ": starter " + first); break; }
      let s = C.createInitialState(n, { houses, shapes, first });
      if (C.entryOf(s, 0) !== (C.ROWS - 1) * C.COLS + C.HOUSE_COLS[h]) { fails.push(tag + ": entry"); break; }
      const levels = Array.from({ length: n }, (_, p) => 1 + ((g + p) % 3));
      let firstRoller = -1, entered = false, ok = true;
      for (let t = 0; t < 20000 && !s.gameOver; t++) {
        if (firstRoller === -1) firstRoller = s.turn;
        s = C.setRoll(s, C.rollDie(r));
        const m = A.chooseMove(s, levels[s.turn], r);
        if (!m) { s = C.pass(s); continue; }
        if (!entered && s.turn === 0 && s.tokens[0][m.token] === -1) {
          entered = true;
          if (m.path[0] !== C.entryOf(s, 0)) { fails.push(tag + ": entered elsewhere"); ok = false; break; }
        }
        const res = C.applyMove(s, m);
        s = res.state;
        if (res.stone) s = C.placeStone(s, A.chooseStone(s, levels[s.turn], r));
      }
      if (!ok) break;
      if (firstRoller !== first) { fails.push(tag + ": first roll by " + firstRoller); break; }
      if (!s.gameOver) { fails.push(tag + ": no end"); break; }
      ended++;
    }
    houseGames["house" + (h + 1) + "/" + n + "p"] = ended;
  }
}
const houseTotal = Object.values(houseGames).reduce((a, b) => a + b, 0);
console.log("games ended per house and players: " + JSON.stringify(houseGames));
// An old state (no houses, shapes, first) plays on with the old entries.
{
  const r = rng(77);
  let s = C.createInitialState(3);
  delete s.houses; delete s.shapes; delete s.first;
  if (C.entryOf(s, 1) !== (C.ROWS - 1) * C.COLS + 5) fails.push("old state: entry");
  for (let t = 0; t < 20000 && !s.gameOver; t++) {
    s = C.setRoll(s, C.rollDie(r));
    const m = A.chooseMove(s, 2, r);
    if (!m) { s = C.pass(s); continue; }
    const res = C.applyMove(s, m);
    s = res.state;
    if (res.stone) s = C.placeStone(s, A.chooseStone(s, 2, r));
  }
  if (!s.gameOver || s.houses) fails.push("old state did not play on");
}

fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== PATH BLOCKERS CORE: 1500 games, " + houseTotal + " games with chosen house, token and starter (500 per house and number of players), " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
