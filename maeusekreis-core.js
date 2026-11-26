// maeusekreis-core.js
// Rules engine for Mouse Ring (Maeusekreis), no DOM.
// Points on a circle, neighbours joined by the circle, and a few straight
// lines across (shortcuts). The mouse walks only along the circle, the cat
// along the circle and the lines across. Mouse and cat take turns, the mouse
// first, one step to a neighbouring point each; nobody may stay. The cat
// catches the mouse by stepping onto its point (the mouse may not step onto
// the cat). The mouse wins if the cat has made all its steps (`limit`)
// without catching it. Nothing is eaten: a caught mouse is simply caught.
// A backward search (`solve`) knows for every position how many cat steps
// the cat needs at least when the mouse runs as well as it can; the limit
// is set from it, so the side that has to play well can win.

const MaeusekreisCore = (function () {
  // level -> points on the circle, lines across, the fewest and most cat
  // steps a start may need (with best play on both sides).
  const BOARDS = {
    1: { points: 8, chords: [[0, 2], [4, 6]], minSteps: 5, maxSteps: 7 },
    2: { points: 10, chords: [[2, 6], [1, 9], [4, 7]], minSteps: 6, maxSteps: 8 },
    3: { points: 12, chords: [[2, 10], [4, 8], [6, 9]], minSteps: 8, maxSteps: 11 }
  };
  const MAX = 16;

  function ring(n, i) {
    return [(i + 1) % n, (i + n - 1) % n];
  }

  function neighbours(level, who, p) {
    const b = BOARDS[level];
    const list = ring(b.points, p);
    if (who === "cat") b.chords.forEach((c) => {
      if (c[0] === p) list.push(c[1]);
      if (c[1] === p) list.push(c[0]);
    });
    return list;
  }

  // TABLE[level].mouse[k][c][m]: the cat (at c) catches the mouse (at m)
  // within k more cat steps, mouse to move. .cat[k][c][m]: the same, cat to move.
  const TABLE = {};
  function solve(level) {
    if (TABLE[level]) return TABLE[level];
    const n = BOARDS[level].points;
    const grid = () => Array.from({ length: n }, () => new Array(n).fill(false));
    const mouse = [grid()];
    const cat = [grid()];
    for (let k = 1; k <= MAX; k++) {
      const C = grid();
      const M = grid();
      for (let c = 0; c < n; c++) for (let m = 0; m < n; m++) {
        if (c !== m) C[c][m] = neighbours(level, "cat", c).some((c2) => c2 === m || mouse[k - 1][c2][m]);
      }
      for (let c = 0; c < n; c++) for (let m = 0; m < n; m++) {
        if (c === m) continue;
        const moves = neighbours(level, "mouse", m).filter((x) => x !== c);
        M[c][m] = moves.every((m2) => C[c][m2]);
      }
      mouse.push(M);
      cat.push(C);
    }
    TABLE[level] = { mouse: mouse, cat: cat };
    return TABLE[level];
  }

  // Fewest cat steps that are sure to catch the mouse (Infinity if never
  // within MAX). `turn` is who moves next.
  function steps(level, catAt, mouseAt, turn) {
    const t = solve(level)[turn === "cat" ? "cat" : "mouse"];
    for (let k = 1; k <= MAX; k++) if (t[k][catAt][mouseAt]) return k;
    return Infinity;
  }

  function distance(n, a, b) {
    const d = Math.abs(a - b);
    return Math.min(d, n - d);
  }

  // The starts of a level: cat and mouse at least three points apart on the
  // circle, and a catch needs between minSteps and maxSteps.
  function starts(level) {
    const b = BOARDS[level];
    const list = [];
    for (let c = 0; c < b.points; c++) for (let m = 0; m < b.points; m++) {
      if (distance(b.points, c, m) < 3) continue;
      const k = steps(level, c, m, "mouse");
      if (k >= b.minSteps && k <= b.maxSteps) list.push({ cat: c, mouse: m, steps: k });
    }
    return list;
  }

  // `mouseSide`: true when the person (against the computer) plays the
  // mouse; then the cat has one step less, so the mouse can get away. Two
  // people and a person as cat: the cat has just enough steps.
  function createInitialState(level, rng, mouseSide) {
    const lv = BOARDS[level] ? level : 2;
    const list = starts(lv);
    const s = list[Math.floor((rng || Math.random)() * list.length)];
    return {
      level: lv,
      cat: s.cat,
      mouse: s.mouse,
      start: { cat: s.cat, mouse: s.mouse },
      limit: mouseSide ? s.steps - 1 : s.steps,
      catSteps: 0,
      turn: "mouse",
      last: null,     // { who, from, to }
      result: null    // null | { winner: "cat" | "mouse" }
    };
  }

  function copy(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function left(state) {
    return state.limit - state.catSteps;
  }

  // Moves are the target points of the side to move.
  function getLegalMoves(state) {
    if (state.result) return [];
    if (state.turn === "cat") return neighbours(state.level, "cat", state.cat);
    return neighbours(state.level, "mouse", state.mouse).filter((p) => p !== state.cat);
  }

  function isLegalMove(state, to) {
    return getLegalMoves(state).indexOf(to) !== -1;
  }

  function applyMove(state, to) {
    const s = copy(state);
    if (s.turn === "cat") {
      s.last = { who: "cat", from: s.cat, to: to };
      s.cat = to;
      s.catSteps++;
      if (s.cat === s.mouse) s.result = { winner: "cat" };
      else if (s.catSteps >= s.limit) s.result = { winner: "mouse" };
      s.turn = "mouse";
    } else {
      s.last = { who: "mouse", from: s.mouse, to: to };
      s.mouse = to;
      s.turn = "cat";
      if (!getLegalMoves(s).length) s.result = { winner: "cat" };
    }
    // The mouse has no step left that keeps it free: it is caught.
    if (!s.result && s.turn === "mouse" && !getLegalMoves(s).length) s.result = { winner: "cat" };
    return s;
  }

  // Can the side to move still force its win with best play?
  function winning(state) {
    if (state.result) return null;
    const k = left(state);
    const t = solve(state.level);
    const catWins = state.turn === "cat" ? t.cat[k][state.cat][state.mouse] : t.mouse[k][state.cat][state.mouse];
    return state.turn === "cat" ? catWins : !catWins;
  }

  return { BOARDS, MAX, neighbours, solve, steps, starts, createInitialState, getLegalMoves, isLegalMove, applyMove, left, winning, distance, copy };
})();

if (typeof module !== "undefined") module.exports = MaeusekreisCore;
