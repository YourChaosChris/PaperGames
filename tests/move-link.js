#!/usr/bin/env node
// Move link (task 187): for each game that takes part, start a game for two
// players on one device, build the link from the saved game, open it in a
// second, empty browser and check that the same game is there. Also: broken,
// foreign, too long, tampered and computer-mode codes are refused, and the
// button and the message appear in German.
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || process.argv[2] || "http://localhost:8000/";
const WEB = "https://yourchaoschris.github.io/PaperGames/";
const fails = [];
const check = (name, ok) => { if (!ok) { fails.push(name); console.log("FAIL " + name); } };

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const newPage = async (url) => {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(url + ": " + e.message));
    page.on("dialog", (d) => { if (!page.__noAccept) d.accept(); });
    await page.goto(url);
    await page.waitForTimeout(500);
    return { ctx, page };
  };
  const slugs = await (async () => {
    const { ctx, page } = await newPage(BASE + "chess.html?lang=en");
    const l = await page.evaluate(() => window.MoveLink.SLUGS);
    await ctx.close();
    return l;
  })();
  check("27 games take part (" + slugs.length + ")", slugs.length === 27);
  let longest = 0;

  for (const slug of slugs) {
    const a = await newPage(BASE + slug + ".html?lang=en");
    const p = a.page;
    check(slug + ": button is there", (await p.$("#movelink-button")) !== null);
    // The game saves after a move; the test calls the game's own save
    // function instead of playing one (same data, same code).
    const saveFn = await p.evaluate(async (s) => {
      const src = await (await fetch(s === "chess" ? "app.js" : s + "-app.js")).text();
      const m = /function (save\w*Game)\(/.exec(src);
      return m ? m[1] : "";
    }, slug);
    check(slug + ": save function found (" + saveFn + ")", !!saveFn);
    await p.evaluate(() => document.getElementById("mode-offline").click());
    await p.waitForTimeout(250);
    await p.evaluate((n) => window[n](), saveFn);
    await p.waitForTimeout(100);
    const save = await p.evaluate((s) => window.localStorage.getItem("einkchess_save_" + s), slug);
    check(slug + ": game for two players is saved", !!save && JSON.parse(save).mode === "offline");
    if (!save) { await a.ctx.close(); continue; }
    const link = await p.evaluate(async (s) => window.MoveLink.makeLink(s, JSON.parse(window.localStorage.getItem("einkchess_save_" + s))), slug);
    check(slug + ": link is made", typeof link === "string" && link.indexOf(WEB + slug + ".html#zug=") === 0);
    if (typeof link !== "string") { await a.ctx.close(); continue; }
    longest = Math.max(longest, link.length);
    check(slug + ": link is short enough (" + link.length + ")", link.length < 12000);

    const b = await newPage(BASE + slug + ".html?lang=en#zug=" + link.split("#zug=")[1]);
    await b.page.waitForTimeout(1500);
    const got = await b.page.evaluate((s) => window.localStorage.getItem("einkchess_save_" + s), slug);
    const same = (() => {
      if (!got) return false;
      const x = JSON.parse(save), y = JSON.parse(got);
      return JSON.stringify(x.board) === JSON.stringify(y.board) && x.turn === y.turn && y.mode === "offline";
    })();
    check(slug + ": same game after opening the link", same);
    check(slug + ": address is clean after loading", !(await b.page.evaluate(() => location.hash)));
    const note = await b.page.evaluate(() => (document.getElementById("movelink-note") || {}).textContent || "");
    check(slug + ": message says it is your turn (" + note + ")", /It is your turn/.test(note));
    await b.ctx.close();
    await a.ctx.close();
  }
  console.log("longest link: " + longest + " characters");

  // refused codes (chess page)
  {
    const { ctx, page } = await newPage(BASE + "chess.html?lang=en");
    await page.evaluate(() => document.getElementById("mode-offline").click());
    await page.waitForTimeout(300);
    await page.evaluate(() => saveChessGame());
    const r = await page.evaluate(async () => {
      const M = window.MoveLink;
      const save = JSON.parse(window.localStorage.getItem("einkchess_save_chess"));
      const out = {};
      const tryCode = async (slug, code) => { try { await M.readCode(slug, code); return "accepted"; } catch (e) { return "refused"; } };
      const good = (await M.makeLink("chess", save)).split("#zug=")[1];
      out.good = await tryCode("chess", good);
      out.foreignGame = await tryCode("checkers", good);
      out.garbage = await tryCode("chess", "zAAAA");
      out.badChars = await tryCode("chess", "p<script>");
      out.empty = await tryCode("chess", "");
      out.tooLong = await tryCode("chess", "p" + "A".repeat(13000));
      out.vsComputer = await M.makeLink("chess", Object.assign({}, save, { mode: "offline-ai" }));
      out.finished = await M.makeLink("chess", Object.assign({}, save, { gameOver: true }));
      out.otherGame = await M.makeLink("backgammon", save);
      const tampered = await M.pack({ v: 1, g: "chess", s: Object.assign({}, save, { mode: "offline-ai" }) });
      out.tamperedMode = await tryCode("chess", tampered);
      const proto = await M.pack(JSON.parse('{"v":1,"g":"chess","s":{"mode":"offline","__proto__":{"x":1}}}'));
      out.proto = await tryCode("chess", proto);
      const notObj = await M.pack({ v: 1, g: "chess", s: [1, 2] });
      out.notObject = await tryCode("chess", notObj);
      const wrongVersion = await M.pack({ v: 2, g: "chess", s: save });
      out.wrongVersion = await tryCode("chess", wrongVersion);
      return out;
    });
    check("good code accepted", r.good === "accepted");
    for (const k of ["foreignGame", "garbage", "badChars", "empty", "tooLong", "tamperedMode", "proto", "notObject", "wrongVersion"]) check("refused: " + k, r[k] === "refused");
    check("computer mode makes no link", r.vsComputer === null);
    check("finished game makes no link", r.finished === null);
    check("game with chance makes no link", r.otherGame === null);
    await ctx.close();
  }

  // a broken link in the address: message, game stays usable, nothing saved
  {
    const { ctx, page } = await newPage(BASE + "checkers.html?lang=en#zug=pBROKEN");
    await page.waitForTimeout(1200);
    const note = await page.evaluate(() => (document.getElementById("movelink-note") || {}).textContent || "");
    check("broken link: message (" + note + ")", /cannot be used/.test(note));
    check("broken link: address cleaned", !(await page.evaluate(() => location.hash)));
    const kept = await page.evaluate(() => { const r = window.localStorage.getItem("einkchess_save_checkers"); return r ? JSON.parse(r).mode : "none"; });
    check("broken link: no game for two players saved (" + kept + ")", kept !== "offline");
    await ctx.close();
  }

  // pressing the button without a game for two players
  {
    const { ctx, page } = await newPage(BASE + "checkers.html?lang=en");
    await page.evaluate(() => document.getElementById("movelink-button").click());
    await page.waitForTimeout(300);
    const note = await page.evaluate(() => document.getElementById("movelink-note").textContent);
    check("no game: hint (" + note + ")", /for two players/.test(note));
    await ctx.close();
  }

  // German
  {
    const { ctx, page } = await newPage(BASE + "checkers.html?lang=de");
    await page.waitForTimeout(800);
    const label = await page.evaluate(() => document.getElementById("movelink-button").textContent);
    check("German button (" + label + ")", label === "Zug senden");
    await ctx.close();
  }

  // an existing running game is not replaced without asking
  {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
    const page = await ctx.newPage();
    let asked = 0, phase = "setup";
    page.on("dialog", async (d) => { if (phase === "setup") await d.accept(); else { asked++; await d.dismiss(); } });
    await page.goto(BASE + "checkers.html?lang=en");
    await page.waitForTimeout(500);
    await page.evaluate(() => document.getElementById("mode-offline").click());
    await page.waitForTimeout(250);
    const link = await page.evaluate(async () => {
      saveCheckersGame();
      const s = JSON.parse(window.localStorage.getItem("einkchess_save_checkers"));
      s.board = s.board.slice().reverse();
      s.moveCount = 3;
      return window.MoveLink.makeLink("checkers", s);
    });
    phase = "link";
    await page.goto(BASE + "checkers.html?lang=en#zug=" + link.split("#zug=")[1]);
    await page.waitForTimeout(1200);
    check("running different game: asked before replacing (" + asked + ")", asked === 1);
    const keep = await page.evaluate(() => JSON.parse(window.localStorage.getItem("einkchess_save_checkers")).moveCount);
    check("running different game: kept after saying no (" + keep + ")", keep === 0);
    await ctx.close();
  }

  await browser.close();
  check("no page errors (" + errors.slice(0, 3).join("; ") + ")", errors.length === 0);
  console.log(fails.length ? "move-link: " + fails.length + " FAIL" : "move-link: OK");
  process.exit(fails.length ? 1 : 0);
})();
