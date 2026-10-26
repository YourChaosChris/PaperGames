#!/usr/bin/env node
// Focused browser checks for the motif and mode dependent quick rules.
const assert = require("assert");
const { chromium } = require("playwright");
const { BASE_URL } = require("./lib");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage({ viewport: { width: 600, height: 800 } });
  try {
    await page.goto(BASE_URL + "cake.html?lang=de", { waitUntil: "networkidle" });
    const cakeChecks = [
      ["animals", "kuchen", null],
      ["cats", "fisch", "kuchen"],
      ["bears", "kekse", "kuchen"],
      ["dogs", "ball", "kuchen"],
      ["magpies", "schlüssel", "kuchen"],
      ["family", "kuchen", "tier"],
      ["treasure", "schatz", "kuchen"]
    ];
    // The settings sit behind the menu button.
    if (!(await page.isVisible("#cake-motif"))) await page.click("#menu-toggle");
    for (const [motif, thing, forbidden] of cakeChecks) {
      await page.locator("#cake-motif").selectOption(motif);
      const text = (await page.locator("#quick-rules").innerText()).toLowerCase();
      assert(text.includes(thing), motif + " quick rules omit " + thing + ": " + text);
      if (forbidden) assert(!text.includes(forbidden), motif + " quick rules still say " + forbidden + ": " + text);
      if (motif === "family" || motif === "treasure") assert(!text.includes("tier"), motif + " quick rules still say Tier: " + text);
    }
    await page.locator("#rules-link-button").click();
    assert((await page.locator("#quick-rules").innerText()).toLowerCase().includes("schatz"));
    for (const width of [600, 360]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert(!overflow, "cake page has horizontal overflow at " + width + "px");
    }
    await page.goto(BASE_URL + "games.html?lang=de", { waitUntil: "networkidle" });
    await page.locator("#games-search").fill("Kuchen");
    const homeText = (await page.locator('[data-slug="cake"] .game-select-desc').innerText()).toLowerCase();
    assert(homeText.includes("schatz") && !homeText.includes("kuchen") && !homeText.includes("tier"), homeText);

    await page.goto(BASE_URL + "differences.html?lang=de", { waitUntil: "networkidle" });
    if (!(await page.isVisible("#df-mode"))) await page.click("#menu-toggle");
    await page.locator("#df-mode").selectOption("search");
    const searchRules = (await page.locator("#quick-rules").innerText()).toLowerCase();
    assert(!searchRules.includes("die beiden bilder unterscheiden sich"), searchRules);
    assert(searchRules.includes("tipp"), searchRules);
    assert(searchRules.includes("zeitbegrenzung"), searchRules);
    assert(searchRules.includes("raumbild"), searchRules);
    await page.locator("#df-mode").selectOption("diff");
    assert((await page.locator("#quick-rules").innerText()).toLowerCase().includes("die beiden bilder unterscheiden sich"));
    for (const width of [600, 360]) {
      await page.setViewportSize({ width, height: 800 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert(!overflow, "differences page has horizontal overflow at " + width + "px");
    }
    console.log("=== QUICK RULES PLAYWRIGHT: 7 cake motifs, both differences modes, and 600/360 px layout pass ===");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
