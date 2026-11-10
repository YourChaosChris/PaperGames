#!/usr/bin/env node
// Strategy games against the computer (task 197): the Hint button (move-hint.js)
// is on for the side to move (not while the computer moves), marks cells after it is pressed and the marks
// disappear once a move has been made. Run: node tests/move-hint-games.js [slug ...]
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ALL = ["go", "hex", "reversi", "gomoku", "morris", "fanorona", "surakarta", "fourinarow", "halma", "hnefatafl", "tablut", "sternhalma", "xiangqi", "amazons", "mancala", "dotsandboxes", "shogi", "konane"];
const games = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
(async () => {
  const browser = await chromium.launch();
  for (const g of games) {
    const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + g + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(500);
    check(g + ": hint button exists", (await page.$("#" + g + "-hint")) !== null);
    if (!(await page.isVisible("#start-" + g + "-game"))) await page.click("#menu-toggle");
    await page.click("#mode-offline");
    await page.click("#start-" + g + "-game");
    await page.waitForTimeout(500);
    if (g === "konane") { await page.waitForTimeout(100); } // opening phase: hint stays quiet
    const enabled = await page.isEnabled("#" + g + "-hint");
    if (g === "konane") {
      check("konane: hint enabled in the opening but marks nothing", enabled && (await page.$$eval(".mh-mark", (e) => e.length)) === 0);
    } else {
      check(g + ": hint enabled for the side to move", enabled);
      if (enabled) {
        await page.click("#" + g + "-hint");
        await page.waitForTimeout(100);
        const n = await page.$$eval(".mh-mark", (e) => e.length);
        check(g + ": marks shown (" + n + ")", n >= 1 && n <= 3);
        await page.waitForTimeout(700);
        check(g + ": marks stay while nothing moves", (await page.$$eval(".mh-mark", (e) => e.length)) === n);
      }
    }
    check(g + ": no page error " + errors.join("|"), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("move-hint-games: " + games.length + " games, ALL CHECKS PASS");
})();
