// klappenkasten-core.js
// Rules of Klappenkasten (a traditional "shut the box" dice game), without
// any DOM or browser feature.
//
// Flaps 1 to 9 (variant: 1 to 12) are open at the start of every turn.
// Roll two dice and close one or more open flaps whose numbers add up to
// the roll. Once flap 7 and every higher flap is closed, you may roll one
// die instead of two. Roll again after every closing. When no flap fits
// the roll the turn ends and the numbers of the flaps still open are the
// points of the turn. The fewest points over all rounds win. Closing every
// flap ("box shut") wins the game at once.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const KlappenkastenCore = (() => {
  const DEFAULT_SIZE = 9;

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function range(size) {
    const out = [];
    for (let i = 1; i <= size; i++) out.push(i);
    return out;
  }

  function sum(list) {
    return list.reduce((a, b) => a + b, 0);
  }

  function die(rng) {
    return 1 + Math.floor((rng || Math.random)() * 6);
  }

  // opts: { players: 2..4, computer: [bool, ...], size: 9 | 12, rounds: 1 | 3 | 5 }
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const size = o.size === 12 ? 12 : DEFAULT_SIZE;
    const rounds = [1, 3, 5].indexOf(o.rounds) >= 0 ? o.rounds : 3;
    const computer = [];
    for (let i = 0; i < n; i++) computer.push(!!(o.computer && o.computer[i]));
    const scores = [];
    for (let i = 0; i < n; i++) scores.push([]);
    return {
      game: "klappenkasten",
      n: n,
      size: size,
      rounds: rounds,
      computer: computer,
      round: 1,
      current: 0,
      open: range(size),
      dice: [],
      phase: "roll",          // "roll" | "close" | "over"
      scores: scores,         // scores[player][round - 1]
      turns: 0,               // turns played so far in the game
      winner: null,           // player index, -1 for a draw, null while playing
      boxShut: false,         // the winner closed every flap
      last: null,             // the turn that ended last, see endTurn()
      seq: 0,                 // counts the turns that ended (tells a new `last` from an old one)
      turnClosed: []          // flaps closed in the running turn
    };
  }

  // One die may be rolled once flap 7 and every higher flap are closed.
  function canOneDie(s) {
    return s.phase === "roll" && !s.open.some((n) => n >= 7);
  }

  // Every set of open flaps that adds up to the dice (each set sorted up).
  function choices(s) {
    if (s.phase !== "close" || !s.dice.length) return [];
    const total = sum(s.dice);
    const out = [];
    function walk(from, left, picked) {
      if (left === 0) {
        if (picked.length) out.push(picked.slice());
        return;
      }
      for (let i = from; i < s.open.length; i++) {
        const f = s.open[i];
        if (f > left) break;
        picked.push(f);
        walk(i + 1, left - f, picked);
        picked.pop();
      }
    }
    walk(0, total, []);
    return out;
  }

  function totals(s) {
    return s.scores.map((list) => sum(list));
  }

  // Ends the running turn: records the points, hands over to the next
  // player and, after the last player of the last round, decides the game.
  function endTurn(t, boxShut) {
    const p = t.current;
    const points = boxShut ? 0 : sum(t.open);
    t.scores[p].push(points);
    t.turns += 1;
    t.last = { player: p, round: t.round, dice: t.dice.slice(), closed: t.turnClosed.slice(), points: points, boxShut: !!boxShut };
    t.seq += 1;
    t.turnClosed = [];
    t.dice = [];
    if (boxShut) {
      t.phase = "over";
      t.winner = p;
      t.boxShut = true;
      t.open = [];
      return t;
    }
    t.open = range(t.size);
    t.current = p + 1;
    if (t.current >= t.n) {
      t.current = 0;
      t.round += 1;
    }
    if (t.round > t.rounds) {
      t.round = t.rounds;
      t.phase = "over";
      const tot = totals(t);
      const best = Math.min.apply(null, tot);
      const leaders = [];
      tot.forEach((v, i) => { if (v === best) leaders.push(i); });
      t.winner = leaders.length === 1 ? leaders[0] : -1;
      return t;
    }
    t.phase = "roll";
    return t;
  }

  // dice: 2, or 1 when allowed. rng returns a number in [0, 1).
  function roll(s, count, rng) {
    if (s.phase !== "roll") return s;
    const c = count === 1 ? 1 : 2;
    if (c === 1 && !canOneDie(s)) return s;
    const t = clone(s);
    t.dice = [];
    for (let i = 0; i < c; i++) t.dice.push(die(rng));
    t.phase = "close";
    if (!choices(t).length) {
      // The dice stay in `last`, so they can still be shown.
      return endTurn(t, false);
    }
    return t;
  }

  function close(s, flaps) {
    if (s.phase !== "close" || !Array.isArray(flaps) || !flaps.length) return s;
    const distinct = flaps.filter((f, i) => flaps.indexOf(f) === i);
    if (distinct.length !== flaps.length) return s;
    if (!distinct.every((f) => s.open.indexOf(f) >= 0)) return s;
    if (sum(distinct) !== sum(s.dice)) return s;
    const t = clone(s);
    t.open = t.open.filter((f) => distinct.indexOf(f) < 0);
    t.turnClosed = t.turnClosed.concat(distinct.slice().sort((a, b) => a - b));
    if (!t.open.length) return endTurn(t, true);
    t.dice = [];
    t.phase = "roll";
    return t;
  }

  // ---- Computer ----

  // How many of the 36 (two dice) or 6 (one die) rolls let at least one
  // set of flaps close.
  function playableShare(open, count) {
    let good = 0;
    let all = 0;
    const faces = [1, 2, 3, 4, 5, 6];
    const rolls = count === 1 ? faces.map((a) => a) : [].concat.apply([], faces.map((a) => faces.map((b) => a + b)));
    rolls.forEach((total) => {
      all += 1;
      if (fits(open, 0, total)) good += 1;
    });
    return good / all;
  }

  function fits(open, from, left) {
    if (left === 0) return true;
    for (let i = from; i < open.length; i++) {
      if (open[i] > left) break;
      if (fits(open, i + 1, left - open[i])) return true;
    }
    return false;
  }

  // One die only when it gives the better chance that a flap fits.
  function aiDiceCount(s) {
    if (!canOneDie(s)) return 2;
    return playableShare(s.open, 1) > playableShare(s.open, 2) ? 1 : 2;
  }

  // High flaps first: the set that contains the highest flap, then the
  // next highest, and so on (they are the hardest to close later).
  function chooseAi(s) {
    const list = choices(s);
    if (!list.length) return null;
    const key = (c) => c.slice().sort((a, b) => b - a);
    let best = null;
    list.forEach((c) => {
      if (!best) { best = c; return; }
      const a = key(c);
      const b = key(best);
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const x = a[i] === undefined ? 0 : a[i];
        const y = b[i] === undefined ? 0 : b[i];
        if (x !== y) { if (x > y) best = c; return; }
      }
    });
    return best;
  }

  // One action of the computer on its turn.
  function aiStep(s, rng) {
    if (s.phase === "roll") return roll(s, aiDiceCount(s), rng);
    if (s.phase === "close") return close(s, chooseAi(s));
    return s;
  }

  // "win" | "loss" | "draw" from the point of view of one player.
  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winner === -1) return "draw";
    return s.winner === player ? "win" : "loss";
  }

  return { newGame, canOneDie, choices, roll, close, totals, aiDiceCount, chooseAi, aiStep, outcomeFor, playableShare };
})();

if (typeof module !== "undefined") module.exports = KlappenkastenCore;
