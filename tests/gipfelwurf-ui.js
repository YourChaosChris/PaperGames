#!/usr/bin/env node
// Ridge Roll / Gipfelwurf in the browser (task 131), German page at
// 360 x 640: start against one computer, roll the dice (four pip dice),
// choose a pair (big buttons with the sums), stop and make camp (the camp
// shows on the board), a lost turn (panel "Zug verloren!" with "Weiter"),
// the end of the game with the result, save and load in the middle of a
// turn; buttons at least 44 px, no sideways scroll, no page error.
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
  await myTurn();
  const start = await page.evaluate(() => ({
    roll: document.getElementById("gw-roll").textContent.trim(),
    stop: document.getElementById("gw-stop").textContent.trim(),
    ridges: document.querySelectorAll("#gw-board .gw-ridge").length,
    cells: document.querySelectorAll("#gw-board .gw-cell").length,
    rows: document.querySelectorAll("#gw-rows .gw-player").length,
    stopOff: document.getElementById("gw-stop").disabled
  }));
  check("German buttons, seven ridges, 69 steps, two rows " + JSON.stringify(start),
    start.roll === "Würfeln" && start.stop === "Aufhören und sichern" && start.ridges === 7 && start.cells === 69 && start.rows === 2 && start.stopOff);
  const sizes = await page.evaluate(() => ["gw-roll", "gw-stop"].map((id) => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }));
  check("buttons at least 44 px " + JSON.stringify(sizes), sizes.every(([w, h]) => w >= 44 && h >= 44));

  // Roll with fixed dice 3 4 1 5: three splits, big buttons with the sums.
  await page.evaluate(() => { const s = AppStateGW.state; s.phase = "roll"; s.climbers = s.climbers.map(() => null); AppStateGW.state = GipfelwurfCore.roll(s, null, [3, 4, 1, 5]); AppStateGW.generation++; afterGW(); });
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll("#gw-options button")).map((b) => ({ t: b.textContent.trim(), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width) })));
  check("three pairs as buttons, at least 44 px " + JSON.stringify(opts), opts.length === 3 && opts.every((o) => o.h >= 44 && o.w >= 44) && opts.map((o) => o.t).join("|") === "7 und 6|4 und 9|8 und 5");
  const dice = await page.evaluate(() => document.querySelectorAll("#gw-dice svg").length);
  check("four pip dice", dice === 4);
  check("roll and stop hidden while choosing", await page.evaluate(() => document.getElementById("gw-actions").classList.contains("hidden")));
  await page.tap("#gw-options button >> nth=0");
  await page.waitForTimeout(100);
  const climbed = await page.evaluate(() => ({ c: AppStateGW.state.climbers.slice(), marked: document.querySelectorAll("#gw-board .gw-cell-climber").length, rings: document.querySelectorAll("#gw-board .gw-climber").length, stopOn: !document.getElementById("gw-stop").disabled }));
  check("pair chosen: climbers on 7 and 6 " + JSON.stringify(climbed), climbed.c[3] === 1 && climbed.c[2] === 1 && climbed.marked === 2 && climbed.rings === 2 && climbed.stopOn);

  // Stop and make camp.
  const me = await page.evaluate(() => AppStateGW.state.current);
  await page.tap("#gw-stop");
  await page.waitForTimeout(100);
  const camp = await page.evaluate((p) => ({ camps: AppStateGW.state.camps[p].slice(), climbers: AppStateGW.state.climbers.filter((h) => h !== null).length, shapes: document.querySelectorAll("#gw-board .gw-camp").length, last: document.getElementById("gw-last").textContent }), me);
  check("camps kept and drawn " + JSON.stringify(camp), camp.camps[3] === 1 && camp.camps[2] === 1 && camp.climbers === 0 && camp.shapes >= 2 && /Lager aufgeschlagen/.test(camp.last));

  // A lost turn: three climbers on 2-4, 5 and 6, then 6 6 6 6 (12 + 12).
  await myTurn();
  await page.evaluate(() => {
    const s = AppStateGW.state;
    s.phase = "roll"; s.climbers = [1, 1, 1, null, null, null, null];
    AppStateGW.state = GipfelwurfCore.roll(s, null, [6, 6, 6, 6]); AppStateGW.generation++; afterGW();
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
  check("after Weiter: the other player, climbing gone", await page.evaluate((w) => AppStateGW.state.current !== w && AppStateGW.state.climbers.every((h) => h === null), who));

  const shot = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, board: Math.round(document.getElementById("gw-board").getBoundingClientRect().width) }));
  check("no sideways scroll " + JSON.stringify(shot), shot.overflow <= 0 && shot.board <= 360);

  // Save and load in the middle of a turn (dice rolled, pairs shown).
  await myTurn();
  await page.evaluate(() => { const s = AppStateGW.state; s.phase = "roll"; s.climbers = s.climbers.map(() => null); AppStateGW.state = GipfelwurfCore.roll(s, null, [2, 3, 4, 5]); AppStateGW.generation++; afterGW(); });
  const seq = await page.evaluate(() => AppStateGW.state.seq);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  const back = await page.evaluate((q) => ({ ok: !!AppStateGW.state && AppStateGW.state.seq === q && AppStateGW.state.phase === "choose", opts: document.querySelectorAll("#gw-options button").length }), seq);
  check("game back after reload with the pairs " + JSON.stringify(back), back.ok && back.opts >= 1);

  // The end: one step below the third top, then claim it.
  await page.evaluate(() => {
    const s = GipfelwurfCore.newGame({ players: 2, computer: [false, true], levels: [2, 2], need: 3, starter: 0 });
    s.owner[0] = 0; s.owner[1] = 0; s.camps[0][3] = GipfelwurfCore.LENGTHS[3] - 1;
    AppStateGW.state = GipfelwurfCore.roll(s, null, [3, 4, 1, 1]); AppStateGW.generation++; afterGW();
  });
  await page.tap("#gw-options button >> text=nur 7");
  await page.waitForTimeout(100);
  await page.tap("#gw-stop");
  await page.waitForTimeout(300);
  const end = await page.evaluate(() => ({ phase: AppStateGW.state.phase, result: document.getElementById("game-result").textContent.trim(), save: localStorage.getItem("einkchess_save_gipfelwurf"), hatched: document.querySelectorAll("#gw-board .gw-ridge-claimed").length }));
  check("game over with the result " + JSON.stringify(end), end.phase === "over" && /Sieg mit 3 Gipfeln/.test(end.result) && end.hatched === 3);
  check("finished game not saved", !end.save || JSON.parse(end.save) === null || (JSON.parse(end.save).state || {}).phase !== "over");
  check("page errors " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((f) => console.log("FAIL " + f));
  console.log("=== RIDGE ROLL UI: roll, choose a pair, stop and camp, lost turn, save and load, game end at 360 x 640, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
