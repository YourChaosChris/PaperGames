#!/usr/bin/env node
// Suchbild core (task 171). For every level and round: the grid has the
// level's size, the number of odd ones is within the level's range (1 to 10
// overall) and equals the odd signs on the page, the two signs of a round
// differ, every sign stays inside its own cell (so signs never overlap, odd
// ones included), the round is the same when made again from its seed, and
// rounds of a level differ. Play: tapping all odd ones solves the round, a
// normal sign is counted as wrong and changes nothing else, an odd one tapped
// twice counts once; itemAt finds the closest sign; the hint area holds an
// odd one not found yet and is smaller than the page; valid() refuses broken
// saves. Every sign name gives some svg markup.
const C = require("../suchbild-core.js");
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

let rounds = 0, signs = 0, odds = 0, minOdd = Infinity, maxOdd = 0;
for (const level of C.LEVELS) {
  const g = C.GRID[level];
  const seen = new Set();
  for (let r = 0; r < C.ROUNDS; r++) {
    const rd = C.round(level, r);
    rounds++;
    signs += rd.items.length;
    check(level + r + " grid", rd.cols === g.cols && rd.rows === g.rows && rd.items.length === g.cols * g.rows);
    const oi = C.oddIndexes(rd);
    odds += oi.length;
    minOdd = Math.min(minOdd, oi.length);
    maxOdd = Math.max(maxOdd, oi.length);
    check(level + r + " odd count " + oi.length, oi.length === rd.count && rd.count >= g.min && rd.count <= g.max && rd.count >= 1 && rd.count <= 10);
    check(level + r + " two different signs", rd.base !== rd.odd);
    // Each sign inside its own cell, with room to the cell border.
    let inside = true;
    rd.items.forEach((it, i) => {
      const cx = i % rd.cols, cy = (i - cx) / rd.cols;
      if (Math.abs(it.x - cx - 0.5) > C.JITTER + 1e-9 || Math.abs(it.y - cy - 0.5) > C.JITTER + 1e-9) inside = false;
    });
    check(level + r + " every sign inside its own cell (no overlap)", inside);
    // Closest centres at least 1 - 2 * JITTER cells apart.
    let minD = Infinity;
    rd.items.forEach((a, i) => rd.items.forEach((b, j) => { if (j > i) minD = Math.min(minD, Math.hypot(a.x - b.x, a.y - b.y)); }));
    check(level + r + " signs apart (" + minD.toFixed(2) + " cells)", minD >= 1 - 2 * C.JITTER - 1e-9);
    delete require.cache[require.resolve("../suchbild-core.js")];
    const fresh = require("../suchbild-core.js");
    check(level + r + " the same round when made again", JSON.stringify(fresh.round(level, r)) === JSON.stringify(rd));
    const key = rd.base + rd.odd + oi.join(",");
    check(level + r + " differs from the other rounds", !seen.has(key));
    seen.add(key);
    // Play the round.
    let s = C.newGame(level, r);
    const normal = rd.items.findIndex((it) => !it.odd);
    const w = C.tap(s, normal);
    check(level + r + " a normal sign is wrong", !w.ok && w.reason === "wrong" && w.state.wrong === 1 && w.state.found.length === 0);
    s = w.state;
    oi.forEach((i, k) => {
      const t = C.tap(s, i);
      if (!t.ok) check(level + r + " odd " + i + " " + t.reason, false);
      s = t.state;
      if (k === 0 && oi.length > 1) check(level + r + " the same odd one twice counts once", C.tap(s, i).reason === "again");
    });
    check(level + r + " all odd ones found solves it", s.solved && C.valid(s) && s.found.length === rd.count);
    // itemAt: the centre of each odd one finds it.
    check(level + r + " itemAt finds every odd one", oi.every((i) => C.itemAt(rd, rd.items[i].x, rd.items[i].y) === i));
    check(level + r + " itemAt outside the page", C.itemAt(rd, -3, -3) === -1);
    // Hint.
    const h = C.hintArea(C.newGame(level, r));
    const hi = rd.items[h.item];
    check(level + r + " hint area holds an odd one " + JSON.stringify(h), hi.odd && hi.x >= h.x && hi.x <= h.x + h.w && hi.y >= h.y && hi.y <= h.y + h.h && h.w * h.h < rd.cols * rd.rows && h.x >= 0 && h.y >= 0 && h.x + h.w <= rd.cols && h.y + h.h <= rd.rows);
    check(level + r + " no hint when solved", C.hintArea(s) === null);
  }
}
check("a sign and its move stay inside half a cell", C.SIGN_HALF * C.SIGN_SCALE + C.JITTER * C.UNIT < C.UNIT / 2);
check("1 to 10 odd ones overall (" + minOdd + " to " + maxOdd + ")", minOdd >= 1 && maxOdd <= 10);
check("every sign drawn", C.signNames().every((n) => /<(path|circle|rect|text|ellipse)/.test(C.sign(n))));
const s0 = C.newGame("hard", 1);
check("broken saves refused", !C.valid(null) && !C.valid(Object.assign({}, s0, { r: 7 })) && !C.valid(Object.assign({}, s0, { level: "x" })) && !C.valid(Object.assign({}, s0, { found: [C.round("hard", 1).items.findIndex((it) => !it.odd)] })) && !C.valid(Object.assign({}, s0, { found: [C.oddIndexes(C.round("hard", 1))[0], C.oddIndexes(C.round("hard", 1))[0]] })));
check("valid new game and JSON round trip", C.valid(s0) && C.valid(JSON.parse(JSON.stringify(s0))));
check("next round in a circle of five", C.nextRound(4) === 0);

console.log("=== SUCHBILD CORE: " + rounds + " rounds, " + signs + " signs, " + odds + " odd ones (" + minOdd + " to " + maxOdd + " per round), no overlap, reproducible, wrong taps, hint area, saves, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
