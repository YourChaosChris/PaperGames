// gipfelwurf-core.js
// Rules of "Gipfelwurf" (en "Ridge Roll"), a push-your-luck dice game made
// for PaperGames (task 131), without any DOM or browser feature.
//
// The board has SEVEN ridges for the sums of two dice: the outer ridges
// take three sums each (2, 3, 4 and 10, 11, 12), the five ridges between
// them one sum each (5, 6, 7, 8, 9). So every ridge is hit about equally
// often by a pair of dice (6, 4, 5, 6, 5, 4 and 6 of 36). The lengths
// (LENGTHS: 11, 8, 10, 11, 10, 8, 11 steps) were set by measurement so that
// every ridge is claimed about equally often in computer games (see
// tests/gipfelwurf-core.js, fairness).
//
// A turn: roll four dice and split them into two pairs. Each pair sum moves
// a climber one step up its ridge (two steps when both pairs belong to the
// same ridge). At most three climbers are on the board per turn; a ridge
// that already has a climber of this turn uses it again. If neither sum of
// any split can be used, the turn is lost and all climbing of the turn is
// gone. After every successful roll the player may stop: the climbers'
// heights are kept as the player's camps. A camp at the top claims the
// ridge: it is closed for everybody, the other players' camps on it are
// removed. Whoever claims NEED ridges (3, or 2, chosen before the game)
// wins at once. When every ridge is claimed and nobody has NEED of them,
// the most ridges win; players level on that win together.
//
// Using a split: if both sums can be used one after the other, both are
// used; if only one of them can be used, that one; if each can be used but
// not both (no climber left, or one step left at the top), the player picks
// one of them.
//
// The first player is drawn by lot (option starter "lot"; measured: with
// a fixed first player, that player wins more than 5 points above the
// fair share).
//
// The computer (levels 1 to 3) follows simple risk rules: level 1 takes
// the split with the most steps and stops after three good rolls; levels
// 2 and 3 prefer ridges they already climb and short ways to the top, and stop when the
// climbing of the turn is worth more than the risk to lose it (level 3
// uses the exact chance to lose the turn with the next roll).
//
// The state is a plain serialisable object; every function returns a new
// state, or the very same object when the action is not allowed.

const GipfelwurfCore = (() => {
  const RIDGES = 7;
  const SUMS = [[2, 3, 4], [5], [6], [7], [8], [9], [10, 11, 12]];
  const LENGTHS = [11, 8, 10, 11, 10, 8, 11];
  const MAX_CLIMBERS = 3;
  const NEEDS = [2, 3];

  function ridgeOf(sum) {
    if (sum <= 4) return 0;
    if (sum >= 10) return 6;
    return sum - 4;
  }

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The three ways to split four dice into two pairs: the pair sums.
  function splits(dice) {
    const [a, b, c, d] = dice;
    return [[a + b, c + d], [a + c, b + d], [a + d, b + c]];
  }

  // Chance to lose the turn for every set of usable ridges (bit mask):
  // the share of the 1296 rolls in which no pair sum hits a usable ridge.
  const BUST = (() => {
    const hits = [];
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) for (let d = 1; d <= 6; d++) {
      let m = 0;
      splits([a, b, c, d]).forEach(([x, y]) => { m |= (1 << ridgeOf(x)) | (1 << ridgeOf(y)); });
      hits.push(m);
    }
    const out = [];
    for (let mask = 0; mask < (1 << RIDGES); mask++) out.push(hits.filter((h) => !(h & mask)).length / hits.length);
    return out;
  })();

  // opts: { players: 2..4, computer: [bool...], levels: [1..3...], need: 2|3, starter }
  function newGame(opts, rng) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    // starter: a seat number, or "lot" (drawn with rng)
    let starter = Number.isInteger(o.starter) && o.starter >= 0 && o.starter < n ? o.starter : 0;
    if (o.starter === "lot") starter = Math.floor((rng || Math.random)() * n);
    const s = {
      game: "gipfelwurf",
      n,
      computer: [],
      levels: [],
      need: NEEDS.indexOf(o.need) !== -1 ? o.need : 3,
      camps: [],              // camps[p][r]: secured height of player p on ridge r (0 = foot)
      owner: [],              // owner[r]: player who claimed ridge r, or -1
      climbers: [],           // climbers[r]: height of this turn's climber on ridge r, or null
      dice: null,             // the last roll (four numbers), or null
      phase: "roll",          // "roll" | "choose" | "lost" | "over"
      current: starter,
      starter,
      turns: 0,               // finished turns
      rolls: 0,               // good rolls in this turn
      winners: null,
      last: null,             // the last thing that happened (for the screen)
      seq: 0
    };
    for (let i = 0; i < n; i++) {
      s.computer.push(!!(o.computer && o.computer[i]));
      s.levels.push(o.levels && o.levels[i] ? o.levels[i] : 2);
      const c = [];
      for (let r = 0; r < RIDGES; r++) c.push(0);
      s.camps.push(c);
    }
    for (let r = 0; r < RIDGES; r++) { s.owner.push(-1); s.climbers.push(null); }
    return s;
  }

  function note(s, what) {
    s.seq += 1;
    s.last = Object.assign({ seq: s.seq, player: s.current }, what);
  }

  function climberCount(s) {
    return s.climbers.filter((h) => h !== null).length;
  }

  // Height on ridge r for the player to move (climber, else camp).
  function heightOf(s, r) {
    return s.climbers[r] !== null ? s.climbers[r] : s.camps[s.current][r];
  }

  // One step on ridge r into the climbers list cl (changed in place);
  // false when it is not allowed.
  function stepOn(s, cl, r) {
    if (s.owner[r] !== -1) return false;
    if (cl[r] === null && cl.filter((h) => h !== null).length >= MAX_CLIMBERS) return false;
    const h = cl[r] !== null ? cl[r] : s.camps[s.current][r];
    if (h >= LENGTHS[r]) return false;
    cl[r] = h + 1;
    return true;
  }

  // Ridges a climber of the player to move can still go up on (bit mask).
  function usableMask(s) {
    let m = 0;
    const full = climberCount(s) >= MAX_CLIMBERS;
    for (let r = 0; r < RIDGES; r++) {
      if (s.owner[r] !== -1 || heightOf(s, r) >= LENGTHS[r]) continue;
      if (full && s.climbers[r] === null) continue;
      m |= 1 << r;
    }
    return m;
  }

  // Chance that the next roll loses the turn.
  function bustChance(s) {
    return BUST[usableMask(s)];
  }

  // What the player can do with the dice: a list of { sums, ridges }.
  function options(s) {
    if (!s.dice || s.phase !== "choose") return [];
    const out = [], seen = {};
    const add = (sums) => {
      const key = sums.slice().sort((a, b) => a - b).join("+");
      if (seen[key]) return;
      seen[key] = true;
      out.push({ sums: sums.slice(), ridges: sums.map(ridgeOf) });
    };
    splits(s.dice).forEach(([x, y]) => {
      const both = s.climbers.slice();
      if (stepOn(s, both, ridgeOf(x)) && stepOn(s, both, ridgeOf(y))) { add([x, y]); return; }
      if (stepOn(s, s.climbers.slice(), ridgeOf(x))) add([x]);
      if (stepOn(s, s.climbers.slice(), ridgeOf(y))) add([y]);
    });
    return out;
  }

  // Roll the four dice. dice: fixed numbers (tests), else from rng.
  function roll(s0, rng, dice) {
    if (s0.phase !== "roll") return s0;
    const s = clone(s0);
    const r = rng || Math.random;
    s.dice = dice ? dice.slice(0, 4) : [0, 0, 0, 0].map(() => 1 + Math.floor(r() * 6));
    s.phase = "choose";
    if (!options(s).length) {
      const lost = [];
      s.climbers.forEach((h, k) => { if (h !== null) lost.push(k); });
      s.phase = "lost";
      note(s, { type: "lost", dice: s.dice.slice(), lost });
      return s;
    }
    note(s, { type: "roll", dice: s.dice.slice() });
    return s;
  }

  // Use option k of options(s).
  function choose(s0, k) {
    const list = options(s0);
    if (!list[k]) return s0;
    const s = clone(s0);
    list[k].ridges.forEach((r) => { stepOn(s, s.climbers, r); });
    s.phase = "roll";
    s.rolls += 1;
    note(s, { type: "climb", dice: s.dice.slice(), sums: list[k].sums.slice(), ridges: list[k].ridges.slice() });
    return s;
  }

  function summitsOf(s, p) {
    return s.owner.filter((o) => o === p).length;
  }

  function nextTurn(s) {
    for (let r = 0; r < RIDGES; r++) s.climbers[r] = null;
    s.turns += 1;
    s.rolls = 0;
    s.current = (s.current + 1) % s.n;
    s.phase = "roll";
  }

  function checkEnd(s) {
    const p = s.current;
    if (summitsOf(s, p) >= s.need) { s.winners = [p]; s.phase = "over"; return true; }
    if (s.owner.every((o) => o !== -1)) {
      let best = 0;
      for (let i = 0; i < s.n; i++) best = Math.max(best, summitsOf(s, i));
      s.winners = [];
      for (let i = 0; i < s.n; i++) if (summitsOf(s, i) === best) s.winners.push(i);
      s.phase = "over";
      return true;
    }
    return false;
  }

  // Stop and keep the climbing of the turn as camps.
  function stop(s0) {
    if (s0.phase !== "roll" || !s0.climbers.some((h) => h !== null)) return s0;
    const s = clone(s0);
    const p = s.current, claimed = [];
    s.climbers.forEach((h, r) => {
      if (h === null) return;
      s.camps[p][r] = h;
      if (h >= LENGTHS[r]) {
        s.owner[r] = p;
        claimed.push(r);
        for (let q = 0; q < s.n; q++) if (q !== p) s.camps[q][r] = 0;
      }
    });
    note(s, { type: "stop", claimed, ridges: s.climbers.map((h, r) => h !== null ? r : -1).filter((r) => r >= 0) });
    for (let r = 0; r < RIDGES; r++) s.climbers[r] = null;
    if (checkEnd(s)) {
      s.turns += 1;
      s.dice = null;
      note(s, { type: "gameover", claimed });
      return s;
    }
    nextTurn(s);
    s.dice = null;
    return s;
  }

  // After a lost turn: the next player.
  function next(s0) {
    if (s0.phase !== "lost") return s0;
    const s = clone(s0);
    nextTurn(s);
    s.dice = null;
    return s;
  }

  // ---- Computer ----

  // Worth of the climbing of this turn: steps as a share of the ridge,
  // a whole ridge more for reaching the top.
  function turnWorth(s) {
    let w = 0;
    s.climbers.forEach((h, r) => {
      if (h === null) return;
      w += (h - s.camps[s.current][r]) / LENGTHS[r];
      if (h >= LENGTHS[r]) w += 1;
    });
    return w;
  }

  function reachedTop(s) {
    return s.climbers.some((h, r) => h !== null && h >= LENGTHS[r]);
  }

  // Would stopping now win the game?
  function stopWins(s) {
    const p = s.current;
    let n = summitsOf(s, p);
    s.climbers.forEach((h, r) => { if (h !== null && h >= LENGTHS[r]) n += 1; });
    return n >= s.need;
  }

  function wantsToStop(s) {
    if (s.phase !== "roll" || !s.climbers.some((h) => h !== null)) return false;
    const lv = s.levels[s.current] || 2;
    if (lv === 1) return s.rolls >= 3 || reachedTop(s);
    if (stopWins(s)) return true;
    const risk = bustChance(s);
    if (risk === 1) return true;
    const worth = turnWorth(s);
    if (lv === 2) {
      if (reachedTop(s) && climberCount(s) >= MAX_CLIMBERS) return true;
      return worth >= (climberCount(s) < MAX_CLIMBERS ? 0.9 : 0.55);
    }
    // level 3: what one more roll may bring against what it may cost
    return worth * risk > (1 - risk) * 0.17;
  }

  // Score of an option for levels 2 and 3.
  function optionScore(s, opt, lv) {
    const cl = s.climbers.slice();
    let score = 0;
    opt.ridges.forEach((r) => {
      const isNew = cl[r] === null;
      const before = cl[r] !== null ? cl[r] : s.camps[s.current][r];
      if (!stepOn(s, cl, r)) return;
      score += 1 / LENGTHS[r];
      if (cl[r] >= LENGTHS[r]) score += 0.6;
      if (isNew) score -= lv >= 3 ? 0.22 : 0.12;
      if (lv >= 3) score += 0.25 * before / LENGTHS[r];
    });
    if (lv >= 3) {
      const t = Object.assign({}, s, { climbers: cl });
      score -= 0.6 * BUST[usableMask(t)];
    }
    return score;
  }

  function chooseOption(s, rng) {
    const list = options(s);
    const lv = s.levels[s.current] || 2;
    if (lv === 1) {
      // the first split with the most steps (fewest new climbers on a tie)
      let pick = 0, top = -Infinity;
      list.forEach((o, k) => {
        const fresh = o.ridges.filter((r, i) => s.climbers[r] === null && o.ridges.indexOf(r) === i).length;
        const v = o.ridges.length * 2 - fresh;
        if (v > top) { top = v; pick = k; }
      });
      return pick;
    }
    let best = 0, bestScore = -Infinity;
    list.forEach((o, k) => {
      const sc = optionScore(s, o, lv);
      if (sc > bestScore) { bestScore = sc; best = k; }
    });
    return best;
  }

  // One step of the computer whose turn it is.
  function aiStep(s, rng) {
    if (s.phase === "lost") return next(s);
    if (s.phase === "choose") return choose(s, chooseOption(s, rng));
    if (s.phase !== "roll") return s;
    return wantsToStop(s) ? stop(s) : roll(s, rng);
  }

  function outcomeFor(s, p) {
    if (s.phase !== "over") return null;
    if (s.winners.indexOf(p) === -1) return "loss";
    return s.winners.length > 1 ? "draw" : "win";
  }

  return { RIDGES, SUMS, LENGTHS, MAX_CLIMBERS, NEEDS, BUST, ridgeOf, splits, makeRng, newGame, roll, options, choose, stop, next, summitsOf, climberCount, bustChance, turnWorth, wantsToStop, chooseOption, aiStep, outcomeFor };
})();

if (typeof module !== "undefined") module.exports = GipfelwurfCore;
if (typeof window !== "undefined") window.GipfelwurfCore = GipfelwurfCore;
