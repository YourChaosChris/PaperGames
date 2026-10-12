// tests/differences-core.js
// "Spot the Difference": 500 generated picture pairs per level.
//
// Checks: 3 / 5 / 7 differences (Easy / Medium / Hard); every difference
// in an area of its own (no two at the same place) and on an item that is
// there; picture B differs from A exactly in the areas of the
// differences - every difference changes the drawing, nothing else
// changes; a mirrored item looks different mirrored; a moved item stays
// inside its area; areaAt() finds the right area.
// Picture search (Suchbild): 200 pictures per room and level (9 rooms) -
// 5 / 7 / 10 things to find, the level's number of drawings, at most one
// drawing per cell, all of them things of the room; every thing to find
// is in the picture, and exactly once (no other drawing has its look:
// type, pattern and, for drawings that look different mirrored,
// direction); every drawing and the white disc under it stay inside its
// cell; the room's background is drawn; cellAt() finds the right cell.
// "Any room" picks every room; an old saved picture without a room still
// draws (plain ground). Every drawing has a name in all 12 languages, and
// so does every room.
//
// Run: node tests/differences-core.js

const D = require("../differences-core.js");

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const PER_LEVEL = 500;
const fails = [];
const kinds = {};

for (const level of Object.keys(D.LEVELS)) {
  for (let seed = 1; seed <= PER_LEVEL; seed++) {
    const tag = level + " #" + seed;
    const p = D.generatePuzzle(level, rng(seed * 53 + level.length));
    if (p.diffs.length !== D.LEVELS[level].diffs) fails.push(tag + ": " + p.diffs.length + " differences");
    const areas = p.diffs.map((d) => d.area);
    if (new Set(areas).size !== areas.length) fails.push(tag + ": two differences in one area");
    if (new Set(p.items.map((i) => i.area)).size !== p.items.length) fails.push(tag + ": two items in one area");
    const b = D.pictureB(p);
    for (let area = 0; area < D.COLS * D.ROWS; area++) {
      const ia = p.items.find((i) => i.area === area), ib = b.find((i) => i.area === area);
      const sa = ia ? D.itemSvg(ia, "x") : "", sb = ib ? D.itemSvg(ib, "x") : "";
      const isDiff = areas.indexOf(area) !== -1;
      if (isDiff && !ia) fails.push(tag + ": difference on an empty area");
      if (isDiff && sa === sb) fails.push(tag + ": difference in area " + area + " changes nothing");
      if (!isDiff && sa !== sb) fails.push(tag + ": area " + area + " changed without a difference");
    }
    p.diffs.forEach((d) => {
      kinds[level + "/" + d.kind] = (kinds[level + "/" + d.kind] || 0) + 1;
      const it = p.items.find((i) => i.area === d.area);
      if (d.kind === "mirror" && !D.TYPES[it.type].asym) fails.push(tag + ": mirrored a symmetric drawing");
      if (d.kind === "moved" && (Math.abs(d.dx) > 13 || Math.abs(d.dy) > 13)) fails.push(tag + ": moved too far");
    });
  }
}
// areaAt
if (D.areaAt(10, 10) !== 0 || D.areaAt(299, 179) !== 14 || D.areaAt(130, 70) !== 7 || D.areaAt(-1, 5) !== -1) fails.push("areaAt");

// --- picture search ---
const PER_ROOM = 200;
const searchStats = {};
for (const level of Object.keys(D.SEARCH)) {
  const cfg = D.SEARCH[level];
  let sameType = 0, pictures = 0;
  for (const room of D.ROOM_NAMES) {
    const names = D.ROOMS[room].items;
    if (new Set(names).size < cfg.targets) fails.push(room + ": too few kinds of drawings for " + level);
    names.forEach((n) => { if (!D.TYPES[n]) fails.push(room + ": no drawing " + n); });
    for (let seed = 1; seed <= PER_ROOM; seed++) {
      const tag = "search " + room + " " + level + " #" + seed;
      const p = D.generateSearch(level, rng(seed * 97 + level.length * 7 + room.length * 1013), room);
      pictures++;
      if (p.room !== room) fails.push(tag + ": room " + p.room);
      if (p.targets.length !== cfg.targets) fails.push(tag + ": " + p.targets.length + " things to find");
      if (p.items.length !== cfg.items) fails.push(tag + ": " + p.items.length + " drawings");
      if (new Set(p.items.map((i) => i.cell)).size !== p.items.length) fails.push(tag + ": two drawings in one cell");
      if (new Set(p.targets).size !== p.targets.length) fails.push(tag + ": a thing to find twice");
      const looks = {};
      p.items.forEach((i) => {
        looks[D.lookOf(i)] = (looks[D.lookOf(i)] || 0) + 1;
        if (names.indexOf(i.type) === -1) fails.push(tag + ": " + i.type + " does not belong in the room");
        if (i.cell < 0 || i.cell >= p.cols * p.rows) fails.push(tag + ": drawing off the picture");
        if (Math.abs(i.dx) * 2 + 40 * i.scale > 40 + 1 || Math.abs(i.dy) * 2 + 40 * i.scale > 40 + 1) fails.push(tag + ": drawing leaves its cell");
        if (Math.max(Math.abs(i.dx), Math.abs(i.dy)) + 20 * i.scale + 1 > 20) fails.push(tag + ": white disc leaves its cell");
      });
      const targetTypes = new Set();
      p.targets.forEach((c) => {
        const it = p.items.find((i) => i.cell === c);
        if (!it) { fails.push(tag + ": thing to find not in the picture"); return; }
        if (looks[D.lookOf(it)] !== 1) fails.push(tag + ": look " + D.lookOf(it) + " " + looks[D.lookOf(it)] + " times");
        targetTypes.add(it.type);
      });
      if (level !== "hard" && targetTypes.size !== p.targets.length) fails.push(tag + ": two things to find of the same kind");
      p.items.forEach((i) => { if (p.targets.indexOf(i.cell) === -1 && targetTypes.has(i.type)) sameType++; });
      if (D.cellAt(p, 5, 5) !== 0 || D.cellAt(p, p.cols * 40 - 1, p.rows * 40 - 1) !== p.cols * p.rows - 1 || D.cellAt(p, -1, 0) !== -1) fails.push(tag + ": cellAt");
      if (seed <= 3) {
        const svg = D.searchSvg(p, "t");
        if (svg.indexOf('class="df-room"') === -1) fails.push(tag + ": no background");
        if (/NaN|undefined/.test(svg)) fails.push(tag + ": broken picture");
      }
    }
  }
  searchStats[level] = cfg.cols + " x " + cfg.rows + " cells, " + cfg.items + " drawings, " + cfg.targets + " to find, " + (sameType / pictures).toFixed(1) + " look-alikes of the same type per picture";
}
{
  // "Any room" and an old saved picture without a room.
  const seen = new Set();
  for (let seed = 1; seed <= 200; seed++) seen.add(D.generateSearch("easy", rng(seed * 31), "random").room);
  if (seen.size !== D.ROOM_NAMES.length) fails.push("any room: only " + seen.size + " rooms");
  const old = D.generateSearch("medium", rng(5), "attic");
  delete old.room;
  const svg = D.searchSvg(old, "o");
  if (svg.indexOf('class="df-room"') !== -1 || /NaN|undefined/.test(svg)) fails.push("old saved picture without a room");
  // Names of all drawings and rooms in all languages.
  const { loadI18n } = require("./load-i18n.js");
  const STRINGS = loadI18n({ texts: false }).STRINGS;
  for (const lang of Object.keys(STRINGS)) {
    Object.keys(D.TYPES).forEach((t) => { if (!STRINGS[lang]["df_item_" + t]) fails.push(lang + " lacks df_item_" + t); });
    D.ROOM_NAMES.concat(["random", "label"]).forEach((r) => { if (!STRINGS[lang]["df_room_" + r]) fails.push(lang + " lacks df_room_" + r); });
  }
}
Object.keys(searchStats).forEach((l) => console.log("search " + l + ": " + searchStats[l]));

console.log("kinds: " + JSON.stringify(kinds));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== DIFFERENCES CORE: " + (PER_LEVEL * 3) + " picture pairs and " + (PER_ROOM * 3 * D.ROOM_NAMES.length) + " search pictures (" + PER_ROOM + " per room and level, " + D.ROOM_NAMES.length + " rooms), " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
