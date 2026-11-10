#!/usr/bin/env node
// Link the Pairs (task 198): every new game is a puzzle made on the device
// with exactly one solution; it survives a reload (saved as text).
const { chromium } = require("playwright");
const Core = require("../linkpairs-core.js");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

// Core: 30 puzzles per level, one solution each, text round trip.
for (const level of ["easy", "medium", "hard"]) {
  let ok = 0;
  for (let i = 0; i < 30; i++) {
    const p = Core.generatePuzzle(level);
    if (!p) continue;
    const q = Core.decode(level, Core.encode(p));
    if (Core.countSolutions(q, 2) === 1) ok++;
  }
  check(level + ": 30 of 30 generated puzzles have exactly one solution (" + ok + ")", ok === 30);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "linkpairs.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-linkpairs-game"))) await page.click("#menu-toggle");
  const seen = new Set();
  for (let i = 0; i < 4; i++) {
    await page.click("#start-linkpairs-game");
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({ index: AppStateLinkPairs.index, text: AppStateLinkPairs.text, cells: document.querySelectorAll("#linkpairs-board [data-index]").length }));
    check("new game is made on the device " + JSON.stringify(r), r.index === -1 && typeof r.text === "string" && r.cells === 25);
    seen.add(r.text);
    if (!(await page.isVisible("#start-linkpairs-game"))) await page.click("#menu-toggle");
  }
  check("four games, mostly different puzzles", seen.size >= 3);
  const before = await page.evaluate(() => AppStateLinkPairs.text);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => AppStateLinkPairs.text);
  check("the puzzle is back after a reload", before === after);
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("linkpairs-new: ALL CHECKS PASS");
})();
