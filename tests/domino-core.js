// tests/domino-core.js
// Domino, both variants, computer against computer.
//
// Classic and "triangle" (Dreiecke): 500 games per number of players
// (2, 3, 4) each, computer levels mixed. Every game ends; every move is
// one of DominoCore.legalMoves and the tile fits the end it goes on; the
// tiles in hands, stock and line always add up to the full set (28 / 56)
// with no tile twice; a player only draws or passes when nothing fits;
// the winner played the last tile, or has the lowest pip total when the
// line is blocked. Triangle only: every laid tile shares a side with an
// earlier one, every grid corner has one number for all tiles that meet
// there (so both numbers match on every shared side), and a player draws
// at most 3 tiles per turn. An old classic save (no variant field) plays
// on.
//
// Run: node tests/domino-core.js

const C = require("../domino-core.js");
const AI = require("../domino-ai.js");

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const fails = [];
const stats = {};
const GAMES = 500;
const key = (t) => t.slice().sort().join("-");

function checkTiles(s, total, tag) {
  const all = s.stock.concat(s.line).concat(...s.hands).map(key);
  if (all.length !== total) return tag + ": " + all.length + " tiles, expected " + total;
  if (new Set(all).size !== total) return tag + ": a tile appears twice";
  if (C.isTriangle(s)) {
    const seen = {};
    for (let i = 0; i < s.slots.length; i++) {
      const slot = s.slots[i], rc = C.parseSlot(slot);
      if (i > 0 && !C.triNeighbours(rc[0], rc[1]).some((nb) => seen[nb[0] + "," + nb[1]])) return tag + ": tile " + i + " touches no earlier tile";
      seen[slot] = true;
      const pts = C.triCorners(rc[0], rc[1]);
      for (let j = 0; j < 3; j++) if (s.corners[pts[j]] !== s.board[slot][j]) return tag + ": corner " + pts[j] + " has two numbers";
    }
    if ((s.drawn || 0) > C.TRI_DRAWS) return tag + ": drew more than " + C.TRI_DRAWS;
  }
  return null;
}

function play(variant, n, seed) {
  const random = rng(seed);
  let s = C.createInitialState(n, random, variant);
  const total = variant === "triangle" ? 56 : 28;
  const levels = [];
  for (let p = 0; p < n; p++) levels.push(1 + Math.floor(random() * 3));
  const tag = variant + " " + n + "p #" + seed;
  let steps = 0;
  // The opening tile is forced.
  const opener = s.turn;
  const oi = s.hands[opener].findIndex((t) => C.sameTile(t, s.openingTile));
  if (oi === -1) return tag + ": opener lacks the opening tile";
  s = C.applyMove(s, oi, variant === "triangle" ? "0,0" : "right").state;
  while (!s.gameOver) {
    if (++steps > 2000) return tag + ": does not end";
    const action = C.requiredAction(s);
    if (action === "draw") {
      if (C.canPlay(s, s.turn)) return tag + ": draws with a fitting tile";
      s = C.drawTile(s).state;
    } else if (action === "pass") {
      if (C.canPlay(s, s.turn) || (s.stock.length && !(C.isTriangle(s) && s.drawn >= C.TRI_DRAWS))) return tag + ": passes although it could play or draw";
      s = C.pass(s);
    } else {
      const move = AI.chooseMove(s, levels[s.turn], random);
      const legal = C.legalMoves(s, s.turn);
      if (!move || !legal.some((m) => m.index === move.index && m.side === move.side && m.slot === move.slot)) return tag + ": illegal move";
      const tile = s.hands[s.turn][move.index];
      const ends = C.openEnds(s);
      if (!C.isTriangle(s) && ends && !(tile[0] === ends[move.side] || tile[1] === ends[move.side])) return tag + ": tile does not fit its end";
      const before = s.turn;
      const r = C.applyMove(s, move.index, C.isTriangle(s) ? move.slot : move.side);
      if (!C.sameTile(r.tile, tile)) return tag + ": the placed tile changed";
      s = r.state;
      if (s.gameOver && !s.blocked && (s.winner !== before || s.hands[before].length)) return tag + ": wrong winner";
    }
    const bad = checkTiles(s, total, tag);
    if (bad) return bad;
  }
  if (s.blocked) {
    const totals = s.hands.map(C.pipTotal), low = Math.min.apply(null, totals);
    if (s.draw ? totals.filter((t) => t === low).length < 2 : totals[s.winner] !== low) return tag + ": wrong result of a blocked line";
  }
  const st = stats[variant + " " + n] || (stats[variant + " " + n] = { games: 0, blocked: 0, tiles: 0 });
  st.games++; if (s.blocked) st.blocked++; st.tiles += s.line.length;
  return null;
}

for (const variant of [null, "triangle"]) {
  for (const n of [2, 3, 4]) {
    for (let g = 1; g <= GAMES; g++) {
      const bad = play(variant, n, g * 31 + n * 7 + (variant ? 100000 : 0));
      if (bad) fails.push(bad);
    }
  }
}

// An old classic save (no variant field) plays on as classic.
{
  let s = C.createInitialState(2, rng(5));
  delete s.variant;
  const oi = s.hands[s.turn].findIndex((t) => C.sameTile(t, s.openingTile));
  s = C.applyMove(JSON.parse(JSON.stringify(s)), oi, "right").state;
  if (C.isTriangle(s) || typeof C.openEnds(s).left !== "number") fails.push("old save: not classic");
}

// Fixed triangle checks: the set has 56 tiles, 6 of them triples; next to
// the opening tile [1, 2, 3] at "0,0" (corners 1, 2, 3) the triangle "0,1"
// shares the side with the numbers 1 and 3, so [1, 3, 5] fits there with
// 5 on its free corner and [2, 4, 5] does not.
{
  const set = C.createTileSet("triangle");
  if (set.length !== 56 || set.filter(C.isDouble).length !== 6) fails.push("triangle set");
  let s = C.createInitialState(2, rng(1), "triangle");
  s.hands[0] = [[1, 2, 3], [1, 3, 5], [2, 4, 5]];
  s.turn = 0; s.openingTile = [1, 2, 3];
  s = C.applyMove(s, 0, "0,0").state;
  const p = C.placement(s, [1, 3, 5], "0,1");
  if (!p || p.indexOf(5) === -1) fails.push("[1,3,5] does not fit next to [1,2,3]");
  else {
    const pts = C.triCorners(0, 1);
    pts.forEach((pt, i) => { if (s.corners[pt] !== undefined && s.corners[pt] !== p[i]) fails.push("placement breaks corner " + pt); });
    if (p[pts.findIndex((pt) => s.corners[pt] === undefined)] !== 5) fails.push("5 is not on the free corner");
  }
  if (C.placement(s, [2, 4, 5], "0,1") !== null) fails.push("[2,4,5] fits next to [1,2,3] on 0,1");
}

Object.keys(stats).forEach((k) => {
  const st = stats[k];
  console.log(k + " players: " + st.games + " games, " + st.blocked + " blocked, " + (st.tiles / st.games).toFixed(1) + " tiles in the line on average");
});
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== DOMINO CORE: " + (GAMES * 6) + " games (500 per variant and number of players), " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
