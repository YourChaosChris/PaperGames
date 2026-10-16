// patternrow-core.js
// "Continue the Pattern" - a row of symbols follows a pattern; which
// symbol comes next? Dependency-free, no DOM, random numbers only from a
// seedable generator (makeRng).
//
// A symbol is a number: shape * 2 + fill. Shapes 0..7 (SHAPES), fill 0 =
// solid black, 1 = outline (white inside). Black and white only.
//
// A game is ROUNDS rows. A row:
//   { seq: [symbol, ...], answer: symbol, options: [symbol, ...], correct }
// seq is the row shown, the symbol to find follows it; options are the
// symbols to choose from, options[correct] === answer, all different.
//
// A row is made from a unit that repeats (the "period"), shown at least
// twice, so the next symbol is certain: the shortest repeating part of
// what is shown has the length of the unit and no other repeating part
// of at most half the row exists (checked by uniqueOf, which the tests
// run for every row).
//   easy    units of 2 or 3 with two shapes, all solid or all outline;
//           3 answers.
//   medium  units of 3 or 4 with up to three shapes; 4 answers.
//   hard    shape and fill each repeat with their own unit, together a
//           unit of 4 (or 3); 4 answers whose wrong ones differ in only
//           the shape or only the fill.

const PatternRowCore = (function () {
  const SHAPES = ["circle", "square", "triangle", "star", "heart", "cross", "diamond", "moon"];
  const ROUNDS = 6;
  const LEVELS = {
    easy: { options: 3, units: ["AB", "AAB", "ABB"] },
    medium: { options: 4, units: ["ABC", "AABC", "ABBC", "ABCC", "ABAC", "AABB"] },
    hard: { options: 4 }
  };

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

  function shapeOf(sym) { return sym >> 1; }
  function fillOf(sym) { return sym & 1; }
  function symbol(shape, fill) { return shape * 2 + fill; }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function shuffle(rng, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Length of the shortest repeating part of a row.
  function minPeriod(seq) {
    for (let p = 1; p < seq.length; p++) {
      let ok = true;
      for (let i = p; i < seq.length; i++) if (seq[i] !== seq[i - p]) { ok = false; break; }
      if (ok) return p;
    }
    return seq.length;
  }

  // The symbols a repeating part of at most half the row (so at least
  // shown twice) would put next: more than one means the row is unclear.
  function nextCandidates(seq) {
    const out = [];
    for (let q = 1; q * 2 <= seq.length; q++) {
      let ok = true;
      for (let i = q; i < seq.length; i++) if (seq[i] !== seq[i - q]) { ok = false; break; }
      if (ok && out.indexOf(seq[seq.length - q]) === -1) out.push(seq[seq.length - q]);
    }
    return out;
  }

  // True when exactly one symbol continues the row.
  function uniqueOf(row) {
    const c = nextCandidates(row.seq);
    return c.length === 1 && c[0] === row.answer;
  }

  function shownLength(p) {
    return 2 * p + (p <= 2 ? 2 : 1);
  }

  function repeatUnit(unit, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(unit[i % unit.length]);
    return out;
  }

  function distinctShapes(rng, n) {
    return shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7]).slice(0, n);
  }

  // Wrong options: first symbols of the row itself (plausible), then
  // others; all different from the answer and from each other.
  function makeOptions(rng, seq, answer, count, extra) {
    const pool = [];
    const add = (s) => { if (s !== answer && pool.indexOf(s) === -1) pool.push(s); };
    shuffle(rng, seq).forEach(add);
    (extra || []).forEach(add);
    let guard = 0;
    while (pool.length < count - 1 && guard++ < 200) add(symbol(Math.floor(rng() * 8), fillOf(answer)));
    const wrong = shuffle(rng, pool).slice(0, count - 1);
    const options = shuffle(rng, wrong.concat([answer]));
    return { options, correct: options.indexOf(answer) };
  }

  function makeRow(level, rng, lastKey) {
    const L = LEVELS[level];
    let seq, answer, extra = [], key;
    if (level === "hard") {
      // shape unit and fill unit; together period 4 (or 3).
      const kind = pick(rng, ["ab-xxyy", "ab-xyyx", "abc-xyy", "abc-xxy", "abcd-xy"].filter((k) => k !== lastKey));
      key = kind;
      const parts = kind.split("-");
      const shapeUnit = parts[0], fillUnit = parts[1];
      const names = distinctShapes(rng, shapeUnit.length);
      const f = rng() < 0.5 ? 0 : 1;
      const shapeAt = (i) => names[shapeUnit.charCodeAt(i % shapeUnit.length) - 97];
      const fillAt = (i) => (fillUnit.charCodeAt(i % fillUnit.length) - 120 === 0 ? f : 1 - f);
      const symAt = (i) => symbol(shapeAt(i), fillAt(i));
      const period = minPeriod(Array.from({ length: 24 }, (_, i) => symAt(i)));
      const n = shownLength(period);
      seq = Array.from({ length: n }, (_, i) => symAt(i));
      answer = symAt(n);
      // wrong ones: right shape in the other fill, other shapes in the right fill
      extra = [symbol(shapeOf(answer), 1 - fillOf(answer))];
      names.forEach((s) => { if (s !== shapeOf(answer)) extra.push(symbol(s, fillOf(answer))); });
    } else {
      const unitKey = pick(rng, L.units.filter((u) => u !== lastKey));
      key = unitKey;
      const need = unitKey.split("").reduce((m, c) => Math.max(m, c.charCodeAt(0) - 64), 0);
      const names = distinctShapes(rng, need);
      const f = rng() < 0.5 ? 0 : 1;
      const unit = unitKey.split("").map((c) => symbol(names[c.charCodeAt(0) - 65], f));
      const period = minPeriod(repeatUnit(unit, 24));
      const n = shownLength(period);
      seq = repeatUnit(unit, n);
      answer = repeatUnit(unit, n + 1)[n];
    }
    const o = makeOptions(rng, seq, answer, L.options, extra);
    return { row: { seq, answer, options: o.options, correct: o.correct }, key };
  }

  function generatePuzzle(level, seed) {
    const lv = LEVELS[level] ? level : "easy";
    const rng = makeRng(seed === undefined || seed === null ? Math.floor(Math.random() * 4294967296) : seed);
    const rows = [];
    let last = "";
    let guard = 0;
    while (rows.length < ROUNDS && guard++ < 200) {
      const made = makeRow(lv, rng, last);
      if (!uniqueOf(made.row)) continue;
      rows.push(made.row);
      last = made.key;
    }
    return { level: lv, rows };
  }

  // A row is well formed: right answer among distinct options.
  function isValidRow(row) {
    if (!row || !Array.isArray(row.seq) || !Array.isArray(row.options)) return false;
    if (row.options[row.correct] !== row.answer) return false;
    if (new Set(row.options).size !== row.options.length) return false;
    return uniqueOf(row);
  }

  return { SHAPES, ROUNDS, LEVELS, makeRng, shapeOf, fillOf, symbol, minPeriod, nextCandidates, uniqueOf, isValidRow, generatePuzzle };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = PatternRowCore;
}
if (typeof window !== "undefined") {
  window.PatternRowCore = PatternRowCore;
}
