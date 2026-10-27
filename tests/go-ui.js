#!/usr/bin/env node
// Go UI (task 160): German page at 360 x 640. Board size and colour are
// visible under the board right after the direct start; buttons at least
// 44 px; White lets the computer (Black) move first; a choice applies at
// once on an empty board, later only with New game; Random draws a colour;
// the choice and the game survive a reload; an old save (v273) still loads;
// 2 players hide the colour and New game stays a 2-player game; the rules
// page names the choice; no horizontal scrolling, no console errors.
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
  // "Start a new game?" over a running game (confirm-actions.js): yes.
  page.on("dialog", (d) => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {} });
  const load = async () => { await page.goto(BASE + "go.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(700); };
  const pts = () => page.evaluate(() => document.querySelectorAll("#go-grid .go-point").length);
  const state = () => page.evaluate(() => ({ size: AppStateGo.size, human: AppStateGo.humanColor, mode: AppStateGo.mode, moves: AppStateGo.moveCount, turn: AppStateGo.turn, over: AppStateGo.gameOver }));
  const pressed = () => page.evaluate(() => Array.from(document.querySelectorAll("#go-setup .go-pick[aria-pressed=true]")).map((b) => b.dataset.size || b.dataset.color));
  const waitHuman = () => page.waitForFunction(() => AppStateGo.mode !== "offline-ai" || AppStateGo.gameOver || AppStateGo.turn === AppStateGo.humanColor, null, { timeout: 30000 });

  // First visit: the game starts at once, the choice is visible under the board.
  await load();
  const first = await page.evaluate(() => {
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== "none"; };
    const picks = Array.from(document.querySelectorAll("#go-setup .go-pick"));
    return {
      setup: vis(document.getElementById("go-setup")), color: vis(document.getElementById("go-color-row")),
      picks: picks.length, small: picks.filter((b) => { const r = b.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).length,
      title: document.querySelector("#go-setup .go-setup-title").textContent, note: document.querySelector("#go-setup .go-setup-note").textContent,
      over: document.documentElement.scrollWidth - innerWidth
    };
  });
  check("setup visible with 6 buttons of at least 44 px " + JSON.stringify(first), first.setup && first.color && first.picks === 6 && first.small === 0);
  check("setup in German: " + first.title + " / " + first.note, /Brettgröße/.test(first.title) && /Schwarz zieht zuerst/.test(first.note));
  check("no horizontal scrolling at 360 px", first.over <= 0);
  check("first game 9 x 9 with Black: " + JSON.stringify(await state()) + " " + (await pressed()), (await pts()) === 81 && (await state()).human === "b" && (await pressed()).join() === "9,b");

  // White on the empty board: new game at once, the computer (Black) moves first.
  await page.tap('#go-setup .go-pick[data-color="w"]');
  await waitHuman();
  let st = await state();
  check("White: the computer opens as Black " + JSON.stringify(st), st.human === "w" && st.mode === "offline-ai" && st.moves === 1 && st.turn === "w");
  check("one black stone on the board", await page.evaluate(() => document.querySelectorAll("#go-grid .go-stone-black").length === 1 && document.querySelectorAll("#go-grid .go-stone-white").length === 0));

  // With a stone on the board, 13 x 13 only counts for the next game.
  await page.tap('#go-setup .go-pick[data-size="13"]');
  st = await state();
  check("13 x 13 waits for New game " + JSON.stringify(st), st.size === 9 && (await pts()) === 81 && (await page.isVisible("#go-setup-next")));
  check("hint in German", /nächste Spiel/.test(await page.textContent("#go-setup-next")));
  await page.tap("#direct-new-game-button");
  await waitHuman();
  st = await state();
  check("New game: 13 x 13, still White " + JSON.stringify(st), st.size === 13 && (await pts()) === 169 && st.human === "w");

  // Random: the next new game draws a colour.
  await page.tap('#go-setup .go-pick[data-color="random"]');
  const seen = new Set();
  for (let i = 0; i < 12 && seen.size < 2; i++) {
    await page.tap("#direct-new-game-button");
    await waitHuman();
    seen.add((await state()).human);
  }
  check("Random gives both colours " + Array.from(seen).join(), seen.size === 2);
  check("Random is pressed and saved", (await pressed()).join() === "13,random" && (await page.evaluate(() => JSON.parse(localStorage.getItem("papergames_go_setup")).color)) === "random");

  // Reload: the game and the choice come back.
  st = await state();
  await load();
  const st2 = await state();
  check("reload keeps size and colour " + JSON.stringify([st, st2]), st2.size === 13 && st2.human === st.human && (await pts()) === 169 && (await pressed()).join() === "13,random");

  // An old save (v273 format) on 19 x 19 as White still loads.
  await page.evaluate(() => {
    const board = Array.from({ length: 19 }, () => Array(19).fill(null));
    board[3][3] = "b";
    localStorage.setItem("einkchess_save_go", JSON.stringify({ mode: "offline-ai", size: 19, board, turn: "w", koPoint: null, lastMove: { r: 3, c: 3 }, humanColor: "w", aiLevel: 1, consecutivePasses: 0, moveCount: 1, captures: { b: 0, w: 0 }, boardHistory: [], undoStack: [] }));
  });
  await load();
  st = await state();
  check("old save loads " + JSON.stringify(st), st.size === 19 && st.human === "w" && st.moves === 1 && (await pts()) === 361);
  check("old save shows the next-game hint", await page.isVisible("#go-setup-next"));

  // Two players: no colour choice; New game stays a 2-player game.
  await page.tap("#menu-toggle");
  await page.tap("#mode-offline");
  st = await state();
  check("2 players: mode and size " + JSON.stringify(st), st.mode === "offline" && st.size === 13 && st.moves === 0);
  check("2 players: colour row hidden", !(await page.isVisible("#go-color-row")));
  await page.tap('#go-setup .go-pick[data-size="9"]');
  check("2 players: 9 x 9 at once on the empty board", (await state()).size === 9 && (await state()).mode === "offline" && (await pts()) === 81);
  await page.tap('#go-grid .go-point[data-row="4"][data-col="4"]');
  await page.tap("#direct-new-game-button");
  st = await state();
  check("2 players: New game keeps 2 players " + JSON.stringify(st), st.mode === "offline" && st.moves === 0);
  check("no horizontal scrolling at 360 px (game)", (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);

  // Rules page in German.
  await page.goto(BASE + "go-rules.html?lang=de", { waitUntil: "load" }); await page.waitForTimeout(500);
  const rules = await page.evaluate(() => ({ text: document.body.textContent, over: document.documentElement.scrollWidth - innerWidth }));
  check("rules page names board size and colour", /Brettgröße und Farbe/.test(rules.text) && /Zufall/.test(rules.text));
  check("no horizontal scrolling at 360 px (rules)", rules.over <= 0);
  check("no console or page errors: " + errors.join(" | "), errors.length === 0);
  await browser.close();
  fails.forEach((x) => console.log("FAIL " + x));
  console.log("=== GO UI: 360 px, size and colour under the board, White, Random, reload, old save, 2 players, rules page, " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
