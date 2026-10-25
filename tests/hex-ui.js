#!/usr/bin/env node
// Hex swap rule in the browser (task 115), German page at 360 px:
//   - two players: after Red's first stone "Tauschen" is shown; tapping it
//     keeps the red stone, says "Seiten getauscht ..." and the button goes;
//     after a normal second stone it is gone too;
//   - against the computer (you Red): a first stone in the middle makes the
//     computer swap - you now play Blue and are to move; Undo goes back to
//     the empty board with you as Red;
//   - with the box unticked there is no swap button.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const cell = (page, r, c) => page.locator('.hex-cell[data-row="' + r + '"][data-col="' + c + '"]');
const swapShown = (page) => page.evaluate(() => !document.getElementById("hex-swap-btn").classList.contains("hidden"));
const status = (page) => page.evaluate(() => document.getElementById("board-info").textContent.trim());

async function openSettings(page) {
  if (!(await page.isVisible("#mode-offline"))) await page.click("#menu-toggle");
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "hex.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);

  // Two players.
  await openSettings(page);
  check("swap rule on by default", await page.isChecked("#hex-swap-rule"));
  await page.click("#mode-offline");
  await cell(page, 0, 0).click();
  check("swap button after the first stone", await swapShown(page));
  check("offer text: " + await status(page), (await status(page)).startsWith("Blau ist am Zug: Setze einen Stein oder tippe auf „Tauschen“"));
  await page.click("#hex-swap-btn");
  const s1 = await page.evaluate(() => ({ swapped: AppStateHex.state.swapped, stone: AppStateHex.state.board[0][0], turn: AppStateHex.turn }));
  check("swapped, stone red, Blue to move", s1.swapped && s1.stone === "r" && s1.turn === "b");
  check("swap text: " + await status(page), (await status(page)).startsWith("Seiten getauscht"));
  check("button gone after the swap", !(await swapShown(page)));
  await page.click("#undo-btn");
  check("undo brings the offer back", await swapShown(page) && !(await page.evaluate(() => AppStateHex.state.swapped)));
  await cell(page, 4, 4).click();
  check("no swap after the second stone", !(await swapShown(page)));

  // Against the computer, you Red, first stone in the middle.
  await openSettings(page);
  await page.click("#mode-offline-ai");
  await page.check('input[name="hex-color"][value="r"]');
  await page.selectOption("#hex-level-inline", "1");
  await page.click("#start-hex-game");
  await page.waitForFunction(() => AppStateHex.turn === AppStateHex.humanColor, null, { timeout: 10000 });
  check("you are Red", await page.evaluate(() => AppStateHex.humanColor === "r"));
  await cell(page, 4, 4).click();
  await page.waitForFunction(() => AppStateHex.state.swapped, null, { timeout: 10000 }).catch(() => {});
  const s2 = await page.evaluate(() => ({ swapped: AppStateHex.state.swapped, human: AppStateHex.humanColor, turn: AppStateHex.turn }));
  check("computer swaps a central first stone", s2.swapped && s2.human === "b" && s2.turn === "b");
  check("computer swap text: " + await status(page), (await status(page)).startsWith("Der Computer tauscht"));
  await page.click("#undo-btn");
  const s3 = await page.evaluate(() => ({ stones: HexCore.stoneCount(AppStateHex.state), human: AppStateHex.humanColor, turn: AppStateHex.turn }));
  check("undo: empty board, you Red to move", s3.stones === 0 && s3.human === "r" && s3.turn === "r");

  // Without the swap rule.
  await openSettings(page);
  await page.uncheck("#hex-swap-rule");
  await page.click("#mode-offline");
  await cell(page, 1, 1).click();
  check("no swap button without the rule", !(await swapShown(page)));

  check("no sideways scrolling", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("no page error " + errors.join(" | "), !errors.length);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== HEX UI: swap rule with two players and against the computer, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
