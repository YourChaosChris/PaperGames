#!/usr/bin/env node
// Card games against the computer (task 199): Hint button for Schwimmen, Concan and
// Card Tactics. Run: node tests/card-hint.js
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
(async () => {
  const browser = await chromium.launch();
  for (const g of ["schwimmen", "concan", "cardtactics"]) {
    const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + g + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(500);
    check(g + ": hint button exists", (await page.$("#" + g + "-hint")) !== null);
    if (!(await page.isVisible("#start-" + g + "-game"))) await page.click("#menu-toggle");
    await page.click("#mode-offline-ai");
    await page.click("#start-" + g + "-game");
    await page.waitForTimeout(900);
    await page.waitForSelector("#" + g + "-hint:not([disabled])", { timeout: 8000 }).catch(() => {});
    const enabled = await page.isEnabled("#" + g + "-hint");
    check(g + ": hint enabled for the side to move", enabled);
    if (enabled) {
      await page.click("#" + g + "-hint");
      await page.waitForTimeout(100);
      const n = await page.$$eval(".mh-mark", (e) => e.length);
      check(g + ": marks shown (" + n + ")", n >= 1 && n <= 4);
      await page.waitForTimeout(700);
      check(g + ": marks stay", (await page.$$eval(".mh-mark", (e) => e.length)) === n);
    }
    check(g + ": no page error " + errors.join("|"), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("card-hint: ALL CHECKS PASS");
})();
