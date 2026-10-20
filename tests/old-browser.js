#!/usr/bin/env node
// tests/old-browser.js
// The old-browser check (task 103, tools/old-browser.js).
//
//  a. The check is strict ES5 (acorn, ecmaVersion 5), smaller than 1 KB,
//     and every real page carries exactly the version tools/seo.js makes
//     of it, as the first <script> of the page, inside <head>.
//  b. A current Chromium: no note, no page error, the home page and a
//     game start as before.
//  c. A simulated old browser (Promise and fetch removed by an init
//     script): the note in English and German, no other PaperGames script
//     runs (no script element after the check, no #app), no page or
//     console error, no sideways scrolling at 360 px.
//
// Needs acorn and Playwright (Chromium) and the test server (BASE_URL).
//   node tests/old-browser.js
const { chromium } = require("playwright");
const acorn = require("acorn");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// --- a. the script and the pages ---------------------------------------
const source = fs.readFileSync(path.join(ROOT, "tools", "old-browser.js"), "utf8");
const inline = source.split("\n").map((l) => l.trim()).filter((l) => l && l.indexOf("//") !== 0).join("");
[["tools/old-browser.js", source], ["inline form", inline]].forEach(([name, code]) => {
  try {
    acorn.parse(code, { ecmaVersion: 5, sourceType: "script" });
  } catch (e) {
    fails.push(name + " is not ES5: " + e.message);
  }
});
const bytes = Buffer.byteLength(inline, "utf8");
check(bytes < 1024, "the inline check has " + bytes + " bytes, should stay under 1024");

const tag = "<script>" + inline + "</script>";
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).sort().filter((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  return !/http-equiv="refresh"/i.test(html) && !/^google[0-9a-f]+\.html$/.test(f);
});
let withCheck = 0;
pages.forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const at = html.indexOf(tag);
  if (at === -1) { fails.push(f + ": no old-browser check (or an old one: run node tools/seo.js)"); return; }
  if (html.indexOf(tag, at + 1) !== -1) fails.push(f + ": the check is there twice");
  if (html.search(/<script[\s>]/i) !== at) fails.push(f + ": the check is not the first script");
  const head = html.indexOf("<head>"), headEnd = html.indexOf("</head>");
  if (!(head !== -1 && head < at && at < headEnd)) fails.push(f + ": the check is not inside <head>");
  withCheck++;
});
console.log("old-browser.js: " + bytes + " bytes inline, ES5; first script on " + withCheck + " of " + pages.length + " pages");

const NOTE_EN = "Your browser is too old for PaperGames.";
const NOTE_DE = "Dein Browser ist zu alt für PaperGames.";

(async () => {
  const browser = await chromium.launch();

  // --- b. a current browser ---------------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 600, height: 800 }, serviceWorkers: "block" });
    for (const file of ["index.html", "sudoku.html", "chess.html"]) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(BASE + file, { waitUntil: "load" });
      await page.waitForTimeout(1000);
      const r = await page.evaluate(() => {
        const vis = (el) => { if (!el) return false; const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).display !== "none"; };
        const bc = document.getElementById("board-container");
        return {
          flag: window.__pgOldBrowser === true,
          note: document.body.innerText.indexOf("too old for PaperGames") !== -1,
          app: vis(document.getElementById("app")),
          i18n: typeof window.I18n === "object" && window.I18n !== null,
          board: bc ? vis(bc) && Array.from(bc.querySelectorAll("*")).filter(vis).length > 3 : null
        };
      });
      check(!r.flag && !r.note, "modern " + file + ": the old-browser note shows");
      check(r.app && r.i18n, "modern " + file + ": page did not start (app " + r.app + ", i18n " + r.i18n + ")");
      if (file !== "index.html") check(r.board === true, "modern " + file + ": the board does not show");
      check(!errors.length, "modern " + file + ": page errors " + errors.join(" | "));
      console.log("modern " + file + ": note " + r.note + ", app " + r.app + (r.board === null ? "" : ", board " + r.board) + ", page errors " + errors.length);
      await page.close();
    }
    await context.close();
  }

  // --- c. a simulated old browser ---------------------------------------
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 }, serviceWorkers: "block" });
    await context.addInitScript(() => { delete window.Promise; delete window.fetch; });
    for (const file of ["index.html", "sudoku.html", "devices.html"]) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("page error: " + e.message));
      page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
      await page.goto(BASE + file, { waitUntil: "load" });
      await page.waitForTimeout(1000);
      // Locators run in Playwright's own world, which still has Promise.
      const text = await page.locator("body").innerText();
      const scripts = await page.locator("script").count();
      const app = await page.locator("#app").count();
      const wide = await page.locator("html").evaluate((el) => el.scrollWidth - el.clientWidth).catch(() => null);
      check(text.indexOf(NOTE_EN) !== -1 && text.indexOf(NOTE_DE) !== -1, "old " + file + ": the note is missing, page text: " + text.slice(0, 200));
      check(scripts === 1, "old " + file + ": " + scripts + " script elements, expected only the check");
      check(app === 0, "old " + file + ": the page itself was built");
      check(wide === 0, "old " + file + ": sideways scrolling at 360 px (" + wide + ")");
      check(!errors.length, "old " + file + ": " + errors.join(" | "));
      console.log("old " + file + ": note en+de " + (text.indexOf(NOTE_EN) !== -1 && text.indexOf(NOTE_DE) !== -1) + ", scripts " + scripts + ", #app " + app + ", errors " + errors.length);
      if (file === "index.html") console.log("  note text: " + text.replace(/\s*\n\s*/g, " / "));
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  fails.forEach((f) => console.log("FAIL: " + f));
  console.log(fails.length ? fails.length + " OLD BROWSER FAILURE(S)" : "OLD BROWSER: ALL CHECKS PASS");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
