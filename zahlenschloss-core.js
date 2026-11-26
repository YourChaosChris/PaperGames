// zahlenschloss-core.js
// Rules engine for Number Lock (Zahlenschloss), no DOM.
// A code of 3 or 4 different digits (0-9, it may start with 0) is to be found.
// Every clue is a number of the same length with how many of its digits are
// in the code at the right place and how many are in the code at another
// place. All clues are given at the start; nothing is guessed, everything
// follows from them. Each puzzle has exactly one solution and no clue can be
// left out (without it there would be several solutions).
// Levels: 1 = easy (3 digits, with a clue "no digit is right"),
//         2 = medium (3 digits, every clue has at least one right digit),
//         3 = hard (4 digits).

const ZahlenschlossCore = (function () {
  const LEVELS = {
    1: { digits: 3, none: true, minClues: 4, maxClues: 6 },
    2: { digits: 3, none: false, minClues: 4, maxClues: 7 },
    3: { digits: 4, none: false, minClues: 5, maxClues: 8 }
  };

  // mulberry32: small, fast, the same on every browser.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(text) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
    return h;
  }

  // All codes of `digits` different digits, as strings ("043").
  const CODES = {};
  function codes(digits) {
    if (CODES[digits]) return CODES[digits];
    const out = [];
    const walk = (s) => {
      if (s.length === digits) { out.push(s); return; }
      for (let d = 0; d <= 9; d++) if (s.indexOf(String(d)) === -1) walk(s + d);
    };
    walk("");
    CODES[digits] = out;
    return out;
  }

  // { right, wrong }: digits at the right place, digits in the code elsewhere.
  function feedback(code, guess) {
    let right = 0, wrong = 0;
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === code[i]) right++;
      else if (code.indexOf(guess[i]) !== -1) wrong++;
    }
    return { right: right, wrong: wrong };
  }

  function fits(code, clue) {
    const f = feedback(code, clue.guess);
    return f.right === clue.right && f.wrong === clue.wrong;
  }

  // Every code that agrees with all clues. With `all` the digits of a code may
  // repeat too (only for checking the example of the source).
  function solutions(clues, digits, all) {
    let list = codes(digits);
    if (all) {
      list = [];
      for (let i = 0; i < Math.pow(10, digits); i++) list.push(String(i).padStart(digits, "0"));
    }
    return list.filter((c) => clues.every((cl) => fits(c, cl)));
  }

  function makeClue(code, guess) {
    const f = feedback(code, guess);
    return { guess: guess, right: f.right, wrong: f.wrong };
  }

  function pick(list, r) {
    return list[Math.floor(r() * list.length)];
  }

  // The puzzle with this number at this level, always the same.
  function generate(level, number) {
    const cfg = LEVELS[level] || LEVELS[2];
    const r = rng(hash("papergames-zahlenschloss:" + level + ":" + number));
    const all = codes(cfg.digits);
    for (let attempt = 0; attempt < 200; attempt++) {
      const code = pick(all, r);
      let clues = [];
      let left = all;
      let guard = 0;
      while (left.length > 1 && guard++ < 400) {
        const guess = pick(all, r);
        if (guess === code || clues.some((c) => c.guess === guess)) continue;
        const clue = makeClue(code, guess);
        if (clue.right === cfg.digits) continue;
        if (!cfg.none && clue.right + clue.wrong === 0) continue;
        const next = left.filter((c) => fits(c, clue));
        if (next.length === left.length) continue; // tells nothing new
        clues.push(clue);
        left = next;
      }
      if (left.length !== 1) continue;
      // Drop clues that are not needed, in a random order.
      const order = clues.map((_, i) => i).sort(() => r() - 0.5);
      for (const i of order) {
        if (!clues[i]) continue;
        const rest = clues.map((c, j) => (j === i ? null : c));
        if (solutions(rest.filter(Boolean), cfg.digits).length === 1) clues = rest;
      }
      clues = clues.filter(Boolean);
      if (clues.length > cfg.maxClues || clues.length < cfg.minClues) continue;
      if (cfg.none && !clues.some((c) => c.right + c.wrong === 0)) continue;
      // Clues sorted by their number, so the order says nothing.
      clues.sort((a, b) => (a.guess < b.guess ? -1 : 1));
      return { level: LEVELS[level] ? level : 2, number: number, digits: cfg.digits, code: code, clues: clues };
    }
    return null;
  }

  // True when every clue is needed: leaving any one out gives more solutions.
  function minimal(clues, digits) {
    return clues.every((c) => solutions(clues.filter((x) => x !== c), digits).length > 1);
  }

  /*** Hints: one fact that follows from one clue or from two clues. ***/

  // Facts every code in `list` agrees on: digits not in the code, digits in
  // it, a digit at a place, a digit not at a place.
  function factsOf(list, digits, among) {
    const facts = [];
    for (let d = 0; d <= 9; d++) {
      const ch = String(d);
      if (among && among.indexOf(ch) === -1) continue;
      const inAll = list.every((c) => c.indexOf(ch) !== -1);
      const inNone = list.every((c) => c.indexOf(ch) === -1);
      if (inNone) { facts.push({ kind: "absent", digit: d }); continue; }
      if (inAll) facts.push({ kind: "present", digit: d });
      for (let p = 0; p < digits; p++) {
        if (list.every((c) => c[p] === ch)) facts.push({ kind: "place", digit: d, place: p });
        else if (!inNone && list.every((c) => c[p] !== ch) && among) facts.push({ kind: "notplace", digit: d, place: p });
      }
    }
    return facts;
  }

  function sameFact(a, b) {
    return a.kind === b.kind && a.digit === b.digit && (a.place === undefined || a.place === b.place);
  }

  function holds(code, f) {
    const ch = String(f.digit);
    if (f.kind === "absent") return code.indexOf(ch) === -1;
    if (f.kind === "present") return code.indexOf(ch) !== -1;
    if (f.kind === "place") return code[f.place] === ch;
    return code[f.place] !== ch;
  }

  // The next hint: a fact not already in `known`, from as few clues as
  // possible (and what is already known). { clues: [index...], facts:
  // [fact...] } - several "absent" facts of one clue come together - or null
  // when nothing is left to say.
  function hint(puzzle, known) {
    const k = known || [];
    const absent = k.filter((f) => f.kind === "absent").map((f) => f.digit);
    const fresh = (f) => !k.some((x) => sameFact(x, f)) && absent.indexOf(f.digit) === -1 &&
      !(f.kind === "present" && k.some((x) => x.kind === "place" && x.digit === f.digit)) &&
      !(f.kind === "notplace" && k.some((x) => x.kind === "place" && (x.digit === f.digit || x.place === f.place)));
    const clues = puzzle.clues;
    const d = puzzle.digits;
    const base = codes(d).filter((c) => k.every((f) => holds(c, f)));
    const subsets = [];
    for (let i = 0; i < clues.length; i++) subsets.push([i]);
    for (let i = 0; i < clues.length; i++) for (let j = i + 1; j < clues.length; j++) subsets.push([i, j]);
    const rounds = [["absent", "place", "present"], ["notplace"]];
    for (const kinds of rounds) {
      for (const sub of subsets) {
        const list = base.filter((c) => sub.every((i) => fits(c, clues[i])));
        const facts = factsOf(list, d, sub.map((i) => clues[i].guess).join("")).filter(fresh);
        for (const kind of kinds) {
          const of = facts.filter((f) => f.kind === kind);
          if (of.length) return { clues: sub, facts: kind === "absent" && sub.length === 1 ? of : [of[0]] };
        }
      }
    }
    // Nothing follows from two clues: give one place of the code.
    for (let p = 0; p < d; p++) {
      const f = { kind: "place", digit: Number(puzzle.code[p]), place: p };
      if (!k.some((x) => sameFact(x, f))) return { clues: [], facts: [f] };
    }
    return null;
  }

  function createInitialState(level, number) {
    const puzzle = generate(level, number);
    return {
      level: puzzle.level,
      number: number,
      clues: puzzle.clues,
      digits: puzzle.digits,
      code: puzzle.code,
      entry: "",        // the digits typed into the code fields
      struck: puzzle.clues.map(() => []), // per clue the places struck out (notes)
      mistakes: 0,
      hints: [],        // facts already given by the Hint button
      solved: false
    };
  }

  return { LEVELS, rng, hash, codes, feedback, fits, solutions, makeClue, generate, minimal, hint, createInitialState };
})();

if (typeof module !== "undefined") module.exports = ZahlenschlossCore;
