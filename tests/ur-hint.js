#!/usr/bin/env node
// Ur against the computer (task 196): after the roll the Hint button marks exactly one
// movable piece (or start tray); disabled before the roll.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "ur.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-ur-game"))) await page.click("#menu-toggle");
  await page.click("#mode-offline-ai");
  await page.click("#start-ur-game");
  await page.waitForTimeout(600);
  check("hint disabled before the roll", await page.isDisabled("#ur-hint"));
  let ok = false;
  for (let i = 0; i < 60 && !ok; i++) {
    if (await page.isEnabled("#ur-roll-button")) {
      await page.click("#ur-roll-button");
      await page.waitForTimeout(250);
    }
    if (await page.isEnabled("#ur-hint")) {
      await page.click("#ur-hint");
      await page.waitForTimeout(100);
      const r = await page.evaluate(() => ({ marks: document.querySelectorAll(".ur-hint").length, movable: AppStateUr.legalMoves.length }));
      check("exactly one mark " + JSON.stringify(r), r.marks === 1 && r.movable > 0);
      ok = true;
    } else await page.waitForTimeout(300);
  }
  check("hint could be tested", ok);
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("ur-hint: ALL CHECKS PASS");
})();
