// blockers-core.js test
// "Blocked Path" (blockers): 500 computer games per number of players (2, 3, 4,
// levels mixed). Every game must end; no move may pass over a stone, use
// a field twice or deviate from the roll; the number of stones stays the
// same; every player keeps 5 tokens; stones never land in the bottom row
// or on the goal. Then 500 computer games per house (1-6) and number of
// players with the chosen house, token and starter (me, computer, random
// in turn): every game ends, player 1's tokens enter at the chosen house,
// the chosen starter rolls first, houses and tokens are all different.
// Also: every house is equally far from the goal (printed: steps from
// the entry field), and an old state without houses plays on.
// Game end "all": 500 computer games per number of players. Every game
// ends; no move passes over a stone; board + house + goal = 5 tokens per
// player all the time; the goal never keeps a token; the winner is the
// first with all 5 in the goal and the game ends right then; the ranking
// puts the winner first and the others by tokens in the goal. These games
// alternate 3 and 5 tokens per player, and no stone may ever stand on the
// last NEAR_GOAL fields before the goal.
// Safe half: no legal move ends on another player's token in the lower
// half (rows SAFE_FROM_ROW and below) - checked in every game.
// Fairness: 2000 games per number of players with equally strong
// computers (Medium), a random starter and the default houses, for "one"
// and for "all" with 3 tokens: every place must win within 5 percentage
// points of its fair share (50 / 33.3 / 25 %). Game length of "all" with 3
// tokens: on average at most 90 turns with 2 players and 185 with 4.
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
        const victim = C.ownerAt(s, m.to);
        if (victim && victim.player !== s.turn && C.isSafe(m.to)) { fails.push(n + "p #" + g + ": hits a token in the safe half"); ok = false; }
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
// Game end "all".
const allStats = {};
let allGames = 0;
for (const n of [2, 3, 4]) {
  let turns = 0, maxTurns = 0, loserArrived = 0, losers = 0;
  for (let g = 1; g <= 500; g++) {
    const r = rng(g * 5003 + n * 17);
    const levels = Array.from({ length: n }, (_, p) => 1 + ((g + p) % 3));
    const count = g % 2 ? 3 : 5;
    let s = C.createInitialState(n, { houses: C.assignHouses(n, [g % 6]), first: g % n, finish: "all", tokens: count });
    if (s.tokens.some((t) => t.length !== count)) fails.push("all " + n + "p #" + g + ": not " + count + " tokens");
    const tag = "all " + n + "p #" + g;
    let ok = true;
    for (let t = 0; t < 50000 && !s.gameOver; t++) {
      s = C.setRoll(s, C.rollDie(r));
      const moves = C.legalMoves(s);
      for (const m of moves) {
        const stones = new Set(s.stones);
        if (m.path.length !== s.roll || m.path.slice(0, -1).some((f) => stones.has(f))) { fails.push(tag + ": bad move"); ok = false; break; }
        const victim = C.ownerAt(s, m.to);
        if (victim && victim.player !== s.turn && C.isSafe(m.to)) { fails.push(tag + ": hits a token in the safe half"); ok = false; break; }
      }
      if (!ok) break;
      const m = A.chooseMove(s, levels[s.turn], r);
      if (!m) { s = C.pass(s); continue; }
      const p = s.turn, before = C.arrivedCount(s, p);
      const res = C.applyMove(s, m);
      s = res.state;
      if (m.to === C.goal) {
        if (!res.arrived || C.arrivedCount(s, p) !== before + 1) { fails.push(tag + ": arrival not counted"); ok = false; break; }
        if (s.gameOver !== (before + 1 === count)) { fails.push(tag + ": game end wrong at " + (before + 1) + " in the goal"); ok = false; break; }
      }
      if (res.stone) s = C.placeStone(s, A.chooseStone(s, levels[s.turn], r));
      for (let q = 0; q < n; q++) {
        const onBoard = s.tokens[q].filter((x) => x >= 0).length, home = s.tokens[q].filter((x) => x === -1).length, inGoal = C.arrivedCount(s, q);
        if (s.tokens[q].length !== count || onBoard + home + inGoal !== count) { fails.push(tag + ": token count"); ok = false; }
        if (s.tokens[q].indexOf(C.goal) !== -1) { fails.push(tag + ": a token stays on the goal"); ok = false; }
      }
      if (s.stones.some((f) => C.distToGoal[f] <= C.NEAR_GOAL)) { fails.push(tag + ": a stone near the goal"); ok = false; }
      if (!ok) break;
    }
    if (!ok) continue;
    if (!s.gameOver) { fails.push(tag + ": no end"); continue; }
    if (C.arrivedCount(s, s.winner) !== count) { fails.push(tag + ": winner without all tokens"); continue; }
    for (let q = 0; q < n; q++) if (q !== s.winner && C.arrivedCount(s, q) === count) fails.push(tag + ": two players with all tokens");
    const rank = C.ranking(s);
    if (rank[0] !== s.winner || rank.length !== n) fails.push(tag + ": ranking " + rank);
    for (let i = 2; i < rank.length; i++) if (C.arrivedCount(s, rank[i - 1]) < C.arrivedCount(s, rank[i])) fails.push(tag + ": ranking order " + rank);
    for (let q = 0; q < n; q++) if (q !== s.winner) { loserArrived += C.arrivedCount(s, q); losers++; }
    turns += s.turns; maxTurns = Math.max(maxTurns, s.turns);
    allGames++;
  }
  allStats[n] = { avgTurns: (turns / 500).toFixed(1), maxTurns, losersInGoalAvg: (loserArrived / losers).toFixed(2) };
}
console.log("game end all: " + JSON.stringify(allStats));

// Fairness and game length.
const fairness = [];
const lengths = {};
for (const variant of [{ finish: "one" }, { finish: "all", tokens: 3 }]) {
  for (const n of [2, 3, 4]) {
    const G = 2000, wins = new Array(n).fill(0);
    let turns = 0;
    for (let g = 0; g < G; g++) {
      const r = rng(g * 104729 + n * 31 + (variant.finish === "all" ? 7 : 0));
      let s = C.createInitialState(n, Object.assign({ houses: C.assignHouses(n, []), first: Math.floor(r() * n) }, variant));
      for (let t = 0; t < 100000 && !s.gameOver; t++) {
        s = C.setRoll(s, C.rollDie(r));
        const m = A.chooseMove(s, 2, r);
        if (!m) { s = C.pass(s); continue; }
        const res = C.applyMove(s, m);
        s = res.state;
        if (res.stone) s = C.placeStone(s, A.chooseStone(s, 2, r));
      }
      if (!s.gameOver) { fails.push("fairness game did not end"); break; }
      wins[s.winner]++;
      turns += s.turns;
    }
    const pct = wins.map((w) => 100 * w / G);
    const name = variant.finish + (variant.tokens ? " " + variant.tokens + " tokens" : "") + " " + n + "p";
    fairness.push(name + ": " + pct.map((x) => x.toFixed(1)).join(" / "));
    pct.forEach((x, p) => { if (Math.abs(x - 100 / n) > 5) fails.push("unfair: " + name + " place " + (p + 1) + " wins " + x.toFixed(1) + "%"); });
    lengths[name] = (turns / G).toFixed(1);
  }
}
console.log("fairness (wins per place, %): " + fairness.join("; "));
console.log("average game length (turns): " + JSON.stringify(lengths));
if (+lengths["all 3 tokens 2p"] > 90) fails.push("all, 3 tokens, 2 players too long: " + lengths["all 3 tokens 2p"]);
if (+lengths["all 3 tokens 4p"] > 185) fails.push("all, 3 tokens, 4 players too long: " + lengths["all 3 tokens 4p"]);

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
  if (s.tokens[s.winner].indexOf(C.goal) === -1) fails.push("old state: not the game end \"one\"");
}

fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log(JSON.stringify(stats));
console.log("\n=== BLOCKED PATH CORE: 1500 games, " + allGames + " games with game end all (500 per number of players, 3 and 5 tokens), 12000 fairness games (2000 per variant and number of players), " + houseTotal + " games with chosen house, token and starter (500 per house and number of players), " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
