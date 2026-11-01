#!/usr/bin/env node
// Zahlenbild (task 166), no server or browser needed. Every picture of every
// level: dots numbered without gaps from 1 (one dot per number), no two dots
// at the same place, at least 4 board units apart, inside the board, the
// closed line has no crossings; dot counts per level (easy 10 to 20, medium
// 25 to 30, hard 40 to 45, expert 48 to 60) and at least 5 pictures per
// level, all with a name in 12 languages. Numbers: at the scale where the
// closest dots are a tap target (44 px) apart, no number box covers another
// number or a dot. Task 169: easy as before (whole board, dots 44 px apart
// and more); from medium on the whole picture fitted to the board on the
// 360 x 640 phone (324 px), the 384 x 752 phone (352 px), the 600 x 800
// reader (560 px) and a 640 px board: numbers from 8 px up, none covering
// another number or a dot; the same at the "Magnify" scale (closest dots
// 30 px apart); the smallest distance of the closest dots per level and
// board is printed. A tap counts for the dot looked for when it is one of
// the two dots nearest to the tap within reach. Play:
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
const BOARDS_169 = [324, 352, 560, 636];
const spacing169 = {};
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

// Number boxes for a layout (task 169) at `scale`: covering another number or a dot.
function overlapsAt(level, id, scale, lay) {
  const dots = Z.dotsOf(level, id);
  const b = dots.map((p, i) => {
    const box = Z.labelBox(i, lay.font);
    const off = Z.offsetFor(lay.dirs[i], box, lay.dot);
    return { x: p[0] * scale + off[0], y: p[1] * scale + off[1], w: box.w, h: box.h, px: p[0] * scale, py: p[1] * scale };
  });
  const bad = [];
  for (let i = 0; i < b.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (i === j) continue;
      if (j > i && Math.abs(b[i].x - b[j].x) * 2 < b[i].w + b[j].w && Math.abs(b[i].y - b[j].y) * 2 < b[i].h + b[j].h) bad.push("numbers " + (i + 1) + "/" + (j + 1));
      const nx = Math.max(b[i].x - b[i].w / 2, Math.min(b[j].px, b[i].x + b[i].w / 2));
      const ny = Math.max(b[i].y - b[i].h / 2, Math.min(b[j].py, b[i].y + b[i].h / 2));
      if (Math.hypot(nx - b[j].px, ny - b[j].py) < lay.dot) bad.push("number " + (i + 1) + " on dot " + (j + 1));
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
    if (level === "easy") {
      for (const px of BOARDS) {
        const scale = Math.max(px / 108, s0);
        const b2 = overlaps(level, m.id, scale);
        check(tag + ": on a " + px + " px board " + b2.slice(0, 4).join(", "), b2.length === 0);
        check(tag + ": tap targets " + (min * scale).toFixed(1) + " px on a " + px + " px board", min * scale >= 44 - 1e-6);
        const v = Z.wholeView(level, m.id, px);
        check(tag + ": easy whole board unchanged", v.size === 108 && v.x === -4);
      }
    } else {
      // Task 169: the fitted whole picture and "Magnify", numbers clear.
      for (const px of BOARDS_169) {
        const v = Z.wholeView(level, m.id, px);
        const lay = Z.layout(level, m.id, v.scale, v);
        const b3 = overlapsAt(level, m.id, v.scale, lay);
        // Every number inside the board.
        const out = Z.dotsOf(level, m.id).filter((p, i) => {
          const box = Z.labelBox(i, lay.font), off = Z.offsetFor(lay.dirs[i], box, lay.dot);
          const x = (p[0] - v.x) * v.scale + off[0], y = (p[1] - v.y) * v.scale + off[1];
          return x - box.w / 2 < 0 || x + box.w / 2 > px || y - box.h / 2 < 0 || y + box.h / 2 > px;
        });
        check(tag + ": numbers inside the " + px + " px board (" + out.length + " outside)", out.length === 0);
        check(tag + ": whole picture on " + px + " px: " + lay.bad + " numbers without place, " + b3.slice(0, 3).join(", "), lay.bad === 0 && b3.length === 0);
        check(tag + ": numbers at least 8 px on " + px + " px (" + lay.font + ")", lay.font >= 8);
        const inside = Z.dotsOf(level, m.id).every((p) => p[0] >= v.x && p[0] <= v.x + v.size && p[1] >= v.y && p[1] <= v.y + v.size);
        check(tag + ": whole picture inside the board on " + px + " px", inside);
        const key = level + "@" + px;
        spacing169[key] = Math.min(spacing169[key] || Infinity, min * v.scale);
      }
      const ms = Z.magnifyScale(level, m.id);
      check(tag + ": magnify 30 px apart", Math.abs(min * ms - 30) < 1e-6);
      const lm = Z.layout(level, m.id, ms);
      const bm = overlapsAt(level, m.id, ms, lm);
      check(tag + ": magnified numbers clear (" + lm.font + " px)", lm.bad === 0 && bm.length === 0);
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

// Taps (task 169): the dot looked for counts when it is one of the two
// nearest dots within reach; otherwise the nearest dot; nothing out of reach.
{
  const d = Z.dotsOf("expert", "lighthouse");
  let near = -1, best = Infinity;
  for (let i = 0; i < d.length; i++) for (let j = i + 1; j < d.length; j++) {
    const h = Math.hypot(d[i][0] - d[j][0], d[i][1] - d[j][1]);
    if (h < best) { best = h; near = [i, j]; }
  }
  const [a, b] = near;
  const mid = [(d[a][0] + d[b][0]) / 2, (d[a][1] + d[b][1]) / 2];
  check("tap between two close dots counts for the one looked for (a)", Z.dotAt("expert", "lighthouse", mid[0], mid[1], 5, a) === a);
  check("tap between two close dots counts for the one looked for (b)", Z.dotAt("expert", "lighthouse", mid[0], mid[1], 5, b) === b);
  const far = (a + Math.floor(d.length / 2)) % d.length;
  check("tap on a dot far from the one looked for is that dot", Z.dotAt("expert", "lighthouse", d[a][0], d[a][1], 5, far) === a);
  check("tap out of reach is nothing", Z.dotAt("expert", "lighthouse", -50, -50, 5, a) === -1);
}

Object.keys(spacing169).forEach((k) => console.log("whole picture " + k + ": closest dots " + spacing169[k].toFixed(1) + " px"));
fails.forEach((f) => console.log("FAIL " + f));
console.log("=== ZAHLENBILD CORE: " + pictures + " pictures, " + dotsAll + " dots, closest dots " + minAll.toFixed(2) + " units, no crossings, numbers clear of each other, play and undo, " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
