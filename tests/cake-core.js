// cake-core.js test
// "Who Took the Cake?": generates puzzles on every level from fixed seeds
// and checks that each one
//   - has exactly one solution and is solvable by deduction alone at its
//     level (no trying out),
//   - can be played to the end with the hint button: a wrong thing or a
//     wrong X is pointed out first, then each hint sets an animal (never
//     the cake), and once all animals stand the last hint only says that
//     one row and one column are free - and that cell is the cake's,
//   - has no "next to" clue that only holds through furniture behind a
//     wall (in another room), exactly one animal in the cake's room, and
//     no animal on a table, cupboard or plant.
// A fixed board checks "next to" across a wall directly.
// Clue counts: Easy has exactly 2 clues more than needed, Medium 1, Hard
// none (p.needed); the extra clues are positive ones ("is in", "sits on",
// ...) wherever such a clue is left; every animal keeps a clue. Average and
// range are printed. For the first 200 puzzles per level every hint step
// carries a reason, and the reason is checked here on its own: "free",
// "clue" and "row"/"col" are recomputed from the board, "lines", "rooms"
// and "groups" by the deduction at that depth. Every reason has a text
// with {A} (and {N}, {M} for clues) in all 12 languages.
const path = require("path");
const CakeCore = require(path.join(__dirname, "..", "cake-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER_LEVEL = 500;
const HINT_PLAY = 200;
const fs = require("fs");
const POSITIVE = ["in", "on", "next", "same", "window", "edge"];
const clueStats = {};
const reasonStats = {};
function checkReason(p, placed, h) {
  const n = p.n, k = h.thing, target = h.cell, r = h.reason;
  if (!r || !r.kind) return "no reason";
  const takenR = new Set(), takenC = new Set();
  placed.forEach((at, t) => { if (at >= 0 && t !== k) { takenR.add(Math.floor(at / n)); takenC.add(at % n); } });
  const standable = (t, i) => (t === n - 1 ? p.furniture[i] === "table" : ["table", "cupboard", "plant"].indexOf(p.furniture[i]) === -1);
  const cells = (t, clueIdx) => {
    const out = [];
    for (let i = 0; i < n * n; i++) if (!takenR.has(Math.floor(i / n)) && !takenC.has(i % n) && standable(t, i) && clueIdx.every((ci) => CakeCore.clueAllows(p, p.clues[ci], i))) out.push(i);
    return out;
  };
  const single = (cs) => cs.length === 1 && cs[0] === target;
  if (r.kind === "free") return single(cells(k, [])) ? null : "free does not hold";
  if (r.kind === "clue") {
    if (!r.clues.length || r.clues.some((ci) => p.clues[ci].a !== k)) return "clue not about this animal";
    return single(cells(k, r.clues)) ? null : "clue reason does not hold";
  }
  if (r.kind === "row" || r.kind === "col") {
    const f = r.kind === "row" ? (i) => Math.floor(i / n) : (i) => i % n;
    const own = (t) => p.clues.map((cl, ci) => (cl.a === t && cl.t !== "same" ? ci : -1)).filter((ci) => ci >= 0);
    for (let t = 0; t < n; t++) {
      if (t === k || placed[t] >= 0) continue;
      if (cells(t, own(t)).some((i) => f(i) === f(target))) return r.kind + ": something else fits";
    }
    const mine = cells(k, own(k)).filter((i) => f(i) === f(target));
    return single(mine) ? null : r.kind + ": not the only square";
  }
  const lv = { lines: 1, rooms: 2, groups: 3 }[r.kind];
  if (lv) {
    const d = CakeCore.deduce(p, lv, { placed, crosses: [] });
    return d.fixedAt[k] !== -1 ? null : r.kind + " does not fix it";
  }
  return "unknown reason " + r.kind;
}
const fails = [];
let total = 0;
for (const level of ["easy", "medium", "hard"]) {
  for (let seed = 1; seed <= PER_LEVEL; seed++) {
    total++;
    const tag = level + " #" + seed;
    const p = CakeCore.generatePuzzle(level, rng(seed * 7 + level.length * 1000));
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    const n = p.n;
    const wall = p.clues.find((cl) => {
      if (cl.t !== "next") return false;
      const i = p.solution[cl.a], r = Math.floor(i / n), c = i % n;
      const near = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
        .filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n).map(([y, x]) => y * n + x);
      return !near.some((j) => p.furniture[j] === cl.f && p.rooms[j] === p.rooms[i]);
    });
    if (wall) { fails.push(tag + ": \"next to\" only through another room"); continue; }
    const cakeRoom = p.rooms[p.solution[n - 1]];
    if (p.solution.slice(0, -1).filter((i) => p.rooms[i] === cakeRoom).length !== 1) { fails.push(tag + ": not one animal in the cake's room"); continue; }
    if (p.solution.slice(0, -1).some((i) => ["table", "cupboard", "plant"].indexOf(p.furniture[i]) !== -1)) { fails.push(tag + ": animal on a table, cupboard or plant"); continue; }
    if (p.furniture[p.solution[n - 1]] !== "table") { fails.push(tag + ": cake not on a table"); continue; }
    if (CakeCore.countSolutions(p, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
    const d = CakeCore.deduce(p, CakeCore.LEVELS[level].level);
    if (!d.solved || d.cells.some((c, k) => c !== p.solution[k])) { fails.push(tag + ": not solvable by deduction"); continue; }
    const extra = CakeCore.LEVELS[level].extra;
    if (typeof p.needed !== "number" || p.clues.length !== p.needed + extra) { fails.push(tag + ": " + p.clues.length + " clues, needed " + p.needed + " + " + extra); continue; }
    for (let a = 0; a < n - 1; a++) if (!p.clues.some((cl) => cl.a === a || cl.b === a)) fails.push(tag + ": an animal without a clue");
    const st = clueStats[level] || (clueStats[level] = { sum: 0, min: 99, max: 0, needSum: 0 });
    st.sum += p.clues.length; st.min = Math.min(st.min, p.clues.length); st.max = Math.max(st.max, p.clues.length); st.needSum += p.needed;
    // The extra clues are chosen positive first: from the full pool on an
    // empty clue list, every pick is positive while positive ones are left,
    // and no clue is picked twice.
    if (extra) {
      const pool = CakeCore.candidateClues(p, p.solution);
      if (!pool.length) fails.push(tag + ": no clue pool");
      const q = Object.assign({}, p, { clues: [] });
      CakeCore.addExtraClues(q, pool, 4);
      const posLeft = pool.filter((cl) => POSITIVE.indexOf(cl.t) !== -1).length;
      q.clues.forEach((cl, i) => {
        if (i < posLeft && POSITIVE.indexOf(cl.t) === -1) fails.push(tag + ": extra clue \"" + cl.t + "\" while positive ones were left");
        if (q.clues.indexOf(cl) !== i) fails.push(tag + ": extra clue picked twice");
      });
    }

    const placed = new Array(n).fill(-1);
    placed[0] = p.solution[0] === 0 ? 1 : 0;
    if (CakeCore.findHint(p, placed, []).kind !== "wrong") { fails.push(tag + ": wrong thing not reported"); continue; }
    placed[0] = -1;
    if (CakeCore.findHint(p, placed, [p.solution[1]]).kind !== "wrongx") { fails.push(tag + ": wrong X not reported"); continue; }

    let h, steps = 0, ok = true;
    for (;;) {
      h = CakeCore.findHint(p, placed, []);
      if (h.kind !== "step") break;
      if (h.thing === n - 1 || h.cell !== p.solution[h.thing]) { ok = false; break; }
      if (seed <= HINT_PLAY) {
        const bad = checkReason(p, placed, h);
        if (bad) { fails.push(tag + ": reason " + bad); ok = false; break; }
        const key = level + "/" + h.reason.kind;
        reasonStats[key] = (reasonStats[key] || 0) + 1;
      }
      placed[h.thing] = h.cell;
      steps++;
    }
    if (!ok || h.kind !== "last" || steps !== n - 1) { fails.push(tag + ": hint sequence broken (" + h.kind + ", " + steps + " steps)"); continue; }
    const rows = new Set(placed.slice(0, -1).map((i) => Math.floor(i / n)));
    const cols = new Set(placed.slice(0, -1).map((i) => i % n));
    let r = 0; while (rows.has(r)) r++;
    let c = 0; while (cols.has(c)) c++;
    if (r * n + c !== p.solution[n - 1]) { fails.push(tag + ": free row/column is not the cake's cell"); continue; }
    placed[n - 1] = p.solution[n - 1];
    if (CakeCore.findHint(p, placed, []).kind !== "done") fails.push(tag + ": not done with the cake in place");
  }
}

// Fixed board, 4x4: rooms 0 (columns 0-1) and 1 (columns 2-3), a wall
// between columns 1 and 2. The dog stands at row 0, column 1; a plant
// stands right of it at row 0, column 2 - behind the wall.
{
  total++;
  const rooms = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1];
  const furniture = new Array(16).fill(null);
  furniture[2] = "plant";
  furniture[8] = "table";
  const p = { n: 4, rooms, roomNames: ["kitchen", "garden"], furniture, window: { row: 3, side: "left" },
    clues: [{ t: "next", a: 0, f: "plant" }], solution: [1, 7, 14, 8] };
  if (CakeCore.clueAllows(p, p.clues[0], 1)) fails.push("fixed board: plant behind the wall counts as next to");
  if (CakeCore.isSolution(p, p.solution)) fails.push("fixed board: placement accepted with the plant behind the wall");
  furniture[5] = "plant";
  if (!CakeCore.clueAllows(p, p.clues[0], 1)) fails.push("fixed board: plant below in the same room does not count");
  // No animal stands on a plant.
  furniture[7] = "plant";
  if (CakeCore.baseCandidates(p, 1).indexOf(7) !== -1) fails.push("fixed board: an animal may stand on a plant");
}

// Every reason has its text in every language, with the right placeholders.
{
  const kinds = { free: ["{A}"], clue: ["{A}", "{N}"], clue2: ["{A}", "{N}", "{M}"], row: ["{A}"], col: ["{A}"], lines: ["{A}"], rooms: ["{A}"], groups: ["{A}"], general: ["{A}"] };
  const filesByLang = { en: "i18n.js" };
  ["de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"].forEach((l) => { filesByLang[l] = "lang/" + l + ".js"; });
  for (const [lang, file] of Object.entries(filesByLang)) {
    const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    for (const [kind, marks] of Object.entries(kinds)) {
      const m = new RegExp("\\n\\s*cake_why_" + kind + ": \"([^\"]*)\"").exec(src);
      if (!m) { fails.push(lang + ": no text for reason " + kind); continue; }
      marks.forEach((mk) => { if (m[1].indexOf(mk) === -1) fails.push(lang + ": reason " + kind + " without " + mk); });
      const filled = CakeCore.fill(m[1], { A: "X", N: "2", M: "3" });
      if (/[{}]|cake_/.test(filled)) fails.push(lang + ": reason " + kind + " leaves a raw key or placeholder");
    }
    for (let i = 1; i <= 4; i++) if (!new RegExp("\\n\\s*cake_always_" + i + ": \"").test(src)) fails.push(lang + ": no rule " + i + " for Always true");
  }
}

Object.keys(clueStats).forEach((lv) => {
  const st = clueStats[lv];
  console.log(lv + ": clues on average " + (st.sum / PER_LEVEL).toFixed(2) + " (" + st.min + "-" + st.max + "), needed on average " + (st.needSum / PER_LEVEL).toFixed(2));
});
console.log("hint reasons (first " + HINT_PLAY + " puzzles per level): " + JSON.stringify(reasonStats));
fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== CAKE CORE: " + total + " puzzles, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
