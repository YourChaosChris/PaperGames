#!/usr/bin/env node
// tools/matches-gen.js
// Finds the fixed puzzles of "Matchstick Puzzles" (matches-core.js) and
// prints them as the RAW lists to paste into matches-core.js. Run once;
// the result is kept as data, and tests/matches-core.js checks every
// puzzle again.
//
//   node tools/matches-gen.js
//
// Sums: every true sum of a layout is the end point; moving 1 (or 2)
// matches backwards gives wrong sums whose digits and signs are all
// still valid (from at most 150 true sums per layout). A start is kept
// only if, searched forwards, it has exactly one solution with k moves
// and none with fewer.
// Squares: the outline of a set of cells (connected, inside the grid) is
// the start; a target number of squares is kept when it can be reached
// with k moves but not with fewer.
// 20 sums and 10 square figures per level, picked with a fixed seed.

const path = require("path");
const M = require(path.join(__dirname, "..", "matches-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const random = rng(20261012);
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function numbers(digits) {
  const out = [];
  const lo = digits === 1 ? 0 : Math.pow(10, digits - 1), hi = Math.pow(10, digits) - 1;
  for (let n = lo; n <= hi; n++) out.push(n);
  return out;
}

// True sums with the given digit counts.
function trueSums(da, db, dc) {
  const out = [];
  for (const a of numbers(da)) for (const b of numbers(db)) {
    if (String(a + b).length === dc) out.push(a + "+" + b + "=" + (a + b));
    if (a - b >= 0 && String(a - b).length === dc) out.push(a + "-" + b + "=" + (a - b));
  }
  return out;
}

// Wrong sums reachable from a true one by moving exactly k matches.
function backwards(trueStr, k) {
  const p = { kind: "e", start: trueStr, k };
  const start = M.startSlots(p), all = M.allSlots(p);
  const inStart = {};
  start.forEach((id) => { inStart[id] = true; });
  const free = all.filter((id) => !inStart[id]);
  const out = new Set();
  function take(list, n, at, acc, fn) {
    if (acc.length === n) { fn(acc); return; }
    for (let i = at; i < list.length; i++) { acc.push(list[i]); take(list, n, i + 1, acc, fn); acc.pop(); }
  }
  take(start, k, 0, [], (gone) => {
    const g = new Set(gone);
    const keep = start.filter((id) => !g.has(id));
    take(free, k, 0, [], (added) => {
      const s = M.readSum(trueStr, keep.concat(added));
      if (s && !M.sumIsTrue(s) && !/(^|[+=-])0\d/.test(s)) out.add(s);
    });
  });
  return [...out];
}

// Wrong sums for the layouts, shuffled; each is checked forwards until
// `need` good ones are found.
function sumCandidates(layouts, k, need) {
  const seen = new Set();
  layouts.forEach((l) => {
    const sums = shuffle(trueSums(l[0], l[1], l[2])).slice(0, 150);
    sums.forEach((t) => backwards(t, k).forEach((s) => seen.add(s)));
  });
  const out = [];
  for (const s of shuffle([...seen])) {
    const sols = M.solutions({ kind: "e", start: s, k }, k);
    if (sols.length === 1 && sols[0].moves === k) out.push("e:" + k + ":" + s);
    if (out.length >= need) break;
  }
  return out;
}

// Connected sets of cells in a w x h grid, of the given sizes.
function polyominoes(w, h, sizes) {
  const out = new Map();
  const cells = [];
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) cells.push([r, c]);
  for (let mask = 1; mask < (1 << cells.length); mask++) {
    const sel = cells.filter((_, i) => mask & (1 << i));
    if (sizes.indexOf(sel.length) < 0) continue;
    // connected?
    const key = (rc) => rc[0] + "," + rc[1];
    const set = new Set(sel.map(key)), seen = new Set([key(sel[0])]), stack = [sel[0]];
    while (stack.length) {
      const [r, c] = stack.pop();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const k2 = (r + dr) + "," + (c + dc);
        if (set.has(k2) && !seen.has(k2)) { seen.add(k2); stack.push([r + dr, c + dc]); }
      });
    }
    if (seen.size !== sel.length) continue;
    // must touch the top row and the left column (no shifted copies)
    if (!sel.some((rc) => rc[0] === 0) || !sel.some((rc) => rc[1] === 0)) continue;
    out.set(sel.map(key).join(";"), sel);
  }
  return [...out.values()];
}

function squareCandidates(w, h, sizes, k, maxSols) {
  const out = [];
  polyominoes(w, h, sizes).forEach((cells) => {
    const startN = cells.length;
    // Cells around a hole would close the hole as an extra square.
    if (M.countSquares(w, h, M.startSlots({ kind: "s", w, h, cells })).n !== startN) return;
    for (let n = 1; n <= w * h; n++) {
      if (n === startN) continue;
      const p = { kind: "s", w, h, n, cells, k };
      const sols = M.solutions(p, k);
      if (!sols.length || sols.some((s) => s.moves < k) || sols.length > maxSols) continue;
      out.push({ raw: "s:" + k + ":" + w + ":" + h + ":" + n + ":" + cells.map((rc) => rc.join(",")).join(";"), sols: sols.length });
    }
  });
  return out;
}

function pick(list, n, label) {
  if (list.length < n) throw new Error(label + ": only " + list.length + " candidates");
  return shuffle(list.slice()).slice(0, n);
}

// Square figures: moving one match works only on the wider grid (4
// figures); the others need two moves. Easy takes the figures with the
// most solutions, Hard those with at most two.
const sq1 = squareCandidates(4, 3, [3, 4, 5, 6, 7, 8], 1, 99);
const sq33 = shuffle(squareCandidates(3, 3, [3, 4, 5, 6, 7], 2, 99)).sort((a, b) => b.sols - a.sols);
const sq43 = shuffle(squareCandidates(4, 3, [4, 5, 6, 7, 8], 2, 99));
const easySq = sq1.slice(0, 4).concat(sq33.slice(0, 6));
const mediumSq = shuffle(sq33.slice(6).concat(sq43.filter((x) => x.sols >= 3))).slice(0, 10);
const hardSq = sq43.filter((x) => x.sols <= 2).slice(0, 10);
[easySq, mediumSq, hardSq].forEach((l, i) => { if (l.length < 10) throw new Error("squares level " + i + ": " + l.length); });
const levels = {
  easy: pick(sumCandidates([[1, 1, 1]], 1, 20), 20, "easy sums").concat(easySq.map((x) => x.raw)),
  medium: pick(sumCandidates([[2, 1, 2], [1, 1, 2], [2, 2, 2]], 1, 20), 20, "medium sums").concat(mediumSq.map((x) => x.raw)),
  hard: pick(sumCandidates([[1, 1, 1], [1, 1, 2]], 2, 20), 20, "hard sums").concat(hardSq.map((x) => x.raw))
};
console.log("  const RAW = {");
Object.keys(levels).forEach((lv, i, arr) => {
  console.log("    " + lv + ": [");
  const items = levels[lv].map((x) => JSON.stringify(x));
  for (let j = 0; j < items.length; j += 4) console.log("      " + items.slice(j, j + 4).join(", ") + (j + 4 < items.length ? "," : ""));
  console.log("    ]" + (i < arr.length - 1 ? "," : ""));
});
console.log("  };");
