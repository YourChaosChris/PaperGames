// patternrow-core.js test
// "Continue the Pattern": for every level 200 games (6 rows each) from
// fixed seeds. Each row must have exactly one symbol that continues it
// (no other repeating part of at most half the row gives another one),
// the answer among distinct options at the right place, the fixed number
// of options, the unit shown at least twice, and the right symbol must
// not be guessable by always taking the same position. Same seed, same
// game; different seeds give different games.
const path = require("path");
const C = require(path.join(__dirname, "..", "patternrow-core.js"));

const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

check("minPeriod of ABAB is 2", C.minPeriod([1, 2, 1, 2]) === 2);
check("minPeriod of AAB AAB A is 3", C.minPeriod([1, 1, 2, 1, 1, 2, 1]) === 3);
check("A B A B A B has one continuation", C.nextCandidates([1, 2, 1, 2, 1, 2]).length === 1 && C.nextCandidates([1, 2, 1, 2, 1, 2])[0] === 1);
check("A A B A A B needs the A", C.uniqueOf({ seq: [1, 1, 2, 1, 1, 2, 1], answer: 1 }));
check("same seed, same game", JSON.stringify(C.generatePuzzle("hard", 5)) === JSON.stringify(C.generatePuzzle("hard", 5)));
check("different seeds differ", JSON.stringify(C.generatePuzzle("medium", 5)) !== JSON.stringify(C.generatePuzzle("medium", 6)));

const PER = 200;
const stats = [];
for (const level of Object.keys(C.LEVELS)) {
  let rows = 0, maxLen = 0, positions = {}, minOpt = 99;
  for (let seed = 1; seed <= PER; seed++) {
    const g = C.generatePuzzle(level, seed * 7919 + 13);
    check(level + " " + seed + ": " + C.ROUNDS + " rows", g.rows.length === C.ROUNDS);
    const keys = new Set();
    g.rows.forEach((row, i) => {
      rows++;
      check(level + " " + seed + "/" + i + ": valid row", C.isValidRow(row));
      check(level + " " + seed + "/" + i + ": option count", row.options.length === C.LEVELS[level].options);
      const p = C.minPeriod(row.seq);
      check(level + " " + seed + "/" + i + ": unit shown twice", row.seq.length >= 2 * p);
      check(level + " " + seed + "/" + i + ": row fits (<= 10 cells with the question)", row.seq.length + 1 <= 10);
      check(level + " " + seed + "/" + i + ": symbols in range", row.seq.concat(row.options).every((s) => s >= 0 && s < 16));
      check(level + " " + seed + "/" + i + ": answer continues the unit", row.answer === row.seq[row.seq.length - p]);
      if (i > 0) check(level + " " + seed + "/" + i + ": not the same row twice in a row", JSON.stringify(row.seq) !== JSON.stringify(g.rows[i - 1].seq));
      keys.add(JSON.stringify(row.seq));
      maxLen = Math.max(maxLen, row.seq.length + 1);
      positions[row.correct] = (positions[row.correct] || 0) + 1;
      minOpt = Math.min(minOpt, row.options.length);
    });
    check(level + " " + seed + ": rows differ", keys.size >= 4);
  }
  // the right answer sits at every position
  for (let k = 0; k < C.LEVELS[level].options; k++) check(level + ": correct answer sometimes at position " + k, (positions[k] || 0) > rows / C.LEVELS[level].options / 2);
  stats.push(level + ": " + PER + " games, " + rows + " rows, longest row " + maxLen + " cells, " + C.LEVELS[level].options + " answers");
}

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("=== PATTERNROW CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log(stats.join("\n"));
console.log("=== PATTERNROW CORE: 3 levels x " + PER + " games, every row has exactly one continuation, 0 failures ===");
