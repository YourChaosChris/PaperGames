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
//     wall (in another room), and exactly one animal in the cake's room.
// A fixed board checks "next to" across a wall directly.
const path = require("path");
const CakeCore = require(path.join(__dirname, "..", "cake-core.js"));

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER_LEVEL = 150;
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
    if (CakeCore.countSolutions(p, 2) !== 1) { fails.push(tag + ": not exactly one solution"); continue; }
    const d = CakeCore.deduce(p, CakeCore.LEVELS[level].level);
    if (!d.solved || d.cells.some((c, k) => c !== p.solution[k])) { fails.push(tag + ": not solvable by deduction"); continue; }

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
}

fails.forEach((f) => console.log("FAIL " + f));
console.log("\n=== CAKE CORE: " + total + " puzzles, " + fails.length + " failures ===");
process.exit(fails.length ? 1 : 0);
