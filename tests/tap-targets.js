#!/usr/bin/env node
// Task 97: on every category page (games*.html) at 360 px, tap targets
// (links, buttons) must be at least 44 px high and, for the favourite
// star, 44 x 44 px; links inside running text are exempt. The kids page
// must list every kids game on one page.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const pages = fs.readdirSync(ROOT).filter((f) => /^games(-[a-z]+)?\.html$/.test(f));

(async () => {
  const browser = await chromium.launch();
  const bad = [];
  let checked = 0;
  for (const name of pages) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(BASE + name + "?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const res = await page.evaluate(() => {
      const out = { n: 0, bad: [] };
      document.querySelectorAll("main a, main button").forEach((el) => {
        const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || s.visibility === "hidden" || s.display === "none") return;
        if (el.closest("p, li") && el.tagName === "A" && !el.closest(".game-card, .game-select-actions, .game-card-actions")) return; // running-text link
        out.n++;
        if (r.height < 43.5) out.bad.push((el.id || el.className || el.tagName) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " " + (el.textContent || "").trim().slice(0, 20));
      });
      out.overflow = document.documentElement.scrollWidth - innerWidth;
      return out;
    });
    checked += res.n;
    res.bad.slice(0, 5).forEach((b) => bad.push(name + ": " + b));
    if (res.bad.length > 5) bad.push(name + ": ... and " + (res.bad.length - 5) + " more");
    if (res.overflow > 0) bad.push(name + ": horizontal overflow " + res.overflow);
    await context.close();
  }
  await browser.close();
  bad.forEach((b) => console.log("FAIL " + b));
  console.log("=== TAP TARGETS: " + pages.length + " category pages, " + checked + " targets, " + bad.length + " failure(s) ===");
  process.exit(bad.length ? 1 : 0);
})();
