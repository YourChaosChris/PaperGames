// zoowurf-core.js
// Rules of "Zoo Toss" (Zoowurf), an own dice game for children, without
// any DOM or browser feature.
//
// Five zoo animals (lion, elephant, giraffe, monkey, penguin) and a paw.
// The animal dice have six faces: the five animals and the paw, which
// counts as any animal the card still needs.
// A card shows the animals that must be rolled (three to five pictures).
// Every card is worth one point, however many pictures it shows. The
// first player with TARGET cards wins.
//
// A round plays for one card:
//   - The first player of the round looks at the two open cards and
//     chooses one. (A card with many different animals gives the first
//     player the better chance; a player who fails hands the rest of the
//     card to the next player.)
//   - On a turn the player rolls as many dice as the card still needs,
//     up to three times. Every die that shows a needed animal (or the
//     paw) is put on the card and stays there; the other dice are rolled
//     again.
//   - Pick rule (games started with pick: true): a paw is put on the card
//     by the player, who taps the open place of the animal it shall be.
//     While paws wait, the phase is "paw". Where there is no choice (one
//     open animal, or at least as many paws as places) the paws go on at
//     once. Games without pick (older saves) put a paw on the animal the
//     card needs most.
//   - When the card is full the player takes it and its points. A new
//     round begins with the next player.
//   - When three rolls did not fill the card, the dice on it stay, and
//     the next player continues with the rest.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const ZoowurfCore = (() => {
  const ANIMALS = 5;
  const WILD = 5;          // the sixth die face: the paw
  const MAX_ROLLS = 3;
  const TARGET = 4;
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

  // opts: { players: 2..4, computer: [bool, ...], rng, target,
  //         level: "beginner" - the computers choose the open card at random,
  //         pick: true - the player puts the paws on the card themselves }
  // Without a level the computers choose by the exact chance (as before);
  // an older saved state has no level and plays as before.
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const computer = [];
    const scores = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      scores.push(0);
    }
    const pile = shuffle(allCards(o.rng), o.rng);
    const yard = pile.splice(0, OPEN);
    const game = {
      game: "zoowurf",
      n: n,
      computer: computer,
      current: 0,
      target: o.target || TARGET,
      scores: scores,       // cards won by each player
      yard: yard,           // the open cards, each five counts
      pile: pile,           // face-down cards, the first one is the top
      phase: "choose",      // "choose" | "roll" | "over"
      play: null,           // the card of this round: { card: [5 counts], need: [5 counts], size }
      rolls: 0,             // rolls made in the current turn (0..3)
      dice: null,           // last roll: { faces: [...], hits: [bool...] }
      winner: null,
      turns: 0,
      last: null,           // the turn that ended last, see finishTurn()
      seq: 0                // counts the turns that ended
    };
    if (o.level === "beginner") game.level = "beginner";
    if (o.pick) game.pick = true;
    return game;
  }

  // Which animal a paw stands for: the one the card needs most (the first
  // of them on a tie), after the plain animals have been put on the card.
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

  function nextPlayer(t) {
    t.current = (t.current + 1) % t.n;
  }

  function finishTurn(t, action, size) {
    const p = t.current;
    t.turns += 1;
    t.seq += 1;
    t.last = { player: p, action: action, size: size, left: t.play ? sum(t.play.need) : 0, dice: t.dice ? JSON.parse(JSON.stringify(t.dice)) : null };
    t.rolls = 0;
  }

  // The player to move chooses open card i for this round.
  function choose(s, i) {
    if (s.phase !== "choose" || !(i >= 0 && i < s.yard.length)) return s;
    const t = clone(s);
    const card = t.yard[i];
    t.play = { card: card.slice(), need: card.slice(), size: sum(card) };
    if (t.pile.length) t.yard[i] = t.pile.shift();
    else t.yard.splice(i, 1);
    t.dice = null;
    t.rolls = 0;
    t.phase = "roll";
    return t;
  }

  // Rolls the dice the card still needs. faces: a fixed roll (tests), a
  // list of numbers 0..5; otherwise taken from rng.
  function roll(s, rng, faces) {
    if (s.phase !== "roll" || !s.play) return s;
    const t = clone(s);
    const n = sum(t.play.need);
    let f = faces;
    if (!f) {
      f = [];
      for (let i = 0; i < n; i++) f.push(Math.floor((rng || Math.random)() * 6));
    }
    t.dice = { faces: f.slice(), hits: f.map(() => false) };
    t.rolls += 1;
    if (t.pick) {
      // animals first; the paws wait for the player when there is a choice
      t.dice.on = f.map(() => -1);   // the animal a paw die went on (-1: none)
      const left = t.play.need.slice();
      f.forEach((x, i) => { if (x < ANIMALS && left[x] > 0) { left[x]--; t.dice.hits[i] = true; } });
      t.play.need = left;
      t.paws = [];
      f.forEach((x, i) => { if (x === WILD) t.paws.push(i); });
      return placePaws(t);
    }
    const r = applyDice(t.play.need, f);
    t.play.need = r.need;
    t.dice.hits = r.hits;
    return settle(t);
  }

  function openAnimals(need) {
    let n = 0;
    need.forEach((x) => { if (x > 0) n++; });
    return n;
  }

  // Puts waiting paws on the card where the player has no choice; stops in
  // the phase "paw" when there is one.
  function placePaws(t) {
    const total = sum(t.play.need);
    if (t.paws && t.paws.length && total > 0 && openAnimals(t.play.need) > 1 && t.paws.length < total) {
      t.phase = "paw";
      return t;
    }
    while (t.paws && t.paws.length && sum(t.play.need) > 0) {
      let best = -1;
      for (let a = 0; a < ANIMALS; a++) if (t.play.need[a] > 0 && (best < 0 || t.play.need[a] > t.play.need[best])) best = a;
      t.play.need[best]--;
      const d = t.paws.shift();
      t.dice.hits[d] = true;
      t.dice.on[d] = best;
    }
    t.paws = [];
    t.phase = "roll";
    return settle(t);
  }

  // The player puts one waiting paw on the open place of animal a.
  function placePaw(s, a) {
    if (s.phase !== "paw" || !s.play || !s.paws || !s.paws.length || !(a >= 0 && a < ANIMALS) || !(s.play.need[a] > 0)) return s;
    const t = clone(s);
    t.play.need[a]--;
    const d = t.paws.shift();
    t.dice.hits[d] = true;
    t.dice.on[d] = a;
    return placePaws(t);
  }

  // The roll is complete: a full card is won, three rolls pass the card on.
  function settle(t) {
    if (sum(t.play.need) === 0) {
      const size = t.play.size;
      t.scores[t.current] += 1;
      finishTurn(t, "win", size);
      t.play = null;
      if (t.scores[t.current] >= t.target) {
        t.phase = "over";
        t.winner = t.current;
        return t;
      }
      nextPlayer(t);
      t.phase = "choose";
      return t;
    }
    if (t.rolls >= MAX_ROLLS) {
      finishTurn(t, "pass", t.play.size);
      nextPlayer(t);
    }
    return t;
  }

  // ---- Computer ----

  // The number of ways the dice can fall is small (at most 6^5), so the
  // chances are computed exactly. A "state" is the list of counts still
  // needed; the order of the animals does not matter, so it is sorted.
  const memoTurn = {};
  const memoFirst = {};

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
  function rollDist(needKey) {
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
    return out;
  }

  const memoRoll = {};
  function rollDistMemo(k) {
    if (!memoRoll[k]) memoRoll[k] = rollDist(k);
    return memoRoll[k];
  }

  // Distribution after a whole turn (up to three rolls) from a state.
  function turnDist(needKey) {
    if (memoTurn[needKey]) return memoTurn[needKey];
    let cur = {};
    cur[needKey] = 1;
    const done = {};
    for (let r = 0; r < MAX_ROLLS; r++) {
      const nxt = {};
      Object.keys(cur).forEach((k) => {
        if (k === "") { done[k] = (done[k] || 0) + cur[k]; return; }
        const d = rollDistMemo(k);
        Object.keys(d).forEach((k2) => { nxt[k2] = (nxt[k2] || 0) + cur[k] * d[k2]; });
      });
      cur = nxt;
    }
    Object.keys(cur).forEach((k) => { done[k] = (done[k] || 0) + cur[k]; });
    memoTurn[needKey] = done;
    return done;
  }

  // Chance that the player to move fills the card before the other one
  // does, when two players alternate (a good guide for more players too).
  function firstChance(needKey) {
    if (needKey === "") return 0;
    if (memoFirst[needKey] !== undefined) return memoFirst[needKey];
    const d = turnDist(needKey);
    let win = 0;
    let stay = 0;
    let other = 0;
    Object.keys(d).forEach((k) => {
      if (k === "") win += d[k];
      else if (k === needKey) stay += d[k];
      else other += d[k] * (1 - firstChance(k));
    });
    const v = (win + other + stay) / (1 + stay);
    memoFirst[needKey] = v;
    return v;
  }

  // How good an open card is for the player who chooses it: the chance to
  // be the one who fills it.
  function cardValue(card) {
    return firstChance(key(card));
  }

  function chooseCard(s) {
    let best = 0;
    let bestValue = -1;
    s.yard.forEach((c, i) => {
      const v = cardValue(c);
      if (v > bestValue + 1e-9) { best = i; bestValue = v; }
    });
    return best;
  }

  // The animal the computer puts a paw on: the open place that leaves the
  // best chance to fill the card (the beginner level takes one at random).
  function chooseAnimal(s, rng, opts) {
    const open = [];
    s.play.need.forEach((n, a) => { if (n > 0) open.push(a); });
    const dumb = opts && opts.dumb !== undefined ? !!opts.dumb : s.level === "beginner";
    if (dumb) return open[Math.floor((rng || Math.random)() * open.length)];
    let best = open[0];
    let bestValue = -1;
    open.forEach((a) => {
      const need = s.play.need.slice();
      need[a]--;
      const v = firstChance(key(need));
      if (v > bestValue + 1e-9) { best = a; bestValue = v; }
    });
    return best;
  }

  // One action of the computer. opts.dumb: choose the card at random; by
  // default the level of the game decides ("beginner" chooses at random).
  function aiStep(s, rng, opts) {
    if (s.phase === "choose") {
      const dumb = opts && opts.dumb !== undefined ? !!opts.dumb : s.level === "beginner";
      return choose(s, dumb ? Math.floor((rng || Math.random)() * s.yard.length) : chooseCard(s));
    }
    if (s.phase === "roll") return roll(s, rng);
    if (s.phase === "paw") return placePaw(s, chooseAnimal(s, rng, opts));
    return s;
  }

  // "win" | "loss" from the point of view of one player.
  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    return s.winner === player ? "win" : "loss";
  }

  return { ANIMALS, WILD, MAX_ROLLS, TARGET, OPEN, makeRng, newGame, applyDice, choose, roll, placePaw, cardValue, chooseCard, firstChance, key, aiStep, outcomeFor, sum };
})();

if (typeof module !== "undefined") module.exports = ZoowurfCore;
if (typeof window !== "undefined") window.ZoowurfCore = ZoowurfCore;
