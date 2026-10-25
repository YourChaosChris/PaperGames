#!/usr/bin/env node
// Ludo rules engine (ludo-core.js) and computer players (ludo-ai.js),
// classic 4-arm board and the six-arm board of task 109:
//   - classic numbers unchanged (52 squares, starts 0/13/26/39, finish 56,
//     a classic state has no `board` field);
//   - six arms: 78 squares, starts 0, 13, 26, 39, 52, 65, finish 82;
//   - capture across the seam 77 -> 0, the block rule, entering the own
//     home column, exact finish, a win with four tokens home;
//   - a six-arm game survives JSON (save and load) and plays on;
//   - computer against computer: GAMES games with 6 colors and GAMES with
//     4, every move legal, no hang, no two colors on one unsafe square.
// GAMES defaults to 200 (env GAMES).
const LudoCore = require("../ludo-core.js");
global.LudoCore = LudoCore;
const LudoAi = require("../ludo-ai.js");

const GAMES = parseInt(process.env.GAMES || "200", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// Seeded random numbers for repeatable games.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// Classic board unchanged.
const g4 = LudoCore.geometry(4);
check("classic track 52", g4.trackLength === 52 && LudoCore.TRACK_LENGTH === 52);
check("classic starts", JSON.stringify(g4.start) === JSON.stringify({ red: 0, green: 13, yellow: 26, blue: 39 }));
check("classic finish 56", g4.finishRel === 56 && LudoCore.FINISH_REL === 56);
const c4 = LudoCore.createInitialState(["red", "green", "yellow", "blue"]);
check("classic state has no board field", !("board" in c4) && !("board" in LudoCore.cloneState(c4)));

// Six arms.
const g6 = LudoCore.geometry(6);
check("six-arm track 78", g6.trackLength === 78);
check("six-arm starts 0,13,26,39,52,65", g6.colors.map((c) => g6.start[c]).join(",") === "0,13,26,39,52,65");
check("six-arm last track rel 76, finish 82", g6.lastTrackRel === 76 && g6.finishRel === 82);
const s6 = LudoCore.createInitialState(LudoCore.COLOR_ORDER_6, { board: 6 });
check("six-arm state", s6.board === 6 && s6.activeColors.length === 6 && LudoCore.cloneState(s6).board === 6);
check("geometry from the state", LudoCore.geometry(s6) === g6 && LudoCore.geometry(c4) === g4);

function place(state, color, i, rel) {
  const t = state.tokens[color][i];
  if (rel === "home") { t.state = "home"; t.rel = null; } else if (rel === "finished") { t.state = "finished"; t.rel = null; } else { t.state = "active"; t.rel = rel; }
}

// Capture across the seam: orange (start 65) rel 10 = square 75, a 4 takes
// it over square 77 to square 1, where red (rel 1) stands - not safe.
{
  const s = LudoCore.createInitialState(["red", "orange"], { board: 6 });
  place(s, "orange", 0, 10);
  place(s, "red", 0, 1);
  check("orange rel 10 is square 75", LudoCore.absTrackIndex("orange", 10, s) === 75);
  check("square 1 is not safe", !LudoCore.isSafeAbs(1, s));
  const r = LudoCore.applyMove(s, "orange", 0, 4);
  check("seam: orange lands on square 1", LudoCore.absTrackIndex("orange", r.state.tokens.orange[0].rel, r.state) === 1);
  check("seam: red is captured", r.captured.length === 1 && r.captured[0].color === "red" && r.state.tokens.red[0].state === "home");
}
// A block: two green tokens on square 20 stop red from passing.
{
  const s = LudoCore.createInitialState(["red", "green"], { board: 6 });
  place(s, "green", 0, 7); place(s, "green", 1, 7);
  place(s, "red", 0, 18);
  check("block square 20", LudoCore.absTrackIndex("green", 7, s) === 20 && LudoCore.isBlockedForOpponent(s, "red", 20));
  check("block: red may not pass", !LudoCore.isLegalMove(s, "red", 0, 3) && LudoCore.illegalReason(s, "red", 0, 3) === "blocked");
  check("block: red may stop short", LudoCore.isLegalMove(s, "red", 0, 1));
  // A block across the seam: purple on square 2 (rel 28) twice, orange from 76.
  const t = LudoCore.createInitialState(["purple", "orange"], { board: 6 });
  place(t, "purple", 0, 28); place(t, "purple", 1, 28);
  place(t, "orange", 0, 11);
  check("seam block square 2", LudoCore.absTrackIndex("purple", 28, t) === 2 && LudoCore.absTrackIndex("orange", 11, t) === 76);
  check("seam block: orange may not pass", !LudoCore.isLegalMove(t, "orange", 0, 5));
}
// The home column: the last shared square is rel 76, then 77..81 private.
{
  const s = LudoCore.createInitialState(["red", "blue"], { board: 6 });
  place(s, "red", 0, 75);
  place(s, "blue", 0, 37); // square 76: red's last shared square
  check("blue on red's last square", LudoCore.absTrackIndex("blue", 37, s) === LudoCore.absTrackIndex("red", 76, s));
  const r = LudoCore.applyMove(s, "red", 0, 3);
  check("red enters its home column (rel 78)", r.state.tokens.red[0].rel === 78 && r.captured.length === 0);
  check("nothing of red on the shared track any more", LudoCore.colorCountAtAbs(r.state, "red", LudoCore.absTrackIndex("red", 78 % 78, s)) === 0);
  place(s, "red", 0, 80);
  check("overshoot from rel 80 with a 3", !LudoCore.isLegalMove(s, "red", 0, 3) && LudoCore.illegalReason(s, "red", 0, 3) === "overshoot");
  check("exact finish from rel 80 with a 2", LudoCore.applyMove(s, "red", 0, 2).finished);
  // Not into another color's home column: blue at rel 76 is on its own way in.
  place(s, "blue", 0, 76);
  const b = LudoCore.applyMove(s, "blue", 0, 1);
  check("blue goes into its own column", b.state.tokens.blue[0].rel === 77);
}
// Win with four tokens home.
{
  const s = LudoCore.createInitialState(["red", "green", "yellow", "blue", "purple", "orange"], { board: 6 });
  [0, 1, 2].forEach((i) => place(s, "purple", i, "finished"));
  place(s, "purple", 3, 81);
  const r = LudoCore.applyMove(s, "purple", 3, 1);
  check("purple wins with four home", r.state.gameOver && r.state.winner === "purple" && LudoCore.tokensFinished(r.state, "purple") === 4);
}
// Entering on a 6 only, onto the own start square.
{
  const s = LudoCore.createInitialState(["orange"], { board: 6 });
  check("needs a six", !LudoCore.isLegalMove(s, "orange", 0, 5) && LudoCore.isLegalMove(s, "orange", 0, 6));
  const r = LudoCore.applyMove(s, "orange", 0, 6);
  check("orange enters on square 65", LudoCore.absTrackIndex("orange", r.state.tokens.orange[0].rel, r.state) === 65);
}

// Computer against computer.
function playGame(colors, board, seed, levels) {
  const random = rng(seed);
  const saved = Math.random;
  Math.random = random; // ludo-ai picks at random on level 1
  let state = LudoCore.createInitialState(colors, board === 6 ? { board: 6 } : undefined);
  let turns = 0, sixStreak = 0, problem = null;
  try {
    while (!state.gameOver && turns < 20000) {
      turns++;
      const color = LudoCore.currentColor(state);
      const roll = LudoCore.rollDie(random);
      sixStreak = roll === 6 ? sixStreak + 1 : 0;
      if (sixStreak >= LudoCore.SIX_STREAK_LIMIT) { state.turnIndex = LudoCore.nextTurnIndex(state); sixStreak = 0; continue; }
      const legal = LudoCore.getLegalMoves(state, color, roll);
      if (legal.length) {
        const pick = LudoAi.chooseMove(state, color, roll, levels[state.turnIndex % levels.length]);
        if (legal.indexOf(pick) === -1) { problem = "illegal pick " + pick; break; }
        state = LudoCore.applyMove(state, color, pick, roll).state;
        // On an unsafe shared square only one color may stand.
        const g = LudoCore.geometry(state);
        const owner = {};
        for (const c of state.activeColors) {
          for (const t of state.tokens[c]) {
            if (t.state !== "active" || t.rel > g.lastTrackRel) continue;
            const abs = LudoCore.absTrackIndex(c, t.rel, state);
            if (g.safe[abs]) continue;
            if (owner[abs] && owner[abs] !== c) problem = "two colors on square " + abs;
            owner[abs] = c;
          }
          if (state.tokens[c].length !== 4) problem = "token count " + c;
        }
        if (problem) break;
      }
      if (!state.gameOver && roll !== 6) { state.turnIndex = LudoCore.nextTurnIndex(state); sixStreak = 0; }
      // Save and load in the middle of the game.
      if (turns === 150) state = JSON.parse(JSON.stringify(state));
    }
  } finally {
    Math.random = saved;
  }
  if (!problem && !state.gameOver) problem = "no winner after " + turns + " turns";
  return { problem, turns, winner: state.winner, board: state.board };
}

const sizes = { 6: [], 4: [] };
const wins = {};
for (let i = 0; i < GAMES; i++) {
  const r6 = playGame(LudoCore.COLOR_ORDER_6, 6, 1000 + i, [1 + (i % 3), 2, 3, 1, 2, 3]);
  if (r6.problem) fails.push("6 colors, game " + i + ": " + r6.problem);
  else { sizes[6].push(r6.turns); wins[r6.winner] = (wins[r6.winner] || 0) + 1; }
  if (r6.board !== 6) fails.push("6 colors, game " + i + ": board lost");
  const r4 = playGame(LudoCore.COLOR_ORDER, 4, 5000 + i, [3, 2, 1, 2]);
  if (r4.problem) fails.push("4 colors, game " + i + ": " + r4.problem);
  else sizes[4].push(r4.turns);
  if (r4.board !== undefined) fails.push("4 colors, game " + i + ": board field appeared");
}
const avg = (a) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
console.log("computer games: 6 colors " + sizes[6].length + "/" + GAMES + " (average " + avg(sizes[6]) + " turns, longest " + Math.max.apply(null, sizes[6].concat([0])) + "), 4 colors " + sizes[4].length + "/" + GAMES + " (average " + avg(sizes[4]) + " turns)");
console.log("wins by color (6): " + LudoCore.COLOR_ORDER_6.map((c) => c + " " + (wins[c] || 0)).join(", "));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== LUDO CORE: classic and six-arm rules, " + GAMES + " + " + GAMES + " computer games, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
