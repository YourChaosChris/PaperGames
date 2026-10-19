// tests/offline-update.js
// An update (or the first install) that breaks off because the network is
// gone - the power and internet cut of 18./19.10.2026 (report of a tester).
// Against a copy of the site served by a small test server that can drop
// every request from one moment on.
//
//  A. A fully stored version is on the device. A new version starts to load,
//     the network drops half way. Then, with the network still gone, the home
//     page is opened again: it comes from the device (the old version,
//     complete: never a mix of old and new files), says "Offline bereit", has
//     no dead (disabled) buttons, and a game opens from the device. When the
//     network is back, the update carries on from where it stopped.
//  B. First visit; the network drops half way through the install. With the
//     network gone the home page still opens (from the files stored so far),
//     says clearly what is missing and what to do, and has no dead buttons;
//     a game page that was stored opens. When the network is back the
//     install carries on and ends with "Offline bereit".
//
// Needs Playwright (Chromium); starts its own server. Run:
//   node tests/offline-update.js

const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const PORT = parseInt(process.env.OFFLINE_UPDATE_PORT || "8032", 10);
const BASE = "http://localhost:" + PORT + "/";
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };
const report = [];

const SITE = fs.mkdtempSync(path.join(os.tmpdir(), "papergames-update-"));
function freshSite() {
  fs.rmSync(SITE, { recursive: true, force: true });
  fs.mkdirSync(SITE, { recursive: true });
  fs.cpSync(ROOT, SITE, {
    recursive: true,
    filter: (src) => !/^(\.git|tests|node_modules)([\\/]|$)/.test(path.relative(ROOT, src))
  });
}
const tool = require(path.join(ROOT, "tools", "sw-hashes.js"));
const swSrc = () => fs.readFileSync(path.join(SITE, "sw.js"), "utf8");
const versionOf = (src) => /const CACHE_NAME = "([^"]+)"/.exec(src)[1];

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
// budget: requests still answered before the network drops; only: when set,
// only paths matching it are answered (a patchy connection)
const server = { log: [], up: true, budget: Infinity, only: null };
const sockets = new Set();
const httpServer = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (server.only && !server.only.test(urlPath)) { req.socket.destroy(); return; }
  if (!server.up || server.budget <= 0) { server.up = false; req.socket.destroy(); return; }
  server.budget--;
  server.log.push(urlPath);
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
function stopServer() {
  return new Promise((resolve) => { httpServer.close(() => resolve()); sockets.forEach((s) => s.destroy()); });
}

const RE_READY = /^Offline bereit\. /;
const RE_LOADING = /Wird gerade auf dein Gerät geladen/;
const RE_UPDATE_WAITING = /^Offline bereit\. Die neue Version wird geladen, sobald wieder Internet da ist\./;
const RE_WAITING = /^Noch nicht vollständig auf dem Gerät gespeichert, und gerade ist kein Internet da\. Schalte das Internet ein und lass die Seite kurz offen/;
const statusText = (page) => page.$eval("#offline-status-text", (el) => el.textContent).catch(() => "");
async function waitForText(page, re, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (re.test(await statusText(page))) return true;
    await page.waitForTimeout(250);
  }
  return false;
}
// caches.open(name) creates an empty cache when the name is gone, so listing
// the names and opening each one can bring back an old cache that the new
// worker deleted in between (99y, see offline-install.js). Where an old cache
// may be deleted while this runs, pass the names to open; the others are
// reported with -1 ("present, not opened").
async function cacheInfo(page, only) {
  return page.evaluate(async (names) => {
    const out = {};
    for (const k of await caches.keys()) out[k] = names && names.indexOf(k) === -1 ? -1 : (await (await caches.open(k)).keys()).length;
    return out;
  }, only || null);
}
async function activeVersion(page) {
  return page.evaluate(() => new Promise((resolve) => {
    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r || !r.active) { resolve(null); return; }
      const ch = new MessageChannel();
      navigator.serviceWorker.addEventListener("message", function f(e) {
        if (e.data && e.data.papergamesVersion) { navigator.serviceWorker.removeEventListener("message", f); resolve(e.data.papergamesVersion); }
      });
      r.active.postMessage("papergames-version");
      setTimeout(() => resolve("timeout"), 3000);
    });
  }));
}
// Home page buttons that are disabled (they would look struck through).
const deadButtons = (page) => page.evaluate(() => Array.from(document.querySelectorAll("button:disabled")).map((b) => b.id || b.textContent.trim()));

function bumpVersion() {
  const src = swSrc().replace(/const CACHE_NAME = "papergames-cache-v(\d+)"/, (m, n) => 'const CACHE_NAME = "papergames-cache-v' + (+n + 1) + '"');
  fs.writeFileSync(path.join(SITE, "sw.js"), src);
}

async function newContext(browser) {
  const context = await browser.newContext({ serviceWorkers: "allow" });
  await context.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) { /* ignore */ } });
  return context;
}

(async () => {
  freshSite();
  await new Promise((r) => httpServer.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: EXEC });
  const SHELL = tool.appShell(swSrc());
  const v1 = versionOf(swSrc());

  // ---- A. update broken off ------------------------------------------------
  {
    const context = await newContext(browser);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + "index.html");
    check(await waitForText(page, RE_READY, 120000), "A: first install did not end with 'Offline bereit'");
    const full1 = await cacheInfo(page);
    // new version: home page and one rules page changed
    fs.appendFileSync(path.join(SITE, "index.html"), "\n<!-- new version marker -->\n");
    // many changed files, so that 12 requests are not enough to finish
    SHELL.filter((f) => /-rules\.html$/.test(f)).forEach((f) => fs.appendFileSync(path.join(SITE, f), "\n<!-- new version marker -->\n"));
    bumpVersion();
    require("child_process").execFileSync("node", [path.join(ROOT, "tools", "sw-hashes.js"), SITE]);
    const v2 = versionOf(swSrc());
    server.log = [];
    server.budget = 12; // sw.js plus a few files, then the network is gone
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    // wait until the install has given up (the server stays down)
    const end = Date.now() + 60000;
    let c2 = {};
    while (Date.now() < end) {
      c2 = await cacheInfo(page);
      if (!server.up && c2[v2] !== undefined) break;
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(8000); // the retries (1 s apart, 3 tries) are over
    c2 = await cacheInfo(page);
    const act = await activeVersion(page);
    check(act === v1, "A: active worker after the broken update is " + act + ", expected " + v1);
    check(c2[v1] >= full1[v1], "A: old cache " + JSON.stringify(c2) + ", expected " + v1 + " with at least " + full1[v1] + " files");
    report.push("A: after the broken update: caches " + JSON.stringify(c2) + ", active worker " + act + ", server answered " + server.log.length + " requests, then dropped");
    await page.close();

    // network still gone (the device reports it too): open the home page again
    await context.setOffline(true);
    const off = await context.newPage();
    off.on("pageerror", (e) => errors.push(e.message));
    const resp = await off.goto(BASE + "index.html", { waitUntil: "load" }).catch((e) => null);
    check(resp && resp.status() === 200 && resp.fromServiceWorker(), "A: home page did not load from the device");
    if (resp) {
      const html = await resp.text();
      check(html.indexOf("new version marker") === -1, "A: home page is the NEW version while the new files are incomplete (mixed state)");
    }
    await off.waitForTimeout(1500);
    const text = await statusText(off);
    check(RE_UPDATE_WAITING.test(text), "A: status line offline is \"" + text + "\", expected the 'Offline bereit … neue Version wird geladen, sobald wieder Internet da ist' line");
    const dead = await deadButtons(off);
    check(dead.length === 0, "A: disabled buttons on the home page: " + JSON.stringify(dead));
    await off.click("#home-surprise-button");
    await off.waitForLoadState("load");
    await off.waitForTimeout(500);
    check(/\.html$/.test(new URL(off.url()).pathname) && !/index\.html$/.test(off.url()), "A: 'Überrasch mich' did not open a game: " + off.url());
    const h1 = await off.$eval("h1", (e) => e.textContent).catch(() => "");
    check(h1.length > 0, "A: the game page is empty");
    const cake = await off.goto(BASE + "cake-rules.html", { waitUntil: "load" });
    check(cake && cake.status() === 200 && cake.fromServiceWorker(), "A: cake-rules.html did not load offline");
    errors.slice(0, 3).forEach((e) => fails.push("A: page error: " + e));
    report.push("A: network gone, home page reopened: from the device, old version, status \"" + text + "\", disabled buttons " + dead.length + ", game " + off.url().split("/").pop() + " opened");

    // A patchy connection: the home page itself gets through, the rest does
    // not. The page may be refreshed from the network, but the stored copy
    // must stay one complete version (old HTML with old scripts).
    server.up = true;
    server.budget = Infinity;
    server.only = /^\/(index\.html)?$/;
    await context.setOffline(false);
    await off.goto(BASE + "index.html", { waitUntil: "load" });
    await off.waitForTimeout(1500);
    server.only = null;
    server.up = false;
    await context.setOffline(true);
    const again = await off.goto(BASE + "index.html", { waitUntil: "load" }).catch(() => null);
    const html2 = again ? await again.text() : "";
    check(html2.length > 0 && html2.indexOf("new version marker") === -1, "A: after a patchy connection the stored home page is a MIX: new HTML, old scripts");
    report.push("A: patchy connection (only the home page gets through), then offline: stored home page " + (html2.indexOf("new version marker") === -1 ? "still the old, complete version" : "is the NEW html over old scripts (mixed state)"));

    // network back: the update carries on
    server.up = true;
    server.budget = Infinity;
    server.log = [];
    await context.setOffline(false);
    await off.goto(BASE + "index.html");
    await off.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    // The update is stored completely (activating it can take a while: the
    // browser waits for the old worker to be idle, up to a few minutes).
    const end2 = Date.now() + 120000;
    let c3 = {};
    while (Date.now() < end2) {
      c3 = await cacheInfo(off, [v2]);
      if (c3[v2] >= SHELL.length) break;
      await off.waitForTimeout(500);
    }
    check(c3[v2] >= SHELL.length, "A: after the network is back: " + JSON.stringify(c3) + ", expected " + v2 + " with all " + SHELL.length + " files");
    report.push("A: network back: caches " + JSON.stringify(c3) + ", " + server.log.length + " requests to finish the update");
    await context.close();
  }

  // ---- B. first install broken off ----------------------------------------------
  {
    freshSite();
    server.up = true;
    server.log = [];
    server.budget = 150; // about a quarter of the files, then the network is gone
    const context = await newContext(browser);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + "index.html");
    const end = Date.now() + 90000;
    while (Date.now() < end && server.up) await page.waitForTimeout(250);
    await page.waitForTimeout(8000);
    const c = await cacheInfo(page);
    report.push("B: first visit, network dropped after " + server.log.length + " requests: caches " + JSON.stringify(c));
    await page.close();
    // The device reports no network. The home page comes from the browser's
    // own copy (the server allows 10 minutes), as on a phone that opened it
    // a moment before; no worker controls it yet.
    await context.setOffline(true);
    const off = await context.newPage();
    off.on("pageerror", (e) => errors.push(e.message));
    const resp = await off.goto(BASE + "index.html", { waitUntil: "load" }).catch((e) => null);
    check(resp && resp.status() === 200, "B: home page does not open with the network gone after an interrupted first install (" + (resp ? resp.status() : "no answer") + ")");
    if (resp && resp.status() === 200) {
      await off.waitForTimeout(1500);
      const text = await statusText(off);
      check(RE_WAITING.test(text) && !RE_LOADING.test(text), "B: status line offline is \"" + text + "\", expected the 'Noch nicht vollständig … Schalte das Internet ein' line");
      const dead = await deadButtons(off);
      check(dead.length === 0, "B: disabled buttons on the home page: " + JSON.stringify(dead));
      report.push("B: network gone: home page opened, status \"" + text + "\", disabled buttons " + dead.length);
    }
    // network back: install carries on
    server.up = true;
    server.budget = Infinity;
    await context.setOffline(false);
    const p2 = await context.newPage();
    await p2.goto(BASE + "index.html").catch(() => null);
    check(await waitForText(p2, RE_READY, 180000), "B: with the network back the install did not end with 'Offline bereit' (" + (await statusText(p2)) + ")");
    report.push("B: network back: \"" + (await statusText(p2)) + "\"");
    errors.slice(0, 3).forEach((e) => fails.push("B: page error: " + e));
    await context.close();
  }

  await browser.close();
  await stopServer();
  fs.rmSync(SITE, { recursive: true, force: true });
  report.forEach((l) => console.log(l));
  fails.forEach((f) => console.log("FAIL: " + f));
  console.log("\n=== OFFLINE UPDATE: " + fails.length + " failure(s) ===");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(1);
});
