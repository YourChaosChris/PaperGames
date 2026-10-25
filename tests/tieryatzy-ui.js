#!/usr/bin/env node
// Animal Yatzy in the browser (task 112), German page at 360 x 740:
//   - a game against the computer starts: five dashed dice, eleven field
//     rows with pictures and names, "Würfeln";
//   - a roll shows five animals; tapping a die keeps it (thick frame,
//     aria-pressed) and it stays at the next roll; the free fields show the
//     possible points; tapping a field writes them down;
//   - the computer's turn is shown in a panel until "Weiter";
//   - the game is saved and is back after a reload;
//   - the whole game to the end (the person's turns played by the same
//     computer rules): result shown, sheet total;
//   - field rows at least 44 px high, no sideways scrolling, no key names
//     in the page, no page error.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "tieryatzy.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-ty-game"))) await page.click("#menu-toggle");
  await page.click("#mode-ai");
  await page.click("#start-ty-game");
  await page.waitForTimeout(300);
  // The computer may not start: the person is player 1.
  const start = await page.evaluate(() => ({ dice: document.querySelectorAll("#ty-dice .ty-die-btn").length, rows: document.querySelectorAll("#ty-sheet .ty-row").length,
    roll: document.getElementById("ty-roll").textContent.trim(), n: AppStateTY.state.n, computer: AppStateTY.state.computer.join(",") }));
  check("start " + JSON.stringify(start), start.dice === 5 && start.rows === 12 && start.roll === "Würfeln" && start.n === 2 && start.computer === "false,true");
  await page.click("#ty-roll");
  await page.waitForTimeout(150);
  const first = await page.evaluate(() => AppStateTY.state.dice.slice());
  check("five animals after the roll", first.every((f) => f >= 0 && f <= 5));
  await page.click("#ty-dice .ty-die-btn >> nth=0");
  await page.waitForTimeout(100);
  check("tapped die kept", await page.evaluate(() => AppStateTY.state.held[0] === true && document.querySelector("#ty-dice .ty-die-btn").getAttribute("aria-pressed") === "true"));
  await page.click("#ty-roll");
  await page.waitForTimeout(150);
  check("kept die stays", await page.evaluate((f) => AppStateTY.state.dice[0] === f && AppStateTY.state.rolls === 2, first[0]));
  const can = await page.evaluate(() => document.querySelectorAll("#ty-sheet .ty-row-can").length);
  check("eleven fields to choose from: " + can, can === 11);
  const pick = await page.evaluate(() => { const o = TierYatzyCore.options(AppStateTY.state); return { field: "luck", pts: o.luck }; });
  const luckRow = await page.$$("#ty-sheet .ty-row");
  await luckRow[10].click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ luck: AppStateTY.state.sheets[0].luck, review: !!AppStateTY.review, panel: !document.getElementById("ty-review").classList.contains("hidden"),
    title: (document.querySelector(".ty-review-title") || {}).textContent || "" }));
  check("points written on the lucky field " + JSON.stringify(after) + " " + JSON.stringify(pick), after.luck === pick.pts);
  check("computer turn shown: " + after.title, after.review && after.panel && /Computer/.test(after.title));
  await page.click("#ty-next");
  await page.waitForTimeout(200);
  check("after Weiter: your turn again", await page.evaluate(() => !AppStateTY.review && AppStateTY.state.current === 0 && AppStateTY.state.turns === 2));
  // Saved and back.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
  check("game back after reload", await page.evaluate(() => !!AppStateTY.state && AppStateTY.state.turns === 2 && AppStateTY.state.sheets[0].luck !== null));
  const layout = await page.evaluate(() => ({
    rows: Array.from(document.querySelectorAll("#ty-sheet .ty-row")).map((r) => Math.round(r.getBoundingClientRect().height)),
    wide: document.documentElement.scrollWidth - innerWidth,
    keys: /\b(ty|zw|dg)_[a-z_]+/.test(document.body.innerText)
  }));
  check("rows at least 44 px: " + layout.rows.join(","), layout.rows.every((h) => h >= 44));
  check("no sideways scroll", layout.wide <= 0);
  check("no key names in the page", !layout.keys);
  // Play to the end.
  for (let i = 0; i < 80; i++) {
    const done = await page.evaluate(() => {
      const s = AppStateTY.state;
      if (s.phase === "over" && !AppStateTY.review) return true;
      if (AppStateTY.review) { nextTY(); return false; }
      AppStateTY.state = TierYatzyCore.aiStep(s);
      afterActionTY();
      return false;
    });
    if (done) break;
  }
  const end = await page.evaluate(() => ({ phase: AppStateTY.state.phase, winners: AppStateTY.state.winners, result: document.getElementById("game-result").textContent.trim(),
    total: TierYatzyCore.total(AppStateTY.state.sheets[0]), totalShown: document.querySelector(".ty-row-total .ty-row-points").textContent.trim() }));
  check("game over with a result: " + end.result, end.phase === "over" && end.result.length > 0 && Array.isArray(end.winners));
  check("sheet total shown", String(end.total) === end.totalShown);
  check("save cleared at the end", await page.evaluate(() => localStorage.getItem("einkchess_save_tieryatzy") === null));
  check("no page error " + errors.join(" | "), !errors.length);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== ANIMAL YATZY UI: start, roll and keep, fields, computer panel, save and load, a whole game, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
