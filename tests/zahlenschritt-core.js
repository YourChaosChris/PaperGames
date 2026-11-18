#!/usr/bin/env node
// Step Numbers (zahlenschritt-core.js / zahlenschritt-ai.js, task 226): setup of
// the middle column, which fields a card fits, cards that do not fit are out,
// blocked edge fields, win with every field filled, the stack runs out and is
// shuffled again, and the computer: every level always answers with a legal
// move and every game ends. No server or browser needed.
const path = require("path");
const Core = require(path.join(__dirname, "..", "zahlenschritt-core.js"));
global.ZahlenschrittCore = Core;
const Ai = require(path.join(__dirname, "..", "zahlenschritt-ai.js"));
const failures = [];
let checks = 0;
function check(ok, message) { checks++; if (!ok) failures.push(message); }

// Levels: 0-5 with 4 rows, 0-9 with 7, 0-15 with 10.
check(JSON.stringify(Core.LEVELS) === JSON.stringify({ 1: { max: 5, rows: 4 }, 2: { max: 9, rows: 7 }, 3: { max: 15, rows: 10 } }), "levels");
[1, 2, 3].forEach((lv) => {
  const s = Core.createInitialState(lv);
  check(s.deck.length === (s.max + 1) * Core.COPIES, "deck size level " + lv);
  check(s.phase === "setup" && s.turn === "b", "starts with Black setting up, level " + lv);
});

// Setup: numbers outside the range are refused, a number may repeat, Black then White.
let s = Core.createInitialState(1);
check(Core.addMid(s, 6) === null && Core.addMid(s, -1) === null && Core.addMid(s, 1.5) === null, "numbers out of range refused");
[3, 3, 0, 5].forEach((n) => { s = Core.addMid(s, n); });
check(s.turn === "w" && s.phase === "setup" && s.mids.b.join() === "3,3,0,5", "Black done, White sets up");
check(JSON.stringify(s.cells.b[2]) === '["x",null]' && JSON.stringify(s.cells.b[3]) === '[null,"x"]', "edge fields are blocked: left of 0, right of the highest");
const back = Core.removeLastMid(s);
check(back === null, "nothing to take back when the other side has not started");
s = Core.addMid(s, 2);
s = Core.removeLastMid(s);
check(s.mids.w.length === 0 && s.cells.w.length === 0, "take back the last number");
[1, 4, 2, 4].forEach((n) => { s = Core.addMid(s, n); });
check(s.phase === "draw" && s.turn === "b" && s.mids.w.join() === "1,4,2,4", "both done, Black draws");
check(Core.addMid(s, 1) === null, "no more numbers after setup");

// A card fits the left field of a row with middle N+1 and the right field with middle N-1.
let t = JSON.parse(JSON.stringify(s));
t.card = 2; t.phase = "place"; t.turn = "b";
check(JSON.stringify(Core.fits(t)) === JSON.stringify([{ row: 0, col: 0 }, { row: 1, col: 0 }]), "card 2 fits the left of both 3s, got " + JSON.stringify(Core.fits(t)));
t.card = 4;
check(JSON.stringify(Core.fits(t)) === JSON.stringify([{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 3, col: 0 }]), "card 4 fits the right of both 3s and the left of the 5");
t.card = 1;
check(JSON.stringify(Core.fits(t)) === JSON.stringify([{ row: 2, col: 1 }]), "card 1 fits the right of 0");
check(!Core.isLegalPlace(t, 0, 0), "a field that does not fit is refused");
const p1 = Core.place(t, 2, 1);
check(p1 && p1.cells.b[2][1] === 1 && p1.turn === "w" && p1.phase === "draw" && p1.card === null, "placing writes the number and passes the turn");
check(Core.place(t, 3, 0) === null, "illegal place returns null");
check(Core.isLegalMove(s, { kind: "draw" }) && !Core.isLegalMove(s, { kind: "num", n: 1 }) && Core.isLegalMove(t, { kind: "cell", row: 2, col: 1 }), "isLegalMove");

// A card that fits nowhere is out and the turn passes.
let u = JSON.parse(JSON.stringify(s));
u.deck = [5];
u = Core.draw(u);
check(u.turn === "w" && u.phase === "draw" && u.card === null && u.last && u.last.fit === false && u.last.card === 5, "card 5 fits nowhere, it is out");
// A card that fits stays for the choice.
let v = JSON.parse(JSON.stringify(s));
v.deck = [2];
v = Core.draw(v);
check(v.phase === "place" && v.card === 2 && v.turn === "b", "card 2 waits for the field");
check(Core.draw(v) === null, "no second draw while a card is open");

// The stack runs out and is shuffled anew.
let w = JSON.parse(JSON.stringify(s));
w.deck = [];
w = Core.draw(w);
check(w && w.deck.length === (w.max + 1) * Core.COPIES - 1, "empty stack is shuffled again");

// Win: the last open field of Black.
let x = Core.createInitialState(1);
[0, 5, 0, 5].forEach((n) => { x = Core.addMid(x, n); });
[0, 5, 0, 5].forEach((n) => { x = Core.addMid(x, n); });
check(Core.openCount(x, "b") === 4, "four open fields for 0,5,0,5");
x.phase = "place"; x.turn = "b";
const order = [[1, 0, 1], [4, 1, 1], [1, 2, 1], [4, 3, 1]];
order.forEach(([card, row], i) => {
  x.card = card;
  const fl = Core.fits(x);
  check(fl.length >= 1, "card " + card + " fits");
  x = Core.place(x, fl[0].row, fl[0].col);
  if (i < 3) { check(x.phase === "draw" && !x.result, "not won yet " + i); x.phase = "place"; x.turn = "b"; }
});
check(x.result && x.result.winner === "b" && x.phase === "over", "Black wins when every field is filled");
check(Core.draw(x) === null && Core.place(x, 0, 0) === null, "nothing after the end");

// The computer: every level, whole games with the AI on both sides, always legal and always ends.
let seed = 12345;
const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const GAMES = 100;
const wins = { 1: { b: 0, w: 0 }, 2: { b: 0, w: 0 }, 3: { b: 0, w: 0 } };
[1, 2, 3].forEach((lv) => {
  for (let g = 0; g < GAMES; g++) {
    let st = Core.createInitialState(lv, rng);
    let steps = 0;
    while (!st.result && steps < 4000) {
      const m = Ai.chooseMove(st, lv, rng);
      if (!m || !Core.isLegalMove(st, m)) { check(false, "illegal move level " + lv + " " + JSON.stringify(m) + " phase " + st.phase); break; }
      st = m.kind === "num" ? Core.addMid(st, m.n) : m.kind === "draw" ? Core.draw(st, rng) : Core.place(st, m.row, m.col);
      if (!st) { check(false, "move refused"); break; }
      steps++;
    }
    check(!!st && !!st.result, "game ends, level " + lv);
    if (st && st.result) wins[lv][st.result.winner]++;
  }
});
// Hard writes numbers that need few and evenly spread cards: its sheet is faster than a random one.
{
  const mk = (lv) => { let st = Core.createInitialState(3, rng); for (let i = 0; i < 10; i++) st = Core.addMid(st, Ai.chooseMove(st, lv, rng).n); return Ai.cost(st.mids.b, 15); };
  let hard = 0; let easy = 0;
  for (let i = 0; i < 100; i++) { hard += mk(3); easy += mk(1); }
  check(hard < easy, "Hard's middle column costs less than Easy's (" + hard + " < " + easy + ")");
}

if (failures.length) {
  console.log(failures.slice(0, 20).join("\n"));
  console.log(`=== ZAHLENSCHRITT CORE: ${failures.length} failure(s) of ${checks} checks ===`);
  process.exit(1);
}
console.log(`=== ZAHLENSCHRITT CORE: levels, setup, which fields a card fits, cards that do not fit, blocked edges, win, shuffled stack, ${GAMES * 3} computer games on three levels, 0 failure(s) of ${checks} checks ===`);
