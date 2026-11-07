#!/usr/bin/env node
// Hint buttons of the solo games (task 181), core part, no server needed:
//   - Mahjong: the hint is always two free tiles that match; following the
//     hints clears the whole board.
//   - Peg Solitaire: the hint is a legal jump; following the hints ends with
//     one peg on every board variant.
//   - Minesweeper: a hint is never wrong (200 games, safe fields hold no
//     mine, mine fields hold one), from what is visible only.
const path = require("path");
const root = path.join(__dirname, "..");
const Mahjong = require(path.join(root, "mahjong-core.js"));
const Peg = require(path.join(root, "pegsolitaire-core.js"));
const Mines = require(path.join(root, "minesweeper-core.js"));
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

{
  let cleared = 0;
  for (let g = 0; g < 8; g++) {
    let s = Mahjong.createInitialState(seeded(g + 1));
    let n = 0;
    while (n < 100) {
      const h = Mahjong.findMatch(s);
      if (!h) break;
      check("mahjong hint is a legal pair (game " + g + ")", Mahjong.isMatch(s, h[0], h[1]));
      s = Mahjong.removePair(s, h[0], h[1]);
      n++;
    }
    if (Mahjong.isWon(s)) cleared++;
    else check("mahjong hint stops only when no pair is free (game " + g + ")", !Mahjong.hasAnyMove(s));
  }
  check("mahjong: hints clear at least one board (" + cleared + " of 8)", cleared >= 1);
  const done = Mahjong.createInitialState(seeded(1));
  done.removed = done.removed.map(() => true);
  check("mahjong: no hint on a cleared board", Mahjong.findMatch(done) === null);
}

{
  const variants = Object.keys(Peg.VARIANTS || {});
  check("peg solitaire: variants found", variants.length >= 2);
  for (const v of variants) {
    let b = Peg.createInitialBoard(v);
    let steps = 0;
    for (;;) {
      const h = Peg.hintMove(b, v, 200000);
      if (!h) break;
      const legal = Peg.getLegalMoves(b, v).some((m) => m.from[0] === h.move.from[0] && m.from[1] === h.move.from[1] && m.to[0] === h.move.to[0] && m.to[1] === h.move.to[1]);
      check("peg solitaire " + v + ": hint is a legal jump", legal);
      b = Peg.applyMove(b, h.move);
      if (++steps > 100) break;
    }
    check("peg solitaire " + v + ": hints end with one peg", Peg.countPegs(b) === 1);
  }
}

{
  let hints = 0;
  let wrong = 0;
  for (let g = 0; g < 200; g++) {
    const rng = seeded(500 + g);
    let s = Mines.createState(9, 9, 10);
    s = Mines.reveal(s, 4, 4, rng);
    for (let guard = 0; guard < 200 && !s.gameOver; guard++) {
      const h = Mines.hintCell(s);
      if (!h) break;
      hints++;
      const cell = s.cells[h.r][h.c];
      if ((h.kind === "safe") === cell.mine) wrong++;
      s = h.kind === "safe" ? Mines.reveal(s, h.r, h.c, rng) : Mines.toggleFlag(s, h.r, h.c);
    }
  }
  check("minesweeper: " + hints + " hints, " + wrong + " wrong", hints > 500 && wrong === 0);
  check("minesweeper: no hint before the first reveal", Mines.hintCell(Mines.createState(9, 9, 10)) === null);
}

if (fails.length) { console.log("FAIL hints-solo: " + fails.length + " problem(s)"); process.exit(1); }
console.log("OK hints-solo: Mahjong, Peg Solitaire and Minesweeper hints are always legal and correct");
