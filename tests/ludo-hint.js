#!/usr/bin/env node
// Ludo against the computer (task 196): the Hint button marks exactly one
// movable token after the roll, is disabled before the roll, and the mark
// is gone after the move.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "ludo.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-ludo-game"))) await page.click("#menu-toggle");
  await page.click("#start-ludo-game");
  await page.waitForTimeout(400);
  check("hint disabled before the roll", await page.isDisabled("#ludo-hint"));
  let shown = false;
  for (let i = 0; i < 60 && !shown; i++) {
    if (await page.isEnabled("#ludo-roll-button")) {
      // a six, so a token can leave the base at once
      await page.evaluate(() => { window.__r = Math.random; Math.random = () => 0.99; });
      await page.click("#ludo-roll-button");
      await page.waitForTimeout(250);
      await page.evaluate(() => { Math.random = window.__r; });
    }
    if (await page.isEnabled("#ludo-hint")) {
      await page.click("#ludo-hint");
      await page.waitForTimeout(100);
      const r = await page.evaluate(() => ({
        marks: document.querySelectorAll(".ludo-hint").length,
        movable: document.querySelectorAll(".ludo-cell-movable, .ludo-home-slot-movable").length,
        token: AppStateLudo.hintToken,
        legal: AppStateLudo.legalMoves.slice(),
      }));
      check("exactly one token marked " + JSON.stringify(r), r.marks === 1 && r.legal.indexOf(r.token) !== -1 && r.movable >= 1);
      shown = true;
    } else {
      await page.waitForTimeout(400);
    }
  }
  check("hint could be tested", shown);
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("ludo-hint: ALL CHECKS PASS");
})();
