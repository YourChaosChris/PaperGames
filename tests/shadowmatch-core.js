// shadowmatch-core.js and kidspics.js test
// "Whose Shadow Is It?": for every level 200 games (6 rounds each) from fixed
// seeds. Each round shows a known drawing and has exactly one unturned
// shadow of it among distinct options, the right number of options, six
// different pictures per game, the right answer at every position. Easy:
// the wrong shadows are drawings from other groups, medium: from the same
// group, hard: two turned shadows of the same drawing (only turns that
// look different) and one other drawing of the group. Also the drawings
// themselves: 20 in 4 groups of 5, every one with a picture, a shadow
// and the turns, and all shadows different from each other.
const path = require("path");
const K = require(path.join(__dirname, "..", "kidspics.js"));
const C = require(path.join(__dirname, "..", "shadowmatch-core.js"));

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

check("20 drawings", K.IDS.length === 20);
check("4 groups of 5", K.CATEGORY_NAMES.length === 4 && K.CATEGORY_NAMES.every((c) => K.CATEGORIES[c].length === 5));
const seen = new Set();
for (const id of K.IDS) {
  const line = K.svg(id, "line", "none", 60), shadow = K.svg(id, "shadow", "none", 60);
  check(id + ": picture and shadow differ", line !== shadow);
  check(id + ": shadow is solid black, no white", shadow.indexOf('#fff') === -1);
  check(id + ": svg has width and height", /width="60" height="60"/.test(line));
  for (const tr of K.TRANSFORMS) {
    if (!K.canTransform(id, tr)) { check(id + ": only mirror can be refused", tr === "mirror" && !K.OBJECTS[id].asymX); continue; }
    const s = K.svg(id, "shadow", tr, 60);
    check(id + "/" + tr + ": shadow different from every other", !seen.has(s));
    seen.add(s);
  }
}
check("mirror refused for symmetric drawings", !K.canTransform("rocket", "mirror") && !K.canTransform("mushroom", "mirror") && K.canTransform("cat", "mirror"));
check("same seed, same game", JSON.stringify(C.generatePuzzle("hard", 9)) === JSON.stringify(C.generatePuzzle("hard", 9)));
check("different seeds differ", JSON.stringify(C.generatePuzzle("easy", 9)) !== JSON.stringify(C.generatePuzzle("easy", 10)));

const PER = 200;
const stats = [];
for (const level of Object.keys(C.LEVELS)) {
  const pos = {};
  let rounds = 0;
  for (let seed = 1; seed <= PER; seed++) {
    const g = C.generatePuzzle(level, seed * 104729 + 7);
    check(level + " " + seed + ": " + C.ROUNDS + " rounds", g.rounds.length === C.ROUNDS);
    check(level + " " + seed + ": six different pictures", new Set(g.rounds.map((r) => r.id)).size === C.ROUNDS);
    g.rounds.forEach((r, i) => {
      rounds++;
      const tag = level + " " + seed + "/" + i;
      check(tag + ": valid round", C.isValidRound(r));
      check(tag + ": option count", r.options.length === C.LEVELS[level].options);
      pos[r.correct] = (pos[r.correct] || 0) + 1;
      const wrong = r.options.filter((_, k) => k !== r.correct);
      const cat = K.OBJECTS[r.id].cat;
      if (level === "easy") {
        check(tag + ": easy: other groups, each group once", wrong.every((o) => K.OBJECTS[o.id].cat !== cat && o.tr === "none") && new Set(wrong.map((o) => K.OBJECTS[o.id].cat)).size === wrong.length);
      } else if (level === "medium") {
        check(tag + ": medium: same group, other drawings", wrong.every((o) => K.OBJECTS[o.id].cat === cat && o.id !== r.id && o.tr === "none"));
      } else {
        const turned = wrong.filter((o) => o.id === r.id);
        check(tag + ": hard: two turned shadows of the same drawing", turned.length === 2 && turned.every((o) => o.tr !== "none"));
        check(tag + ": hard: one other drawing of the group", wrong.filter((o) => o.id !== r.id).length === 1 && wrong.filter((o) => o.id !== r.id).every((o) => K.OBJECTS[o.id].cat === cat));
      }
    });
  }
  for (let k = 0; k < C.LEVELS[level].options; k++) check(level + ": right answer sometimes at position " + k, (pos[k] || 0) > rounds / C.LEVELS[level].options / 2);
  stats.push(level + ": " + PER + " games, " + rounds + " rounds, " + C.LEVELS[level].options + " shadows");
}

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== SHADOWMATCH CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log(stats.join("\n"));
console.log("=== SHADOWMATCH CORE: 20 drawings, 3 levels x " + PER + " games, one right shadow per round, 0 failures ===");
