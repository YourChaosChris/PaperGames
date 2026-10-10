// tests/tenpairs-core.js
// Pairs to Ten: fixed examples for "see each other", then 1000 games
// played only with "Hint" and "Add".
//
// 1. Fixed examples on hand-made fields: across, down, diagonal (both
//    ways), over crossed-out cells, over the end of a row, and pairs that
//    do not see each other; equal or adding up to 10; rows that vanish;
//    "Add"; win and loss.
// 2. 1000 games (classic and random at all levels): every move is the
//    hint's pair or "Add"; every crossed-out pair is checked here on its
//    own (equal or 10, and nothing open between them on a straight line or
//    in reading order); the number of digits only goes down by 2 or up by
//    "Add"; every game ends (won or lost) within the limits.
//
// Run: node tests/tenpairs-core.js

const T = require("../tenpairs-core.js");

const fails = [];
let examples = 0;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const check = (name, got, want) => { examples++; if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(name + ": " + JSON.stringify(got) + ", expected " + JSON.stringify(want)); };
// A field from a string: digits, "x" for a crossed-out cell (its digit does not matter).
function field(str) {
  return { cells: str.replace(/\s/g, "").split("").map((ch) => (ch === "x" ? { d: 5, x: true } : { d: +ch, x: false })), adds: 0, mode: "random", level: 2 };
}
const idx = (r, c) => r * 9 + c;

// Row 0: 1 2 3 4 5 6 7 8 9 / row 1: 9 8 7 6 5 4 3 2 1 / row 2: 1 1 2 x x 3 4 5 6
let s = field("123456789 987654321 112xx3456");
check("across, neighbours", T.sees(s, idx(0, 0), idx(0, 1)), "across");
check("across, not neighbours", T.sees(s, idx(0, 0), idx(0, 2)), null);
check("over the end of a row", T.sees(s, idx(0, 8), idx(1, 0)), "across");
check("over the end of a row, reverse order", T.sees(s, idx(1, 0), idx(0, 8)), "across");
check("down, neighbours", T.sees(s, idx(0, 4), idx(1, 4)), "down");
check("down, two rows apart with open cell between", T.sees(s, idx(0, 5), idx(2, 5)), null);
check("diagonal down-right", T.sees(s, idx(0, 0), idx(1, 1)), "diagonal");
check("diagonal down-left", T.sees(s, idx(0, 5), idx(1, 4)), "diagonal");
check("diagonal two steps with open cell between", T.sees(s, idx(0, 0), idx(2, 2)), null);
check("knight's step does not count", T.sees(s, idx(0, 0), idx(1, 2)), null);
check("across over crossed-out cells", T.sees(s, idx(2, 2), idx(2, 5)), "across");
check("same cell", T.sees(s, idx(0, 0), idx(0, 0)), null);
check("left edge does not wrap diagonally", T.sees(s, idx(0, 0), idx(1, 8)), null);
check("right edge to next row start is across", T.sees(s, idx(1, 8), idx(2, 0)), "across");
// Crossed-out cells between on straight lines.
s = field("1xxxxxxx9 x55555555 x55555555 9xxxxxxxx");
check("across over seven crossed-out cells", T.sees(s, idx(0, 0), idx(0, 8)), "across");
check("down over two crossed-out cells", T.sees(s, idx(0, 0), idx(3, 0)), "down");
check("across over the end of a row and crossed-out cells", T.sees(s, idx(0, 8), idx(1, 1)), "across");
s = field("3xxxxxxxx x5xxxxxxx xx5xxxxxx xxx7xxxxx");
check("diagonal over open cells", T.sees(s, idx(0, 0), idx(3, 3)), null);
s = field("3xxxxxxxx x1xxxxxxx 5xxxxxxxx");
check("down over a crossed-out row cell", T.sees(s, idx(0, 0), idx(2, 0)), "down");
s = field("xxxx3xxxx 1xxxxxxxx xxxxxx7xx");
check("diagonal over a crossed-out cell", T.sees(s, idx(0, 4), idx(2, 6)), "diagonal");
check("diagonal, reverse order", T.sees(s, idx(2, 6), idx(0, 4)), "diagonal");
s = field("xxxx3xxxx 1xxxxxxxx xx7xxxxxx");
check("diagonal down-left over a crossed-out cell", T.sees(s, idx(0, 4), idx(2, 2)), "diagonal");
s = field("xxxx3xxxx xxx5xxxxx xx7xxxxxx");
check("diagonal blocked by an open cell", T.sees(s, idx(0, 4), idx(2, 2)), null);
s = field("123456789 12");
check("last short row: down", T.sees(s, idx(0, 1), idx(1, 1)), "down");
check("last short row: diagonal", T.sees(s, idx(0, 0), idx(1, 1)), "diagonal");
// Equal or 10.
s = field("37 55 19 46 82 33 12");
check("3 and 7 add up to 10", T.check(s, 0, 1), null);
check("5 and 5", T.check(s, 2, 3), null);
check("1 and 9", T.check(s, 4, 5), null);
check("4 and 6", T.check(s, 6, 7), null);
check("8 and 2", T.check(s, 8, 9), null);
check("3 and 3 equal", T.check(s, 10, 11), null);
check("1 and 2 neither", T.check(s, 12, 13), "sum");
check("3 and 5 neither", T.check(s, 0, 3), "sum");
check("7 and 3 but far apart", T.check(field("712345683"), 0, 8), "see");
check("crossed-out cell", T.check(field("x7"), 0, 1), "crossed");
// Rows vanish.
s = field("123456789 991234567");
let n = T.cross(s, 9, 10);
check("crossing out keeps a row with digits", T.rows(n), 2);
s = field("1xxxxxxx9 12");
n = T.cross(s, 0, 8);
check("a fully crossed-out row vanishes", [T.rows(n), n.cells.map((c) => c.d), n.lastRemovedRows], [1, [1, 2], 1]);
s = field("123456789 55");
n = T.cross(s, 9, 10);
check("the last short row vanishes when crossed out", [T.rows(n), n.lastRemovedRows], [1, 1]);
// Add.
s = field("1x3 x5");
n = T.add(s);
check("add writes the open digits at the end", [n.cells.length, n.cells.slice(5).map((c) => c.d), n.adds], [8, [1, 3, 5], 1]);
// Win and loss.
s = field("37");
check("win", T.status(T.cross(s, 0, 1)), "won");
s = field("12");
s.adds = T.MAX_ADDS;
check("lost when no pair and no add", T.status(s), "lost-adds");
s = field("12");
check("no pair but add left: still playing", T.status(s), null);
check("classic start", T.newGame("classic").cells.map((c) => c.d).join(""), "123456789111213141516171819");
check("hint finds the pair over the end of a row", T.findPair(field("234567681 9")), [8, 9]);
check("hint: none", T.findPair(field("12")), null);

/*** 1000 games ***/

function refSees(cells, i, j) {
  if (i > j) { const t = i; i = j; j = t; }
  if (cells.slice(i + 1, j).every((c) => c.x)) return true;
  const ri = Math.floor(i / 9), ci = i % 9, rj = Math.floor(j / 9), cj = j % 9;
  const dr = rj - ri, dc = cj - ci;
  if (!(dc === 0 || Math.abs(dc) === dr)) return false;
  const sr = dr === 0 ? 0 : 1, sc = Math.sign(dc);
  for (let r = ri + sr, c = ci + sc; r < rj; r += sr, c += sc) if (!cells[r * 9 + c].x) return false;
  return true;
}

const stats = { games: 0, won: 0, lostAdds: 0, lostRows: 0, moves: 0, adds: 0, maxRows: 0 };
const g = rng(62);
for (let gi = 0; gi < 1000; gi++) {
  const mode = gi % 4 === 0 ? "classic" : "random";
  let st = T.newGame(mode, 1 + (gi % 3), g);
  let guard = 0, end = null;
  while (guard++ < 20000) {
    end = T.status(st);
    if (end) break;
    const pair = T.findPair(st);
    if (pair) {
      const [i, j] = pair, a = st.cells[i], b = st.cells[j];
      if (a.x || b.x || !(a.d === b.d || a.d + b.d === 10) || !refSees(st.cells, i, j)) { fails.push("game " + gi + ": invalid pair " + i + "/" + j); break; }
      const before = T.left(st);
      const n2 = T.cross(st, i, j);
      if (!n2) { fails.push("game " + gi + ": hint pair refused"); break; }
      if (T.left(n2) !== before - 2) fails.push("game " + gi + ": wrong count after crossing");
      if (n2.cells.length % 9 !== 0 && n2.cells.length > 0 && T.rows(n2) * 9 - n2.cells.length >= 9) fails.push("game " + gi + ": bad length");
      st = n2;
      stats.moves++;
    } else {
      const before = T.left(st);
      const n2 = T.add(st);
      if (!n2) { fails.push("game " + gi + ": add refused while playing"); break; }
      if (T.left(n2) !== before * 2) fails.push("game " + gi + ": add did not double the open digits");
      st = n2;
      stats.adds++;
    }
    stats.maxRows = Math.max(stats.maxRows, T.rows(st));
  }
  stats.games++;
  if (end === "won") stats.won++;
  else if (end === "lost-adds") stats.lostAdds++;
  else if (end === "lost-rows") stats.lostRows++;
  else fails.push("game " + gi + ": did not end");
  if (st.adds > T.MAX_ADDS) fails.push("game " + gi + ": too many adds");
}

console.log(JSON.stringify(stats));
if (fails.length) {
  console.log(fails.slice(0, 25).join("\n"));
  console.log("=== PAIRS TO TEN CORE: " + fails.length + " failure(s) ===");
  process.exit(1);
}
console.log("=== PAIRS TO TEN CORE: " + examples + " fixed examples, 1000 games, 0 failures ===");
