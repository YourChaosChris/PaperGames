#!/usr/bin/env node
// Three Grids (dreitafeln-core.js / dreitafeln-ai.js): the stack of 27 cards,
// every open card always fits somewhere, a line wins a grid for good (the
// grid stays open, later lines there count no more), two grids win the
// game, after all 27 cards more grids win or it is a draw, illegal moves.
// Then the computer: every level always answers with a legal move, and
// 100 games per pairing with sides swapped: Hard against Easy, Hard against
// Medium, Medium against Easy, and Medium against Medium for the share of
// the side that starts. No server or browser needed.
const path = require("path");
const Core = require(path.join(__dirname, "..", "dreitafeln-core.js"));
global.DreitafelnCore = Core;
const Ai = require(path.join(__dirname, "..", "dreitafeln-ai.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }

let seed = 4242;
const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

// Start: 27 cards, 1-9 three times each, three of them open, X to move.
{
  const s = Core.createInitialState(rng);
  const all = s.open.concat(s.deck).sort((a, b) => a - b);
  const want = [];
  for (let n = 1; n <= 9; n++) want.push(n, n, n);
  check(all.join() === want.join(), "27 cards, 1-9 three times each");
  check(s.open.length === 3 && s.deck.length === 24, "three open cards, 24 in the stack");
  check(s.turn === "x" && !s.result && s.boards.every((b) => b.every((v) => v === null)), "X starts on three empty grids");
  check(Core.getLegalMoves(s).length >= 3, "every open card fits on three empty grids");
}

// Random games: every open card always fits on at least one grid, every
// move marks exactly one field, the game always ends.
{
  let ok = true; let ended = 0;
  for (let g = 0; g < 100; g++) {
    let s = Core.createInitialState(rng);
    while (!s.result) {
      for (const c of s.open) {
        if (c !== null && !s.boards.some((b) => b[c - 1] === null)) ok = false;
      }
      const legal = Core.getLegalMoves(s);
      if (!legal.length) { ok = false; break; }
      const m = legal[Math.floor(rng() * legal.length)];
      const before = s.boards.flat().filter((v) => v).length;
      s = Core.applyMove(s, m);
      if (s.boards.flat().filter((v) => v).length !== before + 1) ok = false;
    }
    if (s.result) ended++;
  }
  check(ok, "every open card always fits somewhere, one mark per move");
  check(ended === 100, "every random game ends");
}

// A fixed position helper.
function position(boards, open, deck, turn) {
  const s = Core.createInitialState(rng);
  s.boards = boards.map((b) => b.split("").map((c) => (c === "." ? null : c)));
  s.won = [null, null, null];
  s.lines = [null, null, null];
  s.boards.forEach((b, i) => { ["x", "o"].forEach((side) => { const l = Core.lineOf(b, side); if (l && !s.won[i]) { s.won[i] = side; s.lines[i] = l; } }); });
  s.open = open;
  s.deck = deck;
  s.turn = turn;
  return s;
}

// A line wins the grid for good; the grid stays open.
{
  const s = position(["xx.......", ".........", "........."], [3, 5, 9], [1, 2, 4], "x");
  const a = Core.applyMove(s, { slot: 0, board: 0 });
  check(a.won[0] === "x" && a.lines[0].join() === "0,1,2", "X wins grid 1 with 1-2-3");
  check(!a.result && a.turn === "o", "one grid is not the game, O is next");
  check(a.open[0] === 1 && a.deck.join() === "2,4", "the next card of the stack takes the open place");
  check(a.last.side === "x" && a.last.card === 3 && a.last.board === 0 && a.last.cell === 2, "last move remembered");
  // O may still play on the won grid, and a later O line there does not count.
  const b = position(["xxxoo....", ".........", "........."], [6, 5, 9], [1], "o");
  b.won[0] = "x"; b.lines[0] = [0, 1, 2];
  check(Core.isLegalMove(b, { slot: 0, board: 0 }), "a move on a won grid is allowed");
  const c = Core.applyMove(b, { slot: 0, board: 0 });
  check(c.won[0] === "x" && c.lines[0].join() === "0,1,2", "a later line on a won grid does not change the owner");
}

// Two grids win the game at once.
{
  const s = position(["xxx......", "x.x......", "........."], [2, 5, 9], [1, 2, 3, 4], "x");
  const a = Core.applyMove(s, { slot: 0, board: 1 });
  check(a.result && a.result.winner === "x" && Core.count(a, "x") === 2, "the second grid wins the game");
  check(Core.getLegalMoves(a).length === 0, "no moves after the end");
}

// After the last card: more grids win, the same number is a draw.
{
  const s = position(["xxx......", "ooo......", "x........"], [5, null, null], [], "x");
  const a = Core.applyMove(s, { slot: 0, board: 2 });
  check(a.result && a.result.draw && a.open.every((c) => c === null), "1 to 1 after the last card is a draw");
  const t = position(["xxx......", "x.x......", "........."], [5, null, null], [], "o");
  const b = Core.applyMove(t, { slot: 0, board: 2 });
  check(b.result && b.result.winner === "x", "1 to 0 after the last card: X wins on grids");
  const u = position([".........", ".........", "........."], [5, null, null], [], "o");
  check(Core.applyMove(u, { slot: 0, board: 0 }).result.draw === true, "0 to 0 after the last card is a draw");
}

// Illegal moves.
{
  const s = position(["....x....", "....o....", "........."], [5, 5, null], [], "x");
  check(!Core.isLegalMove(s, { slot: 0, board: 0 }) && !Core.isLegalMove(s, { slot: 0, board: 1 }), "a taken field is refused");
  check(Core.isLegalMove(s, { slot: 0, board: 2 }), "the free field 5 on grid 3 is fine");
  check(!Core.isLegalMove(s, { slot: 2, board: 2 }), "an empty card place is refused");
  check(!Core.isLegalMove(s, { slot: 3, board: 0 }) && !Core.isLegalMove(s, { slot: 0, board: 3 }) && !Core.isLegalMove(s, null), "out of range is refused");
  check(Core.getLegalMoves(s).length === 1, "two cards with the same number give one move");
}

// The computer: every level answers with a legal move, also on the last card.
{
  let ok = true;
  [1, 2, 3].forEach((lv) => {
    for (let g = 0; g < 20; g++) {
      let s = Core.createInitialState(rng);
      while (!s.result) {
        const m = Ai.chooseMove(s, lv, rng);
        if (!Core.isLegalMove(s, m)) { ok = false; break; }
        s = Core.applyMove(s, m);
      }
    }
  });
  check(ok, "every level always plays a legal move");
  // Easy takes a grid it can win at once most of the time; Hard always does.
  const s = position(["xx.......", "o...o....", "........."], [3, 7, 8], [1, 2, 4, 5, 6], "x");
  let hard = 0;
  for (let i = 0; i < 20; i++) { const m = Ai.chooseMove(s, 3, rng); if (m.slot === 0 && m.board === 0) hard++; }
  check(hard === 20, "Hard completes the line 1-2-3 (" + hard + "/20)");
}

// Simulations: 100 games each, sides swapped every game.
function match(a, b, games) {
  let aWins = 0, bWins = 0, draws = 0;
  for (let g = 0; g < games; g++) {
    const aSide = g % 2 === 0 ? "x" : "o";
    let s = Core.createInitialState(rng);
    while (!s.result) s = Core.applyMove(s, Ai.chooseMove(s, s.turn === aSide ? a : b, rng));
    if (s.result.draw) draws++;
    else if (s.result.winner === aSide) aWins++;
    else bWins++;
  }
  return { aWins, bWins, draws, games };
}
const pct = (n, g) => Math.round(1000 * n / g) / 10;
const lines = [];
const GAMES = 100;
const t0 = Date.now();
const r31 = match(3, 1, GAMES);
const r32 = match(3, 2, GAMES);
const r21 = match(2, 1, GAMES);
lines.push(`Hard vs Easy:   ${r31.aWins}-${r31.bWins}-${r31.draws} (wins-losses-draws), Hard ${pct(r31.aWins, GAMES)} %, by decided games ${pct(r31.aWins, r31.aWins + r31.bWins)} %`);
lines.push(`Hard vs Medium: ${r32.aWins}-${r32.bWins}-${r32.draws}, Hard ${pct(r32.aWins, GAMES)} %, by decided games ${pct(r32.aWins, r32.aWins + r32.bWins)} %`);
lines.push(`Medium vs Easy: ${r21.aWins}-${r21.bWins}-${r21.draws}, Medium ${pct(r21.aWins, GAMES)} %, by decided games ${pct(r21.aWins, r21.aWins + r21.bWins)} %`);
// Who starts, same level: X always moves first.
let xw = 0, ow = 0, dr = 0;
for (let g = 0; g < GAMES; g++) {
  let s = Core.createInitialState(rng);
  while (!s.result) s = Core.applyMove(s, Ai.chooseMove(s, 2, rng));
  if (s.result.draw) dr++; else if (s.result.winner === "x") xw++; else ow++;
}
lines.push(`Medium vs Medium: X (starts) ${xw}, O ${ow}, draws ${dr}; starter ${pct(xw, GAMES)} %, by decided games ${pct(xw, xw + ow)} %`);
lines.forEach((l) => console.log(l));
console.log(`(simulations ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
check(r31.aWins / (r31.aWins + r31.bWins) > 0.75, "Hard beats Easy clearly (> 75 % of decided games)");
check(r21.aWins / (r21.aWins + r21.bWins) > 0.6, "Medium beats Easy (> 60 % of decided games)");
check(r32.aWins >= r32.bWins, "Hard is not weaker than Medium");

if (failures.length) {
  console.log(failures.slice(0, 20).join("\n"));
  console.log(`=== DREITAFELN CORE: ${failures.length} failure(s) of ${checks} checks ===`);
  process.exit(1);
}
console.log(`=== DREITAFELN CORE: stack, every card fits, grid won for good, two grids win, end after 27 cards, illegal moves, ${GAMES * 4} computer games, 0 failures of ${checks} checks ===`);
