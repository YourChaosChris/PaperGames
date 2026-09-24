#!/usr/bin/env node
// interaction-sweep.js
// Loads every game, starts it, and clicks a couple of plausible
// interactive targets (a board square/cell/button) - simulating "make
// one move" generically across very different board UIs - checking
// only that nothing throws. Complements board-sweep.js, which checks
// layout at load time but never actually interacts with a board.
//
// Requires a local server serving the repo root (see README.md) and
// Playwright with a Chromium browser available.

const { chromium } = require("playwright");
const { VIEWPORT, BASE_URL, getGameSlugs, tryStart, runWithConcurrency } = require("./lib");

async function checkGame(browser, slug) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push("console.error: " + msg.text()); });

  try {
    await page.goto(BASE_URL + slug + ".html", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(150);
    await tryStart(page);
    await page.waitForTimeout(250);

    const selectors = [
      "#board-container button:not([disabled])",
      "[id$='-board'] button:not([disabled])",
      "[id$='-board'] .square:not([disabled])",
      "[id$='-board'] [role='button']",
    ];
    // Click twice: a second click covers select-then-move games where
    // the first click was only a "select" step needing a follow-up.
    for (let attempt = 0; attempt < 2; attempt++) {
      for (const sel of selectors) {
        const el = await page.$(sel);
        if (el && await el.isVisible().catch(() => false)) {
          await el.click({ timeout: 2000 }).catch(() => {});
          await page.waitForTimeout(200);
          break;
        }
      }
    }
  } catch (e) {
    errors.push("flow error: " + String(e));
  }

  await page.close();
  return { slug, errors };
}

(async () => {
  const games = getGameSlugs();
  const browser = await chromium.launch();
  const results = await runWithConcurrency(games, 5, (slug) => checkGame(browser, slug));
  await browser.close();

  let issues = 0;
  for (const r of results) {
    if (r.errors.length) {
      issues++;
      console.log(`ISSUE ${r.slug}: ${r.errors.join(" | ").slice(0, 300)}`);
    } else {
      console.log(`OK ${r.slug}`);
    }
  }
  console.log(`\n=== INTERACTION SWEEP: ${results.length} games, ${issues} with errors ===`);
  process.exit(issues === 0 ? 0 : 1);
})();
