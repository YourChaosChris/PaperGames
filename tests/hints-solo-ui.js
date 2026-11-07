#!/usr/bin/env node
// Hint buttons of Mahjong, Peg Solitaire and Minesweeper in the browser
// (task 181), 360 x 640 with touch: start a game, press Hint, the board shows
// the hint (a framed tile / peg and hole / field) and the line says so; any
// tap on the board removes the frame again. German page text is checked too.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true });
  const errors = [];
  const open = async (slug, start, lang) => {
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(slug + ": " + e.message));
    await page.addInitScript((l) => { try { localStorage.setItem("einkchess_lang", l); } catch (e) { /* ignore */ } }, lang || "en");
    await page.goto(BASE + slug + ".html" + (lang ? "?lang=" + lang : ""));
    await page.waitForTimeout(500);
    await page.waitForSelector(start, { state: "attached" });
    await page.evaluate((s) => document.querySelector(s).click(), start);
    await page.waitForTimeout(300);
    return page;
  };
  const info = (page) => page.evaluate(() => document.getElementById("board-info").textContent.trim());

  {
    const p = await open("mahjong", "#start-mahjong-game");
    await p.tap("#mahjong-hint-button");
    const n = await p.evaluate(() => document.querySelectorAll(".mahjong-tile-hint").length);
    check("mahjong: hint frames two tiles (" + n + ")", n === 2);
    check("mahjong: line says so (" + (await info(p)) + ")", /^Hint: these two free tiles match\./.test(await info(p)));
    await p.tap(".mahjong-tile:not(.hidden)");
    check("mahjong: tap removes the frame", (await p.evaluate(() => document.querySelectorAll(".mahjong-tile-hint").length)) === 0);
    await p.close();
  }
  {
    const p = await open("pegsolitaire", "#start-pegsolitaire-game");
    await p.tap("#hint-btn");
    const n = await p.evaluate(() => document.querySelectorAll(".peg-square-hint").length);
    check("peg solitaire: hint frames the peg and the hole (" + n + ")", n === 2);
    check("peg solitaire: line says so (" + (await info(p)) + ")", /^Hint: jump the marked peg/.test(await info(p)));
    await p.close();
  }
  {
    const p = await open("minesweeper", "#start-minesweeper-game");
    await p.tap("#minesweeper-hint-button");
    check("minesweeper: before the first reveal there is no sure field (" + (await info(p)) + ")", /^No sure field/.test(await info(p)));
    await p.evaluate(() => document.querySelectorAll(".minesweeper-cell")[40].click());
    await p.waitForTimeout(300);
    await p.tap("#minesweeper-hint-button");
    const text = await info(p);
    check("minesweeper: hint line (" + text + ")", /^(Hint: the marked field|No sure field)/.test(text));
    if (/^Hint/.test(text)) check("minesweeper: one field framed", (await p.evaluate(() => document.querySelectorAll(".minesweeper-cell-hint").length)) === 1);
    await p.close();
  }
  {
    const p = await open("pegsolitaire", "#start-pegsolitaire-game", "de");
    await p.tap("#hint-btn");
    const t = await info(p);
    check("peg solitaire in German (" + t + ")", /^Hinweis: Springe mit dem markierten Stein/.test(t));
    await p.close();
  }
  {
    const p = await open("freecell", "#start-freecell-game");
    await p.tap("#freecell-hint-button");
    await p.waitForTimeout(500);
    const n = await p.evaluate(() => document.querySelectorAll(".freecell-hint").length);
    check("freecell: hint frames the card and the place (" + n + ")", n >= 1 && n <= 2);
    check("freecell: line says so (" + (await info(p)) + ")", /^Hint: move the marked card/.test(await info(p)));
    await p.tap("#freecell-hint-button");
    await p.tap(".freecell-column");
    check("freecell: tap removes the frame", (await p.evaluate(() => document.querySelectorAll(".freecell-hint").length)) === 0);
    await p.close();
  }
  {
    const p = await open("klondike", "#start-klondike-game");
    await p.tap("#klondike-hint-button");
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelectorAll(".klondike-hint").length);
    check("klondike: hint frames something (" + n + ")", n >= 1);
    check("klondike: line says so (" + (await info(p)) + ")", /^Hint: (move the marked card|no good move)/.test(await info(p)));
    await p.tap(".klondike-column");
    check("klondike: tap removes the frame", (await p.evaluate(() => document.querySelectorAll(".klondike-hint").length)) === 0);
    await p.close();
  }
  check("no page error (" + errors.join(" | ") + ")", errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL hints-solo-ui: " + fails.length + " problem(s)"); process.exit(1); }
  console.log("OK hints-solo-ui: Mahjong, Peg Solitaire, Minesweeper and Klondike hint buttons");
})();
