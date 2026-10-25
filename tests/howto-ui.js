#!/usr/bin/env node
// Picture explanation in the browser (task 116) for linkpairs, oldmaid and
// snakesladders, German page at 360 px: on the first visit the panel is
// open with four steps, the first game action hides it, the button opens
// it again; no sideways scrolling and the panel fits on one screen.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const GAMES = [
  { slug: "linkpairs", start: "#start-linkpairs-game", act: async (p) => p.click("#linkpairs-board .linkpairs-cell >> nth=0").catch(() => p.click("#linkpairs-board")) },
  { slug: "oldmaid", start: "#start-oldmaid-game", act: async (p) => { await p.waitForSelector("#oldmaid-from button", { timeout: 10000 }); await p.click("#oldmaid-from button >> nth=0"); } },
  { slug: "snakesladders", start: "#start-sl-game", before: (p) => p.selectOption("#sl-computers", "0"), act: async (p) => { await p.waitForSelector("#sl-roll:not(.hidden)", { timeout: 10000 }); await p.click("#sl-roll"); } },
];
const panelOpen = (p) => p.evaluate(() => { const h = document.getElementById("howto"); return !!h && !h.classList.contains("hidden") && h.offsetHeight > 0; });

(async () => {
  const browser = await chromium.launch();
  for (const g of GAMES) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + g.slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(500);
    if (!(await page.isVisible(g.start))) await page.click("#menu-toggle");
    if (g.before) await g.before(page);
    await page.click(g.start);
    await page.waitForTimeout(400);
    check(g.slug + ": panel open on the first visit", await panelOpen(page));
    const info = await page.evaluate(() => {
      const h = document.getElementById("howto");
      return { steps: h.querySelectorAll(".howto-item").length, pics: h.querySelectorAll(".howto-pics svg").length,
        texts: Array.from(h.querySelectorAll(".howto-text")).map((t) => t.textContent),
        height: h.offsetHeight, wide: document.documentElement.scrollWidth - innerWidth };
    });
    check(g.slug + ": four steps with pictures", info.steps === 4 && info.pics >= 4);
    check(g.slug + ": German texts " + info.texts.join(" / "), info.texts.every((t) => t && !/_howto_/.test(t)));
    check(g.slug + ": panel fits on one screen (" + info.height + " px)", info.height < 740);
    check(g.slug + ": no sideways scrolling", info.wide <= 0);
    await g.act(page);
    await page.waitForTimeout(300);
    check(g.slug + ": first action hides the panel", !(await panelOpen(page)));
    await page.click("#howto-toggle");
    check(g.slug + ": button opens it again", await panelOpen(page));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    check(g.slug + ": stays closed on the next visit", !(await panelOpen(page)));
    check(g.slug + ": no page error " + errors.join(" | "), !errors.length);
    await ctx.close();
  }
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== HOWTO UI: " + GAMES.length + " games, open on the first visit, hidden after the first action, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
