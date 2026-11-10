// Sternjagd: computer level (1 easy, 2 medium, 3 hard). Hard is the default and beats easy.
const S = require("../sternjagd-core.js");
let fail = 0;
function check(n, ok) { if (!ok) { fail++; console.log("FAIL " + n); } }
check("default level is hard", S.newGame({ players: 2 }).level === 3);
check("level 1 and 2 are kept", S.newGame({ players: 2, level: 1 }).level === 1 && S.newGame({ players: 2, level: 2 }).level === 2);
check("odd level falls back to hard", S.newGame({ players: 2, level: 9 }).level === 3);
function wins(l0, l1, games) {
  let w = 0;
  for (let g = 0; g < games; g++) {
    let s = S.newGame({ players: 2, computer: [true, true], first: g % 2 });
    s.levels = [l0, l1];
    let guard = 0;
    while (s.phase !== "over" && guard++ < 5000) {
      s.level = s.levels[s.current];
      s = S.aiStep(s);
      s.levels = s.levels || [l0, l1];
    }
    if (s.winner === 0) w++;
  }
  return w / games;
}
const hardVsEasy = wins(3, 1, 400);
console.log("hard against easy: " + (hardVsEasy * 100).toFixed(1) + "%");
check("hard beats easy", hardVsEasy > 0.55);
console.log("=== STERNJAGD LEVEL: default, stored levels, hard beats easy, " + fail + " failure(s) ===");
process.exit(fail ? 1 : 0);
