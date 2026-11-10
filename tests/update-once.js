// tests/update-once.js
// Task 215: "the app loaded the last update three or four times, on the
// phone and on the tablet" (report of 10.11.2026). Right after a release the
// servers of GitHub Pages hand out the new and the old sw.js in turn for some
// minutes; the browser took each change for an update.
// Against a copy of the site served by a small test server here:
//
//  Run 1: a device on v1, then v2 is online: the banner comes exactly once,
//         "Reload now" loads the page once, after that no banner and no
//         further reload.
//  Run 2: reload again with the same version online: no banner, no install,
//         no reload. Then the server hands out the OLD sw.js (v1) once more:
//         the old version does not install, v2 stays active, its cache stays,
//         no banner; and with the new sw.js back: still nothing.
//
// Needs Playwright (Chromium); starts its own server. Run:
//   node tests/update-once.js

const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const PORT = parseInt(process.env.UPDATE_ONCE_PORT || "8033", 10);
const BASE = "http://localhost:" + PORT + "/";
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const report = [];

const SITE = fs.mkdtempSync(path.join(os.tmpdir(), "papergames-once-"));
fs.cpSync(ROOT, SITE, {
  recursive: true,
  filter: (src) => !/^(\.git|tests|node_modules)([\\/]|$)/.test(path.relative(ROOT, src))
});
const swPath = path.join(SITE, "sw.js");
const swSrc = () => fs.readFileSync(swPath, "utf8");
const versionOf = (src) => /const CACHE_NAME = "([^"]+)"/.exec(src)[1];

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
const log = [];
const sockets = new Set();
const httpServer = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  log.push(urlPath);
  const file = path.join(SITE, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
    return;
  }
  const buf = fs.readFileSync(file);
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": buf.length, "Cache-Control": "max-age=600" });
  res.end(buf);
});
httpServer.on("connection", (s) => { sockets.add(s); s.on("close", () => sockets.delete(s)); });

async function activeVersion(page) {
  return page.evaluate(() => new Promise((resolve) => {
    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r || !r.active) { resolve(null); return; }
      navigator.serviceWorker.addEventListener("message", function f(e) {
        if (e.data && e.data.papergamesVersion) { navigator.serviceWorker.removeEventListener("message", f); resolve(e.data.papergamesVersion); }
      });
      r.active.postMessage("papergames-version");
      setTimeout(() => resolve("timeout"), 3000);
    });
  }));
}
const cacheNames = (page) => page.evaluate(() => caches.keys());
// No worker installing or waiting any more (an install that was refused or
// finished), for at least one check after `ms`.
async function settled(page, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const busy = await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => !!(r && (r.installing || r.waiting))));
    if (!busy) return true;
    await page.waitForTimeout(250);
  }
  return false;
}
const bannerCount = (page) => page.evaluate(() => document.querySelectorAll("#update-banner").length);

(async () => {
  await new Promise((r) => httpServer.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: EXEC });
  const context = await browser.newContext({ serviceWorkers: "allow" });
  await context.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) { /* ignore */ } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let loads = 0;
  page.on("load", () => { loads++; });
  const oldSw = swSrc();
  const v1 = versionOf(oldSw);

  // ---- Run 1: v1 on the device, then v2 ---------------------------------
  await page.goto(BASE + "index.html");
  const end = Date.now() + 120000;
  while (Date.now() < end && (await activeVersion(page)) !== v1) await page.waitForTimeout(500);
  check((await activeVersion(page)) === v1, "first install: " + v1 + " is not active");
  await page.reload({ waitUntil: "load" }); // now controlled by v1
  await page.waitForTimeout(2500);          // update-banner.js remembers this visit

  const newSw = oldSw.replace(/const CACHE_NAME = "papergames-cache-v(\d+)"/, (m, n) => 'const CACHE_NAME = "papergames-cache-v' + (+n + 1) + '"');
  const v2 = versionOf(newSw);
  fs.writeFileSync(swPath, newSw);
  loads = 0;
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await page.waitForSelector("#update-banner", { timeout: 120000 }).catch(() => null);
  await page.waitForTimeout(1500);
  check((await bannerCount(page)) === 1, "run 1: banner count after the update is " + (await bannerCount(page)) + ", expected 1");
  check((await activeVersion(page)) === v2, "run 1: active is " + (await activeVersion(page)) + ", expected " + v2);
  check(loads === 0, "run 1: the page reloaded by itself " + loads + " time(s) before the button");
  await page.click("#update-banner button.primary");
  await page.waitForLoadState("load");
  await page.waitForTimeout(6000);
  check(loads === 1, "run 1: 'Reload now' loaded the page " + loads + " time(s), expected 1");
  check((await bannerCount(page)) === 0, "run 1: banner again after the reload");
  report.push("run 1: " + v1 + " -> " + v2 + ", banner once, page loaded " + loads + " time(s), caches " + JSON.stringify(await cacheNames(page)));

  // ---- Run 2: the same version again, then the old sw.js once more -------
  loads = 0;
  log.length = 0;
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4000);
  check(await settled(page, 10000), "run 2: a worker is still installing with the same version");
  check((await bannerCount(page)) === 0, "run 2: banner after a reload with the same version");
  check(loads === 1, "run 2: page loaded " + loads + " time(s) for one reload");
  report.push("run 2: same version, " + log.length + " requests (" + log.filter((p) => p === "/sw.js").length + " of them sw.js)");

  // the server hands out the old sw.js (another server of the host, not yet up to date)
  fs.writeFileSync(swPath, oldSw);
  loads = 0;
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()).catch(() => null));
  await page.waitForTimeout(1000);
  check(await settled(page, 60000), "run 2: the old version is still installing");
  await page.waitForTimeout(2000);
  const actOld = await activeVersion(page);
  const cachesOld = await cacheNames(page);
  check(actOld === v2, "run 2: with the old sw.js online the active worker is " + actOld + ", expected " + v2 + " (older version installed)");
  check(cachesOld.indexOf(v2) !== -1 && cachesOld.indexOf(v1) === -1, "run 2: caches " + JSON.stringify(cachesOld) + ", expected only " + v2);
  check((await bannerCount(page)) === 0, "run 2: banner for the old version");
  check(loads === 0, "run 2: the page reloaded " + loads + " time(s) because of the old sw.js");
  // a reload while the old one is still online: nothing either
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(3000);
  await settled(page, 30000);
  check((await activeVersion(page)) === v2 && (await bannerCount(page)) === 0, "run 2: after a reload with the old sw.js online: active " + (await activeVersion(page)) + ", banner " + (await bannerCount(page)));

  // and the new sw.js back: the same version, no install, no banner
  fs.writeFileSync(swPath, newSw);
  loads = 0;
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(3000);
  check(await settled(page, 10000), "run 2: a worker installs after the new sw.js is back");
  check((await bannerCount(page)) === 0 && (await activeVersion(page)) === v2 && loads === 1,
    "run 2: new sw.js back: banner " + (await bannerCount(page)) + ", active " + (await activeVersion(page)) + ", loads " + loads);
  report.push("run 2: old sw.js online: active " + actOld + ", caches " + JSON.stringify(cachesOld) + ", no banner; new sw.js back: nothing new");
  errors.slice(0, 3).forEach((e) => fails.push("page error: " + e));

  await browser.close();
  await new Promise((resolve) => { httpServer.close(() => resolve()); sockets.forEach((s) => s.destroy()); });
  fs.rmSync(SITE, { recursive: true, force: true });
  report.forEach((l) => console.log(l));
  if (fails.length) { console.log("FAIL:\n" + fails.join("\n")); process.exit(1); }
  console.log("=== UPDATE ONCE: one update, one banner, one reload; the same version and an older sw.js change nothing, 0 failure(s) ===");
})().catch((e) => { console.log("FAIL: " + (e && e.stack || e)); process.exit(1); });
