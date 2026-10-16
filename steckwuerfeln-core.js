// steckwuerfeln-core.js
// Rules of Steckwuerfeln (Steckwürfeln), a traditional peg-and-dice game,
// without any DOM or browser feature.
//
// Eleven holes numbered 2 to 12, all without a peg at the start. Roll two
// dice; then put one peg into the hole of the total, or two pegs into the
// holes of the two single dice (2 and 4: hole 6, or holes 2 and 4). Keep
// rolling as long as a peg can be put in. When none can, the numbers of
// the holes still free are added: the points of the turn. The fewest
// points win.
//
// Double six is the joker (setting `sixes`):
//   "again"  roll again, nothing is pegged (hole 12 stays free),
//   "out"    the turn ends there ("Aus"), the free holes count,
//   "plug"   no special rule: 6 + 6 pegs hole 12 like any other total.
//
// Two ways to play (setting `mode`):
//   "score"  every player has a turn on a fresh board; points as above,
//            over 1, 3 or 5 rounds. All eleven holes pegged: 0 points and
//            an instant win.
//   "shared" one board for everybody, one roll per turn; whoever cannot
//            peg any more is out. The last one left wins.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const SteckwuerfelnCore = (() => {
  const FIELDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function sum(list) {
    return list.reduce((a, b) => a + b, 0);
  }

  function die(rng) {
    return 1 + Math.floor((rng || Math.random)() * 6);
  }

  // opts: { players: 2..4, computer: [bool, ...], mode: "score" | "shared",
  //         sixes: "again" | "out" | "plug", rounds: 1 | 3 | 5 }
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const computer = [];
    const scores = [];
    const out = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      scores.push([]);
      out.push(false);
    }
    return {
      game: "steckwuerfeln",
      n: n,
      computer: computer,
      mode: o.mode === "shared" ? "shared" : "score",
      sixes: o.sixes === "out" || o.sixes === "plug" ? o.sixes : "again",
      rounds: [1, 3, 5].indexOf(o.rounds) >= 0 ? o.rounds : 3,
      round: 1,
      current: 0,
      open: FIELDS.slice(),     // holes still free
      dice: [],
      phase: "roll",            // "roll" | "plug" | "over"
      scores: scores,           // scores[player][round - 1]   (mode "score")
      out: out,                 // out[player]: cannot peg any more (mode "shared")
      turns: 0,
      winner: null,             // player index, -1 for a draw, null while playing
      full: false,              // the winner pegged every hole (mode "score")
      last: null,               // what happened last (see `seq`)
      seq: 0,                   // counts events; a new `last` has a new number
      turnPlugged: []           // holes pegged in the running turn
    };
  }

  // The ways to peg for two dice a and b on the free holes `open`.
  function waysFor(open, a, b) {
    const out = [];
    const total = a + b;
    if (open.indexOf(total) >= 0) out.push([total]);
    if (a !== b && a >= 2 && b >= 2 && open.indexOf(a) >= 0 && open.indexOf(b) >= 0) out.push([Math.min(a, b), Math.max(a, b)]);
    return out;
  }

  function isJoker(s, dice) {
    return s.sixes !== "plug" && dice.length === 2 && dice[0] === 6 && dice[1] === 6;
  }

  function choices(s) {
    if (s.phase !== "plug" || s.dice.length !== 2) return [];
    return waysFor(s.open, s.dice[0], s.dice[1]);
  }

  function totals(s) {
    return s.scores.map((list) => sum(list));
  }

  function nextPlayer(t) {
    let p = t.current;
    for (let i = 0; i < t.n; i++) {
      p = (p + 1) % t.n;
      if (!t.out[p]) return p;
    }
    return t.current;
  }

  // Ends the running turn in mode "score".
  function endScoreTurn(t, full) {
    const p = t.current;
    const points = full ? 0 : sum(t.open);
    t.scores[p].push(points);
    t.turns += 1;
    t.last = { kind: full ? "full" : "stuck", player: p, round: t.round, dice: t.dice.slice(), points: points };
    t.seq += 1;
    t.turnPlugged = [];
    t.dice = [];
    if (full) {
      t.phase = "over";
      t.winner = p;
      t.full = true;
      t.open = [];
      return t;
    }
    t.open = FIELDS.slice();
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

  // Mode "shared": the player cannot peg and is out, or passes (joker "out").
  function endSharedTurn(t, eliminated) {
    const p = t.current;
    t.turns += 1;
    t.last = { kind: eliminated ? "out" : "pass", player: p, round: 1, dice: t.dice.slice(), points: 0 };
    t.seq += 1;
    t.dice = [];
    if (eliminated) t.out[p] = true;
    const left = [];
    t.out.forEach((o, i) => { if (!o) left.push(i); });
    if (left.length === 1) {
      t.phase = "over";
      t.winner = left[0];
      return t;
    }
    t.current = nextPlayer(t);
    t.phase = "roll";
    return t;
  }

  function roll(s, rng) {
    if (s.phase !== "roll") return s;
    const t = clone(s);
    t.dice = [die(rng), die(rng)];
    if (isJoker(t, t.dice)) {
      if (t.sixes === "again") {
        t.last = { kind: "again", player: t.current, round: t.round, dice: t.dice.slice(), points: 0 };
        t.seq += 1;
        return t;                       // the same player rolls again
      }
      return t.mode === "score" ? endScoreTurn(t, false) : endSharedTurn(t, false);
    }
    t.phase = "plug";
    if (!choices(t).length) return t.mode === "score" ? endScoreTurn(t, false) : endSharedTurn(t, true);
    return t;
  }

  function plug(s, fields) {
    if (s.phase !== "plug" || !Array.isArray(fields) || !fields.length) return s;
    const sorted = fields.slice().sort((x, y) => x - y);
    const legal = choices(s).some((c) => c.length === sorted.length && c.every((f, i) => f === sorted[i]));
    if (!legal) return s;
    const t = clone(s);
    t.open = t.open.filter((f) => sorted.indexOf(f) < 0);
    t.turnPlugged = t.turnPlugged.concat(sorted);
    if (t.mode === "score") {
      if (!t.open.length) return endScoreTurn(t, true);
      t.dice = [];
      t.phase = "roll";
      return t;
    }
    // Shared board: the next player rolls.
    t.turns += 1;
    t.last = { kind: "plug", player: t.current, round: 1, dice: t.dice.slice(), points: 0, fields: sorted };
    t.seq += 1;
    t.dice = [];
    t.current = nextPlayer(t);
    t.phase = "roll";
    return t;
  }

  // ---- Computer ----

  // The share of the 36 rolls that still let a peg in on these holes.
  function playableShare(open, sixes) {
    let good = 0;
    for (let a = 1; a <= 6; a++) {
      for (let b = 1; b <= 6; b++) {
        if (a === 6 && b === 6 && sixes !== "plug") { if (sixes === "again") good += 1; continue; }
        if (waysFor(open, a, b).length) good += 1;
      }
    }
    return good / 36;
  }

  // "score": keep as many later rolls playable as possible.
  // "shared": leave the next player as few playable rolls as possible.
  // Ties: the way with the higher hole (it is the harder one to peg later).
  function chooseAi(s) {
    const list = choices(s);
    if (!list.length) return null;
    let best = null;
    let bestScore = 0;
    list.forEach((c) => {
      const rest = s.open.filter((f) => c.indexOf(f) < 0);
      let value = playableShare(rest, s.sixes);
      if (s.mode === "shared") value = -value;
      const high = Math.max.apply(null, c);
      if (best === null || value > bestScore + 1e-9 || (Math.abs(value - bestScore) <= 1e-9 && high > Math.max.apply(null, best))) {
        best = c;
        bestScore = value;
      }
    });
    return best;
  }

  function aiStep(s, rng) {
    if (s.phase === "roll") return roll(s, rng);
    if (s.phase === "plug") return plug(s, chooseAi(s));
    return s;
  }

  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winner === -1) return "draw";
    return s.winner === player ? "win" : "loss";
  }

  return { FIELDS, newGame, waysFor, choices, roll, plug, totals, chooseAi, aiStep, outcomeFor, playableShare };
})();

if (typeof module !== "undefined") module.exports = SteckwuerfelnCore;
