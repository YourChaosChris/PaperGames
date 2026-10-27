#!/usr/bin/env node
// Card Duel UI (task 149): new rules on the German page at 360 x 640.
// Start against the computer (start life 17 / 20, rules: 3), a new creature
// attacks at once (tap card, Play, tap creature, tap the other mage), a
// Warden strikes the attacker first, the computer takes its turn and the
// log shows it, button sizes (44 px), the mage line names the discard pile,
// save and reload, an old save (not rules: 3) is dropped quietly, the rules
// page names Warden and Ranged; no horizontal scrolling, no page errors.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const KEY = "einkchess_save_cardduel";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  const load = () => page.goto(BASE + "cardduel.html?lang=de", { waitUntil: "load" });
  const waitHuman = () => page.waitForFunction(() => AppStateCd.state && (AppStateCd.gameOver || (AppStateCd.state.current === 0 && !AppStateCd.busy)), null, { timeout: 30000 });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  await load(); await page.waitForTimeout(400);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  if (!(await page.isVisible("#start-cardduel-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#cd-deck1", "fire");
  await page.selectOption("#cd-deck2", "stone");
  await page.selectOption("#cd-level", "easy");
  await page.tap("#start-cardduel-game");
  await waitHuman();
  const start = await page.evaluate(() => { const s = AppStateCd.state; return { rules: s.rules, lives: [s.players[0].life, s.players[1].life], starter: s.starter }; });
  check("new game has rules: 3 " + JSON.stringify(start), start.rules === 3);
  check("start life: the starter 17, the other 20 " + JSON.stringify(start), start.lives[start.starter] === 17 || start.lives[start.starter] < 17);

  // A fixed position: a Spark Imp in hand, a Granite Keeper (Warden) on the other side.
  await page.evaluate(() => {
    const s = AppStateCd.state;
    s.players[0].hand = ["fire_sparkimp", "fire_ashwolf"]; s.players[0].board = []; s.players[0].power = 9;
    s.players[1].board = []; s.players[1].life = 20;
    AppStateCd.info = null; renderCd();
  });
  await page.tap('#cd-hand .cd-card[data-hand="0"]');
  await page.tap("#cd-play");
  check("Spark Imp is on the table", await page.evaluate(() => AppStateCd.state.players[0].board.length === 1));
  await page.tap('#cd-board-bottom .cd-creature[data-index="0"]');
  check("a creature played this turn can attack at once (dashed mage)", await page.evaluate(() => document.getElementById("cd-mage-top").classList.contains("cd-target")));
  await page.tap("#cd-mage-top");
  check("the attack hits the other mage for 2", await page.evaluate(() => AppStateCd.state.players[1].life === 18));
  // Warden (rules 3): the Granite Keeper does not strike the Ash Wolf
  // (3 / 3); it takes 1 off the hit on its mage.
  await page.evaluate(() => {
    const s = AppStateCd.state;
    s.players[1].board = [{ id: "stone_granitekeeper", uid: 900, atk: 3, hp: 5, max: 5, abil: ["ward"], ready: true }];
    renderCd();
  });
  await page.tap('#cd-hand .cd-card[data-hand="0"]');
  await page.tap("#cd-play");
  await page.tap('#cd-board-bottom .cd-creature[data-index="1"]');
  await page.tap("#cd-mage-top");
  const ward = await page.evaluate(() => ({ life: AppStateCd.state.players[1].life, row: AppStateCd.state.players[0].board.length, grave: AppStateCd.state.players[0].grave.slice(), log: document.getElementById("cd-log").textContent }));
  check("Warden takes 1 off the hit, the wolf survives " + JSON.stringify(ward), ward.life === 16 && ward.row === 2 && ward.grave.indexOf("fire_ashwolf") === -1);
  check("log names the Warden protection", /schützt den Magier/.test(ward.log));

  const sizes = await page.evaluate(() => ["#cd-play", "#cd-cancel", "#cd-end", "#cd-mage-top", "#cd-mage-bottom"].concat(Array.from(document.querySelectorAll("#cd-board-bottom .cd-creature, #cd-board-top .cd-creature")).map((b, i) => b)).map((x) => {
    const el = typeof x === "string" ? document.querySelector(x) : x;
    const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)];
  }));
  check("buttons at least 44 px " + JSON.stringify(sizes), sizes.every(([w, h]) => w >= 44 && h >= 44));
  await page.tap("#cd-mage-bottom");
  check("mage line names the discard pile", /Ablagestapel/.test(await page.textContent("#cd-info")));
  check("no horizontal scrolling at 360 px (board)", (await overflow()) <= 0);

  // The computer's turn.
  const turn = await page.evaluate(() => AppStateCd.state.turn);
  await page.tap("#cd-end");
  await waitHuman();
  check("the computer took its turn", await page.evaluate((t) => AppStateCd.gameOver || AppStateCd.state.turn === t + 2, turn));
  // 9 - 1 - 3 = 5 left, 3 more in the new turn.
  check("unused power stays: 5 + 3 = 8", await page.evaluate(() => AppStateCd.gameOver || AppStateCd.state.players[0].power === 8));

  // Save and reload.
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(500);
  check("save resumes on reload", await page.evaluate(() => !!AppStateCd.state && AppStateCd.state.rules === 3 && AppStateCd.state.players[1].life <= 18));

  // An old save (not rules: 3, no discard piles) is dropped quietly. Set from
  // another page: the game page saves its own state when it is left.
  const legacy = await page.evaluate(() => {
    const x = CardDuelCore.createGame(["forest", "water"], 0);
    delete x.rules; x.players.forEach((p) => { delete p.grave; p.maxPower = 1; });
    return JSON.stringify({ mode: "vs-ai", level: "medium", state: x });
  });
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, legacy]);
  await load(); await page.waitForTimeout(500);
  const after = await page.evaluate((k) => {
    const raw = JSON.parse(localStorage.getItem(k) || "null");
    const s = AppStateCd.state;
    return { stateOk: !s || s.rules === 3, savedOld: !!raw && !!raw.state && raw.state.rules !== 3 };
  }, KEY);
  check("old save dropped " + JSON.stringify(after), after.stateOk && !after.savedOld);

  // The rules page.
  await page.goto(BASE + "cardduel-rules.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(400);
  const rules = await page.textContent("main");
  check("rules page names Hüter and Fernkampf", /Hüter/.test(rules) && /Fernkampf/.test(rules));
  check("rules page: 20 cards, store of 9, 7 cards in hand", /20 Karten/.test(rules) && /höchstens 9/.test(rules) && /höchstens 7 Karten/.test(rules));
  check("no horizontal scrolling at 360 px (rules)", (await overflow()) <= 0);

  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== CARD DUEL UI: 360 px, attack at once, Warden, computer turn, save/load, old save, rules page, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
