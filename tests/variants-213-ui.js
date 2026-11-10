#!/usr/bin/env node
// Task 213 in the browser: Mancala "Oware" and Twelve Men's Morris are chosen
// in the settings, a new game uses them and names them above the board, the
// computer answers with a legal move, the choice survives a reload, no page
// error. (Spanish draughts: tests/checkers-variants-ui.js.)
// Run: node tests/variants-213-ui.js
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

async function openMenu(page, sel) {
  if (!(await page.isVisible(sel))) await page.click("#menu-toggle");
}

(async () => {
  const browser = await chromium.launch();
  const newPage = async () => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // "Start a new game? Your current game will be lost" (confirm-actions.js): yes.
    page.on("dialog", (d) => d.accept());
    return { ctx, page, errors };
  };

  // Mancala: Oware against the computer.
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(BASE + "mancala.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(400);
    await openMenu(page, "#mancala-rules");
    await page.selectOption("#mancala-rules", "oware");
    await page.click("#mode-offline-ai");
    await page.click("input[name='mancala-side'][value='a']");
    await page.click("#start-mancala-game");
    await page.waitForTimeout(500);
    check("mancala: state is Oware", await page.evaluate(() => MancalaCore.isOware(AppStateMancala.state)));
    check("mancala: label above the board", (await page.textContent("#game-label")).trim() === "Oware (Westafrika)");
    const human = await page.evaluate(() => AppStateMancala.humanSide);
    if (human === "a") {
      // Play the first legal pit, then wait for the computer.
      const pit = await page.evaluate(() => MancalaCore.getLegalMoves(AppStateMancala.state, AppStateMancala.turn)[0]);
      await page.evaluate((p) => applyMancalaMove(p), pit);
    }
    await page.waitForFunction(() => AppStateMancala.turn === AppStateMancala.humanSide || AppStateMancala.gameOver, null, { timeout: 15000 }).catch(() => {});
    const seeds = await page.evaluate(() => AppStateMancala.state.board.reduce((a, b) => a + b, 0));
    check("mancala: 48 seeds after the computer's move (" + seeds + ")", seeds === 48);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    check("mancala: Oware kept after reload", await page.evaluate(() => MancalaCore.isOware(AppStateMancala.state)) &&
      (await page.inputValue("#mancala-rules")) === "oware");
    check("mancala: no page error " + errors.join("|"), errors.length === 0);
    await ctx.close();
  }

  // Morris: Twelve Men's Morris, two players and against the computer.
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(BASE + "morris.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(400);
    await openMenu(page, "#morris-variant");
    await page.selectOption("#morris-variant", "twelve");
    await page.click("#mode-offline");
    await page.waitForTimeout(400);
    check("morris: state is Twelve", await page.evaluate(() => MorrisCore.isTwelve(AppStateMorris.state) && AppStateMorris.state.toPlace.b === 12));
    check("morris: label above the board", (await page.textContent("#game-label")).trim() === "Zwölfermühle (12 Steine, Diagonalen)");
    check("morris: four diagonals drawn (8 segments)", (await page.locator(".morris-line-d").count()) === 8);
    await openMenu(page, "#morris-variant");
    await page.click("#mode-offline-ai");
    await page.click("#start-morris-game");
    await page.waitForTimeout(400);
    // Wait for the human's turn (the computer may begin), place a piece, then the computer answers.
    const humanTurn = () => page.waitForFunction(() => AppStateMorris.turn === AppStateMorris.humanColor, null, { timeout: 15000 }).catch(() => {});
    await humanTurn();
    const before = await page.evaluate(() => AppStateMorris.state.board.filter(Boolean).length);
    await page.evaluate(() => applyMorrisMove(MorrisCore.getLegalMoves(AppStateMorris.state, AppStateMorris.turn)[0]));
    await humanTurn();
    const placed = await page.evaluate(() => AppStateMorris.state.board.filter(Boolean).length);
    check("morris: the computer answered with a placement (" + before + " -> " + placed + ")", placed === before + 2 &&
      (await page.evaluate(() => AppStateMorris.state.toPlace.b + AppStateMorris.state.toPlace.w)) === 24 - placed);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    check("morris: Twelve kept after reload", await page.evaluate(() => MorrisCore.isTwelve(AppStateMorris.state)) &&
      (await page.inputValue("#morris-variant")) === "twelve" && (await page.locator(".morris-line-d").count()) === 8);
    check("morris: no page error " + errors.join("|"), errors.length === 0);
    await ctx.close();
  }

  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("variants-213-ui: ALL CHECKS PASS");
})();
