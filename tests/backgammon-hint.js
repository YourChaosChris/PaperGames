#!/usr/bin/env node
// Backgammon against the computer (task 196): after the roll the Hint button
// selects a checker with a legal move and frames the point it moves to.
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
  await page.goto(BASE + "backgammon.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-backgammon-game"))) await page.click("#menu-toggle");
  await page.click("#mode-offline-ai");
  await page.click("#start-backgammon-game");
  await page.waitForTimeout(600);
  let ok = false;
  for (let i = 0; i < 40 && !ok; i++) {
    if (await page.isEnabled("#backgammon-roll-button")) {
      await page.click("#backgammon-roll-button");
      await page.waitForTimeout(200);
    }
    if (await page.isEnabled("#backgammon-hint")) {
      await page.click("#backgammon-hint");
      await page.waitForTimeout(100);
      const r = await page.evaluate(() => ({
        sel: AppStateBackgammon.selected, hint: AppStateBackgammon.hint,
        marks: document.querySelectorAll(".bg-hint").length,
      }));
      check("hint selects its checker and frames the target " + JSON.stringify(r), r.hint && r.sel === r.hint.from && r.marks === 1);
      ok = true;
    } else await page.waitForTimeout(300);
  }
  check("hint could be tested", ok);
  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("backgammon-hint: ALL CHECKS PASS");
})();
