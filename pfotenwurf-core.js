// pfotenwurf-core.js
// Rules of "Critter Roll" (Pfotenwurf), PaperGames' own dice game for
// children with animal dice, without any DOM or browser feature.
//
// Five dice; each die shows one of five zoo animals (lion, elephant,
// giraffe, monkey, penguin) or a paw. The paw is a joker: it counts as the
// animal that helps the player most.
// A turn: up to three rolls. After each roll the player may keep dice
// (tap them); the others are rolled again. After any roll the player puts
// the result on exactly one free field of their sheet; a field that does
// not fit may be filled with 0 points (struck out).
// Fields (FIELDS), points without any sum to work out:
//   a0..a4  lions, elephants, giraffes, monkeys, penguins: 1 point for
//           every die with that animal, paws included (0..5);
//   two     two the same (paws included): 10;
//   three   three the same: 20;
//   four    four the same: 30;
//   five    all five the same: 50;
//   diff    all different (no animal twice; paws fill the gaps): 25;
//   luck    lucky field: as many points as the biggest group (1..5).
// The game ends when every player has filled every field; the most points
// win, and players level on the most points all win.
// 1 to 4 players on one device; a computer can play: after every roll it
// looks for the free field with the most points, keeps the biggest group of
// animals (with the paws) and rolls again, up to three times.
//
// The state is a plain serialisable object. Every function returns a new
// state, or the very same object when the action is not allowed.

const PfotenwurfCore = (() => {
  const ANIMALS = 5;
  const PAW = 5;             // the sixth face
  const DICE = 5;
  const MAX_ROLLS = 3;
  const FIELDS = ["a0", "a1", "a2", "a3", "a4", "two", "three", "four", "five", "diff", "luck"];
  const POINTS = { two: 10, three: 20, four: 30, five: 50, diff: 25 };
  const SAME = { two: 2, three: 3, four: 4, five: 5 };
  // Which field the computer gives up first when nothing fits.
  const GIVE_UP = ["five", "four", "diff", "three", "two", "a4", "a3", "a2", "a1", "a0", "luck"];

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

  // How many dice show each animal, and how many show the paw.
  function counts(faces) {
    const c = [0, 0, 0, 0, 0];
    let paws = 0;
    faces.forEach((f) => { if (f === PAW) paws++; else if (f >= 0 && f < ANIMALS) c[f]++; });
    return { c, paws };
  }

  // The biggest group of equal animals, with every paw added to it.
  function biggest(faces) {
    const k = counts(faces);
    return Math.max.apply(null, k.c) + k.paws;
  }

  // Points of a field for these five faces.
  function score(field, faces) {
    if (!faces || faces.length !== DICE || faces.some((f) => f === null || f === undefined)) return 0;
    const k = counts(faces);
    if (field.charAt(0) === "a" && field.length === 2) return k.c[+field.charAt(1)] + k.paws;
    const big = Math.max.apply(null, k.c) + k.paws;
    if (SAME[field]) return big >= SAME[field] ? POINTS[field] : 0;
    if (field === "diff") return k.c.every((x) => x <= 1) ? POINTS.diff : 0;
    if (field === "luck") return big;
    return 0;
  }

  function emptySheet() {
    const sheet = {};
    FIELDS.forEach((f) => { sheet[f] = null; });
    return sheet;
  }

  function total(sheet) {
    return FIELDS.reduce((sum, f) => sum + (sheet[f] || 0), 0);
  }

  function freeFields(sheet) {
    return FIELDS.filter((f) => sheet[f] === null || sheet[f] === undefined);
  }

  // opts: { players: 1..4, computer: [bool, ...] }
  function newGame(opts) {
    const o = opts || {};
    const n = Math.max(1, Math.min(4, o.players || 1));
    const computer = [];
    const sheets = [];
    for (let i = 0; i < n; i++) {
      computer.push(!!(o.computer && o.computer[i]));
      sheets.push(emptySheet());
    }
    return {
      game: "pfotenwurf",
      n: n,
      computer: computer,
      current: 0,
      sheets: sheets,
      dice: [null, null, null, null, null],   // faces 0..5, null before the first roll
      held: [false, false, false, false, false],
      rolls: 0,
      phase: "roll",                          // "roll" | "over"
      winners: null,
      turns: 0,
      last: null,                             // the turn that ended last: { player, field, points, dice }
      seq: 0
    };
  }

  // Rolls every die that is not kept (all of them on the first roll).
  // faces: a fixed roll for tests (one face per die rolled), else from rng.
  function roll(s, rng, faces) {
    if (s.phase !== "roll" || s.rolls >= MAX_ROLLS) return s;
    const t = clone(s);
    let k = 0;
    for (let i = 0; i < DICE; i++) {
      if (t.rolls > 0 && t.held[i]) continue;
      t.dice[i] = faces ? faces[k++] : Math.floor((rng || Math.random)() * 6);
    }
    if (t.rolls === 0) t.held = [false, false, false, false, false];
    t.rolls += 1;
    return t;
  }

  // Keeps die i, or lets it go again (only between rolls).
  function toggleHold(s, i) {
    if (s.phase !== "roll" || s.rolls < 1 || s.rolls >= MAX_ROLLS || !(i >= 0 && i < DICE)) return s;
    const t = clone(s);
    t.held[i] = !t.held[i];
    return t;
  }

  // Points every free field of the player to move would get now.
  function options(s) {
    const out = {};
    if (s.rolls < 1) return out;
    freeFields(s.sheets[s.current]).forEach((f) => { out[f] = score(f, s.dice); });
    return out;
  }

  // Puts the dice on a free field (0 points when it does not fit) and
  // passes the dice on.
  function choose(s, field) {
    if (s.phase !== "roll" || s.rolls < 1 || FIELDS.indexOf(field) === -1) return s;
    const sheet = s.sheets[s.current];
    if (sheet[field] !== null && sheet[field] !== undefined) return s;
    const t = clone(s);
    const points = score(field, t.dice);
    t.sheets[t.current][field] = points;
    t.turns += 1;
    t.seq += 1;
    t.last = { player: t.current, field: field, points: points, dice: t.dice.slice() };
    t.dice = [null, null, null, null, null];
    t.held = [false, false, false, false, false];
    t.rolls = 0;
    if (t.sheets.every((sh) => freeFields(sh).length === 0)) {
      t.phase = "over";
      const best = Math.max.apply(null, t.sheets.map(total));
      t.winners = [];
      t.sheets.forEach((sh, i) => { if (total(sh) === best) t.winners.push(i); });
      return t;
    }
    t.current = (t.current + 1) % t.n;
    return t;
  }

  // ---- Computer ----

  // The free field with the most points (ties: the first in FIELDS order
  // after the groups - a high group field before a single animal field).
  function bestField(s) {
    const opt = options(s);
    let best = null;
    let bestPoints = -1;
    const order = ["five", "four", "diff", "three", "two", "luck", "a0", "a1", "a2", "a3", "a4"];
    order.forEach((f) => {
      if (opt[f] !== undefined && opt[f] > bestPoints) { best = f; bestPoints = opt[f]; }
    });
    if (bestPoints <= 0) {
      const free = freeFields(s.sheets[s.current]);
      best = GIVE_UP.find((f) => free.indexOf(f) !== -1) || best;
      bestPoints = best ? (opt[best] || 0) : 0;
    }
    return { field: best, points: bestPoints };
  }

  // The dice the computer keeps: the biggest group of one animal (the
  // first such animal whose field is still free, else the first) and the
  // paws.
  function keepFor(s) {
    const k = counts(s.dice);
    const free = freeFields(s.sheets[s.current]);
    const most = Math.max.apply(null, k.c);
    let animal = -1;
    for (let a = 0; a < ANIMALS; a++) if (k.c[a] === most && free.indexOf("a" + a) !== -1) { animal = a; break; }
    if (animal < 0) animal = k.c.indexOf(most);
    return s.dice.map((f) => f === PAW || (most > 0 && f === animal));
  }

  // One step of the computer: roll, keep dice, or put the dice on a field.
  // It stops early when a field with 25 points or more is free and fits.
  function aiStep(s, rng) {
    if (s.phase !== "roll") return s;
    if (s.rolls === 0) return roll(s, rng);
    const best = bestField(s);
    if (s.rolls >= MAX_ROLLS || best.points >= 25) return choose(s, best.field);
    const keep = keepFor(s);
    const t = clone(s);
    t.held = keep;
    return roll(t, rng);
  }

  // "win" | "draw" | "loss" from the point of view of one player.
  function outcomeFor(s, player) {
    if (s.phase !== "over") return null;
    if (s.winners.indexOf(player) === -1) return "loss";
    return s.winners.length > 1 ? "draw" : "win";
  }

  return { ANIMALS, PAW, DICE, MAX_ROLLS, FIELDS, POINTS, makeRng, counts, biggest, score, total, freeFields, newGame, roll, toggleHold, options, choose, bestField, keepFor, aiStep, outcomeFor };
})();

if (typeof module !== "undefined") module.exports = PfotenwurfCore;
if (typeof window !== "undefined") window.PfotenwurfCore = PfotenwurfCore;
