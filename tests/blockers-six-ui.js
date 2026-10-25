#!/usr/bin/env node
// Blocked Path with 6 players in the browser (task 111), German page at
// 360 x 640 and on a 6-inch e-reader size (600 x 800):
//   - 5 and 6 players can be chosen on the normal board, not on the quick
//     board; choosing 5 or 6 sets "Eine Figur im Ziel";
//   - with 6 players ring and cross can be chosen, with 4 only the old four;
//   - a game with 6 players starts: six player rows, all readable (no text
//     cut off, nothing sideways) and at least 28 px high to tap, the size
//     tests/cell-size.js asks of board cells (the rows were 28 px with 4 players too);
//   - "All tokens in the goal" with 6 players plays with 3 tokens;
//   - the game is saved and is back after a reload with six players.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

async function settings(page) {
  if (!(await page.isVisible("#bl-num-players"))) await page.tap("#menu-toggle");
}

(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 360, height: 640 }, { width: 600, height: 800 }]) {
    const tag = vp.width + " px: ";
    const ctx = await browser.newContext({ viewport: vp, hasTouch: true, isMobile: true, serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + "blockers.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(600);
    await settings(page);
    await page.selectOption("#bl-board-size", "quick");
    check(tag + "5 and 6 disabled on the quick board", await page.evaluate(() => Array.from(document.querySelectorAll("#bl-num-players option")).filter((o) => o.disabled).map((o) => o.value).join(",") === "5,6"));
    await page.selectOption("#bl-board-size", "normal");
    await page.selectOption("#bl-num-players", "4");
    await page.selectOption("#bl-computers", "3");
    check(tag + "4 players: four shapes", (await page.$$eval("#bl-token-0 option", (o) => o.length)) === 4);
    await page.selectOption("#bl-finish", "all");
    await page.selectOption("#bl-num-players", "6");
    check(tag + "6 players: game end set to one token", (await page.inputValue("#bl-finish")) === "one");
    await page.selectOption("#bl-computers", "4");
    check(tag + "6 players: six shapes", (await page.$$eval("#bl-token-0 option", (o) => o.length)) === 6);
    await page.selectOption("#bl-token-1", "5");
    await page.selectOption("#bl-first", "me");
    await page.tap("#start-bl-game");
    await page.waitForFunction(() => AppStateBL.state && AppStateBL.state.numPlayers === 6, null, { timeout: 10000 });
    await page.waitForTimeout(300);
    const rows = await page.evaluate(() => Array.from(document.querySelectorAll("#bl-players .bl-house")).map((r) => {
      const b = r.getBoundingClientRect();
      return { h: Math.round(b.height), w: Math.round(b.width), right: Math.round(b.right), cut: r.scrollWidth > r.clientWidth + 1, text: r.innerText.replace(/\s+/g, " ").trim() };
    }));
    check(tag + "six player rows", rows.length === 6);
    check(tag + "rows at least 28 px high (as tests/cell-size.js): " + rows.map((r) => r.h).join(","), rows.every((r) => r.h >= 28));
    check(tag + "rows not cut off", rows.every((r) => !r.cut && r.right <= vp.width));
    check(tag + "rows name everyone: " + rows.map((r) => r.text).join(" | "), rows.every((r) => /Haus: 5/.test(r.text)));
    const st = await page.evaluate(() => ({ shapes: AppStateBL.state.shapes.slice(), overflow: document.documentElement.scrollWidth - innerWidth }));
    check(tag + "shapes all different " + st.shapes.join(","), new Set(st.shapes).size === 6 && st.shapes[1] === 5);
    check(tag + "no sideways scroll", st.overflow <= 0);
    if (vp.width === 360) console.log("6 players at 360 px: player rows " + rows.map((r) => r.w + "x" + r.h).join(", "));
    // Saved and back.
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(700);
    check(tag + "six-player game back after reload", await page.evaluate(() => AppStateBL.started && AppStateBL.state.numPlayers === 6 && document.querySelectorAll("#bl-players .bl-house").length === 6));
    // "all" with 6 players: 3 tokens.
    await settings(page);
    await page.selectOption("#bl-num-players", "6");
    await page.selectOption("#bl-finish", "all");
    check(tag + "tokens fixed to 3", (await page.inputValue("#bl-tokens")) === "3" && await page.isDisabled("#bl-tokens"));
    await page.tap("#start-bl-game");
    await page.waitForTimeout(400);
    check(tag + "all with 6 players: 3 tokens each", await page.evaluate(() => AppStateBL.state.finish === "all" && AppStateBL.state.tokens.every((t) => t.length === 3)));
    check(tag + "page errors " + errors.join(" | "), errors.length === 0);
    await ctx.close();
  }
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== BLOCKERS SIX PLAYERS UI: choice, shapes, six player rows at 360 and 600 px, save and load, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
