// sternjagd-core.js
// Rules of Sternjagd, a chase game with a die, without any DOM or browser
// feature. The board and its arrows are our own drawing: four start
// corners and eight circles, joined by arrows. Every field has exactly two
// arrows leaving it, so a step always has two choices.
//
// The die gives the number of steps; each step follows one arrow, so the
// choices of a roll lead to a few fields to land on. Pieces only meet at
// the end of a move: whoever stops on the field of an opponent takes one of
// its three stars and the caught piece goes back to a free start corner;
// passing over a piece changes nothing. A player without stars is out; the
// last player left wins. (If the game goes on for a very long time it ends
// in a draw.)
//
// Fields: 0-3 the corners C0..C3 (start fields), 4-7 the circles M0..M3 on
// the edges, 8-11 the circles I0..I3 inside. Arrows, for every i:
//   C(i) -> M(i), I(i)
//   M(i) -> C(i+1), I(i+1)
//   I(i) -> C(i+1), M(i-1)
// The four corners look the same from every side (turn the board by a
// quarter), so no seat has an advantage by the board alone.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const SternjagdCore = (() => {
  const NODES = 12;
  const STARS = 3;                // stars (lives) of every player
  const MAX_MOVES = 600;          // moves in one game before it is a draw

  const NEXT = [];
  (function build() {
    for (let v = 0; v < NODES; v++) NEXT.push([]);
    for (let i = 0; i < 4; i++) {
      NEXT[i] = [4 + i, 8 + i];
      NEXT[4 + i] = [(i + 1) % 4, 8 + ((i + 1) % 4)];
      NEXT[8 + i] = [(i + 1) % 4, 4 + ((i + 3) % 4)];
    }
  })();

  // Fields from which `from` can be reached in exactly k steps; REACH[k][v].
  const REACH = [];
  (function reach() {
    REACH[0] = [];
    for (let v = 0; v < NODES; v++) REACH[0][v] = [v];
    for (let k = 1; k <= 6; k++) {
      REACH[k] = [];
      for (let v = 0; v < NODES; v++) {
        const seen = {};
        REACH[k - 1][v].forEach((u) => NEXT[u].forEach((w) => { seen[w] = true; }));
        REACH[k][v] = Object.keys(seen).map(Number).sort((a, b) => a - b);
      }
    }
  })();

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function die(rng) {
    return 1 + Math.floor((rng || Math.random)() * 6);
  }

  // Fields where a move of k steps from `from` may end: not the field it
  // starts on (a piece must really move).
  function reachable(from, k) {
    return REACH[k][from].filter((v) => v !== from);
  }

  // The corner of each seat: 2 players on opposite corners. With 3 players
  // (task 128) the seats go round against the arrows (corners 1, 0, 2):
  // in the order 0, 1, 2 along the arrows seat 1 won only 23 % and seat 2
  // 40 % of the computer games, even with a random starter; against the
  // arrows every seat is within 5 points of a third.
  function startFields(n) {
    return n === 2 ? [0, 2] : n === 3 ? [1, 0, 2] : [0, 1, 2, 3];
  }

  // Home corners of a state: saved in `homes`; games saved before task
  // 128 have none and keep the old corners (3 players: 0, 1, 2).
  function homesOf(s) {
    if (Array.isArray(s.homes)) return s.homes;
    return s.n === 3 ? [0, 1, 2] : startFields(s.n);
  }

  // opts: { players: 2..4, computer: [bool, ...], first: seat that starts,
  //         balance: bool }
  // Balance (task 130, only with 2 players): the player who does not start
  // has two turns in a row the first time. Without it the starter won about
  // 71 % of 1000 computer games, with it about 53 % ("one star more" for
  // the second gave 40 %, half a die for the starter's first roll 59 %).
  // The state keeps `balance` (the setting) and `bonus` (the seat still
  // owed its double turn, -1 when used); games saved before task 130 have
  // neither and play without a balance.
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const computer = [];
    const alive = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      alive.push(true);
    }
    const first = o.first >= 0 && o.first < n ? o.first : 0;
    const balance = n === 2 && !!o.balance;
    return {
      game: "sternjagd",
      n: n,
      computer: computer,
      pos: startFields(n),      // field of each piece
      homes: startFields(n),    // start corner of each piece
      alive: alive,
      stars: alive.map(() => STARS),
      current: first,
      balance: balance,         // task 130: the second player's double turn
      bonus: balance ? 1 - first : -1,
      die: 0,                   // 0 until rolled
      phase: "roll",            // "roll" | "move" | "over"
      moves: 0,
      winner: null,             // player index, -1 for a draw, null while playing
      last: null,               // what happened last (see `seq`)
      seq: 0                    // counts events; a new `last` has a new number
    };
  }

  // A start corner for a caught piece: its own if free, else the next free one.
  function freeCorner(t, player) {
    const home = homesOf(t)[player];
    for (let i = 0; i < 4; i++) {
      const c = (home + i) % 4;
      let taken = false;
      t.pos.forEach((at, j) => { if (j !== player && t.alive[j] && at === c) taken = true; });
      if (!taken) return c;
    }
    return home;
  }

  function destinations(s) {
    if (s.phase !== "move") return [];
    return reachable(s.pos[s.current], s.die);
  }

  function nextAlive(s, from) {
    for (let i = 1; i <= s.n; i++) {
      const p = (from + i) % s.n;
      if (s.alive[p]) return p;
    }
    return from;
  }

  function event(t, last) {
    t.last = last;
    t.seq += 1;
  }

  // Ends the turn of player p: the next player, or p again once if p is
  // still owed the double turn of the balance (marked in the event).
  function endTurn(t, p) {
    if (t.bonus === p && t.alive[p]) {
      t.bonus = -1;
      t.last.again = true;
      t.current = p;
      return;
    }
    t.current = nextAlive(t, p);
  }

  function roll(s, rng) {
    if (s.phase !== "roll") return s;
    const t = clone(s);
    t.die = die(rng);
    t.phase = "move";
    if (!destinations(t).length) {
      event(t, { kind: "pass", player: t.current, die: t.die, from: t.pos[t.current], to: t.pos[t.current], captured: -1 });
      t.die = 0;
      t.phase = "roll";
      endTurn(t, t.current);
    }
    return t;
  }

  function move(s, to) {
    if (s.phase !== "move") return s;
    if (destinations(s).indexOf(to) < 0) return s;
    const t = clone(s);
    const p = t.current;
    let captured = -1;
    for (let i = 0; i < t.n; i++) {
      if (i !== p && t.alive[i] && t.pos[i] === to) captured = i;
    }
    const from = t.pos[p];
    t.pos[p] = to;
    if (captured >= 0) {
      t.stars[captured] -= 1;
      if (t.stars[captured] <= 0) t.alive[captured] = false;
      else t.pos[captured] = freeCorner(t, captured);
    }
    t.moves += 1;
    event(t, { kind: captured >= 0 ? "capture" : "move", player: p, die: t.die, from: from, to: to, captured: captured });
    t.die = 0;
    const left = [];
    t.alive.forEach((a, i) => { if (a) left.push(i); });
    if (left.length === 1) {
      t.phase = "over";
      t.winner = left[0];
      return t;
    }
    if (t.moves >= MAX_MOVES) {
      t.phase = "over";
      t.winner = -1;
      return t;
    }
    t.phase = "roll";
    endTurn(t, p);
    return t;
  }

  // ---- Computer ----

  // Chance (0..1) that the piece on `at` is hit by `by` on its next turn:
  // the share of die values whose move can end there.
  function threat(at, by) {
    let hits = 0;
    for (let k = 1; k <= 6; k++) if (reachable(by, k).indexOf(at) >= 0) hits += 1;
    return hits / 6;
  }

  // A capture first; otherwise the field where the fewest opponents can hit
  // us next turn and from where we can hit the most of them.
  function chooseAi(s) {
    const list = destinations(s);
    if (!list.length) return null;
    const me = s.current;
    let best = null;
    let bestValue = -Infinity;
    list.forEach((d) => {
      let value = 0;
      s.pos.forEach((at, i) => {
        if (i === me || !s.alive[i]) return;
        if (at === d) { value += 100; return; }
        value -= 10 * threat(d, at);
        value += 4 * threat(at, d);
      });
      if (value > bestValue + 1e-9) {
        best = d;
        bestValue = value;
      }
    });
    return best;
  }

  function aiStep(s, rng) {
    if (s.phase === "roll") return roll(s, rng);
    if (s.phase === "move") return move(s, chooseAi(s));
    return s;
  }

  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winner === -1) return "draw";
    return s.winner === player ? "win" : "loss";
  }

  return { NODES, NEXT, REACH, MAX_MOVES, STARS, newGame, reachable, destinations, roll, move, chooseAi, aiStep, threat, outcomeFor, startFields, homesOf };
})();

if (typeof module !== "undefined") module.exports = SternjagdCore;
