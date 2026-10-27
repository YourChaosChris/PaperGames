#!/usr/bin/env node
// Forest Village UI (rules 3): German page at 360 x 640. A turn is "send a
// squirrel, then build or end the turn"; fields show the extra for the first
// squirrel; the computer moves; a whole game against the computer ends with
// a result; save and reload; an old save (rules 2) and the first save key are
// dropped without an error; buttons at least 44 px; no horizontal scrolling
// on the game and the rules page; no console errors.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };
const KEY = "einkchess_save_forestvillage_v2";
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  const load = () => page.goto(BASE + "forestvillage.html?lang=de", { waitUntil: "load" });
  const waitHuman = () => page.waitForFunction(() => AppStateFv.state && (AppStateFv.gameOver || (AppStateFv.state.current === 0 && !AppStateFv.busy)), null, { timeout: 30000 });

  await load(); await page.waitForTimeout(400);
  await page.evaluate((k) => localStorage.removeItem(k), KEY);
  if (!(await page.isVisible("#start-forestvillage-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#fv-players", "2");
  await page.selectOption("#fv-level", "hard");
  await page.tap("#start-forestvillage-game");
  await waitHuman();
  const st = await page.evaluate(() => ({ rules: AppStateFv.state.rules, season: ForestVillageCore.season(AppStateFv.state), hand: AppStateFv.state.players[0].hand.length, w: AppStateFv.state.players[0].workers, info: document.getElementById("board-info").textContent, me: document.getElementById("fv-me").textContent }));
  check("new game: rules 3, spring, 4 cards, 3 squirrels " + JSON.stringify(st), st.rules === 3 && st.season === "spring" && st.hand === 4 && st.w === 3);
  check("status asks for a squirrel: " + st.info, /Eichhörnchen/.test(st.info));
  check("own line names the season: " + st.me, /Frühling/.test(st.me));
  const fieldInfo = await page.evaluate(() => Array.from(document.querySelectorAll(".fv-field")).map((b) => { const r = b.getBoundingClientRect(); return { h: r.height, w: r.width, t: b.textContent, on: !b.disabled }; }));
  check("8 fields, all usable, at least 44 px", fieldInfo.length === 8 && fieldInfo.every((f) => f.on && f.h >= 44 && f.w >= 44));
  check("fields show the extra for the first squirrel", fieldInfo.every((f) => /Erstes:/.test(f.t)));
  check("End turn is disabled before a squirrel is out", await page.isDisabled("#fv-end"));
  const sizes = await page.evaluate(() => Array.from(document.querySelectorAll(".fv-actions button")).map((b) => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
  check("action buttons at least 44 px " + JSON.stringify(sizes), sizes.length === 2 && sizes.every(([w, h]) => w >= 44 && h >= 44));

  // A card selected before placing says: first a squirrel.
  await page.tap("#fv-hand .fv-card");
  check("before placing, Build is off and the hint says so", (await page.isDisabled("#fv-build")) && /zuerst ein Eichhörnchen/.test(await page.textContent("#fv-info")));

  // Deterministic turn: Clay Bank first (3 clay), then build the Bakery.
  await page.evaluate(() => {
    const s = AppStateFv.state;
    s.players[0].res = { c: 0, s: 0, f: 1 };
    s.players[0].hand = ["bakery", "hedgehog", "bear", "stag"];
    AppStateFv.sel = null; renderFv();
  });
  await page.tap('.fv-field[data-field="0"]');
  const afterPlace = await page.evaluate(() => ({ phase: AppStateFv.state.phase, c: AppStateFv.state.players[0].res.c, info: document.getElementById("board-info").textContent, taken: document.querySelector('.fv-field[data-field="0"]').textContent }));
  check("first squirrel on the Clay Bank: 3 clay, build phase " + JSON.stringify(afterPlace), afterPlace.phase === "build" && afterPlace.c === 3);
  check("the used field no longer shows its extra", !/Erstes:/.test(afterPlace.taken));
  check("End turn is enabled in the build phase", !(await page.isDisabled("#fv-end")));
  await page.tap('#fv-hand .fv-card[data-index="0"]');
  await page.tap("#fv-build");
  const built = await page.evaluate(() => ({ v: AppStateFv.state.players[0].village.map((x) => x.id), log: document.getElementById("fv-log").textContent, card: document.querySelector("#fv-hand .fv-card") ? document.querySelector("#fv-hand .fv-card").textContent : "" }));
  check("the Bakery is built " + JSON.stringify(built.v), built.v.length === 1 && built.v[0] === "bakery");
  check("hand cards name their habitat: " + built.card, /Lebensraum:/.test(built.card));
  await waitHuman();
  check("the computer has moved", await page.evaluate(() => AppStateFv.state.log.some((e) => e.p === 1)));

  // Save and reload in the middle of the game.
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(500);
  check("save resumes on reload", await page.evaluate(() => !!AppStateFv.state && AppStateFv.state.rules === 3 && AppStateFv.state.players[0].village.length === 1));
  await waitHuman();

  // Play the game to its end (the human side plays like the computer).
  for (let i = 0; i < 80; i++) {
    const over = await page.evaluate(() => {
      if (AppStateFv.gameOver) return true;
      if (AppStateFv.state.current === 0 && !AppStateFv.busy) doFv(ForestVillageCore.chooseAction(AppStateFv.state, "medium"));
      return AppStateFv.gameOver;
    });
    if (over) break;
    await waitHuman();
  }
  const end = await page.evaluate((k) => ({ over: AppStateFv.gameOver, season: ForestVillageCore.season(AppStateFv.state), res: document.getElementById("game-result").textContent, saved: localStorage.getItem(k) }), KEY);
  check("the game ends after winter with a result " + JSON.stringify(end), end.over && end.season === "winter" && /Punkte/.test(end.res));
  check("the save is cleared after the end", !end.saved);
  const overflowGame = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("no horizontal scrolling at 360 px (game)", overflowGame <= 0);

  // Old saves: rules 2 under the current key, rules 1 under the first key.
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate((k) => {
    const old = { deck: [], discard: [], meadow: ["bakery"], fields: [[], [], [], [], [], [], [], []], task: "pairs", current: 0, turn: 3, over: false, log: [],
      players: [{ res: { c: 1, s: 0, f: 0 }, hand: ["owl"], village: [], workers: 2, placed: 1, placementsSinceProduction: 1, season: 0, passed: false, turns: 1 },
        { res: { c: 0, s: 0, f: 0 }, hand: [], village: [], workers: 2, placed: 0, season: 0, passed: false, turns: 1 }] };
    localStorage.setItem(k, JSON.stringify({ mode: "vs-ai", level: "medium", state: old }));
    localStorage.setItem("einkchess_save_forestvillage", JSON.stringify({ state: { players: [] } }));
  }, KEY);
  await load(); await page.waitForTimeout(500);
  const legacy = await page.evaluate((k) => {
    const raw = JSON.parse(localStorage.getItem(k) || "null");
    const s = AppStateFv.state;
    return { stateOk: !s || s.rules === 3, savedOk: !raw || (raw.state && raw.state.rules === 3), first: localStorage.getItem("einkchess_save_forestvillage"), info: document.getElementById("board-info").textContent };
  }, KEY);
  check("old saves are dropped silently " + JSON.stringify(legacy), legacy.stateOk && legacy.savedOk && legacy.first === null);

  // A save of rules 3 from before the own names (key `meadow`, v273) is dropped too.
  await page.evaluate((k) => {
    const s = ForestVillageCore.createGame(2);
    s.meadow = s.clearing; delete s.clearing; s.turn = 7;
    localStorage.setItem(k, JSON.stringify({ mode: "vs-ai", level: "medium", state: s }));
  }, KEY);
  await load(); await page.waitForTimeout(500);
  // The page may start a fresh game on its own; the old one must be gone.
  const v273 = await page.evaluate((k) => {
    const s = AppStateFv.state, raw = JSON.parse(localStorage.getItem(k) || "null");
    const fresh = (x) => !x || (Array.isArray(x.clearing) && !("meadow" in x) && x.turn !== 7);
    return { state: fresh(s), saved: !raw || fresh(raw.state), title: document.querySelector('[data-i18n="fv_clearing_title"]').textContent };
  }, KEY);
  check("a v273 save with meadow is dropped silently " + JSON.stringify(v273), v273.state && v273.saved && /Senke/.test(v273.title));

  // Rules page in German.
  await page.goto(BASE + "forestvillage-rules.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(500);
  const rules = await page.evaluate(() => ({ text: document.body.textContent, over: document.documentElement.scrollWidth - innerWidth }));
  check("rules page names home ranges and habitats", /Revier/.test(rules.text) && /Lebensr/.test(rules.text) && !/Winterende/.test(rules.text));
  check("no horizontal scrolling at 360 px (rules)", rules.over <= 0);
  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== FOREST VILLAGE UI: 360 px, turn flow, build, computer, full game, save/load, old saves, rules page, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
