// tests/differences-core.js
// "Spot the Difference": 500 generated picture pairs per level.
//
// Checks: 3 / 5 / 7 differences (Easy / Medium / Hard); every difference
// in an area of its own (no two at the same place) and on an item that is
// there; picture B differs from A exactly in the areas of the
// differences - every difference changes the drawing, nothing else
// changes; a mirrored item looks different mirrored; a moved item stays
// inside its area; areaAt() finds the right area.
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

console.log("kinds: " + JSON.stringify(kinds));
fails.slice(0, 20).forEach((f) => console.log("FAIL " + f));
console.log("\n=== DIFFERENCES CORE: " + (PER_LEVEL * 3) + " picture pairs (500 per level), " + fails.length + " failure(s) ===");
process.exit(fails.length ? 1 : 0);
