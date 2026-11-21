#!/usr/bin/env node
// Poch in the browser (task 227), German page at 360 x 640.
// The board of nine pools, the face-up pay card, your cards, the log in German,
// check/call/raise/fold buttons, a fixed lead position (the chain of next higher
// cards), Next hand, the saved game after a reload, Hint (a legal move is marked),
// a whole game against the computers on each level up to the result; buttons and
// cards at least 44 px, no sideways scroll with the longest hand (2 players), no
// page error, no key names in the page.
const { chromium } = require("playwright");
const PochCore = require("../poch-core.js");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "poch.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const text = (sel) => page.evaluate((s) => document.querySelector(s).textContent, sel);
  const S = () => page.evaluate(() => AppStatePoch.state);
  const start = async (computers, level) => {
    if (!(await page.isVisible("#start-poch-game"))) await page.click("#menu-toggle");
    await page.selectOption("#poch-computers", String(computers));
    await page.selectOption("#poch-level", String(level));
    await page.click("#start-poch-game");
    await page.waitForTimeout(300);
  };

  // Start with one computer: you hold 16 cards, the longest hand.
  await start(1, 2);
  check("board with nine pools", (await page.$$eval("#poch-board .poch-cell", (e) => e.length)) === 9);
  check("pay card shown", (await page.$$eval("#poch-paycard .pc-card", (e) => e.length)) === 1);
  let s = await S();
  check("two players, 15 or 16 cards each", s.n === 2 && s.hands[0].length >= 15 && s.hands[0].length <= 16);
  check("your cards are shown", (await page.$$eval("#poch-hand .pc-card", (e) => e.length)) === s.hands[0].length);
  check("meta in German " + await text("#game-meta"), /Runde 1 von 6/.test(await text("#game-meta")));
  const logText = await text("#poch-log");
  check("log in German " + logText.slice(0, 80), /Runde 1 von 6, Geber:/.test(logText) && /Mulde/.test(logText) && !/ wins | win /.test(logText));
  check("no sideways scroll with 16 cards", await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  // 44 px: hand cards and buttons
  await page.waitForTimeout(300);
  const small = await page.evaluate(() => Array.from(document.querySelectorAll("#poch-hand .pc-card, #poch-actions button, #poch-next-row button")).filter((e) => e.offsetParent !== null).filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length);
  check("cards and buttons at least 44 px", small === 0);

  // A fixed position: you lead the 8 of clubs; the chain 8, 9, 10 follows, then the Jack is missing.
  await page.evaluate(() => {
    const c = (rank, suit) => ({ rank, suit });
    const st = PochCore.clone(AppStatePoch.state);
    st.hands = [[c(8, "C"), c(1, "S"), c(7, "H")], [c(9, "C"), c(11, "D"), c(12, "D")], [c(10, "C"), c(7, "D")]];
    st.n = 3; st.chips = [30, 30, 30];
    st.payCard = c(13, "H"); st.paySuit = "H"; st.combos = [null, null, null];
    st.phase = "lead"; st.turn = 0; st.bet = null; st.played = []; st.log = []; st.revealed = [];
    st.pools = {}; PochCore.POOLS.forEach((k) => { st.pools[k] = 0; }); st.pools.centre = 6;
    AppStatePoch.state = st; AppStatePoch.gameOver = false; AppStatePoch.busy = false;
    renderPoch();
  });
  check("status asks you to lead " + await text("#board-info"), /Du bist dran/.test(await text("#board-info")) && /Karte/.test(await text("#board-info")));
  check("cards enabled on your lead", await page.evaluate(() => Array.from(document.querySelectorAll("#poch-hand .pc-card")).every((b) => !b.disabled)));
  check("bet buttons hidden", await page.evaluate(() => document.getElementById("poch-actions").classList.contains("hidden")));
  await page.click("#poch-hand > :nth-child(1)");
  await page.waitForTimeout(400);
  s = await S();
  check("the chain was played " + JSON.stringify(s.played), s.played.map((c) => c.rank + c.suit).join() === "8C,9C,10C");
  const log = await text("#poch-log");
  check("chain in the log " + log, /8♣/.test(log) && /9♣/.test(log) && /10♣/.test(log) && /Niemand/.test(log));

  // A whole game of reloads: save and load mid-game
  await start(2, 2);
  await page.waitForTimeout(600);
  const before = await S();
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  const after = await S();
  check("game back after a reload", !!after && after.handNo === before.handNo && JSON.stringify(after.chips) === JSON.stringify(before.chips) && JSON.stringify(after.hands[0]) === JSON.stringify(before.hands[0]));
  check("board visible after reload", await page.evaluate(() => !document.getElementById("board-container").classList.contains("hidden")));

  // Hint
  await page.waitForSelector("#poch-hint:not([disabled])", { timeout: 8000 }).catch(() => {});
  if (await page.isEnabled("#poch-hint")) {
    await page.click("#poch-hint");
    await page.waitForTimeout(100);
    const marks = await page.$$eval(".mh-mark", (e) => e.length);
    check("hint marks one thing (" + marks + ")", marks === 1);
    const legal = await page.evaluate(() => PochCore.isLegalMove(AppStatePoch.state, MoveHint.last().move));
    check("the hinted move is legal", legal);
  } else {
    check("hint enabled on your turn", false);
  }

  // Whole games against the computers on each level, three computers on Hard
  // The computers answer at once in the whole games (their pause is tested by the other pages).
  await page.evaluate(() => { AiPacing.delay = () => 15; });
  for (const [comp, level] of [[1, 1], [2, 2], [3, 3]]) {
    await start(comp, level);
    let guard = 0;
    const t0 = Date.now();
    for (;;) {
      if (Date.now() - t0 > 90000) { check("level " + level + ": game ends", false); break; }
      guard++;
      const st = await S();
      if (!st || st.phase === "over") break;
      if (st.phase === "handend") { await page.click("#poch-next"); await page.waitForTimeout(30); continue; }
      if (st.turn === 0) {
        if (st.phase === "pochen") {
          const sel = (guard % 3 === 0 && !(await page.isDisabled("#poch-raise"))) ? "#poch-raise" : "#poch-call";
          await page.click(sel);
        } else {
          await page.click("#poch-hand > :nth-child(" + (1 + (guard % st.hands[0].length)) + ")");
        }
      }
      await page.waitForTimeout(40);
    }
    const end = await S();
    check("level " + level + ": game over", end && end.phase === "over" && end.winners.length >= 1);
    check("level " + level + ": result shown", (await text("#game-result")).length > 10);
    check("level " + level + ": no key names " + (await text("body")).slice(0, 0), !/\b(poch|msg|ui)_[a-z_]+\b/.test(await page.evaluate(() => document.body.innerText)));
    check("level " + level + ": saved game cleared", await page.evaluate(() => !localStorage.getItem("einkchess_save_poch")));
    check("level " + level + ": chips conserved", end.chips.reduce((a, b) => a + b, 0) + PochCore.POOLS.reduce((a, k) => a + end.pools[k], 0) === end.n * PochCore.START_CHIPS);
    if (await page.isVisible("#result-modal button, .result-modal button")) await page.click("#result-modal button, .result-modal button").catch(() => {});
  }

  check("no page error " + errors.join("|"), errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL (" + fails.length + ")"); process.exit(1); }
  console.log("poch-ui: ALL CHECKS PASS");
})();
