// matches-core.js
// "Matchstick Puzzles" (Streichholzrätsel) - move 1 or 2 matches so that
// a wrong sum becomes right, or so that the figure has a given number of
// squares. Dependency-free, no DOM.
//
// Every place a match can lie is a "slot"; a position is the set of
// slots that hold a match. A move takes one match from a slot and lays it
// on a free slot.
//
// Sums ("e"): digits drawn with matches like a digital clock, seven slots
// each (a top, b top right, c bottom right, d bottom, e bottom left,
// f top left, g middle); the sign between the first numbers has a
// horizontal and a vertical slot (both: +, only the horizontal: -), the
// equals sign two horizontal slots. The layout is that of the start sum
// (its characters in order); slot id: "<position>.<slot>", e.g. "0.6" is
// the middle match of the first digit.
//
// Squares ("s"): a grid of w x h cells; slots are the cell edges, "h.r.c"
// (horizontal, above row r) and "v.r.c" (vertical, left of column c).
// Solved: exactly `n` small squares are closed, and every match belongs to
// at least one of them (no loose matches).
//
// A puzzle: { kind, k (matches to move), ... }:
//   sums:    { kind: "e", start: "6+4=4" }  (digits, + or -, =)
//   squares: { kind: "s", w, h, cells: [[r, c], ...] (the start figure is
//              the outline of these cells), n }
// The puzzles are fixed (PUZZLES, 30 per level, found by
// tools/matches-gen.js); every one is checked by tests/matches-core.js:
// solvable with k moves, not with fewer.

const MatchesCore = (function () {
  // Digital clock digits as the slots a-g (0-6) they use.
  const DIGITS = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
  const SEG = "abcdefg";
  const PATTERN_TO_DIGIT = {};
  Object.keys(DIGITS).forEach((d) => { PATTERN_TO_DIGIT[DIGITS[d].split("").map((ch) => SEG.indexOf(ch)).sort().join("")] = +d; });

  // --- sums ----------------------------------------------------------------

  // "12+3=15" -> ["D", "D", "O", "D", "E", "D", "D"] with values.
  function parseSum(str) {
    const out = [];
    for (const ch of str) {
      if (ch >= "0" && ch <= "9") out.push({ t: "D", v: +ch });
      else if (ch === "+" || ch === "-") out.push({ t: "O", v: ch });
      else if (ch === "=") out.push({ t: "E" });
    }
    return out;
  }

  // The occupied slots of a sum string.
  function sumSlots(str) {
    const set = [];
    parseSum(str).forEach((tok, i) => {
      if (tok.t === "D") DIGITS[tok.v].split("").forEach((ch) => set.push(i + "." + SEG.indexOf(ch)));
      else if (tok.t === "O") { set.push(i + ".0"); if (tok.v === "+") set.push(i + ".1"); }
      else { set.push(i + ".0"); set.push(i + ".1"); }
    });
    return set;
  }

  // All slots of the layout of a sum.
  function sumAllSlots(str) {
    const out = [];
    parseSum(str).forEach((tok, i) => {
      const n = tok.t === "D" ? 7 : 2;
      for (let s = 0; s < n; s++) out.push(i + "." + s);
    });
    return out;
  }

  // Reads a position of a sum layout back: the string, or null when a
  // digit or sign is not a valid shape.
  function readSum(layoutStr, set) {
    const has = {};
    set.forEach((id) => { has[id] = true; });
    let out = "";
    const toks = parseSum(layoutStr);
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i].t;
      if (t === "D") {
        const pat = [];
        for (let s = 0; s < 7; s++) if (has[i + "." + s]) pat.push(s);
        const d = PATTERN_TO_DIGIT[pat.join("")];
        if (d === undefined) return null;
        out += d;
      } else if (t === "O") {
        if (!has[i + ".0"]) return null;
        out += has[i + ".1"] ? "+" : "-";
      } else {
        if (!has[i + ".0"] || !has[i + ".1"]) return null;
        out += "=";
      }
    }
    return out;
  }

  function sumIsTrue(str) {
    const m = /^(\d+)([+-])(\d+)=(\d+)$/.exec(str);
    if (!m) return false;
    // No leading zeros in numbers of two or more digits.
    if ([m[1], m[3], m[4]].some((x) => x.length > 1 && x[0] === "0")) return false;
    const a = +m[1], b = +m[3], c = +m[4];
    return (m[2] === "+" ? a + b : a - b) === c;
  }

  // --- squares -------------------------------------------------------------

  function cellEdges(r, c) {
    return ["h." + r + "." + c, "h." + (r + 1) + "." + c, "v." + r + "." + c, "v." + r + "." + (c + 1)];
  }

  function squaresAllSlots(w, h) {
    const out = [];
    for (let r = 0; r <= h; r++) for (let c = 0; c < w; c++) out.push("h." + r + "." + c);
    for (let r = 0; r < h; r++) for (let c = 0; c <= w; c++) out.push("v." + r + "." + c);
    return out;
  }

  function squaresStart(cells) {
    const set = {};
    cells.forEach((rc) => cellEdges(rc[0], rc[1]).forEach((e) => { set[e] = true; }));
    return Object.keys(set);
  }

  // Number of closed small squares, and whether every match is part of one.
  function countSquares(w, h, set) {
    const has = {};
    set.forEach((id) => { has[id] = true; });
    const used = {};
    let n = 0;
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const e = cellEdges(r, c);
        if (e.every((x) => has[x])) { n++; e.forEach((x) => { used[x] = true; }); }
      }
    }
    return { n, loose: set.filter((x) => !used[x]).length };
  }

  // --- both ------------------------------------------------------------------

  function startSlots(p) {
    return p.kind === "e" ? sumSlots(p.start) : squaresStart(p.cells);
  }

  function allSlots(p) {
    return p.kind === "e" ? sumAllSlots(p.start) : squaresAllSlots(p.w, p.h);
  }

  function isSolved(p, set) {
    if (p.kind === "e") {
      const s = readSum(p.start, set);
      return !!s && sumIsTrue(s);
    }
    const c = countSquares(p.w, p.h, set);
    return c.n === p.n && c.loose === 0;
  }

  // How many matches lie away from their start slot.
  function movedCount(p, set) {
    const start = {};
    startSlots(p).forEach((id) => { start[id] = true; });
    return set.filter((id) => !start[id]).length;
  }

  // Every solved position reachable from the start with at most `k`
  // moves, each as a sorted slot list, with its number of moves.
  function solutions(p, k) {
    const start = startSlots(p);
    const all = allSlots(p);
    const inStart = {};
    start.forEach((id) => { inStart[id] = true; });
    const free = all.filter((id) => !inStart[id]);
    const out = [];
    const maxK = k === undefined ? p.k : k;
    function take(fromList, n, at, acc, fn) {
      if (acc.length === n) { fn(acc); return; }
      for (let i = at; i < fromList.length; i++) { acc.push(fromList[i]); take(fromList, n, i + 1, acc, fn); acc.pop(); }
    }
    for (let m = 1; m <= maxK; m++) {
      take(start, m, 0, [], (gone) => {
        const goneSet = {};
        gone.forEach((g) => { goneSet[g] = true; });
        const keep = start.filter((id) => !goneSet[id]);
        take(free, m, 0, [], (added) => {
          const set = keep.concat(added);
          if (isSolved(p, set)) out.push({ moves: m, slots: set.slice().sort() });
        });
      });
    }
    return out;
  }

  // A hint: the match to take and the slot to lay it on, towards the
  // nearest solution: { from, to }, or null when there is nothing to do.
  // A match that was already moved is taken first, and laid back on a
  // start slot first, so following the hint never moves more than k.
  function findHint(p, set, sols) {
    const list = sols || solutions(p);
    const has = {};
    set.forEach((id) => { has[id] = true; });
    const start = {};
    startSlots(p).forEach((id) => { start[id] = true; });
    let best = null, bestD = Infinity;
    list.forEach((s) => {
      const inS = {};
      s.slots.forEach((id) => { inS[id] = true; });
      const wrong = set.filter((id) => !inS[id]);
      if (wrong.length < bestD) { bestD = wrong.length; best = { wrong, missing: s.slots.filter((id) => !has[id]) }; }
    });
    if (!best || !best.wrong.length) return null;
    const from = best.wrong.filter((id) => !start[id]).concat(best.wrong.filter((id) => start[id]))[0];
    const to = best.missing.filter((id) => start[id]).concat(best.missing.filter((id) => !start[id]))[0];
    return { from, to };
  }

  // --- drawing geometry ----------------------------------------------------

  // Every slot of the layout as a line { id, x1, y1, x2, y2 } in a
  // drawing of size { w, h }.
  const DW = 44, DH = 84, GAP = 18;
  function geometry(p) {
    const lines = [];
    if (p.kind === "e") {
      let x = 10;
      const y = 10;
      parseSum(p.start).forEach((tok, i) => {
        if (tok.t === "D") {
          const L = x, R = x + DW, T = y, M = y + DH / 2, B = y + DH;
          const segs = [[L, T, R, T], [R, T, R, M], [R, M, R, B], [L, B, R, B], [L, M, L, B], [L, T, L, M], [L, M, R, M]];
          segs.forEach((s, k) => lines.push({ id: i + "." + k, x1: s[0], y1: s[1], x2: s[2], y2: s[3] }));
          x += DW + GAP;
        } else if (tok.t === "O") {
          const cx = x + DW / 2 - 2, cy = y + DH / 2;
          lines.push({ id: i + ".0", x1: cx - DW / 2 + 2, y1: cy, x2: cx + DW / 2 - 2, y2: cy });
          lines.push({ id: i + ".1", x1: cx, y1: cy - DW / 2 + 2, x2: cx, y2: cy + DW / 2 - 2 });
          x += DW + GAP - 4;
        } else {
          const cy = y + DH / 2;
          lines.push({ id: i + ".0", x1: x, y1: cy - 10, x2: x + DW - 4, y2: cy - 10 });
          lines.push({ id: i + ".1", x1: x, y1: cy + 10, x2: x + DW - 4, y2: cy + 10 });
          x += DW + GAP - 4;
        }
      });
      return { w: x - GAP + 10, h: DH + 20, lines };
    }
    const S = 60, O = 10;
    for (let r = 0; r <= p.h; r++) for (let c = 0; c < p.w; c++) lines.push({ id: "h." + r + "." + c, x1: O + c * S, y1: O + r * S, x2: O + (c + 1) * S, y2: O + r * S });
    for (let r = 0; r < p.h; r++) for (let c = 0; c <= p.w; c++) lines.push({ id: "v." + r + "." + c, x1: O + c * S, y1: O + r * S, x2: O + c * S, y2: O + (r + 1) * S });
    return { w: p.w * S + 2 * O, h: p.h * S + 2 * O, lines };
  }

  // --- the puzzles ---------------------------------------------------------
  // Sums are written as strings; squares as "w x h, n squares, cells".
  // Generated by tools/matches-gen.js (see there), kept as fixed data.
  const RAW = {
    easy: [
      "e:1:1+1=6", "e:1:6-3=4", "e:1:2+5=5", "e:1:7-7=9",
      "e:1:0-0=8", "e:1:6+7=7", "e:1:9+8=0", "e:1:5-5=2",
      "e:1:8-0=2", "e:1:6+3=5", "e:1:7-7=6", "e:1:2+5=8",
      "e:1:9-8=2", "e:1:8+7=3", "e:1:4-5=8", "e:1:5+1=9",
      "e:1:2+1=5", "e:1:5+2=4", "e:1:5+1=8", "e:1:2-9=7",
      "s:1:4:3:7:0,1;0,2;1,0;1,1;1,2;1,3;2,0;2,2", "s:1:4:3:7:0,0;0,2;1,0;1,1;1,2;1,3;2,1;2,2", "s:1:4:3:7:0,1;0,3;1,0;1,1;1,2;1,3;2,1;2,2", "s:1:4:3:7:0,1;0,2;1,0;1,1;1,2;1,3;2,1;2,3",
      "s:2:3:3:6:0,0;0,1;1,0;1,1;1,2;2,0;2,1", "s:2:3:3:6:0,1;0,2;1,0;1,1;1,2;2,0;2,1", "s:2:3:3:6:0,0;0,1;1,0;1,1;1,2;2,1;2,2", "s:2:3:3:6:0,1;1,0;1,1;1,2;2,0;2,1;2,2",
      "s:2:3:3:6:0,0;0,1;0,2;1,0;1,1;1,2;2,1", "s:2:3:3:6:0,1;0,2;1,0;1,1;1,2;2,1;2,2"
    ],
    medium: [
      "e:1:89-53=27", "e:1:18+56=85", "e:1:91+34=71", "e:1:9+6=12",
      "e:1:38+63=33", "e:1:30-25=95", "e:1:98+7=37", "e:1:98-2=87",
      "e:1:98+1=38", "e:1:5-5=18", "e:1:81+10=61", "e:1:22+32=64",
      "e:1:99+1=89", "e:1:6+7=15", "e:1:36+39=66", "e:1:47-50=91",
      "e:1:2+3=71", "e:1:95-3=83", "e:1:19-21=36", "e:1:97-8=51",
      "s:2:4:3:7:0,1;0,2;1,0;1,1;1,2;2,0;2,1;2,2", "s:2:4:3:7:0,0;1,0;1,1;1,2;1,3;2,0;2,1;2,2", "s:2:4:3:9:0,1;0,2;0,3;1,0;1,1;1,3;2,1;2,3", "s:2:4:3:7:0,1;0,2;0,3;1,0;1,1;1,2;1,3;2,2",
      "s:2:3:3:4:0,0;0,1;0,2;1,0;2,0", "s:2:4:3:6:0,0;1,0;1,1;1,2;1,3;2,0;2,1", "s:2:4:3:6:0,3;1,0;1,1;1,2;1,3;2,2;2,3", "s:2:3:3:8:0,0;0,1;0,2;1,1;2,0;2,1;2,2",
      "s:2:4:3:7:0,0;0,1;1,0;1,1;1,2;1,3;2,0;2,3", "s:2:4:3:7:0,2;0,3;1,0;1,1;1,2;1,3;2,1;2,2"
    ],
    hard: [
      "e:2:2-5=9", "e:2:6+5=1", "e:2:0+3=47", "e:2:1-8=12",
      "e:2:5-1=18", "e:2:3+7=5", "e:2:5+6=17", "e:2:9-3=19",
      "e:2:6+1=72", "e:2:7+1=13", "e:2:2+5=2", "e:2:1+9=70",
      "e:2:0-9=16", "e:2:9-5=48", "e:2:2+9=78", "e:2:5+9=49",
      "e:2:9+5=40", "e:2:1-8=2", "e:2:7-5=46", "e:2:5+3=2",
      "s:2:4:3:7:0,2;1,0;1,2;1,3;2,0;2,1;2,2;2,3", "s:2:4:3:5:0,1;1,1;1,2;2,0;2,1;2,2", "s:2:4:3:5:0,0;0,1;0,2;0,3;1,3;2,3", "s:2:4:3:7:0,0;0,3;1,0;1,2;1,3;2,0;2,1;2,2",
      "s:2:4:3:7:0,0;0,2;0,3;1,0;1,1;1,2;1,3;2,0", "s:2:4:3:6:0,2;1,0;1,1;1,2;1,3;2,0;2,2", "s:2:4:3:7:0,0;1,0;1,1;1,2;1,3;2,0;2,2;2,3", "s:2:4:3:4:0,0;0,1;0,2;1,2;2,2",
      "s:2:4:3:7:0,0;0,1;1,0;1,1;1,3;2,1;2,2;2,3", "s:2:4:3:5:0,0;0,1;0,2;1,0;1,1;2,1"
    ]
  };

  function decode(level, raw) {
    if (raw.charAt(0) === "e") {
      const parts = raw.split(":");
      return { kind: "e", level, k: +parts[1], start: parts[2] };
    }
    // "s:k:w:h:n:r,c;r,c;..."
    const parts = raw.split(":");
    return { kind: "s", level, k: +parts[1], w: +parts[2], h: +parts[3], n: +parts[4], cells: parts[5].split(";").map((rc) => rc.split(",").map(Number)) };
  }

  const PUZZLES = {};
  Object.keys(RAW).forEach((lv) => { PUZZLES[lv] = RAW[lv].map((r) => decode(lv, r)); });

  return { DIGITS, PUZZLES, RAW, decode, parseSum, sumSlots, readSum, sumIsTrue, countSquares, startSlots, allSlots, isSolved, movedCount, solutions, findHint, geometry };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = MatchesCore;
}
if (typeof window !== "undefined") {
  window.MatchesCore = MatchesCore;
}
