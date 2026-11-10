#!/usr/bin/env node
// Task 207: large text (125 % and 150 %) and high contrast work on every
// page, nothing overflows sideways at 360 px with 150 % text and high
// contrast, and the five first boards have a screen-reader summary.
// Run: node tests/a11y-settings.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

const pages = fs.readdirSync(ROOT).filter((f) => /^[a-z0-9]+\.html$/.test(f) && !/^google/.test(f));
const SUMMARY = [["chess", "#board"], ["checkers", "#checkers-board"], ["sudoku", "#sudoku-board"], ["morris", "#morris-board"], ["fourinarow", "#fourinarow-board"]];

(async () => {
  const browser = await chromium.launch();
  const mk = async (width, size, contrast) => {
    const ctx = await browser.newContext({ viewport: { width, height: 740 }, serviceWorkers: "block" });
    await ctx.addInitScript(([s, c]) => {
      try { localStorage.setItem("einkchess_text_size", s); localStorage.setItem("einkchess_high_contrast", c ? "1" : "0"); } catch (e) {}
    }, [size, contrast]);
    return ctx;
  };

  // 1. The steps really are 125 % and 150 % of the normal size.
  for (const [size, factor] of [["large", 1.25], ["xlarge", 1.5]]) {
    const ctx = await mk(600, size, false);
    const page = await ctx.newPage();
    await page.goto(BASE + "about.html?lang=de", { waitUntil: "load" });
    const px = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    check(size + ": root font size " + px + " px is " + factor * 16, Math.abs(px - factor * 16) < 0.5);
    await ctx.close();
  }

  // 2. High contrast: pure black text, thicker borders.
  {
    const ctx = await mk(600, "normal", true);
    const page = await ctx.newPage();
    await page.goto(BASE + "about.html?lang=de", { waitUntil: "load" });
    const r = await page.evaluate(() => ({
      on: document.documentElement.classList.contains("high-contrast"),
      color: getComputedStyle(document.body).color,
      border: getComputedStyle(document.documentElement).getPropertyValue("--border-width").trim()
    }));
    check("high contrast class set", r.on);
    check("high contrast text is black (" + r.color + ")", r.color === "rgb(0, 0, 0)");
    check("high contrast border 3px (" + r.border + ")", r.border === "3px");
    await ctx.close();
  }

  // 3. Settings menu: the three text-size buttons name their size.
  {
    const ctx = await mk(360, "xlarge", true);
    const page = await ctx.newPage();
    await page.goto(BASE + "index.html?lang=de", { waitUntil: "load" });
    await page.click("#settings-menu-button");
    const labels = await page.$$eval("#settings-textsize-group button", (b) => b.map((x) => x.textContent + "|" + x.getAttribute("aria-label")));
    check("text size buttons: " + labels.join(", "), labels.length === 3 && /150 %/.test(labels[2]) && /125 %/.test(labels[1]));
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check("settings menu at 150 %: no overflow (" + ov + ")", ov <= 0);
    await ctx.close();
  }

  // 4. Every page at 360 px, 150 % and high contrast: no sideways scroll.
  let n = 0;
  for (const name of pages) {
    const ctx = await mk(360, "xlarge", true);
    const page = await ctx.newPage();
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + name + "?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(250);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(name + ": horizontal overflow " + ov + " px at 150 %", ov <= 0);
    n++;
    await ctx.close();
  }

  // 5. Board summaries for screen readers, in English and German.
  for (const [slug, sel] of SUMMARY) {
    for (const lang of ["en", "de"]) {
      const ctx = await mk(600, "normal", false);
      const page = await ctx.newPage();
      page.on("dialog", (d) => d.accept());
      await page.goto(BASE + slug + ".html?lang=" + lang, { waitUntil: "load" });
      await page.evaluate(() => { const b = document.querySelector('button[id^="start-"]'); if (b && b.offsetParent) b.click(); });
      await page.waitForTimeout(800);
      const r = await page.evaluate((s) => {
        const board = document.querySelector(s);
        if (!board) return null;
        const id = board.getAttribute("aria-describedby") || "";
        const p = id ? document.getElementById(id.split(" ").pop()) : null;
        return { id, text: p ? p.textContent : "" };
      }, sel);
      check(slug + " " + lang + ": board has a summary", !!(r && r.text && /\d/.test(r.text) && r.text.indexOf("{") === -1 && r.text.indexOf("a11y_") === -1));
      if (slug === "chess" && r) check("chess " + lang + ": summary names the king on e1 (" + r.text.slice(0, 60) + ")", /e1/.test(r.text) && (lang === "en" ? /king/.test(r.text) : /König|king/i.test(r.text)));
      await ctx.close();
    }
  }

  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("=== A11Y SETTINGS: " + n + " pages without overflow at 150 % and high contrast, " + SUMMARY.length + " board summaries ===");
  console.log("a11y-settings: ALL CHECKS PASS");
})();
