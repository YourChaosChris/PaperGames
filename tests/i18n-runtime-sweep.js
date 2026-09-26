#!/usr/bin/env node
// i18n-runtime-sweep.js
// Plays every game in Russian (2-player and vs-computer where offered)
// with random clicks, then checks every runtime-translated text on the
// page - status lines, result popups, info lines (data-i18n-msg) and
// screen-reader labels (aria-label) - for leftover English words.
//
// Russian is used because its Cyrillic script makes any untranslated
// English word stand out, with no false alarms from words that happen
// to look the same in both languages. Latin words the Russian
// translations themselves contain (game names like "Gomoku", "Elo")
// are allowed.
//
// Requires a local server serving the repo root (see README.md) and
// Playwright with a Chromium browser available.

const { chromium } = require("playwright");
const { VIEWPORT, BASE_URL, getGameSlugs, tryStart, runWithConcurrency } = require("./lib");

const LANG = process.env.SWEEP_LANG || "ru";
const CLICKS = +process.env.CLICKS || 60;
const PER_GAME_MS = 45000;

// Latin words that legitimately appear in the Russian texts.
const ctx = require("./load-i18n").loadI18n();
// "OK" is universal; the author byline in the header is a name, not a text.
const allowed = new Set(["OK", "Christopher", "ller"]);
Object.values(ctx.STRINGS[LANG]).forEach((v) => {
  if (typeof v === "string") (v.match(/[A-Za-z]{3,}/g) || []).forEach((w) => allowed.add(w));
});

const CLICK_TARGETS = [
  "#board-container button:not([disabled])", "[id$='-board'] button:not([disabled])",
  "[id$='-board'] [role='button']", "[id$='-board'] .square", "#board-container [data-r]",
  "#board-container [data-coord]", "#board-container [data-index]", "#board-container [data-pit]",
  ".game-controls button:not([disabled])", "button[id*='roll']:not([disabled])",
  "button[id*='throw']:not([disabled])", "button[id*='done']:not([disabled])",
  "button[id*='pass']:not([disabled])", "button[id*='hint']:not([disabled])",
  "button[id*='shuffle']:not([disabled])", "button[id*='stock']:not([disabled])",
  "button[id*='wall']:not([disabled])"
].join(", ");

async function sweep(browser, slug, mode) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  page.on("dialog", (d) => d.accept().catch(() => {}));
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
  await page.addInitScript((lang) => {
    try { localStorage.clear(); localStorage.setItem("einkchess_lang", lang); } catch (e) {}
    window.__i18nSeen = [];
    document.addEventListener("DOMContentLoaded", () => {
      // Record every runtime message as it is shown, not only the last one.
      new MutationObserver((ms) => ms.forEach((m) => {
        const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (el && el.hasAttribute && el.hasAttribute("data-i18n-msg")) window.__i18nSeen.push(el.textContent);
      })).observe(document.body, { subtree: true, childList: true, characterData: true });
    });
  }, LANG);

  try {
    await page.goto(BASE_URL + slug + ".html", { waitUntil: "networkidle", timeout: 15000 });
    const aiBtn = await page.$("#mode-offline-ai");
    if (mode === "ai" && aiBtn && await aiBtn.isVisible().catch(() => false)) {
      await aiBtn.click();
      await page.waitForTimeout(100);
      const start = await page.$("button[id^='start-']:not([id='start-seek-button'])");
      if (start && await start.isVisible().catch(() => false)) await start.click();
    } else {
      await tryStart(page);
    }
    await page.waitForTimeout(300);
    const t0 = Date.now();
    for (let i = 0; i < CLICKS && Date.now() - t0 < PER_GAME_MS; i++) {
      const clicked = await page.evaluate((sel) => {
        const els = Array.from(document.querySelectorAll(sel)).filter((el) =>
          el.offsetParent !== null && !/resign|new-game|start-|undo|menu|offer-draw/.test(el.id || ""));
        if (!els.length) return false;
        els[Math.floor(Math.random() * els.length)].click();
        return true;
      }, CLICK_TARGETS).catch(() => false);
      if (!clicked) break;
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(800);
    for (const sel of ["#undo-btn", "#resign-button"]) {
      const b = await page.$(sel);
      if (b && await b.isVisible().catch(() => false)) {
        await b.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } catch (e) {
    errors.push("flow error: " + String(e));
  }

  const texts = await page.evaluate(() => {
    const out = window.__i18nSeen.slice();
    document.querySelectorAll("[data-i18n-msg]").forEach((el) => out.push(el.textContent));
    document.querySelectorAll("[aria-label]").forEach((el) => out.push(el.getAttribute("aria-label")));
    // Everything else a player can read, line by line - catches text a
    // script sets directly instead of through I18n.setMsg().
    (document.body.innerText || "").split("\n").forEach((line) => { if (line.trim()) out.push(line.trim()); });
    return out;
  }).catch(() => []);
  await page.close();

  const english = new Set();
  texts.forEach((txt) => {
    const words = (txt.match(/[A-Za-z]{3,}/g) || []).filter((w) => !allowed.has(w));
    if (words.length) english.add(txt);
  });
  return { slug: slug + "/" + mode, errors, english: [...english], count: texts.length };
}

(async () => {
  const jobs = [];
  getGameSlugs().forEach((slug) => { jobs.push({ slug: slug + "|2p", game: slug, mode: "2p" }); jobs.push({ slug: slug + "|ai", game: slug, mode: "ai" }); });
  const browser = await chromium.launch();
  const results = await runWithConcurrency(jobs, 5, (job) => Promise.race([
    sweep(browser, job.game, job.mode),
    new Promise((resolve) => setTimeout(() => resolve({ slug: job.game + "/" + job.mode, errors: ["timeout"], english: [], count: 0 }), PER_GAME_MS + 30000))
  ]));
  await browser.close();

  let issues = 0;
  let checked = 0;
  for (const r of results) {
    checked += r.count;
    if (r.english.length || r.errors.length) {
      issues++;
      console.log(`ISSUE ${r.slug}: ` + (r.english.length ? "English left: " + JSON.stringify(r.english.slice(0, 5)) : "") +
        (r.errors.length ? " " + r.errors.join(" | ").slice(0, 200) : ""));
    }
  }
  console.log(`\n=== I18N RUNTIME SWEEP (${LANG}): ${results.length} runs, ${checked} texts checked, ${issues} with issues ===`);
  process.exit(issues === 0 ? 0 : 1);
})();
