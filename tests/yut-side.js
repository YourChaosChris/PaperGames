#!/usr/bin/env node
// Yut (task 197, report from a player): "I say I am B and the game gives me A".
// The side chosen in the menu is kept, also with the shared "Random start"
// setting switched on.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "yut.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate(() => RandomStart.setEnabled(true));
  if (!(await page.isVisible("#start-yut-game"))) await page.click("#menu-toggle");
  for (let i = 0; i < 12; i++) {
    await page.selectOption("#yut-side", "1");
    await page.selectOption("#yut-first", "me");
    await page.click("#start-yut-game");
    await page.waitForTimeout(150);
    const h = await page.evaluate(() => AppStateYut.human);
    if (h !== 1) { fails.push("side B became " + h + " in round " + i); break; }
    await page.click("#menu-toggle");
  }
  if (errors.length) fails.push("page error " + errors.join("|"));
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("yut-side: ALL CHECKS PASS");
})();
