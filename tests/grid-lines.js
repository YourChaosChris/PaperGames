#!/usr/bin/env node
// Task 222: board grids keep thin cell lines and thick box lines, also with
// high contrast and 150 % text. High contrast once set every button border
// to 3px, and the cells of Sudoku and its relatives are buttons, so the
// 3x3 boxes vanished.
// Run: node tests/grid-lines.js
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

// Page, cell selector, cell on a box line, cell inside a box (both by index).
const GRIDS = [
  ["sudoku", ".sudoku-cell", 3, 1],
  ["animalsudoku", ".animalsudoku-cell", null, null],
  ["killersudoku", ".rp-cell", null, null],
  ["calcudoku", ".rp-cell", null, null],
  ["nonogram", ".nonogram-cell", null, null],
  ["cake", ".cake-cell", null, null]
];

(async () => {
  const browser = await chromium.launch();
  for (const [size, contrast] of [["normal", false], ["normal", true], ["xlarge", true]]) {
    const ctx = await browser.newContext({ viewport: { width: 384, height: 752 }, serviceWorkers: "block" });
    await ctx.addInitScript(([s, c]) => {
      try { localStorage.setItem("einkchess_text_size", s); localStorage.setItem("einkchess_high_contrast", c ? "1" : "0"); } catch (e) {}
    }, [size, contrast]);
    const mode = size + (contrast ? "+contrast" : "");
    for (const [name, sel, boxIdx, innerIdx] of GRIDS) {
      const page = await ctx.newPage();
      page.on("dialog", (d) => d.accept());
      await page.goto(BASE + name + ".html?lang=de", { waitUntil: "load" });
      await page.waitForSelector(sel, { timeout: 10000 });
      const r = await page.evaluate(([sel, boxIdx, innerIdx]) => {
        const cells = [...document.querySelectorAll(sel)];
        const w = [];
        cells.forEach((c) => {
          const s = getComputedStyle(c);
          w.push(parseFloat(s.borderLeftWidth), parseFloat(s.borderTopWidth));
        });
        const left = (i) => parseFloat(getComputedStyle(cells[i]).borderLeftWidth);
        return {
          min: Math.min.apply(null, w),
          max: Math.max.apply(null, w),
          box: boxIdx === null ? null : left(boxIdx),
          inner: innerIdx === null ? null : left(innerIdx)
        };
      }, [sel, boxIdx, innerIdx]);
      check(name + " " + mode + ": box lines (" + r.max + " px) thicker than cell lines (" + r.min + " px)", r.max > r.min);
      if (r.box !== null) {
        check(name + " " + mode + ": box line " + r.box + " px is 3 px", r.box === 3);
        check(name + " " + mode + ": cell line " + r.inner + " px is 1 px", r.inner === 1);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  if (fails.length) {
    console.log("FAIL grid-lines:\n  " + fails.join("\n  "));
    process.exit(1);
  }
  console.log("OK grid-lines: " + GRIDS.length + " grids keep thin and thick lines, also with high contrast and 150 %");
})();
