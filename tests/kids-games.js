// tests/kids-games.js
// "Children's Games": the home page section and the games.html filter
// show exactly the games marked `kids: true` in games-catalog.js.
//
// Checks: the marked set is the agreed list of 15 games; the home section
// (index.html#section-kids) and the "Children's Games" chip on games.html
// (also preselected by games.html?category=kids) list exactly these; every
// Play / Rules / History link there answers 200; Mau Mau's "Play" there is
// maumau.html?deck=kids and opens with the animal cards chosen; the
// sentence on calm.html links to the filter; no page scrolls sideways at
// 600 px or 360 px.
//
// Needs the local server (BASE_URL) and Playwright, like board-sweep.js.
// Run: node tests/kids-games.js

const { chromium } = require("playwright");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const http = require("http");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/";
const ROOT = path.join(__dirname, "..");

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "games-catalog.js"), "utf8") + "\nthis.GAMES_CATALOG = GAMES_CATALOG;", ctx);
const marked = ctx.GAMES_CATALOG.filter((g) => g.kids === true).map((g) => g.slug).sort();
const AGREED = ["cake", "animalsudoku", "shapesort", "linkpairs", "pairs", "maumau", "oldmaid", "war", "snakesladders", "blockers", "ludo", "fourinarow", "tictactoe", "lightswitch", "tenpairs"].sort();
const fails = [];
const same = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(name + ": " + JSON.stringify(got) + ", expected " + JSON.stringify(want)); };
same("marked games", marked, AGREED);

function status(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(res.statusCode); }).on("error", () => resolve(0));
  });
}

async function cardsIn(page, sel) {
  return page.$$eval(sel + " .game-select-item", (items) => items.map((it) => ({
    slug: it.getAttribute("data-slug"),
    links: Array.from(it.querySelectorAll(".game-select-actions a")).map((a) => a.getAttribute("href"))
  })));
}

async function checkLinks(where, cards) {
  same(where + ": games", cards.map((c) => c.slug).sort(), AGREED);
  for (const c of cards) {
    const play = c.slug === "maumau" ? "maumau.html?deck=kids" : c.slug + ".html";
    same(where + ": " + c.slug + " links", c.links, [play, c.slug + "-rules.html", c.slug + "-history.html"]);
    for (const href of c.links) {
      const code = await status(BASE_URL + href);
      if (code !== 200) fails.push(where + ": " + href + " answers " + code);
    }
  }
}

async function noSideScroll(page, name) {
  for (const width of [600, 360]) {
    await page.setViewportSize({ width, height: 800 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 0) fails.push(name + " at " + width + " px scrolls sideways by " + over + " px");
  }
  await page.setViewportSize({ width: 632, height: 840 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 632, height: 840 } });
  await page.addInitScript(() => { try { localStorage.setItem("einkchess_lang", "de"); } catch (e) {} });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Home page section and its menu link.
  await page.goto(BASE_URL + "index.html", { waitUntil: "networkidle" });
  await checkLinks("home", await cardsIn(page, "#section-kids"));
  same("home menu link", await page.$$eval('.game-section-nav a[href="#section-kids"]', (a) => a.length), 1);
  same("home heading", await page.$eval("#section-kids h2", (h) => h.textContent), "Kinderspiele");
  same("home more link", await page.$eval("#section-kids .section-more-link a", (a) => a.getAttribute("href")), "games.html?category=kids");
  await noSideScroll(page, "index.html");

  // games.html: the chip by hand, then preselected from the URL.
  await page.goto(BASE_URL + "games.html", { waitUntil: "networkidle" });
  const all = (await cardsIn(page, "#games-grid")).length;
  same("all games listed", all, ctx.GAMES_CATALOG.length);
  await page.click('#games-category-chips .mode-btn[data-category="kids"]');
  await checkLinks("games.html chip", await cardsIn(page, "#games-grid"));
  await page.selectOption("#games-sort", "type");
  same("games.html chip, sort by type", (await cardsIn(page, "#games-grid")).map((c) => c.slug).sort(), AGREED);
  await page.selectOption("#games-sort", "newest");
  same("games.html chip, newest first", (await cardsIn(page, "#games-grid")).map((c) => c.slug).sort(), AGREED);
  await page.goto(BASE_URL + "games.html?category=kids", { waitUntil: "networkidle" });
  await checkLinks("games.html?category=kids", await cardsIn(page, "#games-grid"));
  same("chip preselected", await page.$eval("#games-category-chips .active-mode", (b) => b.getAttribute("data-category")), "kids");
  await noSideScroll(page, "games.html?category=kids");
  await page.click('#games-category-chips .mode-btn[data-category="all"]');
  same("back to all", (await cardsIn(page, "#games-grid")).length, all);

  // Mau Mau from the children's games: animal cards chosen.
  await page.goto(BASE_URL + "maumau.html?deck=kids", { waitUntil: "networkidle" });
  same("maumau deck", await page.$eval("#maumau-deck", (s) => s.value), "kids");
  await page.goto(BASE_URL + "maumau.html", { waitUntil: "networkidle" });
  same("maumau deck remembered", await page.$eval("#maumau-deck", (s) => s.value), "kids");

  // Calm play page.
  await page.goto(BASE_URL + "calm.html", { waitUntil: "networkidle" });
  same("calm link", await page.$$eval('a[href="games.html?category=kids"]', (a) => a.map((x) => x.textContent)), ["Kinderspiele"]);
  await noSideScroll(page, "calm.html");

  if (errors.length) fails.push("page errors: " + errors.join(" | "));
  await browser.close();
  if (fails.length) {
    console.log(fails.join("\n"));
    console.log("=== KIDS GAMES: " + fails.length + " failure(s) ===");
    process.exit(1);
  }
  console.log("=== KIDS GAMES: " + AGREED.length + " games in section and filter, all links 200, 0 failures ===");
})();
