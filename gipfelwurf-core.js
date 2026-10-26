// gipfelwurf-core.js
// Rules of "Gipfelwurf" (en "Ridge Roll"), a push-your-luck dice game made
// for PaperGames (task 131; own rules since task 136), without any DOM or
// browser feature. States of the first rules (no `rules: 2`) are not loaded.
//
// The board has seven ridges for sums of two dice: 2/3/4, 5, 6, 7, 8, 9 and
// 10/11/12 (LENGTHS 15, 8, 9, 10, 7, 6, 6 steps; every ridge has a hut and a
// crevasse, HUTS and CREVASSES). The low ridges are longer: their two dice
// are small, so the third die - the step die - tends to be big.
//
// A turn: roll three dice. Every die can be the step die (1-2: one step,
// 3-4: two, 5-6: three) while the other two give the ridge by their sum. On
// the first roll the player picks any of these options on a ridge whose top
// they have not reached; after that the turn stays on that ridge, and a
// roll with no option on it is a miss: the climbing of the turn is lost -
// except that a climber who reached the hut in this turn keeps the hut.
// Landing exactly on the crevasse slides the climber two steps back (never
// below the camp). After every good roll the player may stop: the height
// becomes the camp. The first player at a top gets SUMMIT_FIRST points,
// later ones SUMMIT_LATER; a ridge never closes for the others.
// Points: the heights of all camps plus the summit points. When somebody
// reaches the target (30 or 45), the round is played to the end (everybody
// had the same number of turns); the most points win, a tie lets all of
// them win. The first player is drawn by lot.
//
// The computer: level 1 takes the most steps and stops after two good
// rolls; level 2 and 3 compare the expected points of one more roll with
// stopping now (exact chances per ridge in STEPS), level 2 more cautiously,
// level 3 also weighs the summit points when it picks a ridge.
//
// The state is plain JSON; every action returns a new state, or the very
// same object when it is not allowed.

const GipfelwurfCore = (() => {
  const RIDGES = 7;
  const SUMS = [[2, 3, 4], [5], [6], [7], [8], [9], [10, 11, 12]];
  // Lengths, huts and crevasses set by measurement (tests/gipfelwurf-core.js,
  // fairness): the low ridges take the two small dice, so their step die is
  // the big one and they climb faster - they are longer.
  const LENGTHS = [15, 8, 9, 10, 7, 6, 6];
  const HUTS = [7, 4, 4, 5, 3, 3, 2];
  const CREVASSES = [11, 6, 7, 8, 5, 4, 5];
  const TARGETS = [30, 45];
  const SUMMIT_FIRST = 6;
  const SUMMIT_LATER = 3;
  const LEVELS = [1, 2, 3];

  function ridgeOf(sum) {
    if (sum <= 4) return 0;
    if (sum >= 10) return 6;
    return sum - 4;
  }
  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const HIT = (() => {
    const counts = new Array(RIDGES).fill(0);
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) {
      const hit = new Set();
      [a, b, c].forEach((d, i) => hit.add(ridgeOf([a, b, c].filter((_, j) => j !== i).reduce((x, y) => x + y, 0))));
      hit.forEach((r) => counts[r]++);
    }
    return counts.map((x) => x / 216);
  })();
  function stepsOf(die) { return die <= 2 ? 1 : die <= 4 ? 2 : 3; }
  // done[r]: the player is already at the top of ridge r (cannot choose it).
  function optionsForDice(dice, ridge, done) {
    const out = [], seen = new Set();
    for (let i = 0; i < 3; i++) {
      const sum = dice[(i + 1) % 3] + dice[(i + 2) % 3];
      const r = ridgeOf(sum), steps = stepsOf(dice[i]);
      if (ridge !== null && r !== ridge) continue;
      if (ridge === null && done && done[r]) continue;
      const key = r + ':' + steps;
      if (seen.has(key)) continue;
      seen.add(key); out.push({ ridge: r, steps, die: i });
    }
    return out;
  }
  function newGame(opts, rng) {
    const o = opts || {}, n = Math.max(2, Math.min(4, Number.isInteger(o.players) ? o.players : 2));
    const starter = o.starter === 'lot' ? Math.floor((rng || Math.random)() * n) : Number.isInteger(o.starter) && o.starter >= 0 && o.starter < n ? o.starter : 0;
    return {
      game: 'gipfelwurf', rules: 2, n,
      computer: Array.from({ length: n }, (_, p) => !!(o.computer && o.computer[p])),
      levels: Array.from({ length: n }, (_, p) => LEVELS.includes(o.levels && o.levels[p]) ? o.levels[p] : 2),
      target: TARGETS.includes(o.target) ? o.target : TARGETS[0],
      camps: Array.from({ length: n }, () => new Array(RIDGES).fill(0)),
      bonus: new Array(n).fill(0), summitFirst: new Array(RIDGES).fill(-1),
      ridge: null, climber: null, hutReached: false, dice: null,
      phase: 'roll', current: starter, starter, turns: 0, rolls: 0,
      winners: null, last: null, seq: 0
    };
  }
  function isCurrentState(s) {
    return !!s && s.game === 'gipfelwurf' && s.rules === 2 && Number.isInteger(s.n) && s.n >= 2 && s.n <= 4 &&
      Array.isArray(s.camps) && s.camps.length === s.n && s.camps.every((x) => Array.isArray(x) && x.length === RIDGES && x.every(Number.isFinite)) &&
      Array.isArray(s.bonus) && s.bonus.length === s.n && Array.isArray(s.summitFirst) && s.summitFirst.length === RIDGES &&
      ['roll', 'choose', 'lost', 'over'].includes(s.phase) && Number.isInteger(s.current) && s.current >= 0 && s.current < s.n &&
      Number.isInteger(s.target) && TARGETS.includes(s.target) && Number.isInteger(s.turns) && Number.isInteger(s.seq);
  }
  function note(s, type, extra) { s.seq++; s.last = Object.assign({ seq: s.seq, type, player: s.current }, extra || {}); }
  function options(s) {
    if (s.phase !== 'choose' || !Array.isArray(s.dice)) return [];
    const done = s.camps[s.current].map((h, r) => h >= LENGTHS[r]);
    return optionsForDice(s.dice, s.ridge, done);
  }
  function roll(s0, rng, dice) {
    if (s0.phase !== 'roll') return s0;
    const s = clone(s0), r = rng || Math.random;
    s.dice = dice ? dice.slice(0, 3) : [0, 0, 0].map(() => 1 + Math.floor(r() * 6));
    s.phase = 'choose';
    if (!options(s).length) { s.phase = 'lost'; note(s, 'lost', { dice: s.dice.slice() }); }
    else note(s, 'roll', { dice: s.dice.slice() });
    return s;
  }
  function choose(s0, k) {
    const list = options(s0), op = list[k];
    if (!op) return s0;
    const s = clone(s0), p = s.current, r = op.ridge;
    if (s.ridge === null) { s.ridge = r; s.climber = s.camps[p][r]; }
    const from = s.climber;
    const raw = Math.min(LENGTHS[r], from + op.steps);
    let to = raw, crevasse = to === CREVASSES[r];
    if (s.camps[p][r] < HUTS[r] && raw >= HUTS[r]) s.hutReached = true;
    if (crevasse) to = Math.max(s.camps[p][r], to - 2);
    s.climber = to; s.phase = 'roll'; s.rolls++;
    note(s, crevasse ? 'crevasse' : 'climb', { ridge: r, from, to, steps: op.steps, die: op.die });
    return s;
  }
  function pointsOf(s, p) { return s.camps[p].reduce((a, b) => a + b, 0) + s.bonus[p]; }
  function stop(s0) {
    if (s0.phase !== 'roll' || s0.climber === null) return s0;
    const s = clone(s0), p = s.current, r = s.ridge;
    s.camps[p][r] = s.climber;
    let summit = false;
    if (s.climber >= LENGTHS[r] && s.summitFirst[r] === -1) {
      summit = true; s.summitFirst[r] = p;
      s.bonus[p] += SUMMIT_FIRST;
    } else if (s.climber >= LENGTHS[r]) {
      // A later player to the same summit also earns the later bonus once.
      s.bonus[p] += SUMMIT_LATER;
    }
    note(s, summit || s.climber >= LENGTHS[r] ? 'summit' : 'stop', { ridge: r, height: s.climber });
    s.ridge = null; s.climber = null; s.hutReached = false; s.dice = null;
    finishTurn(s);
    return s;
  }
  function finishTurn(s) {
    s.turns++; s.rolls = 0;
    s.current = (s.current + 1) % s.n; s.phase = 'roll';
    if (s.current === s.starter && s.turns >= s.n && s.camps.some((_, p) => pointsOf(s, p) >= s.target)) {
      let best = -Infinity;
      for (let p = 0; p < s.n; p++) best = Math.max(best, pointsOf(s, p));
      s.winners = Array.from({ length: s.n }, (_, p) => p).filter((p) => pointsOf(s, p) === best);
      s.phase = 'over'; note(s, 'gameover', { winners: s.winners.slice() });
    }
  }
  function next(s0) {
    if (s0.phase !== 'lost') return s0;
    const s = clone(s0), p = s.current, r = s.ridge;
    if (r !== null && s.hutReached) { s.camps[p][r] = Math.max(s.camps[p][r], HUTS[r]); note(s, 'hut', { ridge: r, height: s.camps[p][r] }); }
    else note(s, 'lost', { ridge: r, dice: s.dice ? s.dice.slice() : null });
    s.ridge = null; s.climber = null; s.hutReached = false; s.dice = null;
    finishTurn(s); return s;
  }
  function outcomeFor(s, p) { return s.winners && s.winners.includes(p) ? (s.winners.length === 1 ? 'win' : 'draw') : 'loss'; }
  // STEPS[r][k]: chance that a roll hits ridge r with k steps at most
  // (k = 1..3; the best option of the roll counts), STEPS[r][0] = miss.
  const STEPS = (() => {
    const t = Array.from({ length: RIDGES }, () => [0, 0, 0, 0]);
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) {
      const best = new Array(RIDGES).fill(0);
      optionsForDice([a, b, c], null, null).forEach((o) => { best[o.ridge] = Math.max(best[o.ridge], o.steps); });
      best.forEach((k, r) => { t[r][k] += 1 / 216; });
    }
    return t;
  })();
  // Height after climbing k steps from h on ridge r (crevasse included).
  function landing(r, h, k, camp) {
    const to = Math.min(LENGTHS[r], h + k);
    return to === CREVASSES[r] ? Math.max(camp, to - 2) : to;
  }
  function summitBonus(s, r) { return s.summitFirst[r] === -1 ? SUMMIT_FIRST : SUMMIT_LATER; }
  // Points the turn would bring if the player stopped at height h.
  function stopValue(s, r, h) { return h - s.camps[s.current][r] + (h >= LENGTHS[r] ? summitBonus(s, r) : 0); }
  // Level 3: roll on while one more roll is worth more than stopping now.
  function rollOnPays(s, caution) {
    const r = s.ridge, p = s.current, camp = s.camps[p][r], h = s.climber;
    const floor = s.hutReached || (camp < HUTS[r] && h >= HUTS[r]) ? Math.max(camp, HUTS[r]) : camp;
    let ev = STEPS[r][0] * (floor - camp);
    for (let k = 1; k <= 3; k++) ev += STEPS[r][k] * stopValue(s, r, landing(r, h, k, camp));
    const now = stopValue(s, r, h);
    // Close to the target a sure point is worth a little more.
    const careful = (caution || 1) * (pointsOf(s, p) + now >= s.target ? 1.25 : 1);
    return ev > now * careful;
  }
  function chooseIndex(s, ops, level, rand) {
    const p = s.current;
    let score;
    if (level === 1) score = (o) => o.steps;
    else if (s.ridge !== null) score = (o) => landing(o.ridge, s.climber, o.steps, s.camps[p][o.ridge]);
    else if (level === 2) score = (o) => o.steps + 3 * HIT[o.ridge];
    else score = (o) => {
      const r = o.ridge, camp = s.camps[p][r], to = landing(r, camp, o.steps, camp);
      const left = LENGTHS[r] - to;
      return (to - camp) + 6 * HIT[r] + (left <= 3 ? summitBonus(s, r) * HIT[r] : 0);
    };
    const scores = ops.map(score), best = Math.max(...scores);
    const ties = scores.map((x, i) => (x === best ? i : -1)).filter((i) => i >= 0);
    return ties[Math.floor(rand() * ties.length)];
  }
  function aiStep(s, rng) {
    if (!s.computer[s.current] || s.phase === 'over') return s;
    if (s.phase === 'lost') return next(s);
    const level = s.levels[s.current];
    if (s.phase === 'choose') return choose(s, chooseIndex(s, options(s), level, rng || Math.random));
    if (s.phase === 'roll') {
      let stopNow = false;
      if (s.climber !== null) {
        const r = s.ridge, progress = s.climber - s.camps[s.current][r];
        if (s.climber >= LENGTHS[r]) stopNow = true;
        else if (level === 1) stopNow = s.rolls >= 2;
        else if (level === 2) stopNow = progress >= 5 || !rollOnPays(s, 1.5);
        else stopNow = !rollOnPays(s);
      }
      return stopNow ? stop(s) : roll(s, rng);
    }
    return s;
  }
  return { RIDGES, SUMS, LENGTHS, HUTS, CREVASSES, TARGETS, SUMMIT_FIRST, SUMMIT_LATER, HIT, LEVELS, makeRng, ridgeOf, newGame, options, roll, choose, stop, next, pointsOf, aiStep, outcomeFor, isCurrentState };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = GipfelwurfCore;
if (typeof window !== 'undefined') window.GipfelwurfCore = GipfelwurfCore;
