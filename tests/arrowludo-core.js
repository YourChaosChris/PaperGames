#!/usr/bin/env node
// Arrow Ludo rules (task 189, redone in task 191): the Ludo engine with
// `state.arrows`. The arrow square of each color is its own route square
// 4 (track squares 4, 17, 30, 43). A token that ends its move on any arrow
// square flies across the middle to the arrow square opposite, 26 squares
// away: forward on the first half of its lap, back on the second half.
// No server or browser.
//   - squares, flight for every color, own and foreign arrow squares;
//   - flights back, again in a later lap, no second flight on arrival;
//   - passing or stopping short does nothing; plain Ludo is unchanged;
//   - capture on the arrow square and at the target, block at the target;
//   - no flight leaves the shared track (the path into the finish is
//     never skipped), the token still reaches the finish;
//   - a save from v285 (token on route square 38) still plays;
//   - computer Medium and Hard (and the Hint) take a flight forward and
//     avoid a flight back; Easy plays any legal move;
//   - 100 computer games per level 1-3 end with a winner and fly both ways.
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
check("arrow squares are 4, 17, 30, 43", JSON.stringify(squares) === "[4,17,30,43]" && JSON.stringify(Core.ARROW_SQUARES) === "[4,17,30,43]", squares);
check("the arrow square is the 4th after the start", Core.ARROW_FROM_REL === 4);
check("the flight is 26 squares", Core.ARROW_FLIGHT === 26 && Core.ARROW_TO_REL === 30);

// The flight from the own arrow square, for every color.
Core.COLOR_ORDER.forEach((c) => {
  const s = fresh();
  put(s, c, 0, 1);
  const r = Core.applyMove(s, c, 0, 3);
  check(c + " flies from its own arrow square", r.jumped === true && r.flightFromRel === 4 && r.state.tokens[c][0].rel === 30, r.state.tokens[c][0]);
  const abs = Core.absTrackIndex(c, 30, r.state);
  check(c + " lands on the arrow square opposite", Core.ARROW_SQUARES.indexOf(abs) !== -1 && (abs - Core.absTrackIndex(c, 4, r.state) + 52) % 52 === 26, abs);
  const e = fresh();
  put(e, c, 0, 0);
  check(c + " from its start square with a 4", Core.applyMove(e, c, 0, 4).state.tokens[c][0].rel === 30);
  const p = fresh();
  put(p, c, 0, 2);
  const q = Core.applyMove(p, c, 0, 3);
  check(c + " passing the arrow square does nothing", !q.jumped && q.state.tokens[c][0].rel === 5);
  const m = fresh();
  put(m, c, 0, 1);
  const w = Core.applyMove(m, c, 0, 2);
  check(c + " stopping short does nothing", !w.jumped && w.state.tokens[c][0].rel === 3);
  // Every arrow square flies, own and foreign: 4 -> 30, 17 -> 43 forward,
  // 30 -> 4, 43 -> 17 back.
  [[4, 30], [17, 43], [30, 4], [43, 17]].forEach(([land, to]) => {
    const f = fresh();
    put(f, c, 0, land - 2);
    const g = Core.applyMove(f, c, 0, 2);
    check(c + " landing on route square " + land + " flies to " + to, g.jumped && g.flightFromRel === land && g.state.tokens[c][0].rel === to, g.state.tokens[c][0]);
    check(c + " arrowFlightRel " + land, Core.arrowFlightRel(f, c, land) === to);
  });
});

// The landing square of a flight starts no second flight, and a token
// standing on an arrow square that moves on does not fly.
{
  const s = fresh(["red", "green"]);
  put(s, "red", 0, 1);
  const r = Core.applyMove(s, "red", 0, 3);
  check("no second flight on arrival", r.state.tokens.red[0].rel === 30);
  const n = Core.applyMove(r.state, "red", 0, 5);
  check("moving on from an arrow square is ordinary", !n.jumped && n.state.tokens.red[0].rel === 35);
}

// Flying again in a later lap: 4 -> 30, on to 43 -> back to 17, on to 30
// -> back to 4, on to 17 -> forward to 43.
{
  let s = fresh(["red", "green"]);
  put(s, "red", 0, 0);
  const seq = [[4, 30], [6, 36], [6, 42], [1, 17], [6, 23], [6, 29], [1, 4], [6, 10], [6, 16], [1, 43]];
  let flights = 0;
  seq.forEach(([roll, want]) => {
    const r = Core.applyMove(s, "red", 0, roll);
    if (r.jumped) flights++;
    s = r.state;
    check("later lap: roll " + roll + " ends on " + want, s.tokens.red[0].rel === want, s.tokens.red[0]);
  });
  check("four flights in one token's journey", flights === 4, flights);
}

// Plain Ludo is unchanged.
{
  const s = Core.createInitialState(["red", "green"]);
  put(s, "red", 0, 1);
  const r = Core.applyMove(s, "red", 0, 3);
  check("plain Ludo does not fly", !r.jumped && r.state.tokens.red[0].rel === 4 && r.flightFromRel === null);
  put(s, "red", 1, 8);
  check("plain Ludo square 12 is ordinary", Core.applyMove(s, "red", 1, 4).state.tokens.red[1].rel === 12);
}

// Capturing: on the arrow square and at the target.
{
  const s = fresh(["red", "green", "blue"]);
  put(s, "red", 0, 1);
  put(s, "green", 0, 43); // green 13 + 43 = abs 4, red's arrow square
  put(s, "blue", 0, 43); // blue 39 + 43 = abs 30, red's target
  const r = Core.applyMove(s, "red", 0, 3);
  check("flight captures on the arrow square and at the target", r.jumped && r.captured.length === 2 && r.state.tokens.green[0].state === "home" && r.state.tokens.blue[0].state === "home", r.captured);
  check("the flying token stands on the target", r.state.tokens.red[0].rel === 30);
}

// A block at the target stops the move; a single token does not.
{
  const s = fresh(["red", "green"]);
  put(s, "red", 0, 1);
  put(s, "green", 0, 17);
  put(s, "green", 1, 17); // two green tokens on abs 30
  check("block at the target: move refused", Core.getLegalMoves(s, "red", 3).indexOf(0) === -1);
  check("block at the target: reason", Core.illegalReason(s, "red", 0, 3) === "blocked");
  check("other rolls still allowed", Core.getLegalMoves(s, "red", 2).indexOf(0) !== -1);
  const t = fresh(["red", "green"]);
  put(t, "red", 0, 1);
  put(t, "green", 0, 17);
  check("a single token at the target does not block", Core.getLegalMoves(t, "red", 3).indexOf(0) !== -1);
  // A block of the moving color's own tokens at the target is no problem.
  const o = fresh(["red", "green"]);
  put(o, "red", 0, 1);
  put(o, "red", 1, 30);
  put(o, "red", 2, 30);
  check("own tokens at the target do not block", Core.getLegalMoves(o, "red", 3).indexOf(0) !== -1);
  // A block on a flight-back target stops that move too.
  const b = fresh(["red", "green"]);
  put(b, "red", 0, 28);
  put(b, "green", 0, 43);
  put(b, "green", 1, 43); // abs 4, where red's flight back from 30 lands
  check("block at a flight-back target: refused", Core.illegalReason(b, "red", 0, 2) === "blocked");
}

// No flight leaves the shared track: from every square and roll, a
// flight lands on track squares 4, 17, 30 or 43 and never inside the path
// into the finish, and a token past square 43 can no longer fly.
{
  let bad = 0;
  Core.COLOR_ORDER.forEach((c) => {
    for (let rel = 0; rel < Core.FINISH_REL; rel++) {
      for (let roll = 1; roll <= 6; roll++) {
        const s = fresh();
        put(s, c, 0, rel);
        if (!Core.isLegalMove(s, c, 0, roll)) continue;
        const r = Core.applyMove(s, c, 0, roll);
        const t = r.state.tokens[c][0];
        if (r.jumped && ([4, 17, 30, 43].indexOf(t.rel) === -1 || rel + roll > Core.LAST_TRACK_REL)) bad++;
        if (rel > 43 && r.jumped) bad++;
      }
    }
  });
  check("flights stay on the shared track", bad === 0, bad);
}

// After the last flight the token plays on to the finish.
{
  let s = fresh(["red", "green"]);
  put(s, "red", 0, 41);
  s = Core.applyMove(s, "red", 0, 3).state; // 44, past every arrow square
  let steps = 0;
  while (s.tokens.red[0].state === "active" && steps < 40) {
    const rel = s.tokens.red[0].rel;
    const roll = Math.min(6, Core.FINISH_REL - rel);
    check("legal on the way home " + rel + "+" + roll, Core.isLegalMove(s, "red", 0, roll));
    s = Core.applyMove(s, "red", 0, roll).state;
    steps++;
  }
  check("token reaches the finish", s.tokens.red[0].state === "finished" && steps <= 3, steps);
  const w = fresh(["red", "green"]);
  [0, 1, 2].forEach((i) => { w.tokens.red[i] = { state: "finished", rel: null }; });
  put(w, "red", 3, 53);
  const end = Core.applyMove(w, "red", 3, 3);
  check("the last token home ends the game", end.state.gameOver && end.state.winner === "red");
}

// A save from v285 (token on the old target, route square 38) plays on.
{
  const old = { activeColors: ["red", "green"], tokens: { red: [{ state: "active", rel: 38 }, { state: "home", rel: null }, { state: "home", rel: null }, { state: "home", rel: null }], green: [{ state: "active", rel: 12 }, { state: "home", rel: null }, { state: "home", rel: null }, { state: "home", rel: null }] }, turnIndex: 0, gameOver: false, winner: null, arrows: true };
  const r = Core.applyMove(old, "red", 0, 5);
  check("v285 save: token on 38 plays on (lands on 43, flies back to 17)", r.jumped && r.state.tokens.red[0].rel === 17, r.state.tokens.red[0]);
}

// The computer: Medium and Hard take a flight forward and avoid a flight
// back; with only a flight back left, they take it.
[2, 3].forEach((level) => {
  const s = fresh(["red", "green"]);
  put(s, "red", 0, 1);
  put(s, "red", 1, 40);
  put(s, "red", 2, 20);
  check("level " + level + " takes the flight forward", Ai.chooseMove(s, "red", 3, level) === 0);
  const b = fresh(["red", "green"]);
  put(b, "red", 0, 40); // 40 + 3 = 43: flight back
  put(b, "red", 1, 10);
  check("level " + level + " avoids a flight back", Ai.chooseMove(b, "red", 3, level) === 1);
  const only = fresh(["red", "green"]);
  put(only, "red", 0, 27);
  check("level " + level + " flies back when nothing else is legal", Ai.chooseMove(only, "red", 3, level) === 0);
});
{
  // Easy plays any legal move, a flight back included.
  const b = fresh(["red", "green"]);
  put(b, "red", 0, 40);
  put(b, "red", 1, 10);
  const seen = new Set();
  for (let i = 0; i < 60; i++) seen.add(Ai.chooseMove(b, "red", 3, 1));
  check("level 1 plays both moves", seen.has(0) && seen.has(1), Array.from(seen));
}

// Whole games.
let forward = 0;
let back = 0;
let longest = 0;
[1, 2, 3].forEach((level) => {
  let done = 0;
  for (let g = 0; g < 100; g++) {
    const colors = g % 3 === 0 ? ["red", "green"] : g % 3 === 1 ? ["red", "green", "yellow"] : ["red", "green", "yellow", "blue"];
    let s = fresh(colors);
    let turns = 0;
    for (; turns < 20000 && !s.gameOver; turns++) {
      const c = Core.currentColor(s);
      const roll = Core.rollDie();
      const moves = Core.getLegalMoves(s, c, roll);
      if (moves.length) {
        const pick = Ai.chooseMove(s, c, roll, level);
        check("AI pick is legal", moves.indexOf(pick) !== -1, { pick, moves });
        const before = s.tokens[c][pick].rel;
        const r = Core.applyMove(s, c, pick, roll);
        if (r.jumped) {
          if (r.state.tokens[c][pick].rel > before) forward++;
          else back++;
        }
        s = r.state;
        if (s.gameOver) break;
        if (roll === 6) continue;
      }
      s.turnIndex = Core.nextTurnIndex(s);
    }
    longest = Math.max(longest, turns);
    if (s.gameOver && s.winner) done++;
  }
  check("level " + level + ": 100 games end with a winner", done === 100, done);
});
check("computer games fly forward", forward > 300, forward);
check("computer games also fly back (Easy)", back > 0, back);

if (fails.length) { console.error("FAIL (" + fails.length + "):\n  " + fails.join("\n  ")); process.exit(1); }
console.log("=== ARROW LUDO CORE: arrow squares 4/17/30/43, flights forward and back, later laps, capture, block, finish, 300 computer games (" + forward + " flights forward, " + back + " back, longest " + longest + " turns), 0 failure(s) ===");
