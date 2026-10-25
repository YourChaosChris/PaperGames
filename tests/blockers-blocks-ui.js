#!/usr/bin/env node
// Number of blocks in Blocked Path in the browser (task 123), German page
// at 360 x 640:
//   - the choice "Sperrklötze" shows "Wenige (4)", "Normal (6)", "Viele
//     (11)", "Normal" is preselected and starts the map's 6 blocks;
//   - "Viele" starts 11 blocks and is saved; after a reload the game and
//     the choice are back;
//   - on the quick board "Viele" is hidden, with 5 players it can't be
//     chosen; "Wenige" on the quick board starts 4 blocks;
//   - a game saved without `blocks` loads as before (choice "Normal").
// No page error, nothing scrolls sideways.
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
  await page.goto(BASE + "blockers.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  const openMenu = async () => { if (!(await page.isVisible("#bl-blocks"))) await page.tap("#menu-toggle"); };
  await openMenu();
  const opts = await page.$$eval("#bl-blocks option", (o) => o.map((x) => x.value + "=" + x.textContent.trim()));
  check("options " + opts.join(", "), opts.join("|") === "few=Wenige (4)|normal=Normal (6)|many=Viele (11)");
  check("Normal preselected", (await page.inputValue("#bl-blocks")) === "normal");
  const label = await page.textContent('label[for="bl-blocks"]');
  check("label " + label, /Sperrklötze/.test(label));
  await page.selectOption("#bl-num-players", "2");
  await page.selectOption("#bl-computers", "1");
  await page.tap("#start-bl-game");
  await page.waitForTimeout(400);
  const normal = await page.evaluate(() => ({ stones: AppStateBL.state.stones.join(","), map: BlockersCore.startStones.filter((f) => AppStateBL.state.finish !== "all" || BlockersCore.distToGoal[f] > BlockersCore.NEAR_GOAL).join(","), blocks: AppStateBL.state.blocks }));
  check("normal: the map's blocks " + JSON.stringify(normal), normal.stones === normal.map && normal.blocks === undefined);

  await openMenu();
  await page.selectOption("#bl-finish", "one");
  await page.selectOption("#bl-blocks", "many");
  await page.tap("#start-bl-game");
  await page.waitForTimeout(400);
  const many = await page.evaluate(() => ({ stones: AppStateBL.state.stones.length, drawn: document.querySelectorAll("#bl-board .bl-field").length, overflow: document.documentElement.scrollWidth - innerWidth }));
  check("many: 11 blocks " + JSON.stringify(many), many.stones === 11);
  check("no sideways scroll with 11 blocks", many.overflow <= 0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_blockers") || "null"));
  check("saved with blocks many", saved && saved.state && saved.state.blocks === "many" && saved.state.stones.length === 11);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({ stones: AppStateBL.state && AppStateBL.state.stones.length, choice: document.getElementById("bl-blocks").value }));
  check("many back after reload " + JSON.stringify(back), back.stones === 11 && back.choice === "many");

  // Quick board: "many" hidden, "few" = 4.
  await openMenu();
  await page.selectOption("#bl-board-size", "quick");
  const q = await page.evaluate(() => { const o = document.querySelector('#bl-blocks option[value="many"]'); return { hidden: o.hidden, disabled: o.disabled, value: document.getElementById("bl-blocks").value }; });
  check("quick board: many hidden " + JSON.stringify(q), q.hidden && q.disabled && q.value === "normal");
  await page.selectOption("#bl-blocks", "few");
  await page.tap("#start-bl-game");
  await page.waitForTimeout(400);
  const qf = await page.evaluate(() => ({ board: AppStateBL.state.board, stones: AppStateBL.state.stones.length, blocks: AppStateBL.state.blocks }));
  check("quick few: 4 blocks " + JSON.stringify(qf), qf.board === "quick" && qf.stones === 4 && qf.blocks === "few");

  // Normal board with 5 players: "many" can't be chosen.
  await openMenu();
  await page.selectOption("#bl-board-size", "normal");
  await page.selectOption("#bl-blocks", "many");
  await page.selectOption("#bl-num-players", "5");
  const five = await page.evaluate(() => { const o = document.querySelector('#bl-blocks option[value="many"]'); return { hidden: o.hidden, disabled: o.disabled, value: document.getElementById("bl-blocks").value }; });
  check("5 players: many not available " + JSON.stringify(five), !five.hidden && five.disabled && five.value === "normal");

  // An old save without `blocks`.
  await page.evaluate(() => {
    const s = BlockersCore.createInitialState(2);
    delete s.blocks;
    localStorage.setItem("einkchess_save_blockers", JSON.stringify({ numPlayers: 2, computers: 1, level: 2, state: s }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const old = await page.evaluate(() => ({ stones: AppStateBL.state && AppStateBL.state.stones.length, choice: document.getElementById("bl-blocks").value }));
  check("old save loads with Normal " + JSON.stringify(old), old.stones === 6 && old.choice === "normal");
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== BLOCKERS BLOCKS UI: few/normal/many, save and load, quick board, 5 players, old save, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
