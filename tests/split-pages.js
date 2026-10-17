#!/usr/bin/env node
// split-pages.js
// Opens every game page and every rules and history page in a real browser
// in several languages (default en, de and ar - the right-to-left one) and
// checks, with the split CSS and text files (base.css, css/<game>.css,
// text/<lang>/<slug>.js):
//  - no script error, no console error, no request that failed or came back
//    with an error status (a missing stylesheet or text file shows up here);
//  - no raw i18n key visible anywhere (text, aria-label, title, placeholder);
//  - the page's language is fully loaded (I18n.isReady) and, for ar, the
//    page is right to left.
// Needs Playwright and a running server (BASE_URL, started by run-all.sh).
//   SPLIT_LANGS=de node tests/split-pages.js     fewer languages, faster
//   SPLIT_ONLY=chess node tests/split-pages.js   only pages starting with chess

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const LANGS = (process.env.SPLIT_LANGS || "en,de,ar").split(",");
const ONLY = process.env.SPLIT_ONLY ? new RegExp("^" + process.env.SPLIT_ONLY) : null;
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const slugs = [...fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8").matchAll(/slug:\s*"([a-z0-9]+)"/g)].map((m) => m[1]);
const pages = [];
for (const s of slugs) {
  for (const suffix of ["", "-rules", "-history"]) {
    const f = s + suffix + ".html";
    if (fs.existsSync(path.join(ROOT, f)) && !/http-equiv="refresh"/i.test(fs.readFileSync(path.join(ROOT, f), "utf8"))) pages.push(f);
  }
}
const RAW = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/;

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const problems = [];
  let loads = 0;
  for (const lang of LANGS) {
    const ctx = await browser.newContext({ viewport: { width: 600, height: 900 }, serviceWorkers: "block" });
    const page = await ctx.newPage();
    let current = "";
    const bad = (m) => problems.push(`${lang} ${current}: ${m}`);
    page.on("pageerror", (e) => bad("script error: " + e.message));
    page.on("console", (msg) => { if (msg.type() === "error") bad("console error: " + msg.text().slice(0, 120)); });
    page.on("response", (r) => { if (r.status() >= 400) bad("HTTP " + r.status() + " " + r.url().replace(BASE, "")); });
    page.on("requestfailed", (r) => bad("request failed " + r.url().replace(BASE, "")));
    for (const f of pages) {
      if (ONLY && !ONLY.test(f)) continue;
      current = f;
      await page.goto(BASE + f + "?lang=" + lang, { waitUntil: "load" });
      await page.waitForTimeout(120);
      loads++;
      const info = await page.evaluate((re) => {
        const raw = new RegExp(re);
        const found = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const n = w.currentNode;
          if (n.parentElement && /^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement.tagName)) continue;
          const t = n.nodeValue.trim();
          if (raw.test(t)) found.push(t);
        }
        document.querySelectorAll("[aria-label],[title],[placeholder],[alt]").forEach((el) => {
          ["aria-label", "title", "placeholder", "alt"].forEach((a) => {
            const v = (el.getAttribute(a) || "").trim();
            if (raw.test(v)) found.push(a + "=" + v);
          });
        });
        return { found, ready: window.I18n ? window.I18n.isReady(window.I18n.getLang()) : null, lang: window.I18n && window.I18n.getLang(), dir: document.documentElement.dir };
      }, RAW.source);
      if (info.found.length) bad("raw key visible: " + info.found.slice(0, 3).join(", "));
      if (info.ready === false) bad("language " + info.lang + " not fully loaded");
      if (info.lang !== lang) bad("language is " + info.lang);
      if (lang === "ar" && info.dir !== "rtl") bad("not right to left");
    }
    await ctx.close();
  }
  await browser.close();
  if (problems.length) {
    problems.slice(0, 40).forEach((p) => console.log("FAIL: " + p));
    console.log(`\n${problems.length} PROBLEM(S) in ${loads} page loads`);
    process.exit(1);
  }
  console.log(`OK: ${loads} page loads (${pages.length} pages x ${LANGS.join(", ")}) without script errors, failed requests, raw keys or missing language files`);
})();
