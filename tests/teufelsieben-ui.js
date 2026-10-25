#!/usr/bin/env node
// Devilish Seven in the browser (task 121), German page at 360 x 640:
// start a game against one computer, turn up a card, stop, the round ends
// with "Nächste Runde", the next round starts, a game near the target ends
// with the result; a Pause makes the player rows buttons to tap; "Karte
// aufdecken" and "Aufhören" are at least 44 px high, cards are big and
// readable; nothing scrolls sideways, no page error, no English left in the
// status line.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  await page.goto(BASE + "teufelsieben.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-ts-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#ts-players", "2");
  await page.selectOption("#ts-computers", "1");
  await page.tap("#start-ts-game");
  const myTurn = () => page.waitForFunction(() => {
    const s = AppStateTS.state;
    return s && (s.phase === "roundover" || s.phase === "over" || (s.phase === "turn" && !s.computer[s.current]) || (s.phase === "target" && !s.computer[s.pending.from]));
  }, null, { timeout: 20000 });
  await myTurn();
  const sizes = await page.evaluate(() => ["ts-draw", "ts-stop"].map((id) => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
  check("buttons at least 44 px " + JSON.stringify(sizes), sizes.every(([w, h]) => w >= 44 && h >= 44));
  const texts = await page.evaluate(() => ({ draw: document.getElementById("ts-draw").textContent.trim(), stop: document.getElementById("ts-stop").textContent.trim(), rows: document.querySelectorAll("#ts-rows .ts-player").length }));
  check("German buttons " + JSON.stringify(texts), texts.draw === "Karte aufdecken" && texts.stop === "Aufhören" && texts.rows === 2);
  // Turn up a card when it is our turn.
  if (await page.evaluate(() => AppStateTS.state.phase === "turn")) {
    const before = await page.evaluate(() => AppStateTS.state.seq);
    await page.tap("#ts-draw");
    await page.waitForTimeout(150);
    check("a card was turned up", await page.evaluate((b) => AppStateTS.state.seq > b, before));
  }
  // Play on: give specials to the computer, stop when we can, until the round ends.
  for (let k = 0; k < 40; k++) {
    await myTurn();
    const ph = await page.evaluate(() => AppStateTS.state.phase);
    if (ph === "roundover" || ph === "over") break;
    if (ph === "target") {
      const n = await page.$$eval("#ts-rows button.ts-player", (b) => b.length);
      check("special card: rows are buttons", n >= 1);
      await page.tap("#ts-rows button.ts-player >> nth=0");
    } else await page.tap("#ts-stop");
    await page.waitForTimeout(100);
  }
  await myTurn();
  const round = await page.evaluate(() => ({ phase: AppStateTS.state.phase, next: !document.getElementById("ts-next").closest(".hidden"), status: document.getElementById("board-info").textContent.trim() }));
  check("round over with Next round " + JSON.stringify(round), round.phase === "over" || (round.phase === "roundover" && round.next && /Runde \d+ ist vorbei/.test(round.status)));
  const shot = await page.evaluate(() => {
    const card = document.querySelector("#ts-rows .ts-card");
    const b = card ? card.getBoundingClientRect() : { width: 0, height: 0 };
    return { w: Math.round(b.width), h: Math.round(b.height), overflow: document.documentElement.scrollWidth - innerWidth };
  });
  check("cards readable " + JSON.stringify(shot), shot.w >= 30 && shot.h >= 40);
  check("no sideways scroll", shot.overflow <= 0);
  if (round.phase === "roundover") {
    await page.tap("#ts-next");
    await page.waitForTimeout(200);
    check("next round starts", await page.evaluate(() => AppStateTS.state.round === 2 && AppStateTS.state.phase !== "roundover"));
  }
  // A Pause for the person: the rows become buttons.
  await page.evaluate(() => {
    const s = AppStateTS.state;
    s.phase = "target"; s.dealQueue = null; s.pending = { card: "pause", from: 0 };
    s.hands.forEach((h) => { h.status = "in"; });
    renderTS();
  });
  const targ = await page.evaluate(() => Array.from(document.querySelectorAll("#ts-rows button.ts-player")).map((b) => Math.round(b.getBoundingClientRect().height)));
  check("Pause: two rows to tap, at least 44 px " + JSON.stringify(targ), targ.length === 2 && targ.every((h) => h >= 44));
  check("Pause hint in German", /Tippe den Spieler an/.test(await page.textContent("#board-info")));
  await page.tap("#ts-rows button.ts-player >> nth=1");
  await page.waitForTimeout(100);
  check("the computer must stop", await page.evaluate(() => AppStateTS.state.hands[1].status === "stop"));
  // Game end: both close to the target, then a new round.
  await page.evaluate(() => {
    let s = TeufelSiebenCore.newGame({ players: 2, computer: [false, true], levels: [2, 2], target: 100 });
    s.totals = [98, 0];
    AppStateTS.state = s; AppStateTS.generation++;
    afterTS();
  });
  for (let k = 0; k < 60; k++) {
    await myTurn();
    const ph = await page.evaluate(() => AppStateTS.state.phase);
    if (ph === "over") break;
    if (ph === "roundover") await page.tap("#ts-next");
    else if (ph === "target") await page.tap("#ts-rows button.ts-player >> nth=0");
    else await page.tap("#ts-stop");
    await page.waitForTimeout(100);
  }
  const end = await page.evaluate(() => ({ phase: AppStateTS.state.phase, result: document.getElementById("game-result").textContent.trim(), save: localStorage.getItem("einkchess_save_teufelsieben") }));
  check("game over with a result " + JSON.stringify(end), end.phase === "over" && /gewinn/.test(end.result));
  check("finished game not saved", !end.save || JSON.parse(end.save) === null || (JSON.parse(end.save).state || {}).phase !== "over");
  // Save and load in the middle of a game.
  await page.evaluate(() => startTS());
  await myTurn();
  const seq = await page.evaluate(() => AppStateTS.state.seq);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  check("game back after reload", await page.evaluate((q) => !!AppStateTS.state && AppStateTS.state.seq >= q, seq));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== DEVILISH SEVEN UI: start, turn up, stop, round end, Pause target, game end, save and load at 360 px, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
