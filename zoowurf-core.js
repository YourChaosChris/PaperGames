// zoowurf-core.js
// Rules of "Zoo Toss" (Zoowurf), an own dice game for children, without
// any DOM or browser feature. Rules 2 (task 145).
//
// Five zoo animals (lion, elephant, giraffe, monkey, penguin) and a paw.
// The animal dice have six faces: the five animals and the paw, which
// counts as any animal the card still needs.
// A card shows the animals that must be rolled (three to five pictures).
// Every animal on a card is worth one point: a card with five animals
// brings five points.
//
// Every player has an own card:
//   - At the start everyone gets a card from the pile (no first choice, so
//     no seat gets the better card).
//   - A player without a card first takes one of the two open cards. It
//     stays with this player until it is full; nobody else plays on it.
//   - A turn is ONE roll with as many dice as the card still needs. Every
//     die that shows a needed animal (or the paw) is put on the card and
//     stays there, also for the next turns. Then the next player rolls.
//   - The player puts a paw on the card: the player taps the open place of
//     the animal it shall be. While paws wait, the phase is "paw". Where
//     there is no choice (one open animal, or at least as many paws as
//     places) the paws go on at once.
//   - A full card brings its points; on the next turn the player takes a
//     new open card.
//   - When a player reaches the target (12 points by default), the round
//     is played to its end, so that everyone has had the same number of
//     turns. Then the most points win; equal points share the win.
//
// The state is a plain serialisable object with rules: 2. Every function
// returns a new state, or the very same object when the action is not
// allowed. States of the first rules (shared card, three rolls) have no
// rules field; isCurrentState() tells them apart.

const ZoowurfCore = (() => {
  const RULES = 2;
  const ANIMALS = 5;
  const WILD = 5;          // the sixth die face: the paw
  const TARGET = 12;       // points
  const OPEN = 2;          // open cards to choose from
  const PER_SIZE = 10;     // cards of each size (3, 4, 5 animals): 30 cards

  // How the animals of a card are shared out: a shape lists how often the
  // animals on the card appear.
  const SHAPES = {
    3: [[1, 1, 1], [2, 1], [3]],
    4: [[1, 1, 1, 1], [2, 1, 1], [2, 2], [3, 1]],
    5: [[1, 1, 1, 1, 1], [2, 1, 1, 1], [2, 2, 1], [3, 1, 1]]
  };

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rng) {
    const a = list.slice();
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sum(list) {
    return list.reduce((a, b) => a + b, 0);
  }

  // All cards: for each size, PER_SIZE different ones. A card is an array
  // of five counts (how many of each animal it needs).
  function allCards(rng) {
    const cards = [];
    [3, 4, 5].forEach((size) => {
      const pool = [];
      const seen = {};
      SHAPES[size].forEach((shape) => {
        for (let o = 0; o < ANIMALS; o++) {
          for (let step = 1; step <= 2; step++) {
            const c = [0, 0, 0, 0, 0];
            shape.forEach((n, k) => { c[(o + k * step) % ANIMALS] += n; });
            const key = c.join("");
            if (!seen[key]) { seen[key] = 1; pool.push(c); }
          }
        }
      });
      shuffle(pool, rng).slice(0, PER_SIZE).forEach((c) => cards.push(c));
    });
    return cards;
  }

  // A state of the current rules (older saves are dropped by the page).
  function isCurrentState(s) {
    return !!s && s.game === "zoowurf" && s.rules === RULES && Array.isArray(s.plays) &&
      Array.isArray(s.yard) && Array.isArray(s.pile) && Array.isArray(s.scores) &&
      Array.isArray(s.won) && Array.isArray(s.computer) && s.computer.length === s.n &&
      s.plays.length === s.n && s.scores.length === s.n &&
      ["choose", "roll", "paw", "over"].indexOf(s.phase) >= 0 &&
      ((s.phase !== "roll" && s.phase !== "paw") || (!!s.plays[s.current] && Array.isArray(s.plays[s.current].need)));
  }

  // opts: { players: 2..4, computer: [bool, ...], rng, target,
  //         level: "beginner" - the computers choose cards and paws at random }
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const computer = [];
    const scores = [];
    const won = [];
    const plays = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      scores.push(0);
      won.push(0);
      plays.push(null);
    }
    const pile = shuffle(allCards(o.rng), o.rng);
    // everyone starts with a card from the pile, so that nobody gets the
    // better first choice
    for (let i = 0; i < n; i++) {
      const c = pile.shift();
      plays[i] = { card: c.slice(), need: c.slice(), size: sum(c) };
    }
    const yard = pile.splice(0, OPEN);
    const game = {
      game: "zoowurf",
      rules: RULES,
      n: n,
      computer: computer,
      current: 0,
      target: o.target || TARGET,
      scores: scores,       // points of each player
      won: won,             // full cards of each player
      plays: plays,         // the card of each player: { card: [5 counts], need: [5 counts], size } or null
      yard: yard,           // the open cards, each five counts
      pile: pile,           // face-down cards, the first one is the top
      phase: "roll",        // "choose" | "roll" | "paw" | "over"
      dice: null,           // last roll: { faces: [...], hits: [bool...], on: [animal or -1] }
      paws: [],             // dice indexes of paws waiting for the player
      round: 1,
      ending: false,        // someone reached the target: the round is played to its end
      endedBy: null,        // the player who reached it first
      winner: null,         // the only winner, or null on a shared win
      winners: [],
      turns: 0,
      last: null,           // the turn that ended last, see endTurn()
      seq: 0                // counts the turns that ended
    };
    if (o.level === "beginner") game.level = "beginner";
    return game;
  }

  // Which animal a paw stands for in the computer's chance tables: the one
  // the card needs most, after the plain animals have been put on the card.
  // Returns the new need and, for each die, whether it was put on the card.
  function applyDice(need, faces) {
    const left = need.slice();
    const hits = faces.map(() => false);
    faces.forEach((f, i) => {
      if (f < ANIMALS && left[f] > 0) { left[f]--; hits[i] = true; }
    });
    faces.forEach((f, i) => {
      if (f !== WILD) return;
      let best = -1;
      for (let a = 0; a < ANIMALS; a++) if (left[a] > 0 && (best < 0 || left[a] > left[best])) best = a;
      if (best >= 0) { left[best]--; hits[i] = true; }
    });
    return { need: left, hits: hits };
  }

  function playOf(s) {
    return s.plays[s.current];
  }

  function finishGame(t) {
    const best = Math.max.apply(null, t.scores);
    t.winners = [];
    t.scores.forEach((x, i) => { if (x === best) t.winners.push(i); });
    t.winner = t.winners.length === 1 ? t.winners[0] : null;
    t.phase = "over";
    t.paws = [];
  }

  // The roll is complete: points for a full card, then the next player.
  function endTurn(t) {
    const p = t.current;
    const play = t.plays[p];
    const got = t.dice ? t.dice.hits.filter(Boolean).length : 0;
    let action = "roll";
    const size = play.size;
    if (sum(play.need) === 0) {
      t.scores[p] += play.size;
      t.won[p] += 1;
      t.plays[p] = null;
      action = "win";
    }
    t.turns += 1;
    t.seq += 1;
    t.last = { player: p, action: action, size: size, card: play.card.slice(), got: got, left: t.plays[p] ? sum(t.plays[p].need) : 0, points: t.scores[p], dice: t.dice ? clone(t.dice) : null };
    t.paws = [];
    if (t.scores[p] >= t.target && !t.ending) { t.ending = true; t.endedBy = p; }
    if (p === t.n - 1) {
      if (t.ending) { finishGame(t); return t; }
      t.round += 1;
    }
    t.current = (p + 1) % t.n;
    startTurn(t);
    return t;
  }

  // The phase of the player to move: choose a card or roll for the own one.
  // Without a card and with no open card left the game ends.
  function startTurn(t) {
    if (t.plays[t.current]) { t.phase = "roll"; return; }
    if (t.yard.length) { t.phase = "choose"; return; }
    finishGame(t);
  }

  // The player to move takes open card i as the own card.
  function choose(s, i) {
    if (s.phase !== "choose" || playOf(s) || !(i >= 0 && i < s.yard.length)) return s;
    const t = clone(s);
    const card = t.yard[i];
    t.plays[t.current] = { card: card.slice(), need: card.slice(), size: sum(card) };
    if (t.pile.length) t.yard[i] = t.pile.shift();
    else t.yard.splice(i, 1);
    t.dice = null;
    t.phase = "roll";
    return t;
  }

  // Rolls the dice the own card still needs. faces: a fixed roll (tests),
  // a list of numbers 0..5; otherwise taken from rng.
  function roll(s, rng, faces) {
    if (s.phase !== "roll" || !playOf(s)) return s;
    const t = clone(s);
    const play = t.plays[t.current];
    const n = sum(play.need);
    let f = faces;
    if (!f) {
      f = [];
      for (let i = 0; i < n; i++) f.push(Math.floor((rng || Math.random)() * 6));
    }
    t.dice = { faces: f.slice(), hits: f.map(() => false), on: f.map(() => -1), from: play.need.slice() };
    // animals first; the paws wait for the player when there is a choice
    f.forEach((x, i) => { if (x < ANIMALS && play.need[x] > 0) { play.need[x]--; t.dice.hits[i] = true; } });
    t.paws = [];
    f.forEach((x, i) => { if (x === WILD) t.paws.push(i); });
    return placePaws(t);
  }

  function openAnimals(need) {
    let n = 0;
    need.forEach((x) => { if (x > 0) n++; });
    return n;
  }

  // Puts waiting paws on the card where the player has no choice; stops in
  // the phase "paw" when there is one.
  function placePaws(t) {
    const play = t.plays[t.current];
    const total = sum(play.need);
    if (t.paws.length && total > 0 && openAnimals(play.need) > 1 && t.paws.length < total) {
      t.phase = "paw";
      return t;
    }
    while (t.paws.length && sum(play.need) > 0) {
      let best = -1;
      for (let a = 0; a < ANIMALS; a++) if (play.need[a] > 0 && (best < 0 || play.need[a] > play.need[best])) best = a;
      play.need[best]--;
      const d = t.paws.shift();
      t.dice.hits[d] = true;
      t.dice.on[d] = best;
    }
    t.paws = [];
    t.phase = "roll";
    return endTurn(t);
  }

  // The player puts one waiting paw on the open place of animal a.
  function placePaw(s, a) {
    const play = playOf(s);
    if (s.phase !== "paw" || !play || !s.paws || !s.paws.length || !(a >= 0 && a < ANIMALS) || !(play.need[a] > 0)) return s;
    const t = clone(s);
    t.plays[t.current].need[a]--;
    const d = t.paws.shift();
    t.dice.hits[d] = true;
    t.dice.on[d] = a;
    return placePaws(t);
  }

  // ---- Computer ----

  // The chances are computed exactly. A "state" is the list of counts still
  // needed; the order of the animals does not matter, so it is sorted.
  function key(need) {
    return need.filter((x) => x > 0).sort((a, b) => b - a).join(",");
  }

  function fromKey(k) {
    const a = k === "" ? [] : k.split(",").map(Number);
    while (a.length < ANIMALS) a.push(0);
    return a;
  }

  // Distribution of what is still needed after one roll of all the needed
  // dice: { key: probability }.
  const memoRoll = {};
  function rollDist(needKey) {
    if (memoRoll[needKey]) return memoRoll[needKey];
    const need = fromKey(needKey);
    const n = sum(need);
    const out = {};
    const faces = new Array(n).fill(0);
    const total = Math.pow(6, n);
    for (let code = 0; code < total; code++) {
      let c = code;
      for (let i = 0; i < n; i++) { faces[i] = c % 6; c = Math.floor(c / 6); }
      const k = key(applyDice(need, faces).need);
      out[k] = (out[k] || 0) + 1 / total;
    }
    memoRoll[needKey] = out;
    return out;
  }

  // Expected number of turns (rolls) until the card is full.
  const memoTurns = {};
  function expectedTurns(needKey) {
    if (needKey === "") return 0;
    if (memoTurns[needKey] !== undefined) return memoTurns[needKey];
    const d = rollDist(needKey);
    let stay = 0;
    let rest = 1;
    Object.keys(d).forEach((k) => {
      if (k === needKey) stay += d[k];
      else rest += d[k] * expectedTurns(k);
    });
    const v = rest / (1 - stay);
    memoTurns[needKey] = v;
    return v;
  }

  // Chance to fill the card within r rolls.
  function fillChance(needKey, r) {
    if (needKey === "") return 1;
    if (r <= 0) return 0;
    const d = rollDist(needKey);
    let p = 0;
    Object.keys(d).forEach((k) => { p += d[k] * fillChance(k, r - 1); });
    return p;
  }

  // How good an open card is: points per expected turn.
  function cardValue(card) {
    return sum(card) / expectedTurns(key(card));
  }

  // Turns this player still has when the round is played to its end.
  function turnsLeft(s) {
    return s.ending ? 1 : Infinity;
  }

  function chooseCard(s) {
    let best = 0;
    let bestValue = -Infinity;
    const left = turnsLeft(s);
    s.yard.forEach((c, i) => {
      // in the last turn only a card filled at once counts
      const v = left === 1 ? sum(c) * fillChance(key(c), 1) : cardValue(c);
      if (v > bestValue + 1e-12) { best = i; bestValue = v; }
    });
    return best;
  }

  // The animal the computer puts a paw on: the open place that leaves the
  // fewest turns to fill the card (the beginner level takes one at random).
  function chooseAnimal(s, rng, opts) {
    const open = [];
    playOf(s).need.forEach((n, a) => { if (n > 0) open.push(a); });
    const dumb = opts && opts.dumb !== undefined ? !!opts.dumb : s.level === "beginner";
    if (dumb) return open[Math.floor((rng || Math.random)() * open.length)];
    let best = open[0];
    let bestValue = Infinity;
    open.forEach((a) => {
      const need = playOf(s).need.slice();
      need[a]--;
      const v = expectedTurns(key(need));
      if (v < bestValue - 1e-9) { best = a; bestValue = v; }
    });
    return best;
  }

  // One action of the computer. opts.dumb: choose card and paws at random;
  // by default the level of the game decides ("beginner" is random).
  function aiStep(s, rng, opts) {
    if (s.phase === "choose") {
      const dumb = opts && opts.dumb !== undefined ? !!opts.dumb : s.level === "beginner";
      return choose(s, dumb ? Math.floor((rng || Math.random)() * s.yard.length) : chooseCard(s));
    }
    if (s.phase === "roll") return roll(s, rng);
    if (s.phase === "paw") return placePaw(s, chooseAnimal(s, rng, opts));
    return s;
  }

  // "win" | "draw" | "loss" from the point of view of one player.
  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winners.indexOf(player) < 0) return "loss";
    return s.winners.length > 1 ? "draw" : "win";
  }

  return { RULES, ANIMALS, WILD, TARGET, OPEN, makeRng, newGame, isCurrentState, applyDice, choose, roll, placePaw, cardValue, chooseCard, expectedTurns, fillChance, key, aiStep, outcomeFor, sum };
})();

if (typeof module !== "undefined") module.exports = ZoowurfCore;
if (typeof window !== "undefined") window.ZoowurfCore = ZoowurfCore;
