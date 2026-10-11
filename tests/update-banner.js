// tests/update-banner.js
// The "new version" banner (update-banner.js) with its "what's new" lines,
// against a copy of the site served by a small server here; an update is
// a new CACHE_NAME written into the copy's sw.js.
//
//  1. Rules of whatsNew() alone (node): stored version -> games not seen
//     and the sentences in between, at most 3 plus "more"; no stored
//     version -> games of the last 14 days and the newest sentence.
//  2. German: a device that last saw v222 with 80 games (everything added
//     before the games of v223), then an update: the banner names exactly
//     the games since then (newest first) and the sentences of
//     release-notes.js since v222, nothing else.
//     No sideways scrolling at 360 and 600 px. SHOT=<file.png> saves a
//     screenshot at 360 px.
//  3. A second update without a new game or entry: the main line alone.
//  In every update, only sw.js comes from the network: the banner reads
//  release-notes.js, games-catalog.js and the language file from the cache.
//  4. English, again from v222 with 80 games: the same in English.
//
// Needs Playwright (Chromium); starts its own server. Run:
//   node tests/update-banner.js

const { chromium } = require("playwright");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const PORT = parseInt(process.env.BANNER_TEST_PORT || "8032", 10);
const BASE = "http://localhost:" + PORT + "/";
const EXEC = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// --- 1. the rules alone -------------------------------------------------
const UB = require(path.join(ROOT, "update-banner.js"));
(function unit() {
  const day = 24 * 3600 * 1000;
  const now = Date.parse("2026-10-20T12:00");
  const cat = [
    { slug: "a", added: "2026-07-01" },
    { slug: "b", added: "2026-10-01" },
    { slug: "c", added: "2026-10-10T09:00" },
    { slug: "d", added: "2026-10-12T10:00" }
  ];
  const notes = [5, 4, 3, 2, 1].map((n) => ({ version: "v10" + n, key: "k" + n, text: "t" + n }));
  let r = UB.whatsNew({ version: "v101", games: ["a", "b"] }, "papergames-cache-v105", notes, cat, now);
  check(r.games.map((g) => g.slug).join() === "d,c", "unit: games not seen should be d,c (newest first), got " + r.games.map((g) => g.slug));
  check(r.notes.map((e) => e.key).join() === "k5,k4,k3" && r.more, "unit: 4 sentences in between should show k5,k4,k3 and 'more'");
  r = UB.whatsNew({ version: "v104", games: ["a", "b", "c", "d"] }, "v105", notes, cat, now);
  check(!r.games.length && r.notes.length === 1 && r.notes[0].key === "k5" && !r.more, "unit: one sentence, no games");
  r = UB.whatsNew({ version: "v105", games: ["a", "b", "c", "d"] }, "v106", notes, cat, now);
  check(!r.games.length && !r.notes.length && !r.more, "unit: nothing new should give nothing");
  r = UB.whatsNew(null, "v105", notes, cat, now);
  check(r.games.map((g) => g.slug).join() === "d,c" && r.notes.length === 1 && r.notes[0].key === "k5", "unit: unknown version -> games of 14 days + newest sentence");
  r = UB.whatsNew({ version: "garbage" }, "v103", notes, cat, now - 30 * day);
  check(!r.games.length && r.notes.length === 1 && r.notes[0].key === "k3", "unit: unknown version uses the entry of the new version, not a newer one");
})();

// --- a copy of the site -------------------------------------------------
const SITE = fs.mkdtempSync(path.join(os.tmpdir(), "papergames-banner-"));
fs.cpSync(ROOT, SITE, {
  recursive: true,
  filter: (src) => !/^(\.git|tests|node_modules)([\\/]|$)/.test(path.relative(ROOT, src))
});
const swPath = path.join(SITE, "sw.js");
const versionNum = () => parseInt(/papergames-cache-v(\d+)/.exec(fs.readFileSync(swPath, "utf8"))[1], 10);
function bump() {
  const n = versionNum() + 1;
  fs.writeFileSync(swPath, fs.readFileSync(swPath, "utf8").replace(/papergames-cache-v\d+/, "papergames-cache-v" + n));
  return n;
}

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.G = GAMES_CATALOG;", ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "release-notes.js"), "utf8") + "\nthis.N = RELEASE_NOTES;", ctx);
const strings = require("./load-i18n").loadI18n().STRINGS;
// What v222 had: the 80 games added before the three of v223 (2026-10-11
// from 16:10 on). Every game after them is new for such a device.
const V222_UNTIL = "2026-10-11T16:00";
const older = ctx.G.filter((g) => g.added < V222_UNTIL).map((g) => g.slug);
const newest = ctx.G.filter((g) => g.added >= V222_UNTIL).sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0));
const tr = (lang, key) => strings[lang][key] || strings.en[key];

// --- the test server ----------------------------------------------------
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
const sockets = new Set();
const served = [];
const httpServer = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  served.push(urlPath);
  const file = path.join(SITE, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
    return;
  }
  const buf = fs.readFileSync(file);
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": buf.length, "Cache-Control": "no-cache" });
  res.end(buf);
});
httpServer.on("connection", (s) => { sockets.add(s); s.on("close", () => sockets.delete(s)); });

async function waitFor(page, fn, ms, arg) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;
    await page.waitForTimeout(250);
  }
  return false;
}
const bannerLines = (page) => page.$$eval("#update-banner .update-banner-lines > span", (els) => els.map((e) => e.textContent));
const noSideScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// Writes a new version into the copy, lets the page find it and waits
// for the banner.
// The banner reads the new version's files from its cache: none of them
// may come from the network (only sw.js itself changed).
async function update(page) {
  const n = bump();
  const from = served.length;
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  const shown = await waitFor(page, () => !!document.getElementById("update-banner"), 60000);
  check(shown, "v" + n + ": no banner after the update");
  await page.waitForTimeout(500);
  // (The browser fetches the tab icon itself, past the worker.)
  const net = served.slice(from).filter((p) => p !== "/sw.js" && p !== "/favicon.png");
  check(!net.length, "v" + n + ": requests to the server besides sw.js: " + net.join(", "));
  return n;
}

async function firstVisit(context, lang) {
  const page = await context.newPage();
  page.on("pageerror", (e) => fails.push(lang + ": page error " + e.message));
  await page.goto(BASE + "index.html");
  const ready = await waitFor(page, () => !!navigator.serviceWorker.controller, 120000);
  check(ready, lang + ": service worker never took control");
  // The visit is remembered a moment after the worker takes over.
  const remembered = await waitFor(page, () => !!localStorage.getItem("papergames_update_seen"), 15000);
  check(remembered, lang + ": first visit was not remembered");
  const seen = JSON.parse(await page.evaluate(() => localStorage.getItem("papergames_update_seen")) || "{}");
  check(seen.version === "v" + versionNum() && (seen.games || []).length === ctx.G.length,
    lang + ": remembered " + seen.version + " with " + (seen.games || []).length + " games, expected v" + versionNum() + " with " + ctx.G.length);
  // Stands for a device that last ran v222 with 80 games.
  await page.evaluate((s) => localStorage.setItem("papergames_update_seen", JSON.stringify(s)), { version: "v222", games: older });
  return page;
}

// The expected lines after an update from v222 to version n: every game
// since v222 (newest first, at most 6 named) and the sentences of the
// versions in between (newest first, at most 3, then "And more ...").
function expectNews(lines, lang, label, n) {
  const shown = newest.slice(0, 6).map((g) => tr(lang, g.nameKey));
  if (newest.length > 6) shown.push(tr(lang, "update_banner_more_games").split("{n}").join(String(newest.length - 6)));
  const notes = ctx.N.filter((e) => +e.version.slice(1) > 222 && +e.version.slice(1) <= n);
  const want = [
    tr(lang, "update_banner_text"),
    tr(lang, "update_banner_new_games").split("{s}").join(shown.join(tr(lang, "update_banner_list_sep")))
  ].concat(notes.slice(0, 3).map((e) => tr(lang, e.key)));
  if (notes.length > 3) want.push(tr(lang, "update_banner_more_notes"));
  check(JSON.stringify(lines) === JSON.stringify(want), label + ": banner lines\n    " + JSON.stringify(lines) + "\n  expected\n    " + JSON.stringify(want));
}

(async () => {
  check(older.length === 80, "v222 had 80 games, found " + older.length + " added before " + V222_UNTIL);
  await new Promise((r) => httpServer.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: EXEC });
  const report = [];

  // --- 2./3. German -----------------------------------------------------
  let context = await browser.newContext({ serviceWorkers: "allow", viewport: { width: 360, height: 740 } });
  await context.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) { /* ignore */ } });
  let page = await firstVisit(context, "de");
  let n = await update(page);
  let lines = await bannerLines(page);
  expectNews(lines, "de", "de, v222 -> v" + n, n);
  report.push("de, v222 (80 Spiele) -> v" + n + ":\n    " + lines.join("\n    "));
  check(await noSideScroll(page), "de: sideways scrolling at 360 px with the banner");
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await page.setViewportSize({ width: 600, height: 800 });
  check(await noSideScroll(page), "de: sideways scrolling at 600 px with the banner");
  const seen = JSON.parse(await page.evaluate(() => localStorage.getItem("papergames_update_seen")));
  check(seen.version === "v" + n && seen.games.length === ctx.G.length, "de: the update was not remembered as v" + n + " with " + ctx.G.length + " games");

  // A second open tab shows the same.
  const tab2 = await context.newPage();
  await tab2.goto(BASE + "games.html");
  await page.reload();
  n = versionNum();
  await page.close();

  // Second update, catalog unchanged, no entry: the main line alone.
  page = tab2;
  const n2 = await update(page);
  lines = await bannerLines(page);
  check(lines.length === 1 && lines[0] === tr("de", "update_banner_text"), "de, second update: expected the main line alone, got " + JSON.stringify(lines));
  check(!ctx.G.some((g) => lines.join(" ").indexOf(tr("de", g.nameKey)) !== -1), "de, second update: a game is named");
  report.push("de, v" + n + " -> v" + n2 + " (nichts Neues):\n    " + lines.join("\n    "));
  await context.close();

  // --- 4. English -------------------------------------------------------
  context = await browser.newContext({ serviceWorkers: "allow", viewport: { width: 360, height: 740 } });
  await context.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "en"); } catch (e) { /* ignore */ } });
  page = await firstVisit(context, "en");
  n = await update(page);
  lines = await bannerLines(page);
  expectNews(lines, "en", "en, v222 -> v" + n, n);
  report.push("en, v222 (80 games) -> v" + n + ":\n    " + lines.join("\n    "));
  await context.close();

  await browser.close();
  httpServer.close();
  sockets.forEach((s) => s.destroy());
  fs.rmSync(SITE, { recursive: true, force: true });

  report.forEach((r) => console.log(r));
  if (fails.length) {
    fails.forEach((f) => console.log("FAIL: " + f));
    console.log(fails.length + " UPDATE BANNER FAILURE(S)");
    process.exit(1);
  }
  console.log("UPDATE BANNER: ALL CHECKS PASS");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
