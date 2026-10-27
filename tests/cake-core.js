// cake-core.js test
// "Who Took the Cake?" (rules 3, task 146): generates 500 puzzles per
// level from fixed seeds and checks each one against the rules, written
// out here on their own (not taken from the core), so a change there is
// caught:
//   1. the level's own number of rooms (Easy 5x5 with 3, Medium 6x6 with
//      4, Hard 7x7 with 5 - never N or N-1), exactly one animal in every
//      room;
//   2. the cake is given on the board and never on an animal's square;
//   3. no two animals next to each other, not even diagonally;
//   4. exactly one animal next to the cake (side or corner) - the culprit.
// Every clue is true for the stored solution (recomputed here), the puzzle
// has exactly one solution, is solvable by deduction alone at its level,
// and has exactly cfg.extra clues more than needed (Easy 2, Medium 1, Hard
// none); every animal is named by a clue. The hint button plays every
// puzzle to the end: a wrong animal or a wrong X is pointed out first,
// then each hint sets an animal with a reason that is checked on its own
// for the first 200 puzzles per level ("free", "clue" and "room"
// recomputed from the board, "rules", "pairs", "try" by the deduction at
// that depth), and once all animals stand, "done".
// Measured and printed per level: unique and deducible count, how many
// need deduction level 2 or 3, clues (average and range), clues needed,
// time to generate (average and slowest).
// Also: a fixed board for each rule, old saves (rules 1 with furniture,
// rules 2 with the cake as a placed piece) are not current, every text in
// all 12 languages, every theme.
const path = require("path");
const fs = require("fs");
const CakeCore = require(path.join(__dirname, "..", "cake-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER_LEVEL = 500;
const HINT_PLAY = 200;
const fails = [];
let total = 0;

// The rules, on their own.
const touch = (n, i, j) => i !== j && Math.abs(Math.floor(i / n) - Math.floor(j / n)) <= 1 && Math.abs((i % n) - (j % n)) <= 1;
const ROOMS_BY_SIZE = { 5: 3, 6: 4, 7: 5 };
function ruleProblem(p, animals) {
  const n = p.n, cake = p.cake, m = ROOMS_BY_SIZE[n];
  const roomCount = new Set(p.rooms).size;
  if (roomCount !== m || animals.length !== m) return "board " + n + "x" + n + " has " + roomCount + " rooms, " + animals.length + " animals";
  if (new Set(animals.map((i) => p.rooms[i])).size !== m) return "not one animal in every room";
  if (!(cake >= 0 && cake < n * n)) return "no cake on the board";
  if (animals.indexOf(cake) !== -1) return "cake on an animal";
  for (let a = 0; a < animals.length; a++) for (let b = a + 1; b < animals.length; b++) if (animals[a] === animals[b] || touch(n, animals[a], animals[b])) return "two animals next to each other";
  if (animals.filter((i) => touch(n, i, cake)).length !== 1) return "not exactly one animal next to the cake";
  return null;
}
function clueTrue(p, cl, cells) {
  const n = p.n, at = cells[cl.a], size = (i) => p.rooms.filter((r) => r === p.rooms[i]).length;
  const row = (i) => Math.floor(i / n), col = (i) => i % n;
  switch (cl.t) {
    case "size": return size(at) === cl.size;
    case "higher": return row(at) < row(cells[cl.b]);
    case "left": return col(at) < col(cells[cl.b]);
    case "border": {
      const x = p.rooms[at], y = p.rooms[cells[cl.b]];
      if (x === y) return false;
      for (let i = 0; i < n * n; i++) {
        if (p.rooms[i] !== x) continue;
        const r = row(i), c = col(i);
        for (const [yy, xx] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) if (yy >= 0 && yy < n && xx >= 0 && xx < n && p.rooms[yy * n + xx] === y) return true;
      }
      return false;
    }
    case "steps": return cl.d >= 2 && Math.abs(row(at) - row(p.cake)) + Math.abs(col(at) - col(p.cake)) === cl.d;
    default: return false;
  }
}
const namesThing = (p, cl, k) => cl.a === k || cl.b === k;
const oneAnimal = (cl) => cl.t === "size" || cl.t === "steps";

// A hint reason, recomputed from the board as it is.
function checkReason(p, placed, h) {
  const n = p.n, k = h.thing, target = h.cell, r = h.reason;
  if (!r || !r.kind) return "no reason";
  const open = (t, clueIdx) => {
    const out = [];
    for (let i = 0; i < n * n; i++) {
      if (i === p.cake) continue;
      let ok = true;
      placed.forEach((at, o) => {
        if (o === t || at < 0) return;
        if (at === i || p.rooms[at] === p.rooms[i] || touch(n, at, i)) ok = false;
      });
      if (!ok) continue;
      const cells = placed.slice(); cells[t] = i;
      if (clueIdx.every((ci) => clueTrue(p, p.clues[ci], cells))) out.push(i);
    }
    return out;
  };
  const single = (cs) => cs.length === 1 && cs[0] === target;
  const placedEnds = (ci, who) => { const cl = p.clues[ci]; return oneAnimal(cl) || [cl.a, cl.b].every((x) => x === (who === undefined ? k : who) || placed[x] >= 0); };
  if (r.kind === "free") return single(open(k, [])) ? null : "free does not hold";
  if (r.kind === "clue") {
    if (!r.clues.length || r.clues.some((ci) => !namesThing(p, p.clues[ci], k) || !placedEnds(ci))) return "clue not about this animal or not checkable";
    return single(open(k, r.clues)) ? null : "clue reason does not hold";
  }
  if (r.kind === "room") {
    const room = p.rooms[target];
    const usable = (t) => p.clues.map((cl, ci) => ci).filter((ci) => namesThing(p, p.clues[ci], t) && placedEnds(ci));
    for (let t = 0; t < placed.length; t++) {
      if (t === k || placed[t] >= 0) continue;
      const own = p.clues.map((cl, ci) => ci).filter((ci) => namesThing(p, p.clues[ci], t) && placedEnds(ci, t));
      if (open(t, own).some((i) => p.rooms[i] === room)) return "room: another animal fits";
    }
    return single(open(k, usable(k)).filter((i) => p.rooms[i] === room)) ? null : "room: not the only square";
  }
  const lv = { rules: 1, pairs: 2, try: 3 }[r.kind];
  if (lv) {
    const d = CakeCore.deduce(p, lv, { placed, crosses: [] });
    return d.fixedAt[k] !== -1 ? null : r.kind + " does not fix it";
  }
  return "unknown reason " + r.kind;
}

const stats = {};
const reasonStats = {};
const seenRooms = new Set();
const seenTypes = new Set();
for (const level of ["easy", "medium", "hard"]) {
  const cfg = CakeCore.LEVELS[level];
  const st = stats[level] = { made: 0, unique: 0, deducible: 0, needs2: 0, needs3: 0, sum: 0, min: 99, max: 0, needSum: 0, ms: 0, maxMs: 0 };
  for (let seed = 1; seed <= PER_LEVEL; seed++) {
    total++;
    const tag = level + " #" + seed;
    const t0 = Date.now();
    const p = CakeCore.generatePuzzle(level, rng(seed * 7 + level.length * 1000));
    const ms = Date.now() - t0;
    st.ms += ms; st.maxMs = Math.max(st.maxMs, ms);
    if (!p) { fails.push(tag + ": no puzzle"); continue; }
    st.made++;
    const n = p.n, m = p.solution.length;
    if (n !== cfg.n || p.rules !== 3) { fails.push(tag + ": size " + n + ", rules " + p.rules); continue; }
    const bad = ruleProblem(p, p.solution);
    if (bad) { fails.push(tag + ": " + bad); continue; }
    if (p.clues.some((cl) => !clueTrue(p, cl, p.solution))) { fails.push(tag + ": a clue is false"); continue; }
    if (CakeCore.countSolutions(p, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
    st.unique++;
    const d = CakeCore.deduce(p, cfg.level);
    if (!d.solved || d.cells.some((c, k) => c !== p.solution[k])) { fails.push(tag + ": not solvable by deduction"); continue; }
    st.deducible++;
    if (!CakeCore.deduce(p, 1).solved) st.needs2++;
    if (!CakeCore.deduce(p, 2).solved) st.needs3++;
    if (!CakeCore.isCurrent(p)) fails.push(tag + ": new puzzle not current");
    if (typeof p.needed !== "number" || p.clues.length !== p.needed + cfg.extra) { fails.push(tag + ": " + p.clues.length + " clues, needed " + p.needed + " + " + cfg.extra); continue; }
    for (let a = 0; a < m; a++) if (!p.clues.some((cl) => namesThing(p, cl, a))) fails.push(tag + ": an animal without a clue");
    st.sum += p.clues.length; st.min = Math.min(st.min, p.clues.length); st.max = Math.max(st.max, p.clues.length); st.needSum += p.needed;
    p.roomNames.forEach((r) => seenRooms.add(r));
    p.clues.forEach((cl) => seenTypes.add(cl.t));

    const placed = new Array(m).fill(-1);
    placed[0] = p.solution[0] === 0 || p.cake === 0 ? (p.solution[0] === 1 || p.cake === 1 ? 2 : 1) : 0;
    if (CakeCore.findHint(p, placed, []).kind !== "wrong") { fails.push(tag + ": wrong animal not reported"); continue; }
    placed[0] = -1;
    if (CakeCore.findHint(p, placed, [p.solution[1]]).kind !== "wrongx") { fails.push(tag + ": wrong X not reported"); continue; }
    let h, steps = 0, ok = true;
    for (;;) {
      h = CakeCore.findHint(p, placed, []);
      if (h.kind !== "step") break;
      if (h.cell !== p.solution[h.thing] || h.cell === p.cake) { ok = false; break; }
      if (seed <= HINT_PLAY) {
        const why = checkReason(p, placed, h);
        if (why) { fails.push(tag + ": reason " + why); ok = false; break; }
        const key = level + "/" + h.reason.kind;
        reasonStats[key] = (reasonStats[key] || 0) + 1;
      }
      placed[h.thing] = h.cell;
      steps++;
    }
    if (!ok || h.kind !== "done" || steps !== m) { fails.push(tag + ": hint sequence broken (" + h.kind + ", " + steps + " steps)"); continue; }
    const culprit = CakeCore.culprit(p);
    if (culprit < 0 || !touch(n, p.solution[culprit], p.cake)) fails.push(tag + ": culprit not next to the cake");
  }
}
CakeCore.ROOM_NAMES.forEach((r) => { if (!seenRooms.has(r)) fails.push("no " + r + " in " + 3 * PER_LEVEL + " puzzles"); });
CakeCore.CLUE_TYPES.forEach((t) => { if (!seenTypes.has(t)) fails.push("no clue of type " + t + " in " + 3 * PER_LEVEL + " puzzles"); });

// Fixed board, 5x5: room 0 = columns 0-1 rows 0-1 (4 squares), room 1 =
// columns 2-4 rows 0-1 (6), room 2 = rows 2-4 (15). The cake lies on 17
// (row 4, column 3 counted from 1) unless said otherwise.
{
  total++;
  const rooms = [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
  const p = { n: 5, rules: 3, rooms, roomNames: ["kitchen", "garden", "hall"], cake: 17, clues: [], solution: [0, 4, 22] };
  const ok = (cells, cake) => CakeCore.isSolution(cake === undefined ? p : Object.assign({}, p, { cake }), cells);
  if (!ok([0, 4, 22])) fails.push("fixed board: a right placement is refused");
  if (ok([10, 4, 22])) fails.push("fixed board: two animals in one room accepted");
  if (ok([6, 2, 22])) fails.push("fixed board: animals touching diagonally across a wall accepted");
  if (ok([1, 2, 22])) fails.push("fixed board: animals side by side across a wall accepted");
  if (ok([0, 4, 17])) fails.push("fixed board: animal on the cake accepted");
  if (ok([0, 4, 24])) fails.push("fixed board: cake with no animal next to it accepted");
  if (ok([0, 4, 22, 20])) fails.push("fixed board: a fourth animal accepted");
  if (ok([6, 3, 22], 7)) fails.push("fixed board: cake next to two animals accepted");
  if (!ok([0, 3, 22], 7)) fails.push("fixed board: cake next to one animal in its room refused");
  if (!ok([6, 9, 22], 7)) fails.push("fixed board: cake next to one animal in another room refused");
  {
    const q = Object.assign({}, p, { cake: 7, solution: [6, 9, 22] });
    if (CakeCore.culprit(q) !== 0) fails.push("fixed board: culprit across the wall not found");
    if (CakeCore.culprit(p) !== 2) fails.push("fixed board: culprit not found");
  }
  p.clues = [{ t: "steps", a: 0, d: 5 }];
  if (!ok([0, 4, 22]) || ok([1, 4, 22])) fails.push("fixed board: steps clue counted wrong");
  p.clues = [{ t: "size", a: 2, size: 15 }];
  if (!ok([0, 4, 22])) fails.push("fixed board: size clue refused");
  p.clues = [{ t: "size", a: 2, size: 6 }];
  if (ok([0, 4, 22])) fails.push("fixed board: false size clue accepted");
  p.clues = [{ t: "border", a: 0, b: 2 }, { t: "higher", a: 1, b: 2 }, { t: "left", a: 0, b: 1 }];
  if (!ok([0, 4, 22])) fails.push("fixed board: border/higher/left refused");
  p.clues = [{ t: "border", a: 0, b: 1 }, { t: "higher", a: 2, b: 1 }];
  if (ok([0, 4, 22])) fails.push("fixed board: false higher clue accepted");
  // Old saves are not current and do not throw: rules 1 (one per row and
  // column, furniture, window) and rules 2 (N-1 rooms, the cake as the
  // last placed piece).
  const old1 = { n: 4, rooms: [0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2], roomNames: ["kitchen", "garden", "hall"], furniture: new Array(16).fill(null), window: { row: 0, side: "left" },
    clues: [{ t: "in", a: 0, room: 0 }, { t: "next", a: 1, f: "plant" }], solution: [0, 7, 9, 14] };
  const old2 = { n: 4, rules: 2, rooms: old1.rooms, roomNames: old1.roomNames, clues: [{ t: "steps", a: 0, d: 3 }], solution: [0, 3, 13, 9] };
  if (CakeCore.isCurrent(old1)) fails.push("old save (rules 1) counted as current");
  if (CakeCore.isCurrent(old2)) fails.push("old save (rules 2) counted as current");
  if (CakeCore.isCurrent(null) || CakeCore.isCurrent({})) fails.push("empty save counted as current");
}

// Every reason has its text in every language, with the right placeholders,
// and every rule of "Always true".
{
  const kinds = { free: ["{A}"], clue: ["{A}", "{N}"], clue2: ["{A}", "{N}", "{M}"], room: ["{A}"], rules: ["{A}"], pairs: ["{A}"], try: ["{A}"], general: ["{A}"] };
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
    // Words of the old rules must be gone from this game's texts.
    ["why_row", "why_col", "why_lines", "why_groups", "why_rooms", "clue_in", "clue_notin", "clue_on", "clue_next", "clue_window", "clue_top", "clue_bottom", "clue_left:", "clue_right", "clue_same", "furn_", "window_name", "_is:", "_isnot", "_sits", "room_\\w+_in:", "clue_cakesize", "hint_last"].forEach((w) => {
      if (new RegExp("\\n\\s*cake_\\w*" + w).test(src)) fails.push(lang + ": old key with " + w + " left");
    });
  }
}

// The themes: every clue, thing name, win line and the texts that name the
// thing read without a raw key in every language, and no theme text
// mentions the cake unless the theme's thing is the cake; themes with
// people have their own rule 3. Every suspect and every thing has a
// drawing, and suspects of one theme are drawn differently.
let catTexts = 0;
{
  const { loadI18n } = require("./load-i18n.js");
  const CakeIcons = require(path.join(__dirname, "..", "cake-icons.js"));
  const STRINGS = loadI18n({ texts: false }).STRINGS;
  const cakeWord = { en: /cake/i, de: /Kuchen/, fr: /gâteau/i, es: /pastel/i, it: /torta/i, nl: /taart/i, pl: /ciast(?!ecz)/i, uk: /торт/i, ru: /торт/i, ja: /ケーキ/, zh: /蛋糕/, ar: /كعك/ };
  const animalWord = { de: /Tier/, en: /animal/i };
  CakeCore.MOTIFS.forEach((motif) => {
    const th = CakeCore.THEMES[motif];
    const drawn = new Set();
    th.who.concat([th.thing]).forEach((id) => {
      if (!CakeIcons.icons[id]) fails.push(motif + ": no drawing for " + id);
      else drawn.add(CakeIcons.icons[id]);
    });
    if (drawn.size !== th.who.length + 1) fails.push(motif + ": two drawings are the same");
  });
  const samples = [];
  for (const level of Object.keys(CakeCore.LEVELS)) for (let seed = 1; seed <= 20; seed++) {
    const p = CakeCore.generatePuzzle(level, rng(seed * 977 + 13));
    if (p) samples.push(p);
  }
  for (const lang of Object.keys(STRINGS)) {
    const t = (k) => (STRINGS[lang][k] !== undefined ? STRINGS[lang][k] : STRINGS.en[k] !== undefined ? STRINGS.en[k] : k);
    CakeCore.MOTIFS.forEach((motif) => {
      const th = CakeCore.THEMES[motif];
      const check = (what, text) => {
        catTexts++;
        if (/[{}]|cake_|undefined/.test(text)) fails.push(lang + " " + motif + ": " + what + " \"" + text + "\"");
        if (th.thing !== "cake" && cakeWord[lang] && cakeWord[lang].test(text)) fails.push(lang + " " + motif + ": " + what + " names the cake: \"" + text + "\"");
        if (th.people && animalWord[lang] && animalWord[lang].test(text)) fails.push(lang + " " + motif + ": " + what + " says animal: \"" + text + "\"");
      };
      if (STRINGS[lang]["cake_motif_" + motif] === undefined) fails.push(lang + " lacks cake_motif_" + motif);
      th.who.forEach((id) => ["name", "cap", "mid"].forEach((f) => {
        if (STRINGS[lang]["cake_" + id + "_" + f] === undefined) fails.push(lang + " lacks cake_" + id + "_" + f);
      }));
      samples.forEach((src) => {
        const p = Object.assign({}, src, { motif });
        p.clues.forEach((cl) => check("clue", CakeCore.clueText(p, cl, t)));
        for (let k = 0; k < p.solution.length; k++) check("thing", CakeCore.thingName(p, k, t));
        check("cake", CakeCore.cakeName(p, t));
        check("win", t("cake_win_" + CakeCore.animalId(p, CakeCore.culprit(p))));
      });
      // Every text about the cake, in the theme's words.
      ["cake_clue_steps", "cake_always_1", "cake_always_2", "cake_always_4"].forEach((k) => {
        const key = CakeCore.themed({ motif }, k);
        if (STRINGS[lang][key] === undefined) fails.push(lang + " lacks " + key);
        check(k, CakeCore.fill(t(key), { A: "X", N: "3" }));
      });
      const k3 = CakeCore.always3Key({ motif });
      if (STRINGS[lang][k3] === undefined) fails.push(lang + " lacks " + k3);
      check("cake_always_3", t(k3));
    });
    CakeCore.ROOM_NAMES.forEach((r) => { if (!STRINGS[lang]["cake_room_" + r + "_name"]) fails.push(lang + " lacks cake_room_" + r + "_name"); });
    ["cake_clue_size", "cake_clue_higher", "cake_clue_leftof", "cake_clue_border"].forEach((k) => { if (!STRINGS[lang][k]) fails.push(lang + " lacks " + k); });
  }
}

Object.keys(stats).forEach((lv) => {
  const st = stats[lv];
  console.log(lv + ": " + st.made + "/" + PER_LEVEL + " made, " + st.unique + " with exactly one solution, " + st.deducible + " solvable by deduction at level " + CakeCore.LEVELS[lv].level +
    "; need level 2: " + st.needs2 + ", need level 3: " + st.needs3 +
    "; clues on average " + (st.sum / st.made).toFixed(2) + " (" + st.min + "-" + st.max + "), needed " + (st.needSum / st.made).toFixed(2) +
    "; generating " + (st.ms / PER_LEVEL).toFixed(1) + " ms on average, slowest " + st.maxMs + " ms");
});
console.log("hint reasons (first " + HINT_PLAY + " puzzles per level): " + JSON.stringify(reasonStats));
fails.slice(0, 40).forEach((f) => console.log("FAIL " + f));
console.log("\n=== CAKE CORE: " + total + " puzzles, " + catTexts + " theme texts checked, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
