// tests/hex-core.js
// Hex swap rule (task 115). Fixed checks: right after Red's first stone,
// Blue may swap once; the swap leaves the board and the player to move
// (Blue) as they are, so the stone stays red and Red still connects top
// and bottom - only the players change colours; no swap without the rule,
// later in the game or in an old save (no swapRule field). The computer's
// fixed rule swaps when the first stone lies in the middle half (rows and
// columns 2 to 6). Then computer against computer (levels 1 and 2 mixed),
// 100 games without and 100 with the swap rule: every game ends with
// exactly one winner whose chain connects its edges; the share of games
// won by the player who moved first is printed for both.
//
// Run: node tests/hex-core.js

global.HexCore = require("../hex-core.js");
const C = global.HexCore;
const AI = require("../hex-ai.js");

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

{
  let s = C.createInitialState({ swapRule: true });
  check("no swap before the first stone", !C.canSwap(s));
  s = C.applyMove(s, "r", [4, 4]);
  check("Blue may swap after the first stone", C.canSwap(s));
  const t = C.applySwap(s);
  check("swap gives a state", !!t);
  check("swap keeps the stone red", t && t.board[4][4] === "r" && C.stoneCount(t) === 1);
  check("after the swap Blue is to move", t && t.currentPlayer === "b");
  check("only one swap", t && !C.canSwap(t) && C.applySwap(t) === null);
  const u = C.applyMove(t, "b", [0, 0]);
  check("swapped flag kept", u.swapped === true && u.swapRule === true);
  check("no swap after the second stone", !C.canSwap(C.applyMove(s, "b", [0, 0])));
  check("no swap without the rule", !C.canSwap(C.applyMove(C.createInitialState(), "r", [4, 4])));
  const old = C.applyMove(C.createInitialState({ swapRule: true }), "r", [4, 4]);
  delete old.swapRule; delete old.swapped;
  check("old save: no swap", !C.canSwap(old));
  // Red's chain down column 4 still wins for Red after the swap.
  let w = t;
  for (let r = 0; r < C.SIZE; r++) if (r !== 4) w = C.applyMove(C.applyMove(w, "b", [r, 0]), "r", [r, 4]);
  check("after the swap Red still connects top and bottom", w.gameOver && w.winner === "r");
  const at = (r, c) => { const x = C.createInitialState({ swapRule: true }); return C.applyMove(x, "r", [r, c]); };
  check("centre is central", C.firstStoneCentral(at(4, 4)));
  check("2,6 is central", C.firstStoneCentral(at(2, 6)));
  check("1,4 is not central", !C.firstStoneCentral(at(1, 4)));
  check("0,0 is not central", !C.firstStoneCentral(at(0, 0)));
  check("8,7 is not central", !C.firstStoneCentral(at(8, 7)));
}

// One computer game; returns whether the first mover won, or a failure.
function play(swapRule, levels) {
  let s = C.createInitialState({ swapRule });
  // seat 0 moved first and plays Red until a swap
  const colour = ["r", "b"];
  let swapped = false;
  for (let step = 0; step < 200; step++) {
    if (s.gameOver) break;
    const side = s.currentPlayer;
    const seat = colour.indexOf(side);
    if (C.canSwap(s) && C.firstStoneCentral(s)) {
      s = C.applySwap(s);
      colour.reverse();
      swapped = true;
      continue;
    }
    const m = AI.chooseMove(s, side, levels[seat]);
    if (!m || s.board[m[0]][m[1]]) return { fail: "illegal or no move" };
    s = C.applyMove(s, side, m);
  }
  if (!s.gameOver) return { fail: "does not end" };
  if (!C.checkWin(s.board, s.winner) || C.checkWin(s.board, C.otherPlayer(s.winner))) return { fail: "wrong winner" };
  return { firstWon: colour.indexOf(s.winner) === 0, swapped };
}

const GAMES = 100;
const result = {};
for (const swapRule of [false, true]) {
  let firstWins = 0, swaps = 0;
  for (let g = 0; g < GAMES; g++) {
    const levels = [1 + (g % 2), 1 + (Math.floor(g / 2) % 2)];
    const r = play(swapRule, levels);
    if (r.fail) { fails.push((swapRule ? "swap" : "no swap") + " game " + g + ": " + r.fail); continue; }
    if (r.firstWon) firstWins++;
    if (r.swapped) swaps++;
  }
  result[swapRule] = { firstWins, swaps };
  console.log((swapRule ? "with" : "without") + " swap rule: " + GAMES + " games, first mover won " + firstWins + " (" + Math.round(firstWins * 100 / GAMES) + " %), swapped " + swaps);
}

fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== HEX CORE: swap rule, " + (GAMES * 2) + " computer games (100 without, 100 with the swap rule), " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
