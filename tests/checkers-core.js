// tests/checkers-core.js
// Checkers, both rule sets (task 179).
//   - English rules unchanged: 7 opening moves, a king steps one square,
//     men never capture backward, promotion ends a chain.
//   - German rules: a king flies (moves any distance, captures from afar
//     and may land on any free square behind the piece), a king must land
//     where the chain can go on, men capture backward, captures are
//     mandatory, chains go on as long as they can, free choice between a
//     long and a short capture (no majority rule), a man passing the back
//     row mid-chain captures on as a man and is crowned only at the end,
//     a taken piece blocks the line and is never jumped twice.
//   - Random games computer against computer, both rule sets, all three
//     levels: every move is one of getLegalMoves, every taken square held
//     an enemy piece, every game ends (no pieces, no moves, or the
//     40-move draw rule), no move takes too long.
//   - A missing rules value (old save) counts as English.
//
// Run: node tests/checkers-core.js

const C = require("../checkers-core.js");
global.CheckersCore = C;
const AI = require("../checkers-ai.js");

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

function empty() {
  const b = [];
  for (let r = 0; r < 8; r++) b.push(new Array(8).fill(null));
  return b;
}
function put(b, list) {
  list.forEach(([r, c, p]) => { b[r][c] = p; });
  return b;
}
const sq = (p) => p[0] + "," + p[1];
const capKey = (m) => m.captured.map(sq).sort().join(";");
const moveKey = (m) => sq(m.from) + ">" + sq(m.to) + ":" + capKey(m);

// ---- English rules stay as they were ----
check("en: 7 opening moves", C.getLegalMoves(C.createInitialBoard(), "b", "en").length === 7);
check("en: rules left out = en", C.getLegalMoves(C.createInitialBoard(), "b").length === 7);
check("normalizeRules: missing/unknown = en", C.normalizeRules(undefined) === "en" && C.normalizeRules("xx") === "en" && C.normalizeRules("de") === "de");
{
  const b = put(empty(), [[3, 2, "B"]]);
  check("en: king steps one square (4 moves)", C.getLegalMoves(b, "b", "en").length === 4);
}
{
  const b = put(empty(), [[4, 3, "b"], [3, 2, "w"], [7, 0, "w"]]);
  const m = C.getLegalMoves(b, "b", "en");
  check("en: man does not capture backward", m.every((x) => x.captured.length === 0));
}
{
  // Man jumps onto the back row and could jump on backward: en stops and crowns.
  const b = put(empty(), [[5, 2, "b"], [6, 3, "w"], [6, 5, "w"]]);
  const m = C.getLegalMoves(b, "b", "en");
  check("en: promotion ends the chain", m.length === 1 && sq(m[0].to) === "7,4" && m[0].promoted && m[0].captured.length === 1);
}

// ---- German rules ----
{
  const b = put(empty(), [[3, 2, "B"]]);
  // Diagonals from (3,2): 3+2 down-left/up-left ... count free squares.
  let n = 0;
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
    for (let r = 3 + dr, c = 2 + dc; r >= 0 && r < 8 && c >= 0 && c < 8; r += dr, c += dc) n++;
  });
  const m = C.getLegalMoves(b, "b", "de");
  check("de: flying king reaches every free diagonal square (" + m.length + "/" + n + ")", m.length === n && n === 11);
}
{
  const b = put(empty(), [[3, 2, "b"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: man still steps one square forward", m.length === 2 && m.every((x) => x.to[0] === 4));
}
{
  // King at (0,1), single white man far away at (3,4), three free squares behind.
  const b = put(empty(), [[0, 1, "B"], [3, 4, "w"], [7, 0, "b"]]);
  const m = C.getLegalMoves(b, "b", "de");
  const lands = m.map((x) => sq(x.to)).sort().join(" ");
  check("de: king captures from afar, lands on any free square behind (" + lands + ")",
    lands === "4,5 5,6 6,7" && m.every((x) => x.captured.length === 1 && sq(x.captured[0]) === "3,4"));
  check("de: capture is mandatory (no quiet move of the man at 7,0)", m.every((x) => sq(x.from) === "0,1"));
}
{
  // Same, plus a white man at (6,5): only landing on (5,6) lets the chain go on.
  const b = put(empty(), [[0, 1, "B"], [3, 4, "w"], [6, 5, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: king must land where the chain goes on",
    m.length === 1 && sq(m[0].to) === "7,4" && capKey(m[0]) === "3,4;6,5");
}
{
  const b = put(empty(), [[4, 3, "b"], [3, 2, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: man captures backward", m.length === 1 && sq(m[0].to) === "2,1" && capKey(m[0]) === "3,2");
}
{
  // Chain forward then backward with a man.
  const b = put(empty(), [[2, 1, "b"], [3, 2, "w"], [3, 4, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: man chain goes on backward", m.length === 1 && sq(m[0].to) === "2,5" && m[0].captured.length === 2);
}
{
  // Man reaches the back row mid-chain and can capture on backward.
  const b = put(empty(), [[5, 2, "b"], [6, 3, "w"], [6, 5, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: man passing the back row captures on as a man, not crowned",
    m.length === 1 && sq(m[0].to) === "5,6" && m[0].captured.length === 2 && !m[0].promoted);
  const after = C.applyMove(b, m[0]);
  check("de: still a man after that chain", after[5][6] === "b" && after[6][3] === null && after[6][5] === null);
}
{
  const b = put(empty(), [[5, 2, "b"], [6, 3, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: man crowned when the chain ends on the back row", m.length === 1 && m[0].promoted && C.applyMove(b, m[0])[7][4] === "B");
}
{
  // Free choice: a two-piece chain and a one-piece capture are both legal.
  const b = put(empty(), [[2, 1, "b"], [3, 2, "w"], [5, 4, "w"], [2, 5, "b"], [3, 6, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  const sizes = m.map((x) => x.captured.length).sort().join(",");
  check("de: no majority rule, short and long capture both legal (" + sizes + ")", sizes === "1,2");
}
{
  // King on a line with two enemy pieces one behind the other: blocked.
  const b = put(empty(), [[0, 1, "B"], [2, 3, "w"], [3, 4, "w"], [7, 6, "b"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: two pieces in a row can't be jumped", m.every((x) => !x.captured.some((p) => sq(p) === "2,3" || sq(p) === "3,4")));
}
{
  // A taken piece stays until the move ends: it blocks and is never jumped twice.
  const b = put(empty(), [[5, 0, "B"], [4, 1, "w"], [3, 4, "w"], [2, 5, "w"], [1, 6, "w"], [5, 4, "w"]]);
  const m = C.getLegalMoves(b, "b", "de");
  check("de: no piece taken twice", m.every((x) => new Set(x.captured.map(sq)).size === x.captured.length));
  check("de: every taken square holds an enemy", m.every((x) => x.captured.every(([r, c]) => b[r][c] && C.colorOf(b[r][c]) === "w")));
  const toSix3 = m.filter((x) => sq(x.to) === "6,3");
  check("de: several paths to the same square with different pieces (" + toSix3.length + ")",
    toSix3.length >= 2 && new Set(toSix3.map(capKey)).size === toSix3.length);
  check("de: no duplicate moves", new Set(m.map(moveKey)).size === m.length);
}
{
  const b = put(empty(), [[7, 0, "w"], [6, 1, "b"], [5, 2, "b"]]);
  check("de: game end when no moves (white man boxed in)", C.detectGameEnd(b, "w", "de").status === "no-moves");
}

// ---- Random games, both rule sets, all levels ----
function playGame(rules, levels, maxPlies) {
  let board = C.createInitialBoard();
  let turn = "b";
  let quiet = 0;
  for (let ply = 0; ply < maxPlies; ply++) {
    const end = C.detectGameEnd(board, turn, rules);
    if (end.status !== "normal") return { ended: true, ply, maxMs: playGame.maxMs };
    const legal = C.getLegalMoves(board, turn, rules);
    const t0 = Date.now();
    const mv = AI.chooseMove(board, turn, levels[turn], rules);
    const ms = Date.now() - t0;
    if (ms > playGame.maxMs) playGame.maxMs = ms;
    if (!mv || !legal.some((x) => moveKey(x) === moveKey(mv))) return { bad: rules + " L" + levels[turn] + " ply " + ply + ": illegal move " + JSON.stringify(mv) };
    if (!mv.captured.every(([r, c]) => board[r][c] && C.colorOf(board[r][c]) !== turn)) return { bad: rules + " ply " + ply + ": captured own/empty square" };
    const before = C.countPieces(board, C.otherColor(turn));
    board = C.applyMove(board, mv);
    if (C.countPieces(board, C.otherColor(turn)) !== before - mv.captured.length) return { bad: rules + " ply " + ply + ": piece count wrong" };
    quiet = mv.captured.length ? 0 : quiet + 1;
    if (quiet >= 80) return { ended: true, ply, draw: true };
    turn = C.otherColor(turn);
  }
  return { bad: rules + ": game did not end in " + maxPlies + " plies" };
}
playGame.maxMs = 0;

const results = { en: 0, de: 0 };
const plan = [];
for (const rules of ["en", "de"]) {
  for (let i = 0; i < 60; i++) plan.push({ rules, levels: { b: 1 + (i % 2), w: 1 + ((i >> 1) % 2) } });
  // "Hard" searches up to its node budget on every move (seconds each), so
  // one game per rule set against "easy" (which ends it quickly) is enough.
  plan.push({ rules, levels: { b: 3, w: 1 } });
}
for (const g of plan) {
  const res = playGame(g.rules, g.levels, 400);
  if (res.bad) { fails.push(res.bad); break; }
  results[g.rules]++;
}
// Only a guard against a hang: the node budget bounds every search, but the
// test series runs six parts at once, so the time itself varies a lot.
check("slowest computer move under 60 s (" + playGame.maxMs + " ms)", playGame.maxMs < 60000);

if (fails.length) {
  console.log("FAIL checkers-core: " + fails.length + " problem(s)");
  fails.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
console.log("OK checkers-core: both rule sets, " + results.en + " English and " + results.de + " German computer games, slowest move " + playGame.maxMs + " ms");
