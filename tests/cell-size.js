#!/usr/bin/env node
// Task 97: smallest cell / hit area of a started game at 360 px width.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const MIN = 28;
// Large-board mode is the way to reach 28 px on these boards at 360 px
// (Fanorona, Hex and Matchstick Puzzles since task 125).
const GAMES = { marblepush: "Marble Brink", hashi: "Hashi", gomoku: "Gomoku", sternhalma: "Sternhalma", ludo: "Ludo", fanorona: "Fanorona", hex: "Hex", matches: "Matchstick Puzzles" };
(async () => {
  const browser = await chromium.launch();
  const bad = [];
  for (const slug of Object.keys(GAMES)) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("dialog", (d) => d.accept());
    await page.addInitScript((k) => localStorage.setItem(k, "1"), "papergames_big_board_" + slug);
    await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const root = document.getElementById("board-container");
      const cells = Array.from(root.querySelectorAll(".marblepush-cell, .hashi-island, .gomoku-point, .sternhalma-cell, .ludo-cell, .fanorona-point, .hex-cell, .mt-slot")).filter((el) => el.getBoundingClientRect().width > 3);
      const sizes = cells.map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); });
      const toggle = document.querySelector(".big-board-toggle");
      return { n: sizes.length, min: sizes.length ? Math.round(Math.min.apply(null, sizes)) : 0, overflow: document.documentElement.scrollWidth - innerWidth, toggle: !!(toggle && toggle.offsetParent) };
    });
    console.log(slug + ": " + r.n + " cells, smallest " + r.min + " px, page overflow " + r.overflow);
    if (r.min < MIN || r.overflow > 0 || !r.toggle) bad.push(slug);
    await context.close();
  }
  // The games of task 118 need no large view: their biggest setting must
  // reach the size at 360 px as it is.
  const PLAIN = {
    slidepuzzle: { setup: () => { document.getElementById("sp-size").value = "5"; startSP(); }, sel: ".sp-tile" },
    hanoi: { setup: () => { document.getElementById("hanoi-discs").value = "8"; startHanoi(); }, sel: ".hanoi-rod" },
    nim: { setup: () => { document.getElementById("nim-heaps").value = "classic"; startNim(); }, sel: ".nim-stone" }
  };
  for (const slug of Object.keys(PLAIN)) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await page.evaluate(PLAIN[slug].setup);
    await page.waitForTimeout(300);
    const r = await page.evaluate((sel) => {
      const sizes = Array.from(document.querySelectorAll(sel)).map((el) => { const b = el.getBoundingClientRect(); return Math.min(b.width, b.height); });
      return { n: sizes.length, min: sizes.length ? Math.round(Math.min.apply(null, sizes)) : 0, overflow: document.documentElement.scrollWidth - innerWidth };
    }, PLAIN[slug].sel);
    console.log(slug + ": " + r.n + " cells, smallest " + r.min + " px, page overflow " + r.overflow);
    if (r.min < MIN || r.overflow > 0) bad.push(slug);
    await context.close();
  }
  await browser.close();
  console.log("=== CELL SIZE: " + (Object.keys(GAMES).length + Object.keys(PLAIN).length) + " games, " + bad.length + " failure(s) ===");
  process.exit(bad.length ? 1 : 0);
})();
