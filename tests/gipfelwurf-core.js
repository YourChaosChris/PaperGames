#!/usr/bin/env node
// Ridge Roll core checks: deterministic rules, save/load, computer balance,
// seat balance and summit frequency. GAMES / FAIR may be set in the
// environment or with --games N / --fair N.
const path = require('path');
const C = require(path.join(__dirname, '..', 'gipfelwurf-core.js'));
const arg = (name) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : undefined; };
const GAMES = parseInt(arg('games') || process.env.GAMES || '500', 10);
const FAIR = parseInt(arg('fair') || process.env.FAIR || '1000', 10);
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const fresh = (n = 2, opts = {}) => C.newGame(Object.assign({ players: n, starter: 0 }, opts));
const pick = (s, ridge, steps) => C.options(s).findIndex((o) => o.ridge === ridge && (steps === undefined || o.steps === steps));
const fixed = (s, dice, ridge, steps) => { const r = C.roll(s, null, dice); return C.choose(r, pick(r, ridge, steps)); };
// Camps worth exactly `pts` points on ridges 2..6 (below their tops), so
// ridges 0 and 1 stay free for the fixed rolls of the tests.
const fill = (pts) => { const c = Array(C.RIDGES).fill(0); for (let r = 2; r < C.RIDGES && pts > 0; r++) { c[r] = Math.min(pts, C.LENGTHS[r] - 1); pts -= c[r]; } return c; };

// Board and exact three-die options.
{
  check('sum groups cover 2..12 once', [].concat(...C.SUMS).sort((a,b)=>a-b).join() === '2,3,4,5,6,7,8,9,10,11,12');
  check('seven ridges and own lengths', C.RIDGES === 7 && C.LENGTHS.length === 7 && C.SUMS.length === 7);
  for (let x = 2; x <= 12; x++) check('ridge mapping ' + x, C.SUMS[C.ridgeOf(x)].includes(x));
  check('steps 1/2/3 and duplicate options once', C.options(C.roll(fresh(), null, [1,2,3])).map((o) => `${o.ridge}:${o.steps}`).join(' ') === '1:1 0:1 0:2');
  check('option step values', C.options(C.roll(fresh(), null, [2,4,6])).some((o) => o.steps === 1) && C.options(C.roll(fresh(), null, [2,4,6])).some((o) => o.steps === 2) && C.options(C.roll(fresh(), null, [2,4,6])).some((o) => o.steps === 3));
  check('HIT exact probabilities', C.HIT.length === 7 && C.HIT.every((x) => x > 0 && x <= 1));
  check('new rules state and legacy rejection', C.isCurrentState(fresh()) && !C.isCurrentState({ game: 'gipfelwurf', n: 2 }));
  const noClimber = fresh(); check('stop requires a climber', C.stop(noClimber) === noClimber);
}

// Fixed turns: choose, single-ridge restriction, miss, hut, crevasse, stop.
{
  let s = fixed(fresh(), [1,2,3], 1, 1);
  check('first roll selects a ridge', s.ridge === 1 && s.climber === 1 && s.phase === 'roll');
  const roll2 = C.roll(s, null, [6,6,6]);
  check('off-ridge options are a miss', roll2.phase === 'lost' && roll2.last.type === 'lost');
  const afterMiss = C.next(roll2);
  check('miss discards progress and advances player', afterMiss.camps[0][1] === 0 && afterMiss.current === 1 && afterMiss.turns === 1);

  let hut = fresh();
  hut = fixed(hut, [6,2,3], 1, 3); // first climb
  const needCrevasse = C.CREVASSES[1] - hut.climber;
  const crevasseDice = needCrevasse === 2 ? [4,2,3] : [6,2,3];
  hut = fixed(hut, crevasseDice, 1, needCrevasse);
  check('crevasse slides back two, hut remains reached', hut.climber === Math.max(0, C.CREVASSES[1] - 2) && hut.hutReached && hut.last.type === 'crevasse');
  const miss = C.next(C.roll(hut, null, [6,6,6]));
  check('hut rescues miss at hut height', miss.camps[0][1] === C.HUTS[1]);

  let fromCamp = fresh();
  fromCamp.camps[0][1] = C.CREVASSES[1] - 1;
  fromCamp = fixed(fromCamp, [1,2,3], 1, 1); // reaches crevasse, but cannot slide below camp
  check('crevasse never slides below camp', fromCamp.climber === fromCamp.camps[0][1] && fromCamp.last.type === 'crevasse');
  const secured = C.stop(fixed(fresh(), [1,2,3], 0, 2));
  check('stop secures height and advances', secured.camps[0][0] === 2 && secured.current === 1 && secured.turns === 1 && secured.last.type === 'stop');
}

// Summit bonuses and open/closed-to-self rule.
{
  let s = fresh();
  s.camps[0][1] = C.LENGTHS[1] - 3;
  s = C.stop(fixed(s, [6,2,3], 1, 3));
  check('first summit gets six points', s.camps[0][1] === C.LENGTHS[1] && s.bonus[0] === 6 && s.summitFirst[1] === 0 && s.last.type === 'summit');
  let r = C.roll(s, null, [6,2,3]);
  check('summit stays open to others', r.phase === 'choose' && C.options(r).some((o) => o.ridge === 1));
  let t = fresh(); t.summitFirst[1] = 0; t.camps[0][1] = C.LENGTHS[1]; t.current = 0;
  const blocked = C.roll(t, null, [6,2,3]);
  check('summit player cannot choose own summit', !C.options(blocked).some((o) => o.ridge === 1));
  let later = fresh(); later.current = 1; later.camps[1][1] = C.LENGTHS[1] - 3; later.summitFirst[1] = 0;
  const final = C.stop(fixed(later, [6,2,3], 1, 3));
  check('later summit gets three points', final.bonus[1] === 3);
}

// Full round before game end, ties, and JSON save/load.
{
  let s = fresh(2, { target: 30 });
  s.camps[0] = fill(30);
  s = C.stop(fixed(s, [1,2,3], 1, 1));
  check('target waits for the rest of the round', s.phase === 'roll' && s.current === 1);
  s = C.stop(fixed(s, [1,2,3], 1, 1));
  check('game ends after equal turns', s.phase === 'over' && s.turns === 2 && s.winners.join() === '0');
  let tie = fresh(2, { target: 30 });
  tie.camps[0] = fill(30); tie.camps[1] = fill(30);
  tie = C.stop(fixed(tie, [1,2,3], 1, 1)); tie = C.stop(fixed(tie, [1,2,3], 1, 1));
  check('equal points share the win', tie.winners.join() === '0,1' && C.outcomeFor(tie, 0) === 'draw');
  let save = fixed(fresh(), [1,2,3], 1, 1); save = C.roll(save, null, [1,2,3]);
  const loaded = JSON.parse(JSON.stringify(save));
  check('JSON save resumes identically', JSON.stringify(C.choose(save, 0)) === JSON.stringify(C.choose(loaded, 0)));
  check('starter lot', [0,1,2,3,4,5,6].map((i) => C.newGame({ players: 4, starter: 'lot' }, C.makeRng(i)).starter).some((x) => x !== 0));
}

function play(n, levels, rng, starter, target = 30) {
  let s = C.newGame({ players: n, computer: Array(n).fill(true), levels, target, starter }, rng), guard = 0;
  while (s.phase !== 'over' && guard++ < 20000) {
    const before = s; s = C.aiStep(s, rng);
    if (s === before) return { problem: 'stuck in ' + s.phase };
    if (s.ridge !== null && (s.climber < s.camps[s.current][s.ridge] || s.climber > C.LENGTHS[s.ridge])) return { problem: 'invalid climber height' };
    for (let p = 0; p < n; p++) for (let r = 0; r < C.RIDGES; r++) if (s.camps[p][r] > C.LENGTHS[r]) return { problem: 'beyond summit' };
  }
  return s.phase === 'over' ? { s } : { problem: 'no end' };
}
const perLevel = {1:[0,0],2:[0,0],3:[0,0]}, lenLines = {}, seatLines = {}, fixedLines = {};
for (const n of [2,3,4]) {
  let turns = 0, min = Infinity, max = 0; const seats = Array(n).fill(0), fixed = Array(n).fill(0);
  for (let g = 0; g < GAMES; g++) {
    const levels = Array.from({ length:n }, (_,i) => 1 + ((i + g) % 3));
    const res = play(n, levels, C.makeRng(n * 100000 + g), 'lot');
    if (res.problem) { fails.push(`${n} players game ${g}: ${res.problem}`); continue; }
    const s = res.s; turns += s.turns / n; min = Math.min(min, s.turns / n); max = Math.max(max, s.turns / n);
    for (let p = 0; p < n; p++) { perLevel[levels[p]][1]++; if (s.winners.length === 1 && s.winners[0] === p) perLevel[levels[p]][0]++; }
    const lot = play(n, Array(n).fill(3), C.makeRng(5000000 + n * 100000 + g), 'lot');
    if (lot.problem) { fails.push(`${n} player seat game ${g}: ${lot.problem}`); continue; }
    lot.s.winners.forEach((p) => { seats[p] += 1 / lot.s.winners.length; });
    const eq = play(n, Array(n).fill(3), C.makeRng(7000000 + n * 100000 + g), 0);
    if (eq.problem) { fails.push(`${n} player fixed starter game ${g}: ${eq.problem}`); continue; }
    eq.s.winners.forEach((p) => { fixed[p] += 1 / eq.s.winners.length; });
  }
  const pct = (x) => (100*x/GAMES).toFixed(1);
  lenLines[n] = `${n} players ${ (turns/GAMES).toFixed(1)} turns (${min}-${max})`;
  seatLines[n] = `${n} players ${seats.map(pct).join('/')}`; fixedLines[n] = `${n} players ${fixed.map(pct).join('/')}`;
  seats.forEach((x,p) => check(`${n} player seat ${p+1} within 5 points`, Math.abs(100*x/GAMES - 100/n) <= 5));
}
const rate = (l) => perLevel[l][1] ? 100*perLevel[l][0]/perLevel[l][1] : 0;
console.log('wins per level (sole wins / games played): ' + [1,2,3].map((l) => `level ${l} ${rate(l).toFixed(1)}% (${perLevel[l][0]}/${perLevel[l][1]})`).join(', '));
console.log('game length (turns per player, min-max): ' + [2,3,4].map((n) => lenLines[n]).join(', '));
console.log('wins per seat, level 3, starter by lot (%): ' + [2,3,4].map((n) => seatLines[n]).join(', '));
console.log('wins per seat, fixed beginner, level 3 (%): ' + [2,3,4].map((n) => fixedLines[n]).join(', '));
check('level 3 clearly beats level 1', rate(3) > rate(1) + 4);

// Fairness of ridges: tally ridges first summited in mixed-level games.
{
  const claims = Array(C.RIDGES).fill(0); let all = 0;
  for (let g = 0; g < FAIR; g++) {
    const n = 2 + (g % 3), levels = Array.from({ length:n }, (_,i) => 1 + ((i + g) % 3));
    const res = play(n, levels, C.makeRng(9000000 + g), 'lot', 45);
    if (res.problem) { fails.push(`fairness game ${g}: ${res.problem}`); continue; }
    res.s.summitFirst.forEach((p, r) => { if (p !== -1) { claims[r]++; all++; } });
  }
  const mean = all / C.RIDGES, shares = claims.map((x) => (x/mean).toFixed(2));
  console.log(`ridges summited in ${FAIR} games (lengths ${C.LENGTHS.join(',')}): ${claims.join(' ')} (share of mean ${shares.join(' ')})`);
  claims.forEach((x,r) => check(`ridge ${r} within 20 percent of mean`, Math.abs(x-mean) <= .2*mean));
}
fails.slice(0, 20).forEach((x) => console.log('FAIL ' + x));
console.log(`=== RIDGE ROLL CORE: deterministic rules, hut/crevasse/summits, full-round end, ties, save/load, ${GAMES} computer games each for 2/3/4 players, ${FAIR} fairness games, ${fails.length} failure(s) ===`);
process.exit(fails.length ? 1 : 0);
