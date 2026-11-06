#!/usr/bin/env node
// Yut in the browser: the German page at 360 x 740 starts, a human turn
// can be played with taps (throw, throw choice, piece, target), the computer
// answers, nothing scrolls sideways, the language switch redraws the board,
// and a won game shows the result and counts in the statistics.
// BASE_URL from the environment or as --base URL.
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) fails.push(name); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "yut.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(500);
  if (!(await page.isVisible("#start-yut-game"))) await page.click("#menu-toggle");
  await page.selectOption("#yut-num-players", "2");
  await page.selectOption("#yut-level", "1");
  await page.click("#start-yut-game");
  await page.waitForTimeout(300);
  check("board drawn", (await page.$$("#yut-board circle")).length >= 29);
  check("German throw button", /Stäbe werfen/.test(await page.textContent("#yut-acts")));

  // Play the human side for a while; the computer answers by itself.
  let played = 0;
  for (let i = 0; i < 250 && played < 25; i++) {
    const thr = await page.$("#yut-acts button[data-a=throw]");
    if (thr) { await thr.click(); played++; await page.waitForTimeout(60); continue; }
    const g = await page.$("#yut-board g[data-from]");
    const w = await page.$("#yut-acts button[data-from='-1']");
    if (g) await g.click(); else if (w) await w.click(); else { await page.waitForTimeout(250); continue; }
    const m = await page.$("#yut-board g[data-mv]");
    if (m) { await m.click(); played++; }
  }
  check("human moves played", played >= 10);
  check("no sideways scrolling", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const pieces = await page.textContent("#yut-info");
  check("pieces line in German", /Figuren: A/.test(pieces));

  // Language switch redraws.
  await page.evaluate(() => I18n.setLang("ja"));
  await page.waitForTimeout(400);
  check("Japanese pieces line", /コマ/.test(await page.textContent("#yut-info")));
  await page.evaluate(() => I18n.setLang("de"));
  await page.waitForTimeout(300);

  // A won game: set up a last piece one step from home.
  await page.evaluate(() => {
    if (AppStateYut.timer) clearTimeout(AppStateYut.timer);
    AppStateYut.busy = false;
    const g = YutCore.createGame({ players: 2, piecesPerPlayer: 4 });
    g.pieces.forEach((pc) => { if (pc.player === 0) { pc.done = pc.id !== 0; pc.route = pc.id === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] : [1]; } });
    g.turn = 0; g.owed = 0; g.pending = [1];
    AppStateYut.g = g; AppStateYut.over = false; AppStateYut.from = null; AppStateYut.sel = 0;
    renderYut();
  });
  await page.click("#yut-board g[data-from]");
  await page.click("#yut-board g[data-mv]");
  await page.waitForTimeout(300);
  check("win shown", /A gewinnt/.test(await page.textContent("#game-result")));
  const stats = await page.evaluate(() => JSON.stringify(localStorage));
  check("statistics record", /yut/.test(stats));
  check("no script errors", errors.length === 0);
  if (errors.length) console.log(errors.join("\n"));
  await browser.close();
  if (fails.length) { console.log("FAIL: " + fails.join("; ")); process.exit(1); }
  console.log("yut-ui: ALL CHECKS PASS");
})();
