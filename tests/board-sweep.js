#!/usr/bin/env node
// board-sweep.js
// Loads every game's play page, starts a game the same way a player
// would, and checks: no JS errors, a board element actually rendered,
// no horizontal overflow, the board doesn't extend past the viewport,
// and no visible text is rendered smaller than 9px - all at the Tolino
// Vision 6's viewport, the smallest real device this app targets.
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

  let result = { slug, errors };
  try {
    await page.goto(BASE_URL + slug + ".html", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(150);
    const startMethod = await tryStart(page);
    await page.waitForTimeout(300);

    const info = await page.evaluate((slug) => {
      const html = document.documentElement;
      const overflowX = html.scrollWidth - html.clientWidth;
      const candidates = [
        document.getElementById(slug + "-board"),
        document.querySelector("[id$='-board']"),
        document.getElementById("board-container"),
      ].filter(Boolean);
      const boardEl = candidates[0];
      const boardRect = boardEl ? boardEl.getBoundingClientRect() : null;

      let minFontPx = Infinity;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.children.length > 0) continue;
        const text = (node.textContent || "").trim();
        if (!text) continue;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const fs = parseFloat(getComputedStyle(node).fontSize);
        if (fs && fs < minFontPx) minFontPx = fs;
      }
      if (minFontPx === Infinity) minFontPx = null;

      return {
        overflowX,
        boardFound: !!boardEl,
        boardId: boardEl ? boardEl.id : null,
        boardW: boardRect ? boardRect.width : null,
        boardH: boardRect ? boardRect.height : null,
        boardRight: boardRect ? boardRect.right : null,
        minFontPx,
      };
    }, slug);

    result = { slug, startMethod, ...info, errors };
  } catch (e) {
    result.errors.push("navigation/eval error: " + String(e));
  }

  await page.close();
  return result;
}

(async () => {
  const games = getGameSlugs();
  const browser = await chromium.launch();
  const results = await runWithConcurrency(games, 5, (slug) => checkGame(browser, slug));
  await browser.close();

  let issues = 0;
  for (const r of results) {
    const problems = [];
    if (r.errors && r.errors.length) problems.push("JS errors: " + r.errors.join(" | ").slice(0, 200));
    if (!r.boardFound) problems.push("no board element found");
    if (r.overflowX && r.overflowX > 2) problems.push(`horizontal overflow ${r.overflowX}px`);
    if (r.boardRight && r.boardRight > VIEWPORT.width + 2) problems.push(`board extends past viewport (right=${Math.round(r.boardRight)})`);
    if (r.minFontPx !== null && r.minFontPx < 9) problems.push(`tiny font ${r.minFontPx}px`);
    if (problems.length) {
      issues++;
      console.log(`ISSUE ${r.slug}: ${problems.join("; ")}`);
    } else {
      console.log(`OK ${r.slug} [start=${r.startMethod}] board=${r.boardId} ${Math.round(r.boardW)}x${Math.round(r.boardH)} minFont=${r.minFontPx}`);
    }
  }
  console.log(`\n=== BOARD SWEEP COMPLETE: ${results.length} games, ${issues} with issues ===`);
  process.exit(issues === 0 ? 0 : 1);
})();
