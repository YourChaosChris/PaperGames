// linkpairs-core.js
// "Link the Pairs" - connect equal symbols with lines. Dependency-free,
// no DOM.
//
// The board is n x n cells (cell i = row * n + col). Some cells hold a
// symbol, every symbol exactly twice. Each pair is joined by a line that
// runs from cell to cell, horizontally and vertically, never diagonally.
// Lines never cross or share a cell, and the puzzle is solved when every
// pair is joined and every cell is used by a line.
//
// A puzzle:
//   n         board size
//   ends      [[a, b], ...] the two cells of each pair (pair k = symbol k)
//   solution  [[cells from a to b], ...] the one solution, per pair
//
// Levels: easy 5 x 5, medium 7 x 7, hard 9 x 9. Every puzzle is checked
// with the counting solver below to have exactly one solution.

const LinkPairsCore = (function () {
  // start: lines the first cut makes; most: how far splitting may go
  // before the attempt is dropped (merging brings the count down again).
  const LEVELS = {
    easy: { n: 5, start: 3, most: 12 },
    medium: { n: 7, start: 5, most: 20 },
    hard: { n: 9, start: 6, most: 30 }
  };

  // Search steps a uniqueness check may take while making a puzzle; a
  // case that needs more is dropped rather than waited for.
  const GEN_STEPS = 200000;

  function neighbours(n, i) {
    const r = Math.floor(i / n), c = i % n, out = [];
    if (r > 0) out.push(i - n);
    if (c < n - 1) out.push(i + 1);
    if (r < n - 1) out.push(i + n);
    if (c > 0) out.push(i - 1);
    return out;
  }

  function adjacent(n, a, b) {
    return neighbours(n, a).indexOf(b) !== -1;
  }

  // Which pair's symbol stands on each cell (-1 = none).
  function endMap(p) {
    const m = new Array(p.n * p.n).fill(-1);
    p.ends.forEach((e, k) => { m[e[0]] = k; m[e[1]] = k; });
    return m;
  }

  /*** Counting solver ***/

  // Counts solutions up to `limit` (default 2); with `maxSteps` it gives
  // up after that many search steps and returns -1. Cells are filled row by
  // row; each cell gets its links to the right and down, so that every
  // symbol cell has one link and every other cell two. Linked cells form
  // pieces (union-find with undo); a piece may not close into a ring,
  // may not join two different symbols, and once it has no open link
  // left it must run from one symbol to its twin.
  function countSolutions(p, limit, collect, maxSteps) {
    const n = p.n, N = n * n, lim = limit || 2;
    let steps = 0, gaveUp = false;
    const sym = endMap(p);
    const right = new Uint8Array(N), down = new Uint8Array(N);
    const parent = new Int32Array(N), size = new Int32Array(N);
    const colour = new Int32Array(N), open = new Int32Array(N), endsIn = new Int32Array(N);
    const undo = [];
    let count = 0;
    const found = [];
    function find(x) { while (parent[x] !== x) x = parent[x]; return x; }
    // Joins the pieces of a and b; false if that makes a ring or mixes
    // two symbols. Every change is pushed on `undo`.
    function join(a, b) {
      let ra = find(a), rb = find(b);
      if (ra === rb) return false;
      if (colour[ra] >= 0 && colour[rb] >= 0 && colour[ra] !== colour[rb]) return false;
      if (size[ra] < size[rb]) { const t = ra; ra = rb; rb = t; }
      undo.push([rb, ra, colour[ra], open[ra], endsIn[ra], size[ra]]);
      parent[rb] = ra;
      size[ra] += size[rb];
      if (colour[ra] < 0) colour[ra] = colour[rb];
      open[ra] += open[rb];
      endsIn[ra] += endsIn[rb];
      return true;
    }
    function rec(i) {
      if (count >= lim || gaveUp) return;
      if (maxSteps && ++steps > maxSteps) { gaveUp = true; return; }
      if (i === N) {
        count++;
        if (collect) found.push({ right: right.slice(), down: down.slice() });
        return;
      }
      const r = Math.floor(i / n), c = i % n;
      const deg = sym[i] >= 0 ? 1 : 2;
      const inL = c > 0 && right[i - 1] ? 1 : 0, inU = r > 0 && down[i - n] ? 1 : 0;
      const need = deg - inL - inU;
      if (need < 0) return;
      const canR = c < n - 1, canD = r < n - 1;
      const options = [];
      if (need === 0) options.push([0, 0]);
      else if (need === 1) { if (canR) options.push([1, 0]); if (canD) options.push([0, 1]); }
      else if (canR && canD) options.push([1, 1]);
      for (const [R, D] of options) {
        const mark = undo.length;
        parent[i] = i; size[i] = 1;
        colour[i] = sym[i]; open[i] = R + D; endsIn[i] = sym[i] >= 0 ? 1 : 0;
        let ok = true;
        // Each incoming link uses up one open link of the piece it comes from.
        if (inL) { const rl = find(i - 1); open[rl]--; undo.push([-1, rl]); if (!join(i, i - 1)) ok = false; }
        if (ok && inU) { const ru = find(i - n); open[ru]--; undo.push([-1, ru]); if (!join(i, i - n)) ok = false; }
        if (ok) {
          const root = find(i);
          // A finished piece must join a symbol to its twin.
          if (open[root] === 0 && endsIn[root] !== 2) ok = false;
        }
        if (ok) {
          right[i] = R; down[i] = D;
          rec(i + 1);
          right[i] = 0; down[i] = 0;
        }
        // Undo joins and the open-link bookkeeping in reverse order.
        while (undo.length > mark) {
          const u = undo.pop();
          if (u[0] === -1) open[u[1]]++;
          else {
            const rb = u[0], ra = u[1];
            parent[rb] = rb;
            colour[ra] = u[2]; open[ra] = u[3]; endsIn[ra] = u[4]; size[ra] = u[5];
          }
        }
        if (count >= lim || gaveUp) return;
      }
    }
    rec(0);
    // -1: the search gave up after maxSteps (only when asked to).
    if (gaveUp) count = -1;
    if (collect) return { count, links: found };
    return count;
  }

  // Turns the right/down links of a solution into one cell list per pair.
  function pathsFromLinks(p, links) {
    const n = p.n;
    const linked = (a, b) => {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      return hi - lo === 1 ? !!links.right[lo] : !!links.down[lo];
    };
    return p.ends.map(([a]) => {
      const path = [a];
      let prev = -1, cur = a;
      for (;;) {
        const next = neighbours(n, cur).find((x) => x !== prev && linked(cur, x));
        if (next === undefined) break;
        path.push(next);
        prev = cur; cur = next;
      }
      return path;
    });
  }

  function solve(p) {
    const res = countSolutions(p, 1, true);
    return res.count ? pathsFromLinks(p, res.links[0]) : null;
  }

  /*** Generator ***/

  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // A random path through every cell (a Hamiltonian path), made by
  // "backbite" moves from a zig-zag start.
  function hamiltonianPath(n, rnd) {
    const path = [];
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) path.push(r * n + (r % 2 ? n - 1 - k : k));
    const pos = new Int32Array(n * n);
    const index = () => path.forEach((cell, i) => { pos[cell] = i; });
    index();
    const steps = n * n * n * 10;
    for (let s = 0; s < steps; s++) {
      if (rnd() < 0.5) path.reverse(), index();
      // Backbite at the end: join the end to a neighbour x and reverse
      // the piece after x.
      const end = path[path.length - 1];
      const opts = neighbours(n, end).filter((x) => x !== path[path.length - 2]);
      const x = opts[Math.floor(rnd() * opts.length)];
      const j = pos[x];
      const tail = path.splice(j + 1).reverse();
      for (const c of tail) path.push(c);
      for (let t = j + 1; t < path.length; t++) pos[path[t]] = t;
    }
    return path;
  }

  // Cuts the path into k lines of at least 3 cells each.
  function cutPath(path, k, rnd) {
    const L = path.length;
    for (let tries = 0; tries < 50; tries++) {
      const cuts = new Set();
      while (cuts.size < k - 1) cuts.add(3 + Math.floor(rnd() * (L - 5)));
      const sorted = Array.from(cuts).sort((a, b) => a - b);
      const lines = [];
      let start = 0;
      for (const cut of sorted.concat([L])) {
        lines.push(path.slice(start, cut));
        start = cut;
      }
      if (lines.every((l) => l.length >= 3)) return lines;
    }
    return null;
  }

  // Orders the lines by their first symbol on the board (symbol 1 is the
  // one nearest the top left) and runs each from its lower cell.
  function makePuzzle(level, n, lines) {
    const sorted = lines.map((l) => (l[0] < l[l.length - 1] ? l : l.slice().reverse()))
      .sort((a, b) => a[0] - b[0]);
    return { level, n, ends: sorted.map((l) => [l[0], l[l.length - 1]]), solution: sorted };
  }

  // Fewer, longer lines: two lines whose ends touch become one line as
  // long as the puzzle keeps exactly one solution.
  function mergeLines(level, n, lines, rnd) {
    let cur = lines.map((l) => l.slice());
    let changed = true;
    while (changed) {
      changed = false;
      const pairs = [];
      for (let a = 0; a < cur.length; a++) {
        for (let b = a + 1; b < cur.length; b++) {
          for (const ea of [0, 1]) for (const eb of [0, 1]) {
            const ca = ea ? cur[a][cur[a].length - 1] : cur[a][0];
            const cb = eb ? cur[b][cur[b].length - 1] : cur[b][0];
            if (adjacent(n, ca, cb)) pairs.push([a, b, ea, eb]);
          }
        }
      }
      shuffle(pairs, rnd);
      for (const [a, b, ea, eb] of pairs) {
        const la = ea ? cur[a] : cur[a].slice().reverse();
        const lb = eb ? cur[b].slice().reverse() : cur[b];
        const next = cur.filter((_, j) => j !== a && j !== b).concat([la.concat(lb)]);
        if (countSolutions(makePuzzle(level, n, next), 2, false, GEN_STEPS) === 1) { cur = next; changed = true; break; }
      }
    }
    return makePuzzle(level, n, cur);
  }

  // { level, n, ends, solution } with exactly one solution. rng: () => [0, 1).
  // A random path through all cells is cut into lines. While the solver
  // finds a second solution, a line that runs through a cell where the
  // two solutions differ is split in two there - one more pair, and
  // that alternative is gone.
  function generatePuzzle(level, rng) {
    const rnd = rng || Math.random;
    const cfg = LEVELS[level] || LEVELS.easy;
    const n = cfg.n;
    for (let attempt = 0; attempt < 500; attempt++) {
      let lines = cutPath(hamiltonianPath(n, rnd), cfg.start, rnd);
      if (!lines) continue;
      for (;;) {
        const p = makePuzzle(level, n, lines);
        const res = countSolutions(p, 2, true, GEN_STEPS);
        if (res.count === -1) break;
        if (res.count === 1) return mergeLines(level, n, p.solution, rnd);
        if (lines.length >= cfg.most) break;
        // Cells whose links differ between the intended and the other solution.
        const other = pathsFromLinks(p, res.links.find((lk) => !pathsFromLinks(p, lk).every((l, k) => samePath(l, p.solution[k]))) || res.links[1]);
        const otherNext = new Map();
        other.forEach((l) => l.forEach((c, i) => otherNext.set(c, [l[i - 1], l[i + 1]].filter((x) => x !== undefined).sort().join())));
        const options = [];
        p.solution.forEach((l, k) => {
          for (let i = 2; i <= l.length - 4; i++) {
            const here = [l[i - 1], l[i + 1]].filter((x) => x !== undefined).sort().join();
            if (otherNext.get(l[i]) !== here) options.push([k, i]);
          }
        });
        if (!options.length) break;
        const [k, i] = options[Math.floor(rnd() * options.length)];
        const l = p.solution[k];
        lines = p.solution.filter((_, j) => j !== k).concat([l.slice(0, i + 1), l.slice(i + 1)]);
      }
    }
    return null;
  }

  /*** Stored puzzles ***/

  // A puzzle as text: its lines, comma-separated, each as the start cell
  // (two base-36 digits) followed by the steps U, R, D, L.
  const STEP = { U: -1, R: 1, D: 1, L: -1 };
  function encode(p) {
    const n = p.n;
    return p.solution.map((l) => {
      let s = (l[0] < 36 ? "0" : "") + l[0].toString(36);
      for (let i = 1; i < l.length; i++) {
        const d = l[i] - l[i - 1];
        s += d === -n ? "U" : d === n ? "D" : d === 1 ? "R" : "L";
      }
      return s;
    }).join(",");
  }

  function decode(level, text) {
    const n = (LEVELS[level] || LEVELS.easy).n;
    const lines = text.split(",").map((s) => {
      let c = parseInt(s.slice(0, 2), 36);
      const l = [c];
      for (const ch of s.slice(2)) {
        c += ch === "U" || ch === "D" ? STEP[ch] * n : STEP[ch];
        l.push(c);
      }
      return l;
    });
    return makePuzzle(level, n, lines);
  }

  /*** Play ***/

  // lines: per pair, the cells drawn so far starting at one of its
  // symbols ([] = nothing). Is pair k joined?
  function lineComplete(p, lines, k) {
    const l = lines[k], e = p.ends[k];
    if (!l || l.length < 2) return false;
    return (l[0] === e[0] && l[l.length - 1] === e[1]) || (l[0] === e[1] && l[l.length - 1] === e[0]);
  }

  function coveredCount(p, lines) {
    const seen = new Set();
    lines.forEach((l) => l.forEach((c) => seen.add(c)));
    // Symbols count as used once their line is drawn; an untouched symbol
    // cell is still empty.
    return seen.size;
  }

  function isSolved(p, lines) {
    return p.ends.every((_, k) => lineComplete(p, lines, k)) && coveredCount(p, lines) === p.n * p.n;
  }

  function samePath(a, b) {
    if (a.length !== b.length) return false;
    if (a.every((c, i) => c === b[i])) return true;
    return a.every((c, i) => c === b[b.length - 1 - i]);
  }

  // The next line to show: the first pair whose drawn line is not its
  // solution line. { kind: "line", pair, cells } | { kind: "done" }.
  function findHint(p, lines) {
    for (let k = 0; k < p.ends.length; k++) {
      if (!lines[k] || !samePath(lines[k], p.solution[k])) return { kind: "line", pair: k, cells: p.solution[k].slice() };
    }
    return { kind: "done" };
  }

  // Draws the solution line of pair k into `lines` (a new array is
  // returned); any other line that runs over one of its cells is cut back
  // to just before that cell.
  function applyLine(p, lines, k, cells) {
    const taken = new Set(cells);
    return lines.map((l, j) => {
      if (j === k) return cells.slice();
      const cut = l.findIndex((c) => taken.has(c));
      if (cut === -1) return l.slice();
      return cut <= 1 ? [] : l.slice(0, cut);
    });
  }

  return {
    LEVELS, neighbours, adjacent, endMap, countSolutions, solve, generatePuzzle, encode, decode,
    lineComplete, coveredCount, isSolved, samePath, findHint, applyLine,
    hamiltonianPath, cutPath
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = LinkPairsCore;
}
if (typeof window !== "undefined") {
  window.LinkPairsCore = LinkPairsCore;
}
