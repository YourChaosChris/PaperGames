#!/usr/bin/env node
// Zahlenbild (task 166), no server or browser needed. Every picture of every
// level: dots numbered without gaps from 1 (one dot per number), no two dots
// at the same place, at least 4 board units apart, inside the board, the
// closed line has no crossings; dot counts per level (easy 10 to 20, medium
// 25 to 30, hard 40 to 45, expert 48 to 60) and at least 5 pictures per
// level, all with a name in 12 languages. Numbers: at the scale where the
// closest dots are a tap target (44 px) apart, no number box covers another
// number or a dot; also checked on the 360 x 640 and the reader board as the
// app draws them (whole board when it fits, else the magnified part). Play:
// only the next dot counts, a wrong dot changes nothing but the miss count,
// the last dot solves, undo goes back one dot; a saved state is valid, an
// old or broken one not.
const fs = require("fs");
const path = require("path");
const Z = require("../zahlenbild-core.js");
const ROOT = path.join(__dirname, "..");
const LANGS = ["en", "de", "fr", "es", "it", "nl", "pl", "uk", "ru", "ja", "zh", "ar"];
const text = {};
LANGS.forEach((l) => { text[l] = fs.readFileSync(path.join(ROOT, l === "en" ? "i18n.js" : "lang/" + l + ".js"), "utf8"); });
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const RANGE = { easy: [10, 20], medium: [25, 30], hard: [40, 45], expert: [48, 60] };
// Board widths in px as the app gets them: 360 x 640 phone, e-reader (600 px card).
const BOARDS = [324, 560];
let pictures = 0, dotsAll = 0, minAll = Infinity;

function boxesAt(level, id, scale, k) {
  const dots = Z.dotsOf(level, id);
  const look = Z.LOOK[level];
  const dirs = Z.labels(level, id);
  return dots.map((p, i) => {
    const box = Z.labelBox(i, look.font);
    const off = Z.offsetFor(dirs[i], box, look.dot);
    return { x: p[0] * scale + off[0] * k, y: p[1] * scale + off[1] * k, w: box.w * k, h: box.h * k, px: p[0] * scale, py: p[1] * scale };
  });
}

function overlaps(level, id, scale) {
  const b = boxesAt(level, id, scale, 1);
  const r = Z.LOOK[level].dot;
  const bad = [];
  for (let i = 0; i < b.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (i === j) continue;
      if (j > i && Math.abs(b[i].x - b[j].x) * 2 < b[i].w + b[j].w && Math.abs(b[i].y - b[j].y) * 2 < b[i].h + b[j].h) bad.push("numbers " + (i + 1) + "/" + (j + 1));
      const nx = Math.max(b[i].x - b[i].w / 2, Math.min(b[j].px, b[i].x + b[i].w / 2));
      const ny = Math.max(b[i].y - b[i].h / 2, Math.min(b[j].py, b[i].y + b[i].h / 2));
      if (Math.hypot(nx - b[j].px, ny - b[j].py) < r) bad.push("number " + (i + 1) + " on dot " + (j + 1));
    }
  }
  return bad;
}

for (const level of Z.LEVELS) {
  const list = Z.MOTIFS[level];
  check(level + ": at least 5 pictures (" + list.length + ")", list.length >= 5);
  const ids = new Set();
  for (const m of list) {
    pictures++;
    check(level + ": picture id twice " + m.id, !ids.has(m.id));
    ids.add(m.id);
    const dots = Z.dotsOf(level, m.id);
    dotsAll += dots.length;
    const tag = level + "/" + m.id;
    check(tag + ": " + dots.length + " dots, wanted " + RANGE[level].join("-"), dots.length >= RANGE[level][0] && dots.length <= RANGE[level][1]);
    const keys = new Set(dots.map((p) => p.join(",")));
    check(tag + ": two dots at the same place", keys.size === dots.length);
    check(tag + ": dot outside the board", dots.every((p) => p[0] >= 0 && p[0] <= 100 && p[1] >= 0 && p[1] <= 100));
    const min = Z.minSpacing(dots);
    minAll = Math.min(minAll, min);
    check(tag + ": dots closer than 4 units (" + min.toFixed(2) + ")", min >= 4 - 1e-9);
    check(tag + ": the line crosses itself " + Z.crossings(dots) + " times", Z.crossings(dots) === 0);
    // Numbers 1..n without gaps: the labels are the indices + 1, one per dot.
    check(tag + ": one number per dot", Z.labels(level, m.id).length === dots.length);
    const s0 = Z.scaleFor(level, m.id);
    const bad = overlaps(level, m.id, s0);
    check(tag + ": at tap-target scale " + bad.slice(0, 4).join(", "), bad.length === 0);
    for (const px of BOARDS) {
      const scale = Math.max(px / 108, s0);
      const b2 = overlaps(level, m.id, scale);
      check(tag + ": on a " + px + " px board " + b2.slice(0, 4).join(", "), b2.length === 0);
      check(tag + ": tap targets " + (min * scale).toFixed(1) + " px on a " + px + " px board", min * scale >= 44 - 1e-6);
    }
    LANGS.forEach((l) => check(tag + ": name missing in " + l, new RegExp("^    zb_motif_" + m.id + ": \"[^\"]+\"", "m").test(text[l])));
    check(tag + ": details are paths", Array.isArray(m.details) && m.details.every((d) => /^M[-0-9. ,MLHVQCZAaqlhvzc]+$/.test(d)));
  }
}

// Play one picture through, with wrong taps on the way.
{
  let s = Z.newGame("medium", "car");
  const n = Z.dotsOf("medium", "car").length;
  check("new game", s.done === 0 && !s.solved && Z.valid(s));
  let r = Z.tap(s, 3);
  check("wrong first dot refused", !r.ok && r.reason === "wrong" && r.state.done === 0 && r.state.misses === 1);
  s = r.state;
  for (let i = 0; i < n; i++) {
    if (i === 5) { const w = Z.tap(s, 9); check("wrong dot in the middle", !w.ok && w.state.done === 5); s = w.state; }
    r = Z.tap(s, i);
    check("dot " + (i + 1) + " counts", r.ok && r.state.done === i + 1);
    s = r.state;
  }
  check("last dot solves", s.solved && s.done === n && s.misses === 2);
  check("no tap after the end", !Z.tap(s, 0).ok);
  const u = Z.undo(s);
  check("undo after the end", u.done === n - 1 && !u.solved);
  check("undo at the start does nothing", Z.undo(Z.newGame("easy", "house")).done === 0);
  check("saved state valid", Z.valid(JSON.parse(JSON.stringify(u))));
  check("unknown picture not valid", !Z.valid(Object.assign({}, u, { motif: "nothing" })));
  check("old rules not valid", !Z.valid(Object.assign({}, u, { rules: 0 })));
  check("too many dots not valid", !Z.valid(Object.assign({}, u, { done: n + 1 })));
  check("unknown level starts easy", Z.newGame("x").level === "easy");
  check("next picture goes round", Z.nextMotif("easy", Z.MOTIFS.easy[4].id) === Z.MOTIFS.easy[0].id);
}

fails.forEach((f) => console.log("FAIL " + f));
console.log("=== ZAHLENBILD CORE: " + pictures + " pictures, " + dotsAll + " dots, closest dots " + minAll.toFixed(2) + " units, no crossings, numbers clear of each other, play and undo, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
