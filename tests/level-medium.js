// Task 208: the "Medium" level of Yut, Zoowurf, Sternjagd and Pairs plays
// noticeably differently from Easy and Hard. Every random number comes
// from a fixed seed (Math.random is replaced), so the numbers are the same
// on every run. Run: node tests/level-medium.js
function lcg(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
Math.random = lcg(208);

const Y = require("../yut-core.js");
const YAI = require("../yut-ai.js");
const Z = require("../zoowurf-core.js");
const S = require("../sternjagd-core.js");
global.PairsCore = require("../pairs-core.js");
const PAI = require("../pairs-ai.js");

const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
const pct = (x) => (100 * x).toFixed(1) + "%";

// ---- Yut: level 1 easy, 3 medium, 2 hard (the select's values) ----
function yut(levelA, levelB, games) {
  let a = 0;
  for (let g = 0; g < games; g++) {
    const rng = lcg(1000 + g);
    let s = Y.createGame({ players: 2 });
    const level = g % 2 ? [levelB, levelA] : [levelA, levelB];
    const seatA = g % 2 ? 1 : 0;
    let guard = 0;
    while (!Y.isOver(s) && guard++ < 20000) {
      if (s.owed > 0) s = Y.addThrow(s, Y.throwSticks(rng));
      s = Y.skipUnusable(s);
      if (Y.isOver(s) || (s.owed > 0 && !s.pending.length)) continue;
      const m = YAI.chooseMove(s, rng, level[s.turn]);
      if (!m) continue;
      s = Y.applyMove(s, m);
    }
    if (s.winner === seatA) a++;
  }
  return a / games;
}
const yMe = yut(3, 1, 300), yHm = yut(2, 3, 300);
console.log("Yut: medium against easy " + pct(yMe) + ", hard against medium " + pct(yHm));
check("Yut: medium beats easy", yMe > 0.55);
check("Yut: hard beats medium", yHm > 0.5);

// ---- Zoowurf: "beginner", "medium", normal (no level) ----
function zoo(levelA, levelB, games) {
  let a = 0;
  for (let i = 0; i < games; i++) {
    const rng = Z.makeRng(3000 + i);
    const seatA = i % 2;
    const levels = seatA ? [levelB, levelA] : [levelA, levelB];
    let g = Z.newGame({ players: 2, computer: [true, true], rng: rng });
    let guard = 0;
    while (g.phase !== "over" && guard++ < 3000) {
      const lv = levels[g.current];
      if (lv) g.level = lv; else delete g.level;
      g = Z.aiStep(g, rng);
    }
    if (g.winners && g.winners.indexOf(seatA) >= 0) a += 1 / g.winners.length;
  }
  return a / games;
}
const zMe = zoo("medium", "beginner", 600), zNm = zoo(null, "medium", 600);
console.log("Zoowurf: medium against beginner " + pct(zMe) + ", normal against medium " + pct(zNm));
check("Zoowurf: medium beats beginner", zMe > 0.53);
check("Zoowurf: normal beats medium", zNm > 0.5);

// ---- Sternjagd: 1 easy, 2 medium, 3 hard ----
function stern(l0, l1, games) {
  let w = 0;
  for (let g = 0; g < games; g++) {
    let s = S.newGame({ players: 2, computer: [true, true], first: g % 2 });
    let guard = 0;
    while (s.phase !== "over" && guard++ < 5000) {
      s.level = s.current === 0 ? l0 : l1;
      s = S.aiStep(s);
    }
    if (s.winner === 0) w++;
  }
  return w / games;
}
const sMe = stern(2, 1, 400), sHm = stern(3, 2, 400);
console.log("Sternjagd: medium against easy " + pct(sMe) + ", hard against medium " + pct(sHm));
check("Sternjagd: medium beats easy", sMe > 0.53);
check("Sternjagd: hard beats medium", sHm > 0.5);

// ---- Pairs: 1 easy recalls nothing, 2 medium the last six cards, 3 hard all ----
// A pair (cards 0 and 1) was seen; afterwards `gap` other cards were shown.
function pairsPicks(level, gap, tries) {
  let found = 0;
  for (let t = 0; t < tries; t++) {
    const cards = [];
    for (let k = 0; k < 16; k++) cards.push(Math.floor(k / 2));
    const state = { cards: cards, taken: cards.map(() => null), open: [] };
    const seen = [0, 1];
    for (let k = 0; k < gap; k++) seen.push(2 + 2 * k);   // one card of each other pair
    const c = PAI.chooseCard(state, seen, level);
    if (c === 0 || c === 1) found++;
  }
  return found / tries;
}
const p = {};
[1, 2, 3].forEach((lv) => { p[lv] = [pairsPicks(lv, 2, 200), pairsPicks(lv, 6, 200)]; });
console.log("Pairs: known pair taken right away (seen 2 / 6 cards ago): easy " + p[1].map(pct).join(" / ") + ", medium " + p[2].map(pct).join(" / ") + ", hard " + p[3].map(pct).join(" / "));
check("Pairs: easy does not remember the pair", p[1][0] < 0.35);
check("Pairs: medium remembers a pair seen 2 cards ago", p[2][0] === 1);
check("Pairs: medium has forgotten a pair seen 6 cards ago", p[2][1] < 0.35);
check("Pairs: hard remembers both", p[3][0] === 1 && p[3][1] === 1);

if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
console.log("=== LEVEL MEDIUM: Yut, Zoowurf, Sternjagd, Pairs - medium plays between easy and hard, 0 failure(s) ===");
