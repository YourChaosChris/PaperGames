// oddone-core.js test
// "Which One Is Different?": for every level 200 games (6 rounds each)
// from fixed seeds. In every round exactly one card is odd (the only one
// of its kind in some feature while all others agree in it) and that is
// the marked one - no second reading is possible; cards are all different,
// the right number of cards (group rounds show every drawing once), the right mix of group and attribute rounds,
// the odd card at every position. Easy and the group rounds: three (or
// four, five) cards from one group of drawings and one from another;
// attribute rounds: the features that are not the rule vary (one in
// medium, two in hard), never all the same.
const path = require("path");
const K = require(path.join(__dirname, "..", "kidspics.js"));
const C = require(path.join(__dirname, "..", "oddone-core.js"));

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

check("lone card in a group round", JSON.stringify(C.oddOnes("group", [{ id: "fish" }, { id: "bird" }, { id: "cat" }, { id: "car" }])) === "[3]");
check("two odd cards are not certain", C.oddOnes("attr", [{ s: 0, f: 0, n: 1 }, { s: 0, f: 0, n: 1 }, { s: 1, f: 0, n: 1 }, { s: 0, f: 1, n: 1 }]).length === 2);
check("a round with two readings is invalid", !C.isValidRound({ type: "attr", cards: [{ s: 0, f: 0, n: 1 }, { s: 0, f: 0, n: 2 }, { s: 1, f: 0, n: 1 }, { s: 0, f: 1, n: 1 }], correct: 2 }));
check("same seed, same game", JSON.stringify(C.generatePuzzle("hard", 3)) === JSON.stringify(C.generatePuzzle("hard", 3)));
check("different seeds differ", JSON.stringify(C.generatePuzzle("medium", 3)) !== JSON.stringify(C.generatePuzzle("medium", 4)));

const PER = 200;
const stats = [];
for (const level of Object.keys(C.LEVELS)) {
  const L = C.LEVELS[level];
  const pos = {};
  let rounds = 0, groups = 0, attrs = 0;
  const ruleCount = { s: 0, f: 0, n: 0 };
  for (let seed = 1; seed <= PER; seed++) {
    const g = C.generatePuzzle(level, seed * 15485863 + 11);
    check(level + " " + seed + ": " + C.ROUNDS + " rounds", g.rounds.length === C.ROUNDS);
    check(level + " " + seed + ": mix of rounds", g.rounds.filter((r) => r && r.type === "group").length === L.group && g.rounds.filter((r) => r && r.type === "attr").length === L.attr);
    g.rounds.forEach((r, i) => {
      const tag = level + " " + seed + "/" + i;
      check(tag + ": round exists", !!r);
      if (!r) return;
      rounds++;
      check(tag + ": valid round (exactly one odd card)", C.isValidRound(r));
      check(tag + ": card count", r.cards.length === L.cards);
      pos[r.correct] = (pos[r.correct] || 0) + 1;
      if (r.type === "group") {
        groups++;
        const cats = r.cards.map((c) => K.OBJECTS[c.id].cat);
        const oddCat = cats[r.correct];
        check(tag + ": all others from one group", cats.filter((_, k) => k !== r.correct).every((c) => c === cats[r.correct === 0 ? 1 : 0]) && oddCat !== cats[r.correct === 0 ? 1 : 0]);
      } else {
        attrs++;
        // which feature is the rule: the one in which the odd card differs from all others
        const others = r.cards.filter((_, k) => k !== r.correct);
        const odd = r.cards[r.correct];
        const rule = ["s", "f", "n"].filter((x) => others.every((c) => c[x] === others[0][x]) && odd[x] !== others[0][x]);
        check(tag + ": a rule feature exists", rule.length >= 1);
        if (rule.length >= 1) ruleCount[rule[0]]++;
        const varying = ["s", "f", "n"].filter((x) => rule.indexOf(x) === -1 && new Set(r.cards.map((c) => c[x])).size > 1);
        check(tag + ": " + L.vary + " varying feature(s)", varying.length === L.vary - (rule.length - 1));
      }
    });
  }
  for (let k = 0; k < L.cards; k++) check(level + ": odd card sometimes at position " + k, (pos[k] || 0) > rounds / L.cards / 2);
  if (L.attr) for (const x of ["s", "f", "n"]) check(level + ": rule feature " + x + " is used", ruleCount[x] > 20);
  stats.push(level + ": " + PER + " games, " + rounds + " rounds (" + groups + " group, " + attrs + " attribute), " + L.cards + " cards" + (L.attr ? ", rule shape/filling/number " + ruleCount.s + "/" + ruleCount.f + "/" + ruleCount.n : ""));
}

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== ODDONE CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log(stats.join("\n"));
console.log("=== ODDONE CORE: 3 levels x " + PER + " games, exactly one odd card per round, 0 failures ===");
