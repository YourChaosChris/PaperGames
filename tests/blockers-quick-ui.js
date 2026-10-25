#!/usr/bin/env node
// Quick board of Blocked Path in the browser (task 110), German page at
// 360 x 640:
//   - "Brett: Schnell" starts the quick board: 7 rows, four houses under
//     it, 4 tokens per player, "Figuren pro Person" shows 4;
//   - the rest fields are labelled "Ruhefeld" and drawn (octagons);
//   - a roll and a move work; the game is saved with board "quick" and is
//     back after a reload, still on the quick board;
//   - a block prompt on the quick board names the rest fields;
//   - switching back to "Normal" starts the normal board again.
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
  if (!(await page.isVisible("#bl-board-size"))) await page.tap("#menu-toggle");
  await page.selectOption("#bl-board-size", "quick");
  check("tokens per player shows 4 on the quick board", (await page.inputValue("#bl-tokens")) === "4");
  await page.selectOption("#bl-num-players", "3");
  await page.selectOption("#bl-computers", "2");
  check("four houses to choose from", (await page.$$eval("#bl-house-0 option", (o) => o.length)) === 4);
  await page.selectOption("#bl-first", "me");
  await page.tap("#start-bl-game");
  await page.waitForFunction(() => AppStateBL.state && AppStateBL.state.turn === 0 && AppStateBL.state.phase === "roll", null, { timeout: 10000 });
  const info = await page.evaluate(() => {
    const s = AppStateBL.state, B = BlockersCore.boardOf(s);
    const labels = Array.from(document.querySelectorAll("#bl-board .bl-field")).map((b) => b.getAttribute("aria-label"));
    return { board: s.board, rows: B.rows, tokens: s.tokens.map((t) => t.length).join(","), stones: s.stones.length, fields: labels.length,
      rest: labels.filter((l) => /Ruhefeld/.test(l)).length, polys: document.querySelectorAll("#bl-board svg polygon").length,
      houses: s.houses.every((h) => h >= 0 && h < 4), overflow: document.documentElement.scrollWidth - innerWidth };
  });
  check("quick board started " + JSON.stringify(info), info.board === "quick" && info.rows === 7 && info.tokens === "4,4,4" && info.stones === 6 && info.houses);
  check("four rest fields labelled", info.rest === 4);
  check("rest fields drawn", info.polys >= 8);
  check("no sideways scroll", info.overflow <= 0);
  await page.tap("#bl-roll");
  await page.waitForFunction(() => AppStateBL.state.phase !== "roll" || AppStateBL.state.turn !== 0, null, { timeout: 10000 });
  await page.evaluate(() => {
    const s = AppStateBL.state;
    if (s.phase !== "move" || s.turn !== 0) return;
    const m = BlockersCore.legalMoves(s)[0];
    if (m) onFieldBL(m.to);
  });
  await page.waitForTimeout(300);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_blockers") || "null"));
  check("saved with board quick", saved && saved.state && saved.state.board === "quick");

  // A saved block phase on the quick board.
  await page.evaluate(() => {
    const s = BlockersCore.createInitialState(2, { board: "quick" });
    s.stones.pop();
    s.phase = "stone"; s.pendingStone = true; s.turn = 0; s.roll = 3;
    localStorage.setItem("einkchess_save_blockers", JSON.stringify({ numPlayers: 2, computers: 1, level: 2, state: s }));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate(() => ({ board: AppStateBL.state && AppStateBL.state.board, choice: document.getElementById("bl-board-size").value, status: document.getElementById("board-info").textContent.trim(),
    targets: BlockersCore.stoneTargets(AppStateBL.state).some((f) => BlockersCore.boardOf(AppStateBL.state).isRest(f)) }));
  check("quick game back after reload " + JSON.stringify(back), back.board === "quick" && back.choice === "quick");
  check("block prompt names the rest fields: " + back.status, /Ruhefeld/.test(back.status));
  check("no block target on a rest field", !back.targets);

  // Back to the normal board.
  if (!(await page.isVisible("#bl-board-size"))) await page.tap("#menu-toggle");
  await page.selectOption("#bl-board-size", "normal");
  await page.tap("#start-bl-game");
  await page.waitForTimeout(400);
  const normal = await page.evaluate(() => ({ board: AppStateBL.state.board, rows: BlockersCore.boardOf(AppStateBL.state).rows, tokens: AppStateBL.state.tokens[0].length }));
  check("normal board again " + JSON.stringify(normal), normal.board === undefined && normal.rows === 10 && (normal.tokens === 5 || normal.tokens === 3));
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== BLOCKERS QUICK UI: quick board start, rest fields, save and load, normal again, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
