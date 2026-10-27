#!/usr/bin/env node
// Devilish Seven UI: new rules, German page, 360 x 640, storage compatibility.
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
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  const load = () => page.goto(BASE + "teufelsieben.html?lang=de", { waitUntil: "load" });
  const waitHuman = () => page.waitForFunction(() => AppStateTS.state && (AppStateTS.state.phase === "roundover" || AppStateTS.state.phase === "over" || (!AppStateTS.state.computer[AppStateTS.state.current] && AppStateTS.state.phase === "turn")), null, { timeout: 20000 });
  await load(); await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.removeItem("einkchess_save_teufelsieben"));
  if (!(await page.isVisible("#start-ts-game"))) await page.tap("#menu-toggle");
  await page.selectOption("#ts-players", "3"); await page.selectOption("#ts-computers", "1");
  await page.selectOption("#ts-target", "90"); await page.tap("#start-ts-game"); await waitHuman();
  check("starts with two people and one computer", await page.evaluate(() => AppStateTS.state.n === 3 && AppStateTS.state.computer.filter(Boolean).length === 1));
  check("default target is 90", await page.evaluate(() => document.querySelector("#ts-target option:checked").value === "90"));
  check("stop disabled before first card", await page.isDisabled("#ts-stop"));
  const sizes = await page.evaluate(() => Array.from(document.querySelectorAll("#ts-actions button")).map((b) => { const r = b.getBoundingClientRect(); return [r.width, r.height]; }));
  check("all action buttons at least 44 px", sizes.every(([w,h]) => w >= 44 && h >= 44));
  await page.tap("#ts-draw"); await page.waitForFunction(() => AppStateTS.state.hands[AppStateTS.state.current].drawn > 0 || AppStateTS.state.phase !== "turn");
  await waitHuman();
  const firstDraw = await page.evaluate(() => AppStateTS.state.hands[AppStateTS.state.current].drawn > 0);
  if (firstDraw) await page.tap("#ts-stop");
  await page.waitForTimeout(1000);
  check("turn passes to the next player", await page.evaluate(() => AppStateTS.state.round === 1 && (AppStateTS.state.current !== 0 || AppStateTS.state.phase !== "turn")));
  for (let i=0; i<12; i++) {
    await waitHuman();
    const phase = await page.evaluate(() => AppStateTS.state.phase);
    if (phase === "roundover" || phase === "over") break;
    const drawn = await page.evaluate(() => AppStateTS.state.hands[AppStateTS.state.current].drawn);
    if (!drawn) await page.tap("#ts-draw");
    await waitHuman();
    if (await page.evaluate(() => AppStateTS.state.phase === "turn" && !AppStateTS.state.computer[AppStateTS.state.current])) await page.tap("#ts-stop");
  }
  await page.waitForFunction(() => AppStateTS.state.phase === "roundover" || AppStateTS.state.phase === "over", null, { timeout: 15000 });
  check("computer takes a paced turn", await page.evaluate(() => AppStateTS.state.hands[2].drawn > 0 || ["stop", "bust"].includes(AppStateTS.state.hands[2].status)));
  check("round ends and Next round is visible", await page.evaluate(() => AppStateTS.state.phase === "roundover" && !document.getElementById("ts-next").closest(".hidden")));
  if (await page.evaluate(() => AppStateTS.state.phase === "roundover")) {
    const r = await page.evaluate(() => { const b = document.getElementById("ts-next").getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; });
    check("Next round button at least 44 px " + JSON.stringify(r), r[0] >= 44 && r[1] >= 44);
  }
  if (await page.evaluate(() => AppStateTS.state.phase === "roundover")) { await page.tap("#ts-next"); check("next round starts", await page.evaluate(() => AppStateTS.state.round === 2 && AppStateTS.state.phase === "turn")); }
  // Deterministic duplicate-number bust.
  await page.evaluate(() => {
    const s = TeufelSiebenCore.newGame({ players: 2, computer: [false,false], target: 120 }, TeufelSiebenCore.makeRng(4));
    s.deck = [4,4]; s.discard = []; s.turnsLeft = [0,1]; s.current = 0; s.hands.forEach((h) => { h.status = "wait"; }); s.hands[0].status = "in";
    AppStateTS.state = s; AppStateTS.generation++; renderTS();
  });
  await page.tap("#ts-draw"); await page.tap("#ts-draw");
  check("duplicate number busts", await page.evaluate(() => AppStateTS.state.hands[0].status === "bust"));
  // Game end presentation and cleared save.
  await page.evaluate(() => { const s = AppStateTS.state; s.phase = "over"; s.totals = [91, 80]; s.winners = [0]; s.roundPoints = [10, 0]; afterTS(); });
  check("game end shows result", (await page.textContent("#game-result")).includes("gewinnt"));
  // Save, reload, resume.
  await page.evaluate(() => startTS()); await waitHuman();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("einkchess_save_teufelsieben")));
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(500);
  check("save resumes on reload", await page.evaluate(() => !!AppStateTS.state && AppStateTS.state.rules === 2));
  // Legacy save without rules is silently cleared and the start screen remains.
  // Task 133: the cards "Wild Chain" (mode extreme) with the targets 250/500.
  if (!(await page.isVisible("#ts-mode"))) await page.tap("#menu-toggle");
  await page.selectOption("#ts-mode", "extreme");
  const targets = await page.evaluate(() => Array.from(document.querySelectorAll("#ts-target option")).filter((o) => !o.disabled).map((o) => o.value).join(","));
  check("extreme offers 250 and 500 only: " + targets, targets === "250,500");
  check("extreme target defaults to 250", await page.evaluate(() => document.getElementById("ts-target").value === "250"));
  await page.selectOption("#ts-players", "2"); await page.selectOption("#ts-computers", "1");
  await page.tap("#start-ts-game"); await waitHuman();
  check("extreme game started", await page.evaluate(() => AppStateTS.state.mode === "extreme" && AppStateTS.state.target === 250 && AppStateTS.state.deck.length + AppStateTS.state.discard.length === 78));
  await page.evaluate(() => {
    const s = AppStateTS.state;
    s.deck = ["star", 13, 14, 15, "link"].concat(s.deck.filter((c) => ["star", "link"].indexOf(c) === -1 && [13, 14, 15].indexOf(c) === -1));
    s.current = 0; s.turnsLeft = [0, 1]; s.hands.forEach((h) => { h.status = "wait"; h.numbers = []; h.drawn = 0; }); s.hands[0].status = "in";
    renderTS();
  });
  for (let k = 0; k < 5; k++) await page.tap("#ts-draw");
  const ext = await page.evaluate(() => ({ stars: AppStateTS.state.hands[0].stars, links: AppStateTS.state.hands[0].links, special: document.querySelectorAll("#ts-rows .ts-card-special").length, meta: document.getElementById("game-meta").textContent, rowH: Math.round(document.querySelector("#ts-rows .ts-player").getBoundingClientRect().height) }));
  check("extreme cards shown " + JSON.stringify(ext), ext.stars === 1 && ext.links === 1 && ext.special >= 2 && /Wilde Kette/.test(ext.meta));
  await page.reload({ waitUntil: "load" }); await page.waitForTimeout(500);
  check("extreme game saved and loaded", await page.evaluate(() => !!AppStateTS.state && AppStateTS.state.mode === "extreme" && AppStateTS.state.hands[0].stars === 1));
  check("no sideways scroll in extreme", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 0));
  // Set from another page: the game page saves its own state when it is left.
  const legacyState = await page.evaluate(() => { const x = TeufelSiebenCore.newGame({ players: 2 }); delete x.rules; return JSON.stringify({ state: x }); });
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate((v) => localStorage.setItem("einkchess_save_teufelsieben", v), legacyState);
  await load(); await page.waitForTimeout(400);
  // The old save is dropped; like every game page, a fresh game starts directly.
  const legacy = await page.evaluate(() => { const s = AppStateTS.state; const raw = JSON.parse(localStorage.getItem("einkchess_save_teufelsieben") || "null"); return { fresh: !!s && s.rules === 2 && s.round === 1 && s.seq <= 1, saved: !!raw && !!raw.state && raw.state.rules === 2 }; });
  check("old save dropped, a fresh game with the new rules " + JSON.stringify(legacy), legacy.fresh && legacy.saved);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("no horizontal scrolling at 360 px", overflow <= 0);
  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close(); fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== DEVILISH SEVEN UI: 360 px rules, round flow, bust, save/load, legacy save, Wild Chain (extreme) cards, targets, save/load, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
