#!/usr/bin/env node
// Task 97: on every category page (games*.html) at 360 px, tap targets
// (links, buttons) must be at least 44 px high and, for the favourite
// star, 44 x 44 px; links inside running text are exempt. The kids page
// must list every kids game on one page.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const argBase = process.argv.indexOf("--base");
const BASE = (argBase > 0 && process.argv[argBase + 1]) || process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const pages = fs.readdirSync(ROOT).filter((f) => /^games(-[a-z]+)?\.html$/.test(f));

(async () => {
  const browser = await chromium.launch();
  const bad = [];
  let checked = 0;
  for (const name of pages) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(BASE + name + "?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const res = await page.evaluate(() => {
      const out = { n: 0, bad: [] };
      document.querySelectorAll("main a, main button").forEach((el) => {
        const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || s.visibility === "hidden" || s.display === "none") return;
        if (el.closest("p, li") && el.tagName === "A" && !el.closest(".game-card, .game-select-actions, .game-card-actions")) return; // running-text link
        out.n++;
        if (r.height < 43.5) out.bad.push((el.id || el.className || el.tagName) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " " + (el.textContent || "").trim().slice(0, 20));
      });
      out.overflow = document.documentElement.scrollWidth - innerWidth;
      return out;
    });
    checked += res.n;
    res.bad.slice(0, 5).forEach((b) => bad.push(name + ": " + b));
    if (res.bad.length > 5) bad.push(name + ": ... and " + (res.bad.length - 5) + " more");
    if (res.overflow > 0) bad.push(name + ": horizontal overflow " + res.overflow);
    await context.close();
  }
  // Task 125: small buttons (class "small") on game pages are at least
  // 44 px high after the start, at 360 px.
  const SMALL = ["bingo", "klappenkasten", "steckwuerfeln", "weidefreunde", "zoowurf", "minesweeper", "twenty48", "freecell", "mahjong", "nonogram", "doppelkopf", "admiralsgrid", "shapesort", "chess", "fanorona", "hex", "matches"];
  let small = 0;
  for (const slug of SMALL) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const b = document.querySelector('button[id^="start-"]'); if (b && b.offsetParent) b.click(); });
    await page.waitForTimeout(800);
    const res = await page.evaluate(() => {
      const out = { n: 0, bad: [] };
      document.querySelectorAll("main button.small").forEach((el) => {
        const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || s.visibility === "hidden" || s.display === "none") return;
        out.n++;
        if (r.height < 43.5) out.bad.push((el.id || el.className) + " " + Math.round(r.width) + "x" + Math.round(r.height));
      });
      out.overflow = document.documentElement.scrollWidth - innerWidth;
      return out;
    });
    small += res.n;
    res.bad.forEach((b) => bad.push(slug + ": small button " + b));
    if (!res.n) bad.push(slug + ": no small button found");
    if (res.overflow > 0) bad.push(slug + ": horizontal overflow " + res.overflow);
    await context.close();
  }
  // Task 162: the action buttons beside the board (roll, deal, build, lay
  // out ...) and the footer links of a game page are at least 44 px high at
  // 360 px; the ten footer links of the home page at least 32 px (the page
  // must stay one 600 x 800 screen, see home-categories.js).
  // Task 164: when the computer begins, Blockers and Snakes & Ladders show
  // "Continue" (#bl-next, #sl-next) instead of the roll button. Sternjagd's
  // "Continue" (#sj-next, task 165) is measured in tests/sternjagd-ui.js.
  const ACTION_SEL = ".dg-actions button, .bj-buttons button, .fv-actions button, .ur-dice-area > button, #nim-take, #romme-meld-button, #romme-discard-button, #bl-roll, #bl-next, #bingo-cpu-toggle, #ludo-roll-button, #sl-roll, #sl-next, #sj-next, #mt-undo, #mt-reset, #mt-hint";
  const ACTION = ["romme", "blockers", "ludo", "snakesladders", "matches", "forestvillage", "blackjack", "nim", "backgammon", "klappenkasten", "index"];
  let actions = 0, footer = 0;
  for (const slug of ACTION) {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("dialog", (d) => d.accept());
    await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    // Some buttons show only on the person's turn (the computer may begin).
    if (slug !== "index") {
      await page.waitForFunction((sel) => Array.from(document.querySelectorAll(sel)).some((el) => el.getBoundingClientRect().height > 0), ACTION_SEL, { timeout: 15000 }).catch(() => {});
    }
    const res = await page.evaluate(([sel, minFooter]) => {
      const out = { n: 0, f: 0, bad: [] };
      const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
      document.querySelectorAll(sel).forEach((el) => {
        if (!vis(el)) return;
        out.n++;
        const r = el.getBoundingClientRect();
        if (r.height < 43.5) out.bad.push("button " + (el.id || el.className) + " " + Math.round(r.width) + "x" + Math.round(r.height));
      });
      document.querySelectorAll(".site-footer a").forEach((el) => {
        if (!vis(el)) return;
        out.f++;
        const r = el.getBoundingClientRect();
        if (r.height < minFooter) out.bad.push("footer link " + (el.getAttribute("href") || "") + " " + Math.round(r.width) + "x" + Math.round(r.height));
      });
      return out;
    }, [ACTION_SEL, slug === "index" ? 31.5 : 43.5]);
    actions += res.n; footer += res.f;
    res.bad.forEach((b) => bad.push(slug + ": " + b));
    if (slug !== "index" && !res.n) bad.push(slug + ": no action button found");
    if (!res.f) bad.push(slug + ": no footer link found");
    await context.close();
  }
  // Task 164: both cases on purpose, not left to chance: "Me" begins shows
  // the roll button, "Computer" begins shows "Continue".
  const WHO = [["blockers", "bl", "#bl-roll", "#bl-next"], ["snakesladders", "sl", "#sl-roll", "#sl-next"]];
  let whoChecked = 0;
  for (const [slug, p, rollSel, nextSel] of WHO) {
    for (const [first, sel] of [["me", rollSel], ["computer", nextSel]]) {
      const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
      const page = await context.newPage();
      page.on("dialog", (d) => d.accept());
      await page.goto(BASE + slug + ".html?lang=de", { waitUntil: "load" });
      await page.waitForTimeout(500);
      await page.evaluate(([p, first]) => {
        document.getElementById(p + "-first").value = first;
        document.getElementById(p + "-pace").value = "tap";
        document.getElementById("start-" + p + "-game").click();
      }, [p, first]);
      await page.waitForFunction((s) => { const el = document.querySelector(s); return el && el.getBoundingClientRect().height > 0; }, sel, { timeout: 15000 }).catch(() => {});
      const h = await page.evaluate((s) => { const el = document.querySelector(s); const r = el ? el.getBoundingClientRect() : null; return r && r.height > 0 ? [Math.round(r.width), r.height] : null; }, sel);
      if (!h) bad.push(slug + " (" + first + " begins): " + sel + " not shown");
      else if (h[1] < 43.5) bad.push(slug + " (" + first + " begins): button " + sel + " " + h[0] + "x" + Math.round(h[1]));
      else whoChecked++;
      await context.close();
    }
  }
  await browser.close();
  bad.forEach((b) => console.log("FAIL " + b));
  console.log("=== TAP TARGETS: " + pages.length + " category pages, " + checked + " targets; " + SMALL.length + " game pages, " + small + " small buttons at least 44 px; " + actions + " action buttons and " + footer + " footer links at least 44 px (home 32 px); " + whoChecked + " who-begins starts; " + bad.length + " failure(s) ===");
  process.exit(bad.length ? 1 : 0);
})();
