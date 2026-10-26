#!/usr/bin/env node
// tests/villains-ui.js
// Fairy-Tale Villains UI (rules version 2), German page, 360 x 640:
// start against the computer (level 3), collect two cards from the market,
// do a step, send a hero (once per turn), the computer's turn, dropping a
// card with more than 6, finishing the plan (round played to its end, result
// shown, save cleared), save and resume, an old save (rules 1) dropped
// without an error, buttons at least 44 px, no sideways scrolling, no
// console errors.
// Needs the local server (BASE_URL) and Playwright.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Every game page starts a game by itself; "New game" then asks first.
  page.on("dialog", (d) => d.accept());
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  const load = () => page.goto(BASE + "villains.html?lang=de", { waitUntil: "load" });
  const humanTurn = () => page.waitForFunction(() => AppStateVl.state && !AppStateVl.busy && (AppStateVl.gameOver || AppStateVl.state.current === 0), null, { timeout: 20000 });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  await load(); await page.waitForTimeout(400);
  await page.evaluate(() => localStorage.removeItem("einkchess_save_villains"));
  await load(); await page.waitForTimeout(400);
  if (!(await page.isVisible("#start-villains-game"))) await page.tap("#menu-toggle");
  // quick-rules.js restores the last settings after the page has loaded.
  await page.waitForTimeout(600);
  check("level select with three levels", await page.evaluate(() => document.querySelectorAll("#vl-level option").length === 3));
  await page.selectOption("#vl-players", "2");
  await page.selectOption("#vl-villain", "witch");
  await page.selectOption("#vl-level", "3");
  await page.tap("#start-villains-game");
  await humanTurn();
  check("new game: rules 2, witch, 2 actions, 3 places shown", await page.evaluate(() => {
    const s = AppStateVl.state;
    return s.rules === 2 && s.players[0].villain === "witch" && s.actionsLeft === 2 && AppStateVl.level === 3 &&
      document.querySelectorAll("#vl-domain .vl-place").length === 3;
  }));
  check("German texts", await page.evaluate(() => document.querySelector('#vl-actions [data-kind="collect"]').textContent === I18n.t("vl_act_collect") && I18n.t("vl_act_collect") !== STRINGS.en.vl_act_collect));
  const small = await page.evaluate(() => Array.from(document.querySelectorAll("#vl-actions button, #vl-end")).map((b) => b.getBoundingClientRect()).filter((r) => r.height < 44 || r.width < 44).length);
  check("action buttons at least 44 px", small === 0);
  check("no sideways scrolling at the start", (await overflow()) <= 0);

  // Collect: two cards from the market.
  const hand0 = await page.evaluate(() => AppStateVl.state.players[0].hand.length);
  await page.tap('#vl-actions [data-kind="collect"]');
  check("collect opens the market choice", await page.evaluate(() => AppStateVl.state.phase === "collect" && document.querySelectorAll("#vl-chooser .vl-choose").length >= 2));
  const chooserSmall = await page.evaluate(() => Array.from(document.querySelectorAll("#vl-chooser button")).filter((b) => b.getBoundingClientRect().height < 44).length);
  check("chooser buttons at least 44 px", chooserSmall === 0);
  await page.tap('#vl-chooser [data-value="0"]');
  await page.tap('#vl-chooser [data-value="0"]');
  check("two cards taken, one action left", await page.evaluate((h) => AppStateVl.state.phase === "act" && AppStateVl.state.players[0].hand.length === h + 2 && AppStateVl.state.actionsLeft === 1, hand0));

  // A step: give a hand that pays the dough (Bakehouse, star 5).
  await page.evaluate(() => { AppStateVl.state.players[0].hand = ["star3", "star2", "moon1"]; renderVl(); });
  await page.tap('#vl-actions [data-kind="step"][data-extra="0"]');
  check("step done with star 3 + star 2", await page.evaluate(() => AppStateVl.state.players[0].done[0] && AppStateVl.state.players[0].hand.join() === "moon1"));

  // The computer plays; then send a hero in the next own turn.
  await humanTurn();
  check("the computer took its turn", await page.evaluate(() => AppStateVl.state.turn === 2 && AppStateVl.state.log.some((e) => e.p === 1)));
  await page.evaluate(() => { const s = AppStateVl.state; s.heroRow = ["hunter", "dwarf"]; s.players[0].hand = ["moon1", "herb2"]; s.players[1].heroes = []; renderVl(); });
  await page.tap('#vl-actions [data-kind="scheme"]');
  await page.tap('#vl-chooser [data-value="0"]');
  check("one opponent: the place choice comes next", await page.evaluate(() => AppStateVl.pick && AppStateVl.pick.kind === "place"));
  await page.tap('#vl-chooser [data-value="2"]');
  check("hero sent: Hunter on place 3 of the computer, lowest card given up, no action used", await page.evaluate(() => {
    const s = AppStateVl.state;
    return s.players[1].heroes.some((h) => h.card === "hunter" && h.place === 2) && s.players[0].hand.join() === "herb2" && s.schemed && s.actionsLeft === 2;
  }));
  check("only one scheme per turn", await page.evaluate(() => !document.querySelector('#vl-actions [data-kind="scheme"]')));

  // More than 6 cards: drop one.
  await page.evaluate(() => { AppStateVl.state.players[0].hand = ["moon1", "moon1", "moon1", "herb1", "herb1", "star1"]; renderVl(); });
  await page.tap('#vl-actions [data-kind="collect"]');
  await page.tap('#vl-chooser [data-value="-1"]');
  await page.tap('#vl-chooser [data-value="-1"]');
  check("8 cards: drop phase", await page.evaluate(() => AppStateVl.state.phase === "trim"));
  await page.tap('#vl-hand [data-hand="0"]');
  await page.tap('#vl-hand [data-hand="0"]');
  check("after dropping two cards the turn goes on with 6", await page.evaluate(() => AppStateVl.state.players[0].hand.length === 6 && AppStateVl.state.actionsLeft === 1));
  await page.tap("#vl-end");
  await humanTurn();

  // Save and resume.
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(400);
  await humanTurn();
  check("save resumes on reload (rules 2, level 3)", await page.evaluate(() => AppStateVl.state.rules === 2 && AppStateVl.level === 3 && AppStateVl.state.players[0].done[0]));

  // Finish the plan: the round is played to its end, then the result.
  await page.evaluate(() => {
    const s = AppStateVl.state;
    s.players[0].done = [true, true, true, false];
    s.players[0].heroes = [];
    s.players[0].hand = ["herb3", "herb3", "star3", "star3"];
    s.players[1].done = [false, false, false, false];
    s.actionsLeft = 2; s.phase = "act";
    renderVl();
  });
  await page.tap('#vl-actions [data-kind="step"][data-extra="3"]');
  await page.waitForFunction(() => AppStateVl.gameOver, null, { timeout: 20000 });
  check("plan finished: the human wins after the round", await page.evaluate(() => AppStateVl.state.winners.join() === "0" && AppStateVl.state.finished[0] === 0));
  check("result shown in German", (await page.textContent("#game-result")).length > 0 && await page.evaluate(() => document.getElementById("game-result").textContent === I18n.t("vl_result_win_text")));
  check("save cleared after the end", await page.evaluate(() => !localStorage.getItem("einkchess_save_villains")));

  // An old save (rules 1) is dropped without an error.
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate(() => localStorage.setItem("einkchess_save_villains", JSON.stringify({ mode: "vs-ai", state: { players: [{ villain: "witch", place: -1, gold: 0, hand: ["raven"], deck: [], discard: [], helpers: [], heroes: [], twist: [], twistDiscard: [], prog: { houses: 0, oven: false } }, { villain: "wolf", place: -1, gold: 1, hand: [], deck: [], discard: [], helpers: [], heroes: [], twist: [], twistDiscard: [], prog: {} }], current: 0, turn: 3, winner: null, log: [], phase: "move", used: [], pendingTwist: null } })));
  await load(); await page.waitForTimeout(500);
  // Like every game page, a fresh game may start by itself afterwards.
  const legacy = await page.evaluate(() => {
    const s = AppStateVl.state, raw = JSON.parse(localStorage.getItem("einkchess_save_villains") || "null");
    return { state: s === null || (s.rules === 2 && s.turn === 1), saved: !raw || (raw.state && raw.state.rules === 2) };
  });
  check("old save dropped " + JSON.stringify(legacy), legacy.state && legacy.saved);

  // Rules page in German, no sideways scrolling.
  await page.goto(BASE + "villains-rules.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(400);
  check("rules page in German", await page.evaluate(() => document.querySelector('[data-i18n="vl_term_pay"]').textContent !== "Paying"));
  check("rules page: no sideways scrolling", (await overflow()) <= 0);

  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== VILLAINS UI: 360 px, collect, step, hero, drop, end of round, save/load, old save, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { fails.forEach((x) => console.log("FAIL " + x)); console.log("FAIL " + e.message.split("\n")[0]); console.log("=== VILLAINS UI: " + (fails.length + 1) + " failure(s) ==="); process.exit(1); });
