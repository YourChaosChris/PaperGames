#!/usr/bin/env node
// Ridge Roll / Gipfelwurf in the browser (rules of task 136), German page at
// 360 x 640: start against one computer, roll the dice (three pip dice),
// choose a way to climb (big buttons "Grat 6: 3 hoch"), stop and make camp
// (the camp shows on the board), a lost turn (panel "Zug verloren!" with
// "Weiter"), save and load in the middle of a turn, an old save of the first
// rules is dropped, the end of the game with the result; buttons at least
// 44 px, no sideways scroll, no page error.
// BASE_URL from the environment or as --base URL.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
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
  await page.goto(BASE + "gipfelwurf.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  if (!(await page.isVisible("#start-gw-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#gw-players", "2");
  await page.selectOption("#gw-computers", "1");
  await page.tap("#start-gw-game");
  // The person's turn (the start is drawn by lot: wait for the computer).
  const myTurn = () => page.waitForFunction(() => {
    const s = AppStateGW.state;
    return s && (s.phase === "over" || !s.computer[s.current]);
  }, null, { timeout: 30000 });
  // A clean start of the person's turn with fixed dice.
  const rollFixed = (dice) => page.evaluate((d) => {
    const s = AppStateGW.state;
    s.phase = "roll"; s.ridge = null; s.climber = null; s.hutReached = false; s.rolls = 0;
    AppStateGW.state = GipfelwurfCore.roll(s, null, d); AppStateGW.generation++; afterGW();
  }, dice);
  await myTurn();
  const cells = GIPFEL_CELLS();
  const start = await page.evaluate(() => ({
    roll: document.getElementById("gw-roll").textContent.trim(),
    stop: document.getElementById("gw-stop").textContent.trim(),
    ridges: document.querySelectorAll("#gw-board .gw-ridge").length,
    cells: document.querySelectorAll("#gw-board .gw-cell").length,
    huts: document.querySelectorAll("#gw-board .gw-cell-hut").length,
    crevasses: document.querySelectorAll("#gw-board .gw-cell-crevasse").length,
    rows: document.querySelectorAll("#gw-rows .gw-player").length,
    stopOff: document.getElementById("gw-stop").disabled
  }));
  check("German buttons, seven ridges, " + cells + " steps, huts and crevasses, two rows " + JSON.stringify(start),
    start.roll === "Würfeln" && start.stop === "Aufhören und sichern" && start.ridges === 7 && start.cells === cells && start.huts === 7 && start.crevasses === 7 && start.rows === 2 && start.stopOff);
  const sizes = await page.evaluate(() => ["gw-roll", "gw-stop"].map((id) => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
  check("buttons at least 44 px " + JSON.stringify(sizes), sizes.every(([w, h]) => w >= 44 && h >= 44));

  // Roll 5 2 4: three ways - ridge 6 three up, ridge 9 one up, ridge 7 two up.
  await rollFixed([5, 2, 4]);
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll("#gw-options button")).map((b) => ({ t: b.textContent.trim(), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width) })));
  check("three ways as buttons, at least 44 px " + JSON.stringify(opts), opts.length === 3 && opts.every((o) => o.h >= 44 && o.w >= 44) && opts.map((o) => o.t).sort().join("|") === "Grat 6: 3 hoch|Grat 7: 2 hoch|Grat 9: 1 hoch");
  check("three pip dice", await page.evaluate(() => document.querySelectorAll("#gw-dice svg").length === 3));
  check("roll and stop hidden while choosing", await page.evaluate(() => document.getElementById("gw-actions").classList.contains("hidden")));
  await page.tap("#gw-options button >> text=Grat 6: 3 hoch");
  await page.waitForTimeout(100);
  const climbed = await page.evaluate(() => ({ r: AppStateGW.state.ridge, c: AppStateGW.state.climber, marked: document.querySelectorAll("#gw-board .gw-cell-climber").length, stopOn: !document.getElementById("gw-stop").disabled }));
  check("way chosen: climber 3 up ridge 6 " + JSON.stringify(climbed), climbed.r === 2 && climbed.c === 3 && climbed.marked === 1 && climbed.stopOn);

  // Stop and make camp.
  const me = await page.evaluate(() => AppStateGW.state.current);
  await page.tap("#gw-stop");
  await page.waitForTimeout(100);
  const camp = await page.evaluate((p) => ({ camp: AppStateGW.state.camps[p][2], climber: AppStateGW.state.climber, shapes: document.querySelectorAll("#gw-board .gw-camp").length, row: document.querySelector("#gw-rows .gw-player").textContent }), me);
  check("camp kept and drawn " + JSON.stringify(camp), camp.camp === 3 && camp.climber === null && camp.shapes >= 1);

  // A lost turn: climbing ridge 7, then 6 6 6 (only 12 = ridge 10-12).
  await myTurn();
  await page.evaluate(() => {
    const s = AppStateGW.state;
    s.phase = "roll"; s.ridge = 3; s.climber = 2; s.hutReached = false; s.rolls = 1;
    AppStateGW.state = GipfelwurfCore.roll(s, null, [6, 6, 6]); AppStateGW.generation++; afterGW();
  });
  const lost = await page.evaluate(() => ({
    phase: AppStateGW.state.phase,
    panel: !document.getElementById("gw-lost").classList.contains("hidden"),
    title: document.querySelector("#gw-lost .gw-lost-title").textContent.trim(),
    next: document.getElementById("gw-next").getBoundingClientRect().height,
    last: document.getElementById("gw-last").textContent,
    status: document.getElementById("board-info").textContent
  }));
  check("lost turn shown " + JSON.stringify(lost), lost.phase === "lost" && lost.panel && lost.title === "Zug verloren!" && lost.next >= 44 && /verloren/.test(lost.last) && /Weiter/.test(lost.status));
  const who = await page.evaluate(() => AppStateGW.state.current);
  await page.tap("#gw-next");
  await page.waitForTimeout(100);
  check("after Weiter: the other player, climbing gone", await page.evaluate((w) => AppStateGW.state.current !== w && AppStateGW.state.climber === null, who));

  const shot = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, board: Math.round(document.getElementById("gw-board").getBoundingClientRect().width) }));
  check("no sideways scroll " + JSON.stringify(shot), shot.overflow <= 0 && shot.board <= 360);

  // Save and load in the middle of a turn (dice rolled, ways shown).
  await myTurn();
  await rollFixed([1, 2, 3]);
  const seq = await page.evaluate(() => AppStateGW.state.seq);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate((q) => ({ ok: !!AppStateGW.state && AppStateGW.state.seq === q && AppStateGW.state.phase === "choose", opts: document.querySelectorAll("#gw-options button").length }), seq);
  check("game back after reload with the ways " + JSON.stringify(back), back.ok && back.opts >= 1);

  // A save of the first rules (no `rules`) is dropped; set from another page,
  // because the game page saves its own state when it is left.
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate(() => localStorage.setItem("einkchess_save_gipfelwurf", JSON.stringify({ state: { game: "gipfelwurf", n: 2, camps: [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]], owner: [-1, -1, -1, -1, -1, -1, -1], climbers: [null, null, null, null, null, null, null], computer: [false, true], phase: "roll", current: 0 } })));
  await page.goto(BASE + "gipfelwurf.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  check("old save dropped, a game with the new rules", await page.evaluate(() => !!AppStateGW.state && AppStateGW.state.rules === 2));

  // The end: 29 points, then one step on ridge 5; the round is finished.
  await page.evaluate(() => {
    const s = GipfelwurfCore.newGame({ players: 2, computer: [false, true], levels: [2, 2], target: 30, starter: 0 });
    let pts = 29;
    for (let r = 2; r < GipfelwurfCore.RIDGES && pts > 0; r++) { s.camps[0][r] = Math.min(pts, GipfelwurfCore.LENGTHS[r] - 1); pts -= s.camps[0][r]; }
    AppStateGW.state = GipfelwurfCore.roll(s, null, [1, 2, 3]); AppStateGW.generation++; afterGW();
  });
  await page.tap("#gw-options button >> text=Grat 5: 1 hoch");
  await page.waitForTimeout(100);
  await page.tap("#gw-stop");
  await page.waitForFunction(() => AppStateGW.state.phase === "over", null, { timeout: 30000 });
  await page.waitForTimeout(200);
  const end = await page.evaluate(() => ({ phase: AppStateGW.state.phase, result: document.getElementById("game-result").textContent.trim(), save: localStorage.getItem("einkchess_save_gipfelwurf") }));
  check("game over with the result " + JSON.stringify(end), end.phase === "over" && /gewinnt mit 3\d Punkten/.test(end.result));
  check("finished game not saved", !end.save || JSON.parse(end.save) === null || (JSON.parse(end.save).state || {}).phase !== "over");
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== RIDGE ROLL UI: roll three dice, choose a way, stop and camp, lost turn, save and load, old save, game end at 360 x 640, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);

  function GIPFEL_CELLS() {
    return require("../gipfelwurf-core.js").LENGTHS.reduce((a, b) => a + b, 0);
  }
})().catch((e) => { console.error(e); process.exit(1); });
