#!/usr/bin/env node
// Task 96: after the game has started, how far down does the board end?
// Fits = the bottom edge of #board-container lies inside the first screen.
// Usage: BASE_URL=... node tests/board-fit.js [--table] [--min 80]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const REDIRECTS = ["numberblocks", "touchingdigits"];
const SIZES = [{ w: 600, h: 800 }, { w: 360, h: 740 }];
const MIN = Number((process.argv.includes("--min") ? process.argv[process.argv.indexOf("--min") + 1] : 0)) || 0;
// Games listed on games.html (the 93 playable games), without redirect pages.
const catalog = fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8");
const slugs = Array.from(new Set(Array.from(catalog.matchAll(/^\s*slug: "([a-z0-9]+)"/gm)).map((m) => m[1])))
  .filter((s) => fs.existsSync(path.join(ROOT, s + ".html")) && fs.existsSync(path.join(ROOT, s + "-rules.html")) && !REDIRECTS.includes(s));

(async () => {
  const browser = await chromium.launch();
  const rows = {};
  for (const size of SIZES) {
    for (const slug of slugs) {
      const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, serviceWorkers: "block" });
      const page = await context.newPage();
      page.on("dialog", (d) => d.accept());
      let bottom = null;
      try {
        await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
        await page.waitForTimeout(1200);
        bottom = await page.evaluate(() => {
          const el = document.getElementById("board-container");
          if (!el || el.classList.contains("hidden")) return null;
          return Math.round(el.getBoundingClientRect().bottom + window.scrollY);
        });
      } catch (e) {}
      (rows[slug] = rows[slug] || {})[size.w] = bottom;
      await context.close();
    }
  }
  await browser.close();
  let out = "";
  for (const size of SIZES) {
    const fit = slugs.filter((s) => rows[s][size.w] !== null && rows[s][size.w] <= size.h).length;
    out += "=== BOARD FIT " + size.w + "x" + size.h + ": " + fit + " of " + slugs.length + " boards fit on the first screen ===\n";
  }
  if (process.argv.includes("--table")) {
    console.log("slug | bottom@600x800 | bottom@360x740");
    slugs.forEach((s) => console.log(s + " | " + rows[s][600] + " | " + rows[s][360]));
  }
  console.log(out.trim());
  const fit600 = slugs.filter((s) => rows[s][600] !== null && rows[s][600] <= 800).length;
  process.exit(MIN && fit600 < MIN ? 1 : 0);
})();
