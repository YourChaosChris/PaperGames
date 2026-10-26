// advent-core.js
// The puzzle Advent calendar (task 122): 24 doors, one small puzzle
// behind each. No DOM here, same separation as every other <game>-core.js.
//
// The puzzles come from generators the project already has, each called
// with a fixed seed (mulberry32, like daily-challenge.js), so door n shows
// the same puzzle on every device and every year:
//   lights      LightSwitchCore.generatePuzzle (3 x 3: one set of presses)
//   sudoku      AnimalSudokuCore.generatePuzzle (4 x 4 and 6 x 6, digits)
//   futoshiki   FutoshikiCore.generatePuzzle (4 x 4 and 5 x 5)
//   skyscrapers SkyscrapersPuzzles.generatePuzzle (easy 4 x 4, medium 5 x 5)
//   calcudoku   CalcudokuCore.generatePuzzle (4 x 4 and 5 x 5)
//   nonogram    a seeded random picture (5 x 5, 6 x 6), kept only when
//               NonogramCore.countSolutions finds exactly one solution
// Every generator except the picture one already checks uniqueness; the
// test (tests/advent-core.js) counts the solutions of all 24 again.
//
// Unlocking by the device clock (local date): before 1 December nothing is
// open; from 1 to 24 December door n opens on day n once door n - 1 is
// solved; from 25 December on every door is open. "Open all doors" (for
// trying it out) opens every door at any time.
//
// Progress: { v: 1, year, solved: [door numbers], work: { n: grid } }.
// normalizeSave() accepts anything and returns a valid object, so a broken
// or old save never stops the page.

const AdventCore = (function () {
  const lib = (name, file) => {
    if (typeof globalThis !== "undefined" && globalThis[name]) return globalThis[name];
    if (typeof require === "function") { try { return require("./" + file); } catch (e) { /* not in node */ } }
    return null;
  };
  // skyscrapers-puzzles.js reads the global SkyscrapersCore (in node too).
  const needSkyCore = () => {
    if (typeof globalThis !== "undefined" && !globalThis.SkyscrapersCore) globalThis.SkyscrapersCore = lib("SkyscrapersCore", "skyscrapers-core.js");
  };
  const L = () => (needSkyCore(), {
    lights: lib("LightSwitchCore", "lightswitch-core.js"),
    sudoku: lib("AnimalSudokuCore", "animalsudoku-core.js"),
    futoshiki: lib("FutoshikiCore", "futoshiki-core.js"),
    skyscrapers: lib("SkyscrapersPuzzles", "skyscrapers-puzzles.js"),
    calcudoku: lib("CalcudokuCore", "calcudoku-core.js"),
    nonogram: lib("NonogramCore", "nonogram-core.js")
  });

  // Door 1..24: the puzzle kind and its size or level, getting harder
  // towards the 24th, the kinds taking turns.
  const DOORS = [
    null,
    { kind: "lights", size: 3, presses: 2 },
    { kind: "sudoku", size: 4, level: "easy" },
    { kind: "nonogram", size: 5 },
    { kind: "futoshiki", size: 4 },
    { kind: "skyscrapers", level: "easy" },
    { kind: "calcudoku", size: 4, level: "easy" },
    { kind: "lights", size: 3, presses: 4 },
    { kind: "sudoku", size: 4, level: "medium" },
    { kind: "nonogram", size: 5 },
    { kind: "futoshiki", size: 4 },
    { kind: "skyscrapers", level: "easy" },
    { kind: "calcudoku", size: 4, level: "medium" },
    { kind: "sudoku", size: 4, level: "hard" },
    { kind: "nonogram", size: 6 },
    { kind: "futoshiki", size: 5 },
    { kind: "sudoku", size: 6, level: "easy" },
    { kind: "calcudoku", size: 5, level: "easy" },
    { kind: "skyscrapers", level: "medium" },
    { kind: "nonogram", size: 6 },
    { kind: "sudoku", size: 6, level: "medium" },
    { kind: "futoshiki", size: 5 },
    { kind: "calcudoku", size: 5, level: "medium" },
    { kind: "nonogram", size: 6 },
    { kind: "sudoku", size: 6, level: "hard" }
  ];
  const COUNT = 24;
  const KINDS = ["lights", "sudoku", "nonogram", "futoshiki", "skyscrapers", "calcudoku"];

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashString(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return h >>> 0;
  }
  function seedOf(n) { return hashString("papergames-advent:" + n); }

  // A seeded picture whose clues have exactly one solution; every row and
  // column has at least one filled cell.
  function nonogramPuzzle(size, rnd, NG) {
    for (let attempt = 0; attempt < 500; attempt++) {
      const grid = [];
      for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) row.push(rnd() < 0.58);
        grid.push(row);
      }
      if (grid.some((row) => !row.some(Boolean))) continue;
      let emptyCol = false;
      for (let c = 0; c < size; c++) if (!grid.some((row) => row[c])) emptyCol = true;
      if (emptyCol) continue;
      const clues = NG.computeClues(grid);
      if (NG.countSolutions(clues.rows, clues.cols, 2) === 1) return { size, solution: grid, clues };
    }
    return null;
  }

  const cache = {};
  // The puzzle behind door n (1..24), always the same.
  function puzzle(n) {
    if (cache[n]) return cache[n];
    const d = DOORS[n];
    if (!d) return null;
    const libs = L();
    const rnd = mulberry32(seedOf(n));
    let p = null;
    if (d.kind === "lights") {
      const g = libs.lights.generatePuzzle(d.size, d.presses, rnd);
      p = { size: d.size, start: g.grid.map((row) => row.slice()) };
    } else if (d.kind === "sudoku") {
      const g = libs.sudoku.generatePuzzle(d.size, d.level, rnd);
      p = { size: g.n, givens: g.puzzle.slice(), solution: g.solution.slice() };
    } else if (d.kind === "futoshiki") {
      // At least `size` signs, so it plays like Futoshiki and not like a
      // plain Latin square (the same rng goes on, so this stays fixed).
      let g = libs.futoshiki.generatePuzzle(d.size, rnd);
      for (let k = 0; k < 20 && g.ineq.length < d.size; k++) g = libs.futoshiki.generatePuzzle(d.size, rnd);
      p = { size: g.size, givens: g.givens.slice(), ineq: g.ineq.map((e) => ({ a: e.a, b: e.b })), solution: g.solution.slice() };
    } else if (d.kind === "skyscrapers") {
      const g = libs.skyscrapers.generatePuzzle(d.level, rnd);
      p = { size: g.n, clues: g.clues, solution: [].concat.apply([], g.solution) };
    } else if (d.kind === "calcudoku") {
      const g = libs.calcudoku.generatePuzzle(d.size, d.level, rnd);
      p = { size: g.size, cages: g.cages, solution: g.solution.slice() };
    } else if (d.kind === "nonogram") {
      p = nonogramPuzzle(d.size, rnd, libs.nonogram);
    }
    if (!p) return null;
    p.n = n;
    p.kind = d.kind;
    cache[n] = p;
    return p;
  }

  // The empty work grid of a puzzle: digits 0..size per cell (sudoku,
  // futoshiki, skyscrapers, calcudoku; givens filled in), 0/1/2 per cell
  // for a picture (empty / filled / crossed), true/false per light.
  function emptyWork(p) {
    if (p.kind === "lights") return [].concat.apply([], p.start);
    if (p.kind === "nonogram") return new Array(p.size * p.size).fill(0);
    return p.givens ? p.givens.slice() : new Array(p.size * p.size).fill(0);
  }

  // A work grid from a save, or the empty one when it does not fit.
  function fitWork(p, w) {
    const fresh = emptyWork(p);
    if (!Array.isArray(w) || w.length !== fresh.length) return fresh;
    if (p.kind === "lights") return w.map(Boolean);
    const max = p.kind === "nonogram" ? 2 : p.size;
    const out = w.map((v) => (Number.isInteger(v) && v >= 0 && v <= max ? v : 0));
    if (p.givens) p.givens.forEach((v, i) => { if (v) out[i] = v; });
    return out;
  }

  // Is the given (or the empty) cell fixed?
  function isGiven(p, i) { return !!(p.givens && p.givens[i]); }

  // Pressing a light toggles it and its neighbours (LightSwitchCore).
  function pressLight(p, work, i) {
    const s = p.size, r = Math.floor(i / s), c = i % s;
    const out = work.slice();
    libsLights().affectedCells(s, r, c).forEach(([rr, cc]) => { out[rr * s + cc] = !out[rr * s + cc]; });
    return out;
  }
  function libsLights() { return L().lights; }

  function isSolved(p, work) {
    if (!p || !Array.isArray(work)) return false;
    if (p.kind === "lights") return work.length === p.size * p.size && work.every((v) => !v);
    if (p.kind === "nonogram") return work.every((v, i) => (v === 1) === p.solution[Math.floor(i / p.size)][i % p.size]);
    return work.length === p.solution.length && work.every((v, i) => v === p.solution[i]);
  }

  // Filled in completely, but not the solution (for the "not yet" line).
  function isFull(p, work) {
    if (p.kind === "lights" || p.kind === "nonogram") return false;
    return work.every((v) => v > 0);
  }

  // The date part that matters: { year, month (1..12), day }.
  function dayOf(date) {
    const d = date || new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  // The season: "before" (January to November), "advent" (1 to 24
  // December) or "after" (25 to 31 December).
  function season(date) {
    const t = dayOf(date);
    if (t.month < 12) return "before";
    return t.day <= COUNT ? "advent" : "after";
  }

  // Door states for a date: "solved", "open" or "closed" for doors 1..24
  // (index 0 unused). solved: array of door numbers.
  function doorStates(date, solved, allOpen) {
    const done = new Set(Array.isArray(solved) ? solved : []);
    const t = dayOf(date), when = season(date);
    const out = [null];
    for (let n = 1; n <= COUNT; n++) {
      let open;
      if (allOpen || when === "after") open = true;
      else if (when === "before") open = false;
      else open = n <= t.day && (n === 1 || done.has(n - 1));
      out.push(done.has(n) ? "solved" : open ? "open" : "closed");
    }
    return out;
  }

  // Why a closed door is closed: "season" (before 1 December), "day" (its
  // day has not come) or "previous" (the door before is not solved).
  function closedReason(date, solved, n) {
    const when = season(date);
    if (when === "before") return "season";
    if (n > dayOf(date).day) return "day";
    return "previous";
  }

  // The door to show first: today's door during Advent if open, else the
  // lowest open and unsolved one, else 0.
  function nextDoor(states, date) {
    const t = dayOf(date);
    if (season(date) === "advent" && states[t.day] === "open") return t.day;
    for (let n = 1; n <= COUNT; n++) if (states[n] === "open") return n;
    return 0;
  }

  function normalizeSave(raw, year) {
    const out = { v: 1, year, solved: [], work: {} };
    if (!raw || typeof raw !== "object" || raw.year !== year) return out;
    if (Array.isArray(raw.solved)) {
      out.solved = raw.solved.filter((n) => Number.isInteger(n) && n >= 1 && n <= COUNT)
        .filter((n, i, a) => a.indexOf(n) === i).sort((a, b) => a - b);
    }
    if (raw.work && typeof raw.work === "object") {
      Object.keys(raw.work).forEach((k) => {
        const n = parseInt(k, 10);
        if (n >= 1 && n <= COUNT && Array.isArray(raw.work[k])) out.work[n] = raw.work[k];
      });
    }
    return out;
  }

  return { DOORS, COUNT, KINDS, seedOf, mulberry32, puzzle, emptyWork, fitWork, isGiven, pressLight, isSolved, isFull, dayOf, season, doorStates, closedReason, nextDoor, normalizeSave };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = AdventCore;
}
if (typeof window !== "undefined") {
  window.AdventCore = AdventCore;
}
