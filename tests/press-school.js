#!/usr/bin/env node
// Press page, school page, printable guide and accessibility extras
// (tasks 202 to 205). Run: node tests/press-school.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");
const fails = [];
const check = (n, ok) => { if (!ok) fails.push(n); };

// Files on disk
const files = ["press/papergames-logo.png", "press/papergames-logo.svg"];
["home", "games", "chess", "checkers", "sudoku", "klondike"].forEach((k) => files.push("press/papergames-" + k + ".png", "press/papergames-" + k + "-1072.png"));
["nim", "hanoi", "sudoku", "checkers", "guide"].forEach((k) => ["de", "en"].forEach((l) => files.push("downloads/papergames-" + k + "-" + l + ".pdf")));
files.forEach((f) => check("file exists: " + f, fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).size > 1000));

// Downloads stay out of the offline shell: they are fetched only on demand.
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const shell = /const APP_SHELL = \[([\s\S]*?)\];/.exec(sw)[1];
check("press.html in APP_SHELL", shell.indexOf('"press.html"') !== -1);
check("school.html in APP_SHELL", shell.indexOf('"school.html"') !== -1);
check("no download in APP_SHELL", !/"(press|downloads)\//.test(shell));

// Every game page announces its status line to screen readers.
fs.readdirSync(ROOT).filter((f) => /^[a-z0-9]+\.html$/.test(f)).forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const m = /<div id="offline-[a-z0-9]+-status" class="status-text"([^>]*)>/.exec(html);
  if (m) check(f + ": status line has aria-live", /aria-live="polite"/.test(m[1]));
});
// Task 207: every site footer links the press page.
fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).forEach((f) => {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const m = /<footer class="site-footer">([\s\S]*?)<\/footer>/.exec(html);
  if (m) check(f + ": footer links press.html", m[1].indexOf('href="press.html"') !== -1);
});
check("base.css has a :focus-visible outline", /:focus-visible\s*\{[^}]*outline:/.test(fs.readFileSync(path.join(ROOT, "base.css"), "utf8")));

(async () => {
  const browser = await chromium.launch();
  for (const lang of ["de", "en", "ar"]) {
    for (const width of [360, 600]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, serviceWorkers: "block" });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const p of ["press", "school", "guide", "about"]) {
        await page.goto(BASE + p + ".html?lang=" + lang, { waitUntil: "load" });
        await page.waitForTimeout(300);
        const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
        check(p + " " + lang + " " + width + ": no horizontal scroll (" + sw2 + ")", sw2 <= width);
        const raw = await page.evaluate(() => /\{games\}|press_|school_|guide_print/.test(document.body.innerText));
        check(p + " " + lang + ": no raw keys or placeholders", !raw);
        if (p === "press") {
          check("press " + lang + ": 7 pictures", (await page.$$eval(".press-shot img", (e) => e.length)) === 7);
          check("press " + lang + ": contact link", (await page.$$eval('a[href="mailto:yourchaos@googlemail.com"]', (e) => e.length)) === 1);
          check("press " + lang + ": games count filled in", /\d{2,}/.test(await page.textContent('[data-i18n="press_short"]')));
        }
        if (p === "school") check("school " + lang + ": 8 PDF links", (await page.$$eval('a[href^="downloads/"][href$=".pdf"]', (e) => e.length)) === 8);
        // Task 221: a PDF opened inside the installed app (display: standalone,
        // no back button) left no way back, so every PDF opens in a new window.
        const pdfLinks = await page.$$eval('a[href$=".pdf"]', (e) => e.map((a) => [a.getAttribute("href"), a.target, a.rel]));
        pdfLinks.forEach(([h, t, r]) => check(p + " " + lang + ": " + h + " opens in a new window", t === "_blank" && /\bnoopener\b/.test(r)));
        if (pdfLinks.length) check(p + " " + lang + ": new-window note shown", (await page.isVisible('[data-i18n="school_pdf_window"]')) && !/school_pdf_window/.test(await page.textContent('[data-i18n="school_pdf_window"]')));
        if (pdfLinks.length && width === 600 && lang === "de") {
          const href = pdfLinks[0][0];
          const before = page.url();
          const [popup] = await Promise.all([ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null), page.click('a[href="' + href + '"]')]);
          await page.waitForTimeout(300);
          check(p + ": clicking " + href + " opens a new page", popup !== null);
          check(p + ": clicking " + href + " keeps the app page", page.url() === before);
          if (popup) await popup.close();
        }
        if (p === "guide") check("guide " + lang + ": 2 PDF links", (await page.$$eval('a[href^="downloads/papergames-guide-"]', (e) => e.length)) === 2);
        if (p === "guide") check("guide " + lang + ": 5 device sections", (await page.$$eval("#guide-devices h3", (e) => e.length)) === 5);
        if (p === "guide") check("guide " + lang + ": device texts translated", !/guide_device/.test(await page.textContent("#guide-devices")));
        if (p === "press") check("press " + lang + ": 6 large screenshots", (await page.$$eval('a[href$="-1072.png"]', (e) => e.length)) === 6);
        if (p === "about") {
          check("about " + lang + ": press link", (await page.$('a[href="press.html"]')) !== null);
          check("about " + lang + ": school link", (await page.$('a[href="school.html"]')) !== null);
        }
      }
      await page.goto(BASE + "index.html?lang=" + lang, { waitUntil: "load" });
      check("home " + lang + ": link to the device steps", (await page.$('.home-guide-link a[href="guide.html#guide-devices"]')) !== null);
      check(lang + " " + width + ": no page error " + errors.join("|"), errors.length === 0);
      await ctx.close();
    }
  }
  // The linked downloads answer from the server.
  const ctx = await browser.newContext({ serviceWorkers: "block" });
  const page = await ctx.newPage();
  for (const f of ["downloads/papergames-nim-de.pdf", "press/papergames-chess.png", "press/papergames-logo.svg"]) {
    const r = await page.request.get(BASE + f);
    check("served: " + f, r.ok());
  }
  await ctx.close();
  await browser.close();
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("press-school: ALL CHECKS PASS");
})();
