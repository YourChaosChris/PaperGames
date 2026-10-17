#!/usr/bin/env node
// Zoo Toss in the browser (task 99t): a person plays against the computer
// at 600 and 360 px. The paw is put on the card by tapping a free place
// (the places are at least 48 px, nothing scrolls sideways); after each
// computer turn a panel shows the card, the dice and the paws with a "Next"
// button, and nothing goes on until it is tapped. A saved game from before
// (no pick field) still loads and never asks for a paw. No page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
}

(async () => {
  const browser = await chromium.launch();
  const stats = { pawTaps: 0, reviews: 0, games: 0, oldTurns: 0 };
  for (const vp of [{ width: 600, height: 800 }, { width: 360, height: 740 }]) {
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(BASE + "zoowurf.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(600);
    await page.click("#direct-new-game-button");
    let sawPawTap = 0, sawReview = 0, guard = 0;
    while (guard++ < 400) {
      const over = await page.evaluate(() => AppStateZW.state && AppStateZW.state.phase === "over");
      if (over) break;
      const review = await page.$("#zw-review:not(.hidden) #zw-next");
      if (review) {
        sawReview++;
        const info = await page.evaluate(() => ({
          play: !document.getElementById("zw-play").classList.contains("hidden"),
          choose: !document.getElementById("zw-choose").classList.contains("hidden"),
          roll: document.getElementById("zw-roll").disabled,
          text: document.getElementById("zw-review").textContent.length,
          dice: document.querySelectorAll("#zw-review .zw-die").length,
          cur: AppStateZW.state.computer[AppStateZW.state.current]
        }));
        check(vp.width + ": while the panel shows, board and roll button are off", !info.play && !info.choose && info.roll && info.text > 20 && info.dice >= 1);
        check(vp.width + ": no sideways scroll with the panel", (await overflow(page)) <= 0);
        await page.click("#zw-next");
        continue;
      }
      const tap = await page.$$("#zw-card button.zw-slot-tap");
      if (tap.length) {
        sawPawTap++;
        const box = await tap[0].boundingBox();
        check(vp.width + ": free place is at least 48 px", box.width >= 48 && box.height >= 48);
        check(vp.width + ": no sideways scroll while a paw waits", (await overflow(page)) <= 0);
        check(vp.width + ": roll button is off while a paw waits", await page.evaluate(() => document.getElementById("zw-roll").disabled));
        await tap[tap.length - 1].click();
        continue;
      }
      const card = await page.$("#zw-choose:not(.hidden) #zw-yard button.zw-open-card-active");
      if (card) { await card.click(); continue; }
      const roll = await page.$("#zw-roll:not([disabled])");
      if (roll) { await roll.click(); continue; }
      await page.waitForTimeout(50);
    }
    check(vp.width + ": the game ended", guard < 400);
    check(vp.width + ": a computer turn was shown", sawReview > 0);
    check(vp.width + ": no sideways scroll at the end", (await overflow(page)) <= 0);
    check(vp.width + ": no page error", errors.length === 0);
    stats.pawTaps += sawPawTap; stats.reviews += sawReview; stats.games++;
    if (errors.length) console.log(errors.slice(0, 3).join("\n"));

    // a saved game from before (no pick field)
    await page.evaluate(() => {
      let s = ZoowurfCore.newGame({ players: 2, computer: [false, true], rng: ZoowurfCore.makeRng(5) });
      GameStorage.save(ZOOWURF_SAVE_KEY, { state: s });
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(600);
    const loaded = await page.evaluate(() => !!AppStateZW.state && AppStateZW.state.pick === undefined);
    check(vp.width + ": an older saved game loads without pick", loaded);
    let g2 = 0, askedPaw = false;
    while (g2++ < 400) {
      const st = await page.evaluate(() => AppStateZW.state && AppStateZW.state.phase);
      if (st === "over") break;
      if (st === "paw" || (await page.$("#zw-card button.zw-slot-tap"))) { askedPaw = true; break; }
      const review = await page.$("#zw-review:not(.hidden) #zw-next");
      if (review) { await review.click(); stats.oldTurns++; continue; }
      const card2 = await page.$("#zw-choose:not(.hidden) #zw-yard button.zw-open-card-active");
      if (card2) { await card2.click(); continue; }
      const roll = await page.$("#zw-roll:not([disabled])");
      if (roll) { await roll.click(); continue; }
      await page.waitForTimeout(50);
    }
    check(vp.width + ": the older game never asks for a paw", !askedPaw);
    check(vp.width + ": the older game is played to the end", g2 < 400);
    await ctx.close();
  }
  await browser.close();
  console.log("paw taps " + stats.pawTaps + ", computer panels " + stats.reviews + ", older-game turns " + stats.oldTurns);
  if (!stats.pawTaps) fails.push("no paw choice came up in two full games");
  if (fails.length) {
    fails.slice(0, 30).forEach((f) => console.log("FAIL " + f));
    console.log("=== ZOOWURF UI: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== ZOOWURF UI: 2 widths, a full game each against the computer, " + stats.pawTaps + " paw taps, " + stats.reviews + " computer panels, older saved game, 0 failures ===");
})();
