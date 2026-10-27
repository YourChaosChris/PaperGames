#!/usr/bin/env node
// Zoo Toss in the browser (rules 2, task 145): a person plays a whole game
// against the computers at 600 x 800 (2 players) and 360 x 640 (3 players).
// One roll per turn on the own card; the paw is put on the card by tapping
// a free place (at least 48 px); after the person's roll the computers play
// and a panel shows the person's roll first and then each computer turn,
// with a "Next" button (at least 44 px); nothing goes on until it is
// tapped. A card is chosen from the open cards after a full one. Nothing
// scrolls sideways. A running game is saved and loads again; a saved game
// of the first rules (shared card, no rules field) is dropped without an
// error. No page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
}

(async () => {
  const browser = await chromium.launch();
  const stats = { pawTaps: 0, panels: 0, chosen: 0, games: 0, ownFirst: 0 };
  for (const run of [{ width: 600, height: 800, players: "2" }, { width: 360, height: 640, players: "3" }]) {
    const vp = { width: run.width, height: run.height };
    const ctx = await browser.newContext({ viewport: vp, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(BASE + "zoowurf.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(600);
    // the setup sits in the settings panel; set it and start like its button
    await page.evaluate((n) => { document.getElementById("zw-players").value = n; document.getElementById("start-zw-game").click(); }, run.players);
    await page.waitForTimeout(200);
    const first = await page.evaluate(() => ({ rules: AppStateZW.state.rules, n: AppStateZW.state.n, own: AppStateZW.state.plays.every(Boolean), phase: AppStateZW.state.phase }));
    check(run.width + ": a new game of rules 2, everyone has an own card, the person rolls", first.rules === 2 && first.n === Number(run.players) && first.own && first.phase === "roll");
    let guard = 0, savedChecked = false;
    while (guard++ < 600) {
      const over = await page.evaluate(() => AppStateZW.state && AppStateZW.state.phase === "over" && !AppStateZW.review);
      if (over) break;
      const review = await page.$("#zw-review:not(.hidden) #zw-next");
      if (review) {
        stats.panels++;
        const info = await page.evaluate(() => ({
          play: !document.getElementById("zw-play").classList.contains("hidden"),
          choose: !document.getElementById("zw-choose").classList.contains("hidden"),
          roll: document.getElementById("zw-roll").disabled,
          turns: document.querySelectorAll("#zw-review .zw-review-turn").length,
          firstTitle: (document.querySelector("#zw-review .zw-review-title") || {}).textContent || "",
          own: AppStateZW.review.turns.length && !AppStateZW.state.computer[AppStateZW.review.turns[0].player],
          dice: document.querySelectorAll("#zw-review .zw-die").length,
          next: document.getElementById("zw-next").getBoundingClientRect().height
        }));
        check(run.width + ": while the panel shows, board and roll button are off", !info.play && !info.choose && info.roll && info.dice >= 1);
        check(run.width + ": the panel has a turn per player who played", info.turns >= 1 && info.turns <= Number(run.players));
        check(run.width + ": the Next button is at least 44 px", info.next >= 44);
        if (info.own) { stats.ownFirst++; check(run.width + ": the own roll is shown first as 'Dein Wurf'", info.firstTitle === "Dein Wurf"); }
        check(run.width + ": no sideways scroll with the panel", (await overflow(page)) <= 0);
        await page.click("#zw-next");
        continue;
      }
      const tap = await page.$$("#zw-card button.zw-slot-tap");
      if (tap.length) {
        stats.pawTaps++;
        const box = await tap[0].boundingBox();
        check(run.width + ": free place is at least 48 px", box.width >= 48 && box.height >= 48);
        check(run.width + ": no sideways scroll while a paw waits", (await overflow(page)) <= 0);
        check(run.width + ": roll button is off while a paw waits", await page.evaluate(() => document.getElementById("zw-roll").disabled));
        await tap[tap.length - 1].click();
        continue;
      }
      const card = await page.$("#zw-choose:not(.hidden) #zw-yard button.zw-open-card-active");
      if (card) {
        stats.chosen++;
        check(run.width + ": no sideways scroll while choosing", (await overflow(page)) <= 0);
        await card.click();
        const after = await page.evaluate(() => AppStateZW.state.phase);
        check(run.width + ": after choosing, the person rolls for the new card at once", after === "roll");
        continue;
      }
      const roll = await page.$("#zw-roll:not([disabled])");
      if (roll) {
        if (!savedChecked && stats.panels >= 2) {
          // save and load in the middle of the game
          savedChecked = true;
          const before = await page.evaluate(() => JSON.stringify(AppStateZW.state));
          await page.reload({ waitUntil: "load" });
          await page.waitForTimeout(600);
          const after = await page.evaluate(() => JSON.stringify(AppStateZW.state));
          check(run.width + ": a running game loads again unchanged", before === after);
          continue;
        }
        await roll.click();        continue;
      }
      await page.waitForTimeout(50);
    }
    check(run.width + ": the game ended", guard < 600);
    check(run.width + ": a computer panel was shown", stats.panels > 0);
    check(run.width + ": save and load was tried", savedChecked);
    const end = await page.evaluate(() => ({ winners: AppStateZW.state.winners.length, best: Math.max.apply(null, AppStateZW.state.scores), target: AppStateZW.state.target, result: document.getElementById("game-result").textContent.length }));
    check(run.width + ": the game ended with a winner at the target and a result line", end.winners >= 1 && end.best >= end.target && end.result > 0);
    check(run.width + ": no sideways scroll at the end", (await overflow(page)) <= 0);
    stats.games++;

    // a saved game of the first rules: dropped without a word
    await page.evaluate(() => {
      GameStorage.save(ZOOWURF_SAVE_KEY, { state: { game: "zoowurf", n: 2, computer: [false, true], current: 0, target: 4, scores: [1, 0], yard: [[1, 1, 1, 0, 0], [0, 2, 1, 0, 0]], pile: [], phase: "roll", play: { card: [1, 1, 1, 0, 0], need: [1, 0, 1, 0, 0], size: 3 }, rolls: 1, dice: null, winner: null, turns: 3, last: null, seq: 3, pick: true } });
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(600);
    // the page frame may start a fresh game by itself when nothing could be loaded
    const old = await page.evaluate(() => {
      const s = AppStateZW.state;
      const saved = GameStorage.load(ZOOWURF_SAVE_KEY);
      return { fresh: s === null || (s.rules === 2 && s.seq === 0 && s.turns === 0), oldGone: !saved || !!(saved.state && saved.state.rules === 2) };
    });
    check(run.width + ": an old saved game is dropped (nothing of it loaded, storage replaced)", old.fresh && old.oldGone);
    if (!(await page.evaluate(() => !!AppStateZW.state))) await page.click("#direct-new-game-button");
    await page.waitForTimeout(200);
    check(run.width + ": after an old save a new game runs normally", await page.evaluate(() => AppStateZW.state && AppStateZW.state.rules === 2 && AppStateZW.state.phase === "roll"));
    await page.click("#zw-roll");
    await page.waitForTimeout(200);
    check(run.width + ": the new game can be played after an old save", await page.evaluate(() => AppStateZW.state.seq >= 1 || AppStateZW.state.phase === "paw"));
    check(run.width + ": no page error", errors.length === 0);
    if (errors.length) console.log(errors.slice(0, 3).join("\n"));
    await ctx.close();
  }
  await browser.close();
  console.log("paw taps " + stats.pawTaps + ", panels " + stats.panels + " (own roll first " + stats.ownFirst + "), new cards chosen " + stats.chosen);
  if (!stats.pawTaps) fails.push("no paw choice came up in two full games");
  if (!stats.chosen) fails.push("no open card was chosen in two full games");
  if (fails.length) {
    fails.slice(0, 30).forEach((f) => console.log("FAIL " + f));
    console.log("=== ZOOWURF UI: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== ZOOWURF UI: 600 x 800 (2 players) and 360 x 640 (3 players), a full game each, " + stats.pawTaps + " paw taps, " + stats.panels + " panels, " + stats.chosen + " cards chosen, save/load, old save dropped, no sideways scroll, 0 failures ===");
})();
