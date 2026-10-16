#!/usr/bin/env node
// Arabic (RTL) spacing check: direct children of the shared button/link rows
// that sit side by side must have a gap of at least 1 px.
// First draft by Ollama (qwen3-coder), corrected by Claude (rects, direct children).
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:8000/";
const PAGES = ["maumau.html", "chess.html", "games.html"];
const SELECTORS = [".site-footer", ".mode-buttons", ".field-row", ".game-select-actions", ".site-nav", ".quick-rules-actions"];

(async () => {
  let pairs = 0;
  let failures = 0;
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    for (const name of PAGES) {
      const page = await context.newPage();
      await page.goto(BASE + name + "?lang=ar", { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
      const result = await page.evaluate((selectors) => {
        const out = { pairs: 0, bad: [] };
        const label = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
        selectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((container) => {
            const kids = Array.from(container.children).filter((el) => {
              const r = el.getBoundingClientRect();
              const st = getComputedStyle(el);
              return r.width > 0 && r.height > 0 && st.display !== "none" && st.visibility !== "hidden";
            });
            for (let i = 0; i < kids.length; i++) {
              for (let j = i + 1; j < kids.length; j++) {
                const a = kids[i].getBoundingClientRect();
                const b = kids[j].getBoundingClientRect();
                const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                if (overlap <= Math.min(a.height, b.height) / 2) continue; // not in the same row
                out.pairs++;
                const gap = Math.max(a.left, b.left) - Math.min(a.right, b.right);
                if (gap < 1) out.bad.push(selector + ": " + label(kids[i]) + " | " + label(kids[j]) + " gap " + gap.toFixed(1));
              }
            }
          });
        });
        return out;
      }, SELECTORS);
      pairs += result.pairs;
      failures += result.bad.length;
      result.bad.forEach((line) => console.log("FAIL " + name + " " + line));
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log("=== RTL SPACING: " + pairs + " pairs checked, " + failures + " failure(s) ===");
  process.exit(failures ? 1 : 0);
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
