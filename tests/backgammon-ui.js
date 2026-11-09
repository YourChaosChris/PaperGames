#!/usr/bin/env node
// Backgammon in the browser (task 191, a player's report from a 384 px phone):
//   - starting position at 360, 384, 600 and 800 px: every checker of the
//     points with 5 checkers lies inside its point (before, the 5th was cut
//     off at the bar), each side shows all 15 (the 5-stacks carry the
//     number 5), no sideways scrolling;
//   - a new visitor sees the starting position and no saved-game notice;
//   - a saved game on the computer's turn: after a reload the notice
//     "saved game" with Continue playing / New game shows, the computer
//     waits; Continue lets it play, New game starts afresh;
//   - no page error.
// Run: node tests/backgammon-ui.js   (needs the server and Playwright)
const { chromium } = require("playwright");
const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const fails = [];
const check = (name, ok, info) => { if (!ok) fails.push(name + (info !== undefined ? ": " + JSON.stringify(info) : "")); };

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const width of [360, 384, 600, 800]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: "block" });
    await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(width + ": " + e.message));
    await page.goto(BASE + "backgammon.html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const out = { cut: [], shown: { b: 0, w: 0 }, counts: [], notice: !document.getElementById("backgammon-saved-notice").classList.contains("hidden") };
      document.querySelectorAll(".bg-point").forEach((pt) => {
        const box = pt.getBoundingClientRect();
        const cs = pt.querySelectorAll(".bg-checker");
        cs.forEach((c) => {
          const b = c.getBoundingClientRect();
          if (b.top < box.top - 0.5 || b.bottom > box.bottom + 0.5) out.cut.push(pt.dataset.point);
        });
        const n = pt.querySelector(".bg-checker-count");
        if (cs.length) out.shown[cs[0].classList.contains("bg-checker-black") ? "b" : "w"] += n ? parseInt(n.textContent, 10) : cs.length;
        if (n) out.counts.push(pt.dataset.point + "=" + n.textContent);
      });
      out.wide = document.documentElement.scrollWidth - innerWidth;
      return out;
    });
    check(width + " px: no checker cut off", r.cut.length === 0, r.cut);
    check(width + " px: 15 checkers per side", r.shown.b === 15 && r.shown.w === 15, r.shown);
    check(width + " px: the four 5-stacks carry their number", r.counts.length === 4 && r.counts.every((c) => /=5$/.test(c)), r.counts);
    check(width + " px: no sideways scrolling", r.wide <= 0, r.wide);
    check(width + " px: a new visitor sees no saved-game notice", !r.notice);
    await ctx.close();
  }

  // A saved game on the computer's turn.
  const ctx = await browser.newContext({ viewport: { width: 384, height: 900 }, serviceWorkers: "block" });
  await ctx.addInitScript(() => { try { localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) { /* ignore */ } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("saved: " + e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "backgammon.html?lang=de", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    AppStateBackgammon.mode = "offline-ai";
    AppStateBackgammon.humanColor = "w";
    AppStateBackgammon.aiLevel = 1;
    AppStateBackgammon.turn = "b";
    AppStateBackgammon.dice = [];
    AppStateBackgammon.moveCount = 4;
    saveBackgammonGame();
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => ({
    notice: !document.getElementById("backgammon-saved-notice").classList.contains("hidden"),
    text: document.getElementById("backgammon-saved-notice").textContent,
    turn: AppStateBackgammon.turn,
    moves: AppStateBackgammon.moveCount
  }));
  check("saved game: notice shows", s.notice, s);
  check("saved game: notice in German", /gespeichert/i.test(s.text) && /Weiterspielen/.test(s.text), s.text);
  check("saved game: the computer waits", s.turn === "b" && s.moves === 4, s);
  await page.click("#backgammon-saved-continue");
  await page.waitForTimeout(2500);
  const c = await page.evaluate(() => ({ notice: !document.getElementById("backgammon-saved-notice").classList.contains("hidden"), turn: AppStateBackgammon.turn, moves: AppStateBackgammon.moveCount }));
  check("continue: notice gone, the computer played", !c.notice && (c.turn === "w" || c.moves > 4), c);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(800);
  check("reload: notice again", await page.evaluate(() => !document.getElementById("backgammon-saved-notice").classList.contains("hidden")));
  await page.click("#backgammon-saved-new");
  await page.waitForTimeout(800);
  const n = await page.evaluate(() => ({ notice: !document.getElementById("backgammon-saved-notice").classList.contains("hidden"), moves: AppStateBackgammon.moveCount }));
  check("new game: notice gone, fresh game", !n.notice && n.moves <= 1, n);
  await ctx.close();

  check("no page errors", errors.length === 0, errors);
  await browser.close();
  if (fails.length) { console.error("FAIL (" + fails.length + "):\n  " + fails.join("\n  ")); process.exit(1); }
  console.log("=== BACKGAMMON UI: stacks of 5 at 360/384/600/800 px, 15 per side, saved-game notice, 0 failure(s) ===");
})().catch((e) => { console.error(e); process.exit(1); });
