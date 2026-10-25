#!/usr/bin/env node
// Animal Yatzy (tieryatzy-core.js, task 112):
//   - points of every field with examples, paws as jokers (lion, lion, paw,
//     monkey, elephant: "three the same" 20, "all different" 0);
//   - rolling, keeping dice, at most three rolls, a field only once,
//     striking a field with 0 points;
//   - game end after every field of every player, the most points win,
//     a tie lets every best player win;
//   - 1 to 4 players; computer against computer: GAMES games (default 200)
//     with 1 to 4 computers, every game ends after 11 turns per player;
//   - save and load (JSON) in the middle of a game plays on.
const path = require("path");
const T = require(path.join(__dirname, "..", "tieryatzy-core.js"));
const GAMES = parseInt(process.env.GAMES || "200", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const L = 0, E = 1, G = 2, M = 3, P = 4, W = T.PAW;

// Points.
const pts = (faces) => { const o = {}; T.FIELDS.forEach((f) => { o[f] = T.score(f, faces); }); return o; };
{
  const a = pts([L, L, W, M, E]);
  check("example: three the same 20", a.three === 20);
  check("example: two the same 10", a.two === 10);
  check("example: four the same 0", a.four === 0);
  check("example: all different 0", a.diff === 0);
  check("example: lions 3 (2 + paw)", a.a0 === 3);
  check("example: monkeys 2 (1 + paw)", a.a3 === 2);
  check("example: lucky field 3", a.luck === 3);
  const b = pts([L, E, G, M, W]);
  check("all different with a paw 25", b.diff === 25 && b.two === 10 && b.three === 0);
  const c = pts([L, E, G, M, P]);
  check("all different 25, lucky 1", c.diff === 25 && c.luck === 1 && c.two === 0);
  const d = pts([W, W, W, W, W]);
  check("five paws: five the same 50, every animal 5", d.five === 50 && d.a0 === 5 && d.a4 === 5 && d.diff === 25 && d.luck === 5);
  const e = pts([G, G, G, G, G]);
  check("five giraffes: 50, giraffes 5, all different 0", e.five === 50 && e.a2 === 5 && e.diff === 0 && e.four === 30);
  const f = pts([P, P, W, W, L]);
  check("two penguins and two paws: four the same 30, penguins 4", f.four === 30 && f.a4 === 4 && f.five === 0 && f.luck === 4);
  const g = pts([L, L, E, E, W]);
  check("two pairs and a paw: three the same, all different 0", g.three === 20 && g.diff === 0);
  check("no number above 50", T.FIELDS.every((fl) => [a, b, c, d, e, f, g].every((x) => x[fl] <= 50)));
}

// Rolling, keeping, three rolls.
{
  let s = T.newGame({ players: 2 });
  check("no field before the first roll", T.choose(s, "luck") === s);
  check("no keeping before the first roll", T.toggleHold(s, 0) === s);
  s = T.roll(s, null, [L, L, E, G, M]);
  check("first roll", s.rolls === 1 && s.dice.join(",") === [L, L, E, G, M].join(","));
  s = T.toggleHold(T.toggleHold(s, 0), 1);
  s = T.roll(s, null, [L, W, P]);
  check("kept dice stay", s.dice.join(",") === [L, L, L, W, P].join(",") && s.rolls === 2);
  s = T.toggleHold(s, 1);
  check("a kept die can be let go", s.held[1] === false);
  s = T.roll(s, null, [E, G, E, M]);
  check("third roll", s.rolls === 3 && s.dice[0] === L);
  check("no fourth roll", T.roll(s, null, [L, L, L, L, L]) === s);
  check("no keeping after the third roll", T.toggleHold(s, 2) === s);
  const opt = T.options(s);
  check("options for all 11 fields", Object.keys(opt).length === 11);
  s = T.choose(s, "five");
  check("striking: five the same with 0", s.sheets[0].five === 0 && s.current === 1 && s.rolls === 0 && s.dice.every((x) => x === null));
  check("last turn noted", s.last && s.last.field === "five" && s.last.points === 0 && s.last.player === 0);
  s = T.roll(s, null, [L, L, L, L, L]);
  s = T.choose(s, "five");
  check("player 2 gets 50", s.sheets[1].five === 50);
  s = T.roll(s, null, [L, E, G, M, P]);
  check("a field only once", T.choose(s, "five") === s);
}

// Game end and a tie.
{
  let s = T.newGame({ players: 2 });
  for (let k = 0; k < 22; k++) {
    s = T.roll(s, null, [L, E, G, M, P]);
    s = T.choose(s, T.freeFields(s.sheets[s.current])[0]);
  }
  check("over after 11 fields each", s.phase === "over" && s.turns === 22);
  check("tie: both win", s.winners.length === 2 && T.outcomeFor(s, 0) === "draw" && T.outcomeFor(s, 1) === "draw");
  check("no move after the end", T.roll(s, null, [L, L, L, L, L]) === s);
  let u = T.newGame({ players: 1 });
  for (let k = 0; k < 11; k++) { u = T.roll(u, null, [W, W, W, W, W]); u = T.choose(u, T.freeFields(u.sheets[0])[0]); }
  check("one player: game ends, wins", u.phase === "over" && T.outcomeFor(u, 0) === "win");
  check("one player: all paws give 165", T.total(u.sheets[0]) === 5 * 5 + 10 + 20 + 30 + 50 + 25 + 5);
}

// Computer games.
const totals = [];
let turnsAll = 0;
for (let g = 0; g < GAMES; g++) {
  const n = 1 + (g % 4);
  const rng = T.makeRng(1000 + g);
  let s = T.newGame({ players: n, computer: new Array(n).fill(true) });
  let guard = 0;
  while (s.phase !== "over" && guard++ < 1000) {
    const next = T.aiStep(s, rng);
    if (next === s) { fails.push("game " + g + ": computer stuck"); break; }
    s = next;
    if (guard === 60) s = JSON.parse(JSON.stringify(s)); // save and load
  }
  if (s.phase !== "over") { fails.push("game " + g + ": no end"); continue; }
  if (s.turns !== 11 * n) fails.push("game " + g + ": " + s.turns + " turns");
  if (!s.sheets.every((sh) => T.freeFields(sh).length === 0)) fails.push("game " + g + ": free fields left");
  s.sheets.forEach((sh) => totals.push(T.total(sh)));
  turnsAll += s.turns;
}
const avg = totals.reduce((a, b) => a + b, 0) / Math.max(1, totals.length);
console.log("computer games: " + GAMES + ", average total " + avg.toFixed(1) + " points (lowest " + Math.min.apply(null, totals) + ", highest " + Math.max.apply(null, totals) + ")");
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== ANIMAL YATZY CORE: field points with paws, rolls and keeping, end and tie, " + GAMES + " computer games, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
