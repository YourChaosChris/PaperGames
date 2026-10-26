#!/usr/bin/env node
// Gipfelwurf / Ridge Roll (gipfelwurf-core.js, task 131):
//   - the board: seven ridges, every sum 2..12 on exactly one ridge, own
//     lengths;
//   - splitting four dice into pairs, the options (both sums, one sum, or
//     a choice of one), the limit of three climbers per turn;
//   - a lost turn (no sum fits): the climbing of the turn is gone, the
//     camps stay; stopping keeps the climbers as camps;
//   - the end of a ridge (no step beyond the top), a claimed ridge is
//     closed and the other players' camps on it are removed;
//   - winning with 2 or 3 ridges, the end when every ridge is claimed;
//   - save and load (JSON) in the middle of a turn;
//   - computer against computer: GAMES games (default 500) each with 2, 3
//     and 4 players, levels rotated over the seats, first player by lot:
//     no hang; game length, wins per level (level 3 must beat level 1);
//   - wins per seat with equal computers (level 3) and the first player by
//     lot: every seat within 5 points of the fair share;
//   - the first player's advantage without the lot (all level 3);
//   - fairness of the ridge lengths: FAIR games (default 1000), every
//     ridge claimed within 20 % of the mean.
const path = require("path");
const C = require(path.join(__dirname, "..", "gipfelwurf-core.js"));
// GAMES / FAIR from the environment or as --games N / --fair N.
const arg = (name) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : undefined; };
const GAMES = parseInt(arg("games") || process.env.GAMES || "500", 10);
const FAIR = parseInt(arg("fair") || process.env.FAIR || "1000", 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// The board.
{
  const all = [].concat.apply([], C.SUMS).sort((a, b) => a - b);
  check("every sum 2..12 once", all.join() === "2,3,4,5,6,7,8,9,10,11,12");
  check("seven ridges", C.RIDGES === 7 && C.LENGTHS.length === 7 && C.SUMS.length === 7);
  for (let s = 2; s <= 12; s++) check("ridge of " + s, C.SUMS[C.ridgeOf(s)].indexOf(s) !== -1);
  check("own lengths", C.LENGTHS.join() === "11,8,10,11,10,8,11");
}

// A state in the middle of a game: player 0 to move, phase roll.
function fresh(players, extra) {
  const s = C.newGame({ players: players || 2, computer: [], need: 3 });
  return Object.assign(s, extra || {});
}
const withDice = (s, dice) => C.roll(s, null, dice);

// Splitting into pairs.
{
  check("three splits", JSON.stringify(C.splits([1, 2, 3, 4])) === "[[3,7],[4,6],[5,5]]");
  const s = withDice(fresh(), [1, 2, 3, 4]);
  const o = C.options(s).map((x) => x.sums.join("+"));
  check("options 3+7, 4+6, 5+5 " + o.join(" "), s.phase === "choose" && o.join(" ") === "3+7 4+6 5+5");
  const t = C.choose(s, 2);
  check("5+5: two steps on the ridge of 5", t.climbers[1] === 2 && C.climberCount(t) === 1 && t.phase === "roll");
  const u = C.choose(s, 0);
  check("3+7: one step on the outer ridge and on the 7", u.climbers[0] === 1 && u.climbers[3] === 1);
  check("no option without dice", C.options(fresh()).length === 0 && C.choose(fresh(), 0).phase === "roll");
  check("stop needs a climber", C.stop(fresh()).phase === "roll" && C.stop(fresh()).seq === 0);
}

// The limit of three climbers.
{
  const s = fresh();
  s.climbers = [1, 1, null, null, null, null, null];
  const r = withDice(s, [3, 4, 4, 4]); // 7 + 8 in every split, two new ridges, one climber left
  const o = C.options(r).map((x) => x.sums.join("+"));
  check("one climber left: choose 7 or 8 " + o.join(" "), o.join(" ") === "7 8");
  const t = C.choose(r, 1);
  check("third climber placed", C.climberCount(t) === 3 && t.climbers[4] === 1);
  const l = withDice(t, [3, 4, 4, 4]); // 7 + 8: 8 fits (own climber), 7 is a fourth ridge
  const lo = C.options(l).map((x) => x.sums.join("+"));
  check("three climbers: only their ridges " + lo.join(" "), lo.join(" ") === "8");
  const lost = withDice(t, [1, 1, 3, 3]); // 2+6, 4+4, 4+4: ridge 0 has a climber -> fits
  check("the outer ridge takes 2, 3 and 4", lost.phase === "choose");
  const busted = withDice(t, [6, 6, 6, 6]); // 12 + 12: ridge 6, no climber, none left
  check("no fitting sum: the turn is lost", busted.phase === "lost" && busted.last.type === "lost" && busted.last.lost.join() === "0,1,4");
  const nx = C.next(busted);
  check("after a lost turn: next player, climbing gone, camps unchanged", nx.current === 1 && nx.phase === "roll" && C.climberCount(nx) === 0 && nx.camps[0].every((h) => h === 0));
  check("next only after a lost turn", C.next(t) === t);
}

// Stopping keeps the camps; the next turn starts from them.
{
  let s = fresh();
  s = C.choose(withDice(s, [1, 2, 3, 4]), 2); // 5+5
  s = C.stop(s);
  check("camp kept", s.camps[0][1] === 2 && s.current === 1 && C.climberCount(s) === 0 && s.turns === 1);
  s = C.stop(C.choose(withDice(s, [6, 6, 6, 6]), 0)); // player 1: 12+12 -> 2 on ridge 6
  s = C.choose(withDice(s, [1, 4, 1, 4]), 0); // player 0: 5+5
  check("climbing from the camp", s.climbers[1] === 4);
  const b = withDice(C.stop(s), [1, 1, 1, 1]); // player 1 rolls 2+2: ridge 0 is free
  check("roll after the turn changed", b.current === 1 && b.phase === "choose");
}

// The end of a ridge and claiming it.
{
  const s = fresh();
  s.camps[0][1] = C.LENGTHS[1] - 1; // one step left on the ridge of 5
  s.camps[1][1] = 3;
  s.owner[0] = 1; s.owner[4] = 1;    // 2 and 8 are closed
  const r = withDice(s, [1, 4, 1, 4]); // 5+5: only one step fits
  const o = C.options(r).map((x) => x.sums.join("+"));
  check("one step left: 5 once " + o.join(" "), o.join(" ") === "5");
  const t = C.choose(r, 0);
  check("at the top", t.climbers[1] === C.LENGTHS[1]);
  const u = withDice(t, [1, 4, 1, 4]);
  check("no step beyond the top: lost", u.phase === "lost");
  const v = C.stop(t);
  check("ridge claimed, other camps removed", v.owner[1] === 0 && v.camps[1][1] === 0 && v.last.claimed.join() === "1");
  const w = withDice(v, [1, 4, 1, 4]); // player 1: 5+5 on a claimed ridge
  check("claimed ridge closed for the others", w.phase === "lost");
}

// Winning.
{
  const s = fresh(2, { need: 2 });
  s.owner[0] = 0;
  s.camps[0][3] = C.LENGTHS[3] - 1;
  let t = C.choose(withDice(s, [3, 4, 1, 1]), C.options(withDice(s, [3, 4, 1, 1])).findIndex((o) => o.ridges.indexOf(3) !== -1));
  t = C.stop(t);
  check("second ridge wins with 2", t.phase === "over" && t.winners.join() === "0" && C.outcomeFor(t, 0) === "win" && C.outcomeFor(t, 1) === "loss");
  const s3 = fresh(2, { need: 3 });
  s3.owner[0] = 0;
  s3.camps[0][3] = C.LENGTHS[3] - 1;
  const t3 = C.stop(C.choose(withDice(s3, [3, 4, 1, 1]), C.options(withDice(s3, [3, 4, 1, 1])).findIndex((o) => o.ridges.indexOf(3) !== -1)));
  check("two ridges are not enough with 3", t3.phase === "roll" && t3.current === 1);
  const g = fresh(4, { need: 3 });
  g.owner = [0, 0, 2, 2, 1, 3, -1];
  g.current = 1;
  g.camps[1][6] = C.LENGTHS[6] - 1;
  const gt = C.stop(C.choose(withDice(g, [6, 6, 6, 6]), 0));
  check("every ridge claimed: the most ridges win together", gt.phase === "over" && gt.winners.join() === "0,1,2" && C.outcomeFor(gt, 1) === "draw" && C.outcomeFor(gt, 3) === "loss");
  const h = fresh(2, { need: 3 });
  h.owner = [0, 0, 1, 1, -1, 1, -1];
  h.camps[0][6] = C.LENGTHS[6] - 1;
  const ht = C.stop(C.choose(withDice(h, [6, 6, 6, 6]), 0));
  check("three ridges win at once", ht.phase === "over" && ht.winners.join() === "0");
  check("need 2 or 3 only", C.newGame({ need: 5 }).need === 3 && C.newGame({ need: 2 }).need === 2);
  check("starter by lot", [0, 1, 2, 3, 4, 5, 6, 7].map((i) => C.newGame({ players: 4, starter: "lot" }, C.makeRng(i)).current).some((c) => c !== 0));
}

// Save and load in the middle of a turn.
{
  let s = fresh();
  s = C.choose(withDice(s, [1, 2, 3, 4]), 0);
  s = withDice(s, [2, 2, 5, 5]);
  const back = JSON.parse(JSON.stringify(s));
  const a = C.choose(s, 0), b = C.choose(back, 0);
  check("saved game plays on the same", JSON.stringify(a) === JSON.stringify(b) && a.phase === "roll");
}

// Computer games.
function play(n, levels, rng, starter) {
  let s = C.newGame({ players: n, computer: new Array(n).fill(true), levels, need: 3, starter }, rng);
  let guard = 0;
  while (s.phase !== "over" && guard++ < 20000) {
    const before = s;
    s = C.aiStep(s, rng);
    if (s === before) return { problem: "stuck in " + s.phase };
    if (C.climberCount(s) > C.MAX_CLIMBERS) return { problem: "four climbers" };
    for (let r = 0; r < C.RIDGES; r++) for (let p = 0; p < n; p++) if (s.camps[p][r] > C.LENGTHS[r]) return { problem: "beyond the top" };
    if (guard === 300) s = JSON.parse(JSON.stringify(s));
  }
  if (s.phase !== "over") return { problem: "no end" };
  return { s };
}

const perLevel = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
const lengthOf = {}, seatLine = {}, posLine = {};
for (const n of [2, 3, 4]) {
  let turns = 0, minT = Infinity, maxT = 0;
  const seat = new Array(n).fill(0), pos = new Array(n).fill(0);
  for (let g = 0; g < GAMES; g++) {
    const levels = [];
    for (let i = 0; i < n; i++) levels.push(1 + ((i + g) % 3));
    const res = play(n, levels, C.makeRng(n * 100000 + g), "lot");
    if (res.problem) { fails.push(n + " players, game " + g + ": " + res.problem); continue; }
    const s = res.s;
    turns += s.turns; minT = Math.min(minT, s.turns); maxT = Math.max(maxT, s.turns);
    for (let i = 0; i < n; i++) {
      perLevel[levels[i]][1]++;
      if (s.winners.length === 1 && s.winners[0] === i) perLevel[levels[i]][0]++;
    }
    // the same strength everywhere, first player by lot: wins per seat
    const lot = play(n, new Array(n).fill(3), C.makeRng(5000000 + n * 100000 + g), "lot");
    if (lot.problem) { fails.push(n + " players, lot game " + g + ": " + lot.problem); continue; }
    // a shared win counts as a share for each winner
    lot.s.winners.forEach((w) => { seat[w] += 1 / lot.s.winners.length; });
    // the same strength everywhere, player 1 always starts: the starter's edge
    const eq = play(n, new Array(n).fill(3), C.makeRng(7000000 + n * 100000 + g), 0);
    if (eq.problem) { fails.push(n + " players, equal game " + g + ": " + eq.problem); continue; }
    eq.s.winners.forEach((w) => { pos[w] += 1 / eq.s.winners.length; });
  }
  lengthOf[n] = (turns / GAMES).toFixed(1) + " turns (" + minT + "-" + maxT + ")";
  const pct = (v) => (100 * v / GAMES).toFixed(1);
  seatLine[n] = seat.map(pct).join("/");
  posLine[n] = pos.map(pct).join("/");
  seat.forEach((v, i) => check(n + " players: seat " + (i + 1) + " " + pct(v) + "% within 5 points of " + (100 / n).toFixed(1), Math.abs(100 * v / GAMES - 100 / n) <= 5));
}
const rate = (l) => perLevel[l][1] ? 100 * perLevel[l][0] / perLevel[l][1] : 0;
console.log("wins per level (games won / games played): " + [1, 2, 3].map((l) => "level " + l + " " + rate(l).toFixed(1) + "% (" + perLevel[l][0] + "/" + perLevel[l][1] + ")").join(", "));
console.log("game length (all turns of all players): " + [2, 3, 4].map((n) => n + " players " + lengthOf[n]).join(", "));
console.log("wins per seat, all level 3, first player by lot (%): " + [2, 3, 4].map((n) => n + " players " + seatLine[n]).join(", "));
console.log("wins per seat, seat 1 always first, all level 3 (%): " + [2, 3, 4].map((n) => n + " players " + posLine[n]).join(", "));
check("level 3 beats level 1", rate(3) > rate(1));

// Fairness of the ridge lengths.
{
  const claims = new Array(C.RIDGES).fill(0);
  let all = 0;
  for (let g = 0; g < FAIR; g++) {
    const n = 2 + (g % 3);
    const levels = [];
    for (let i = 0; i < n; i++) levels.push(1 + ((i + g) % 3));
    const res = play(n, levels, C.makeRng(9000000 + g), "lot");
    if (res.problem) { fails.push("fairness game " + g + ": " + res.problem); continue; }
    res.s.owner.forEach((o, r) => { if (o !== -1) { claims[r]++; all++; } });
  }
  const mean = all / C.RIDGES;
  const share = claims.map((c) => (c / mean).toFixed(2));
  console.log("ridges claimed in " + FAIR + " games (2-4 players, sums " + C.SUMS.map((x) => x.join("/")).join(" | ") + ", lengths " + C.LENGTHS.join(",") + "): " + claims.join(" ") + " (share of the mean " + share.join(" ") + ")");
  claims.forEach((c, r) => check("ridge " + r + " claimed " + c + " times, within 20% of " + mean.toFixed(0), Math.abs(c - mean) <= 0.2 * mean));
}

fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("=== RIDGE ROLL CORE: board, pairs, three climbers, lost turn, stop, ridge end, claimed ridge, win with 2 or 3, save, " + GAMES + " computer games each for 2, 3 and 4 players, " + FAIR + " fairness games, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
