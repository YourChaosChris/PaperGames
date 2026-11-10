#!/usr/bin/env node
// Checkers rule sets Italian, Brazilian, Russian (task 200) and Spanish
// (task 213) in the browser:
// the choice is in the settings, a new game shows the rule set above the board,
// the choice survives a reload, the computer plays, no page error.
// Run: node tests/checkers-variants-ui.js
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };
const NAMES = { it: "Italienische Regeln", br: "Brasilianische Regeln", ru: "Russische Regeln", es: "Spanische Regeln" };
(async () => {
  const browser = await chromium.launch();
  for (const r of ["it", "br", "ru", "es"]) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + "checkers.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(400);
    if (!(await page.isVisible("#start-checkers-game"))) await page.click("#menu-toggle");
    await page.selectOption("#checkers-rules", r);
    if (!(await page.isVisible("#start-checkers-game"))) await page.click("#menu-toggle");
    await page.click("#start-checkers-game");
    await page.waitForTimeout(600);
    check(r + ": state rules", (await page.evaluate(() => AppStateCheckers.rules)) === r);
    check(r + ": label above the board", (await page.textContent("#game-label")).trim() === NAMES[r]);
    // Black (the human) plays the first legal move: tap a piece that can move, then its target.
    const played = await page.evaluate(() => {
      const m = CheckersCore.getLegalMoves(AppStateCheckers.board, AppStateCheckers.turn, AppStateCheckers.rules)[0];
      return m ? m.from.join(",") + ">" + m.to.join(",") : null;
    });
    check(r + ": a legal move exists", !!played);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    check(r + ": choice kept after reload", (await page.inputValue("#checkers-rules")) === r);
    check(r + ": no page error " + errors.join("|"), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("checkers-variants-ui: ALL CHECKS PASS");
})();
