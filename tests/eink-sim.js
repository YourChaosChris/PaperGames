#!/usr/bin/env node
// eink-sim.js
// Plays every game on a simulated weak e-reader browser and measures
// how it copes. Chromium is slowed down through the DevTools protocol:
//   - CPU throttled (default 10x, roughly a single ~1 GHz ARM core as in
//     older Tolino/Kobo readers compared to a desktop core)
//   - a slow Wi-Fi link for the cold first load (no cache, no service worker)
//   - e-reader sized touch viewport (758x1024 CSS px), reduced motion
//   - greyscale rendering; screenshots are also saved for a 16-level
//     e-ink look (see the report step in README.md)
//
// Per page it records load timing, main-thread work, long tasks, bytes
// transferred, whether English text was painted before the page's own
// language arrived ("English flash"), and the time from a tap on the
// board to the next painted frame.
//
// Usage: node tests/eink-sim.js [outDir]
//   CPU=10 LANG_CODE=de BASE_URL=http://localhost:8000/ PAGES=chess,go
// Requires a local server serving the repo root and Playwright.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { BASE_URL, getGameSlugs, tryStart } = require("./lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "eink-sim-out");
const CPU = +process.env.CPU || 10;
const LANG = process.env.LANG_CODE || "de";
const PAGES = process.env.PAGES ? process.env.PAGES.split(",") : ["index"].concat(getGameSlugs());
const TAPS = +process.env.TAPS || 6;
const VIEWPORT = { width: 758, height: 1024 };
const NETWORK = { offline: false, latency: 120, downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (1024 * 1024) / 8 };

fs.mkdirSync(OUT, { recursive: true });

// Runs in the page before any of its own scripts.
function probe(lang) {
  try { localStorage.clear(); localStorage.setItem("einkchess_lang", lang); localStorage.setItem("papergames_ai_pacing", "fast"); } catch (e) {}
  window.__sim = { longTasks: [], englishFrames: 0, frames: 0 };
  try {
    new PerformanceObserver((list) => list.getEntries().forEach((e) => window.__sim.longTasks.push(Math.round(e.duration))))
      .observe({ entryTypes: ["longtask"] });
  } catch (e) {}
  // Every animation frame runs right before a paint. If a translatable
  // element still shows its English source text in a frame before the
  // page's language is applied, the reader would see English first.
  const seen = new Map();
  function frame() {
    window.__sim.frames++;
    const els = document.querySelectorAll("[data-i18n]");
    let english = false;
    els.forEach((el) => {
      if (!seen.has(el)) seen.set(el, el.textContent);
      if (el.textContent && el.textContent === seen.get(el) && document.documentElement.lang !== lang) english = true;
    });
    // Hidden text (the page waits invisibly for its language) isn't seen.
    const visible = document.body && getComputedStyle(document.body).visibility !== "hidden";
    if (english && els.length && visible) window.__sim.englishFrames++;
    if (document.readyState !== "complete" || window.__sim.frames < 5) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function throttle(page, withNetwork) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  await cdp.send("Emulation.setEmulatedVisionDeficiency", { type: "achromatopsia" });
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (withNetwork) await cdp.send("Network.emulateNetworkConditions", NETWORK);
  await cdp.send("Performance.enable");
  return cdp;
}

async function metrics(cdp) {
  const { metrics: list } = await cdp.send("Performance.getMetrics");
  const m = {};
  list.forEach((x) => { m[x.name] = x.value; });
  return m;
}

// Tap a random interactive board element and time until the next frame
// after the handler has run (handler + style + layout + paint prep).
async function tapLatency(page) {
  return page.evaluate(() => new Promise((resolve) => {
    const sel = "[id$='-board'] button:not([disabled]), #board-container button:not([disabled]), [id$='-board'] [role='button'], button[id*='roll']:not([disabled]), button[id*='throw']:not([disabled])";
    const els = Array.from(document.querySelectorAll(sel)).filter((el) => el.offsetParent !== null && !/undo|resign|new-game|menu/.test(el.id || ""));
    if (!els.length) { resolve(null); return; }
    const el = els[Math.floor(Math.random() * els.length)];
    const t0 = performance.now();
    el.click();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - t0)));
  }));
}

async function runPage(browser, slug) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: "reduce", serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept().catch(() => {}));
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  let bytes = 0;
  page.on("response", async (r) => { try { const b = await r.body(); bytes += b.length; } catch (e) {} });
  await page.addInitScript(probe, LANG);
  const cdp = await throttle(page, true);

  const t0 = Date.now();
  await page.goto(BASE_URL + slug + ".html", { waitUntil: "load", timeout: 180000 });
  const loadWall = Date.now() - t0;
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) };
  });
  await page.waitForTimeout(300);
  const m1 = await metrics(cdp);
  const sim = await page.evaluate(() => window.__sim);

  // Interaction: switch the network back to normal (only the cold load
  // is network-bound), start a game and tap the board a few times.
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const taps = [];
  if (slug !== "index") {
    await tryStart(page).catch(() => {});
    await page.waitForTimeout(400);
    for (let i = 0; i < TAPS; i++) {
      const ms = await tapLatency(page).catch(() => null);
      if (ms !== null) taps.push(Math.round(ms));
      await page.waitForTimeout(250);
    }
    // Let any computer reply finish before the screenshot.
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(OUT, slug + ".png") });
  const m2 = await metrics(cdp);
  await ctx.close();

  return {
    slug, loadWall, dcl: nav.dcl, load: nav.load, bytes,
    scriptMs: Math.round(m1.ScriptDuration * 1000), layoutMs: Math.round(m1.LayoutDuration * 1000),
    taskMs: Math.round(m1.TaskDuration * 1000), heapMB: +(m2.JSHeapUsedSize / 1048576).toFixed(1),
    longTasks: sim.longTasks.length, maxLongTask: sim.longTasks.length ? Math.max.apply(null, sim.longTasks) : 0,
    englishFrames: sim.englishFrames, taps, tapMax: taps.length ? Math.max.apply(null, taps) : null,
    tapMedian: taps.length ? taps.slice().sort((a, b) => a - b)[Math.floor(taps.length / 2)] : null,
    errors
  };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const slug of PAGES) {
    try {
      const r = await runPage(browser, slug);
      results.push(r);
      console.log(`${slug.padEnd(16)} load ${String(r.load).padStart(6)} ms  script ${String(r.scriptMs).padStart(5)} ms  ` +
        `longest task ${String(r.maxLongTask).padStart(5)} ms  ${(r.bytes / 1024).toFixed(0).padStart(5)} KB  ` +
        `tap median ${r.tapMedian === null ? "-" : r.tapMedian} / max ${r.tapMax === null ? "-" : r.tapMax} ms` +
        (r.englishFrames ? `  ENGLISH FLASH (${r.englishFrames} frames)` : "") + (r.errors.length ? "  ERRORS: " + r.errors.join(" | ") : ""));
    } catch (e) {
      results.push({ slug, errors: ["flow: " + String(e).slice(0, 200)] });
      console.log(`${slug.padEnd(16)} FAILED ${String(e).slice(0, 200)}`);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ cpu: CPU, lang: LANG, network: NETWORK, base: BASE_URL, results }, null, 2));
  const bad = results.filter((r) => (r.errors && r.errors.length) || r.englishFrames);
  console.log(`\n=== E-INK SIM (CPU ${CPU}x, ${LANG}): ${results.length} pages, ${bad.length} with errors or English flash ===`);
  process.exit(bad.length ? 1 : 0);
})();
