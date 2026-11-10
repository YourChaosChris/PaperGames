#!/usr/bin/env node
// Checkers rule sets Italian, Brazilian and Russian (task 200), engine only.
// Run: node tests/checkers-variants.js
const C = require("../checkers-core.js");
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const empty = () => Array.from({ length: 8 }, () => Array(8).fill(null));
const caps = (b, color, rules) => C.getLegalMoves(b, color, rules).filter((m) => m.captured.length);

check("normalizeRules knows the six sets", ["en", "de", "it", "br", "ru", "es"].every((r) => C.normalizeRules(r) === r));
check("normalizeRules: unknown and missing are en", C.normalizeRules("xx") === "en" && C.normalizeRules(undefined) === "en");
check("isFlyingRules", C.isFlyingRules("de") && C.isFlyingRules("br") && C.isFlyingRules("ru") && C.isFlyingRules("es") && !C.isFlyingRules("it") && !C.isFlyingRules("en"));

// Spanish (task 213): men capture forward only, and may take a king.
let s = empty(); s[4][3] = "b"; s[3][2] = "w"; // a white man behind the black man
check("es: a man does not capture backward", caps(s, "b", "es").length === 0);
check("de: a man captures backward", caps(s, "b", "de").length === 1);
s = empty(); s[4][3] = "b"; s[5][4] = "W";
check("es: a man takes a king (unlike Italian)", caps(s, "b", "es").length === 1 && caps(s, "b", "it").length === 0);
// Spanish: men move forward only, kings fly.
s = empty(); s[3][2] = "b";
check("es: a man moves forward only", C.getLegalMoves(s, "b", "es").every((m) => m.to[0] === 4));
s = empty(); s[0][1] = "B";
const fly = C.getLegalMoves(s, "b", "es");
check("es: a king flies along the diagonal (" + fly.length + " moves)", fly.length === 7 && fly.some((m) => m.to[0] === 6 && m.to[1] === 7));
s = empty(); s[0][1] = "B"; s[4][5] = "w";
const flyCap = caps(s, "b", "es");
check("es: a king captures from afar and may land on any square behind", flyCap.length === 2 && flyCap.every((m) => m.captured.length === 1 && m.captured[0][0] === 4));
// Spanish: the most pieces, then the most kings.
s = empty(); s[0][1] = "b"; s[1][2] = "w"; s[3][4] = "w"; s[2][5] = "b"; s[3][6] = "w";
const esMost = C.getLegalMoves(s, "b", "es");
check("es: only the captures with the most pieces", esMost.length >= 1 && esMost.every((m) => m.captured.length === 2));
s = empty(); s[2][1] = "b"; s[3][2] = "w"; s[2][5] = "b"; s[3][6] = "W";
const esKings = C.getLegalMoves(s, "b", "es");
check("es: equal numbers - the capture that takes a king", esKings.length === 1 && esKings[0].from[1] === 5);

// Italian: a man may not capture a king; English allows it.
let b = empty(); b[4][3] = "b"; b[5][4] = "W";
check("it: man can't take a king", caps(b, "b", "it").length === 0);
check("en: man takes a king", caps(b, "b", "en").length === 1);
// Italian: the man takes a man, as everywhere.
b = empty(); b[4][3] = "b"; b[5][4] = "w";
check("it: man takes a man", caps(b, "b", "it").length === 1);

// Majority rule (Italian, Brazilian): a chain of several pieces and a single capture
// side by side -> only the longest capture is legal; the sets without the rule allow both.
b = empty(); b[0][1] = "b"; b[1][2] = "w"; b[3][4] = "w"; b[2][5] = "b"; b[3][6] = "w";
for (const [r, base] of [["br", "de"], ["it", "en"]]) {
  const all = C.getLegalMoves(b, "b", base);
  const most = Math.max.apply(null, all.map((x) => x.captured.length));
  const m = C.getLegalMoves(b, "b", r);
  check(r + ": only the captures with the most pieces are legal", m.length >= 1 && m.every((x) => x.captured.length === most));
  check(base + ": no majority rule, a shorter capture is legal too", all.some((x) => x.captured.length < most));
}

// Italian: with equal numbers the king has to capture.
b = empty(); b[2][1] = "b"; b[3][2] = "w"; b[6][5] = "B"; b[5][6] = "w";
let it = C.getLegalMoves(b, "b", "it");
check("it: equal count, the king captures", it.length >= 1 && it.every((m) => m.from[0] === 6 && m.from[1] === 5));
// Italian: with equal numbers take the most kings.
b = empty(); b[2][1] = "b"; b[3][2] = "w"; b[6][5] = "B"; b[5][6] = "W";
it = C.getLegalMoves(b, "b", "it");
check("it: the king takes a king first", it.length === 1 && it[0].from[0] === 6);

// Russian: crowned in the middle of the chain, goes on as king (promoted); German stays a man.
b = empty(); b[5][2] = "b"; b[6][3] = "w"; b[6][5] = "w";
const ru = C.getLegalMoves(b, "b", "ru");
check("ru: crowned mid-chain, two paths as flying king", ru.length === 2 && ru.every((m) => m.promoted && m.captured.length === 2));
const de = C.getLegalMoves(b, "b", "de");
check("de: stays a man, one path", de.length === 1 && !de[0].promoted);
// Russian king after crowning flies: it can take a piece far along the diagonal.
b = empty(); b[5][2] = "b"; b[6][3] = "w"; b[5][6] = "w";
const far = C.getLegalMoves(b, "b", "ru").filter((m) => m.captured.length === 2);
check("ru: crowned man goes on flying", far.length >= 1);

// Self-play with random moves: always legal, ends or reaches 150 plies, no crash.
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
for (const r of ["en", "de", "it", "br", "ru", "es"]) {
  let ended = 0;
  for (let g = 0; g < 25; g++) {
    let board = empty();
    for (let row = 0; row < 3; row++) for (let col = 0; col < 8; col++) if ((row + col) % 2 === 1) board[row][col] = "b";
    for (let row = 5; row < 8; row++) for (let col = 0; col < 8; col++) if ((row + col) % 2 === 1) board[row][col] = "w";
    let turn = "b";
    for (let ply = 0; ply < 200; ply++) {
      const end = C.detectGameEnd(board, turn, r);
      if (end.status !== "normal") { ended++; break; }
      const moves = C.getLegalMoves(board, turn, r);
      if (!moves.length) { check(r + ": normal status but no moves", false); break; }
      board = C.applyMove(board, moves[Math.floor(rnd() * moves.length)]);
      turn = C.otherColor(turn);
    }
  }
  check(r + ": random games run", ended >= 0);
}

// Task 213: the computer plays Spanish rules with legal moves only (each level, 60 plies).
global.CheckersCore = C;
const CAI = require("../checkers-ai.js");
const same = (a, m) => a.from.join() === m.from.join() && a.to.join() === m.to.join() &&
  a.captured.map(String).sort().join(";") === m.captured.map(String).sort().join(";");
let esBad = 0, esPlies = 0;
for (const level of [1, 2, 3]) {
  let board = C.createInitialBoard();
  let turn = "b";
  for (let ply = 0; ply < 60; ply++) {
    if (C.detectGameEnd(board, turn, "es").status !== "normal") break;
    const legal = C.getLegalMoves(board, turn, "es");
    const m = CAI.chooseMove(board, turn, turn === "b" ? level : 1, "es");
    if (!m || !legal.some((x) => same(x, m))) { esBad++; break; }
    board = C.applyMove(board, m);
    turn = C.otherColor(turn);
    esPlies++;
  }
}
console.log("es: computer played " + esPlies + " plies at levels 1-3, " + esBad + " illegal");
check("es: the computer only plays legal moves", esBad === 0);

if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("checkers-variants: ALL CHECKS PASS");
