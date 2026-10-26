#!/usr/bin/env node
// Card Tactics UI (rules 2, task 151): German page at 360 x 640, open cards,
// tap flow, computer reply, crossing home and game end, save/load, legacy
// save from the first rules, 44 px targets, no sideways scrolling.
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
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); localStorage.removeItem("papergames_random_start"); } catch (e) {} });
  const load = () => page.goto(BASE + "cardtactics.html?lang=de", { waitUntil: "load" });
  await load(); await page.waitForTimeout(400);
  await page.evaluate(() => localStorage.removeItem("einkchess_save_cardtactics"));
  await load(); await page.waitForTimeout(400);

  // Start against the computer (easy), playing Black.
  if (!(await page.isVisible("#mode-offline-ai"))) await page.tap("#menu-toggle");
  await page.tap("#mode-offline-ai");
  await page.selectOption("#cardtactics-level-inline", "1");
  await page.check("input[name='cardtactics-color'][value='black']");
  await page.tap("#start-cardtactics-game");
  await page.waitForFunction(() => AppStateCardTactics.mode === "offline-ai" && AppStateCardTactics.state.rules === 2);
  const humanFirst = await page.evaluate(() => AppStateCardTactics.humanColor === AppStateCardTactics.turn);
  if (!humanFirst) await page.waitForFunction(() => AppStateCardTactics.turn === AppStateCardTactics.humanColor, null, { timeout: 15000 });
  check("42 squares", await page.locator("#cardtactics-board .cardtactics-square").count() === 42);
  check("three open cards and two next cards", await page.locator("#cardtactics-display button.cardtactics-card").count() === 3
    && await page.locator("#cardtactics-next .cardtactics-card").count() === 2);
  const sizes = await page.evaluate(() => Array.from(document.querySelectorAll("#cardtactics-display button, #cardtactics-board .cardtactics-square, #undo-btn, #resign-button"))
    .filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  check("cards, squares and buttons at least 44 px " + JSON.stringify(sizes.filter(([w, h]) => w < 44 || h < 44)), sizes.length > 40 && sizes.every(([w, h]) => w >= 44 && h >= 44));
  check("German texts", (await page.textContent("#cardtactics-home-line")).includes("Im Ziel") && (await page.textContent(".cardtactics-cards-head")).includes("Offene Karten"));

  // Human move by tapping: card, stone, target.
  const plan = await page.evaluate(() => {
    const m = CardTacticsCore.getLegalMoves(AppStateCardTactics.state, AppStateCardTactics.humanColor)[0];
    return { slot: AppStateCardTactics.state.display.indexOf(m.card), from: m.from, to: m.to, card: m.card };
  });
  await page.locator("#cardtactics-display button.cardtactics-card").nth(plan.slot).tap();
  check("card selected", await page.evaluate((c) => AppStateCardTactics.selectedCard === c, plan.card));
  await page.tap(`#cardtactics-board .cardtactics-square[data-row="${plan.from[0]}"][data-col="${plan.from[1]}"]`);
  check("targets marked", await page.locator(".cardtactics-square-movable").count() > 0);
  await page.tap(`#cardtactics-board .cardtactics-square[data-row="${plan.to[0]}"][data-col="${plan.to[1]}"]`);
  check("move applied and card cycled", await page.evaluate((c) => AppStateCardTactics.state.queue[AppStateCardTactics.state.queue.length - 1] === c && AppStateCardTactics.state.ply >= 1, plan.card));
  await page.waitForFunction(() => AppStateCardTactics.turn === AppStateCardTactics.humanColor && AppStateCardTactics.moveCount >= 2, null, { timeout: 15000 });
  check("computer replied", await page.evaluate(() => AppStateCardTactics.moveCount >= 2));

  // Save and reload resumes the game.
  const plyBefore = await page.evaluate(() => AppStateCardTactics.state.ply);
  await load(); await page.waitForTimeout(500);
  check("save resumes on reload", await page.evaluate((p) => AppStateCardTactics.state.rules === 2 && AppStateCardTactics.state.ply === p && !document.getElementById("board-container").classList.contains("hidden"), plyBefore));

  // Crossing home and winning (two players on one device).
  await page.evaluate(() => {
    const C = CardTacticsCore;
    const s = C.createInitialState(C.makeRng(5));
    s.board = s.board.map((row) => row.map(() => null));
    s.board[1][2] = { color: "black" }; s.board[3][4] = { color: "black" };
    s.board[0][2] = { color: "white" }; s.board[6][0] = { color: "white" }; s.board[6][5] = { color: "white" };
    s.display = ["arrow", "fork", "bow"]; s.queue = C.CARD_IDS.filter((id) => !s.display.includes(id));
    s.home.black = 1; s.ply = 10;
    AppStateCardTactics.mode = "offline"; AppStateCardTactics.state = s; AppStateCardTactics.turn = "black";
    AppStateCardTactics.gameOver = false; updateCardTacticsBoard(); updateCardTacticsCards();
  });
  await page.locator("#cardtactics-display button.cardtactics-card").nth(0).tap();
  await page.tap('#cardtactics-board .cardtactics-square[data-row="1"][data-col="2"]');
  await page.tap('#cardtactics-board .cardtactics-square[data-row="0"][data-col="2"]');
  check("second stone home wins", await page.evaluate(() => AppStateCardTactics.gameOver && AppStateCardTactics.state.winner === "black" && AppStateCardTactics.state.home.black === 2));
  check("result in German", (await page.textContent("#game-result")).includes("gewinnt mit zwei Steinen im Ziel"));
  check("finished game clears the save", await page.evaluate(() => localStorage.getItem("einkchess_save_cardtactics") === null));
  await page.evaluate(() => window.ResultModal && window.ResultModal.hide());

  // Legacy save of the first rules: dropped silently, start screen remains.
  const legacy = JSON.stringify({ mode: "offline-ai", state: { board: [[null]], cards: { blue: ["wind", "wave"], red: ["stone", "flame"], neutral: "mist" }, currentPlayer: "blue", gameOver: false }, turn: "blue", humanColor: "blue", aiLevel: 2, moveCount: 3, undoStack: [] });
  await page.goto(BASE + "about.html", { waitUntil: "load" });
  await page.evaluate((v) => localStorage.setItem("einkchess_save_cardtactics", v), legacy);
  await load(); await page.waitForTimeout(500);
  // Like every game page, a fresh game then starts directly (game-frame.js).
  const after = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("einkchess_save_cardtactics") || "null");
    return { fresh: AppStateCardTactics.state.rules === 2 && AppStateCardTactics.state.ply === 0, saved: !raw || (raw.rules === 2 && raw.state.rules === 2) };
  });
  check("legacy save dropped " + JSON.stringify(after), after.fresh && after.saved);

  // Two players on one device start and the board fits.
  if (!(await page.isVisible("#mode-offline"))) await page.tap("#menu-toggle");
  page.once("dialog", (d) => d.accept()); // "Start a new game?" (confirm-actions.js)
  await page.tap("#mode-offline");
  await page.waitForTimeout(200);
  const two = await page.evaluate(() => [AppStateCardTactics.mode, AppStateCardTactics.turn, AppStateCardTactics.state.ply]);
  check("two-player game starts with Black " + JSON.stringify(two), two[0] === "offline" && two[1] === "black" && two[2] === 0);
  check("opening hint shown", (await page.textContent("#board-info")).includes("höchstens eine Reihe"));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("no horizontal scrolling at 360 px", overflow <= 0);
  await page.goto(BASE + "cardtactics-rules.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(300);
  check("rules page in German", (await page.textContent("main")).includes("Warteschlange"));
  check("no horizontal scrolling on the rules page", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0);
  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close(); fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== CARD TACTICS UI: 360 px, open cards, tap flow, computer reply, home win, save/load, legacy save, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
