#!/usr/bin/env node
// Task 208: Katzenplaetzchen offers all nine animals, each one is drawn on
// the board, named in every language, and the choice is kept over a reload.
// Run: node tests/catplaces-animals.js (needs the server and Playwright)
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ANIMALS = ["cat", "dog", "monkey", "elephant", "horse", "cow", "zebra", "giraffe", "bird"];
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 600, height: 800 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "catplaces.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  const opts = await page.$$eval("#kz-animal option", (o) => o.map((x) => x.value));
  check("nine animals offered: " + opts.join(","), JSON.stringify(opts) === JSON.stringify(ANIMALS));
  for (const a of ANIMALS) {
    // The select sits in the (closed) game menu; choose like a person would.
    await page.evaluate((v) => { const s = document.getElementById("kz-animal"); s.value = v; s.dispatchEvent(new Event("change", { bubbles: true })); }, a);
    await page.waitForTimeout(150);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(400);
    check(a + ": kept after reload", (await page.$eval("#kz-animal", (s) => s.value)) === a);
    const label = await page.$eval("#kz-animal", (s) => s.options[s.selectedIndex].textContent.trim());
    check(a + ": option has a German name (" + label + ")", label && !/kz_|^[a-z]+$/.test(label));
  }
  // Each animal has its own drawing.
  const svgs = await page.evaluate((list) => list.map((a) => {
    try { localStorage.setItem("einkchess_kz_animal", a); } catch (e) {}
    return typeof animalSvgKz === "function" ? animalSvgKz(0, 0, 40) : "";
  }), ANIMALS);
  check("nine different drawings", new Set(svgs.filter((s) => s.length > 20)).size === 9);
  for (const lang of ["en", "fr", "ja", "ar"]) {
    await page.goto(BASE + "catplaces.html?lang=" + lang, { waitUntil: "load" });
    await page.waitForTimeout(300);
    const raw = await page.$$eval("#kz-animal option", (o) => o.filter((x) => /kz_animal_/.test(x.textContent)).length);
    check(lang + ": all animal names translated", raw === 0);
  }
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("=== CATPLACES ANIMALS: 9 animals offered, each kept over a reload, names in 5 languages, 0 failure(s) ===");
})();
