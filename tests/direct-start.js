#!/usr/bin/env node
// Every game page opens directly playable (task 95): on a first visit at
// 360 px the board is visible, no placeholder and no rules box stands in
// the way, and a "New game" control is visible next to the board.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
// Old addresses that only redirect to the renamed page.
const REDIRECTS = ["numberblocks", "touchingdigits"];
const slugs = fs.readdirSync(ROOT).filter((f) => /-rules\.html$/.test(f))
  .map((f) => f.replace(/-rules\.html$/, ""))
  .filter((s) => fs.existsSync(path.join(ROOT, s + ".html")) && !REDIRECTS.includes(s));

(async () => {
  const browser = await chromium.launch();
  const bad = [];
  for (const slug of slugs) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    try {
      await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        const vis = (el) => { if (!el) return false; const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
        const bc = document.getElementById("board-container");
        const newGame = Array.from(document.querySelectorAll("#board-section button, #board-actions button")).some((b) => vis(b) && /start-|new-game|direct-new-game/.test(b.id));
        return {
          board: vis(bc) && Array.from(bc.querySelectorAll("*")).filter(vis).length > 3,
          placeholder: vis(document.getElementById("board-placeholder")),
          rules: vis(document.getElementById("quick-rules")),
          newGame,
          overflow: document.documentElement.scrollWidth - innerWidth
        };
      });
      if (!r.board || r.placeholder || r.rules || !r.newGame || r.overflow > 0) bad.push(slug + " " + JSON.stringify(r));
    } catch (e) {
      bad.push(slug + " " + e.message.slice(0, 80));
    }
    await context.close();
  }
  await browser.close();
  bad.forEach((line) => console.log("FAIL " + line));
  console.log("=== DIRECT START: " + slugs.length + " pages checked, " + bad.length + " failure(s) ===");
  process.exit(bad.length ? 1 : 0);
})();
