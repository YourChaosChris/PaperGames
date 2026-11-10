#!/usr/bin/env node
// Sudoku Daily Challenge keeps its entries (task 201): enter a digit, start a
// normal puzzle, press the Daily button again -> the same grid with the digit.
// A reload in between works as well. Run: node tests/sudoku-daily-keep.js
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 384, height: 800 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "sudoku.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const clickDaily = async () => { await page.evaluate(() => document.getElementById("daily-sudoku-button").click()); await page.waitForTimeout(400); };
  await clickDaily();
  const idx = await page.evaluate(() => {
    const A = AppStateSudoku; const i = A.grid.findIndex((v, k) => v === 0);
    onSudokuCellClick(i); enterDigitSudoku(A.solution[i]);
    return i;
  });
  const gridA = await page.evaluate(() => JSON.stringify(AppStateSudoku.grid));
  check("daily: digit entered", (await page.evaluate((i) => AppStateSudoku.grid[i] !== 0, idx)));
  // another puzzle in between
  await page.evaluate(() => { document.getElementById("start-sudoku-game") && document.getElementById("start-sudoku-game").click(); });
  await page.waitForTimeout(500);
  check("normal puzzle differs", (await page.evaluate(() => JSON.stringify(AppStateSudoku.grid))) !== gridA);
  await clickDaily();
  check("daily button brings the entries back", (await page.evaluate(() => JSON.stringify(AppStateSudoku.grid))) === gridA);
  check("is daily again", await page.evaluate(() => AppStateSudoku.isDaily === true));
  // reload while the normal puzzle is shown, then Daily
  await page.evaluate(() => { document.getElementById("start-sudoku-game").click(); });
  await page.waitForTimeout(500);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  await clickDaily();
  check("after reload the daily entries are still there", (await page.evaluate(() => JSON.stringify(AppStateSudoku.grid))) === gridA);
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("sudoku-daily-keep: ALL CHECKS PASS");
})();
