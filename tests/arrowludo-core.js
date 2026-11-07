#!/usr/bin/env node
// Arrow Ludo rules (task 189): the Ludo engine with `state.arrows`.
// A token that lands exactly on its own arrow square (own route square 12)
// flies across the middle to own route square 38. No server or browser.
//   - the arrow squares are the track squares 12, 25, 38 and 51;
//   - an exact landing flies (every color), passing or missing does not;
//   - plain Ludo is unchanged (no flag, no flight);
//   - the flight captures on the arrow square and at the target, and is
//     refused when two opposing tokens block the target;
//   - after the flight the token plays on to the finish;
//   - the Hint/computer prefers the flight at Medium and Hard;
//   - 100 computer games per level 1-3 end with a winner and use the flight.
// Run: node tests/arrowludo-core.js

const Core = require("../ludo-core.js");
global.LudoCore = Core;
const Ai = require("../ludo-ai.js");
const fails = [];
const check = (name, ok, info) => { if (!ok) fails.push(name + (info !== undefined ? ": " + JSON.stringify(info) : "")); };

function fresh(colors) {
  return Core.createInitialState(colors || ["red", "green", "yellow", "blue"], { arrows: true });
}
const put = (s, color, i, rel) => { s.tokens[color][i] = { state: "active", rel }; };

// Flag and squares.
const s0 = fresh();
check("arrows flag set", s0.arrows === true);
check("flag survives a clone", Core.cloneState(s0).arrows === true);
check("plain Ludo has no flag", Core.createInitialState(["red", "green"]).arrows === undefined);
check("six-arm board is not offered with arrows", fresh().board === undefined && Core.createInitialState(["red"], { arrows: true, board: 6 }).board === undefined);
const squares = Core.COLOR_ORDER.map((c) => Core.absTrackIndex(c, Core.ARROW_FROM_REL, s0));
check("arrow squares are 12, 25, 38, 51", JSON.stringify(squares) === "[12,25,38,51]", squares);
check("the flight is 26 squares", Core.ARROW_TO_REL - Core.ARROW_FROM_REL === 26);

// The flight, for every color.
Core.COLOR_ORDER.forEach((c) => {
  const s = fresh();
  put(s, c, 0, 8);
  const r = Core.applyMove(s, c, 0, 4);
  check(c + " flies on an exact landing", r.jumped === true && r.state.tokens[c][0].rel === 38, r.state.tokens[c][0]);
  const abs = Core.absTrackIndex(c, 38, r.state);
  check(c + " lands opposite its arrow square", (abs - Core.absTrackIndex(c, 12, r.state) + 52) % 52 === 26, abs);
  const p = fresh();
  put(p, c, 0, 10);
  const q = Core.applyMove(p, c, 0, 3);
  check(c + " passing the arrow square does nothing", !q.jumped && q.state.tokens[c][0].rel === 13);
  const m = fresh();
  put(m, c, 0, 8);
  const w = Core.applyMove(m, c, 0, 3);
  check(c + " stopping short does nothing", !w.jumped && w.state.tokens[c][0].rel === 11);
});

// Another color's arrow square is an ordinary square.
{
  const s = fresh();
  put(s, "red", 0, 25); // abs 25 = green's arrow square
  const r = Core.applyMove(s, "red", 0, 1);
  check("a foreign arrow square is ordinary", !r.jumped && r.state.tokens.red[0].rel === 26);
}

// Plain Ludo is unchanged.
{
  const s = Core.createInitialState(["red", "green"]);
  put(s, "red", 0, 8);
  const r = Core.applyMove(s, "red", 0, 4);
  check("plain Ludo does not fly", !r.jumped && r.state.tokens.red[0].rel === 12);
}

// Capturing: on the arrow square and at the target.
{
  const s = fresh(["red", "green", "yellow"]);
  put(s, "red", 0, 8);
  put(s, "green", 0, 12 + 52 - 13); // abs 12 (green rel 51 is its home column, so use abs 12 = rel 51? keep on track)
  // green start 13: abs 12 is green rel 51 -> home column, so test with yellow instead
  s.tokens.green[0] = { state: "home", rel: null };
  put(s, "yellow", 0, 38); // yellow rel 38 = abs 64 % 52 = 12
  put(s, "green", 1, 25); // green rel 25 = abs 38 (red's target)
  const r = Core.applyMove(s, "red", 0, 4);
  check("flight captures on the arrow square and at the target", r.jumped && r.captured.length === 2 && r.state.tokens.yellow[0].state === "home" && r.state.tokens.green[1].state === "home", r.captured);
  check("the flying token stands on the target", r.state.tokens.red[0].rel === 38);
}

// A block at the target stops the move.
{
  const s = fresh(["red", "green"]);
  put(s, "red", 0, 8);
  put(s, "green", 0, 25);
  put(s, "green", 1, 25); // two green tokens on abs 38
  check("block at the target: move refused", Core.getLegalMoves(s, "red", 4).indexOf(0) === -1);
  check("block at the target: reason", Core.illegalReason(s, "red", 0, 4) === "blocked");
  check("other rolls still allowed", Core.getLegalMoves(s, "red", 3).indexOf(0) !== -1);
  const t = fresh(["red", "green"]);
  put(t, "red", 0, 8);
  put(t, "green", 0, 25);
  check("a single token at the target does not block", Core.getLegalMoves(t, "red", 4).indexOf(0) !== -1);
}

// After the flight the token plays on to the finish.
{
  let s = fresh(["red", "green"]);
  put(s, "red", 0, 8);
  s = Core.applyMove(s, "red", 0, 4).state;
  let rel = s.tokens.red[0].rel;
  let steps = 0;
  while (s.tokens.red[0].state === "active" && steps < 40) {
    const need = Core.FINISH_REL - rel;
    const roll = Math.min(6, need);
    check("legal on the way home " + rel + "+" + roll, Core.isLegalMove(s, "red", 0, roll));
    s = Core.applyMove(s, "red", 0, roll).state;
    rel = s.tokens.red[0].rel;
    steps++;
  }
  check("token reaches the finish after the flight", s.tokens.red[0].state === "finished" && steps <= 5, steps);
}

// The computer prefers the flight.
[2, 3].forEach((level) => {
  const s = fresh(["red", "green"]);
  put(s, "red", 0, 8);
  put(s, "red", 1, 40);
  put(s, "red", 2, 3);
  check("level " + level + " takes the flight", Ai.chooseMove(s, "red", 4, level) === 0);
});

// Whole games.
let flights = 0;
[1, 2, 3].forEach((level) => {
  let done = 0;
  for (let g = 0; g < 100; g++) {
    const colors = g % 3 === 0 ? ["red", "green"] : g % 3 === 1 ? ["red", "green", "yellow"] : ["red", "green", "yellow", "blue"];
    let s = fresh(colors);
    for (let turns = 0; turns < 20000 && !s.gameOver; turns++) {
      const c = Core.currentColor(s);
      const roll = Core.rollDie();
      const moves = Core.getLegalMoves(s, c, roll);
      if (moves.length) {
        const pick = Ai.chooseMove(s, c, roll, level);
        check("AI pick is legal", moves.indexOf(pick) !== -1, { pick, moves });
        const r = Core.applyMove(s, c, pick, roll);
        if (r.jumped) flights++;
        s = r.state;
        if (s.gameOver) break;
        if (roll === 6) continue;
      }
      s.turnIndex = Core.nextTurnIndex(s);
    }
    if (s.gameOver && s.winner) done++;
  }
  check("level " + level + ": 100 games end with a winner", done === 100, done);
});
check("computer games use the flight", flights > 300, flights);

if (fails.length) { console.error("FAIL (" + fails.length + "):\n  " + fails.join("\n  ")); process.exit(1); }
console.log("=== ARROW LUDO CORE: flight, capture, block, finish, 300 computer games (" + flights + " flights), 0 failure(s) ===");
