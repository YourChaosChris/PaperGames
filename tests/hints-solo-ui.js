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
  {
    // Task 220: on a 384 x 752 phone the frame must be thick, solid, have a
    // size and lie in the visible part - for a column move, for the stock,
    // and with no move left a clear line instead.
    const phone = await browser.newContext({ viewport: { width: 384, height: 752 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
      userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36" });
    const p = await phone.newPage();
    p.on("pageerror", (e) => errors.push("klondike phone: " + e.message));
    await p.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "en"); } catch (e) { /* ignore */ } });
    await p.goto(BASE + "klondike.html");
    await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector("#start-klondike-game").click());
    await p.waitForTimeout(300);
    const setState = (tableau, stock) => p.evaluate(([tab, stk]) => {
      // "9H" is a face-up nine of hearts, "-5S" a face-down five of spades.
      const c = (s) => ({ rank: parseInt(s.replace("-", ""), 10), suit: s.slice(-1), faceUp: s[0] !== "-" });
      AppStateKlondike.state = { tableau: tab.map((col) => col.map(c)),
        foundations: { S: 0, H: 0, D: 0, C: 0 }, stock: stk.map((s) => c("-" + s)), waste: [] };
      AppStateKlondike.selected = null; AppStateKlondike.hint = null; AppStateKlondike.gameOver = false;
      updateKlondikeBoard();
    }, [tableau, stock]);
    const frames = () => p.evaluate(() => [...document.querySelectorAll(".klondike-hint")].map((e) => {
      const b = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return { w: b.width, h: b.height, inView: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight,
        style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor, stock: e.classList.contains("klondike-stock") };
    }));
    const visible = (f) => f.w > 0 && f.h > 0 && f.inView && f.style === "solid" && f.width >= 4 && /^rgb\((\d+), \1, \1\)$/.test(f.color) && parseInt(f.color.slice(4), 10) < 40;
    // 9H 8S 7H lie on a face-down card in column 1 and go onto the 10C.
    await setState([["13S"], ["-5S", "9H", "8S", "7H"], ["-2D", "10C"], ["-3C", "4C"], ["-6S", "12H"], ["11D"], ["-3H", "-1S", "5D"]], ["2S"]);
    await p.tap("#klondike-hint-button");
    let f = await frames();
    check("klondike phone: card and place framed (" + JSON.stringify(f) + ")", f.length === 2 && f.every(visible));
    check("klondike phone: cards on the hinted one carry the frame on",
      (await p.evaluate(() => document.querySelectorAll(".klondike-hint-run").length)) === 2);
    await setState([["2S"], ["2H"], ["2D"], ["2C"], ["4S"], ["4C"], ["6S"]], ["1S", "1H"]);
    await p.tap("#klondike-hint-button");
    f = await frames();
    check("klondike phone: only the stock framed (" + JSON.stringify(f) + ")", f.length === 1 && f[0].stock && visible(f[0]));
    check("klondike phone: draw line (" + (await info(p)) + ")", /^Hint: no good move/.test(await info(p)));
    await setState([["2S"], ["2H"], ["2D"], ["2C"], ["4S"], ["4C"], ["6S"]], []);
    await p.tap("#klondike-hint-button");
    check("klondike phone: no move, no frame", (await frames()).length === 0);
    check("klondike phone: no move, clear line (" + (await info(p)) + ")", (await info(p)).length > 5 && !/^Hint:/.test(await info(p)));
    await phone.close();
  }
  {
    const p = await open("pyramidsolitaire", "#start-pyramidsolitaire-game");
    await p.tap("#pyramidsolitaire-hint-button");
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelectorAll(".pyramidsolitaire-hint").length);
    check("pyramid: hint frames something (" + n + ")", n >= 1);
    check("pyramid: line says so (" + (await info(p)) + ")", /^Hint: (remove the marked|no good move)/.test(await info(p)));
    await p.close();
  }
  {
    const p = await open("spidersolitaire", "#start-spidersolitaire-game");
    await p.tap("#spider-hint-button");
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelectorAll(".spider-hint").length);
    check("spider: hint frames something (" + n + ")", n >= 1);
    check("spider: line says so (" + (await info(p)) + ")", /^Hint: (move the marked card|no good move)/.test(await info(p)));
    await p.close();
  }
  {
    const p = await open("admiralsgrid", "#start-admiralsgrid-game");
    await p.evaluate(() => { document.getElementById("fb-random-btn").click(); });
    await p.waitForTimeout(200);
    await p.evaluate(() => { document.getElementById("fb-start-battle-btn").click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { document.getElementById("fb-hint-btn").click(); });
    await p.waitForTimeout(300);
    const n = await p.evaluate(() => document.querySelectorAll("#fb-enemy-grid .fb-hint").length);
    check("admiralsgrid: hint frames one cell (" + n + ")", n === 1);
    check("admiralsgrid: line says so (" + (await info(p)) + ")", /^Hint: shoot at the marked cell/.test(await info(p)));
    await p.close();
  }
  check("no page error (" + errors.join(" | ") + ")", errors.length === 0);
  await browser.close();
  if (fails.length) { console.log("FAIL hints-solo-ui: " + fails.length + " problem(s)"); process.exit(1); }
  console.log("OK hints-solo-ui: Mahjong, Peg Solitaire, Minesweeper, Klondike, Pyramid, Spider and Admirals Grid hint buttons");
})();
