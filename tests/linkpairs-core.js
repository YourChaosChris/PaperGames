// linkpairs-core.js test
// "Link the Pairs": every stored puzzle in linkpairs-puzzles.js must have
// lines that run cell to cell through every cell of the board, exactly
// one solution (counting solver, no step limit), and per level the first
// 100 must be solvable with the hint alone - also after some wrong lines
// were drawn first.
const path = require("path");
const C = require(path.join(__dirname, "..", "linkpairs-core.js"));
const P = require(path.join(__dirname, "..", "linkpairs-puzzles.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const fails = [];
let total = 0;
const t0 = Date.now();
for (const level of ["easy", "medium", "hard"]) {
  const n = C.LEVELS[level].n;
  P[level].forEach((text, idx) => {
    total++;
    const tag = level + " #" + idx;
    const p = C.decode(level, text);
    const seen = new Set();
    let ok = true;
    p.solution.forEach((l, k) => {
      if (l.length < 3 || l[0] !== p.ends[k][0] || l[l.length - 1] !== p.ends[k][1]) ok = false;
      l.forEach((c, i) => { if (c < 0 || c >= n * n || seen.has(c) || (i && !C.adjacent(n, l[i - 1], c))) ok = false; seen.add(c); });
    });
    if (!ok || seen.size !== n * n) { fails.push(tag + ": lines do not cover the board properly"); return; }
    if (C.countSolutions(p, 2) !== 1) { fails.push(tag + ": not exactly one solution"); return; }
    if (idx >= 100) return;
    // Some wrong lines first: random walks from the symbols.
    const r = rng(idx * 17 + n);
    let lines = p.ends.map(() => []);
    p.ends.forEach((e, k) => {
      if (r() < 0.5) return;
      const l = [e[0]];
      for (let s = 0; s < 4; s++) {
        const opts = C.neighbours(n, l[l.length - 1]).filter((x) => l.indexOf(x) === -1 && C.endMap(p)[x] === -1);
        if (!opts.length) break;
        l.push(opts[Math.floor(r() * opts.length)]);
      }
      lines[k] = l;
    });
    let steps = 0;
    for (;;) {
      const h = C.findHint(p, lines);
      if (h.kind === "done") break;
      lines = C.applyLine(p, lines, h.pair, h.cells);
      if (++steps > p.ends.length * 2) break;
    }
    if (!C.isSolved(p, lines)) fails.push(tag + ": hint-only play did not solve it");
  });
}
fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== LINK THE PAIRS CORE: " + total + " stored puzzles, " + fails.length + " failures (" + ((Date.now() - t0) / 1000).toFixed(1) + " s) ===");
process.exit(fails.length ? 1 : 0);
