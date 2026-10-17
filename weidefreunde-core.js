// weidefreunde-core.js
// Rules of "Pasture Friends" (Weidefreunde), an own card-and-dice game for
// children, without any DOM or browser feature.
//
// 5 farm animals (cow, sheep, pig, hen, horse), 7 cards of each: 35 cards.
// Every player has a pasture with one place per animal. The first player
// whose pasture holds all five animals wins.
// The yard is a row of 5 open cards. On your turn you roll the animal die
// (five animal faces and the farmer):
//   - An animal face: if the yard shows that animal and your pasture does
//     not have it yet, you take that card onto your pasture.
//   - The farmer: you take any one yard card of an animal you still miss.
//   - Otherwise (no such card, or you have the animal already) you send
//     one yard card of your choice back under the pile and a new card is
//     turned up in its place.
// Taken cards are replaced from the pile at once. The turn then passes on.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const WeidefreundeCore = (() => {
  const ANIMALS = 5;
  const COPIES = 7;
  const YARD = 5;
  const FARMER = 5; // the sixth face of the die

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

  // opts: { players: 2..4, computer: [bool, ...], rng }
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(2, Math.min(4, o.players || 2));
    const computer = [];
    const own = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      own.push([0, 0, 0, 0, 0]);
    }
    const cards = [];
    for (let a = 0; a < ANIMALS; a++) for (let c = 0; c < COPIES; c++) cards.push(a);
    const pile = shuffle(cards, o.rng);
    const yard = pile.splice(0, YARD);
    return {
      game: "weidefreunde",
      n: n,
      computer: computer,
      current: 0,
      own: own,            // own[player][animal] = 1 when the pasture has it
      yard: yard,          // the open cards, animal numbers 0..4
      pile: pile,          // face-down, the first one is the top
      phase: "roll",       // "roll" | "pick" | "swap" | "over"
      die: null,           // the face rolled in this turn (0..4 animal, 5 farmer)
      winner: null,        // player index while over
      turns: 0,
      last: null,          // the turn that ended last, see endTurn()
      seq: 0               // counts the turns that ended
    };
  }

  function count(s, p) {
    return s.own[p].reduce((a, b) => a + b, 0);
  }

  function lacks(s, p, animal) {
    return !s.own[p][animal];
  }

  // Yard places holding an animal the current player still misses.
  function takeable(s) {
    const out = [];
    s.yard.forEach((a, i) => { if (lacks(s, s.current, a)) out.push(i); });
    return out;
  }

  // Replaces yard place i by the top card of the pile (empties the place
  // only when the pile is used up, which a normal game never reaches).
  function refill(t, i) {
    if (t.pile.length) t.yard[i] = t.pile.shift();
    else t.yard.splice(i, 1);
  }

  function endTurn(t, action, animal, extra) {
    const p = t.current;
    t.turns += 1;
    t.last = { player: p, die: t.die, action: action, animal: animal, shown: extra === undefined ? null : extra };
    t.seq += 1;
    t.die = null;
    if (count(t, p) === ANIMALS) {
      t.phase = "over";
      t.winner = p;
      return t;
    }
    t.current = (p + 1) % t.n;
    t.phase = "roll";
    return t;
  }

  function takeCard(t, i) {
    const a = t.yard[i];
    t.own[t.current][a] = 1;
    refill(t, i);
    return a;
  }

  // face: a number 0..5 for a fixed roll (tests); otherwise from rng.
  function roll(s, rng, face) {
    if (s.phase !== "roll") return s;
    const t = clone(s);
    t.die = face === undefined || face === null ? Math.floor((rng || Math.random)() * 6) : face;
    if (t.die < ANIMALS) {
      const i = t.yard.indexOf(t.die);
      if (i >= 0 && lacks(t, t.current, t.die)) {
        const a = takeCard(t, i);
        return endTurn(t, "take", a);
      }
      t.phase = "swap";
      return t;
    }
    if (takeable(t).length) {
      t.phase = "pick";
      return t;
    }
    t.phase = "swap";
    return t;
  }

  // Farmer: take the yard card at place i.
  function pick(s, i) {
    if (s.phase !== "pick" || !(i >= 0 && i < s.yard.length)) return s;
    if (!lacks(s, s.current, s.yard[i])) return s;
    const t = clone(s);
    const a = takeCard(t, i);
    return endTurn(t, "farmer", a);
  }

  // No card for you: send the yard card at place i back under the pile.
  function swap(s, i) {
    if (s.phase !== "swap" || !(i >= 0 && i < s.yard.length)) return s;
    const t = clone(s);
    const back = t.yard[i];
    t.pile.push(back);
    refill(t, i);
    return endTurn(t, "swap", back, t.yard[i]);
  }

  // ---- Computer ----

  // How many players other than `me` still miss the animal.
  function othersMiss(s, me, animal) {
    let c = 0;
    for (let p = 0; p < s.n; p++) if (p !== me && lacks(s, p, animal)) c++;
    return c;
  }

  function yardCopies(s, animal) {
    return s.yard.filter((a) => a === animal).length;
  }

  // Farmer: of the animals still missing, the one that is hardest to get
  // otherwise (fewest open copies); a tie goes to the one the others
  // miss most (they cannot take it then).
  function choosePick(s) {
    let best = -1;
    let bestKey = null;
    takeable(s).forEach((i) => {
      const a = s.yard[i];
      const key = [yardCopies(s, a), -othersMiss(s, s.current, a), i];
      if (!bestKey || key[0] < bestKey[0] || (key[0] === bestKey[0] && (key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))) {
        best = i;
        bestKey = key;
      }
    });
    return best;
  }

  // Swap: the open row should show what I miss, so send back a card I do
  // not need (an animal I own, or a second copy of the same animal), and
  // prefer one the others miss least, so the others get no help.
  function chooseSwap(s) {
    const me = s.current;
    let best = 0;
    let bestKey = null;
    s.yard.forEach((a, i) => {
      const useless = !lacks(s, me, a) ? 0 : (s.yard.indexOf(a) !== i ? 1 : 2);
      const key = [useless, othersMiss(s, me, a), i];
      if (!bestKey || key[0] < bestKey[0] || (key[0] === bestKey[0] && (key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))) {
        best = i;
        bestKey = key;
      }
    });
    return best;
  }

  function randomIndex(n, rng) {
    return Math.floor((rng || Math.random)() * n);
  }

  // One action of the computer. opts.dumb: choose at random (used by the
  // tests to show that the strategy is better).
  function aiStep(s, rng, opts) {
    const dumb = !!(opts && opts.dumb);
    if (s.phase === "roll") return roll(s, rng);
    if (s.phase === "pick") {
      if (dumb) {
        const list = takeable(s);
        return pick(s, list[randomIndex(list.length, rng)]);
      }
      return pick(s, choosePick(s));
    }
    if (s.phase === "swap") return swap(s, dumb ? randomIndex(s.yard.length, rng) : chooseSwap(s));
    return s;
  }

  // "win" | "loss" from the point of view of one player.
  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    return s.winner === player ? "win" : "loss";
  }

  return { ANIMALS, COPIES, YARD, FARMER, makeRng, newGame, count, lacks, takeable, roll, pick, swap, choosePick, chooseSwap, aiStep, outcomeFor };
})();

if (typeof module !== "undefined") module.exports = WeidefreundeCore;
if (typeof window !== "undefined") window.WeidefreundeCore = WeidefreundeCore;
