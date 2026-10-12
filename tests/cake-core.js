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

// The themes: the same puzzles with other suspects and things - cats and
// a fish, bears and cookies, dogs and a ball, magpies and a key, a family
// and the cake, children and a treasure. Every clue, thing name, win line
// and the texts that name the thing read without a raw key in every
// language, and no theme text mentions the cake unless the theme's thing
// is the cake; themes with people have their own "nobody stands on ..."
// text. Every suspect of a theme has a drawing, and so do the thing and
// the thing on the table; suspects of one theme are drawn differently.
let catTexts = 0;
const THEMES = CakeCore.MOTIFS.filter((m) => m !== "animals");
{
  const { loadI18n } = require("./load-i18n.js");
  const CakeIcons = require(path.join(__dirname, "..", "cake-icons.js"));
  const STRINGS = loadI18n({ texts: false }).STRINGS;
  const cakeWord = { en: /cake/i, de: /Kuchen/, fr: /gâteau/i, es: /pastel/i, it: /torta/i, nl: /taart/i, pl: /ciast(?!ecz)/i, uk: /торт/i, ru: /торт/i, ja: /ケーキ/, zh: /蛋糕/, ar: /كعك/ };
  THEMES.forEach((motif) => {
    const th = CakeCore.THEMES[motif];
    const drawn = new Set();
    th.who.concat([th.thing, "table" + th.thing]).forEach((id) => {
      if (!CakeIcons.icons[id]) fails.push(motif + ": no drawing for " + id);
      else drawn.add(CakeIcons.icons[id]);
    });
    if (drawn.size !== th.who.length + 2) fails.push(motif + ": two drawings are the same");
  });
  for (const lang of Object.keys(STRINGS)) {
    const t = (k) => (STRINGS[lang][k] !== undefined ? STRINGS[lang][k] : STRINGS.en[k] !== undefined ? STRINGS.en[k] : k);
    THEMES.forEach((motif) => {
      const check = (what, text) => {
        catTexts++;
        if (/[{}]|cake_|undefined/.test(text)) fails.push(lang + " " + motif + ": " + what + " \"" + text + "\"");
        if (CakeCore.THEMES[motif].thing !== "cake" && cakeWord[lang] && cakeWord[lang].test(text)) fails.push(lang + " " + motif + ": " + what + " names the cake: \"" + text + "\"");
      };
      if (STRINGS[lang]["cake_motif_" + motif] === undefined) fails.push(lang + " lacks cake_motif_" + motif);
      CakeCore.THEMES[motif].who.forEach((id) => ["name", "cap", "mid", "is", "isnot", "sits"].forEach((f) => {
        if (STRINGS[lang]["cake_" + id + "_" + f] === undefined) fails.push(lang + " lacks cake_" + id + "_" + f);
      }));
      for (const level of Object.keys(CakeCore.LEVELS)) {
        for (let seed = 1; seed <= 20; seed++) {
          const p = CakeCore.generatePuzzle(level, rng(seed * 977 + 13));
          if (!p) continue;
          p.motif = motif;
          p.clues.forEach((cl) => check("clue", CakeCore.clueText(p, cl, t)));
          for (let k = 0; k < p.n; k++) check("thing", CakeCore.thingName(p, k, t));
          check("win", t("cake_win_" + CakeCore.animalId(p, CakeCore.culprit(p))));
        }
      }
      ["cake_hint_last", "cake_always_1", "cake_always_2", "cake_always_4"].forEach((k) => {
        const key = CakeCore.themed({ motif }, k);
        if (STRINGS[lang][key] === undefined) fails.push(lang + " lacks " + key);
        check(k, t(key));
      });
      const k3 = CakeCore.always3Key({ motif });
      if (STRINGS[lang][k3] === undefined) fails.push(lang + " lacks " + k3);
      check("cake_always_3", t(k3));
      if (CakeCore.THEMES[motif].people && k3 === "cake_always_3") fails.push(motif + ": people theme says animals never stand on a table");
    });
  }
}

// 500 cases per newer theme (bears, dogs, magpies, family, treasure),
// spread over the levels:
// the theme is set on the generated puzzle, which keeps exactly one
// solution and stays solvable by deduction at its level; culprit and
// thing come from the theme.
const NEW_THEMES = ["bears", "dogs", "magpies", "family", "treasure"];
const themeCases = {};
NEW_THEMES.forEach((motif, ti) => {
  let ok = 0;
  const levels = Object.keys(CakeCore.LEVELS);
  for (let i = 0; i < 500; i++) {
    const level = levels[i % levels.length];
    const p = CakeCore.generatePuzzle(level, rng(70000 + ti * 1000 + i));
    const tag = motif + " #" + (i + 1);
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    p.motif = motif;
    if (CakeCore.countSolutions(p, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
    if (!CakeCore.isSolution(p, p.solution)) { fails.push(tag + ": stored solution breaks a rule"); continue; }
    const d = CakeCore.deduce(p, CakeCore.LEVELS[level].level);
    if (!d || !d.solved || d.cells.some((c, k) => c !== p.solution[k])) { fails.push(tag + ": not solvable by deduction"); continue; }
    if (CakeCore.thingId(p, p.n - 1) !== CakeCore.THEMES[motif].thing) fails.push(tag + ": wrong thing");
    if (CakeCore.THEMES[motif].who.indexOf(CakeCore.animalId(p, CakeCore.culprit(p))) === -1) fails.push(tag + ": culprit not from the theme");
    ok++;
  }
  themeCases[motif] = ok;
});
console.log("themes: " + NEW_THEMES.map((m) => m + " " + themeCases[m] + "/500 solvable with exactly one solution").join(", "));

Object.keys(clueStats).forEach((lv) => {
  const st = clueStats[lv];
  console.log(lv + ": clues on average " + (st.sum / PER_LEVEL).toFixed(2) + " (" + st.min + "-" + st.max + "), needed on average " + (st.needSum / PER_LEVEL).toFixed(2));
});
console.log("hint reasons (first " + HINT_PLAY + " puzzles per level): " + JSON.stringify(reasonStats));
fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== CAKE CORE: " + total + " puzzles, " + catTexts + " theme texts checked, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
