// tests/offline-install.js
// The offline install in sw.js and the status line on the home page
// (offline-status.js), against a copy of the site served by a small test
// server here that can delay, throttle and fail requests, and counts every
// request it gets.
//
// Default run (part of run-all.sh), 300 ms delay per request:
//  1. First visit; chess-rules.html fails all three tries. The home page shows
//     "… X von 556 Dateien", then "Speichern unterbrochen", never "kann
//     nicht ablegen"; the 555 stored files stay in the new cache.
//  2. Next try; chess-rules.html fails once more. The install retries it,
//     downloads nothing but sw.js and chess-rules.html (carries on where it
//     stopped) and ends with "Offline bereit".
//  3. Update: a new version where only one file changed. Only sw.js and
//     that file come from the network; the old cache is gone afterwards,
//     a localStorage entry (stands for saved games and settings) is kept.
//  4. Server off: every game page, its rules page and the home page load
//     from the device without errors, the changed file in its new form.
//
// THROTTLE=1 node tests/offline-install.js: first visit without errors
// over a slow line (500 kbit/s in total, 300 ms per request), then step 4.
//
// Needs Playwright (Chromium); starts its own server. Run:
//   node tests/offline-install.js

const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const THROTTLE = process.env.THROTTLE === "1";
const PORT = parseInt(process.env.OFFLINE_TEST_PORT || "8031", 10);
const BASE = "http://localhost:" + PORT + "/";
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// --- a copy of the site -------------------------------------------------
const SITE = fs.mkdtempSync(path.join(os.tmpdir(), "papergames-offline-"));
fs.cpSync(ROOT, SITE, {
  recursive: true,
  filter: (src) => !/^(\.git|tests|node_modules)([\\/]|$)/.test(path.relative(ROOT, src))
});
const tool = require(path.join(ROOT, "tools", "sw-hashes.js"));
const swSrc = () => fs.readFileSync(path.join(SITE, "sw.js"), "utf8");
const SHELL = tool.appShell(swSrc());
const versionOf = (src) => /const CACHE_NAME = "([^"]+)"/.exec(src)[1];

// --- the test server ----------------------------------------------------
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
const server = {
  log: [],
  delay: 300,
  bytesPerSec: THROTTLE ? 500 * 1000 / 8 : 0,
  failCount: {}, // path -> how many more requests fail with 500
  nextSlot: 0
};
// One shared line: with a byte rate set, every chunk waits for its turn.
function sendThrottled(res, buf) {
  const CHUNK = 4096;
  let off = 0;
  function next() {
    if (off >= buf.length) { res.end(); return; }
    const piece = buf.subarray(off, off + CHUNK);
    off += piece.length;
    const now = Date.now();
    const start = Math.max(now, server.nextSlot);
    server.nextSlot = start + (piece.length / server.bytesPerSec) * 1000;
    setTimeout(() => { res.write(piece); next(); }, server.nextSlot - now);
  }
  next();
}
const sockets = new Set();
const httpServer = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  server.log.push(urlPath);
  setTimeout(() => {
    if (server.failCount[urlPath] > 0) {
      server.failCount[urlPath]--;
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("simulated failure");
      return;
    }
    const file = path.join(SITE, urlPath === "/" ? "index.html" : urlPath);
    if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
      return;
    }
    const buf = fs.readFileSync(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": buf.length, "Cache-Control": "max-age=600" });
    if (server.bytesPerSec) sendThrottled(res, buf);
    else res.end(buf);
  }, server.delay);
});
httpServer.on("connection", (s) => { sockets.add(s); s.on("close", () => sockets.delete(s)); });
function stopServer() {
  return new Promise((resolve) => {
    httpServer.close(() => resolve());
    sockets.forEach((s) => s.destroy());
  });
}

// --- texts on the home page (German) --------------------------------------
const RE_PROGRESS = /^Wird für offline gespeichert … (\d+) von (\d+) Dateien\./;
const RE_READY = /^Offline bereit\. /;
const RE_PAUSED = /^Speichern unterbrochen\./;
const RE_UPDATING = /^Offline bereit \(Aktualisierung wird geladen …\)\./;
const RE_UNAVAILABLE = /nicht ablegen/;

async function statusText(page) {
  return page.$eval("#offline-status-text", (el) => el.textContent).catch(() => "");
}
async function waitForText(page, re, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (re.test(await statusText(page))) return true;
    await page.waitForTimeout(250);
  }
  return false;
}
async function cacheInfo(page) {
  return page.evaluate(async () => {
    const out = {};
    for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).length;
    return out;
  });
}
const countOf = (p) => server.log.filter((x) => x === p).length;

async function offlinePages(context, expectText) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(SITE, "games-catalog.js"), "utf8") + "\nthis.G = GAMES_CATALOG;", ctx);
  const pages = ["index.html", "games.html"];
  ctx.G.forEach((g) => { pages.push(g.slug + ".html"); pages.push(g.slug + "-rules.html"); });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(page.url() + ": " + e.message));
  // The browser fetches the tab icon itself, past the service worker; a
  // missing icon offline is not a page that fails to load.
  page.on("requestfailed", (r) => { if (!/favicon/.test(r.url())) errors.push("request failed: " + r.url()); });
  let okCount = 0;
  for (const p of pages) {
    const resp = await page.goto(BASE + p, { waitUntil: "load" }).catch((e) => null);
    if (!resp || resp.status() !== 200 || !resp.fromServiceWorker()) { fails.push("offline: " + p + " did not load from the device"); continue; }
    okCount++;
  }
  if (expectText) {
    const r = await page.goto(BASE + expectText.page);
    check(r && (await r.text()).indexOf(expectText.text) !== -1, "offline: " + expectText.page + " is not the updated version");
  }
  errors.slice(0, 5).forEach((e) => fails.push("offline: " + e));
  await page.close();
  return { pages: pages.length, ok: okCount };
}

(async () => {
  await new Promise((r) => httpServer.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: EXEC });
  const context = await browser.newContext({ serviceWorkers: "allow" });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("einkchess_lang", "de");
    } catch (e) { /* ignore */ }
    window.__offlineTexts = [];
    document.addEventListener("DOMContentLoaded", () => {
      const el = document.getElementById("offline-status-text");
      if (!el) return;
      const note = () => {
        const t = el.textContent;
        if (window.__offlineTexts[window.__offlineTexts.length - 1] !== t) window.__offlineTexts.push(t);
      };
      new MutationObserver(note).observe(el, { childList: true, characterData: true, subtree: true });
      note();
    });
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  const v1 = versionOf(swSrc());
  const report = [];
  const t0 = Date.now();

  if (THROTTLE) {
    // Clean first visit over a slow line.
    await page.goto(BASE + "index.html");
    const ready = await waitForText(page, RE_READY, 15 * 60 * 1000);
    const texts = await page.evaluate(() => window.__offlineTexts);
    check(ready, "throttled: never reached 'Offline bereit' (last: " + texts[texts.length - 1] + ")");
    check(texts.some((t) => RE_PROGRESS.test(t)), "throttled: no progress line shown");
    check(!texts.some((t) => RE_UNAVAILABLE.test(t)), "throttled: 'cannot store' shown");
    const progress = texts.filter((t) => RE_PROGRESS.test(t));
    report.push("throttled first visit: ready after " + Math.round((Date.now() - t0) / 1000) + " s, " + server.log.length + " requests, " +
      progress.length + " progress lines (first: \"" + progress[0] + "\", last: \"" + progress[progress.length - 1] + "\"), " +
      "paused shown: " + texts.some((t) => RE_PAUSED.test(t)));
  } else {
    // 1. chess-rules.html fails all three tries.
    server.failCount["/chess-rules.html"] = 3;
    await page.goto(BASE + "index.html");
    const paused = await waitForText(page, RE_PAUSED, 120000);
    let texts = await page.evaluate(() => window.__offlineTexts);
    check(paused, "step 1: 'Speichern unterbrochen' not shown (last: " + texts[texts.length - 1] + ")");
    check(texts.some((t) => RE_PROGRESS.test(t)), "step 1: no progress line shown");
    check(countOf("/chess-rules.html") === 3, "step 1: chess-rules.html requested " + countOf("/chess-rules.html") + " times, expected 3");
    let caches1 = await cacheInfo(page);
    check(caches1[v1] === SHELL.length - 1, "step 1: " + JSON.stringify(caches1) + ", expected " + (SHELL.length - 1) + " files kept in " + v1);
    const prog1 = texts.filter((t) => RE_PROGRESS.test(t));
    report.push("step 1: progress lines " + prog1.length + ", first \"" + prog1[0] + "\", last \"" + prog1[prog1.length - 1] + "\"");
    report.push("step 1: chess-rules.html failed 3 times; status \"" + texts.filter((t) => RE_PAUSED.test(t))[0] + "\"; kept " + caches1[v1] + " of " + SHELL.length + " files; " + server.log.length + " requests");

    // 2. Next try: chess-rules.html fails once more, then works.
    server.log = [];
    server.failCount["/chess-rules.html"] = 1;
    await page.evaluate(() => navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }));
    const ready = await waitForText(page, RE_READY, 120000);
    texts = await page.evaluate(() => window.__offlineTexts);
    check(ready, "step 2: never reached 'Offline bereit' (last: " + texts[texts.length - 1] + ")");
    const fetched2 = server.log.filter((p) => p !== "/sw.js");
    check(JSON.stringify(fetched2) === JSON.stringify(["/chess-rules.html", "/chess-rules.html"]), "step 2: fetched " + JSON.stringify(fetched2) + ", expected chess-rules.html twice");
    report.push("step 2: requests " + JSON.stringify(server.log) + "; status \"" + (await statusText(page)) + "\"");
    check(!texts.some((t) => RE_UNAVAILABLE.test(t)), "steps 1-2: 'cannot store' shown");

    // 3. Update with one changed file.
    await page.evaluate(() => localStorage.setItem("papergames_offline_test_keep", "kept"));
    const changed = "cake-rules.html";
    fs.appendFileSync(path.join(SITE, changed), "\n<!-- offline update test -->\n");
    let src = swSrc().replace(/const CACHE_NAME = "papergames-cache-v(\d+)"/, (m, n) => 'const CACHE_NAME = "papergames-cache-v' + (+n + 1) + '"');
    fs.writeFileSync(path.join(SITE, "sw.js"), src);
    require("child_process").execFileSync("node", [path.join(ROOT, "tools", "sw-hashes.js"), SITE]);
    const v2 = versionOf(swSrc());
    server.log = [];
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    let caches2 = {};
    const end = Date.now() + 120000;
    while (Date.now() < end) {
      caches2 = await cacheInfo(page);
      if (Object.keys(caches2).length === 1 && caches2[v2]) break;
      await page.waitForTimeout(250);
    }
    check(Object.keys(caches2).length === 1 && caches2[v2] === SHELL.length, "step 3: caches " + JSON.stringify(caches2) + ", expected only " + v2 + " with " + SHELL.length + " files");
    const fetched3 = server.log.filter((p) => p !== "/sw.js");
    check(JSON.stringify(fetched3) === JSON.stringify(["/" + changed]), "step 3: fetched " + JSON.stringify(fetched3) + ", expected only /" + changed);
    check((await page.evaluate(() => localStorage.getItem("papergames_offline_test_keep"))) === "kept", "step 3: localStorage entry lost");
    await waitForText(page, RE_READY, 10000);
    texts = await page.evaluate(() => window.__offlineTexts);
    const upd = texts.filter((t) => RE_UPDATING.test(t));
    check(upd.length > 0, "step 3: 'Offline bereit (Aktualisierung wird geladen …)' not shown");
    check(RE_READY.test(texts[texts.length - 1]), "step 3: ends with \"" + texts[texts.length - 1] + "\"");
    report.push("step 3: status during the update \"" + upd[0] + "\", afterwards \"" + texts[texts.length - 1] + "\"");
    report.push("step 3: update " + v1 + " -> " + v2 + " with only " + changed + " changed: " + server.log.length + " requests " + JSON.stringify(server.log) + "; old cache removed, localStorage kept");
  }

  // 4. Server off: everything from the device.
  await page.goto(BASE + "index.html");
  await page.waitForTimeout(500);
  await stopServer();
  const off = await offlinePages(context, THROTTLE ? null : { page: "cake-rules.html", text: "<!-- offline update test -->" });
  report.push("step 4: server off, " + off.ok + " of " + off.pages + " pages (home, games list, every game and its rules page) loaded from the device");
  pageErrors.slice(0, 5).forEach((e) => fails.push("page error: " + e));

  await browser.close();
  fs.rmSync(SITE, { recursive: true, force: true });
  report.forEach((l) => console.log(l));
  const shellBytes = SHELL.reduce((sum, e) => sum + fs.statSync(path.join(ROOT, tool.fileOf(e))).size, 0);
  console.log("app shell: " + SHELL.length + " files, " + (shellBytes / 1e6).toFixed(1) + " MB");
  fails.forEach((f) => console.log("FAIL: " + f));
  console.log("\n=== OFFLINE INSTALL" + (THROTTLE ? " (throttled)" : "") + ": " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(1);
});
