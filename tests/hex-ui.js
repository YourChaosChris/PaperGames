#!/usr/bin/env node
// Hex in the browser, German page at 360 px. The sides are Black ("r",
// moves first, top to bottom) and White ("b", left to right) since task
// 120; before they were called Red and Blue.
// Swap rule (task 115):
//   - two players: after Black's first stone "Tauschen" is shown; tapping
//     it keeps the black stone, says "Seiten getauscht ..." and the button
//     goes; after a normal second stone it is gone too;
//   - against the computer (you Black): a first stone in the middle makes
//     the computer swap - you now play White and are to move; Undo goes
//     back to the empty board with you as Black;
//   - with the box unticked there is no swap button.
// Colours (task 120): the choice is labelled ("Ich spiele Schwarz (oben
// nach unten, beginnt)" / "Ich spiele Weiß (links nach rechts)"), each at
// least 44 px high, the chosen one framed; the line above the board says
// "Du spielst Schwarz: verbinde oben und unten." and after the computer's
// swap names White; the result names Schwarz or Weiß; no "Rot" or "Blau"
// anywhere on the page.
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
  check("offer text: " + await status(page), (await status(page)).startsWith("Weiß ist am Zug: Setze einen Stein oder tippe auf „Tauschen“"));
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

  // Task 120: black and white, labelled choice, the line above the board.
  await openSettings(page);
  await page.click("#mode-offline-ai");
  const choice = await page.evaluate(() => Array.from(document.querySelectorAll(".hex-color-label")).map((l) => ({ text: l.innerText.trim(), h: Math.round(l.getBoundingClientRect().height), on: l.classList.contains("hex-color-label-on") })));
  check("choice labelled: " + JSON.stringify(choice), choice.length === 2 && choice[0].text === "Ich spiele Schwarz (oben nach unten, beginnt)" && choice[1].text === "Ich spiele Weiß (links nach rechts)");
  check("choice at least 44 px high", choice.every((c) => c.h >= 44));
  await page.check('input[name="hex-color"][value="b"]');
  check("chosen colour framed", await page.evaluate(() => document.querySelectorAll(".hex-color-label")[1].classList.contains("hex-color-label-on") && !document.querySelectorAll(".hex-color-label")[0].classList.contains("hex-color-label-on")));
  await page.check('input[name="hex-color"][value="r"]');
  await page.uncheck("#hex-swap-rule");
  await page.click("#start-hex-game");
  await page.waitForTimeout(300);
  const line = await page.evaluate(() => { const el = document.getElementById("hex-side-line"); const b = el.getBoundingClientRect(); return { text: el.textContent.trim(), visible: b.height > 0 && b.width > 0 }; });
  check("line above the board: " + line.text, line.visible && line.text === "Du spielst Schwarz: verbinde oben und unten.");
  await openSettings(page);
  await page.check("#hex-swap-rule");
  await page.click("#start-hex-game");
  await page.waitForFunction(() => AppStateHex.turn === AppStateHex.humanColor, null, { timeout: 10000 });
  await cell(page, 4, 4).click();
  await page.waitForFunction(() => AppStateHex.state.swapped, null, { timeout: 10000 }).catch(() => {});
  check("after the computer's swap the line names White: " + await page.textContent("#hex-side-line"), (await page.textContent("#hex-side-line")).trim() === "Du spielst Weiß: verbinde links und rechts.");
  // Play to the end: the result sentence names Black or White in one line.
  await page.evaluate(() => {
    let guard = 0;
    while (!AppStateHex.gameOver && guard++ < 200) {
      const m = HexAi.chooseMove(AppStateHex.state, AppStateHex.turn, 1);
      if (!m) break;
      applyHexMove(m);
    }
  });
  await page.waitForTimeout(300);
  const result = await page.textContent("#game-result");
  check("result names Black or White and you in one line: " + result, /^(Schwarz|Weiß) gewinnt durch Verbinden beider Seiten! (Du gewinnst|Der Computer gewinnt)/.test(result.trim()));
  const text = await page.evaluate(() => document.body.innerText + " " + Array.from(document.querySelectorAll("[aria-label]")).map((e) => e.getAttribute("aria-label")).join(" "));
  check("no Rot or Blau anywhere on the page", !/\b(Rot|Blau|rot|blau|roten|blauen)\b/.test(text));
  check("no sideways scrolling", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  check("no page error " + errors.join(" | "), !errors.length);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== HEX UI: swap rule with two players and against the computer, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})();
