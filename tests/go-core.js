// tests/go-core.js
// GoCore and GoAi (task 160): the three board sizes, Black first, komi,
// captures, ko and suicide, and the computer playing either colour on
// every size (legal moves only, a game ends by two passes).
// No server or browser needed.

const path = require("path");
const GoCore = require(path.join(__dirname, "..", "go-core.js"));
global.GoCore = GoCore;
const GoAi = require(path.join(__dirname, "..", "go-ai.js"));

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// --- sizes, star points, komi --------------------------------------------------
[9, 13, 19].forEach((n) => {
  check(GoCore.SIZES.indexOf(n) !== -1, n + " x " + n + " is offered");
  const b = GoCore.createEmptyBoard(n);
  check(b.length === n && b.every((row) => row.length === n && row.every((x) => x === null)), n + ": empty board");
  check(GoCore.hoshiPoints(n).length > 0, n + ": star points");
  const s = GoCore.scoreArea(b, n);
  check(s.winner === "w" && s.whiteScore === 7.5 && s.blackScore === 0, n + ": on an empty board White wins by the komi of 7.5");
});
check(GoCore.DEFAULT_KOMI === 7.5, "komi 7.5");

// --- capture, suicide, ko ---------------------------------------------------------
(function rules() {
  const n = 9;
  let b = GoCore.createEmptyBoard(n);
  b[0][1] = "b"; b[1][0] = "b"; b[0][0] = "w";
  let r = GoCore.tryMove(b, n, 0, 2, "w", null, null);
  check(r.legal, "a normal move is legal");
  b = GoCore.createEmptyBoard(n);
  b[0][1] = "b"; b[1][1] = "b"; b[0][0] = "w";
  r = GoCore.tryMove(b, n, 1, 0, "b", null, null);
  check(r.legal && r.captured.length === 1 && r.board[0][0] === null, "a stone without liberties is captured");
  b = GoCore.createEmptyBoard(n);
  b[0][1] = "b"; b[1][0] = "b";
  r = GoCore.tryMove(b, n, 0, 0, "w", null, null);
  check(!r.legal && r.reason === "suicide", "suicide is not allowed");
  r = GoCore.tryMove(b, n, 0, 1, "w", null, null);
  check(!r.legal && r.reason === "occupied", "an occupied point is not allowed");
  // Ko: Black takes one stone, White may not take back at once.
  b = GoCore.createEmptyBoard(n);
  b[0][1] = "b"; b[1][0] = "b"; b[2][1] = "b";
  b[0][2] = "w"; b[1][3] = "w"; b[2][2] = "w"; b[1][1] = "w";
  r = GoCore.tryMove(b, n, 1, 2, "b", null, null);
  check(r.legal && r.captured.length === 1 && r.koPoint, "Black takes the ko stone");
  const back = GoCore.tryMove(r.board, n, 1, 1, "w", r.koPoint, null);
  check(!back.legal && back.reason === "ko", "White may not take back the ko at once");
})();

// --- the computer plays either colour on every size ---------------------------------
function playGame(n, level, humanColor, maxPlies) {
  let board = GoCore.createEmptyBoard(n);
  let turn = "b", ko = null, passes = 0, plies = 0;
  const hist = new Set([GoCore.boardKey(board)]);
  const ai = humanColor === "b" ? "w" : "b";
  const firstMover = turn;
  while (passes < 2 && plies < maxPlies) {
    // Both sides are the computer here; `ai` only names the computer's side.
    const m = GoAi.chooseMove(board, n, turn, turn === ai ? level : 1, ko, hist);
    if (!m) { passes++; turn = turn === "b" ? "w" : "b"; plies++; continue; }
    const r = GoCore.tryMove(board, n, m.r, m.c, turn, ko, hist);
    if (!r.legal) return { broken: n + " level " + level + ": illegal computer move " + JSON.stringify([m.r, m.c]) + " (" + r.reason + ")" };
    board = r.board; ko = r.koPoint; hist.add(GoCore.boardKey(board));
    passes = 0; turn = turn === "b" ? "w" : "b"; plies++;
  }
  return { plies, firstMover, ended: passes >= 2 };
}
const t0 = Date.now();
[9, 13, 19].forEach((n) => {
  ["b", "w"].forEach((human) => {
    const level = n === 9 ? 2 : 1;
    const g = playGame(n, level, human, n === 9 ? 400 : 60);
    if (g.broken) { fails.push(g.broken); return; }
    check(g.firstMover === "b", "Black moves first");
    if (n === 9) check(g.ended, "a 9 x 9 game against the computer (human " + human + ") ends by two passes");
    console.log(n + " x " + n + ", human " + (human === "b" ? "Black" : "White") + ", computer level " + level + ": " + g.plies + " plies" + (g.ended ? ", ended by two passes" : " (stopped early)"));
  });
});
// Hard on 9 x 9, a few moves as White and as Black.
["b", "w"].forEach((color) => {
  const m = GoAi.chooseMove(GoCore.createEmptyBoard(9), 9, color, 3, null, new Set());
  check(m && GoCore.tryMove(GoCore.createEmptyBoard(9), 9, m.r, m.c, color, null, null).legal, "Hard finds a legal first move as " + color);
});
console.log("(" + Math.round((Date.now() - t0) / 1000) + " s)");

if (fails.length) {
  fails.forEach((f) => console.log("FAIL: " + f));
  console.log("=== GO CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== GO CORE: 0 failures ===");
