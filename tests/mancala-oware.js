#!/usr/bin/env node
// Task 213: Mancala rule set Oware, engine only. Fixed positions for
// sowing, capturing 2 and 3 backwards, grand slam, the hunger rule and
// the end; then computer games at every level: seeds are never lost, the
// computer only plays legal moves, every game ends. The standard rules
// (no `rules` field, old saves) are unchanged.
// Run: node tests/mancala-oware.js
global.MancalaCore = require("../mancala-core.js");
const C = global.MancalaCore;
const AI = require("../mancala-ai.js");

const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
const st = (board, extra) => Object.assign({ board: board.slice(), gameOver: false, rules: "oware", quiet: 0 }, extra || {});
const total = (s) => s.board.reduce((a, b) => a + b, 0);

// Start
const s0 = C.createInitialState("oware");
check("start: 4 seeds in each of 12 pits, empty stores", total(s0) === 48 && s0.board[6] === 0 && s0.board[13] === 0 && C.isOware(s0));
check("start: six moves for player a", C.getLegalMoves(s0, "a").length === 6);
check("standard rules unchanged: no rules field", !C.isOware(C.createInitialState()) && C.createInitialState().rules === undefined);

// Sowing never puts a seed into a store and gives no extra turn.
let r = C.applyMove(s0, "a", 5);
check("sowing skips the stores", r.state.board[6] === 0 && r.state.board[7] === 5 && r.state.board[10] === 5 && !r.extraTurn);

// Capture: the last seed makes 2 or 3 in an opponent pit, and the pits before it too.
//            a0 a1 a2 a3 a4 a5 sA b7 b8 b9 b10 b11 b12 sB
let b = [0, 0, 0, 0, 0, 3, 0, 1, 2, 1, 4, 4, 4, 0];
r = C.applyMove(st(b), "a", 5); // sows into 7, 8, 9 -> 2, 3, 2
check("capture of 2, 3 and 2 backwards from the last pit (" + r.captured + ")", r.captured === 7 && r.state.board[6] === 7 && r.state.board[7] === 0 && r.state.board[8] === 0 && r.state.board[9] === 0);
// The chain stops at a pit with other numbers.
b = [0, 0, 0, 0, 0, 3, 0, 3, 0, 1, 4, 4, 4, 0];
r = C.applyMove(st(b), "a", 5); // 7 -> 4, 8 -> 1, 9 -> 2
check("only the last pit when the one before is not 2 or 3", r.captured === 2 && r.state.board[7] === 4);
// Grand slam: capturing everything captures nothing.
b = [0, 0, 0, 0, 0, 6, 0, 1, 1, 1, 1, 1, 1, 0];
r = C.applyMove(st(b), "a", 5); // every opponent pit becomes 2
check("grand slam captures nothing", r.captured === 0 && !r.state.gameOver && [7, 8, 9, 10, 11, 12].every((i) => r.state.board[i] === 2));
// 12 or more seeds skip the starting pit.
b = [12, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
r = C.applyMove(st(b), "a", 0);
check("a lap of 12 skips the starting pit", r.state.board[0] === 0 && r.state.board[1] === 2);
// Hunger rule: with an empty opponent side only moves that reach it count.
b = [0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 20];
const moves = C.getLegalMoves(st(b), "a");
check("hunger rule: only the move that feeds the opponent (" + moves.join(",") + ")", moves.length === 1 && moves[0] === 5);
// No way to feed: the game ends, each side takes its own seeds.
b = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 20];
r = C.applyMove(st(b), "b", 12); // b plays its last seed into a0; a then holds 2, b none
check("game ends when the next player has no legal move", r.state.gameOver === true);
check("seeds go to the owner of the side at the end", total(r.state) === 22 && r.state.board[6] === 2);
// More than 24 wins.
b = [1, 1, 1, 1, 1, 3, 23, 1, 2, 1, 1, 1, 1, 11];
r = C.applyMove(st(b), "a", 5);
check("25 or more ends the game", r.state.gameOver && C.getWinner(r.state) === "a");

// Computer games at each level and against each other: legal, seeds kept, end.
let games = 0, bad = 0, longest = 0;
const wins = { a: 0, b: 0, draw: 0 };
for (const [la, lb] of [[1, 1], [2, 1], [3, 1], [3, 2], [1, 3]]) {
  for (let g = 0; g < 8; g++) {
    let s = C.createInitialState("oware");
    let turn = g % 2 ? "b" : "a";
    let plies = 0;
    while (!s.gameOver && plies < 1000) {
      const legal = C.getLegalMoves(s, turn);
      if (!legal.length) { bad++; break; }
      const m = AI.chooseMove(s, turn, turn === "a" ? la : lb);
      if (legal.indexOf(m) === -1) { bad++; break; }
      const res = C.applyMove(s, turn, m);
      if (total(res.state) !== 48) { bad++; break; }
      s = res.state;
      turn = C.otherPlayer(turn);
      plies++;
    }
    if (!s.gameOver) bad++;
    longest = Math.max(longest, plies);
    games++;
    const w = C.getWinner(s);
    wins[w || "draw"]++;
  }
}
console.log("Oware: " + games + " computer games, longest " + longest + " moves, wins a/b/draw " + wins.a + "/" + wins.b + "/" + wins.draw);
check("computer games: legal moves only, 48 seeds, every game ends (" + bad + " problems)", bad === 0);

if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("=== MANCALA OWARE: rules, hunger, grand slam, end, " + games + " computer games, 0 failure(s) ===");
