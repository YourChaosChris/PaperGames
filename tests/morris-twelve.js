#!/usr/bin/env node
// Task 213: Twelve Men's Morris, engine only. Board with the four corner
// diagonals, 12 pieces each, mills along a diagonal, full board = draw;
// Nine Men's Morris (no `variant`, old saves) unchanged; computer games at
// every level only play legal moves.
// Run: node tests/morris-twelve.js
global.MorrisCore = require("../morris-core.js");
const C = global.MorrisCore;
const AI = require("../morris-ai.js");

const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
const i = C.idx;

const nine = C.createInitialState();
const twelve = C.createInitialState("twelve");
check("nine: 9 pieces, no variant field", nine.toPlace.b === 9 && nine.variant === undefined && !C.isTwelve(nine));
check("twelve: 12 pieces each", twelve.toPlace.b === 12 && twelve.toPlace.w === 12 && C.isTwelve(twelve));
check("cloneState keeps the variant", C.isTwelve(C.cloneState(twelve)) && !C.isTwelve(C.cloneState(nine)));

// Corners: no diagonal in Nine Men's Morris, a diagonal in Twelve.
const corner = i(1, 0);
check("nine: a middle corner has 2 neighbours", C.adjacencyOf(nine)[corner].length === 2);
check("twelve: a middle corner has 4 neighbours (diagonal)", C.adjacencyOf(twelve)[corner].length === 4 &&
  C.adjacencyOf(twelve)[corner].indexOf(i(0, 0)) !== -1 && C.adjacencyOf(twelve)[corner].indexOf(i(2, 0)) !== -1);
check("nine: 16 mills, twelve: 20 mills", C.millsOf(nine).length === 16 && C.millsOf(twelve).length === 20);

// A mill along a diagonal lets the player remove a piece.
let s = C.createInitialState("twelve");
s.board[i(0, 2)] = "b"; s.board[i(1, 2)] = "b";
s.board[i(2, 7)] = "w";
let mv = C.getLegalMoves(s, "b").filter((m) => m.type === "place" && m.to === i(2, 2));
check("twelve: placing the third piece on a diagonal is a mill", mv.length === 1 && mv[0].remove === i(2, 7));
const n9 = C.createInitialState();
n9.board[i(0, 2)] = "b"; n9.board[i(1, 2)] = "b"; n9.board[i(2, 7)] = "w";
mv = C.getLegalMoves(n9, "b").filter((m) => m.type === "place" && m.to === i(2, 2));
check("nine: the same three pieces are no mill", mv.length === 1 && mv[0].remove === null);

// Sliding along a diagonal once all pieces are placed.
s = { board: new Array(24).fill(null), toPlace: { b: 0, w: 0 }, variant: "twelve" };
s.board[i(0, 0)] = "b"; s.board[i(0, 4)] = "b"; s.board[i(0, 6)] = "b"; s.board[i(0, 3)] = "b";
s.board[i(2, 3)] = "w"; s.board[i(2, 5)] = "w"; s.board[i(2, 7)] = "w"; s.board[i(2, 1)] = "w";
check("twelve: a corner piece slides along the diagonal", C.getLegalMoves(s, "b").some((m) => m.from === i(0, 0) && m.to === i(1, 0)));
const s9 = { board: s.board.slice(), toPlace: { b: 0, w: 0 } };
check("nine: no diagonal slide", !C.getLegalMoves(s9, "b").some((m) => m.from === i(0, 0) && m.to === i(1, 0)));

// Full board after placing: a draw.
s = { board: new Array(24).fill(null).map((_, k) => (k % 2 ? "b" : "w")), toPlace: { b: 0, w: 0 }, variant: "twelve" };
check("twelve: full board is a draw", C.detectGameEnd(s, "b").status === "full" && C.detectGameEnd(s, "b").winner === null);

// Computer games: legal moves only, piece counts never go up, games end or reach the ply cap.
let games = 0, bad = 0, ended = 0, full = 0;
for (const [lb, lw] of [[1, 1], [2, 1], [3, 1], [1, 3], [2, 2]]) {
  for (let g = 0; g < 6; g++) {
    let st = C.createInitialState("twelve");
    let turn = "b";
    let plies = 0;
    while (plies < 300) {
      const end = C.detectGameEnd(st, turn);
      if (end.status !== "normal") { ended++; if (end.status === "full") full++; break; }
      const legal = C.getLegalMoves(st, turn);
      const m = AI.chooseMove(st, turn, turn === "b" ? lb : lw);
      const key = (x) => x && [x.type, x.from, x.to, x.remove].join(",");
      if (!m || !legal.some((x) => key(x) === key(m))) { bad++; break; }
      st = C.applyMove(st, turn, m);
      const onBoard = st.board.filter(Boolean).length;
      if (onBoard + st.toPlace.b + st.toPlace.w > 24 || !C.isTwelve(st)) { bad++; break; }
      turn = C.otherColor(turn);
      plies++;
    }
    games++;
  }
}
console.log("Twelve Men's Morris: " + games + " computer games, " + ended + " ended (" + full + " full board), " + bad + " problem(s)");
check("computer games: legal moves only (" + bad + " problems)", bad === 0);

if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("=== MORRIS TWELVE: board, diagonal mills, full board, " + games + " computer games, 0 failure(s) ===");
